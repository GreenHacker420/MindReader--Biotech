# Webhook Troubleshooting Guide

## Problem: User Plan Not Updating After Payment

The user completed payment but their plan is still showing as `FREE` instead of `PRO`.

---

## Quick Diagnosis Steps

### 1. Check if Webhook is Being Called

**Look for these logs in your server console:**
```
🔔 Webhook received
✅ Webhook signature verified
🛒 Checkout session completed event
```

**If you don't see these logs:**
- Webhook is not being called by Stripe
- See "Setup Webhook" section below

### 2. Check Webhook Configuration

**Verify these environment variables are set:**
```bash
echo $STRIPE_WEBHOOK_SECRET
```

If empty, the webhook will fail signature verification.

### 3. Check Server Logs for Errors

Look for:
- `❌ Webhook signature verification failed`
- `❌ Missing userId in session metadata`
- `⚠️ Skipping: Not a subscription checkout`

---

## Most Common Issues

### Issue 1: Webhook Not Configured in Stripe Dashboard

**Solution:**
1. Go to https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter your webhook URL:
   - **Local:** `http://localhost:3000/api/stripe/webhook` (requires Stripe CLI)
   - **Production:** `https://yourdomain.com/api/stripe/webhook`
4. Select these events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy the webhook signing secret (starts with `whsec_`)
6. Add to `.env.local`: `STRIPE_WEBHOOK_SECRET=whsec_...`

### Issue 2: Testing Locally Without Stripe CLI

**Problem:** Stripe can't reach `localhost:3000` directly.

**Solution:** Use Stripe CLI to forward webhooks:

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

This will output a webhook signing secret. Add it to your `.env.local`.

### Issue 3: Missing userId in Metadata

**Problem:** The checkout session doesn't have userId in metadata.

**Check logs for:**
```
❌ Missing userId in session metadata
Available metadata: {...}
```

**Solution:** 
- Check `src/app/api/stripe/checkout/route.js`
- Ensure `userId` is being passed to `createCheckoutSession`
- Verify metadata is set in Stripe checkout session creation

### Issue 4: Webhook Secret Mismatch

**Problem:** Signature verification fails.

**Check logs for:**
```
❌ Webhook signature verification failed
```

**Solution:**
1. Get the correct webhook secret from Stripe Dashboard or CLI
2. Ensure `STRIPE_WEBHOOK_SECRET` matches
3. Restart your server after updating `.env.local`

---

## Testing the Webhook

### Option 1: Use Stripe CLI to Test

```bash
# Start webhook forwarding
stripe listen --forward-to localhost:3000/api/stripe/webhook

# In another terminal, trigger a test event
stripe trigger checkout.session.completed
```

### Option 2: Use Stripe Dashboard

1. Go to https://dashboard.stripe.com/test/events
2. Find your `checkout.session.completed` event
3. Click "Send test webhook"
4. Check server logs for the webhook processing

### Option 3: Check Webhook Logs in Stripe Dashboard

1. Go to https://dashboard.stripe.com/test/webhooks
2. Click on your webhook endpoint
3. Check the "Recent events" tab
4. Look for failed requests and error messages

---

## Manual Fix (Temporary)

If the webhook failed and you need to update the user immediately:

### Via Database:

```sql
-- Find user by email
SELECT id, email, plan, "stripeSubscriptionId" FROM "User" WHERE email = 'hhirawat5bkp@gmail.com';

-- Update to PRO (you'll need the subscription ID from Stripe Dashboard)
UPDATE "User" 
SET plan = 'PRO',
    "stripeSubscriptionId" = 'sub_xxxxx',
    "stripePriceId" = 'price_1SOl9HRqixwVUmVfF67KAADa'
WHERE email = 'hhirawat5bkp@gmail.com';
```

### Via Stripe Dashboard:

1. Find the subscription: https://dashboard.stripe.com/test/subscriptions
2. Get the subscription ID (starts with `sub_`)
3. Use it in the database update above

---

## Verify Webhook is Working

After completing a test payment, check:

1. **Server logs** should show:
   ```
   ✅ checkout.session.completed handled successfully
   ✅ User updated to PRO plan
   ```

2. **Database** should have:
   - `plan = 'PRO'`
   - `stripeSubscriptionId` set
   - `stripePriceId` set
   - `stripeCurrentPeriodEnd` set

3. **User session** should show:
   ```bash
   curl -b cookies.txt http://localhost:3000/api/auth/session | jq '.user.plan'
   # Should output: "PRO"
   ```

---

## Debug Checklist

- [ ] Webhook endpoint configured in Stripe Dashboard
- [ ] `STRIPE_WEBHOOK_SECRET` is set in `.env.local`
- [ ] Using Stripe CLI for local testing (`stripe listen`)
- [ ] Server logs show webhook being received
- [ ] Checkout session has `userId` in metadata
- [ ] Checkout session `mode` is `subscription`
- [ ] Checkout session has `subscription` field
- [ ] Server restarted after environment variable changes
- [ ] Webhook URL is publicly accessible (for production)

---

## Need More Help?

Check the enhanced webhook logs. The new logging will show:
- When webhooks are received
- Event types and IDs
- Session details
- User update confirmations
- Any errors with full context

