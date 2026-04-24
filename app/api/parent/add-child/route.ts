import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const { parentId, studentAdmissionNo, studentEmail } = await request.json();

    if (!parentId || (!studentAdmissionNo && !studentEmail)) {
      return NextResponse.json(
        { error: 'Parent ID and either student admission number or email required' },
        { status: 400 }
      );
    }

    // Find the student by admission number or email
    const student = await prisma.user.findFirst({
      where: {
        OR: [
          { studentId: studentAdmissionNo },
          { email: studentEmail }
        ],
        role: 'student'
      }
    });

    if (!student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      );
    }

    // Find the parent
    const parent = await prisma.user.findUnique({
      where: { id: parentId }
    });

    if (!parent) {
      return NextResponse.json(
        { error: 'Parent not found' },
        { status: 404 }
      );
    }

    // Check if child is already linked
    const existingLink = await prisma.parentChild.findUnique({
      where: {
        parentId_childId: {
          parentId: parentId,
          childId: student.id
        }
      }
    });

    if (existingLink) {
      return NextResponse.json(
        { error: 'Child already linked to this parent account' },
        { status: 400 }
      );
    }

    // Link the student to parent (create ParentChild relationship)
    await prisma.parentChild.create({
      data: {
        parentId: parentId,
        childId: student.id
      }
    });

    // Get the updated list of children for this parent
    const children = await prisma.parentChild.findMany({
      where: { parentId: parentId },
      include: {
        child: {
          include: {
            enrollments: {
              include: {
                class: {
                  include: {
                    subjects: true
                  }
                }
              }
            },
            marks: true,
            results: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Child successfully added to parent account',
      child: {
        id: student.id,
        name: student.name,
        studentId: student.studentId,
        email: student.email,
        classes: 0 // Will be populated when we can query enrollments
      },
      children: children.map(pc => ({
        id: pc.child.id,
        name: pc.child.name,
        studentId: pc.child.studentId,
        email: pc.child.email,
        classes: pc.child.enrollments?.length || 0
      }))
    });
  } catch (error) {
    console.error('Error adding child:', error);
    return NextResponse.json(
      { error: 'Failed to add child to parent account' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const parentId = searchParams.get('parentId');

    if (!parentId) {
      return NextResponse.json(
        { error: 'Parent ID required' },
        { status: 400 }
      );
    }

    // Get all children for this parent
    const children = await prisma.parentChild.findMany({
      where: { parentId: parentId },
      include: {
        child: {
          include: {
            enrollments: {
              include: {
                class: {
                  include: { subjects: true }
                }
              }
            },
            marks: true,
            results: true
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      children: children.map(pc => ({
        id: pc.child.id,
        name: pc.child.name,
        studentId: pc.child.studentId,
        email: pc.child.email,
        classes: pc.child.enrollments?.length || 0,
        marks: pc.child.marks || [],
        results: pc.child.results || []
      }))
    });
  } catch (error) {
    console.error('Error fetching children:', error);
    return NextResponse.json(
      { error: 'Failed to fetch children' },
      { status: 500 }
    );
  }
}
