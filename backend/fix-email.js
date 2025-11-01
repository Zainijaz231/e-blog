import dotenv from 'dotenv';
dotenv.config();

console.log("🔍 Email Service Configuration Check:");
console.log("=====================================");

// Check Resend configuration (Primary)
console.log("\n📧 Resend Email Service:");
console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "✅ Set" : "❌ Missing");

const hasResend = process.env.RESEND_API_KEY;

// Other settings
console.log("\n🌐 Other Settings:");
console.log("FRONTEND_URL:", process.env.FRONTEND_URL || "❌ Missing");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Set" : "❌ Missing");

console.log("\n🛠️  Recommendations:");
console.log("=====================================");

if (hasResend) {
  console.log("✅ Resend is configured (RECOMMENDED)");
  console.log("🚀 Reliable email service - works great on all platforms!");
  console.log("🧪 Test: npm run test:email");
} else {
  console.log("❌ Resend not configured");
  console.log("\n📝 Setup Resend (Recommended):");
  console.log("   1. Sign up at https://resend.com");
  console.log("   2. Get API key from https://resend.com/api-keys");
  console.log("   3. Add to .env file:");
  console.log("      RESEND_API_KEY=re_your_api_key_here");
  console.log("\n💡 Benefits of Resend:");
  console.log("   ✅ No SMTP configuration needed");
  console.log("   ✅ Works perfectly on Render/Vercel");
  console.log("   ✅ 100 emails/day free tier");
  console.log("   ✅ No timeout issues");
}

if (!process.env.FRONTEND_URL) {
  console.log("\n⚠️  Add FRONTEND_URL to .env file");
}

console.log("\n🚀 Available Commands:");
console.log("=====================================");
console.log("npm run check:email      # Check configuration");
console.log("npm run test:email       # Test Resend email service");
console.log("npm run dev              # Start server");
console.log("curl http://localhost:5000/api/health/email  # Check health");

console.log("\n📚 Setup Guide:");
console.log("=====================================");
console.log("1. Sign up at https://resend.com");
console.log("2. Get API key from dashboard");
console.log("3. Add RESEND_API_KEY to .env file");
console.log("4. Deploy to Render with same environment variable");

process.exit(0);