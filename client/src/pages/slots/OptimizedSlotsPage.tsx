import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { SlotegratorGame } from '@/types/slotegrator';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Star, 
  Clock, 
  Trophy, 
  Zap, 
  Grid3X3, 
  List,
  SlidersHorizontal,
  ArrowUp
} from 'lucide-react';
import { FixedSizeList as VirtualList } from 'react-window';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ZeusBannerImage from '@assets/Nora_WP_A_hyper-realistic,_cinematic_artwork_of_Zeus_inspi_e353cf82-be2e-4377-82b2-c9f8a8b3a329.png';

// Oyun kartı bileşeni
const GameCard = React.memo(({ game, onClick, isMobile }: { 
  game: SlotegratorGame; 
  onClick: (game: SlotegratorGame) => void;
  isMobile: boolean;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const handleImageLoad = useCallback(() => setImageLoaded(true), []);
  const handleImageError = useCallback(() => setImageError(true), []);
  
  const imageUrl = game.images && game.images.length > 0 ? game.images[0].url : game.image;
  
  return (
    <div 
      onClick={() => onClick(game)}
      className="group relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl overflow-hidden border border-gray-700 hover:border-yellow-500/50 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/20"
    >
      {/* Oyun Görüntüsü */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {!imageLoaded && !imageError && (
          <Skeleton className="w-full h-full bg-gray-700" />
        )}
        
        {imageUrl && !imageError ? (
          <img
            src={imageUrl}
            alt={game.name}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-yellow-600/20 to-yellow-800/40 flex items-center justify-center">
            <div className="text-center">
              <Trophy className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
              <span className="text-sm text-yellow-400 font-medium">SLOT</span>
            </div>
          </div>
        )}
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <Button className="bg-yellow-600 hover:bg-yellow-500 text-black font-bold">
            {isMobile ? 'Oyna' : 'Oyunu Başlat'}
          </Button>
        </div>
        
        {/* Sağlayıcı Badge */}
        {game.provider && (
          <Badge className="absolute top-2 right-2 bg-black/70 text-yellow-400 border-yellow-400/30 text-xs">
            {game.provider}
          </Badge>
        )}
      </div>
      
      {/* Oyun Bilgileri */}
      <div className="p-3">
        <h3 className="font-semibold text-white text-sm line-clamp-2 group-hover:text-yellow-400 transition-colors">
          {game.name}
        </h3>
        
        {/* Oyun Özellikleri */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-1">
            {game.tags?.some(tag => tag.code === 'jackpots') && (
              <Trophy className="w-3 h-3 text-yellow-500" />
            )}
            {game.has_freespins === 1 && (
              <Star className="w-3 h-3 text-blue-400" />
            )}
            {game.tags?.some(tag => tag.code === 'megaways') && (
              <Zap className="w-3 h-3 text-purple-400" />
            )}
          </div>
          
          <span className="text-xs text-gray-400">
            {game.type || 'Slot'}
          </span>
        </div>
      </div>
    </div>
  );
});

// Sağlayıcı filtre bileşeni
const ProviderFilter = React.memo(({ 
  providers, 
  selectedProvider, 
  onProviderChange,
  isMobile 
}: {
  providers: string[];
  selectedProvider: string;
  onProviderChange: (provider: string) => void;
  isMobile: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const popularProviders = [
    'Pragmatic Play', 'NetEnt', 'Evolution', 'Red Tiger', 
    'Playson', 'Wazdan', 'Thunderkick', 'Quickspin'
  ].filter(p => providers.includes(p));
  
  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between bg-gray-800 border-gray-600 text-white hover:bg-gray-700"
      >
        <span className="truncate">
          {selectedProvider || 'Tüm Sağlayıcılar'}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl z-50 max-h-60 overflow-y-auto">
          <div 
            className="p-2 hover:bg-gray-700 cursor-pointer text-white"
            onClick={() => {
              onProviderChange('');
              setIsOpen(false);
            }}
          >
            Tüm Sağlayıcılar
          </div>
          
          {/* Popüler Sağlayıcılar */}
          {popularProviders.length > 0 && (
            <>
              <div className="px-2 py-1 text-xs text-gray-400 border-b border-gray-700">
                Popüler Sağlayıcılar
              </div>
              {popularProviders.map(provider => (
                <div
                  key={provider}
                  className="p-2 hover:bg-gray-700 cursor-pointer text-white"
                  onClick={() => {
                    onProviderChange(provider);
                    setIsOpen(false);
                  }}
                >
                  {provider}
                </div>
              ))}
            </>
          )}
          
          {/* Diğer Sağlayıcılar */}
          {providers.filter(p => !popularProviders.includes(p)).length > 0 && (
            <>
              <div className="px-2 py-1 text-xs text-gray-400 border-t border-gray-700">
                Diğer Sağlayıcılar
              </div>
              {providers
                .filter(p => !popularProviders.includes(p))
                .map(provider => (
                  <div
                    key={provider}
                    className="p-2 hover:bg-gray-700 cursor-pointer text-white"
                    onClick={() => {
                      onProviderChange(provider);
                      setIsOpen(false);
                    }}
                  >
                    {provider}
                  </div>
                ))}
            </>
          )}
        </div>
      )}
    </div>
  );
});

// Ana slot sayfası bileşeni
const OptimizedSlotsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [location] = useLocation();
  const { deviceType, isMobile } = useDeviceDetection();
  
  // State'ler
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  
  // Scroll izleme
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 1000);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Slot oyunlarını getir - doğru endpoint kullan
  const {
    data: gamesData,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage
  } = useInfiniteQuery({
    queryKey: ['slots-games', searchTerm, selectedProvider, sortBy],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams({
        page: pageParam.toString(),
        perPage: '50'
      });
      
      if (selectedProvider) params.append('provider', selectedProvider);
      if (isMobile) params.append('mobile', '1');
      
      const response = await fetch(`/api/slotegrator/games/slots?${params}`);
      if (!response.ok) {
        console.error('Slots API hatası:', response.status, response.statusText);
        throw new Error('Oyunlar yüklenirken hata oluştu');
      }
      const data = await response.json();
      console.log('Cache API yanıtı - Sayfa:', pageParam, 'Oyun sayısı:', data.items?.length || 0, 'Toplam:', data._meta?.totalCount || 0);
      return data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage._meta) return undefined;
      const totalPages = lastPage._meta.pageCount;
      const currentPage = allPages.length;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 30 * 60 * 1000, // 30 dakika cache - cache kullandığımız için uzun
    gcTime: 2 * 60 * 60 * 1000, // 2 saat memory cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
  
  // Tüm oyunları birleştir
  const allGames = useMemo(() => {
    return gamesData?.pages.flatMap(page => page.items) || [];
  }, [gamesData]);
  
  // Benzersiz sağlayıcıları al
  const uniqueProviders = useMemo(() => {
    const providers = [...new Set(
      allGames
        .filter(game => game.provider)
        .map(game => game.provider)
    )].sort();
    return providers;
  }, [allGames]);
  
  // Oyunları filtrele ve sırala
  const filteredAndSortedGames = useMemo(() => {
    let filtered = allGames;
    
    // Arama filtresi
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(game => 
        game.name.toLowerCase().includes(search) ||
        game.provider?.toLowerCase().includes(search)
      );
    }
    
    // Sağlayıcı filtresi
    if (selectedProvider) {
      filtered = filtered.filter(game => game.provider === selectedProvider);
    }
    
    // Sıralama
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'provider':
        filtered.sort((a, b) => (a.provider || '').localeCompare(b.provider || ''));
        break;
      case 'newest':
        // Yeni oyunlar için tarih bazlı sıralama yapılabilir
        break;
      default: // popular
        // Popüler oyunlar için özel sıralama mantığı
        break;
    }
    
    return filtered;
  }, [allGames, searchTerm, selectedProvider, sortBy]);
  
  // Otomatik scroll yükleme
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      
      if (scrollTop + clientHeight >= scrollHeight - 1000 && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Oyun tıklama işlemi
  const handleGameClick = useCallback((game: SlotegratorGame) => {
    console.log('Oyun seçildi:', game.name);
    // Burada oyun başlatma veya detay sayfasına yönlendirme yapılabilir
  }, []);
  
  // Üste kaydırma
  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  return (
    <MainLayout>
      {/* Hero Banner */}
      <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 mb-6 overflow-hidden">
        <img 
          src={ZeusBannerImage} 
          alt="Slot Oyunları" 
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent">
          <div className="container mx-auto h-full flex flex-col justify-center px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
              Premium Slot Oyunları
            </h1>
            <p className="text-lg md:text-xl text-yellow-400 max-w-xl drop-shadow-md">
              {allGames.length > 0 ? `${allGames.length} oyun` : '2500+'}, {uniqueProviders.length > 0 ? uniqueProviders.length : '34'} sağlayıcı, sınırsız eğlence
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Badge className="bg-yellow-600 text-black text-lg px-4 py-2">
                {allGames.length > 0 ? `${allGames.length} Oyun` : 'Oyunlar Yükleniyor...'}
              </Badge>
              {uniqueProviders.length > 0 && (
                <Badge className="bg-green-600 text-white text-sm px-3 py-2">
                  {uniqueProviders.length} Sağlayıcı
                </Badge>
              )}
              <Badge className="bg-blue-600 text-white text-sm px-3 py-2">
                {allGames.length > 2000 ? 'Tam Katalog' : 'Yükleniyor'}
              </Badge>
              {filteredAndSortedGames.length > 0 && filteredAndSortedGames.length !== allGames.length && (
                <Badge className="bg-purple-600 text-white text-sm px-3 py-2">
                  {filteredAndSortedGames.length} Filtrelenmiş
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Arama ve Filtreler */}
        <div className="mb-6 space-y-4">
          {/* Arama Çubuğu */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Oyun ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-800 border-gray-600 text-white h-12"
            />
          </div>
          
          {/* Filtre ve Görünüm Kontrolleri */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Mobil Filtre Butonu */}
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="sm:hidden bg-gray-800 border-gray-600 text-white"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filtreler
              <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </Button>
            
            {/* Desktop Filtreler */}
            <div className={`flex-1 ${showFilters || !isMobile ? 'block' : 'hidden'} sm:block`}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* Sağlayıcı Filtresi */}
                <ProviderFilter
                  providers={uniqueProviders}
                  selectedProvider={selectedProvider}
                  onProviderChange={setSelectedProvider}
                  isMobile={isMobile}
                />
                
                {/* Sıralama */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                >
                  <option value="popular">Popüler</option>
                  <option value="name">İsim A-Z</option>
                  <option value="provider">Sağlayıcı</option>
                  <option value="newest">En Yeni</option>
                </select>
                
                {/* Görünüm Modu */}
                <div className="flex border border-gray-600 rounded-lg overflow-hidden">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('grid')}
                    className="flex-1 rounded-none"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    onClick={() => setViewMode('list')}
                    className="flex-1 rounded-none"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Aktif Filtreler */}
          {(searchTerm || selectedProvider) && (
            <div className="flex flex-wrap gap-2">
              {searchTerm && (
                <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400">
                  Arama: {searchTerm}
                  <button 
                    onClick={() => setSearchTerm('')}
                    className="ml-2 hover:text-white"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedProvider && (
                <Badge variant="secondary" className="bg-blue-600/20 text-blue-400">
                  {selectedProvider}
                  <button 
                    onClick={() => setSelectedProvider('')}
                    className="ml-2 hover:text-white"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
        </div>
        
        {/* Sonuç Bilgisi */}
        <div className="mb-4 flex items-center justify-between">
          <span className="text-gray-400">
            {filteredAndSortedGames.length} oyun bulundu
          </span>
          
          {hasNextPage && (
            <Button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              variant="outline"
              size="sm"
            >
              {isFetchingNextPage ? 'Yükleniyor...' : 'Daha Fazla Yükle'}
            </Button>
          )}
        </div>
        
        {/* Oyun Listesi */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="bg-gray-800 rounded-xl overflow-hidden">
                <Skeleton className="aspect-[4/3] bg-gray-700" />
                <div className="p-3">
                  <Skeleton className="h-4 bg-gray-700 mb-2" />
                  <Skeleton className="h-3 bg-gray-700 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <div className="text-red-400 mb-4">
              Oyunlar yüklenirken hata oluştu
            </div>
            <Button onClick={() => window.location.reload()}>
              Tekrar Dene
            </Button>
          </div>
        ) : allGames.length === 0 && !isLoading ? (
          <div className="text-center py-12">
            <div className="text-yellow-400 mb-4 text-lg">
              Cache'den oyunlar yükleniyor...
            </div>
            <div className="text-sm text-gray-400">
              2500+ oyun sisteme aktarılıyor, lütfen bekleyin
            </div>
          </div>
        ) : filteredAndSortedGames.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              "{searchTerm}" için sonuç bulunamadı
            </div>
            <Button onClick={() => {
              setSearchTerm('');
              setSelectedProvider('');
            }}>
              Filtreleri Temizle
            </Button>
          </div>
        ) : (
          <div 
            className={
              viewMode === 'grid' 
                ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4'
                : 'space-y-4'
            }
          >
            {filteredAndSortedGames.map((game, index) => (
              <GameCard
                key={`${game.uuid}-${index}`}
                game={game}
                onClick={handleGameClick}
                isMobile={isMobile}
              />
            ))}
          </div>
        )}
        
        {/* Otomatik Yükleme Göstergesi */}
        {isFetchingNextPage && (
          <div className="text-center mt-8 py-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
              <span className="text-yellow-400 font-medium">Daha fazla oyun yükleniyor...</span>
            </div>
          </div>
        )}
        
        {/* Manuel Yükleme Butonu */}
        {hasNextPage && !isLoading && !isFetchingNextPage && (
          <div className="text-center mt-8">
            <Button 
              onClick={() => fetchNextPage()}
              className="bg-yellow-600 hover:bg-yellow-500 text-black"
              size="lg"
            >
              Daha Fazla Oyun Yükle ({Math.min(100, (gamesData?.pages[0]?._meta?.totalCount || 0) - allGames.length)} kaldı)
            </Button>
          </div>
        )}
        
        {/* Tüm oyunlar yüklendi bilgisi */}
        {!hasNextPage && allGames.length > 0 && (
          <div className="text-center mt-8 py-6">
            <div className="bg-green-600/20 border border-green-600/30 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-green-400 font-medium">
                  Tüm {allGames.length} slot oyunu aktif
                </span>
              </div>
              <div className="text-xs text-green-300 mt-1">
                {uniqueProviders.length} sağlayıcıdan premium oyunlar
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Üste Kaydırma Butonu */}
      {showScrollTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 bg-yellow-600 hover:bg-yellow-500 text-black rounded-full w-12 h-12 shadow-lg z-50"
          size="icon"
        >
          <ArrowUp className="w-5 h-5" />
        </Button>
      )}
    </MainLayout>
  );
};

export default OptimizedSlotsPage;