import express, { Request, Response } from 'express';
import { storage } from '../storage';
import { isAuthenticated, authMiddleware } from '../utils/auth';
import { z } from 'zod';
import { eq, desc, sql } from 'drizzle-orm';
import { transactions, deposits, withdrawals } from '../../shared/schema';
import { db } from '../db';

// validateRequest middleware için geçici bir çözüm
const validateRequest = (schema: any) => (req: Request, res: Response, next: Function) => {
  try {
    if (schema.body) {
      schema.body.parse(req.body);
    }
    if (schema.query) {
      schema.query.parse(req.query);
    }
    if (schema.params) {
      schema.params.parse(req.params);
    }
    next();
  } catch (error) {
    return res.status(400).json({ error: 'Geçersiz istek formatı' });
  }
};

const router = express.Router();

// KYC durumunu doğrulama yardımcı fonksiyonu
async function checkKycStatus(userId: number): Promise<boolean> {
  // Test modunda KYC durumunu her zaman onaylı kabul et
  if (process.env.NODE_ENV === 'development') {
    console.log('Geliştirme modu: KYC kontrolü atlanıyor, kullanıcı onaylı kabul ediliyor');
    return true;
  }
  
  // Normal işlem - veritabanından KYC durumunu kontrol et
  const kycVerification = await storage.getKycVerificationsByUser(userId);
  return kycVerification?.status === 'approved';
}

// KYC durumunu sorgulama endpoint'i
router.get('/kyc-status', isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Oturum açmanız gerekiyor' });
    }
    
    const userId = (user as any).id;
    console.log(`KYC durumu kontrol ediliyor. Kullanıcı: ${(user as any).username}, ID: ${userId}`);
    
    // Geliştirme modunda otomatik onaylı kabul et
    if (process.env.NODE_ENV === 'development') {
      console.log('Geliştirme modu - KYC durumu otomatik olarak onaylandı');
      return res.json({
        status: 'approved',
        rejectionReason: null,
        submitDate: new Date().toISOString(),
        approvalDate: new Date().toISOString()
      });
    }
    
    // Veritabanından KYC bilgisini al - normal işlem akışı
    const kycVerification = await storage.getKycVerificationsByUser(userId);
    console.log('KYC doğrulama bilgisi bulundu:', kycVerification);
    
    return res.json({
      status: kycVerification?.status || 'not_submitted',
      rejectionReason: kycVerification?.rejectionReason || null,
      submitDate: kycVerification?.createdAt || null,
      approvalDate: kycVerification?.updatedAt || null
    });
  } catch (error) {
    console.error('KYC durumu alınırken hata:', error);
    return res.status(500).json({ error: 'KYC durumu alınamadı' });
  }
});

// KYC doğrulama gönderimi
router.post('/kyc-verification', isAuthenticated, validateRequest({
  body: z.object({
    idType: z.string(),
    idNumber: z.string(),
    frontImage: z.string(),
    backImage: z.string(),
    selfieImage: z.string().optional()
  })
}), async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Oturum açmanız gerekiyor' });
    }
    
    // Mevcut KYC durumunu kontrol et
    const existingKyc = await storage.getKycVerificationsByUser((user as any).id);
    if (existingKyc && existingKyc.status === 'approved') {
      return res.status(400).json({ error: 'KYC doğrulamanız zaten onaylanmış' });
    }
    
    // Eğer reddedilmiş veya hiç başvurmamışsa yeni başvuru yap
    if (!existingKyc || existingKyc.status === 'rejected') {
      const { idType, idNumber, frontImage, backImage, selfieImage } = req.body;
      
      const kycData = {
        userId: (user as any).id,
        idType: idType || null,
        idNumber: idNumber || null,
        idFrontImage: frontImage,
        idBackImage: backImage,
        selfieImage: selfieImage || null,
        status: 'pending',
        rejectionReason: null,
        reviewedBy: null
      };
      
      const createdKyc = await storage.createKycVerification(kycData);
      
      // Kullanıcı log kaydı oluştur
      await storage.createUserLog({
        userId: (user as any).id,
        action: 'KYC_SUBMIT',
        details: `KYC başvurusu yapıldı. Kimlik türü: ${idType}`,
        ipAddress: req.ip || null
      });
      
      return res.status(201).json({
        message: 'KYC doğrulama başvurunuz alındı',
        status: 'pending',
        kycId: createdKyc.id
      });
    } else {
      // Beklemede olan bir başvuru varsa
      return res.status(400).json({ 
        error: 'Bekleyen bir KYC başvurunuz var',
        status: existingKyc.status 
      });
    }
  } catch (error) {
    console.error('KYC başvurusu yapılırken hata:', error);
    return res.status(500).json({ error: 'KYC başvurusu yapılamadı' });
  }
});

