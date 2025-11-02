import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../lib/auth';
import prisma from '../../../../../lib/prisma';

export async function PATCH(req, context) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const resourceId = params.id;
    const body = await req.json();

    const resource = await prisma.resource.update({
      where: { id: resourceId },
      data: {
        title: body.title,
        description: body.description,
        fileType: body.fileType,
        accessLevel: body.accessLevel,
        fileUrl: body.fileUrl,
      },
    });

    return NextResponse.json({ resource });
  } catch (error) {
    console.error('Update resource error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

