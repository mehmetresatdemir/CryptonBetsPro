import { Router, Request, Response } from 'express';
import { db } from '../db';
import { securitySettings, systemLogs } from '@shared/schema';
import { eq, desc, and, like } from 'drizzle-orm';
import { requireAdminAuth } from '../utils/auth';
import { z } from 'zod';

const router = Router();

// Güvenlik ayarı oluşturma/güncelleme şeması
const securitySettingSchema = z.object({
  settingKey: z.string().min(1).max(100),
  settingValue: z.string().min(1),
  description: z.string().optional(),
  category: z.string().min(1).max(50),
  isActive: z.boolean().default(true)
});

// Tüm güvenlik ayarlarını listeleme
router.get('/', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string;
    const search = req.query.search as string;
    const isActive = req.query.isActive as string;

    let whereConditions = [];

    if (category) {
      whereConditions.push(eq(securitySettings.category, category));
    }

    if (search) {
      whereConditions.push(
        like(securitySettings.settingKey, `%${search}%`)
      );
    }

    if (isActive !== undefined) {
      whereConditions.push(eq(securitySettings.isActive, isActive === 'true'));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const settings = await db.select()
      .from(securitySettings)
      .where(whereClause)
      .orderBy(desc(securitySettings.createdAt));

    // Log this access
    await db.insert(systemLogs).values({
      level: 'info',
      category: 'security',
      message: 'Security settings accessed',
      source: 'admin-security-api',
      adminUserId: 1,
      ipAddress: req.ip,
      metadata: JSON.stringify({ category, search, isActive })
    });

    res.json(settings);

  } catch (error) {
    console.error('Security settings list error:', error);
    res.status(500).json({ error: 'Güvenlik ayarları listelenemedi' });
  }
});

// Tek güvenlik ayarı detayı
router.get('/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const settingId = parseInt(req.params.id);

    const setting = await db.select()
      .from(securitySettings)
      .where(eq(securitySettings.id, settingId))
      .limit(1);

    if (setting.length === 0) {
      return res.status(404).json({ error: 'Güvenlik ayarı bulunamadı' });
    }

    res.json(setting[0]);

  } catch (error) {
    console.error('Security setting detail error:', error);
    res.status(500).json({ error: 'Güvenlik ayarı detayı alınamadı' });
  }
});

// Yeni güvenlik ayarı oluşturma
router.post('/', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const validatedData = securitySettingSchema.parse(req.body);
    
    // Aynı anahtar kontrolü
    const existingSetting = await db.select()
      .from(securitySettings)
      .where(eq(securitySettings.settingKey, validatedData.settingKey))
      .limit(1);

    if (existingSetting.length > 0) {
      return res.status(400).json({ 
        error: 'Bu ayar anahtarı zaten mevcut' 
      });
    }

    // Yeni güvenlik ayarı oluştur
    const newSetting = await db.insert(securitySettings).values({
      settingKey: validatedData.settingKey,
      settingValue: validatedData.settingValue,
      description: validatedData.description,
      category: validatedData.category,
      isActive: validatedData.isActive,
      updatedBy: 1
    }).returning();

    // Log this action
    await db.insert(systemLogs).values({
      level: 'info',
      category: 'security',
      message: `New security setting created: ${validatedData.settingKey}`,
      source: 'admin-security-api',
      adminUserId: 1,
      ipAddress: req.ip,
      metadata: JSON.stringify({ 
        newSettingId: newSetting[0].id,
        category: validatedData.category 
      })
    });

    res.status(201).json(newSetting[0]);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Geçersiz veri',
        details: error.errors 
      });
    }
    
    console.error('Create security setting error:', error);
    res.status(500).json({ error: 'Güvenlik ayarı oluşturulamadı' });
  }
});

// Güvenlik ayarı güncelleme
router.put('/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const settingId = parseInt(req.params.id);
    const validatedData = securitySettingSchema.parse(req.body);

    // Mevcut ayar kontrolü
    const existingSetting = await db.select()
      .from(securitySettings)
      .where(eq(securitySettings.id, settingId))
      .limit(1);

    if (existingSetting.length === 0) {
      return res.status(404).json({ error: 'Güvenlik ayarı bulunamadı' });
    }

    // Güvenlik ayarını güncelle
    const updatedSetting = await db.update(securitySettings)
      .set({
        settingValue: validatedData.settingValue,
        description: validatedData.description,
        category: validatedData.category,
        isActive: validatedData.isActive,
        updatedBy: 1,
        updatedAt: new Date()
      })
      .where(eq(securitySettings.id, settingId))
      .returning();

    // Log this action
    await db.insert(systemLogs).values({
      level: 'info',
      category: 'security',
      message: `Security setting updated: ${existingSetting[0].settingKey}`,
      source: 'admin-security-api',
      adminUserId: 1,
      ipAddress: req.ip,
      metadata: JSON.stringify({ 
        updatedSettingId: settingId,
        changes: validatedData 
      })
    });

    res.json(updatedSetting[0]);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Geçersiz veri',
        details: error.errors 
      });
    }
    
    console.error('Update security setting error:', error);
    res.status(500).json({ error: 'Güvenlik ayarı güncellenemedi' });
  }
});

// Güvenlik ayarı silme
router.delete('/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const settingId = parseInt(req.params.id);

    // Mevcut ayar kontrolü
    const existingSetting = await db.select()
      .from(securitySettings)
      .where(eq(securitySettings.id, settingId))
      .limit(1);

    if (existingSetting.length === 0) {
      return res.status(404).json({ error: 'Güvenlik ayarı bulunamadı' });
    }

    // Güvenlik ayarını sil
    await db.delete(securitySettings)
      .where(eq(securitySettings.id, settingId));

    // Log this action
    await db.insert(systemLogs).values({
      level: 'warning',
      category: 'security',
      message: `Security setting deleted: ${existingSetting[0].settingKey}`,
      source: 'admin-security-api',
      adminUserId: 1,
      ipAddress: req.ip,
      metadata: JSON.stringify({ 
        deletedSettingId: settingId,
        deletedSettingKey: existingSetting[0].settingKey
      })
    });

    res.json({ message: 'Güvenlik ayarı başarıyla silindi' });

  } catch (error) {
    console.error('Delete security setting error:', error);
    res.status(500).json({ error: 'Güvenlik ayarı silinemedi' });
  }
});

// Kategori listesi
router.get('/categories/list', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const categories = await db.selectDistinct({ 
      category: securitySettings.category 
    }).from(securitySettings);

    res.json(categories.map(c => c.category));

  } catch (error) {
    console.error('Categories list error:', error);
    res.status(500).json({ error: 'Kategori listesi alınamadı' });
  }
});

// Güvenlik durumu özeti
router.get('/status/summary', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const totalSettings = await db.select().from(securitySettings);
    const activeSettings = await db.select().from(securitySettings).where(eq(securitySettings.isActive, true));
    
    const categoryStats = await db.select({
      category: securitySettings.category
    })
    .from(securitySettings)
    .groupBy(securitySettings.category);

    const summary = {
      totalSettings: totalSettings.length,
      activeSettings: activeSettings.length,
      inactiveSettings: totalSettings.length - activeSettings.length,
      categories: categoryStats
    };

    res.json(summary);

  } catch (error) {
    console.error('Security status summary error:', error);
    res.status(500).json({ error: 'Güvenlik durumu özeti alınamadı' });
  }
});

export default router;