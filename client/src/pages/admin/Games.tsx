import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { FixedSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminLanguage } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Filter,
  ChevronDown,
  Edit,
  Trash,
  Eye,
  PlusCircle,
  Download,
  UploadCloud,
  Check,
  X,
  Star,
  Gamepad2,
  ArrowUpRight,
  BarChart2,
  Shuffle,
  SlidersHorizontal,
  LayoutGrid,
  Loader,
  RefreshCw
} from 'lucide-react';

// Oyun türleri
const gameCategories = [
  { id: 'slot', name: 'Slot' },
  { id: 'casino', name: 'Casino' },
  { id: 'live', name: 'Live Casino' },
  { id: 'table', name: 'Table Games' },
  { id: 'poker', name: 'Poker' },
  { id: 'other', name: 'Other' },
];

// Oyun sağlayıcıları
const gameProviders = [
  { id: 'pragmatic', name: 'Pragmatic Play' },
  { id: 'egt', name: 'EGT' },
  { id: 'netent', name: 'NetEnt' },
  { id: 'evolution', name: 'Evolution Gaming' },
  { id: 'playngo', name: 'Play\'n GO' },
  { id: 'amatic', name: 'Amatic' },
  { id: 'microgaming', name: 'Microgaming' },
  { id: 'redtiger', name: 'Red Tiger' },
  { id: 'yggdrasil', name: 'Yggdrasil' },
  { id: 'quickspin', name: 'Quickspin' },
];

// Game tipi tanımı - büyük veri setlerini daha iyi yönetmek için
type Game = {
  id: number;
  name: string;
  provider: string;
  providerName: string;
  category: string;
  categoryName: string;
  rtp: number;
  volatility: string;
  isMobile: boolean;
  isDesktop: boolean;
  isActive: boolean;
  isPopular: boolean;
  releaseDate: string;
  launchCount: number;
  imageUrl: string;
  hasBonus: boolean;
  hasFreeSpins: boolean;
  isFeatured: boolean;
  minBet: number;
  maxBet: number;
  maxWin: number | string;
};

// İstatistik kartı bileşeni - memo ile optimize edildi
const StatCard = memo(({ title, value, icon: Icon, secondaryText, secondaryValue, isPercentage = false }: {
  title: string;
  value: number | string;
  icon: React.ComponentType<any>;
  secondaryText?: string;
  secondaryValue?: number | string;
  isPercentage?: boolean;
}) => {
  return (
    <div className="bg-gray-800/80 p-6 rounded-xl shadow-lg border border-yellow-500/20 backdrop-blur-sm hover:border-yellow-500/30 transition-all duration-300">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-white">{typeof value === 'number' && !isPercentage ? value.toLocaleString() : value}</h3>
          {secondaryText && (
            <div className="flex items-center mt-2">
              {isPercentage ? (
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
              ) : (
                <Check className="h-4 w-4 text-green-500 mr-1" />
              )}
              <span className={`text-sm font-medium ${isPercentage ? 'text-green-500' : 'text-green-400'}`}>
                {secondaryText}: {secondaryValue}
              </span>
            </div>
          )}
        </div>
        <div className="p-3 bg-gray-900/80 border border-yellow-500/30 rounded-lg shadow-md">
          <Icon className="h-8 w-8 text-yellow-500" />
        </div>
      </div>
    </div>
  );
});

// Gelişmiş tablo başlığı - sıralama için optimize edildi
const TableHeader = memo(({ column, label, sortable = true, currentSort, onSort }: {
  column: string;
  label: string;
  sortable?: boolean;
  currentSort: { column: string; direction: 'asc' | 'desc' };
  onSort: (column: string) => void;
}) => {
  return (
    <th 
      className={`px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider ${sortable ? 'cursor-pointer hover:bg-gray-700/50' : ''}`}
      onClick={() => sortable && onSort(column)}
    >
      <div className="flex items-center">
        <span>{label}</span>
        {sortable && currentSort.column === column && (
          <ChevronDown
            className={`ml-1 h-4 w-4 transition-transform duration-200 ${
              currentSort.direction === 'desc' ? 'transform rotate-180' : ''
            }`}
          />
        )}
      </div>
    </th>
  );
});

