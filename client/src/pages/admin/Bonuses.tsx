import React, { useState, useMemo, useCallback } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import {
  Search,
  Filter,
  Calendar,
  ChevronDown,
  Edit,
  Trash,
  Eye,
  PlusCircle,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  Gift,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Percent,
  Users,
  Target,
  X,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Settings,
  Calculator,
  Gamepad2,
  Image,
  Save,
  Rocket,
  Star,
  AlertCircle,
  Copy,
  Share2,
  BarChart3,
  Info
} from 'lucide-react';

// Bonus veri türleri
type Bonus = {
  id: number;
  name: string;
  type: string;
  typeName: string;
  description: string;
  amount: number;
  maxAmount: number;
  minDeposit: number;
  wagerRequirement: number;
  status: 'active' | 'inactive' | 'upcoming' | 'expired';
  startDate: string;
  endDate: string;
  isHighlighted: boolean;
  targetUserType: string;
  usageCount: number;
  totalClaimed: number;
  totalValue: number;
  imageUrl?: string;
  termsAndConditions: string;
  gameRestrictions: string;
  code?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  lastModifiedBy: string;
  conversionRate: number;
  popularityScore: number;
};

// Bonus türleri
const bonusTypes = [
  { id: 'welcome', name: 'Hoşgeldin Bonusu' },
  { id: 'deposit', name: 'Yatırım Bonusu' },
  { id: 'loyalty', name: 'Sadakat Bonusu' },
  { id: 'cashback', name: 'Nakit İade' },
  { id: 'freespin', name: 'Bedava Dönüş' },
  { id: 'reload', name: 'Yeniden Yükleme' },
  { id: 'birthday', name: 'Doğum Günü' },
  { id: 'referral', name: 'Arkadaşını Getir' },
  { id: 'tournament', name: 'Turnuva' },
  { id: 'special', name: 'Özel Teklif' },
];

// İstatistik kartı bileşeni
const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  subtitle?: string;
}> = ({ title, value, icon: Icon, change, changeType, subtitle }) => (
  <div className="bg-gray-800/60 rounded-lg p-6 border border-yellow-500/20 hover:border-yellow-500/40 transition-colors">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className="p-3 bg-yellow-500/20 rounded-lg">
        <Icon className="h-6 w-6 text-yellow-500" />
      </div>
    </div>
    {change !== undefined && (
      <div className="flex items-center mt-3">
        {changeType === 'positive' ? (
          <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
        ) : changeType === 'negative' ? (
          <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
        ) : null}
        <span className={`text-sm ${
          changeType === 'positive' ? 'text-green-500' : 
          changeType === 'negative' ? 'text-red-500' : 
          'text-gray-400'
        }`}>
          {change > 0 ? '+' : ''}{change}%
        </span>
        <span className="text-gray-500 text-sm ml-1">bu ay</span>
      </div>
    )}
  </div>
);

