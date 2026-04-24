import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/assignments - Get assignments based on role
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');
    const studentId = searchParams.get('studentId');
    const classId = searchParams.get('classId');
    const status = searchParams.get('status');

    let where: any = {};

    if (teacherId) {
      where.teacherId = teacherId;
    }

    if (studentId) {
      // For students, get assignments from their enrolled classes
      const enrollments = await prisma.enrollment.findMany({
        where: { studentId },
        select: { classId: true }
      });
      const classIds = enrollments.map(e => e.classId);
      where.classId = { in: classIds };
    }

    if (classId) {
      where.classId = classId;
    }

    if (status) {
      where.status = status;
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        subject: true,
        class: true,
        teacher: {
          select: {
            id: true,
            name: true,
            profession: true
          }
        },
        submissions: studentId ? {
          where: { studentId }
        } : false,
        _count: {
          select: { submissions: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // For students, include submission status
    if (studentId) {
      const assignmentsWithStatus = assignments.map(assignment => {
        const submission = assignment.submissions[0];
        const isOverdue = new Date(assignment.dueDate) < new Date();
        
        let status = 'pending';
        if (submission?.submittedAt) {
          status = 'submitted';
        } else if (isOverdue) {
          status = 'overdue';
        }

        return {
          ...assignment,
          submission: submission || null,
          status,
          isOverdue
        };
      });

      return NextResponse.json(assignmentsWithStatus);
    }

    return NextResponse.json(assignments);
  } catch (error) {
    console.error('Error fetching assignments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch assignments' },
      { status: 500 }
    );
  }
}

// POST /api/assignments - Create new assignment
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      subjectId,
      classId,
      teacherId,
      totalMarks,
      dueDate,
      instructions,
      attachments,
      autoGrade,
      gradingRubric
    } = body;

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description,
        subjectId,
        classId,
        teacherId,
        totalMarks: totalMarks || 100,
        dueDate: new Date(dueDate),
        instructions,
        attachments: attachments ? JSON.stringify(attachments) : null,
        autoGrade: autoGrade || false,
        gradingRubric: gradingRubric ? JSON.stringify(gradingRubric) : null
      },
      include: {
        subject: true,
        class: true,
        teacher: {
          select: {
            id: true,
            name: true,
            profession: true
          }
        }
      }
    });

    // Create submission records for all enrolled students
    const enrollments = await prisma.enrollment.findMany({
      where: { classId },
      select: { studentId: true }
    });

    const submissions = enrollments.map(enrollment => ({
      assignmentId: assignment.id,
      studentId: enrollment.studentId
    }));

    await prisma.assignmentSubmission.createMany({
      data: submissions
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error creating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to create assignment' },
      { status: 500 }
    );
  }
}

// PUT /api/assignments - Update assignment
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (updateData.dueDate) {
      updateData.dueDate = new Date(updateData.dueDate);
    }

    if (updateData.attachments) {
      updateData.attachments = JSON.stringify(updateData.attachments);
    }

    if (updateData.gradingRubric) {
      updateData.gradingRubric = JSON.stringify(updateData.gradingRubric);
    }

    const assignment = await prisma.assignment.update({
      where: { id },
      data: updateData,
      include: {
        subject: true,
        class: true,
        teacher: {
          select: {
            id: true,
            name: true,
            profession: true
          }
        }
      }
    });

    return NextResponse.json(assignment);
  } catch (error) {
    console.error('Error updating assignment:', error);
    return NextResponse.json(
      { error: 'Failed to update assignment' },
      { status: 500 }
    );
  }
}