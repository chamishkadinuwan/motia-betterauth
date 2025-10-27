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


// 2. Initialize Prisma Client
const prisma = new PrismaClient();

// 3. Configure Better Auth
export const auth = betterAuth({
  // Configure the database adapter
  database: prismaAdapter(prisma, {
    provider: 'postgresql', 
  }),

  emailAndPassword: {
    enabled: true,
    autoSignIn: true, 
    
    // This function is called by Better Auth when a password reset is requested.
    sendResetPassword: async (data: ResetPasswordParams, request?: Request) => {
        
        // Destructure the necessary data from the payload
        const { user, url, token } = data;
        
        // 🚨 CRITICAL: Log this specific string. This log acts as the 
        // trigger for a dedicated Motia Event Step to send the email.
        console.log(`[MOTIA EVENT] PasswordResetRequired: { email: ${user.email}, url: ${url}, token: ${token} }`);
        
        // Return success to Better Auth
        return Promise.resolve();
    },

    resetPasswordTokenExpiresIn: 3600, // Token expires in 1 hour (3600 seconds)
  },
  
  emailVerification: {
    enabled: true,
    // Set up a similar log-based event trigger for email verification if needed
    sendVerificationEmail: async ({ user, url }) => { 
      console.log(`Sending verification email to ${user.email} at ${url}`);
    },
  },
});

// // lib/auth.ts
// //prev
// import { betterAuth } from 'better-auth';
// import { prismaAdapter } from 'better-auth/adapters/prisma';
// import { PrismaClient } from '@prisma/client';

// // 1. Initialize Prisma Client
// // Note: In a real project, this would be a singleton pattern 
// // to prevent multiple instances.
// const prisma = new PrismaClient();

// // 2. Configure Better Auth
// export const auth = betterAuth({
//   // Configure the database adapter
//   database: prismaAdapter(prisma, {
//     // Specify the provider type used in schema.prisma
//     provider: 'postgresql', 
//   }),

//   // Enable the standard email and password registration/login provider
//   emailAndPassword: {
//     enabled: true,
//     // Optionally set to false if you want users to sign in after registration
//     autoSignIn: true, 
//   },
//     passwordReset: {
//     enabled: true,
//     sendPasswordResetEmail: async ({ user, url }: { user: { email?: string }, url: string }) => {
//       // Logic to send email here
//       console.log(`Sending password reset email to ${user.email} at ${url}`);
//     },
//   },
  
//   // Optional: Enable email verification flow
//   emailVerification: {
//     enabled: true,
//     sendVerificationEmail: async ({ user, url }) => {
//       // Logic to send email here (e.g., using a Motia Event Step to handle the send)
//       console.log(`Sending verification email to ${user.email} at ${url}`);
      
//     },
//   },

  
  
//   // Add other social providers here if needed, e.g., Google or GitHub
//   // socialProviders: {
//   //   github: {
//   //     clientId: process.env.GITHUB_CLIENT_ID as string,
//   //     clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
//   //   }
//   // }
// });



// // import { betterAuth } from "better-auth";
// // import { prismaAdapter } from "better-auth/adapters/prisma";
// // import { PrismaClient } from "@prisma/client";

// // const prisma = new PrismaClient();

// // export const auth = betterAuth({
// //   database: prismaAdapter(prisma, {
// //     provider: "postgresql",
// //   }),
// //   emailAndPassword: {
// //     enabled: true,
// //   },
// //   session: {
// //     expiresIn: 60 * 60 * 24 * 7, // 7 days
// //     updateAge: 60 * 60 * 24, // 1 day
// //   },
// //   trustHost: true,
// // });

// // export type Auth = typeof auth;