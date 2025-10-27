// steps/auth/send-password-reset-email.step.ts

import { sendEmail } from './../../lib/email'; 
import { z } from 'zod';

// Define the Zod schema for the expected extracted data
const eventPayloadSchema = z.object({
    email: z.string().email(),
    url: z.string().url(),
    token: z.string(), 
});

// 1. Motia Step Configuration
export const config = {
  name: 'SendPasswordResetEmail',
  type: 'event', 
  
  // 🚨 FIX 1: Simplify subscription to the exact prefix (no trailing space or brace)
  subscribes: [
    '[MOTIA EVENT] PasswordResetRequired: {', 
  ],
  
  emits: [], 
  flows: ['auth'],
};

/**
 * 2. Motia Step Handler
 * The payload is the full log string.
 */
export const handler = async (logString: string, ctx: any) => {
  const { logger } = ctx;
  let payload: z.infer<typeof eventPayloadSchema>;
  
  try {
    // 🚨 FIX 2: Use the simplified search string to find the JSON start
    const searchString = '[MOTIA EVENT] PasswordResetRequired: ';
    const startIndex = logString.indexOf(searchString);
    
    if (startIndex === -1) {
        logger.warn(`Log line did not contain expected prefix: ${logString}`);
        throw new Error("Log prefix not found. Check subscription match.");
    }

    // Extract the substring *after* the searchString
    const jsonString = logString.substring(startIndex + searchString.length).trim();
    
    // 💡 DEBUG LOG: Essential for verifying the extraction is correct
    logger.info(`Extracted JSON String: ${jsonString.substring(0, 100)}...`); 

    // 2. Parse and validate the payload (This should now succeed)
    payload = eventPayloadSchema.parse(JSON.parse(jsonString));
    
    logger.info(`Parsed Event Payload successfully for email: ${payload.email}`);
    
  } catch (e: any) {
    logger.error('Failed to parse or validate log payload:', e.message);
    // Throwing an error here ensures the step execution is marked as failed.
    throw new Error('Invalid log format or parsing error. Check log output and lib/auth.ts.'); 
  }
  
  const { email, url } = payload;
  
  // --- Email Sending Logic ---
  const subject = "Reset Your Password";
  const text = `You are receiving this email because a password reset was requested for your account. Please click on the link below to reset your password: ${url}\n\nIf you did not request a password reset, please ignore this email.`;
  const html = `
    <p>You are receiving this email because a password reset was requested for your account.</p>
    <p>Please click the button below to reset your password:</p>
    <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
    <p>If the button doesn't work, you can also copy and paste this link into your browser: <br/> ${url}</p>
    <p>If you did not request a password reset, please ignore this email.</p>
  `;

  try {
    // This is the simulated email send from lib/email.ts
    await sendEmail({
      to: email,
      subject: subject,
      text: text,
      html: html,
    });
    
    logger.info(`Password reset email successfully queued for ${email}`);
    
    return {
      status: 200, 
      body: { message: 'Password reset email sent.' }
    };
    
  } catch (error: any) {
    logger.error('Failed to send password reset email:', error.message);
    // If this error occurs, the issue is EMAIL_USER/EMAIL_PASS in your .env or a firewall/network issue.
    throw new Error('Email sending failed due to configuration or network issue.'); 
  }
};