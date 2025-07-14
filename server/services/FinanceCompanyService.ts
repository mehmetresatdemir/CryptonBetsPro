import crypto from 'crypto';
import { db } from '../db';
import { finance_transactions, payment_provider_logs, webhook_logs, api_access_logs } from '@shared/schema';
import { eq, and, desc } from 'drizzle-orm';

export class FinanceCompanyService {
  private static baseUrl: string = process.env.FINANCE_COMPANY_API_URL || '';
  private static apiKey: string = process.env.FINANCE_COMPANY_API_KEY || '';
  private static secretKey: string = process.env.FINANCE_COMPANY_SECRET || '';
  private static webhookSecret: string = process.env.FINANCE_COMPANY_WEBHOOK_SECRET || '';

  // HMAC imza oluşturma
  static createSignature(payload: any, timestamp: number): string {
    const message = JSON.stringify(payload) + timestamp.toString();
    return crypto
      .createHmac('sha256', this.secretKey)
      .update(message)
      .digest('hex');
  }

  // Webhook imza doğrulama
  static verifyWebhookSignature(payload: any, signature: string, timestamp: number): boolean {
    const expectedSignature = crypto
      .createHmac('sha256', this.webhookSecret)
      .update(JSON.stringify(payload) + timestamp.toString())
      .digest('hex');
    
    return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
  }

