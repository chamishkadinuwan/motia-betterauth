
import { auth } from './../../lib/auth'; // Reuses the Better Auth configuration

// 1. Motia Step Configuration
export const config = {
  name: 'UserLogin',
  type: 'api',
  path: '/auth/login', // New path for the login endpoint
  method: 'POST',
  description: 'Handles user sign-in using email and password via Better Auth.',
  emits: [],
  flows: ['auth'],
};

// 2. Motia Step Handler
// The handler receives the incoming HTTP request (req)
// and context (ctx) containing utilities like logger.
export const handler = async (req: any, ctx: any) => {
  const { logger } = ctx;
  // We only need email and password for login
  const { email, password } = req.body;

  if (!email || !password) {
    logger.error('Missing email or password during login attempt');
    return {
      status: 400,
      body: { error: 'Please provide both email and password.' }
    };
  }

  try {
    // Call the Better Auth API method for email and password sign-in.
    // Better Auth handles password verification against the hash stored in the database.
    const result = await auth.api.signInEmail({
      // The body must contain the required login credentials
      body: { 
        email,
        password,
      },
    });

    // If the sign-in is successful, Better Auth returns the user and session data.
    logger.info(`User signed in successfully: ${result.user.email}`);

    // Return a 200 OK status with safe user data and the session token/data.
    return {
      status: 200,
      body: { 
        message: 'Login successful.',
        user: { 
          id: result.user.id, 
          email: result.user.email,
          name: result.user.name,
          
        },
        // The session object contains the session token used for subsequent authenticated requests.
        session: result.session, 
      }
    };
  } catch (error: any) {
    logger.error('Login failed:', error.message);

    let status = 401; // Default to Unauthorized for login failure
    let errorMessage = 'Invalid email or password.';
    
    // Better Auth can provide specific error details; we generalize for security.
    if (error.message.includes('not found') || error.message.includes('password mismatch')) {
      errorMessage = 'Invalid email or password.';
    } else if (error.message.includes('email not verified')) {
      status = 403; // Forbidden
      errorMessage = 'Account requires email verification before login.';
    }

    return {
      status: status, 
      body: { error: errorMessage }
    };
  }
};
