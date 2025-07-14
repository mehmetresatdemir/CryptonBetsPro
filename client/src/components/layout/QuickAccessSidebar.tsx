import React, { useState, useEffect } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { translate, getCurrentLanguage } from '@/utils/i18n-fixed';
import { useUser } from '@/contexts/UserContext';
import DepositModal from '@/components/payment/DepositModal';
import BonusModal from '@/components/bonuses/BonusModal';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Gift, 
  Coins,
  ChevronRight,
  Bell,
  Target,
  Sparkles,
  Phone,
  MessageCircle
} from 'lucide-react';

interface QuickAccessSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickAccessSidebar: React.FC<QuickAccessSidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const { t, language } = useLanguage();
  
  // Modal states
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isBonusModalOpen, setIsBonusModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isCallbackModalOpen, setIsCallbackModalOpen] = useState(false);

  // Quick action shortcuts
  const shortcuts = [
    {
      id: 'deposit',
      title: language === 'tr' ? 'Para Yatır' : t('finance.deposit'),
      description: language === 'tr' ? 'Hızlı para yatırma' : 'Quick deposit',
      icon: Coins,
      color: 'from-green-500 to-emerald-500',
      action: 'deposit'
    },
    {
      id: 'bonus',
      title: language === 'tr' ? 'Bonus Talep Et' : 'Request Bonus',
      description: language === 'tr' ? 'Özel bonuslar' : 'Special bonuses',
      icon: Gift,
      color: 'from-purple-500 to-pink-500',
      action: 'bonus'
    },
    {
      id: 'callback',
      title: language === 'tr' ? 'Beni Ara' : 'Call Me',
      description: language === 'tr' ? 'Geri arama talebi' : 'Callback request',
      icon: Phone,
      color: 'from-blue-500 to-indigo-500',
      action: 'callback'
    },
    {
      id: 'support',
      title: language === 'tr' ? 'Canlı Destek' : 'Live Support',
      description: language === 'tr' ? '7/24 yardım' : '24/7 help',
      icon: MessageCircle,
      color: 'from-orange-500 to-red-500',
      action: 'support'
    },
    {
      id: 'rules',
      title: language === 'tr' ? 'Kurallar' : 'Rules',
      description: language === 'tr' ? 'Site kuralları' : 'Site rules',
      icon: Target,
      color: 'from-gray-500 to-slate-500',
      href: '/rules'
    }
  ];



  // Handle shortcut actions
  const handleShortcutClick = (shortcut: any) => {
    switch (shortcut.action) {
      case 'deposit':
        setIsDepositModalOpen(true);
        onClose();
        break;
      case 'bonus':
        setIsBonusModalOpen(true);
        onClose();
        break;
      case 'callback':
        setIsCallbackModalOpen(true);
        onClose();
        break;
      case 'support':
        setIsSupportModalOpen(true);
        onClose();
        break;
      default:
        if (shortcut.href) {
          window.location.href = shortcut.href;
          onClose();
        }
    }
  };

  // Footer button handlers
  const handleDepositClick = () => {
    setIsDepositModalOpen(true);
    onClose();
  };

  const handleNotificationClick = () => {
    alert(language === 'tr' ? 'Bildirimler yakında gelecek!' : 'Notifications coming soon!');
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />
      
      {/* Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-96 bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 border-l border-yellow-500/20 shadow-2xl z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-yellow-500/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-500 to-amber-500 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-black" />
            </div>
            <h2 className="text-lg font-bold text-white">
              {language === 'tr' ? 'Hızlı Erişim' : 'Quick Access'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>



        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-yellow-400 mb-3">
              {language === 'tr' ? 'Hızlı Kısayollar' : 'Quick Shortcuts'}
            </h3>
            {shortcuts.map((shortcut) => (
              <button
                key={shortcut.id}
                onClick={() => handleShortcutClick(shortcut)}
                className="w-full text-left group"
              >
                <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-800/30 hover:bg-gray-700/50 transition-all duration-200 border border-gray-700/50 hover:border-yellow-500/30">
                  <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${shortcut.color} flex items-center justify-center`}>
                    <shortcut.icon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-white group-hover:text-yellow-400 transition-colors">
                      {shortcut.title}
                    </div>
                    <div className="text-xs text-gray-400">
                      {shortcut.description}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-yellow-400 transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Quick Actions */}
        <div className="p-4 border-t border-yellow-500/10">
          <div className="grid grid-cols-2 gap-2">
            <button 
              onClick={handleDepositClick}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 transition-colors"
            >
              <Coins className="w-4 h-4" />
              {language === 'tr' ? 'Yatır' : t('finance.deposit')}
            </button>
            <button 
              onClick={handleNotificationClick}
              className="flex items-center justify-center gap-2 py-2 px-3 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              <Bell className="w-4 h-4" />
              {language === 'tr' ? 'Bildirim' : 'Notify'}
            </button>
          </div>
        </div>
      </div>

      {/* Modals */}
      <DepositModal 
        isOpen={isDepositModalOpen} 
        onClose={() => setIsDepositModalOpen(false)} 
      />

      {/* Support Modal */}
      <AnimatePresence>
        {isSupportModalOpen && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSupportModalOpen(false)}
          >
            <motion.div 
              className="bg-[#121212] w-[90%] max-w-md rounded-xl overflow-hidden border border-yellow-500/20 shadow-lg relative"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="bg-gradient-to-r from-blue-500 to-cyan-600 p-4 relative">
                <div className="absolute top-4 right-4">
                  <button 
                    className="w-7 h-7 rounded-full bg-black/30 border border-white/10 flex items-center justify-center text-white/80 hover:text-white"
                    onClick={() => setIsSupportModalOpen(false)}
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </div>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center mr-3 border border-white/10">
                    <i className="fas fa-headset text-2xl text-white"></i>
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold">
                      {language === 'tr' ? 'Canlı Destek' : 'Live Support'}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {language === 'tr' ? 'Canlı destek hattına bağlanın' : 'Connect to live support'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Modal content */}
              <div className="p-5">
                <p className="text-gray-300 mb-4">
                  {language === 'tr' ? 'Canlı destek sistemi yakında aktif olacak. Şimdilik WhatsApp üzerinden destek alabilirsiniz.' : 'Live support system will be active soon. You can get support via WhatsApp for now.'}
                </p>
                
                <div className="space-y-3">
                  <motion.button
                    onClick={() => window.open('https://wa.me/905555555555', '_blank')}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-bold shadow-lg flex items-center justify-center space-x-2 relative overflow-hidden"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <i className="fab fa-whatsapp mr-2"></i>
                    <span>WhatsApp Destek</span>
                  </motion.button>
                  
                  <button
                    onClick={() => setIsSupportModalOpen(false)}
                    className="w-full py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                  >
                    {language === 'tr' ? 'Kapat' : t('action.close')}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Callback Modal */}
      <AnimatePresence>
        {isCallbackModalOpen && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCallbackModalOpen(false)}
          >
            <motion.div 
              className="bg-[#121212] w-[90%] max-w-md rounded-xl overflow-hidden border border-yellow-500/20 shadow-lg relative"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="bg-gradient-to-r from-purple-500 to-pink-600 p-4 relative">
                <div className="absolute top-4 right-4">
                  <button 
                    className="w-7 h-7 rounded-full bg-black/30 border border-white/10 flex items-center justify-center text-white/80 hover:text-white"
                    onClick={() => setIsCallbackModalOpen(false)}
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </div>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center mr-3 border border-white/10">
                    <i className="fas fa-phone text-2xl text-white"></i>
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold">
                      {language === 'tr' ? 'Beni Ara' : 'Call Me Back'}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {language === 'tr' ? 'Sizi hemen arayalım' : 'We will call you back'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Modal content */}
              <div className="p-5">
                <p className="text-gray-300 mb-4">
                  {language === 'tr' ? 'Sizinle iletişime geçmemiz için lütfen telefon numaranızı ve uygun zamanı belirtin.' : 'Please provide your phone number and preferred time for us to contact you.'}
                </p>
                
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium block">
                      {language === 'tr' ? 'Telefon Numarası' : 'Phone Number'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <i className="fas fa-phone text-gray-400"></i>
                      </div>
                      <input 
                        type="tel" 
                        defaultValue={user?.phone || ''}
                        className="w-full py-2.5 pl-10 pr-3 bg-[#252525] border border-[#333] rounded-lg focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 text-white placeholder-gray-500 text-sm"
                        placeholder={language === 'tr' ? '+90 5__ ___ __ __' : '+1 (___) ___-____'}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium block">
                      {language === 'tr' ? 'Aranmak İstediğiniz Zaman' : 'Preferred Time to Call'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <i className="fas fa-clock text-gray-400"></i>
                      </div>
                      <select 
                        className="w-full py-2.5 pl-10 pr-3 bg-[#252525] border border-[#333] rounded-lg focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 text-white appearance-none text-sm"
                      >
                        <option value="" disabled selected>
                          {language === 'tr' ? 'Zaman seçin' : 'Select time'}
                        </option>
                        <option value="morning">
                          {language === 'tr' ? 'Sabah (09:00 - 12:00)' : 'Morning (09:00 - 12:00)'}
                        </option>
                        <option value="afternoon">
                          {language === 'tr' ? 'Öğleden Sonra (12:00 - 18:00)' : 'Afternoon (12:00 - 18:00)'}
                        </option>
                        <option value="evening">
                          {language === 'tr' ? 'Akşam (18:00 - 21:00)' : 'Evening (18:00 - 21:00)'}
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
                      onClick={() => {
                        alert(language === 'tr' ? 'Geri arama talebiniz alındı!' : 'Callback request received!');
                        setIsCallbackModalOpen(false);
                      }}
                      className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-bold shadow-lg flex items-center justify-center space-x-2 relative overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <i className="fas fa-phone mr-2"></i>
                      <span>
                        {language === 'tr' ? 'HEMEN ARA' : 'CALL NOW'}
                      </span>
                      
                      {/* Shine effect */}
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-shine"></div>
                    </motion.button>
                    
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      {language === 'tr' ? 'Bilgileriniz KVKK kapsamında korunmaktadır. Arama talebiniz, mevcut çalışma saatleri içinde gerçekleştirilecektir.' : 'Your information is protected under privacy laws. Your call request will be processed during our working hours.'}
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bonus Modal */}
      <AnimatePresence>
        {isBonusModalOpen && (
          <motion.div 
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsBonusModalOpen(false)}
          >
            <motion.div 
              className="bg-[#121212] w-[90%] max-w-md rounded-xl overflow-hidden border border-yellow-500/20 shadow-lg relative"
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e: any) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 p-4 relative">
                <div className="absolute top-4 right-4">
                  <button 
                    className="w-7 h-7 rounded-full bg-black/30 border border-white/10 flex items-center justify-center text-white/80 hover:text-white"
                    onClick={() => setIsBonusModalOpen(false)}
                  >
                    <i className="fas fa-times text-xs"></i>
                  </button>
                </div>
                
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-black/30 flex items-center justify-center mr-3 border border-white/10">
                    <i className="fas fa-gift text-2xl text-white"></i>
                  </div>
                  <div>
                    <h3 className="text-white text-xl font-bold">
                      {language === 'tr' ? 'Bonus Talep Et' : 'Request Bonus'}
                    </h3>
                    <p className="text-white/80 text-sm">
                      {language === 'tr' ? 'Özel bonusları talep edin' : 'Request special bonuses'}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Modal content */}
              <div className="p-5">
                <p className="text-gray-300 mb-4">
                  {language === 'tr' ? 'Size özel bonus tekliflerimizden faydalanmak için lütfen aşağıdaki bilgileri doldurun.' : 'Please fill in the information below to benefit from our special bonus offers.'}
                </p>
                
                <form className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium block">
                      {language === 'tr' ? 'Bonus Türü' : 'Bonus Type'}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <i className="fas fa-gift text-gray-400"></i>
                      </div>
                      <select 
                        className="w-full py-2.5 pl-10 pr-3 bg-[#252525] border border-[#333] rounded-lg focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 text-white appearance-none text-sm"
                      >
                        <option value="" disabled selected>
                          {language === 'tr' ? 'Bonus seçin' : 'Select bonus'}
                        </option>
                        <option value="welcome">
                          {language === 'tr' ? 'Hoşgeldin Bonusu (%100)' : 'Welcome Bonus (100%)'}
                        </option>
                        <option value="deposit">
                          {language === 'tr' ? 'Yatırım Bonusu (%50)' : 'Deposit Bonus (50%)'}
                        </option>
                        <option value="loyalty">
                          {language === 'tr' ? 'Sadakat Bonusu (250 TL)' : 'Loyalty Bonus (250 TL)'}
                        </option>
                        <option value="special">
                          {language === 'tr' ? 'VIP Özel Bonus' : 'VIP Special Bonus'}
                        </option>
                      </select>
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <i className="fas fa-chevron-down text-gray-400 text-xs"></i>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-white text-sm font-medium block">
                      {language === 'tr' ? 'Talep Mesajı (İsteğe Bağlı)' : 'Request Message (Optional)'}
                    </label>
                    <div className="relative">
                      <textarea 
                        className="w-full py-2.5 px-3 bg-[#252525] border border-[#333] rounded-lg focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500 text-white placeholder-gray-500 text-sm min-h-[80px]"
                        placeholder={
                          language === 'tr' ? 'Bonus talebinizle ilgili eklemek istedikleriniz...' : 
                          'Additional information about your bonus request...'
                        }
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="pt-2">
                    <motion.button
                      type="button"
                      onClick={() => {
                        alert(language === 'tr' ? 'Bonus talebiniz alındı!' : 'Bonus request received!');
                        setIsBonusModalOpen(false);
                      }}
                      className="w-full py-3 bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-white rounded-lg font-bold shadow-lg flex items-center justify-center space-x-2 relative overflow-hidden"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <i className="fas fa-gift mr-2"></i>
                      <span>
                        {language === 'tr' ? 'BONUS TALEP ET' : 'REQUEST BONUS'}
                      </span>
                      
                      {/* Shine effect */}
                      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full hover:animate-shine"></div>
                    </motion.button>
                    
                    <p className="text-xs text-gray-500 mt-3 text-center">
                      {language === 'tr' ? 'Bonuslar hesabınıza en geç 24 saat içinde tanımlanacaktır. Bonus çevrim şartları ve kuralları geçerlidir.' : 'Bonuses will be credited to your account within 24 hours. Bonus wagering requirements and rules apply.'}
                    </p>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default QuickAccessSidebar;