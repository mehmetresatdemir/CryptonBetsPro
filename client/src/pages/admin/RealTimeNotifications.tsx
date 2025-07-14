import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { useQuery } from '@tanstack/react-query';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X,
  Settings,
  Send,
  Filter,
  Users,
  DollarSign,
  Shield,
  Gamepad2,
  Clock,
  Volume2,
  VolumeX,
  Zap,
  Target,
  Eye,
  Archive
} from 'lucide-react';

// Gerçek API'den bildirim verilerini çekme
const fetchRealTimeNotifications = async (): Promise<any> => {
  const response = await fetch('/api/admin/real-time-notifications', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('adminToken')}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Real-time notifications could not be fetched');
  }
  
  const result = await response.json();
  return result.data;
};

// DEPRECATED: Mock bildirim verisi
const generateNotificationData = () => {
  const notifications = [
    {
      id: 1,
      type: 'critical',
      category: 'security',
      title: 'Şüpheli Giriş Denemesi',
      message: 'IP 185.243.15.22 adresinden 5 dakika içinde 12 başarısız giriş denemesi tespit edildi.',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      read: false,
      userId: 'system',
      priority: 'high'
    },
    {
      id: 2,
      type: 'warning',
      category: 'finance',
      title: 'Büyük Para Çekme İsteği',
      message: 'Kullanıcı "premium_player_123" 50.000₺ para çekme isteği oluşturdu.',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      read: false,
      userId: 'finance_team',
      priority: 'medium'
    },
    {
      id: 3,
      type: 'info',
      category: 'games',
      title: 'Yeni Oyun Eklendi',
      message: 'Pragmatic Play - "Sugar Rush" oyunu başarıyla sisteme entegre edildi.',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: true,
      userId: 'admin',
      priority: 'low'
    },
    {
      id: 4,
      type: 'success',
      category: 'system',
      title: 'Sistem Güncelleme Tamamlandı',
      message: 'v2.4.1 güncellemesi başarıyla uygulandı. Tüm sistemler normal çalışıyor.',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: true,
      userId: 'system',
      priority: 'low'
    },
    {
      id: 5,
      type: 'critical',
      category: 'performance',
      title: 'Yüksek CPU Kullanımı',
      message: 'Sunucu CPU kullanımı %85\'e ulaştı. Performans izleme devrede.',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      read: false,
      userId: 'tech_team',
      priority: 'high'
    }
  ];

  const stats = {
    total: notifications.length,
    unread: notifications.filter(n => !n.read).length,
    critical: notifications.filter(n => n.type === 'critical').length,
    today: notifications.filter(n => {
      const today = new Date();
      const notifDate = new Date(n.timestamp);
      return today.toDateString() === notifDate.toDateString();
    }).length
  };

  const alertRules = [
    {
      id: 1,
      name: 'Güvenlik Uyarıları',
      category: 'security',
      condition: 'Başarısız giriş > 5',
      action: 'E-posta + SMS',
      enabled: true,
      priority: 'high'
    },
    {
      id: 2,
      name: 'Büyük İşlemler',
      category: 'finance',
      condition: 'Para çekme > 10.000₺',
      action: 'Admin bildirimi',
      enabled: true,
      priority: 'medium'
    },
    {
      id: 3,
      name: 'Sistem Performansı',
      category: 'performance',
      condition: 'CPU > 80% veya RAM > 90%',
      action: 'Slack + E-posta',
      enabled: true,
      priority: 'high'
    },
    {
      id: 4,
      name: 'Oyun Hataları',
      category: 'games',
      condition: 'Hata oranı > 2%',
      action: 'Geliştirici bildirimi',
      enabled: false,
      priority: 'medium'
    }
  ];

  return { notifications, stats, alertRules };
};

