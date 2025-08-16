"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateFileUpload = exports.sanitizeInput = exports.schemas = exports.validateParams = exports.validateQuery = exports.validateBody = void 0;
const zod_1 = require("zod");
const logger_1 = __importDefault(require("../config/logger"));
const validateBody = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.body);
            req.body = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                return res.status(400).json({ error: 'Validation failed', errors });
            }
            logger_1.default.error('Validation middleware error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
};
exports.validateBody = validateBody;
const validateQuery = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.query);
            req.query = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                return res.status(400).json({ error: 'Validation failed', errors });
            }
            logger_1.default.error('Query validation middleware error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
};
exports.validateQuery = validateQuery;
const validateParams = (schema) => {
    return (req, res, next) => {
        try {
            const validatedData = schema.parse(req.params);
            req.params = validatedData;
            next();
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                const errors = error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }));
                return res.status(400).json({ error: 'Validation failed', errors });
            }
            logger_1.default.error('Params validation middleware error:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    };
};
exports.validateParams = validateParams;
exports.schemas = {
    id: zod_1.z.object({
        id: zod_1.z.string().cuid('Invalid ID format'),
    }),
    pagination: zod_1.z.object({
        page: zod_1.z.coerce.number().min(1).default(1),
        limit: zod_1.z.coerce.number().min(1).max(100).default(10),
    }),
    userRegistration: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
        username: zod_1.z
            .string()
            .min(3, 'Username must be at least 3 characters')
            .max(30, 'Username must be less than 30 characters')
            .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
        password: zod_1.z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
        firstName: zod_1.z.string().min(1, 'First name is required').optional(),
        lastName: zod_1.z.string().min(1, 'Last name is required').optional(),
    }),
    userLogin: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
    userUpdate: zod_1.z.object({
        firstName: zod_1.z.string().min(1).optional(),
        lastName: zod_1.z.string().min(1).optional(),
        bio: zod_1.z.string().max(500).optional(),
        location: zod_1.z.string().max(100).optional(),
        website: zod_1.z.string().url().optional(),
        dateOfBirth: zod_1.z.string().datetime().optional(),
        phone: zod_1.z.string().regex(/^\+?[\d\s-()]+$/).optional(),
        isPrivate: zod_1.z.boolean().optional(),
    }),
    postCreate: zod_1.z.object({
        content: zod_1.z.string().min(1, 'Content is required').max(2000),
        contentType: zod_1.z.enum(['text', 'image', 'video', 'mixed']),
        mediaUrls: zod_1.z.array(zod_1.z.string().url()).default([]),
        hashtags: zod_1.z.array(zod_1.z.string()).default([]),
        mentions: zod_1.z.array(zod_1.z.string()).default([]),
        visibility: zod_1.z.enum(['public', 'followers', 'private']).default('public'),
        location: zod_1.z.string().optional(),
    }),
    postUpdate: zod_1.z.object({
        content: zod_1.z.string().min(1).max(2000).optional(),
        visibility: zod_1.z.enum(['public', 'followers', 'private']).optional(),
        location: zod_1.z.string().optional(),
    }),
    commentCreate: zod_1.z.object({
        content: zod_1.z.string().min(1, 'Comment content is required').max(500),
        parentCommentId: zod_1.z.string().cuid().optional(),
    }),
    datingProfileCreate: zod_1.z.object({
        age: zod_1.z.number().min(18, 'Must be at least 18 years old').max(100),
        bio: zod_1.z.string().min(10, 'Bio must be at least 10 characters').max(500),
        interests: zod_1.z.array(zod_1.z.string()).min(1, 'At least one interest is required'),
        photos: zod_1.z.array(zod_1.z.string().url()).min(1, 'At least one photo is required').max(6),
        location: zod_1.z.object({
            latitude: zod_1.z.number().min(-90).max(90),
            longitude: zod_1.z.number().min(-180).max(180),
            city: zod_1.z.string(),
            country: zod_1.z.string(),
        }),
        preferences: zod_1.z.object({
            ageMin: zod_1.z.number().min(18).max(100),
            ageMax: zod_1.z.number().min(18).max(100),
            maxDistance: zod_1.z.number().min(1).max(1000),
            interestedIn: zod_1.z.enum(['men', 'women', 'everyone']),
        }),
    }),
    datingProfileUpdate: zod_1.z.object({
        bio: zod_1.z.string().min(10).max(500).optional(),
        interests: zod_1.z.array(zod_1.z.string()).optional(),
        photos: zod_1.z.array(zod_1.z.string().url()).max(6).optional(),
        preferences: zod_1.z.object({
            ageMin: zod_1.z.number().min(18).max(100).optional(),
            ageMax: zod_1.z.number().min(18).max(100).optional(),
            maxDistance: zod_1.z.number().min(1).max(1000).optional(),
            interestedIn: zod_1.z.enum(['men', 'women', 'everyone']).optional(),
        }).optional(),
        isActive: zod_1.z.boolean().optional(),
    }),
    swipe: zod_1.z.object({
        swipedUserId: zod_1.z.string().cuid(),
        action: zod_1.z.enum(['like', 'pass', 'superlike']),
    }),
    dateRequest: zod_1.z.object({
        toUserId: zod_1.z.string().cuid(),
        matchId: zod_1.z.string().cuid(),
        message: zod_1.z.string().min(1).max(500),
        proposedDate: zod_1.z.string().datetime(),
        location: zod_1.z.string().min(1).max(200),
        dateType: zod_1.z.enum(['coffee', 'dinner', 'activity', 'drinks', 'lunch', 'custom']),
    }),
    messageCreate: zod_1.z.object({
        conversationId: zod_1.z.string().cuid(),
        receiverId: zod_1.z.string().cuid(),
        content: zod_1.z.string().min(1).max(1000),
        messageType: zod_1.z.enum(['text', 'image', 'video', 'audio', 'file', 'location', 'date_request']).default('text'),
        mediaUrl: zod_1.z.string().url().optional(),
        replyToMessageId: zod_1.z.string().cuid().optional(),
    }),
    report: zod_1.z.object({
        targetId: zod_1.z.string().cuid(),
        targetType: zod_1.z.enum(['user', 'post', 'comment', 'message']),
        reason: zod_1.z.string().min(1).max(100),
        description: zod_1.z.string().max(500).optional(),
    }),
    passwordReset: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
    }),
    passwordChange: zod_1.z.object({
        token: zod_1.z.string().min(1),
        newPassword: zod_1.z
            .string()
            .min(8, 'Password must be at least 8 characters')
            .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number'),
    }),
    emailVerification: zod_1.z.object({
        token: zod_1.z.string().min(1),
    }),
    refreshToken: zod_1.z.object({
        refreshToken: zod_1.z.string().min(1),
    }),
};
const sanitizeInput = (input) => {
    return input
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/<[^>]*>?/gm, '')
        .trim();
};
exports.sanitizeInput = sanitizeInput;
const validateFileUpload = (allowedTypes, maxSize) => {
    return (req, res, next) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        if (!allowedTypes.includes(req.file.mimetype)) {
            return res.status(400).json({
                error: 'Invalid file type',
                allowedTypes
            });
        }
        if (req.file.size > maxSize) {
            return res.status(400).json({
                error: 'File too large',
                maxSize: `${maxSize / (1024 * 1024)}MB`
            });
        }
        next();
    };
};
exports.validateFileUpload = validateFileUpload;
//# sourceMappingURL=validation.js.map