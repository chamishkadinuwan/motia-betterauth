// In a Motia project, the Motia runtime automatically handles imports and logging.
// Ensure the import of 'auth' is correct.
import { auth } from './../../lib/auth'; 
// Assuming you have a file that exports your Prisma client for manual token saving
import prisma from './../../lib/prisma'; 

// 1. Motia Step Configuration
export const config = {
  name: 'GetVerificationToken',
  type: 'api',
  path: '/auth/get-verification-token', 
  method: 'POST',
  description: 'Generates a password reset token and returns it encoded as a mock JWT.',
    emits: [],
    flows: ['auth'],
};

// 2. Motia Step Handler
export const handler = async (req: any, ctx: any) => {
  const { logger } = ctx;
  const { email } = req.body;
  const TOKEN_EXPIRY_HOURS = 1;

  if (!email) {
    return {
      status: 400,
      body: { error: 'Please provide the email address.' }
    };
  }

  try {
    // 1. Find the user ID associated with the email to ensure the user exists
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        // Log generic message for security, but return 404 to the caller 
        // if this endpoint is only for known services. For public APIs, 200 is safer.
        logger.warn(`Verification token requested for unknown email: ${email}`);
        return {
            status: 404,
            body: { message: 'User not found.' }
        };
    }

    // 2. Use Better Auth's utility to generate a secure token string (if available)
    // We assume the low-level utility function for generating the random string exists.
    const token: string = await auth.api.createToken(); 
    
    const expires = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 3600 * 1000); // 1 hour expiry

    // 3. Persist the token in the database (Better Auth Verification model)
    await prisma.verification.create({
        data: {
            identifier: email,
            token: token,
            expires: expires,
            type: 'password_reset', // Mark as the correct type
            // Note: If your Prisma schema for Verification requires other fields 
            // from Better Auth (like 'provider'), you must add them here.
        } as any // Cast to 'any' to satisfy type checks for Better Auth models
    });

    // 4. Create the JWT Payload (The token the client needs)
    const jwtPayload = {
      sub: user.id, // Subject: User ID
      email: email,
      verificationToken: token, // The token the /reset-password step needs
      expiresAt: expires.toISOString(),
      iss: 'MotiaAuthService', // Issuer
    };

    // 5. Simulate JWT creation using Base64 encoding (Header.Payload.Signature)
    // NOTE: In a production environment, you MUST use a library like 'jsonwebtoken'
    // to sign this payload with a secret key for true security. 
    const encodedPayload = Buffer.from(JSON.stringify(jwtPayload)).toString('base64url');
    const mockJWT = `header.${encodedPayload}.MOCK_SIGNATURE`;

    logger.info(`Verification token successfully generated and encoded for: ${email}`);
    
    // 6. Return the mock JWT to the client
    return {
      status: 200,
      body: { 
        jwt: mockJWT,
        // Also log the raw token in the Step log for easy local testing
        rawToken: token, 
      }
    };

  } catch (error: any) {
    logger.error('Failed to generate verification token:', error.message);
    
    return {
      status: 500,
      body: { error: 'Internal server error during token generation.' }
    };
  }
};
