import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const classId = formData.get('classId') as string;

    if (!file || !classId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get the class
    const classRecord = await prisma.class.findUnique({
      where: { id: classId },
    });

    if (!classRecord) {
      return NextResponse.json({ error: 'Class not found' }, { status: 404 });
    }

    const text = await file.text();
    const lines = text.split('\n').filter(line => line.trim());
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());

    let addedCount = 0;
    const errors: string[] = [];

    // Process rows (skip header)
    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].split(',').map(v => v.trim().replace(/^"/, '').replace(/"$/, ''));
        const row: any = {};

        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });

        // Find or create student user
        let user = await prisma.user.findUnique({
          where: { email: row.email?.toLowerCase() },
        });

        if (!user) {
          // Create new student user (without password - admin will set it)
          user = await prisma.user.create({
            data: {
              name: row.name,
              email: row.email.toLowerCase(),
              password: '', // Empty password - to be set by admin or student
              role: 'student',
              schoolId: classRecord.schoolId,
              studentId: row.studentid || row.id,
              phone: row.phone,
              isActive: true,
            },
          });
        }

        // Check if already enrolled
        const existingEnrollment = await prisma.enrollment.findUnique({
          where: {
            studentId_classId_academicYear: {
              studentId: user.id,
              classId: classId,
              academicYear: new Date().getFullYear().toString(),
            },
          },
        });

        if (!existingEnrollment) {
          await prisma.enrollment.create({
            data: {
              studentId: user.id,
              classId: classId,
              academicYear: new Date().getFullYear().toString(),
              rollNumber: row.studentid || row.id,
            },
          });
          addedCount++;
        }
      } catch (error: any) {
        errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      count: addedCount,
      errors,
    });
  } catch (error: any) {
    console.error('Error adding students:', error);
    return NextResponse.json(
      { error: 'Failed to add students', details: error.message },
      { status: 500 }
    );
  }
}
