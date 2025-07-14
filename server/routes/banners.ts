import { Router } from 'express';
import { eq, desc, sql, and, gte, lte, count } from 'drizzle-orm';
import { db } from '../db';
import { banners, bannerStats, type Banner, type InsertBanner } from '@shared/schema';
import { authMiddleware } from '../utils/auth';
import { z } from 'zod';

const router = Router();

// Apply admin auth middleware to protected routes
router.use(authMiddleware);

// Get all banners with filtering and pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    const type = req.query.type as string;
    const status = req.query.status as string;
    const language = req.query.language as string;
    const search = req.query.search as string;

    // Build where conditions
    const whereConditions = [];
    
    if (type && type !== 'all') {
      whereConditions.push(eq(banners.type, type));
    }
    
    if (status && status !== 'all') {
      whereConditions.push(eq(banners.status, status));
    }
    
    if (language && language !== 'all') {
      whereConditions.push(eq(banners.language, language));
    }

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(banners)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined);
    
    const total = totalResult[0]?.count || 0;

    // Get banners with pagination
    const bannersResult = await db
      .select()
      .from(banners)
      .where(whereConditions.length > 0 ? and(...whereConditions) : undefined)
      .orderBy(desc(banners.position), desc(banners.createdAt))
      .limit(limit)
      .offset(offset);

    // Get banner statistics
    const totalBanners = total;
    const activeBanners = await db.select({ count: count() }).from(banners).where(eq(banners.isActive, true));
    const inactiveBanners = await db.select({ count: count() }).from(banners).where(eq(banners.isActive, false));
    const scheduledBanners = await db.select({ count: count() }).from(banners).where(eq(banners.status, 'scheduled'));
    
    const statsQuery = await db.select({
      totalImpressions: sql<number>`SUM(${banners.impressions})`,
      totalClicks: sql<number>`SUM(${banners.clicks})`
    }).from(banners);
    
    const totalImpressions = Number(statsQuery[0]?.totalImpressions) || 0;
    const totalClicks = Number(statsQuery[0]?.totalClicks) || 0;
    const overallCtr = totalImpressions > 0 ? Number((totalClicks / totalImpressions * 100).toFixed(2)) : 0;

    res.json({
      success: true,
      data: bannersResult,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        totalBanners,
        activeBanners: activeBanners[0]?.count || 0,
        inactiveBanners: inactiveBanners[0]?.count || 0,
        scheduledBanners: scheduledBanners[0]?.count || 0,
        totalImpressions,
        totalClicks,
        overallCtr
      }
    });
  } catch (error) {
    console.error('Error fetching banners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banners'
    });
  }
});

// Get banner by ID
router.get('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const banner = await db
      .select()
      .from(banners)
      .where(eq(banners.id, id))
      .limit(1);

    if (!banner.length) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.json({
      success: true,
      data: banner[0]
    });
  } catch (error) {
    console.error('Error fetching banner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banner'
    });
  }
});

// Create new banner
router.post('/', async (req, res) => {
  try {
    const bannerData = req.body;
    
    // Validate required fields
    if (!bannerData.title || !bannerData.imageUrl || !bannerData.type) {
      return res.status(400).json({
        success: false,
        message: 'Title, image URL, and type are required'
      });
    }

    const newBanner = await db
      .insert(banners)
      .values({
        title: bannerData.title,
        description: bannerData.description,
        imageUrl: bannerData.imageUrl,
        mobileImageUrl: bannerData.mobileImageUrl,
        linkUrl: bannerData.linkUrl,
        type: bannerData.type,
        position: bannerData.position || 1,
        status: bannerData.status || 'active',
        language: bannerData.language || 'tr',
        pageLocation: bannerData.pageLocation || 'home',
        targetAudience: bannerData.targetAudience || 'all',
        minVipLevel: bannerData.minVipLevel || 0,

        startDate: bannerData.startDate ? new Date(bannerData.startDate) : null,
        endDate: bannerData.endDate ? new Date(bannerData.endDate) : null,
        displayPriority: bannerData.displayPriority || 1,
        displayFrequency: bannerData.displayFrequency || 'always',
        popupDelay: bannerData.popupDelay || 3000,
        isActive: bannerData.isActive !== false,
        createdBy: (req.user as any)?.id || null
      })
      .returning();

    res.status(201).json({
      success: true,
      data: newBanner[0],
      message: 'Banner created successfully'
    });
  } catch (error) {
    console.error('Error creating banner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create banner'
    });
  }
});

