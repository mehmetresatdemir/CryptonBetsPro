import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle, XCircle, Clock, Home, CreditCard, AlertTriangle, RefreshCw } from 'lucide-react';

interface PaymentStatus {
  status: 'success' | 'failed' | 'pending' | 'cancelled';
  transactionId?: string;
  amount?: number;
  currency?: string;
  paymentMethod?: string;
  message?: string;
  debugInfo?: any;
}

export default function PaymentReturn() {
  const [location, setLocation] = useLocation();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'pending' });
  const [countdown, setCountdown] = useState(30); // 30 saniyeye çıkardım
  const [isChecking, setIsChecking] = useState(false);
  const [autoPolling, setAutoPolling] = useState(false);

  // Transaction durumunu API'den çek
  const checkTransactionStatus = async (transactionId: string) => {
    try {
      setIsChecking(true);
      console.log('🔍 Transaction durumu kontrol ediliyor:', transactionId);
      
      const response = await fetch(`/api/public/callback/debug/${transactionId}`);
      const result = await response.json();
      
      console.log('📊 Transaction Debug Response:', result);
      
      if (result.success && result.transaction) {
        const transaction = result.transaction;
        let newStatus: PaymentStatus['status'] = 'pending';
        
        if (transaction.status === 'completed') {
          newStatus = 'success';
          setAutoPolling(false); // Stop polling when completed
        } else if (transaction.status === 'failed') {
          newStatus = 'failed';
          setAutoPolling(false); // Stop polling when failed
        } else if (transaction.status === 'cancelled') {
          newStatus = 'cancelled';
          setAutoPolling(false); // Stop polling when cancelled
        }
        
        setPaymentStatus(prev => ({
          ...prev,
          status: newStatus,
          amount: transaction.amount,
          debugInfo: result
        }));

        return newStatus;
      }
      return 'pending';
    } catch (error) {
      console.error('❌ Transaction durumu kontrol hatası:', error);
      return 'pending';
    } finally {
      setIsChecking(false);
    }
  };

  // Auto-polling effect
  useEffect(() => {
    if (!autoPolling || !paymentStatus.transactionId) return;

    const pollInterval = setInterval(async () => {
      console.log('🔄 Auto-polling transaction status...');
      const status = await checkTransactionStatus(paymentStatus.transactionId!);
      
      if (status === 'completed' || status === 'failed' || status === 'cancelled') {
        setAutoPolling(false);
      }
    }, 5000); // Her 5 saniyede bir kontrol

    return () => clearInterval(pollInterval);
  }, [autoPolling, paymentStatus.transactionId]);

  useEffect(() => {
    // Tüm URL bilgilerini yakala
    const fullUrl = window.location.href;
    const urlParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash;
    const pathname = window.location.pathname;
    
    // Tüm URL parametrelerini bir object'e çevir
    const allParams: { [key: string]: string } = {};
    urlParams.forEach((value, key) => {
      allParams[key] = value;
    });

    console.log('🔍 PaymentReturn - FULL URL DEBUG:', {
      fullUrl,
      pathname,
      search: window.location.search,
      hash,
      allParams,
      paramCount: Object.keys(allParams).length
    });

    // URL parametrelerini parse et
    const status = urlParams.get('status');
    const transactionId = urlParams.get('transaction_id') || urlParams.get('transactionId') || urlParams.get('reference') || urlParams.get('order_id');
    const amount = urlParams.get('amount');
    const currency = urlParams.get('currency') || 'TRY';
    const paymentMethod = urlParams.get('payment_method') || urlParams.get('method');
    const message = urlParams.get('message');
    const token = urlParams.get('token');
    const success = urlParams.get('success');

    console.log('🔍 PaymentReturn - Parsed Parameters:', {
      status,
      transactionId,
      amount,
      currency,
      paymentMethod,
      message,
      token,
      success,
      hasAnyParam: !!(status || transactionId || amount || token)
    });

    // Eğer hiç parametre yoksa, local storage'dan kontrol et
    if (!transactionId && !status && !token) {
      const lastTransaction = localStorage.getItem('lastTransactionId');
      const lastDepositData = localStorage.getItem('lastDepositData');
      
      console.log('🔍 PaymentReturn - Local Storage Check:', {
        lastTransaction,
        lastDepositData: lastDepositData ? JSON.parse(lastDepositData) : null
      });

      if (lastTransaction) {
        console.log('🔄 Using transaction from localStorage:', lastTransaction);
        
        // Auto-polling'i başlat (sadece son 10 dakikadaki transaction'lar için)
        if (lastDepositData) {
          try {
            const depositData = JSON.parse(lastDepositData);
            const transactionTime = new Date(depositData.timestamp);
            const now = new Date();
            const diffMinutes = (now.getTime() - transactionTime.getTime()) / (1000 * 60);
            
            if (diffMinutes <= 10) {
              console.log('⏰ Recent transaction found, starting auto-polling...');
              setAutoPolling(true);
            } else {
              console.log('⏰ Transaction too old for auto-polling:', diffMinutes, 'minutes');
            }
          } catch (e) {
            console.error('❌ Error parsing deposit data:', e);
          }
        }
        
        checkTransactionStatus(lastTransaction);
        setPaymentStatus(prev => ({ 
          ...prev, 
          transactionId: lastTransaction,
          message: 'Transaction localStorage\'dan alındı ve kontrol ediliyor...'
        }));
      } else {
        console.log('📝 No transaction found in localStorage, showing manual input');
        // Kullanıcıya bilgi mesajı göster
        setPaymentStatus(prev => ({ 
          ...prev, 
          status: 'pending',
          message: 'Ödeme işlemi kontrol ediliyor. Eğer işlem tamamlandıysa bakiyeniz güncellenecektir.'
        }));
      }
    }

    // Status'u güvenli şekilde parse et
    let parsedStatus: PaymentStatus['status'] = 'pending';
    if (status === 'success' || status === 'completed' || success === 'true' || success === '1') {
      parsedStatus = 'success';
    } else if (status === 'failed' || status === 'error') {
      parsedStatus = 'failed';
    } else if (status === 'cancelled' || status === 'cancel') {
      parsedStatus = 'cancelled';
    }

    setPaymentStatus({
      status: parsedStatus,
      transactionId: transactionId || undefined,
      amount: amount ? parseFloat(amount) : undefined,
      currency,
      paymentMethod: paymentMethod || undefined,
      message: message || undefined
    });

    // Eğer transaction ID varsa, gerçek durumu API'den çek
    if (transactionId) {
      checkTransactionStatus(transactionId);
    }

    // Iframe'den gelen postMessage'ları dinle
    const handleIframeMessage = (event: MessageEvent) => {
      console.log('📨 Iframe Message Received:', event);
      
      // Güvenlik kontrolü - sadece MetaPay/XPay domain'lerinden mesaj kabul et
      const allowedOrigins = [
        'https://testapi.xpayio.com',
        'https://api.xpayio.com', 
        'https://pay.cryptonbets1.com'
      ];
      
      if (!allowedOrigins.some(origin => event.origin.includes(origin))) {
        console.log('⚠️ Unauthorized iframe message origin:', event.origin);
        return;
      }

      try {
        let data = event.data;
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }

        console.log('📨 Parsed iframe data:', data);

        // MetaPay success callback'ini yakala
        if (data.type === 'payment_success' || data.status === 'success' || data.status === 'completed') {
          console.log('✅ Iframe Success Callback:', data);
          
          setPaymentStatus(prev => ({
            ...prev,
            status: 'success',
            transactionId: data.transaction_id || data.transactionId || prev.transactionId,
            amount: data.amount || prev.amount,
            message: data.message || 'Ödeme iframe üzerinden başarıyla tamamlandı'
          }));

          // API'den de kontrol et
          if (data.transaction_id || data.transactionId) {
            checkTransactionStatus(data.transaction_id || data.transactionId);
          }
        } else if (data.type === 'payment_failed' || data.status === 'failed' || data.status === 'error') {
          console.log('❌ Iframe Failed Callback:', data);
          
          setPaymentStatus(prev => ({
            ...prev,
            status: 'failed',
            message: data.message || data.error || 'Ödeme iframe üzerinden başarısız oldu'
          }));
        }
      } catch (error) {
        console.error('❌ Iframe message parsing error:', error);
      }
    };

    window.addEventListener('message', handleIframeMessage);

    // Otomatik yönlendirme countdown'u - sadece success durumunda
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1 && parsedStatus === 'success') {
          setLocation('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      window.removeEventListener('message', handleIframeMessage);
    };
  }, [setLocation]);

  const handleManualCheck = () => {
    if (paymentStatus.transactionId) {
      checkTransactionStatus(paymentStatus.transactionId);
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus.status) {
      case 'success':
        return <CheckCircle className="w-16 h-16 text-green-500" />;
      case 'failed':
        return <XCircle className="w-16 h-16 text-red-500" />;
      case 'cancelled':
        return <AlertTriangle className="w-16 h-16 text-yellow-500" />;
      default:
        return <Clock className="w-16 h-16 text-blue-500" />;
    }
  };

  const getStatusTitle = () => {
    switch (paymentStatus.status) {
      case 'success':
        return 'Ödeme Başarılı!';
      case 'failed':
        return 'Ödeme Başarısız';
      case 'cancelled':
        return 'Ödeme İptal Edildi';
      default:
        return 'Ödeme İşleniyor...';
    }
  };

  const getStatusMessage = () => {
    if (paymentStatus.message) {
      return paymentStatus.message;
    }

    switch (paymentStatus.status) {
      case 'success':
        return 'Para yatırma işleminiz başarıyla tamamlandı. Bakiyeniz güncellendi ve oyunlara başlayabilirsiniz.';
      case 'failed':
        return 'Ödeme işleminiz tamamlanamadı. Lütfen farklı bir ödeme yöntemi deneyiniz veya müşteri hizmetleri ile iletişime geçiniz.';
      case 'cancelled':
        return 'Ödeme işlemini iptal ettiniz. İstediğiniz zaman tekrar deneyebilirsiniz.';
      default:
        return 'Ödeme işleminiz işleniyor. Lütfen bekleyiniz...';
    }
  };

  const getStatusColor = () => {
    switch (paymentStatus.status) {
      case 'success':
        return 'from-green-500 to-emerald-600';
      case 'failed':
        return 'from-red-500 to-red-600';
      case 'cancelled':
        return 'from-yellow-500 to-orange-600';
      default:
        return 'from-blue-500 to-blue-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Status Card */}
          <div className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-3xl p-8 border border-gray-700 text-center">
            {/* Status Icon */}
            <div className="flex justify-center mb-6">
              <div className={`p-4 rounded-full bg-gradient-to-r ${getStatusColor()} bg-opacity-20`}>
                {getStatusIcon()}
              </div>
            </div>

            {/* Status Title */}
            <h1 className="text-4xl font-bold text-white mb-4">
              {getStatusTitle()}
            </h1>

            {/* Status Message */}
            <p className="text-xl text-gray-300 mb-8 leading-relaxed">
              {getStatusMessage()}
            </p>

            {/* Transaction Details */}
            {(paymentStatus.transactionId || paymentStatus.amount || paymentStatus.paymentMethod) && (
              <div className="bg-gray-800/50 rounded-2xl p-6 mb-8 text-left">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  İşlem Detayları
                </h3>
                <div className="space-y-3">
                  {paymentStatus.transactionId && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">İşlem No:</span>
                      <span className="text-white font-mono">{paymentStatus.transactionId}</span>
                    </div>
                  )}
                  {paymentStatus.amount && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Tutar:</span>
                      <span className="text-white font-semibold">
                        ₺{paymentStatus.amount.toLocaleString()} {paymentStatus.currency}
                      </span>
                    </div>
                  )}
                  {paymentStatus.paymentMethod && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Ödeme Yöntemi:</span>
                      <span className="text-white capitalize">{paymentStatus.paymentMethod}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Tarih:</span>
                    <span className="text-white">{new Date().toLocaleString('tr-TR')}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setLocation('/')}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold py-3 px-8 rounded-xl hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 hover:transform hover:scale-105"
              >
                <Home className="w-5 h-5" />
                Ana Sayfa
              </button>
              
              {/* Manuel Kontrol Butonu */}
              {paymentStatus.transactionId && (
                <button
                  onClick={handleManualCheck}
                  disabled={isChecking}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold py-3 px-8 rounded-xl hover:from-purple-400 hover:to-indigo-400 transition-all duration-300 hover:transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <RefreshCw className={`w-5 h-5 ${isChecking ? 'animate-spin' : ''}`} />
                  {isChecking ? 'Kontrol Ediliyor...' : 'Durumu Kontrol Et'}
                </button>
              )}
              
              {paymentStatus.status === 'success' && (
                <button
                  onClick={() => setLocation('/games')}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-3 px-8 rounded-xl hover:from-blue-400 hover:to-purple-400 transition-all duration-300 hover:transform hover:scale-105"
                >
                  Oyunlara Başla
                </button>
              )}

              {(paymentStatus.status === 'failed' || paymentStatus.status === 'cancelled') && (
                <button
                  onClick={() => setLocation('/deposit')}
                  className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold py-3 px-8 rounded-xl hover:from-green-400 hover:to-teal-400 transition-all duration-300 hover:transform hover:scale-105"
                >
                  <CreditCard className="w-5 h-5" />
                  Tekrar Dene
                </button>
              )}
            </div>

            {/* Auto Redirect Countdown - Sadece success durumunda göster */}
            {paymentStatus.status === 'success' && (
              <div className="mt-8 text-green-400 text-sm">
                ✅ Ödeme başarılı! {countdown} saniye sonra ana sayfaya yönlendirileceksiniz...
              </div>
            )}
            
            {/* Pending durumunda bekleme mesajı */}
            {paymentStatus.status === 'pending' && (
              <div className="mt-8 text-blue-400 text-sm">
                ⏳ İşlem durumu kontrol ediliyor... Lütfen bekleyiniz.
                {autoPolling && (
                  <div className="mt-2 text-xs text-blue-300">
                    🔄 Otomatik kontrol aktif (5 saniye aralıklarla)
                  </div>
                )}
              </div>
            )}

            {/* Auto-polling kontrolü */}
            {paymentStatus.transactionId && !autoPolling && paymentStatus.status === 'pending' && (
              <div className="mt-8">
                <button
                  onClick={() => setAutoPolling(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  🔄 Otomatik Kontrol Başlat
                </button>
              </div>
            )}

            {/* Auto-polling durdurma */}
            {autoPolling && (
              <div className="mt-8">
                <button
                  onClick={() => setAutoPolling(false)}
                  className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors text-sm"
                >
                  ⏹️ Otomatik Kontrol Durdur
                </button>
              </div>
            )}
          </div>

          {/* Debug Information - Development için */}
          {paymentStatus.debugInfo && (
            <div className="mt-8 bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                🔍 Debug Bilgileri
              </h3>
              <div className="bg-gray-900/50 rounded-lg p-4 overflow-auto">
                <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                  {JSON.stringify(paymentStatus.debugInfo, null, 2)}
                </pre>
              </div>
            </div>
          )}

          {/* Transaction ID yoksa manuel giriş */}
          {!paymentStatus.transactionId && (
            <div className="mt-8 bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-3">Transaction ID ile Kontrol</h3>
              <p className="text-gray-300 mb-4">
                İşlem numaranız varsa aşağıya girerek durumunu kontrol edebilirsiniz:
              </p>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="pub_1234567890123 veya ORDER_1234567890123"
                  className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      const input = e.target as HTMLInputElement;
                      if (input.value.trim()) {
                        checkTransactionStatus(input.value.trim());
                        setPaymentStatus(prev => ({ ...prev, transactionId: input.value.trim() }));
                      }
                    }
                  }}
                />
                <button
                  onClick={(e) => {
                    const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                    if (input && input.value.trim()) {
                      checkTransactionStatus(input.value.trim());
                      setPaymentStatus(prev => ({ ...prev, transactionId: input.value.trim() }));
                    }
                  }}
                  className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded-lg transition-colors"
                >
                  Kontrol Et
                </button>
              </div>
            </div>
          )}

          {/* Manuel Transaction ID girişi - her zaman göster */}
          <div className="mt-8 bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">
              {paymentStatus.transactionId ? 'Başka Transaction ID Kontrol Et' : 'Transaction ID ile Kontrol'}
            </h3>
            <p className="text-gray-300 mb-4">
              {paymentStatus.transactionId 
                ? 'Farklı bir işlem numarası kontrol etmek için:'
                : 'İşlem numaranız varsa aşağıya girerek durumunu kontrol edebilirsiniz:'
              }
            </p>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder="pub_1234567890123 veya ORDER_1234567890123"
                defaultValue={paymentStatus.transactionId || ''}
                className="flex-1 bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-yellow-500 focus:outline-none"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    const input = e.target as HTMLInputElement;
                    if (input.value.trim()) {
                      checkTransactionStatus(input.value.trim());
                      setPaymentStatus(prev => ({ ...prev, transactionId: input.value.trim() }));
                      setAutoPolling(false); // Stop current polling
                    }
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = (e.target as HTMLElement).previousElementSibling as HTMLInputElement;
                  if (input && input.value.trim()) {
                    checkTransactionStatus(input.value.trim());
                    setPaymentStatus(prev => ({ ...prev, transactionId: input.value.trim() }));
                    setAutoPolling(false); // Stop current polling
                  }
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-6 py-2 rounded-lg transition-colors"
              >
                Kontrol Et
              </button>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-8 bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-3">Yardıma mı ihtiyacınız var?</h3>
            <p className="text-gray-300 mb-4">
              Ödeme işleminizle ilgili herhangi bir sorun yaşıyorsanız, 7/24 müşteri hizmetlerimiz ile iletişime geçebilirsiniz.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="/help"
                className="text-yellow-400 hover:text-yellow-300 font-medium underline"
              >
                Yardım Merkezi
              </a>
              <a
                href="/contact"
                className="text-yellow-400 hover:text-yellow-300 font-medium underline"
              >
                İletişim
              </a>
              <a
                href="/support"
                className="text-yellow-400 hover:text-yellow-300 font-medium underline"
              >
                Canlı Destek
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 