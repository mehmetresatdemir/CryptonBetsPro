import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Shield, 
  Lock, 
  AlertTriangle, 
  UserCheck, 
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  User,
  Globe,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Settings,
  KeyRound,
  ShieldAlert,
  Mail
} from 'lucide-react';

// Güvenlik ayarları tipi
type SecuritySettings = {
  twoFactorAuth: boolean;
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
    passwordExpireDays: number;
    preventPasswordReuse: boolean;
  };
  loginAttempts: {
    maxAttempts: number;
    lockoutDuration: number;
    trackIpAddress: boolean;
  };
  sessionSettings: {
    sessionTimeout: number;
    enforceOneSession: boolean;
    rememberMeEnabled: boolean;
  };
  ipRestrictions: {
    whitelistEnabled: boolean;
    whitelistedIps: string[];
    blacklistEnabled: boolean;
    blacklistedIps: string[];
  };
};

// Güvenlik olayı tipi
type SecurityEvent = {
  id: number;
  type: string;
  description: string;
  username: string;
  ipAddress: string;
  timestamp: string;
  status: 'success' | 'warning' | 'critical';
  resolved: boolean;
};

const Security: React.FC = () => {
  const { translate } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('settings');
  const [showPassword, setShowPassword] = useState(false);
  const [newIpAddress, setNewIpAddress] = useState('');
  
  // Örnek güvenlik ayarları
  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorAuth: true,
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordExpireDays: 90,
      preventPasswordReuse: true,
    },
    loginAttempts: {
      maxAttempts: 5,
      lockoutDuration: 30,
      trackIpAddress: true,
    },
    sessionSettings: {
      sessionTimeout: 60,
      enforceOneSession: false,
      rememberMeEnabled: true,
    },
    ipRestrictions: {
      whitelistEnabled: false,
      whitelistedIps: ['127.0.0.1', '192.168.1.1'],
      blacklistEnabled: true,
      blacklistedIps: ['45.227.255.206', '103.102.153.147'],
    }
  });
  
  // Örnek güvenlik olayları
  const securityEvents: SecurityEvent[] = [
    {
      id: 1,
      type: 'login_attempt',
      description: 'Başarısız giriş denemesi',
      username: 'user123',
      ipAddress: '45.227.255.206',
      timestamp: '2023-05-20 14:32:15',
      status: 'warning',
      resolved: true
    },
    {
      id: 2,
      type: 'login_attempt',
      description: 'Başarısız giriş denemesi (5. deneme)',
      username: 'admin',
      ipAddress: '103.102.153.147',
      timestamp: '2023-05-20 14:35:22',
      status: 'critical',
      resolved: true
    },
    {
      id: 3,
      type: 'account_locked',
      description: 'Çok sayıda başarısız giriş nedeniyle hesap kilitlendi',
      username: 'admin',
      ipAddress: '103.102.153.147',
      timestamp: '2023-05-20 14:35:30',
      status: 'critical',
      resolved: true
    },
    {
      id: 4,
      type: 'ip_blocked',
      description: 'Şüpheli aktivite nedeniyle IP adresi engellendi',
      username: '-',
      ipAddress: '103.102.153.147',
      timestamp: '2023-05-20 14:36:01',
      status: 'success',
      resolved: true
    },
    {
      id: 5,
      type: 'password_change',
      description: 'Şifre değiştirildi',
      username: 'superuser',
      ipAddress: '192.168.1.1',
      timestamp: '2023-05-20 15:10:45',
      status: 'success',
      resolved: true
    },
    {
      id: 6,
      type: 'login_attempt',
      description: 'Başarısız giriş denemesi (Kilitli hesaba)',
      username: 'admin',
      ipAddress: '45.227.255.206',
      timestamp: '2023-05-20 15:45:12',
      status: 'warning',
      resolved: false
    },
    {
      id: 7,
      type: 'suspicious_activity',
      description: 'API anahtarı için çok sayıda istek',
      username: 'api_user',
      ipAddress: '185.172.129.10',
      timestamp: '2023-05-20 16:03:27',
      status: 'warning',
      resolved: false
    },
    {
      id: 8,
      type: '2fa_setup',
      description: '2FA etkinleştirildi',
      username: 'manager1',
      ipAddress: '192.168.1.5',
      timestamp: '2023-05-20 16:15:33',
      status: 'success',
      resolved: true
    }
  ];
  
  // Güvenlik ayarlarını kaydetme işlevi
  const handleSaveSettings = () => {
    toast({
      title: "Güvenlik Ayarları Kaydedildi",
      description: "Güvenlik ayarları başarıyla güncellendi.",
    });
  };
  
  // Olay çözüldü olarak işaretleme işlevi
  const handleResolveEvent = (eventId: number) => {
    toast({
      title: "Olay Çözüldü",
      description: `${eventId} ID'li güvenlik olayı çözüldü olarak işaretlendi.`,
    });
  };
  
  // Beyaz listeye IP ekleme
  const handleAddWhitelistIp = () => {
    if (!newIpAddress) return;
    
    if (!validateIpAddress(newIpAddress)) {
      toast({
        title: "Geçersiz IP Adresi",
        description: "Lütfen geçerli bir IPv4 adresi girin.",
        variant: "destructive",
      });
      return;
    }
    
    setSecuritySettings({
      ...securitySettings,
      ipRestrictions: {
        ...securitySettings.ipRestrictions,
        whitelistedIps: [...securitySettings.ipRestrictions.whitelistedIps, newIpAddress]
      }
    });
    
    setNewIpAddress('');
    
    toast({
      title: "IP Adresi Eklendi",
      description: `${newIpAddress} beyaz listeye eklendi.`,
    });
  };
  
  // Kara listeye IP ekleme
  const handleAddBlacklistIp = () => {
    if (!newIpAddress) return;
    
    if (!validateIpAddress(newIpAddress)) {
      toast({
        title: "Geçersiz IP Adresi",
        description: "Lütfen geçerli bir IPv4 adresi girin.",
        variant: "destructive",
      });
      return;
    }
    
    setSecuritySettings({
      ...securitySettings,
      ipRestrictions: {
        ...securitySettings.ipRestrictions,
        blacklistedIps: [...securitySettings.ipRestrictions.blacklistedIps, newIpAddress]
      }
    });
    
    setNewIpAddress('');
    
    toast({
      title: "IP Adresi Eklendi",
      description: `${newIpAddress} kara listeye eklendi.`,
    });
  };
  
  // IP adresi doğrulama
  const validateIpAddress = (ip: string) => {
    const regex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return regex.test(ip);
  };
  
  // IP adresi kaldırma (hem beyaz hem kara liste için)
  const handleRemoveIp = (ip: string, listType: 'whitelist' | 'blacklist') => {
    if (listType === 'whitelist') {
      setSecuritySettings({
        ...securitySettings,
        ipRestrictions: {
          ...securitySettings.ipRestrictions,
          whitelistedIps: securitySettings.ipRestrictions.whitelistedIps.filter(item => item !== ip)
        }
      });
    } else {
      setSecuritySettings({
        ...securitySettings,
        ipRestrictions: {
          ...securitySettings.ipRestrictions,
          blacklistedIps: securitySettings.ipRestrictions.blacklistedIps.filter(item => item !== ip)
        }
      });
    }
    
    toast({
      title: "IP Adresi Kaldırıldı",
      description: `${ip} ${listType === 'whitelist' ? 'beyaz' : 'kara'} listeden kaldırıldı.`,
    });
  };
  
  // Olay durumu göstergesi
  const getEventStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500">Başarılı</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-500 text-black">Uyarı</Badge>;
      case 'critical':
        return <Badge className="bg-red-500">Kritik</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <AdminLayout title="Güvenlik Ayarları">
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Güvenlik Ayarları</h1>
            <p className="text-gray-400">Sistem güvenliği ayarlarını yapılandırın ve güvenlik olaylarını izleyin</p>
          </div>
          
          {activeTab === 'settings' && (
            <Button 
              onClick={handleSaveSettings} 
              className="bg-yellow-500 hover:bg-yellow-600 text-black flex items-center gap-2"
            >
              <Save size={16} />
              Ayarları Kaydet
            </Button>
          )}
        </div>
        
        <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-gray-800 border-b border-gray-700 mb-6 w-full md:w-auto justify-start">
            <TabsTrigger 
              value="settings" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              Güvenlik Ayarları
            </TabsTrigger>
            <TabsTrigger 
              value="logs" 
              className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
            >
              Güvenlik Günlüğü
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="settings" className="space-y-6">
            {/* İki Faktörlü Kimlik Doğrulama */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Shield className="h-5 w-5 text-yellow-500" />
                  İki Faktörlü Kimlik Doğrulama (2FA)
                </CardTitle>
                <CardDescription>
                  Admin ve kullanıcı hesapları için ek güvenlik katmanı
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="twoFactorAuth"
                    checked={securitySettings.twoFactorAuth}
                    onCheckedChange={(checked) => setSecuritySettings({
                      ...securitySettings, 
                      twoFactorAuth: checked
                    })}
                  />
                  <label htmlFor="twoFactorAuth" className="text-white">
                    İki Faktörlü Kimlik Doğrulama Zorunlu
                  </label>
                </div>
                
                <div className="bg-gray-900 rounded-md p-4 border border-gray-700">
                  <p className="text-sm text-gray-300">
                    İki faktörlü kimlik doğrulama etkinleştirildiğinde, tüm admin kullanıcılarının oturum açma 
                    işlemlerinde şifrelerine ek olarak SMS, e-posta veya kimlik doğrulama uygulaması aracılığıyla 
                    bir doğrulama kodu girmesi gerekecektir.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Şifre Politikası */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Lock className="h-5 w-5 text-yellow-500" />
                  Şifre Politikası
                </CardTitle>
                <CardDescription>
                  Kullanıcı şifreleri için güvenlik gereksinimleri
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Minimum Şifre Uzunluğu
                    </label>
                    <Input 
                      type="number"
                      min={6}
                      max={32}
                      value={securitySettings.passwordPolicy.minLength}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        passwordPolicy: {
                          ...securitySettings.passwordPolicy,
                          minLength: parseInt(e.target.value)
                        }
                      })}
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Şifre Geçerlilik Süresi (Gün)
                    </label>
                    <Input 
                      type="number"
                      min={0}
                      max={365}
                      value={securitySettings.passwordPolicy.passwordExpireDays}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        passwordPolicy: {
                          ...securitySettings.passwordPolicy,
                          passwordExpireDays: parseInt(e.target.value)
                        }
                      })}
                      className="bg-gray-900 border-gray-700"
                    />
                    <p className="text-xs text-gray-400 mt-1">0 = Süresiz</p>
                  </div>
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="requireUppercase"
                      checked={securitySettings.passwordPolicy.requireUppercase}
                      onCheckedChange={(checked) => setSecuritySettings({
                        ...securitySettings,
                        passwordPolicy: {
                          ...securitySettings.passwordPolicy,
                          requireUppercase: checked
                        }
                      })}
                    />
                    <label htmlFor="requireUppercase" className="text-white">
                      En az bir büyük harf gerektir (A-Z)
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="requireLowercase"
                      checked={securitySettings.passwordPolicy.requireLowercase}
                      onCheckedChange={(checked) => setSecuritySettings({
                        ...securitySettings,
                        passwordPolicy: {
                          ...securitySettings.passwordPolicy,
                          requireLowercase: checked
                        }
                      })}
                    />
                    <label htmlFor="requireLowercase" className="text-white">
                      En az bir küçük harf gerektir (a-z)
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="requireNumbers"
                      checked={securitySettings.passwordPolicy.requireNumbers}
                      onCheckedChange={(checked) => setSecuritySettings({
                        ...securitySettings,
                        passwordPolicy: {
                          ...securitySettings.passwordPolicy,
                          requireNumbers: checked
                        }
                      })}
                    />
                    <label htmlFor="requireNumbers" className="text-white">
                      En az bir rakam gerektir (0-9)
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="requireSpecialChars"
                      checked={securitySettings.passwordPolicy.requireSpecialChars}
                      onCheckedChange={(checked) => setSecuritySettings({
                        ...securitySettings,
                        passwordPolicy: {
                          ...securitySettings.passwordPolicy,
                          requireSpecialChars: checked
                        }
                      })}
                    />
                    <label htmlFor="requireSpecialChars" className="text-white">
                      En az bir özel karakter gerektir (!@#$%^&*)
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="preventPasswordReuse"
                      checked={securitySettings.passwordPolicy.preventPasswordReuse}
                      onCheckedChange={(checked) => setSecuritySettings({
                        ...securitySettings,
                        passwordPolicy: {
                          ...securitySettings.passwordPolicy,
                          preventPasswordReuse: checked
                        }
                      })}
                    />
                    <label htmlFor="preventPasswordReuse" className="text-white">
                      Son 5 şifrenin yeniden kullanımını engelle
                    </label>
                  </div>
                </div>
                
                <div className="bg-gray-900 rounded-md p-4 border border-gray-700 mt-4">
                  <div className="text-sm text-white font-medium mb-2">Örnek Şifre Gereksinimleri:</div>
                  <p className="text-sm text-gray-300">
                    Mevcut konfigürasyona göre, şifreler en az {securitySettings.passwordPolicy.minLength} karakter uzunluğunda olmalı
                    {securitySettings.passwordPolicy.requireUppercase && ', en az 1 büyük harf içermeli'}
                    {securitySettings.passwordPolicy.requireLowercase && ', en az 1 küçük harf içermeli'}
                    {securitySettings.passwordPolicy.requireNumbers && ', en az 1 rakam içermeli'}
                    {securitySettings.passwordPolicy.requireSpecialChars && ', en az 1 özel karakter içermeli'}
                    .
                    {securitySettings.passwordPolicy.passwordExpireDays > 0 && 
                      ` Şifreler ${securitySettings.passwordPolicy.passwordExpireDays} gün sonra değiştirilmelidir.`}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Oturum Açma Denemeleri */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                  Oturum Açma Denemeleri
                </CardTitle>
                <CardDescription>
                  Başarısız oturum açma denemelerine karşı koruma
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Maksimum Başarısız Deneme Sayısı
                    </label>
                    <Input 
                      type="number"
                      min={1}
                      max={10}
                      value={securitySettings.loginAttempts.maxAttempts}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        loginAttempts: {
                          ...securitySettings.loginAttempts,
                          maxAttempts: parseInt(e.target.value)
                        }
                      })}
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Hesap Kilitleme Süresi (Dakika)
                    </label>
                    <Input 
                      type="number"
                      min={5}
                      max={1440}
                      value={securitySettings.loginAttempts.lockoutDuration}
                      onChange={(e) => setSecuritySettings({
                        ...securitySettings,
                        loginAttempts: {
                          ...securitySettings.loginAttempts,
                          lockoutDuration: parseInt(e.target.value)
                        }
                      })}
                      className="bg-gray-900 border-gray-700"
                    />
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 pt-2">
                  <Switch 
                    id="trackIpAddress"
                    checked={securitySettings.loginAttempts.trackIpAddress}
                    onCheckedChange={(checked) => setSecuritySettings({
                      ...securitySettings,
                      loginAttempts: {
                        ...securitySettings.loginAttempts,
                        trackIpAddress: checked
                      }
                    })}
                  />
                  <label htmlFor="trackIpAddress" className="text-white">
                    IP adresi takibi ve şüpheli IP'leri engelleme
                  </label>
                </div>
              </CardContent>
            </Card>
            
            {/* Oturum Ayarları */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <UserCheck className="h-5 w-5 text-yellow-500" />
                  Oturum Ayarları
                </CardTitle>
                <CardDescription>
                  Kullanıcı oturum davranışı ve zaman aşımı
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Oturum Zaman Aşımı (Dakika)
                  </label>
                  <Input 
                    type="number"
                    min={5}
                    max={1440}
                    value={securitySettings.sessionSettings.sessionTimeout}
                    onChange={(e) => setSecuritySettings({
                      ...securitySettings,
                      sessionSettings: {
                        ...securitySettings.sessionSettings,
                        sessionTimeout: parseInt(e.target.value)
                      }
                    })}
                    className="bg-gray-900 border-gray-700"
                  />
                  <p className="text-xs text-gray-400 mt-1">Kullanıcı hareketsizliğinde oturumun sonlandırılacağı süre</p>
                </div>
                
                <div className="space-y-3 pt-2">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="enforceOneSession"
                      checked={securitySettings.sessionSettings.enforceOneSession}
                      onCheckedChange={(checked) => setSecuritySettings({
                        ...securitySettings,
                        sessionSettings: {
                          ...securitySettings.sessionSettings,
                          enforceOneSession: checked
                        }
                      })}
                    />
                    <label htmlFor="enforceOneSession" className="text-white">
                      Tek oturum zorunluluğu (her kullanıcı için tek aktif oturum)
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="rememberMeEnabled"
                      checked={securitySettings.sessionSettings.rememberMeEnabled}
                      onCheckedChange={(checked) => setSecuritySettings({
                        ...securitySettings,
                        sessionSettings: {
                          ...securitySettings.sessionSettings,
                          rememberMeEnabled: checked
                        }
                      })}
                    />
                    <label htmlFor="rememberMeEnabled" className="text-white">
                      "Beni Hatırla" fonksiyonuna izin ver
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* IP Kısıtlamaları */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Globe className="h-5 w-5 text-yellow-500" />
                  IP Kısıtlamaları
                </CardTitle>
                <CardDescription>
                  Admin paneline erişim izni verilen veya engellenen IP adresleri
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Beyaz Liste */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Switch 
                      id="whitelistEnabled"
                      checked={securitySettings.ipRestrictions.whitelistEnabled}
                      onCheckedChange={(checked) => setSecuritySettings({
                        ...securitySettings,
                        ipRestrictions: {
                          ...securitySettings.ipRestrictions,
                          whitelistEnabled: checked
                        }
                      })}
                    />
                    <label htmlFor="whitelistEnabled" className="text-white">
                      IP Beyaz Listesi Etkin (Sadece listedeki IP'ler erişebilir)
                    </label>
                  </div>
                  
                  <div className="flex gap-2 mb-2">
                    <Input 
                      value={newIpAddress}
                      onChange={(e) => setNewIpAddress(e.target.value)}
                      className="bg-gray-900 border-gray-700"
                      placeholder="IP Adresi Ekle (örn. 192.168.1.1)"
                    />
                    <Button 
                      onClick={handleAddWhitelistIp}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black"
                    >
                      Beyaz Listeye Ekle
                    </Button>
                  </div>
                  
                  <div className="bg-gray-900 rounded-md border border-gray-700 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-gray-300">IP Adresi</TableHead>
                          <TableHead className="text-gray-300 text-right">İşlem</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {securitySettings.ipRestrictions.whitelistedIps.length > 0 ? (
                          securitySettings.ipRestrictions.whitelistedIps.map((ip, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium text-white">{ip}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-500 h-8 w-8 p-0"
                                  onClick={() => handleRemoveIp(ip, 'whitelist')}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-gray-400 py-4">
                              Beyaz listede IP adresi yok
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                {/* Kara Liste */}
                <div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Switch 
                      id="blacklistEnabled"
                      checked={securitySettings.ipRestrictions.blacklistEnabled}
                      onCheckedChange={(checked) => setSecuritySettings({
                        ...securitySettings,
                        ipRestrictions: {
                          ...securitySettings.ipRestrictions,
                          blacklistEnabled: checked
                        }
                      })}
                    />
                    <label htmlFor="blacklistEnabled" className="text-white">
                      IP Kara Listesi Etkin (Listedeki IP'ler erişemez)
                    </label>
                  </div>
                  
                  <div className="flex gap-2 mb-2">
                    <Input 
                      value={newIpAddress}
                      onChange={(e) => setNewIpAddress(e.target.value)}
                      className="bg-gray-900 border-gray-700"
                      placeholder="IP Adresi Ekle (örn. 192.168.1.1)"
                    />
                    <Button 
                      onClick={handleAddBlacklistIp}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Kara Listeye Ekle
                    </Button>
                  </div>
                  
                  <div className="bg-gray-900 rounded-md border border-gray-700 overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="text-gray-300">IP Adresi</TableHead>
                          <TableHead className="text-gray-300 text-right">İşlem</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {securitySettings.ipRestrictions.blacklistedIps.length > 0 ? (
                          securitySettings.ipRestrictions.blacklistedIps.map((ip, index) => (
                            <TableRow key={index}>
                              <TableCell className="font-medium text-white">{ip}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  className="text-red-500 h-8 w-8 p-0"
                                  onClick={() => handleRemoveIp(ip, 'blacklist')}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={2} className="text-center text-gray-400 py-4">
                              Kara listede IP adresi yok
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full border-gray-700"
                  onClick={handleSaveSettings}
                >
                  <Save className="h-4 w-4 mr-2" />
                  Tüm Güvenlik Ayarlarını Kaydet
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="logs">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex justify-between">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-yellow-500" />
                    Güvenlik Olayları
                  </div>
                  <Button variant="outline" className="border-gray-700">
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Yenile
                  </Button>
                </CardTitle>
                <CardDescription>
                  Son güvenlik olayları ve uyarıları
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-gray-900 rounded-md border border-gray-700 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-300">Olay</TableHead>
                        <TableHead className="text-gray-300">Kullanıcı</TableHead>
                        <TableHead className="text-gray-300">IP Adresi</TableHead>
                        <TableHead className="text-gray-300">Zaman</TableHead>
                        <TableHead className="text-gray-300">Durum</TableHead>
                        <TableHead className="text-gray-300 text-right">İşlem</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {securityEvents.map((event) => (
                        <TableRow key={event.id} className="border-b border-gray-700">
                          <TableCell>
                            <div className="font-medium text-white">
                              {event.type === 'login_attempt' && <Lock className="h-4 w-4 inline mr-2 text-blue-500" />}
                              {event.type === 'account_locked' && <ShieldAlert className="h-4 w-4 inline mr-2 text-red-500" />}
                              {event.type === 'ip_blocked' && <Globe className="h-4 w-4 inline mr-2 text-red-500" />}
                              {event.type === 'password_change' && <KeyRound className="h-4 w-4 inline mr-2 text-green-500" />}
                              {event.type === 'suspicious_activity' && <AlertTriangle className="h-4 w-4 inline mr-2 text-yellow-500" />}
                              {event.type === '2fa_setup' && <Shield className="h-4 w-4 inline mr-2 text-green-500" />}
                              {event.description}
                            </div>
                          </TableCell>
                          <TableCell>
                            {event.username !== '-' ? (
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4 text-gray-400" />
                                <span>{event.username}</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>{event.ipAddress}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <span>{event.timestamp}</span>
                            </div>
                          </TableCell>
                          <TableCell>{getEventStatusBadge(event.status)}</TableCell>
                          <TableCell className="text-right">
                            {!event.resolved ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-gray-700"
                                onClick={() => handleResolveEvent(event.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1 text-green-500" />
                                Çözüldü
                              </Button>
                            ) : (
                              <Badge variant="outline" className="border-gray-600">
                                <CheckCircle className="h-3 w-3 mr-1 text-green-500" />
                                Çözüldü
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" className="border-gray-700">
                  Tüm Güvenlik Olaylarını Görüntüle
                </Button>
                <Button variant="outline" className="border-gray-700">
                  Güvenlik Raporu Oluştur
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default Security;