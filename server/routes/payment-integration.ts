import { Router, Request, Response } from 'express';
import { authMiddleware } from '../utils/auth';
import { db } from '../db';
import { users, transactions, payment_methods, userLogs } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

// Payment method configurations with updated limits per user specifications
const PAYMENT_METHODS = {
  havale: {
    id: 'havale',
    name: 'Havale/EFT',
    type: 'bank_transfer',
    minDeposit: 100,
    maxDeposit: 100000,
    minWithdraw: 100,
    maxWithdraw: 100000,
    processingTime: '5-30 dakika',
    status: 'active',
    depositCount: 5,
    withdrawCount: 0,
    successRate: 1
  },
  kredikarti: {
    id: 'kredikarti',
    name: 'Kredi Kartı',
    type: 'card',
    minDeposit: 500,
    maxDeposit: 100000,
    minWithdraw: 0, // Kart ile çekim desteklenmiyor
    maxWithdraw: 0,
    processingTime: 'Anında',
    status: 'active',
    depositCount: 12,
    withdrawCount: 0,
    successRate: 1
  },
  payco: {
    id: 'payco',
    name: 'PayCo',
    type: 'ewallet',
    minDeposit: 100,
    maxDeposit: 100000,
    minWithdraw: 100,
    maxWithdraw: 100000,
    processingTime: '1-5 dakika',
    status: 'active',
    depositCount: 7,
    withdrawCount: 0,
    successRate: 1
  },
  pep: {
    id: 'pep',
    name: 'Pep',
    type: 'digital_wallet',
    minDeposit: 100,
    maxDeposit: 100000,
    minWithdraw: 100,
    maxWithdraw: 100000,
    processingTime: '2-10 dakika',
    status: 'active',
    depositCount: 6,
    withdrawCount: 0,
    successRate: 1
  },
  paratim: {
    id: 'paratim',
    name: 'Paratim',
    type: 'payment_provider',
    minDeposit: 100,
    maxDeposit: 100000,
    minWithdraw: 100,
    maxWithdraw: 100000,
    processingTime: '5-15 dakika',
    status: 'active',
    depositCount: 6,
    withdrawCount: 0,
    successRate: 1
  },
  kripto: {
    id: 'kripto',
    name: 'Kripto Para',
    type: 'cryptocurrency',
    minDeposit: 100,
    maxDeposit: 100000,
    minWithdraw: 100,
    maxWithdraw: 100000,
    processingTime: '10-60 dakika',
    status: 'active',
    depositCount: 5,
    withdrawCount: 0,
    successRate: 1
  },
  papara: {
    id: 'papara',
    name: 'Papara',
    type: 'digital_wallet',
    minDeposit: 500,
    maxDeposit: 100000,
    minWithdraw: 100,
    maxWithdraw: 100000,
    processingTime: 'Anında',
    status: 'active',
    depositCount: 8,
    withdrawCount: 0,
    successRate: 1
  },
  parolapara: {
    id: 'parolapara',
    name: 'ParolaPara',
    type: 'ewallet',
    minDeposit: 100,
    maxDeposit: 100000,
    minWithdraw: 100,
    maxWithdraw: 100000,
    processingTime: '1-10 dakika',
    status: 'active',
    depositCount: 6,
    withdrawCount: 0,
    successRate: 1
  },
  popy: {
    id: 'popy',
    name: 'Popy',
    type: 'mobile_payment',
    minDeposit: 100,
    maxDeposit: 100000,
    minWithdraw: 100,
    maxWithdraw: 100000,
    processingTime: '2-5 dakika',
    status: 'active',
    depositCount: 6,
    withdrawCount: 0,
    successRate: 1
  },
  paybol: {
    id: 'paybol',
    name: 'PayBol',
    type: 'payment_gateway',
    minDeposit: 100,
    maxDeposit: 100000,
    minWithdraw: 100,
    maxWithdraw: 100000,
    processingTime: '3-15 dakika',
    status: 'active',
    depositCount: 6,
    withdrawCount: 0,
    successRate: 1
  },
  papel: {
    id: 'papel',
    name: 'Papel',
    type: 'digital_payment',
    minDeposit: 100,
    maxDeposit: 100000,
    minWithdraw: 100,
    maxWithdraw: 100000,
    processingTime: '1-8 dakika',
    status: 'active',
    depositCount: 6,
    withdrawCount: 0,
    successRate: 1
  }
};

// Get all available payment methods
router.get('/methods', async (req: Request, res: Response) => {
  try {
    const methods = Object.values(PAYMENT_METHODS).map(method => ({
      ...method,
      icon: `/images/payment/${method.id}.svg`,
      supported_currencies: ['TRY'],
      features: {
        instant_deposit: ['kredikarti', 'papara'].includes(method.id),
        instant_withdraw: ['papara'].includes(method.id),
        supports_large_amounts: ['havale', 'kripto', 'papara'].includes(method.id)
      }
    }));

    res.json({
      success: true,
      data: methods,
      count: methods.length
    });
  } catch (error) {
    console.error('Payment methods error:', error);
    res.status(500).json({
      success: false,
      error: 'Payment methods could not be loaded'
    });
  }
});

