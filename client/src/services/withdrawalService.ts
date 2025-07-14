import { apiRequest } from '@/lib/queryClient';

export interface WithdrawalRequest {
  amount: number;
  payment_method_id: string;
  user_id: string;
  user_name: string;
  user: string;
  site_reference_number: string;
  return_url: string;
  // Havale parametreleri
  iban?: string;
  bank_name?: string;
  user_full_name?: string;
  // Pay-Co parametreleri
  pay_co_id?: string;
  pay_co_full_name?: string;
  // Papara parametreleri (iban alanında Papara ID)
  papara_id?: string;
  // Pep parametreleri
  pep_id?: string;
  tc_number?: string;
  // Paratim parametreleri
  paratim_id?: string;
  // Crypto parametreleri
  crypto_address?: string;
  // Popy parametreleri
  popy_id?: string;
  // Papel parametreleri
  papel_id?: string;
  // Parolapara parametreleri
  parolapara_id?: string;
  // Paybol parametreleri
  paybol_id?: string;
}

export interface WithdrawalResponse {
  success: boolean;
  transaction_id?: string;
  status?: string;
  message?: string;
  error?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  description: string;
  minAmount: number;
  maxAmount: number;
  processingTime: string;
  requiredFields: string[];
}

export const withdrawalMethods: PaymentMethod[] = [
  {
    id: 'havale',
    name: 'Banka Havalesi',
    icon: 'Building2',
    description: 'Geleneksel banka havalesi ile para çekme',
    minAmount: 100,
    maxAmount: 50000,
    processingTime: '1-3 iş günü',
    requiredFields: ['iban', 'bank_name', 'user_full_name']
  },
  {
    id: 'papara',
    name: 'Papara',
    icon: 'CreditCard',
    description: 'Papara hesabınıza anında para transferi',
    minAmount: 50,
    maxAmount: 25000,
    processingTime: 'Anında',
    requiredFields: ['papara_id']
  },
  {
    id: 'payco',
    name: 'Pay-Co',
    icon: 'Wallet',
    description: 'Pay-Co hesabınıza para transferi',
    minAmount: 50,
    maxAmount: 20000,
    processingTime: '15-30 dakika',
    requiredFields: ['pay_co_id', 'pay_co_full_name']
  },
  {
    id: 'pep',
    name: 'Pep',
    icon: 'Smartphone',
    description: 'Pep hesabınıza para transferi',
    minAmount: 50,
    maxAmount: 15000,
    processingTime: '15-30 dakika',
    requiredFields: ['pep_id', 'tc_number']
  },
  {
    id: 'paratim',
    name: 'Paratim',
    icon: 'Clock',
    description: 'Paratim hesabınıza para transferi',
    minAmount: 50,
    maxAmount: 20000,
    processingTime: '15-30 dakika',
    requiredFields: ['paratim_id']
  },
  {
    id: 'crypto',
    name: 'Kripto Para',
    icon: 'Bitcoin',
    description: 'Kripto para cüzdanınıza transfer',
    minAmount: 100,
    maxAmount: 100000,
    processingTime: '30-60 dakika',
    requiredFields: ['crypto_address']
  },
  {
    id: 'popy',
    name: 'Popy',
    icon: 'Coins',
    description: 'Popy hesabınıza para transferi',
    minAmount: 50,
    maxAmount: 15000,
    processingTime: '15-30 dakika',
    requiredFields: ['popy_id']
  },
  {
    id: 'papel',
    name: 'Papel',
    icon: 'FileText',
    description: 'Papel hesabınıza para transferi',
    minAmount: 50,
    maxAmount: 15000,
    processingTime: '15-30 dakika',
    requiredFields: ['papel_id']
  },
  {
    id: 'parolapara',
    name: 'Parolapara',
    icon: 'Key',
    description: 'Parolapara hesabınıza para transferi',
    minAmount: 50,
    maxAmount: 15000,
    processingTime: '15-30 dakika',
    requiredFields: ['parolapara_id']
  },
  {
    id: 'paybol',
    name: 'Paybol',
    icon: 'Zap',
    description: 'Paybol hesabınıza para transferi',
    minAmount: 50,
    maxAmount: 15000,
    processingTime: '15-30 dakika',
    requiredFields: ['paybol_id']
  }
];

export const withdrawalService = {
  // Para çekme yöntemlerini getir
  getWithdrawalMethods(): PaymentMethod[] {
    return withdrawalMethods;
  },

  // Belirli bir yöntemi getir
  getWithdrawalMethod(methodId: string): PaymentMethod | undefined {
    return withdrawalMethods.find(method => method.id === methodId);
  },

  // Para çekme talebi oluştur
  async createWithdrawal(data: WithdrawalRequest): Promise<WithdrawalResponse> {
    try {
      const response = await fetch('/api/withdrawal/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Para çekme talebi oluşturulamadı');
      }

      return await response.json();
    } catch (error) {
      console.error('Para çekme hatası:', error);
      throw error;
    }
  },

  // Para çekme durumu sorgula
  async getWithdrawalStatus(transactionId: string): Promise<any> {
    try {
      const response = await apiRequest('GET', `/api/withdrawal/status/${transactionId}`);
      return response;
    } catch (error) {
      console.error('Para çekme durumu sorgulama hatası:', error);
      throw error;
    }
  },

  // Kullanıcının para çekme geçmişi
  async getUserWithdrawals(limit = 10): Promise<any[]> {
    try {
      const response = await apiRequest('GET', `/api/withdrawal/history?limit=${limit}`);
      return response as any[];
    } catch (error) {
      console.error('Para çekme geçmişi hatası:', error);
      throw error;
    }
  },

  // Para çekme limitlerini getir
  async getWithdrawalLimits(): Promise<any> {
    try {
      const response = await apiRequest('GET', '/api/withdrawal/limits');
      return response;
    } catch (error) {
      console.error('Para çekme limitlerini alma hatası:', error);
      throw error;
    }
  }
}; 