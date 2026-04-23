import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    console.log('🌱 Starting database seeding...');

    // Create default school
    let school = await prisma.school.findUnique({
      where: { slug: 'default-school' }
    });

    if (!school) {
      school = await prisma.school.create({
        data: {
          name: 'Classora Demo School',
          slug: 'default-school',
          address: '123 Education Street, Knowledge City',
          phone: '+234 123 456 7890',
          email: 'info@classora.com',
          primaryColor: '#6366f1'
        }
      });
    }

    console.log(`✅ School ready: ${school.name}`);

    // Create admin user
    let admin = await prisma.user.findUnique({
      where: { email: 'admin@classora.com' }
    });

    if (!admin) {
      const adminPassword = await bcrypt.hash('admin123', 10);
      admin = await prisma.user.create({
        data: {
          name: 'School Admin',
          email: 'admin@classora.com',
          password: adminPassword,
          role: 'admin',
          schoolId: school.id,
          staffId: 'ADM001',
          isActive: true
        }
      });
    }

    console.log(`✅ Admin ready: ${admin.email}`);

    // Create teacher
    let teacher = await prisma.user.findUnique({
      where: { email: 'teacher@classora.com' }
    });

    if (!teacher) {
      const teacherPassword = await bcrypt.hash('teacher123', 10);
      teacher = await prisma.user.create({
        data: {
          name: 'Mrs. Adebayo',
          email: 'teacher@classora.com',
          password: teacherPassword,
          role: 'teacher',
          schoolId: school.id,
          staffId: 'TCH001',
          isActive: true
        }
      });
    }

    console.log(`✅ Teacher ready: ${teacher.email}`);

    // Create parent
    let parent = await prisma.user.findUnique({
      where: { email: 'parent@classora.com' }
    });

    if (!parent) {
      const parentPassword = await bcrypt.hash('parent123', 10);
      parent = await prisma.user.create({
        data: {
          name: 'Mr. Okafor',
          email: 'parent@classora.com',
          password: parentPassword,
          role: 'parent',
          schoolId: school.id,
          isActive: true
        }
      });
    }

    console.log(`✅ Parent ready: ${parent.email}`);

    // Create student
    let student = await prisma.user.findUnique({
      where: { email: 'student@classora.com' }
    });

    if (!student) {
      const studentPassword = await bcrypt.hash('student123', 10);
      student = await prisma.user.create({
        data: {
          name: 'Adeola Johnson',
          email: 'student@classora.com',
          password: studentPassword,
          role: 'student',
          schoolId: school.id,
          studentId: 'STU001',
          isActive: true
        }
      });
    }

    console.log(`✅ Student ready: ${student.email}`);

    // Create sample subjects
    let mathSubject = await prisma.subject.findFirst({
      where: {
        code: 'MATH',
        schoolId: school.id
      }
    });

    if (!mathSubject) {
      mathSubject = await prisma.subject.create({
        data: {
          name: 'Mathematics',
          code: 'MATH',
          schoolId: school.id
        }
      });
    }

    let scienceSubject = await prisma.subject.findFirst({
      where: {
        code: 'SCI',
        schoolId: school.id
      }
    });

    if (!scienceSubject) {
      scienceSubject = await prisma.subject.create({
        data: {
          name: 'Science',
          code: 'SCI',
          schoolId: school.id
        }
      });
    }

    let englishSubject = await prisma.subject.findFirst({
      where: {
        code: 'ENG',
        schoolId: school.id
      }
    });

    if (!englishSubject) {
      englishSubject = await prisma.subject.create({
        data: {
          name: 'English',
          code: 'ENG',
          schoolId: school.id
        }
      });
    }

    console.log('✅ Subjects ready');

    // Create a sample class
    let classRecord = await prisma.class.findFirst({
      where: {
        name: 'SS2 Science',
        schoolId: school.id
      }
    });

    if (!classRecord) {
      classRecord = await prisma.class.create({
        data: {
          name: 'SS2 Science',
          section: 'A',
          schoolId: school.id,
          teacherId: teacher.id,
          level: 2,
          status: 'active'
        }
      });
    }

    console.log(`✅ Class ready: ${classRecord.name}`);

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
      { success: false, error: 'Seeding failed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}