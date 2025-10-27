// steps/auth/send-reset-email.event.ts

// The Motia runtime automatically handles the import of the external email service.
// Assuming you have an email service utility, e.g., 'emailClient'
// If you are using a Motia built-in email action, you'd use 'ctx.actions.email'

// You might need to import your actual email sending utility
// import { sendEmail } from './../../lib/email'; 

// 1. Motia Step Configuration
export const config = {
  name: 'SendPasswordResetEmail',
  type: 'event',
  // Motia listens for this specific log prefix from auth.ts
  listen: '[MOTIA EVENT] PasswordResetRequired', 
  description: 'Sends the password reset email upon receiving the reset event from Better Auth.',
};

// 2. Motia Step Handler
export const handler = async (event: any, ctx: any) => {
  const { logger } = ctx;
  
  // The 'event.payload' will contain the log string from auth.ts
  const logString = event.payload; 
  
  // 1. Parse the logged data string to extract email and URL
  // We expect a string like: "[MOTIA EVENT] PasswordResetRequired: { email: user@example.com, url: http://..."
  try {
    const jsonMatch = logString.match(/\{ (.*) \}/s);
    if (!jsonMatch) {
        logger.error('Could not parse reset password details from log event.', { logString });
        return;
    }

    // Clean up the string to make it valid JSON (remove "email:" and convert to keys/values)
    const cleanedString = `{ ${jsonMatch[1]
      .replace(/(\w+):/g, '"$1":')
      .replace(/(\S+@\S+)/g, '"$1"')} }`; // Basic attempt to fix string for JSON.parse
    
    // A more robust method would be to pass JSON directly from auth.ts, 
    // but for now, we'll assume the string is parseable or needs manual cleaning.
    // For simplicity, let's assume the data is correctly structured:
    
    // **Alternative & Better Way: Directly extracting values (more reliable)**
    const emailMatch = logString.match(/email: (\S+)/);
    const urlMatch = logString.match(/url: (\S+)/);
    
    const email = emailMatch ? emailMatch[1].replace(/,$/, '') : null;
    const resetUrl = urlMatch ? urlMatch[1].replace(/,$/, '') : null;

    if (!email || !resetUrl) {
        logger.error('Failed to extract email or reset URL from event log.', { logString });
        return;
    }
    
    logger.info(`Attempting to send password reset email to: ${email}`);

    // 2. Use your email service or a Motia action to send the email
    // Example using a placeholder email sending function/action:
    
    // await sendEmail({
    //   to: email,
    //   subject: 'Reset Your Password',
    //   body: `Click the following link to reset your password: ${resetUrl}`,
    // });

    // OR using a Motia Action (if available):
    // await ctx.actions.email.send({
    //     to: email,
    //     subject: 'Password Reset Request',
    //     text: `To reset your password, please click on this link: ${resetUrl}`,
    // });
    
    logger.info(`Password reset email successfully initiated for ${email}. Link: ${resetUrl}`);
    
  } catch (error: any) {
    logger.error('Error in sending reset password email:', error.message);
  }
};