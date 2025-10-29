import { send } from "@emailjs/nodejs";
import dotenv from "dotenv";
dotenv.config();

// ✅ Fix: Log the correct variable (PUBLIC_KEY)
console.log("Service ID:", process.env.EMAILJS_SERVICE_ID);
console.log("Template ID:", process.env.EMAILJS_TEMPLATE_ID);
console.log("Public Key:", process.env.EMAILJS_PUBLIC_KEY);
console.log("Private Key:", process.env.EMAILJS_PRIVATE_KEY ? "✓ Set" : "✗ Missing");

export const verifyEmail = async (toEmail, token, name = "User") => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;

  const templateParams = {
    name,
    verification_link: verificationLink,
    to_email: toEmail,
  };

  try {
    // ✅ For @emailjs/nodejs, the signature is:
    // send(serviceID, templateID, templateParams, options)
    const response = await send(
      process.env.EMAILJS_SERVICE_ID || "service_ae6n7dc",
      process.env.EMAILJS_TEMPLATE_ID || "template_waslfpr",
      templateParams,
      {
        publicKey: process.env.EMAILJS_PUBLIC_KEY,
        privateKey: process.env.EMAILJS_PRIVATE_KEY, // ✅ Required for Node.js
      }
    );
    console.log(`✅ Verification email sent to ${toEmail}:`, response);
    return { success: true, response };
  } catch (err) {
    console.error("❌ Failed to send email via EmailJS:", err.text || err.message || err);
    return { success: false, error: err };
  }
};