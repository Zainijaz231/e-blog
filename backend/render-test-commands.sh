#!/bin/bash

# 🧪 Render Email Testing Commands
# Replace YOUR_RENDER_URL with your actual Render app URL

RENDER_URL="https://YOUR_RENDER_URL.onrender.com"
TEST_EMAIL="ijazzain219@gmail.com"  # Change to your email

echo "🧪 Testing Email Service on Render"
echo "=================================="
echo "🌐 Render URL: $RENDER_URL"
echo "📧 Test Email: $TEST_EMAIL"
echo ""

# Test 1: Health Check
echo "1️⃣ Health Check..."
echo "curl $RENDER_URL/api/health/email"
curl -s "$RENDER_URL/api/health/email" | jq '.' || curl -s "$RENDER_URL/api/health/email"
echo ""
echo "=================================="
echo ""

# Test 2: Test Email Endpoint
echo "2️⃣ Test Email Sending..."
echo "curl -X POST $RENDER_URL/api/health/test-email"
curl -s -X POST "$RENDER_URL/api/health/test-email" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"name\": \"Render Test User\"}" | jq '.' || \
curl -s -X POST "$RENDER_URL/api/health/test-email" \
  -H "Content-Type: application/json" \
  -d "{\"email\": \"$TEST_EMAIL\", \"name\": \"Render Test User\"}"
echo ""
echo "=================================="
echo ""

# Test 3: User Registration
echo "3️⃣ User Registration Test..."
echo "curl -X POST $RENDER_URL/api/auth/register"
RANDOM_USERNAME="testuser$(date +%s)"
curl -s -X POST "$RENDER_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Test User\", \"username\": \"$RANDOM_USERNAME\", \"email\": \"$TEST_EMAIL\", \"password\": \"testpassword123\"}" | jq '.' || \
curl -s -X POST "$RENDER_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\": \"Test User\", \"username\": \"$RANDOM_USERNAME\", \"email\": \"$TEST_EMAIL\", \"password\": \"testpassword123\"}"
echo ""
echo "=================================="
echo ""

echo "✅ Testing completed!"
echo ""
echo "💡 How to use this script:"
echo "1. Replace YOUR_RENDER_URL with your actual Render URL"
echo "2. Replace TEST_EMAIL with your email address"
echo "3. Run: chmod +x render-test-commands.sh"
echo "4. Run: ./render-test-commands.sh"
echo ""
echo "📧 Check your email inbox for verification emails!"