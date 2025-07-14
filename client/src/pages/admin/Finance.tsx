import React, { useState } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useAdminLanguage } from '@/contexts/UserContext';
import {
  getFinancialSummary,
  updateTransactionStatus,
  getPendingTransactions,
  getTransactions
} from '@/services/adminService';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Calendar, 
  ArrowDownIcon, 
  ArrowUpIcon, 
  BadgeDollarSign, 
  BarChart3, 
  CreditCard, 
  DollarSign, 
  Download, 
  LineChart, 
  PieChart, 
  TrendingUp, 
  TrendingDown,
  Users,
  Wallet,
  Gift
} from 'lucide-react';

import PageTitle from '@/components/admin/PageTitle';
import StatCard from '@/components/admin/StatCard';
import TimeRangeSelector from '@/components/admin/TimeRangeSelector';

type TransactionType = 'deposit' | 'withdrawal' | 'bonus' | 'bet' | 'win';
type TransactionStatus = 'completed' | 'pending' | 'failed' | 'cancelled' | 'approved' | 'rejected';

interface Transaction {
  id: number;
  userId: number;
  username: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  method: string;
  createdAt: string;
  completedAt?: string;
}

interface FinancialSummary {
  totalDeposits: number;
  totalWithdrawals: number;
  netIncome: number;
  pendingWithdrawals: number;
  totalUsers: number;
  activeUsers: number;
  conversionRate: number;
  depositCount: number;
  withdrawalCount: number;
  averageDepositAmount: number;
  lastMonthGrowth: number;
}

// Mock veri
// Gerçek kullanıcı işlemleri apiden alınacak

// Mock finansal özet
const mockFinancialSummary: FinancialSummary = {
  totalDeposits: 24650,
  totalWithdrawals: 18920,
  netIncome: 5730,
  pendingWithdrawals: 2650,
  totalUsers: 128,
  activeUsers: 86,
  conversionRate: 32.5,
  depositCount: 235,
  withdrawalCount: 175,
  averageDepositAmount: 84.62,
  lastMonthGrowth: 8.3
};

