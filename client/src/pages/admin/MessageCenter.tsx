import React, { useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  MessageSquare, 
  Plus, 
  Send, 
  Trash, 
  Search, 
  Filter, 
  Clock,
  Users,
  Eye,
  Bell,
  CheckSquare,
  X,
  Mail,
  Save,
  MailOpen
} from 'lucide-react';

// Mesaj tipi
type Message = {
  id: number;
  subject: string;
  content: string;
  sender: string;
  recipient: string;
  type: 'admin' | 'system' | 'support' | 'user';
  status: 'unread' | 'read' | 'answered' | 'archived';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: string;
  created: string;
  updated: string;
  replies?: Message[];
};

// Toplu mesaj hedefleri
type BroadcastTarget = {
  id: string;
  name: string;
  description: string;
  count: number;
};

const MessageCenter: React.FC = () => {
  const { translate } = useLanguage();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('inbox');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isComposing, setIsComposing] = useState(false);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    recipient: '',
    category: 'general',
    priority: 'medium'
  });
  const [newBroadcast, setNewBroadcast] = useState({
    subject: '',
    content: '',
    targetGroups: [] as string[],
    sendEmail: true,
    sendPush: true,
    sendInbox: true,
    priority: 'medium',
    category: 'announcement'
  });
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  
  // Örnek mesajlar
  const messages: Message[] = [
    {
      id: 1,
      subject: 'Para çekme işlemim hakkında',
      content: 'Merhaba, dün yaptığım para çekme işlemi hala beklemede görünüyor. Ne zaman işleme alınacak acaba?',
      sender: 'user123',
      recipient: 'admin',
      type: 'user',
      status: 'unread',
      priority: 'medium',
      category: 'payment',
      created: '2023-05-19 14:32:15',
      updated: '2023-05-19 14:32:15'
    },
    {
      id: 2,
      subject: 'Hesap doğrulama sorunu',
      content: 'Kimlik doğrulama işlemini tamamladım ancak hesabım hala doğrulanmamış görünüyor. Yardımcı olabilir misiniz?',
      sender: 'newplayer55',
      recipient: 'admin',
      type: 'user',
      status: 'read',
      priority: 'high',
      category: 'account',
      created: '2023-05-18 10:11:23',
      updated: '2023-05-19 09:15:42'
    },
    {
      id: 3,
      subject: 'RE: Hesap doğrulama sorunu',
      content: 'Merhaba, hesabınızı kontrol ettik. Kimlik belgenizin daha net bir fotoğrafını yüklemeniz gerekiyor. Yardımcı olmak için buradayız.',
      sender: 'admin',
      recipient: 'newplayer55',
      type: 'admin',
      status: 'answered',
      priority: 'high',
      category: 'account',
      created: '2023-05-19 09:15:42',
      updated: '2023-05-19 09:15:42'
    },
    {
      id: 4,
      subject: 'Sistem Bakım Bildirimi',
      content: 'Değerli üyelerimiz, sistemlerimizde planlı bakım çalışması nedeniyle 21 Mayıs 2023 tarihinde 02:00-05:00 saatleri arasında hizmetlerimiz geçici olarak kesintiye uğrayacaktır.',
      sender: 'system',
      recipient: 'all_users',
      type: 'system',
      status: 'read',
      priority: 'medium',
      category: 'announcement',
      created: '2023-05-15 11:00:00',
      updated: '2023-05-15 11:00:00'
    },
    {
      id: 5,
      subject: 'Bonus tanımlama hatası',
      content: 'Hoşgeldin bonusu tanımlamasında sorun yaşıyorum. Hesabıma yatırım yaptım ancak bonus tanımlanmadı.',
      sender: 'player777',
      recipient: 'admin',
      type: 'user',
      status: 'unread',
      priority: 'high',
      category: 'bonus',
      created: '2023-05-20 08:14:55',
      updated: '2023-05-20 08:14:55'
    }
  ];
  
  // Toplu mesaj hedefleri
  const broadcastTargets: BroadcastTarget[] = [
    { id: 'all_users', name: 'Tüm Kullanıcılar', description: 'Platformdaki tüm kayıtlı kullanıcılar', count: 3546 },
    { id: 'active_users', name: 'Aktif Kullanıcılar', description: 'Son 30 günde giriş yapmış kullanıcılar', count: 1852 },
    { id: 'vip_users', name: 'VIP Kullanıcılar', description: 'Tüm VIP seviyesindeki kullanıcılar', count: 124 },
    { id: 'new_users', name: 'Yeni Kullanıcılar', description: 'Son 7 günde kayıt olmuş kullanıcılar', count: 215 },
    { id: 'inactive_users', name: 'Pasif Kullanıcılar', description: '30 gündür giriş yapmamış kullanıcılar', count: 860 }
  ];
  
  // Filtrelenmiş mesajlar
  const filteredMessages = messages.filter(message => {
    // Sekme filtresi
    const tabMatch = 
      (activeTab === 'inbox' && message.type === 'user') ||
      (activeTab === 'sent' && message.type === 'admin') ||
      (activeTab === 'system' && message.type === 'system') ||
      activeTab === 'all';
    
    // Arama filtresi
    const searchMatch = 
      searchTerm === '' || 
      message.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      message.sender.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Durum filtresi
    const statusMatch = statusFilter === 'all' || message.status === statusFilter;
    
    // Kategori filtresi
    const categoryMatch = categoryFilter === 'all' || message.category === categoryFilter;
    
    return tabMatch && searchMatch && statusMatch && categoryMatch;
  });
  
  // Mesaj görüntüleme
  const handleViewMessage = (message: Message) => {
    setSelectedMessage(message);
    
    // Mesajı okundu olarak işaretle (gerçek uygulamada API çağrısı olur)
    if (message.status === 'unread') {
      toast({
        title: "Mesaj okundu olarak işaretlendi",
        description: "Mesaj durumu güncellendi.",
      });
    }
  };
  
  // Mesaj cevaplama
  const handleReplyMessage = () => {
    if (!selectedMessage) return;
    
    setIsComposing(true);
    setNewMessage({
      subject: `RE: ${selectedMessage.subject}`,
      content: '',
      recipient: selectedMessage.sender,
      category: selectedMessage.category,
      priority: selectedMessage.priority
    });
    
    setSelectedMessage(null);
  };
  
  // Yeni mesaj gönderme
  const handleSendMessage = () => {
    toast({
      title: "Mesaj Gönderildi",
      description: "Mesajınız başarıyla gönderildi.",
    });
    
    setIsComposing(false);
    setNewMessage({
      subject: '',
      content: '',
      recipient: '',
      category: 'general',
      priority: 'medium'
    });
  };
  
  // Toplu mesaj gönderme
  const handleSendBroadcast = () => {
    const targetCount = newBroadcast.targetGroups.reduce((acc, target) => {
      const found = broadcastTargets.find(t => t.id === target);
      return acc + (found ? found.count : 0);
    }, 0);
    
    toast({
      title: "Toplu Mesaj Gönderildi",
      description: `Mesaj ${targetCount} kullanıcıya başarıyla gönderildi.`,
    });
    
    setIsBroadcasting(false);
    setNewBroadcast({
      subject: '',
      content: '',
      targetGroups: [],
      sendEmail: true,
      sendPush: true,
      sendInbox: true,
      priority: 'medium',
      category: 'announcement'
    });
  };
  
  // Mesaj silme
  const handleDeleteMessage = (id: number) => {
    toast({
      title: "Mesaj Silindi",
      description: "Mesaj başarıyla silindi.",
      variant: "destructive",
    });
    
    if (selectedMessage?.id === id) {
      setSelectedMessage(null);
    }
  };
  
  // Mesaj arşivleme
  const handleArchiveMessage = (id: number) => {
    toast({
      title: "Mesaj Arşivlendi",
      description: "Mesaj başarıyla arşivlendi.",
    });
    
    if (selectedMessage?.id === id) {
      setSelectedMessage(null);
    }
  };
  
  // Mesaj durum rengi
  const getMessageStatusColor = (status: string) => {
    switch (status) {
      case 'unread':
        return 'bg-yellow-500 text-black';
      case 'read':
        return 'bg-blue-500';
      case 'answered':
        return 'bg-green-500';
      case 'archived':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Öncelik rengi
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-500';
      case 'medium':
        return 'bg-yellow-500 text-black';
      case 'high':
        return 'bg-orange-500';
      case 'urgent':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Şeçilen toplu mesaj hedef grubu mu?
  const isTargetSelected = (targetId: string) => {
    return newBroadcast.targetGroups.includes(targetId);
  };
  
  // Toplu mesaj hedef grubu seçme
  const toggleTargetGroup = (targetId: string) => {
    if (isTargetSelected(targetId)) {
      setNewBroadcast({
        ...newBroadcast,
        targetGroups: newBroadcast.targetGroups.filter(id => id !== targetId)
      });
    } else {
      setNewBroadcast({
        ...newBroadcast,
        targetGroups: [...newBroadcast.targetGroups, targetId]
      });
    }
  };

  return (
    <AdminLayout title="Mesaj Merkezi">
      <div className="container mx-auto p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Mesaj Merkezi</h1>
            <p className="text-gray-400">Kullanıcı mesajları, sistem bildirimleri ve toplu mesajlar</p>
          </div>
          
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsComposing(true)} 
              className="bg-yellow-500 hover:bg-yellow-600 text-black flex items-center gap-2"
            >
              <Plus size={16} />
              Yeni Mesaj
            </Button>
            <Button 
              onClick={() => setIsBroadcasting(true)} 
              className="bg-yellow-500 hover:bg-yellow-600 text-black flex items-center gap-2"
            >
              <Users size={16} />
              Toplu Mesaj
            </Button>
          </div>
        </div>
        
        {isComposing ? (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Yeni Mesaj</CardTitle>
              <CardDescription>
                Kullanıcılara özel mesaj gönderin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Alıcı</label>
                  <Input 
                    value={newMessage.recipient}
                    onChange={(e) => setNewMessage({...newMessage, recipient: e.target.value})}
                    className="bg-gray-900 border-gray-700"
                    placeholder="Kullanıcı adı"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Konu</label>
                  <Input 
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage({...newMessage, subject: e.target.value})}
                    className="bg-gray-900 border-gray-700"
                    placeholder="Mesaj konusu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Kategori</label>
                  <select 
                    value={newMessage.category}
                    onChange={(e) => setNewMessage({...newMessage, category: e.target.value})}
                    className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                  >
                    <option value="general">Genel</option>
                    <option value="account">Hesap</option>
                    <option value="payment">Ödeme</option>
                    <option value="bonus">Bonus</option>
                    <option value="technical">Teknik</option>
                    <option value="security">Güvenlik</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Öncelik</label>
                  <select 
                    value={newMessage.priority}
                    onChange={(e) => setNewMessage({...newMessage, priority: e.target.value as any})}
                    className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                    <option value="urgent">Acil</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Mesaj</label>
                <Textarea 
                  value={newMessage.content}
                  onChange={(e) => setNewMessage({...newMessage, content: e.target.value})}
                  className="bg-gray-900 border-gray-700 min-h-40"
                  placeholder="Mesaj içeriği..."
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                className="border-gray-700"
                onClick={() => setIsComposing(false)}
              >
                İptal
              </Button>
              <Button 
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
                onClick={handleSendMessage}
              >
                <Send className="h-4 w-4 mr-2" />
                Gönder
              </Button>
            </CardFooter>
          </Card>
        ) : isBroadcasting ? (
          <Card className="bg-gray-800 border-gray-700 mb-6">
            <CardHeader>
              <CardTitle className="text-white">Toplu Mesaj</CardTitle>
              <CardDescription>
                Kullanıcı gruplarına bildirim ve mesaj gönderin
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Konu</label>
                  <Input 
                    value={newBroadcast.subject}
                    onChange={(e) => setNewBroadcast({...newBroadcast, subject: e.target.value})}
                    className="bg-gray-900 border-gray-700"
                    placeholder="Bildirim konusu"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Kategori</label>
                  <select 
                    value={newBroadcast.category}
                    onChange={(e) => setNewBroadcast({...newBroadcast, category: e.target.value})}
                    className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                  >
                    <option value="announcement">Duyuru</option>
                    <option value="promotion">Promosyon</option>
                    <option value="system">Sistem</option>
                    <option value="maintenance">Bakım</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Öncelik</label>
                  <select 
                    value={newBroadcast.priority}
                    onChange={(e) => setNewBroadcast({...newBroadcast, priority: e.target.value as any})}
                    className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                  >
                    <option value="low">Düşük</option>
                    <option value="medium">Orta</option>
                    <option value="high">Yüksek</option>
                    <option value="urgent">Acil</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-1">Gönderim Kanalları</label>
                  <div className="flex gap-6 mt-2">
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="send-inbox"
                        checked={newBroadcast.sendInbox}
                        onCheckedChange={(checked) => setNewBroadcast({...newBroadcast, sendInbox: checked})}
                      />
                      <label htmlFor="send-inbox" className="text-sm text-gray-300">
                        <MessageSquare className="h-4 w-4 inline-block mr-1" /> Site Mesajı
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="send-email"
                        checked={newBroadcast.sendEmail}
                        onCheckedChange={(checked) => setNewBroadcast({...newBroadcast, sendEmail: checked})}
                      />
                      <label htmlFor="send-email" className="text-sm text-gray-300">
                        <Mail className="h-4 w-4 inline-block mr-1" /> E-posta
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch 
                        id="send-push"
                        checked={newBroadcast.sendPush}
                        onCheckedChange={(checked) => setNewBroadcast({...newBroadcast, sendPush: checked})}
                      />
                      <label htmlFor="send-push" className="text-sm text-gray-300">
                        <Bell className="h-4 w-4 inline-block mr-1" /> Push Bildirimi
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Hedef Gruplar</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                  {broadcastTargets.map(target => (
                    <Card 
                      key={target.id} 
                      className={`bg-gray-900 border-gray-700 cursor-pointer transition-all ${
                        isTargetSelected(target.id) ? 'border-yellow-500 border-2' : ''
                      }`}
                      onClick={() => toggleTargetGroup(target.id)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="text-sm font-medium text-white">{target.name}</h3>
                            <p className="text-xs text-gray-400">{target.description}</p>
                          </div>
                          <Badge className="bg-blue-500">{target.count}</Badge>
                        </div>
                        {isTargetSelected(target.id) && (
                          <div className="mt-2 text-xs text-yellow-500">
                            <CheckSquare className="h-4 w-4 inline-block mr-1" /> Seçildi
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
                {newBroadcast.targetGroups.length > 0 && (
                  <div className="mt-3 text-sm text-gray-400">
                    Toplam Hedef: {newBroadcast.targetGroups.reduce((acc, target) => {
                      const found = broadcastTargets.find(t => t.id === target);
                      return acc + (found ? found.count : 0);
                    }, 0)} kullanıcı
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Mesaj</label>
                <Textarea 
                  value={newBroadcast.content}
                  onChange={(e) => setNewBroadcast({...newBroadcast, content: e.target.value})}
                  className="bg-gray-900 border-gray-700 min-h-40"
                  placeholder="Bildirim içeriği..."
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                className="border-gray-700"
                onClick={() => setIsBroadcasting(false)}
              >
                İptal
              </Button>
              <Button 
                className="bg-yellow-500 hover:bg-yellow-600 text-black"
                onClick={handleSendBroadcast}
                disabled={newBroadcast.targetGroups.length === 0}
              >
                <Send className="h-4 w-4 mr-2" />
                Toplu Mesaj Gönder
              </Button>
            </CardFooter>
          </Card>
        ) : (
          <>
            <Card className="bg-gray-800 border-gray-700 mb-6">
              <CardHeader>
                <CardTitle className="text-white">Filtreler</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Mesaj Ara</label>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      <Input 
                        placeholder="Konu, içerik veya gönderen ara..."
                        className="bg-gray-900 border-gray-700 pl-9"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Durum Filtresi</label>
                    <select 
                      className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">Tüm Durumlar</option>
                      <option value="unread">Okunmamış</option>
                      <option value="read">Okunmuş</option>
                      <option value="answered">Yanıtlanmış</option>
                      <option value="archived">Arşivlenmiş</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-300">Kategori Filtresi</label>
                    <select 
                      className="w-full h-10 rounded-md border border-gray-700 bg-gray-900 px-3 py-2 text-sm text-white"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                      <option value="all">Tüm Kategoriler</option>
                      <option value="account">Hesap</option>
                      <option value="payment">Ödeme</option>
                      <option value="bonus">Bonus</option>
                      <option value="technical">Teknik</option>
                      <option value="security">Güvenlik</option>
                      <option value="announcement">Duyuru</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2 flex items-end">
                    <Button 
                      variant="outline" 
                      className="border-gray-700 w-full"
                      onClick={() => {
                        setSearchTerm('');
                        setStatusFilter('all');
                        setCategoryFilter('all');
                      }}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      Filtreleri Temizle
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1">
                <Tabs defaultValue="inbox" value={activeTab} onValueChange={setActiveTab} className="w-full">
                  <TabsList className="bg-gray-800 border-b border-gray-700 mb-6 w-full justify-start">
                    <TabsTrigger 
                      value="inbox" 
                      className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
                    >
                      Gelen Kutusu
                    </TabsTrigger>
                    <TabsTrigger 
                      value="sent" 
                      className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
                    >
                      Gönderilen
                    </TabsTrigger>
                    <TabsTrigger 
                      value="system" 
                      className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
                    >
                      Sistem
                    </TabsTrigger>
                    <TabsTrigger 
                      value="all" 
                      className="data-[state=active]:bg-yellow-500 data-[state=active]:text-black"
                    >
                      Tümü
                    </TabsTrigger>
                  </TabsList>
                  
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="py-3">
                      <CardTitle className="text-white text-lg flex justify-between">
                        <span>Mesajlar</span>
                        <Badge className="bg-blue-500">{filteredMessages.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="max-h-[70vh] overflow-y-auto">
                        {filteredMessages.length > 0 ? (
                          <div className="divide-y divide-gray-700">
                            {filteredMessages.map((message) => (
                              <div 
                                key={message.id}
                                className={`px-4 py-3 cursor-pointer hover:bg-gray-750 ${
                                  selectedMessage?.id === message.id ? 'bg-gray-750 border-l-4 border-yellow-500' : ''
                                }`}
                                onClick={() => handleViewMessage(message)}
                              >
                                <div className="flex justify-between items-start mb-1">
                                  <div className="text-sm font-medium text-white">
                                    {message.status === 'unread' && <span className="inline-block w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>}
                                    {message.subject}
                                  </div>
                                  <Badge className={getMessageStatusColor(message.status)}>
                                    {message.status === 'unread' ? 'Okunmamış' : 
                                     message.status === 'read' ? 'Okunmuş' : 
                                     message.status === 'answered' ? 'Yanıtlanmış' : 'Arşivlenmiş'}
                                  </Badge>
                                </div>
                                <div className="text-xs text-gray-400 mb-1 truncate">
                                  {message.content.substring(0, 60)}...
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                  <div className="text-gray-400">
                                    {message.type === 'user' ? `Gönderen: ${message.sender}` : 
                                     message.type === 'admin' ? `Alıcı: ${message.recipient}` : 'Sistem Mesajı'}
                                  </div>
                                  <div className="flex items-center text-gray-400">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {message.created.split(' ')[0]}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8">
                            <MailOpen className="h-12 w-12 text-gray-500 mb-2" />
                            <p className="text-gray-400">Mesaj bulunamadı</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Tabs>
              </div>
              
              <div className="lg:col-span-2">
                {selectedMessage ? (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3 border-b border-gray-700">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-white">{selectedMessage.subject}</CardTitle>
                          <CardDescription>
                            <span className="text-sm">
                              {selectedMessage.type === 'user' ? `Gönderen: ${selectedMessage.sender}` : 
                               selectedMessage.type === 'admin' ? `Alıcı: ${selectedMessage.recipient}` : 'Sistem Mesajı'}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getMessageStatusColor(selectedMessage.status)}>
                            {selectedMessage.status === 'unread' ? 'Okunmamış' : 
                             selectedMessage.status === 'read' ? 'Okunmuş' : 
                             selectedMessage.status === 'answered' ? 'Yanıtlanmış' : 'Arşivlenmiş'}
                          </Badge>
                          <Badge className={getPriorityColor(selectedMessage.priority)}>
                            {selectedMessage.priority === 'low' ? 'Düşük' : 
                             selectedMessage.priority === 'medium' ? 'Orta' : 
                             selectedMessage.priority === 'high' ? 'Yüksek' : 'Acil'}
                          </Badge>
                          <Badge variant="outline" className="border-gray-600">
                            {selectedMessage.category === 'account' ? 'Hesap' : 
                             selectedMessage.category === 'payment' ? 'Ödeme' : 
                             selectedMessage.category === 'bonus' ? 'Bonus' : 
                             selectedMessage.category === 'technical' ? 'Teknik' : 
                             selectedMessage.category === 'security' ? 'Güvenlik' : 
                             selectedMessage.category === 'announcement' ? 'Duyuru' : 'Genel'}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="py-4">
                      <div className="flex justify-between items-center text-sm text-gray-400 mb-4">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 mr-1" />
                          {selectedMessage.created}
                        </div>
                        {selectedMessage.updated !== selectedMessage.created && (
                          <div>Son güncelleme: {selectedMessage.updated}</div>
                        )}
                      </div>
                      <div className="text-white whitespace-pre-wrap">
                        {selectedMessage.content}
                      </div>
                      
                      {selectedMessage.replies && selectedMessage.replies.length > 0 && (
                        <div className="mt-6">
                          <h3 className="text-lg font-medium text-white mb-3">Yanıtlar</h3>
                          <div className="space-y-4">
                            {selectedMessage.replies.map((reply, index) => (
                              <div key={index} className="bg-gray-900 p-4 rounded-md border border-gray-700">
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <div className="text-white font-medium">{reply.subject}</div>
                                    <div className="text-sm text-gray-400">
                                      {reply.type === 'user' ? `Gönderen: ${reply.sender}` : 
                                       reply.type === 'admin' ? `Alıcı: ${reply.recipient}` : 'Sistem Mesajı'}
                                    </div>
                                  </div>
                                  <div className="text-sm text-gray-400">
                                    {reply.created}
                                  </div>
                                </div>
                                <div className="text-white mt-2 whitespace-pre-wrap">
                                  {reply.content}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          className="border-gray-700"
                          onClick={() => setSelectedMessage(null)}
                        >
                          Geri
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-gray-700 text-red-500"
                          onClick={() => handleDeleteMessage(selectedMessage.id)}
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Sil
                        </Button>
                        <Button 
                          variant="outline" 
                          className="border-gray-700"
                          onClick={() => handleArchiveMessage(selectedMessage.id)}
                        >
                          <CheckSquare className="h-4 w-4 mr-2" />
                          Arşivle
                        </Button>
                      </div>
                      {selectedMessage.type === 'user' && (
                        <Button 
                          className="bg-yellow-500 hover:bg-yellow-600 text-black"
                          onClick={handleReplyMessage}
                        >
                          <Send className="h-4 w-4 mr-2" />
                          Yanıtla
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ) : (
                  <Card className="bg-gray-800 border-gray-700 h-full">
                    <CardContent className="flex flex-col items-center justify-center h-full py-12">
                      <MessageSquare className="h-16 w-16 text-gray-500 mb-4" />
                      <h3 className="text-lg text-white font-medium mb-2">Mesaj seçilmedi</h3>
                      <p className="text-gray-400 text-center">
                        Bir mesajı görüntülemek için soldaki listeden seçin veya <br />
                        yeni bir mesaj oluşturmak için "Yeni Mesaj" düğmesine tıklayın.
                      </p>
                      <Button 
                        className="mt-6 bg-yellow-500 hover:bg-yellow-600 text-black"
                        onClick={() => setIsComposing(true)}
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Yeni Mesaj
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default MessageCenter;