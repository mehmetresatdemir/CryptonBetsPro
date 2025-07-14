import { Request, Response } from 'express';
import { pool } from '../db.js';

// Professional User Logs API using raw SQL - Real PostgreSQL integration
export async function getUserLogsAdmin(req: Request, res: Response) {
  try {
    const {
      page = '1',
      limit = '50',
      search = '',
      category = 'all',
      severity = 'all',
      userId = '',
      startDate = '',
      endDate = ''
    } = req.query;

    console.log('🔍 ADMIN USER LOGS: Fetching user activity logs...');

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Build WHERE conditions
    let whereConditions = [];
    let queryParams: any[] = [];
    let paramIndex = 1;

    if (search) {
      whereConditions.push(`(l.action ILIKE $${paramIndex} OR l.details ILIKE $${paramIndex + 1} OR u.username ILIKE $${paramIndex + 2})`);
      queryParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      paramIndex += 3;
    }

    if (category && category !== 'all') {
      whereConditions.push(`l.category = $${paramIndex}`);
      queryParams.push(category);
      paramIndex++;
    }

    if (severity && severity !== 'all') {
      whereConditions.push(`l.severity = $${paramIndex}`);
      queryParams.push(severity);
      paramIndex++;
    }

    if (userId) {
      whereConditions.push(`l.user_id = $${paramIndex}`);
      queryParams.push(parseInt(userId as string));
      paramIndex++;
    }

    if (startDate) {
      whereConditions.push(`l.created_at >= $${paramIndex}`);
      queryParams.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      whereConditions.push(`l.created_at <= $${paramIndex}`);
      queryParams.push(endDate);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Get total count
    const countQuery = `
      SELECT COUNT(*) as total
      FROM user_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ${whereClause}
    `;
    
    const countResult = await pool.query(countQuery, queryParams);
    const total = countResult.rows[0]?.total || 0;

    // Get logs with user data
    const logsQuery = `
      SELECT 
        l.id,
        l.user_id,
        l.action,
        l.description as details,
        l.ip_address,
        l.user_agent,
        l.session_id,
        l.created_at,
        l.category,
        l.severity,
        l.metadata,
        u.username,
        u.email,
        u.full_name
      FROM user_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ${whereClause}
      ORDER BY l.created_at DESC
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    queryParams.push(limitNum, offset);
    
    const logsResult = await pool.query(logsQuery, queryParams);

    // Format logs
    const logs = logsResult.rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      username: row.username || 'Bilinmiyor',
      email: row.email || '',
      fullName: row.full_name || '',
      action: row.action,
      details: row.details,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
      sessionId: row.session_id,
      category: row.category,
      severity: row.severity,
      metadata: row.metadata,
      createdAt: row.created_at,
      // Additional formatting
      timeAgo: getTimeAgo(row.created_at),
      browserInfo: parseBrowserInfo(row.user_agent),
      actionDisplay: getActionDisplay(row.action, row.category)
    }));

    const response = {
      logs,
      _meta: {
        totalCount: Number(total),
        pageCount: Math.ceil(Number(total) / limitNum),
        currentPage: pageNum,
        perPage: limitNum
      }
    };

    console.log(`🔍 USER LOGS COLLECTED: ${logs.length} logs loaded`);
    console.log(`   Total logs: ${total}`);

    res.json(response);

  } catch (error) {
    console.error('❌ ADMIN USER LOGS API Error:', error);
    res.status(500).json({
      error: 'Failed to fetch user logs',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get user logs statistics
export async function getUserLogsStats(req: Request, res: Response) {
  try {
    console.log('📊 USER LOGS STATS: Generating statistics...');

    // Basic stats
    const statsQuery = `
      SELECT 
        COUNT(*) as total_logs,
        COUNT(CASE WHEN severity = 'info' THEN 1 END) as info_logs,
        COUNT(CASE WHEN severity = 'warning' THEN 1 END) as warning_logs,
        COUNT(CASE WHEN severity = 'error' THEN 1 END) as error_logs,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '24 hours' THEN 1 END) as last_24h,
        COUNT(CASE WHEN created_at >= NOW() - INTERVAL '7 days' THEN 1 END) as last_7d
      FROM user_logs
    `;
    
    const statsResult = await pool.query(statsQuery);
    const stats = statsResult.rows[0];

    // Category statistics
    const categoryStatsQuery = `
      SELECT 
        category,
        COUNT(*) as count,
        COUNT(CASE WHEN severity = 'error' THEN 1 END) as errors
      FROM user_logs
      GROUP BY category
      ORDER BY count DESC
    `;
    
    const categoryStatsResult = await pool.query(categoryStatsQuery);

    // Most active users
    const activeUsersQuery = `
      SELECT 
        l.user_id,
        u.username,
        u.email,
        COUNT(*) as activity_count,
        MAX(l.created_at) as last_activity
      FROM user_logs l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.created_at >= NOW() - INTERVAL '7 days'
      GROUP BY l.user_id, u.username, u.email
      ORDER BY activity_count DESC
      LIMIT 10
    `;
    
    const activeUsersResult = await pool.query(activeUsersQuery);

    // Recent errors
    const recentErrorsQuery = `
      SELECT 
        l.action,
        l.description as details,
        l.created_at,
        u.username
      FROM user_logs l
      LEFT JOIN users u ON l.user_id = u.id
      WHERE l.severity = 'error' AND l.created_at >= NOW() - INTERVAL '24 hours'
      ORDER BY l.created_at DESC
      LIMIT 5
    `;
    
    const recentErrorsResult = await pool.query(recentErrorsQuery);

    const summary = {
      totalLogs: Number(stats.total_logs),
      infoLogs: Number(stats.info_logs),
      warningLogs: Number(stats.warning_logs),
      errorLogs: Number(stats.error_logs),
      last24Hours: Number(stats.last_24h),
      last7Days: Number(stats.last_7d),
      categoryStats: categoryStatsResult.rows.map((row: any) => ({
        category: row.category,
        count: Number(row.count),
        errors: Number(row.errors),
        errorRate: Number(row.count) > 0 ? Math.round((Number(row.errors) / Number(row.count)) * 100) : 0
      })),
      activeUsers: activeUsersResult.rows.map((row: any) => ({
        userId: row.user_id,
        username: row.username || 'Bilinmiyor',
        email: row.email || '',
        activityCount: Number(row.activity_count),
        lastActivity: row.last_activity
      })),
      recentErrors: recentErrorsResult.rows.map((row: any) => ({
        action: row.action,
        details: row.details,
        createdAt: row.created_at,
        username: row.username || 'Bilinmiyor'
      }))
    };

    console.log('📊 USER LOGS STATS COMPLETED');
    res.json(summary);

  } catch (error) {
    console.error('❌ USER LOGS STATS Error:', error);
    res.status(500).json({
      error: 'Failed to fetch user logs statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Helper functions
function getTimeAgo(date: string): string {
  const now = new Date();
  const logDate = new Date(date);
  const diffMs = now.getTime() - logDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Az önce';
  if (diffMins < 60) return `${diffMins} dk önce`;
  if (diffHours < 24) return `${diffHours} saat önce`;
  return `${diffDays} gün önce`;
}

function parseBrowserInfo(userAgent: string): string {
  if (!userAgent) return 'Bilinmiyor';
  
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  if (userAgent.includes('iPhone')) return 'iPhone';
  if (userAgent.includes('Android')) return 'Android';
  
  return 'Diğer';
}

function getActionDisplay(action: string, category: string): string {
  const actionMap: Record<string, string> = {
    'login': 'Giriş Yaptı',
    'logout': 'Çıkış Yaptı',
    'deposit': 'Para Yatırdı',
    'withdrawal': 'Para Çekti',
    'game_start': 'Oyun Başlattı',
    'game_end': 'Oyun Bitirdi',
    'kyc_upload': 'Belge Yükledi',
    'profile_update': 'Profil Güncelledi',
    'failed_login': 'Hatalı Giriş',
    'bonus_claim': 'Bonus Aldı'
  };

  return actionMap[action] || action;
}