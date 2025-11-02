import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { createBillingPortalSession } from '../../../../lib/stripe';
import prisma from '../../../../lib/prisma';

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

    if (!user.stripeCustomerId) {
      return NextResponse.json(
        { error: 'No Stripe customer found. Please subscribe first.' },
        { status: 400 }
      );
    }

    const portalSession = await createBillingPortalSession(user.stripeCustomerId);

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error('Portal error:', error);
    
    // Check if it's a configuration error
    if (error.message?.includes('configuration') || error.message?.includes('not configured')) {
      return NextResponse.json(
        { 
          error: 'Billing portal not configured',
          details: 'Please set up the billing portal in Stripe Dashboard: https://dashboard.stripe.com/test/settings/billing/portal'
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
