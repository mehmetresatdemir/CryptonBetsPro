import React, { useState, useEffect, useRef, useMemo } from "react";
import { Link } from "wouter";
import hosgeldinSlider from "@/assets/hosgeldin-slider.png";
import vipBanner from "@/assets/images/vip-luxury.png"; // Lüks VIP görselini kullanıyoruz
import vipDesign from "@/assets/images/vip-design.png";
import bonusBanner from "@/assets/images/bonus-banner.png";
import bonusCardImage from "@/assets/images/bonus-banner.png";
import kayipBonusImage from "@/assets/images/kayip-bonus.png";
import zeusSlotBonusImage from "@/assets/images/zeus-bonus.png";
import vipCrownImage from "@/assets/images/vip-crown.png";
import bonusGoldImage from "@/assets/images/bonus-gold.png";
import wizardSlotBonusImage from "@/assets/images/wizard-slot-bonus.png";
import vipKingImage from "@/assets/images/vip-king-queen.png";
import trialBonusImage from "@/assets/images/trial-bonus.png";
import loyaltyBonusImage from "@/assets/images/loyalty-bonus.png";
import { useLanguage } from "@/contexts/LanguageContext";

const HeroCarousel: React.FC = () => {
  const { t, language } = useLanguage();
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const autoPlayTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [activeButton, setActiveButton] = useState<number | null>(null);
  
  // Slider içeriği - Daha zengin seçeneklerle
  const slides = useMemo(() => [
    {
      id: 1,
      image: hosgeldinSlider,
      title: "%100",
      subtitle: "HOŞGELDİN BONUSU",
      description: "İlk yatırımınıza özel %100 bonus",
      buttonText: "İNCELE",
      gradient: "from-yellow-500 via-amber-500 to-orange-500",
      textColor: "text-white",
      buttonGradient: "from-yellow-400 to-yellow-600", 
      buttonTextColor: "text-black",
      position: "left" // İçerik pozisyonu
    },
    {
      id: 6,
      image: trialBonusImage,
      title: "200 TL",
      subtitle: "DENEME BONUSU",
      description: "Yeni üyelere özel 200 TL deneme bonusu",
      buttonText: "DETAYLAR",
      gradient: "from-yellow-600 via-amber-500 to-yellow-300",
      textColor: "text-white",
      buttonGradient: "from-yellow-400 to-yellow-600",
      buttonTextColor: "text-black",
      position: "left",
      imagePosition: "center 15%" // Görselin yukarı kaydırılması
    },
    {
      id: 2,
      image: zeusSlotBonusImage,
      title: "%50",
      subtitle: "SLOT BONUSU",
      description: "Tüm slot oyunlarında %50 ekstra bonus",
      buttonText: "DETAYLAR",
      gradient: "from-yellow-500 via-amber-600 to-red-700",
      textColor: "text-white",
      buttonGradient: "from-yellow-400 to-yellow-600",
      buttonTextColor: "text-black",
      position: "left" // İçerik pozisyonu - sol tarafta
    },
    {
      id: 3,
      image: wizardSlotBonusImage,
      title: "%100",
      subtitle: "CUMARTESİ SLOT BONUSU",
      description: "Her cumartesi slot bonusu %100 olarak",
      buttonText: "DETAYLAR",
      gradient: "from-violet-600 via-purple-500 to-indigo-700",
      textColor: "text-white",
      buttonGradient: "from-yellow-400 to-yellow-600",
      buttonTextColor: "text-black",
      position: "left" // İçerik pozisyonu
    },
    {
      id: 4,
      image: kayipBonusImage,
      title: "%25",
      subtitle: "KAYIP BONUSU",
      description: "Haftalık %30'a varan kayıp bonusu",
      buttonText: "DETAYLAR",
      gradient: "from-emerald-500 via-teal-500 to-teal-600",
      textColor: "text-white",
      buttonGradient: "from-yellow-400 to-yellow-600",
      buttonTextColor: "text-black",
      position: "left" // İçerik pozisyonu
    },
    {
      id: 7,
      image: loyaltyBonusImage,
      title: "%15",
      subtitle: "SADAKAT BONUSU",
      description: "Düzenli üyeler için aylık %15 sadakat bonusu",
      buttonText: "DETAYLAR",
      gradient: "from-amber-600 via-yellow-500 to-amber-400",
      textColor: "text-white",
      buttonGradient: "from-yellow-400 to-yellow-600",
      buttonTextColor: "text-black",
      position: "left",
      imagePosition: "center 15%" // Görselin yukarı kaydırılması
    },
    {
      id: 5,
      image: vipKingImage,
      title: "VIP",
      subtitle: "VIP ÜYELİK",
      description: "Özel VIP avantajlarını keşfedin",
      buttonText: "VIP OL",
      gradient: "from-indigo-600 via-purple-500 to-purple-700",
      textColor: "text-white",
      buttonGradient: "from-yellow-400 to-yellow-600",
      buttonTextColor: "text-black",
      position: "left", // İçerik pozisyonu
      imagePosition: "center 5%" // Görselin daha yukarı kaydırılması
    }
  ], [language, t]);

  // Otomatik slider kontrolü
  const startAutoPlay = () => {
    if (autoPlayTimeoutRef.current) {
      clearTimeout(autoPlayTimeoutRef.current);
    }
    
    if (isAutoPlaying) {
      autoPlayTimeoutRef.current = setTimeout(() => {
        setActiveSlide((prevSlide) => (prevSlide + 1) % slides.length);
      }, 6000);
    }
  };
  
  // Otomatik slider başlatma ve temizleme
  useEffect(() => {
    startAutoPlay();
    return () => {
      if (autoPlayTimeoutRef.current) {
        clearTimeout(autoPlayTimeoutRef.current);
      }
    };
  }, [activeSlide, isAutoPlaying, slides.length]);
  
  // Hover durumunda otomatik oynatmayı durdurma
  useEffect(() => {
    if (isHovered) {
      setIsAutoPlaying(false);
    } else {
      setIsAutoPlaying(true);
    }
  }, [isHovered]);

  // Küçük banner içeriği
  const smallBanners = [
    {
      id: 1,
      title: "VIP ÜYELİK",
      bgColor: "bg-gradient-to-r from-[#1E1E1E] to-[#2B2B2B]",
      icon: "fa-crown",
      iconColor: "text-[#FFD700]",
      borderColor: "border-[#3A3A3A]",
      hoverBg: "from-[#242424] to-[#303030]"
    },
    {
      id: 2,
      title: "BONUSLAR",
      bgColor: "bg-gradient-to-r from-[#1E1E1E] to-[#2B2B2B]",
      icon: "fa-gift",
      iconColor: "text-[#FFD700]",
      borderColor: "border-[#3A3A3A]",
      hoverBg: "from-[#242424] to-[#303030]"
    }
  ];
  
  return (
    <div className="relative mt-0 md:mt-4 mb-0 md:px-4 px-0 mx-0 w-full bg-[#121212]">
      <div className="flex flex-col md:flex-row gap-4 w-full">
        {/* Ana büyük slider */}
        <div className="w-full md:w-2/3 relative overflow-hidden">
          {/* Mobil için kaydırmalı slider - oklar kaldırıldı */}
          <div 
            className="md:hidden relative h-[200px] overflow-hidden bg-black"
            onTouchStart={(e) => {
              const touch = e.touches[0];
              const startX = touch.clientX;
              (e.currentTarget as any).touchStartX = startX;
            }}
            onTouchEnd={(e) => {
              const startX = (e.currentTarget as any).touchStartX;
              if (!startX) return;
              
              const endX = e.changedTouches[0].clientX;
              const diffX = startX - endX;
              
              // 30px'den fazla kaydırma varsa slide değiştir
              if (Math.abs(diffX) > 30) {
                if (diffX > 0) {
                  // Sola kaydırma - sonraki slide
                  setActiveSlide((activeSlide + 1) % slides.length);
                } else {
                  // Sağa kaydırma - önceki slide
                  setActiveSlide((activeSlide - 1 + slides.length) % slides.length);
                }
              }
            }}>
            <div className="absolute inset-0 w-full h-full">
              {slides.map((slide, index) => (
                <div 
                  key={slide.id} 
                  className={`absolute inset-0 w-full h-full transition-all duration-500 ease-in-out transform ${
                    activeSlide === index 
                      ? 'opacity-100 z-[5] scale-100' 
                      : activeSlide === (index + 1) % slides.length 
                        ? 'opacity-0 z-0 scale-105' 
                        : 'opacity-0 z-0 scale-95'
                  }`}
                >
                  {/* Görsel */}
                  <div className="relative w-full h-full overflow-hidden">
                    <img 
                      src={slide.image} 
                      alt={slide.subtitle} 
                      className="h-full w-full object-cover object-center transform scale-110"
                    />
                    
                    {/* Karartma ve gradient efektleri */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90"></div>
                    <div className={`absolute inset-0 bg-gradient-to-br ${slide.gradient} opacity-30 mix-blend-soft-light`}></div>
                    
                    {/* Altın detaylar ve desenler */}
                    <div className="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-[#FFD700]/80 via-yellow-500/20 to-transparent"></div>
                    <div className="absolute top-0 right-0 w-1/2 h-0.5 bg-gradient-to-l from-[#FFD700]/80 via-yellow-500/20 to-transparent"></div>
                    <div className="absolute inset-y-0 left-0 w-0.5 h-1/3 bg-gradient-to-b from-[#FFD700]/80 via-yellow-500/20 to-transparent"></div>
                  </div>
                  
                  {/* İçerik kutusu - Siyah arka plan kaldırıldı */}
                  <div className="absolute inset-x-3 bottom-6 z-[5]">
                    {/* İçerik kapsayıcısı */}
                    <div className="flex items-end gap-3">
                      {/* Sol taraftaki başlık kutusu - Arka plan tamamen kaldırıldı, metin doğrudan fotoğraf üzerinde */}
                      <div className="flex-1 p-2.5">
                        {/* Başlık Alanı - Daha kompakt ve modern */}
                        <div className="flex gap-2 items-center mb-1">
                          <div className="w-6 h-6 bg-[#FFD700] rounded-full flex items-center justify-center">
                            {slide.id === 3 ? (
                              <i className="fas fa-crown text-black text-xs"></i>
                            ) : (
                              <span className="text-black text-xs font-bold">%</span>
                            )}
                          </div>
                          <div className="flex-1">
                            <h2 className="text-[#FFD700] text-xl font-bold leading-none drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{slide.title}</h2>
                          </div>
                        </div>
                        
                        {/* Alt başlık - Daha kompakt */}
                        <h3 className="text-white text-sm font-medium mb-1.5 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{slide.subtitle}</h3>
                        
                        {/* Açıklama - Sadece bir satır */}
                        <p className="text-gray-300 text-xs line-clamp-1 mb-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">{slide.description}</p>
                      </div>
                      
                      {/* Sağ taraftaki buton - Daha kompakt ve küçük */}
                      <div>
                        <button className="bg-gradient-to-br from-[#FFD700] to-yellow-500 text-black px-2.5 py-1.5 rounded-md font-bold text-[10px] flex items-center justify-center shadow-md min-w-[50px] relative overflow-hidden">
                          <span className="tracking-wide uppercase">DETAYLAR</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Modern kompakt indikatörler - mobil */}
            <div className="absolute bottom-1.5 left-0 right-0 flex justify-center space-x-1">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`rounded-full transition-all duration-300 border shadow-sm ${
                    activeSlide === index 
                      ? 'bg-[#FFD700] border-[#FFD700] w-4 h-1.5' 
                      : 'bg-white/20 border-white/20 w-1.5 h-1.5'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
            
            {/* Mobil için kaydırma işlevi eklendi, oklar kaldırıldı */}
          </div>
          
          {/* Masaüstü slider - orijinal görünüm korundu */}
          <div 
            className="hidden md:block relative h-[220px] md:h-[380px] lg:h-[400px] md:rounded-xl rounded-none overflow-hidden border-y-2 border-x-0 md:border-2 border-yellow-500/20 bg-black -mx-4 md:mx-0 shadow-lg"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Slider İçeriği */}
            {slides.map((slide, index) => (
              <div 
                key={slide.id} 
                className={`absolute inset-0 w-full h-full transition-opacity duration-500 ${activeSlide === index ? 'opacity-100 z-[5]' : 'opacity-0 z-0'}`}
              >
                {/* Gradient Overlay */}
                <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-40 mix-blend-overlay`}></div>
                
                {/* Görsel */}
                <img 
                  src={slide.image} 
                  alt={slide.subtitle} 
                  className="absolute inset-0 h-full w-full object-cover"
                  style={slide.imagePosition ? { objectPosition: slide.imagePosition } : { objectPosition: 'center center' }}
                />
                
                {/* Karartma katmanı */}
                <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/40 to-transparent"></div>
                
                {/* Desen Overlay */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMTIgMTJjMy4zMTQgMCA2LTIuNjg2IDYtNnMtMi42ODYtNi02LTZjLTMuMzE0IDAtNiAyLjY4Ni02IDZzMi42ODYgNiA2IDZ6bTEyIDEyYzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02Yy0zLjMxNCAwLTYgMi42ODYtNiA2czIuNjg2IDYgNiA2ek0xMiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMCAxMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMCAxMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnpNMCA0OGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiIGZpbGw9IiNGRkZGRkYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
                
                {/* İçerik alanı */}
                <div 
                  className={`absolute ${
                    slide.position === 'left' ? 'left-6' : 
                    slide.position === 'right' ? 'right-6 text-right' : 
                    'left-1/2 transform -translate-x-1/2 text-center'
                  } top-1/2 -translate-y-1/2 max-w-[270px]`}
                >
                  <h2 className="text-white text-4xl font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-1">
                    {slide.title}
                  </h2>
                  
                  <h3 className="text-[#FFD700] text-2xl font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] mb-3">
                    {slide.subtitle}
                  </h3>
                  
                  <p className="text-white text-sm md:text-base mb-4 drop-shadow-[0_2px_3px_rgba(0,0,0,0.9)]">
                    {slide.description}
                  </p>
                  
                  <button 
                    className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-black px-4 py-2 rounded-lg font-bold shadow-lg border border-yellow-300/30 transition-all duration-300 relative overflow-hidden group"
                    onMouseEnter={() => setActiveButton(slide.id)}
                    onMouseLeave={() => setActiveButton(null)}
                  >
                    <span className="relative z-10 flex items-center">
                      {slide.buttonText}
                      <i className={`fas fa-arrow-right ml-2 transition-transform duration-300 ${activeButton === slide.id ? 'translate-x-1' : ''}`}></i>
                    </span>
                    
                    {/* Shine Effect */}
                    <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                  </button>
                </div>
              </div>
            ))}
            
            {/* Slider Kontrolleri */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2 z-20">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSlide(index)}
                  className={`h-2 rounded-full transition-all duration-500 shadow-md ${
                    activeSlide === index 
                      ? 'bg-yellow-500 w-8' 
                      : 'bg-white/50 w-2 hover:bg-white/70 hover:w-4'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Sağ taraftaki iki küçük banner - mobilde gizlendi */}
        <div className="w-full md:w-1/3 hidden md:flex flex-col gap-4 md:h-[380px] lg:h-[400px] px-4 md:px-0">
          {smallBanners.map((banner, index) => (
            <div 
              key={banner.id} 
              className={`flex-1 rounded-xl overflow-hidden border-2 ${banner.borderColor} relative ${banner.bgColor} hover:bg-gradient-to-r hover:${banner.hoverBg} transition-all duration-300`}
            >
              {/* VIP banner için sadece görsel ve buton */}
              {banner.id === 1 && (
                <div className="absolute inset-0 w-full h-full">
                  {/* VIP resmi */}
                  <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                    <img 
                      src={vipCrownImage} 
                      alt="VIP Kraliyet" 
                      className="w-full h-full object-cover"
                      style={{
                        objectFit: 'cover',
                        objectPosition: 'center 20%'
                      }}
                    />
                  </div>
                  
                  {/* Aşağıdan yukarı doğru gradyan efekt */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#121212] via-[#121212] to-transparent opacity-50"></div>
                  
                  {/* Altın kenarlık efekti */}
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent"></div>
                  
                  {/* Görsel üzerinde ince film efekti */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-[#121212] opacity-30"></div>
                </div>
              )}
              
              {/* Banner ID 2 (Bonuslar) için resmi ekle */}
              {banner.id === 2 && (
                <div className="absolute inset-0 w-full h-full">
                  {/* Bonus resmi - Yeni altın temalı görsel */}
                  <img 
                    src={bonusGoldImage}
                    alt="Bonus Banner" 
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{
                      objectPosition: 'center 15%'
                    }}
                  />
                  
                  {/* Aşağıdan yukarı doğru gradyan efekt */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#121212] via-[#121212] to-transparent opacity-70"></div>
                  
                  {/* Görsel üzerinde ince film efekti */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-transparent to-[#121212] opacity-30"></div>
                  
                  {/* Sol ve sağ gradyan overlay */}
                  <div className="absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-[#121212]/80 to-transparent"></div>
                </div>
              )}
              
              {/* Banner ID 1 (VIP) için özel düzen */}
              {banner.id === 1 ? (
                <div className="absolute inset-0 flex flex-col justify-between p-4 z-[5] h-full">
                  {/* Üst kısım - Başlık ve ikon yan yana */}
                  <div className="flex items-center justify-between w-full">
                    {/* Sol üstteki başlık */}
                    <div className="flex items-center">
                      <div className="bg-[#FFD700] rounded-md w-8 h-8 flex items-center justify-center mr-3">
                        <i className={`fas ${banner.icon} text-black text-base`}></i>
                      </div>
                      <h3 className="text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{banner.title}</h3>
                    </div>
                    
                    {/* Sağ üste görsel kaldırıldı */}
                  </div>
                  
                  {/* VIP OL Butonu - aşağıdan yukarı şık tasarım */}
                  <div className="self-end relative">
                    {/* Buton arka planı parlama efekti */}
                    <div className="absolute -inset-1 bg-[#FFD700] opacity-30 blur-md rounded-md"></div>
                    
                    {/* Ana buton */}
                    <Link to="/vip">
                      <button className="relative bg-gradient-to-t from-[#E5C100] to-[#FFD700] hover:from-[#FFD700] hover:to-[#FFEC80] text-black px-6 py-2 rounded-md text-sm font-bold shadow-md border border-[#FFEC80] transition-all duration-300 hover:shadow-[#FFD700]/20 hover:shadow-lg hover:scale-105">
                        DETAY
                      </button>
                    </Link>
                  </div>
                </div>
              ) : (
                // Banner ID 2 (Bonuslar) için olan özel düzen - VIP benzeri tasarım
                <div className="absolute inset-0 flex flex-col justify-between p-4 z-[5] h-full">
                  {/* Üst kısım - Başlık ve ikon yan yana */}
                  <div className="flex items-center justify-between w-full">
                    {/* Sol üstteki başlık */}
                    <div className="flex items-center">
                      <div className="bg-[#FFD700] rounded-md w-8 h-8 flex items-center justify-center mr-3">
                        <i className={`fas ${banner.icon} text-black text-base`}></i>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{banner.title}</h3>

                      </div>
                    </div>
                  </div>
                  
                  {/* Alt kısım - Sadece buton */}
                  <div className="self-end relative">
                    {/* Buton arka planı parlama efekti */}
                    <div className="absolute -inset-1 bg-[#FFD700] opacity-30 blur-md rounded-md"></div>
                    
                    {/* Ana buton - VIP OL butonuyla aynı stil */}
                    <Link to="/bonuslar">
                      <button className="relative bg-gradient-to-t from-[#E5C100] to-[#FFD700] hover:from-[#FFD700] hover:to-[#FFEC80] text-black px-6 py-2 rounded-md text-sm font-bold shadow-md border border-[#FFEC80] transition-all duration-300 hover:shadow-[#FFD700]/20 hover:shadow-lg hover:scale-105">
                        DETAY
                      </button>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;