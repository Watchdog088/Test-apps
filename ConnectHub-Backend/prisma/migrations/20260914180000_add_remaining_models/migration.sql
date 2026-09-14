-- Migration: Add remaining models for all new routes
-- Timestamp: 20260914180000

-- UserSettings (settings route)
CREATE TABLE IF NOT EXISTS "UserSettings" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL UNIQUE,
  "theme" TEXT DEFAULT 'system',
  "language" TEXT DEFAULT 'en',
  "notificationsEnabled" BOOLEAN DEFAULT true,
  "emailNotifications" BOOLEAN DEFAULT true,
  "pushNotifications" BOOLEAN DEFAULT true,
  "privacyLevel" TEXT DEFAULT 'public',
  "adPersonalization" BOOLEAN DEFAULT true,
  "dataSharing" BOOLEAN DEFAULT false,
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- MediaItem (media route)
CREATE TABLE IF NOT EXISTS "MediaItem" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL, -- image | video | audio | document
  "url" TEXT NOT NULL,
  "thumbnailUrl" TEXT,
  "filename" TEXT,
  "sizeBytes" INTEGER,
  "mimeType" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "MediaItem_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Playlist (music route)
CREATE TABLE IF NOT EXISTS "Playlist" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "coverUrl" TEXT,
  "isPublic" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "Playlist_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- PlaylistTrack (music route)
CREATE TABLE IF NOT EXISTS "PlaylistTrack" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "playlistId" TEXT NOT NULL,
  "trackId" TEXT NOT NULL,
  "trackTitle" TEXT,
  "trackArtist" TEXT,
  "trackUrl" TEXT,
  "durationSeconds" INTEGER,
  "position" INTEGER DEFAULT 0,
  "addedAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "PlaylistTrack_playlistId_fkey" FOREIGN KEY ("playlistId") REFERENCES "Playlist"("id") ON DELETE CASCADE
);

-- CreatorProfile (creator route)
CREATE TABLE IF NOT EXISTS "CreatorProfile" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL UNIQUE,
  "bio" TEXT,
  "categories" TEXT[],
  "socialLinks" JSONB,
  "portfolioUrl" TEXT,
  "rates" JSONB,
  "isVerified" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "CreatorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- CreatorEarning (monetization route)
CREATE TABLE IF NOT EXISTS "CreatorEarning" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "amount" FLOAT NOT NULL,
  "source" TEXT NOT NULL, -- tip | subscription | gift | ad_revenue
  "referenceId" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "CreatorEarning_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- CreatorSubscription (monetization route)
CREATE TABLE IF NOT EXISTS "CreatorSubscription" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "creatorId" TEXT NOT NULL,
  "subscriberId" TEXT NOT NULL,
  "tier" TEXT DEFAULT 'basic',
  "pricePerMonth" FLOAT,
  "status" TEXT DEFAULT 'active',
  "startedAt" TIMESTAMP DEFAULT NOW(),
  "expiresAt" TIMESTAMP,
  UNIQUE("creatorId", "subscriberId"),
  CONSTRAINT "CreatorSubscription_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "CreatorSubscription_subscriberId_fkey" FOREIGN KEY ("subscriberId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Tip (monetization route)
CREATE TABLE IF NOT EXISTS "Tip" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "senderId" TEXT NOT NULL,
  "receiverId" TEXT NOT NULL,
  "amount" FLOAT NOT NULL,
  "message" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "Tip_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "Tip_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- PremiumSubscription (premium route)
CREATE TABLE IF NOT EXISTS "PremiumSubscription" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "planId" TEXT NOT NULL,
  "status" TEXT DEFAULT 'active', -- active | cancelled | expired | trial
  "startedAt" TIMESTAMP DEFAULT NOW(),
  "expiresAt" TIMESTAMP,
  "stripeSubscriptionId" TEXT,
  CONSTRAINT "PremiumSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- SupportTicket (help route)
