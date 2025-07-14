import { Request, Response } from 'express';
import { storage } from '../storage';
import { banners, bannerStats, users } from '../../shared/schema';
import { sql, eq, and, or, desc, asc, count, sum } from 'drizzle-orm';
import { db } from '../storage';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

// Auth helper functions
const requireAuth = async (req: Request) => {
  const token = req.headers.authorization?.replace('Bearer ', '') || req.session?.token;
  
  if (!token) {
    throw new Error('Authorization token required');
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const user = await db.select().from(users).where(eq(users.id, decoded.userId)).limit(1);
    
    if (!user || user.length === 0) {
      throw new Error('User not found');
    }
    
    return user[0];
  } catch (error) {
    throw new Error('Invalid token');
  }
};

const requireRole = async (user: any, roles: string[]) => {
  if (!roles.includes(user.role)) {
    throw new Error(`Insufficient permissions. Required: ${roles.join(', ')}`);
  }
};

// Banner validation schema
const bannerSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  imageUrl: z.string().url('Invalid image URL'),
  mobileImageUrl: z.string().url('Invalid mobile image URL').optional().or(z.literal('')),
  linkUrl: z.string().optional(),
  type: z.enum(['slider', 'popup', 'sidebar', 'header', 'footer']),
  position: z.number().min(1).default(1),
  status: z.enum(['active', 'inactive', 'scheduled', 'expired']).default('active'),
  language: z.enum(['tr', 'en', 'ka']).default('tr'),
  pageLocation: z.enum(['home', 'slot', 'casino', 'bonuses', 'vip', 'all']).default('home'),
  targetAudience: z.enum(['all', 'new_users', 'vip', 'inactive']).default('all'),
  minVipLevel: z.number().min(0).max(10).default(0),


  displayPriority: z.number().min(1).default(1),
  displayFrequency: z.number().min(1).default(1),
  popupDelay: z.number().min(0).default(3000),
  isActive: z.boolean().default(true)
});

