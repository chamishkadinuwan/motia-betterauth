// lib/auth.ts



import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';

// 1. Initialize Prisma Client
// Note: In a real project, this would be a singleton pattern 
// to prevent multiple instances.
const prisma = new PrismaClient();

// 2. Configure Better Auth
export const auth = betterAuth({
  // Configure the database adapter
  database: prismaAdapter(prisma, {
    // Specify the provider type used in schema.prisma
    provider: 'postgresql', 
  }),

  // Enable the standard email and password registration/login provider
  emailAndPassword: {
    enabled: true,
    // Optionally set to false if you want users to sign in after registration
    autoSignIn: true, 
  },
  
  // Optional: Enable email verification flow
  // emailVerification: {
  //   enabled: true,
  //   sendVerificationEmail: async ({ user, url }) => {
  //     // Logic to send email here (e.g., using a Motia Event Step to handle the send)
  //     console.log(`Sending verification email to ${user.email} at ${url}`);
  //   },
  // },
  
  // Add other social providers here if needed, e.g., Google or GitHub
  // socialProviders: {
  //   github: {
  //     clientId: process.env.GITHUB_CLIENT_ID as string,
  //     clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
  //   }
  // }
});

// import { betterAuth } from "better-auth";
// import { prismaAdapter } from "better-auth/adapters/prisma";
// import { PrismaClient } from "@prisma/client";

// const prisma = new PrismaClient();

// export const auth = betterAuth({
//   database: prismaAdapter(prisma, {
//     provider: "postgresql",
//   }),
//   emailAndPassword: {
//     enabled: true,
//   },
//   session: {
//     expiresIn: 60 * 60 * 24 * 7, // 7 days
//     updateAge: 60 * 60 * 24, // 1 day
//   },
//   trustHost: true,
// });

// export type Auth = typeof auth;