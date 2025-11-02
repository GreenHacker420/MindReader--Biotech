import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../lib/auth';
import prisma from '../../../lib/prisma';

export async function GET(req) {
  try {
    const session = await auth();
    const { searchParams } = new URL(req.url);
    const accessLevel = searchParams.get('accessLevel');

    // Build where clause
    const where = {};
    if (accessLevel) {
      where.accessLevel = accessLevel;
    }

    // If user is not authenticated or is FREE, only show FREE datasets
    if (!session || session.user.plan !== 'PRO') {
      where.accessLevel = 'FREE';
    }

    const datasets = await prisma.dataset.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ datasets });
  } catch (error) {
    console.error('Get datasets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

