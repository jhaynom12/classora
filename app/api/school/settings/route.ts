import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const dynamic = 'force-dynamic';

// GET /api/school/settings?schoolId=...
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId') || request.headers.get('x-user-school');

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID required' }, { status: 400 });
    }

    const settings = await prisma.schoolSettings.findUnique({
      where: { schoolId }
    });

    if (!settings) {
      // Return default settings if none exist
      return NextResponse.json({
        schoolId,
        gradingScale: 'A:70-100,B:50-69,C:0-49',
        assessmentWeights: 'test1:15,test2:15,exam:70',
        academicYear: '2024/2025',
        currentTerm: 'First Term'
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error('Error fetching school settings:', error);
    return NextResponse.json({ error: 'Failed to fetch school settings' }, { status: 500 });
  }
}

// PUT /api/school/settings?schoolId=...
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const schoolId = searchParams.get('schoolId') || request.headers.get('x-user-school');

    if (!schoolId) {
      return NextResponse.json({ error: 'School ID required' }, { status: 400 });
    }

    const body = await request.json();
    console.log('Saving school settings:', schoolId, body);
    const { gradingScale, assessmentWeights, academicYear, currentTerm } = body;

    const updatedSettings = await prisma.schoolSettings.upsert({
      where: { schoolId },
      update: {
        ...(gradingScale && { gradingScale }),
        ...(assessmentWeights && { assessmentWeights }),
        ...(academicYear && { academicYear }),
        ...(currentTerm && { currentTerm })
      },
      create: {
        schoolId,
        gradingScale: gradingScale || 'A:70-100,B:50-69,C:0-49',
        assessmentWeights: assessmentWeights || 'test1:15,test2:15,exam:70',
        academicYear: academicYear || '2024/2025',
        currentTerm: currentTerm || 'First Term'
      }
    });

    return NextResponse.json(updatedSettings);
  } catch (error) {
    console.error('Error updating school settings:', error);
    return NextResponse.json({ error: 'Failed to update school settings' }, { status: 500 });
  }
}