import express from 'express';
import { authMiddleware } from '../utils/auth';
import { db } from '../db';
import { transactions, users } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';
import crypto from 'crypto';

const router = express.Router();

// Para çekme talebi oluştur
router.post('/create', authMiddleware, async (req, res) => {
  try {
    const { 
      amount, 
      payment_method_id, 
      user_name, 
      site_reference_number, 
      return_url,
      // Tüm ödeme yöntemi parametreleri
      iban,
      bank_name,
      user_full_name,
      pay_co_id,
      pay_co_full_name,
      papara_id,
      pep_id,
      tc_number,
      paratim_id,
      crypto_address,
      popy_id,
      papel_id,
      parolapara_id,
      paybol_id
    } = req.body;
    
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Kullanıcı kimlik doğrulaması gerekli' });
    }

    // Kullanıcıyı kontrol et
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) {
      return res.status(404).json({ success: false, error: 'Kullanıcı bulunamadı' });
    }

    // Ödeme yöntemi kontrolü
    const supportedMethods = [
      'havale', 'papara', 'payco', 'pep', 'paratim', 
      'crypto', 'popy', 'papel', 'parolapara', 'paybol'
    ];

    if (!supportedMethods.includes(payment_method_id)) {
      return res.status(400).json({ success: false, error: 'Desteklenmeyen ödeme yöntemi' });
    }

    // Tutar kontrolü
    let minAmount = 50;
    let maxAmount = 50000;

    // Yönteme göre limitler
    switch (payment_method_id) {
      case 'havale':
        minAmount = 100;
        maxAmount = 50000;
        break;
      case 'crypto':
        minAmount = 100;
        maxAmount = 100000;
        break;
      case 'papara':
      case 'payco':
      case 'paratim':
        minAmount = 50;
        maxAmount = 25000;
        break;
      default:
        minAmount = 50;
        maxAmount = 15000;
    }

    if (amount < minAmount) {
      return res.status(400).json({ 
        success: false, 
        error: `${payment_method_id} için minimum çekim tutarı ₺${minAmount}` 
      });
    }

    if (amount > maxAmount) {
      return res.status(400).json({ 
        success: false, 
        error: `${payment_method_id} için maksimum çekim tutarı ₺${maxAmount}` 
      });
    }

    // Bakiye kontrolü
    if (user[0].balance < amount) {
      return res.status(400).json({ success: false, error: 'Yetersiz bakiye' });
    }

    // Site reference number oluştur
    const siteReferenceNumber = site_reference_number || `WD${Date.now()}${userId}`;

    // Para çekme API'sine gönderilecek temel veri
    const withdrawalData: any = {
      payment_method_id: payment_method_id,
      amount: amount,
      user: user_name || user[0].username,
      user_name: user_name || user[0].username,
      user_id: userId.toString(),
      site_reference_number: siteReferenceNumber,
      return_url: return_url || `${process.env.FRONTEND_URL || 'https://cryptonbets1.com'}/profile`
    };

    // Ödeme yöntemine göre gerekli parametreleri ekle
    switch (payment_method_id) {
      case 'havale':
        if (!iban || !bank_name || !user_full_name) {
          return res.status(400).json({ 
            success: false, 
            error: 'Havale için IBAN, banka adı ve ad soyad gerekli' 
          });
        }
        withdrawalData.iban = iban;
        withdrawalData.bank_name = bank_name;
        withdrawalData.user_full_name = user_full_name;
        withdrawalData.account_name = user_full_name; // API'nin beklediği field
        withdrawalData.account_holder_name = user_full_name; // Alternatif field
        break;

      case 'papara':
        if (!papara_id) {
          return res.status(400).json({ 
            success: false, 
            error: 'Papara ID gerekli' 
          });
        }
        withdrawalData.papara_id = papara_id;
        break;

      case 'payco':
        if (!pay_co_id || !pay_co_full_name) {
          return res.status(400).json({ 
            success: false, 
            error: 'Pay-Co ID ve ad soyad gerekli' 
          });
        }
        withdrawalData.pay_co_id = pay_co_id;
        withdrawalData.pay_co_full_name = pay_co_full_name;
        break;

      case 'pep':
        if (!pep_id || !tc_number) {
          return res.status(400).json({ 
            success: false, 
            error: 'Pep ID ve TC Kimlik numarası gerekli' 
          });
        }
        withdrawalData.pep_id = pep_id;
        withdrawalData.tc_number = tc_number;
        break;

      case 'paratim':
        if (!paratim_id) {
          return res.status(400).json({ 
            success: false, 
            error: 'Paratim ID gerekli' 
          });
        }
        withdrawalData.paratim_id = paratim_id;
        break;

      case 'crypto':
        if (!crypto_address) {
          return res.status(400).json({ 
            success: false, 
            error: 'Kripto cüzdan adresi gerekli' 
          });
        }
        withdrawalData.crypto_address = crypto_address;
        break;

      case 'popy':
        if (!popy_id) {
          return res.status(400).json({ 
            success: false, 
            error: 'Popy ID gerekli' 
          });
        }
        withdrawalData.popy_id = popy_id;
        break;

      case 'papel':
        if (!papel_id) {
          return res.status(400).json({ 
            success: false, 
            error: 'Papel ID gerekli' 
          });
        }
        withdrawalData.papel_id = papel_id;
        break;

      case 'parolapara':
        if (!parolapara_id) {
          return res.status(400).json({ 
            success: false, 
            error: 'Parolapara ID gerekli' 
          });
        }
        withdrawalData.parolapara_id = parolapara_id;
        break;

      case 'paybol':
        if (!paybol_id) {
          return res.status(400).json({ 
            success: false, 
            error: 'Paybol ID gerekli' 
          });
        }
        withdrawalData.paybol_id = paybol_id;
        break;
    }

    // Para çekme API'sine istek gönder
    console.log('🔍 Withdrawal API Request:', {
      url: process.env.PAPARA_WITHDRAWAL_API_URL,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.PAPARA_WITHDRAWAL_API_KEY
      },
      payload: withdrawalData
    });

    const apiResponse = await fetch(process.env.PAPARA_WITHDRAWAL_API_URL!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': process.env.PAPARA_WITHDRAWAL_API_KEY!
      },
      body: JSON.stringify(withdrawalData)
    });

    const apiResult = await apiResponse.json();
    
    console.log('📤 Withdrawal API Response:', {
      status: apiResponse.status,
      statusText: apiResponse.statusText,
      data: apiResult
    });

    // Benzersiz transaction ID oluştur
    const transactionId = `WTH_${Date.now()}_${crypto.randomBytes(8).toString('hex')}`;

    // Veritabanına işlem kaydı ekle
    const [transaction] = await db.insert(transactions).values({
      transactionId: transactionId,
      userId: userId,
      amount: -amount, // Çekim için negatif
      type: 'withdrawal',
      paymentMethod: payment_method_id,
      status: 'pending',
      referenceId: apiResult.transaction_id || site_reference_number,
      description: `Para çekme talebi - ${payment_method_id}`,
      paymentDetails: {
        payment_method_id: payment_method_id,
        site_reference_number: site_reference_number,
        withdrawal_details: withdrawalData,
        api_response: apiResult
      }
    }).returning();

    if (apiResponse.ok && apiResult.success) {
      // Bakiyeyi güncelle (bekleyen işlem olarak)
      await db.update(users)
        .set({ balance: user[0].balance - amount })
        .where(eq(users.id, userId));

      res.json({
        success: true,
        transaction_id: transaction.id.toString(),
        status: 'pending',
        message: 'Para çekme talebi oluşturuldu'
      });
    } else {
      res.status(400).json({
        success: false,
        error: apiResult.message || 'Para çekme talebi oluşturulamadı'
      });
    }

  } catch (error) {
    console.error('Para çekme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'İç sunucu hatası'
    });
  }
});

