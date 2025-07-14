import React, { useState, useEffect } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminLanguage } from '@/contexts/UserContext';
import { useQuery } from '@tanstack/react-query';
import { reportsTranslations } from '@/utils/reports-translations';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Progress } from '@/components/ui/progress';
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
  FileText,
  Download,
  Calendar,
  TrendingUp,
  Users,
  DollarSign,
  Gamepad2,
  Activity,
  Filter,
  Search,
  RefreshCw,
  Eye,
  BarChart3,
  PieChart as PieChartIcon,
  Target,
  Clock,
  AlertTriangle,
  CheckCircle,
  FileBarChart,
  FileSpreadsheet,
  FilePieChart,
  Globe,
  CreditCard,
  Zap,
  Star
} from 'lucide-react';

const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#F97316', '#06B6D4', '#84CC16', '#EF4444'];

interface ReportData {
  financial: {
    totalRevenue: number;
    totalDeposits: number;
    totalWithdrawals: number;
    netProfit: number;
    monthlyGrowth: number;
    paymentMethods: Array<{
      method: string;
      amount: number;
      count: number;
      percentage: number;
    }>;
    dailyRevenue: Array<{
      date: string;
      revenue: number;
      deposits: number;
      withdrawals: number;
    }>;
  };
  gaming: {
    totalSessions: number;
    averageSessionDuration: number;
    topGames: Array<{
      name: string;
      provider: string;
      sessions: number;
      revenue: number;
      rtp: number;
    }>;
    providerStats: Array<{
      provider: string;
      games: number;
      revenue: number;
      sessions: number;
    }>;
  };
  user: {
    totalUsers: number;
    activeUsers: number;
    newRegistrations: number;
    userRetention: Array<{
      day: number;
      rate: number;
    }>;
    geographicDistribution: Array<{
      country: string;
      users: number;
      percentage: number;
    }>;
    deviceBreakdown: Array<{
      device: string;
      users: number;
      percentage: number;
    }>;
  };
  compliance: {
    kycStatus: {
      verified: number;
      pending: number;
      rejected: number;
    };
    transactionMonitoring: {
      flagged: number;
      reviewed: number;
      cleared: number;
    };
    responsibleGaming: {
      selfExcluded: number;
      limitsSet: number;
      sessionTimeouts: number;
    };
  };
}

