import { send } from "@emailjs/nodejs";
import dotenv from "dotenv";
dotenv.config();

console.log(process.env.EMAILJS_SERVICE_ID ,process.env.EMAILJS_TEMPLATE_ID, process.env.EMAILJS_PRIVATE_KEY );


export const verifyEmail = async (toEmail, token, name = "User") => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const templateParams = {
    name,
    verification_link: verificationLink,
    to_email: toEmail,
  };

  try {
    const response = await send(
      process.env.EMAILJS_SERVICE_ID,
      process.env.EMAILJS_TEMPLATE_ID,
      templateParams,
      process.env.EMAILJS_PRIVATE_KEY
    );
    console.log(`✅ Verification email sent to ${toEmail}:`, response);
  } catch (err) {
    console.error("❌ Failed to send email via EmailJS:", err);
  }
};
