import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../../lib/auth';
import { stripe } from '../../../../../../lib/stripe';
import prisma from '../../../../../../lib/prisma';

export async function GET(
  req,
  context
) {
  try {
    const session = await auth();

    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const userId = params.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        plan: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        stripePriceId: true,
        stripeCurrentPeriodEnd: true,
        provider: true,
        providerId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return user data immediately for instant display
    // Stripe data will be fetched separately if needed
    return NextResponse.json({
      user,
      stripeCustomer: null, // Will be loaded separately if needed
      stripeSubscription: null,
      invoices: [],
      loadingStripe: true, // Flag to indicate Stripe data needs to be loaded
    });
  } catch (error) {
    console.error('Get user details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

