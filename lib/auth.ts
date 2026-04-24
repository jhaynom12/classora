import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'secret');

export async function getCurrentUser(request: NextRequest) {
  try {
    // Get token from cookies or header
    const token =
      request.cookies.get('classora_token')?.value ||
      request.headers.get('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return null;
    }

    // Verify JWT token
    const decoded = await jwtVerify(token, secret);
    const userId = decoded.payload.userId as string;

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { school: true }
    });

    return user;
  } catch (error) {
    return null;
  }
}

export async function requireAuth(request: NextRequest) {
  const user = await getCurrentUser(request);
  if (!user) {
    throw new Error('Unauthorized');
  }
  return user;
}