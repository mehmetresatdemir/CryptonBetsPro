import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import AISupportChat from '@/components/chat/AISupportChat';

interface QuickMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const QuickMenu: React.FC<QuickMenuProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [isChatOpen, setIsChatOpen] = useState(false);
  
  // Chat açıkken menü kapanma işlemini engelle
  useEffect(() => {
    if (isChatOpen) {
      // Chat açıkken scroll'u engelle
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isChatOpen]);
  
  // Arka plana tıklandığında menüyü kapat
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };
  
  // Menü öğeleri
  const menuItems = [
    {
      id: 'deposit',
      icon: 'fa-wallet',
      label: t('mobile.deposit') || 'Para Yatır',
      color: 'from-green-500 to-green-600',
      textColor: 'text-white',
      action: () => {
        console.log('💰 Deposit button clicked');
        const event = new CustomEvent('openDepositModal');
        window.dispatchEvent(event);
        onClose();
      }
    },
    {
      id: 'bonus',
      icon: 'fa-gift',
      label: t('mobile.bonus_claim') || 'Bonus Al',
      color: 'from-purple-500 to-purple-600',
      textColor: 'text-white',
      action: () => {
        console.log('🎁 Bonus button clicked');
        window.location.href = '/bonuslar';
        onClose();
      }
    },
    {
      id: 'chat',
      icon: 'fa-comments',
      label: 'Canlı Chat',
      color: 'from-blue-500 to-blue-600',
      textColor: 'text-white',
      action: () => {
        console.log('💬 Chat button clicked - opening chat');
        setIsChatOpen(true);
        onClose();
      }
    },
    {
      id: 'support',
      icon: 'fa-headset',
      label: 'Canlı Destek',
      color: 'from-indigo-500 to-indigo-600',
      textColor: 'text-white',
      action: () => {
        console.log('🎧 Support button clicked - opening chat');
        setIsChatOpen(true);
        onClose();
      }
    },
    {
      id: 'vip',
      icon: 'fa-crown',
      label: t('mobile.vip') || 'VIP',
      color: 'from-yellow-400 to-yellow-600',
      textColor: 'text-black',
      action: () => {
        console.log('👑 VIP button clicked');
        window.location.href = '/vip';
        onClose();
      }
    },
    {
      id: 'games',
      icon: 'fa-gamepad',
      label: 'Oyunlar',
      color: 'from-orange-500 to-orange-600',
      textColor: 'text-white',
      action: () => {
        console.log('🎮 Games button clicked');
        window.location.href = '/oyunlar';
        onClose();
      }
    }
  ];

  console.log('📱 QuickMenu rendering with items:', menuItems.length, 'items');
  console.log('📱 Menu items:', menuItems.map(item => `${item.id}: ${item.label}`));

  if (!isOpen && !isChatOpen) return null;

  return (
    <>
      {/* QuickMenu Modal */}
      {isOpen && (
        <div 
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/70 backdrop-blur-sm animate-fadeIn md:hidden"
          onClick={handleBackdropClick}
        >
          <div className="bg-[#1A1A1A] w-[95%] max-w-[350px] rounded-xl shadow-2xl border border-yellow-500/20 p-4 animate-scaleIn">
            <div className="flex items-center justify-center relative mb-4">
              <div className="w-10 h-10 rounded-full bg-[#232323] flex items-center justify-center mr-3">
                <i className="fas fa-bolt text-yellow-500 text-lg"></i>
              </div>
              <h2 className="text-white text-lg font-bold">{t('mobile.quick_access')}</h2>
              <button 
                onClick={onClose}
                className="absolute right-0 w-7 h-7 flex items-center justify-center rounded-full bg-[#232323] text-gray-400 hover:bg-[#2A2A2A] hover:text-white transition-colors"
              >
                <i className="fas fa-times text-sm"></i>
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {menuItems.map((item, index) => {
                console.log(`📱 Rendering button ${index + 1}:`, item.id, item.label);
                return (
                  <button
                    key={item.id}
                    onClick={item.action}
                    className={`bg-gradient-to-br ${item.color} ${item.textColor} p-3 rounded-xl flex flex-col items-center justify-center transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98] relative overflow-hidden min-h-[80px]`}
                  >
                    {/* Arka plan efekti - daha hafif */}
                    <div className="absolute -top-6 -left-6 w-12 h-12 bg-white/10 rounded-full blur-md"></div>
                    
                    <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center mb-2">
                      <i className={`fas ${item.icon} text-sm`}></i>
                    </div>
                    <span className="text-xs font-medium text-center leading-tight">{item.label}</span>
                  </button>
                );
              })}
            </div>
            
            {/* Alt bilgi kaldırıldı - daha kompakt görünüm için */}
          </div>
        </div>
      )}
      
      {/* AI Canlı Destek Chat Sistemi - Ayrı component olarak render et */}
      {isChatOpen && (
        <AISupportChat 
          isOpen={isChatOpen} 
          onClose={() => setIsChatOpen(false)} 
        />
      )}
    </>
  );
};

export default QuickMenu;