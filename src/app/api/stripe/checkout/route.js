import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../../lib/auth';
import { stripe, createCheckoutSession, createStripeCustomer, PLANS } from '../../../../lib/stripe';
import prisma from '../../../../lib/prisma';

export async function POST(req) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      console.error('Checkout: No session or email');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { plan } = await req.json();

    if (plan !== 'PRO') {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    console.log('Checkout: Looking for user with email:', session.user.email);
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      console.error('Checkout: User not found for email:', session.user.email);
      console.error('Session user:', JSON.stringify(session.user, null, 2));
      return NextResponse.json({ 
        error: 'User not found. Please try signing out and signing back in.',
        details: 'Your account may need to be synced with the database.'
      }, { status: 404 });
    }

    console.log('Checkout: User found:', user.id);

    // Check if user already has a subscription
    if (user.plan === 'PRO' && user.stripeSubscriptionId) {
      return NextResponse.json(
        { error: 'Already subscribed' },
        { status: 400 }
      );
    }

    // Validate Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('Checkout: STRIPE_SECRET_KEY is not set');
      return NextResponse.json(
        { 
          error: 'Payment service is not configured',
          details: 'Please contact support. Stripe API key is missing.'
        },
        { status: 500 }
      );
    }

    if (!PLANS.PRO.priceId) {
      console.error('Checkout: STRIPE_PRO_PRICE_ID is not set');
      return NextResponse.json(
        { 
          error: 'Payment service is not configured',
          details: 'Please contact support. Stripe price ID is missing.'
        },
        { status: 500 }
      );
    }

    // Create or get Stripe customer
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      try {
        const customer = await createStripeCustomer(user.email, user.name || undefined);
        customerId = customer.id;

        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId: customerId },
        });
      } catch (stripeError) {
        console.error('Checkout: Failed to create Stripe customer:', stripeError);
        return NextResponse.json(
          { 
            error: 'Failed to initialize payment',
            details: stripeError.message || 'Invalid Stripe API key. Please check your Stripe configuration.'
          },
          { status: 500 }
        );
      }
    }

    // Create checkout session
    try {
      console.log('Using price ID from PLANS.PRO:', PLANS.PRO.priceId);
      console.log('PLANS object:', JSON.stringify(PLANS, null, 2));
      
      const checkoutSession = await createCheckoutSession(
        customerId,
        PLANS.PRO.priceId,
        user.id
      );

      return NextResponse.json({ url: checkoutSession.url });
    } catch (stripeError) {
      console.error('Checkout: Failed to create checkout session:', stripeError);
      
      // Handle specific Stripe errors
      if (stripeError.type === 'StripeAuthenticationError') {
        return NextResponse.json(
          { 
            error: 'Payment service configuration error',
            details: 'Invalid Stripe API key. Please check your environment variables (STRIPE_SECRET_KEY).'
          },
          { status: 500 }
        );
      }

      return NextResponse.json(
        { 
          error: 'Failed to create checkout session',
          details: stripeError.message || 'Please try again or contact support.'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error.message || 'An unexpected error occurred. Please try again.'
      },
      { status: 500 }
    );
  }
}
