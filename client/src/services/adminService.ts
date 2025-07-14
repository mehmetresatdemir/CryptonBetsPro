import { apiRequest } from '@/lib/queryClient';

export interface TransactionStatusUpdate {
  status: 'approved' | 'rejected';
  rejectionReason?: string;
}

// Bekleyen işlemleri getir (default olarak sadece 'pending' durumundaki işlemler)
export const getPendingTransactions = async (limit: number = 50) => {
  try {
    const response = await fetch(`/api/admin/transactions?status=pending&limit=${limit}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('İşlemler alınamadı');
    }

    return await response.json();
  } catch (error) {
    console.error('İşlemler alınırken hata:', error);
    throw error;
  }
};

// Tüm işlemleri getir (filtrelerle)
export const getTransactions = async (options: {
  status?: string;
  type?: string;
  userId?: number;
  limit?: number;
  offset?: number;
}) => {
  try {
    const params = new URLSearchParams();
    if (options.status) params.append('status', options.status);
    if (options.type) params.append('type', options.type);
    if (options.userId) params.append('userId', options.userId.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());

    const response = await fetch(`/api/admin/transactions?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('İşlemler alınamadı');
    }

    return await response.json();
  } catch (error) {
    console.error('İşlemler alınırken hata:', error);
    throw error;
  }
};

// İşlem durumunu güncelle
export const updateTransactionStatus = async (
  transactionId: number,
  update: TransactionStatusUpdate
) => {
  try {
    const response = await fetch(`/api/admin/transactions/${transactionId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(update),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'İşlem durumu güncellenemedi');
    }

    return await response.json();
  } catch (error) {
    console.error('İşlem durumu güncellenirken hata:', error);
    throw error;
  }
};

// Finansal özeti getir
export const getFinancialSummary = async (timeRange: string = 'today') => {
  try {
    const response = await fetch(`/api/admin/financial-summary?timeRange=${timeRange}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Finansal özet alınamadı');
    }

    return await response.json();
  } catch (error) {
    console.error('Finansal özet alınırken hata:', error);
    throw error;
  }
};