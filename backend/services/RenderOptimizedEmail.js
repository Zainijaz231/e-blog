import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

// Render-optimized email service with fallback strategies
export const sendRenderOptimizedEmail = async (toEmail, token, name = "User") => {
  console.log("🚀 Starting Render-optimized email service...");
  console.log("📧 To:", toEmail);
  console.log("👤 Name:", name);
  console.log("🌐 Environment:", process.env.NODE_ENV || 'development');

  // Validate Gmail credentials
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Gmail credentials missing");
    return { 
      success: false, 
      error: "Email service not configured" 
    };
  }

  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;
  console.log("🔗 Verification Link:", verificationLink);

  // Try multiple strategies for Render deployment
  const strategies = [
    {
      name: "Gmail with TLS",
      config: {
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        requireTLS: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 10000, // 10 seconds for Render
        socketTimeout: 10000,
        greetingTimeout: 10000,
        tls: {
          rejectUnauthorized: false,
          ciphers: 'SSLv3'
        }
      }
    },
    {
      name: "Gmail SSL",
      config: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 8000,
        socketTimeout: 8000,
        tls: {
          rejectUnauthorized: false
        }
      }
    },
    {
      name: "Gmail Service",
      config: {
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        connectionTimeout: 6000,
        socketTimeout: 6000,
      }
    }
  ];

  for (let i = 0; i < strategies.length; i++) {
    const strategy = strategies[i];
    console.log(`🔄 Trying strategy ${i + 1}/${strategies.length}: ${strategy.name}`);

    try {
      const transporter = nodemailer.createTransport(strategy.config);

      // Quick connection test with timeout
      console.log("🔌 Testing connection...");
      const verifyPromise = transporter.verify();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 8000)
      );

      await Promise.race([verifyPromise, timeoutPromise]);
      console.log(`✅ Connection verified with ${strategy.name}`);

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

      console.log(`📤 Sending email via ${strategy.name}...`);
      
      // Send with timeout
      const sendPromise = transporter.sendMail(mailOptions);
      const sendTimeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Send timeout')), 15000)
      );

      const info = await Promise.race([sendPromise, sendTimeoutPromise]);

      console.log(`✅ Email sent successfully via ${strategy.name}!`);
      console.log("📨 Message ID:", info.messageId);

      // Close transporter
      transporter.close();

      return { 
        success: true, 
        messageId: info.messageId,
        response: info.response,
        service: `Gmail-${strategy.name}`,
        strategy: i + 1
      };

    } catch (err) {
      console.error(`❌ Strategy ${i + 1} (${strategy.name}) failed:`, err.message);
      
      // If this is the last strategy, return error
      if (i === strategies.length - 1) {
        console.error("💥 All strategies failed!");
        
        let userError = "Failed to send verification email. Please try again.";
        
        if (err.message.includes('timeout') || err.code === 'ETIMEDOUT') {
          userError = "Email service timeout. This might be a temporary issue. Please try again.";
        } else if (err.code === 'EAUTH') {
          userError = "Email authentication failed. Please contact support.";
        } else if (err.code === 'ECONNECTION' || err.code === 'ENOTFOUND') {
          userError = "Cannot connect to email service. Please try again later.";
        }
        
        return { 
          success: false, 
          error: userError,
          technicalError: err.message,
          code: err.code,
          service: 'Gmail-AllStrategiesFailed',
          strategiesTried: strategies.length
        };
      }
      
      // Continue to next strategy
      console.log(`🔄 Trying next strategy...`);
      continue;
    }
  }
};

// Health check optimized for Render
export const checkRenderEmailHealth = async () => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return {
        success: false,
        error: "Gmail credentials not configured",
        configured: false
      };
    }

    // Quick health check with timeout
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const verifyPromise = transporter.verify();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Health check timeout')), 5000)
    );

    await Promise.race([verifyPromise, timeoutPromise]);
    transporter.close();
    
    return { 
      success: true, 
      message: 'Gmail service is healthy for Render deployment',
      configured: true,
      email: process.env.EMAIL_USER,
      environment: process.env.NODE_ENV || 'development'
    };
  } catch (error) {
    return { 
      success: false, 
      error: `Gmail health check failed: ${error.message}`,
      configured: true,
      code: error.code,
      suggestion: error.message.includes('timeout') 
        ? 'Network timeout - this is common on Render. Email should still work during actual sending.'
        : 'Check Gmail credentials and App Password'
    };
  }
};