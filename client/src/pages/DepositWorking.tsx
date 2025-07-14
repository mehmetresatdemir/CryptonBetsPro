import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  CreditCard, Wallet, Building, DollarSign, ArrowLeft, 
  CheckCircle, Clock, AlertTriangle, Upload, FileText,
  Shield, Zap, TrendingUp, Star
} from 'lucide-react';

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

const paymentMethods: PaymentMethod[] = [
  {
    id: 'bank_transfer',
    name: 'Banka Havalesi',
    type: 'bank',
    icon: Building,
    minAmount: 100,
    maxAmount: 50000,
    processingTime: '1-3 saat',
    fees: 'Komisyonsuz',
    description: 'Güvenli banka transferi ile para yatırın',
    isActive: true,
  },
  {
    id: 'credit_card',
    name: 'Kredi/Banka Kartı',
    type: 'bank',
    icon: CreditCard,
    minAmount: 50,
    maxAmount: 10000,
    processingTime: 'Anında',
    fees: '%2.5',
    description: 'Visa, Mastercard ile hızlı ödeme',
    isActive: true,
  },
  {
    id: 'papara',
    name: 'Papara',
    type: 'ewallet',
    icon: Wallet,
    minAmount: 25,
    maxAmount: 25000,
    processingTime: 'Anında',
    fees: 'Komisyonsuz',
    description: 'Papara ile hızlı para transferi',
    isActive: true,
  },
  {
    id: 'crypto_usdt',
    name: 'USDT (TRC20)',
    type: 'crypto',
    icon: DollarSign,
    minAmount: 20,
    maxAmount: 100000,
    processingTime: '5-15 dakika',
    fees: 'Ağ ücreti',
    description: 'USDT ile güvenli kripto transferi',
    isActive: true,
  },
];

