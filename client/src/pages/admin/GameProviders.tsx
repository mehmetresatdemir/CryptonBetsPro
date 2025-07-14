import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash, 
  Play, 
  Pause, 
  Clock, 
  BarChart2, 
  Settings,
  Image,
  ArrowUp,
  ArrowDown,
  Save,
  RefreshCw
} from 'lucide-react';

// Oyun sağlayıcı tipi
type GameProvider = {
  id: number;
  name: string;
  logo: string;
  apiKey: string;
  status: 'active' | 'inactive' | 'maintenance';
  gameCount: number;
  category: string;
  popularity: number;
  integrationDate: string;
  rtp: number;
};

const GameProviders: React.FC = () => {
  const { translate } = useLanguage();
  const { toast } = useToast();
  
  // Oyun sağlayıcıları için örnek veri
  const [providers, setProviders] = useState<GameProvider[]>([
    { id: 1, name: 'Pragmatic Play', logo: '/src/assets/pragmatic.png', apiKey: 'pk_live_pragmatic_12345', status: 'active', gameCount: 243, category: 'Slots, Live Casino', popularity: 89, integrationDate: '2022-03-10', rtp: 96.5 },
    { id: 2, name: 'Evolution Gaming', logo: '/src/assets/evolution.png', apiKey: 'pk_live_evolution_67890', status: 'active', gameCount: 127, category: 'Live Casino', popularity: 92, integrationDate: '2022-02-15', rtp: 97.8 },
    { id: 3, name: 'NetEnt', logo: '/src/assets/netent.png', apiKey: 'pk_live_netent_54321', status: 'active', gameCount: 186, category: 'Slots', popularity: 85, integrationDate: '2022-04-05', rtp: 96.2 },
    { id: 4, name: 'Play\'n GO', logo: '/src/assets/playngo.png', apiKey: 'pk_live_playngo_09876', status: 'maintenance', gameCount: 165, category: 'Slots', popularity: 80, integrationDate: '2022-05-12', rtp: 95.8 },
    { id: 5, name: 'Microgaming', logo: '/src/assets/microgaming.png', apiKey: 'pk_live_microgaming_13579', status: 'active', gameCount: 212, category: 'Slots, Table Games', popularity: 87, integrationDate: '2022-01-20', rtp: 96.0 },
    { id: 6, name: 'Quickspin', logo: '/src/assets/quickspin.png', apiKey: 'pk_live_quickspin_24680', status: 'active', gameCount: 98, category: 'Slots', popularity: 78, integrationDate: '2022-06-08', rtp: 95.9 },
    { id: 7, name: 'Yggdrasil', logo: '/src/assets/yggdrasil.png', apiKey: 'pk_live_yggdrasil_97531', status: 'active', gameCount: 114, category: 'Slots', popularity: 82, integrationDate: '2022-04-22', rtp: 96.3 },
    { id: 8, name: 'Big Time Gaming', logo: '/src/assets/btg.png', apiKey: 'pk_live_btg_86420', status: 'inactive', gameCount: 76, category: 'Slots', popularity: 75, integrationDate: '2022-07-15', rtp: 96.0 }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showUpdateStatus, setShowUpdateStatus] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Filtrelenmiş sağlayıcıları hesapla
  const filteredProviders = providers.filter(provider => {
    // Arama filtresi
    const matchesSearch = provider.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Durum filtresi
    const matchesStatus = statusFilter === 'all' || provider.status === statusFilter;
    
    // Kategori filtresi
    const matchesCategory = categoryFilter === 'all' || provider.category.includes(categoryFilter);
    
    return matchesSearch && matchesStatus && matchesCategory;
  });
  
  // Durumu değiştirme işlevi
  const handleToggleStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    setProviders(providers.map(provider => 
      provider.id === id ? { ...provider, status: newStatus as 'active' | 'inactive' | 'maintenance' } : provider
    ));
    
    toast({
      title: "Sağlayıcı Durumu Değiştirildi",
      description: `Sağlayıcı durumu ${newStatus === 'active' ? 'aktif' : 'pasif'} olarak güncellendi.`,
    });
  };
  
  // Bakıma alma işlevi
  const handleSetMaintenance = (id: number) => {
    setProviders(providers.map(provider => 
      provider.id === id ? { ...provider, status: 'maintenance' } : provider
    ));
    
    toast({
      title: "Bakım Modu Aktifleştirildi",
      description: "Sağlayıcı bakım moduna alındı.",
    });
  };
  
  // Sağlayıcı silme işlevi
  const handleDeleteProvider = (id: number) => {
    toast({
      title: "Sağlayıcı Silindi",
      description: `${id} ID'li sağlayıcı silindi.`,
      variant: "destructive",
    });
  };
  
  // Tüm sağlayıcıları güncelleme işlevi
  const handleUpdateAll = () => {
    setIsUpdating(true);
    setShowUpdateStatus(true);
    
    // Gerçek uygulamada burada bir API isteği olur
    setTimeout(() => {
      setIsUpdating(false);
      toast({
        title: "Güncelleme Tamamlandı",
        description: "Tüm oyun sağlayıcıları başarıyla güncellendi.",
      });
    }, 3000);
  };
  
  // Durum rengini belirleme yardımcı işlevi
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 hover:bg-green-600';
      case 'inactive':
        return 'bg-red-500 hover:bg-red-600';
      case 'maintenance':
        return 'bg-yellow-500 hover:bg-yellow-600 text-black';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  // Durum metnini belirleme yardımcı işlevi
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Aktif';
      case 'inactive':
        return 'Pasif';
      case 'maintenance':
        return 'Bakımda';
      default:
        return status;
    }
  };

  return (
    <AdminLayout title="Oyun Sağlayıcıları">
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Oyun Sağlayıcıları</h1>
            <p className="text-gray-400">Slot ve casino oyun sağlayıcılarını yönetin</p>
          </div>
          
          <div className="flex gap-2">
            {showUpdateStatus && (
              <div className={`flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg ${isUpdating ? 'text-yellow-500' : 'text-green-500'}`}>
                {isUpdating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Güncelleniyor...</span>
                  </>
                ) : (
                  <>
                    <ArrowUp className="h-4 w-4" />
                    <span>Güncel</span>
                  </>
                )}
              </div>
            )}
            
            <Button 
              variant="outline" 
              className="border-gray-700 flex items-center gap-2"
              onClick={handleUpdateAll}
              disabled={isUpdating}
            >
              <RefreshCw className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
              Sağlayıcıları Güncelle
            </Button>
            
            <Button className="bg-yellow-500 hover:bg-yellow-600 text-black flex items-center gap-2">
              <Plus size={16} />
              Yeni Sağlayıcı
            </Button>
          </div>
        </div>
        
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Filtreler ve Arama</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Sağlayıcı Ara</Label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    id="search"
                    placeholder="Sağlayıcı adı ara..."
                    className="bg-gray-900 border-gray-700 pl-9"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="status-filter">Durum Filtresi</Label>
                <select 
                  id="status-filter"
                  className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                  <option value="maintenance">Bakımda</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="category-filter">Kategori Filtresi</Label>
                <select 
                  id="category-filter"
                  className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                >
                  <option value="all">Tüm Kategoriler</option>
                  <option value="Slots">Slot Oyunları</option>
                  <option value="Live Casino">Canlı Casino</option>
                  <option value="Table Games">Masa Oyunları</option>
                </select>
              </div>
              
              <div className="space-y-2 flex items-end">
                <Button 
                  variant="outline" 
                  className="border-gray-700 w-full"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                    setCategoryFilter('all');
                  }}
                >
                  Filtreleri Temizle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Oyun Sağlayıcıları Listesi</CardTitle>
            <CardDescription>
              Toplam {filteredProviders.length} sağlayıcı listeleniyor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="border-collapse">
              <TableHeader className="bg-gray-900">
                <TableRow>
                  <TableHead className="text-gray-300">Sağlayıcı</TableHead>
                  <TableHead className="text-gray-300">Durum</TableHead>
                  <TableHead className="text-gray-300">Oyun Sayısı</TableHead>
                  <TableHead className="text-gray-300">Kategori</TableHead>
                  <TableHead className="text-gray-300">Popülerlik</TableHead>
                  <TableHead className="text-gray-300">Ortalama RTP</TableHead>
                  <TableHead className="text-gray-300">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProviders.map((provider) => (
                  <TableRow key={provider.id} className="border-b border-gray-700">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-900 rounded-md flex items-center justify-center">
                          <Image className="h-6 w-6 text-yellow-500" />
                        </div>
                        <div>
                          <div className="text-white">{provider.name}</div>
                          <div className="text-xs text-gray-400">Entegrasyon: {provider.integrationDate}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(provider.status)}>
                        {getStatusText(provider.status)}
                      </Badge>
                    </TableCell>
                    <TableCell>{provider.gameCount}</TableCell>
                    <TableCell>{provider.category}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-gray-900 rounded-full overflow-hidden">
                          <div 
                            className="h-full bg-yellow-500" 
                            style={{ width: `${provider.popularity}%` }}
                          ></div>
                        </div>
                        <span>{provider.popularity}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{provider.rtp}%</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-yellow-500"
                          onClick={() => toast({
                            title: "Sağlayıcı Düzenleniyor",
                            description: `${provider.name} sağlayıcısı düzenleniyor.`,
                          })}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-yellow-500"
                          onClick={() => toast({
                            title: "Oyunlar Görüntüleniyor",
                            description: `${provider.name} sağlayıcısının oyunları görüntüleniyor.`,
                          })}
                        >
                          <Play className="h-4 w-4" />
                        </Button>
                        {provider.status === 'active' ? (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-red-500"
                            onClick={() => handleToggleStatus(provider.id, provider.status)}
                          >
                            <Pause className="h-4 w-4" />
                          </Button>
                        ) : provider.status === 'inactive' ? (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-green-500"
                            onClick={() => handleToggleStatus(provider.id, provider.status)}
                          >
                            <Play className="h-4 w-4" />
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-blue-500"
                            onClick={() => handleToggleStatus(provider.id, 'inactive')}
                          >
                            <Settings className="h-4 w-4" />
                          </Button>
                        )}
                        {provider.status !== 'maintenance' && (
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 w-8 p-0 text-yellow-500"
                            onClick={() => handleSetMaintenance(provider.id)}
                          >
                            <Clock className="h-4 w-4" />
                          </Button>
                        )}
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          className="h-8 w-8 p-0 text-red-500"
                          onClick={() => handleDeleteProvider(provider.id)}
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
          <CardFooter className="flex justify-between">
            <Button variant="outline" className="border-gray-700">
              <Image className="h-4 w-4 mr-2" />
              Logoları Yönet
            </Button>
            <Button variant="outline" className="border-gray-700">
              <BarChart2 className="h-4 w-4 mr-2" />
              Performans Raporu
            </Button>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default GameProviders;