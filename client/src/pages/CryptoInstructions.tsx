import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { createCryptoDeposit } from '@/services/financeService';
import { toast } from '@/hooks/use-toast';
import { Bitcoin, Copy, Check, AlertCircle } from 'lucide-react';

const CryptoInstructions: React.FC = () => {
  const { user } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: 1000,
    crypto_type: 'bsc' as 'bsc' | 'eth' | 'tron',
    crypto_address: '' // Boş başlat - default adres sistemini test etmek için
  });
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Hata',
        description: 'Önce giriş yapmanız gerekiyor',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const cryptoDepositData = {
        payment_method_id: 'crypto' as const,
        amount: formData.amount,
        user: user.email,
        user_name: user.username,
        user_id: user.id.toString(),
        site_reference_number: `CRYPTO_${Date.now()}_${user.id}`,
        return_url: 'https://cryptonbets1.com/crypto-success',
        user_email: user.email,
        crypto_type: formData.crypto_type,
        crypto_address: formData.crypto_address
      };

      console.log('📤 Kripto para yatırma isteği:', cryptoDepositData);

      const response = await createCryptoDeposit(cryptoDepositData);
      
      setResult(response);
      
      if (response.success) {
        toast({
          title: 'Başarılı',
          description: response.message || 'Kripto para yatırma işlemi başlatıldı',
          variant: 'default'
        });
      } else {
        toast({
          title: 'Hata',
          description: response.error || 'Kripto para yatırma işlemi başarısız',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('❌ Kripto para yatırma hatası:', error);
      
      toast({
        title: 'Hata',
        description: 'Kripto para yatırma işlemi sırasında hata oluştu',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    
    toast({
      title: 'Kopyalandı',
      description: 'JSON panoya kopyalandı',
      variant: 'default'
    });
  };

  const sampleJson = {
    "payment_method_id": "crypto",
    "amount": formData.amount,
    "user": user?.email || "crypto@example.com",
    "user_name": user?.username || "Crypto User",
    "user_id": user?.id.toString() || "CRYPTO_123456789",
    "site_reference_number": `CRYPTO_${Date.now()}_${user?.id || '123456789'}`,
    "return_url": "https://cryptonbets1.com/crypto-success",
    "user_email": user?.email || "crypto@example.com",
    "crypto_type": formData.crypto_type,
    "crypto_address": formData.crypto_address || "[VARSAYILAN_ADRES_KULLANILACAK]"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8">
          <div className="flex items-center mb-6">
            <Bitcoin className="w-8 h-8 text-yellow-500 mr-3" />
            <h1 className="text-3xl font-bold text-white">Kripto Para Yatırma Test</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Test Formu</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Miktar (TL)
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: Number(e.target.value)})}
                      className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
                      min="100"
                      max="100000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Kripto Türü
                    </label>
                    <select
                      value={formData.crypto_type}
                      onChange={(e) => setFormData({...formData, crypto_type: e.target.value as 'bsc' | 'eth' | 'tron'})}
                      className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
                      required
                    >
                      <option value="bsc">BSC (Binance Smart Chain)</option>
                      <option value="eth">ETH (Ethereum)</option>
                      <option value="tron">TRON</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Kripto Cüzdan Adresi <span className="text-gray-400 text-xs">(İsteğe bağlı)</span>
                    </label>
                    <input
                      type="text"
                      value={formData.crypto_address}
                      onChange={(e) => setFormData({...formData, crypto_address: e.target.value})}
                      className="w-full p-3 bg-gray-600 border border-gray-500 rounded-lg text-white focus:ring-2 focus:ring-yellow-500"
                      placeholder={formData.crypto_type === 'tron' ? 'T... (İsteğe bağlı)' : '0x... (İsteğe bağlı)'}
                    />
                    <p className="text-xs text-blue-300 mt-1">
                      💡 Boş bırakırsanız CryptonBets varsayılan cüzdanı kullanılır
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !user}
                    className="w-full bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                  >
                    {isLoading ? 'İşlem Yapılıyor...' : 'Kripto Para Yatırma Test Et'}
                  </button>
                </form>
              </div>

              {/* Desteklenen Kripto Türleri */}
              <div className="bg-gray-700 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Desteklenen Kripto Türleri</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="bg-yellow-600 text-white px-2 py-1 rounded text-sm mr-3">BSC</span>
                    <span className="text-gray-300">Binance Smart Chain</span>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-blue-600 text-white px-2 py-1 rounded text-sm mr-3">ETH</span>
                    <span className="text-gray-300">Ethereum</span>
                  </div>
                  <div className="flex items-center">
                    <span className="bg-red-600 text-white px-2 py-1 rounded text-sm mr-3">TRON</span>
                    <span className="text-gray-300">Tron</span>
                  </div>
                </div>
                <div className="mt-4 p-3 bg-blue-900 rounded-lg">
                  <p className="text-blue-200 text-sm">
                    <strong>Yeni:</strong> Cüzdan adresi artık isteğe bağlı! Boş bırakırsanız sistem otomatik olarak CryptonBets varsayılan cüzdanını kullanır.
                  </p>
                </div>
              </div>
            </div>

            {/* JSON ve Sonuç */}
            <div className="space-y-6">
              {/* JSON Örneği */}
              <div className="bg-gray-700 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">API JSON Formatı</h3>
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(sampleJson, null, 2))}
                    className="flex items-center text-gray-400 hover:text-white transition-colors"
                  >
                    {copied ? (
                      <Check className="w-4 h-4 mr-1" />
                    ) : (
                      <Copy className="w-4 h-4 mr-1" />
                    )}
                    Kopyala
                  </button>
                </div>
                <pre className="bg-gray-800 p-4 rounded-lg text-sm text-gray-300 overflow-x-auto">
                  {JSON.stringify(sampleJson, null, 2)}
                </pre>
              </div>

              {/* Sonuç */}
              {result && (
                <div className="bg-gray-700 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-white mb-4">API Yanıtı</h3>
                  <div className={`p-4 rounded-lg ${result.success ? 'bg-green-900' : 'bg-red-900'}`}>
                    <div className="flex items-center mb-2">
                      <AlertCircle className={`w-5 h-5 mr-2 ${result.success ? 'text-green-400' : 'text-red-400'}`} />
                      <span className={`font-semibold ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                        {result.success ? 'Başarılı' : 'Hata'}
                      </span>
                    </div>
                    <pre className="text-sm text-gray-300 overflow-x-auto">
                      {JSON.stringify(result, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CryptoInstructions; 