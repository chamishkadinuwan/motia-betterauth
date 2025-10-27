/**
 * lib/email.ts
 * Real email sending using Nodemailer for Motia + Better Auth integration
 */

import nodemailer from 'nodemailer'

// Define structure for email data
interface EmailData {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

// Load configuration from environment variables
const SMTP_CONFIG = {
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587', 10),
  secure: process.env.EMAIL_PORT === '465', // SSL
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
};

/**
 * Sends an email using Nodemailer.
 */
export const sendEmail = async (data: EmailData): Promise<void> => {
  if (!SMTP_CONFIG.auth.user || !SMTP_CONFIG.auth.pass) {
    throw new Error("Missing SMTP credentials. Please check EMAIL_USER and EMAIL_PASS in .env.");
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_CONFIG.host,
    port: SMTP_CONFIG.port,
    secure: SMTP_CONFIG.secure,
    auth: SMTP_CONFIG.auth,
  });

  const mailOptions = {
    from: SMTP_CONFIG.from,
    to: data.to,
    subject: data.subject,
    text: data.text,
    html: data.html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[EmailService] ✅ Email sent to ${data.to}`);
    console.log(`[EmailService] Message ID: ${info.messageId}`);
  } catch (err: any) {
    console.error(`[EmailService] ❌ Failed to send email: ${err.message}`);
    throw new Error(`Email send failed: ${err.message}`);
  }
};

// Export service
export const emailService = {
  send: sendEmail,
};
