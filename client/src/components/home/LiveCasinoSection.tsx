import React from "react";
import { casinoGames as defaultCasinoGames, CasinoGame } from "@/data/casino";
import GameCard from "@/components/ui/game-card";

interface LiveCasinoSectionProps {
  title?: string;
  casinoGames?: CasinoGame[];
}

const LiveCasinoSection: React.FC<LiveCasinoSectionProps> = ({ 
  title = "CASINO",
  casinoGames = defaultCasinoGames
}) => {
  // Roulette ve metrics footer içeriklerini oluşturan yardımcı fonksiyonlar
  const createRouletteFooter = () => (
    <div className="flex items-center justify-center space-x-1 mt-1">
      <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
        <span className="text-[8px] text-white">14</span>
      </div>
      <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">
        <span className="text-[8px] text-white">11</span>
      </div>
      <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
        <span className="text-[8px] text-white">30</span>
      </div>
      <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center">
        <span className="text-[8px] text-white">2</span>
      </div>
      <div className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center">
        <span className="text-[8px] text-white">36</span>
      </div>
    </div>
  );
  
  const createMetricsFooter = (multiplier: string = "4.57x") => (
    <div className="flex items-center justify-between mt-1 px-2">
      <div className="flex items-center space-x-1">
        <span className="text-xs text-[#FFD700] font-semibold">{multiplier}</span>
      </div>
      <div className="bg-green-700 text-white text-[10px] px-1.5 py-0.5 rounded">CANLI</div>
    </div>
  );

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4 px-4">
        <div className="flex items-center">
          <i className="fas fa-dice text-[#FFD700] mr-2 text-lg"></i>
          <h2 className="text-white font-semibold tracking-wide">{title}</h2>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="flex items-center text-sm bg-[#222222] hover:bg-[#333333] px-3 py-1.5 rounded-md shadow-md border border-[#444444] transition-all">
            <i className="fas fa-fire-alt mr-1.5 text-[#FFD700]"></i>
            <span className="text-sm font-medium">Tüm Masalar</span>
          </button>
        </div>
      </div>
      
      {/* Live Casino Grid Container */}
      <div className="relative px-4">
        <div className="grid grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 max-w-full overflow-x-auto pb-2 scrollbar-hide">
          {casinoGames.map((game: CasinoGame, index: number) => (
            <div 
              key={game.id || index} 
              className="relative group cursor-pointer transform transition-transform duration-300 hover:scale-[1.02]"
              style={{minWidth: "130px"}}
            >
              <div 
                className={`aspect-[4/5] ${game.bgClass} rounded-lg overflow-hidden relative shadow-lg`}
              >
                {/* Game Title & Subtitle */}
                <div className="absolute bottom-0 left-0 right-0 p-2 text-center bg-gradient-to-t from-black to-transparent">
                  <h3 className="text-white font-bold text-sm">{game.title}</h3>
                  {game.subtitle && (
                    <p className="text-gray-300 text-xs">{game.subtitle}</p>
                  )}
                </div>
                
                {/* Footer Content (Roulette Numbers or Metrics) */}
                {game.footerType === "roulette" && (
                  <div className="absolute bottom-0 left-0 right-0">
                    {createRouletteFooter()}
                  </div>
                )}
                
                {game.footerType === "metrics" && (
                  <div className="absolute bottom-0 left-0 right-0">
                    {createMetricsFooter()}
                  </div>
                )}
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300"></div>
                
                {/* Special Badge for VIP Games */}
                {game.isSpecial && (
                  <div className="absolute top-2 right-2 bg-[#FFD700] text-[#121212] text-xs font-bold px-2 py-0.5 rounded-full">
                    VIP
                  </div>
                )}
                
                {/* Play Button on Hover */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <button className="bg-[#FFD700] text-[#121212] font-bold text-sm px-4 py-1 rounded-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    OYNA
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LiveCasinoSection;
