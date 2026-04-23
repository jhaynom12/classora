import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();
    
    const user = await prisma.user.findUnique({
      where: { email },
      include: { school: true }
    });
    
    if (!user || user.role !== role) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }
    
    const token = jwt.sign(
      { userId: user.id, role: user.role, schoolId: user.schoolId },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    );
    
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() }
    });
    
    return NextResponse.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      },
      school: {
        id: user.school.id,
        name: user.school.name,
        logo: user.school.logo,
        primaryColor: user.school.primaryColor
      }
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
