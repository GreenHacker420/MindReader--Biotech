import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

export async function POST(req) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, accessLevel, columns, rows } = body;

    if (!title || !accessLevel) {
      return NextResponse.json(
        { error: 'Missing required fields: title, accessLevel' },
        { status: 400 }
      );
    }

    const dataset = await prisma.dataset.create({
      data: {
        title,
        description: description || null,
        accessLevel,
        columns: columns || [],
        rows: rows || [],
        uploadedBy: session.user.id,
      },
    });

    return NextResponse.json({ dataset });
  } catch (error) {
    console.error('Create dataset error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET(req) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const datasets = await prisma.dataset.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ datasets });
  } catch (error) {
    console.error('Get admin datasets error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