const FinancePage = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { translate } = useAdminLanguage();
  const [timeRange, setTimeRange] = useState<string>("today");
  const [transactionType, setTransactionType] = useState<string>('all');
  const [transactionStatus, setTransactionStatus] = useState<string>('all');
  
  // Bu kısım aşağıda yeniden tanımlandığı için çıkarıldı
  
  // İşlem reddetme modalı için state
  const [rejectionModalOpen, setRejectionModalOpen] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<number | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  
  // İşlem durumunu güncelleme fonksiyonu
  const handleUpdateTransactionStatus = async (transactionId: number, status: string) => {
    try {
      await updateTransactionStatus(transactionId, {
        status: status === 'approved' ? 'approved' : 'rejected',
        rejectionReason: status === 'rejected' ? 'Admin tarafından reddedildi' : undefined
      });
      
      toast({
        title: "İşlem güncellendi",
        description: `İşlem başarıyla ${status === 'approved' ? 'onaylandı' : 'reddedildi'}.`,
        variant: "default"
      });
      
      // İşlem verilerini güncelle
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      
    } catch (error: any) {
      console.error('İşlem durumu güncelleme hatası:', error);
      toast({
        title: "Hata",
        description: error.message || 'İşlem durumu güncellenirken bir hata oluştu',
        variant: "destructive"
      });
    }
  };
  
  // İşlemi reddetme işlemini başlat
  const handleRejectTransaction = (transactionId: number) => {
    setSelectedTransactionId(transactionId);
    setRejectionModalOpen(true);
  };
  
  // İşlemi reddetme işlemini onayla
  const confirmRejectTransaction = async () => {
    if (!selectedTransactionId) return;
    
    try {
      await updateTransactionStatus(selectedTransactionId, {
        status: 'rejected',
        rejectionReason: rejectionReason || 'Admin tarafından reddedildi'
      });
      
      toast({
        title: "İşlem reddedildi",
        description: "İşlem başarıyla reddedildi.",
        variant: "default"
      });
      
      // Modalı kapat
      setRejectionModalOpen(false);
      setRejectionReason('');
      setSelectedTransactionId(null);
      
      // İşlem verilerini güncelle
      queryClient.invalidateQueries({ queryKey: ['recent-transactions'] });
      queryClient.invalidateQueries({ queryKey: ['financial-summary'] });
      
    } catch (error: any) {
      console.error('İşlem reddetme hatası:', error);
      toast({
        title: "Hata",
        description: error.message || 'İşlem reddedilirken bir hata oluştu',
        variant: "destructive"
      });
    }
  };

  // Finans işlemlerini getir
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['admin-transactions', transactionType, transactionStatus, timeRange],
    queryFn: async () => {
      try {
        // Gerçek API çağrısı
        const response = await fetch('/api/admin/transactions', {
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('İşlemler alınamadı');
        }
        
        const data = await response.json();
        console.log("Admin paneli işlem verileri:", data);
        
        // API yanıtını UI modeline dönüştür
        return Array.isArray(data) ? data.map((tx: any) => ({
          id: tx.id,
          userId: tx.userId,
          username: tx.username || `Kullanıcı #${tx.userId}`,
          amount: tx.amount,
          type: tx.type,
          status: tx.status,
          method: tx.method || 'N/A',
          methodDetails: tx.methodDetails || null,
          createdAt: tx.createdAt,
          completedAt: tx.updatedAt
        })) : [];
      } catch (error) {
        console.error('İşlem verilerini getirme hatası:', error);
        
        // Hata durumunda boş dizi dön
        toast({
          title: "Veri hatası",
          description: "İşlem verileri getirilirken bir sorun oluştu.",
          variant: "destructive"
        });
        return [];
      }
    },
  });
  
  // Finans özetini getir
  const { data: financialSummary = mockFinancialSummary, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['financial-summary', timeRange],
    queryFn: async () => {
      try {
        // Gerçek API çağrısı
        const data = await getFinancialSummary(timeRange);
        return data;
      } catch (error) {
        console.error('Finans özeti getirme hatası:', error);
        // Hata durumunda mock veri dön
        toast({
          title: "Veri hatası",
          description: "Finans özeti getirilirken bir sorun oluştu. Demo veriler gösteriliyor.",
          variant: "destructive"
        });
        return mockFinancialSummary;
      }
    },
  });

  // Para işlemi durumuna göre badge bileşenini getir
  const getStatusBadge = (status: TransactionStatus) => {
    let variant = '';
    let label = '';
    
    switch (status) {
      case 'completed':
      case 'approved':
        variant = 'bg-green-500/10 text-green-500 border-green-500/20';
        label = status === 'completed' ? 'Tamamlandı' : 'Onaylandı';
        break;
      case 'pending':
        variant = 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
        label = 'Beklemede';
        break;
      case 'failed':
      case 'rejected':
        variant = 'bg-red-500/10 text-red-500 border-red-500/20';
        label = status === 'failed' ? 'Başarısız' : 'Reddedildi';
        break;
      case 'cancelled':
        variant = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        label = 'İptal Edildi';
        break;
      default:
        variant = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
        label = status;
    }
    
    return (
      <Badge className={`${variant} capitalize rounded-md px-2 py-1 text-xs`}>
        {label}
      </Badge>
    );
  };

  // İşlem türüne göre simge getir
  const getTransactionIcon = (type: TransactionType) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownIcon className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <ArrowUpIcon className="h-4 w-4 text-red-500" />;
      case 'bet':
        return <BarChart3 className="h-4 w-4 text-red-500" />;
      case 'win':
        return <BadgeDollarSign className="h-4 w-4 text-green-500" />;
      case 'bonus':
        return <Gift className="h-4 w-4 text-yellow-500" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-400" />;
    }
  };
  
  // Sayıyı para birimi formatına çevir
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Yüzde formatı
  const formatPercent = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // İşlemler tablosundaki satırları render etme fonksiyonu
  const renderTransactionRows = () => {
    if (!transactions || transactions.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center py-8 text-gray-400">
{t('admin.no_data') || 'Gösterilecek işlem bulunmuyor'}
          </TableCell>
        </TableRow>
      );
    }
    
    return transactions.map((transaction: any) => (
      <TableRow 
        key={transaction.id} 
        className={`hover:bg-gray-700/50 ${transaction.status === 'pending' ? 'bg-yellow-500/5' : ''}`}
      >
        <TableCell className="font-medium">{transaction.id}</TableCell>
        <TableCell>{transaction.username}</TableCell>
        <TableCell>{getTransactionIcon(transaction.type)}</TableCell>
        <TableCell className={`font-medium ${
          transaction.type === 'deposit' || transaction.type === 'win' ? 'text-green-500' : 
          transaction.type === 'withdrawal' || transaction.type === 'bet' ? 'text-red-500' : 
          'text-yellow-500'
        }`}>
          {transaction.type === 'deposit' || transaction.type === 'win' ? '+' : 
           transaction.type === 'withdrawal' || transaction.type === 'bet' ? '-' : ''}
          {formatCurrency(transaction.amount)}
        </TableCell>
        <TableCell>
          {(() => {
            // JSON içeriğini parse et (eğer JSON formatında ise)
            try {
              if (transaction.methodDetails && transaction.methodDetails.startsWith('{')) {
                const methodData = JSON.parse(transaction.methodDetails);
                return methodData.name || transaction.method || "Bilinmiyor";
              }
              return transaction.method || "Bilinmiyor";
            } catch {
              return transaction.method || "Bilinmiyor";
            }
          })()}
        </TableCell>
        <TableCell>
          {transaction.status === 'completed' ? (
            <Badge className="bg-green-500/20 text-green-500 border border-green-500/20">Onaylandı</Badge>
          ) : transaction.status === 'pending' ? (
            <Badge className="bg-yellow-500/20 text-yellow-500 border border-yellow-500/20">Beklemede</Badge>
          ) : transaction.status === 'rejected' ? (
            <Badge className="bg-red-500/20 text-red-500 border border-red-500/20">Reddedildi</Badge>
          ) : (
            <Badge className="bg-gray-500/20 text-gray-500 border border-gray-500/20">{transaction.status}</Badge>
          )}
        </TableCell>
        <TableCell className="text-gray-400 text-sm">
          {new Date(transaction.createdAt).toLocaleDateString('tr-TR')} {new Date(transaction.createdAt).toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'})}
        </TableCell>
        <TableCell>
          {transaction.status === 'pending' && (
            <div className="flex space-x-1">
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 px-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/30"
                onClick={() => handleUpdateTransactionStatus(transaction.id, 'approved')}
              >
                Onayla
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className="h-8 px-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30"
                onClick={() => handleRejectTransaction(transaction.id)}
              >
                Reddet
              </Button>
            </div>
          )}
        </TableCell>
      </TableRow>
    ));
  };

  return (
    <AdminLayout title="Finans Yönetimi">
      <div className="flex flex-col gap-6">
        <div className="flex justify-between items-center">
          <PageTitle 
            title="Finans Yönetimi" 
            subtitle="Bahis ve para yönetimi işlemlerini izleyin ve yönetin" 
          />
          
          {/* Zaman aralığı seçici */}
          <TimeRangeSelector 
            value={timeRange} 
            onChange={setTimeRange} 
          />
        </div>
        
        {/* Finans durum kartları */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Toplam Para Yatırma"
            value={formatCurrency(financialSummary.totalDeposits)}
            description={`${financialSummary.depositCount} işlem`}
            icon={<ArrowDownIcon className="h-4 w-4" />}
            trend={+8.2}
          />
          <StatCard 
            title="Toplam Para Çekme"
            value={formatCurrency(financialSummary.totalWithdrawals)}
            description={`${financialSummary.withdrawalCount} işlem`}
            icon={<ArrowUpIcon className="h-4 w-4" />}
            trend={+4.5}
          />
          <StatCard 
            title="Net Gelir"
            value={formatCurrency(financialSummary.netIncome)}
            description="Bu ay için"
            icon={<DollarSign className="h-4 w-4" />}
            trend={financialSummary.lastMonthGrowth}
          />
          <StatCard 
            title="Dönüşüm Oranı"
            value={formatPercent(financialSummary.conversionRate)}
            description={`${financialSummary.activeUsers}/${financialSummary.totalUsers} kullanıcı`}
            icon={<Users className="h-4 w-4" />}
            trend={+2.1}
          />
        </div>
        
        {/* Finans kartları grid */}
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          <div className="col-span-1 lg:col-span-2">
            <Card className="border-gray-800 bg-gray-950/50 text-white shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Son İşlemler</CardTitle>
                <CardDescription className="text-gray-400">
                  Son yapılan finansal işlemler
                </CardDescription>
              </CardHeader>
              <CardContent>
              {isLoadingTransactions ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-yellow-500"></div>
                </div>
              ) : (
                <Table className="text-gray-200">
                  <TableHeader className="bg-gray-900/50">
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>Tür</TableHead>
                      <TableHead>Tutar</TableHead>
                      <TableHead>Yöntem</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderTransactionRows()}
                  </TableBody>
                </Table>
              )}
            </CardContent>
            <CardFooter className="border-t border-gray-700 p-4 flex justify-between">
              <div className="text-sm text-gray-400">Toplam {transactions.length} işlem gösteriliyor</div>
              <Button variant="outline" className="text-gray-300 border-gray-700 hover:bg-gray-800 hover:text-white gap-2">
                <Download className="h-4 w-4" />
                İşlemleri İndir
              </Button>
            </CardFooter>
            </Card>
          </div>
          <div className="col-span-1">
            <Card className="border-gray-800 bg-gray-950/50 text-white h-full shadow-lg">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Ödeme Yöntemleri</CardTitle>
                <CardDescription className="text-gray-400">
                  Aktif ödeme yöntemleri ve kullanım oranları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Papara</span>
                      <span className="text-xs text-gray-400">%42</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{ width: '42%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Havale/EFT</span>
                      <span className="text-xs text-gray-400">%35</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{ width: '35%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Kripto</span>
                      <span className="text-xs text-gray-400">%15</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '15%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">QR Kod</span>
                      <span className="text-xs text-gray-400">%8</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{ width: '8%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t border-gray-700 pt-4">
                <Button variant="outline" className="w-full border-gray-700 text-gray-200 hover:bg-gray-700 hover:text-white gap-2">
                  <CreditCard className="h-4 w-4" />
                  Ödeme Yöntemlerini Yönet
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </div>
      
      {/* İşlem Reddetme Modalı */}
      <Dialog open={rejectionModalOpen} onOpenChange={setRejectionModalOpen}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">İşlemi Reddet</DialogTitle>
            <DialogDescription className="text-gray-400">
              Bu işlemi reddetme nedeninizi belirtin. Bu bilgi kullanıcıya iletilecektir.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="rejectionReason" className="text-sm mb-2 block">Reddetme Nedeni</Label>
            <Textarea 
              id="rejectionReason"
              className="bg-gray-800 border-gray-700 text-white resize-none" 
              placeholder="Reddetme nedeninizi buraya yazın..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows={3}
            />
          </div>
          
          <DialogFooter className="flex space-x-2 justify-end">
            <Button 
              variant="outline" 
              className="border-gray-700 text-gray-300 hover:bg-gray-800"
              onClick={() => setRejectionModalOpen(false)}
            >
              İptal
            </Button>
            <Button 
              variant="destructive"
              onClick={confirmRejectTransaction}
            >
              Reddet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default FinancePage;