import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';

export async function GET(req, context) {
  try {
    const session = await auth();
    const params = await context.params;
    const datasetId = params.id;

    const dataset = await prisma.dataset.findUnique({
      where: { id: datasetId },
    });

    if (!dataset) {
      return NextResponse.json({ error: 'Dataset not found' }, { status: 404 });
    }

    // Check access control
    if (dataset.accessLevel === 'PRO' && (!session || session.user.plan !== 'PRO')) {
      return NextResponse.json(
        { error: 'Unauthorized - PRO subscription required' },
        { status: 403 }
      );
    }

    return NextResponse.json({ dataset });
  } catch (error) {
    console.error('Get dataset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req, context) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const datasetId = params.id;

    await prisma.dataset.delete({
      where: { id: datasetId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete dataset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

