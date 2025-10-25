// steps/profile/get.step.ts
import { betterAuthMiddleware } from '../../middlewares/better-auth.middleware';

export const config = {
  name: 'GetUserProfile',
  type: 'api',
  path: '/api/profile',
  method: 'GET',
  emits: [],
  middleware: [betterAuthMiddleware]
};

export const handler = async (req: any, ctx: any) => {
  return {
    status: 200,
    body: {
      success: true,
      data: {
        profile: {
          id: ctx.user.id,
          email: ctx.user.email,
          name: ctx.user.name,
          createdAt: ctx.user.createdAt,
          // Add other profile fields from your database
        }
      }
    }
  };
};