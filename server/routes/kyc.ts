import { Router } from 'express';
import { eq, desc, and, like, count, asc, or } from 'drizzle-orm';
import { db } from '../db';
import { kycDocuments, users } from '../../shared/schema';

const router = Router();

// KYC belgelerini getir (Admin Only)
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      status = '',
      type = '',
      sortBy = 'uploaded_at',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    console.log(`🔍 KYC API: Fetching KYC documents - Page: ${pageNum}, Limit: ${limitNum}`);

    // Filtre koşulları oluştur
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`),
          like(kycDocuments.fileName, `%${search}%`)
        )
      );
    }

    if (status && status !== 'all') {
      conditions.push(eq(kycDocuments.status, status as string));
    }

    if (type && type !== 'all') {
      conditions.push(eq(kycDocuments.type, type as string));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Toplam sayı
    const totalResult = await db
      .select({ count: count() })
      .from(kycDocuments)
      .leftJoin(users, eq(kycDocuments.userId, users.id))
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    // Sıralama
    const orderByFn = sortOrder === 'asc' ? asc : desc;

    // KYC belgelerini getir
    const kycList = await db
      .select({
        id: kycDocuments.id,
        userId: kycDocuments.userId,
        username: users.username,
        email: users.email,
        type: kycDocuments.type,
        fileName: kycDocuments.fileName,
        filePath: kycDocuments.filePath,
        fileSize: kycDocuments.fileSize,
        mimeType: kycDocuments.mimeType,
        status: kycDocuments.status,
        rejectionReason: kycDocuments.rejectionReason,
        reviewedBy: kycDocuments.reviewedBy,
        uploadedAt: kycDocuments.uploadedAt,
        reviewedAt: kycDocuments.reviewedAt
      })
      .from(kycDocuments)
      .leftJoin(users, eq(kycDocuments.userId, users.id))
      .where(whereClause)
      .orderBy(orderByFn(kycDocuments.uploadedAt))
      .limit(limitNum)
      .offset(offset);

    console.log(`📊 KYC DATA COLLECTED: ${kycList.length} documents found out of ${total} total`);

    res.json({
      documents: kycList,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });

  } catch (error) {
    console.error('❌ KYC API ERROR:', error);
    res.status(500).json({ 
      error: 'KYC belgeleri alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// KYC belge detayını getir (Admin Only)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🔍 KYC DETAIL: Fetching document ${id}`);

    const documentId = parseInt(id);
    if (isNaN(documentId)) {
      return res.status(400).json({ error: 'Geçersiz belge ID' });
    }

    const document = await db
      .select({
        id: kycDocuments.id,
        userId: kycDocuments.userId,
        username: users.username,
        email: users.email,
        type: kycDocuments.type,
        fileName: kycDocuments.fileName,
        filePath: kycDocuments.filePath,
        fileSize: kycDocuments.fileSize,
        mimeType: kycDocuments.mimeType,
        status: kycDocuments.status,
        rejectionReason: kycDocuments.rejectionReason,
        reviewedBy: kycDocuments.reviewedBy,
        uploadedAt: kycDocuments.uploadedAt,
        reviewedAt: kycDocuments.reviewedAt
      })
      .from(kycDocuments)
      .leftJoin(users, eq(kycDocuments.userId, users.id))
      .where(eq(kycDocuments.id, documentId))
      .limit(1);

    if (!document[0]) {
      return res.status(404).json({ error: 'KYC belgesi bulunamadı' });
    }

    res.json(document[0]);

  } catch (error) {
    console.error('❌ KYC DETAIL ERROR:', error);
    res.status(500).json({ 
      error: 'KYC belge detayı alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// KYC belge durumunu güncelle (Admin Only)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, reviewedBy } = req.body;

    console.log(`🔄 KYC STATUS UPDATE: Updating document ${id} to ${status}`);

    const validStatuses = ['pending', 'approved', 'rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Geçersiz durum değeri' });
    }

    const updateData: any = {
      status,
      reviewedAt: new Date()
    };

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    if (reviewedBy) {
      updateData.reviewedBy = parseInt(reviewedBy);
    }

    const updatedDocument = await db
      .update(kycDocuments)
      .set(updateData)
      .where(eq(kycDocuments.id, parseInt(id)))
      .returning();

    if (!updatedDocument[0]) {
      return res.status(404).json({ error: 'KYC belgesi bulunamadı' });
    }

    console.log(`✅ KYC STATUS UPDATED: Document ${id} updated to ${status}`);

    res.json({
      success: true,
      document: updatedDocument[0],
      message: 'KYC belge durumu güncellendi'
    });

  } catch (error) {
    console.error('❌ KYC STATUS UPDATE ERROR:', error);
    res.status(500).json({ 
      error: 'KYC belge durumu güncellenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// KYC istatistikleri (Admin Only)
router.get('/stats/summary', async (req, res) => {
  try {
    console.log(`📊 KYC STATS: Generating statistics`);

    // Durum bazında istatistikler
    const statusStats = await db
      .select({
        status: kycDocuments.status,
        count: count(),
        type: kycDocuments.type
      })
      .from(kycDocuments)
      .groupBy(kycDocuments.status, kycDocuments.type);

    // Günlük istatistikler (son 30 gün)
    const dailyStats = await db
      .select({
        date: kycDocuments.uploadedAt,
        count: count(),
        status: kycDocuments.status
      })
      .from(kycDocuments)
      .groupBy(kycDocuments.uploadedAt, kycDocuments.status)
      .orderBy(desc(kycDocuments.uploadedAt))
      .limit(30);

    // Belge türü istatistikleri
    const typeStats = await db
      .select({
        type: kycDocuments.type,
        count: count(),
        approved: count(),
        pending: count(),
        rejected: count()
      })
      .from(kycDocuments)
      .groupBy(kycDocuments.type);

    console.log(`✅ KYC STATS: Statistics generated successfully`);

    res.json({
      statusStats,
      dailyStats,
      typeStats,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ KYC STATS ERROR:', error);
    res.status(500).json({ 
      error: 'KYC istatistikleri alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// KYC belgelerini dışa aktar (Admin Only)
router.get('/export/data', async (req, res) => {
  try {
    const {
      format = 'csv',
      search = '',
      status = '',
      type = ''
    } = req.query;

    console.log(`📤 KYC EXPORT: Format: ${format}`);

    // Filtre koşulları oluştur
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`),
          like(kycDocuments.fileName, `%${search}%`)
        )
      );
    }

    if (status && status !== 'all') {
      conditions.push(eq(kycDocuments.status, status as string));
    }

    if (type && type !== 'all') {
      conditions.push(eq(kycDocuments.type, type as string));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Tüm KYC belgelerini getir
    const kycList = await db
      .select({
        id: kycDocuments.id,
        userId: kycDocuments.userId,
        username: users.username,
        email: users.email,
        type: kycDocuments.type,
        fileName: kycDocuments.fileName,
        fileSize: kycDocuments.fileSize,
        mimeType: kycDocuments.mimeType,
        status: kycDocuments.status,
        rejectionReason: kycDocuments.rejectionReason,
        uploadedAt: kycDocuments.uploadedAt,
        reviewedAt: kycDocuments.reviewedAt
      })
      .from(kycDocuments)
      .leftJoin(users, eq(kycDocuments.userId, users.id))
      .where(whereClause)
      .orderBy(desc(kycDocuments.uploadedAt));

    if (format === 'csv') {
      // CSV formatında dışa aktar
      const csvHeaders = [
        'ID', 'Kullanıcı ID', 'Kullanıcı Adı', 'E-posta', 'Belge Türü', 'Dosya Adı', 
        'Dosya Boyutu', 'MIME Türü', 'Durum', 'Red Nedeni', 'Yüklenme Tarihi', 'İnceleme Tarihi'
      ];
      
      const csvRows = kycList.map(doc => [
        doc.id,
        doc.userId,
        doc.username || '',
        doc.email || '',
        doc.type,
        `"${(doc.fileName || '').replace(/"/g, '""')}"`,
        doc.fileSize || '',
        doc.mimeType || '',
        doc.status,
        `"${(doc.rejectionReason || '').replace(/"/g, '""')}"`,
        doc.uploadedAt?.toISOString() || '',
        doc.reviewedAt?.toISOString() || ''
      ]);

      const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="kyc-documents-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\uFEFF' + csvContent); // UTF-8 BOM for Turkish characters
    } else {
      // JSON formatında dışa aktar
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="kyc-documents-${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        exportDate: new Date().toISOString(),
        totalRecords: kycList.length,
        documents: kycList
      });
    }

    console.log(`✅ KYC EXPORT: Successfully exported ${kycList.length} documents as ${format}`);

  } catch (error) {
    console.error('❌ KYC EXPORT ERROR:', error);
    res.status(500).json({ 
      error: 'KYC belge dışa aktarma işlemi başarısız',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

export default router;