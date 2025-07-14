import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  User, 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Shield, 
  CheckCircle, 
  XCircle, 
  Clock,
  AlertTriangle,
  Copy,
  ExternalLink,
  Eye,
  TrendingUp,
  Activity
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
  type: 'deposit' | 'withdrawal';
}

export function DetailModal({ isOpen, onClose, data, type }: DetailModalProps) {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  if (!data) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { 
        label: 'Beklemede', 
        color: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        icon: Clock 
      },
      approved: { 
        label: 'Onaylandı', 
        color: 'bg-green-500/20 text-green-300 border-green-500/30',
        icon: CheckCircle 
      },
      rejected: { 
        label: 'Reddedildi', 
        color: 'bg-red-500/20 text-red-300 border-red-500/30',
        icon: XCircle 
      },
      completed: { 
        label: 'Tamamlandı', 
        color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        icon: CheckCircle 
      },
      processing: { 
        label: 'İşleniyor', 
        color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        icon: Activity 
      },
      failed: { 
        label: 'Başarısız', 
        color: 'bg-red-600/20 text-red-300 border-red-600/30',
        icon: XCircle 
      }
    };
    return configs[status as keyof typeof configs] || configs.pending;
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Kopyalandı',
      description: `${label} panoya kopyalandı`,
    });
  };

  const statusConfig = getStatusConfig(data.status);
  const StatusIcon = statusConfig.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-800 border-gray-700 text-white max-w-4xl max-h-[90vh]">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
              <Eye className="h-4 w-4 text-white" />
            </div>
            {type === 'deposit' ? 'Para Yatırma' : 'Para Çekme'} Detayları
            <Badge className={`${statusConfig.color} font-semibold`}>
              <StatusIcon className="h-3 w-3 mr-1" />
              {statusConfig.label}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-full max-h-[70vh]">
          <div className="space-y-6">
            {/* Ana Bilgiler */}
            <Card className="bg-gray-700/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-400" />
                  İşlem Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">İşlem ID</div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-lg font-bold text-blue-300">#{data.id}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(data.id.toString(), 'İşlem ID')}
                        className="h-6 w-6 p-0 hover:bg-gray-600"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Miktar</div>
                    <div className="text-2xl font-bold text-green-400">
                      {formatCurrency(data.amount)}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Para Birimi</div>
                    <div className="text-lg font-semibold text-yellow-400">{data.currency}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">VIP Seviye</div>
                    <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                      VIP {data.vipLevel}
                    </Badge>
                  </div>
                </div>

                {data.transactionId && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">İşlem Referansı</div>
                    <div className="flex items-center gap-2 p-2 bg-gray-600/50 rounded border">
                      <span className="font-mono text-sm">{data.transactionId}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(data.transactionId, 'İşlem Referansı')}
                        className="h-6 w-6 p-0 hover:bg-gray-700"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Kullanıcı Bilgileri */}
            <Card className="bg-gray-700/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <User className="h-5 w-5 text-green-400" />
                  Kullanıcı Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Kullanıcı ID</div>
                    <div className="font-mono text-blue-300">{data.userId}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Kullanıcı Adı</div>
                    <div className="font-semibold text-white">{data.username}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">E-posta</div>
                    <div className="text-gray-300">{data.email}</div>
                  </div>
                </div>

                {(data.firstName || data.lastName) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Ad</div>
                      <div className="text-white">{data.firstName || 'Belirtilmemiş'}</div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Soyad</div>
                      <div className="text-white">{data.lastName || 'Belirtilmemiş'}</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ödeme Bilgileri */}
            <Card className="bg-gray-700/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-400" />
                  Ödeme Detayları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Ödeme Yöntemi</div>
                    <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 text-sm">
                      {data.paymentMethod}
                    </Badge>
                  </div>

                  {data.referenceId && (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Referans ID</div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm text-gray-300">{data.referenceId}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(data.referenceId, 'Referans ID')}
                          className="h-6 w-6 p-0 hover:bg-gray-600"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {data.paymentDetails && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Ödeme Detayları</div>
                    <div className="p-3 bg-gray-600/50 rounded border text-sm text-gray-300">
                      {data.paymentDetails}
                    </div>
                  </div>
                )}

                {(data.balanceBefore !== null || data.balanceAfter !== null) && (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Önceki Bakiye</div>
                      <div className="text-orange-300 font-semibold">
                        {data.balanceBefore ? formatCurrency(data.balanceBefore) : 'Bilinmiyor'}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Sonraki Bakiye</div>
                      <div className="text-green-300 font-semibold">
                        {data.balanceAfter ? formatCurrency(data.balanceAfter) : 'Bilinmiyor'}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tarih ve Durum Bilgileri */}
            <Card className="bg-gray-700/50 border-gray-600">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-indigo-400" />
                  Zaman Çizelgesi
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">Oluşturulma</div>
                    <div className="text-white">
                      {format(new Date(data.createdAt), 'dd MMMM yyyy, HH:mm', {
                        locale: language === 'tr' ? tr : enUS
                      })}
                    </div>
                  </div>

                  {data.processedAt && (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-400 uppercase tracking-wide">İşlenme</div>
                      <div className="text-green-300">
                        {format(new Date(data.processedAt), 'dd MMMM yyyy, HH:mm', {
                          locale: language === 'tr' ? tr : enUS
                        })}
                      </div>
                    </div>
                  )}

                  {data.updatedAt && (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Son Güncelleme</div>
                      <div className="text-blue-300">
                        {format(new Date(data.updatedAt), 'dd MMMM yyyy, HH:mm', {
                          locale: language === 'tr' ? tr : enUS
                        })}
                      </div>
                    </div>
                  )}
                </div>

                {data.reviewedBy && (
                  <div className="space-y-1">
                    <div className="text-xs text-gray-400 uppercase tracking-wide">İnceleyen</div>
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-400" />
                      <span className="text-blue-300 font-semibold">{data.reviewedBy}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Açıklama ve Notlar */}
            {(data.description || data.rejectionReason) && (
              <Card className="bg-gray-700/50 border-gray-600">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-400" />
                    Notlar ve Açıklamalar
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {data.description && (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Açıklama</div>
                      <div className="p-3 bg-gray-600/50 rounded border text-gray-300">
                        {data.description}
                      </div>
                    </div>
                  )}

                  {data.rejectionReason && (
                    <div className="space-y-1">
                      <div className="text-xs text-gray-400 uppercase tracking-wide">Red Nedeni</div>
                      <div className="p-3 bg-red-900/20 border border-red-500/30 rounded text-red-300">
                        {data.rejectionReason}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>

        <Separator className="bg-gray-600" />

        <div className="flex justify-end gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="bg-gray-700 border-gray-600 hover:bg-gray-600"
          >
            Kapat
          </Button>
          <Button
            onClick={() => copyToClipboard(JSON.stringify(data, null, 2), 'Tüm veriler')}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Copy className="h-4 w-4 mr-2" />
            Tümünü Kopyala
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}