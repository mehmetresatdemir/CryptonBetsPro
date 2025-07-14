import { Router, Request, Response } from 'express';
import { db } from '../db';
import { systemLogs, users, adminUsers } from '@shared/schema';
import { eq, desc, and, like, gte, lte, or } from 'drizzle-orm';
import { requireAdminAuth } from '../utils/auth';
import { z } from 'zod';

const router = Router();

// Log filtreleme şeması
const logFilterSchema = z.object({
  level: z.enum(['info', 'warning', 'error', 'critical', 'debug']).optional(),
  category: z.enum(['system', 'security', 'admin', 'user', 'transaction', 'api', 'database']).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(50)
});

// Tüm sistem loglarını listeleme
router.get('/', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const {
      level,
      category,
      startDate,
      endDate,
      search,
      page,
      limit
    } = logFilterSchema.parse({
      ...req.query,
      page: parseInt(req.query.page as string) || 1,
      limit: parseInt(req.query.limit as string) || 50
    });

    const offset = (page - 1) * limit;
    let whereConditions = [];

    if (level) {
      whereConditions.push(eq(systemLogs.level, level));
    }

    if (category) {
      whereConditions.push(eq(systemLogs.category, category));
    }

    if (startDate) {
      whereConditions.push(gte(systemLogs.createdAt, new Date(startDate)));
    }

    if (endDate) {
      whereConditions.push(lte(systemLogs.createdAt, new Date(endDate)));
    }

    if (search) {
      whereConditions.push(
        or(
          like(systemLogs.message, `%${search}%`),
          like(systemLogs.source, `%${search}%`),
          like(systemLogs.ipAddress, `%${search}%`)
        )
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [logs, totalCount] = await Promise.all([
      db.select({
        id: systemLogs.id,
        level: systemLogs.level,
        category: systemLogs.category,
        message: systemLogs.message,
        details: systemLogs.details,
        source: systemLogs.source,
        userId: systemLogs.userId,
        adminUserId: systemLogs.adminUserId,
        ipAddress: systemLogs.ipAddress,
        userAgent: systemLogs.userAgent,
        metadata: systemLogs.metadata,
        createdAt: systemLogs.createdAt
      })
      .from(systemLogs)
      .where(whereClause)
      .orderBy(desc(systemLogs.createdAt))
      .limit(limit)
      .offset(offset),

      db.select({ count: systemLogs.id })
        .from(systemLogs)
        .where(whereClause)
        .then(result => result.length)
    ]);

    res.json({
      logs,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      },
      filters: {
        level,
        category,
        startDate,
        endDate,
        search
      }
    });

  } catch (error) {
    console.error('System logs list error:', error);
    res.status(500).json({ error: 'Sistem logları listelenemedi' });
  }
});

// Tek log detayı
router.get('/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const logId = parseInt(req.params.id);

    const log = await db.select()
      .from(systemLogs)
      .where(eq(systemLogs.id, logId))
      .limit(1);

    if (log.length === 0) {
      return res.status(404).json({ error: 'Log kaydı bulunamadı' });
    }

    res.json(log[0]);

  } catch (error) {
    console.error('Log detail error:', error);
    res.status(500).json({ error: 'Log detayı alınamadı' });
  }
});

// Log istatistikleri
router.get('/stats/summary', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const totalLogs = await db.select().from(systemLogs);

    // Son 24 saat içindeki loglar
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentLogs = await db.select().from(systemLogs).where(gte(systemLogs.createdAt, last24Hours));

    // Seviye bazında istatistikler
    const levelStats = await db.select({
      level: systemLogs.level
    })
    .from(systemLogs)
    .groupBy(systemLogs.level);

    // Kategori bazında istatistikler
    const categoryStats = await db.select({
      category: systemLogs.category
    })
    .from(systemLogs)
    .groupBy(systemLogs.category);

    // Kritik ve hata logları
    const criticalLogs = await db.select().from(systemLogs).where(
      or(
        eq(systemLogs.level, 'critical'),
        eq(systemLogs.level, 'error')
      )
    );

    const summary = {
      totalLogs: totalLogs.length,
      recentLogs: recentLogs.length,
      criticalLogs: criticalLogs.length,
      levelDistribution: levelStats,
      categoryDistribution: categoryStats
    };

    res.json(summary);

  } catch (error) {
    console.error('Log stats error:', error);
    res.status(500).json({ error: 'Log istatistikleri alınamadı' });
  }
});

// Log temizleme (eski logları sil)
router.delete('/cleanup', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { days } = req.body;
    
    if (!days || days < 1) {
      return res.status(400).json({ 
        error: 'Geçerli bir gün sayısı belirtmelisiniz (minimum 1)' 
      });
    }

    const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    
    // Eski logları say
    const oldLogs = await db.select().from(systemLogs).where(lte(systemLogs.createdAt, cutoffDate));

    // Eski logları sil
    await db.delete(systemLogs)
      .where(lte(systemLogs.createdAt, cutoffDate));

    // Bu işlemi logla
    await db.insert(systemLogs).values({
      level: 'info',
      category: 'admin',
      message: `System logs cleanup performed - ${oldLogs.length} logs deleted`,
      source: 'admin-logs-api',
      adminUserId: 1,
      ipAddress: req.ip,
      metadata: JSON.stringify({ 
        days,
        deletedCount: oldLogs.length,
        cutoffDate 
      })
    });

    res.json({ 
      message: 'Log temizleme başarıyla tamamlandı',
      deletedCount: oldLogs.length
    });

  } catch (error) {
    console.error('Log cleanup error:', error);
    res.status(500).json({ error: 'Log temizleme işlemi başarısız' });
  }
});

// Log dışa aktarma (CSV formatında)
router.get('/export/csv', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const {
      level,
      category,
      startDate,
      endDate,
      search
    } = logFilterSchema.parse({
      ...req.query,
      page: 1,
      limit: 10000 // Maksimum export limiti
    });

    let whereConditions = [];

    if (level) {
      whereConditions.push(eq(systemLogs.level, level));
    }

    if (category) {
      whereConditions.push(eq(systemLogs.category, category));
    }

    if (startDate) {
      whereConditions.push(gte(systemLogs.createdAt, new Date(startDate)));
    }

    if (endDate) {
      whereConditions.push(lte(systemLogs.createdAt, new Date(endDate)));
    }

    if (search) {
      whereConditions.push(
        or(
          like(systemLogs.message, `%${search}%`),
          like(systemLogs.source, `%${search}%`)
        )
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const logs = await db.select()
      .from(systemLogs)
      .where(whereClause)
      .orderBy(desc(systemLogs.createdAt))
      .limit(10000);

    // CSV başlıkları
    let csv = 'ID,Seviye,Kategori,Mesaj,Kaynak,IP Adresi,Tarih\n';
    
    // CSV verilerini oluştur
    logs.forEach(log => {
      csv += `${log.id},"${log.level}","${log.category}","${log.message?.replace(/"/g, '""')}","${log.source}","${log.ipAddress || ''}","${log.createdAt}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="system-logs-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);

  } catch (error) {
    console.error('Log export error:', error);
    res.status(500).json({ error: 'Log dışa aktarma başarısız' });
  }
});

export default router;