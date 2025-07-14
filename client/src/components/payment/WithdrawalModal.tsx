import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  X, CreditCard, AlertCircle, CheckCircle, Clock, ChevronLeft, ChevronRight,
  Building2, Wallet, Smartphone, Bitcoin, Coins, FileText, Key, Zap
} from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { withdrawalService, PaymentMethod, WithdrawalRequest } from '@/services/withdrawalService';

interface WithdrawalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const WithdrawalModal: React.FC<WithdrawalModalProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const { toast } = useToast();
  
  const [step, setStep] = useState<'method' | 'form' | 'confirm' | 'processing' | 'success' | 'error'>('method');
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod | null>(null);
  const [amount, setAmount] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [transactionId, setTransactionId] = useState('');
  const [error, setError] = useState('');
  
  // Form verileri
  const [formData, setFormData] = useState<any>({});
  
  const [withdrawalLimits, setWithdrawalLimits] = useState({
    min: 50,
    max: 50000,
    daily: 50000,
    monthly: 500000,
    dailyUsed: 0,
    monthlyUsed: 0
  });

  // Modal açıldığında limitleri yükle ve reset
  useEffect(() => {
    if (isOpen) {
      loadWithdrawalLimits();
      resetForm();
    }
  }, [isOpen]);

  const loadWithdrawalLimits = async () => {
    try {
      const limits = await withdrawalService.getWithdrawalLimits();
      setWithdrawalLimits(limits);
    } catch (error) {
      console.error('Limitler yüklenirken hata:', error);
    }
  };

  const resetForm = () => {
    setStep('method');
    setSelectedMethod(null);
    setAmount('');
    setFormData({});
    setError('');
    setTransactionId('');
    setIsProcessing(false);
  };

  const handleMethodSelect = (method: PaymentMethod) => {
    setSelectedMethod(method);
    setStep('form');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !selectedMethod) {
      setError('Lütfen tüm alanları doldurun');
      return;
    }

    const numAmount = parseFloat(amount);
    
    if (numAmount < selectedMethod.minAmount) {
      setError(`Minimum çekim tutarı ₺${selectedMethod.minAmount}`);
      return;
    }

    if (numAmount > selectedMethod.maxAmount) {
      setError(`Maksimum çekim tutarı ₺${selectedMethod.maxAmount}`);
      return;
    }

    if (numAmount > (user?.balance || 0)) {
      setError('Yetersiz bakiye');
      return;
    }

    // Gerekli alanların doldurulup doldurulmadığını kontrol et
    const missingFields = selectedMethod.requiredFields.filter(field => {
      const value = formData[field];
      return !value || value.trim() === '';
    });

    if (missingFields.length > 0) {
      setError('Lütfen tüm gerekli alanları doldurun');
      return;
    }

    setStep('confirm');
    setError('');
  };

  const confirmWithdrawal = async () => {
    if (!selectedMethod) return;
    
    setIsProcessing(true);
    setStep('processing');
    
    try {
      const withdrawalData: WithdrawalRequest = {
        amount: parseFloat(amount),
        payment_method_id: selectedMethod.id,
        user_id: user?.id?.toString() || '',
        user_name: user?.username || '',
        user: user?.username || '',
        site_reference_number: `WD${Date.now()}`,
        return_url: `${window.location.origin}/profile`,
        ...formData
      };

      // Specific field mapping based on method
      if (selectedMethod.id === 'papara') {
        withdrawalData.iban = formData.papara_id;
      } else if (selectedMethod.id === 'pep') {
        withdrawalData.iban = formData.pep_id;
      } else if (selectedMethod.id === 'paratim') {
        withdrawalData.iban = formData.paratim_id;
      } else if (selectedMethod.id === 'crypto') {
        withdrawalData.iban = formData.crypto_address;
      } else if (selectedMethod.id === 'popy') {
        withdrawalData.iban = formData.popy_id;
      } else if (selectedMethod.id === 'papel') {
        withdrawalData.iban = formData.papel_id;
      } else if (selectedMethod.id === 'parolapara') {
        withdrawalData.iban = formData.parolapara_id;
      } else if (selectedMethod.id === 'paybol') {
        withdrawalData.iban = formData.paybol_id;
      }

      const response = await withdrawalService.createWithdrawal(withdrawalData);
      
      if (response.success) {
        setTransactionId(response.transaction_id || '');
        setStep('success');
        toast({
          title: 'Para çekme talebi oluşturuldu',
          description: `Talebiniz incelemeye alındı. ${selectedMethod.processingTime} içinde işlem tamamlanacak.`,
        });
      } else {
        setError(response.message || 'Para çekme talebi oluşturulamadı');
        setStep('error');
      }
    } catch (error: any) {
      setError(error.message || 'Beklenmedik bir hata oluştu');
      setStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      resetForm();
      onClose();
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isProcessing) {
      handleClose();
    }
  };

  const getFieldLabel = (field: string) => {
    const labels: { [key: string]: string } = {
      iban: 'IBAN',
      bank_name: 'Banka Adı',
      user_full_name: 'Ad Soyad',
      papara_id: 'Papara ID',
      pay_co_id: 'Pay-Co ID',
      pay_co_full_name: 'Pay-Co Ad Soyad',
      pep_id: 'Pep ID',
      tc_number: 'TC Kimlik No',
      paratim_id: 'Paratim ID',
      crypto_address: 'Kripto Adresi',
      popy_id: 'Popy ID',
      papel_id: 'Papel ID',
      parolapara_id: 'Parolapara ID',
      paybol_id: 'Paybol ID'
    };
    return labels[field] || field;
  };

  const getFieldPlaceholder = (field: string) => {
    const placeholders: { [key: string]: string } = {
      iban: 'TR330006100519786457841326',
      bank_name: 'Garanti BBVA',
      user_full_name: 'Ahmet Yılmaz',
      papara_id: '1234567890',
      pay_co_id: '1234567',
      pay_co_full_name: 'Ahmet Yılmaz',
      pep_id: '123456789',
      tc_number: '11111111110',
      paratim_id: '1234567890',
      crypto_address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
      popy_id: '1234567890',
      papel_id: '1234567890',
      parolapara_id: '1234567890',
      paybol_id: '1234567890'
    };
    return placeholders[field] || '';
  };

  const getFieldMaxLength = (field: string) => {
    const maxLengths: { [key: string]: number } = {
      iban: 26,
      papara_id: 10,
      pep_id: 9,
      tc_number: 11,
      paratim_id: 10,
      popy_id: 10,
      papel_id: 10,
      parolapara_id: 10,
      paybol_id: 10
    };
    return maxLengths[field];
  };

  // Icon mapping function
  const getMethodIcon = (iconName: string) => {
    const iconMap: { [key: string]: React.ComponentType<any> } = {
      'Building2': Building2,
      'CreditCard': CreditCard,
      'Wallet': Wallet,
      'Smartphone': Smartphone,
      'Clock': Clock,
      'Bitcoin': Bitcoin,
      'Coins': Coins,
      'FileText': FileText,
      'Key': Key,
      'Zap': Zap
    };
    
    const IconComponent = iconMap[iconName] || CreditCard;
    return <IconComponent className="w-6 h-6" />;
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-[9999]"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-yellow-500/30 relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-400 p-6 text-white relative">
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
          
          <div className="flex items-center gap-3">
            <CreditCard className="w-8 h-8" />
            <div>
              <h2 className="text-2xl font-bold">Para Çekme</h2>
              <p className="text-white/80">
                {step === 'method' && 'Ödeme yöntemi seçin'}
                {step === 'form' && 'Bilgileri doldurun'}
                {step === 'confirm' && 'Talebi onaylayın'}
                {step === 'processing' && 'İşlem gönderiliyor'}
                {step === 'success' && 'İşlem tamamlandı'}
                {step === 'error' && 'Hata oluştu'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'method' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-white mb-2">Çekim Yöntemi Seçin</h3>
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-sm text-gray-400 mb-1">Kullanılabilir Bakiye</div>
                  <div className="text-2xl font-bold text-white">₺{user?.balance?.toLocaleString() || '0'}</div>
                </div>
              </div>

              <div className="grid gap-3 max-h-96 overflow-y-auto">
                {withdrawalService.getWithdrawalMethods().map((method) => (
                  <button
                    key={method.id}
                    onClick={() => handleMethodSelect(method)}
                    className="p-4 border border-gray-700 rounded-lg hover:border-green-500 hover:bg-green-500/10 transition-all text-left"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white">
                        {getMethodIcon(method.icon)}
                      </div>
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{method.name}</h4>
                        <p className="text-gray-400 text-sm">{method.description}</p>
                        <div className="flex gap-4 mt-1">
                          <span className="text-xs text-green-400">₺{method.minAmount} - ₺{method.maxAmount.toLocaleString()}</span>
                          <span className="text-xs text-blue-400">{method.processingTime}</span>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 'form' && selectedMethod && (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => setStep('method')}
                  className="text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-bold text-white">{selectedMethod.name}</h3>
              </div>

              {/* Tutar */}
              <div>
                <label className="block text-white font-medium mb-2">
                  Çekim Tutarı (₺)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min={selectedMethod.minAmount}
                  max={selectedMethod.maxAmount}
                  placeholder={`${selectedMethod.minAmount} - ${selectedMethod.maxAmount.toLocaleString()}`}
                  className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none"
                  required
                />
              </div>

              {/* Dinamik formlar */}
              {selectedMethod.requiredFields.map((field) => (
                <div key={field}>
                  <label className="block text-white font-medium mb-2">
                    {getFieldLabel(field)}
                    {field === 'tc_number' && <span className="text-red-400 ml-1">*</span>}
                  </label>
                  <input
                    type="text"
                    value={formData[field] || ''}
                    onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
                    placeholder={getFieldPlaceholder(field)}
                    maxLength={getFieldMaxLength(field)}
                    className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none"
                    required
                  />
                </div>
              ))}

              {/* Bilgilendirme */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="text-sm text-blue-400 mb-2">
                  <AlertCircle className="w-4 h-4 inline mr-1" />
                  Ödeme Bilgileri
                </div>
                <ul className="text-xs text-gray-300 space-y-1">
                  <li>• Minimum: ₺{selectedMethod.minAmount}</li>
                  <li>• Maksimum: ₺{selectedMethod.maxAmount.toLocaleString()}</li>
                  <li>• İşlem süresi: {selectedMethod.processingTime}</li>
                  <li>• Günlük kalan: ₺{(withdrawalLimits.daily - withdrawalLimits.dailyUsed).toLocaleString()}</li>
                </ul>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <div className="text-red-400 text-sm">{error}</div>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-bold hover:from-green-500 hover:to-green-400 transition-all duration-300"
              >
                Devam Et
              </button>
            </form>
          )}

          {step === 'confirm' && selectedMethod && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <button
                  onClick={() => setStep('form')}
                  className="text-gray-400 hover:text-white"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-bold text-white">Talebi Onayla</h3>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Yöntem:</span>
                  <span className="text-white font-bold">{selectedMethod.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Tutar:</span>
                  <span className="text-white font-bold">₺{parseFloat(amount).toLocaleString()}</span>
                </div>
                {selectedMethod.requiredFields.map((field) => (
                  <div key={field} className="flex justify-between">
                    <span className="text-gray-400">{getFieldLabel(field)}:</span>
                    <span className="text-white">{formData[field]}</span>
                  </div>
                ))}
                <div className="flex justify-between">
                  <span className="text-gray-400">İşlem Süresi:</span>
                  <span className="text-white">{selectedMethod.processingTime}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
                >
                  Geri
                </button>
                <button
                  onClick={confirmWithdrawal}
                  className="flex-1 py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-bold hover:from-green-500 hover:to-green-400 transition-all duration-300"
                >
                  Onayla
                </button>
              </div>
            </div>
          )}

          {step === 'processing' && (
            <div className="text-center py-8">
              <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-spin" />
              <h3 className="text-xl font-bold text-white mb-2">İşlem Gönderiliyor</h3>
              <p className="text-gray-400">Lütfen bekleyin...</p>
            </div>
          )}

          {step === 'success' && selectedMethod && (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Talep Oluşturuldu</h3>
              <p className="text-gray-400 mb-4">
                Para çekme talebiniz başarıyla oluşturuldu. İşlem {selectedMethod.processingTime} içinde tamamlanacak.
              </p>
              {transactionId && (
                <div className="bg-gray-800 rounded-lg p-3 mb-4">
                  <span className="text-gray-400">İşlem ID: </span>
                  <span className="text-white font-mono">{transactionId}</span>
                </div>
              )}
              <button
                onClick={handleClose}
                className="w-full py-3 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg font-bold hover:from-green-500 hover:to-green-400 transition-all duration-300"
              >
                Kapat
              </button>
            </div>
          )}

          {step === 'error' && (
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Hata Oluştu</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setStep('form')}
                  className="flex-1 py-3 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-500 transition-colors"
                >
                  Tekrar Dene
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-500 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default WithdrawalModal; 