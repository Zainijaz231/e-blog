import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.Email_USER,
    pass: process.env.Email_PASS, // App Password
  },
});

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

  try {
    const info = await transporter.sendMail({
      from: `"Dreavix eBlog" <${process.env.Email_USER}>`,
      to,
      subject: "Verify Your Email Address",
      html: htmlContent,
    });
    console.log(`✅ Verification email sent to ${to}`);
    console.log("Gmail response:", info);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};

export { verifyEmail };
