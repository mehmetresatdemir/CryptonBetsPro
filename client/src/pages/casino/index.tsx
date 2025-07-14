import React, { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import BannerDisplay from '@/components/BannerDisplay';
import { useLanguage } from '@/contexts/LanguageContext';
import { SlotegratorGame } from '@/types/slotegrator';
import { getCasinoGames, getAllProviders } from '@/services/slotegratorService';
import { Spinner } from '@/components/shared/Spinner';
import { Play, Filter, Search, Star, Zap, Trophy, DollarSign } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import GameModal from '@/components/games/GameModal';

// Game types for casino
type CasinoGameType = 'all' | 'table' | 'roulette' | 'blackjack' | 'baccarat' | 'poker' | 'bingo' | 'lottery';

const CasinoPage: React.FC = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [location] = useLocation();
  
  // State management
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedGameType, setSelectedGameType] = useState<CasinoGameType>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedGame, setSelectedGame] = useState<SlotegratorGame | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  const perPage = 32;

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fetch casino games
  const { data: gamesData, isLoading: gamesLoading, error: gamesError } = useQuery({
    queryKey: ['casino-games', currentPage, selectedProvider, selectedGameType, searchTerm, isMobile],
    queryFn: () => getCasinoGames(
      currentPage, 
      perPage, 
      selectedProvider === 'all' ? undefined : selectedProvider,
      isMobile
    )
  });

  // Fetch providers
  const { data: providersData } = useQuery({
    queryKey: ['providers'],
    queryFn: getAllProviders
  });

  // Game type options for casino
  const gameTypeOptions = [
    { value: 'all', label: t('casino.all_games'), icon: Trophy },
    { value: 'table', label: t('casino.table_games'), icon: DollarSign },
    { value: 'roulette', label: t('casino.roulette'), icon: Zap },
    { value: 'blackjack', label: t('casino.blackjack'), icon: Star },
    { value: 'baccarat', label: t('casino.baccarat'), icon: Trophy },
    { value: 'poker', label: t('casino.poker'), icon: DollarSign },
    { value: 'bingo', label: t('casino.bingo'), icon: Zap },
    { value: 'lottery', label: t('casino.lottery'), icon: Star }
  ];

  // Filter games by type and search
  const filteredGames = React.useMemo(() => {
    const games = gamesData?.games || gamesData?.items || [];
    if (!games.length) return [];
    
    let filtered = [...games];

    // Filter by game type
    if (selectedGameType !== 'all') {
      filtered = filtered.filter(game => {
        const gameType = (game.type || '').toLowerCase();
        switch (selectedGameType) {
          case 'table': return gameType.includes('table') || gameType.includes('card');
          case 'roulette': return gameType.includes('roulette');
          case 'blackjack': return gameType.includes('blackjack') || gameType.includes('21');
          case 'baccarat': return gameType.includes('baccarat');
          case 'poker': return gameType.includes('poker');
          case 'bingo': return gameType.includes('bingo');
          case 'lottery': return gameType.includes('lottery') || gameType.includes('keno');
          default: return true;
        }
      });
    }

    // Filter by search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(game =>
        game.name?.toLowerCase().includes(search) ||
        game.provider?.toLowerCase().includes(search)
      );
    }

    return filtered;
  }, [gamesData?.games, gamesData?.items, selectedGameType, searchTerm]);

  const totalPages = Math.ceil((gamesData?.totalCount || gamesData?.total || 0) / perPage);

  const handleGameSelect = (game: SlotegratorGame) => {
    setSelectedGame(game);
  };

  const handleProviderSelect = (provider: string) => {
    setSelectedProvider(provider);
    setCurrentPage(1);
  };

  const handleGameTypeSelect = (type: CasinoGameType) => {
    setSelectedGameType(type);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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

        <div className="container mx-auto px-4 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              {t('casino.title')}
            </h1>
            <p className="text-gray-400 text-lg">
              {t('casino.description')}
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-8 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder={t('casino.search_games')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle Button (Mobile) */}
            <div className="md:hidden">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white hover:bg-gray-700 transition-colors"
              >
                <Filter className="w-4 h-4" />
                <span>{t('common.filters')}</span>
              </button>
            </div>

            {/* Filters */}
            <div className={`${showFilters || !isMobile ? 'block' : 'hidden'} space-y-4`}>
              {/* Game Type Filter */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">{t('casino.game_types')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-2">
                  {gameTypeOptions.map(({ value, label, icon: Icon }) => (
                    <button
                      key={value}
                      onClick={() => handleGameTypeSelect(value as CasinoGameType)}
                      className={`flex flex-col items-center p-3 rounded-lg border transition-all ${
                        selectedGameType === value
                          ? 'bg-yellow-600 border-yellow-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      <span className="text-xs font-medium text-center">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Provider Filter */}
              {providersData && providersData.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">{t('casino.providers')}</h3>
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleProviderSelect('all')}
                      className={`px-4 py-2 rounded-full border transition-colors ${
                        selectedProvider === 'all'
                          ? 'bg-yellow-600 border-yellow-500 text-white'
                          : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {t('common.all')}
                    </button>
                    {providersData.slice(0, 10).map((provider) => (
                      <button
                        key={provider}
                        onClick={() => handleProviderSelect(provider)}
                        className={`px-4 py-2 rounded-full border transition-colors ${
                          selectedProvider === provider
                            ? 'bg-yellow-600 border-yellow-500 text-white'
                            : 'bg-gray-800 border-gray-700 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {provider}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Games Grid */}
          {gamesLoading ? (
            <div className="flex justify-center items-center py-20">
              <Spinner />
            </div>
          ) : gamesError ? (
            <div className="text-center py-20">
              <div className="text-red-400 mb-4">
                {t('casino.loading_error')}
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                {t('common.retry')}
              </button>
            </div>
          ) : filteredGames.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">
                {t('casino.no_games_found')}
              </div>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedGameType('all');
                  setSelectedProvider('all');
                }}
                className="px-6 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                {t('common.clear_filters')}
              </button>
            </div>
          ) : (
            <>
              {/* Games Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 mb-8">
                {filteredGames.map((game) => (
                  <div
                    key={game.uuid}
                    onClick={() => handleGameSelect(game)}
                    className="group relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700 hover:border-yellow-500 transition-all duration-300 cursor-pointer hover:scale-105"
                  >
                    {/* Game Image */}
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img
                        src={game.image || '/images/placeholder-casino.jpg'}
                        alt={game.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        loading="lazy"
                      />
                      
                      {/* Play Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <div className="bg-yellow-600 rounded-full p-3">
                          <Play className="w-6 h-6 text-white fill-current" />
                        </div>
                      </div>

                      {/* Live Dealer Badge */}
                      {game.type?.toLowerCase().includes('live') && (
                        <div className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                          LIVE
                        </div>
                      )}

                      {/* Featured Badge */}
                      {game.featured && (
                        <div className="absolute top-2 right-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded-full font-bold">
                          <Star className="w-3 h-3 fill-current" />
                        </div>
                      )}
                    </div>

                    {/* Game Info */}
                    <div className="p-3">
                      <h3 className="font-semibold text-white text-sm truncate group-hover:text-yellow-400 transition-colors">
                        {game.name}
                      </h3>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-gray-400 text-xs">
                          {game.provider}
                        </span>
                        {game.type?.toLowerCase().includes('live') && (
                          <span className="text-red-400 text-xs font-bold">
                            LIVE
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination - Simplified like slot page */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-8">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-700 transition-colors"
                  >
                    {t('common.previous')}
                  </button>
                  
                  <span className="text-white">
                    {t('common.page')} {currentPage} / {totalPages}
                  </span>

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-6 py-2 bg-yellow-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-700 transition-colors"
                  >
                    {t('common.next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Sidebar Banner */}
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-10">
          <BannerDisplay type="sidebar" pageLocation="casino" />
        </div>

        {/* Game Modal */}
        {selectedGame && (
          <GameModal
            game={selectedGame}
            isOpen={!!selectedGame}
            onClose={() => setSelectedGame(null)}
          />
        )}
      </div>
    </MainLayout>
  );
};

export default CasinoPage;