"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.closeRedis = exports.getRedisClient = exports.connectRedis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const logger_1 = __importDefault(require("./logger"));
let redisClient = null;
const connectRedis = async () => {
    try {
        const redisUrl = process.env.REDIS_URL;
        if (!redisUrl || redisUrl.includes('localhost')) {
            logger_1.default.info('Redis not configured or not available, skipping Redis connection');
            return null;
        }
        redisClient = new ioredis_1.default(redisUrl, {
            maxRetriesPerRequest: 3,
            lazyConnect: true
        });
        await redisClient.connect();
        redisClient.on('error', (error) => {
            logger_1.default.error('Redis connection error:', error);
        });
        redisClient.on('connect', () => {
            logger_1.default.info('Connected to Redis');
        });
        return redisClient;
    }
    catch (error) {
        logger_1.default.warn('Redis connection failed, continuing without Redis:', error);
        return null;
    }
};
exports.connectRedis = connectRedis;
const getRedisClient = () => {
    return redisClient;
};
exports.getRedisClient = getRedisClient;
const closeRedis = async () => {
    if (redisClient) {
        await redisClient.disconnect();
        redisClient = null;
    }
};
exports.closeRedis = closeRedis;
//# sourceMappingURL=redis.js.map