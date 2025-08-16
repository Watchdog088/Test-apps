"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const express_validator_1 = require("express-validator");
const auth_1 = require("../middleware/auth");
const logger_1 = __importDefault(require("../config/logger"));
const matchingAlgorithm_1 = require("../services/matchingAlgorithm");
const router = express_1.default.Router();
const createProfileValidation = [
    (0, express_validator_1.body)('age').isInt({ min: 18, max: 100 }).withMessage('Age must be between 18-100'),
    (0, express_validator_1.body)('bio').isLength({ min: 10, max: 500 }).withMessage('Bio must be 10-500 characters'),
    (0, express_validator_1.body)('interests').isArray({ min: 1, max: 20 }).withMessage('1-20 interests required'),
    (0, express_validator_1.body)('photos').isArray({ min: 1, max: 6 }).withMessage('1-6 photos required'),
    (0, express_validator_1.body)('location.latitude').isFloat({ min: -90, max: 90 }).withMessage('Invalid latitude'),
    (0, express_validator_1.body)('location.longitude').isFloat({ min: -180, max: 180 }).withMessage('Invalid longitude'),
    (0, express_validator_1.body)('location.city').isLength({ min: 1, max: 100 }).withMessage('City required'),
    (0, express_validator_1.body)('location.country').isLength({ min: 1, max: 100 }).withMessage('Country required'),
    (0, express_validator_1.body)('preferences.ageMin').isInt({ min: 18, max: 100 }).withMessage('Invalid age minimum'),
    (0, express_validator_1.body)('preferences.ageMax').isInt({ min: 18, max: 100 }).withMessage('Invalid age maximum'),
    (0, express_validator_1.body)('preferences.maxDistance').isInt({ min: 1, max: 1000 }).withMessage('Distance 1-1000km'),
    (0, express_validator_1.body)('preferences.interestedIn').isIn(['male', 'female', 'everyone']).withMessage('Invalid preference')
];
const updateProfileValidation = [
    (0, express_validator_1.body)('age').optional().isInt({ min: 18, max: 100 }).withMessage('Age must be between 18-100'),
    (0, express_validator_1.body)('bio').optional().isLength({ min: 10, max: 500 }).withMessage('Bio must be 10-500 characters'),
    (0, express_validator_1.body)('interests').optional().isArray({ max: 20 }).withMessage('Max 20 interests'),
    (0, express_validator_1.body)('photos').optional().isArray({ max: 6 }).withMessage('Max 6 photos'),
    (0, express_validator_1.body)('isActive').optional().isBoolean().withMessage('isActive must be boolean')
];
const swipeValidation = [
    (0, express_validator_1.body)('targetUserId').isLength({ min: 1 }).withMessage('Target user ID required'),
    (0, express_validator_1.body)('action').isIn(['like', 'pass', 'superlike']).withMessage('Invalid swipe action')
];
const discoveryValidation = [
    (0, express_validator_1.query)('page').optional().isInt({ min: 1 }).withMessage('Page must be positive integer'),
    (0, express_validator_1.query)('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
    (0, express_validator_1.query)('maxDistance').optional().isInt({ min: 1, max: 1000 }).withMessage('Distance 1-1000km'),
    (0, express_validator_1.query)('ageMin').optional().isInt({ min: 18, max: 100 }).withMessage('Invalid age minimum'),
    (0, express_validator_1.query)('ageMax').optional().isInt({ min: 18, max: 100 }).withMessage('Invalid age maximum')
];
router.post('/profile', auth_1.authenticate, createProfileValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const userId = req.user.id;
        const { age, bio, interests, photos, location, preferences } = req.body;
        const existingProfile = await database_1.prisma.datingProfile.findUnique({
            where: { userId }
        });
        if (existingProfile) {
            return res.status(400).json({
                success: false,
                message: 'Dating profile already exists. Use PUT to update.'
            });
        }
        const profile = await database_1.prisma.datingProfile.create({
            data: {
                userId,
                age,
                bio,
                interests: JSON.stringify(interests),
                photos: JSON.stringify(photos),
                location: JSON.stringify(location),
                preferences: JSON.stringify(preferences),
                isActive: true,
                isVerified: false
            }
        });
        res.status(201).json({
            success: true,
            message: 'Dating profile created successfully',
            data: { profile }
        });
    }
    catch (error) {
        logger_1.default.error('Create dating profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/profile', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const profile = await database_1.prisma.datingProfile.findUnique({
            where: { userId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatar: true
                    }
                }
            }
        });
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Dating profile not found'
            });
        }
        const profileData = {
            ...profile,
            interests: JSON.parse(profile.interests),
            photos: JSON.parse(profile.photos),
            location: JSON.parse(profile.location),
            preferences: JSON.parse(profile.preferences)
        };
        res.status(200).json({
            success: true,
            data: { profile: profileData }
        });
    }
    catch (error) {
        logger_1.default.error('Get dating profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.put('/profile', auth_1.authenticate, updateProfileValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const userId = req.user.id;
        const updateData = req.body;
        const existingProfile = await database_1.prisma.datingProfile.findUnique({
            where: { userId }
        });
        if (!existingProfile) {
            return res.status(404).json({
                success: false,
                message: 'Dating profile not found'
            });
        }
        const profileUpdate = {
            updatedAt: new Date()
        };
        if (updateData.age !== undefined)
            profileUpdate.age = updateData.age;
        if (updateData.bio !== undefined)
            profileUpdate.bio = updateData.bio;
        if (updateData.interests !== undefined)
            profileUpdate.interests = JSON.stringify(updateData.interests);
        if (updateData.photos !== undefined)
            profileUpdate.photos = JSON.stringify(updateData.photos);
        if (updateData.location !== undefined)
            profileUpdate.location = JSON.stringify(updateData.location);
        if (updateData.preferences !== undefined)
            profileUpdate.preferences = JSON.stringify(updateData.preferences);
        if (updateData.isActive !== undefined)
            profileUpdate.isActive = updateData.isActive;
        const updatedProfile = await database_1.prisma.datingProfile.update({
            where: { userId },
            data: profileUpdate
        });
        res.status(200).json({
            success: true,
            message: 'Dating profile updated successfully',
            data: { profile: updatedProfile }
        });
    }
    catch (error) {
        logger_1.default.error('Update dating profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/discover', auth_1.authenticate, discoveryValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 50);
        const skip = (page - 1) * limit;
        const userProfile = await database_1.prisma.datingProfile.findUnique({
            where: { userId, isActive: true }
        });
        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: 'Dating profile not found. Please create a profile first.'
            });
        }
        const userPreferences = JSON.parse(userProfile.preferences);
        const swipedUserIds = await database_1.prisma.swipe.findMany({
            where: { swiperId: userId },
            select: { swipedUserId: true }
        });
        const excludeUserIds = swipedUserIds.map(s => s.swipedUserId);
        excludeUserIds.push(userId);
        const whereConditions = {
            userId: {
                notIn: excludeUserIds
            },
            isActive: true,
            user: {
                isActive: true
            }
        };
        const ageMin = parseInt(req.query.ageMin) || userPreferences.ageMin;
        const ageMax = parseInt(req.query.ageMax) || userPreferences.ageMax;
        if (ageMin)
            whereConditions.age = { ...whereConditions.age, gte: ageMin };
        if (ageMax)
            whereConditions.age = { ...whereConditions.age, lte: ageMax };
        const profiles = await database_1.prisma.datingProfile.findMany({
            where: whereConditions,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        avatar: true,
                        isVerified: true
                    }
                }
            },
            skip,
            take: limit,
            orderBy: {
                lastActive: 'desc'
            }
        });
        const formattedProfiles = profiles.map(profile => ({
            ...profile,
            interests: JSON.parse(profile.interests),
            photos: JSON.parse(profile.photos),
            location: JSON.parse(profile.location),
            preferences: JSON.parse(profile.preferences)
        }));
        res.status(200).json({
            success: true,
            data: {
                profiles: formattedProfiles,
                pagination: {
                    page,
                    limit,
                    hasNext: profiles.length === limit,
                    hasPrev: page > 1
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Discover profiles error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.post('/swipe', auth_1.authenticate, swipeValidation, async (req, res) => {
    try {
        const errors = (0, express_validator_1.validationResult)(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                errors: errors.array()
            });
        }
        const swiperId = req.user.id;
        const { targetUserId, action } = req.body;
        if (swiperId === targetUserId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot swipe on yourself'
            });
        }
        const targetProfile = await database_1.prisma.datingProfile.findFirst({
            where: {
                userId: targetUserId,
                isActive: true,
                user: { isActive: true }
            }
        });
        if (!targetProfile) {
            return res.status(404).json({
                success: false,
                message: 'Target user not found or inactive'
            });
        }
        const existingSwipe = await database_1.prisma.swipe.findUnique({
            where: {
                swiperId_swipedUserId: {
                    swiperId,
                    swipedUserId: targetUserId
                }
            }
        });
        if (existingSwipe) {
            return res.status(400).json({
                success: false,
                message: 'You have already swiped on this user'
            });
        }
        const swipe = await database_1.prisma.swipe.create({
            data: {
                swiperId,
                swipedUserId: targetUserId,
                action
            }
        });
        let isMatch = false;
        let matchId = null;
        if (action === 'like' || action === 'superlike') {
            const mutualSwipe = await database_1.prisma.swipe.findFirst({
                where: {
                    swiperId: targetUserId,
                    swipedUserId: swiperId,
                    action: { in: ['like', 'superlike'] }
                }
            });
            if (mutualSwipe) {
                isMatch = true;
                const user1Id = swiperId < targetUserId ? swiperId : targetUserId;
                const user2Id = swiperId < targetUserId ? targetUserId : swiperId;
                const match = await database_1.prisma.match.upsert({
                    where: {
                        user1Id_user2Id: {
                            user1Id,
                            user2Id
                        }
                    },
                    update: {
                        isActive: true
                    },
                    create: {
                        user1Id,
                        user2Id,
                        isActive: true
                    }
                });
                matchId = match.id;
                logger_1.default.info(`New match created: ${swiperId} ↔ ${targetUserId}`);
            }
        }
        res.status(200).json({
            success: true,
            message: isMatch ? "It's a match! 🎉" : 'Swipe recorded successfully',
            data: {
                swipe,
                isMatch,
                matchId
            }
        });
    }
    catch (error) {
        logger_1.default.error('Swipe action error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/matches', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 20, 50);
        const skip = (page - 1) * limit;
        const matches = await database_1.prisma.match.findMany({
            where: {
                OR: [
                    { user1Id: userId },
                    { user2Id: userId }
                ],
                isActive: true
            },
            include: {
                user1: {
                    include: {
                        datingProfile: true
                    }
                },
                user2: {
                    include: {
                        datingProfile: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            skip,
            take: limit
        });
        const formattedMatches = matches.map(match => {
            const otherUser = match.user1Id === userId ? match.user2 : match.user1;
            const otherProfile = otherUser.datingProfile;
            return {
                matchId: match.id,
                matchedAt: match.createdAt,
                otherUser: {
                    id: otherUser.id,
                    username: otherUser.username,
                    firstName: otherUser.firstName,
                    lastName: otherUser.lastName,
                    avatar: otherUser.avatar,
                    isVerified: otherUser.isVerified
                },
                profile: otherProfile ? {
                    age: otherProfile.age,
                    bio: otherProfile.bio,
                    photos: JSON.parse(otherProfile.photos),
                    interests: JSON.parse(otherProfile.interests)
                } : null,
                lastMessageAt: match.lastMessageAt
            };
        });
        const total = await database_1.prisma.match.count({
            where: {
                OR: [
                    { user1Id: userId },
                    { user2Id: userId }
                ],
                isActive: true
            }
        });
        res.status(200).json({
            success: true,
            data: {
                matches: formattedMatches,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: page * limit < total,
                    hasPrev: page > 1
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Get matches error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.delete('/matches/:matchId', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { matchId } = req.params;
        const match = await database_1.prisma.match.findFirst({
            where: {
                id: matchId,
                OR: [
                    { user1Id: userId },
                    { user2Id: userId }
                ],
                isActive: true
            }
        });
        if (!match) {
            return res.status(404).json({
                success: false,
                message: 'Match not found or access denied'
            });
        }
        await database_1.prisma.match.update({
            where: { id: matchId },
            data: {
                isActive: false
            }
        });
        res.status(200).json({
            success: true,
            message: 'Match removed successfully',
            data: { matchId }
        });
    }
    catch (error) {
        logger_1.default.error('Remove match error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/stats', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const [likesSent, likesReceived, totalMatches, profileViews] = await Promise.all([
            database_1.prisma.swipe.count({
                where: {
                    swiperId: userId,
                    action: { in: ['like', 'superlike'] }
                }
            }),
            database_1.prisma.swipe.count({
                where: {
                    swipedUserId: userId,
                    action: { in: ['like', 'superlike'] }
                }
            }),
            database_1.prisma.match.count({
                where: {
                    OR: [
                        { user1Id: userId },
                        { user2Id: userId }
                    ],
                    isActive: true
                }
            }),
            database_1.prisma.swipe.count({
                where: {
                    swipedUserId: userId
                }
            })
        ]);
        const stats = {
            totalLikesSent: likesSent,
            totalLikesReceived: likesReceived,
            totalMatches: totalMatches,
            profileViews: profileViews,
            matchRate: likesSent > 0 ? (totalMatches / likesSent * 100) : 0
        };
        res.status(200).json({
            success: true,
            data: { stats }
        });
    }
    catch (error) {
        logger_1.default.error('Get dating stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
router.get('/smart-matches', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const limit = Math.min(parseInt(req.query.limit) || 10, 20);
        const userProfile = await database_1.prisma.datingProfile.findUnique({
            where: { userId, isActive: true }
        });
        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: 'Dating profile not found. Please create a profile first.'
            });
        }
        const smartMatches = await matchingAlgorithm_1.matchingAlgorithm.getSmartMatches(userId, limit);
        const detailedMatches = await Promise.all(smartMatches.map(async (match) => {
            const profile = await database_1.prisma.datingProfile.findUnique({
                where: { userId: match.userId },
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                            avatar: true,
                            isVerified: true
                        }
                    }
                }
            });
            if (!profile)
                return null;
            return {
                user: profile.user,
                profile: {
                    age: profile.age,
                    bio: profile.bio,
                    photos: JSON.parse(profile.photos),
                    interests: JSON.parse(profile.interests),
                    location: JSON.parse(profile.location)
                },
                matchScore: {
                    overall: Math.round(match.overallScore * 100),
                    compatibility: Math.round(match.compatibilityScore * 100),
                    interests: Math.round(match.interestScore * 100),
                    activity: Math.round(match.activityScore * 100),
                    location: Math.round(match.locationScore * 100),
                    reasons: match.reasons
                }
            };
        }));
        const validMatches = detailedMatches.filter(match => match !== null);
        res.status(200).json({
            success: true,
            message: 'AI-powered smart matches generated successfully',
            data: {
                matches: validMatches,
                algorithm: 'ConnectHub AI Matching v1.0',
                totalFound: validMatches.length
            }
        });
    }
    catch (error) {
        logger_1.default.error('Smart matches error:', error);
        res.status(500).json({
            success: false,
            message: 'Error generating smart matches'
        });
    }
});
router.post('/update-preferences', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const userProfile = await database_1.prisma.datingProfile.findUnique({
            where: { userId, isActive: true }
        });
        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: 'Dating profile not found'
            });
        }
        await matchingAlgorithm_1.matchingAlgorithm.updateUserPreferences(userId);
        res.status(200).json({
            success: true,
            message: 'AI preferences updated based on your activity',
            data: {
                updated: true,
                message: 'Future matches will be more personalized'
            }
        });
    }
    catch (error) {
        logger_1.default.error('Update AI preferences error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating preferences'
        });
    }
});
router.get('/compatibility/:targetUserId', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const { targetUserId } = req.params;
        if (userId === targetUserId) {
            return res.status(400).json({
                success: false,
                message: 'Cannot check compatibility with yourself'
            });
        }
        const [userProfile, targetProfile] = await Promise.all([
            database_1.prisma.datingProfile.findUnique({
                where: { userId, isActive: true },
                include: { user: true }
            }),
            database_1.prisma.datingProfile.findUnique({
                where: { userId: targetUserId, isActive: true },
                include: { user: true }
            })
        ]);
        if (!userProfile) {
            return res.status(404).json({
                success: false,
                message: 'Your dating profile not found'
            });
        }
        if (!targetProfile) {
            return res.status(404).json({
                success: false,
                message: 'Target user profile not found'
            });
        }
        const userProfileData = {
            id: userId,
            age: userProfile.age,
            bio: userProfile.bio,
            interests: JSON.parse(userProfile.interests),
            photos: JSON.parse(userProfile.photos),
            location: JSON.parse(userProfile.location),
            preferences: JSON.parse(userProfile.preferences),
            lastActive: userProfile.lastActive,
            isVerified: userProfile.user.isVerified
        };
        const targetProfileData = {
            id: targetUserId,
            age: targetProfile.age,
            bio: targetProfile.bio,
            interests: JSON.parse(targetProfile.interests),
            photos: JSON.parse(targetProfile.photos),
            location: JSON.parse(targetProfile.location),
            preferences: JSON.parse(targetProfile.preferences),
            lastActive: targetProfile.lastActive,
            isVerified: targetProfile.user.isVerified
        };
        const compatibility = matchingAlgorithm_1.matchingAlgorithm.calculateMatchScore(userProfileData, targetProfileData);
        res.status(200).json({
            success: true,
            data: {
                targetUser: {
                    id: targetProfile.user.id,
                    firstName: targetProfile.user.firstName,
                    lastName: targetProfile.user.lastName,
                    avatar: targetProfile.user.avatar
                },
                compatibility: {
                    overall: Math.round(compatibility.overallScore * 100),
                    breakdown: {
                        compatibility: Math.round(compatibility.compatibilityScore * 100),
                        interests: Math.round(compatibility.interestScore * 100),
                        activity: Math.round(compatibility.activityScore * 100),
                        location: Math.round(compatibility.locationScore * 100)
                    },
                    reasons: compatibility.reasons,
                    interpretation: compatibility.overallScore >= 0.8 ? 'Excellent Match' :
                        compatibility.overallScore >= 0.6 ? 'Great Match' :
                            compatibility.overallScore >= 0.4 ? 'Good Match' :
                                compatibility.overallScore >= 0.2 ? 'Fair Match' : 'Low Match'
                }
            }
        });
    }
    catch (error) {
        logger_1.default.error('Compatibility check error:', error);
        res.status(500).json({
            success: false,
            message: 'Error calculating compatibility'
        });
    }
});
exports.default = router;
//# sourceMappingURL=dating.js.map