import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { CalendarIcon, X, Filter, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { tr, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';

interface FilterState {
  searchTerm: string;
  statusFilter: string;
  paymentMethodFilter: string;
  dateFromFilter: string;
  dateToFilter: string;
  amountMinFilter: string;
  amountMaxFilter: string;
  vipLevelFilter: string;
  userTypeFilter: string;
}

interface AdvancedFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  type: 'deposits' | 'withdrawals';
}

export function AdvancedFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters, 
  activeFilterCount,
  type 
}: AdvancedFiltersProps) {
  const { t, language } = useLanguage();
  const [dateFromOpen, setDateFromOpen] = useState(false);
  const [dateToOpen, setDateToOpen] = useState(false);

  const updateFilter = (key: keyof FilterState, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const statusOptions = type === 'deposits' ? [
    { value: 'all', label: 'Tüm Durumlar' },
    { value: 'pending', label: 'Bekleyen' },
    { value: 'approved', label: 'Onaylanmış' },
    { value: 'rejected', label: 'Reddedilen' },
    { value: 'completed', label: 'Tamamlanmış' }
  ] : [
    { value: 'all', label: 'Tüm Durumlar' },
    { value: 'pending', label: 'Bekleyen' },
    { value: 'approved', label: 'Onaylanmış' },
    { value: 'processing', label: 'İşleniyor' },
    { value: 'completed', label: 'Tamamlanmış' },
    { value: 'rejected', label: 'Reddedilen' },
    { value: 'failed', label: 'Başarısız' }
  ];

  const paymentMethodOptions = [
    { value: 'all', label: 'Tüm Yöntemler' },
    { value: 'Bank Transfer', label: 'Banka Transferi' },
    { value: 'Credit Card', label: 'Kredi Kartı' },
    { value: 'E-Wallet', label: 'E-Cüzdan' },
    { value: 'Cryptocurrency', label: 'Kripto Para' },
    { value: 'Other', label: 'Diğer' }
  ];

  const vipLevelOptions = [
    { value: 'all', label: 'Tüm VIP Seviyeleri' },
    { value: '0', label: 'VIP 0' },
    { value: '1', label: 'VIP 1' },
    { value: '2', label: 'VIP 2' },
    { value: '3', label: 'VIP 3' },
    { value: '4', label: 'VIP 4' },
    { value: '5', label: 'VIP 5+' }
  ];

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Gelişmiş Filtreler
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                {activeFilterCount} aktif filtre
              </Badge>
            )}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-400 hover:text-white"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Temizle
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Arama ve Hızlı Filtreler */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Kullanıcı/Email Ara</Label>
            <Input
              placeholder="Kullanıcı adı veya email..."
              value={filters.searchTerm}
              onChange={(e) => updateFilter('searchTerm', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Durum</Label>
            <Select value={filters.statusFilter} onValueChange={(value) => updateFilter('statusFilter', value)}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Ödeme Yöntemi</Label>
            <Select value={filters.paymentMethodFilter} onValueChange={(value) => updateFilter('paymentMethodFilter', value)}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {paymentMethodOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-white">VIP Seviye</Label>
            <Select value={filters.vipLevelFilter} onValueChange={(value) => updateFilter('vipLevelFilter', value)}>
              <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-600">
                {vipLevelOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value} className="text-white">
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tarih ve Miktar Filtreleri */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label className="text-white">Başlangıç Tarihi</Label>
            <Popover open={dateFromOpen} onOpenChange={setDateFromOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-gray-700 border-gray-600",
                    !filters.dateFromFilter && "text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateFromFilter ? (
                    format(new Date(filters.dateFromFilter), "dd.MM.yyyy", {
                      locale: language === 'tr' ? tr : enUS
                    })
                  ) : (
                    "Tarih seçin"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateFromFilter ? new Date(filters.dateFromFilter) : undefined}
                  onSelect={(date) => {
                    updateFilter('dateFromFilter', date ? date.toISOString().split('T')[0] : '');
                    setDateFromOpen(false);
                  }}
                  initialFocus
                  className="bg-gray-800"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Bitiş Tarihi</Label>
            <Popover open={dateToOpen} onOpenChange={setDateToOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-gray-700 border-gray-600",
                    !filters.dateToFilter && "text-gray-400"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {filters.dateToFilter ? (
                    format(new Date(filters.dateToFilter), "dd.MM.yyyy", {
                      locale: language === 'tr' ? tr : enUS
                    })
                  ) : (
                    "Tarih seçin"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-gray-800 border-gray-600" align="start">
                <Calendar
                  mode="single"
                  selected={filters.dateToFilter ? new Date(filters.dateToFilter) : undefined}
                  onSelect={(date) => {
                    updateFilter('dateToFilter', date ? date.toISOString().split('T')[0] : '');
                    setDateToOpen(false);
                  }}
                  initialFocus
                  className="bg-gray-800"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label className="text-white">Min Miktar (₺)</Label>
            <Input
              type="number"
              placeholder="0"
              value={filters.amountMinFilter}
              onChange={(e) => updateFilter('amountMinFilter', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-white">Max Miktar (₺)</Label>
            <Input
              type="number"
              placeholder="∞"
              value={filters.amountMaxFilter}
              onChange={(e) => updateFilter('amountMaxFilter', e.target.value)}
              className="bg-gray-700 border-gray-600 text-white"
            />
          </div>
        </div>

        {/* Aktif Filtreler */}
        {activeFilterCount > 0 && (
          <div className="space-y-2">
            <Label className="text-white">Aktif Filtreler:</Label>
            <div className="flex flex-wrap gap-2">
              {filters.searchTerm && (
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 flex items-center gap-1">
                  Arama: {filters.searchTerm}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('searchTerm', '')} />
                </Badge>
              )}
              {filters.statusFilter !== 'all' && (
                <Badge variant="secondary" className="bg-green-500/20 text-green-300 flex items-center gap-1">
                  Durum: {statusOptions.find(s => s.value === filters.statusFilter)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('statusFilter', 'all')} />
                </Badge>
              )}
              {filters.paymentMethodFilter !== 'all' && (
                <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 flex items-center gap-1">
                  Yöntem: {paymentMethodOptions.find(p => p.value === filters.paymentMethodFilter)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('paymentMethodFilter', 'all')} />
                </Badge>
              )}
              {filters.vipLevelFilter !== 'all' && (
                <Badge variant="secondary" className="bg-yellow-500/20 text-yellow-300 flex items-center gap-1">
                  VIP: {vipLevelOptions.find(v => v.value === filters.vipLevelFilter)?.label}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => updateFilter('vipLevelFilter', 'all')} />
                </Badge>
              )}
              {(filters.amountMinFilter || filters.amountMaxFilter) && (
                <Badge variant="secondary" className="bg-orange-500/20 text-orange-300 flex items-center gap-1">
                  Miktar: {filters.amountMinFilter || '0'} - {filters.amountMaxFilter || '∞'} ₺
                  <X className="h-3 w-3 cursor-pointer" onClick={() => {
                    updateFilter('amountMinFilter', '');
                    updateFilter('amountMaxFilter', '');
                  }} />
                </Badge>
              )}
              {(filters.dateFromFilter || filters.dateToFilter) && (
                <Badge variant="secondary" className="bg-indigo-500/20 text-indigo-300 flex items-center gap-1">
                  Tarih: {filters.dateFromFilter ? format(new Date(filters.dateFromFilter), 'dd.MM.yyyy') : '∞'} - {filters.dateToFilter ? format(new Date(filters.dateToFilter), 'dd.MM.yyyy') : '∞'}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => {
                    updateFilter('dateFromFilter', '');
                    updateFilter('dateToFilter', '');
                  }} />
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}