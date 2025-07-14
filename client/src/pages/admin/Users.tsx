import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import AdminLayout from '@/components/admin/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import UserDetailModal, { UserData, Transaction, UserLog } from '@/components/admin/UserDetailModal';
import AdvancedFilter, { FilterOptions } from '@/components/admin/AdvancedFilter';
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
  RefreshCw,
  Save,
  User,
  Plus,
  Minus
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// Kullanıcı durumu rozeti
const UserStatusBadge = ({ status }: { status: string }) => {
  let bgColor = 'bg-gray-500/20';
  let textColor = 'text-gray-400';
  let Icon = XCircle;

  if (status === 'active') {
    bgColor = 'bg-green-500/20';
    textColor = 'text-green-500';
    Icon = CheckCircle;
  } else if (status === 'inactive') {
    bgColor = 'bg-gray-500/20';
    textColor = 'text-gray-400';
    Icon = XCircle;
  } else if (status === 'suspended') {
    bgColor = 'bg-red-500/20';
    textColor = 'text-red-500';
    Icon = Ban;
  }

  return (
    <span className={`px-2 py-1 rounded-full flex items-center w-fit ${bgColor} ${textColor} border border-${textColor.replace('text-', '')}/30`}>
      <Icon className="h-3 w-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
  };

  // Kullanıcı ekleme handler'ı
  const handleAddUser = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      phone: '',
      role: 'user',
      status: 'active',
      balance: 0,
      vipLevel: 0
    });
    setShowAddModal(true);
  };

  // Yeni kullanıcı kaydetme
  const handleSaveNewUser = async () => {
    try {
      const adminToken = localStorage.getItem('admin_token');
      const normalToken = localStorage.getItem('token');
      const token = adminToken || normalToken;

      if (!token) {
        toast({
          title: "Oturum Hatası",
          description: "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Başarılı",
          description: "Kullanıcı başarıyla oluşturuldu.",
          variant: "default",
        });
        setShowAddModal(false);
        fetchUsers(); // Listeyi yenile
      } else {
        const error = await response.json();
        toast({
          title: "Hata",
          description: error.error || "Kullanıcı oluşturulamadı.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Kullanıcı oluşturma hatası:', error);
      toast({
        title: "Hata",
        description: "Bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

export default function Users() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const title = 'Kullanıcılar';
  
  // Durum değişkenleri
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [sortModel, setSortModel] = useState({
    field: 'id',
    sort: 'desc' as 'asc' | 'desc'
  });
  
  // Gelişmiş filtreler
  const [advancedFilters, setAdvancedFilters] = useState<FilterOptions>({
    searchTerm: '',
    status: [],
    balanceRange: [0, 100000],
    registrationDate: '',
    loginDate: '',
    role: '',
    country: ''
  });
  
  // Sayfalama
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  
  // Modal durumları
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [userToDelete, setUserToDelete] = useState<number | null>(null);
  
  // Form verileri
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'user',
    status: 'active',
    balance: 0,
    vipLevel: 0
  });
  
  // Gelişmiş filtreleri sorgu dizesine çevir
  const buildQueryString = useCallback(() => {
    const params = new URLSearchParams();
    
    // Temel sorgu parametreleri
    params.append('page', currentPage.toString());
    params.append('limit', pageSize.toString());
    params.append('sortBy', sortModel.field);
    params.append('sortOrder', sortModel.sort);
    
    // Arama terimi
    if (advancedFilters.searchTerm) {
      params.append('filter', advancedFilters.searchTerm);
    }
    
    // Durum filtresi
    if (advancedFilters.status && advancedFilters.status.length > 0) {
      advancedFilters.status.forEach(status => {
        params.append('status', status);
      });
    }
    
    // Bakiye aralığı
    if (advancedFilters.balanceRange) {
      params.append('minBalance', advancedFilters.balanceRange[0].toString());
      params.append('maxBalance', advancedFilters.balanceRange[1].toString());
    }
    
    // Tarih filtreleri
    if (advancedFilters.registrationDate) {
      params.append('regDate', advancedFilters.registrationDate);
    }
    
    if (advancedFilters.loginDate) {
      params.append('loginDate', advancedFilters.loginDate);
    }
    
    // Rol filtresi
    if (advancedFilters.role) {
      params.append('role', advancedFilters.role);
    }
    
    // Ülke filtresi
    if (advancedFilters.country) {
      params.append('country', advancedFilters.country);
    }
    
    return params.toString();
  }, [currentPage, pageSize, sortModel, advancedFilters]);
  
  // Kullanıcıları getir
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      // Token kontrolü - hem admin_token hem de normal token'ı dene
      const adminToken = localStorage.getItem('admin_token');
      const normalToken = localStorage.getItem('token');
      const token = adminToken || normalToken;
      
      if (!token) {
        console.error('Admin token bulunamadı');
        toast({
          title: "Oturum Hatası",
          description: "Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.",
          variant: "destructive",
        });
        return;
      }
      
      // Geliştirme sırasında konsola token bilgisini yazdır
      console.log('Kullanılan token tipi:', adminToken ? 'admin_token' : 'normal token');
      
      console.log('Admin token bulundu, API isteği yapılıyor');
      
      const queryString = buildQueryString();
      
      try {
        console.log('API isteği yapılıyor:', `/api/admin/users?${queryString}`);
        
        // Gerçek API çağrısı
        const response = await fetch(`/api/admin/users?${queryString}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        console.log('Kullanıcı verileri (demo) başarıyla alındı:', data);
        
        // Veri yapısını kontrol et
        if (Array.isArray(data)) {
          // Düz dizi formatı
          setUsers(data || []);
          setTotalPages(1); // Sayfalama bilgisi olmadığında varsayılan değer
        } else {
          // Sayfalama meta verileri olan nesne formatı
          setUsers(data?.items || []);
          setTotalPages(Math.ceil((data?._meta?.totalCount || 0) / pageSize));
        }
      } catch (error) {
        console.error('API isteği sırasında hata:', error);
        toast({
          title: "Veri Yüklenemedi",
          description: "Kullanıcı verileri yüklenirken bir sorun oluştu. Sistem yöneticisine başvurun.",
          variant: "destructive",
        });
      }
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
  }, [currentPage, pageSize, sortModel, filter, toast]);
  
  // Sayfa yüklendiğinde veri çek
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);
  
  // Detayları görüntüle
  const handleViewDetails = (user: UserData) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };
  
  // Düzenleme işlemi
  const handleEditUser = (user: UserData) => {
    setSelectedUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      phone: user.phone || '',
      role: user.role || 'user',
      status: user.status,
      balance: user.balance || 0,
      vipLevel: user.vipLevel || 0
    });
    setShowEditModal(true);
  };
  
  // Kullanıcı düzenleme formunu kaydet
  const handleSaveUser = async () => {
    if (!selectedUser) return;
    
    try {
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error('Kullanıcı güncellenemedi');
      }
      
      toast({
        title: "Kullanıcı Güncellendi",
        description: "Kullanıcı bilgileri başarıyla güncellendi.",
        variant: "default",
      });
      
      setShowEditModal(false);
      fetchUsers(); // Listeyi yenile
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Güncelleme Başarısız",
        description: "Kullanıcı güncellenirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };
  
  // Silme işlemi için kullanıcıyı ayarla
  const handleDeleteClick = (userId: number) => {
    setUserToDelete(userId);
    setShowDeleteModal(true);
  };
  
  // Kullanıcıyı sil
  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    try {
      const response = await fetch(`/api/admin/users/${userToDelete}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error('Kullanıcı silinemedi');
      }
      
      toast({
        title: "Kullanıcı Silindi",
        description: `Kullanıcı #${userToDelete} başarıyla silindi.`,
        variant: "default",
      });
      
      setShowDeleteModal(false);
      setUserToDelete(null);
      fetchUsers(); // Listeyi yenile
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Silme Başarısız",
        description: "Kullanıcı silinirken bir hata oluştu.",
        variant: "destructive",
      });
    }
  };
  
  return (
    <AdminLayout title={title}>
      <div className="space-y-6">
        {/* Gelişmiş Filtreler ve Araçlar */}
        <div className="space-y-4 mb-4">
          {/* Gelişmiş Filtreler Bileşeni */}
          <div className="w-full">
            <AdvancedFilter 
              onFilterChange={(filters) => {
                setAdvancedFilters(filters);
                setCurrentPage(1); // Filtre değiştiğinde ilk sayfaya dön
              }}
              onSortChange={(field, order) => {
                setSortModel({ field, sort: order });
              }}
              sortField={sortModel.field}
              sortOrder={sortModel.sort}
              currentFilters={advancedFilters}
            />
          </div>
          
          {/* Kontrol Butonları */}
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div className="flex gap-2 items-center">
              {/* Aktif Filtre Özeti */}
              {Object.keys(advancedFilters).some(key => {
                const value = advancedFilters[key as keyof FilterOptions];
                return Array.isArray(value) ? value.length > 0 : Boolean(value);
              }) && (
                <div className="flex items-center rounded-md bg-yellow-500/10 px-3 py-1.5 border border-yellow-500/20">
                  <Filter className="h-3.5 w-3.5 text-yellow-500 mr-2" />
                  <span className="text-xs text-gray-300">
                    {'Filtrelenmiş sonuçlar gösteriliyor'}
                  </span>
                </div>
              )}
              
              <div className="text-xs text-gray-400">
                {totalPages > 0 ? 
                  `${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalPages * pageSize)} / ${totalPages * pageSize} kullanıcı` : 
                  `0 kullanıcı`}
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchUsers}
                className="border-gray-700 bg-gray-800/80 text-white hover:bg-gray-700"
              >
                <RefreshCw className="h-3.5 w-3.5 mr-2" />
                {'Yenile'}
              </Button>
              
              <Button 
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
                size="sm"
                onClick={() => {
                  // Basit bir prompt ile kullanıcı ekleme
                  const username = prompt('Kullanıcı adını girin:');
                  if (!username) return;
                  
                  const email = prompt('E-posta adresini girin:');
                  if (!email) return;
                  
                  const password = prompt('Şifre girin:');
                  if (!password) return;
                  
                  // API çağrısı
                  const addUser = async () => {
                    try {
                      const adminToken = localStorage.getItem('admin_token');
                      const normalToken = localStorage.getItem('token');
                      const token = adminToken || normalToken;
                      
                      const response = await fetch('/api/admin/users', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          username,
                          email,
                          password,
                          firstName: username,
                          lastName: 'User',
                          phone: '',
                          role: 'user',
                          balance: 0,
                          vipLevel: 0
                        })
                      });
                      
                      if (response.ok) {
                        alert('Kullanıcı başarıyla eklendi!');
                        fetchUsers(); // Sayfayı yenile
                      } else {
                        const error = await response.json();
                        alert('Hata: ' + (error.error || 'Kullanıcı eklenemedi'));
                      }
                    } catch (error) {
                      alert('Hata: ' + error.message);
                    }
                  };
                  
                  addUser();
                }}
              >
                <UserPlus className="h-3.5 w-3.5 mr-2" />
                {'Kullanıcı Ekle'}
              </Button>
            </div>
          </div>
        </div>
        
        {/* Kullanıcı Tablosu */}
        <div className="bg-gray-800/80 border border-yellow-500/20 rounded-lg overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-gradient-to-r from-yellow-500/10 to-yellow-500/5 border-b border-yellow-500/20">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">ID</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Kullanıcı Adı</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">E-posta</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Kayıt Tarihi</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Bakiye</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">Durum</th>
                  <th className="py-3 px-4 text-left text-sm font-semibold text-gray-300">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-gray-400">
                      <div className="flex flex-col items-center justify-center">
                        <div className="relative flex items-center justify-center w-16 h-16">
                          <div className="absolute w-16 h-16 rounded-full border-4 border-yellow-500/20"></div>
                          <div className="absolute w-16 h-16 rounded-full border-t-4 border-l-4 border-yellow-500 animate-spin"></div>
                        </div>
                        <span className="mt-4">{t?.('admin.loading') || 'Yükleniyor...'}</span>
                      </div>
                    </td>
                  </tr>
                ) : !users || users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      <div className="bg-gray-800/50 mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-4 border border-yellow-500/10">
                        <User className="h-10 w-10 text-gray-600" />
                      </div>
                      <p className="text-lg font-medium text-gray-500 mb-1">Kullanıcı bulunamadı.</p>
                      <p className="text-sm text-gray-600 max-w-md mx-auto">
                        Lütfen başka bir filtre deneyin veya yeni bir kullanıcı ekleyin.
                      </p>
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr
                      key={user.id}
                      className="border-b border-gray-800 hover:bg-yellow-500/5 transition-colors"
                    >
                      <td className="py-3 px-4 text-sm font-mono">
                        <div className="bg-gray-900/50 rounded px-2 py-1 inline-block text-gray-400">#{user.id}</div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center">
                          <div className="w-7 h-7 rounded bg-gradient-to-br from-yellow-500 to-yellow-600 flex items-center justify-center text-xs font-bold text-black mr-2 flex-shrink-0">
                            {user.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="font-medium text-white">{user.username}</p>
                            <p className="text-xs text-gray-400">{user.fullName || (user.role ? user.role : '')}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300">{user.email}</td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {user.createdAt ? 
                          new Date(user.createdAt).toLocaleDateString('tr-TR', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                          }) : '-'
                        }
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex items-center">
                          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${parseFloat(String(user.balance)) > 0 ? 'bg-green-500' : 'bg-gray-500'}`}></div>
                          <span className={`font-medium ${parseFloat(String(user.balance)) > 0 ? 'text-green-400' : 'text-gray-400'}`}>
                            {user.balance?.toLocaleString() || 0} ₺
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <UserStatusBadge status={user.status} />
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <div className="flex space-x-1">
                          <button
                            onClick={() => handleViewDetails(user)}
                            className="p-1.5 rounded-md hover:bg-blue-500/10 text-blue-400 hover:text-blue-300 transition-colors"
                            title="Detayları Görüntüle"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditUser(user)}
                            className="p-1.5 rounded-md hover:bg-yellow-500/10 text-yellow-400 hover:text-yellow-300 transition-colors"
                            title="Düzenle"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user.id)}
                            className="p-1.5 rounded-md hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                            title="Sil"
                          >
                            <Trash className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          {/* Sayfalama Kontrolleri */}
          {!loading && users.length > 0 && (
            <div className="py-4 px-6 border-t border-yellow-500/20 flex flex-col sm:flex-row justify-between items-center bg-gray-800/50">
              <div className="text-sm text-gray-400 mb-4 sm:mb-0">
                {`Sayfa ${currentPage} / ${totalPages}`}
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                  disabled={currentPage <= 1}
                  className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-white"
                >
                  {'Önceki'}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                  disabled={currentPage >= totalPages}
                  className="border-gray-700 bg-gray-800 hover:bg-gray-700 text-white"
                >
                  {'Sonraki'}
                </Button>
                <Select
                  value={pageSize.toString()}
                  onValueChange={(value) => {
                    setPageSize(Number(value));
                    setCurrentPage(1);
                  }}
                >
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-[100px]">
                    <SelectValue placeholder={pageSize.toString()} />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700 text-white">
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                    <SelectItem value="100">100</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Kullanıcı Detay Modalı */}
      <UserDetailModal
        user={selectedUser}
        isOpen={showDetailsModal}
        onClose={() => {
          setShowDetailsModal(false);
          setSelectedUser(null);
          fetchUsers(); // Yeni verileri getir
        }}
        onEdit={handleEditUser}
        onDelete={handleDeleteClick}
      />
      
      {/* Kullanıcı Düzenleme Modalı */}
      {showEditModal && selectedUser && (
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="bg-gradient-to-b from-gray-900 to-gray-950 text-white border border-yellow-500/30">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                {'Kullanıcıyı Düzenle'} - {selectedUser.username}
              </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="username" className="text-sm text-gray-300">
                    {'Kullanıcı Adı'}
                  </label>
                  <Input
                    id="username"
                    className="bg-gray-800 border-gray-700 text-white"
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm text-gray-300">
                    {'E-posta'}
                  </label>
                  <Input
                    id="email"
                    type="email"
                    className="bg-gray-800 border-gray-700 text-white"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="fullName" className="text-sm text-gray-300">
                    {'Tam İsim'}
                  </label>
                  <Input
                    id="fullName"
                    className="bg-gray-800 border-gray-700 text-white"
                    value={formData.fullName}
                    onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label htmlFor="phone" className="text-sm text-gray-300">
                    {'Telefon'}
                  </label>
                  <Input
                    id="phone"
                    className="bg-gray-800 border-gray-700 text-white"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label htmlFor="tckn" className="text-sm text-gray-300">
                    {'TC Kimlik Numarası'}
                  </label>
                  <Input
                    id="tckn"
                    className="bg-gray-800 border-gray-700 text-white"
                    value={formData.tckn}
                    onChange={(e) => setFormData({...formData, tckn: e.target.value})}
                    maxLength={11}
                    placeholder="11 haneli TCKN girin"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="status" className="text-sm text-gray-300">
                    {'Durum'}
                  </label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({...formData, status: value as 'active' | 'inactive' | 'suspended'})}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Durum Seç" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="active">Aktif</SelectItem>
                      <SelectItem value="inactive">Pasif</SelectItem>
                      <SelectItem value="suspended">Askıya Alınmış</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="balance" className="text-sm text-gray-300">
                    {'Bakiye'} (₺)
                  </label>
                  <Input
                    id="balance"
                    type="number"
                    min="0"
                    className="bg-gray-800 border-gray-700 text-white"
                    value={formData.balance}
                    onChange={(e) => setFormData({...formData, balance: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowEditModal(false)}
                className="border-gray-600 text-gray-300 hover:bg-gray-800"
              >
                {'İptal'}
              </Button>
              <Button
                onClick={handleSaveUser}
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
              >
                <Save className="h-4 w-4 mr-2" />
                {'Kaydet'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Silme Onay Modalı */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent className="bg-gradient-to-b from-gray-900 to-gray-950 text-white border border-yellow-500/30">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              {'Kullanıcıyı Silmek İstediğinize Emin Misiniz?'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 text-gray-300">
            {'Bu işlem geri alınamaz. Bu kullanıcıyı silmek istediğinize emin misiniz?'}
          </div>
          <DialogFooter className="mt-6">
            <Button
              variant="destructive"
              onClick={confirmDelete}
              className="bg-red-500/80 hover:bg-red-600 text-white"
            >
              {'Sil'}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowDeleteModal(false)}
              className="border-gray-600 text-gray-300 hover:bg-gray-800"
            >
              {'İptal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}