// Para çekme durumu sorgula
router.get('/status/:transactionId', authMiddleware, async (req, res) => {
  try {
    const { transactionId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Kullanıcı kimlik doğrulaması gerekli' });
    }

    const [transaction] = await db.select()
      .from(transactions)
      .where(
        and(
          eq(transactions.id, parseInt(transactionId)),
          eq(transactions.userId, userId)
        )
      )
      .limit(1);

    if (!transaction) {
      return res.status(404).json({ success: false, error: 'İşlem bulunamadı' });
    }

    res.json({
      success: true,
      transaction: {
        id: transaction.id,
        amount: Math.abs(transaction.amount),
        status: transaction.status,
        createdAt: transaction.createdAt,
        method: transaction.method,
        provider: transaction.provider,
        metadata: transaction.metadata
      }
    });

  } catch (error) {
    console.error('İşlem durumu sorgulama hatası:', error);
    res.status(500).json({
      success: false,
      error: 'İç sunucu hatası'
    });
  }
});

// Para çekme geçmişi
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query.limit as string) || 10;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Kullanıcı kimlik doğrulaması gerekli' });
    }

    const withdrawals = await db.select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'withdrawal')
        )
      )
      .orderBy(desc(transactions.createdAt))
      .limit(limit);

    res.json({
      success: true,
      withdrawals: withdrawals.map(w => ({
        id: w.id,
        amount: Math.abs(w.amount),
        status: w.status,
        method: w.method,
        provider: w.provider,
        createdAt: w.createdAt,
        metadata: w.metadata
      }))
    });

  } catch (error) {
    console.error('Para çekme geçmişi hatası:', error);
    res.status(500).json({
      success: false,
      error: 'İç sunucu hatası'
    });
  }
});

// Para çekme limitlerini getir
router.get('/limits', authMiddleware, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, error: 'Kullanıcı kimlik doğrulaması gerekli' });
    }

    // Günlük ve aylık kullanım hesapla
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const allWithdrawals = await db.select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.type, 'withdrawal')
        )
      );

    const dailyUsed = allWithdrawals
      .filter(w => {
        const transactionDate = new Date(w.createdAt);
        transactionDate.setHours(0, 0, 0, 0);
        return transactionDate.getTime() === today.getTime() && 
               (w.status === 'completed' || w.status === 'pending');
      })
      .reduce((sum, w) => sum + Math.abs(w.amount), 0);

    const monthlyUsed = allWithdrawals
      .filter(w => {
        const transactionDate = new Date(w.createdAt);
        return transactionDate >= startOfMonth && 
               (w.status === 'completed' || w.status === 'pending');
      })
      .reduce((sum, w) => sum + Math.abs(w.amount), 0);

    res.json({
      success: true,
      limits: {
        min: 50,
        max: 50000,
        daily: 50000,
        monthly: 500000,
        dailyUsed: dailyUsed,
        monthlyUsed: monthlyUsed
      }
    });

  } catch (error) {
    console.error('Limitler getirme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'İç sunucu hatası'
    });
  }
});

export default router; 