import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { DetailModal } from '@/components/admin/DetailModal';
import { AdvancedFilters } from '@/components/admin/AdvancedFilters';
import { ExportTools } from '@/components/admin/ExportTools';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Search, Download, Eye, CheckCircle, XCircle, Clock, 
  TrendingUp, DollarSign, Users, CreditCard, RotateCcw,
  Plus, FileText, Calendar, Filter, ArrowUpDown,
  Wallet, Activity, AlertTriangle, Check, X, Settings,
  RefreshCw, Zap, Shield
} from 'lucide-react';
import { format as formatDate } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

interface Deposit {
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

interface DepositStats {
  summary: {
    totalDeposits: number;
    totalAmount: number;
    avgAmount: number;
    minAmount: number;
    maxAmount: number;
    approvedAmount: number;
    pendingAmount: number;
    rejectedAmount: number;
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
}

const STATUS_CONFIG = {
  pending: { 
    label: 'Beklemede', 
    color: 'bg-yellow-500', 
    icon: Clock,
    variant: 'outline' as const
  },
  approved: { 
    label: 'Onaylandı', 
    color: 'bg-green-500', 
    icon: CheckCircle,
    variant: 'default' as const
  },
  rejected: { 
    label: 'Reddedildi', 
    color: 'bg-red-500', 
    icon: XCircle,
    variant: 'destructive' as const
  },
  processing: { 
    label: 'İşleniyor', 
    color: 'bg-blue-500', 
    icon: Activity,
    variant: 'secondary' as const
  },
  completed: { 
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

export default function Deposits() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('all');
  const [dateFromFilter, setDateFromFilter] = useState('');
  const [dateToFilter, setDateToFilter] = useState('');
  const [amountMinFilter, setAmountMinFilter] = useState('');
  const [amountMaxFilter, setAmountMaxFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDeposits, setSelectedDeposits] = useState<number[]>([]);
  const [selectedDeposit, setSelectedDeposit] = useState<Deposit | null>(null);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [bulkStatusDialogOpen, setBulkStatusDialogOpen] = useState(false);
  const [manualDepositDialogOpen, setManualDepositDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [vipLevelFilter, setVipLevelFilter] = useState('all');
  const [userTypeFilter, setUserTypeFilter] = useState('all');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showExportTools, setShowExportTools] = useState(false);
  const { toast } = useToast();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  // Para yatırma işlemlerini getir
  const { data: depositsData, isLoading } = useQuery({
    queryKey: ['/api/admin/deposits', currentPage, searchTerm, statusFilter, paymentMethodFilter, 
               dateFromFilter, dateToFilter, amountMinFilter, amountMaxFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: searchTerm,
        status: statusFilter,
        paymentMethod: paymentMethodFilter,
        dateFrom: dateFromFilter,
        dateTo: dateToFilter,
        amountMin: amountMinFilter,
        amountMax: amountMaxFilter
      });
      
      const response = await fetch(`/api/admin/deposits?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Para yatırma verileri alınamadı');
      return response.json();
    }
  });

  // Para yatırma istatistiklerini getir
  const { data: statsData } = useQuery({
    queryKey: ['/api/admin/deposits/stats/summary', dateFromFilter, dateToFilter, paymentMethodFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        dateFrom: dateFromFilter,
        dateTo: dateToFilter,
        paymentMethod: paymentMethodFilter
      });
      
      const response = await fetch(`/api/admin/deposits/stats/summary?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('İstatistikler alınamadı');
      return response.json();
    }
  });

  // Para yatırma durumu güncelleme
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason, reviewedBy }: { 
      id: number; 
      status: string; 
      rejectionReason?: string; 
      reviewedBy?: string; 
    }) => {
      const response = await fetch(`/api/admin/deposits/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status, rejectionReason, reviewedBy })
      });
      if (!response.ok) throw new Error('Durum güncellenemedi');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/deposits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/deposits/stats/summary'] });
      setStatusDialogOpen(false);
      toast({
        title: 'Başarılı',
        description: 'Para yatırma durumu güncellendi'
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
    mutationFn: async ({ depositIds, status, rejectionReason, reviewedBy }: { 
      depositIds: number[]; 
      status: string; 
      rejectionReason?: string; 
      reviewedBy?: string; 
    }) => {
      const response = await fetch('/api/admin/deposits/bulk/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ depositIds, status, rejectionReason, reviewedBy })
      });
      if (!response.ok) throw new Error('Toplu güncelleme başarısız');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/deposits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/deposits/stats/summary'] });
      setBulkStatusDialogOpen(false);
      setSelectedDeposits([]);
      toast({
        title: 'Başarılı',
        description: 'Seçili para yatırma işlemleri güncellendi'
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

  // Manuel para yatırma ekleme
  const manualDepositMutation = useMutation({
    mutationFn: async (depositData: any) => {
      const response = await fetch('/api/admin/deposits/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(depositData)
      });
      if (!response.ok) throw new Error('Manuel para yatırma eklenemedi');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/deposits'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/deposits/stats/summary'] });
      setManualDepositDialogOpen(false);
      toast({
        title: 'Başarılı',
        description: 'Manuel para yatırma eklendi'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Manuel para yatırma eklenemedi',
        variant: 'destructive'
      });
    }
  });

  // Detay görüntüleme fonksiyonu
  const handleViewDetail = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setDetailDialogOpen(true);
  };

  // Durum güncelleme işlemi
  const handleStatusUpdate = (deposit: Deposit) => {
    setSelectedDeposit(deposit);
    setStatusDialogOpen(true);
  };

  // Para yatırma seçimi
  const handleSelectDeposit = (depositId: number) => {
    setSelectedDeposits(prev => 
      prev.includes(depositId) 
        ? prev.filter(id => id !== depositId)
        : [...prev, depositId]
    );
  };

  // Tümünü seç/seçimi kaldır
  const handleSelectAll = () => {
    if (depositsData?.deposits) {
      if (selectedDeposits.length === depositsData.deposits.length) {
        setSelectedDeposits([]);
      } else {
        setSelectedDeposits(depositsData.deposits.map((d: any) => d.id));
      }
    }
  };

  // Hızlı onaylama
  const handleQuickApprove = (depositId: number) => {
    updateStatusMutation.mutate({
      id: depositId,
      status: 'approved',
      reviewedBy: 'admin'
    });
  };

  // Hızlı reddetme
  const handleQuickReject = (depositId: number) => {
    updateStatusMutation.mutate({
      id: depositId,
      status: 'rejected',
      reviewedBy: 'admin',
      rejectionReason: 'Admin tarafından reddedildi'
    });
  };

  // Toplu onaylama
  const handleBulkApprove = () => {
    if (selectedDeposits.length > 0) {
      bulkUpdateMutation.mutate({
        depositIds: selectedDeposits,
        status: 'approved',
        reviewedBy: 'admin'
      });
    }
  };

  // Toplu reddetme
  const handleBulkReject = () => {
    if (selectedDeposits.length > 0) {
      setBulkStatusDialogOpen(true);
    }
  };

  // Yenileme işlemi
  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['/api/admin/deposits'] });
    queryClient.invalidateQueries({ queryKey: ['/api/admin/deposits/stats/summary'] });
    toast({
      title: 'Yenilendi',
      description: 'Para yatırma verileri güncellendi'
    });
  };

  // Gelişmiş filtre state'i
  const filterState = {
    searchTerm,
    statusFilter,
    paymentMethodFilter,
    dateFromFilter,
    dateToFilter,
    amountMinFilter,
    amountMaxFilter,
    vipLevelFilter,
    userTypeFilter
  };

  // Filtre değişiklik handler'ı
  const handleFiltersChange = (newFilters: any) => {
    setSearchTerm(newFilters.searchTerm);
    setStatusFilter(newFilters.statusFilter);
    setPaymentMethodFilter(newFilters.paymentMethodFilter);
    setDateFromFilter(newFilters.dateFromFilter);
    setDateToFilter(newFilters.dateToFilter);
    setAmountMinFilter(newFilters.amountMinFilter);
    setAmountMaxFilter(newFilters.amountMaxFilter);
    setVipLevelFilter(newFilters.vipLevelFilter);
    setUserTypeFilter(newFilters.userTypeFilter);
    setCurrentPage(1);
  };

  // Filtreleri temizleme
  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('all');
    setPaymentMethodFilter('all');
    setDateFromFilter('');
    setDateToFilter('');
    setAmountMinFilter('');
    setAmountMaxFilter('');
    setVipLevelFilter('all');
    setUserTypeFilter('all');
    setCurrentPage(1);
  };

  // Aktif filtre sayısı
  const activeFilterCount = [
    searchTerm,
    statusFilter !== 'all' ? statusFilter : '',
    paymentMethodFilter !== 'all' ? paymentMethodFilter : '',
    dateFromFilter,
    dateToFilter,
    amountMinFilter,
    amountMaxFilter,
    vipLevelFilter !== 'all' ? vipLevelFilter : '',
    userTypeFilter !== 'all' ? userTypeFilter : ''
  ].filter(Boolean).length;

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
      
      const response = await fetch(`/api/admin/deposits/export/data?${params}`);
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `deposits-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Başarılı',
        description: `Para yatırma verileri ${format.toUpperCase()} formatında dışa aktarıldı`
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Dışa aktarma işlemi başarısız',
        variant: 'destructive'
      });
    }
  };



  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Başlık ve Aksiyonlar */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Para Yatırma Yönetimi</h1>
            <p className="text-gray-400">Para yatırma işlemlerini yönet ve onaylayın</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => setManualDepositDialogOpen(true)}
              className="bg-green-600 hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
            >
              <Plus className="h-4 w-4 mr-2" />
              Manuel Ekle
            </Button>
            
            <Button 
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              variant="outline" 
              className={`transition-all duration-300 ${showAdvancedFilters ? 'bg-blue-600 text-white border-blue-500' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
            >
              <Filter className="h-4 w-4 mr-2" />
              Gelişmiş Filtreler
            </Button>
            
            <Button 
              onClick={() => setShowExportTools(!showExportTools)}
              variant="outline" 
              className={`transition-all duration-300 ${showExportTools ? 'bg-purple-600 text-white border-purple-500' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
            >
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
            
            <Button 
              onClick={() => exportData('csv')} 
              variant="outline" 
              size="sm"
              className="bg-gray-800 border-gray-600 hover:bg-gray-700 transition-all duration-300"
            >
              <FileText className="h-4 w-4 mr-2" />
              Hızlı CSV
            </Button>
            
            <Button 
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['/api/admin/deposits'] });
                queryClient.invalidateQueries({ queryKey: ['/api/admin/deposits/stats/summary'] });
              }}
              variant="outline" 
              size="sm"
              className="bg-gray-800 border-gray-600 hover:bg-blue-600 hover:text-white transition-all duration-300"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
            
            {selectedDeposits.length > 0 && (
              <>
                <Button 
                  onClick={handleBulkApprove}
                  disabled={bulkUpdateMutation.isPending}
                  className="bg-green-600 hover:bg-green-700 transition-all duration-300"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Toplu Onayla ({selectedDeposits.length})
                </Button>
                
                <Button 
                  onClick={handleBulkReject}
                  disabled={bulkUpdateMutation.isPending}
                  variant="destructive"
                  className="transition-all duration-300"
                >
                  <X className="h-4 w-4 mr-2" />
                  Toplu Reddet ({selectedDeposits.length})
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
          </div>
        </div>

        {/* Gelişmiş İstatistik Panosu */}
        {statsData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Ana İstatistikler */}
            <Card className="bg-gradient-to-br from-blue-600 to-blue-800 border-blue-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-blue-100">Toplam İşlem</p>
                    <p className="text-2xl font-bold text-white">
                      {statsData.summary?.totalDeposits || 0}
                    </p>
                    <p className="text-xs text-blue-200 mt-1">
                      {statsData.summary?.uniqueUsers || 0} benzersiz kullanıcı
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-600 to-green-800 border-green-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-green-100">Toplam Miktar</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(statsData.summary?.totalAmount || 0)}
                    </p>
                    <p className="text-xs text-green-200 mt-1">
                      Ort: {formatCurrency(statsData.summary?.avgAmount || 0)}
                    </p>
                  </div>
                  <Wallet className="h-8 w-8 text-green-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-emerald-600 to-emerald-800 border-emerald-500">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-emerald-100">Onaylanmış</p>
                    <p className="text-2xl font-bold text-white">
                      {formatCurrency(statsData.summary?.approvedAmount || 0)}
                    </p>
                    <p className="text-xs text-emerald-200 mt-1">
                      {Math.round(((statsData.summary?.approvedAmount || 0) / (statsData.summary?.totalAmount || 1)) * 100)}% oran
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-emerald-200" />
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
                      {statsData.statusStats?.find((s: any) => s.status === 'pending')?.count || 0} işlem
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
                    <p className="text-sm text-purple-100">Performans</p>
                    <p className="text-2xl font-bold text-white">
                      {Math.round(((statsData.summary?.approvedAmount || 0) / (statsData.summary?.totalAmount || 1)) * 100)}%
                    </p>
                    <p className="text-xs text-purple-200 mt-1">
                      Onay oranı
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gelişmiş Analitik Paneli */}
        {statsData && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Ödeme Yöntemi Dağılımı */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Ödeme Yöntemi Analizi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statsData.paymentMethodStats?.map((method: any, index: number) => (
                    <div key={method.paymentMethod} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          index === 0 ? 'bg-blue-500' : 
                          index === 1 ? 'bg-green-500' : 
                          index === 2 ? 'bg-yellow-500' : 'bg-purple-500'
                        }`}></div>
                        <span className="text-white font-medium">{method.paymentMethod}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold">{method.count}</p>
                        <p className="text-xs text-gray-400">{formatCurrency(method.totalAmount)}</p>
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
                  Durum Analizi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statsData.statusStats?.map((status: any, index: number) => {
                    const config = getStatusConfig(status.status);
                    const StatusIcon = config.icon;
                    return (
                      <div key={status.status} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <StatusIcon className={`h-5 w-5 ${
                            status.status === 'approved' ? 'text-green-500' :
                            status.status === 'pending' ? 'text-yellow-500' :
                            status.status === 'rejected' ? 'text-red-500' : 'text-blue-500'
                          }`} />
                          <span className="text-white font-medium">{config.label}</span>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-bold">{status.count}</p>
                          <p className="text-xs text-gray-400">{formatCurrency(status.totalAmount)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Son Günlük Aktivite */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Günlük Aktivite (Son 7 Gün)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {statsData.dailyStats?.slice(0, 7).map((day: any, index: number) => (
                    <div key={day.date} className="flex items-center justify-between p-2 hover:bg-gray-700 rounded transition-colors">
                      <div>
                        <p className="text-white font-medium">
                          {formatDate(new Date(day.date), 'dd MMM', { locale: language === 'tr' ? tr : enUS })}
                        </p>
                        <p className="text-xs text-gray-400">{day.count} işlem</p>
                      </div>
                      <div className="text-right">
                        <p className="text-green-400 font-bold">{formatCurrency(day.totalAmount)}</p>
                        <div className="flex gap-1 text-xs">
                          <span className="text-green-500">✓{day.approvedCount}</span>
                          <span className="text-yellow-500">⏳{day.pendingCount}</span>
                          <span className="text-red-500">✗{day.rejectedCount}</span>
                        </div>
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

        {/* Para Yatırma Listesi */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-white">Para Yatırma İşlemleri</CardTitle>
              {depositsData?.deposits?.length > 0 && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={selectedDeposits.length === depositsData.deposits.length}
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
            ) : depositsData?.deposits?.length > 0 ? (
              <div className="space-y-4">
                {depositsData.deposits.map((deposit: Deposit) => {
                  const statusConfig = getStatusConfig(deposit.status);
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={deposit.id}
                      className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <input
                            type="checkbox"
                            checked={selectedDeposits.includes(deposit.id)}
                            onChange={() => handleSelectDeposit(deposit.id)}
                            className="rounded"
                          />
                          
                          <div className={`p-3 rounded-full ${statusConfig.color}`}>
                            <StatusIcon className="h-6 w-6 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-medium text-white">
                                #{deposit.id} - {deposit.username}
                              </h3>
                              <Badge variant={statusConfig.variant}>
                                {statusConfig.label}
                              </Badge>
                              <Badge variant="outline" className="border-blue-500 text-blue-400">
                                VIP {deposit.vipLevel}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-400">
                              <div>
                                <span className="font-medium">Miktar:</span>
                                <span className="ml-2 text-green-400 font-bold">
                                  {formatCurrency(deposit.amount)}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">Yöntem:</span>
                                <span className="ml-2 text-blue-400">{deposit.paymentMethod}</span>
                              </div>
                              <div>
                                <span className="font-medium">Tarih:</span>
                                <span className="ml-2">
                                  {formatDate(new Date(deposit.createdAt), 'dd MMM yyyy HH:mm', {
                                    locale: language === 'tr' ? tr : enUS
                                  })}
                                </span>
                              </div>
                              <div>
                                <span className="font-medium">E-posta:</span>
                                <span className="ml-2">{deposit.email}</span>
                              </div>
                            </div>

                            {deposit.description && (
                              <div className="mt-2">
                                <span className="text-sm text-gray-400">
                                  {deposit.description}
                                </span>
                              </div>
                            )}

                            {deposit.rejectionReason && (
                              <div className="mt-2 p-2 bg-red-900/20 border border-red-700 rounded">
                                <span className="text-sm text-red-400">
                                  <AlertTriangle className="h-4 w-4 inline mr-1" />
                                  Red Sebebi: {deposit.rejectionReason}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewDetail(deposit)}
                            className="bg-blue-600 border-blue-500 hover:bg-blue-700"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>

                          {deposit.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => updateStatusMutation.mutate({ 
                                  id: deposit.id, 
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
                                onClick={() => handleStatusUpdate(deposit)}
                                disabled={updateStatusMutation.isPending}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            </>
                          )}

                          {deposit.status !== 'pending' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusUpdate(deposit)}
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
                <DollarSign className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Para yatırma işlemi bulunamadı</p>
              </div>
            )}

            {/* Sayfalama */}
            {depositsData?.totalPages > 1 && (
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
                  Sayfa {currentPage} / {depositsData.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(depositsData.totalPages, prev + 1))}
                  disabled={currentPage === depositsData.totalPages}
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
              <DialogTitle>Para Yatırma Durumunu Güncelle</DialogTitle>
            </DialogHeader>
            {selectedDeposit && (
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target as HTMLFormElement);
                updateStatusMutation.mutate({
                  id: selectedDeposit.id,
                  status: formData.get('status') as string,
                  rejectionReason: formData.get('rejectionReason') as string || undefined,
                  reviewedBy: 'admin'
                });
              }} className="space-y-4">
                <div>
                  <Label>İşlem Bilgisi</Label>
                  <div className="p-3 bg-gray-700 rounded border">
                    <p className="text-sm">
                      <span className="font-medium">ID:</span> #{selectedDeposit.id}<br />
                      <span className="font-medium">Kullanıcı:</span> {selectedDeposit.username}<br />
                      <span className="font-medium">Miktar:</span> {formatCurrency(selectedDeposit.amount)}<br />
                      <span className="font-medium">Mevcut Durum:</span> {getStatusConfig(selectedDeposit.status).label}
                    </p>
                  </div>
                </div>

                <div>
                  <Label>Yeni Durum</Label>
                  <Select name="status" defaultValue={selectedDeposit.status}>
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

        {/* Manuel Para Yatırma Dialog */}
        <Dialog open={manualDepositDialogOpen} onOpenChange={setManualDepositDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Manuel Para Yatırma Ekle</DialogTitle>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              manualDepositMutation.mutate({
                userId: parseInt(formData.get('userId') as string),
                amount: parseFloat(formData.get('amount') as string),
                paymentMethod: formData.get('paymentMethod') as string,
                description: formData.get('description') as string,
                referenceId: formData.get('referenceId') as string,
                status: formData.get('status') as string
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
                  <Select name="status" defaultValue="approved">
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
              
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setManualDepositDialogOpen(false)}
                  className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                >
                  İptal
                </Button>
                <Button
                  type="submit"
                  disabled={manualDepositMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Ekle
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Detay Modal */}
        <DetailModal
          isOpen={detailDialogOpen}
          onClose={() => {
            setDetailDialogOpen(false);
            setSelectedDeposit(null);
          }}
          data={selectedDeposit}
          type="deposit"
        />

        {/* Toplu İşlem Durumu Güncellemesi Dialog */}
        <Dialog open={bulkStatusDialogOpen} onOpenChange={setBulkStatusDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Toplu Durum Güncelleme</DialogTitle>
              <p className="text-gray-400">
                {selectedDeposits.length} para yatırma işleminin durumunu güncelleyeceksiniz.
              </p>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target as HTMLFormElement);
              selectedDeposits.forEach(id => {
                updateStatusMutation.mutate({
                  id,
                  status: formData.get('status') as string,
                  rejectionReason: formData.get('rejectionReason') as string || undefined,
                  reviewedBy: 'admin'
                });
              });
              setBulkStatusDialogOpen(false);
              setSelectedDeposits([]);
            }} className="space-y-4">
              <div>
                <Label>Yeni Durum</Label>
                <Select name="status" defaultValue="approved">
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
              
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBulkStatusDialogOpen(false)}
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
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}