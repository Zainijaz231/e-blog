import emailjs from "emailjs-com";
import dotenv from "dotenv";
dotenv.config();

export const verifyEmail = async (toEmail, token, name = "User") => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const templateParams = {
    name,
    verification_link: verificationLink,
    to_email: toEmail,
  };

  try {
    const response = await emailjs.send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams,
      process.env.EMAILJS_USER_ID
    );
    console.log(`✅ Verification email sent to ${toEmail}:`, response.status, response.text);
  } catch (err) {
    console.error("❌ Failed to send email via EmailJS:", err);
  }
};
