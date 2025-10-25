// In a Motia project, the Motia runtime automatically handles imports and logging.
import { auth } from './../../lib/auth';

// 1. Motia Step Configuration
export const config = {
  name: 'UserRegistration',
  type: 'api',
  path: '/auth/register',
  method: 'POST',
  description: 'Handles new user registration using email and password via Better Auth.',
  emits: [],
  flows: ['auth'],
};

// 2. Motia Step Handler
// The handler receives the incoming HTTP request (req)
// and context (ctx) containing utilities like logger.
export const handler = async (req: any, ctx: any) => {
  const { logger } = ctx;
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    logger.error('Missing required fields during registration attempt');
    return {
      status: 400,
      body: { error: 'Please provide name, email, and password.' }
    };
  }

  try {
    // Call the Better Auth API method for email and password sign-up.
    // Better Auth handles password hashing, validation, and user/session creation
    // using the Prisma adapter configured in lib/auth.ts.
    const result = await auth.api.signUpEmail({
      // The body must contain the required fields for the emailAndPassword provider
      body: { 
        name,
        email,
        password,
      },
    });

    // If the sign-up is successful, Better Auth returns user and session data.
    // You can customize the response based on the 'result' structure.
    logger.info(`New user registered successfully: ${result.user.email}`);

    // Better Auth often returns an access token or session data for the client.
    // We only return the necessary, safe information.
    return {
      status: 201,
      body: { 
        message: 'Registration successful. User created and signed in.',
        user: { 
          id: result.user.id, 
          email: result.user.email,
          name: result.user.name 
        },
        // The token/session information can be used by the client for subsequent requests.
        session: result.session, 
      }
    };
  } catch (error: any) {
    logger.error('Registration failed:', error.message);

    // Better Auth errors are often informative (e.g., "Email already in use")
    const errorMessage = error.message.includes('unique') || error.message.includes('already exists')
      ? 'The provided email is already registered.'
      : 'Registration failed due to a server error.';

    return {
      status: 409, // Conflict
      body: { error: errorMessage }
    };
  }
};






// // steps/auth/register.step.ts
// import { auth } from '../../lib/auth';
// import { z } from 'zod';

// const registerInputSchema = z.object({
//   email: z.string().email(),
//   password: z.string().min(6),
//   name: z.string().min(1)
// });

// export const config = {
//   name: 'UserRegister',
//   type: 'api',
//   path: '/api/auth/register',
//   method: 'POST',
//   emits: [],
//   flows: ['auth'],
//   bodySchema: registerInputSchema,
// };

// export const handler = async (req: any, ctx: any) => {
//   try {
//     const { email, password, name } = req.body;

//     console.log('Registration attempt:', { email, name });

//     if (!email || !password) {
//       return {
//         status: 400,
//         body: { 
//           success: false,
//           error: 'MISSING_FIELDS',
//           message: 'Email and password are required' 
//         }
//       };
//     }

//     // Call BetterAuth signUp
//     const result = await (auth as any).signUp.email({
//       email,
//       password,
//       name: name || email.split('@')[0],
//     });

//     console.log('Full BetterAuth response:', JSON.stringify(result, null, 2));

//     // Check if there's an error in the response
//     if (result?.error) {
//       console.log('BetterAuth error:', result.error);
//       return {
//         status: 400,
//         body: { 
//           success: false,
//           error: 'REGISTRATION_FAILED',
//           message: result.error.message || 'Registration failed'
//         }
//       };
//     }

//     // Handle different possible response structures from BetterAuth
//     let user;
    
//     // Structure 1: result.data.user (most common)
//     if (result?.data?.user) {
//       user = result.data.user;
//     }
//     // Structure 2: result.user (direct)
//     else if (result?.user) {
//       user = result.user;
//     }
//     // Structure 3: result.data (user is at root of data)
//     else if (result?.data?.id && result.data.email) {
//       user = result.data;
//     }
//     // No user found in any expected structure
//     else {
//       console.log('Unexpected response structure:', result);
//       return {
//         status: 500,
//         body: { 
//           success: false,
//           error: 'UNEXPECTED_RESPONSE',
//           message: 'Authentication service returned unexpected response structure'
//         }
//       };
//     }

//     console.log('Registration successful for user:', user.id);
    
//     return {
//       status: 201,
//       body: { 
//         success: true,
//         data: {
//           user: { 
//             id: user.id, 
//             email: user.email, 
//             name: user.name 
//           }
//         }
//       }
//     };
//   } catch (error: any) {
//     console.error('Unexpected registration error:', error);
//     (ctx as any).logger.error('Registration error details:', {
//       message: error.message,
//       stack: error.stack,
//       name: error.name
//     });
//     return {
//       status: 500,
//       body: { 
//         success: false,
//         error: 'REGISTRATION_ERROR',
//         message: 'User registration failed',
//         details: process.env.NODE_ENV === 'development' ? error.message : undefined
//       }
//     };
//   }
// };