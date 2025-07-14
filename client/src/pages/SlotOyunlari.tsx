import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import MainLayout from "@/components/layout/MainLayout";
import { useLanguage } from "@/contexts/LanguageContext";
import { translate } from '@/utils/i18n-fixed';
import { useDeviceDetection } from "@/hooks/useDeviceDetection";

interface SlotGame {
  uuid: string;
  name: string;
  identifier: string;
  producer: string;
  type: string;
  platform: string[];
  volatility?: string;
  rtp?: number;
  technology: string;
  demo: boolean;
  freespins: boolean;
  bonus_buy: boolean;
  collections: string[];
  lines?: number;
  ways?: number;
  multiplier?: number;
  image?: string;
  thumb?: string;
  background?: string;
  has_lobby?: boolean;
  lobby_url?: string;
  game_options?: any;
  restrictions?: any;
  cats?: string[];
  tags?: string[];
  last_update?: string;
  released?: string;
  hbanners?: any;
  vbanners?: any;
  show_as_provider?: boolean;
  provider_title?: string;
  jackpots?: any;
  tournaments?: any;
  payout_percent?: number;
  game_sub_type?: string;
  is_mobile?: boolean;
}

const SlotOyunlari: React.FC = () => {
  const { t } = useLanguage();
  const { isMobile } = useDeviceDetection();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [currentPage, setCurrentPage] = useState(1);
  const gamesPerPage = 20;

  // Slot oyunlarını API'den çekiyoruz
  const { data: slotGames = [], isLoading, error } = useQuery<SlotGame[]>({
    queryKey: ['/api/fast-slots'],
    select: (data: any) => {
      // API yanıtından oyunları çıkar
      return data?.items || [];
    }
  });

  // Providers listesini slot oyunlarından çıkar
  const providers = useMemo(() => {
    const uniqueProviders = [...new Set(slotGames.map(game => game.producer))].filter(Boolean);
    return uniqueProviders.sort();
  }, [slotGames]);

  // Filtrelenmiş oyunlar
  const filteredGames = useMemo(() => {
    let filtered = slotGames;

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(game => 
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.producer.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Provider filtresi
    if (selectedProvider) {
      filtered = filtered.filter(game => game.producer === selectedProvider);
    }

    // Mobil cihazda mobil uyumlu oyunları öncelikle göster
    if (isMobile) {
      filtered = filtered.filter(game => 
        game.platform?.includes('mobile') || 
        game.platform?.includes('all') ||
        game.is_mobile === true
      );
    }

    // Sıralama
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'provider':
          return a.producer.localeCompare(b.producer);
        case 'rtp':
          return (b.rtp || 0) - (a.rtp || 0);
        case 'released':
          return new Date(b.released || 0).getTime() - new Date(a.released || 0).getTime();
        default:
          return 0;
      }
    });

    return filtered;
  }, [slotGames, searchTerm, selectedProvider, sortBy, isMobile]);

  // Sayfalama
  const totalPages = Math.ceil(filteredGames.length / gamesPerPage);
  const currentGames = filteredGames.slice(
    (currentPage - 1) * gamesPerPage,
    currentPage * gamesPerPage
  );

  const handleGameClick = (game: SlotGame) => {
    // Oyun detay sayfasına yönlendir veya modal aç
    console.log('Oyun seçildi:', game);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FFD700] mx-auto mb-4"></div>
            <p className="text-white">{translate('slots.loading')}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{translate('slots.error')}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-[#FFD700] text-black rounded hover:bg-yellow-500"
            >
              {translate('slots.tryAgain')}
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-[#0a0a0a] to-[#1a1a1a] py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Başlık */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              🎰 {translate('slots.title')}
            </h1>
            <p className="text-gray-400">
              {filteredGames.length} {translate('common.games')}
            </p>
          </div>

          {/* Filtreler */}
          <div className="bg-[#111] rounded-lg p-6 mb-8 border border-[#333]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Arama */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {translate('common.search')}
                </label>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={translate('slots.searchPlaceholder')}
                  className="w-full px-3 py-2 bg-[#222] border border-[#444] rounded-md text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700]"
                />
              </div>

              {/* Provider */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {translate('common.provider')}
                </label>
                <select
                  value={selectedProvider}
                  onChange={(e) => setSelectedProvider(e.target.value)}
                  className="w-full px-3 py-2 bg-[#222] border border-[#444] rounded-md text-white focus:outline-none focus:border-[#FFD700]"
                >
                  <option value="">{translate('slots.allProviders')}</option>
                  {providers.map(provider => (
                    <option key={provider} value={provider}>{provider}</option>
                  ))}
                </select>
              </div>

              {/* Sıralama */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  {translate('slots.sortBy')}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 bg-[#222] border border-[#444] rounded-md text-white focus:outline-none focus:border-[#FFD700]"
                >
                  <option value="name">{translate('slots.sortByName')}</option>
                  <option value="provider">{translate('slots.sortByProvider')}</option>
                  <option value="rtp">{translate('slots.sortByRtp')}</option>
                  <option value="released">{translate('slots.sortByDate')}</option>
                </select>
              </div>

              {/* Temizle */}
              <div className="flex items-end">
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedProvider("");
                    setSortBy("name");
                    setCurrentPage(1);
                  }}
                  className="w-full px-4 py-2 bg-[#333] hover:bg-[#444] text-white rounded-md transition-colors"
                >
                  {translate('slots.clearFilters')}
                </button>
              </div>
            </div>
          </div>

          {/* Oyun Listesi */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
            {currentGames.map((game) => (
              <div
                key={game.uuid}
                onClick={() => handleGameClick(game)}
                className="group relative cursor-pointer transform transition-all duration-300 hover:scale-105"
              >
                <div className="relative overflow-hidden rounded-lg border border-[#333] group-hover:border-[#FFD700] shadow-lg aspect-[3/4]">
                  {/* Parlama efekti */}
                  <div className="absolute -inset-0.5 bg-[#FFD700] opacity-0 blur group-hover:opacity-20 transition-opacity duration-300 rounded-lg"></div>
                  
                  {/* Oyun görseli */}
                  <img
                    src={game.thumb || game.image || '/api/placeholder/300/400'}
                    alt={game.name}
                    className="w-full h-full object-cover rounded-lg"
                    loading="lazy"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/api/placeholder/300/400';
                    }}
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <h3 className="text-white text-sm font-medium mb-1 line-clamp-2">
                        {game.name}
                      </h3>
                      <p className="text-[#FFD700] text-xs mb-2">{game.producer}</p>
                      
                      {/* RTP ve diğer bilgiler */}
                      <div className="flex justify-between items-center text-xs text-gray-300">
                        {game.rtp && <span>RTP: {game.rtp}%</span>}
                        {game.volatility && <span>{game.volatility}</span>}
                      </div>
                      
                      <button className="w-full mt-2 py-1 bg-[#FFD700] text-black text-xs font-bold rounded hover:bg-yellow-500 transition-colors">
                        {translate('common.play')}
                      </button>
                    </div>
                  </div>

                  {/* Demo badge */}
                  {game.demo && (
                    <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      {translate('common.demo')}
                    </div>
                  )}

                  {/* Bonus buy badge */}
                  {game.bonus_buy && (
                    <div className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 rounded">
                      {translate('common.bonus')}
                    </div>
                  )}
                </div>
                
                {/* Oyun bilgileri (mobilde her zaman görünür) */}
                <div className="mt-2 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
                  <h3 className="text-white text-sm font-medium line-clamp-1">{game.name}</h3>
                  <p className="text-[#FFD700] text-xs">{game.producer}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Sayfalama */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-[#333] hover:bg-[#444] disabled:bg-[#222] disabled:text-gray-500 text-white rounded-md transition-colors"
              >
{translate('common.previous', 'Önceki')}
              </button>
              
              <div className="flex space-x-1">
                {[...Array(Math.min(5, totalPages))].map((_, i) => {
                  const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-2 rounded-md transition-colors ${
                        currentPage === pageNum
                          ? 'bg-[#FFD700] text-black'
                          : 'bg-[#333] hover:bg-[#444] text-white'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-[#333] hover:bg-[#444] disabled:bg-[#222] disabled:text-gray-500 text-white rounded-md transition-colors"
              >
{translate('common.next', 'Sonraki')}
              </button>
            </div>
          )}

          {/* Sonuç bulunamadı */}
          {filteredGames.length === 0 && !isLoading && (
            <div className="text-center py-12">
              <p className="text-gray-400 text-lg">{translate('common.noResults', 'Aradığınız kriterlere uygun oyun bulunamadı.')}</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedProvider("");
                  setCurrentPage(1);
                }}
                className="mt-4 px-6 py-2 bg-[#FFD700] text-black rounded-md hover:bg-yellow-500 transition-colors"
              >
{translate('slots.clearFilters')}
              </button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SlotOyunlari;