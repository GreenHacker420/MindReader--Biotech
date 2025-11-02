import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../lib/auth';
import { stripe } from '../../../../../lib/stripe';
import prisma from '../../../../../lib/prisma';

export async function POST(req) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (!user.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'No subscription found' },
        { status: 400 }
      );
    }

    // Resume subscription (remove cancel_at_period_end flag)
    const subscription = await stripe.subscriptions.update(
      user.stripeSubscriptionId,
      {
        cancel_at_period_end: false,
      }
    );

    // Update user plan back to PRO
    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: 'PRO',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Subscription resumed successfully',
    });
  } catch (error) {
    console.error('Resume subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to resume subscription', details: error.message },
      { status: 500 }
    );
  }
}

