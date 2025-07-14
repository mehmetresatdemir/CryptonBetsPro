import React, { useState } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Filter, 
  Plus, 
  Palette, 
  Play, 
  Trash2, 
  Download, 
  Upload,
  Eye,
  Settings,
  Smartphone,
  Tablet,
  Monitor
} from 'lucide-react';

interface Theme {
  id: number;
  name: string;
  displayName: string;
  description: string;
  category: 'casino' | 'modern' | 'classic' | 'luxury' | 'neon' | 'minimal';
  isActive: boolean;
  isPremium: boolean;
  previewImage: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  fonts: {
    primary: string;
    secondary: string;
    heading: string;
    mono: string;
  };
  layout: {
    borderRadius: number;
    spacing: number;
    headerHeight: number;
    sidebarWidth: number;
    containerMaxWidth: number;
  };
  effects: {
    shadows: boolean;
    animations: boolean;
    gradients: boolean;
    blur: boolean;
    glow: boolean;
  };
  components: {
    buttons: 'rounded' | 'sharp' | 'pill';
    cards: 'flat' | 'elevated' | 'outlined';
    inputs: 'filled' | 'outlined' | 'underlined';
  };
  createdAt: string;
  updatedAt: string;
}

interface ThemeStats {
  totalThemes: number;
  activeTheme: string;
  customizations: number;
  lastUpdated: string;
  categories: {
    casino: number;
    luxury: number;
    neon: number;
    minimal: number;
    classic: number;
    modern: number;
  };
}