// Para yatırma isteği oluşturma
router.post('/deposit', authMiddleware, validateRequest({
  body: z.object({
    amount: z.number().min(1),
    method: z.string(),
    methodDetails: z.string().optional(),
    accountDetails: z.string().optional(),
    receipt: z.string().optional(),
    description: z.string().optional()
  })
}), async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Oturum açmanız gerekiyor' });
    }
    
    // Kullanıcı ID'sini al
    const userId = (req.user as any).id;
    console.log('Para yatırma için kullanıcı ID:', userId);
    
    if (!userId) {
      return res.status(400).json({ error: 'Geçersiz kullanıcı kimliği' });
    }
    
    // Geliştirme modunda KYC kontrolünü atla
    if (process.env.NODE_ENV !== 'development') {
      // KYC durumunu kontrol et - sadece üretim modunda
      const kycApproved = await checkKycStatus(userId);
      if (!kycApproved) {
        console.log('KYC doğrulaması gerekli, kullanıcının para yatırma işlemi reddedildi');
        return res.status(403).json({ 
          error: 'Para yatırma işlemi için KYC doğrulaması gereklidir',
          kycRequired: true
        });
      }
      console.log('KYC kontrolü tamamlandı - kullanıcı onaylanmış');
    } else {
      console.log('Geliştirme modu - KYC kontrolü atlanıyor, para yatırma işlemi onaylandı');
    }
    
    const { amount, method, methodDetails, accountDetails, receipt, description } = req.body;
    
    // Geliştirme modunda limit kontrollerini atla
    if (process.env.NODE_ENV !== 'development') {
      // Minimum ve maksimum para yatırma miktarlarını kontrol et
      if (amount < 50) {
        return res.status(400).json({ error: "Minimum para yatırma miktarı 50 TL'dir" });
      }
      
      if (amount > 100000) {
        return res.status(400).json({ error: "Maksimum para yatırma miktarı 100.000 TL'dir" });
      }
    } else {
      console.log('Geliştirme modu - para yatırma limitleri atlanıyor');
    }
    
    console.log('Para yatırma isteği alındı:', {
      userId,
      type: 'deposit',
      amount,
      method,
      methodDetails,
      accountDetails
    });
    
    // Yeni işlem oluştur
    const transaction = await storage.createTransaction({
      userId,
      type: 'deposit',
      amount,
      status: 'pending',
      method: method || null,
      methodDetails: methodDetails || null,
      accountDetails: accountDetails || null,
      receipt: receipt || null,
      description: description || null
    });
    
    // Kullanıcı log kaydı oluştur
    await storage.createUserLog({
      userId: userId,
      action: 'DEPOSIT_REQUEST',
      details: `${amount} TL para yatırma talebi oluşturuldu. Yöntem: ${method}`,
      ipAddress: req.ip || null
    });
    
    return res.status(201).json({
      message: 'Para yatırma talebiniz alındı',
      transactionId: transaction.id,
      amount,
      status: 'pending'
    });
  } catch (error) {
    console.error('Para yatırma talebi oluşturulurken hata:', error);
    return res.status(500).json({ error: 'Para yatırma talebi oluşturulamadı' });
  }
});

