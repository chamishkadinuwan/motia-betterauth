


// In a Motia project, the Motia runtime automatically handles imports and logging.

import { auth } from './../../lib/auth'; // Reuses the Better Auth configuration

// 1. Motia Step Configuration
export const config = {
  name: 'ResetPassword',
  type: 'api',
  path: '/auth/reset-password', 
  method: 'POST',
  description: 'Verifies the reset token and updates the user password via Better Auth.',
    emits: [],
    flows: ['auth'],
};

// 2. Motia Step Handler
export const handler = async (req: any, ctx: any) => {
  const { logger } = ctx;
  // This expects the token from the email link and the new password from the frontend form.
  const { token, email, newPassword } = req.body; 

  if (!token || !email || !newPassword) {
    return {
      status: 400,
      body: { error: 'Missing required fields: token, email, or new password.' }
    };
  }

  try {
    // Call the Better Auth API method to reset the password.
    // Better Auth verifies the token, checks expiry, updates the password, and invalidates the token.
    await auth.api.resetPassword({
      body: { 
        token,
        email, 
        newPassword: newPassword,
      },
    });

    logger.info(`Password successfully reset for user: ${email}`);

    return {
      status: 200,
      body: { message: 'Password reset successful. You can now log in with your new password.' }
    };
  } catch (error: any) {
    logger.error('Password reset failed:', error.message);

    let errorMessage = 'Password reset failed. The token is invalid, expired, or the user does not exist.';
    let status = 400;

    // Better Auth error messages often contain key phrases indicating failure reasons
    if (error.message.includes('token expired')) {
      errorMessage = 'The reset link has expired. Please request a new one.';
    } else if (error.message.includes('token not found') || error.message.includes('invalid')) {
      errorMessage = 'The reset token is invalid.';
    }

    return {
      status: status, 
      body: { error: errorMessage }
    };
  }
};


// // In a Motia project, the Motia runtime automatically handles imports and logging.

// import { auth } from './../../lib/auth'; // Reuses the Better Auth configuration

// // 1. Motia Step Configuration
// export const config = {
//   name: 'ResetPassword',
//   type: 'api',
//   path: '/auth/reset-password', 
//   method: 'POST',
//   description: 'Verifies the reset token and updates the user password via Better Auth.',
//     emits: [],
//     flows: ['auth'],
// };

// // 2. Motia Step Handler
// export const handler = async (req: any, ctx: any) => {
//   const { logger } = ctx;
//   // This expects the token from the email link and the new password from the frontend form.
//   const { token, email, newPassword } = req.body; 

//   if (!token || !email || !newPassword) {
//     return {
//       status: 400,
//       body: { error: 'Missing required fields: token, email, or new password.' }
//     };
//   }

//   try {
//     // Call the Better Auth API method to reset the password.
//     // Better Auth verifies the token, checks expiry, updates the password, and invalidates the token.
//     await auth.api.resetPassword({
//       body: { 
//         token,
//         email, 
//         newPassword: newPassword,
//       },
//     });

//     logger.info(`Password successfully reset for user: ${email}`);

//     return {
//       status: 200,
//       body: { message: 'Password reset successful. You can now log in with your new password.' }
//     };
//   } catch (error: any) {
//     logger.error('Password reset failed:', error.message);

//     let errorMessage = 'Password reset failed. The token is invalid, expired, or the user does not exist.';
//     let status = 400;

//     // Better Auth error messages often contain key phrases indicating failure reasons
//     if (error.message.includes('token expired')) {
//       errorMessage = 'The reset link has expired. Please request a new one.';
//     } else if (error.message.includes('token not found') || error.message.includes('invalid')) {
//       errorMessage = 'The reset token is invalid.';
//     }

//     return {
//       status: status, 
//       body: { error: errorMessage }
//     };
//   }
// };
