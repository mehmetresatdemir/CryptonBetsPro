import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Search, Download, Eye, CheckCircle, XCircle, Clock, 
  TrendingDown, DollarSign, Users, CreditCard, RotateCcw,
  Plus, FileText, Calendar, Filter, ArrowUpDown,
  Wallet, Activity, AlertTriangle, Check, X, MinusCircle,
  Shield, TrendingUp, User, Mail, Phone, RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

interface Withdrawal {
  id: number;
  transactionId?: string;
  userId: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  vipLevel: number;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  paymentMethod: string;
  paymentDetails?: string;
  referenceId?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  rejectionReason?: string;
  reviewedBy?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

interface WithdrawalStats {
  summary: {
    totalWithdrawals: number;
    totalAmount: number;
    avgAmount: number;
    minAmount: number;
    maxAmount: number;
    approvedAmount: number;
    pendingAmount: number;
    rejectedAmount: number;
    processingAmount: number;
    uniqueUsers: number;
  };
  statusStats: Array<{
    status: string;
    count: number;
    totalAmount: number;
    avgAmount: number;
  }>;
  paymentMethodStats: Array<{
    paymentMethod: string;
    count: number;
    totalAmount: number;
    avgAmount: number;
  }>;
  dailyStats: Array<{
    date: string;
    count: number;
    totalAmount: number;
    approvedCount: number;
    pendingCount: number;
    rejectedCount: number;
  }>;
  vipStats: Array<{
    vipLevel: number;
    count: number;
    totalAmount: number;
    avgAmount: number;
  }>;
  riskAnalysis: {
    largeWithdrawals: number;
    multipleDaily: number;
    frequentUsers: number;
  };
}

const STATUS_CONFIG = {
  pending: { 
    label: 'Beklemede', 
    color: 'bg-yellow-500', 
    textColor: 'text-yellow-900',
    icon: Clock,
    variant: 'secondary' as const
  },
  processing: { 
    label: 'İşleniyor', 
    color: 'bg-blue-500', 
    textColor: 'text-blue-900',
    icon: RotateCcw,
    variant: 'secondary' as const
  },
  approved: { 
    label: 'Onaylandı', 
    color: 'bg-green-500', 
    textColor: 'text-green-900',
    icon: CheckCircle,
    variant: 'default' as const
  },
  completed: { 
    label: 'Tamamlandı', 
    color: 'bg-emerald-600', 
    textColor: 'text-emerald-900',
    icon: Check,
    variant: 'default' as const
  },
  rejected: { 
    label: 'Reddedildi', 
    color: 'bg-red-500', 
    textColor: 'text-red-900',
    icon: XCircle,
    variant: 'destructive' as const
  },
  under_review: { 
    label: 'İnceleme Altında', 
    color: 'bg-orange-500', 
    textColor: 'text-orange-900',
    icon: AlertTriangle,
    variant: 'outline' as const
  },
  finished: { 
    label: 'Tamamlandı', 
    color: 'bg-green-600', 
    icon: Check,
    variant: 'default' as const
  },
  failed: { 
    label: 'Başarısız', 
    color: 'bg-red-600', 
    icon: X,
    variant: 'destructive' as const
  }
};

const PAYMENT_METHODS = [
  { value: 'all', label: 'Tüm Yöntemler' },
  { value: 'Bank Transfer', label: 'Banka Havalesi' },
  { value: 'Papara', label: 'Papara' },
  { value: 'Crypto', label: 'Kripto Para' },
  { value: 'Other', label: 'Diğer' },
  { value: 'Manual', label: 'Manuel' }
];

export default function Withdrawals() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [amountMinFilter, setAmountMinFilter] = useState('');
  const [amountMaxFilter, setAmountMaxFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedWithdrawals, setSelectedWithdrawals] = useState<number[]>([]);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false);
  const [manualWithdrawalDialogOpen, setManualWithdrawalDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState('desc');
  const { toast } = useToast();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  // Para çekme işlemlerini getir
  const { data: withdrawalsData, isLoading } = useQuery({
    queryKey: ['/api/withdrawals-direct', currentPage, searchTerm, statusFilter, paymentMethodFilter, 
               dateFromFilter, dateToFilter, amountMinFilter, amountMaxFilter, sortBy, sortOrder],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        status: statusFilter,
        paymentMethod: paymentMethodFilter,
        dateFrom: dateFromFilter,
        dateTo: dateToFilter,
        amountMin: amountMinFilter,
        amountMax: amountMaxFilter,
        sortBy,
        sortOrder
      });
      
      const response = await fetch(`/api/withdrawals-direct?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Para çekme verileri alınamadı');
      return response.json();
    }
  });

  // Para çekme istatistiklerini getir
  const { data: statsData } = useQuery({
    queryKey: ['/api/withdrawals-direct/stats', dateFromFilter, dateToFilter, paymentMethodFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        dateFrom: dateFromFilter,
        dateTo: dateToFilter,
        paymentMethod: paymentMethodFilter
      });
      
      const response = await fetch(`/api/withdrawals-direct/stats?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('İstatistikler alınamadı');
      const result = await response.json();
      
      // Eski API formatını yeni formata çevir
      if (result.success && result.data) {
        const data = result.data;
        const totalAmount = Math.abs(parseFloat(data.totalAmount || '0'));
        const totalCount = parseInt(data.totalCount || '0');
        
        console.log('🔄 Format çevirimi:', { 
          originalData: data, 
          convertedAmount: totalAmount, 
          convertedCount: totalCount 
        });
        
        return {
          summary: {
            totalWithdrawals: totalCount,
            totalAmount: totalAmount,
            avgAmount: Math.abs(parseFloat(data.avgAmount || '0')),
            minAmount: 0,
            maxAmount: totalAmount,
            approvedAmount: totalAmount, // Hepsi completed durumunda
            pendingAmount: 0,
            rejectedAmount: 0,
            processingAmount: 0,
            uniqueUsers: totalCount // Unique user sayısı yok, toplam işlem sayısını kullan
          },
          statusStats: data.statusBreakdown ? Object.entries(data.statusBreakdown).map(([status, count]) => ({
            status,
            count: count as number,
            totalAmount: status === 'completed' ? totalAmount : 0,
            avgAmount: status === 'completed' ? Math.abs(parseFloat(data.avgAmount || '0')) : 0
          })) : [],
          paymentMethodStats: [
            {
              paymentMethod: 'Bank Transfer',
              count: totalCount,
              totalAmount: totalAmount,
              avgAmount: Math.abs(parseFloat(data.avgAmount || '0'))
            }
          ],
          dailyStats: [],
          vipStats: [],
          riskAnalysis: {
            largeWithdrawals: totalAmount > 1000 ? 1 : 0,
            multipleDaily: 0,
            frequentUsers: 0
          }
        };
      }
      
      return result;
    }
  });

  // Para çekme durumu güncelleme
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason, reviewedBy, adminNotes }: { 
      id: number; 
      status: string; 
      rejectionReason?: string; 
      reviewedBy?: string;
      adminNotes?: string;
    }) => {
      const response = await fetch(`/api/withdrawals-direct/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, rejectionReason, reviewedBy, adminNotes })
      });
      if (!response.ok) throw new Error('Durum güncellenemedi');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawals/stats/summary'] });
      setStatusDialogOpen(false);
      toast({
        title: 'Başarılı',
        description: 'Para çekme durumu güncellendi'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Durum güncellenemedi',
        variant: 'destructive'
      });
    }
  });

  // Toplu durum güncelleme
  const bulkUpdateMutation = useMutation({
    mutationFn: async ({ withdrawalIds, status, rejectionReason, reviewedBy }: { 
      withdrawalIds: number[]; 
      status: string; 
      rejectionReason?: string; 
      reviewedBy?: string; 
    }) => {
      const response = await fetch('/api/withdrawals-direct/bulk/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ withdrawalIds, status, rejectionReason, reviewedBy })
      });
      if (!response.ok) throw new Error('Toplu güncelleme başarısız');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawals/stats/summary'] });
      setBulkStatusDialogOpen(false);
      setSelectedWithdrawals([]);
      toast({
        title: 'Başarılı',
        description: 'Seçili para çekme işlemleri güncellendi'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Toplu güncelleme başarısız',
        variant: 'destructive'
      });
    }
  });

  // Manuel para çekme ekleme
  const manualWithdrawalMutation = useMutation({
    mutationFn: async (withdrawalData: any) => {
      const response = await fetch('/api/withdrawals-direct/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(withdrawalData)
      });
      if (!response.ok) throw new Error('Manuel para çekme eklenemedi');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawals'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/withdrawals/stats/summary'] });
      setManualWithdrawalDialogOpen(false);
      toast({
        title: 'Başarılı',
        description: 'Manuel para çekme eklendi'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Manuel para çekme eklenemedi',
        variant: 'destructive'
      });
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount || 0);
  };

  const getStatusConfig = (status: string) => {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending;
  };

  const exportData = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const params = new URLSearchParams({
        format,
        search: searchTerm,
        status: statusFilter,
        paymentMethod: paymentMethodFilter,
        dateFrom: dateFromFilter,
        dateTo: dateToFilter
      });
      
      const response = await fetch(`/api/withdrawals-direct/export/data?${params}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `withdrawals-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Başarılı',
        description: `Para çekme verileri ${format.toUpperCase()} formatında dışa aktarıldı`
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Dışa aktarma işlemi başarısız',
        variant: 'destructive'
      });
    }
  };

  const handleSelectAll = () => {
    if (selectedWithdrawals.length === withdrawalsData?.withdrawals?.length) {
      setSelectedWithdrawals([]);
    } else {
      setSelectedWithdrawals(withdrawalsData?.withdrawals?.map((w: Withdrawal) => w.id) || []);
    }
  };

  const handleSelectWithdrawal = (id: number) => {
    if (selectedWithdrawals.includes(id)) {
      setSelectedWithdrawals(selectedWithdrawals.filter(selectedId => selectedId !== id));
    } else {
      setSelectedWithdrawals([...selectedWithdrawals, id]);
    }
  };

  const handleStatusUpdate = (withdrawal: Withdrawal) => {
    setSelectedWithdrawal(withdrawal);
    setStatusDialogOpen(true);
  };

  const handleViewDetail = async (withdrawal: Withdrawal) => {
    try {
      const response = await fetch(`/api/withdrawals-direct/${withdrawal.id}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Detay alınamadı');
      
      const detailData = await response.json();
      setSelectedWithdrawal({ ...withdrawal, ...detailData.withdrawal });
      setDetailDialogOpen(true);
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Detay bilgileri alınamadı',
        variant: 'destructive'
      });
    }
  };

  // Hızlı onaylama
  const handleQuickApprove = (withdrawalId: number) => {
    updateStatusMutation.mutate({
      id: withdrawalId,
      status: 'approved',
      reviewedBy: 'admin'
    });
  };

  // Hızlı reddetme
  const handleQuickReject = (withdrawalId: number) => {
    updateStatusMutation.mutate({
      id: withdrawalId,
      status: 'rejected',
      reviewedBy: 'admin',
      rejectionReason: 'Admin tarafından reddedildi'
    });
  };

  // Toplu onaylama
  const handleBulkApprove = () => {
    if (selectedWithdrawals.length > 0) {
      bulkUpdateMutation.mutate({
        withdrawalIds: selectedWithdrawals,
        status: 'approved',
        reviewedBy: 'admin'
      });
    }
  };

  // Toplu reddetme
  const handleBulkReject = () => {
    if (selectedWithdrawals.length > 0) {
      bulkUpdateMutation.mutate({
        withdrawalIds: selectedWithdrawals,
        status: 'rejected',
        rejectionReason: 'Toplu reddetme işlemi',
        reviewedBy: 'admin'
      });
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentMethodFilter('all');
    setDateFromFilter('');
    setDateToFilter('');
    setAmountMinFilter('');
    setAmountMaxFilter('');
    setSortBy('created_at');
    setSortOrder('desc');
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    queryClient.clear(); // Tüm cache'i temizle
    queryClient.invalidateQueries({ queryKey: ['/api/withdrawals-direct'] });
    queryClient.invalidateQueries({ queryKey: ['/api/withdrawals-direct/stats'] });
    toast({
      title: 'Yenilendi',
      description: 'Para çekme verileri güncellendi'
    });
  };

  const handleSort = (column: string) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('desc');
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Başlık ve Aksiyonlar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Para Çekme Yönetimi</h1>
            <p className="text-gray-400">Para çekme işlemlerini yönet ve onaylayın</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => setManualWithdrawalDialogOpen(true)}
              className="bg-red-600 hover:bg-red-700"
            >
              <MinusCircle className="h-4 w-4 mr-2" />
              Manuel Çekim
            </Button>
            <Button 
              onClick={() => exportData('csv')} 
              variant="outline" 
              size="sm"
              className="bg-gray-800 border-gray-600 hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button 
              onClick={() => exportData('json')} 
              variant="outline" 
              size="sm"
              className="bg-gray-800 border-gray-600 hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
            {selectedWithdrawals.length > 0 && (
              <>
                <Button 
                  onClick={handleBulkApprove}
                  disabled={bulkUpdateMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 transition-all duration-300"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Toplu Onayla ({selectedWithdrawals.length})
                </Button>
                
                <Button 
                  onClick={handleBulkReject}
                  disabled={bulkUpdateMutation.isPending}
                  variant="destructive"
                  className="transition-all duration-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  Toplu Reddet ({selectedWithdrawals.length})
                </Button>
                
                <Button 
                  onClick={() => setBulkStatusDialogOpen(true)}
                  disabled={bulkUpdateMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 transition-all duration-300"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Özel Güncelleme
                </Button>
              </>
            )}
            
            <Button 
              onClick={handleRefresh}
              variant="outline" 
              size="sm"
              className="bg-gray-800 border-gray-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
          </div>
        </div>

        {/* Gelişmiş Para Çekme İstatistik Panosu */}
        {statsData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Ana İstatistikler - Para Çekme Temalı */}
            <Card className="bg-gradient-to-br from-red-600 to-red-800 border-red-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-red-100">Toplam Çekim</p>
                    <p className="text-2xl font-bold text-white">
                      {statsData.summary?.totalWithdrawals || 0}
                    </p>
                    <p className="text-xs text-red-200 mt-1">
                      {statsData.summary?.uniqueUsers || 0} benzersiz kullanıcı
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-red-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-600 to-orange-800 border-orange-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-orange-100">Toplam Miktar</p>
                    <p className="text-2xl font-bold text-white">
                      -{formatCurrency(statsData.summary?.totalAmount || 0)}
                    </p>
                    <p className="text-xs text-orange-200 mt-1">
                      Ort: {formatCurrency(statsData.summary?.avgAmount || 0)}
                    </p>
                  </div>
                  <Wallet className="h-8 w-8 text-orange-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-600 to-green-800 border-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-100">Onaylanmış</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(statsData.summary?.approvedAmount || 0)}
                    </p>
                    <p className="text-xs text-green-200 mt-1">
                      {Math.round(((statsData.summary?.approvedAmount || 0) / (statsData.summary?.totalAmount || 1)) * 100)}% oran
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-600 to-yellow-800 border-yellow-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-yellow-100">Bekleyen</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(statsData.summary?.pendingAmount || 0)}
                    </p>
                    <p className="text-xs text-yellow-200 mt-1">
                      {statsData.statusStats?.find(s => s.status === 'pending')?.count || 0} işlem
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-600 to-purple-800 border-purple-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-purple-100">Risk Skoru</p>
                    <p className="text-2xl font-bold text-white">
                      {((statsData.riskAnalysis?.largeWithdrawals || 0) + (statsData.riskAnalysis?.frequentUsers || 0))}
                    </p>
                    <p className="text-xs text-purple-200 mt-1">
                      {statsData.riskAnalysis?.largeWithdrawals || 0} büyük + {statsData.riskAnalysis?.frequentUsers || 0} sık
                    </p>
                  </div>
                  <Shield className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gelişmiş Para Çekme Analitik Paneli */}
        {statsData && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Risk Analizi - Özel Panel */}
            <Card className="bg-gradient-to-br from-red-900 to-red-700 border-red-500">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-300" />
                  Risk Kontrol Merkezi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 bg-red-800/50 rounded-lg border border-red-600">
                    <div className="flex items-center justify-between">
                      <span className="text-red-200 text-sm">Büyük Çekimler</span>
                      <span className="text-white font-bold">
                        {statsData.riskAnalysis?.largeWithdrawals || 0}
                      </span>
                    </div>
                    <p className="text-xs text-red-300 mt-1">₺1000+ çekimler</p>
                  </div>
                  
                  <div className="p-3 bg-orange-800/50 rounded-lg border border-orange-600">
                    <div className="flex items-center justify-between">
                      <span className="text-orange-200 text-sm">Günlük Çekim</span>
                      <span className="text-white font-bold">
                        {statsData.riskAnalysis?.multipleDaily || 0}
                      </span>
                    </div>
                    <p className="text-xs text-orange-300 mt-1">Bugün yapılan</p>
                  </div>

                  <div className="p-3 bg-yellow-800/50 rounded-lg border border-yellow-600">
                    <div className="flex items-center justify-between">
                      <span className="text-yellow-200 text-sm">Sık Kullanıcılar</span>
                      <span className="text-white font-bold">
                        {statsData.riskAnalysis?.frequentUsers || 0}
                      </span>
                    </div>
                    <p className="text-xs text-yellow-300 mt-1">3+ çekim/hafta</p>
                  </div>

                  <div className="mt-4 p-2 bg-gray-800 rounded text-center">
                    <p className="text-xs text-gray-300">
                      Risk seviyesi: 
                      <span className={`ml-1 font-bold ${
                        ((statsData.riskAnalysis?.largeWithdrawals || 0) + (statsData.riskAnalysis?.frequentUsers || 0)) > 5 
                          ? 'text-red-400' 
                          : ((statsData.riskAnalysis?.largeWithdrawals || 0) + (statsData.riskAnalysis?.frequentUsers || 0)) > 2 
                            ? 'text-yellow-400' 
                            : 'text-green-400'
                      }`}>
                        {((statsData.riskAnalysis?.largeWithdrawals || 0) + (statsData.riskAnalysis?.frequentUsers || 0)) > 5 
                          ? 'Yüksek' 
                          : ((statsData.riskAnalysis?.largeWithdrawals || 0) + (statsData.riskAnalysis?.frequentUsers || 0)) > 2 
                            ? 'Orta' 
                            : 'Düşük'}
                      </span>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Ödeme Yöntemi Dağılımı */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Çekim Yöntemi Analizi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statsData.paymentMethodStats?.map((method, index) => (
                    <div key={method.paymentMethod} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-red-500' : 
                          index === 1 ? 'bg-orange-500' : 
                          index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                        }`}></div>
                        <span className="text-white font-medium">{method.paymentMethod}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{method.count}</p>
                        <p className="text-xs text-gray-400">-{formatCurrency(method.totalAmount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Durum Dağılımı */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Çekim Durum Analizi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statsData.statusStats?.map((status, index) => {
                    const config = getStatusConfig(status.status);
                    const StatusIcon = config.icon;
                    return (
                      <div key={status.status} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <StatusIcon className={`h-5 w-5 ${
                            status.status === 'approved' || status.status === 'completed' ? 'text-green-500' :
                            status.status === 'pending' || status.status === 'processing' ? 'text-yellow-500' :
                            status.status === 'rejected' || status.status === 'failed' ? 'text-red-500' : 'text-blue-500'
                          }`} />
                          <span className="text-white font-medium">{config.label}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">{status.count}</p>
                          <p className="text-xs text-gray-400">-{formatCurrency(status.totalAmount)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* VIP Seviye Analizi */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <User className="h-5 w-5" />
                  VIP Seviye Dağılımı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statsData.vipStats?.map((vip, index) => (
                    <div key={vip.vipLevel} className="flex items-center justify-between p-2 hover:bg-gray-700 rounded transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`px-2 py-1 rounded text-xs font-bold ${
                          vip.vipLevel >= 5 ? 'bg-purple-600 text-white' :
                          vip.vipLevel >= 3 ? 'bg-yellow-600 text-white' :
                          vip.vipLevel >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-600 text-white'
                        }`}>
                          VIP {vip.vipLevel}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{vip.count}</p>
                        <p className="text-xs text-gray-400">-{formatCurrency(vip.totalAmount)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtreler */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <Label className="text-gray-300 mb-2 block">Arama</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="İşlem ID, kullanıcı ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              <div>
                <Label className="text-gray-300 mb-2 block">Durum</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="pending">Beklemede</SelectItem>
                    <SelectItem value="approved">Onaylandı</SelectItem>
                    <SelectItem value="rejected">Reddedildi</SelectItem>
                    <SelectItem value="processing">İşleniyor</SelectItem>
                    <SelectItem value="completed">Tamamlandı</SelectItem>
                    <SelectItem value="failed">Başarısız</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300 mb-2 block">Ödeme Yöntemi</Label>
                <Select value={paymentMethodFilter} onValueChange={setPaymentMethodFilter}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {PAYMENT_METHODS.map(method => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300 mb-2 block">Sıralama</Label>
                <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split('-');
                  setSortBy(field);
                  setSortOrder(order);
                }}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="created_at-desc">Tarihe Göre (Yeni)</SelectItem>
                    <SelectItem value="created_at-asc">Tarihe Göre (Eski)</SelectItem>
                    <SelectItem value="amount-desc">Miktara Göre (Yüksek)</SelectItem>
                    <SelectItem value="amount-asc">Miktara Göre (Düşük)</SelectItem>
                    <SelectItem value="username-asc">Kullanıcıya Göre (A-Z)</SelectItem>
                    <SelectItem value="status-asc">Duruma Göre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-gray-300 mb-2 block">Tarih Aralığı</Label>
                <div className="flex gap-2">
                  <Input
                    type="date"
                    value={dateFromFilter}
                    onChange={(e) => setDateFromFilter(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Input
                    type="date"
                    value={dateToFilter}
                    onChange={(e) => setDateToFilter(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div>
                <Label className="text-gray-300 mb-2 block">Miktar Aralığı</Label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="Min"
                    value={amountMinFilter}
                    onChange={(e) => setAmountMinFilter(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={amountMaxFilter}
                    onChange={(e) => setAmountMaxFilter(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              <div className="flex items-end">
                <Button
                  onClick={clearFilters}
                  variant="outline"
                  className="bg-gray-700 border-gray-600 hover:bg-gray-600 w-full"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Temizle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Para Çekme Listesi */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Para Çekme İşlemleri</CardTitle>
              {withdrawalsData?.withdrawals?.length > 0 && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedWithdrawals.length === withdrawalsData.withdrawals.length}
                    onChange={handleSelectAll}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-400">Tümünü Seç</span>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : withdrawalsData?.withdrawals?.length > 0 ? (
              <div className="space-y-4">
                {withdrawalsData.withdrawals.map((withdrawal: Withdrawal) => {
                  const statusConfig = getStatusConfig(withdrawal.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={withdrawal.id}
                      className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={selectedWithdrawals.includes(withdrawal.id)}
                            onChange={() => handleSelectWithdrawal(withdrawal.id)}
                            className="rounded"
                          />
                          
                          <div className={`p-3 rounded-full ${statusConfig.color}`}>
                            <StatusIcon className="h-6 w-6 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-white">
                                #{withdrawal.id} - {withdrawal.username}
                              </h3>
                              <Badge variant={statusConfig.variant}>
                                {statusConfig.label}
                              </Badge>
                              <Badge variant="outline" className="border-purple-500 text-purple-400">
                                VIP {withdrawal.vipLevel}
                              </Badge>
                              {withdrawal.amount >= 1000 && (
                                <Badge variant="outline" className="border-orange-500 text-orange-400">
                                  <AlertTriangle className="h-3 w-3 mr-1" />
                                  Büyük Çekim
                                </Badge>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                              <div>
                                <span className="font-medium">Miktar:</span>
                                <span className="ml-2 text-red-400 font-bold">
                                  -{formatCurrency(withdrawal.amount)}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Yöntem:</span>
                                <span className="ml-2 text-blue-400">{withdrawal.paymentMethod}</span>
                              </div>
                              <div>
                                <span className="font-medium">Tarih:</span>
                                <span className="ml-2">
                                  {format(new Date(withdrawal.createdAt), 'dd MMM yyyy HH:mm', {
                                    locale: language === 'tr' ? tr : enUS
                                  })}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">E-posta:</span>
                                <span className="ml-2">{withdrawal.email}</span>
                              </div>
                            </div>

                            {withdrawal.description && (
                              <div className="mt-2">
                                <span className="text-sm text-gray-400">
                                  {withdrawal.description}
                                </span>
                              </div>
                            )}

                            {withdrawal.rejectionReason && (
                              <div className="mt-2 p-2 bg-red-900/20 border border-red-700 rounded">
                                <span className="text-sm text-red-400">
                                  <XCircle className="h-4 w-4 inline mr-1" />
                                  Red Sebebi: {withdrawal.rejectionReason}
                                </span>
                              </div>
                            )}

                            {withdrawal.balanceBefore !== undefined && withdrawal.balanceAfter !== undefined && (
                              <div className="mt-2 p-2 bg-blue-900/20 border border-blue-700 rounded">
                                <span className="text-sm text-blue-400">
                                  <Wallet className="h-4 w-4 inline mr-1" />
                                  Bakiye: {formatCurrency(withdrawal.balanceBefore)} → {formatCurrency(withdrawal.balanceAfter)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(withdrawal)}
                            className="bg-blue-600 border-blue-500 hover:bg-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {withdrawal.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateStatusMutation.mutate({ 
                                  id: withdrawal.id, 
                                  status: 'approved',
                                  reviewedBy: 'admin'
                                })}
                                disabled={updateStatusMutation.isPending}
                                className="bg-green-600 hover:bg-green-700"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusUpdate(withdrawal)}
                                disabled={updateStatusMutation.isPending}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          {withdrawal.status !== 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(withdrawal)}
                              className="bg-gray-600 border-gray-500 hover:bg-gray-700"
                            >
                              <ArrowUpDown className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <TrendingDown className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Para çekme işlemi bulunamadı</p>
              </div>
            )}

            {/* Sayfalama */}
            {withdrawalsData?.totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                >
                  Önceki
                </Button>
                
                <span className="flex items-center px-4 text-sm text-gray-400">
                  Sayfa {currentPage} / {withdrawalsData.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(withdrawalsData.totalPages, prev + 1))}
                  disabled={currentPage === withdrawalsData.totalPages}
                  className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                >
                  Sonraki
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Durum Güncelleme Dialog */}
        <Dialog open={statusDialogOpen} onOpenChange={setStatusDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Para Çekme Durumunu Güncelle</DialogTitle>
            </DialogHeader>
            {selectedWithdrawal && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                updateStatusMutation.mutate({
                  id: selectedWithdrawal.id,
                  status: formData.get('status') as string,
                  rejectionReason: formData.get('rejectionReason') as string || undefined,
                  adminNotes: formData.get('adminNotes') as string || undefined,
                  reviewedBy: 'admin'
                });
              }} className="space-y-4">
                <div>
                  <Label>İşlem Bilgisi</Label>
                  <div className="p-3 bg-gray-700 rounded border">
                    <p className="text-sm">
                      <span className="font-medium">ID:</span> #{selectedWithdrawal.id}<br />
                      <span className="font-medium">Kullanıcı:</span> {selectedWithdrawal.username}<br />
                      <span className="font-medium">Miktar:</span> {formatCurrency(selectedWithdrawal.amount)}<br />
                      <span className="font-medium">Mevcut Durum:</span> {getStatusConfig(selectedWithdrawal.status).label}
                    </p>
                  </div>
                </div>

                <div>
                  <Label>Yeni Durum</Label>
                  <Select name="status" defaultValue={selectedWithdrawal.status}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="pending">Beklemede</SelectItem>
                      <SelectItem value="approved">Onaylandı</SelectItem>
                      <SelectItem value="rejected">Reddedildi</SelectItem>
                      <SelectItem value="processing">İşleniyor</SelectItem>
                      <SelectItem value="completed">Tamamlandı</SelectItem>
                      <SelectItem value="failed">Başarısız</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Red Sebebi (Opsiyonel)</Label>
                  <Textarea
                    name="rejectionReason"
                    placeholder="Reddetme sebebini belirtin..."
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>

                <div>
                  <Label>Admin Notları</Label>
                  <Textarea
                    name="adminNotes"
                    placeholder="İç notlar ekleyebilirsiniz..."
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setStatusDialogOpen(false)}
                    className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateStatusMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Güncelle
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Manuel Para Çekme Dialog */}
        <Dialog open={manualWithdrawalDialogOpen} onOpenChange={setManualWithdrawalDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manuel Para Çekme Ekle</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              manualWithdrawalMutation.mutate({
                userId: parseInt(formData.get('userId') as string),
                amount: parseFloat(formData.get('amount') as string),
                paymentMethod: formData.get('paymentMethod') as string,
                description: formData.get('description') as string,
                referenceId: formData.get('referenceId') as string,
                status: formData.get('status') as string,
                adminNotes: formData.get('adminNotes') as string
              });
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Kullanıcı ID</Label>
                  <Input
                    name="userId"
                    type="number"
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Kullanıcı ID'si"
                  />
                </div>
                <div>
                  <Label>Miktar (TRY)</Label>
                  <Input
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label>Ödeme Yöntemi</Label>
                  <Select name="paymentMethod" defaultValue="Manual">
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="Manual">Manuel</SelectItem>
                      <SelectItem value="Bank Transfer">Banka Havalesi</SelectItem>
                      <SelectItem value="Papara">Papara</SelectItem>
                      <SelectItem value="Crypto">Kripto Para</SelectItem>
                      <SelectItem value="Other">Diğer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Durum</Label>
                  <Select name="status" defaultValue="pending">
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="pending">Beklemede</SelectItem>
                      <SelectItem value="approved">Onaylandı</SelectItem>
                      <SelectItem value="completed">Tamamlandı</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label>Referans ID (Opsiyonel)</Label>
                <Input
                  name="referenceId"
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="İşlem referans numarası"
                />
              </div>

              <div>
                <Label>Açıklama</Label>
                <Textarea
                  name="description"
                  placeholder="İşlem açıklaması..."
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div>
                <Label>Admin Notları</Label>
                <Textarea
                  name="adminNotes"
                  placeholder="İç notlar..."
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setManualWithdrawalDialogOpen(false)}
                  className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={manualWithdrawalMutation.isPending}
                  className="bg-red-600 hover:bg-red-700"
                >
                  Ekle
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}