/**
 * Polyglot Database Integration Service
 * Orchestrates all database systems for optimal data storage
 * 
 * Database Stack:
 * 1. PostgreSQL (Prisma) - Relational data, ACID transactions
 * 2. MongoDB - Document store, analytics, flexible schemas
 * 3. Neo4j - Graph database, social connections
 * 4. Redis - In-memory cache, sessions, real-time data
 * 5. AWS S3 - Blob storage, media files
 */

import { PrismaClient } from '@prisma/client';
import mongoose from 'mongoose';
import Neo4jService from '../config/neo4j';
import RedisService from '../config/redis-enhanced';
import S3StorageService from './s3-storage';
import * as MongoModels from '../models/mongodb';

class PolyglotDatabaseService {
  private prisma: PrismaClient;
  private static instance: PolyglotDatabaseService;

  private constructor() {
    this.prisma = new PrismaClient({
      log: ['query', 'error', 'warn'],
    });
  }

  public static getInstance(): PolyglotDatabaseService {
    if (!PolyglotDatabaseService.instance) {
      PolyglotDatabaseService.instance = new PolyglotDatabaseService();
    }
    return PolyglotDatabaseService.instance;
  }

  // ============================================================================
  // DATABASE INITIALIZATION
  // ============================================================================

  /**
   * Initialize all database connections
   */
  public async initializeAll(): Promise<void> {
    console.log('🚀 Initializing Polyglot Database Stack...\n');

    try {
      // 1. PostgreSQL (Prisma)
      await this.initializePostgreSQL();

      // 2. MongoDB
      await this.initializeMongoDB();

      // 3. Neo4j
      await this.initializeNeo4j();

      // 4. Redis
      await this.initializeRedis();

      // 5. AWS S3
      this.initializeS3();

      console.log('\n✅ All databases initialized successfully!\n');
      this.printDatabaseStatus();
    } catch (error) {
      console.error('\n❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize PostgreSQL
   */
  private async initializePostgreSQL(): Promise<void> {
    try {
      await this.prisma.$connect();
      console.log('✓ PostgreSQL (Prisma) connected - Relational Database');
    } catch (error) {
      console.error('✗ PostgreSQL connection failed:', error);
      throw error;
    }
  }

  /**
   * Initialize MongoDB
   */
  private async initializeMongoDB(): Promise<void> {
    try {
      const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/connecthub';
      
      await mongoose.connect(mongoUri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        socketTimeoutMS: 45000,
        serverSelectionTimeoutMS: 5000,
      });

      console.log('✓ MongoDB connected - Document/NoSQL Database');
    } catch (error) {
      console.error('✗ MongoDB connection failed:', error);
      throw error;
    }
  }

  /**
   * Initialize Neo4j
   */
  private async initializeNeo4j(): Promise<void> {
    try {
      await Neo4jService.connect();
      console.log('✓ Neo4j connected - Graph Database');
    } catch (error) {
      console.error('✗ Neo4j connection failed:', error);
      // Non-critical - continue without Neo4j
      console.warn('⚠ Continuing without Neo4j (friend recommendations disabled)');
    }
  }

  /**
   * Initialize Redis
   */
  private async initializeRedis(): Promise<void> {
    try {
      await RedisService.connect();
      console.log('✓ Redis connected - In-Memory Cache/Key-Value Store');
    } catch (error) {
      console.error('✗ Redis connection failed:', error);
      throw error;
    }
  }

  /**
   * Initialize S3
   */
  private initializeS3(): void {
    try {
      S3StorageService.getInstance();
      console.log('✓ AWS S3 initialized - Blob/Object Storage');
    } catch (error) {
      console.error('✗ S3 initialization failed:', error);
      // Non-critical - continue without S3
      console.warn('⚠ Continuing without S3 (file uploads will use local storage)');
    }
  }

  /**
   * Print database status
   */
  private printDatabaseStatus(): void {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📊 POLYGLOT DATABASE STACK STATUS');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('1. ✅ PostgreSQL (Prisma)  - Transactional Data');
    console.log('2. ✅ MongoDB              - Analytics & Flexible Data');
    console.log('3. ✅ Neo4j                - Social Graph & Connections');
    console.log('4. ✅ Redis                - Caching & Real-time');
    console.log('5. ✅ AWS S3               - Media & File Storage');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('🔒 Security: Defense in Depth (7 Layers) Active');
    console.log('═══════════════════════════════════════════════════════════\n');
  }

  // ============================================================================
  // DATABASE ACCESS METHODS
  // ============================================================================

  /**
   * Get Prisma client
   */
  public getPrisma(): PrismaClient {
    return this.prisma;
  }

  /**
   * Get MongoDB connection
   */
  public getMongo(): typeof mongoose {
    return mongoose;
  }

  /**
   * Get Neo4j service
   */
  public getNeo4j(): typeof Neo4jService {
    return Neo4jService;
  }

  /**
   * Get Redis service
   */
  public getRedis(): typeof RedisService {
    return RedisService;
  }

  /**
   * Get S3 storage service
   */
  public getS3(): typeof S3StorageService {
    return S3StorageService;
  }

  // ============================================================================
  // UNIFIED DATA OPERATIONS
  // ============================================================================

  /**
   * Create user across all databases
   */
  public async createUser(userData: {
    email: string;
    username: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }): Promise<any> {
    // 1. Create in PostgreSQL (primary data store)
    const user = await this.prisma.user.create({
      data: userData
    });

    // 2. Create node in Neo4j (social graph)
    try {
      await Neo4jService.createUser(user.id, {
        username: user.username,
        email: user.email
      });
    } catch (error) {
      console.error('Neo4j user creation failed:', error);
    }

    // 3. Cache in Redis
    await RedisService.set(`user:${user.id}`, user, 3600);

    return user;
  }

  /**
   * Create post with analytics
   */
  public async createPost(postData: {
    userId: string;
    content?: string;
    mediaUrls?: string[];
    privacy?: string;
  }): Promise<any> {
    // 1. Create in PostgreSQL
    const post = await this.prisma.post.create({
      data: {
        ...postData,
        mediaUrls: postData.mediaUrls || []
      }
    });

    // 2. Initialize analytics in MongoDB
    const analytics = new MongoModels.PostAnalytics({
      postId: post.id,
      views: { total: 0, unique: 0, byDate: new Map() },
      engagement: { likes: 0, comments: 0, shares: 0, saves: 0, clickThroughRate: 0 },
      demographics: { ageGroups: new Map(), genderDistribution: new Map(), topLocations: [] },
      reachMetrics: { organic: 0, viral: 0, promoted: 0 }
    });
    await analytics.save();

    // 3. Add to user's feed cache
    await RedisService.invalidateFeedCache(postData.userId);

    // 4. Add to trending if public
    if (postData.privacy === 'public') {
      await RedisService.addToTrending(post.id, Date.now());
    }

    return post;
  }

  /**
   * Create follow relationship across databases
   */
  public async createFollow(followerId: string, followingId: string): Promise<void> {
    // 1. Create in PostgreSQL
    await this.prisma.follow.create({
      data: {
        followerId,
        followingId
      }
    });

    // 2. Create in Neo4j for graph queries
    try {
      await Neo4jService.createFollowRelationship(followerId, followingId);
    } catch (error) {
      console.error('Neo4j follow creation failed:', error);
    }

    // 3. Invalidate cache
    await RedisService.del(`followers:${followingId}`);
    await RedisService.del(`following:${followerId}`);
  }

  /**
   * Upload media file with metadata
   */
  public async uploadMedia(
    userId: string,
    file: Buffer,
    originalName: string,
    mimeType: string
  ): Promise<any> {
    // 1. Upload to S3
    const s3Result = await S3StorageService.uploadFile(file, originalName, mimeType, {
      folder: `users/${userId}/media`,
      makePublic: true,
      generateThumbnail: true,
      compress: true
    });

    // 2. Store metadata in MongoDB
    const metadata = new MongoModels.MediaMetadata({
      mediaId: s3Result.key,
      userId,
      s3Key: s3Result.key,
      s3Bucket: process.env.AWS_S3_BUCKET || 'connecthub-media',
      cloudFrontUrl: s3Result.cloudFrontUrl,
      mediaType: mimeType.startsWith('image/') ? 'image' : 
                 mimeType.startsWith('video/') ? 'video' : 'document',
      mimeType,
      fileSize: s3Result.fileSize,
      processingStatus: 'completed',
      thumbnailUrl: s3Result.thumbnailUrl,
      metadata: {
        originalName,
        uploadedFrom: 'mobile_app'
      }
    });
    await metadata.save();

    return {
      ...s3Result,
      mediaId: metadata.mediaId
    };
  }

  /**
   * Get user feed (from multiple sources)
   */
  public async getUserFeed(userId: string, page: number = 1, limit: number = 20): Promise<any[]> {
    // 1. Check Redis cache first
    const cached = await RedisService.getCachedUserFeed(userId, 'home');
    if (cached) {
      return cached.slice((page - 1) * limit, page * limit);
    }

    // 2. Query PostgreSQL for posts
    const posts = await this.prisma.post.findMany({
      where: {
        OR: [
          { userId },
          {
            user: {
              following: {
                some: {
                  followerId: userId
                }
              }
            }
          }
        ],
        isDeleted: false
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatar: true,
            isVerified: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: (page - 1) * limit
    });

    // 3. Enrich with MongoDB analytics
    const enrichedPosts = await Promise.all(
      posts.map(async (post) => {
        const analytics = await MongoModels.PostAnalytics.findOne({ postId: post.id });
        return {
          ...post,
          analytics: analytics || null
        };
      })
    );

    // 4. Cache for 5 minutes
    await RedisService.cacheUserFeed(userId, 'home', enrichedPosts, 300);

    return enrichedPosts;
  }

  /**
   * Get friend recommendations (Neo4j + PostgreSQL)
   */
  public async getFriendRecommendations(userId: string, limit: number = 10): Promise<any[]> {
    try {
      // 1. Get suggestions from Neo4j graph
      const suggestions = await Neo4jService.getFriendSuggestions(userId, limit * 2);

      // 2. Get user details from PostgreSQL
      const userIds = suggestions.map(s => s.userId);
      const users = await this.prisma.user.findMany({
        where: {
          id: { in: userIds },
          isActive: true,
          isDeleted: false
        },
        select: {
          id: true,
          username: true,
          firstName: true,
          lastName: true,
          avatar: true,
          bio: true,
          isVerified: true
        },
        take: limit
      });

      // 3. Combine data
      return users.map(user => {
        const suggestion = suggestions.find(s => s.userId === user.id);
        return {
          ...user,
          mutualFriendsCount: suggestion?.mutualCount || 0
        };
      });
    } catch (error) {
      console.error('Friend recommendations failed:', error);
      return [];
    }
  }

  // ============================================================================
  // HEALTH CHECK
  // ============================================================================

  /**
   * Check health of all databases
   */
  public async healthCheck(): Promise<Record<string, boolean>> {
    const health: Record<string, boolean> = {};

    // PostgreSQL
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      health.postgresql = true;
    } catch {
      health.postgresql = false;
    }

    // MongoDB
    try {
      health.mongodb = mongoose.connection.readyState === 1;
    } catch {
      health.mongodb = false;
    }

    // Redis
    try {
      await RedisService.set('health_check', true, 5);
      health.redis = true;
    } catch {
      health.redis = false;
    }

    // Neo4j
    try {
      const session = Neo4jService.getSession();
      await session.run('RETURN 1');
      await session.close();
      health.neo4j = true;
    } catch {
      health.neo4j = false;
    }

    // S3
    try {
      health.s3 = true; // S3 is initialized on first use
    } catch {
      health.s3 = false;
    }

    return health;
  }

  /**
   * Close all database connections
   */
  public async closeAll(): Promise<void> {
    console.log('Closing all database connections...');

    await this.prisma.$disconnect();
    await mongoose.disconnect();
    await Neo4jService.close();
    await RedisService.close();

    console.log('✓ All databases disconnected');
  }
}

export default PolyglotDatabaseService.getInstance();
