import Redis from 'ioredis';
import logger from './logger';

let redisClient: Redis | null = null;

export const connectRedis = async (): Promise<Redis | null> => {
  try {
    const redisUrl = process.env.REDIS_URL;
    
    if (!redisUrl || redisUrl.includes('localhost')) {
      logger.info('Redis not configured or not available, skipping Redis connection');
      return null;
    }

    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true
    });

    await redisClient.connect();
    
    redisClient.on('error', (error) => {
      logger.error('Redis connection error:', error);
    });

    redisClient.on('connect', () => {
      logger.info('Connected to Redis');
    });

    return redisClient;
  } catch (error) {
    logger.warn('Redis connection failed, continuing without Redis:', error);
    return null;
  }
};

export const getRedisClient = (): Redis | null => {
  return redisClient;
};

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.disconnect();
    redisClient = null;
  }
};