// Get all banners with filtering and pagination
export const getBanners = async (req: Request, res: Response) => {
  try {
    const user = await requireAuth(req);
    await requireRole(user, ['admin', 'manager']);

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;
    
    const searchTerm = req.query.search as string || '';
    const typeFilter = req.query.type as string || 'all';
    const statusFilter = req.query.status as string || 'all';
    const languageFilter = req.query.language as string || 'all';
    const pageLocationFilter = req.query.pageLocation as string || 'all';
    const sortBy = req.query.sortBy as string || 'created_at';
    const sortOrder = req.query.sortOrder as string || 'desc';

    // Build where conditions
    const whereConditions = [];
    const params: any[] = [];

    if (searchTerm) {
      whereConditions.push(`(title ILIKE $${params.length + 1} OR description ILIKE $${params.length + 2})`);
      params.push(`%${searchTerm}%`, `%${searchTerm}%`);
    }

    if (typeFilter !== 'all') {
      whereConditions.push(`type = $${params.length + 1}`);
      params.push(typeFilter);
    }

    if (statusFilter !== 'all') {
      whereConditions.push(`status = $${params.length + 1}`);
      params.push(statusFilter);
    }

    if (languageFilter !== 'all') {
      whereConditions.push(`language = $${params.length + 1}`);
      params.push(languageFilter);
    }

    if (pageLocationFilter !== 'all') {
      whereConditions.push(`page_location = $${params.length + 1}`);
      params.push(pageLocationFilter);
    }

    const whereClause = whereConditions.length > 0 ? 'WHERE ' + whereConditions.join(' AND ') : '';

    // Get total count
    const countQuery = `SELECT COUNT(*) as total FROM banners ${whereClause}`;
    const countResult = await db.execute(sql.raw(countQuery));
    const total = Number(countResult.rows[0]?.total) || 0;

    // Get banners with creator info
    const dataQuery = `
      SELECT 
        b.id, b.title, b.description, b.image_url, b.link_url, b.type, b.page_location,
        b.language, b.is_active, b.sort_order, b.created_at, b.updated_at, 
        b.mobile_image_url, b.clicks, b.impressions, b.position, b.target_audience,
        b.display_priority, b.display_frequency, b.popup_delay, b.status, b.min_vip_level
      FROM banners b
      ${whereClause}
      ORDER BY ${sortBy === 'created_at' ? 'b.created_at' : 
                 sortBy === 'title' ? 'b.title' : 
                 sortBy === 'position' ? 'b.position' : 
                 sortBy === 'impressions' ? 'b.impressions' : 
                 sortBy === 'clicks' ? 'b.clicks' : 'b.created_at'} ${sortOrder === 'asc' ? 'ASC' : 'DESC'}
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    
    params.push(limit, offset);
    const result = await db.execute(sql.raw(dataQuery));

    const totalPages = Math.ceil(total / limit);

    // Get banner statistics summary
    const statsQuery = `
      SELECT 
        COUNT(*) as total_banners,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as active_banners,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactive_banners,
        COUNT(CASE WHEN status = 'scheduled' THEN 1 END) as scheduled_banners,
        COALESCE(SUM(impressions), 0) as total_impressions,
        COALESCE(SUM(clicks), 0) as total_clicks,
        CASE 
          WHEN SUM(impressions) > 0 THEN ROUND((SUM(clicks)::decimal / SUM(impressions) * 100)::numeric, 2)
          ELSE 0 
        END as overall_ctr
      FROM banners
      ${whereClause}
    `;
    
    const statsResult = await db.execute(sql.raw(statsQuery));
    const stats = statsResult.rows[0] || {};

    res.json({
      success: true,
      banners: result.rows,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      stats: {
        totalBanners: Number(stats.total_banners) || 0,
        activeBanners: Number(stats.active_banners) || 0,
        inactiveBanners: Number(stats.inactive_banners) || 0,
        scheduledBanners: Number(stats.scheduled_banners) || 0,
        totalImpressions: Number(stats.total_impressions) || 0,
        totalClicks: Number(stats.total_clicks) || 0,
        overallCtr: Number(stats.overall_ctr) || 0
      },
      filters: {
        search: searchTerm,
        type: typeFilter,
        status: statusFilter,
        language: languageFilter,
        pageLocation: pageLocationFilter,
        sortBy,
        sortOrder
      }
    });

  } catch (error: any) {
    console.error('Get banners error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch banners'
    });
  }
};

// Get single banner by ID
export const getBannerById = async (req: Request, res: Response) => {
  try {
    const user = await requireAuth(req);
    await requireRole(user, ['admin', 'manager']);

    const bannerId = parseInt(req.params.id);
    
    if (isNaN(bannerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid banner ID'
      });
    }

    const result = await db.execute(sql`
      SELECT 
        b.id, b.title, b.description, b.image_url, b.link_url, b.type, b.page_location,
        b.language, b.is_active, b.sort_order, b.created_at, b.updated_at, 
        b.mobile_image_url, b.clicks, b.impressions, b.position, b.target_audience,
        b.display_priority, b.display_frequency, b.popup_delay, b.status, b.min_vip_level
      FROM banners b
      WHERE b.id = ${bannerId}
    `);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    // Get banner statistics for the last 30 days
    const statsResult = await db.execute(sql`
      SELECT 
        action,
        COUNT(*) as count,
        DATE_TRUNC('day', created_at) as date
      FROM banner_stats
      WHERE banner_id = ${bannerId}
        AND created_at >= NOW() - INTERVAL '30 days'
      GROUP BY action, DATE_TRUNC('day', created_at)
      ORDER BY date DESC
    `);

    res.json({
      success: true,
      banner: result.rows[0],
      statistics: statsResult.rows
    });

  } catch (error: any) {
    console.error('Get banner by ID error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch banner'
    });
  }
};

// Create new banner
export const createBanner = async (req: Request, res: Response) => {
  try {
    const user = await requireAuth(req);
    await requireRole(user, ['admin', 'manager']);

    const validatedData = bannerSchema.parse(req.body);

    const result = await db.execute(sql`
      INSERT INTO banners (
        title, description, image_url, mobile_image_url, link_url, type, position,
        status, language, page_location, target_audience, min_vip_level,
        display_priority, display_frequency, popup_delay, is_active, sort_order, created_at, updated_at
      ) VALUES (
        ${validatedData.title}, ${validatedData.description}, ${validatedData.imageUrl},
        ${validatedData.mobileImageUrl || null}, ${validatedData.linkUrl}, ${validatedData.type},
        ${validatedData.position}, ${validatedData.status}, ${validatedData.language},
        ${validatedData.pageLocation}, ${validatedData.targetAudience}, ${validatedData.minVipLevel},
        ${validatedData.displayPriority}, ${validatedData.displayFrequency}, ${validatedData.popupDelay},
        ${validatedData.isActive}, 1, NOW(), NOW()
      ) RETURNING *
    `);

    // Log admin action
    await db.execute(sql`
      INSERT INTO admin_logs (admin_id, action, description, metadata, created_at)
      VALUES (
        ${user.id}, 
        'CREATE_BANNER', 
        ${`Created banner: ${validatedData.title}`},
        ${JSON.stringify({ bannerId: result.rows[0].id, bannerData: validatedData })},
        NOW()
      )
    `);

    res.status(201).json({
      success: true,
      message: 'Banner created successfully',
      banner: result.rows[0]
    });

  } catch (error: any) {
    console.error('Create banner error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create banner'
    });
  }
};

// Update banner
export const updateBanner = async (req: Request, res: Response) => {
  try {
    const user = await requireAuth(req);
    await requireRole(user, ['admin', 'manager']);

    const bannerId = parseInt(req.params.id);
    
    if (isNaN(bannerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid banner ID'
      });
    }

    const validatedData = bannerSchema.partial().parse(req.body);

    // Check if banner exists
    const existingBanner = await db.execute(sql`
      SELECT * FROM banners WHERE id = ${bannerId}
    `);

    if (existingBanner.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    // Build update query dynamically
    const updateFields = [];
    const updateValues: any[] = [];
    let paramIndex = 1;

    Object.entries(validatedData).forEach(([key, value]) => {
      if (value !== undefined) {
        const dbKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        updateFields.push(`${dbKey} = $${paramIndex}`);
        updateValues.push(value);
        paramIndex++;
      }
    });

    updateFields.push(`updated_by = $${paramIndex}`);
    updateValues.push(user.id);
    paramIndex++;

    updateFields.push(`updated_at = NOW()`);

    updateValues.push(bannerId);

    const updateQuery = `
      UPDATE banners 
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await db.execute(sql.raw(updateQuery));

    // Log admin action
    await db.execute(sql`
      INSERT INTO admin_logs (admin_id, action, description, metadata, created_at)
      VALUES (
        ${user.id}, 
        'UPDATE_BANNER', 
        ${`Updated banner: ${result.rows[0].title}`},
        ${JSON.stringify({ bannerId, changes: validatedData })},
        NOW()
      )
    `);

    res.json({
      success: true,
      message: 'Banner updated successfully',
      banner: result.rows[0]
    });

  } catch (error: any) {
    console.error('Update banner error:', error);
    if (error.name === 'ZodError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update banner'
    });
  }
};

