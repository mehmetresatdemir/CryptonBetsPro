import { Router, Request, Response } from 'express';
import { db } from '../db';
import { cmsPages, systemLogs } from '@shared/schema';
import { eq, desc, and, like, or } from 'drizzle-orm';
import { requireAdminAuth } from '../utils/auth';
import { z } from 'zod';

const router = Router();

// CMS sayfa oluşturma şeması
const createPageSchema = z.object({
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(200),
  content: z.string().min(1),
  excerpt: z.string().optional(),
  template: z.string().default('default'),
  status: z.enum(['published', 'draft', 'scheduled']).default('draft'),
  language: z.string().default('tr'),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  featuredImage: z.string().optional(),
  publishedAt: z.string().optional(),
  orderIndex: z.number().default(0),
  parentId: z.number().optional(),
  showInMenu: z.boolean().default(false),
  isHomepage: z.boolean().default(false)
});

// CMS sayfa güncelleme şeması
const updatePageSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().min(1).optional(),
  excerpt: z.string().optional(),
  template: z.string().optional(),
  status: z.enum(['published', 'draft', 'scheduled']).optional(),
  language: z.string().optional(),
  metaTitle: z.string().max(200).optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  featuredImage: z.string().optional(),
  publishedAt: z.string().optional(),
  orderIndex: z.number().optional(),
  parentId: z.number().optional(),
  showInMenu: z.boolean().optional(),
  isHomepage: z.boolean().optional()
});

// Tüm CMS sayfalarını listeleme
router.get('/', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const status = req.query.status as string;
    const language = req.query.language as string;
    const template = req.query.template as string;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          like(cmsPages.title, `%${search}%`),
          like(cmsPages.slug, `%${search}%`),
          like(cmsPages.content, `%${search}%`)
        )
      );
    }

    if (status) {
      whereConditions.push(eq(cmsPages.status, status));
    }

    if (language) {
      whereConditions.push(eq(cmsPages.language, language));
    }

    if (template) {
      whereConditions.push(eq(cmsPages.template, template));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [pages, totalCount] = await Promise.all([
      db.select()
        .from(cmsPages)
        .where(whereClause)
        .orderBy(desc(cmsPages.createdAt))
        .limit(limit)
        .offset(offset),

      db.select({ count: cmsPages.id })
        .from(cmsPages)
        .where(whereClause)
        .then(result => result.length)
    ]);

    // Log this access
    await db.insert(systemLogs).values({
      level: 'info',
      category: 'admin',
      message: 'CMS pages accessed',
      source: 'admin-cms-api',
      adminUserId: 1,
      ipAddress: req.ip,
      metadata: JSON.stringify({ page, limit, search, status, language, template })
    });

    res.json({
      pages,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('CMS pages list error:', error);
    res.status(500).json({ error: 'CMS sayfaları listelenemedi' });
  }
});

// Tek CMS sayfa detayı
router.get('/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const pageId = parseInt(req.params.id);

    const page = await db.select()
      .from(cmsPages)
      .where(eq(cmsPages.id, pageId))
      .limit(1);

    if (page.length === 0) {
      return res.status(404).json({ error: 'CMS sayfası bulunamadı' });
    }

    res.json(page[0]);

  } catch (error) {
    console.error('CMS page detail error:', error);
    res.status(500).json({ error: 'CMS sayfası detayı alınamadı' });
  }
});

// Slug ile CMS sayfa getirme
router.get('/slug/:slug', async (req: Request, res: Response) => {
  try {
    const slug = req.params.slug;

    const page = await db.select()
      .from(cmsPages)
      .where(
        and(
          eq(cmsPages.slug, slug),
          eq(cmsPages.status, 'published')
        )
      )
      .limit(1);

    if (page.length === 0) {
      return res.status(404).json({ error: 'Sayfa bulunamadı' });
    }

    res.json(page[0]);

  } catch (error) {
    console.error('CMS page by slug error:', error);
    res.status(500).json({ error: 'Sayfa getirilemedi' });
  }
});

// Yeni CMS sayfa oluşturma
router.post('/', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const validatedData = createPageSchema.parse(req.body);
    
    // Slug benzersizlik kontrolü
    const existingPage = await db.select()
      .from(cmsPages)
      .where(eq(cmsPages.slug, validatedData.slug))
      .limit(1);

    if (existingPage.length > 0) {
      return res.status(400).json({ 
        error: 'Bu slug zaten kullanılıyor' 
      });
    }

    // Eğer ana sayfa olarak işaretleniyorsa, diğer ana sayfaları kaldır
    if (validatedData.isHomepage) {
      await db.update(cmsPages)
        .set({ isHomepage: false })
        .where(eq(cmsPages.isHomepage, true));
    }

    // Yeni CMS sayfası oluştur
    const newPage = await db.insert(cmsPages).values({
      title: validatedData.title,
      slug: validatedData.slug,
      content: validatedData.content,
      excerpt: validatedData.excerpt,
      template: validatedData.template,
      status: validatedData.status,
      language: validatedData.language,
      authorId: 1,
      metaTitle: validatedData.metaTitle,
      metaDescription: validatedData.metaDescription,
      metaKeywords: validatedData.metaKeywords,
      featuredImage: validatedData.featuredImage,
      publishedAt: validatedData.publishedAt ? new Date(validatedData.publishedAt) : null,
      orderIndex: validatedData.orderIndex,
      parentId: validatedData.parentId,
      showInMenu: validatedData.showInMenu,
      isHomepage: validatedData.isHomepage
    }).returning();

    // Log this action
    await db.insert(systemLogs).values({
      level: 'info',
      category: 'admin',
      message: `New CMS page created: ${validatedData.title}`,
      source: 'admin-cms-api',
      adminUserId: 1,
      ipAddress: req.ip,
      metadata: JSON.stringify({ 
        newPageId: newPage[0].id,
        slug: validatedData.slug,
        status: validatedData.status
      })
    });

    res.status(201).json(newPage[0]);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Geçersiz veri',
        details: error.errors 
      });
    }
    
    console.error('Create CMS page error:', error);
    res.status(500).json({ error: 'CMS sayfası oluşturulamadı' });
  }
});

