import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Search, Filter, Download, Eye, Check, X, Clock, 
  FileText, Camera, CreditCard, File, AlertCircle,
  User, Calendar, FileIcon, Trash2, RotateCcw
} from 'lucide-react';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

interface KYCDocument {
  id: number;
  userId: number;
  username: string;
  email: string;
  type: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedBy?: number;
  uploadedAt: string;
  reviewedAt?: string;
}

interface KYCStats {
  statusStats: Array<{
    status: string;
    count: number;
    type: string;
  }>;
  dailyStats: Array<{
    date: string;
    count: number;
    status: string;
  }>;
  typeStats: Array<{
    type: string;
    count: number;
    approved: number;
    pending: number;
    rejected: number;
  }>;
}

const KYC_TYPES = {
  passport: { label: 'Pasaport', icon: FileText, color: 'bg-blue-500' },
  id_card: { label: 'Kimlik Kartı', icon: CreditCard, color: 'bg-green-500' },
  driver_license: { label: 'Ehliyet', icon: Camera, color: 'bg-yellow-500' },
  utility_bill: { label: 'Fatura', icon: File, color: 'bg-purple-500' },
  bank_statement: { label: 'Banka Ekstresi', icon: FileIcon, color: 'bg-red-500' }
};

const STATUS_CONFIG = {
  pending: { label: 'Beklemede', color: 'bg-yellow-500', icon: Clock },
  approved: { label: 'Onaylandı', color: 'bg-green-500', icon: Check },
  rejected: { label: 'Reddedildi', color: 'bg-red-500', icon: X }
};