// Delete banner
export const deleteBanner = async (req: Request, res: Response) => {
  try {
    const user = await requireAuth(req);
    await requireRole(user, ['admin']);

    const bannerId = parseInt(req.params.id);
    
    if (isNaN(bannerId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid banner ID'
      });
    }

    // Check if banner exists
    const existingBanner = await db.execute(sql`
      SELECT * FROM banners WHERE id = ${bannerId}
    `);

    if (existingBanner.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Banner not found'
      });
    }

    // Delete related statistics first
    await db.execute(sql`
      DELETE FROM banner_stats WHERE banner_id = ${bannerId}
    `);

    // Delete banner
    await db.execute(sql`
      DELETE FROM banners WHERE id = ${bannerId}
    `);

    // Log admin action
    await db.execute(sql`
      INSERT INTO admin_logs (admin_id, action, description, metadata, created_at)
      VALUES (
        ${user.id}, 
        'DELETE_BANNER', 
        ${`Deleted banner: ${existingBanner.rows[0].title}`},
        ${JSON.stringify({ bannerId, bannerTitle: existingBanner.rows[0].title })},
        NOW()
      )
    `);

    res.json({
      success: true,
      message: 'Banner deleted successfully'
    });

  } catch (error: any) {
    console.error('Delete banner error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete banner'
    });
  }
};

