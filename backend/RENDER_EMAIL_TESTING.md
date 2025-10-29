# 🧪 Render Email Testing Guide

## 🚀 How to Test Email Sending on Render

### Method 1: Health Check API (Quick Test)

After deploying to Render, test the email service health:

```bash
# Replace YOUR_RENDER_URL with your actual Render app URL
curl https://YOUR_RENDER_URL.onrender.com/api/health/email
```

**Expected Response:**
```json
{
  "status": "ok",
  "services": {
    "gmail": {
      "configured": true,
      "status": "healthy",
      "priority": 1,
      "note": "Primary email service",
      "email": "your-gmail@gmail.com",
      "environment": "production"
    }
  },
  "timestamp": "2024-01-01T12:00:00.000Z",
  "recommendation": "Gmail SMTP configured - production ready"
}
```

### Method 2: Test Email Endpoint (Real Email Test)

Send a real test email through Render:

```bash
# POST request to test email endpoint
curl -X POST https://YOUR_RENDER_URL.onrender.com/api/health/test-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "your-test-email@gmail.com",
    "name": "Render Test User"
  }'
```

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Test email sent successfully!",
  "messageId": "<abc123@gmail.com>",
  "service": "Gmail-Gmail with TLS",
  "strategy": 1,
  "timestamp": "2024-01-01T12:00:00.000Z",
  "note": "Check your email inbox for the verification email"
}
```

**Expected Error Response:**
```json
{
  "success": false,
  "error": "Email service timeout. This might be a temporary issue.",
  "technicalError": "Connection timeout",
  "code": "ETIMEDOUT",
  "service": "Gmail-AllStrategiesFailed",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Method 3: User Registration Test (Full Flow)

Test through actual user registration:

```bash
# Register a new user (this will trigger email verification)
curl -X POST https://YOUR_RENDER_URL.onrender.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "username": "testuser123",
    "email": "your-test-email@gmail.com",
    "password": "testpassword123"
  }'
```

### Method 4: Render Logs Monitoring

1. **Go to Render Dashboard**
2. **Select your service**
3. **Click "Logs" tab**
4. **Look for email-related logs:**

**Success Logs:**
```
🚀 Using Render-optimized Gmail service
🔄 Trying strategy 1/3: Gmail with TLS
✅ Connection verified with Gmail with TLS
📤 Sending email via Gmail with TLS...
✅ Email sent successfully via Gmail with TLS!
📨 Message ID: <abc123@gmail.com>
```

**Failure Logs:**
```
❌ Strategy 1 (Gmail with TLS) failed: timeout
🔄 Trying strategy 2...
❌ Strategy 2 (Gmail SSL) failed: connection refused
🔄 Trying strategy 3...
💥 All strategies failed!
```

## 🔧 Troubleshooting on Render

### 1. Environment Variables Check

Verify in Render Dashboard → Environment:
- ✅ `EMAIL_USER` = your-gmail@gmail.com
- ✅ `EMAIL_PASS` = your-16-digit-app-password
- ✅ `FRONTEND_URL` = your-frontend-url
- ✅ `JWT_SECRET` = your-jwt-secret
- ✅ `NODE_ENV` = production

### 2. Common Issues & Solutions

#### Issue: "EAUTH - Authentication failed"
```bash
# Check if using App Password (not regular password)
# Verify 2FA is enabled on Gmail
# Double-check EMAIL_USER and EMAIL_PASS
```

#### Issue: "ETIMEDOUT - Connection timeout"
```bash
# This is handled automatically by multiple strategies
# Service will try 3 different connection methods
# Usually resolves on retry
```

#### Issue: "All strategies failed"
```bash
# Check Gmail account status
# Verify App Password is still valid
# Try regenerating App Password
```

### 3. Testing Commands for Different Scenarios

#### Test with different email addresses:
```bash
# Test with Gmail
curl -X POST https://YOUR_RENDER_URL.onrender.com/api/health/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@gmail.com", "name": "Gmail Test"}'

# Test with Yahoo
curl -X POST https://YOUR_RENDER_URL.onrender.com/api/health/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@yahoo.com", "name": "Yahoo Test"}'

# Test with Outlook
curl -X POST https://YOUR_RENDER_URL.onrender.com/api/health/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "test@outlook.com", "name": "Outlook Test"}'
```

## 📊 Success Indicators

### ✅ Email Service is Working:
1. Health check returns `"status": "healthy"`
2. Test email endpoint returns `"success": true`
3. You receive actual email in inbox
4. Logs show successful strategy execution
5. User registration triggers email verification

### ❌ Email Service Needs Attention:
1. Health check returns errors
2. Test email endpoint returns `"success": false`
3. No email received in inbox
4. Logs show all strategies failing
5. User registration doesn't send email

## 🚀 Production Monitoring

### Set up monitoring for:
1. **Email delivery rate** - Track success/failure ratio
2. **Strategy usage** - Which strategy works most often
3. **Response times** - How long emails take to send
4. **Error patterns** - Common failure reasons

### Render-specific monitoring:
```bash
# Check service health every 5 minutes
curl https://YOUR_RENDER_URL.onrender.com/api/health/email

# Send test email daily
curl -X POST https://YOUR_RENDER_URL.onrender.com/api/health/test-email \
  -H "Content-Type: application/json" \
  -d '{"email": "monitoring@yourdomain.com", "name": "Daily Test"}'
```

## 💡 Pro Tips for Render

1. **Cold Starts**: First email after deployment might be slower
2. **Multiple Strategies**: Service automatically handles network issues
3. **Timeout Optimization**: Configured for Render's constraints
4. **Error Recovery**: Graceful fallback mechanisms
5. **Logging**: Comprehensive logs for debugging

## 🆘 Emergency Troubleshooting

If emails completely stop working on Render:

1. **Check Render logs** for specific errors
2. **Verify environment variables** in dashboard
3. **Test health endpoint** for service status
4. **Regenerate Gmail App Password** if auth fails
5. **Contact support** with specific error messages

Your email service is designed to be resilient on Render! 🎯