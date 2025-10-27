// steps/auth/resend-verification-email.step.ts
import { auth } from './../../lib/auth';

// 1. Motia Step Configuration
export const config = {
  name: 'ResendVerificationEmail',
  type: 'api',
  path: '/auth/resend-verification',
  method: 'POST',
  description: 'Resends the email verification link to the user.',
  emits: [],
  flows: ['auth'],
};

// 2. Motia Step Handler
export const handler = async (req: any, ctx: any) => {
  const { logger } = ctx;
  const { email } = req.body;

  if (!email) {
    return {
      status: 400,
      body: { error: 'Email address is required.' }
    };
  }

  try {
    // Prepare the request for Better Auth
    const url = new URL(process.env.FRONTEND_URL || 'http://localhost:3000');
    url.pathname = '/api/auth/send-verification-email';
    
    const requestBody = JSON.stringify({
      email,
      callbackURL: process.env.FRONTEND_URL || 'http://localhost:3000',
    });

    const mockRequest = new Request(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: requestBody,
    });

    // Call Better Auth handler to resend verification email
    const response = await auth.handler(mockRequest);
    
    logger.info(`Verification email resent to ${email}`);

    // Return generic success message for security
    return {
      status: 200,
      body: { 
        message: 'If an unverified account exists, a verification email has been sent.'
      }
    };
  } catch (error: any) {
    logger.error('Failed to resend verification email:', error.message);

    // Return generic success message for security (don't reveal if email exists)
    return {
      status: 200,
      body: { 
        message: 'If an unverified account exists, a verification email has been sent.'
      }
    };
  }
};