import { Router } from 'express';
import { eq, desc, and, like, count, or, sql } from 'drizzle-orm';
import { db } from '../db';
import { kycDocuments, users } from '../../shared/schema';
import { requireAdminAuth } from '../utils/auth';

const router = Router();

// Tüm rotalar admin yetkilendirmesi gerektirir
router.use(requireAdminAuth);

// KYC istatistikleri
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 KYC STATS: Generating KYC statistics');

    // Temel KYC istatistikleri
    const basicStats = await db
      .select({
        totalDocuments: count(),
        pendingReview: sql<number>`COUNT(CASE WHEN status = 'pending' THEN 1 END)`,
        approved: sql<number>`COUNT(CASE WHEN status = 'approved' THEN 1 END)`,
        rejected: sql<number>`COUNT(CASE WHEN status = 'rejected' THEN 1 END)`
      })
      .from(kycDocuments);

    const stats = basicStats[0];
    const completionRate = stats.totalDocuments > 0 
      ? Math.round((stats.approved / stats.totalDocuments) * 100) 
      : 0;

    console.log('✅ KYC STATS: Statistics generated successfully');

    res.json({
      totalDocuments: stats.totalDocuments,
      pendingReview: stats.pendingReview,
      approved: stats.approved,
      rejected: stats.rejected,
      completionRate
    });

  } catch (error) {
    console.error('❌ KYC STATS ERROR:', error);
    res.status(500).json({ 
      error: 'KYC istatistikleri alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// KYC dokümanları listesi
router.get('/documents', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      status = 'all',
      documentType = 'all'
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const limitNum = parseInt(limit as string) || 20;
    const offset = (pageNum - 1) * limitNum;

    console.log(`🔍 KYC DOCUMENTS: Fetching documents - Page: ${pageNum}, Status: ${status}`);

    // Filtre koşulları
    const conditions = [];

    if (search) {
      // Users tablosundan username'e göre arama
      const userIds = await db
        .select({ id: users.id })
        .from(users)
        .where(
          or(
            like(users.username, `%${search}%`),
            like(users.email, `%${search}%`),
            like(users.firstName, `%${search}%`),
            like(users.lastName, `%${search}%`)
          )
        );

      if (userIds.length > 0) {
        conditions.push(
          or(...userIds.map(user => eq(kycDocuments.userId, user.id)))
        );
      } else {
        // Hiç kullanıcı bulunamadıysa boş sonuç döndür
        return res.json({
          documents: [],
          total: 0,
          page: pageNum,
          limit: limitNum,
          totalPages: 0
        });
      }
    }

    if (status !== 'all') {
      conditions.push(eq(kycDocuments.status, status as string));
    }

    if (documentType !== 'all') {
      conditions.push(eq(kycDocuments.type, documentType as string));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Toplam sayı
    const totalResult = await db
      .select({ count: count() })
      .from(kycDocuments)
      .where(whereClause);

    const total = totalResult[0].count;

    // KYC dokümanları ve kullanıcı bilgileri
    const documents = await db
      .select({
        id: kycDocuments.id,
        userId: kycDocuments.userId,
        username: users.username,
        documentType: kycDocuments.type,
        status: kycDocuments.status,
        submittedAt: kycDocuments.uploadedAt,
        reviewedAt: kycDocuments.reviewedAt,
        reviewedBy: kycDocuments.reviewedBy,
        frontImageUrl: kycDocuments.filePath,
        backImageUrl: kycDocuments.filePath,
        notes: kycDocuments.rejectionReason,
        rejectionReason: kycDocuments.rejectionReason
      })
      .from(kycDocuments)
      .leftJoin(users, eq(kycDocuments.userId, users.id))
      .where(whereClause)
      .orderBy(desc(kycDocuments.uploadedAt))
      .limit(limitNum)
      .offset(offset);

    console.log(`📋 KYC DOCUMENTS: Found ${documents.length} documents out of ${total} total`);

    res.json({
      documents,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });

  } catch (error) {
    console.error('❌ KYC DOCUMENTS ERROR:', error);
    res.status(500).json({ 
      error: 'KYC dokümanları alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// KYC doküman incelemesi
router.post('/documents/:id/review', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;
    const adminUser = req.user;

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Geçersiz işlem' });
    }

    if (action === 'reject' && !notes?.trim()) {
      return res.status(400).json({ error: 'Red işlemi için sebep belirtilmesi zorunludur' });
    }

    console.log(`🔍 KYC REVIEW: Reviewing document ${id} - Action: ${action}`);

    // Dokümanı kontrol et
    const document = await db
      .select()
      .from(kycDocuments)
      .where(eq(kycDocuments.id, parseInt(id)))
      .limit(1);

    if (!document[0]) {
      return res.status(404).json({ error: 'Doküman bulunamadı' });
    }

    if (document[0].status !== 'pending') {
      return res.status(400).json({ error: 'Bu doküman zaten incelenmiş' });
    }

    // Dokümanı güncelle
    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewedAt: new Date(),
      reviewedBy: 1,
      notes: notes?.trim() || null
    };

    if (action === 'reject') {
      updateData.rejectionReason = notes?.trim() || 'Document rejected';
    }

    const updatedDocument = await db
      .update(kycDocuments)
      .set(updateData)
      .where(eq(kycDocuments.id, parseInt(id)))
      .returning();

    console.log(`✅ KYC REVIEW: Document ${id} ${action}ed successfully`);

    res.json({
      success: true,
      document: updatedDocument[0],
      message: `Doküman başarıyla ${action === 'approve' ? 'onaylandı' : 'reddedildi'}`
    });

  } catch (error) {
    console.error('❌ KYC REVIEW ERROR:', error);
    res.status(500).json({ 
      error: 'KYC incelemesi yapılamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Kullanıcının KYC durumu
router.get('/users/:userId/status', async (req, res) => {
  try {
    const { userId } = req.params;

    console.log(`🔍 KYC USER STATUS: Checking KYC status for user ${userId}`);

    // Kullanıcının tüm KYC dokümanları
    const documents = await db
      .select()
      .from(kycDocuments)
      .where(eq(kycDocuments.userId, parseInt(userId)))
      .orderBy(desc(kycDocuments.uploadedAt));

    // KYC durumu analizi
    const documentTypes = ['identity', 'address', 'bank'];
    const status = {
      isKycComplete: false,
      completedDocuments: 0,
      totalDocuments: documentTypes.length,
      documents: documents,
      missingDocuments: [] as string[]
    };

    // Her doküman türü için kontrol
    documentTypes.forEach(type => {
      const typeDocument = documents.find(doc => doc.type === type && doc.status === 'approved');
      if (typeDocument) {
        status.completedDocuments++;
      } else {
        status.missingDocuments.push(type);
      }
    });

    status.isKycComplete = status.completedDocuments === status.totalDocuments;

    console.log(`📊 KYC USER STATUS: User ${userId} KYC completion: ${status.completedDocuments}/${status.totalDocuments}`);

    res.json(status);

  } catch (error) {
    console.error('❌ KYC USER STATUS ERROR:', error);
    res.status(500).json({ 
      error: 'Kullanıcı KYC durumu alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Toplu KYC işlemleri
router.post('/documents/bulk-action', async (req, res) => {
  try {
    const { documentIds, action, notes } = req.body;
    const adminUser = req.user;

    if (!documentIds || !Array.isArray(documentIds) || documentIds.length === 0) {
      return res.status(400).json({ error: 'Doküman ID\'leri gerekli' });
    }

    if (!action || !['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Geçersiz işlem' });
    }

    console.log(`🔍 KYC BULK ACTION: Processing ${documentIds.length} documents - Action: ${action}`);

    // Sadece pending durumundaki dokümanları işle
    const pendingDocuments = await db
      .select()
      .from(kycDocuments)
      .where(
        and(
          sql`id = ANY(${documentIds})`,
          eq(kycDocuments.status, 'pending')
        )
      );

    if (pendingDocuments.length === 0) {
      return res.status(400).json({ error: 'İşlenebilir doküman bulunamadı' });
    }

    // Toplu güncelleme
    const updateData: any = {
      status: action === 'approve' ? 'approved' : 'rejected',
      reviewedAt: new Date(),
      reviewedBy: 1,
      notes: notes?.trim() || null
    };

    if (action === 'reject') {
      updateData.rejectionReason = notes?.trim() || 'Toplu red işlemi';
    }

    const updatedDocuments = await db
      .update(kycDocuments)
      .set(updateData)
      .where(
        and(
          sql`id = ANY(${pendingDocuments.map(doc => doc.id)})`,
          eq(kycDocuments.status, 'pending')
        )
      )
      .returning();

    console.log(`✅ KYC BULK ACTION: ${updatedDocuments.length} documents processed successfully`);

    res.json({
      success: true,
      processedCount: updatedDocuments.length,
      documents: updatedDocuments,
      message: `${updatedDocuments.length} doküman başarıyla ${action === 'approve' ? 'onaylandı' : 'reddedildi'}`
    });

  } catch (error) {
    console.error('❌ KYC BULK ACTION ERROR:', error);
    res.status(500).json({ 
      error: 'Toplu KYC işlemi yapılamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

export default router;