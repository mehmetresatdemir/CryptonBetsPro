import React, { useState, useEffect, Fragment } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Search, 
  Download, 
  Filter, 
  RefreshCw,
  AlertTriangle,
  ShieldAlert,
  CheckCircle,
  XCircle,
  User,
  Clock,
  Eye,
  Lock,
  Unlock,
  Activity,
  DollarSign,
  CreditCard,
  LogIn,
  LogOut,
  UserPlus,
  Settings,
  FileText,
  Calendar,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

interface UserLog {
  id: number;
  userId: number;
  username: string;
  email: string;
  action: string;
  category: 'auth' | 'transaction' | 'game' | 'profile' | 'security' | 'deposit' | 'withdrawal';
  description: string;
  ipAddress: string;
  userAgent: string;
  metadata?: Record<string, any>;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'pending' | 'warning';
}

interface UserLogFilters {
  search: string;
  category: string;
  severity: string;
  status: string;
  dateFrom: string;
  dateTo: string;
  userId?: number;
}

const UserLogs: React.FC = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [filters, setFilters] = useState<UserLogFilters>({
    search: '',
    category: 'all',
    severity: 'all',
    status: 'all',
    dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Son 7 gün
    dateTo: new Date().toISOString().split('T')[0]
  });
  
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  // Kullanıcı loglarını getir
  const { data: userLogsData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/user-logs', filters, currentPage, pageSize],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value && value !== 'all')
        )
      });
      
      const response = await fetch(`/api/admin/user-logs?${params}`);
      if (!response.ok) {
        throw new Error('Kullanıcı logları yüklenemedi');
      }
      return response.json();
    }
  });

  // Log dışa aktarma
  const exportMutation = useMutation({
    mutationFn: async (format: 'csv' | 'json') => {
      const params = new URLSearchParams({
        format,
        ...Object.fromEntries(
          Object.entries(filters).filter(([_, value]) => value && value !== 'all')
        )
      });
      
      const response = await fetch(`/api/admin/user-logs/export?${params}`);
      if (!response.ok) {
        throw new Error('Dışa aktarma başarısız');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `user-logs-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    },
    onSuccess: () => {
      toast({
        title: "Başarılı",
        description: "Loglar başarıyla dışa aktarıldı",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Dışa aktarma işlemi başarısız",
        variant: "destructive"
      });
    }
  });

  // Filtreleri temizle
  const clearFilters = () => {
    setFilters({
      search: '',
      category: 'all',
      severity: 'all',
      status: 'all',
      dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0]
    });
    setCurrentPage(1);
  };

  // Log detaylarını göster/gizle
  const toggleLogDetails = (logId: number) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  // Kategori ikonları
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'auth':
        return <LogIn className="h-4 w-4 text-blue-400" />;
      case 'transaction':
        return <DollarSign className="h-4 w-4 text-green-400" />;
      case 'game':
        return <Activity className="h-4 w-4 text-purple-400" />;
      case 'profile':
        return <User className="h-4 w-4 text-orange-400" />;
      case 'security':
        return <ShieldAlert className="h-4 w-4 text-red-400" />;
      case 'deposit':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'withdrawal':
        return <CreditCard className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  // Durum rozetleri
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge className="bg-green-500 text-white">Başarılı</Badge>;
      case 'failure':
        return <Badge className="bg-red-500 text-white">Başarısız</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 text-black">Bekliyor</Badge>;
      case 'warning':
        return <Badge className="bg-orange-500 text-white">Uyarı</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">{status}</Badge>;
    }
  };

  // Önem derecesi rozetleri
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'low':
        return <Badge variant="outline" className="border-green-500 text-green-400">Düşük</Badge>;
      case 'medium':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-400">Orta</Badge>;
      case 'high':
        return <Badge variant="outline" className="border-orange-500 text-orange-400">Yüksek</Badge>;
      case 'critical':
        return <Badge variant="outline" className="border-red-500 text-red-400">Kritik</Badge>;
      default:
        return <Badge variant="outline">{severity}</Badge>;
    }
  };

  // Zaman formatı
  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('tr-TR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const userLogs = userLogsData?.logs || [];
  const totalCount = userLogsData?.total || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Kullanıcı Logları</h1>
            <p className="text-gray-400">Kullanıcı aktiviteleri ve sistem logları</p>
            {userLogsData && (
              <div className="flex items-center gap-4 mt-2 text-sm">
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
                  <Activity className="h-3 w-3 mr-1" />
                  Toplam: {userLogsData.total}
                </Badge>
                <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Başarılı: {userLogsData.logs?.filter((log: any) => log.status === 'success').length || 0}
                </Badge>
                <Badge variant="secondary" className="bg-red-500/20 text-red-400">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  Kritik: {userLogsData.logs?.filter((log: any) => log.severity === 'critical').length || 0}
                </Badge>
              </div>
            )}
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-gray-700"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['/api/admin/user-logs'] })}
              disabled={isLoading}
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Yenile
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-gray-700"
              onClick={() => exportMutation.mutate('csv')}
              disabled={exportMutation.isPending}
            >
              <Download size={16} />
              CSV Dışa Aktar
            </Button>
            <Button 
              variant="outline" 
              className="flex items-center gap-2 border-gray-700"
              onClick={() => exportMutation.mutate('json')}
              disabled={exportMutation.isPending}
            >
              <Download size={16} />
              JSON Dışa Aktar
            </Button>
          </div>
        </div>

        {/* Filtreler */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Filtreler
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Arama */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Arama</label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input 
                    placeholder="Kullanıcı, aksiyon veya açıklama ara..."
                    className="bg-gray-900 border-gray-700 pl-9"
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  />
                </div>
              </div>
              
              {/* Kategori */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Kategori</label>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700">
                    <SelectValue placeholder="Kategori seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Kategoriler</SelectItem>
                    <SelectItem value="auth">Kimlik Doğrulama</SelectItem>
                    <SelectItem value="transaction">İşlemler</SelectItem>
                    <SelectItem value="game">Oyun</SelectItem>
                    <SelectItem value="profile">Profil</SelectItem>
                    <SelectItem value="security">Güvenlik</SelectItem>
                    <SelectItem value="deposit">Para Yatırma</SelectItem>
                    <SelectItem value="withdrawal">Para Çekme</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Önem Derecesi */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Önem Derecesi</label>
                <Select 
                  value={filters.severity} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700">
                    <SelectValue placeholder="Önem derecesi seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Seviyeler</SelectItem>
                    <SelectItem value="low">Düşük</SelectItem>
                    <SelectItem value="medium">Orta</SelectItem>
                    <SelectItem value="high">Yüksek</SelectItem>
                    <SelectItem value="critical">Kritik</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Durum */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Durum</label>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger className="bg-gray-900 border-gray-700">
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="success">Başarılı</SelectItem>
                    <SelectItem value="failure">Başarısız</SelectItem>
                    <SelectItem value="pending">Bekliyor</SelectItem>
                    <SelectItem value="warning">Uyarı</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tarih Filtreleri */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Başlangıç Tarihi</label>
                <Input 
                  type="date"
                  className="bg-gray-900 border-gray-700"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Bitiş Tarihi</label>
                <Input 
                  type="date"
                  className="bg-gray-900 border-gray-700"
                  value={filters.dateTo}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2 flex items-end">
                <Button 
                  variant="outline" 
                  className="border-gray-700 w-full"
                  onClick={clearFilters}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filtreleri Temizle
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loglar Tablosu */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex justify-between items-center">
              <span>Kullanıcı Logları</span>
              <div className="flex items-center gap-2">
                <Badge className="bg-blue-500">{totalCount} toplam</Badge>
                <Badge variant="outline" className="border-gray-600">
                  Sayfa {currentPage} / {totalPages}
                </Badge>
              </div>
            </CardTitle>
            <CardDescription>
              Son kullanıcı aktiviteleri ve sistem logları
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-400" />
                <span className="ml-2 text-gray-400">Loglar yükleniyor...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center py-8 text-red-400">
                <AlertTriangle className="h-8 w-8 mr-2" />
                <span>Loglar yüklenirken hata oluştu</span>
              </div>
            ) : userLogs.length === 0 ? (
              <div className="flex items-center justify-center py-8 text-gray-400">
                <FileText className="h-8 w-8 mr-2" />
                <span>Seçili kriterlere uygun log bulunamadı</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-gray-300">Zaman</TableHead>
                        <TableHead className="text-gray-300">Kullanıcı</TableHead>
                        <TableHead className="text-gray-300">Kategori</TableHead>
                        <TableHead className="text-gray-300">Aksiyon</TableHead>
                        <TableHead className="text-gray-300">Durum</TableHead>
                        <TableHead className="text-gray-300">Önem</TableHead>
                        <TableHead className="text-gray-300">IP Adresi</TableHead>
                        <TableHead className="text-gray-300">Detay</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {userLogs.map((log: UserLog) => (
                        <React.Fragment key={log.id}>
                          <TableRow className="hover:bg-gray-700/50">
                            <TableCell className="text-gray-300">
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                {formatTimestamp(log.timestamp)}
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              <div className="flex items-center gap-2">
                                <User className="h-4 w-4 text-blue-400" />
                                <div>
                                  <div className="font-medium">{log.username}</div>
                                  <div className="text-xs text-gray-500">ID: {log.userId}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              <div className="flex items-center gap-2">
                                {getCategoryIcon(log.category)}
                                <span className="capitalize">{log.category}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-gray-300">
                              <div>
                                <div className="font-medium">{log.action}</div>
                                <div className="text-xs text-gray-500 truncate max-w-32">
                                  {log.description}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(log.status)}</TableCell>
                            <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                            <TableCell className="text-gray-300 font-mono text-xs">
                              {log.ipAddress}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleLogDetails(log.id)}
                                className="text-blue-400 hover:text-blue-300"
                              >
                                <Eye className="h-4 w-4 mr-1" />
                                {expandedLogId === log.id ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                              </Button>
                            </TableCell>
                          </TableRow>
                          {expandedLogId === log.id && (
                            <TableRow>
                              <TableCell colSpan={8} className="bg-gray-900/50">
                                <div className="p-4 space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-medium text-white mb-2">Detaylı Açıklama</h4>
                                      <p className="text-gray-300 text-sm">{log.description}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-medium text-white mb-2">Teknik Bilgiler</h4>
                                      <div className="space-y-1 text-sm">
                                        <div><span className="text-gray-400">User Agent:</span> <span className="text-gray-300 font-mono text-xs">{log.userAgent}</span></div>
                                        <div><span className="text-gray-400">Email:</span> <span className="text-gray-300">{log.email}</span></div>
                                      </div>
                                    </div>
                                  </div>
                                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                                    <div>
                                      <h4 className="font-medium text-white mb-2">Ek Veriler</h4>
                                      <pre className="bg-gray-800 p-3 rounded text-xs text-gray-300 overflow-x-auto">
                                        {JSON.stringify(log.metadata, null, 2)}
                                      </pre>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          )}
                        </React.Fragment>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-4">
                    <div className="text-sm text-gray-400">
                      {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} / {totalCount} kayıt
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="border-gray-700"
                      >
                        Önceki
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="border-gray-700"
                      >
                        Sonraki
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default UserLogs;