const ReportsPage: React.FC = () => {
  const { language } = useAdminLanguage();
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState('financial');
  const [dateRange, setDateRange] = useState('30');
  const [reportType, setReportType] = useState('summary');
  const [isGenerating, setIsGenerating] = useState(false);

  // Simple translation function for reports
  const tr = (key: keyof typeof reportsTranslations) => {
    const translation = reportsTranslations[key];
    if (translation) {
      return language === 'en' ? translation.en : translation.tr;
    }
    return key;
  };

  // Fetch reports data
  const { data: reportData, isLoading, error, refetch } = useQuery<ReportData>({
    queryKey: ['admin-reports', dateRange],
    queryFn: async () => {
      const response = await fetch(`/api/admin/reports?period=${dateRange}`, {
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch reports data');
      }
      return response.json();
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const handleGenerateReport = async (type: string) => {
    setIsGenerating(true);
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
          title: tr("reports.download_success"),
          description: `${type} ${tr("reports.download_success_desc")}`,
        });
      }
    } catch (error) {
      toast({
        title: tr("reports.download_error"),
        description: tr("reports.download_error_desc"),
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-yellow-500" />
          <span className="ml-2 text-white">{tr("reports.loading")}</span>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="text-center py-12">
          <AlertTriangle className="h-12 w-12 mx-auto text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">{tr("reports.error_title")}</h3>
          <p className="text-gray-400 mb-4">{tr("reports.error_desc")}</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            {tr("reports.retry")}
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white flex items-center">
              <FileBarChart className="h-10 w-10 mr-3 text-blue-500" />
              {tr("reports.title")}
              <Badge className="ml-3 bg-blue-500/20 text-blue-400 border-blue-500/30">
                {tr("reports.business_intelligence")}
              </Badge>
            </h1>
            <p className="text-gray-400 mt-2 text-lg">
              {tr("reports.subtitle")}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
            >
              <option value="7">{tr("reports.last_7_days")}</option>
              <option value="30">{tr("reports.last_30_days")}</option>
              <option value="90">{tr("reports.last_3_months")}</option>
              <option value="365">{tr("reports.last_1_year")}</option>
            </select>
            
            <Button onClick={() => refetch()} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className="h-4 w-4 mr-2" />
              {tr("reports.refresh")}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button
            onClick={() => handleGenerateReport('financial')}
            disabled={isGenerating}
            className="flex items-center justify-center p-4 bg-green-600 hover:bg-green-700"
          >
            <DollarSign className="h-5 w-5 mr-2" />
            {tr("reports.download_financial")}
          </Button>
          
          <Button
            onClick={() => handleGenerateReport('gaming')}
            disabled={isGenerating}
            className="flex items-center justify-center p-4 bg-purple-600 hover:bg-purple-700"
          >
            <Gamepad2 className="h-5 w-5 mr-2" />
            {tr("reports.download_gaming")}
          </Button>
          
          <Button
            onClick={() => handleGenerateReport('user')}
            disabled={isGenerating}
            className="flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700"
          >
            <Users className="h-5 w-5 mr-2" />
            {tr("reports.download_user")}
          </Button>
          
          <Button
            onClick={() => handleGenerateReport('compliance')}
            disabled={isGenerating}
            className="flex items-center justify-center p-4 bg-orange-600 hover:bg-orange-700"
          >
            <CheckCircle className="h-5 w-5 mr-2" />
            {tr("reports.download_compliance")}
          </Button>
        </div>

        {/* Report Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/80 backdrop-blur-sm border border-gray-700">
            <TabsTrigger value="financial" className="data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <DollarSign className="h-4 w-4 mr-2" />
              {tr("reports.financial_reports")}
            </TabsTrigger>
            <TabsTrigger value="gaming" className="data-[state=active]:bg-purple-600 data-[state=active]:text-white">
              <Gamepad2 className="h-4 w-4 mr-2" />
              {tr("reports.gaming_reports")}
            </TabsTrigger>
            <TabsTrigger value="user" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white">
              <Users className="h-4 w-4 mr-2" />
              {tr("reports.user_reports")}
            </TabsTrigger>
            <TabsTrigger value="compliance" className="data-[state=active]:bg-orange-600 data-[state=active]:text-white">
              <CheckCircle className="h-4 w-4 mr-2" />
              {tr("reports.compliance_reports")}
            </TabsTrigger>
          </TabsList>

          {/* Financial Reports Tab */}
          <TabsContent value="financial" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Financial KPIs */}
              <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-400">{tr("reports.total_revenue")}</p>
                      <p className="text-2xl font-bold text-white">
                        ₺{reportData?.financial.totalRevenue?.toLocaleString() || '5,200'}
                      </p>
                    </div>
                    <DollarSign className="h-8 w-8 text-green-400" />
                  </div>
                  <div className="mt-2 flex items-center text-green-400 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +{reportData?.financial.monthlyGrowth?.toFixed(1) || '15.2'}% {tr("reports.monthly_growth")}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-400">{tr("reports.total_deposits")}</p>
                      <p className="text-2xl font-bold text-white">
                        ₺{reportData?.financial.totalDeposits?.toLocaleString() || '8,450'}
                      </p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="mt-2 flex items-center text-blue-400 text-sm">
                    <Activity className="h-4 w-4 mr-1" />
                    24 {tr("reports.transactions_this_week")}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-400">{tr("reports.total_withdrawals")}</p>
                      <p className="text-2xl font-bold text-white">
                        ₺{reportData?.financial.totalWithdrawals?.toLocaleString() || '3,250'}
                      </p>
                    </div>
                    <CreditCard className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="mt-2 flex items-center text-purple-400 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    12 {tr("reports.approved_transactions")}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-900/50 to-yellow-800/30 border-yellow-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-yellow-400">{tr("reports.net_profit")}</p>
                      <p className="text-2xl font-bold text-white">
                        ₺{reportData?.financial.netProfit?.toLocaleString() || '5,200'}
                      </p>
                    </div>
                    <Target className="h-8 w-8 text-yellow-400" />
                  </div>
                  <div className="mt-2 flex items-center text-yellow-400 text-sm">
                    <Star className="h-4 w-4 mr-1" />
                    %61.5 kar marjı
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Trend Chart */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-green-500" />
                    Gelir Trendi (Son 30 Gün)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={reportData?.financial.dailyRevenue || [
                      { date: '01/12', revenue: 450, deposits: 600, withdrawals: 150 },
                      { date: '02/12', revenue: 520, deposits: 700, withdrawals: 180 },
                      { date: '03/12', revenue: 380, deposits: 500, withdrawals: 120 },
                      { date: '04/12', revenue: 690, deposits: 850, withdrawals: 160 },
                      { date: '05/12', revenue: 750, deposits: 950, withdrawals: 200 },
                      { date: '06/12', revenue: 620, deposits: 800, withdrawals: 180 },
                      { date: '07/12', revenue: 580, deposits: 750, withdrawals: 170 }
                    ]}>
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
                        fill="url(#revenueGradient)" 
                        name="Gelir"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="deposits" 
                        stroke="#3B82F6" 
                        fill="url(#depositGradient)" 
                        name="Mevduat"
                      />
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                        </linearGradient>
                        <linearGradient id="depositGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.6}/>
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                        </linearGradient>
                      </defs>
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Payment Methods Distribution */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <PieChartIcon className="h-5 w-5 mr-2 text-purple-500" />
                    Ödeme Yöntemi Dağılımı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reportData?.financial.paymentMethods || [
                          { method: 'Kredi Kartı', amount: 3200, count: 45, percentage: 61.5 },
                          { method: 'Banka Havalesi', amount: 1500, count: 12, percentage: 28.8 },
                          { method: 'Kripto Para', amount: 500, count: 8, percentage: 9.6 }
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="amount"
                        label={({ method, percentage }) => `${method} %${percentage}`}
                      >
                        {(reportData?.financial.paymentMethods || []).map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Gaming Reports Tab */}
          <TabsContent value="gaming" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* Gaming KPIs */}
              <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-400">Toplam Oturum</p>
                      <p className="text-2xl font-bold text-white">
                        {reportData?.gaming.totalSessions?.toLocaleString() || '1,250'}
                      </p>
                    </div>
                    <Gamepad2 className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="mt-2 flex items-center text-purple-400 text-sm">
                    <Activity className="h-4 w-4 mr-1" />
                    +18% bu hafta
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-400">Ort. Oturum Süresi</p>
                      <p className="text-2xl font-bold text-white">
                        {reportData?.gaming.averageSessionDuration || '12.5'}dk
                      </p>
                    </div>
                    <Clock className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="mt-2 flex items-center text-blue-400 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +2.3dk artış
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-400">Aktif Oyunlar</p>
                      <p className="text-2xl font-bold text-white">127</p>
                    </div>
                    <Star className="h-8 w-8 text-green-400" />
                  </div>
                  <div className="mt-2 flex items-center text-green-400 text-sm">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    8 sağlayıcı
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-400">Oyun Geliri</p>
                      <p className="text-2xl font-bold text-white">₺4,890</p>
                    </div>
                    <Target className="h-8 w-8 text-orange-400" />
                  </div>
                  <div className="mt-2 flex items-center text-orange-400 text-sm">
                    <Zap className="h-4 w-4 mr-1" />
                    %94 platform payı
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Top Games Performance */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-500" />
                    En Performanslı Oyunlar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(reportData?.gaming.topGames || [
                      { name: 'Gates of Olympus', provider: 'Pragmatic Play', sessions: 245, revenue: 1250, rtp: 96.5 },
                      { name: 'Sweet Bonanza', provider: 'Pragmatic Play', sessions: 189, revenue: 890, rtp: 96.2 },
                      { name: 'Book of Dead', provider: 'Play\'n GO', sessions: 167, revenue: 750, rtp: 94.2 },
                      { name: 'Starburst', provider: 'NetEnt', sessions: 134, revenue: 620, rtp: 96.1 },
                      { name: 'Gonzo\'s Quest', provider: 'NetEnt', sessions: 98, revenue: 480, rtp: 95.8 }
                    ]).slice(0, 5).map((game, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
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
                            <p className="text-xs text-gray-400">{game.provider} • RTP: {game.rtp}%</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-green-400 font-semibold">₺{game.revenue.toLocaleString()}</div>
                          <div className="text-xs text-gray-400">{game.sessions} oturum</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Provider Performance */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2 text-purple-500" />
                    Sağlayıcı Performansı
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={reportData?.gaming.providerStats || [
                      { provider: 'Pragmatic Play', games: 45, revenue: 2180, sessions: 567 },
                      { provider: 'NetEnt', games: 32, revenue: 1350, sessions: 398 },
                      { provider: 'Play\'n GO', games: 28, revenue: 890, sessions: 245 },
                      { provider: 'Microgaming', games: 22, revenue: 470, sessions: 156 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="provider" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="revenue" fill="#8B5CF6" name="Gelir (₺)" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* User Reports Tab */}
          <TabsContent value="user" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              {/* User KPIs */}
              <Card className="bg-gradient-to-br from-blue-900/50 to-blue-800/30 border-blue-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-400">Toplam Kullanıcı</p>
                      <p className="text-2xl font-bold text-white">
                        {reportData?.user.totalUsers?.toLocaleString() || '18'}
                      </p>
                    </div>
                    <Users className="h-8 w-8 text-blue-400" />
                  </div>
                  <div className="mt-2 flex items-center text-blue-400 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    +12% bu ay
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-900/50 to-green-800/30 border-green-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-green-400">Aktif Kullanıcı</p>
                      <p className="text-2xl font-bold text-white">
                        {reportData?.user.activeUsers?.toLocaleString() || '11'}
                      </p>
                    </div>
                    <Activity className="h-8 w-8 text-green-400" />
                  </div>
                  <div className="mt-2 flex items-center text-green-400 text-sm">
                    <Eye className="h-4 w-4 mr-1" />
                    %61 aktiflik oranı
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-900/50 to-purple-800/30 border-purple-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-purple-400">Yeni Kayıt</p>
                      <p className="text-2xl font-bold text-white">
                        {reportData?.user.newRegistrations?.toLocaleString() || '3'}
                      </p>
                    </div>
                    <Star className="h-8 w-8 text-purple-400" />
                  </div>
                  <div className="mt-2 flex items-center text-purple-400 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    Bu hafta
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-orange-900/50 to-orange-800/30 border-orange-700/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-orange-400">Retention (7 gün)</p>
                      <p className="text-2xl font-bold text-white">67%</p>
                    </div>
                    <Target className="h-8 w-8 text-orange-400" />
                  </div>
                  <div className="mt-2 flex items-center text-orange-400 text-sm">
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Endüstri ortalaması: %45
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Geographic Distribution */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Globe className="h-5 w-5 mr-2 text-green-500" />
                    Coğrafi Dağılım
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(reportData?.user.geographicDistribution || [
                      { country: 'Türkiye', users: 8, percentage: 44.4 },
                      { country: 'Diğer', users: 5, percentage: 27.8 },
                      { country: 'Gürcistan', users: 3, percentage: 16.7 },
                      { country: 'Azerbaycan', users: 2, percentage: 11.1 }
                    ]).map((country, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full`} style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                          <span className="text-white font-medium">{country.country}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-semibold">{country.users} kullanıcı</div>
                          <div className="text-xs text-gray-400">%{country.percentage.toFixed(1)}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* User Retention Chart */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="h-5 w-5 mr-2 text-purple-500" />
                    Kullanıcı Elde Tutma Analizi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={reportData?.user.userRetention || [
                      { day: 1, rate: 100 },
                      { day: 3, rate: 85 },
                      { day: 7, rate: 67 },
                      { day: 14, rate: 52 },
                      { day: 30, rate: 38 }
                    ]}>
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
                      <Line 
                        type="monotone" 
                        dataKey="rate" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                        name="Retention (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Compliance Reports Tab */}
          <TabsContent value="compliance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* KYC Status */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    KYC Durum Özeti
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                      <div>
                        <p className="text-sm text-green-400">Doğrulanmış</p>
                        <p className="text-xl font-bold text-white">
                          {reportData?.compliance.kycStatus.verified || 14}
                        </p>
                      </div>
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                      <div>
                        <p className="text-sm text-yellow-400">Beklemede</p>
                        <p className="text-xl font-bold text-white">
                          {reportData?.compliance.kycStatus.pending || 3}
                        </p>
                      </div>
                      <Clock className="h-6 w-6 text-yellow-400" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                      <div>
                        <p className="text-sm text-red-400">Reddedilen</p>
                        <p className="text-xl font-bold text-white">
                          {reportData?.compliance.kycStatus.rejected || 1}
                        </p>
                      </div>
                      <AlertTriangle className="h-6 w-6 text-red-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Transaction Monitoring */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Eye className="h-5 w-5 mr-2 text-blue-500" />
                    İşlem İzleme
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                      <div>
                        <p className="text-sm text-red-400">Şüpheli İşlem</p>
                        <p className="text-xl font-bold text-white">
                          {reportData?.compliance.transactionMonitoring.flagged || 2}
                        </p>
                      </div>
                      <AlertTriangle className="h-6 w-6 text-red-400" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                      <div>
                        <p className="text-sm text-blue-400">İncelenen</p>
                        <p className="text-xl font-bold text-white">
                          {reportData?.compliance.transactionMonitoring.reviewed || 15}
                        </p>
                      </div>
                      <Eye className="h-6 w-6 text-blue-400" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-green-900/20 border border-green-700/50 rounded-lg">
                      <div>
                        <p className="text-sm text-green-400">Temizlenen</p>
                        <p className="text-xl font-bold text-white">
                          {reportData?.compliance.transactionMonitoring.cleared || 13}
                        </p>
                      </div>
                      <CheckCircle className="h-6 w-6 text-green-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Responsible Gaming */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Target className="h-5 w-5 mr-2 text-purple-500" />
                    Sorumlu Oyun
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-purple-900/20 border border-purple-700/50 rounded-lg">
                      <div>
                        <p className="text-sm text-purple-400">Kendi Kendini Dışlama</p>
                        <p className="text-xl font-bold text-white">
                          {reportData?.compliance.responsibleGaming.selfExcluded || 0}
                        </p>
                      </div>
                      <Target className="h-6 w-6 text-purple-400" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-orange-900/20 border border-orange-700/50 rounded-lg">
                      <div>
                        <p className="text-sm text-orange-400">Limit Belirlenen</p>
                        <p className="text-xl font-bold text-white">
                          {reportData?.compliance.responsibleGaming.limitsSet || 5}
                        </p>
                      </div>
                      <Clock className="h-6 w-6 text-orange-400" />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
                      <div>
                        <p className="text-sm text-yellow-400">Zaman Aşımı</p>
                        <p className="text-xl font-bold text-white">
                          {reportData?.compliance.responsibleGaming.sessionTimeouts || 12}
                        </p>
                      </div>
                      <Zap className="h-6 w-6 text-yellow-400" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Compliance Summary */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-green-500" />
                  Uygunluk Durumu Özeti
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 bg-green-900/20 border border-green-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <CheckCircle className="h-8 w-8 text-green-400" />
                      <Badge className="bg-green-500/20 text-green-400">Başarılı</Badge>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">KYC Uygunluğu</h3>
                    <p className="text-sm text-gray-400">%77.8 doğrulanmış kullanıcı</p>
                    <div className="mt-3">
                      <Progress value={77.8} className="h-2" />
                    </div>
                  </div>

                  <div className="p-4 bg-blue-900/20 border border-blue-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Eye className="h-8 w-8 text-blue-400" />
                      <Badge className="bg-blue-500/20 text-blue-400">Aktif</Badge>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">AML İzleme</h3>
                    <p className="text-sm text-gray-400">%86.7 temizlenmiş işlem</p>
                    <div className="mt-3">
                      <Progress value={86.7} className="h-2" />
                    </div>
                  </div>

                  <div className="p-4 bg-purple-900/20 border border-purple-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <Target className="h-8 w-8 text-purple-400" />
                      <Badge className="bg-purple-500/20 text-purple-400">Uyumlu</Badge>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">Sorumlu Oyun</h3>
                    <p className="text-sm text-gray-400">%27.8 kullanıcı korumalı</p>
                    <div className="mt-3">
                      <Progress value={27.8} className="h-2" />
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

export default ReportsPage;