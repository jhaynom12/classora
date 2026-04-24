import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'students', 'teachers', 'parents'
    const schoolId = formData.get('schoolId') as string;

    if (!file || !type || !schoolId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim() && !line.trim().startsWith('Instructions'));
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    const results = {
      created: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Get the school
    const school = await prisma.school.findUnique({ where: { id: schoolId } });
    if (!school) {
      return NextResponse.json({ error: 'School not found' }, { status: 404 });
    }

    // Process rows
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"/, '').replace(/"$/, ''));
        const row: any = {};

        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        if (type === 'students') {
          const hashedPassword = await bcrypt.hash(row.password, 10);
          const user = await prisma.user.create({
            data: {
              name: row.full_name,
              email: row.email.toLowerCase(),
              password: hashedPassword,
              role: 'student',
              schoolId,
              studentId: row.student_id,
              isActive: true,
            },
          });

          // Link to class if it exists
          if (row.class_name) {
            const classRecord = await prisma.class.findFirst({
              where: { name: row.class_name, schoolId },
            });
            if (classRecord) {
              await prisma.enrollment.create({
                data: {
                  studentId: user.id,
                  classId: classRecord.id,
                  academicYear: new Date().getFullYear().toString(),
                  rollNumber: row.student_id,
                },
              });
            }
          }

          results.created++;
        } else if (type === 'teachers') {
          const hashedPassword = await bcrypt.hash(row.password, 10);
          await prisma.user.create({
            data: {
              name: row.full_name,
              email: row.email.toLowerCase(),
              password: hashedPassword,
              role: 'teacher',
              schoolId,
              staffId: row.staff_id,
              isActive: true,
            },
          });
          results.created++;
        } else if (type === 'parents') {
          const hashedPassword = await bcrypt.hash(row.password, 10);
          await prisma.user.create({
            data: {
              name: row.full_name,
              email: row.email.toLowerCase(),
              password: hashedPassword,
              role: 'parent',
              schoolId,
              isActive: true,
            },
          });
          results.created++;
        }
      } catch (error: any) {
        results.failed++;
        results.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Bulk import completed. Created: ${results.created}, Failed: ${results.failed}`,
      results,
    });
  } catch (error: any) {
    console.error('Bulk import error:', error);
    return NextResponse.json(
      { error: 'Bulk import failed', details: error.message },
      { status: 500 }
    );
  }
}