CREATE TABLE IF NOT EXISTS "SupportTicket" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT DEFAULT 'general',
  "status" TEXT DEFAULT 'open', -- open | in_progress | resolved | closed
  "agentNotes" TEXT,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "SupportTicket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- BusinessProfile (business route)
CREATE TABLE IF NOT EXISTS "BusinessProfile" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL UNIQUE,
  "businessName" TEXT,
  "description" TEXT,
  "category" TEXT,
  "website" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "logoUrl" TEXT,
  "isVerified" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "BusinessProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- ProfileView (business/profile analytics)
CREATE TABLE IF NOT EXISTS "ProfileView" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "profileUserId" TEXT NOT NULL,
  "viewerId" TEXT,
  "viewedAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "ProfileView_profileUserId_fkey" FOREIGN KEY ("profileUserId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- GamingScore (gaming route)
CREATE TABLE IF NOT EXISTS "GamingScore" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "gameId" TEXT NOT NULL,
  "score" INTEGER NOT NULL DEFAULT 0,
  "metadata" JSONB,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "GamingScore_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- UserAchievement (gaming route)
CREATE TABLE IF NOT EXISTS "UserAchievement" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "achievementId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "iconUrl" TEXT,
  "unlockedAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("userId", "achievementId"),
  CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- UserPoints (gamification route)
CREATE TABLE IF NOT EXISTS "UserPoints" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL UNIQUE,
  "points" INTEGER DEFAULT 0,
  "level" INTEGER DEFAULT 1,
  "updatedAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "UserPoints_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- PointTransaction (gamification route)
CREATE TABLE IF NOT EXISTS "PointTransaction" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "points" INTEGER NOT NULL,
  "reason" TEXT,
  "balanceAfter" INTEGER,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "PointTransaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- UserBadge (gamification route)
CREATE TABLE IF NOT EXISTS "UserBadge" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "badgeId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "iconUrl" TEXT,
  "awardedAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("userId", "badgeId"),
  CONSTRAINT "UserBadge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- ArVrSession (ar/vr route)
CREATE TABLE IF NOT EXISTS "ArVrSession" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  "filterId" TEXT NOT NULL,
  "durationSeconds" INTEGER DEFAULT 0,
  "mode" TEXT DEFAULT 'ar',
  "createdAt" TIMESTAMP DEFAULT NOW(),
  CONSTRAINT "ArVrSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- UserBlock (content-control route)
CREATE TABLE IF NOT EXISTS "UserBlock" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "blockerId" TEXT NOT NULL,
  "blockedId" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("blockerId", "blockedId"),
  CONSTRAINT "UserBlock_blockerId_fkey" FOREIGN KEY ("blockerId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "UserBlock_blockedId_fkey" FOREIGN KEY ("blockedId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- UserMute (content-control route)
CREATE TABLE IF NOT EXISTS "UserMute" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
  "muterId" TEXT NOT NULL,
  "mutedId" TEXT NOT NULL,
  "createdAt" TIMESTAMP DEFAULT NOW(),
  UNIQUE("muterId", "mutedId"),
  CONSTRAINT "UserMute_muterId_fkey" FOREIGN KEY ("muterId") REFERENCES "User"("id") ON DELETE CASCADE,
  CONSTRAINT "UserMute_mutedId_fkey" FOREIGN KEY ("mutedId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS "MediaItem_userId_idx" ON "MediaItem"("userId");
CREATE INDEX IF NOT EXISTS "GamingScore_gameId_score_idx" ON "GamingScore"("gameId", "score" DESC);
CREATE INDEX IF NOT EXISTS "CreatorEarning_userId_idx" ON "CreatorEarning"("userId");
CREATE INDEX IF NOT EXISTS "SupportTicket_userId_status_idx" ON "SupportTicket"("userId", "status");
CREATE INDEX IF NOT EXISTS "PremiumSubscription_userId_status_idx" ON "PremiumSubscription"("userId", "status");
CREATE INDEX IF NOT EXISTS "ProfileView_profileUserId_idx" ON "ProfileView"("profileUserId");
