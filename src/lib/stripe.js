import Stripe from 'stripe';

// Validate Stripe configuration
if (!process.env.STRIPE_SECRET_KEY) {
  console.error('⚠️  STRIPE_SECRET_KEY is not set in environment variables');
}

if (!process.env.STRIPE_PRO_PRICE_ID) {
  console.warn('⚠️  STRIPE_PRO_PRICE_ID is not set in environment variables');
}

// Initialize Stripe (will throw error if key is invalid)
let stripe;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    // Use the latest API version or let Stripe use default
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
    });
  } else {
    console.error('Stripe not initialized: Missing STRIPE_SECRET_KEY');
  }
} catch (error) {
  console.error('Failed to initialize Stripe:', error.message);
  stripe = null;
}

export { stripe };

// Subscription Plans
export const PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    priceId: null,
    features: [
      'Basic access to platform',
      'Limited research articles',
      'Community forum access',
      'Email support',
    ],
  },
  PRO: {
    name: 'Pro',
    price: 15,
    priceId: 'price_1SOl9HRqixwVUmVfF67KAADa', // Using the price ID directly
    features: [
      'Full platform access',
      'Unlimited research articles',
      'Advanced analytics',
      'Priority email support',
      'Exclusive webinars',
      'API access',
      'Custom reports',
      'Early access to new features',
    ],
  },
};

export async function createStripeCustomer(email, name) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables.');
  }
  return await stripe.customers.create({
    email,
    name: name || undefined,
    metadata: {
      source: 'mindreaderbio',
    },
  });
}

export async function createCheckoutSession(
  customerId,
  priceId,
  userId
) {
  console.log('Creating checkout session with priceId:', priceId);
  console.log('Environment STRIPE_PRO_PRICE_ID:', process.env.STRIPE_PRO_PRICE_ID);
  
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables.');
  }

  if (!priceId) {
    throw new Error('Stripe price ID is not configured. Please set STRIPE_PRO_PRICE_ID in your environment variables.');
  }

  return await stripe.checkout.sessions.create({
    customer: customerId,
    payment_method_types: ['card'],
    line_items: [{
      price: priceId,
      quantity: 1,
    }],
    mode: 'subscription',
    success_url: `${process.env.NEXTAUTH_URL}/dashboard?success=true`,
    cancel_url: `${process.env.NEXTAUTH_URL}/pricing?canceled=true`,
    metadata: {
      userId,
    },
  });
}

export async function createBillingPortalSession(customerId) {
  if (!stripe) {
    throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY in your environment variables.');
  }

  // Create billing portal session with configuration
  // Note: You must configure the billing portal in Stripe Dashboard first
  // https://dashboard.stripe.com/test/settings/billing/portal
  try {
    return await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${process.env.NEXTAUTH_URL}/dashboard`,
    });
  } catch (error) {
    if (error.code === 'resource_missing' || error.message?.includes('configuration')) {
      throw new Error(
        'Billing portal is not configured. Please set it up in Stripe Dashboard: https://dashboard.stripe.com/test/settings/billing/portal'
      );
    }
    throw error;
  }
}

export async function cancelSubscription(subscriptionId) {
  return await stripe.subscriptions.cancel(subscriptionId);
}

export async function getSubscription(subscriptionId) {
  return await stripe.subscriptions.retrieve(subscriptionId);
}