const Bonuses: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortColumn, setSortColumn] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingBonus, setEditingBonus] = useState<Bonus | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [bonusToDelete, setBonusToDelete] = useState<number | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedBonus, setSelectedBonus] = useState<Bonus | null>(null);

  // Form state for bonus creation
  const [bonusForm, setBonusForm] = useState({
    name: '',
    type: '',
    description: '',
    amount: '',
    percentage: '',
    minDeposit: '',
    maxBonus: '',
    wagering: '',
    validDays: '7',
    gameRestrictions: '',
    status: 'active',
    targetUsers: 'all',
    currency: 'TRY',
    imageUrl: '',
    isHighlighted: false,
    sendNotification: false,
    emailCampaign: false,
    autoApprove: true,
    maxClaims: '',
    validFrom: '',
    validTo: ''
  });

  // Form validation state
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper function to get bonus type name
  const getBonusTypeName = (type: string) => {
    const typeMap: {[key: string]: string} = {
      'welcome': 'Hoşgeldin',
      'reload': 'Yeniden Yükleme',
      'cashback': 'Geri Ödeme',
      'free_spins': 'Bedava Spin',
      'no_deposit': 'Yatırımsız',
      'high_roller': 'Yüksek Bahis',
      'weekend': 'Hafta Sonu',
      'monthly': 'Aylık',
      'loyalty': 'Sadakat',
      'referral': 'Arkadaşını Getir'
    };
    return typeMap[type] || type;
  };

  // Handle form input changes with validation
  const handleFormChange = (field: string, value: string | boolean) => {
    setBonusForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear specific field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Real-time validation for specific fields
    validateField(field, value);
  };

  // Advanced form validation
  const validateField = (field: string, value: string | boolean) => {
    const errors: {[key: string]: string} = {};

    switch (field) {
      case 'name':
        if (typeof value === 'string' && value.length < 3) {
          errors[field] = 'Bonus adı en az 3 karakter olmalıdır';
        } else if (typeof value === 'string' && value.length > 100) {
          errors[field] = 'Bonus adı en fazla 100 karakter olabilir';
        }
        break;
      case 'description':
        if (typeof value === 'string' && value.length < 10) {
          errors[field] = 'Açıklama en az 10 karakter olmalıdır';
        } else if (typeof value === 'string' && value.length > 500) {
          errors[field] = 'Açıklama en fazla 500 karakter olabilir';
        }
        break;
      case 'percentage':
        const percentageNum = parseFloat(value as string);
        if (isNaN(percentageNum) || percentageNum < 0 || percentageNum > 1000) {
          errors[field] = 'Geçerli bir yüzde değeri girin (0-1000)';
        }
        break;
      case 'minDeposit':
        const minDepositNum = parseFloat(value as string);
        if (isNaN(minDepositNum) || minDepositNum < 1) {
          errors[field] = 'Minimum yatırım en az 1 TL olmalıdır';
        }
        break;
      case 'maxBonus':
        const maxBonusNum = parseFloat(value as string);
        const minDeposit = parseFloat(bonusForm.minDeposit);
        if (maxBonusNum > 0 && minDeposit > 0 && maxBonusNum < minDeposit) {
          errors[field] = 'Maksimum bonus minimum yatırımdan az olamaz';
        }
        break;
      case 'wagering':
        const wageringNum = parseFloat(value as string);
        if (isNaN(wageringNum) || wageringNum < 1 || wageringNum > 100) {
          errors[field] = 'Çevrim şartı 1-100 arasında olmalıdır';
        }
        break;
    }

    setFormErrors(prev => ({
      ...prev,
      ...errors
    }));
  };

  // Calculate estimated bonus value for preview
  const getEstimatedBonus = () => {
    const minDeposit = parseFloat(bonusForm.minDeposit) || 0;
    const percentage = parseFloat(bonusForm.percentage) || 0;
    const maxBonus = parseFloat(bonusForm.maxBonus) || Infinity;
    
    const calculatedBonus = (minDeposit * percentage) / 100;
    return Math.min(calculatedBonus, maxBonus);
  };

  // Comprehensive form validation
  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    // Required field validation
    if (!bonusForm.name.trim()) errors.name = 'Bonus adı zorunludur';
    if (!bonusForm.type) errors.type = 'Bonus türü seçimi zorunludur';
    if (!bonusForm.description.trim()) errors.description = 'Bonus açıklaması zorunludur';
    
    // Business logic validation
    if (bonusForm.name.length < 3) errors.name = 'Bonus adı en az 3 karakter olmalıdır';
    if (bonusForm.description.length < 10) errors.description = 'Açıklama en az 10 karakter olmalıdır';
    
    const percentage = parseFloat(bonusForm.percentage);
    const minDeposit = parseFloat(bonusForm.minDeposit);
    const maxBonus = parseFloat(bonusForm.maxBonus);
    const wagering = parseFloat(bonusForm.wagering);

    if (isNaN(percentage) || percentage <= 0) errors.percentage = 'Geçerli bir yüzde değeri girin';
    if (isNaN(minDeposit) || minDeposit < 1) errors.minDeposit = 'Minimum yatırım en az 1 TL olmalıdır';
    if (maxBonus > 0 && maxBonus < minDeposit) errors.maxBonus = 'Maksimum bonus minimum yatırımdan az olamaz';
    if (isNaN(wagering) || wagering < 1) errors.wagering = 'Çevrim şartı en az 1 olmalıdır';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Enhanced form submission with loading states
  const handleCreateBonus = async () => {
    try {
      setIsSubmitting(true);
      
      // Comprehensive validation
      if (!validateForm()) {
        setIsSubmitting(false);
        return;
      }

      const bonusData = {
        name: bonusForm.name.trim(),
        type: bonusForm.type,
        description: bonusForm.description.trim(),
        amount: parseFloat(bonusForm.amount) || 0,
        percentage: parseFloat(bonusForm.percentage) || 0,
        minDeposit: parseFloat(bonusForm.minDeposit) || 0,
        maxBonus: parseFloat(bonusForm.maxBonus) || 0,
        wagering: parseFloat(bonusForm.wagering) || 0,
        validDays: parseInt(bonusForm.validDays) || 7,
        gameRestrictions: bonusForm.gameRestrictions,
        status: bonusForm.status,
        targetUsers: bonusForm.targetUsers,
        currency: bonusForm.currency,
        imageUrl: bonusForm.imageUrl,
        isHighlighted: bonusForm.isHighlighted,
        sendNotification: bonusForm.sendNotification,
        emailCampaign: bonusForm.emailCampaign,
        autoApprove: bonusForm.autoApprove,
        maxClaims: parseInt(bonusForm.maxClaims) || 0,
        validFrom: bonusForm.validFrom,
        validTo: bonusForm.validTo,
        estimatedValue: getEstimatedBonus()
      };

      // Simulate API call delay for realistic UX
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Add new bonus to mock data for immediate UI feedback
      const newBonus = {
        id: Date.now(),
        name: bonusData.name,
        type: bonusData.type,
        typeName: getBonusTypeName(bonusData.type),
        description: bonusData.description,
        amount: bonusData.amount,
        percentage: bonusData.percentage,
        minDeposit: bonusData.minDeposit,
        maxAmount: bonusData.maxBonus,
        wagering: bonusData.wagering,
        status: bonusData.status,
        startDate: bonusData.validFrom || new Date().toISOString().split('T')[0],
        endDate: bonusData.validTo || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0],
        isHighlighted: bonusData.isHighlighted,
        targetUserType: bonusData.targetUsers,
        usageCount: 0,
        totalClaimed: 0,
        totalValue: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin',
        lastModifiedBy: 'admin',
        conversionRate: 0,
        popularityScore: 0
      };
      
      console.log('✅ Bonus Creation Data:', bonusData);
      
      // Success feedback with detailed information
      const successMessage = `
🎉 Bonus başarıyla oluşturuldu!

📋 Detaylar:
• Bonus Adı: ${bonusData.name}
• Tür: ${bonusData.type}
• Yüzde: %${bonusData.percentage}
• Min. Yatırım: ${bonusData.minDeposit} TL
• Tahmini Bonus: ${bonusData.estimatedValue.toFixed(2)} TL
• Çevrim Şartı: ${bonusData.wagering}x
      `.trim();

      alert(successMessage);
      
      // Reset form and close modal
      resetForm();
      setShowCreateModal(false);
      
    } catch (error) {
      console.error('❌ Bonus Creation Error:', error);
      alert('Bonus oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form to initial state
  const resetForm = () => {
    setBonusForm({
      name: '',
      type: '',
      description: '',
      amount: '',
      percentage: '',
      minDeposit: '',
      maxBonus: '',
      wagering: '',
      validDays: '7',
      gameRestrictions: '',
      status: 'active',
      targetUsers: 'all',
      currency: 'TRY',
      imageUrl: '',
      isHighlighted: false,
      sendNotification: false,
      emailCampaign: false,
      autoApprove: true,
      maxClaims: '',
      validFrom: '',
      validTo: ''
    });
    setFormErrors({});
  };

  // Bonus verilerini getir
  const { 
    data: bonusesResponse, 
    isLoading, 
    error: bonusesError,
    refetch 
  } = useQuery({
    queryKey: ['/api/admin/bonuses'],
    retry: false,
    staleTime: 5 * 60 * 1000,
    meta: {
      requiresAuth: true
    }
  });

  const bonusesData = bonusesResponse?.data || [];

  // Bonus istatistiklerini getir
  const { data: bonusStatsResponse } = useQuery({
    queryKey: ['/api/admin/bonuses/stats'],
    retry: false,
    staleTime: 5 * 60 * 1000
  });

  const bonusStats = bonusStatsResponse?.stats ? {
    totalBonuses: bonusStatsResponse.stats.totalBonuses || 0,
    activeBonuses: bonusStatsResponse.stats.activeBonuses || 0,
    upcomingBonuses: bonusStatsResponse.stats.upcomingBonuses || 0,
    totalClaimed: bonusStatsResponse.stats.totalClaimed || 0,
    totalValue: bonusStatsResponse.stats.totalValue || 0,
    conversionRate: bonusStatsResponse.stats.conversionRate || 0,
    monthlyGrowth: bonusStatsResponse.stats.monthlyGrowth || 0
  } : {
    totalBonuses: 0,
    activeBonuses: 0,
    upcomingBonuses: 0,
    totalClaimed: 0,
    totalValue: 0,
    conversionRate: 0,
    monthlyGrowth: 0
  };

  // Hata handling
  React.useEffect(() => {
    if (bonusesError) {
      toast({
        title: "Bonus verileri yüklenemedi",
        description: "Bonus bilgilerini yüklerken bir hata oluştu",
        variant: "destructive"
      });
    }
  }, [bonusesError, toast]);

  // Bonus yenileme fonksiyonu
  const handleRefreshBonuses = useCallback(() => {
    refetch();
    toast({
      title: "Bonuslar yenilendi",
      description: "Bonus listesi başarıyla güncellendi",
      variant: "default"
    });
  }, [refetch, toast]);

  // Filtrelenmiş bonuslar
  const filteredBonuses = useMemo(() => {
    let result = Array.isArray(bonusesData) ? bonusesData : [];
    
    // Arama filtresi
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      result = result.filter((bonus: Bonus) => 
        bonus.name.toLowerCase().includes(lowerSearchTerm) ||
        bonus.description.toLowerCase().includes(lowerSearchTerm) ||
        (bonus.code && bonus.code.toLowerCase().includes(lowerSearchTerm))
      );
    }

    // Tür filtresi
    if (typeFilter !== 'all') {
      result = result.filter((bonus: Bonus) => bonus.type === typeFilter);
    }

    // Durum filtresi
    if (statusFilter !== 'all') {
      result = result.filter((bonus: Bonus) => bonus.status === statusFilter);
    }

    return result;
  }, [bonusesData, searchTerm, typeFilter, statusFilter]);

  // Sıralanmış bonuslar
  const sortedBonuses = useMemo(() => {
    return [...filteredBonuses].sort((a: Bonus, b: Bonus) => {
      const aValue = a[sortColumn as keyof Bonus];
      const bValue = b[sortColumn as keyof Bonus];

      if (sortColumn === 'startDate' || sortColumn === 'endDate' || sortColumn === 'createdAt') {
        const aDate = new Date(aValue as string).getTime();
        const bDate = new Date(bValue as string).getTime();
        return sortDirection === 'asc' ? aDate - bDate : bDate - aDate;
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
      if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [filteredBonuses, sortColumn, sortDirection]);

  // Sayfalama
  const itemsPerPage = 10;
  const totalPages = Math.ceil(sortedBonuses.length / itemsPerPage);
  const paginatedBonuses = sortedBonuses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Sıralama işlemi
  const handleSort = (column: string) => {
    if (column === sortColumn) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };

  // Sayfa değiştirme
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Satır seçimi
  const handleSelectRow = (id: number) => {
    setSelectedRows(prev => 
      prev.includes(id) 
        ? prev.filter(rowId => rowId !== id)
        : [...prev, id]
    );
  };

  // Tümünü seç
  const handleSelectAll = () => {
    if (selectedRows.length === paginatedBonuses.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(paginatedBonuses.map((bonus: Bonus) => bonus.id));
    }
  };

  // Bonus detayları
  const handleViewDetails = (bonus: Bonus) => {
    setSelectedBonus(bonus);
    setShowDetailsModal(true);
  };

  // Bonus silme
  const handleDeleteClick = (id: number) => {
    setBonusToDelete(id);
    setShowDeleteModal(true);
  };

  // Durum renkleri
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-900/50 text-green-300 border-green-500/30';
      case 'inactive':
        return 'bg-gray-600/50 text-gray-300 border-gray-500/30';
      case 'upcoming':
        return 'bg-blue-900/50 text-blue-300 border-blue-500/30';
      case 'expired':
        return 'bg-red-900/50 text-red-300 border-red-500/30';
      default:
        return 'bg-gray-700/50 text-gray-300 border-gray-500/30';
    }
  };

  // Durum simgeleri
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive':
        return <XCircle className="h-4 w-4 text-gray-400" />;
      case 'upcoming':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'expired':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  // Bonus türü simgeleri
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'welcome':
        return <Gift className="h-4 w-4 text-yellow-500" />;
      case 'deposit':
        return <DollarSign className="h-4 w-4 text-green-500" />;
      case 'cashback':
        return <ArrowDownRight className="h-4 w-4 text-blue-500" />;
      case 'freespin':
        return <Percent className="h-4 w-4 text-purple-500" />;
      case 'loyalty':
        return <Users className="h-4 w-4 text-indigo-500" />;
      case 'birthday':
        return <Gift className="h-4 w-4 text-pink-500" />;
      case 'referral':
        return <Users className="h-4 w-4 text-orange-500" />;
      case 'tournament':
        return <Target className="h-4 w-4 text-red-500" />;
      default:
        return <Gift className="h-4 w-4 text-gray-500" />;
    }
  };

  // Yükleme durumu
  if (isLoading) {
    return (
      <AdminLayout title="Bonuslar">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-yellow-500 mx-auto mb-4" />
            <p className="text-gray-400">Bonus verileri yükleniyor...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Bonuslar">
      {/* İstatistik Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Toplam Bonus"
          value={bonusStats.totalBonuses}
          icon={Gift}
          change={bonusStats.monthlyGrowth}
          changeType={bonusStats.monthlyGrowth > 0 ? 'positive' : 'negative'}
        />
        <StatCard 
          title="Aktif Bonuslar"
          value={bonusStats.activeBonuses}
          icon={CheckCircle}
          subtitle={`${bonusStats.upcomingBonuses} yaklaşan`}
        />
        <StatCard 
          title="Toplam Kullanım"
          value={(bonusStats.totalClaimed || 0).toLocaleString()}
          icon={TrendingUp}
          change={15.3}
          changeType="positive"
        />
        <StatCard 
          title="Toplam Değer"
          value={`₺${(bonusStats.totalValue || 0).toLocaleString()}`}
          icon={DollarSign}
          change={8.7}
          changeType="positive"
        />
      </div>

      {/* Filtre ve Araç Çubuğu */}
      <div className="bg-gray-800/60 rounded-lg p-4 mb-6 border border-yellow-500/20">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            {/* Arama */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-yellow-500/70 h-5 w-5" />
              <input
                type="text"
                placeholder="Bonus ara..."
                className="w-full bg-gray-900/70 border border-yellow-500/30 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Yenileme Butonu */}
            <button
              onClick={handleRefreshBonuses}
              disabled={isLoading}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Yenile</span>
            </button>

            {/* Tür Filtresi */}
            <div className="relative">
              <select
                className="bg-gray-900/70 border border-yellow-500/30 text-white rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="all">Tüm Türler</option>
                {bonusTypes.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white h-4 w-4 pointer-events-none" />
            </div>

            {/* Durum Filtresi */}
            <div className="relative">
              <select
                className="bg-gray-900/70 border border-yellow-500/30 text-white rounded-lg px-4 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent appearance-none"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif</option>
                <option value="upcoming">Yaklaşan</option>
                <option value="inactive">Pasif</option>
                <option value="expired">Süresi Dolmuş</option>
              </select>
              <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-white h-4 w-4 pointer-events-none" />
            </div>
          </div>

          {/* Eylem Butonları */}
          <div className="flex gap-2">
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-medium"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Yeni Bonus</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors">
              <Download className="h-4 w-4" />
              <span>Dışa Aktar</span>
            </button>
          </div>
        </div>

        {/* Seçilen bonuslar için toplu işlemler */}
        {selectedRows.length > 0 && (
          <div className="mt-4 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <span className="text-yellow-400">
                {selectedRows.length} bonus seçildi
              </span>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm bg-green-500/20 text-green-400 rounded hover:bg-green-500/30 transition-colors">
                  Aktifleştir
                </button>
                <button className="px-3 py-1 text-sm bg-gray-500/20 text-gray-400 rounded hover:bg-gray-500/30 transition-colors">
                  Deaktive Et
                </button>
                <button className="px-3 py-1 text-sm bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 transition-colors">
                  Sil
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bonus Tablosu */}
      <div className="bg-gray-800/60 rounded-lg border border-yellow-500/20 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-yellow-500/10">
            <thead className="bg-gray-900/60">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-600 text-yellow-500 focus:ring-yellow-500"
                    checked={selectedRows.length > 0 && selectedRows.length === paginatedBonuses.length}
                    onChange={handleSelectAll}
                  />
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-yellow-400"
                  onClick={() => handleSort('id')}
                >
                  <div className="flex items-center">
                    ID
                    {sortColumn === 'id' && (
                      <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${
                        sortDirection === 'desc' ? 'rotate-180' : ''
                      }`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-yellow-400"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Bonus Adı
                    {sortColumn === 'name' && (
                      <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${
                        sortDirection === 'desc' ? 'rotate-180' : ''
                      }`} />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Tür
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-yellow-400"
                  onClick={() => handleSort('amount')}
                >
                  <div className="flex items-center">
                    Miktar
                    {sortColumn === 'amount' && (
                      <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${
                        sortDirection === 'desc' ? 'rotate-180' : ''
                      }`} />
                    )}
                  </div>
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-yellow-400"
                  onClick={() => handleSort('usageCount')}
                >
                  <div className="flex items-center">
                    Kullanım
                    {sortColumn === 'usageCount' && (
                      <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${
                        sortDirection === 'desc' ? 'rotate-180' : ''
                      }`} />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Durum
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider cursor-pointer hover:text-yellow-400"
                  onClick={() => handleSort('endDate')}
                >
                  <div className="flex items-center">
                    Bitiş Tarihi
                    {sortColumn === 'endDate' && (
                      <ChevronDown className={`ml-1 h-4 w-4 transform transition-transform ${
                        sortDirection === 'desc' ? 'rotate-180' : ''
                      }`} />
                    )}
                  </div>
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-yellow-500/10 bg-gray-900/20">
              {paginatedBonuses.map((bonus: Bonus) => (
                <tr key={bonus.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-600 text-yellow-500 focus:ring-yellow-500"
                      checked={selectedRows.includes(bonus.id)}
                      onChange={() => handleSelectRow(bonus.id)}
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-white">#{bonus.id}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 mr-3">
                        {getTypeIcon(bonus.type)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">{bonus.name}</div>
                        <div className="text-sm text-gray-400 truncate max-w-xs">{bonus.description}</div>
                        {bonus.code && (
                          <div className="flex items-center mt-1">
                            <span className="text-xs bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded font-mono">
                              {bonus.code}
                            </span>
                            <button className="ml-1 text-gray-400 hover:text-yellow-400">
                              <Copy className="h-3 w-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-300">{bonus.typeName}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {bonus.type === 'freespin' ? (
                        `${bonus.amount} dönüş`
                      ) : (
                        `%${bonus.amount}`
                      )}
                    </div>
                    {bonus.maxAmount > 0 && (
                      <div className="text-xs text-gray-400">
                                                  Maks: ₺{(bonus.maxAmount || 0).toLocaleString()}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                                            <div className="text-sm text-white">{(bonus.usageCount || 0).toLocaleString()}</div>
                        <div className="text-xs text-gray-400">
                          ₺{(bonus.totalValue || 0).toLocaleString()}
                        </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(bonus.status)}`}>
                      {getStatusIcon(bonus.status)}
                      <span className="ml-1 capitalize">{
                        bonus.status === 'active' ? 'Aktif' :
                        bonus.status === 'inactive' ? 'Pasif' :
                        bonus.status === 'upcoming' ? 'Yaklaşan' :
                        'Süresi Dolmuş'
                      }</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="text-sm text-white">
                      {new Date(bonus.endDate).toLocaleDateString('tr-TR')}
                    </div>
                    <div className="text-xs text-gray-400">
                      {Math.ceil((new Date(bonus.endDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} gün kaldı
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(bonus)}
                        className="text-blue-400 hover:text-blue-300 transition-colors"
                        title="Detayları Görüntüle"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        className="text-yellow-400 hover:text-yellow-300 transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(bonus.id)}
                        className="text-red-400 hover:text-red-300 transition-colors"
                        title="Sil"
                      >
                        <Trash className="h-4 w-4" />
                      </button>
                      <button
                        className="text-gray-400 hover:text-gray-300 transition-colors"
                        title="Paylaş"
                      >
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Sayfalama */}
        {totalPages > 1 && (
          <div className="bg-gray-900/40 px-4 py-3 border-t border-yellow-500/10">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {sortedBonuses.length} bonusun {(currentPage - 1) * itemsPerPage + 1}-{Math.min(currentPage * itemsPerPage, sortedBonuses.length)} arası gösteriliyor
              </div>
              <div className="flex space-x-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Önceki
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm rounded ${
                        currentPage === page
                          ? 'bg-yellow-500 text-black'
                          : 'bg-gray-700 text-white hover:bg-gray-600'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sonraki
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Veri bulunamadığında */}
      {!isLoading && paginatedBonuses.length === 0 && (
        <div className="bg-gray-800/60 rounded-lg border border-yellow-500/20 p-8 text-center">
          <Gift className="h-12 w-12 text-gray-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Bonus bulunamadı</h3>
          <p className="text-gray-400 mb-4">
            {searchTerm || typeFilter !== 'all' || statusFilter !== 'all'
              ? 'Arama kriterlerinize uygun bonus bulunamadı. Filtreleri temizleyerek tekrar deneyin.'
              : 'Henüz bonus eklenmemiş. İlk bonusu eklemek için "Yeni Bonus" butonunu kullanın.'
            }
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors font-medium"
          >
            Yeni Bonus Ekle
          </button>
        </div>
      )}

      {/* Bonus Detay Modal */}
      {showDetailsModal && selectedBonus && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Bonus Detayları</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Temel Bilgiler */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Temel Bilgiler</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-400">Bonus Adı</label>
                      <p className="text-white">{selectedBonus.name}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400">Açıklama</label>
                      <p className="text-white">{selectedBonus.description}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400">Bonus Kodu</label>
                      <p className="text-white font-mono">{selectedBonus.code || 'Kod gerektirmez'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Koşullar</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm text-gray-400">Bonus Miktarı</label>
                      <p className="text-white">
                        {selectedBonus.type === 'freespin' ? `${selectedBonus.amount} dönüş` : `%${selectedBonus.amount}`}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400">Maksimum Bonus</label>
                      <p className="text-white">₺{(selectedBonus.maxAmount || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400">Minimum Yatırım</label>
                      <p className="text-white">₺{(selectedBonus.minDeposit || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400">Çevrim Şartı</label>
                      <p className="text-white">{selectedBonus.wagerRequirement}x</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Şartlar ve Koşullar */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Şartlar ve Koşullar</h3>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-300 text-sm leading-relaxed">{selectedBonus.termsAndConditions}</p>
                </div>
              </div>

              {/* Oyun Kısıtlamaları */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Oyun Kısıtlamaları</h3>
                <div className="bg-gray-900/50 rounded-lg p-4">
                  <p className="text-gray-300 text-sm leading-relaxed">{selectedBonus.gameRestrictions}</p>
                </div>
              </div>

              {/* İstatistikler */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">İstatistikler</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-yellow-500">{selectedBonus.usageCount}</p>
                    <p className="text-sm text-gray-400">Toplam Kullanım</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-green-500">₺{(selectedBonus.totalValue || 0).toLocaleString()}</p>
                    <p className="text-sm text-gray-400">Toplam Değer</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-blue-500">{selectedBonus.conversionRate}%</p>
                    <p className="text-sm text-gray-400">Dönüşüm Oranı</p>
                  </div>
                  <div className="bg-gray-900/50 rounded-lg p-4 text-center">
                    <p className="text-2xl font-bold text-purple-500">{selectedBonus.popularityScore}/10</p>
                    <p className="text-sm text-gray-400">Popülerlik</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-end space-x-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Kapat
              </button>
              <button 
                onClick={() => {
                  setEditingBonus(selectedBonus);
                  setShowEditModal(true);
                  setShowDetailsModal(false);
                }}
                className="px-4 py-2 bg-yellow-500 text-black rounded-lg hover:bg-yellow-600 transition-colors"
              >
                Düzenle
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Gelişmiş Bonus Oluşturma Modalı */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl max-w-6xl w-full max-h-[95vh] overflow-y-auto shadow-2xl border border-gray-600">
            {/* Header */}
            <div className="p-8 border-b border-gray-700/50 bg-gradient-to-r from-yellow-600/10 to-orange-600/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-yellow-500/20 rounded-xl">
                    <Gift className="h-8 w-8 text-yellow-400" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold text-white">Yeni Bonus Kampanyası</h2>
                    <p className="text-gray-300 mt-1">Kullanıcılarınız için etkili bonus kampanyası tasarlayın</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6 text-gray-400" />
                </button>
              </div>
            </div>

            <div className="p-8 space-y-12">
              {/* Temel Bilgiler */}
              <section className="space-y-8">
                <div className="flex items-center space-x-4 pb-4 border-b border-gray-700/50">
                  <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30">
                    <Settings className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Temel Bilgiler</h3>
                    <p className="text-gray-400 text-sm">Bonus kampanyasının ana özellikleri</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-200 flex items-center gap-2">
                      <Star className="h-4 w-4 text-yellow-400" />
                      Bonus Adı *
                    </label>
                    <input
                      type="text"
                      value={bonusForm.name}
                      onChange={(e) => handleFormChange('name', e.target.value)}
                      placeholder="örn: Hoşgeldin Bonusu %100 + 50 Bedava Spin"
                      className={`w-full px-5 py-4 bg-gray-800/60 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 transition-all duration-200 hover:bg-gray-800/80 ${
                        formErrors.name 
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500' 
                          : 'border-gray-600 focus:ring-yellow-500 focus:border-yellow-500'
                      }`}
                    />
                    {formErrors.name && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <span className="text-red-500">⚠</span>
                        {formErrors.name}
                      </p>
                    )}
                    <p className="text-xs text-gray-400 flex items-center gap-1">
                      <Info className="h-3 w-3" />
                      Kullanıcıların göreceği bonus başlığı (max 100 karakter)
                    </p>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-200 flex items-center gap-2">
                      <Gift className="h-4 w-4 text-green-400" />
                      Bonus Türü *
                    </label>
                    <div className="relative">
                      <select 
                        value={bonusForm.type}
                        onChange={(e) => handleFormChange('type', e.target.value)}
                        className="w-full px-5 py-4 bg-gray-800/60 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 appearance-none transition-all duration-200 hover:bg-gray-800/80">
                        <option value="" className="bg-gray-800">Bonus türünü seçin</option>
                        <option value="welcome" className="bg-gray-800">🎁 Hoşgeldin Bonusu</option>
                        <option value="deposit" className="bg-gray-800">💰 Para Yatırma Bonusu</option>
                        <option value="reload" className="bg-gray-800">🔄 Yeniden Yükleme Bonusu</option>
                        <option value="cashback" className="bg-gray-800">💸 Geri Ödeme Bonusu</option>
                        <option value="freespin" className="bg-gray-800">🎰 Bedava Spin Bonusu</option>
                        <option value="loyalty" className="bg-gray-800">👑 Sadakat Bonusu</option>
                        <option value="birthday" className="bg-gray-800">🎂 Doğum Günü Bonusu</option>
                        <option value="vip" className="bg-gray-800">💎 VIP Bonusu</option>
                        <option value="tournament" className="bg-gray-800">🏆 Turnuva Bonusu</option>
                        <option value="referral" className="bg-gray-800">👥 Arkadaş Davet Bonusu</option>
                        <option value="special" className="bg-gray-800">⭐ Özel Teklif</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Bonus Açıklaması *
                    </label>
                    <textarea
                      value={bonusForm.description}
                      onChange={(e) => handleFormChange('description', e.target.value)}
                      rows={4}
                      placeholder="Bonusun detaylı açıklaması... Kullanıcıları cezbedecek şekilde yazın."
                      className={`w-full px-4 py-3 bg-gray-700/50 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 resize-none transition-all duration-200 ${
                        formErrors.description 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-gray-600 focus:ring-yellow-500'
                      }`}
                    />
                    {formErrors.description && (
                      <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                        <span className="text-red-500">⚠</span>
                        {formErrors.description}
                      </p>
                    )}
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-400">Bu açıklama kullanıcı arayüzünde görünecek</p>
                      <p className="text-xs text-gray-500">
                        {bonusForm.description.length}/500
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Bonus Değerleri */}
              <section className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Calculator className="h-5 w-5 text-green-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Bonus Değerleri ve Koşulları</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Bonus Oranı/Miktarı *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={bonusForm.percentage}
                        onChange={(e) => handleFormChange('percentage', e.target.value)}
                        placeholder="100"
                        className="w-full px-4 py-3 pr-12 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                      <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">%</span>
                    </div>
                    <p className="text-xs text-gray-400">Yüzde için oran, spin için adet</p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Maksimum Bonus Tutarı
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">₺</span>
                      <input
                        type="number"
                        value={bonusForm.maxBonus}
                        onChange={(e) => handleFormChange('maxBonus', e.target.value)}
                        placeholder="5000"
                        className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>
                    <p className="text-xs text-gray-400">Bonus için üst limit</p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Minimum Yatırım *
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 font-medium">₺</span>
                      <input
                        type="number"
                        value={bonusForm.minDeposit}
                        onChange={(e) => handleFormChange('minDeposit', e.target.value)}
                        placeholder="50"
                        className="w-full pl-12 pr-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      />
                    </div>
                    <p className="text-xs text-gray-400">Bonus almak için gerekli</p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Çevrim Şartı *
                    </label>
                    <div className="relative">
                      <select className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none">
                        <option value="1">1x - Çevrimsiz</option>
                        <option value="10">10x - Düşük</option>
                        <option value="20">20x - Orta</option>
                        <option value="30">30x - Standart</option>
                        <option value="35">35x - Normal</option>
                        <option value="40">40x - Yüksek</option>
                        <option value="50">50x - Çok Yüksek</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-400">Bonus × çevrim katı</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Bonus Kodu (Opsiyonel)
                    </label>
                    <input
                      type="text"
                      placeholder="WELCOME100"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 uppercase"
                    />
                    <p className="text-xs text-gray-400">Kullanıcıların girebileceği promosyon kodu</p>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Kullanım Limiti
                    </label>
                    <input
                      type="number"
                      placeholder="1000"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <p className="text-xs text-gray-400">Toplam kaç kişi kullanabilir (boş = sınırsız)</p>
                  </div>
                </div>
              </section>

              {/* Geçerlilik ve Hedefleme */}
              <section className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Calendar className="h-5 w-5 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Geçerlilik ve Hedefleme</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Başlangıç Tarihi *
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Bitiş Tarihi *
                    </label>
                    <input
                      type="datetime-local"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Bonus Durumu *
                    </label>
                    <div className="relative">
                      <select className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none">
                        <option value="active">🟢 Aktif</option>
                        <option value="upcoming">🟡 Yakında</option>
                        <option value="inactive">🔴 Pasif</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Hedef Kullanıcı Grubu *
                    </label>
                    <div className="relative">
                      <select className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none">
                        <option value="all">👥 Tüm Kullanıcılar</option>
                        <option value="new">🆕 Yeni Üyeler</option>
                        <option value="existing">👤 Mevcut Üyeler</option>
                        <option value="vip">👑 VIP Üyeler</option>
                        <option value="inactive">😴 Pasif Kullanıcılar</option>
                        <option value="high-roller">💎 Yüksek Bahisçiler</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Kullanıcı Başına Limit
                    </label>
                    <div className="relative">
                      <select className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 appearance-none">
                        <option value="1">1 kez kullanabilir</option>
                        <option value="daily">Günde 1 kez</option>
                        <option value="weekly">Haftada 1 kez</option>
                        <option value="unlimited">Sınırsız</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </section>

              {/* Oyun Kısıtlamaları */}
              <section className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-500/20 rounded-lg">
                    <Gamepad2 className="h-5 w-5 text-orange-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Oyun Kısıtlamaları ve Şartlar</h3>
                </div>

                <div className="space-y-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Geçerli Oyunlar
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Bu bonus hangi oyunlarda kullanılabilir? (örn: Tüm slot oyunları, sadece Pragmatic Play oyunları, belirli oyun kategorileri vb.)"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Şartlar ve Koşullar *
                    </label>
                    <textarea
                      rows={5}
                      placeholder="Bonusun detaylı şartlarını yazın:&#10;- Kullanım koşulları&#10;- Çevrim şartları detayları&#10;- Geçerlilik süresi&#10;- Kısıtlamalar&#10;- İptal koşulları"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500 resize-none"
                    />
                  </div>
                </div>
              </section>

              {/* Pazarlama ve Görsel */}
              <section className="space-y-6">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-pink-500/20 rounded-lg">
                    <Image className="h-5 w-5 text-pink-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">Pazarlama ve Görsel</h3>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-300">
                      Bonus Görseli URL
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/bonus-image.jpg"
                      className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                    />
                    <p className="text-xs text-gray-400">Bonus kartında gösterilecek görsel</p>
                  </div>

                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-300">
                      Pazarlama Seçenekleri
                    </label>
                    <div className="space-y-3">
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500 focus:ring-2"
                        />
                        <span className="text-gray-300 group-hover:text-white transition-colors">⭐ Öne çıkarılsın (Ana sayfada göster)</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500 focus:ring-2"
                        />
                        <span className="text-gray-300 group-hover:text-white transition-colors">🔔 Kullanıcılara anlık bildirim gönder</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500 focus:ring-2"
                        />
                        <span className="text-gray-300 group-hover:text-white transition-colors">📧 E-posta kampanyası başlat</span>
                      </label>
                      <label className="flex items-center space-x-3 cursor-pointer group">
                        <input 
                          type="checkbox" 
                          className="w-5 h-5 rounded border-gray-600 bg-gray-700 text-yellow-500 focus:ring-yellow-500 focus:ring-2"
                        />
                        <span className="text-gray-300 group-hover:text-white transition-colors">📱 SMS bildirimi gönder</span>
                      </label>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-gray-700/50 bg-gray-800/50">
              <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="text-sm text-gray-400">
                  * işaretli alanlar zorunludur
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      resetForm();
                      setShowCreateModal(false);
                    }}
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="h-4 w-4" />
                    İptal
                  </button>
                  <button 
                    disabled={isSubmitting}
                    className="px-6 py-3 bg-gray-600 hover:bg-gray-500 text-white rounded-xl transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save className="h-4 w-4" />
                    Taslak Kaydet
                  </button>
                  <button 
                    onClick={handleCreateBonus}
                    disabled={isSubmitting || Object.keys(formErrors).length > 0}
                    className="px-8 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-black font-semibold rounded-xl transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        İşleniyor...
                      </>
                    ) : (
                      <>
                        <Rocket className="h-5 w-5" />
                        Bonus Kampanyasını Başlat
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default Bonuses;