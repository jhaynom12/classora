import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');
    
    const classes = await prisma.class.findMany({
      where: { schoolId: schoolId || undefined },
      include: {
        teacher: {
          select: { id: true, name: true }
        },
        enrollments: {
          include: {
            student: {
              select: { id: true, name: true }
            }
          }
        }
      }
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
    const body = await request.json();
    const { name, section, schoolId, teacherId, level } = body;
    
    const newClass = await prisma.class.create({
      data: {
        name,
        section,
        schoolId,
        teacherId,
        level
      }
    });
    
    return NextResponse.json(newClass);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create class' },
      { status: 500 }
    );
  }
}
