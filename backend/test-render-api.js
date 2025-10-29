import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

// Test Render API endpoints (can be used locally or on Render)
const testRenderAPI = async () => {
  // Change this to your Render URL when deployed
  const BASE_URL = process.env.RENDER_URL || 'http://localhost:5000';
  const TEST_EMAIL = 'ijazzain219@gmail.com'; // Change to your email
  
  console.log("🧪 Testing Render Email API...");
  console.log("================================");
  console.log("🌐 Base URL:", BASE_URL);
  console.log("📧 Test Email:", TEST_EMAIL);
  console.log("");

  try {
    // Test 1: Health Check
    console.log("1️⃣ Testing Health Check...");
    console.log("GET /api/health/email");
    
    const healthResponse = await fetch(`${BASE_URL}/api/health/email`);
    const healthData = await healthResponse.json();
    
    console.log("Status:", healthResponse.status);
    console.log("Response:", JSON.stringify(healthData, null, 2));
    
    if (healthData.status === 'ok' && healthData.services?.gmail?.configured) {
      console.log("✅ Health check passed - Gmail configured");
    } else {
      console.log("⚠️ Health check shows issues");
    }
    
    console.log("\n" + "=".repeat(50) + "\n");

    // Test 2: Test Email Endpoint
    console.log("2️⃣ Testing Email Sending...");
    console.log("POST /api/health/test-email");
    
    const emailResponse = await fetch(`${BASE_URL}/api/health/test-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: TEST_EMAIL,
        name: 'API Test User'
      })
    });
    
    const emailData = await emailResponse.json();
    
    console.log("Status:", emailResponse.status);
    console.log("Response:", JSON.stringify(emailData, null, 2));
    
    if (emailData.success) {
      console.log("✅ Test email sent successfully!");
      console.log("📨 Message ID:", emailData.messageId);
      console.log("🚀 Service:", emailData.service);
      console.log("🎯 Strategy:", emailData.strategy);
      console.log("🎉 Check your email inbox!");
    } else {
      console.log("❌ Test email failed:");
      console.log("Error:", emailData.error);
      console.log("Technical:", emailData.technicalError);
      console.log("Code:", emailData.code);
    }
    
    console.log("\n" + "=".repeat(50) + "\n");

    // Test 3: User Registration (Full Flow)
    console.log("3️⃣ Testing User Registration Flow...");
    console.log("POST /api/auth/register");
    
    const registerResponse = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'API Test User',
        username: 'apitest' + Date.now(),
        email: TEST_EMAIL,
        password: 'testpassword123'
      })
    });
    
    const registerData = await registerResponse.json();
    
    console.log("Status:", registerResponse.status);
    console.log("Response:", JSON.stringify(registerData, null, 2));
    
    if (registerResponse.status === 201) {
      console.log("✅ User registration successful!");
      console.log("📧 Verification email should be sent");
    } else if (registerResponse.status === 400 && registerData.message?.includes('already exists')) {
      console.log("ℹ️ User already exists (expected for testing)");
      console.log("📧 This would still trigger verification email in login");
    } else {
      console.log("❌ User registration failed");
    }

  } catch (error) {
    console.error("💥 API test failed:", error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log("🔧 Make sure your server is running:");
      console.log("   npm run dev (for local testing)");
      console.log("   Or check your Render deployment URL");
    }
  }
  
  console.log("\n📋 Testing Summary:");
  console.log("================================");
  console.log("1. Health Check - Tests email service configuration");
  console.log("2. Test Email - Sends actual verification email");
  console.log("3. User Registration - Tests full application flow");
  console.log("");
  console.log("💡 For Render testing:");
  console.log("   Set RENDER_URL=https://your-app.onrender.com");
  console.log("   Run: RENDER_URL=https://your-app.onrender.com node test-render-api.js");
};

// Show current configuration
console.log("📋 API Testing Configuration:");
console.log("================================");
console.log("RENDER_URL:", process.env.RENDER_URL || "http://localhost:5000 (default)");
console.log("Test Email:", "ijazzain219@gmail.com");
console.log("");

testRenderAPI().then(() => {
  console.log("🏁 API testing completed!");
  process.exit(0);
}).catch((error) => {
  console.error("💥 API testing crashed:", error);
  process.exit(1);
});