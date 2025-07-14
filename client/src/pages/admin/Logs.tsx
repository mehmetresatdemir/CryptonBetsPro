import React, { useState, Fragment } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  FileText, 
  Search, 
  Download, 
  Filter, 
  Clock,
  User,
  RefreshCw,
  Trash,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Info,
  Calendar,
  Zap,
  Globe,
  Database,
  Server,
  Lock
} from 'lucide-react';

// Log kaydı tipi
type LogEntry = {
  id: number;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical' | 'debug';
  category: 'system' | 'security' | 'admin' | 'user' | 'transaction' | 'api' | 'database';
  message: string;
  details?: string;
  source: string;
  user?: {
    id: number;
    username: string;
  };
  ipAddress?: string;
};

const Logs: React.FC = () => {
  const { translate } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('system');
  const [searchTerm, setSearchTerm] = useState('');
  const [logLevelFilter, setLogLevelFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('today');
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
  
  // Bugünün tarihini formatla
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  
  // Örnek log kayıtları
  const logEntries: LogEntry[] = [
    {
      id: 1,
      timestamp: `${today}T14:32:15.123Z`,
      level: 'info',
      category: 'system',
      message: 'Sistem başlatıldı',
      source: 'system.boot',
      details: 'Node.js v18.16.0, PostgreSQL 14.5'
    },
    {
      id: 2,
      timestamp: `${today}T14:35:22.456Z`,
      level: 'warning',
      category: 'security',
      message: 'Başarısız giriş denemesi',
      source: 'auth.login',
      user: {
        id: 1023,
        username: 'user123'
      },
      ipAddress: '192.168.1.105',
      details: 'Hatalı şifre, deneme sayısı: 1/5'
    },
    {
      id: 3,
      timestamp: `${today}T14:40:18.789Z`,
      level: 'error',
      category: 'api',
      message: 'API isteği başarısız',
      source: 'api.payment',
      details: 'Stripe API istek hatası: Invalid API Key provided: sk_*****'
    },
    {
      id: 4,
      timestamp: `${today}T14:45:33.234Z`,
      level: 'info',
      category: 'admin',
      message: 'Admin girişi yapıldı',
      source: 'auth.login',
      user: {
        id: 1,
        username: 'admin'
      },
      ipAddress: '192.168.1.100'
    },
    {
      id: 5,
      timestamp: `${today}T14:50:41.567Z`,
      level: 'info',
      category: 'user',
      message: 'Yeni kullanıcı kaydı',
      source: 'user.registration',
      user: {
        id: 1024,
        username: 'newuser456'
      },
      ipAddress: '192.168.1.110'
    },
    {
      id: 6,
      timestamp: `${today}T15:02:55.890Z`,
      level: 'info',
      category: 'transaction',
      message: 'Para yatırma işlemi başarılı',
      source: 'payment.deposit',
      user: {
        id: 1023,
        username: 'user123'
      },
      details: 'Tutar: 500 TL, Yöntem: Banka Transferi, İşlem No: TR123456789'
    },
    {
      id: 7,
      timestamp: `${today}T15:15:12.345Z`,
      level: 'critical',
      category: 'database',
      message: 'Veritabanı bağlantı hatası',
      source: 'database.connection',
      details: 'PostgreSQL bağlantı hatası: Connection refused. Retry attempt 1/3'
    },
    {
      id: 8,
      timestamp: `${today}T15:16:08.678Z`,
      level: 'info',
      category: 'database',
      message: 'Veritabanı bağlantısı yeniden kuruldu',
      source: 'database.connection',
      details: 'PostgreSQL bağlantısı başarıyla kuruldu.'
    },
    {
      id: 9,
      timestamp: `${yesterday}T10:22:33.901Z`,
      level: 'warning',
      category: 'security',
      message: 'Şüpheli erişim girişimi',
      source: 'security.access',
      ipAddress: '45.227.255.206',
      details: 'Birden fazla başarısız giriş denemesi sonrası admin paneline erişim girişimi. IP adresi geçici olarak kara listeye alındı.'
    },
    {
      id: 10,
      timestamp: `${yesterday}T11:34:47.234Z`,
      level: 'info',
      category: 'system',
      message: 'Sistem güncellemesi',
      source: 'system.update',
      details: 'Otomatik güncelleme tamamlandı. Yeni versiyon: v2.5.1'
    },
    {
      id: 11,
      timestamp: `${yesterday}T14:12:38.567Z`,
      level: 'debug',
      category: 'api',
      message: 'API istek detayları',
      source: 'api.game',
      details: 'GET /api/games/categories - Yanıt: 200 OK, Süre: 254ms, Yanıt boyutu: 34.5KB'
    },
    {
      id: 12,
      timestamp: `${yesterday}T16:45:22.890Z`,
      level: 'error',
      category: 'api',
      message: 'Slotegrator API hatası',
      source: 'api.slotegrator',
      details: 'Oturum açma hatası: Geçersiz merchant ID veya key'
    }
  ];
  
  // Tarih filtresine göre günün tarihini döndür
  const getFilterDate = (): string => {
    switch (dateFilter) {
      case 'today':
        return today;
      case 'yesterday':
        return yesterday;
      default:
        return '';
    }
  };
  
  // Filtrelenmiş log kayıtları
  const filteredLogs = logEntries.filter(log => {
    // Sekme/kategori filtresi
    const tabMatch = activeTab === 'all' || log.category === activeTab;
    
    // Arama filtresi
    const searchMatch = 
      searchTerm === '' || 
      log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase())) ||
      log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.user && log.user.username.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Log seviyesi filtresi
    const levelMatch = logLevelFilter === 'all' || log.level === logLevelFilter;
    
    // Tarih filtresi
    const dateMatch = 
      dateFilter === 'all' || 
      log.timestamp.startsWith(getFilterDate());
    
    return tabMatch && searchMatch && levelMatch && dateMatch;
  }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  
  // Zaman formatı
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };
  
  // Log detaylarını göster/gizle
  const toggleLogDetails = (logId: number) => {
    if (expandedLogId === logId) {
      setExpandedLogId(null);
    } else {
      setExpandedLogId(logId);
    }
  };
  
  // Log loglarını temizleme
  const handleClearLogs = () => {
    toast({
      title: "Loglar Temizlendi",
      description: "Seçili loglar başarıyla temizlendi.",
    });
  };
  
  // Log loglarını dışa aktarma
  const handleExportLogs = () => {
    toast({
      title: "Loglar Dışa Aktarılıyor",
      description: "Seçili loglar CSV formatında dışa aktarılıyor.",
    });
  };
  
  // Log seviyesi göstergesi
  const getLevelBadge = (level: string) => {
    switch (level) {
      case 'debug':
        return <Badge className="bg-blue-500">Debug</Badge>;
      case 'info':
        return <Badge className="bg-green-500">Bilgi</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500 text-black">Uyarı</Badge>;
      case 'error':
        return <Badge className="bg-red-500">Hata</Badge>;
      case 'critical':
        return <Badge className="bg-purple-500">Kritik</Badge>;
      default:
        return <Badge>{level}</Badge>;
    }
  };
  
  // Kategori ikonu
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'system':
        return <Server className="h-4 w-4 text-blue-400" />;
      case 'security':
        return <ShieldAlert className="h-4 w-4 text-red-400" />;
      case 'admin':
        return <User className="h-4 w-4 text-purple-400" />;
      case 'user':
        return <User className="h-4 w-4 text-green-400" />;
      case 'transaction':
        return <Zap className="h-4 w-4 text-yellow-400" />;
      case 'api':
        return <Globe className="h-4 w-4 text-orange-400" />;
      case 'database':
        return <Database className="h-4 w-4 text-blue-400" />;
      default:
        return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <AdminLayout title="Sistem Günlükleri">
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Sistem Günlükleri</h1>
            <p className="text-gray-400">Sistem, güvenlik ve kullanıcı etkinlik günlükleri</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-gray-700"
              onClick={() => window.location.reload()}
            >
              <RefreshCw size={16} />
              Yenile
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-gray-700"
              onClick={handleExportLogs}
            >
              <Download size={16} />
              Dışa Aktar
            </Button>
            <Button 
              variant="destructive" 
              className="flex items-center gap-2"
              onClick={handleClearLogs}
            >
              <Trash size={16} />
              Temizle
            </Button>
          </div>
        </div>
        
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Log Ara</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Mesaj, detay veya kaynak ara..."
                    className="bg-gray-900 border-gray-700 pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Seviye Filtresi</label>
                <select 
                  className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                  value={logLevelFilter}
                  onChange={(e) => setLogLevelFilter(e.target.value)}
                >
                  <option value="all">Tüm Seviyeler</option>
                  <option value="debug">Debug</option>
                  <option value="info">Bilgi</option>
                  <option value="warning">Uyarı</option>
                  <option value="error">Hata</option>
                  <option value="critical">Kritik</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Tarih Filtresi</label>
                <select 
                  className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                >
                  <option value="all">Tüm Tarihler</option>
                  <option value="today">Bugün</option>
                  <option value="yesterday">Dün</option>
                  <option value="custom">Özel Tarih</option>
                </select>
              </div>
              
              <div className="space-y-2 flex items-end">
                <Button 
                  variant="outline" 
                  className="border-gray-700 w-full"
                  onClick={() => {
                    setSearchTerm('');
                    setLogLevelFilter('all');
                    setDateFilter('today');
                  }}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtreleri Temizle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-gray-800 border-b border-gray-700 mb-6 w-full md:w-auto overflow-x-auto">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black whitespace-nowrap"
            >
              Tüm Loglar
            </TabsTrigger>
            <TabsTrigger 
              value="system" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black whitespace-nowrap"
            >
              Sistem
            </TabsTrigger>
            <TabsTrigger 
              value="security" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black whitespace-nowrap"
            >
              Güvenlik
            </TabsTrigger>
            <TabsTrigger 
              value="admin" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black whitespace-nowrap"
            >
              Admin
            </TabsTrigger>
            <TabsTrigger 
              value="user" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black whitespace-nowrap"
            >
              Kullanıcı
            </TabsTrigger>
            <TabsTrigger 
              value="transaction" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black whitespace-nowrap"
            >
              İşlemler
            </TabsTrigger>
            <TabsTrigger 
              value="api" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black whitespace-nowrap"
            >
              API
            </TabsTrigger>
            <TabsTrigger 
              value="database" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black whitespace-nowrap"
            >
              Veritabanı
            </TabsTrigger>
          </TabsList>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white flex justify-between">
                <span>Log Kayıtları</span>
                <Badge className="bg-blue-500">{filteredLogs.length} kayıt</Badge>
              </CardTitle>
              <CardDescription>
                {activeTab === 'all' ? 'Tüm kategorilerin' : activeTab} log kayıtları
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 rounded-md border border-gray-700 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-gray-300 w-40">Zaman</TableHead>
                      <TableHead className="text-gray-300 w-24">Seviye</TableHead>
                      <TableHead className="text-gray-300">Mesaj</TableHead>
                      <TableHead className="text-gray-300 w-40">Kaynak</TableHead>
                      <TableHead className="text-gray-300 w-36">Kullanıcı/IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.length > 0 ? (
                      filteredLogs.map((log) => (
                        <Fragment key={log.id}>
                          <TableRow 
                            className="border-b border-gray-700 cursor-pointer hover:bg-gray-850"
                            onClick={() => toggleLogDetails(log.id)}
                          >
                            <TableCell className="text-xs text-gray-300">
                              <div className="flex items-center">
                                <Clock className="h-3 w-3 mr-1 text-gray-400" />
                                {formatTimestamp(log.timestamp)}
                              </div>
                            </TableCell>
                            <TableCell>
                              {getLevelBadge(log.level)}
                            </TableCell>
                            <TableCell className="font-medium text-white">
                              <div className="flex items-center gap-2">
                                {getCategoryIcon(log.category)}
                                <span>{log.message}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {log.source}
                            </TableCell>
                            <TableCell className="text-gray-300">
                              {log.user && (
                                <div className="flex items-center text-xs mb-1">
                                  <User className="h-3 w-3 mr-1 text-blue-400" />
                                  {log.user.username}
                                </div>
                              )}
                              {log.ipAddress && (
                                <div className="flex items-center text-xs">
                                  <Globe className="h-3 w-3 mr-1 text-gray-400" />
                                  {log.ipAddress}
                                </div>
                              )}
                            </TableCell>
                          </TableRow>
                          {expandedLogId === log.id && log.details && (
                            <TableRow className="bg-gray-850 border-b border-gray-700">
                              <TableCell colSpan={5} className="px-4 py-3">
                                <div className="bg-gray-900 p-3 rounded-md border border-gray-700 text-sm text-gray-300">
                                  <div className="font-mono whitespace-pre-wrap">{log.details}</div>
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </Fragment>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-gray-400 py-8">
                          <FileText className="h-12 w-12 mx-auto mb-2 text-gray-500" />
                          <p>Seçili kriterlere uygun log kaydı bulunamadı</p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" className="border-gray-700">
                Daha Fazla Yükle
              </Button>
              
              <div className="text-sm text-gray-400">
                Gösterilen kayıtlar: {filteredLogs.length} / {logEntries.length}
              </div>
            </CardFooter>
          </Card>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Logs;