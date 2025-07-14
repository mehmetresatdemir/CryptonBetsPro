import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { translate } from "@/utils/i18n-fixed";
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminLanguage } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
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
  AreaChart,
  Area,
  BarChart as RechartBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart as RechartPieChart,
  Pie,
  Cell
} from 'recharts';

// Renk palette'i
const COLORS = {
  primary: '#FFD700', // Ana sarı renk
  secondary: '#444', // İkincil gri
  success: '#4ade80',
  danger: '#f87171',
  warning: '#facc15',
  info: '#60a5fa',
  background: '#1f2937',
  chart: ['#FFD700', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f43f5e', '#64748b']
};

// Performans grafiği bileşeni - memo ile optimize edildi
const PerformanceChart = memo(({ data, title, type = 'line' }: { 
  data: any[]; 
  title: string;
  type?: 'line' | 'area' | 'bar';
}) => {
  const { language, t } = useAdminLanguage();
  
  if (!data || data.length === 0) {
    return (
      <div className="h-64 bg-gray-800 rounded-lg flex items-center justify-center">
        <Loader className="h-8 w-8 text-yellow-500 animate-spin mr-3" />
        <span className="text-gray-400">
          {translate('admin.loadingData', 'Veri yükleniyor...')}
        </span>
      </div>
    );
  }

  // Grafik tipine göre render et
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        {type === 'line' ? (
          <LineChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="date" 
              stroke="#999"
              tick={{ fill: '#999', fontSize: 12 }}
            />
            <YAxis 
              stroke="#999"
              tick={{ fill: '#999', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #444', borderRadius: '0.375rem' }}
              labelStyle={{ color: '#FFD700' }}
            />
            <Legend 
              iconType="circle"
              wrapperStyle={{ paddingTop: 10 }}
            />
            {Object.keys(data[0])
              .filter(key => key !== 'date')
              .map((key, index) => (
                <Line 
                  key={key}
                  type="monotone" 
                  dataKey={key} 
                  stroke={COLORS.chart[index % COLORS.chart.length]} 
                  strokeWidth={2}
                  activeDot={{ r: 6, fill: COLORS.chart[index % COLORS.chart.length] }}
                />
              ))
            }
          </LineChart>
        ) : type === 'area' ? (
          <AreaChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="date" 
              stroke="#999"
              tick={{ fill: '#999', fontSize: 12 }}
            />
            <YAxis 
              stroke="#999"
              tick={{ fill: '#999', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #444', borderRadius: '0.375rem' }}
              labelStyle={{ color: '#FFD700' }}
            />
            <Legend 
              iconType="circle"
              wrapperStyle={{ paddingTop: 10 }}
            />
            {Object.keys(data[0])
              .filter(key => key !== 'date')
              .map((key, index) => (
                <Area 
                  key={key}
                  type="monotone" 
                  dataKey={key} 
                  stroke={COLORS.chart[index % COLORS.chart.length]}
                  fill={`${COLORS.chart[index % COLORS.chart.length]}33`} // 20% opak renk
                  activeDot={{ r: 6, fill: COLORS.chart[index % COLORS.chart.length] }}
                />
              ))
            }
          </AreaChart>
        ) : (
          <RechartBarChart
            data={data}
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#333" />
            <XAxis 
              dataKey="date" 
              stroke="#999"
              tick={{ fill: '#999', fontSize: 12 }}
            />
            <YAxis 
              stroke="#999"
              tick={{ fill: '#999', fontSize: 12 }}
            />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #444', borderRadius: '0.375rem' }}
              labelStyle={{ color: '#FFD700' }}
            />
            <Legend 
              iconType="circle"
              wrapperStyle={{ paddingTop: 10 }}
            />
            {Object.keys(data[0])
              .filter(key => key !== 'date')
              .map((key, index) => (
                <Bar 
                  key={key}
                  dataKey={key} 
                  fill={COLORS.chart[index % COLORS.chart.length]}
                  radius={[2, 2, 0, 0]}
                />
              ))
            }
          </RechartBarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
});

// Pasta grafiği bileşeni - memo ile optimize edildi
const PieChartComponent = memo(({ data, dataKey, nameKey }: { 
  data: any[]; 
  dataKey: string;
  nameKey: string;
}) => {
  const { language, t } = useAdminLanguage();
  
  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <RechartPieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={COLORS.chart[index % COLORS.chart.length]} 
              />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #444', borderRadius: '0.375rem' }}
          />
          <Legend
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            iconType="circle"
          />
        </RechartPieChart>
      </ResponsiveContainer>
    </div>
  );
});

// Sistem performans bileşeni - memo ile optimize edildi
const SystemPerformance = memo(() => {
  const { t, language } = useAdminLanguage();
  
  // Sistem performansı için örnek veri (gerçek uygulamada API'den alınır)
  const systemMetrics = useMemo(() => ({
    cpuUsage: 32, // %
    memoryUsage: 61, // %
    diskUsage: 48, // %
    responseTime: 187, // ms
    dbQueries: 28463, // toplam sorgu
    cacheHitRate: 89, // %
    activeConnections: 342,
    errorRate: 0.05, // %
  }), []);
  
  // CPU yükü geçmişi (son 10 dakika)
  const cpuHistory = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    time: `${i}m`,
    usage: Math.floor(25 + Math.random() * 40)
  })), []);
  
  // Bellek kullanımı geçmişi
  const memoryHistory = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    time: `${i}m`,
    usage: Math.floor(50 + Math.random() * 30)
  })), []);
  
  // Disk I/O Geçmişi
  const diskIOHistory = useMemo(() => Array.from({ length: 20 }, (_, i) => ({
    time: `${i}m`,
    read: Math.floor(1 + Math.random() * 20),
    write: Math.floor(1 + Math.random() * 10)
  })), []);
  
  // Metrik kartı
  const MetricCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color, 
    suffix = '', 
    trend = null 
  }: { 
    title: string; 
    value: number | string; 
    icon: React.ComponentType<any>; 
    color: string; 
    suffix?: string; 
    trend?: null | { direction: 'up' | 'down'; value: string; suffix?: string } 
  }) => (
    <div className="bg-gray-800/80 rounded-lg p-4 border border-gray-700 hover:border-yellow-500/30 transition-all duration-300">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-400">{title}</p>
          <p className="text-xl font-bold text-white mt-1">{value}{suffix}</p>
          {trend && (
            <div className="flex items-center mt-1">
              {trend.direction === 'up' ? (
                <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-3 h-3 text-red-500 mr-1" />
              )}
              <span className={`text-xs ${trend.direction === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trend.value}{trend.suffix || '%'}
              </span>
            </div>
          )}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-opacity-20 bg-${color}-500`}>
          <Icon className={`w-5 h-5 text-${color}-500`} />
        </div>
      </div>
    </div>
  );
  
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center">
        <Cpu className="h-5 w-5 mr-2 text-yellow-500" />
        {t('admin.system_performance') || 'Sistem Performansı'}
      </h2>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title={translate('admin.cpuUsage', 'CPU Kullanımı')}
          value={systemMetrics.cpuUsage}
          suffix="%"
          icon={Cpu}
          color="blue"
          trend={{ direction: 'up' as const, value: '2.3' }}
        />
        <MetricCard
          title={translate('admin.memoryUsage', 'Bellek Kullanımı')}
          value={systemMetrics.memoryUsage}
          suffix="%"
          icon={Layers}
          color="purple"
          trend={{ direction: 'up' as const, value: '1.7' }}
        />
        <MetricCard
          title={language === 'tr' ? 'Disk Kullanımı' : 
                language === 'en' ? 'Disk Usage' : 
                'დისკის გამოყენება'}
          value={systemMetrics.diskUsage}
          suffix="%"
          icon={HardDrive}
          color="yellow"
        />
        <MetricCard
          title={language === 'tr' ? 'Yanıt Süresi' : 
                language === 'en' ? 'Response Time' : 
                'რეაგირების დრო'}
          value={systemMetrics.responseTime}
          suffix="ms"
          icon={Clock}
          color="green"
          trend={{ direction: 'down' as const, value: '12.5' }}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800/80 rounded-lg p-4 border border-gray-700 hover:border-yellow-500/30 transition-all duration-300">
          <h3 className="text-white text-lg font-medium mb-3">
            {language === 'tr' ? 'CPU Kullanım Geçmişi' : 
             language === 'en' ? 'CPU Usage History' : 
             'CPU გამოყენების ისტორია'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={cpuHistory}>
              <XAxis dataKey="time" tick={{ fill: '#999', fontSize: 12 }} stroke="#444" />
              <YAxis tick={{ fill: '#999', fontSize: 12 }} stroke="#444" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #444', borderRadius: '0.375rem' }}
              />
              <Line
                type="monotone"
                dataKey="usage"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, fill: '#3b82f6' }}
              />
              <CartesianGrid stroke="#333" strokeDasharray="3 3" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-gray-800/80 rounded-lg p-4 border border-gray-700 hover:border-yellow-500/30 transition-all duration-300">
          <h3 className="text-white text-lg font-medium mb-3">
            {language === 'tr' ? 'Bellek Kullanım Geçmişi' : 
             language === 'en' ? 'Memory Usage History' : 
             'მეხსიერების გამოყენების ისტორია'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={memoryHistory}>
              <XAxis dataKey="time" tick={{ fill: '#999', fontSize: 12 }} stroke="#444" />
              <YAxis tick={{ fill: '#999', fontSize: 12 }} stroke="#444" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #444', borderRadius: '0.375rem' }}
              />
              <Area
                type="monotone"
                dataKey="usage"
                stroke="#8b5cf6"
                fill="#8b5cf620"
                activeDot={{ r: 5, fill: '#8b5cf6' }}
              />
              <CartesianGrid stroke="#333" strokeDasharray="3 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-gray-800/80 rounded-lg p-4 border border-gray-700 hover:border-yellow-500/30 transition-all duration-300">
          <h3 className="text-white text-lg font-medium mb-3">
            {language === 'tr' ? 'Disk G/Ç Aktivitesi' : 
             language === 'en' ? 'Disk I/O Activity' : 
             'დისკის I/O აქტივობა'}
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={diskIOHistory}>
              <XAxis dataKey="time" tick={{ fill: '#999', fontSize: 12 }} stroke="#444" />
              <YAxis tick={{ fill: '#999', fontSize: 12 }} stroke="#444" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #444', borderRadius: '0.375rem' }}
              />
              <Area
                type="monotone"
                dataKey="read"
                stroke="#fcd34d"
                fill="#fcd34d20"
                stackId="1"
                activeDot={{ r: 5, fill: '#fcd34d' }}
              />
              <Area
                type="monotone"
                dataKey="write"
                stroke="#f87171"
                fill="#f8717120"
                stackId="1"
                activeDot={{ r: 5, fill: '#f87171' }}
              />
              <CartesianGrid stroke="#333" strokeDasharray="3 3" />
              <Legend />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-gray-800/80 rounded-lg p-4 border border-gray-700 hover:border-yellow-500/30 transition-all duration-300">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-medium">
              {language === 'tr' ? 'DB Sorguları' : 
               language === 'en' ? 'DB Queries' : 
               'DB-ის მოთხოვნები'}
            </h3>
            <Database className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-2xl font-bold text-white">{systemMetrics.dbQueries.toLocaleString()}</p>
          <div className="text-xs text-gray-400 mt-1">
            {language === 'tr' ? 'Sorgu hızı: 124/s' : 
             language === 'en' ? 'Query rate: 124/s' : 
             'მოთხოვნის სიჩქარე: 124/s'}
          </div>
        </div>
        
        <div className="bg-gray-800/80 rounded-lg p-4 border border-gray-700 hover:border-yellow-500/30 transition-all duration-300">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-medium">
              {language === 'tr' ? 'Önbellek İsabet Oranı' : 
               language === 'en' ? 'Cache Hit Rate' : 
               'ქეშის მოხვედრის კოეფიციენტი'}
            </h3>
            <Zap className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-2xl font-bold text-white">{systemMetrics.cacheHitRate}%</p>
          <div className="text-xs text-gray-400 mt-1">
            {language === 'tr' ? 'Önbellek ıskaları: 342' : 
             language === 'en' ? 'Cache misses: 342' : 
             'ქეშის აცდენები: 342'}
          </div>
        </div>
        
        <div className="bg-gray-800/80 rounded-lg p-4 border border-gray-700 hover:border-yellow-500/30 transition-all duration-300">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-medium">
              {language === 'tr' ? 'Aktif Bağlantılar' : 
               language === 'en' ? 'Active Connections' : 
               'აქტიური კავშირები'}
            </h3>
            <Activity className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-2xl font-bold text-white">{systemMetrics.activeConnections}</p>
          <div className="text-xs text-gray-400 mt-1">
            {language === 'tr' ? 'Maksimum: 500' : 
             language === 'en' ? 'Maximum: 500' : 
             'მაქსიმუმი: 500'}
          </div>
        </div>
        
        <div className="bg-gray-800/80 rounded-lg p-4 border border-gray-700 hover:border-yellow-500/30 transition-all duration-300">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-white font-medium">
              {language === 'tr' ? 'Hata Oranı' : 
               language === 'en' ? 'Error Rate' : 
               'შეცდომის კოეფიციენტი'}
            </h3>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-2xl font-bold text-white">{systemMetrics.errorRate}%</p>
          <div className="text-xs text-gray-400 mt-1">
            {language === 'tr' ? 'Son 24 saatte: 14 hata' : 
             language === 'en' ? 'Last 24 hours: 14 errors' : 
             'ბოლო 24 საათი: 14 შეცდომა'}
          </div>
        </div>
      </div>
    </div>
  );
});

