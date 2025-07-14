import { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  MessageSquare,
  Clock,
  User,
  AlertCircle,
  CheckCircle,
  XCircle,
  Mail,
  Phone,
  Search,
  Filter,
  Eye,
  Reply,
  Archive,
  Star,
  Calendar,
  TrendingUp,
  Users,
  HeadphonesIcon,
  MessageCircle,
  Zap,
  RefreshCw,
  Download,
  FileText,
  Send
} from "lucide-react";
import { format } from "date-fns";
import AdminLayout from "@/components/admin/AdminLayout";

interface SupportTicket {
  id: number;
  ticketNumber: string;
  userId: number;
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
  category: string;
  priority: string;
  status: string;
  assignedTo: number | null;
  assignedToName: string | null;
  responses: SupportResponse[];
  attachments: string[];
  createdAt: string;
  updatedAt: string | null;
  resolvedAt: string | null;
}

interface SupportResponse {
  id: number;
  ticketId: number;
  userId: number;
  userName: string;
  userRole: string;
  message: string;
  isInternal: boolean;
  createdAt: string;
}

interface SupportStats {
  totalTickets: number;
  openTickets: number;
  closedTickets: number;
  avgResponseTime: number;
  todayTickets: number;
  urgentTickets: number;
  categoryStats: Record<string, number>;
  priorityStats: Record<string, number>;
  statusStats: Record<string, number>;
  agentPerformance: Array<{
    agentId: number;
    agentName: string;
    ticketsHandled: number;
    avgResponseTime: number;
    customerRating: number;
  }>;
}

interface SupportFormData {
  subject: string;
  message: string;
  category: string;
  priority: string;
  assignedTo: number | null;
}

