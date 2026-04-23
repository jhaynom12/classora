import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');
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
      }
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
    const body = await request.json();
    const { name, code, schoolId, isElective } = body;
    
    const subject = await prisma.subject.create({
      data: {
        name,
        code,
        schoolId,
        isElective: isElective || false
      }
    });
    
    return NextResponse.json(subject);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create subject' },
      { status: 500 }
    );
  }
}
