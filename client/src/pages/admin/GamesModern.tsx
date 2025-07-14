import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Search,
  Filter,
  Download,
  Upload,
  Eye,
  Settings,
  BarChart3,
  TrendingUp,
  Users,
  Gamepad2,
  Play,
  Pause,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  CheckCircle,
  XCircle,
  Activity,
  Star,
  Globe,
  Smartphone,
  Monitor,
  Calendar,
  DollarSign,
  Target,
  Zap
} from 'lucide-react';

// Tip tanımları
interface Game {
  id: number;
  uuid: string;
  name: string;
  provider: string;
  category: string;
  subcategory?: string;
  image?: string;
  imageUrl?: string;
  isActive: boolean;
  isMobile: boolean;
  isDesktop: boolean;
  hasDemo: boolean;
  hasRealMoney: boolean;
  minBet?: string;
  maxBet?: string;
  rtp?: string;
  volatility?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
  stats?: {
    sessions30d: number;
    bets30d: number;
    totalBetAmount30d: number;
    totalWinAmount30d: number;
    rtp30d: number;
  };
}

interface GameStats {
  games: {
    totalGames: number;
    activeGames: number;
    inactiveGames: number;
  };
  sessions: {
    totalSessions: number;
    activeSessions: number;
    uniqueGames: number;
  };
  bets: {
    totalBets: number;
    totalBetAmount: number;
    totalWinAmount: number;
    avgBetAmount: number;
    rtp: number;
  };
  popularGames: Array<{
    uuid: string;
    name: string;
    provider: string;
    totalSessions: number;
    totalBets: number;
  }>;
}

