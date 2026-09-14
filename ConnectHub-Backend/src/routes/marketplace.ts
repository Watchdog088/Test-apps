/**
 * marketplace.ts — Marketplace listing CRUD + search
 * Mounted at /api/v1/marketplace (server.ts)
 *
 * GET    /marketplace               list / search listings
 * GET    /marketplace/:id           single listing detail
 * POST   /marketplace               create a new listing
 * PUT    /marketplace/:id           update your listing
 * DELETE /marketplace/:id           delete your listing
 * GET    /marketplace/user/saved    current user's saved listings
 * POST   /marketplace/:id/save      toggle save a listing
 * POST   /marketplace/:id/review    add a review
 * GET    /marketplace/:id/reviews   list reviews
 */

import { Router, Request, Response } from 'express';

const router = Router();

// ── helpers ───────────────────────────────────────────────────────
function uid(req: Request): string {
  return (req as any).user?.uid || (req as any).user?.id || '';
}

// Lazy-load prisma so the module doesn't crash if db isn't up
function db() {
  return require('../config/database').prisma as any;
}

// ── GET /marketplace ──────────────────────────────────────────────
// Paginated listing search with optional filters.
router.get('/', async (req: Request, res: Response) => {
  try {
    const page      = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit     = Math.min(50, parseInt(req.query.limit as string) || 20);
    const skip      = (page - 1) * limit;
    const q         = (req.query.q         as string) || '';
    const category  = (req.query.category  as string) || '';
    const minPrice  = parseFloat(req.query.minPrice  as string) || 0;
    const maxPrice  = parseFloat(req.query.maxPrice  as string) || 1e9;
    const condition = (req.query.condition as string) || '';
    const sortBy    = (req.query.sortBy    as string) || 'createdAt';

    const where: any = {
      isActive: true,
      price: { gte: minPrice, lte: maxPrice },
    };
    if (q)         where.title    = { contains: q, mode: 'insensitive' };
    if (category)  where.category = category;
    if (condition) where.condition = condition;

    const [listings, total] = await Promise.all([
      db().marketplaceListing.findMany({
        where,
        include: {
          seller: { select: { id: true, username: true, avatar: true, isVerified: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: { [sortBy]: 'desc' },
        skip,
        take: limit,
      }),
      db().marketplaceListing.count({ where }),
    ]);

    return res.json({
      success: true,
      data: {
        listings,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit), hasMore: skip + limit < total },
      },
    });
  } catch (err: any) {
    console.error('[marketplace/list]', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ── GET /marketplace/user/saved ───────────────────────────────────
// Must be before /:id so Express doesn't treat "saved" as an id.
router.get('/user/saved', async (req: Request, res: Response) => {
  try {
    const userId = uid(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorised' });

    const saved = await db().savedListing.findMany({
      where: { userId },
      include: {
        listing: {
          include: { seller: { select: { id: true, username: true, avatar: true } } },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ success: true, data: { listings: saved.map((s: any) => s.listing) } });
  } catch (err: any) {
    console.error('[marketplace/saved]', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ── GET /marketplace/:id ──────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const listing = await db().marketplaceListing.findUnique({
      where: { id: req.params.id },
      include: {
        seller:  { select: { id: true, username: true, avatar: true, isVerified: true } },
        reviews: {
          include: { reviewer: { select: { id: true, username: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
          take:    10,
        },
        _count:  { select: { reviews: true } },
      },
    });

    if (!listing) return res.status(404).json({ success: false, error: 'Listing not found' });

    // Increment view counter (best-effort)
    db().marketplaceListing.update({
      where: { id: req.params.id },
      data:  { viewsCount: { increment: 1 } },
    }).catch(() => {});

    return res.json({ success: true, data: { listing } });
  } catch (err: any) {
    console.error('[marketplace/get]', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ── POST /marketplace ─────────────────────────────────────────────
router.post('/', async (req: Request, res: Response) => {
  try {
    const sellerId = uid(req);
    if (!sellerId) return res.status(401).json({ error: 'Unauthorised' });

    const { title, description, price, currency, category, condition, images, location, shipsTo } = req.body;

    if (!title?.trim() || !price || !category) {
      return res.status(400).json({ error: 'title, price, and category are required' });
    }

    const listing = await db().marketplaceListing.create({
      data: {
        sellerId,
        title:       title.trim(),
        description: description || '',
        price:       parseFloat(price),
        currency:    currency || 'USD',
        category,
        condition:   condition || 'used',
        images:      images || [],
        location:    location || null,
        shipsTo:     shipsTo || [],
        isActive:    true,
        viewsCount:  0,
      },
      include: {
        seller: { select: { id: true, username: true, avatar: true } },
      },
    });

    return res.status(201).json({ success: true, data: { listing } });
  } catch (err: any) {
    console.error('[marketplace/create]', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ── PUT /marketplace/:id ──────────────────────────────────────────
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const sellerId = uid(req);
    if (!sellerId) return res.status(401).json({ error: 'Unauthorised' });

    const existing = await db().marketplaceListing.findUnique({ where: { id: req.params.id } });
    if (!existing)                   return res.status(404).json({ error: 'Listing not found' });
    if (existing.sellerId !== sellerId) return res.status(403).json({ error: 'Forbidden' });

    const { title, description, price, category, condition, images, location, isActive } = req.body;

    const updated = await db().marketplaceListing.update({
      where: { id: req.params.id },
      data: {
        ...(title       !== undefined && { title: title.trim() }),
        ...(description !== undefined && { description }),
        ...(price       !== undefined && { price: parseFloat(price) }),
        ...(category    !== undefined && { category }),
        ...(condition   !== undefined && { condition }),
        ...(images      !== undefined && { images }),
        ...(location    !== undefined && { location }),
        ...(isActive    !== undefined && { isActive }),
        updatedAt: new Date(),
      },
    });

    return res.json({ success: true, data: { listing: updated } });
  } catch (err: any) {
    console.error('[marketplace/update]', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ── DELETE /marketplace/:id ───────────────────────────────────────
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const sellerId = uid(req);
    if (!sellerId) return res.status(401).json({ error: 'Unauthorised' });

    const existing = await db().marketplaceListing.findUnique({ where: { id: req.params.id } });
    if (!existing)                   return res.status(404).json({ error: 'Listing not found' });

    const isAdmin = (req as any).user?.role === 'admin';
    if (existing.sellerId !== sellerId && !isAdmin) return res.status(403).json({ error: 'Forbidden' });

    await db().marketplaceListing.delete({ where: { id: req.params.id } });

    return res.json({ success: true, message: 'Listing deleted' });
  } catch (err: any) {
    console.error('[marketplace/delete]', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ── POST /marketplace/:id/save ────────────────────────────────────
router.post('/:id/save', async (req: Request, res: Response) => {
  try {
    const userId = uid(req);
    if (!userId) return res.status(401).json({ error: 'Unauthorised' });

    const existing = await db().savedListing.findFirst({ where: { userId, listingId: req.params.id } });

    if (existing) {
      await db().savedListing.delete({ where: { id: existing.id } });
      return res.json({ success: true, isSaved: false });
    } else {
      await db().savedListing.create({ data: { userId, listingId: req.params.id } });
      return res.json({ success: true, isSaved: true });
    }
  } catch (err: any) {
    console.error('[marketplace/save]', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ── POST /marketplace/:id/review ──────────────────────────────────
router.post('/:id/review', async (req: Request, res: Response) => {
  try {
    const reviewerId = uid(req);
    if (!reviewerId) return res.status(401).json({ error: 'Unauthorised' });

    const { rating, comment } = req.body;
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'rating must be 1–5' });
    }

    const review = await db().listingReview.create({
      data: { listingId: req.params.id, reviewerId, rating: parseInt(rating), comment: comment || '' },
      include: { reviewer: { select: { id: true, username: true, avatar: true } } },
    });

    return res.status(201).json({ success: true, data: { review } });
  } catch (err: any) {
    console.error('[marketplace/review]', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ── GET /marketplace/:id/reviews ──────────────────────────────────
router.get('/:id/reviews', async (req: Request, res: Response) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit = Math.min(50, parseInt(req.query.limit as string) || 10);
    const skip  = (page - 1) * limit;

    const reviews = await db().listingReview.findMany({
      where:   { listingId: req.params.id },
      include: { reviewer: { select: { id: true, username: true, avatar: true } } },
      orderBy: { createdAt: 'desc' },
      skip,
      take:    limit,
    });

    return res.json({ success: true, data: { reviews, pagination: { page, hasMore: reviews.length === limit } } });
  } catch (err: any) {
    console.error('[marketplace/reviews]', err.message);
    return res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

export default router;
