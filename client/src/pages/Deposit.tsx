import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeApiService } from '@/services/financeApiService';
import { 
  CreditCard, Wallet, Building, DollarSign, ArrowLeft, 
  CheckCircle, Clock, AlertTriangle, Upload, FileText,
  Shield, Zap, TrendingUp, Star
} from 'lucide-react';
import { useLocation } from 'wouter';

interface PaymentMethod {
  id: string;
  name: string;
  type: 'bank' | 'ewallet' | 'crypto' | 'other';
  icon: React.ComponentType;
  minAmount: number;
  maxAmount: number;
  processingTime: string;
  fees: string;
  description: string;
  isActive: boolean;
}

interface Transaction {
  id: number;
  transactionId: string;
  amount: number;
  status: string;
  paymentMethod: string;
  createdAt: string;
  description?: string;
}

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'bank_transfer',
    name: 'Banka Havalesi',
    type: 'bank',
    icon: Building,
    minAmount: 50,
    maxAmount: 100000,
    processingTime: '5-15 dakika',
    fees: 'Ücretsiz',
    description: 'Güvenli ve hızlı banka havalesi ile para yatırın',
    isActive: true
  },
  {
    id: 'papara',
    name: 'Papara',
    type: 'ewallet',
    icon: Wallet,
    minAmount: 20,
    maxAmount: 50000,
    processingTime: 'Anında',
    fees: 'Ücretsiz',
    description: 'Papara ile anında para yatırın',
    isActive: true
  },
  {
    id: 'crypto',
    name: 'Kripto Para',
    type: 'crypto',
    icon: Zap,
    minAmount: 100,
    maxAmount: 200000,
    processingTime: '10-30 dakika',
    fees: '%1',
    description: 'Bitcoin, Ethereum ve diğer kripto paralar',
    isActive: true
  },
  {
    id: 'other',
    name: 'Diğer Yöntemler',
    type: 'other',
    icon: CreditCard,
    minAmount: 50,
    maxAmount: 75000,
    processingTime: '5-30 dakika',
    fees: 'Değişken',
    description: 'Diğer ödeme yöntemleri',
    isActive: true
  }
];

