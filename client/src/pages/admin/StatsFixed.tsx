import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { adminTranslations } from '@/utils/translations/adminTranslations';
import {
  BarChart,
  Calendar,
  ChevronDown,
  Download,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Users,
  Activity,
  PieChart,
  BarChart2,
  Clock,
  Target,
  Gamepad,
  ArrowUpRight,
  Layers,
  RefreshCw,
  Loader,
  Database,
  Cpu,
  HardDrive,
  AlertCircle,
  Zap,
  CheckCircle,
  XCircle
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart as RechartsBarChart,
  Bar,
  Cell
} from 'recharts';

interface StatsData {
  users: {
    total: string;
    active: string;
    newToday: number;
    inactive: string;
    suspended: number;
    userRegistrations: Array<{ date: string; users: number }>;
  };
  financial: {
    totalDeposits: number;
    totalWithdrawals: number;
    pendingWithdrawals: number;
    netProfit: number;
    revenueDaily: Array<{ date: string; value: number }>;
  };
  games: {
    totalGames: number;
    mostPlayed: string;
    totalBets: number;
    avgBetAmount: number;
    popularGames: Array<{
      name: string;
      plays: number;
      winRate: number;
      avgBet: number;
    }>;
  };
  activities: {
    logins: number;
    registrations: number;
    transactions: number;
    betsPlaced: number;
    userLogs: Array<{
      user: string;
      action: string;
      timestamp: string;
      ip: string;
    }>;
  };
}

const StatsChart = ({
  data,
  title,
  valuePrefix = '',
  dataKey,
  color = '#F59E0B',
  type = 'line'
}: {
  data: any[];
  title: string;
  valuePrefix?: string;
  dataKey: string;
  color?: string;
  type?: 'line' | 'area' | 'bar';
}) => {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-400">
        <BarChart className="mx-auto h-8 w-8 mb-2" />
        <p>Veri bulunamadı</p>
      </div>
    );
  }

  const ChartComponent = type === 'area' ? AreaChart : type === 'bar' ? RechartsBarChart : LineChart;

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={200}>
        <ChartComponent data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <YAxis 
            stroke="#9CA3AF"
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1F2937',
              border: '1px solid #374151',
              borderRadius: '8px'
            }}
            formatter={(value) => [`${valuePrefix}${value}`, title]}
          />
          {type === 'area' ? (
            <Area
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              fill={`${color}20`}
              strokeWidth={2}
            />
          ) : type === 'bar' ? (
            <Bar dataKey={dataKey} fill={color} />
          ) : (
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </div>
  );
};

