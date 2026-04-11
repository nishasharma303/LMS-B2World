import nodemailer from "nodemailer";
import { env } from "../config/env.js";

let transporter = null;

if (env.emailUser && env.emailPass) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: env.emailUser,
      pass: env.emailPass,
    },
  });
}

export const sendEmail = async ({ to, subject, html }) => {
  try {
    if (!transporter) {
      console.log("Email transporter not configured. Skipping real email send.");
      console.log("To:", to);
      console.log("Subject:", subject);
      console.log("HTML:", html);

      return {
        success: false,
        skipped: true,
      };
    }

    await transporter.sendMail({
      from: `"B2World LMS" <${env.emailUser}>`,
      to,
      subject,
      html,
    });

    return {
      success: true,
      skipped: false,
    };
  } catch (error) {
    console.error("Email sending error:", error);
    return {
      success: false,
      skipped: false,
      error: error.message,
    };
  }
};