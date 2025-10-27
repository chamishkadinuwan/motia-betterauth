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

// DATABASE_URL="postgres://64c6167b9523d34f3be344894e0fc166799770b163df1c3e34097aa08aebc6d0:sk_tmUMMIHAaNxNoTlK3PP5M@db.prisma.io:5432/postgres?sslmode=require"
// BETTER_AUTH_SECRET="l48rUGjJLbT67ZwyjQrDK1OCl35QDCVc"
// BETTER_AUTH_URL="http://localhost:3000"