import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { SlotegratorGame } from '@/types/slotegrator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useLanguage } from '@/contexts/LanguageContext';

const AllGames: React.FC = () => {
  const { translate } = useLanguage();
  const [selectedTab, setSelectedTab] = useState('stats');
  const [displayedGames, setDisplayedGames] = useState<SlotegratorGame[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const gamesPerPage = 50;

  // Tüm oyunları getir
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/slotegrator/games/max'],
    staleTime: 60 * 60 * 1000, // 1 saat
  });

  useEffect(() => {
    if (data?.allGames) {
      let filteredGames = data.allGames;
      
      // Sağlayıcı filtrelemesi
      if (selectedProvider) {
        filteredGames = filteredGames.filter((game: SlotegratorGame) => 
          game.provider === selectedProvider
        );
      }
      
      // Sayfalama
      const startIndex = (currentPage - 1) * gamesPerPage;
      setDisplayedGames(filteredGames.slice(startIndex, startIndex + gamesPerPage));
    }
  }, [data, currentPage, selectedProvider]);

  // Yükleniyor durumu
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
        <p className="mt-4 text-xl">Tüm oyunlar yükleniyor... Bu işlem birkaç dakika sürebilir.</p>
      </div>
    );
  }

  // Hata durumu
  if (error) {
    return (
      <div className="container mx-auto p-4">
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Hata Oluştu</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{(error as Error).message}</p>
            <Button className="mt-4" onClick={() => refetch()}>Tekrar Dene</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Veri yok
  if (!data || !data.allGames) {
    return (
      <div className="container mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Veri Bulunamadı</CardTitle>
          </CardHeader>
          <CardContent>
            <Button onClick={() => refetch()}>Veriyi Getir</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // İstatistikler
  const stats = data._meta || {};
  const gameTypes = stats.gameTypes || {};
  const providers = stats.providers || [];
  const totalGames = stats.totalCount || 0;
  const mobileGames = stats.mobileGames || 0;
  const desktopGames = stats.desktopGames || 0;

  // Sayfa değiştirme
  const totalPages = Math.ceil((selectedProvider 
    ? data.allGames.filter((g: SlotegratorGame) => g.provider === selectedProvider).length 
    : totalGames) / gamesPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Tüm Slotegrator Oyunları</h1>
      
      <div className="mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Oyun İstatistikleri</CardTitle>
            <CardDescription>
              API'den maksimum sayıda yüklenen oyun verisi
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-yellow-100 p-4 rounded-lg">
                <h3 className="font-semibold">Toplam Oyun</h3>
                <p className="text-2xl font-bold">{totalGames}</p>
              </div>
              <div className="bg-green-100 p-4 rounded-lg">
                <h3 className="font-semibold">Mobil Oyunlar</h3>
                <p className="text-2xl font-bold">{mobileGames}</p>
              </div>
              <div className="bg-blue-100 p-4 rounded-lg">
                <h3 className="font-semibold">Masaüstü Oyunlar</h3>
                <p className="text-2xl font-bold">{desktopGames}</p>
              </div>
            </div>
            
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Yükleme Performansı</h3>
              <p>Yanıt süresi: {stats.responseTime ? `${stats.responseTime / 1000} saniye` : 'Bilinmiyor'}</p>
              <p>Veri kaynağı: {stats.source || 'API'}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-6">
        <TabsList className="w-full">
          <TabsTrigger value="stats">İstatistikler</TabsTrigger>
          <TabsTrigger value="games">Oyunlar</TabsTrigger>
          <TabsTrigger value="providers">Sağlayıcılar</TabsTrigger>
          <TabsTrigger value="types">Oyun Türleri</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Genel İstatistikler</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Oyun Türleri</h3>
                  <ul className="max-h-96 overflow-y-auto">
                    {Object.entries(gameTypes)
                      .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
                      .map(([type, count]) => (
                        <li key={type} className="mb-1 flex justify-between">
                          <span>{type}</span>
                          <span className="font-bold">{count}</span>
                        </li>
                      ))
                    }
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Sağlayıcı Sayısı</h3>
                  <p className="text-2xl font-bold">{providers.length}</p>
                  
                  <h3 className="font-semibold mb-2 mt-4">En Çok Oyuna Sahip Sağlayıcılar</h3>
                  <ul>
                    {providers.slice(0, 5).map(provider => {
                      const count = data.allGames.filter((g: SlotegratorGame) => g.provider === provider).length;
                      return (
                        <li key={provider} className="mb-1 flex justify-between">
                          <span>{provider}</span>
                          <span className="font-bold">{count}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="games">
          <Card>
            <CardHeader>
              <CardTitle>Oyun Listesi</CardTitle>
              <CardDescription>
                {selectedProvider 
                  ? `${selectedProvider} sağlayıcısının oyunları (${data.allGames.filter((g: SlotegratorGame) => g.provider === selectedProvider).length} oyun)`
                  : `Tüm oyunlar (${totalGames} oyun)`
                }
              </CardDescription>
              
              {selectedProvider && (
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedProvider(null);
                    setCurrentPage(1);
                  }}
                  className="mt-2"
                >
                  Filtreyi Temizle
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                {displayedGames.map((game: SlotegratorGame) => (
                  <Card key={game.uuid} className="overflow-hidden">
                    <div className="h-40 bg-gray-100 overflow-hidden flex items-center justify-center">
                      {game.image ? (
                        <img 
                          src={game.image} 
                          alt={game.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=No+Image';
                          }}
                        />
                      ) : (
                        <div className="text-center p-4">Resim Yok</div>
                      )}
                    </div>
                    <CardHeader className="p-3">
                      <CardTitle className="text-base truncate">{game.name}</CardTitle>
                      <CardDescription className="flex justify-between text-xs">
                        <span>{game.provider}</span>
                        <span>{game.is_mobile === 1 ? '📱 Mobil' : '🖥️ Masaüstü'}</span>
                      </CardDescription>
                    </CardHeader>
                  </Card>
                ))}
              </div>
              
              <div className="flex justify-between items-center mt-4">
                <div>
                  Sayfa {currentPage} / {totalPages}
                </div>
                <div>
                  <Button 
                    onClick={handlePrevPage} 
                    disabled={currentPage === 1}
                    variant="outline"
                    className="mr-2"
                  >
                    Önceki
                  </Button>
                  <Button 
                    onClick={handleNextPage} 
                    disabled={currentPage === totalPages}
                    variant="outline"
                  >
                    Sonraki
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="providers">
          <Card>
            <CardHeader>
              <CardTitle>Sağlayıcılar</CardTitle>
              <CardDescription>
                Toplam {providers.length} sağlayıcı
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {providers.map(provider => {
                  const providerGames = data.allGames.filter((g: SlotegratorGame) => g.provider === provider);
                  return (
                    <Card 
                      key={provider} 
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => {
                        setSelectedProvider(provider);
                        setCurrentPage(1);
                        setSelectedTab('games');
                      }}
                    >
                      <CardHeader className="p-3">
                        <CardTitle className="text-base">{provider}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-sm">{providerGames.length} oyun</p>
                        <p className="text-xs text-gray-500">
                          Mobil: {providerGames.filter(g => g.is_mobile === 1).length} | 
                          Masaüstü: {providerGames.filter(g => g.is_mobile === 0).length}
                        </p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="types">
          <Card>
            <CardHeader>
              <CardTitle>Oyun Türleri</CardTitle>
              <CardDescription>
                Toplam {Object.keys(gameTypes).length} tür
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(gameTypes)
                  .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
                  .map(([type, count]) => (
                    <Card key={type}>
                      <CardHeader className="p-3">
                        <CardTitle className="text-base">{type}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-3 pt-0">
                        <p className="text-xl font-bold">{count} oyun</p>
                        <p className="text-sm text-gray-500">
                          {Math.round(((count as number) / totalGames) * 100)}% oranında
                        </p>
                      </CardContent>
                    </Card>
                  ))
                }
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AllGames;