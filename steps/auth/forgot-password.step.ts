// In a Motia project, the Motia runtime automatically handles imports and logging.

// Ensure the import of 'auth' is correct.
import { auth } from './../../lib/auth'; 

// Define the base URL for your frontend application where the user will land 
// to complete the reset. This should be configured in your environment variables.
const FRONTEND_RESET_URL_BASE = process.env.FRONTEND_RESET_URL_BASE || 'http://localhost:3000/auth/reset';

// 1. Motia Step Configuration
export const config = {
  name: 'ForgotPasswordRequest',
  type: 'api',
  path: '/auth/forgot-password', 
  method: 'POST',
  description: 'Delegates the forgotten password request directly to the Better Auth handler.',
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
      body: { error: 'Please provide the email address associated with the account.' }
    };
  }

  try {
    // --- SOLUTION: DELEGATE TO BETTER AUTH HANDLER ---
    // Instead of calling a specific function, we let the Better Auth handler
    // process the request as if it were an API route in itself.
    
    // 1. Better Auth expects the request to mimic a standard web request.
    // We create a minimal Request object for the Better Auth handler.
    const url = new URL(FRONTEND_RESET_URL_BASE);
    url.pathname = '/api/auth/send-password-reset'; // Assuming the standard endpoint for Better Auth
    
    // Prepare the body with the required callback URL
    const requestBody = JSON.stringify({
        email,
        callbackURL: FRONTEND_RESET_URL_BASE,
    });

    const mockRequest = new Request(url.toString(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: requestBody,
    });

    // 2. Call the main Better Auth handler
    const response = await auth.handler(mockRequest);
    
    // 3. Process the response from the Better Auth handler
    const responseBody = await response.json();
    
    // Check if the response contains the token (for debugging/logging purposes)
    const token = responseBody?.token; 
    
    if (response.status === 200 && token) {
        const resetLink = `${FRONTEND_RESET_URL_BASE}?token=${token}&email=${email}`;
        
        // --- LOG THE TOKEN FOR TESTING ---
        logger.info(`--- SUCCESS: PASSWORD RESET TOKEN GENERATED (Handler Delegation) ---`);
        logger.info(`Token for ${email}: ${token}`);
        logger.info(`Manual Reset Link: ${resetLink}`);
        logger.info(`--------------------------------------------------------------------`);
    } else if (response.status === 200) {
        // If 200 but no token, log the original response for debugging
        logger.info(`Better Auth Handler returned status 200, but no token was found in the body.`);
    }

    // Return the generic success message based on the handler's response status
    return {
      status: response.status,
      body: responseBody
    };

  } catch (error: any) {
    logger.error('Forgot password failed during handler delegation:', error.message);
    
    // Always return a generic success message on API failure for security.
    return {
      status: 200,
      body: { message: 'If an account exists, a password reset link has been sent to the email address.' }
    };
  }
};
