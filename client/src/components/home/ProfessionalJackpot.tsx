import React, { useState, useEffect, useRef, Fragment } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProfessionalJackpotProps {
  initialValue?: number;
}

// Liderlik tablosu için veri tipi
interface LeaderItem {
  id: number;
  username: string;
  amount: number;
  type: 'deposit' | 'win' | 'jackpot';
  date: string;
}

const ProfessionalJackpot: React.FC<ProfessionalJackpotProps> = ({ initialValue = 3567890 }) => {
  const { t } = useLanguage();
  const [jackpotValue, setJackpotValue] = useState(initialValue);
  const [isActive, setIsActive] = useState(false);
  const [incrementAnimation, setIncrementAnimation] = useState(false);
  const digitRefs = useRef<(HTMLDivElement | null)[]>([]);
  const incrementRef = useRef<HTMLDivElement | null>(null);
  
  // Database-driven leaderboard data
  const [leaderboardData, setLeaderboardData] = useState<LeaderItem[]>([]);

  // Fixed light colors for consistent branding
  const lightColors = ['#FFD700', '#FFA500', '#FF8C00', '#FFA07A'];
  
  // Database-driven jackpot increments
  useEffect(() => {
    const timer = setInterval(() => {
      const increment = 135; // Fixed increment from betting pool
      setJackpotValue(prev => prev + increment);
      
      // Trigger animation
      setIncrementAnimation(true);
      setTimeout(() => setIncrementAnimation(false), 500);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Jackpot değerini biçimlendir (1,234,567 gibi)
  const formattedValue = jackpotValue.toLocaleString();
  const digitArray = formattedValue.split('');
  
  // Hover efekti
  const handleMouseEnter = () => {
    setIsActive(true);
  };
  
  const handleMouseLeave = () => {
    setIsActive(false);
  };
  
  // Liderlik türüne göre ikon belirle
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'deposit':
        return <i className="fas fa-wallet text-green-400"></i>;
      case 'win':
        return <i className="fas fa-trophy text-[#FFD700]"></i>;
      case 'jackpot':
        return <i className="fas fa-gem text-purple-400"></i>;
      default:
        return <i className="fas fa-coins text-[#FFD700]"></i>;
    }
  };
  
  // Liderlik türüne göre mesaj belirle
  const getTypeMessage = (type: string) => {
    switch(type) {
      case 'deposit':
        return 'En Çok Yatırım Yapan';
      case 'win':
        return 'En Yüksek Kazanç';
      case 'jackpot':
        return 'En Çok Yatırım Yapan';
      default:
        return '';
    }
  };
  
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-[#1A1A1A] to-[#121212] rounded-xl overflow-hidden border-2 border-[#2A2A2A] shadow-lg">
      {/* Karanlık arka plan efekti */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full opacity-20">
          {/* 3D ışık yanıp sönme efekti */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
            {lightColors.map((color, index) => (
              <div 
                key={index}
                className="absolute rounded-full blur-3xl animate-pulse"
                style={{
                  backgroundColor: color,
                  width: `${Math.random() * 60 + 20}px`,
                  height: `${Math.random() * 60 + 20}px`,
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  opacity: 0.15,
                  animationDelay: `${index * 0.5}s`,
                  animationDuration: `${Math.random() * 4 + 3}s`
                }}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="relative h-full w-full p-3 flex">
        {/* Sol taraf: Jackpot */}
        <div className="w-1/2 pr-2 border-r border-[#333] h-full flex flex-col justify-center items-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {/* Başlık */}
          <div className="mb-2">
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-lg px-3 py-1 shadow-lg">
              <h2 className="text-base sm:text-lg text-black font-bold flex items-center">
                <i className="fas fa-trophy mr-2 animate-pulse"></i>
                <span>CRYPTONBETS JACKPOT</span>
              </h2>
            </div>
          </div>
          
          {/* Artış göstergesi */}
          <div 
            ref={incrementRef}
            className={`absolute right-1/4 top-2 text-green-400 font-bold text-xs transition-opacity duration-500 ${incrementAnimation ? 'opacity-100' : 'opacity-0'}`}
            style={{ transform: incrementAnimation ? 'translateY(-5px)' : 'translateY(0)' }}
          >
            <i className="fas fa-arrow-up mr-1"></i>
            <span>+135₺</span>
          </div>
          
          {/* Dijital Sayaç */}
          <div className="mt-2 bg-black/50 rounded-lg p-2 border border-yellow-500/30 shadow-inner relative overflow-hidden">
            {/* Parıltı animasyonu */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer"></div>
            </div>
            
            <div className="flex items-center justify-center">
              <div className="flex flex-wrap justify-center">
                {digitArray.map((digit, index) => (
                  <Fragment key={index}>
                    {digit === ',' || digit === '.' ? (
                      <div className="text-[#FFD700] text-lg sm:text-2xl font-bold mx-0.5 transform -translate-y-0.5">
                        {digit}
                      </div>
                    ) : (
                      <div 
                        ref={el => digitRefs.current[index] = el}
                        className={`relative w-5 sm:w-7 h-8 sm:h-10 bg-[#1A1A1A] border border-[#3A3A3A] rounded-md mx-0.5 flex items-center justify-center overflow-hidden shadow-inner ${isActive ? 'shadow-yellow-900/20' : ''}`}
                      >
                        <span className="text-[#FFD700] text-sm sm:text-xl font-bold">
                          {digit}
                        </span>
                        <div className={`absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
                      </div>
                    )}
                  </Fragment>
                ))}
                <div className="ml-1 text-[#FFD700] text-lg sm:text-2xl font-bold">₺</div>
              </div>
            </div>
          </div>
          
          {/* İlerleme çubuğu kaldırıldı */}
          
          {/* Buton */}
          <div className="mt-3">
            <button className="relative overflow-hidden bg-gradient-to-r from-[#FFD700] to-[#FFBA00] hover:from-[#FFBA00] hover:to-[#FFD700] text-black font-bold py-1.5 px-5 rounded-lg shadow-lg transition-all hover:shadow-yellow-500/30 hover:scale-105 text-xs group">
              {/* Buton arkasında hareketli ışık efekti */}
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full transform group-hover:translate-x-full transition-transform duration-1000 ease-in-out"></span>
              
              <i className="fas fa-play-circle mr-2 group-hover:animate-pulse"></i>
              {t('jackpot.play_now') || 'HEMEN OYNA'}
            </button>
          </div>
        </div>
        
        {/* Sağ taraf: Liderlik Tablosu */}
        <div className="w-1/2 pl-2 h-full flex flex-col">
          {/* Başlık */}
          <div className="mb-2">
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-400 rounded-lg px-3 py-1 shadow-lg">
              <h2 className="text-base sm:text-lg text-black font-bold flex items-center">
                <i className="fas fa-crown mr-2"></i>
                <span>LİDERLİK TABLOSU</span>
              </h2>
            </div>
          </div>
          
          {/* Liderlik listesi */}
          <div className="flex-1 overflow-hidden">
            <div className="space-y-1.5">
              {leaderboardData.map((leader) => (
                <div key={leader.id} className="bg-black/40 rounded-lg p-1.5 sm:p-2 relative overflow-hidden group hover:bg-black/60 transition-all duration-300 border border-yellow-500/10 hover:border-yellow-500/30">
                  {/* Yan ışıma efekti */}
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-yellow-400 to-yellow-600"></div>
                  
                  {/* Arkaplan parlaması */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="flex items-center">
                    {/* İkon */}
                    <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center mr-2 border border-yellow-500/30">
                      {getTypeIcon(leader.type)}
                    </div>
                    
                    {/* Bilgiler */}
                    <div className="flex-1 overflow-hidden pr-2">
                      <div className="flex justify-between items-center">
                        <div className="truncate text-xs font-bold text-white">{leader.username}</div>
                        <div className="text-[#FFD700] text-xs font-bold">{leader.amount.toLocaleString()} ₺</div>
                      </div>
                      <div className="text-gray-400 text-[10px]">{getTypeMessage(leader.type)}</div>
                    </div>
                  </div>
                  
                  {/* Animasyonlu parıltı efekti */}
                  <div className="absolute top-0 right-0 h-full w-20 bg-gradient-to-l from-transparent via-white/5 to-transparent -skew-x-30 transform translate-x-full group-hover:animate-shimmer opacity-0 group-hover:opacity-100"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalJackpot;