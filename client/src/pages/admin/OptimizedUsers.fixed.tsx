import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminLanguage } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Filter,
  Edit,
  Trash,
  Eye,
  UserPlus,
  Download,
  CheckCircle,
  XCircle,
  Ban,
  ArrowUpRight,
  X,
  RefreshCcw,
  Save,
  User,
  Mail,
  Wallet,
  Calendar,
  Clock,
  Shield,
  ChevronDown,
  Phone,
  MapPin,
  UserIcon,
  Coins,
  Plus,
  Minus,
  RefreshCw,
  AlertTriangle,
  GamepadIcon,
  History,
  ClipboardList,
  LayoutGrid,
  Database,
  CreditCard
} from 'lucide-react';
import OptimizedDataTable, { DataColumn } from '@/components/admin/OptimizedDataTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Kullanıcı verisi için tip tanımı
interface UserData {
  id: number;
  username: string;
  email: string;
  balance: number | null;
  status: 'active' | 'inactive' | 'suspended';
  fullName: string | null;
  firstName?: string | null;
  lastName?: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  postalCode: string | null;
  birthdate: string | null;
  vipLevel: number | null;
  vipPoints: number | null;
  notes: string | null;
  createdAt: string | null;
  lastLogin: string | null;
  role: string | null;
  isActive: boolean;
  transactions?: Array<{
    date: string;
    type: string;
    amount: number;
    status: string;
    description: string;
  }>;
  gameActivity?: Array<{
    date: string;
    gameName: string;
    betAmount: number;
    winAmount: number;
    result: string;
  }>;
  logs?: Array<{
    date: string;
    action: string;
    ipAddress: string;
    details: string;
  }>;
  totalDeposits?: number;
  totalWithdrawals?: number;
  totalBets?: number;
  totalWins?: number;
}

