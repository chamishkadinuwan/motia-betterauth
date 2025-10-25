// steps/auth/logout.step.ts
import { auth } from '../../lib/auth';
import { betterAuthMiddleware } from '../../middlewares/better-auth.middleware';

export const config = {
  name: 'UserLogout',
  type: 'api',
  path: '/api/auth/logout',
  method: 'POST',
  middleware: [betterAuthMiddleware],
  emits: [],
  flows: ['auth']
};

export const handler = async (req: any, ctx: any) => {
  try {
    // Use type assertion to fix TypeScript errors
    const result = await (auth as any).signOut({
      sessionId: ctx.session.id
    });

    return {
      status: 200,
      body: { 
        success: true,
        message: 'Logged out successfully' 
      }
    };
  } catch (error: any) {
    ctx.logger.error('Logout error:', error);
    return {
      status: 500,
      body: { 
        success: false,
        error: 'LOGOUT_FAILED',
        message: 'Logout process failed' 
      }
    };
  }
};