// lib/auth.ts
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { PrismaClient } from '@prisma/client';
import { emailService } from './email'; // ✅ Import email service

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
        name?: string;
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

  emailAndPassword: {
    enabled: true,
    // ✅ IMPORTANT: Set to false so users must verify email before signing in
    autoSignIn: false, 
    // ✅ Require email verification before allowing login
    requireEmailVerification: true,
    
    // ✅ Send password reset email directly
    sendResetPassword: async (data: ResetPasswordParams, request?: Request) => {
        const { user, url, token } = data;
        
        // Log the event for debugging
        const eventPayload = { email: user.email, url: url, token: token };
        console.log(`[MOTIA EVENT] PasswordResetRequired: ${JSON.stringify(eventPayload)}`);
        
        // ✅ Send the email directly
        try {
          await emailService.send({
            to: user.email,
            subject: "Reset Your Password",
            text: `You are receiving this email because a password reset was requested for your account.\n\nPlease click on the link below to reset your password:\n${url}\n\nIf you did not request a password reset, please ignore this email.\n\nThis link will expire in 1 hour.`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
                  <h2 style="color: #007bff; margin-top: 0;">Reset Your Password</h2>
                  <p>Hello ${user.name || 'there'},</p>
                  <p>You are receiving this email because a password reset was requested for your account.</p>
                  <p>Please click the button below to reset your password:</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${url}" style="display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
                  </div>
                  <p style="font-size: 14px; color: #666;">If the button doesn't work, you can also copy and paste this link into your browser:</p>
                  <p style="font-size: 12px; word-break: break-all; background-color: #fff; padding: 10px; border-radius: 5px;">${url}</p>
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                  <p style="font-size: 12px; color: #999;">
                    <strong>Important:</strong> This link will expire in 1 hour.<br>
                    If you did not request a password reset, please ignore this email. Your password will remain unchanged.
                  </p>
                </div>
              </body>
              </html>
            `,
          });
          
          console.log(`✅ Password reset email successfully sent to ${user.email}`);
        } catch (error: any) {
          console.error(`❌ Failed to send password reset email to ${user.email}:`, error.message);
        }
        
        return Promise.resolve();
    },

    resetPasswordTokenExpiresIn: 3600, // Token expires in 1 hour
  },
  
  emailVerification: {
    enabled: true,
    // ✅ Auto-send verification email on registration
    autoSignInAfterVerification: true, // User is signed in after verifying
    
    // ✅ Send verification email directly
    sendVerificationEmail: async (data: VerificationEmailParams, request?: Request) => {
        const { user, url, token } = data;
        
        // Log the event for debugging
        const eventPayload = { email: user.email, url: url, token: token };
        console.log(`[MOTIA EVENT] EmailVerificationRequired: ${JSON.stringify(eventPayload)}`);
        
        // ✅ Send the email directly
        try {
          await emailService.send({
            to: user.email,
            subject: "Verify Your Email Address",
            text: `Welcome! Please verify your email address by clicking this link:\n${url}\n\nIf you did not create an account, please ignore this email.`,
            html: `
              <!DOCTYPE html>
              <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
                  <h2 style="color: #28a745; margin-top: 0;">Welcome! Verify Your Email</h2>
                  <p>Hello ${user.name || 'there'},</p>
                  <p>Thank you for signing up! To complete your registration, please verify your email address.</p>
                  <div style="text-align: center; margin: 30px 0;">
                    <a href="${url}" style="display: inline-block; padding: 12px 30px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
                  </div>
                  <p style="font-size: 14px; color: #666;">If the button doesn't work, you can also copy and paste this link into your browser:</p>
                  <p style="font-size: 12px; word-break: break-all; background-color: #fff; padding: 10px; border-radius: 5px;">${url}</p>
                  <p style="font-size: 12px; word-break: break-all; background-color: #fff; padding: 10px; border-radius: 5px;">${token}</p>
                  <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
                  <p style="font-size: 12px; color: #999;">
                    If you did not create an account, please ignore this email.
                  </p>
                </div>
              </body>
              </html>
            `,
          });
          
          console.log(`✅ Verification email successfully sent to ${user.email}`);
        } catch (error: any) {
          console.error(`❌ Failed to send verification email to ${user.email}:`, error.message);
        }
        
        return Promise.resolve();
    },
    
    sendOnSignUp: true, // ✅ Automatically send verification email when user registers
  },
});



// // lib/auth.ts
// import { betterAuth } from 'better-auth';
// import { prismaAdapter } from 'better-auth/adapters/prisma';
// import { PrismaClient } from '@prisma/client';
// import { emailService } from './email'; // ✅ Import email service

// // 1. Define the fully corrected type for the parameters
// interface ResetPasswordParams {
//     user: {
//         id: string;
//         createdAt: Date; 
//         updatedAt: Date; 
//         email: string;
//         emailVerified: boolean; 
//         name: string; 
//         image?: string | null | undefined; 
//     };
//     url: string; // The reset URL containing the token
//     token: string; // The verification token
// }

// interface VerificationEmailParams {
//     user: {
//         id: string;
//         email: string;
//     };
//     url: string;
//     token: string;
// }

// // 2. Initialize Prisma Client
// const prisma = new PrismaClient();

// // 3. Configure Better Auth
// export const auth = betterAuth({
//   // Configure the database adapter
//   database: prismaAdapter(prisma, {
//     provider: 'postgresql', 
//   }),

//   emailAndPassword: {
//     enabled: true,
//     autoSignIn: true, 
    
//     // ✅ FIXED: Send email directly in the callback
//     sendResetPassword: async (data: ResetPasswordParams, request?: Request) => {
//         const { user, url, token } = data;
        
//         // Log the event for debugging
//         const eventPayload = { email: user.email, url: url, token: token };
//         console.log(`[MOTIA EVENT] PasswordResetRequired: ${JSON.stringify(eventPayload)}`);
        
//         // ✅ Send the email directly
//         try {
//           await emailService.send({
//             to: user.email,
//             subject: "Reset Your Password",
//             text: `You are receiving this email because a password reset was requested for your account.\n\nPlease click on the link below to reset your password:\n${url}\n\nIf you did not request a password reset, please ignore this email.\n\nThis link will expire in 1 hour.`,
//             html: `
//               <!DOCTYPE html>
//               <html>
//               <head>
//                 <meta charset="utf-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//               </head>
//               <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
//                 <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
//                   <h2 style="color: #007bff; margin-top: 0;">Reset Your Password</h2>
//                   <p>Hello ${user.name || 'there'},</p>
//                   <p>Hello ${token} || 'there'},</p>
//                   <p>You are receiving this email because a password reset was requested for your account.</p>
//                   <p>Please click the button below to reset your password:</p>
//                   <div style="text-align: center; margin: 30px 0;">
//                     <a href="${url}" style="display: inline-block; padding: 12px 30px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Reset Password</a>
            
                  
//                     </div>
//                   <p style="font-size: 14px; color: #666;">If the button doesn't work, you can also copy and paste this link into your browser:</p>
//                   <p style="font-size: 12px; word-break: break-all; background-color: #fff; padding: 10px; border-radius: 5px;">${url}</p>
//                   <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
//                   <p style="font-size: 12px; color: #999;">
//                     <strong>Important:</strong> This link will expire in 1 hour.<br>
//                     If you did not request a password reset, please ignore this email. Your password will remain unchanged.
//                   </p>
//                 </div>
//               </body>
//               </html>
//             `,
//           });
          
//           console.log(`✅ Password reset email successfully sent to ${user.email}`);
//         } catch (error: any) {
//           console.error(`❌ Failed to send password reset email to ${user.email}:`, error.message);
//           // Don't throw error - Better Auth should still complete the request
//           // The user will just need to request another reset if email fails
//         }
        
//         return Promise.resolve();
//     },

//     resetPasswordTokenExpiresIn: 3600, // Token expires in 1 hour (3600 seconds)
//   },
  
//   emailVerification: {
//     enabled: true,
    
//     // ✅ FIXED: Send verification email directly in the callback
//     sendVerificationEmail: async (data: VerificationEmailParams, request?: Request) => {
//         const { user, url, token } = data;
        
//         // Log the event for debugging
//         const eventPayload = { email: user.email, url: url, token: token };
//         console.log(`[MOTIA EVENT] EmailVerificationRequired: ${JSON.stringify(eventPayload)}`);
        
//         // ✅ Send the email directly
//         try {
//           await emailService.send({
//             to: user.email,
//             subject: "Verify Your Email Address",
//             text: `Please verify your email address by clicking this link:\n${url}\n\nIf you did not create an account, please ignore this email.`,
//             html: `
//               <!DOCTYPE html>
//               <html>
//               <head>
//                 <meta charset="utf-8">
//                 <meta name="viewport" content="width=device-width, initial-scale=1.0">
//               </head>
//               <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
//                 <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
//                   <h2 style="color: #28a745; margin-top: 0;">Verify Your Email Address</h2>
//                   <p>Hello,</p>
//                   <p>Thank you for signing up! Please verify your email address by clicking the button below:</p>
//                   <div style="text-align: center; margin: 30px 0;">
//                     <a href="${url}" style="display: inline-block; padding: 12px 30px; background-color: #28a745; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">Verify Email</a>
//                   </div>
//                   <p style="font-size: 14px; color: #666;">If the button doesn't work, you can also copy and paste this link into your browser:</p>
//                   <p style="font-size: 12px; word-break: break-all; background-color: #fff; padding: 10px; border-radius: 5px;">${url}</p>
//                   <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
//                   <p style="font-size: 12px; color: #999;">
//                     If you did not create an account, please ignore this email.
//                   </p>
//                 </div>
//               </body>
//               </html>
//             `,
//           });
          
//           console.log(`✅ Verification email successfully sent to ${user.email}`);
//         } catch (error: any) {
//           console.error(`❌ Failed to send verification email to ${user.email}:`, error.message);
//           // Don't throw error - Better Auth should still complete the request
//         }
        
//         return Promise.resolve();
//     },
//   },
// });