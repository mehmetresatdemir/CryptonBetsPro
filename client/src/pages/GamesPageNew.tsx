import React, { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '../components/layout/MainLayout';
import GameModal from '../components/GameModal';
import BannerDisplay from '../components/BannerDisplay';
import { translate } from '../utils/i18n-fixed';
import { SlotegratorGame } from '../types/slotegrator';
import { useDeviceDetection } from '../hooks/useDeviceDetection';
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
  X,
  Rocket,
  Diamond
} from 'lucide-react';

// Crash games banner image
const crashBannerImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRkZENzAwO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjUwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGOUYwMDtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRkY2QzAwO3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFkaWVudCkiLz4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNSQVNIPC90ZXh0Pgo8L3N2Zz4=';

import { Skeleton } from '../components/ui/skeleton';
import { debounce } from '../utils/performance';
import { PerformanceMonitor } from '../components/PerformanceMonitor';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { deviceOptimization } from '../utils/deviceOptimization';
import JackpotTracker from '../components/JackpotTracker';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select';

// Crash Game card component
const CrashGameCard = React.memo(({ game, onClick }: { 
  game: SlotegratorGame; 
  onClick: (game: SlotegratorGame) => void;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  
  const imageUrl = game.images && game.images.length > 0 ? game.images[0].url : game.image;
  
  const isCrashGame = (() => {
    const gameName = game.name.toLowerCase();
    const crashKeywords = ['aviator', 'jetx', 'spaceman', 'mines', 'plinko', 'crash', 'balloon', 'zeppelin', 'rocket'];
    return crashKeywords.some(keyword => gameName.includes(keyword));
  })();
  
  return (
    <div 
      onClick={() => onClick(game)}
      className="group relative bg-gradient-to-b from-gray-900 via-black to-orange-900/10 rounded-xl overflow-hidden border border-orange-500/20 hover:border-orange-400/80 transition-all duration-300 cursor-pointer hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/30"
    >
      {/* Game Image */}
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
              <Rocket className="w-8 h-8 mx-auto mb-2" />
              <div className="text-xs">{game.name}</div>
            </div>
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <Button 
            size="sm" 
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-2 rounded-full shadow-lg transform scale-90 group-hover:scale-100 transition-transform duration-300"
          >
            <Rocket className="w-4 h-4 mr-2" />
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
        
        {/* Crash badge */}
        {isCrashGame && (
          <div className="absolute top-2 right-2">
            <Badge variant="outline" className="bg-orange-500/20 border-orange-500 text-orange-400 text-xs px-2 py-1 animate-pulse">
              🚀 CRASH
            </Badge>
          </div>
        )}
      </div>
      
      {/* Game information */}
      <div className="p-3">
        <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1 group-hover:text-orange-400 transition-colors">
          {game.name}
        </h3>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{game.provider}</span>
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 fill-orange-400 text-orange-400" />
            <span className="text-orange-400">4.8</span>
          </div>
        </div>
      </div>
    </div>
  );
});

const GamesPage: React.FC = () => {
  const deviceInfo = useDeviceDetection();
  
  // Advanced State Management
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<'name' | 'provider' | 'popular' | 'newest'>('popular');
  const [showAllProviders, setShowAllProviders] = useState(false);
  const [gameCategory, setGameCategory] = useState<'all' | 'aviator' | 'mines' | 'plinko' | 'crash' | 'balloon' | 'favorites'>('all');
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGame, setSelectedGame] = useState<SlotegratorGame | null>(null);
  const [isGameModalOpen, setIsGameModalOpen] = useState(false);
  
  // Local Storage Management
  useEffect(() => {
    const savedFavorites = localStorage.getItem('games-favorites');
    const savedRecentlyViewed = localStorage.getItem('games-recently-viewed');
    if (savedFavorites) setFavorites(JSON.parse(savedFavorites));
    if (savedRecentlyViewed) setRecentlyViewed(JSON.parse(savedRecentlyViewed));
  }, []);

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedProvider, gameCategory, sortBy]);
  
  const perPage = deviceInfo.isMobile ? 16 : 32;
  
  // Crash games loading
  const {
    data: crashData,
    isLoading,
    isError,
    error
  } = useQuery({
    queryKey: ['crash-games-all'],
    queryFn: async () => {
      console.log(`🚀 Loading crash games...`);
      
      try {
        const response = await fetch('/api/slotegrator/games/slots', {
          headers: {
            'Cache-Control': 'public, max-age=3600'
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log(`🚀 Games loaded: ${data.games?.length || 0}`);
        
        // Filter for crash games only
        const crashGames = data.games?.filter((game: any) => {
          const gameName = game.name.toLowerCase();
          const gameProvider = game.provider?.toLowerCase() || '';
          
          // Crash game keywords and providers
          const crashKeywords = ['aviator', 'jetx', 'spaceman', 'mines', 'plinko', 'crash', 'balloon', 'zeppelin', 'rocket', 'x multiplier'];
          const crashProviders = ['spribe', 'bgaming', 'smartsoft', 'turbo games', 'evoplay', 'gaming corps'];
          
          return crashKeywords.some(keyword => gameName.includes(keyword)) ||
                 crashProviders.some(provider => gameProvider.includes(provider));
        }) || [];
        
        console.log(`🚀 Crash games filtered: ${crashGames.length}`);
        
        return {
          items: crashGames,
          _meta: { totalCount: crashGames.length },
          providers: [],
          categories: {},
          stats: {}
        };
      } catch (error) {
        console.error('❌ Crash games loading error:', error);
        throw error;
      }
    },
    staleTime: 60 * 60 * 1000,
    gcTime: 2 * 60 * 60 * 1000,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
  
  const games = crashData?.items || [];
  const totalCount = crashData?._meta?.totalCount || 0;
  
  // Providers from crash games
  const uniqueProviders = useMemo(() => {
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
  }, [games]);
  
  // Game filtering and categorization
  const filteredAndSortedGames = useMemo(() => {
    let filtered = games.filter((game: any) => {
      // Text search
      const matchesSearch = !searchTerm || 
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.provider?.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Provider filter
      const matchesProvider = selectedProvider === 'all' || game.provider === selectedProvider;
      
      // Category filtering
      const matchesCategory = (() => {
        if (gameCategory === 'all') return true;
        if (gameCategory === 'favorites') return favorites.includes(game.uuid);
        
        const gameName = game.name.toLowerCase();
        
        switch (gameCategory) {
          case 'aviator':
            return gameName.includes('aviator');
          case 'mines':
            return gameName.includes('mines');
          case 'plinko':
            return gameName.includes('plinko');
          case 'crash':
            return gameName.includes('crash') || gameName.includes('jetx') || gameName.includes('spaceman');
          case 'balloon':
            return gameName.includes('balloon') || gameName.includes('zeppelin');
          default:
            return true;
        }
      })();
      
      return matchesSearch && matchesProvider && matchesCategory;
    });

    // Sorting
    filtered.sort((a: any, b: any) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name, 'tr', { sensitivity: 'base' });
        case 'provider':
          return (a.provider || '').localeCompare(b.provider || '', 'tr', { sensitivity: 'base' });
        case 'newest':
          return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
        case 'popular':
        default:
          return (b.popularity || 0) - (a.popularity || 0);
      }
    });

    return filtered;
  }, [games, searchTerm, selectedProvider, gameCategory, sortBy, favorites]);

  // Pagination
  const totalFilteredGames = filteredAndSortedGames.length;
  const totalPagesFiltered = Math.ceil(totalFilteredGames / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const currentPageGames = filteredAndSortedGames.slice(startIndex, startIndex + perPage);

  // Game interaction handlers
  const handlePlayGame = (game: SlotegratorGame) => {
    setSelectedGame(game);
    setIsGameModalOpen(true);
    
    // Add to recently viewed
    const updated = [game.uuid, ...recentlyViewed.filter(id => id !== game.uuid)].slice(0, 10);
    setRecentlyViewed(updated);
    localStorage.setItem('games-recently-viewed', JSON.stringify(updated));
  };

  const toggleFavorite = (gameUuid: string) => {
    const updated = favorites.includes(gameUuid)
      ? favorites.filter(id => id !== gameUuid)
      : [...favorites, gameUuid];
    setFavorites(updated);
    localStorage.setItem('games-favorites', JSON.stringify(updated));
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
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">Hata Oluştu</h2>
            <p className="text-gray-400">{error?.message}</p>
          </div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-orange-900/20 relative">
        {/* Header Banner */}
        <BannerDisplay type="header" pageLocation="games" className="mb-4" />
        
        {/* Slider Banner */}
        <div className="w-full mb-6">
          <BannerDisplay type="slider" pageLocation="games" className="mb-4" />
        </div>
        
        {/* Sidebar Banner */}
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40 hidden lg:block">
          <BannerDisplay type="sidebar" pageLocation="games" />
        </div>
        
        {/* Background effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_#f97316_0%,_transparent_50%)] opacity-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_#ea580c_0%,_transparent_50%)] opacity-5"></div>
        
        {/* Hero Banner */}
        <div className="relative bg-gradient-to-r from-black via-gray-900 to-orange-900/40 overflow-hidden">
          <div className="absolute inset-0">
            <img 
              src={crashBannerImage}
              alt="Crash Games Banner"
              className="w-full h-full object-cover object-[center_top_25%]"
            />
          </div>
        </div>

        {/* Provider Filter */}
        {!isLoading && uniqueProviders.length > 0 && (
          <div className="bg-gradient-to-r from-black via-orange-900/10 to-black border-b border-orange-500/20 py-3">
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-orange-400 text-sm font-medium">{translate('filters.providers', 'Sağlayıcılar')} ({uniqueProviders.length}):</span>
                {uniqueProviders.length > 19 && (
                  <button
                    type="button"
                    onClick={() => setShowAllProviders(!showAllProviders)}
                    className="px-3 py-1 text-xs bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 rounded-full transition-colors"
                  >
                    {showAllProviders ? 'Daha Az' : `Daha Fazla (${uniqueProviders.length - 19})`}
                  </button>
                )}
              </div>
              
              <div className="relative">
                {/* Gradient fade effects - only visible on mobile */}
                <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-black to-transparent pointer-events-none z-10 md:hidden"></div>
                <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-black to-transparent pointer-events-none z-10 md:hidden"></div>
                
                {/* Desktop: 2 Row Layout / Mobile: Single Scrollable Row */}
                <div className="hidden md:block space-y-2">
                  {/* First Row - Desktop */}
                  <div className="flex gap-2 overflow-hidden">
                    <button
                      onClick={() => setSelectedProvider('all')}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                        selectedProvider === 'all'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-800/50 text-orange-200/80 hover:bg-orange-900/30 border border-orange-500/20'
                      }`}
                    >
                      {translate('gameType.all', 'Tümü')}
                    </button>
                    
                    {uniqueProviders.slice(0, 9).map((provider: string) => {
                      const providerGameCount = games.filter((game: any) => game.provider === provider).length;
                      const providerIcon = provider.toLowerCase().includes('spribe') ? '🚀' : 
                                          provider.toLowerCase().includes('bgaming') ? '⚡' : 
                                          provider.toLowerCase().includes('smartsoft') ? '💎' : '';
                      
                      return (
                        <button
                          key={`row1-${provider}`}
                          onClick={() => setSelectedProvider(provider)}
                          className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                            selectedProvider === provider
                              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                              : 'bg-gray-800/50 text-orange-200/80 hover:bg-orange-900/30 border border-orange-500/20'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            {providerIcon && <span>{providerIcon}</span>}
                            {provider}
                            <span className="text-xs text-orange-300/60">({providerGameCount})</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Second Row - Desktop */}
                  <div className="flex gap-2 overflow-hidden">
                    {uniqueProviders.slice(9, 19).map((provider: string) => {
                      const providerGameCount = games.filter((game: any) => game.provider === provider).length;
                      const providerIcon = provider.toLowerCase().includes('spribe') ? '🚀' : 
                                          provider.toLowerCase().includes('bgaming') ? '⚡' : 
                                          provider.toLowerCase().includes('smartsoft') ? '💎' : '';
                      
                      return (
                        <button
                          key={`row2-${provider}`}
                          onClick={() => setSelectedProvider(provider)}
                          className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                            selectedProvider === provider
                              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                              : 'bg-gray-800/50 text-orange-200/80 hover:bg-orange-900/30 border border-orange-500/20'
                          }`}
                        >
                          <span className="flex items-center gap-1">
                            {providerIcon && <span>{providerIcon}</span>}
                            {provider}
                            <span className="text-xs text-orange-300/60">({providerGameCount})</span>
                          </span>
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
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-800/50 text-orange-200/80 hover:bg-orange-900/30 border border-orange-500/20'
                      }`}
                      style={{ scrollSnapAlign: 'start' }}
                    >
                      {translate('gameType.all', 'Tümü')}
                    </button>
                    
                    {uniqueProviders.map((provider: string) => {
                      const providerGameCount = games.filter((game: any) => game.provider === provider).length;
                      const providerIcon = provider.toLowerCase().includes('spribe') ? '🚀' : 
                                          provider.toLowerCase().includes('bgaming') ? '⚡' : 
                                          provider.toLowerCase().includes('smartsoft') ? '💎' : '';
                      
                      return (
                        <button
                          key={`mobile-${provider}`}
                          onClick={() => setSelectedProvider(provider)}
                          className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap flex-shrink-0 ${
                            selectedProvider === provider
                              ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                              : 'bg-gray-800/50 text-orange-200/80 hover:bg-orange-900/30 border border-orange-500/20'
                          }`}
                          style={{ scrollSnapAlign: 'start' }}
                        >
                          <span className="flex items-center gap-1">
                            {providerIcon && <span>{providerIcon}</span>}
                            {provider}
                            <span className="text-xs text-orange-300/60">({providerGameCount})</span>
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
                
                {/* Expanded providers */}
                {showAllProviders && uniqueProviders.length > 19 && (
                  <div className="space-y-2 mt-2 border-t border-orange-500/20 pt-2">
                    {Array.from({ length: Math.ceil((uniqueProviders.length - 19) / 10) }, (_, rowIndex) => (
                      <div key={rowIndex} className="flex gap-2 overflow-hidden">
                        {uniqueProviders
                          .slice(19 + rowIndex * 10, 19 + (rowIndex + 1) * 10)
                          .map((provider: string) => {
                            const providerGameCount = games.filter((game: any) => game.provider === provider).length;
                            
                            return (
                              <button
                                key={`expanded-${provider}`}
                                onClick={() => setSelectedProvider(provider)}
                                className={`relative px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 whitespace-nowrap ${
                                  selectedProvider === provider
                                    ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30 scale-105'
                                    : 'bg-gray-800/50 text-orange-200/80 hover:bg-orange-900/30 border border-orange-500/20'
                                }`}
                              >
                                <span className="flex items-center gap-1.5">
                                  <span>{provider}</span>
                                  <span className="text-orange-400/60">({providerGameCount})</span>
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

        {/* Header Controls */}
        <div className="relative bg-gradient-to-r from-black via-gray-900 to-orange-900/30 border-b border-orange-500/20 backdrop-blur-sm overflow-hidden">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-orange-100 mb-2">
                  {selectedProvider === 'all' ? translate('gameType.all', 'Tümü') + ' Crash Oyunları' : `${selectedProvider} Crash Oyunları`}
                </h2>
                <p className="text-orange-200/60 text-sm">
                  {translate('games.subtitle', 'Aviator, JetX, Mines, Plinko ve daha fazlası')}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-orange-400 w-4 h-4" />
                  <Input
                    placeholder={translate('games.search_placeholder', 'Oyun ara...')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-800/50 border-orange-500/30 text-white placeholder-orange-200/50 focus:border-orange-400"
                  />
                </div>

                {/* Category Filter */}
                <Select value={gameCategory} onValueChange={(value) => setGameCategory(value as any)}>
                  <SelectTrigger className="bg-gray-800/50 border-orange-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">{translate('gameType.all', 'Tümü')}</SelectItem>
                    <SelectItem value="aviator">Aviator</SelectItem>
                    <SelectItem value="mines">Mines</SelectItem>
                    <SelectItem value="plinko">Plinko</SelectItem>
                    <SelectItem value="crash">Crash</SelectItem>
                    <SelectItem value="balloon">Balloon</SelectItem>
                    <SelectItem value="favorites">Favoriler</SelectItem>
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as any)}>
                  <SelectTrigger className="bg-gray-800/50 border-orange-500/30 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="popular">Popüler</SelectItem>
                    <SelectItem value="name">İsim</SelectItem>
                    <SelectItem value="provider">Sağlayıcı</SelectItem>
                    <SelectItem value="newest">En Yeni</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Mode */}
                <div className="flex gap-1 bg-gray-800/50 rounded-lg p-1 border border-orange-500/30">
                  <Button
                    size="sm"
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    onClick={() => setViewMode('grid')}
                    className="p-3 border-orange-500/30"
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    onClick={() => setViewMode('list')}
                    className="p-3 border-orange-500/30"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={clearFilters}
                    className="p-3 border-orange-500/30 hover:bg-orange-900/30"
                    title={translate('slots.filters.clear_all', 'Filtreleri Temizle')}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative container mx-auto px-4 py-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto"></div>
                <h3 className="text-2xl font-bold text-white mt-4">
                  {translate('games.loading', 'Yükleniyor...')}
                </h3>
              </div>
            </div>
          ) : (
            <>
              {/* Statistics Bar */}
              <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-gray-900/50 via-black/30 to-gray-900/50 rounded-lg border border-orange-500/20">
                <div className="flex items-center gap-6 text-sm text-orange-200/80">
                  <span className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-orange-400" />
                    {translate('slots.stats.showing')}: <strong className="text-orange-300">{currentPageGames.length}</strong> / <strong className="text-white">{totalFilteredGames}</strong>
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-orange-400" />
                    <strong className="text-white">{uniqueProviders.length}</strong> {translate('slots.stats.providers', 'Sağlayıcı')}
                  </span>
                  {gameCategory !== 'all' && (
                    <span className="flex items-center gap-2 px-3 py-1 bg-orange-500/20 border border-orange-500/30 rounded-full">
                      <Filter className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-200 font-medium">
                        {gameCategory === 'aviator' ? 'Aviator' :
                         gameCategory === 'mines' ? 'Mines' :
                         gameCategory === 'plinko' ? 'Plinko' :
                         gameCategory === 'crash' ? 'Crash' :
                         gameCategory === 'balloon' ? 'Balloon' :
                         gameCategory === 'favorites' ? 'Favoriler' : gameCategory}
                      </span>
                    </span>
                  )}
                </div>

                {favorites.length > 0 && (
                  <button
                    onClick={() => setGameCategory('favorites' as any)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-orange-500/20 border border-orange-500/30 text-orange-400 hover:bg-orange-500/30 transition-all duration-300 hover:scale-105"
                  >
                    <Heart className="w-4 h-4" />
                    <span className="font-medium">{translate('slots.category.favorites')}</span>
                    <span className="bg-orange-500/40 px-2 py-0.5 rounded-full text-xs font-bold">{favorites.length}</span>
                  </button>
                )}
              </div>

              {/* Game Grid */}
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6' 
                  : 'grid-cols-1 max-w-2xl mx-auto'
              }`}>
                {currentPageGames.map((game: any) => (
                  <div key={game.uuid} className="relative group">
                    <CrashGameCard
                      game={game}
                      onClick={handlePlayGame}
                    />
                    
                    {/* Favorite Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleFavorite(game.uuid);
                      }}
                      className={`absolute top-2 right-2 p-2 rounded-full transition-all duration-300 z-10 ${
                        viewMode === 'grid' ? 'opacity-0 group-hover:opacity-100' : 'opacity-80'
                      } ${
                        favorites.includes(game.uuid)
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                          : 'bg-black/70 text-orange-400 hover:bg-orange-500/20 border border-orange-500/30'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${favorites.includes(game.uuid) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {totalPagesFiltered > 1 && (
                <div className="flex justify-center items-center gap-2 mt-8">
                  <Button
                    variant="outline"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                  >
                    {translate('games.previous_page', 'Önceki')}
                  </Button>
                  
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPagesFiltered) }, (_, i) => {
                      const pageNumber = i + 1;
                      return (
                        <Button
                          key={pageNumber}
                          variant={currentPage === pageNumber ? 'default' : 'outline'}
                          onClick={() => setCurrentPage(pageNumber)}
                          className="w-10 h-10"
                        >
                          {pageNumber}
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
                  <Button variant="outline" onClick={clearFilters}>
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

export default GamesPage;