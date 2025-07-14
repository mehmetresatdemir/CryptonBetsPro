import React, { useState, useEffect, useRef, Fragment } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface JackpotAndLeaderboardProps {
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

const JackpotAndLeaderboard: React.FC<JackpotAndLeaderboardProps> = ({ initialValue = 3567890 }) => {
  const { t } = useLanguage();
  const [jackpotValue, setJackpotValue] = useState(initialValue);
  const [isActive, setIsActive] = useState(false);
  const digitRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Database-driven leaderboard data
  const [leaderboardData, setLeaderboardData] = useState<LeaderItem[]>([]);
  
  // Database-driven jackpot increments
  useEffect(() => {
    const timer = setInterval(() => {
      const increment = 115; // Fixed increment from betting pool
      setJackpotValue(prev => prev + increment);
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
      {/* Arka plan efekti */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptMi0yaDF2MWgtMXYtMXptLTItNnY5aC05di05aDl6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        {/* Animasyonlu arka plan ışıkları */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-yellow-500 rounded-full opacity-5 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-yellow-500 rounded-full opacity-5 blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>
      
      <div className="relative h-full w-full p-3 flex">
        {/* Sol taraf: Jackpot */}
        <div className="w-1/2 pr-2 border-r border-[#333] h-full flex flex-col justify-center items-center"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <h2 className="text-base sm:text-lg text-white font-bold mb-1 flex items-center">
            <div className="w-5 h-5 bg-[#FFD700] rounded-full flex items-center justify-center mr-2">
              <i className="fas fa-trophy text-black text-xs"></i>
            </div>
            <span>CRYPTONBETS JACKPOT</span>
          </h2>
          
          {/* Dijital Sayaç */}
          <div className="flex items-center justify-center mt-1 mb-1">
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
                      className={`relative w-4 sm:w-6 h-7 sm:h-9 bg-[#2A2A2A] border border-[#3A3A3A] rounded-md mx-0.5 flex items-center justify-center overflow-hidden shadow-inner ${isActive ? 'shadow-yellow-900/20' : ''}`}
                    >
                      <span className="text-[#FFD700] text-sm sm:text-xl font-bold animate-pulse">
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
          
          {/* İlerleme çubuğu */}
          <div className="mt-1 w-full px-3">
            <div className="relative h-2 bg-[#2A2A2A] rounded-full overflow-hidden shadow-inner">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FFD700] to-[#FFBA00] rounded-full animate-progressbar"></div>
              
              {/* Parıltı efekti */}
              <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
            </div>
          </div>
          
          {/* Buton */}
          <div className="mt-2">
            <button className="bg-gradient-to-r from-[#FFD700] to-[#FFBA00] hover:from-[#FFBA00] hover:to-[#FFD700] text-black font-bold py-1 px-4 rounded-full shadow-lg transition-all hover:shadow-yellow-500/30 hover:scale-105 text-xs flex items-center group">
              <i className="fas fa-play-circle mr-1 group-hover:animate-pulse"></i>
              {t('jackpot.play_now') || 'HEMEN OYNA'}
            </button>
          </div>
        </div>
        
        {/* Sağ taraf: Liderlik Tablosu */}
        <div className="w-1/2 pl-2 h-full flex flex-col">
          <h2 className="text-base sm:text-lg text-white font-bold mb-1 flex items-center">
            <div className="w-5 h-5 bg-[#FFD700] rounded-full flex items-center justify-center mr-2">
              <i className="fas fa-crown text-black text-xs"></i>
            </div>
            <span>LİDERLİK TABLOSU</span>
          </h2>
          
          {/* Liderlik listesi */}
          <div className="flex-1 overflow-hidden">
            <div className="space-y-1.5">
              {leaderboardData.map((leader) => (
                <div key={leader.id} className="bg-[#2A2A2A] rounded-lg p-1 sm:p-2 relative overflow-hidden group">
                  {/* Yan ışıma efekti */}
                  <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-yellow-400 to-yellow-600"></div>
                  
                  {/* Arkaplan parlaması */}
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="flex items-center">
                    {/* İkon */}
                    <div className="w-6 h-6 rounded-full bg-[#1A1A1A] flex items-center justify-center mr-2">
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

export default JackpotAndLeaderboard;