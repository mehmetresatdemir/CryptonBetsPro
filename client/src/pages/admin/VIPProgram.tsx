import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Star, 
  Plus, 
  Edit, 
  Trash, 
  Gift, 
  Trophy, 
  Users, 
  Coins,
  History,
  Calendar,
  ArrowUp,
  Save
} from 'lucide-react';

// VIP seviye tipleri
type VipLevel = {
  id: number;
  name: string;
  requiredPoints: number;
  cashbackRate: number;
  withdrawalLimit: number;
  personalManager: boolean;
  specialOffers: boolean;
  birthdayBonus: number;
  depositBonus: number;
  color: string;
  users: number;
};

type VipUser = {
  id: number;
  username: string;
  level: string;
  currentPoints: number;
  totalDeposits: number;
  joinDate: string;
  lastLogin: string;
};

const VIPProgram: React.FC = () => {
  const { translate } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('levels');
  
  // VIP seviyeleri için örnek veri
  const vipLevels: VipLevel[] = [
    {
      id: 1,
      name: 'Bronze',
      requiredPoints: 0,
      cashbackRate: 5,
      withdrawalLimit: 10000,
      personalManager: false,
      specialOffers: false,
      birthdayBonus: 50,
      depositBonus: 5,
      color: '#CD7F32',
      users: 3240
    },
    {
      id: 2,
      name: 'Silver',
      requiredPoints: 1000,
      cashbackRate: 7,
      withdrawalLimit: 25000,
      personalManager: false,
      specialOffers: true,
      birthdayBonus: 100,
      depositBonus: 10,
      color: '#C0C0C0',
      users: 875
    },
    {
      id: 3,
      name: 'Gold',
      requiredPoints: 5000,
      cashbackRate: 10,
      withdrawalLimit: 50000,
      personalManager: true,
      specialOffers: true,
      birthdayBonus: 250,
      depositBonus: 15,
      color: '#FFD700',
      users: 342
    },
    {
      id: 4,
      name: 'Platinum',
      requiredPoints: 15000,
      cashbackRate: 15,
      withdrawalLimit: 100000,
      personalManager: true,
      specialOffers: true,
      birthdayBonus: 500,
      depositBonus: 20,
      color: '#E5E4E2',
      users: 128
    },
    {
      id: 5,
      name: 'Diamond',
      requiredPoints: 50000,
      cashbackRate: 20,
      withdrawalLimit: 250000,
      personalManager: true,
      specialOffers: true,
      birthdayBonus: 1000,
      depositBonus: 25,
      color: '#B9F2FF',
      users: 45
    }
  ];
  
  // VIP kullanıcıları için örnek veri
  const vipUsers: VipUser[] = [
    { id: 1, username: 'johndoe', level: 'Diamond', currentPoints: 53420, totalDeposits: 175800, joinDate: '2022-03-14', lastLogin: '2023-05-20' },
    { id: 2, username: 'player1', level: 'Gold', currentPoints: 7834, totalDeposits: 42500, joinDate: '2022-06-22', lastLogin: '2023-05-19' },
    { id: 3, username: 'luckystar', level: 'Platinum', currentPoints: 16420, totalDeposits: 84300, joinDate: '2022-02-05', lastLogin: '2023-05-20' },
    { id: 4, username: 'casinolover', level: 'Gold', currentPoints: 6128, totalDeposits: 39200, joinDate: '2022-08-17', lastLogin: '2023-05-15' },
    { id: 5, username: 'gamblerman', level: 'Silver', currentPoints: 2845, totalDeposits: 18700, joinDate: '2022-11-02', lastLogin: '2023-05-12' },
  ];
  
  const [selectedLevel, setSelectedLevel] = useState<VipLevel | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Seviye düzenleme
  const handleEditLevel = (level: VipLevel) => {
    setSelectedLevel(level);
    setIsEditing(true);
    
    toast({
      title: "Seviye Düzenleniyor",
      description: `${level.name} seviyesi düzenleniyor.`,
    });
  };
  
  // Seviye düzenlemeyi kaydetme
  const handleSaveLevel = () => {
    setIsEditing(false);
    setSelectedLevel(null);
    
    toast({
      title: "Seviye Güncellendi",
      description: "VIP seviyesi başarıyla güncellendi.",
    });
  };
  
  // Yeni seviye ekleme
  const handleAddLevel = () => {
    toast({
      title: "Yeni Seviye",
      description: "Yeni VIP seviyesi ekleme formu açıldı.",
    });
  };
  
  // Seviyeyi silme
  const handleDeleteLevel = (id: number) => {
    toast({
      title: "Seviye Silindi",
      description: `${id} ID'li VIP seviyesi silindi.`,
      variant: "destructive",
    });
  };
  
  return (
    <AdminLayout title="VIP Programı">
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">VIP Programı Yönetimi</h1>
            <p className="text-gray-400">VIP seviyeleri, kullanıcıları ve özel teklifleri yönetin</p>
          </div>
          
          <Button onClick={handleAddLevel} className="bg-yellow-500 hover:bg-yellow-600 text-black flex items-center gap-2">
            <Plus size={16} />
            Yeni VIP Seviyesi
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex justify-between items-center">
                <span>Toplam VIP Üyeler</span>
                <Users className="h-5 w-5 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">4,630</div>
              <div className="flex items-center mt-2 text-green-500">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-sm">%5.2 artış</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex justify-between items-center">
                <span>Toplam Cashback</span>
                <Coins className="h-5 w-5 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">₺428,650</div>
              <div className="flex items-center mt-2 text-green-500">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-sm">%12.8 artış</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex justify-between items-center">
                <span>VIP Depozitler</span>
                <Coins className="h-5 w-5 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">₺2,845,900</div>
              <div className="flex items-center mt-2 text-green-500">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-sm">%7.5 artış</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex justify-between items-center">
                <span>Aylık VIP Bonuslar</span>
                <Gift className="h-5 w-5 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">₺168,420</div>
              <div className="flex items-center mt-2 text-green-500">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-sm">%3.2 artış</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <Tabs defaultValue="levels" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-gray-800 border-b border-gray-700 mb-6 w-full md:w-auto justify-start">
            <TabsTrigger 
              value="levels" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              VIP Seviyeleri
            </TabsTrigger>
            <TabsTrigger 
              value="users" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              VIP Kullanıcıları
            </TabsTrigger>
            <TabsTrigger 
              value="offers" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              Özel Teklifler
            </TabsTrigger>
          </TabsList>
          
          {/* VIP Seviyeleri Sekmesi */}
          <TabsContent value="levels" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">VIP Seviyeleri ve Avantajları</CardTitle>
                <CardDescription>
                  VIP programının seviyelerini ve her seviyenin sağladığı avantajları yönetin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table className="border-collapse">
                  <TableHeader className="bg-gray-900">
                    <TableRow>
                      <TableHead className="text-gray-300">Seviye</TableHead>
                      <TableHead className="text-gray-300">Gerekli Puan</TableHead>
                      <TableHead className="text-gray-300">Cashback</TableHead>
                      <TableHead className="text-gray-300">Para Çekme Limiti</TableHead>
                      <TableHead className="text-gray-300">Kişisel Yönetici</TableHead>
                      <TableHead className="text-gray-300">Kullanıcı Sayısı</TableHead>
                      <TableHead className="text-gray-300">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vipLevels.map((level) => (
                      <TableRow key={level.id} className="border-b border-gray-700">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{backgroundColor: level.color}}></div>
                            <span className="text-white">{level.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{level.requiredPoints.toLocaleString()}</TableCell>
                        <TableCell>%{level.cashbackRate}</TableCell>
                        <TableCell>{level.withdrawalLimit.toLocaleString()}₺</TableCell>
                        <TableCell>{level.personalManager ? "Evet" : "Hayır"}</TableCell>
                        <TableCell>{level.users.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-yellow-500"
                              onClick={() => handleEditLevel(level)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-red-500"
                              onClick={() => handleDeleteLevel(level.id)}
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
            
            {isEditing && selectedLevel && (
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Seviye Düzenle: {selectedLevel.name}</CardTitle>
                  <CardDescription>
                    VIP seviyesinin detaylarını ve avantajlarını düzenleyin
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="level-name">Seviye Adı</Label>
                      <Input 
                        id="level-name"
                        defaultValue={selectedLevel.name} 
                        className="bg-gray-900 border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="required-points">Gerekli Puan</Label>
                      <Input 
                        id="required-points"
                        type="number"
                        defaultValue={selectedLevel.requiredPoints} 
                        className="bg-gray-900 border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cashback-rate">Cashback Oranı (%)</Label>
                      <Input 
                        id="cashback-rate"
                        type="number"
                        defaultValue={selectedLevel.cashbackRate} 
                        className="bg-gray-900 border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="withdrawal-limit">Para Çekme Limiti (₺)</Label>
                      <Input 
                        id="withdrawal-limit"
                        type="number"
                        defaultValue={selectedLevel.withdrawalLimit} 
                        className="bg-gray-900 border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="birthday-bonus">Doğum Günü Bonusu (₺)</Label>
                      <Input 
                        id="birthday-bonus"
                        type="number"
                        defaultValue={selectedLevel.birthdayBonus} 
                        className="bg-gray-900 border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="deposit-bonus">Para Yatırma Bonusu (%)</Label>
                      <Input 
                        id="deposit-bonus"
                        type="number"
                        defaultValue={selectedLevel.depositBonus} 
                        className="bg-gray-900 border-gray-700"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="color">Seviye Rengi</Label>
                      <div className="flex gap-2">
                        <Input 
                          id="color"
                          type="color"
                          defaultValue={selectedLevel.color} 
                          className="bg-gray-900 border-gray-700 w-12 h-10"
                        />
                        <Input 
                          defaultValue={selectedLevel.color} 
                          className="bg-gray-900 border-gray-700 flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    className="border-gray-700"
                    onClick={() => setIsEditing(false)}
                  >
                    İptal
                  </Button>
                  <Button 
                    className="bg-yellow-500 hover:bg-yellow-600 text-black"
                    onClick={handleSaveLevel}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Değişiklikleri Kaydet
                  </Button>
                </CardFooter>
              </Card>
            )}
          </TabsContent>
          
          {/* VIP Kullanıcıları Sekmesi */}
          <TabsContent value="users" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">VIP Kullanıcıları</CardTitle>
                <CardDescription>
                  VIP programına dahil olan kullanıcıları görüntüleyin ve yönetin
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="relative">
                    <Input 
                      placeholder="Kullanıcı ara..." 
                      className="bg-gray-900 border-gray-700 pl-10 w-64"
                    />
                    <Users className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" className="border-gray-700">
                      <Trophy className="h-4 w-4 mr-2" />
                      Kullanıcı Yükselt
                    </Button>
                    <Button variant="outline" className="border-gray-700">
                      <Gift className="h-4 w-4 mr-2" />
                      Bonus Gönder
                    </Button>
                  </div>
                </div>
                
                <Table className="border-collapse">
                  <TableHeader className="bg-gray-900">
                    <TableRow>
                      <TableHead className="text-gray-300">Kullanıcı Adı</TableHead>
                      <TableHead className="text-gray-300">VIP Seviyesi</TableHead>
                      <TableHead className="text-gray-300">Mevcut Puanlar</TableHead>
                      <TableHead className="text-gray-300">Toplam Para Yatırma</TableHead>
                      <TableHead className="text-gray-300">Kayıt Tarihi</TableHead>
                      <TableHead className="text-gray-300">Son Giriş</TableHead>
                      <TableHead className="text-gray-300">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vipUsers.map((user) => (
                      <TableRow key={user.id} className="border-b border-gray-700">
                        <TableCell className="font-medium text-white">{user.username}</TableCell>
                        <TableCell>
                          <Badge className="bg-yellow-500 text-black font-medium">
                            {user.level}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.currentPoints.toLocaleString()}</TableCell>
                        <TableCell>{user.totalDeposits.toLocaleString()}₺</TableCell>
                        <TableCell>{user.joinDate}</TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-yellow-500"
                            >
                              <History className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 w-8 p-0 text-yellow-500"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Özel Teklifler Sekmesi */}
          <TabsContent value="offers" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">VIP Özel Teklifleri</CardTitle>
                <CardDescription>
                  VIP kullanıcıları için özel bonuslar ve promosyonlar
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-center mb-4">
                  <div className="relative">
                    <Input 
                      placeholder="Teklif ara..." 
                      className="bg-gray-900 border-gray-700 pl-10 w-64"
                    />
                    <Gift className="h-4 w-4 text-gray-400 absolute left-3 top-3" />
                  </div>
                  
                  <Button className="bg-yellow-500 hover:bg-yellow-600 text-black flex items-center gap-2">
                    <Plus size={16} />
                    Yeni Teklif Ekle
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Örnek teklifler */}
                  {[
                    { id: 1, name: 'VIP Exclusive Reload Bonus', description: 'Gold ve üzeri VIP üyelere özel %100 para yatırma bonusu', validUntil: '2023-06-30', target: 'Gold, Platinum, Diamond', active: true },
                    { id: 2, name: 'Diamond Birthday Gift', description: 'Diamond seviyesi kullanıcılara özel doğum günü hediyesi: 1000₺ bonus + 100 free spin', validUntil: 'Süresiz', target: 'Diamond', active: true },
                    { id: 3, name: 'VIP Weekend Cashback', description: 'Tüm VIP üyelere özel, hafta sonu kayıplarına %25\'e kadar ekstra cashback', validUntil: '2023-05-31', target: 'All VIP Levels', active: true },
                    { id: 4, name: 'Platinum & Diamond Tournament', description: 'Platinum ve Diamond üyelere özel 50,000₺ ödül havuzlu turnuva', validUntil: '2023-05-25', target: 'Platinum, Diamond', active: false },
                  ].map((offer) => (
                    <Card key={offer.id} className="bg-gray-900 border-gray-700">
                      <CardHeader>
                        <div className="flex justify-between items-start">
                          <CardTitle className="text-white">{offer.name}</CardTitle>
                          <Badge 
                            variant={offer.active ? 'default' : 'secondary'}
                            className={offer.active ? 'bg-green-500 hover:bg-green-600' : 'bg-gray-600 hover:bg-gray-700'}
                          >
                            {offer.active ? 'Aktif' : 'Pasif'}
                          </Badge>
                        </div>
                        <CardDescription>{offer.description}</CardDescription>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex flex-col gap-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Geçerlilik Tarihi:</span>
                            <span className="text-white font-medium">{offer.validUntil}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Hedef Seviyeler:</span>
                            <span className="text-white font-medium">{offer.target}</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button 
                          variant="outline" 
                          className="border-gray-700 text-yellow-500"
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Düzenle
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-gray-700 text-red-500"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Sil
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default VIPProgram;