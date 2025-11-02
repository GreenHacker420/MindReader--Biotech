#!/bin/bash

# Script to check webhook status and manually trigger subscription update if needed

BASE_URL="${BASE_URL:-http://localhost:3000}"
TEST_EMAIL="${TEST_EMAIL:-hhirawat5bkp@gmail.com}"

echo "🔍 Checking Webhook Status and User Plan"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}Step 1: Check if webhook endpoint is accessible${NC}"
WEBHOOK_TEST=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$BASE_URL/api/stripe/webhook" \
  -H "Content-Type: application/json" \
  -d '{}')

if [ "$WEBHOOK_TEST" -eq 400 ]; then
  echo -e "${GREEN}✓ Webhook endpoint is accessible (400 = expected without signature)${NC}"
else
  echo -e "${YELLOW}⚠ Webhook returned HTTP $WEBHOOK_TEST${NC}"
fi

echo ""
echo -e "${BLUE}Step 2: Check webhook configuration${NC}"
echo "To test webhooks locally, you need to:"
echo ""
echo "1. Install Stripe CLI:"
echo "   brew install stripe/stripe-cli/stripe"
echo ""
echo "2. Login to Stripe:"
echo "   stripe login"
echo ""
echo "3. Forward webhooks to your local server:"
echo "   stripe listen --forward-to localhost:3000/api/stripe/webhook"
echo ""
echo "4. Copy the webhook signing secret and add to .env.local:"
echo "   STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""

echo -e "${BLUE}Step 3: Check if webhook events are being received${NC}"
echo "Check your server logs for:"
echo "  - '🔔 Webhook received'"
echo "  - '✅ Webhook signature verified'"
echo "  - '🛒 Checkout session completed event'"
echo ""

echo -e "${BLUE}Step 4: Common Issues${NC}"
echo ""
echo "Issue 1: Webhook not configured in Stripe Dashboard"
echo "  → Go to https://dashboard.stripe.com/test/webhooks"
echo "  → Add endpoint: $BASE_URL/api/stripe/webhook"
echo "  → Select events: checkout.session.completed, invoice.payment_succeeded"
echo ""
echo "Issue 2: Missing STRIPE_WEBHOOK_SECRET"
echo "  → Get webhook secret from Stripe Dashboard or CLI"
echo "  → Add to .env.local: STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""
echo "Issue 3: Webhook URL not publicly accessible (for production)"
echo "  → Use Stripe CLI for local development"
echo "  → Use ngrok or similar for testing production webhooks locally"
echo ""

echo -e "${BLUE}Step 5: Verify user subscription status${NC}"
echo ""
echo "Check the database directly or use your admin panel to verify:"
echo "  - User email: $TEST_EMAIL"
echo "  - Plan should be: PRO"
echo "  - stripeSubscriptionId should be set"
echo ""

echo "════════════════════════════════════════"
echo "To manually update a user to PRO (for testing):"
echo "════════════════════════════════════════"
echo ""
echo "If the webhook failed, you can manually update the user:"
echo ""
echo "1. Connect to your database"
echo "2. Find the user by email: $TEST_EMAIL"
echo "3. Update the plan:"
echo "   UPDATE \"User\" SET plan = 'PRO' WHERE email = '$TEST_EMAIL';"
echo ""

