import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  FileText,
  Mail,
  Languages,
  Calendar,
  Settings,
  Download,
  Upload
} from "lucide-react";
import { format } from "date-fns";
import AdminLayout from "@/components/admin/AdminLayout";

interface EmailTemplate {
  id: number;
  name: string;
  subject: string;
  body: string;
  type: string;
  language: string;
  variables: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
}

interface EmailTemplateFormData {
  name: string;
  subject: string;
  body: string;
  type: string;
  language: string;
  isActive: boolean;
}

interface EmailTemplateStats {
  totalTemplates: number;
  activeTemplates: number;
  inactiveTemplates: number;
  typeStats: Record<string, number>;
  languageStats: Record<string, number>;
  mostUsedType: string;
  recentlyUpdated: number;
}

export default function EmailTemplates() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [viewingTemplate, setViewingTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState<EmailTemplateFormData>({
    name: "",
    subject: "",
    body: "",
    type: "",
    language: "tr",
    isActive: true
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch email templates
  const { data: templatesResponse, isLoading: templatesLoading } = useQuery({
    queryKey: ["/api/admin/email-templates"],
    enabled: true
  });

  // Fetch email template stats
  const { data: statsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/email-templates/stats"],
    enabled: true
  });

  const templates = (templatesResponse as any)?.data || [];
  const stats = (statsResponse as any)?.stats || {};

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: (data: EmailTemplateFormData) => 
      apiRequest("/api/admin/email-templates", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates/stats"] });
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: "Başarılı",
        description: "Email şablonu başarıyla oluşturuldu",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Email şablonu oluşturulurken bir hata oluştu",
        variant: "destructive",
      });
    }
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: EmailTemplateFormData }) =>
      apiRequest(`/api/admin/email-templates/${id}`, "PUT", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates/stats"] });
      setIsEditDialogOpen(false);
      setEditingTemplate(null);
      resetForm();
      toast({
        title: "Başarılı",
        description: "Email şablonu başarıyla güncellendi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Email şablonu güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: (id: number) =>
      apiRequest(`/api/admin/email-templates/${id}`, "DELETE"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/email-templates/stats"] });
      toast({
        title: "Başarılı",
        description: "Email şablonu başarıyla silindi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Email şablonu silinirken bir hata oluştu",
        variant: "destructive",
      });
    }
  });

  const resetForm = () => {
    setFormData({
      name: "",
      subject: "",
      body: "",
      type: "",
      language: "tr",
      isActive: true
    });
  };

  const handleCreateTemplate = () => {
    createTemplateMutation.mutate(formData);
  };

  const handleUpdateTemplate = () => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data: formData });
    }
  };

  const handleDeleteTemplate = (id: number) => {
    if (confirm("Bu email şablonunu silmek istediğinizden emin misiniz?")) {
      deleteTemplateMutation.mutate(id);
    }
  };

  const handleEditTemplate = (template: EmailTemplate) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      subject: template.subject,
      body: template.body,
      type: template.type,
      language: template.language,
      isActive: template.isActive
    });
    setIsEditDialogOpen(true);
  };

  const handleViewTemplate = (template: EmailTemplate) => {
    setViewingTemplate(template);
    setIsViewDialogOpen(true);
  };

  // Filter templates
  const filteredTemplates = Array.isArray(templates) ? templates.filter((template: EmailTemplate) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || template.type === selectedType;
    const matchesLanguage = selectedLanguage === "all" || template.language === selectedLanguage;
    const matchesStatus = selectedStatus === "all" || 
                         (selectedStatus === "active" && template.isActive) ||
                         (selectedStatus === "inactive" && !template.isActive);
    
    return matchesSearch && matchesType && matchesLanguage && matchesStatus;
  }) : [];

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      welcome: "bg-green-500/10 text-green-400 border-green-500/20",
      verification: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      reset_password: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      newsletter: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      promotion: "bg-pink-500/10 text-pink-400 border-pink-500/20",
      notification: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
    };
    return colors[type] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  const getLanguageFlag = (language: string) => {
    const flags: Record<string, string> = {
      tr: "🇹🇷",
      en: "🇺🇸",
      ka: "🇬🇪",
      ru: "🇷🇺"
    };
    return flags[language] || "🌐";
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Email Şablonları</h1>
            <p className="text-slate-400 mt-1">Email şablonlarını yönetin ve düzenleyin</p>
          </div>
          <Button 
            onClick={() => setIsCreateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Yeni Şablon
          </Button>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Toplam Şablon</CardTitle>
                <FileText className="h-4 w-4 text-slate-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-white">{(stats as any)?.totalTemplates || 0}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Aktif Şablon</CardTitle>
                <Mail className="h-4 w-4 text-green-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-400">{(stats as any)?.activeTemplates || 0}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">En Çok Kullanılan</CardTitle>
                <Languages className="h-4 w-4 text-blue-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-400">{(stats as any)?.mostUsedType || '-'}</div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-slate-300">Son Güncellenen</CardTitle>
                <Calendar className="h-4 w-4 text-purple-400" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-400">{(stats as any)?.recentlyUpdated || 0}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Filters */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Filtreler</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Arama</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Şablon ara..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Tür</Label>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Tür seçin" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="welcome">Hoş Geldin</SelectItem>
                    <SelectItem value="verification">Doğrulama</SelectItem>
                    <SelectItem value="reset_password">Şifre Sıfırlama</SelectItem>
                    <SelectItem value="newsletter">Haber Bülteni</SelectItem>
                    <SelectItem value="promotion">Promosyon</SelectItem>
                    <SelectItem value="notification">Bildirim</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Dil</Label>
                <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Dil seçin" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="tr">🇹🇷 Türkçe</SelectItem>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                    <SelectItem value="ka">🇬🇪 ქართული</SelectItem>
                    <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Durum</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Durum seçin" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-700 border-gray-600">
                    <SelectItem value="all">Tümü</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Pasif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Templates List */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Email Şablonları ({filteredTemplates.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {templatesLoading ? (
              <div className="text-center py-8">
                <div className="text-slate-400">Yükleniyor...</div>
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-slate-400">Henüz email şablonu bulunmuyor</div>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTemplates.map((template: EmailTemplate) => (
                  <div key={template.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-white font-medium">
                          {template.name}
                        </h3>
                        <Badge className={getTypeColor(template.type)}>
                          {template.type}
                        </Badge>
                        <span className="text-lg">{getLanguageFlag(template.language)}</span>
                      </div>
                      <p className="text-sm text-slate-400 truncate mt-1">
                        {template.subject}
                      </p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-slate-500">
                        <span>Oluşturuldu: {format(new Date(template.createdAt), 'dd/MM/yyyy')}</span>
                        {template.updatedAt && (
                          <span>Güncellendi: {format(new Date(template.updatedAt), 'dd/MM/yyyy')}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge variant={template.isActive ? "default" : "secondary"}>
                        {template.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewTemplate(template)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditTemplate(template)}
                        className="text-slate-400 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Create Template Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Yeni Email Şablonu</DialogTitle>
              <DialogDescription className="text-slate-400">
                Yeni bir email şablonu oluşturun
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Şablon Adı</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Şablon adı"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-300">Tür</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Tür seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="welcome">Hoş Geldin</SelectItem>
                      <SelectItem value="verification">Doğrulama</SelectItem>
                      <SelectItem value="reset_password">Şifre Sıfırlama</SelectItem>
                      <SelectItem value="newsletter">Haber Bülteni</SelectItem>
                      <SelectItem value="promotion">Promosyon</SelectItem>
                      <SelectItem value="notification">Bildirim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Dil</Label>
                  <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="tr">🇹🇷 Türkçe</SelectItem>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="ka">🇬🇪 ქართული</SelectItem>
                      <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Durum</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label className="text-slate-300">
                      {formData.isActive ? "Aktif" : "Pasif"}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Konu</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Email konusu"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">İçerik</Label>
                <Textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white min-h-[200px]"
                  placeholder="Email içeriği (HTML desteklenir)"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  resetForm();
                }}
                className="border-gray-600 text-slate-300 hover:bg-gray-700"
              >
                İptal
              </Button>
              <Button
                onClick={handleCreateTemplate}
                disabled={createTemplateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {createTemplateMutation.isPending ? "Oluşturuluyor..." : "Oluştur"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Template Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Email Şablonu Düzenle</DialogTitle>
              <DialogDescription className="text-slate-400">
                Email şablonunu düzenleyin
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Şablon Adı</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-gray-700 border-gray-600 text-white"
                    placeholder="Şablon adı"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label className="text-slate-300">Tür</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue placeholder="Tür seçin" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="welcome">Hoş Geldin</SelectItem>
                      <SelectItem value="verification">Doğrulama</SelectItem>
                      <SelectItem value="reset_password">Şifre Sıfırlama</SelectItem>
                      <SelectItem value="newsletter">Haber Bülteni</SelectItem>
                      <SelectItem value="promotion">Promosyon</SelectItem>
                      <SelectItem value="notification">Bildirim</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Dil</Label>
                  <Select value={formData.language} onValueChange={(value) => setFormData({ ...formData, language: value })}>
                    <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-700 border-gray-600">
                      <SelectItem value="tr">🇹🇷 Türkçe</SelectItem>
                      <SelectItem value="en">🇺🇸 English</SelectItem>
                      <SelectItem value="ka">🇬🇪 ქართული</SelectItem>
                      <SelectItem value="ru">🇷🇺 Русский</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Durum</Label>
                  <div className="flex items-center space-x-2 pt-2">
                    <Switch
                      checked={formData.isActive}
                      onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                    />
                    <Label className="text-slate-300">
                      {formData.isActive ? "Aktif" : "Pasif"}
                    </Label>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Konu</Label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white"
                  placeholder="Email konusu"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">İçerik</Label>
                <Textarea
                  value={formData.body}
                  onChange={(e) => setFormData({ ...formData, body: e.target.value })}
                  className="bg-gray-700 border-gray-600 text-white min-h-[200px]"
                  placeholder="Email içeriği (HTML desteklenir)"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false);
                  setEditingTemplate(null);
                  resetForm();
                }}
                className="border-gray-600 text-slate-300 hover:bg-gray-700"
              >
                İptal
              </Button>
              <Button
                onClick={handleUpdateTemplate}
                disabled={updateTemplateMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {updateTemplateMutation.isPending ? "Güncelleniyor..." : "Güncelle"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* View Template Dialog */}
        <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">Email Şablonu Önizleme</DialogTitle>
              <DialogDescription className="text-slate-400">
                Email şablonunu görüntüleyin
              </DialogDescription>
            </DialogHeader>
            
            {viewingTemplate && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Şablon Adı</Label>
                    <p className="text-white mt-1">{viewingTemplate.name}</p>
                  </div>
                  <div>
                    <Label className="text-slate-300">Tür</Label>
                    <div className="mt-1">
                      <Badge className={getTypeColor(viewingTemplate.type)}>
                        {viewingTemplate.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Dil</Label>
                    <p className="text-white mt-1">
                      {getLanguageFlag(viewingTemplate.language)} {viewingTemplate.language.toUpperCase()}
                    </p>
                  </div>
                  <div>
                    <Label className="text-slate-300">Durum</Label>
                    <div className="mt-1">
                      <Badge variant={viewingTemplate.isActive ? "default" : "secondary"}>
                        {viewingTemplate.isActive ? "Aktif" : "Pasif"}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300">Konu</Label>
                  <p className="text-white mt-1">{viewingTemplate.subject}</p>
                </div>

                <div>
                  <Label className="text-slate-300">İçerik</Label>
                  <div className="mt-2 p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <div 
                      className="text-white prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: viewingTemplate.body }}
                    />
                  </div>
                </div>

                {viewingTemplate.variables && viewingTemplate.variables.length > 0 && (
                  <div>
                    <Label className="text-slate-300">Değişkenler</Label>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {viewingTemplate.variables.map((variable, index) => (
                        <Badge key={index} variant="outline" className="border-blue-500/20 text-blue-400">
                          {variable}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 text-sm text-slate-400">
                  <div>
                    <Label className="text-slate-300">Oluşturulma Tarihi</Label>
                    <p className="mt-1">{format(new Date(viewingTemplate.createdAt), 'dd/MM/yyyy HH:mm')}</p>
                  </div>
                  {viewingTemplate.updatedAt && (
                    <div>
                      <Label className="text-slate-300">Son Güncelleme</Label>
                      <p className="mt-1">{format(new Date(viewingTemplate.updatedAt), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                variant="outline"
                onClick={() => setIsViewDialogOpen(false)}
                className="border-gray-600 text-slate-300 hover:bg-gray-700"
              >
                Kapat
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}