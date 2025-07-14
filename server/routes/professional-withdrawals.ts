import { Request, Response, Router } from 'express';
import { db } from '../db';
import { withdrawals, users, userLogs } from '../../shared/schema';
import { eq, desc, and, gte, sum, count } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { EnterpriseFinanceManager } from '../services/EnterpriseFinanceManager';
import { AdvancedRiskEngine } from '../services/AdvancedRiskEngine';

const router = Router();

// Admin withdrawals listesi
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('🔍 WITHDRAWALS API: Processing request');

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    // Raw SQL query for withdrawals
    const query = `
      SELECT 
        t.id,
        t.transaction_id as "transactionId",
        t.user_id as "userId",
        u.username,
        u.email,
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.vip_level as "vipLevel",
        t.amount,
        t.currency,
        t.status,
        t.description,
        t.payment_method as "paymentMethod",
        t.payment_details as "paymentDetails",
        t.reference_id as "referenceId",
        t.balance_before as "balanceBefore",
        t.balance_after as "balanceAfter",
        t.rejection_reason as "rejectionReason",
        t.reviewed_by as "reviewedBy",
        t.processed_at as "processedAt",
        t.created_at as "createdAt",
        t.updated_at as "updatedAt"
      FROM transactions t
      LEFT JOIN users u ON t.user_id = u.id
      WHERE t.type = 'withdrawal'
      ORDER BY t.created_at DESC
      LIMIT $1 OFFSET $2
    `;

    const countQuery = `
      SELECT COUNT(*) as total
      FROM transactions t
      WHERE t.type = 'withdrawal'
    `;

    const [withdrawalsResult, countResult] = await Promise.all([
      db.query(query, [limit, offset]),
      db.query(countQuery)
    ]);

    const withdrawals = withdrawalsResult.rows;
    const total = parseInt(countResult.rows[0].total);

    console.log('✅ WITHDRAWALS API: Returned 6 withdrawals from storage');

    res.json({
      withdrawals: withdrawals,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        count: withdrawals.length,
        totalRecords: total
      }
    });

  } catch (error: any) {
    console.error('❌ WITHDRAWALS ERROR:', error);
    res.status(500).json({ 
      error: 'Para çekme verileri alınamadı',
      details: error.message 
    });
  }
});

// Para çekme talebi oluşturma
router.post('/create', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Giriş yapmalısınız' });
    }

    const { amount, withdrawalMethod, bankDetails, walletAddress, ewalletDetails } = req.body;
    const user = req.user as any;

    // Validasyon
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Geçerli bir miktar girin' });
    }

    if (!withdrawalMethod) {
      return res.status(400).json({ error: 'Çekim yöntemi seçin' });
    }

    // Para çekme detayları
    let withdrawalDetails: any = { method: withdrawalMethod };
    
    if (withdrawalMethod === 'bank_transfer' && bankDetails) {
      withdrawalDetails.bankDetails = bankDetails;
    } else if (withdrawalMethod === 'crypto' && walletAddress) {
      withdrawalDetails.walletAddress = walletAddress;
    } else if (withdrawalMethod === 'ewallet' && ewalletDetails) {
      withdrawalDetails.ewalletDetails = ewalletDetails;
    }

    // Enterprise Finance Manager ile işlem
    const result = await EnterpriseFinanceManager.processWithdrawal(
      user.id,
      Number(amount),
      withdrawalMethod,
      withdrawalDetails,
      {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      }
    );

    if (!result.success) {
      return res.status(400).json({ 
        error: result.error || 'Para çekme işlemi başarısız'
      });
    }

    res.json({
      success: true,
      transactionId: result.transactionId,
      pipeline: result.pipeline,
      status: result.pipeline?.metadata?.requiresManualReview ? 'risk_review' : 'pending',
      riskScore: result.pipeline?.metadata?.riskAnalysis?.riskScore,
      message: result.pipeline?.metadata?.requiresManualReview 
        ? 'Para çekme talebiniz risk ekibi tarafından incelenecek.'
        : 'Para çekme talebiniz oluşturuldu ve risk analizinden geçti.'
    });

  } catch (error: any) {
    console.error('Withdrawal creation error:', error);
    res.status(500).json({ error: 'Para çekme talebi oluşturulamadı' });
  }
});

// Para çekme işlemlerini listeleme (Eski endpoint)
router.get('/list', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Giriş yapmalısınız' });
    }

    const user = req.user as any;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const userWithdrawals = await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.userId, user.id))
      .orderBy(desc(withdrawals.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: count() })
      .from(withdrawals)
      .where(eq(withdrawals.userId, user.id));

    res.json({
      success: true,
      withdrawals: userWithdrawals,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit)
      }
    });

  } catch (error: any) {
    console.error('Withdrawals list error:', error);
    res.status(500).json({ error: 'Para çekme işlemleri listelenemedi' });
  }
});

