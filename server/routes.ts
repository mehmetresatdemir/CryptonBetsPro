import type { Express } from "express";
import { createServer, type Server } from "http";
import { websocketManager } from "./websocket";
import authRouter from './routes/auth';
import slotegratorRouter from './routes/slotegrator';
import fastSlotsRouter from './routes/fast-slots';
import adminRouter from './routes/admin';
import adminAnalyticsSafeRouter from './routes/admin-analytics-safe';
import adminAdvancedAnalytics from './routes/admin-advanced-analytics';
import adminGameOptimization from './routes/admin-game-optimization';
import adminRealTimeNotifications from './routes/admin-real-time-notifications';
import { adminReportsRouter } from './routes/admin-reports';
import { userLogsRouter } from './routes/user-logs';
import transactionsRouter from './routes/transactions';
import kycRouter from './routes/kyc';
import userManagementRouter from './routes/user-management';
import depositsRouter from './routes/deposits';
import withdrawalsRouter from './routes/withdrawals';
import professionalDepositsRouter from './routes/professional-deposits';
import professionalWithdrawalsRouter from './routes/professional-withdrawals';

import userRouter from './routes/user';
import gameSessionRouter from './routes/game-sessions';
import securityRouter from './routes/security-fixed';
import adminGamesRouter from './routes/admin-games';
import adminBonusesRouter from './routes/admin-bonuses';

import bannersRouter from './routes/banners';
import publicBannersRouter from './routes/public-banners';
import adminSettingsRouter from './routes/admin-settings';
import adminThemesRouter from './routes/admin-themes';
import adminIntegrationsRouter from './routes/admin-integrations';
import adminEmailTemplatesRouter from './routes/admin-email-templates';
import vipRoutes from './routes/vip';
import adminSupportRouter from './routes/admin-support';
import adminKycRouter from './routes/admin-kyc';
import adminTransactionsRouter from './routes/admin-transactions';
import userBetsRouter from './routes/user-bets';
import paymentIntegrationRouter from './routes/payment-integration';
import withdrawalRoutes from './routes/withdrawal';

import { authMiddleware, guestChatMiddleware } from './utils/auth';
import * as chatRoutes from './routes/chat';
import { db } from './db';
import { users, transactions, userLogs } from '../shared/schema';
import { eq, and, desc } from 'drizzle-orm';

// Kripto para yardımcı fonksiyonlar
function validateCryptoAddress(address: string, cryptoType: string): { valid: boolean; error?: string } {
  if (!address || typeof address !== 'string') {
    return { valid: false, error: 'Adres boş olamaz' };
  }

  switch (cryptoType) {
    case 'bsc':
      // BSC (Binance Smart Chain) - Ethereum benzeri adres formatı
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return { valid: false, error: 'BSC adresi 0x ile başlamalı ve 42 karakter uzunluğunda olmalı' };
      }
      break;
    case 'eth':
      // Ethereum adresi
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        return { valid: false, error: 'Ethereum adresi 0x ile başlamalı ve 42 karakter uzunluğunda olmalı' };
      }
      break;
    case 'tron':
      // TRON adresi - T ile başlar ve 34 karakter
      if (!/^T[A-Za-z0-9]{33}$/.test(address)) {
        return { valid: false, error: 'TRON adresi T ile başlamalı ve 34 karakter uzunluğunda olmalı' };
      }
      break;
    default:
      return { valid: false, error: 'Desteklenmeyen kripto türü' };
  }

  return { valid: true };
}

// Default kripto cüzdan adresleri - CryptonBets için özel adresler
function getDefaultCryptoAddress(cryptoType: string): string {
  const defaultAddresses = {
    bsc: '0x742B8E61E8d3F1F1E0E3E8D5C4F3E2D1C0B9A8F7',     // BSC default adresi
    eth: '0x8E3F1F1E0E3E8D5C4F3E2D1C0B9A8F7742B8E61',     // Ethereum default adresi
    tron: 'TQF2E1D0B9A8F7742B8E61E8D3F1F1E0E3E8D5C4F',    // TRON default adresi
    trc20: 'TQF2E1D0B9A8F7742B8E61E8D3F1F1E0E3E8D5C4F',   // TRC20 default adresi
    erc20: '0x8E3F1F1E0E3E8D5C4F3E2D1C0B9A8F7742B8E61'     // ERC20 default adresi
  };

  return defaultAddresses[cryptoType as keyof typeof defaultAddresses] || defaultAddresses.bsc;
}

// Kripto türünü normalize et (XPay API uyumlu)
function normalizeCryptoType(cryptoType: string): string {
  const typeMapping = {
    bsc: 'bsc',
    eth: 'erc20',
    ethereum: 'erc20',
    tron: 'trc20',
    trc20: 'trc20',
    erc20: 'erc20'
  };

  return typeMapping[cryptoType as keyof typeof typeMapping] || 'trc20';
}

function getCryptoProcessingTime(cryptoType: string): string {
  switch (cryptoType) {
    case 'bsc':
      return '5-15 dakika';
    case 'eth':
    case 'erc20':
      return '10-30 dakika';
    case 'tron':
    case 'trc20':
      return '3-10 dakika';
    default:
      return '10-30 dakika';
  }
}

function getCryptoNetworkName(cryptoType: string): string {
  switch (cryptoType) {
    case 'bsc':
      return 'Binance Smart Chain (BSC)';
    case 'eth':
    case 'erc20':
      return 'Ethereum Network';
    case 'tron':
    case 'trc20':
      return 'TRON Network';
    default:
      return 'Bilinmeyen Ağ';
  }
}

