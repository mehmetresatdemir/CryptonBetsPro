import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/utils/i18n-fixed';
import { motion, AnimatePresence } from 'framer-motion';

interface StoryHighlights2Props {
  initialValue?: number;
}

// Hikaye öğesi tipi
interface StoryItem {
  id: number;
  title: string;
  type: string;
  image?: string;
  color: string;
  iconClass: string; // İkon sınıfı eklendi
  description: string; // Açıklama eklendi
  bgColor: string; // Arkaplana ek renk
  seen?: boolean;
}

const StoryHighlights2: React.FC<StoryHighlights2Props> = () => {
  const { t, language } = useLanguage();
  
  // Hızlı erişim butonları
  const [stories] = useState<StoryItem[]>([
    { 
      id: 1, 
      title: 'Para Yatır', 
      type: 'deposit', 
      color: 'from-green-500 to-emerald-600',
      iconClass: 'fa-wallet',
      description: 'Hesabınıza hızlı para yatırın',
      bgColor: 'bg-green-900/20',
      seen: false 
    },
    { 
      id: 2, 
      title: 'Bonus Talep', 
      type: 'bonus', 
      color: 'from-yellow-500 via-amber-500 to-yellow-600',
      iconClass: 'fa-gift',
      description: 'Özel bonusları talep edin',
      bgColor: 'bg-yellow-900/20',
      seen: false 
    },
    { 
      id: 3, 
      title: 'Beni Ara', 
      type: 'callback', 
      color: 'from-blue-500 to-cyan-600',
      iconClass: 'fa-phone',
      description: 'Sizi hemen arayalım',
      bgColor: 'bg-blue-900/20',
      seen: false 
    },
    { 
      id: 4, 
      title: 'Canlı Destek', 
      type: 'support', 
      color: 'from-purple-500 to-indigo-600',
      iconClass: 'fa-headset',
      description: 'Canlı destek hattına bağlanın',
      bgColor: 'bg-purple-900/20',
      seen: false 
    },
    { 
      id: 5, 
      title: 'Kurallar', 
      type: 'rules', 
      color: 'from-red-500 to-pink-600',
      iconClass: 'fa-gavel',
      description: 'Site kuralları ve koşulları',
      bgColor: 'bg-red-900/20',
      seen: false 
    }
  ]);
  
  // Aktif hikaye
  const [activeStory, setActiveStory] = useState<number>(-1);
  
  // Sequential story highlighting
  useEffect(() => {
    let currentIndex = 0;
    const storyInterval = setInterval(() => {
      setActiveStory(currentIndex);
      currentIndex = (currentIndex + 1) % stories.length;
      
      // 1.5 saniye sonra vurgulamayı kaldır
      setTimeout(() => {
        setActiveStory(-1);
      }, 1500);
    }, 3000);
    
    return () => clearInterval(storyInterval);
  }, [stories.length]);
  
  // Özel animasyonlar için CSS
  useEffect(() => {
    if (!document.getElementById('story-animations')) {
      const style = document.createElement('style');
      style.id = 'story-animations';
      style.textContent = `
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(234, 179, 8, 0.4); }
          50% { box-shadow: 0 0 15px rgba(234, 179, 8, 0.7); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 6s linear infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
  
  // Hikaye tıklama işleyicisi
  const handleStoryClick = (story: StoryItem) => {
    console.log('Hikaye tıklandı:', story.title);
  };
  
  // Hızlı erişim içerik render fonksiyonu
  const renderStoryContent = (type: string) => {
    switch (type) {
      case 'deposit':
        return <span className="text-green-500 font-bold text-sm">
          {translate('home.stories.deposit', 'PARA YATIR')}
        </span>;
      case 'bonus':
        return <span className="text-yellow-500 font-bold text-xs">
          {translate('home.stories.bonus', 'BONUS TALEP')}
        </span>;
      case 'callback':
        return <span className="text-blue-400 font-bold text-xs">
          {translate('home.stories.callback', 'BENİ ARA')}
        </span>;
      case 'support':
        return <span className="text-purple-400 font-bold text-xs">
          {translate('home.stories.support', 'CANLI DESTEK')}
        </span>;
      case 'rules':
        return <span className="text-red-400 font-bold text-xs">
          {translate('home.stories.rules', 'KURALLAR')}
        </span>;
      default:
        return null;
    }
  };

  // Modal için durum
  const [showModal, setShowModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState<StoryItem | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  return (
    <div className="w-full h-full relative" ref={containerRef}>
      
      {/* Story Modal */}
      <AnimatePresence>
        {showModal && selectedStory && (
          <motion.div 
            className="fixed inset-0 z-60 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div 
              className="bg-[#121212] w-[90%] max-w-md rounded-xl overflow-hidden border border-yellow-500/20 shadow-lg relative"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className={`bg-gradient-to-r ${selectedStory.color} p-4 relative`}>
                <div className="absolute top-4 right-4">
                  <button 
                    className="w-7 h-7 rounded-full bg-black/30 border border-white/10 flex items-center justify-center text-white/80 hover:text-white"
                    onClick={() => setShowModal(false)}
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </div>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center mr-3 border border-white/10">
                    <i className={`fas ${selectedStory.iconClass} text-2xl text-white`}></i>
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold">
                      {selectedStory.type === 'deposit' && translate('home.stories.deposit', 'Para Yatır')}
                      {selectedStory.type === 'bonus' && translate('home.stories.bonus', 'Bonus Talep')}
                      {selectedStory.type === 'callback' && translate('home.stories.callback', 'Beni Ara')}
                      {selectedStory.type === 'support' && translate('home.stories.support', 'Canlı Destek')}
                      {selectedStory.type === 'rules' && translate('home.stories.rules', 'Kurallar')}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {selectedStory.type === 'deposit' && translate('home.stories.depositDesc')}
                      {selectedStory.type === 'bonus' && translate('home.stories.bonusDesc')}
                      {selectedStory.type === 'callback' && translate('home.stories.callbackDesc')}
                      {selectedStory.type === 'support' && translate('home.stories.supportDesc')}
                      {selectedStory.type === 'rules' && translate('home.stories.rulesDesc')}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Modal content - Tip bazlı içerik */}
              <div className="p-5">
                {selectedStory.type === 'callback' && (
                  <div>
                    <p className="text-gray-300 mb-4">
                      {translate('home.stories.callbackForm.description', 'Sizinle iletişime geçmemiz için lütfen telefon numaranızı ve uygun zamanı belirtin.')}
                    </p>
                    
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-white text-sm font-medium block">
                          {translate('home.stories.callbackForm.phoneLabel', 'Telefon Numarası')}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <i className="fas fa-phone text-gray-400"></i>
                          </div>
                          <input 
                            type="tel" 
                            className="w-full py-2.5 pl-10 pr-3 bg-[#252525] border border-[#333] rounded-lg focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 text-white placeholder-gray-500 text-sm"
                            placeholder="+90 5__ ___ __ __"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-white text-sm font-medium block">
                          {translate('home.stories.callbackForm.timeLabel', 'Aranmak İstediğiniz Zaman')}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <i className="fas fa-clock text-gray-400"></i>
                          </div>
                          <select 
                            className="w-full py-2.5 pl-10 pr-3 bg-[#252525] border border-[#333] rounded-lg focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 text-white appearance-none text-sm"
                          >
                            <option value="" disabled selected>
                              {translate('home.stories.callbackForm.selectTime', 'Zaman seçin')}
                            </option>
                            <option value="morning">
                              {translate('home.stories.callbackForm.morning', '09:00 - 12:00 (Sabah)')}
                            </option>
                            <option value="afternoon">
                              {translate('home.stories.callbackForm.afternoon', '12:00 - 17:00 (Öğleden Sonra)')}
                            </option>
                            <option value="evening">
                              {translate('home.stories.callbackForm.evening', '17:00 - 21:00 (Akşam)')}
                            </option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                          </div>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <motion.button
                          type="button"
                          className={`w-full py-3 bg-gradient-to-r ${selectedStory.color} text-white rounded-lg font-bold shadow-lg flex items-center justify-center space-x-2 relative overflow-hidden`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <i className={`fas ${selectedStory.iconClass} mr-2`}></i>
                          <span>
                            {translate('home.stories.callbackForm.callNow', 'HEMEN ARA')}
                          </span>
                          
                          {/* Shine effect */}
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-shine"></div>
                        </motion.button>
                        
                        <p className="text-xs text-gray-500 mt-3 text-center">
                          {translate('home.stories.callbackForm.privacy', 'Bilgileriniz KVKK kapsamında korunmaktadır. Arama talebiniz, mevcut çalışma saatleri içinde gerçekleştirilecektir.')}
                        </p>
                      </div>
                    </form>
                  </div>
                )}
                
                {selectedStory.type === 'bonus' && (
                  <div>
                    <p className="text-gray-300 mb-4">
                      {translate('home.stories.bonusForm.description', 'Size özel bonus tekliflerimizden faydalanmak için lütfen aşağıdaki bilgileri doldurun.')}
                    </p>
                    
                    <form className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-white text-sm font-medium block">
                          {translate('home.stories.bonusForm.bonusType', 'Bonus Türü')}
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <i className="fas fa-gift text-gray-400"></i>
                          </div>
                          <select 
                            className="w-full py-2.5 pl-10 pr-3 bg-[#252525] border border-[#333] rounded-lg focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 text-white appearance-none text-sm"
                          >
                            <option value="" disabled selected>
                              {translate('home.stories.bonusForm.selectBonus', 'Bonus seçin')}
                            </option>
                            <option value="welcome">
                              {translate('home.stories.bonusForm.welcomeBonus', 'Hoşgeldin Bonusu (%100)')}
                            </option>
                            <option value="deposit">
                              {translate('home.stories.bonusForm.depositBonus', 'Yatırım Bonusu (%50)')}
                            </option>
                            <option value="loyalty">
                              {translate('home.stories.bonusForm.loyaltyBonus', 'Sadakat Bonusu (250 TL)')}
                            </option>
                            <option value="special">
                              {translate('home.stories.bonusForm.vipBonus', 'VIP Özel Bonus')}
                            </option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                          </div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-white text-sm font-medium block">
                          {translate('home.stories.bonusForm.messageLabel', 'Talep Mesajı (İsteğe Bağlı)')}
                        </label>
                        <div className="relative">
                          <textarea 
                            className="w-full py-2.5 px-3 bg-[#252525] border border-[#333] rounded-lg focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 text-white placeholder-gray-500 text-sm min-h-[80px]"
                            placeholder={translate('home.stories.bonusForm.messagePlaceholder', 'Bonus talebiniz hakkında detaylarınızı yazabilirsiniz...')}
                          ></textarea>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <motion.button
                          type="button"
                          className={`w-full py-3 bg-gradient-to-r ${selectedStory.color} text-white rounded-lg font-bold shadow-lg flex items-center justify-center space-x-2 relative overflow-hidden`}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <i className={`fas ${selectedStory.iconClass} mr-2`}></i>
                          <span>
                            {translate('home.stories.bonusRequest.button', 'BONUS TALEP ET')}
                          </span>
                          
                          {/* Shine effect */}
                          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-shine"></div>
                        </motion.button>
                        
                        <p className="text-xs text-gray-500 mt-3 text-center">
                          {translate('home.stories.bonusRequest.disclaimer', 'Bonuslar hesabınıza en geç 24 saat içinde tanımlanacaktır. Bonus çevrim şartları ve kuralları geçerlidir.')}
                        </p>
                      </div>
                    </form>
                  </div>
                )}
                
                {selectedStory.type === 'rules' && (
                  <div>
                    <p className="text-gray-300 mb-4">
                      {translate('home.stories.rulesForm.description', 'Sitemizin kullanım koşulları ve kurallarını inceleyebilirsiniz.')}
                    </p>
                    
                    <div className="mb-6 space-y-4">
                      {/* Kurallar sekmesi */}
                      <div className="rounded-lg overflow-hidden border border-[#333] bg-[#1A1A1A]">
                        <div className="bg-gradient-to-r from-red-500 to-pink-600 px-4 py-2 flex items-center gap-2">
                          <i className="fas fa-shield-alt text-white"></i>
                          <h3 className="text-white font-semibold text-sm">
                            {translate('home.stories.rules.userResponsibilities', '1. Kullanıcı Sorumlulukları')}
                          </h3>
                        </div>
                        
                        <div className="p-4 space-y-2">
                          <div className="flex gap-2 text-xs text-gray-300">
                            <div className="flex-shrink-0 w-4 text-center">•</div>
                            <p>
                              {translate('home.stories.rules.ageConfirmation', 'Kullanıcılar, 18 yaşından büyük olduklarını onaylar.')}
                            </p>
                          </div>
                          <div className="flex gap-2 text-xs text-gray-300">
                            <div className="flex-shrink-0 w-4 text-center">•</div>
                            <p>
                              {translate('home.stories.rules.accountSecurity', 'Hesap bilgilerinin güvenliğinden kullanıcı sorumludur.')}
                            </p>
                          </div>
                          <div className="flex gap-2 text-xs text-gray-300">
                            <div className="flex-shrink-0 w-4 text-center">•</div>
                            <p>
                              {translate('home.stories.rules.singleAccount', 'Tek hesap kuralı geçerlidir, birden fazla hesap açmak yasaktır.')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Genel Kurallar */}
                      <div className="rounded-lg overflow-hidden border border-[#333] bg-[#1A1A1A]">
                        <div className="bg-gradient-to-r from-red-500 to-pink-600 px-4 py-2 flex items-center gap-2">
                          <i className="fas fa-gavel text-white"></i>
                          <h3 className="text-white font-semibold text-sm">
                            {translate('home.stories.rules.generalRules', '2. Genel Kurallar')}
                          </h3>
                        </div>
                        
                        <div className="p-4 space-y-2">
                          <div className="flex gap-2 text-xs text-gray-300">
                            <div className="flex-shrink-0 w-4 text-center">•</div>
                            <p>
                              {translate('home.stories.rules.noCheating', 'Hile, bot veya benzeri yazılımların kullanımı kesinlikle yasaktır.')}
                            </p>
                          </div>
                          <div className="flex gap-2 text-xs text-gray-300">
                            <div className="flex-shrink-0 w-4 text-center">•</div>
                            <p>
                              {translate('home.stories.rules.paymentTime', 'Bahis ödemelerinin 24 saat içinde yapılması gerekmektedir.')}
                            </p>
                          </div>
                          <div className="flex gap-2 text-xs text-gray-300">
                            <div className="flex-shrink-0 w-4 text-center">•</div>
                            <p>
                              {translate('home.stories.rules.abusePolicy', 'Kötüye kullanım tespit edildiğinde hesap kapatılabilir.')}
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Oyun Kuralları */}
                      <div className="rounded-lg overflow-hidden border border-[#333] bg-[#1A1A1A]">
                        <div className="bg-gradient-to-r from-red-500 to-pink-600 px-4 py-2 flex items-center gap-2">
                          <i className="fas fa-dice text-white"></i>
                          <h3 className="text-white font-semibold text-sm">
                            {translate('home.stories.rules.gameRules', '3. Oyun Kuralları')}
                          </h3>
                        </div>
                        
                        <div className="p-4 space-y-2">
                          <div className="flex gap-2 text-xs text-gray-300">
                            <div className="flex-shrink-0 w-4 text-center">•</div>
                            <p>
                              {translate('home.stories.rules.bonusWagering', 'Bonus kazançları çekim yapılmadan önce çevrim şartlarını tamamlamalıdır.')}
                            </p>
                          </div>
                          <div className="flex gap-2 text-xs text-gray-300">
                            <div className="flex-shrink-0 w-4 text-center">•</div>
                            <p>
                              {translate('home.stories.rules.bettingLimits', 'Her oyun için belirlenen bahis limitlerine uyulmalıdır.')}
                            </p>
                          </div>
                          <div className="flex gap-2 text-xs text-gray-300">
                            <div className="flex-shrink-0 w-4 text-center">•</div>
                            <p>
                              {translate('home.stories.rules.technicalErrors', 'Sistemde yaşanan teknik hatalardan kaynaklı kazançlar geçersiz sayılabilir.')}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <motion.button
                      className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-600 text-white rounded-lg font-bold shadow-lg flex items-center justify-center space-x-2 relative overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <i className="fas fa-check-circle mr-2"></i>
                      <span>
                        {translate('home.stories.rules.acceptButton', 'KABUL EDİYORUM')}
                      </span>
                      
                      {/* Shine effect */}
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-shine"></div>
                    </motion.button>
                    
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      {translate('home.stories.rules.agreementText', 'Sitemizi kullanarak tüm kuralları kabul etmiş sayılırsınız. Detaylı bilgi için lütfen Şartlar ve Koşullar sayfasını ziyaret edin.')}
                    </p>
                  </div>
                )}
                
                {(selectedStory.type !== 'callback' && selectedStory.type !== 'bonus' && selectedStory.type !== 'rules') && (
                  <div>
                    <p className="text-gray-300 mb-4">
                      {selectedStory.type === 'deposit' && translate('home.stories.deposit.description', 'Hesabınıza hızlı ve güvenli bir şekilde para yatırmak için ödeme yöntemlerimizden birini seçin.')}
                      {selectedStory.type === 'support' && translate('home.stories.support.description', 'Canlı destek ekibimiz sorularınızı yanıtlamak için 7/24 hizmetinizdedir.')}
                    </p>
                    
                    <motion.button
                      className={`w-full py-3 bg-gradient-to-r ${selectedStory.color} text-white rounded-lg font-bold shadow-lg flex items-center justify-center space-x-2 relative overflow-hidden`}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <i className={`fas ${selectedStory.iconClass} mr-2`}></i>
                      <span>{translate('home.stories.generalButton', 'HEMEN KULLAN')}</span>
                      
                      {/* Shine effect */}
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-shine"></div>
                    </motion.button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StoryHighlights2;