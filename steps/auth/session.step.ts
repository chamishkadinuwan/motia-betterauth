// steps/auth/session.step.ts
import { betterAuthMiddleware } from '../../middlewares/better-auth.middleware';

export const config = {
  name: 'GetSession',
  type: 'api',
  path: '/api/auth/session',
  method: 'GET',
  middleware: [betterAuthMiddleware],
  emits: [],
  flows: ['auth']
};

export const handler = async (req: any, ctx: any) => {
  return {
    status: 200,
    body: {
      success: true,
      data: {
        user: {
          id: ctx.user.id,
          email: ctx.user.email,
          name: ctx.user.name,
        },
        session: {
          id: ctx.session.id,
          expiresAt: ctx.session.expiresAt
        }
      }
    }
  };
};