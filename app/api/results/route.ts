import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    const classId = searchParams.get('classId');

    let where: any = {};
    if (studentId) where.studentId = studentId;
    if (classId) where.classId = classId;

    const results = await prisma.result.findMany({
      where: {
        ...where,
        status: 'published'
      },
      include: {
        student: { select: { id: true, name: true } },
        class: { select: { id: true, name: true, section: true } }
      },
      orderBy: { publishedAt: 'desc' }
    });

    return NextResponse.json(results);
  } catch (error) {
    console.error('Failed to fetch results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { studentId, classId, term, academicYear, total, average, grade, position, outOf } = await request.json();

    const result = await prisma.result.create({
      data: {
        studentId,
        classId,
        term,
        academicYear,
        total: total || 0,
        average: average || 0,
        grade: grade || 'N/A',
        position,
        outOf,
        status: 'draft'
      }
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Failed to create result:', error);
    return NextResponse.json(
      { error: 'Failed to create result' },
      { status: 500 }
    );
  }
}
