import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, TrendingUp, Users, Gift, Percent, Calendar, Target, Award, BarChart3, Eye, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { format } from 'date-fns';

// Bonus Form Component
const BonusForm = ({ bonus = null, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    name: bonus?.name || '',
    type: bonus?.type || 'welcome',
    amount: bonus?.amount || 0,
    percentage: bonus?.percentage || 0,
    minDeposit: bonus?.min_deposit || 0,
    maxBonus: bonus?.max_bonus || 0,
    wageringRequirement: bonus?.wagering_requirement || 1,
    status: bonus?.status || 'active',
    validUntil: bonus?.valid_until ? format(new Date(bonus.valid_until), 'yyyy-MM-dd') : ''
  });

  const queryClient = useQueryClient();
  
  const mutation = useMutation({
    mutationFn: async (data) => {
      const url = bonus ? `/api/admin/bonuses/${bonus.id}` : '/api/admin/bonuses';
      const method = bonus ? 'PUT' : 'POST';
      return apiRequest(url, { method, body: JSON.stringify(data) });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bonuses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bonuses/stats'] });
      toast({
        title: bonus ? 'Bonus güncellendi' : 'Bonus oluşturuldu',
        description: 'İşlem başarıyla tamamlandı'
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'İşlem sırasında bir hata oluştu',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <DialogHeader>
        <DialogTitle>{bonus ? 'Bonus Düzenle' : 'Yeni Bonus Oluştur'}</DialogTitle>
      </DialogHeader>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Bonus Adı</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div>
          <Label htmlFor="type">Bonus Tipi</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="welcome">Hoş Geldin</SelectItem>
              <SelectItem value="reload">Reload</SelectItem>
              <SelectItem value="vip">VIP</SelectItem>
              <SelectItem value="cashback">Cashback</SelectItem>
              <SelectItem value="birthday">Doğum Günü</SelectItem>
              <SelectItem value="tournament">Turnuva</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="amount">Sabit Miktar (₺)</Label>
          <Input
            id="amount"
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="percentage">Yüzde (%)</Label>
          <Input
            id="percentage"
            type="number"
            value={formData.percentage}
            onChange={(e) => setFormData({ ...formData, percentage: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="minDeposit">Minimum Yatırım (₺)</Label>
          <Input
            id="minDeposit"
            type="number"
            value={formData.minDeposit}
            onChange={(e) => setFormData({ ...formData, minDeposit: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="maxBonus">Maksimum Bonus (₺)</Label>
          <Input
            id="maxBonus"
            type="number"
            value={formData.maxBonus}
            onChange={(e) => setFormData({ ...formData, maxBonus: Number(e.target.value) })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="wageringRequirement">Çevrim Şartı</Label>
          <Input
            id="wageringRequirement"
            type="number"
            value={formData.wageringRequirement}
            onChange={(e) => setFormData({ ...formData, wageringRequirement: Number(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="validUntil">Bitiş Tarihi</Label>
          <Input
            id="validUntil"
            type="date"
            value={formData.validUntil}
            onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
          />
        </div>
      </div>

      <div>
        <Label htmlFor="status">Durum</Label>
        <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Pasif</SelectItem>
            <SelectItem value="upcoming">Yakında</SelectItem>
            <SelectItem value="expired">Süresi Dolmuş</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          İptal
        </Button>
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? 'Kaydediliyor...' : bonus ? 'Güncelle' : 'Oluştur'}
        </Button>
      </div>
    </form>
  );
};

const AdminBonuses = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBonus, setEditingBonus] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const queryClient = useQueryClient();

  // Bonus listesini çek - gerçek PostgreSQL verisi
  const { data: bonusesData, isLoading, error } = useQuery({
    queryKey: ['/api/admin/bonuses'],
    retry: 2,
    staleTime: 30000
  });

  // Bonus istatistiklerini çek - otantik veritabanı metrikleri
  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/admin/bonuses/stats'],
    retry: 2,
    refetchInterval: 60000
  });

  const bonuses = bonusesData?.data || [];
  const stats = statsData?.stats || {};

  // Gelişmiş filtreleme sistemi
  const filteredBonuses = bonuses.filter(bonus => {
    const matchesSearch = bonus.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || bonus.type === filterType;
    const matchesStatus = selectedStatus === 'all' || bonus.status === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  // Bonus tiplerinin renk kodları
  const getBonusTypeColor = (type) => {
    const colors = {
      welcome: 'bg-green-500',
      reload: 'bg-blue-500', 
      vip: 'bg-purple-500',
      cashback: 'bg-orange-500',
      birthday: 'bg-pink-500',
      tournament: 'bg-indigo-500'
    };
    return colors[type] || 'bg-gray-500';
  };

  // Bonus değerini formatla
  const formatBonusValue = (bonus) => {
    if (bonus.percentage > 0) {
      return `${bonus.percentage}%`;
    }
    return `₺${bonus.amount?.toLocaleString() || 0}`;
  };

  // Bonus silme
  const deleteMutation = useMutation({
    mutationFn: async (bonusId) => {
      return apiRequest(`/api/admin/bonuses/${bonusId}`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bonuses'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/bonuses/stats'] });
      toast({
        title: 'Bonus silindi',
        description: 'Bonus başarıyla silindi'
      });
    },
    onError: () => {
      toast({
        title: 'Hata',
        description: 'Bonus silinirken bir hata oluştu',
        variant: 'destructive'
      });
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Professional Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                <Gift className="h-8 w-8 text-purple-600" />
                Bonus Yönetimi
              </h1>
              <p className="text-gray-600">Profesyonel bonus sistemi - PostgreSQL veritabanı entegrasyonu</p>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-green-600 border-green-200">
                  ✓ Gerçek Veri
                </Badge>
                <Badge variant="outline" className="text-blue-600 border-blue-200">
                  PostgreSQL
                </Badge>
                <Badge variant="outline" className="text-purple-600 border-purple-200">
                  {filteredBonuses.length} Bonus
                </Badge>
              </div>
            </div>
            <Button 
              onClick={() => setShowAnalytics(!showAnalytics)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <BarChart3 className="h-4 w-4" />
              {showAnalytics ? 'Gizle' : 'Analytics'}
            </Button>
          </div>
        </div>

        {/* Gelişmiş İstatistik Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-l-4 border-l-blue-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Bonus Şablonu</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.totalBonuses || 0}</p>
                  <p className="text-xs text-blue-600 mt-1">+{stats.monthlyGrowth || 0}% bu ay</p>
                </div>
                <Gift className="h-10 w-10 text-blue-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Aktif Bonuslar</p>
                  <p className="text-3xl font-bold text-gray-900">{stats.activeBonuses || 0}</p>
                  <p className="text-xs text-green-600 mt-1">Şu anda kullanılabilir</p>
                </div>
                <TrendingUp className="h-10 w-10 text-green-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Talep Oranı</p>
                  <p className="text-3xl font-bold text-gray-900">{Number(stats.conversionRate || 0).toFixed(1)}%</p>
                  <p className="text-xs text-purple-600 mt-1">Ortalama dönüşüm</p>
                </div>
                <Target className="h-10 w-10 text-purple-600 opacity-80" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-orange-500 hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Toplam Değer</p>
                  <p className="text-3xl font-bold text-gray-900">₺{Number(stats.totalValue || 0).toLocaleString()}</p>
                  <p className="text-xs text-orange-600 mt-1">{stats.totalClaimed || 0} kez talep edildi</p>
                </div>
                <Award className="h-10 w-10 text-orange-600 opacity-80" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Analytics Panel */}
        {showAnalytics && (
          <Card className="mb-8 border-purple-200">
            <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50">
              <CardTitle className="flex items-center gap-2 text-purple-800">
                <BarChart3 className="h-5 w-5" />
                Bonus Performans Analizi
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.totalClaimed || 0}</div>
                  <div className="text-sm text-green-700">Toplam Kullanım</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{Number(stats.conversionRate || 0).toFixed(2)}%</div>
                  <div className="text-sm text-blue-700">Dönüşüm Oranı</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">₺{Number(stats.totalValue || 0).toLocaleString()}</div>
                  <div className="text-sm text-purple-700">Ekonomik Etki</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Gelişmiş Arama ve Filtre Sistemi */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <Label htmlFor="search" className="text-sm font-medium text-gray-700 mb-2 block">
                  Bonus Arama
                </Label>
                <Input
                  id="search"
                  placeholder="Bonus adı veya açıklama ile ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Bonus Tipi
                </Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tüm tipler" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Tipler</SelectItem>
                    <SelectItem value="welcome">Hoş Geldin Bonusu</SelectItem>
                    <SelectItem value="reload">Reload Bonusu</SelectItem>
                    <SelectItem value="vip">VIP Bonus</SelectItem>
                    <SelectItem value="cashback">Cashback</SelectItem>
                    <SelectItem value="birthday">Doğum Günü</SelectItem>
                    <SelectItem value="tournament">Turnuva</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700 mb-2 block">
                  Durum
                </Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tüm durumlar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tüm Durumlar</SelectItem>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">Pasif</SelectItem>
                    <SelectItem value="upcoming">Yakında</SelectItem>
                    <SelectItem value="expired">Süresi Dolmuş</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t">
              <div className="text-sm text-gray-600">
                {filteredBonuses.length} bonus bulundu
              </div>
              <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700">
                    <Plus className="h-4 w-4" />
                    Yeni Bonus Oluştur
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <BonusForm onSuccess={() => setIsCreateModalOpen(false)} onCancel={() => setIsCreateModalOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Profesyonel Bonus Listesi */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {isLoading ? (
            [...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="h-16 bg-gray-200 rounded mb-4"></div>
                  <div className="flex justify-between items-center">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="flex gap-2">
                      <div className="h-8 bg-gray-200 rounded w-8"></div>
                      <div className="h-8 bg-gray-200 rounded w-8"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : error ? (
            <div className="col-span-full text-center py-12">
              <div className="text-red-500 mb-4">
                <Trash2 className="h-12 w-12 mx-auto mb-2" />
                <p className="text-lg font-medium">Veri yüklenemedi</p>
                <p className="text-sm text-gray-500">Lütfen sayfayı yenileyin</p>
              </div>
            </div>
          ) : filteredBonuses.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Gift className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-xl font-medium text-gray-600 mb-2">Bonus bulunamadı</p>
              <p className="text-gray-400 mb-6">
                {searchTerm || filterType !== 'all' || selectedStatus !== 'all' 
                  ? 'Arama kriterlerinize uygun bonus bulunamadı'
                  : 'Henüz bonus eklenmemiş'
                }
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm('');
                  setFilterType('all');
                  setSelectedStatus('all');
                }}
                variant="outline"
              >
                Filtreleri Temizle
              </Button>
            </div>
          ) : (
            filteredBonuses.map((bonus) => (
              <Card key={bonus.id} className="hover:shadow-lg transition-all duration-200 border-l-4" style={{borderLeftColor: getBonusTypeColor(bonus.type)?.replace('bg-', '#')}}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-900 mb-1">
                        {bonus.name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={`${getBonusTypeColor(bonus.type)} text-white text-xs px-2 py-1`}
                        >
                          {bonus.type.toUpperCase()}
                        </Badge>
                        <Badge 
                          variant={bonus.status === 'active' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {bonus.status === 'active' ? '✓ Aktif' : '⏸ Pasif'}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-purple-600">
                        {formatBonusValue(bonus)}
                      </div>
                      {bonus.max_bonus > 0 && (
                        <div className="text-xs text-gray-500">
                          Max: ₺{bonus.max_bonus.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Min. Yatırım:</span>
                        <div className="font-medium">₺{Number(bonus.min_deposit || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Çevrim Şartı:</span>
                        <div className="font-medium">{bonus.wagering_requirement || 1}x</div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Kullanım:</span>
                        <div className="font-medium text-green-600">{bonus.total_claimed || 0} kez</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Dönüşüm:</span>
                        <div className="font-medium text-blue-600">{Number(bonus.conversion_rate || 0).toFixed(1)}%</div>
                      </div>
                    </div>

                    {bonus.valid_until && (
                      <div className="text-sm">
                        <span className="text-gray-500">Bitiş:</span>
                        <div className="font-medium text-orange-600">
                          {format(new Date(bonus.valid_until), 'dd.MM.yyyy')}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t">
                      <div className="text-xs text-gray-400">
                        ID: {bonus.id}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setEditingBonus(bonus)}
                          className="flex items-center gap-1"
                        >
                          <Edit className="h-3 w-3" />
                          Düzenle
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => deleteMutation.mutate(bonus.id)}
                          disabled={deleteMutation.isPending}
                          className="text-red-600 hover:bg-red-50 flex items-center gap-1"
                        >
                          <Trash2 className="h-3 w-3" />
                          Sil
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Modal */}
        {editingBonus && (
          <Dialog open={!!editingBonus} onOpenChange={() => setEditingBonus(null)}>
            <DialogContent className="sm:max-w-lg">
              <BonusForm 
                bonus={editingBonus} 
                onSuccess={() => setEditingBonus(null)} 
                onCancel={() => setEditingBonus(null)} 
              />
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default AdminBonuses;