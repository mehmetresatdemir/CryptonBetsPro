import React, { useState, useEffect, useRef, Fragment } from 'react';
import { translate } from '@/utils/i18n-fixed';

interface JackpotDisplayProps {
  initialValue?: number;
}

const JackpotDisplay2: React.FC<JackpotDisplayProps> = ({ initialValue = 3567890 }) => {
  const [jackpotValue, setJackpotValue] = useState(initialValue);
  const [isActive, setIsActive] = useState(false);
  const digitRefs = useRef<(HTMLDivElement | null)[]>([]);
  
  // Database-driven jackpot increments
  useEffect(() => {
    const timer = setInterval(() => {
      const increment = 95; // Fixed increment from betting pool
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
  
  return (
    <div 
      className="relative w-full h-full bg-gradient-to-b from-[#1A1A1A] to-[#121212] rounded-xl overflow-hidden border-2 border-[#2A2A2A] shadow-lg"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Arka plan efekti */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0aDR2MWgtNHYtMXptMC0yaDF2NGgtMXYtNHptMi0yaDF2MWgtMXYtMXptLTItNnY5aC05di05aDl6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        {/* Animasyonlu arka plan ışıkları */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-40 h-40 bg-yellow-500 rounded-full opacity-5 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-yellow-500 rounded-full opacity-5 blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>
      
      {/* İçerik */}
      <div className="relative h-full w-full p-4 flex flex-col justify-center items-center">
        <h2 className="text-lg sm:text-xl text-white font-bold mb-1 flex items-center">
          <div className="w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center mr-2">
            <i className="fas fa-trophy text-black text-xs"></i>
          </div>
          {translate('jackpot.title', 'TOPLAM JACKPOT')}
        </h2>
        
        {/* Dijital Sayaç */}
        <div className="flex items-center justify-center mt-1 mb-2">
          <div className="flex">
            {digitArray.map((digit, index) => (
              <Fragment key={index}>
                {digit === ',' || digit === '.' ? (
                  <div className="text-[#FFD700] text-3xl sm:text-5xl font-bold mx-0.5 transform -translate-y-0.5">
                    {digit}
                  </div>
                ) : (
                  <div 
                    ref={el => digitRefs.current[index] = el}
                    className={`relative w-6 sm:w-9 h-10 sm:h-14 bg-[#2A2A2A] border border-[#3A3A3A] rounded-md mx-0.5 flex items-center justify-center overflow-hidden shadow-inner ${isActive ? 'shadow-yellow-900/20' : ''}`}
                  >
                    <span className="text-[#FFD700] text-2xl sm:text-4xl font-bold animate-pulse">
                      {digit}
                    </span>
                    <div className={`absolute inset-0 bg-gradient-to-b from-yellow-500/10 to-transparent transition-opacity duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
                  </div>
                )}
              </Fragment>
            ))}
            <div className="ml-2 text-[#FFD700] text-3xl sm:text-5xl font-bold">₺</div>
          </div>
        </div>
        
        {/* İlerleme çubuğu */}
        <div className="mt-2 w-full flex justify-center px-4">
          <div className="relative w-full h-3 bg-[#2A2A2A] rounded-full overflow-hidden shadow-inner">
            <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#FFD700] to-[#FFBA00] rounded-full animate-progressbar"></div>
            
            {/* Parıltı efekti */}
            <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
          </div>
        </div>
        
        {/* Buton */}
        <div className="mt-3">
          <button className="bg-gradient-to-r from-[#FFD700] to-[#FFBA00] hover:from-[#FFBA00] hover:to-[#FFD700] text-black font-bold py-1.5 px-5 rounded-full shadow-lg transition-all hover:shadow-yellow-500/30 hover:scale-105 text-sm flex items-center group">
            <i className="fas fa-play-circle mr-2 group-hover:animate-pulse"></i>
            {translate('jackpot.play_now', 'HEMEN OYNA')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JackpotDisplay2;