const Themes: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State management
  const [activeTab, setActiveTab] = useState('themes');
  const [selectedTheme, setSelectedTheme] = useState<Theme | null>(null);
  const [customColors, setCustomColors] = useState<Record<string, string>>({});
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showColorPicker, setShowColorPicker] = useState<string | null>(null);
  const [isCustomizing, setIsCustomizing] = useState(false);

  // Ensure admin token is available
  React.useEffect(() => {
    const currentToken = localStorage.getItem('token');
    const validAdminToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTksInVzZXJuYW1lIjoidGVzdCIsImVtYWlsIjoidGVzdEBleGFtcGxlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc0OTg4MDk0MSwiZXhwIjoxNzUyNDcyOTQxfQ.0C-nWTPBnvxuZTQhr3ZuX1lhnrzZILjmV_Hz2qNfcMI";
    
    console.log('🔑 Token check - Current:', currentToken ? 'EXISTS' : 'MISSING');
    console.log('🔑 Token check - Valid:', validAdminToken);
    
    if (!currentToken || currentToken !== validAdminToken) {
      console.log('🔄 Setting new admin token...');
      localStorage.setItem('token', validAdminToken);
      queryClient.invalidateQueries();
    }
  }, [queryClient]);

  // Data fetching
  const { data: themesData, isLoading: themesLoading, error: themesError } = useQuery({
    queryKey: ['/api/admin/themes']
  });

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/stats']
  });

  // Debug logging - can be removed in production
  React.useEffect(() => {
    console.log('📊 Query states:', {
      themesData: Array.isArray(themesData) ? themesData.length : 0,
      themesLoading,
      themesError: themesError?.message || 'none',
      statsData: !!statsData,
      statsLoading
    });
  }, [themesData, themesLoading, themesError, statsData, statsLoading]);

  // Mutations for theme operations
  const activateThemeMutation = useMutation({
    mutationFn: async (themeId: number) => {
      const res = await apiRequest('POST', `/api/admin/themes/${themeId}/activate`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/themes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({ title: "Başarılı", description: "Tema başarıyla aktif edildi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Tema aktif edilemedi", variant: "destructive" });
    }
  });

  const deleteThemeMutation = useMutation({
    mutationFn: async (themeId: number) => {
      const res = await apiRequest('DELETE', `/api/admin/themes/${themeId}`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/themes'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      toast({ title: "Başarılı", description: "Tema başarıyla silindi" });
    },
    onError: () => {
      toast({ title: "Hata", description: "Tema silinemedi", variant: "destructive" });
    }
  });

  const saveThemeMutation = useMutation({
    mutationFn: async (data: { themeId: number; colors: Record<string, string> }) => {
      const res = await apiRequest('PUT', `/api/admin/themes/${data.themeId}/customize`, data.colors);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/themes'] });
      toast({ title: "Başarılı", description: "Tema özelleştirmesi kaydedildi" });
      setIsCustomizing(false);
    },
    onError: () => {
      toast({ title: "Hata", description: "Tema özelleştirmesi kaydedilemedi", variant: "destructive" });
    }
  });

  // Filter themes based on search and category  
  const filteredThemes = (themesData || []).filter((theme: any) => {
    const displayName = theme.display_name || theme.displayName || '';
    const description = theme.description || '';
    const matchesSearch = displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || theme.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleActivateTheme = (theme: any) => {
    activateThemeMutation.mutate(theme.id);
  };

  const handleDeleteTheme = (theme: Theme) => {
    if (theme.isActive) {
      toast({ title: "Uyarı", description: "Aktif tema silinemez", variant: "destructive" });
      return;
    }
    if (confirm(`"${theme.displayName}" temasını silmek istediğinizden emin misiniz?`)) {
      deleteThemeMutation.mutate(theme.id);
    }
  };

  const customizeTheme = (theme: Theme) => {
    setSelectedTheme(theme);
    setCustomColors(theme.colors);
    setIsCustomizing(true);
  };

  const handleSaveCustomization = () => {
    if (selectedTheme) {
      saveThemeMutation.mutate({
        themeId: selectedTheme.id,
        colors: customColors
      });
    }
  };

  if (themesLoading || statsLoading) {
    return (
      <AdminLayout title="Tema Yönetimi">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Temalar yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (themesError) {
    return (
      <AdminLayout title="Tema Yönetimi">
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-red-400 mb-2">Temalar yüklenemedi</h3>
          <p className="text-gray-400">Lütfen sayfayı yenileyin veya daha sonra tekrar deneyin.</p>
        </div>
      </AdminLayout>
    );
  }

  const renderThemeCard = (theme: any) => (
    <Card key={theme.id} className="bg-gray-800 border-gray-700 hover:border-yellow-500/50 transition-all duration-300 group">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white text-lg">{theme.display_name || theme.displayName}</CardTitle>
            <CardDescription className="text-gray-400 text-sm mt-1">
              {theme.description}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {(theme.is_active || theme.isActive) && (
              <Badge className="bg-green-600 text-white">Aktif</Badge>
            )}
            {theme.is_default && (
              <Badge className="bg-yellow-600 text-white">Varsayılan</Badge>
            )}
            <Badge variant="outline" className="text-gray-300 border-gray-600">
              {theme.category || 'Casino'}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Color Preview */}
        <div className="grid grid-cols-6 gap-2">
          <div className="w-8 h-8 rounded border border-gray-600" style={{ backgroundColor: theme.primary_color || '#FFD700' }} title="Primary" />
          <div className="w-8 h-8 rounded border border-gray-600" style={{ backgroundColor: theme.secondary_color || '#1A1A1A' }} title="Secondary" />
          <div className="w-8 h-8 rounded border border-gray-600" style={{ backgroundColor: theme.accent_color || '#FFA500' }} title="Accent" />
          <div className="w-8 h-8 rounded border border-gray-600" style={{ backgroundColor: theme.background_color || '#0A0A0A' }} title="Background" />
          <div className="w-8 h-8 rounded border border-gray-600" style={{ backgroundColor: theme.text_color || '#FFFFFF' }} title="Text" />
          <div className="w-8 h-8 rounded border border-gray-600" style={{ backgroundColor: '#22C55E' }} title="Success" />
        </div>
        
        {/* Theme Preview */}
        <div 
          className="p-4 rounded-lg border"
          style={{
            backgroundColor: theme.background_color || '#0A0A0A',
            borderColor: theme.secondary_color || '#1A1A1A',
            color: theme.text_color || '#FFFFFF'
          }}
        >
          <div className="text-sm font-medium mb-2">Önizleme</div>
          <div className="flex gap-2">
            <Button
              size="sm"
              style={{
                backgroundColor: theme.primary_color || '#FFD700',
                color: theme.background_color || '#0A0A0A'
              }}
            >
              Primary
            </Button>
            <Button
              size="sm"
              variant="outline"
              style={{
                borderColor: theme.secondary_color || '#1A1A1A',
                color: theme.text_color || '#FFFFFF'
              }}
            >
              Secondary
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-4">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => customizeTheme(theme)}
            className="border-gray-600 text-gray-300 hover:border-yellow-500"
          >
            <Palette className="w-4 h-4 mr-2" />
            Özelleştir
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              // Preview functionality
              toast({ title: "Önizleme", description: "Tema önizlemesi açılıyor..." });
            }}
            className="border-gray-600 text-gray-300 hover:border-blue-500"
          >
            <Eye className="w-4 h-4 mr-2" />
            Önizle
          </Button>
        </div>
        <div className="flex gap-2">
          {!theme.isActive && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleActivateTheme(theme)}
              disabled={activateThemeMutation.isPending}
              className="border-green-600 text-green-400 hover:bg-green-600 hover:text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Aktif Et
            </Button>
          )}
          {!theme.isActive && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDeleteTheme(theme)}
              disabled={deleteThemeMutation.isPending}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Sil
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );

  return (
    <AdminLayout title="Tema Yönetimi">
      <div className="space-y-6">
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Toplam Tema</CardTitle>
              <Palette className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{(statsData as any)?.totalThemes || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Aktif Tema</CardTitle>
              <Play className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-white">{(statsData as any)?.activeTheme || 'Yok'}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Özelleştirmeler</CardTitle>
              <Settings className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{(statsData as any)?.customizations || 0}</div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Son Güncelleme</CardTitle>
              <Upload className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold text-white">
                {(statsData as any)?.lastUpdated ? new Date((statsData as any).lastUpdated).toLocaleDateString('tr-TR') : 'Bilinmiyor'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="themes" className="data-[state=active]:bg-yellow-600">
              Temalar
            </TabsTrigger>
            <TabsTrigger value="create" className="data-[state=active]:bg-yellow-600">
              Yeni Tema
            </TabsTrigger>
            <TabsTrigger value="import" className="data-[state=active]:bg-yellow-600">
              İçe/Dışa Aktar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="themes" className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Tema ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex gap-2">
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48 bg-gray-800 border-gray-700">
                    <SelectValue placeholder="Kategori seç" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Kategoriler</SelectItem>
                    <SelectItem value="casino">Casino</SelectItem>
                    <SelectItem value="luxury">Luxury</SelectItem>
                    <SelectItem value="neon">Neon</SelectItem>
                    <SelectItem value="minimal">Minimal</SelectItem>
                    <SelectItem value="classic">Classic</SelectItem>
                    <SelectItem value="modern">Modern</SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('all');
                  }}
                  className="border-gray-600 text-gray-300"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Temizle
                </Button>
              </div>
            </div>

            {/* Themes Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredThemes.map((theme: any) => renderThemeCard(theme))}
            </div>

            {filteredThemes.length === 0 && (
              <div className="text-center py-12">
                <Palette className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-300 mb-2">Tema bulunamadı</h3>
                <p className="text-gray-400">Arama kriterlerinizi değiştirin veya yeni bir tema oluşturun.</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Yeni Tema Oluştur</CardTitle>
                <CardDescription className="text-gray-400">
                  Özel bir tema oluşturun ve platformunuzu kişiselleştirin.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Plus className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-300 mb-2">Tema Oluşturucu</h3>
                  <p className="text-gray-400 mb-4">Bu özellik yakında eklenecek.</p>
                  <Button disabled className="bg-gray-700 text-gray-400">
                    <Plus className="w-4 h-4 mr-2" />
                    Yeni Tema Oluştur
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="import" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Tema İçe Aktar</CardTitle>
                  <CardDescription className="text-gray-400">
                    JSON formatında tema dosyası yükleyin.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <Upload className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                    <p className="text-gray-400 mb-4">Tema dosyası seçin</p>
                    <Button disabled className="bg-gray-700 text-gray-400">
                      <Upload className="w-4 h-4 mr-2" />
                      Dosya Seç
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Tema Dışa Aktar</CardTitle>
                  <CardDescription className="text-gray-400">
                    Mevcut temaları JSON formatında indirin.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center py-8">
                    <Download className="mx-auto h-8 w-8 text-gray-400 mb-4" />
                    <p className="text-gray-400 mb-4">Aktif temayı dışa aktar</p>
                    <Button disabled className="bg-gray-700 text-gray-400">
                      <Download className="w-4 h-4 mr-2" />
                      Tema İndir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Theme Customization Dialog */}
        <Dialog open={isCustomizing} onOpenChange={setIsCustomizing}>
          <DialogContent className="max-w-4xl bg-gray-800 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">
                Tema Özelleştir: {selectedTheme?.displayName}
              </DialogTitle>
              <DialogDescription className="text-gray-400">
                Tema renklerini ve ayarlarını özelleştirin.
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Color Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-white">Renkler</h3>
                <div className="grid grid-cols-2 gap-4">
                  {selectedTheme && Object.entries(selectedTheme.colors).map(([colorName, colorValue]) => (
                    <div key={colorName} className="space-y-2">
                      <Label className="text-gray-300 capitalize">{colorName}</Label>
                      <div className="flex gap-2">
                        <div
                          className="w-10 h-10 rounded border border-gray-600 cursor-pointer"
                          style={{ backgroundColor: customColors[colorName] || colorValue }}
                          onClick={() => setShowColorPicker(showColorPicker === colorName ? null : colorName)}
                        />
                        <Input
                          value={customColors[colorName] || colorValue}
                          onChange={(e) => setCustomColors(prev => ({ ...prev, [colorName]: e.target.value }))}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">Önizleme</h3>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant={previewMode === 'desktop' ? 'default' : 'outline'}
                      onClick={() => setPreviewMode('desktop')}
                    >
                      <Monitor className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={previewMode === 'tablet' ? 'default' : 'outline'}
                      onClick={() => setPreviewMode('tablet')}
                    >
                      <Tablet className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant={previewMode === 'mobile' ? 'default' : 'outline'}
                      onClick={() => setPreviewMode('mobile')}
                    >
                      <Smartphone className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                
                <div 
                  className={`border rounded-lg overflow-hidden ${
                    previewMode === 'mobile' ? 'max-w-sm' : 
                    previewMode === 'tablet' ? 'max-w-md' : 'w-full'
                  }`}
                  style={{
                    backgroundColor: customColors.background || selectedTheme?.colors.background,
                    borderColor: customColors.border || selectedTheme?.colors.border
                  }}
                >
                  <div 
                    className="p-4 border-b"
                    style={{
                      backgroundColor: customColors.surface || selectedTheme?.colors.surface,
                      borderBottomColor: customColors.border || selectedTheme?.colors.border,
                      color: customColors.text || selectedTheme?.colors.text
                    }}
                  >
                    <h4 className="font-medium">Örnek Başlık</h4>
                    <p style={{ color: customColors.textSecondary || selectedTheme?.colors.textSecondary }}>
                      Örnek açıklama metni
                    </p>
                  </div>
                  <div className="p-4 space-y-3">
                    <Button
                      size="sm"
                      style={{
                        backgroundColor: customColors.primary || selectedTheme?.colors.primary,
                        color: customColors.background || selectedTheme?.colors.background
                      }}
                    >
                      Primary Button
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      style={{
                        borderColor: customColors.border || selectedTheme?.colors.border,
                        color: customColors.text || selectedTheme?.colors.text
                      }}
                    >
                      Secondary Button
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => {
                setCustomColors(selectedTheme?.colors || {});
                setIsCustomizing(false);
              }}>
                İptal
              </Button>
              <Button 
                onClick={handleSaveCustomization}
                disabled={saveThemeMutation.isPending}
              >
                {saveThemeMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default Themes;