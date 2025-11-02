/**
 * Script to sync existing Stripe subscriptions with users
 * This finds active subscriptions and updates users accordingly
 */

const { PrismaClient } = require('@prisma/client');
const Stripe = require('stripe');
require('dotenv').config({ path: '.env.local' });

const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
});

async function syncSubscriptions() {
  try {
    console.log('🔄 Syncing Stripe subscriptions with users...\n');

    // Get all users with Stripe customer IDs
    const usersWithCustomers = await prisma.user.findMany({
      where: {
        stripeCustomerId: { not: null },
      },
      select: {
        id: true,
        email: true,
        stripeCustomerId: true,
        stripeSubscriptionId: true,
        plan: true,
      },
    });

    console.log(`Found ${usersWithCustomers.length} users with Stripe customer IDs\n`);

    for (const user of usersWithCustomers) {
      try {
        console.log(`Checking user: ${user.email}`);
        console.log(`  Customer ID: ${user.stripeCustomerId}`);

        // Get subscriptions for this customer
        const subscriptions = await stripe.subscriptions.list({
          customer: user.stripeCustomerId,
          status: 'active',
          limit: 10,
        });

        if (subscriptions.data.length === 0) {
          console.log(`  ⚠️  No active subscriptions found\n`);
          continue;
        }

        // Use the most recent active subscription
        const activeSubscription = subscriptions.data[0];
        console.log(`  ✅ Found active subscription: ${activeSubscription.id}`);
        console.log(`  Status: ${activeSubscription.status}`);

        // Update user
        const updatedUser = await prisma.user.update({
          where: { id: user.id },
          data: {
            plan: 'PRO',
            stripeSubscriptionId: activeSubscription.id,
            stripePriceId: activeSubscription.items.data[0].price.id,
            stripeCurrentPeriodEnd: new Date(activeSubscription.current_period_end * 1000),
          },
        });

        console.log(`  ✅ Updated user to PRO plan`);
        console.log(`  Subscription ID: ${updatedUser.stripeSubscriptionId}`);
        console.log(`  Price ID: ${updatedUser.stripePriceId}`);
        console.log('');
      } catch (error) {
        console.error(`  ❌ Error processing user ${user.email}:`, error.message);
        console.log('');
      }
    }

    console.log('✅ Sync completed!');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// If email provided, sync only that user
const email = process.argv[2];
if (email) {
  syncSubscriptions().then(() => {
    return prisma.user.findUnique({
      where: { email },
      include: { stripeCustomerId: true },
    }).then(user => {
      if (!user || !user.stripeCustomerId) {
        console.error(`User ${email} not found or has no Stripe customer ID`);
        process.exit(1);
      }
      return syncSubscriptions();
    });
  });
} else {
  syncSubscriptions();
}

