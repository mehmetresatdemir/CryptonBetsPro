import { apiRequest } from '@/lib/queryClient';

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
  paymentMethodId: string;
  returnUrl?: string;
}

export interface WithdrawalRequest {
  amount: number;
  withdrawalMethodId: string;
  bankAccount?: {
    iban: string;
    accountHolder: string;
    bankName?: string;
  };
  walletAddress?: string;
}

export interface TransactionResponse {
  transactionId: string;
  externalTransactionId: string;
  status: string;
  paymentUrl?: string;
  qrCode?: string;
  bankAccount?: {
    accountNumber: string;
    iban: string;
    bankName: string;
    accountHolder: string;
  };
  expiresAt?: string;
  fees: {
    amount: number;
    currency: string;
  };
  netAmount?: number;
  estimatedCompletionTime?: string;
}

export const financeApiService = {
  // Tüm ödeme yöntemlerini getir
  async getPaymentMethods(): Promise<PaymentMethod[]> {
    const response = await apiRequest('GET', '/api/finance/payment-methods');
    return response as unknown as PaymentMethod[];
  },

  // Para yatırma işlemi başlat
  async createDepositranslate(request: PaymentRequest): Promise<TransactionResponse> {
    const response = await apiRequest('POST', '/api/finance/deposit/create', request);
    return response as unknown as TransactionResponse;
  },

  // Para çekme işlemi başlat
  async createWithdrawal(request: WithdrawalRequest): Promise<TransactionResponse> {
    const response = await apiRequest('POST', '/api/finance/withdrawal/create', request);
    return response as unknown as TransactionResponse;
  },

  // İşlem durumu sorgulama
  async getTransactionStatus(transactionId: string): Promise<any> {
    const response = await apiRequest('GET', `/api/finance/transaction/${transactionId}/status`);
    return response;
  },

  // Kullanıcının işlem geçmişi
  async getTransactions(params?: {
    type?: 'deposit' | 'withdrawal';
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.type) queryParams.append('type', params.type);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const response = await apiRequest('GET', `/api/finance/transactions?${queryParams.toString()}`);
    return response as unknown as any[];
  }
};