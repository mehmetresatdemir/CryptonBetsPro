import { useState, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { DollarSign, CreditCard, Building, Smartphone, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WithdrawalMethod {
  id: string;
  name: string;
  icon: any;
  description: string;
  minAmount: number;
  maxAmount: number;
  processingTime: string;
  fee: string;
}

const withdrawalMethods: WithdrawalMethod[] = [
  {
    id: 'bank_transfer',
    name: 'Banka Havalesi',
    icon: Building,
    description: 'Türkiye\'deki herhangi bir bankaya havale',
    minAmount: 100,
    maxAmount: 50000,
    processingTime: '1-3 iş günü',
    fee: 'Ücretsiz'
  },
  {
    id: 'crypto',
    name: 'Kripto Para',
    icon: DollarSign,
    description: 'Bitcoin, Ethereum, USDT',
    minAmount: 50,
    maxAmount: 100000,
    processingTime: '10-30 dakika',
    fee: 'Network ücreti'
  },
  {
    id: 'ewallet',
    name: 'E-Cüzdan',
    icon: Smartphone,
    description: 'Papara, İninal, Jeton',
    minAmount: 20,
    maxAmount: 10000,
    processingTime: 'Anında',
    fee: '%1'
  }
];

export default function WithdrawalWorking() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedMethod, setSelectedMethod] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [bankDetails, setBankDetails] = useState({
    iban: '',
    accountName: '',
    bankName: ''
  });
  const [walletAddress, setWalletAddress] = useState('');
  const [ewalletDetails, setEwalletDetails] = useState({
    accountNumber: '',
    accountName: ''
  });

  // Kullanıcı bilgileri
  const { data: user } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: () => apiRequest('GET', '/api/auth/me')
  });

  // Para çekme işlemleri listesi
  const { data: withdrawals } = useQuery({
    queryKey: ['/api/professional-withdrawals/list'],
    queryFn: () => apiRequest('GET', '/api/professional-withdrawals/list')
  });

  // Para çekme işlemi
  const withdrawalMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('POST', '/api/professional-withdrawals/create', data);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/professional-withdrawals/list'] });
      
      let message = '';
      if (data.status === 'rejected') {
        message = 'Para çekme talebiniz risk analizi nedeniyle reddedildi.';
      } else if (data.status === 'risk_review') {
        message = 'Para çekme talebiniz risk ekibi tarafından incelenecek.';
      } else {
        message = 'Para çekme talebiniz oluşturuldu ve risk kontrolünden geçmiştir.';
      }

      toast({
        title: "Para Çekme Talebi Oluşturuldu",
        description: message,
      });

      // Formu temizle
      setAmount('');
      setBankDetails({ iban: '', accountName: '', bankName: '' });
      setWalletAddress('');
      setEwalletDetails({ accountNumber: '', accountName: '' });
      setSelectedMethod('');
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Para çekme işlemi başlatılamadı",
        variant: "destructive",
      });
    }
  });

  const handleWithdrawal = () => {
    if (!selectedMethod || !amount) {
      toast({
        title: "Eksik Bilgi",
        description: "Lütfen tüm gerekli alanları doldurun",
        variant: "destructive",
      });
      return;
    }

    const withdrawalData: any = {
      amount: Number(amount),
      withdrawalMethod: selectedMethod
    };

    if (selectedMethod === 'bank_transfer') {
      withdrawalData.bankDetails = bankDetails;
    } else if (selectedMethod === 'crypto') {
      withdrawalData.walletAddress = walletAddress;
    } else if (selectedMethod === 'ewallet') {
      withdrawalData.ewalletDetails = ewalletDetails;
    }

    withdrawalMutation.mutate(withdrawalData);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Beklemede</Badge>;
      case 'risk_review':
        return <Badge variant="outline"><AlertTriangle className="w-3 h-3 mr-1" />Risk İncelemesi</Badge>;
      case 'risk_approved':
        return <Badge variant="default"><CheckCircle className="w-3 h-3 mr-1" />Risk Onaylandı</Badge>;
      case 'completed':
        return <Badge variant="default" className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Tamamlandı</Badge>;
      case 'rejected':
        return <Badge variant="destructive"><AlertTriangle className="w-3 h-3 mr-1" />Reddedildi</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const selectedMethodData = withdrawalMethods.find(m => m.id === selectedMethod);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Para Çekme</h1>
        <p className="text-muted-foreground">
          Güvenli ve hızlı para çekme işlemi
        </p>
      </div>

      {user && (
        <Card>
          <CardHeader>
            <CardTitle>Mevcut Bakiye</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Number(user.balance || 0).toFixed(2)} TL
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Para Çekme Talebi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Çekim Yöntemi</Label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Yöntem seçin" />
                </SelectTrigger>
                <SelectContent>
                  {withdrawalMethods.map((method) => (
                    <SelectItem key={method.id} value={method.id}>
                      <div className="flex items-center space-x-2">
                        <method.icon className="w-4 h-4" />
                        <span>{method.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedMethodData && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <div className="text-sm space-y-1">
                    <p><strong>Min:</strong> {selectedMethodData.minAmount} TL - <strong>Max:</strong> {selectedMethodData.maxAmount} TL</p>
                    <p><strong>İşlem Süresi:</strong> {selectedMethodData.processingTime}</p>
                    <p><strong>Ücret:</strong> {selectedMethodData.fee}</p>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="amount">Miktar (TL)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Çekmek istediğiniz tutarı girin"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min={selectedMethodData?.minAmount || 0}
                max={selectedMethodData?.maxAmount || 100000}
              />
            </div>

            {/* Banka Havalesi Detayları */}
            {selectedMethod === 'bank_transfer' && (
              <div className="space-y-3">
                <Separator />
                <h4 className="font-medium">Banka Bilgileri</h4>
                <div className="space-y-2">
                  <Label htmlFor="iban">IBAN</Label>
                  <Input
                    id="iban"
                    placeholder="TR00 0000 0000 0000 0000 0000 00"
                    value={bankDetails.iban}
                    onChange={(e) => setBankDetails(prev => ({ ...prev, iban: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountName">Hesap Sahibi</Label>
                  <Input
                    id="accountName"
                    placeholder="Ad Soyad"
                    value={bankDetails.accountName}
                    onChange={(e) => setBankDetails(prev => ({ ...prev, accountName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Banka Adı</Label>
                  <Input
                    id="bankName"
                    placeholder="Banka adı"
                    value={bankDetails.bankName}
                    onChange={(e) => setBankDetails(prev => ({ ...prev, bankName: e.target.value }))}
                  />
                </div>
              </div>
            )}

            {/* Kripto Para Detayları */}
            {selectedMethod === 'crypto' && (
              <div className="space-y-3">
                <Separator />
                <h4 className="font-medium">Kripto Cüzdan Adresi</h4>
                <div className="space-y-2">
                  <Label htmlFor="walletAddress">Cüzdan Adresi</Label>
                  <Textarea
                    id="walletAddress"
                    placeholder="Kripto para cüzdan adresinizi girin"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* E-Cüzdan Detayları */}
            {selectedMethod === 'ewallet' && (
              <div className="space-y-3">
                <Separator />
                <h4 className="font-medium">E-Cüzdan Bilgileri</h4>
                <div className="space-y-2">
                  <Label htmlFor="ewalletAccount">Hesap Numarası/Telefon</Label>
                  <Input
                    id="ewalletAccount"
                    placeholder="E-cüzdan hesap numarası"
                    value={ewalletDetails.accountNumber}
                    onChange={(e) => setEwalletDetails(prev => ({ ...prev, accountNumber: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ewalletName">Hesap Sahibi</Label>
                  <Input
                    id="ewalletName"
                    placeholder="Ad Soyad"
                    value={ewalletDetails.accountName}
                    onChange={(e) => setEwalletDetails(prev => ({ ...prev, accountName: e.target.value }))}
                  />
                </div>
              </div>
            )}

            <Button 
              onClick={handleWithdrawal}
              disabled={withdrawalMutation.isPending || !selectedMethod || !amount}
              className="w-full"
            >
              {withdrawalMutation.isPending ? "İşleniyor..." : "Para Çekme Talebi Oluştur"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Para Çekme İşlemleri</CardTitle>
          </CardHeader>
          <CardContent>
            {withdrawals?.withdrawals?.length > 0 ? (
              <div className="space-y-3">
                {withdrawals.withdrawals.slice(0, 5).map((withdrawal: any, index: number) => (
                  <div key={index} className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">{withdrawal.amount} TL</div>
                      <div className="text-sm text-muted-foreground">
                        {withdrawal.withdrawalMethod} - {new Date(withdrawal.createdAt).toLocaleDateString('tr-TR')}
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(withdrawal.status)}
                      {withdrawal.riskScore && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Risk: {withdrawal.riskScore}/100
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                Henüz para çekme işleminiz bulunmamaktadır.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Önemli Bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Risk Analizi:</strong> Tüm para çekme talepleri güvenlik amacıyla risk analizi sürecinden geçer.
            </AlertDescription>
          </Alert>
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>Onay Süreci:</strong> Risk onayından geçen işlemler finans ekibi tarafından işleme alınır.
            </AlertDescription>
          </Alert>
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              <strong>İşlem Süreleri:</strong> Yöntemlere göre değişiklik gösterir. Acil durumlar için müşteri hizmetleri ile iletişime geçin.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}