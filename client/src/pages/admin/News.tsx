import React, { useState, useEffect } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit2, 
  Trash2, 
  Eye, 
  Calendar, 
  TrendingUp,
  FileText,
  Users,
  Star,
  AlertCircle,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Target,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Globe,
  Clock,
  Award,
  Download,
  Upload,
  RefreshCw,
  Settings,
  BookOpen,
  Hash,
  Copy,
  ExternalLink
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';

type NewsArticle = {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  featured_image: string;
  author_id: number;
  view_count: number;
  is_featured: boolean;
  is_breaking: boolean;
  tags: string[];
  meta_title: string;
  meta_description: string;
  published_at: string;
  created_at: string;
  updated_at: string;
};

type NewsStats = {
  totalNews: number;
  publishedNews: number;
  draftNews: number;
  featuredNews: number;
  totalViews: number;
  categoryStats: { category: string; count: number }[];
  topViewed: { title: string; view_count: number; slug: string }[];
  monthlyStats: { date: string; count: number }[];
};

const categories = [
  { value: 'platform', label: 'Platform Haberleri' },
  { value: 'bonus', label: 'Bonus ve Promosyonlar' },
  { value: 'güvenlik', label: 'Güvenlik Güncellemeleri' },
  { value: 'uygulama', label: 'Uygulama Haberleri' },
  { value: 'hizmet', label: 'Hizmet Duyuruları' },
  { value: 'tournament', label: 'Turnuva Haberleri' },
  { value: 'general', label: 'Genel Haberler' }
];

