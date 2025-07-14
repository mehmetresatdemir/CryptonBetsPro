import { useState, useEffect, useMemo } from 'react';
import { Search, Grid3X3, List, Filter, SortAsc, Heart, Star, Trophy, Dices, Target, Crown, Users, Gamepad2, Eye, Clock, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '../components/layout/MainLayout';
import BannerDisplay from '../components/BannerDisplay';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { translate } from '../utils/i18n-fixed';
import { SlotegratorGame } from '@/types/slotegrator';
import GameCard from '../components/games/GameCard';

// Import görsel - varsayılan image kullanıyoruz
const casinoHeroImage = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxsaW5lYXJHcmFkaWVudCBpZD0iZ3JhZGllbnQiIHgxPSIwJSIgeTE9IjAlIiB4Mj0iMTAwJSIgeTI9IjEwMCUiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRkZENzAwO3N0b3Atb3BhY2l0eToxIiAvPgogICAgICA8c3RvcCBvZmZzZXQ9IjUwJSIgc3R5bGU9InN0b3AtY29sb3I6I0ZGOUYwMDtzdG9wLW9wYWNpdHk6MSIgLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdHlsZT0ic3RvcC1jb2xvcjojRkY2QzAwO3N0b3Atb3BhY2l0eToxIiAvPgogICAgPC9saW5lYXJHcmFkaWVudD4KICA8L2RlZnM+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmFkaWVudCkiLz4KICA8dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjQ4IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkNBU0lOTzwvdGV4dD4KPC9zdmc+';

export default function CasinoPageFixed() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [gameCategory, setGameCategory] = useState<'all' | 'live' | 'table' | 'roulette' | 'blackjack' | 'baccarat' | 'poker'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'popular' | 'name' | 'provider' | 'newest'>('popular');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedGame, setSelectedGame] = useState<SlotegratorGame | null>(null);
  const [perPage] = useState(24);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<string[]>([]);
  
  // Provider gösterimi için state
  // Removed showAllProviders state since we're using scrollable layout

  // Canlı Casino oyunları yükleme - Slotegrator API'dan
  const { data: games = [], isLoading, error } = useQuery({
    queryKey: ['/api/slotegrator/games/casino'],
    queryFn: async () => {
      const response = await fetch('/api/slotegrator/games/slots');
      if (!response.ok) throw new Error('Casino oyunları yüklenemedi');
      const data = await response.json();
      return data.games || [];
    }
  });

  // Favorites ve recent viewed localStorage'dan yükle
  useEffect(() => {
    const savedFavorites = localStorage.getItem('casino-favorites');
    const savedRecentlyViewed = localStorage.getItem('casino-recently-viewed');
    
    if (savedFavorites) {
      setFavorites(JSON.parse(savedFavorites));
    }
    
    if (savedRecentlyViewed) {
      setRecentlyViewed(JSON.parse(savedRecentlyViewed));
    }
  }, []);

  // Tüm sağlayıcıları kaldır - boş array döndür
  const uniqueProviders = useMemo(() => {
    return [];
  }, []);

  // Tüm oyunları kaldır - boş array döndür
  const filteredGames = useMemo(() => {
    return [];
  }, []);

  // Sayfalama
  const totalPages = Math.ceil(filteredGames.length / perPage);
  const startIndex = (currentPage - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentGames = filteredGames.slice(startIndex, endIndex);

  // Oyun açma fonksiyonu
  const handleGameClick = (game: SlotegratorGame) => {
    setSelectedGame(game);
    
    // Recently viewed'a ekle
    const updated = [game.uuid, ...recentlyViewed.filter(id => id !== game.uuid)].slice(0, 10);
    setRecentlyViewed(updated);
    localStorage.setItem('casino-recently-viewed', JSON.stringify(updated));
  };

  // Favorilere ekleme/çıkarma
  const toggleFavorite = (gameUuid: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = favorites.includes(gameUuid)
      ? favorites.filter(id => id !== gameUuid)
      : [...favorites, gameUuid];
    setFavorites(updated);
    localStorage.setItem('casino-favorites', JSON.stringify(updated));
  };

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-900">
        {/* Header Banner */}
        <BannerDisplay type="header" pageLocation="casino" className="mb-6" />
        
        {/* Slider Banner */}
        <div className="w-full mb-8">
          <BannerDisplay type="slider" pageLocation="casino" className="mb-6" />
        </div>

        {/* Hero Section */}
        <div className="relative">
          <div 
            className="h-64 md:h-80 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.8)), url(${casinoHeroImage})`
            }}
          >
            <div className="container mx-auto px-4 h-full flex items-center">
              <div className="text-center md:text-left">
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  {translate('casino.title', 'Casino - Yakında Açılıyor')}
                </h1>
                <p className="text-xl text-gray-300 mb-6">
                  {translate('casino.subtitle', 'Casino oyunları bakım çalışmaları nedeniyle geçici olarak kapatılmıştır')}
                </p>
                <div className="flex flex-wrap gap-4 text-yellow-400">
                  <div className="flex items-center">
                    <Users className="w-5 h-5 mr-2" />
                    <span>{translate('casino.liveDealers', 'Canlı Krupiyeler')}</span>
                  </div>
                  <div className="flex items-center">
                    <Trophy className="w-5 h-5 mr-2" />
                    <span>{translate('casino.professionalTables', 'Profesyonel Masalar')}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 mr-2" />
                    <span>{translate('casino.available247', '7/24 Açık')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>



        {/* Provider Filter Area */}
        {!isLoading && uniqueProviders.length > 0 && (
          <div className="bg-gradient-to-r from-black via-yellow-900/10 to-black border-b border-yellow-500/20 py-3">
            <div className="container mx-auto px-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-yellow-400 text-sm font-medium">{translate('filters.providers', 'Sağlayıcılar')} ({uniqueProviders.length}):</span>
                <span className="text-xs text-gray-400">{translate('filters.scroll_hint', 'Kaydırarak tüm sağlayıcıları görün')}</span>
              </div>
              
              {/* Provider Listesi - Tek Satır Kaydırılabilir */}
              <div className="relative">
                {/* Kaydırılabilir Provider Container */}
                <div className="relative overflow-hidden">
                  {/* Sol gradient fade */}
                  <div className="absolute left-0 top-0 w-6 h-full bg-gradient-to-r from-black to-transparent z-10 pointer-events-none"></div>
                  
                  {/* Sağ gradient fade */}
                  <div className="absolute right-0 top-0 w-6 h-full bg-gradient-to-l from-black to-transparent z-10 pointer-events-none"></div>
                  
                  {/* Horizontal scrollable provider list */}
                  <div className="flex gap-2 overflow-x-auto py-1 scrollbar-none" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                    {/* Tüm Sağlayıcılar butonu */}
                    <button
                      onClick={() => setSelectedProvider('all')}
                      className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-full border transition-all duration-200 whitespace-nowrap ${
                        selectedProvider === 'all'
                          ? 'bg-yellow-500 text-black border-yellow-400 font-semibold'
                          : 'bg-gray-800/50 text-gray-300 border-gray-600 hover:bg-yellow-500/20 hover:border-yellow-500/40 hover:text-yellow-300'
                      }`}
                    >
                      Tüm Sağlayıcılar
                    </button>
                    
                    {/* Provider buttons */}
                    {uniqueProviders.map((provider: string) => {
                      const providerGameCount = filteredGames.filter((g: any) => g.provider === provider).length;
                      
                      return (
                        <button
                          key={provider}
                          onClick={() => setSelectedProvider(selectedProvider === provider ? 'all' : provider)}
                          className={`flex-shrink-0 px-3 py-1.5 text-xs rounded-full border transition-all duration-200 whitespace-nowrap ${
                            selectedProvider === provider
                              ? 'bg-yellow-500 text-black border-yellow-400 font-semibold'
                              : 'bg-gray-800/50 text-gray-300 border-gray-600 hover:bg-yellow-500/20 hover:border-yellow-500/40 hover:text-yellow-300'
                          }`}
                        >
                          {provider} ({providerGameCount})
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="container mx-auto px-4 py-8">
          {/* Search and Filters */}
          <div className="mb-8">
            {/* Search Bar */}
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-400 w-5 h-5" />
              <input
                type="text"
                placeholder={translate('casino.searchPlaceholder', 'Casino oyunu ara...')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900/50 border border-yellow-500/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition-all"
              />
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2 mb-6">
              {[
                { key: 'all', label: translate('casino.categories.all', 'Tümü'), icon: Search },
                { key: 'live', label: translate('casino.categories.live', 'Canlı'), icon: Users },
                { key: 'table', label: translate('casino.categories.table', 'Masa Oyunları'), icon: Trophy },
                { key: 'roulette', label: translate('casino.categories.roulette', 'Rulet'), icon: Clock },
                { key: 'blackjack', label: translate('casino.categories.blackjack', 'Blackjack'), icon: Users },
                { key: 'baccarat', label: translate('casino.categories.baccarat', 'Bakara'), icon: ChevronRight },
                { key: 'poker', label: translate('casino.categories.poker', 'Poker'), icon: Trophy }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setGameCategory(key as any)}
                  className={`flex items-center px-4 py-2 rounded-full border transition-all duration-200 ${
                    gameCategory === key
                      ? 'bg-yellow-500 text-black border-yellow-400 font-semibold'
                      : 'bg-gray-900/50 text-gray-300 border-gray-600 hover:bg-yellow-500/20 hover:border-yellow-500/40 hover:text-yellow-300'
                  }`}
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {label}
                </button>
              ))}
            </div>

            {/* Advanced Controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {/* View Mode Toggle */}
                <div className="flex border border-gray-600 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 transition-colors ${
                      viewMode === 'grid' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 transition-colors ${
                      viewMode === 'list' ? 'bg-yellow-500 text-black' : 'bg-gray-800 text-gray-400 hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort Options */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-gray-900 border border-gray-600 text-white px-3 py-2 rounded-lg focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="popular">{translate('casino.sort.popular', 'En Popüler')}</option>
                  <option value="name">{translate('casino.sort.name', 'A-Z')}</option>
                  <option value="provider">{translate('casino.sort.provider', 'Sağlayıcı')}</option>
                  <option value="newest">{translate('casino.sort.newest', 'En Yeni Masalar')}</option>
                </select>
              </div>

              <div className="text-gray-400 text-sm">
                {translate('casino.showingResults', 'Canlı Masalar')}: {Math.min(perPage, filteredGames.length)} / {filteredGames.length}
              </div>
            </div>
          </div>

          {/* Games Grid */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <LoadingSpinner />
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-xl font-semibold text-white mb-2">
                {translate('casino.noGamesFound', 'Casino Oyunları Geçici Olarak Kapatıldı')}
              </h3>
              <p className="text-gray-400">
                {translate('casino.tryDifferentFilter', 'Bakım çalışmaları tamamlandıktan sonra oyunlar yeniden aktif olacaktır')}
              </p>
              <div className="mt-8">
                <p className="text-yellow-400 font-semibold">
                  Slot oyunları için /slot sayfasını ziyaret edebilirsiniz
                </p>
              </div>
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
                      onClick={() => handleGameClick(game)}
                    />
                  ))}
                </div>
            </>
          )}

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                {translate('pagination.previous', 'Önceki')}
              </button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-2 rounded-lg transition-colors ${
                        currentPage === page
                          ? 'bg-yellow-500 text-black font-semibold'
                          : 'bg-gray-800 border border-gray-600 text-white hover:bg-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
              >
                {translate('pagination.next', 'Sonraki')}
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Banner */}
        <BannerDisplay type="sidebar" pageLocation="casino" className="fixed right-4 top-1/2 transform -translate-y-1/2 z-40" />
      </div>
    </MainLayout>
  );
}