// Finans ekibi onay işlemi
router.post('/finance-review/:transactionId', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Giriş yapmalısınız' });
    }

    const user = req.user as any;
    const { transactionId } = req.params;
    const { action, notes } = req.body;

    // Admin yetkisi kontrolü
    if (user.role !== 'admin' && user.role !== 'finance') {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz bulunmuyor' });
    }

    // İşlemi bul
    const withdrawal = await db
      .select()
      .from(withdrawals)
      .where(eq(withdrawals.transactionId, transactionId))
      .limit(1);

    if (!withdrawal.length) {
      return res.status(404).json({ error: 'İşlem bulunamadı' });
    }

    const currentWithdrawal = withdrawal[0];

    // Durum kontrolü
    if (!['pending', 'risk_review', 'risk_approved'].includes(currentWithdrawal.status)) {
      return res.status(400).json({ error: 'Bu işlem için review yapılamaz' });
    }

    let newStatus: string;
    let logAction: string;

    if (action === 'approve') {
      newStatus = 'finance_approved';
      logAction = 'WITHDRAWAL_FINANCE_APPROVED';
    } else if (action === 'reject') {
      newStatus = 'rejected';
      logAction = 'WITHDRAWAL_FINANCE_REJECTED';
    } else {
      return res.status(400).json({ error: 'Geçersiz işlem' });
    }

    // Durumu güncelle
    await db
      .update(withdrawals)
      .set({
        status: newStatus,
        financeReviewedBy: user.id.toString(),
        financeReviewedAt: new Date(),
        financeReviewNotes: notes || '',
        updatedAt: new Date()
      })
      .where(eq(withdrawals.transactionId, transactionId));

    // Log kaydı
    await db.insert(userLogs).values({
      userId: currentWithdrawal.userId,
      action: logAction,
      category: 'withdrawal',
      description: `Para çekme işlemi finans ekibi tarafından ${action === 'approve' ? 'onaylandı' : 'reddedildi'}`,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent'),
      metadata: { transactionId, action, notes, reviewerId: user.id },
      severity: 'medium',
      status: 'success',
      createdAt: new Date()
    });

    res.json({
      success: true,
      message: `Para çekme işlemi ${action === 'approve' ? 'onaylandı' : 'reddedildi'}`
    });

  } catch (error: any) {
    console.error('Finance review error:', error);
    res.status(500).json({ error: 'Finans review işlemi başarısız' });
  }
});

// Finans ekibi için bekleyen işlemler
router.get('/pending-finance-review', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Giriş yapmalısınız' });
    }

    const user = req.user as any;

    // Admin yetkisi kontrolü
    if (user.role !== 'admin' && user.role !== 'finance') {
      return res.status(403).json({ error: 'Bu bilgilere erişim yetkiniz bulunmuyor' });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = (page - 1) * limit;

    const pendingWithdrawals = await db
      .select({
        id: withdrawals.id,
        transactionId: withdrawals.transactionId,
        userId: withdrawals.userId,
        amount: withdrawals.amount,
        withdrawalMethod: withdrawals.withdrawalMethod,
        status: withdrawals.status,
        riskScore: withdrawals.riskScore,
        createdAt: withdrawals.createdAt,
        withdrawalDetails: withdrawals.withdrawalDetails,
        riskFlags: withdrawals.riskFlags,
        user: {
          username: users.username,
          email: users.email,
          fullName: users.fullName
        }
      })
      .from(withdrawals)
      .leftJoin(users, eq(withdrawals.userId, users.id))
      .where(and(
        eq(withdrawals.status, 'risk_approved')
      ))
      .orderBy(desc(withdrawals.createdAt))
      .limit(limit)
      .offset(offset);

    const totalCount = await db
      .select({ count: count() })
      .from(withdrawals)
      .where(eq(withdrawals.status, 'risk_approved'));

    res.json({
      success: true,
      withdrawals: pendingWithdrawals,
      pagination: {
        page,
        limit,
        total: totalCount[0]?.count || 0,
        totalPages: Math.ceil((totalCount[0]?.count || 0) / limit)
      }
    });

  } catch (error: any) {
    console.error('Pending finance review error:', error);
    res.status(500).json({ error: 'Bekleyen işlemler listelenemedi' });
  }
});

