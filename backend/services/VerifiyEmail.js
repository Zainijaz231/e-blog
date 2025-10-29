import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

// Retry function for handling temporary failures
const sendWithRetry = async (transporter, mailOptions, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await transporter.sendMail(mailOptions);
      return result;
    } catch (err) {
      if (i === retries - 1) throw err; // Last retry
      
      if (err.code === 'ETIMEDOUT' || err.code === 'ECONNECTION' || err.code === 'ECONNRESET') {
        console.log(`🔄 Retry ${i + 1}/${retries} after connection error...`);
        await new Promise(resolve => setTimeout(resolve, 2000 * (i + 1))); // Exponential backoff
        continue;
      }
      throw err;
    }
  }
};

export const verifyEmail = async (toEmail, token, name = "User") => {
  console.log("🔍 Starting email verification process...");
  console.log("📧 To:", toEmail);
  console.log("👤 Name:", name);
  console.log("🔑 EMAIL_USER:", process.env.EMAIL_USER ? "✓ Set" : "✗ Missing");
  console.log("🔑 EMAIL_PASS:", process.env.EMAIL_PASS ? "✓ Set" : "✗ Missing");
  console.log("🌐 FRONTEND_URL:", process.env.FRONTEND_URL || "✗ Missing");

  // Validate required environment variables
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Missing required environment variables: EMAIL_USER or EMAIL_PASS");
    return { 
      success: false, 
      error: "Email service not configured properly. Please check environment variables." 
    };
  }

  if (!process.env.FRONTEND_URL) {
    console.warn("⚠️ FRONTEND_URL not set, using fallback for verification link");
  }

  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;
  console.log("🔗 Verification Link:", verificationLink);

  try {
    // Create transporter with enhanced configuration
    const transporter = nodemailer.createTransport({
      // Option 1: Explicit SMTP settings (more reliable)
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      requireTLS: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      // Timeout settings
      connectionTimeout: 30000, // 30 seconds
      socketTimeout: 30000,     // 30 seconds
      greetingTimeout: 30000,   // 30 seconds
      // TLS settings
      tls: {
        rejectUnauthorized: false // Helps with certificate issues
      },
      // Debug and logging
      debug: process.env.NODE_ENV !== 'production', // Enable debug in non-production
      logger: process.env.NODE_ENV !== 'production' // Enable logger in non-production
    });

    console.log("📮 Transporter created, testing connection...");

    // Verify connection configuration
    await transporter.verify();
    console.log("✅ SMTP connection verified successfully");

    // Email options
    const mailOptions = {
      from: `"E-Blog Verification" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: "Verify Your Email - E-Blog",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { 
              font-family: 'Arial', sans-serif; 
              line-height: 1.6; 
              color: #333; 
              margin: 0; 
              padding: 0; 
              background-color: #f4f4f4;
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white;
            }
            .header { 
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
              color: white; 
              padding: 40px 30px; 
              text-align: center; 
            }
            .header h1 {
              margin: 0;
              font-size: 28px;
            }
            .content { 
              padding: 40px 30px; 
            }
            .button { 
              display: inline-block; 
              padding: 14px 35px; 
              background: #667eea; 
              color: white; 
              text-decoration: none; 
              border-radius: 5px; 
              margin: 25px 0; 
              font-size: 16px;
              font-weight: bold;
            }
            .button:hover {
              background: #5a6fd8;
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              color: #666; 
              font-size: 12px; 
              padding: 20px;
              border-top: 1px solid #eee;
            }
            .link-text {
              word-break: break-all; 
              color: #667eea;
              background: #f9f9f9;
              padding: 15px;
              border-radius: 5px;
              border-left: 4px solid #667eea;
              margin: 15px 0;
            }
            .note {
              background: #fff3cd;
              padding: 10px 15px;
              border-radius: 5px;
              border-left: 4px solid #ffc107;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to E-Blog! 🎉</h1>
            </div>
            <div class="content">
              <h2>Hello ${name}!</h2>
              <p>Thank you for registering with E-Blog. To complete your registration and activate your account, please verify your email address by clicking the button below:</p>
              
              <p style="text-align: center;">
                <a href="${verificationLink}" class="button">Verify Email Address</a>
              </p>
              
              <p>If the button doesn't work, copy and paste this link into your browser:</p>
              <p class="link-text">${verificationLink}</p>
              
              <div class="note">
                <p><strong>Note:</strong> This verification link will expire in 1 hour for security reasons.</p>
              </div>
              
              <p>If you did not create an account with E-Blog, please disregard this email.</p>
            </div>
            <div class="footer">
              <p>This is an automated message, please do not reply to this email.</p>
              <p>&copy; ${new Date().getFullYear()} E-Blog. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    console.log("📧 Attempting to send email with retry mechanism...");
    
    // Send email with retry mechanism
    const info = await sendWithRetry(transporter, mailOptions, 3);

    console.log(`✅ Verification email sent successfully!`);
    console.log("📨 Message ID:", info.messageId);
    console.log("📬 Response:", info.response);
    
    return { 
      success: true, 
      messageId: info.messageId,
      response: info.response 
    };
    
  } catch (err) {
    console.error("❌ Failed to send verification email");
    console.error("Error name:", err.name);
    console.error("Error message:", err.message);
    console.error("Error code:", err.code);
    
    // Specific error handling
    let userFriendlyError = "Failed to send verification email. Please try again.";
    
    if (err.code === 'EAUTH') {
      console.error("🔐 Authentication failed - check EMAIL_USER and EMAIL_PASS");
      console.error("💡 Make sure you're using an App Password if 2FA is enabled");
      userFriendlyError = "Email service authentication failed. Please contact support.";
    } else if (err.code === 'ETIMEDOUT') {
      console.error("⏰ Connection timed out - check network/firewall settings");
      userFriendlyError = "Email service timeout. Please try again in a moment.";
    } else if (err.code === 'ECONNECTION' || err.code === 'ECONNRESET') {
      console.error("🌐 Connection failed - cannot reach Gmail servers");
      userFriendlyError = "Cannot connect to email service. Please check your internet connection.";
    } else if (err.code === 'EMESSAGE') {
      console.error("📧 Message rejection - check email content/recipient");
      userFriendlyError = "Invalid email address. Please check the email and try again.";
    }
    
    // Log full error in development
    if (process.env.NODE_ENV !== 'production') {
      console.error("Full error:", err);
    }
    
    return { 
      success: false, 
      error: userFriendlyError,
      technicalError: err.message,
      code: err.code
    };
  }
};

// Additional utility function to check email service status
export const checkEmailService = async () => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      connectionTimeout: 10000,
      socketTimeout: 10000,
    });

    await transporter.verify();
    return { 
      success: true, 
      message: 'Email service is working properly' 
    };
  } catch (error) {
    return { 
      success: false, 
      error: `Email service error: ${error.message}`,
      code: error.code 
    };
  }
};