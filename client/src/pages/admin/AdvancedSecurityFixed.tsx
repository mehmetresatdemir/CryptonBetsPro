import React, { useState } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Shield, 
  AlertTriangle, 
  Ban, 
  Key, 
  Activity, 
  Settings, 
  Eye, 
  Clock, 
  MapPin,
  User,
  Globe,
  Lock,
  Plus,
  Trash2,
  RefreshCw,
  TrendingUp,
  CheckCircle,
  XCircle,
  UserX,
  Search,
  Filter,
  Download
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import AdminLayout from '@/components/admin/AdminLayout';

interface SecurityEvent {
  id: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  ip_address: string;
  username?: string;
  timestamp: string;
  details?: string;
}

interface LoginAttempt {
  id: number;
  username: string;
  ip_address: string;
  success: boolean;
  timestamp: string;
  country?: string;
  city?: string;
}

interface SecuritySettings {
  max_login_attempts: number;
  lockout_duration: number;
  session_timeout: number;
  require_2fa: boolean;
  ip_whitelist_enabled: boolean;
  suspicious_activity_alerts: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
}

interface SecurityStats {
  overview: {
    totalUsers: number;
    activeUsers24h: number;
    newUsers24h: number;
    totalTransactions: number;
    successfulTransactions: number;
    failedTransactions: number;
    transactions24h: number;
    totalBets: number;
    bets24h: number;
    highRiskBets: number;
  };
  security: {
    alertLevel: string;
    threatsBlocked: number;
    suspiciousActivities: number;
    failedLogins: number;
  };
  riskMetrics: {
    highValueTransactions: number;
    multipleAccountUsers: number;
    vpnUsers: number;
    newDeviceLogins: number;
  };
}

