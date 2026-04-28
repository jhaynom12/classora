import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId') || request.headers.get('x-user-school');
    const { name } = await request.json();

    console.log('Saving school name:', name, 'schoolId:', schoolId);

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID required' }, { status: 400 });
    }

    if (!name) {
      return NextResponse.json({ error: 'School name is required' }, { status: 400 });
    }

    const updatedSchool = await prisma.school.update({
      where: { id: schoolId },
      data: { name }
    });

    return NextResponse.json({ success: true, data: updatedSchool });
  } catch (error) {
    console.error('Error saving school:', error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to save school' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId') || request.headers.get('x-user-school');

    if (!schoolId) {
      return NextResponse.json({ name: 'My School' });
    }

    const school = await prisma.school.findUnique({
      where: { id: schoolId }
    });

    return NextResponse.json(school || { name: 'My School' });
  } catch (error) {
    console.error('Error fetching school:', error);
    return NextResponse.json({ name: 'My School' });
  }
}