// Create deposit request
router.post('/deposit', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { method, amount, currency = 'TRY' } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      });
    }

    const paymentMethod = PAYMENT_METHODS[method as keyof typeof PAYMENT_METHODS];
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment method'
      });
    }

    if (amount < paymentMethod.minDeposit || amount > paymentMethod.maxDeposit) {
      return res.status(400).json({
        success: false,
        error: `Amount must be between ${paymentMethod.minDeposit} and ${paymentMethod.maxDeposit} TRY`
      });
    }

    // Generate unique transaction ID
    const transactionId = `DEP_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

    // Create transaction record
    const [transaction] = await db.insert(transactions).values({
      transactionId,
      userId,
      type: 'deposit',
      amount,
      currency,
      status: 'pending',
      paymentMethod: method,
      description: `Para yatırma talebi - ${method}`,
      createdAt: new Date()
    }).returning();

    // Generate payment reference
    const paymentReference = `DEP-${transaction.id}-${Date.now()}`;

    // Finance company integration payload
    const financePayload = {
      transaction_id: transaction.id,
      reference: paymentReference,
      user_id: userId,
      payment_method: method,
      amount,
      currency,
      type: 'deposit',
      callback_url: `${process.env.DOMAIN}/api/payment/callback`,
      webhook_url: `${process.env.DOMAIN}/api/payment/webhook`,
      metadata: {
        user_ip: req.ip,
        user_agent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      }
    };

    res.json({
      success: true,
      data: {
        transaction_id: transaction.id,
        payment_reference: paymentReference,
        method: paymentMethod,
        amount,
        currency,
        status: 'pending',
        finance_integration: financePayload,
        instructions: getPaymentInstructions(method, amount),
        expires_at: new Date(Date.now() + 30 * 60 * 1000) // 30 minutes
      }
    });

  } catch (error) {
    console.error('Deposit error:', error);
    res.status(500).json({
      success: false,
      error: 'Deposit request could not be processed'
    });
  }
});

// Create withdrawal request
router.post('/withdraw', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { method, amount, currency = 'TRY', account_details } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'User authentication required'
      });
    }

    const paymentMethod = PAYMENT_METHODS[method as keyof typeof PAYMENT_METHODS];
    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Invalid payment method'
      });
    }

    if (amount < paymentMethod.minWithdraw || amount > paymentMethod.maxWithdraw) {
      return res.status(400).json({
        success: false,
        error: `Withdrawal amount must be between ${paymentMethod.minWithdraw} and ${paymentMethod.maxWithdraw} TRY`
      });
    }

    // Check user balance
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user || user.balance < amount) {
      return res.status(400).json({
        success: false,
        error: 'Insufficient balance'
      });
    }

    // Generate unique transaction ID
    const withdrawalTransactionId = `WTH_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

    // Create transaction record
    const [transaction] = await db.insert(transactions).values({
      transactionId: withdrawalTransactionId,
      userId,
      type: 'withdrawal',
      amount: -amount, // Negatif değer withdrawal için
      currency,
      status: 'pending',
      paymentMethod: method,
      description: `Para çekme talebi - ${method}`,
      createdAt: new Date()
    }).returning();

    // Generate withdrawal reference
    const withdrawalReference = `WTH-${transaction.id}-${Date.now()}`;

    // Finance company integration payload
    const financePayload = {
      transaction_id: transaction.id,
      reference: withdrawalReference,
      user_id: userId,
      payment_method: method,
      amount,
      currency,
      type: 'withdrawal',
      account_details,
      callback_url: `${process.env.DOMAIN}/api/payment/callback`,
      webhook_url: `${process.env.DOMAIN}/api/payment/webhook`,
      metadata: {
        user_ip: req.ip,
        user_agent: req.get('User-Agent'),
        timestamp: new Date().toISOString()
      }
    };

    res.json({
      success: true,
      data: {
        transaction_id: transaction.id,
        withdrawal_reference: withdrawalReference,
        method: paymentMethod,
        amount,
        currency,
        status: 'pending',
        finance_integration: financePayload,
        processing_time: paymentMethod.processingTime,
        estimated_completion: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours
      }
    });

  } catch (error) {
    console.error('Withdrawal error:', error);
    res.status(500).json({
      success: false,
      error: 'Withdrawal request could not be processed'
    });
  }
});

