import { FC } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { translate } from '@/utils/i18n-fixed';

// Slot oyun görsellerini içe aktarma
import fiveLions from '../../assets/0eeb084b421e2e96d17fce52d9bd81ca5c7396e8035beaf30e84a8510169e1b4.png';
import biggerBassSplash from '../../assets/181ccd872939a7a23b955a3de13bb83cc2c923e20fe358c37f70d3f9af533e7e.png';
import chilliHeat from '../../assets/chilli-heat.jpg';
import extraJuicy from '../../assets/extra-juicy.jpg';
import fruitParty from '../../assets/fruit-party.jpg';
import gatesOfOlympus from '../../assets/gates-of-olympus.jpg';
import greatRhino from '../../assets/great-rhino.jpg';
import jokersJewels from '../../assets/jokers-jewels.jpg';
import mustangGold from '../../assets/mustang-gold.jpg';
import releaseTheKraken from '../../assets/release-the-kraken.jpg';
import sweetBonanza from '../../assets/sweet-bonanza.jpg';
import theDogHouse from '../../assets/the-dog-house.jpg';
import wildWestGold from '../../assets/wild-west-gold.jpg';
import wolfGold from '../../assets/wolf-gold.jpg';

const PopularSlotsSection: FC = () => {
  const { t } = useLanguage();
  
  // Oyun verilerini bir dizi içinde tanımlama
  const slotGames = [
    { id: 1, name: '5 Lions Megaways 2', image: fiveLions, provider: 'PRAGMATIC PLAY' },
    { id: 2, name: 'Bigger Bass Splash', image: biggerBassSplash, provider: 'PRAGMATIC PLAY' },
    { id: 3, name: 'Chilli Heat', image: chilliHeat, provider: 'PRAGMATIC PLAY' },
    { id: 4, name: 'Extra Juicy', image: extraJuicy, provider: 'PRAGMATIC PLAY' },
    { id: 5, name: 'Fruit Party', image: fruitParty, provider: 'PRAGMATIC PLAY' },
    { id: 6, name: 'Gates of Olympus', image: gatesOfOlympus, provider: 'PRAGMATIC PLAY' },
    { id: 7, name: 'Great Rhino', image: greatRhino, provider: 'PRAGMATIC PLAY' },
    { id: 8, name: 'Joker\'s Jewels', image: jokersJewels, provider: 'PRAGMATIC PLAY' },
    { id: 9, name: 'Mustang Gold', image: mustangGold, provider: 'PRAGMATIC PLAY' },
    { id: 10, name: 'Release the Kraken', image: releaseTheKraken, provider: 'PRAGMATIC PLAY' },
    { id: 11, name: 'Sweet Bonanza', image: sweetBonanza, provider: 'PRAGMATIC PLAY' },
    { id: 12, name: 'The Dog House', image: theDogHouse, provider: 'PRAGMATIC PLAY' },
    { id: 13, name: 'Wild West Gold', image: wildWestGold, provider: 'PRAGMATIC PLAY' },
    { id: 14, name: 'Wolf Gold', image: wolfGold, provider: 'PRAGMATIC PLAY' },
    // Ek oyunlar - farklılık için
    { id: 15, name: 'Book of Dead', image: fiveLions, provider: 'PLAY\'N GO' },
    { id: 16, name: 'Starburst', image: biggerBassSplash, provider: 'NETENT' },
    { id: 17, name: 'Gonzo\'s Quest', image: chilliHeat, provider: 'NETENT' },
    { id: 18, name: 'Mega Moolah', image: extraJuicy, provider: 'MICROGAMING' },
    { id: 19, name: 'Reactoonz', image: fruitParty, provider: 'PLAY\'N GO' },
    { id: 20, name: 'Fire Joker', image: gatesOfOlympus, provider: 'PLAY\'N GO' },
    { id: 21, name: 'Jammin\' Jars', image: greatRhino, provider: 'PUSH GAMING' },
    { id: 22, name: 'Razor Shark', image: jokersJewels, provider: 'PUSH GAMING' },
    { id: 23, name: 'Money Train 2', image: mustangGold, provider: 'RELAX GAMING' },
    { id: 24, name: 'Dead or Alive 2', image: releaseTheKraken, provider: 'NETENT' },
    { id: 25, name: 'Bonanza', image: sweetBonanza, provider: 'BIG TIME GAMING' },
    { id: 26, name: 'Book of Ra', image: theDogHouse, provider: 'NOVOMATIC' },
    { id: 27, name: 'Immortal Romance', image: wildWestGold, provider: 'MICROGAMING' },
    { id: 28, name: 'Thunderstruck II', image: wolfGold, provider: 'MICROGAMING' },
  ];

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
  const firstRowGames = [...slotGames.slice(0, 14), ...slotGames.slice(14, 28)];
  const secondRowGames = [...shuffleArray(slotGames)];
  const mobileGames = [...shuffleArray(slotGames)];

  return (
    <div className="w-full md:bg-gradient-to-r md:from-[#0A0A0A] md:via-[#121212] md:to-[#0A0A0A] bg-transparent md:border border-none md:border-gradient-to-r md:from-yellow-500/20 md:via-purple-500/10 md:to-yellow-500/20 rounded-xl relative overflow-hidden md:mt-6 mt-2 mb-6 md:shadow-[0_0_30px_rgba(0,0,0,0.8)]">
      
      {/* Arka plan efekti - Gelişmiş gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-60 hidden md:block"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 via-purple-500/5 to-blue-500/5 hidden md:block"></div>
      
      {/* Başlık - Güzelleştirilmiş */}
      <div className="hidden md:flex flex-col space-y-3 mb-6 relative px-6 pt-4">
        <div className="relative">
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#1A1A1A] via-[#222] to-[#1A1A1A] rounded-xl border border-yellow-500/20">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center rounded-lg shadow-lg">
              <i className="fas fa-gamepad text-black text-lg"></i>
            </div>
            <div className="flex flex-col">
              <span className="text-white font-bold text-xl bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">{translate('home.popularSlots.title', 'Popüler Slotlar')}</span>
              <span className="text-gray-400 text-sm">En Çok Oynanan Oyunlar</span>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-green-400 text-xs font-medium">CANLI</span>
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2">
          <button className="flex items-center text-sm bg-gradient-to-r from-[#222] to-[#333] hover:from-[#333] hover:to-[#444] px-4 py-2 rounded-lg shadow-lg border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300 transform hover:scale-105">
            <i className="fas fa-fire-alt mr-2 text-yellow-400"></i>
            <span className="text-sm font-medium text-white">{translate('home.popularSlots.allGamesButton', 'Tüm Oyunlar')}</span>
          </button>
          
          <button className="flex items-center text-sm bg-gradient-to-r from-[#222] to-[#333] hover:from-[#333] hover:to-[#444] px-4 py-2 rounded-lg shadow-lg border border-purple-500/20 hover:border-purple-500/40 transition-all duration-300 transform hover:scale-105">
            <i className="fas fa-star mr-2 text-purple-400"></i>
            <span className="text-sm font-medium text-white">{translate('home.popularSlots.newGames', 'Yeni Oyunlar')}</span>
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
                  <div className="relative overflow-hidden rounded-xl transition-all duration-500 transform group-hover:scale-110 group-hover:rotate-1 border border-yellow-500/20 group-hover:border-yellow-500/60 shadow-lg group-hover:shadow-[0_0_25px_rgba(255,215,0,0.4)] aspect-[3/4]">
                    
                    {/* Parlama efekti */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-purple-400 to-blue-400 opacity-0 blur group-hover:opacity-30 transition-all duration-500 rounded-xl"></div>
                    
                    {/* Oyun görseli */}
                    <img
                      src={game.image}
                      alt={game.name}
                      className="w-full h-full object-cover rounded-xl relative z-10 group-hover:brightness-110 transition-all duration-500"
                    />
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20"></div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-30">
                      <p className="text-white text-sm font-bold text-center px-3 mb-2">{game.name}</p>
                      <button className="px-4 py-2 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-sm font-bold rounded-lg hover:from-yellow-300 hover:to-yellow-500 transition-all duration-300 shadow-lg transform hover:scale-105">
                        <i className="fas fa-play mr-2"></i>
                        {translate('home.popularSlots.play', 'OYNA')}
                      </button>
                    </div>
                    
                    {/* Provider badge */}
                    <div className="absolute bottom-2 left-2 right-2 text-center z-30">
                      <span className="text-xs text-yellow-400 font-bold bg-black/70 px-3 py-1 rounded-full border border-yellow-500/30">
                        {game.provider}
                      </span>
                    </div>
                    
                    {/* Köşe efekti */}
                    <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-yellow-500/20 group-hover:border-t-yellow-500/60 transition-colors duration-300"></div>
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
                  <div className="relative overflow-hidden rounded-xl transition-all duration-500 transform group-hover:scale-110 group-hover:-rotate-1 border border-purple-500/20 group-hover:border-purple-500/60 shadow-lg group-hover:shadow-[0_0_25px_rgba(147,51,234,0.4)] aspect-[3/4]">
                    
                    {/* Parlama efekti */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 opacity-0 blur group-hover:opacity-30 transition-all duration-500 rounded-xl"></div>
                    
                    {/* Oyun görseli */}
                    <img
                      src={game.image}
                      alt={game.name}
                      className="w-full h-full object-cover rounded-xl relative z-10 group-hover:brightness-110 transition-all duration-500"
                    />
                    
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-20"></div>
                    
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500 z-30">
                      <p className="text-white text-sm font-bold text-center px-3 mb-2">{game.name}</p>
                      <button className="px-4 py-2 bg-gradient-to-r from-purple-400 to-purple-600 text-white text-sm font-bold rounded-lg hover:from-purple-300 hover:to-purple-500 transition-all duration-300 shadow-lg transform hover:scale-105">
                        <i className="fas fa-play mr-2"></i>
                        {translate('home.popularSlots.play', 'OYNA')}
                      </button>
                    </div>
                    
                    {/* Provider badge */}
                    <div className="absolute bottom-2 left-2 right-2 text-center z-30">
                      <span className="text-xs text-purple-400 font-bold bg-black/70 px-3 py-1 rounded-full border border-purple-500/30">
                        {game.provider}
                      </span>
                    </div>
                    
                    {/* Köşe efekti */}
                    <div className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-purple-500/20 group-hover:border-t-purple-500/60 transition-colors duration-300"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Mobil - Manuel Kaydırma */}
        <div className="md:hidden w-full relative">
          <div className="flex items-center gap-3 pb-4 pl-0">
            <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-purple-400 rounded-full flex items-center justify-center">
              <i className="fas fa-fire text-black text-sm"></i>
            </div>
            <span className="text-white text-lg font-bold bg-gradient-to-r from-yellow-400 to-purple-400 bg-clip-text text-transparent">Popüler Slotlar</span>
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse ml-auto"></div>
          </div>
          
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 pb-2">
              {mobileGames.map((game, index) => (
                <div key={`mobile-${game.id}-${index}`} className="flex-none w-28 mx-1 group cursor-pointer">
                  <div className="relative rounded-lg overflow-hidden border border-yellow-500/30 group-hover:border-yellow-500/60 shadow-lg group-hover:shadow-[0_0_15px_rgba(255,215,0,0.3)] aspect-[3/4] transform group-hover:scale-105 transition-all duration-300">
                    
                    {/* Oyun görseli */}
                    <img
                      src={game.image}
                      alt={game.name}
                      className="w-full h-full object-cover group-hover:brightness-110 transition-all duration-300"
                    />
                    
                    {/* Karanlık gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>
                    
                    {/* Oyun bilgileri */}
                    <div className="absolute bottom-0 left-0 right-0 p-2 text-center">
                      <p className="text-white text-xs font-bold line-clamp-1 mb-1">{game.name}</p>
                      <span className="text-yellow-400 text-[10px] font-medium block mb-1">{game.provider}</span>
                      
                      {/* Oyna butonu */}
                      <button className="w-full py-1 bg-gradient-to-r from-yellow-400 to-yellow-600 text-black text-xs font-bold rounded-sm hover:from-yellow-300 hover:to-yellow-500 transition-all duration-300">
                        OYNA
                      </button>
                    </div>
                    
                    {/* Parlama efekti */}
                    <div className="absolute -inset-0.5 bg-yellow-500 opacity-0 group-hover:opacity-20 transition-all duration-300 blur-sm"></div>
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

export default PopularSlotsSection;