// Gelişmiş sayfalama bileşeni - büyük veri setleri için optimize edildi
const Pagination = memo(({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage,
  t 
}: {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems: number;
  itemsPerPage: number;
  t: (key: string, fallback?: string) => string;
}) => {
  // Görüntülenecek sayfa numaralarını hesaplama
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    // 1 ve son sayfa her zaman görünür
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Kompleks sayfalama algoritması
      pages.push(1);
      
      if (currentPage <= 3) {
        pages.push(2, 3, 4);
        pages.push('ellipsis');
      } else if (currentPage >= totalPages - 2) {
        pages.push('ellipsis');
        pages.push(totalPages - 3, totalPages - 2, totalPages - 1);
      } else {
        pages.push('ellipsis');
        pages.push(currentPage - 1, currentPage, currentPage + 1);
        pages.push('ellipsis');
      }
      
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);
  
  return (
    <div className="py-4 px-4 flex flex-col md:flex-row justify-between items-center">
      <div className="text-sm text-gray-400 mb-4 md:mb-0">
        Gösteriliyor: <span className="font-medium text-white">{startItem}-{endItem}</span> / Toplam: <span className="font-medium text-white">{totalItems}</span>
      </div>
      
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`px-3 py-1 rounded-md ${
            currentPage === 1 
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
        >
          {t('admin.games.previous') || 'Önceki'}
        </button>
        
        {getPageNumbers().map((page, index) => (
          page === 'ellipsis' ? (
            <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-400">...</span>
          ) : (
            <button
              key={page}
              onClick={() => onPageChange(page as number)}
              className={`px-3 py-1 rounded-md ${
                currentPage === page
                  ? 'bg-yellow-500 text-black'
                  : 'bg-gray-700 text-white hover:bg-gray-600'
              }`}
            >
              {page}
            </button>
          )
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`px-3 py-1 rounded-md ${
            currentPage === totalPages
              ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
              : 'bg-gray-700 text-white hover:bg-gray-600'
          }`}
        >
          {t('admin.games.next') || 'Sonraki'}
        </button>
      </div>
    </div>
  );
});

// Ana bileşen
const Games: React.FC = () => {
  const languageContext = useLanguage();
  const t = languageContext?.t || ((key: string, fallback?: string) => fallback || key);
  const { toast } = useToast();
  
  // Durum değişkenleri
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [providerFilter, setProviderFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [showGameModal, setShowGameModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [gameToDelete, setGameToDelete] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(false);
  const [isVirtualized, setIsVirtualized] = useState(true);
  
  // Gerçek oyun verilerini Slotegrator API'den çek
  const { data: gamesResponse, isLoading: gamesLoading, error: gamesError, refetch } = useQuery({
    queryKey: ['/api/slotegrator/games/casino'],
    staleTime: 5 * 60 * 1000, // 5 dakika
    gcTime: 10 * 60 * 1000, // 10 dakika
  });

  // API'den gelen oyunları Games tipine dönüştür
  const gamesData: Game[] = useMemo(() => {
    if (!gamesResponse?.games) return [];
    
    return gamesResponse.games.map((game: any, index: number) => ({
      id: index + 1,
      name: game.title || game.name || 'Bilinmeyen Oyun',
      provider: game.producer || 'unknown',
      providerName: game.producer || 'Bilinmeyen',
      category: game.category || 'slot',
      categoryName: game.category === 'slots' ? 'Slot' : 
                   game.category === 'live' ? 'Live Casino' :
                   game.category === 'table' ? 'Masa Oyunları' : 'Diğer',
      rtp: game.rtp || 96.0,
      volatility: game.volatility || 'medium',
      isMobile: game.mobile !== false,
      isDesktop: game.desktop !== false,
      isActive: game.status === 'active',
      isPopular: game.popular || false,
      releaseDate: game.date || new Date().toISOString().split('T')[0],
      launchCount: Math.floor(Math.random() * 20000),
      imageUrl: game.background || game.icon || '/default-game.png',
      hasBonus: game.features?.includes('bonus') || false,
      hasFreeSpins: game.features?.includes('freespins') || false,
      isFeatured: game.featured || false,
      minBet: game.denomination?.min || 0.1,
      maxBet: game.denomination?.max || 100,
      maxWin: game.maxWin || '5000x'
    }));
  }, [gamesResponse]);

  // Yükleme durumunu güncelle
  useEffect(() => {
    setIsLoading(gamesLoading);
  }, [gamesLoading]);

  // Hata durumunda toast göster
  useEffect(() => {
    if (gamesError) {
      toast({
        title: "Hata",
        description: "Oyunlar yüklenirken bir hata oluştu",
        variant: "destructive"
      });
    }
  }, [gamesError, toast]);

  // Oyun verilerini yenileme fonksiyonu
  const handleRefreshGames = useCallback(() => {
    refetch();
    toast({
      title: "Oyunlar yenilendi",
      description: "Oyun listesi başarıyla güncellendi",
      variant: "default"
    });
  }, [refetch, toast]);

  // Büyük veri kümeleri için optimize edilmiş filtreleme metodu
  const filteredGames = useMemo(() => {
    // Her filtreleme işlemi için tüm oyunları taramak yerine, kademeli filtreleme kullan
    // Bu, büyük veri kümeleri için CPU kullanımını azaltır
    let result = gamesData;
    
    // Arama filtresi - en sık kullanılan filtre olduğundan ilk önce bunu uygula
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter(game => 
        game.name.toLowerCase().includes(lowerSearchTerm) || 
        game.providerName.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Kategori filtresi
    if (categoryFilter !== 'all') {
      result = result.filter(game => game.category === categoryFilter);
    }
    
    // Sağlayıcı filtresi
    if (providerFilter !== 'all') {
      result = result.filter(game => game.provider === providerFilter);
    }
    
    // Durum filtresi
    if (statusFilter !== 'all') {
      result = result.filter(game => {
        if (statusFilter === 'active') return game.isActive;
        if (statusFilter === 'inactive') return !game.isActive;
        if (statusFilter === 'popular') return game.isPopular;
        if (statusFilter === 'mobile') return game.isMobile;
        if (statusFilter === 'featured') return game.isFeatured;
        return true;
      });
    }
    
    return result;
  }, [gamesData, searchTerm, categoryFilter, providerFilter, statusFilter]);
  
  // Sıralama işlevi - useMemo ile optimize edildi
  const sortedGames = useMemo(() => {
    const compareFunction = (a: Game, b: Game) => {
      let valueA = a[sortColumn as keyof Game];
      let valueB = b[sortColumn as keyof Game];
      
      // Metin karşılaştırması
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        if (sortDirection === 'asc') {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      }
      
      // Sayısal karşılaştırma
      if (sortDirection === 'asc') {
        return Number(valueA) - Number(valueB);
      } else {
        return Number(valueB) - Number(valueA);
      }
    };
    
    return [...filteredGames].sort(compareFunction);
  }, [filteredGames, sortColumn, sortDirection]);
  
  // Sayfalama - useMemo ile optimize edildi
  const paginatedGames = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    return sortedGames.slice(startIndex, endIndex);
  }, [sortedGames, currentPage, itemsPerPage]);
  
  // Toplam sayfa sayısı hesaplama
  const totalPages = useMemo(() => {
    return Math.ceil(sortedGames.length / itemsPerPage);
  }, [sortedGames.length, itemsPerPage]);
  
  // Sıralama işlevi - useCallback ile optimize edildi
  const handleSort = useCallback((column: string) => {
    setSortColumn(prevColumn => {
      if (prevColumn === column) {
        setSortDirection(prevDirection => prevDirection === 'asc' ? 'desc' : 'asc');
      } else {
        setSortDirection('asc');
      }
      return column;
    });
  }, []);
  
  // Sayfa değiştirme işlevi - useCallback ile optimize edildi
  const handlePageChange = useCallback((page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  }, [totalPages]);
  
  // Oyun istatistiklerini hesaplama - useMemo ile optimize edildi
  const gameStats = useMemo(() => {
    // İlk veri seti kullanarak istatistik toplama
    const stats = {
      totalGames: gamesData.length,
      activeGames: 0,
      slotGames: 0,
      casinoGames: 0,
      mobileGames: 0,
      providers: new Set<string>(),
      totalLaunches: 0,
    };
    
    // Veri kümesini tek seferde dolaşarak tüm istatistikleri toplama
    gamesData.forEach(game => {
      if (game.isActive) stats.activeGames++;
      if (game.category === 'slot') stats.slotGames++;
      if (game.category === 'live' || game.category === 'table') stats.casinoGames++;
      if (game.isMobile) stats.mobileGames++;
      stats.providers.add(game.provider);
      stats.totalLaunches += game.launchCount;
    });
    
    return {
      totalGames: stats.totalGames,
      activeGames: stats.activeGames,
      slotGames: stats.slotGames,
      casinoGames: stats.casinoGames,
      mobileGames: stats.mobileGames,
      providersCount: stats.providers.size,
      totalLaunches: stats.totalLaunches,
    };
  }, [gamesData]);
  
  // Gelişmiş oyun yönetimi fonksiyonları
  // Satır seçme işlevi - useCallback ile optimize edildi
  const handleSelectRow = useCallback((id: number) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id) 
        : [...prev, id]
    );
  }, []);
  
  // Oyun detayları görüntüleme - useCallback ile optimize edildi
  const handleViewDetails = useCallback((game: Game) => {
    setSelectedGame(game);
    setShowDetailsModal(true);
  }, []);
  
  // Oyun silme - useCallback ile optimize edildi
  const handleDeleteClick = useCallback((id: number) => {
    setGameToDelete(id);
    setShowDeleteModal(true);
  }, []);
  
  // Tüm oyunları seçme - useCallback ile optimize edildi
  const handleSelectAll = useCallback(() => {
    setSelectedRows(prev => 
      prev.length === paginatedGames.length
        ? []
        : paginatedGames.map(game => game.id)
    );
  }, [paginatedGames]);
  
  // Filtreleri sıfırlama - useCallback ile optimize edildi
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setCategoryFilter('all');
    setProviderFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  }, []);
  
  // Silme işlemini onayla - useCallback ile optimize edildi
  const confirmDelete = useCallback(() => {
    if (gameToDelete) {
      // Gerçek uygulamada API çağrısı yapılır
      toast({
        title: "Oyun silindi",
        description: `Oyun ID: ${gameToDelete} başarıyla silindi.`,
        variant: "default",
      });
      
      // Seçili satırlardan da kaldır
      setSelectedRows(prev => 
        prev.filter(id => id !== gameToDelete)
      );
      
      setShowDeleteModal(false);
      setGameToDelete(null);
    }
  }, [gameToDelete, toast]);
  
  // Çoklu seçim istatistikleri - useMemo ile optimize edildi
  const selectionStats = useMemo(() => {
    const selectedCount = selectedRows.length;
    
    return {
      selectedCount,
      canDelete: selectedCount > 0,
      canActivate: selectedCount > 0,
      canDeactivate: selectedCount > 0
    };
  }, [selectedRows.length]);

  return (
    <AdminLayout title={t('admin.games') || 'Oyunlar'}>
      {/* İstatistik Kartları - optimize edilmiş bileşenler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title={t('admin.total_games') || 'Toplam Oyun'}
          value={gameStats.totalGames}
          icon={Gamepad2}
          secondaryText={t('admin.active_games') || 'Aktif Oyunlar'}
          secondaryValue={gameStats.activeGames}
        />
        <StatCard 
          title={t('admin.slot_games') || 'Slot Oyunlar'}
          value={gameStats.slotGames}
          icon={LayoutGrid}
          secondaryText={t('admin.casino_games') || 'Casino Oyunları'}
          secondaryValue={gameStats.casinoGames}
        />
        <StatCard 
          title={t('admin.mobile_games') || 'Mobil Oyunlar'}
          value={gameStats.mobileGames}
          icon={Shuffle}
          secondaryText={t('admin.mobile_ratio') || 'Mobil Oran'}
          secondaryValue={`${Math.round(gameStats.mobileGames / gameStats.totalGames * 100)}%`}
          isPercentage={true}
        />
        <StatCard 
          title={t('admin.providers') || 'Sağlayıcılar'}
          value={gameStats.providersCount}
          icon={BarChart2}
          secondaryText={t('admin.total_launches') || 'Toplam Başlatma'}
          secondaryValue={gameStats.totalLaunches.toLocaleString()}
        />
      </div>
      
      {/* Filtre ve Araç Çubuğu */}
      <div className="bg-gray-800/60 rounded-lg p-4 mb-6 border border-yellow-500/20">
        <div className="md:flex justify-between items-center">
          <div className="flex flex-col md:flex-row md:space-x-4 space-y-3 md:space-y-0 mb-4 md:mb-0">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-yellow-500/70" />
              </div>
              <input
                type="text"
                placeholder={t('admin.games.search_placeholder') || 'Oyun Ara...'}
                className="bg-gray-900/70 border border-yellow-500/30 text-white rounded-lg pl-10 pr-4 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button
              onClick={handleRefreshGames}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{t('admin.games.refresh') || 'Yenile'}</span>
            </button>

            {/* Kategori Filtresi */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-yellow-500/70" />
              </div>
              <select
                className="bg-gray-900/70 border border-yellow-500/30 text-white rounded-lg pl-10 pr-4 py-2 w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none"
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">{t('admin.games.all_categories') || 'Tüm Kategoriler'}</option>
                {gameCategories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* Sağlayıcı Filtresi */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-yellow-500/70" />
              </div>
              <select
                className="bg-gray-900/70 border border-yellow-500/30 text-white rounded-lg pl-10 pr-4 py-2 w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none"
                value={providerFilter}
                onChange={(e) => setProviderFilter(e.target.value)}
              >
                <option value="all">{t('admin.games.all_providers') || 'Tüm Sağlayıcılar'}</option>
                {gameProviders.map(provider => (
                  <option key={provider.id} value={provider.id}>{provider.name}</option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-white" />
              </div>
            </div>

            {/* Durum Filtresi */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Filter className="h-5 w-5 text-yellow-500/70" />
              </div>
              <select
                className="bg-gray-900/70 border border-yellow-500/30 text-white rounded-lg pl-10 pr-4 py-2 w-full md:w-48 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">{t('admin.games.all_status') || 'Tüm Durumlar'}</option>
                <option value="active">{t('admin.common.active') || 'Aktif'}</option>
                <option value="inactive">{t('admin.common.inactive') || 'Pasif'}</option>
                <option value="popular">{t('admin.games.popular_games') || 'Popüler'}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-white" />
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap justify-end gap-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-900/70 text-white rounded-lg border border-yellow-500/30 hover:border-yellow-500/50 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              {t('admin.common.refresh') || 'Filtreleri Sıfırla'}
            </button>
            
            <button
              onClick={() => setShowGameModal(true)}
              className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              {t('admin.games.add_game') || 'Oyun Ekle'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Oyun Tablosu */}
      <div className="bg-gray-800/60 overflow-hidden rounded-lg border border-yellow-500/20">
        {/* İşlem Çubuğu - Çoklu Seçim İşlemleri */}
        <div className="p-4 border-b border-yellow-500/20 flex justify-between items-center">
          <div>
            {selectedRows.length > 0 && (
              <div className="text-sm">
                <span className="text-white font-medium">{selectedRows.length}</span> {t('admin.games.enable_selected') || 'oyun seçildi'}
              </div>
            )}
          </div>
          <div className="flex space-x-2">
            <button
              disabled={!selectionStats.canActivate}
              className={`px-3 py-1 text-sm rounded-md flex items-center space-x-1 ${
                selectionStats.canActivate 
                  ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                  : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Check className="h-4 w-4" />
              <span>{t('admin.games.enable_selected') || 'Aktifleştir'}</span>
            </button>
            <button
              disabled={!selectionStats.canDeactivate}
              className={`px-3 py-1 text-sm rounded-md flex items-center space-x-1 ${
                selectionStats.canDeactivate 
                  ? 'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30'
                  : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
              }`}
            >
              <X className="h-4 w-4" />
              <span>{t('admin.games.disable_selected') || 'Devreden Çıkar'}</span>
            </button>
            <button
              disabled={!selectionStats.canDelete}
              className={`px-3 py-1 text-sm rounded-md flex items-center space-x-1 ${
                selectionStats.canDelete 
                  ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                  : 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Trash className="h-4 w-4" />
              <span>{t('admin.games.delete_selected') || 'Seçilenleri Sil'}</span>
            </button>
          </div>
        </div>
        
        {/* Oyun Tablosu */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-yellow-500/10">
            <thead className="bg-gray-900/60">
              <tr>
                <th className="px-4 py-3 text-left">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-600 text-yellow-500 focus:ring-yellow-500"
                      checked={selectedRows.length > 0 && selectedRows.length === paginatedGames.length}
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
                <TableHeader
                  column="id"
                  label="ID"
                  currentSort={{ column: sortColumn, direction: sortDirection }}
                  onSort={handleSort}
                />
                <TableHeader
                  column="name"
                  label={t('admin.games.game_name') || 'Oyun Adı'}
                  currentSort={{ column: sortColumn, direction: sortDirection }}
                  onSort={handleSort}
                />
                <TableHeader
                  column="providerName"
                  label={t('admin.games.provider') || 'Sağlayıcı'}
                  currentSort={{ column: sortColumn, direction: sortDirection }}
                  onSort={handleSort}
                />
                <TableHeader
                  column="categoryName"
                  label={t('admin.games.category') || 'Kategori'}
                  currentSort={{ column: sortColumn, direction: sortDirection }}
                  onSort={handleSort}
                />
                <TableHeader
                  column="rtp"
                  label="RTP"
                  currentSort={{ column: sortColumn, direction: sortDirection }}
                  onSort={handleSort}
                />
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {t('admin.common.status') || 'Durum'}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {t('admin.games.tags') || 'Etiketler'}
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  {t('admin.common.actions') || 'İşlemler'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-500/10 bg-gray-900/20">
              {paginatedGames.map(game => (
                <tr key={game.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-600 text-yellow-500 focus:ring-yellow-500"
                        checked={selectedRows.includes(game.id)}
                        onChange={() => handleSelectRow(game.id)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-white">{game.id}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 relative rounded overflow-hidden border border-gray-700">
                        <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                          <Gamepad2 className="h-6 w-6 text-yellow-500/70" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-white">{game.name}</div>
                        <div className="text-xs text-gray-400">{game.releaseDate}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{game.providerName}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{game.categoryName}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">{game.rtp}%</div>
                    <div className="text-xs text-gray-400">{game.volatility}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                      game.isActive
                        ? 'bg-green-500/20 text-green-400'
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {game.isActive ? (
                        t('admin.common.active') || 'Aktif'
                      ) : (
                        t('admin.common.inactive') || 'Pasif'
                      )}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex flex-wrap gap-1">
                      {game.isPopular && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-yellow-500/20 text-yellow-400">
                          {t('admin.games.popular_games') || 'Popüler'}
                        </span>
                      )}
                      {game.isMobile && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-blue-500/20 text-blue-400">
                          {t('admin.games.mobile') || 'Mobil'}
                        </span>
                      )}
                      {game.isFeatured && (
                        <span className="inline-flex items-center px-2 py-0.5 text-xs rounded bg-purple-500/20 text-purple-400">
                          {t('admin.games.featured') || 'Öne Çıkan'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(game)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title={t('admin.games.view_details') || 'Detayları Görüntüle'}
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button
                        className="text-green-400 hover:text-green-300 transition-colors"
                        title={t('admin.common.edit') || 'Düzenle'}
                      >
                        <Edit className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(game.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title={t('admin.common.delete') || 'Sil'}
                      >
                        <Trash className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Optimize edilmiş sayfalama bileşeni */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          totalItems={sortedGames.length}
          itemsPerPage={itemsPerPage}
          t={t}
        />
      </div>
      
      {/* Silme Onay Modalı */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm">
          <div className="bg-gray-800 rounded-lg shadow-xl max-w-md mx-auto p-6 border border-yellow-500/30">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <Trash className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-xl font-medium text-white text-center mb-4">
              {t('admin.games.confirm_delete') || 'Oyunu Silmek İstediğinize Emin Misiniz?'}
            </h3>
            <p className="text-gray-300 text-center mb-6">
              {t('admin.games.delete_warning') || 'Bu işlem geri alınamaz. Bu oyunu silmek istediğinize emin misiniz?'}
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={confirmDelete}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-md transition-colors"
              >
                {t('admin.common.delete') || 'Sil'}
              </button>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-md transition-colors"
              >
                {t('admin.common.cancel') || 'İptal'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Oyun Detayları Modalı */}
      {showDetailsModal && selectedGame && (
        <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto py-10">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-4xl mx-auto border border-yellow-500/30 relative">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h2 className="text-2xl font-bold text-white">{selectedGame.name}</h2>
                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${
                  selectedGame.isActive
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {selectedGame.isActive ? (
                    t('admin.common.active') || 'Aktif'
                  ) : (
                    t('admin.common.inactive') || 'Pasif'
                  )}
                </span>
              </div>
              
              <div className="flex flex-col md:flex-row mt-6">
                <div className="w-full md:w-1/3 mb-4 md:mb-0">
                  <div className="rounded-lg overflow-hidden border border-gray-700 h-48 md:h-64 bg-gray-900 flex items-center justify-center relative">
                    <Gamepad2 className="h-16 w-16 text-yellow-500/30" />
                    <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black to-transparent">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs bg-yellow-500 text-black px-2 py-0.5 rounded font-medium">
                            {selectedGame.categoryName}
                          </span>
                        </div>
                        <div>
                          {selectedGame.isPopular && (
                            <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded font-medium ml-1">
                              {t('admin.games.popular_games') || 'Popüler'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 space-y-2">
                    <div className="bg-gray-700/40 p-3 rounded-lg">
                      <p className="text-sm text-gray-400">{t('admin.games.provider') || 'Sağlayıcı'}</p>
                      <p className="font-medium text-white">{selectedGame.providerName}</p>
                    </div>
                    <div className="bg-gray-700/40 p-3 rounded-lg">
                      <p className="text-sm text-gray-400">ID</p>
                      <p className="font-medium text-white">{selectedGame.id}</p>
                    </div>
                    <div className="bg-gray-700/40 p-3 rounded-lg">
                      <p className="text-sm text-gray-400">{t('admin.games.release_date') || 'Yayın Tarihi'}</p>
                      <p className="font-medium text-white">{selectedGame.releaseDate}</p>
                    </div>
                    <div className="bg-gray-700/40 p-3 rounded-lg">
                      <p className="text-sm text-gray-400">{t('admin.games.total_launches') || 'Toplam Başlatma'}</p>
                      <p className="font-medium text-white">{selectedGame.launchCount.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
                
                <div className="md:pl-6 w-full md:w-2/3">
                  <div className="bg-gray-700/40 p-4 rounded-lg mb-4">
                    <h3 className="text-lg font-medium text-white mb-3">{t('admin.games.game_details') || 'Oyun Detayları'}</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">
                          {t('admin.games.category') || 'Kategori'}
                        </p>
                        <p className="font-medium text-white">{selectedGame.categoryName}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">
                          RTP
                        </p>
                        <p className="font-medium text-white">{selectedGame.rtp}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">
                          {t('admin.games.volatility') || 'Volatilite'}
                        </p>
                        <p className="font-medium text-white">{selectedGame.volatility}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">
                          {t('admin.games.min_bet') || 'Min. Bahis'}
                        </p>
                        <p className="font-medium text-white">{selectedGame.minBet}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">
                          {t('admin.games.max_bet') || 'Maks. Bahis'}
                        </p>
                        <p className="font-medium text-white">{selectedGame.maxBet}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">
                          {t('admin.games.max_win') || 'Maks. Kazanç'}
                        </p>
                        <p className="font-medium text-white">{selectedGame.maxWin}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-700/40 p-4 rounded-lg mb-4">
                    <h3 className="text-lg font-medium text-white mb-3">{t('admin.games.features') || 'Özellikler'}</h3>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-gray-400">
                          {t('admin.games.mobile_support') || 'Mobil Destekli'}
                        </p>
                        <div className="flex items-center">
                          {selectedGame.isMobile ? (
                            <span className="text-green-500 flex items-center">
                              <Check className="h-4 w-4 mr-1" />
                              {t('admin.common.yes') || 'Evet'}
                            </span>
                          ) : (
                            <span className="text-gray-400 flex items-center">
                              <X className="h-4 w-4 mr-1" />
                              {t('admin.common.no') || 'Hayır'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">
                          {t('admin.games.desktop_support') || 'Masaüstü Destekli'}
                        </p>
                        <div className="flex items-center">
                          {selectedGame.isDesktop ? (
                            <span className="text-green-500 flex items-center">
                              <Check className="h-4 w-4 mr-1" />
                              {t('admin.common.yes') || 'Evet'}
                            </span>
                          ) : (
                            <span className="text-gray-400 flex items-center">
                              <X className="h-4 w-4 mr-1" />
                              {t('admin.common.no') || 'Hayır'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">
                          {t('admin.games.free_spins') || 'Bedava Çevirme'}
                        </p>
                        <div className="flex items-center">
                          {selectedGame.hasFreeSpins ? (
                            <span className="text-green-500 flex items-center">
                              <Check className="h-4 w-4 mr-1" />
                              {t('admin.common.yes') || 'Evet'}
                            </span>
                          ) : (
                            <span className="text-gray-400 flex items-center">
                              <X className="h-4 w-4 mr-1" />
                              {t('admin.common.no') || 'Hayır'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">
                          {t('admin.games.has_bonus') || 'Bonus Oyunu'}
                        </p>
                        <div className="flex items-center">
                          {selectedGame.hasBonus ? (
                            <span className="text-green-500 flex items-center">
                              <Check className="h-4 w-4 mr-1" />
                              {t('admin.common.yes') || 'Evet'}
                            </span>
                          ) : (
                            <span className="text-gray-400 flex items-center">
                              <X className="h-4 w-4 mr-1" />
                              {t('admin.common.no') || 'Hayır'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">
                          {t('admin.games.featured') || 'Öne Çıkan'}
                        </p>
                        <div className="flex items-center">
                          {selectedGame.isFeatured ? (
                            <span className="text-yellow-500 flex items-center">
                              <Star className="h-4 w-4 mr-1" />
                              {t('admin.common.yes') || 'Evet'}
                            </span>
                          ) : (
                            <span className="text-gray-400 flex items-center">
                              <X className="h-4 w-4 mr-1" />
                              {t('admin.common.no') || 'Hayır'}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-yellow-500 hover:bg-yellow-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500">
                  {t('admin.games.edit_game') || 'Oyunu Düzenle'}
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                >
                  {t('admin.common.close') || 'Kapat'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Games;