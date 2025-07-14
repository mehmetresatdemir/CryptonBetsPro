import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Gift, 
  Plus, 
  Edit, 
  Trash, 
  Calendar, 
  Users, 
  Percent, 
  Clock,
  CheckCircle2,
  XCircle,
  ArrowDown,
  ArrowUp
} from 'lucide-react';

// Promosyon tipi
type Promotion = {
  id: number;
  name: string;
  code: string;
  type: string;
  value: number;
  minDeposit: number;
  maxBonus: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'inactive' | 'upcoming' | 'expired';
  usageLimit: number;
  usageCount: number;
  description: string;
  userGroups: string[];
  wageringRequirement: number;
};

const Promotions: React.FC = () => {
  const { translate } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('active');
  
  // Promosyonlar için örnek veri
  const [promotions, setPromotions] = useState<Promotion[]>([
    {
      id: 1,
      name: 'Hoşgeldin Bonusu',
      code: 'WELCOME100',
      type: 'percentage',
      value: 100,
      minDeposit: 100,
      maxBonus: 1000,
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      status: 'active',
      usageLimit: 1,
      usageCount: 287,
      description: 'Yeni üyelere özel ilk para yatırma bonusu',
      userGroups: ['new_users'],
      wageringRequirement: 25
    },
    {
      id: 2,
      name: 'Hafta Sonu Reload',
      code: 'WEEKEND50',
      type: 'percentage',
      value: 50,
      minDeposit: 200,
      maxBonus: 500,
      startDate: '2023-05-01',
      endDate: '2023-08-31',
      status: 'active',
      usageLimit: 0,
      usageCount: 145,
      description: 'Hafta sonu para yatırmalarına özel reload bonusu',
      userGroups: ['all_users'],
      wageringRequirement: 20
    },
    {
      id: 3,
      name: 'VIP Özel Teklif',
      code: 'VIP200',
      type: 'percentage',
      value: 200,
      minDeposit: 500,
      maxBonus: 2000,
      startDate: '2023-05-15',
      endDate: '2023-05-30',
      status: 'active',
      usageLimit: 1,
      usageCount: 28,
      description: 'VIP kullanıcılara özel yüksek bonus oranı',
      userGroups: ['vip_gold', 'vip_platinum', 'vip_diamond'],
      wageringRequirement: 30
    },
    {
      id: 4,
      name: 'Özel Doğum Günü Bonusu',
      code: 'BIRTHDAY',
      type: 'fixed',
      value: 100,
      minDeposit: 0,
      maxBonus: 100,
      startDate: '2023-01-01',
      endDate: '2023-12-31',
      status: 'active',
      usageLimit: 1,
      usageCount: 124,
      description: 'Doğum gününde otomatik olarak verilen bonus',
      userGroups: ['all_users'],
      wageringRequirement: 15
    },
    {
      id: 5,
      name: 'Yaz Kampanyası',
      code: 'SUMMER2023',
      type: 'percentage',
      value: 75,
      minDeposit: 300,
      maxBonus: 1500,
      startDate: '2023-06-01',
      endDate: '2023-08-31',
      status: 'upcoming',
      usageLimit: 3,
      usageCount: 0,
      description: 'Yaz aylarına özel bonus kampanyası',
      userGroups: ['all_users'],
      wageringRequirement: 22
    },
    {
      id: 6,
      name: 'BlackFriday Özel',
      code: 'BF2022',
      type: 'percentage',
      value: 150,
      minDeposit: 250,
      maxBonus: 2500,
      startDate: '2022-11-25',
      endDate: '2022-11-28',
      status: 'expired',
      usageLimit: 1,
      usageCount: 314,
      description: 'BlackFriday\'e özel sınırlı süreli bonus',
      userGroups: ['all_users'],
      wageringRequirement: 35
    },
    {
      id: 7,
      name: 'Nakit İade',
      code: 'CASHBACK25',
      type: 'cashback',
      value: 25,
      minDeposit: 500,
      maxBonus: 1000,
      startDate: '2023-04-01',
      endDate: '2023-06-30',
      status: 'active',
      usageLimit: 0,
      usageCount: 98,
      description: 'Haftalık kayıplara nakit iade bonusu',
      userGroups: ['all_users'],
      wageringRequirement: 10
    }
  ]);
  
  // Aktif sekmedeki promosyonları filtrele
  const filteredPromotions = promotions.filter(promotion => {
    if (activeTab === 'all') return true;
    return promotion.status === activeTab;
  });
  
  // Promosyon durumunu değiştirme işlevi
  const handleToggleStatus = (id: number) => {
    setPromotions(promotions.map(promotion => 
      promotion.id === id ? { 
        ...promotion, 
        status: promotion.status === 'active' ? 'inactive' : 'active' 
      } : promotion
    ));
    
    toast({
      title: "Promosyon Durumu Değiştirildi",
      description: "Promosyon durumu başarıyla güncellendi.",
    });
  };
  
  // Promosyon silme işlevi
  const handleDeletePromotion = (id: number) => {
    toast({
      title: "Promosyon Silindi",
      description: `${id} ID'li promosyon silindi.`,
      variant: "destructive",
    });
  };
  
  // Durum rengini belirleme yardımcı işlevi
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500 hover:bg-green-600';
      case 'inactive':
        return 'bg-red-500 hover:bg-red-600';
      case 'upcoming':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'expired':
        return 'bg-gray-500 hover:bg-gray-600';
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
      case 'upcoming':
        return 'Yaklaşan';
      case 'expired':
        return 'Süresi Dolmuş';
      default:
        return status;
    }
  };
  
  return (
    <AdminLayout title="Promosyonlar">
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Promosyonlar</h1>
            <p className="text-gray-400">Bonuslar, promosyonlar ve kampanyaları yönetin</p>
          </div>
          
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-black flex items-center gap-2">
            <Plus size={16} />
            Yeni Promosyon
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex justify-between items-center">
                <span>Aktif Promosyonlar</span>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{promotions.filter(p => p.status === 'active').length}</div>
              <p className="text-sm text-gray-400 mt-1">
                {promotions.filter(p => p.status === 'active' && new Date(p.endDate) < new Date(new Date().setDate(new Date().getDate() + 7))).length} promosyon bu hafta sona eriyor
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex justify-between items-center">
                <span>Yaklaşan Promosyonlar</span>
                <Clock className="h-5 w-5 text-blue-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{promotions.filter(p => p.status === 'upcoming').length}</div>
              <p className="text-sm text-gray-400 mt-1">
                {promotions.filter(p => p.status === 'upcoming' && new Date(p.startDate) < new Date(new Date().setDate(new Date().getDate() + 7))).length} promosyon bu hafta başlıyor
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex justify-between items-center">
                <span>Toplam Kullanım</span>
                <Users className="h-5 w-5 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{promotions.reduce((acc, curr) => acc + curr.usageCount, 0)}</div>
              <div className="flex items-center mt-2 text-green-500">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-sm">%12.5 artış</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex justify-between items-center">
                <span>Verilen Bonus</span>
                <Percent className="h-5 w-5 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">₺248,950</div>
              <div className="flex items-center mt-2 text-green-500">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-sm">%8.3 artış</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-gray-800 border-b border-gray-700 mb-6 w-full md:w-auto justify-start">
            <TabsTrigger 
              value="active" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              Aktif ({promotions.filter(p => p.status === 'active').length})
            </TabsTrigger>
            <TabsTrigger 
              value="upcoming" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              Yaklaşan ({promotions.filter(p => p.status === 'upcoming').length})
            </TabsTrigger>
            <TabsTrigger 
              value="inactive" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              Pasif ({promotions.filter(p => p.status === 'inactive').length})
            </TabsTrigger>
            <TabsTrigger 
              value="expired" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              Süresi Dolmuş ({promotions.filter(p => p.status === 'expired').length})
            </TabsTrigger>
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              Tümü ({promotions.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-0">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-white">Promosyon Listesi</CardTitle>
                    <CardDescription>
                      {filteredPromotions.length} promosyon listeleniyor
                    </CardDescription>
                  </div>
                  
                  <div className="relative w-64">
                    <Input 
                      placeholder="Promosyon ara..." 
                      className="bg-gray-900 border-gray-700 pl-9"
                    />
                    <Gift className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table className="border-collapse">
                  <TableHeader className="bg-gray-900">
                    <TableRow>
                      <TableHead className="text-gray-300">Promosyon</TableHead>
                      <TableHead className="text-gray-300">Kod</TableHead>
                      <TableHead className="text-gray-300">Tip / Değer</TableHead>
                      <TableHead className="text-gray-300">Tarih Aralığı</TableHead>
                      <TableHead className="text-gray-300">Limit / Kullanım</TableHead>
                      <TableHead className="text-gray-300">Durum</TableHead>
                      <TableHead className="text-gray-300">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPromotions.map((promotion) => (
                      <TableRow key={promotion.id} className="border-b border-gray-700">
                        <TableCell className="font-medium">
                          <div>
                            <div className="text-white">{promotion.name}</div>
                            <div className="text-xs text-gray-400">{promotion.description.substring(0, 40)}...</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-yellow-500/30 text-yellow-500 font-mono">
                            {promotion.code}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="capitalize">{promotion.type}</div>
                            <div className="text-xs text-gray-400">
                              {promotion.type === 'percentage' ? `${promotion.value}% (Max: ${promotion.maxBonus}₺)` : 
                                promotion.type === 'fixed' ? `${promotion.value}₺` : 
                                  `${promotion.value}% cashback`}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>{promotion.startDate}</div>
                            <div className="text-xs text-gray-400">to {promotion.endDate}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div>
                              {promotion.usageLimit > 0 
                                ? `${promotion.usageCount}/${promotion.usageLimit}` 
                                : `${promotion.usageCount} (Sınırsız)`}
                            </div>
                            <div className="text-xs text-gray-400">
                              Min. Yatırım: {promotion.minDeposit}₺
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(promotion.status)}>
                            {getStatusText(promotion.status)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-yellow-500"
                              onClick={() => toast({
                                title: "Promosyon Düzenleniyor",
                                description: `${promotion.name} promosyonu düzenleniyor.`,
                              })}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {(promotion.status === 'active' || promotion.status === 'upcoming') && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-red-500"
                                onClick={() => handleToggleStatus(promotion.id)}
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
                            {promotion.status === 'inactive' && (
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-green-500"
                                onClick={() => handleToggleStatus(promotion.id)}
                              >
                                <CheckCircle2 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-red-500"
                              onClick={() => handleDeletePromotion(promotion.id)}
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
                  Tümünü Dışa Aktar
                </Button>
                <div className="text-sm text-gray-400">
                  Kullanılan Bonus: <span className="text-white font-medium">248,950₺</span>
                </div>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Promotions;