// Para çekme isteği oluşturma
router.post('/withdraw', isAuthenticated, validateRequest({
  body: z.object({
    amount: z.number().min(1),
    method: z.string(),
    accountDetails: z.string(),
    description: z.string().optional()
  })
}), async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Oturum açmanız gerekiyor' });
    }
    
    // Geliştirme modunda KYC kontrolünü atla
    if (process.env.NODE_ENV !== 'development') {
      // KYC durumunu kontrol et - sadece production modunda
      const kycApproved = await checkKycStatus((user as any).id);
      if (!kycApproved) {
        return res.status(403).json({ 
          error: 'Para çekme işlemi için KYC doğrulaması gereklidir',
          kycRequired: true
        });
      }
    } else {
      console.log('Geliştirme modu - KYC kontrolü atlanıyor, para çekme işlemi onaylandı');
    }
    
    const { amount, method, accountDetails, description } = req.body;
    
    // Geliştirme modunda limit kontrollerini atla
    if (process.env.NODE_ENV !== 'development') {
      // Minimum ve maksimum para çekme miktarlarını kontrol et
      if (amount < 100) {
        return res.status(400).json({ error: "Minimum para çekme miktarı 100 TL'dir" });
      }
      
      if (amount > 50000) {
        return res.status(400).json({ error: "Maksimum para çekme miktarı 50.000 TL'dir" });
      }
    } else {
      console.log('Geliştirme modu - miktar limitleri atlanıyor');
    }
    
    // Yeni işlem oluştur
    const transaction = await storage.createTransaction({
      userId: (user as any).id,
      type: 'withdraw',
      amount: -amount, // Negatif miktar
      status: 'pending',
      method: method || null,
      methodDetails: null,
      accountDetails: accountDetails || null,
      receipt: null,
      description: description || null
    });
    
    // Kullanıcı log kaydı oluştur
    await storage.createUserLog({
      userId: (user as any).id,
      action: 'WITHDRAW_REQUEST',
      details: `${amount} TL para çekme talebi oluşturuldu. Yöntem: ${method}`,
      ipAddress: req.ip || null
    });
    
    return res.status(201).json({
      message: 'Para çekme talebiniz alındı',
      transactionId: transaction.id,
      amount,
      status: 'pending'
    });
  } catch (error) {
    console.error('Para çekme talebi oluşturulurken hata:', error);
    return res.status(500).json({ error: 'Para çekme talebi oluşturulamadı' });
  }
});

// Kullanıcının finansal işlemlerini getir - session tabanlı auth
router.get('/transactions', async (req, res) => {
  try {
    // Session'dan kullanıcı ID'si al
    const userId = req.session?.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    console.log('İşlem isteği - Session userId:', userId);
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    console.log('İşlem geçmişi alınıyor:', { userId, limit, offset });
    
    try {
      // Tüm transaction tablolarından veri al ve birleştir
      const [transactionsResult, depositsResult, withdrawalsResult] = await Promise.all([
        // Ana transactions tablosundan
        db.select({
          id: transactions.id,
          transactionId: transactions.transactionId,
          type: transactions.type,
          amount: transactions.amount,
          currency: transactions.currency,
          status: transactions.status,
          paymentMethod: transactions.paymentMethod,
          description: transactions.description,
          createdAt: transactions.createdAt,
          updatedAt: transactions.updatedAt,
          processedAt: transactions.processedAt,
          balanceBefore: transactions.balanceBefore,
          balanceAfter: transactions.balanceAfter,
          source: sql`'transactions'`.as('source')
        })
        .from(transactions)
        .where(eq(transactions.userId, userId))
        .orderBy(desc(transactions.createdAt)),

        // Deposits tablosundan
        db.select({
          id: deposits.id,
          transactionId: deposits.transactionId,
          type: sql`'deposit'`.as('type'),
          amount: deposits.amount,
          currency: deposits.currency,
          status: deposits.status,
          paymentMethod: deposits.paymentMethod,
          description: sql`COALESCE(deposits.payment_method || ' ile para yatırma', 'Para yatırma')`.as('description'),
          createdAt: deposits.createdAt,
          updatedAt: deposits.updatedAt,
          processedAt: deposits.completedAt,
          balanceBefore: sql`NULL`.as('balanceBefore'),
          balanceAfter: sql`NULL`.as('balanceAfter'),
          source: sql`'deposits'`.as('source')
        })
        .from(deposits)
        .where(eq(deposits.userId, userId))
        .orderBy(desc(deposits.createdAt)),

        // Withdrawals tablosundan
        db.select({
          id: withdrawals.id,
          transactionId: withdrawals.transactionId,
          type: sql`'withdrawal'`.as('type'),
          amount: withdrawals.amount,
          currency: withdrawals.currency,
          status: withdrawals.status,
          paymentMethod: withdrawals.withdrawalMethod,
          description: sql`COALESCE(withdrawals.withdrawal_method || ' ile para çekme', 'Para çekme')`.as('description'),
          createdAt: withdrawals.createdAt,
          updatedAt: withdrawals.updatedAt,
          processedAt: withdrawals.completedAt,
          balanceBefore: sql`NULL`.as('balanceBefore'),
          balanceAfter: sql`NULL`.as('balanceAfter'),
          source: sql`'withdrawals'`.as('source')
        })
        .from(withdrawals)
        .where(eq(withdrawals.userId, userId))
        .orderBy(desc(withdrawals.createdAt))
      ]);

      // Tüm sonuçları birleştir ve tarihe göre sırala
      const allTransactions = [
        ...transactionsResult,
        ...depositsResult,
        ...withdrawalsResult
      ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(offset, offset + limit)
      .map(tx => ({
        id: tx.id,
        transactionId: tx.transactionId,
        type: tx.type,
        amount: parseFloat(tx.amount?.toString() || '0'),
        currency: tx.currency || 'TRY',
        status: tx.status,
        paymentMethod: tx.paymentMethod,
        description: tx.description,
        createdAt: tx.createdAt,
        updatedAt: tx.updatedAt,
        processedAt: tx.processedAt,
        balanceBefore: tx.balanceBefore ? parseFloat(tx.balanceBefore.toString()) : null,
        balanceAfter: tx.balanceAfter ? parseFloat(tx.balanceAfter.toString()) : null,
        source: tx.source
      }));
      
      console.log(`Birleştirilmiş ${allTransactions.length} işlem bulundu - Transactions: ${transactionsResult.length}, Deposits: ${depositsResult.length}, Withdrawals: ${withdrawalsResult.length}`);
      
      // Kullanıcının işlemlerini döndür
      return res.json(allTransactions);
      
    } catch (dbError) {
      console.error('Veritabanı sorgusu sırasında hata:', dbError);
      
      // Veritabanı hatası durumunda boş liste döndür ve hatayı bildir
      return res.status(500).json({ 
        error: 'İşlem geçmişi alınırken bir sorun oluştu, lütfen daha sonra tekrar deneyin.',
        details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
      });
    }
  } catch (error) {
    console.error('İşlem geçmişi alınırken hata:', error);
    return res.status(500).json({ error: 'İşlemler alınamadı' });
  }
});

// Kullanıcının sadece para yatırma işlemlerini getir
router.get('/transactions/deposits', isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Yetkisiz erişim' });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const transactions = await storage.getFilteredTransactions({
      userId: (user as any).id,
      type: 'deposit',
      limit,
      offset
    });
    
    return res.json(transactions);
  } catch (error) {
    console.error('Para yatırma işlemleri alınırken hata:', error);
    return res.status(500).json({ error: 'Para yatırma işlemleri alınamadı' });
  }
});

