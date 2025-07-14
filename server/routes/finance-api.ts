import { Router, Request, Response } from 'express';
import { FinanceCompanyService } from '../services/FinanceCompanyService';
import { ipWhitelistMiddleware, apiKeyMiddleware, hmacMiddleware, webhookSignatureMiddleware, AuthenticatedRequest } from '../middleware/financeApiMiddleware';
import { db } from '../db';
import { finance_transactions, users } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

const router = Router();

// Finans şirketi API endpoint'leri
// Base path: /api/finance

// Sağlık kontrolü
router.get('/health', (req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ödeme yöntemleri listesi
router.get('/payment-methods', ipWhitelistMiddleware, apiKeyMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const paymentMethods = [
      {
        id: 'havale',
        name: 'Havale/EFT',
        type: 'bank_transfer',
        min_deposit: 100,
        max_deposit: 100000,
        min_withdraw: 100,
        max_withdraw: 100000,
        processing_time: '5-30 dakika',
        status: 'active',
        supported_operations: ['deposit', 'withdraw']
      },
      {
        id: 'kredikarti',
        name: 'Kredi Kartı',
        type: 'card',
        min_deposit: 500,
        max_deposit: 100000,
        min_withdraw: 0,
        max_withdraw: 0,
        processing_time: 'Anında',
        status: 'active',
        supported_operations: ['deposit']
      },
      {
        id: 'payco',
        name: 'PayCo',
        type: 'ewallet',
        min_deposit: 100,
        max_deposit: 100000,
        min_withdraw: 100,
        max_withdraw: 100000,
        processing_time: '1-5 dakika',
        status: 'active',
        supported_operations: ['deposit', 'withdraw']
      },
      {
        id: 'pep',
        name: 'Pep',
        type: 'digital_wallet',
        min_deposit: 100,
        max_deposit: 100000,
        min_withdraw: 100,
        max_withdraw: 100000,
        processing_time: '2-10 dakika',
        status: 'active',
        supported_operations: ['deposit', 'withdraw']
      },
      {
        id: 'paratim',
        name: 'Paratim',
        type: 'payment_provider',
        min_deposit: 100,
        max_deposit: 100000,
        min_withdraw: 100,
        max_withdraw: 100000,
        processing_time: '5-15 dakika',
        status: 'active',
        supported_operations: ['deposit', 'withdraw']
      },
      {
        id: 'kripto',
        name: 'Kripto Para',
        type: 'cryptocurrency',
        min_deposit: 100,
        max_deposit: 100000,
        min_withdraw: 100,
        max_withdraw: 100000,
        processing_time: '10-60 dakika',
        status: 'active',
        supported_operations: ['deposit', 'withdraw']
      },
      {
        id: 'papara',
        name: 'Papara',
        type: 'digital_wallet',
        min_deposit: 500,
        max_deposit: 100000,
        min_withdraw: 100,
        max_withdraw: 100000,
        processing_time: 'Anında',
        status: 'active',
        supported_operations: ['deposit', 'withdraw']
      },
      {
        id: 'parolapara',
        name: 'ParolaPara',
        type: 'ewallet',
        min_deposit: 100,
        max_deposit: 100000,
        min_withdraw: 100,
        max_withdraw: 100000,
        processing_time: '1-10 dakika',
        status: 'active',
        supported_operations: ['deposit', 'withdraw']
      },
      {
        id: 'popy',
        name: 'Popy',
        type: 'mobile_payment',
        min_deposit: 100,
        max_deposit: 100000,
        min_withdraw: 100,
        max_withdraw: 100000,
        processing_time: '2-5 dakika',
        status: 'active',
        supported_operations: ['deposit', 'withdraw']
      },
      {
        id: 'paybol',
        name: 'PayBol',
        type: 'payment_gateway',
        min_deposit: 100,
        max_deposit: 100000,
        min_withdraw: 100,
        max_withdraw: 100000,
        processing_time: '3-15 dakika',
        status: 'active',
        supported_operations: ['deposit', 'withdraw']
      },
      {
        id: 'papel',
        name: 'Papel',
        type: 'digital_payment',
        min_deposit: 100,
        max_deposit: 100000,
        min_withdraw: 100,
        max_withdraw: 100000,
        processing_time: '1-8 dakika',
        status: 'active',
        supported_operations: ['deposit', 'withdraw']
      }
    ];

    res.json({
      success: true,
      data: paymentMethods,
      total: paymentMethods.length
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Ödeme yöntemleri listelenemedi',
      message: error.message
    });
  }
});