// Stats bileşeni - ana bileşen
const Stats: React.FC = () => {
  const { t, language } = useAdminLanguage();
  const { toast } = useToast();
  
  // Zaman aralığı filtresi
  const [timeRange, setTimeRange] = useState('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [realtimeEnabled, setRealtimeEnabled] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  
  // Site istatistikleri
  const siteStats = useMemo(() => ({
    totalUsers: 24781,
    activeUsers: 18392,
    newUsersToday: 243,
    totalDeposits: 4352180,
    totalWithdrawals: 3281450,
    depositToday: 284560,
    withdrawalToday: 198750,
    totalGGR: 1070730,
    ggrToday: 85810,
    betsToday: 76453,
    winRate: 94.3,
    // Sistem bilgileri
    systemHealth: 'excellent', // excellent, good, fair, poor
  }), [language]); // language değişince yeniden hesapla - çeviriler için
  
  // GGR Zaman Serisi Verileri (örnek)
  const ggrData = [
    { date: '2023-05-05', deposits: 201340, withdrawals: 156780, ggr: 44560 },
    { date: '2023-05-06', deposits: 224560, withdrawals: 178420, ggr: 46140 },
    { date: '2023-05-07', deposits: 198670, withdrawals: 156420, ggr: 42250 },
    { date: '2023-05-08', deposits: 210340, withdrawals: 165780, ggr: 44560 },
    { date: '2023-05-09', deposits: 246780, withdrawals: 198340, ggr: 48440 },
    { date: '2023-05-10', deposits: 278900, withdrawals: 224300, ggr: 54600 },
    { date: '2023-05-11', deposits: 261430, withdrawals: 203450, ggr: 57980 },
    { date: '2023-05-12', deposits: 254230, withdrawals: 196540, ggr: 57690 },
    { date: '2023-05-13', deposits: 278650, withdrawals: 211320, ggr: 67330 },
    { date: '2023-05-14', deposits: 312450, withdrawals: 242860, ggr: 69590 },
    { date: '2023-05-15', deposits: 301780, withdrawals: 231490, ggr: 70290 },
    { date: '2023-05-16', deposits: 305420, withdrawals: 236780, ggr: 68640 },
    { date: '2023-05-17', deposits: 321890, withdrawals: 245860, ggr: 76030 },
    { date: '2023-05-18', deposits: 324780, withdrawals: 248960, ggr: 75820 },
  ];

  // Oyun kategorileri istatistikleri
  const gameCategories = [
    { category: 'Slot', count: 3826, percentage: 62.4 },
    { category: 'Live Casino', count: 968, percentage: 15.8 },
    { category: 'Table Games', count: 412, percentage: 6.7 },
    { category: 'Poker', count: 284, percentage: 4.6 },
    { category: 'Blackjack', count: 198, percentage: 3.2 },
    { category: 'Roulette', count: 187, percentage: 3.1 },
    { category: 'Baccarat', count: 168, percentage: 2.7 },
    { category: 'Other', count: 92, percentage: 1.5 },
  ];

  // Popüler oyunlar
  const popularGames = [
    { name: 'Sweet Bonanza', plays: 18452, provider: 'Pragmatic Play', category: 'Slot' },
    { name: 'Gates of Olympus', plays: 16843, provider: 'Pragmatic Play', category: 'Slot' },
    { name: 'Blackjack VIP', plays: 12568, provider: 'Evolution', category: 'Live Casino' },
    { name: 'Wolf Gold', plays: 11237, provider: 'Pragmatic Play', category: 'Slot' },
    { name: 'Crazy Time', plays: 10982, provider: 'Evolution', category: 'Live Casino' },
    { name: 'Gonzo\'s Quest', plays: 9854, provider: 'NetEnt', category: 'Slot' },
    { name: 'Lightning Roulette', plays: 9732, provider: 'Evolution', category: 'Live Casino' },
    { name: 'Book of Dead', plays: 9456, provider: 'Play\'n GO', category: 'Slot' },
  ];

  // Para yatırma yöntemleri
  const depositMethods = [
    { name: 'Visa/MasterCard', depositAmount: '1,248,650₺', percentage: 28.7 },
    { name: 'Papara', depositAmount: '963,240₺', percentage: 22.1 },
    { name: 'Havale/EFT', depositAmount: '712,560₺', percentage: 16.4 },
    { name: 'QR Kod', depositAmount: '586,320₺', percentage: 13.5 },
    { name: 'Bitcoin', depositAmount: '486,750₺', percentage: 11.2 },
    { name: 'Ethereum', depositAmount: '354,660₺', percentage: 8.1 },
  ];

  // Para çekme yöntemleri
  const withdrawalMethods = [
    { name: 'Havale/EFT', withdrawalAmount: '984,430₺', percentage: 30.0 },
    { name: 'Papara', withdrawalAmount: '787,540₺', percentage: 24.0 },
    { name: 'Bitcoin', withdrawalAmount: '623,475₺', percentage: 19.0 },
    { name: 'Visa/MasterCard', withdrawalAmount: '459,400₺', percentage: 14.0 },
    { name: 'Ethereum', withdrawalAmount: '328,145₺', percentage: 10.0 },
    { name: 'USDT', withdrawalAmount: '98,460₺', percentage: 3.0 },
  ];
  
  // İstatistikleri yenileme fonksiyonu
  const refreshStats = useCallback(() => {
    setIsLoadingStats(true);
    
    // Burada API'den veri alınacak
    setTimeout(() => {
      setIsLoadingStats(false);
      toast({
        title: language === 'tr' ? 'İstatistikler güncellendi' : 
               language === 'en' ? 'Statistics updated' : 
               'სტატისტიკა განახლებულია',
        description: language === 'tr' ? 'En son veriler yüklendi' : 
                     language === 'en' ? 'Latest data loaded' : 
                     'უახლესი მონაცემები ჩატვირთულია',
      });
    }, 1500);
  }, [toast, t]);
  
  // Zaman aralığı değiştiğinde verileri güncelle
  useEffect(() => {
    refreshStats();
  }, [timeRange, refreshStats]);
  
  // Gerçek zamanlı yenileme
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (realtimeEnabled) {
      interval = setInterval(() => {
        refreshStats();
      }, 30000); // 30 saniyede bir
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [realtimeEnabled, refreshStats]);
  
  // Sistem sağlığı renk kodu
  const getSystemHealthColor = (health: string) => {
    switch (health) {
      case 'excellent': return 'text-green-500';
      case 'good': return 'text-green-400';
      case 'fair': return 'text-yellow-500';
      case 'poor': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };
  
  // Sistem sağlığı ikonu
  const getSystemHealthIcon = (health: string) => {
    switch (health) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'good': return <CheckCircle className="h-5 w-5 text-green-400" />;
      case 'fair': return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'poor': return <XCircle className="h-5 w-5 text-red-500" />;
      default: return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };
  
  return (
    <AdminLayout title={t("admin.menu.statistics")}>
      <div className="p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white mb-4 md:mb-0">
            <BarChart2 className="h-7 w-7 text-yellow-500 inline-block mr-2 mb-1" />
            {t('admin.statistics')}
          </h1>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                {language === 'tr' ? 'Zaman Aralığı' : 
                 language === 'en' ? 'Time Range' : 
                 'დროის დიაპაზონი'}
              </span>
              <select 
                className="bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-1 text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <option value="today">{language === 'tr' ? 'Bugün' : language === 'en' ? 'Today' : 'დღეს'}</option>
                <option value="yesterday">{language === 'tr' ? 'Dün' : language === 'en' ? 'Yesterday' : 'გუშინ'}</option>
                <option value="week">{language === 'tr' ? 'Bu Hafta' : language === 'en' ? 'This Week' : 'ამ კვირაში'}</option>
                <option value="month">{language === 'tr' ? 'Bu Ay' : language === 'en' ? 'This Month' : 'ამ თვეში'}</option>
                <option value="custom">{language === 'tr' ? 'Özel' : language === 'en' ? 'Custom' : 'მორგებული'}</option>
              </select>
            </div>
            
            {timeRange === 'custom' && (
              <div className="flex flex-wrap sm:flex-nowrap space-y-2 sm:space-y-0 sm:space-x-2">
                <input 
                  type="date" 
                  className="bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-1 text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input 
                  type="date" 
                  className="bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-1 text-sm focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            )}
            
            <button 
              onClick={refreshStats}
              disabled={isLoadingStats}
              className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white rounded-md px-4 py-1 border border-gray-700 hover:border-yellow-500/30 transition-all duration-300"
            >
              {isLoadingStats ? (
                <Loader className="h-4 w-4 animate-spin mr-1" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-1" />
              )}
              <span>{t('admin.refresh')}</span>
            </button>
            
            <button 
              className="flex items-center justify-center bg-gray-800 hover:bg-gray-700 text-white rounded-md px-4 py-1 border border-gray-700 hover:border-yellow-500/30 transition-all duration-300"
            >
              <Download className="h-4 w-4" />
              <span>{t('admin.export')}</span>
            </button>
          </div>
        </div>

        {/* Ana Metrikler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Toplam Kullanıcılar */}
          <div className="bg-gray-800/80 rounded-xl shadow-lg p-5 border border-yellow-500/20 backdrop-blur-sm hover:border-yellow-500/30 transition-all duration-300">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">
                  {t('admin.total_users')}
                </p>
                <p className="text-2xl font-bold text-white">{siteStats.totalUsers.toLocaleString()}</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500 font-medium">
                    +{siteStats.newUsersToday} {t('admin.today')}
                  </span>
                </div>
              </div>
              <div className="bg-gray-900/80 border border-yellow-500/30 rounded-lg p-3 shadow-md">
                <Users className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-yellow-500/10">
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-gray-400 mb-1">{t('admin.active') || 'Aktif'}</p>
                  <p className="font-medium text-white">{siteStats.activeUsers.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">{t('admin.active_rate')}</p>
                  <p className="font-medium text-white">{Math.round((siteStats.activeUsers / siteStats.totalUsers) * 100)}%</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Toplam Para Yatırma */}
          <div className="bg-gray-800/80 rounded-xl shadow-lg p-5 border border-yellow-500/20 backdrop-blur-sm hover:border-yellow-500/30 transition-all duration-300">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{t('admin.total_deposits') || 'Toplam Para Yatırma'}</p>
                <p className="text-2xl font-bold text-white">{siteStats.totalDeposits.toLocaleString()}₺</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500 font-medium">+{siteStats.depositToday.toLocaleString()}₺ {t('admin.today')}</span>
                </div>
              </div>
              <div className="bg-gray-900/80 border border-yellow-500/30 rounded-lg p-3 shadow-md">
                <DollarSign className="h-6 w-6 text-green-500" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-yellow-500/10">
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-gray-400 mb-1">{t('admin.average_deposit') || 'Ortalama Yatırma'}</p>
                  <p className="font-medium text-white">{Math.round(siteStats.totalDeposits / (siteStats.totalUsers * 0.8)).toLocaleString()}₺</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">{t('admin.conversion_rate') || 'Dönüşüm Oranı'}</p>
                  <p className="font-medium text-white">79.3%</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Toplam Para Çekme */}
          <div className="bg-gray-800/80 rounded-xl shadow-lg p-5 border border-yellow-500/20 backdrop-blur-sm hover:border-yellow-500/30 transition-all duration-300">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{t('admin.total_withdrawals') || 'Toplam Para Çekme'}</p>
                <p className="text-2xl font-bold text-white">{siteStats.totalWithdrawals.toLocaleString()}₺</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-red-500 mr-1" />
                  <span className="text-xs text-red-500 font-medium">-{siteStats.withdrawalToday.toLocaleString()}₺ {t('admin.stats.today') || 'bugün'}</span>
                </div>
              </div>
              <div className="bg-gray-900/80 border border-yellow-500/30 rounded-lg p-3 shadow-md">
                <DollarSign className="h-6 w-6 text-red-500" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-yellow-500/10">
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-gray-400 mb-1">{t('admin.average_withdrawal') || 'Ortalama Çekim'}</p>
                  <p className="font-medium text-white">{Math.round(siteStats.totalWithdrawals / (siteStats.totalUsers * 0.65)).toLocaleString()}₺</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">{t('admin.withdrawal_rate') || 'Çekim Oranı'}</p>
                  <p className="font-medium text-white">65.4%</p>
                </div>
              </div>
            </div>
          </div>
          
          {/* Toplam GGR */}
          <div className="bg-gray-800/80 rounded-xl shadow-lg p-5 border border-yellow-500/20 backdrop-blur-sm hover:border-yellow-500/30 transition-all duration-300">
            <div className="flex justify-between">
              <div>
                <p className="text-gray-400 text-sm font-medium mb-1">{t('admin.total_ggr') || 'Toplam GGR'}</p>
                <p className="text-2xl font-bold text-white">{siteStats.totalGGR.toLocaleString()}₺</p>
                <div className="flex items-center mt-2">
                  <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                  <span className="text-xs text-green-500 font-medium">+{siteStats.ggrToday.toLocaleString()}₺ {t('admin.stats.today') || 'bugün'}</span>
                </div>
              </div>
              <div className="bg-gray-900/80 border border-yellow-500/30 rounded-lg p-3 shadow-md">
                <Target className="h-6 w-6 text-yellow-500" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-yellow-500/10">
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-gray-400 mb-1">{t('admin.margin') || 'Marj'}</p>
                  <p className="font-medium text-white">{(siteStats.totalGGR / siteStats.totalDeposits * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-gray-400 mb-1">{t('admin.win_rate') || 'Kazanma Oranı'}</p>
                  <p className="font-medium text-white">{siteStats.winRate}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Grafikler */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
          {/* GGR, Para Yatırma ve Çekim */}
          <div className="bg-gray-800/80 rounded-xl shadow-lg p-5 border border-yellow-500/20 backdrop-blur-sm hover:border-yellow-500/30 transition-all duration-300">
            <h2 className="text-xl font-bold text-white mb-4">
              {t('admin.financial_metrics') || 'Finansal Metrikler'}
            </h2>
            <PerformanceChart 
              data={ggrData} 
              title={t('admin.deposits_withdrawals_ggr') || 'Para Yatırma, Çekme ve GGR'} 
              type="area"
            />
          </div>
          
          {/* Oyun Kategorileri */}
          <div className="bg-gray-800/80 rounded-xl shadow-lg p-5 border border-yellow-500/20 backdrop-blur-sm hover:border-yellow-500/30 transition-all duration-300">
            <h2 className="text-xl font-bold text-white mb-4">
              {t('admin.game_categories') || 'Oyun Kategorileri'}
            </h2>
            <PieChartComponent 
              data={gameCategories} 
              dataKey="count"
              nameKey="category"
            />
          </div>
        </div>
        
        {/* Tablolar */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Para Yatırma Yöntemleri */}
          <div className="bg-gray-800 rounded-lg shadow-md p-5 border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-500" />
              {t('admin.deposit_methods') || 'Para Yatırma Yöntemleri'}
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-700 rounded-md overflow-hidden">
                <thead className="bg-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t('admin.method') || 'Yöntem'}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t('admin.amount') || 'Miktar'}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t('admin.percentage') || 'Yüzde'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {depositMethods.map((method, index) => (
                    <tr key={index} className="hover:bg-gray-650">
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-white">
                        {method.name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                        {method.depositAmount}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                        {method.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Para Çekme Yöntemleri */}
          <div className="bg-gray-800 rounded-lg shadow-md p-5 border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-red-500" />
              {t('admin.withdrawal_methods') || 'Para Çekme Yöntemleri'}
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-700 rounded-md overflow-hidden">
                <thead className="bg-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t('admin.method') || 'Yöntem'}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t('admin.amount') || 'Miktar'}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t('admin.percentage') || 'Yüzde'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {withdrawalMethods.map((method, index) => (
                    <tr key={index} className="hover:bg-gray-650">
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-white">
                        {method.name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                        {method.withdrawalAmount}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                        {method.percentage}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Popüler Oyunlar */}
          <div className="bg-gray-800 rounded-lg shadow-md p-5 border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <Gamepad className="h-5 w-5 mr-2 text-yellow-500" />
              {t('admin.popular_games') || 'Popüler Oyunlar'}
            </h3>
            
            <div className="overflow-x-auto">
              <table className="min-w-full bg-gray-700 rounded-md overflow-hidden">
                <thead className="bg-gray-600">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t('admin.game') || 'Oyun'}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t('admin.provider') || 'Sağlayıcı'}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t('admin.category') || 'Kategori'}
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                      {t('admin.plays') || 'Oynama'}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {popularGames.map((game, index) => (
                    <tr key={index} className="hover:bg-gray-650">
                      <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-white">
                        {game.name}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                        {game.provider}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                        {game.category}
                      </td>
                      <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-300">
                        {game.plays.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Sistem Durumu */}
          <div className="bg-gray-800 rounded-lg shadow-md p-5 border border-gray-700">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center">
              <Activity className="h-5 w-5 mr-2 text-blue-500" />
              {t('admin.system_status') || 'Sistem Durumu'}
            </h3>
            
            <div className="flex items-center justify-between mb-5 bg-gray-700 p-3 rounded-lg">
              <div className="flex items-center">
                {getSystemHealthIcon(siteStats.systemHealth)}
                <span className={`ml-2 font-medium ${getSystemHealthColor(siteStats.systemHealth)}`}>
                  {language === 'tr' ? 'Sistem Sağlığı:' : 
                   language === 'en' ? 'System Health:' : 
                   'სისტემის ჯანმრთელობა:'}
                  <span className="ml-1">
                    {language === 'tr' ? 
                      (siteStats.systemHealth === 'excellent' ? 'Mükemmel' : 
                       siteStats.systemHealth === 'good' ? 'İyi' : 
                       siteStats.systemHealth === 'fair' ? 'Orta' : 'Kötü') : 
                     language === 'en' ? 
                      (siteStats.systemHealth === 'excellent' ? 'Excellent' : 
                       siteStats.systemHealth === 'good' ? 'Good' : 
                       siteStats.systemHealth === 'fair' ? 'Fair' : 'Poor') : 
                      (siteStats.systemHealth === 'excellent' ? 'შესანიშნავი' : 
                       siteStats.systemHealth === 'good' ? 'კარგი' : 
                       siteStats.systemHealth === 'fair' ? 'საშუალო' : 'ცუდი')}
                  </span>
                </span>
              </div>
              <div className="text-sm text-gray-400">
                {language === 'tr' ? 'Son kontrol: 5 dk önce' : 
                 language === 'en' ? 'Last check: 5 mins ago' : 
                 'ბოლო შემოწმება: 5 წთ წინ'}
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="ml-2 text-white text-sm">
                    {translate('admin.serverStatus', 'Sunucu Durumu')}
                  </span>
                </div>
                <span className="text-green-500 text-sm font-medium">
                  {language === 'tr' ? 'Çalışıyor' : 
                   language === 'en' ? 'Operational' : 
                   'მუშაობს'}
                </span>
              </div>
              
              <div className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="ml-2 text-white text-sm">
                    {translate('admin.databaseConnection', 'Veritabanı Bağlantısı')}
                  </span>
                </div>
                <span className="text-green-500 text-sm font-medium">
                  {translate('admin.operational', 'Çalışıyor')}
                </span>
              </div>
              
              <div className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="ml-2 text-white text-sm">
                    {language === 'tr' ? 'API Hizmetleri' : 
                     language === 'en' ? 'API Services' : 
                     'API სერვისები'}
                  </span>
                </div>
                <span className="text-green-500 text-sm font-medium">
                  {language === 'tr' ? 'Erişilebilir' : 
                   language === 'en' ? 'Accessible' : 
                   'ხელმისაწვდომი'}
                </span>
              </div>
              
              <div className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="ml-2 text-white text-sm">
                    {language === 'tr' ? 'Ödeme Sistemleri' : 
                     language === 'en' ? 'Payment Systems' : 
                     'გადახდის სისტემები'}
                  </span>
                </div>
                <span className="text-green-500 text-sm font-medium">
                  {language === 'tr' ? 'Çalışıyor' : 
                   language === 'en' ? 'Operational' : 
                   'მუშაობს'}
                </span>
              </div>
              
              <div className="bg-gray-700 p-3 rounded-lg flex justify-between items-center">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="ml-2 text-white text-sm">
                    {language === 'tr' ? 'Oyun Sağlayıcıları' : 
                     language === 'en' ? 'Game Providers' : 
                     'თამაშის პროვაიდერები'}
                  </span>
                </div>
                <span className="text-green-500 text-sm font-medium">
                  {language === 'tr' ? 'Çevrimiçi' : 
                   language === 'en' ? 'Online' : 
                   'ონლაინ'}
                </span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Sistem Performans Bölümü */}
        <div className="mt-8 mb-6">
          <div className="bg-gray-800/80 rounded-xl shadow-lg p-5 border border-yellow-500/20 backdrop-blur-sm hover:border-yellow-500/30 transition-all duration-300">
            {/* Sistem Performans Başlığı */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">
                <Database className="h-5 w-5 mr-2 text-yellow-500 inline" />
                {t('admin.system_performance') || 'Sistem Performansı'}
              </h2>
              
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-400">{t('admin.auto_refresh') || 'Otomatik Yenileme'}</span>
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
            
            {/* Sistem Performans İçeriği */}
            <SystemPerformance />
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Stats;