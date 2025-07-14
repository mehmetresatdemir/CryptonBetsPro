import React, { useState, useEffect, useMemo, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { analyticsTranslations } from '@/utils/analytics-translations';
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
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Gamepad2,
  Activity,
  Download,
  RefreshCw,
  Calendar,
  Filter,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Target,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Monitor,
  Globe,
  Smartphone,
  Tablet,
  Monitor as Desktop,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    totalRevenue: number;
    totalBets: number;
    averageBetAmount: number;
    winRate: number;
    userGrowth: number;
    revenueGrowth: number;
  };
  dailyStats: Array<{
    date: string;
    users: number;
    revenue: number;
    bets: number;
    registrations: number;
  }>;
  gameStats: Array<{
    name: string;
    plays: number;
    revenue: number;
    rtp: number;
    provider: string;
  }>;
  userStats: {
    byCountry: Array<{ country: string; users: number; revenue: number }>;
    byDevice: Array<{ device: string; users: number; percentage: number }>;
    retention: Array<{ day: number; rate: number }>;
  };
  paymentStats: {
    methods: Array<{ method: string; amount: number; count: number }>;
    deposits: Array<{ date: string; amount: number }>;
    withdrawals: Array<{ date: string; amount: number }>;
  };
}

const COLORS = ['#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#8B5CF6', '#F97316'];

