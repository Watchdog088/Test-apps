import { PrismaClient } from '@prisma/client';
declare let prisma: PrismaClient;
export declare const connectDB: () => Promise<void>;
export declare const getDB: () => PrismaClient;
export declare const closeDB: () => Promise<void>;
export { prisma };
