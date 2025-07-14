import { Router } from 'express';
import { eq, desc, and, like, count, or, sql, gte, lte } from 'drizzle-orm';
import { db } from '../db';
import { transactions, users } from '../../shared/schema';
import { requireAdminAuth } from '../utils/auth';

const router = Router();

// Tüm rotalar admin yetkilendirmesi gerektirir
router.use(requireAdminAuth);

// Transaction istatistikleri
router.get('/stats', async (req, res) => {
  try {
    console.log('📊 TRANSACTION STATS: Generating transaction statistics');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Temel transaction istatistikleri
    const basicStats = await db
      .select({
        totalTransactions: count(),
        totalVolume: sql<number>`COALESCE(SUM(amount), 0)`,
        totalDeposits: sql<number>`COALESCE(SUM(CASE WHEN type = 'deposit' THEN amount ELSE 0 END), 0)`,
        totalWithdrawals: sql<number>`COALESCE(SUM(CASE WHEN type = 'withdrawal' THEN amount ELSE 0 END), 0)`,
        pendingCount: sql<number>`COUNT(CASE WHEN status = 'pending' THEN 1 END)`,
        todayTransactions: sql<number>`COUNT(CASE WHEN created_at >= ${today} THEN 1 END)`,
        todayVolume: sql<number>`COALESCE(SUM(CASE WHEN created_at >= ${today} THEN amount ELSE 0 END), 0)`,
        averageAmount: sql<number>`COALESCE(AVG(amount), 0)`
      })
      .from(transactions);

    const stats = basicStats[0];

    console.log('✅ TRANSACTION STATS: Statistics generated successfully');

    res.json({
      totalTransactions: stats.totalTransactions,
      totalVolume: Number(stats.totalVolume),
      totalDeposits: Number(stats.totalDeposits),
      totalWithdrawals: Number(stats.totalWithdrawals),
      pendingCount: stats.pendingCount,
      todayTransactions: stats.todayTransactions,
      todayVolume: Number(stats.todayVolume),
      averageAmount: Number(stats.averageAmount)
    });

  } catch (error) {
    console.error('❌ TRANSACTION STATS ERROR:', error);
    res.status(500).json({ 
      error: 'Transaction istatistikleri alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Transaction listesi
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      type = 'all',
      status = 'all',
      paymentMethod = 'all',
      dateFrom = '',
      dateTo = ''
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    console.log(`🔍 TRANSACTIONS: Fetching transactions - Page: ${pageNum}, Type: ${type}, Status: ${status}`);

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
          or(...userIds.map(user => eq(transactions.userId, user.id)))
        );
      } else {
        // Hiç kullanıcı bulunamadıysa boş sonuç döndür
        return res.json({
          transactions: [],
          total: 0,
          page: pageNum,
          limit: limitNum,
          totalPages: 0
        });
      }
    }

    if (type !== 'all') {
      conditions.push(eq(transactions.type, type as string));
    }

    if (status !== 'all') {
      conditions.push(eq(transactions.status, status as string));
    }

    if (paymentMethod !== 'all') {
      conditions.push(eq(transactions.paymentMethod, paymentMethod as string));
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
      .where(whereClause);

    const total = totalResult[0].count;

    // Transaction listesi ve kullanıcı bilgileri
    const transactionList = await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        username: users.username,
        type: transactions.type,
        amount: transactions.amount,
        currency: transactions.currency,
        status: transactions.status,
        paymentMethod: transactions.paymentMethod,
        transactionHash: transactions.transactionHash,
        description: transactions.description,
        createdAt: transactions.createdAt,
        processedAt: transactions.processedAt,
        notes: transactions.notes,
        fees: transactions.fees,
        exchangeRate: transactions.exchangeRate
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(whereClause)
      .orderBy(desc(transactions.createdAt))
      .limit(limitNum)
      .offset(offset);

    console.log(`📋 TRANSACTIONS: Found ${transactionList.length} transactions out of ${total} total`);

    res.json({
      transactions: transactionList,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum)
    });

  } catch (error) {
    console.error('❌ TRANSACTIONS ERROR:', error);
    res.status(500).json({ 
      error: 'Transaction listesi alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Transaction işleme
router.post('/:id/process', async (req, res) => {
  try {
    const { id } = req.params;
    const { action, notes } = req.body;
    const adminUser = req.user;

    if (!action || !['approve', 'reject', 'process', 'cancel'].includes(action)) {
      return res.status(400).json({ error: 'Geçersiz işlem' });
    }

    console.log(`🔍 TRANSACTION PROCESS: Processing transaction ${id} - Action: ${action}`);

    // Transaction'ı kontrol et
    const transaction = await db
      .select()
      .from(transactions)
      .where(eq(transactions.id, parseInt(id)))
      .limit(1);

    if (!transaction[0]) {
      return res.status(404).json({ error: 'Transaction bulunamadı' });
    }

    if (transaction[0].status === 'completed') {
      return res.status(400).json({ error: 'Bu transaction zaten tamamlanmış' });
    }

    if (transaction[0].status === 'cancelled') {
      return res.status(400).json({ error: 'Bu transaction iptal edilmiş' });
    }

    // Transaction'ı güncelle
    const updateData: any = {
      processedAt: new Date(),
      notes: notes?.trim() || null
    };

    switch (action) {
      case 'approve':
      case 'process':
        updateData.status = 'completed';
        
        // Eğer deposit ise kullanıcı bakiyesini artır
        if (transaction[0].type === 'deposit') {
          await db
            .update(users)
            .set({
              balance: sql`balance + ${transaction[0].amount}`,
              totalDeposits: sql`total_deposits + ${transaction[0].amount}`
            })
            .where(eq(users.id, transaction[0].userId));
        }
        
        // Eğer withdrawal ise kullanıcı bakiyesini azalt
        if (transaction[0].type === 'withdrawal') {
          await db
            .update(users)
            .set({
              balance: sql`balance - ${transaction[0].amount}`,
              totalWithdrawals: sql`total_withdrawals + ${transaction[0].amount}`
            })
            .where(eq(users.id, transaction[0].userId));
        }
        break;
        
      case 'reject':
        updateData.status = 'failed';
        updateData.notes = notes?.trim() || 'Admin tarafından reddedildi';
        break;
        
      case 'cancel':
        updateData.status = 'cancelled';
        updateData.notes = notes?.trim() || 'Admin tarafından iptal edildi';
        break;
    }

    const updatedTransaction = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, parseInt(id)))
      .returning();

    console.log(`✅ TRANSACTION PROCESS: Transaction ${id} ${action}ed successfully`);

    res.json({
      success: true,
      transaction: updatedTransaction[0],
      message: `Transaction başarıyla ${action === 'approve' || action === 'process' ? 'onaylandı' : 
        action === 'reject' ? 'reddedildi' : 'iptal edildi'}`
    });

  } catch (error) {
    console.error('❌ TRANSACTION PROCESS ERROR:', error);
    res.status(500).json({ 
      error: 'Transaction işlenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Kullanıcının transaction geçmişi
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = '1', limit = '10' } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    console.log(`🔍 USER TRANSACTIONS: Fetching transactions for user ${userId}`);

    // Kullanıcının transaction'ları
    const userTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, parseInt(userId)))
      .orderBy(desc(transactions.createdAt))
      .limit(limitNum)
      .offset(offset);

    // Toplam sayı
    const totalResult = await db
      .select({ count: count() })
      .from(transactions)
      .where(eq(transactions.userId, parseInt(userId)));

    const total = totalResult[0].count;

    // Kullanıcı istatistikleri
    const userStats = await db
      .select({
        totalDeposits: sql<number>`COALESCE(SUM(CASE WHEN type = 'deposit' AND status = 'completed' THEN amount ELSE 0 END), 0)`,
        totalWithdrawals: sql<number>`COALESCE(SUM(CASE WHEN type = 'withdrawal' AND status = 'completed' THEN amount ELSE 0 END), 0)`,
        totalTransactions: count(),
        pendingTransactions: sql<number>`COUNT(CASE WHEN status = 'pending' THEN 1 END)`
      })
      .from(transactions)
      .where(eq(transactions.userId, parseInt(userId)));

    console.log(`📊 USER TRANSACTIONS: Found ${userTransactions.length} transactions for user ${userId}`);

    res.json({
      transactions: userTransactions,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(total / limitNum),
      stats: userStats[0]
    });

  } catch (error) {
    console.error('❌ USER TRANSACTIONS ERROR:', error);
    res.status(500).json({ 
      error: 'Kullanıcı transaction geçmişi alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Toplu transaction işlemleri
router.post('/bulk-action', async (req, res) => {
  try {
    const { transactionIds, action, notes } = req.body;
    const adminUser = req.user;

    if (!transactionIds || !Array.isArray(transactionIds) || transactionIds.length === 0) {
      return res.status(400).json({ error: 'Transaction ID\'leri gerekli' });
    }

    if (!action || !['approve', 'reject', 'cancel'].includes(action)) {
      return res.status(400).json({ error: 'Geçersiz işlem' });
    }

    console.log(`🔍 BULK TRANSACTION ACTION: Processing ${transactionIds.length} transactions - Action: ${action}`);

    // Sadece işlenebilir durumundaki transaction'ları işle
    const processableTransactions = await db
      .select()
      .from(transactions)
      .where(
        and(
          sql`id = ANY(${transactionIds})`,
          or(
            eq(transactions.status, 'pending'),
            eq(transactions.status, 'processing')
          )
        )
      );

    if (processableTransactions.length === 0) {
      return res.status(400).json({ error: 'İşlenebilir transaction bulunamadı' });
    }

    // Toplu güncelleme
    const updateData: any = {
      processedAt: new Date(),
      notes: notes?.trim() || null
    };

    switch (action) {
      case 'approve':
        updateData.status = 'completed';
        break;
      case 'reject':
        updateData.status = 'failed';
        updateData.notes = notes?.trim() || 'Toplu red işlemi';
        break;
      case 'cancel':
        updateData.status = 'cancelled';
        updateData.notes = notes?.trim() || 'Toplu iptal işlemi';
        break;
    }

    const updatedTransactions = await db
      .update(transactions)
      .set(updateData)
      .where(
        and(
          sql`id = ANY(${processableTransactions.map(t => t.id)})`,
          or(
            eq(transactions.status, 'pending'),
            eq(transactions.status, 'processing')
          )
        )
      )
      .returning();

    // Eğer onay işlemi ise kullanıcı bakiyelerini güncelle
    if (action === 'approve') {
      for (const transaction of processableTransactions) {
        if (transaction.type === 'deposit') {
          await db
            .update(users)
            .set({
              balance: sql`balance + ${transaction.amount}`,
              totalDeposits: sql`total_deposits + ${transaction.amount}`
            })
            .where(eq(users.id, transaction.userId));
        } else if (transaction.type === 'withdrawal') {
          await db
            .update(users)
            .set({
              balance: sql`balance - ${transaction.amount}`,
              totalWithdrawals: sql`total_withdrawals + ${transaction.amount}`
            })
            .where(eq(users.id, transaction.userId));
        }
      }
    }

    console.log(`✅ BULK TRANSACTION ACTION: ${updatedTransactions.length} transactions processed successfully`);

    res.json({
      success: true,
      processedCount: updatedTransactions.length,
      transactions: updatedTransactions,
      message: `${updatedTransactions.length} transaction başarıyla ${action === 'approve' ? 'onaylandı' : 
        action === 'reject' ? 'reddedildi' : 'iptal edildi'}`
    });

  } catch (error) {
    console.error('❌ BULK TRANSACTION ACTION ERROR:', error);
    res.status(500).json({ 
      error: 'Toplu transaction işlemi yapılamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

export default router;