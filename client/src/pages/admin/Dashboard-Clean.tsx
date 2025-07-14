import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ResponsiveContainer, LineChart, BarChart, PieChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell, Line, Bar, Pie } from 'recharts';
import { 
  Users, 
  Activity,
  Wallet,
  TrendingUp,
  BarChart2,
  ChevronsUp,
  ChevronsDown,
  Loader2,
  CreditCard,
  DollarSign,
  Zap,
  Award,
  Calendar,
  TrendingDown,
  Percent,
  Gamepad
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAdminLanguage } from '@/contexts/UserContext';
import { tr, getAdminLanguage, AdminLanguage } from '@/utils/admin-translations';

// İstatistik veri tipleri
interface StatsData {
  value: number;
  change: number;
  positive: boolean;
}

interface UserStats {
  total: number;
  active: number;
  newToday: number;
  inactive: number;
  suspended: number;
}

interface FinancialStats {
  totalDeposits: number;
  totalWithdrawals: number;
  pendingWithdrawals: number;
  netProfit: number;
  avgDepositAmount: number;
}

interface ActivityStats {
  logins: number;
  registrations: number;
  transactions: number;
  bets: number;
}

interface GameStats {
  totalGames: number;
  mostPlayed: string;
  totalBets: number;
  avgBetAmount: number;
}

interface GameData {
  name: string;
  plays: number;
  winRate: number;
  avgBet: number;
}

interface TransactionData {
  id: number;
  username: string;
  type: string;
  amount: number;
  status: string;
  date: string;
}

interface UserLog {
  id: number;
  username: string;
  action: string;
  ip: string;
  date: string;
}

interface UserDistribution {
  active: number;
  inactive: number;
  suspended: number;
}

interface DashboardData {
  stats?: {
    totalUsers: StatsData;
    revenue: StatsData;
    profit: StatsData;
    conversion: StatsData;
    newUsers: StatsData;
    activeGames: StatsData;
    transactions: StatsData;
    bets: StatsData;
  };
  users: UserStats;
  financial: FinancialStats;
  activity: ActivityStats;
  games: GameStats;
  popularGames: GameData[];
  recentTransactions: TransactionData[];
  recentUserLogs: UserLog[];
  userDistribution: UserDistribution;
}

