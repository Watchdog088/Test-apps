-- LynkApp Initial Database Migration
-- Generated: September 14, 2026
-- Apply on EC2 with: npx prisma migrate deploy

-- ── USERS ──────────────────────────────────────────────────────────────────
CREATE TABLE "User" (
    "id"              TEXT NOT NULL PRIMARY KEY,
    "email"           TEXT NOT NULL UNIQUE,
    "username"        TEXT NOT NULL UNIQUE,
    "displayName"     TEXT NOT NULL,
    "password"        TEXT,
    "phone"           TEXT,
    "bio"             TEXT,
    "avatar"          TEXT,
    "coverImage"      TEXT,
    "website"         TEXT,
    "location"        TEXT,
    "isVerified"      BOOLEAN NOT NULL DEFAULT false,
    "isPrivate"       BOOLEAN NOT NULL DEFAULT false,
    "isPremium"       BOOLEAN NOT NULL DEFAULT false,
    "premiumTier"     TEXT,
    "premiumExpiry"   TIMESTAMP(3),
    "role"            TEXT NOT NULL DEFAULT 'user',
    "status"          TEXT NOT NULL DEFAULT 'active',
    "lastSeen"        TIMESTAMP(3),
    "emailVerified"   BOOLEAN NOT NULL DEFAULT false,
    "phoneVerified"   BOOLEAN NOT NULL DEFAULT false,
    "twoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorSecret"  TEXT,
    "googleId"        TEXT UNIQUE,
    "appleId"         TEXT UNIQUE,
    "facebookId"      TEXT UNIQUE,
    "followersCount"  INTEGER NOT NULL DEFAULT 0,
    "followingCount"  INTEGER NOT NULL DEFAULT 0,
    "postsCount"      INTEGER NOT NULL DEFAULT 0,
    "coinBalance"     INTEGER NOT NULL DEFAULT 0,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── FOLLOWS ─────────────────────────────────────────────────────────────────
CREATE TABLE "Follow" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "followerId"  TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "followingId" TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("followerId", "followingId")
);

-- ── POSTS ───────────────────────────────────────────────────────────────────
CREATE TABLE "Post" (
    "id"           TEXT NOT NULL PRIMARY KEY,
    "authorId"     TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "content"      TEXT,
    "mediaUrls"    TEXT[],
    "mediaTypes"   TEXT[],
    "type"         TEXT NOT NULL DEFAULT 'post',
    "visibility"   TEXT NOT NULL DEFAULT 'public',
    "isPinned"     BOOLEAN NOT NULL DEFAULT false,
    "likesCount"   INTEGER NOT NULL DEFAULT 0,
    "commentsCount" INTEGER NOT NULL DEFAULT 0,
    "sharesCount"  INTEGER NOT NULL DEFAULT 0,
    "viewsCount"   INTEGER NOT NULL DEFAULT 0,
    "hashtags"     TEXT[],
    "mentions"     TEXT[],
    "locationName" TEXT,
    "locationLat"  DOUBLE PRECISION,
    "locationLng"  DOUBLE PRECISION,
    "parentId"     TEXT REFERENCES "Post"("id") ON DELETE SET NULL,
    "repostId"     TEXT REFERENCES "Post"("id") ON DELETE SET NULL,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── POST LIKES ───────────────────────────────────────────────────────────────
CREATE TABLE "PostLike" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "postId"    TEXT NOT NULL REFERENCES "Post"("id") ON DELETE CASCADE,
    "userId"    TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("postId", "userId")
);

-- ── STORIES ──────────────────────────────────────────────────────────────────
CREATE TABLE "Story" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "authorId"    TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "mediaUrl"    TEXT NOT NULL,
    "mediaType"   TEXT NOT NULL DEFAULT 'image',
    "caption"     TEXT,
    "duration"    INTEGER NOT NULL DEFAULT 15,
    "viewsCount"  INTEGER NOT NULL DEFAULT 0,
    "expiresAt"   TIMESTAMP(3) NOT NULL,
    "isArchived"  BOOLEAN NOT NULL DEFAULT false,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── CONVERSATIONS ────────────────────────────────────────────────────────────
