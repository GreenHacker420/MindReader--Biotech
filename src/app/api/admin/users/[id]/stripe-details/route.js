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
        stripeCustomerId: true,
        stripeSubscriptionId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let stripeCustomer = null;
    let stripeSubscription = null;
    let invoices = [];

    // Fetch Stripe customer details if available (non-blocking)
    if (user.stripeCustomerId && stripe) {
      try {
        const [customerData, paymentMethodsData] = await Promise.all([
          stripe.customers.retrieve(user.stripeCustomerId),
          stripe.paymentMethods.list({
            customer: user.stripeCustomerId,
          }),
        ]);
        
        stripeCustomer = {
          ...customerData,
          paymentMethods: paymentMethodsData.data,
        };
      } catch (error) {
        console.error('Error fetching Stripe customer:', error);
      }
    }

    // Fetch Stripe subscription details if available (non-blocking)
    if (user.stripeSubscriptionId && stripe) {
      try {
        const [subscriptionData, invoicesData] = await Promise.all([
          stripe.subscriptions.retrieve(user.stripeSubscriptionId),
          stripe.invoices.list({
            subscription: user.stripeSubscriptionId,
            limit: 10,
          }),
        ]);
        
        stripeSubscription = subscriptionData;
        invoices = invoicesData.data.map(inv => ({
          id: inv.id,
          amount: inv.amount_paid,
          currency: inv.currency,
          status: inv.status,
          created: new Date(inv.created * 1000).toISOString(),
          paidAt: inv.status_transitions.paid_at 
            ? new Date(inv.status_transitions.paid_at * 1000).toISOString()
            : null,
          invoicePdf: inv.invoice_pdf,
          hostedInvoiceUrl: inv.hosted_invoice_url,
        }));
      } catch (error) {
        console.error('Error fetching Stripe subscription:', error);
      }
    }

    return NextResponse.json({
      stripeCustomer,
      stripeSubscription,
      invoices,
    });
  } catch (error) {
    console.error('Get Stripe details error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

