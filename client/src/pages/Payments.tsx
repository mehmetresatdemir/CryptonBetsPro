import React, { useState, useEffect } from 'react';
import { Wallet, CreditCard, Building, Bitcoin, Smartphone, DollarSign, TrendingUp, Clock, CheckCircle } from 'lucide-react';

// Import payment method logos
import paybolLogo from '@assets/paybol_1750335572656.webp';
import parolaparaLogo from '@assets/parolapara_1750335572659.webp';
import popyparaLogo from '@assets/popypara_1750335572660.webp';
import paparaLogo from '@assets/papara_1750335572661.webp';
import papelLogo from '@assets/papel_1750335572662.webp';
import pepLogo from '@assets/pep_1750335572663.webp';
import paratimLogo from '@assets/paratim_1750335572664.webp';
import paycoLogo from '@assets/payco_1750335572666.webp';

interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  minDeposit: number;
  maxDeposit: number;
  minWithdraw: number;
  maxWithdraw: number;
  processingTime: string;
  status: string;
  depositCount: number;
  withdrawCount: number;
  successRate: number;
}

export default function Payments() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'deposit' | 'withdraw'>('deposit');

  useEffect(() => {
    fetchPaymentMethods();
  }, []);

  const fetchPaymentMethods = async () => {
    try {
      const response = await fetch('/api/payment/methods');
      const data = await response.json();
      if (data.success) {
        setPaymentMethods(data.data);
      }
    } catch (error) {
      console.error('Payment methods error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getPaymentMethodIcon = (methodId: string, type: string) => {
    switch (methodId) {
      case 'havale':
      case 'bank_transfer':
        return <Building className="w-8 h-8" />;
      case 'kredikarti':
      case 'card':
        return <CreditCard className="w-8 h-8" />;
      case 'payco':
        return <img src={paycoLogo} alt="PayCo" className="w-8 h-8 object-contain" />;
      case 'pep':
        return <img src={pepLogo} alt="Pep" className="w-8 h-8 object-contain" />;
      case 'paratim':
        return <img src={paratimLogo} alt="Paratim" className="w-8 h-8 object-contain" />;
      case 'kripto':
      case 'cryptocurrency':
        return <Bitcoin className="w-8 h-8" />;
      case 'papara':
        return <img src={paparaLogo} alt="Papara" className="w-8 h-8 object-contain" />;
      case 'parolapara':
        return <img src={parolaparaLogo} alt="ParolaPara" className="w-8 h-8 object-contain" />;
      case 'popy':
        return <img src={popyparaLogo} alt="Popy" className="w-8 h-8 object-contain" />;
      case 'paybol':
        return <img src={paybolLogo} alt="PayBol" className="w-8 h-8 object-contain" />;
      case 'papel':
        return <img src={papelLogo} alt="Papel" className="w-8 h-8 object-contain" />;
      case 'digital_wallet':
      case 'ewallet':
      case 'payment_provider':
      case 'payment_gateway':
      case 'digital_payment':
        return <Wallet className="w-8 h-8" />;
      case 'mobile_payment':
        return <Smartphone className="w-8 h-8" />;
      default:
        return <Wallet className="w-8 h-8" />;
    }
  };

  const getMethodsForTab = (tab: 'deposit' | 'withdraw') => {
    if (tab === 'deposit') {
      return paymentMethods.filter(method => method.minDeposit > 0);
    } else {
      return paymentMethods.filter(method => method.minWithdraw > 0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            Ödeme Yöntemleri
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Güvenli ve hızlı para yatırma ve çekme işlemleri için 11 farklı ödeme yöntemi
          </p>
        </div>

        {/* Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-gray-800/50 rounded-xl p-1 flex">
            <button
              onClick={() => setSelectedTab('deposit')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedTab === 'deposit'
                  ? 'bg-yellow-500 text-black'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <DollarSign className="w-5 h-5 inline mr-2" />
              Para Yatırma
            </button>
            <button
              onClick={() => setSelectedTab('withdraw')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                selectedTab === 'withdraw'
                  ? 'bg-yellow-500 text-black'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              <TrendingUp className="w-5 h-5 inline mr-2" />
              Para Çekme
            </button>
          </div>
        </div>

        {/* Payment Methods Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            <span className="ml-4 text-white text-xl">Ödeme yöntemleri yükleniyor...</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {getMethodsForTab(selectedTab).map((method) => (
              <div
                key={method.id}
                className="bg-gradient-to-br from-gray-800/90 to-gray-900/90 rounded-2xl p-6 border border-gray-700 hover:border-yellow-500/50 transition-all duration-300 hover:transform hover:scale-105"
              >
                {/* Method Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-yellow-500/20 rounded-xl text-yellow-400">
                    {getPaymentMethodIcon(method.id, method.type)}
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{method.name}</h3>
                    <p className="text-gray-400 text-sm capitalize">{method.type.replace('_', ' ')}</p>
                  </div>
                </div>

                {/* Limits */}
                <div className="space-y-3 mb-6">
                  {selectedTab === 'deposit' && method.minDeposit > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Para Yatırma Limiti</span>
                      <span className="text-white font-semibold">
                        ₺{method.minDeposit.toLocaleString()} - ₺{method.maxDeposit.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {selectedTab === 'withdraw' && method.minWithdraw > 0 && (
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Para Çekme Limiti</span>
                      <span className="text-white font-semibold">
                        ₺{method.minWithdraw.toLocaleString()} - ₺{method.maxWithdraw.toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">İşlem Süresi</span>
                    <span className="text-green-400 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {method.processingTime}
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="border-t border-gray-700 pt-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Başarı Oranı</span>
                    <span className="text-green-400 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" />
                      %{(method.successRate * 100).toFixed(0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">
                      {selectedTab === 'deposit' ? 'Para Yatırma İşlemleri' : 'Para Çekme İşlemleri'}
                    </span>
                    <span className="text-blue-400">
                      {selectedTab === 'deposit' ? method.depositCount : method.withdrawCount} işlem
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="mt-6">
                  <button
                    className="w-full bg-gradient-to-r from-yellow-500 to-orange-500 text-black font-bold py-3 rounded-xl hover:from-yellow-400 hover:to-orange-400 transition-all duration-300"
                    onClick={() => {
                      if (selectedTab === 'deposit') {
                        window.location.href = '/deposit';
                      } else {
                        window.location.href = '/withdrawal';
                      }
                    }}
                  >
                    {selectedTab === 'deposit' ? 'Para Yatır' : 'Para Çek'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Methods Message */}
        {!loading && getMethodsForTab(selectedTab).length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-800 rounded-full flex items-center justify-center">
              <Wallet className="w-12 h-12 text-gray-500" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">
              {selectedTab === 'deposit' ? 'Para Yatırma' : 'Para Çekme'} Yöntemi Bulunamadı
            </h3>
            <p className="text-gray-400">
              Bu kategori için henüz aktif ödeme yöntemi bulunmuyor.
            </p>
          </div>
        )}

        {/* Features Section */}
        <div className="mt-20 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl p-8 border border-gray-700">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Neden CryptonBets?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Güvenli İşlemler</h3>
              <p className="text-gray-400">256-bit SSL şifreleme ile tüm işlemleriniz güvende</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <Clock className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Hızlı İşlem</h3>
              <p className="text-gray-400">En hızlı para yatırma ve çekme işlemleri</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-yellow-500/20 rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Düşük Komisyon</h3>
              <p className="text-gray-400">Rekabetçi komisyon oranları</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}