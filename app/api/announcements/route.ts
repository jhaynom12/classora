import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { title, content, targetRoles, priority } = await request.json();
    const authorId = request.headers.get('X-User-ID');

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Missing title or content' },
        { status: 400 }
      );
    }

    const announcement = await prisma.announcement.create({
      data: {
        title,
        content,
        authorId: authorId || '',
        targetRoles: targetRoles || 'all',
        priority: priority || 'normal'
      },
      include: {
        author: { select: { id: true, name: true, role: true } }
      }
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error('Failed to create announcement:', error);
    return NextResponse.json(
      { error: 'Failed to create announcement' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const targetRoles = searchParams.get('targetRoles');
    const userRole = request.headers.get('X-User-Role');

    let where: any = {
      OR: [
        { targetRoles: 'all' },
        { targetRoles: userRole || '' }
      ],
      expiresAt: {
        or: [
          { equals: null },
          { gt: new Date() }
        ]
      }
    };

    const announcements = await prisma.announcement.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, role: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error('Failed to fetch announcements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch announcements' },
      { status: 500 }
    );
  }
}
