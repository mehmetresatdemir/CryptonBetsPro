import React, { useState, useEffect } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import {
  Layers,
  Plus,
  Search,
  RefreshCw,
  Zap,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Settings,
  Trash2,
  Edit3,
  Eye,
  Activity,
  Clock,
  TrendingUp,
  Server,
  Database,
  Cloud,
  Link,
  Key,
  Shield,
  Globe,
  Smartphone,
  Mail,
  CreditCard,
  BarChart3,
  AlertCircle,
  Filter,
  ExternalLink,
  MoreVertical
} from 'lucide-react';

interface Integration {
  id: number;
  name: string;
  provider: string;
  type: string;
  category: string;
  status: 'active' | 'inactive' | 'error' | 'testing' | 'maintenance';
  isActive: boolean;
  apiKey?: string;
  endpoint?: string;
  version?: string;
  lastSync?: string;
  lastError?: string;
  errorCount: number;
  successRate: string;
  avgResponseTime: number;
  totalRequests: number;
  dailyLimit: number;
  usedToday: number;
  createdAt: string;
  updatedAt: string;
  config?: Record<string, any>;
  webhookUrl?: string;
  retryCount?: number;
  timeout?: number;
  rateLimit?: number;
  description?: string;
  documentation?: string;
  supportContact?: string;
}

interface IntegrationStats {
  totalIntegrations: number;
  activeIntegrations: number;
  errorIntegrations: number;
  avgResponseTime: number;
  totalRequests24h: number;
  successRate: number;
  topPerformingIntegration: string;
  recentErrors: number;
}

