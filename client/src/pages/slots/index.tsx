import React, { useState, useEffect } from 'react';
import { useLocation, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { SlotegratorGame } from '@/types/slotegrator';
import ProviderFilter from '@/components/games/ProviderFilter';
import GameTypeFilter, { GameType } from '@/components/games/GameTypeFilter';
import GameGrid from '@/components/games/GameGrid';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import SmartGameProvider from '@/components/games/SmartGameProvider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LucideFlame, LucideTrophy, LucideBadgePercent, LucideZap, LucideHistory, LucideSearch, LucideChevronDown, LucideFilter } from 'lucide-react';
import ZeusBannerImage from '@assets/Nora_WP_A_hyper-realistic,_cinematic_artwork_of_Zeus_inspi_e353cf82-be2e-4377-82b2-c9f8a8b3a329.png';

const SlotsPage: React.FC = () => {
  const { t, language } = useLanguage();
  const [location] = useLocation();
  const { deviceType, isMobile } = useDeviceDetection();
  
  // State'ler
  const [selectedGameType, setSelectedGameType] = useState<GameType>(GameType.ALL);
  const [activeTab, setActiveTab] = useState("popular");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  
  // URL'den oyun UUID'sini al
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  const gameUuid = searchParams.get('game');
  
  // Belirli bir oyun seçilmişse işle
  useEffect(() => {
    if (gameUuid) {
      console.log('Selected game UUID:', gameUuid);
      // Burada oyun detay modalı açılabilir
    }
  }, [gameUuid]);

  // Popüler sağlayıcıların listesi
  const popularProviders = ["Pragmatic Play", "NetEnt", "Evolution", "Red Tiger", "Playson", "Wazdan", "Thunderkick", "Playtech", "Microgaming", "Quickspin"];
  
  return (
    <MainLayout>
      {/* Zeus Banner */}
      <div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96 mb-6 overflow-hidden">
        <img 
          src={ZeusBannerImage} 
          alt="Zeus - Slot Oyunları" 
          className="w-full h-full object-cover"
        />
        
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent">
          <div className="container mx-auto h-full flex flex-col justify-center px-4 sm:px-6">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2 drop-shadow-lg">
              {t('slots.title')}
            </h1>
            <p className="text-lg md:text-xl text-yellow-400 max-w-xl drop-shadow-md">
              {t('slots.banner_subtitle')}
            </p>
            <div className="mt-6">
              <button className="bg-yellow-600 hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-semibold text-lg transition-colors">
                {t('slots.play_now')}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 py-6">
        {/* Arama çubuğu - Mobil için görünür */}
        <div className="mb-6 lg:hidden">
          <div className="relative">
            <input
              type="text"
              placeholder={t('slots.search_games')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-2 px-4 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
            />
            <LucideSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          </div>
        </div>
        
        {/* Kategori Sekmeleri */}
        <div className="mb-6">
          <Tabs defaultValue="popular" onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid grid-cols-2 sm:grid-cols-5 bg-gray-800 rounded-xl p-1.5">
              <TabsTrigger value="popular" className="flex items-center gap-1.5 data-[state=active]:bg-yellow-600 data-[state=active]:text-black rounded-lg">
                <LucideFlame size={16} />
                <span>{t('slots.popular')}</span>
              </TabsTrigger>
              <TabsTrigger value="new" className="flex items-center gap-1.5 data-[state=active]:bg-yellow-600 data-[state=active]:text-black rounded-lg">
                <LucideZap size={16} />
                <span>{t('slots.new')}</span>
              </TabsTrigger>
              <TabsTrigger value="jackpot" className="hidden sm:flex items-center gap-1.5 data-[state=active]:bg-yellow-600 data-[state=active]:text-black rounded-lg">
                <LucideTrophy size={16} />
                <span>{t('slots.jackpot')}</span>
              </TabsTrigger>
              <TabsTrigger value="bonus" className="hidden sm:flex items-center gap-1.5 data-[state=active]:bg-yellow-600 data-[state=active]:text-black rounded-lg">
                <LucideBadgePercent size={16} />
                <span>{t('slots.bonus_buy')}</span>
              </TabsTrigger>
              <TabsTrigger value="played" className="hidden sm:flex items-center gap-1.5 data-[state=active]:bg-yellow-600 data-[state=active]:text-black rounded-lg">
                <LucideHistory size={16} />
                <span>{t('slots.recently_played')}</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="popular" className="mt-3">
              <div className="bg-gradient-to-r from-yellow-600/20 to-yellow-500/5 border border-yellow-600/30 p-4 rounded-lg">
                <h3 className="font-bold text-lg text-white">{t('slots.popular_title')}</h3>
                <p className="text-sm text-gray-300 mt-1">{t('slots.popular_description')}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="new" className="mt-3">
              <div className="bg-gradient-to-r from-blue-600/20 to-blue-500/5 border border-blue-600/30 p-4 rounded-lg">
                <h3 className="font-bold text-lg text-white">{t('slots.new_title')}</h3>
                <p className="text-sm text-gray-300 mt-1">{t('slots.new_description')}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="jackpot" className="mt-3">
              <div className="bg-gradient-to-r from-purple-600/20 to-purple-500/5 border border-purple-600/30 p-4 rounded-lg">
                <h3 className="font-bold text-lg text-white">{t('slots.jackpot_title')}</h3>
                <p className="text-sm text-gray-300 mt-1">{t('slots.jackpot_description')}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="bonus" className="mt-3">
              <div className="bg-gradient-to-r from-yellow-800/20 to-yellow-700/5 border border-yellow-800/30 p-4 rounded-lg">
                <h3 className="font-bold text-lg text-white">{t('slots.bonus_buy_title')}</h3>
                <p className="text-sm text-gray-300 mt-1">{t('slots.bonus_buy_description')}</p>
              </div>
            </TabsContent>
            
            <TabsContent value="played" className="mt-3">
              <div className="bg-gradient-to-r from-orange-600/20 to-orange-500/5 border border-orange-600/30 p-4 rounded-lg">
                <h3 className="font-bold text-lg text-white">{t('slots.recently_played_title')}</h3>
                <p className="text-sm text-gray-300 mt-1">{t('slots.recently_played_description')}</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Arama çubuğu - Desktop için görünür */}
        <div className="mb-6 hidden lg:block">
          <div className="relative max-w-xl">
            <input
              type="text"
              placeholder={t('slots.search_games')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg py-3 px-4 pl-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-600 focus:border-transparent"
            />
            <LucideSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          </div>
        </div>
        
        {/* Mobil Filtre Gösterme/Gizleme Buton */}
        <div className="lg:hidden mb-4">
          <button 
            onClick={() => setShowMobileFilters(!showMobileFilters)} 
            className="w-full flex items-center justify-between bg-yellow-600 text-black px-4 py-2 rounded-lg font-medium"
          >
            <div className="flex items-center gap-2">
              <LucideFilter size={18} />
              <span>{t('filters.show_filters')}</span>
            </div>
            <LucideChevronDown 
              size={18}
              className={`transition-transform duration-300 ${showMobileFilters ? 'rotate-180' : ''}`} 
            />
          </button>
        </div>
        
        <SmartGameProvider 
          gameType="slot" 
          perPage={100}
          initialGameType={activeTab === "bonus" ? GameType.BONUS_BUY : 
                        activeTab === "jackpot" ? GameType.JACKPOT : 
                        GameType.ALL}
          initialProvider={activeTab === "popular" ? "Pragmatic Play" : ""}
          maxGames={2000}
          searchTerm={searchTerm}
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
            goToPage,
            gamesCount
          }) => {
            // Arama terimini kullanarak oyunları filtrele
            const filteredGames = searchTerm ? 
              games.filter(game => game.name.toLowerCase().includes(searchTerm.toLowerCase())) : 
              games;
              
            return (
              <>
                {/* Filtreler ve İçerik Düzeni */}
                <div className="flex flex-col lg:flex-row gap-6">
                  {/* Sol Kenar - Filtreler (Mobil'de gizlenebilir) */}
                  <div className={`w-full lg:w-1/4 xl:w-1/5 ${showMobileFilters ? 'block' : 'hidden'} lg:block`}>
                    <div className="bg-gray-800/90 rounded-lg p-4 sticky top-20">
                      {/* Oyun tipi filtreleme */}
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-white mb-3 border-b border-gray-700 pb-2">
                          {t('filters.game_types')}
                        </h3>
                        <GameTypeFilter 
                          selectedType={selectedGameType}
                          onTypeSelect={setSelectedGameType}
                          availableTypes={[
                            GameType.ALL,
                            GameType.MEGAWAYS, 
                            GameType.BONUS_BUY,
                            GameType.JACKPOT,
                            GameType.CLUSTER_PAYS,
                            GameType.HIGH_VOLATILITY,
                            GameType.FRUIT_SLOTS,
                            GameType.ANIMAL_THEMED
                          ]}
                          showIcons={true}
                          vertical={true}
                        />
                      </div>
                      
                      {/* Popüler Sağlayıcılar */}
                      <div className="mb-6">
                        <h3 className="text-lg font-medium text-white mb-3 border-b border-gray-700 pb-2">
                          {t('filters.popular_providers')}
                        </h3>
                        <div className="space-y-2">
                          {popularProviders.map(provider => (
                            <button
                              key={provider}
                              onClick={() => setSelectedProvider(provider)}
                              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                                selectedProvider === provider 
                                  ? 'bg-yellow-600 text-white' 
                                  : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                              }`}
                            >
                              {provider}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Tüm Sağlayıcılar Buton */}
                      <div className="mb-4">
                        <button
                          onClick={() => setSelectedProvider("")}
                          className="w-full py-2 px-3 bg-yellow-700 hover:bg-yellow-600 text-white rounded-md transition-colors font-medium"
                        >
                          {t('filters.all_providers')}
                        </button>
                      </div>
                      
                      {/* Cihaz bilgisi ipucu mesajı */}
                      {isMobile && (
                        <div className="mt-4 px-4 py-3 bg-yellow-600/10 border border-yellow-600/20 rounded-lg">
                          <p className="text-sm text-yellow-500">
                            <span className="font-semibold">{t('games.device_detected')}</span>: {t('games.mobile_optimized')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Sağ Kenar - Oyun Listesi */}
                  <div className="w-full lg:w-3/4 xl:w-4/5">
                    {/* Oyun sayısı bilgisi */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm text-gray-400">
                        {filteredGames.length > 0 ? (
                          <span>
                            {t('games.showing')} <span className="text-yellow-500 font-semibold">{filteredGames.length}</span> {t('games.of')} <span className="text-yellow-500 font-semibold">{gamesCount}</span> {t('games.games')}
                          </span>
                        ) : isLoading ? (
                          <span>{t('games.loading')}</span>
                        ) : (
                          <span>{t('games.no_games_found')}</span>
                        )}
                      </div>
                      
                      {/* Tüm sağlayıcılar - Desktop */}
                      <button 
                        onClick={() => setSelectedProvider("")}
                        className={`hidden lg:block px-3 py-1.5 text-sm rounded-md ${
                          selectedProvider === "" 
                            ? 'bg-yellow-600 text-white' 
                            : 'bg-gray-700 text-gray-200 hover:bg-gray-600'
                        }`}
                      >
                        {t('filters.reset_filters')}
                      </button>
                    </div>
                    
                    {/* Filtreleme özet bilgisi */}
                    {(selectedGameType !== GameType.ALL || selectedProvider) && (
                      <div className="mb-4 p-3 bg-gray-800/70 rounded-lg flex flex-wrap items-center gap-2">
                        <span className="text-gray-300 text-sm">{t('filters.active_filters')}:</span>
                        
                        {selectedGameType !== GameType.ALL && (
                          <span className="bg-yellow-700 text-white text-xs px-2 py-1 rounded-full flex items-center">
                            {t(`gameType.${selectedGameType}`)}
                            <button 
                              className="ml-1.5 hover:text-yellow-300" 
                              onClick={() => setSelectedGameType(GameType.ALL)}
                            >
                              ✕
                            </button>
                          </span>
                        )}
                        
                        {selectedProvider && (
                          <span className="bg-yellow-700 text-white text-xs px-2 py-1 rounded-full flex items-center">
                            {selectedProvider}
                            <button 
                              className="ml-1.5 hover:text-yellow-300" 
                              onClick={() => setSelectedProvider("")}
                            >
                              ✕
                            </button>
                          </span>
                        )}
                        
                        <button 
                          className="ml-auto text-xs text-yellow-500 hover:text-yellow-400 underline"
                          onClick={() => {
                            setSelectedGameType(GameType.ALL);
                            setSelectedProvider("");
                          }}
                        >
                          {t('filters.clear_all')}
                        </button>
                      </div>
                    )}
                    
                    {/* Oyun listesi */}
                    <GameGrid 
                      games={filteredGames} 
                      isLoading={isLoading}
                      isError={isError}
                      columns={isMobile ? 2 : 5}
                      showDeviceFilter={!isMobile}
                    />
                    
                    {/* Arama ve filtrelere göre sonuç bulunamadı mesajı */}
                    {filteredGames.length === 0 && games.length > 0 && (
                      <div className="mt-8 p-6 bg-gray-800/70 rounded-lg text-center">
                        <h3 className="text-xl font-bold text-yellow-500 mb-3">{t('slots.no_results_found')}</h3>
                        <p className="text-gray-300 mb-4">{t('slots.try_different_search')}</p>
                        
                        <div className="flex flex-wrap justify-center gap-3">
                          {searchTerm && (
                            <button 
                              onClick={() => setSearchTerm("")}
                              className="px-4 py-2 bg-yellow-600 text-black rounded-md hover:bg-yellow-500 transition-colors"
                            >
                              {t('slots.clear_search')}
                            </button>
                          )}
                          
                          {(selectedGameType !== GameType.ALL || selectedProvider) && (
                            <button 
                              onClick={() => {
                                setSelectedGameType(GameType.ALL);
                                setSelectedProvider("");
                              }}
                              className="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors"
                            >
                              {t('filters.clear_filters')}
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Sayfalama */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <div className="flex flex-wrap justify-center gap-2">
                      <button 
                        onClick={() => goToPage(1)}
                        disabled={currentPage === 1}
                        className="px-3 py-2 rounded-md bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                      >
                        {t('common.first')}
                      </button>
                      <button 
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-4 py-2 rounded-md bg-yellow-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-700 transition-colors"
                      >
                        {t('common.previous')}
                      </button>
                      
                      <div className="px-4 py-2 text-white bg-gray-800 rounded-md">
                        {t('common.page')} {currentPage} / {totalPages}
                      </div>
                      
                      <button 
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-4 py-2 rounded-md bg-yellow-600 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-yellow-700 transition-colors"
                      >
                        {t('common.next')}
                      </button>
                      <button 
                        onClick={() => goToPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 rounded-md bg-gray-800 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-700 transition-colors"
                      >
                        {t('common.last')}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Kategorilere Göre Oyunlar Bölümü */}
                {!searchTerm && selectedGameType === GameType.ALL && !selectedProvider && (
                  <div className="mt-12">
                    <div className="border-b border-gray-700 pb-2 mb-6">
                      <h2 className="text-2xl font-bold text-white">{t('slots.popular_categories')}</h2>
                    </div>
                    
                    {/* Bonus Buy Oyunları */}
                    <div className="mb-10">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white">{t('gameType.bonus_buy')}</h3>
                        <Link to="/slots?type=bonus_buy" className="text-yellow-500 hover:text-yellow-400 text-sm">
                          {t('common.view_all')} &rarr;
                        </Link>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {games
                          .filter(game => game.name.toLowerCase().includes('bonus buy') || game.name.toLowerCase().includes('feature buy'))
                          .slice(0, 6)
                          .map(game => (
                            <div key={game.uuid} className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                              <img src={game.image} alt={game.name} className="w-full h-32 object-cover" />
                              <div className="p-2">
                                <h4 className="text-sm text-white truncate">{game.name}</h4>
                                <p className="text-xs text-gray-400">{game.provider_name}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                    
                    {/* Megaways Oyunları */}
                    <div className="mb-10">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white">{t('gameType.megaways')}</h3>
                        <Link to="/slots?type=megaways" className="text-yellow-500 hover:text-yellow-400 text-sm">
                          {t('common.view_all')} &rarr;
                        </Link>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {games
                          .filter(game => game.name.toLowerCase().includes('megaways'))
                          .slice(0, 6)
                          .map(game => (
                            <div key={game.uuid} className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                              <img src={game.image} alt={game.name} className="w-full h-32 object-cover" />
                              <div className="p-2">
                                <h4 className="text-sm text-white truncate">{game.name}</h4>
                                <p className="text-xs text-gray-400">{game.provider_name}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                    
                    {/* Jackpot Oyunları */}
                    <div className="mb-10">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-semibold text-white">{t('gameType.jackpot')}</h3>
                        <Link to="/slots?type=jackpot" className="text-yellow-500 hover:text-yellow-400 text-sm">
                          {t('common.view_all')} &rarr;
                        </Link>
                      </div>
                      
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                        {games
                          .filter(game => game.name.toLowerCase().includes('jackpot'))
                          .slice(0, 6)
                          .map(game => (
                            <div key={game.uuid} className="bg-gray-800 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                              <img src={game.image} alt={game.name} className="w-full h-32 object-cover" />
                              <div className="p-2">
                                <h4 className="text-sm text-white truncate">{game.name}</h4>
                                <p className="text-xs text-gray-400">{game.provider_name}</p>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )
          }}
        </SmartGameProvider>
      </div>
    </MainLayout>
  );
};

export default SlotsPage;