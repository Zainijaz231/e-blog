# Render Deployment Guide - Resend Email Service

## 📧 Resend Email Service

This service uses Resend API for reliable email delivery on all cloud platforms including Render, Vercel, and others. No SMTP configuration needed!

## 🚀 Setup Instructions

### Step 1: Create Resend Account
1. Sign up at https://resend.com
2. Verify your email address
3. Go to API Keys: https://resend.com/api-keys
4. Create a new API key
5. Copy the API key (starts with `re_`)

### Step 2: Environment Variables
In your Render dashboard, add these environment variables:

```
RESEND_API_KEY=re_your_api_key_here
FRONTEND_URL=https://your-frontend-url.vercel.app
JWT_SECRET=your-jwt-secret
NODE_ENV=production
MONGODB_URI=your-mongodb-connection-string
```

## 🔧 How It Works

### Service Selection Logic
- **Resend Available**: Uses Resend API for email delivery
- **Resend Not Available**: Falls back to Ethereal test service
- **Domain Issues**: Automatically falls back to test service with helpful error message

### Resend Benefits
- ✅ **No SMTP Configuration**: Simple API calls
- ✅ **No Timeout Issues**: HTTP-based, not SMTP
- ✅ **Reliable Delivery**: 99.9% uptime
- ✅ **Free Tier**: 100 emails/day free
- ✅ **Cloud Optimized**: Works perfectly on Render, Vercel, etc.
- ✅ **Beautiful Templates**: HTML email support

## 🧪 Testing

### Local Testing
```bash
npm run test:email     # Test Resend service
npm run check:email    # Check configuration
```

### Production Testing
After deployment, test via API:
```bash
curl https://your-render-app.onrender.com/api/health/email
```

## 🛠️ Troubleshooting

### Common Issues

1. **Domain Verification (Free Tier)**
   - Free tier can only send to verified email address
   - For production: verify domain at resend.com/domains
   - Service automatically falls back to test service if domain not verified

2. **API Key Issues**
   - Check RESEND_API_KEY in Render dashboard
   - Ensure API key starts with `re_`
   - Verify API key is active in Resend dashboard

3. **Rate Limiting**
   - Free tier: 100 emails/day
   - Paid plans have higher limits
   - Service handles rate limit errors gracefully

### Success Indicators

**✅ Successful Email Sending:**
```
✅ Email sent successfully via Resend!
📨 Email ID: bfa59006-1b50-4886-b69e-72a87558ad25
🚀 Service: Resend
```

**✅ Fallback Success:**
```
⚠️  Resend domain restriction - falling back to test service
💡 For production: verify domain at resend.com/domains
🧪 Using test service as fallback
```

## 🔄 Deployment Steps

1. **Create Resend Account & Get API Key**
2. **Push Code to GitHub**
3. **Connect Repository to Render**
4. **Set Environment Variables in Render Dashboard**
5. **Deploy**
6. **Test Email Service**

## 💡 Production Tips

- **Domain Verification**: For production, verify your domain at resend.com/domains
- **Custom From Address**: Use your domain for professional emails
- **Monitor Usage**: Check Resend dashboard for email statistics
- **Upgrade Plan**: Consider paid plan for higher limits

## 🆘 Support

If emails still don't work:
1. Check Render logs for specific errors
2. Verify RESEND_API_KEY is correctly set
3. Test API key in Resend dashboard
4. Check domain verification status
5. Contact support with specific error messages

The service is designed to be reliable and handle various edge cases gracefully, ensuring your users can always register successfully.