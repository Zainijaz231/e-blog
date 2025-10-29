import dotenv from "dotenv";
dotenv.config();

// Simple test email service that doesn't require external connections
export const sendSimpleTestEmail = async (toEmail, token, name = "User") => {
  console.log("🧪 Starting simple test email service...");
  console.log("📧 To:", toEmail);
  console.log("👤 Name:", name);

  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;
  
  // Simulate email sending without external connections
  console.log("📧 ✅ Test email 'sent' successfully!");
  console.log("🔗 Verification Link:", verificationLink);
  console.log("📝 Email Content Preview:");
  console.log("   Subject: Verify Your Email - E-Blog");
  console.log("   To:", toEmail);
  console.log("   From: E-Blog Team");
  console.log("   Content: Welcome " + name + "! Please verify your email.");
  console.log("   Link:", verificationLink);
  console.log("");
  console.log("💡 This is a test mode - no actual email was sent");
  console.log("🔧 For production emails, configure Resend with verified domain");

  return { 
    success: true, 
    messageId: 'test-' + Date.now(),
    service: 'SimpleTest',
    testMode: true,
    verificationLink: verificationLink,
    note: 'Test mode - no actual email sent'
  };
};