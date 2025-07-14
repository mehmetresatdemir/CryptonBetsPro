import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Filter,
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
  Percent,
  Zap,
  Tablet,
  LayoutGrid,
  Calendar,
  DollarSign
} from 'lucide-react';
import OptimizedDataTable, { DataColumn } from '@/components/admin/OptimizedDataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';

// Oyun türleri
const gameCategories = [
  { id: 'all', name: 'Tümü' },
  { id: 'slot', name: 'Slot' },
  { id: 'casino', name: 'Casino' },
  { id: 'live', name: 'Live Casino' },
  { id: 'table', name: 'Table Games' },
  { id: 'poker', name: 'Poker' },
  { id: 'other', name: 'Other' },
];

// Oyun sağlayıcıları
const gameProviders = [
  { id: 'all', name: 'Tümü' },
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

// Oyun durumları
const gameStatuses = [
  { id: 'all', name: 'Tümü' },
  { id: 'active', name: 'Aktif' },
  { id: 'inactive', name: 'Pasif' },
];

// Oyunun volatilitesini formatlama
const formatVolatility = (volatility: string): string => {
  const map: Record<string, string> = {
    low: 'Düşük',
    medium: 'Orta',
    high: 'Yüksek',
  };
  return map[volatility.toLowerCase()] || volatility;
};

// Oyun veri türü
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

export default function OptimizedGames() {
  // 'Optimize Oyunlar' başlığıyla doğru bir şekilde AdminLayout'u çağırıyoruz
  const title = "Optimize Oyunlar";
  const { translate } = useLanguage();
  const { toast } = useToast();
  
  // Tablo durumu
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [sortField, setSortField] = useState<string>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  
  // Filtreleme durumu
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modal durumları
  const [showDeleteModal, setShowDeleteModal] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameIdToDelete, setGameIdToDelete] = useState<number | null>(null);
  
  // Yükleme durumu
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Oyun verilerini gerçek API'den getir
  const { data: gamesData = [], isLoading: isLoadingGames } = useQuery({
    queryKey: ['admin', 'games'],
    queryFn: async () => {
      // Platform henüz açılmadığı için oyun verisi yok
      return [];
    },
    staleTime: 5 * 60 * 1000, // 5 dakika
  });

  // Oyun istatistikleri
  const gameStats = {
    totalGames: 0,
    activeGames: 0,
    popularGames: 0,
    mobileGames: 0,
    featuredGames: 0,
  };

  // Filtre nesnesini oluştur
  const filters = {
    ...(categoryFilter !== 'all' && { category: categoryFilter }),
    ...(providerFilter !== 'all' && { provider: providerFilter }),
    ...(statusFilter !== 'all' && { isActive: statusFilter === 'active' }),
  };

  // Tablo sütunlarını tanımla
  const columns: DataColumn<Game>[] = [
    {
      key: 'id',
      header: 'ID',
      width: 'w-16',
      sortable: true,
      render: (value) => <span>#{value}</span>
    },
    {
      key: 'name',
      header: t('admin.game_name') || 'Oyun Adı',
      sortable: true,
      render: (value, game) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-md overflow-hidden bg-gray-600">
            {game.imageUrl ? (
              <img
                src={game.imageUrl}
                alt={game.name}
                className="h-10 w-10 object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40x40?text=Game';
                }}
              />
            ) : (
              <div className="h-10 w-10 flex items-center justify-center bg-gray-700 text-gray-400">
                <Gamepad2 size={20} />
              </div>
            )}
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-white">{value}</div>
            <div className="text-sm text-gray-400">{game.categoryName}</div>
          </div>
        </div>
      )
    },
    {
      key: 'providerName',
      header: t('admin.provider') || 'Sağlayıcı',
      sortable: true,
    },
    {
      key: 'rtp',
      header: 'RTP',
      sortable: true,
      render: (value) => <span>{value}%</span>
    },
    {
      key: 'volatility',
      header: t('admin.volatility') || 'Volatilite',
      sortable: true,
      render: (value) => formatVolatility(value)
    },
    {
      key: 'isActive',
      header: t('admin.status') || 'Durum',
      sortable: true,
      render: (value) => (
        <span
          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
            value ? 'bg-green-800 text-green-100' : 'bg-red-800 text-red-100'
          }`}
        >
          {value
            ? t('admin.active') || 'Aktif'
            : t('admin.inactive') || 'Pasif'}
        </span>
      )
    },
  ];

  // Sıralama işleyicisi
  const handleSortChange = useCallback((field: string) => {
    setSortField(prevSortField => {
      // Aynı alan için yön değiştir
      if (prevSortField === field) {
        setSortDirection(prevDirection => (prevDirection === 'asc' ? 'desc' : 'asc'));
        return field;
      }
      
      // Farklı alan için varsayılan yönü ayarla ve alanı değiştir
      setSortDirection('asc');
      return field;
    });
  }, []);

  // Oyun seçme
  const handleSelectRow = useCallback((id: number) => {
    setSelectedRows(prevSelected => {
      if (prevSelected.includes(id)) {
        return prevSelected.filter(rowId => rowId !== id);
      } else {
        return [...prevSelected, id];
      }
    });
  }, []);

  // Tüm görünen oyunları seçme
  const handleSelectAll = useCallback(() => {
    // Platform henüz açık olmadığı için oyun yok
    setSelectedRows([]);
  }, []);

  // Filtreleri sıfırlama
  const resetFilters = useCallback(() => {
    setSearchTerm('');
    setCategoryFilter('all');
    setProviderFilter('all');
    setStatusFilter('all');
    setCurrentPage(1);
  }, []);

  // Silme modalını aç
  const handleDeleteClick = useCallback((id: number) => {
    setGameIdToDelete(id);
    setShowDeleteModal(true);
  }, []);

  // Silme işlemini onayla
  const confirmDelete = useCallback(() => {
    if (gameIdToDelete) {
      // Gerçek uygulamada API çağrısı yapılır
      toast({
        title: "Oyun silindi",
        description: `Oyun ID: ${gameIdToDelete} başarıyla silindi.`,
      });
      
      // Seçili satırlardan da kaldır
      setSelectedRows(prev => prev.filter(id => id !== gameIdToDelete));
    }
    
    setShowDeleteModal(false);
    setGameIdToDelete(null);
  }, [gameIdToDelete, toast]);

  // Detay modalını aç - şimdilik devre dışı (oyun yok)
  const handleViewDetails = useCallback(() => {
    // Platform henüz açık olmadığı için detay görüntüleme yok
  }, []);

  // Oyun satırı için işlem düğmelerini render et - platform henüz açık değil
  const renderRowActions = useCallback(() => (
    <div className="flex justify-end space-x-2">
      <button
        onClick={() => handleViewDetails()}
        className="text-yellow-500 hover:text-yellow-400 transition-colors"
        title={t('admin.view') || 'Görüntüle'}
        disabled
      >
        <Eye size={18} />
      </button>
      <button
        className="text-blue-500 hover:text-blue-400 transition-colors"
        title={t('admin.edit') || 'Düzenle'}
        disabled
      >
        <Edit size={18} />
      </button>
      <button
        className="text-red-500 hover:text-red-400 transition-colors"
        title={t('admin.delete') || 'Sil'}
        disabled
      >
        <Trash size={18} />
      </button>
    </div>
  ), [t, handleViewDetails]);

  return (
    <AdminLayout title={title}>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">{t('admin.games_management') || 'Oyun Yönetimi'}</h1>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-black py-2 px-4 rounded-md flex items-center space-x-2 transition-colors"
            // onClick={() => setShowGameModal(true)}
          >
            <PlusCircle size={18} />
            <span>{t('admin.add_game') || 'Oyun Ekle'}</span>
          </button>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg flex flex-col shadow-md">
            <span className="text-gray-400 text-sm">{t('admin.total_games') || 'Toplam Oyun'}</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-bold text-white">{gameStats.totalGames}</span>
              <Gamepad2 className="text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg flex flex-col shadow-md">
            <span className="text-gray-400 text-sm">{t('admin.active_games') || 'Aktif Oyunlar'}</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-bold text-white">{gameStats.activeGames}</span>
              <div className="text-xs text-gray-400">
                {`${Math.round((gameStats.activeGames / gameStats.totalGames) * 100)}%`}
              </div>
              <Check className="text-green-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg flex flex-col shadow-md">
            <span className="text-gray-400 text-sm">{t('admin.popular_games') || 'Popüler Oyunlar'}</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-bold text-white">{gameStats.popularGames}</span>
              <div className="text-xs text-gray-400">
                {`${Math.round((gameStats.popularGames / gameStats.totalGames) * 100)}%`}
              </div>
              <Star className="text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg flex flex-col shadow-md">
            <span className="text-gray-400 text-sm">{t('admin.mobile_games') || 'Mobil Oyunlar'}</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-bold text-white">{gameStats.mobileGames}</span>
              <div className="text-xs text-gray-400">
                {`${Math.round((gameStats.mobileGames / gameStats.totalGames) * 100)}%`}
              </div>
              <Tablet className="text-blue-500" />
            </div>
          </div>
          
          <div className="bg-gray-800 p-4 rounded-lg flex flex-col shadow-md">
            <span className="text-gray-400 text-sm">{t('admin.featured_games') || 'Öne Çıkan Oyunlar'}</span>
            <div className="flex items-end justify-between mt-2">
              <span className="text-2xl font-bold text-white">{gameStats.featuredGames}</span>
              <div className="text-xs text-gray-400">
                {`${Math.round((gameStats.featuredGames / gameStats.totalGames) * 100)}%`}
              </div>
              <LayoutGrid className="text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filtreler */}
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-400 mb-1">
                {t('admin.search') || 'Ara'}
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search size={16} className="text-gray-400" />
                </div>
                <Input
                  type="text"
                  id="search"
                  placeholder={t('admin.search_games') || 'Oyunlarda ara...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-400 mb-1">
                {t('admin.category') || 'Kategori'}
              </label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder={t('admin.select_category') || 'Kategori Seç'} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {gameCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="hover:bg-gray-700">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="provider" className="block text-sm font-medium text-gray-400 mb-1">
                {t('admin.provider') || 'Sağlayıcı'}
              </label>
              <Select value={providerFilter} onValueChange={setProviderFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder={t('admin.select_provider') || 'Sağlayıcı Seç'} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {gameProviders.map((provider) => (
                    <SelectItem key={provider.id} value={provider.id} className="hover:bg-gray-700">
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-400 mb-1">
                {t('admin.status') || 'Durum'}
              </label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder={t('admin.select_status') || 'Durum Seç'} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  {gameStatuses.map((status) => (
                    <SelectItem key={status.id} value={status.id} className="hover:bg-gray-700">
                      {status.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <button
              onClick={resetFilters}
              className="text-sm px-3 py-1 rounded-md bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors mr-2"
            >
              {t('admin.reset_filters') || 'Filtreleri Sıfırla'}
            </button>
            
            <button
              className="text-sm px-3 py-1 rounded-md bg-yellow-500 text-black hover:bg-yellow-600 transition-colors flex items-center space-x-1"
            >
              <Filter size={16} />
              <span>{t('admin.apply_filters') || 'Filtreleri Uygula'}</span>
            </button>
          </div>
        </div>

        {/* Oyun Tablosu */}
        <OptimizedDataTable
          data={gamesData}
          columns={columns}
          filters={filters}
          searchTerm={searchTerm}
          searchFields={['name', 'providerName', 'categoryName']}
          sortField={sortField}
          sortDirection={sortDirection}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onSortChange={handleSortChange}
          selectedRows={selectedRows}
          onRowSelect={handleSelectRow}
          onSelectAll={handleSelectAll}
          getRowId={(game) => game.id}
          isLoading={isLoadingGames}
          renderRowActions={renderRowActions}
          emptyMessage={t('admin.no_games_found') || 'Oyun bulunamadı'}
          className="shadow-md"
          translations={{
            showing: t('admin.showing') || 'Gösteriliyor',
            to: t('admin.to') || '-',
            of: t('admin.of') || '/',
            items: t('admin.items') || 'öğe',
            previous: t('admin.previous') || 'Önceki',
            next: t('admin.next') || 'Sonraki',
            first: t('admin.first') || 'İlk',
            last: t('admin.last') || 'Son',
            noData: t('admin.no_games_found') || 'Oyun bulunamadı',
            loading: t('admin.loading') || 'Yükleniyor...',
          }}
        />
      </div>

      {/* Silme Modalı */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-gray-800 text-white border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">{t('admin.confirm_delete') || 'Silmeyi Onayla'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>{t('admin.delete_game_confirm') || 'Bu oyunu silmek istediğinizden emin misiniz?'}</p>
            <p className="text-sm text-gray-400 mt-2">{t('admin.delete_permanent') || 'Bu işlem geri alınamaz.'}</p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
            >
              {t('admin.cancel') || 'İptal'}
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
            >
              {t('admin.delete') || 'Sil'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detay Modalı */}
      {showDetailsModal && selectedGame && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="bg-gray-800 text-white border-gray-700 max-w-3xl">
            <DialogHeader>
              <DialogTitle className="text-white">{selectedGame.name}</DialogTitle>
            </DialogHeader>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
              {/* Sol Kolon - Resim */}
              <div className="flex flex-col items-center">
                <div className="w-full h-40 rounded-md overflow-hidden bg-gray-700 mb-4">
                  {selectedGame.imageUrl ? (
                    <img 
                      src={selectedGame.imageUrl}
                      alt={selectedGame.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Game';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                      <Gamepad2 size={48} />
                    </div>
                  )}
                </div>
                
                <div className="w-full space-y-2">
                  <div className="flex justify-between items-center bg-gray-700 p-2 rounded-md">
                    <span className="text-sm text-gray-400">{t('admin.status') || 'Durum'}:</span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        selectedGame.isActive
                          ? 'bg-green-800 text-green-100'
                          : 'bg-red-800 text-red-100'
                      }`}
                    >
                      {selectedGame.isActive
                        ? t('admin.active') || 'Aktif'
                        : t('admin.inactive') || 'Pasif'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-gray-700 p-2 rounded-md">
                    <span className="text-sm text-gray-400">{t('admin.popular') || 'Popüler'}:</span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        selectedGame.isPopular
                          ? 'bg-yellow-800 text-yellow-100'
                          : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {selectedGame.isPopular
                        ? t('admin.yes') || 'Evet'
                        : t('admin.no') || 'Hayır'}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center bg-gray-700 p-2 rounded-md">
                    <span className="text-sm text-gray-400">{t('admin.featured') || 'Öne Çıkan'}:</span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        selectedGame.isFeatured
                          ? 'bg-purple-800 text-purple-100'
                          : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {selectedGame.isFeatured
                        ? t('admin.yes') || 'Evet'
                        : t('admin.no') || 'Hayır'}
                    </span>
                  </div>
                </div>
              </div>
              
              {/* Orta Kolon - Genel Bilgiler */}
              <div className="space-y-4">
                <h3 className="text-yellow-500 text-lg font-medium border-b border-gray-700 pb-2">
                  {t('admin.game_details') || 'Oyun Detayları'}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-start">
                    <span className="text-gray-400 min-w-[130px]">{t('admin.id') || 'ID'}:</span>
                    <span className="text-white">#{selectedGame.id}</span>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="text-gray-400 min-w-[130px]">{t('admin.provider') || 'Sağlayıcı'}:</span>
                    <span className="text-white">{selectedGame.providerName}</span>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="text-gray-400 min-w-[130px]">{t('admin.category') || 'Kategori'}:</span>
                    <span className="text-white">{selectedGame.categoryName}</span>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="text-gray-400 min-w-[130px]">{t('admin.release_date') || 'Çıkış Tarihi'}:</span>
                    <span className="text-white">{new Date(selectedGame.releaseDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="text-gray-400 min-w-[130px]">{t('admin.launch_count') || 'Oynanma Sayısı'}:</span>
                    <span className="text-white">{selectedGame.launchCount.toLocaleString()}</span>
                  </div>
                  
                  <div className="flex items-start">
                    <span className="text-gray-400 min-w-[130px]">{t('admin.platforms') || 'Platformlar'}:</span>
                    <div className="flex flex-col">
                      <div className="flex items-center">
                        <span className={`w-3 h-3 rounded-full mr-2 ${selectedGame.isDesktop ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-white">{t('admin.desktop') || 'Masaüstü'}</span>
                      </div>
                      <div className="flex items-center mt-1">
                        <span className={`w-3 h-3 rounded-full mr-2 ${selectedGame.isMobile ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        <span className="text-white">{t('admin.mobile') || 'Mobil'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Sağ Kolon - Teknik Bilgiler */}
              <div className="space-y-4">
                <h3 className="text-yellow-500 text-lg font-medium border-b border-gray-700 pb-2">
                  {t('admin.technical_info') || 'Teknik Bilgiler'}
                </h3>
                
                <div className="space-y-2">
                  <div className="flex items-center">
                    <span className="text-gray-400 min-w-[130px]">RTP:</span>
                    <div className="flex items-center">
                      <span className="text-white">{selectedGame.rtp}%</span>
                      <Percent size={16} className="text-yellow-500 ml-1" />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-gray-400 min-w-[130px]">{t('admin.volatility') || 'Volatilite'}:</span>
                    <div className="flex items-center">
                      <span className="text-white">{formatVolatility(selectedGame.volatility)}</span>
                      <Zap size={16} className="text-yellow-500 ml-1" />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-gray-400 min-w-[130px]">{t('admin.min_bet') || 'Min. Bahis'}:</span>
                    <div className="flex items-center">
                      <span className="text-white">{selectedGame.minBet}</span>
                      <DollarSign size={16} className="text-yellow-500 ml-1" />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-gray-400 min-w-[130px]">{t('admin.max_bet') || 'Max. Bahis'}:</span>
                    <div className="flex items-center">
                      <span className="text-white">{selectedGame.maxBet}</span>
                      <DollarSign size={16} className="text-yellow-500 ml-1" />
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-gray-400 min-w-[130px]">{t('admin.max_win') || 'Max. Kazanç'}:</span>
                    <div className="flex items-center">
                      <span className="text-white">{selectedGame.maxWin}</span>
                      <DollarSign size={16} className="text-yellow-500 ml-1" />
                    </div>
                  </div>
                  
                  <div className="pt-4 space-y-2">
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-2 ${selectedGame.hasBonus ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-white">{t('admin.bonus_rounds') || 'Bonus Turları'}</span>
                    </div>
                    
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-2 ${selectedGame.hasFreeSpins ? 'bg-green-500' : 'bg-red-500'}`}></span>
                      <span className="text-white">{t('admin.free_spins') || 'Bedava Dönüşler'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowDetailsModal(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
              >
                {t('admin.close') || 'Kapat'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}