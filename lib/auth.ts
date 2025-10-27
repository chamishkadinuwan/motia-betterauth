// lib/auth.ts
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';


// 1. Define the fully corrected type for the parameters
interface ResetPasswordParams {
    user: {
        id: string;
        createdAt: Date; 
        updatedAt: Date; 
        email: string;
        emailVerified: boolean; 
        name: string; 
        image?: string | null | undefined; 
    };
    url: string; // The reset URL containing the token
    token: string; // The verification token
}

interface VerificationEmailParams {
    user: {
        id: string;
        email: string;
    };
    url: string;
    token: string;
}


// 2. Initialize Prisma Client
const prisma = new PrismaClient();

// 3. Configure Better Auth
export const auth = betterAuth({
  // Configure the database adapter
  database: prismaAdapter(prisma, {
    provider: 'postgresql', 
  }),
  on: {
    passwordResetRequested: async (
      payload: ResetPasswordParams,
      ctx: { logger: { info: (message: string) => void } }
    ) => {
      ctx.logger.info(`[MOTIA EVENT] PasswordResetRequired: ${JSON.stringify(payload)}`);
    },
  },

  emailAndPassword: {
    enabled: true,
    autoSignIn: true, 
    
    // This function is called by Better Auth when a password reset is requested.
    sendResetPassword: async (data: ResetPasswordParams, request?: Request) => {
        
        const { user, url, token } = data;
        
        // 🚨 CRITICAL FIX: Use JSON.stringify() to ensure the log payload is VALID JSON.
        const eventPayload = { email: user.email, url: url, token: token };
        
        // Log the event with a JSON payload
        console.log(`[MOTIA EVENT] PasswordResetRequired: ${JSON.stringify(eventPayload)}`);
        
        // Return success to Better Auth
        return Promise.resolve();
    },

    resetPasswordTokenExpiresIn: 3600, // Token expires in 1 hour (3600 seconds)
  },
  
  emailVerification: {
    enabled: true,
    sendVerificationEmail: async (data: VerificationEmailParams, request?: Request) => {
        const { user, url, token } = data;
        
        // Ensure this uses the same format for consistency
        const eventPayload = { email: user.email, url: url, token: token };
        console.log(`[MOTIA EVENT] EmailVerificationRequired: ${JSON.stringify(eventPayload)}`);
        
        return Promise.resolve();
    },
  },
});