// Kullanıcı durumu rozeti yardımcı bileşeni
const UserStatusBadge = ({ status, showIcon = true }: { status: string, showIcon?: boolean }) => {
  let bgColor = 'bg-gray-500/20';
  let textColor = 'text-gray-400';
  let Icon = Clock;

  if (status === 'active') {
    bgColor = 'bg-green-500/20';
    textColor = 'text-green-500';
    Icon = CheckCircle;
  } else if (status === 'inactive') {
    bgColor = 'bg-gray-500/20';
    textColor = 'text-gray-400';
    Icon = X;
  } else if (status === 'suspended') {
    bgColor = 'bg-red-500/20';
    textColor = 'text-red-500';
    Icon = Ban;
  } else if (status === 'pending') {
    bgColor = 'bg-yellow-500/20';
    textColor = 'text-yellow-500';
    Icon = Clock;
  }

  return (
    <span className={`px-2 py-1 rounded-full flex items-center w-fit ${bgColor} ${textColor} border border-${textColor.replace('text-', '')}/30`}>
      {showIcon && <Icon className="h-3 w-3 mr-1" />}
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// Kullanıcı durumu ikonu yardımcı bileşeni
const UserStatusIcon = ({ status }: { status: string }) => {
  if (status === 'active') return <CheckCircle className="h-4 w-4 text-white" />;
  if (status === 'suspended') return <AlertTriangle className="h-4 w-4 text-white" />;
  if (status === 'inactive') return <X className="h-4 w-4 text-white" />;
  return <Clock className="h-4 w-4 text-white" />;
};

// İşlem tipi rozeti
const TransactionTypeBadge = ({ type }: { type: string }) => {
  let bgColor = 'bg-gray-500/20';
  let textColor = 'text-gray-400';
  let label = type;
  
  if (type === 'deposit') {
    bgColor = 'bg-green-500/20';
    textColor = 'text-green-500';
    label = 'Yatırım';
  } else if (type === 'withdrawal') {
    bgColor = 'bg-red-500/20';
    textColor = 'text-red-500';
    label = 'Çekim';
  } else if (type === 'bet') {
    bgColor = 'bg-blue-500/20';
    textColor = 'text-blue-500';
    label = 'Bahis';
  } else if (type === 'win') {
    bgColor = 'bg-yellow-500/20';
    textColor = 'text-yellow-500';
    label = 'Kazanç';
  } else if (type === 'bonus') {
    bgColor = 'bg-purple-500/20';
    textColor = 'text-purple-500';
    label = 'Bonus';
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
};

// İşlem durumu rozeti
const TransactionStatusBadge = ({ status }: { status: string }) => {
  let bgColor = 'bg-gray-500/20';
  let textColor = 'text-gray-400';
  let label = status;
  
  if (status === 'completed') {
    bgColor = 'bg-green-500/20';
    textColor = 'text-green-500';
    label = 'Tamamlandı';
  } else if (status === 'pending') {
    bgColor = 'bg-yellow-500/20';
    textColor = 'text-yellow-500';
    label = 'Beklemede';
  } else if (status === 'failed') {
    bgColor = 'bg-red-500/20';
    textColor = 'text-red-500';
    label = 'Başarısız';
  } else if (status === 'cancelled') {
    bgColor = 'bg-gray-500/20';
    textColor = 'text-gray-400';
    label = 'İptal Edildi';
  }
  
  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${bgColor} ${textColor}`}>
      {label}
    </span>
  );
};

export default function OptimizedUsers() {
  const { translate } = useAdminLanguage();
  const title = t('admin.users') || 'Kullanıcılar';
  
  // Durum değişkenleri
  const [users, setUsers] = useState<UserData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
  const [filter, setFilter] = useState('');
  const [totalUsers, setTotalUsers] = useState(0);
  const [loading, setLoading] = useState(true);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 50,
    total: 0
  });
  const [sortModel, setSortModel] = useState({
    field: 'id',
    sort: 'desc' as 'asc' | 'desc'
  });
  
  // Modal durum değişkenleri
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'games' | 'logs'>('overview');
  
  // API verilerini tanımlıyoruz
  interface Transaction {
    id: number;
    userId: number;
    type: string;
    amount: number;
    status: string;
    description: string | null;
    createdAt: string;
  }
  
  interface UserLog {
    id: number;
    userId: number;
    action: string;
    ipAddress: string | null;
    details: string | null;
    createdAt: string;
  }
  
  // Transaction ve log durumları için state'ler
  const [userTransactions, setUserTransactions] = useState<Transaction[]>([]);
  const [userLogs, setUserLogs] = useState<UserLog[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [logsLoading, setLogsLoading] = useState(false);
  
  // Bakiye ayarlama için state
  const [balanceAmount, setBalanceAmount] = useState('');
  const [balanceLoading, setBalanceLoading] = useState(false);
  
  // Durum değiştirme işlemi loading state'i
  const [statusLoading, setStatusLoading] = useState(false);
  
  const { toast } = useToast();

  // Kullanıcı işlemlerini getir
  const fetchUserTransactions = useCallback(async (userId: number) => {
    setTransactionsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/transactions`);
      if (!response.ok) {
        throw new Error('İşlem verileri alınamadı');
      }
      const data = await response.json();
      setUserTransactions(data);
    } catch (error) {
      console.error('Transactions error:', error);
      toast({
        title: "Hata",
        description: "İşlem verileri yüklenirken bir sorun oluştu.",
        variant: "destructive",
      });
      // Hata durumunda boş dizi göster
      setUserTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  }, [toast]);
  
  // Kullanıcı günlüklerini getir
  const fetchUserLogs = useCallback(async (userId: number) => {
    setLogsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/logs`);
      if (!response.ok) {
        throw new Error('Günlük verileri alınamadı');
      }
      const data = await response.json();
      setUserLogs(data);
    } catch (error) {
      console.error('Logs error:', error);
      toast({
        title: "Hata",
        description: "Kullanıcı günlükleri yüklenirken bir sorun oluştu.",
        variant: "destructive",
      });
      // Hata durumunda boş dizi göster
      setUserLogs([]);
    } finally {
      setLogsLoading(false);
    }
  }, [toast]);
  
  // Kullanıcı durumunu değiştir
  const handleStatusChange = useCallback(async (userId: number, status: string) => {
    setStatusLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if (!response.ok) {
        throw new Error('Durum güncellenemedi');
      }
      
      const updatedUser = await response.json();
      
      // Kullanıcı listesini güncelle
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, status: status as 'active' | 'inactive' | 'suspended' } : user
        )
      );
      
      // Seçili kullanıcıyı güncelle
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, status: status as 'active' | 'inactive' | 'suspended' });
      }
      
      // Kullanıcı logunu oluştur
      await fetch('/api/admin/userLogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          action: 'status_change',
          details: `Kullanıcı durumu '${status}' olarak değiştirildi`
        })
      });
      
      // Logları yenile
      fetchUserLogs(userId);
      
      toast({
        title: t('admin.status_updated') || 'Durum Güncellendi',
        description: t('admin.status_update_success') || 'Kullanıcı durumu başarıyla güncellendi.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Durum güncelleme hatası:', error);
      toast({
        title: t('admin.status_update_failed') || 'Durum Güncellenemedi',
        description: t('admin.status_update_error') || 'Kullanıcı durumu güncellenirken bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setStatusLoading(false);
    }
  }, [selectedUser, toast, t, fetchUserLogs]);
  
  // Kullanıcı bakiyesini değiştir
  const handleBalanceChange = useCallback(async (userId: number, amount: number, operation: 'add' | 'deduct') => {
    if (amount <= 0) return;
    
    setBalanceLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/balance`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount, operation })
      });
      
      if (!response.ok) {
        throw new Error('Bakiye güncellenemedi');
      }
      
      const updatedUser = await response.json();
      
      // Kullanıcı listesini güncelle
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId ? { ...user, balance: updatedUser.balance } : user
        )
      );
      
      // Seçili kullanıcıyı güncelle
      if (selectedUser && selectedUser.id === userId) {
        setSelectedUser({ ...selectedUser, balance: updatedUser.balance });
      }
      
      // İşlem kaydı oluştur
      const transactionType = operation === 'add' ? 'deposit' : 'withdrawal';
      const description = operation === 'add' 
        ? 'Admin tarafından bakiye eklendi' 
        : 'Admin tarafından bakiye düşüldü';
        
      await fetch('/api/admin/transactions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId,
          type: transactionType,
          amount: amount,
          status: 'completed',
          description
        })
      });
      
      // İşlemleri yenile
      fetchUserTransactions(userId);
      
      // Input alanını temizle
      setBalanceAmount('');
      
      toast({
        title: t('admin.balance_updated') || 'Bakiye Güncellendi',
        description: operation === 'add' 
          ? t('admin.balance_added', { amount }) || `${amount} ₺ bakiye eklendi.`
          : t('admin.balance_deducted', { amount }) || `${amount} ₺ bakiye düşüldü.`,
        variant: 'default',
      });
    } catch (error) {
      console.error('Bakiye güncelleme hatası:', error);
      toast({
        title: t('admin.balance_update_failed') || 'Bakiye Güncellenemedi',
        description: t('admin.balance_update_error') || 'Kullanıcı bakiyesi güncellenirken bir hata oluştu.',
        variant: 'destructive',
      });
    } finally {
      setBalanceLoading(false);
    }
  }, [selectedUser, toast, t, fetchUserTransactions]);
  
  // Kullanıcı detaylarını göster
  const handleViewDetails = useCallback((user: UserData) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
    setActiveTab('overview');
    
    // Kullanıcı işlemlerini ve günlüklerini getir
    fetchUserTransactions(user.id);
    fetchUserLogs(user.id);
  }, [fetchUserTransactions, fetchUserLogs]);
  
  const handleEditUser = useCallback((user: UserData) => {
    setSelectedUser(user);
    setShowEditModal(true);
  }, []);
  
  const handleDeleteClick = useCallback((id: number) => {
    setUserToDelete(id);
    setShowDeleteModal(true);
  }, []);
  
  const confirmDelete = useCallback(async () => {
    if (!userToDelete) return;
    
    try {
      // Kullanıcı silme isteği
      const response = await fetch(`/api/admin/users/${userToDelete}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Kullanıcı silinemedi');
      }
      
      // Kullanıcı listesini güncelle
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userToDelete));
      
      toast({
        title: t('admin.user_deleted') || 'Kullanıcı Silindi',
        description: t('admin.user_deleted_success') || `Kullanıcı #${userToDelete} başarıyla silindi.`,
        variant: 'default',
      });
      
      // Modalı kapat ve seçili kullanıcıyı temizle
      setShowDeleteModal(false);
      setUserToDelete(null);
    } catch (error) {
      console.error('Kullanıcı silme hatası:', error);
      toast({
        title: t('admin.user_delete_failed') || 'Kullanıcı Silinemedi',
        description: t('admin.user_delete_error') || 'Kullanıcı silinirken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  }, [userToDelete, toast, t]);
  
  // Tablo sütun tanımları
  const columns: DataColumn<UserData>[] = useMemo(() => [
    {
      key: 'id',
      header: 'ID',
      width: 'w-16',
      sortable: true,
      cell: (row) => (
        <div className="font-mono text-xs">#{row.id}</div>
      )
    },
    {
      key: 'username',
      header: t('admin.users_username', 'Kullanıcı Adı'),
      sortable: true,
      cell: (row) => (
        <div className="font-medium text-white">{row.username}</div>
      )
    },
    {
      key: 'email',
      header: t('admin.email') || 'E-posta',
      sortable: true,
      cell: (row) => (
        <div className="text-gray-300">{row.email}</div>
      )
    },
    {
      key: 'balance',
      header: t('admin.balance') || 'Bakiye',
      sortable: true,
      cell: (row) => (
        <div className="font-medium">
          {row.balance ? (
            <span className="text-green-400">{row.balance.toLocaleString()} ₺</span>
          ) : (
            <span className="text-gray-500">0 ₺</span>
          )}
        </div>
      )
    },
    {
      key: 'status',
      header: t('admin.status') || 'Durum',
      sortable: true,
      cell: (row) => <UserStatusBadge status={row.status} />
    },
    {
      key: 'lastLogin',
      header: t('admin.last_login') || 'Son Giriş',
      sortable: true,
      cell: (row) => (
        <div className="text-sm text-gray-400">
          {row.lastLogin || t('admin.never') || 'Hiç'}
        </div>
      )
    },
    {
      key: 'actions',
      header: t('admin.actions') || 'İşlemler',
      cell: (row) => (
        <div className="flex space-x-1">
          <button
            onClick={() => handleViewDetails(row)}
            className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-400"
            title={t('admin.view_details') || 'Detayları Görüntüle'}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEditUser(row)}
            className="p-1.5 rounded-lg hover:bg-yellow-500/10 text-yellow-400"
            title={t('admin.edit') || 'Düzenle'}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDeleteClick(row.id)}
            className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-400"
            title={t('admin.delete') || 'Sil'}
          >
            <Trash className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ], [t, handleViewDetails, handleEditUser, handleDeleteClick]);
  
  // İstatistik kartı bileşeni
  const StatCard = useCallback(({ title, value, icon: Icon, secondaryText, secondaryValue }: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    secondaryText?: string;
    secondaryValue?: number | string;
  }) => {
    return (
      <div className="bg-gray-800/80 p-6 rounded-xl shadow-lg border border-yellow-500/20 backdrop-blur-sm hover:border-yellow-500/30 transition-all duration-300">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-gray-400 text-sm font-medium mb-1">{title}</p>
            <h3 className="text-2xl font-bold text-white">{typeof value === 'number' ? value.toLocaleString() : value}</h3>
            {secondaryText && (
              <div className="flex items-center mt-2">
                <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                <span className="text-sm font-medium text-green-500">
                  {secondaryText}: {secondaryValue}
                </span>
              </div>
            )}
          </div>
          <div className="p-3 bg-gray-900/80 border border-yellow-500/30 rounded-lg shadow-md">
            <Icon className="h-8 w-8 text-yellow-500" />
          </div>
        </div>
      </div>
    );
  }, []);
  
  // API'den kullanıcı verilerini çek
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      try {
        // Gerçek uygulamada API'dan veri çekilecek
        const response = await fetch(`/api/admin/users?page=${paginationModel.page + 1}&limit=${paginationModel.pageSize}&sortBy=${sortModel.field}&sortOrder=${sortModel.sort}${filter ? `&filter=${filter}` : ''}`);
        const data = await response.json();
        
        setUsers(data.items);
        setPaginationModel(prev => ({ ...prev, total: data._meta.totalCount }));
        setTotalUsers(data._meta.totalCount);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Veri Yüklenemedi",
          description: "Kullanıcı verileri yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [paginationModel.page, paginationModel.pageSize, sortModel, filter, toast]);
  
  // İstatistik bilgileri
  const userStats = useMemo(() => {
    return {
      totalUsers,
      activeUsers: users.filter(user => user.status === 'active').length,
      inactiveUsers: users.filter(user => user.status === 'inactive').length,
      suspendedUsers: users.filter(user => user.status === 'suspended').length,
      newUsersToday: 5 // Örnek veri, gerçek uygulamada API'dan alınacak
    };
  }, [users, totalUsers]);
  
  return (
    <AdminLayout title={title}>
      <div className="space-y-6">
        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard
            title={t('admin.total_users') || 'Toplam Kullanıcı'}
            value={userStats.totalUsers}
            icon={User}
            secondaryText={t('admin.new_today') || 'Bugün Yeni'}
            secondaryValue={userStats.newUsersToday}
          />
          <StatCard
            title={t('admin.active_users') || 'Aktif Kullanıcılar'}
            value={userStats.activeUsers}
            icon={CheckCircle}
          />
          <StatCard
            title={t('admin.inactive_users') || 'Pasif Kullanıcılar'}
            value={userStats.inactiveUsers}
            icon={Clock}
          />
          <StatCard
            title={t('admin.suspended_users') || 'Askıya Alınmış Kullanıcılar'}
            value={userStats.suspendedUsers}
            icon={Ban}
          />
        </div>
        
        {/* Filtreler ve İşlem Butonları */}
        <div className="flex flex-col md:flex-row justify-between space-y-4 md:space-y-0">
          <div className="flex-1 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
              <Input
                className="pl-10 bg-gray-800 border-gray-700 text-white w-full"
                placeholder={t('admin.search_users') || "Kullanıcı ara..."}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              />
            </div>
            
            <div className="flex space-x-2">
              <Select
                value={sortModel.field}
                onValueChange={(value) => setSortModel({...sortModel, field: value})}
              >
                <SelectTrigger className="w-[150px] bg-gray-800 border-gray-700 text-white">
                  <div className="flex items-center">
                    <Filter className="mr-2 h-4 w-4 text-gray-400" />
                    <SelectValue placeholder="Sırala" />
                  </div>
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="id">{t('admin.id') || 'ID'}</SelectItem>
                  <SelectItem value="username">{t('admin.username') || 'Kullanıcı Adı'}</SelectItem>
                  <SelectItem value="email">{t('admin.email') || 'E-posta'}</SelectItem>
                  <SelectItem value="balance">{t('admin.balance') || 'Bakiye'}</SelectItem>
                  <SelectItem value="status">{t('admin.status') || 'Durum'}</SelectItem>
                  <SelectItem value="lastLogin">{t('admin.last_login') || 'Son Giriş'}</SelectItem>
                </SelectContent>
              </Select>
              
              <Select
                value={sortModel.sort}
                onValueChange={(value) => setSortModel({...sortModel, sort: value as 'asc' | 'desc'})}
              >
                <SelectTrigger className="w-[120px] bg-gray-800 border-gray-700 text-white">
                  <SelectValue placeholder="Yön" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="asc">{t('admin.ascending') || 'Artan'}</SelectItem>
                  <SelectItem value="desc">{t('admin.descending') || 'Azalan'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => {}}>
              <RefreshCw className="h-4 w-4 mr-2" />
              {t('admin.refresh') || 'Yenile'}
            </Button>
            
            <Button className="bg-yellow-500 hover:bg-yellow-600" onClick={() => {}}>
              <UserPlus className="h-4 w-4 mr-2" />
              {t('admin.add_user') || 'Kullanıcı Ekle'}
            </Button>
          </div>
        </div>
        
        {/* Veri Tablosu */}
        <OptimizedDataTable
          columns={columns}
          data={users}
          pagination={{
            pageSize: paginationModel.pageSize,
            page: paginationModel.page,
            totalPages: Math.ceil(paginationModel.total / paginationModel.pageSize),
            totalItems: paginationModel.total,
            onPageChange: (page) => setPaginationModel({...paginationModel, page}),
            onPageSizeChange: (pageSize) => setPaginationModel({...paginationModel, pageSize, page: 0})
          }}
          loading={loading}
          emptyMessage={t('admin.no_users_found') || 'Kullanıcı bulunamadı.'}
          loadingMessage={t('admin.loading') || 'Yükleniyor...'}
        />
      </div>
      
      {/* Kullanıcı Silme Modal */}
      {showDeleteModal && (
        <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
          <DialogContent className="bg-gray-800 text-white border border-yellow-500/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                {t('admin.confirm_delete') || 'Kullanıcıyı Silmek İstediğinize Emin Misiniz?'}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4 text-gray-300">
              {t('admin.delete_warning') || 'Bu işlem geri alınamaz. Bu kullanıcıyı silmek istediğinize emin misiniz?'}
            </div>
            <DialogFooter className="mt-6">
              <Button
                variant="destructive"
                onClick={confirmDelete}
              >
                {t('admin.delete') || 'Sil'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(false)}
              >
                {t('admin.cancel') || 'İptal'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Kullanıcı Detayları Modal */}
      {showDetailsModal && selectedUser && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent className="bg-gray-800 text-white border border-yellow-500/30 max-w-5xl max-h-[90vh] overflow-y-auto">
            <DialogHeader className="border-b border-yellow-500/20 pb-4">
              <DialogTitle className="text-xl font-bold text-white flex items-center">
                <User className="h-5 w-5 text-yellow-500 mr-2" />
                {selectedUser.username}
                <span className="ml-2 text-sm font-normal text-gray-400">#{selectedUser.id}</span>
                
                <div className="ml-auto flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border-yellow-500/30"
                    onClick={() => {
                      setShowDetailsModal(false);
                      handleEditUser(selectedUser);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    {t('admin.edit_user') || 'Düzenle'}
                  </Button>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30"
                    onClick={() => {
                      setShowDetailsModal(false);
                      setUserToDelete(selectedUser.id);
                      setShowDeleteModal(true);
                    }}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    {t('admin.delete') || 'Sil'}
                  </Button>
                </div>
              </DialogTitle>
              
              <Tabs 
                defaultValue="overview" 
                className="mt-4"
                onValueChange={(value) => setActiveTab(value as 'overview' | 'transactions' | 'games' | 'logs')}
              >
                <TabsList className="bg-gray-700/50 border border-yellow-500/20">
                  <TabsTrigger 
                    value="overview" 
                    className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
                  >
                    <LayoutGrid className="h-4 w-4 mr-2" />
                    {t('admin.overview') || 'Genel Bakış'}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="transactions" 
                    className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
                  >
                    <History className="h-4 w-4 mr-2" />
                    {t('admin.transactions') || 'İşlemler'}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="games" 
                    className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
                  >
                    <GamepadIcon className="h-4 w-4 mr-2" />
                    {t('admin.games') || 'Oyunlar'}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="logs" 
                    className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
                  >
                    <ClipboardList className="h-4 w-4 mr-2" />
                    {t('admin.logs') || 'Günlük'}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="overview" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Sol Bölüm - Kullanıcı Ana Bilgileri */}
                    <div className="bg-gray-700/50 p-5 rounded-xl border border-yellow-500/20 col-span-1">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Shield className="h-5 w-5 text-yellow-500 mr-2" />
                        {t('admin.account_info') || 'Hesap Bilgileri'}
                      </h3>
                      
                      <div className="space-y-4">
                        <div className="flex items-center justify-center mb-6">
                          <div className="w-24 h-24 rounded-full bg-gray-800/80 flex items-center justify-center border-4 border-yellow-500/20 shadow-lg relative group">
                            <User className="h-12 w-12 text-yellow-500/70" />
                            
                            {/* Durum İşareti */}
                            <div className={`absolute -right-1 -bottom-1 w-7 h-7 rounded-full flex items-center justify-center 
                              ${selectedUser.status === 'active' ? 'bg-green-500' : 
                                selectedUser.status === 'inactive' ? 'bg-gray-500' : 
                                selectedUser.status === 'suspended' ? 'bg-red-500' : 'bg-yellow-500'}`}>
                              {selectedUser.status === 'active' ? <CheckCircle className="h-4 w-4 text-white" /> : 
                                selectedUser.status === 'inactive' ? <XCircle className="h-4 w-4 text-white" /> : 
                                <Ban className="h-4 w-4 text-white" />}
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-gray-800/60 rounded-lg p-3 border border-yellow-500/10 mb-4">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <p className="text-xs text-gray-400">{t('admin.user_id') || 'Kullanıcı ID'}</p>
                              <p className="font-medium text-white">#{selectedUser.id}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">{t('admin.status') || 'Durum'}</p>
                              <p className="font-medium">
                                <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full
                                  ${selectedUser.status === 'active' ? 'bg-green-500/20 text-green-400' : 
                                    selectedUser.status === 'inactive' ? 'bg-gray-500/20 text-gray-400' : 
                                    'bg-red-500/20 text-red-400'}`}>
                                  {selectedUser.status === 'active' ? 
                                    <>{t('admin.active') || 'Aktif'}</> : 
                                    selectedUser.status === 'inactive' ? 
                                    <>{t('admin.inactive') || 'Pasif'}</> : 
                                    <>{t('admin.suspended') || 'Askıya Alınmış'}</>}
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Kullanıcı Kimlik Bilgileri */}
                        <div className="p-3 bg-gray-800/60 rounded-lg border border-yellow-500/10 mt-2 space-y-3">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-yellow-500/70" />
                            <div>
                              <p className="text-xs text-gray-400">{t('admin.username') || 'Kullanıcı Adı'}</p>
                              <p className="font-medium text-white">{selectedUser.username}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-yellow-500/70" />
                            <div>
                              <p className="text-xs text-gray-400">{t('admin.email') || 'E-posta'}</p>
                              <p className="font-medium text-white">{selectedUser.email}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Wallet className="h-4 w-4 text-yellow-500/70" />
                            <div>
                              <p className="text-xs text-gray-400">{t('admin.balance') || 'Bakiye'}</p>
                              <p className="font-medium text-white">{selectedUser.balance?.toLocaleString() || 0} ₺</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-yellow-500/70" />
                            <div>
                              <p className="text-xs text-gray-400">{t('admin.join_date') || 'Kayıt Tarihi'}</p>
                              <p className="font-medium text-white">{selectedUser.createdAt || t('admin.not_available') || 'Mevcut Değil'}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-yellow-500/70" />
                            <div>
                              <p className="text-xs text-gray-400">{t('admin.last_login') || 'Son Giriş'}</p>
                              <p className="font-medium text-white">{selectedUser.lastLogin || t('admin.never') || 'Hiç'}</p>
                            </div>
                          </div>
                        </div>
                        
                        {/* VIP Bilgileri */}
                        <p className="text-sm font-medium text-white mt-4 mb-2 flex items-center">
                          <span className="bg-yellow-500/30 text-yellow-300 text-xs px-1.5 py-0.5 rounded mr-2">VIP</span>
                          {t('admin.vip_level') || 'VIP Seviyesi'}
                        </p>
                        
                        <div className="bg-gray-800/60 rounded-lg border border-yellow-500/10 p-3">
                          <div className="flex justify-between items-center">
                            <p className="text-lg font-bold text-white">Level {selectedUser.vipLevel || 0}</p>
                            <p className="text-xs text-gray-400">{t('admin.vip_points') || 'VIP Puanı'}: {selectedUser.vipPoints || 0}</p>
                          </div>
                          
                          <div className="w-full h-2 bg-gray-700 rounded-full mt-2 overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-yellow-500 to-amber-400" 
                              style={{ width: `${Math.min(((selectedUser.vipPoints || 0) / 1000) * 100, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Sağ Bölüm - İletişim ve Kişisel Bilgiler */}
                    <div className="bg-gray-700/50 p-5 rounded-xl border border-yellow-500/20 col-span-1">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <User className="h-5 w-5 text-yellow-500 mr-2" />
                        {t('admin.personal_info') || 'Kişisel Bilgiler'}
                      </h3>
                      
                      <div className="space-y-4 p-3 bg-gray-800/60 rounded-lg border border-yellow-500/10">
                        {/* Tam İsim */}
                        <div>
                          <p className="text-xs text-gray-400">{t('admin.full_name') || 'Tam İsim'}</p>
                          <p className="font-medium text-white">{selectedUser.fullName || t('admin.not_specified') || 'Belirtilmemiş'}</p>
                        </div>
                        
                        {/* Telefon */}
                        <div>
                          <p className="text-xs text-gray-400">{t('admin.phone') || 'Telefon'}</p>
                          <p className="font-medium text-white">{selectedUser.phone || t('admin.not_specified') || 'Belirtilmemiş'}</p>
                        </div>
                        
                        {/* Adres */}
                        <div>
                          <p className="text-xs text-gray-400">{t('admin.address') || 'Adres'}</p>
                          <p className="font-medium text-white">{selectedUser.address || t('admin.not_specified') || 'Belirtilmemiş'}</p>
                        </div>
                        
                        {/* Ülke/Şehir */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-xs text-gray-400">{t('admin.country') || 'Ülke'}</p>
                            <p className="font-medium text-white">{selectedUser.country || t('admin.not_specified') || 'Belirtilmemiş'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-400">{t('admin.city') || 'Şehir'}</p>
                            <p className="font-medium text-white">{selectedUser.city || t('admin.not_specified') || 'Belirtilmemiş'}</p>
                          </div>
                        </div>
                        
                        {/* Doğum Tarihi */}
                        <div>
                          <p className="text-xs text-gray-400">{t('admin.birthdate') || 'Doğum Tarihi'}</p>
                          <p className="font-medium text-white">{selectedUser.birthdate || t('admin.not_specified') || 'Belirtilmemiş'}</p>
                        </div>
                      </div>
                      
                      {/* Özel Notlar */}
                      <div className="mt-4">
                        <p className="text-sm font-medium text-white mb-2">{t('admin.notes') || 'Notlar'}</p>
                        <textarea 
                          className="w-full bg-gray-800/60 rounded-lg border border-yellow-500/10 p-3 text-white" 
                          rows={3}
                          placeholder={t('admin.add_notes') || 'Kullanıcı hakkında notlar ekleyin...'}
                          defaultValue={selectedUser.notes || ''}
                        ></textarea>
                        
                        <div className="flex justify-end mt-2">
                          <Button variant="outline" size="sm" className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                            <Save className="h-3.5 w-3.5 mr-1" />
                            {t('admin.save_notes') || 'Notları Kaydet'}
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* İstatistikler */}
                    <div className="bg-gray-700/50 p-5 rounded-xl border border-yellow-500/20 col-span-1">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <Database className="h-5 w-5 text-yellow-500 mr-2" />
                        {t('admin.statistics') || 'İstatistikler'}
                      </h3>
                      
                      <div className="space-y-5">
                        {/* Bakiye Özeti */}
                        <div className="p-4 bg-gray-800/60 rounded-lg border border-yellow-500/10">
                          <h4 className="text-sm font-medium text-white mb-3">{t('admin.balance_summary') || 'Bakiye Özeti'}</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-center p-2 bg-green-500/10 rounded-lg">
                              <p className="text-xs text-gray-400">{t('admin.total_deposits') || 'Toplam Yatırım'}</p>
                              <p className="text-lg font-bold text-green-400">
                                +{selectedUser.totalDeposits?.toLocaleString() || '0'} ₺
                              </p>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-red-500/10 rounded-lg">
                              <p className="text-xs text-gray-400">{t('admin.total_withdrawals') || 'Toplam Çekim'}</p>
                              <p className="text-lg font-bold text-red-400">
                                -{selectedUser.totalWithdrawals?.toLocaleString() || '0'} ₺
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Oyun İstatistikleri */}
                        <div className="p-4 bg-gray-800/60 rounded-lg border border-yellow-500/10">
                          <h4 className="text-sm font-medium text-white mb-3">{t('admin.game_statistics') || 'Oyun İstatistikleri'}</h4>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col items-center p-2 bg-blue-500/10 rounded-lg">
                              <p className="text-xs text-gray-400">{t('admin.total_bets') || 'Toplam Bahis'}</p>
                              <p className="text-lg font-bold text-blue-400">
                                {selectedUser.totalBets?.toLocaleString() || '0'} ₺
                              </p>
                            </div>
                            <div className="flex flex-col items-center p-2 bg-yellow-500/10 rounded-lg">
                              <p className="text-xs text-gray-400">{t('admin.total_wins') || 'Toplam Kazanç'}</p>
                              <p className="text-lg font-bold text-yellow-400">
                                {selectedUser.totalWins?.toLocaleString() || '0'} ₺
                              </p>
                            </div>
                          </div>
                        </div>
                        
                        {/* Kullanıcı Durumu Hızlı Değiştirme */}
                        <div className="p-4 bg-gray-800/60 rounded-lg border border-yellow-500/10">
                          <h4 className="text-sm font-medium text-white mb-3">{t('admin.quick_actions') || 'Hızlı İşlemler'}</h4>
                          <div className="grid grid-cols-2 gap-3">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/30"
                              onClick={() => handleStatusChange(selectedUser.id, 'active')}
                              disabled={selectedUser.status === 'active' || statusLoading}
                            >
                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                              {t('admin.activate') || 'Aktifleştir'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30"
                              onClick={() => handleStatusChange(selectedUser.id, 'suspended')}
                              disabled={selectedUser.status === 'suspended' || statusLoading}
                            >
                              <Ban className="h-3.5 w-3.5 mr-1" />
                              {t('admin.suspend') || 'Askıya Al'}
                            </Button>
                          </div>
                        </div>
                        
                        {/* Bakiye İşlemleri */}
                        <div className="p-4 bg-gray-800/60 rounded-lg border border-yellow-500/10">
                          <h4 className="text-sm font-medium text-white mb-3">{t('admin.adjust_balance') || 'Bakiye Ayarla'}</h4>
                          <div className="flex space-x-2 mb-3">
                            <Input 
                              type="number" 
                              min="0"
                              className="bg-gray-900 border-gray-700 text-white"
                              placeholder={t('admin.amount') || 'Miktar'}
                              value={balanceAmount}
                              onChange={(e) => setBalanceAmount(e.target.value)}
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-green-500/10 hover:bg-green-500/20 text-green-500 border-green-500/30"
                              onClick={() => handleBalanceChange(selectedUser.id, Number(balanceAmount), 'add')}
                              disabled={!balanceAmount || isNaN(Number(balanceAmount)) || Number(balanceAmount) <= 0 || balanceLoading}
                            >
                              <Plus className="h-3.5 w-3.5 mr-1" />
                              {t('admin.add_funds') || 'Ekle'}
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border-red-500/30"
                              onClick={() => handleBalanceChange(selectedUser.id, Number(balanceAmount), 'deduct')}
                              disabled={!balanceAmount || isNaN(Number(balanceAmount)) || Number(balanceAmount) <= 0 || balanceLoading || (selectedUser.balance || 0) < Number(balanceAmount)}
                            >
                              <Minus className="h-3.5 w-3.5 mr-1" />
                              {t('admin.deduct_funds') || 'Çıkar'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="transactions" className="mt-6">
                  <div className="bg-gray-700/50 p-5 rounded-xl border border-yellow-500/20">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <History className="h-5 w-5 text-yellow-500 mr-2" />
                      {t('admin.transaction_history') || 'İşlem Geçmişi'}
                    </h3>
                    
                    {transactionsLoading ? (
                      <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                        <span className="ml-3 text-yellow-500">{t('admin.loading_transactions') || 'İşlemler yükleniyor...'}</span>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b border-yellow-500/20">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">{t('admin.date') || 'Tarih'}</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">{t('admin.type') || 'Tür'}</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">{t('admin.amount') || 'Tutar'}</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">{t('admin.status') || 'Durum'}</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">{t('admin.description') || 'Açıklama'}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userTransactions.length > 0 ? (
                                userTransactions.map((transaction, index) => (
                                  <tr key={transaction.id} className={index % 2 === 0 ? 'bg-gray-800/30' : ''}>
                                    <td className="py-3 px-4 text-sm text-white">
                                      {new Date(transaction.createdAt).toLocaleString('tr-TR')}
                                    </td>
                                    <td className="py-3 px-4 text-sm">
                                      <TransactionTypeBadge type={transaction.type} />
                                    </td>
                                    <td className="py-3 px-4 text-sm">
                                      <span className={`font-medium ${
                                        transaction.type === 'deposit' || transaction.type === 'win' || transaction.type === 'bonus' 
                                          ? 'text-green-400' 
                                          : 'text-red-400'
                                      }`}>
                                        {transaction.type === 'deposit' || transaction.type === 'win' || transaction.type === 'bonus' 
                                          ? '+' : '-'}
                                        {transaction.amount.toLocaleString()} ₺
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm">
                                      <TransactionStatusBadge status={transaction.status} />
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-300">
                                      {transaction.description || '-'}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={5} className="py-6 text-center text-gray-400">
                                    <CreditCard className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                                    <p>{t('admin.no_transactions') || 'Kullanıcıya ait işlem bulunamadı.'}</p>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        
                        {userTransactions.length > 0 && (
                          <div className="flex justify-between items-center mt-4">
                            <div className="text-sm text-gray-400">
                              {userTransactions.length} işlem gösteriliyor
                            </div>
                            <Button variant="outline" size="sm" className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                              <Download className="h-3.5 w-3.5 mr-1" />
                              {t('admin.export_all') || 'Tümünü Dışa Aktar'}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="games" className="mt-6">
                  <div className="bg-gray-700/50 p-5 rounded-xl border border-yellow-500/20">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <GamepadIcon className="h-5 w-5 text-yellow-500 mr-2" />
                      {t('admin.game_activity') || 'Oyun Aktivitesi'}
                    </h3>
                    
                    {/* Bu kısım geliştirme aşamasında olduğu için basit bir bilgi mesajı gösteriyoruz */}
                    <div className="p-6 rounded-lg bg-gray-800/60 border border-yellow-500/10 text-center">
                      <GamepadIcon className="h-10 w-10 mx-auto mb-2 text-yellow-500/60" />
                      <h4 className="text-lg font-medium text-white mb-2">
                        {t('admin.feature_coming_soon') || 'Bu özellik yakında eklenecek'}
                      </h4>
                      <p className="text-gray-400 max-w-lg mx-auto">
                        {t('admin.game_activity_desc') || 'Kullanıcıların oyun aktivite geçmişleri yakında burada görüntülenebilecek.'}
                      </p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="logs" className="mt-6">
                  <div className="bg-gray-700/50 p-5 rounded-xl border border-yellow-500/20">
                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                      <ClipboardList className="h-5 w-5 text-yellow-500 mr-2" />
                      {t('admin.user_logs') || 'Kullanıcı Günlükleri'}
                    </h3>
                    
                    {logsLoading ? (
                      <div className="flex justify-center items-center p-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
                        <span className="ml-3 text-yellow-500">{t('admin.loading_logs') || 'Günlükler yükleniyor...'}</span>
                      </div>
                    ) : (
                      <>
                        <div className="overflow-x-auto">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="border-b border-yellow-500/20">
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">{t('admin.date') || 'Tarih'}</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">{t('admin.action') || 'İşlem'}</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">{t('admin.ip_address') || 'IP Adresi'}</th>
                                <th className="text-left py-3 px-4 text-sm font-medium text-gray-300">{t('admin.details') || 'Detaylar'}</th>
                              </tr>
                            </thead>
                            <tbody>
                              {userLogs.length > 0 ? (
                                userLogs.map((log, index) => (
                                  <tr key={log.id} className={index % 2 === 0 ? 'bg-gray-800/30' : ''}>
                                    <td className="py-3 px-4 text-sm text-white">
                                      {new Date(log.createdAt).toLocaleString('tr-TR')}
                                    </td>
                                    <td className="py-3 px-4 text-sm">
                                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full
                                        ${log.action === 'login' ? 'bg-green-500/20 text-green-400' : 
                                          log.action === 'logout' ? 'bg-blue-500/20 text-blue-400' : 
                                          log.action === 'password_change' ? 'bg-yellow-500/20 text-yellow-400' :
                                          log.action === 'profile_update' ? 'bg-purple-500/20 text-purple-400' :
                                          'bg-gray-500/20 text-gray-400'}`}>
                                        {log.action === 'login' ? t('admin.login') || 'Giriş' : 
                                          log.action === 'logout' ? t('admin.logout') || 'Çıkış' : 
                                          log.action === 'password_change' ? t('admin.password_change') || 'Şifre Değişikliği' :
                                          log.action === 'profile_update' ? t('admin.profile_update') || 'Profil Güncelleme' :
                                          log.action === 'status_change' ? t('admin.status_change') || 'Durum Değişikliği' :
                                          log.action}
                                      </span>
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-300">
                                      {log.ipAddress || '-'}
                                    </td>
                                    <td className="py-3 px-4 text-sm text-gray-300">
                                      {log.details || '-'}
                                    </td>
                                  </tr>
                                ))
                              ) : (
                                <tr>
                                  <td colSpan={4} className="py-6 text-center text-gray-400">
                                    <ClipboardList className="h-10 w-10 mx-auto mb-2 text-gray-500" />
                                    <p>{t('admin.no_logs') || 'Kullanıcıya ait günlük bulunamadı.'}</p>
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        
                        {userLogs.length > 0 && (
                          <div className="flex justify-between items-center mt-4">
                            <div className="text-sm text-gray-400">
                              {userLogs.length} günlük gösteriliyor
                            </div>
                            <Button variant="outline" size="sm" className="bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                              <Download className="h-3.5 w-3.5 mr-1" />
                              {t('admin.export_all') || 'Tümünü Dışa Aktar'}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}