export default function Integrations() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get admin headers for authenticated requests
  const getAdminHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch integrations
  const { data: integrations = [], isLoading, error } = useQuery({
    queryKey: ['/api/admin/integrations'],
    queryFn: async () => {
      const response = await fetch('/api/admin/integrations', {
        headers: getAdminHeaders()
      });
      if (!response.ok) {
        throw new Error('Entegrasyonlar yüklenemedi');
      }
      return response.json();
    }
  });

  // Fetch statistics
  const { data: stats } = useQuery({
    queryKey: ['/api/admin/integrations/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/integrations/stats', {
        headers: getAdminHeaders()
      });
      if (!response.ok) {
        throw new Error('İstatistikler yüklenemedi');
      }
      return response.json();
    }
  });

  // Test integration mutation
  const testIntegrationMutation = useMutation({
    mutationFn: async (integrationId: number) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/integrations/${integrationId}/test`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        throw new Error('Test başarısız');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: data.success ? "Test Başarılı" : "Test Başarısız",
        description: data.message,
        variant: data.success ? "default" : "destructive"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/integrations'] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Test işlemi gerçekleştirilemedi",
        variant: "destructive"
      });
    }
  });

  // Toggle integration mutation
  const toggleIntegrationMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: number; isActive: boolean }) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/integrations/${id}/toggle`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isActive })
      });
      if (!response.ok) {
        throw new Error('Durum değiştirilemedi');
      }
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Başarılı",
        description: data.message,
        variant: "default"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/integrations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/integrations/stats'] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Durum değiştirilemedi",
        variant: "destructive"
      });
    }
  });

  // Filter integrations
  const filteredIntegrations = integrations.filter((integration: Integration) => {
    const matchesSearch = integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         integration.provider.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || integration.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || integration.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'games': return <Server className="w-4 h-4" />;
      case 'payment': return <CreditCard className="w-4 h-4" />;
      case 'communication': return <Mail className="w-4 h-4" />;
      case 'analytics': return <BarChart3 className="w-4 h-4" />;
      case 'security': return <Shield className="w-4 h-4" />;
      case 'support': return <Smartphone className="w-4 h-4" />;
      case 'marketing': return <Globe className="w-4 h-4" />;
      default: return <Database className="w-4 h-4" />;
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Aktif
        </span>;
      case 'inactive':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <XCircle className="w-3 h-3 mr-1" />
          Pasif
        </span>;
      case 'error':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <AlertCircle className="w-3 h-3 mr-1" />
          Hata
        </span>;
      case 'testing':
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Test
        </span>;
      default:
        return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Settings className="w-3 h-3 mr-1" />
          {status}
        </span>;
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-8 p-6 bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 rounded-xl shadow-lg p-6 border border-yellow-200">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Layers className="w-6 h-6 text-white" />
              </div>
              API Entegrasyonları
            </h1>
            <p className="text-white/90 mt-2 text-lg">Sistem entegrasyonlarını profesyonelce yönetin</p>
          </div>
          <button className="bg-white text-amber-600 px-6 py-3 rounded-xl hover:bg-amber-50 flex items-center gap-2 shadow-lg transition-all duration-200 transform hover:scale-105 font-semibold">
            <Plus className="w-5 h-5" />
            Yeni Entegrasyon
          </button>
        </div>

        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-r from-gray-800 to-slate-700 p-6 rounded-xl shadow-lg border border-gray-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-yellow-400 uppercase tracking-wide">Toplam Entegrasyon</p>
                  <p className="text-3xl font-bold text-white">{stats.totalIntegrations}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Database className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-800 to-slate-700 p-6 rounded-xl shadow-lg border border-gray-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-400 uppercase tracking-wide">Aktif Entegrasyonlar</p>
                  <p className="text-3xl font-bold text-white">{stats.activeIntegrations}</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-800 to-slate-700 p-6 rounded-xl shadow-lg border border-gray-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-400 uppercase tracking-wide">Ortalama Yanıt</p>
                  <p className="text-3xl font-bold text-white">{stats.avgResponseTime}ms</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Clock className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-gray-800 to-slate-700 p-6 rounded-xl shadow-lg border border-gray-600 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-400 uppercase tracking-wide">Başarı Oranı</p>
                  <p className="text-3xl font-bold text-white">{stats.successRate}%</p>
                </div>
                <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <TrendingUp className="w-7 h-7 text-white" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gradient-to-r from-gray-800 to-slate-700 p-6 rounded-xl shadow-lg border border-gray-600">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Entegrasyon ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-gray-700 transition-all duration-200 hover:bg-gray-600 text-white placeholder-gray-300"
                />
              </div>
            </div>
            
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-gray-700 transition-all duration-200 hover:bg-gray-600 text-white min-w-[180px]"
            >
              <option value="all">Tüm Kategoriler</option>
              <option value="games">🎮 Oyunlar</option>
              <option value="payment">💳 Ödeme</option>
              <option value="communication">📨 İletişim</option>
              <option value="analytics">📊 Analitik</option>
              <option value="security">🔒 Güvenlik</option>
              <option value="support">🎧 Destek</option>
              <option value="marketing">📢 Pazarlama</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-3 border border-gray-600 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent bg-gray-700 transition-all duration-200 hover:bg-gray-600 text-white min-w-[150px]"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="active">✅ Aktif</option>
              <option value="inactive">⚪ Pasif</option>
              <option value="error">❌ Hata</option>
              <option value="testing">🧪 Test</option>
            </select>
          </div>
        </div>

        {/* Integrations List */}
        <div className="bg-gradient-to-r from-gray-800 to-slate-700 rounded-xl shadow-lg border border-gray-600 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-600">
              <thead className="bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400">
                <tr>
                  <th className="px-8 py-5 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Entegrasyon
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Durum
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Performans
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Kullanım
                  </th>
                  <th className="px-8 py-5 text-left text-xs font-semibold text-white uppercase tracking-wider">
                    Son Sync
                  </th>
                  <th className="px-8 py-5 text-right text-xs font-semibold text-white uppercase tracking-wider">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="bg-gradient-to-b from-gray-800 to-slate-700 divide-y divide-gray-600">
                {filteredIntegrations.map((integration: Integration) => (
                  <tr key={integration.id} className="hover:bg-gradient-to-r hover:from-gray-700 hover:to-slate-600 transition-all duration-200 border-l-4 border-transparent hover:border-yellow-400">
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                          {getCategoryIcon(integration.category)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-semibold text-white">
                            {integration.name}
                          </div>
                          <div className="text-sm text-gray-300 font-medium">
                            {integration.provider} • v{integration.version}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      {getStatusBadge(integration.status)}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm font-semibold text-white">
                        {integration.successRate}% başarı
                      </div>
                      <div className="text-sm text-gray-300">
                        {integration.avgResponseTime}ms ortalama
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap">
                      <div className="text-sm font-semibold text-white mb-2">
                        {integration.usedToday.toLocaleString()} / {integration.dailyLimit.toLocaleString()}
                      </div>
                      <div className="w-full bg-gray-600 rounded-full h-3 shadow-inner">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full shadow-sm transition-all duration-300" 
                          style={{ width: `${Math.min((integration.usedToday / integration.dailyLimit) * 100, 100)}%` }}
                        ></div>
                      </div>
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-300">
                      {integration.lastSync ? new Date(integration.lastSync).toLocaleDateString('tr-TR') : 'Henüz yok'}
                    </td>
                    <td className="px-8 py-6 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          onClick={() => testIntegrationMutation.mutate(integration.id)}
                          disabled={testIntegrationMutation.isPending}
                          className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white p-2 rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                          title="Test et"
                        >
                          <Zap className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleIntegrationMutation.mutate({ 
                            id: integration.id, 
                            isActive: !integration.isActive 
                          })}
                          disabled={toggleIntegrationMutation.isPending}
                          className={`p-2 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg ${
                            integration.isActive 
                              ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white hover:from-red-600 hover:to-pink-600' 
                              : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                          }`}
                          title={integration.isActive ? 'Pasif et' : 'Aktif et'}
                        >
                          {integration.isActive ? <XCircle className="w-4 h-4" /> : <CheckCircle className="w-4 h-4" />}
                        </button>
                        <button className="bg-gradient-to-r from-orange-500 to-amber-600 text-white p-2 rounded-lg hover:from-orange-600 hover:to-amber-700 transition-all duration-200 transform hover:scale-105 shadow-lg" title="Ayarlar">
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredIntegrations.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <Database className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Entegrasyon bulunamadı</h3>
            <p className="mt-1 text-sm text-gray-500">
              Arama kriterlerinizi değiştirin veya yeni entegrasyon ekleyin.
            </p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}