// Kullanıcının sadece para çekme işlemlerini getir
router.get('/transactions/withdrawals', isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Yetkisiz erişim' });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
    const offset = req.query.offset ? parseInt(req.query.offset as string) : 0;
    
    const transactions = await storage.getFilteredTransactions({
      userId: (user as any).id,
      type: 'withdraw',
      limit,
      offset
    });
    
    return res.json(transactions);
  } catch (error) {
    console.error('Para çekme işlemleri alınırken hata:', error);
    return res.status(500).json({ error: 'Para çekme işlemleri alınamadı' });
  }
});

// İşlemlerimin detaylarını getir
router.get('/transactions/:id', isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Oturum açmanız gerekiyor' });
    }
    
    const transactionId = parseInt(req.params.id);
    if (isNaN(transactionId)) {
      return res.status(400).json({ error: 'Geçersiz işlem ID' });
    }
    
    const transaction = await storage.getTransactionById(transactionId);
    
    if (!transaction) {
      return res.status(404).json({ error: 'İşlem bulunamadı' });
    }
    
    // Sadece kullanıcının kendi işlemlerine erişebilmesini sağla
    if (transaction.userId !== (user as any).id && (user as any).role !== 'admin') {
      return res.status(403).json({ error: 'Bu işlemi görüntüleme yetkiniz yok' });
    }
    
    return res.json(transaction);
  } catch (error) {
    console.error('İşlem detayları alınırken hata:', error);
    return res.status(500).json({ error: 'İşlem detayları alınamadı' });
  }
});

// Bekleyen işlemleri getir
router.get('/pending-transactions', isAuthenticated, async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ error: 'Oturum açmanız gerekiyor' });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    
    console.log('Bekleyen işlemler alınıyor:', { userId: (user as any).id, limit });
    
    // Filtrelenmiş işlemleri al - sadece bekleyen işlemler
    const pendingTransactions = await storage.getFilteredTransactions({
      userId: (user as any).id,
      status: 'pending',
      limit: limit
    });
    
    console.log('Bekleyen işlemler başarıyla alındı:', pendingTransactions.length);
    
    return res.json(pendingTransactions);
  } catch (error) {
    console.error('Bekleyen işlemler alınırken hata:', error);
    return res.status(500).json({ error: 'Bekleyen işlemler alınamadı' });
  }
});

export default router;