import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import {
  FileBarChart,
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Gamepad2,
  Activity,
  RefreshCw,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Clock,
  Globe,
  CreditCard,
  Zap,
  Star,
  Database,
  CheckCircle2
} from 'lucide-react';

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16', '#EF4444'];

interface ReportData {
  financial: {
    totalRevenue: number;
    totalDeposits: number;
    totalWithdrawals: number;
    depositCount: number;
    withdrawalCount: number;
    avgDepositAmount: number;
    avgWithdrawalAmount: number;
    revenueGrowth: number;
    profitMargin: number;
  };
  users: {
    totalUsers: number;
    newUsers: number;
    vipUsers: number;
    userGrowth: number;
    vipPercentage: number;
    distribution: Array<{
      level: string;
      count: number;
      percentage: number;
    }>;
  };
  gaming: {
    totalBets: number;
    totalBetAmount: number;
    avgBetAmount: number;
    gameSessions: number;
    totalGames: number;
    categories: Array<{
      category: string;
      revenue: number;
      percentage: number;
    }>;
    gamesGrowth: number;
  };
  payments: {
    methods: Array<{
      method: string;
      count: number;
      percentage: number;
    }>;
    totalTransactions: number;
    successRate: number;
    avgProcessingTime: string;
  };
  trends: {
    dailyRevenue: Array<{
      date: string;
      deposits: number;
      withdrawals: number;
      netRevenue: number;
    }>;
    periodDays: number;
    reportGenerated: string;
  };
  performance: {
    uptime: string;
    avgResponseTime: string;
    totalRequests: number;
    errorRate: string;
    activeConnections: number;
  };
}

