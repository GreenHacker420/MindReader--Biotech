import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../../lib/auth';
import { stripe } from '../../../../../lib/stripe';
import prisma from '../../../../../lib/prisma';
import { unstable_noStore as noStore } from 'next/cache';

export async function GET(req) {
  noStore();
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
      return NextResponse.json({
        hasSubscription: false,
        plan: user.plan,
      });
    }

    // Get subscription details from Stripe
    const subscription = await stripe.subscriptions.retrieve(
      user.stripeSubscriptionId
    );

    return NextResponse.json({
      hasSubscription: true,
      plan: user.plan,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
        cancelAtPeriodEnd: subscription.cancel_at_period_end,
        cancelAt: subscription.cancel_at 
          ? new Date(subscription.cancel_at * 1000).toISOString() 
          : null,
        priceId: subscription.items.data[0]?.price.id,
        amount: subscription.items.data[0]?.price.unit_amount,
        currency: subscription.items.data[0]?.price.currency,
      },
      customerId: user.stripeCustomerId,
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription status', details: error.message },
      { status: 500 }
    );
  }
}

