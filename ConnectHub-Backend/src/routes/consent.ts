/**
 * Consent Management API Routes
 * Professional consent system for dating app safety
 */

import express from 'express';
import { authenticate } from '../middleware/auth';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { 
  CreateConsentRequestBody, 
  RespondToConsentBody,
  ConsentApiResponse,
  SafetyPreferences
} from '../types/consent';

const router = express.Router();
const prisma = new PrismaClient();

// Validation schemas
const createConsentRequestSchema = z.object({
  recipientId: z.string().min(1),
  dateId: z.string().optional(),
  message: z.string().max(500).optional(),
  boundaries: z.array(z.string()).optional(),
  safetyPreferences: z.object({
    protectionRequired: z.boolean(),
    mutualTesting: z.boolean(),
    safeWord: z.string().optional(),
    emergencyContact: z.object({
      name: z.string(),
      phone: z.string(),
      relationship: z.string()
    }).optional(),
    location: z.object({
      shareLocation: z.boolean(),
      trustedContact: z.string().optional(),
      checkInTime: z.date().optional()
    }).optional()
  }).optional()
});

const respondToConsentSchema = z.object({
  decision: z.enum(['accept', 'decline']),
  boundaries: z.array(z.string()).optional(),
  safetyPreferences: z.object({
    protectionRequired: z.boolean(),
    mutualTesting: z.boolean(),
    safeWord: z.string().optional(),
    emergencyContact: z.object({
      name: z.string(),
      phone: z.string(),
      relationship: z.string()
    }).optional(),
    location: z.object({
      shareLocation: z.boolean(),
      trustedContact: z.string().optional(),
      checkInTime: z.date().optional()
    }).optional()
  }).optional(),
  message: z.string().max(500).optional()
});

/**
 * Get consent education content
 * GET /api/consent/education
 */
router.get('/education', authenticate, async (req, res) => {
  try {
    const educationContent = [
      {
        topic: 'Understanding Consent',
        content: 'Consent is an ongoing, enthusiastic agreement between all parties involved. It must be freely given, can be withdrawn at any time, and should be clear and specific.',
        resources: [
          {
            title: 'What is Consent?',
            url: 'https://www.plannedparenthood.org/learn/sex-pleasure-and-sexual-dysfunction/sexual-consent',
            type: 'article' as const
          },
          {
            title: 'Consent and Communication',
            url: 'https://www.scarleteen.com/article/abuse_assault/drivers_ed_for_the_sexual_superhighway_navigating_consent',
            type: 'article' as const
          }
        ]
      },
      {
        topic: 'Communication and Boundaries',
        content: 'Open communication about boundaries, desires, and limits is essential. Discussing these topics beforehand creates a safer and more enjoyable experience for everyone.',
        resources: [
          {
            title: 'Setting Boundaries',
            url: 'https://www.loveisrespect.org/resources/what-are-sexual-boundaries/',
            type: 'article' as const
          }
        ]
      },
      {
        topic: 'Safety and Protection',
        content: 'Prioritizing safety includes discussing protection, testing, and having emergency contacts. Taking care of your sexual health benefits everyone involved.',
        resources: [
          {
            title: 'Sexual Health Basics',
            url: 'https://www.cdc.gov/std/prevention/',
            type: 'article' as const
          },
          {
            title: 'Emergency Resources',
            url: 'https://www.rainn.org/national-resources-sexual-assault-survivors-and-their-loved-ones',
            type: 'helpline' as const
          }
        ]
      }
    ];

    res.json({
      success: true,
      message: 'Consent education content retrieved successfully',
      data: { education: educationContent }
    } as ConsentApiResponse);

  } catch (error) {
    console.error('Error fetching consent education:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consent education',
      error: 'Internal server error'
    } as ConsentApiResponse);
  }
});

/**
 * Create a consent request
 * POST /api/consent/request
 */
