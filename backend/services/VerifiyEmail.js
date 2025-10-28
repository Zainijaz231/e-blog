import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config(
  {
    path: './.env'
  }
);

console.log("Email_USER:", process.env.Email_USER);
console.log("Email_PASS:", process.env.Email_PASS ? "Loaded ✅" : "Missing ❌");

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.Email_USER,
    pass: process.env.Email_PASS,
  },
});

const verifyEmail = async (to, token) => {
  const verificationLink = `https://e-blog-theta.vercel.app/verify-email/${token}`;

  const mailOptions = {
    from: process.env.Email_USER,
    to,
    subject: 'Verify Your Email Address',
    html: `
      <h1>Email Verification</h1>
      <p>Please click the link below to verify your email address:</p>
      <a href="${verificationLink}">Verify Email</a>
      <p>If you did not request this, please ignore this email.</p>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ Verification email sent to ${to}`);
  } catch (error) {
    console.error(`❌ Error sending verification email to ${to}:`, error);
    throw new Error('Could not send verification email');
  }
};

export { verifyEmail };