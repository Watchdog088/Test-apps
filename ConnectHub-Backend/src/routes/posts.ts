import express from 'express';
import { prisma } from '../config/database';
import { body, validationResult, param, query } from 'express-validator';
import { authenticate } from '../middleware/auth';
import logger from '../config/logger';

const router = express.Router();

// Validation rules
const createPostValidation = [
  body('content').isLength({ min: 1, max: 2000 }).withMessage('Content must be 1-2000 characters'),
  body('contentType').optional().isIn(['text', 'image', 'video', 'mixed']).withMessage('Invalid content type'),
  body('mediaUrls').optional().isArray().withMessage('Media URLs must be an array'),
  body('hashtags').optional().isArray().withMessage('Hashtags must be an array'),
  body('mentions').optional().isArray().withMessage('Mentions must be an array'),
  body('visibility').optional().isIn(['public', 'followers', 'private']).withMessage('Invalid visibility'),
  body('location').optional().isString().withMessage('Location must be a string')
];

const updatePostValidation = [
  param('postId').isString().withMessage('Post ID is required'),
  body('content').optional().isLength({ min: 1, max: 2000 }).withMessage('Content must be 1-2000 characters'),
  body('visibility').optional().isIn(['public', 'followers', 'private']).withMessage('Invalid visibility'),
  body('location').optional().isString().withMessage('Location must be a string')
];

const commentValidation = [
  param('postId').isString().withMessage('Post ID is required'),
  body('content').isLength({ min: 1, max: 500 }).withMessage('Comment must be 1-500 characters'),
  body('parentCommentId').optional().isString().withMessage('Parent comment ID must be a string')
];

