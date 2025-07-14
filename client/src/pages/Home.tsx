import React from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import HeroCarousel from "@/components/home/HeroCarousel";

import PopularSlotsSection from "@/components/home/PopularSlotsSection";
import PopularCasinoSection from "@/components/home/PopularCasinoSection";
import GameProviderSection from "@/components/home/GameProviderSection";
import BannerDisplay from "@/components/BannerDisplay";

import FinanceProviders from "@/components/home/FinanceProviders";
import LicenseSection from "@/components/home/LicenseSection";
import BonusSection from "@/components/home/NewsSection"; // Dosya adı aynı kalıyor, ama içerik değişti
import PaymentMethods from "@/components/home/PaymentMethods";
import GamesSection from "@/components/home/GamesSection";
import LiveCasinoSection from "@/components/home/LiveCasinoSection";
// import InfoCardsWithLeaderboard from "@/components/home/InfoCardsWithLeaderboard";
import StoryHighlights2 from "@/components/home/StoryHighlights2";
import SlotegratorGamesSection from "@/components/home/SlotegratorGamesSection";
import { Game } from "@/data/games";
import { CasinoGame } from "@/data/casino";
import { NewsItem } from "@/data/news";
import { useLanguage } from "@/contexts/LanguageContext";

const Home: React.FC = () => {

  // Verileri çekme
  const { data: games = [] } = useQuery<Game[]>({
    queryKey: ['/api/games'],
  });

  const { data: casinoGames = [] } = useQuery<CasinoGame[]>({
    queryKey: ['/api/casino-games'],
  });

  const { data: bonusItems = [] } = useQuery<NewsItem[]>({
    queryKey: ['/api/news'],
  });

  return (
    <MainLayout>
      <div className="">
        {/* Header Banner */}
        <BannerDisplay type="header" pageLocation="home" className="mb-4" />
        
        {/* Hero Carousel - Ana Slider */}
        <div className="mb-6">
          <HeroCarousel />
        </div>
        

        
        {/* Mobil için VIP ve Bonus kartları kaldırıldı */}
        
        {/* Haberler ve Sidebar Banner alanı - sadece masaüstünde görünecek */}
        <div className="hidden md:block px-4 md:px-6 mt-6 mb-6">
          <div className="flex gap-6">
            <div className="max-w-sm">
              <StoryHighlights2 />
            </div>
            <div className="w-80">
              <BannerDisplay type="sidebar" pageLocation="home" />
            </div>
          </div>
        </div>
        
                <div className="px-4 md:px-6 mt-6">
          <PopularSlotsSection />
          <PopularCasinoSection />
          
          {/* Payment Methods Section */}
          <PaymentMethods />
  
          <LicenseSection />
        </div>
      </div>
    </MainLayout>
  );
};

export default Home;
