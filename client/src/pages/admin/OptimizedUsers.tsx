import React, { useState, useEffect, useCallback, useMemo } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
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
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
  balance: number;
  vipLevel: number;
  vipPoints: number;
  status: 'active' | 'inactive' | 'suspended';
  role: string;
  isActive: boolean;
  totalDeposits: number;
  totalWithdrawals: number;
  totalBets: number;
  totalWins: number;
  registrationDate?: string;
  createdAt?: string;
  lastLogin?: string;
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
}

const OptimizedUsers: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Filter users based on search and status
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (user.fullName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      
      const matchesStatus = selectedStatus === 'all' || user.status === selectedStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, selectedStatus]);

  // Using simpler table structure without complex column definitions

  const handleViewDetails = (user: UserData) => {
    setSelectedUser(user);
    setShowDetailsModal(true);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {t('admin.users') || 'Kullanıcı Yönetimi'}
            </h1>
            <p className="text-gray-400">
              {t('admin.users_description') || 'Kullanıcıları görüntüle, düzenle ve yönet'}
            </p>
          </div>
          <Button className="bg-yellow-500 hover:bg-yellow-600 text-black">
            <UserPlus className="h-4 w-4 mr-2" />
            {t('admin.add_user') || 'Kullanıcı Ekle'}
          </Button>
        </div>

        {/* Filters */}
        <div className="bg-gray-800/50 p-4 rounded-lg border border-yellow-500/20">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={t('admin.search_users') || 'Kullanıcı ara...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-full md:w-48 bg-gray-700/50 border-gray-600 text-white">
                <SelectValue placeholder={t('admin.select_status') || 'Durum seç'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('admin.all_statuses') || 'Tüm Durumlar'}</SelectItem>
                <SelectItem value="active">{t('admin.active') || 'Aktif'}</SelectItem>
                <SelectItem value="inactive">{t('admin.inactive') || 'Pasif'}</SelectItem>
                <SelectItem value="suspended">{t('admin.suspended') || 'Askıya Alınmış'}</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" className="border-yellow-500/30 text-yellow-500">
              <Download className="h-4 w-4 mr-2" />
              {t('admin.export') || 'Dışa Aktar'}
            </Button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800/50 rounded-lg border border-yellow-500/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Kullanıcı</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">E-posta</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Bakiye</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">VIP</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Durum</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700/50">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/30">
                    <td className="px-4 py-3 text-sm text-gray-300">#{user.id}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center">
                          <User className="h-4 w-4 text-yellow-500" />
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.username}</div>
                          <div className="text-xs text-gray-400">{user.fullName || '-'}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-300">{user.email}</td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-green-400">
                        {user.balance.toLocaleString()} ₺
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        user.vipLevel > 0 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {user.vipLevel > 0 ? `VIP ${user.vipLevel}` : 'Standart'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full font-medium ${
                        user.status === 'active' ? 'bg-green-500/20 text-green-400' :
                        user.status === 'inactive' ? 'bg-gray-500/20 text-gray-400' :
                        'bg-red-500/20 text-red-400'
                      }`}>
                        {user.status === 'active' ? <CheckCircle className="h-3 w-3 mr-1" /> :
                         user.status === 'inactive' ? <XCircle className="h-3 w-3 mr-1" /> :
                         <Ban className="h-3 w-3 mr-1" />}
                        {user.status === 'active' ? 'Aktif' :
                         user.status === 'inactive' ? 'Pasif' :
                         'Askıya Alınmış'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowDetailsModal(true);
                          }}
                          className="p-2 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30"
                        >
                          <Eye className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Details Modal */}
        {showDetailsModal && selectedUser && (
          <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
            <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto bg-gray-900 border border-yellow-500/30">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-white flex items-center">
                  <User className="h-6 w-6 text-yellow-500 mr-2" />
                  {t('admin.user_details') || 'Kullanıcı Detayları'}: {selectedUser.username}
                </DialogTitle>
              </DialogHeader>
              
              <div className="mt-6">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="grid w-full grid-cols-3 bg-gray-800/50">
                    <TabsTrigger value="overview" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500">
                      {t('admin.overview') || 'Genel Bakış'}
                    </TabsTrigger>
                    <TabsTrigger value="transactions" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500">
                      {t('admin.transactions') || 'İşlemler'}
                    </TabsTrigger>
                    <TabsTrigger value="logs" className="data-[state=active]:bg-yellow-500/20 data-[state=active]:text-yellow-500">
                      {t('admin.logs') || 'Günlükler'}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="mt-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* User Info */}
                      <div className="bg-gray-700/50 p-5 rounded-xl border border-yellow-500/20">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                          <Shield className="h-5 w-5 text-yellow-500 mr-2" />
                          {t('admin.account_info') || 'Hesap Bilgileri'}
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="text-center mb-6">
                            <div className="w-20 h-20 rounded-full bg-gray-800/80 flex items-center justify-center mx-auto border-4 border-yellow-500/20">
                              <User className="h-10 w-10 text-yellow-500/70" />
                            </div>
                            <div className="mt-3">
                              <h4 className="text-lg font-semibold text-white">{selectedUser.fullName || selectedUser.username}</h4>
                              <p className="text-sm text-gray-400">ID: #{selectedUser.id}</p>
                            </div>
                          </div>

                          <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4 text-yellow-500/70" />
                              <div>
                                <p className="text-xs text-gray-400">{t('admin.email') || 'E-posta'}</p>
                                <p className="font-medium text-white">{selectedUser.email}</p>
                              </div>
                            </div>
                            
                            {selectedUser.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-yellow-500/70" />
                                <div>
                                  <p className="text-xs text-gray-400">{t('admin.phone') || 'Telefon'}</p>
                                  <p className="font-medium text-white">{selectedUser.phone}</p>
                                </div>
                              </div>
                            )}
                            
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4 text-yellow-500/70" />
                              <div>
                                <p className="text-xs text-gray-400">{t('admin.joined') || 'Katılma Tarihi'}</p>
                                <p className="font-medium text-white">
                                  {selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('tr-TR') : '-'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Financial Info */}
                      <div className="bg-gray-700/50 p-5 rounded-xl border border-yellow-500/20">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                          <Wallet className="h-5 w-5 text-yellow-500 mr-2" />
                          {t('admin.financial_info') || 'Mali Bilgiler'}
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="bg-green-500/10 p-3 rounded-lg border border-green-500/20">
                            <p className="text-xs text-green-400 mb-1">{t('admin.current_balance') || 'Güncel Bakiye'}</p>
                            <p className="text-2xl font-bold text-green-400">{selectedUser.balance.toLocaleString()} ₺</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-800/60 p-3 rounded-lg">
                              <p className="text-xs text-gray-400">{t('admin.total_deposits') || 'Toplam Yatırım'}</p>
                              <p className="font-semibold text-white">{selectedUser.totalDeposits.toLocaleString()} ₺</p>
                            </div>
                            <div className="bg-gray-800/60 p-3 rounded-lg">
                              <p className="text-xs text-gray-400">{t('admin.total_withdrawals') || 'Toplam Çekim'}</p>
                              <p className="font-semibold text-white">{selectedUser.totalWithdrawals.toLocaleString()} ₺</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-3">
                            <div className="bg-gray-800/60 p-3 rounded-lg">
                              <p className="text-xs text-gray-400">{t('admin.total_bets') || 'Toplam Bahis'}</p>
                              <p className="font-semibold text-white">{selectedUser.totalBets}</p>
                            </div>
                            <div className="bg-gray-800/60 p-3 rounded-lg">
                              <p className="text-xs text-gray-400">{t('admin.total_wins') || 'Toplam Kazanç'}</p>
                              <p className="font-semibold text-white">{selectedUser.totalWins.toLocaleString()} ₺</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* VIP Info */}
                      <div className="bg-gray-700/50 p-5 rounded-xl border border-yellow-500/20">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                          <Coins className="h-5 w-5 text-yellow-500 mr-2" />
                          VIP {t('admin.status') || 'Durum'}
                        </h3>
                        
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
                              selectedUser.vipLevel > 0 ? 'bg-yellow-500/20 border-2 border-yellow-500' : 'bg-gray-600/20 border-2 border-gray-600'
                            }`}>
                              <span className={`text-2xl font-bold ${selectedUser.vipLevel > 0 ? 'text-yellow-500' : 'text-gray-400'}`}>
                                {selectedUser.vipLevel}
                              </span>
                            </div>
                            <p className="mt-2 font-semibold text-white">
                              {selectedUser.vipLevel > 0 ? `VIP ${selectedUser.vipLevel}` : 'Standart Üye'}
                            </p>
                          </div>
                          
                          <div className="bg-gray-800/60 p-3 rounded-lg">
                            <p className="text-xs text-gray-400 mb-1">VIP {t('admin.points') || 'Puanlar'}</p>
                            <p className="text-xl font-bold text-yellow-500">{selectedUser.vipPoints.toLocaleString()}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="transactions" className="mt-6">
                    <div className="bg-gray-700/50 p-5 rounded-xl border border-yellow-500/20">
                      <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
                        <CreditCard className="h-5 w-5 text-yellow-500 mr-2" />
                        {t('admin.recent_transactions') || 'Son İşlemler'}
                      </h3>
                      
                      <div className="text-center py-8">
                        <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                        <p className="text-gray-400">
                          {t('admin.no_transactions') || 'Henüz işlem bulunmuyor'}
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
                      
                      <div className="text-center py-8">
                        <ClipboardList className="h-12 w-12 mx-auto mb-4 text-gray-500" />
                        <p className="text-gray-400">
                          {t('admin.no_logs') || 'Henüz günlük bulunmuyor'}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
              
              <DialogFooter className="mt-6 border-t border-yellow-500/20 pt-4">
                <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                  {t('admin.close') || 'Kapat'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminLayout>
  );
}