import React, { useState } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from '@tanstack/react-query';
import AdminLayout from '@/components/admin/AdminLayout';
import { useAdminLanguage } from '@/contexts/UserContext';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
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
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Edit, MoreHorizontal, Plus, Search, Trash2, UserCheck, UserMinus, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Personel Veri Tipi
type Staff = {
  id: number;
  username: string;
  fullName: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  lastLoginAt: string;
  createdAt: string;
};

// Formül Şeması
const staffFormSchema = z.object({
  username: z.string().min(3, {
    message: "Kullanıcı adı en az 3 karakter olmalıdır.",
  }),
  fullName: z.string().min(2, {
    message: "Ad ve soyad en az 2 karakter olmalıdır.",
  }),
  email: z.string().email({
    message: "Geçerli bir e-posta adresi giriniz.",
  }),
  password: z.string().min(6, {
    message: "Şifre en az 6 karakter olmalıdır.",
  }),
  role: z.string({
    required_error: "Lütfen bir rol seçin.",
  }),
  status: z.enum(['active', 'inactive', 'suspended'], {
    required_error: "Lütfen bir durum seçin.",
  }),
});

type StaffFormValues = z.infer<typeof staffFormSchema>;

// Örnek personel verileri
const mockStaffData: Staff[] = [
  {
    id: 1,
    username: "admin",
    fullName: "Admin Kullanıcı",
    email: "admin@cryptonbets.com",
    role: "Yönetici",
    status: "active",
    lastLoginAt: "2023-05-20T14:30:00Z",
    createdAt: "2023-01-01T10:00:00Z",
  },
  {
    id: 2,
    username: "finance_manager",
    fullName: "Finans Yöneticisi",
    email: "finance@cryptonbets.com",
    role: "Finans Yöneticisi",
    status: "active",
    lastLoginAt: "2023-05-19T09:15:00Z",
    createdAt: "2023-01-05T11:20:00Z",
  },
  {
    id: 3,
    username: "support_agent",
    fullName: "Destek Personeli",
    email: "support@cryptonbets.com",
    role: "Destek",
    status: "active",
    lastLoginAt: "2023-05-20T10:45:00Z",
    createdAt: "2023-02-15T13:00:00Z",
  },
  {
    id: 4,
    username: "moderator",
    fullName: "İçerik Moderatörü",
    email: "moderator@cryptonbets.com",
    role: "Moderatör",
    status: "inactive",
    lastLoginAt: "2023-05-10T16:20:00Z",
    createdAt: "2023-03-10T09:30:00Z",
  },
  {
    id: 5,
    username: "analyst",
    fullName: "Veri Analisti",
    email: "analyst@cryptonbets.com",
    role: "Analist",
    status: "suspended",
    lastLoginAt: "2023-04-25T11:35:00Z",
    createdAt: "2023-04-01T08:45:00Z",
  }
];

const StaffPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [openStaffDialog, setOpenStaffDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);

  // Form tanımı
  const form = useForm<StaffFormValues>({
    resolver: zodResolver(staffFormSchema),
    defaultValues: {
      username: "",
      fullName: "",
      email: "",
      password: "",
      role: "",
      status: "active",
    },
  });

  // Personel listesini getir
  const { data: staffList = mockStaffData, isLoading, isError } = useQuery({
    queryKey: ['staff'],
    queryFn: async () => {
      // Gerçek API çağrısı buraya gelecek
      // const response = await apiRequest('GET', '/api/admin/staff');
      // return response.json();
      
      // Şu an için mock veri dönüyoruz
      return mockStaffData;
    },
  });

  // Arama fonksiyonu
  const filteredStaff = staffList.filter(
    (staff) =>
      staff.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Personel durumuna göre renk belirleme
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="success">Aktif</Badge>;
      case 'inactive':
        return <Badge variant="secondary">Pasif</Badge>;
      case 'suspended':
        return <Badge variant="destructive">Askıya Alındı</Badge>;
      default:
        return <Badge variant="outline">Bilinmiyor</Badge>;
    }
  };

  // Personel ekleme/düzenleme formu gönderimi
  const onSubmit = async (data: StaffFormValues) => {
    try {
      if (isEditMode && selectedStaff) {
        // Personel güncelleme
        // await apiRequest('PATCH', `/api/admin/staff/${selectedStaff.id}`, data);
        toast({
          title: "Personel güncellendi",
          description: `${data.fullName} adlı personel güncellendi.`,
        });
      } else {
        // Yeni personel ekleme
        // await apiRequest('POST', '/api/admin/staff', data);
        toast({
          title: "Personel eklendi",
          description: `${data.fullName} adlı personel eklendi.`,
        });
      }
      
      // Modal kapat ve formu sıfırla
      setOpenStaffDialog(false);
      form.reset();
      
      // Mevcut veriyi yeniden yükle
      // queryClient.invalidateQueries(['staff']);
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // Personel düzenleme modalını açma
  const handleEditStaff = (staff: Staff) => {
    setIsEditMode(true);
    setSelectedStaff(staff);
    
    form.reset({
      username: staff.username,
      fullName: staff.fullName,
      email: staff.email,
      password: "", // Mevcut şifreyi doldurmuyoruz
      role: staff.role,
      status: staff.status,
    });
    
    setOpenStaffDialog(true);
  };

  // Yeni personel ekleme modalını açma
  const handleAddStaff = () => {
    setIsEditMode(false);
    setSelectedStaff(null);
    form.reset({
      username: "",
      fullName: "",
      email: "",
      password: "",
      role: "",
      status: "active",
    });
    setOpenStaffDialog(true);
  };

  // Personel silme
  const handleDeleteStaff = async (staffId: number) => {
    try {
      // await apiRequest('DELETE', `/api/admin/staff/${staffId}`);
      toast({
        title: "Personel silindi",
        description: "Personel başarıyla silindi.",
      });
      
      // Mevcut veriyi yeniden yükle
      // queryClient.invalidateQueries(['staff']);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Silme işlemi sırasında bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // Personel durumunu değiştirme
  const handleChangeStatus = async (staffId: number, newStatus: 'active' | 'inactive' | 'suspended') => {
    try {
      // await apiRequest('PATCH', `/api/admin/staff/${staffId}/status`, { status: newStatus });
      toast({
        title: "Durum güncellendi",
        description: `Personel durumu "${newStatus}" olarak güncellendi.`,
      });
      
      // Mevcut veriyi yeniden yükle
      // queryClient.invalidateQueries(['staff']);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Durum güncelleme sırasında bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  return (
    <AdminLayout title="Personel Yönetimi">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Personel Yönetimi</h1>
            <p className="text-gray-400 mt-1">
              Sistem personellerini yönet, yetkilendirme ve izleme işlemlerini gerçekleştir.
            </p>
          </div>
          <Button onClick={handleAddStaff} variant="yellow" className="gap-2">
            <UserPlus size={16} />
            <span>Personel Ekle</span>
          </Button>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-gray-200">Toplam Personel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-500">{staffList.length}</div>
              <p className="text-gray-400 text-sm">Sistemde kayıtlı personel</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-gray-200">Aktif Personel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">
                {staffList.filter(s => s.status === 'active').length}
              </div>
              <p className="text-gray-400 text-sm">Aktif çalışan personel</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-gray-200">Pasif Personel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-500">
                {staffList.filter(s => s.status === 'inactive').length}
              </div>
              <p className="text-gray-400 text-sm">Pasif durumdaki personel</p>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-gray-200">Askıya Alınmış</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">
                {staffList.filter(s => s.status === 'suspended').length}
              </div>
              <p className="text-gray-400 text-sm">Geçici olarak askıya alınmış personel</p>
            </CardContent>
          </Card>
        </div>

        {/* Arama ve Filtre */}
        <div className="flex items-center space-x-2 bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <Search className="h-5 w-5 text-gray-400" />
          <Input
            placeholder="Personel adı, e-posta veya rol ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-gray-800 border-gray-700 text-white"
          />
        </div>

        {/* Personel Tablosu */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-white">Personel Listesi</CardTitle>
            <CardDescription className="text-gray-400">
              {filteredStaff.length} personel listeleniyor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="text-gray-200">
              <TableHeader className="bg-gray-900/50">
                <TableRow>
                  <TableHead className="w-[50px]">ID</TableHead>
                  <TableHead>Kullanıcı Adı</TableHead>
                  <TableHead>Ad Soyad</TableHead>
                  <TableHead>E-posta</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Son Giriş</TableHead>
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
                ) : filteredStaff.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-gray-400">
                      Arama kriterlerinize uygun personel bulunamadı.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredStaff.map((staff) => (
                    <TableRow key={staff.id} className="hover:bg-gray-700/50">
                      <TableCell className="font-medium">{staff.id}</TableCell>
                      <TableCell>{staff.username}</TableCell>
                      <TableCell>{staff.fullName}</TableCell>
                      <TableCell>{staff.email}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-700 text-yellow-500 border-yellow-500/30">
                          {staff.role}
                        </Badge>
                      </TableCell>
                      <TableCell>{getStatusBadge(staff.status)}</TableCell>
                      <TableCell className="text-gray-400 text-sm">
                        {new Date(staff.lastLoginAt).toLocaleString('tr-TR')}
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
                              onClick={() => handleEditStaff(staff)}
                            >
                              <Edit className="h-4 w-4 mr-2" /> Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="hover:bg-gray-700 cursor-pointer"
                              onClick={() => handleDeleteStaff(staff.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Sil
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-gray-700" />
                            <DropdownMenuLabel className="text-xs text-gray-400">Durum Değiştir</DropdownMenuLabel>
                            <DropdownMenuItem 
                              className="hover:bg-gray-700 cursor-pointer"
                              onClick={() => handleChangeStatus(staff.id, 'active')}
                              disabled={staff.status === 'active'}
                            >
                              <UserCheck className="h-4 w-4 mr-2 text-green-500" /> Aktif Yap
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="hover:bg-gray-700 cursor-pointer"
                              onClick={() => handleChangeStatus(staff.id, 'inactive')}
                              disabled={staff.status === 'inactive'}
                            >
                              <UserMinus className="h-4 w-4 mr-2 text-gray-500" /> Pasif Yap
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="hover:bg-gray-700 cursor-pointer"
                              onClick={() => handleChangeStatus(staff.id, 'suspended')}
                              disabled={staff.status === 'suspended'}
                            >
                              <UserMinus className="h-4 w-4 mr-2 text-red-500" /> Askıya Al
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Personel Ekleme/Düzenleme Modal */}
      <Dialog open={openStaffDialog} onOpenChange={setOpenStaffDialog}>
        <DialogContent className="bg-gray-800 text-gray-100 border-gray-700 max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="h-5 w-5 text-yellow-500" />
              {isEditMode ? 'Personel Düzenle' : 'Yeni Personel Ekle'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {isEditMode 
                ? 'Personel bilgilerini güncelleyerek değişiklikleri kaydedin.' 
                : 'Sisteme yeni bir personel eklemek için aşağıdaki formu doldurun.'}
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Kullanıcı Adı</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="kullanici_adi" 
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
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ad Soyad</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Ad Soyad" 
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
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>E-posta</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="ornek@cryptonbets.com" 
                          type="email" 
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
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        Şifre {isEditMode && <span className="text-gray-400 text-xs">(Değişmeyecekse boş bırakın)</span>}
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder={isEditMode ? "••••••••" : "Şifre giriniz"} 
                          type="password" 
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
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Rol</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange} 
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Rol seçin" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600 text-white">
                            <SelectItem value="Yönetici">Yönetici</SelectItem>
                            <SelectItem value="Finans Yöneticisi">Finans Yöneticisi</SelectItem>
                            <SelectItem value="Destek">Destek Personeli</SelectItem>
                            <SelectItem value="Moderatör">Moderatör</SelectItem>
                            <SelectItem value="Analist">Analist</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Durum</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange as any} 
                          defaultValue={field.value}
                        >
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Durum seçin" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-700 border-gray-600 text-white">
                            <SelectItem value="active">Aktif</SelectItem>
                            <SelectItem value="inactive">Pasif</SelectItem>
                            <SelectItem value="suspended">Askıya Alınmış</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage className="text-red-400" />
                    </FormItem>
                  )}
                />
              </div>

              <DialogFooter className="pt-4">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setOpenStaffDialog(false)}
                  className="border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                  İptal
                </Button>
                <Button type="submit" variant="yellow">
                  {isEditMode ? 'Güncelle' : 'Ekle'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default StaffPage;