import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  RefreshCw, 
  Settings, 
  Shield, 
  Database, 
  Server, 
  PlayCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Clock,
  Save
} from 'lucide-react';

const SlotegratorAPI: React.FC = () => {
  const { translate } = useLanguage();
  const { toast } = useToast();
  
  // Çevresel değişkenlerden API ayarlarını alıyoruz (Vite için import.meta.env kullanılır)
  const [merchantId, setMerchantId] = useState(import.meta.env.SLOTEGRATOR_MERCHANT_ID || '');
  const [merchantKey, setMerchantKey] = useState(import.meta.env.SLOTEGRATOR_MERCHANT_KEY || '');
  const [apiUrl, setApiUrl] = useState(import.meta.env.SLOTEGRATOR_API_URL || 'https://api.slotegrator.com/v1');
  
  // API durumu ve ayarları
  const [apiStatus, setApiStatus] = useState<'connected' | 'disconnected' | 'testing'>('connected');
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [rateLimitEnabled, setRateLimitEnabled] = useState(true);
  const [cachingEnabled, setCachingEnabled] = useState(true);
  const [cacheExpiry, setCacheExpiry] = useState(60); // dakika
  
  // API İstatistikleri
  const [apiStats, setApiStats] = useState({
    totalRequests: 10482,
    successRate: 99.8,
    averageResponseTime: 243, // ms
    cachingEfficiency: 86.5, // %
    errorRate: 0.2,
    lastUpdated: new Date().toISOString()
  });
  
  // API Test işlevi
  const testApiConnection = () => {
    setApiStatus('testing');
    
    toast({
      title: "API Bağlantısı Test Ediliyor",
      description: "Slotegrator API bağlantısı test ediliyor, lütfen bekleyin...",
    });
    
    // Gerçek uygulamada burada bir API isteği olur
    setTimeout(() => {
      setApiStatus('connected');
      toast({
        title: "API Bağlantısı Başarılı",
        description: "Slotegrator API'ye başarıyla bağlanıldı.",
      });
    }, 2000);
  };
  
  // API Ayarlarını kaydetme işlevi
  const saveApiSettings = () => {
    toast({
      title: "API Ayarları Kaydedildi",
      description: "Slotegrator API ayarlarınız başarıyla güncellendi.",
    });
  };
  
  // Önbellek temizleme işlevi
  const clearCache = () => {
    toast({
      title: "Önbellek Temizlendi",
      description: "Slotegrator API önbelleği başarıyla temizlendi.",
    });
  };
  
  // Önbelleğin yeniden oluşturulması
  const rebuildCache = () => {
    toast({
      title: "Önbellek Yeniden Oluşturuluyor",
      description: "Slotegrator API önbelleği yeniden oluşturuluyor, bu işlem birkaç dakika sürebilir.",
    });
  };

  return (
    <AdminLayout title="Slotegrator API">
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Slotegrator API Yönetimi</h1>
            <p className="text-gray-400">API bağlantıları, oyun sağlayıcıları ve önbellek ayarları</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className={`flex items-center gap-2 ${apiStatus === 'connected' ? 'border-green-500 text-green-500' : apiStatus === 'testing' ? 'border-yellow-500 text-yellow-500' : 'border-red-500 text-red-500'}`}
              onClick={testApiConnection}
              disabled={apiStatus === 'testing'}
            >
              {apiStatus === 'connected' ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : apiStatus === 'testing' ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <AlertTriangle className="h-4 w-4" />
              )}
              {apiStatus === 'connected' ? 'Bağlantı Aktif' : apiStatus === 'testing' ? 'Bağlantı Test Ediliyor...' : 'Bağlantı Kesildi'}
            </Button>
            
            <Button variant="outline" className="border-gray-700 flex items-center gap-2" onClick={clearCache}>
              <RefreshCw className="h-4 w-4" />
              Önbelleği Temizle
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="bg-gray-800 border-b border-gray-700 mb-6 w-full md:w-auto justify-start">
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              API Ayarları
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              API İstatistikleri
            </TabsTrigger>
            <TabsTrigger 
              value="providers" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              Oyun Sağlayıcıları
            </TabsTrigger>
            <TabsTrigger 
              value="debug" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              Hata Ayıklama
            </TabsTrigger>
          </TabsList>
          
          {/* API Ayarları Sekmesi */}
          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">API Kimlik Bilgileri</CardTitle>
                <CardDescription>
                  Slotegrator API bağlantısı için gerekli kimlik bilgileri
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="merchant-id">Merchant ID</Label>
                  <Input 
                    id="merchant-id"
                    value={merchantId} 
                    onChange={(e) => setMerchantId(e.target.value)}
                    placeholder="Slotegrator Merchant ID'nizi girin"
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="merchant-key">Merchant Key</Label>
                  <Input 
                    id="merchant-key"
                    type="password"
                    value={merchantKey} 
                    onChange={(e) => setMerchantKey(e.target.value)}
                    placeholder="Slotegrator Merchant Key'inizi girin"
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="api-url">API URL</Label>
                  <Input 
                    id="api-url"
                    value={apiUrl} 
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="Slotegrator API URL'sini girin"
                    className="bg-gray-900 border-gray-700"
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveApiSettings} className="bg-yellow-500 hover:bg-yellow-600 text-black flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Ayarları Kaydet
                </Button>
              </CardFooter>
            </Card>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">API Davranış Ayarları</CardTitle>
                <CardDescription>
                  API isteklerinin nasıl yönetileceği ile ilgili ayarlar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="rate-limit">API İstek Limiti</Label>
                    <p className="text-sm text-gray-400">
                      API istek limitlemesi, sistemin aşırı yüklenmesini önler
                    </p>
                  </div>
                  <Switch 
                    id="rate-limit"
                    checked={rateLimitEnabled}
                    onCheckedChange={setRateLimitEnabled}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="caching">API Önbellekleme</Label>
                    <p className="text-sm text-gray-400">
                      API yanıtlarını önbelleğe alarak hızlı erişim sağlar
                    </p>
                  </div>
                  <Switch 
                    id="caching"
                    checked={cachingEnabled}
                    onCheckedChange={setCachingEnabled}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cache-expiry">Önbellek Süresi (dakika)</Label>
                  <Input 
                    id="cache-expiry"
                    type="number"
                    value={cacheExpiry} 
                    onChange={(e) => setCacheExpiry(parseInt(e.target.value))}
                    className="bg-gray-900 border-gray-700 w-24"
                    min={1}
                    max={1440}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="debug-mode">Debug Modu</Label>
                    <p className="text-sm text-gray-400">
                      Detaylı hata ayıklama bilgilerini günlüğe kaydeder
                    </p>
                  </div>
                  <Switch 
                    id="debug-mode"
                    checked={debugMode}
                    onCheckedChange={setDebugMode}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label htmlFor="auto-refresh">Otomatik Yenileme</Label>
                    <p className="text-sm text-gray-400">
                      Oyun verilerini düzenli aralıklarla yeniler
                    </p>
                  </div>
                  <Switch 
                    id="auto-refresh"
                    checked={autoRefresh}
                    onCheckedChange={setAutoRefresh}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={saveApiSettings} className="bg-yellow-500 hover:bg-yellow-600 text-black flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Ayarları Kaydet
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* API İstatistikleri Sekmesi */}
          <TabsContent value="stats" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white flex justify-between items-center">
                    <span>Toplam İstek Sayısı</span>
                    <Database className="h-5 w-5 text-yellow-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{apiStats.totalRequests.toLocaleString()}</div>
                  <p className="text-sm text-gray-400 mt-1">
                    Son güncelleme: {new Date(apiStats.lastUpdated).toLocaleString('tr-TR')}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white flex justify-between items-center">
                    <span>Başarı Oranı</span>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">%{apiStats.successRate}</div>
                  <p className="text-sm text-gray-400 mt-1">
                    Hata oranı: %{apiStats.errorRate}
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-white flex justify-between items-center">
                    <span>Ortalama Yanıt Süresi</span>
                    <Clock className="h-5 w-5 text-yellow-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">{apiStats.averageResponseTime} ms</div>
                  <p className="text-sm text-gray-400 mt-1">
                    Önbellek verimliliği: %{apiStats.cachingEfficiency}
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">API İşlem Geçmişi</CardTitle>
                <CardDescription>
                  Son 24 saatteki API istekleri ve durumları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Örnek API istekleri */}
                  {[
                    { id: 1, endpoint: '/games/list', status: 'success', time: '12:45:23', duration: 235, response: 200 },
                    { id: 2, endpoint: '/games/categories', status: 'success', time: '12:42:18', duration: 189, response: 200 },
                    { id: 3, endpoint: '/games/providers', status: 'success', time: '12:40:05', duration: 267, response: 200 },
                    { id: 4, endpoint: '/games/info/12345', status: 'error', time: '12:35:41', duration: 543, response: 404 },
                    { id: 5, endpoint: '/games/list?provider=pragmatic', status: 'success', time: '12:30:12', duration: 312, response: 200 },
                  ].map((request) => (
                    <div key={request.id} className="flex items-center justify-between p-3 bg-gray-900 rounded-lg border border-gray-700">
                      <div className="flex items-center gap-3">
                        <Badge
                          className={request.status === 'success' ? 'bg-green-500' : 'bg-red-500'}
                        >
                          {request.response}
                        </Badge>
                        <div>
                          <p className="text-sm font-medium text-white">{request.endpoint}</p>
                          <p className="text-xs text-gray-400">{request.time} • {request.duration} ms</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="border-gray-600">
                        {request.status === 'success' ? 'Başarılı' : 'Hata'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="border-gray-700 w-full">
                  Tüm İşlem Geçmişini Görüntüle
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Oyun Sağlayıcıları Sekmesi */}
          <TabsContent value="providers" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Aktif Oyun Sağlayıcıları</CardTitle>
                <CardDescription>
                  Slotegrator üzerinden erişilebilen oyun sağlayıcıları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {/* Örnek Sağlayıcılar */}
                  {[
                    { id: 1, name: 'Pragmatic Play', status: 'active', games: 243, logo: '/pragmatic.png' },
                    { id: 2, name: 'Evolution Gaming', status: 'active', games: 127, logo: '/evolution.png' },
                    { id: 3, name: 'NetEnt', status: 'active', games: 186, logo: '/netent.png' },
                    { id: 4, name: 'Play\'n GO', status: 'inactive', games: 165, logo: '/playngo.png' },
                    { id: 5, name: 'Microgaming', status: 'active', games: 212, logo: '/microgaming.png' },
                    { id: 6, name: 'Quickspin', status: 'active', games: 98, logo: '/quickspin.png' },
                    { id: 7, name: 'Yggdrasil', status: 'active', games: 114, logo: '/yggdrasil.png' },
                    { id: 8, name: 'Big Time Gaming', status: 'active', games: 76, logo: '/btg.png' },
                  ].map((provider) => (
                    <div key={provider.id} className="bg-gray-900 p-4 rounded-lg border border-gray-700 flex flex-col items-center">
                      <div className="h-12 w-12 bg-gray-800 rounded-full flex items-center justify-center mb-3">
                        <PlayCircle className="h-6 w-6 text-yellow-500" />
                      </div>
                      <h3 className="text-white font-medium text-sm mb-1">{provider.name}</h3>
                      <Badge
                        className={provider.status === 'active' ? 'bg-green-500' : 'bg-gray-600'}
                      >
                        {provider.status === 'active' ? 'Aktif' : 'Pasif'}
                      </Badge>
                      <p className="text-xs text-gray-400 mt-2">Oyun Sayısı: {provider.games}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="border-gray-700" onClick={rebuildCache}>
                  Oyun Listesini Güncelle
                </Button>
                <Button variant="outline" className="border-gray-700">
                  Tüm Sağlayıcıları Yönet
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          {/* Hata Ayıklama Sekmesi */}
          <TabsContent value="debug" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">API Hata Ayıklama</CardTitle>
                <CardDescription>
                  Slotegrator API ile ilgili sorunları gidermek için araçlar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <h3 className="text-white font-medium mb-2">Önbellek Durumu</h3>
                  <p className="text-sm text-gray-400 mb-3">Önbellekte saklanan verilerin durumu ve boyutu</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Toplam Önbellek Girişi:</span>
                      <span className="text-white">1,284</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Tahmini Boyut:</span>
                      <span className="text-white">24.5 MB</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-400">Ortalama Yaş:</span>
                      <span className="text-white">26 dakika</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="border-gray-700 text-xs" onClick={clearCache}>
                      Önbelleği Temizle
                    </Button>
                    <Button variant="outline" className="border-gray-700 text-xs">
                      Önbellek İstatistiklerini Görüntüle
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <h3 className="text-white font-medium mb-2">Test API İsteği</h3>
                  <p className="text-sm text-gray-400 mb-3">Test amaçlı bir API isteği gönderin</p>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="/endpoint/path" 
                      className="bg-gray-800 border-gray-700 flex-1" 
                    />
                    <Button variant="outline" className="border-gray-700">
                      İstek Gönder
                    </Button>
                  </div>
                </div>
                
                <div className="p-4 bg-gray-900 rounded-lg border border-gray-700">
                  <h3 className="text-white font-medium mb-2">API Günlükleri</h3>
                  <p className="text-sm text-gray-400 mb-3">Son API hata günlükleri</p>
                  <div className="bg-gray-950 p-3 rounded-md text-gray-300 text-xs font-mono h-64 overflow-y-auto">
                    <p>[2023-05-20 14:32:15] ERROR: API request to /games/info/12345 failed with status 404</p>
                    <p>[2023-05-20 14:30:12] INFO: API request rate limit reached, throttling...</p>
                    <p>[2023-05-20 14:25:33] WARNING: Slow API response (543ms) for /games/list?provider=pragmatic</p>
                    <p>[2023-05-20 14:20:05] ERROR: API request timed out after 5000ms</p>
                    <p>[2023-05-20 14:15:42] INFO: Cache refresh initiated for game providers</p>
                    <p>[2023-05-20 14:10:18] WARNING: API authorization token will expire in 24 hours</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="border-gray-700 w-full">
                  Tüm Günlükleri İndir
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default SlotegratorAPI;