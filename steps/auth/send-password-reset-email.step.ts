import { EventConfig , Handlers} from 'motia';
import { auth } from './../../lib/auth';
import { z } from 'zod';

const FRONTEND_RESET_URL_BASE =
  process.env.FRONTEND_RESET_URL_BASE || 'http://localhost:3000/auth/reset';


const registerInputSchema = z.object({
  email: z.string().email(),
});

export const config: EventConfig = {
  name: 'SendPasswordResetEmail',
  type: 'event',
  subscribes: ['ForgotPasswordRequested'], // must match API emit topic
  description: 'Handles ForgotPasswordRequested event and triggers Better Auth email',
  emits: [], // no further events
  input: registerInputSchema,
  flows: ['auth'],
  
};
  export const handler: Handlers['SendPasswordResetEmail'] = async (input: any, { logger }: { logger: any }) => {
  logger.info('email ', input.email);

  const email = input.email;
  console.log('Extracted email from event data:', email);

  if (!email) {
    logger.error(`[MOTIA EVENT HANDLER] Event data missing. Cannot process password reset for email: ${email}`);
    return;
  }

  logger.info(`[MOTIA EVENT HANDLER] Handling ForgotPasswordRequested for ${email}`);

  try {
    // Prepare mock request for Better Auth
    const requestUrl = new URL('/api/auth/request-password-reset', FRONTEND_RESET_URL_BASE);

    const mockRequest = new Request(requestUrl.toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, redirectTo: FRONTEND_RESET_URL_BASE }),
    });

    const response = await auth.handler(mockRequest);

    if (response.status === 200) {
      logger.info(`✅ Password reset delegation successful for ${email}`);
    } else {
      logger.warn(`⚠️ Better Auth responded with status ${response.status} for ${email}`);
    }
  } catch (error: any) {
    logger.error(`❌ SendPasswordResetEmail handler failed for ${email}: ${error.message}`);
  }
};








// // send-password-reset-email.step.ts
// import { emailService } from './../../lib/email';
// import { z } from 'zod';

// // Schema for validation
// const passwordResetEmailSchema = z.object({
//   user: z.object({
//     id: z.string(),
//     email: z.string().email(),
//     name: z.string().optional(),
//     emailVerified: z.boolean(),
//     createdAt: z.date(),
//     updatedAt: z.date(),
//     image: z.string().nullable().optional(),
//   }),
//   url: z.string().url(),
//   token: z.string(),
// });

// // 1. Motia Event Step Configuration
// export const config = {
//   name: 'SendPasswordResetEmail',
//   type: 'event',
//   subscribes: ['PasswordResetEmailRequested'], 
//   emits: [],
//   description: 'Sends password reset email when PasswordResetEmailRequested event is emitted',
//   flows: ['auth'],
// };

// // 2. Event Handler
// export const handler = async (payload: any, ctx: any) => {
//   const { logger } = ctx;
  
//   // Validate payload
//   const validationResult = passwordResetEmailSchema.safeParse(payload);
//   if (!validationResult.success) {
//     logger.error('[SendPasswordResetEmail] Invalid payload:', validationResult.error);
//     return {
//       success: false,
//       error: 'Invalid payload structure',
//     };
//   }

//   const { user, url, token } = validationResult.data;

//   try {
//     logger.info(`[SendPasswordResetEmail] Preparing to send password reset email to: ${user.email}`);

//     // Log the event for debugging/audit purposes
//     const eventPayload = { 
//       email: user.email, 
//       url: url, 
//       token: token 
//     };
//     console.log(`[MOTIA EVENT] PasswordResetEmailRequested: ${JSON.stringify(eventPayload)}`);

//     // ✅ Send the password reset email using emailService
//     await emailService.send({
//       to: user.email,
//       subject: "Reset Your Password",
//       text: `You are receiving this email because a password reset was requested for your account.\n\nPlease click on the link below to reset your password:\n${url}\n\nIf you did not request a password reset, please ignore this email.\n\nThis link will expire in 1 hour.`,
//       html: `
//         <!DOCTYPE html>
//         <html>
//         <head>
//           <meta charset="utf-8">
//           <meta name="viewport" content="width=device-width, initial-scale=1.0">
//         </head>
//         <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
//           <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
//             <h2 style="color: #007bff; margin-top: 0;">Reset Your Password</h2>
//             <p>Hello ${user.name || 'there'},</p>
//             <p>You are receiving this email because a password reset was requested for your account.</p>
//             <p>Please click the button below to reset your password:</p>
//             <div style="text-align: center; margin: 30px 0;">
//               <a href="${url}" style="display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
//             </div>
//             <p style="font-size: 14px; color: #666;">If the button doesn't work, you can also copy and paste this link into your browser:</p>
//             <p style="font-size: 12px; word-break: break-all; background-color: #fff; padding: 10px; border-radius: 5px;">${url}</p>
//             <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
//             <p style="font-size: 12px; color: #999;">
//               <strong>Important:</strong> This link will expire in 1 hour.<br>
//               If you did not request a password reset, please ignore this email. Your password will remain unchanged.
//             </p>
//           </div>
//         </body>
//         </html>
//       `,
//     });

//     logger.info(`✅ [SendPasswordResetEmail] Password reset email successfully sent to ${user.email}`);
    
//     return {
//       success: true,
//       email: user.email,
//     };

//   } catch (error: any) {
//     logger.error(`❌ [SendPasswordResetEmail] Failed to send password reset email to ${user.email}:`, error.message);
    
//     // Don't throw - we don't want to break the flow if email fails
//     // Just log the error for monitoring
//     return {
//       success: false,
//       email: user.email,
//       error: error.message,
//     };
//   }
// };