export default function DepositWorking() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Son işlemler listesi
  const { data: recentTransactions } = useQuery({
    queryKey: ['/api/transactions/recent'],
    queryFn: () => apiRequest('GET', '/api/transactions/recent')
  });

  // Para yatırma işlemi
  const depositMutation = useMutation({
    mutationFn: async (data: { amount: number; paymentMethodId: string; description?: string }) => {
      return apiRequest('POST', '/api/professional-deposits/create', {
        amount: data.amount,
        paymentMethod: data.paymentMethodId,
        paymentDetails: { description: data.description }
      });
    },
    onSuccess: (data) => {
      setPaymentDetails(data);
      setShowPaymentModal(true);
      queryClient.invalidateQueries({ queryKey: ['/api/transactions/recent'] });
      toast({
        title: "Para Yatırma Başlatıldı",
        description: "Ödeme talimatları gösteriliyor",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Para yatırma işlemi başlatılamadı",
        variant: "destructive",
      });
    }
  });

  // Dosya yükleme
  const uploadMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return apiRequest('POST', '/api/deposits/upload-receipt', formData);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Ödeme makbuzu yüklendi",
      });
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Dosya yüklenemedi",
        variant: "destructive",
      });
    }
  });

  const handleDeposit = () => {
    if (!selectedMethod || !amount) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen ödeme yöntemi ve tutarı seçin",
        variant: "destructive",
      });
      return;
    }

    const amountNum = parseFloat(amount);
    if (amountNum < selectedMethod.minAmount || amountNum > selectedMethod.maxAmount) {
      toast({
        title: "Geçersiz Tutar",
        description: `Tutar ${selectedMethod.minAmount} - ${selectedMethod.maxAmount} TL arasında olmalı`,
        variant: "destructive",
      });
      return;
    }

    depositMutation.mutate({
      amount: amountNum,
      paymentMethodId: selectedMethod.id,
      description
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const formData = new FormData();
      formData.append('receipt', file);
      formData.append('transactionId', paymentDetails?.transactionId || '');
      
      setUploadedFile(file);
      uploadMutation.mutate(formData);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Tamamlandı</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Beklemede</Badge>;
      case 'failed':
        return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Başarısız</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Para Yatırma</h1>
        <p className="text-gray-600">Hesabınıza güvenli şekilde para yatırın</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ana Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Ödeme Yöntemleri */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Ödeme Yöntemi Seçin
              </CardTitle>
              <CardDescription>
                Size uygun ödeme yöntemini seçin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {paymentMethods.map((method) => {
                  const IconComponent = method.icon as React.ComponentType<{ className?: string }>;
                  return (
                    <div
                      key={method.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedMethod?.id === method.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedMethod(method)}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <IconComponent className="w-6 h-6 text-blue-600" />
                          <div>
                            <h3 className="font-semibold">{method.name}</h3>
                            <p className="text-sm text-gray-600">{method.description}</p>
                          </div>
                        </div>
                        {selectedMethod?.id === method.id && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Min/Max:</span>
                          <span>{method.minAmount} - {method.maxAmount} TL</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">İşlem Süresi:</span>
                          <span>{method.processingTime}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Komisyon:</span>
                          <span>{method.fees}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Tutar ve Detaylar */}
          {selectedMethod && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Para Yatırma Detayları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Yatırılacak Tutar (TL)
                  </label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`${selectedMethod.minAmount} - ${selectedMethod.maxAmount} TL`}
                    min={selectedMethod.minAmount}
                    max={selectedMethod.maxAmount}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Minimum: {selectedMethod.minAmount} TL - Maksimum: {selectedMethod.maxAmount} TL
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Açıklama (İsteğe bağlı)
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="İşlem açıklaması..."
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleDeposit}
                  disabled={!amount || depositMutation.isPending}
                  className="w-full"
                  size="lg"
                >
                  {depositMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      İşleniyor...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5" />
                      Para Yatır ({amount} TL)
                    </div>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Yan Panel */}
        <div className="space-y-6">
          {/* Hızlı Bilgiler */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Hızlı Bilgiler
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">Güvenli İşlem</p>
                  <p className="text-sm text-green-600">SSL ile korumalı</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                <Zap className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-800">Hızlı Onay</p>
                  <p className="text-sm text-blue-600">Otomatik işlem</p>
                </div>
              </div>
              <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                <Star className="w-5 h-5 text-purple-600" />
                <div>
                  <p className="font-medium text-purple-800">7/24 Destek</p>
                  <p className="text-sm text-purple-600">Canlı yardım</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Son İşlemler */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Son İşlemler
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {(recentTransactions as unknown as Transaction[])?.slice(0, 5).map((transaction: Transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{transaction.amount} TL</p>
                      <p className="text-sm text-gray-600">{transaction.paymentMethod}</p>
                    </div>
                    {getStatusBadge(transaction.status)}
                  </div>
                ))}
                {(!recentTransactions || (recentTransactions as unknown as Transaction[]).length === 0) && (
                  <p className="text-gray-500 text-center py-4">Henüz işlem yok</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Ödeme Talimatları Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ödeme Talimatları</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {paymentDetails && (
              <>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-800 mb-2">İşlem Bilgileri</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>İşlem ID:</span>
                      <span className="font-mono">{paymentDetails.transactionId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tutar:</span>
                      <span className="font-semibold">{amount} TL</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Yöntem:</span>
                      <span>{selectedMethod?.name}</span>
                    </div>
                  </div>
                </div>

                {paymentDetails.bankAccount && (
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h3 className="font-semibold mb-2">Banka Bilgileri</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Banka:</span>
                        <span>{paymentDetails.bankAccount.bankName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IBAN:</span>
                        <span className="font-mono">{paymentDetails.bankAccount.iban}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Hesap Sahibi:</span>
                        <span>{paymentDetails.bankAccount.accountHolder}</span>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Ödeme Makbuzu Yükle
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="w-full"
                    />
                  </div>

                  {uploadMutation.isPending && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      Yükleniyor...
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setShowPaymentModal(false)} className="flex-1">
                    Kapat
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}