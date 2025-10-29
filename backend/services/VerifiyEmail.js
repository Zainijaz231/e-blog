import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

export const verifyEmail = async (toEmail, token, name = "User") => {
  console.log("🔍 Starting email verification process...");
  console.log("📧 To:", toEmail);
  console.log("👤 Name:", name);
  console.log("🔑 EMAIL_USER:", process.env.EMAIL_USER ? "✓ Set" : "✗ Missing");
  console.log("🔑 EMAIL_PASS:", process.env.EMAIL_PASS ? "✓ Set" : "✗ Missing");
  console.log("🌐 FRONTEND_URL:", process.env.FRONTEND_URL || "✗ Missing");

  const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;
  console.log("🔗 Verification Link:", verificationLink);

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    console.log("📮 Transporter created, attempting to send email...");

    // Send email
    const info = await transporter.sendMail({
      from: `"E-Blog Verification" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Verify Your Email - E-Blog",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
                     color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .button { display: inline-block; padding: 12px 30px; background: #667eea; 
                     color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to E-Blog! 🎉</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for registering. Please verify your email address to activate your account.</p>
              <p style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify Email Address</a>
              </p>
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; color: #667eea;">${verificationLink}</p>
              <p><strong>Note:</strong> This link will expire in 1 hour.</p>
            </div>
            <div class="footer">
              <p>If you didn't create an account, please ignore this email.</p>
              <p>&copy; 2025 E-Blog. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log(`✅ Verification email sent successfully!`);
    console.log("📨 Message ID:", info.messageId);
    console.log("📬 Response:", info.response);
    return { success: true, messageId: info.messageId };
    
  } catch (err) {
    console.error("❌ Failed to send verification email");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    console.error("Full error:", err);
    return { success: false, error: err.message };
  }
};