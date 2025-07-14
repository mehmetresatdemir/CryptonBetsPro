import React, { useState, useEffect } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import {
  User,
  User2,
  CreditCard,
  CalendarDays,
  Mail,
  Phone,
  MapPin,
  Flag,
  BadgeInfo,
  Shield,
  MessageSquare,
  Clock,
  Check,
  X,
  Ban,
  Coins,
  Network,
  Globe,
  AlertTriangle,
  Plus,
  Minus,
  MoreHorizontal,
  Search,
  FileText,
  Activity,
  Info,
  AlertCircle,
  ArrowUpCircle,
  ArrowDownCircle,
  DollarSign,
  Award,
  Star,
  Lock,
  Edit3,
  ChevronDown,
  Smartphone,
  File,
  Calendar,
  RefreshCw
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

// Kullanıcı veri tipi tanımı
export interface UserData {
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
  totalDeposits?: number;
  totalWithdrawals?: number;
  totalBets?: number;
  totalWins?: number;
  tckn?: string | null;  // TC Kimlik No
  idNumber?: string | null;  // Diğer kimlik no (Pasaport vb.)
  lastIpAddress?: string | null;  // Son IP adresi
  bonuses?: any[];  // Kullanıcı bonusları
  deviceInfo?: string | null;  // Cihaz bilgisi
  registrationSource?: string | null;  // Kayıt kaynağı
  documents?: any[];  // Kullanıcı belgeleri
  countryCode?: string | null;  // Ülke kodu
  transactions?: Transaction[];
  userLogs?: UserLog[];
  bets?: Bet[];
}

// İşlem veri tipi tanımı
export interface Transaction {
  id: number;
  userId: number;
  type: string;
  amount: number;
  status: string;
  description: string | null;
  createdAt: string;
}

// Kullanıcı log veri tipi tanımı
export interface UserLog {
  id: number;
  userId: number;
  action: string;
  ipAddress: string | null;
  details: string | null;
  createdAt: string;
  userAgent?: string | null;
  location?: string | null;
}

// Bahis veri tipi tanımı
export interface Bet {
  id: number;
  userId: number;
  gameId: number;
  amount: number;
  winAmount: number | null;
  status: string;
  createdAt: string;
}

// Modal props tanımı
interface UserDetailModalProps {
  user: UserData | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (user: UserData) => void;
  onDelete: (userId: number) => void;
}

// Kullanıcı durumu badge bileşeni
const UserStatusBadge = ({ status }: { status: string }) => {
  let bgColor = 'bg-gray-500/20';
  let textColor = 'text-gray-400';
  let Icon = X;

  if (status === 'active') {
    bgColor = 'bg-green-500/20';
    textColor = 'text-green-500';
    Icon = Check;
  } else if (status === 'inactive') {
    bgColor = 'bg-gray-500/20';
    textColor = 'text-gray-400';
    Icon = X;
  } else if (status === 'suspended') {
    bgColor = 'bg-red-500/20';
    textColor = 'text-red-500';
    Icon = Ban;
  }

  return (
    <Badge variant="outline" className={`${bgColor} ${textColor} border-${textColor.replace('text-', '')}/30`}>
      <Icon className="h-3 w-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// İşlem tipi badge bileşeni
const TransactionTypeBadge = ({ type }: { type: string }) => {
  let bgColor = 'bg-gray-500/20';
  let textColor = 'text-gray-400';
  let Icon = Info;

  if (type === 'deposit') {
    bgColor = 'bg-green-500/20';
    textColor = 'text-green-500';
    Icon = ArrowUpCircle;
  } else if (type === 'withdrawal') {
    bgColor = 'bg-red-500/20';
    textColor = 'text-red-500';
    Icon = ArrowDownCircle;
  } else if (type === 'bet') {
    bgColor = 'bg-blue-500/20';
    textColor = 'text-blue-500';
    Icon = DollarSign;
  } else if (type === 'win') {
    bgColor = 'bg-yellow-500/20';
    textColor = 'text-yellow-500';
    Icon = Coins;
  } else if (type === 'bonus') {
    bgColor = 'bg-purple-500/20';
    textColor = 'text-purple-500';
    Icon = Award;
  }

  return (
    <Badge variant="outline" className={`${bgColor} ${textColor} border-${textColor.replace('text-', '')}/30`}>
      <Icon className="h-3 w-3 mr-1" />
      {type.charAt(0).toUpperCase() + type.slice(1)}
    </Badge>
  );
};

// İşlem durumu badge bileşeni
const TransactionStatusBadge = ({ status }: { status: string }) => {
  let bgColor = 'bg-gray-500/20';
  let textColor = 'text-gray-400';
  let Icon = Info;

  if (status === 'completed') {
    bgColor = 'bg-green-500/20';
    textColor = 'text-green-500';
    Icon = Check;
  } else if (status === 'pending') {
    bgColor = 'bg-yellow-500/20';
    textColor = 'text-yellow-500';
    Icon = Clock;
  } else if (status === 'failed') {
    bgColor = 'bg-red-500/20';
    textColor = 'text-red-500';
    Icon = X;
  } else if (status === 'cancelled') {
    bgColor = 'bg-gray-500/20';
    textColor = 'text-gray-400';
    Icon = Ban;
  }

  return (
    <Badge variant="outline" className={`${bgColor} ${textColor} border-${textColor.replace('text-', '')}/30`}>
      <Icon className="h-3 w-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Bahis durumu badge bileşeni
const BetStatusBadge = ({ status }: { status: string }) => {
  let bgColor = 'bg-gray-500/20';
  let textColor = 'text-gray-400';
  let Icon = Info;

  if (status === 'won') {
    bgColor = 'bg-green-500/20';
    textColor = 'text-green-500';
    Icon = Check;
  } else if (status === 'lost') {
    bgColor = 'bg-red-500/20';
    textColor = 'text-red-500';
    Icon = X;
  } else if (status === 'pending') {
    bgColor = 'bg-yellow-500/20';
    textColor = 'text-yellow-500';
    Icon = Clock;
  }

  return (
    <Badge variant="outline" className={`${bgColor} ${textColor} border-${textColor.replace('text-', '')}/30`}>
      <Icon className="h-3 w-3 mr-1" />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
};

// Kullanıcı aksiyon badge bileşeni
const UserActionBadge = ({ action }: { action: string }) => {
  let bgColor = 'bg-gray-500/20';
  let textColor = 'text-gray-400';
  let Icon = Info;

  if (action === 'login') {
    bgColor = 'bg-green-500/20';
    textColor = 'text-green-500';
    Icon = Check;
  } else if (action === 'logout') {
    bgColor = 'bg-gray-500/20';
    textColor = 'text-gray-400';
    Icon = Lock;
  } else if (action === 'password_change') {
    bgColor = 'bg-blue-500/20';
    textColor = 'text-blue-500';
    Icon = Lock;
  } else if (action === 'profile_update') {
    bgColor = 'bg-yellow-500/20';
    textColor = 'text-yellow-500';
    Icon = Edit3;
  } else if (action === 'balance_update') {
    bgColor = 'bg-purple-500/20';
    textColor = 'text-purple-500';
    Icon = Coins;
  } else if (action === 'status_change') {
    bgColor = 'bg-orange-500/20';
    textColor = 'text-orange-500';
    Icon = AlertCircle;
  }

  return (
    <Badge variant="outline" className={`${bgColor} ${textColor} border-${textColor.replace('text-', '')}/30`}>
      <Icon className="h-3 w-3 mr-1" />
      {action.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
    </Badge>
  );
};

// Ana modal bileşeni
const UserDetailModal: React.FC<UserDetailModalProps> = ({
  user,
  isOpen,
  onClose,
  onEdit,
  onDelete
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  
  // Veri yükleme durumları
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [loadingBets, setLoadingBets] = useState(false);
  
  // Veri state'leri
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [userLogs, setUserLogs] = useState<UserLog[]>([]);
  const [bets, setBets] = useState<Bet[]>([]);
  
  // Bakiye değişikliği için state değişkenleri
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceChangeAmount, setBalanceChangeAmount] = useState(0);
  const [balanceChangeDescription, setBalanceChangeDescription] = useState('');
  
  // Durum değişikliği için state değişkenleri
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState<'active' | 'inactive' | 'suspended'>('active');
  
  // Not eklemek için state değişkenleri
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [notes, setNotes] = useState('');
  
  // Kullanıcı işlemlerini çek
  const fetchUserTransactions = async (userId: number) => {
    if (loadingTransactions) return;
    
    setLoadingTransactions(true);
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const response = await fetch(`/api/admin/transactions/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setTransactions(data.transactions || []);
        console.log(`📊 USER TRANSACTIONS: Loaded ${data.transactions?.length || 0} transactions for user ${userId}`);
      } else {
        console.error('Failed to fetch user transactions:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user transactions:', error);
    } finally {
      setLoadingTransactions(false);
    }
  };
  
  // Kullanıcı loglarını çek
  const fetchUserLogs = async (userId: number) => {
    if (loadingLogs) return;
    
    setLoadingLogs(true);
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const response = await fetch(`/api/admin/user-logs?userId=${userId}&limit=50`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setUserLogs(data.logs || []);
        console.log(`📋 USER LOGS: Loaded ${data.logs?.length || 0} logs for user ${userId}`);
      } else {
        console.error('Failed to fetch user logs:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user logs:', error);
    } finally {
      setLoadingLogs(false);
    }
  };
  
  // Kullanıcı bahislerini çek
  const fetchUserBets = async (userId: number) => {
    if (loadingBets) return;
    
    setLoadingBets(true);
    try {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const response = await fetch(`/api/admin/users/${userId}/bets`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setBets(data.bets || []);
        console.log(`🎲 USER BETS: Loaded ${data.bets?.length || 0} bets for user ${userId}`);
      } else {
        console.error('Failed to fetch user bets:', response.status);
      }
    } catch (error) {
      console.error('Error fetching user bets:', error);
    } finally {
      setLoadingBets(false);
    }
  };
  
  // Modal açıldığında verileri çek
  useEffect(() => {
    if (user && isOpen) {
      setNewStatus(user.status);
      setNotes(user.notes || '');
      
      // Verileri temizle
      setTransactions([]);
      setUserLogs([]);
      setBets([]);
      
      // Verileri çek
      fetchUserTransactions(user.id);
      fetchUserLogs(user.id);
      fetchUserBets(user.id);
    }
  }, [user, isOpen]);
  
  // Bakiye değişiklik modalını aç
  const handleOpenBalanceModal = () => {
    setBalanceChangeAmount(0);
    setBalanceChangeDescription('');
    setShowBalanceModal(true);
  };
  
  // Bakiye değişikliğini kaydet
  const handleSaveBalanceChange = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/admin/users/${user.id}/balance`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          amount: balanceChangeAmount,
          description: balanceChangeDescription
        })
      });
      
      if (!response.ok) {
        throw new Error('Bakiye değişikliği kaydedilemedi');
      }
      
      toast({
        title: "Bakiye Güncellendi",
        description: `${balanceChangeAmount > 0 ? 'Ekleme' : 'Çıkarma'} işlemi başarılı.`,
        variant: "default",
      });
      
      setShowBalanceModal(false);
    } catch (error) {
      console.error('Balance update error:', error);
      toast({
        title: "Bakiye Güncellenemedi",
        description: "İşlem sırasında bir hata oluştu.",
        variant: "destructive",
      });
    }
  };
  
  // Durum değişiklik modalını aç
  const handleOpenStatusModal = () => {
    if (user) {
      setNewStatus(user.status);
    }
    setShowStatusModal(true);
  };
  
  // Durum değişikliğini kaydet
  const handleSaveStatusChange = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/admin/users/${user.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      });
      
      if (!response.ok) {
        throw new Error('Durum değişikliği kaydedilemedi');
      }
      
      toast({
        title: "Durum Güncellendi",
        description: `Kullanıcı durumu '${newStatus}' olarak değiştirildi.`,
        variant: "default",
      });
      
      setShowStatusModal(false);
    } catch (error) {
      console.error('Status update error:', error);
      toast({
        title: "Durum Güncellenemedi",
        description: "İşlem sırasında bir hata oluştu.",
        variant: "destructive",
      });
    }
  };
  
  // Not modalını aç
  const handleOpenNotesModal = () => {
    if (user) {
      setNotes(user.notes || '');
    }
    setShowNotesModal(true);
  };
  
  // Notları kaydet
  const handleSaveNotes = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: JSON.stringify({
          notes
        })
      });
      
      if (!response.ok) {
        throw new Error('Notlar kaydedilemedi');
      }
      
      toast({
        title: "Notlar Güncellendi",
        description: "Kullanıcı notları başarıyla güncellendi.",
        variant: "default",
      });
      
      setShowNotesModal(false);
    } catch (error) {
      console.error('Notes update error:', error);
      toast({
        title: "Notlar Güncellenemedi",
        description: "İşlem sırasında bir hata oluştu.",
        variant: "destructive",
      });
    }
  };
  
  // İşlem tipi rengini belirle
  const getTransactionTypeColor = (type: string) => {
    switch(type) {
      case 'deposit': return 'text-green-500';
      case 'withdrawal': return 'text-red-500';
      case 'bet': return 'text-blue-500';
      case 'win': return 'text-yellow-500';
      case 'bonus': return 'text-purple-500';
      default: return 'text-gray-400';
    }
  };
  
  // Formatlanmış para değeri
  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };
  
  // Tarih formatlama
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: tr });
    } catch (e) {
      return dateString;
    }
  };
  
  if (!user) return null;
  
  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden p-0 bg-gradient-to-b from-gray-900 to-gray-950 border border-yellow-600/30 text-white">
          <div className="flex flex-col h-[80vh]">
            {/* Header - Kullanıcı Özet */}
            <DialogHeader className="sticky top-0 z-10 px-6 py-4 bg-gray-900/80 backdrop-blur-sm border-b border-yellow-500/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="h-12 w-12 rounded-full bg-gray-800 border border-yellow-500/30 flex items-center justify-center">
                    <User className="h-6 w-6 text-yellow-500" />
                  </div>
                  <div>
                    <DialogTitle className="text-xl flex items-center">
                      {user.username}
                      <UserStatusBadge status={user.status} />
                    </DialogTitle>
                    <DialogDescription className="text-gray-400">
                      {user.email} · ID: #{user.id}
                    </DialogDescription>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    onClick={handleOpenBalanceModal}
                    variant="outline"
                    className="border-yellow-500/30 hover:bg-yellow-500/10 hover:text-yellow-400 transition-all"
                  >
                    <Coins className="h-4 w-4 mr-2 text-yellow-500" />
                    Bakiye
                  </Button>
                  <Button
                    onClick={handleOpenStatusModal}
                    variant="outline"
                    className="border-yellow-500/30 hover:bg-yellow-500/10 hover:text-yellow-400 transition-all"
                  >
                    <Shield className="h-4 w-4 mr-2 text-yellow-500" />
                    Durum
                  </Button>
                  <Button
                    onClick={() => onEdit(user)}
                    variant="outline"
                    className="border-yellow-500/30 hover:bg-yellow-500/10 hover:text-yellow-400 transition-all"
                  >
                    <Edit3 className="h-4 w-4 mr-2 text-yellow-500" />
                    Düzenle
                  </Button>
                </div>
              </div>
            </DialogHeader>
            
            {/* Sekmeler */}
            <div className="border-b border-yellow-500/20 px-6 bg-gray-900/50">
              <Tabs
                defaultValue="profile"
                value={activeTab}
                onValueChange={setActiveTab}
                className="w-full"
              >
                <TabsList className="bg-gray-800/50 border border-yellow-500/30 rounded-t-lg mt-2">
                  <TabsTrigger
                    value="profile"
                    className="data-[state=active]:bg-yellow-500/10 data-[state=active]:text-yellow-500 data-[state=active]:border-b-2 data-[state=active]:border-yellow-500"
                  >
                    <User className="h-4 w-4 mr-2" />
                    Profil
                  </TabsTrigger>
                  <TabsTrigger
                    value="transactions"
                    className="data-[state=active]:bg-yellow-500/10 data-[state=active]:text-yellow-500 data-[state=active]:border-b-2 data-[state=active]:border-yellow-500"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    İşlemler
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="data-[state=active]:bg-yellow-500/10 data-[state=active]:text-yellow-500 data-[state=active]:border-b-2 data-[state=active]:border-yellow-500"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Aktivite
                  </TabsTrigger>
                  <TabsTrigger
                    value="bets"
                    className="data-[state=active]:bg-yellow-500/10 data-[state=active]:text-yellow-500 data-[state=active]:border-b-2 data-[state=active]:border-yellow-500"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Bahisler
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            
            {/* Tab içerikleri */}
            <div className="flex-1 overflow-y-auto custom-scrollbar" style={{minHeight: "300px", maxHeight: "600px"}}>
              {/* Profil Sekmesi */}
              {activeTab === 'profile' && (
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Kullanıcı Bilgileri */}
                  <Card className="bg-gray-800/40 border-yellow-500/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium flex items-center">
                        <User className="h-5 w-5 mr-2 text-yellow-500" />
                        Kullanıcı Bilgileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-400">Tam Adı</Label>
                          <div className="text-sm font-medium mt-1 flex items-center">
                            <User2 className="h-3 w-3 mr-1 text-yellow-500" />
                            {user.fullName || '-'}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400">Telefon</Label>
                          <div className="text-sm font-medium mt-1 flex items-center">
                            {user.phone ? (
                              <>
                                <Phone className="h-3 w-3 mr-1 text-yellow-500" />
                                {user.phone}
                              </>
                            ) : '-'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-400">E-posta</Label>
                          <div className="text-sm font-medium mt-1 flex items-center">
                            <Mail className="h-3 w-3 mr-1 text-yellow-500" />
                            {user.email || '-'}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400">TC Kimlik No</Label>
                          <div className="text-sm font-medium mt-1 flex items-center">
                            <FileText className="h-3 w-3 mr-1 text-yellow-500" />
                            {user.idNumber || '-'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-400">Son IP Adresi</Label>
                          <div className="text-sm font-medium mt-1 flex items-center">
                            <Network className="h-3 w-3 mr-1 text-yellow-500" />
                            {user.lastIpAddress || '-'}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400">Son Giriş</Label>
                          <div className="text-sm font-medium mt-1 flex items-center">
                            <Clock className="h-3 w-3 mr-1 text-yellow-500" />
                            {user.lastLogin ? new Date(user.lastLogin).toLocaleString('tr-TR') : '-'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-400">Cihaz Bilgisi</Label>
                          <div className="text-sm font-medium mt-1 flex items-center">
                            <Smartphone className="h-3 w-3 mr-1 text-yellow-500" />
                            {user.deviceInfo || '-'}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400">Kayıt Kaynağı</Label>
                          <div className="text-sm font-medium mt-1 flex items-center">
                            <Globe className="h-3 w-3 mr-1 text-yellow-500" />
                            {user.registrationSource || '-'}
                          </div>
                        </div>
                      </div>
                      
                      {user.bonuses && user.bonuses.length > 0 && (
                        <div>
                          <Label className="text-xs text-gray-400">Aktif Bonuslar</Label>
                          <div className="mt-1 space-y-1">
                            {user.bonuses.map((bonus, index) => (
                              <div key={index} className="flex items-center justify-between bg-zinc-900/60 p-2 rounded-md">
                                <div className="flex items-center">
                                  <Award className="h-3 w-3 mr-2 text-yellow-500" />
                                  <span className="text-sm font-medium">{bonus.name || 'Bonus'}</span>
                                </div>
                                <Badge variant="outline" className="bg-yellow-500/20 text-yellow-500 border-yellow-500/30">
                                  {(bonus.amount || 0).toLocaleString('tr-TR')} ₺
                                </Badge>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div>
                        <Label className="text-xs text-gray-400">Adres</Label>
                        <div className="text-sm font-medium mt-1 flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-gray-400" />
                          {user.address ? (
                            <>
                              {user.address}
                              {user.city && `, ${user.city}`}
                              {user.country && `, ${user.country}`}
                              {user.postalCode && ` (${user.postalCode})`}
                            </>
                          ) : '-'}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-400">Doğum Tarihi</Label>
                          <div className="text-sm font-medium mt-1 flex items-center">
                            <CalendarDays className="h-3 w-3 mr-1 text-gray-400" />
                            {user.birthdate || '-'}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400">Üyelik Tarihi</Label>
                          <div className="text-sm font-medium mt-1">
                            {formatDate(user.createdAt)}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-400">Son Giriş</Label>
                        <div className="text-sm font-medium mt-1">
                          {formatDate(user.lastLogin)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Hesap Bilgileri */}
                  <Card className="bg-gray-800/40 border-gray-700">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium flex items-center">
                        <Shield className="h-5 w-5 mr-2 text-yellow-500" />
                        Hesap Bilgileri
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-400">Bakiye</Label>
                          <div className="text-lg font-bold mt-1 text-green-500">
                            {formatMoney(user.balance || 0)}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400">Durum</Label>
                          <div className="mt-1">
                            <UserStatusBadge status={user.status} />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-400">VIP Seviyesi</Label>
                          <div className="text-sm font-medium mt-1 flex items-center">
                            <Star className="h-3 w-3 mr-1 text-yellow-500" />
                            {user.vipLevel || '0'}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400">VIP Puanı</Label>
                          <div className="text-sm font-medium mt-1">
                            {user.vipPoints || '0'} puan
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-400">Toplam Yatırım</Label>
                          <div className="text-sm font-medium mt-1 text-green-500">
                            {formatMoney(user.totalDeposits || 0)}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400">Toplam Çekim</Label>
                          <div className="text-sm font-medium mt-1 text-red-500">
                            {formatMoney(user.totalWithdrawals || 0)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-xs text-gray-400">Toplam Bahis</Label>
                          <div className="text-sm font-medium mt-1 text-blue-500">
                            {formatMoney(user.totalBets || 0)}
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-400">Toplam Kazanç</Label>
                          <div className="text-sm font-medium mt-1 text-yellow-500">
                            {formatMoney(user.totalWins || 0)}
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs text-gray-400">Rol</Label>
                        <div className="text-sm font-medium mt-1">
                          <Badge variant="secondary" className="bg-blue-500/20 text-blue-400 border-blue-400/30">
                            {user.role || 'user'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Notlar */}
                  <Card className="bg-gray-800/40 border-gray-700 md:col-span-2">
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-medium flex items-center">
                          <MessageSquare className="h-5 w-5 mr-2 text-yellow-500" />
                          Notlar
                        </CardTitle>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-gray-700 hover:bg-gray-800"
                          onClick={handleOpenNotesModal}
                        >
                          <Edit3 className="h-3 w-3 mr-1" />
                          Düzenle
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="min-h-24 p-3 bg-gray-900/50 rounded-lg text-sm">
                        {user.notes ? user.notes : 'Kullanıcı için not bulunmuyor.'}
                      </div>
                    </CardContent>
                  </Card>
                  
                  {/* Kullanıcı Detay Sekmeler */}
                  <Card className="bg-gray-800/40 border-gray-700 md:col-span-2 mt-4">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg font-medium flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-yellow-500" />
                        Kullanıcı Aktiviteleri
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Tabs defaultValue="transactions" className="w-full">
                        <TabsList className="grid w-full grid-cols-3 bg-zinc-950 p-1 rounded-lg">
                          <TabsTrigger 
                            value="transactions" 
                            className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black rounded-md"
                          >
                            İşlemler
                          </TabsTrigger>
                          <TabsTrigger 
                            value="logs" 
                            className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black rounded-md"
                          >
                            Log Kayıtları
                          </TabsTrigger>
                          <TabsTrigger 
                            value="documents" 
                            className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black rounded-md"
                          >
                            Belgeler
                          </TabsTrigger>
                        </TabsList>
                        
                        <ScrollArea className="h-[250px] rounded-md border border-zinc-800 mt-4 p-2 custom-scrollbar custom-yellow-scrollbar">
                          <TabsContent value="transactions" className="space-y-2">
                            {user.transactions && user.transactions.length > 0 ? (
                              user.transactions.map((transaction, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-zinc-900/60 rounded-md">
                                  <div className="flex items-center gap-2">
                                    <TransactionTypeBadge type={transaction.type} />
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium">{transaction.description || 'İşlem'}</span>
                                      <span className="text-xs text-gray-400">
                                        {new Date(transaction.createdAt).toLocaleString('tr-TR')}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="flex items-center">
                                    <span className={`text-sm font-medium ${transaction.amount > 0 ? 'text-green-500' : 'text-red-500'}`}>
                                      {transaction.amount.toLocaleString('tr-TR')} ₺
                                    </span>
                                    <TransactionStatusBadge status={transaction.status} />
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="flex flex-col items-center justify-center h-[200px] text-sm text-gray-400">
                                <AlertCircle className="h-10 w-10 mb-2 text-gray-500" />
                                <p>Kullanıcıya ait işlem kaydı bulunamadı.</p>
                              </div>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="logs" className="space-y-2">
                            {user.userLogs && user.userLogs.length > 0 ? (
                              user.userLogs.map((log, index) => (
                                <div key={index} className="p-2 bg-zinc-900/60 rounded-md">
                                  <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2">
                                      <Activity className="h-3 w-3 text-yellow-500" />
                                      <span className="text-sm font-medium">{log.action}</span>
                                    </div>
                                    <span className="text-xs text-gray-400">
                                      {new Date(log.createdAt).toLocaleString('tr-TR')}
                                    </span>
                                  </div>
                                  {log.details && (
                                    <div className="mt-1 text-xs text-gray-400 ml-5">
                                      {log.details}
                                    </div>
                                  )}
                                  {log.ipAddress && (
                                    <div className="flex items-center gap-1 mt-1 text-xs text-gray-400 ml-5">
                                      <Network className="h-3 w-3" />
                                      {log.ipAddress}
                                      {log.location && ` - ${log.location}`}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <div className="flex flex-col items-center justify-center h-[200px] text-sm text-gray-400">
                                <AlertCircle className="h-10 w-10 mb-2 text-gray-500" />
                                <p>Kullanıcıya ait log kaydı bulunamadı.</p>
                              </div>
                            )}
                          </TabsContent>
                          
                          <TabsContent value="documents" className="space-y-2">
                            {user.documents && user.documents.length > 0 ? (
                              user.documents.map((doc, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-zinc-900/60 rounded-md">
                                  <div className="flex items-center gap-2">
                                    <File className="h-4 w-4 text-yellow-500" />
                                    <div className="flex flex-col">
                                      <span className="text-sm font-medium">{doc.name || 'Belge'}</span>
                                      <span className="text-xs text-gray-400">
                                        {doc.uploadDate ? new Date(doc.uploadDate).toLocaleDateString('tr-TR') : '-'}
                                      </span>
                                    </div>
                                  </div>
                                  <Badge variant="outline" className="bg-blue-500/20 text-blue-500 border-blue-500/30">
                                    {doc.status || 'Yüklendi'}
                                  </Badge>
                                </div>
                              ))
                            ) : (
                              <div className="flex flex-col items-center justify-center h-[200px] text-sm text-gray-400">
                                <AlertCircle className="h-10 w-10 mb-2 text-gray-500" />
                                <p>Kullanıcıya ait belge bulunamadı.</p>
                              </div>
                            )}
                          </TabsContent>
                        </ScrollArea>
                      </Tabs>
                    </CardContent>
                  </Card>
                </div>
              )}
              
              {/* İşlemler Sekmesi */}
              {activeTab === 'transactions' && (
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">İşlem Geçmişi</h3>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                        <Input 
                          className="pl-8 py-1 h-8 text-sm bg-gray-800 border-gray-700 focus:border-yellow-500"
                          placeholder="İşlem ara..."
                        />
                      </div>
                      <Select>
                        <SelectTrigger className="h-8 bg-gray-800 border-gray-700 text-sm">
                          <SelectValue placeholder="Tüm işlemler" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="all">Tüm işlemler</SelectItem>
                          <SelectItem value="deposit">Yatırım</SelectItem>
                          <SelectItem value="withdrawal">Çekim</SelectItem>
                          <SelectItem value="bet">Bahis</SelectItem>
                          <SelectItem value="win">Kazanç</SelectItem>
                          <SelectItem value="bonus">Bonus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="border border-gray-800 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gray-800/80">
                        <TableRow className="border-gray-700 hover:bg-gray-800">
                          <TableHead className="text-gray-400">ID</TableHead>
                          <TableHead className="text-gray-400">Tarih</TableHead>
                          <TableHead className="text-gray-400">Tür</TableHead>
                          <TableHead className="text-gray-400">Miktar</TableHead>
                          <TableHead className="text-gray-400">Durum</TableHead>
                          <TableHead className="text-gray-400">Açıklama</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingTransactions ? (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              <div className="flex items-center justify-center">
                                <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                                İşlemler yükleniyor...
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : transactions && transactions.length > 0 ? (
                          transactions.map((transaction) => (
                            <TableRow key={transaction.id} className="border-gray-800 hover:bg-gray-800/50">
                              <TableCell className="font-mono text-gray-500">#{transaction.id}</TableCell>
                              <TableCell className="text-sm text-gray-300">
                                {formatDate(transaction.createdAt)}
                              </TableCell>
                              <TableCell>
                                <TransactionTypeBadge type={transaction.type} />
                              </TableCell>
                              <TableCell className={`font-medium ${getTransactionTypeColor(transaction.type)}`}>
                                {['withdrawal', 'bet'].includes(transaction.type) ? '-' : '+'}{formatMoney(transaction.amount)}
                              </TableCell>
                              <TableCell>
                                <TransactionStatusBadge status={transaction.status} />
                              </TableCell>
                              <TableCell className="text-sm text-gray-300">
                                {transaction.description || '-'}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              <div className="flex flex-col items-center">
                                <AlertCircle className="h-8 w-8 mb-2 text-gray-400" />
                                İşlem geçmişi bulunamadı.
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              
              {/* Aktivite Sekmesi */}
              {activeTab === 'activity' && (
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Aktivite Logları</h3>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                        <Input 
                          className="pl-8 py-1 h-8 text-sm bg-gray-800 border-gray-700 focus:border-yellow-500"
                          placeholder="Log ara..."
                        />
                      </div>
                      <Select>
                        <SelectTrigger className="h-8 bg-gray-800 border-gray-700 text-sm">
                          <SelectValue placeholder="Tüm aktiviteler" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="all">Tüm aktiviteler</SelectItem>
                          <SelectItem value="login">Giriş</SelectItem>
                          <SelectItem value="logout">Çıkış</SelectItem>
                          <SelectItem value="password_change">Şifre Değişikliği</SelectItem>
                          <SelectItem value="profile_update">Profil Güncelleme</SelectItem>
                          <SelectItem value="balance_update">Bakiye Güncelleme</SelectItem>
                          <SelectItem value="status_change">Durum Değişikliği</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="border border-gray-800 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gray-800/80">
                        <TableRow className="border-gray-700 hover:bg-gray-800">
                          <TableHead className="text-gray-400">ID</TableHead>
                          <TableHead className="text-gray-400">Tarih</TableHead>
                          <TableHead className="text-gray-400">Aktivite</TableHead>
                          <TableHead className="text-gray-400">IP Adresi</TableHead>
                          <TableHead className="text-gray-400">Detay</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {loadingLogs ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              <div className="flex items-center justify-center">
                                <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                                Aktivite logları yükleniyor...
                              </div>
                            </TableCell>
                          </TableRow>
                        ) : userLogs && userLogs.length > 0 ? (
                          userLogs.map((log) => (
                            <TableRow key={log.id} className="border-gray-800 hover:bg-gray-800/50">
                              <TableCell className="font-mono text-gray-500">#{log.id}</TableCell>
                              <TableCell className="text-sm text-gray-300">
                                {formatDate(log.createdAt)}
                              </TableCell>
                              <TableCell>
                                <UserActionBadge action={log.action} />
                              </TableCell>
                              <TableCell className="font-mono text-sm text-gray-400">
                                {log.ipAddress || '-'}
                              </TableCell>
                              <TableCell className="text-sm text-gray-300">
                                {log.details || '-'}
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                              <div className="flex flex-col items-center">
                                <AlertCircle className="h-8 w-8 mb-2 text-gray-400" />
                                Aktivite logu bulunamadı.
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
              
              {/* Bahisler Sekmesi */}
              {activeTab === 'bets' && (
                <div className="p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Bahis Geçmişi</h3>
                    <div className="flex items-center space-x-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
                        <Input 
                          className="pl-8 py-1 h-8 text-sm bg-gray-800 border-gray-700 focus:border-yellow-500"
                          placeholder="Bahis ara..."
                        />
                      </div>
                      <Select>
                        <SelectTrigger className="h-8 bg-gray-800 border-gray-700 text-sm">
                          <SelectValue placeholder="Tüm bahisler" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectItem value="all">Tüm bahisler</SelectItem>
                          <SelectItem value="won">Kazanılan</SelectItem>
                          <SelectItem value="lost">Kaybedilen</SelectItem>
                          <SelectItem value="pending">Bekleyen</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="border border-gray-800 rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader className="bg-gray-800/80">
                        <TableRow className="border-gray-700 hover:bg-gray-800">
                          <TableHead className="text-gray-400">ID</TableHead>
                          <TableHead className="text-gray-400">Tarih</TableHead>
                          <TableHead className="text-gray-400">Oyun</TableHead>
                          <TableHead className="text-gray-400">Miktar</TableHead>
                          <TableHead className="text-gray-400">Kazanç</TableHead>
                          <TableHead className="text-gray-400">Durum</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {bets && bets.length > 0 ? (
                          bets.map((bet) => (
                            <TableRow key={bet.id} className="border-gray-800 hover:bg-gray-800/50">
                              <TableCell className="font-mono text-gray-500">#{bet.id}</TableCell>
                              <TableCell className="text-sm text-gray-300">
                                {formatDate(bet.createdAt)}
                              </TableCell>
                              <TableCell className="text-sm text-gray-300">
                                Oyun #{bet.gameId}
                              </TableCell>
                              <TableCell className="font-medium text-red-400">
                                -{formatMoney(bet.amount)}
                              </TableCell>
                              <TableCell className="font-medium text-green-400">
                                {bet.winAmount ? `+${formatMoney(bet.winAmount)}` : '-'}
                              </TableCell>
                              <TableCell>
                                <BetStatusBadge status={bet.status} />
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                              Bahis geçmişi bulunamadı.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <DialogFooter className="p-4 border-t border-gray-800 justify-between mt-auto bg-gray-900/80 backdrop-blur-sm">
              <Button
                variant="destructive"
                onClick={() => onDelete(user.id)}
                className="bg-red-500/80 hover:bg-red-600 text-white"
              >
                Kullanıcıyı Sil
              </Button>
              <Button
                variant="outline"
                onClick={onClose}
                className="border-gray-700 hover:bg-gray-800"
              >
                Kapat
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Bakiye Değişikliği Modalı */}
      <Dialog open={showBalanceModal} onOpenChange={setShowBalanceModal}>
        <DialogContent className="bg-gray-900 border border-yellow-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Bakiye Güncelleme
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Kullanıcı bakiyesine ekleme veya çıkarma yapabilirsiniz.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Miktar (₺)</Label>
              <div className="flex items-center space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setBalanceChangeAmount(prev => prev - 50)}
                  className="h-8 w-8 border-gray-700 bg-gray-800"
                >
                  <Minus className="h-3 w-3" />
                </Button>
                <Input
                  id="amount"
                  type="number"
                  value={balanceChangeAmount}
                  onChange={(e) => setBalanceChangeAmount(Number(e.target.value))}
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setBalanceChangeAmount(prev => prev + 50)}
                  className="h-8 w-8 border-gray-700 bg-gray-800"
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="text-xs text-gray-400 mt-1">
                Çıkarma yapmak için negatif değer girin.
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama</Label>
              <Input
                id="description"
                value={balanceChangeDescription}
                onChange={(e) => setBalanceChangeDescription(e.target.value)}
                placeholder="Manuel bakiye ayarlaması"
                className="bg-gray-800 border-gray-700 text-white"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Bilgi</Label>
              <div className="p-3 bg-gray-800/80 rounded-lg border border-gray-700 text-sm">
                <p className="text-yellow-500">İşlem Özeti:</p>
                <p className="text-gray-300 mt-1">
                  Mevcut Bakiye: <span className="font-semibold">{formatMoney(user.balance || 0)}</span>
                </p>
                <p className="text-gray-300">
                  Değişiklik: <span className={`font-semibold ${balanceChangeAmount >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {balanceChangeAmount >= 0 ? '+' : ''}{formatMoney(balanceChangeAmount)}
                  </span>
                </p>
                <p className="text-gray-300 mt-1 border-t border-gray-700 pt-1">
                  Yeni Bakiye: <span className="font-semibold text-yellow-500">
                    {formatMoney((user.balance || 0) + balanceChangeAmount)}
                  </span>
                </p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowBalanceModal(false)}
              className="border-gray-700 hover:bg-gray-800"
            >
              İptal
            </Button>
            <Button
              onClick={handleSaveBalanceChange}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              <Coins className="h-4 w-4 mr-2" />
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Durum Değişikliği Modalı */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="bg-gray-900 border border-yellow-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Durum Güncelleme
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Kullanıcı hesap durumunu güncelleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="status">Durum</Label>
              <Select
                value={newStatus}
                onValueChange={(value) => setNewStatus(value as 'active' | 'inactive' | 'suspended')}
              >
                <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="active" className="text-green-500">
                    <div className="flex items-center">
                      <Check className="h-4 w-4 mr-2" />
                      Aktif
                    </div>
                  </SelectItem>
                  <SelectItem value="inactive" className="text-gray-400">
                    <div className="flex items-center">
                      <X className="h-4 w-4 mr-2" />
                      Pasif
                    </div>
                  </SelectItem>
                  <SelectItem value="suspended" className="text-red-500">
                    <div className="flex items-center">
                      <Ban className="h-4 w-4 mr-2" />
                      Askıya Alınmış
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Bilgi</Label>
              <div className="p-3 bg-gray-800/80 rounded-lg border border-gray-700 text-sm">
                <p className="text-yellow-500 font-medium">Durum Bilgisi:</p>
                <div className="mt-2 space-y-2">
                  <div className="flex items-center text-green-500">
                    <Check className="h-4 w-4 mr-2" />
                    <span className="font-medium">Aktif:</span>
                    <span className="ml-2 text-gray-300">Kullanıcı hesabına giriş yapabilir ve tüm işlemleri gerçekleştirebilir.</span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    <X className="h-4 w-4 mr-2" />
                    <span className="font-medium">Pasif:</span>
                    <span className="ml-2 text-gray-300">Kullanıcı hesabına giriş yapamaz ancak hesabı korunur.</span>
                  </div>
                  <div className="flex items-center text-red-500">
                    <Ban className="h-4 w-4 mr-2" />
                    <span className="font-medium">Askıya Alınmış:</span>
                    <span className="ml-2 text-gray-300">Kullanıcı giriş yapamaz ve hesabı geçici olarak kısıtlanır.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowStatusModal(false)}
              className="border-gray-700 hover:bg-gray-800"
            >
              İptal
            </Button>
            <Button
              onClick={handleSaveStatusChange}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              <Shield className="h-4 w-4 mr-2" />
              Durumu Güncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Not Modalı */}
      <Dialog open={showNotesModal} onOpenChange={setShowNotesModal}>
        <DialogContent className="bg-gray-900 border border-yellow-500/20 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Kullanıcı Notları
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              Kullanıcı hakkında özel notlar ekleyebilirsiniz.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-40 bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 focus:outline-none resize-none"
              placeholder="Kullanıcı hakkında notlar ekleyin..."
            />
            <div className="text-xs text-gray-400">
              Bu notlar sadece admin panelinde görünür ve kullanıcıya gösterilmez.
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowNotesModal(false)}
              className="border-gray-700 hover:bg-gray-800"
            >
              İptal
            </Button>
            <Button
              onClick={handleSaveNotes}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Notları Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UserDetailModal;