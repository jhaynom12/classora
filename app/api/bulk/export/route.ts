import { NextResponse, NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const type = searchParams.get('type'); // 'students', 'teachers', 'parents'
    const schoolId = searchParams.get('schoolId');

    if (!type || !schoolId) {
      return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
    }

    let csvContent = '';
    let filename = '';

    if (type === 'students') {
      const enrollments = await prisma.enrollment.findMany({
        where: { student: { schoolId } },
        include: { student: true, class: true },
      });

      csvContent = 'full_name,email,student_id,class_name,date_enrolled\n';
      enrollments.forEach(enroll => {
        csvContent += `"${enroll.student.name}","${enroll.student.email}","${enroll.student.studentId}","${enroll.class.name}","${new Date(enroll.id).toISOString()}"\n`;
      });
      filename = 'classora_students_export.csv';
    } else if (type === 'teachers') {
      const users = await prisma.user.findMany({
        where: { role: 'teacher', schoolId },
      });

      csvContent = 'full_name,email,staff_id,date_created\n';
      users.forEach(user => {
        csvContent += `"${user.name}","${user.email}","${user.staffId}","${new Date(user.createdAt).toISOString()}"\n`;
      });
      filename = 'classora_teachers_export.csv';
    } else if (type === 'parents') {
      const users = await prisma.user.findMany({
        where: { role: 'parent', schoolId },
      });

      csvContent = 'full_name,email,date_created\n';
      users.forEach(user => {
        csvContent += `"${user.name}","${user.email}","${new Date(user.createdAt).toISOString()}"\n`;
      });
      filename = 'classora_parents_export.csv';
    } else {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 });
    }

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error('Export error:', error);
    return NextResponse.json({ error: 'Export failed' }, { status: 500 });
  }
}
