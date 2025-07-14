import { Router } from 'express';
import { eq, desc, sql, and, gte, lte, count } from 'drizzle-orm';
import { db } from '../db';
import { banners, bannerStats, type Banner } from '@shared/schema';

const router = Router();

// Public banner endpoint - no auth required for displaying banners on website
router.get('/', async (req, res) => {
  try {
    const type = req.query.type as string;
    const pageLocation = req.query.page as string || 'home';
    const language = req.query.language as string || 'tr';

    // Build where conditions
    const whereConditions = [
      eq(banners.isActive, true),
      eq(banners.status, 'active'),
      eq(banners.language, language)
    ];
    
    if (type && type !== 'all') {
      whereConditions.push(eq(banners.type, type));
    }
    
    if (pageLocation && pageLocation !== 'all') {
      whereConditions.push(sql`(${banners.pageLocation} = ${pageLocation} OR ${banners.pageLocation} = 'all')`);
    }

    // Get active banners
    const activeBanners = await db
      .select({
        id: banners.id,
        title: banners.title,
        description: banners.description,
        imageUrl: banners.imageUrl,
        mobileImageUrl: banners.mobileImageUrl,
        linkUrl: banners.linkUrl,
        type: banners.type,
        position: banners.position,
        pageLocation: banners.pageLocation,
        targetAudience: banners.targetAudience,
        displayPriority: banners.displayPriority,
        displayFrequency: banners.displayFrequency,
        popupDelay: banners.popupDelay
      })
      .from(banners)
      .where(and(...whereConditions))
      .orderBy(desc(banners.displayPriority), banners.position, desc(banners.createdAt));

    res.json({
      success: true,
      data: activeBanners
    });
  } catch (error) {
    console.error('Error fetching public banners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners'
    });
  }
});

// Track banner impression/click - public endpoint
router.post('/:id/track', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { action, sessionId, userAgent, deviceType } = req.body;

    if (!action || !['impression', 'click', 'close'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Valid action is required (impression, click, close)'
      });
    }

    // Record the action
    await db.insert(bannerStats).values({
      bannerId: id,
      userId: null, // Public tracking, no user ID
      sessionId: sessionId || null,
      action,
      userAgent: userAgent || req.get('User-Agent'),
      ipAddress: req.ip,
      referrer: req.get('Referer'),
      deviceType: deviceType || 'desktop',
      browserType: req.get('User-Agent')?.includes('Mobile') ? 'mobile' : 'desktop'
    });

    // Update banner counters
    if (action === 'impression') {
      await db
        .update(banners)
        .set({ impressions: sql`${banners.impressions} + 1` })
        .where(eq(banners.id, id));
    } else if (action === 'click') {
      await db
        .update(banners)
        .set({ clicks: sql`${banners.clicks} + 1` })
        .where(eq(banners.id, id));
    }

    res.json({
      success: true,
      message: 'Action tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking banner action:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track action'
    });
  }
});

export default router;