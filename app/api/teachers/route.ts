import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET /api/teachers - Get all teachers for a school
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId') || request.headers.get('x-user-school');

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID required' }, { status: 400 });
    }

    const teachers = await prisma.user.findMany({
      where: {
        schoolId,
        role: 'teacher'
      },
      include: {
        classSubjects: {
          include: {
            subject: true,
            class: true
          }
        }
      },
      orderBy: { name: 'asc' }
    });

    return NextResponse.json(teachers);
  } catch (error) {
    console.error('Error fetching teachers:', error);
    return NextResponse.json({ error: 'Failed to fetch teachers' }, { status: 500 });
  }
}

// POST /api/teachers - Create a new teacher
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId') || request.headers.get('x-user-school');

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID required' }, { status: 400 });
    }

    const body = await request.json();
    console.log('Received teacher creation body:', body);
    const { name, email, password, staffId, phone } = body;

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

    const teacher = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'teacher',
        schoolId,
        staffId: staffId || `TCH${Date.now()}`,
        phone,
        isActive: true
      }
    });

    return NextResponse.json({ success: true, data: teacher }, { status: 201 });
  } catch (error) {
    console.error('Error creating teacher:', error);
    return NextResponse.json({ error: 'Failed to create teacher' }, { status: 500 });
  }
}

// PUT /api/teachers - Update a teacher
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID required' }, { status: 400 });
    }

    const { name, email, phone, isActive } = await request.json();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;

    const teacher = await prisma.user.update({
      where: { id: teacherId },
      data: updateData,
      include: {
        classSubjects: {
          include: {
            subject: true,
            class: true
          }
        }
      }
    });

    return NextResponse.json(teacher);
  } catch (error) {
    console.error('Error updating teacher:', error);
    return NextResponse.json({ error: 'Failed to update teacher' }, { status: 500 });
  }
}

// DELETE /api/teachers - Delete a teacher
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    if (!teacherId) {
      return NextResponse.json({ error: 'Teacher ID required' }, { status: 400 });
    }

    // Delete related records first
    await prisma.classSubject.deleteMany({
      where: { teacherId }
    });

    await prisma.class.updateMany({
      where: { teacherId },
      data: { teacherId: null }
    });

    await prisma.assignment.deleteMany({
      where: { teacherId }
    });

    await prisma.mark.deleteMany({
      where: { uploadedBy: teacherId }
    });

    await prisma.result.updateMany({
      where: { teacherComment: { not: null } },
      data: { teacherComment: null }
    });

    // Delete the teacher
    await prisma.user.delete({
      where: { id: teacherId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting teacher:', error);
    return NextResponse.json({ error: 'Failed to delete teacher' }, { status: 500 });
  }
}