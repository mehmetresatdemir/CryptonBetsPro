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
  Filter
} from 'lucide-react';

// İçerik tipi
type Content = {
  id: number;
  title: string;
  slug: string;
  type: 'page' | 'post' | 'popup' | 'notification';
  status: 'published' | 'draft' | 'scheduled';
  author: string;
  language: string;
  created: string;
  updated: string;
  publishDate?: string;
  content: string;
  excerpt: string;
  featured?: boolean;
};

const ContentManagement: React.FC = () => {
  const { translate } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('pages');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [isEditing, setIsEditing] = useState(false);
  const [currentContent, setCurrentContent] = useState<Content | null>(null);
  
  // Örnek içerik verileri
  const contentItems: Content[] = [
    {
      id: 1,
      title: 'Hakkımızda',
      slug: 'hakkimizda',
      type: 'page',
      status: 'published',
      author: 'admin',
      language: 'tr',
      created: '2023-01-15',
      updated: '2023-04-10',
      content: '<h1>Hakkımızda</h1><p>CryptonBets, güvenilir ve eğlenceli bir bahis deneyimi sunan online bir platformdur...</p>',
      excerpt: 'CryptonBets, güvenilir ve eğlenceli bir bahis deneyimi sunan online bir platformdur...',
      featured: true
    },
    {
      id: 2,
      title: 'About Us',
      slug: 'about-us',
      type: 'page',
      status: 'published',
      author: 'admin',
      language: 'en',
      created: '2023-01-15',
      updated: '2023-04-10',
      content: '<h1>About Us</h1><p>CryptonBets is an online platform offering a reliable and entertaining betting experience...</p>',
      excerpt: 'CryptonBets is an online platform offering a reliable and entertaining betting experience...',
      featured: true
    },
    {
      id: 3,
      title: 'Kullanım Koşulları',
      slug: 'kullanim-kosullari',
      type: 'page',
      status: 'published',
      author: 'admin',
      language: 'tr',
      created: '2023-01-16',
      updated: '2023-04-12',
      content: '<h1>Kullanım Koşulları</h1><p>CryptonBets platformunu kullanırken aşağıdaki koşulları kabul etmiş sayılırsınız...</p>',
      excerpt: 'CryptonBets platformunu kullanırken aşağıdaki koşulları kabul etmiş sayılırsınız...',
      featured: false
    },
    {
      id: 4,
      title: 'Yeni Bonus Kampanyası Başladı!',
      slug: 'yeni-bonus-kampanyasi',
      type: 'post',
      status: 'published',
      author: 'marketing',
      language: 'tr',
      created: '2023-05-01',
      updated: '2023-05-01',
      content: '<h1>Yeni Bonus Kampanyası Başladı!</h1><p>İlk yatırımınıza %100 bonus kazanın. Bu fırsatı kaçırmayın...</p>',
      excerpt: 'İlk yatırımınıza %100 bonus kazanın. Bu fırsatı kaçırmayın...',
      featured: true
    },
    {
      id: 5,
      title: 'Site Bakım Duyurusu',
      slug: 'site-bakim-duyurusu',
      type: 'notification',
      status: 'scheduled',
      author: 'system',
      language: 'tr',
      created: '2023-05-10',
      updated: '2023-05-10',
      publishDate: '2023-05-25',
      content: '<h1>Planlı Bakım Duyurusu</h1><p>25 Mayıs 2023 tarihinde, saat 02:00-05:00 arasında sistemlerimizde planlı bakım çalışması yapılacaktır...</p>',
      excerpt: '25 Mayıs 2023 tarihinde, saat 02:00-05:00 arasında sistemlerimizde planlı bakım çalışması yapılacaktır...',
      featured: false
    },
    {
      id: 6,
      title: 'Yeni Oyunlar Eklendi',
      slug: 'yeni-oyunlar-eklendi',
      type: 'post',
      status: 'draft',
      author: 'content',
      language: 'tr',
      created: '2023-05-15',
      updated: '2023-05-15',
      content: '<h1>Yeni Oyunlar Eklendi</h1><p>Platformumuza 50 yeni slot oyunu eklendi. Hemen oynamaya başlayın...</p>',
      excerpt: 'Platformumuza 50 yeni slot oyunu eklendi. Hemen oynamaya başlayın...',
      featured: false
    }
  ];
  
  // Filtrelenmiş içerikler
  const filteredContent = contentItems.filter(item => {
    // Sekme filtresi
    const tabMatch = activeTab === 'all' || item.type === activeTab || 
                     (activeTab === 'posts' && item.type === 'post') || 
                     (activeTab === 'pages' && item.type === 'page') ||
                     (activeTab === 'notifications' && (item.type === 'notification' || item.type === 'popup'));
    
    // Arama terimi filtresi
    const searchMatch = searchTerm === '' || 
                        item.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        item.content.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Durum filtresi
    const statusMatch = statusFilter === 'all' || item.status === statusFilter;
    
    // Dil filtresi
    const languageMatch = languageFilter === 'all' || item.language === languageFilter;
    
    return tabMatch && searchMatch && statusMatch && languageMatch;
  });
  
  // İçerik düzenleme işlevi
  const handleEditContent = (content: Content) => {
    setCurrentContent(content);
    setIsEditing(true);
    
    toast({
      title: "İçerik Düzenleniyor",
      description: `"${content.title}" içeriği düzenleniyor.`,
    });
  };
  
  // İçerik kaydetme işlevi
  const handleSaveContent = () => {
    setIsEditing(false);
    setCurrentContent(null);
    
    toast({
      title: "İçerik Kaydedildi",
      description: "İçerik başarıyla güncellendi.",
    });
  };
  
  // İçerik silme işlevi
  const handleDeleteContent = (id: number) => {
    toast({
      title: "İçerik Silindi",
      description: `${id} ID'li içerik silindi.`,
      variant: "destructive",
    });
  };
  
  // Yeni içerik ekleme işlevi
  const handleAddContent = () => {
    setCurrentContent({
      id: 0,
      title: '',
      slug: '',
      type: 'page',
      status: 'draft',
      author: 'admin',
      language: 'tr',
      created: new Date().toISOString().split('T')[0],
      updated: new Date().toISOString().split('T')[0],
      content: '',
      excerpt: '',
      featured: false
    });
    setIsEditing(true);
    
    toast({
      title: "Yeni İçerik",
      description: "Yeni içerik oluşturuluyor.",
    });
  };
  
  // İçerik durumunu değiştirme işlevi
  const handleToggleStatus = (id: number, currentStatus: string) => {
    let newStatus: 'published' | 'draft' = currentStatus === 'published' ? 'draft' : 'published';
    
    toast({
      title: "İçerik Durumu Değiştirildi",
      description: `İçerik durumu ${newStatus === 'published' ? 'yayınlandı' : 'taslak olarak ayarlandı'}.`,
    });
  };
  
  // Durum göstergesi
  const renderStatus = (status: string) => {
    switch (status) {
      case 'published':
        return <Badge className="bg-green-500">Yayında</Badge>;
      case 'draft':
        return <Badge className="bg-gray-500">Taslak</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500">Zamanlı</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout title="İçerik Yönetimi">
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">İçerik Yönetimi</h1>
            <p className="text-gray-400">Sayfalar, gönderiler ve bildirimler gibi site içeriklerini yönetin</p>
          </div>
          
          <Button onClick={handleAddContent} className="bg-yellow-500 hover:bg-yellow-600 text-black flex items-center gap-2">
            <Plus size={16} />
            Yeni İçerik
          </Button>
        </div>
        
        {isEditing && currentContent ? (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">
                {currentContent.id === 0 ? "Yeni İçerik" : `İçerik Düzenleme: ${currentContent.title}`}
              </CardTitle>
              <CardDescription>
                İçerik bilgilerini düzenleyin ve kaydedin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Başlık</label>
                  <Input 
                    value={currentContent.title}
                    onChange={(e) => setCurrentContent({...currentContent, title: e.target.value})}
                    className="bg-gray-900 border-gray-700"
                    placeholder="İçerik başlığı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Slug</label>
                  <Input 
                    value={currentContent.slug}
                    onChange={(e) => setCurrentContent({...currentContent, slug: e.target.value})}
                    className="bg-gray-900 border-gray-700"
                    placeholder="içerik-slug"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">İçerik Tipi</label>
                  <select 
                    value={currentContent.type}
                    onChange={(e) => setCurrentContent({...currentContent, type: e.target.value as any})}
                    className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                  >
                    <option value="page">Sayfa</option>
                    <option value="post">Gönderi</option>
                    <option value="notification">Bildirim</option>
                    <option value="popup">Popup</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Durum</label>
                  <select 
                    value={currentContent.status}
                    onChange={(e) => setCurrentContent({...currentContent, status: e.target.value as any})}
                    className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                  >
                    <option value="published">Yayında</option>
                    <option value="draft">Taslak</option>
                    <option value="scheduled">Zamanlı</option>
                  </select>
                </div>
                {currentContent.status === 'scheduled' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Yayın Tarihi</label>
                    <Input 
                      type="date"
                      value={currentContent.publishDate || ''}
                      onChange={(e) => setCurrentContent({...currentContent, publishDate: e.target.value})}
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Dil</label>
                  <select 
                    value={currentContent.language}
                    onChange={(e) => setCurrentContent({...currentContent, language: e.target.value})}
                    className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                  >
                    <option value="tr">Türkçe</option>
                    <option value="en">İngilizce</option>
                    <option value="ru">Rusça</option>
                    <option value="ka">Gürcüce</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Yazar</label>
                  <Input 
                    value={currentContent.author}
                    onChange={(e) => setCurrentContent({...currentContent, author: e.target.value})}
                    className="bg-gray-900 border-gray-700"
                    placeholder="Yazar adı"
                  />
                </div>
                <div className="flex items-center h-10 space-x-2">
                  <Switch 
                    id="featured"
                    checked={currentContent.featured || false}
                    onCheckedChange={(checked) => setCurrentContent({...currentContent, featured: checked})}
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-300">
                    Öne Çıkan İçerik
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Özet</label>
                <Textarea 
                  value={currentContent.excerpt}
                  onChange={(e) => setCurrentContent({...currentContent, excerpt: e.target.value})}
                  className="bg-gray-900 border-gray-700 min-h-20"
                  placeholder="İçerik özeti"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">İçerik (HTML Desteği)</label>
                <Textarea 
                  value={currentContent.content}
                  onChange={(e) => setCurrentContent({...currentContent, content: e.target.value})}
                  className="bg-gray-900 border-gray-700 min-h-40"
                  placeholder="<p>İçerik metni burada...</p>"
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                className="border-gray-700"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentContent(null);
                }}
              >
                İptal
              </Button>
              <Button 
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
                onClick={handleSaveContent}
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
                    <label className="block text-sm font-medium text-gray-300">İçerik Ara</label>
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
                      <option value="scheduled">Zamanlı</option>
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
                <TabsTrigger 
                  value="posts" 
                  className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
                >
                  Gönderiler
                </TabsTrigger>
                <TabsTrigger 
                  value="notifications" 
                  className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
                >
                  Bildirimler
                </TabsTrigger>
                <TabsTrigger 
                  value="all" 
                  className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
                >
                  Tüm İçerikler
                </TabsTrigger>
              </TabsList>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">İçerik Listesi</CardTitle>
                  <CardDescription>
                    {filteredContent.length} içerik listeleniyor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table className="border-collapse">
                    <TableHeader className="bg-gray-900">
                      <TableRow>
                        <TableHead className="text-gray-300">Başlık</TableHead>
                        <TableHead className="text-gray-300">Tür</TableHead>
                        <TableHead className="text-gray-300">Dil</TableHead>
                        <TableHead className="text-gray-300">Durum</TableHead>
                        <TableHead className="text-gray-300">Yazar</TableHead>
                        <TableHead className="text-gray-300">Tarih</TableHead>
                        <TableHead className="text-gray-300">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredContent.map((item) => (
                        <TableRow key={item.id} className="border-b border-gray-700">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {item.featured && <span className="text-yellow-500">★</span>}
                              <span className="text-white">{item.title}</span>
                            </div>
                            <div className="text-xs text-gray-400">/{item.slug}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-gray-600">
                              {item.type === 'page' ? 'Sayfa' : 
                               item.type === 'post' ? 'Gönderi' : 
                               item.type === 'notification' ? 'Bildirim' : 'Popup'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="border-gray-600 gap-1 flex items-center">
                              <Globe className="h-3 w-3" />
                              {item.language === 'tr' ? 'Türkçe' : 
                               item.language === 'en' ? 'İngilizce' : 
                               item.language === 'ru' ? 'Rusça' : 'Gürcüce'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {renderStatus(item.status)}
                            {item.status === 'scheduled' && item.publishDate && (
                              <div className="text-xs text-gray-400 flex items-center mt-1">
                                <Clock className="h-3 w-3 mr-1" /> {item.publishDate}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>{item.author}</TableCell>
                          <TableCell>
                            <div>{item.created}</div>
                            <div className="text-xs text-gray-400">Son güncelleme: {item.updated}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-blue-500"
                                onClick={() => toast({
                                  title: "İçerik Önizleme",
                                  description: `"${item.title}" içeriği önizleniyor.`,
                                })}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-yellow-500"
                                onClick={() => handleEditContent(item)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {item.status === 'published' ? (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 text-red-500"
                                  onClick={() => handleToggleStatus(item.id, item.status)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 text-green-500"
                                  onClick={() => handleToggleStatus(item.id, item.status)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() => handleDeleteContent(item.id)}
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
                <CardFooter>
                  <Button variant="outline" className="border-gray-700 w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    İçerik İçe Aktar
                  </Button>
                </CardFooter>
              </Card>
            </Tabs>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default ContentManagement;