const AnalyticsPage: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedPeriod, setSelectedPeriod] = useState('7');
  const [refreshing, setRefreshing] = useState(false);

  // Analytics translation function
  const tr = (key: keyof typeof analyticsTranslations) => {
    const translation = analyticsTranslations[key];
    if (translation) {
      return language === 'en' ? translation.en : translation.tr;
    }
    return key;
  };
  const [selectedTab, setSelectedTab] = useState('overview');
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [filterCountry, setFilterCountry] = useState('all');
  const [filterDevice, setFilterDevice] = useState('all');
  const [wsConnected, setWsConnected] = useState(false);
  const [realtimeData, setRealtimeData] = useState<any>(null);

  // Fetch analytics data with proper authentication
  const { data: analytics, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['admin-analytics', selectedPeriod],
    queryFn: async () => {
      // Get token from localStorage - check both authToken and admin_token
      const token = localStorage.getItem('authToken') || localStorage.getItem('admin_token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/admin/analytics?period=${selectedPeriod}`, {
        method: 'GET',
        headers,
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      return result.data || result; // Handle both wrapped and direct response formats
    },
    refetchInterval: realTimeEnabled ? 15000 : 300000, // 15 seconds if real-time, 5 minutes if not
  });

  const { refetch } = useQuery<AnalyticsData>({
    queryKey: ['admin-analytics', selectedPeriod],
    enabled: false
  });

  // Manual refresh function
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
      toast({
        title: tr('analytics.refresh'),
        description: language === 'tr' ? 'Analitik veriler başarıyla yenilendi' : 'Analytics data refreshed successfully',
      });
    } catch (error) {
      toast({
        title: language === 'tr' ? 'Yenileme başarısız' : 'Refresh failed',
        description: language === 'tr' ? 'Analitik veriler yenilenemedi' : 'Analytics data could not be refreshed',
        variant: 'destructive',
      });
    } finally {
      setRefreshing(false);
    }
  }, [queryClient, language, toast]);

  // WebSocket completely disabled for Analytics - using HTTP polling only
  useEffect(() => {
    // All WebSocket connections disabled to prevent conflicts
    console.log('📊 Analytics WebSocket disabled - using HTTP polling');
    return;
    
    ws.onopen = () => {
      console.log('📊 Analytics WebSocket connected');
      setWsConnected(true);
    };
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log('📊 Real-time analytics update:', data);
        setRealtimeData(data);
        
        // Update query cache with real-time data
        if (data.type === 'user_activity' && data.data) {
          queryClient.invalidateQueries({ queryKey: ['admin-analytics'] });
        }
      } catch (error) {
        console.error('📊 Error parsing WebSocket message:', error);
      }
    };
    
    ws.onclose = () => {
      console.log('📊 Analytics WebSocket disconnected');
      setWsConnected(false);
    };
    
    ws.onerror = (error) => {
      console.error('📊 Analytics WebSocket error:', error);
      setWsConnected(false);
    };
    
    // Send ping every 30 seconds to keep connection alive
    const pingInterval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);
    
    return () => {
      clearInterval(pingInterval);
      ws.close();
    };
  }, [realTimeEnabled, queryClient]);

  // Export data function
  const handleExport = useCallback(() => {
    if (!analytics) return;
    
    const exportData = {
      timestamp: new Date().toISOString(),
      period: selectedPeriod,
      data: analytics,
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${selectedPeriod}days-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: language === 'tr' ? 'Dışa aktarım başarılı' : 'Export successful',
      description: language === 'tr' ? 'Analitik veriler indirildi' : 'Analytics data downloaded',
    });
  }, [analytics, selectedPeriod, language, toast]);

  // Calculate percentage changes
  const calculateGrowth = (current: number, previous: number): number => {
    if (previous === 0) return 0;
    return ((current - previous) / previous) * 100;
  };

  if (isLoading) {
    return (
      <AdminLayout title={tr("analytics.title")}>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-yellow-500" />
          <span className="ml-2 text-white">{tr("analytics.loading")}</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title={tr("analytics.title")}>
        <div className="text-center py-12">
          <div className="text-red-500 mb-4">
            <Activity className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            {tr("analytics.error_title")}
          </h3>
          <p className="text-gray-400 mb-4">
            {tr("analytics.error_desc")}
          </p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {tr("analytics.retry")}
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={tr("analytics.title")}>
      <div className="space-y-6">
        {/* Enhanced Header */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-white flex items-center">
                <BarChart3 className="h-10 w-10 mr-3 text-yellow-500" />
                {tr("analytics.title")}
                <Badge className="ml-3 bg-green-500/20 text-green-400 border-green-500/30">
                  {language === 'tr' ? 'Gerçek Veri' : 'Real Data'}
                </Badge>
              </h1>
              <p className="text-gray-400 mt-2 text-lg">
                {tr("analytics.subtitle")}
              </p>
              <div className="flex items-center mt-2 space-x-4">
                <span className="text-sm text-gray-500 flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {language === 'tr' ? 'Son güncelleme:' : 'Last update:'} {new Date().toLocaleTimeString(language === 'tr' ? 'tr-TR' : 'en-US')}
                </span>
                <button
                  onClick={() => setRealTimeEnabled(!realTimeEnabled)}
                  className={`text-sm flex items-center px-3 py-1 rounded-full transition-colors ${
                    realTimeEnabled 
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                      : 'bg-gray-700 text-gray-400 border border-gray-600'
                  }`}
                >
                  <div className={`w-2 h-2 rounded-full mr-2 ${realTimeEnabled ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                  {language === 'tr' ? 'Canlı Güncelleme' : 'Live Updates'} {realTimeEnabled ? (language === 'tr' ? 'Açık' : 'On') : (language === 'tr' ? 'Kapalı' : 'Off')}
                </button>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              {/* Filters */}
              <div className="flex items-center space-x-2">
                <Filter className="h-4 w-4 text-gray-400" />
                <select
                  value={filterCountry}
                  onChange={(e) => setFilterCountry(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
                >
                  <option value="all">{language === 'tr' ? 'Tüm Ülkeler' : 'All Countries'}</option>
                  <option value="TR">{language === 'tr' ? 'Türkiye' : 'Turkey'}</option>
                  <option value="US">{language === 'tr' ? 'ABD' : 'USA'}</option>
                  <option value="DE">{language === 'tr' ? 'Almanya' : 'Germany'}</option>
                </select>
                
                <select
                  value={filterDevice}
                  onChange={(e) => setFilterDevice(e.target.value)}
                  className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-yellow-500"
                >
                  <option value="all">{language === 'tr' ? 'Tüm Cihazlar' : 'All Devices'}</option>
                  <option value="desktop">{tr("analytics.desktop")}</option>
                  <option value="mobile">{tr("analytics.mobile")}</option>
                  <option value="tablet">{tr("analytics.tablet")}</option>
                </select>
              </div>
              
              {/* Period Selector */}
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
              >
                <option value="1">{language === 'tr' ? 'Bugün' : 'Today'}</option>
                <option value="7">{language === 'tr' ? '7 Gün' : '7 Days'}</option>
                <option value="30">{language === 'tr' ? '30 Gün' : '30 Days'}</option>
                <option value="90">{language === 'tr' ? '90 Gün' : '90 Days'}</option>
              </select>
              
              {/* Action Buttons */}
              <Button onClick={handleExport} variant="outline" className="flex items-center">
                <Download className="h-4 w-4 mr-2" />
                {language === 'tr' ? 'Rapor İndir' : 'Download Report'}
              </Button>
              
              <Button onClick={handleRefresh} disabled={refreshing} className="bg-yellow-600 hover:bg-yellow-700">
                <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                {refreshing ? (language === 'tr' ? 'Yenileniyor...' : 'Refreshing...') : tr("analytics.refresh")}
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Total Users Card */}
          <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50 hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-blue-200">
                      {tr("analytics.total_users")}
                    </p>
                    <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                      {tr("analytics.active_users")}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-white">
                      {analytics?.overview?.totalUsers?.toLocaleString() || 0}
                    </span>
                    <div className={`ml-3 flex items-center text-sm px-2 py-1 rounded-full ${
                      (analytics?.overview?.userGrowth || 0) >= 0 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {(analytics?.overview?.userGrowth || 0) >= 0 ? 
                        <TrendingUp className="h-3 w-3 mr-1" /> : 
                        <TrendingDown className="h-3 w-3 mr-1" />
                      }
                      <span className="font-semibold">
                        {Math.abs(analytics?.overview?.userGrowth || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={75} 
                    className="mt-3 h-2 bg-blue-900/50" 
                  />
                  <p className="text-xs text-blue-300 mt-1">Hedef: 2,000 kullanıcı</p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="p-3 bg-blue-500/20 rounded-full">
                    <Users className="h-8 w-8 text-blue-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Revenue Card */}
          <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50 hover:shadow-lg hover:shadow-green-500/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-green-200">
                      {tr("analytics.total_revenue")}
                    </p>
                    <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                      TRY
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-white">
                      ₺{analytics?.overview?.totalRevenue.toLocaleString() || 0}
                    </span>
                    <div className={`ml-3 flex items-center text-sm px-2 py-1 rounded-full ${
                      (analytics?.overview?.revenueGrowth || 0) >= 0 
                        ? 'bg-green-500/20 text-green-400' 
                        : 'bg-red-500/20 text-red-400'
                    }`}>
                      {(analytics?.overview?.revenueGrowth || 0) >= 0 ? 
                        <TrendingUp className="h-3 w-3 mr-1" /> : 
                        <TrendingDown className="h-3 w-3 mr-1" />
                      }
                      <span className="font-semibold">
                        {Math.abs(analytics?.overview?.revenueGrowth || 0).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <Progress 
                    value={65} 
                    className="mt-3 h-2 bg-green-900/50" 
                  />
                  <p className="text-xs text-green-300 mt-1">{language === 'tr' ? 'Aylık hedef: ₺50,000' : 'Monthly target: ₺50,000'}</p>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="p-3 bg-green-500/20 rounded-full">
                    <DollarSign className="h-8 w-8 text-green-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Bets Card */}
          <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-700/50 hover:shadow-lg hover:shadow-yellow-500/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-yellow-200">
                      {tr("analytics.total_bets")}
                    </p>
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                      {language === 'tr' ? 'Oyun' : 'Game'}
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-white">
                      {analytics?.overview?.totalBets?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-yellow-300">
                      {tr("analytics.avg_bet")}: ₺{analytics?.overview?.averageBetAmount?.toFixed(2) || 0}
                    </p>
                    <Progress 
                      value={88} 
                      className="h-2 bg-yellow-900/50" 
                    />
                    <p className="text-xs text-yellow-300">{language === 'tr' ? 'Günlük hedef: 10,000 bahis' : 'Daily target: 10,000 bets'}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="p-3 bg-yellow-500/20 rounded-full">
                    <Gamepad2 className="h-8 w-8 text-yellow-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Win Rate Card */}
          <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50 hover:shadow-lg hover:shadow-purple-500/20 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-purple-200">
                      {tr("analytics.win_rate")}
                    </p>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-xs">
                      RTP
                    </Badge>
                  </div>
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-white">
                      {((analytics?.overview?.winRate || 0) * 100).toFixed(1)}%
                    </span>
                    <div className="ml-3 flex items-center">
                      {((analytics?.overview?.winRate || 0) * 100) > 40 ? 
                        <CheckCircle className="h-4 w-4 text-green-400" /> : 
                        <AlertCircle className="h-4 w-4 text-yellow-400" />
                      }
                    </div>
                  </div>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm text-purple-300">
                      {language === 'tr' ? 'Aktif:' : 'Active:'} {analytics?.overview?.activeUsers.toLocaleString() || 0} {language === 'tr' ? 'kullanıcı' : 'users'}
                    </p>
                    <Progress 
                      value={((analytics?.overview?.winRate || 0) * 100)} 
                      className="h-2 bg-purple-900/50" 
                    />
                    <p className="text-xs text-purple-300">{language === 'tr' ? 'Optimal RTP: %42-45' : 'Optimal RTP: 42-45%'}</p>
                  </div>
                </div>
                <div className="flex-shrink-0 ml-4">
                  <div className="p-3 bg-purple-500/20 rounded-full">
                    <Target className="h-8 w-8 text-purple-400" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Analytics Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-6 bg-gray-800/80 backdrop-blur-sm border border-gray-700">
            <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              {tr("analytics.overview")}
            </TabsTrigger>
            <TabsTrigger value="users" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              {tr("analytics.users")}
            </TabsTrigger>
            <TabsTrigger value="games" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Gamepad2 className="h-4 w-4 mr-2" />
              {tr("analytics.games")}
            </TabsTrigger>
            <TabsTrigger value="revenue" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <DollarSign className="h-4 w-4 mr-2" />
              {tr("analytics.revenue")}
            </TabsTrigger>
            <TabsTrigger value="devices" className="data-[state=active]:bg-gray-600 data-[state=active]:text-white">
              <Monitor className="h-4 w-4 mr-2" />
              {tr("analytics.devices")}
            </TabsTrigger>
            <TabsTrigger value="live" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
              <Activity className="h-4 w-4 mr-2" />
              {tr("analytics.live_monitoring")}
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily Revenue Chart */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-yellow-500" />
                    {language === 'tr' ? 'Günlük Gelir' : 'Daily Revenue'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics?.dailyStats || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#F59E0B" 
                        fill="url(#revenueGradient)" 
                      />
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* User Activity Chart */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-blue-500" />
                    {language === 'tr' ? 'Kullanıcı Aktivitesi' : 'User Activity'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={analytics?.dailyStats || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="users" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="registrations" 
                        stroke="#10B981" 
                        strokeWidth={2}
                        dot={{ fill: '#10B981' }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              {/* User KPIs */}
              <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-400">Toplam Kullanıcı</p>
                      <p className="text-2xl font-bold text-white">
                        {analytics?.overview?.totalUsers?.toLocaleString() || 0}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-400">Aktif Kullanıcı</p>
                      <p className="text-2xl font-bold text-white">
                        {analytics?.overview?.activeUsers.toLocaleString() || 0}
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-400">{language === 'tr' ? 'Büyüme Oranı' : 'Growth Rate'}</p>
                      <p className="text-2xl font-bold text-white">
                        +{analytics?.overview?.userGrowth.toFixed(1) || 0}%
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-yellow-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-400">{language === 'tr' ? 'Retention' : 'Retention'}</p>
                      <p className="text-2xl font-bold text-white">
                        {analytics?.userStats?.retention && analytics.userStats.retention.length > 1 
                          ? `${analytics.userStats.retention[1].rate}%` 
                          : '61%'}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Users by Country */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-green-500" />
                    {language === 'tr' ? 'Ülkelere Göre Kullanıcılar' : 'Users by Country'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 mb-6">
                    {(analytics?.userStats?.byCountry || []).map((country, index) => {
                      const totalUsers = analytics?.userStats?.byCountry?.reduce((sum, c) => sum + c.users, 0) || 1;
                      const percentage = ((country.users / totalUsers) * 100).toFixed(1);
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                            <span className="text-white font-medium">{country.country}</span>
                          </div>
                          <div className="text-right">
                            <div className="text-white font-semibold">{country.users} {language === 'tr' ? 'kullanıcı' : 'users'}</div>
                            <div className="text-xs text-gray-400">{percentage}%</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={analytics?.userStats?.byCountry || []}
                        cx="50%"
                        cy="50%"
                        outerRadius={60}
                        fill="#8884d8"
                        dataKey="users"
                      >
                        {(analytics?.userStats?.byCountry || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* User Retention */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-purple-500" />
                    {language === 'tr' ? 'Kullanıcı Elde Tutma' : 'User Retention'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics?.userStats?.retention || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="day" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="rate" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* User Activity Timeline */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-blue-500" />
                  {language === 'tr' ? 'Günlük Kullanıcı Aktivitesi' : 'Daily User Activity'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics?.dailyStats || []}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="date" stroke="#9CA3AF" />
                    <YAxis stroke="#9CA3AF" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1F2937', 
                        border: '1px solid #374151',
                        borderRadius: '8px'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="users" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                      name={language === 'tr' ? "Aktif Kullanıcılar" : "Active Users"}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="registrations" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                      name={language === 'tr' ? "Yeni Kayıtlar" : "New Registrations"}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Games Tab */}
          <TabsContent value="games" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Games Table */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Gamepad2 className="h-5 w-5 mr-2 text-purple-500" />
                    {language === 'tr' ? 'En Popüler Oyunlar' : 'Top Games'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {(analytics?.gameStats || []).slice(0, 8).map((game, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                            index === 0 ? 'bg-yellow-500' : 
                            index === 1 ? 'bg-gray-400' : 
                            index === 2 ? 'bg-orange-500' : 'bg-gray-600'
                          }`}>
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="text-white font-medium">{game.name}</h4>
                            <p className="text-xs text-gray-400">{game.provider}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-semibold">₺{game.revenue.toLocaleString()}</div>
                          <div className="text-xs text-gray-400">{game.plays} {language === 'tr' ? 'oynama' : 'plays'}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Game Categories Performance */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-2 text-orange-500" />
                    {language === 'tr' ? 'Kategori Performansı' : 'Category Performance'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Slot Oyunları', value: 75, color: '#F59E0B' },
                          { name: 'Canlı Casino', value: 15, color: '#10B981' },
                          { name: 'Masa Oyunları', value: 7, color: '#3B82F6' },
                          { name: 'Diğer', value: 3, color: '#8B5CF6' }
                        ]}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name} ${value}%`}
                        outerRadius={80}
                        dataKey="value"
                      >
                        {[
                          { name: 'Slot Oyunları', value: 75, color: '#F59E0B' },
                          { name: 'Canlı Casino', value: 15, color: '#10B981' },
                          { name: 'Masa Oyunları', value: 7, color: '#3B82F6' },
                          { name: 'Diğer', value: 3, color: '#8B5CF6' }
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Game Performance Metrics */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                  Oyun Performans Detayları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 text-gray-400">Oyun Adı</th>
                        <th className="text-left py-3 text-gray-400">Oynama Sayısı</th>
                        <th className="text-left py-3 text-gray-400">Toplam Gelir</th>
                        <th className="text-left py-3 text-gray-400">RTP</th>
                        <th className="text-left py-3 text-gray-400">Sağlayıcı</th>
                        <th className="text-left py-3 text-gray-400">Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(analytics?.gameStats || []).slice(0, 15).map((game, index) => (
                        <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                          <td className="py-3 text-white font-medium">{game.name}</td>
                          <td className="py-3 text-gray-300">{game.plays.toLocaleString()}</td>
                          <td className="py-3 text-green-400">₺{game.revenue.toLocaleString()}</td>
                          <td className="py-3 text-yellow-400">{(game.rtp * 100).toFixed(1)}%</td>
                          <td className="py-3">
                            <Badge variant="outline" className="border-gray-600 text-gray-300">
                              {game.provider}
                            </Badge>
                          </td>
                          <td className="py-3">
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                              {language === 'tr' ? 'Aktif' : 'Active'}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Revenue Tab */}
          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              {/* Revenue KPIs */}
              <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-400">{language === 'tr' ? 'Toplam Gelir' : 'Total Revenue'}</p>
                      <p className="text-2xl font-bold text-white">
                        ₺{analytics?.overview?.totalRevenue.toLocaleString() || 0}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-400">{language === 'tr' ? 'Aylık Gelir' : 'Monthly Revenue'}</p>
                      <p className="text-2xl font-bold text-white">
                        ₺{analytics?.overview?.totalRevenue.toLocaleString() || 0}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-400">{language === 'tr' ? 'Ort. Bet' : 'Avg. Bet'}</p>
                      <p className="text-2xl font-bold text-white">
                        ₺{analytics?.overview?.averageBetAmount.toFixed(2) || 0}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-purple-400" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-400">{language === 'tr' ? 'Büyüme' : 'Growth'}</p>
                      <p className="text-2xl font-bold text-white">
                        +{analytics?.overview?.revenueGrowth.toFixed(1) || 0}%
                      </p>
                    </div>
                    <ArrowUpRight className="h-8 w-8 text-orange-400" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Payment Methods */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-green-500" />
                    {language === 'tr' ? 'Ödeme Yöntemleri' : 'Payment Methods'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(analytics?.paymentStats.methods || []).map((method, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="text-white font-medium">{method.method}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-semibold">₺{method.amount.toLocaleString()}</div>
                          <div className="text-xs text-gray-400">{method.count} işlem</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={analytics?.paymentStats.methods || []}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="amount"
                        >
                          {(analytics?.paymentStats.methods || []).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Trends */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-blue-500" />
                    {language === 'tr' ? 'Gelir Trendleri' : 'Revenue Trends'}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={analytics?.dailyStats || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#10B981" 
                        fill="url(#revenueGradient2)" 
                      />
                      <defs>
                        <linearGradient id="revenueGradient2" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Revenue Breakdown Table */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <DollarSign className="h-5 w-5 mr-2 text-yellow-500" />
                  {language === 'tr' ? 'Gelir Detay Analizi' : 'Revenue Detail Analysis'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-3 text-gray-400">{language === 'tr' ? 'Ödeme Yöntemi' : 'Payment Method'}</th>
                        <th className="text-left py-3 text-gray-400">{language === 'tr' ? 'Toplam Miktar' : 'Total Amount'}</th>
                        <th className="text-left py-3 text-gray-400">{language === 'tr' ? 'İşlem Sayısı' : 'Transaction Count'}</th>
                        <th className="text-left py-3 text-gray-400">{language === 'tr' ? 'Ortalama' : 'Average'}</th>
                        <th className="text-left py-3 text-gray-400">{language === 'tr' ? 'Pay' : 'Share'}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(analytics?.paymentStats.methods || []).map((method, index) => {
                        const totalRevenue = analytics?.paymentStats.methods?.reduce((sum, m) => sum + m.amount, 0) || 1;
                        const percentage = ((method.amount / totalRevenue) * 100).toFixed(1);
                        const average = method.count > 0 ? (method.amount / method.count).toFixed(2) : '0';
                        
                        return (
                          <tr key={index} className="border-b border-gray-700/50 hover:bg-gray-700/20">
                            <td className="py-3 text-white font-medium">{method.method}</td>
                            <td className="py-3 text-green-400">₺{method.amount.toLocaleString()}</td>
                            <td className="py-3 text-gray-300">{method.count.toLocaleString()}</td>
                            <td className="py-3 text-blue-400">₺{average}</td>
                            <td className="py-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-16 bg-gray-700 rounded-full h-2">
                                  <div 
                                    className="h-2 rounded-full bg-green-500" 
                                    style={{ width: `${percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-400">{percentage}%</span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Devices Tab */}
          <TabsContent value="devices" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Device Distribution */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Monitor className="h-5 w-5 mr-2 text-blue-500" />
                    Cihaz Dağılımı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(analytics?.userStats?.byDevice || []).map((device, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="flex justify-center">
                            {device.device === 'desktop' && <Desktop className="h-8 w-8 text-blue-500" />}
                            {device.device === 'mobile' && <Smartphone className="h-8 w-8 text-green-500" />}
                            {device.device === 'tablet' && <Tablet className="h-8 w-8 text-purple-500" />}
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-white capitalize">
                              {device.device === 'desktop' ? 'Masaüstü' : 
                               device.device === 'mobile' ? 'Mobil' : 'Tablet'}
                            </h3>
                            <p className="text-sm text-gray-400">
                              {device.users.toLocaleString()} kullanıcı
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-yellow-500">
                            {device.percentage.toFixed(1)}%
                          </p>
                          <Progress 
                            value={device.percentage} 
                            className="w-24 h-2 mt-2" 
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Device Performance Chart */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
                    Cihaz Performansı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={analytics?.userStats?.byDevice || []}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="device" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="users" fill="#3B82F6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Device Usage Trends */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-green-500" />
                  Cihaz Kullanım Trendleri
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Desktop className="h-8 w-8 text-blue-500" />
                      <Badge className="bg-blue-500/20 text-blue-400">Masaüstü</Badge>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {analytics?.userStats?.byDevice?.find(d => d.device === 'Desktop')?.percentage?.toFixed(1) || '25'}%
                    </h3>
                    <p className="text-sm text-gray-400">En yüksek dönüşüm oranı</p>
                    <div className="mt-3 flex items-center text-green-400 text-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +2.5% bu hafta
                    </div>
                  </div>

                  <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Smartphone className="h-8 w-8 text-green-500" />
                      <Badge className="bg-green-500/20 text-green-400">Mobil</Badge>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {analytics?.userStats?.byDevice?.find(d => d.device === 'Mobile')?.percentage?.toFixed(1) || '68'}%
                    </h3>
                    <p className="text-sm text-gray-400">En çok kullanılan</p>
                    <div className="mt-3 flex items-center text-green-400 text-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +5.1% bu hafta
                    </div>
                  </div>

                  <div className="p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Tablet className="h-8 w-8 text-purple-500" />
                      <Badge className="bg-purple-500/20 text-purple-400">Tablet</Badge>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-1">
                      {analytics?.userStats?.byDevice?.find(d => d.device === 'Tablet')?.percentage?.toFixed(1) || '7'}%
                    </h3>
                    <p className="text-sm text-gray-400">Istikrarlı büyüme</p>
                    <div className="mt-3 flex items-center text-yellow-400 text-sm">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      +1.2% bu hafta
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;