export default function Support() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedPriority, setSelectedPriority] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedSource, setSelectedSource] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [isTicketDialogOpen, setIsTicketDialogOpen] = useState(false);
  const [isResponseDialogOpen, setIsResponseDialogOpen] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [activeTab, setActiveTab] = useState("tickets");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch support tickets
  const { data: ticketsResponse, isLoading: ticketsLoading } = useQuery({
    queryKey: ["/api/admin/support/tickets"],
    enabled: true
  });

  // Fetch support stats
  const { data: statsResponse, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/admin/support/stats"],
    enabled: true
  });

  const tickets = (ticketsResponse as any)?.data?.tickets || [];
  const stats = (statsResponse as any)?.stats || {};

  // Update ticket status mutation
  const updateTicketMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) =>
      apiRequest("PUT", `/api/admin/support/tickets/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/stats"] });
      toast({
        title: "Başarılı",
        description: "Ticket başarıyla güncellendi",
      });
    },
    onError: () => {
      toast({
        title: "Hata",
        description: "Ticket güncellenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  });

  // Add response mutation
  const addResponseMutation = useMutation({
    mutationFn: ({ ticketId, data }: { ticketId: number; data: any }) =>
      apiRequest("POST", `/api/admin/support/tickets/${ticketId}/responses`, data),
    onSuccess: (data) => {
      console.log("✅ Yanıt başarıyla eklendi:", data);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/tickets"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/support/stats"] });
      setResponseMessage("");
      setIsInternal(false);
      
      // Ticket'i güncelle (UI'da hemen görünmesi için)
      if (selectedTicket) {
        const newResponse = {
          id: Date.now(),
          ticketId: selectedTicket.id,
          userId: 1,
          userName: "Admin",
          userRole: "admin",
          isAdmin: true,
          isInternal: isInternal,
          message: responseMessage,
          createdAt: new Date().toISOString()
        };
        
        setSelectedTicket({
          ...selectedTicket,
          responses: [...(selectedTicket.responses || []), newResponse]
        });
      }
      
      toast({
        title: "Başarılı",
        description: "Yanıt başarıyla eklendi",
      });
    },
    onError: (error: any) => {
      console.error("❌ Yanıt ekleme hatası:", error);
      toast({
        title: "Hata",
        description: error?.message || "Yanıt eklenirken bir hata oluştu",
        variant: "destructive",
      });
    }
  });

  const handleTicketClick = (ticket: SupportTicket) => {
    setSelectedTicket(ticket);
    setIsTicketDialogOpen(true);
  };

  const handleStatusChange = (ticketId: number, status: string) => {
    updateTicketMutation.mutate({ id: ticketId, data: { status } });
  };

  const handlePriorityChange = (ticketId: number, priority: string) => {
    updateTicketMutation.mutate({ id: ticketId, data: { priority } });
  };

  const handleAssignTicket = (ticketId: number, assignedTo: number) => {
    updateTicketMutation.mutate({ id: ticketId, data: { assignedTo } });
  };

  const handleAddResponse = () => {
    if (selectedTicket && responseMessage.trim()) {
      addResponseMutation.mutate({
        ticketId: selectedTicket.id,
        data: {
          message: responseMessage,
          isInternal
        }
      });
    }
  };

  // Filter tickets
  const filteredTickets = Array.isArray(tickets) ? tickets.filter((ticket: SupportTicket) => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || ticket.category === selectedCategory;
    const matchesPriority = selectedPriority === "all" || ticket.priority === selectedPriority;
    const matchesStatus = selectedStatus === "all" || ticket.status === selectedStatus;
    const matchesSource = selectedSource === "all" || (ticket as any).source === selectedSource;
    
    return matchesSearch && matchesCategory && matchesPriority && matchesStatus && matchesSource;
  }) : [];

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: "bg-red-500/10 text-red-400 border-red-500/20",
      high: "bg-orange-500/10 text-orange-400 border-orange-500/20",
      medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      low: "bg-green-500/10 text-green-400 border-green-500/20"
    };
    return colors[priority] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      in_progress: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      waiting_customer: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
      resolved: "bg-green-500/10 text-green-400 border-green-500/20",
      closed: "bg-gray-500/10 text-gray-400 border-gray-500/20"
    };
    return colors[status] || "bg-slate-500/10 text-slate-400 border-slate-500/20";
  };

  const getStatusIcon = (status: string) => {
    const icons: Record<string, any> = {
      open: AlertCircle,
      in_progress: Clock,
      waiting_customer: MessageSquare,
      resolved: CheckCircle,
      closed: XCircle
    };
    const Icon = icons[status] || AlertCircle;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-white">Destek Yönetimi</h1>
            <p className="text-slate-400 mt-1">Müşteri destek taleplerini yönetin ve takip edin</p>
          </div>
          <Button 
            onClick={() => setActiveTab("settings")}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <HeadphonesIcon className="w-4 h-4 mr-2" />
            Destek Ayarları
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-800 border-gray-700">
            <TabsTrigger value="tickets" className="text-slate-300 data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Destek Talepleri
            </TabsTrigger>
            <TabsTrigger value="analytics" className="text-slate-300 data-[state=active]:text-white">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analitik
            </TabsTrigger>
            <TabsTrigger value="agents" className="text-slate-300 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Destek Ekibi
            </TabsTrigger>
            <TabsTrigger value="settings" className="text-slate-300 data-[state=active]:text-white">
              <HeadphonesIcon className="w-4 h-4 mr-2" />
              Ayarlar
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tickets" className="space-y-6">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Toplam Ticket</CardTitle>
                    <MessageSquare className="h-4 w-4 text-slate-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-white">{(stats as any)?.totalTickets || 0}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Açık Ticket</CardTitle>
                    <AlertCircle className="h-4 w-4 text-orange-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-orange-400">{(stats as any)?.openTickets || 0}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Acil Ticket</CardTitle>
                    <Zap className="h-4 w-4 text-red-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-red-400">{(stats as any)?.urgentTickets || 0}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-slate-300">Ort. Yanıt Süresi</CardTitle>
                    <Clock className="h-4 w-4 text-purple-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-400">{(stats as any)?.avgResponseTime || 0}dk</div>
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
                        placeholder="Ticket ara..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-700 border-gray-600 text-white placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Kategori</Label>
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Kategori seçin" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="all">Tümü</SelectItem>
                        <SelectItem value="technical">Teknik</SelectItem>
                        <SelectItem value="payment">Ödeme</SelectItem>
                        <SelectItem value="account">Hesap</SelectItem>
                        <SelectItem value="game">Oyun</SelectItem>
                        <SelectItem value="bonus">Bonus</SelectItem>
                        <SelectItem value="general">Genel</SelectItem>
                        <SelectItem value="other">Diğer</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Kaynak</Label>
                    <Select value={selectedSource || "all"} onValueChange={setSelectedSource}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Kaynak seçin" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="all">Tümü</SelectItem>
                        <SelectItem value="chat">💬 Canlı Chat</SelectItem>
                        <SelectItem value="manual">📝 Manuel</SelectItem>
                        <SelectItem value="email">📧 E-posta</SelectItem>
                        <SelectItem value="form">📋 Form</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-300">Öncelik</Label>
                    <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder="Öncelik seçin" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="all">Tümü</SelectItem>
                        <SelectItem value="urgent">Acil</SelectItem>
                        <SelectItem value="high">Yüksek</SelectItem>
                        <SelectItem value="medium">Orta</SelectItem>
                        <SelectItem value="low">Düşük</SelectItem>
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
                        <SelectItem value="open">Açık</SelectItem>
                        <SelectItem value="in_progress">İşlemde</SelectItem>
                        <SelectItem value="waiting_customer">Müşteri Bekliyor</SelectItem>
                        <SelectItem value="resolved">Çözüldü</SelectItem>
                        <SelectItem value="closed">Kapalı</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tickets List */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Destek Talepleri ({filteredTickets.length})</CardTitle>
              </CardHeader>
              <CardContent>
                {ticketsLoading ? (
                  <div className="text-center py-8">
                    <div className="text-slate-400">Yükleniyor...</div>
                  </div>
                ) : filteredTickets.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-slate-400">Henüz destek talebi bulunmuyor</div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredTickets.map((ticket: SupportTicket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-4 bg-gray-700/50 rounded-lg border border-gray-600 hover:bg-gray-700/70 transition-colors cursor-pointer" onClick={() => handleTicketClick(ticket)}>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-slate-400 text-sm font-mono">#{ticket.ticketNumber}</span>
                            <h3 className="text-white font-medium">
                              {ticket.subject}
                            </h3>
                            <Badge className={getPriorityColor(ticket.priority)}>
                              {ticket.priority}
                            </Badge>
                            <Badge className={getStatusColor(ticket.status)}>
                              {getStatusIcon(ticket.status)}
                              <span className="ml-1">{ticket.status}</span>
                            </Badge>
                            {(ticket as any).source === 'chat' && (
                              <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">
                                💬 Chat
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span className="flex items-center">
                              <User className="h-4 w-4 mr-1" />
                              {ticket.userName}
                            </span>
                            <span className="flex items-center">
                              <Mail className="h-4 w-4 mr-1" />
                              {ticket.userEmail}
                            </span>
                            <span className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {format(new Date(ticket.createdAt), 'dd/MM/yyyy HH:mm')}
                            </span>
                            {ticket.assignedToName && (
                              <span className="flex items-center text-blue-400">
                                <User className="h-4 w-4 mr-1" />
                                Atanan: {ticket.assignedToName}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Select 
                            value={ticket.status} 
                            onValueChange={(value) => handleStatusChange(ticket.id, value)}
                          >
                            <SelectTrigger className="w-40 bg-gray-600 border-gray-500 text-white">
                              <SelectValue>
                                {ticket.status === 'open' && 'Açık'}
                                {ticket.status === 'in_progress' && 'İşlemde'}
                                {ticket.status === 'waiting_customer' && 'Müşteri Bekliyor'}
                                {ticket.status === 'resolved' && 'Çözüldü'}
                                {ticket.status === 'closed' && 'Kapalı'}
                                {!['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'].includes(ticket.status) && ticket.status}
                              </SelectValue>
                            </SelectTrigger>
                            <SelectContent className="bg-gray-700 border-gray-600">
                              <SelectItem value="open">Açık</SelectItem>
                              <SelectItem value="in_progress">İşlemde</SelectItem>
                              <SelectItem value="waiting_customer">Müşteri Bekliyor</SelectItem>
                              <SelectItem value="resolved">Çözüldü</SelectItem>
                              <SelectItem value="closed">Kapalı</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTicket(ticket);
                              setIsResponseDialogOpen(true);
                            }}
                            className="text-slate-400 hover:text-white"
                          >
                            <Reply className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Category Statistics */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Kategori İstatistikleri</CardTitle>
                </CardHeader>
                <CardContent>
                  {(stats as any)?.categoryStats && Object.entries((stats as any).categoryStats).map(([category, count]) => (
                    <div key={category} className="flex justify-between items-center py-2">
                      <span className="text-slate-300 capitalize">{category}</span>
                      <Badge variant="outline" className="border-blue-500/20 text-blue-400">
                        {count as number}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Agent Performance */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white">Destek Ekibi Performansı</CardTitle>
                </CardHeader>
                <CardContent>
                  {(stats as any)?.agentPerformance?.map((agent: any) => (
                    <div key={agent.agentId} className="flex justify-between items-center py-3 border-b border-gray-700 last:border-0">
                      <div>
                        <div className="text-white font-medium">{agent.agentName}</div>
                        <div className="text-sm text-slate-400">{agent.ticketsHandled} ticket işlendi</div>
                      </div>
                      <div className="text-right">
                        <div className="text-green-400 font-medium">★ {agent.customerRating}</div>
                        <div className="text-sm text-slate-400">{agent.avgResponseTime}dk yanıt</div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Destek Ekibi Yönetimi</CardTitle>
                <p className="text-slate-400">Destek ekibi üyelerini yönetin ve performanslarını takip edin</p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-slate-400 mb-4" />
                  <div className="text-slate-400">Destek ekibi yönetimi yakında eklenecek</div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white">Destek Ayarları</CardTitle>
                <p className="text-slate-400">Destek sistemi ayarlarını yapılandırın</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <Label className="text-slate-300">Otomatik Yanıt Süresi (dakika)</Label>
                    <Input
                      type="number"
                      defaultValue="30"
                      className="bg-gray-700 border-gray-600 text-white mt-2"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-slate-300">Varsayılan Kategori</Label>
                    <Select defaultValue="general">
                      <SelectTrigger className="bg-gray-700 border-gray-600 text-white mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-700 border-gray-600">
                        <SelectItem value="general">Genel</SelectItem>
                        <SelectItem value="technical">Teknik</SelectItem>
                        <SelectItem value="payment">Ödeme</SelectItem>
                        <SelectItem value="account">Hesap</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex justify-end">
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      Ayarları Kaydet
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Ticket Detail Dialog */}
        <Dialog open={isTicketDialogOpen} onOpenChange={setIsTicketDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-white">
                Ticket Detayı - #{selectedTicket?.ticketNumber}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                Ticket detaylarını görüntüleyin ve yanıtlayın
              </DialogDescription>
            </DialogHeader>
            
            {selectedTicket && (
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-slate-300">Konu</Label>
                    <p className="text-white mt-1">{selectedTicket.subject}</p>
                  </div>
                  <div>
                    <Label className="text-slate-300">Kategori</Label>
                    <div className="mt-1">
                      <Badge className="capitalize">{selectedTicket.category}</Badge>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-slate-300">Öncelik</Label>
                    <div className="mt-1">
                      <Badge className={getPriorityColor(selectedTicket.priority)}>
                        {selectedTicket.priority}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300">Durum</Label>
                    <div className="mt-1">
                      <Badge className={getStatusColor(selectedTicket.status)}>
                        {selectedTicket.status}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <Label className="text-slate-300">Oluşturulma</Label>
                    <p className="text-white mt-1">
                      {format(new Date(selectedTicket.createdAt), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                </div>

                <div>
                  <Label className="text-slate-300">Müşteri Mesajı</Label>
                  <div className="mt-2 p-4 bg-gray-700 rounded-lg border border-gray-600">
                    <p className="text-white">{selectedTicket.message}</p>
                  </div>
                </div>

                {selectedTicket.responses && selectedTicket.responses.length > 0 && (
                  <div>
                    <Label className="text-slate-300">Yanıtlar</Label>
                    <div className="mt-2 space-y-3">
                      {selectedTicket.responses.map((response) => (
                        <div key={response.id} className={`p-4 rounded-lg border ${
                          response.isInternal 
                            ? 'bg-yellow-500/10 border-yellow-500/20' 
                            : response.userRole === 'admin' 
                              ? 'bg-blue-500/10 border-blue-500/20'
                              : 'bg-gray-700 border-gray-600'
                        }`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="text-white font-medium">{response.userName}</span>
                              <span className="text-slate-400 text-sm ml-2">({response.userRole})</span>
                              {response.isInternal && (
                                <Badge variant="outline" className="ml-2 border-yellow-500/20 text-yellow-400">
                                  İç Not
                                </Badge>
                              )}
                            </div>
                            <span className="text-slate-400 text-sm">
                              {format(new Date(response.createdAt), 'dd/MM/yyyy HH:mm')}
                            </span>
                          </div>
                          <p className="text-white">{response.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setIsTicketDialogOpen(false)}
                    className="border-gray-600 text-slate-300 hover:bg-gray-700"
                  >
                    Kapat
                  </Button>
                  <Button
                    onClick={() => {
                      setIsTicketDialogOpen(false);
                      setIsResponseDialogOpen(true);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Reply className="w-4 h-4 mr-2" />
                    Yanıtla
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Chat-Style Response Dialog */}
        <Dialog open={isResponseDialogOpen} onOpenChange={setIsResponseDialogOpen}>
          <DialogContent className="bg-gray-800 border-gray-700 max-w-4xl h-[80vh] flex flex-col">
            <DialogHeader className="flex-shrink-0">
              <DialogTitle className="text-white flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Chat - #{selectedTicket?.ticketNumber}
              </DialogTitle>
              <DialogDescription className="text-slate-400">
                {selectedTicket?.userName} ile anlık destek
              </DialogDescription>
            </DialogHeader>
            
            {/* Chat Messages Container */}
            <div className="flex-1 overflow-hidden flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-4 p-4 bg-gray-900/20 rounded-lg">
                {/* Initial User Message */}
                {selectedTicket && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
                      {(selectedTicket.userName || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="bg-gray-700 rounded-lg p-3 max-w-xs">
                        <div className="text-sm text-slate-300 mb-1">
                          {selectedTicket.userName || 'Kullanıcı'} • {format(new Date(selectedTicket.createdAt), 'HH:mm')}
                        </div>
                        <div className="text-white">{selectedTicket.message}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Responses */}
                {selectedTicket?.responses?.map((response) => (
                  <div key={response.id} className={`flex gap-3 ${response.userRole === 'admin' || response.isAdmin ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                      response.userRole === 'admin' || response.isAdmin ? 'bg-green-600' : 'bg-blue-600'
                    }`}>
                      {(response.userName || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className={`rounded-lg p-3 max-w-xs ${
                        response.userRole === 'admin' || response.isAdmin
                          ? 'bg-green-600 ml-auto' 
                          : 'bg-gray-700'
                      } ${response.isInternal ? 'border-2 border-yellow-500/30' : ''}`}>
                        <div className="text-sm text-slate-300 mb-1 flex items-center gap-2">
                          {response.userName || (response.userRole === 'admin' || response.isAdmin ? 'Admin' : 'Kullanıcı')} • {format(new Date(response.createdAt), 'HH:mm')}
                          {response.isInternal && (
                            <Badge variant="outline" className="text-xs border-yellow-500/20 text-yellow-400">
                              İç Not
                            </Badge>
                          )}
                        </div>
                        <div className="text-white">{response.message}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input Area */}
              <div className="flex-shrink-0 space-y-3 pt-4 border-t border-gray-700">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isInternal-chat"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700"
                  />
                  <Label htmlFor="isInternal-chat" className="text-slate-300 text-sm">İç not</Label>
                </div>
                
                <div className="flex gap-2">
                  <Textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Mesajınızı yazın..."
                    className="bg-gray-700 border-gray-600 text-white resize-none"
                    rows={2}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        if (responseMessage.trim()) {
                          handleAddResponse();
                        }
                      }
                    }}
                  />
                  <Button
                    onClick={handleAddResponse}
                    disabled={addResponseMutation.isPending || !responseMessage.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="text-xs text-slate-400">
                  Enter ile gönder, Shift+Enter ile yeni satır
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}