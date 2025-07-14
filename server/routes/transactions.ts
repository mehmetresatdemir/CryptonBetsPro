import { Router } from 'express';
import { eq, desc, and, gte, lte, like, sql, count, asc, or } from 'drizzle-orm';
import { db } from '../db';
import { transactions, users } from '../../shared/schema';
import { authMiddleware } from '../utils/auth';

const router = Router();

// İşlemleri getir (Admin Only)
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      type = '',
      status = '',
      paymentMethod = '',
      dateFrom = '',
      dateTo = '',
      sortBy = 'created_at',
      sortOrder = 'desc',
      userId = ''
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    console.log(`🔍 TRANSACTIONS API: Fetching transactions - Page: ${pageNum}, Limit: ${limitNum}`);

    // Filtre koşulları oluştur
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(transactions.transactionId, `%${search}%`),
          like(transactions.description, `%${search}%`),
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    if (type && type !== 'all') {
      conditions.push(eq(transactions.type, type as string));
    }

    if (status && status !== 'all') {
      conditions.push(eq(transactions.status, status as string));
    }

    if (paymentMethod && paymentMethod !== 'all') {
      conditions.push(eq(transactions.paymentMethod, paymentMethod as string));
    }

    if (userId) {
      conditions.push(eq(transactions.userId, parseInt(userId as string)));
    }

    if (dateFrom) {
      conditions.push(gte(transactions.createdAt, new Date(dateFrom as string)));
    }

    if (dateTo) {
      const endDate = new Date(dateTo as string);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(transactions.createdAt, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Toplam sayı
    const totalResult = await db
      .select({ count: count() })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(whereClause);

    const total = totalResult[0]?.count || 0;

    // Sıralama
    const orderByFn = sortOrder === 'asc' ? asc : desc;

    // İşlemleri getir
    const transactionsList = await db
      .select({
        id: transactions.id,
        transactionId: transactions.transactionId,
        userId: transactions.userId,
        username: users.username,
        email: users.email,
        type: transactions.type,
        amount: transactions.amount,
        currency: transactions.currency,
        status: transactions.status,
        description: transactions.description,
        paymentMethod: transactions.paymentMethod,
        paymentDetails: transactions.paymentDetails,
        referenceId: transactions.referenceId,
        balanceBefore: transactions.balanceBefore,
        balanceAfter: transactions.balanceAfter,
        processedAt: transactions.processedAt,
        createdAt: transactions.createdAt
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(whereClause)
      .orderBy(orderByFn(transactions.createdAt))
      .limit(limitNum)
      .offset(offset);

    console.log(`📊 TRANSACTIONS DATA COLLECTED: ${transactionsList.length} transactions found out of ${total} total`);

    res.json({
      transactions: transactionsList,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });

  } catch (error) {
    console.error('❌ TRANSACTIONS API ERROR:', error);
    res.status(500).json({ 
      error: 'İşlemler alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// İşlem detayını getir (Admin Only)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🔍 TRANSACTION DETAIL: Fetching transaction ${id}`);

    const transaction = await db
      .select({
        id: transactions.id,
        transactionId: transactions.transactionId,
        userId: transactions.userId,
        username: users.username,
        email: users.email,
        type: transactions.type,
        amount: transactions.amount,
        currency: transactions.currency,
        status: transactions.status,
        description: transactions.description,
        paymentMethod: transactions.paymentMethod,
        paymentDetails: transactions.paymentDetails,
        referenceId: transactions.referenceId,
        balanceBefore: transactions.balanceBefore,
        balanceAfter: transactions.balanceAfter,
        processedAt: transactions.processedAt,
        createdAt: transactions.createdAt
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(eq(transactions.id, parseInt(id)))
      .limit(1);

    if (!transaction[0]) {
      return res.status(404).json({ error: 'İşlem bulunamadı' });
    }

    res.json(transaction[0]);

  } catch (error) {
    console.error('❌ TRANSACTION DETAIL ERROR:', error);
    res.status(500).json({ 
      error: 'İşlem detayı alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// İşlem durumunu güncelle (Admin Only)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, reviewedBy } = req.body;

    console.log(`🔄 TRANSACTION STATUS UPDATE: Updating transaction ${id} to ${status}`);

    const validStatuses = ['pending', 'approved', 'rejected', 'processing', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Geçersiz durum değeri' });
    }

    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy;
    }

    if (status === 'approved' || status === 'completed') {
      updateData.processedAt = new Date();
    }

    const updatedTransaction = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, parseInt(id)))
      .returning();

    if (!updatedTransaction[0]) {
      return res.status(404).json({ error: 'İşlem bulunamadı' });
    }

    console.log(`✅ TRANSACTION STATUS UPDATED: Transaction ${id} updated to ${status}`);

    res.json({
      success: true,
      transaction: updatedTransaction[0],
      message: 'İşlem durumu güncellendi'
    });

  } catch (error) {
    console.error('❌ TRANSACTION STATUS UPDATE ERROR:', error);
    res.status(500).json({ 
      error: 'İşlem durumu güncellenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Toplu işlem durumu güncelleme (Admin Only)
router.patch('/bulk/status', async (req, res) => {
  try {
    const { transactionIds, status, rejectionReason, reviewedBy } = req.body;

    if (!Array.isArray(transactionIds) || transactionIds.length === 0) {
      return res.status(400).json({ error: 'İşlem ID\'leri gerekli' });
    }

    console.log(`🔄 BULK TRANSACTION UPDATE: Updating ${transactionIds.length} transactions to ${status}`);

    const validStatuses = ['pending', 'approved', 'rejected', 'processing', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Geçersiz durum değeri' });
    }

    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (status === 'rejected' && rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }

    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy;
    }

    if (status === 'approved' || status === 'completed') {
      updateData.processedAt = new Date();
    }

    const updatedTransactions = await db
      .update(transactions)
      .set(updateData)
      .where(sql`${transactions.id} = ANY(${transactionIds})`)
      .returning();

    console.log(`✅ BULK TRANSACTION UPDATE: ${updatedTransactions.length} transactions updated`);

    res.json({
      success: true,
      updatedCount: updatedTransactions.length,
      message: `${updatedTransactions.length} işlem güncellendi`
    });

  } catch (error) {
    console.error('❌ BULK TRANSACTION UPDATE ERROR:', error);
    res.status(500).json({ 
      error: 'Toplu işlem güncellenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// İşlem istatistikleri (Admin Only)
router.get('/stats/summary', async (req, res) => {
  try {
    const { dateFrom, dateTo, type } = req.query;

    console.log(`📊 TRANSACTION STATS: Generating statistics`);

    const conditions = [];

    if (dateFrom) {
      conditions.push(gte(transactions.createdAt, new Date(dateFrom as string)));
    }

    if (dateTo) {
      const endDate = new Date(dateTo as string);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(transactions.createdAt, endDate));
    }

    if (type && type !== 'all') {
      conditions.push(eq(transactions.type, type as string));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Genel istatistikler - Doğru hesaplama
    const stats = await db
      .select({
        count: count(),
        totalAmount: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
        avgAmount: sql<number>`COALESCE(AVG(${transactions.amount}), 0)`,
        type: transactions.type,
        status: transactions.status
      })
      .from(transactions)
      .where(whereClause)
      .groupBy(transactions.type, transactions.status);

    // Günlük istatistikler
    const dailyStats = await db
      .select({
        date: sql<string>`DATE(${transactions.createdAt})`,
        count: count(),
        totalAmount: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
        type: transactions.type
      })
      .from(transactions)
      .where(whereClause)
      .groupBy(sql`DATE(${transactions.createdAt})`, transactions.type)
      .orderBy(sql`DATE(${transactions.createdAt}) DESC`)
      .limit(30);

    // Ödeme yöntemi istatistikleri
    const paymentMethodStats = await db
      .select({
        paymentMethod: transactions.paymentMethod,
        count: count(),
        totalAmount: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`
      })
      .from(transactions)
      .where(whereClause)
      .groupBy(transactions.paymentMethod);

    console.log(`✅ TRANSACTION STATS: Statistics generated successfully`);

    res.json({
      summary: stats,
      daily: dailyStats,
      paymentMethods: paymentMethodStats,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ TRANSACTION STATS ERROR:', error);
    res.status(500).json({ 
      error: 'İstatistikler alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// İşlemleri dışa aktar (Admin Only)
router.get('/export/data', async (req, res) => {
  try {
    const {
      format = 'csv',
      search = '',
      type = '',
      status = '',
      paymentMethod = '',
      dateFrom = '',
      dateTo = '',
      userId = ''
    } = req.query;

    console.log(`📤 TRANSACTION EXPORT: Format: ${format}`);

    // Filtre koşulları oluştur
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(transactions.transactionId, `%${search}%`),
          like(transactions.description, `%${search}%`),
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      );
    }

    if (type && type !== 'all') {
      conditions.push(eq(transactions.type, type as string));
    }

    if (status && status !== 'all') {
      conditions.push(eq(transactions.status, status as string));
    }

    if (paymentMethod && paymentMethod !== 'all') {
      conditions.push(eq(transactions.paymentMethod, paymentMethod as string));
    }

    if (userId) {
      conditions.push(eq(transactions.userId, parseInt(userId as string)));
    }

    if (dateFrom) {
      conditions.push(gte(transactions.createdAt, new Date(dateFrom as string)));
    }

    if (dateTo) {
      const endDate = new Date(dateTo as string);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(transactions.createdAt, endDate));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Tüm işlemleri getir (limit yok)
    const transactionsList = await db
      .select({
        id: transactions.id,
        transactionId: transactions.transactionId,
        userId: transactions.userId,
        username: users.username,
        email: users.email,
        type: transactions.type,
        amount: transactions.amount,
        currency: transactions.currency,
        status: transactions.status,
        description: transactions.description,
        method: transactions.method,
        paymentMethod: transactions.paymentMethod,
        referenceId: transactions.referenceId,
        balanceBefore: transactions.balanceBefore,
        balanceAfter: transactions.balanceAfter,
        processedAt: transactions.processedAt,
        createdAt: transactions.createdAt
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(whereClause)
      .orderBy(desc(transactions.createdAt));

    if (format === 'csv') {
      // CSV formatında dışa aktar
      const csvHeaders = [
        'ID', 'İşlem ID', 'Kullanıcı ID', 'Kullanıcı Adı', 'E-posta', 'Tür', 'Tutar', 
        'Para Birimi', 'Durum', 'Açıklama', 'Yöntem', 'Ödeme Yöntemi', 'Referans ID',
        'Önceki Bakiye', 'Sonraki Bakiye', 'İşlenme Tarihi', 'Oluşturma Tarihi'
      ];
      
      const csvRows = transactionsList.map(transaction => [
        transaction.id,
        transaction.transactionId || '',
        transaction.userId,
        transaction.username || '',
        transaction.email || '',
        transaction.type,
        transaction.amount,
        transaction.currency || 'TRY',
        transaction.status,
        `"${(transaction.description || '').replace(/"/g, '""')}"`,
        transaction.method || '',
        transaction.paymentMethod || '',
        transaction.referenceId || '',
        transaction.balanceBefore || '',
        transaction.balanceAfter || '',
        transaction.processedAt?.toISOString() || '',
        transaction.createdAt?.toISOString() || ''
      ]);

      const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\uFEFF' + csvContent); // UTF-8 BOM for Turkish characters
    } else {
      // JSON formatında dışa aktar
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="transactions-${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        exportDate: new Date().toISOString(),
        totalRecords: transactionsList.length,
        transactions: transactionsList
      });
    }

    console.log(`✅ TRANSACTION EXPORT: Successfully exported ${transactionsList.length} transactions as ${format}`);

  } catch (error) {
    console.error('❌ TRANSACTION EXPORT ERROR:', error);
    res.status(500).json({ 
      error: 'İşlem dışa aktarma işlemi başarısız',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// CSV/Excel Export endpoint (Admin Only)
router.get('/export', async (req, res) => {
  try {
    const {
      format = 'csv',
      search = '',
      type = '',
      status = '',
      from = '',
      to = ''
    } = req.query;

    console.log(`📊 TRANSACTIONS EXPORT: Exporting ${format} format`);

    // Filtre koşulları oluştur
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(transactions.transactionId, `%${search}%`),
          like(transactions.description, `%${search}%`),
          like(users.username, `%${search}%`)
        )
      );
    }

    if (type && type !== 'all') {
      conditions.push(eq(transactions.type, type as string));
    }

    if (status && status !== 'all') {
      conditions.push(eq(transactions.status, status as string));
    }

    if (from) {
      conditions.push(gte(transactions.createdAt, new Date(from as string)));
    }

    if (to) {
      conditions.push(lte(transactions.createdAt, new Date(to as string)));
    }

    // Verileri getir
    const transactionsList = await db
      .select({
        id: transactions.id,
        transactionId: transactions.transactionId,
        userId: transactions.userId,
        username: users.username,
        type: transactions.type,
        amount: transactions.amount,
        currency: transactions.currency,
        status: transactions.status,
        paymentMethod: transactions.paymentMethod,
        description: transactions.description,
        balanceBefore: transactions.balanceBefore,
        balanceAfter: transactions.balanceAfter,
        createdAt: transactions.createdAt,
        processedAt: transactions.processedAt
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(transactions.createdAt))
      .limit(10000); // Maksimum 10k kayıt

    if (format === 'csv') {
      // CSV formatında döndür
      const csvHeaders = [
        'ID',
        'İşlem ID',
        'Kullanıcı ID',
        'Kullanıcı Adı',
        'Tür',
        'Miktar',
        'Para Birimi',
        'Durum',
        'Ödeme Yöntemi',
        'Açıklama',
        'Önceki Bakiye',
        'Sonraki Bakiye',
        'Oluşturulma Tarihi',
        'İşlenme Tarihi'
      ].join(',');

      const csvRows = transactionsList.map(t => [
        t.id,
        t.transactionId,
        t.userId,
        t.username || '',
        t.type,
        t.amount,
        t.currency,
        t.status,
        t.paymentMethod || '',
        `"${(t.description || '').replace(/"/g, '""')}"`,
        t.balanceBefore || '',
        t.balanceAfter || '',
        t.createdAt ? t.createdAt.toISOString() : '',
        t.processedAt?.toISOString() || ''
      ].join(','));

      const csvContent = [csvHeaders, ...csvRows].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\uFEFF' + csvContent); // BOM for Excel compatibility
    } else {
      // JSON formatında döndür (Excel için)
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="transactions_${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        exportDate: new Date().toISOString(),
        totalRecords: transactionsList.length,
        data: transactionsList
      });
    }

    console.log(`✅ TRANSACTIONS EXPORT: ${transactionsList.length} records exported`);

  } catch (error) {
    console.error('❌ TRANSACTIONS EXPORT ERROR:', error);
    res.status(500).json({ 
      error: 'Dışa aktarma başarısız',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

export default router;