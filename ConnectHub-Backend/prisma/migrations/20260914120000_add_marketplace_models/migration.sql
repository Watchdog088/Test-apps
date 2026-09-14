-- Migration: add_marketplace_models
-- Created: Sep 14, 2026
-- Adds: marketplace_listings, saved_listings, listing_reviews

-- ─── marketplace_listings ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "marketplace_listings" (
    "id"             TEXT NOT NULL,
    "sellerId"       TEXT NOT NULL,
    "title"          TEXT NOT NULL,
    "description"    TEXT,
    "price"          DOUBLE PRECISION NOT NULL,
    "currency"       TEXT NOT NULL DEFAULT 'USD',
    "category"       TEXT NOT NULL,
    "condition"      TEXT NOT NULL DEFAULT 'new',
    "imageUrls"      TEXT[] NOT NULL DEFAULT '{}',
    "tags"           TEXT[] NOT NULL DEFAULT '{}',
    "location"       TEXT,
    "isShipping"     BOOLEAN NOT NULL DEFAULT true,
    "shippingCost"   DOUBLE PRECISION,
    "stock"          INTEGER NOT NULL DEFAULT 1,
    "status"         TEXT NOT NULL DEFAULT 'active',
    "viewsCount"     INTEGER NOT NULL DEFAULT 0,
    "favoritesCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt"      TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      TIMESTAMP(3) NOT NULL,

    CONSTRAINT "marketplace_listings_pkey" PRIMARY KEY ("id")
);

-- ─── saved_listings ───────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "saved_listings" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_listings_pkey" PRIMARY KEY ("id")
);

-- ─── listing_reviews ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "listing_reviews" (
    "id"         TEXT NOT NULL,
    "listingId"  TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "rating"     INTEGER NOT NULL,
    "title"      TEXT,
    "body"       TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"  TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listing_reviews_pkey" PRIMARY KEY ("id")
);

-- ─── Unique constraint: one save per user per listing ─────────────────────────
CREATE UNIQUE INDEX IF NOT EXISTS "saved_listings_userId_listingId_key"
    ON "saved_listings"("userId", "listingId");

-- ─── Foreign keys ─────────────────────────────────────────────────────────────
ALTER TABLE "saved_listings"
    ADD CONSTRAINT "saved_listings_listingId_fkey"
    FOREIGN KEY ("listingId") REFERENCES "marketplace_listings"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "listing_reviews"
    ADD CONSTRAINT "listing_reviews_listingId_fkey"
    FOREIGN KEY ("listingId") REFERENCES "marketplace_listings"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ─── Performance indexes ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS "marketplace_listings_sellerId_idx"  ON "marketplace_listings"("sellerId");
CREATE INDEX IF NOT EXISTS "marketplace_listings_category_idx"  ON "marketplace_listings"("category");
CREATE INDEX IF NOT EXISTS "marketplace_listings_status_idx"    ON "marketplace_listings"("status");
CREATE INDEX IF NOT EXISTS "marketplace_listings_price_idx"     ON "marketplace_listings"("price");
CREATE INDEX IF NOT EXISTS "marketplace_listings_createdAt_idx" ON "marketplace_listings"("createdAt");

CREATE INDEX IF NOT EXISTS "saved_listings_userId_idx"          ON "saved_listings"("userId");
CREATE INDEX IF NOT EXISTS "saved_listings_listingId_idx"       ON "saved_listings"("listingId");

CREATE INDEX IF NOT EXISTS "listing_reviews_listingId_idx"      ON "listing_reviews"("listingId");
CREATE INDEX IF NOT EXISTS "listing_reviews_reviewerId_idx"     ON "listing_reviews"("reviewerId");
CREATE INDEX IF NOT EXISTS "listing_reviews_rating_idx"         ON "listing_reviews"("rating");
