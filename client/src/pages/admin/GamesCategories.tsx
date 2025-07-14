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
  ArrowUpDown, 
  Check, 
  Edit2, 
  Eye, 
  FileImage, 
  Gamepad, 
  LayoutGrid, 
  MoreHorizontal, 
  Plus, 
  Search, 
  Trash2, 
  Upload,
  X,
  MessageSquare
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Kategori veri tipi
interface GameCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  priority: number;
  status: 'active' | 'inactive';
  gameCount: number;
  createdAt: string;
  updatedAt?: string;
  translations?: {
    [key: string]: {
      name: string;
      description?: string;
    }
  }
}

// Form şeması
const categoryFormSchema = z.object({
  name: z.string().min(2, {
    message: "Kategori adı en az 2 karakter olmalıdır.",
  }),
  slug: z.string().min(2, {
    message: "Kategori slug en az 2 karakter olmalıdır.",
  }).regex(/^[a-z0-9-]+$/, {
    message: "Slug sadece küçük harfler, rakamlar ve tire içerebilir.",
  }),
  description: z.string().optional(),
  priority: z.coerce.number().min(0, {
    message: "Öncelik değeri 0 veya daha büyük olmalıdır.",
  }),
  status: z.enum(['active', 'inactive'], {
    required_error: "Durum seçiniz.",
  }),
  translations: z.object({
    en: z.object({
      name: z.string().min(2, {
        message: "İngilizce kategori adı en az 2 karakter olmalıdır.",
      }),
      description: z.string().optional(),
    }),
    tr: z.object({
      name: z.string().min(2, {
        message: "Türkçe kategori adı en az 2 karakter olmalıdır.",
      }),
      description: z.string().optional(),
    }),
  }),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

// Platform açılmadığı için henüz kategori verisi yok
const mockCategories: GameCategory[] = [];

const GamesCategoriesPage = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [sortField, setSortField] = useState<string>("priority");
  const [openCategoryDialog, setOpenCategoryDialog] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<GameCategory | null>(null);
  const [selectedTab, setSelectedTab] = useState<'details' | 'english' | 'turkish'>('details');
  
  // Form tanımı
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      priority: 0,
      status: "active",
      translations: {
        en: {
          name: "",
          description: ""
        },
        tr: {
          name: "",
          description: ""
        }
      }
    },
  });
  
  // Kategori listesini getir
  const { data: categories = mockCategories, isLoading, isError } = useQuery({
    queryKey: ['game-categories', statusFilter, sortField, sortOrder],
    queryFn: async () => {
      // Gerçek API çağrısı
      // const response = await apiRequest('GET', `/api/admin/game-categories?status=${statusFilter}&sort=${sortField}&order=${sortOrder}`);
      // return response.json();
      
      // Şimdilik mock veri dönüyoruz ve filtreliyoruz
      let filteredData = [...mockCategories];
      
      // Durum filtresi uygula
      if (statusFilter !== 'all') {
        filteredData = filteredData.filter(cat => cat.status === statusFilter);
      }
      
      // Sıralama
      filteredData.sort((a, b) => {
        if (sortField === 'name') {
          return sortOrder === 'asc' 
            ? a.name.localeCompare(b.name) 
            : b.name.localeCompare(a.name);
        }
        
        if (sortField === 'gameCount') {
          return sortOrder === 'asc' 
            ? a.gameCount - b.gameCount 
            : b.gameCount - a.gameCount;
        }
        
        // Varsayılan: priority ile sırala
        return sortOrder === 'asc' 
          ? a.priority - b.priority 
          : b.priority - a.priority;
      });
      
      return filteredData;
    },
  });

  // Arama filtrelemesi
  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.slug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.translations?.en.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.translations?.tr.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Kategori ekleme/düzenleme formunu açma
  const handleOpenCategoryForm = (category?: GameCategory) => {
    if (category) {
      // Düzenleme modu
      setIsEditMode(true);
      setSelectedCategory(category);
      
      // Form değerlerini ayarla
      form.reset({
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        priority: category.priority,
        status: category.status,
        translations: {
          en: {
            name: category.translations?.en.name || "",
            description: category.translations?.en.description || ""
          },
          tr: {
            name: category.translations?.tr.name || "",
            description: category.translations?.tr.description || ""
          }
        }
      });
    } else {
      // Ekleme modu
      setIsEditMode(false);
      setSelectedCategory(null);
      
      // Form değerlerini sıfırla
      form.reset({
        name: "",
        slug: "",
        description: "",
        priority: 0,
        status: "active",
        translations: {
          en: {
            name: "",
            description: ""
          },
          tr: {
            name: "",
            description: ""
          }
        }
      });
    }
    
    setOpenCategoryDialog(true);
    setSelectedTab('details'); // İlk sekmeyi seç
  };

  // Slug oluşturucu
  const generateSlug = (name: string) => {
    // Türkçe karakterleri değiştir
    const turkishChars: {[key: string]: string} = { 'ı': 'i', 'ğ': 'g', 'ü': 'u', 'ş': 's', 'ö': 'o', 'ç': 'c', 'İ': 'I', 'Ğ': 'G', 'Ü': 'U', 'Ş': 'S', 'Ö': 'O', 'Ç': 'C' };
    
    let slug = name.toLowerCase();
    
    // Türkçe karakterleri değiştir
    Object.keys(turkishChars).forEach(char => {
      slug = slug.replace(new RegExp(char, 'g'), turkishChars[char]);
    });
    
    // Alfanumerik olmayan karakterleri tire ile değiştir ve fazla tireleri temizle
    slug = slug.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
    
    return slug;
  };

  // İsim değişince slug otomatik oluştur
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue('name', name);
    
    // İsim değiştiğinde slug'ı otomatik güncelle (eğer slug manuel olarak değiştirilmediyse)
    if (!form.getValues('slug') || form.getValues('slug') === generateSlug(form.getValues('name'))) {
      const slug = generateSlug(name);
      form.setValue('slug', slug);
    }
  };

  // Form gönderimi
  const onSubmit = async (data: CategoryFormValues) => {
    try {
      if (isEditMode && selectedCategory) {
        // Kategori güncelleme
        // await apiRequest('PATCH', `/api/admin/game-categories/${selectedCategory.id}`, data);
        toast({
          title: "Kategori güncellendi",
          description: `${data.name} kategorisi başarıyla güncellendi.`,
        });
      } else {
        // Yeni kategori ekleme
        // await apiRequest('POST', '/api/admin/game-categories', data);
        toast({
          title: "Kategori eklendi",
          description: `${data.name} kategorisi başarıyla oluşturuldu.`,
        });
      }
      
      // Dialog kapat ve formu sıfırla
      setOpenCategoryDialog(false);
      form.reset();
      
      // Listeyi yeniden yükle
      // queryClient.invalidateQueries(['game-categories']);
    } catch (error) {
      toast({
        title: "Hata",
        description: "İşlem sırasında bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // Kategori silme
  const handleDeleteCategory = async (categoryId: number, categoryName: string) => {
    const confirmed = window.confirm(`"${categoryName}" kategorisini silmek istediğinizden emin misiniz?`);
    
    if (confirmed) {
      try {
        // await apiRequest('DELETE', `/api/admin/game-categories/${categoryId}`);
        toast({
          title: "Kategori silindi",
          description: `${categoryName} kategorisi başarıyla silindi.`,
        });
        
        // Listeyi yeniden yükle
        // queryClient.invalidateQueries(['game-categories']);
      } catch (error) {
        toast({
          title: "Hata",
          description: "Silme işlemi sırasında bir hata oluştu.",
          variant: "destructive",
        });
      }
    }
  };

  // Durum değiştirme
  const handleToggleStatus = async (category: GameCategory) => {
    const newStatus = category.status === 'active' ? 'inactive' : 'active';
    
    try {
      // await apiRequest('PATCH', `/api/admin/game-categories/${category.id}/status`, { status: newStatus });
      toast({
        title: "Durum güncellendi",
        description: `${category.name} kategorisi ${newStatus === 'active' ? 'aktif' : 'pasif'} duruma getirildi.`,
      });
      
      // Listeyi yeniden yükle
      // queryClient.invalidateQueries(['game-categories']);
    } catch (error) {
      toast({
        title: "Hata",
        description: "Durum değiştirme işlemi sırasında bir hata oluştu.",
        variant: "destructive",
      });
    }
  };

  // Sıralama değiştirme
  const handleSort = (field: string) => {
    if (field === sortField) {
      // Aynı alan tekrar tıklandığında sıralama yönünü değiştir
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Farklı alan tıklandığında, yeni alanı belirle ve varsayılan artan sıralama
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <AdminLayout title="Oyun Kategorileri">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Oyun Kategorileri</h1>
            <p className="text-gray-400 mt-1">
              Oyun kategorilerini ekleyin, düzenleyin ve yönetin.
            </p>
          </div>
          <Button onClick={() => handleOpenCategoryForm()} variant="yellow" className="gap-2">
            <Plus size={16} />
            <span>Yeni Kategori</span>
          </Button>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-gray-200 flex items-center gap-2">
                <LayoutGrid className="h-5 w-5 text-yellow-500" />
                Toplam Kategori
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">{categories.length}</div>
              <div className="text-sm text-gray-400 mt-1">
                Toplam kategori sayısı
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-gray-200 flex items-center gap-2">
                <Check className="h-5 w-5 text-green-500" />
                Aktif Kategori
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {categories.filter(c => c.status === 'active').length}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Aktif kategori sayısı
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl text-gray-200 flex items-center gap-2">
                <Gamepad className="h-5 w-5 text-blue-500" />
                Toplam Oyun
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-white">
                {categories.reduce((total, category) => total + category.gameCount, 0)}
              </div>
              <div className="text-sm text-gray-400 mt-1">
                Tüm kategorilerdeki oyun sayısı
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Arama ve Filtreleme */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center space-x-2 bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex-1">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              placeholder="Kategori adı, slug veya açıklama ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent border-none text-white focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-[160px] bg-gray-800 border-gray-700 text-white">
              <SelectValue placeholder="Durum" />
            </SelectTrigger>
            <SelectContent className="bg-gray-800 border-gray-700 text-white">
              <SelectItem value="all">Tüm Durumlar</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Pasif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Kategori Tablosu */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-xl text-white">Kategori Listesi</CardTitle>
            <CardDescription className="text-gray-400">
              {filteredCategories.length} kategori listeleniyor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table className="text-gray-200">
              <TableHeader className="bg-gray-900/50">
                <TableRow>
                  <TableHead className="w-[60px]">ID</TableHead>
                  <TableHead className="text-left">
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('name')}>
                      Kategori
                      {sortField === 'name' && (
                        <ArrowUpDown size={14} className={`transition-transform duration-200 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('priority')}>
                      Öncelik
                      {sortField === 'priority' && (
                        <ArrowUpDown size={14} className={`transition-transform duration-200 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1 cursor-pointer" onClick={() => handleSort('gameCount')}>
                      Oyun Sayısı
                      {sortField === 'gameCount' && (
                        <ArrowUpDown size={14} className={`transition-transform duration-200 ${sortOrder === 'desc' ? 'rotate-180' : ''}`} />
                      )}
                    </div>
                  </TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Son Güncelleme</TableHead>
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
                ) : filteredCategories.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-gray-400">
                      Arama kriterlerinize uygun kategori bulunamadı.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCategories.map((category) => (
                    <TableRow key={category.id} className="hover:bg-gray-700/50">
                      <TableCell className="font-medium">{category.id}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center text-yellow-500">
                            <Gamepad size={18} />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium">{category.name}</span>
                            {category.description && (
                              <span className="text-xs text-gray-400 truncate max-w-[200px]">
                                {category.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-gray-400">
                        {category.slug}
                      </TableCell>
                      <TableCell className="font-medium text-center">
                        {category.priority}
                      </TableCell>
                      <TableCell className="font-medium text-center">
                        {category.gameCount}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={`cursor-pointer ${category.status === 'active' ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30' : 'bg-gray-500/20 text-gray-400 hover:bg-gray-500/30'}`}
                          variant={category.status === 'active' ? 'success' : 'secondary'}
                          onClick={() => handleToggleStatus(category)}
                        >
                          {category.status === 'active' ? 'Aktif' : 'Pasif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-400 text-sm">
                        {category.updatedAt ? new Date(category.updatedAt).toLocaleString('tr-TR') : '-'}
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
                              onClick={() => handleOpenCategoryForm(category)}
                            >
                              <Edit2 className="h-4 w-4 mr-2" /> Düzenle
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="hover:bg-gray-700 cursor-pointer text-red-500 hover:text-red-400"
                              onClick={() => handleDeleteCategory(category.id, category.name)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Sil
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

      {/* Kategori Ekleme/Düzenleme Modalı */}
      <Dialog open={openCategoryDialog} onOpenChange={setOpenCategoryDialog}>
        <DialogContent className="bg-gray-800 text-gray-100 border-gray-700 max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              <Gamepad className="h-5 w-5 text-yellow-500" />
              {isEditMode ? 'Kategori Düzenle' : 'Yeni Kategori Ekle'}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {isEditMode 
                ? 'Kategori bilgilerini güncelleyerek değişiklikleri kaydedin.' 
                : 'Site genelinde görüntülenecek yeni bir oyun kategorisi ekleyin.'}
            </DialogDescription>
          </DialogHeader>

          <div className="flex border-b border-gray-700 mb-4">
            <button
              className={`px-4 py-2 border-b-2 ${selectedTab === 'details' ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
              onClick={() => setSelectedTab('details')}
            >
              Detaylar
            </button>
            <button
              className={`px-4 py-2 border-b-2 ${selectedTab === 'english' ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
              onClick={() => setSelectedTab('english')}
            >
              <div className="flex items-center gap-1">
                <span>İngilizce</span>
                <img src="/flags/en.png" alt="English" className="w-4 h-4" />
              </div>
            </button>
            <button
              className={`px-4 py-2 border-b-2 ${selectedTab === 'turkish' ? 'border-yellow-500 text-yellow-500' : 'border-transparent text-gray-400 hover:text-gray-200'}`}
              onClick={() => setSelectedTab('turkish')}
            >
              <div className="flex items-center gap-1">
                <span>Türkçe</span>
                <img src="/flags/tr.png" alt="Türkçe" className="w-4 h-4" />
              </div>
            </button>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Ana Detaylar Tab */}
              {selectedTab === 'details' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Kategori Adı</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Kategori adı" 
                              {...field} 
                              onChange={handleNameChange}
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </FormControl>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="slug"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Slug</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="kategori-slug" 
                              {...field} 
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-400 text-xs">
                            URL'de kullanılacak benzersiz tanımlayıcı
                          </FormDescription>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Açıklama</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Kategori açıklaması" 
                            {...field} 
                            className="bg-gray-700 border-gray-600 text-white resize-none"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Öncelik</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field} 
                              className="bg-gray-700 border-gray-600 text-white"
                            />
                          </FormControl>
                          <FormDescription className="text-gray-400 text-xs">
                            Düşük değer daha yüksek öncelik anlamına gelir
                          </FormDescription>
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
                          <div className="flex items-center space-x-2 mt-2">
                            <FormControl>
                              <Switch 
                                checked={field.value === 'active'} 
                                onCheckedChange={(checked) => {
                                  field.onChange(checked ? 'active' : 'inactive');
                                }}
                                className="data-[state=checked]:bg-yellow-500"
                              />
                            </FormControl>
                            <span className="text-sm font-medium">
                              {field.value === 'active' ? 'Aktif' : 'Pasif'}
                            </span>
                          </div>
                          <FormMessage className="text-red-400" />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-yellow-500">
                      <FileImage className="h-4 w-4" /> Kategori Görseli
                    </h3>
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
                      <Upload className="h-10 w-10 text-gray-400 mb-2" />
                      <p className="text-sm text-gray-300 mb-1">Görsel yüklemek için tıklayın veya sürükleyip bırakın</p>
                      <p className="text-xs text-gray-400">PNG, JPG veya WEBP (maks. 2MB)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* İngilizce Çeviriler Tab */}
              {selectedTab === 'english' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-700">
                    <MessageSquare className="h-5 w-5 text-yellow-500" /> 
                    <h3 className="text-lg font-medium">İngilizce Çeviriler</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="translations.en.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategori Adı (İngilizce)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Category name in English" 
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
                    name="translations.en.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Açıklama (İngilizce)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Category description in English" 
                            {...field} 
                            className="bg-gray-700 border-gray-600 text-white resize-none"
                            rows={3}
                          />
                        </FormControl>
                        <FormMessage className="text-red-400" />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Türkçe Çeviriler Tab */}
              {selectedTab === 'turkish' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-700">
                    <MessageSquare className="h-5 w-5 text-yellow-500" /> 
                    <h3 className="text-lg font-medium">Türkçe Çeviriler</h3>
                  </div>

                  <FormField
                    control={form.control}
                    name="translations.tr.name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kategori Adı (Türkçe)</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Türkçe kategori adı" 
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
                    name="translations.tr.description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Açıklama (Türkçe)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Türkçe kategori açıklaması" 
                            {...field} 
                            className="bg-gray-700 border-gray-600 text-white resize-none"
                            rows={3}
                          />
                        </FormControl>
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
                  onClick={() => setOpenCategoryDialog(false)}
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

export default GamesCategoriesPage;