CREATE TABLE "Conversation" (
    "id"           TEXT NOT NULL PRIMARY KEY,
    "type"         TEXT NOT NULL DEFAULT 'direct',
    "name"         TEXT,
    "avatar"       TEXT,
    "createdById"  TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "lastMessageAt" TIMESTAMP(3),
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "ConversationParticipant" (
    "id"             TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE,
    "userId"         TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "role"           TEXT NOT NULL DEFAULT 'member',
    "joinedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReadAt"     TIMESTAMP(3),
    UNIQUE("conversationId", "userId")
);

-- ── MESSAGES ─────────────────────────────────────────────────────────────────
CREATE TABLE "Message" (
    "id"             TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL REFERENCES "Conversation"("id") ON DELETE CASCADE,
    "senderId"       TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "content"        TEXT,
    "mediaUrl"       TEXT,
    "mediaType"      TEXT,
    "type"           TEXT NOT NULL DEFAULT 'text',
    "status"         TEXT NOT NULL DEFAULT 'sent',
    "replyToId"      TEXT REFERENCES "Message"("id") ON DELETE SET NULL,
    "isDeleted"      BOOLEAN NOT NULL DEFAULT false,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── NOTIFICATIONS ────────────────────────────────────────────────────────────
CREATE TABLE "Notification" (
    "id"         TEXT NOT NULL PRIMARY KEY,
    "userId"     TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "actorId"    TEXT REFERENCES "User"("id") ON DELETE SET NULL,
    "type"       TEXT NOT NULL,
    "title"      TEXT NOT NULL,
    "body"       TEXT,
    "data"       JSONB,
    "isRead"     BOOLEAN NOT NULL DEFAULT false,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── GROUPS ───────────────────────────────────────────────────────────────────
CREATE TABLE "Group" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "name"        TEXT NOT NULL,
    "description" TEXT,
    "avatar"      TEXT,
    "coverImage"  TEXT,
    "ownerId"     TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "privacy"     TEXT NOT NULL DEFAULT 'public',
    "category"    TEXT,
    "membersCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "GroupMember" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "groupId"   TEXT NOT NULL REFERENCES "Group"("id") ON DELETE CASCADE,
    "userId"    TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "role"      TEXT NOT NULL DEFAULT 'member',
    "joinedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("groupId", "userId")
);

-- ── EVENTS ───────────────────────────────────────────────────────────────────
CREATE TABLE "Event" (
    "id"             TEXT NOT NULL PRIMARY KEY,
    "title"          TEXT NOT NULL,
    "description"    TEXT,
    "coverImage"     TEXT,
    "organizerId"    TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "startDate"      TIMESTAMP(3) NOT NULL,
    "endDate"        TIMESTAMP(3),
    "locationName"   TEXT,
    "locationLat"    DOUBLE PRECISION,
    "locationLng"    DOUBLE PRECISION,
    "isOnline"       BOOLEAN NOT NULL DEFAULT false,
    "onlineUrl"      TEXT,
    "privacy"        TEXT NOT NULL DEFAULT 'public',
    "capacity"       INTEGER,
    "attendeesCount" INTEGER NOT NULL DEFAULT 0,
    "category"       TEXT,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "EventAttendee" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "eventId"   TEXT NOT NULL REFERENCES "Event"("id") ON DELETE CASCADE,
    "userId"    TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "status"    TEXT NOT NULL DEFAULT 'going',
    "joinedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("eventId", "userId")
);

-- ── DATING PROFILES ──────────────────────────────────────────────────────────
CREATE TABLE "DatingProfile" (
    "id"             TEXT NOT NULL PRIMARY KEY,
    "userId"         TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
    "bio"            TEXT,
    "photos"         TEXT[],
    "ageMin"         INTEGER NOT NULL DEFAULT 18,
    "ageMax"         INTEGER NOT NULL DEFAULT 50,
    "genderPref"     TEXT[],
    "maxDistance"    INTEGER NOT NULL DEFAULT 50,
    "latitude"       DOUBLE PRECISION,
    "longitude"      DOUBLE PRECISION,
    "interests"      TEXT[],
    "relationshipGoal" TEXT,
    "height"         INTEGER,
    "education"      TEXT,
    "occupation"     TEXT,
    "isActive"       BOOLEAN NOT NULL DEFAULT true,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "DatingSwipe" (
    "id"         TEXT NOT NULL PRIMARY KEY,
    "swiperId"   TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "swipedId"   TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "direction"  TEXT NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("swiperId", "swipedId")
);

CREATE TABLE "DatingMatch" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "user1Id"   TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "user2Id"   TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "status"    TEXT NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("user1Id", "user2Id")
);

-- ── MARKETPLACE LISTINGS ─────────────────────────────────────────────────────
CREATE TABLE "Listing" (
    "id"           TEXT NOT NULL PRIMARY KEY,
    "sellerId"     TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "title"        TEXT NOT NULL,
    "description"  TEXT,
    "price"        DECIMAL(10,2) NOT NULL,
    "currency"     TEXT NOT NULL DEFAULT 'USD',
    "images"       TEXT[],
    "category"     TEXT NOT NULL,
    "condition"    TEXT,
    "status"       TEXT NOT NULL DEFAULT 'active',
    "quantity"     INTEGER NOT NULL DEFAULT 1,
    "locationName" TEXT,
    "shippingCost" DECIMAL(10,2),
    "viewsCount"   INTEGER NOT NULL DEFAULT 0,
    "createdAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"    TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── ORDERS ───────────────────────────────────────────────────────────────────
CREATE TABLE "Order" (
    "id"              TEXT NOT NULL PRIMARY KEY,
    "buyerId"         TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "sellerId"        TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "listingId"       TEXT NOT NULL REFERENCES "Listing"("id") ON DELETE CASCADE,
    "quantity"        INTEGER NOT NULL DEFAULT 1,
    "totalAmount"     DECIMAL(10,2) NOT NULL,
    "status"          TEXT NOT NULL DEFAULT 'pending',
    "stripePaymentId" TEXT,
    "shippingAddress" JSONB,
    "trackingNumber"  TEXT,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── WALLET / COINS ───────────────────────────────────────────────────────────
CREATE TABLE "WalletTransaction" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "userId"      TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "type"        TEXT NOT NULL,
    "amount"      DECIMAL(10,2) NOT NULL,
    "coins"       INTEGER,
    "description" TEXT,
    "stripeId"    TEXT,
    "status"      TEXT NOT NULL DEFAULT 'completed',
    "createdAt"   TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── LIVE STREAMS ─────────────────────────────────────────────────────────────
CREATE TABLE "LiveStream" (
    "id"             TEXT NOT NULL PRIMARY KEY,
    "streamerId"     TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "title"          TEXT NOT NULL,
    "description"    TEXT,
    "muxStreamId"    TEXT UNIQUE,
    "muxPlaybackId"  TEXT,
    "status"         TEXT NOT NULL DEFAULT 'idle',
    "viewersCount"   INTEGER NOT NULL DEFAULT 0,
    "peakViewers"    INTEGER NOT NULL DEFAULT 0,
    "duration"       INTEGER,
    "category"       TEXT,
    "tags"           TEXT[],
    "startedAt"      TIMESTAMP(3),
    "endedAt"        TIMESTAMP(3),
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── KYC VERIFICATIONS ────────────────────────────────────────────────────────
CREATE TABLE "KYCVerification" (
    "id"           TEXT NOT NULL PRIMARY KEY,
    "userId"       TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
    "status"       TEXT NOT NULL DEFAULT 'pending',
    "documentType" TEXT,
    "documentUrl"  TEXT,
    "selfieUrl"    TEXT,
    "reviewedBy"   TEXT,
    "reviewNote"   TEXT,
    "submittedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt"   TIMESTAMP(3)
);

-- ── REFRESH TOKENS ───────────────────────────────────────────────────────────
CREATE TABLE "RefreshToken" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "userId"    TEXT NOT NULL REFERENCES "User"("id") ON DELETE CASCADE,
    "token"     TEXT NOT NULL UNIQUE,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── STRIPE CONNECT ACCOUNTS ──────────────────────────────────────────────────
CREATE TABLE "StripeAccount" (
    "id"               TEXT NOT NULL PRIMARY KEY,
    "userId"           TEXT NOT NULL UNIQUE REFERENCES "User"("id") ON DELETE CASCADE,
    "stripeAccountId"  TEXT NOT NULL UNIQUE,
    "status"           TEXT NOT NULL DEFAULT 'pending',
    "payoutsEnabled"   BOOLEAN NOT NULL DEFAULT false,
    "chargesEnabled"   BOOLEAN NOT NULL DEFAULT false,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX "User_email_idx" ON "User"("email");
CREATE INDEX "User_username_idx" ON "User"("username");
CREATE INDEX "Post_authorId_idx" ON "Post"("authorId");
CREATE INDEX "Post_createdAt_idx" ON "Post"("createdAt" DESC);
CREATE INDEX "Post_hashtags_idx" ON "Post" USING GIN ("hashtags");
CREATE INDEX "Follow_followerId_idx" ON "Follow"("followerId");
CREATE INDEX "Follow_followingId_idx" ON "Follow"("followingId");
CREATE INDEX "Message_conversationId_idx" ON "Message"("conversationId");
CREATE INDEX "Message_createdAt_idx" ON "Message"("createdAt" DESC);
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");
CREATE INDEX "Notification_isRead_idx" ON "Notification"("isRead");
CREATE INDEX "Listing_sellerId_idx" ON "Listing"("sellerId");
CREATE INDEX "Listing_category_idx" ON "Listing"("category");
CREATE INDEX "Listing_status_idx" ON "Listing"("status");
CREATE INDEX "Order_buyerId_idx" ON "Order"("buyerId");
CREATE INDEX "Order_sellerId_idx" ON "Order"("sellerId");
CREATE INDEX "LiveStream_streamerId_idx" ON "LiveStream"("streamerId");
CREATE INDEX "LiveStream_status_idx" ON "LiveStream"("status");
CREATE INDEX "DatingProfile_userId_idx" ON "DatingProfile"("userId");
CREATE INDEX "Story_authorId_idx" ON "Story"("authorId");
CREATE INDEX "Story_expiresAt_idx" ON "Story"("expiresAt");
