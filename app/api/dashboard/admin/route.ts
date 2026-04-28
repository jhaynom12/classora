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

    if (!user || (user.role !== 'admin' && user.role !== 'superadmin' && user.role !== 'superadmin-assistant')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const schoolId = user.schoolId;

    // Get total counts
    const [totalStudents, totalTeachers, totalParents, totalClasses] = await Promise.all([
      prisma.user.count({ where: { schoolId, role: 'student' } }),
      prisma.user.count({ where: { schoolId, role: 'teacher' } }),
      prisma.user.count({ where: { schoolId, role: 'parent' } }),
      prisma.class.count({ where: { schoolId, status: 'active' } })
    ]);

    // Get at-risk students (students with grades below 60%)
    const atRiskStudents = await prisma.$queryRaw`
      SELECT
        u.name,
        AVG(m.score) as averageGrade,
        s.name as subjectName,
        c.name as className
      FROM users u
      JOIN enrollments e ON u.id = e.studentId
      JOIN classes c ON e.classId = c.id
      JOIN marks m ON e.id = m.enrollmentId
      JOIN subjects s ON m.subjectId = s.id
      WHERE u.schoolId = ${schoolId} AND u.role = 'student'
      GROUP BY u.id, u.name, s.id, s.name, c.name
      HAVING AVG(m.score) < 60
      ORDER BY AVG(m.score) ASC
      LIMIT 10
    `;

    // Get recent activity (latest 10 grade entries or notifications)
    const recentActivity = await prisma.$queryRaw`
      (SELECT
        'grade_entered' as action,
        CONCAT(t.name, ' entered grade for ', s.name) as description,
        m.createdAt as timestamp,
        u.name as userName
      FROM marks m
      JOIN enrollments e ON m.enrollmentId = e.id
      JOIN users t ON m.teacherId = t.id
      JOIN users s ON e.studentId = s.id
      WHERE t.schoolId = ${schoolId}
      ORDER BY m.createdAt DESC
      LIMIT 5)
      UNION ALL
      (SELECT
        'user_created' as action,
        CONCAT('New ', role, ' account created: ', name) as description,
        createdAt as timestamp,
        name as userName
      FROM users
      WHERE schoolId = ${schoolId}
      ORDER BY createdAt DESC
      LIMIT 5)
      ORDER BY timestamp DESC
      LIMIT 10
    `;

    // Get performance data (monthly grade averages)
    const performanceData = await prisma.$queryRaw`
      SELECT
        DATE_FORMAT(m.createdAt, '%Y-%m') as month,
        AVG(m.score) as averageGrade,
        COUNT(*) as totalGrades
      FROM marks m
      JOIN enrollments e ON m.enrollmentId = e.id
      JOIN users u ON e.studentId = u.id
      WHERE u.schoolId = ${schoolId}
      GROUP BY DATE_FORMAT(m.createdAt, '%Y-%m')
      ORDER BY month DESC
      LIMIT 12
    `;

    return NextResponse.json({
      totalStudents,
      totalTeachers,
      totalParents,
      totalClasses,
      atRiskStudents,
      recentActivity,
      performanceData
    });

  } catch (error: any) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch admin dashboard data', details: error.message },
      { status: 500 }
    );
  }
}