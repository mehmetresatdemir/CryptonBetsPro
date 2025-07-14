import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/MainLayout";
import BannerDisplay from "@/components/BannerDisplay";
import { translate } from "@/utils/i18n-fixed";

// VIP Seviye Tipi
interface VIPLevel {
  id: number;
  name: string;
  color: string;
  borderColor: string;
  shadowColor: string;
  benefits: string[];
  depositAmount: number;
  cashbackRate: number;
  bonusRate: number;
  withdrawalLimit: number;
  personalManager: boolean;
  specialPromos: boolean;
  giftPoints: number;
}

// VIP Sayfası Ana Bileşeni
const VipPage: React.FC = () => {
  const [activeLevel, setActiveLevel] = useState<number>(1);
  const [animateCard, setAnimateCard] = useState<boolean>(false);
  
  // VIP Seviyeleri
  const vipLevels: VIPLevel[] = [
    {
      id: 1,
      name: "Silver",
      color: "from-gray-400 to-gray-600",
      borderColor: "border-gray-500",
      shadowColor: "gray-400",
      benefits: [
        translate('vip.benefits.cashback', '%10 Haftalık Kayıp Bonusu'),
        translate('vip.benefits.support', '24/7 Canlı Destek'),
        translate('vip.benefits.basic_withdrawals', 'Hızlı Para Çekme')
      ],
      depositAmount: 10000,
      cashbackRate: 10,
      bonusRate: 20,
      withdrawalLimit: 15000,
      personalManager: false,
      specialPromos: false,
      giftPoints: 10000
    },
    {
      id: 2,
      name: "Gold",
      color: "from-yellow-500 to-amber-600",
      borderColor: "border-yellow-400",
      shadowColor: "yellow-400",
      benefits: [
        translate('vip.benefits.cashback', '%15 Haftalık Kayıp Bonusu'),
        translate('vip.benefits.support', '24/7 Canlı Destek'),
        translate('vip.benefits.medium_withdrawals', 'Yüksek Para Çekme Limiti'),
        translate('vip.benefits.birthday_bonus', 'Doğum Günü Bonusu')
      ],
      depositAmount: 50000,
      cashbackRate: 15,
      bonusRate: 50,
      withdrawalLimit: 75000,
      personalManager: false,
      specialPromos: true,
      giftPoints: 50000
    },
    {
      id: 3,
      name: "Platinum",
      color: "from-indigo-500 to-indigo-800",
      borderColor: "border-indigo-400",
      shadowColor: "indigo-400",
      benefits: [
        translate('vip.benefits.cashback', '%20 Haftalık Kayıp Bonusu'),
        translate('vip.benefits.priority_support', 'Öncelikli Destek'),
        translate('vip.benefits.high_withdrawals', 'Yüksek Para Çekme Limiti'),
        translate('vip.benefits.birthday_bonus', 'Doğum Günü Bonusu'),
        translate('vip.benefits.reload_bonus', 'Yeniden Yükleme Bonusu')
      ],
      depositAmount: 100000,
      cashbackRate: 20,
      bonusRate: 100,
      withdrawalLimit: 150000,
      personalManager: true,
      specialPromos: true,
      giftPoints: 100000
    },
    {
      id: 4,
      name: "Diamond",
      color: "from-cyan-400 to-blue-600",
      borderColor: "border-cyan-300",
      shadowColor: "cyan-400",
      benefits: [
        translate('vip.benefits.cashback', '%25 Haftalık Kayıp Bonusu'),
        translate('vip.benefits.priority_support', 'Öncelikli Destek'),
        translate('vip.benefits.ultra_withdrawals', 'Sınırsız Para Çekme'),
        translate('vip.benefits.birthday_bonus', 'Doğum Günü Bonusu'),
        translate('vip.benefits.reload_bonus', 'Yeniden Yükleme Bonusu'),
        translate('vip.benefits.exclusive_events', 'Özel Etkinlikler')
      ],
      depositAmount: 250000,
      cashbackRate: 25,
      bonusRate: 200,
      withdrawalLimit: 500000,
      personalManager: true,
      specialPromos: true,
      giftPoints: 250000
    },
    {
      id: 5,
      name: "Royal",
      color: "from-purple-600 to-pink-600",
      borderColor: "border-purple-400",
      shadowColor: "purple-400",
      benefits: [
        translate('vip.benefits.vip_cashback', '%30 Haftalık Kayıp Bonusu'),
        translate('vip.benefits.vip_support', 'Kişisel VIP Müdürü'),
        translate('vip.benefits.unlimited_withdrawals', 'Sınırsız Para Çekme'),
        translate('vip.benefits.premium_birthday', 'Premium Doğum Günü Paketi'),
        translate('vip.benefits.vip_reload_bonus', 'VIP Yeniden Yükleme Bonusu'),
        translate('vip.benefits.exclusive_events', 'Özel VIP Etkinlikler'),
        translate('vip.benefits.custom_bonuses', 'Özel Bonuslar')
      ],
      depositAmount: 500000,
      cashbackRate: 30,
      bonusRate: 400,
      withdrawalLimit: 1000000,
      personalManager: true,
      specialPromos: true,
      giftPoints: 500000
    }
  ];
  
  // VIP seviyesini değiştirme fonksiyonu
  const handleLevelChange = (levelId: number) => {
    setAnimateCard(true);
    setTimeout(() => {
      setActiveLevel(levelId);
      setTimeout(() => setAnimateCard(false), 100);
    }, 300);
  };
  
  // Sayfa yüklendiğinde animasyonlar
  useEffect(() => {
    // Sayfa yükleme animasyonları için stil ekleme
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes glow {
        0%, 100% { box-shadow: 0 0 20px rgba(234, 179, 8, 0.7); }
        50% { box-shadow: 0 0 40px rgba(234, 179, 8, 0.9); }
      }
      
      @keyframes float {
        0%, 100% { transform: translateY(0px); }
        50% { transform: translateY(-10px); }
      }
      
      @keyframes shine {
        0% { background-position: -100% 0; }
        100% { background-position: 200% 0; }
      }
      
      .vip-glow {
        animation: glow 3s ease-in-out infinite;
      }
      
      .vip-float {
        animation: float 6s ease-in-out infinite;
      }
      
      .vip-shine {
        position: relative;
        overflow: hidden;
      }
      
      .vip-shine::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(
          90deg,
          transparent,
          rgba(255, 255, 255, 0.2),
          transparent
        );
        background-size: 200% 100%;
        animation: shine 3s linear infinite;
      }
    `;
    document.head.appendChild(style);
    
    // Cleanup fonksiyonu
    return () => {
      document.head.removeChild(style);
    };
  }, []);
  
  // Mevcut aktif seviye
  const activeVipLevel = vipLevels.find(level => level.id === activeLevel) || vipLevels[0];
  
  return (
    <MainLayout>
      <div className="w-full min-h-screen pb-16 bg-[#121212]">
        {/* Header Banner */}
        <BannerDisplay type="header" pageLocation="vip" className="mb-6" />
        
        {/* Slider Banner */}
        <div className="w-full mb-8">
          <BannerDisplay type="slider" pageLocation="vip" className="mb-6" />
        </div>
        
        {/* VIP Banner Alanı - Hero Image (Bonuslar sayfasına benzer) */}
        <div className="w-full relative overflow-hidden rounded-lg md:rounded-2xl shadow-2xl bg-gradient-to-br from-black to-[#121212] mb-16">
          {/* Görsel Arka Plan */}
          <div className="relative overflow-hidden h-[300px] md:h-[450px] lg:h-[500px]">
            {/* Görsel */}
            <div className="absolute inset-0 w-full h-full">
              <img 
                src="/src/assets/vip-crown-scene.png" 
                alt="VIP Experience" 
                className="w-full h-full object-cover object-center opacity-90"
              />
              {/* Görsel Üstü Karartma/Gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/70 to-transparent"></div>
            </div>
            
            {/* Metin İçeriği */}
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-10">
              <div className="flex flex-col justify-center h-full max-w-2xl py-12 sm:py-16">
                <div className="inline-block bg-yellow-500/20 text-yellow-500 text-sm font-semibold px-4 py-1.5 rounded-full mb-3 backdrop-blur-sm">
                  {translate('vip.exclusive', 'ÖZEL')}
                </div>
                
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600 mb-4 tracking-tight">
                  {translate('vip.title', 'VIP KULÜP')}
                </h1>
                
                <p className="text-gray-300 text-lg sm:text-xl mb-6 max-w-3xl">
                  {translate('vip.description', 'Elit VIP deneyiminizi keşfedin ve özel ayrıcalıklardan yararlanın.')}
                </p>
                
                <div className="w-24 h-1 bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-full mb-6 shadow-glow"></div>
                
                <p className="text-gray-400 text-base sm:text-lg max-w-3xl mb-8">
                  {translate('vip.sub_description', 'Lüks ve ayrıcalık dolu bir oyun deneyimi için VIP kulübümüze katılın.')}
                </p>
                
                {/* CTA Buton */}
                <div>
                  <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 px-8 rounded-lg flex items-center justify-center transition-all duration-300 shadow-lg hover:shadow-yellow-500/30 transform hover:translate-y-[-2px]">
                    <i className="fas fa-crown mr-2"></i>
                    {translate('vip.join_now', 'Hemen Katıl')}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Parlama Efektleri */}
            <div className="absolute -top-24 -right-24 w-64 h-64 opacity-25 blur-3xl rounded-full bg-yellow-300"></div>
            <div className="absolute -bottom-32 -left-32 w-96 h-96 opacity-20 blur-3xl rounded-full bg-yellow-500"></div>
          </div>
        </div>
        
        {/* VIP Seviyeleri Seçme */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex overflow-x-auto md:flex-wrap justify-start md:justify-center gap-2 md:gap-3 mb-6 md:mb-12 pb-2 hide-scrollbar">
            {vipLevels.map((level) => (
              <button
                key={level.id}
                className={`relative px-5 py-3 md:px-6 md:py-3 rounded-xl text-sm md:text-base font-semibold transition-all duration-500 
                  transform hover:scale-105 hover:-translate-y-1 overflow-hidden
                  ${level.id === activeLevel 
                    ? `bg-gradient-to-r ${level.color} text-white shadow-[0_5px_15px_rgba(0,0,0,0.3)]` 
                    : 'bg-gradient-to-br from-[#1A1A1A] to-[#0F0F0F] text-gray-300 hover:shadow-[0_5px_15px_rgba(0,0,0,0.2)]'}`}
                onClick={() => handleLevelChange(level.id)}
              >
                <div className="flex items-center space-x-2">
                  <span className={`${level.id === activeLevel ? 'text-white' : 'text-yellow-500'}`}>
                    {level.id >= 3 ? <i className="fas fa-crown mr-2"></i> : <i className="fas fa-award mr-2"></i>}
                  </span>
                  <span>{level.name}</span>
                </div>
                
                {/* Animasyonlu altı çizgi */}
                {level.id === activeLevel && (
                  <div className="absolute bottom-0.5 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-yellow-500 to-transparent"></div>
                )}
                
                {/* Parıltı efekti */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 -translate-x-full group-hover:translate-x-full transition-all duration-1000 pointer-events-none"></div>
              </button>
            ))}
          </div>
          
          {/* Aktif VIP Seviye Kartı */}
          <div className={`max-w-5xl mx-auto transition-all duration-700 ${animateCard ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
            <div className={`bg-gradient-to-br ${activeVipLevel.color} rounded-3xl overflow-hidden shadow-[0_10px_50px_rgba(0,0,0,0.5)] relative vip-float`}>
              {/* Desen Overlay */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMTIgMTJjMy4zMTQgMCA2LTIuNjg2IDYtNnMtMi42ODYtNi02LTZjLTMuMzE0IDAtNiAyLjY4Ni02IDZzMi42ODYgNiA2IDZ6bTEyIDEyYzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02Yy0zLjMxNCAwLTYgMi42ODYtNiA2czIuNjg2IDYgNiA2ek0xMiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMCAxMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMCAxMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnpNMCA0OGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiIGZpbGw9IiNGRkZGRkYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
              
              {/* Arka Parlama Efekti */}
              <div className="absolute inset-0">
                <div className={`absolute inset-0 opacity-20 blur-[80px] rounded-full bg-gradient-to-r ${activeVipLevel.color}`}></div>
                <div className="absolute -top-24 -right-24 w-64 h-64 opacity-25 blur-3xl rounded-full bg-yellow-300"></div>
                <div className="absolute -bottom-32 -left-32 w-96 h-96 opacity-20 blur-3xl rounded-full bg-yellow-500"></div>
              </div>
              
              {/* Kenarlık Efekti */}
              <div className="absolute inset-0 border-2 border-yellow-400/30 rounded-3xl"></div>
              
              <div className="p-4 sm:p-6 md:p-8 lg:p-10 relative z-10">
                {/* Seviye Rozeti - Üstte Yüzen Badge */}
                <div className="absolute top-4 right-4 sm:top-6 sm:right-6 md:top-8 md:right-8 bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-sm p-2 sm:p-3 rounded-xl border border-yellow-500/30 shadow-xl transform rotate-3 vip-float z-20">
                  <div className={`text-lg sm:text-xl md:text-2xl font-bold ${activeVipLevel.id >= 3 ? 'text-yellow-400' : 'text-gray-200'} flex items-center`}>
                    <i className={`fas fa-${activeVipLevel.id >= 3 ? 'crown' : 'award'} mr-1 sm:mr-2 text-yellow-500 text-sm sm:text-base`}></i>
                    <span className="bg-gradient-to-r from-yellow-200 to-yellow-500 bg-clip-text text-transparent">{activeVipLevel.name}</span>
                  </div>
                </div>
                
                <div className="flex flex-col lg:flex-row lg:items-start lg:space-x-8">
                  {/* Sol Bölüm: Seviye Bilgileri */}
                  <div className="mb-8 lg:mb-0 lg:w-1/2 px-2 sm:px-0">
                    <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold text-white mb-3 drop-shadow-md">
                      <span className="bg-gradient-to-r from-white to-yellow-100 bg-clip-text text-transparent">{translate('vip.level', 'Seviye')} {activeVipLevel.name}</span>
                    </h2>
                    
                    <p className="text-gray-100 mb-5 text-base md:text-lg">
                      {translate('vip.level_description', `${activeVipLevel.name} seviyesinin tüm ayrıcalıklarından yararlanın.`)}
                    </p>
                    
                    {/* İlerleme Çubuğu */}
                    <div className="mb-8 mt-6">
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-300">{translate('vip.progress', 'İlerleme')}</span>
                        <span className="text-yellow-300 font-semibold">
                          {activeVipLevel.id < 5 ? `${activeVipLevel.id * 20}%` : '100%'}
                        </span>
                      </div>
                      <div className="h-3 rounded-full bg-black/30 overflow-hidden relative">
                        <div 
                          className="h-full bg-gradient-to-r from-yellow-500 to-yellow-300 rounded-full transition-all duration-1000 absolute top-0 left-0"
                          style={{ width: `${activeVipLevel.id * 20}%` }}
                        ></div>
                      </div>
                      
                      {/* Seviye İşaretleri */}
                      <div className="flex justify-between mt-1 px-1">
                        {vipLevels.map((level) => (
                          <div key={level.id} className="flex flex-col items-center">
                            <div 
                              className={`w-5 h-5 rounded-full flex items-center justify-center relative
                                ${level.id <= activeVipLevel.id ? 'bg-yellow-500' : 'bg-gray-700'}
                                ${level.id === activeVipLevel.id ? 'ring-2 ring-yellow-300 ring-offset-2 ring-offset-black/50' : ''}
                              `}
                            >
                              {level.id <= activeVipLevel.id && <i className="fas fa-check text-[10px] text-black"></i>}
                            </div>
                            <span className="text-[10px] mt-1 text-gray-400">{level.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Yükseltme Gereksinimi - Animasyonlu Kart */}
                    {activeVipLevel.id < 5 && (
                      <div className="bg-black/40 backdrop-blur-sm p-5 rounded-2xl border border-yellow-500/20 shadow-lg transform hover:scale-[1.02] transition-all duration-300 group">
                        <h3 className="text-white text-lg font-bold mb-3 flex items-center">
                          <i className="fas fa-arrow-circle-up text-yellow-500 mr-2"></i>
                          {translate('vip.upgrade_requirements', 'Yükseltme Gereksinimleri')}
                        </h3>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center mr-3">
                                <i className="fas fa-wallet text-yellow-500"></i>
                              </div>
                              <span className="text-gray-300">{translate('vip.deposit_amount', 'Yatırım Miktarı')}</span>
                            </div>
                            <span className="text-lg font-bold text-white">{activeVipLevel.depositAmount.toLocaleString()}₺</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-yellow-500/10 rounded-lg flex items-center justify-center mr-3">
                                <i className="fas fa-level-up-alt text-yellow-500"></i>
                              </div>
                              <span className="text-gray-300">{translate('vip.next_deposit', 'Sonraki Seviye')}</span>
                            </div>
                            <span className="text-lg font-bold text-yellow-300">{vipLevels[activeVipLevel.id].depositAmount.toLocaleString()}₺</span>
                          </div>
                        </div>
                        
                        {/* Gizli Hover Efekti */}
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/5 to-yellow-500/0 opacity-0 group-hover:opacity-100 transform -translate-x-full group-hover:translate-x-full transition-all duration-1000 rounded-2xl pointer-events-none"></div>
                      </div>
                    )}
                  </div>
                  
                  {/* Sağ Bölüm: Seviye Avantajları */}
                  <div className="lg:w-1/2">
                    <div className="bg-black/30 backdrop-blur-sm p-6 rounded-2xl border border-yellow-500/20 shadow-lg mb-6">
                      <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                        <i className="fas fa-star text-yellow-500 mr-2"></i>
                        {translate('vip.benefits.title', 'VIP Avantajları')}
                      </h3>
                      
                      <ul className="space-y-3">
                        {activeVipLevel.benefits.map((benefit, index) => (
                          <li key={index} className="flex items-start bg-black/20 p-3 rounded-xl hover:bg-black/30 transition-all duration-300 group">
                            <div className="text-yellow-500 mr-3 mt-0.5 bg-yellow-500/10 p-1.5 rounded-lg">
                              <i className="fas fa-check-circle"></i>
                            </div>
                            <span className="text-gray-200 group-hover:text-white transition-colors duration-300">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                {/* Bonus Detayları - Animasyonlu Kartlar */}
                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-4 px-2 md:px-0">
                  <div className="bg-black/30 backdrop-blur-sm p-5 rounded-2xl border border-yellow-500/20 shadow-lg transform hover:scale-105 hover:shadow-yellow-500/10 transition-all duration-500 group relative overflow-hidden">
                    {/* Dalgalı Arka Plan Animasyonu */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="flex items-start relative z-10">
                      <div className="w-14 h-14 bg-gradient-to-br from-yellow-600/30 to-yellow-500/10 rounded-xl flex items-center justify-center mr-4 shrink-0 group-hover:scale-110 transition-transform duration-500">
                        <i className="fas fa-undo text-yellow-500 text-2xl"></i>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg mb-1 group-hover:text-yellow-300 transition-colors duration-300">{translate('vip.cashback', 'Kayıp Bonusu')}</h4>
                        <p className="text-3xl font-extrabold bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">{activeVipLevel.cashbackRate}%</p>
                        <p className="text-gray-400 text-sm mt-1 group-hover:text-gray-300 transition-colors duration-300">{translate('vip.weekly_cashback', 'Haftalık')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 backdrop-blur-sm p-5 rounded-2xl border border-yellow-500/20 shadow-lg transform hover:scale-105 hover:shadow-yellow-500/10 transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="flex items-start relative z-10">
                      <div className="w-14 h-14 bg-gradient-to-br from-yellow-600/30 to-yellow-500/10 rounded-xl flex items-center justify-center mr-4 shrink-0 group-hover:scale-110 transition-transform duration-500">
                        <i className="fas fa-percentage text-yellow-500 text-2xl"></i>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg mb-1 group-hover:text-yellow-300 transition-colors duration-300">{translate('vip.bonus_rate', 'Bonus Oranı')}</h4>
                        <p className="text-3xl font-extrabold bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">{activeVipLevel.bonusRate}%</p>
                        <p className="text-gray-400 text-sm mt-1 group-hover:text-gray-300 transition-colors duration-300">{translate('vip.deposit_bonus', 'Yatırım Bonusu')}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-black/30 backdrop-blur-sm p-5 rounded-2xl border border-yellow-500/20 shadow-lg transform hover:scale-105 hover:shadow-yellow-500/10 transition-all duration-500 group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="flex items-start relative z-10">
                      <div className="w-14 h-14 bg-gradient-to-br from-yellow-600/30 to-yellow-500/10 rounded-xl flex items-center justify-center mr-4 shrink-0 group-hover:scale-110 transition-transform duration-500">
                        <i className="fas fa-coins text-yellow-500 text-2xl"></i>
                      </div>
                      <div>
                        <h4 className="text-white font-bold text-lg mb-1 group-hover:text-yellow-300 transition-colors duration-300">{translate('vip.gift_points', 'Hediye Puanları')}</h4>
                        <p className="text-3xl font-extrabold bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">{activeVipLevel.giftPoints.toLocaleString()}</p>
                        <p className="text-gray-400 text-sm mt-1 group-hover:text-gray-300 transition-colors duration-300">{translate('vip.monthly_points', 'Aylık')}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* VIP Butonları - Modern Tasarım */}
                <div className="mt-10 flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
                  <button className="w-full sm:w-auto px-8 py-4 bg-transparent backdrop-blur-sm border-2 border-yellow-500/50 text-yellow-400 rounded-xl font-bold hover:bg-yellow-500/10 hover:border-yellow-400 transition-all duration-300 flex items-center justify-center group">
                    <i className="fas fa-headset mr-2 group-hover:animate-bounce"></i>
                    {translate('vip.contact_manager', 'VIP Müdürü İletişim')}
                  </button>
                  
                  <button className="w-full sm:w-auto px-8 py-4 bg-gradient-to-br from-yellow-400 to-yellow-600 text-black rounded-xl font-bold hover:from-yellow-500 hover:to-yellow-700 transition-all duration-300 shadow-lg hover:shadow-yellow-500/20 flex items-center justify-center group transform hover:scale-105">
                    <i className="fas fa-arrow-circle-up mr-2 group-hover:rotate-12 transition-transform duration-300"></i>
                    {activeVipLevel.id < 5 ? translate('vip.upgrade_now', 'Şimdi Yükselt') : translate('vip.claim_benefits', 'Avantajları Al')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* VIP Avantajları */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{translate('vip.advantages.title', 'VIP Avantajları')}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">{translate('vip.advantages.description', 'VIP üyelerimize özel avantajlar ve ayrıcalıklar.')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Avantaj 1 */}
            <div className="bg-[#1A1A1A] rounded-xl p-6 transition-transform duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-yellow-600 bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-money-bill-wave text-yellow-500"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{translate('vip.advantages.higher_limits', 'Yüksek Limitler')}</h3>
              <p className="text-gray-400">{translate('vip.advantages.higher_limits_desc', 'Daha yüksek yatırım ve çekim limitleri ile özgürlük.')}</p>
            </div>
            
            {/* Avantaj 2 */}
            <div className="bg-[#1A1A1A] rounded-xl p-6 transition-transform duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-yellow-600 bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-headset text-yellow-500"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{translate('vip.advantages.dedicated_support', 'Özel Destek')}</h3>
              <p className="text-gray-400">{translate('vip.advantages.dedicated_support_desc', '7/24 size özel kişisel destek hizmeti.')}</p>
            </div>
            
            {/* Avantaj 3 */}
            <div className="bg-[#1A1A1A] rounded-xl p-6 transition-transform duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-yellow-600 bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-gift text-yellow-500"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{translate('vip.advantages.exclusive_bonuses', 'Özel Bonuslar')}</h3>
              <p className="text-gray-400">{translate('vip.advantages.exclusive_bonuses_desc', 'Sadece VIP üyeler için özel bonus teklifleri ve kampanyalar.')}</p>
            </div>
            
            {/* Avantaj 4 */}
            <div className="bg-[#1A1A1A] rounded-xl p-6 transition-transform duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-yellow-600 bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-bolt text-yellow-500"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{translate('vip.advantages.faster_withdrawals', 'Hızlı Para Çekme')}</h3>
              <p className="text-gray-400">{translate('vip.advantages.faster_withdrawals_desc', 'VIP üyeler için öncelikli ve hızlı para çekme işlemleri.')}</p>
            </div>
            
            {/* Avantaj 5 */}
            <div className="bg-[#1A1A1A] rounded-xl p-6 transition-transform duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-yellow-600 bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-star text-yellow-500"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{translate('vip.advantages.special_events', 'Özel Etkinlikler')}</h3>
              <p className="text-gray-400">{translate('vip.advantages.special_events_desc', 'VIP üyeler için özel turnuvalar ve etkinliklere katılım.')}</p>
            </div>
            
            {/* Avantaj 6 */}
            <div className="bg-[#1A1A1A] rounded-xl p-6 transition-transform duration-300 hover:-translate-y-2">
              <div className="w-12 h-12 bg-yellow-600 bg-opacity-20 rounded-full flex items-center justify-center mb-4">
                <i className="fas fa-birthday-cake text-yellow-500"></i>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">{translate('vip.advantages.birthday_gifts', 'Doğum Günü Hediyeleri')}</h3>
              <p className="text-gray-400">{translate('vip.advantages.birthday_gifts_desc', 'Doğum gününüzde özel hediye ve bonuslar.')}</p>
            </div>
          </div>
        </div>
        
        {/* VIP Görevleri */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-[#161616] rounded-3xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{translate('vip.missions.title', 'VIP Görevleri')}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">{translate('vip.missions.description', 'Görevleri tamamlayarak VIP seviyenizi yükseltin ve ödüller kazanın.')}</p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {/* VIP Görev 1 */}
            <div className="relative mb-8">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-full"></div>
              <div className="pl-8">
                <div className="absolute left-0 flex items-center justify-center -ml-3">
                  <div className="w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center z-10">
                    <i className="fas fa-check text-black text-sm"></i>
                  </div>
                </div>
                <div className="bg-[#1A1A1A] rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{translate('vip.missions.deposit_title', 'Yatırım Görevi')}</h3>
                  <p className="text-gray-400 mb-4">{translate('vip.missions.deposit_desc', '5 farklı günde yatırım yaparak VIP puanları kazanın.')}</p>
                  <div className="flex justify-between items-center">
                    <div className="w-2/3 bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full w-4/5"></div>
                    </div>
                    <span className="text-yellow-400 font-medium">4/5</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* VIP Görev 2 */}
            <div className="relative mb-8">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-full"></div>
              <div className="pl-8">
                <div className="absolute left-0 flex items-center justify-center -ml-3">
                  <div className="w-7 h-7 rounded-full bg-yellow-500 flex items-center justify-center z-10">
                    <i className="fas fa-check text-black text-sm"></i>
                  </div>
                </div>
                <div className="bg-[#1A1A1A] rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{translate('vip.missions.casino_title', 'Casino Görevi')}</h3>
                  <p className="text-gray-400 mb-4">{translate('vip.missions.casino_desc', 'Casino oyunlarında belirli miktarda bahis yapın.')}</p>
                  <div className="flex justify-between items-center">
                    <div className="w-2/3 bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full w-2/3"></div>
                    </div>
                    <span className="text-yellow-400 font-medium">2/3</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* VIP Görev 3 */}
            <div className="relative mb-8">
              <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-yellow-500 to-yellow-700 rounded-full"></div>
              <div className="pl-8">
                <div className="absolute left-0 flex items-center justify-center -ml-3">
                  <div className="w-7 h-7 rounded-full bg-[#1A1A1A] border-2 border-yellow-500 flex items-center justify-center z-10">
                    <span className="text-yellow-500 text-sm">3</span>
                  </div>
                </div>
                <div className="bg-[#1A1A1A] rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-white mb-2">{translate('vip.missions.refer_title', 'Arkadaş Davet Görevi')}</h3>
                  <p className="text-gray-400 mb-4">{translate('vip.missions.refer_desc', 'Arkadaşlarınızı davet ederek VIP puanları kazanın.')}</p>
                  <div className="flex justify-between items-center">
                    <div className="w-2/3 bg-gray-700 h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-full w-1/3"></div>
                    </div>
                    <span className="text-yellow-400 font-medium">1/3</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <button className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black rounded-lg font-semibold hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300 shadow-lg inline-flex items-center">
              <i className="fas fa-trophy mr-2"></i>
              {translate('vip.claim_rewards', 'Ödülleri Talep Et')}
            </button>
          </div>
        </div>
        
        {/* VIP FAQs */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">{translate('vip.faq.title', 'Sık Sorulan Sorular')}</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">{translate('vip.faq.description', 'VIP üyelik hakkında merak ettiğiniz tüm sorular burada.')}</p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Soru 1 */}
            <div className="bg-[#1A1A1A] rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-900/20">
              <h3 className="text-xl font-semibold text-white mb-2">{translate('vip.faq.question1', 'VIP üyelik nasıl kazanılır?')}</h3>
              <p className="text-gray-400">{translate('vip.faq.answer1', 'Aktif oyun oynayarak, yatırım yaparak ve görevleri tamamlayarak VIP puanları kazanabilirsiniz.')}</p>
            </div>
            
            {/* Soru 2 */}
            <div className="bg-[#1A1A1A] rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-900/20">
              <h3 className="text-xl font-semibold text-white mb-2">{translate('vip.faq.question2', 'VIP seviyem ne zaman yükselir?')}</h3>
              <p className="text-gray-400">{translate('vip.faq.answer2', 'VIP seviyeniz gereken puanlara ulaştığınızda otomatik olarak yükselir ve size bildirim gönderilir.')}</p>
            </div>
            
            {/* Soru 3 */}
            <div className="bg-[#1A1A1A] rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-900/20">
              <h3 className="text-xl font-semibold text-white mb-2">{translate('vip.faq.question3', 'VIP avantajları nelerdir?')}</h3>
              <p className="text-gray-400">{translate('vip.faq.answer3', 'Yüksek limitler, özel bonuslar, hızlı para çekme, kişisel destek ve özel etkinliklere erişim.')}</p>
            </div>
            
            {/* Soru 4 */}
            <div className="bg-[#1A1A1A] rounded-xl p-6 transition-all duration-300 hover:shadow-lg hover:shadow-yellow-900/20">
              <h3 className="text-xl font-semibold text-white mb-2">{translate('vip.faq.question4', 'VIP seviyem düşer mi?')}</h3>
              <p className="text-gray-400">{translate('vip.faq.answer4', 'Hayır, VIP seviyeniz düşmez. Bir kez kazandığınız seviye kalıcıdır.')}</p>
            </div>
          </div>
        </div>
        
        {/* CTA Bölümü */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="bg-gradient-to-r from-yellow-600 to-amber-700 rounded-3xl p-8 sm:p-12 relative overflow-hidden">
            {/* Parlama Efekti */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/pattern-light.png')] opacity-10"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between">
              <div className="mb-8 md:mb-0 text-center md:text-left">
                <h2 className="text-3xl sm:text-4xl font-bold text-black mb-4">{translate('vip.cta.title', 'VIP Olun ve Ayrıcalıklı Hizmet Alın')}</h2>
                <p className="text-yellow-900">{translate('vip.cta.description', 'Özel avantajlar ve kişisel hizmet için hemen VIP programına katılın.')}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button className="px-6 py-3 bg-black text-yellow-500 rounded-lg font-semibold hover:bg-gray-900 transition-all duration-300">
                  {translate('vip.cta.contact_us', 'Bize Ulaşın')}
                </button>
                
                <button className="px-6 py-3 bg-white text-black rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300">
                  {translate('vip.cta.join_now', 'Hemen Katıl')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default VipPage;