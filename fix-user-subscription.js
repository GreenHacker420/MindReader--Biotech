/**
 * Manual script to fix user subscription status
 * Run with: node fix-user-subscription.js <email>
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixUserSubscription(email) {
  try {
    console.log(`Looking for user with email: ${email}`);
    
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`User not found: ${email}`);
      process.exit(1);
    }

    console.log('Current user status:');
    console.log('  ID:', user.id);
    console.log('  Email:', user.email);
    console.log('  Plan:', user.plan);
    console.log('  Stripe Customer ID:', user.stripeCustomerId);
    console.log('  Stripe Subscription ID:', user.stripeSubscriptionId);

    // Check if user has a subscription in Stripe
    if (user.stripeSubscriptionId) {
      console.log('\n✅ User already has a subscription ID');
      console.log('Updating plan to PRO...');
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: 'PRO',
        },
      });

      console.log('✅ User updated to PRO plan');
    } else if (user.stripeCustomerId) {
      console.log('\n⚠️ User has customer ID but no subscription');
      console.log('You need to:');
      console.log('1. Find the subscription in Stripe Dashboard');
      console.log('2. Get the subscription ID (starts with sub_)');
      console.log('3. Run this command with subscription ID:');
      console.log(`   node fix-user-subscription.js ${email} <subscription_id>`);
    } else {
      console.log('\n❌ User has no Stripe customer or subscription');
      console.log('The user may not have completed payment yet.');
    }

    // If subscription ID provided as second argument
    if (process.argv[3]) {
      const subscriptionId = process.argv[3];
      console.log(`\nUpdating user with subscription ID: ${subscriptionId}`);
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          plan: 'PRO',
          stripeSubscriptionId: subscriptionId,
        },
      });

      console.log('✅ User updated with subscription ID');
    }

    // Show final status
    const updatedUser = await prisma.user.findUnique({
      where: { id: user.id },
    });

    console.log('\n📊 Final user status:');
    console.log('  Plan:', updatedUser.plan);
    console.log('  Stripe Subscription ID:', updatedUser.stripeSubscriptionId);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

const email = process.argv[2];
if (!email) {
  console.error('Usage: node fix-user-subscription.js <email> [subscription_id]');
  process.exit(1);
}

fixUserSubscription(email);

