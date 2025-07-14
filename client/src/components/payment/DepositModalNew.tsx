import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X, Wallet, CreditCard, Building, Smartphone, ArrowRight, CheckCircle, Bitcoin, AlertCircle, Clock } from 'lucide-react';
import { translate, getCurrentLanguage } from '@/utils/i18n-fixed';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { getPaymentMethodsNew, createDepositNew, checkTransactionStatus } from '@/services/financeService';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  enabled: boolean;
  required_fields: string[];
  min_amount: number;
  max_amount: number;
  processing_time: string;
}

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
  crypto_type?: 'bsc' | 'eth' | 'tron';
  crypto_address?: string;
  payfix_number?: string;
}

export default function DepositModalNew({ isOpen, onClose }: DepositModalProps) {
  const { user } = useUser();
  const { toast } = useToast();
  const currentLanguage = getCurrentLanguage();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'method' | 'amount' | 'form' | 'confirm' | 'processing' | 'success' | 'iframe-success'>('method');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentFormData, setPaymentFormData] = useState<PaymentFormData>({});
  const [transactionId, setTransactionId] = useState<string>('');
  const [paymentUrl, setPaymentUrl] = useState<string>('');
  const [countdown, setCountdown] = useState<number>(10);
  const modalRef = useRef<HTMLDivElement>(null);

  // Load payment methods
  useEffect(() => {
    if (isOpen) {
      fetchPaymentMethods();
    }
  }, [isOpen]);

  const fetchPaymentMethods = async () => {
    try {
      setLoading(true);
      const methods = await getPaymentMethodsNew();
      setPaymentMethods(methods);
    } catch (error: any) {
      console.error('Payment methods error:', error);
      toast({
        title: 'Ödeme Sistemi Hatası',
        description: error.message || 'Ödeme yöntemleri yüklenirken bir hata oluştu',
        variant: 'destructive'
      });
      // Fallback methods
      setPaymentMethods([]);
    } finally {
      setLoading(false);
    }
  };

  // Modal açıldığında scroll'u kilitle
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setStep('method');
      setSelectedMethod(null);
      setAmount('');
      setPaymentFormData({});
      setTransactionId('');
      setPaymentUrl('');
      setCountdown(10);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Countdown timer for iframe-success step
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (step === 'iframe-success' && countdown > 0) {
      interval = setInterval(() => {
        setCountdown((prev) => {
          const newCount = prev - 1;
          if (newCount <= 0) {
            // Countdown bittiğinde modal'ı kapat
            setTimeout(() => {
              handleModalClose();
            }, 500);
            return 0;
          }
          return newCount;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [step, countdown]);

  // Para yatırma işlemi
  const handleDeposit = async () => {
    if (!selectedMethod || !amount || !user) {
      toast({
        title: 'Hata',
        description: 'Lütfen tüm alanları doldurun',
        variant: 'destructive'
      });
      return;
    }

    const numAmount = parseFloat(amount);
         if (selectedMethod.id === 'crypto' && !paymentFormData.crypto_type) {
       toast({
         title: 'Eksik Bilgi',
         description: 'Kripto para yatırma için kripto türü seçimi gereklidir.',
         variant: 'destructive'
       });
       return;
     }

    if (selectedMethod.id !== 'crypto' && (!paymentFormData.tc_number || !paymentFormData.iban)) {
      toast({
        title: 'Eksik Bilgi',
        description: 'Kredi kartı veya havale ödemesi için TC kimlik numarası veya IBAN gereklidir.',
        variant: 'destructive'
      });
      return;
    }

    if (selectedMethod.id !== 'crypto' && numAmount < selectedMethod.min_amount || numAmount > selectedMethod.max_amount) {
      toast({
        title: 'Geçersiz Tutar',
        description: `Tutar ₺${selectedMethod.min_amount} - ₺${selectedMethod.max_amount} arasında olmalıdır`,
        variant: 'destructive'
      });
      return;
    }

    setIsProcessing(true);
    setStep('processing');

    try {
      if (selectedMethod.id === 'crypto') {
        const cryptoDepositData = {
          payment_method_id: 'crypto',
          amount: numAmount,
          user: user.email,
          user_name: user.username,
          user_id: user.id.toString(),
          site_reference_number: `CRYPTO_${Date.now()}_${user.id}`,
          return_url: `${window.location.origin}/crypto-success`,
          user_email: user.email,
          crypto_type: paymentFormData.crypto_type,
          crypto_address: paymentFormData.crypto_address,
          // XPay API'sinde walletAddress field'ı bekleniyor
          walletAddress: paymentFormData.crypto_address,
          firstName: user.username,
          lastName: 'User'
        };

        console.log('📤 Kripto para yatırma isteği:', cryptoDepositData);

        const response = await fetch('/api/public/crypto-deposit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(cryptoDepositData)
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('✅ Kripto para yatırma başarılı:', result);
          
          toast({
            title: 'Başarılı',
            description: result.message || 'Kripto para yatırma işlemi başlatıldı',
            variant: 'default'
          });
          
          setStep('success');
          
          // Transaction details'i set et
          // setTransactionDetails({
          //   transactionId: result.data.transaction_id,
          //   amount: result.data.amount,
          //   paymentMethod: result.data.payment_method,
          //   status: result.data.status,
          //   estimatedTime: result.data.estimated_time,
          //   cryptoType: result.data.crypto_type,
          //   cryptoAddress: result.data.crypto_address,
          //   instructions: result.data.instructions
          // });
        } else {
          console.error('❌ Kripto para yatırma hatası:', result);
          
          toast({
            title: 'Hata',
            description: result.error || 'Kripto para yatırma işlemi başarısız',
            variant: 'destructive'
          });
          
          setStep('method');
        }
      } else {
        // Diğer ödeme yöntemleri için mevcut createDepositNew fonksiyonunu kullan
        const depositData = {
          amount: numAmount,
          payment_method_id: selectedMethod.id,
          user_id: user.id.toString(),
          user_name: user.username,
          user: user.email,
          user_email: user.email,
          return_url: `${window.location.origin}/deposit-success`,
          callback_url: `${window.location.origin}/api/public/deposit/callback`,
          site_reference_number: `ORDER_${Date.now()}_${user.id}`,
          firstName: user.username,
          lastName: 'User',
          ...paymentFormData,
          // XPay API'sinde walletAddress field'ı bekleniyor (crypto için)
          ...(selectedMethod.id === 'crypto' && paymentFormData.crypto_address ? {
            walletAddress: paymentFormData.crypto_address
          } : {})
        };

        const result = await createDepositNew(depositData);
        
        if (result.success) {
          console.log('✅ Para yatırma başarılı:', result);
          
          toast({
            title: 'Başarılı',
            description: result.message || 'Para yatırma işlemi başlatıldı',
            variant: 'default'
          });
          
          setStep('success');
          
          // Transaction details'i set et
          // setTransactionDetails({
          //   transactionId: result.data.transaction_id,
          //   amount: result.data.amount,
          //   paymentMethod: result.data.payment_method,
          //   status: result.data.status,
          //   estimatedTime: result.data.estimated_time
          // });
        } else {
          console.error('❌ Para yatırma hatası:', result);
          
          toast({
            title: 'Hata',
            description: result.error || 'Para yatırma işlemi başarısız',
            variant: 'destructive'
          });
          
          setStep('method');
        }
      }
    } catch (error: any) {
      setStep('confirm');
      console.error('Deposit error details:', error);
      toast({
        title: 'Ödeme İşlemi Hatası',
        description: error.message || 'Para yatırma işlemi sırasında bir hata oluştu',
        variant: 'destructive'
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // İşlem durumu kontrol et
  const handleCheckStatus = async () => {
    if (!transactionId) return;

    try {
      const status = await checkTransactionStatus(transactionId);
      toast({
        title: 'İşlem Durumu',
        description: `İşlem durumu: ${status.status}`,
      });
    } catch (error: any) {
      console.error('Transaction status check error:', error);
      toast({
        title: 'İşlem Durumu Hatası',
        description: error.message || 'İşlem durumu kontrol edilemedi',
        variant: 'destructive'
      });
    }
  };

  // Get payment method icon
  const getPaymentMethodIcon = (methodId: string) => {
    switch (methodId) {
      case 'papara':
        return <CreditCard className="w-5 h-5 text-purple-400" />;
      case 'havale':
        return <Building className="w-5 h-5 text-blue-400" />;
      case 'pep':
        return <Smartphone className="w-5 h-5 text-green-400" />;
      case 'paratim':
        return <Wallet className="w-5 h-5 text-orange-400" />;
      case 'crypto':
        return <Bitcoin className="w-5 h-5 text-yellow-400" />;
      default:
        return <Wallet className="w-5 h-5 text-gray-400" />;
    }
  };

  // Gerekli alanları render et
  const renderRequiredFields = () => {
    if (!selectedMethod?.required_fields) return null;

    return selectedMethod.required_fields.map((field) => {
      if (field === 'crypto_type') {
        return (
          <div key={field} className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {getFieldLabel(field)}
            </label>
            <select
              value={paymentFormData.crypto_type || ''}
              onChange={(e) => setPaymentFormData({
                ...paymentFormData,
                crypto_type: e.target.value as 'bsc' | 'eth' | 'tron'
              })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Kripto türü seçin</option>
              <option value="bsc">BSC (Binance Smart Chain)</option>
              <option value="eth">ETH (Ethereum)</option>
              <option value="tron">TRON</option>
            </select>
          </div>
        );
      }

      if (field === 'walletAddress' || field === 'crypto_address') {
        return (
          <div key={field} className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              {getFieldLabel('crypto_address')} <span className="text-gray-500 text-xs">(İsteğe bağlı)</span>
            </label>
            <input
              type="text"
              value={paymentFormData.crypto_address || ''}
              onChange={(e) => setPaymentFormData({
                ...paymentFormData,
                crypto_address: e.target.value
              })}
              placeholder={getCryptoAddressPlaceholder(paymentFormData.crypto_type)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {paymentFormData.crypto_type && (
              <div className="space-y-1">
                <p className="text-xs text-gray-500">
                  {getCryptoNetworkInfo(paymentFormData.crypto_type)}
                </p>
                <p className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
                  💡 Cüzdan adresi girmeseniz, CryptonBets varsayılan cüzdanı kullanılacaktır
                </p>
              </div>
            )}
          </div>
        );
      }

      return (
        <div key={field} className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            {getFieldLabel(field)}
          </label>
          <input
            type="text"
            value={paymentFormData[field as keyof PaymentFormData] || ''}
            onChange={(e) => setPaymentFormData({
              ...paymentFormData,
              [field]: e.target.value
            })}
            placeholder={getFieldPlaceholder(field)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>
      );
    });
  };

  // Alan etiketlerini getir
  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'papara_id':
        return 'Papara ID';
      case 'pep_id':
        return 'Pep ID';
      case 'tc_number':
        return 'TC Kimlik Numarası';
      case 'iban':
        return 'IBAN';
      case 'bank_name':
        return 'Banka Adı';
      case 'account_name':
        return 'Hesap Sahibi';
      case 'pay_co_id':
        return 'PayCo ID';
      case 'pay_co_full_name':
        return 'PayCo Ad Soyad';
      case 'paratim_id':
        return 'Paratim ID';
      case 'crypto_type':
        return 'Kripto Para Türü';
      case 'crypto_address':
        return 'Kripto Cüzdan Adresi';
      case 'payfix_number':
        return 'Payfix Numarası';
      default:
        return field;
    }
  };

  // Alan placeholder'larını getir
  const getFieldPlaceholder = (field: string) => {
    switch (field) {
      case 'papara_id':
        return 'Papara ID numaranızı girin';
      case 'pep_id':
        return 'Pep ID numaranızı girin';
      case 'tc_number':
        return '11 haneli TC kimlik numaranızı girin';
      case 'iban':
        return 'TR ile başlayan IBAN numaranızı girin';
      case 'bank_name':
        return 'Banka adını girin';
      case 'account_name':
        return 'Hesap sahibinin adını girin';
      case 'pay_co_id':
        return 'PayCo ID numaranızı girin';
      case 'pay_co_full_name':
        return 'PayCo hesabınızın ad soyad bilgisini girin';
      case 'paratim_id':
        return 'Paratim ID numaranızı girin';
      case 'crypto_address':
        return 'Kripto cüzdan adresinizi girin';
      case 'payfix_number':
        return 'Payfix numaranızı girin';
      default:
        return `${field} girin`;
    }
  };

  const getCryptoAddressPlaceholder = (cryptoType?: string) => {
    switch (cryptoType) {
      case 'bsc':
        return '0x... (BSC adresi) - İsteğe bağlı';
      case 'eth':
        return '0x... (Ethereum adresi) - İsteğe bağlı';
      case 'tron':
        return 'T... (TRON adresi) - İsteğe bağlı';
      default:
        return 'Kripto cüzdan adresi (İsteğe bağlı)';
    }
  };

  const getCryptoNetworkInfo = (cryptoType: string) => {
    switch (cryptoType) {
      case 'bsc':
        return 'Binance Smart Chain (BSC) ağı - 0x ile başlayan 42 karakter';
      case 'eth':
        return 'Ethereum ağı - 0x ile başlayan 42 karakter';
      case 'tron':
        return 'TRON ağı - T ile başlayan 34 karakter';
      default:
        return '';
    }
  };

  // Adım ilerletme
  const nextStep = () => {
    if (step === 'method' && selectedMethod) {
      setStep('amount');
    } else if (step === 'amount' && amount) {
      if (selectedMethod?.required_fields && selectedMethod.required_fields.length > 0) {
        setStep('form');
      } else {
        setStep('confirm');
      }
    } else if (step === 'form') {
      setStep('confirm');
    }
  };

  // Geri gitme
  const prevStep = () => {
    if (step === 'amount') {
      setStep('method');
    } else if (step === 'form') {
      setStep('amount');
    } else if (step === 'confirm') {
      if (selectedMethod?.required_fields && selectedMethod.required_fields.length > 0) {
        setStep('form');
      } else {
        setStep('amount');
      }
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

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-[9999]"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-yellow-500/30 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        ref={modalRef}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-2xl font-bold text-white">Para Yatır</h2>
          <button
            onClick={handleModalClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Ödeme Yöntemi Seçimi */}
          {step === 'method' && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Ödeme Yöntemi Seçin</h3>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                </div>
              ) : (
                <div className="grid gap-3">
                  {paymentMethods.map((method) => (
                    <button
                      key={method.id}
                      onClick={() => {
                        setSelectedMethod(method);
                        nextStep();
                      }}
                      disabled={!method.enabled}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        method.enabled
                          ? 'border-gray-700 hover:border-yellow-500 bg-gray-800/50'
                          : 'border-gray-800 bg-gray-900/50 opacity-50 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getPaymentMethodIcon(method.id)}
                          <div>
                            <div className="font-medium text-white">{method.name}</div>
                            <div className="text-sm text-gray-400">
                              ₺{method.min_amount} - ₺{method.max_amount}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-gray-400">{method.processing_time}</div>
                          {!method.enabled && (
                            <div className="text-xs text-red-400">Geçici olarak kapalı</div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Step 2: Tutar Girişi */}
          {step === 'amount' && selectedMethod && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Yatırılacak Tutarı Girin</h3>
              <div className="space-y-4">
                        <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tutar (₺{selectedMethod.min_amount} - ₺{selectedMethod.max_amount})
                      </label>
                        <input
                          type="number"
                    min={selectedMethod.min_amount}
                    max={selectedMethod.max_amount}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-white"
                    placeholder="Tutarı girin"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                        />
                    </div>

                {/* Hızlı tutar seçimi */}
                    <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Hızlı Seçim</label>
                      <div className="grid grid-cols-3 gap-2">
                    {[100, 250, 500, 1000, 2500, 5000]
                      .filter(val => val >= selectedMethod.min_amount && val <= selectedMethod.max_amount)
                      .map((val) => (
                          <button
                        key={val}
                        onClick={() => setAmount(val.toString())}
                        className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg hover:border-yellow-500 text-white text-sm transition-colors"
                          >
                        ₺{val}
                          </button>
                        ))}
                      </div>
                    </div>

                <div className="flex space-x-4">
                      <button
                    onClick={prevStep}
                    className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Geri
                      </button>
                      <button
                    onClick={nextStep}
                    disabled={!amount || parseFloat(amount) < selectedMethod.min_amount || parseFloat(amount) > selectedMethod.max_amount}
                    className="flex-1 py-3 px-4 bg-yellow-600 text-black rounded-lg hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Devam Et
                      </button>
                    </div>
                  </div>
            </div>
          )}

          {/* Step 3: Form Alanları */}
          {step === 'form' && selectedMethod && (
            <div>
              {renderRequiredFields()}
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={prevStep}
                  className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Geri
                </button>
                <button
                  onClick={nextStep}
                  className="flex-1 py-3 px-4 bg-yellow-600 text-black rounded-lg hover:bg-yellow-500 transition-colors"
                >
                  Devam Et
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Onay */}
          {step === 'confirm' && selectedMethod && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">İşlemi Onaylayın</h3>
              <div className="bg-gray-800/50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between">
                  <span className="text-gray-400">Ödeme Yöntemi:</span>
                  <span className="text-white">{selectedMethod.name}</span>
                        </div>
                        <div className="flex justify-between">
                  <span className="text-gray-400">Tutar:</span>
                  <span className="text-white font-semibold">₺{amount}</span>
                        </div>
                        <div className="flex justify-between">
                  <span className="text-gray-400">İşlem Süresi:</span>
                  <span className="text-white">{selectedMethod.processing_time}</span>
                      </div>
                    </div>

              <div className="flex space-x-4 mt-6">
                      <button
                  onClick={prevStep}
                        disabled={isProcessing}
                  className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50"
                      >
                        Geri
                      </button>
                      <button
                        onClick={handleDeposit}
                        disabled={isProcessing}
                  className="flex-1 py-3 px-4 bg-green-600 text-white rounded-lg hover:bg-green-500 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {isProcessing ? (
                          <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>İşleniyor...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-4 h-4" />
                      <span>Onayla ve Öde</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
          )}

          {/* Step 5: İşleniyor */}
          {step === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-yellow-500 mx-auto mb-4"></div>
              <h3 className="text-lg font-semibold text-white mb-2">İşlem İşleniyor...</h3>
              <p className="text-gray-400">Lütfen bekleyin, ödeme işleminiz gerçekleştiriliyor.</p>
              
              {transactionId && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400">İşlem ID: {transactionId}</p>
                  <button
                    onClick={handleCheckStatus}
                    className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors text-sm"
                  >
                    Durumu Kontrol Et
                  </button>
                </div>
              )}
              
              {paymentUrl && (
                <div className="mt-4">
                  <p className="text-sm text-green-400">Ödeme sayfasına yönlendiriliyorsunuz...</p>
                </div>
              )}
            </div>
          )}

          {/* Step 6: XPay iframe Success - Ödemeniz Alındı */}
          {step === 'iframe-success' && (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-green-400 mb-2">Ödemeniz Alındı!</h3>
                <p className="text-gray-300 mb-4">
                  Para yatırma işleminiz başarıyla başlatıldı. <br />
                  Ödeme sağlayıcısından onay bekliyor.
                </p>
                
                {amount && selectedMethod && (
                  <div className="bg-gray-800/50 rounded-lg p-4 mb-4 inline-block">
                    <div className="text-sm text-gray-400">Yatırılan Tutar</div>
                    <div className="text-2xl font-bold text-yellow-400">₺{amount}</div>
                    <div className="text-sm text-gray-400">{selectedMethod.name}</div>
                  </div>
                )}

                <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-4 mb-6">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Clock className="w-5 h-5 text-blue-400" />
                    <span className="text-blue-400 font-medium">Bu pencere {countdown} saniye sonra kapanacak</span>
                  </div>
                  <p className="text-sm text-gray-400">
                    Bakiyeniz işlem onaylandığında güncellenecektir.
                  </p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={handleModalClose}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                  >
                    Tamam, Kapat
                  </button>
                  
                  {transactionId && (
                    <button
                      onClick={handleCheckStatus}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      İşlem Durumunu Kontrol Et
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}