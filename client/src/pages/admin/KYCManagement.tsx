import { useState } from 'react';
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
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Search, Download, Eye, Check, X, Clock, 
  FileText, Shield, User, Calendar, 
  AlertTriangle, CheckCircle, XCircle
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';

interface KYCDocument {
  id: number;
  userId: number;
  username: string;
  documentType: string;
  status: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  frontImageUrl?: string;
  backImageUrl?: string;
  notes?: string;
  rejectionReason?: string;
}

interface KYCStats {
  totalDocuments: number;
  pendingReview: number;
  approved: number;
  rejected: number;
  completionRate: number;
}

export default function KYCManagement() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    documentType: 'all',
    page: 1,
    limit: 20
  });

  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null);
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');

  // KYC istatistikleri
  const { data: kycStats } = useQuery({
    queryKey: ['/api/admin/kyc/stats'],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/admin/kyc/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('KYC istatistikleri alınamadı');
      return await response.json();
    }
  });

  // KYC dokümanları listesi
  const { data: kycData, isLoading } = useQuery({
    queryKey: ['/api/admin/kyc/documents', filters],
    queryFn: async () => {
      const token = localStorage.getItem('adminToken');
      const queryParams = new URLSearchParams({
        search: filters.search,
        status: filters.status,
        documentType: filters.documentType,
        page: filters.page.toString(),
        limit: filters.limit.toString()
      });
      const response = await fetch(`/api/admin/kyc/documents?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('KYC verileri alınamadı');
      return await response.json();
    }
  });

  // KYC doküman inceleme mutation
  const reviewMutation = useMutation({
    mutationFn: async (data: { documentId: number; action: 'approve' | 'reject'; notes?: string }) => {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/admin/kyc/documents/${data.documentId}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          action: data.action,
          notes: data.notes
        })
      });
      if (!response.ok) throw new Error('KYC inceleme yapılamadı');
      return await response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc/documents'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/kyc/stats'] });
      setReviewDialogOpen(false);
      setSelectedDocument(null);
      setReviewNotes('');
      toast({
        title: "KYC İncelemesi",
        description: "Doküman başarıyla incelendi",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Hata",
        description: error.message || "KYC incelemesi sırasında hata oluştu",
        variant: "destructive",
      });
    }
  });

  const handleReview = () => {
    if (!selectedDocument || !reviewAction) return;

    reviewMutation.mutate({
      documentId: selectedDocument.id,
      action: reviewAction,
      notes: reviewNotes
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
          <Clock className="w-3 h-3 mr-1" />
          Beklemede
        </Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-green-500/20 text-green-400 border-green-500/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Onaylandı
        </Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-500/20 text-red-400 border-red-500/30">
          <XCircle className="w-3 h-3 mr-1" />
          Reddedildi
        </Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getDocumentTypeName = (type: string) => {
    switch (type) {
      case 'identity':
        return 'Kimlik Belgesi';
      case 'address':
        return 'Adres Belgesi';
      case 'bank':
        return 'Banka Belgesi';
      default:
        return type;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">KYC Yönetimi</h1>
            <p className="text-gray-400 mt-2">Kullanıcı doküman onayları ve KYC süreçleri</p>
          </div>
          <Button 
            variant="outline" 
            className="border-yellow-500/30 text-yellow-400 hover:bg-yellow-500/10"
          >
            <Download className="w-4 h-4 mr-2" />
            KYC Raporu
          </Button>
        </div>

        {/* İstatistikler */}
        {kycStats && (
          <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
            <Card className="bg-gray-800/80 border-yellow-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Toplam Doküman</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{kycStats.totalDocuments}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-yellow-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Beklemede</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-400">{kycStats.pendingReview}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-yellow-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Onaylandı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{kycStats.approved}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-yellow-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Reddedildi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-400">{kycStats.rejected}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/80 border-yellow-500/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-white text-sm">Tamamlanma Oranı</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">{kycStats.completionRate}%</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filtreler */}
        <Card className="bg-gray-800/80 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-white">Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Kullanıcı ara..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                  className="pl-10 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                />
              </div>

              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value, page: 1 }))}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue placeholder="Durum seçin" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">Tüm Durumlar</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="approved">Onaylandı</SelectItem>
                  <SelectItem value="rejected">Reddedildi</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.documentType} 
                onValueChange={(value) => setFilters(prev => ({ ...prev, documentType: value, page: 1 }))}
              >
                <SelectTrigger className="bg-gray-700/50 border-gray-600 text-white">
                  <SelectValue placeholder="Doküman türü" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-600">
                  <SelectItem value="all">Tüm Türler</SelectItem>
                  <SelectItem value="identity">Kimlik Belgesi</SelectItem>
                  <SelectItem value="address">Adres Belgesi</SelectItem>
                  <SelectItem value="bank">Banka Belgesi</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                onClick={() => setFilters({ search: '', status: 'all', documentType: 'all', page: 1, limit: 20 })}
                variant="outline"
                className="border-gray-600 text-gray-400 hover:bg-gray-700/50"
              >
                Filtreleri Temizle
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* KYC Dokümanları Listesi */}
        <Card className="bg-gray-800/80 border-yellow-500/20">
          <CardHeader>
            <CardTitle className="text-white">KYC Dokümanları</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="text-gray-400">Dokümanlar yükleniyor...</div>
              </div>
            ) : kycData?.documents?.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="px-4 py-3 text-left text-gray-400">Kullanıcı</th>
                      <th className="px-4 py-3 text-left text-gray-400">Doküman Türü</th>
                      <th className="px-4 py-3 text-left text-gray-400">Durum</th>
                      <th className="px-4 py-3 text-left text-gray-400">Gönderilme Tarihi</th>
                      <th className="px-4 py-3 text-left text-gray-400">İşlemler</th>
                    </tr>
                  </thead>
                  <tbody>
                    {kycData.documents.map((doc: KYCDocument) => (
                      <tr key={doc.id} className="border-b border-gray-700 hover:bg-gray-700/30">
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <User className="w-4 h-4 mr-2 text-gray-400" />
                            <span className="text-white font-medium">{doc.username}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-300">
                          {getDocumentTypeName(doc.documentType)}
                        </td>
                        <td className="px-4 py-3">
                          {getStatusBadge(doc.status)}
                        </td>
                        <td className="px-4 py-3 text-gray-400">
                          {new Date(doc.submittedAt).toLocaleDateString('tr-TR')}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex space-x-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedDocument(doc);
                                setReviewDialogOpen(true);
                              }}
                              className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            {doc.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedDocument(doc);
                                    setReviewAction('approve');
                                    setReviewDialogOpen(true);
                                  }}
                                  className="border-green-500/30 text-green-400 hover:bg-green-500/10"
                                >
                                  <Check className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => {
                                    setSelectedDocument(doc);
                                    setReviewAction('reject');
                                    setReviewDialogOpen(true);
                                  }}
                                  className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                {/* Pagination */}
                {kycData.totalPages > 1 && (
                  <div className="flex justify-center mt-6 space-x-2">
                    <Button
                      variant="outline"
                      disabled={filters.page === 1}
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page - 1 }))}
                      className="border-gray-600 text-gray-400"
                    >
                      Önceki
                    </Button>
                    <span className="flex items-center text-gray-400 px-4">
                      {filters.page} / {kycData.totalPages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={filters.page === kycData.totalPages}
                      onClick={() => setFilters(prev => ({ ...prev, page: prev.page + 1 }))}
                      className="border-gray-600 text-gray-400"
                    >
                      Sonraki
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <FileText className="w-12 h-12 mx-auto text-gray-600 mb-4" />
                <div className="text-gray-400">KYC dokümanı bulunamadı</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* KYC İnceleme Dialog */}
        <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white">
                KYC Doküman İncelemesi - {selectedDocument?.username}
              </DialogTitle>
            </DialogHeader>
            
            {selectedDocument && (
              <div className="space-y-6">
                {/* Doküman Bilgileri */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400">Doküman Türü</label>
                    <div className="text-white font-medium">
                      {getDocumentTypeName(selectedDocument.documentType)}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Mevcut Durum</label>
                    <div className="mt-1">{getStatusBadge(selectedDocument.status)}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Gönderilme Tarihi</label>
                    <div className="text-white">
                      {new Date(selectedDocument.submittedAt).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400">Kullanıcı ID</label>
                    <div className="text-white">{selectedDocument.userId}</div>
                  </div>
                </div>

                {/* Doküman Görselleri */}
                <div className="space-y-4">
                  {selectedDocument.frontImageUrl && (
                    <div>
                      <label className="text-sm text-gray-400">Ön Yüz</label>
                      <div className="mt-2 border border-gray-600 rounded-lg overflow-hidden">
                        <img 
                          src={selectedDocument.frontImageUrl} 
                          alt="Doküman ön yüz"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    </div>
                  )}
                  
                  {selectedDocument.backImageUrl && (
                    <div>
                      <label className="text-sm text-gray-400">Arka Yüz</label>
                      <div className="mt-2 border border-gray-600 rounded-lg overflow-hidden">
                        <img 
                          src={selectedDocument.backImageUrl} 
                          alt="Doküman arka yüz"
                          className="w-full h-48 object-cover"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Mevcut Notlar */}
                {selectedDocument.notes && (
                  <div>
                    <label className="text-sm text-gray-400">Mevcut Notlar</label>
                    <div className="mt-1 p-3 bg-gray-700/50 rounded border text-gray-300">
                      {selectedDocument.notes}
                    </div>
                  </div>
                )}

                {/* Red Sebebi */}
                {selectedDocument.rejectionReason && (
                  <div>
                    <label className="text-sm text-gray-400">Red Sebebi</label>
                    <div className="mt-1 p-3 bg-red-500/20 border border-red-500/30 rounded text-red-300">
                      {selectedDocument.rejectionReason}
                    </div>
                  </div>
                )}

                {/* İnceleme Formu */}
                {reviewAction && (
                  <div className="space-y-4 pt-4 border-t border-gray-700">
                    <div className="flex items-center space-x-2">
                      {reviewAction === 'approve' ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400" />
                      )}
                      <span className="text-white font-medium">
                        {reviewAction === 'approve' ? 'Dokümanı Onayla' : 'Dokümanı Reddet'}
                      </span>
                    </div>

                    <div>
                      <label className="text-sm text-gray-400">
                        {reviewAction === 'approve' ? 'Onay Notları (İsteğe bağlı)' : 'Red Sebebi (Zorunlu)'}
                      </label>
                      <Textarea
                        value={reviewNotes}
                        onChange={(e) => setReviewNotes(e.target.value)}
                        placeholder={reviewAction === 'approve' 
                          ? 'Onay ile ilgili notlarınızı yazın...' 
                          : 'Red sebebini detaylı olarak yazın...'
                        }
                        className="mt-1 bg-gray-700/50 border-gray-600 text-white placeholder-gray-400"
                        rows={3}
                      />
                    </div>

                    <div className="flex space-x-3">
                      <Button
                        onClick={handleReview}
                        disabled={reviewMutation.isPending || (reviewAction === 'reject' && !reviewNotes.trim())}
                        className={reviewAction === 'approve' 
                          ? 'bg-green-600 hover:bg-green-700' 
                          : 'bg-red-600 hover:bg-red-700'
                        }
                      >
                        {reviewMutation.isPending ? 'İşleniyor...' : 
                          reviewAction === 'approve' ? 'Onayla' : 'Reddet'
                        }
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setReviewAction(null);
                          setReviewNotes('');
                        }}
                        className="border-gray-600 text-gray-400"
                      >
                        İptal
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}