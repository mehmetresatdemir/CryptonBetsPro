import { Router } from 'express';
import { eq, desc, and, like, count, asc, or, sql, gte, lte, inArray } from 'drizzle-orm';
import { db } from '../db';
import { users, transactions, userLogs } from '../../shared/schema';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// Para yatırma işlemlerini getir (Admin Only)
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      status = '',
      paymentMethod = '',
      dateFrom = '',
      dateTo = '',
      userId = '',
      sortBy = 'created_at',
      sortOrder = 'desc',
      amountMin = '',
      amountMax = ''
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    console.log(`🔍 DEPOSITS API: Fetching deposits - Page: ${pageNum}, Limit: ${limitNum}`);

    // Filtre koşulları oluştur
    const conditions = [eq(transactions.type, 'deposit')];

    if (search) {
      conditions.push(
        or(
          like(transactions.transactionId, `%${search}%`),
          like(transactions.description, `%${search}%`),
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`),
          like(transactions.referenceId, `%${search}%`)
        )
      );
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

    if (amountMin) {
      conditions.push(sql`${transactions.amount} >= ${parseFloat(amountMin as string)}`);
    }

    if (amountMax) {
      conditions.push(sql`${transactions.amount} <= ${parseFloat(amountMax as string)}`);
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
    let orderByColumn;
    
    switch (sortBy) {
      case 'amount':
        orderByColumn = transactions.amount;
        break;
      case 'status':
        orderByColumn = transactions.status;
        break;
      case 'payment_method':
        orderByColumn = transactions.paymentMethod;
        break;
      case 'processed_at':
        orderByColumn = transactions.processedAt;
        break;
      case 'username':
        orderByColumn = users.username;
        break;
      default:
        orderByColumn = transactions.createdAt;
    }

    // Para yatırma işlemlerini getir
    const depositsList = await db
      .select({
        id: transactions.id,
        transactionId: transactions.transactionId,
        userId: transactions.userId,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        vipLevel: users.vipLevel,
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
        rejectionReason: transactions.rejectionReason,
        reviewedBy: transactions.reviewedBy,
        processedAt: transactions.processedAt,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(whereClause)
      .orderBy(orderByFn(orderByColumn))
      .limit(limitNum)
      .offset(offset);

    console.log(`📊 DEPOSITS DATA COLLECTED: ${depositsList.length} deposits found out of ${total} total`);

    res.json({
      deposits: depositsList,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });

  } catch (error) {
    console.error('❌ DEPOSITS ERROR:', error);
    res.status(500).json({ 
      error: 'Para yatırma işlemleri alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Para yatırma detayını getir (Admin Only)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🔍 DEPOSIT DETAIL: Fetching deposit ${id}`);

    const deposit = await db
      .select({
        id: transactions.id,
        transactionId: transactions.transactionId,
        userId: transactions.userId,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        fullName: users.fullName,
        phone: users.phone,
        vipLevel: users.vipLevel,
        balance: users.balance,
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
        rejectionReason: transactions.rejectionReason,
        reviewedBy: transactions.reviewedBy,
        processedAt: transactions.processedAt,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(and(eq(transactions.id, parseInt(id)), eq(transactions.type, 'deposit')))
      .limit(1);

    if (!deposit[0]) {
      return res.status(404).json({ error: 'Para yatırma işlemi bulunamadı' });
    }

    // Kullanıcının son para yatırma işlemlerini getir
    const userRecentDeposits = await db
      .select({
        id: transactions.id,
        amount: transactions.amount,
        status: transactions.status,
        paymentMethod: transactions.paymentMethod,
        createdAt: transactions.createdAt
      })
      .from(transactions)
      .where(and(
        eq(transactions.userId, deposit[0].userId),
        eq(transactions.type, 'deposit')
      ))
      .orderBy(desc(transactions.createdAt))
      .limit(10);

    // Kullanıcının işlem geçmişi özeti
    const userTransactionSummary = await db
      .select({
        totalDeposits: sql<number>`COALESCE(SUM(CASE WHEN type = 'deposit' AND status IN ('approved', 'completed') THEN amount ELSE 0 END), 0)`,
        totalWithdrawals: sql<number>`COALESCE(SUM(CASE WHEN type = 'withdrawal' AND status IN ('approved', 'completed') THEN amount ELSE 0 END), 0)`,
        pendingDeposits: sql<number>`COALESCE(SUM(CASE WHEN type = 'deposit' AND status = 'pending' THEN amount ELSE 0 END), 0)`,
        depositCount: sql<number>`COUNT(CASE WHEN type = 'deposit' THEN 1 END)`,
        lastDepositDate: sql<string>`MAX(CASE WHEN type = 'deposit' THEN created_at END)`
      })
      .from(transactions)
      .where(eq(transactions.userId, deposit[0].userId));

    res.json({
      deposit: deposit[0],
      userRecentDeposits,
      userTransactionSummary: userTransactionSummary[0]
    });

  } catch (error) {
    console.error('❌ DEPOSIT DETAIL ERROR:', error);
    res.status(500).json({ 
      error: 'Para yatırma detayı alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Para yatırma durumunu güncelle (Admin Only)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, rejectionReason, reviewedBy, adminNotes } = req.body;

    console.log(`🔄 DEPOSIT STATUS UPDATE: Updating deposit ${id} to ${status}`);

    const validStatuses = ['pending', 'approved', 'rejected', 'processing', 'completed', 'failed'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Geçersiz durum değeri' });
    }

    // Mevcut işlemi getir
    const existingDeposit = await db
      .select()
      .from(transactions)
      .where(and(eq(transactions.id, parseInt(id)), eq(transactions.type, 'deposit')))
      .limit(1);

    if (!existingDeposit[0]) {
      return res.status(404).json({ error: 'Para yatırma işlemi bulunamadı' });
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
      
      // Kullanıcı bakiyesini güncelle
      if (existingDeposit[0].status === 'pending') {
        await db
          .update(users)
          .set({
            balance: sql`balance + ${existingDeposit[0].amount}`,
            totalDeposits: sql`total_deposits + ${existingDeposit[0].amount}`
          })
          .where(eq(users.id, existingDeposit[0].userId));

        // Bakiye değişikliğini güncelle
        const userAfterUpdate = await db
          .select({ balance: users.balance })
          .from(users)
          .where(eq(users.id, existingDeposit[0].userId))
          .limit(1);

        updateData.balanceBefore = existingDeposit[0].balanceBefore || userAfterUpdate[0].balance - existingDeposit[0].amount;
        updateData.balanceAfter = userAfterUpdate[0].balance;
      }
    }

    const updatedDeposit = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, parseInt(id)))
      .returning();

    if (!updatedDeposit[0]) {
      return res.status(404).json({ error: 'Para yatırma işlemi bulunamadı' });
    }

    // Kullanıcı logu ekle
    await db
      .insert(userLogs)
      .values({
        userId: existingDeposit[0].userId,
        action: `deposit_${status}`,
        details: `Para yatırma işlemi ${status} durumuna güncellendi. Tutar: ${existingDeposit[0].amount} TRY`,
        ipAddress: req.ip || 'Unknown',
        userAgent: req.get('User-Agent') || 'Unknown',
        createdAt: new Date()
      });

    console.log(`✅ DEPOSIT STATUS UPDATED: Deposit ${id} updated to ${status}`);

    res.json({
      success: true,
      deposit: updatedDeposit[0],
      message: 'Para yatırma durumu güncellendi'
    });

  } catch (error) {
    console.error('❌ DEPOSIT STATUS UPDATE ERROR:', error);
    res.status(500).json({ 
      error: 'Para yatırma durumu güncellenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Toplu para yatırma durumu güncelleme (Admin Only)
router.patch('/bulk/status', async (req, res) => {
  try {
    const { depositIds, status, rejectionReason, reviewedBy } = req.body;

    if (!Array.isArray(depositIds) || depositIds.length === 0) {
      return res.status(400).json({ error: 'Para yatırma ID\'leri gerekli' });
    }

    console.log(`🔄 BULK DEPOSIT UPDATE: Updating ${depositIds.length} deposits to ${status}`);

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

    const updatedDeposits = await db
      .update(transactions)
      .set(updateData)
      .where(and(
        inArray(transactions.id, depositIds),
        eq(transactions.type, 'deposit')
      ))
      .returning();

    // Onaylanan işlemler için bakiye güncellemeleri
    if (status === 'approved' || status === 'completed') {
      for (const deposit of updatedDeposits) {
        await db
          .update(users)
          .set({
            balance: sql`balance + ${deposit.amount}`,
            totalDeposits: sql`total_deposits + ${deposit.amount}`
          })
          .where(eq(users.id, deposit.userId));

        // Kullanıcı logu ekle
        await db
          .insert(userLogs)
          .values({
            userId: deposit.userId,
            action: `deposit_${status}`,
            details: `Para yatırma işlemi ${status} durumuna güncellendi. Tutar: ${deposit.amount} TRY`,
            ipAddress: req.ip || 'Unknown',
            userAgent: req.get('User-Agent') || 'Unknown',
            createdAt: new Date()
          });
      }
    }

    console.log(`✅ BULK DEPOSIT UPDATE: ${updatedDeposits.length} deposits updated`);

    res.json({
      success: true,
      updatedCount: updatedDeposits.length,
      message: `${updatedDeposits.length} para yatırma işlemi güncellendi`
    });

  } catch (error) {
    console.error('❌ BULK DEPOSIT UPDATE ERROR:', error);
    res.status(500).json({ 
      error: 'Toplu para yatırma güncellenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Para yatırma istatistikleri (Admin Only)
router.get('/stats/summary', async (req, res) => {
  try {
    const { dateFrom, dateTo, paymentMethod } = req.query;

    console.log(`📊 DEPOSIT STATS: Generating statistics`);

    const conditions = [eq(transactions.type, 'deposit')];

    if (dateFrom) {
      conditions.push(gte(transactions.createdAt, new Date(dateFrom as string)));
    }

    if (dateTo) {
      const endDate = new Date(dateTo as string);
      endDate.setHours(23, 59, 59, 999);
      conditions.push(lte(transactions.createdAt, endDate));
    }

    if (paymentMethod && paymentMethod !== 'all') {
      conditions.push(eq(transactions.paymentMethod, paymentMethod as string));
    }

    const whereClause = and(...conditions);

    // Durum bazlı istatistikler
    const statusStats = await db
      .select({
        status: transactions.status,
        count: count(),
        totalAmount: sql<number>`COALESCE(SUM(amount), 0)`,
        avgAmount: sql<number>`COALESCE(AVG(amount), 0)`,
        minAmount: sql<number>`COALESCE(MIN(amount), 0)`,
        maxAmount: sql<number>`COALESCE(MAX(amount), 0)`
      })
      .from(transactions)
      .where(whereClause)
      .groupBy(transactions.status);

    // Ödeme yöntemi bazlı istatistikler
    const paymentMethodStats = await db
      .select({
        paymentMethod: transactions.paymentMethod,
        count: count(),
        totalAmount: sql<number>`COALESCE(SUM(amount), 0)`,
        avgAmount: sql<number>`COALESCE(AVG(amount), 0)`
      })
      .from(transactions)
      .where(whereClause)
      .groupBy(transactions.paymentMethod);

    // Günlük istatistikler (son 30 gün)
    const dailyStats = await db
      .select({
        date: sql<string>`DATE(created_at)`,
        count: count(),
        totalAmount: sql<number>`COALESCE(SUM(amount), 0)`,
        approvedCount: sql<number>`COUNT(CASE WHEN status IN ('approved', 'completed') THEN 1 END)`,
        pendingCount: sql<number>`COUNT(CASE WHEN status = 'pending' THEN 1 END)`,
        rejectedCount: sql<number>`COUNT(CASE WHEN status = 'rejected' THEN 1 END)`
      })
      .from(transactions)
      .where(and(whereClause, gte(transactions.createdAt, sql`NOW() - INTERVAL '30 days'`)))
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at) DESC`)
      .limit(30);

    // VIP seviye bazlı istatistikler
    const vipStats = await db
      .select({
        vipLevel: users.vipLevel,
        count: count(),
        totalAmount: sql<number>`COALESCE(SUM(${transactions.amount}), 0)`,
        avgAmount: sql<number>`COALESCE(AVG(${transactions.amount}), 0)`
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(whereClause)
      .groupBy(users.vipLevel)
      .orderBy(asc(users.vipLevel));

    // Genel özet
    const summary = await db
      .select({
        totalDeposits: count(),
        totalAmount: sql<number>`COALESCE(SUM(amount), 0)`,
        avgAmount: sql<number>`COALESCE(AVG(amount), 0)`,
        minAmount: sql<number>`COALESCE(MIN(amount), 0)`,
        maxAmount: sql<number>`COALESCE(MAX(amount), 0)`,
        approvedAmount: sql<number>`COALESCE(SUM(CASE WHEN status IN ('approved', 'completed') THEN amount ELSE 0 END), 0)`,
        pendingAmount: sql<number>`COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0)`,
        rejectedAmount: sql<number>`COALESCE(SUM(CASE WHEN status = 'rejected' THEN amount ELSE 0 END), 0)`,
        uniqueUsers: sql<number>`COUNT(DISTINCT user_id)`
      })
      .from(transactions)
      .where(whereClause);

    // Saatlik dağılım
    const hourlyStats = await db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM created_at)`,
        count: count(),
        totalAmount: sql<number>`COALESCE(SUM(amount), 0)`
      })
      .from(transactions)
      .where(whereClause)
      .groupBy(sql`EXTRACT(HOUR FROM created_at)`)
      .orderBy(sql`EXTRACT(HOUR FROM created_at)`);

    console.log(`✅ DEPOSIT STATS: Statistics generated successfully`);

    res.json({
      summary: summary[0],
      statusStats,
      paymentMethodStats,
      dailyStats,
      vipStats,
      hourlyStats,
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ DEPOSIT STATS ERROR:', error);
    res.status(500).json({ 
      error: 'Para yatırma istatistikleri alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Para yatırma işlemlerini dışa aktar (Admin Only)
router.get('/export/data', async (req, res) => {
  try {
    const {
      format = 'csv',
      search = '',
      status = '',
      paymentMethod = '',
      dateFrom = '',
      dateTo = '',
      userId = ''
    } = req.query;

    console.log(`📤 DEPOSIT EXPORT: Format: ${format}`);

    // Filtre koşulları oluştur
    const conditions = [eq(transactions.type, 'deposit')];

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

    const whereClause = and(...conditions);

    // Tüm para yatırma işlemlerini getir
    const depositsList = await db
      .select({
        id: transactions.id,
        transactionId: transactions.transactionId,
        userId: transactions.userId,
        username: users.username,
        email: users.email,
        amount: transactions.amount,
        currency: transactions.currency,
        status: transactions.status,
        description: transactions.description,
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
        'ID', 'İşlem ID', 'Kullanıcı ID', 'Kullanıcı Adı', 'E-posta', 'Tutar', 
        'Para Birimi', 'Durum', 'Açıklama', 'Ödeme Yöntemi', 'Referans ID',
        'Önceki Bakiye', 'Sonraki Bakiye', 'İşlenme Tarihi', 'Oluşturma Tarihi'
      ];
      
      const csvRows = depositsList.map(deposit => [
        deposit.id,
        deposit.transactionId || '',
        deposit.userId,
        deposit.username || '',
        deposit.email || '',
        deposit.amount,
        deposit.currency || 'TRY',
        deposit.status,
        `"${(deposit.description || '').replace(/"/g, '""')}"`,
        deposit.paymentMethod || '',
        deposit.referenceId || '',
        deposit.balanceBefore || '',
        deposit.balanceAfter || '',
        deposit.processedAt?.toISOString() || '',
        deposit.createdAt?.toISOString() || ''
      ]);

      const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="deposits-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\uFEFF' + csvContent); // UTF-8 BOM for Turkish characters
    } else {
      // JSON formatında dışa aktar
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="deposits-${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        exportDate: new Date().toISOString(),
        totalRecords: depositsList.length,
        deposits: depositsList
      });
    }

    console.log(`✅ DEPOSIT EXPORT: Successfully exported ${depositsList.length} deposits as ${format}`);

  } catch (error) {
    console.error('❌ DEPOSIT EXPORT ERROR:', error);
    res.status(500).json({ 
      error: 'Para yatırma dışa aktarma işlemi başarısız',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Manuel para yatırma ekle (Admin Only)
router.post('/manual', async (req, res) => {
  try {
    const { 
      userId, 
      amount, 
      paymentMethod, 
      description, 
      referenceId,
      status = 'approved',
      adminNotes 
    } = req.body;

    console.log(`➕ MANUAL DEPOSIT: Adding manual deposit for user ${userId}`);

    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Kullanıcı ID ve geçerli tutar gerekli' });
    }

    // Kullanıcıyı kontrol et
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!user[0]) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    const transactionId = `DEP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Bakiye bilgilerini hazırla
    const balanceBefore = user[0].balance || 0;
    const balanceAfter = status === 'approved' ? balanceBefore + amount : balanceBefore;

    // Para yatırma işlemi ekle
    const newDeposit = await db
      .insert(transactions)
      .values({
        transactionId,
        userId,
        type: 'deposit',
        amount,
        currency: 'TRY',
        status,
        description: description || `Manuel para yatırma - ${paymentMethod}`,
        paymentMethod: paymentMethod || 'Manual',
        referenceId,
        balanceBefore,
        balanceAfter: status === 'approved' ? balanceAfter : null,
        processedAt: status === 'approved' ? new Date() : null,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();

    // Onaylanmış işlem için kullanıcı bakiyesini güncelle
    if (status === 'approved') {
      await db
        .update(users)
        .set({
          balance: balanceAfter,
          totalDeposits: sql`total_deposits + ${amount}`
        })
        .where(eq(users.id, userId));
    }

    // Kullanıcı logu ekle
    await db
      .insert(userLogs)
      .values({
        userId,
        action: 'manual_deposit_created',
        category: 'deposit', // DÜZELTME: Eksik olan category alanı eklendi
        description: `Manuel para yatırma eklendi. Tutar: ${amount} TRY, Durum: ${status}`,
        ipAddress: req.ip || 'Unknown',
        userAgent: req.get('User-Agent') || 'Unknown',
        metadata: { amount, status, paymentMethod, referenceId }, // Ek bilgiler
        severity: 'low',
        status: 'success',
        createdAt: new Date()
      });

    console.log(`✅ MANUAL DEPOSIT: Successfully created deposit ${newDeposit[0].id}`);

    res.json({
      success: true,
      deposit: newDeposit[0],
      message: 'Manuel para yatırma işlemi oluşturuldu'
    });

  } catch (error) {
    console.error('❌ MANUAL DEPOSIT ERROR:', error);
    res.status(500).json({ 
      error: 'Manuel para yatırma eklenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

export default router;