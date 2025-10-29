import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

// Simple Gmail service specifically for production deployment
export const sendProductionEmail = async (toEmail, token, name = "User") => {
  console.log("📧 Starting production Gmail service...");
  console.log("📧 To:", toEmail);
  console.log("👤 Name:", name);
  console.log("🌐 Environment: PRODUCTION");

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Gmail credentials missing");
    return { 
      success: false, 
      error: "Gmail service not configured" 
    };
  }

  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;
  console.log("🔗 Verification Link:", verificationLink);

  try {
    // Simple, reliable Gmail configuration for production
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Production-optimized settings
      pool: false, // Disable pooling for serverless
      maxConnections: 1,
      rateDelta: 1000,
      rateLimit: 1,
    });

    console.log("🔌 Verifying Gmail connection...");
    await transporter.verify();
    console.log("✅ Gmail connection verified");

    const mailOptions = {
      from: `"E-Blog Team" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Verify Your Email - E-Blog",
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
                &copy; ${new Date().getFullYear()} E-Blog. All rights reserved.
              </p>
            </div>
            
          </div>
        </body>
        </html>
      `,
      text: `
        Hello ${name}!
        
        Welcome to E-Blog! Please verify your email address:
        ${verificationLink}
        
        This link expires in 1 hour.
        
        If you didn't create this account, please ignore this email.
        
        Best regards,
        E-Blog Team
      `
    };

    console.log("📤 Sending email via Gmail...");
    const info = await transporter.sendMail(mailOptions);

    console.log("✅ Email sent successfully via Gmail!");
    console.log("📨 Message ID:", info.messageId);

    // Close transporter
    transporter.close();

    return { 
      success: true, 
      messageId: info.messageId,
      response: info.response,
      service: 'Gmail-Production'
    };
    
  } catch (err) {
    console.error("❌ Production Gmail failed:");
    console.error("Error:", err.message);
    console.error("Code:", err.code);
    
    let userError = "Failed to send verification email. Please try again.";
    
    if (err.code === 'EAUTH') {
      console.error("🔐 Gmail authentication failed");
      userError = "Email authentication failed. Please contact support.";
    } else if (err.code === 'ETIMEDOUT') {
      console.error("⏰ Connection timeout");
      userError = "Email service timeout. Please try again.";
    } else if (err.code === 'ECONNECTION' || err.code === 'ENOTFOUND') {
      console.error("🌐 Cannot connect to Gmail servers");
      userError = "Cannot connect to email service. Please check your internet connection.";
    }
    
    return { 
      success: false, 
      error: userError,
      technicalError: err.message,
      code: err.code,
      service: 'Gmail-Production'
    };
  }
};