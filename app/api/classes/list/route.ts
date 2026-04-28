import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

function verifyToken(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  try {
    return jwt.verify(token, JWT_SECRET) as any;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  try {
    // Verify authentication
    const tokenData = verifyToken(request);
    if (!tokenData) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId');

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID is required' }, { status: 400 });
    }

    // Fetch all classes for the school
    const classes = await prisma.class.findMany({
      where: {
        schoolId,
        status: 'active'
      },
      select: {
        id: true,
        name: true,
        section: true,
        level: true,
        teacher: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: [{ level: 'asc' }, { name: 'asc' }]
    });

    return NextResponse.json(classes);
  } catch (error: any) {
    console.error('Fetch classes error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch classes', details: error.message },
      { status: 500 }
    );
  }
}