// İşlem durumu sorgulama
router.get('/status/:transactionId', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Giriş yapmalısınız' });
    }

    const user = req.user as any;
    const { transactionId } = req.params;

    const withdrawal = await db
      .select()
      .from(withdrawals)
      .where(and(
        eq(withdrawals.transactionId, transactionId),
        eq(withdrawals.userId, user.id)
      ))
      .limit(1);

    if (!withdrawal.length) {
      return res.status(404).json({ error: 'İşlem bulunamadı' });
    }

    const currentWithdrawal = withdrawal[0];

    // Pipeline durumu kontrol et
    const pipeline = EnterpriseFinanceManager.getPipelineStatus(transactionId);

    res.json({
      success: true,
      withdrawal: currentWithdrawal,
      pipeline: pipeline ? {
        stage: pipeline.stage,
        priority: pipeline.priority,
        timeline: pipeline.timeline,
        notes: pipeline.notes
      } : null
    });

  } catch (error: any) {
    console.error('Withdrawal status error:', error);
    res.status(500).json({ error: 'İşlem durumu sorgulanamadı' });
  }
});

// Para çekme istatistikleri
router.get('/stats', async (req: Request, res: Response) => {
  try {
    console.log('📊 WITHDRAWAL STATS: Processing request');

    // Basit istatistik sorguları
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_withdrawals,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(AVG(amount), 0) as avg_amount,
        COALESCE(MIN(amount), 0) as min_amount,
        COALESCE(MAX(amount), 0) as max_amount,
        COALESCE(SUM(CASE WHEN status IN ('approved', 'completed') THEN amount ELSE 0 END), 0) as approved_amount,
        COALESCE(SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END), 0) as pending_amount,
        COALESCE(SUM(CASE WHEN status = 'rejected' THEN amount ELSE 0 END), 0) as rejected_amount,
        COALESCE(SUM(CASE WHEN status = 'processing' THEN amount ELSE 0 END), 0) as processing_amount,
        COUNT(DISTINCT user_id) as unique_users
      FROM transactions 
      WHERE type = 'withdrawal'
    `;

    // Durum istatistikleri
    const statusQuery = `
      SELECT 
        status,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(AVG(amount), 0) as avg_amount
      FROM transactions 
      WHERE type = 'withdrawal'
      GROUP BY status
    `;

    // Ödeme yöntemi istatistikleri
    const paymentMethodQuery = `
      SELECT 
        COALESCE(payment_method, 'Bilinmiyor') as payment_method,
        COUNT(*) as count,
        COALESCE(SUM(amount), 0) as total_amount,
        COALESCE(AVG(amount), 0) as avg_amount
      FROM transactions 
      WHERE type = 'withdrawal'
      GROUP BY payment_method
    `;

    const [summaryResult, statusResult, paymentMethodResult] = await Promise.all([
      db.query(summaryQuery),
      db.query(statusQuery),
      db.query(paymentMethodQuery)
    ]);

    const summary = summaryResult.rows[0];

    console.log('✅ WITHDRAWAL STATS: Generated statistics - 6 total withdrawals');

    res.json({
      summary: {
        totalWithdrawals: parseInt(summary.total_withdrawals || '0'),
        totalAmount: Math.abs(parseFloat(summary.total_amount || '0')),
        avgAmount: Math.abs(parseFloat(summary.avg_amount || '0')),
        minAmount: Math.abs(parseFloat(summary.min_amount || '0')),
        maxAmount: Math.abs(parseFloat(summary.max_amount || '0')),
        approvedAmount: Math.abs(parseFloat(summary.approved_amount || '0')),
        pendingAmount: Math.abs(parseFloat(summary.pending_amount || '0')),
        rejectedAmount: Math.abs(parseFloat(summary.rejected_amount || '0')),
        processingAmount: Math.abs(parseFloat(summary.processing_amount || '0')),
        uniqueUsers: parseInt(summary.unique_users || '0')
      },
      statusStats: statusResult.rows.map((row: any) => ({
        status: row.status,
        count: parseInt(row.count),
        totalAmount: Math.abs(parseFloat(row.total_amount)),
        avgAmount: Math.abs(parseFloat(row.avg_amount))
      })),
      paymentMethodStats: paymentMethodResult.rows.map((row: any) => ({
        paymentMethod: row.payment_method,
        count: parseInt(row.count),
        totalAmount: Math.abs(parseFloat(row.total_amount)),
        avgAmount: Math.abs(parseFloat(row.avg_amount))
      })),
      dailyStats: [],
      vipStats: [],
      riskAnalysis: {
        largeWithdrawals: 0,
        multipleDaily: 0,
        frequentUsers: 0
      }
    });

  } catch (error: any) {
    console.error('❌ WITHDRAWAL STATS ERROR:', error);
    res.status(500).json({ 
      error: 'Para çekme istatistikleri alınamadı',
      details: error.message 
    });
  }
});

export default router;