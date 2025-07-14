import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  TrendingUp, 
  DollarSign, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Cell, BarChart, Bar, Pie } from 'recharts';
import { apiRequest } from '@/lib/queryClient';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const queryClient = useQueryClient();
  
  // Gerçek admin istatistikleri
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/stats');
      return await response.json();
    },
    refetchInterval: 30000,
    staleTime: 30000
  });

  // Kullanıcı istatistikleri
  const { data: userStats, isLoading: userStatsLoading } = useQuery({
    queryKey: ['/api/admin/analytics/users'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/analytics/users');
      return await response.json();
    },
    staleTime: 30000
  });

  // Finansal istatistikler
  const { data: financeStats, isLoading: financeStatsLoading } = useQuery({
    queryKey: ['/api/admin/analytics/finance'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/analytics/finance');
      return await response.json();
    },
    staleTime: 30000
  });

  // Oyun istatistikleri
  const { data: gameStats, isLoading: gameStatsLoading } = useQuery({
    queryKey: ['/api/admin/analytics/games'],
    queryFn: async () => {
      const response = await apiRequest('/api/admin/analytics/games');
      return await response.json();
    },
    staleTime: 30000
  });

  // Yenileme fonksiyonu
  const handleRefresh = async () => {
    await Promise.all([
      refetchStats(),
      queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics/users'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics/finance'] }),
      queryClient.invalidateQueries({ queryKey: ['/api/admin/analytics/games'] })
    ]);
  };

  // Loading durumu
  const isLoading = statsLoading || userStatsLoading || financeStatsLoading || gameStatsLoading;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            <span>Dashboard yükleniyor...</span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Casino platformunuzu yönetin ve performansı takip edin
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Download className="mr-2 h-4 w-4" />
              Rapor İndir
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          </div>
        </div>

        {/* Ana İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Kullanıcı</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userStats?.totalUsers?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{userStats?.newUsersToday || '0'}</span> bugün yeni
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Yatırım</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₺{financeStats?.totalDeposits?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+%{financeStats?.depositGrowth || '0'}</span> önceki aya göre
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Net Kar</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₺{financeStats?.totalProfit?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+%{financeStats?.profitGrowth || '0'}</span> önceki aya göre
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Oyun Oynama</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{gameStats?.totalGames?.toLocaleString() || '0'}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">+{stats?.onlineUsers || '0'}</span> şu an aktif
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Genel Bakış</TabsTrigger>
            <TabsTrigger value="users">Kullanıcılar</TabsTrigger>
            <TabsTrigger value="finance">Finans</TabsTrigger>
            <TabsTrigger value="analytics">Analitik</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Gelir Trendi */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <LineChart className="h-5 w-5" />
                    Gelir Trendi
                  </CardTitle>
                  <CardDescription>Son 6 ay gelir ve kar analizi</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={financeStats?.revenueData || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Area type="monotone" dataKey="revenue" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="profit" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Kullanıcı Dağılımı */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Kullanıcı Dağılımı
                  </CardTitle>
                  <CardDescription>Aktif/İnaktif kullanıcı oranları</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RechartsPieChart>
                      <Pie
                        data={userStats?.distribution || []}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {(userStats?.distribution || []).map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                  <div className="flex justify-center gap-4 mt-4">
                    {(userStats?.distribution || []).map((entry: any, index: number) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                        <span className="text-sm">{entry.name}: {entry.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Popüler Oyunlar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Popüler Oyunlar
                </CardTitle>
                <CardDescription>En çok oynanan oyunlar ve gelirleri</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gameStats?.popularGames || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="plays" fill="#3b82f6" />
                    <Bar dataKey="revenue" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Kullanıcı Aktivitesi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Aktif Kullanıcılar</span>
                      <Badge variant="secondary">{userStats?.activeUsers || '0'}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Çevrimiçi</span>
                      <Badge variant="outline">{stats?.onlineUsers || '0'}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Bugün Yeni</span>
                      <Badge variant="default">{userStats?.newUsersToday || '0'}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Finansal Durum</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Bekleyen Çekimler</span>
                      <Badge variant="destructive">{financeStats?.pendingWithdrawals || '0'}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Günlük Gelir</span>
                      <span className="font-medium">₺{financeStats?.dailyRevenue?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Aylık Büyüme</span>
                      <span className="text-green-600 font-medium">+{financeStats?.monthlyGrowth || '0'}%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Sistem Durumu</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>API Durumu</span>
                      {stats?.apiStatus === 'online' ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Veritabanı</span>
                      {stats?.dbStatus === 'online' ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Oyun Sağlayıcıları</span>
                      {stats?.gameProvidersStatus === 'online' ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      }
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="finance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Son İşlemler</CardTitle>
                <CardDescription>En son yapılan yatırım ve çekim işlemleri</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(financeStats?.recentTransactions || []).map((transaction: any) => (
                    <div key={transaction.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${
                          transaction.type === 'deposit' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium">{transaction.user || transaction.username || 'Anonim'}</p>
                          <p className="text-sm text-muted-foreground">{transaction.type === 'deposit' ? 'Yatırım' : 'Çekim'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          transaction.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ₺{Math.abs(transaction.amount).toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">{transaction.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sistem Performansı</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Toplam Ayarlar</span>
                      <Badge variant="secondary">{stats?.totalSettings || '0'}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Aktif Entegrasyonlar</span>
                      <Badge variant="outline">{stats?.activeIntegrations || '0'}/{stats?.totalIntegrations || '0'}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Ödeme Yöntemleri</span>
                      <Badge variant="default">{stats?.activePaymentMethods || '0'}/{stats?.totalPaymentMethods || '0'}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;