// Finance company callback endpoint
router.post('/callback', async (req: Request, res: Response) => {
  try {
    const { transaction_id, status, reference, amount, fee } = req.body;

    console.log('💳 Payment callback alındı:', {
      transaction_id,
      status,
      reference,
      amount,
      fee
    });

    // Get transaction details first to validate
    const [transaction] = await db.select().from(transactions)
      .where(eq(transactions.id, transaction_id));

    if (!transaction) {
      console.log('❌ Transaction bulunamadı:', transaction_id);
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    // Validate amount matches (if provided in callback)
    if (amount && Math.abs(Number(transaction.amount) - Number(amount)) > 0.01) {
      console.log('⚠️ Amount uyuşmuyor:', {
        transactionAmount: transaction.amount,
        callbackAmount: amount
      });
      return res.status(400).json({
        success: false,
        error: 'Amount mismatch'
      });
    }

    // Update transaction status
    await db.update(transactions)
      .set({
        status,
        completedAt: status === 'completed' ? new Date() : undefined,
        ...(fee && { fee: Number(fee) })
      })
      .where(eq(transactions.id, transaction_id));

    if (status === 'completed' && transaction.type === 'deposit') {
      console.log('✅ Deposit başarılı - bakiye güncelleniyor:', {
        userId: transaction.userId,
        amount: transaction.amount
      });

      // Get current user data
      const [user] = await db.select().from(users)
        .where(eq(users.id, transaction.userId));

      if (!user) {
        console.log('❌ Kullanıcı bulunamadı:', transaction.userId);
        return res.status(404).json({
          success: false,
          error: 'User not found'
        });
      }

      const oldBalance = Number(user.balance || 0);
      const depositAmount = Number(transaction.amount);
      const newBalance = oldBalance + depositAmount;

      // Update user balance for successful deposits using sql template literal (secure)
      await db.update(users)
        .set({
          balance: newBalance,
          totalDeposits: Number(user.totalDeposits || 0) + depositAmount
        })
        .where(eq(users.id, transaction.userId));

      console.log('💰 Bakiye güncellendi:', {
        userId: transaction.userId,
        oldBalance,
        depositAmount,
        newBalance
      });

      // Create user log
      try {
        await db.insert(userLogs).values({
          userId: transaction.userId,
          action: 'deposit_completed',
          description: `Para yatırma tamamlandı: ${depositAmount} TL (Transaction: ${transaction_id})`,
          category: 'financial',
          ipAddress: req.ip || 'Unknown',
          userAgent: req.get('User-Agent') || 'Unknown',
          createdAt: new Date()
        });
      } catch (logError) {
        console.error('⚠️ User log oluşturulamadı:', logError);
        // Don't fail the main process for logging errors
      }
    }

    res.json({
      success: true,
      message: 'İşlem başarıyla tamamlandı.',
      transaction_id,
      status
    });

  } catch (error) {
    console.error('❌ Callback error:', error);
    res.status(500).json({
      success: false,
      error: 'Callback processing failed'
    });
  }
});

// Get transaction status
router.get('/transaction/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const transactionId = parseInt(req.params.id);
    const userId = req.user?.id;

    const [transaction] = await db.select().from(transactions)
      .where(and(
        eq(transactions.id, transactionId),
        eq(transactions.userId, userId!)
      ));

    if (!transaction) {
      return res.status(404).json({
        success: false,
        error: 'Transaction not found'
      });
    }

    res.json({
      success: true,
      data: transaction
    });

  } catch (error) {
    console.error('Transaction status error:', error);
    res.status(500).json({
      success: false,
      error: 'Transaction status could not be retrieved'
    });
  }
});

// Helper function for payment instructions
function getPaymentInstructions(method: string, amount: number): any {
  const instructions = {
    havale: {
      title: 'Havale/EFT ile Para Yatırma',
      steps: [
        'Banka hesabınıza giriş yapın',
        'EFT/Havale seçeneğini seçin',
        'Verilen hesap bilgilerine transfer yapın',
        'İşlem açıklamasına referans kodunu yazın',
        'Transfer dekontunu sisteme yükleyin'
      ],
      account_info: {
        bank: 'Türkiye İş Bankası',
        account_number: '1234-5678-9012-3456',
        iban: 'TR12 0006 4000 0001 2345 6789 01',
        account_holder: 'CryptonBets Ödeme Hizmetleri A.Ş.'
      }
    },
    kredikarti: {
      title: 'Kredi Kartı ile Para Yatırma',
      steps: [
        'Kart bilgilerinizi güvenli formda girin',
        '3D Secure doğrulamasını tamamlayın',
        'SMS ile gelen kodu onaylayın',
        'İşlem otomatik olarak hesabınıza yansır'
      ]
    },
    papara: {
      title: 'Papara ile Para Yatırma/Çekme',
      steps: [
        'Papara hesabınıza giriş yapın',
        'QR kod veya Papara numarasını kullanın',
        'Transfer işlemini onaylayın',
        'Anında hesabınıza yansır'
      ]
    }
  };

  return instructions[method as keyof typeof instructions] || {
    title: `${method} ile İşlem`,
    steps: ['Ödeme sağlayıcısına yönlendirileceksiniz', 'İşlem adımlarını takip edin']
  };
}

export default router;