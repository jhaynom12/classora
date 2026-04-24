import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET /api/assignments/[id]/submissions - Get submissions for an assignment
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const assignmentId = params.id;
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');

    const where: any = { assignmentId };

    if (studentId) {
      where.studentId = studentId;
    }

    const submissions = await prisma.assignmentSubmission.findMany({
      where,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentId: true
          }
        },
        assignment: {
          select: {
            title: true,
            dueDate: true,
            totalMarks: true
          }
        }
      },
      orderBy: { submittedAt: 'desc' }
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

// POST /api/assignments/[id]/submissions - Submit assignment
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const assignmentId = params.id;
    const body = await request.json();
    const { studentId, content, attachments } = body;

    const now = new Date();
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      select: { dueDate: true, autoGrade: true, gradingRubric: true }
    });

    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found' },
        { status: 404 }
      );
    }

    const isLate = now > assignment.dueDate;
    let autoScore = null;
    let autoGrade = null;
    let autoGraded = false;

    // Simple auto-grading logic (can be enhanced)
    if (assignment.autoGrade && content) {
      const wordCount = content.trim().split(/\s+/).length;
      const minWords = 100; // Minimum word count
      const maxWords = 500; // Maximum word count

      if (wordCount >= minWords && wordCount <= maxWords) {
        autoScore = Math.min(100, (wordCount / maxWords) * 100);
        autoGrade = autoScore >= 80 ? 'A' : autoScore >= 70 ? 'B+' : autoScore >= 60 ? 'B' : 'C';
        autoGraded = true;
      }
    }

    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId
        }
      },
      update: {
        content,
        attachments: attachments ? JSON.stringify(attachments) : null,
        submittedAt: now,
        score: autoScore,
        grade: autoGrade,
        autoGraded,
        status: isLate ? 'late' : 'submitted'
      },
      create: {
        assignmentId,
        studentId,
        content,
        attachments: attachments ? JSON.stringify(attachments) : null,
        submittedAt: now,
        score: autoScore,
        grade: autoGrade,
        autoGraded,
        status: isLate ? 'late' : 'submitted'
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentId: true
          }
        },
        assignment: {
          select: {
            title: true,
            dueDate: true,
            totalMarks: true
          }
        }
      }
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error submitting assignment:', error);
    return NextResponse.json(
      { error: 'Failed to submit assignment' },
      { status: 500 }
    );
  }
}

// PUT /api/assignments/[id]/submissions - Grade submission (teacher only)
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const assignmentId = params.id;
    const body = await request.json();
    const { studentId, score, grade, feedback, gradedBy } = body;

    const submission = await prisma.assignmentSubmission.update({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId
        }
      },
      data: {
        score: parseFloat(score),
        grade,
        feedback,
        gradedBy,
        gradedAt: new Date(),
        autoGraded: false
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentId: true
          }
        },
        assignment: {
          select: {
            title: true,
            dueDate: true,
            totalMarks: true
          }
        }
      }
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error grading submission:', error);
    return NextResponse.json(
      { error: 'Failed to grade submission' },
      { status: 500 }
    );
  }
}