router.post('/request', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'Unauthorized'
      } as ConsentApiResponse);
    }

    // Validate request body
    const validationResult = createConsentRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        error: validationResult.error.issues.map(i => i.message).join(', ')
      } as ConsentApiResponse);
    }

    const { recipientId, dateId, message, boundaries, safetyPreferences } = validationResult.data;

    // Prevent self-requests
    if (recipientId === userId) {
      return res.status(400).json({
        success: false,
        message: 'Cannot create consent request with yourself',
        error: 'Invalid recipient'
      } as ConsentApiResponse);
    }

    // Check if users have matched (for dating context)
    const match = await prisma.datingMatch.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: recipientId },
          { user1Id: recipientId, user2Id: userId }
        ],
        matched: true
      }
    });

    if (!match && dateId) {
      return res.status(403).json({
        success: false,
        message: 'Consent requests can only be sent to matched users',
        error: 'Not matched'
      } as ConsentApiResponse);
    }

    // Check for existing pending request between these users
    const existingRequest = await prisma.consentRequest.findFirst({
      where: {
        requesterId: userId,
        recipientId: recipientId,
        status: 'pending',
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'A pending consent request already exists',
        error: 'Duplicate request'
      } as ConsentApiResponse);
    }

    // Create consent request (expires in 24 hours)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const consentRequest = await prisma.consentRequest.create({
      data: {
        requesterId: userId,
        recipientId: recipientId,
        dateId: dateId,
        message: message,
        boundaries: boundaries || [],
        safetyPreferences: safetyPreferences ? JSON.stringify(safetyPreferences) : null,
        expiresAt: expiresAt
      },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    // Create notification for recipient
    await prisma.notification.create({
      data: {
        userId: recipientId,
        type: 'consent_request',
        title: 'Consent Request Received',
        content: `${consentRequest.requester.firstName} has sent you a consent request.`,
        data: JSON.stringify({ consentRequestId: consentRequest.id })
      }
    });

    res.status(201).json({
      success: true,
      message: 'Consent request created successfully',
      data: { consentRequest }
    } as ConsentApiResponse);

  } catch (error) {
    console.error('Error creating consent request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create consent request',
      error: 'Internal server error'
    } as ConsentApiResponse);
  }
});

/**
 * Get consent requests (sent and received)
 * GET /api/consent/requests
 */
router.get('/requests', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'Unauthorized'
      } as ConsentApiResponse);
    }

    const { type } = req.query;

    let whereClause: any = {};
    
    if (type === 'sent') {
      whereClause = { requesterId: userId };
    } else if (type === 'received') {
      whereClause = { recipientId: userId };
    } else {
      whereClause = {
        OR: [
          { requesterId: userId },
          { recipientId: userId }
        ]
      };
    }

    const requests = await prisma.consentRequest.findMany({
      where: whereClause,
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        responses: {
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true
              }
            }
          }
        },
        mutualConsent: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      message: 'Consent requests retrieved successfully',
      data: { requests }
    });

  } catch (error) {
    console.error('Error fetching consent requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch consent requests',
      error: 'Internal server error'
    } as ConsentApiResponse);
  }
});

/**
 * Respond to a consent request
 * POST /api/consent/respond/:requestId
 */
router.post('/respond/:requestId', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'Unauthorized'
      } as ConsentApiResponse);
    }

    const { requestId } = req.params;

    // Validate request body
    const validationResult = respondToConsentSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid response data',
        error: validationResult.error.issues.map(i => i.message).join(', ')
      } as ConsentApiResponse);
    }

    const { decision, boundaries, safetyPreferences, message } = validationResult.data;

    // Find the consent request
    const consentRequest = await prisma.consentRequest.findUnique({
      where: { id: requestId },
      include: {
        requester: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        recipient: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        }
      }
    });

    if (!consentRequest) {
      return res.status(404).json({
        success: false,
        message: 'Consent request not found',
        error: 'Not found'
      } as ConsentApiResponse);
    }

    // Check if user is the recipient
    if (consentRequest.recipientId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only respond to requests sent to you',
        error: 'Forbidden'
      } as ConsentApiResponse);
    }

    // Check if request is still valid
    if (consentRequest.status !== 'pending' || new Date() > consentRequest.expiresAt) {
      return res.status(400).json({
        success: false,
        message: 'This consent request has expired or already been responded to',
        error: 'Invalid request status'
      } as ConsentApiResponse);
    }

    // Create response
    const consentResponse = await prisma.consentResponse.create({
      data: {
        consentRequestId: requestId,
        userId: userId,
        decision: decision,
        boundaries: boundaries || [],
        safetyPreferences: safetyPreferences ? JSON.stringify(safetyPreferences) : null,
        message: message
      }
    });

    // Update request status
    await prisma.consentRequest.update({
      where: { id: requestId },
      data: {
        status: decision === 'accept' ? 'accepted' : 'declined',
        respondedAt: new Date()
      }
    });

    let mutualConsent = null;

    // If accepted, create mutual consent
    if (decision === 'accept') {
      // Combine boundaries from both users
      const requesterBoundaries = consentRequest.boundaries || [];
      const recipientBoundaries = boundaries || [];
      const combinedBoundaries = [...new Set([...requesterBoundaries, ...recipientBoundaries])];

      // Combine safety preferences
      const requesterSafety = consentRequest.safetyPreferences ? 
        JSON.parse(consentRequest.safetyPreferences) : {};
      const recipientSafety = safetyPreferences || {};
      
      const combinedSafety = {
        protectionRequired: requesterSafety.protectionRequired || recipientSafety.protectionRequired,
        mutualTesting: requesterSafety.mutualTesting || recipientSafety.mutualTesting,
        safeWord: recipientSafety.safeWord || requesterSafety.safeWord,
        emergencyContact: recipientSafety.emergencyContact || requesterSafety.emergencyContact,
        location: {
          shareLocation: (recipientSafety.location?.shareLocation || requesterSafety.location?.shareLocation) || false,
          trustedContact: recipientSafety.location?.trustedContact || requesterSafety.location?.trustedContact,
          checkInTime: recipientSafety.location?.checkInTime || requesterSafety.location?.checkInTime
        }
      };

      mutualConsent = await prisma.mutualConsent.create({
        data: {
          consentRequestId: requestId,
          userOneId: consentRequest.requesterId,
          userTwoId: consentRequest.recipientId,
          dateId: consentRequest.dateId,
          agreedBoundaries: combinedBoundaries,
          safetyPlan: JSON.stringify(combinedSafety)
        }
      });
    }

    // Notify the requester
    await prisma.notification.create({
      data: {
        userId: consentRequest.requesterId,
        type: decision === 'accept' ? 'consent_accepted' : 'consent_declined',
        title: decision === 'accept' ? 'Consent Request Accepted' : 'Consent Request Declined',
        content: `${consentRequest.recipient.firstName} has ${decision === 'accept' ? 'accepted' : 'declined'} your consent request.`,
        data: JSON.stringify({ 
          consentRequestId: requestId,
          mutualConsentId: mutualConsent?.id
        })
      }
    });

    res.json({
      success: true,
      message: `Consent request ${decision === 'accept' ? 'accepted' : 'declined'} successfully`,
      data: { 
        consentResponse,
        mutualConsent: mutualConsent
      }
    } as ConsentApiResponse);

  } catch (error) {
    console.error('Error responding to consent request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to respond to consent request',
      error: 'Internal server error'
    } as ConsentApiResponse);
  }
});