  // API isteği gönderme
  static async makeApiRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    data?: any,
    transactionId?: string
  ) {
    const startTime = Date.now();
    const timestamp = Math.floor(Date.now() / 1000);
    const signature = this.createSignature(data || {}, timestamp);
    
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Signature': signature,
      'X-Timestamp': timestamp.toString(),
      'X-Transaction-ID': transactionId || '',
    };

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      const responseTime = Date.now() - startTime;
      const responseData = await response.json();

      // API log kaydet
      await this.logApiRequest({
        transactionId,
        endpoint,
        method,
        requestHeaders: headers,
        requestBody: data,
        responseStatus: response.status,
        responseHeaders: Object.fromEntries(response.headers.entries()),
        responseBody: responseData,
        responseTime,
        success: response.ok,
        errorMessage: response.ok ? null : responseData.message || 'Unknown error'
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} - ${responseData.message || 'Unknown error'}`);
      }

      return responseData;
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      // Hata log kaydet
      await this.logApiRequest({
        transactionId,
        endpoint,
        method,
        requestHeaders: headers,
        requestBody: data,
        responseStatus: 0,
        responseHeaders: {},
        responseBody: { error: error.message },
        responseTime,
        success: false,
        errorMessage: error.message
      });

      throw error;
    }
  }

  // Para yatırma işlemi başlatma
  static async initiateDeposit(transactionData: {
    userId: number;
    amount: number;
    paymentMethod: string;
    currency?: string;
  }) {
    const transactionId = `DEP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Veritabanına işlem kaydı oluştur
      await db.insert(finance_transactions).values({
        transactionId,
        userId: transactionData.userId,
        paymentMethod: transactionData.paymentMethod,
        type: 'deposit',
        amount: transactionData.amount,
        currency: transactionData.currency || 'TRY',
        status: 'pending',
        requestData: transactionData,
      });

      // Finans şirketine API isteği gönder
      const apiResponse = await this.makeApiRequest('/deposits', 'POST', {
        transaction_id: transactionId,
        user_id: transactionData.userId,
        amount: transactionData.amount,
        currency: transactionData.currency || 'TRY',
        payment_method: transactionData.paymentMethod,
        callback_url: `${process.env.BASE_URL}/api/finance/webhook/deposit`,
        return_url: `${process.env.BASE_URL}/payment/success`,
        cancel_url: `${process.env.BASE_URL}/payment/cancel`,
      }, transactionId);

      // API yanıtını kaydet
      await db.update(finance_transactions)
        .set({
          financeCompanyTxId: apiResponse.transaction_id || apiResponse.id,
          status: 'processing',
          responseData: apiResponse,
          updatedAt: new Date(),
        })
        .where(eq(finance_transactions.transactionId, transactionId));

      return {
        success: true,
        transactionId,
        paymentUrl: apiResponse.payment_url,
        financeCompanyTxId: apiResponse.transaction_id || apiResponse.id,
      };

    } catch (error: any) {
      // Hata durumunda işlemi güncelle
      await db.update(finance_transactions)
        .set({
          status: 'failed',
          errorMessage: error.message,
          updatedAt: new Date(),
        })
        .where(eq(finance_transactions.transactionId, transactionId));

      throw error;
    }
  }

  // Para çekme işlemi başlatma
  static async initiateWithdrawal(transactionData: {
    userId: number;
    amount: number;
    paymentMethod: string;
    accountInfo: any;
    currency?: string;
  }) {
    const transactionId = `WDR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Veritabanına işlem kaydı oluştur
      await db.insert(finance_transactions).values({
        transactionId,
        userId: transactionData.userId,
        paymentMethod: transactionData.paymentMethod,
        type: 'withdraw',
        amount: transactionData.amount,
        currency: transactionData.currency || 'TRY',
        status: 'pending',
        requestData: transactionData,
      });

      // Finans şirketine API isteği gönder
      const apiResponse = await this.makeApiRequest('/withdrawals', 'POST', {
        transaction_id: transactionId,
        user_id: transactionData.userId,
        amount: transactionData.amount,
        currency: transactionData.currency || 'TRY',
        payment_method: transactionData.paymentMethod,
        account_info: transactionData.accountInfo,
        callback_url: `${process.env.BASE_URL}/api/finance/webhook/withdrawal`,
      }, transactionId);

      // API yanıtını kaydet
      await db.update(finance_transactions)
        .set({
          financeCompanyTxId: apiResponse.transaction_id || apiResponse.id,
          status: 'processing',
          responseData: apiResponse,
          updatedAt: new Date(),
        })
        .where(eq(finance_transactions.transactionId, transactionId));

      return {
        success: true,
        transactionId,
        financeCompanyTxId: apiResponse.transaction_id || apiResponse.id,
        estimatedTime: apiResponse.estimated_time || '1-24 saat',
      };

    } catch (error: any) {
      // Hata durumunda işlemi güncelle
      await db.update(finance_transactions)
        .set({
          status: 'failed',
          errorMessage: error.message,
          updatedAt: new Date(),
        })
        .where(eq(finance_transactions.transactionId, transactionId));

      throw error;
    }
  }

  // İşlem durumu sorgulama
  static async checkTransactionStatus(transactionId: string) {
    try {
      const transaction = await db.select()
        .from(finance_transactions)
        .where(eq(finance_transactions.transactionId, transactionId))
        .limit(1);

      if (!transaction.length) {
        throw new Error('İşlem bulunamadı');
      }

      const txn = transaction[0];
      
      if (txn.financeCompanyTxId) {
        const apiResponse = await this.makeApiRequest(
          `/transactions/${txn.financeCompanyTxId}`,
          'GET',
          undefined,
          transactionId
        );

        // Durum güncellemesi
        if (apiResponse.status !== txn.providerStatus) {
          await db.update(finance_transactions)
            .set({
              providerStatus: apiResponse.status,
              responseData: apiResponse,
              updatedAt: new Date(),
            })
            .where(eq(finance_transactions.transactionId, transactionId));
        }

        return apiResponse;
      }

      return txn;
    } catch (error: any) {
      console.error('Transaction status check error:', error);
      throw error;
    }
  }

  // Webhook işleme
  static async processWebhook(payload: any, signature: string, headers: any) {
    const timestamp = parseInt(headers['x-timestamp'] || '0');
    
    try {
      // İmza doğrulama
      const isValidSignature = this.verifyWebhookSignature(payload, signature, timestamp);
      
      // Webhook log kaydet
      const webhookLog = await db.insert(webhook_logs).values({
        transactionId: payload.transaction_id,
        source: 'finance_company',
        event: payload.event || payload.type,
        payload,
        headers,
        signature,
        signatureValid: isValidSignature,
        processed: false,
      }).returning();

      if (!isValidSignature) {
        throw new Error('Geçersiz webhook imzası');
      }

      // İşlem güncelleme
      if (payload.transaction_id) {
        const updateData: any = {
          providerStatus: payload.status,
          callbackData: payload,
          updatedAt: new Date(),
        };

        // Durum mapping
        if (payload.status === 'completed' || payload.status === 'success') {
          updateData.status = 'completed';
          updateData.completedAt = new Date();
        } else if (payload.status === 'failed' || payload.status === 'error') {
          updateData.status = 'failed';
          updateData.errorMessage = payload.error_message || payload.message;
        } else if (payload.status === 'cancelled') {
          updateData.status = 'cancelled';
        }

        await db.update(finance_transactions)
          .set(updateData)
          .where(eq(finance_transactions.transactionId, payload.transaction_id));
      }

      // Webhook işlendi olarak işaretle
      await db.update(webhook_logs)
        .set({
          processed: true,
          processedAt: new Date(),
        })
        .where(eq(webhook_logs.id, webhookLog[0].id));

      return { success: true, processed: true };

    } catch (error: any) {
      console.error('Webhook processing error:', error);
      
      // Hata log kaydet
      if (payload.transaction_id) {
        await db.update(webhook_logs)
          .set({
            processingError: error.message,
            retryCount: 1,
            nextRetryAt: new Date(Date.now() + 5 * 60 * 1000), // 5 dakika sonra
          })
          .where(and(
            eq(webhook_logs.transactionId, payload.transaction_id),
            eq(webhook_logs.processed, false)
          ));
      }

      throw error;
    }
  }

  // API log kaydetme
  private static async logApiRequest(logData: {
    transactionId?: string;
    endpoint: string;
    method: string;
    requestHeaders: any;
    requestBody: any;
    responseStatus: number;
    responseHeaders: any;
    responseBody: any;
    responseTime: number;
    success: boolean;
    errorMessage: string | null;
  }) {
    try {
      await db.insert(payment_provider_logs).values({
        transactionId: logData.transactionId,
        provider: 'finance_company',
        endpoint: logData.endpoint,
        method: logData.method,
        requestHeaders: logData.requestHeaders,
        requestBody: logData.requestBody,
        responseStatus: logData.responseStatus,
        responseHeaders: logData.responseHeaders,
        responseBody: logData.responseBody,
        responseTime: logData.responseTime,
        success: logData.success,
        errorMessage: logData.errorMessage,
      });
    } catch (error) {
      console.error('Failed to log API request:', error);
    }
  }

  // Rate limiting kontrol
  static async checkRateLimit(clientName: string, ipAddress: string): Promise<boolean> {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    
    const recentRequests = await db.select()
      .from(api_access_logs)
      .where(and(
        eq(api_access_logs.clientName, clientName),
        eq(api_access_logs.ipAddress, ipAddress),
        eq(api_access_logs.createdAt, oneMinuteAgo)
      ));

    // Dakikada maksimum 60 istek
    return recentRequests.length < 60;
  }

  // API erişim log kaydet
  static async logApiAccess(logData: {
    clientName: string;
    apiKey: string;
    endpoint: string;
    method: string;
    ipAddress: string;
    userAgent?: string;
    requestId?: string;
    responseStatus: number;
    responseTime: number;
    success: boolean;
    rateLimited?: boolean;
    errorMessage?: string;
  }) {
    try {
      await db.insert(api_access_logs).values(logData);
    } catch (error) {
      console.error('Failed to log API access:', error);
    }
  }
}