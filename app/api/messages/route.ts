import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { receiverId, content, subject } = await request.json();
    const senderId = request.headers.get('X-User-ID');

    if (!senderId || !receiverId || !content) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const message = await prisma.message.create({
      data: {
        senderId,
        receiverId,
        subject: subject || 'No subject',
        content,
        read: false
      },
      include: {
        sender: { select: { id: true, name: true, email: true } },
        receiver: { select: { id: true, name: true, email: true } }
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    console.error('Failed to create message:', error);
    return NextResponse.json(
      { error: 'Failed to create message' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const userId = request.headers.get('X-User-ID');
    const { searchParams } = new URL(request.url);
    const conversationWith = searchParams.get('conversationWith');

    let where: any = {
      OR: [{ senderId: userId }, { receiverId: userId }]
    };

    if (conversationWith) {
      where = {
        OR: [
          { senderId: userId, receiverId: conversationWith },
          { senderId: conversationWith, receiverId: userId }
        ]
      };
    }

    const messages = await prisma.message.findMany({
      where,
      include: {
        sender: { select: { id: true, name: true, email: true, avatar: true } },
        receiver: { select: { id: true, name: true, email: true, avatar: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { messageId } = await request.json();

    await prisma.message.update({
      where: { id: messageId },
      data: { read: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to update message:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}
