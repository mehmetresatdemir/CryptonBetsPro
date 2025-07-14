import { useState, useEffect, useMemo } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/admin/AdminLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Download, 
  Filter, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Clock,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  RefreshCw,
  FileText,
  Calendar,
  CreditCard,
  Banknote,
  ArrowUpDown,
  MoreHorizontal,
  AlertTriangle,
  ShieldCheck,
  Ban
} from 'lucide-react';
import { format } from 'date-fns';
import { tr as dateTr } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { tr } from '@/utils/admin-translations';

interface Transaction {
  id: number;
  transactionId: string;
  userId: number;
  username?: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'refund';
  amount: string;
  balanceBefore: string | null;
  balanceAfter: string | null;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing' | 'approved' | 'rejected';
  paymentMethod: string | null;
  description: string | null;
  metadata?: any;
  createdAt: string;
  updatedAt?: string;
  processedAt: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  riskScore?: number | null;
}

interface TransactionStats {
  summary: Array<{
    type: string;
    status?: string;
    count: number;
    totalAmount: string;
    avgAmount?: string;
  }>;
  daily: Array<{
    date: string;
    count: number;
    totalAmount: string;
    type: string;
  }>;
  paymentMethods: Array<{
    paymentMethod: string | null;
    count: number;
    totalAmount: string;
  }>;
}

const STATUS_CONFIG = {
  pending: { label: 'Beklemede', color: 'bg-yellow-500', icon: Clock },
  processing: { label: 'İşleniyor', color: 'bg-blue-500', icon: RefreshCw },
  completed: { label: 'Tamamlandı', color: 'bg-green-500', icon: CheckCircle },
  failed: { label: 'Başarısız', color: 'bg-red-500', icon: XCircle },
  cancelled: { label: 'İptal Edildi', color: 'bg-gray-500', icon: Ban },
  approved: { label: 'Onaylandı', color: 'bg-emerald-500', icon: ShieldCheck },
  rejected: { label: 'Reddedildi', color: 'bg-rose-500', icon: AlertTriangle }
};

const TYPE_CONFIG = {
  deposit: { label: 'Para Yatırma', color: 'bg-green-600', icon: TrendingUp },
  withdrawal: { label: 'Para Çekme', color: 'bg-red-600', icon: TrendingDown },
  bet: { label: 'Bahis', color: 'bg-purple-600', icon: DollarSign },
  win: { label: 'Kazanç', color: 'bg-yellow-600', icon: TrendingUp },
  bonus: { label: 'Bonus', color: 'bg-blue-600', icon: DollarSign },
  refund: { label: 'İade', color: 'bg-gray-600', icon: ArrowUpDown }
};

