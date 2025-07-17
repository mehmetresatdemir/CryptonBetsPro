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
}

export default function PaymentReturn() {
  const [location, setLocation] = useLocation();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'pending' });
  const [countdown, setCountdown] = useState(10);
  const [balanceInfo, setBalanceInfo] = useState<any>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);

  // 🔍 Bakiye kontrol fonksiyonu
  const checkUserBalance = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        setBalanceInfo({
          balance: userData.balance,
          totalDeposits: userData.totalDeposits,
          username: userData.username
        });
        console.log('💰 Güncel Bakiye:', userData.balance);
        return userData.balance;
      }
    } catch (error) {
      console.error('❌ Bakiye kontrol hatası:', error);
    }
    return null;
  };

  // 🔍 Transaction status kontrol fonksiyonu
  const checkTransactionStatus = async (transactionId: string) => {
    try {
      setIsCheckingStatus(true);
      const response = await fetch(`/api/public/deposit/status/${transactionId}`);
      if (response.ok) {
        const result = await response.json();
        console.log('📊 Transaction Status:', result);
        return result;
      }
    } catch (error) {
      console.error('❌ Transaction status kontrol hatası:', error);
    } finally {
      setIsCheckingStatus(false);
    }
    return null;
  };

  useEffect(() => {
    // 🔍 DEBUG: Tüm URL bilgilerini logla
    console.log('🔍 PaymentReturn DEBUG:');
    console.log('Current URL:', window.location.href);
    console.log('Search params:', window.location.search);
    console.log('Hash:', window.location.hash);
    
    // URL parametrelerini parse et
    const urlParams = new URLSearchParams(window.location.search);
    console.log('🔍 Parsed URL Parameters:');
    for (const [key, value] of urlParams.entries()) {
      console.log(`  ${key}: ${value}`);
    }

    const status = urlParams.get('status');
    const transactionId = urlParams.get('transaction_id');
    const amount = urlParams.get('amount');
    const currency = urlParams.get('currency') || 'TRY';
    const paymentMethod = urlParams.get('payment_method');
    const message = urlParams.get('message');

    // 🔍 DEBUG: Parse edilen değerleri logla
    console.log('🔍 Parsed Values:', {
      status,
      transactionId,
      amount,
      currency,
      paymentMethod,
      message
    });

    // Status'u güvenli şekilde parse et
    let parsedStatus: PaymentStatus['status'] = 'pending';
    if (status === 'success' || status === 'completed') {
      parsedStatus = 'success';
    } else if (status === 'failed' || status === 'error') {
      parsedStatus = 'failed';
    } else if (status === 'cancelled' || status === 'cancel') {
      parsedStatus = 'cancelled';
    }

    const newPaymentStatus = {
      status: parsedStatus,
      transactionId: transactionId || undefined,
      amount: amount ? parseFloat(amount) : undefined,
      currency,
      paymentMethod: paymentMethod || undefined,
      message: message || undefined
    };

    console.log('🔍 Final Payment Status:', newPaymentStatus);
    setPaymentStatus(newPaymentStatus);

    // Bakiye kontrol et
    checkUserBalance();

    // Transaction ID varsa status'unu kontrol et
    if (transactionId) {
      console.log('🔍 Transaction status kontrol ediliyor:', transactionId);
      checkTransactionStatus(transactionId);
    }

    // Otomatik yönlendirme countdown'u
    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setLocation('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [setLocation]);

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

            {/* 🔍 Debug ve Bakiye Kontrol Bölümü */}
            <div className="bg-gray-800/30 rounded-2xl p-6 mb-8 border border-gray-600">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                🔍 Debug & Bakiye Kontrol
              </h3>
              
              {/* Bakiye Bilgisi */}
              {balanceInfo && (
                <div className="bg-green-900/30 rounded-xl p-4 mb-4 border border-green-500/30">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-green-400 font-medium">Güncel Bakiye:</span>
                    <span className="text-green-300 font-bold text-xl">₺{balanceInfo.balance?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400 text-sm">Toplam Yatırım:</span>
                    <span className="text-gray-300 text-sm">₺{balanceInfo.totalDeposits?.toLocaleString()}</span>
                  </div>
                </div>
              )}

              {/* URL Debug Bilgileri */}
              <div className="bg-blue-900/30 rounded-xl p-4 mb-4 border border-blue-500/30">
                <details>
                  <summary className="text-blue-400 cursor-pointer hover:text-blue-300">
                    🌐 URL Parametreleri (Debug)
                  </summary>
                  <div className="mt-3 space-y-2 text-sm">
                    <div><span className="text-gray-400">URL:</span> <span className="text-blue-300 font-mono text-xs break-all">{window.location.href}</span></div>
                    <div><span className="text-gray-400">Search:</span> <span className="text-blue-300 font-mono">{window.location.search || 'Yok'}</span></div>
                    <div><span className="text-gray-400">Hash:</span> <span className="text-blue-300 font-mono">{window.location.hash || 'Yok'}</span></div>
                  </div>
                </details>
              </div>

              {/* Manuel Kontrol Butonları */}
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={checkUserBalance}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Bakiye Yenile
                </button>
                
                {paymentStatus.transactionId && (
                  <button
                    onClick={() => checkTransactionStatus(paymentStatus.transactionId!)}
                    disabled={isCheckingStatus}
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    {isCheckingStatus ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <CreditCard className="w-4 h-4" />
                    )}
                    İşlem Durumu Kontrol Et
                  </button>
                )}

                <button
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Sayfayı Yenile
                </button>
              </div>

              {/* Callback Bekleme Mesajı */}
              <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-500/30 rounded-lg">
                <p className="text-yellow-300 text-sm">
                  💡 <strong>Bilgi:</strong> MetaPay iframe'i kapattıktan sonra callback otomatik gelir. 
                  Bakiye güncellenmesi 1-2 dakika sürebilir.
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setLocation('/')}
                className="flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-semibold py-3 px-8 rounded-xl hover:from-yellow-400 hover:to-orange-400 transition-all duration-300 hover:transform hover:scale-105"
              >
                <Home className="w-5 h-5" />
                Ana Sayfa
              </button>
              
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

            {/* Auto Redirect Countdown */}
            <div className="mt-8 text-gray-400 text-sm">
              {countdown} saniye sonra ana sayfaya yönlendirileceksiniz...
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