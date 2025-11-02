import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

export async function POST(req) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const title = formData.get('title');
    const description = formData.get('description');
    const fileType = formData.get('fileType');
    const accessLevel = formData.get('accessLevel');
    const fileUrl = formData.get('fileUrl'); // URL from file upload service

    if (!title || !fileType || !accessLevel || !fileUrl) {
      return NextResponse.json(
        { error: 'Missing required fields: title, fileType, accessLevel, fileUrl' },
        { status: 400 }
      );
    }

    const resource = await prisma.resource.create({
      data: {
        title,
        description: description || null,
        fileType,
        accessLevel,
        fileUrl,
        uploadedBy: session.user.id,
      },
    });

    return NextResponse.json({ resource });
  } catch (error) {
    console.error('Create resource error:', error);
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

    const resources = await prisma.resource.findMany({
      orderBy: {
        uploadedAt: 'desc',
      },
    });

    return NextResponse.json({ resources });
  } catch (error) {
    console.error('Get admin resources error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

