"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.io = exports.server = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const compression_1 = __importDefault(require("compression"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const http_1 = require("http");
const socket_io_1 = require("socket.io");
const dotenv_1 = __importDefault(require("dotenv"));
require("express-async-errors");
const database_1 = require("./config/database");
const redis_1 = require("./config/redis");
const logger_1 = __importDefault(require("./config/logger"));
const errorHandler = (err, req, res, next) => {
    logger_1.default.error(err.message);
    res.status(err.status || 500).json({
        error: err.message || 'Internal Server Error'
    });
};
const notFound = (req, res, next) => {
    res.status(404).json({
        error: `Not Found - ${req.originalUrl}`
    });
};
const auth_1 = __importDefault(require("./routes/auth"));
const posts_1 = __importDefault(require("./routes/posts"));
const users_1 = __importDefault(require("./routes/users"));
const dating_1 = __importDefault(require("./routes/dating"));
const messages_1 = __importDefault(require("./routes/messages"));
const calls_1 = __importDefault(require("./routes/calls"));
const upload_1 = __importDefault(require("./routes/upload"));
const health_1 = __importDefault(require("./routes/health"));
const content_control_1 = __importDefault(require("./routes/content-control"));
const sockets_1 = require("./sockets");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const server = (0, http_1.createServer)(app);
exports.server = server;
const io = new socket_io_1.Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:3000",
        methods: ["GET", "POST"]
    }
});
exports.io = io;
(0, sockets_1.initializeSocket)(server);
app.set('io', io);
app.use((0, helmet_1.default)({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
}));
const limiter = (0, express_rate_limit_1.default)({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use(limiter);
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
    optionsSuccessStatus: 200
}));
app.use(express_1.default.json({ limit: '50mb' }));
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }));
app.use((0, compression_1.default)());
app.use((req, res, next) => {
    logger_1.default.info(`${req.method} ${req.path} - ${req.ip}`);
    next();
});
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: process.env.API_VERSION || 'v1'
    });
});
const API_VERSION = process.env.API_VERSION || 'v1';
app.use(`/api/${API_VERSION}/health`, health_1.default);
app.use(`/api/${API_VERSION}/auth`, auth_1.default);
app.use(`/api/${API_VERSION}/users`, users_1.default);
app.use(`/api/${API_VERSION}/posts`, posts_1.default);
app.use(`/api/${API_VERSION}/dating`, dating_1.default);
app.use(`/api/${API_VERSION}/messages`, messages_1.default);
app.use(`/api/${API_VERSION}/calls`, calls_1.default);
app.use(`/api/${API_VERSION}/upload`, upload_1.default);
app.use(`/api/${API_VERSION}/content-control`, content_control_1.default);
app.get('/api-docs', (req, res) => {
    res.json({
        message: 'API Documentation',
        version: API_VERSION,
        endpoints: {
            auth: `/api/${API_VERSION}/auth`,
            users: `/api/${API_VERSION}/users`,
            posts: `/api/${API_VERSION}/posts`,
            dating: `/api/${API_VERSION}/dating`,
            messages: `/api/${API_VERSION}/messages`,
            upload: `/api/${API_VERSION}/upload`
        }
    });
});
app.use(notFound);
app.use(errorHandler);
process.on('SIGTERM', () => {
    logger_1.default.info('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        logger_1.default.info('HTTP server closed');
        process.exit(0);
    });
});
process.on('SIGINT', () => {
    logger_1.default.info('SIGINT signal received: closing HTTP server');
    server.close(() => {
        logger_1.default.info('HTTP server closed');
        process.exit(0);
    });
});
const PORT = process.env.PORT || 5000;
async function startServer() {
    try {
        await (0, database_1.connectDB)();
        await (0, redis_1.connectRedis)();
        server.listen(PORT, () => {
            logger_1.default.info(`🚀 Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
            logger_1.default.info(`📚 API Documentation available at http://localhost:${PORT}/api-docs`);
            logger_1.default.info(`🏥 Health check available at http://localhost:${PORT}/health`);
        });
    }
    catch (error) {
        logger_1.default.error('Failed to start server:', error);
        process.exit(1);
    }
}
if (require.main === module) {
    startServer();
}
//# sourceMappingURL=server.js.map