// Update banner
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const bannerData = req.body;

    const updatedBanner = await db
      .update(banners)
      .set({
        ...bannerData,
        updatedBy: (req.user as any)?.id || null,
        updatedAt: new Date()
      })
      .where(eq(banners.id, id))
      .returning();

    if (!updatedBanner.length) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.json({
      success: true,
      data: updatedBanner[0],
      message: 'Banner updated successfully'
    });
  } catch (error) {
    console.error('Error updating banner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update banner'
    });
  }
});

// Delete banner
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const deletedBanner = await db
      .delete(banners)
      .where(eq(banners.id, id))
      .returning();

    if (!deletedBanner.length) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    res.json({
      success: true,
      message: 'Banner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting banner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete banner'
    });
  }
});

// Get banner statistics
router.get('/:id/stats', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get banner stats
    const stats = await db
      .select({
        action: bannerStats.action,
        count: count()
      })
      .from(bannerStats)
      .where(and(
        eq(bannerStats.bannerId, id),
        gte(bannerStats.createdAt, startDate)
      ))
      .groupBy(bannerStats.action);

    // Get daily stats
    const dailyStats = await db
      .select({
        date: sql<string>`DATE(${bannerStats.createdAt})`,
        impressions: sql<number>`COUNT(CASE WHEN ${bannerStats.action} = 'impression' THEN 1 END)`,
        clicks: sql<number>`COUNT(CASE WHEN ${bannerStats.action} = 'click' THEN 1 END)`
      })
      .from(bannerStats)
      .where(and(
        eq(bannerStats.bannerId, id),
        gte(bannerStats.createdAt, startDate)
      ))
      .groupBy(sql`DATE(${bannerStats.createdAt})`)
      .orderBy(sql`DATE(${bannerStats.createdAt})`);

    const totalImpressions = stats.find(s => s.action === 'impression')?.count || 0;
    const totalClicks = stats.find(s => s.action === 'click')?.count || 0;
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions * 100).toFixed(2) : '0.00';

    res.json({
      success: true,
      data: {
        totalImpressions,
        totalClicks,
        ctr: parseFloat(ctr),
        dailyStats
      }
    });
  } catch (error) {
    console.error('Error fetching banner stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banner statistics'
    });
  }
});

// Record banner impression/click
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

    await db.insert(bannerStats).values({
      bannerId: id,
      userId: (req.user as any)?.id || null,
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

// Bulk operations
router.post('/bulk', async (req, res) => {
  try {
    const { action, bannerIds } = req.body;

    if (!action || !bannerIds || !Array.isArray(bannerIds)) {
      return res.status(400).json({
        success: false,
        message: 'Action and banner IDs array are required'
      });
    }

    let updateData: any = {};
    let message = '';

    switch (action) {
      case 'activate':
        updateData = { isActive: true, status: 'active' };
        message = 'Banners activated successfully';
        break;
      case 'deactivate':
        updateData = { isActive: false, status: 'inactive' };
        message = 'Banners deactivated successfully';
        break;
      case 'delete':
        await db.delete(banners).where(sql`${banners.id} = ANY(${bannerIds})`);
        return res.json({
          success: true,
          message: 'Banners deleted successfully'
        });
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
    }

    if (Object.keys(updateData).length > 0) {
      await db
        .update(banners)
        .set(updateData)
        .where(sql`${banners.id} = ANY(${bannerIds})`);
    }

    res.json({
      success: true,
      message
    });
  } catch (error) {
    console.error('Error performing bulk operation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to perform bulk operation'
    });
  }
});

// Get banner analytics summary
router.get('/analytics/summary', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Get overall stats
    const totalBanners = await db.select({ count: count() }).from(banners);
    const activeBanners = await db
      .select({ count: count() })
      .from(banners)
      .where(eq(banners.isActive, true));

    // Get performance stats
    const performanceStats = await db
      .select({
        type: banners.type,
        totalImpressions: sql<number>`SUM(${banners.impressions})`,
        totalClicks: sql<number>`SUM(${banners.clicks})`,
        bannerCount: count()
      })
      .from(banners)
      .groupBy(banners.type);

    res.json({
      success: true,
      data: {
        totalBanners: totalBanners[0]?.count || 0,
        activeBanners: activeBanners[0]?.count || 0,
        performanceByType: performanceStats
      }
    });
  } catch (error) {
    console.error('Error fetching banner analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch banner analytics'
    });
  }
});

export default router;