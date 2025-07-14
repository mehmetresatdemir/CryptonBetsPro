import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { translate } from '@/utils/i18n-fixed';
import { getSlotGames, getCasinoGames, getAllProviders } from '@/services/slotegratorService';
import { SlotegratorGame } from '@/types/slotegrator';
import GameCard from '@/components/games/GameCard';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

interface SlotegratorGamesSectionProps {
  sectionType: 'slot' | 'casino';
  title: string;
  description?: string;
  limit?: number;
  showAllLink?: string;
  className?: string;
}

/**
 * Ana sayfa için optimize edilmiş Slotegrator oyunları bölümü
 * 
 * @param sectionType İstenilen oyun türü ('slot' veya 'casino')
 * @param title Bölüm başlığı
 * @param description Bölüm açıklaması (isteğe bağlı)
 * @param limit Gösterilecek oyun sayısı (varsayılan: 12)
 * @param showAllLink Tümünü göster butonu için link (isteğe bağlı)
 * @param className Ek CSS sınıfları
 */
const SlotegratorGamesSection: React.FC<SlotegratorGamesSectionProps> = ({
  sectionType,
  title,
  description,
  limit = 12,
  showAllLink,
  className = ''
}) => {
  const { isMobile } = useDeviceDetection();
  const [filteredGames, setFilteredGames] = useState<SlotegratorGame[]>([]);
  
  // Doğru API çağrısını seç
  const apiCall = sectionType === 'slot' ? getSlotGames : getCasinoGames;
  
  // Oyunları getir
  const { 
    data: gamesData,
    isLoading,
    isError
  } = useQuery({
    queryKey: [sectionType === 'slot' ? 'slotGames' : 'casinoGames', 'home', isMobile],
    queryFn: async () => {
      // Ana sayfa için optimize edilmiş sorgu - daha az oyun
      const response = await apiCall(1, 50, undefined, isMobile);
      return response.items || [];
    },
  });
  
  // Oyunları limit ve cihaz uyumluluğuna göre filtrele
  useEffect(() => {
    if (!gamesData || gamesData.length === 0) {
      setFilteredGames([]);
      return;
    }
    
    // Cihaz tipine göre filtrelemeye gerek yok çünkü API çağrısında zaten filtrele yaptık
    // Sadece limiti uygula
    const limitedGames = gamesData.slice(0, limit);
    setFilteredGames(limitedGames);
  }, [gamesData, limit]);
  
  // Yükleme durumu
  if (isLoading) {
    return (
      <div className={`${className} py-8`}>
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
          {description && <p className="text-gray-400 mb-6">{description}</p>}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(limit)].map((_, index) => (
              <div 
                key={index} 
                className="bg-gray-800/50 animate-pulse rounded-lg overflow-hidden h-48"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }
  
  // Hata durumu veya oyun yoksa hiçbir şey gösterme
  if (isError || !filteredGames || filteredGames.length === 0) {
    return null;
  }
  
  // Oyunları göster - Bu bölüm gizlendi
  return null;
};

export default SlotegratorGamesSection;