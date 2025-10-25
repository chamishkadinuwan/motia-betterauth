import { prisma } from '../../lib/prisma'; 

/**
 * Motia API Step Configuration
 */
export const config = {
  name: 'PrismaClientCheck',
  type: 'api',
  path: '/test-db-connection', 
  method: 'GET',
  description: 'Checks if the Prisma client is initialized and connected to the database.',
    emits: [],
    flows: [],
};

/**
 * Motia Step Handler: Queries the User table count to verify database connectivity.
 */
export const handler = async (req: any, ctx: any) => {
  const { logger } = ctx;

  try {
    // Attempt a simple query (e.g., counting users). 
    // This confirms both the Prisma client is initialized and the DB is reachable.
    // 'prisma.user' is assumed to exist from the Better Auth schema setup.
    const userCount = await prisma.user.count(); 
    
    logger.info(`Prisma check successful. User count: ${userCount}`);

    return {
      status: 200,
      body: { 
        message: 'Database connection successful. User count: ' + userCount,
        count: userCount
      }
    };
  } catch (error: any) {
    // Log detailed error for debugging in the Motia Workbench
    logger.error('Prisma connection failed. Ensure DATABASE_URL is correct and migrations ran:', error.message);

    // Return a generic error to the client
    return {
      status: 500,
      body: { error: 'Database connection failed. Please check backend logs for details.' }
    };
  }
};
