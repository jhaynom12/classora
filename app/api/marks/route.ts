import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { studentId, classSubjectId, assessmentType, score, grade, remarks } = await request.json();
    const teacherId = request.headers.get('X-User-ID');

    if (!studentId || !classSubjectId || !score) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const mark = await prisma.mark.upsert({
      where: {
        id: `${studentId}-${classSubjectId}-${assessmentType || 'test'}`
      },
      update: {
        score,
        grade: grade || calculateGrade(score),
        remarks,
        uploadedBy: teacherId || 'system'
      },
      create: {
        studentId,
        classSubjectId,
        assessmentType: assessmentType || 'test',
        score,
        grade: grade || calculateGrade(score),
        remarks,
        uploadedBy: teacherId || 'system'
      }
    });

    return NextResponse.json(mark);
  } catch (error) {
    console.error('Failed to create/update mark:', error);
    return NextResponse.json(
      { error: 'Failed to process mark' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const classSubjectId = searchParams.get('classSubjectId');

    let where: any = {};
    if (studentId) where.studentId = studentId;
    if (classSubjectId) where.classSubjectId = classSubjectId;

    const marks = await prisma.mark.findMany({
      where,
      include: {
        student: { select: { id: true, name: true } },
        classSubject: {
          include: {
            subject: { select: { name: true } },
            teacher: { select: { name: true } }
          }
        }
      },
      orderBy: { uploadedAt: 'desc' }
    });

    return NextResponse.json(marks);
  } catch (error) {
    console.error('Failed to fetch marks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch marks' },
      { status: 500 }
    );
  }
}

function calculateGrade(score: number): string {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B+';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C+';
  if (score >= 50) return 'C';
  return 'D';
}
