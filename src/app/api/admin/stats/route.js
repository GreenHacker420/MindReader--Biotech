import { NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import prisma from '../../../../lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET() {
  noStore();
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [totalUsers, totalEmails, adminUsers] = await Promise.all([
      prisma.user.count(),
      prisma.emailLog.count(),
      prisma.user.count({
        where: {
          role: 'ADMIN',
        },
      }),
    ]);

    // For active users, we'll just return total users since we don't have Session model relation
    const activeUsers = totalUsers;

    return NextResponse.json({
      totalUsers,
      activeUsers,
      totalEmails,
      adminUsers,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
