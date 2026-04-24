import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request: Request) {
  try {
    const { name, slug, address, phone, email, primaryColor } = await request.json();

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'School name is required' }, { status: 400 });
    }

    const normalizedSlug = slug && typeof slug === 'string' && slug.trim()
      ? slug.trim().toLowerCase().replace(/\s+/g, '-')
      : name.trim().toLowerCase().replace(/\s+/g, '-');

    const school = await prisma.school.create({
      data: {
        name: name.trim(),
        slug: normalizedSlug,
        address: address?.trim() || null,
        phone: phone?.trim() || null,
        email: email?.trim() || null,
        primaryColor: primaryColor?.trim() || '#6366f1'
      }
    });

    return NextResponse.json(school);
  } catch (error) {
    console.error('Error creating school:', error);
    return NextResponse.json({ error: 'Failed to create school' }, { status: 500 });
  }
}
