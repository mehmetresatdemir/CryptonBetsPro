import { Router } from 'express';
import { db } from '../db';
import { newsArticles, type InsertNewsArticle } from '@shared/schema';
import { eq, and, or, like, desc, count } from 'drizzle-orm';
import { requireAdminAuth } from '../utils/auth';

const router = Router();

// Tüm haberleri getir (sayfalama ve filtreleme ile)
router.get('/', requireAdminAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as string;
    const category = req.query.category as string;
    const search = req.query.search as string;
    const offset = (page - 1) * limit;

    // Dinamik filtreleme için where koşulları
    const whereConditions = [];

    if (status) {
      whereConditions.push(eq(newsArticles.status, status));
    }

    if (category) {
      whereConditions.push(eq(newsArticles.category, category));
    }

    if (search) {
      whereConditions.push(
        or(
          like(newsArticles.title, `%${search}%`),
          like(newsArticles.content, `%${search}%`)
        )
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...(whereConditions as any[])) : undefined;

    // Toplam sayı için sorgu
    const [{ total }] = await db
      .select({ total: count() })
      .from(newsArticles)
      .where(whereClause);

    // Ana veri sorgusu
    const articles = await db
      .select()
      .from(newsArticles)
      .where(whereClause)
      .orderBy(desc(newsArticles.createdAt))
      .limit(limit)
      .offset(offset);

    const totalPages = Math.ceil(total / limit);

    res.json({
      success: true,
      news: articles,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Haber listesi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Haberler alınırken hata oluştu'
    });
  }
});

// Haber detayını getir
router.get('/:id', requireAdminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const [article] = await db
      .select()
      .from(newsArticles)
      .where(eq(newsArticles.id, id));

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Haber bulunamadı'
      });
    }

    res.json({
      success: true,
      news: article
    });

  } catch (error) {
    console.error('Haber detay hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Haber detayı alınırken hata oluştu'
    });
  }
});

// Yeni haber oluştur
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const newsData: InsertNewsArticle = req.body;
    
    // Slug oluştur
    if (!newsData.slug && newsData.title) {
      newsData.slug = newsData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
    }

    const [newArticle] = await db
      .insert(newsArticles)
      .values(newsData)
      .returning();

    res.status(201).json({
      success: true,
      message: 'Haber başarıyla oluşturuldu',
      news: newArticle
    });

  } catch (error) {
    console.error('Haber oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Haber oluşturulurken hata oluştu'
    });
  }
});

// Haber güncelle
router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;

    // Slug güncelle
    if (updateData.title && !updateData.slug) {
      updateData.slug = updateData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .trim();
    }

    updateData.updatedAt = new Date();

    const [updatedArticle] = await db
      .update(newsArticles)
      .set(updateData)
      .where(eq(newsArticles.id, id))
      .returning();

    if (!updatedArticle) {
      return res.status(404).json({
        success: false,
        message: 'Haber bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Haber başarıyla güncellendi',
      news: updatedArticle
    });

  } catch (error) {
    console.error('Haber güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Haber güncellenirken hata oluştu'
    });
  }
});

// Haber sil
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const [deletedArticle] = await db
      .delete(newsArticles)
      .where(eq(newsArticles.id, id))
      .returning();

    if (!deletedArticle) {
      return res.status(404).json({
        success: false,
        message: 'Haber bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Haber başarıyla silindi'
    });

  } catch (error) {
    console.error('Haber silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Haber silinirken hata oluştu'
    });
  }
});

// Haber durumunu güncelle
router.patch('/:id/status', requireAdminAuth, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;

    const [updatedArticle] = await db
      .update(newsArticles)
      .set({ 
        status,
        updatedAt: new Date(),
        publishedAt: status === 'published' ? new Date() : undefined
      })
      .where(eq(newsArticles.id, id))
      .returning();

    if (!updatedArticle) {
      return res.status(404).json({
        success: false,
        message: 'Haber bulunamadı'
      });
    }

    res.json({
      success: true,
      message: 'Haber durumu güncellendi',
      news: updatedArticle
    });

  } catch (error) {
    console.error('Haber durum güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Haber durumu güncellenirken hata oluştu'
    });
  }
});

// Haber istatistikleri
router.get('/stats/overview', requireAdminAuth, async (req, res) => {
  try {
    const [stats] = await db
      .select({
        total: count(),
        published: count(eq(newsArticles.status, 'published')),
        draft: count(eq(newsArticles.status, 'draft')),
        archived: count(eq(newsArticles.status, 'archived'))
      })
      .from(newsArticles);

    const [featured] = await db
      .select({ count: count() })
      .from(newsArticles)
      .where(eq(newsArticles.isFeatured, true));

    const [breaking] = await db
      .select({ count: count() })
      .from(newsArticles)
      .where(eq(newsArticles.isBreaking, true));

    res.json({
      success: true,
      stats: {
        total: stats.total,
        published: stats.published,
        draft: stats.draft,
        archived: stats.archived,
        featured: featured.count,
        breaking: breaking.count
      }
    });

  } catch (error) {
    console.error('Haber istatistik hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler alınırken hata oluştu'
    });
  }
});

export default router;