const AdvancedSecurityFixed = () => {
  const { language } = useLanguage();
  const [newIpAddress, setNewIpAddress] = useState('');
  const [newBlockReason, setNewBlockReason] = useState('');
  const [isAddingBlock, setIsAddingBlock] = useState(false);
  const [eventFilter, setEventFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [settingsData, setSettingsData] = useState<SecuritySettings>({
    max_login_attempts: 5,
    lockout_duration: 30,
    session_timeout: 120,
    require_2fa: false,
    ip_whitelist_enabled: false,
    suspicious_activity_alerts: true,
    email_notifications: true,
    sms_notifications: false
  });
  const queryClient = useQueryClient();

  // Fetch security stats with real database data
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<{ success: boolean; data: SecurityStats }>({
    queryKey: ['/api/admin/security/stats'],
    refetchInterval: 30000,
    retry: 1
  });

  // Fetch security events
  const { data: eventsData, isLoading: eventsLoading } = useQuery<{ success: boolean; data: SecurityEvent[] }>({
    queryKey: ['/api/admin/security/events'],
    refetchInterval: 15000,
    retry: 1
  });

  // Fetch login attempts
  const { data: loginAttemptsData, isLoading: attemptsLoading } = useQuery<{ success: boolean; data: LoginAttempt[] }>({
    queryKey: ['/api/admin/security/login-attempts'],
    retry: 1
  });

  // Fetch IP blocks
  const { data: ipBlocksData, isLoading: blocksLoading } = useQuery<{ success: boolean; data: any[] }>({
    queryKey: ['/api/admin/security/ip-blocks'],
    retry: 1
  });

  // Fetch security settings
  const { data: settingsResponse } = useQuery<{ success: boolean; data: SecuritySettings }>({
    queryKey: ['/api/admin/security/settings'],
    onSuccess: (data) => {
      if (data?.success && data.data) {
        setSettingsData(data.data);
      }
    },
    retry: 1
  });

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<SecuritySettings>) => {
      const response = await fetch('/api/admin/security/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (!response.ok) throw new Error('Ayarlar güncellenemedi');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Güvenlik ayarları güncellendi",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/security/settings'] });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Ayarlar güncellenirken bir hata oluştu",
        variant: "destructive"
      });
    }
  });

  const handleSettingChange = (key: keyof SecuritySettings, value: any) => {
    const newSettings = { ...settingsData, [key]: value };
    setSettingsData(newSettings);
    updateSettingsMutation.mutate({ [key]: value });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getAlertLevelColor = (level: string) => {
    switch (level) {
      case 'HIGH': return 'text-red-400 bg-red-500/20';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20';
      case 'LOW': return 'text-green-400 bg-green-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  const events = eventsData?.data || [];
  const loginAttempts = loginAttemptsData?.data || [];
  const ipBlocks = ipBlocksData?.data || [];
  const securityStats = stats?.data;

  const filteredEvents = events.filter(event => {
    const matchesSearch = !searchTerm || 
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.ip_address.includes(searchTerm);
    
    const matchesType = eventFilter === 'all' || event.type === eventFilter;
    const matchesSeverity = severityFilter === 'all' || event.severity === severityFilter;
    
    return matchesSearch && matchesType && matchesSeverity;
  });

  const filteredLoginAttempts = loginAttempts.filter(attempt => {
    const matchesSearch = !searchTerm || 
      attempt.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      attempt.ip_address.includes(searchTerm);
    
    return matchesSearch;
  });

  if (statsLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <RefreshCw className="h-8 w-8 animate-spin text-yellow-500" />
          <span className="ml-2 text-white">Güvenlik verileri yükleniyor...</span>
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
            <h1 className="text-3xl font-bold text-white mb-2">Gelişmiş Güvenlik Merkezi</h1>
            <p className="text-gray-400">Gerçek zamanlı güvenlik izleme ve yönetim sistemi</p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="text-green-400 border-green-400">
              Gerçek Veri
            </Badge>
            <Badge variant="outline" className="text-blue-400 border-blue-400">
              PostgreSQL
            </Badge>
          </div>
        </div>

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-gray-800/60 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Güvenlik Seviyesi</p>
                  <p className={`text-lg font-bold ${getAlertLevelColor(securityStats?.security?.alertLevel || 'LOW')}`}>
                    {securityStats?.security?.alertLevel || 'LOW'}
                  </p>
                </div>
                <Shield className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/60 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Aktif Kullanıcılar (24s)</p>
                  <p className="text-lg font-bold text-blue-400">
                    {securityStats?.overview?.activeUsers24h || 0}
                  </p>
                </div>
                <Activity className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/60 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Yüksek Risk Bahisler</p>
                  <p className="text-lg font-bold text-orange-400">
                    {securityStats?.overview?.highRiskBets || 0}
                  </p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/60 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Başarılı İşlemler</p>
                  <p className="text-lg font-bold text-green-400">
                    {securityStats?.overview?.successfulTransactions || 0}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5 bg-gray-800/60">
            <TabsTrigger value="overview" className="text-white">Genel Bakış</TabsTrigger>
            <TabsTrigger value="events" className="text-white">Güvenlik Olayları</TabsTrigger>
            <TabsTrigger value="logins" className="text-white">Giriş Denemeleri</TabsTrigger>
            <TabsTrigger value="blocks" className="text-white">IP Engelleri</TabsTrigger>
            <TabsTrigger value="settings" className="text-white">Ayarlar</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/60 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2 text-green-400" />
                    Kullanıcı İstatistikleri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Toplam Kullanıcılar</span>
                    <span className="text-white font-bold">{securityStats?.overview?.totalUsers || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Yeni Kullanıcılar (24s)</span>
                    <span className="text-green-400 font-bold">{securityStats?.overview?.newUsers24h || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Aktif Kullanıcılar (24s)</span>
                    <span className="text-blue-400 font-bold">{securityStats?.overview?.activeUsers24h || 0}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/60 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white flex items-center">
                    <Activity className="h-5 w-5 mr-2 text-orange-400" />
                    İşlem İstatistikleri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Toplam İşlemler</span>
                    <span className="text-white font-bold">{securityStats?.overview?.totalTransactions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Başarılı İşlemler</span>
                    <span className="text-green-400 font-bold">{securityStats?.overview?.successfulTransactions || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-400">Başarısız İşlemler</span>
                    <span className="text-red-400 font-bold">{securityStats?.overview?.failedTransactions || 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Events Tab */}
          <TabsContent value="events" className="space-y-4">
            <Card className="bg-gray-800/60 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Eye className="h-5 w-5 mr-2 text-blue-400" />
                  Güvenlik Olayları ({events.length})
                </CardTitle>
                <div className="flex space-x-2 mt-4">
                  <Input
                    placeholder="Arama..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-40 bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="all">Tüm Seviyeler</SelectItem>
                      <SelectItem value="critical">Kritik</SelectItem>
                      <SelectItem value="high">Yüksek</SelectItem>
                      <SelectItem value="medium">Orta</SelectItem>
                      <SelectItem value="low">Düşük</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {eventsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-yellow-500 mr-2" />
                    <span className="text-gray-400">Olaylar yükleniyor...</span>
                  </div>
                ) : filteredEvents.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Shield className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Güvenlik olayı bulunamadı</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredEvents.slice(0, 20).map((event) => (
                      <div key={event.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Badge className={getSeverityColor(event.severity)}>
                            {event.severity.toUpperCase()}
                          </Badge>
                          <div>
                            <p className="text-white font-medium">{event.description}</p>
                            <p className="text-sm text-gray-400">
                              {event.username && `${event.username} • `}
                              {event.ip_address} • {format(new Date(event.timestamp), 'dd.MM.yyyy HH:mm', { locale: tr })}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Login Attempts Tab */}
          <TabsContent value="logins" className="space-y-4">
            <Card className="bg-gray-800/60 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Key className="h-5 w-5 mr-2 text-green-400" />
                  Giriş Denemeleri ({loginAttempts.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {attemptsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-yellow-500 mr-2" />
                    <span className="text-gray-400">Giriş denemeleri yükleniyor...</span>
                  </div>
                ) : filteredLoginAttempts.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Key className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Giriş denemesi bulunamadı</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredLoginAttempts.slice(0, 20).map((attempt) => (
                      <div key={attempt.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {attempt.success ? (
                            <CheckCircle className="h-5 w-5 text-green-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-400" />
                          )}
                          <div>
                            <p className="text-white font-medium">{attempt.username}</p>
                            <p className="text-sm text-gray-400">
                              {attempt.ip_address} • {format(new Date(attempt.timestamp), 'dd.MM.yyyy HH:mm', { locale: tr })}
                            </p>
                          </div>
                        </div>
                        <Badge variant={attempt.success ? "default" : "destructive"}>
                          {attempt.success ? "Başarılı" : "Başarısız"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* IP Blocks Tab */}
          <TabsContent value="blocks" className="space-y-4">
            <Card className="bg-gray-800/60 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Ban className="h-5 w-5 mr-2 text-red-400" />
                  IP Engelleri ({ipBlocks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {blocksLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <RefreshCw className="h-6 w-6 animate-spin text-yellow-500 mr-2" />
                    <span className="text-gray-400">IP engelleri yükleniyor...</span>
                  </div>
                ) : ipBlocks.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Ban className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Şu anda engellenmiş IP adresi bulunmuyor</p>
                    <p className="text-sm mt-2">Güvenlik sistemi aktif olarak izleme yapıyor</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {ipBlocks.map((block: any) => (
                      <div key={block.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{block.ip_address}</p>
                          <p className="text-sm text-gray-400">{block.reason}</p>
                        </div>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card className="bg-gray-800/60 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="h-5 w-5 mr-2 text-blue-400" />
                  Güvenlik Ayarları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-white">Maksimum Giriş Denemesi</Label>
                      <Input
                        type="number"
                        value={settingsData.max_login_attempts}
                        onChange={(e) => handleSettingChange('max_login_attempts', parseInt(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Kilitleme Süresi (dakika)</Label>
                      <Input
                        type="number"
                        value={settingsData.lockout_duration}
                        onChange={(e) => handleSettingChange('lockout_duration', parseInt(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-white">Oturum Zaman Aşımı (dakika)</Label>
                      <Input
                        type="number"
                        value={settingsData.session_timeout}
                        onChange={(e) => handleSettingChange('session_timeout', parseInt(e.target.value))}
                        className="bg-gray-700 border-gray-600 text-white mt-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-white">İki Faktörlü Doğrulama Zorunlu</Label>
                      <Switch
                        checked={settingsData.require_2fa}
                        onCheckedChange={(checked) => handleSettingChange('require_2fa', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">Şüpheli Aktivite Uyarıları</Label>
                      <Switch
                        checked={settingsData.suspicious_activity_alerts}
                        onCheckedChange={(checked) => handleSettingChange('suspicious_activity_alerts', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">E-posta Bildirimleri</Label>
                      <Switch
                        checked={settingsData.email_notifications}
                        onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-white">SMS Bildirimleri</Label>
                      <Switch
                        checked={settingsData.sms_notifications}
                        onCheckedChange={(checked) => handleSettingChange('sms_notifications', checked)}
                      />
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

export default AdvancedSecurityFixed;