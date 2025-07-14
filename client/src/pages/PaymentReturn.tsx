import React, { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { CheckCircle, XCircle, Clock, Home, CreditCard, AlertTriangle } from 'lucide-react';

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

  useEffect(() => {
    // URL parametrelerini parse et
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get('status');
    const transactionId = urlParams.get('transaction_id');
    const amount = urlParams.get('amount');
    const currency = urlParams.get('currency') || 'TRY';
    const paymentMethod = urlParams.get('payment_method');
    const message = urlParams.get('message');

    // Status'u güvenli şekilde parse et
    let parsedStatus: PaymentStatus['status'] = 'pending';
    if (status === 'success' || status === 'completed') {
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