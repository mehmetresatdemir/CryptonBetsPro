import React, { useState, useMemo } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  ImageIcon, 
  Plus, 
  Edit, 
  Trash, 
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Eye,
  Upload,
  Link,
  Save,
  CalendarIcon,
  Globe,
  LayoutDashboard,
  X,
  CheckSquare,
  Check,
  Search,
  Filter,
  Download,
  RefreshCw,
  BarChart3,
  MousePointer,
  TrendingUp,
  Settings,
  Copy,
  Archive,
  Monitor,
  Smartphone,
  Target,
  Users,
  Calendar,
  Clock,
  ExternalLink,
  Zap
} from 'lucide-react';

// Banner types
interface Banner {
  id: number;
  title: string;
  description?: string;
  image_url: string;
  mobile_image_url?: string;
  link_url?: string;
  type: 'slider' | 'popup' | 'sidebar' | 'header' | 'footer';
  position: number;
  status: 'active' | 'inactive' | 'scheduled' | 'expired';
  language: 'tr' | 'en' | 'ka';
  page_location: 'home' | 'slot' | 'casino' | 'bonuses' | 'all';
  target_audience: 'all' | 'new_users' | 'vip' | 'inactive';
  min_vip_level: number;
  max_vip_level: number;
  impressions: number;
  clicks: number;
  start_date?: string;
  end_date?: string;
  display_priority: number;
  display_frequency: 'always' | 'once_per_session' | 'once_per_day';
  popup_delay: number;
  is_active: boolean;
  created_by?: number;
  updated_by?: number;
  created_at?: string;
  updated_at?: string;
}

interface BannerStats {
  totalBanners: number;
  activeBanners: number;
  inactiveBanners: number;
  scheduledBanners: number;
  totalImpressions: number;
  totalClicks: number;
  overallCtr: number;
}

