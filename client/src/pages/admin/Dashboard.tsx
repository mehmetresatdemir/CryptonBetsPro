import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import AdminLayout from '../../components/admin/AdminLayout';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);
  
  console.log('📊 Current Dashboard Stats State:', stats);

  const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444'];

  // Sample data for charts
  const revenueData = [
    { month: 'Ocak', revenue: 125000 },
    { month: 'Şubat', revenue: 145000 },
    { month: 'Mart', revenue: 165000 },
    { month: 'Nisan', revenue: 195000 },
    { month: 'Mayıs', revenue: 225000 },
    { month: 'Haziran', revenue: 275000 },
  ];

  const userDistribution = [
    { name: 'Aktif', value: 850 },
    { name: 'Pasif', value: 300 },
    { name: 'Askıda', value: 100 },
  ];

  const popularGames = [
    { name: 'Sweet Bonanza', plays: 8420 },
    { name: 'Gates of Olympus', plays: 7651 },
    { name: 'Book of Dead', plays: 6890 },
    { name: 'Big Bass Bonanza', plays: 5432 },
    { name: 'Wolf Gold', plays: 4876 },
  ];

  const recentTransactions = [
    { user: 'Ahmet Y.', type: 'deposit', amount: 1500, time: '2 dakika önce' },
    { user: 'Mehmet K.', type: 'withdraw', amount: 750, time: '5 dakika önce' },
    { user: 'Ayşe D.', type: 'deposit', amount: 2000, time: '8 dakika önce' },
    { user: 'Fatma S.', type: 'withdraw', amount: 500, time: '12 dakika önce' },
    { user: 'Ali R.', type: 'deposit', amount: 1200, time: '15 dakika önce' },
  ];

  // Real-time data fetching with instant updates
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('adminToken') || 'admin-token';
      const response = await fetch('/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        console.log('📊 Dashboard verisi alındı:', {
          users: data.users?.total,
          deposits: data.financial?.totalDeposits,
          vip: data.users?.vip
        });
        setStats(data);
        console.log('📊 Anlık veriler güncellendi:', new Date().toLocaleTimeString());
      } else {
        console.error('❌ API response error:', response.status);
      }
    } catch (error) {
      console.error('❌ Stats fetch error:', error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchStats().finally(() => setIsLoading(false));
    
    // Instant refresh every 2 seconds for real-time dashboard
    const interval = setInterval(fetchStats, 2000);
    
    // WebSocket disabled for Dashboard - using HTTP polling only for now
    // This prevents multiple conflicting WebSocket connections
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0A0A] via-[#0F0F0F] to-[#1A1A1A] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500 mx-auto mb-4"></div>
          <p>Dashboard yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="text-white">
        <div className="max-w-7xl mx-auto p-6">
        {/* Modern Header with Glass Effect */}
        <div className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 blur-3xl rounded-3xl"></div>
          <div className="relative bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-500 to-orange-500 bg-clip-text text-transparent mb-2">
                  Admin Dashboard
                </h1>
                <p className="text-gray-300 text-lg">CryptonBets Yönetim Paneli - Gerçek Zamanlı İstatistikler</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="bg-green-500/20 border border-green-500/30 rounded-xl px-4 py-2 flex items-center">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">Sistem Aktif</span>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-400">Son Güncelleme</div>
                  <div className="text-white font-medium flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                    {new Date().toLocaleTimeString('tr-TR')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Colorful Stats Cards - Site Konseptine Uygun */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Kullanıcılar Kartı - Mavi Tema */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-400 opacity-90 rounded-2xl shadow-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            <div className="relative p-6 rounded-2xl border border-blue-400/30 backdrop-blur-sm transform group-hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <i className="fas fa-users text-white text-2xl"></i>
                </div>
                <div className="text-right">
                  <div className="text-white/80 text-xs font-medium uppercase tracking-wide">Bu Ay</div>
                  <div className="text-white font-bold text-sm">+12%</div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-semibold text-sm opacity-90">Toplam Kullanıcı</h3>
                <div className="text-3xl font-bold text-white">{stats?.users?.total ? stats.users.total.toLocaleString() : '0'}</div>
                <div className="text-xs text-gray-400 opacity-70">Debug: {stats?.users?.total || 'veri yok'}</div>
                <div className="flex items-center text-xs text-white/70">
                  <i className="fas fa-arrow-up text-green-300 mr-1"></i>
                  <span>Aktif: {stats?.users?.active ? stats.users.active.toLocaleString() : '0'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Oyunlar Kartı - Mor Tema */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-violet-500 to-pink-400 opacity-90 rounded-2xl shadow-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            <div className="relative p-6 rounded-2xl border border-purple-400/30 backdrop-blur-sm transform group-hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <i className="fas fa-gamepad text-white text-2xl"></i>
                </div>
                <div className="text-right">
                  <div className="text-white/80 text-xs font-medium uppercase tracking-wide">Online</div>
                  <div className="text-white font-bold text-sm">22,817</div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-semibold text-sm opacity-90">Toplam Oyun</h3>
                <div className="text-3xl font-bold text-white">{stats?.games?.totalGames ? stats.games.totalGames.toLocaleString() : '0'}</div>
                <div className="flex items-center text-xs text-white/70">
                  <i className="fas fa-play text-green-300 mr-1"></i>
                  <span>Aktif Oyunlar</span>
                </div>
              </div>
            </div>
          </div>

          {/* Yatırım Kartı - Yeşil Tema */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-500 to-teal-400 opacity-90 rounded-2xl shadow-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            <div className="relative p-6 rounded-2xl border border-green-400/30 backdrop-blur-sm transform group-hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <i className="fas fa-arrow-trend-up text-white text-2xl"></i>
                </div>
                <div className="text-right">
                  <div className="text-white/80 text-xs font-medium uppercase tracking-wide">Bu Hafta</div>
                  <div className="text-white font-bold text-sm">+8.5%</div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-semibold text-sm opacity-90">Toplam Yatırım</h3>
                <div className="text-3xl font-bold text-white">₺{stats?.financial?.totalDeposits ? stats.financial.totalDeposits.toLocaleString() : '0'}</div>
                <div className="text-xs text-gray-400 opacity-70">Debug: {stats?.financial?.totalDeposits || 'veri yok'}</div>
                <div className="flex items-center text-xs text-white/70">
                  <i className="fas fa-coins text-yellow-300 mr-1"></i>
                  <span>Ortalama: ₺{stats?.financial?.avgDepositAmount ? stats.financial.avgDepositAmount.toLocaleString() : '0'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Kar Kartı - Altın/Turuncu Tema */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-yellow-500 via-orange-500 to-red-400 opacity-90 rounded-2xl shadow-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            <div className="relative p-6 rounded-2xl border border-yellow-400/30 backdrop-blur-sm transform group-hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <i className="fas fa-chart-line text-white text-2xl"></i>
                </div>
                <div className="text-right">
                  <div className="text-white/80 text-xs font-medium uppercase tracking-wide">Artış</div>
                  <div className="text-white font-bold text-sm">+15.2%</div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-semibold text-sm opacity-90">Net Kar</h3>
                <div className="text-3xl font-bold text-white">₺{stats?.financial?.netProfit ? stats.financial.netProfit.toLocaleString() : '0'}</div>
                <div className="flex items-center text-xs text-white/70">
                  <i className="fas fa-percentage text-green-300 mr-1"></i>
                  <span>Kar Marjı: %{((stats?.financial?.netProfit / stats?.financial?.totalDeposits) * 100)?.toFixed(1) || '0'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Ek İstatistik Kartları - İkinci Sıra */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* VIP Kullanıcılar - Platin Tema */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-600 via-slate-500 to-zinc-400 opacity-90 rounded-2xl shadow-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            <div className="relative p-6 rounded-2xl border border-gray-400/30 backdrop-blur-sm transform group-hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <i className="fas fa-crown text-white text-2xl"></i>
                </div>
                <div className="text-right">
                  <div className="text-white/80 text-xs font-medium uppercase tracking-wide">VIP</div>
                  <div className="text-white font-bold text-sm">Elite</div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-semibold text-sm opacity-90">VIP Üyeler</h3>
                <div className="text-3xl font-bold text-white">{stats?.users?.vip ? stats.users.vip.toLocaleString() : '0'}</div>
                <div className="flex items-center text-xs text-white/70">
                  <i className="fas fa-star text-yellow-300 mr-1"></i>
                  <span>Premium Seviye</span>
                </div>
              </div>
            </div>
          </div>

          {/* Bahisler - Kırmızı Tema */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-rose-500 to-pink-400 opacity-90 rounded-2xl shadow-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            <div className="relative p-6 rounded-2xl border border-red-400/30 backdrop-blur-sm transform group-hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <i className="fas fa-dice text-white text-2xl"></i>
                </div>
                <div className="text-right">
                  <div className="text-white/80 text-xs font-medium uppercase tracking-wide">Günlük</div>
                  <div className="text-white font-bold text-sm">+2.4K</div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-semibold text-sm opacity-90">Toplam Bahis</h3>
                <div className="text-3xl font-bold text-white">{stats?.games?.totalBets ? stats.games.totalBets.toLocaleString() : '0'}</div>
                <div className="flex items-center text-xs text-white/70">
                  <i className="fas fa-fire text-orange-300 mr-1"></i>
                  <span>Aktif Bahisler</span>
                </div>
              </div>
            </div>
          </div>

          {/* Çekimler - İndigo Tema */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-blue-500 to-cyan-400 opacity-90 rounded-2xl shadow-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            <div className="relative p-6 rounded-2xl border border-indigo-400/30 backdrop-blur-sm transform group-hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <i className="fas fa-arrow-down text-white text-2xl"></i>
                </div>
                <div className="text-right">
                  <div className="text-white/80 text-xs font-medium uppercase tracking-wide">Bekleyen</div>
                  <div className="text-white font-bold text-sm">{stats?.financial?.pendingWithdrawals || 0}</div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-semibold text-sm opacity-90">Çekimler</h3>
                <div className="text-3xl font-bold text-white">₺{stats?.financial?.totalWithdrawals ? stats.financial.totalWithdrawals.toLocaleString() : '0'}</div>
                <div className="flex items-center text-xs text-white/70">
                  <i className="fas fa-clock text-yellow-300 mr-1"></i>
                  <span>İşlem Süresi: 2dk</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sistem Durumu - Emerald Tema */}
          <div className="group relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-500 to-cyan-400 opacity-90 rounded-2xl shadow-2xl"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-2xl"></div>
            <div className="relative p-6 rounded-2xl border border-emerald-400/30 backdrop-blur-sm transform group-hover:scale-105 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                  <i className="fas fa-server text-white text-2xl"></i>
                </div>
                <div className="text-right">
                  <div className="text-white/80 text-xs font-medium uppercase tracking-wide">Online</div>
                  <div className="text-white font-bold text-sm flex items-center">
                    <div className="w-2 h-2 bg-green-300 rounded-full mr-1 animate-pulse"></div>
                    99.9%
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-white font-semibold text-sm opacity-90">Sistem Sağlığı</h3>
                <div className="text-3xl font-bold text-white">Mükemmel</div>
                <div className="flex items-center text-xs text-white/70">
                  <i className="fas fa-shield-alt text-green-300 mr-1"></i>
                  <span>Tüm Sistemler Aktif</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Tabs with Glass Effect */}
        <div className="mb-8">
          <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl p-2">
            <div className="flex space-x-2">
              {[
                { key: 'overview', label: 'Genel Bakış', icon: 'fas fa-tachometer-alt' },
                { key: 'users', label: 'Kullanıcılar', icon: 'fas fa-users' },
                { key: 'finance', label: 'Finans', icon: 'fas fa-chart-pie' },
                { key: 'analytics', label: 'Analitik', icon: 'fas fa-chart-bar' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-6 py-3 text-sm font-medium rounded-xl transition-all duration-300 ${
                    activeTab === tab.key
                      ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-black shadow-lg shadow-yellow-500/25'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <i className={tab.icon}></i>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Modern Revenue Chart */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 blur-xl rounded-2xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-black/30 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Gelir Analizi</h3>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <span className="text-sm text-gray-300">Son 6 Ay</span>
                    </div>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueData}>
                        <defs>
                          <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#F59E0B" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                        <XAxis dataKey="month" stroke="#9CA3AF" fontSize={12} />
                        <YAxis stroke="#9CA3AF" fontSize={12} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(0, 0, 0, 0.8)', 
                            border: '1px solid rgba(245, 158, 11, 0.3)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)'
                          }} 
                        />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#F59E0B"
                          strokeWidth={3}
                          fill="url(#revenueGradient)"
                        />
                        <Line 
                          type="monotone" 
                          dataKey="revenue" 
                          stroke="#F59E0B" 
                          strokeWidth={3}
                          dot={{ fill: '#F59E0B', strokeWidth: 2, r: 5, filter: 'drop-shadow(0 0 6px #F59E0B)' }}
                          activeDot={{ r: 8, fill: '#F59E0B', stroke: '#000', strokeWidth: 2 }}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Modern User Distribution */}
              <div className="group relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 blur-xl rounded-2xl group-hover:blur-2xl transition-all duration-300"></div>
                <div className="relative bg-black/30 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Kullanıcı Dağılımı</h3>
                    <div className="text-sm text-gray-300">Toplam: {userDistribution.reduce((sum, item) => sum + item.value, 0)}</div>
                  </div>
                  <div className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <defs>
                          <filter id="shadow" height="130%">
                            <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000" floodOpacity="0.3"/>
                          </filter>
                        </defs>
                        <Pie
                          data={userDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                          outerRadius={90}
                          innerRadius={30}
                          fill="#8884d8"
                          dataKey="value"
                          style={{ filter: 'url(#shadow)' }}
                        >
                          {userDistribution.map((entry, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={COLORS[index % COLORS.length]}
                              stroke="rgba(255,255,255,0.1)"
                              strokeWidth={2}
                            />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(0, 0, 0, 0.8)',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            borderRadius: '12px',
                            backdropFilter: 'blur(10px)'
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>

            {/* Modern Popular Games */}
            <div className="group relative mt-6">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-blue-500/10 blur-xl rounded-2xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-black/30 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Popüler Oyunlar</h3>
                  <div className="text-sm text-gray-300">Son 7 gün</div>
                </div>
                <div className="space-y-4">
                  {popularGames.map((game, index) => (
                    <div key={index} className="group/item flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-black font-bold text-sm mr-4 shadow-lg ${
                          index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-500' :
                          index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-400' :
                          index === 2 ? 'bg-gradient-to-r from-orange-400 to-orange-500' :
                          'bg-gradient-to-r from-blue-400 to-blue-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="text-white font-medium group-hover/item:text-yellow-400 transition-colors">{game.name}</div>
                          <div className="text-gray-400 text-xs">Slot Oyunu</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-bold text-lg">{game.plays.toLocaleString()}</div>
                        <div className="text-gray-400 text-sm">oynama</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Modern Recent Transactions */}
            <div className="group relative mt-6">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl rounded-2xl group-hover:blur-2xl transition-all duration-300"></div>
              <div className="relative bg-black/30 backdrop-blur-xl border border-white/10 p-6 rounded-2xl">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">Son İşlemler</h3>
                  <button className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors">
                    Tümünü Gör
                  </button>
                </div>
                <div className="space-y-4">
                  {recentTransactions.map((transaction, index) => (
                    <div key={index} className="group/item flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
                      <div className="flex items-center">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center mr-4 shadow-lg ${
                          transaction.type === 'deposit' 
                            ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                            : 'bg-gradient-to-r from-red-500 to-rose-500'
                        }`}>
                          <i className={`fas ${
                            transaction.type === 'deposit' ? 'fa-arrow-down' : 'fa-arrow-up'
                          } text-white`}></i>
                        </div>
                        <div>
                          <div className="text-white font-medium group-hover/item:text-yellow-400 transition-colors">
                            {transaction.user}
                          </div>
                          <div className="text-gray-400 text-sm">
                            {transaction.type === 'deposit' ? 'Para Yatırma' : 'Para Çekme'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-bold text-lg ${
                          transaction.type === 'deposit' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {transaction.type === 'deposit' ? '+' : '-'}₺{transaction.amount.toLocaleString()}
                        </div>
                        <div className="text-gray-400 text-sm">{transaction.time}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other tab contents */}
        {activeTab === 'users' && (
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 blur-xl rounded-2xl"></div>
            <div className="relative bg-black/30 backdrop-blur-xl border border-white/10 p-8 rounded-2xl text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Kullanıcı Yönetimi</h3>
              <p className="text-gray-300">Bu bölüm geliştirilme aşamasındadır.</p>
            </div>
          </div>
        )}

        {activeTab === 'finance' && (
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10 blur-xl rounded-2xl"></div>
            <div className="relative bg-black/30 backdrop-blur-xl border border-white/10 p-8 rounded-2xl text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Finansal Analiz</h3>
              <p className="text-gray-300">Bu bölüm geliştirilme aşamasındadır.</p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="group relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl rounded-2xl"></div>
            <div className="relative bg-black/30 backdrop-blur-xl border border-white/10 p-8 rounded-2xl text-center">
              <h3 className="text-2xl font-bold text-white mb-4">Detaylı Analitik</h3>
              <p className="text-gray-300">Bu bölüm geliştirilme aşamasındadır.</p>
            </div>
          </div>
        )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;