#!/bin/bash

# Comprehensive Stripe Payment Flow Test Script
# This script tests the entire payment flow from user creation to checkout

BASE_URL="${BASE_URL:-http://localhost:3000}"
TEST_EMAIL="hhirawat5@gmail.com"
TEST_PASSWORD="TestPassword123!"
TEST_NAME="Test User"

echo "🚀 Starting Stripe Payment Flow Test"
echo "======================================"
echo "Base URL: $BASE_URL"
echo "Test Email: $TEST_EMAIL"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Create a new user
echo -e "${YELLOW}Step 1: Creating new user...${NC}"
SIGNUP_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$TEST_NAME\",
    \"email\": \"$TEST_EMAIL\",
    \"password\": \"$TEST_PASSWORD\"
  }")

HTTP_CODE=$(echo "$SIGNUP_RESPONSE" | tail -n1)
BODY=$(echo "$SIGNUP_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 201 ] || [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✓ User created successfully${NC}"
  echo "Response: $BODY"
else
  echo -e "${RED}✗ User creation failed (HTTP $HTTP_CODE)${NC}"
  echo "Response: $BODY"
  # Continue anyway - user might already exist
fi

echo ""
echo -e "${YELLOW}Step 2: Signing in to get session cookie...${NC}"

# Step 2: Sign in to get session cookie
SIGNIN_RESPONSE=$(curl -s -w "\n%{http_code}" -c /tmp/cookies.txt -X POST "$BASE_URL/api/auth/callback/credentials" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "email=$TEST_EMAIL&password=$TEST_PASSWORD&redirect=false&json=true")

HTTP_CODE=$(echo "$SIGNIN_RESPONSE" | tail -n1)
BODY=$(echo "$SIGNIN_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✓ Sign in successful${NC}"
  echo "Response: $BODY"
else
  echo -e "${RED}✗ Sign in failed (HTTP $HTTP_CODE)${NC}"
  echo "Response: $BODY"
  echo ""
  echo "Trying alternative signin method..."
  
  # Alternative: Try CSRF + signin
  echo "Getting CSRF token..."
  CSRF_RESPONSE=$(curl -s -c /tmp/cookies.txt "$BASE_URL/api/auth/csrf")
  echo "CSRF Response: $CSRF_RESPONSE"
  
  SIGNIN_RESPONSE=$(curl -s -w "\n%{http_code}" -b /tmp/cookies.txt -c /tmp/cookies.txt \
    -X POST "$BASE_URL/api/auth/callback/credentials" \
    -H "Content-Type: application/x-www-form-urlencoded" \
    -d "email=$TEST_EMAIL&password=$TEST_PASSWORD&redirect=false&json=true")
  
  HTTP_CODE=$(echo "$SIGNIN_RESPONSE" | tail -n1)
  BODY=$(echo "$SIGNIN_RESPONSE" | sed '$d')
  echo "Alternative signin response (HTTP $HTTP_CODE): $BODY"
fi

echo ""
echo -e "${YELLOW}Step 3: Checking session...${NC}"

# Step 3: Verify session
SESSION_RESPONSE=$(curl -s -w "\n%{http_code}" -b /tmp/cookies.txt "$BASE_URL/api/auth/session")

HTTP_CODE=$(echo "$SESSION_RESPONSE" | tail -n1)
BODY=$(echo "$SESSION_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✓ Session valid${NC}"
  echo "Session: $BODY" | head -c 200
  echo "..."
else
  echo -e "${RED}✗ Session check failed (HTTP $HTTP_CODE)${NC}"
  echo "Response: $BODY"
fi

echo ""
echo -e "${YELLOW}Step 4: Creating Stripe checkout session...${NC}"

# Step 4: Create checkout session
CHECKOUT_RESPONSE=$(curl -s -w "\n%{http_code}" -b /tmp/cookies.txt \
  -X POST "$BASE_URL/api/stripe/checkout" \
  -H "Content-Type: application/json" \
  -d "{\"plan\": \"PRO\"}")

HTTP_CODE=$(echo "$CHECKOUT_RESPONSE" | tail -n1)
BODY=$(echo "$CHECKOUT_RESPONSE" | sed '$d')

if [ "$HTTP_CODE" -eq 200 ]; then
  echo -e "${GREEN}✓ Checkout session created successfully${NC}"
  CHECKOUT_URL=$(echo "$BODY" | grep -o '"url":"[^"]*' | cut -d'"' -f4)
  if [ -n "$CHECKOUT_URL" ]; then
    echo "Checkout URL: $CHECKOUT_URL"
    echo ""
    echo -e "${GREEN}✅ Payment flow test completed successfully!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Open the checkout URL in a browser: $CHECKOUT_URL"
    echo "2. Complete the payment using Stripe test card: 4242 4242 4242 4242"
    echo "3. Check the webhook handler to verify subscription is activated"
  else
    echo "Response: $BODY"
  fi
else
  echo -e "${RED}✗ Checkout session creation failed (HTTP $HTTP_CODE)${NC}"
  echo "Response: $BODY"
  echo ""
  echo "Troubleshooting:"
  echo "- Check if STRIPE_SECRET_KEY is set in environment variables"
  echo "- Verify the user exists in the database"
  echo "- Check server logs for detailed error messages"
fi

echo ""
echo "======================================"
echo "Test completed!"
echo ""
echo "Cookies saved to: /tmp/cookies.txt"
echo "You can use these cookies for subsequent requests"

