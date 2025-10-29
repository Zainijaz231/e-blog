import nodemailer from "nodemailer";
import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config({ path: "./.env" });

// Debug logs
console.log("Email_USER:", process.env.Email_USER);
console.log("Email_PASS:", process.env.Email_PASS ? "Loaded ✅" : "Missing ❌");
console.log("RESEND_API_KEY:", process.env.RESEND_API_KEY ? "Loaded ✅" : "Missing ❌");

// ✅ Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// ✅ Gmail transporter (fallback)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.Email_USER,
    pass: process.env.Email_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
  connectionTimeout: 20000,
});

// ✅ Email verification function
const verifyEmail = async (to, token) => {
  const verificationLink = `https://e-blog-theta.vercel.app/verify-email/${token}`;
  const htmlContent = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#333">
      <h2 style="color:#4F46E5">Verify Your Email</h2>
      <p>Click below to confirm your email address:</p>
      <a href="${verificationLink}"
         style="background:#4F46E5;color:#fff;padding:10px 18px;
         border-radius:6px;text-decoration:none;">
         Verify Email
      </a>
      <p>If you didn't create an account, please ignore this message.</p>
    </div>
  `;

  // Try Resend first
  try {
    await resend.emails.send({
      from: "Dreavix eBlog <noreply@dreavix.com>",
      to,
      subject: "Verify Your Email Address",
      html: htmlContent,
    });
    console.log(`✅ Email sent via Resend to ${to}`);
  } catch (resendError) {
    console.warn("⚠️ Resend failed, using Gmail instead...", resendError.message);

    try {
      const mailOptions = {
        from: `"Dreavix eBlog" <${process.env.Email_USER}>`,
        to,
        subject: "Verify Your Email Address",
        html: htmlContent,
      };

      await transporter.sendMail(mailOptions);
      console.log(`✅ Verification email sent via Gmail to ${to}`);
    } catch (gmailError) {
      console.error("❌ Gmail fallback also failed:", gmailError.message);
      throw new Error("Could not send verification email via Resend or Gmail");
    }
  }
};

export { verifyEmail };
