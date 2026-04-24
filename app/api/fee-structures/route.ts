import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/fee-structures - Get fee structures for the user's school
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');
    const studentId = searchParams.get('studentId');

    const where: any = {
      schoolId: user.schoolId,
    };

    if (classId) {
      where.classId = classId;
    }

    if (studentId) {
      where.studentId = studentId;
    }

    const feeStructures = await prisma.feeStructure.findMany({
      where,
      include: {
        class: {
          select: { name: true, section: true }
        },
        student: {
          select: { name: true, studentId: true }
        },
        payments: {
          select: {
            id: true,
            amount: true,
            status: true,
            paidAt: true,
            student: { select: { name: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(feeStructures);
  } catch (error) {
    console.error('Error fetching fee structures:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/fee-structures - Create fee structure(s)
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.schoolId || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { 
      name, description, amount, term, academicYear, dueDate, 
      classIds, studentIds, parentIds,
      isMandatory, isRecurring 
    } = body;

    // Validate required fields
    if (!name || !amount || !dueDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const createdFeeStructures = [];
    const errors = [];

    // If classIds provided, create for each class
    if (classIds && classIds.length > 0) {
      for (const classId of classIds) {
        try {
          // Verify class belongs to school
          const classExists = await prisma.class.findFirst({
            where: { id: classId, schoolId: user.schoolId }
          });
          if (!classExists) {
            errors.push(`Invalid class ID: ${classId}`);
            continue;
          }

          const feeStructure = await prisma.feeStructure.create({
            data: {
              schoolId: user.schoolId,
              name,
              description,
              amount: parseFloat(amount),
              term: term || 'First Term',
              academicYear: academicYear || '2024/2025',
              dueDate: new Date(dueDate),
              classId,
              isMandatory: isMandatory !== undefined ? isMandatory : true,
              isRecurring: isRecurring !== undefined ? isRecurring : true,
            },
            include: {
              class: { select: { name: true, section: true } },
              student: { select: { name: true, studentId: true } }
            }
          });
          createdFeeStructures.push(feeStructure);
        } catch (error) {
          errors.push(`Error creating fee for class ${classId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // If studentIds provided, create for each student
    if (studentIds && studentIds.length > 0) {
      for (const studentId of studentIds) {
        try {
          // Find student by ID or name
          const student = await prisma.user.findFirst({
            where: { 
              OR: [
                { id: studentId },
                { name: studentId },
                { studentId: studentId }
              ],
              schoolId: user.schoolId,
              role: 'student'
            }
          });
          if (!student) {
            errors.push(`Student not found: ${studentId}`);
            continue;
          }

          const feeStructure = await prisma.feeStructure.create({
            data: {
              schoolId: user.schoolId,
              name,
              description,
              amount: parseFloat(amount),
              term: term || 'First Term',
              academicYear: academicYear || '2024/2025',
              dueDate: new Date(dueDate),
              studentId: student.id,
              isMandatory: isMandatory !== undefined ? isMandatory : true,
              isRecurring: isRecurring !== undefined ? isRecurring : true,
            },
            include: {
              class: { select: { name: true, section: true } },
              student: { select: { name: true, studentId: true } }
            }
          });
          createdFeeStructures.push(feeStructure);
        } catch (error) {
          errors.push(`Error creating fee for student ${studentId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // If parentIds provided, find their children and create fees
    if (parentIds && parentIds.length > 0) {
      for (const parentId of parentIds) {
        try {
          // Find parent
          const parent = await prisma.user.findFirst({
            where: {
              OR: [
                { id: parentId },
                { name: parentId },
                { email: parentId }
              ],
              schoolId: user.schoolId,
              role: 'parent'
            }
          });
          
          if (!parent) {
            errors.push(`Parent not found: ${parentId}`);
            continue;
          }

          // Find children
          const parentChildren = await prisma.parentChild.findMany({
            where: { parentId: parent.id, isActive: true },
            include: { child: true }
          });

          for (const pc of parentChildren) {
            if (pc.child.role === 'student') {
              const feeStructure = await prisma.feeStructure.create({
                data: {
                  schoolId: user.schoolId,
                  name,
                  description,
                  amount: parseFloat(amount),
                  term: term || 'First Term',
                  academicYear: academicYear || '2024/2025',
                  dueDate: new Date(dueDate),
                  studentId: pc.child.id,
                  isMandatory: isMandatory !== undefined ? isMandatory : true,
                  isRecurring: isRecurring !== undefined ? isRecurring : true,
                },
                include: {
                  class: { select: { name: true, section: true } },
                  student: { select: { name: true, studentId: true } }
                }
              });
              createdFeeStructures.push(feeStructure);
            }
          }
        } catch (error) {
          errors.push(`Error creating fees for parent ${parentId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    // If no specific assignments, create school-wide fee
    if ((!classIds || classIds.length === 0) && (!studentIds || studentIds.length === 0) && (!parentIds || parentIds.length === 0)) {
      try {
        const feeStructure = await prisma.feeStructure.create({
          data: {
            schoolId: user.schoolId,
            name,
            description,
            amount: parseFloat(amount),
            term: term || 'First Term',
            academicYear: academicYear || '2024/2025',
            dueDate: new Date(dueDate),
            isMandatory: isMandatory !== undefined ? isMandatory : true,
            isRecurring: isRecurring !== undefined ? isRecurring : true,
          },
          include: {
            class: { select: { name: true, section: true } },
            student: { select: { name: true, studentId: true } }
          }
        });
        createdFeeStructures.push(feeStructure);
      } catch (error) {
        errors.push(`Error creating school-wide fee: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return NextResponse.json({ 
      created: createdFeeStructures.length, 
      feeStructures: createdFeeStructures,
      errors: errors.length > 0 ? errors : undefined
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating fee structure:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}