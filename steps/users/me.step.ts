// steps/users/me.step.ts
import { betterAuthMiddleware } from '../../middlewares/better-auth.middleware';
import { prisma } from '../../lib/prisma';

export const config = {
  name: 'GetCurrentUser',
  type: 'api',
  path: '/api/users/me',
  method: 'GET',
  emits: [],
  middleware: [betterAuthMiddleware]
};

export const handler = async (req: any, ctx: any) => {
  try {
    // Fetch complete user data from database
    const userData = await prisma.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
        // Select other fields you want to expose
      }
    });

    if (!userData) {
      return {
        status: 404,
        body: {
          success: false,
          error: 'USER_NOT_FOUND',
          message: 'User data not found'
        }
      };
    }

    return {
      status: 200,
      body: {
        success: true,
        data: {
          user: userData
        }
      }
    };
  } catch (error) {
    ctx.logger.error('Get user error:', error);
    return {
      status: 500,
      body: {
        success: false,
        error: 'FETCH_USER_FAILED',
        message: 'Failed to retrieve user data'
      }
    };
  }
};