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
    const datasetId = params.id;
    const body = await req.json();

    const dataset = await prisma.dataset.update({
      where: { id: datasetId },
      data: {
        title: body.title,
        description: body.description,
        accessLevel: body.accessLevel,
        columns: body.columns,
        rows: body.rows,
      },
    });

    return NextResponse.json({ dataset });
  } catch (error) {
    console.error('Update dataset error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