// WebSocket broadcast function for admin stats
export function broadcastAdminStats(statsData: any) {
  websocketManager.broadcastToAdmins({
    type: 'admin_stats_update',
    data: statsData
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth API rotalarını kaydet
  app.use('/api/auth', authRouter);
  
  // Slotegrator API rotalarını kaydet
  app.use('/api/slotegrator', slotegratorRouter);
  
  // Fast slots endpoint - anında yanıt
  app.use('/api', fastSlotsRouter);
  
  // Admin API rotalarını kaydet
  app.use('/api/admin', adminRouter);
  app.use('/api/admin', adminAnalyticsSafeRouter);
  app.use('/api/admin', adminAdvancedAnalytics);
  app.use('/api/admin', adminGameOptimization);
  app.use('/api/admin', adminRealTimeNotifications);
  app.use('/api/admin', adminReportsRouter);
  app.use('/api/admin/user-logs', userLogsRouter);
  app.use('/api/admin/transactions', transactionsRouter);
  app.use('/api/admin/users', userManagementRouter);
  app.use('/api/admin/deposits', depositsRouter);
  app.use('/api/withdrawals-direct', professionalWithdrawalsRouter);

  app.use('/api/admin/security', securityRouter);
  app.use('/api/admin/games', adminGamesRouter);
  app.use('/api/admin/bonuses', adminBonusesRouter);

  app.use('/api/admin/banners', bannersRouter);
  
  // Public banner endpoint for website display
  app.use('/api/banners', publicBannersRouter);
  app.use('/api/admin', adminSettingsRouter);
  app.use('/api/admin', adminThemesRouter);
  app.use('/api/admin', adminIntegrationsRouter);
  app.use('/api/admin/email-templates', adminEmailTemplatesRouter);
  app.use('/api/admin/vip', vipRoutes);
  app.use('/api/admin/support', adminSupportRouter);
  app.use('/api/admin/kyc', adminKycRouter);
  app.use('/api/admin/transactions', adminTransactionsRouter);
  
  // Profesyonel para yatırma ve çekme API rotalarını kaydet
  app.use('/api/professional-deposits', professionalDepositsRouter);
  app.use('/api/professional-withdrawals', professionalWithdrawalsRouter);
  
  // Kullanıcılar için ödeme hesapları API'si

  
  // Payment integration API for finance company
  app.use('/api/payment', paymentIntegrationRouter);
  
  // Public payment API endpoints (CORS enabled) - Proxy to real XPay server
  app.get('/api/public/payment-methods', async (req, res) => {
    try {
      // Gerçek XPay sunucusuna proxy yap
      const fetch = (await import('node-fetch')).default;
      const response = await fetch('https://pay.cryptonbets1.com/api/public/payment-methods', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 XPay API Payment Methods Response (pay.cryptonbets1.com):');
      console.log('Status:', response.status, response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers));
      
      if (response.ok) {
        const data: any = await response.json();
        console.log('✅ XPay API Success Response:', JSON.stringify(data, null, 2));
        
        // Eğer API response success ama data boşsa fallback kullan
        if (data.success && data.data && data.data.length > 0) {
          // Response'taki "kart" ID'sini "kredikarti" olarak dönüştür ve duplicate kripto'yu filtrele
          const transformedMethods = data.data
            .filter((method: any) => method.id !== 'kripto') // 'kripto' ID'sini kaldır, 'crypto' kalsın
            .map((method: any) => {
              if (method.id === 'kart') {
                return {
                  ...method,
                  id: 'kredikarti',
                  name: method.name || 'Kredi Kartı'
                };
              }
              return method;
            });

          // Kullanıcı istediği sıralama: Havale, Kredi Kartı, Papara, Kripto, PayCo
          const sortOrder = ['havale', 'kredikarti', 'papara', 'kripto', 'crypto', 'payco'];
          
          // Sıralama fonksiyonu
          const sortedMethods = transformedMethods.sort((a: any, b: any) => {
            const aIndex = sortOrder.indexOf(a.id);
            const bIndex = sortOrder.indexOf(b.id);
            
            // Eğer her ikisi de listede varsa, index'e göre sırala
            if (aIndex !== -1 && bIndex !== -1) {
              return aIndex - bIndex;
            }
            // Eğer sadece a listede varsa, a'yı önce koy
            if (aIndex !== -1) return -1;
            // Eğer sadece b listede varsa, b'yi önce koy
            if (bIndex !== -1) return 1;
            // Eğer hiçbiri listede yoksa, alfabetik sırala
            return a.name.localeCompare(b.name);
          });

          const transformedData = {
            ...data,
            data: sortedMethods
          };
          
          console.log('🔄 Transformed payment methods response:', JSON.stringify(transformedData, null, 2));
          return res.json(transformedData);
        } else {
          console.log('⚠️ XPay API returned empty data:', data);
          throw new Error('Empty payment methods data');
        }
      } else {
        const errorText = await response.text();
        console.log('❌ XPay API Error Response:', errorText);
        
        // XPay API'den gelen gerçek hata mesajını parse et
        try {
          const errorData = JSON.parse(errorText);
          return res.status(400).json({
            success: false,
            error: errorData.error || 'Ödeme yöntemleri yüklenemedi.',
            code: errorData.code || 'PAYMENT_METHODS_ERROR',
            xpay_response: errorData
          });
        } catch {
          return res.status(400).json({
            success: false,
            error: errorText || 'Ödeme yöntemleri yüklenemedi.',
            code: 'PAYMENT_METHODS_ERROR'
          });
        }
      }
    } catch (error) {
      console.error('XPay API payment methods hatası:', error);
      return res.status(500).json({
        success: false,
        error: 'Ödeme yöntemleri yüklenemedi. Lütfen tekrar deneyin.',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  app.post('/api/public/deposit/create', async (req, res) => {
    try {
      // Request body'den user bilgilerini al
      const { user_id, amount, payment_method_id, user_name, user_email, tc_number } = req.body;
      
      // User ID kontrolü
      if (!user_id) {
        return res.status(400).json({
          success: false,
          error: 'User ID gerekli'
        });
      }

      // Kredi kartı ödemesi için TC kimlik numarası kontrolü
      if (payment_method_id === 'kredikarti' && !tc_number) {
        return res.status(400).json({
          success: false,
          error: 'Kredi kartı ödemesi için TC kimlik numarası gereklidir'
        });
      }

      // TC kimlik numarası format kontrolü (11 haneli)
      if (tc_number && !/^\d{11}$/.test(tc_number)) {
        return res.status(400).json({
          success: false,
          error: 'TC kimlik numarası 11 haneli sayı olmalıdır'
        });
      }

      // Kripto payment method ID'si kontrolü - sadece withdrawal destekli
      if (payment_method_id === 'kripto') {
        return res.status(400).json({
          success: false,
          error: 'kripto yatırım için desteklenmiyor',
          code: 'DEPOSIT_FAILED',
          note: 'Kripto para yatırma için payment_method_id: "crypto" kullanın'
        });
      }

      // Crypto payment method için crypto_address veya walletAddress gerekli
      if (payment_method_id === 'crypto' && !req.body.crypto_address && !req.body.walletAddress) {
        return res.status(400).json({
          success: false,
          error: 'Kripto para işlemleri için cüzdan adresi gereklidir'
        });
      }

      // XPay API için doğru formatta request body oluştur
      const xpayRequestBody: any = {
        amount: Number(amount),
        payment_method_id: payment_method_id,
        user_id: Number(user_id), // String'den number'a çevir
        user_name: user_name || req.body.user_name,
        user_email: user_email || req.body.user_email,
        return_url: req.body.return_url || 'https://cryptonbets1.com/payment/return',
        callback_url: req.body.callback_url || 'https://pay.cryptonbets1.com/api/public/deposit/callback',
        site_reference_number: req.body.site_reference_number || `ORDER_${Date.now()}`,
        firstName: req.body.firstName || 'User',
        lastName: req.body.lastName || 'Name'
      };

      // Payment method'a göre gerekli alanları ekle
      if (payment_method_id === 'crypto' || payment_method_id === 'kripto') {
        const cryptoType = req.body.crypto_type || 'tron';
        const normalizedType = normalizeCryptoType(cryptoType);
        const userAddress = req.body.crypto_address || req.body.walletAddress;
        const finalAddress = userAddress || getDefaultCryptoAddress(cryptoType);
        
        console.log(`🏦 Genel endpoint kripto adres: ${userAddress ? 'Kullanıcı' : 'Default'} adresi kullanılıyor:`, finalAddress);
        
        xpayRequestBody.crypto_type = normalizedType;
        // XPay API'sinde walletAddress field'ı bekleniyor
        xpayRequestBody.walletAddress = finalAddress;
        // Geriye dönük uyumluluk için crypto_address'i de gönder
        xpayRequestBody.crypto_address = finalAddress;
      }

      // TC kimlik numarası varsa ekle
      if (tc_number) {
        xpayRequestBody.tc_number = tc_number;
      }

      // Diğer payment method'lar için gerekli alanları ekle
      if (payment_method_id === 'havale') {
        xpayRequestBody.iban = req.body.iban;
        xpayRequestBody.bank_name = req.body.bank_name;
        xpayRequestBody.account_name = req.body.account_name;
      }

      if (payment_method_id === 'papara') {
        xpayRequestBody.papara_id = req.body.papara_id;
      }

      if (payment_method_id === 'payco') {
        xpayRequestBody.pay_co_id = req.body.pay_co_id;
        xpayRequestBody.pay_co_full_name = req.body.pay_co_full_name;
      }

      if (payment_method_id === 'pep') {
        xpayRequestBody.pep_id = req.body.pep_id;
      }

      if (payment_method_id === 'paratim') {
        xpayRequestBody.paratim_id = req.body.paratim_id;
      }

      console.log('📤 XPay API Deposit Create Request:', JSON.stringify(xpayRequestBody, null, 2));

      // Gerçek XPay sunucusuna proxy yap
      const fetch = (await import('node-fetch')).default;
      let response;
      
      try {
        // 30 saniye timeout için AbortController kullan
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        response = await fetch('https://pay.cryptonbets1.com/api/public/deposit/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(xpayRequestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('🔍 XPay API Deposit Create Response (pay.cryptonbets1.com):');
        console.log('Status:', response.status, response.statusText);
        console.log('Headers:', Object.fromEntries(response.headers));
        
        if (response.ok) {
          const data: any = await response.json();
          console.log('✅ XPay API Deposit Success Response:', JSON.stringify(data, null, 2));
          
          // XPay'den başarılı response gelirse, local veritabanına transaction kaydı oluştur
          if (data.success && data.data?.transaction_id) {
            try {
              // Local veritabanına transaction kaydı oluştur
              await db.insert(transactions).values({
                transactionId: data.data.transaction_id, // XPay transaction ID'si
                userId: parseInt(user_id),
                type: 'deposit',
                amount: Number(amount),
                currency: 'TRY',
                status: 'pending',
                paymentMethod: payment_method_id,
                description: `XPay para yatırma - ${payment_method_id}`,
                referenceId: data.data.gateway_reference || null,
                createdAt: new Date()
              });
              
              console.log('✅ Local transaction kaydı oluşturuldu:', {
                transactionId: data.data.transaction_id,
                userId: user_id,
                amount
              });
              
            } catch (dbError) {
              console.error('⚠️ Local transaction kaydı oluşturulamadı:', dbError);
              // DB hatası transaction'ı durdurmaz, XPay'e devam et
            }
          }
          
          return res.json(data);
        } else {
          const errorText = await response.text();
          console.log('❌ XPay API Deposit Error Response:', errorText);
          
          // XPay API'den gelen gerçek hata mesajını parse et
          try {
            const errorData = JSON.parse(errorText);
            
            // Crypto payment method için fallback response
            if (payment_method_id === 'crypto' && (errorData.error === 'Bir hata oluştu.' || errorData.code === 'DEPOSIT_FAILED')) {
              console.log('💡 Crypto payment method için fallback response oluşturuluyor');
              
              // Fallback transaction ID oluştur
              const fallbackTransactionId = `pub_${Date.now()}`;
              
              try {
                // Local veritabanına transaction kaydı oluştur
                await db.insert(transactions).values({
                  transactionId: fallbackTransactionId,
                  userId: parseInt(user_id),
                  type: 'deposit',
                  amount: Number(amount),
                  currency: 'TRY',
                  status: 'pending',
                  paymentMethod: payment_method_id,
                  description: `Crypto para yatırma (Fallback) - ${payment_method_id}`,
                  referenceId: xpayRequestBody.site_reference_number,
                  createdAt: new Date()
                });
                
                console.log('✅ Fallback transaction kaydı oluşturuldu:', {
                  transactionId: fallbackTransactionId,
                  userId: user_id,
                  amount
                });
                
                return res.json({
                  success: true,
                  data: {
                    transaction_id: fallbackTransactionId,
                    amount: Number(amount),
                    payment_method: payment_method_id,
                    status: 'pending',
                    estimated_time: '10-60 dakika',
                    gateway_reference: xpayRequestBody.site_reference_number,
                    is_public: true,
                    xpay_status: 'error',
                    crypto_address: xpayRequestBody.crypto_address,
                    crypto_type: xpayRequestBody.crypto_type,
                    instructions: {
                      title: 'Kripto Para Yatırma',
                      description: 'Kripto para yatırma işlemi başlatıldı',
                      crypto_address: xpayRequestBody.crypto_address,
                      crypto_type: xpayRequestBody.crypto_type,
                      amount: Number(amount)
                    }
                  },
                  message: 'Para yatırma işlemi başlatıldı (Public API - Fallback)'
                });
                
              } catch (dbError) {
                console.error('⚠️ Fallback transaction kaydı oluşturulamadı:', dbError);
              }
            }
            
            return res.status(400).json({
              success: false,
              error: errorData.error || 'Ödeme işlemi başlatılamadı.',
              code: errorData.code || 'PAYMENT_ERROR',
              xpay_response: errorData
            });
            
          } catch {
            return res.status(400).json({
              success: false,
              error: errorText || 'Ödeme işlemi başlatılamadı.',
              code: 'PAYMENT_ERROR'
            });
          }
        }
        
      } catch (fetchError) {
        console.error('🚫 XPay API isteği başarısız:', fetchError);
        
        // Network hatası durumunda crypto için fallback response
        if (payment_method_id === 'crypto') {
          console.log('💡 Network hatası - Crypto payment method için fallback response oluşturuluyor');
          
          const fallbackTransactionId = `pub_${Date.now()}`;
          
          try {
            await db.insert(transactions).values({
              transactionId: fallbackTransactionId,
              userId: parseInt(user_id),
              type: 'deposit',
              amount: Number(amount),
              currency: 'TRY',
              status: 'pending',
              paymentMethod: payment_method_id,
              description: `Crypto para yatırma (Network Fallback) - ${payment_method_id}`,
              referenceId: xpayRequestBody.site_reference_number,
              createdAt: new Date()
            });
            
            return res.json({
              success: true,
              data: {
                transaction_id: fallbackTransactionId,
                amount: Number(amount),
                payment_method: payment_method_id,
                status: 'pending',
                estimated_time: '10-60 dakika',
                gateway_reference: xpayRequestBody.site_reference_number,
                is_public: true,
                xpay_status: 'network_error',
                crypto_address: xpayRequestBody.crypto_address,
                crypto_type: xpayRequestBody.crypto_type
              },
              message: 'Para yatırma işlemi başlatıldı (Network Fallback)'
            });
            
          } catch (dbError) {
            console.error('⚠️ Network fallback transaction kaydı oluşturulamadı:', dbError);
          }
        }
        
        return res.status(500).json({
          success: false,
          error: 'XPay API erişilemiyor. Lütfen daha sonra tekrar deneyin.',
          code: 'NETWORK_ERROR'
        });
      }
    } catch (error) {
      console.error('XPay API deposit hatası:', error);
      return res.status(500).json({
        success: false,
        error: 'Ödeme işlemi başlatılamadı. Lütfen tekrar deneyin.',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  app.get('/api/public/deposit/status/:transactionId', async (req, res) => {
    try {
      // Gerçek XPay sunucusuna proxy yap
      const fetch = (await import('node-fetch')).default;
      console.log('🔍 XPay API Deposit Status Request for transaction:', req.params.transactionId);
      
      const response = await fetch(`https://pay.cryptonbets1.com/api/public/deposit/status/${req.params.transactionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      console.log('🔍 XPay API Deposit Status Response (pay.cryptonbets1.com):');
      console.log('Status:', response.status, response.statusText);
      console.log('Headers:', Object.fromEntries(response.headers));
      
      if (response.ok) {
        const data: any = await response.json();
        console.log('✅ XPay API Status Success Response:', JSON.stringify(data, null, 2));
        return res.json(data);
      } else {
        const errorText = await response.text();
        console.log('❌ XPay API Status Error Response:', errorText);
        
        // XPay API'den gelen gerçek hata mesajını parse et
        try {
          const errorData = JSON.parse(errorText);
          return res.status(400).json({
            success: false,
            error: errorData.error || 'İşlem durumu sorgulanamadı.',
            code: errorData.code || 'STATUS_ERROR',
            xpay_response: errorData
          });
        } catch {
          return res.status(400).json({
            success: false,
            error: errorText || 'İşlem durumu sorgulanamadı.',
            code: 'STATUS_ERROR'
          });
        }
      }
    } catch (error) {
      console.error('XPay API status hatası:', error);
      return res.status(500).json({
        success: false,
        error: 'İşlem durumu sorgulanamadı. Lütfen tekrar deneyin.',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // XPay API callback endpoint - ödeme tamamlandığında XPay bu endpoint'e callback yapar
  app.post('/api/public/deposit/callback', async (req, res) => {
    try {
      console.log('💳 XPay Callback alındı:', JSON.stringify(req.body, null, 2));
      
      const { transaction_id, status, amount, payment_method, user_id } = req.body;

      if (!transaction_id || !status) {
        console.log('❌ XPay Callback eksik parametreler:', req.body);
        return res.status(400).json({
          success: false,
          error: 'Missing required parameters'
        });
      }

      // Transaction ID'den user_id'yi bulabiliriz veya req.body'den alırız
      let userId = user_id;
      let transaction = null;
      
      // Local veritabanından transaction'ı bul
      try {
        const transactionQuery = await db
          .select()
          .from(transactions)
          .where(eq(transactions.transactionId, transaction_id))
          .limit(1);
        
        if (transactionQuery.length > 0) {
          transaction = transactionQuery[0];
          userId = transaction.userId;
          console.log('✅ Transaction local veritabanında bulundu:', {
            transactionId: transaction_id,
            userId,
            amount: transaction.amount
          });
        } else {
          console.log('⚠️ Transaction local veritabanında bulunamadı:', transaction_id);
        }
      } catch (dbError) {
        console.error('⚠️ Transaction sorgulama hatası:', dbError);
      }

      if (!userId) {
        console.log('❌ User ID bulunamadı transaction için:', transaction_id);
        return res.status(400).json({
          success: false,
          error: 'User ID not found'
        });
      }

      // Ödeme başarılı ise bakiye güncelle
      if (status === 'completed' || status === 'success') {
        console.log('✅ XPay ödeme başarılı - bakiye güncelleniyor:', {
          userId,
          amount,
          transaction_id
        });

        // Kullanıcıyı bul
        const [user] = await db.select().from(users).where(eq(users.id, userId));

        if (!user) {
          console.log('❌ Kullanıcı bulunamadı:', userId);
          return res.status(404).json({
            success: false,
            error: 'User not found'
          });
        }

        const oldBalance = Number(user.balance || 0);
        const depositAmount = Number(amount);
        const newBalance = oldBalance + depositAmount;

        // Bakiye güncelle
        await db.update(users)
          .set({
            balance: newBalance,
            totalDeposits: Number(user.totalDeposits || 0) + depositAmount
          })
          .where(eq(users.id, userId));

        console.log('💰 XPay Bakiye güncellendi:', {
          userId,
          oldBalance,
          depositAmount,
          newBalance
        });

        // Transaction status'unu completed olarak güncelle
        if (transaction) {
          try {
            await db.update(transactions)
              .set({
                status: 'completed',
                balanceBefore: oldBalance,
                balanceAfter: newBalance,
                processedAt: new Date(),
                updatedAt: new Date()
              })
              .where(eq(transactions.transactionId, transaction_id));
            
            console.log('✅ Transaction status güncellendi: completed');
          } catch (txnUpdateError) {
            console.error('⚠️ Transaction status güncellenemedi:', txnUpdateError);
          }
        }

        // User log ekle
        try {
          await db.insert(userLogs).values({
            userId: userId,
            action: 'xpay_deposit_completed',
            description: `XPay para yatırma tamamlandı: ${depositAmount} TL (Transaction: ${transaction_id})`,
            category: 'financial',
            ipAddress: req.ip || 'Unknown',
            userAgent: req.get('User-Agent') || 'Unknown',
            createdAt: new Date()
          });
        } catch (logError) {
          console.error('⚠️ XPay User log oluşturulamadı:', logError);
        }

        return res.json({
          success: true,
          message: 'XPay ödeme başarıyla işlendi',
          transaction_id,
          user_id: userId,
          new_balance: newBalance
        });
      } else {
        console.log('⚠️ XPay ödeme başarısız:', { status, transaction_id });
        return res.json({
          success: true,
          message: 'XPay ödeme durumu kaydedildi',
          transaction_id,
          status
        });
      }

    } catch (error) {
      console.error('❌ XPay Callback error:', error);
      return res.status(500).json({
        success: false,
        error: 'XPay callback processing failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // 🔧 Callback Test Endpoint - Debug için
  app.post('/api/public/callback/test', async (req, res) => {
    try {
      console.log('🧪 TEST Callback alındı:', JSON.stringify(req.body, null, 2));
      console.log('🧪 TEST Headers:', JSON.stringify(req.headers, null, 2));
      
      return res.json({
        success: true,
        message: 'Callback test başarılı',
        received_data: req.body,
        headers: req.headers,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('❌ Callback test error:', error);
      return res.status(500).json({
        success: false,
        error: 'Callback test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // 🧪 Manuel Callback Test - Belirli transaction için
  app.post('/api/public/test-callback/:transactionId', async (req, res) => {
    try {
      const { transactionId } = req.params;
      console.log(`🧪 Manuel callback test başlatılıyor: ${transactionId}`);
      
      // Test callback data oluştur
      const testCallbackData = {
        transaction_id: transactionId,
        status: 'success', // veya 'completed'
        amount: req.body.amount || 2500,
        payment_method: req.body.payment_method || 'havale',
        user_id: req.body.user_id || '1',
        timestamp: new Date().toISOString(),
        test: true
      };
      
      console.log('🧪 Test callback data:', testCallbackData);
      
      // Normal callback endpoint'ini çağır
      const callbackResponse = await fetch(`${req.protocol}://${req.get('host')}/api/public/deposit/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testCallbackData)
      });
      
      const callbackResult = await callbackResponse.json();
      
      return res.json({
        success: true,
        message: 'Manuel callback test tamamlandı',
        test_data: testCallbackData,
        callback_response: callbackResult
      });
    } catch (error) {
      console.error('❌ Manuel callback test hatası:', error);
      return res.status(500).json({
        success: false,
        error: 'Manuel callback test başarısız',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // 🔍 Callback Debug Endpoint - Transaction durumunu kontrol et
  app.get('/api/public/callback/debug/:transactionId', async (req, res) => {
    try {
      const { transactionId } = req.params;
      console.log('🔍 Callback debug için transaction aranıyor:', transactionId);
      
      // Transaction'ı bul
      const transactionQuery = await db
        .select()
        .from(transactions)
        .where(eq(transactions.transactionId, transactionId))
        .limit(1);
      
      if (transactionQuery.length === 0) {
        return res.json({
          success: false,
          error: 'Transaction bulunamadı',
          transaction_id: transactionId
        });
      }
      
      const transaction = transactionQuery[0];
      
      // User'ı bul
      const [user] = await db.select().from(users).where(eq(users.id, transaction.userId));
      
      return res.json({
        success: true,
        transaction: {
          id: transaction.transactionId,
          status: transaction.status,
          amount: transaction.amount,
          userId: transaction.userId,
          createdAt: transaction.createdAt,
          processedAt: transaction.processedAt
        },
        user: user ? {
          id: user.id,
          username: user.username,
          balance: user.balance,
          totalDeposits: user.totalDeposits
        } : null
      });
    } catch (error) {
      console.error('❌ Callback debug error:', error);
      return res.status(500).json({
        success: false,
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Kripto Para Yatırma Endpoint - Özel API
  app.post('/api/public/crypto-deposit', async (req, res) => {
    try {
      const {
        payment_method_id,
        amount,
        user,
        user_name,
        user_id,
        site_reference_number,
        return_url,
        user_email,
        crypto_type,
        crypto_address
      } = req.body;

      // Validasyonlar
      if (!payment_method_id || payment_method_id !== 'crypto') {
        return res.status(400).json({
          success: false,
          error: 'Geçersiz ödeme yöntemi. payment_method_id: "crypto" olmalı'
        });
      }

      if (!amount || amount <= 0) {
        return res.status(400).json({
          success: false,
          error: 'Geçersiz miktar'
        });
      }

      if (!user || !user_name || !user_id) {
        return res.status(400).json({
          success: false,
          error: 'Kullanıcı bilgileri eksik'
        });
      }

      if (!user_email) {
        return res.status(400).json({
          success: false,
          error: 'E-posta adresi gerekli'
        });
      }

      if (!crypto_type || !['bsc', 'eth', 'tron'].includes(crypto_type)) {
        return res.status(400).json({
          success: false,
          error: 'Desteklenmeyen kripto türü. Desteklenen türler: bsc, eth, tron'
        });
      }

      // Kripto cüzdan adresi yoksa default adresi kullan
      const finalCryptoAddress = crypto_address || getDefaultCryptoAddress(crypto_type);
      
      console.log(`🏦 Kripto adres kontrolü: ${crypto_address ? 'Kullanıcı adresi' : 'Default adres'} kullanılıyor:`, finalCryptoAddress);

      // Kripto adres format kontrolü
      const addressValidation = validateCryptoAddress(finalCryptoAddress, crypto_type);
      if (!addressValidation.valid) {
        return res.status(400).json({
          success: false,
          error: `Geçersiz ${crypto_type.toUpperCase()} adresi: ${addressValidation.error}`
        });
      }

      // Benzersiz transaction ID oluştur
      const transactionId = `CRYPTO_${Date.now()}_${crypto_type.toUpperCase()}_${Math.random().toString(36).substr(2, 9)}`;

      // Crypto type'ı XPay API uyumlu hale getir
      const normalizedCryptoType = normalizeCryptoType(crypto_type);

      // XPay API'sine kripto para yatırma isteği gönder
      const xpayRequestBody = {
        payment_method_id: 'crypto',
        amount: Number(amount),
        user: user,
        user_name: user_name,
        user_id: user_id,
        site_reference_number: site_reference_number || transactionId,
        return_url: return_url || 'https://cryptonbets1.com/crypto-success',
        user_email: user_email,
        crypto_type: normalizedCryptoType,
        // XPay API'sinde walletAddress field'ı bekleniyor
        walletAddress: finalCryptoAddress,
        // Geriye dönük uyumluluk için crypto_address'i de gönder
        crypto_address: finalCryptoAddress,
        // İsteğe bağlı firstName/lastName alanları
        firstName: user_name || 'User',
        lastName: 'CryptoBets'
      };

      console.log('📤 Kripto Para Yatırma API İsteği:', JSON.stringify(xpayRequestBody, null, 2));

      // Gerçek XPay sunucusuna istek gönder
      const fetch = (await import('node-fetch')).default;
      let response;
      
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000);
        
        response = await fetch('https://pay.cryptonbets1.com/api/public/crypto-deposit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(xpayRequestBody),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        console.log('🔍 XPay Kripto API Yanıtı:', response.status, response.statusText);
        
        if (response.ok) {
          const data: any = await response.json();
          console.log('✅ XPay Kripto API Başarılı:', JSON.stringify(data, null, 2));
          
          // Local veritabanına transaction kaydı oluştur
          if (data.success && data.data?.transaction_id) {
            try {
              await db.insert(transactions).values({
                transactionId: data.data.transaction_id,
                userId: parseInt(user_id),
                type: 'deposit',
                amount: Number(amount),
                currency: 'TRY',
                status: 'pending',
                paymentMethod: 'crypto',
                description: `Kripto para yatırma - ${crypto_type.toUpperCase()}`,
                referenceId: site_reference_number || transactionId,
                paymentDetails: {
                  crypto_type: crypto_type,
                  normalized_crypto_type: normalizedCryptoType,
                  crypto_address: finalCryptoAddress,
                  original_crypto_address: crypto_address,
                  is_default_address: !crypto_address,
                  gateway_reference: data.data.gateway_reference,
                  payment_url: data.data.payment_url
                },
                createdAt: new Date()
              });
              
              console.log('✅ Local transaction kaydı oluşturuldu:', {
                transactionId: data.data.transaction_id,
                userId: user_id,
                amount,
                crypto_type,
                crypto_address
              });
              
            } catch (dbError) {
              console.error('⚠️ Local transaction kaydı oluşturulamadı:', dbError);
            }
          }
          
          return res.json(data);
        } else {
          const errorText = await response.text();
          console.log('❌ XPay Kripto API Hata:', errorText);
          
          // Fallback kripto para yatırma response
          const fallbackTransactionId = `CRYPTO_FALLBACK_${Date.now()}_${crypto_type.toUpperCase()}`;
          
          try {
            // Local veritabanına fallback transaction kaydı oluştur
            await db.insert(transactions).values({
              transactionId: fallbackTransactionId,
              userId: parseInt(user_id),
              type: 'deposit',
              amount: Number(amount),
              currency: 'TRY',
              status: 'pending',
              paymentMethod: 'crypto',
              description: `Kripto para yatırma (Fallback) - ${crypto_type.toUpperCase()}`,
              referenceId: site_reference_number || transactionId,
              paymentDetails: {
                crypto_type: crypto_type,
                normalized_crypto_type: normalizedCryptoType,
                crypto_address: finalCryptoAddress,
                original_crypto_address: crypto_address,
                is_default_address: !crypto_address,
                fallback_mode: true,
                original_error: errorText
              },
              createdAt: new Date()
            });
            
            console.log('✅ Fallback transaction kaydı oluşturuldu:', {
              transactionId: fallbackTransactionId,
              userId: user_id,
              amount,
              crypto_type,
              crypto_address
            });
            
            return res.json({
              success: true,
              data: {
                transaction_id: fallbackTransactionId,
                amount: Number(amount),
                payment_method: 'crypto',
                status: 'pending',
                estimated_time: getCryptoProcessingTime(crypto_type),
                gateway_reference: site_reference_number || transactionId,
                crypto_type: crypto_type,
                normalized_crypto_type: normalizedCryptoType,
                crypto_address: finalCryptoAddress,
                original_crypto_address: crypto_address,
                is_default_address: !crypto_address,
                is_fallback: true,
                instructions: {
                  title: `${crypto_type.toUpperCase()} Para Yatırma`,
                  description: `${crypto_type.toUpperCase()} ağında ${amount} TL değerinde kripto para yatırma işlemi başlatıldı`,
                  crypto_address: finalCryptoAddress,
                  crypto_type: crypto_type,
                  normalized_crypto_type: normalizedCryptoType,
                  amount: Number(amount),
                  network: getCryptoNetworkName(crypto_type),
                  note: !crypto_address ? 'Varsayılan CryptonBets cüzdanı kullanılıyor' : 'Kullanıcı cüzdanı kullanılıyor'
                }
              },
              message: 'Kripto para yatırma işlemi başlatıldı (Fallback Mode)'
            });
            
          } catch (dbError) {
            console.error('⚠️ Fallback transaction kaydı oluşturulamadı:', dbError);
            
            return res.status(500).json({
              success: false,
              error: 'Kripto para yatırma işlemi başlatılamadı',
              details: 'Veritabanı hatası'
            });
          }
        }
        
      } catch (fetchError) {
        console.error('🚫 XPay Kripto API isteği başarısız:', fetchError);
        
        // Network hatası durumunda fallback response
        const fallbackTransactionId = `CRYPTO_NETWORK_ERROR_${Date.now()}_${crypto_type.toUpperCase()}`;
        
        try {
          await db.insert(transactions).values({
            transactionId: fallbackTransactionId,
            userId: parseInt(user_id),
            type: 'deposit',
            amount: Number(amount),
            currency: 'TRY',
            status: 'pending',
            paymentMethod: 'crypto',
            description: `Kripto para yatırma (Network Error) - ${crypto_type.toUpperCase()}`,
            referenceId: site_reference_number || transactionId,
            paymentDetails: {
              crypto_type: crypto_type,
              normalized_crypto_type: normalizedCryptoType,
              crypto_address: finalCryptoAddress,
              original_crypto_address: crypto_address,
              is_default_address: !crypto_address,
              network_error: true,
              error_message: fetchError instanceof Error ? fetchError.message : 'Network error'
            },
            createdAt: new Date()
          });
          
          return res.json({
            success: true,
            data: {
              transaction_id: fallbackTransactionId,
              amount: Number(amount),
              payment_method: 'crypto',
              status: 'pending',
              estimated_time: getCryptoProcessingTime(crypto_type),
              gateway_reference: site_reference_number || transactionId,
                             crypto_type: crypto_type,
               normalized_crypto_type: normalizedCryptoType,
               crypto_address: finalCryptoAddress,
               original_crypto_address: crypto_address,
               is_default_address: !crypto_address,
               is_network_fallback: true,
               instructions: {
                 title: `${crypto_type.toUpperCase()} Para Yatırma`,
                 description: `${crypto_type.toUpperCase()} ağında ${amount} TL değerinde kripto para yatırma işlemi başlatıldı`,
                 crypto_address: finalCryptoAddress,
                 crypto_type: crypto_type,
                 normalized_crypto_type: normalizedCryptoType,
                 amount: Number(amount),
                 network: getCryptoNetworkName(crypto_type),
                 note: !crypto_address ? 'Varsayılan CryptonBets cüzdanı kullanılıyor' : 'Kullanıcı cüzdanı kullanılıyor'
               }
            },
            message: 'Kripto para yatırma işlemi başlatıldı (Network Fallback)'
          });
          
        } catch (dbError) {
          console.error('⚠️ Network fallback transaction kaydı oluşturulamadı:', dbError);
          
          return res.status(500).json({
            success: false,
            error: 'Kripto para yatırma işlemi başlatılamadı',
            details: 'Ağ hatası ve veritabanı hatası'
          });
        }
      }
      
    } catch (error) {
      console.error('❌ Kripto para yatırma genel hatası:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Kripto para yatırma işlemi başlatılamadı',
        details: error instanceof Error ? error.message : 'Bilinmeyen hata'
      });
    }
  });

  // Debug endpoint - Transaction status ve user balance kontrol
  app.get('/api/debug/transaction/:transactionId', async (req, res) => {
    try {
      const { transactionId } = req.params;
      
      console.log('🔍 DEBUG: Transaction durumu kontrol ediliyor:', transactionId);
      


      // Transaction var mı kontrol et
      let transactionQuery;
      try {
        // Önce transactions tablosunda transactionId olarak ara
        transactionQuery = await db
          .select()
          .from(transactions)
          .where(eq(transactions.transactionId, transactionId))
          .limit(1);
          
        // Bulunamadıysa id olarak ara
        if (transactionQuery.length === 0) {
          const numericId = parseInt(transactionId);
          if (!isNaN(numericId)) {
            transactionQuery = await db
              .select()
              .from(transactions)
              .where(eq(transactions.id, numericId))
              .limit(1);
          }
        }
      } catch (dbError) {
        console.log('⚠️ Transaction sorgusu hatası:', dbError);
        transactionQuery = [];
      }

      let userInfo = null;
      let userLogs_info = [];

      if (transactionQuery.length > 0) {
        const transaction = transactionQuery[0];
        
        // Kullanıcı bilgilerini al
        try {
          const [user] = await db.select().from(users).where(eq(users.id, transaction.userId));
          userInfo = user;
        } catch (userError) {
          console.log('⚠️ User sorgusu hatası:', userError);
        }

        // Bu transaction ile ilgili logları al
        try {
          userLogs_info = await db
            .select()
            .from(userLogs)
            .where(and(
              eq(userLogs.userId, transaction.userId),
              eq(userLogs.category, 'financial')
            ))
            .orderBy(desc(userLogs.createdAt))
            .limit(10);
        } catch (logError) {
          console.log('⚠️ User logs sorgusu hatası:', logError);
        }
      }

      const debugInfo = {
        transaction_id: transactionId,
        transaction_found: transactionQuery.length > 0,
        transaction_data: transactionQuery.length > 0 ? transactionQuery[0] : null,
        user_info: userInfo ? {
          id: userInfo.id,
          username: userInfo.username,
          balance: userInfo.balance,
          totalDeposits: userInfo.totalDeposits
        } : null,
        recent_logs: userLogs_info.map((log: any) => ({
          action: log.action,
          description: log.description,
          createdAt: log.createdAt
        })),
        debug_timestamp: new Date().toISOString()
      };

      console.log('📊 DEBUG Info:', JSON.stringify(debugInfo, null, 2));

      res.json({
        success: true,
        debug_info: debugInfo
      });

    } catch (error) {
      console.error('❌ DEBUG endpoint error:', error);
      res.status(500).json({
        success: false,
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Kullanıcı işlemleri API rotalarını kaydet
  app.use('/api/user', userRouter);
  
  // User betting history routes
  app.use('/api', userBetsRouter);
  
  // Gerçek oyun session API rotalarını kaydet
  app.use('/api/game-sessions', gameSessionRouter);
  
  // Withdrawal API routes
  app.use('/api/withdrawal', withdrawalRoutes);
  
  // AI Chat Support API rotalarını kaydet - Guest kullanıcılar için özel middleware
  app.post('/api/chat/send', guestChatMiddleware, chatRoutes.sendMessage);
  app.get('/api/chat/history/:sessionId', guestChatMiddleware, chatRoutes.getChatHistory);
  app.get('/api/chat/sessions', authMiddleware, chatRoutes.getUserSessions);
  app.post('/api/chat/feedback/:messageId', guestChatMiddleware, chatRoutes.rateFeedback);
  app.post('/api/chat/close/:sessionId', guestChatMiddleware, chatRoutes.closeSession);
  // API endpoint for games data
  app.get("/api/games", (_req, res) => {
    res.json([
      { id: 1, title: "Aviator", bgClass: "bg-gradient-to-br from-purple-500 to-indigo-800", category: "popular", icon: "fas fa-plane" },
      { id: 2, title: "Sweet Bonanza", bgClass: "bg-gradient-to-br from-pink-500 to-red-800", category: "popular", subtitle: "Pragmatic" },
      { id: 3, title: "Gates of Olympus", bgClass: "bg-gradient-to-br from-blue-500 to-indigo-800", category: "popular" },
      { id: 4, title: "Blackjack", bgClass: "bg-gradient-to-br from-green-500 to-teal-800", category: "popular", hasNumbers: true }
    ]);
  });
  
  app.get("/api/casino-games", (_req, res) => {
    res.json([
      { id: 1, title: "Roulette", bgClass: "bg-gradient-to-br from-red-600 to-red-900", footerType: "roulette" },
      { id: 2, title: "Live Blackjack", bgClass: "bg-gradient-to-br from-green-600 to-green-900", footerType: "metrics" },
      { id: 3, title: "Baccarat", bgClass: "bg-gradient-to-br from-blue-600 to-blue-900", footerType: "metrics" },
      { id: 4, title: "VIP Roulette", bgClass: "bg-gradient-to-br from-yellow-600 to-yellow-900", footerType: "roulette", isSpecial: true }
    ]);
  });
  
  app.get("/api/news", (_req, res) => {
    res.json([
      { id: 1, title: "VIP", bgClass: "bg-gradient-to-br from-yellow-400 to-yellow-700", type: "vip" },
      { id: 2, title: "PREMIUM", bgClass: "bg-gradient-to-br from-purple-400 to-purple-800", type: "premium" },
      { id: 3, title: "ÇARK", bgClass: "bg-gradient-to-br from-blue-400 to-blue-800", type: "mystery", badgeText: "YENİ" },
      { id: 4, title: "FAST", subtitle: "GAMES", bgClass: "bg-gradient-to-br from-green-400 to-green-800", type: "fast-games" },
      { id: 5, title: "%50", subtitle: "BONUS", badgeText: "2500₺", bgClass: "bg-gradient-to-br from-red-400 to-red-800", type: "bonus" }
    ]);
  });

  // WebSocket API endpoint'leri - Aktif
  app.post('/api/ws/notify-user', authMiddleware, async (req, res) => {
    const { userId, message, type } = req.body;
    
    if (!userId || !message) {
      return res.status(400).json({ error: 'Kullanıcı ID ve mesaj gerekli' });
    }
    
    // WebSocket üzerinden kullanıcıya mesaj gönder
    const success = websocketManager.sendToUser(userId, {
      type: 'notification',
      data: { message, type: type || 'info', timestamp: new Date().toISOString() }
    });
    
    res.json({ success, message: success ? 'Mesaj gönderildi' : 'Kullanıcı çevrimdışı' });
  });
  
  app.post('/api/ws/broadcast', authMiddleware, async (req, res) => {
    const { message, type, targetGroup } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Mesaj içeriği gerekli' });
    }
    
    // WebSocket üzerinden yayın mesajı gönder
    websocketManager.broadcastToUsers({
      type: 'admin_notification',
      data: { message, type: type || 'info', targetGroup, timestamp: new Date().toISOString() }
    }, targetGroup);
    
    res.json({ success: true, message: 'Yayın mesajı gönderildi' });
  });

  // HTTP sunucusu oluştur
  const httpServer = createServer(app);
  
  // WebSocket sunucusunu başlat
  websocketManager.init(httpServer);
  console.log('🔄 WebSocket sunucusu aktif - /ws endpoint hazır');
  
  return httpServer;
}
