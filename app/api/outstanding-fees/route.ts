import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/outstanding-fees - Get outstanding fees for the user's school
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    let studentIds: string[] = [];

    if (user.role === 'parent') {
      // Get all children of the parent
      const parentChildren = await prisma.parentChild.findMany({
        where: { parentId: user.id },
        select: { childId: true }
      });
      studentIds = parentChildren.map(pc => pc.childId);
    } else if (user.role === 'student') {
      studentIds = [user.id];
    } else if (studentId) {
      studentIds = [studentId];
    } else {
      return NextResponse.json({ error: 'Student ID required for admin/teacher' }, { status: 400 });
    }

    // Get all fee structures applicable to the students
    const feeStructures = await prisma.feeStructure.findMany({
      where: {
        schoolId: user.schoolId,
        OR: [
          { studentId: { in: studentIds } },
          {
            classId: {
              in: await prisma.enrollment.findMany({
                where: { studentId: { in: studentIds } },
                select: { classId: true }
              }).then(enrollments => enrollments.map(e => e.classId))
            }
          },
          { classId: null, studentId: null } // School-wide fees
        ]
      },
      include: {
        class: {
          select: { name: true, section: true }
        },
        student: {
          select: { name: true, studentId: true }
        }
      }
    });

    // Get existing payments for these students
    const payments = await prisma.payment.findMany({
      where: {
        studentId: { in: studentIds },
        feeStructureId: { in: feeStructures.map(fs => fs.id) }
      },
      select: {
        feeStructureId: true,
        amount: true,
        status: true
      }
    });

    // Calculate outstanding fees
    const outstandingFees = feeStructures.map(feeStructure => {
      const studentPayments = payments.filter(p => p.feeStructureId === feeStructure.id);
      const totalPaid = studentPayments
        .filter(p => p.status === 'paid')
        .reduce((sum, p) => sum + p.amount, 0);

      const outstanding = feeStructure.amount - totalPaid;

      return {
        id: feeStructure.id,
        name: feeStructure.name,
        description: feeStructure.description,
        amount: feeStructure.amount,
        outstanding: Math.max(0, outstanding),
        term: feeStructure.term,
        academicYear: feeStructure.academicYear,
        dueDate: feeStructure.dueDate,
        isMandatory: feeStructure.isMandatory,
        isRecurring: feeStructure.isRecurring,
        class: feeStructure.class,
        student: feeStructure.student,
        payments: studentPayments
      };
    }).filter(fee => fee.outstanding > 0);

    return NextResponse.json(outstandingFees);
  } catch (error) {
    console.error('Error fetching outstanding fees:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}