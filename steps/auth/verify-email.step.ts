// steps/auth/verify-email-post.step.ts
// Alternative POST endpoint for frontend verification
import { auth } from './../../lib/auth';

// 1. Motia Step Configuration
export const config = {
  name: 'VerifyEmailPost',
  type: 'api',
  path: '/auth/verify-email-post', // Different path to avoid conflict
  method: 'POST',
  description: 'Verifies user email address using the verification token from POST body.',
  emits: [],
  flows: ['auth'],
};

// 2. Motia Step Handler
export const handler = async (req: any, ctx: any) => {
  const { logger } = ctx;
  const { token } = req.body;

  if (!token) {
    return {
      status: 400,
      body: { error: 'Verification token is required.' }
    };
  }

  try {
    // ✅ Create a GET Request with token in query params (Better Auth expects this format)
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const verifyUrl = new URL(`${baseUrl}/api/auth/verify-email`);
    verifyUrl.searchParams.set('token', token);
    
    // ✅ Better Auth verification endpoint expects GET with query params
    const mockRequest = new Request(verifyUrl.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Call Better Auth handler
    const response = await auth.handler(mockRequest);
    
    // Handle the response
    let responseData;
    try {
      const text = await response.text();
      responseData = text ? JSON.parse(text) : {};
    } catch (e) {
      responseData = {};
    }

    if (response.ok || response.status === 200) {
      logger.info(`Email verified successfully`);
      
      return {
        status: 200,
        body: { 
          message: 'Email verified successfully! You can now sign in.',
          success: true,
          ...responseData
        }
      };
    } else {
      // Better Auth returned an error
      const errorMsg = responseData?.error || responseData?.message || 'Verification failed';
      throw new Error(errorMsg);
    }

  } catch (error: any) {
    logger.error('Email verification failed:', error.message);

    let errorMessage = 'Email verification failed. The token may be invalid or expired.';
    let status = 400;
    
    const errMsg = error.message.toLowerCase();
    
    if (errMsg.includes('expired')) {
      errorMessage = 'The verification link has expired. Please request a new one.';
    } else if (errMsg.includes('not found') || errMsg.includes('invalid')) {
      errorMessage = 'The verification token is invalid.';
    } else if (errMsg.includes('already verified')) {
      errorMessage = 'This email address has already been verified.';
      status = 200; // Already verified is not really an error
    }

    return {
      status: status,
      body: { 
        error: errorMessage,
        success: false
      }
    };
  }
};