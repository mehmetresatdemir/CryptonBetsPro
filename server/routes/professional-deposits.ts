import { Request, Response, Router } from 'express';
import { db } from '../db';
import { deposits, users, userLogs } from '../../shared/schema';
import { eq, desc, and, gte, sum, count } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { EnterpriseFinanceManager } from '../services/EnterpriseFinanceManager';
import { AdvancedRiskEngine } from '../services/AdvancedRiskEngine';
// Mock finans API servisi - gerçek entegrasyon için financeApiService kullanılacak
const mockFinanceApiService = {
  async createDeposit(data: any) {
    return {
      transactionId: `EXT_${Date.now()}`,
      paymentUrl: `https://payment.gateway.com/pay/${data.paymentMethodId}`,
      qrCode: null,
      bankAccount: data.paymentMethodId === 'bank_transfer' ? {
        iban: 'TR320010009999901234567890',
        accountName: 'CryptonBets Ltd.'
      } : null,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 dakika
      fees: { amount: data.amount * 0.02 },
      netAmount: data.amount * 0.98
    };
  }
};

const router = Router();

// Yeni profesyonel ödeme talebi oluşturma
router.post('/create-request', async (req: Request, res: Response) => {
  try {
    const { userId, username, email, amount, paymentMethod, paymentMethodName, useBonus, bonusAmount, fee, totalAmount, language } = req.body;

    // Validasyon
    if (!userId || !amount || amount <= 0) {
      return res.status(400).json({ error: 'Geçersiz parametreler' });
    }

    const requestId = `REQ_${Date.now()}_${uuidv4().slice(0, 8)}`;
    const transactionId = `DEP_${Date.now()}_${uuidv4().slice(0, 8)}`;

    // Deposit talebi oluştur
    const depositRequest = await db.insert(deposits).values({
      transactionId,
      userId,
      amount: amount.toString(),
      paymentMethod,
      status: 'pending_user_payment',
      paymentDetails: JSON.stringify({
        requestId,
        paymentMethodName,
        useBonus,
        bonusAmount,
        fee,
        totalAmount,
        language,
        bankAccount: {
          bankName: 'Ziraat Bankası',
          accountHolder: 'CryptonBets Ltd.',
          iban: 'TR21 0001 0017 4515 7300 1234 56',
          branchCode: '1745'
        }
      }),
      createdAt: new Date(),
    }).returning();

    // Kullanıcı log'u ekle
    await db.insert(userLogs).values({
      userId,
      action: 'deposit_request_created',
      description: `${amount} TL para yatırma talebi oluşturuldu (${paymentMethodName})`,
      category: 'financial',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      createdAt: new Date(),
    });

    return res.json({
      success: true,
      requestId,
      transactionId,
      message: 'Ödeme talebi başarıyla oluşturuldu'
    });

  } catch (error) {
    console.error('Deposit request creation error:', error);
    return res.status(500).json({ error: 'Ödeme talebi oluşturulamadı' });
  }
});

// Kullanıcının "Ödeme Yaptım" onayı
router.post('/confirm-payment', async (req: Request, res: Response) => {
  try {
    const { requestId, userId, username, confirmedAt } = req.body;

    if (!requestId || !userId) {
      return res.status(400).json({ error: 'Geçersiz parametreler' });
    }

    // Deposit kaydını bul ve güncelle
    const depositRecord = await db.select()
      .from(deposits)
      .where(eq(deposits.userId, userId))
      .orderBy(desc(deposits.createdAt))
      .limit(1);

    if (!depositRecord.length) {
      return res.status(404).json({ error: 'Ödeme talebi bulunamadı' });
    }

    // Durumu güncelle - finans kontrolü için hazır
    await db.update(deposits)
      .set({
        status: 'pending_finance_review',
        paymentDetails: JSON.stringify({
          ...JSON.parse(depositRecord[0].paymentDetails || '{}'),
          userConfirmedAt: confirmedAt,
          userConfirmedPayment: true
        }),
        updatedAt: new Date()
      })
      .where(eq(deposits.id, depositRecord[0].id));

    // Kullanıcı log'u ekle
    await db.insert(userLogs).values({
      userId,
      action: 'payment_confirmed_by_user',
      description: `Kullanıcı ${depositRecord[0].amount} TL ödeme yaptığını onayladı`,
      category: 'financial',
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      createdAt: new Date(),
    });

    return res.json({
      success: true,
      message: 'Ödemeniz onaylandı. Finans ekibimiz kontrol edecek.'
    });

  } catch (error) {
    console.error('Payment confirmation error:', error);
    return res.status(500).json({ error: 'Ödeme onayı başarısız' });
  }
});

