import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import GameModal from '@/components/GameModal';
import BannerDisplay from '@/components/BannerDisplay';
import { translate } from '@/utils/i18n-fixed';
import { SlotegratorGame } from '@/types/slotegrator';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  List,
  Star,
  Trophy,
  Zap,
  Heart,
  TrendingUp,
  Clock,
  Users,
  Coins,
  Crown,
  Gift,
  Bolt,
  Sparkles,
  Eye,
  Play,
  Gamepad2,
  RotateCcw,
  X
} from 'lucide-react';
// Using placeholder image for Zeus banner
const zeusBannerImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRkZENzAwO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjUwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGOUYwMDtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRkY2QzAwO3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFkaWVudCkiLz4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlo9VVM8L3RleHQ+Cjwvc3ZnPg==';
import { Skeleton } from '@/components/ui/skeleton';
import { debounce } from '@/utils/performance';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { deviceOptimization } from '@/utils/deviceOptimization';
import JackpotTracker from '@/components/JackpotTracker';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Game card component
const GameCard = React.memo(({ game, onClick }: { 
  game: SlotegratorGame; 
  onClick: (game: SlotegratorGame) => void;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const imageUrl = game.images && game.images.length > 0 ? game.images[0].url : game.image;
  
  return (
    <div 
      onClick={() => onClick(game)}
      className="group relative bg-gradient-to-b from-gray-900 via-black to-yellow-900/10 rounded-xl overflow-hidden border border-yellow-500/20 hover:border-yellow-400/80 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/30"
    >
      {/* Oyun Görüntüsü */}
      <div className="relative aspect-[4/3] overflow-hidden">
        {!imageLoaded && !imageError && (
          <Skeleton className="w-full h-full bg-gray-700" />
        )}
        
        {imageUrl && !imageError && (
          <img 
            src={imageUrl}
            alt={game.name}
            className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-110 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
          />
        )}
        
        {imageError && (
          <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
            <div className="text-center text-gray-400">
              <Trophy className="w-8 h-8 mx-auto mb-2" />
              <div className="text-xs">{game.name}</div>
            </div>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Oyna butonu */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Button 
            size="sm" 
            className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold px-6 py-2 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300"
          >
            <Zap className="w-4 h-4 mr-2" />
            {translate('common.play', 'Oyna')}
          </Button>
        </div>
        
        {/* Provider badge */}
        {game.provider && (
          <div className="absolute top-2 left-2">
            <Badge variant="secondary" className="bg-black/50 text-white text-xs px-2 py-1">
              {game.provider}
            </Badge>
          </div>
        )}
        
        {/* Mobile badge */}
        {game.is_mobile === 1 && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-green-500/20 border-green-500 text-green-400 text-xs px-2 py-1">
              📱
            </Badge>
          </div>
        )}
      </div>
      
      {/* Game information */}
      <div className="p-3">
        <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1 group-hover:text-yellow-400 transition-colors">
          {game.name}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{game.provider}</span>
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span className="text-yellow-400">4.8</span>
          </div>
        </div>
      </div>
    </div>
  );
});

const SlotPage: React.FC = () => {
  const deviceInfo = useDeviceDetection();
  
  // Advanced State Management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'provider' | 'popular' | 'newest'>('popular');
  const [showAllProviders, setShowAllProviders] = useState(false);
  const [gameCategory, setGameCategory] = useState<'all' | 'jackpot' | 'megaways' | 'bonus_buy' | 'classic' | 'favorites'>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  
  // Local Storage Management
  useEffect(() => {
    const savedFavorites = localStorage.getItem('slot-favorites');
    const savedRecentlyViewed = localStorage.getItem('slot-recently-viewed');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedRecentlyViewed) setRecentlyViewed(JSON.parse(savedRecentlyViewed));
  }, []);

  // Filtre değiştiğinde sayfa numarasını sıfırla
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedProvider, gameCategory, sortBy]);
  
  const perPage = deviceInfo.isMobile ? 16 : 32;
  
  // INSTANT slot loading - tek istekle TÜM oyunları al
  const {
    data: slotsData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['instant-slots-all'],
    queryFn: async () => {
      console.log(`🚀 INSTANT slot loading - TÜM oyunlar tek istekte...`);
      
      try {
        // Device-aware authentic game loading
        const response = await fetch(`/api/fast-slots?perPage=1000&device=${deviceInfo.deviceCategory}`, {
          headers: {
            'Cache-Control': 'public, max-age=3600'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`⚡ INSTANT SUCCESS: ${data.items?.length || 0} slot oyunu yüklendi`);
        console.log(`📊 Sağlayıcılar: ${data.providers?.length || 0}`);
        
        return data;
      } catch (error) {
        console.error('❌ Instant slot loading hatası:', error);
        throw error;
      }
    },
    staleTime: 60 * 60 * 1000, // 1 saat cache - daha uzun
    gcTime: 2 * 60 * 60 * 1000, // 2 saat memory cache
    retry: false, // Tek deneme
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  
  const games = slotsData?.items || [];
  const totalCount = slotsData?._meta?.totalCount || 0;
  const providersData = slotsData?.providers || [];
  const categoriesData = slotsData?.categories || {};
  const statsData = slotsData?.stats || {};
  
  // API'den gelen sağlayıcı verilerini kullan
  const uniqueProviders = useMemo(() => {
    if (providersData.length > 0) {
      return providersData
        .filter((provider: any) => provider.gameCount > 0)
        .sort((a: any, b: any) => b.gameCount - a.gameCount)
        .map((provider: any) => provider.name);
    }
    
    // Fallback: games'den hesapla
    const providerCounts = new Map<string, number>();
    games
      .filter((game: any) => game.provider && game.provider.trim() !== '')
      .forEach((game: any) => {
        const provider = game.provider.trim();
        providerCounts.set(provider, (providerCounts.get(provider) || 0) + 1);
      });
    
    return Array.from(providerCounts.keys()).sort((a, b) => {
      const countA = providerCounts.get(a) || 0;
      const countB = providerCounts.get(b) || 0;
      if (countA !== countB) return countB - countA;
      return a.localeCompare(b, 'tr', { sensitivity: 'base' });
    });
  }, [games, providersData]);
  
  // Professional Game Filtering & Categorization with Mobile Detection
  const filteredAndSortedGames = useMemo(() => {
    let filtered = games.filter((game: any) => {
      // Text search - advanced matching
      const matchesSearch = !searchTerm || 
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.provider?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (game.description || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // Provider filter
      const matchesProvider = selectedProvider === 'all' || game.provider === selectedProvider;
      
      // Show all games - no device filtering to maximize game count
      const matchesDevice = true;
      
      // Advanced category filtering
      const matchesCategory = (() => {
        if (gameCategory === 'all') return true;
        if (gameCategory === 'favorites') return favorites.includes(game.uuid);
        
        const gameName = game.name.toLowerCase();
        const gameDescription = (game.description || '').toLowerCase();
        const gameFeatures = (game.features || []).map((f: string) => f.toLowerCase());
        
        switch (gameCategory) {
          case 'jackpot':
            return gameName.includes('jackpot') || 
                   gameName.includes('mega') || 
                   gameName.includes('progressive') ||
                   gameDescription.includes('jackpot') || 
                   gameFeatures.includes('jackpot') ||
                   game.jackpot === true;
          case 'megaways':
            return gameName.includes('megaways') || 
                   gameDescription.includes('megaways') ||
                   gameFeatures.includes('megaways');
          case 'bonus_buy':
            return gameName.includes('bonus') || 
                   gameName.includes('feature buy') ||
                   gameDescription.includes('feature buy') ||
                   gameDescription.includes('bonus buy') ||
                   gameFeatures.includes('bonus_buy') ||
                   game.bonus_buy === true;
          case 'classic':
            return gameName.includes('classic') || 
                   gameName.includes('fruit') ||
                   gameName.includes('777') ||
                   gameDescription.includes('classic') ||
                   ['Novomatic', 'Igrosoft', 'Amatic', 'EGT'].includes(game.provider);
          default:
            return true;
        }
      })();
      
      return matchesSearch && matchesProvider && matchesDevice && matchesCategory;
    });

    // Professional sorting system
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'tr', { sensitivity: 'base' });
        case 'provider':
          const providerA = a.provider || 'ZZZ'; // Unknown providers to end
          const providerB = b.provider || 'ZZZ';
          return providerA.localeCompare(providerB, 'tr', { sensitivity: 'base' });
        case 'popular':
          // Advanced popularity scoring
          const aPopularity = 
            (a.jackpot ? 100 : 0) + 
            (a.name.toLowerCase().includes('mega') ? 80 : 0) +
            (a.name.toLowerCase().includes('bonus') ? 60 : 0) +
            (recentlyViewed.includes(a.uuid) ? 40 : 0) +
            (favorites.includes(a.uuid) ? 30 : 0) +
            (['Pragmatic Play', 'NetEnt', 'Microgaming', 'Play\'n GO'].includes(a.provider) ? 20 : 0);
          const bPopularity = 
            (b.jackpot ? 100 : 0) + 
            (b.name.toLowerCase().includes('mega') ? 80 : 0) +
            (b.name.toLowerCase().includes('bonus') ? 60 : 0) +
            (recentlyViewed.includes(b.uuid) ? 40 : 0) +
            (favorites.includes(b.uuid) ? 30 : 0) +
            (['Pragmatic Play', 'NetEnt', 'Microgaming', 'Play\'n GO'].includes(b.provider) ? 20 : 0);
          return bPopularity - aPopularity;
        case 'newest':
          // Sort by creation date if available, otherwise by name
          const dateA = a.created_at || a.release_date || '2020-01-01';
          const dateB = b.created_at || b.release_date || '2020-01-01';
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        default:
          // Default: Popular providers first, then alphabetical
          const topProviders = ['Pragmatic Play', 'NetEnt', 'Microgaming', 'Play\'n GO', 'Evolution Gaming'];
          const aIsTop = topProviders.includes(a.provider);
          const bIsTop = topProviders.includes(b.provider);
          if (aIsTop && !bIsTop) return -1;
          if (!aIsTop && bIsTop) return 1;
          return a.name.localeCompare(b.name, 'tr');
      }
    });

    return filtered;
  }, [games, searchTerm, selectedProvider, gameCategory, sortBy, recentlyViewed, deviceInfo]);

  // Client-side pagination calculation
  const totalFilteredGames = filteredAndSortedGames.length;
  const totalPagesFiltered = Math.ceil(totalFilteredGames / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentPageGames = filteredAndSortedGames.slice(startIndex, endIndex);
  
  // Game Modal State
  const [selectedGame, setSelectedGame] = useState<SlotegratorGame | null>(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);

  // Advanced Game Management Functions
  const handlePlayGame = (game: SlotegratorGame) => {
    // Add to recently viewed
    const newRecentlyViewed = [game.uuid, ...recentlyViewed.filter(id => id !== game.uuid)].slice(0, 10);
    setRecentlyViewed(newRecentlyViewed);
    localStorage.setItem('slot-recently-viewed', JSON.stringify(newRecentlyViewed));
    
    // Open game modal
    setSelectedGame(game);
    setIsGameModalOpen(true);
  };

  const toggleFavorite = (gameUuid: string) => {
    const newFavorites = favorites.includes(gameUuid)
      ? favorites.filter(id => id !== gameUuid)
      : [...favorites, gameUuid];
    setFavorites(newFavorites);
    localStorage.setItem('slot-favorites', JSON.stringify(newFavorites));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedProvider('all');
    setGameCategory('all');
    setSortBy('popular');
    setCurrentPage(1);
  };
  
  if (isError) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Hata Oluştu</h2>
            <p className="text-gray-400 mb-4">Slot oyunları yüklenirken bir hata oluştu</p>
            <Button onClick={() => window.location.reload()}>
              Tekrar Dene
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-900/20 relative">
        {/* Header Banner */}
        <BannerDisplay type="header" pageLocation="slot" className="mb-4" />
        
        {/* Slider Banner */}
        <div className="w-full mb-6">
          <BannerDisplay type="slider" pageLocation="slot" className="mb-4" />
        </div>
        
        {/* Sidebar Banner */}
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
          <BannerDisplay type="sidebar" pageLocation="slot" />
        </div>
        
        {/* Arka plan efektleri */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#fbbf24_0%,_transparent_50%)] opacity-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_#f59e0b_0%,_transparent_50%)] opacity-5"></div>
        
        {/* Hero Banner */}
        <div className="relative bg-gradient-to-r from-black via-gray-900 to-yellow-900/40 overflow-hidden">
          {/* Zeus Banner Background */}
          <div className="absolute inset-0">
            <img 
              src={zeusBannerImage}
              alt="Zeus Banner"
              className="w-full h-full object-cover object-[center_top_25%]"
            />
          </div>
          

          

        </div>

        {/* Compact Provider Filter */}
        {!isLoading && uniqueProviders.length > 0 && (
          <div className="bg-gradient-to-r from-black via-yellow-900/10 to-black border-b border-yellow-500/20 py-3">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-yellow-400 text-sm font-medium">{translate('filters.providers', 'Sağlayıcılar')} ({uniqueProviders.length}):</span>
                {uniqueProviders.length > 19 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      console.log('Daha Fazla butonu tıklandı:', !showAllProviders);
                      setShowAllProviders(!showAllProviders);
                    }}
                    className="px-3 py-1 text-xs bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-300 rounded-full transition-colors cursor-pointer z-10 relative"
                    style={{ pointerEvents: 'auto' }}
                  >
                    {showAllProviders ? 'Daha Az' : `Daha Fazla (${uniqueProviders.length - 19})`}
                  </button>
                )}
              </div>
              
              {/* Provider Listesi - Mobilde Kaydırılabilir */}
              <div className="relative">
                {/* Gradient fade effects - only visible on mobile */}
                <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-black to-transparent pointer-events-none z-10 md:hidden"></div>
                <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-black to-transparent pointer-events-none z-10 md:hidden"></div>
                
                {/* Desktop: 2 Row Layout / Mobile: Single Scrollable Row */}
                <div className="hidden md:block space-y-2">
                  {/* İlk Sıra - Desktop */}
                  <div className="flex gap-2 overflow-hidden">
                    <button
                      onClick={() => setSelectedProvider('all')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                        selectedProvider === 'all'
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-800/50 text-yellow-200/80 hover:bg-yellow-900/30 border border-yellow-500/20'
                      }`}
                    >
                      {translate('gameType.all', 'Tümü')}
                    </button>
                    
                    {uniqueProviders
                      .slice(0, 9)
                      .map((provider: string) => {
                        const providerData = providersData.find((p: any) => p.name === provider);
                        const providerGameCount = providerData?.gameCount || games.filter((game: any) => game.provider === provider).length;
                        const isTopProvider = ['Pragmatic Play', 'NetEnt', 'Microgaming', 'Play\'n GO', 'Evolution Gaming'].includes(provider);
                        const isPopular = providerGameCount > 50;
                        const hasJackpot = providerData?.hasJackpot || false;
                        const hasMegaways = providerData?.hasMegaways || false;
                        
                        return (
                          <button
                            key={`row1-${provider}`}
                            onClick={() => setSelectedProvider(provider)}
                            className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                              selectedProvider === provider
                                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30 scale-105'
                                : 'bg-gray-800/50 text-yellow-200/80 hover:bg-yellow-900/30 border border-yellow-500/20 hover:border-yellow-400/40'
                            }`}
                          >
                            <span className="flex items-center gap-1">
                              {isTopProvider && <Crown className="w-3 h-3 text-yellow-400" />}
                              {hasJackpot && <span className="text-yellow-400">💰</span>}
                              {hasMegaways && <span className="text-purple-400">⚡</span>}
                              {provider}
                            <span className="text-xs text-yellow-300/60">({providerGameCount})</span>
                          </span>
                          {isPopular && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* İkinci Sıra - Desktop */}
                  <div className="flex gap-2 overflow-hidden">
                    {uniqueProviders
                      .slice(9, 19)
                      .map((provider: string) => {
                        const providerData = providersData.find((p: any) => p.name === provider);
                        const providerGameCount = providerData?.gameCount || games.filter((game: any) => game.provider === provider).length;
                        const isTopProvider = ['Pragmatic Play', 'NetEnt', 'Microgaming', 'Play\'n GO', 'Evolution Gaming'].includes(provider);
                        const isPopular = providerGameCount > 50;
                        const hasJackpot = providerData?.hasJackpot || false;
                        const hasMegaways = providerData?.hasMegaways || false;
                        
                        return (
                          <button
                            key={`row2-${provider}`}
                            onClick={() => setSelectedProvider(provider)}
                            className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                              selectedProvider === provider
                                ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30 scale-105'
                                : 'bg-gray-800/50 text-yellow-200/80 hover:bg-yellow-900/30 border border-yellow-500/20 hover:border-yellow-400/40'
                            }`}
                          >
                            <span className="flex items-center gap-1">
                              {isTopProvider && <Crown className="w-3 h-3 text-yellow-400" />}
                              {hasJackpot && <span className="text-yellow-400">💰</span>}
                              {hasMegaways && <span className="text-purple-400">⚡</span>}
                              {provider}
                              <span className="text-xs text-yellow-300/60">({providerGameCount})</span>
                            </span>
                            {isPopular && (
                              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>
                            )}
                          </button>
                        );
                      })}
                  </div>
                </div>
                
                {/* Mobile: Single Scrollable Row */}
                <div className="md:hidden">
                  <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2" style={{ scrollSnapType: 'x mandatory' }}>
                    <button
                      onClick={() => setSelectedProvider('all')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                        selectedProvider === 'all'
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-800/50 text-yellow-200/80 hover:bg-yellow-900/30 border border-yellow-500/20'
                      }`}
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      {translate('gameType.all', 'Tümü')}
                    </button>
                    
                    {uniqueProviders.map((provider: string) => {
                      const providerData = providersData.find((p: any) => p.name === provider);
                      const providerGameCount = providerData?.gameCount || games.filter((game: any) => game.provider === provider).length;
                      const isTopProvider = ['Pragmatic Play', 'NetEnt', 'Microgaming', 'Play\'n GO', 'Evolution Gaming'].includes(provider);
                      const hasJackpot = providerData?.hasJackpot || false;
                      const hasMegaways = providerData?.hasMegaways || false;
                      
                      return (
                        <button
                          key={`mobile-${provider}`}
                          onClick={() => setSelectedProvider(provider)}
                          className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                            selectedProvider === provider
                              ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30'
                              : 'bg-gray-800/50 text-yellow-200/80 hover:bg-yellow-900/30 border border-yellow-500/20'
                          }`}
                          style={{ scrollSnapAlign: 'start' }}
                        >
                          <span className="flex items-center gap-1">
                            {isTopProvider && <Crown className="w-3 h-3 text-yellow-400" />}
                            {hasJackpot && <span className="text-yellow-400">💰</span>}
                            {hasMegaways && <span className="text-purple-400">⚡</span>}
                            {provider}
                            <span className="text-xs text-yellow-300/60">({providerGameCount})</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Genişletilmiş Provider Listesi - "Daha Fazla" basıldığında görünür */}
                {showAllProviders && uniqueProviders.length > 19 && (
                  <div className="space-y-2 mt-2 border-t border-yellow-500/20 pt-2">
                    {Array.from({ length: Math.ceil((uniqueProviders.length - 19) / 10) }, (_, rowIndex) => (
                      <div key={rowIndex} className="flex gap-2 overflow-hidden">
                        {uniqueProviders
                          .slice(19 + rowIndex * 10, 19 + (rowIndex + 1) * 10)
                          .map((provider: string) => {
                            const providerData = providersData.find((p: any) => p.name === provider);
                            const providerGameCount = providerData?.gameCount || games.filter((game: any) => game.provider === provider).length;
                            const isTopProvider = ['Pragmatic Play', 'NetEnt', 'Microgaming', 'Play\'n GO', 'Evolution Gaming'].includes(provider);
                            const isPopular = providerGameCount > 50;
                            const hasJackpot = providerData?.hasJackpot || false;
                            const hasMegaways = providerData?.hasMegaways || false;
                            
                            return (
                              <button
                                key={`expanded-${provider}`}
                                onClick={() => setSelectedProvider(provider)}
                                className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                                  selectedProvider === provider
                                    ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/30 scale-105'
                                    : 'bg-gray-800/50 text-yellow-200/80 hover:bg-yellow-900/30 border border-yellow-500/20 hover:border-yellow-400/40'
                                }`}
                              >
                                <span className="flex items-center gap-1.5">
                                  {isTopProvider && <span className="text-yellow-400">⭐</span>}
                                  {hasJackpot && <span className="text-green-400">💎</span>}
                                  {hasMegaways && <span className="text-purple-400">🎰</span>}
                                  <span>{provider}</span>
                                  <span className="text-yellow-400/60">({providerGameCount})</span>
                                  {isPopular && <span className="text-orange-400">🔥</span>}
                                </span>
                              </button>
                            );
                          })}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="relative bg-gradient-to-r from-black via-gray-900 to-yellow-900/30 border-b border-yellow-500/20 backdrop-blur-sm overflow-hidden">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-yellow-100 mb-2">
                  {selectedProvider === 'all' ? translate('gameType.all', 'Tümü') + ' ' + translate('games.games', 'Oyun') : `${selectedProvider} ${translate('games.games', 'Oyun')}`}
                </h2>
                <p className="text-yellow-200/60">
                  {isLoading ? translate('games.loading', 'Yükleniyor...') : `${totalFilteredGames} ${translate('gameType.slots', 'slot').toLowerCase()}`}
                </p>
              </div>
              
              {/* Professional Game Filters */}
              <div className="flex flex-col gap-4 min-w-0 lg:min-w-[600px]">
                {/* Game Category Filters with API Data */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { key: 'all', label: translate('slots.category.all', 'Tümü'), icon: Gamepad2 },
                    { key: 'jackpot', label: translate('slots.category.jackpot', 'Jackpot'), icon: Crown },
                    { key: 'megaways', label: translate('slots.category.megaways', 'Megaways'), icon: Bolt },
                    { key: 'bonus_buy', label: translate('slots.category.bonus_buy', 'Bonus Buy'), icon: Gift },
                    { key: 'classic', label: translate('slots.category.classic', 'Klasik'), icon: Trophy }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setGameCategory(key as any)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                        gameCategory === key
                          ? 'bg-gradient-to-r from-yellow-500 to-amber-500 text-black shadow-lg'
                          : 'bg-gray-800/50 text-yellow-200/80 hover:bg-yellow-900/30 border border-yellow-500/20'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                      {gameCategory === key && (
                        <span className="bg-black/20 px-1.5 py-0.5 rounded text-xs">
                          {totalFilteredGames}
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Search and Controls Row */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 w-4 h-4" />
                    <Input
                      placeholder={translate('slots.filters.search_placeholder', 'Oyun ara...')}
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 bg-gray-800/50 border-yellow-500/30 text-white placeholder-yellow-200/50 focus:border-yellow-400"
                    />
                  </div>
                  
                  <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                    <SelectTrigger className="w-[180px] bg-gray-800/50 border-yellow-500/30 text-yellow-100">
                      <Filter className="w-4 h-4 mr-2 text-yellow-400" />
                      <SelectValue placeholder={translate('provider.label')} />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-yellow-500/30">
                      <SelectItem value="all" className="text-yellow-100">
                        {translate('provider.all')} ({totalCount})
                      </SelectItem>
                      {uniqueProviders.map((provider: any) => {
                        const count = games.filter((game: any) => game.provider === provider).length;
                        return (
                          <SelectItem key={provider} value={provider} className="text-yellow-100">
                            {provider} ({count})
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>

                  <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                    <SelectTrigger className="w-[120px] bg-gray-800/50 border-yellow-500/30">
                      <TrendingUp className="w-4 h-4 mr-2 text-yellow-400" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-900 border-yellow-500/30">
                      <SelectItem value="popular" className="text-yellow-100">
                        {translate('slots.sort.popular')}
                      </SelectItem>
                      <SelectItem value="newest" className="text-yellow-100">
                        {translate('slots.sort.newest')}
                      </SelectItem>
                      <SelectItem value="name" className="text-yellow-100">
                        {translate('slots.sort.name')}
                      </SelectItem>
                      <SelectItem value="provider" className="text-yellow-100">
                        {translate('slots.sort.provider')}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      onClick={() => setViewMode('grid')}
                      className="p-3 border-yellow-500/30"
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      onClick={() => setViewMode('list')}
                      className="p-3 border-yellow-500/30"
                    >
                      <List className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={clearFilters}
                      className="p-3 border-yellow-500/30 hover:bg-yellow-900/30"
                      title={translate('slots.filters.clear_all', 'Filtreleri Temizle')}
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        


        {/* İçerik */}
        <div className="relative container mx-auto px-4 py-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto"></div>
                <h3 className="text-2xl font-bold text-white mt-4">
                  {translate('games.loading', 'Yükleniyor...')}
                </h3>
              </div>
            </div>
          ) : (
            <>
              {/* Professional Statistics Bar */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-gray-900/50 via-black/30 to-gray-900/50 rounded-lg border border-yellow-500/20">
                <div className="flex items-center gap-6 text-sm text-yellow-200/80">
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-yellow-400" />
                    {translate('slots.stats.showing')}: <strong className="text-yellow-300">{currentPageGames.length}</strong> / <strong className="text-white">{totalFilteredGames}</strong>
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-yellow-400" />
                    <strong className="text-white">{uniqueProviders.length}</strong> {translate('slots.stats.providers', 'Sağlayıcı')}
                  </span>
                  {gameCategory !== 'all' && (
                    <span className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 border border-yellow-500/30 rounded-full">
                      <Filter className="w-4 h-4 text-yellow-400" />
                      <span className="text-yellow-200 font-medium">
                        {gameCategory === 'jackpot' ? translate('slots.category.jackpot', 'Jackpot') :
                         gameCategory === 'megaways' ? translate('slots.category.megaways', 'Megaways') :
                         gameCategory === 'bonus_buy' ? translate('slots.category.bonus_buy', 'Bonus Satın Al') :
                         gameCategory === 'classic' ? translate('slots.category.classic', 'Klasik') :
                         gameCategory === 'favorites' ? translate('slots.category.favorites', 'Favoriler') : gameCategory}
                      </span>
                    </span>
                  )}
                </div>

                {favorites.length > 0 && (
                  <button
                    onClick={() => setGameCategory('favorites' as any)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 hover:bg-red-500/30 transition-all duration-300 hover:scale-105"
                  >
                    <Heart className="w-4 h-4" />
                    <span className="font-medium">{translate('slots.category.favorites')}</span>
                    <span className="bg-red-500/40 px-2 py-0.5 rounded-full text-xs font-bold">{favorites.length}</span>
                  </button>
                )}
              </div>

              {/* Enhanced Game Grid */}
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' 
                  : 'grid-cols-1 max-w-2xl mx-auto'
              }`}>
                {currentPageGames.map((game: any) => (
                  <div key={game.uuid} className="relative group">
                    <GameCard
                      game={game}
                      onClick={handlePlayGame}
                    />
                    
                    {/* Professional Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(game.uuid);
                      }}
                      className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 z-10 ${
                        viewMode === 'grid' ? 'opacity-0 group-hover:opacity-100' : 'opacity-80'
                      } ${
                        favorites.includes(game.uuid)
                          ? 'bg-red-500 text-white shadow-lg shadow-red-500/30'
                          : 'bg-black/70 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(game.uuid) ? 'fill-current' : ''}`} />
                    </button>

                    {/* Game Features Badges */}
                    {viewMode === 'grid' && (
                      <div className="absolute bottom-2 left-2 flex flex-wrap gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {game.name.toLowerCase().includes('jackpot') && (
                          <span className="px-2 py-1 bg-yellow-500 text-black text-xs rounded-full font-bold shadow-lg">
                            💰 {translate('slots.badges.jackpot', 'JACKPOT')}
                          </span>
                        )}
                        {game.name.toLowerCase().includes('megaways') && (
                          <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full font-bold shadow-lg">
                            ⚡ {translate('slots.badges.megaways', 'MEGAWAYS')}
                          </span>
                        )}
                        {recentlyViewed.includes(game.uuid) && (
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full font-bold shadow-lg">
                            🎮 {translate('slots.badges.recent', 'YENİ')}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Advanced List View Overlay */}
                    {viewMode === 'list' && (
                      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center p-6 rounded-lg">
                        <div className="text-white w-full">
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <h3 className="font-bold text-xl mb-1 text-yellow-100">{game.name}</h3>
                              <p className="text-yellow-400 text-lg font-medium">{game.provider}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {favorites.includes(game.uuid) && (
                                <Heart className="w-5 h-5 text-red-400 fill-current" />
                              )}
                              {recentlyViewed.includes(game.uuid) && (
                                <span className="text-blue-400 text-sm">●</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 mb-4">
                            {game.name.toLowerCase().includes('jackpot') && (
                              <span className="px-3 py-1 bg-yellow-500 text-black text-sm rounded-full font-bold">
                                💰 {translate('slots.badges.jackpot', 'JACKPOT')} GAME
                              </span>
                            )}
                            {game.name.toLowerCase().includes('megaways') && (
                              <span className="px-3 py-1 bg-purple-500 text-white text-sm rounded-full font-bold">
                                ⚡ {translate('slots.badges.megaways', 'MEGAWAYS')}
                              </span>
                            )}
                            {game.name.toLowerCase().includes('bonus') && (
                              <span className="px-3 py-1 bg-green-500 text-white text-sm rounded-full font-bold">
                                🎁 {translate('slots.badges.bonus')}
                              </span>
                            )}
                          </div>

                          <button
                            onClick={() => handlePlayGame(game)}
                            className="px-6 py-2 bg-gradient-to-r from-yellow-500 to-amber-500 text-black font-bold rounded-lg hover:from-yellow-400 hover:to-amber-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                          >
                            🎮 {translate('slots.actions.play')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              
              {/* Sayfalama */}
              {totalPagesFiltered > 1 && (
                <div className="flex justify-center mt-8 space-x-2">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    {translate('games.prev_page', 'Önceki')}
                  </Button>
                  
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: Math.min(5, totalPagesFiltered) }, (_, i) => {
                      const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                      if (page > totalPagesFiltered) return null;
                      
                      return (
                        <Button
                          key={page}
                          variant={page === currentPage ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      );
                    })}
                  </div>
                  
                  <Button
                    variant="outline"
                    disabled={currentPage === totalPagesFiltered}
                    onClick={() => setCurrentPage(currentPage + 1)}
                  >
                    {translate('games.next_page', 'Sonraki')}
                  </Button>
                </div>
              )}
              
              {totalFilteredGames === 0 && !isLoading && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-lg mb-4">{translate('games.no_games_found', 'Oyun Bulunamadı')}</div>
                  <Button variant="outline" onClick={() => {
                    setSearchTerm('');
                    setSelectedProvider('all');
                  }}>
                    {translate('slots.filters.clear_all', 'Filtreleri Temizle')}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Game Modal */}
      <GameModal
        game={selectedGame}
        isOpen={isGameModalOpen}
        onClose={() => {
          setIsGameModalOpen(false);
          setSelectedGame(null);
        }}
      />
    </MainLayout>
  );
};

export default SlotPage;