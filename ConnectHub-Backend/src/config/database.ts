import { PrismaClient } from '@prisma/client';
import logger from './logger';

let prisma: PrismaClient;

export const connectDB = async (): Promise<void> => {
  try {
    prisma = new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
    });

    // Test the connection
    await prisma.$connect();
    
    // Test with a simple query
    await prisma.$queryRaw`SELECT 1`;

    logger.info('✅ Database connected successfully (SQLite with Prisma)');
  } catch (error) {
    logger.error('❌ Database connection error:', error);
    throw error;
  }
};

export const getDB = (): PrismaClient => {
  if (!prisma) {
    throw new Error('Database not initialized. Call connectDB first.');
  }
  return prisma;
};

export const closeDB = async (): Promise<void> => {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('✅ Database connection closed');
  }
};

// Export the prisma client directly for use in routes
export { prisma };