export default function Deposit() {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [accountDetails, setAccountDetails] = useState('');
  const [receipt, setReceipt] = useState<File | null>(null);
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const [lastTransactionId, setLastTransactionId] = useState('');
  const { toast } = useToast();
  const { translate } = useLanguage();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Kullanıcı bilgilerini getir
  const { data: userInfo } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Kullanıcı bilgileri alınamadı');
      return response.json();
    }
  });

  // Son işlemleri getir
  const { data: recentTransactions } = useQuery({
    queryKey: ['/api/user/transactions', 'deposit'],
    queryFn: async () => {
      const response = await fetch('/api/user/transactions?type=deposit&limit=5', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('İşlemler alınamadı');
      return response.json();
    }
  });

  // Para yatırma işlemi
  const depositMutation = useMutation({
    mutationFn: async (depositData: {
      amount: number;
      method: string;
      methodDetails: string;
      accountDetails: string;
      receipt?: string;
      description: string;
    }) => {
      const response = await fetch('/api/user/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(depositData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Para yatırma işlemi başarısız');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setLastTransactionId(data.transactionId);
      setSuccessDialogOpen(true);
      setAmount('');
      setDescription('');
      setAccountDetails('');
      setReceipt(null);
      setSelectedMethod(null);
      queryClient.invalidateQueries({ queryKey: ['/api/user/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: 'Başarılı',
        description: 'Para yatırma talebiniz alındı'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Para yatırma işlemi başarısız',
        variant: 'destructive'
      });
    }
  });

  const handleDeposit = async () => {
    if (!selectedMethod || !amount) {
      toast({
        title: 'Eksik Bilgi',
        description: 'Lütfen ödeme yöntemi ve miktarı seçin',
        variant: 'destructive'
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum < selectedMethod.minAmount || amountNum > selectedMethod.maxAmount) {
      toast({
        title: 'Geçersiz Miktar',
        description: `Miktar ${selectedMethod.minAmount} - ${selectedMethod.maxAmount} TL arasında olmalıdır`,
        variant: 'destructive'
      });
      return;
    }

    const depositData = {
      amount: amountNum,
      method: selectedMethod.name,
      methodDetails: JSON.stringify({
        methodId: selectedMethod.id,
        methodType: selectedMethod.type
      }),
      accountDetails,
      description,
      receipt: receipt ? await convertFileToBase64(receipt) : undefined
    };

    depositMutation.mutate(depositData);
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const getStatusBadge = (status: string) => {
    const config = {
      pending: { label: 'Beklemede', variant: 'outline' as const, icon: Clock },
      approved: { label: 'Onaylandı', variant: 'default' as const, icon: CheckCircle },
      completed: { label: 'Tamamlandı', variant: 'default' as const, icon: CheckCircle },
      rejected: { label: 'Reddedildi', variant: 'destructive' as const, icon: AlertTriangle },
      processing: { label: 'İşleniyor', variant: 'secondary' as const, icon: Clock }
    };
    
    const statusConfig = config[status as keyof typeof config] || config.pending;
    const IconComponent = statusConfig.icon;
    
    return (
      <Badge variant={statusConfig.variant} className="flex items-center gap-1">
        <IconComponent className="w-3 h-3" />
        {statusConfig.label}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-[#0F0F0F] text-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation('/profile')}
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Geri Dön
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-white">Para Yatırma</h1>
            <p className="text-gray-400">Güvenli ve hızlı para yatırma işlemleri</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ana Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Kullanıcı Bilgileri */}
            {userInfo && (
              <Card className="bg-[#1A1A1A] border-[#333]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Shield className="w-5 h-5 text-green-500" />
                    Hesap Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-400">Kullanıcı Adı</Label>
                      <div className="text-white font-medium">{userInfo.username}</div>
                    </div>
                    <div>
                      <Label className="text-gray-400">Mevcut Bakiye</Label>
                      <div className="text-green-400 font-bold text-lg">
                        {userInfo.balance?.toFixed(2) || '0.00'} ₺
                      </div>
                    </div>
                  </div>
                  {userInfo.vipLevel > 0 && (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Star className="w-4 h-4" />
                      VIP Level {userInfo.vipLevel}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Ödeme Yöntemi Seçimi */}
            <Card className="bg-[#1A1A1A] border-[#333]">
              <CardHeader>
                <CardTitle className="text-white">Ödeme Yöntemi Seçin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {PAYMENT_METHODS.filter(method => method.isActive).map((method) => {
                    const IconComponent = method.icon;
                    return (
                      <div
                        key={method.id}
                        className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                          selectedMethod?.id === method.id
                            ? 'border-yellow-500 bg-yellow-500/10'
                            : 'border-[#333] hover:border-yellow-500/50'
                        }`}
                        onClick={() => setSelectedMethod(method)}
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <IconComponent className="w-6 h-6 text-yellow-500" />
                          <div>
                            <h3 className="font-bold text-white">{method.name}</h3>
                            <p className="text-sm text-gray-400">{method.processingTime}</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{method.description}</p>
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-400">
                            Min: {method.minAmount} ₺
                          </span>
                          <span className="text-gray-400">
                            Komisyon: {method.fees}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Miktar ve Detaylar */}
            {selectedMethod && (
              <Card className="bg-[#1A1A1A] border-[#333]">
                <CardHeader>
                  <CardTitle className="text-white">İşlem Detayları</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Para Yatırma Miktarı (₺)</Label>
                    <Input
                      type="number"
                      placeholder={`${selectedMethod.minAmount} - ${selectedMethod.maxAmount} ₺`}
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-[#2A2A2A] border-[#333] text-white"
                    />
                    <div className="text-sm text-gray-400 mt-1">
                      Minimum: {selectedMethod.minAmount} ₺ - Maksimum: {selectedMethod.maxAmount} ₺
                    </div>
                  </div>

                  <div>
                    <Label className="text-gray-300">Hesap Detayları</Label>
                    <Textarea
                      placeholder="Ödeme yapacağınız hesap bilgilerini girin (IBAN, hesap numarası vb.)"
                      value={accountDetails}
                      onChange={(e) => setAccountDetails(e.target.value)}
                      className="bg-[#2A2A2A] border-[#333] text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Açıklama (Opsiyonel)</Label>
                    <Input
                      placeholder="İşlem açıklaması"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="bg-[#2A2A2A] border-[#333] text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Dekont/Makbuz (Opsiyonel)</Label>
                    <div className="mt-2">
                      <input
                        type="file"
                        accept="image/*,.pdf"
                        onChange={(e) => setReceipt(e.target.files?.[0] || null)}
                        className="hidden"
                        id="receipt-upload"
                      />
                      <label
                        htmlFor="receipt-upload"
                        className="flex items-center gap-2 p-3 border-2 border-dashed border-[#333] rounded-lg cursor-pointer hover:border-yellow-500/50 transition-colors"
                      >
                        <Upload className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-300">
                          {receipt ? receipt.name : 'Dosya seçin'}
                        </span>
                      </label>
                    </div>
                  </div>

                  <Button
                    onClick={handleDeposit}
                    disabled={depositMutation.isPending || !amount || !selectedMethod}
                    className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold"
                  >
                    {depositMutation.isPending ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        İşleniyor...
                      </>
                    ) : (
                      <>
                        <DollarSign className="w-4 h-4 mr-2" />
                        Para Yatır
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Yan Panel */}
          <div className="space-y-6">
            {/* Son İşlemler */}
            <Card className="bg-[#1A1A1A] border-[#333]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5" />
                  Son İşlemler
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentTransactions?.length > 0 ? (
                  <div className="space-y-3">
                    {recentTransactions.map((transaction: Transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                        <div>
                          <div className="font-medium text-white">
                            {transaction.amount} ₺
                          </div>
                          <div className="text-sm text-gray-400">
                            {transaction.paymentMethod}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(transaction.createdAt).toLocaleDateString('tr-TR')}
                          </div>
                        </div>
                        {getStatusBadge(transaction.status)}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-400">
                    <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Henüz işlem bulunmuyor</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Güvenlik Bilgileri */}
            <Card className="bg-[#1A1A1A] border-[#333]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Shield className="w-5 h-5 text-green-500" />
                  Güvenlik
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  256-bit SSL Şifreleme
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  PCI DSS Uyumlu
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  7/24 İşlem Takibi
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Başarı Dialogu */}
        <Dialog open={successDialogOpen} onOpenChange={setSuccessDialogOpen}>
          <DialogContent className="bg-[#1A1A1A] border-[#333]">
            <DialogHeader>
              <DialogTitle className="text-white text-center">
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                Para Yatırma Talebi Alındı
              </DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4">
              <p className="text-gray-300">
                Para yatırma talebiniz başarıyla oluşturuldu.
              </p>
              <div className="bg-[#2A2A2A] p-4 rounded-lg">
                <p className="text-sm text-gray-400">İşlem Numarası</p>
                <p className="font-mono text-yellow-400">{lastTransactionId}</p>
              </div>
              <p className="text-sm text-gray-400">
                İşleminiz incelemeye alındı. Onaylandıktan sonra bakiyenize eklenecektir.
              </p>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setSuccessDialogOpen(false)}
                  className="flex-1"
                >
                  Tamam
                </Button>
                <Button 
                  onClick={() => setLocation('/profile')}
                  className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-black"
                >
                  Profile Git
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}