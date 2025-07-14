import { Router } from 'express';
import { db } from '../db';
import { securityEvents, ipBlocks, loginAttempts, legacySecuritySettings, users } from '@shared/schema';
import { eq, desc, and, gte, sql } from 'drizzle-orm';
import { z } from 'zod';

const router = Router();

// Güvenlik olaylarını getir
router.get('/events', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = (page - 1) * limit;

    const events = await db
      .select()
      .from(securityEvents)
      .orderBy(desc(securityEvents.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      success: true,
      events,
      page,
      limit
    });
  } catch (error) {
    console.error('Güvenlik olayları getirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Güvenlik olayları getirilemedi'
    });
  }
});

// Yeni güvenlik olayı oluştur
router.post('/events', async (req, res) => {
  try {
    const eventSchema = z.object({
      type: z.enum(['login_attempt', 'failed_login', 'suspicious_activity', 'ip_blocked', 'account_locked', 'password_changed']),
      severity: z.enum(['low', 'medium', 'high', 'critical']),
      description: z.string(),
      ipAddress: z.string(),
      userAgent: z.string().optional(),
      userId: z.number().optional(),
      username: z.string().optional(),
      location: z.string().optional(),
      metadata: z.any().optional()
    });

    const validatedData = eventSchema.parse(req.body);

    const [newEvent] = await db.insert(securityEvents)
      .values(validatedData)
      .returning();

    res.json({
      success: true,
      event: newEvent
    });
  } catch (error) {
    console.error('Güvenlik olayı oluşturma hatası:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Geçersiz veri formatı',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Güvenlik olayı oluşturulamadı'
      });
    }
  }
});

// IP bloklarını getir
router.get('/ip-blocks', async (req, res) => {
  try {
    const blocks = await db
      .select()
      .from(ipBlocks)
      .orderBy(desc(ipBlocks.createdAt));

    res.json({
      success: true,
      blocks
    });
  } catch (error) {
    console.error('IP blokları getirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'IP blokları getirilemedi'
    });
  }
});

// IP bloğu oluştur
router.post('/ip-blocks', async (req, res) => {
  try {
    const blockSchema = z.object({
      ipAddress: z.string(),
      reason: z.string(),
      expiresAt: z.string().optional()
    });

    const validatedData = blockSchema.parse(req.body);

    const [newBlock] = await db.insert(ipBlocks)
      .values({
        ...validatedData,
        blockedBy: 'admin', // Gerçek uygulamada session'dan alınmalı
        expiresAt: validatedData.expiresAt ? new Date(validatedData.expiresAt) : undefined
      })
      .returning();

    // Güvenlik olayı oluştur
    await db.insert(securityEvents)
      .values({
        type: 'ip_blocked',
        severity: 'high',
        description: `IP adresi bloklandı: ${validatedData.ipAddress}`,
        ipAddress: validatedData.ipAddress,
        userAgent: req.headers['user-agent'] || '',
        metadata: { reason: validatedData.reason }
      });

    res.json({
      success: true,
      block: newBlock
    });
  } catch (error) {
    console.error('IP blok oluşturma hatası:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Geçersiz veri formatı',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'IP bloğu oluşturulamadı'
      });
    }
  }
});

// IP bloğunu kaldır
router.delete('/ip-blocks/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [deletedBlock] = await db.delete(ipBlocks)
      .where(eq(ipBlocks.id, id))
      .returning();

    if (!deletedBlock) {
      return res.status(404).json({
        success: false,
        error: 'IP bloğu bulunamadı'
      });
    }

    // Güvenlik olayı oluştur
    await db.insert(securityEvents)
      .values({
        type: 'ip_blocked',
        severity: 'medium',
        description: `IP bloğu kaldırıldı: ${deletedBlock.ipAddress}`,
        ipAddress: deletedBlock.ipAddress,
        userAgent: req.headers['user-agent'] || '',
        metadata: { action: 'unblock' }
      });

    res.json({
      success: true,
      message: 'IP bloğu başarıyla kaldırıldı'
    });
  } catch (error) {
    console.error('IP blok kaldırma hatası:', error);
    res.status(500).json({
      success: false,
      error: 'IP bloğu kaldırılamadı'
    });
  }
});

// Giriş denemelerini getir
router.get('/login-attempts', async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = (page - 1) * limit;

    const attempts = await db
      .select()
      .from(loginAttempts)
      .orderBy(desc(loginAttempts.createdAt))
      .limit(limit)
      .offset(offset);

    res.json({
      success: true,
      attempts,
      page,
      limit
    });
  } catch (error) {
    console.error('Giriş denemeleri getirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Giriş denemeleri getirilemedi'
    });
  }
});