// Para yatırma talebi oluşturma (eski endpoint)
router.post('/create', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Giriş yapmalısınız' });
    }

    const { amount, paymentMethod, paymentDetails } = req.body;
    const user = req.user as any;

    // Validasyon
    if (!amount || amount <= 0) {
      return res.status(400).json({ error: 'Geçerli bir miktar girin' });
    }

    if (!paymentMethod) {
      return res.status(400).json({ error: 'Ödeme yöntemi seçin' });
    }

    const transactionId = `DEP_${Date.now()}_${uuidv4().slice(0, 8)}`;

    // Enterprise Finance Manager ile işlem
    const result = await EnterpriseFinanceManager.processDeposit(
      user.id,
      Number(amount),
      paymentMethod,
      {
        ipAddress: req.ip,
        userAgent: req.get('User-Agent'),
        paymentDetails
      }
    );

    if (!result.success) {
      return res.status(400).json({ 
        error: result.error || 'Para yatırma işlemi başarısız'
      });
    }

    res.json({
      success: true,
      transactionId: result.transactionId,
      pipeline: result.pipeline,
      message: 'Para yatırma talebi oluşturuldu ve risk analizinden geçirildi.'
    });

  } catch (error: any) {
    console.error('Deposit creation error:', error);
    res.status(500).json({ error: 'Para yatırma talebi oluşturulamadı' });
  }
});

// Para yatırma işlemlerini listeleme
router.get('/list', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Giriş yapmalısınız' });
    }

    const user = req.user as any;
    const { page = 1, limit = 10, status } = req.query;

    let whereConditions = [eq(deposits.userId, user.id)];
    
    if (status && typeof status === 'string') {
      whereConditions.push(eq(deposits.status, status));
    }

    const userDeposits = await db
      .select()
      .from(deposits)
      .where(and(...whereConditions))
      .orderBy(desc(deposits.createdAt))
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit));

    res.json({
      success: true,
      deposits: userDeposits,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: userDeposits.length
      }
    });

  } catch (error: any) {
    console.error('Deposits list error:', error);
    res.status(500).json({ error: 'Para yatırma işlemleri getirilemedi' });
  }
});

