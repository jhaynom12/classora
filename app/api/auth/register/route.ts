import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, email, password, role, schoolId, studentId } = await request.json();
    
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }
    
    // Use provided schoolId or get the first school or create a default one
    let school;
    if (schoolId) {
      school = await prisma.school.findUnique({
        where: { id: schoolId }
      });
      if (!school) {
        return NextResponse.json(
          { error: 'School not found' },
          { status: 400 }
        );
      }
    } else {
      school = await prisma.school.findFirst();
      if (!school) {
        school = await prisma.school.create({
          data: {
            name: 'Classora School',
            slug: 'classora-school'
          }
        });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        schoolId: school.id,
        studentId: role === 'student' ? studentId : null
      }
    });

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed' },
      { status: 500 }
    );
  }
}
