import { apiRequest } from "@/lib/queryClient";
import { PAYMENT_METHODS, paymentMethodsMetadata, withdrawalMethodsMetadata } from "@shared/paymentMethods";

// Deposit API URL configuration - Proxy kullan
const getDepositApiUrl = () => {
  // Proxy endpoint'ini kullan (CORS sorununu çözer)
  return '/api/public';
};

// İşlem türleri
export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  WITHDRAWAL: 'withdrawal',
  BET: 'bet',
  WIN: 'win',
  BONUS: 'bonus'
};

// İşlem durumları
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
};

// Yeni ödeme yöntemlerini getir
export const getPaymentMethodsNew = async () => {
  try {
    const response = await fetch(`${getDepositApiUrl()}/payment-methods`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    if (result.success) {
      if (result.data && result.data.length > 0) {
        return result.data;
      } else {
        throw new Error('XPay API ödeme yöntemi döndürmedi. API configuration kontrolü gerekli.');
      }
    } else {
      throw new Error(result.error || 'Ödeme yöntemleri alınamadı');
    }
  } catch (error: any) {
    console.error('Ödeme yöntemleri hatası:', error);
    throw new Error('Ödeme yöntemleri yüklenemedi. Lütfen tekrar deneyin.');
  }
};

// Yeni para yatırma işlemi
export const createDepositNew = async (data: {
  amount: number;
  payment_method_id: string;
  user_id: string;
  user_name: string;
  user: string; // XPay API için user alanı
  user_email: string;
  return_url: string;
  callback_url: string;
  site_reference_number: string;
  tc_number?: string; // Kredi kartı ödemesi için TC kimlik numarası
  // Ödeme yöntemine göre gerekli alanlar
  papara_id?: string;
  pep_id?: string;
  iban?: string;
  bank_name?: string;
  account_name?: string;
  pay_co_id?: string;
  pay_co_full_name?: string;
  paratim_id?: string;
  crypto_type?: string;
  payfix_number?: string;
}) => {
  try {
    const response = await fetch(`${getDepositApiUrl()}/deposit/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('İşlem başarılı:', result.data);
      return result.data;
    } else {
      throw new Error(result.error || 'Para yatırma işlemi başarısız oldu');
    }
  } catch (error: any) {
    console.error('Para yatırma hatası:', error);
    
    // Artık fallback yok, gerçek hata fırlat
    console.error('XPay API deposit hatası:', error.message);
    
    throw error;
  }
};

// İşlem durumu sorgulama
export const checkTransactionStatus = async (transactionId: string) => {
  try {
    const response = await fetch(`${getDepositApiUrl()}/deposit/status/${transactionId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const result = await response.json();
    
    if (result.success) {
      console.log('İşlem durumu:', result.data.status);
      return result.data;
    } else {
      throw new Error(result.error || 'İşlem durumu sorgulanamadı');
    }
  } catch (error: any) {
    console.error('İşlem durumu sorgulama hatası:', error);
    throw error;
  }
};

// Para çekme işlemi
export const createWithdrawal = async (data: {
  amount: number;
  method: string;
  methodDetails?: any;
  accountDetails: any;
}) => {
  try {
    // KYC kontrolü
    const kycResponse = await apiRequest('GET', '/api/user/kyc-status');
    
    if (!kycResponse.ok) {
      throw new Error('KYC durumu kontrol edilemedi');
    }
    
    const kycStatus = await kycResponse.json();
    
    if (kycStatus.status !== 'approved') {
      throw new Error('Para çekme işlemi için KYC doğrulamanız onaylanmış olmalıdır');
    }
    
    // Para çekme isteği
    const response = await apiRequest('POST', '/api/user/withdrawal', {
      amount: data.amount,
      method: data.method,
      methodDetails: data.methodDetails || null,
      accountDetails: data.accountDetails
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Para çekme işlemi oluşturulamadı');
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('Para çekme hatası:', error);
    throw error;
  }
};

// İşlem geçmişi getir
export const getUserTransactions = async (limit = 10) => {
  try {
    const response = await apiRequest('GET', `/api/user/transactions?limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('İşlem geçmişi getirilemedi');
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('İşlem geçmişi hatası:', error);
    throw error;
  }
};

// Para yatırma yöntemlerini getir
export const getPaymentMethods = () => {
  return Object.values(paymentMethodsMetadata);
};

// Para çekme yöntemlerini getir
export const getWithdrawalMethods = () => {
  return Object.values(withdrawalMethodsMetadata);
};

// Ödeme yöntemi bilgilerini getir
export const getPaymentMethodInfo = (methodId: string) => {
  return paymentMethodsMetadata[methodId as keyof typeof paymentMethodsMetadata] || null;
};

// Para çekme yöntemi bilgilerini getir
export const getWithdrawalMethodInfo = (methodId: string) => {
  return withdrawalMethodsMetadata[methodId as keyof typeof withdrawalMethodsMetadata] || null;
};

// Admin: Bekleyen işlemleri getir
export const getPendingTransactions = async (limit = 50) => {
  try {
    const response = await apiRequest('GET', `/api/admin/transactions?status=pending&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Bekleyen işlemler getirilemedi');
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('Bekleyen işlemler hatası:', error);
    throw error;
  }
};

// Admin: İşlem durumunu güncelle
export const updateTransactionStatus = async (transactionId: number, data: {
  status: string;
  rejectionReason?: string;
}) => {
  try {
    const response = await apiRequest('POST', `/api/admin/transaction/${transactionId}/update-status`, data);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'İşlem durumu güncellenemedi');
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('İşlem durumu güncelleme hatası:', error);
    throw error;
  }
};

// Admin: Finansal özeti getir
export const getFinancialSummary = async (timeRange = 'today') => {
  try {
    const response = await apiRequest('GET', `/api/admin/financial-summary?timeRange=${timeRange}`);
    
    if (!response.ok) {
      throw new Error('Finansal özet getirilemedi');
    }
    
    return await response.json();
  } catch (error: any) {
    console.error('Finansal özet hatası:', error);
    throw error;
  }
};

// Kripto para yatırma talebi oluşturma
export const createCryptoDeposit = async (data: {
  payment_method_id: 'crypto';
  amount: number;
  user: string;
  user_name: string;
  user_id: string;
  site_reference_number: string;
  return_url: string;
  user_email: string;
  crypto_type: 'bsc' | 'eth' | 'tron';
  crypto_address: string;
}) => {
  try {
    const response = await fetch('/api/public/crypto-deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    
    if (response.ok && result.success) {
      return {
        success: true,
        data: result.data,
        message: result.message
      };
    } else {
      return {
        success: false,
        error: result.error || 'Kripto para yatırma işlemi başarısız',
        details: result.details
      };
    }
  } catch (error: any) {
    console.error('Kripto para yatırma hatası:', error);
    return {
      success: false,
      error: 'Kripto para yatırma işlemi sırasında hata oluştu',
      details: error.message
    };
  }
};