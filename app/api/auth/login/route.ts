import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { email, password, role } = await request.json();
    const loginKey = typeof email === 'string' ? email.toLowerCase() : '';

    const user = await prisma.user.findFirst({
      where: {
        role,
        OR: [
          { email: loginKey },
          { name: loginKey },
          { staffId: loginKey },
          { studentId: loginKey }
        ]
      },
      include: { school: true }
    });

    if (!user) {
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

    const response = NextResponse.json({
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

    response.cookies.set('classora_token', token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}
