"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const database_1 = require("../config/database");
const auth_1 = require("../middleware/auth");
const validation_1 = require("../middleware/validation");
const zod_1 = require("zod");
const router = express_1.default.Router();
const initiateCallSchema = zod_1.z.object({
    recipientId: zod_1.z.string().uuid(),
    callType: zod_1.z.enum(['voice', 'video'])
});
const callActionSchema = zod_1.z.object({
    callId: zod_1.z.string().uuid(),
    action: zod_1.z.enum(['accept', 'decline', 'end'])
});
router.post('/initiate', auth_1.authenticate, (0, validation_1.validateBody)(initiateCallSchema), async (req, res) => {
    try {
        const { recipientId, callType } = req.body;
        const callerId = req.user.id;
        const recipient = await database_1.prisma.user.findUnique({
            where: { id: recipientId },
            select: { id: true, username: true, avatar: true }
        });
        if (!recipient) {
            return res.status(404).json({
                success: false,
                message: 'Recipient not found'
            });
        }
        const match = await database_1.prisma.match.findFirst({
            where: {
                OR: [
                    { user1Id: callerId, user2Id: recipientId },
                    { user1Id: recipientId, user2Id: callerId }
                ],
                status: 'matched'
            }
        });
        if (!match) {
            return res.status(403).json({
                success: false,
                message: 'Can only call matched users'
            });
        }
        const call = await database_1.prisma.call.create({
            data: {
                callerId,
                recipientId,
                callType,
                status: 'initiated',
                initiatedAt: new Date()
            },
            include: {
                caller: {
                    select: { id: true, username: true, avatar: true }
                },
                recipient: {
                    select: { id: true, username: true, avatar: true }
                }
            }
        });
        const io = req.app.get('io');
        io.to(`user_${recipientId}`).emit('incoming_call', {
            callId: call.id,
            caller: call.caller,
            callType: call.callType,
            timestamp: call.initiatedAt
        });
        res.status(200).json({
            success: true,
            data: {
                callId: call.id,
                recipient: call.recipient,
                callType: call.callType,
                status: call.status
            }
        });
    }
    catch (error) {
        console.error('Error initiating call:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to initiate call'
        });
    }
});
router.post('/action', auth_1.authenticate, (0, validation_1.validateBody)(callActionSchema), async (req, res) => {
    try {
        const { callId, action } = req.body;
        const userId = req.user.id;
        const call = await database_1.prisma.call.findUnique({
            where: { id: callId },
            include: {
                caller: { select: { id: true, username: true } },
                recipient: { select: { id: true, username: true } }
            }
        });
        if (!call) {
            return res.status(404).json({
                success: false,
                message: 'Call not found'
            });
        }
        if (call.callerId !== userId && call.recipientId !== userId) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized to modify this call'
            });
        }
        let updatedCall;
        const io = req.app.get('io');
        const otherUserId = call.callerId === userId ? call.recipientId : call.callerId;
        switch (action) {
            case 'accept':
                if (call.recipientId !== userId) {
                    return res.status(403).json({
                        success: false,
                        message: 'Only recipient can accept call'
                    });
                }
                updatedCall = await database_1.prisma.call.update({
                    where: { id: callId },
                    data: {
                        status: 'accepted',
                        acceptedAt: new Date()
                    }
                });
                io.to(`user_${call.callerId}`).emit('call_accepted', {
                    callId,
                    acceptedBy: call.recipient
                });
                break;
            case 'decline':
                updatedCall = await database_1.prisma.call.update({
                    where: { id: callId },
                    data: {
                        status: 'declined',
                        endedAt: new Date()
                    }
                });
                io.to(`user_${otherUserId}`).emit('call_declined', {
                    callId,
                    declinedBy: userId === call.callerId ? call.caller : call.recipient
                });
                break;
            case 'end':
                const duration = call.acceptedAt ?
                    Math.floor((new Date().getTime() - call.acceptedAt.getTime()) / 1000) : 0;
                updatedCall = await database_1.prisma.call.update({
                    where: { id: callId },
                    data: {
                        status: 'ended',
                        endedAt: new Date(),
                        duration
                    }
                });
                io.to(`user_${otherUserId}`).emit('call_ended', {
                    callId,
                    endedBy: userId === call.callerId ? call.caller : call.recipient,
                    duration
                });
                break;
        }
        res.status(200).json({
            success: true,
            data: {
                callId: updatedCall?.id,
                status: updatedCall?.status,
                action
            }
        });
    }
    catch (error) {
        console.error('Error handling call action:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to handle call action'
        });
    }
});
router.get('/history', auth_1.authenticate, async (req, res) => {
    try {
        const userId = req.user.id;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const offset = (page - 1) * limit;
        const calls = await database_1.prisma.call.findMany({
            where: {
                OR: [
                    { callerId: userId },
                    { recipientId: userId }
                ]
            },
            include: {
                caller: {
                    select: { id: true, username: true, avatar: true }
                },
                recipient: {
                    select: { id: true, username: true, avatar: true }
                }
            },
            orderBy: { initiatedAt: 'desc' },
            skip: offset,
            take: limit
        });
        const totalCalls = await database_1.prisma.call.count({
            where: {
                OR: [
                    { callerId: userId },
                    { recipientId: userId }
                ]
            }
        });
        res.status(200).json({
            success: true,
            data: {
                calls,
                pagination: {
                    page,
                    limit,
                    total: totalCalls,
                    totalPages: Math.ceil(totalCalls / limit)
                }
            }
        });
    }
    catch (error) {
        console.error('Error fetching call history:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch call history'
        });
    }
});
router.post('/signal/offer', auth_1.authenticate, async (req, res) => {
    try {
        const { callId, offer, recipientId } = req.body;
        const io = req.app.get('io');
        io.to(`user_${recipientId}`).emit('webrtc_offer', {
            callId,
            offer,
            senderId: req.user.id
        });
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to send offer' });
    }
});
router.post('/signal/answer', auth_1.authenticate, async (req, res) => {
    try {
        const { callId, answer, callerId } = req.body;
        const io = req.app.get('io');
        io.to(`user_${callerId}`).emit('webrtc_answer', {
            callId,
            answer,
            senderId: req.user.id
        });
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to send answer' });
    }
});
router.post('/signal/ice-candidate', auth_1.authenticate, async (req, res) => {
    try {
        const { callId, candidate, recipientId } = req.body;
        const io = req.app.get('io');
        io.to(`user_${recipientId}`).emit('webrtc_ice_candidate', {
            callId,
            candidate,
            senderId: req.user.id
        });
        res.status(200).json({ success: true });
    }
    catch (error) {
        res.status(500).json({ success: false, message: 'Failed to send ICE candidate' });
    }
});
exports.default = router;
//# sourceMappingURL=calls.js.map