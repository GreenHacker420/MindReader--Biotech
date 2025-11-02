#!/bin/bash

# Comprehensive Stripe Payment Flow Test Script using curl
# Tests the entire payment flow from user creation to checkout

BASE_URL="${BASE_URL:-http://localhost:3000}"
TEST_EMAIL="hhirawat5bkp@gmail.com"
TEST_PASSWORD="TestPassword123!"
TEST_NAME="Harsh Hirawat"

echo "🚀 Starting Stripe Payment Flow Test"
echo "======================================"
echo "Base URL: $BASE_URL"
echo "Test Email: $TEST_EMAIL"
echo "Test Name: $TEST_NAME"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

COOKIE_JAR="/tmp/stripe_test_cookies.txt"
rm -f "$COOKIE_JAR"

# Helper function to extract JSON value
extract_json() {
  echo "$1" | grep -o "\"$2\":\"[^\"]*" | cut -d'"' -f4
}

# Step 1: Create a new user
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 1: Creating new user${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"

SIGNUP_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$TEST_NAME\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

HTTP_CODE=$(echo "$SIGNUP_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$SIGNUP_RESPONSE" | sed '/HTTP_CODE/d')

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"
echo ""

if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✓ User created successfully${NC}"
  USER_ID=$(echo "$BODY" | grep -o '"id":"[^"]*' | cut -d'"' -f4)
  if [ -n "$USER_ID" ]; then
    echo "User ID: $USER_ID"
  fi
elif [ "$HTTP_CODE" -eq 400 ]; then
  ERROR=$(echo "$BODY" | grep -o '"error":"[^"]*' | cut -d'"' -f4)
  if [[ "$ERROR" == *"already exists"* ]]; then
    echo -e "${YELLOW}⚠ User already exists, continuing...${NC}"
  else
    echo -e "${RED}✗ User creation failed: $ERROR${NC}"
    exit 1
  fi
else
  echo -e "${RED}✗ User creation failed (HTTP $HTTP_CODE)${NC}"
  echo "Continuing anyway..."
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 2: Getting CSRF token${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"

# Step 2: Get CSRF token (required for NextAuth)
CSRF_RESPONSE=$(curl -s -c "$COOKIE_JAR" "$BASE_URL/api/auth/csrf")
CSRF_TOKEN=$(echo "$CSRF_RESPONSE" | grep -o '"csrfToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$CSRF_TOKEN" ]; then
  echo -e "${RED}✗ Failed to get CSRF token${NC}"
  echo "Response: $CSRF_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ CSRF token obtained${NC}"
echo "CSRF Token: ${CSRF_TOKEN:0:20}..."

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 3: Signing in${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"

# Step 3: Sign in with credentials
SIGNIN_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
  -X POST "$BASE_URL/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=$TEST_EMAIL" \
  -d "password=$TEST_PASSWORD" \
  -d "csrfToken=$CSRF_TOKEN" \
  -d "redirect=false" \
  -d "json=true")

HTTP_CODE=$(echo "$SIGNIN_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$SIGNIN_RESPONSE" | sed '/HTTP_CODE/d')

echo "HTTP Status: $HTTP_CODE"
echo "Response (first 200 chars): ${BODY:0:200}..."

if [ "$HTTP_CODE" -ne 200 ] && [ "$HTTP_CODE" -ne 302 ]; then
  echo -e "${RED}✗ Sign in failed (HTTP $HTTP_CODE)${NC}"
  echo "Full response: $BODY"
  echo ""
  echo "Trying alternative signin endpoint..."
  
  # Alternative: Try signin with CSRF in body
  SIGNIN_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -b "$COOKIE_JAR" -c "$COOKIE_JAR" \
    -X POST "$BASE_URL/api/auth/signin/credentials" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$TEST_EMAIL\",
      \"password\": \"$TEST_PASSWORD\",
      \"csrfToken\": \"$CSRF_TOKEN\",
      \"redirect\": false,
      \"json\": true
    }")
  
  HTTP_CODE=$(echo "$SIGNIN_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
  BODY=$(echo "$SIGNIN_RESPONSE" | sed '/HTTP_CODE/d')
  echo "Alternative signin HTTP: $HTTP_CODE"
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 4: Verifying session${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"

# Step 4: Verify session
SESSION_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -b "$COOKIE_JAR" "$BASE_URL/api/auth/session")

HTTP_CODE=$(echo "$SESSION_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$SESSION_RESPONSE" | sed '/HTTP_CODE/d')

echo "HTTP Status: $HTTP_CODE"

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✓ Session is valid${NC}"
  USER_EMAIL=$(echo "$BODY" | grep -o '"email":"[^"]*' | cut -d'"' -f4)
  USER_PLAN=$(echo "$BODY" | grep -o '"plan":"[^"]*' | cut -d'"' -f4)
  echo "User Email: $USER_EMAIL"
  echo "User Plan: ${USER_PLAN:-FREE}"
  echo "Session data (first 300 chars): ${BODY:0:300}..."
else
  echo -e "${RED}✗ Session check failed (HTTP $HTTP_CODE)${NC}"
  echo "Response: $BODY"
  echo ""
  echo "Cookies in jar:"
  cat "$COOKIE_JAR" | grep -v "^#" | grep -v "^$"
  exit 1
fi

echo ""
echo -e "${BLUE}════════════════════════════════════════${NC}"
echo -e "${YELLOW}Step 5: Creating Stripe checkout session${NC}"
echo -e "${BLUE}════════════════════════════════════════${NC}"

# Step 5: Create Stripe checkout session
CHECKOUT_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -b "$COOKIE_JAR" \
  -X POST "$BASE_URL/api/stripe/checkout" \
  -H "Content-Type: application/json" \
  -d "{\"plan\": \"PRO\"}")

HTTP_CODE=$(echo "$CHECKOUT_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$CHECKOUT_RESPONSE" | sed '/HTTP_CODE/d')

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"
echo ""

if [ "$HTTP_CODE" -eq 200 ]; then
  CHECKOUT_URL=$(echo "$BODY" | grep -o '"url":"[^"]*' | cut -d'"' -f4)
  
  if [ -n "$CHECKOUT_URL" ]; then
    echo -e "${GREEN}✅ Payment flow test completed successfully!${NC}"
    echo ""
    echo "════════════════════════════════════════"
    echo "Checkout URL:"
    echo -e "${BLUE}$CHECKOUT_URL${NC}"
    echo "════════════════════════════════════════"
    echo ""
    echo "Next steps to complete the test:"
    echo "1. Open the checkout URL in your browser"
    echo "2. Use Stripe test card: 4242 4242 4242 4242"
    echo "3. Use any future expiry date (e.g., 12/25)"
    echo "4. Use any 3-digit CVC (e.g., 123)"
    echo "5. Use any ZIP code (e.g., 12345)"
    echo ""
    echo "After payment:"
    echo "- Check webhook logs to verify subscription activation"
    echo "- User plan should be updated to PRO"
    echo "- Check database to confirm stripeSubscriptionId is set"
  else
    echo -e "${YELLOW}⚠ Checkout session created but URL not found${NC}"
    echo "Full response: $BODY"
  fi
else
  echo -e "${RED}✗ Checkout session creation failed (HTTP $HTTP_CODE)${NC}"
  echo ""
  echo "Error details:"
  echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
  echo ""
  echo "Troubleshooting:"
  echo "1. Check if STRIPE_SECRET_KEY is set:"
  echo "   echo \$STRIPE_SECRET_KEY"
  echo ""
  echo "2. Check if STRIPE_PRO_PRICE_ID matches the price ID in stripe.js"
  echo ""
  echo "3. Verify the user exists in database:"
  echo "   Check server logs for user lookup"
  echo ""
  echo "4. Check server console for detailed error messages"
fi

echo ""
echo "════════════════════════════════════════"
echo "Test Summary"
echo "════════════════════════════════════════"
echo "Cookies saved to: $COOKIE_JAR"
echo "You can inspect cookies with: cat $COOKIE_JAR"
echo ""
echo "To test webhook (after payment):"
echo "1. Set up Stripe CLI: stripe listen --forward-to localhost:3000/api/stripe/webhook"
echo "2. Or configure webhook in Stripe Dashboard"
echo ""

