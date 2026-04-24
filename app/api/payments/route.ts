import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getCurrentUser } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/payments - Get payments for the user's school or specific student
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const status = searchParams.get('status');

    const where: any = {};

    // If user is a parent, only show payments for their children
    if (user.role === 'parent') {
      const parentChildren = await prisma.parentChild.findMany({
        where: { parentId: user.id },
        select: { childId: true }
      });
      const childIds = parentChildren.map(pc => pc.childId);
      where.studentId = { in: childIds };
    } else if (user.role === 'student') {
      // Students can only see their own payments
      where.studentId = user.id;
    } else {
      // Admin/teacher can see all payments for their school
      const students = await prisma.user.findMany({
        where: { schoolId: user.schoolId, role: 'student' },
        select: { id: true }
      });
      where.studentId = { in: students.map(s => s.id) };
    }

    if (studentId) {
      where.studentId = studentId;
    }

    if (status) {
      where.status = status;
    }

    const payments = await prisma.payment.findMany({
      where,
      include: {
        student: {
          select: { name: true, studentId: true }
        },
        feeStructure: {
          select: {
            name: true,
            amount: true,
            term: true,
            academicYear: true,
            dueDate: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/payments - Create a new payment
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.schoolId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { studentId, feeStructureId, amount, method, transactionId } = body;

    // Validate required fields
    if (!studentId || !amount || !method) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify student belongs to the school
    const student = await prisma.user.findFirst({
      where: { id: studentId, schoolId: user.schoolId, role: 'student' }
    });
    if (!student) {
      return NextResponse.json({ error: 'Invalid student ID' }, { status: 400 });
    }

    // If feeStructureId is provided, verify it exists and belongs to the school
    if (feeStructureId) {
      const feeStructure = await prisma.feeStructure.findFirst({
        where: { id: feeStructureId, schoolId: user.schoolId }
      });
      if (!feeStructure) {
        return NextResponse.json({ error: 'Invalid fee structure ID' }, { status: 400 });
      }
    }

    // Generate unique reference
    const reference = `PAY-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const payment = await prisma.payment.create({
      data: {
        studentId,
        feeStructureId,
        amount: parseFloat(amount),
        reference,
        method,
        transactionId,
        status: 'pending', // Admin can approve later
      },
      include: {
        student: {
          select: { name: true, studentId: true }
        },
        feeStructure: {
          select: {
            name: true,
            amount: true,
            term: true,
            academicYear: true
          }
        }
      }
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/payments/[id] - Update payment status
export async function PUT(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user?.schoolId || user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paymentId = searchParams.get('id');

    if (!paymentId) {
      return NextResponse.json({ error: 'Payment ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { status, transactionId } = body;

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const updateData: any = { status };
    if (transactionId) {
      updateData.transactionId = transactionId;
    }

    if (status === 'paid') {
      updateData.paidAt = new Date();
    }

    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: updateData,
      include: {
        student: {
          select: { name: true, studentId: true }
        },
        feeStructure: {
          select: {
            name: true,
            amount: true,
            term: true,
            academicYear: true
          }
        }
      }
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}