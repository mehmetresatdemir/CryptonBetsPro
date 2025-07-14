import axios from 'axios';
import crypto from 'crypto';

// Finans Şirketi API Entegrasyonu
export interface FinanceAPIConfig {
  baseUrl: string;
  apiKey: string;
  secretKey: string;
  merchantId: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank_transfer' | 'credit_card' | 'ewallet' | 'crypto' | 'mobile_payment';
  provider: string;
  minAmount: number;
  maxAmount: number;
  fee: number;
  feeType: 'fixed' | 'percentage';
  processingTime: string;
  isActive: boolean;
  supportedCurrencies: string[];
}

export interface PaymentRequest {
  amount: number;
  currency: string;
  paymentMethodId: string;
  customerInfo: {
    userId: string;
    email: string;
    phone?: string;
    name: string;
    nationalId?: string;
  };
  returnUrl: string;
  webhookUrl: string;
  metadata?: Record<string, any>;
}

export interface PaymentResponse {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  paymentUrl?: string;
  qrCode?: string;
  bankAccount?: {
    accountNumber: string;
    iban: string;
    bankName: string;
    accountHolder: string;
  };
  expiresAt?: Date;
  fees: {
    amount: number;
    currency: string;
  };
}

export interface WithdrawalRequest {
  amount: number;
  currency: string;
  withdrawalMethodId: string;
  customerInfo: {
    userId: string;
    email: string;
    phone?: string;
    name: string;
    nationalId?: string;
  };
  bankAccount?: {
    iban: string;
    accountHolder: string;
    bankName?: string;
  };
  walletAddress?: string;
  metadata?: Record<string, any>;
}

export interface WithdrawalResponse {
  transactionId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  estimatedCompletionTime: string;
  fees: {
    amount: number;
    currency: string;
  };
  netAmount: number;
}

export class FinanceCompanyAPI {
  private config: FinanceAPIConfig;

  constructor(config: FinanceAPIConfig) {
    this.config = config;
  }

  private generateSignature(data: string, timestamp: string): string {
    const payload = `${data}${timestamp}${this.config.secretKey}`;
    return crypto.createHash('sha256').update(payload).digest('hex');
  }