const ReportsProfessional: React.FC = () => {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30');

  // Professional Reports Data Fetching
  const { data: reportData, isLoading, error, refetch } = useQuery<ReportData>({
    queryKey: ['admin-reports-professional', dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/admin/reports?period=${dateRange}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch reports data');
      }
      return response.json();
    },
    refetchInterval: 60000,
  });

  const handleDownloadReport = async (type: string) => {
    try {
      const response = await fetch('/api/admin/reports/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          type, 
          period: dateRange,
          format: 'pdf'
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-report-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Rapor İndirildi",
          description: `${type} raporu başarıyla indirildi`,
        });
      }
    } catch (error) {
      toast({
        title: "Hata",
        description: "Rapor indirilemedi",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mb-4"></div>
            <p className="text-gray-400 text-lg">Profesyonel raporlar yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <Card className="bg-red-900/20 border-red-500/30">
          <CardContent className="p-6">
            <div className="text-center">
              <p className="text-red-400 mb-4">Rapor verisi yüklenemedi</p>
              <Button onClick={() => refetch()} className="bg-red-600 hover:bg-red-700">
                Tekrar Dene
              </Button>
            </div>
          </CardContent>
        </Card>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Professional Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 blur-3xl rounded-3xl"></div>
          <div className="relative bg-black/40 backdrop-blur-xl border border-blue-500/30 rounded-2xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold text-white flex items-center mb-2">
                  <FileBarChart className="h-10 w-10 mr-3 text-blue-500" />
                  <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Profesyonel Raporlama Merkezi
                  </span>
                </h1>
                <p className="text-gray-300 text-lg mb-4">
                  Kapsamlı iş performansı analizi ve stratejik raporlama sistemi
                </p>
                <div className="flex items-center space-x-4">
                  <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 flex items-center">
                    <Database className="h-3 w-3 mr-1" />
                    Gerçek Veri
                  </Badge>
                  <Badge className="bg-green-500/20 text-green-400 border-green-500/30 flex items-center">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    PostgreSQL
                  </Badge>
                  <span className="text-gray-400 text-sm">
                    Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="7">Son 7 Gün</option>
                  <option value="30">Son 30 Gün</option>
                  <option value="90">Son 3 Ay</option>
                  <option value="365">Son 1 Yıl</option>
                </select>
                
                <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Yenile
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/30 hover:border-green-500/50 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-green-400" />
                Net Gelir
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                ₺{reportData?.financial?.totalRevenue?.toLocaleString() || '0'}
              </div>
              <div className="flex items-center text-xs text-green-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                {reportData?.financial?.revenueGrowth?.toFixed(1) || '0'}% artış
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/30 hover:border-blue-500/50 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center">
                <Users className="h-4 w-4 mr-2 text-blue-400" />
                Toplam Kullanıcı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {reportData?.users?.totalUsers?.toLocaleString() || '0'}
              </div>
              <div className="flex items-center text-xs text-blue-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                {reportData?.users?.newUsers || '0'} yeni
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/30 hover:border-purple-500/50 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center">
                <Gamepad2 className="h-4 w-4 mr-2 text-purple-400" />
                Toplam Bahis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                {reportData?.gaming?.totalBets?.toLocaleString() || '0'}
              </div>
              <div className="flex items-center text-xs text-purple-400">
                <Target className="h-3 w-3 mr-1" />
                ₺{reportData?.gaming?.avgBetAmount?.toFixed(2) || '0'} ortalama
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border-orange-500/30 hover:border-orange-500/50 transition-all">
            <CardHeader className="pb-2">
              <CardTitle className="text-white text-sm flex items-center">
                <Activity className="h-4 w-4 mr-2 text-orange-400" />
                İşlem Başarı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white mb-1">
                %{reportData?.payments?.successRate?.toFixed(1) || '0'}
              </div>
              <div className="flex items-center text-xs text-orange-400">
                <Clock className="h-3 w-3 mr-1" />
                {reportData?.payments?.avgProcessingTime || '0'} ortalama
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Professional Tabbed Content */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="bg-gray-800/80 border border-gray-600/30 p-1 rounded-lg mb-6">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              Genel Bakış
            </TabsTrigger>
            <TabsTrigger value="financial" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              Finansal
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              Kullanıcılar
            </TabsTrigger>
            <TabsTrigger value="gaming" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              Oyun
            </TabsTrigger>
            <TabsTrigger value="performance" className="data-[state=active]:bg-cyan-600 data-[state=active]:text-white">
              Performans
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-600/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    Günlük Gelir Trendi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={reportData?.trends?.dailyRevenue || []}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" />
                        <YAxis stroke="#9CA3AF" />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151' }}
                          labelStyle={{ color: '#F3F4F6' }}
                        />
                        <Area 
                          type="monotone" 
                          dataKey="netRevenue" 
                          stroke="#10B981" 
                          fill="#10B981" 
                          fillOpacity={0.3}
                          name="Net Gelir"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-600/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-2" />
                    Kullanıcı Dağılımı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={reportData?.users?.distribution || []}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="count"
                          nameKey="level"
                          label={({ level, percentage }) => `${level}: %${percentage.toFixed(1)}`}
                        >
                          {reportData?.users?.distribution?.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="bg-gray-800/50 border-gray-600/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Ödeme Yöntemleri
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => handleDownloadReport('payment')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData?.payments?.methods?.map((method, index) => (
                      <div key={method.method} className="flex items-center justify-between">
                        <span className="text-gray-300">{method.method}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">{method.count}</span>
                          <div className="w-12 bg-gray-700 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full"
                              style={{ 
                                width: `${method.percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-600/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center">
                      <Gamepad2 className="h-5 w-5 mr-2" />
                      Oyun Kategorileri
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => handleDownloadReport('gaming')}
                      className="bg-purple-600 hover:bg-purple-700"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData?.gaming?.categories?.map((category, index) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <span className="text-gray-300">{category.category}</span>
                        <div className="flex items-center space-x-2">
                          <span className="text-white font-medium">₺{category.revenue.toLocaleString()}</span>
                          <div className="w-12 bg-gray-700 rounded-full h-2">
                            <div 
                              className="h-2 rounded-full"
                              style={{ 
                                width: `${category.percentage}%`,
                                backgroundColor: COLORS[index % COLORS.length]
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-600/30">
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span className="flex items-center">
                      <Zap className="h-5 w-5 mr-2" />
                      Sistem Performansı
                    </span>
                    <Button 
                      size="sm" 
                      onClick={() => handleDownloadReport('performance')}
                      className="bg-cyan-600 hover:bg-cyan-700"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Uptime</span>
                      <span className="text-green-400 font-medium">{reportData?.performance?.uptime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Yanıt Süresi</span>
                      <span className="text-blue-400 font-medium">{reportData?.performance?.avgResponseTime}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Hata Oranı</span>
                      <span className="text-yellow-400 font-medium">{reportData?.performance?.errorRate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Aktif Bağlantı</span>
                      <span className="text-purple-400 font-medium">{reportData?.performance?.activeConnections}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Additional tabs would be implemented here with similar professional structure */}
          <TabsContent value="financial">
            <Card className="bg-gray-800/50 border-gray-600/30">
              <CardContent className="p-6">
                <p className="text-gray-300 text-center">Detaylı finansal raporlama yakında eklenecek...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card className="bg-gray-800/50 border-gray-600/30">
              <CardContent className="p-6">
                <p className="text-gray-300 text-center">Kullanıcı analitikleri yakında eklenecek...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="gaming">
            <Card className="bg-gray-800/50 border-gray-600/30">
              <CardContent className="p-6">
                <p className="text-gray-300 text-center">Oyun performans raporları yakında eklenecek...</p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card className="bg-gray-800/50 border-gray-600/30">
              <CardContent className="p-6">
                <p className="text-gray-300 text-center">Sistem performans detayları yakında eklenecek...</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ReportsProfessional;