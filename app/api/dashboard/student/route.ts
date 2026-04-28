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

    if (!user || user.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get my grades
    const myGrades = await prisma.$queryRaw`
      SELECT
        s.name as subject,
        m.score as grade,
        m.term,
        t.name as teacher,
        m.createdAt as date
      FROM marks m
      JOIN enrollments e ON m.enrollmentId = e.id
      JOIN subjects s ON m.subjectId = s.id
      JOIN users t ON m.teacherId = t.id
      WHERE e.studentId = ${userId}
      ORDER BY m.createdAt DESC
    `;

    // Get my classes
    const myClasses = await prisma.enrollment.findMany({
      where: { studentId: userId },
      include: {
        class: {
          include: {
            teacher: {
              select: { name: true }
            }
          }
        }
      }
    });

    const transformedClasses = myClasses.map(enrollment => ({
      id: enrollment.class.id,
      name: `${enrollment.class.name} ${enrollment.class.section}`,
      teacher: enrollment.class.teacher?.name || 'Not Assigned',
      schedule: 'TBD' // Could be added to schema later
    }));

    // Get my teachers
    const myTeachers = await prisma.$queryRaw<Array<{id: string; name: string; email: string; subjects: string}>>`
      SELECT DISTINCT
        t.id,
        t.name,
        t.email,
        GROUP_CONCAT(s.name) as subjects
      FROM users t
      JOIN classes c ON t.id = c.teacherId
      JOIN enrollments e ON c.id = e.classId
      JOIN classSubjects cs ON c.id = cs.classId
      JOIN subjects s ON cs.subjectId = s.id
      WHERE e.studentId = ${userId}
      GROUP BY t.id, t.name, t.email
    `;

    const transformedTeachers = (myTeachers as any[]).map(teacher => ({
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
      subjects: teacher.subjects ? teacher.subjects.split(',') : []
    }));

    // Get attendance data (if attendance table exists, otherwise return mock data)
    let attendance = { present: 0, absent: 0, total: 0 };

    try {
      // Check if attendance table exists and has data
      const attendanceData = await prisma.$queryRaw`
        SELECT
          SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as present,
          SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as absent,
          COUNT(*) as total
        FROM attendance
        WHERE studentId = ${userId}
      `;

      if (attendanceData && Array.isArray(attendanceData) && attendanceData.length > 0) {
        attendance = {
          present: Number((attendanceData as any)[0].present) || 0,
          absent: Number((attendanceData as any)[0].absent) || 0,
          total: Number((attendanceData as any)[0].total) || 0
        };
      }
    } catch (error) {
      // Attendance table might not exist or be empty, use default values
      console.log('Attendance data not available, using defaults');
    }

    return NextResponse.json({
      myGrades,
      myClasses: transformedClasses,
      myTeachers: transformedTeachers,
      attendance
    });

  } catch (error: any) {
    console.error('Student dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch student dashboard data', details: error.message },
      { status: 500 }
    );
  }
}