  private async makeRequest(endpoint: string, data: any): Promise<any> {
    const timestamp = Date.now().toString();
    const payload = JSON.stringify(data);
    const signature = this.generateSignature(payload, timestamp);

    try {
      const response = await axios.post(`${this.config.baseUrl}${endpoint}`, data, {
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': this.config.apiKey,
          'X-Merchant-ID': this.config.merchantId,
          'X-Timestamp': timestamp,
          'X-Signature': signature,
        },
        timeout: 30000,
      });

      return response.data;
    } catch (error: any) {
      console.error('Finance API Error:', error.response?.data || error.message);
      throw new Error(`Finance API Error: ${error.response?.data?.message || error.message}`);
    }
  }

  // Mevcut ödeme yöntemlerini getir
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    return await this.makeRequest('/payment-methods', {});
  }

  // Para yatırma işlemi başlat
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    return await this.makeRequest('/payments/create', request);
  }

  // Para çekme işlemi başlat
  async createWithdrawal(request: WithdrawalRequest): Promise<WithdrawalResponse> {
    return await this.makeRequest('/withdrawals/create', request);
  }

  // İşlem durumunu sorgula
  async getTransactionStatus(transactionId: string): Promise<any> {
    return await this.makeRequest('/transactions/status', { transactionId });
  }

  // Webhook doğrulama
  verifyWebhook(payload: string, signature: string, timestamp: string): boolean {
    const expectedSignature = this.generateSignature(payload, timestamp);
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expectedSignature, 'hex')
    );
  }

  // Bakiye sorgulama
  async getBalance(): Promise<any> {
    return await this.makeRequest('/account/balance', {});
  }

  // İşlem geçmişi
  async getTransactionHistory(params: {
    startDate?: string;
    endDate?: string;
    type?: 'payment' | 'withdrawal';
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<any> {
    return await this.makeRequest('/transactions/history', params);
  }
}

// Türk finans şirketleri için özel entegrasyonlar
export class TurkishFinanceProviders {
  
  // Garanti BBVA API
  static createGarantiAPI(): FinanceCompanyAPI {
    return new FinanceCompanyAPI({
      baseUrl: process.env.GARANTI_API_URL || 'https://api.garantibbva.com.tr',
      apiKey: process.env.GARANTI_API_KEY || '',
      secretKey: process.env.GARANTI_SECRET_KEY || '',
      merchantId: process.env.GARANTI_MERCHANT_ID || '',
    });
  }

  // İş Bankası API
  static createIsBankasiAPI(): FinanceCompanyAPI {
    return new FinanceCompanyAPI({
      baseUrl: process.env.ISBANK_API_URL || 'https://api.isbank.com.tr',
      apiKey: process.env.ISBANK_API_KEY || '',
      secretKey: process.env.ISBANK_SECRET_KEY || '',
      merchantId: process.env.ISBANK_MERCHANT_ID || '',
    });
  }

  // Akbank API
  static createAkbankAPI(): FinanceCompanyAPI {
    return new FinanceCompanyAPI({
      baseUrl: process.env.AKBANK_API_URL || 'https://api.akbank.com',
      apiKey: process.env.AKBANK_API_KEY || '',
      secretKey: process.env.AKBANK_SECRET_KEY || '',
      merchantId: process.env.AKBANK_MERCHANT_ID || '',
    });
  }

  // Yapı Kredi API
  static createYapiKrediAPI(): FinanceCompanyAPI {
    return new FinanceCompanyAPI({
      baseUrl: process.env.YAPIKREDI_API_URL || 'https://api.yapikredi.com.tr',
      apiKey: process.env.YAPIKREDI_API_KEY || '',
      secretKey: process.env.YAPIKREDI_SECRET_KEY || '',
      merchantId: process.env.YAPIKREDI_MERCHANT_ID || '',
    });
  }

  // PayTR API
  static createPayTRAPI(): FinanceCompanyAPI {
    return new FinanceCompanyAPI({
      baseUrl: process.env.PAYTR_API_URL || 'https://www.paytr.com/odeme/api',
      apiKey: process.env.PAYTR_API_KEY || '',
      secretKey: process.env.PAYTR_SECRET_KEY || '',
      merchantId: process.env.PAYTR_MERCHANT_ID || '',
    });
  }

  // iyzico API
  static createIyzicoAPI(): FinanceCompanyAPI {
    return new FinanceCompanyAPI({
      baseUrl: process.env.IYZICO_API_URL || 'https://api.iyzipay.com',
      apiKey: process.env.IYZICO_API_KEY || '',
      secretKey: process.env.IYZICO_SECRET_KEY || '',
      merchantId: process.env.IYZICO_MERCHANT_ID || '',
    });
  }

  // Papara API
  static createPaparaAPI(): FinanceCompanyAPI {
    return new FinanceCompanyAPI({
      baseUrl: process.env.PAPARA_API_URL || 'https://merchant.test.papara.com',
      apiKey: process.env.PAPARA_API_KEY || '',
      secretKey: process.env.PAPARA_SECRET_KEY || '',
      merchantId: process.env.PAPARA_MERCHANT_ID || '',
    });
  }
}

// Çoklu sağlayıcı yöneticisi
export class MultiProviderPaymentManager {
  private providers: Map<string, FinanceCompanyAPI> = new Map();

  constructor() {
    // Tüm sağlayıcıları başlat
    this.providers.set('garanti', TurkishFinanceProviders.createGarantiAPI());
    this.providers.set('isbank', TurkishFinanceProviders.createIsBankasiAPI());
    this.providers.set('akbank', TurkishFinanceProviders.createAkbankAPI());
    this.providers.set('yapikredi', TurkishFinanceProviders.createYapiKrediAPI());
    this.providers.set('paytr', TurkishFinanceProviders.createPayTRAPI());
    this.providers.set('iyzico', TurkishFinanceProviders.createIyzicoAPI());
    this.providers.set('papara', TurkishFinanceProviders.createPaparaAPI());
  }

  getProvider(providerId: string): FinanceCompanyAPI | undefined {
    return this.providers.get(providerId);
  }

  async getAllPaymentMethods(): Promise<PaymentMethod[]> {
    const allMethods: PaymentMethod[] = [];
    
    for (const [providerId, provider] of this.providers) {
      try {
        const methods = await provider.getPaymentMethods();
        methods.forEach(method => {
          method.id = `${providerId}_${method.id}`;
          method.provider = providerId;
        });
        allMethods.push(...methods);
      } catch (error) {
        console.error(`Error fetching methods from ${providerId}:`, error);
      }
    }

    return allMethods;
  }

  async createPayment(providerId: string, request: PaymentRequest): Promise<PaymentResponse> {
    const provider = this.getProvider(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    return await provider.createPayment(request);
  }

  async createWithdrawal(providerId: string, request: WithdrawalRequest): Promise<WithdrawalResponse> {
    const provider = this.getProvider(providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`);
    }

    return await provider.createWithdrawal(request);
  }
}

export const paymentManager = new MultiProviderPaymentManager();