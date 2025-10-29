import { sendProductionEmail } from './services/ProductionGmail.js';
import { sendVerificationEmail } from './services/EmailService.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Test production email function
const testProductionEmail = async () => {
  console.log("🚀 Testing Production Email Service...");
  console.log("================================");
  
  // Create a test token
  const testToken = jwt.sign(
    { userId: 'production-test-123' }, 
    process.env.JWT_SECRET || 'test-secret', 
    { expiresIn: '1h' }
  );
  
  const testEmailAddress = 'ijazzain219@gmail.com';
  const testName = 'Production Test User';
  
  console.log("\n📧 Testing direct production service...");
  console.log("To:", testEmailAddress);
  console.log("Name:", testName);
  
  try {
    // Test production service directly
    const result = await sendProductionEmail(testEmailAddress, testToken, testName);
    
    if (result.success) {
      console.log("\n✅ Production email test successful!");
      console.log("📨 Message ID:", result.messageId);
      console.log("🚀 Service:", result.service);
      console.log("📬 Response:", result.response);
      console.log("\n🎉 This will work on Render!");
    } else {
      console.log("\n❌ Production email test failed:");
      console.log("Error:", result.error);
      console.log("Technical:", result.technicalError);
      console.log("Code:", result.code);
    }
  } catch (error) {
    console.error("\n💥 Production test crashed:", error.message);
  }
  
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
  console.log("🏠 Local Development: Uses test service (Ethereal)");
  console.log("🚀 Production/Render: Uses production Gmail service");
  console.log("💡 This prevents local timeout issues while ensuring production works");
  
  process.exit(0);
};

// Show current configuration
console.log("📋 Production Email Configuration:");
console.log("================================");
console.log("EMAIL_USER:", process.env.EMAIL_USER || "❌ Missing");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Set" : "❌ Missing");
console.log("FRONTEND_URL:", process.env.FRONTEND_URL || "❌ Missing");
console.log("NODE_ENV:", process.env.NODE_ENV || "development");
console.log("RENDER:", process.env.RENDER ? "✅ Render detected" : "❌ Not on Render");
console.log("");

testProductionEmail();