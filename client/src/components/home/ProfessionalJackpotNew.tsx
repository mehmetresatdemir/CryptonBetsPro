import React, { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProfessionalJackpotProps {
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

const ProfessionalJackpotNew: React.FC<ProfessionalJackpotProps> = ({ initialValue = 3567890 }) => {
  const { t } = useLanguage();
  const [jackpotValue, setJackpotValue] = useState(initialValue);
  
  // Database-driven leaderboard data
  const [leaderboardData, setLeaderboardData] = useState<LeaderItem[]>([]);

  // Database-driven jackpot increments
  useEffect(() => {
    const timer = setInterval(() => {
      const increment = 125; // Fixed increment based on betting pool
      setJackpotValue(prev => prev + increment);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Jackpot değerini biçimlendir (1,234,567 gibi)
  const formattedValue = jackpotValue.toLocaleString();
  
  // Liderlik türüne göre ikon belirle
  const getTypeIcon = (type: string) => {
    switch(type) {
      case 'deposit':
        return <i className="fas fa-wallet text-green-400"></i>;
      case 'win':
        return <i className="fas fa-trophy text-[#FFD700]"></i>;
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
      default:
        return '';
    }
  };
  
  return (
    <div className="w-full h-full flex rounded-lg overflow-hidden">
      {/* Sol taraf: Jackpot göstergesi - Tüm sol alanı kaplar */}
      <div className="flex-1 bg-[#1A1A1A] border-r border-[#333] relative">
        {/* Jackpot başlığı */}
        <div className="absolute top-0 left-0 right-0 bg-yellow-500 px-3 py-1.5 flex items-center">
          <i className="fas fa-trophy text-black mr-2"></i>
          <span className="text-black font-bold text-sm">CRYPTONBETS JACKPOT</span>
        </div>
        
        {/* Jackpot dijital sayaç - Tüm alanı dolduracak şekilde */}
        <div className="flex h-full items-center justify-center pt-8 pb-2 px-2">
          <div className="w-full flex flex-wrap items-center justify-center">
            {Array.from({ length: Math.min(12, formattedValue.length) }).map((_, i) => {
              const digit = formattedValue[i] || '0';
              if (digit === ',' || digit === '.') {
                return <span key={i} className="text-yellow-500 text-3xl mx-[1px]">{digit}</span>;
              }
              return (
                <span 
                  key={i} 
                  className="w-[8%] h-10 bg-black rounded-sm flex items-center justify-center border border-yellow-500/30 mx-[1px] shadow-inner"
                >
                  <span className="text-yellow-500 text-2xl font-bold">{digit}</span>
                </span>
              );
            })}
            <span className="text-yellow-500 text-3xl font-bold ml-2">₺</span>
          </div>
        </div>
      </div>
      
      {/* Sağ taraf: Liderlik tablosu */}
      <div className="w-[45%] bg-[#1A1A1A] relative">
        {/* Liderlik tablosu başlığı */}
        <div className="absolute top-0 left-0 right-0 bg-yellow-500 px-3 py-1.5 flex items-center">
          <i className="fas fa-crown text-black mr-2"></i>
          <span className="text-black font-bold text-sm">LİDERLİK TABLOSU</span>
        </div>
        
        {/* Liderlik listesi */}
        <div className="pt-8 pb-2 px-2 h-full">
          <div className="flex flex-col h-full justify-center">
            {leaderboardData.map((leader) => (
              <div 
                key={leader.id} 
                className="bg-black border border-yellow-500/20 rounded px-2 py-1.5 mb-1.5 flex items-center"
              >
                {/* İkon ve kullanıcı adı */}
                <div className="flex items-center flex-grow">
                  <div className="w-6 h-6 rounded-full bg-black flex items-center justify-center mr-2 border border-yellow-500/30">
                    {getTypeIcon(leader.type)}
                  </div>
                  <div>
                    <div className="text-white text-xs font-bold">{leader.username}</div>
                    <div className="text-gray-400 text-[10px]">{getTypeMessage(leader.type)}</div>
                  </div>
                </div>
                
                {/* Tutar */}
                <div className="text-yellow-500 text-xs font-bold">{leader.amount.toLocaleString()} ₺</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfessionalJackpotNew;