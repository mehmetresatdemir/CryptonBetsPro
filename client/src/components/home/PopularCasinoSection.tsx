import { FC } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { translate } from '@/utils/i18n-fixed';

// Casino oyun resimleri
import casinoImage1 from '@assets/63217f1a2e3f5cd663428b01f8db3c353af73f6a92dd4c1c7ac0e042c8a543ce.jpeg';
import casinoImage2 from '@assets/2615333afe49632aa2dd264b555dfb89918a4767bb33f1e7a51e57d924c0f7b9.jpeg';
import casinoImage3 from '@assets/abdaac3c572c12b6d684d7dbac7bcb596b4aa862e62c934d119bffe9bd8e898b.jpeg';
import casinoImage4 from '@assets/b7c56c1f435977332147ebc56a83fd41141d9076372c76985d05250a018f8545.jpeg';
import casinoImage5 from '@assets/bdf1e0551a267f99f97a1ab8e44dba2bea02c60257a3069148a72f5516cda9cc.jpeg';
import casinoImage6 from '@assets/eab70cc0b96cb702661886d81177259818e54a980ea10e82a6e30cf76a132368.jpeg';
import casinoImage7 from '@assets/0d66d387be3e6e45ec761ea39b9b70781134ece83b961be845a8fd0f6fecd50d.jpeg';
import casinoImage8 from '@assets/1baebec3beda341c569962d9b13579d57b51e453bab452e2ed9d428dc852ca5f.jpeg';
import casinoImage9 from '@assets/2c50796ed74fcec02f4785a7401e081d676de5ec8f70b0c35d5d307c1e0000e0.jpeg';
import casinoImage10 from '@assets/7ad2edb2f6f7700a0b60b4d6da63c00b235b0963587ce15d266c21cfe308aee1.jpeg';
import casinoImage11 from '@assets/9bd8cb97d32d1d8796e3eb1a66fc6d85c1d31dc74c05e4b3404dc9339b6f2228.jpeg';
import casinoImage12 from '@assets/834bf04345dc54c83631b40911f2a71acccee1f93842b03eec4ee72bf34eab23.jpeg';

// Oyun verileri
const casinoGames = [
  { 
    id: 1, 
    name: 'Evolution Blackjack', 
    provider: 'EVOLUTION GAMING',
    image: casinoImage1,
    type: 'Canlı Blackjack'
  },
  { 
    id: 2, 
    name: 'Lightning Roulette', 
    provider: 'EVOLUTION GAMING',
    image: casinoImage2,
    type: 'Canlı Rulet'
  },
  { 
    id: 3, 
    name: 'VIP Baccarat', 
    provider: 'EVOLUTION GAMING',
    image: casinoImage3,
    type: 'Canlı Bakara'
  },
  { 
    id: 4, 
    name: 'Casino Hold\'em', 
    provider: 'EVOLUTION GAMING',
    image: casinoImage4,
    type: 'Canlı Poker'
  },
  { 
    id: 5, 
    name: 'Crazy Time', 
    provider: 'EVOLUTION GAMING',
    image: casinoImage5,
    type: 'Canlı Oyun Şovu'
  },
  { 
    id: 6, 
    name: 'Monopoly Live', 
    provider: 'EVOLUTION GAMING',
    image: casinoImage6,
    type: 'Canlı Oyun Şovu'
  },
  { 
    id: 7, 
    name: 'Dream Catcher', 
    provider: 'EVOLUTION GAMING',
    image: casinoImage7,
    type: 'Canlı Oyun Şovu'
  },
  { 
    id: 8, 
    name: 'Speed Baccarat', 
    provider: 'PRAGMATIC PLAY',
    image: casinoImage8,
    type: 'Canlı Bakara'
  },
  { 
    id: 9, 
    name: 'Auto Roulette', 
    provider: 'PRAGMATIC PLAY',
    image: casinoImage9,
    type: 'Canlı Rulet'
  },
  { 
    id: 10, 
    name: 'Mega Wheel', 
    provider: 'PRAGMATIC PLAY',
    image: casinoImage10,
    type: 'Canlı Oyun Şovu'
  },
  { 
    id: 11, 
    name: 'Sweet Bonanza CandyLand', 
    provider: 'PRAGMATIC PLAY',
    image: casinoImage11,
    type: 'Canlı Oyun Şovu'
  },
  { 
    id: 12, 
    name: 'Boom City', 
    provider: 'PRAGMATIC PLAY',
    image: casinoImage12,
    type: 'Canlı Oyun Şovu'
  },
  { 
    id: 13, 
    name: 'XXXTreme Lightning Roulette', 
    provider: 'EVOLUTION GAMING',
    image: casinoImage2,
    type: 'Canlı Rulet'
  },
  { 
    id: 14, 
    name: 'Mega Ball', 
    provider: 'EVOLUTION GAMING',
    image: casinoImage5,
    type: 'Canlı Oyun Şovu'
  },
  // Ek casino oyunları - farklılık için
  { 
    id: 15, 
    name: 'Power Blackjack', 
    provider: 'EVOLUTION GAMING',
    image: casinoImage1,
    type: 'Canlı Blackjack'
  },
  { 
    id: 16, 
    name: 'Speed Roulette', 
    provider: 'EVOLUTION GAMING',
    image: casinoImage2,
    type: 'Canlı Rulet'
  },
  { 
    id: 17, 
    name: 'Lightning Baccarat', 
    provider: 'EVOLUTION GAMING',
    image: casinoImage3,
    type: 'Canlı Bakara'
  },
  { 
    id: 18, 
    name: 'Three Card Poker', 
    provider: 'EVOLUTION GAMING',
    image: casinoImage4,
    type: 'Canlı Poker'
  },
  { 
    id: 19, 
    name: 'Money Wheel', 
    provider: 'EVOLUTION GAMING',
    image: casinoImage6,
    type: 'Canlı Oyun Şovu'
  },
  { 
    id: 20, 
    name: 'Lightning Dice', 
    provider: 'EVOLUTION GAMING',
    image: casinoImage7,
    type: 'Canlı Oyun Şovu'
  },
  { 
    id: 21, 
    name: 'Dragon Tiger', 
    provider: 'PRAGMATIC PLAY',
    image: casinoImage8,
    type: 'Canlı Dragon Tiger'
  },
  { 
    id: 22, 
    name: 'Mega Sic Bo', 
    provider: 'PRAGMATIC PLAY',
    image: casinoImage9,
    type: 'Canlı Sic Bo'
  },
  { 
    id: 23, 
    name: 'The Money Drop', 
    provider: 'PRAGMATIC PLAY',
    image: casinoImage10,
    type: 'Canlı Oyun Şovu'
  },
  { 
    id: 24, 
    name: 'Cash or Crash', 
    provider: 'EVOLUTION GAMING',
    image: casinoImage11,
    type: 'Canlı Oyun Şovu'
  },
  { 
    id: 25, 
    name: 'Gonzo\'s Treasure Hunt', 
    provider: 'EVOLUTION GAMING',
    image: casinoImage12,
    type: 'Canlı Oyun Şovu'
  },
  { 
    id: 26, 
    name: 'Infinite Blackjack', 
    provider: 'EVOLUTION GAMING',
    image: casinoImage1,
    type: 'Canlı Blackjack'
  },
  { 
    id: 27, 
    name: 'Football Studio', 
    provider: 'EVOLUTION GAMING',
    image: casinoImage2,
    type: 'Canlı Oyun Şovu'
  },
  { 
    id: 28, 
    name: 'Side Bet City', 
    provider: 'EVOLUTION GAMING',
    image: casinoImage3,
    type: 'Canlı Blackjack'
  },
];