// Create a new post
router.post('/', authenticate, createPostValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { content, contentType, mediaUrls, hashtags, mentions, visibility, location } = req.body;
    const userId = (req as any).user.id;

    const post = await prisma.post.create({
      data: {
        userId,
        content,
        contentType: contentType || 'text',
        mediaUrls: JSON.stringify(mediaUrls || []),
        hashtags: JSON.stringify(hashtags || []),
        mentions: JSON.stringify(mentions || []),
        visibility: visibility || 'public',
        location: location || null,
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0,
        savesCount: 0,
        isEdited: false
      },
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

    // Update user's posts count
    await prisma.user.update({
      where: { id: userId },
      data: { 
        postsCount: { increment: 1 },
        updatedAt: new Date()
      }
    });

    // Parse JSON fields for response
    const responsePost = {
      ...post,
      mediaUrls: JSON.parse(post.mediaUrls),
      hashtags: JSON.parse(post.hashtags),
      mentions: JSON.parse(post.mentions)
    };

    res.status(201).json({
      success: true,
      message: 'Post created successfully',
      data: { post: responsePost }
    });

  } catch (error) {
    logger.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get posts feed (with pagination)
router.get('/feed', authenticate, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const skip = (page - 1) * limit;
    const userId = (req as any).user.id;

    // Get posts from followed users and own posts
    const posts = await prisma.post.findMany({
      where: {
        OR: [
          { userId: userId }, // Own posts
          { 
            user: {
              followers: {
                some: {
                  followerId: userId
                }
              }
            },
            visibility: { in: ['public', 'followers'] }
          }, // Posts from followed users
          { visibility: 'public' } // All public posts
        ]
      },
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
        },
        _count: {
          select: {
            comments: true,
            engagements: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    // Get user's engagements with these posts
    const postIds = posts.map(post => post.id);
    const userEngagements = await prisma.postEngagement.findMany({
      where: {
        userId: userId,
        postId: { in: postIds }
      }
    });

    const engagementMap = userEngagements.reduce((acc, engagement) => {
      if (!acc[engagement.postId]) acc[engagement.postId] = [];
      acc[engagement.postId].push(engagement.type);
      return acc;
    }, {} as Record<string, string[]>);

    // Format response posts
    const responsePosts = posts.map(post => ({
      ...post,
      mediaUrls: JSON.parse(post.mediaUrls),
      hashtags: JSON.parse(post.hashtags),
      mentions: JSON.parse(post.mentions),
      isLiked: engagementMap[post.id]?.includes('like') || false,
      isSaved: engagementMap[post.id]?.includes('save') || false,
      commentsCount: post._count.comments,
      actualLikesCount: post.likesCount
    }));

    res.status(200).json({
      success: true,
      data: {
        posts: responsePosts,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(responsePosts.length / limit),
          hasMore: responsePosts.length === limit
        }
      }
    });

  } catch (error) {
    logger.error('Get feed error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get single post by ID
router.get('/:postId', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = (req as any).user.id;

    const post = await prisma.post.findUnique({
      where: { id: postId },
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
        },
        _count: {
          select: {
            comments: true
          }
        }
      }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user can view this post
    if (post.visibility === 'private' && post.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Get user's engagement with this post
    const userEngagements = await prisma.postEngagement.findMany({
      where: {
        userId: userId,
        postId: postId
      }
    });

    const engagementTypes = userEngagements.map(e => e.type);

    // Record view if not the post owner
    if (post.userId !== userId && !engagementTypes.includes('view')) {
      await prisma.postEngagement.create({
        data: {
          postId: postId,
          userId: userId,
          type: 'view'
        }
      });
    }

    const responsePost = {
      ...post,
      mediaUrls: JSON.parse(post.mediaUrls),
      hashtags: JSON.parse(post.hashtags),
      mentions: JSON.parse(post.mentions),
      isLiked: engagementTypes.includes('like'),
      isSaved: engagementTypes.includes('save'),
      commentsCount: post._count.comments
    };

    res.status(200).json({
      success: true,
      data: { post: responsePost }
    });

  } catch (error) {
    logger.error('Get post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Update post
router.put('/:postId', authenticate, updatePostValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { postId } = req.params;
    const { content, visibility, location } = req.body;
    const userId = (req as any).user.id;

    // Check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (existingPost.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const updatedPost = await prisma.post.update({
      where: { id: postId },
      data: {
        content: content || existingPost.content,
        visibility: visibility || existingPost.visibility,
        location: location !== undefined ? location : existingPost.location,
        isEdited: true,
        updatedAt: new Date()
      },
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

    const responsePost = {
      ...updatedPost,
      mediaUrls: JSON.parse(updatedPost.mediaUrls),
      hashtags: JSON.parse(updatedPost.hashtags),
      mentions: JSON.parse(updatedPost.mentions)
    };

    res.status(200).json({
      success: true,
      message: 'Post updated successfully',
      data: { post: responsePost }
    });

  } catch (error) {
    logger.error('Update post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Delete post
router.delete('/:postId', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = (req as any).user.id;

    // Check if post exists and user owns it
    const existingPost = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!existingPost) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    if (existingPost.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Delete post (cascade will handle comments and engagements)
    await prisma.post.delete({
      where: { id: postId }
    });

    // Update user's posts count
    await prisma.user.update({
      where: { id: userId },
      data: { 
        postsCount: { decrement: 1 },
        updatedAt: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    logger.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Like/Unlike post
router.post('/:postId/like', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = (req as any).user.id;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Check if user already liked this post
    const existingLike = await prisma.postEngagement.findUnique({
      where: {
        postId_userId_type: {
          postId: postId,
          userId: userId,
          type: 'like'
        }
      }
    });

    if (existingLike) {
      // Unlike: remove like and decrement count
      await prisma.postEngagement.delete({
        where: { id: existingLike.id }
      });

      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { decrement: 1 } }
      });

      res.status(200).json({
        success: true,
        message: 'Post unliked successfully',
        data: { isLiked: false }
      });
    } else {
      // Like: create like and increment count
      await prisma.postEngagement.create({
        data: {
          postId: postId,
          userId: userId,
          type: 'like'
        }
      });

      await prisma.post.update({
        where: { id: postId },
        data: { likesCount: { increment: 1 } }
      });

      res.status(200).json({
        success: true,
        message: 'Post liked successfully',
        data: { isLiked: true }
      });
    }

  } catch (error) {
    logger.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Add comment to post
router.post('/:postId/comments', authenticate, commentValidation, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { postId } = req.params;
    const { content, parentCommentId } = req.body;
    const userId = (req as any).user.id;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Create comment
    const comment = await prisma.comment.create({
      data: {
        postId: postId,
        userId: userId,
        content: content,
        parentCommentId: parentCommentId || null
      },
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

    // Update post comments count
    await prisma.post.update({
      where: { id: postId },
      data: { commentsCount: { increment: 1 } }
    });

    // If it's a reply, update parent comment replies count
    if (parentCommentId) {
      await prisma.comment.update({
        where: { id: parentCommentId },
        data: { repliesCount: { increment: 1 } }
      });
    }

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: { comment }
    });

  } catch (error) {
    logger.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get comments for a post
router.get('/:postId/comments', authenticate, async (req, res) => {
  try {
    const { postId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
    const skip = (page - 1) * limit;

    // Check if post exists
    const post = await prisma.post.findUnique({
      where: { id: postId }
    });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    // Get top-level comments (not replies)
    const comments = await prisma.comment.findMany({
      where: {
        postId: postId,
        parentCommentId: null
      },
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
        },
        replies: {
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
          take: 3, // Only show first 3 replies
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    });

    res.status(200).json({
      success: true,
      data: {
        comments,
        pagination: {
          currentPage: page,
          hasMore: comments.length === limit
        }
      }
    });

  } catch (error) {
    logger.error('Get comments error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

export default router;
