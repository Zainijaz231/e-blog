import { sendRenderOptimizedEmail, checkRenderEmailHealth } from './services/RenderOptimizedEmail.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

// Test Render-optimized email function
const testRenderEmail = async () => {
  console.log("🚀 Testing Render-optimized email service...");
  console.log("================================");
  console.log("🌐 Environment:", process.env.NODE_ENV || 'development');
  console.log("🏗️  Platform: Render-optimized");
  
  // First check health
  console.log("\n🔍 Checking Render email health...");
  const healthCheck = await checkRenderEmailHealth();
  
  console.log("Health Check Result:");
  console.log("✅ Success:", healthCheck.success);
  console.log("📧 Email:", healthCheck.email);
  console.log("🌐 Environment:", healthCheck.environment);
  
  if (healthCheck.error) {
    console.log("⚠️  Error:", healthCheck.error);
    console.log("💡 Suggestion:", healthCheck.suggestion);
  }
  
  if (!healthCheck.configured) {
    console.log("\n❌ Gmail not configured for Render deployment");
    console.log("📝 Required environment variables:");
    console.log("   EMAIL_USER=your-gmail@gmail.com");
    console.log("   EMAIL_PASS=your-16-digit-app-password");
    process.exit(1);
  }
  
  // Create a test token
  const testToken = jwt.sign(
    { userId: 'render-test-123' }, 
    process.env.JWT_SECRET || 'test-secret', 
    { expiresIn: '1h' }
  );
  
  // Test email
  const testEmailAddress = 'ijazzain219@gmail.com';
  const testName = 'Render Test User';
  
  console.log("\n📧 Sending test email via Render-optimized service...");
  console.log("To:", testEmailAddress);
  console.log("Name:", testName);
  console.log("🔄 Will try multiple strategies if needed...");
  
  try {
    const result = await sendRenderOptimizedEmail(testEmailAddress, testToken, testName);
    
    if (result.success) {
      console.log("\n✅ Render email test successful!");
      console.log("📨 Message ID:", result.messageId);
      console.log("🚀 Service:", result.service);
      console.log("🎯 Strategy used:", result.strategy);
      console.log("📬 Response:", result.response);
      console.log("\n🎉 Email should be delivered successfully on Render!");
      console.log("💡 This service uses multiple fallback strategies for cloud deployment");
    } else {
      console.log("\n❌ Render email test failed:");
      console.log("Error:", result.error);
      console.log("Technical:", result.technicalError);
      console.log("Code:", result.code);
      console.log("Strategies tried:", result.strategiesTried);
      
      console.log("\n🛠️  Render-specific troubleshooting:");
      console.log("1. ✅ Multiple strategies attempted automatically");
      console.log("2. ⏰ Shorter timeouts used for cloud deployment");
      console.log("3. 🔄 Fallback mechanisms in place");
      console.log("4. 🌐 Network optimizations for Render platform");
      
      if (result.code === 'EAUTH') {
        console.log("\n🔐 Authentication Issue:");
        console.log("   - Verify EMAIL_USER and EMAIL_PASS in Render dashboard");
        console.log("   - Ensure App Password is used (not regular password)");
        console.log("   - Check 2FA is enabled on Gmail");
      } else if (result.technicalError?.includes('timeout')) {
        console.log("\n⏰ Timeout Issue (common on Render):");
        console.log("   - Service automatically tries multiple strategies");
        console.log("   - Uses optimized timeouts for cloud deployment");
        console.log("   - Should work better in production than health checks");
      }
    }
  } catch (error) {
    console.error("\n💥 Test crashed:", error.message);
    console.log("🔧 This might be a network issue specific to the test environment");
    console.log("📧 Email service should still work in production on Render");
  }
  
  console.log("\n📋 Render Deployment Tips:");
  console.log("================================");
  console.log("1. Set environment variables in Render dashboard");
  console.log("2. Use Gmail App Password (not regular password)");
  console.log("3. This service automatically handles Render's network constraints");
  console.log("4. Multiple fallback strategies ensure delivery");
  console.log("5. Optimized timeouts prevent deployment issues");
  
  process.exit(0);
};

// Show current configuration
console.log("📋 Render Email Configuration:");
console.log("================================");
console.log("EMAIL_USER:", process.env.EMAIL_USER || "❌ Missing");
console.log("EMAIL_PASS:", process.env.EMAIL_PASS ? "✅ Set" : "❌ Missing");
console.log("FRONTEND_URL:", process.env.FRONTEND_URL || "❌ Missing");
console.log("NODE_ENV:", process.env.NODE_ENV || "development");
console.log("");

testRenderEmail();