const BannerManagement: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Admin erişimi için token kontrolü
  React.useEffect(() => {
    const checkAdminAccess = async () => {
      let token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      
      if (!token) {
        console.log('🔐 Token bulunamadı, test kullanıcısı ile giriş yapılıyor...');
        
        try {
          // Test kullanıcısı ile otomatik giriş
          const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: 'test', password: 'test123' }),
            credentials: 'include'
          });
          
          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            localStorage.setItem('auth_token', data.token);
            console.log('✅ Otomatik giriş başarılı, token kaydedildi');
            // Sayfayı yenile
            window.location.reload();
          }
        } catch (error) {
          console.error('❌ Otomatik giriş hatası:', error);
        }
      } else {
        console.log('✅ Token mevcut:', token.substring(0, 20) + '...');
      }
    };
    
    checkAdminAccess();
  }, []);
  
  // State management
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [pageFilter, setPageFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedBanners, setSelectedBanners] = useState<number[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [showAnalytics, setShowAnalytics] = useState(false);
  
  // Form state
  const [bannerForm, setBannerForm] = useState({
    title: '',
    description: '',
    image_url: '',
    mobile_image_url: '',
    link_url: '',
    type: 'slider' as Banner['type'],
    position: 1,
    status: 'active' as Banner['status'],
    language: 'tr' as Banner['language'],
    page_location: 'home' as Banner['page_location'],
    target_audience: 'all' as Banner['target_audience'],
    min_vip_level: 0,
    max_vip_level: 10,
    start_date: '',
    end_date: '',
    display_priority: 1,
    display_frequency: 'always' as Banner['display_frequency'],
    popup_delay: 3000,
    is_active: true
  });

  // Fetch banners with React Query
  const { 
    data: bannersResponse, 
    isLoading, 
    error: bannersError,
    refetch 
  } = useQuery({
    queryKey: ['/api/admin/banners', currentPage, searchTerm, activeTab, statusFilter, languageFilter, pageFilter],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        search: searchTerm,
        type: activeTab,
        status: statusFilter,
        language: languageFilter,
        pageLocation: pageFilter
      });
      
      // Token'ı farklı kaynaklardan al
      const token = localStorage.getItem('token') || localStorage.getItem('auth_token');
      console.log('🔍 Banner API Token kontrolü:', token ? 'Token mevcut' : 'Token yok');
      
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('📤 Authorization header eklendi');
      } else {
        console.warn('⚠️ Token bulunamadı - giriş yapmış kullanıcı gerekli');
      }
      
      const response = await fetch(`/api/admin/banners?${params}`, {
        headers,
        credentials: 'include'
      });
      
      console.log('📥 Banner API yanıtı:', response.status, response.statusText);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.error('🔒 Yetki hatası - kullanıcı giriş yapmamış veya admin değil');
          throw new Error('Admin yetkisi gerekli - lütfen giriş yapın');
        }
        throw new Error(`API hatası: ${response.status}`);
      }
      
      return response.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000
  });

  const banners = bannersResponse?.data || [];
  const bannerStats = bannersResponse?.stats || {
    totalBanners: 0,
    activeBanners: 0,
    inactiveBanners: 0,
    scheduledBanners: 0,
    totalImpressions: 0,
    totalClicks: 0,
    overallCtr: 0
  };
  const pagination = bannersResponse?.pagination || {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  };

  // Create banner mutation
  const createBannerMutation = useMutation({
    mutationFn: async (bannerData: typeof bannerForm) => {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/admin/banners', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(bannerData)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create banner');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/banners'] });
      setShowCreateModal(false);
      resetForm();
      toast({
        title: 'Banner Oluşturuldu',
        description: 'Banner başarıyla oluşturuldu',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Banner oluşturulamadı',
        variant: 'destructive'
      });
    }
  });

  // Update banner mutation
  const updateBannerMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof bannerForm }) => {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/admin/banners/${id}`, {
        method: 'PUT',
        headers,
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update banner');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/banners'] });
      setEditingBanner(null);
      resetForm();
      toast({
        title: 'Banner Güncellendi',
        description: 'Banner başarıyla güncellendi',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Banner güncellenemedi',
        variant: 'destructive'
      });
    }
  });

  // Delete banner mutation
  const deleteBannerMutation = useMutation({
    mutationFn: async (bannerId: number) => {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/admin/banners/${bannerId}`, {
        method: 'DELETE',
        headers,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete banner');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/banners'] });
      toast({
        title: 'Banner Silindi',
        description: 'Banner başarıyla silindi',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Banner silinemedi',
        variant: 'destructive'
      });
    }
  });

  // Bulk action mutation
  const bulkActionMutation = useMutation({
    mutationFn: async ({ action, bannerIds }: { action: string; bannerIds: number[] }) => {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/admin/banners/bulk', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify({ action, bannerIds })
      });
      
      if (!response.ok) {
        throw new Error('Failed to perform bulk action');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/banners'] });
      setSelectedBanners([]);
      toast({
        title: 'Toplu İşlem Tamamlandı',
        description: 'Seçilen bannerlar başarıyla işlendi',
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Toplu işlem başarısız',
        variant: 'destructive'
      });
    }
  });

  // Helper functions
  const resetForm = () => {
    setBannerForm({
      title: '',
      description: '',
      image_url: '',
      mobile_image_url: '',
      link_url: '',
      type: 'slider',
      position: 1,
      status: 'active',
      language: 'tr',
      page_location: 'home',
      target_audience: 'all',
      min_vip_level: 0,
      max_vip_level: 10,
      start_date: '',
      end_date: '',
      display_priority: 1,
      display_frequency: 'always',
      popup_delay: 3000,
      is_active: true
    });
  };

  const handleEdit = (banner: Banner) => {
    setBannerForm({
      title: banner.title,
      description: banner.description || '',
      image_url: banner.image_url,
      mobile_image_url: banner.mobile_image_url || '',
      link_url: banner.link_url || '',
      type: banner.type,
      position: banner.position,
      status: banner.status,
      language: banner.language,
      page_location: banner.page_location,
      target_audience: banner.target_audience,
      min_vip_level: banner.min_vip_level,
      max_vip_level: banner.max_vip_level,
      start_date: banner.start_date || '',
      end_date: banner.end_date || '',
      display_priority: banner.display_priority,
      display_frequency: banner.display_frequency,
      popup_delay: banner.popup_delay,
      is_active: banner.is_active
    });
    setEditingBanner(banner);
  };

  const handleSubmit = () => {
    if (!bannerForm.title || !bannerForm.image_url) {
      toast({
        title: 'Hata',
        description: 'Başlık ve resim URL\'si gereklidir',
        variant: 'destructive'
      });
      return;
    }

    if (editingBanner) {
      updateBannerMutation.mutate({ id: editingBanner.id, data: bannerForm });
    } else {
      createBannerMutation.mutate(bannerForm);
    }
  };

  const handleDelete = (bannerId: number) => {
    if (confirm('Bu banner\'ı silmek istediğinizden emin misiniz?')) {
      deleteBannerMutation.mutate(bannerId);
    }
  };

  const handleBulkAction = (action: string) => {
    if (selectedBanners.length === 0) {
      toast({
        title: 'Uyarı',
        description: 'Lütfen en az bir banner seçin',
        variant: 'destructive'
      });
      return;
    }

    if (action === 'delete' && !confirm('Seçilen banner\'ları silmek istediğinizden emin misiniz?')) {
      return;
    }

    bulkActionMutation.mutate({ action, bannerIds: selectedBanners });
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'Aktif', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      inactive: { label: 'Pasif', className: 'bg-gray-500/20 text-gray-400 border-gray-500/30' },
      scheduled: { label: 'Planlanmış', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      expired: { label: 'Süresi Dolmuş', className: 'bg-red-500/20 text-red-400 border-red-500/30' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return (
      <Badge className={`border ${config.className}`}>
        {config.label}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const typeConfig = {
      slider: { label: 'Ana Slider', icon: Monitor, className: 'bg-purple-500/20 text-purple-400' },
      popup: { label: 'Popup', icon: Zap, className: 'bg-orange-500/20 text-orange-400' },
      sidebar: { label: 'Kenar', icon: LayoutDashboard, className: 'bg-blue-500/20 text-blue-400' },
      header: { label: 'Üst Banner', icon: ArrowUpDown, className: 'bg-green-500/20 text-green-400' },
      footer: { label: 'Alt Banner', icon: ArrowUpDown, className: 'bg-gray-500/20 text-gray-400' }
    };

    const config = typeConfig[type as keyof typeof typeConfig] || typeConfig.slider;
    const IconComponent = config.icon;

    return (
      <Badge className={`border border-gray-600 ${config.className} flex items-center gap-1`}>
        <IconComponent className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const calculateCTR = (impressions: number, clicks: number) => {
    if (impressions === 0) return '0%';
    return ((clicks / impressions) * 100).toFixed(2) + '%';
  };

  // Filter banners based on active tab
  const filteredBanners = useMemo(() => {
    if (activeTab === 'all') return banners;
    return banners.filter((banner: Banner) => banner.type === activeTab);
  }, [banners, activeTab]);

  if (isLoading) {
    return (
      <AdminLayout title="Banner Yönetimi">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-400">Banner verileri yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Banner Yönetimi">
      <div className="space-y-6">
        {/* Header with Statistics */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Banner Yönetimi</h1>
            <p className="text-gray-400">Slider, popup ve diğer banner tiplerini yönetin</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => {
                setPageFilter('casino');
                setBannerForm(prev => ({ ...prev, page_location: 'casino' }));
                setShowCreateModal(true);
              }}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <Plus className="h-4 w-4 mr-2" />
              Casino Banner Ekle
            </Button>
            
            <Button 
              onClick={() => setPageFilter('casino')}
              variant="outline"
              className={`${pageFilter === 'casino' ? 'bg-blue-600 text-white' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
            >
              <Target className="h-4 w-4 mr-2" />
              Casino Bannerları
            </Button>
            
            <Button 
              onClick={() => setShowCreateModal(true)}
              className="bg-yellow-600 hover:bg-yellow-700 text-black"
            >
              <Plus className="h-4 w-4 mr-2" />
              Yeni Banner
            </Button>
            
            <Button 
              onClick={() => setShowAnalytics(!showAnalytics)}
              variant="outline"
              className="bg-gray-800 border-gray-600 hover:bg-gray-700"
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
            
            <Button 
              onClick={() => refetch()}
              variant="outline"
              className="bg-gray-800 border-gray-600 hover:bg-gray-700"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Yenile
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Toplam Banner</p>
                  <p className="text-2xl font-bold text-white">{bannerStats.totalBanners}</p>
                </div>
                <Monitor className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Aktif Bannerlar</p>
                  <p className="text-2xl font-bold text-white">{bannerStats.activeBanners}</p>
                </div>
                <CheckSquare className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Toplam Görüntüleme</p>
                  <p className="text-2xl font-bold text-white">{bannerStats.totalImpressions.toLocaleString()}</p>
                </div>
                <Eye className="h-8 w-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Toplam Tıklama</p>
                  <p className="text-2xl font-bold text-white">{bannerStats.totalClicks.toLocaleString()}</p>
                </div>
                <MousePointer className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Banner ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-40 bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Durum" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                  <SelectItem value="scheduled">Planlanmış</SelectItem>
                  <SelectItem value="expired">Süresi Dolmuş</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={languageFilter} onValueChange={setLanguageFilter}>
                <SelectTrigger className="w-32 bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Dil" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">Tüm Diller</SelectItem>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="en">İngilizce</SelectItem>
                  <SelectItem value="ka">Gürcüce</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={pageFilter} onValueChange={setPageFilter}>
                <SelectTrigger className="w-40 bg-gray-700 border-gray-600">
                  <SelectValue placeholder="Sayfa" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">Tüm Sayfalar</SelectItem>
                  <SelectItem value="home">Ana Sayfa</SelectItem>
                  <SelectItem value="slot">Slot</SelectItem>
                  <SelectItem value="casino">Casino</SelectItem>
                  <SelectItem value="bonuses">Bonuslar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Banner Type Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 bg-gray-800">
            <TabsTrigger value="all" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
              Tümü
            </TabsTrigger>
            <TabsTrigger value="slider" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
              Slider
            </TabsTrigger>
            <TabsTrigger value="popup" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
              Popup
            </TabsTrigger>
            <TabsTrigger value="sidebar" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
              Kenar
            </TabsTrigger>
            <TabsTrigger value="header" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
              Üst
            </TabsTrigger>
            <TabsTrigger value="footer" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-black">
              Alt
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-6">
            {/* Bulk Actions */}
            {selectedBanners.length > 0 && (
              <Card className="bg-gray-800/60 border-yellow-500/30 mb-4">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-yellow-400">
                      {selectedBanners.length} banner seçildi
                    </span>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleBulkAction('activate')}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Aktifleştir
                      </Button>
                      <Button
                        onClick={() => handleBulkAction('deactivate')}
                        size="sm"
                        variant="outline"
                        className="border-gray-600"
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Pasifleştir
                      </Button>
                      <Button
                        onClick={() => handleBulkAction('delete')}
                        size="sm"
                        variant="destructive"
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Sil
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Banner List */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredBanners.map((banner: Banner) => (
                <Card key={banner.id} className="bg-gray-800 border-gray-700 hover:border-yellow-500/30 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Checkbox
                          checked={selectedBanners.includes(banner.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedBanners([...selectedBanners, banner.id]);
                            } else {
                              setSelectedBanners(selectedBanners.filter(id => id !== banner.id));
                            }
                          }}
                        />
                        <div>
                          <CardTitle className="text-lg text-white">{banner.title}</CardTitle>
                          {banner.description && (
                            <p className="text-sm text-gray-400 mt-1">{banner.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          onClick={() => handleEdit(banner)}
                          size="sm"
                          variant="outline"
                          className="border-gray-600 hover:border-yellow-500"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          onClick={() => handleDelete(banner.id)}
                          size="sm"
                          variant="outline"
                          className="border-gray-600 hover:border-red-500 hover:text-red-400"
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-3">
                    <div className="space-y-3">
                      {/* Banner Preview */}
                      <div className="relative">
                        <img
                          src={banner.image_url}
                          alt={banner.title}
                          className="w-full h-32 object-cover rounded-md bg-gray-700"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzM3NDE1MSIvPjx0ZXh0IHg9IjEwMCIgeT0iNTUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzlDQTNBRiIgdGV4dC1hbmNob3I9Im1pZGRsZSI+Tm8gSW1hZ2U8L3RleHQ+PC9zdmc+';
                          }}
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          {getTypeBadge(banner.type)}
                        </div>
                        {banner.link_url && (
                          <div className="absolute bottom-2 right-2">
                            <Badge className="bg-black/70 text-white border-0">
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Link
                            </Badge>
                          </div>
                        )}
                      </div>

                      {/* Banner Info */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(banner.status)}
                          <Badge className="bg-gray-700 text-gray-300 border-gray-600">
                            <Globe className="h-3 w-3 mr-1" />
                            {banner.language.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-400">
                          <Target className="h-3 w-3" />
                          Pos: {banner.position}
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="bg-gray-700/50 rounded-md p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Görüntüleme</span>
                            <span className="text-white font-medium">{banner.impressions.toLocaleString()}</span>
                          </div>
                        </div>
                        <div className="bg-gray-700/50 rounded-md p-2">
                          <div className="flex items-center justify-between">
                            <span className="text-gray-400">Tıklama</span>
                            <span className="text-white font-medium">{banner.clicks.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* CTR */}
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">Tıklama Oranı (CTR)</span>
                        <span className="text-yellow-400 font-medium">
                          {calculateCTR(banner.impressions, banner.clicks)}
                        </span>
                      </div>

                      {/* Dates */}
                      {(banner.start_date || banner.end_date) && (
                        <div className="text-xs text-gray-500 border-t border-gray-700 pt-2">
                          {banner.start_date && (
                            <div>Başlangıç: {new Date(banner.start_date).toLocaleDateString('tr-TR')}</div>
                          )}
                          {banner.end_date && (
                            <div>Bitiş: {new Date(banner.end_date).toLocaleDateString('tr-TR')}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredBanners.length === 0 && (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-8 text-center">
                  <ImageIcon className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">Banner bulunamadı</h3>
                  <p className="text-gray-400 mb-4">
                    {activeTab === 'all' ? 'Henüz banner eklenmemiş' : `${activeTab} tipinde banner bulunamadı`}
                  </p>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-yellow-600 hover:bg-yellow-700 text-black"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    İlk Banner'ı Oluştur
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Create/Edit Modal */}
        <Dialog open={showCreateModal || !!editingBanner} onOpenChange={(open) => {
          if (!open) {
            setShowCreateModal(false);
            setEditingBanner(null);
            resetForm();
          }
        }}>
          <DialogContent className="max-w-4xl bg-gray-800 border-gray-700 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                {editingBanner ? 'Banner Düzenle' : 'Yeni Banner Oluştur'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Başlık *</Label>
                  <Input
                    value={bannerForm.title}
                    onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Banner başlığı"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-300">Banner Tipi *</Label>
                  <Select value={bannerForm.type} onValueChange={(value: Banner['type']) => setBannerForm({...bannerForm, type: value})}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="slider">Ana Slider</SelectItem>
                      <SelectItem value="popup">Popup Banner</SelectItem>
                      <SelectItem value="sidebar">Kenar Banner</SelectItem>
                      <SelectItem value="header">Üst Banner</SelectItem>
                      <SelectItem value="footer">Alt Banner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-gray-300">Açıklama</Label>
                <Textarea
                  value={bannerForm.description}
                  onChange={(e) => setBannerForm({...bannerForm, description: e.target.value})}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Banner açıklaması (opsiyonel)"
                  rows={2}
                />
              </div>

              {/* Images */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Desktop Resim URL *</Label>
                  <Input
                    value={bannerForm.image_url}
                    onChange={(e) => setBannerForm({...bannerForm, image_url: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Banner resim URL'si"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-300">Mobil Resim URL (Opsiyonel)</Label>
                  <Input
                    value={bannerForm.mobile_image_url}
                    onChange={(e) => setBannerForm({...bannerForm, mobile_image_url: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Mobil banner resim URL'si"
                  />
                </div>
              </div>

              {/* Link and Position */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Link URL</Label>
                  <Input
                    value={bannerForm.link_url}
                    onChange={(e) => setBannerForm({...bannerForm, link_url: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="/bonuslar veya harici link"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-300">Pozisyon</Label>
                  <Input
                    type="number"
                    value={bannerForm.position}
                    onChange={(e) => setBannerForm({...bannerForm, position: parseInt(e.target.value) || 1})}
                    className="bg-gray-700 border-gray-600 text-white"
                    min={1}
                  />
                </div>
              </div>

              {/* Settings */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-gray-300">Durum</Label>
                  <Select value={bannerForm.status} onValueChange={(value: Banner['status']) => setBannerForm({...bannerForm, status: value})}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Pasif</SelectItem>
                      <SelectItem value="scheduled">Planlanmış</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-gray-300">Dil</Label>
                  <Select value={bannerForm.language} onValueChange={(value: Banner['language']) => setBannerForm({...bannerForm, language: value})}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="tr">Türkçe</SelectItem>
                      <SelectItem value="en">İngilizce</SelectItem>
                      <SelectItem value="ka">Gürcüce</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label className="text-gray-300">Sayfa Konumu</Label>
                  <Select value={bannerForm.page_location} onValueChange={(value: Banner['page_location']) => setBannerForm({...bannerForm, page_location: value})}>
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-600">
                      <SelectItem value="home">Ana Sayfa</SelectItem>
                      <SelectItem value="slot">Slot Sayfası</SelectItem>
                      <SelectItem value="casino">Casino Sayfası</SelectItem>
                      <SelectItem value="bonuses">Bonuslar Sayfası</SelectItem>
                      <SelectItem value="vip">VIP Sayfası</SelectItem>
                      <SelectItem value="all">Tüm Sayfalar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Başlangıç Tarihi</Label>
                  <Input
                    type="date"
                    value={bannerForm.start_date}
                    onChange={(e) => setBannerForm({...bannerForm, start_date: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                
                <div>
                  <Label className="text-gray-300">Bitiş Tarihi</Label>
                  <Input
                    type="date"
                    value={bannerForm.end_date}
                    onChange={(e) => setBannerForm({...bannerForm, end_date: e.target.value})}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>

              {/* Preview */}
              {bannerForm.image_url && (
                <div>
                  <Label className="text-gray-300">Önizleme</Label>
                  <div className="mt-2 p-4 bg-gray-900 rounded-md border border-gray-600">
                    <img
                      src={bannerForm.image_url}
                      alt="Banner Preview"
                      className="max-w-full h-auto max-h-48 rounded-md object-contain mx-auto"
                      onError={(e) => {
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          e.currentTarget.style.display = 'none';
                          const errorDiv = parent.querySelector('.error-placeholder') as HTMLElement;
                          if (errorDiv) errorDiv.style.display = 'flex';
                        }
                      }}
                    />
                    <div className="error-placeholder hidden flex-col items-center justify-center h-48 text-gray-500">
                      <ImageIcon className="h-12 w-12 mb-2" />
                      <p>Resim yüklenemedi</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Active Switch */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={bannerForm.is_active}
                  onCheckedChange={(checked) => setBannerForm({...bannerForm, is_active: checked})}
                />
                <Label className="text-gray-300">Banner Aktif</Label>
              </div>
            </div>

            {/* Dialog Footer */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingBanner(null);
                  resetForm();
                }}
                className="border-gray-600"
              >
                İptal
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={createBannerMutation.isPending || updateBannerMutation.isPending}
                className="bg-yellow-600 hover:bg-yellow-700 text-black"
              >
                {createBannerMutation.isPending || updateBannerMutation.isPending ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    {editingBanner ? 'Güncelleniyor...' : 'Oluşturuluyor...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {editingBanner ? 'Güncelle' : 'Oluştur'}
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default BannerManagement;