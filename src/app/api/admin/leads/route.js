import { NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// GET all contact leads (admin only)
export async function GET(request) {
  try {
    const session = await auth();
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where = {};
    if (status) where.status = status;

    const leads = await prisma.contactLead.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const stats = {
      total: await prisma.contactLead.count(),
      new: await prisma.contactLead.count({ where: { status: 'NEW' } }),
      contacted: await prisma.contactLead.count({ where: { status: 'CONTACTED' } }),
      resolved: await prisma.contactLead.count({ where: { status: 'RESOLVED' } }),
    };

    return NextResponse.json({ leads, stats });
  } catch (error) {
    console.error('Error fetching leads:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}
