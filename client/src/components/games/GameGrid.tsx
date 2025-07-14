import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { SlotegratorGame } from '@/types/slotegrator';
import GameCard from './GameCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Monitor, Smartphone, Grid2X2, Grid3X3, LayoutGrid } from 'lucide-react';

export interface GameGridProps {
  games: SlotegratorGame[];
  isLoading: boolean;
  isError: boolean;
  deviceFilter?: string | null;
  onDeviceFilterChange?: (filter: string | null) => void;
  columns?: number;
  showDeviceFilter?: boolean;
}

const GameGrid: React.FC<GameGridProps> = ({ 
  games, 
  isLoading, 
  isError,
  deviceFilter = null,
  onDeviceFilterChange = () => {},
  columns,
  showDeviceFilter = true
}) => {
  const { translate } = useLanguage();
  const [localDeviceFilter, setLocalDeviceFilter] = useState<string | null>(deviceFilter);
  
  // Cihaz filtresini uygula
  const filteredGames = React.useMemo(() => {
    if (!localDeviceFilter) return games;
    
    return games.filter(game => {
      if (localDeviceFilter === 'mobile') {
        return game.is_mobile === 1;
      } else if (localDeviceFilter === 'desktop') {
        // Masaüstü oyunları için genellikle is_mobile değeri 0 olanlardır
        return game.is_mobile === 0;
      }
      return true;
    });
  }, [games, localDeviceFilter]);
  
  // Cihaz filtresi değiştiğinde
  const handleDeviceFilterChange = (value: string) => {
    const newFilter = value === 'all' ? null : value;
    setLocalDeviceFilter(newFilter);
    onDeviceFilterChange(newFilter);
  };

  // Kolon sayısına göre grid sınıfını oluştur
  const getGridClass = () => {
    if (columns) {
      switch (columns) {
        case 2:
          return "grid-cols-1 sm:grid-cols-2";
        case 3:
          return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3";
        case 4:
          return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
        case 5:
          return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
        case 6:
          return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6";
        default:
          return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
      }
    }
    
    // Varsayılan grid sınıfı
    return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5";
  };
  
  // Yükleme durumu gösterimi
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-yellow-600 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-white">{translate('games.loading', 'Oyunlar yükleniyor...')}</p>
      </div>
    );
  }
  
  // Hata durumunu göster
  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-red-900/20 p-6 rounded-lg border border-red-700 max-w-md">
          <h3 className="text-xl font-bold text-red-500 mb-4">{translate('games.error_title', 'Hata Oluştu')}</h3>
          <p className="text-gray-300 mb-4">{translate('games.error_description', 'Oyunlar yüklenirken bir hata oluştu.')}</p>
        </div>
      </div>
    );
  }
  
  // Oyun bulunamadı
  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="bg-gray-800/70 p-6 rounded-lg border border-gray-700 max-w-md">
          <h3 className="text-xl font-bold text-yellow-500 mb-4">{translate('games.no_results', 'Oyun Bulunamadı')}</h3>
          <p className="text-gray-300">{translate('games.try_different', 'Farklı filtreler deneyin')}</p>
        </div>
      </div>
    );
  }
  
  // Oyun kartlarını göster
  return (
    <div>
      {/* Cihaz filtresi - isteğe bağlı olarak göster */}
      {showDeviceFilter && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-medium text-white">{translate('games.device_filter', 'Cihaz Filtresi')}</h3>
            <div className="text-sm text-gray-400">
              {localDeviceFilter === 'mobile' ? (
                <span>{filteredGames.length} {translate('games.mobile_games_found', 'mobil oyun')}</span>
              ) : localDeviceFilter === 'desktop' ? (
                <span>{filteredGames.length} {translate('games.desktop_games_found', 'masaüstü oyun')}</span>
              ) : (
                <span>{filteredGames.length} {translate('games.total_games', 'toplam oyun')}</span>
              )}
            </div>
          </div>
          <Tabs 
            defaultValue={localDeviceFilter || 'all'} 
            value={localDeviceFilter || 'all'}
            onValueChange={handleDeviceFilterChange}
            className="w-full"
          >
            <TabsList className="bg-gray-800 h-auto p-1 rounded-xl">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black rounded-lg"
              >
                <LayoutGrid className="w-4 h-4 mr-1" />
                {translate('games.all_devices', 'Tüm Cihazlar')}
              </TabsTrigger>
              <TabsTrigger 
                value="desktop" 
                className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black rounded-lg"
              >
                <Monitor className="w-4 h-4 mr-1" />
                {translate('games.desktop', 'Masaüstü')}
              </TabsTrigger>
              <TabsTrigger 
                value="mobile" 
                className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black rounded-lg"
              >
                <Smartphone className="w-4 h-4 mr-1" />
                {translate('games.mobile', 'Mobil')}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      )}

      {/* Oyun kartları grid'i - dinamik kolon sayısı */}
      <div className={`grid ${getGridClass()} gap-4 md:gap-6`}>
        {filteredGames.map((game) => (
          <GameCard 
            key={game.uuid} 
            game={game} 
            onClick={() => {
              // Oyun tıklandığında URL parametresi ekle
              const url = new URL(window.location.href);
              url.searchParams.set('game', game.uuid);
              window.history.pushState({}, '', url.toString());
              
              // Burada oyunu başlatma modalı açılabilir
              console.log(`Clicked on game: ${game.name} (${game.uuid})`);
            }}
          />
        ))}
      </div>
      
      {/* Filtre uygulandığında eğer oyun bulunamadıysa */}
      {filteredGames.length === 0 && games.length > 0 && (
        <div className="mt-8 p-4 bg-gray-800/70 rounded-lg border border-gray-700 text-center">
          <p className="text-yellow-500 mb-3">{translate('errors.seciliFiltrelerIcinOyunYok', 'Seçili filtreler için oyun bulunamadı')}</p>
          <button 
            onClick={() => handleDeviceFilterChange('all')}
            className="px-4 py-2 bg-yellow-600 text-black rounded-md hover:bg-yellow-500 transition-colors"
          >
            {translate('filters.clear_all', 'Filtreleri Temizle')}
          </button>
        </div>
      )}
    </div>
  );
};

export default GameGrid;