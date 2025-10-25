// middlewares/better-auth.middleware.ts
import { ApiMiddleware } from 'motia';
import { auth } from '../lib/auth';

// Extend the correct Motia context types
declare module 'motia' {
  interface FlowContext {
    user?: any;
    session?: any;
  }
}

// Helper function to convert headers to the proper format
function convertHeaders(motiaHeaders: Record<string, string | string[]>): [string, string][] {
  const headers: [string, string][] = [];
  
  for (const [key, value] of Object.entries(motiaHeaders)) {
    if (Array.isArray(value)) {
      value.forEach(v => headers.push([key, v]));
    } else {
      headers.push([key, value]);
    }
  }
  
  return headers;
}

export const betterAuthMiddleware: ApiMiddleware = async (req, ctx, next) => {
  try {
    // Convert headers to the format BetterAuth expects
    const headersArray = convertHeaders(req.headers as Record<string, string | string[]>);
    
    // Use BetterAuth to validate session with properly formatted headers
    const session = await auth.api.getSession({
      headers: headersArray,
    });

    if (!session) {
      return {
        status: 401,
        body: { 
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Valid authentication required' 
        }
      };
    }

    // These should now work with the extended FlowContext
    ctx.user = session.user;
    ctx.session = session;

    return next();
  } catch (error) {
    ctx.logger.error('Authentication middleware error:', error);
    return {
      status: 500,
      body: { 
        success: false,
        error: 'AUTH_SERVICE_ERROR',
        message: 'Authentication service unavailable' 
      }
    };
  }
};