export default function TransactionsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(20);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  // İşlem verilerini getir
  const { data: transactionsData, isLoading, refetch } = useQuery({
    queryKey: ['/api/admin/transactions', currentPage, searchTerm, typeFilter, statusFilter, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(dateRange.from && { from: dateRange.from }),
        ...(dateRange.to && { to: dateRange.to })
      });

      const response = await fetch(`/api/admin/transactions?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('İşlem verileri alınamadı');
      return response.json();
    },
    refetchInterval: 30000 // 30 saniyede bir yenile
  });

  // İstatistik verilerini getir
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/transactions/stats/summary'],
    queryFn: async () => {
      const response = await fetch('/api/admin/transactions/stats/summary', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('İstatistik verileri alınamadı');
      return response.json();
    },
    refetchInterval: 60000, // 1 dakikada bir yenile
    staleTime: 0, // Always fetch fresh data
    gcTime: 0 // Don't cache
  });

  // İşlem durumu güncelleme
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      const response = await fetch(`/api/admin/transactions/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ status })
      });
      if (!response.ok) throw new Error('İşlem durumu güncellenemedi');
      return response.json();
    },
    onSuccess: () => {
      toast({ description: 'İşlem durumu güncellendi' });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions/stats/summary'] });
    },
    onError: () => {
      toast({ description: 'İşlem durumu güncellenemedi', variant: 'destructive' });
    }
  });

  // Veri dışa aktarma
  const exportDataMutation = useMutation({
    mutationFn: async (format: 'csv' | 'excel') => {
      const params = new URLSearchParams({
        format,
        ...(searchTerm && { search: searchTerm }),
        ...(typeFilter !== 'all' && { type: typeFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(dateRange.from && { from: dateRange.from }),
        ...(dateRange.to && { to: dateRange.to })
      });

      const response = await fetch(`/api/admin/transactions/export?${params}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Dışa aktarma başarısız');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({ description: 'Veriler başarıyla dışa aktarıldı' });
    },
    onError: () => {
      toast({ description: 'Dışa aktarma başarısız', variant: 'destructive' });
    }
  });

  // İstatistik kartları için hesaplanan değerler
  const statsCards = useMemo(() => {
    if (!statsData || !statsData.summary) {
      return [
        { title: 'Toplam İşlem', value: '0', icon: FileText, color: 'from-blue-600 to-blue-800' },
        { title: 'Toplam Hacim', value: '₺0,00', icon: DollarSign, color: 'from-green-600 to-green-800' },
        { title: 'Tamamlanan', value: '0', icon: CheckCircle, color: 'from-emerald-600 to-emerald-800' },
        { title: 'Bekleyen', value: '0', icon: Clock, color: 'from-yellow-600 to-yellow-800' }
      ];
    }

    const totalTransactions = statsData.summary.reduce((acc: number, item: any) => acc + parseInt(item.count), 0);
    const totalAmount = statsData.summary.reduce((acc: number, item: any) => acc + Math.abs(parseFloat(item.totalAmount || 0)), 0);
    const completedCount = statsData.summary.filter((s: any) => s.status === 'completed').reduce((acc: number, item: any) => acc + parseInt(item.count), 0);
    const pendingCount = statsData.summary.filter((s: any) => s.status === 'approved' || s.status === 'pending').reduce((acc: number, item: any) => acc + parseInt(item.count), 0);

    return [
      {
        title: 'Toplam İşlem',
        value: totalTransactions.toLocaleString(),
        icon: FileText,
        color: 'from-blue-600 to-blue-800'
      },
      {
        title: 'Toplam Hacim',
        value: `₺${totalAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`,
        icon: DollarSign,
        color: 'from-green-600 to-green-800'
      },
      {
        title: 'Tamamlanan',
        value: completedCount.toLocaleString(),
        icon: CheckCircle,
        color: 'from-emerald-600 to-emerald-800'
      },
      {
        title: 'Bekleyen',
        value: pendingCount.toLocaleString(),
        icon: Clock,
        color: 'from-yellow-600 to-yellow-800'
      }
    ];
  }, [statsData]);

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return `₺${num.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}`;
  };

  const formatDate = (dateStr: string) => {
    return format(new Date(dateStr), 'dd MMM yyyy HH:mm', { locale: dateTr });
  };

  const handleStatusUpdate = (id: number, status: string) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleViewDetails = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setDetailsOpen(true);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setStatusFilter('all');
    setDateRange({ from: '', to: '' });
    setCurrentPage(1);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {tr('admin.transactions')}
            </h1>
            <p className="text-gray-400">
              Tüm finansal işlemleri görüntüle, yönet ve analiz et
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => refetch()} 
              variant="outline" 
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
            <Button 
              onClick={() => exportDataMutation.mutate('csv')}
              className="bg-green-600 hover:bg-green-700"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV İndir
            </Button>
            <Button 
              onClick={() => exportDataMutation.mutate('excel')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Download className="h-4 w-4 mr-2" />
              Excel İndir
            </Button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className={`bg-gradient-to-br ${stat.color} border-0`}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-white/80">{stat.title}</p>
                      <p className="text-2xl font-bold text-white">{stat.value}</p>
                    </div>
                    <Icon className="h-8 w-8 text-white/60" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filtreler */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtreler
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Kullanıcı adı, işlem ID..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="İşlem Türü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Türler</SelectItem>
                  {Object.entries(TYPE_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <SelectItem key={key} value={key}>{config.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="Başlangıç"
                value={dateRange.from}
                onChange={(e) => setDateRange(prev => ({ ...prev, from: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
              />

              <Input
                type="date"
                placeholder="Bitiş"
                value={dateRange.to}
                onChange={(e) => setDateRange(prev => ({ ...prev, to: e.target.value }))}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>
            
            {(searchTerm || typeFilter !== 'all' || statusFilter !== 'all' || dateRange.from || dateRange.to) && (
              <Button 
                onClick={clearFilters} 
                variant="outline" 
                size="sm"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
              >
                Filtreleri Temizle
              </Button>
            )}
          </CardContent>
        </Card>

        {/* İşlemler Tablosu */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">İşlemler</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : (
              <div className="space-y-4">
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-600 hover:bg-gray-700/50">
                      <TableHead className="text-gray-300">İşlem ID</TableHead>
                      <TableHead className="text-gray-300">Kullanıcı</TableHead>
                      <TableHead className="text-gray-300">Tür</TableHead>
                      <TableHead className="text-gray-300">Miktar</TableHead>
                      <TableHead className="text-gray-300">Durum</TableHead>
                      <TableHead className="text-gray-300">Tarih</TableHead>
                      <TableHead className="text-gray-300 text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {transactionsData?.transactions?.map((transaction: Transaction) => {
                      const typeConfig = TYPE_CONFIG[transaction.type];
                      const statusConfig = STATUS_CONFIG[transaction.status];
                      const TypeIcon = typeConfig?.icon || FileText;
                      const StatusIcon = statusConfig?.icon || Clock;

                      return (
                        <TableRow key={transaction.id} className="border-gray-600 hover:bg-gray-700/50">
                          <TableCell className="text-white font-mono text-sm">
                            {transaction.transactionId ? transaction.transactionId.slice(0, 8) + '...' : 'N/A'}
                          </TableCell>
                          <TableCell className="text-white">
                            <div className="flex items-center gap-2">
                              <Users className="h-4 w-4 text-gray-400" />
                              {transaction.username || `User ${transaction.userId}`}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${typeConfig?.color || 'bg-gray-600'} text-white flex items-center gap-1 w-fit`}>
                              <TypeIcon className="h-3 w-3" />
                              {typeConfig?.label || transaction.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-white font-semibold">
                            {formatCurrency(transaction.amount)}
                          </TableCell>
                          <TableCell>
                            <Badge className={`${statusConfig?.color || 'bg-gray-600'} text-white flex items-center gap-1 w-fit`}>
                              <StatusIcon className="h-3 w-3" />
                              {statusConfig?.label || transaction.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-gray-300">
                            {formatDate(transaction.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button
                                onClick={() => handleViewDetails(transaction)}
                                size="sm"
                                variant="outline"
                                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {transaction.status === 'pending' && (
                                <>
                                  <Button
                                    onClick={() => handleStatusUpdate(transaction.id, 'completed')}
                                    size="sm"
                                    className="bg-green-600 hover:bg-green-700"
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    onClick={() => handleStatusUpdate(transaction.id, 'failed')}
                                    size="sm"
                                    variant="destructive"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>

                {/* Sayfalama */}
                {transactionsData?.pagination && (
                  <div className="flex items-center justify-between">
                    <p className="text-gray-400 text-sm">
                      {transactionsData.pagination.total || 0} işlemden {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, transactionsData.pagination.total || 0)} arası gösteriliyor
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Önceki
                      </Button>
                      <Button
                        onClick={() => setCurrentPage(prev => prev + 1)}
                        disabled={currentPage >= Math.ceil(transactionsData.pagination.total / pageSize)}
                        variant="outline"
                        size="sm"
                        className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      >
                        Sonraki
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* İşlem Detayları Dialog */}
        <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                İşlem Detayları
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                İşlem ID: {selectedTransaction?.transactionId}
              </DialogDescription>
            </DialogHeader>
            
            {selectedTransaction && (
              <Tabs defaultValue="details" className="space-y-4">
                <TabsList className="bg-gray-700">
                  <TabsTrigger value="details">Genel Bilgiler</TabsTrigger>
                  <TabsTrigger value="technical">Teknik Bilgiler</TabsTrigger>
                  <TabsTrigger value="risk">Risk Analizi</TabsTrigger>
                </TabsList>

                <TabsContent value="details" className="space-y-4">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Kullanıcı</label>
                        <p className="text-white">{selectedTransaction.username || `User ${selectedTransaction.userId}`}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">İşlem Türü</label>
                        <p className="text-white">{TYPE_CONFIG[selectedTransaction.type]?.label || selectedTransaction.type}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Miktar</label>
                        <p className="text-white text-xl font-semibold">{formatCurrency(selectedTransaction.amount)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Durum</label>
                        <Badge className={`${STATUS_CONFIG[selectedTransaction.status]?.color || 'bg-gray-600'} text-white`}>
                          {STATUS_CONFIG[selectedTransaction.status]?.label || selectedTransaction.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Ödeme Yöntemi</label>
                        <p className="text-white">{selectedTransaction.paymentMethod || 'Belirtilmemiş'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Para Birimi</label>
                        <p className="text-white">{selectedTransaction.currency}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Önceki Bakiye</label>
                        <p className="text-white">{selectedTransaction.balanceBefore ? formatCurrency(selectedTransaction.balanceBefore) : 'N/A'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Sonraki Bakiye</label>
                        <p className="text-white">{selectedTransaction.balanceAfter ? formatCurrency(selectedTransaction.balanceAfter) : 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  
                  {selectedTransaction.description && (
                    <div>
                      <label className="text-sm font-medium text-gray-400">Açıklama</label>
                      <p className="text-white bg-gray-700 p-3 rounded">{selectedTransaction.description}</p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="technical" className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-400">İşlem ID</label>
                      <p className="text-white font-mono bg-gray-700 p-2 rounded">{selectedTransaction.transactionId}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">IP Adresi</label>
                      <p className="text-white">{selectedTransaction.ipAddress || 'Belirtilmemiş'}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-400">User Agent</label>
                      <p className="text-white text-sm bg-gray-700 p-2 rounded break-all">
                        {selectedTransaction?.userAgent || 'Belirtilmemiş'}
                      </p>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Oluşturulma</label>
                        <p className="text-white">{formatDate(selectedTransaction.createdAt)}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Güncellenme</label>
                        <p className="text-white">{selectedTransaction.updatedAt ? formatDate(selectedTransaction.updatedAt) : 'Güncellenmedi'}</p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">İşlenme</label>
                        <p className="text-white">
                          {selectedTransaction.processedAt ? formatDate(selectedTransaction.processedAt) : 'İşlenmedi'}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="risk" className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-400">Risk Skoru</label>
                      <div className="flex items-center gap-2">
                        {selectedTransaction.riskScore !== null && selectedTransaction.riskScore !== undefined ? (
                          <>
                            <div className={`w-4 h-4 rounded-full ${
                              (selectedTransaction.riskScore || 0) > 0.7 ? 'bg-red-500' :
                              (selectedTransaction.riskScore || 0) > 0.4 ? 'bg-yellow-500' : 'bg-green-500'
                            }`} />
                            <span className="text-white">{((selectedTransaction.riskScore || 0) * 100).toFixed(1)}%</span>
                          </>
                        ) : (
                          <span className="text-gray-400">Analiz edilmedi</span>
                        )}
                      </div>
                    </div>
                    
                    {selectedTransaction.metadata && (
                      <div>
                        <label className="text-sm font-medium text-gray-400">Metadata</label>
                        <pre className="text-white bg-gray-700 p-3 rounded text-xs overflow-auto">
                          {JSON.stringify(selectedTransaction.metadata, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            )}
            
            <DialogFooter>
              <Button onClick={() => setDetailsOpen(false)} variant="outline">
                Kapat
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}