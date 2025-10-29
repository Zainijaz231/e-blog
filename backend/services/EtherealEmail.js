import nodemailer from 'nodemailer';
import dotenv from "dotenv";
dotenv.config();

// Ethereal Email - Free testing service (emails don't actually send)
let testAccount = null;
let transporter = null;

const createEtherealTransporter = async () => {
  if (!testAccount) {
    // Create test account (free, no signup required)
    testAccount = await nodemailer.createTestAccount();
    console.log("🧪 Ethereal Test Account Created:");
    console.log("📧 Email:", testAccount.user);
    console.log("🔑 Password:", testAccount.pass);
    console.log("🌐 Preview URL will be shown after sending");
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: testAccount.smtp.host,
      port: testAccount.smtp.port,
      secure: testAccount.smtp.secure,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }

  return transporter;
};

export const verifyEmailEthereal = async (toEmail, token, name = "User") => {
  console.log("🧪 Starting Ethereal email test...");
  console.log("📧 To:", toEmail);
  console.log("👤 Name:", name);

  const verificationLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/verify-email/${token}`;

  try {
    const transporter = await createEtherealTransporter();

    const mailOptions = {
      from: '"E-Blog Test" <test@e-blog.com>',
      to: toEmail,
      subject: "Verify Your Email - E-Blog (TEST)",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 2px dashed #ff6b6b; padding: 20px;">
          <div style="background: #ff6b6b; color: white; padding: 20px; text-align: center; margin: -20px -20px 20px -20px;">
            <h1>🧪 TEST EMAIL - E-Blog</h1>
            <p>This is a test email using Ethereal service</p>
          </div>
          
          <h2>Hello ${name}!</h2>
          <p>This is a test verification email. In production, this would verify your account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="display: inline-block; padding: 12px 30px; background: #ff6b6b; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Verify Email (TEST)
            </a>
          </div>
          
          <p>Verification Link: <br><code>${verificationLink}</code></p>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>⚠️ This is a test email!</strong><br>
            No actual email was sent. Check the console for the preview URL.
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);

    // Get preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    
    console.log("✅ Test email sent!");
    console.log("📨 Message ID:", info.messageId);
    console.log("🔗 Preview URL:", previewUrl);
    console.log("👆 Open this URL to see the email");

    return { 
      success: true, 
      messageId: info.messageId,
      previewUrl: previewUrl,
      testMode: true
    };
    
  } catch (err) {
    console.error("❌ Ethereal email failed:", err.message);
    return { 
      success: false, 
      error: "Test email service failed",
      technicalError: err.message
    };
  }
};