// CMS sayfa güncelleme
router.put('/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const pageId = parseInt(req.params.id);
    const validatedData = updatePageSchema.parse(req.body);

    // Mevcut sayfa kontrolü
    const existingPage = await db.select()
      .from(cmsPages)
      .where(eq(cmsPages.id, pageId))
      .limit(1);

    if (existingPage.length === 0) {
      return res.status(404).json({ error: 'CMS sayfası bulunamadı' });
    }

    // Eğer ana sayfa olarak işaretleniyorsa, diğer ana sayfaları kaldır
    if (validatedData.isHomepage) {
      await db.update(cmsPages)
        .set({ isHomepage: false })
        .where(eq(cmsPages.isHomepage, true));
    }

    // CMS sayfasını güncelle
    const updatedPage = await db.update(cmsPages)
      .set({
        ...validatedData,
        publishedAt: validatedData.publishedAt ? new Date(validatedData.publishedAt) : undefined,
        updatedAt: new Date()
      })
      .where(eq(cmsPages.id, pageId))
      .returning();

    // Log this action
    await db.insert(systemLogs).values({
      level: 'info',
      category: 'admin',
      message: `CMS page updated: ${existingPage[0].title}`,
      source: 'admin-cms-api',
      adminUserId: 1,
      ipAddress: req.ip,
      metadata: JSON.stringify({ 
        updatedPageId: pageId,
        changes: validatedData 
      })
    });

    res.json(updatedPage[0]);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Geçersiz veri',
        details: error.errors 
      });
    }
    
    console.error('Update CMS page error:', error);
    res.status(500).json({ error: 'CMS sayfası güncellenemedi' });
  }
});

// CMS sayfa silme
router.delete('/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const pageId = parseInt(req.params.id);

    // Mevcut sayfa kontrolü
    const existingPage = await db.select()
      .from(cmsPages)
      .where(eq(cmsPages.id, pageId))
      .limit(1);

    if (existingPage.length === 0) {
      return res.status(404).json({ error: 'CMS sayfası bulunamadı' });
    }

    // Ana sayfa silinmesin
    if (existingPage[0].isHomepage) {
      return res.status(400).json({ 
        error: 'Ana sayfa silinemez' 
      });
    }

    // CMS sayfasını sil
    await db.delete(cmsPages)
      .where(eq(cmsPages.id, pageId));

    // Log this action
    await db.insert(systemLogs).values({
      level: 'warning',
      category: 'admin',
      message: `CMS page deleted: ${existingPage[0].title}`,
      source: 'admin-cms-api',
      adminUserId: 1,
      ipAddress: req.ip,
      metadata: JSON.stringify({ 
        deletedPageId: pageId,
        deletedPageTitle: existingPage[0].title,
        deletedPageSlug: existingPage[0].slug
      })
    });

    res.json({ message: 'CMS sayfası başarıyla silindi' });

  } catch (error) {
    console.error('Delete CMS page error:', error);
    res.status(500).json({ error: 'CMS sayfası silinemedi' });
  }
});

// CMS istatistikleri
router.get('/stats/summary', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const totalPages = await db.select().from(cmsPages);
    const publishedPages = await db.select().from(cmsPages).where(eq(cmsPages.status, 'published'));
    const draftPages = await db.select().from(cmsPages).where(eq(cmsPages.status, 'draft'));

    // Dil bazında istatistikler
    const languageStats = await db.select({
      language: cmsPages.language
    })
    .from(cmsPages)
    .groupBy(cmsPages.language);

    // Template bazında istatistikler
    const templateStats = await db.select({
      template: cmsPages.template
    })
    .from(cmsPages)
    .groupBy(cmsPages.template);

    const summary = {
      totalPages: totalPages.length,
      publishedPages: publishedPages.length,
      draftPages: draftPages.length,
      languageDistribution: languageStats,
      templateDistribution: templateStats
    };

    res.json(summary);

  } catch (error) {
    console.error('CMS stats error:', error);
    res.status(500).json({ error: 'CMS istatistikleri alınamadı' });
  }
});

// Template listesi
router.get('/templates/list', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const templates = [
      'default',
      'homepage',
      'landing',
      'blog',
      'portfolio',
      'contact',
      'about',
      'services',
      'custom'
    ];

    res.json(templates);

  } catch (error) {
    console.error('Templates list error:', error);
    res.status(500).json({ error: 'Template listesi alınamadı' });
  }
});

export default router;