// Finans paneli onayı (Admin)
router.post('/finance-review/:transactionId', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Giriş yapmalısınız' });
    }

    const user = req.user as any;
    if (user.role !== 'admin' && user.role !== 'finance') {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }

    const { transactionId } = req.params;
    const { action, notes } = req.body; // 'approve' or 'reject'

    const deposit = await db
      .select()
      .from(deposits)
      .where(eq(deposits.transactionId, transactionId))
      .limit(1);

    if (!deposit.length) {
      return res.status(404).json({ error: 'Para yatırma işlemi bulunamadı' });
    }

    const depositRecord = deposit[0];

    if (depositRecord.status !== 'pending' && depositRecord.status !== 'finance_review') {
      return res.status(400).json({ error: 'Bu işlem zaten işleme alınmış' });
    }

    let newStatus = '';
    let completedAt = null;

    if (action === 'approve') {
      newStatus = 'approved';
      completedAt = new Date();

      // Kullanıcı bakiyesini güncelle
      const userRecord = await db
        .select()
        .from(users)
        .where(eq(users.id, depositRecord.userId))
        .limit(1);

      if (userRecord.length) {
        const currentBalance = Number(userRecord[0].balance || 0);
        const depositAmount = Number(depositRecord.netAmount || depositRecord.amount);
        const newBalance = currentBalance + depositAmount;

        await db
          .update(users)
          .set({ 
            balance: newBalance,
            totalDeposits: Number(userRecord[0].totalDeposits || 0) + depositAmount
          })
          .where(eq(users.id, depositRecord.userId));
      }

    } else if (action === 'reject') {
      newStatus = 'rejected';
    } else {
      return res.status(400).json({ error: 'Geçersiz işlem' });
    }

    // Para yatırma kaydını güncelle
    await db
      .update(deposits)
      .set({
        status: newStatus,
        financeReviewBy: user.id,
        financeReviewAt: new Date(),
        financeReviewNotes: notes,
        completedAt,
        updatedAt: new Date()
      })
      .where(eq(deposits.transactionId, transactionId));

    // Log kaydı
    await db.insert(userLogs).values({
      userId: depositRecord.userId,
      action: `DEPOSIT_${action.toUpperCase()}`,
      category: 'deposit',
      description: `Para yatırma ${action === 'approve' ? 'onaylandı' : 'reddedildi'}: ${depositRecord.amount} TL`,
      ipAddress: req.ip || 'unknown',
      userAgent: req.get('User-Agent'),
      metadata: { 
        transactionId, 
        reviewedBy: user.id, 
        notes,
        amount: depositRecord.amount 
      },
      severity: action === 'reject' ? 'medium' : 'low',
      status: 'success',
      createdAt: new Date()
    });

    res.json({
      success: true,
      message: `Para yatırma işlemi ${action === 'approve' ? 'onaylandı' : 'reddedildi'}`,
      status: newStatus
    });

  } catch (error: any) {
    console.error('Finance review error:', error);
    res.status(500).json({ error: 'İşlem gerçekleştirilemedi' });
  }
});

// Bekleyen para yatırma işlemleri (Finans paneli)
router.get('/pending-finance-review', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Giriş yapmalısınız' });
    }

    const user = req.user as any;
    if (user.role !== 'admin' && user.role !== 'finance') {
      return res.status(403).json({ error: 'Bu işlem için yetkiniz yok' });
    }

    const { page = 1, limit = 20 } = req.query;

    const pendingDeposits = await db
      .select({
        deposit: deposits,
        user: {
          id: users.id,
          username: users.username,
          email: users.email,
          fullName: users.fullName
        }
      })
      .from(deposits)
      .leftJoin(users, eq(deposits.userId, users.id))
      .where(eq(deposits.status, 'pending'))
      .orderBy(desc(deposits.createdAt))
      .limit(Number(limit))
      .offset((Number(page) - 1) * Number(limit));

    res.json({
      success: true,
      deposits: pendingDeposits,
      pagination: {
        page: Number(page),
        limit: Number(limit)
      }
    });

  } catch (error: any) {
    console.error('Pending deposits error:', error);
    res.status(500).json({ error: 'Bekleyen işlemler getirilemedi' });
  }
});

// İşlem durumu kontrolü
router.get('/status/:transactionId', async (req: Request, res: Response) => {
  try {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Giriş yapmalısınız' });
    }

    const { transactionId } = req.params;
    const user = req.user as any;

    const deposit = await db
      .select()
      .from(deposits)
      .where(
        and(
          eq(deposits.transactionId, transactionId),
          eq(deposits.userId, user.id)
        )
      )
      .limit(1);

    if (!deposit.length) {
      return res.status(404).json({ error: 'İşlem bulunamadı' });
    }

    res.json({
      success: true,
      deposit: deposit[0]
    });

  } catch (error: any) {
    console.error('Deposit status error:', error);
    res.status(500).json({ error: 'İşlem durumu getirilemedi' });
  }
});

export default router;