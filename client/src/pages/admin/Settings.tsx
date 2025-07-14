import React, { useState, useEffect } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import {
  Save,
  Settings as SettingsIcon,
  Globe,
  DollarSign,
  Layers,
  Shield,
  Gamepad2,
  TrendingUp,
  Users,
  Bell,
  BarChart3,
  Palette,
  Database,
  ChevronDown,
  ChevronRight,
  Pencil,
  Trash,
  PlusCircle,
  RefreshCw,
  Settings2,
  CheckCircle,
  Power,
  Search,
  Zap,
  CreditCard,
  Activity,
  Smartphone,
  Mail
} from 'lucide-react';

interface SiteSetting {
  id: number;
  key: string;
  value: string;
  category: string;
  type: string;
  description?: string;
  isPublic: boolean;
  isEncrypted: boolean;
}

interface Currency {
  id: number;
  code: string;
  name: string;
  symbol: string;
  rate: string;
  isDefault: boolean;
  isActive: boolean;
  minDeposit?: string;
  maxDeposit?: string;
  minWithdraw?: string;
  maxWithdraw?: string;
}

interface PaymentMethod {
  id: number;
  name: string;
  type: string;
  provider: string;
  isActive: boolean;
  minAmount?: string;
  maxAmount?: string;
  fee: string;
  feeType: string;
  currencies: string[];
}

interface ApiIntegration {
  id: number;
  name: string;
  provider: string;
  type: string;
  isActive: boolean;
  status: string;
  lastSync?: string;
  errorMessage?: string;
}

