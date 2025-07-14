import React, { useState } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from '@/components/ui/form';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  AlertCircle, 
  Bell, 
  BellOff, 
  Calendar, 
  CheckCircle2, 
  Delete, 
  Eye, 
  Filter, 
  Info, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Send, 
  Trash2, 
  Users, 
  X,
  MessageSquare,
  CheckCheck,
  Clock,
  Megaphone
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useWebSocket } from '@/contexts/WebSocketContext';

// Bildirim veri tipleri
type NotificationType = 'info' | 'success' | 'warning' | 'error';
type NotificationTarget = 'all' | 'active' | 'vip' | 'new' | 'specific';

interface Notification {
  id: number;
  title: string;
  content: string;
  type: NotificationType;
  target: NotificationTarget;
  targetUsers?: number[];
  sentBy: string;
  sentAt: string;
  readCount: number;
  totalRecipients: number;
  status: 'active' | 'expired' | 'scheduled';
  expiresAt?: string;
  scheduledAt?: string;
}

// Form şeması
const notificationFormSchema = z.object({
  title: z.string().min(2, {
    message: "Başlık en az 2 karakter olmalıdır.",
  }).max(100, {
    message: "Başlık en fazla 100 karakter olabilir."
  }),
  content: z.string().min(5, {
    message: "İçerik en az 5 karakter olmalıdır.",
  }).max(1000, {
    message: "İçerik en fazla 1000 karakter olabilir."
  }),
  type: z.enum(['info', 'success', 'warning', 'error'], {
    required_error: "Bildirim türünü seçiniz.",
  }),
  target: z.enum(['all', 'active', 'vip', 'new', 'specific'], {
    required_error: "Hedef kitleyi seçiniz.",
  }),
  specificUsers: z.string().optional(),
  schedule: z.boolean().default(false),
  scheduledAt: z.string().optional(),
  expiresAt: z.string().optional()
});

type NotificationFormValues = z.infer<typeof notificationFormSchema>;

// Mock bildirim verileri
const mockNotifications: Notification[] = [
  {
    id: 1,
    title: "Hoş Geldin Bonusu",
    content: "Hoş geldin! 1000 TL'ye kadar %100 ilk yatırım bonusu hesabınıza tanımlandı.",
    type: "success",
    target: "new",
    sentBy: "admin",
    sentAt: "2023-05-19T10:25:00Z",
    readCount: 145,
    totalRecipients: 200,
    status: "active",
    expiresAt: "2023-06-19T10:25:00Z"
  },
  {
    id: 2,
    title: "Bakım Duyurusu",
    content: "Sistem bakımı nedeniyle 22:00-23:00 saatleri arasında kısa süreli kesintiler yaşanabilir.",
    type: "info",
    target: "all",
    sentBy: "admin",
    sentAt: "2023-05-20T14:00:00Z",
    readCount: 1243,
    totalRecipients: 5000,
    status: "active",
    expiresAt: "2023-05-23T00:00:00Z"
  },
  {
    id: 3,
    title: "VIP Kullanıcı Özel Teklifi",
    content: "Değerli VIP üyemiz, size özel %50 ekstra bonus fırsatı sizi bekliyor!",
    type: "info",
    target: "vip",
    sentBy: "system",
    sentAt: "2023-05-18T09:00:00Z",
    readCount: 78,
    totalRecipients: 120,
    status: "active",
    expiresAt: "2023-05-25T09:00:00Z"
  },
  {
    id: 4,
    title: "Hesap Güvenliği Uyarısı",
    content: "Farklı bir lokasyondan hesabınıza giriş denemesi tespit edildi. Güvenlik ayarlarınızı kontrol ediniz.",
    type: "warning",
    target: "specific",
    targetUsers: [102, 105, 110],
    sentBy: "system",
    sentAt: "2023-05-20T11:30:00Z",
    readCount: 2,
    totalRecipients: 3,
    status: "active"
  },
  {
    id: 5,
    title: "Ödeme Hatası",
    content: "Yatırım işleminiz sırasında bir hata oluştu. Lütfen farklı bir ödeme yöntemi deneyiniz.",
    type: "error",
    target: "specific",
    targetUsers: [108],
    sentBy: "system",
    sentAt: "2023-05-20T12:45:00Z",
    readCount: 1,
    totalRecipients: 1,
    status: "expired",
    expiresAt: "2023-05-21T12:45:00Z"
  },
  {
    id: 6,
    title: "Yeni Oyunlar Eklendi",
    content: "Popüler oyun sağlayıcılarından 15 yeni oyun platformumuza eklendi. Hemen deneyin!",
    type: "info",
    target: "all",
    sentBy: "admin",
    sentAt: "2023-05-21T09:00:00Z",
    readCount: 897,
    totalRecipients: 5000,
    status: "active",
    expiresAt: "2023-05-28T09:00:00Z"
  },
  {
    id: 7,
    title: "Hafta Sonu Bonusu",
    content: "Bu hafta sonu yatırımlarınıza %25 ekstra bonus! Fırsatı kaçırmayın.",
    type: "success",
    target: "active",
    sentBy: "admin",
    sentAt: "2023-05-22T00:00:00Z",
    readCount: 0,
    totalRecipients: 3500,
    status: "scheduled",
    scheduledAt: "2023-05-27T00:00:00Z",
    expiresAt: "2023-05-29T00:00:00Z"
  }
];

const NotificationsPage = () => {
  const { toast } = useToast();
  const { status: wsStatus } = useWebSocket();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [openNotificationDialog, setOpenNotificationDialog] = useState(false);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState<NotificationFormValues | null>(null);
  const [activeTab, setActiveTab] = useState<string>("all");
  
  // Form tanımı
  const form = useForm<NotificationFormValues>({
    resolver: zodResolver(notificationFormSchema),
    defaultValues: {
      title: "",
      content: "",
      type: "info",
      target: "all",
      specificUsers: "",
      schedule: false,
      scheduledAt: "",
      expiresAt: ""
    },
  });
  
  // Form değişikliğini dinle
  const watchFields = form.watch();
  
  // Bildirim listesini getir
  const { data: notifications = mockNotifications, isLoading, isError } = useQuery({
    queryKey: ['notifications', statusFilter, typeFilter],
    queryFn: async () => {
      // Gerçek API çağrısı
      // const response = await apiRequest('GET', `/api/admin/notifications?status=${statusFilter}&type=${typeFilter}`);
      // return response.json();
      
      // Şimdilik mock veri dönüyoruz ve filtreliyoruz
      let filteredData = [...mockNotifications];
      
      // Durum filtresi uygula
      if (statusFilter !== 'all') {
        filteredData = filteredData.filter(n => n.status === statusFilter);
      }
      
      // Tip filtresi uygula
      if (typeFilter !== 'all') {
        filteredData = filteredData.filter(n => n.type === typeFilter);
      }
      
      // Tab filtresi uygula
      if (activeTab === 'scheduled') {
        filteredData = filteredData.filter(n => n.status === 'scheduled');
      } else if (activeTab === 'active') {
        filteredData = filteredData.filter(n => n.status === 'active');
      } else if (activeTab === 'expired') {
        filteredData = filteredData.filter(n => n.status === 'expired');
      }
      
      return filteredData;
    },
  });

  // Arama filtrelemesi
  const filteredNotifications = notifications.filter(
    (notification) =>
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.sentBy.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Bildirim türüne göre renk ve ikon belirleme
  const getNotificationTypeStyles = (type: NotificationType) => {
    switch (type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="h-4 w-4" />,
          badgeClass: "bg-green-500/20 text-green-500 hover:bg-green-500/30 gap-1",
          label: "Başarı"
        };
      case 'warning':
        return {
          icon: <AlertCircle className="h-4 w-4" />,
          badgeClass: "bg-orange-500/20 text-orange-500 hover:bg-orange-500/30 gap-1",
          label: "Uyarı"
        };
      case 'error':
        return {
          icon: <X className="h-4 w-4" />,
          badgeClass: "bg-red-500/20 text-red-500 hover:bg-red-500/30 gap-1",
          label: "Hata"
        };
      case 'info':
      default:
        return {
          icon: <Info className="h-4 w-4" />,
          badgeClass: "bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 gap-1",
          label: "Bilgi"
        };
    }
  };

  // Hedef kitleye göre rozet ve etiket
  const getTargetBadge = (target: NotificationTarget, totalRecipients: number) => {
    const targetMap: Record<NotificationTarget, string> = {
      all: 'Tüm Kullanıcılar',
      active: 'Aktif Kullanıcılar',
      vip: 'VIP Kullanıcılar',
      new: 'Yeni Kullanıcılar',
      specific: 'Belirli Kullanıcılar'
    };
    
    return (
      <div className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        <span>{targetMap[target]}</span>
        <span className="text-xs text-gray-400">({totalRecipients})</span>
      </div>
    );
  };

  // Duruma göre renk ve ikon
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 gap-1"><CheckCheck size={12} /> Aktif</Badge>;
      case 'scheduled':
        return <Badge className="bg-blue-500/20 text-blue-500 hover:bg-blue-500/30 gap-1"><Clock size={12} /> Planlandı</Badge>;
      case 'expired':
        return <Badge className="bg-gray-500/20 text-gray-400 hover:bg-gray-500/30 gap-1"><BellOff size={12} /> Süresi Doldu</Badge>;
      default:
        return <Badge variant="outline">Bilinmiyor</Badge>;
    }
  };

  // Form önizleme modu
  const handlePreview = () => {
    const formData = form.getValues();
    setPreviewData(formData);
    setIsPreviewMode(true);
  };

  // Form gönderimi
  const onSubmit = async (data: NotificationFormValues) => {
    try {
      // API çağrısı burada yapılacak
      // const response = await apiRequest('POST', '/api/admin/notifications', data);
      
      // Eğer WebSocket kullanarak anında gönderim yapmak istersek
      if (!data.schedule) {
        // Gerçek uygulamada burada WebSocket kullanarak bildirim gönderme işlemi yapacağız
        // Şu anda bu özellik geliştiriliyor
        
        // Örnek WebSocket mesaj formatı
        const notificationMessage = {
          type: 'admin_notification',
          data: {
            title: data.title,
            message: data.content,
            notificationType: data.type,
            target: data.target,
            timestamp: new Date().toISOString()
          }
        };
        
        console.log('Gönderilecek bildirim:', notificationMessage);
      }
      
      toast({
        title: data.schedule ? "Bildirim Planlandı" : "Bildirim Gönderildi",
        description: data.schedule 
          ? `"${data.title}" bildirimi belirtilen tarihte gönderilecek.` 
          : `"${data.title}" bildirimi başarıyla gönderildi.`,
      });
      
      // Dialog kapat ve formu sıfırla
      setOpenNotificationDialog(false);
      setIsPreviewMode(false);
      form.reset();
      
      // Listeyi yeniden yükle
      // queryClient.invalidateQueries(['notifications']);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Bildirim gönderme işlemi sırasında bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // Bildirim silme
  const handleDeleteNotification = async (id: number, title: string) => {
    const confirmed = window.confirm(`"${title}" bildirimini silmek istediğinizden emin misiniz?`);
    
    if (confirmed) {
      try {
        // await apiRequest('DELETE', `/api/admin/notifications/${id}`);
        toast({
          title: "Bildirim Silindi",
          description: `"${title}" bildirimi başarıyla silindi.`,
        });
        
        // Listeyi yeniden yükle
        // queryClient.invalidateQueries(['notifications']);
      } catch (error) {
        toast({
          title: "Hata",
          description: "Silme işlemi sırasında bir hata oluştu.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <AdminLayout title="Bildirim Yönetimi">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Bildirim Yönetimi</h1>
            <p className="text-gray-400 mt-1">
              Kullanıcılara bildirim gönder ve bildirimleri yönet.
            </p>
          </div>
          <Button onClick={() => setOpenNotificationDialog(true)} variant="yellow" className="gap-2">
            <Bell size={16} />
            <span>Yeni Bildirim</span>
          </Button>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-gray-200 flex items-center gap-2">
                <Bell className="h-5 w-5 text-yellow-500" />
                Toplam Bildirim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{notifications.length}</div>
              <div className="text-sm text-gray-400 mt-1">
                Tüm bildirimler
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-gray-200 flex items-center gap-2">
                <CheckCheck className="h-5 w-5 text-green-500" />
                Aktif Bildirim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {notifications.filter(n => n.status === 'active').length}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Aktif bildirimler
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-gray-200 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-500" />
                Planlı Bildirim
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {notifications.filter(n => n.status === 'scheduled').length}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Planlı bildirimler
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-gray-200 flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                Alıcı Sayısı
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {notifications.reduce((total, n) => total + n.totalRecipients, 0)}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Toplam alıcı sayısı
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs ve Filtreleme */}
        <div className="space-y-4">
          <Tabs 
            defaultValue="all" 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value)}
            className="w-full"
          >
            <TabsList className="bg-gray-800/50 border border-gray-700 p-1">
              <TabsTrigger 
                value="all" 
                className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white"
              >
                Tümü
              </TabsTrigger>
              <TabsTrigger 
                value="active"
                className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white"
              >
                Aktif
              </TabsTrigger>
              <TabsTrigger 
                value="scheduled"
                className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white"
              >
                Planlı
              </TabsTrigger>
              <TabsTrigger 
                value="expired"
                className="data-[state=active]:bg-yellow-600 data-[state=active]:text-white"
              >
                Süresi Dolmuş
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-0">
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex items-center space-x-2 bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex-1">
                  <Search className="h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Başlık veya içerik ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
                
                <div className="flex gap-2">
                  <Select
                    value={typeFilter}
                    onValueChange={setTypeFilter}
                  >
                    <SelectTrigger className="w-[160px] bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Bildirim Türü" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700 text-white">
                      <SelectItem value="all">Tüm Türler</SelectItem>
                      <SelectItem value="info">Bilgi</SelectItem>
                      <SelectItem value="success">Başarı</SelectItem>
                      <SelectItem value="warning">Uyarı</SelectItem>
                      <SelectItem value="error">Hata</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="active" className="mt-0">
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex items-center space-x-2 bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex-1">
                  <Search className="h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Başlık veya içerik ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="scheduled" className="mt-0">
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex items-center space-x-2 bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex-1">
                  <Search className="h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Başlık veya içerik ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="expired" className="mt-0">
              <div className="flex flex-col sm:flex-row gap-4 mt-4">
                <div className="flex items-center space-x-2 bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex-1">
                  <Search className="h-5 w-5 text-gray-400" />
                  <Input
                    placeholder="Başlık veya içerik ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Bildirim Tablosu */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-white">Bildirim Listesi</CardTitle>
            <CardDescription className="text-gray-400">
              {filteredNotifications.length} bildirim listeleniyor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="text-gray-200">
              <TableHeader className="bg-gray-900/50">
                <TableRow>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead>Bildirim</TableHead>
                  <TableHead>Tür</TableHead>
                  <TableHead>Hedef</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Okunma Oranı</TableHead>
                  <TableHead className="text-right">İşlemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10">
                      <div className="flex justify-center">
                        <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full"></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : isError ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-red-500">
                      Veriler yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.
                    </TableCell>
                  </TableRow>
                ) : filteredNotifications.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-gray-400">
                      Arama kriterlerinize uygun bildirim bulunamadı.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredNotifications.map((notification) => {
                    const typeStyle = getNotificationTypeStyles(notification.type);
                    return (
                      <TableRow key={notification.id} className="hover:bg-gray-700/50">
                        <TableCell className="font-medium">{notification.id}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium">{notification.title}</span>
                            <span className="text-xs text-gray-400 truncate max-w-[250px]">
                              {notification.content}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={typeStyle.badgeClass}>
                            {typeStyle.icon}
                            <span>{typeStyle.label}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {getTargetBadge(notification.target, notification.totalRecipients)}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(notification.status)}
                        </TableCell>
                        <TableCell className="text-gray-400 text-sm">
                          {notification.status === 'scheduled' 
                            ? new Date(notification.scheduledAt!).toLocaleString('tr-TR')
                            : new Date(notification.sentAt).toLocaleString('tr-TR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-700 rounded-full h-2">
                              <div 
                                className="bg-yellow-500 h-2 rounded-full" 
                                style={{ width: `${(notification.readCount / notification.totalRecipients) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-xs text-gray-400">
                              {notification.readCount}/{notification.totalRecipients}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Menü</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700 text-gray-200">
                              <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                              <DropdownMenuSeparator className="bg-gray-700" />
                              <DropdownMenuItem 
                                className="hover:bg-gray-700 cursor-pointer"
                              >
                                <Eye className="h-4 w-4 mr-2" /> Detaylar
                              </DropdownMenuItem>
                              {notification.status === 'scheduled' && (
                                <DropdownMenuItem 
                                  className="hover:bg-gray-700 cursor-pointer"
                                >
                                  <Send className="h-4 w-4 mr-2" /> Şimdi Gönder
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem 
                                className="hover:bg-gray-700 cursor-pointer text-red-500 hover:text-red-400"
                                onClick={() => handleDeleteNotification(notification.id, notification.title)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" /> Sil
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Bildirim Ekleme Modalı */}
      <Dialog open={openNotificationDialog} onOpenChange={setOpenNotificationDialog}>
        <DialogContent className="bg-gray-800 text-gray-100 border-gray-700 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              {isPreviewMode ? (
                <>
                  <Eye className="h-5 w-5 text-yellow-500" />
                  Bildirim Önizleme
                </>
              ) : (
                <>
                  <Bell className="h-5 w-5 text-yellow-500" />
                  Yeni Bildirim Oluştur
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {isPreviewMode 
                ? 'Bildirim bu şekilde kullanıcılara gönderilecektir.' 
                : 'Kullanıcılara gönderilecek bildirim detaylarını girin.'}
            </DialogDescription>
          </DialogHeader>

          {isPreviewMode && previewData ? (
            <div className="space-y-4">
              <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  {getNotificationTypeStyles(previewData.type as NotificationType).icon}
                  <span className="font-semibold">{previewData.title}</span>
                </div>
                <p className="text-gray-300 text-sm">{previewData.content}</p>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-700 text-xs text-gray-400">
                  <div>
                    <span>Hedef: </span>
                    <span className="text-yellow-500">{
                      previewData.target === 'all' ? 'Tüm Kullanıcılar' :
                      previewData.target === 'active' ? 'Aktif Kullanıcılar' :
                      previewData.target === 'vip' ? 'VIP Kullanıcılar' :
                      previewData.target === 'new' ? 'Yeni Kullanıcılar' :
                      'Belirli Kullanıcılar'
                    }</span>
                  </div>
                  <div>{new Date().toLocaleString('tr-TR')}</div>
                </div>
              </div>

              <div className="bg-yellow-900/20 border border-yellow-800 p-4 rounded-md flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-yellow-500">WebSocket Durum Bilgisi</h4>
                  <p className="text-sm text-gray-300">
                    {wsStatus === 'connected' 
                      ? 'WebSocket bağlantısı aktif. Bildirim anında kullanıcılara iletilecektir.' 
                      : 'WebSocket bağlantısı şu anda aktif değil. Bildirim yalnızca API üzerinden gönderilebilir.'}
                  </p>
                </div>
              </div>

              <DialogFooter className="pt-4 space-x-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setIsPreviewMode(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  Düzenle
                </Button>
                <Button 
                  type="button" 
                  variant="yellow"
                  onClick={() => form.handleSubmit(onSubmit)()}
                  className="gap-2"
                >
                  <Megaphone className="h-4 w-4" />
                  {watchFields.schedule ? 'Planla' : 'Gönder'}
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bildirim Başlığı</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Bildirim başlığı" 
                          {...field} 
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bildirim İçeriği</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Bildirim içeriği" 
                          {...field} 
                          className="bg-gray-700 border-gray-600 text-white resize-none"
                          rows={4}
                        />
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bildirim Türü</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Tür seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            <SelectItem value="info">Bilgi</SelectItem>
                            <SelectItem value="success">Başarı</SelectItem>
                            <SelectItem value="warning">Uyarı</SelectItem>
                            <SelectItem value="error">Hata</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="target"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Hedef Kitle</FormLabel>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                        >
                          <FormControl>
                            <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                              <SelectValue placeholder="Hedef seçin" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 border-gray-700 text-white">
                            <SelectItem value="all">Tüm Kullanıcılar</SelectItem>
                            <SelectItem value="active">Aktif Kullanıcılar</SelectItem>
                            <SelectItem value="vip">VIP Kullanıcılar</SelectItem>
                            <SelectItem value="new">Yeni Kullanıcılar</SelectItem>
                            <SelectItem value="specific">Belirli Kullanıcılar</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>

                {watchFields.target === 'specific' && (
                  <FormField
                    control={form.control}
                    name="specificUsers"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kullanıcı ID'leri</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Kullanıcı ID'lerini virgülle ayırarak yazın (örn: 102,105,110)" 
                            {...field} 
                            className="bg-gray-700 border-gray-600 text-white"
                          />
                        </FormControl>
                        <FormDescription className="text-gray-400 text-xs">
                          Belirli kullanıcılara bildirim göndermek için kullanıcı ID'lerini virgülle ayırarak girin.
                        </FormDescription>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="schedule"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border border-gray-700 p-4">
                      <FormControl>
                        <Switch 
                          checked={field.value} 
                          onCheckedChange={field.onChange}
                          className="data-[state=checked]:bg-yellow-500"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Bildirimi Planla</FormLabel>
                        <FormDescription className="text-gray-400">
                          Etkinleştirirseniz, bildirim belirtilen tarih ve saatte gönderilir.
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                {watchFields.schedule && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="scheduledAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Planlanan Tarih</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local" 
                              {...field} 
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expiresAt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Son Geçerlilik Tarihi</FormLabel>
                          <FormControl>
                            <Input 
                              type="datetime-local" 
                              {...field} 
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-400 text-xs">
                            İsteğe bağlı. Bildirimin otomatik olarak sona ereceği tarih.
                          </FormDescription>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <DialogFooter className="pt-4">
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setOpenNotificationDialog(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                  >
                    İptal
                  </Button>
                  <Button 
                    type="button" 
                    variant="secondary"
                    onClick={handlePreview}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Önizle
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default NotificationsPage;