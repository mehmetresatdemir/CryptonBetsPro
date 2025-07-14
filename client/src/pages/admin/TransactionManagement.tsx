import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Search, Download, Eye, Check, X, Clock, 
  CreditCard, Wallet, TrendingUp, TrendingDown,
  DollarSign, Users, Calendar, AlertTriangle,
  CheckCircle, XCircle, RefreshCw
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface Transaction {
  id: number;
  userId: number;
  username: string;
  type: 'deposit' | 'withdrawal' | 'bonus' | 'bet' | 'win';
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  paymentMethod: string;
  transactionHash?: string;
  description?: string;
  createdAt: string;
  processedAt?: string;
  notes?: string;
  fees?: number;
  exchangeRate?: number;
}

interface TransactionStats {
  totalTransactions: number;
  totalVolume: number;
  totalDeposits: number;
  totalWithdrawals: number;
  pendingCount: number;
  todayTransactions: number;
  todayVolume: number;
  averageAmount: number;
}

export default function TransactionManagement() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    paymentMethod: 'all',
    dateFrom: '',
    dateTo: '',
    page: 1,
    limit: 20
  });

  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'process' | null>(null);
  const [actionNotes, setActionNotes] = useState('');

  // Transaction istatistikleri
  const { data: transactionStats } = useQuery({
    queryKey: ['/api/admin/transactions/stats'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/transactions/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Transaction istatistikleri alınamadı');
      return await response.json();
    }
  });

  // Transaction listesi
  const { data: transactionData, isLoading } = useQuery({
    queryKey: ['/api/admin/transactions', filters],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const queryParams = new URLSearchParams({
        search: filters.search,
        type: filters.type,
        status: filters.status,
        paymentMethod: filters.paymentMethod,
        dateFrom: filters.dateFrom,
        dateTo: filters.dateTo,
        page: filters.page.toString(),
        limit: filters.limit.toString()
      });
      const response = await fetch(`/api/admin/transactions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Transaction verileri alınamadı');
      return await response.json();
    }
  });

  // Transaction işleme mutation
  const processTransactionMutation = useMutation({
    mutationFn: async (data: { transactionId: number; action: string; notes?: string }) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/transactions/${data.transactionId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: data.action,
          notes: data.notes
        })
      });
      if (!response.ok) throw new Error('Transaction işlenemedi');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions/stats'] });
      setActionDialogOpen(false);
      setSelectedTransaction(null);
      setActionNotes('');
      toast({
        title: "İşlem Başarılı",
        description: "Transaction başarıyla işlendi",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Transaction işlenirken hata oluştu",
        variant: "destructive",
      });
    }
  });

  const handleProcessTransaction = () => {
    if (!selectedTransaction || !actionType) return;

    processTransactionMutation.mutate({
      transactionId: selectedTransaction.id,
      action: actionType,
      notes: actionNotes
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          <Clock className="w-3 h-3 mr-1" />
          Beklemede
        </Badge>;
      case 'processing':
        return <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          <RefreshCw className="w-3 h-3 mr-1" />
          İşleniyor
        </Badge>;
      case 'completed':
        return <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Tamamlandı
        </Badge>;
      case 'failed':
        return <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
          <XCircle className="w-3 h-3 mr-1" />
          Başarısız
        </Badge>;
      case 'cancelled':
        return <Badge variant="outline" className="bg-gray-500/20 text-gray-400 border-gray-500/30">
          <X className="w-3 h-3 mr-1" />
          İptal
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'deposit':
        return <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
          <TrendingUp className="w-3 h-3 mr-1" />
          Yatırım
        </Badge>;
      case 'withdrawal':
        return <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
          <TrendingDown className="w-3 h-3 mr-1" />
          Çekim
        </Badge>;
      case 'bonus':
        return <Badge variant="outline" className="bg-purple-500/20 text-purple-400 border-purple-500/30">
          Bonus
        </Badge>;
      case 'bet':
        return <Badge variant="outline" className="bg-blue-500/20 text-blue-400 border-blue-500/30">
          Bahis
        </Badge>;
      case 'win':
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          Kazanç
        </Badge>;
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Transaction Yönetimi</h1>
            <p className="text-gray-400 mt-2">Tüm finansal işlemleri yönetin ve onaylayın</p>
          </div>
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
            >
              <Download className="w-4 h-4 mr-2" />
              Rapor İndir
            </Button>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/transactions'] })}
              variant="outline" 
              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Yenile
            </Button>
          </div>
        </div>

        {/* İstatistikler */}
        {transactionStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <Card className="bg-gray-800/80 border-yellow-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-xs">Toplam İşlem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-white">{transactionStats.totalTransactions}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-yellow-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-xs">Toplam Hacim</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-blue-400">{formatCurrency(transactionStats.totalVolume)}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-yellow-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-xs">Toplam Yatırım</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-green-400">{formatCurrency(transactionStats.totalDeposits)}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-yellow-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-xs">Toplam Çekim</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-red-400">{formatCurrency(transactionStats.totalWithdrawals)}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-yellow-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-xs">Beklemede</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-yellow-400">{transactionStats.pendingCount}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-yellow-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-xs">Bugün İşlem</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-white">{transactionStats.todayTransactions}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-yellow-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-xs">Bugün Hacim</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-purple-400">{formatCurrency(transactionStats.todayVolume)}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-yellow-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-xs">Ort. Tutar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-cyan-400">{formatCurrency(transactionStats.averageAmount)}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtreler */}
        <Card className="bg-gray-800/80 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-white">Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Kullanıcı ara..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <Select 
                value={filters.type} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, type: value, page: 1 }))}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue placeholder="Tür seçin" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">Tüm Türler</SelectItem>
                  <SelectItem value="deposit">Yatırım</SelectItem>
                  <SelectItem value="withdrawal">Çekim</SelectItem>
                  <SelectItem value="bonus">Bonus</SelectItem>
                  <SelectItem value="bet">Bahis</SelectItem>
                  <SelectItem value="win">Kazanç</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="processing">İşleniyor</SelectItem>
                  <SelectItem value="completed">Tamamlandı</SelectItem>
                  <SelectItem value="failed">Başarısız</SelectItem>
                  <SelectItem value="cancelled">İptal</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.paymentMethod} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, paymentMethod: value, page: 1 }))}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue placeholder="Ödeme yöntemi" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">Tüm Yöntemler</SelectItem>
                  <SelectItem value="bank_transfer">Banka Havalesi</SelectItem>
                  <SelectItem value="credit_card">Kredi Kartı</SelectItem>
                  <SelectItem value="papara">Papara</SelectItem>
                  <SelectItem value="crypto">Kripto Para</SelectItem>
                  <SelectItem value="mefete">Mefete</SelectItem>
                </SelectContent>
              </Select>

              <Input
                type="date"
                placeholder="Başlangıç tarihi"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value, page: 1 }))}
                className="bg-gray-700/50 border-gray-600 text-white"
              />

              <Input
                type="date"
                placeholder="Bitiş tarihi"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value, page: 1 }))}
                className="bg-gray-700/50 border-gray-600 text-white"
              />

              <Button 
                onClick={() => setFilters({ 
                  search: '', type: 'all', status: 'all', paymentMethod: 'all', 
                  dateFrom: '', dateTo: '', page: 1, limit: 20 
                })}
                variant="outline"
                className="border-gray-600 text-gray-400 hover:bg-gray-700/50"
              >
                Temizle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Transaction Listesi */}
        <Card className="bg-gray-800/80 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-white">Transaction Listesi</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Transaction'lar yükleniyor...</div>
              </div>
            ) : transactionData?.transactions?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-4 py-3 text-left text-gray-400">ID</th>
                      <th className="px-4 py-3 text-left text-gray-400">Kullanıcı</th>
                      <th className="px-4 py-3 text-left text-gray-400">Tür</th>
                      <th className="px-4 py-3 text-left text-gray-400">Tutar</th>
                      <th className="px-4 py-3 text-left text-gray-400">Durum</th>
                      <th className="px-4 py-3 text-left text-gray-400">Ödeme Yöntemi</th>
                      <th className="px-4 py-3 text-left text-gray-400">Tarih</th>
                      <th className="px-4 py-3 text-left text-gray-400">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactionData.transactions.map((transaction: Transaction) => (
                      <tr key={transaction.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                        <td className="px-4 py-3 text-gray-300">#{transaction.id}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <Users className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-white font-medium">{transaction.username}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {getTypeBadge(transaction.type)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-white font-bold">{formatCurrency(transaction.amount)}</div>
                          {transaction.fees && transaction.fees > 0 && (
                            <div className="text-xs text-gray-400">Komisyon: {formatCurrency(transaction.fees)}</div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(transaction.status)}
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {transaction.paymentMethod}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(transaction.createdAt).toLocaleDateString('tr-TR')}
                          <div className="text-xs">
                            {new Date(transaction.createdAt).toLocaleTimeString('tr-TR')}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedTransaction(transaction);
                                setActionDialogOpen(true);
                              }}
                              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {(transaction.status === 'pending' || transaction.status === 'processing') && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedTransaction(transaction);
                                    setActionType('approve');
                                    setActionDialogOpen(true);
                                  }}
                                  className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedTransaction(transaction);
                                    setActionType('reject');
                                    setActionDialogOpen(true);
                                  }}
                                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {transactionData.totalPages > 1 && (
                  <div className="flex justify-center mt-6 space-x-2">
                    <Button
                      variant="outline"
                      disabled={filters.page === 1}
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                      className="border-gray-600 text-gray-400"
                    >
                      Önceki
                    </Button>
                    <span className="flex items-center text-gray-400 px-4">
                      {filters.page} / {transactionData.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={filters.page === transactionData.totalPages}
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                      className="border-gray-600 text-gray-400"
                    >
                      Sonraki
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <CreditCard className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <div className="text-gray-400">Transaction bulunamadı</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Transaction İşlem Dialog */}
        <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                Transaction Detayları - #{selectedTransaction?.id}
              </DialogTitle>
            </DialogHeader>
            
            {selectedTransaction && (
              <div className="space-y-6">
                {/* Transaction Bilgileri */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Kullanıcı</label>
                    <div className="text-white font-medium">{selectedTransaction.username}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Tür</label>
                    <div className="mt-1">{getTypeBadge(selectedTransaction.type)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Tutar</label>
                    <div className="text-white font-bold text-lg">
                      {formatCurrency(selectedTransaction.amount)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Durum</label>
                    <div className="mt-1">{getStatusBadge(selectedTransaction.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Ödeme Yöntemi</label>
                    <div className="text-white">{selectedTransaction.paymentMethod}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Para Birimi</label>
                    <div className="text-white">{selectedTransaction.currency}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">İşlem Tarihi</label>
                    <div className="text-white">
                      {new Date(selectedTransaction.createdAt).toLocaleDateString('tr-TR')} {' '}
                      {new Date(selectedTransaction.createdAt).toLocaleTimeString('tr-TR')}
                    </div>
                  </div>
                  {selectedTransaction.processedAt && (
                    <div>
                      <label className="text-sm text-gray-400">İşlenme Tarihi</label>
                      <div className="text-white">
                        {new Date(selectedTransaction.processedAt).toLocaleDateString('tr-TR')} {' '}
                        {new Date(selectedTransaction.processedAt).toLocaleTimeString('tr-TR')}
                      </div>
                    </div>
                  )}
                </div>

                {/* Ek Bilgiler */}
                {(selectedTransaction.transactionHash || selectedTransaction.fees || selectedTransaction.description) && (
                  <div className="space-y-3 pt-4 border-t border-gray-700">
                    {selectedTransaction.transactionHash && (
                      <div>
                        <label className="text-sm text-gray-400">İşlem Hash'i</label>
                        <div className="text-white font-mono text-sm bg-gray-700/50 p-2 rounded">
                          {selectedTransaction.transactionHash}
                        </div>
                      </div>
                    )}
                    
                    {selectedTransaction.fees && selectedTransaction.fees > 0 && (
                      <div>
                        <label className="text-sm text-gray-400">Komisyon</label>
                        <div className="text-white">{formatCurrency(selectedTransaction.fees)}</div>
                      </div>
                    )}
                    
                    {selectedTransaction.description && (
                      <div>
                        <label className="text-sm text-gray-400">Açıklama</label>
                        <div className="text-white">{selectedTransaction.description}</div>
                      </div>
                    )}
                  </div>
                )}

                {/* Mevcut Notlar */}
                {selectedTransaction.notes && (
                  <div>
                    <label className="text-sm text-gray-400">Mevcut Notlar</label>
                    <div className="mt-1 p-3 bg-gray-700/50 rounded border text-gray-300">
                      {selectedTransaction.notes}
                    </div>
                  </div>
                )}

                {/* İşlem Formu */}
                {actionType && (
                  <div className="space-y-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                      {actionType === 'approve' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      <span className="text-white font-medium">
                        {actionType === 'approve' ? 'Transaction\'ı Onayla' : 'Transaction\'ı Reddet'}
                      </span>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400">
                        {actionType === 'approve' ? 'Onay Notları (İsteğe bağlı)' : 'Red Sebebi (Zorunlu)'}
                      </label>
                      <Textarea
                        value={actionNotes}
                        onChange={(e) => setActionNotes(e.target.value)}
                        placeholder={actionType === 'approve' 
                          ? 'Onay ile ilgili notlarınızı yazın...' 
                          : 'Red sebebini detaylı olarak yazın...'
                        }
                        className="mt-1 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={handleProcessTransaction}
                        disabled={processTransactionMutation.isPending || (actionType === 'reject' && !actionNotes.trim())}
                        className={actionType === 'approve' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                        }
                      >
                        {processTransactionMutation.isPending ? 'İşleniyor...' : 
                          actionType === 'approve' ? 'Onayla' : 'Reddet'
                        }
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setActionType(null);
                          setActionNotes('');
                        }}
                        className="border-gray-600 text-gray-400"
                      >
                        İptal
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}