import express, { Response } from 'express';
import { prisma } from '../config/database';
import { authenticate, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { z } from 'zod';
import { Server as SocketIOServer } from 'socket.io';

const router = express.Router();

// Validation schemas
const initiateCallSchema = z.object({
  recipientId: z.string().uuid(),
  callType: z.enum(['voice', 'video'])
});

const callActionSchema = z.object({
  callId: z.string().uuid(),
  action: z.enum(['accept', 'decline', 'end'])
});

// Initialize call
router.post('/initiate', authenticate, validateBody(initiateCallSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { recipientId, callType } = req.body;
    const callerId = req.user!.id;

    // Check if recipient exists
    const recipient = await prisma.user.findUnique({
      where: { id: recipientId },
      select: { id: true, username: true, avatar: true }
    });

    if (!recipient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Recipient not found' 
      });
    }

    // Check if users are matched (for dating context)
    const match = await prisma.match.findFirst({
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

    // Create call record
    const call = await prisma.call.create({
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

    // Emit call invitation through WebSocket
    const io: SocketIOServer = req.app.get('io');
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

  } catch (error) {
    console.error('Error initiating call:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to initiate call' 
    });
  }
});

// Handle call actions (accept, decline, end)
router.post('/action', authenticate, validateBody(callActionSchema), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { callId, action } = req.body;
    const userId = req.user!.id;

    // Find the call
    const call = await prisma.call.findUnique({
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

    // Verify user is part of the call
    if (call.callerId !== userId && call.recipientId !== userId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Unauthorized to modify this call' 
      });
    }

    let updatedCall;
    const io: SocketIOServer = req.app.get('io');
    const otherUserId = call.callerId === userId ? call.recipientId : call.callerId;

    switch (action) {
      case 'accept':
        if (call.recipientId !== userId) {
          return res.status(403).json({ 
            success: false, 
            message: 'Only recipient can accept call' 
          });
        }
        
        updatedCall = await prisma.call.update({
          where: { id: callId },
          data: { 
            status: 'accepted',
            acceptedAt: new Date()
          }
        });

        // Notify caller that call was accepted
        io.to(`user_${call.callerId}`).emit('call_accepted', {
          callId,
          acceptedBy: call.recipient
        });

        break;

      case 'decline':
        updatedCall = await prisma.call.update({
          where: { id: callId },
          data: { 
            status: 'declined',
            endedAt: new Date()
          }
        });

        // Notify other user that call was declined
        io.to(`user_${otherUserId}`).emit('call_declined', {
          callId,
          declinedBy: userId === call.callerId ? call.caller : call.recipient
        });

        break;

      case 'end':
        const duration = call.acceptedAt ? 
          Math.floor((new Date().getTime() - call.acceptedAt.getTime()) / 1000) : 0;

        updatedCall = await prisma.call.update({
          where: { id: callId },
          data: { 
            status: 'ended',
            endedAt: new Date(),
            duration
          }
        });

        // Notify other user that call ended
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

  } catch (error) {
    console.error('Error handling call action:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to handle call action' 
    });
  }
});

// Get call history
router.get('/history', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const calls = await prisma.call.findMany({
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

    const totalCalls = await prisma.call.count({
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

  } catch (error) {
    console.error('Error fetching call history:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to fetch call history' 
    });
  }
});

// WebRTC signaling endpoints
router.post('/signal/offer', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { callId, offer, recipientId } = req.body;
    const io: SocketIOServer = req.app.get('io');

    // Forward WebRTC offer to recipient
    io.to(`user_${recipientId}`).emit('webrtc_offer', {
      callId,
      offer,
      senderId: req.user!.id
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send offer' });
  }
});

router.post('/signal/answer', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { callId, answer, callerId } = req.body;
    const io: SocketIOServer = req.app.get('io');

    // Forward WebRTC answer to caller
    io.to(`user_${callerId}`).emit('webrtc_answer', {
      callId,
      answer,
      senderId: req.user!.id
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send answer' });
  }
});

router.post('/signal/ice-candidate', authenticate, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { callId, candidate, recipientId } = req.body;
    const io: SocketIOServer = req.app.get('io');

    // Forward ICE candidate to recipient
    io.to(`user_${recipientId}`).emit('webrtc_ice_candidate', {
      callId,
      candidate,
      senderId: req.user!.id
    });

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to send ICE candidate' });
  }
});

export default router;
