import { sendEmailWithResend, checkResendHealth } from './services/ResendEmailService.js';
import { sendVerificationEmail } from './services/EmailService.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Test Resend email function
const testResendEmail = async () => {
  console.log("📧 Testing Resend Email Service...");
  console.log("================================");
  
  // First check Resend health
  console.log("🔍 Checking Resend configuration...");
  const healthCheck = await checkResendHealth();
  
  if (!healthCheck.success) {
    console.log("❌ Resend not properly configured:");
    console.log("Error:", healthCheck.error);
    console.log("\n📝 Setup Instructions:");
    console.log("1. Sign up at https://resend.com");
    console.log("2. Get API key from https://resend.com/api-keys");
    console.log("3. Add to .env file: RESEND_API_KEY=re_your_api_key_here");
    process.exit(1);
  }
  
  console.log("✅ Resend configuration looks good!");
  console.log("📧 API Key:", healthCheck.apiKeyPrefix);
  
  // Create a test token
  const testToken = jwt.sign(
    { userId: 'resend-test-123' }, 
    process.env.JWT_SECRET || 'test-secret', 
    { expiresIn: '1h' }
  );
  
  // Use the verified email address for testing
  const testEmailAddress = 'neoanimeverse@gmail.com'; // This is the verified email
  const testName = 'Resend Test User';
  
  console.log("\n📧 Testing direct Resend service...");
  console.log("To:", testEmailAddress);
  console.log("Name:", testName);
  
  try {
    // Test Resend service directly
    const result = await sendEmailWithResend(testEmailAddress, testToken, testName);
    
    if (result.success) {
      console.log("\n✅ Resend email test successful!");
      console.log("📨 Email ID:", result.messageId);
      console.log("🚀 Service:", result.service);
      console.log("\n🎉 Email sent successfully! Check your inbox!");
    } else {
      console.log("\n❌ Resend email test failed:");
      console.log("Error:", result.error);
      console.log("Technical:", result.technicalError);
      
      console.log("\n🛠️  Troubleshooting:");
      console.log("1. Check RESEND_API_KEY in .env file");
      console.log("2. Verify API key is valid at https://resend.com/api-keys");
      console.log("3. Check Resend dashboard for any issues");
    }
  } catch (error) {
    console.error("\n💥 Resend test crashed:", error.message);
  }
  
  console.log("\n" + "=".repeat(50));
  
  console.log("\n" + "=".repeat(50));
  
  // Test smart service selector
  console.log("\n🧠 Testing smart service selector...");
  console.log("Current NODE_ENV:", process.env.NODE_ENV || 'development');
  
  try {
    const smartResult = await sendVerificationEmail(testEmailAddress, testToken, testName);
    
    if (smartResult.success) {
      console.log("\n✅ Smart service test successful!");
      console.log("📨 Message ID:", smartResult.messageId);
      console.log("🚀 Service:", smartResult.service);
      
      if (smartResult.testMode) {
        console.log("🧪 Test mode - check console for preview URL");
        console.log("🔗 Preview URL:", smartResult.previewUrl);
      }
    } else {
      console.log("\n❌ Smart service test failed:");
      console.log("Error:", smartResult.error);
    }
  } catch (error) {
    console.error("\n💥 Smart service test crashed:", error.message);
  }
  
  console.log("\n📋 Summary:");
  console.log("================================");
  console.log("📧 Resend Service: Reliable, fast, no SMTP issues");
  console.log("🧪 Test Service: For development when Resend not configured");
  console.log("🚀 Works perfectly on Render, Vercel, and all cloud platforms");
  console.log("💡 No timeout issues, no complex configuration needed");
  
  process.exit(0);
};

// Show current configuration
console.log("📋 Resend Email Configuration:");
console.log("================================");
console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "✅ Set" : "❌ Missing");
console.log("FRONTEND_URL:", process.env.FRONTEND_URL || "❌ Missing");
console.log("NODE_ENV:", process.env.NODE_ENV || "development");
console.log("");

testResendEmail();