// Giriş denemesi kaydet
router.post('/login-attempts', async (req, res) => {
  try {
    const attemptSchema = z.object({
      username: z.string(),
      ipAddress: z.string(),
      success: z.boolean(),
      userAgent: z.string().optional(),
      location: z.string().optional(),
      failureReason: z.string().optional()
    });

    const validatedData = attemptSchema.parse(req.body);

    const [newAttempt] = await db.insert(loginAttempts)
      .values(validatedData)
      .returning();

    res.json({
      success: true,
      attempt: newAttempt
    });
  } catch (error) {
    console.error('Giriş denemesi kaydetme hatası:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Geçersiz veri formatı',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Giriş denemesi kaydedilemedi'
      });
    }
  }
});

// Güvenlik ayarlarını getir
router.get('/settings', async (req, res) => {
  try {
    const [settings] = await db
      .select()
      .from(legacySecuritySettings)
      .limit(1);

    // Varsayılan ayarlar
    const defaultSettings = {
      maxLoginAttempts: 5,
      lockoutDuration: 30,
      passwordMinLength: 8,
      requireTwoFactor: false,
      allowVPN: false,
      sessionTimeout: 120,
      ipWhitelistEnabled: false,
      geoBlocking: false
    };

    res.json({
      success: true,
      settings: settings || defaultSettings
    });
  } catch (error) {
    console.error('Güvenlik ayarları getirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Güvenlik ayarları getirilemedi'
    });
  }
});

// Güvenlik ayarlarını güncelle
router.put('/settings', async (req, res) => {
  try {
    const settingsSchema = z.object({
      maxLoginAttempts: z.number().min(1).max(20).optional(),
      lockoutDuration: z.number().min(1).max(1440).optional(), // Max 24 saat
      passwordMinLength: z.number().min(6).max(50).optional(),
      requireTwoFactor: z.boolean().optional(),
      allowVPN: z.boolean().optional(),
      sessionTimeout: z.number().min(5).max(1440).optional(), // 5 dakika - 24 saat
      ipWhitelistEnabled: z.boolean().optional(),
      geoBlocking: z.boolean().optional()
    });

    const validatedData = settingsSchema.parse(req.body);

    // Mevcut ayar var mı kontrol et
    const [existingSettings] = await db
      .select()
      .from(legacySecuritySettings)
      .limit(1);

    let updatedSettings;

    if (existingSettings) {
      [updatedSettings] = await db.update(legacySecuritySettings)
        .set({
          ...validatedData,
          updatedAt: new Date(),
          updatedBy: 'admin' // Gerçek uygulamada session'dan alınmalı
        })
        .where(eq(legacySecuritySettings.id, existingSettings.id))
        .returning();
    } else {
      [updatedSettings] = await db.insert(legacySecuritySettings)
        .values({
          ...validatedData,
          updatedBy: 'admin'
        })
        .returning();
    }

    // Güvenlik olayı oluştur
    await db.insert(securityEvents)
      .values({
        type: 'password_changed',
        severity: 'medium',
        description: 'Güvenlik ayarları güncellendi',
        ipAddress: req.ip || 'unknown',
        userAgent: req.headers['user-agent'] || '',
        metadata: { changes: validatedData }
      });

    res.json({
      success: true,
      settings: updatedSettings
    });
  } catch (error) {
    console.error('Güvenlik ayarları güncelleme hatası:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: 'Geçersiz veri formatı',
        details: error.errors
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Güvenlik ayarları güncellenemedi'
      });
    }
  }
});

// Güvenlik istatistikleri
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Son 24 saat güvenlik olayları
    const dailyEvents = await db
      .select({
        count: sql<number>`count(*)`
      })
      .from(securityEvents)
      .where(gte(securityEvents.createdAt, oneDayAgo));

    // Kritik olaylar
    const criticalEvents = await db
      .select({
        count: sql<number>`count(*)`
      })
      .from(securityEvents)
      .where(
        and(
          eq(securityEvents.severity, 'critical'),
          gte(securityEvents.createdAt, oneDayAgo)
        )
      );

    // Aktif IP blokları
    const activeBlocks = await db
      .select({
        count: sql<number>`count(*)`
      })
      .from(ipBlocks)
      .where(eq(ipBlocks.isActive, true));

    // Son 24 saat başarısız giriş denemeleri
    const failedLogins = await db
      .select({
        count: sql<number>`count(*)`
      })
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.success, false),
          gte(loginAttempts.createdAt, oneDayAgo)
        )
      );

    // Haftalık trend
    const weeklyTrend = await db
      .select({
        count: sql<number>`count(*)`
      })
      .from(securityEvents)
      .where(gte(securityEvents.createdAt, oneWeekAgo));

    res.json({
      success: true,
      stats: {
        dailyEvents: dailyEvents[0]?.count || 0,
        criticalEvents: criticalEvents[0]?.count || 0,
        activeBlocks: activeBlocks[0]?.count || 0,
        failedLogins: failedLogins[0]?.count || 0,
        weeklyTrend: weeklyTrend[0]?.count || 0,
        securityScore: Math.max(0, 100 - (criticalEvents[0]?.count || 0) * 10 - (failedLogins[0]?.count || 0))
      }
    });
  } catch (error) {
    console.error('Güvenlik istatistikleri hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Güvenlik istatistikleri getirilemedi'
    });
  }
});

export default router;