import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

export async function GET(req) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const accessLevel = searchParams.get('accessLevel');
    const fileType = searchParams.get('fileType');

    // Build where clause
    const where = {};
    if (accessLevel) {
      where.accessLevel = accessLevel;
    }
    if (fileType) {
      where.fileType = fileType;
    }

    // If user is not authenticated or is FREE, only show FREE resources
    if (!session || session.user.plan !== 'PRO') {
      where.accessLevel = 'FREE';
    }

    const resources = await prisma.resource.findMany({
      where,
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Get resources error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

