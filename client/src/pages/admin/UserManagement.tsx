import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Search, Download, Eye, Edit, UserX, UserCheck, 
  Users, Crown, Wallet, Activity, RotateCcw,
  Phone, Mail, Calendar, MapPin, DollarSign,
  TrendingUp, TrendingDown, Settings, Award
} from 'lucide-react';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

interface User {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  balance: number;
  vipLevel: number;
  vipPoints: number;
  status: string;
  role: string;
  isActive: boolean;
  totalDeposits: number;
  totalWithdrawals: number;
  totalBets: number;
  totalWins: number;
  registrationDate: string;
  createdAt: string;
  lastLogin?: string;
}

interface UserStats {
  basicStats: {
    totalUsers: number;
    activeUsers: number;
    adminUsers: number;
    recentUsers: number;
  };
  vipStats: Array<{
    vipLevel: number;
    count: number;
    avgBalance: number;
  }>;
  roleStats: Array<{
    role: string;
    count: number;
    avgBalance: number;
  }>;
  balanceStats: {
    totalBalance: number;
    avgBalance: number;
    maxBalance: number;
    minBalance: number;
    usersWithBalance: number;
  };
}

const VIP_LEVELS = {
  0: { label: 'Standart', color: 'bg-gray-500', icon: Users },
  1: { label: 'Bronz', color: 'bg-orange-500', icon: Award },
  2: { label: 'Gümüş', color: 'bg-gray-400', icon: Award },
  3: { label: 'Altın', color: 'bg-yellow-500', icon: Crown },
  4: { label: 'Platin', color: 'bg-purple-500', icon: Crown },
  5: { label: 'Elmas', color: 'bg-blue-500', icon: Crown }
};

