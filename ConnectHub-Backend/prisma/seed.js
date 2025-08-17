const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@connecthub.com' },
      update: {},
      create: {
        email: 'admin@connecthub.com',
        username: 'admin',
        name: 'Admin User',
        passwordHash: hashedPassword,
        role: 'ADMIN',
        isVerified: true,
        bio: 'ConnectHub Administrator',
      },
    }),
    prisma.user.upsert({
      where: { email: 'alice@example.com' },
      update: {},
      create: {
        email: 'alice@example.com',
        username: 'alice_wonder',
        name: 'Alice Johnson',
        passwordHash: hashedPassword,
        role: 'USER',
        isVerified: true,
        bio: 'Love traveling, photography, and meeting new people! 📸✈️',
        location: 'New York, NY',
      },
    }),
    prisma.user.upsert({
      where: { email: 'bob@example.com' },
      update: {},
      create: {
        email: 'bob@example.com',
        username: 'bob_creative',
        name: 'Bob Smith',
        passwordHash: hashedPassword,
        role: 'USER',
        isVerified: true,
        bio: 'Artist, musician, and coffee enthusiast ☕🎨',
        location: 'San Francisco, CA',
      },
    }),
    prisma.user.upsert({
      where: { email: 'business@example.com' },
      update: {},
      create: {
        email: 'business@example.com',
        username: 'bizaccount',
        name: 'Business Account',
        passwordHash: hashedPassword,
        role: 'BUSINESS',
        isVerified: true,
        bio: 'Official business account for marketing campaigns',
      },
    })
  ]);

  console.log('✅ Created demo users');

  // Create sample posts
  const posts = await Promise.all([
    prisma.post.create({
      data: {
        content: 'Just launched ConnectHub! Excited to connect with amazing people from around the world! 🌎 #ConnectHub #SocialMedia',
        authorId: users[1].id,
        imageUrl: 'https://picsum.photos/600/400?random=1',
      },
    }),
    prisma.post.create({
      data: {
        content: 'Beautiful sunset at the beach today. Nothing beats nature\'s artwork! 🌅 #sunset #beach #photography',
        authorId: users[2].id,
        imageUrl: 'https://picsum.photos/600/400?random=2',
      },
    }),
    prisma.post.create({
      data: {
        content: 'Coffee and coding session at my favorite cafe. Perfect way to start the weekend! ☕💻 #coding #weekend #coffee',
        authorId: users[1].id,
      },
    }),
  ]);

  console.log('✅ Created sample posts');

  // Create user stats for gamification
  for (const user of users.slice(1, 3)) { // Skip admin user
    await prisma.userStats.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        level: Math.floor(Math.random() * 10) + 1,
        totalPoints: Math.floor(Math.random() * 5000),
        coins: Math.floor(Math.random() * 1000),
        currentStreak: Math.floor(Math.random() * 30),
        longestStreak: Math.floor(Math.random() * 100),
        postsCreated: Math.floor(Math.random() * 50),
        likesReceived: Math.floor(Math.random() * 500),
        commentsGiven: Math.floor(Math.random() * 200),
        matchesMade: Math.floor(Math.random() * 25),
        messagesExchanged: Math.floor(Math.random() * 1000),
        dailyChallengesCompleted: Math.floor(Math.random() * 50),
      },
    });
  }

  console.log('✅ Created user stats');

  // Create achievements
  const achievements = await Promise.all([
    prisma.achievement.upsert({
      where: { id: 'first-post' },
      update: {},
      create: {
        id: 'first-post',
        name: 'First Steps',
        description: 'Create your first post',
        category: 'social',
        icon: '📝',
        points: 10,
        rarity: 'common',
        requirement: JSON.stringify({ type: 'posts_created', value: 1 }),
      },
    }),
    prisma.achievement.upsert({
      where: { id: 'social-butterfly' },
      update: {},
      create: {
        id: 'social-butterfly',
        name: 'Social Butterfly',
        description: 'Create 50 posts',
        category: 'social',
        icon: '🦋',
        points: 500,
        rarity: 'rare',
        requirement: JSON.stringify({ type: 'posts_created', value: 50 }),
      },
    }),
    prisma.achievement.upsert({
      where: { id: 'first-match' },
      update: {},
      create: {
        id: 'first-match',
        name: 'Perfect Match',
        description: 'Get your first match',
        category: 'dating',
        icon: '💕',
        points: 25,
        rarity: 'common',
        requirement: JSON.stringify({ type: 'matches_made', value: 1 }),
      },
    }),
    prisma.achievement.upsert({
      where: { id: 'daily-user' },
      update: {},
      create: {
        id: 'daily-user',
        name: 'Daily User',
        description: 'Login for 7 consecutive days',
        category: 'streaks',
        icon: '🔥',
        points: 100,
        rarity: 'common',
        requirement: JSON.stringify({ type: 'login_streak', value: 7 }),
      },
    }),
    prisma.achievement.upsert({
      where: { id: 'influencer' },
      update: {},
      create: {
        id: 'influencer',
        name: 'Influencer',
        description: 'Get 1000 likes on your posts',
        category: 'social',
        icon: '⭐',
        points: 1000,
        rarity: 'epic',
        requirement: JSON.stringify({ type: 'likes_received', value: 1000 }),
      },
    }),
  ]);

  console.log('✅ Created achievements');

  // Award some achievements to users
  await prisma.userAchievement.create({
    data: {
      userId: users[1].id,
      achievementId: 'first-post',
      points: 10,
    },
  });

  await prisma.userAchievement.create({
    data: {
      userId: users[2].id,
      achievementId: 'first-post',
      points: 10,
    },
  });

  console.log('✅ Awarded sample achievements');

  // Create business accounts
  const businessAccount = await prisma.businessAccount.create({
    data: {
      userId: users[3].id,
      companyName: 'TechCorp Solutions',
      industry: 'Technology',
      website: 'https://techcorp.example.com',
      description: 'Leading technology solutions provider',
      isVerified: true,
      tier: 'PROFESSIONAL',
    },
  });

  console.log('✅ Created business account');

  // Create marketing campaigns
  await prisma.campaign.create({
    data: {
      userId: users[3].id,
      businessId: businessAccount.id,
      name: 'Summer Tech Sale',
      description: 'Promoting our latest tech products for summer',
      budget: 5000.00,
      spent: 1250.00,
      status: 'ACTIVE',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      targeting: JSON.stringify({
        age: { min: 18, max: 65 },
        interests: ['technology', 'gadgets', 'innovation'],
        location: ['US', 'CA', 'UK'],
      }),
    },
  });

  console.log('✅ Created marketing campaign');

  // Create subscriptions
  await Promise.all([
    prisma.subscription.create({
      data: {
        userId: users[1].id,
        plan: 'PREMIUM',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      },
    }),
    prisma.subscription.create({
      data: {
        userId: users[3].id,
        plan: 'ENTERPRISE',
        status: 'ACTIVE',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      },
    }),
  ]);

  console.log('✅ Created subscriptions');

  // Create sample transactions
  await Promise.all([
    prisma.transaction.create({
      data: {
        userId: users[1].id,
        amount: 9.99,
        currency: 'USD',
        type: 'SUBSCRIPTION',
        status: 'COMPLETED',
        description: 'Premium monthly subscription',
        metadata: JSON.stringify({ plan: 'premium', duration: 'monthly' }),
      },
    }),
    prisma.transaction.create({
      data: {
        userId: users[2].id,
        amount: 2.99,
        currency: 'USD',
        type: 'IN_APP_PURCHASE',
        status: 'COMPLETED',
        description: 'Super Like pack (5x)',
        metadata: JSON.stringify({ item: 'super_likes', quantity: 5 }),
      },
    }),
  ]);

  console.log('✅ Created sample transactions');

  // Create dating profiles
  await Promise.all([
    prisma.datingProfile.create({
      data: {
        userId: users[1].id,
        photos: JSON.stringify([
          'https://picsum.photos/400/600?random=10',
          'https://picsum.photos/400/600?random=11',
          'https://picsum.photos/400/600?random=12',
        ]),
        preferences: JSON.stringify({
          ageRange: { min: 22, max: 35 },
          distance: 50,
          interests: ['travel', 'photography', 'coffee', 'hiking'],
        }),
      },
    }),
    prisma.datingProfile.create({
      data: {
        userId: users[2].id,
        photos: JSON.stringify([
          'https://picsum.photos/400/600?random=20',
          'https://picsum.photos/400/600?random=21',
          'https://picsum.photos/400/600?random=22',
        ]),
        preferences: JSON.stringify({
          ageRange: { min: 25, max: 40 },
          distance: 30,
          interests: ['art', 'music', 'coffee', 'concerts'],
        }),
      },
    }),
  ]);

  console.log('✅ Created dating profiles');

  // Create sample ads
  await prisma.ad.create({
    data: {
      title: 'ConnectHub Premium',
      description: 'Unlock premium features and connect with more people!',
      imageUrl: 'https://picsum.photos/600/300?random=30',
      targetUrl: '/premium',
      budget: 1000.00,
      spent: 234.50,
      status: 'ACTIVE',
      targeting: JSON.stringify({
        demographics: { age: { min: 18, max: 55 } },
        interests: ['dating', 'social media', 'relationships'],
      }),
    },
  });

  console.log('✅ Created sample ads');

  // Create analytics data
  const analyticsData = [
    { metric: 'profile_views', value: 156 },
    { metric: 'post_engagement', value: 89 },
    { metric: 'matches_made', value: 12 },
    { metric: 'messages_sent', value: 245 },
    { metric: 'app_opens', value: 45 },
  ];

  for (const user of users.slice(1, 3)) {
    for (const data of analyticsData) {
      await prisma.analytics.create({
        data: {
          userId: user.id,
          metric: data.metric,
          value: data.value + Math.random() * 50,
          dimension: JSON.stringify({
            date: new Date().toISOString().split('T')[0],
            platform: ['web', 'mobile', 'tablet'][Math.floor(Math.random() * 3)],
          }),
        },
      });
    }
  }

  console.log('✅ Created analytics data');

  // Create sample notifications
  const notifications = [
    {
      userId: users[1].id,
      type: 'LIKE',
      title: 'New Like!',
      message: 'Someone liked your post "Just launched ConnectHub!"',
      data: JSON.stringify({ postId: posts[0].id }),
    },
    {
      userId: users[2].id,
      type: 'MATCH',
      title: 'It\'s a Match! 💕',
      message: 'You and Alice have matched!',
      data: JSON.stringify({ matchedUserId: users[1].id }),
    },
    {
      userId: users[1].id,
      type: 'ACHIEVEMENT',
      title: 'Achievement Unlocked! 🏆',
      message: 'You earned "First Steps" achievement!',
      data: JSON.stringify({ achievementId: 'first-post' }),
    },
  ];

  for (const notification of notifications) {
    await prisma.notification.create({
      data: notification,
    });
  }

  console.log('✅ Created sample notifications');

  console.log('🎉 Database seeding completed successfully!');
  console.log('\n📊 Summary:');
  console.log(`- Users: ${users.length}`);
  console.log(`- Posts: ${posts.length}`);
  console.log(`- Achievements: ${achievements.length}`);
  console.log('- Business accounts: 1');
  console.log('- Campaigns: 1');
  console.log('- Subscriptions: 2');
  console.log('- Transactions: 2');
  console.log('- Dating profiles: 2');
  console.log('- Ads: 1');
  console.log('- Notifications: 3');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
