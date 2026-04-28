import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET /api/students - Get all students for a school
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId') || request.headers.get('x-user-school');
    const classId = searchParams.get('classId');

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID required' }, { status: 400 });
    }

    const where: any = {
      schoolId,
      role: 'student'
    };

    if (classId) {
      // Get students in a specific class
      const enrollments = await prisma.enrollment.findMany({
        where: { classId },
        include: { student: true }
      });
      const students = enrollments.map(e => e.student);
      return NextResponse.json(students);
    }

    const students = await prisma.user.findMany({
      where,
      include: {
        enrollments: {
          include: {
            class: true
          }
        },
        parentChildren: {
          include: {
            parent: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
  }
}

// POST /api/students - Create a new student
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId') || request.headers.get('x-user-school');

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID required' }, { status: 400 });
    }

    const body = await request.json();
    console.log('Received student creation body:', body);
    const { name, email, password, studentId, phone, classId, parentEmail } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create student
    const student = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'student',
        schoolId,
        studentId: studentId || `STU${Date.now()}`,
        phone,
        isActive: true
      }
    });

    // If classId provided, create enrollment
    if (classId) {
      await prisma.enrollment.create({
        data: {
          studentId: student.id,
          classId,
          academicYear: '2024/2025',
          rollNumber: studentId
        }
      });
    }

    // If parent email provided, try to link to existing parent or create relationship
    if (parentEmail) {
      const parent = await prisma.user.findFirst({
        where: {
          email: parentEmail,
          role: 'parent',
          schoolId
        }
      });

      if (parent) {
        await prisma.parentChild.create({
          data: {
            parentId: parent.id,
            childId: student.id,
            relationship: 'parent'
          }
        });
      }
    }

    return NextResponse.json({ success: true, data: student }, { status: 201 });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json({ error: 'Failed to create student' }, { status: 500 });
  }
}

// PUT /api/students - Update a student
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    const { name, email, phone, isActive, classId } = await request.json();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;

    const student = await prisma.user.update({
      where: { id: studentId },
      data: updateData,
      include: {
        enrollments: {
          include: {
            class: true
          }
        }
      }
    });

    // Update enrollment if classId provided
    if (classId) {
      // Remove existing enrollment
      await prisma.enrollment.deleteMany({
        where: { studentId }
      });

      // Create new enrollment
      await prisma.enrollment.create({
        data: {
          studentId,
          classId,
          academicYear: '2024/2025'
        }
      });
    }

    return NextResponse.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    return NextResponse.json({ error: 'Failed to update student' }, { status: 500 });
  }
}

// DELETE /api/students - Delete a student
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID required' }, { status: 400 });
    }

    // Delete related records first
    await prisma.enrollment.deleteMany({
      where: { studentId }
    });

    await prisma.mark.deleteMany({
      where: { studentId }
    });

    await prisma.result.deleteMany({
      where: { studentId }
    });

    await prisma.parentChild.deleteMany({
      where: { childId: studentId }
    });

    await prisma.assignmentSubmission.deleteMany({
      where: { studentId }
    });

    await prisma.payment.deleteMany({
      where: { studentId }
    });

    // Delete the student
    await prisma.user.delete({
      where: { id: studentId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    return NextResponse.json({ error: 'Failed to delete student' }, { status: 500 });
  }
}