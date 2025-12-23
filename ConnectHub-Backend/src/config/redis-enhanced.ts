/**
 * Redis In-Memory Cache Configuration
 * Key-Value Store for: Session data, caching, real-time counters, pub/sub
 * Provides ultra-fast data access and reduces database load
 */

import Redis from 'ioredis';

class RedisService {
  private client: Redis | null = null;
  private publisher: Redis | null = null;
  private subscriber: Redis | null = null;
  private static instance: RedisService;

  private constructor() {}

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  /**
   * Initialize Redis connection
   */
  public async connect(): Promise<void> {
    try {
      const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
      
      // Main client for general operations
      this.client = new Redis(redisUrl, {
        retryStrategy: (times) => {
          const delay = Math.min(times * 50, 2000);
          return delay;
        },
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        enableOfflineQueue: false
      });

      // Publisher for Pub/Sub
      this.publisher = new Redis(redisUrl);

      // Subscriber for Pub/Sub
      this.subscriber = new Redis(redisUrl);

      this.client.on('connect', () => {
        console.log('✓ Redis connected successfully');
      });

      this.client.on('error', (error) => {
        console.error('✗ Redis connection error:', error);
      });

      this.client.on('ready', () => {
        console.log('✓ Redis is ready to accept commands');
      });

    } catch (error) {
      console.error('✗ Redis initialization failed:', error);
      throw error;
    }
  }

  /**
   * Get Redis client
   */
  public getClient(): Redis {
    if (!this.client) {
      throw new Error('Redis client not initialized. Call connect() first.');
    }
    return this.client;
  }

  /**
   * Get Publisher client
   */
  public getPublisher(): Redis {
    if (!this.publisher) {
      throw new Error('Redis publisher not initialized. Call connect() first.');
    }
    return this.publisher;
  }

  /**
   * Get Subscriber client
   */
  public getSubscriber(): Redis {
    if (!this.subscriber) {
      throw new Error('Redis subscriber not initialized. Call connect() first.');
    }
    return this.subscriber;
  }

  /**
   * Close all Redis connections
   */
  public async close(): Promise<void> {
    if (this.client) await this.client.quit();
    if (this.publisher) await this.publisher.quit();
    if (this.subscriber) await this.subscriber.quit();
    console.log('✓ Redis connections closed');
  }

  // ============================================================================
  // CACHING OPERATIONS
  // ============================================================================

  /**
   * Set cache with expiration
   */
  public async set(key: string, value: any, expiryInSeconds?: number): Promise<void> {
    const client = this.getClient();
    const serialized = JSON.stringify(value);
    
    if (expiryInSeconds) {
      await client.setex(key, expiryInSeconds, serialized);
    } else {
      await client.set(key, serialized);
    }
  }

  /**
   * Get from cache
   */
  public async get<T = any>(key: string): Promise<T | null> {
    const client = this.getClient();
    const data = await client.get(key);
    
    if (!data) return null;
    
    try {
      return JSON.parse(data) as T;
    } catch {
      return data as any;
    }
  }

  /**
   * Delete from cache
   */
  public async del(key: string): Promise<void> {
    const client = this.getClient();
    await client.del(key);
  }

  /**
   * Check if key exists
   */
  public async exists(key: string): Promise<boolean> {
    const client = this.getClient();
    const result = await client.exists(key);
    return result === 1;
  }

  /**
   * Set hash field
   */
  public async hset(key: string, field: string, value: any): Promise<void> {
    const client = this.getClient();
    const serialized = JSON.stringify(value);
    await client.hset(key, field, serialized);
  }

  /**
   * Get hash field
   */
  public async hget<T = any>(key: string, field: string): Promise<T | null> {
    const client = this.getClient();
    const data = await client.hget(key, field);
    
    if (!data) return null;
    
    try {
      return JSON.parse(data) as T;
    } catch {
      return data as any;
    }
  }

  /**
   * Get all hash fields
   */
  public async hgetall<T = Record<string, any>>(key: string): Promise<T | null> {
    const client = this.getClient();
    const data = await client.hgetall(key);
    
    if (!data || Object.keys(data).length === 0) return null;
    
    const parsed: any = {};
    for (const [field, value] of Object.entries(data)) {
      try {
        parsed[field] = JSON.parse(value);
      } catch {
        parsed[field] = value;
      }
    }
    
    return parsed as T;
  }

  // ============================================================================
  // SESSION MANAGEMENT
  // ============================================================================

  /**
   * Store user session
   */
  public async setSession(sessionToken: string, userId: string, expiryInSeconds: number = 86400): Promise<void> {
    await this.set(`session:${sessionToken}`, { userId }, expiryInSeconds);
  }

  /**
   * Get user session
   */
  public async getSession(sessionToken: string): Promise<{ userId: string } | null> {
    return await this.get<{ userId: string }>(`session:${sessionToken}`);
  }

  /**
   * Delete user session
   */
  public async deleteSession(sessionToken: string): Promise<void> {
    await this.del(`session:${sessionToken}`);
  }

  // ============================================================================
  // RATE LIMITING
  // ============================================================================

  /**
   * Increment rate limit counter
   */
  public async incrementRateLimit(key: string, windowInSeconds: number): Promise<number> {
    const client = this.getClient();
    const current = await client.incr(key);
    
    if (current === 1) {
      await client.expire(key, windowInSeconds);
    }
    
    return current;
  }

  /**
   * Check rate limit
   */
  public async checkRateLimit(identifier: string, maxRequests: number, windowInSeconds: number): Promise<{ allowed: boolean; remaining: number }> {
    const key = `ratelimit:${identifier}`;
    const current = await this.incrementRateLimit(key, windowInSeconds);
    
    return {
      allowed: current <= maxRequests,
      remaining: Math.max(0, maxRequests - current)
    };
  }

  // ============================================================================
  // REAL-TIME COUNTERS
  // ============================================================================

  /**
   * Increment counter (likes, views, etc.)
   */
  public async incrementCounter(key: string, by: number = 1): Promise<number> {
    const client = this.getClient();
    return await client.incrby(key, by);
  }

  /**
   * Decrement counter
   */
  public async decrementCounter(key: string, by: number = 1): Promise<number> {
    const client = this.getClient();
    return await client.decrby(key, by);
  }

  /**
   * Get counter value
   */
  public async getCounter(key: string): Promise<number> {
    const client = this.getClient();
    const value = await client.get(key);
    return value ? parseInt(value, 10) : 0;
  }

  // ============================================================================
  // PUB/SUB FOR REAL-TIME FEATURES
  // ============================================================================

  /**
   * Publish message to channel
   */
  public async publish(channel: string, message: any): Promise<void> {
    const publisher = this.getPublisher();
    await publisher.publish(channel, JSON.stringify(message));
  }

  /**
   * Subscribe to channel
   */
  public async subscribe(channel: string, callback: (message: any) => void): Promise<void> {
    const subscriber = this.getSubscriber();
    
    await subscriber.subscribe(channel);
    
    subscriber.on('message', (ch, msg) => {
      if (ch === channel) {
        try {
          const parsed = JSON.parse(msg);
          callback(parsed);
        } catch {
          callback(msg);
        }
      }
    });
  }

  /**
   * Unsubscribe from channel
   */
  public async unsubscribe(channel: string): Promise<void> {
    const subscriber = this.getSubscriber();
    await subscriber.unsubscribe(channel);
  }

  // ============================================================================
  // ONLINE USERS TRACKING
  // ============================================================================

  /**
   * Mark user as online
   */
  public async setUserOnline(userId: string, expiryInSeconds: number = 300): Promise<void> {
    await this.set(`online:${userId}`, true, expiryInSeconds);
  }

  /**
   * Mark user as offline
   */
  public async setUserOffline(userId: string): Promise<void> {
    await this.del(`online:${userId}`);
  }

  /**
   * Check if user is online
   */
  public async isUserOnline(userId: string): Promise<boolean> {
    return await this.exists(`online:${userId}`);
  }

  /**
   * Get online users count
   */
  public async getOnlineUsersCount(): Promise<number> {
    const client = this.getClient();
    const keys = await client.keys('online:*');
    return keys.length;
  }

  // ============================================================================
  // FEED CACHING
  // ============================================================================

  /**
   * Cache user feed
   */
  public async cacheUserFeed(userId: string, feedType: string, posts: any[], ttl: number = 300): Promise<void> {
    const key = `feed:${userId}:${feedType}`;
    await this.set(key, posts, ttl);
  }

  /**
   * Get cached user feed
   */
  public async getCachedUserFeed(userId: string, feedType: string): Promise<any[] | null> {
    const key = `feed:${userId}:${feedType}`;
    return await this.get<any[]>(key);
  }

  /**
   * Invalidate user feed cache
   */
  public async invalidateFeedCache(userId: string): Promise<void> {
    const client = this.getClient();
    const keys = await client.keys(`feed:${userId}:*`);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  }

  // ============================================================================
  // TRENDING & LEADERBOARDS (Sorted Sets)
  // ============================================================================

  /**
   * Add to trending posts
   */
  public async addToTrending(postId: string, score: number): Promise<void> {
    const client = this.getClient();
    await client.zadd('trending:posts', score, postId);
  }

  /**
   * Get trending posts
   */
  public async getTrendingPosts(limit: number = 10): Promise<string[]> {
    const client = this.getClient();
    return await client.zrevrange('trending:posts', 0, limit - 1);
  }

  /**
   * Update leaderboard score
   */
  public async updateLeaderboard(leaderboardName: string, userId: string, score: number): Promise<void> {
    const client = this.getClient();
    await client.zadd(`leaderboard:${leaderboardName}`, score, userId);
  }

  /**
   * Get leaderboard top players
   */
  public async getLeaderboard(leaderboardName: string, limit: number = 10): Promise<Array<{ userId: string; score: number }>> {
    const client = this.getClient();
    const results = await client.zrevrange(`leaderboard:${leaderboardName}`, 0, limit - 1, 'WITHSCORES');
    
    const leaderboard: Array<{ userId: string; score: number }> = [];
    for (let i = 0; i < results.length; i += 2) {
      leaderboard.push({
        userId: results[i],
        score: parseInt(results[i + 1], 10)
      });
    }
    
    return leaderboard;
  }

  /**
   * Get user rank in leaderboard
   */
  public async getUserRank(leaderboardName: string, userId: string): Promise<number | null> {
    const client = this.getClient();
    const rank = await client.zrevrank(`leaderboard:${leaderboardName}`, userId);
    return rank !== null ? rank + 1 : null;
  }
}

export default RedisService.getInstance();
