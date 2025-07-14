import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash, 
  Eye,
  Pencil,
  Globe,
  Check,
  X,
  Search,
  Upload,
  Save,
  Clock,
  Filter,
  Settings,
  Code,
  Layout
} from 'lucide-react';

// Sayfa tipi
type Page = {
  id: number;
  title: string;
  slug: string;
  content: string;
  template: string;
  status: 'published' | 'draft';
  language: string;
  author: string;
  created: string;
  updated: string;
  meta_title: string;
  meta_description: string;
  order: number;
  parent_id: number | null;
  show_in_menu: boolean;
};

const CMS: React.FC = () => {
  const { translate } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('pages');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page | null>(null);
  
  // Örnek CMS sayfa verileri
  const pages: Page[] = [
    {
      id: 1,
      title: 'Ana Sayfa',
      slug: 'home',
      content: '<h1>CryptonBets\'e Hoş Geldiniz</h1><p>Modern ve güvenilir bahis platformu...</p>',
      template: 'home',
      status: 'published',
      language: 'tr',
      author: 'admin',
      created: '2023-01-01',
      updated: '2023-04-05',
      meta_title: 'CryptonBets - Modern Online Bahis Platformu',
      meta_description: 'CryptonBets, slot oyunları ve canlı casino oyunları sunan güvenilir bir online bahis platformudur.',
      order: 1,
      parent_id: null,
      show_in_menu: true
    },
    {
      id: 2,
      title: 'Hakkımızda',
      slug: 'about',
      content: '<h1>Hakkımızda</h1><p>Biz kimiz, misyonumuz, vizyonumuz...</p>',
      template: 'default',
      status: 'published',
      language: 'tr',
      author: 'admin',
      created: '2023-01-02',
      updated: '2023-04-06',
      meta_title: 'Hakkımızda - CryptonBets',
      meta_description: 'CryptonBets\'in misyonu, vizyonu ve değerleri hakkında bilgi alın.',
      order: 2,
      parent_id: null,
      show_in_menu: true
    },
    {
      id: 3,
      title: 'İletişim',
      slug: 'contact',
      content: '<h1>İletişim</h1><p>Bizimle iletişime geçin...</p>',
      template: 'contact',
      status: 'published',
      language: 'tr',
      author: 'admin',
      created: '2023-01-03',
      updated: '2023-04-07',
      meta_title: 'İletişim - CryptonBets',
      meta_description: 'CryptonBets müşteri hizmetleri ve iletişim bilgileri.',
      order: 3,
      parent_id: null,
      show_in_menu: true
    },
    {
      id: 4,
      title: 'Gizlilik Politikası',
      slug: 'privacy-policy',
      content: '<h1>Gizlilik Politikası</h1><p>Kişisel verilerinizin nasıl işlendiği hakkında...</p>',
      template: 'default',
      status: 'published',
      language: 'tr',
      author: 'admin',
      created: '2023-01-04',
      updated: '2023-04-08',
      meta_title: 'Gizlilik Politikası - CryptonBets',
      meta_description: 'CryptonBets\'in kişisel veri koruma ve gizlilik politikası.',
      order: 4,
      parent_id: null,
      show_in_menu: false
    },
    {
      id: 5,
      title: 'Şartlar ve Koşullar',
      slug: 'terms-and-conditions',
      content: '<h1>Şartlar ve Koşullar</h1><p>Platformumuzu kullanırken uymanız gereken kurallar...</p>',
      template: 'default',
      status: 'published',
      language: 'tr',
      author: 'admin',
      created: '2023-01-05',
      updated: '2023-04-09',
      meta_title: 'Şartlar ve Koşullar - CryptonBets',
      meta_description: 'CryptonBets kullanım şartları ve koşulları.',
      order: 5,
      parent_id: null,
      show_in_menu: false
    },
    {
      id: 6,
      title: 'Sorumlu Bahis',
      slug: 'responsible-gambling',
      content: '<h1>Sorumlu Bahis</h1><p>Bahis oynarken dikkat etmeniz gerekenler...</p>',
      template: 'default',
      status: 'published',
      language: 'tr',
      author: 'admin',
      created: '2023-01-06',
      updated: '2023-04-10',
      meta_title: 'Sorumlu Bahis - CryptonBets',
      meta_description: 'CryptonBets sorumlu bahis ilkeleri ve önerileri.',
      order: 6,
      parent_id: null,
      show_in_menu: false
    }
  ];
  
  // Filtrelenmiş sayfalar
  const filteredPages = pages.filter(page => {
    // Sekme filtresi (şimdilik tek sekme var)
    const tabMatch = activeTab === 'pages';
    
    // Arama terimi filtresi
    const searchMatch = searchTerm === '' || 
                        page.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        page.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        page.slug.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Durum filtresi
    const statusMatch = statusFilter === 'all' || page.status === statusFilter;
    
    // Dil filtresi
    const languageMatch = languageFilter === 'all' || page.language === languageFilter;
    
    return tabMatch && searchMatch && statusMatch && languageMatch;
  });
  
  // Sayfa düzenleme işlevi
  const handleEditPage = (page: Page) => {
    setCurrentPage(page);
    setIsEditing(true);
    
    toast({
      title: "Sayfa Düzenleniyor",
      description: `"${page.title}" sayfası düzenleniyor.`,
    });
  };
  
  // Sayfa kaydetme işlevi
  const handleSavePage = () => {
    setIsEditing(false);
    setCurrentPage(null);
    
    toast({
      title: "Sayfa Kaydedildi",
      description: "Sayfa başarıyla güncellendi.",
    });
  };
  
  // Sayfa silme işlevi
  const handleDeletePage = (id: number) => {
    toast({
      title: "Sayfa Silindi",
      description: `${id} ID'li sayfa silindi.`,
      variant: "destructive",
    });
  };
  
  // Yeni sayfa ekleme işlevi
  const handleAddPage = () => {
    setCurrentPage({
      id: 0,
      title: '',
      slug: '',
      content: '',
      template: 'default',
      status: 'draft',
      language: 'tr',
      author: 'admin',
      created: new Date().toISOString().split('T')[0],
      updated: new Date().toISOString().split('T')[0],
      meta_title: '',
      meta_description: '',
      order: pages.length + 1,
      parent_id: null,
      show_in_menu: false
    });
    setIsEditing(true);
    
    toast({
      title: "Yeni Sayfa",
      description: "Yeni sayfa oluşturuluyor.",
    });
  };
  
  // Sayfa durumunu değiştirme işlevi
  const handleToggleStatus = (id: number, currentStatus: string) => {
    let newStatus: 'published' | 'draft' = currentStatus === 'published' ? 'draft' : 'published';
    
    toast({
      title: "Sayfa Durumu Değiştirildi",
      description: `Sayfa durumu ${newStatus === 'published' ? 'yayınlandı' : 'taslak olarak ayarlandı'}.`,
    });
  };
  
  // Durum göstergesi
  const renderStatus = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">Yayında</Badge>;
      case 'draft':
        return <Badge className="bg-gray-500">Taslak</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout title="CMS Sayfaları">
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">CMS Sayfaları</h1>
            <p className="text-gray-400">Statik sayfaları yönetin, içerikleri düzenleyin</p>
          </div>
          
          <Button onClick={handleAddPage} className="bg-yellow-500 hover:bg-yellow-600 text-black flex items-center gap-2">
            <Plus size={16} />
            Yeni Sayfa
          </Button>
        </div>
        
        {isEditing && currentPage ? (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">
                {currentPage.id === 0 ? "Yeni Sayfa" : `Sayfa Düzenleme: ${currentPage.title}`}
              </CardTitle>
              <CardDescription>
                Sayfa bilgilerini düzenleyin ve kaydedin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Başlık</label>
                  <Input 
                    value={currentPage.title}
                    onChange={(e) => setCurrentPage({...currentPage, title: e.target.value})}
                    className="bg-gray-900 border-gray-700"
                    placeholder="Sayfa başlığı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
                  <Input 
                    value={currentPage.slug}
                    onChange={(e) => setCurrentPage({...currentPage, slug: e.target.value})}
                    className="bg-gray-900 border-gray-700"
                    placeholder="sayfa-slug"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Şablon</label>
                  <select 
                    value={currentPage.template}
                    onChange={(e) => setCurrentPage({...currentPage, template: e.target.value})}
                    className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                  >
                    <option value="default">Varsayılan Şablon</option>
                    <option value="home">Ana Sayfa Şablonu</option>
                    <option value="contact">İletişim Şablonu</option>
                    <option value="sidebar">Kenar Çubuklu Şablon</option>
                    <option value="fullwidth">Tam Genişlik Şablon</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Durum</label>
                  <select 
                    value={currentPage.status}
                    onChange={(e) => setCurrentPage({...currentPage, status: e.target.value as any})}
                    className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                  >
                    <option value="published">Yayında</option>
                    <option value="draft">Taslak</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Dil</label>
                  <select 
                    value={currentPage.language}
                    onChange={(e) => setCurrentPage({...currentPage, language: e.target.value})}
                    className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">İngilizce</option>
                    <option value="ru">Rusça</option>
                    <option value="ka">Gürcüce</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Sıralama</label>
                  <Input 
                    type="number"
                    value={currentPage.order}
                    onChange={(e) => setCurrentPage({...currentPage, order: parseInt(e.target.value)})}
                    className="bg-gray-900 border-gray-700"
                    min={1}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Meta Başlık</label>
                  <Input 
                    value={currentPage.meta_title}
                    onChange={(e) => setCurrentPage({...currentPage, meta_title: e.target.value})}
                    className="bg-gray-900 border-gray-700"
                    placeholder="SEO için meta başlık"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Meta Açıklama</label>
                  <Input 
                    value={currentPage.meta_description}
                    onChange={(e) => setCurrentPage({...currentPage, meta_description: e.target.value})}
                    className="bg-gray-900 border-gray-700"
                    placeholder="SEO için meta açıklama"
                  />
                </div>
                <div className="flex items-center h-10 space-x-2">
                  <Switch 
                    id="show_in_menu"
                    checked={currentPage.show_in_menu}
                    onCheckedChange={(checked) => setCurrentPage({...currentPage, show_in_menu: checked})}
                  />
                  <label htmlFor="show_in_menu" className="text-sm font-medium text-gray-300">
                    Menüde Göster
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">İçerik (HTML)</label>
                <Textarea 
                  value={currentPage.content}
                  onChange={(e) => setCurrentPage({...currentPage, content: e.target.value})}
                  className="bg-gray-900 border-gray-700 min-h-40 font-mono"
                  placeholder="<h1>Sayfa Başlığı</h1><p>İçerik buraya gelecek...</p>"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                className="border-gray-700"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentPage(null);
                }}
              >
                İptal
              </Button>
              <Button 
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
                onClick={handleSavePage}
              >
                <Save className="h-4 w-4 mr-2" />
                Kaydet
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <>
            <Card className="bg-gray-800 border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Filtreler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Sayfa Ara</label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Başlık veya içerik ara..."
                        className="bg-gray-900 border-gray-700 pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Durum Filtresi</label>
                    <select 
                      className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Tüm Durumlar</option>
                      <option value="published">Yayında</option>
                      <option value="draft">Taslak</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Dil Filtresi</label>
                    <select 
                      className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                      value={languageFilter}
                      onChange={(e) => setLanguageFilter(e.target.value)}
                    >
                      <option value="all">Tüm Diller</option>
                      <option value="tr">Türkçe</option>
                      <option value="en">İngilizce</option>
                      <option value="ru">Rusça</option>
                      <option value="ka">Gürcüce</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2 flex items-end">
                    <Button 
                      variant="outline" 
                      className="border-gray-700 w-full"
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setLanguageFilter('all');
                      }}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filtreleri Temizle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="pages" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-gray-800 border-b border-gray-700 mb-6 w-full md:w-auto justify-start">
                <TabsTrigger 
                  value="pages" 
                  className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
                >
                  Sayfalar
                </TabsTrigger>
              </TabsList>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Sayfa Listesi</CardTitle>
                  <CardDescription>
                    {filteredPages.length} sayfa listeleniyor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table className="border-collapse">
                    <TableHeader className="bg-gray-900">
                      <TableRow>
                        <TableHead className="text-gray-300">Başlık</TableHead>
                        <TableHead className="text-gray-300">Şablon</TableHead>
                        <TableHead className="text-gray-300">Dil</TableHead>
                        <TableHead className="text-gray-300">Durum</TableHead>
                        <TableHead className="text-gray-300">Menüde</TableHead>
                        <TableHead className="text-gray-300">Sıralama</TableHead>
                        <TableHead className="text-gray-300">Tarih</TableHead>
                        <TableHead className="text-gray-300">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPages.map((page) => (
                        <TableRow key={page.id} className="border-b border-gray-700">
                          <TableCell className="font-medium">
                            <div className="text-white">{page.title}</div>
                            <div className="text-xs text-gray-400">/{page.slug}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-gray-600 flex items-center gap-1">
                              <Layout className="h-3 w-3" />
                              {page.template === 'default' ? 'Varsayılan' : 
                               page.template === 'home' ? 'Ana Sayfa' : 
                               page.template === 'contact' ? 'İletişim' : 
                               page.template === 'sidebar' ? 'Kenar Çubuklu' : 'Tam Genişlik'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-gray-600 gap-1 flex items-center">
                              <Globe className="h-3 w-3" />
                              {page.language === 'tr' ? 'Türkçe' : 
                               page.language === 'en' ? 'İngilizce' : 
                               page.language === 'ru' ? 'Rusça' : 'Gürcüce'}
                            </Badge>
                          </TableCell>
                          <TableCell>{renderStatus(page.status)}</TableCell>
                          <TableCell>
                            {page.show_in_menu ? (
                              <Badge className="bg-green-500">Evet</Badge>
                            ) : (
                              <Badge className="bg-gray-500">Hayır</Badge>
                            )}
                          </TableCell>
                          <TableCell>{page.order}</TableCell>
                          <TableCell>
                            <div>{page.created}</div>
                            <div className="text-xs text-gray-400">Son güncelleme: {page.updated}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-blue-500"
                                onClick={() => toast({
                                  title: "Sayfa Önizleme",
                                  description: `"${page.title}" sayfası önizleniyor.`,
                                })}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-yellow-500"
                                onClick={() => handleEditPage(page)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {page.status === 'published' ? (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 text-red-500"
                                  onClick={() => handleToggleStatus(page.id, page.status)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 text-green-500"
                                  onClick={() => handleToggleStatus(page.id, page.status)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() => handleDeletePage(page.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Tabs>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default CMS;