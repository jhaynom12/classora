import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting database seeding...');

    // Create default school
    const school = await prisma.school.upsert({
      where: { slug: 'default-school' },
      update: {},
      create: {
        name: 'Classora Demo School',
        slug: 'default-school',
        address: '123 Education Street, Knowledge City',
        phone: '+234 123 456 7890',
        email: 'info@classora.com',
        primaryColor: '#6366f1'
      }
    });

    console.log(`✅ School created: ${school.name}`);

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@classora.com' },
      update: {},
      create: {
        name: 'School Admin',
        email: 'admin@classora.com',
        password: adminPassword,
        role: 'admin',
        schoolId: school.id,
        staffId: 'ADM001',
        isActive: true
      }
    });

    console.log(`✅ Admin created: ${admin.email}`);

    // Create teacher
    const teacherPassword = await bcrypt.hash('teacher123', 10);
    const teacher = await prisma.user.upsert({
      where: { email: 'teacher@classora.com' },
      update: {},
      create: {
        name: 'Mrs. Adebayo',
        email: 'teacher@classora.com',
        password: teacherPassword,
        role: 'teacher',
        schoolId: school.id,
        staffId: 'TCH001',
        isActive: true
      }
    });

    console.log(`✅ Teacher created: ${teacher.email}`);

    // Create parent
    const parentPassword = await bcrypt.hash('parent123', 10);
    const parent = await prisma.user.upsert({
      where: { email: 'parent@classora.com' },
      update: {},
      create: {
        name: 'Mr. Okafor',
        email: 'parent@classora.com',
        password: parentPassword,
        role: 'parent',
        schoolId: school.id,
        parentId: 'PAR001',
        isActive: true
      }
    });

    console.log(`✅ Parent created: ${parent.email}`);

    // Create student
    const studentPassword = await bcrypt.hash('student123', 10);
    const student = await prisma.user.upsert({
      where: { email: 'student@classora.com' },
      update: {},
      create: {
        name: 'Adeola Johnson',
        email: 'student@classora.com',
        password: studentPassword,
        role: 'student',
        schoolId: school.id,
        admissionNo: 'STU001',
        isActive: true
      }
    });

    console.log(`✅ Student created: ${student.email}`);

    // Create sample classes and subjects
    const mathSubject = await prisma.subject.upsert({
      where: { code: 'MATH' },
      update: {},
      create: {
        name: 'Mathematics',
        code: 'MATH',
        schoolId: school.id
      }
    });

    const scienceSubject = await prisma.subject.upsert({
      where: { code: 'SCI' },
      update: {},
      create: {
        name: 'Science',
        code: 'SCI',
        schoolId: school.id
      }
    });

    const englishSubject = await prisma.subject.upsert({
      where: { code: 'ENG' },
      update: {},
      create: {
        name: 'English',
        code: 'ENG',
        schoolId: school.id
      }
    });

    console.log('✅ Subjects created');

    // Create a sample class
    const classRecord = await prisma.class.upsert({
      where: { code: 'SS2-SCI' },
      update: {},
      create: {
        name: 'SS2 Science',
        code: 'SS2-SCI',
        schoolId: school.id,
        teacherId: teacher.id,
        academicYear: '2024/2025',
        term: 'First Term'
      }
    });

    console.log(`✅ Class created: ${classRecord.name}`);

    return NextResponse.json({
      success: true,
      message: 'Database seeded successfully!',
      users: {
        admin: 'admin@classora.com / admin123',
        teacher: 'teacher@classora.com / teacher123',
        parent: 'parent@classora.com / parent123',
        student: 'student@classora.com / student123'
      }
    });

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    return NextResponse.json(
      { success: false, error: 'Seeding failed', details: error.message },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}