const MetricCard = memo(({
  icon: Icon,
  title,
  value,
  trend,
  trendValue,
  color = 'yellow'
}: {
  icon: React.ElementType;
  title: string;
  value: string | number;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  color?: 'yellow' | 'green' | 'red' | 'blue';
}) => {
  const colorClasses = {
    yellow: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
    green: 'text-green-500 bg-green-500/10 border-green-500/20',
    red: 'text-red-500 bg-red-500/10 border-red-500/20',
    blue: 'text-blue-500 bg-blue-500/10 border-blue-500/20'
  };

  return (
    <div className={`p-6 rounded-xl border ${colorClasses[color]} backdrop-blur-sm hover:border-opacity-40 transition-all duration-300`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {trend && trendValue && (
            <div className={`flex items-center mt-2 text-sm ${
              trend === 'up' ? 'text-green-400' : 
              trend === 'down' ? 'text-red-400' : 
              'text-gray-400'
            }`}>
              {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : 
               trend === 'down' ? <TrendingDown className="h-4 w-4 mr-1" /> : null}
              {trendValue}
            </div>
          )}
        </div>
        <Icon className={`h-8 w-8 ${colorClasses[color].split(' ')[0]}`} />
      </div>
    </div>
  );
});

const SystemPerformance = memo(() => {
  const [systemStats, setSystemStats] = useState({
    cpu: 45,
    memory: 62,
    disk: 38,
    network: 89,
    uptime: '15 gün 8 saat'
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">CPU Kullanımı</span>
          <Cpu className="h-4 w-4 text-yellow-500" />
        </div>
        <div className="text-xl font-bold text-white mb-2">{systemStats.cpu}%</div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-yellow-500 h-2 rounded-full" 
            style={{ width: `${systemStats.cpu}%` }}
          />
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Bellek Kullanımı</span>
          <HardDrive className="h-4 w-4 text-blue-500" />
        </div>
        <div className="text-xl font-bold text-white mb-2">{systemStats.memory}%</div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full" 
            style={{ width: `${systemStats.memory}%` }}
          />
        </div>
      </div>

      <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-400">Disk Kullanımı</span>
          <Database className="h-4 w-4 text-green-500" />
        </div>
        <div className="text-xl font-bold text-white mb-2">{systemStats.disk}%</div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-green-500 h-2 rounded-full" 
            style={{ width: `${systemStats.disk}%` }}
          />
        </div>
      </div>
    </div>
  );
});

const Stats: React.FC = () => {
  const [statsData, setStatsData] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('7');
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState<'tr' | 'en' | 'ka'>('tr');
  const { toast } = useToast();

  // Çeviri fonksiyonu - AdminLayout'dan gelen dil bilgisini kullanacak
  const t = (key: string, defaultValue: string = ""): string => {
    const translations = adminTranslations[key as keyof typeof adminTranslations];
    if (!translations) return defaultValue;
    return translations[currentLanguage] || defaultValue;
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('admin-language') as 'tr' | 'en' | 'ka' | null;
    if (savedLang && ['tr', 'en', 'ka'].includes(savedLang)) {
      setCurrentLanguage(savedLang);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      console.log(`Dashboard yükleniyor, dil:`, currentLanguage);
      console.log("Fetching statistics from API...");
      
      const url = `/api/admin/stats?lang=${currentLanguage}`;
      console.log("API URL:", url, "Dil:", currentLanguage);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log("API Yanıtı (JSON):", data);
      console.log("Statistics data successfully retrieved");
      
      setStatsData(data);
      console.log("API verileri kullanılıyor");
      console.log(`${currentLanguage} diline göre veri güncellendi`);
      
    } catch (error) {
      console.error('İstatistikler alınırken hata:', error);
      toast({
        title: t('admin.error', 'Hata'),
        description: t('admin.stats_fetch_error', 'İstatistikler alınırken bir hata oluştu.'),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [currentLanguage, toast, t]);

  // Single fetch on mount
  useEffect(() => {
    fetchStats();
  }, []);

  // Language change handler - debounced
  useEffect(() => {
    if (currentLanguage) {
      const timeoutId = setTimeout(() => {
        fetchStats();
      }, 500);
      
      return () => clearTimeout(timeoutId);
    }
  }, [currentLanguage]);

  // Realtime updates
  useEffect(() => {
    if (realtimeEnabled) {
      const interval = setInterval(fetchStats, 30000);
      return () => clearInterval(interval);
    }
  }, [realtimeEnabled]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <AdminLayout title={t('admin.menu.statistics', 'İstatistikler')}>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center space-x-3">
            <Loader className="h-6 w-6 animate-spin text-yellow-500" />
            <span className="text-lg text-gray-300">
              {t('admin.dashboard.stats_loading', 'İstatistikler yükleniyor...')}
            </span>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!statsData) {
    return (
      <AdminLayout title={t('admin.menu.statistics', 'İstatistikler')}>
        <div className="text-center py-8">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-gray-400">
            {t('admin.stats_error', 'İstatistik verileri yüklenirken bir hata oluştu.')}
          </p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={t('admin.menu.statistics', 'İstatistikler')}>
      <div className="space-y-6">
        {/* Header Controls */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">
              {t('admin.menu.statistics', 'İstatistik Paneli')}
            </h1>
            <p className="text-gray-400 mt-1">
              {t('admin.statistics', 'Detaylı İstatistikler')}
            </p>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Period Selection */}
            <div className="relative">
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-yellow-500"
              >
                <option value="1">{t('admin.period.1day', '1 Gün')}</option>
                <option value="7">{t('admin.period.7days', '7 Gün')}</option>
                <option value="30">{t('admin.period.30days', '30 Gün')}</option>
                <option value="90">{t('admin.period.90days', '90 Gün')}</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchStats}
              className="flex items-center px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('admin.refresh', 'Yenile')}
            </button>

            {/* Export Button */}
            <button
              className="flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <Download className="h-4 w-4 mr-2" />
              {t('admin.export', 'Dışa Aktar')}
            </button>
          </div>
        </div>

        {/* Main Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            icon={Users}
            title={t('admin.total_users', 'Toplam Kullanıcılar')}
            value={statsData.users.total}
            trend="up"
            trendValue={`+${statsData.users.newToday} ${t('admin.today', 'bugün')}`}
            color="blue"
          />
          
          <MetricCard
            icon={DollarSign}
            title={t('admin.total_deposits', 'Toplam Para Yatırma')}
            value={formatCurrency(statsData.financial.totalDeposits)}
            trend="up"
            trendValue="+12.5%"
            color="green"
          />
          
          <MetricCard
            icon={Activity}
            title={t('admin.conversion_rate', 'Dönüşüm Oranı')}
            value="68.2%"
            trend="up"
            trendValue="+2.1%"
            color="yellow"
          />
          
          <MetricCard
            icon={Gamepad}
            title={t('admin.dashboard.total_games', 'Toplam Oyunlar')}
            value={statsData.games.totalGames}
            trend="neutral"
            color="yellow"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <StatsChart
            data={statsData.users.userRegistrations}
            title={t('admin.dashboard.registrations', 'Kayıtlar')}
            dataKey="users"
            color="#3B82F6"
            type="area"
          />
          
          <StatsChart
            data={statsData.financial.revenueDaily}
            title={t('admin.dashboard.deposits', 'Yatırımlar')}
            dataKey="value"
            valuePrefix="₺"
            color="#10B981"
            type="bar"
          />
        </div>

        {/* Detailed Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Stats */}
          <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              <Users className="h-5 w-5 mr-2 text-blue-500 inline" />
              {t('admin.dashboard.user_statistics', 'Kullanıcı İstatistikleri')}
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{t('admin.active', 'Aktif')}</span>
                <span className="text-green-400 font-medium">{statsData.users.active}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{t('admin.inactive', 'Pasif')}</span>
                <span className="text-yellow-400 font-medium">{statsData.users.inactive}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{t('admin.suspended', 'Askıya Alındı')}</span>
                <span className="text-red-400 font-medium">{statsData.users.suspended}</span>
              </div>
            </div>
          </div>

          {/* Financial Stats */}
          <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              <DollarSign className="h-5 w-5 mr-2 text-green-500 inline" />
              {t('admin.dashboard.financial', 'Mali Durum')}
            </h3>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{t('admin.dashboard.total_withdrawals', 'Toplam Çekimler')}</span>
                <span className="text-white font-medium">{formatCurrency(statsData.financial.totalWithdrawals)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{t('admin.dashboard.pending_withdrawals', 'Bekleyen Çekimler')}</span>
                <span className="text-yellow-400 font-medium">{formatCurrency(statsData.financial.pendingWithdrawals)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">{t('admin.dashboard.net_profit', 'Net Kâr')}</span>
                <span className="text-green-400 font-medium">{formatCurrency(statsData.financial.netProfit)}</span>
              </div>
            </div>
          </div>

          {/* Popular Games */}
          <div className="bg-gray-800/80 rounded-xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">
              <Gamepad className="h-5 w-5 mr-2 text-yellow-500 inline" />
              {t('admin.dashboard.popular_games', 'Popüler Oyunlar')}
            </h3>
            
            <div className="space-y-3">
              {statsData.games.popularGames.slice(0, 5).map((game, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">{game.name}</span>
                  <span className="text-white font-medium">{game.plays}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Performance Section */}
        <div className="mt-8 mb-6">
          <div className="bg-gray-800/80 rounded-xl shadow-lg p-5 border border-yellow-500/20 backdrop-blur-sm hover:border-yellow-500/30 transition-all duration-300">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                <Database className="h-5 w-5 mr-2 text-yellow-500 inline" />
                {t('admin.system_performance', 'Sistem Performansı')}
              </h2>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">
                  {t('admin.auto_refresh', 'Otomatik Yenileme')}
                </span>
                <button 
                  onClick={() => setRealtimeEnabled(!realtimeEnabled)}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 ${realtimeEnabled ? 'bg-yellow-500' : 'bg-gray-700'} transition-colors focus:outline-none`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform rounded-full ${realtimeEnabled ? 'translate-x-6 bg-black' : 'translate-x-1 bg-white'} transition-transform`}
                  />
                </button>
              </div>
            </div>
            
            <SystemPerformance />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Stats;