export default function AdminNews() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [selectedNews, setSelectedNews] = useState<number[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsArticle | null>(null);
  const [isPreviewDialogOpen, setIsPreviewDialogOpen] = useState(false);
  const [previewNews, setPreviewNews] = useState<NewsArticle | null>(null);
  const [isAnalyticsDialogOpen, setIsAnalyticsDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('list');
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    category: 'general',
    status: 'draft' as 'draft' | 'published' | 'archived',
    featuredImage: '',
    isFeatured: false,
    isBreaking: false,
    tags: [] as string[],
    metaTitle: '',
    metaDescription: '',
    publishedAt: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Haber listesi sorgusu
  const { data: newsData, isLoading } = useQuery({
    queryKey: ['/api/admin/news', { page, search, status: statusFilter, category: categoryFilter }],
    queryFn: () => apiRequest(`/api/admin/news?page=${page}&search=${search}&status=${statusFilter}&category=${categoryFilter}`),
    retry: false,
    meta: {
      requiresAuth: true
    }
  });

  // İstatistikler sorgusu
  const { data: statsData } = useQuery({
    queryKey: ['/api/admin/news/stats'],
    retry: false,
    meta: {
      requiresAuth: true
    }
  });

  // Analytics sorgusu
  const { data: analyticsData } = useQuery({
    queryKey: ['/api/admin/news/analytics'],
    retry: false,
    meta: {
      requiresAuth: true
    }
  });

  // Haber oluşturma mutation
  const createNewsMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/admin/news', { method: 'POST', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/news'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/news/stats'] });
      toast({
        title: "Başarılı",
        description: "Haber başarıyla oluşturuldu",
      });
      setIsCreateDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Haber oluşturulurken hata oluştu",
        variant: "destructive"
      });
    }
  });

  // Haber güncelleme mutation
  const updateNewsMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest(`/api/admin/news/${id}`, { method: 'PUT', body: data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/news'] });
      toast({
        title: "Başarılı",
        description: "Haber başarıyla güncellendi",
      });
      setIsEditDialogOpen(false);
      setEditingNews(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Haber güncellenirken hata oluştu",
        variant: "destructive"
      });
    }
  });

  // Haber silme mutation
  const deleteNewsMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/news/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/news'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/news/stats'] });
      toast({
        title: "Başarılı",
        description: "Haber başarıyla silindi",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Haber silinirken hata oluştu",
        variant: "destructive"
      });
    }
  });

  // Toplu işlemler mutation
  const bulkActionMutation = useMutation({
    mutationFn: ({ action, newsIds }: { action: string; newsIds: number[] }) =>
      apiRequest('/api/admin/news/bulk', { method: 'POST', body: { action, newsIds } }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/news'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/news/stats'] });
      setSelectedNews([]);
      toast({
        title: "Başarılı",
        description: "Toplu işlem başarıyla tamamlandı",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Toplu işlem sırasında hata oluştu",
        variant: "destructive"
      });
    }
  });

  const resetForm = () => {
    setFormData({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      category: 'general',
      status: 'draft',
      featuredImage: '',
      isFeatured: false,
      isBreaking: false,
      tags: [],
      metaTitle: '',
      metaDescription: '',
      publishedAt: ''
    });
  };

  const handleEdit = (news: NewsArticle) => {
    setEditingNews(news);
    setFormData({
      title: news.title,
      slug: news.slug,
      excerpt: news.excerpt,
      content: news.content,
      category: news.category,
      status: news.status,
      featuredImage: news.featured_image || '',
      isFeatured: news.is_featured,
      isBreaking: news.is_breaking,
      tags: news.tags || [],
      metaTitle: news.meta_title || '',
      metaDescription: news.meta_description || '',
      publishedAt: news.published_at || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingNews) {
      updateNewsMutation.mutate({ id: editingNews.id, data: formData });
    } else {
      createNewsMutation.mutate(formData);
    }
  };

  const generateSlug = (title: string) => {
    const slug = title
      .toLowerCase()
      .replace(/ğ/g, 'g')
      .replace(/ü/g, 'u')
      .replace(/ş/g, 's')
      .replace(/ı/g, 'i')
      .replace(/ö/g, 'o')
      .replace(/ç/g, 'c')
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    
    setFormData(prev => ({ ...prev, slug }));
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      published: 'default',
      draft: 'secondary',
      archived: 'outline'
    } as const;

    const labels = {
      published: 'Yayında',
      draft: 'Taslak',
      archived: 'Arşivlendi'
    };

    return (
      <Badge variant={variants[status as keyof typeof variants]}>
        {labels[status as keyof typeof labels]}
      </Badge>
    );
  };

  const news = newsData?.news || [];
  const pagination = newsData?.pagination || {};
  const stats: NewsStats = statsData?.stats || {
    totalNews: 0,
    publishedNews: 0,
    draftNews: 0,
    featuredNews: 0,
    totalViews: 0,
    categoryStats: [],
    topViewed: [],
    monthlyStats: []
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
        {/* Başlık ve İstatistikler */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Haber Yönetimi</h1>
          <p className="text-gray-400">Platform haberlerini ve duyurularını yönetin</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setIsAnalyticsDialogOpen(true)} className="border-gray-600 text-gray-300 hover:bg-gray-700">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-yellow-600 hover:bg-yellow-700 text-black">
            <Plus className="h-4 w-4 mr-2" />
            Yeni Haber
          </Button>
        </div>
      </div>

      {/* Ana Tabs Sistemi */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800">
          <TabsTrigger value="list" className="flex items-center gap-2 data-[state=active]:bg-yellow-600 data-[state=active]:text-black text-gray-300">
            <FileText className="h-4 w-4" />
            Haber Listesi
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2 data-[state=active]:bg-yellow-600 data-[state=active]:text-black text-gray-300">
            <TrendingUp className="h-4 w-4" />
            İstatistikler
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2 data-[state=active]:bg-yellow-600 data-[state=active]:text-black text-gray-300">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="seo" className="flex items-center gap-2 data-[state=active]:bg-yellow-600 data-[state=active]:text-black text-gray-300">
            <Target className="h-4 w-4" />
            SEO Analizi
          </TabsTrigger>
        </TabsList>

        {/* Haber Listesi Tab */}
        <TabsContent value="list" className="space-y-6">
          {/* İstatistik Kartları */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Toplam Haber</CardTitle>
            <FileText className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalNews}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Yayında</CardTitle>
            <Eye className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{stats.publishedNews}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Taslak</CardTitle>
            <Edit2 className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">{stats.draftNews}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Öne Çıkan</CardTitle>
            <Star className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-400">{stats.featuredNews}</div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Toplam Görüntülenme</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtreler ve Arama */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Haber ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 bg-gray-700 border-gray-600 text-white placeholder-gray-400"
                />
              </div>
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-gray-700 border-gray-600 text-gray-300">
                <SelectValue placeholder="Durum seçin" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all" className="text-gray-300 focus:bg-gray-600">Tüm Durumlar</SelectItem>
                <SelectItem value="published" className="text-gray-300 focus:bg-gray-600">Yayında</SelectItem>
                <SelectItem value="draft" className="text-gray-300 focus:bg-gray-600">Taslak</SelectItem>
                <SelectItem value="archived" className="text-gray-300 focus:bg-gray-600">Arşivlendi</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px] bg-gray-700 border-gray-600 text-gray-300">
                <SelectValue placeholder="Kategori seçin" />
              </SelectTrigger>
              <SelectContent className="bg-gray-700 border-gray-600">
                <SelectItem value="all" className="text-gray-300 focus:bg-gray-600">Tüm Kategoriler</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value} className="text-gray-300 focus:bg-gray-600">
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Toplu İşlemler */}
      {selectedNews.length > 0 && (
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">
                {selectedNews.length} haber seçildi
              </span>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => bulkActionMutation.mutate({ action: 'publish', newsIds: selectedNews })}
                >
                  Yayınla
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => bulkActionMutation.mutate({ action: 'unpublish', newsIds: selectedNews })}
                >
                  Yayından Kaldır
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                  onClick={() => bulkActionMutation.mutate({ action: 'archive', newsIds: selectedNews })}
                >
                  Arşivle
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={() => bulkActionMutation.mutate({ action: 'delete', newsIds: selectedNews })}
                >
                  Sil
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Haber Listesi */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white">Haberler</CardTitle>
          <CardDescription className="text-gray-400">
            Platform haberlerinizi buradan yönetebilirsiniz
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8 text-gray-300">Yükleniyor...</div>
          ) : news.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              Henüz haber bulunmuyor
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-gray-700 hover:bg-gray-700">
                    <TableHead className="w-12 text-gray-300">
                      <Checkbox
                        checked={selectedNews.length === news.length}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedNews(news.map((n: NewsArticle) => n.id));
                          } else {
                            setSelectedNews([]);
                          }
                        }}
                        className="border-gray-600 data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600"
                      />
                    </TableHead>
                    <TableHead className="text-gray-300">Başlık</TableHead>
                    <TableHead className="text-gray-300">Kategori</TableHead>
                    <TableHead className="text-gray-300">Durum</TableHead>
                    <TableHead className="text-gray-300">Görüntülenme</TableHead>
                    <TableHead className="text-gray-300">Tarih</TableHead>
                    <TableHead className="text-gray-300">İşlemler</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {news.map((article: NewsArticle) => (
                    <TableRow key={article.id} className="border-gray-700 hover:bg-gray-700/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedNews.includes(article.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedNews([...selectedNews, article.id]);
                            } else {
                              setSelectedNews(selectedNews.filter(id => id !== article.id));
                            }
                          }}
                          className="border-gray-600 data-[state=checked]:bg-yellow-600 data-[state=checked]:border-yellow-600"
                        />
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-2 text-white">
                            {article.title}
                            {article.is_featured && (
                              <Star className="h-4 w-4 text-yellow-400" />
                            )}
                            {article.is_breaking && (
                              <AlertCircle className="h-4 w-4 text-red-400" />
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            {article.excerpt?.substring(0, 80)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-gray-600 text-gray-300">
                          {categories.find(c => c.value === article.category)?.label || article.category}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(article.status)}</TableCell>
                      <TableCell className="text-gray-300">{article.view_count?.toLocaleString() || 0}</TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(article.created_at).toLocaleDateString('tr-TR')}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="text-gray-300 hover:bg-gray-700">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-700 border-gray-600">
                            <DropdownMenuItem onClick={() => handleEdit(article)} className="text-gray-300 focus:bg-gray-600 focus:text-white">
                              <Edit2 className="h-4 w-4 mr-2" />
                              Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deleteNewsMutation.mutate(article.id)}
                              className="text-red-400 focus:bg-gray-600 focus:text-red-300"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Sil
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Sayfalama */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-400">
                    Sayfa {pagination.page} / {pagination.totalPages} 
                    ({pagination.total} toplam haber)
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => setPage(page - 1)}
                      disabled={!pagination.hasPrev}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-gray-600 text-gray-300 hover:bg-gray-700"
                      onClick={() => setPage(page + 1)}
                      disabled={!pagination.hasNext}
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

      {/* Haber Oluştur/Düzenle Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setEditingNews(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-800 border-gray-700">
          <DialogHeader>
            <DialogTitle className="text-white">
              {editingNews ? 'Haber Düzenle' : 'Yeni Haber Oluştur'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Haber bilgilerini doldurun ve yayınlayın
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">Başlık *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, title: e.target.value }));
                    if (!editingNews) generateSlug(e.target.value);
                  }}
                  required
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="slug" className="text-gray-300">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  required
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="excerpt" className="text-gray-300">Özet</Label>
              <Textarea
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content" className="text-gray-300">İçerik *</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                rows={8}
                required
                className="bg-gray-700 border-gray-600 text-white"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category" className="text-gray-300">Kategori</Label>
                <Select value={formData.category} onValueChange={(value) => 
                  setFormData(prev => ({ ...prev, category: value }))
                }>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    {categories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value} className="text-gray-300 focus:bg-gray-600">
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status" className="text-gray-300">Durum</Label>
                <Select value={formData.status} onValueChange={(value: any) => 
                  setFormData(prev => ({ ...prev, status: value }))
                }>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="draft" className="text-gray-300 focus:bg-gray-600">Taslak</SelectItem>
                    <SelectItem value="published" className="text-gray-300 focus:bg-gray-600">Yayınla</SelectItem>
                    <SelectItem value="archived" className="text-gray-300 focus:bg-gray-600">Arşivle</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="featuredImage" className="text-gray-300">Öne Çıkan Görsel URL</Label>
                <Input
                  id="featuredImage"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData(prev => ({ ...prev, featuredImage: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                  className="data-[state=checked]:bg-yellow-600"
                />
                <Label htmlFor="isFeatured" className="text-gray-300">Öne Çıkan Haber</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isBreaking"
                  checked={formData.isBreaking}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isBreaking: checked }))}
                  className="data-[state=checked]:bg-yellow-600"
                />
                <Label htmlFor="isBreaking" className="text-gray-300">Son Dakika Haberi</Label>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="metaTitle" className="text-gray-300">Meta Başlık (SEO)</Label>
                <Input
                  id="metaTitle"
                  value={formData.metaTitle}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="metaDescription" className="text-gray-300">Meta Açıklama (SEO)</Label>
                <Textarea
                  id="metaDescription"
                  value={formData.metaDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                  rows={2}
                  className="bg-gray-700 border-gray-600 text-white"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                className="border-gray-600 text-gray-300 hover:bg-gray-700"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setIsEditDialogOpen(false);
                  setEditingNews(null);
                  resetForm();
                }}
              >
                İptal
              </Button>
              <Button 
                type="submit" 
                disabled={createNewsMutation.isPending || updateNewsMutation.isPending}
                className="bg-yellow-600 hover:bg-yellow-700 text-black"
              >
                {editingNews ? 'Güncelle' : 'Oluştur'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

        </TabsContent>

        {/* İstatistikler Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Kategori Performansı */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Kategori Performansı
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {stats.categoryStats.map((cat: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {categories.find(c => c.value === cat.category)?.label || cat.category}
                        </Badge>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{cat.count} haber</div>
                        <div className="text-sm text-muted-foreground">
                          {Math.round((cat.count / stats.totalNews) * 100)}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* En Çok Okunan */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  En Çok Okunan Haberler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {stats.topViewed.map((article: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded border">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{article.title}</div>
                        <div className="text-xs text-muted-foreground">/{article.slug}</div>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium">
                        <Eye className="h-3 w-3" />
                        {article.view_count?.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Haftalık Performans */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Haftalık Performans
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData?.analytics?.weeklyPerformance ? (
                  <div className="space-y-3">
                    {analyticsData.analytics.weeklyPerformance.map((day: any, index: number) => (
                      <div key={index} className="flex items-center justify-between">
                        <div className="text-sm">{new Date(day.date).toLocaleDateString('tr-TR')}</div>
                        <div className="flex items-center gap-4">
                          <div className="text-sm">
                            <span className="font-medium">{day.news_count}</span> haber
                          </div>
                          <div className="text-sm text-muted-foreground">
                            <span className="font-medium">{day.total_views}</span> görüntülenme
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Analytics verileri yükleniyor...
                  </div>
                )}
              </CardContent>
            </Card>

            {/* İçerik Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  İçerik Analizi
                </CardTitle>
              </CardHeader>
              <CardContent>
                {analyticsData?.analytics?.contentInsights ? (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm">Ortalama İçerik Uzunluğu</span>
                      <span className="font-medium">
                        {Math.round(analyticsData.analytics.contentInsights.avg_content_length)} karakter
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Ortalama Başlık Uzunluğu</span>
                      <span className="font-medium">
                        {Math.round(analyticsData.analytics.contentInsights.avg_title_length)} karakter
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Uzun Makaleler (&gt;1000 kar.)</span>
                      <span className="font-medium">
                        {analyticsData.analytics.contentInsights.long_articles}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Kısa Makaleler (&lt;500 kar.)</span>
                      <span className="font-medium">
                        {analyticsData.analytics.contentInsights.short_articles}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    İçerik analizi yükleniyor...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* SEO Analizi Tab */}
        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                SEO Optimizasyon Durumu
              </CardTitle>
              <CardDescription>
                Haber SEO performansını analiz edin ve iyileştirme önerilerini görün
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Meta Açıklama</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Progress value={75} className="flex-1" />
                      <span className="text-sm font-medium">75%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Haberlerin %75'inde meta açıklama mevcut
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Başlık Optimizasyonu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Progress value={85} className="flex-1" />
                      <span className="text-sm font-medium">85%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Başlıkların %85'i optimal uzunlukta
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">URL Slug</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Progress value={90} className="flex-1" />
                      <span className="text-sm font-medium">90%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      URL'lerin %90'ı SEO dostu
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">İçerik Uzunluğu</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <Progress value={70} className="flex-1" />
                      <span className="text-sm font-medium">70%</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      İçeriklerin %70'i yeterli uzunlukta
                    </p>
                  </CardContent>
                </Card>
              </div>

              <div className="mt-6">
                <h3 className="font-medium mb-3">SEO İyileştirme Önerileri</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    <span>5 haberde meta açıklama eksik - tamamlanması öneriliyor</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span>Tüm URL'ler SEO dostu format kullanıyor</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span>3 haberin içeriği çok kısa - genişletilmesi gerekiyor</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

      </Tabs>
      </div>
    </AdminLayout>
  );
}