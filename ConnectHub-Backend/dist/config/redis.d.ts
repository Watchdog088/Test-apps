import Redis from 'ioredis';
export declare const connectRedis: () => Promise<Redis | null>;
export declare const getRedisClient: () => Redis | null;
export declare const closeRedis: () => Promise<void>;
