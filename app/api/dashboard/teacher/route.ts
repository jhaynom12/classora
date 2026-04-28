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

    if (!user || user.role !== 'teacher') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const schoolId = user.schoolId;

    // Get assigned classes
    const assignedClasses = await prisma.class.findMany({
      where: {
        schoolId,
        teacherId: userId,
        status: 'active'
      },
      select: {
        id: true,
        name: true,
        section: true,
        _count: {
          select: { enrollments: true }
        }
      }
    });

    const transformedClasses = assignedClasses.map(cls => ({
      id: cls.id,
      name: `${cls.name} ${cls.section}`,
      studentCount: cls._count.enrollments
    }));

    // Get my students with average grades
    const myStudents = await prisma.$queryRaw`
      SELECT
        u.id,
        u.name,
        u.studentId,
        c.name as className,
        c.section,
        AVG(m.score) as averageGrade
      FROM users u
      JOIN enrollments e ON u.id = e.studentId
      JOIN classes c ON e.classId = c.id
      LEFT JOIN marks m ON e.id = m.enrollmentId
      WHERE c.teacherId = ${userId} AND u.role = 'student'
      GROUP BY u.id, u.name, u.studentId, c.name, c.section
      ORDER BY u.name
    `;

    // Get pending grades count (subjects without complete grades)
    const pendingGrades = await prisma.$queryRaw<Array<{count: number}>>`
      SELECT COUNT(*) as count
      FROM enrollments e
      JOIN classes c ON e.classId = c.id
      JOIN classSubjects cs ON c.id = cs.classId
      LEFT JOIN marks m ON e.id = m.enrollmentId AND cs.subjectId = m.subjectId
      WHERE c.teacherId = ${userId} AND m.id IS NULL
    `;

    // Get recent submissions (latest grades entered by this teacher)
    const recentSubmissions = await prisma.$queryRaw`
      SELECT
        u.name as studentName,
        s.name as subjectName,
        m.score,
        m.createdAt as date
      FROM marks m
      JOIN enrollments e ON m.enrollmentId = e.id
      JOIN users u ON e.studentId = u.id
      JOIN subjects s ON m.subjectId = s.id
      WHERE m.teacherId = ${userId}
      ORDER BY m.createdAt DESC
      LIMIT 10
    `;

    return NextResponse.json({
      assignedClasses: transformedClasses,
      myStudents,
      pendingGrades: (pendingGrades as any)[0]?.count || 0,
      recentSubmissions
    });

  } catch (error: any) {
    console.error('Teacher dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch teacher dashboard data', details: error.message },
      { status: 500 }
    );
  }
}