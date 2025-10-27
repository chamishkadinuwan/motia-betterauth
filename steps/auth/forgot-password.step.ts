// forgerpassword.step.ts

import { auth } from './../../lib/auth'; 
import { z } from 'zod';


const FRONTEND_RESET_URL_BASE = process.env.FRONTEND_RESET_URL_BASE || 'http://localhost:3000/auth/reset';

const registerInputSchema = z.object({
  email: z.string().email(),
});

// 1. Motia Step Configuration
export const config = {
  name: 'ForgotPasswordRequest',
  type: 'api',
  path: '/auth/forgot-password', 
  method: 'POST',
  description: 'Delegates the forgotten password request directly to the Better Auth handler.',
  bodySchema: registerInputSchema,
  emits: [], // CORRECTED: Removed 'PasswordResetRequired' as the trigger is a log event from lib/auth.ts
  flows: ['auth'],

};

// 2. Motia Step Handler
export const handler = async (req: any, ctx: any) => {
  const { logger } = ctx;
  const { email } = req.body;

  if (!email) {
    return {
      status: 400,
      body: { error: 'Please provide the email address associated with the account.' }
    };
  }

  try {
    // 1. Prepare the mock Request object for Better Auth
    const url = new URL(FRONTEND_RESET_URL_BASE);
    url.pathname = '/api/auth/request-password-reset'; 
    
    const requestBody = JSON.stringify({
        email,
        redirectTo: FRONTEND_RESET_URL_BASE, 
    });

    const mockRequest = new Request(url.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: requestBody,
    });

    // 2. Call the main Better Auth handler. This triggers the log event defined in lib/auth.ts.
    const response = await auth.handler(mockRequest);
    
    const responseText = await response.text();
    
    if (!responseText && response.status !== 200) {
      logger.error(`Better Auth handler returned an empty body (Status: ${response.status}).`);
      throw new Error(`Better Auth handler failed with status ${response.status}. Response body was empty.`);
    }

    const finalResponse = new Response(responseText, { status: response.status, headers: response.headers });
    // Note: Better Auth is expected to return a generic success status (200) for security.
    const responseBody = await finalResponse.json(); 
    
    if (finalResponse.status === 200) {
      logger.info(`--- SUCCESS: PASSWORD RESET DELEGATED TO BETTER AUTH ---`);
      logger.info(`Password reset handled. Check other logs for event/email info.`);
      logger.info(`---------------------------------------------------------`);
    } else {
      logger.warn(`Better Auth Handler returned status ${finalResponse.status}. Body: ${JSON.stringify(responseBody)}`);
    }

    // 3. Return the standard generic success response for security (Production-Safe)
    return {
      status: 200, 
      body: { message: 'If an account exists, a password reset link has been sent to the email address.' }
    };

  } catch (error: any) {
    logger.error('Forgot password failed during handler delegation:', error.message);
    
    // Return the generic success message for security (Production-Safe)
    return {
      status: 200, 
      body: { message: 'If an account exists, a password reset link has been sent to the email address.' }
    };
  }
};
