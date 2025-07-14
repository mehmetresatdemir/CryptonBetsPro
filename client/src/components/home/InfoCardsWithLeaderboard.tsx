import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface InfoCardsWithLeaderboardProps {
  initialValue?: number;
}

// Liderlik tablosu için veri tipi
interface LeaderItem {
  id: number;
  username: string;
  amount: number;
  type: 'deposit' | 'win';
  date: string;
}

const InfoCardsWithLeaderboard: React.FC<InfoCardsWithLeaderboardProps> = () => {
  const { t } = useLanguage();
  
  // Database-driven leaderboard data
  const [leaderboardData, setLeaderboardData] = useState<LeaderItem[]>([]);

  // Bilgi kartları veri seti
  const infoCards = [
    {
      icon: 'shield-alt',
      titleKey: 'site.secure_gaming',
      descriptionKey: 'site.secure_gaming_desc',
      animationClass: 'animate-pulse'
    },
    {
      icon: 'bolt',
      titleKey: 'site.fast_withdrawal',
      descriptionKey: 'site.fast_withdrawal_desc',
      animationClass: 'animate-bounce'
    },
    {
      icon: 'headset',
      titleKey: 'site.support_24_7',
      descriptionKey: 'site.support_24_7_desc',
      animationClass: 'animate-spin'
    },
    {
      icon: 'credit-card',
      titleKey: 'site.easy_payment',
      descriptionKey: 'site.easy_payment_desc',
      animationClass: 'animate-pulse' 
    }
  ];
  
  // Rastgele animasyonlar için state ve effect
  const [activeCard, setActiveCard] = useState(-1);
  const [activeLeader, setActiveLeader] = useState(-1);
  
  // Rastgele animasyonlar için
  useEffect(() => {
    // Her 3 saniyede bir rastgele bir kart vurgula
    const cardInterval = setInterval(() => {
      const random = Math.floor(Math.random() * infoCards.length);
      setActiveCard(random);
      
      // 1 saniye sonra animasyonu kaldır
      setTimeout(() => setActiveCard(-1), 1000);
    }, 3000);
    
    // Her 4 saniyede bir rastgele bir lider vurgula
    const leaderInterval = setInterval(() => {
      const random = Math.floor(Math.random() * leaderboardData.length);
      setActiveLeader(random);
      
      // 1 saniye sonra animasyonu kaldır
      setTimeout(() => setActiveLeader(-1), 1000);
    }, 4000);
    
    return () => {
      clearInterval(cardInterval);
      clearInterval(leaderInterval);
    };
  }, [infoCards.length, leaderboardData.length]);
  
  // Özel animasyonlar için CSS
  useEffect(() => {
    if (!document.getElementById('site-animations')) {
      const style = document.createElement('style');
      style.id = 'site-animations';
      style.textContent = `
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(234, 179, 8, 0.4); }
          50% { box-shadow: 0 0 15px rgba(234, 179, 8, 0.7); }
        }
        .animate-glow {
          animation: glow 2s ease-in-out infinite;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div className="w-full h-full block rounded-xl overflow-hidden shadow-2xl">
      <div className="grid grid-cols-3 h-full">
        {/* Sol taraf: Bilgi Kartları (2/3 genişlik) */}
        <div className="col-span-2 bg-gradient-to-br from-[#121212] to-[#161616] relative">
          {/* Başlık */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-2 flex items-center rounded-tl-xl z-10 shadow-md">
            <i className="fas fa-info-circle text-black mr-2 text-lg animate-pulse"></i>
            <span className="text-black font-bold text-sm tracking-wide">{t('site.features')}</span>
          </div>
          
          {/* Bilgi Kartları Grid */}
          <div className="h-full flex flex-col">
            <div className="pt-10 flex-1 p-3 grid grid-rows-2 grid-cols-2 gap-3" style={{ minHeight: "280px" }}>
              {infoCards.map((card, index) => (
                <div 
                  key={index}
                  className={`bg-gradient-to-br from-[#0c0c0c] to-[#141414] 
                    ${activeCard === index ? 'shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'shadow-md'} 
                    rounded-xl flex items-center p-2 hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all duration-500 group relative overflow-hidden`}
                >
                  {/* Parlama etkisi */}
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/10 to-yellow-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out"></div>
                  </div>
                  
                  {/* Köşe vurgusu */}
                  <div className="absolute top-0 left-0 w-2 h-8 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-br opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 right-0 w-8 h-2 bg-gradient-to-l from-yellow-400 to-yellow-600 rounded-tl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* İkon */}
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center ml-1 mr-3 
                    ${activeCard === index ? 'animate-bounce shadow-[0_0_15px_rgba(234,179,8,0.7)]' : 'shadow-[0_0_10px_rgba(234,179,8,0.3)]'} text-black transform group-hover:scale-110 transition-all duration-300`}>
                    <i className={`fas fa-${card.icon} ${activeCard === index ? 'animate-pulse' : ''}`}></i>
                  </div>
                  
                  {/* Bilgi Metinleri */}
                  <div className="flex-1">
                    <div className={`text-sm font-bold ${activeCard === index ? 'text-yellow-400' : 'text-white'} group-hover:text-yellow-400 transition-colors duration-300`}>
                      {t(card.titleKey) || ""}
                    </div>
                    <div className="text-gray-400 text-xs group-hover:text-gray-300 transition-colors duration-300">{t(card.descriptionKey) || ""}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Sağ taraf: Liderlik tablosu (1/3 genişlik) */}
        <div className="col-span-1 bg-gradient-to-br from-[#121212] to-[#161616] relative">
          {/* Liderlik tablosu başlığı */}
          <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-2 flex items-center rounded-tr-xl z-10 shadow-md">
            <i className="fas fa-crown text-black mr-2 text-lg drop-shadow-md"></i>
            <span className="text-black font-bold text-sm tracking-wide">{t('leaderboard.title')}</span>
          </div>
          
          {/* Liderlik listesi */}
          <div className="h-full flex flex-col">
            <div className="pt-10 flex-1 p-3 space-y-2" style={{ minHeight: "280px" }}>
              {/* İlk bölüm: En yüksek kazanç */}
              <div className={`flex items-center p-2 bg-gradient-to-br from-[#0c0c0c] to-[#141414] 
                ${activeLeader === 0 ? 'shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'shadow-md'}
                rounded-xl hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all duration-500 group relative overflow-hidden`}>
                {/* Parlama efekti */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/10 to-yellow-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out"></div>
                </div>
                
                {/* Sıralama ikonu */}
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center mr-1.5 shadow-[0_0_8px_rgba(234,179,8,0.5)] text-black font-bold text-[10px]">
                  1
                </div>
                
                {/* Kupa ikonu */}
                <div className={`flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-[#0F0F0F] to-[#1C1C1C] flex items-center justify-center mr-2 border-2 
                  ${activeLeader === 0 ? 'border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'border-yellow-500/40 shadow-md'} 
                  transform group-hover:scale-110 transition-all duration-300`}>
                  <i className="fas fa-trophy text-yellow-400 drop-shadow-md text-sm"></i>
                </div>
                
                {/* Bilgiler */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`${activeLeader === 0 ? 'text-yellow-400' : 'text-white'} text-xs font-bold truncate group-hover:text-yellow-400 transition-colors duration-300 mr-1`}>
                      {leaderboardData[0].username}
                    </span>
                    <span className={`${activeLeader === 0 ? 'bg-yellow-500/90 shadow-md' : 'bg-black border border-yellow-500/30'} 
                      text-white text-xs font-bold px-1.5 py-0.5 rounded-lg whitespace-nowrap flex-shrink-0 group-hover:bg-yellow-500/70 transition-all duration-300`}>
                      {leaderboardData[0].amount.toLocaleString()} ₺
                    </span>
                  </div>
                  <div className="text-gray-400 text-[10px] group-hover:text-gray-300 transition-colors flex items-center">
                    <i className="fas fa-chart-line text-green-500 mr-1 text-[8px]"></i>
                    {t('leaderboard.highest_win')}
                  </div>
                </div>
              </div>
              
              {/* İkinci bölüm: En çok yatırım yapan */}
              <div className={`flex items-center p-2 bg-gradient-to-br from-[#0c0c0c] to-[#141414] 
                ${activeLeader === 1 ? 'shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'shadow-md'}
                rounded-xl hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all duration-500 group relative overflow-hidden`}>
                {/* Parlama efekti */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/10 to-yellow-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out"></div>
                </div>
                
                {/* Sıralama ikonu */}
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center mr-1.5 shadow-[0_0_8px_rgba(255,255,255,0.3)] text-black font-bold text-[10px]">
                  2
                </div>
                
                {/* Cüzdan ikonu */}
                <div className={`flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-[#0F0F0F] to-[#1C1C1C] flex items-center justify-center mr-2 border-2 
                  ${activeLeader === 1 ? 'border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'border-yellow-500/40 shadow-md'} 
                  transform group-hover:scale-110 transition-all duration-300`}>
                  <i className="fas fa-wallet text-yellow-400 drop-shadow-md text-sm"></i>
                </div>
                
                {/* Bilgiler */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`${activeLeader === 1 ? 'text-yellow-400' : 'text-white'} text-xs font-bold truncate group-hover:text-yellow-400 transition-colors duration-300 mr-1`}>
                      {leaderboardData[1].username}
                    </span>
                    <span className={`${activeLeader === 1 ? 'bg-yellow-500/90 shadow-md' : 'bg-black border border-yellow-500/30'} 
                      text-white text-xs font-bold px-1.5 py-0.5 rounded-lg whitespace-nowrap flex-shrink-0 group-hover:bg-yellow-500/70 transition-all duration-300`}>
                      {leaderboardData[1].amount.toLocaleString()} ₺
                    </span>
                  </div>
                  <div className="text-gray-400 text-[10px] group-hover:text-gray-300 transition-colors flex items-center">
                    <i className="fas fa-arrow-up text-green-500 mr-1 text-[8px]"></i>
                    {t('leaderboard.top_depositor')}
                  </div>
                </div>
              </div>
              
              {/* Üçüncü bölüm: İkinci yüksek kazanç */}
              <div className={`flex items-center p-2 bg-gradient-to-br from-[#0c0c0c] to-[#141414] 
                ${activeLeader === 2 ? 'shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'shadow-md'}
                rounded-xl hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all duration-500 group relative overflow-hidden`}>
                {/* Parlama efekti */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/10 to-yellow-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out"></div>
                </div>
                
                {/* Sıralama ikonu */}
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center mr-1.5 shadow-[0_0_8px_rgba(217,119,6,0.3)] text-black font-bold text-[10px]">
                  3
                </div>
                
                {/* Kupa ikonu */}
                <div className={`flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-[#0F0F0F] to-[#1C1C1C] flex items-center justify-center mr-2 border-2 
                  ${activeLeader === 2 ? 'border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'border-yellow-500/40 shadow-md'} 
                  transform group-hover:scale-110 transition-all duration-300`}>
                  <i className="fas fa-trophy text-yellow-400 drop-shadow-md text-sm"></i>
                </div>
                
                {/* Bilgiler */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`${activeLeader === 2 ? 'text-yellow-400' : 'text-white'} text-xs font-bold truncate group-hover:text-yellow-400 transition-colors duration-300 mr-1`}>
                      {leaderboardData[2].username}
                    </span>
                    <span className={`${activeLeader === 2 ? 'bg-yellow-500/90 shadow-md' : 'bg-black border border-yellow-500/30'} 
                      text-white text-xs font-bold px-1.5 py-0.5 rounded-lg whitespace-nowrap flex-shrink-0 group-hover:bg-yellow-500/70 transition-all duration-300`}>
                      {leaderboardData[2].amount.toLocaleString()} ₺
                    </span>
                  </div>
                  <div className="text-gray-400 text-[10px] group-hover:text-gray-300 transition-colors flex items-center">
                    <i className="fas fa-chart-line text-green-500 mr-1 text-[8px]"></i>
                    İkinci Yüksek Kazanç
                  </div>
                </div>
              </div>
              
              {/* Dördüncü bölüm: İkinci yüksek yatırım */}
              <div className={`flex items-center p-2 bg-gradient-to-br from-[#0c0c0c] to-[#141414] 
                ${activeLeader === 3 ? 'shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'shadow-md'}
                rounded-xl hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-all duration-500 group relative overflow-hidden`}>
                {/* Parlama efekti */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/10 to-yellow-500/0 -translate-x-full group-hover:translate-x-full transition-transform duration-1500 ease-in-out"></div>
                </div>
                
                {/* Sıralama ikonu */}
                <div className="flex-shrink-0 w-5 h-5 rounded-full bg-gradient-to-br from-zinc-600 to-zinc-800 flex items-center justify-center mr-1.5 shadow-[0_0_8px_rgba(161,161,170,0.3)] text-white font-bold text-[10px]">
                  4
                </div>
                
                {/* Cüzdan ikonu */}
                <div className={`flex-shrink-0 w-9 h-9 rounded-lg bg-gradient-to-br from-[#0F0F0F] to-[#1C1C1C] flex items-center justify-center mr-2 border-2 
                  ${activeLeader === 3 ? 'border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.5)]' : 'border-yellow-500/40 shadow-md'} 
                  transform group-hover:scale-110 transition-all duration-300`}>
                  <i className="fas fa-wallet text-yellow-400 drop-shadow-md text-sm"></i>
                </div>
                
                {/* Bilgiler */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <span className={`${activeLeader === 3 ? 'text-yellow-400' : 'text-white'} text-xs font-bold truncate group-hover:text-yellow-400 transition-colors duration-300 mr-1`}>
                      {leaderboardData[3].username}
                    </span>
                    <span className={`${activeLeader === 3 ? 'bg-yellow-500/90 shadow-md' : 'bg-black border border-yellow-500/30'} 
                      text-white text-xs font-bold px-1.5 py-0.5 rounded-lg whitespace-nowrap flex-shrink-0 group-hover:bg-yellow-500/70 transition-all duration-300`}>
                      {leaderboardData[3].amount.toLocaleString()} ₺
                    </span>
                  </div>
                  <div className="text-gray-400 text-[10px] group-hover:text-gray-300 transition-colors flex items-center">
                    <i className="fas fa-arrow-up text-green-500 mr-1 text-[8px]"></i>
                    İkinci Yüksek Yatırım
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InfoCardsWithLeaderboard;