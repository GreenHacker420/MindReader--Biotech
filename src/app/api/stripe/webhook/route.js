import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { stripe } from '../../../../lib/stripe';
import prisma from '../../../../lib/prisma';

export async function POST(req) {
  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get('stripe-signature');

  console.log('🔔 Webhook received');
  console.log('Signature present:', !!signature);

  if (!signature) {
    console.error('❌ No signature in webhook request');
    return NextResponse.json({ error: 'No signature' }, { status: 400 });
  }

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    console.log('✅ Webhook signature verified');
    console.log('📦 Event type:', event.type);
    console.log('📦 Event ID:', event.id);
  } catch (error) {
    console.error('❌ Webhook signature verification failed:', error.message);
    console.error('Webhook secret configured:', !!process.env.STRIPE_WEBHOOK_SECRET);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('🛒 Checkout session completed event');
        console.log('Session ID:', session.id);
        console.log('Session mode:', session.mode);
        console.log('Session subscription:', session.subscription);
        console.log('Session metadata:', JSON.stringify(session.metadata, null, 2));
        
        // Only process subscription checkouts
        if (session.mode !== 'subscription') {
          console.log('⚠️ Skipping: Not a subscription checkout (mode:', session.mode, ')');
          break;
        }

        if (!session.subscription) {
          console.log('⚠️ Skipping: No subscription ID in session');
          break;
        }

        let userId = session.metadata?.userId;

        // Fallback: If metadata doesn't have userId, try to find user by customer ID
        if (!userId && session.customer) {
          console.log('⚠️ userId not in metadata, trying to find user by customer ID:', session.customer);
          const userByCustomer = await prisma.user.findUnique({
            where: { stripeCustomerId: session.customer },
          });
          
          if (userByCustomer) {
            userId = userByCustomer.id;
            console.log('✅ Found user by customer ID:', userId);
          } else {
            console.error('❌ Could not find user by customer ID:', session.customer);
          }
        }

        if (!userId) {
          console.error('❌ Missing userId - cannot process subscription');
          console.error('Session customer:', session.customer);
          console.error('Session metadata:', JSON.stringify(session.metadata, null, 2));
          break;
        }

        console.log('👤 Processing subscription for userId:', userId);

        const subscription = await stripe.subscriptions.retrieve(
          session.subscription
        );

        console.log('📋 Subscription retrieved:', subscription.id);
        console.log('📋 Subscription status:', subscription.status);

        const updateResult = await prisma.user.update({
          where: { id: userId },
          data: {
            plan: 'PRO',
            stripeSubscriptionId: subscription.id,
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        console.log('✅ User updated to PRO plan');
        console.log('Updated user:', {
          id: updateResult.id,
          email: updateResult.email,
          plan: updateResult.plan,
          stripeSubscriptionId: updateResult.stripeSubscriptionId,
        });

        // Send subscription confirmation email
        const user = await prisma.user.findUnique({
          where: { id: userId },
        });

        if (user) {
          try {
            await prisma.emailLog.create({
              data: {
                userId: user.id,
                email: user.email,
                type: 'SUBSCRIPTION_CONFIRMED',
                subject: '🎉 Welcome to Pro',
                status: 'SENT',
                sentAt: new Date(),
              },
            });
            console.log('📧 Email log created');
          } catch (emailError) {
            console.error('⚠️ Failed to create email log:', emailError);
          }
        }

        console.log('✅ checkout.session.completed handled successfully');
        break;
      }

      case 'customer.subscription.created': {
        const subscription = event.data.object;
        console.log('🆕 Subscription created event');
        console.log('Subscription ID:', subscription.id);
        console.log('Customer ID:', subscription.customer);
        console.log('Status:', subscription.status);

        // Find user by customer ID
        if (subscription.customer && subscription.status === 'active') {
          const user = await prisma.user.findUnique({
            where: { stripeCustomerId: subscription.customer },
          });

          if (user) {
            console.log('👤 Found user by customer ID:', user.id);
            const updateResult = await prisma.user.update({
              where: { id: user.id },
              data: {
                plan: 'PRO',
                stripeSubscriptionId: subscription.id,
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
              },
            });
            console.log('✅ User updated to PRO plan via subscription.created');
            console.log('Updated user:', {
              id: updateResult.id,
              email: updateResult.email,
              plan: updateResult.plan,
            });
          } else {
            console.error('❌ Could not find user with customer ID:', subscription.customer);
          }
        }

        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        console.log('💳 Invoice payment succeeded');
        console.log('Invoice ID:', invoice.id);
        console.log('Subscription:', invoice.subscription);

        if (!invoice.subscription) {
          console.log('⚠️ Skipping: No subscription in invoice');
          break;
        }

        const subscription = await stripe.subscriptions.retrieve(
          invoice.subscription
        );

        console.log('📋 Subscription status:', subscription.status);

        // Try to find user by subscription ID first, then by customer ID
        let user = await prisma.user.findUnique({
          where: { stripeSubscriptionId: subscription.id },
        });

        if (!user && subscription.customer) {
          console.log('Looking for user by customer ID:', subscription.customer);
          user = await prisma.user.findUnique({
            where: { stripeCustomerId: subscription.customer },
          });
        }

        if (user) {
          const updateResult = await prisma.user.update({
            where: { id: user.id },
            data: {
              plan: 'PRO',
              stripeSubscriptionId: subscription.id,
              stripePriceId: subscription.items.data[0].price.id,
              stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
            },
          });
          console.log('✅ User updated to PRO plan via invoice.payment_succeeded');
          console.log('Updated user:', {
            id: updateResult.id,
            email: updateResult.email,
            plan: updateResult.plan,
          });
        } else {
          console.error('❌ Could not find user for subscription:', subscription.id);
        }

        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;

        const user = await prisma.user.findUnique({
          where: { stripeSubscriptionId: invoice.subscription },
        });

        if (user) {
          await prisma.emailLog.create({
            data: {
              userId: user.id,
              email: user.email,
              type: 'PAYMENT_FAILED',
              subject: '⚠️ Payment Failed',
              status: 'SENT',
              sentAt: new Date(),
            },
          });
        }

        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        await prisma.user.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            plan: 'FREE',
            stripeSubscriptionId: null,
            stripePriceId: null,
            stripeCurrentPeriodEnd: null,
          },
        });

        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;

        await prisma.user.update({
          where: { stripeSubscriptionId: subscription.id },
          data: {
            plan: subscription.status === 'active' ? 'PRO' : 'FREE',
            stripePriceId: subscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(subscription.current_period_end * 1000),
          },
        });

        break;
      }

      default:
        console.log(`⚠️ Unhandled event type: ${event.type}`);
        console.log('Event data:', JSON.stringify(event.data, null, 2));
    }

    console.log('✅ Webhook processed successfully');
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('❌ Webhook handler error:', error);
    console.error('Error stack:', error.stack);
    console.error('Event that failed:', JSON.stringify(event, null, 2));
    return NextResponse.json(
      { 
        error: 'Webhook handler failed',
        message: error.message,
        eventType: event?.type,
      },
      { status: 500 }
    );
  }
}
