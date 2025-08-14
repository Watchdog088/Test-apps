import { Router, Request, Response } from 'express';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { validateBody } from '../middleware/validation';
import { schemas } from '../middleware/validation';
import { getDB } from '../config/database';
import logger from '../config/logger';

const router = Router();

// Get posts feed
router.get('/feed', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { page = 1, limit = 20, type = 'for-you' } = req.query;
    const userId = (req as any).user.id;
    const skip = (Number(page) - 1) * Number(limit);
    const db = getDB();

    let query: string;
    let params: any[];

    if (type === 'following') {
      // Get posts from followed users
      query = `
        SELECT 
          p.id,
          p.content,
          p.media_urls,
          p.media_type as content_type,
          p.hashtags,
          p.mentions,
          p.created_at,
          p.updated_at,
          u.id as author_id,
          u.username,
          u.full_name,
          u.avatar_url,
          (SELECT COUNT(*) FROM post_interactions pi WHERE pi.post_id = p.id AND pi.type = 'like') as likes_count,
          (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count,
          (SELECT COUNT(*) FROM post_interactions pi WHERE pi.post_id = p.id AND pi.type = 'save') as shares_count,
          EXISTS(SELECT 1 FROM post_interactions pi WHERE pi.post_id = p.id AND pi.user_id = $1 AND pi.type = 'like') as is_liked
        FROM posts p
        JOIN users u ON p.author_id = u.id
        WHERE p.author_id IN (
          SELECT following_id FROM follows WHERE follower_id = $1
        )
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      params = [userId, Number(limit), skip];
    } else {
      // For You feed - personalized algorithm (simplified for now)
      query = `
        SELECT 
          p.id,
          p.content,
          p.media_urls,
          p.media_type as content_type,
          p.hashtags,
          p.mentions,
          p.created_at,
          p.updated_at,
          u.id as author_id,
          u.username,
          u.full_name,
          u.avatar_url,
          (SELECT COUNT(*) FROM post_interactions pi WHERE pi.post_id = p.id AND pi.type = 'like') as likes_count,
          (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count,
          (SELECT COUNT(*) FROM post_interactions pi WHERE pi.post_id = p.id AND pi.type = 'save') as shares_count,
          EXISTS(SELECT 1 FROM post_interactions pi WHERE pi.post_id = p.id AND pi.user_id = $1 AND pi.type = 'like') as is_liked
        FROM posts p
        JOIN users u ON p.author_id = u.id
        WHERE p.is_public = true
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3
      `;
      params = [userId, Number(limit), skip];
    }

    const result = await db.query(query, params);
    const posts = result.rows;

    // Format posts for response
    const formattedPosts = posts.map(post => ({
      id: post.id,
      content: post.content,
      mediaUrls: post.media_urls || [],
      contentType: post.content_type,
      hashtags: post.hashtags || [],
      mentions: post.mentions || [],
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      author: {
        id: post.author_id,
        username: post.username,
        fullName: post.full_name,
        avatarUrl: post.avatar_url
      },
      stats: {
        likesCount: parseInt(post.likes_count),
        commentsCount: parseInt(post.comments_count),
        sharesCount: parseInt(post.shares_count)
      },
      isLiked: post.is_liked
    }));

    res.json({
      posts: formattedPosts,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        hasNext: formattedPosts.length === Number(limit)
      }
    });

  } catch (error) {
    logger.error('Get feed error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a post
router.post('/', authenticateToken, validateBody(schemas.postCreate), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { content, contentType = 'text', mediaUrls, hashtags, mentions } = req.body;
    const userId = (req as any).user.id;
    const db = getDB();

    const query = `
      INSERT INTO posts (author_id, content, media_urls, media_type, hashtags, mentions)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const params = [
      userId,
      content,
      mediaUrls || [],
      contentType,
      hashtags || [],
      mentions || []
    ];

    const result = await db.query(query, params);
    const post = result.rows[0];

    // Get author info
    const authorQuery = 'SELECT id, username, full_name, avatar_url FROM users WHERE id = $1';
    const authorResult = await db.query(authorQuery, [userId]);
    const author = authorResult.rows[0];

    const formattedPost = {
      id: post.id,
      content: post.content,
      mediaUrls: post.media_urls || [],
      contentType: post.media_type,
      hashtags: post.hashtags || [],
      mentions: post.mentions || [],
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      author: {
        id: author.id,
        username: author.username,
        fullName: author.full_name,
        avatarUrl: author.avatar_url
      },
      stats: {
        likesCount: 0,
        commentsCount: 0,
        sharesCount: 0
      },
      isLiked: false
    };

    res.status(201).json({
      message: 'Post created successfully',
      post: formattedPost
    });

  } catch (error) {
    logger.error('Create post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single post
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const db = getDB();

    const query = `
      SELECT 
        p.id,
        p.content,
        p.media_urls,
        p.media_type as content_type,
        p.hashtags,
        p.mentions,
        p.created_at,
        p.updated_at,
        u.id as author_id,
        u.username,
        u.full_name,
        u.avatar_url,
        (SELECT COUNT(*) FROM post_interactions pi WHERE pi.post_id = p.id AND pi.type = 'like') as likes_count,
        (SELECT COUNT(*) FROM comments c WHERE c.post_id = p.id) as comments_count,
        (SELECT COUNT(*) FROM post_interactions pi WHERE pi.post_id = p.id AND pi.type = 'save') as shares_count,
        EXISTS(SELECT 1 FROM post_interactions pi WHERE pi.post_id = p.id AND pi.user_id = $2 AND pi.type = 'like') as is_liked
      FROM posts p
      JOIN users u ON p.author_id = u.id
      WHERE p.id = $1
    `;
    
    const result = await db.query(query, [id, userId]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const post = result.rows[0];

    // Get comments
    const commentsQuery = `
      SELECT 
        c.id,
        c.content,
        c.created_at,
        u.id as author_id,
        u.username,
        u.full_name,
        u.avatar_url
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at DESC
      LIMIT 10
    `;
    const commentsResult = await db.query(commentsQuery, [id]);

    const formattedPost = {
      id: post.id,
      content: post.content,
      mediaUrls: post.media_urls || [],
      contentType: post.content_type,
      hashtags: post.hashtags || [],
      mentions: post.mentions || [],
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      author: {
        id: post.author_id,
        username: post.username,
        fullName: post.full_name,
        avatarUrl: post.avatar_url
      },
      stats: {
        likesCount: parseInt(post.likes_count),
        commentsCount: parseInt(post.comments_count),
        sharesCount: parseInt(post.shares_count)
      },
      isLiked: post.is_liked,
      comments: commentsResult.rows.map(comment => ({
        id: comment.id,
        content: comment.content,
        createdAt: comment.created_at,
        author: {
          id: comment.author_id,
          username: comment.username,
          fullName: comment.full_name,
          avatarUrl: comment.avatar_url
        }
      }))
    };

    res.json({ post: formattedPost });

  } catch (error) {
    logger.error('Get post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update post
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content, hashtags } = req.body;
    const userId = (req as any).user.id;
    const db = getDB();

    // Check if post exists and user owns it
    const checkQuery = 'SELECT author_id FROM posts WHERE id = $1';
    const checkResult = await db.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (checkResult.rows[0].author_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to edit this post' });
    }

    const updateQuery = `
      UPDATE posts 
      SET content = $1, hashtags = $2, updated_at = NOW()
      WHERE id = $3
      RETURNING *
    `;
    const result = await db.query(updateQuery, [content, hashtags || [], id]);
    const post = result.rows[0];

    // Get author info
    const authorQuery = 'SELECT id, username, full_name, avatar_url FROM users WHERE id = $1';
    const authorResult = await db.query(authorQuery, [userId]);
    const author = authorResult.rows[0];

    const formattedPost = {
      id: post.id,
      content: post.content,
      mediaUrls: post.media_urls || [],
      contentType: post.media_type,
      hashtags: post.hashtags || [],
      mentions: post.mentions || [],
      createdAt: post.created_at,
      updatedAt: post.updated_at,
      author: {
        id: author.id,
        username: author.username,
        fullName: author.full_name,
        avatarUrl: author.avatar_url
      },
      stats: {
        likesCount: 0, // Would need separate query for exact counts
        commentsCount: 0,
        sharesCount: 0
      }
    };

    res.json({
      message: 'Post updated successfully',
      post: formattedPost
    });

  } catch (error) {
    logger.error('Update post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete post (soft delete)
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const db = getDB();

    // Check if post exists and user owns it
    const checkQuery = 'SELECT author_id FROM posts WHERE id = $1';
    const checkResult = await db.query(checkQuery, [id]);

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (checkResult.rows[0].author_id !== userId) {
      return res.status(403).json({ error: 'Not authorized to delete this post' });
    }

    // For now, we'll do hard delete since we don't have is_deleted column
    const deleteQuery = 'DELETE FROM posts WHERE id = $1';
    await db.query(deleteQuery, [id]);

    res.json({ message: 'Post deleted successfully' });

  } catch (error) {
    logger.error('Delete post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Like/Unlike post
router.post('/:id/like', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;
    const db = getDB();

    // Check if post exists
    const postQuery = 'SELECT id FROM posts WHERE id = $1';
    const postResult = await db.query(postQuery, [id]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Check if like exists
    const existingLikeQuery = `
      SELECT id FROM post_interactions 
      WHERE user_id = $1 AND post_id = $2 AND type = 'like'
    `;
    const existingLikeResult = await db.query(existingLikeQuery, [userId, id]);

    if (existingLikeResult.rows.length > 0) {
      // Unlike - remove the like
      const deleteLikeQuery = `
        DELETE FROM post_interactions 
        WHERE user_id = $1 AND post_id = $2 AND type = 'like'
      `;
      await db.query(deleteLikeQuery, [userId, id]);

      res.json({ 
        message: 'Post unliked successfully',
        isLiked: false
      });
    } else {
      // Like - add the like
      const insertLikeQuery = `
        INSERT INTO post_interactions (user_id, post_id, type)
        VALUES ($1, $2, 'like')
      `;
      await db.query(insertLikeQuery, [userId, id]);

      res.json({ 
        message: 'Post liked successfully',
        isLiked: true
      });
    }

  } catch (error) {
    logger.error('Like post error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get post comments
router.get('/:id/comments', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    const db = getDB();

    // Check if post exists
    const postQuery = 'SELECT id FROM posts WHERE id = $1';
    const postResult = await db.query(postQuery, [id]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const commentsQuery = `
      SELECT 
        c.id,
        c.content,
        c.created_at,
        c.updated_at,
        u.id as author_id,
        u.username,
        u.full_name,
        u.avatar_url
      FROM comments c
      JOIN users u ON c.author_id = u.id
      WHERE c.post_id = $1
      ORDER BY c.created_at DESC
      LIMIT $2 OFFSET $3
    `;
    const result = await db.query(commentsQuery, [id, Number(limit), skip]);

    const formattedComments = result.rows.map(comment => ({
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      author: {
        id: comment.author_id,
        username: comment.username,
        fullName: comment.full_name,
        avatarUrl: comment.avatar_url
      }
    }));

    res.json({
      comments: formattedComments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        hasNext: formattedComments.length === Number(limit)
      }
    });

  } catch (error) {
    logger.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add comment
router.post('/:id/comments', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content, parentCommentId } = req.body;
    const userId = (req as any).user.id;
    const db = getDB();

    // Check if post exists
    const postQuery = 'SELECT id FROM posts WHERE id = $1';
    const postResult = await db.query(postQuery, [id]);

    if (postResult.rows.length === 0) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const insertQuery = `
      INSERT INTO comments (post_id, author_id, content, parent_comment_id)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await db.query(insertQuery, [id, userId, content, parentCommentId || null]);
    const comment = result.rows[0];

    // Get author info
    const authorQuery = 'SELECT id, username, full_name, avatar_url FROM users WHERE id = $1';
    const authorResult = await db.query(authorQuery, [userId]);
    const author = authorResult.rows[0];

    const formattedComment = {
      id: comment.id,
      content: comment.content,
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
      author: {
        id: author.id,
        username: author.username,
        fullName: author.full_name,
        avatarUrl: author.avatar_url
      }
    };

    res.status(201).json({
      message: 'Comment added successfully',
      comment: formattedComment
    });

  } catch (error) {
    logger.error('Add comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
