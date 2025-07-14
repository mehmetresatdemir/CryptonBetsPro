import React, { useState, useEffect } from "react";
import { newsItems as defaultNewsItems, NewsItem } from "@/data/news";
import { useLanguage } from "@/contexts/LanguageContext";
import { translate } from "@/utils/i18n";

interface BonusSectionProps {
  bonusItems?: NewsItem[];
}

const BonusSection: React.FC<BonusSectionProps> = ({ 
  bonusItems = defaultNewsItems 
}) => {
  const { language } = useLanguage();
  
  // Aktif bonus state'i
  const [activeBonus, setActiveBonus] = useState<number>(-1);
  
  // Sequential news highlighting based on database order 
  useEffect(() => {
    let currentIndex = 0;
    const newsInterval = setInterval(() => {
      setActiveBonus(currentIndex);
      currentIndex = (currentIndex + 1) % actualNewsItems.length;
      
      // Clear highlight after display
      setTimeout(() => {
        setActiveBonus(-1);
      }, 1500);
    }, 4000);
    
    return () => clearInterval(newsInterval);
  }, [bonusItems.length]);
  
  // Özel animasyonlar için CSS
  useEffect(() => {
    if (!document.getElementById('bonus-animations')) {
      const style = document.createElement('style');
      style.id = 'bonus-animations';
      style.textContent = `
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(234, 179, 8, 0.4); }
          50% { box-shadow: 0 0 15px rgba(234, 179, 8, 0.7); }
        }
        @keyframes pulse-border {
          0%, 100% { border-color: rgba(234, 179, 8, 0.3); }
          50% { border-color: rgba(234, 179, 8, 0.8); }
        }
        @keyframes shine {
          0% { background-position: -100% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
        .animate-pulse-border {
          animation: pulse-border 2s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 6s linear infinite;
        }
        .shine-effect {
          position: relative;
          overflow: hidden;
        }
        .shine-effect::after {
          content: "";
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: linear-gradient(
            to right,
            transparent 0%,
            rgba(255, 255, 255, 0.1) 50%,
            transparent 100%
          );
          transform: rotate(25deg);
          animation: shine 3s ease-in-out infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);
  
  // Bonus ikonları için render fonksiyonu
  const renderBonusIcon = (type: string) => {
    switch (type) {
      case "vip":
        return (
          <>
            <span className="text-[#121212] font-bold text-sm">{t('bonuses.icon.vip')}</span>
            <span className="text-[#121212] text-xs block mt-0.5">{t('bonuses.icon.vip_club')}</span>
          </>
        );
      case "premium":
        return (
          <>
            <span className="text-[#FFD700] font-bold text-sm tracking-wide">{t('bonuses.icon.premium')}</span>
            <span className="text-white text-xs block mt-0.5">{t('bonuses.icon.bonus')}</span>
          </>
        );
      case "mystery":
        return (
          <>
            <span className="text-white font-bold tracking-wide text-xs">{t('bonuses.icon.wheel')}</span>
            <span className="text-[#FFD700] text-xs block mt-0.5">{t('bonuses.icon.spin')}</span>
          </>
        );
      case "fast-games":
        return (
          <>
            <span className="text-white font-bold text-sm">{t('bonuses.icon.fast')}</span>
            <span className="text-white text-xs block -mt-0.5">{t('bonuses.icon.games')}</span>
          </>
        );
      case "bonus":
        return (
          <>
            <span className="text-[#FFD700] font-bold text-xl">%50</span>
            <span className="text-white text-xs block">{t('bonuses.icon.bonus')}</span>
            <span className="text-[#FFD700] font-bold text-xs mt-0.5">2500₺</span>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="mb-8">
      {/* Başlık - Site özellikleri ve liderlik tablosu ile aynı tasarım */}
      <div className="bg-yellow-500 px-3 py-1.5 flex items-center mb-4">
        <i className="fas fa-gift text-black mr-2"></i>
        <span className="text-black font-bold text-sm">{t('section.bonuses')}</span>
      </div>
      
      <div className="flex items-center justify-between px-4">
        <div className="flex items-center">
        </div>
        
        {/* Sağ taraf butonları */}
        <div className="flex items-center space-x-3">
          <button className="flex items-center text-sm text-gray-400 hover:text-white transition-colors">
            <span className="text-sm font-medium">{t('bonuses.all_bonuses')}</span>
            <span className="text-yellow-500 ml-1 font-semibold">(12)</span>
          </button>
          
          <button className="flex items-center text-sm bg-[#222222] hover:bg-[#333333] px-3 py-1.5 rounded-md shadow-md border border-[#444444] transition-all">
            <i className="fas fa-sync-alt mr-1.5 text-yellow-500"></i>
            <span className="text-sm font-medium">{t('bonuses.new_bonuses')}</span>
          </button>
        </div>
      </div>
      
      {/* Bilgi satırı */}
      <div className="mb-4 text-sm text-gray-400 flex items-center gap-1 px-4">
        <i className="fas fa-bolt text-yellow-500"></i>
        <span>{t('bonuses.info_text')}</span>
      </div>
      
      {/* Instagram story benzeri halkalar */}
      <div className="px-4">
        <div className="flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {/* Öğeler/Kartlar - Instagram story tarzı */}
          {bonusItems.map((item: NewsItem, index: number) => (
            <div 
              key={item.id || index} 
              className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105 flex-shrink-0" 
            >
              {/* Dış çerçeve (Instagram story halkası) */}
              <div className={`w-[90px] h-[90px] rounded-full 
                ${activeBonus === index ? 'animate-spin-slow' : ''} 
                ${index === 0 ? 'bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500' : 
                  index === 1 ? 'bg-gradient-to-r from-yellow-500 to-amber-600' : 
                  index === 2 ? 'bg-gradient-to-r from-purple-500 to-blue-500' : 
                  index === 3 ? 'bg-gradient-to-r from-green-500 to-emerald-600' : 
                  'bg-gradient-to-r from-gray-500 to-gray-700'} 
                p-[2.5px] flex items-center justify-center shadow-lg relative`}
              >
                {/* Parlama efekti */}
                <div className="absolute -inset-1 bg-yellow-500 opacity-10 blur-md rounded-full"></div>
                
                {/* İç içerik alanı */}
                <div className={`w-full h-full rounded-full overflow-hidden flex items-center justify-center shadow-md ${item.bgClass} border-2 border-[#1A1A1A] relative`}>
                  {/* Koyu gradyan arka plan */}
                  <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-30"></div>
                  
                  {/* İçerik */}
                  <div className="flex flex-col items-center justify-center text-center z-10">
                    {renderBonusIcon(item.type)}
                  </div>
                </div>
              </div>
              
              {/* Alt başlık */}
              <div className="mt-2 text-center">
                <span className="text-xs text-white font-medium">
                  {item.type === "vip" ? t('bonuses.vip_club') : 
                   item.type === "premium" ? t('bonuses.premium') : 
                   item.type === "mystery" ? t('bonuses.daily_wheel') : 
                   item.type === "fast-games" ? t('bonuses.fast_games') : 
                   t('bonuses.deposit_bonus')}
                </span>
              </div>
            </div>
          ))}
          
          {/* Ekstra bonuslar - Instagram story halkası tarzında */}
          <div className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105 flex-shrink-0">
            <div className="w-[90px] h-[90px] rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 p-[2.5px] flex items-center justify-center shadow-lg relative">
              {/* Parlama efekti */}
              <div className="absolute -inset-1 bg-yellow-500 opacity-10 blur-md rounded-full"></div>
              
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center shadow-md bg-gradient-to-b from-[#2A2A2A] to-[#1E1E1E] border-2 border-[#1A1A1A] relative">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-30"></div>
                <div className="flex flex-col items-center justify-center text-center z-10">
                  <span className="text-yellow-500 font-bold text-xl">%30</span>
                  <span className="text-white text-xs block">{t('bonuses.icon.bonus')}</span>
                  <span className="text-yellow-500 font-bold text-xs mt-0.5">1500₺</span>
                </div>
              </div>
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs text-white font-medium">{t('bonuses.cashback')}</span>
            </div>
          </div>
          
          <div className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105 flex-shrink-0">
            <div className="w-[90px] h-[90px] rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-[2.5px] flex items-center justify-center shadow-lg relative">
              {/* Parlama efekti */}
              <div className="absolute -inset-1 bg-purple-500 opacity-10 blur-md rounded-full"></div>
              
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center shadow-md bg-gradient-to-b from-purple-600 to-purple-900 border-2 border-[#1A1A1A] relative">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-30"></div>
                <div className="flex flex-col items-center justify-center text-center z-10">
                  <span className="text-white font-bold text-sm">{t('bonuses.freespin')}</span>
                  <span className="text-yellow-500 font-bold text-xl mt-0.5">150</span>
                </div>
              </div>
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs text-white font-medium">{t('bonuses.freespin')}</span>
            </div>
          </div>
          
          {/* Ekstra bonus öğeleri - Yeni Instagram story tarzında */}
          <div className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105 flex-shrink-0">
            <div className="w-[90px] h-[90px] rounded-full bg-gradient-to-r from-green-500 to-emerald-600 p-[2.5px] flex items-center justify-center shadow-lg relative">
              {/* Parlama efekti */}
              <div className="absolute -inset-1 bg-green-500 opacity-10 blur-md rounded-full"></div>
              
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center shadow-md bg-gradient-to-b from-green-700 to-green-900 border-2 border-[#1A1A1A] relative">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-30"></div>
                <div className="flex flex-col items-center justify-center text-center z-10">
                  <span className="text-white font-bold text-sm">{t('bonuses.icon.first')}</span>
                  <span className="text-white font-bold text-xs">{t('bonuses.icon.deposit')}</span>
                  <span className="text-yellow-500 font-bold text-lg mt-0.5">%100</span>
                </div>
              </div>
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs text-white font-medium">{t('bonuses.welcome')}</span>
            </div>
          </div>
          
          <div className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105 flex-shrink-0">
            <div className="w-[90px] h-[90px] rounded-full bg-gradient-to-r from-red-500 to-rose-600 p-[2.5px] flex items-center justify-center shadow-lg relative">
              {/* Parlama efekti */}
              <div className="absolute -inset-1 bg-red-500 opacity-10 blur-md rounded-full"></div>
              
              <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center shadow-md bg-gradient-to-b from-red-700 to-red-900 border-2 border-[#1A1A1A] relative">
                <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-30"></div>
                <div className="flex flex-col items-center justify-center text-center z-10">
                  <span className="text-white font-bold text-[10px]">{t('bonuses.icon.live_casino')}</span>
                  <span className="text-white font-bold text-[10px]">{t('bonuses.icon.casino')}</span>
                  <span className="text-yellow-500 font-bold text-lg mt-0.5">%20</span>
                </div>
              </div>
            </div>
            <div className="mt-2 text-center">
              <span className="text-xs text-white font-medium">{t('bonuses.casino_bonus')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BonusSection;