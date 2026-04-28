import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId') || request.headers.get('x-user-school');
    
    const classes = await prisma.class.findMany({
      where: { schoolId: schoolId || undefined },
      include: {
        teacher: {
          select: { id: true, name: true }
        },
        _count: {
          select: { enrollments: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(classes);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch classes' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId') || request.headers.get('x-user-school');
    
    if (!schoolId) {
      return NextResponse.json({ error: 'School ID required' }, { status: 400 });
    }

    const body = await request.json();
    console.log('Received class creation body:', body);
    const { name, section, teacherId, level, status } = body;
    
    if (!name || !section) {
      return NextResponse.json({ error: 'Class name and section are required' }, { status: 400 });
    }

    const newClass = await prisma.class.create({
      data: {
        name,
        section,
        schoolId,
        teacherId,
        level: level || 1,
        status: status || 'active'
      }
    });
    
    return NextResponse.json({ success: true, data: newClass }, { status: 201 });
  } catch (error) {
    console.error('Error creating class:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create class' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ error: 'Class ID required' }, { status: 400 });
    }

    const { name, section, level, teacherId, status } = await request.json();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (section !== undefined) updateData.section = section;
    if (level !== undefined) updateData.level = level;
    if (teacherId !== undefined) updateData.teacherId = teacherId;
    if (status !== undefined) updateData.status = status;

    const updatedClass = await prisma.class.update({
      where: { id: classId },
      data: updateData,
      include: {
        teacher: {
          select: { id: true, name: true }
        },
        _count: {
          select: { enrollments: true }
        }
      }
    });

    return NextResponse.json(updatedClass);
  } catch (error) {
    console.error('Error updating class:', error);
    return NextResponse.json({ error: 'Failed to update class' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const classId = searchParams.get('classId');

    if (!classId) {
      return NextResponse.json({ error: 'Class ID required' }, { status: 400 });
    }

    // Delete related records first
    await prisma.enrollment.deleteMany({
      where: { classId }
    });

    await prisma.classSubject.deleteMany({
      where: { classId }
    });

    await prisma.result.deleteMany({
      where: { classId }
    });

    await prisma.assignment.deleteMany({
      where: { classId }
    });

    // Delete the class
    await prisma.class.delete({
      where: { id: classId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting class:', error);
    return NextResponse.json({ error: 'Failed to delete class' }, { status: 500 });
  }
}