export default function Dashboard() {
  const { toast } = useToast();
  const { language } = useAdminLanguage();
  const adminLanguage = getAdminLanguage();
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [timeRange, setTimeRange] = useState<string>('weekly');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isRequestInProgress, setIsRequestInProgress] = useState<boolean>(false);
  
  // İstatistikleri getir
  const getStats = async () => {
    if (isRequestInProgress) return;
    
    try {
      setIsRequestInProgress(true);
      setLoading(true);
      
      const response = await fetch('/api/admin/stats', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setDashboardData(data);
    } catch (error) {
      console.error('Dashboard istatistik alma hatası:', error);
      toast({
        title: "Hata",
        description: "İstatistikler alınırken bir hata oluştu",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setIsRequestInProgress(false);
    }
  };

  useEffect(() => {
    getStats();
  }, [timeRange]);

  // Güvenli sayı ayrıştırma
  const safeParseInt = (value: any, defaultValue: number = 0): number => {
    if (typeof value === 'number' && !isNaN(value)) {
      return value;
    }
    if (typeof value === 'string') {
      const parsed = parseInt(value, 10);
      if (!isNaN(parsed)) {
        return parsed;
      }
    }
    return defaultValue;
  };
  
  return (
    <AdminLayout>
      <div className="p-6 h-full bg-gray-900">
        <div className="relative overflow-hidden bg-gradient-to-br from-black via-gray-900 to-gray-800 rounded-xl mb-8 shadow-2xl border border-yellow-500/20">
          <div className="absolute inset-0 bg-[url('/path/to/pattern.png')] opacity-5"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-yellow-500/10 to-black/30"></div>
          <div className="relative z-10 p-8 flex justify-between items-start">
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-2 flex items-center">
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-300">
                  {tr('dashboard', adminLanguage)}
                </span>
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30">
                  CryptonBets
                </span>
              </h1>
              <p className="text-gray-300 text-lg max-w-2xl mb-4">
                Site yönetimi, kullanıcı istatistikleri ve finansal verilere genel bakış
              </p>
              <div className="flex space-x-2">
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30 transition-all ${timeRange === 'daily' ? 'bg-yellow-500/40' : ''}`}
                  onClick={() => setTimeRange('daily')}
                >
                  {tr('today', adminLanguage)}
                </button>
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30 transition-all ${timeRange === 'weekly' ? 'bg-yellow-500/40' : ''}`}
                  onClick={() => setTimeRange('weekly')}
                >
                  {tr('this_week', adminLanguage)}
                </button>
                <button 
                  className={`px-4 py-2 rounded-full text-sm font-medium bg-yellow-500/20 text-yellow-300 border border-yellow-500/30 hover:bg-yellow-500/30 transition-all ${timeRange === 'monthly' ? 'bg-yellow-500/40' : ''}`}
                  onClick={() => setTimeRange('monthly')}
                >
                  {tr('this_month', adminLanguage)}
                </button>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button 
                onClick={getStats}
                className="flex items-center px-4 py-2 rounded-full text-sm font-medium bg-yellow-500 text-black hover:bg-yellow-400 transition-all"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <TrendingUp className="h-4 w-4 mr-2" />
                )}
                {tr('refresh', adminLanguage)}
              </button>
            </div>
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex flex-col items-center">
              <Loader2 className="h-12 w-12 animate-spin text-yellow-500 mb-4" />
              <p className="text-gray-400 text-lg">İstatistikler yükleniyor...</p>
            </div>
          </div>
        ) : (
          <>
            {/* Ana Metrikler */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {/* Toplam Kullanıcılar */}
              <Card className="bg-gray-800/80 border-yellow-500/20 hover:border-yellow-500/40 transition-all shadow-lg backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg flex items-center">
                    <Users className="h-5 w-5 mr-2 text-yellow-500" />
                    {tr('total_users', adminLanguage)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-1">
                    {safeParseInt(dashboardData?.stats?.totalUsers?.value).toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    {dashboardData?.stats?.totalUsers?.positive ? (
                      <ChevronsUp className="text-green-500 h-4 w-4 mr-1" />
                    ) : (
                      <ChevronsDown className="text-red-500 h-4 w-4 mr-1" />
                    )}
                    <span className={dashboardData?.stats?.totalUsers?.positive ? "text-green-500" : "text-red-500"}>
                      {dashboardData?.stats?.totalUsers?.change}% önceki döneme göre
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Toplam Gelir */}
              <Card className="bg-gray-800/80 border-yellow-500/20 hover:border-yellow-500/40 transition-all shadow-lg backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-yellow-500" />
                    {tr('total_revenue', adminLanguage)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-1">
                    ₺{safeParseInt(dashboardData?.stats?.revenue?.value).toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    {dashboardData?.stats?.revenue?.positive ? (
                      <ChevronsUp className="text-green-500 h-4 w-4 mr-1" />
                    ) : (
                      <ChevronsDown className="text-red-500 h-4 w-4 mr-1" />
                    )}
                    <span className={dashboardData?.stats?.revenue?.positive ? "text-green-500" : "text-red-500"}>
                      {dashboardData?.stats?.revenue?.change}% önceki döneme göre
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Aktif Oyunlar */}
              <Card className="bg-gray-800/80 border-yellow-500/20 hover:border-yellow-500/40 transition-all shadow-lg backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg flex items-center">
                    <Gamepad className="h-5 w-5 mr-2 text-yellow-500" />
                    {tr('active', adminLanguage)} {tr('games', adminLanguage)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-1">
                    {safeParseInt(dashboardData?.stats?.activeGames?.value).toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    {dashboardData?.stats?.activeGames?.positive ? (
                      <ChevronsUp className="text-green-500 h-4 w-4 mr-1" />
                    ) : (
                      <ChevronsDown className="text-red-500 h-4 w-4 mr-1" />
                    )}
                    <span className={dashboardData?.stats?.activeGames?.positive ? "text-green-500" : "text-red-500"}>
                      {dashboardData?.stats?.activeGames?.change}% önceki döneme göre
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              {/* Toplam İşlemler */}
              <Card className="bg-gray-800/80 border-yellow-500/20 hover:border-yellow-500/40 transition-all shadow-lg backdrop-blur-sm">
                <CardHeader className="pb-2">
                  <CardTitle className="text-white text-lg flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-yellow-500" />
                    {tr('transactions', adminLanguage)}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-white mb-1">
                    {safeParseInt(dashboardData?.stats?.transactions?.value).toLocaleString()}
                  </div>
                  <div className="flex items-center">
                    {dashboardData?.stats?.transactions?.positive ? (
                      <ChevronsUp className="text-green-500 h-4 w-4 mr-1" />
                    ) : (
                      <ChevronsDown className="text-red-500 h-4 w-4 mr-1" />
                    )}
                    <span className={dashboardData?.stats?.transactions?.positive ? "text-green-500" : "text-red-500"}>
                      {dashboardData?.stats?.transactions?.change}% önceki döneme göre
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sekmeli İçerik */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="bg-gray-800/80 border border-yellow-500/20 p-1 rounded-lg mb-6">
                <TabsTrigger 
                  value="overview" 
                  className={`rounded-md transition-all ${activeTab === 'overview' ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-400 hover:text-white'}`}
                >
                  {tr('overview', adminLanguage)}
                </TabsTrigger>
                <TabsTrigger 
                  value="users" 
                  className={`rounded-md transition-all ${activeTab === 'users' ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-400 hover:text-white'}`}
                >
                  {tr('users', adminLanguage)}
                </TabsTrigger>
                <TabsTrigger 
                  value="financial" 
                  className={`rounded-md transition-all ${activeTab === 'financial' ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-400 hover:text-white'}`}
                >
                  Finansal
                </TabsTrigger>
                <TabsTrigger 
                  value="games" 
                  className={`rounded-md transition-all ${activeTab === 'games' ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-400 hover:text-white'}`}
                >
                  {tr('games', adminLanguage)}
                </TabsTrigger>
                <TabsTrigger 
                  value="activity" 
                  className={`rounded-md transition-all ${activeTab === 'activity' ? 'bg-yellow-500/20 text-yellow-400' : 'text-gray-400 hover:text-white'}`}
                >
                  Aktiviteler
                </TabsTrigger>
              </TabsList>
              
              {/* Genel Bakış */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="bg-gray-800/80 border-yellow-500/20 hover:border-yellow-500/40 transition-all shadow-lg backdrop-blur-sm overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-lg flex items-center">
                        <Users className="h-5 w-5 mr-2 text-yellow-500" />
                        {tr('user_stats', adminLanguage)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={[
                              { 
                                name: 'Aktif', 
                                value: dashboardData?.users?.active || 0,
                                fill: '#eab308'
                              },
                              { 
                                name: 'Pasif', 
                                value: dashboardData?.users?.inactive || 0,
                                fill: '#ef4444'
                              },
                              { 
                                name: 'Askıya Alınmış', 
                                value: dashboardData?.users?.suspended || 0,
                                fill: '#6b7280'
                              }
                            ]}
                          >
                            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                            <XAxis dataKey="name" stroke="#9ca3af" />
                            <YAxis stroke="#9ca3af" />
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#f9fafb'
                              }}
                            />
                            <Bar dataKey="value" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-800/80 border-yellow-500/20 hover:border-yellow-500/40 transition-all shadow-lg backdrop-blur-sm overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-lg flex items-center">
                        <BarChart2 className="h-5 w-5 mr-2 text-yellow-500" />
                        {tr('user_distribution', adminLanguage)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={[
                                {
                                  name: 'Aktif',
                                  value: dashboardData?.users?.active || 0,
                                  fill: '#eab308'
                                },
                                {
                                  name: 'Pasif',
                                  value: dashboardData?.users?.inactive || 0,
                                  fill: '#ef4444'
                                },
                                {
                                  name: 'Askıya Alınmış',
                                  value: dashboardData?.users?.suspended || 0,
                                  fill: '#6b7280'
                                }
                              ]}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({name, percent}) => `${name} ${(percent * 100).toFixed(0)}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {[
                                {fill: '#eab308'},
                                {fill: '#ef4444'}, 
                                {fill: '#6b7280'}
                              ].map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.fill} />
                              ))}
                            </Pie>
                            <Tooltip 
                              contentStyle={{
                                backgroundColor: '#1f2937',
                                border: '1px solid #374151',
                                borderRadius: '8px',
                                color: '#f9fafb'
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                {/* Son İşlemler ve Kullanıcı Logları */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card className="bg-gray-800/80 border-yellow-500/20 hover:border-yellow-500/40 transition-all shadow-lg backdrop-blur-sm overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-lg flex items-center">
                        <CreditCard className="h-5 w-5 mr-2 text-yellow-500" />
                        {tr('recent_transactions', adminLanguage)}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        En son gerçekleşen finansal işlemler
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-72 overflow-y-auto">
                        {dashboardData?.recentTransactions?.length > 0 ? (
                          dashboardData.recentTransactions.map((transaction, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600/50">
                              <div className="flex items-center space-x-3">
                                <div className={`w-2 h-2 rounded-full ${
                                  transaction.status === 'completed' ? 'bg-green-500' :
                                  transaction.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                }`}></div>
                                <div>
                                  <p className="text-white font-medium">{transaction.username}</p>
                                  <p className="text-gray-400 text-sm">{transaction.type} - {transaction.date}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`font-medium ${
                                  transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                                }`}>
                                  {transaction.type === 'deposit' ? '+' : '-'}₺{transaction.amount}
                                </p>
                                <p className="text-gray-400 text-sm">{transaction.status}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-center py-8">Henüz işlem bulunmuyor</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card className="bg-gray-800/80 border-yellow-500/20 hover:border-yellow-500/40 transition-all shadow-lg backdrop-blur-sm overflow-hidden">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-white text-lg flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-yellow-500" />
                        {tr('recent_user_logs', adminLanguage)}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Kullanıcı giriş ve çıkış aktiviteleri
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-72 overflow-y-auto">
                        {dashboardData?.recentUserLogs?.length > 0 ? (
                          dashboardData.recentUserLogs.map((log, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg border border-gray-600/50">
                              <div className="flex items-center space-x-3">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <div>
                                  <p className="text-white font-medium">{log.username}</p>
                                  <p className="text-gray-400 text-sm">{log.action}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className="text-gray-400 text-sm">{log.ip}</p>
                                <p className="text-gray-400 text-sm">{log.date}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-center py-8">Henüz log bulunmuyor</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </AdminLayout>
  );
}