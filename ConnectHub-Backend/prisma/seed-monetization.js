const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedMonetization() {
  console.log('🔄 Seeding monetization data...');

  try {
    // Create subscription plans
    const basicPlan = await prisma.subscriptionPlan.create({
      data: {
        name: 'ConnectHub Basic',
        description: 'Essential features for social networking',
        price: 9.99,
        currency: 'USD',
        billingCycle: 'monthly',
        features: JSON.stringify([
          'Unlimited posts',
          'Basic messaging',
          'Profile customization',
          'Basic analytics'
        ]),
        sortOrder: 1
      }
    });

    const premiumPlan = await prisma.subscriptionPlan.create({
      data: {
        name: 'ConnectHub Premium',
        description: 'Advanced features for power users',
        price: 19.99,
        currency: 'USD',
        billingCycle: 'monthly',
        features: JSON.stringify([
          'Everything in Basic',
          'Advanced matching algorithm',
          'Video calls',
          'Priority support',
          'Advanced analytics',
          'Ad-free experience'
        ]),
        sortOrder: 2
      }
    });

    const proPlan = await prisma.subscriptionPlan.create({
      data: {
        name: 'ConnectHub Pro',
        description: 'Professional features for content creators',
        price: 199.99,
        currency: 'USD',
        billingCycle: 'yearly',
        features: JSON.stringify([
          'Everything in Premium',
          'Content creator tools',
          'Advanced analytics dashboard',
          'API access',
          'Custom branding',
          'Priority matching'
        ]),
        sortOrder: 3
      }
    });

    console.log(`✅ Created ${3} subscription plans`);

    // Create advertisers
    const techAdvertiser = await prisma.advertiser.create({
      data: {
        companyName: 'TechGadgets Inc',
        contactEmail: 'ads@techgadgets.com',
        contactPhone: '+1-555-0123',
        website: 'https://techgadgets.com',
        totalSpent: 0
      }
    });

    const fashionAdvertiser = await prisma.advertiser.create({
      data: {
        companyName: 'Fashion Forward',
        contactEmail: 'marketing@fashionforward.com',
        contactPhone: '+1-555-0124',
        website: 'https://fashionforward.com',
        totalSpent: 0
      }
    });

    console.log(`✅ Created ${2} advertisers`);

    // Create sample advertisements
    const currentDate = new Date();
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);

    await prisma.advertisement.create({
      data: {
        advertiserId: techAdvertiser.id,
        title: 'Latest Smartphone - 50% Off!',
        description: 'Get the newest smartphone with advanced features at half price.',
        imageUrl: 'https://example.com/smartphone-ad.jpg',
        targetUrl: 'https://techgadgets.com/smartphone-deal',
        targeting: JSON.stringify({
          ageMin: 18,
          ageMax: 45,
          gender: ['male', 'female'],
          location: {
            countries: ['US', 'CA', 'UK'],
            cities: [],
            radius: 50
          },
          interests: ['technology', 'smartphones', 'gadgets'],
          behaviors: ['online_shopper', 'tech_enthusiast'],
          demographics: ['tech_workers', 'students']
        }),
        budget: 1000.00,
        startDate: currentDate,
        endDate: futureDate
      }
    });

    await prisma.advertisement.create({
      data: {
        advertiserId: fashionAdvertiser.id,
        title: 'Summer Collection 2024',
        description: 'Discover the hottest fashion trends for summer.',
        imageUrl: 'https://example.com/fashion-ad.jpg',
        targetUrl: 'https://fashionforward.com/summer-2024',
        targeting: JSON.stringify({
          ageMin: 16,
          ageMax: 35,
          gender: ['female'],
          location: {
            countries: ['US', 'CA', 'UK', 'AU'],
            cities: ['New York', 'Los Angeles', 'London'],
            radius: 25
          },
          interests: ['fashion', 'shopping', 'lifestyle'],
          behaviors: ['fashion_shopper', 'brand_conscious'],
          demographics: ['young_professionals', 'students']
        }),
        budget: 750.00,
        startDate: currentDate,
        endDate: futureDate
      }
    });

    console.log(`✅ Created ${2} advertisements`);

    // Create premium features
    const features = [
      {
        name: 'Advanced Matching',
        description: 'AI-powered compatibility matching',
        category: 'dating',
        requiredPlan: JSON.stringify([premiumPlan.id, proPlan.id])
      },
      {
        name: 'Video Calls',
        description: 'High-quality video calling with filters',
        category: 'messaging',
        requiredPlan: JSON.stringify([premiumPlan.id, proPlan.id])
      },
      {
        name: 'Analytics Dashboard',
        description: 'Detailed insights about your social presence',
        category: 'analytics',
        requiredPlan: JSON.stringify([proPlan.id])
      },
      {
        name: 'Priority Support',
        description: '24/7 premium customer support',
        category: 'social',
        requiredPlan: JSON.stringify([premiumPlan.id, proPlan.id])
      },
      {
        name: 'Ad-Free Experience',
        description: 'Browse without advertisements',
        category: 'social',
        requiredPlan: JSON.stringify([premiumPlan.id, proPlan.id])
      },
      {
        name: 'Super Likes',
        description: 'Get noticed with premium likes',
        category: 'dating',
        requiredPlan: JSON.stringify([basicPlan.id, premiumPlan.id, proPlan.id])
      }
    ];

    for (const feature of features) {
      await prisma.premiumFeature.create({ data: feature });
    }

    console.log(`✅ Created ${features.length} premium features`);

    // Create sample business analytics for the last 30 days
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      await prisma.businessAnalytics.create({
        data: {
          period: 'daily',
          date: date,
          activeUsers: Math.floor(Math.random() * 1000) + 500,
          newSignups: Math.floor(Math.random() * 50) + 10,
          premiumConversions: Math.floor(Math.random() * 5) + 1,
          subscriptionRevenue: (Math.random() * 500) + 100,
          adRevenue: (Math.random() * 200) + 50,
          totalRevenue: 0, // Will be calculated
          averageSessionTime: Math.floor(Math.random() * 1800) + 600,
          retentionRate: (Math.random() * 20) + 70,
          churnRate: Math.random() * 5,
          ltv: (Math.random() * 100) + 50,
          cac: (Math.random() * 20) + 10
        }
      });
    }

    // Update total revenue for all analytics records
    const analyticsRecords = await prisma.businessAnalytics.findMany();
    for (const record of analyticsRecords) {
      await prisma.businessAnalytics.update({
        where: { id: record.id },
        data: {
          totalRevenue: record.subscriptionRevenue + record.adRevenue
        }
      });
    }

    console.log(`✅ Created ${30} days of business analytics`);

    console.log('🎉 Monetization data seeding completed successfully!');

    // Display summary
    console.log('\n📊 MONETIZATION SUMMARY:');
    console.log(`├── Subscription Plans: ${3}`);
    console.log(`├── Advertisers: ${2}`);
    console.log(`├── Active Ads: ${2}`);
    console.log(`├── Premium Features: ${features.length}`);
    console.log(`└── Analytics Records: ${30} days`);

    console.log('\n💰 REVENUE STREAMS ENABLED:');
    console.log('├── ✅ Subscription billing ($9.99-$199.99)');
    console.log('├── ✅ Targeted advertising ($0.05-$0.25 per interaction)');
    console.log('├── ✅ Premium features & upgrades');
    console.log('└── ✅ Data analytics & insights');

  } catch (error) {
    console.error('❌ Error seeding monetization data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seed function
seedMonetization()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
