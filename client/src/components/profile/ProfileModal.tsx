import { useState, useRef } from 'react';
import { X, Upload, User, Gift, History, FileText, Star, Shield, CreditCard, Calendar, Trophy, Crown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ProfileModal = ({ isOpen, onClose }: ProfileModalProps) => {
  const { translate } = useLanguage();
  const { user } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isUploading, setIsUploading] = useState(false);
  const [kycStatus, setKycStatus] = useState('pending');
  const frontImageRef = useRef<HTMLInputElement>(null);
  const backImageRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = async (file: File, type: 'front' | 'back') => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', type);

      const response = await apiRequest('POST', '/api/auth/upload-kyc', formData);
      
      if (response.ok) {
        toast({
          title: t('kyc.upload_success'),
          description: t('kyc.upload_success_desc'),
        });
      }
    } catch (error) {
      toast({
        title: t('kyc.upload_error'),
        description: t('kyc.upload_error_desc'),
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: t('profile.personal_info') || 'Kişisel Bilgiler', icon: User },
    { id: 'kyc', label: t('profile.verification') || 'Kimlik Doğrulama', icon: Shield },
    { id: 'transactions', label: t('profile.transactions') || 'İşlemler', icon: CreditCard },
    { id: 'bonuses', label: t('profile.bonuses') || 'Bonuslar', icon: Gift },
    { id: 'history', label: t('profile.game_history') || 'Oyun Geçmişi', icon: History },
    { id: 'vip', label: t('profile.vip_status') || 'VIP Durum', icon: Crown },
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-[#1A1A1A] to-[#0D1117] rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-gray-800">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h2 className="text-2xl font-bold text-white">{t('profile.title') || 'Profil'}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex h-[calc(90vh-100px)]">
          <div className="w-1/4 bg-[#0D1117] border-r border-gray-800 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 p-3 rounded-lg transition-all duration-200 ${
                      activeTab === tab.id
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    <Icon size={20} />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="flex-1 p-6 overflow-y-auto">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <User className="mr-2" size={24} />
                    {t('profile.personal_info') || 'Kişisel Bilgiler'}
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        {t('profile.username') || 'Kullanıcı Adı'}
                      </label>
                      <input
                        type="text"
                        value={user?.username || ''}
                        disabled
                        className="w-full p-3 bg-[#232323] border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-400 mb-2">
                        {t('profile.email') || 'E-posta'}
                      </label>
                      <input
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="w-full p-3 bg-[#232323] border border-gray-700 rounded-lg text-white"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'kyc' && (
              <div className="space-y-6">
                <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Shield className="mr-2" size={24} />
{t('kyc.title') || 'Kimlik Doğrulama'}
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h4 className="font-semibold text-white">{t('kyc.front_document') || 'Ön Yüz Belgesi'}</h4>
                      <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                        <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                        <p className="text-gray-400 mb-4">{t('kyc.upload_front') || 'Kimlik kartınızın ön yüzünü yükleyin'}</p>
                        <input
                          ref={frontImageRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'front');
                          }}
                        />
                        <button
                          onClick={() => frontImageRef.current?.click()}
                          disabled={isUploading}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isUploading ? (t('kyc.uploading') || 'Yükleniyor...') : (t('kyc.choose_file') || 'Dosya Seç')}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="font-semibold text-white">{t('kyc.back_document') || 'Arka Yüz Belgesi'}</h4>
                      <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
                        <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                        <p className="text-gray-400 mb-4">{t('kyc.upload_back') || 'Kimlik kartınızın arka yüzünü yükleyin'}</p>
                        <input
                          ref={backImageRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file, 'back');
                          }}
                        />
                        <button
                          onClick={() => backImageRef.current?.click()}
                          disabled={isUploading}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                        >
                          {isUploading ? (t('kyc.uploading') || 'Yükleniyor...') : (t('kyc.choose_file') || 'Dosya Seç')}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-yellow-900/20 border border-yellow-700 rounded-lg">
                    <p className="text-yellow-200 text-sm">
                      {t('kyc.verification_note') || 'Kimlik doğrulama işlemi 24-48 saat içinde tamamlanacaktır.'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'transactions' && (
              <div className="space-y-6">
                <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <CreditCard className="mr-2" size={24} />
                    {t('profile.transactions')}
                  </h3>
                  <div className="text-center py-12">
                    <FileText className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-400">{t('profile.no_transactions')}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bonuses' && (
              <div className="space-y-6">
                <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <Gift className="mr-2" size={24} />
                    {t('profile.bonuses')}
                  </h3>
                  <div className="text-center py-12">
                    <Gift className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-400">{t('profile.no_bonuses')}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-6">
                <div className="bg-[#1A1A1A] rounded-xl p-6 border border-gray-800">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                    <History className="mr-2" size={24} />
                    {t('profile.game_history')}
                  </h3>
                  <div className="text-center py-12">
                    <History className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-400">{t('profile.no_history')}</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'vip' && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-yellow-900/20 to-amber-900/20 rounded-xl p-6 border border-yellow-700">
                  <h3 className="text-xl font-bold text-yellow-400 mb-4 flex items-center">
                    <Crown className="mr-2" size={24} />
                    {t('profile.vip_status')}
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-semibold">{t('profile.current_level')}: Bronze</p>
                      <p className="text-gray-400 text-sm">{t('profile.points_to_silver')}: 850</p>
                    </div>
                    <div className="text-right">
                      <Trophy className="inline-block text-yellow-400" size={32} />
                    </div>
                  </div>
                  <div className="mt-4 bg-gray-800 rounded-full h-2">
                    <div className="bg-yellow-400 h-2 rounded-full" style={{ width: '15%' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;