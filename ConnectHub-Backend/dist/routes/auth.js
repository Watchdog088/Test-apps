"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = require("../config/database");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const logger_1 = __importDefault(require("../config/logger"));
const router = express_1.default.Router();
const registerValidation = [
    (0, express_validator_1.body)('username').isLength({ min: 3, max: 30 }).withMessage('Username must be 3-30 characters'),
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    (0, express_validator_1.body)('firstName').optional().isLength({ min: 1, max: 50 }).withMessage('First name must be 1-50 characters'),
    (0, express_validator_1.body)('lastName').optional().isLength({ min: 1, max: 50 }).withMessage('Last name must be 1-50 characters')
];
const loginValidation = [
    (0, express_validator_1.body)('email').isEmail().withMessage('Valid email is required'),
    (0, express_validator_1.body)('password').isLength({ min: 1 }).withMessage('Password is required')
];
const generateTokens = (userId) => {
    const accessToken = jsonwebtoken_1.default.sign({ userId }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
    const refreshToken = jsonwebtoken_1.default.sign({ userId }, process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret', { expiresIn: '30d' });
    return { accessToken, refreshToken };
};
router.post('/register', registerValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { username, email, password, firstName, lastName } = req.body;
        const existingUser = await database_1.prisma.user.findFirst({
            where: {
                OR: [
                    { email: email },
                    { username: username }
                ]
            }
        });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email or username already exists'
            });
        }
        const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
        const hashedPassword = await bcryptjs_1.default.hash(password, saltRounds);
        const { accessToken, refreshToken } = generateTokens('temp');
        const user = await database_1.prisma.user.create({
            data: {
                username,
                email,
                passwordHash: hashedPassword,
                firstName: firstName || null,
                lastName: lastName || null,
                refreshToken,
                isVerified: false,
                isActive: true,
                lastActiveAt: new Date()
            }
        });
        const finalTokens = generateTokens(user.id);
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: { refreshToken: finalTokens.refreshToken }
        });
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isVerified: user.isVerified
                },
                tokens: finalTokens
            }
        });
    }
    catch (error) {
        logger_1.default.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
});
router.post('/login', loginValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const { email, password } = req.body;
        const user = await database_1.prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        const isPasswordValid = await bcryptjs_1.default.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        const { accessToken, refreshToken } = generateTokens(user.id);
        await database_1.prisma.user.update({
            where: { id: user.id },
            data: {
                refreshToken,
                lastActiveAt: new Date()
            }
        });
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    isVerified: user.isVerified,
                    avatar: user.avatar
                },
                tokens: {
                    accessToken,
                    refreshToken
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during login'
        });
    }
});
router.get('/me', auth_1.authenticate, async (req, res) => {
    try {
        const user = await database_1.prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                username: true,
                email: true,
                firstName: true,
                lastName: true,
                bio: true,
                avatar: true,
                isVerified: true,
                createdAt: true,
                lastActiveAt: true,
                followersCount: true,
                followingCount: true,
                postsCount: true
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        res.status(200).json({
            success: true,
            data: { user }
        });
    }
    catch (error) {
        logger_1.default.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/logout', auth_1.authenticate, async (req, res) => {
    try {
        await database_1.prisma.user.update({
            where: { id: req.user.id },
            data: { refreshToken: null }
        });
        res.status(200).json({
            success: true,
            message: 'Logout successful'
        });
    }
    catch (error) {
        logger_1.default.error('Logout error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during logout'
        });
    }
});
exports.default = router;
//# sourceMappingURL=auth.js.map