export default function KYC() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const { toast } = useToast();
  const { language } = useLanguage();
  const queryClient = useQueryClient();

  // KYC belgelerini getir
  const { data: kycData, isLoading } = useQuery({
    queryKey: ['/api/admin/kyc', currentPage, searchTerm, statusFilter, typeFilter],
    queryFn: async () => {
      const response = await fetch(`/api/admin/kyc?page=${currentPage}&search=${searchTerm}&status=${statusFilter}&type=${typeFilter}`, {
        credentials: 'include'
      });
      if (!response.ok) throw new Error('KYC verileri alınamadı');
      return response.json();
    }
  });

  // KYC istatistiklerini getir
  const { data: statsData } = useQuery({
    queryKey: ['/api/admin/kyc/stats/summary'],
    queryFn: async () => {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const response = await fetch('/api/admin/kyc/stats/summary', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('KYC istatistikleri alınamadı');
      return response.json();
    }
  });

  // KYC belge durumunu güncelle
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status, rejectionReason }: { id: number; status: string; rejectionReason?: string }) => {
      const token = localStorage.getItem('admin_token') || localStorage.getItem('token');
      const response = await fetch(`/api/admin/kyc/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status, rejectionReason, reviewedBy: 1 })
      });
      if (!response.ok) throw new Error('Durum güncellenemedi');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc/stats/summary'] });
      setReviewDialogOpen(false);
      setRejectionReason('');
      toast({
        title: 'Başarılı',
        description: 'KYC belge durumu güncellendi'
      });
    },
    onError: (error: any) => {
      toast({
        title: 'Hata',
        description: error.message || 'KYC belge durumu güncellenemedi',
        variant: 'destructive'
      });
    }
  });

  const handleStatusUpdate = (document: KYCDocument, newStatus: string) => {
    if (newStatus === 'rejected') {
      setSelectedDocument(document);
      setReviewDialogOpen(true);
    } else {
      updateStatusMutation.mutate({ id: document.id, status: newStatus });
    }
  };

  const handleReject = () => {
    if (selectedDocument && rejectionReason.trim()) {
      updateStatusMutation.mutate({
        id: selectedDocument.id,
        status: 'rejected',
        rejectionReason: rejectionReason.trim()
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getTypeConfig = (type: string) => {
    return KYC_TYPES[type as keyof typeof KYC_TYPES] || { 
      label: type, 
      icon: File, 
      color: 'bg-gray-500' 
    };
  };

  const exportData = async (format: 'csv' | 'json' = 'csv') => {
    try {
      const response = await fetch(`/api/admin/kyc/export/data?format=${format}&search=${searchTerm}&status=${statusFilter}&type=${typeFilter}`);
      
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `kyc-documents-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: 'Başarılı',
        description: `KYC belgeleri ${format.toUpperCase()} formatında dışa aktarıldı`
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Dışa aktarma işlemi başarısız',
        variant: 'destructive'
      });
    }
  };

  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* Başlık ve Filtreler */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">KYC Yönetimi</h1>
            <p className="text-gray-400">Kullanıcı belge doğrulama işlemleri</p>
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
                    <p className="text-sm text-gray-400">Toplam Belge</p>
                    <p className="text-2xl font-bold text-white">
                      {statsData.statusStats?.reduce((acc: number, stat: any) => acc + stat.count, 0) || 0}
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Bekleyen</p>
                    <p className="text-2xl font-bold text-yellow-500">
                      {statsData.statusStats?.filter((s: any) => s.status === 'pending').reduce((acc: number, stat: any) => acc + stat.count, 0) || 0}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Onaylanan</p>
                    <p className="text-2xl font-bold text-green-500">
                      {statsData.statusStats?.filter((s: any) => s.status === 'approved').reduce((acc: number, stat: any) => acc + stat.count, 0) || 0}
                    </p>
                  </div>
                  <Check className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-400">Reddedilen</p>
                    <p className="text-2xl font-bold text-red-500">
                      {statsData.statusStats?.filter((s: any) => s.status === 'rejected').reduce((acc: number, stat: any) => acc + stat.count, 0) || 0}
                    </p>
                  </div>
                  <X className="h-8 w-8 text-red-500" />
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
                    placeholder="Kullanıcı adı, e-posta veya dosya adı ara..."
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
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="approved">Onaylandı</SelectItem>
                  <SelectItem value="rejected">Reddedildi</SelectItem>
                </SelectContent>
              </Select>

              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full lg:w-48 bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Tür Filtrele" />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="all">Tüm Türler</SelectItem>
                  <SelectItem value="passport">Pasaport</SelectItem>
                  <SelectItem value="id_card">Kimlik Kartı</SelectItem>
                  <SelectItem value="driver_license">Ehliyet</SelectItem>
                  <SelectItem value="utility_bill">Fatura</SelectItem>
                  <SelectItem value="bank_statement">Banka Ekstresi</SelectItem>
                </SelectContent>
              </Select>

              <Button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                  setTypeFilter('all');
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

        {/* KYC Belgeleri Listesi */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">KYC Belgeleri</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-16 bg-gray-700 rounded"></div>
                  </div>
                ))}
              </div>
            ) : kycData?.documents?.length > 0 ? (
              <div className="space-y-4">
                {kycData.documents.map((document: KYCDocument) => {
                  const typeConfig = getTypeConfig(document.type);
                  const statusConfig = STATUS_CONFIG[document.status];
                  const TypeIcon = typeConfig.icon;
                  const StatusIcon = statusConfig.icon;

                  return (
                    <div
                      key={document.id}
                      className="p-4 bg-gray-700 rounded-lg border border-gray-600 hover:border-gray-500 transition-colors"
                    >
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${typeConfig.color}`}>
                            <TypeIcon className="h-5 w-5 text-white" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-col lg:flex-row lg:items-center gap-2">
                              <h3 className="font-medium text-white truncate">
                                {document.fileName}
                              </h3>
                              <div className="flex flex-wrap gap-2">
                                <Badge variant="outline" className="bg-gray-600 text-gray-200 border-gray-500">
                                  {typeConfig.label}
                                </Badge>
                                <Badge className={`${statusConfig.color} text-white`}>
                                  <StatusIcon className="h-3 w-3 mr-1" />
                                  {statusConfig.label}
                                </Badge>
                              </div>
                            </div>
                            
                            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-400">
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                {document.username}
                              </div>
                              <div className="flex items-center gap-1">
                                <FileIcon className="h-4 w-4" />
                                {formatFileSize(document.fileSize)}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {format(new Date(document.uploadedAt), 'dd MMM yyyy HH:mm', {
                                  locale: language === 'tr' ? tr : enUS
                                })}
                              </div>
                            </div>
                            
                            {document.rejectionReason && (
                              <div className="mt-2 p-2 bg-red-900/20 border border-red-800 rounded text-sm text-red-400">
                                <div className="flex items-center gap-1 mb-1">
                                  <AlertCircle className="h-4 w-4" />
                                  Red Nedeni:
                                </div>
                                {document.rejectionReason}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {document.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleStatusUpdate(document, 'approved')}
                                className="bg-green-600 hover:bg-green-700"
                                disabled={updateStatusMutation.isPending}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleStatusUpdate(document, 'rejected')}
                                disabled={updateStatusMutation.isPending}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button size="sm" variant="outline" className="bg-gray-600 border-gray-500 hover:bg-gray-500">
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
                              <DialogHeader>
                                <DialogTitle>KYC Belge Detayları</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <label className="text-sm text-gray-400">Kullanıcı</label>
                                    <p className="text-white">{document.username}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-400">E-posta</label>
                                    <p className="text-white">{document.email}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-400">Belge Türü</label>
                                    <p className="text-white">{typeConfig.label}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-400">Durum</label>
                                    <Badge className={`${statusConfig.color} text-white`}>
                                      {statusConfig.label}
                                    </Badge>
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-400">Dosya Boyutu</label>
                                    <p className="text-white">{formatFileSize(document.fileSize)}</p>
                                  </div>
                                  <div>
                                    <label className="text-sm text-gray-400">MIME Türü</label>
                                    <p className="text-white">{document.mimeType}</p>
                                  </div>
                                </div>
                                
                                <div>
                                  <label className="text-sm text-gray-400">Dosya Adı</label>
                                  <p className="text-white break-all">{document.fileName}</p>
                                </div>
                                
                                {document.rejectionReason && (
                                  <div>
                                    <label className="text-sm text-gray-400">Red Nedeni</label>
                                    <p className="text-red-400">{document.rejectionReason}</p>
                                  </div>
                                )}
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">KYC belgesi bulunamadı</p>
              </div>
            )}

            {/* Sayfalama */}
            {kycData?.totalPages > 1 && (
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
                  Sayfa {currentPage} / {kycData.totalPages}
                </span>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(kycData.totalPages, prev + 1))}
                  disabled={currentPage === kycData.totalPages}
                  className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                >
                  Sonraki
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Red Nedeni Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white">
            <DialogHeader>
              <DialogTitle>Belgeyi Reddet</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400 mb-2 block">Red Nedeni</label>
                <Textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Belgenin neden reddedildiğini açıklayın..."
                  className="bg-gray-700 border-gray-600 text-white"
                  rows={4}
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setReviewDialogOpen(false);
                    setRejectionReason('');
                  }}
                  className="bg-gray-700 border-gray-600 hover:bg-gray-600"
                >
                  İptal
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || updateStatusMutation.isPending}
                >
                  Reddet
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}