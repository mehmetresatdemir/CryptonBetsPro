import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  BarChart2, 
  Download, 
  Calendar, 
  Filter,
  RefreshCw,
  Gamepad2,
  DollarSign,
  Users,
  Clock,
  ArrowUp,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const GameReports: React.FC = () => {
  const { translate } = useLanguage();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  
  // Renk paleti
  const COLORS = ['#FFD700', '#FF8C00', '#FF4500', '#8A2BE2', '#4B0082', '#00FF7F', '#1E90FF'];
  
  // Oyun kategorilerinin dağılımı için örnek veri
  const categoryData = [
    { name: 'Slot Oyunları', value: 65 },
    { name: 'Canlı Casino', value: 20 },
    { name: 'Masa Oyunları', value: 10 },
    { name: 'Poker', value: 3 },
    { name: 'Diğer', value: 2 },
  ];
  
  // Günlük oyun istatistikleri için örnek veri
  const dailyGameStats = [
    { date: '2023-05-01', sessions: 3250, uniquePlayers: 1820, avgSessionTime: 28, totalBets: 568400 },
    { date: '2023-05-02', sessions: 3420, uniquePlayers: 1905, avgSessionTime: 32, totalBets: 612500 },
    { date: '2023-05-03', sessions: 3180, uniquePlayers: 1760, avgSessionTime: 25, totalBets: 542300 },
    { date: '2023-05-04', sessions: 3380, uniquePlayers: 1840, avgSessionTime: 30, totalBets: 586700 },
    { date: '2023-05-05', sessions: 3650, uniquePlayers: 2100, avgSessionTime: 35, totalBets: 725800 },
    { date: '2023-05-06', sessions: 4120, uniquePlayers: 2340, avgSessionTime: 40, totalBets: 825600 },
    { date: '2023-05-07', sessions: 4350, uniquePlayers: 2420, avgSessionTime: 38, totalBets: 864200 },
    { date: '2023-05-08', sessions: 3980, uniquePlayers: 2180, avgSessionTime: 33, totalBets: 736400 },
    { date: '2023-05-09', sessions: 3750, uniquePlayers: 2050, avgSessionTime: 30, totalBets: 687500 },
    { date: '2023-05-10', sessions: 3820, uniquePlayers: 2120, avgSessionTime: 32, totalBets: 712400 },
  ];
  
  // Oyun sağlayıcılarının başarı istatistikleri
  const providerStats = [
    { name: 'Pragmatic Play', games: 243, sessions: 154300, ggr: 425800 },
    { name: 'Evolution Gaming', games: 127, sessions: 89700, ggr: 325600 },
    { name: 'NetEnt', games: 186, sessions: 98400, ggr: 287500 },
    { name: 'Play\'n GO', games: 165, sessions: 76800, ggr: 198400 },
    { name: 'Microgaming', games: 212, sessions: 82300, ggr: 217600 },
  ];
  
  // Para biçimlendirme
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };
  
  // Excel'e aktarma fonksiyonu
  const handleExportToExcel = () => {
    toast({
      title: "Rapor İndiriliyor",
      description: "Oyun raporu Excel formatında indiriliyor.",
    });
  };
  
  // Otomatik yenileme fonksiyonu
  const toggleAutoRefresh = () => {
    setIsAutoRefresh(!isAutoRefresh);
    toast({
      title: isAutoRefresh ? "Otomatik Yenileme Kapatıldı" : "Otomatik Yenileme Açıldı",
      description: isAutoRefresh 
        ? "Raporlar otomatik olarak yenilenmeyecek." 
        : "Raporlar her 5 dakikada bir otomatik olarak yenilenecek.",
    });
  };

  return (
    <AdminLayout title="Oyun Raporları">
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Oyun Raporları</h1>
            <p className="text-gray-400">Oyun performansı, kullanıcı etkileşimi ve kazanç raporları</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" className="flex items-center gap-2 border-gray-700" onClick={toggleAutoRefresh}>
              <RefreshCw size={16} className={isAutoRefresh ? "animate-spin" : ""} />
              {isAutoRefresh ? "Oto. Yenileme Açık" : "Oto. Yenileme"}
            </Button>
            <Button variant="outline" className="flex items-center gap-2 border-gray-700" onClick={handleExportToExcel}>
              <Download size={16} />
              Excel'e Aktar
            </Button>
            <Button variant="outline" className="flex items-center gap-2 border-gray-700">
              <Calendar size={16} />
              Tarih
            </Button>
            <Button variant="outline" className="flex items-center gap-2 border-gray-700">
              <Filter size={16} />
              Filtrele
            </Button>
          </div>
        </div>
        
        {/* Zaman Aralığı Seçicisi */}
        <div className="mb-6">
          <Tabs defaultValue="month" value={dateRange} onValueChange={(value) => setDateRange(value as any)} className="w-full">
            <TabsList className="bg-gray-800 border-b border-gray-700 mb-4 w-full md:w-auto justify-start">
              <TabsTrigger 
                value="day" 
                className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
              >
                Bugün
              </TabsTrigger>
              <TabsTrigger 
                value="week" 
                className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
              >
                Bu Hafta
              </TabsTrigger>
              <TabsTrigger 
                value="month" 
                className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
              >
                Bu Ay
              </TabsTrigger>
              <TabsTrigger 
                value="year" 
                className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
              >
                Bu Yıl
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        {/* Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex justify-between items-center">
                <span>Toplam Oyun Oturumu</span>
                <Gamepad2 className="h-5 w-5 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">687,250</div>
              <div className="flex items-center mt-2 text-green-500">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-sm">%12.5 artış</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex justify-between items-center">
                <span>Toplam Oyuncu</span>
                <Users className="h-5 w-5 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">84,520</div>
              <div className="flex items-center mt-2 text-green-500">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-sm">%8.3 artış</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex justify-between items-center">
                <span>Ort. Oturum Süresi</span>
                <Clock className="h-5 w-5 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">32 dk</div>
              <div className="flex items-center mt-2 text-green-500">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-sm">%5.2 artış</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex justify-between items-center">
                <span>Brüt Oyun Geliri</span>
                <DollarSign className="h-5 w-5 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(1250400)}</div>
              <div className="flex items-center mt-2 text-green-500">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-sm">%15.8 artış</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Oyun Oturumları ve Oyuncu Trendi */}
          <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Oyun Oturumları ve Oyuncu Trendi</CardTitle>
              <CardDescription>Son 10 günün oturum ve eşsiz oyuncu trendi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dailyGameStats}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="date" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                      labelStyle={{ color: '#e5e7eb' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="sessions" name="Oturumlar" stroke="#FFD700" activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="uniquePlayers" name="Eşsiz Oyuncular" stroke="#1E90FF" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Oyun Kategorileri Dağılımı */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Oyun Kategorileri</CardTitle>
              <CardDescription>Kategorilere göre oynanma oranı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Oyun Sağlayıcıları Performansı */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <CardHeader>
            <CardTitle className="text-white">Oyun Sağlayıcıları Performansı</CardTitle>
            <CardDescription>Sağlayıcılara göre oyun istatistikleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={providerStats}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                  <XAxis dataKey="name" stroke="#999" />
                  <YAxis stroke="#999" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                    labelStyle={{ color: '#e5e7eb' }}
                  />
                  <Legend />
                  <Bar dataKey="games" name="Oyun Sayısı" fill="#1E90FF" />
                  <Bar dataKey="sessions" name="Oturum Sayısı" fill="#FFD700" />
                  <Bar dataKey="ggr" name="Brüt Oyun Geliri (₺)" fill="#00FF7F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="border-gray-700 w-full">
              Tüm Sağlayıcı İstatistiklerini Görüntüle
            </Button>
          </CardFooter>
        </Card>
        
        {/* En Popüler Oyunlar Tablosu */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">En Popüler Oyunlar</CardTitle>
            <CardDescription>En çok oynanan oyunlar ve performans metrikleri</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead className="bg-gray-900">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Oyun Adı</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Sağlayıcı</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Kategori</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Oturum Sayısı</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Ortalama Bahis</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">RTP</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Trend</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {[
                    { id: 1, name: 'Sweet Bonanza', provider: 'Pragmatic Play', category: 'Slot', sessions: 28450, avgBet: 2.5, rtp: 96.5, trend: 'up' },
                    { id: 2, name: 'Gates of Olympus', provider: 'Pragmatic Play', category: 'Slot', sessions: 24320, avgBet: 2.8, rtp: 96.5, trend: 'up' },
                    { id: 3, name: 'Blackjack VIP', provider: 'Evolution Gaming', category: 'Live Casino', sessions: 18750, avgBet: 25, rtp: 99.5, trend: 'stable' },
                    { id: 4, name: 'Crazy Time', provider: 'Evolution Gaming', category: 'Live Casino', sessions: 16420, avgBet: 15, rtp: 96.8, trend: 'up' },
                    { id: 5, name: 'Wolf Gold', provider: 'Pragmatic Play', category: 'Slot', sessions: 14580, avgBet: 2.2, rtp: 96.0, trend: 'down' },
                  ].map((game) => (
                    <tr key={game.id} className="bg-gray-800 hover:bg-gray-750">
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-white">{game.name}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{game.provider}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{game.category}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{game.sessions.toLocaleString()}</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{game.avgBet}₺</td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-300">{game.rtp}%</td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {game.trend === 'up' ? (
                          <Badge className="bg-green-500">
                            <TrendingUp className="h-3 w-3 mr-1" />
                            Artıyor
                          </Badge>
                        ) : game.trend === 'down' ? (
                          <Badge className="bg-red-500">
                            <TrendingDown className="h-3 w-3 mr-1" />
                            Azalıyor
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-500">
                            Sabit
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" className="border-gray-700">
              Tümünü Görüntüle
            </Button>
            <div className="text-sm text-gray-400">
              Son 30 gün için veriler gösteriliyor
            </div>
          </CardFooter>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default GameReports;