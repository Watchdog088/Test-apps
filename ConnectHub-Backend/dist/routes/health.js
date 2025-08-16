"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const router = express_1.default.Router();
router.get('/', async (req, res) => {
    try {
        await database_1.prisma.$queryRaw `SELECT 1`;
        res.status(200).json({
            status: 'OK',
            timestamp: new Date().toISOString(),
            database: 'Connected',
            version: '1.0.0'
        });
    }
    catch (error) {
        res.status(503).json({
            status: 'Service Unavailable',
            database: 'Disconnected',
            error: error.message
        });
    }
});
exports.default = router;
//# sourceMappingURL=health.js.map