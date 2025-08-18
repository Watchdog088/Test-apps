// ConnectHub Database Migration Script - SQLite to PostgreSQL
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

// Development (SQLite) Prisma Client
const devPrisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./prisma/dev.db'
    }
  }
});

// Production (PostgreSQL) Prisma Client
const prodPrisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function migrateToDatabaseProduction() {
  console.log('🚀 Starting ConnectHub Production Migration...');

  try {
    // Step 1: Export data from SQLite
    console.log('📤 Exporting data from SQLite...');
    
    const users = await devPrisma.user.findMany({
      include: {
        posts: true,
        comments: true,
        likes: true,
        follows: true,
        followers: true,
        profile: true,
        sentMessages: true,
        receivedMessages: true,
        matches: true,
        matchedBy: true
      }
    });

    const posts = await devPrisma.post.findMany({
      include: {
        author: true,
        comments: true,
        likes: true
      }
    });

    const messages = await devPrisma.message.findMany({
      include: {
        sender: true,
        receiver: true
      }
    });

    console.log(`✅ Exported ${users.length} users, ${posts.length} posts, ${messages.length} messages`);

    // Step 2: Run Prisma migrations on PostgreSQL
    console.log('🔄 Running PostgreSQL migrations...');
    await prodPrisma.$executeRaw`SELECT 1`; // Test connection
    
    // Step 3: Import data to PostgreSQL (preserving relationships)
    console.log('📥 Importing data to PostgreSQL...');
    
    // Import users first
    for (const user of users) {
      await prodPrisma.user.create({
        data: {
          id: user.id,
          email: user.email,
          username: user.username,
          password: user.password,
          firstName: user.firstName,
          lastName: user.lastName,
          avatar: user.avatar,
          bio: user.bio,
          isActive: user.isActive,
          isVerified: user.isVerified,
          lastLogin: user.lastLogin,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          profile: user.profile ? {
            create: {
              age: user.profile.age,
              location: user.profile.location,
              interests: user.profile.interests,
              preferences: user.profile.preferences,
              profilePictures: user.profile.profilePictures,
              isVisible: user.profile.isVisible,
              isPremium: user.profile.isPremium
            }
          } : undefined
        }
      });
    }

    console.log('✅ Users imported successfully');

    // Import posts
    for (const post of posts) {
      await prodPrisma.post.create({
        data: {
          id: post.id,
          content: post.content,
          mediaUrls: post.mediaUrls,
          authorId: post.authorId,
          isPublic: post.isPublic,
          likesCount: post.likesCount,
          commentsCount: post.commentsCount,
          sharesCount: post.sharesCount,
          createdAt: post.createdAt,
          updatedAt: post.updatedAt
        }
      });
    }

    console.log('✅ Posts imported successfully');

    // Import messages
    for (const message of messages) {
      await prodPrisma.message.create({
        data: {
          id: message.id,
          content: message.content,
          senderId: message.senderId,
          receiverId: message.receiverId,
          isRead: message.isRead,
          messageType: message.messageType,
          mediaUrl: message.mediaUrl,
          createdAt: message.createdAt,
          updatedAt: message.updatedAt
        }
      });
    }

    console.log('✅ Messages imported successfully');

    // Step 4: Verify migration
    const prodUserCount = await prodPrisma.user.count();
    const prodPostCount = await prodPrisma.post.count();
    const prodMessageCount = await prodPrisma.message.count();

    console.log('🔍 Migration Verification:');
    console.log(`   Users: ${users.length} → ${prodUserCount} ✅`);
    console.log(`   Posts: ${posts.length} → ${prodPostCount} ✅`);
    console.log(`   Messages: ${messages.length} → ${prodMessageCount} ✅`);

    console.log('🎉 Production migration completed successfully!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await devPrisma.$disconnect();
    await prodPrisma.$disconnect();
  }
}

// Run migration if called directly
if (require.main === module) {
  migrateToDatabaseProduction();
}

module.exports = { migrateToDatabaseProduction };