// Bulk operations (activate, deactivate, delete)
export const bulkBannerAction = async (req: Request, res: Response) => {
  try {
    const user = await requireAuth(req);
    await requireRole(user, ['admin', 'manager']);

    const { action, bannerIds } = req.body;

    if (!action || !Array.isArray(bannerIds) || bannerIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action or banner IDs'
      });
    }

    const validActions = ['activate', 'deactivate', 'delete'];
    if (!validActions.includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Must be: activate, deactivate, or delete'
      });
    }

    // For delete action, require admin role
    if (action === 'delete') {
      await requireRole(user, ['admin']);
    }

    const placeholders = bannerIds.map((_, index) => `$${index + 1}`).join(',');

    let query = '';
    let logAction = '';

    switch (action) {
      case 'activate':
        query = `UPDATE banners SET is_active = true, status = 'active', updated_by = $${bannerIds.length + 1}, updated_at = NOW() WHERE id IN (${placeholders})`;
        logAction = 'Bulk activated banners';
        break;
      case 'deactivate':
        query = `UPDATE banners SET is_active = false, status = 'inactive', updated_by = $${bannerIds.length + 1}, updated_at = NOW() WHERE id IN (${placeholders})`;
        logAction = 'Bulk deactivated banners';
        break;
      case 'delete':
        // Delete related statistics first
        await db.execute(sql.raw(`DELETE FROM banner_stats WHERE banner_id IN (${placeholders})`));
        query = `DELETE FROM banners WHERE id IN (${placeholders})`;
        logAction = 'Bulk deleted banners';
        break;
    }

    const params = action === 'delete' ? bannerIds : [...bannerIds, user.id];
    await db.execute(sql.raw(query));

    // Log admin action
    await db.execute(sql`
      INSERT INTO admin_logs (admin_id, action, description, metadata, created_at)
      VALUES (
        ${user.id}, 
        'BULK_BANNER_ACTION', 
        ${logAction},
        ${JSON.stringify({ action, bannerIds, count: bannerIds.length })},
        NOW()
      )
    `);

    res.json({
      success: true,
      message: `Bulk ${action} completed successfully`,
      affectedCount: bannerIds.length
    });

  } catch (error: any) {
    console.error('Bulk banner action error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to perform bulk action'
    });
  }
};

// Update banner positions
export const updateBannerPositions = async (req: Request, res: Response) => {
  try {
    const user = await requireAuth(req);
    await requireRole(user, ['admin', 'manager']);

    const { bannerPositions } = req.body;

    if (!Array.isArray(bannerPositions) || bannerPositions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid banner positions data'
      });
    }

    // Validate position data
    for (const item of bannerPositions) {
      if (!item.id || typeof item.position !== 'number') {
        return res.status(400).json({
          success: false,
          message: 'Each position item must have id and position'
        });
      }
    }

    // Update positions in a transaction-like manner
    for (const item of bannerPositions) {
      await db.execute(sql`
        UPDATE banners 
        SET position = ${item.position}, updated_by = ${user.id}, updated_at = NOW()
        WHERE id = ${item.id}
      `);
    }

    // Log admin action
    await db.execute(sql`
      INSERT INTO admin_logs (admin_id, action, description, metadata, created_at)
      VALUES (
        ${user.id}, 
        'UPDATE_BANNER_POSITIONS', 
        'Updated banner positions',
        ${JSON.stringify({ bannerPositions })},
        NOW()
      )
    `);

    res.json({
      success: true,
      message: 'Banner positions updated successfully'
    });

  } catch (error: any) {
    console.error('Update banner positions error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update banner positions'
    });
  }
};

// Track banner interaction (impression, click)
export const trackBannerInteraction = async (req: Request, res: Response) => {
  try {
    const { bannerId, action, sessionId, userAgent, deviceType } = req.body;

    if (!bannerId || !action || !['impression', 'click', 'close'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid tracking data'
      });
    }

    const user = req.session?.userId ? await db.execute(sql`
      SELECT id FROM users WHERE id = ${req.session.userId}
    `) : null;

    const userId = user && user.rows.length > 0 ? user.rows[0].id : null;
    const ipAddress = req.ip || req.connection.remoteAddress;

    // Record the interaction
    await db.execute(sql`
      INSERT INTO banner_stats (
        banner_id, user_id, session_id, action, user_agent, 
        ip_address, device_type, created_at
      ) VALUES (
        ${bannerId}, ${userId}, ${sessionId}, ${action}, 
        ${userAgent}, ${ipAddress}, ${deviceType}, NOW()
      )
    `);

    // Update banner counters
    if (action === 'impression') {
      await db.execute(sql`
        UPDATE banners SET impressions = impressions + 1 WHERE id = ${bannerId}
      `);
    } else if (action === 'click') {
      await db.execute(sql`
        UPDATE banners SET clicks = clicks + 1 WHERE id = ${bannerId}
      `);
    }

    res.json({
      success: true,
      message: 'Interaction tracked successfully'
    });

  } catch (error: any) {
    console.error('Track banner interaction error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to track interaction'
    });
  }
};