const PopularCasinoSection: FC = () => {
  const { t } = useLanguage();
  
  // Oyunları karıştır ve farklı kombinasyonlar oluştur
  const shuffleArray = (array: any[]) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Farklı sıralarda farklı oyunlar göster
  const firstRowGames = [...casinoGames.slice(0, 14), ...casinoGames.slice(14, 28)];
  const secondRowGames = [...shuffleArray(casinoGames)];
  const mobileGames = [...shuffleArray(casinoGames)];
  
  return (
    <div className="w-full md:bg-gradient-to-r md:from-[#0A0A0A] md:via-[#121212] md:to-[#0A0A0A] bg-transparent md:border border-none md:border-gradient-to-r md:from-red-500/20 md:via-green-500/10 md:to-yellow-500/20 rounded-xl relative overflow-hidden md:mt-6 mt-2 mb-6 md:shadow-[0_0_30px_rgba(0,0,0,0.8)]">
      
      {/* Arka plan efekti - Casino temalı gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-60 hidden md:block"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-green-500/5 to-yellow-500/5 hidden md:block"></div>
      
      {/* Başlık - Casino temalı */}
      <div className="hidden md:flex flex-col space-y-3 mb-6 relative px-6 pt-4">
        <div className="relative">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#1A1A1A] via-[#222] to-[#1A1A1A] rounded-xl border border-red-500/20">
            <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 flex items-center justify-center rounded-lg shadow-lg">
              <i className="fas fa-dice text-white text-lg"></i>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-xl bg-gradient-to-r from-red-400 to-yellow-600 bg-clip-text text-transparent">{translate('home.popularCasino.title', 'Popüler Casino')}</span>
              <span className="text-gray-400 text-sm">Canlı Masalar & Oyun Şovları</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-400 text-xs font-medium">CANLI</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <button className="flex items-center text-sm bg-gradient-to-r from-[#222] to-[#333] hover:from-[#333] hover:to-[#444] px-4 py-2 rounded-lg shadow-lg border border-red-500/20 hover:border-red-500/40 transition-all duration-300 transform hover:scale-105">
            <i className="fas fa-fire-alt mr-2 text-red-400"></i>
            <span className="text-sm font-medium text-white">{translate('home.popularCasino.popularGames', 'Popüler Oyunlar')}</span>
          </button>
          
          <button className="flex items-center text-sm bg-gradient-to-r from-[#222] to-[#333] hover:from-[#333] hover:to-[#444] px-4 py-2 rounded-lg shadow-lg border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 transform hover:scale-105">
            <i className="fas fa-crown mr-2 text-yellow-400"></i>
            <span className="text-sm font-medium text-white">{translate('home.popularCasino.vipTables', 'VIP Masalar')}</span>
          </button>
        </div>
      </div>

      {/* Ana Animasyonlu Slider Container */}
      <div className="md:px-6 px-4 md:py-4 py-2">
        
        {/* Masaüstü - Çift Sıra Animasyonlu Slider */}
        <div className="hidden md:block space-y-4">
          
          {/* İlk sıra - Manuel kaydırma */}
          <div className="relative overflow-x-auto scrollbar-hide rounded-xl">
            <div className="flex gap-4 pb-2">
              {firstRowGames.map((game, index) => (
                <div key={`row1-${game.id}-${index}`} className="flex-none w-44 mx-2 group cursor-pointer">
                  <div className="relative overflow-hidden rounded-xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-1 border border-red-500/20 group-hover:border-red-500/60 shadow-lg group-hover:shadow-[0_0_25px_rgba(239,68,68,0.4)] aspect-[3/4]">
                    
                    {/* Parlama efekti */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 opacity-0 blur group-hover:opacity-30 transition-all duration-500 rounded-xl"></div>
                    
                    {/* Oyun görseli */}
                    <img
                      src={game.image}
                      alt={game.name}
                      className="w-full h-full object-cover rounded-xl relative z-10 group-hover:brightness-110 transition-all duration-500"
                    />
                    
                    {/* Canlı badge */}
                    <div className="absolute top-2 left-2 bg-red-600 text-white text-[10px] px-2 py-1 rounded-full font-bold flex items-center z-30 shadow-lg">
                      <span className="animate-pulse mr-1 bg-white h-1.5 w-1.5 rounded-full"></span>
                      CANLI
                    </div>
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20"></div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-30">
                      <p className="text-white text-sm font-bold text-center px-3 mb-1">{game.name}</p>
                      <span className="text-gray-300 text-xs mb-2">{game.type}</span>
                      <button className="px-4 py-2 bg-gradient-to-r from-red-400 to-red-600 text-white text-sm font-bold rounded-lg hover:from-red-300 hover:to-red-500 transition-all duration-300 shadow-lg transform hover:scale-105">
                        <i className="fas fa-play mr-2"></i>
                        {translate('home.popularCasino.play', 'OYNA')}
                      </button>
                    </div>
                    
                    {/* Provider badge */}
                    <div className="absolute bottom-2 left-2 right-2 text-center z-30">
                      <span className="text-xs text-red-400 font-bold bg-black/70 px-3 py-1 rounded-full border border-red-500/30">
                        {game.provider}
                      </span>
                    </div>
                    
                    {/* Köşe efekti */}
                    <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-red-500/20 group-hover:border-t-red-500/60 transition-colors duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* İkinci sıra - Manuel kaydırma */}
          <div className="relative overflow-x-auto scrollbar-hide rounded-xl">
            <div className="flex gap-4 pb-2">
              {secondRowGames.map((game, index) => (
                <div key={`row2-${game.id}-${index}`} className="flex-none w-44 mx-2 group cursor-pointer">
                  <div className="relative overflow-hidden rounded-xl transition-all duration-500 transform group-hover:scale-110 group-hover:-rotate-1 border border-green-500/20 group-hover:border-green-500/60 shadow-lg group-hover:shadow-[0_0_25px_rgba(34,197,94,0.4)] aspect-[3/4]">
                    
                    {/* Parlama efekti */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400 opacity-0 blur group-hover:opacity-30 transition-all duration-500 rounded-xl"></div>
                    
                    {/* Oyun görseli */}
                    <img
                      src={game.image}
                      alt={game.name}
                      className="w-full h-full object-cover rounded-xl relative z-10 group-hover:brightness-110 transition-all duration-500"
                    />
                    
                    {/* Canlı badge */}
                    <div className="absolute top-2 left-2 bg-green-600 text-white text-[10px] px-2 py-1 rounded-full font-bold flex items-center z-30 shadow-lg">
                      <span className="animate-pulse mr-1 bg-white h-1.5 w-1.5 rounded-full"></span>
                      CANLI
                    </div>
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20"></div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-30">
                      <p className="text-white text-sm font-bold text-center px-3 mb-1">{game.name}</p>
                      <span className="text-gray-300 text-xs mb-2">{game.type}</span>
                      <button className="px-4 py-2 bg-gradient-to-r from-green-400 to-green-600 text-white text-sm font-bold rounded-lg hover:from-green-300 hover:to-green-500 transition-all duration-300 shadow-lg transform hover:scale-105">
                        <i className="fas fa-play mr-2"></i>
                        {translate('home.popularCasino.play', 'OYNA')}
                      </button>
                    </div>
                    
                    {/* Provider badge */}
                    <div className="absolute bottom-2 left-2 right-2 text-center z-30">
                      <span className="text-xs text-green-400 font-bold bg-black/70 px-3 py-1 rounded-full border border-green-500/30">
                        {game.provider}
                      </span>
                    </div>
                    
                    {/* Köşe efekti */}
                    <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-green-500/20 group-hover:border-t-green-500/60 transition-colors duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Mobil - Manuel Kaydırma */}
        <div className="md:hidden w-full relative">
          <div className="flex items-center gap-3 pb-4 pl-0">
            <div className="w-6 h-6 bg-gradient-to-r from-red-400 to-yellow-400 rounded-full flex items-center justify-center">
              <i className="fas fa-dice text-white text-sm"></i>
            </div>
            <span className="text-white text-lg font-bold bg-gradient-to-r from-red-400 to-yellow-400 bg-clip-text text-transparent">Popüler Casino</span>
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse ml-auto"></div>
          </div>
          
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-2">
              {mobileGames.map((game, index) => (
                <div key={`mobile-${game.id}-${index}`} className="flex-none w-28 mx-1 group cursor-pointer">
                  <div className="relative rounded-lg overflow-hidden border border-red-500/30 group-hover:border-red-500/60 shadow-lg group-hover:shadow-[0_0_15px_rgba(239,68,68,0.3)] aspect-[3/4] transform group-hover:scale-105 transition-all duration-300">
                    
                    {/* Oyun görseli */}
                    <img
                      src={game.image}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                    />
                    
                    {/* Canlı badge - mobil */}
                    <div className="absolute top-1 left-1 bg-red-600 text-white text-[8px] px-1 py-0.5 rounded-sm font-bold flex items-center">
                      <span className="animate-pulse mr-0.5 bg-white h-1 w-1 rounded-full"></span>
                      CANLI
                    </div>
                    
                    {/* Karanlık gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                    
                    {/* Oyun bilgileri */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                      <p className="text-white text-xs font-bold line-clamp-1 mb-1">{game.name}</p>
                      <span className="text-red-400 text-[10px] font-medium block mb-1">{game.provider}</span>
                      
                      {/* Oyna butonu */}
                      <button className="w-full py-1 bg-gradient-to-r from-red-400 to-red-600 text-white text-xs font-bold rounded-sm hover:from-red-300 hover:to-red-500 transition-all duration-300">
                        OYNA
                      </button>
                    </div>
                    
                    {/* Parlama efekti */}
                    <div className="absolute -inset-0.5 bg-red-500 opacity-0 group-hover:opacity-20 transition-all duration-300 blur-sm"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopularCasinoSection;