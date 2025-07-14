import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Download, FileText, Database, Table, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';

interface ExportData {
  id: number;
  transactionId?: string;
  userId: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  vipLevel: number;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  paymentMethod: string;
  paymentDetails?: string;
  referenceId?: string;
  balanceBefore?: number;
  balanceAfter?: number;
  rejectionReason?: string;
  reviewedBy?: string;
  processedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

interface ExportToolsProps {
  data: ExportData[];
  type: 'deposits' | 'withdrawals';
  summary?: any;
  filters?: any;
}

export function ExportTools({ data, type, summary, filters }: ExportToolsProps) {
  const { t, language: currentLanguage } = useLanguage();
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel' | 'json' | 'pdf'>('csv');
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const { toast } = useToast();

  const typeLabel = type === 'deposits' ? 'Para Yatırma' : 'Para Çekme';

  const exportToCSV = async () => {
    setIsExporting(true);
    setExportProgress(10);

    const headers = [
      'ID', 'İşlem ID', 'Kullanıcı ID', 'Kullanıcı Adı', 'Email', 'Ad', 'Soyad', 'VIP Seviye',
      'Miktar', 'Para Birimi', 'Durum', 'Açıklama', 'Ödeme Yöntemi', 'Ödeme Detayları', 
      'Referans ID', 'Önceki Bakiye', 'Sonraki Bakiye', 'Red Nedeni', 'İnceleyen', 
      'İşlem Tarihi', 'Oluşturma Tarihi', 'Güncelleme Tarihi'
    ];

    setExportProgress(30);

    const csvData = data.map(item => [
      item.id,
      item.transactionId || '',
      item.userId,
      item.username,
      item.email,
      item.firstName || '',
      item.lastName || '',
      item.vipLevel,
      item.amount,
      item.currency,
      item.status,
      item.description || '',
      item.paymentMethod,
      item.paymentDetails || '',
      item.referenceId || '',
      item.balanceBefore || '',
      item.balanceAfter || '',
      item.rejectionReason || '',
      item.reviewedBy || '',
      item.processedAt ? format(new Date(item.processedAt), 'dd.MM.yyyy HH:mm', { locale: currentLanguage === 'tr' ? tr : enUS }) : '',
      format(new Date(item.createdAt), 'dd.MM.yyyy HH:mm', { locale: currentLanguage === 'tr' ? tr : enUS }),
      item.updatedAt ? format(new Date(item.updatedAt), 'dd.MM.yyyy HH:mm', { locale: currentLanguage === 'tr' ? tr : enUS }) : ''
    ]);

    setExportProgress(70);

    const BOM = '\uFEFF';
    const csvContent = BOM + [headers, ...csvData]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    setExportProgress(90);

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${type}-detayli-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.csv`;
    link.click();

    setExportProgress(100);
    
    setTimeout(() => {
      setIsExporting(false);
      setExportProgress(0);
      toast({
        title: 'CSV Dışa Aktarma Tamamlandı',
        description: `${data.length} kayıt başarıyla dışa aktarıldı`,
      });
    }, 500);
  };

  const exportToExcel = async () => {
    setIsExporting(true);
    setExportProgress(10);

    const excelHeaders = [
      `${typeLabel} ID`, 'İşlem Kimliği', 'Kullanıcı ID', 'Kullanıcı Adı', 'E-posta Adresi',
      'Ad', 'Soyad', 'VIP Seviyesi', `${type === 'deposits' ? 'Yatırım' : 'Çekim'} Miktarı`, 'Para Birimi', 'İşlem Durumu',
      'İşlem Açıklaması', 'Ödeme Yöntemi', 'Ödeme Detayları', 'Referans Numarası',
      'İşlem Öncesi Bakiye', 'İşlem Sonrası Bakiye', 'Ret Nedeni', 'İnceleyen Yönetici',
      'İşlem Tarih/Saat', 'Kayıt Oluşturma Tarihi', 'Son Güncelleme Tarihi'
    ];

    setExportProgress(30);

    const excelData = data.map(item => [
      item.id,
      item.transactionId || 'N/A',
      item.userId,
      item.username,
      item.email,
      item.firstName || 'N/A',
      item.lastName || 'N/A',
      `VIP ${item.vipLevel}`,
      `${item.amount} ${item.currency}`,
      item.currency,
      item.status.toUpperCase(),
      item.description || 'Açıklama yok',
      item.paymentMethod,
      item.paymentDetails || 'Detay yok',
      item.referenceId || 'Referans yok',
      item.balanceBefore ? `${item.balanceBefore} ${item.currency}` : 'Bilinmiyor',
      item.balanceAfter ? `${item.balanceAfter} ${item.currency}` : 'Bilinmiyor',
      item.rejectionReason || 'N/A',
      item.reviewedBy || 'Sistem',
      item.processedAt ? format(new Date(item.processedAt), 'dd.MM.yyyy HH:mm:ss', { locale: currentLanguage === 'tr' ? tr : enUS }) : 'İşlenmedi',
      format(new Date(item.createdAt), 'dd.MM.yyyy HH:mm:ss', { locale: currentLanguage === 'tr' ? tr : enUS }),
      item.updatedAt ? format(new Date(item.updatedAt), 'dd.MM.yyyy HH:mm:ss', { locale: currentLanguage === 'tr' ? tr : enUS }) : 'Güncellenmedi'
    ]);

    setExportProgress(70);

    const BOM = '\uFEFF';
    const tsvContent = BOM + [excelHeaders, ...excelData]
      .map(row => row.map(field => `"${String(field).replace(/"/g, '""')}"`).join('\t'))
      .join('\n');

