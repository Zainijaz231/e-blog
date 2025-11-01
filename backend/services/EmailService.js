import { sendEmailWithResend, checkResendHealth } from './ResendEmailService.js';
import { sendSimpleTestEmail } from './SimpleTestEmail.js';
import dotenv from "dotenv";
dotenv.config();

// Smart email service - Resend primary with fallback
export const sendVerificationEmail = async (toEmail, token, name = "User") => {
  console.log("🔍 Selecting email service...");
  console.log("🌐 Environment:", process.env.NODE_ENV || 'development');
  
  const hasResendConfig = process.env.RESEND_API_KEY;
  const isProduction = process.env.NODE_ENV === 'production';
  
  console.log("🔧 Service availability:");
  console.log("   Resend API Key:", hasResendConfig ? "✅ Configured" : "❌ Missing");
  console.log("   Environment:", isProduction ? "Production" : "Development");
  
  if (hasResendConfig) {
    console.log("📧 Trying Resend email service...");
    
    // Try Resend first
    const resendResult = await sendEmailWithResend(toEmail, token, name);
    
    // If Resend fails due to domain/verification issues, fallback to simple test service
    if (!resendResult.success && resendResult.technicalError?.includes('domain')) {
      console.log("⚠️  Resend domain restriction - falling back to simple test service");
      console.log("💡 For production: verify domain at resend.com/domains");
      
      const fallbackResult = await sendSimpleTestEmail(toEmail, token, name);
      return {
        ...fallbackResult,
        service: 'SimpleTest-Fallback',
        originalError: resendResult.technicalError,
        note: 'Resend domain not verified - using simple test service'
      };
    }
    
    return resendResult;
  } else {
    console.log("🧪 Resend not configured, using simple test service");
    console.log("💡 Add RESEND_API_KEY for production email delivery");
    return await sendSimpleTestEmail(toEmail, token, name);
  }
};

// Health check for available services
export const checkAvailableServices = async () => {
  const services = {
    resend: {
      configured: !!process.env.RESEND_API_KEY,
      status: 'unknown',
      priority: 1,
      note: 'Primary email service - reliable & fast'
    },
    simpletest: {
      configured: true, // Always available
      status: 'available',
      priority: 2,
      note: 'Simple test service (no external connections needed)'
    }
  };

  // Test Resend if configured
  if (services.resend.configured) {
    try {
      const result = await checkResendHealth();
      services.resend.status = result.success ? 'healthy' : 'unhealthy';
      services.resend.error = result.error;
      services.resend.apiKeyPrefix = result.apiKeyPrefix;
      services.resend.message = result.message;
    } catch (error) {
      services.resend.status = 'error';
      services.resend.error = error.message;
    }
  }

  return services;
};