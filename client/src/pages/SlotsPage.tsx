import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Grid, List, Filter } from 'lucide-react';
import { SlotegratorGame } from '@/types/slotegrator';

const SlotsPage: React.FC = () => {
  const { translate } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 50;

  // Sadece slot oyunlarını getir
  const { data: gamesData, isLoading, error } = useQuery({
    queryKey: ['/api/slotegrator/games/slots'],
    queryFn: async () => {
      const response = await fetch('/api/slotegrator/games/slots');
      if (!response.ok) {
        throw new Error('Oyunlar yüklenemedi');
      }
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 dakika
  });

  const allGames: SlotegratorGame[] = gamesData?.items || [];

  // Benzersiz sağlayıcıları hesapla
  const uniqueProviders = useMemo(() => {
    const providers = Array.from(new Set(allGames.map(game => game.provider)));
    return providers.sort();
  }, [allGames]);

  // Filtrelenmiş ve sıralanmış oyunlar
  const filteredAndSortedGames = useMemo(() => {
    let filtered = allGames;

    // Arama filtresi
    if (searchTerm) {
      filtered = filtered.filter(game =>
        game.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        game.provider.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sağlayıcı filtresi
    if (selectedProvider !== 'all') {
      filtered = filtered.filter(game => game.provider === selectedProvider);
    }

    // Sıralama
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'provider':
          return a.provider.localeCompare(b.provider);
        default:
          return 0;
      }
    });

    return filtered;
  }, [allGames, searchTerm, selectedProvider, sortBy]);

  // Sayfalama
  const totalPages = Math.ceil(filteredAndSortedGames.length / itemsPerPage);
  const paginatedGames = filteredAndSortedGames.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleGameClick = (game: SlotegratorGame) => {
    console.log('Oyun seçildi:', game.name);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="bg-red-600/20 border border-red-600/30 rounded-lg p-6 text-center">
            <p className="text-red-400 text-lg">Oyunlar yüklenirken hata oluştu</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              Tekrar Dene
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold text-white mb-4">Slot Oyunları</h1>
            <p className="text-xl text-yellow-400 mb-6">
              {allGames.length} oyun, {uniqueProviders.length} sağlayıcı
            </p>
            <div className="flex flex-wrap gap-3">
              <Badge className="bg-yellow-600 text-black px-4 py-2">
                {allGames.length} Slot Oyunu
              </Badge>
              <Badge className="bg-green-600 text-white px-3 py-2">
                {uniqueProviders.length} Sağlayıcı
              </Badge>
              <Badge className="bg-blue-600 text-white px-3 py-2">
                Canlı Veriler
              </Badge>
            </div>
          </div>
        </div>

        {/* Filtreler */}
        <div className="container mx-auto px-4 py-6">
          <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Arama */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Oyun ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white"
                />
              </div>

              {/* Sağlayıcı */}
              <Select value={selectedProvider} onValueChange={setSelectedProvider}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Sağlayıcı" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Sağlayıcılar</SelectItem>
                  {uniqueProviders.map(provider => (
                    <SelectItem key={provider} value={provider}>
                      {provider}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Sıralama */}
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Sırala" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">İsme Göre</SelectItem>
                  <SelectItem value="provider">Sağlayıcıya Göre</SelectItem>
                </SelectContent>
              </Select>

              {/* Görünüm */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className="flex-1"
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className="flex-1"
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Filtre Sonuçları */}
            <div className="mt-4 flex items-center justify-between text-sm text-gray-400">
              <span>
                {filteredAndSortedGames.length} oyun bulundu
                {searchTerm && ` "${searchTerm}" için`}
                {selectedProvider !== 'all' && ` ${selectedProvider} sağlayıcısında`}
              </span>
              {(searchTerm || selectedProvider !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedProvider('all');
                  }}
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  Filtreleri Temizle
                </Button>
              )}
            </div>
          </div>

          {/* Oyun Listesi */}
          {filteredAndSortedGames.length === 0 ? (
            <div className="text-center py-12">
              <Filter className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-300 mb-2">Oyun bulunamadı</h3>
              <p className="text-gray-500">Arama kriterlerinizi değiştirmeyi deneyin</p>
            </div>
          ) : (
            <>
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4"
                : "space-y-3"
              }>
                {paginatedGames.map((game) => (
                  <div
                    key={game.uuid}
                    onClick={() => handleGameClick(game)}
                    className={viewMode === 'grid'
                      ? "bg-gray-800/50 backdrop-blur rounded-lg overflow-hidden hover:bg-gray-700/50 transition-all cursor-pointer group"
                      : "bg-gray-800/50 backdrop-blur rounded-lg p-4 flex items-center gap-4 hover:bg-gray-700/50 transition-all cursor-pointer"
                    }
                  >
                    {viewMode === 'grid' ? (
                      <>
                        <div className="aspect-square bg-gray-700 relative overflow-hidden">
                          <img
                            src={game.image}
                            alt={game.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-game.jpg';
                            }}
                          />
                        </div>
                        <div className="p-3">
                          <h3 className="font-medium text-white text-sm mb-1 line-clamp-2">
                            {game.name}
                          </h3>
                          <p className="text-xs text-gray-400">{game.provider}</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 bg-gray-700 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={game.image}
                            alt={game.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src = '/placeholder-game.jpg';
                            }}
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium text-white mb-1">{game.name}</h3>
                          <p className="text-sm text-gray-400">{game.provider}</p>
                        </div>
                        <Button size="sm" variant="outline">
                          Oyna
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Sayfalama */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-8">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Önceki
                    </Button>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                          <Button
                            key={page}
                            variant={currentPage === page ? 'default' : 'outline'}
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
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Sonraki
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default SlotsPage;