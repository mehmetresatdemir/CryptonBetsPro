import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  ArrowDown, 
  ArrowUp, 
  Download, 
  Calendar, 
  Filter,
  RefreshCw
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
  LineChart as RechartLine,
  Line,
  PieChart as RechartPie,
  Pie,
  Cell
} from 'recharts';

// Örnek veri tanımlamaları
type DailyReportType = {
  date: string;
  deposits: number;
  withdrawals: number;
  netProfit: number;
  ggr: number;
  newUsers: number;
  activeUsers: number;
};

type PaymentMethodReportType = {
  method: string;
  deposits: number;
  withdrawals: number;
  transactions: number;
  percentage: number;
};

type GameCategoryReport = {
  category: string;
  bets: number;
  wins: number;
  ggr: number;
  players: number;
  percentage: number;
};

const FinancialReports: React.FC = () => {
  const { translate } = useLanguage();
  const { toast } = useToast();
  const [dateRange, setDateRange] = useState<'day' | 'week' | 'month' | 'year'>('month');
  const [isAutoRefresh, setIsAutoRefresh] = useState(false);
  
  // Renk paleti
  const COLORS = ['#FFD700', '#FF8C00', '#FF4500', '#8A2BE2', '#4B0082', '#00FF7F', '#1E90FF'];
  
  // Günlük finansal rapor verisi (örnek)
  const dailyReports: DailyReportType[] = [
    { date: '01.05.2023', deposits: 124500, withdrawals: 87300, netProfit: 37200, ggr: 28400, newUsers: 85, activeUsers: 1240 },
    { date: '02.05.2023', deposits: 136200, withdrawals: 92500, netProfit: 43700, ggr: 31800, newUsers: 92, activeUsers: 1320 },
    { date: '03.05.2023', deposits: 142800, withdrawals: 98700, netProfit: 44100, ggr: 33600, newUsers: 78, activeUsers: 1350 },
    { date: '04.05.2023', deposits: 128900, withdrawals: 90200, netProfit: 38700, ggr: 29500, newUsers: 73, activeUsers: 1290 },
    { date: '05.05.2023', deposits: 157300, withdrawals: 110500, netProfit: 46800, ggr: 35200, newUsers: 96, activeUsers: 1420 },
    { date: '06.05.2023', deposits: 183600, withdrawals: 125800, netProfit: 57800, ggr: 42600, newUsers: 112, activeUsers: 1580 },
    { date: '07.05.2023', deposits: 195200, withdrawals: 132400, netProfit: 62800, ggr: 45900, newUsers: 124, activeUsers: 1650 },
    { date: '08.05.2023', deposits: 175400, withdrawals: 119800, netProfit: 55600, ggr: 41200, newUsers: 105, activeUsers: 1580 },
    { date: '09.05.2023', deposits: 168700, withdrawals: 115300, netProfit: 53400, ggr: 39800, newUsers: 98, activeUsers: 1540 },
    { date: '10.05.2023', deposits: 172500, withdrawals: 118200, netProfit: 54300, ggr: 40500, newUsers: 102, activeUsers: 1560 },
  ];
  
  // Ödeme yöntemleri raporu (örnek)
  const paymentMethodReports: PaymentMethodReportType[] = [
    { method: 'Papara', deposits: 685200, withdrawals: 524800, transactions: 8425, percentage: 36.5 },
    { method: 'Havale/EFT', deposits: 523700, withdrawals: 387600, transactions: 5230, percentage: 27.2 },
    { method: 'USDT TRC20', deposits: 420500, withdrawals: 312400, transactions: 3150, percentage: 22.8 },
    { method: 'Bitcoin', deposits: 152800, withdrawals: 98600, transactions: 920, percentage: 7.8 },
    { method: 'Ethereum', deposits: 86400, withdrawals: 54200, transactions: 580, percentage: 4.1 },
    { method: 'Diğer Kripto', deposits: 32600, withdrawals: 21800, transactions: 330, percentage: 1.6 },
  ];
  
  // Oyun kategorileri raporu (örnek)
  const gameCategoryReports: GameCategoryReport[] = [
    { category: 'Slot Oyunları', bets: 1425600, wins: 1282800, ggr: 142800, players: 3250, percentage: 42.5 },
    { category: 'Live Casino', bets: 985300, wins: 868700, ggr: 116600, players: 1850, percentage: 29.4 },
    { category: 'Masa Oyunları', bets: 486200, wins: 432700, ggr: 53500, players: 1120, percentage: 14.5 },
    { category: 'Poker', bets: 324800, wins: 286200, ggr: 38600, players: 780, percentage: 9.7 },
    { category: 'Diğer Oyunlar', bets: 128500, wins: 115900, ggr: 12600, players: 580, percentage: 3.9 },
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
      description: "Finansal rapor Excel formatında indiriliyor.",
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
    <AdminLayout title="Finansal Raporlar">
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Finansal Raporlar</h1>
            <p className="text-gray-400">Finansal performans, ödemeler ve casino gelir raporları</p>
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
        
        {/* Finansal Özet Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex justify-between items-center">
                <span>Toplam Para Yatırma</span>
                <BarChart3 className="h-5 w-5 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(1584700)}</div>
              <div className="flex items-center mt-2 text-green-500">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-sm">%8.3 artış</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex justify-between items-center">
                <span>Toplam Para Çekme</span>
                <BarChart3 className="h-5 w-5 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(1098400)}</div>
              <div className="flex items-center mt-2 text-red-500">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-sm">%12.5 artış</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex justify-between items-center">
                <span>Net Kar</span>
                <LineChart className="h-5 w-5 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(486300)}</div>
              <div className="flex items-center mt-2 text-green-500">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-sm">%3.8 artış</span>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-white flex justify-between items-center">
                <span>Brüt Oyun Geliri (GGR)</span>
                <PieChart className="h-5 w-5 text-yellow-500" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{formatCurrency(364100)}</div>
              <div className="flex items-center mt-2 text-green-500">
                <ArrowUp className="h-4 w-4 mr-1" />
                <span className="text-sm">%5.2 artış</span>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Günlük Finansal Trendler */}
          <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">Finansal Trendler</CardTitle>
              <CardDescription>Son 10 günün para yatırma ve çekme trendleri</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyReports}
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
                    <Bar dataKey="deposits" name="Para Yatırma" fill="#FFD700" />
                    <Bar dataKey="withdrawals" name="Para Çekme" fill="#FF8C00" />
                    <Bar dataKey="netProfit" name="Net Kar" fill="#00FF7F" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Ödeme Yöntemleri Dağılımı */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Ödeme Yöntemleri</CardTitle>
              <CardDescription>Ödeme yöntemleri kullanım oranı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartPie>
                    <Pie
                      data={paymentMethodReports}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                      nameKey="method"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {paymentMethodReports.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartPie>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* GGR ve Oyuncu Trendleri */}
          <Card className="bg-gray-800 border-gray-700 lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-white">GGR ve Oyuncu Trendleri</CardTitle>
              <CardDescription>Son 10 günün GGR ve aktif oyuncu trendi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartLine
                    data={dailyReports}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                    <XAxis dataKey="date" stroke="#999" />
                    <YAxis yAxisId="left" stroke="#FFD700" />
                    <YAxis yAxisId="right" orientation="right" stroke="#1E90FF" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                      labelStyle={{ color: '#e5e7eb' }}
                    />
                    <Legend />
                    <Line yAxisId="left" type="monotone" dataKey="ggr" name="GGR (₺)" stroke="#FFD700" activeDot={{ r: 8 }} />
                    <Line yAxisId="right" type="monotone" dataKey="activeUsers" name="Aktif Oyuncular" stroke="#1E90FF" />
                  </RechartLine>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          {/* Oyun Kategorileri Gelir Dağılımı */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Oyun Kategorileri</CardTitle>
              <CardDescription>Kategorilere göre GGR dağılımı</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartPie>
                    <Pie
                      data={gameCategoryReports}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="percentage"
                      nameKey="category"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    >
                      {gameCategoryReports.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </RechartPie>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
};

export default FinancialReports;