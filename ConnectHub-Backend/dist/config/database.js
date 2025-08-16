"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = exports.closeDB = exports.getDB = exports.connectDB = void 0;
const client_1 = require("@prisma/client");
const logger_1 = __importDefault(require("./logger"));
let prisma;
const connectDB = async () => {
    try {
        exports.prisma = prisma = new client_1.PrismaClient({
            log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
        });
        await prisma.$connect();
        await prisma.$queryRaw `SELECT 1`;
        logger_1.default.info('✅ Database connected successfully (SQLite with Prisma)');
    }
    catch (error) {
        logger_1.default.error('❌ Database connection error:', error);
        throw error;
    }
};
exports.connectDB = connectDB;
const getDB = () => {
    if (!prisma) {
        throw new Error('Database not initialized. Call connectDB first.');
    }
    return prisma;
};
exports.getDB = getDB;
const closeDB = async () => {
    if (prisma) {
        await prisma.$disconnect();
        logger_1.default.info('✅ Database connection closed');
    }
};
exports.closeDB = closeDB;
//# sourceMappingURL=database.js.map