    setExportProgress(90);

    const blob = new Blob([tsvContent], { type: 'text/tab-separated-values;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${type}-excel-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.xls`;
    link.click();

    setExportProgress(100);
    
    setTimeout(() => {
      setIsExporting(false);
      setExportProgress(0);
      toast({
        title: 'Excel Dışa Aktarma Tamamlandı',
        description: `${data.length} kayıt Excel formatında dışa aktarıldı`,
      });
    }, 500);
  };

  const exportToJSON = async () => {
    setIsExporting(true);
    setExportProgress(10);

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        exportType: type,
        totalRecords: data.length,
        exportFormat: 'JSON',
        language: currentLanguage
      },
      filters: filters || {},
      summary: summary || {},
      records: data

    };

    setExportProgress(70);

    const jsonData = JSON.stringify(exportData, null, 2);
    
    setExportProgress(90);

    const blob = new Blob([jsonData], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${type}-kapsamli-${format(new Date(), 'yyyy-MM-dd-HH-mm')}.json`;
    link.click();

    setExportProgress(100);
    
    setTimeout(() => {
      setIsExporting(false);
      setExportProgress(0);
      toast({
        title: 'JSON Dışa Aktarma Tamamlandı',
        description: 'Kapsamlı veri seti başarıyla dışa aktarıldı',
      });
    }, 500);
  };

  const handleExport = async () => {
    switch (exportFormat) {
      case 'csv':
        await exportToCSV();
        break;
      case 'excel':
        await exportToExcel();
        break;
      case 'json':
        await exportToJSON();
        break;
      default:
        toast({
          title: 'Desteklenmeyen Format',
          description: 'Seçilen format henüz desteklenmiyor',
          variant: 'destructive'
        });
    }
  };

  const formatOptions = [
    { value: 'csv', label: 'CSV (Comma Separated)', icon: FileText, description: 'Excel ve diğer programlarla uyumlu' },
    { value: 'excel', label: 'Excel (XLS)', icon: Table, description: 'Microsoft Excel için optimize edilmiş' },
    { value: 'json', label: 'JSON (Veri Yapısı)', icon: Database, description: 'Geliştirici dostu format' }
  ];

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <Download className="h-5 w-5" />
          Veri Dışa Aktarma
          <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
            {data.length} kayıt
          </Badge>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Format Seçimi */}
        <div className="space-y-2">
          <label className="text-white text-sm font-medium">Dışa Aktarma Formatı</label>
          <Select value={exportFormat} onValueChange={(value: any) => setExportFormat(value)}>
            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-600">
              {formatOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <SelectItem key={option.value} value={option.value} className="text-white">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-gray-400">{option.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Dışa Aktarma İlerlemesi */}
        {isExporting && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-white">Dışa aktarılıyor...</span>
              <span className="text-gray-400">{exportProgress}%</span>
            </div>
            <Progress value={exportProgress} className="h-2" />
          </div>
        )}

        {/* Özet Bilgiler */}
        <div className="grid grid-cols-2 gap-4 p-3 bg-gray-700/50 rounded-lg">
          <div className="text-center">
            <div className="text-lg font-bold text-white">{data.length}</div>
            <div className="text-xs text-gray-400">Toplam Kayıt</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">
              {summary?.totalAmount ? `₺${summary.totalAmount.toLocaleString()}` : 'N/A'}
            </div>
            <div className="text-xs text-gray-400">Toplam Miktar</div>
          </div>
        </div>

        {/* Dışa Aktarma Butonu */}
        <Button 
          onClick={handleExport} 
          disabled={isExporting || data.length === 0}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          {isExporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Dışa Aktarılıyor...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              {formatOptions.find(f => f.value === exportFormat)?.label} Olarak İndir
            </>
          )}
        </Button>

        {/* Bilgi Notları */}
        <div className="space-y-2 text-xs text-gray-400">
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>UTF-8 karakter kodlaması desteklenir</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Türkçe karakterler korunur</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-3 w-3 text-green-500" />
            <span>Tüm filtreler uygulanır</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}