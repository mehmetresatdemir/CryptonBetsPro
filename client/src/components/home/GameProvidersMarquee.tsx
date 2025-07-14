import { FC, useEffect, useRef } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useLanguage } from '@/contexts/LanguageContext';

// Marquee bileşeni, otomatik kayan elemanları gösterir
const Marquee: FC<{
  direction: 'left' | 'right';
  speed: number;
  className?: string;
  children: React.ReactNode;
}> = ({ direction, speed, className, children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);

  // Otomatik kayma efektinin kurulumu
  useEffect(() => {
    if (!containerRef.current || !scrollerRef.current) return;
    
    const scrollContainer = containerRef.current;
    const scrollContent = scrollerRef.current;
    
    // İçeriği klonlayıp sürekli bir kayma oluşturmak için
    const content = Array.from(scrollContent.children);
    content.forEach(item => {
      const clone = item.cloneNode(true);
      scrollContent.appendChild(clone);
    });

    // Scroll animasyonu
    let lastTime = 0;
    let animFrame: number;

    const step = (currentTime: number) => {
      if (!lastTime) lastTime = currentTime;
      const delta = currentTime - lastTime;
      
      if (direction === 'left') {
        scrollContainer.scrollLeft += speed * (delta / 1000);
        
        // Döngü efekti için scroll pozisyonunu kontrol et
        if (scrollContainer.scrollLeft >= scrollContent.clientWidth / 2) {
          scrollContainer.scrollLeft = 0;
        }
      } else {
        scrollContainer.scrollLeft -= speed * (delta / 1000);
        
        // Döngü efekti için scroll pozisyonunu kontrol et
        if (scrollContainer.scrollLeft <= 0) {
          scrollContainer.scrollLeft = scrollContent.clientWidth / 2;
        }
      }
      
      lastTime = currentTime;
      animFrame = requestAnimationFrame(step);
    };
    
    animFrame = requestAnimationFrame(step);
    
    // Temizleme işlemi
    return () => {
      cancelAnimationFrame(animFrame);
    };
  }, [direction, speed]);

  return (
    <div 
      ref={containerRef} 
      className={`overflow-hidden whitespace-nowrap ${className}`}
    >
      <div 
        ref={scrollerRef} 
        className="inline-flex"
      >
        {children}
      </div>
    </div>
  );
};

// Oyun sağlayıcılarının logoları için veriler
const providers = [
  { id: 1, name: 'Evolution Gaming', bgColor: '#111111', textColor: '#ffffff' },
  { id: 2, name: 'Pragmatic Play', bgColor: '#1a1a1a', textColor: '#FFD700' },
  { id: 3, name: 'Playtech', bgColor: '#0e0e0e', textColor: '#ffffff' },
  { id: 4, name: 'NetEnt', bgColor: '#151515', textColor: '#FFD700' },
  { id: 5, name: 'Microgaming', bgColor: '#121212', textColor: '#ffffff' },
  { id: 6, name: 'Ezugi', bgColor: '#0a0a0a', textColor: '#FFD700' },
  { id: 7, name: 'Red Tiger', bgColor: '#131313', textColor: '#ffffff' },
  { id: 8, name: 'Play\'n GO', bgColor: '#0d0d0d', textColor: '#FFD700' },
  { id: 9, name: 'Spinomenal', bgColor: '#141414', textColor: '#ffffff' },
  { id: 10, name: 'Quickspin', bgColor: '#181818', textColor: '#FFD700' },
  { id: 11, name: 'Yggdrasil', bgColor: '#101010', textColor: '#ffffff' },
  { id: 12, name: 'Betsoft', bgColor: '#161616', textColor: '#FFD700' },
];

const GameProvidersMarquee: FC = () => {
  const { translate } = useLanguage();
  return (
    <div className="w-full md:bg-[#0c0c0c] bg-transparent md:border border-none md:border-[#222] rounded-md relative overflow-hidden py-8 sm:py-10 mb-8 mt-6">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40 hidden md:block"></div>
      
      {/* Başlık - Mobil uyumlu */}
      <div className="relative z-[1] mb-6 sm:mb-8 text-center px-4 sm:px-0">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 bg-[#FFD700] flex items-center justify-center rounded-md">
            <i className="fas fa-handshake text-black text-lg"></i>
          </div>
          <h2 className="text-white font-bold text-lg ml-2">{t('home.gameProviders.title')}</h2>
        </div>

      </div>
      
      {/* Masaüstü için 3 satır kayan sağlayıcı logoları */}
      <div className="hidden md:block space-y-8 relative z-[1]">
        {/* Birinci satır - Sola kayan */}
        <Marquee direction="left" speed={30} className="py-2">
          {providers.slice(0, 8).map(provider => (
            <div 
              key={`row1-${provider.id}`} 
              className="mx-8 inline-flex flex-col items-center justify-center"
            >
              <div className="w-28 h-16 bg-[#151515] border border-[#333] rounded-md flex items-center justify-center shadow-lg hover:border-[#FFD700] transition-all duration-300">
                <span className="text-lg font-bold" style={{ color: provider.textColor }}>{provider.name.split(' ')[0]}</span>
              </div>
              <span className="text-[#FFD700] text-xs mt-2 font-medium">{provider.name}</span>
            </div>
          ))}
        </Marquee>
        
        {/* İkinci satır - Sağa kayan */}
        <Marquee direction="right" speed={25} className="py-2">
          {providers.slice(4, 12).map(provider => (
            <div 
              key={`row2-${provider.id}`} 
              className="mx-8 inline-flex flex-col items-center justify-center"
            >
              <div className="w-28 h-16 bg-[#151515] border border-[#333] rounded-md flex items-center justify-center shadow-lg hover:border-[#FFD700] transition-all duration-300">
                <span className="text-lg font-bold" style={{ color: provider.textColor }}>{provider.name.split(' ')[0]}</span>
              </div>
              <span className="text-[#FFD700] text-xs mt-2 font-medium">{provider.name}</span>
            </div>
          ))}
        </Marquee>
        
        {/* Üçüncü satır - Sola kayan */}
        <Marquee direction="left" speed={35} className="py-2">
          {providers.map(provider => (
            <div 
              key={`row3-${provider.id}`} 
              className="mx-8 inline-flex flex-col items-center justify-center"
            >
              <div className="w-28 h-16 bg-[#151515] border border-[#333] rounded-md flex items-center justify-center shadow-lg hover:border-[#FFD700] transition-all duration-300">
                <span className="text-lg font-bold" style={{ color: provider.textColor }}>{provider.name.split(' ')[0]}</span>
              </div>
              <span className="text-[#FFD700] text-xs mt-2 font-medium">{provider.name}</span>
            </div>
          ))}
        </Marquee>
      </div>

      {/* Mobil için tek satır kayan sağlayıcı logoları */}
      <div className="md:hidden relative z-[1]">
        {/* Tek satır - Sola kayan */}
        <Marquee direction="left" speed={40} className="py-2">
          {providers.map(provider => (
            <div 
              key={`mobile-${provider.id}`} 
              className="mx-4 inline-flex flex-col items-center justify-center"
            >
              <div className="w-24 h-14 bg-[#151515] border border-[#333] rounded-md flex items-center justify-center shadow-lg hover:border-[#FFD700] transition-all duration-300">
                <span className="text-base font-bold" style={{ color: provider.textColor }}>{provider.name.split(' ')[0]}</span>
              </div>
              <span className="text-[#FFD700] text-[10px] mt-1 font-medium">{provider.name}</span>
            </div>
          ))}
        </Marquee>
      </div>
    </div>
  );
};

export default GameProvidersMarquee;