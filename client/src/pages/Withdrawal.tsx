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
import { 
  ArrowLeft, Building, Wallet, CreditCard, DollarSign, 
  CheckCircle, Clock, AlertTriangle, Shield, FileText,
  Star, TrendingDown, Banknote, Calculator, Eye
} from 'lucide-react';

// Import payment method logos
import paybolLogo from '@assets/paybol_1750335572656.webp';
import parolaparaLogo from '@assets/parolapara_1750335572659.webp';
import popyparaLogo from '@assets/popypara_1750335572660.webp';
import paparaLogo from '@assets/papara_1750335572661.webp';
import papelLogo from '@assets/papel_1750335572662.webp';
import pepLogo from '@assets/pep_1750335572663.webp';
import paratimLogo from '@assets/paratim_1750335572664.webp';
import paycoLogo from '@assets/payco_1750335572666.webp';
import { useLocation } from 'wouter';

interface WithdrawalMethod {
  id: string;
  name: string;
  type: 'bank' | 'ewallet' | 'crypto';
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

const WITHDRAWAL_METHODS: WithdrawalMethod[] = [
  {
    id: 'bank_transfer',
    name: 'Banka Havalesi',
    type: 'bank',
    icon: Building,
    minAmount: 100,
    maxAmount: 50000,
    processingTime: '1-3 iş günü',
    fees: 'Ücretsiz',
    description: 'Banka hesabınıza güvenli transfer',
    isActive: true
  },
  {
    id: 'papara',
    name: 'Papara',
    type: 'ewallet',
    icon: Wallet,
    minAmount: 50,
    maxAmount: 25000,
    processingTime: '30 dakika - 2 saat',
    fees: 'Ücretsiz',
    description: 'Papara hesabınıza hızlı transfer',
    isActive: true
  },
  {
    id: 'crypto',
    name: 'Kripto Para',
    type: 'crypto',
    icon: CreditCard,
    minAmount: 200,
    maxAmount: 100000,
    processingTime: '30 dakika - 1 saat',
    fees: '%2',
    description: 'Bitcoin, USDT ve diğer kripto paralar',
    isActive: true
  }
];

export default function Withdrawal() {
  const [selectedMethod, setSelectedMethod] = useState<WithdrawalMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [accountInfo, setAccountInfo] = useState('');
  const [description, setDescription] = useState('');
  const [showCalculator, setShowCalculator] = useState(false);
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

  // Para çekme işlemlerini getir
  const { data: recentWithdrawals } = useQuery({
    queryKey: ['/api/user/transactions', 'withdrawal'],
    queryFn: async () => {
      const response = await fetch('/api/user/transactions?type=withdrawal&limit=5', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('İşlemler alınamadı');
      return response.json();
    }
  });

  // KYC durumunu kontrol et
  const { data: kycStatus } = useQuery({
    queryKey: ['/api/auth/kyc'],
    queryFn: async () => {
      const response = await fetch('/api/auth/kyc', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('KYC durumu alınamadı');
      return response.json();
    }
  });

  // Para çekme işlemi
  const withdrawalMutation = useMutation({
    mutationFn: async (withdrawalData: {
      amount: number;
      method: string;
      methodDetails: string;
      accountInfo: string;
      description: string;
    }) => {
      const response = await fetch('/api/user/withdrawal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(withdrawalData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Para çekme işlemi başarısız');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setLastTransactionId(data.transactionId);
      setSuccessDialogOpen(true);
      setAmount('');
      setDescription('');
      setAccountInfo('');
      setSelectedMethod(null);
      queryClient.invalidateQueries({ queryKey: ['/api/user/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
      toast({
        title: 'Başarılı',
        description: 'Para çekme talebiniz alındı'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Para çekme işlemi başarısız',
        variant: 'destructive'
      });
    }
  });

  const handleWithdrawal = async () => {
    // KYC kontrolü
    if (!kycStatus || kycStatus.status !== 'approved') {
      toast({
        title: 'KYC Doğrulaması Gerekli',
        description: 'Para çekme işlemi için kimlik doğrulamanızı tamamlamanız gerekiyor',
        variant: 'destructive'
      });
      return;
    }

    if (!selectedMethod || !amount || !accountInfo) {
      toast({
        title: 'Eksik Bilgi',
        description: 'Lütfen tüm alanları doldurun',
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

    if (userInfo && amountNum > userInfo.balance) {
      toast({
        title: 'Yetersiz Bakiye',
        description: 'Çekmek istediğiniz miktar bakiyenizden fazla',
        variant: 'destructive'
      });
      return;
    }

    const withdrawalData = {
      amount: amountNum,
      method: selectedMethod.name,
      methodDetails: JSON.stringify({
        methodId: selectedMethod.id,
        methodType: selectedMethod.type
      }),
      accountInfo,
      description
    };

    withdrawalMutation.mutate(withdrawalData);
  };

  const calculateFee = (amount: number, method: WithdrawalMethod) => {
    if (method.fees === 'Ücretsiz') return 0;
    const feePercent = parseFloat(method.fees.replace('%', ''));
    return (amount * feePercent) / 100;
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

  const amountNum = parseFloat(amount) || 0;
  const fee = selectedMethod ? calculateFee(amountNum, selectedMethod) : 0;
  const netAmount = amountNum - fee;

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
            <h1 className="text-3xl font-bold text-white">Para Çekme</h1>
            <p className="text-gray-400">Kazançlarınızı güvenle çekin</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Ana Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Kullanıcı Bilgileri ve KYC Durumu */}
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
                      <Label className="text-gray-400">Çekilebilir Bakiye</Label>
                      <div className="text-green-400 font-bold text-lg">
                        {userInfo.balance?.toFixed(2) || '0.00'} ₺
                      </div>
                    </div>
                  </div>
                  
                  {/* KYC Durumu */}
                  <div className="flex items-center justify-between p-3 bg-[#2A2A2A] rounded-lg">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      <span className="text-sm">Kimlik Doğrulama</span>
                    </div>
                    {kycStatus?.status === 'approved' ? (
                      <Badge variant="default" className="bg-green-500">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Onaylandı
                      </Badge>
                    ) : (
                      <Badge variant="destructive">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Gerekli
                      </Badge>
                    )}
                  </div>

                  {userInfo.vipLevel > 0 && (
                    <div className="flex items-center gap-2 text-yellow-400">
                      <Star className="w-4 h-4" />
                      VIP Level {userInfo.vipLevel} - Özel limitler geçerli
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Para Çekme Yöntemleri */}
            <Card className="bg-[#1A1A1A] border-[#333]">
              <CardHeader>
                <CardTitle className="text-white">Para Çekme Yöntemi Seçin</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-4">
                  {WITHDRAWAL_METHODS.filter(method => method.isActive).map((method) => {
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
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <method.icon className="w-6 h-6 text-yellow-500" />
                            <div>
                              <h3 className="font-bold text-white">{method.name}</h3>
                              <p className="text-sm text-gray-400">{method.processingTime}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-gray-400">Komisyon</div>
                            <div className="font-medium text-white">{method.fees}</div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-300 mt-2">{method.description}</p>
                        <div className="flex justify-between text-xs mt-2">
                          <span className="text-gray-400">
                            Min: {method.minAmount} ₺
                          </span>
                          <span className="text-gray-400">
                            Max: {method.maxAmount} ₺
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* İşlem Detayları */}
            {selectedMethod && (
              <Card className="bg-[#1A1A1A] border-[#333]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between text-white">
                    İşlem Detayları
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCalculator(!showCalculator)}
                      className="text-yellow-500"
                    >
                      <Calculator className="w-4 h-4 mr-2" />
                      Hesapla
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Para Çekme Miktarı (₺)</Label>
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

                  {showCalculator && amountNum > 0 && (
                    <div className="bg-[#2A2A2A] p-4 rounded-lg space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Çekilecek Miktar:</span>
                        <span className="text-white">{amountNum.toFixed(2)} ₺</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">İşlem Ücreti:</span>
                        <span className="text-red-400">{fee.toFixed(2)} ₺</span>
                      </div>
                      <div className="border-t border-[#333] pt-2">
                        <div className="flex justify-between font-medium">
                          <span className="text-gray-300">Net Alacağınız:</span>
                          <span className="text-green-400">{netAmount.toFixed(2)} ₺</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div>
                    <Label className="text-gray-300">Hesap Bilgileri</Label>
                    <Textarea
                      placeholder={
                        selectedMethod.type === 'bank' 
                          ? "IBAN: TR00 0000 0000 0000 0000 0000 00\nHesap Sahibi: Ad Soyad" 
                          : selectedMethod.type === 'ewallet'
                          ? "Papara Hesap Numarası: 1234567890"
                          : "Kripto Cüzdan Adresi: 1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                      }
                      value={accountInfo}
                      onChange={(e) => setAccountInfo(e.target.value)}
                      className="bg-[#2A2A2A] border-[#333] text-white"
                      rows={3}
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

                  <Button
                    onClick={handleWithdrawal}
                    disabled={
                      withdrawalMutation.isPending || 
                      !amount || 
                      !selectedMethod || 
                      !accountInfo ||
                      kycStatus?.status !== 'approved'
                    }
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold"
                  >
                    {withdrawalMutation.isPending ? (
                      <>
                        <Clock className="w-4 h-4 mr-2 animate-spin" />
                        İşleniyor...
                      </>
                    ) : (
                      <>
                        <TrendingDown className="w-4 h-4 mr-2" />
                        Para Çek
                      </>
                    )}
                  </Button>

                  {kycStatus?.status !== 'approved' && (
                    <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-red-400 mb-2">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">KYC Doğrulaması Gerekli</span>
                      </div>
                      <p className="text-sm text-gray-300 mb-3">
                        Para çekme işlemi için kimlik doğrulamanızı tamamlamanız gerekiyor.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLocation('/profile')}
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        KYC Doğrulaması Yap
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Yan Panel */}
          <div className="space-y-6">
            {/* Son Para Çekme İşlemleri */}
            <Card className="bg-[#1A1A1A] border-[#333]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5" />
                  Son Para Çekme İşlemleri
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentWithdrawals?.length > 0 ? (
                  <div className="space-y-3">
                    {recentWithdrawals.map((transaction: Transaction) => (
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
                    <TrendingDown className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Henüz para çekme işlemi bulunmuyor</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Para Çekme Kuralları */}
            <Card className="bg-[#1A1A1A] border-[#333]">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5 text-blue-500" />
                  Para Çekme Kuralları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>KYC doğrulaması tamamlanmış olmalıdır</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Minimum para çekme miktarı 50 ₺'dir</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Günlük maksimum para çekme limiti 25.000 ₺'dir</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Para çekme işlemleri 7/24 yapılabilir</span>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span>Bonus bakiyesi çekim için oynanmış olmalıdır</span>
                </div>
              </CardContent>
            </Card>

            {/* Güvenlik */}
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
                  SSL Güvenlik Sertifikası
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  İki Faktörlü Doğrulama
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Anti-Fraud Sistemleri
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
                Para Çekme Talebi Alındı
              </DialogTitle>
            </DialogHeader>
            <div className="text-center space-y-4">
              <p className="text-gray-300">
                Para çekme talebiniz başarıyla oluşturuldu.
              </p>
              <div className="bg-[#2A2A2A] p-4 rounded-lg">
                <p className="text-sm text-gray-400">İşlem Numarası</p>
                <p className="font-mono text-yellow-400">{lastTransactionId}</p>
              </div>
              <p className="text-sm text-gray-400">
                İşleminiz incelemeye alındı. Onaylandıktan sonra hesabınıza transfer edilecektir.
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