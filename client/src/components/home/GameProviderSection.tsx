import { FC } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { translate } from '@/utils/i18n-fixed';
import { providerLogos } from '@/data/providerLogos';

const GameProviderSection: FC = () => {
  const { t } = useLanguage();
  
  return (
    <div className="w-full md:bg-[#0c0c0c] bg-transparent md:border border-none md:border-[#222] rounded-md relative overflow-hidden md:mt-6 mt-2 mb-6">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40 hidden md:block"></div>
      
      {/* Başlık - Diğer bölümlerle aynı stilde */}
      <div className="md:flex hidden flex-col space-y-2.5 mb-4 relative px-3 sm:px-6 pt-2">
        <div className="relative">
          <div className="absolute top-0 left-0 z-10 bg-gradient-to-r from-[#111] to-transparent p-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#FFD700] flex items-center justify-center rounded-md">
                <i className="fas fa-puzzle-piece text-black text-lg"></i>
              </div>
              <span className="text-white font-bold text-lg">{translate('home.gameProviders.title')}</span>
            </div>
          </div>
        </div>
        
        <div className="h-14"></div>
      </div>

      {/* Sağlayıcılar - Mobil için yatay kaydırılabilir */}
      <div className="md:px-3 px-0 sm:px-6 md:py-4 py-0 overflow-hidden relative z-10">
        {/* Bilgi mesajı - Masaüstünde görünecek */}
        <div className="mb-4 text-sm text-gray-400 hidden md:flex items-center gap-1 pl-1">
          <i className="fas fa-info-circle text-[#FFD700]"></i>
          <span>{translate('home.gameProviders.info')}</span>
        </div>
        
        {/* Mobil için özel başlık */}
        <div className="md:hidden flex items-center gap-2 pb-2 mb-3 pl-0">
          <div className="w-5 h-5 bg-[#FFD700] rounded-full flex items-center justify-center">
            <i className="fas fa-puzzle-piece text-black text-xs"></i>
          </div>
          <span className="text-white text-sm font-semibold">{translate('home.gameProviders.title')}</span>
        </div>
        
        {/* Masaüstü için orjinal sağlayıcı logoları - Yatay kaydırmalı */}
        <div className="hidden md:flex overflow-x-auto hide-scrollbar pb-4 -mx-1">
          {providerLogos.map((provider) => (
            <div key={`desktop-${provider.id}`} className="flex-shrink-0 px-1 w-36 sm:w-44">
              <div className="h-20 bg-[#1A1A1A] rounded-md border border-[#333] hover:border-[#FFD700] transition-colors duration-300 p-2 flex items-center justify-center group cursor-pointer">
                {/* Logo etrafında parlama efekti */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <div className="absolute inset-0 bg-[#FFD700] opacity-0 blur-md group-hover:opacity-10 rounded-md transition-opacity duration-300"></div>
                  <img 
                    src={provider.logo} 
                    alt={provider.name} 
                    className="max-h-full max-w-full object-contain filter brightness-90 group-hover:brightness-110 transition-all duration-300"
                  />
                </div>
              </div>
              <div className="mt-1 text-center">
                <span className="text-xs text-gray-400">{provider.name}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mobil için yenilenmiş modern logo kartsarı - Tek sıra kaydırmalı, daha kompakt */}
        <div className="md:hidden flex overflow-x-auto no-scrollbar pb-3 snap-x snap-mandatory pl-0">
          <div className="flex gap-3 pr-4">
            {providerLogos.map((provider) => (
              <div key={`mobile-${provider.id}`} className="flex-none w-[100px] snap-start group">
                <div className="relative rounded-lg overflow-hidden shadow-lg aspect-square bg-gradient-to-b from-[#252525] to-[#1A1A1A]">
                  {/* Logo arka planında kademe */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="absolute w-20 h-20 rounded-full bg-[#FFD700]/5"></div>
                    <div className="absolute w-16 h-16 rounded-full bg-[#FFD700]/10"></div>
                    <div className="absolute w-12 h-12 rounded-full bg-[#FFD700]/20"></div>
                  </div>
                  
                  {/* Logo görünümü */}
                  <div className="flex items-center justify-center w-full h-full">
                    <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/90"></div>
                    <div className="w-3/4 h-3/4 flex items-center justify-center p-3 relative z-10">
                      <img 
                        src={provider.logo} 
                        alt={provider.name} 
                        className="max-h-full max-w-full object-contain filter drop-shadow-lg"
                        loading="lazy"
                      />
                    </div>
                    
                    {/* Sağlayıcı adı - Altta */}
                    <div className="absolute bottom-0 left-0 right-0 text-center p-2">
                      <span className="text-[10px] text-white font-medium">{provider.name}</span>
                    </div>
                  </div>
                  
                  {/* Parlama efekti - hover durumunda */}
                  <div className="absolute inset-0 bg-[#FFD700] opacity-0 group-hover:opacity-20 transition-all duration-300"></div>
                  
                  {/* Üst kısım sınır çizgisi */}
                  <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-[#FFD700]/20 to-transparent"></div>
                </div>
              </div>
            ))}
            
            {/* Tümünü gör kartı */}
            <div className="flex-none w-[100px] snap-start">
              <div className="flex items-center justify-center h-full aspect-square rounded-lg border border-dashed border-[#FFD700]/30 bg-[#1A1A1A]/30">
                <div className="text-center">
                  <i className="fas fa-chevron-right text-[#FFD700] text-xl mb-2 block"></i>
                  <span className="text-[#FFD700] text-[10px] font-medium block">Tümünü Gör</span>
                  <span className="text-[#FFD700]/70 text-[8px] block mt-1">{providerLogos.length}+ Sağlayıcı</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Tüm sağlayıcıları göster butonu - Sadece masaüstünde */}
        <div className="hidden md:flex justify-center mt-2">
          <button className="px-4 py-2 bg-transparent border border-[#FFD700] text-[#FFD700] hover:bg-[#FFD700]/10 transition-colors duration-300 rounded-full text-sm font-medium group">
            {translate('home.gameProviders.viewAll', 'Tümünü Göster')}
            <i className="fas fa-chevron-right ml-2 group-hover:ml-3 transition-all duration-300"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GameProviderSection;