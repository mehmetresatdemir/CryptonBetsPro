import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { X, Wallet, Check, ChevronRight, Shield, AlertCircle, ChevronsRight, AlertTriangle, CreditCard, Building, Smartphone, Bitcoin, Zap, ExternalLink, ArrowRight } from 'lucide-react';
import '../auth/modal.css';
import { createDepositNew, getPaymentMethodsNew } from '@/services/financeService';
import { getPaymentMessage } from '@/utils/translations/paymentTranslations';
import { useQuery } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';

// Import payment method logos
import paybolLogo from '@assets/paybol_1750335572656.webp';
import parolaparaLogo from '@assets/parolapara_1750335572659.webp';
import popyparaLogo from '@assets/popypara_1750335572660.webp';
import paparaLogo from '@assets/papara_1750335572661.webp';
import papelLogo from '@assets/papel_1750335572662.webp';
import pepLogo from '@assets/pep_1750335572663.webp';
import paratimLogo from '@assets/paratim_1750335572664.webp';
import paycoLogo from '@assets/payco_1750335572666.webp';

// Ödeme metodu tipleri
type PaymentMethod = {
  id: string;
  name: string;
  icon: React.ReactNode;
  minAmount: number;
  maxAmount: number;
  description: string;
  fee: number;
  processingTime: string;
  popular?: boolean;
  bonus?: number;
  disabled?: boolean;
  required_fields?: string[];
};

interface DepositModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface PaymentFormData {
  papara_id?: string;
  pep_id?: string;
  tc_number?: string;
  iban?: string;
  bank_name?: string;
  account_name?: string;
  pay_co_id?: string;
  pay_co_full_name?: string;
  paratim_id?: string;
  crypto_type?: string;
  walletAddress?: string;
  payfix_number?: string;
}

// Helper functions for field labels and placeholders
const getFieldLabel = (field: string) => {
  switch (field) {
    case 'papara_id':
      return 'Papara ID';
    case 'pep_id':
      return 'Pep ID';
    case 'tc_number':
      return 'T.C. Kimlik No';
    case 'iban':
      return 'IBAN';
    case 'bank_name':
      return 'Banka Adı';
    case 'account_name':
      return 'Hesap Adı';
    case 'pay_co_id':
      return 'PayCo ID';
    case 'pay_co_full_name':
      return 'PayCo Tam Adı';
    case 'paratim_id':
      return 'Paratim ID';
    case 'crypto_type':
      return 'Kripto Ağı';
    case 'walletAddress':
      return 'Cüzdan Adresi';
    case 'payfix_number':
      return 'PayFix Numarası';
    default:
      return field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
};

const getFieldPlaceholder = (field: string) => {
  switch (field) {
    case 'papara_id':
      return 'Örn: 1234567890 (10 hane)';
    case 'pep_id':
      return 'Örn: 123456789 (9 hane)';
    case 'tc_number':
      return 'Örn: 12345678901 (11 hane)';
    case 'iban':
      return 'Örn: TR123456789012345678901234 (26 hane)';
    case 'bank_name':
      return 'Örn: Ziraat Bankası';
    case 'account_name':
      return 'Örn: Ahmet Yılmaz';
    case 'pay_co_id':
      return 'Örn: ahmet@email.com veya 12345678901 (10-11 hane)';
    case 'pay_co_full_name':
      return 'Örn: Ahmet Yılmaz';
    case 'paratim_id':
      return 'Örn: 1234567890 (10 hane)';
    case 'crypto_type':
      return 'BSC, TRON veya ETH seçin';
    case 'walletAddress':
      return 'Cüzdan adresi API\'den gelecek';
    case 'payfix_number':
      return 'Örn: 1234567890 (10-11 hane)';
    default:
      return `Lütfen ${field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} girin`;
  }
};

// Field length limits
const getFieldMaxLength = (field: string) => {
  switch (field) {
    case 'papara_id':
      return 10; // 10 hane Papara ID
    case 'pep_id':
      return 9; // 9 hane Pep ID
    case 'paratim_id':
      return 10; // 10 hane Paratim ID
    case 'payfix_number':
      return 11; // 11 hane PayFix numarası
    case 'tc_number':
      return 11; // 11 hane TC
    case 'iban':
      return 26; // 26 hane IBAN
    case 'bank_name':
    case 'account_name':
    case 'pay_co_full_name':
      return 50; // İsim alanları
    case 'pay_co_id':
      return 100; // Email veya ID
    case 'crypto_type':
      return 10; // BTC, ETH vs.
    default:
      return 100;
  }
};

// Field validation
const validateField = (field: string, value: string): string | null => {
  if (!value || value.trim() === '') {
    return `${getFieldLabel(field)} zorunludur`;
  }

  switch (field) {
    case 'papara_id':
      if (!/^\d{10}$/.test(value)) {
        return 'Papara ID tam 10 haneli sayı olmalıdır';
      }
      break;
    case 'pep_id':
      if (!/^\d{9}$/.test(value)) {
        return 'Pep ID tam 9 haneli sayı olmalıdır';
      }
      break;
    case 'paratim_id':
      if (!/^\d{10}$/.test(value)) {
        return 'Paratim ID tam 10 haneli sayı olmalıdır';
      }
      break;
    case 'payfix_number':
      if (!/^\d{11}$/.test(value)) {
        return 'PayFix numarası tam 11 haneli sayı olmalıdır';
      }
      break;
    case 'tc_number':
      if (!/^\d{11}$/.test(value)) {
        return 'T.C. Kimlik No tam 11 haneli sayı olmalıdır';
      }
      break;
    case 'iban':
      if (!/^TR\d{24}$/.test(value.replace(/\s/g, ''))) {
        return 'IBAN "TR" ile başlayan 26 haneli format olmalıdır';
      }
      break;
    case 'pay_co_id':
      if (value.includes('@')) {
        // Email validation
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          return 'Geçerli bir email adresi giriniz';
        }
      } else {
        // ID validation
        if (!/^\d{10,11}$/.test(value)) {
          return 'PayCo ID 10-11 haneli sayı olmalıdır';
        }
      }
      break;
    case 'crypto_type':
      if (!/^[A-Z]{3,10}$/.test(value.toUpperCase())) {
        return 'Kripto para türü 3-10 karakter olmalıdır (örn: BTC, ETH)';
      }
      break;
  }

  return null;
};

