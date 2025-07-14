import React, { useState, useEffect } from 'react';
import { translate } from '@/utils/i18n-fixed';

interface JackpotDisplayProps {
  initialValue?: number;
}

const JackpotDisplay: React.FC<JackpotDisplayProps> = ({ initialValue = 123456 }) => {
  const [jackpotValue, setJackpotValue] = useState(initialValue);
  
  // Her saniye jackpot değerini rastgele arttır
  useEffect(() => {
    const timer = setInterval(() => {
      const increment = 75; // Fixed increment from betting pool
      setJackpotValue(prev => prev + increment);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Jackpot değerini biçimlendir (1,234,567 gibi)
  const formattedValue = jackpotValue.toLocaleString();
  
  return (
    <div className="relative w-full h-full bg-gradient-to-b from-[#1A1A1A] to-[#121212] rounded-xl overflow-hidden border-2 border-[#2A2A2A] shadow-lg">
      {/* Arka plan efekti */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptMi0yaDF2MWgtMXYtMXptLTItNnY5aC05di05aDl6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
      </div>
      
      {/* İçerik */}
      <div className="relative h-full w-full p-4 flex flex-col justify-center items-center">
        <div className="absolute -top-5 -right-5 w-24 h-24 bg-[#FFD700] opacity-5 rounded-full blur-lg"></div>
        
        <div className="flex flex-col items-center justify-center">
          <h2 className="text-lg sm:text-xl text-white font-bold mb-1">{translate('jackpot.title', 'TOPLAM JACKPOT')}</h2>
          <div className="flex items-center">
            <div className="inline-block bg-gradient-to-r from-yellow-500 to-[#FFD700] text-transparent bg-clip-text text-3xl sm:text-5xl font-bold animate-pulse">
              {formattedValue} ₺
            </div>
          </div>
          
          <div className="mt-4 flex w-full justify-center">
            <div className="relative w-4/5 h-3 bg-[#2A2A2A] rounded-full overflow-hidden">
              <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FFD700] to-[#FFBA00] rounded-full animate-progressbar"></div>
            </div>
          </div>
          
          <div className="mt-4">
            <button className="bg-gradient-to-r from-[#FFD700] to-[#FFBA00] hover:from-[#FFBA00] hover:to-[#FFD700] text-black font-bold py-2 px-6 rounded-full shadow-lg transition-all hover:shadow-yellow-500/50 hover:scale-105 text-sm flex items-center">
              <i className="fas fa-play-circle mr-2"></i>
              {translate('jackpot.play_now', 'HEMEN OYNA')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JackpotDisplay;