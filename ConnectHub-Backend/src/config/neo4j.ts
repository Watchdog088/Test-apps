/**
 * Neo4j Graph Database Configuration
 * Handles: Social relationships, friend networks, recommendations, connections
 * Perfect for traversing social graphs and finding connections
 */

import neo4j, { Driver, Session, Result } from 'neo4j-driver';

class Neo4jService {
  private driver: Driver | null = null;
  private static instance: Neo4jService;

  private constructor() {}

  public static getInstance(): Neo4jService {
    if (!Neo4jService.instance) {
      Neo4jService.instance = new Neo4jService();
    }
    return Neo4jService.instance;
  }

  /**
   * Initialize Neo4j connection
   */
  public async connect(): Promise<void> {
    try {
      const uri = process.env.NEO4J_URI || 'bolt://localhost:7687';
      const user = process.env.NEO4J_USER || 'neo4j';
      const password = process.env.NEO4J_PASSWORD || 'password';

      this.driver = neo4j.driver(uri, neo4j.auth.basic(user, password), {
        maxConnectionLifetime: 3 * 60 * 60 * 1000, // 3 hours
        maxConnectionPoolSize: 50,
        connectionAcquisitionTimeout: 2 * 60 * 1000, // 2 minutes
      });

      // Verify connectivity
      await this.driver.verifyConnectivity();
      console.log('✓ Neo4j Graph Database connected successfully');

      // Initialize constraints and indexes
      await this.initializeSchema();
    } catch (error) {
      console.error('✗ Neo4j connection failed:', error);
      throw error;
    }
  }

  /**
   * Initialize graph schema with constraints and indexes
   */
  private async initializeSchema(): Promise<void> {
    const session = this.getSession();
    
    try {
      // Create constraints
      await session.run(`
        CREATE CONSTRAINT user_id_unique IF NOT EXISTS
        FOR (u:User) REQUIRE u.userId IS UNIQUE
      `);

      await session.run(`
        CREATE CONSTRAINT group_id_unique IF NOT EXISTS
        FOR (g:Group) REQUIRE g.groupId IS UNIQUE
      `);

      // Create indexes for performance
      await session.run(`
        CREATE INDEX user_username IF NOT EXISTS
        FOR (u:User) ON (u.username)
      `);

      await session.run(`
        CREATE INDEX user_location IF NOT EXISTS
        FOR (u:User) ON (u.location)
      `);

      console.log('✓ Neo4j schema initialized with constraints and indexes');
    } catch (error) {
      console.error('✗ Neo4j schema initialization failed:', error);
    } finally {
      await session.close();
    }
  }

  /**
   * Get a new session
   */
  public getSession(): Session {
    if (!this.driver) {
      throw new Error('Neo4j driver not initialized. Call connect() first.');
    }
    return this.driver.session();
  }

  /**
   * Close the connection
   */
  public async close(): Promise<void> {
    if (this.driver) {
      await this.driver.close();
      console.log('✓ Neo4j connection closed');
    }
  }

  // ============================================================================
  // SOCIAL GRAPH OPERATIONS
  // ============================================================================

  /**
   * Create a user node
   */
  public async createUser(userId: string, properties: Record<string, any>): Promise<void> {
    const session = this.getSession();
    
    try {
      await session.run(`
        MERGE (u:User {userId: $userId})
        SET u += $properties
        SET u.createdAt = datetime()
      `, { userId, properties });
    } finally {
      await session.close();
    }
  }

  /**
   * Create a FOLLOWS relationship
   */
  public async createFollowRelationship(followerId: string, followingId: string): Promise<void> {
    const session = this.getSession();
    
    try {
      await session.run(`
        MATCH (follower:User {userId: $followerId})
        MATCH (following:User {userId: $followingId})
        MERGE (follower)-[r:FOLLOWS {createdAt: datetime()}]->(following)
      `, { followerId, followingId });
    } finally {
      await session.close();
    }
  }

  /**
   * Remove FOLLOWS relationship
   */
  public async removeFollowRelationship(followerId: string, followingId: string): Promise<void> {
    const session = this.getSession();
    
    try {
      await session.run(`
        MATCH (follower:User {userId: $followerId})-[r:FOLLOWS]->(following:User {userId: $followingId})
        DELETE r
      `, { followerId, followingId });
    } finally {
      await session.close();
    }
  }

  /**
   * Get mutual friends (friends of friends)
   */
  public async getMutualFriends(userId: string, targetUserId: string): Promise<string[]> {
    const session = this.getSession();
    
    try {
      const result = await session.run(`
        MATCH (user:User {userId: $userId})-[:FOLLOWS]->(mutual:User)<-[:FOLLOWS]-(target:User {userId: $targetUserId})
        RETURN collect(mutual.userId) as mutualFriends
      `, { userId, targetUserId });

      return result.records[0]?.get('mutualFriends') || [];
    } finally {
      await session.close();
    }
  }

  /**
   * Get friend suggestions (2nd degree connections)
   */
  public async getFriendSuggestions(userId: string, limit: number = 10): Promise<any[]> {
    const session = this.getSession();
    
    try {
      const result = await session.run(`
        MATCH (user:User {userId: $userId})-[:FOLLOWS]->(:User)-[:FOLLOWS]->(suggestion:User)
        WHERE NOT (user)-[:FOLLOWS]->(suggestion) AND suggestion.userId <> $userId
        WITH suggestion, count(*) as mutualCount
        ORDER BY mutualCount DESC
        LIMIT $limit
        RETURN suggestion.userId as userId, mutualCount
      `, { userId, limit });

      return result.records.map(record => ({
        userId: record.get('userId'),
        mutualCount: record.get('mutualCount').toNumber()
      }));
    } finally {
      await session.close();
    }
  }

  /**
   * Get followers count
   */
  public async getFollowersCount(userId: string): Promise<number> {
    const session = this.getSession();
    
    try {
      const result = await session.run(`
        MATCH (:User)-[:FOLLOWS]->(user:User {userId: $userId})
        RETURN count(*) as followersCount
      `, { userId });

      return result.records[0]?.get('followersCount').toNumber() || 0;
    } finally {
      await session.close();
    }
  }

  /**
   * Get following count
   */
  public async getFollowingCount(userId: string): Promise<number> {
    const session = this.getSession();
    
    try {
      const result = await session.run(`
        MATCH (user:User {userId: $userId})-[:FOLLOWS]->(:User)
        RETURN count(*) as followingCount
      `, { userId });

      return result.records[0]?.get('followingCount').toNumber() || 0;
    } finally {
      await session.close();
    }
  }

  /**
   * Check if user follows another user
   */
  public async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const session = this.getSession();
    
    try {
      const result = await session.run(`
        MATCH (follower:User {userId: $followerId})-[r:FOLLOWS]->(following:User {userId: $followingId})
        RETURN count(r) > 0 as isFollowing
      `, { followerId, followingId });

      return result.records[0]?.get('isFollowing') || false;
    } finally {
      await session.close();
    }
  }

  /**
   * Get shortest path between two users (connection strength)
   */
  public async getConnectionPath(userId1: string, userId2: string): Promise<string[]> {
    const session = this.getSession();
    
    try {
      const result = await session.run(`
        MATCH path = shortestPath(
          (user1:User {userId: $userId1})-[:FOLLOWS*]-(user2:User {userId: $userId2})
        )
        RETURN [node in nodes(path) | node.userId] as path
      `, { userId1, userId2 });

      return result.records[0]?.get('path') || [];
    } finally {
      await session.close();
    }
  }

  /**
   * Get trending users (most followed recently)
   */
  public async getTrendingUsers(limit: number = 10): Promise<any[]> {
    const session = this.getSession();
    
    try {
      const result = await session.run(`
        MATCH (user:User)<-[r:FOLLOWS]-()
        WHERE r.createdAt > datetime() - duration({days: 7})
        WITH user, count(r) as recentFollowers
        ORDER BY recentFollowers DESC
        LIMIT $limit
        RETURN user.userId as userId, recentFollowers
      `, { limit });

      return result.records.map(record => ({
        userId: record.get('userId'),
        recentFollowers: record.get('recentFollowers').toNumber()
      }));
    } finally {
      await session.close();
    }
  }

  /**
   * Create GROUP node and MEMBER relationships
   */
  public async createGroupWithMembers(groupId: string, creatorId: string, memberIds: string[]): Promise<void> {
    const session = this.getSession();
    
    try {
      await session.run(`
        MERGE (g:Group {groupId: $groupId})
        SET g.createdAt = datetime()
        WITH g
        MATCH (creator:User {userId: $creatorId})
        MERGE (creator)-[:ADMIN_OF]->(g)
        WITH g
        UNWIND $memberIds as memberId
        MATCH (member:User {userId: memberId})
        MERGE (member)-[:MEMBER_OF]->(g)
      `, { groupId, creatorId, memberIds });
    } finally {
      await session.close();
    }
  }

  /**
   * Get group recommendations based on friends' groups
   */
  public async getGroupRecommendations(userId: string, limit: number = 10): Promise<any[]> {
    const session = this.getSession();
    
    try {
      const result = await session.run(`
        MATCH (user:User {userId: $userId})-[:FOLLOWS]->(:User)-[:MEMBER_OF]->(group:Group)
        WHERE NOT (user)-[:MEMBER_OF]->(group)
        WITH group, count(*) as friendsInGroup
        ORDER BY friendsInGroup DESC
        LIMIT $limit
        RETURN group.groupId as groupId, friendsInGroup
      `, { userId, limit });

      return result.records.map(record => ({
        groupId: record.get('groupId'),
        friendsInGroup: record.get('friendsInGroup').toNumber()
      }));
    } finally {
      await session.close();
    }
  }
}

export default Neo4jService.getInstance();
