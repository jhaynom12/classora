import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function verifyToken(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    // Verify authentication
    const tokenData = verifyToken(request);
    if (!tokenData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = tokenData.id;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, schoolId: true }
    });

    if (!user || user.role !== 'parent') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const schoolId = user.schoolId;

    // Get children linked to this parent
    const children = await prisma.parentChild.findMany({
      where: { parentId: userId },
      include: {
        child: {
          select: {
            id: true,
            name: true,
            studentId: true,
            _count: {
              select: { enrollments: true }
            }
          }
        }
      }
    });

    const childrenData = await Promise.all(
      children.map(async (childLink) => {
        const enrollments = await prisma.enrollment.findMany({
          where: { studentId: childLink.child.id },
          include: {
            class: {
              select: { name: true, section: true }
            }
          }
        });

        // Get average grade for this child
        const averageGrade = await prisma.$queryRaw<Array<{average: number | null}>>`
          SELECT AVG(m.score) as average
          FROM marks m
          JOIN enrollments e ON m.enrollmentId = e.id
          WHERE e.studentId = ${childLink.child.id}
        `;

        return {
          id: childLink.child.id,
          name: childLink.child.name,
          studentId: childLink.child.studentId,
          class: enrollments.length > 0 ? `${enrollments[0].class.name} ${enrollments[0].class.section}` : 'Not Assigned',
          averageGrade: averageGrade[0]?.average ? Math.round(averageGrade[0].average) : 0
        };
      })
    );

    // Get children's grades
    const childrenGrades = await prisma.$queryRaw`
      SELECT
        u.name as childName,
        s.name as subject,
        m.score as grade,
        m.term,
        m.createdAt as date
      FROM marks m
      JOIN enrollments e ON m.enrollmentId = e.id
      JOIN users u ON e.studentId = u.id
      JOIN subjects s ON m.subjectId = s.id
      JOIN parentChild pc ON u.id = pc.studentId
      WHERE pc.parentId = ${userId}
      ORDER BY m.createdAt DESC
      LIMIT 20
    `;

    // Get school announcements
    const announcements = await prisma.announcement.findMany({
      include: {
        author: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const transformedAnnouncements = announcements.map(ann => ({
      id: ann.id,
      title: ann.title,
      message: ann.content,
      date: ann.createdAt.toISOString().split('T')[0],
      author: ann.author.name
    }));

    // Get messages sent to this parent
    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { receiverId: userId },
          { senderId: userId }
        ]
      },
      include: {
        sender: { select: { name: true } },
        receiver: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const transformedMessages = messages.map(msg => ({
      id: msg.id,
      from: msg.sender.name,
      to: msg.receiver.name,
      content: msg.content,
      date: msg.createdAt.toISOString().split('T')[0],
      isFromMe: msg.senderId === userId
    }));

    return NextResponse.json({
      children: childrenData,
      childrenGrades,
      announcements: transformedAnnouncements,
      messages: transformedMessages
    });

  } catch (error: any) {
    console.error('Parent dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch parent dashboard data', details: error.message },
      { status: 500 }
    );
  }
}