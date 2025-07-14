import React, { useState } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import SmartGameProvider from './games/SmartGameProvider';
import GameGrid from './games/GameGrid';
import ProviderFilter from './games/ProviderFilter';
import GameTypeFilter, { GameType } from './games/GameTypeFilter';
import { useLanguage } from '@/contexts/LanguageContext';
import Pagination from './ui/Pagination';

interface DeviceAwareGameListProps {
  gameType: 'slot' | 'casino' | 'all';
  title: string;
  perPage?: number;
}

/**
 * Cihaza duyarlı oyun listesi bileşeni
 * Bu bileşen, cihaz tipine göre uyumlu oyunları akıllıca gösterir
 */
const DeviceAwareGameList: React.FC<DeviceAwareGameListProps> = ({ 
  gameType,
  title,
  perPage = 48
}) => {
  const { translate } = useLanguage();
  const { deviceType } = useDeviceDetection();
  const [currentGameType, setCurrentGameType] = useState<GameType>(GameType.ALL);
  
  return (
    <div className="w-full">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl font-bold mb-6 text-yellow-500">{title}</h2>
        
        <SmartGameProvider 
          gameType={gameType}
          perPage={perPage}
          initialGameType={currentGameType}
        >
          {({
            games,
            providers,
            selectedProvider,
            setSelectedProvider,
            selectedGameType,
            setSelectedGameType,
            availableGameTypes,
            isLoading,
            isError,
            currentPage,
            totalPages,
            goToPage
          }) => (
            <div>
              <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                <div className="w-full md:w-auto">
                  <GameTypeFilter
                    selectedType={selectedGameType}
                    onTypeSelect={setSelectedGameType}
                    availableTypes={availableGameTypes}
                  />
                </div>
                
                <div className="w-full md:w-auto">
                  <ProviderFilter
                    providers={providers}
                    selectedProvider={selectedProvider}
                    onProviderSelect={setSelectedProvider}
                  />
                </div>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center items-center min-h-[200px]">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
                </div>
              ) : isError ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  <p>{t('oyunYuklenemedi')}</p>
                </div>
              ) : games.length === 0 ? (
                <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                  <p>{t('seciliFiltrelerIcinOyunYok')}</p>
                </div>
              ) : (
                <>
                  <GameGrid 
                    games={games} 
                    isLoading={false} 
                    isError={false} 
                  />
                  
                  {totalPages > 1 && (
                    <div className="mt-8 flex justify-center">
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={goToPage}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </SmartGameProvider>
      </div>
    </div>
  );
};

export default DeviceAwareGameList;