const Settings: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('general');
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    identity: true,
    localization: false
  });

  // Düzenleme için state ekle
  const [editingIntegration, setEditingIntegration] = useState<ApiIntegration | null>(null);
  const [integrationFormData, setIntegrationFormData] = useState<any>({});

  // API entegrasyon güncelleme mutation'u ekle
  const updateIntegrationMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      const response = await fetch(`/api/admin/api-integrations/${id}`, {
        method: 'PUT',
        headers: getAdminHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('API entegrasyonu güncellenemedi');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "API entegrasyonu başarıyla güncellendi"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/api-integrations'] });
      setEditingIntegration(null);
      setIntegrationFormData({});
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "API entegrasyonu güncellenirken hata oluştu",
        variant: "destructive"
      });
    }
  });

  // Düzenleme fonksiyonları
  const handleEditIntegration = (integration: ApiIntegration) => {
    setEditingIntegration(integration);
    setIntegrationFormData({
      name: integration.name,
      provider: integration.provider,
      type: integration.type,
      isActive: integration.isActive,
      status: integration.status
    });
  };

  const handleUpdateIntegration = () => {
    if (!editingIntegration) return;
    updateIntegrationMutation.mutate({
      id: editingIntegration.id,
      data: integrationFormData
    });
  };

  const handleCancelEdit = () => {
    setEditingIntegration(null);
    setIntegrationFormData({});
  };

  // Get admin token for authenticated requests
  const getAdminHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Fetch site settings
  const { data: siteSettings = [], isLoading: settingsLoading } = useQuery({
    queryKey: ['/api/admin/settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/settings', {
        headers: getAdminHeaders()
      });
      if (!response.ok) throw new Error('Settings verisi alınamadı');
      return response.json();
    }
  });

  // Fetch currencies
  const { data: currencies = [], isLoading: currenciesLoading } = useQuery({
    queryKey: ['/api/admin/currencies'],
    queryFn: async () => {
      const response = await fetch('/api/admin/currencies', {
        headers: getAdminHeaders()
      });
      if (!response.ok) throw new Error('Para birimi verisi alınamadı');
      return response.json();
    }
  });

  // Fetch payment methods
  const { data: paymentMethods = [], isLoading: paymentLoading } = useQuery({
    queryKey: ['/api/admin/payment-settings'],
    queryFn: async () => {
      const response = await fetch('/api/admin/payment-settings', {
        headers: getAdminHeaders()
      });
      if (!response.ok) throw new Error('Ödeme yöntemi verisi alınamadı');
      return response.json();
    }
  });

  // Fetch API integrations
  const { data: apiIntegrations = [], isLoading: apiLoading } = useQuery({
    queryKey: ['/api/admin/api-integrations'],
    queryFn: async () => {
      const response = await fetch('/api/admin/api-integrations', {
        headers: getAdminHeaders()
      });
      if (!response.ok) throw new Error('API entegrasyon verisi alınamadı');
      return response.json();
    }
  });

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: getAdminHeaders(),
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Ayarlar kaydedilemedi');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Ayarlar başarıyla kaydedildi"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "Ayarlar kaydedilirken hata oluştu",
        variant: "destructive"
      });
    }
  });

  // Initialize form data
  useEffect(() => {
    if (siteSettings.length > 0) {
      const data = siteSettings.reduce((acc: any, setting: SiteSetting) => {
        acc[setting.key] = setting.value;
        return acc;
      }, {});
      setFormData(data);
    }
  }, [siteSettings]);

  const handleInputChange = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSave = () => {
    saveSettingsMutation.mutate({
      category: activeTab,
      settings: formData
    });
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderGeneralSettings = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <SettingsIcon className="h-8 w-8 mr-3 text-yellow-500" />
          Casino Genel Ayarları
        </h2>
        <button
          onClick={handleSave}
          disabled={saveSettingsMutation.isPending}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-medium transition-colors flex items-center shadow-lg"
        >
          <Save className="h-5 w-5 mr-2" />
          {saveSettingsMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>

      {/* Site Kimliği */}
      <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Globe className="h-6 w-6 mr-2 text-blue-400" />
            Site Kimliği
          </h3>
          <button
            onClick={() => toggleSection('identity')}
            className="text-gray-400 hover:text-white"
          >
            {expandedSections.identity ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        </div>
        
        {expandedSections.identity && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Casino Adı
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                value={formData['site_name'] || 'CryptonBets'}
                onChange={(e) => handleInputChange('site_name', e.target.value)}
                placeholder="Casino adınızı girin"
              />
              <p className="text-xs text-gray-400 mt-1">Header ve sayfa başlıklarında görünür</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Site Sloganı
              </label>
              <input
                type="text"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                value={formData['site_slogan'] || 'En İyi Casino Deneyimi'}
                onChange={(e) => handleInputChange('site_slogan', e.target.value)}
                placeholder="Site sloganınızı girin"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Site Açıklaması (SEO)
              </label>
              <textarea
                rows={3}
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent resize-none"
                value={formData['site_description'] || 'Türkiye\'nin en güvenilir online casino platformu. Binlerce slot oyunu, canlı casino ve spor bahisleri.'}
                onChange={(e) => handleInputChange('site_description', e.target.value)}
                placeholder="SEO için site açıklaması"
              />
              <p className="text-xs text-gray-400 mt-1">Arama motorlarında görünür (max 160 karakter)</p>
            </div>
          </div>
        )}
      </div>

      {/* Bakım ve Durum */}
      <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white flex items-center">
            <Settings2 className="h-6 w-6 mr-2 text-orange-400" />
            Site Durumu ve Bakım
          </h3>
        </div>
        
        <div className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
            <div className="flex items-center">
              <div className="mr-4">
                <div className="text-white font-medium">Bakım Modu</div>
                <div className="text-gray-400 text-sm">Site kullanıcılar için kapalı</div>
              </div>
            </div>
            <div className="relative inline-block w-14 mr-2 align-middle select-none">
              <input
                type="checkbox"
                className="sr-only"
                checked={formData['maintenance_mode'] === 'true'}
                onChange={(e) => handleInputChange('maintenance_mode', e.target.checked ? 'true' : 'false')}
              />
              <div
                className={`block h-8 rounded-full w-14 cursor-pointer transition-colors ${
                  formData['maintenance_mode'] === 'true' ? 'bg-red-500' : 'bg-green-500'
                }`}
                onClick={() => handleInputChange('maintenance_mode', formData['maintenance_mode'] === 'true' ? 'false' : 'true')}
              >
                <div
                  className={`absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform shadow-lg ${
                    formData['maintenance_mode'] === 'true' ? 'transform translate-x-6' : ''
                  }`}
                >
                  {formData['maintenance_mode'] === 'true' ? 
                    <Power className="h-4 w-4 text-red-500 m-1" /> : 
                    <CheckCircle className="h-4 w-4 text-green-500 m-1" />
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const menuItems = [
    { id: 'general', label: 'Genel Ayarlar', icon: SettingsIcon, description: 'Site kimliği, lokalizasyon, bakım modu' },
    { id: 'currencies', label: 'Para Birimi', icon: DollarSign, description: 'Kur yönetimi, döviz ayarları' },
    { id: 'payment', label: 'Ödeme Sistemi', icon: CreditCard, description: 'Ödeme yöntemleri, limitler, komisyonlar' },
    { id: 'api', label: 'API Entegrasyon', icon: Layers, description: 'Oyun API\'leri, servis entegrasyonları' },
    { id: 'security', label: 'Güvenlik', icon: Shield, description: 'Kullanıcı güvenliği, sistem koruması' },
    { id: 'games', label: 'Oyun Ayarları', icon: Gamepad2, description: 'Oyun kategorileri, RTP, jackpot ayarları' },
    { id: 'bonuses', label: 'Bonus Sistemi', icon: TrendingUp, description: 'Bonus türleri, kampanyalar, çevrim şartları' },
    { id: 'users', label: 'Kullanıcı Yönetimi', icon: Users, description: 'VIP seviyeleri, limitler, kısıtlamalar' },
    { id: 'notifications', label: 'Bildirimler', icon: Bell, description: 'Email, SMS, push bildirimleri' },
    { id: 'analytics', label: 'Analitik', icon: BarChart3, description: 'Raporlama, istatistikler, performans' },
    { id: 'design', label: 'Tasarım', icon: Palette, description: 'Tema, logo, banner yönetimi' },
    { id: 'system', label: 'Sistem', icon: Database, description: 'Sunucu durumu, yedekleme, bakım' },
  ];

  const renderCurrencySettings = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <DollarSign className="h-8 w-8 mr-3 text-yellow-500" />
          Para Birimi Yönetimi
        </h2>
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center">
          <PlusCircle className="h-5 w-5 mr-2" />
          Yeni Para Birimi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {currencies.map((currency: Currency) => (
          <div key={currency.id} className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="bg-yellow-500/20 p-3 rounded-lg mr-4">
                  <DollarSign className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <div className="text-white font-semibold">{currency.name}</div>
                  <div className="text-gray-400 text-sm">{currency.code} ({currency.symbol})</div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                currency.isDefault ? 'bg-green-500/20 text-green-400' : 
                currency.isActive ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {currency.isDefault ? 'Varsayılan' : currency.isActive ? 'Aktif' : 'Pasif'}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Kur:</span>
                <span className="text-white">{currency.rate}</span>
              </div>
              {currency.minDeposit && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Min Yatırım:</span>
                  <span className="text-white">{currency.minDeposit} {currency.symbol}</span>
                </div>
              )}
              {currency.maxDeposit && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Max Yatırım:</span>
                  <span className="text-white">{currency.maxDeposit} {currency.symbol}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <CreditCard className="h-8 w-8 mr-3 text-yellow-500" />
          Ödeme Sistemi Yönetimi
        </h2>
        <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center">
          <PlusCircle className="h-5 w-5 mr-2" />
          Yeni Ödeme Yöntemi
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {paymentMethods.map((method: PaymentMethod) => (
          <div key={method.id} className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg mr-4 ${
                  method.type === 'bank' ? 'bg-blue-500/20' :
                  method.type === 'crypto' ? 'bg-orange-500/20' :
                  method.type === 'ewallet' ? 'bg-green-500/20' :
                  'bg-purple-500/20'
                }`}>
                  <CreditCard className={`h-6 w-6 ${
                    method.type === 'bank' ? 'text-blue-400' :
                    method.type === 'crypto' ? 'text-orange-400' :
                    method.type === 'ewallet' ? 'text-green-400' :
                    'text-purple-400'
                  }`} />
                </div>
                <div>
                  <div className="text-white font-semibold">{method.name}</div>
                  <div className="text-gray-400 text-sm">{method.provider}</div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                method.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {method.isActive ? 'Aktif' : 'Pasif'}
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Komisyon:</span>
                <span className="text-white">{method.fee}% ({method.feeType})</span>
              </div>
              {method.minAmount && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Min Tutar:</span>
                  <span className="text-white">{method.minAmount} TRY</span>
                </div>
              )}
              {method.maxAmount && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Max Tutar:</span>
                  <span className="text-white">{method.maxAmount} TRY</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderApiIntegrations = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <Layers className="h-8 w-8 mr-3 text-yellow-500" />
          API Entegrasyon Yönetimi
        </h2>
        <div className="flex gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tümünü Test Et
          </button>
          <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
            <PlusCircle className="h-4 w-4 mr-2" />
            Yeni Entegrasyon
          </button>
        </div>
      </div>

      {/* Düzenleme Modal'ı */}
      {editingIntegration && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-xl border border-yellow-500/20 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">API Entegrasyonu Düzenle</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Entegrasyon Adı
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  value={integrationFormData.name || ''}
                  onChange={(e) => setIntegrationFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sağlayıcı
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  value={integrationFormData.provider || ''}
                  onChange={(e) => setIntegrationFormData(prev => ({ ...prev, provider: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Tip
                </label>
                <select
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                  value={integrationFormData.type || ''}
                  onChange={(e) => setIntegrationFormData(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="gaming">Gaming</option>
                  <option value="payment">Payment</option>
                  <option value="sms">SMS</option>
                  <option value="email">Email</option>
                  <option value="analytics">Analytics</option>
                  <option value="security">Security</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-300">
                  Aktif
                </label>
                <div className="relative inline-block w-12 align-middle select-none">
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={integrationFormData.isActive || false}
                    onChange={(e) => setIntegrationFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                  />
                  <div
                    className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                      integrationFormData.isActive ? 'bg-green-500' : 'bg-gray-600'
                    }`}
                    onClick={() => setIntegrationFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                  >
                    <div
                      className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        integrationFormData.isActive ? 'transform translate-x-6' : ''
                      }`}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleUpdateIntegration}
                disabled={updateIntegrationMutation.isPending}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors flex items-center"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateIntegrationMutation.isPending ? 'Kaydediliyor...' : 'Kaydet'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {apiIntegrations.map((integration: ApiIntegration) => (
          <div key={integration.id} className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg mr-4 ${
                  integration.provider === 'Slotegrator' ? 'bg-purple-500/20' :
                  integration.provider === 'FinanceAPI' ? 'bg-green-500/20' :
                  integration.provider === 'Twilio' ? 'bg-blue-500/20' :
                  integration.provider === 'SMTP' ? 'bg-red-500/20' :
                  'bg-gray-500/20'
                }`}>
                  {integration.provider === 'Slotegrator' && <Gamepad2 className="h-6 w-6 text-purple-400" />}
                  {integration.provider === 'FinanceAPI' && <CreditCard className="h-6 w-6 text-green-400" />}
                  {integration.provider === 'Twilio' && <Smartphone className="h-6 w-6 text-blue-400" />}
                  {integration.provider === 'SMTP' && <Mail className="h-6 w-6 text-red-400" />}
                  {!['Slotegrator', 'FinanceAPI', 'Twilio', 'SMTP'].includes(integration.provider) && <Layers className="h-6 w-6 text-gray-400" />}
                </div>
                <div>
                  <div className="text-white font-semibold">{integration.name}</div>
                  <div className="text-gray-400 text-sm">{integration.provider}</div>
                </div>
              </div>
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                integration.isActive ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
              }`}>
                {integration.isActive ? 'Aktif' : 'Pasif'}
              </div>
            </div>
            
            <div className="space-y-3 mb-4">
              {integration.lastSync && (
                <div className="text-xs text-gray-400">
                  Son senkronizasyon: {new Date(integration.lastSync).toLocaleString('tr-TR')}
                </div>
              )}
              
              {(integration as any).endpoint && (
                <div className="text-xs text-gray-400">
                  Endpoint: {(integration as any).endpoint}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2">
              <button 
                className="text-blue-400 hover:text-blue-300 p-2 hover:bg-blue-400/20 rounded" 
                title="Test Et"
                onClick={async () => {
                  try {
                    const response = await fetch(`/api/admin/api-integrations/${integration.id}/test`, {
                      method: 'POST',
                      headers: getAdminHeaders()
                    });
                    const result = await response.json();
                    toast({
                      title: result.success ? "Test Başarılı" : "Test Başarısız",
                      description: result.message,
                      variant: result.success ? "default" : "destructive"
                    });
                  } catch (error) {
                    toast({
                      title: "Hata",
                      description: "Test işlemi gerçekleştirilemedi",
                      variant: "destructive"
                    });
                  }
                }}
              >
                <Zap className="h-4 w-4" />
              </button>
              <button 
                className="text-green-400 hover:text-green-300 p-2 hover:bg-green-400/20 rounded" 
                title="Düzenle"
                onClick={() => handleEditIntegration(integration)}
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button className="text-orange-400 hover:text-orange-300 p-2 hover:bg-orange-400/20 rounded" title="Ayarlar">
                <Settings2 className="h-4 w-4" />
              </button>
              <button className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/20 rounded" title="Sil">
                <Trash className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <Shield className="h-8 w-8 mr-3 text-yellow-500" />
          Güvenlik Ayarları
        </h2>
        <button
          onClick={handleSave}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
        >
          <Save className="h-5 w-5 mr-2" />
          Kaydet
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Shield className="h-6 w-6 mr-2 text-green-400" />
            Kullanıcı Güvenliği
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">İki Faktörlü Doğrulama</div>
                <div className="text-gray-400 text-sm">Kullanıcılar için 2FA zorunlu</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['require_2fa'] !== 'false'}
                  onChange={(e) => handleInputChange('require_2fa', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['require_2fa'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('require_2fa', formData['require_2fa'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['require_2fa'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Session Timeout</div>
                <div className="text-gray-400 text-sm">Otomatik çıkış süresi (dakika)</div>
              </div>
              <input
                type="number"
                min="5"
                max="1440"
                className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                value={formData['session_timeout'] || '30'}
                onChange={(e) => handleInputChange('session_timeout', e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Rate Limiting</div>
                <div className="text-gray-400 text-sm">API istek sınırlaması</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['rate_limiting'] !== 'false'}
                  onChange={(e) => handleInputChange('rate_limiting', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['rate_limiting'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('rate_limiting', formData['rate_limiting'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['rate_limiting'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Database className="h-6 w-6 mr-2 text-blue-400" />
            Sistem Güvenliği
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">SSL Zorunlu</div>
                <div className="text-gray-400 text-sm">HTTPS protokolü zorunlu</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['force_ssl'] !== 'false'}
                  onChange={(e) => handleInputChange('force_ssl', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['force_ssl'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('force_ssl', formData['force_ssl'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['force_ssl'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">IP Engelleme</div>
                <div className="text-gray-400 text-sm">Şüpheli IP'leri otomatik engelle</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['auto_ip_blocking'] !== 'false'}
                  onChange={(e) => handleInputChange('auto_ip_blocking', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['auto_ip_blocking'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('auto_ip_blocking', formData['auto_ip_blocking'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['auto_ip_blocking'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Login Denemesi Sınırı</div>
                <div className="text-gray-400 text-sm">Max başarısız giriş denemesi</div>
              </div>
              <input
                type="number"
                min="3"
                max="10"
                className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                value={formData['max_login_attempts'] || '5'}
                onChange={(e) => handleInputChange('max_login_attempts', e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderGameSettings = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <Gamepad2 className="h-8 w-8 mr-3 text-yellow-500" />
          Oyun Ayarları
        </h2>
        <button
          onClick={handleSave}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
        >
          <Save className="h-5 w-5 mr-2" />
          Kaydet
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-green-400" />
            RTP ve Kazanç Ayarları
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Varsayılan RTP (%)
              </label>
              <input
                type="number"
                min="85"
                max="99"
                step="0.1"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={formData['default_rtp'] || '96.0'}
                onChange={(e) => handleInputChange('default_rtp', e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">Oyunların varsayılan geri ödeme oranı</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Jackpot Katkı Oranı (%)
              </label>
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={formData['jackpot_contribution'] || '1.0'}
                onChange={(e) => handleInputChange('jackpot_contribution', e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">Her bahisten jackpot'a giden oran</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Minimum Bahis (TRY)
              </label>
              <input
                type="number"
                min="0.1"
                max="100"
                step="0.1"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={formData['min_bet_amount'] || '1.0'}
                onChange={(e) => handleInputChange('min_bet_amount', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Maksimum Bahis (TRY)
              </label>
              <input
                type="number"
                min="100"
                max="50000"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={formData['max_bet_amount'] || '5000'}
                onChange={(e) => handleInputChange('max_bet_amount', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Activity className="h-6 w-6 mr-2 text-blue-400" />
            Oyun Kısıtlamaları
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Real Money Mode</div>
                <div className="text-gray-400 text-sm">Authentic casino gaming only</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={true}
                  disabled
                />
                <div className="block h-6 rounded-full w-12 cursor-not-allowed bg-green-500">
                  <div className="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transform translate-x-6"></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Autoplay Sınırı</div>
                <div className="text-gray-400 text-sm">Maksimum otomatik spin sayısı</div>
              </div>
              <input
                type="number"
                min="10"
                max="1000"
                className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                value={formData['max_autoplay_spins'] || '100'}
                onChange={(e) => handleInputChange('max_autoplay_spins', e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Günlük Oyun Süresi (saat)</div>
                <div className="text-gray-400 text-sm">Kullanıcı başına maksimum süre</div>
              </div>
              <input
                type="number"
                min="1"
                max="24"
                className="w-20 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm"
                value={formData['daily_play_limit'] || '12'}
                onChange={(e) => handleInputChange('daily_play_limit', e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Sorumluluk Bildirimleri</div>
                <div className="text-gray-400 text-sm">Sorumlu oyun uyarıları</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['responsible_gaming'] !== 'false'}
                  onChange={(e) => handleInputChange('responsible_gaming', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['responsible_gaming'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('responsible_gaming', formData['responsible_gaming'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['responsible_gaming'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderBonusSettings = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <TrendingUp className="h-8 w-8 mr-3 text-yellow-500" />
          Bonus Sistemi
        </h2>
        <button
          onClick={handleSave}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
        >
          <Save className="h-5 w-5 mr-2" />
          Kaydet
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-green-400" />
            Hoşgeldin Bonusu
          </h3>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Hoşgeldin Bonusu</div>
                <div className="text-gray-400 text-sm">Yeni üyelere otomatik bonus</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['welcome_bonus_enabled'] !== 'false'}
                  onChange={(e) => handleInputChange('welcome_bonus_enabled', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['welcome_bonus_enabled'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('welcome_bonus_enabled', formData['welcome_bonus_enabled'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['welcome_bonus_enabled'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Bonus Yüzdesi (%)
              </label>
              <input
                type="number"
                min="0"
                max="500"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={formData['welcome_bonus_percentage'] || '100'}
                onChange={(e) => handleInputChange('welcome_bonus_percentage', e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">İlk yatırımın yüzde kaçı bonus olarak verilecek</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Maksimum Bonus (TRY)
              </label>
              <input
                type="number"
                min="10"
                max="10000"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={formData['welcome_bonus_max'] || '1000'}
                onChange={(e) => handleInputChange('welcome_bonus_max', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Çevrim Şartı (x)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={formData['welcome_bonus_wagering'] || '25'}
                onChange={(e) => handleInputChange('welcome_bonus_wagering', e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">Bonus miktarının kaç katı çevrilmeli</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Activity className="h-6 w-6 mr-2 text-blue-400" />
            Diğer Bonuslar
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Günlük Bonus</div>
                <div className="text-gray-400 text-sm">Her gün giriş bonusu</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['daily_bonus_enabled'] !== 'false'}
                  onChange={(e) => handleInputChange('daily_bonus_enabled', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['daily_bonus_enabled'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('daily_bonus_enabled', formData['daily_bonus_enabled'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['daily_bonus_enabled'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Haftalık Bonus</div>
                <div className="text-gray-400 text-sm">Haftalık aktiflik bonusu</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['weekly_bonus_enabled'] !== 'false'}
                  onChange={(e) => handleInputChange('weekly_bonus_enabled', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['weekly_bonus_enabled'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('weekly_bonus_enabled', formData['weekly_bonus_enabled'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['weekly_bonus_enabled'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Kayıp Bonusu</div>
                <div className="text-gray-400 text-sm">Kayıplar için geri ödeme</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['cashback_enabled'] !== 'false'}
                  onChange={(e) => handleInputChange('cashback_enabled', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['cashback_enabled'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('cashback_enabled', formData['cashback_enabled'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['cashback_enabled'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Referans Bonusu</div>
                <div className="text-gray-400 text-sm">Arkadaş davet bonusu</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['referral_bonus_enabled'] !== 'false'}
                  onChange={(e) => handleInputChange('referral_bonus_enabled', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['referral_bonus_enabled'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('referral_bonus_enabled', formData['referral_bonus_enabled'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['referral_bonus_enabled'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <Users className="h-8 w-8 mr-3 text-yellow-500" />
          Kullanıcı Yönetimi
        </h2>
        <button
          onClick={handleSave}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
        >
          <Save className="h-5 w-5 mr-2" />
          Kaydet
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Shield className="h-6 w-6 mr-2 text-green-400" />
            Kullanıcı Kısıtlamaları
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Günlük Yatırım Limiti (TRY)
              </label>
              <input
                type="number"
                min="100"
                max="50000"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={formData['daily_deposit_limit'] || '5000'}
                onChange={(e) => handleInputChange('daily_deposit_limit', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Aylık Yatırım Limiti (TRY)
              </label>
              <input
                type="number"
                min="1000"
                max="200000"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={formData['monthly_deposit_limit'] || '50000'}
                onChange={(e) => handleInputChange('monthly_deposit_limit', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Günlük Çekim Limiti (TRY)
              </label>
              <input
                type="number"
                min="100"
                max="20000"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={formData['daily_withdrawal_limit'] || '2000'}
                onChange={(e) => handleInputChange('daily_withdrawal_limit', e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">KYC Zorunluluğu</div>
                <div className="text-gray-400 text-sm">Kimlik doğrulama zorunlu</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['kyc_required'] !== 'false'}
                  onChange={(e) => handleInputChange('kyc_required', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['kyc_required'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('kyc_required', formData['kyc_required'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['kyc_required'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <TrendingUp className="h-6 w-6 mr-2 text-purple-400" />
            VIP Sistem Ayarları
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                VIP Level 1 Gereksinimi (TRY)
              </label>
              <input
                type="number"
                min="1000"
                max="50000"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={formData['vip_level1_requirement'] || '10000'}
                onChange={(e) => handleInputChange('vip_level1_requirement', e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">Toplam yatırım miktarı</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                VIP Level 2 Gereksinimi (TRY)
              </label>
              <input
                type="number"
                min="10000"
                max="200000"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={formData['vip_level2_requirement'] || '50000'}
                onChange={(e) => handleInputChange('vip_level2_requirement', e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                VIP Level 3 Gereksinimi (TRY)
              </label>
              <input
                type="number"
                min="50000"
                max="1000000"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={formData['vip_level3_requirement'] || '250000'}
                onChange={(e) => handleInputChange('vip_level3_requirement', e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Otomatik VIP Yükseltme</div>
                <div className="text-gray-400 text-sm">Gereksinimler karşılandığında otomatik yükselt</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['auto_vip_upgrade'] !== 'false'}
                  onChange={(e) => handleInputChange('auto_vip_upgrade', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['auto_vip_upgrade'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('auto_vip_upgrade', formData['auto_vip_upgrade'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['auto_vip_upgrade'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <Bell className="h-8 w-8 mr-3 text-yellow-500" />
          Bildirim Ayarları
        </h2>
        <button
          onClick={handleSave}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
        >
          <Save className="h-5 w-5 mr-2" />
          Kaydet
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Mail className="h-6 w-6 mr-2 text-blue-400" />
            Email Bildirimleri
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Hoşgeldin Email</div>
                <div className="text-gray-400 text-sm">Yeni üyelere hoşgeldin maili</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['welcome_email_enabled'] !== 'false'}
                  onChange={(e) => handleInputChange('welcome_email_enabled', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['welcome_email_enabled'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('welcome_email_enabled', formData['welcome_email_enabled'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['welcome_email_enabled'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Promosyon Email</div>
                <div className="text-gray-400 text-sm">Kampanya ve bonus bildirimleri</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['promotion_email_enabled'] !== 'false'}
                  onChange={(e) => handleInputChange('promotion_email_enabled', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['promotion_email_enabled'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('promotion_email_enabled', formData['promotion_email_enabled'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['promotion_email_enabled'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">İşlem Bildirimleri</div>
                <div className="text-gray-400 text-sm">Yatırım/çekim onay mailleri</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['transaction_email_enabled'] !== 'false'}
                  onChange={(e) => handleInputChange('transaction_email_enabled', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['transaction_email_enabled'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('transaction_email_enabled', formData['transaction_email_enabled'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['transaction_email_enabled'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Smartphone className="h-6 w-6 mr-2 text-green-400" />
            SMS Bildirimleri
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">SMS Doğrulama</div>
                <div className="text-gray-400 text-sm">Telefon numarası doğrulama</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['sms_verification_enabled'] !== 'false'}
                  onChange={(e) => handleInputChange('sms_verification_enabled', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['sms_verification_enabled'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('sms_verification_enabled', formData['sms_verification_enabled'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['sms_verification_enabled'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">İşlem SMS</div>
                <div className="text-gray-400 text-sm">Önemli işlemler için SMS</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['transaction_sms_enabled'] !== 'false'}
                  onChange={(e) => handleInputChange('transaction_sms_enabled', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['transaction_sms_enabled'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('transaction_sms_enabled', formData['transaction_sms_enabled'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['transaction_sms_enabled'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Bonus SMS</div>
                <div className="text-gray-400 text-sm">Bonus bildirimleri SMS ile</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['bonus_sms_enabled'] !== 'false'}
                  onChange={(e) => handleInputChange('bonus_sms_enabled', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['bonus_sms_enabled'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('bonus_sms_enabled', formData['bonus_sms_enabled'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['bonus_sms_enabled'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalyticsSettings = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <BarChart3 className="h-8 w-8 mr-3 text-yellow-500" />
          Analitik Ayarları
        </h2>
        <button
          onClick={handleSave}
          className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
        >
          <Save className="h-5 w-5 mr-2" />
          Kaydet
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Activity className="h-6 w-6 mr-2 text-green-400" />
            Veri Toplama
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Kullanıcı Aktivitesi</div>
                <div className="text-gray-400 text-sm">Detaylı kullanıcı davranış analizi</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['user_analytics_enabled'] !== 'false'}
                  onChange={(e) => handleInputChange('user_analytics_enabled', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['user_analytics_enabled'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('user_analytics_enabled', formData['user_analytics_enabled'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['user_analytics_enabled'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Oyun İstatistikleri</div>
                <div className="text-gray-400 text-sm">Oyun performans metrikleri</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['game_analytics_enabled'] !== 'false'}
                  onChange={(e) => handleInputChange('game_analytics_enabled', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['game_analytics_enabled'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('game_analytics_enabled', formData['game_analytics_enabled'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['game_analytics_enabled'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Finansal Raporlar</div>
                <div className="text-gray-400 text-sm">Detaylı finansal analiz</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['financial_analytics_enabled'] !== 'false'}
                  onChange={(e) => handleInputChange('financial_analytics_enabled', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['financial_analytics_enabled'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('financial_analytics_enabled', formData['financial_analytics_enabled'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['financial_analytics_enabled'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20">
          <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
            <Database className="h-6 w-6 mr-2 text-blue-400" />
            Veri Saklama
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Veri Saklama Süresi (gün)
              </label>
              <input
                type="number"
                min="30"
                max="3650"
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                value={formData['data_retention_days'] || '365'}
                onChange={(e) => handleInputChange('data_retention_days', e.target.value)}
              />
              <p className="text-xs text-gray-400 mt-1">Kullanıcı verilerinin saklanma süresi</p>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">Otomatik Arşivleme</div>
                <div className="text-gray-400 text-sm">Eski verileri otomatik arşivle</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['auto_archiving_enabled'] !== 'false'}
                  onChange={(e) => handleInputChange('auto_archiving_enabled', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['auto_archiving_enabled'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('auto_archiving_enabled', formData['auto_archiving_enabled'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['auto_archiving_enabled'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div>
                <div className="text-white font-medium">GDPR Uyumluluğu</div>
                <div className="text-gray-400 text-sm">Avrupa veri koruma standartları</div>
              </div>
              <div className="relative inline-block w-12 mr-2 align-middle select-none">
                <input
                  type="checkbox"
                  className="sr-only"
                  checked={formData['gdpr_compliance_enabled'] !== 'false'}
                  onChange={(e) => handleInputChange('gdpr_compliance_enabled', e.target.checked ? 'true' : 'false')}
                />
                <div
                  className={`block h-6 rounded-full w-12 cursor-pointer transition-colors ${
                    formData['gdpr_compliance_enabled'] !== 'false' ? 'bg-green-500' : 'bg-gray-600'
                  }`}
                  onClick={() => handleInputChange('gdpr_compliance_enabled', formData['gdpr_compliance_enabled'] !== 'false' ? 'false' : 'true')}
                >
                  <div
                    className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                      formData['gdpr_compliance_enabled'] !== 'false' ? 'transform translate-x-6' : ''
                    }`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemSettings = () => (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold text-white flex items-center">
          <Database className="h-8 w-8 mr-3 text-yellow-500" />
          Sistem Ayarları
        </h2>
        <div className="flex gap-3">
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center">
            <RefreshCw className="h-4 w-4 mr-2" />
            Sistem Durumu
          </button>
          <button
            onClick={handleSave}
            className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-medium transition-colors flex items-center"
          >
            <Save className="h-5 w-5 mr-2" />
            Kaydet
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-green-500/20 p-3 rounded-lg mr-4">
                <Database className="h-6 w-6 text-green-400" />
              </div>
              <div>
                <div className="text-white font-semibold">Veritabanı</div>
                <div className="text-gray-400 text-sm">PostgreSQL</div>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
              Aktif
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Bağlantı:</span>
              <span className="text-green-400">Başarılı</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Son Yedek:</span>
              <span className="text-white">2 saat önce</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Boyut:</span>
              <span className="text-white">1.2 GB</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-blue-500/20 p-3 rounded-lg mr-4">
                <Activity className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <div className="text-white font-semibold">API Servisleri</div>
                <div className="text-gray-400 text-sm">REST & WebSocket</div>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
              Aktif
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Uptime:</span>
              <span className="text-green-400">99.9%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">İstek/dk:</span>
              <span className="text-white">1,247</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Yanıt Süresi:</span>
              <span className="text-white">45ms</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="bg-purple-500/20 p-3 rounded-lg mr-4">
                <Shield className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <div className="text-white font-semibold">Güvenlik</div>
                <div className="text-gray-400 text-sm">SSL & Firewall</div>
              </div>
            </div>
            <div className="px-3 py-1 rounded-full text-xs font-medium bg-green-500/20 text-green-400">
              Güvenli
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">SSL Sertifika:</span>
              <span className="text-green-400">Geçerli</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Firewall:</span>
              <span className="text-green-400">Aktif</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Son Tarama:</span>
              <span className="text-white">1 gün önce</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-800/60 backdrop-blur-sm p-6 rounded-xl border border-yellow-500/20">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
          <Settings2 className="h-6 w-6 mr-2 text-orange-400" />
          Sistem Ayarları
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Otomatik Yedekleme (saat)
            </label>
            <input
              type="number"
              min="1"
              max="168"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={formData['backup_interval_hours'] || '24'}
              onChange={(e) => handleInputChange('backup_interval_hours', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Log Temizlik (gün)
            </label>
            <input
              type="number"
              min="7"
              max="365"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={formData['log_retention_days'] || '30'}
              onChange={(e) => handleInputChange('log_retention_days', e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Cache Boyutu (MB)
            </label>
            <input
              type="number"
              min="100"
              max="10000"
              className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={formData['cache_size_mb'] || '1024'}
              onChange={(e) => handleInputChange('cache_size_mb', e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return renderGeneralSettings();
      case 'currencies':
        return renderCurrencySettings();
      case 'payment':
        return renderPaymentSettings();
      case 'api':
        return renderApiIntegrations();
      case 'security':
        return renderSecuritySettings();
      case 'games':
        return renderGameSettings();
      case 'bonuses':
        return renderBonusSettings();
      case 'users':
        return renderUserManagement();
      case 'notifications':
        return renderNotificationSettings();
      case 'analytics':
        return renderAnalyticsSettings();
      case 'design':
        return (
          <div className="text-center py-12">
            <Palette className="h-24 w-24 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-400 mb-2">Tasarım Yönetimi</h3>
            <p className="text-gray-500 mb-6">Tema ve tasarım yönetimi için /admin/themes sayfasını kullanın</p>
            <button 
              onClick={() => window.location.href = '/admin/themes'}
              className="bg-yellow-500 hover:bg-yellow-600 text-black px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Tema Yönetimine Git
            </button>
          </div>
        );
      case 'system':
        return renderSystemSettings();
      default:
        return (
          <div className="text-center py-12">
            <Settings2 className="h-24 w-24 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl text-gray-400 mb-2">{menuItems.find(item => item.id === activeTab)?.label}</h3>
            <p className="text-gray-500">Bu bölüm geliştiriliyor...</p>
          </div>
        );
    }
  };

  if (settingsLoading || currenciesLoading || paymentLoading || apiLoading) {
    return (
      <AdminLayout title="Casino Yönetim Sistemi">
        <div className="flex items-center justify-center min-h-[600px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500 mx-auto mb-4"></div>
            <div className="text-white text-lg">Casino Ayarları Yükleniyor...</div>
            <div className="text-gray-400 text-sm">Sistem verileri hazırlanıyor</div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Casino Yönetim Sistemi">
      <div className="flex flex-col lg:flex-row gap-6 h-full">
        {/* Sol Menü */}
        <div className="w-full lg:w-80 bg-gray-800/80 rounded-xl shadow-lg border border-yellow-500/20 backdrop-blur-sm hover:border-yellow-500/30 transition-all duration-300 p-6 h-fit lg:sticky lg:top-6">
          <div className="mb-6">
            <div className="text-xl font-bold text-white mb-2">Casino Yönetimi</div>
            <div className="text-gray-400 text-sm">Profesyonel ayar kategorileri</div>
          </div>
          
          {/* Arama */}
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Ayar ara..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-yellow-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <nav className="space-y-2">
            {menuItems
              .filter(item => 
                searchTerm === '' || 
                item.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.description.toLowerCase().includes(searchTerm.toLowerCase())
              )
              .map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-start p-3 rounded-lg transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/40 text-yellow-400' 
                        : 'text-gray-300 hover:bg-gray-700/50 hover:text-white border border-transparent'
                    }`}
                  >
                    <Icon className={`h-5 w-5 mr-3 mt-0.5 ${isActive ? 'text-yellow-400' : 'text-gray-400'}`} />
                    <div className="text-left">
                      <div className={`font-medium ${isActive ? 'text-yellow-400' : 'text-white'}`}>
                        {item.label}
                      </div>
                      <div className={`text-xs mt-1 ${isActive ? 'text-yellow-300/70' : 'text-gray-500'}`}>
                        {item.description}
                      </div>
                    </div>
                  </button>
                );
              })}
          </nav>
        </div>

        {/* Sağ İçerik */}
        <div className="flex-1 bg-gray-800/40 rounded-xl shadow-lg border border-yellow-500/20 backdrop-blur-sm p-6 min-h-[800px]">
          {renderContent()}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Settings;