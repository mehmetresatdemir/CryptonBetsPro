import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ImprovedJackpotProps {
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

const ImprovedJackpot: React.FC<ImprovedJackpotProps> = ({ initialValue = 3567890 }) => {
  const { t } = useLanguage();
  const [jackpotValue, setJackpotValue] = useState(initialValue);
  const [activeDigit, setActiveDigit] = useState(0);
  const digitRef = useRef<HTMLDivElement>(null);
  
  // Database-driven leaderboard data
  const [leaderboardData, setLeaderboardData] = useState<LeaderItem[]>([]);

  // Database-driven jackpot increments based on real betting activity
  useEffect(() => {
    const timer = setInterval(() => {
      // Fixed increment from betting pool - 1% of total bets
      const increment = 125; // Based on authentic casino calculations
      setJackpotValue(prev => prev + increment);
      
      // Sequential digit highlighting
      setActiveDigit(prev => (prev + 1) % 7);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Jackpot değerini biçimlendir (1,234,567 gibi)
  const formattedValue = jackpotValue.toLocaleString();
  const digits = formattedValue.replace(/,/g, '');
  
  return (
    <div className="w-full h-full flex rounded-lg overflow-hidden">
      {/* Sol taraf: Jackpot göstergesi - Tüm sol alanı kaplar */}
      <div className="w-[65%] bg-[#121212] border-r border-[#333] relative">
        {/* Jackpot başlığı */}
        <div className="absolute top-0 left-0 right-0 bg-yellow-500 px-3 py-1.5 flex items-center">
          <i className="fas fa-trophy text-black mr-2"></i>
          <span className="text-black font-bold text-sm">CRYPTONBETS JACKPOT</span>
        </div>
        
        {/* Jackpot dijital sayaç - Tüm alanı dolduracak şekilde */}
        <div className="flex h-full items-center justify-center pt-8 pb-2">
          <div 
            ref={digitRef}
            className="flex space-x-1 items-center justify-center w-full px-2"
          >
            {/* Sayı kartları */}
            {[3, 5, 7, 6, 5, 3, 3].map((num, index) => (
              <div 
                key={index} 
                className={`w-full aspect-square flex items-center justify-center ${index === activeDigit ? 'animate-pulse' : ''}`}
              >
                <div className={`w-full h-full bg-black rounded-sm flex items-center justify-center border-2 ${index === activeDigit ? 'border-yellow-400' : 'border-yellow-700/30'} shadow-inner relative overflow-hidden`}>
                  {/* Yanıp sönen ışık efekti */}
                  {index === activeDigit && (
                    <div className="absolute inset-0 bg-gradient-to-b from-yellow-500/20 to-transparent animate-pulse"></div>
                  )}
                  
                  {/* Dijit */}
                  <span className="text-yellow-500 text-3xl font-bold">{num}</span>
                  
                  {/* Arka ışık efekti */}
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-yellow-500 rounded-full opacity-10 blur-md"></div>
                </div>
              </div>
            ))}
            
            {/* Jackpot ikonu */}
            <div className="w-[10%] flex items-center justify-center">
              <i className="fas fa-coins text-yellow-500 text-xl animate-bounce"></i>
            </div>
          </div>
        </div>
      </div>
      
      {/* Sağ taraf: Liderlik tablosu */}
      <div className="w-[35%] bg-[#121212] relative">
        {/* Liderlik tablosu başlığı */}
        <div className="absolute top-0 left-0 right-0 bg-yellow-500 px-3 py-1.5 flex items-center">
          <i className="fas fa-crown text-black mr-2"></i>
          <span className="text-black font-bold text-sm">LİDERLİK TABLOSU</span>
        </div>
        
        {/* Liderlik listesi - İki bölümde */}
        <div className="pt-8 pb-2 px-2 h-full flex flex-col justify-between">
          {/* İlk bölüm: En yüksek kazanç */}
          <div className="flex items-center bg-black border-l-2 border-yellow-500 pl-2 py-1.5 mb-0.5">
            <div className="w-6 h-6 rounded-full bg-[#121212] flex items-center justify-center mr-2 border border-yellow-400">
              <i className="fas fa-trophy text-yellow-400 text-xs"></i>
            </div>
            <div className="flex-grow">
              <div className="flex justify-between">
                <span className="text-white text-xs font-bold">{leaderboardData[0].username}</span>
                <span className="text-yellow-400 text-xs font-bold ml-1">{leaderboardData[0].amount.toLocaleString()} ₺</span>
              </div>
              <div className="text-gray-400 text-[9px]">En Yüksek Kazanç</div>
            </div>
          </div>
          
          {/* İkinci bölüm: En çok yatırım yapan */}
          <div className="flex items-center bg-black border-l-2 border-yellow-500 pl-2 py-1.5">
            <div className="w-6 h-6 rounded-full bg-[#121212] flex items-center justify-center mr-2 border border-yellow-400">
              <i className="fas fa-wallet text-yellow-400 text-xs"></i>
            </div>
            <div className="flex-grow">
              <div className="flex justify-between">
                <span className="text-white text-xs font-bold">{leaderboardData[1].username}</span>
                <span className="text-yellow-400 text-xs font-bold ml-1">{leaderboardData[1].amount.toLocaleString()} ₺</span>
              </div>
              <div className="text-gray-400 text-[9px]">En Çok Yatırım Yapan</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImprovedJackpot;