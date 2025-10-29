import { sendRenderOptimizedEmail, checkRenderEmailHealth } from './RenderOptimizedEmail.js';
import { sendProductionEmail } from './ProductionGmail.js';
import { sendRenderSafeEmail } from './RenderSafeEmail.js';
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
  
  console.log("🔧 Debug info:");
  console.log("   NODE_ENV:", process.env.NODE_ENV);
  console.log("   isProduction:", isProduction);
  console.log("   isRender:", !!isRender);
  console.log("   RENDER:", process.env.RENDER);
  console.log("   RENDER_SERVICE_ID:", process.env.RENDER_SERVICE_ID);
  
  if (hasGmailConfig) {
    // Use Render-safe service that handles timeouts gracefully
    if (isRender) {
      console.log("🛡️  Using Render-safe email service (with fallback)");
      return await sendRenderSafeEmail(toEmail, token, name);
    } else if (isProduction) {
      console.log("🚀 Using Production Gmail service (NODE_ENV=production)");
      return await sendProductionEmail(toEmail, token, name);
    } else {
      // Local development
      console.log("🧪 Development mode - using Ethereal test service");
      console.log("💡 Set NODE_ENV=production for Gmail, or deploy to Render for safe Gmail");
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