// Get banner analytics
export const getBannerAnalytics = async (req: Request, res: Response) => {
  try {
    const user = await requireAuth(req);
    await requireRole(user, ['admin', 'manager']);

    const bannerId = req.query.bannerId ? parseInt(req.query.bannerId as string) : null;
    const days = parseInt(req.query.days as string) || 30;
    const type = req.query.type as string || 'all';

    let bannerFilter = '';
    const params: any[] = [days];

    if (bannerId) {
      bannerFilter = 'AND bs.banner_id = $2';
      params.push(bannerId);
    }

    if (type !== 'all') {
      bannerFilter += ` AND b.type = $${params.length + 1}`;
      params.push(type);
    }

    // Get daily analytics
    const dailyAnalytics = await db.execute(sql.raw(`
      SELECT 
        DATE_TRUNC('day', bs.created_at) as date,
        COUNT(CASE WHEN bs.action = 'impression' THEN 1 END) as impressions,
        COUNT(CASE WHEN bs.action = 'click' THEN 1 END) as clicks,
        CASE 
          WHEN COUNT(CASE WHEN bs.action = 'impression' THEN 1 END) > 0 
          THEN ROUND((COUNT(CASE WHEN bs.action = 'click' THEN 1 END)::decimal / COUNT(CASE WHEN bs.action = 'impression' THEN 1 END) * 100)::numeric, 2)
          ELSE 0 
        END as ctr
      FROM banner_stats bs
      JOIN banners b ON bs.banner_id = b.id
      WHERE bs.created_at >= NOW() - INTERVAL '${days} days' ${bannerFilter}
      GROUP BY DATE_TRUNC('day', bs.created_at)
      ORDER BY date DESC
    `));

    // Get banner performance
    const bannerPerformance = await db.execute(sql.raw(`
      SELECT 
        b.id,
        b.title,
        b.type,
        b.impressions,
        b.clicks,
        CASE 
          WHEN b.impressions > 0 THEN ROUND((b.clicks::decimal / b.impressions * 100)::numeric, 2)
          ELSE 0 
        END as ctr,
        COUNT(CASE WHEN bs.action = 'impression' AND bs.created_at >= NOW() - INTERVAL '${days} days' THEN 1 END) as recent_impressions,
        COUNT(CASE WHEN bs.action = 'click' AND bs.created_at >= NOW() - INTERVAL '${days} days' THEN 1 END) as recent_clicks
      FROM banners b
      LEFT JOIN banner_stats bs ON b.id = bs.banner_id
      WHERE b.is_active = true ${bannerId ? `AND b.id = $${params.indexOf(bannerId) + 1}` : ''}
      GROUP BY b.id, b.title, b.type, b.impressions, b.clicks
      ORDER BY b.impressions DESC
      LIMIT 10
    `));

    // Get device analytics
    const deviceAnalytics = await db.execute(sql.raw(`
      SELECT 
        COALESCE(bs.device_type, 'unknown') as device_type,
        COUNT(CASE WHEN bs.action = 'impression' THEN 1 END) as impressions,
        COUNT(CASE WHEN bs.action = 'click' THEN 1 END) as clicks
      FROM banner_stats bs
      JOIN banners b ON bs.banner_id = b.id
      WHERE bs.created_at >= NOW() - INTERVAL '${days} days' ${bannerFilter}
      GROUP BY bs.device_type
      ORDER BY impressions DESC
    `));

    res.json({
      success: true,
      analytics: {
        dailyAnalytics,
        bannerPerformance,
        deviceAnalytics,
        period: {
          days,
          createdAt: new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString()
        }
      }
    });

  } catch (error: any) {
    console.error('Get banner analytics error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch analytics'
    });
  }
};