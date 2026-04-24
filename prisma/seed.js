const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');
  
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
  
  // Create Brentwood Hill School
  const brentwoodSchool = await prisma.school.upsert({
    where: { slug: 'brentwood-hill-school' },
    update: {},
    create: {
      name: 'Brentwood Hill School',
      slug: 'brentwood-hill-school',
      address: 'Brentwood Hill, London',
      phone: '+44 20 1234 5678',
      email: 'info@brentwoodhill.com',
      primaryColor: '#1f2937'
    }
  });
  
  console.log(`✅ School created: ${brentwoodSchool.name}`);
  
  // Create admin user for Brentwood Hill
  const brentwoodAdminPassword = await bcrypt.hash('henry1234qwer', 10);
  const brentwoodAdmin = await prisma.user.upsert({
    where: { email: 'admin@brentwoodhill.com' },
    update: {},
    create: {
      name: 'Brentwood Admin',
      email: 'admin@brentwoodhill.com',
      password: brentwoodAdminPassword,
      role: 'admin',
      schoolId: brentwoodSchool.id,
      staffId: 'ADM002',
      isActive: true
    }
  });
  
  console.log(`✅ Admin created: ${brentwoodAdmin.email}`);
  
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
  
  // Create student
  const studentPassword = await bcrypt.hash('student123', 10);
  const student = await prisma.user.upsert({
    where: { email: 'student@classora.com' },
    update: {},
    create: {
      name: 'Adeola K.',
      email: 'student@classora.com',
      password: studentPassword,
      role: 'student',
      schoolId: school.id,
      studentId: 'STU001',
      isActive: true
    }
  });
  
  console.log(`✅ Student created: ${student.email}`);
  
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
      isActive: true
    }
  });
  
  console.log(`✅ Parent created: ${parent.email}`);
  
  // Create class
  const ss2Science = await prisma.class.create({
    data: {
      name: 'SS2',
      section: 'Science',
      schoolId: school.id,
      teacherId: teacher.id,
      level: 2,
      status: 'active'
    }
  });
  
  console.log(`✅ Class created: ${ss2Science.name} ${ss2Science.section}`);
  
  // Create subjects
  let math = await prisma.subject.findFirst({
    where: { code: 'MATH', schoolId: school.id }
  });
  if (!math) {
    math = await prisma.subject.create({
      data: {
        name: 'Mathematics',
        code: 'MATH',
        schoolId: school.id,
        isElective: false
      }
    });
  }
  
  let english = await prisma.subject.findFirst({
    where: { code: 'ENG', schoolId: school.id }
  });
  if (!english) {
    english = await prisma.subject.create({
      data: {
        name: 'English',
        code: 'ENG',
        schoolId: school.id,
        isElective: false
      }
    });
  }

  let physics = await prisma.subject.findFirst({
    where: { code: 'PHY', schoolId: school.id }
  });
  if (!physics) {
    physics = await prisma.subject.create({
      data: {
        name: 'Physics',
        code: 'PHY',
        schoolId: school.id,
        isElective: false
      }
    });
  }

  console.log('✅ Subjects created');

  // Assign subjects to class
  const existingMathCS = await prisma.classSubject.findFirst({
    where: {
      classId: ss2Science.id,
      subjectId: math.id,
      teacherId: teacher.id
    }
  });
  if (!existingMathCS) {
    await prisma.classSubject.create({
      data: {
        classId: ss2Science.id,
        subjectId: math.id,
        teacherId: teacher.id
      }
    });
  }

  const existingEngCS = await prisma.classSubject.findFirst({
    where: {
      classId: ss2Science.id,
      subjectId: english.id,
      teacherId: teacher.id
    }
  });
  if (!existingEngCS) {
    await prisma.classSubject.create({
      data: {
        classId: ss2Science.id,
        subjectId: english.id,
        teacherId: teacher.id
      }
    });
  }

  // Create enrollment
  const existingEnrollment = await prisma.enrollment.findFirst({
    where: {
      studentId: student.id,
      classId: ss2Science.id,
      academicYear: '2024/2025'
    }
  });
  if (!existingEnrollment) {
    await prisma.enrollment.create({
      data: {
        studentId: student.id,
        classId: ss2Science.id,
        academicYear: '2024/2025',
        rollNumber: '001'
      }
    });
  }

  // Add sample marks
  const classSubjects = await prisma.classSubject.findMany({
    where: { classId: ss2Science.id }
  });

  for (const cs of classSubjects) {
    const existingMark = await prisma.mark.findFirst({
      where: {
        studentId: student.id,
        classSubjectId: cs.id,
        assessmentType: 'test1'
      }
    });
    if (!existingMark) {
      await prisma.mark.create({
        data: {
          studentId: student.id,
          classSubjectId: cs.id,
          assessmentType: 'test1',
          score: 85,
          maxScore: 100,
          grade: 'A',
          uploadedBy: teacher.id
        }
      });
    }
  }

  // Create result
  const existingResult = await prisma.result.findFirst({
    where: {
      studentId: student.id,
      classId: ss2Science.id,
      term: 'First Term',
      academicYear: '2024/2025'
    }
  });
  if (!existingResult) {
    await prisma.result.create({
      data: {
        studentId: student.id,
        classId: ss2Science.id,
        term: 'First Term',
        academicYear: '2024/2025',
        total: 78,
        average: 78,
        grade: 'B+',
        position: 8,
        outOf: 45,
        status: 'published',
        publishedAt: new Date()
      }
    });
  }

  console.log('✅ Marks and results created');
  console.log('✅ Database seeded successfully!');
  console.log('');
  console.log('Demo Logins:');
  console.log('  Admin: admin@classora.com / admin123');
  console.log('  Teacher: teacher@classora.com / teacher123');
  console.log('  Student: student@classora.com / student123');
  console.log('  Parent: parent@classora.com / parent123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
