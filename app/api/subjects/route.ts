import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId') || request.headers.get('x-user-school');
    const classId = searchParams.get('classId');
    
    const where: any = { schoolId: schoolId || undefined };
    
    const subjects = await prisma.subject.findMany({
      where,
      include: {
        classSubjects: classId ? {
          where: { classId },
          include: { class: true, teacher: true }
        } : {
          include: { class: true, teacher: true }
        }
      },
      orderBy: { name: 'asc' }
    });
    
    return NextResponse.json(subjects);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch subjects' },
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
    console.log('Received subject creation body:', body);
    const { name, code, isElective } = body;

    if (!name || !code) {
      return NextResponse.json({ error: 'Subject name and code are required' }, { status: 400 });
    }
    
    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        schoolId,
        isElective: isElective || false
      }
    });
    
    return NextResponse.json({ success: true, data: subject }, { status: 201 });
  } catch (error) {
    console.error('Error creating subject:', error);
    return NextResponse.json(
      { error: (error as Error).message || 'Failed to create subject' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      return NextResponse.json({ error: 'Subject ID required' }, { status: 400 });
    }

    const { name, code, isElective } = await request.json();

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (code !== undefined) updateData.code = code;
    if (isElective !== undefined) updateData.isElective = isElective;

    const updatedSubject = await prisma.subject.update({
      where: { id: subjectId },
      data: updateData
    });

    return NextResponse.json(updatedSubject);
  } catch (error) {
    console.error('Error updating subject:', error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');

    if (!subjectId) {
      return NextResponse.json({ error: 'Subject ID required' }, { status: 400 });
    }

    // Delete related records first
    await prisma.classSubject.deleteMany({
      where: { subjectId }
    });

    await prisma.assignment.deleteMany({
      where: { subjectId }
    });

    // Delete the subject
    await prisma.subject.delete({
      where: { id: subjectId }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting subject:', error);
    return NextResponse.json({ error: 'Failed to delete subject' }, { status: 500 });
  }
}
