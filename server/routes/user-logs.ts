import { Router } from 'express';
import { eq, desc, and, gte, lte, like, sql, count } from 'drizzle-orm';
import { db } from '../db';
import { userLogs, users } from '../../shared/schema';
import { authMiddleware } from '../utils/auth';

const router = Router();

// Kullanıcı log'u kaydetme yardımcı fonksiyonu
export const logUserActivity = async (
  userId: number,
  action: string,
  category: 'auth' | 'transaction' | 'game' | 'profile' | 'security' | 'deposit' | 'withdrawal',
  description: string,
  ipAddress: string,
  userAgent?: string,
  metadata?: Record<string, any>,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low',
  status: 'success' | 'failure' | 'pending' | 'warning' = 'success',
  sessionId?: string
) => {
  try {
    await db.insert(userLogs).values({
      userId,
      action,
      category,
      description,
      ipAddress,
      userAgent,
      metadata,
      severity,
      status,
      sessionId
    });
    console.log(`📋 USER LOG: ${action} - User: ${userId}, Category: ${category}, Status: ${status}`);
  } catch (error) {
    console.error('❌ LOG ERROR: Failed to log user activity:', error);
  }
};

// Kullanıcı loglarını getir (Admin Only)
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '50',
      search = '',
      category = '',
      severity = '',
      status = '',
      dateFrom = '',
      dateTo = '',
      userId = ''
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    console.log(`🔍 USER LOGS API: Fetching logs with filters - Page: ${pageNum}, Limit: ${limitNum}`);

    // Filtre koşulları oluştur
    const conditions = [];

    if (search) {
      conditions.push(
        sql`(
          ${userLogs.action} ILIKE ${`%${search}%`} OR
          ${userLogs.description} ILIKE ${`%${search}%`} OR
          ${users.username} ILIKE ${`%${search}%`} OR
          ${users.email} ILIKE ${`%${search}%`}
        )`
      );
    }

    if (category && category !== 'all') {
      conditions.push(eq(userLogs.category, category as string));
    }

    if (severity && severity !== 'all') {
      conditions.push(eq(userLogs.severity, severity as string));
    }

    if (status && status !== 'all') {
      conditions.push(eq(userLogs.status, status as string));
    }

    if (userId) {
      conditions.push(eq(userLogs.userId, parseInt(userId as string)));
    }

    if (dateFrom) {
      conditions.push(gte(userLogs.createdAt, new Date(dateFrom as string)));
    }

    if (dateTo) {
      const endDate = new Date(dateTo as string);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(userLogs.createdAt, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Toplam kayıt sayısını getir
    const [totalResult] = await db
      .select({ count: count() })
      .from(userLogs)
      .leftJoin(users, eq(userLogs.userId, users.id))
      .where(whereClause);

    const total = totalResult?.count || 0;

    // Logları getir
    const logs = await db
      .select({
        id: userLogs.id,
        userId: userLogs.userId,
        username: users.username,
        email: users.email,
        action: userLogs.action,
        category: userLogs.category,
        description: userLogs.description,
        ipAddress: userLogs.ipAddress,
        userAgent: userLogs.userAgent,
        metadata: userLogs.metadata,
        severity: userLogs.severity,
        status: userLogs.status,
        sessionId: userLogs.sessionId,
        timestamp: userLogs.createdAt
      })
      .from(userLogs)
      .leftJoin(users, eq(userLogs.userId, users.id))
      .where(whereClause)
      .orderBy(desc(userLogs.createdAt))
      .limit(limitNum)
      .offset(offset);

    console.log(`📊 USER LOGS DATA COLLECTED: ${logs.length} logs found out of ${total} total`);

    res.json({
      logs,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });

  } catch (error) {
    console.error('❌ USER LOGS API ERROR:', error);
    res.status(500).json({ 
      error: 'Kullanıcı logları alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Logları dışa aktar (Admin Only)
router.get('/export', async (req, res) => {
  try {
    const {
      format = 'csv',
      search = '',
      category = '',
      severity = '',
      status = '',
      dateFrom = '',
      dateTo = '',
      userId = ''
    } = req.query;

    console.log(`📤 USER LOGS EXPORT: Format: ${format}`);

    // Filtre koşulları oluştur (aynı logic)
    const conditions = [];

    if (search) {
      conditions.push(
        sql`(
          ${userLogs.action} ILIKE ${`%${search}%`} OR
          ${userLogs.description} ILIKE ${`%${search}%`} OR
          ${users.username} ILIKE ${`%${search}%`} OR
          ${users.email} ILIKE ${`%${search}%`}
        )`
      );
    }

    if (category && category !== 'all') {
      conditions.push(eq(userLogs.category, category as string));
    }

    if (severity && severity !== 'all') {
      conditions.push(eq(userLogs.severity, severity as string));
    }

    if (status && status !== 'all') {
      conditions.push(eq(userLogs.status, status as string));
    }

    if (userId) {
      conditions.push(eq(userLogs.userId, parseInt(userId as string)));
    }

    if (dateFrom) {
      conditions.push(gte(userLogs.createdAt, new Date(dateFrom as string)));
    }

    if (dateTo) {
      const endDate = new Date(dateTo as string);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(userLogs.createdAt, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Tüm logları getir (limit yok)
    const logs = await db
      .select({
        id: userLogs.id,
        userId: userLogs.userId,
        username: users.username,
        email: users.email,
        action: userLogs.action,
        category: userLogs.category,
        description: userLogs.description,
        ipAddress: userLogs.ipAddress,
        userAgent: userLogs.userAgent,
        metadata: userLogs.metadata,
        severity: userLogs.severity,
        status: userLogs.status,
        sessionId: userLogs.sessionId,
        timestamp: userLogs.createdAt
      })
      .from(userLogs)
      .leftJoin(users, eq(userLogs.userId, users.id))
      .where(whereClause)
      .orderBy(desc(userLogs.createdAt));

    if (format === 'csv') {
      // CSV formatında dışa aktar
      const csvHeaders = [
        'ID', 'Kullanıcı ID', 'Kullanıcı Adı', 'E-posta', 'Aksiyon', 'Kategori',
        'Açıklama', 'IP Adresi', 'User Agent', 'Önem', 'Durum', 'Oturum ID', 'Tarih'
      ];
      
      const csvRows = logs.map(log => [
        log.id,
        log.userId,
        log.username || '',
        log.email || '',
        log.action,
        log.category,
        `"${log.description.replace(/"/g, '""')}"`,
        log.ipAddress,
        `"${(log.userAgent || '').replace(/"/g, '""')}"`,
        log.severity,
        log.status,
        log.sessionId || '',
        log.timestamp?.toISOString() || ''
      ]);

      const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="user-logs-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\uFEFF' + csvContent); // UTF-8 BOM for Turkish characters
    } else {
      // JSON formatında dışa aktar
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="user-logs-${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        exportDate: new Date().toISOString(),
        totalRecords: logs.length,
        logs: logs
      });
    }

    console.log(`✅ USER LOGS EXPORT: Successfully exported ${logs.length} logs as ${format}`);

  } catch (error) {
    console.error('❌ USER LOGS EXPORT ERROR:', error);
    res.status(500).json({ 
      error: 'Log dışa aktarma işlemi başarısız',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Belirli bir kullanıcının loglarını getir (Admin Only)
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = '100' } = req.query;

    console.log(`🔍 USER SPECIFIC LOGS: Fetching logs for user ${userId}`);

    const logs = await db
      .select({
        id: userLogs.id,
        action: userLogs.action,
        category: userLogs.category,
        description: userLogs.description,
        ipAddress: userLogs.ipAddress,
        severity: userLogs.severity,
        status: userLogs.status,
        timestamp: userLogs.createdAt
      })
      .from(userLogs)
      .where(eq(userLogs.userId, parseInt(userId)))
      .orderBy(desc(userLogs.createdAt))
      .limit(parseInt(limit as string));

    res.json({
      userId: parseInt(userId),
      logs,
      count: logs.length
    });

  } catch (error) {
    console.error('❌ USER SPECIFIC LOGS ERROR:', error);
    res.status(500).json({ 
      error: 'Kullanıcı logları alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Log istatistikleri (Admin Only)
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    console.log('📊 USER LOGS STATS: Generating statistics');

    // Kategori istatistikleri
    const categoryStats = await db
      .select({
        category: userLogs.category,
        count: count()
      })
      .from(userLogs)
      .groupBy(userLogs.category)
      .orderBy(desc(count()));

    // Durum istatistikleri
    const statusStats = await db
      .select({
        status: userLogs.status,
        count: count()
      })
      .from(userLogs)
      .groupBy(userLogs.status)
      .orderBy(desc(count()));

    // Önem derecesi istatistikleri
    const severityStats = await db
      .select({
        severity: userLogs.severity,
        count: count()
      })
      .from(userLogs)
      .groupBy(userLogs.severity)
      .orderBy(desc(count()));

    // Son 24 saat aktivite
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentActivity = await db
      .select({
        count: count()
      })
      .from(userLogs)
      .where(gte(userLogs.createdAt, last24Hours));

    // Toplam log sayısı
    const [totalLogs] = await db
      .select({ count: count() })
      .from(userLogs);

    res.json({
      total: totalLogs?.count || 0,
      last24Hours: recentActivity[0]?.count || 0,
      categoryStats,
      statusStats,
      severityStats
    });

  } catch (error) {
    console.error('❌ USER LOGS STATS ERROR:', error);
    res.status(500).json({ 
      error: 'Log istatistikleri alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

export { router as userLogsRouter };
export default router;