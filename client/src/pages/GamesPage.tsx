import React, { useState, useMemo, useEffect } from 'react';
import MainLayout from '../components/layout/MainLayout';
import BannerDisplay from '../components/BannerDisplay';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useQuery } from '@tanstack/react-query';
import { translate } from '../utils/i18n-fixed';
import { Search, Filter, Grid, List, TrendingUp, Rocket, Zap, Diamond } from 'lucide-react';

interface SlotegratorGame {
  uuid: string;
  name: string;
  provider: string;
  type: string;
  imageUrl?: string;
  playUrl?: string;
  popularity?: number;
  created_at?: string;
}

export default function GamesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState('all');
  const [gameCategory, setGameCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  
  const perPage = 24;

  // Crash Games oyunları yükleme - Slotegrator API'dan
  const { data: games = [], isLoading, error } = useQuery({
    queryKey: ['/api/slotegrator/games/slots'],
    queryFn: async () => {
      const response = await fetch('/api/slotegrator/games/slots');
      if (!response.ok) throw new Error('Crash oyunları yüklenemedi');
      const data = await response.json();
      return data.games || [];
    }
  });

  // Favorites ve recent viewed localStorage'dan yükle
  useEffect(() => {
    const savedFavorites = localStorage.getItem('games-favorites');
    const savedRecentlyViewed = localStorage.getItem('games-recently-viewed');
    
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    if (savedRecentlyViewed) {
      setRecentlyViewed(JSON.parse(savedRecentlyViewed));
    }
  }, []);

  // Sadece Crash Games Sağlayıcıları listesi
  const uniqueProviders = useMemo(() => {
    if (!games || !Array.isArray(games)) return [];
    
    // Önce crash oyunlarını filtrele
    const crashGames = games.filter((game: SlotegratorGame) => {
      const gameName = game.name.toLowerCase();
      const gameProvider = game.provider.toLowerCase();
      
      // Crash oyunu tanımlayıcıları
      const crashKeywords = ['aviator', 'jetx', 'spaceman', 'mines', 'plinko', 'crash', 'balloon', 'zeppelin', 'rocket', 'x multiplier'];
      const crashProviders = ['spribe', 'bgaming', 'smartsoft', 'turbo games', 'evoplay', 'gaming corps'];
      
      return crashKeywords.some(keyword => gameName.includes(keyword)) ||
             crashProviders.some(provider => gameProvider.includes(provider));
    });
    
    const providerCounts = new Map<string, number>();
    crashGames.forEach((game: SlotegratorGame) => {
      if (game.provider) {
        providerCounts.set(game.provider, (providerCounts.get(game.provider) || 0) + 1);
      }
    });
    
    return Array.from(providerCounts.entries())
      .sort(([,a], [,b]) => b - a)
      .map(([provider]) => provider);
  }, [games]);

  // Crash Games Filtreleme
  const filteredGames = useMemo(() => {
    if (!games || !Array.isArray(games)) return [];
    
    // Öncelikle sadece crash oyunlarını filtrele
    let filtered = games.filter((game: SlotegratorGame) => {
      const gameName = game.name.toLowerCase();
      const gameProvider = game.provider.toLowerCase();
      
      // Crash oyunu tanımlayıcıları
      const crashKeywords = ['aviator', 'jetx', 'spaceman', 'mines', 'plinko', 'crash', 'balloon', 'zeppelin', 'rocket', 'x multiplier'];
      const crashProviders = ['spribe', 'bgaming', 'smartsoft', 'turbo games', 'evoplay', 'gaming corps'];
      
      return crashKeywords.some(keyword => gameName.includes(keyword)) ||
             crashProviders.some(provider => gameProvider.includes(provider));
    });
    
    // Kategori filtresi
    if (gameCategory !== 'all') {
      filtered = filtered.filter((game: SlotegratorGame) => {
        const gameName = game.name.toLowerCase();
        switch (gameCategory) {
          case 'aviator':
            return gameName.includes('aviator') || gameName.includes('plane');
          case 'mines':
            return gameName.includes('mines') || gameName.includes('bomb');
          case 'plinko':
            return gameName.includes('plinko') || gameName.includes('drop');
          case 'crash':
            return gameName.includes('crash') || gameName.includes('rocket') || gameName.includes('jet');
          case 'balloon':
            return gameName.includes('balloon') || gameName.includes('zeppelin');
          default:
            return true;
        }
      });
    }
    
    // Sağlayıcı filtresi
    if (selectedProvider !== 'all') {
      filtered = filtered.filter((game: SlotegratorGame) => 
        game.provider === selectedProvider
      );
    }
    
    // Arama filtresi
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter((game: SlotegratorGame) =>
        game.name.toLowerCase().includes(search) ||
        game.provider?.toLowerCase().includes(search)
      );
    }
    
    // Sıralama
    filtered.sort((a: SlotegratorGame, b: SlotegratorGame) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'provider':
          return (a.provider || '').localeCompare(b.provider || '');
        case 'popular':
          return ((b as any).popularity || 0) - ((a as any).popularity || 0);
        case 'newest':
          return new Date((b as any).created_at || 0).getTime() - new Date((a as any).created_at || 0).getTime();
        default:
          return 0;
      }
    });
    
    return filtered;
  }, [games, gameCategory, selectedProvider, searchTerm, sortBy]);

  // Sayfalama
  const totalPages = Math.ceil(filteredGames.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const currentGames = filteredGames.slice(startIndex, startIndex + perPage);

  // Favorilere ekleme/çıkarma
  const toggleFavorite = (gameUuid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.includes(gameUuid)
      ? favorites.filter(id => id !== gameUuid)
      : [...favorites, gameUuid];
    setFavorites(updated);
    localStorage.setItem('games-favorites', JSON.stringify(updated));
  };

  // Oyun tıklama
  const handleGameClick = (game: SlotegratorGame) => {
    // Recently viewed'a ekle
    const updated = [game.uuid, ...recentlyViewed.filter(id => id !== game.uuid)].slice(0, 10);
    setRecentlyViewed(updated);
    localStorage.setItem('games-recently-viewed', JSON.stringify(updated));
    
    // Oyunu başlat
    console.log('Starting crash game:', game.name);
  };

  // Provider ikonu
  const getProviderIcon = (provider: string) => {
    switch (provider.toLowerCase()) {
      case 'spribe': return '🚀';
      case 'bgaming': return '⚡';
      case 'smartsoft': return '💎';
      case 'turbo games': return '🎯';
      case 'evoplay': return '🎮';
      default: return '🎲';
    }
  };

  // Game Card Component
  const GameCard = ({ game }: { game: SlotegratorGame }) => (
    <div 
      className="group relative bg-gray-800/50 backdrop-blur-sm rounded-xl overflow-hidden border border-gray-700/50 hover:border-yellow-500/50 transition-all duration-300 cursor-pointer hover:transform hover:scale-105"
      onClick={() => handleGameClick(game)}
    >
      <div className="aspect-[4/3] bg-gradient-to-br from-yellow-600/20 to-orange-600/20 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20" />
        
        {/* CRASH Badge */}
        <div className="absolute top-2 left-2 z-10">
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold animate-pulse">
            <Rocket className="w-3 h-3 inline mr-1" />
            CRASH
          </div>
        </div>

        {/* Favorite Button */}
        <button
          onClick={(e) => toggleFavorite(game.uuid, e)}
          className="absolute top-2 right-2 z-10 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-gray-300 hover:text-yellow-400 transition-colors"
        >
          {favorites.includes(game.uuid) ? '❤️' : '🤍'}
        </button>

        {/* Provider Icon */}
        <div className="absolute bottom-2 left-2 text-2xl">
          {getProviderIcon(game.provider)}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-white font-semibold text-sm group-hover:text-yellow-400 transition-colors truncate">
            {game.name}
          </h3>
        </div>
        
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span className="truncate">{game.provider}</span>
          <div className="flex items-center space-x-1">
            <TrendingUp className="w-3 h-3" />
            <span>HOT</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-900">
        {/* Header Banner */}
        <BannerDisplay type="header" pageLocation="games" className="mb-6" />
        
        {/* Slider Banner */}
        <div className="w-full mb-8">
          <BannerDisplay type="slider" pageLocation="games" className="mb-6" />
        </div>

        {/* Hero Section */}
        <div className="relative">
          <div 
            className="h-64 md:h-80 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url("https://images.unsplash.com/photo-1518611012118-696072aa579a?w=1920&h=1080&fit=crop")'
            }}
          >
            <div className="container mx-auto px-4 h-full flex items-center">
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  {translate('games.title', 'Crash Oyunları')}
                </h1>
                <p className="text-xl text-gray-300 mb-6">
                  {translate('games.subtitle', 'Adrenalin dolu crash oyunları ile kazancınızı katlayın')}
                </p>
                <div className="flex flex-wrap gap-4 text-yellow-400">
                  <div className="flex items-center">
                    <Rocket className="w-5 h-5 mr-2" />
                    <span>{translate('games.instantPlay', 'Anında Oyna')}</span>
                  </div>
                  <div className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2" />
                    <span>{translate('games.highMultiplier', 'Yüksek Çarpanlar')}</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-5 h-5 mr-2" />
                    <span>{translate('games.fastPaced', 'Hızlı Oyun')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Provider Filters - Horizontal Scrollable */}
          <div className="mb-8">
            <div className="relative">
              <div className="flex overflow-x-auto scrollbar-hide space-x-3 pb-4">
                <div className="flex space-x-3" style={{ minWidth: 'max-content' }}>
                  {/* Tüm Sağlayıcılar Button */}
                  <button
                    onClick={() => setSelectedProvider('all')}
                    className={`flex-shrink-0 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                      selectedProvider === 'all'
                        ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg'
                        : 'bg-gray-800/50 text-gray-300 border border-gray-600 hover:border-yellow-500/50'
                    }`}
                  >
                    Tüm Sağlayıcılar ({filteredGames.length})
                  </button>
                  
                  {/* Provider buttons */}
                  {uniqueProviders.map((provider: string) => {
                    const providerGameCount = filteredGames.filter((g: any) => g.provider === provider).length;
                    
                    return (
                      <button
                        key={provider}
                        onClick={() => setSelectedProvider(provider)}
                        className={`flex-shrink-0 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                          selectedProvider === provider
                            ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-black shadow-lg'
                            : 'bg-gray-800/50 text-gray-300 border border-gray-600 hover:border-yellow-500/50'
                        }`}
                      >
                        <span className="mr-2">{getProviderIcon(provider)}</span>
                        {provider} ({providerGameCount})
                      </button>
                    );
                  })}
                </div>
              </div>
              
              {/* Gradient fade effects */}
              <div className="absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-gray-900 to-transparent pointer-events-none" />
              <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none" />
            </div>
          </div>

          {/* Category Filters */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-3">
              {[
                { key: 'all', label: 'Tümü', icon: '🎲' },
                { key: 'aviator', label: 'Aviator', icon: '✈️' },
                { key: 'mines', label: 'Mines', icon: '💣' },
                { key: 'plinko', label: 'Plinko', icon: '⚪' },
                { key: 'crash', label: 'Crash', icon: '🚀' },
                { key: 'balloon', label: 'Balloon', icon: '🎈' }
              ].map(category => (
                <button
                  key={category.key}
                  onClick={() => setGameCategory(category.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                    gameCategory === category.key
                      ? 'bg-yellow-500 text-black'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span className="mr-2">{category.icon}</span>
                  {category.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search and Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={translate('games.searchPlaceholder', 'Crash oyunu ara...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg focus:ring-2 focus:ring-yellow-500"
              >
                <option value="popular">{translate('games.sort.popular', 'En Popüler')}</option>
                <option value="name">{translate('games.sort.name', 'A-Z')}</option>
                <option value="provider">{translate('games.sort.provider', 'Sağlayıcı')}</option>
                <option value="newest">{translate('games.sort.newest', 'En Yeni')}</option>
              </select>

              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-3 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-3 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="text-gray-400 text-sm flex items-center">
              {translate('games.showingResults', 'Crash Oyunları')}: {Math.min(perPage, filteredGames.length)} / {filteredGames.length}
            </div>
          </div>

          {/* Games Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner />
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🚀</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {translate('games.noGamesFound', 'Crash oyunu bulunamadı')}
              </h3>
              <p className="text-gray-400">
                {translate('games.tryDifferentFilter', 'Farklı filtre seçenekleri deneyin')}
              </p>
            </div>
          ) : (
            <>
              <div className={`grid gap-4 ${
                viewMode === 'grid' 
                  ? 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6'
                  : 'grid-cols-1'
                }`}>
                  {currentGames.map((game: SlotegratorGame) => (
                    <GameCard
                      key={game.uuid}
                      game={game}
                    />
                  ))}
                </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                  >
                    Önceki
                  </button>
                  
                  <span className="text-gray-400">
                    Sayfa {currentPage} / {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 bg-gray-800 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                  >
                    Sonraki
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
}