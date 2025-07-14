import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  User, 
  UserPlus, 
  Shield, 
  Edit, 
  Trash, 
  Eye, 
  EyeOff,
  Key,
  Save,
  X,
  Check,
  Search,
  Filter,
  Clock,
  Calendar,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  UserCog
} from 'lucide-react';

// Admin Kullanıcı tipi
type AdminUser = {
  id: number;
  username: string;
  fullName: string;
  email: string;
  phone?: string;
  role: 'superadmin' | 'admin' | 'moderator' | 'support';
  permissions: string[];
  status: 'active' | 'inactive' | 'locked';
  lastLogin: string;
  twoFactorEnabled: boolean;
  created: string;
};

// İzin grubu tanımı
type PermissionGroup = {
  id: string;
  name: string;
  permissions: {
    id: string;
    name: string;
    description: string;
  }[];
};

const Admins: React.FC = () => {
  const { translate } = useLanguage();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('users');
  const [isEditing, setIsEditing] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<AdminUser | null>(null);
  
  // Örnek admin kullanıcıları
  const adminUsers: AdminUser[] = [
    {
      id: 1,
      username: 'superadmin',
      fullName: 'Sistem Yöneticisi',
      email: 'admin@example.com',
      phone: '+90 555 123 4567',
      role: 'superadmin',
      permissions: ['all'],
      status: 'active',
      lastLogin: '2023-05-20 14:30:15',
      twoFactorEnabled: true,
      created: '2023-01-01'
    },
    {
      id: 2,
      username: 'contentadmin',
      fullName: 'İçerik Yöneticisi',
      email: 'content@example.com',
      phone: '+90 555 234 5678',
      role: 'admin',
      permissions: ['content.view', 'content.edit', 'content.delete', 'users.view'],
      status: 'active',
      lastLogin: '2023-05-19 11:45:22',
      twoFactorEnabled: true,
      created: '2023-01-15'
    },
    {
      id: 3,
      username: 'financeadmin',
      fullName: 'Finans Yöneticisi',
      email: 'finance@example.com',
      phone: '+90 555 345 6789',
      role: 'admin',
      permissions: ['finance.view', 'finance.edit', 'transactions.view', 'transactions.approve', 'users.view'],
      status: 'active',
      lastLogin: '2023-05-20 09:12:45',
      twoFactorEnabled: true,
      created: '2023-02-01'
    },
    {
      id: 4,
      username: 'supportuser',
      fullName: 'Destek Personeli',
      email: 'support@example.com',
      role: 'support',
      permissions: ['users.view', 'tickets.view', 'tickets.reply', 'content.view'],
      status: 'active',
      lastLogin: '2023-05-18 16:22:10',
      twoFactorEnabled: false,
      created: '2023-03-10'
    },
    {
      id: 5,
      username: 'moderator1',
      fullName: 'Site Moderatörü',
      email: 'moderator@example.com',
      role: 'moderator',
      permissions: ['users.view', 'users.moderate', 'content.view', 'content.moderate'],
      status: 'inactive',
      lastLogin: '2023-04-25 10:40:33',
      twoFactorEnabled: false,
      created: '2023-03-15'
    }
  ];
  
  // İzin grupları
  const permissionGroups: PermissionGroup[] = [
    {
      id: 'users',
      name: 'Kullanıcı Yönetimi',
      permissions: [
        { id: 'users.view', name: 'Kullanıcıları Görüntüleme', description: 'Kullanıcı listesi ve detaylarını görüntüleme izni' },
        { id: 'users.create', name: 'Kullanıcı Oluşturma', description: 'Yeni kullanıcı oluşturma izni' },
        { id: 'users.edit', name: 'Kullanıcı Düzenleme', description: 'Mevcut kullanıcıları düzenleme izni' },
        { id: 'users.delete', name: 'Kullanıcı Silme', description: 'Kullanıcıları silme izni' },
        { id: 'users.moderate', name: 'Kullanıcı Moderasyonu', description: 'Kullanıcıları kilitleme/engelleme izni' }
      ]
    },
    {
      id: 'content',
      name: 'İçerik Yönetimi',
      permissions: [
        { id: 'content.view', name: 'İçerikleri Görüntüleme', description: 'Tüm içerikleri görüntüleme izni' },
        { id: 'content.create', name: 'İçerik Oluşturma', description: 'Yeni içerik oluşturma izni' },
        { id: 'content.edit', name: 'İçerik Düzenleme', description: 'Mevcut içerikleri düzenleme izni' },
        { id: 'content.delete', name: 'İçerik Silme', description: 'İçerikleri silme izni' },
        { id: 'content.moderate', name: 'İçerik Moderasyonu', description: 'İçerikleri onaylama/reddetme izni' }
      ]
    },
    {
      id: 'finance',
      name: 'Finans Yönetimi',
      permissions: [
        { id: 'finance.view', name: 'Finans Görüntüleme', description: 'Finansal verileri görüntüleme izni' },
        { id: 'finance.edit', name: 'Finans Düzenleme', description: 'Finansal ayarları düzenleme izni' },
        { id: 'transactions.view', name: 'İşlemleri Görüntüleme', description: 'Tüm işlemleri görüntüleme izni' },
        { id: 'transactions.approve', name: 'İşlem Onaylama', description: 'Para çekme işlemlerini onaylama izni' },
        { id: 'transactions.cancel', name: 'İşlem İptal', description: 'İşlemleri iptal etme izni' }
      ]
    },
    {
      id: 'reports',
      name: 'Raporlama',
      permissions: [
        { id: 'reports.view', name: 'Raporları Görüntüleme', description: 'Tüm raporları görüntüleme izni' },
        { id: 'reports.export', name: 'Rapor Dışa Aktarma', description: 'Raporları dışa aktarma izni' },
        { id: 'stats.view', name: 'İstatistikleri Görüntüleme', description: 'Platform istatistiklerini görüntüleme izni' }
      ]
    },
    {
      id: 'settings',
      name: 'Sistem Ayarları',
      permissions: [
        { id: 'settings.view', name: 'Ayarları Görüntüleme', description: 'Sistem ayarlarını görüntüleme izni' },
        { id: 'settings.edit', name: 'Ayarları Düzenleme', description: 'Sistem ayarlarını düzenleme izni' },
        { id: 'security.view', name: 'Güvenlik Ayarlarını Görüntüleme', description: 'Güvenlik ayarlarını görüntüleme izni' },
        { id: 'security.edit', name: 'Güvenlik Ayarlarını Düzenleme', description: 'Güvenlik ayarlarını düzenleme izni' },
        { id: 'logs.view', name: 'Sistem Günlüklerini Görüntüleme', description: 'Sistem günlüklerini görüntüleme izni' }
      ]
    }
  ];
  
  // Filtrelenmiş admin kullanıcıları
  const filteredAdmins = adminUsers.filter(admin => {
    // Arama filtresi
    const searchMatch = 
      searchTerm === '' || 
      admin.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Rol filtresi
    const roleMatch = roleFilter === 'all' || admin.role === roleFilter;
    
    // Durum filtresi
    const statusMatch = statusFilter === 'all' || admin.status === statusFilter;
    
    return searchMatch && roleMatch && statusMatch;
  });
  
  // Yeni admin ekleme
  const handleAddAdmin = () => {
    setCurrentAdmin({
      id: 0,
      username: '',
      fullName: '',
      email: '',
      phone: '',
      role: 'admin',
      permissions: [],
      status: 'active',
      lastLogin: '',
      twoFactorEnabled: false,
      created: new Date().toISOString().split('T')[0]
    });
    setIsEditing(true);
    setPassword('');
    
    toast({
      title: "Yeni Admin",
      description: "Yeni admin kullanıcısı oluşturma formu açıldı.",
    });
  };
  
  // Admin düzenleme
  const handleEditAdmin = (admin: AdminUser) => {
    setCurrentAdmin(admin);
    setIsEditing(true);
    setPassword('');
    
    toast({
      title: "Admin Düzenleniyor",
      description: `"${admin.username}" kullanıcısını düzenliyorsunuz.`,
    });
  };
  
  // Admin kaydetme
  const handleSaveAdmin = () => {
    if (!currentAdmin) return;
    
    toast({
      title: currentAdmin.id === 0 ? "Admin Oluşturuldu" : "Admin Güncellendi",
      description: `${currentAdmin.username} kullanıcısı ${currentAdmin.id === 0 ? 'oluşturuldu' : 'güncellendi'}.`,
    });
    
    setIsEditing(false);
    setCurrentAdmin(null);
  };
  
  // Admin silme
  const handleDeleteAdmin = (id: number) => {
    toast({
      title: "Admin Silindi",
      description: `${id} ID'li admin kullanıcısı silindi.`,
      variant: "destructive",
    });
  };
  
  // Admin durumunu değiştirme
  const handleToggleStatus = (id: number, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    toast({
      title: "Admin Durumu Değiştirildi",
      description: `Admin kullanıcısının durumu ${newStatus === 'active' ? 'aktif' : 'pasif'} olarak değiştirildi.`,
    });
  };
  
  // Durum göstergesi
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Aktif</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500">Pasif</Badge>;
      case 'locked':
        return <Badge className="bg-red-500">Kilitli</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Rol göstergesi
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'superadmin':
        return <Badge className="bg-blue-500">Süper Admin</Badge>;
      case 'admin':
        return <Badge className="bg-yellow-500 text-black">Admin</Badge>;
      case 'moderator':
        return <Badge className="bg-purple-500">Moderatör</Badge>;
      case 'support':
        return <Badge className="bg-green-500">Destek</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };
  
  // İzin kontrolü
  const hasPermission = (user: AdminUser, permissionId: string) => {
    return user.permissions.includes(permissionId) || user.permissions.includes('all');
  };
  
  // İzin grubu izinleri kontrolü
  const hasGroupPermissions = (user: AdminUser, groupId: string) => {
    if (user.permissions.includes('all')) return true;
    
    const group = permissionGroups.find(g => g.id === groupId);
    if (!group) return false;
    
    return group.permissions.every(p => user.permissions.includes(p.id));
  };
  
  // İzin değiştirme
  const togglePermission = (permissionId: string) => {
    if (!currentAdmin) return;
    
    // Tüm izinler özel durumu
    if (permissionId === 'all') {
      if (currentAdmin.permissions.includes('all')) {
        setCurrentAdmin({
          ...currentAdmin,
          permissions: []
        });
      } else {
        setCurrentAdmin({
          ...currentAdmin,
          permissions: ['all']
        });
      }
      return;
    }
    
    // Eğer 'all' izni varsa önce onu kaldır
    let newPermissions = currentAdmin.permissions.filter(p => p !== 'all');
    
    if (newPermissions.includes(permissionId)) {
      newPermissions = newPermissions.filter(p => p !== permissionId);
    } else {
      newPermissions.push(permissionId);
    }
    
    setCurrentAdmin({
      ...currentAdmin,
      permissions: newPermissions
    });
  };
  
  // Grup izinlerini değiştirme
  const toggleGroupPermissions = (groupId: string) => {
    if (!currentAdmin) return;
    
    const group = permissionGroups.find(g => g.id === groupId);
    if (!group) return;
    
    // Eğer 'all' izni varsa önce onu kaldır
    let newPermissions = currentAdmin.permissions.filter(p => p !== 'all');
    
    const groupPermissionIds = group.permissions.map(p => p.id);
    const hasAllGroupPermissions = groupPermissionIds.every(id => newPermissions.includes(id));
    
    if (hasAllGroupPermissions) {
      // Grup izinlerini kaldır
      newPermissions = newPermissions.filter(p => !groupPermissionIds.includes(p));
    } else {
      // Grup izinlerini ekle - duplicate'leri önlemek için
      // Array.from(new Set()) yerine manuel olarak ekleyerek unique değerleri koruyoruz
      newPermissions = [...newPermissions];
      
      // Sadece mevcut olmayan izinleri ekle
      groupPermissionIds.forEach(permId => {
        if (!newPermissions.includes(permId)) {
          newPermissions.push(permId);
        }
      });
    }
    
    setCurrentAdmin({
      ...currentAdmin,
      permissions: newPermissions
    });
  };

  return (
    <AdminLayout title="Admin Kullanıcıları">
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Kullanıcıları</h1>
            <p className="text-gray-400">Sistem yöneticilerini ve yetkilerini yönetin</p>
          </div>
          
          <Button onClick={handleAddAdmin} className="bg-yellow-500 hover:bg-yellow-600 text-black flex items-center gap-2">
            <UserPlus size={16} />
            Yeni Admin
          </Button>
        </div>
        
        {isEditing && currentAdmin ? (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">
                {currentAdmin.id === 0 ? "Yeni Admin Ekle" : `Admin Düzenle: ${currentAdmin.username}`}
              </CardTitle>
              <CardDescription>
                Admin kullanıcısı bilgilerini ve yetkilerini düzenleyin
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Kullanıcı Adı</label>
                    <Input 
                      value={currentAdmin.username}
                      onChange={(e) => setCurrentAdmin({...currentAdmin, username: e.target.value})}
                      className="bg-gray-900 border-gray-700"
                      placeholder="Kullanıcı adı"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      {currentAdmin.id === 0 ? "Şifre" : "Şifre (değiştirmek için doldurun)"}
                    </label>
                    <div className="relative">
                      <Input 
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="bg-gray-900 border-gray-700 pr-10"
                        placeholder="Şifre"
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Ad Soyad</label>
                    <Input 
                      value={currentAdmin.fullName}
                      onChange={(e) => setCurrentAdmin({...currentAdmin, fullName: e.target.value})}
                      className="bg-gray-900 border-gray-700"
                      placeholder="Ad soyad"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">E-posta</label>
                    <Input 
                      type="email"
                      value={currentAdmin.email}
                      onChange={(e) => setCurrentAdmin({...currentAdmin, email: e.target.value})}
                      className="bg-gray-900 border-gray-700"
                      placeholder="E-posta adresi"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Telefon (Opsiyonel)</label>
                    <Input 
                      value={currentAdmin.phone || ''}
                      onChange={(e) => setCurrentAdmin({...currentAdmin, phone: e.target.value})}
                      className="bg-gray-900 border-gray-700"
                      placeholder="Telefon numarası"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Rol</label>
                    <select 
                      value={currentAdmin.role}
                      onChange={(e) => setCurrentAdmin({...currentAdmin, role: e.target.value as any})}
                      className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                    >
                      <option value="superadmin">Süper Admin</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderatör</option>
                      <option value="support">Destek</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Durum</label>
                    <select 
                      value={currentAdmin.status}
                      onChange={(e) => setCurrentAdmin({...currentAdmin, status: e.target.value as any})}
                      className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                    >
                      <option value="active">Aktif</option>
                      <option value="inactive">Pasif</option>
                      <option value="locked">Kilitli</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center h-10 space-x-2">
                    <Switch 
                      id="twoFactorEnabled"
                      checked={currentAdmin.twoFactorEnabled}
                      onCheckedChange={(checked) => setCurrentAdmin({...currentAdmin, twoFactorEnabled: checked})}
                    />
                    <label htmlFor="twoFactorEnabled" className="text-sm font-medium text-gray-300">
                      İki Faktörlü Kimlik Doğrulama (2FA) Aktif
                    </label>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-white mb-4">Yetkiler</h3>
                  <div className="bg-gray-900 border border-gray-700 rounded-md p-4">
                    <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-gray-700">
                      <Switch 
                        id="allPermissions"
                        checked={currentAdmin.permissions.includes('all')}
                        onCheckedChange={() => togglePermission('all')}
                      />
                      <label htmlFor="allPermissions" className="text-white font-medium">
                        Tüm Yetkiler
                      </label>
                      <Badge className="ml-auto bg-blue-500">Süper Admin</Badge>
                    </div>
                    
                    {permissionGroups.map((group) => (
                      <div key={group.id} className="mb-4 pb-3 border-b border-gray-700 last:border-0 last:pb-0 last:mb-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <Switch 
                            id={`group-${group.id}`}
                            checked={hasGroupPermissions(currentAdmin, group.id)}
                            onCheckedChange={() => toggleGroupPermissions(group.id)}
                            disabled={currentAdmin.permissions.includes('all')}
                          />
                          <label htmlFor={`group-${group.id}`} className="text-white font-medium">
                            {group.name}
                          </label>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pl-8">
                          {group.permissions.map((perm) => (
                            <div key={perm.id} className="flex items-center space-x-2">
                              <Switch 
                                id={`perm-${perm.id}`}
                                checked={hasPermission(currentAdmin, perm.id)}
                                onCheckedChange={() => togglePermission(perm.id)}
                                disabled={currentAdmin.permissions.includes('all')}
                              />
                              <label htmlFor={`perm-${perm.id}`} className="text-sm text-gray-300">
                                {perm.name}
                                <div className="text-xs text-gray-400">{perm.description}</div>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                className="border-gray-700"
                onClick={() => {
                  setIsEditing(false);
                  setCurrentAdmin(null);
                }}
              >
                İptal
              </Button>
              <Button 
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
                onClick={handleSaveAdmin}
              >
                <Save className="h-4 w-4 mr-2" />
                Kaydet
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <>
            <Card className="bg-gray-800 border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Filtreler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Admin Ara</label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Kullanıcı adı, ad soyad veya e-posta ara..."
                        className="bg-gray-900 border-gray-700 pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Rol Filtresi</label>
                    <select 
                      className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                    >
                      <option value="all">Tüm Roller</option>
                      <option value="superadmin">Süper Admin</option>
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderatör</option>
                      <option value="support">Destek</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Durum Filtresi</label>
                    <select 
                      className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Tüm Durumlar</option>
                      <option value="active">Aktif</option>
                      <option value="inactive">Pasif</option>
                      <option value="locked">Kilitli</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2 flex items-end">
                    <Button 
                      variant="outline" 
                      className="border-gray-700 w-full"
                      onClick={() => {
                        setSearchTerm('');
                        setRoleFilter('all');
                        setStatusFilter('all');
                      }}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filtreleri Temizle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Tabs defaultValue="users" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-gray-800 border-b border-gray-700 mb-6 w-full md:w-auto justify-start">
                <TabsTrigger 
                  value="users" 
                  className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
                >
                  Admin Kullanıcılar
                </TabsTrigger>
              </TabsList>
              
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Admin Listesi</CardTitle>
                  <CardDescription>
                    {filteredAdmins.length} admin kullanıcısı listeleniyor
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table className="border-collapse">
                    <TableHeader className="bg-gray-900">
                      <TableRow>
                        <TableHead className="text-gray-300">Kullanıcı Adı</TableHead>
                        <TableHead className="text-gray-300">Ad Soyad</TableHead>
                        <TableHead className="text-gray-300">E-posta</TableHead>
                        <TableHead className="text-gray-300">Rol</TableHead>
                        <TableHead className="text-gray-300">Durum</TableHead>
                        <TableHead className="text-gray-300">Son Giriş</TableHead>
                        <TableHead className="text-gray-300">2FA</TableHead>
                        <TableHead className="text-gray-300">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredAdmins.map((admin) => (
                        <TableRow key={admin.id} className="border-b border-gray-700">
                          <TableCell className="font-medium text-white">
                            <div className="flex items-center">
                              <UserCog className="h-4 w-4 mr-2 text-gray-400" />
                              {admin.username}
                            </div>
                          </TableCell>
                          <TableCell>{admin.fullName}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-1 text-gray-400" />
                              {admin.email}
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(admin.role)}</TableCell>
                          <TableCell>{getStatusBadge(admin.status)}</TableCell>
                          <TableCell>
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-400" />
                              {admin.lastLogin}
                            </div>
                          </TableCell>
                          <TableCell>
                            {admin.twoFactorEnabled ? (
                              <Badge className="bg-green-500">
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Aktif
                              </Badge>
                            ) : (
                              <Badge className="bg-gray-500">
                                <ShieldAlert className="h-3 w-3 mr-1" />
                                Pasif
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="ghost" 
                                className="h-8 w-8 p-0 text-yellow-500"
                                onClick={() => handleEditAdmin(admin)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              {admin.status === 'active' ? (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 text-red-500"
                                  onClick={() => handleToggleStatus(admin.id, admin.status)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 text-green-500"
                                  onClick={() => handleToggleStatus(admin.id, admin.status)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                              )}
                              {admin.id !== 1 && (
                                <Button 
                                  size="sm" 
                                  variant="ghost" 
                                  className="h-8 w-8 p-0 text-red-500"
                                  onClick={() => handleDeleteAdmin(admin.id)}
                                >
                                  <Trash className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Tabs>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default Admins;