/**
 * Get mutual consent agreements
 * GET /api/consent/agreements
 */
router.get('/agreements', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'Unauthorized'
      } as ConsentApiResponse);
    }

    const agreements = await prisma.mutualConsent.findMany({
      where: {
        OR: [
          { userOneId: userId },
          { userTwoId: userId }
        ],
        status: 'active'
      },
      include: {
        userOne: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        userTwo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true
          }
        },
        consentRequest: {
          select: {
            dateId: true,
            message: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json({
      success: true,
      message: 'Mutual consent agreements retrieved successfully',
      data: { agreements }
    });

  } catch (error) {
    console.error('Error fetching mutual consent agreements:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch mutual consent agreements',
      error: 'Internal server error'
    } as ConsentApiResponse);
  }
});

/**
 * Cancel/withdraw a consent request or agreement
 * DELETE /api/consent/cancel/:id
 */
router.delete('/cancel/:id', authenticate, async (req, res) => {
  try {
    const userId = (req as any).user?.userId;
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required',
        error: 'Unauthorized'
      } as ConsentApiResponse);
    }

    const { id } = req.params;
    const { type } = req.query; // 'request' or 'agreement'

    if (type === 'request') {
      // Cancel consent request
      const request = await prisma.consentRequest.findUnique({
        where: { id }
      });

      if (!request) {
        return res.status(404).json({
          success: false,
          message: 'Consent request not found',
          error: 'Not found'
        } as ConsentApiResponse);
      }

      if (request.requesterId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only cancel your own requests',
          error: 'Forbidden'
        } as ConsentApiResponse);
      }

      await prisma.consentRequest.update({
        where: { id },
        data: { status: 'withdrawn' }
      });

    } else if (type === 'agreement') {
      // Cancel mutual consent agreement
      const agreement = await prisma.mutualConsent.findUnique({
        where: { id }
      });

      if (!agreement) {
        return res.status(404).json({
          success: false,
          message: 'Mutual consent agreement not found',
          error: 'Not found'
        } as ConsentApiResponse);
      }

      if (agreement.userOneId !== userId && agreement.userTwoId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only cancel agreements you are part of',
          error: 'Forbidden'
        } as ConsentApiResponse);
      }

      await prisma.mutualConsent.update({
        where: { id },
        data: {
          status: 'cancelled',
          cancelledAt: new Date(),
          cancelledBy: userId
        }
      });
    }

    res.json({
      success: true,
      message: `${type === 'request' ? 'Consent request' : 'Mutual consent agreement'} cancelled successfully`
    } as ConsentApiResponse);

  } catch (error) {
    console.error('Error cancelling consent:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel consent',
      error: 'Internal server error'
    } as ConsentApiResponse);
  }
});

export { router as consentRoutes };
