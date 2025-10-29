import { Resend } from 'resend';
import dotenv from "dotenv";
dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmailWithResend = async (toEmail, token, name = "User") => {
  console.log("📧 Starting Resend email service...");
  console.log("📧 To:", toEmail);
  console.log("👤 Name:", name);
  console.log("🌐 Environment:", process.env.NODE_ENV || 'development');

  // Validate Resend API key
  if (!process.env.RESEND_API_KEY) {
    console.error("❌ RESEND_API_KEY not found");
    return { 
      success: false, 
      error: "Resend service not configured. Please add RESEND_API_KEY to environment variables." 
    };
  }

  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;
  console.log("🔗 Verification Link:", verificationLink);

  try {
    console.log("📤 Sending email via Resend...");

    const { data, error } = await resend.emails.send({
      from: 'E-Blog <onboarding@resend.dev>', // Default Resend domain
      to: [toEmail],
      subject: 'Verify Your Email - E-Blog',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Email Verification</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            
            <!-- Header -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px;">Welcome to E-Blog! 🎉</h1>
            </div>
            
            <!-- Content -->
            <div style="padding: 30px;">
              <h2 style="color: #333; margin-top: 0;">Hello ${name}!</h2>
              <p style="font-size: 16px; margin-bottom: 20px;">
                Thank you for registering with E-Blog. Please verify your email address to activate your account:
              </p>
              
              <!-- Verification Button -->
              <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" 
                   style="display: inline-block; padding: 15px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">
                  Verify Email Address
                </a>
              </div>
              
              <!-- Alternative Link -->
              <p style="font-size: 14px; color: #666;">
                If the button doesn't work, copy and paste this link:
              </p>
              <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; word-break: break-all; font-family: monospace; font-size: 14px;">
                ${verificationLink}
              </div>
              
              <!-- Important Note -->
              <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
                <p style="margin: 0; font-weight: bold; color: #856404;">
                  ⚠️ This link expires in 1 hour for security.
                </p>
              </div>
              
              <p style="font-size: 14px; color: #666; margin-top: 30px;">
                If you didn't create this account, please ignore this email.
              </p>
            </div>
            
            <!-- Footer -->
            <div style="background: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #eee;">
              <p style="margin: 0; font-size: 12px; color: #666;">
                This email was sent by E-Blog. Please do not reply to this email.
              </p>
              <p style="margin: 5px 0 0 0; font-size: 12px; color: #666;">
                &copy; ${new Date().getFullYear()} E-Blog. All rights reserved.
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${name}!
        
        Welcome to E-Blog! Thank you for registering.
        
        Please verify your email address by clicking this link:
        ${verificationLink}
        
        This link will expire in 1 hour for security reasons.
        
        If you didn't create this account, please ignore this email.
        
        Best regards,
        E-Blog Team
      `
    });

    if (error) {
      console.error("❌ Resend API error:", error);
      
      let userError = "Failed to send verification email. Please try again.";
      
      if (error.message?.includes('API key')) {
        userError = "Email service configuration error. Please contact support.";
      } else if (error.message?.includes('rate limit')) {
        userError = "Too many emails sent. Please try again in a few minutes.";
      } else if (error.message?.includes('domain')) {
        userError = "Email service domain error. Please contact support.";
      }
      
      return { 
        success: false, 
        error: userError,
        technicalError: error.message,
        service: 'Resend'
      };
    }

    console.log("✅ Email sent successfully via Resend!");
    console.log("📨 Email ID:", data.id);

    return { 
      success: true, 
      messageId: data.id,
      service: 'Resend'
    };
    
  } catch (err) {
    console.error("❌ Resend service failed:");
    console.error("Error:", err.message);
    
    let userError = "Failed to send verification email. Please try again.";
    
    if (err.message?.includes('API key')) {
      userError = "Email service not configured properly. Please contact support.";
    } else if (err.message?.includes('network') || err.message?.includes('timeout')) {
      userError = "Network error. Please check your internet connection and try again.";
    }
    
    return { 
      success: false, 
      error: userError,
      technicalError: err.message,
      service: 'Resend'
    };
  }
};

// Health check for Resend service
export const checkResendHealth = async () => {
  try {
    if (!process.env.RESEND_API_KEY) {
      return {
        success: false,
        error: "RESEND_API_KEY not configured",
        configured: false
      };
    }

    // Simple API key validation
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey.startsWith('re_')) {
      return {
        success: false,
        error: "Invalid Resend API key format",
        configured: false
      };
    }

    return { 
      success: true, 
      message: 'Resend service is configured and ready',
      configured: true,
      apiKeyPrefix: apiKey.substring(0, 8) + '...'
    };
  } catch (error) {
    return { 
      success: false, 
      error: `Resend configuration error: ${error.message}`,
      configured: false
    };
  }
};