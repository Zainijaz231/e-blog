import EmailJS from "@emailjs/nodejs";
import dotenv from "dotenv";
dotenv.config();

const client = new EmailJS({
  publicKey: process.env.EMAILJS_USER_ID,
  privateKey: process.env.EMAILJS_PRIVATE_KEY, // optional, can be left empty
});

export const verifyEmail = async (toEmail, token, name = "User") => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const templateParams = {
    name,
    verification_link: verificationLink,
    to_email: toEmail,
  };

  try {
    const response = await client.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams
    );
    console.log(`✅ Verification email sent to ${toEmail}:`, response);
  } catch (err) {
    console.error("❌ Failed to send email via EmailJS:", err);
  }
};
