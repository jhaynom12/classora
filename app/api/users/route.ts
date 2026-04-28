import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId') || request.headers.get('x-user-school');
    const role = searchParams.get('role');
    
    const where: any = {};
    if (schoolId) where.schoolId = schoolId;
    if (role) where.role = role;
    
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        studentId: true,
        staffId: true,
        isActive: true,
        lastLogin: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password, role, schoolId, studentId, staffId } = body;
    
    // Validate required fields
    if (!name || !email || !password || !schoolId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, password, schoolId' },
        { status: 400 }
      );
    }

    // Check if school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    });
    
    if (!school) {
      return NextResponse.json(
        { error: 'School not found' },
        { status: 404 }
      );
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
        role: role || 'student',
        schoolId,
        studentId: role === 'student' ? studentId : null,
        staffId: role === 'teacher' || role === 'admin' ? staffId : null
      }
    });
    
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      schoolId: user.schoolId
    });
  } catch (error: any) {
    console.error('User creation error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error.message || 'Failed to create user' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, profession } = body;
    
    if (!id) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const user = await prisma.user.update({
      where: { id },
      data: { profession },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profession: true,
        isActive: true
      }
    });
    
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