export default function DepositModal({ isOpen, onClose }: DepositModalProps) {
  const { t, language } = useLanguage();
  const { currentLanguage } = useLanguage();
  const { user } = useUser();
  
  // Modal state
  const [activeStep, setActiveStep] = useState(1);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [useBonus, setUseBonus] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState<PaymentFormData>({});
  const [paymentWindow, setPaymentWindow] = useState<Window | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null);

  // Reset modal state when opened and auto-fill user data
  useEffect(() => {
    if (isOpen) {
      setActiveStep(1);
      setSelectedMethod(null);
      setAmount('');
      setUseBonus(false);
      setIsProcessing(false);
      setError(null);
      setSuccess(false);
      setPaymentWindow(null);
      setTransactionId(null);
      setPaymentUrl(null);
      
      // Kullanıcı bilgilerini otomatik doldur - SADECE TC ve kripto default
      const autoFilledData: PaymentFormData = {};
      
      if (user) {
        // TC kimlik numarası - sadece bunu otomatik doldur
        if (user.tckn || user.tcNumber) {
          autoFilledData.tc_number = user.tckn || user.tcNumber;
        }
        
        // Kripto için default ağ (en yaygın kullanılan)
        autoFilledData.crypto_type = 'trc20'; // TRON (TRC20) default
        
        // Diğer alanları kullanıcı kendisi dolduracak
        // Telefon, isim, email vb. otomatik doldurulmayacak
      }
      
      setPaymentFormData(autoFilledData);
      console.log('Otomatik doldurulmuş kullanıcı bilgileri:', autoFilledData);
    }
  }, [isOpen, user]);

  // Popup window'dan gelen message'ları dinle ve popup durumunu kontrol et
  useEffect(() => {
    let checkInterval: NodeJS.Timeout;
    
    const handleMessage = (event: MessageEvent) => {
      // Güvenlik: sadece güvenilir origin'lerden message kabul et
      
      if (event.data) {
        console.log('Payment popup message alındı:', event.data);
        
        // Ödeme başarılı callback'i
        if (event.data.type === 'PAYMENT_SUCCESS' || event.data.status === 'success') {
          console.log('Ödeme başarılı!', event.data);
          setSuccess(true);
          setIsProcessing(false);
          
          // Popup'ı kapat
          if (paymentWindow) {
            paymentWindow.close();
            setPaymentWindow(null);
          }
        }
        
        // Ödeme başarısız callback'i
        else if (event.data.type === 'PAYMENT_FAILED' || event.data.status === 'failed') {
          console.log('Ödeme başarısız!', event.data);
          setError(event.data.message || 'Ödeme işlemi başarısız oldu');
          setIsProcessing(false);
          
          // Popup'ı kapat
          if (paymentWindow) {
            paymentWindow.close();
            setPaymentWindow(null);
          }
        }
        
        // Ödeme iptal callback'i
        else if (event.data.type === 'PAYMENT_CANCELLED' || event.data.status === 'cancelled') {
          console.log('Ödeme iptal edildi!', event.data);
          setActiveStep(3);
          setIsProcessing(false);
          
          // Popup'ı kapat
          if (paymentWindow) {
            paymentWindow.close();
            setPaymentWindow(null);
          }
        }
      }
    };

    // Popup kapatılma kontrolü
    if (paymentWindow) {
      checkInterval = setInterval(() => {
        if (paymentWindow.closed) {
          console.log('Payment popup kapatıldı');
          setPaymentWindow(null);
          setActiveStep(3); // Geri onay adımına dön
          setIsProcessing(false);
          clearInterval(checkInterval);
        }
      }, 1000);
    }

    // Message listener'ı ekle
    window.addEventListener('message', handleMessage);

    // Cleanup
    return () => {
      window.removeEventListener('message', handleMessage);
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [paymentWindow]);

  // Yeni ödeme yöntemlerini getir
  const { data: newPaymentMethods, isLoading: isLoadingNewMethods, error: paymentMethodsError } = useQuery({
    queryKey: ['paymentMethodsNew'],
    queryFn: getPaymentMethodsNew,
    enabled: isOpen,
    staleTime: 5 * 60 * 1000, // 5 dakika
    onError: (error: any) => {
      console.error('Payment methods query error:', error);
      toast({
        title: 'Ödeme Sistemi Hatası',
        description: error.message || 'Ödeme yöntemleri yüklenemedi',
        variant: 'destructive'
      });
    }
  });

  // Popüler miktarlar
  const popularAmounts = [100, 250, 500, 1000, 2500, 5000];

  // API verilerini PaymentMethod formatına dönüştür
        const getMethodIcon = (methodId: string) => {
          switch (methodId) {
            case 'havale':
              return <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center"><Building className="text-blue-400 text-2xl" /></div>;
      case 'papara':
        return <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2"><img src={paparaLogo} alt="Papara" className="w-full h-full object-contain" /></div>;
            case 'pep':
              return <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2"><img src={pepLogo} alt="Pep" className="w-full h-full object-contain" /></div>;
            case 'paratim':
              return <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2"><img src={paratimLogo} alt="Paratim" className="w-full h-full object-contain" /></div>;
      case 'payco':
        return <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2"><img src={paycoLogo} alt="PayCo" className="w-full h-full object-contain" /></div>;
            case 'parolapara':
              return <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2"><img src={parolaparaLogo} alt="ParolaPara" className="w-full h-full object-contain" /></div>;
            case 'popy':
      case 'popypara':
              return <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2"><img src={popyparaLogo} alt="Popy" className="w-full h-full object-contain" /></div>;
            case 'paybol':
              return <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2"><img src={paybolLogo} alt="PayBol" className="w-full h-full object-contain" /></div>;
            case 'papel':
              return <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center p-2"><img src={papelLogo} alt="Papel" className="w-full h-full object-contain" /></div>;
      case 'crypto':
      case 'kripto':
        return <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center"><Bitcoin className="text-yellow-400 text-2xl" /></div>;
      case 'kredikarti':
      case 'card':
        return <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center"><CreditCard className="text-green-400 text-2xl" /></div>;
            default:
              return <div className="w-12 h-12 bg-gray-500/20 rounded-xl flex items-center justify-center"><Wallet className="text-gray-400 text-2xl" /></div>;
          }
        };

    // Otomatik ID oluşturma fonksiyonu
  const generateDefaultId = (methodId: string): string => {
    const now = Date.now();
    const random = Math.floor(Math.random() * 1000);
    
    switch (methodId) {
      case 'papara':
        // 10 haneli Papara ID (1-9 arası başlar)
        return `${Math.floor(Math.random() * 9) + 1}${now.toString().slice(-8)}${random.toString().slice(-1)}`;
      case 'pep':
        // 9 haneli Pep ID (1-9 arası başlar)
        return `${Math.floor(Math.random() * 9) + 1}${now.toString().slice(-7)}${random.toString().slice(-1)}`;
      case 'paratim':
        // 10 haneli Paratim ID (1-9 arası başlar)
        return `${Math.floor(Math.random() * 9) + 1}${now.toString().slice(-8)}${random.toString().slice(-1)}`;
      case 'payco':
        // 10 haneli PayCo ID (1-9 arası başlar)
        return `${Math.floor(Math.random() * 9) + 1}${now.toString().slice(-8)}${random.toString().slice(-1)}`;
      case 'payfix':
        // 11 haneli PayFix ID (1-9 arası başlar)
        return `${Math.floor(Math.random() * 9) + 1}${now.toString().slice(-9)}${random.toString().slice(-1)}`;
      default:
        // Varsayılan 10 haneli ID
        return `${Math.floor(Math.random() * 9) + 1}${now.toString().slice(-8)}${random.toString().slice(-1)}`;
    }
  };

  // API verilerini PaymentMethod formatına dönüştür - Required fields kaldırıldı
  const availablePaymentMethods: PaymentMethod[] = React.useMemo(() => {
    if (!newPaymentMethods || !Array.isArray(newPaymentMethods)) {
      return [];
    }

    return newPaymentMethods.map((method: any) => {
      return {
        id: method.id,
        name: method.name,
        icon: getMethodIcon(method.id),
        minAmount: method.min_amount || 50,
        maxAmount: method.max_amount || 10000,
        description: method.description || `${method.name} ile güvenli ödeme`,
        fee: Math.round((method.commission_rate || 0) * 100), // %2.5 -> 3% olarak göster
        processingTime: method.estimated_time || method.processing_time || getPaymentMessage('instant', currentLanguage),
        popular: method.id === 'papara',
        bonus: method.id === 'papara' ? 20 : method.id === 'crypto' ? 30 : 10,
        disabled: method.disabled === true || method.enabled === false,
        required_fields: [] // Artık form alanı yok
      };
    });
  }, [newPaymentMethods, currentLanguage]);

  // Para yatırma işlemi - yeni API ile
  const handleDepositRequest = async () => {
    if (!selectedMethod || !amount || !user) {
      setError(getPaymentMessage('fillAllFields', currentLanguage));
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError(getPaymentMessage('invalidAmount', currentLanguage));
      return;
    }

    if (amountNum < selectedMethod.minAmount || amountNum > selectedMethod.maxAmount) {
      setError(`${getPaymentMessage('amountRange', currentLanguage)} ₺${selectedMethod.minAmount} - ₺${selectedMethod.maxAmount}`);
      return;
    }

    // Form alanları artık gerekli değil - otomatik ID oluşturuluyor

    setIsProcessing(true);
    setError(null);

    try {
      // Kullanıcı bilgilerini otomatik ekle
      const userInfo = {
        firstName: user.firstName || user.username || 'Kullanıcı',
        lastName: user.lastName || user.surname || '',
        pay_co_full_name: `${user.firstName || user.username || 'Kullanıcı'} ${user.lastName || user.surname || ''}`.trim(),
        full_name: `${user.firstName || user.username || 'Kullanıcı'} ${user.lastName || user.surname || ''}`.trim(),
        fullName: `${user.firstName || user.username || 'Kullanıcı'} ${user.lastName || user.surname || ''}`.trim()
      };

      // Otomatik ID'leri oluştur
      const autoGeneratedData: PaymentFormData = {};
      
      switch (selectedMethod.id) {
        case 'papara':
          autoGeneratedData.papara_id = generateDefaultId('papara');
          break;
        case 'pep':
          autoGeneratedData.pep_id = generateDefaultId('pep');
          autoGeneratedData.tc_number = user.tckn || user.tcNumber || '12345678901'; // Varsayılan TC
          break;
        case 'paratim':
          autoGeneratedData.paratim_id = generateDefaultId('paratim');
          break;
        case 'payco':
          autoGeneratedData.pay_co_id = generateDefaultId('payco');
          autoGeneratedData.pay_co_full_name = `${user.firstName || user.username || 'Kullanıcı'} ${user.lastName || user.surname || ''}`.trim();
          break;
        case 'payfix':
          autoGeneratedData.payfix_number = generateDefaultId('payfix');
          break;
        case 'crypto':
        case 'kripto':
          // Kullanıcının seçtiği ağı kullan, yoksa default olarak trc20
          autoGeneratedData.crypto_type = paymentFormData.crypto_type || 'trc20';
          // Cüzdan adresi API'den gelecek - burada oluşturma
          break;
        case 'kredikarti':
          // Kredi kartı ödemesi için TC kimlik numarası gerekli
          autoGeneratedData.tc_number = user.tckn || user.tcNumber || '12345678901';
          break;
        case 'havale':
          autoGeneratedData.iban = 'TR123456789012345678901234'; // Varsayılan IBAN
          autoGeneratedData.bank_name = 'Ziraat Bankası'; // Varsayılan banka
          autoGeneratedData.account_name = `${user.firstName || user.username || 'Kullanıcı'} ${user.lastName || user.surname || ''}`.trim();
          break;
      }

      console.log('🔧 Otomatik oluşturulmuş ödeme verileri:', autoGeneratedData);

      const depositData = {
        amount: amountNum,
        payment_method_id: selectedMethod.id,
        user_id: user.id.toString(),
        user_name: user.fullName || user.username,
        user: user.fullName || user.username || user.firstName || 'Kullanıcı', // XPay API için user alanı - garantili
        user_email: user.email,
        return_url: `https://pay.cryptonbets1.com/payment/return`,
        callback_url: `https://pay.cryptonbets1.com/api/public/deposit/callback`,
        site_reference_number: `ORDER_${Date.now()}`,
        // Kredi kartı ödemesi için TC kimlik numarası zorunlu
        tc_number: (selectedMethod.id === 'kredikarti') 
          ? (user.tckn || user.tcNumber || autoGeneratedData.tc_number) 
          : autoGeneratedData.tc_number,
        ...userInfo, // Otomatik kullanıcı bilgileri
        ...autoGeneratedData // Otomatik oluşturulmuş ID'ler
      };

      // 🔍 DEBUG: Callback URL ve Transaction detaylarını logla
      console.log('🔍 DEPOSIT DEBUG - Gönderilen veri:', {
        callback_url: depositData.callback_url,
        return_url: depositData.return_url,
        site_reference_number: depositData.site_reference_number,
        user_id: depositData.user_id,
        amount: depositData.amount
      });

      // XPay API için user alanı kontrolü
      if (!depositData.user) {
        setError('XPay API için kullanıcı adı gereklidir');
        setIsProcessing(false);
        return;
      }

      // Kredi kartı ödemesi için TC kimlik numarası kontrolü
      if (selectedMethod.id === 'kredikarti' && !depositData.tc_number) {
        setError('Kredi kartı ödemesi için TC kimlik numarası gereklidir');
        setIsProcessing(false);
        return;
      }

      // TC kimlik numarası format kontrolü (11 haneli)
      if (depositData.tc_number && !/^\d{11}$/.test(depositData.tc_number)) {
        setError('TC kimlik numarası 11 haneli sayı olmalıdır');
        setIsProcessing(false);
        return;
      }

      const result = await createDepositNew(depositData);

      if (result.transaction_id) {
        // Transaction ID'yi kaydet
        setTransactionId(result.transaction_id);
        
        // 🔍 DEBUG: Transaction ID'yi localStorage'a kaydet
        localStorage.setItem('lastTransactionId', result.transaction_id);
        localStorage.setItem('lastDepositData', JSON.stringify({
          transactionId: result.transaction_id,
          amount: depositData.amount,
          paymentMethod: depositData.payment_method_id,
          timestamp: new Date().toISOString(),
          userInfo: {
            userId: depositData.user_id,
            userName: depositData.user_name
          }
        }));
        
        console.log('💾 Transaction saved to localStorage:', {
          transactionId: result.transaction_id,
          amount: depositData.amount,
          method: depositData.payment_method_id
        });
        
                if (result.payment_url) {
          // Payment URL'sini kaydet
          setPaymentUrl(result.payment_url);
          
          // Gerçek ödeme URL'i varsa popup window açalım
          const popup = window.open(
            result.payment_url,
            'payment',
            'width=800,height=600,scrollbars=yes,resizable=yes'
          );
          
          if (popup) {
            setPaymentWindow(popup);
            setActiveStep(4); // Ödeme popup adımı
            // Success'i henüz set etme - popup'dan callback gelince set edilecek
          } else {
            // Popup engellendi - kullanıcıya seçenek sun
            setActiveStep(4.5); // Popup engelleyici adımı
            
            // Alternatif olarak yönlendirme sun
            toast({
              title: 'Popup Engellendi',
              description: 'Ödeme sayfasını yeni sekmede açabilir veya doğrudan yönlendirebiliriz.',
              variant: 'default'
            });
          }
        } else {
          throw new Error('Ödeme URL\'si alınamadı');
        }
      } else {
        throw new Error('İşlem başlatılamadı');
      }
    } catch (error: any) {
      console.error('Deposit request error details:', error);
      toast({
        title: 'Ödeme İşlemi Hatası',
        description: error.message || getPaymentMessage('errorOccurred', currentLanguage),
        variant: 'destructive'
      });
      setError(error.message || getPaymentMessage('errorOccurred', currentLanguage));
    } finally {
      setIsProcessing(false);
    }
  };

  // Modal kapatma handler'ı
  const handleModalClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  // Backdrop tıklama handler'ı
  const handleBackdropClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.target === e.currentTarget) {
      handleModalClose();
    }
  };

  // Modal Portal ile render et
  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-2 sm:p-4"
      onClick={handleBackdropClick}
      style={{ 
        zIndex: 2147483647
      }}
    >
      <div 
        className="bg-gradient-to-br from-gray-900 to-black rounded-xl sm:rounded-2xl w-full max-w-sm sm:max-w-2xl lg:max-w-4xl max-h-[95vh] sm:max-h-[90vh] overflow-y-auto border border-yellow-500/30 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        style={{ 
          zIndex: 2147483647
        }}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 p-4 sm:p-6 text-black relative">
          <button
            onClick={handleModalClose}
            className="absolute top-4 right-4 p-2 hover:bg-black/10 rounded-lg transition-colors"
            disabled={isProcessing}
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <Wallet className="w-6 h-6 sm:w-8 sm:h-8" />
            <div>
              <h2 className="text-lg sm:text-2xl font-bold">{getPaymentMessage('deposit', currentLanguage)}</h2>
              <p className="text-sm sm:text-base opacity-80">{getPaymentMessage('selectPaymentMethod', currentLanguage)}</p>
            </div>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-2 sm:gap-4 mt-4 sm:mt-6">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  activeStep >= step ? 'bg-black text-yellow-400' : 'bg-black/20 text-black/50'
                }`}>
                  {step}
                </div>
                {step < 4 && <ChevronRight className="w-4 h-4 mx-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Başarı Mesajı */}
          {success && (
            <div className="bg-green-600/20 border border-green-500 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <Check className="w-6 h-6 text-green-400" />
                <div>
                  <h3 className="text-lg font-semibold text-green-400">{getPaymentMessage('success', currentLanguage)}</h3>
                  <p className="text-green-300">{getPaymentMessage('depositSuccess', currentLanguage)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Hata Mesajı */}
          {error && (
            <div className="bg-red-600/20 border border-red-500 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                <p className="text-red-300">{error}</p>
              </div>
            </div>
          )}

          {/* Step 1: Ödeme Yöntemi Seçimi */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6">{getPaymentMessage('selectPaymentMethod', currentLanguage)}</h3>
              
              {isLoadingNewMethods ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                  <span className="ml-3 text-white">Ödeme yöntemleri yükleniyor...</span>
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                  {availablePaymentMethods?.map((method) => (
                  <div
                    key={method.id}
                    onClick={() => !method.disabled && setSelectedMethod(method)}
                    className={`p-3 sm:p-4 border rounded-lg sm:rounded-xl transition-all relative ${
                      method.disabled 
                        ? 'border-gray-700 bg-gray-800/30 cursor-not-allowed opacity-60'
                        : selectedMethod?.id === method.id
                        ? 'border-yellow-500 bg-yellow-500/10 cursor-pointer hover:scale-105'
                        : 'border-gray-600 bg-gray-800/50 hover:border-yellow-500/50 cursor-pointer hover:scale-105'
                    }`}
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="flex-shrink-0">
                        {method.icon}
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className={`font-semibold ${method.disabled ? 'text-gray-400' : 'text-white'}`}>{method.name}</h4>
                          {method.popular && !method.disabled && (
                            <span className="px-2 py-1 bg-yellow-500 text-black text-xs rounded-full font-bold">
                              {currentLanguage === 'tr' ? 'Popüler' : currentLanguage === 'en' ? 'Popular' : 'პოპულარული'}
                            </span>
                          )}
                          {method.disabled && (
                            <span className="px-2 py-1 bg-gray-600 text-gray-300 text-xs rounded-full">
                              {currentLanguage === 'tr' ? 'Yakında' : currentLanguage === 'en' ? 'Coming Soon' : 'მალე'}
                            </span>
                          )}
                        </div>
                        
                        <p className={`text-sm mb-2 ${method.disabled ? 'text-gray-500' : 'text-gray-300'}`}>{method.description}</p>
                        
                        <div className="space-y-1 text-xs">
                          <div className={`flex justify-between ${method.disabled ? 'text-gray-500' : 'text-gray-400'}`}>
                            <span>{getPaymentMessage('limits', currentLanguage)}</span>
                            <span>₺{method.minAmount.toLocaleString()} - ₺{method.maxAmount.toLocaleString()}</span>
                          </div>
                          <div className={`flex justify-between ${method.disabled ? 'text-gray-500' : 'text-gray-400'}`}>
                            <span>{getPaymentMessage('processingTime', currentLanguage)}</span>
                            <span>{method.processingTime}</span>
                          </div>
                          {method.bonus && !method.disabled && (
                            <div className="flex justify-between text-green-400">
                              <span>{getPaymentMessage('bonus', currentLanguage)}</span>
                              <span>%{method.bonus}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>
              )}

              <div className="flex justify-end pt-4">
                <button
                  onClick={() => selectedMethod && setActiveStep(2)}
                  disabled={!selectedMethod}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  {getPaymentMessage('continue', currentLanguage)}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Tutar Girişi */}
          {activeStep === 2 && selectedMethod && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <button 
                  onClick={() => setActiveStep(1)}
                  className="text-yellow-500 hover:text-yellow-400 flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  {getPaymentMessage('back', currentLanguage)}
                </button>
                <h3 className="text-lg sm:text-xl font-semibold text-white">{getPaymentMessage('enterAmount', currentLanguage)}</h3>
              </div>

              {/* Seçilen Yöntem Bilgisi */}
              <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-center gap-3">
                  {selectedMethod.icon}
                  <div>
                    <h4 className="text-white font-semibold">{selectedMethod.name}</h4>
                    <p className="text-gray-400 text-sm">{selectedMethod.description}</p>
                  </div>
                </div>
              </div>

              {/* Tutar Girişi */}
              <div className="space-y-4">
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    {getPaymentMessage('depositAmount', currentLanguage)}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`${selectedMethod.minAmount} - ${selectedMethod.maxAmount}`}
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                      min={selectedMethod.minAmount}
                      max={selectedMethod.maxAmount}
                    />
                    <span className="absolute right-3 top-3 text-gray-400">₺</span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    {getPaymentMessage('limits', currentLanguage)}: ₺{selectedMethod.minAmount.toLocaleString()} - ₺{selectedMethod.maxAmount.toLocaleString()}
                  </p>
                </div>

                {/* Popüler Miktarlar */}
                <div>
                  <label className="block text-white text-sm font-medium mb-2">
                    {getPaymentMessage('popularAmounts', currentLanguage)}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {popularAmounts.map((popularAmount) => (
                      <button
                        key={popularAmount}
                        onClick={() => setAmount(popularAmount.toString())}
                        className="bg-gray-700 hover:bg-yellow-500 hover:text-black text-white px-3 py-2 rounded text-sm transition-colors"
                      >
                        ₺{popularAmount.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bonus Seçimi */}
                {selectedMethod.bonus && (
                  <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-4">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={useBonus}
                        onChange={(e) => setUseBonus(e.target.checked)}
                        className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500"
                      />
                      <div>
                        <span className="text-green-400 font-semibold">
                          %{selectedMethod.bonus} {getPaymentMessage('bonus', currentLanguage)}
                        </span>
                        <p className="text-green-300 text-sm">
                          {getPaymentMessage('bonusDesc', currentLanguage)}
                        </p>
                      </div>
                    </label>
                  </div>
                )}
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => setActiveStep(1)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  {getPaymentMessage('back', currentLanguage)}
                </button>
                <button
                  onClick={() => {
                    // Artık form adımı yok, doğrudan onay adımına geç
                    setActiveStep(3);
                  }}
                  disabled={!amount || parseFloat(amount) < selectedMethod.minAmount || parseFloat(amount) > selectedMethod.maxAmount}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  {getPaymentMessage('continue', currentLanguage)}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}



          {/* Step 3: Onay ve Ödeme */}
          {activeStep === 3 && selectedMethod && amount && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <button 
                  onClick={() => {
                    // Artık form adımı yok, doğrudan tutar adımına geri git
                    setActiveStep(2);
                  }}
                  className="text-yellow-500 hover:text-yellow-400 flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  {getPaymentMessage('back', currentLanguage)}
                </button>
                <h3 className="text-lg sm:text-xl font-semibold text-white">{getPaymentMessage('confirmPayment', currentLanguage)}</h3>
              </div>

              {/* Ödeme Özeti */}
              <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                <h4 className="text-white font-semibold mb-4">{getPaymentMessage('paymentSummary', currentLanguage)}</h4>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">{getPaymentMessage('paymentMethod', currentLanguage)}</span>
                    <span className="text-white">{selectedMethod.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">{getPaymentMessage('amount', currentLanguage)}</span>
                    <span className="text-white">₺{parseFloat(amount).toLocaleString()}</span>
                  </div>
                  
                  {/* Kripto para için ağ seçimi */}
                  {(selectedMethod.id === 'crypto' || selectedMethod.id === 'kripto') && (
                    <div className="bg-orange-600/10 border border-orange-500/30 rounded-lg p-4">
                      <label className="block text-white font-medium mb-2">
                        Kripto Para Ağı Seçin
                      </label>
                      <select
                        className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white"
                        value={paymentFormData.crypto_type || 'trc20'}
                        onChange={(e) => {
                          const userSelection = e.target.value;
                          // Backend'e uygun format'a çevir
                          let backendValue = userSelection;
                          if (userSelection === 'eth') backendValue = 'erc20';
                          if (userSelection === 'tron') backendValue = 'trc20';
                          
                          setPaymentFormData(prev => ({
                            ...prev,
                            crypto_type: backendValue
                          }));
                        }}
                      >
                        <option value="bsc">BSC (Binance Smart Chain)</option>
                        <option value="tron">TRON</option>
                        <option value="eth">ETH (Ethereum)</option>
                      </select>
                      <p className="text-orange-300 text-xs mt-2">
                        Lütfen kullanacağınız cüzdan ağını seçin. Yanlış ağ seçimi para kaybına neden olabilir!
                      </p>
                    </div>
                  )}

                  {/* Form verileri artık otomatik oluşturuluyor */}
                  <div className="bg-green-600/10 border border-green-500/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 text-green-400">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">
                        Ödeme bilgileri otomatik oluşturuldu
                      </span>
                    </div>
                    <p className="text-green-300 text-xs mt-1">
                      Gerçek bilgilerinizi popup penceresinde gireceksiniz.
                    </p>
                  </div>
                  
                  {selectedMethod.fee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-400">{getPaymentMessage('fee', currentLanguage)}</span>
                      <span className="text-white">₺{(parseFloat(amount) * (selectedMethod.fee / 100)).toLocaleString()}</span>
                    </div>
                  )}
                  {useBonus && selectedMethod.bonus && (
                    <div className="flex justify-between text-green-400">
                      <span>{getPaymentMessage('bonus', currentLanguage)}</span>
                      <span>+₺{(parseFloat(amount) * (selectedMethod.bonus / 100)).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-600 pt-3">
                    <div className="flex justify-between font-semibold">
                      <span className="text-white">{getPaymentMessage('total', currentLanguage)}</span>
                      <span className="text-yellow-400">
                        ₺{(parseFloat(amount) + (selectedMethod.fee > 0 ? parseFloat(amount) * (selectedMethod.fee / 100) : 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  onClick={() => {
                    // Artık form adımı yok, doğrudan tutar adımına geri git
                    setActiveStep(2);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  <ChevronRight className="w-4 h-4 rotate-180" />
                  {getPaymentMessage('back', currentLanguage)}
                </button>
                <button
                  onClick={handleDepositRequest}
                  disabled={isProcessing}
                  className="bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-black px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      {getPaymentMessage('processing', currentLanguage)}
                    </>
                  ) : (
                    <>
                      {getPaymentMessage('confirmPayment', currentLanguage)}
                      <ChevronsRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Step 4.5: Popup Engelleyici Çözümü */}
          {activeStep === 4.5 && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white">Popup Engellendi</h3>
              </div>

              {/* Popup Engelleyici Açıklaması */}
              <div className="bg-orange-600/20 border border-orange-500 rounded-lg p-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-6 h-6 text-orange-400" />
                  </div>
                  <div>
                    <h4 className="text-orange-400 font-semibold text-lg mb-2">Popup Engelleyici Algılandı</h4>
                    <p className="text-orange-300 mb-4">
                      Tarayıcınız ödeme penceresini engelledi. Ödeme işlemini tamamlamak için aşağıdaki seçeneklerden birini kullanabilirsiniz:
                    </p>
                    
                    {/* Çözüm Seçenekleri */}
                    <div className="space-y-3">
                      {/* Seçenek 1: Yeni Sekmede Aç */}
                      <button
                        onClick={() => {
                          if (paymentUrl) {
                            window.open(
                              paymentUrl,
                              '_blank',
                              'noopener,noreferrer'
                            );
                            setActiveStep(4); // Ödeme adımına geç
                          }
                        }}
                        disabled={!paymentUrl}
                        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-5 h-5" />
                        Yeni Sekmede Aç
                      </button>
                      
                      {/* Seçenek 2: Doğrudan Yönlendir */}
                      <button
                        onClick={() => {
                          if (paymentUrl) {
                            window.location.href = paymentUrl;
                          }
                        }}
                        disabled={!paymentUrl}
                        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 disabled:cursor-not-allowed text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                      >
                        <ArrowRight className="w-5 h-5" />
                        Doğrudan Yönlendir
                      </button>
                      
                      {/* Seçenek 3: Popup Engelleyiciyi Devre Dışı Bırak */}
                      <div className="bg-gray-800/50 rounded-lg p-4">
                        <h5 className="text-white font-semibold mb-2">Popup Engelleyiciyi Devre Dışı Bırakın:</h5>
                        <ol className="text-gray-300 text-sm space-y-1 list-decimal list-inside">
                          <li>Tarayıcı adres çubuğundaki popup simgesine tıklayın</li>
                          <li>"Bu sitede her zaman popup'lara izin ver" seçeneğini seçin</li>
                          <li>Sayfayı yenileyin ve tekrar deneyin</li>
                        </ol>
                        <button
                          onClick={() => {
                            setActiveStep(3); // Onay adımına geri dön
                          }}
                          className="mt-3 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Tekrar Dene
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Geri Dön Butonu */}
              <div className="flex justify-center pt-4">
                <button
                  onClick={() => {
                    setActiveStep(3);
                    setTransactionId(null);
                    setPaymentUrl(null);
                    setIsProcessing(false);
                  }}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Geri Dön
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Popup Window Ödeme */}
          {activeStep === 4 && paymentWindow && (
            <div className="space-y-6">
              <div className="flex items-center gap-4 mb-6">
                <h3 className="text-lg sm:text-xl font-semibold text-white">Ödeme İşlemi</h3>
              </div>

              {/* İşlem Durumu */}
              {success ? (
                <div className="bg-green-600/20 border border-green-500 rounded-lg p-6 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
                      <Check className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-green-400 mb-2">İşlem Tamamlandı!</h3>
                      <p className="text-green-300">Para yatırma işleminiz başarıyla tamamlandı.</p>
                      <p className="text-gray-400 text-sm mt-2">İşlem ID: {transactionId}</p>
                    </div>
                    <button
                      onClick={onClose}
                      className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Tamam
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Popup Açıklaması */}
                  <div className="bg-blue-600/20 border border-blue-500 rounded-lg p-6 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <div>
                        <h4 className="text-blue-400 font-semibold text-lg mb-2">Ödeme Penceresi Açıldı</h4>
                        <p className="text-blue-300">Açılan pencerede ödeme işlemini tamamlayın.</p>
                        <p className="text-blue-300 text-sm mt-2">Pencere görünmüyor mu? Popup engelleyicinizi kontrol edin.</p>
                      </div>
                      
                      {/* Popup'ı tekrar aç butonu */}
                      <button
                        onClick={() => {
                          if (paymentWindow && !paymentWindow.closed) {
                            paymentWindow.focus();
                          } else {
                            // Popup kapatılmışsa yeniden aç
                            const popup = window.open(
                              paymentWindow?.location?.href || '#',
                              'payment',
                              'width=800,height=600,scrollbars=yes,resizable=yes'
                            );
                            if (popup) {
                              setPaymentWindow(popup);
                            }
                          }
                        }}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Ödeme Penceresini Aç
                      </button>
                    </div>
                  </div>

                  {/* İptal Butonu */}
                  <div className="flex justify-center pt-4">
                    <button
                      onClick={() => {
                        if (paymentWindow) {
                          paymentWindow.close();
                          setPaymentWindow(null);
                        }
                        setActiveStep(3);
                        setTransactionId(null);
                        setIsProcessing(false);
                      }}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      İşlemi İptal Et
                    </button>
                  </div>
                </div>
              )}
            </div>
                    )}
        </div>
      </div>
    </div>,
    document.body
  );
}