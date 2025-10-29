import { sendRenderOptimizedEmail, checkRenderEmailHealth } from './RenderOptimizedEmail.js';
import { sendProductionEmail } from './ProductionGmail.js';
import { verifyEmailEthereal } from './EtherealEmail.js';
import dotenv from "dotenv";
dotenv.config();

// Smart email service - environment-aware selection
export const sendVerificationEmail = async (toEmail, token, name = "User") => {
  console.log("🔍 Selecting email service...");
  console.log("🌐 Environment:", process.env.NODE_ENV || 'development');
  
  const hasGmailConfig = process.env.EMAIL_USER && process.env.EMAIL_PASS;
  const isProduction = process.env.NODE_ENV === 'production';
  const isRender = process.env.RENDER || process.env.RENDER_SERVICE_ID;
  
  if (hasGmailConfig) {
    // In production, use simple reliable Gmail service
    if (isProduction || isRender) {
      console.log("🚀 Using Production Gmail service (Production Environment)");
      return await sendProductionEmail(toEmail, token, name);
    } else {
      // In development, always use test service to avoid timeouts
      console.log("🧪 Development mode - using Ethereal test service");
      console.log("💡 Gmail will be used automatically in production (NODE_ENV=production)");
      return await verifyEmailEthereal(toEmail, token, name);
    }
  } else {
    console.log("🧪 Gmail not configured, using Ethereal test service");
    console.log("⚠️  Configure Gmail SMTP for production");
    return await verifyEmailEthereal(toEmail, token, name);
  }
};

// Health check for available services
export const checkAvailableServices = async () => {
  const services = {
    gmail: {
      configured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
      status: 'unknown',
      priority: 1,
      note: 'Primary email service'
    },
    ethereal: {
      configured: true, // Always available
      status: 'available',
      priority: 2,
      note: 'Test service (emails not actually sent)'
    }
  };

  // Test Gmail if configured
  if (services.gmail.configured) {
    try {
      const result = await checkRenderEmailHealth();
      services.gmail.status = result.success ? 'healthy' : 'unhealthy';
      services.gmail.error = result.error;
      services.gmail.email = result.email;
      services.gmail.code = result.code;
      services.gmail.suggestion = result.suggestion;
      services.gmail.environment = result.environment;
    } catch (error) {
      services.gmail.status = 'error';
      services.gmail.error = error.message;
    }
  }

  return services;
};