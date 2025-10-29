import dotenv from 'dotenv';
dotenv.config();

console.log("🔍 Email Service Configuration Check:");
console.log("=====================================");

// Check Gmail SMTP configuration (Primary)
console.log("\n📧 Gmail SMTP Configuration:");
console.log("EMAIL_USER:", process.env.EMAIL_USER ? "✅ Set" : "❌ Missing");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Set" : "❌ Missing");

const hasGmail = process.env.EMAIL_USER && process.env.EMAIL_PASS;

// Other settings
console.log("\n🌐 Other Settings:");
console.log("FRONTEND_URL:", process.env.FRONTEND_URL || "❌ Missing");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "✅ Set" : "❌ Missing");

console.log("\n🛠️  Recommendations:");
console.log("=====================================");

if (hasGmail) {
  console.log("✅ Gmail SMTP is configured (RECOMMENDED)");
  console.log("🚀 Render-optimized service with multiple fallback strategies");
  console.log("🧪 Test: npm run test:email");
} else {
  console.log("❌ Gmail SMTP not configured");
  console.log("\n📝 Setup Gmail SMTP:");
  console.log("   1. Enable 2FA on Gmail");
  console.log("   2. Generate App Password: https://myaccount.google.com/apppasswords");
  console.log("   3. Add to .env file:");
  console.log("      EMAIL_USER=your-gmail@gmail.com");
  console.log("      EMAIL_PASS=your-16-digit-app-password");
}

if (!process.env.FRONTEND_URL) {
  console.log("\n⚠️  Add FRONTEND_URL to .env file");
}

console.log("\n🚀 Available Commands:");
console.log("=====================================");
console.log("npm run check:email      # Check configuration");
console.log("npm run test:email       # Test Render-optimized email service");
console.log("npm run dev              # Start server");
console.log("curl http://localhost:5000/api/health/email  # Check health");

console.log("\n📚 Documentation:");
console.log("=====================================");
console.log("Render Deployment: backend/RENDER_DEPLOYMENT.md");

process.exit(0);