// İstatistik kartı bileşeni
const StatCard: React.FC<{
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<any>;
  trend?: string;
  trendValue?: string;
  className?: string;
}> = ({ title, value, subtitle, icon: Icon, trend, trendValue, className = "" }) => (
  <Card className={`bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-gray-700/50 ${className}`}>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {subtitle && (
            <p className="text-sm text-gray-300">{subtitle}</p>
          )}
          {trend && trendValue && (
            <div className="flex items-center gap-1">
              <TrendingUp className={`h-4 w-4 ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
              <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-lg border border-yellow-500/30">
          <Icon className="h-6 w-6 text-yellow-500" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Oyun kartı bileşeni
const GameCard: React.FC<{ 
  game: Game; 
  onToggleStatus: (uuid: string, isActive: boolean) => void;
  onViewDetails: (game: Game) => void;
}> = ({ game, onToggleStatus, onViewDetails }) => (
  <Card className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border-gray-700/50 hover:border-yellow-500/30 transition-all duration-200">
    <CardContent className="p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg flex items-center justify-center border border-gray-600">
            {game.image || game.imageUrl ? (
              <img 
                src={game.imageUrl || game.image} 
                alt={game.name}
                className="w-10 h-10 rounded object-cover"
                onError={(e) => {
                  const currentTarget = e.currentTarget as HTMLImageElement;
                  const nextElement = currentTarget.nextElementSibling as HTMLElement;
                  currentTarget.style.display = 'none';
                  if (nextElement) nextElement.style.display = 'flex';
                }}
              />
            ) : null}
            <Gamepad2 className="h-6 w-6 text-gray-400" style={{ display: game.image || game.imageUrl ? 'none' : 'flex' }} />
          </div>
          <div>
            <h3 className="font-semibold text-white text-sm line-clamp-1">{game.name}</h3>
            <p className="text-xs text-gray-400">{game.provider}</p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                {game.category}
              </Badge>
              {game.isActive ? (
                <Badge className="text-xs bg-green-600">Aktif</Badge>
              ) : (
                <Badge variant="destructive" className="text-xs">Pasif</Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Switch
            checked={game.isActive}
            onCheckedChange={(checked) => onToggleStatus(game.uuid, checked)}
          />
        </div>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Platform:</span>
          <div className="flex items-center gap-1">
            {game.isDesktop && <Monitor className="h-3 w-3 text-blue-400" />}
            {game.isMobile && <Smartphone className="h-3 w-3 text-green-400" />}
          </div>
        </div>
        
        {game.rtp && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">RTP:</span>
            <span className="text-white font-medium">{game.rtp}%</span>
          </div>
        )}
        
        {game.stats && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">30 Gün Oturum:</span>
            <span className="text-white font-medium">{game.stats.sessions30d}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          size="sm" 
          variant="outline" 
          className="flex-1 border-gray-600 text-gray-300 hover:border-yellow-500"
          onClick={() => onViewDetails(game)}
        >
          <Eye className="h-3 w-3 mr-1" />
          Detaylar
        </Button>
        <Button size="sm" variant="outline" className="border-gray-600 text-gray-300 hover:border-yellow-500">
          <MoreHorizontal className="h-3 w-3" />
        </Button>
      </div>
    </CardContent>
  </Card>
);

// Ana bileşen
const GamesModern: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [filters, setFilters] = useState({
    search: '',
    provider: 'all',
    category: 'all',
    status: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [showGameDetails, setShowGameDetails] = useState(false);
  
  // API Queries
  const { data: stats, isLoading: statsLoading } = useQuery<{ success: boolean; stats: GameStats }>({
    queryKey: ['/api/admin/stats'],
    refetchInterval: 60000 // Her dakika güncelle
  });

  const { data: providers } = useQuery<{ success: boolean; providers: any[] }>({
    queryKey: ['/api/admin/providers']
  });

  const { data: categories } = useQuery<{ success: boolean; categories: any[] }>({
    queryKey: ['/api/admin/categories']
  });

  const { data: gamesData, isLoading: gamesLoading, refetch: refetchGames } = useQuery<{
    success: boolean;
    games: Game[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  }>({
    queryKey: ['/api/admin/games', { ...filters, page: currentPage, limit: pageSize }],
    refetchInterval: 30000 // Her 30 saniyede güncelle
  });

  // Mutations
  const toggleGameStatusMutation = useMutation({
    mutationFn: async ({ uuid, isActive }: { uuid: string; isActive: boolean }) => {
      const response = await fetch(`/api/admin/games/${uuid}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/games'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({
        title: "Başarılı",
        description: "Oyun durumu güncellendi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Oyun durumu güncellenirken hata oluştu",
        variant: "destructive",
      });
    }
  });

  // Filter handlers
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const handleToggleGameStatus = (uuid: string, isActive: boolean) => {
    toggleGameStatusMutation.mutate({ uuid, isActive });
  };

  const handleViewGameDetails = (game: Game) => {
    setSelectedGame(game);
    setShowGameDetails(true);
  };

  // Memoized values
  const filteredStats = useMemo(() => {
    if (!stats?.stats) return null;
    return stats.stats;
  }, [stats]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Oyun Yönetimi</h1>
            <p className="text-gray-400 mt-1">Slotegrator oyun kataloğunu yönetin</p>
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => refetchGames()}
              disabled={gamesLoading}
              className="border-gray-600 text-gray-300"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${gamesLoading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
              <Download className="h-4 w-4 mr-2" />
              Dışa Aktar
            </Button>
            <Button variant="outline" size="sm" className="border-gray-600 text-gray-300">
              <Upload className="h-4 w-4 mr-2" />
              İçe Aktar
            </Button>
          </div>
        </div>

        {/* İstatistikler */}
        {filteredStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              title="Toplam Oyun"
              value={filteredStats.games.totalGames}
              subtitle={`${filteredStats.games.activeGames} aktif`}
              icon={Gamepad2}
              trend="up"
              trendValue="+12 bu ay"
            />
            <StatCard
              title="Aktif Oturumlar"
              value={filteredStats.sessions.activeSessions}
              subtitle={`${filteredStats.sessions.totalSessions} toplam`}
              icon={Users}
              trend="up"
              trendValue="+8%"
            />
            <StatCard
              title="30 Gün Bahis"
              value={`₺${filteredStats.bets.totalBetAmount.toLocaleString()}`}
              subtitle={`${filteredStats.bets.totalBets} toplam bahis`}
              icon={DollarSign}
              trend="up"
              trendValue="+23%"
            />
            <StatCard
              title="Ortalama RTP"
              value={`${filteredStats.bets.rtp.toFixed(2)}%`}
              subtitle="Son 30 gün"
              icon={Target}
              trend="up"
              trendValue="+0.5%"
            />
          </div>
        )}

        {/* Ana İçerik */}
        <Tabs defaultValue="games" className="space-y-6">
          <TabsList className="bg-gray-800/50 border border-gray-700">
            <TabsTrigger value="games">Oyunlar</TabsTrigger>
            <TabsTrigger value="popular">Popüler Oyunlar</TabsTrigger>
            <TabsTrigger value="analytics">Analitik</TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="space-y-6">
            {/* Filtreler */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Filtreler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <Label htmlFor="search" className="text-gray-300">Arama</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        id="search"
                        placeholder="Oyun adı veya provider ara..."
                        value={filters.search}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className="pl-10 bg-gray-700/50 border-gray-600 text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="provider" className="text-gray-300">Provider</Label>
                    <Select value={filters.provider} onValueChange={(value) => handleFilterChange('provider', value)}>
                      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                        <SelectValue placeholder="Provider seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Providerlar</SelectItem>
                        {providers?.providers?.map((provider) => (
                          <SelectItem key={provider.provider} value={provider.provider}>
                            {provider.provider} ({provider.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="category" className="text-gray-300">Kategori</Label>
                    <Select value={filters.category} onValueChange={(value) => handleFilterChange('category', value)}>
                      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tüm Kategoriler</SelectItem>
                        {categories?.categories?.map((category) => (
                          <SelectItem key={category.category} value={category.category}>
                            {category.category} ({category.count})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status" className="text-gray-300">Durum</Label>
                    <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                      <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                        <SelectValue placeholder="Durum seçin" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Tümü</SelectItem>
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="inactive">Pasif</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Oyun Listesi */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white">
                    Oyunlar ({gamesData?.pagination?.totalItems || 0})
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Label className="text-gray-300">Sayfa başına:</Label>
                    <Select value={pageSize.toString()} onValueChange={(value) => setPageSize(Number(value))}>
                      <SelectTrigger className="w-20 bg-gray-700/50 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="20">20</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {gamesLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <RefreshCw className="h-8 w-8 animate-spin text-yellow-500" />
                  </div>
                ) : (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                      {gamesData?.games?.map((game) => (
                        <GameCard
                          key={game.uuid}
                          game={game}
                          onToggleStatus={handleToggleGameStatus}
                          onViewDetails={handleViewGameDetails}
                        />
                      ))}
                    </div>

                    {/* Sayfalama */}
                    {gamesData?.pagination && gamesData.pagination.totalPages > 1 && (
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-400">
                          {gamesData.pagination.totalItems} oyundan {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, gamesData.pagination.totalItems)} arası gösteriliyor
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="border-gray-600 text-gray-300"
                          >
                            <ChevronLeft className="h-4 w-4" />
                          </Button>
                          <span className="text-sm text-gray-300">
                            {currentPage} / {gamesData.pagination.totalPages}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCurrentPage(prev => Math.min(gamesData.pagination.totalPages, prev + 1))}
                            disabled={currentPage === gamesData.pagination.totalPages}
                            className="border-gray-600 text-gray-300"
                          >
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="popular" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Popüler Oyunlar (Son 30 Gün)</CardTitle>
                <CardDescription className="text-gray-400">
                  En çok oynanan oyunlar
                </CardDescription>
              </CardHeader>
              <CardContent>
                {filteredStats?.popularGames?.length ? (
                  <div className="space-y-4">
                    {filteredStats.popularGames.map((game, index) => (
                      <div key={game.uuid} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-yellow-500/20 rounded-full border border-yellow-500/30">
                            <span className="text-sm font-bold text-yellow-500">#{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-white">{game.name}</h3>
                            <p className="text-sm text-gray-400">{game.provider}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-white">{game.totalSessions} oturum</p>
                          <p className="text-xs text-gray-400">{game.totalBets} bahis</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-400 py-8">Popüler oyun verisi bulunamadı</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Provider Dağılımı</CardTitle>
                </CardHeader>
                <CardContent>
                  {providers?.providers?.length ? (
                    <div className="space-y-3">
                      {providers.providers.slice(0, 10).map((provider) => (
                        <div key={provider.provider} className="flex items-center justify-between">
                          <span className="text-gray-300">{provider.provider}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full"
                                style={{ width: `${(provider.count / providers.providers[0].count) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-400 w-8 text-right">{provider.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-8">Provider verisi bulunamadı</p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Kategori Dağılımı</CardTitle>
                </CardHeader>
                <CardContent>
                  {categories?.categories?.length ? (
                    <div className="space-y-3">
                      {categories.categories.slice(0, 10).map((category) => (
                        <div key={category.category} className="flex items-center justify-between">
                          <span className="text-gray-300">{category.category}</span>
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                                style={{ width: `${(category.count / categories.categories[0].count) * 100}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-400 w-8 text-right">{category.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-400 py-8">Kategori verisi bulunamadı</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Oyun Detay Modal */}
        <Dialog open={showGameDetails} onOpenChange={setShowGameDetails}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedGame?.name}</DialogTitle>
              <DialogDescription className="text-gray-400">
                {selectedGame?.provider} - {selectedGame?.category}
              </DialogDescription>
            </DialogHeader>
            {selectedGame && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  {selectedGame.imageUrl && (
                    <img 
                      src={selectedGame.imageUrl} 
                      alt={selectedGame.name}
                      className="w-20 h-20 rounded-lg object-cover border border-gray-600"
                    />
                  )}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge className={selectedGame.isActive ? "bg-green-600" : "bg-red-600"}>
                        {selectedGame.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                      {selectedGame.isDesktop && <Badge variant="outline">Desktop</Badge>}
                      {selectedGame.isMobile && <Badge variant="outline">Mobile</Badge>}
                    </div>
                    <div className="text-sm text-gray-400">
                      <p>UUID: {selectedGame.uuid}</p>
                      <p>Oluşturulma: {new Date(selectedGame.createdAt).toLocaleDateString('tr-TR')}</p>
                    </div>
                  </div>
                </div>
                
                {selectedGame.stats && (
                  <div className="grid grid-cols-2 gap-4 p-4 bg-gray-700/30 rounded-lg">
                    <div>
                      <p className="text-sm text-gray-400">30 Günlük Oturum</p>
                      <p className="text-lg font-bold text-white">{selectedGame.stats.sessions30d}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">30 Günlük Bahis</p>
                      <p className="text-lg font-bold text-white">{selectedGame.stats.bets30d}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Toplam Bahis Tutarı</p>
                      <p className="text-lg font-bold text-white">₺{selectedGame.stats.totalBetAmount30d.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">30 Günlük RTP</p>
                      <p className="text-lg font-bold text-white">{selectedGame.stats.rtp30d.toFixed(2)}%</p>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowGameDetails(false)}
                    className="border-gray-600 text-gray-300"
                  >
                    Kapat
                  </Button>
                  <Button 
                    onClick={() => handleToggleGameStatus(selectedGame.uuid, !selectedGame.isActive)}
                    className={selectedGame.isActive ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"}
                  >
                    {selectedGame.isActive ? "Pasifleştir" : "Aktifleştir"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default GamesModern;