const ROLE_CONFIG = {
  user: { label: 'Kullanıcı', color: 'bg-blue-500' },
  admin: { label: 'Admin', color: 'bg-red-500' },
  moderator: { label: 'Moderatör', color: 'bg-green-500' },
  vip: { label: 'VIP', color: 'bg-purple-500' }
};

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const [vipFilter, setVipFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceOperation, setBalanceOperation] = useState('set');
  const { toast } = useToast();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  // Kullanıcıları getir
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['/api/admin/users', currentPage, searchTerm, statusFilter, roleFilter, vipFilter],
    queryFn: async () => {
      const response = await fetch(`/api/admin/users?page=${currentPage}&search=${searchTerm}&status=${statusFilter}&role=${roleFilter}&vipLevel=${vipFilter}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Kullanıcı verileri alınamadı');
      return response.json();
    }
  });

  // Kullanıcı istatistiklerini getir
  const { data: statsData } = useQuery({
    queryKey: ['/api/admin/users/stats/summary'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users/stats/summary', {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('Kullanıcı istatistikleri alınamadı');
      return response.json();
    }
  });

  // Kullanıcı güncellemesi
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: any }) => {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Kullanıcı güncellenemedi');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users/stats/summary'] });
      setEditDialogOpen(false);
      toast({
        title: 'Başarılı',
        description: 'Kullanıcı başarıyla güncellendi'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Kullanıcı güncellenemedi',
        variant: 'destructive'
      });
    }
  });

  // Kullanıcı durumu güncelleme
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, isActive, status }: { id: number; isActive?: boolean; status?: string }) => {
      const response = await fetch(`/api/admin/users/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isActive, status })
      });
      if (!response.ok) throw new Error('Durum güncellenemedi');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: 'Başarılı',
        description: 'Kullanıcı durumu güncellendi'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Durum güncellenemedi',
        variant: 'destructive'
      });
    }
  });

  // Bakiye güncelleme
  const updateBalanceMutation = useMutation({
    mutationFn: async ({ id, balance, operation }: { id: number; balance: number; operation: string }) => {
      const response = await fetch(`/api/admin/users/${id}/balance`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ balance, operation })
      });
      if (!response.ok) throw new Error('Bakiye güncellenemedi');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users/stats/summary'] });
      setBalanceDialogOpen(false);
      setBalanceAmount('');
      toast({
        title: 'Başarılı',
        description: 'Kullanıcı bakiyesi güncellendi'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'Bakiye güncellenemedi',
        variant: 'destructive'
      });
    }
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount || 0);
  };

  const getVipConfig = (level: number) => {
    return VIP_LEVELS[level as keyof typeof VIP_LEVELS] || VIP_LEVELS[0];
  };

  const getRoleConfig = (role: string) => {
    return ROLE_CONFIG[role as keyof typeof ROLE_CONFIG] || ROLE_CONFIG.user;
  };

  const exportData = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const response = await fetch(`/api/admin/users/export/data?format=${format}&search=${searchTerm}&status=${statusFilter}&role=${roleFilter}&vipLevel=${vipFilter}`);
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `users-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Başarılı',
        description: `Kullanıcılar ${format.toUpperCase()} formatında dışa aktarıldı`
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Dışa aktarma işlemi başarısız',
        variant: 'destructive'
      });
    }
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setEditDialogOpen(true);
  };

  const handleBalanceUpdate = (user: User) => {
    setSelectedUser(user);
    setBalanceDialogOpen(true);
  };

  const handleSubmitEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    const formData = new FormData(e.target as HTMLFormElement);
    const updateData = {
      username: formData.get('username'),
      email: formData.get('email'),
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone'),
      role: formData.get('role'),
      vipLevel: parseInt(formData.get('vipLevel') as string),
      status: formData.get('status')
    };

    updateUserMutation.mutate({ id: selectedUser.id, data: updateData });
  };

  const handleSubmitBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !balanceAmount) return;

    updateBalanceMutation.mutate({
      id: selectedUser.id,
      balance: parseFloat(balanceAmount),
      operation: balanceOperation
    });
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Başlık ve Filtreler */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Kullanıcı Yönetimi</h1>
            <p className="text-gray-400">Kullanıcı hesapları ve profil yönetimi</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              onClick={() => exportData('csv')} 
              variant="outline" 
              size="sm"
              className="bg-gray-800 border-gray-600 hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              CSV
            </Button>
            <Button 
              onClick={() => exportData('json')} 
              variant="outline" 
              size="sm"
              className="bg-gray-800 border-gray-600 hover:bg-gray-700"
            >
              <Download className="h-4 w-4 mr-2" />
              JSON
            </Button>
          </div>
        </div>

        {/* İstatistik Kartları */}
        {statsData && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Toplam Kullanıcı</p>
                    <p className="text-2xl font-bold text-white">
                      {statsData.basicStats?.totalUsers || 0}
                    </p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Aktif Kullanıcı</p>
                    <p className="text-2xl font-bold text-green-500">
                      {statsData.basicStats?.activeUsers || 0}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Toplam Bakiye</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {formatCurrency(statsData.balanceStats?.totalBalance || 0)}
                    </p>
                  </div>
                  <Wallet className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Bakiyeli Kullanıcı</p>
                    <p className="text-2xl font-bold text-purple-500">
                      {statsData.balanceStats?.usersWithBalance || 0}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtreler */}
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Kullanıcı adı, e-posta, telefon ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full lg:w-48 bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Durum Filtrele" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="active">Aktif</SelectItem>
                  <SelectItem value="inactive">Pasif</SelectItem>
                </SelectContent>
              </Select>

              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full lg:w-48 bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Rol Filtrele" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">Tüm Roller</SelectItem>
                  <SelectItem value="user">Kullanıcı</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="moderator">Moderatör</SelectItem>
                  <SelectItem value="vip">VIP</SelectItem>
                </SelectContent>
              </Select>

              <Select value={vipFilter} onValueChange={setVipFilter}>
                <SelectTrigger className="w-full lg:w-48 bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="VIP Filtrele" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">Tüm VIP Seviyeleri</SelectItem>
                  <SelectItem value="0">Standart</SelectItem>
                  <SelectItem value="1">Bronz</SelectItem>
                  <SelectItem value="2">Gümüş</SelectItem>
                  <SelectItem value="3">Altın</SelectItem>
                  <SelectItem value="4">Platin</SelectItem>
                  <SelectItem value="5">Elmas</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setRoleFilter('all');
                  setVipFilter('all');
                  setCurrentPage(1);
                }}
                variant="outline"
                className="bg-gray-700 border-gray-600 hover:bg-gray-600"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Kullanıcı Listesi */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Kullanıcılar</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-20 bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : usersData?.users?.length > 0 ? (
              <div className="space-y-4">
                {usersData.users.map((user: User) => {
                  const vipConfig = getVipConfig(user.vipLevel);
                  const roleConfig = getRoleConfig(user.role);
                  const VipIcon = vipConfig.icon;

                  return (
                    <div
                      key={user.id}
                      className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-3 rounded-full ${user.isActive ? 'bg-green-600' : 'bg-red-600'}`}>
                            <Users className="h-6 w-6 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-2 mb-2">
                              <h3 className="font-medium text-white text-lg">
                                {user.username}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                <Badge className={`${roleConfig.color} text-white`}>
                                  {roleConfig.label}
                                </Badge>
                                <Badge className={`${vipConfig.color} text-white`}>
                                  <VipIcon className="h-3 w-3 mr-1" />
                                  {vipConfig.label}
                                </Badge>
                                <Badge variant={user.isActive ? 'default' : 'destructive'}>
                                  {user.isActive ? 'Aktif' : 'Pasif'}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-sm text-gray-400">
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {user.email}
                              </div>
                              {user.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-4 w-4" />
                                  {user.phone}
                                </div>
                              )}
                              <div className="flex items-center gap-1">
                                <Wallet className="h-4 w-4" />
                                {formatCurrency(user.balance)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(user.createdAt), 'dd MMM yyyy', {
                                  locale: language === 'tr' ? tr : enUS
                                })}
                              </div>
                            </div>

                            {/* Finansal Özet */}
                            <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-4 p-3 bg-gray-800 rounded text-sm">
                              <div>
                                <span className="text-gray-400">Toplam Yatırım:</span>
                                <span className="ml-2 text-green-400">{formatCurrency(user.totalDeposits)}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Toplam Çekim:</span>
                                <span className="ml-2 text-red-400">{formatCurrency(user.totalWithdrawals)}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Toplam Bahis:</span>
                                <span className="ml-2 text-blue-400">{user.totalBets}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Toplam Kazanç:</span>
                                <span className="ml-2 text-yellow-400">{formatCurrency(user.totalWins)}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditUser(user)}
                            className="bg-blue-600 border-blue-500 hover:bg-blue-700"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBalanceUpdate(user)}
                            className="bg-yellow-600 border-yellow-500 hover:bg-yellow-700"
                          >
                            <Wallet className="h-4 w-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant={user.isActive ? 'destructive' : 'default'}
                            onClick={() => updateStatusMutation.mutate({ 
                              id: user.id, 
                              isActive: !user.isActive 
                            })}
                            disabled={updateStatusMutation.isPending}
                          >
                            {user.isActive ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">Kullanıcı bulunamadı</p>
              </div>
            )}

            {/* Sayfalama */}
            {usersData?.totalPages > 1 && (
              <div className="mt-6 flex justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                >
                  Önceki
                </Button>
                
                <span className="flex items-center px-4 text-sm text-gray-400">
                  Sayfa {currentPage} / {usersData.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(usersData.totalPages, prev + 1))}
                  disabled={currentPage === usersData.totalPages}
                  className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                >
                  Sonraki
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Kullanıcı Düzenleme Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle>Kullanıcı Düzenle</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <form onSubmit={handleSubmitEdit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Kullanıcı Adı</Label>
                    <Input
                      name="username"
                      defaultValue={selectedUser.username}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label>E-posta</Label>
                    <Input
                      name="email"
                      type="email"
                      defaultValue={selectedUser.email}
                      className="bg-gray-700 border-gray-600 text-white"
                      required
                    />
                  </div>
                  <div>
                    <Label>Ad</Label>
                    <Input
                      name="firstName"
                      defaultValue={selectedUser.firstName || ''}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label>Soyad</Label>
                    <Input
                      name="lastName"
                      defaultValue={selectedUser.lastName || ''}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label>Telefon</Label>
                    <Input
                      name="phone"
                      defaultValue={selectedUser.phone || ''}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label>Rol</Label>
                    <Select name="role" defaultValue={selectedUser.role}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="user">Kullanıcı</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="moderator">Moderatör</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>VIP Seviye</Label>
                    <Select name="vipLevel" defaultValue={selectedUser.vipLevel.toString()}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="0">Standart</SelectItem>
                        <SelectItem value="1">Bronz</SelectItem>
                        <SelectItem value="2">Gümüş</SelectItem>
                        <SelectItem value="3">Altın</SelectItem>
                        <SelectItem value="4">Platin</SelectItem>
                        <SelectItem value="5">Elmas</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Durum</Label>
                    <Select name="status" defaultValue={selectedUser.status}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="active">Aktif</SelectItem>
                        <SelectItem value="inactive">Pasif</SelectItem>
                        <SelectItem value="suspended">Askıya Alınmış</SelectItem>
                        <SelectItem value="banned">Yasaklı</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditDialogOpen(false)}
                    className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateUserMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Güncelle
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>

        {/* Bakiye Güncelleme Dialog */}
        <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Bakiye Güncelle</DialogTitle>
            </DialogHeader>
            {selectedUser && (
              <form onSubmit={handleSubmitBalance} className="space-y-4">
                <div>
                  <Label>Mevcut Bakiye</Label>
                  <p className="text-xl font-bold text-green-400">
                    {formatCurrency(selectedUser.balance)}
                  </p>
                </div>
                
                <div>
                  <Label>İşlem Türü</Label>
                  <Select value={balanceOperation} onValueChange={setBalanceOperation}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="set">Bakiye Belirle</SelectItem>
                      <SelectItem value="add">Bakiye Ekle</SelectItem>
                      <SelectItem value="subtract">Bakiye Çıkar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Miktar (TRY)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={balanceAmount}
                    onChange={(e) => setBalanceAmount(e.target.value)}
                    className="bg-gray-700 border-gray-600 text-white"
                    required
                  />
                </div>
                
                <div className="flex gap-2 justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setBalanceDialogOpen(false);
                      setBalanceAmount('');
                    }}
                    className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                  >
                    İptal
                  </Button>
                  <Button
                    type="submit"
                    disabled={updateBalanceMutation.isPending || !balanceAmount}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Güncelle
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}