const RealTimeNotifications: React.FC = () => {
  const { translate } = useLanguage() || { t: (key: string, fallback?: string) => fallback || key };
  const [filter, setFilter] = useState('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notificationData, setNotificationData] = useState<any>(null);
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    category: 'general',
    priority: 'medium'
  });

  // Gerçek API çağrısı ile bildirim verilerini çekme
  const { data: realTimeData, isLoading, error, refetch } = useQuery({
    queryKey: ['/api/admin/real-time-notifications'],
    queryFn: fetchRealTimeNotifications,
    refetchInterval: 30000, // 30 saniyede bir yenile
    retry: 2,
    onSuccess: (data) => {
      setNotificationData(data);
    }
  });

  // İlk yükleme için fallback data
  React.useEffect(() => {
    if (realTimeData && !notificationData) {
      setNotificationData(realTimeData);
    }
  }, [realTimeData, notificationData]);

  // Manual refresh
  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-yellow-500"></div>
            <p className="text-gray-400">Gerçek PostgreSQL bildirim verileri yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="flex flex-col items-center space-y-4">
            <p className="text-red-400">Bildirim verileri yüklenirken hata oluştu</p>
            <Button onClick={handleRefresh} className="bg-yellow-600 hover:bg-yellow-700">
              Tekrar Dene
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (!notificationData) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-gray-400">Bildirim verisi bulunamadı</p>
        </div>
      </AdminLayout>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'critical': return 'border-red-500 bg-red-900/20';
      case 'warning': return 'border-yellow-500 bg-yellow-900/20';
      case 'success': return 'border-green-500 bg-green-900/20';
      default: return 'border-blue-500 bg-blue-900/20';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'security': return <Shield className="w-4 h-4" />;
      case 'finance': return <DollarSign className="w-4 h-4" />;
      case 'games': return <Gamepad2 className="w-4 h-4" />;
      case 'performance': return <Zap className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const filteredNotifications = (notificationData?.notifications || []).filter((notif: any) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !notif.read;
    return notif.type === filter;
  });

  const markAsRead = (id: number) => {
    setNotificationData((prev: any) => ({
      ...prev,
      notifications: prev.notifications.map((n: any) => 
        n.id === id ? { ...n, read: true } : n
      ),
      stats: {
        ...prev.stats,
        unread: prev.stats.unread - 1
      }
    }));
  };

  const sendNotification = () => {
    const notification = {
      id: Date.now(),
      ...newNotification,
      timestamp: new Date(),
      read: false,
      userId: 'admin'
    };

    setNotificationData((prev: any) => ({
      ...prev,
      notifications: [notification, ...prev.notifications],
      stats: {
        ...prev.stats,
        total: prev.stats.total + 1,
        unread: prev.stats.unread + 1
      }
    }));

    setNewNotification({
      title: '',
      message: '',
      type: 'info',
      category: 'general',
      priority: 'medium'
    });
  };

  return (
    <AdminLayout>
      <div className="space-y-6 p-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              Gerçek Zamanlı Bildirimler
              <Badge className="ml-3 bg-green-500/20 text-green-400 border-green-500/30">
                Gerçek Veri
              </Badge>
            </h1>
            <p className="text-gray-400 mt-2">PostgreSQL tabanlı sistem bildirimleri ve uyarı yönetimi</p>
            <div className="flex items-center mt-2 space-x-4">
              <span className="text-sm text-gray-500">
                Son güncelleme: {new Date().toLocaleTimeString('tr-TR')}
              </span>
              {notificationData?.metadata && (
                <span className="text-sm text-gray-500">
                  {notificationData.metadata.totalDataPoints} veri noktası
                </span>
              )}
            </div>
          </div>
          <div className="flex space-x-3">
            <Button onClick={handleRefresh} className="bg-yellow-600 hover:bg-yellow-700">
              <Bell className="w-4 h-4 mr-2" />
              Yenile
            </Button>
            <Button
              variant="outline"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="border-gray-600"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 mr-2" /> : <VolumeX className="w-4 h-4 mr-2" />}
              Ses {soundEnabled ? 'Açık' : 'Kapalı'}
            </Button>
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[180px] bg-gray-800 border-gray-700">
                <SelectValue placeholder="Filtrele" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tümü</SelectItem>
                <SelectItem value="unread">Okunmamış</SelectItem>
                <SelectItem value="critical">Kritik</SelectItem>
                <SelectItem value="warning">Uyarı</SelectItem>
                <SelectItem value="info">Bilgi</SelectItem>
                <SelectItem value="success">Başarılı</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* İstatistikler */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-r from-blue-900/20 to-blue-800/20 border-blue-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-blue-400">Toplam Bildirim</CardTitle>
              <Bell className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{notificationData?.stats?.total || 0}</div>
              <p className="text-xs text-blue-300">PostgreSQL - Son 24 saat</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-yellow-900/20 to-yellow-800/20 border-yellow-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-yellow-400">Okunmamış</CardTitle>
              <Eye className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{notificationData?.stats?.unread || 0}</div>
              <p className="text-xs text-yellow-300">Gerçek işlem bildirimleri</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-900/20 to-red-800/20 border-red-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-red-400">Kritik Uyarılar</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{notificationData?.stats?.critical || 0}</div>
              <p className="text-xs text-red-300">Yüksek tutarlı işlemler</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-green-900/20 to-green-800/20 border-green-700/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-green-400">Bugün</CardTitle>
              <Clock className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{notificationData?.stats?.today || 0}</div>
              <p className="text-xs text-green-300">Bugünkü authentic data</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="notifications" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800">
            <TabsTrigger value="notifications">Bildirimler</TabsTrigger>
            <TabsTrigger value="rules">Uyarı Kuralları</TabsTrigger>
            <TabsTrigger value="send">Bildirim Gönder</TabsTrigger>
          </TabsList>

          <TabsContent value="notifications" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Bell className="w-5 h-5 mr-2 text-yellow-500" />
                  Bildirim Listesi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredNotifications.map((notification: any) => (
                    <div 
                      key={notification.id} 
                      className={`p-4 rounded-lg border ${getTypeColor(notification.type)} ${!notification.read ? 'ring-2 ring-yellow-500/20' : ''}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 mt-1">
                            {getTypeIcon(notification.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-white">{notification.title}</h4>
                              {!notification.read && (
                                <Badge variant="secondary" className="bg-yellow-800/30 text-yellow-300 text-xs">
                                  Yeni
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {getCategoryIcon(notification.category)}
                                <span className="ml-1 capitalize">{notification.category}</span>
                              </Badge>
                            </div>
                            <p className="text-gray-300 text-sm mb-2">{notification.message}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-400">
                              <span>{new Date(notification.timestamp).toLocaleTimeString('tr-TR')}</span>
                              <span>Öncelik: {notification.priority}</span>
                              <span>Gönderen: {notification.userId}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          {!notification.read && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markAsRead(notification.id)}
                            >
                              Okundu İşaretle
                            </Button>
                          )}
                          <Button size="sm" variant="outline">
                            <Archive className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="rules" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Settings className="w-5 h-5 mr-2 text-blue-500" />
                  Otomatik Uyarı Kuralları
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(notificationData?.alertRules || []).map((rule: any) => (
                    <div key={rule.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-semibold text-white">{rule.name}</h4>
                          <Badge 
                            variant="outline"
                            className={
                              rule.priority === 'high' ? 'border-red-500 text-red-400' :
                              rule.priority === 'medium' ? 'border-yellow-500 text-yellow-400' :
                              'border-green-500 text-green-400'
                            }
                          >
                            {rule.priority} öncelik
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-400">Kategori:</p>
                            <p className="text-white capitalize">{rule.category}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Koşul:</p>
                            <p className="text-white">{rule.condition}</p>
                          </div>
                          <div>
                            <p className="text-gray-400">Eylem:</p>
                            <p className="text-white">{rule.action}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <Switch 
                          checked={rule.enabled}
                          onCheckedChange={() => {
                            // Rule enable/disable logic
                          }}
                        />
                        <Button size="sm" variant="outline">
                          Düzenle
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6">
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    <Target className="w-4 h-4 mr-2" />
                    Yeni Kural Ekle
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="send" className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Send className="w-5 h-5 mr-2 text-green-500" />
                  Manuel Bildirim Gönder
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-gray-300">Başlık</Label>
                    <Input
                      id="title"
                      value={newNotification.title}
                      onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                      placeholder="Bildirim başlığı"
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-gray-300">Tip</Label>
                    <Select value={newNotification.type} onValueChange={(value) => setNewNotification({...newNotification, type: value})}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Bilgi</SelectItem>
                        <SelectItem value="warning">Uyarı</SelectItem>
                        <SelectItem value="critical">Kritik</SelectItem>
                        <SelectItem value="success">Başarılı</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-gray-300">Kategori</Label>
                    <Select value={newNotification.category} onValueChange={(value) => setNewNotification({...newNotification, category: value})}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Genel</SelectItem>
                        <SelectItem value="security">Güvenlik</SelectItem>
                        <SelectItem value="finance">Finans</SelectItem>
                        <SelectItem value="games">Oyunlar</SelectItem>
                        <SelectItem value="system">Sistem</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="priority" className="text-gray-300">Öncelik</Label>
                    <Select value={newNotification.priority} onValueChange={(value) => setNewNotification({...newNotification, priority: value})}>
                      <SelectTrigger className="bg-gray-700 border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Düşük</SelectItem>
                        <SelectItem value="medium">Orta</SelectItem>
                        <SelectItem value="high">Yüksek</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message" className="text-gray-300">Mesaj</Label>
                  <Textarea
                    id="message"
                    value={newNotification.message}
                    onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                    placeholder="Bildirim mesajı..."
                    className="bg-gray-700 border-gray-600 text-white min-h-[100px]"
                  />
                </div>

                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => setNewNotification({
                      title: '',
                      message: '',
                      type: 'info',
                      category: 'general',
                      priority: 'medium'
                    })}
                  >
                    Temizle
                  </Button>
                  <Button 
                    className="bg-green-600 hover:bg-green-700"
                    onClick={sendNotification}
                    disabled={!newNotification.title || !newNotification.message}
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Gönder
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default RealTimeNotifications;