// Para yatırma işlemi başlatma
router.post('/deposit', ipWhitelistMiddleware, apiKeyMiddleware, hmacMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user_id, amount, payment_method, currency = 'TRY', return_url, cancel_url } = req.body;

    // Validasyon
    if (!user_id || !amount || !payment_method) {
      return res.status(400).json({
        success: false,
        error: 'Gerekli parametreler eksik',
        required_fields: ['user_id', 'amount', 'payment_method']
      });
    }

    if (amount < 50 || amount > 100000) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz miktar',
        min_amount: 50,
        max_amount: 100000
      });
    }

    // Kullanıcı kontrolü
    const user = await db.select()
      .from(users)
      .where(eq(users.id, user_id))
      .limit(1);

    if (!user.length) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    // Para yatırma işlemi başlat
    const result = await FinanceCompanyService.initiateDeposit({
      userId: user_id,
      amount,
      paymentMethod: payment_method,
      currency
    });

    res.json({
      success: true,
      transaction_id: result.transactionId,
      finance_company_tx_id: result.financeCompanyTxId,
      payment_url: result.paymentUrl,
      amount,
      currency,
      payment_method,
      status: 'processing',
      created_at: new Date().toISOString()
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Para yatırma işlemi başlatılamadı',
      message: error.message
    });
  }
});

// Para çekme işlemi başlatma
router.post('/withdrawal', ipWhitelistMiddleware, apiKeyMiddleware, hmacMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { user_id, amount, payment_method, account_info, currency = 'TRY' } = req.body;

    // Validasyon
    if (!user_id || !amount || !payment_method || !account_info) {
      return res.status(400).json({
        success: false,
        error: 'Gerekli parametreler eksik',
        required_fields: ['user_id', 'amount', 'payment_method', 'account_info']
      });
    }

    if (amount < 100 || amount > 100000) {
      return res.status(400).json({
        success: false,
        error: 'Geçersiz miktar',
        min_amount: 100,
        max_amount: 100000
      });
    }

    // Kullanıcı kontrolü
    const user = await db.select()
      .from(users)
      .where(eq(users.id, user_id))
      .limit(1);

    if (!user.length) {
      return res.status(404).json({
        success: false,
        error: 'Kullanıcı bulunamadı'
      });
    }

    // Bakiye kontrolü
    if (user[0].balance < amount) {
      return res.status(400).json({
        success: false,
        error: 'Yetersiz bakiye',
        available_balance: user[0].balance,
        requested_amount: amount
      });
    }

    // Para çekme işlemi başlat
    const result = await FinanceCompanyService.initiateWithdrawal({
      userId: user_id,
      amount,
      paymentMethod: payment_method,
      accountInfo: account_info,
      currency
    });

    res.json({
      success: true,
      transaction_id: result.transactionId,
      finance_company_tx_id: result.financeCompanyTxId,
      amount,
      currency,
      payment_method,
      status: 'processing',
      estimated_time: result.estimatedTime,
      created_at: new Date().toISOString()
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Para çekme işlemi başlatılamadı',
      message: error.message
    });
  }
});

// İşlem durumu sorgulama
router.get('/transaction/:transactionId', ipWhitelistMiddleware, apiKeyMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { transactionId } = req.params;

    const transaction = await db.select()
      .from(finance_transactions)
      .where(eq(finance_transactions.transactionId, transactionId))
      .limit(1);

    if (!transaction.length) {
      return res.status(404).json({
        success: false,
        error: 'İşlem bulunamadı'
      });
    }

    const txn = transaction[0];

    res.json({
      success: true,
      transaction_id: txn.transactionId,
      finance_company_tx_id: txn.financeCompanyTxId,
      type: txn.type,
      amount: txn.amount,
      currency: txn.currency,
      payment_method: txn.paymentMethod,
      status: txn.status,
      provider_status: txn.providerStatus,
      created_at: txn.createdAt,
      updated_at: txn.updatedAt,
      completed_at: txn.completedAt,
      error_message: txn.errorMessage
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'İşlem durumu sorgulanamadı',
      message: error.message
    });
  }
});

// Kullanıcı işlem geçmişi
router.get('/user/:userId/transactions', ipWhitelistMiddleware, apiKeyMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { userId } = req.params;
    const { type, status, limit = 50, offset = 0 } = req.query;

    let query = db.select()
      .from(finance_transactions)
      .where(eq(finance_transactions.userId, parseInt(userId)));

    if (type) {
      query = query.where(and(
        eq(finance_transactions.userId, parseInt(userId)),
        eq(finance_transactions.type, type as string)
      ));
    }

    if (status) {
      query = query.where(and(
        eq(finance_transactions.userId, parseInt(userId)),
        eq(finance_transactions.status, status as string)
      ));
    }

    const transactions = await query
      .orderBy(desc(finance_transactions.createdAt))
      .limit(parseInt(limit as string))
      .offset(parseInt(offset as string));

    res.json({
      success: true,
      data: transactions.map(txn => ({
        transaction_id: txn.transactionId,
        finance_company_tx_id: txn.financeCompanyTxId,
        type: txn.type,
        amount: txn.amount,
        currency: txn.currency,
        payment_method: txn.paymentMethod,
        status: txn.status,
        provider_status: txn.providerStatus,
        created_at: txn.createdAt,
        updated_at: txn.updatedAt,
        completed_at: txn.completedAt
      })),
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        total: transactions.length
      }
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'İşlem geçmişi getirilemedi',
      message: error.message
    });
  }
});

// Webhook endpoint - Para yatırma bildirimleri
router.post('/webhook/deposit', webhookSignatureMiddleware, async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-webhook-signature'] as string;
    const result = await FinanceCompanyService.processWebhook(req.body, signature, req.headers);

    res.json({
      success: true,
      processed: result.processed,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Webhook işlenemedi',
      message: error.message
    });
  }
});

// Webhook endpoint - Para çekme bildirimleri
router.post('/webhook/withdrawal', webhookSignatureMiddleware, async (req: Request, res: Response) => {
  try {
    const signature = req.headers['x-webhook-signature'] as string;
    const result = await FinanceCompanyService.processWebhook(req.body, signature, req.headers);

    res.json({
      success: true,
      processed: result.processed,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'Webhook işlenemedi',
      message: error.message
    });
  }
});

// API istatistikleri (sadece monitoring için)
router.get('/stats', ipWhitelistMiddleware, apiKeyMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    // Son 24 saat içindeki işlemler
    const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);
    
    const stats = await db.select()
      .from(finance_transactions)
      .where(gte(finance_transactions.createdAt, last24Hours));

    const summary = {
      total_transactions: stats.length,
      deposits: stats.filter(t => t.type === 'deposit').length,
      withdrawals: stats.filter(t => t.type === 'withdraw').length,
      completed: stats.filter(t => t.status === 'completed').length,
      pending: stats.filter(t => t.status === 'pending').length,
      failed: stats.filter(t => t.status === 'failed').length,
      total_volume: stats.reduce((sum, t) => sum + (t.amount || 0), 0),
      period: '24h'
    };

    res.json({
      success: true,
      stats: summary,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: 'İstatistikler getirilemedi',
      message: error.message
    });
  }
});

export default router;