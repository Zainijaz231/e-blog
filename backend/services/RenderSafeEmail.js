import nodemailer from 'nodemailer';
import { verifyEmailEthereal } from './EtherealEmail.js';
import dotenv from "dotenv";
dotenv.config();

// Render-safe email service with timeout handling and fallback
export const sendRenderSafeEmail = async (toEmail, token, name = "User") => {
  console.log("🛡️  Starting Render-safe email service...");
  console.log("📧 To:", toEmail);
  console.log("👤 Name:", name);
  console.log("🌐 Environment:", process.env.NODE_ENV || 'development');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log("❌ Gmail not configured, using test service");
    return await verifyEmailEthereal(toEmail, token, name);
  }

  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;
  console.log("🔗 Verification Link:", verificationLink);

  // Try Gmail with aggressive timeout, fallback to test service
  try {
    console.log("🔄 Attempting Gmail with 5-second timeout...");
    
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Very aggressive settings for Render
      connectionTimeout: 5000,  // 5 seconds
      socketTimeout: 5000,      // 5 seconds
      greetingTimeout: 5000,    // 5 seconds
    });

    // Test connection with timeout
    const connectionPromise = transporter.verify();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout')), 5000)
    );

    await Promise.race([connectionPromise, timeoutPromise]);
    console.log("✅ Gmail connection successful");

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

    // Send with timeout
    const sendPromise = transporter.sendMail(mailOptions);
    const sendTimeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Send timeout')), 8000)
    );

    const info = await Promise.race([sendPromise, sendTimeoutPromise]);

    console.log("✅ Gmail email sent successfully!");
    console.log("📨 Message ID:", info.messageId);

    transporter.close();

    return { 
      success: true, 
      messageId: info.messageId,
      response: info.response,
      service: 'Gmail-RenderSafe'
    };

  } catch (error) {
    console.log("⚠️  Gmail failed on Render (expected):", error.message);
    console.log("🔄 Falling back to test service...");
    
    // Fallback to test service
    const fallbackResult = await verifyEmailEthereal(toEmail, token, name);
    
    // Mark as fallback but still successful
    return {
      ...fallbackResult,
      service: 'Ethereal-Fallback',
      originalError: error.message,
      note: 'Gmail timeout on Render - using test service as fallback'
    };
  }
};