import { useState } from 'react';
import { 
  Filter, 
  Search, 
  CheckCircle, 
  XCircle, 
  Ban, 
  Calendar, 
  DollarSign,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

export type FilterOptions = {
  searchTerm?: string;
  status?: string[];
  balanceRange?: [number, number];
  registrationDate?: string;
  loginDate?: string;
  role?: string;
  country?: string;
};

type Props = {
  onFilterChange: (filters: FilterOptions) => void;
  onSortChange: (field: string, order: 'asc' | 'desc') => void;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  currentFilters: FilterOptions;
};

export default function AdvancedFilter({ 
  onFilterChange, 
  onSortChange, 
  sortField, 
  sortOrder,
  currentFilters 
}: Props) {
  const { t } = useLanguage();
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>(currentFilters);
  const [searchTerm, setSearchTerm] = useState(currentFilters.searchTerm || '');
  
  // Yerel filtre değişikliklerini işle
  const handleFilterChange = (newFilters: Partial<FilterOptions>) => {
    const updatedFilters = {...filters, ...newFilters};
    setFilters(updatedFilters);
  };
  
  // Filtreleri uygula
  const applyFilters = () => {
    onFilterChange(filters);
    setIsFilterOpen(false);
  };
  
  // Filtreleri temizle
  const clearFilters = () => {
    const emptyFilters: FilterOptions = {
      searchTerm: '',
      status: [],
      balanceRange: [0, 100000],
      registrationDate: '',
      loginDate: '',
      role: '',
      country: ''
    };
    setFilters(emptyFilters);
    onFilterChange(emptyFilters);
    setSearchTerm('');
  };
  
  // Aktif filtre badge'leri
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.balanceRange && 
        (filters.balanceRange[0] > 0 || filters.balanceRange[1] < 100000)) count++;
    if (filters.registrationDate) count++;
    if (filters.loginDate) count++;
    if (filters.role) count++;
    if (filters.country) count++;
    return count;
  };
  
  // Hızlı arama
  const handleQuickSearch = () => {
    onFilterChange({...filters, searchTerm});
  };
  
  // Durum iconları
  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'inactive': return <XCircle className="h-4 w-4 text-gray-500" />;
      case 'suspended': return <Ban className="h-4 w-4 text-red-500" />;
      default: return null;
    }
  };
  
  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Hızlı Arama */}
      <div className="flex-grow relative min-w-[200px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
        <Input
          className="pl-10 bg-gray-800 border-gray-700 text-white"
          placeholder={t('admin.search_users') || "Kullanıcı ara..."}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleQuickSearch()}
        />
      </div>
      
      {/* Filtre Popover */}
      <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="relative border-gray-700 bg-gray-800/80 text-white hover:bg-gray-700"
          >
            <Filter className="mr-2 h-4 w-4" />
            {t('admin.filters') || 'Filtreler'}
            {getActiveFilterCount() > 0 && (
              <Badge 
                className="ml-2 px-1.5 py-0.5 bg-yellow-500 text-black absolute -top-2 -right-2"
              >
                {getActiveFilterCount()}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-[320px] bg-gray-800 border-gray-700 text-white p-0 overflow-hidden"
        >
          <div className="p-4 border-b border-gray-700 bg-yellow-500/10 flex justify-between items-center">
            <h3 className="font-medium text-white flex items-center">
              <Filter className="mr-2 h-4 w-4 text-yellow-500" />
              {t('admin.advanced_filters') || 'Gelişmiş Filtreler'}
            </h3>
            <button 
              onClick={() => setIsFilterOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          
          <div className="p-4 max-h-[500px] overflow-y-auto custom-yellow-scrollbar">
            <Accordion type="single" collapsible className="w-full">
              {/* Durum Filtreleri */}
              <AccordionItem value="status" className="border-gray-700">
                <AccordionTrigger className="py-3 text-sm hover:no-underline">
                  <span className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-yellow-500" />
                    {t('admin.user_status') || 'Kullanıcı Durumu'}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 p-1">
                    {['active', 'inactive', 'suspended'].map((status) => (
                      <div key={status} className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id={`status-${status}`}
                          className="rounded-sm border-gray-500 bg-gray-700 text-yellow-500 focus:ring-yellow-500"
                          checked={filters.status?.includes(status)}
                          onChange={(e) => {
                            const newStatus = filters.status || [];
                            if (e.target.checked) {
                              handleFilterChange({status: [...newStatus, status]});
                            } else {
                              handleFilterChange({
                                status: newStatus.filter(s => s !== status)
                              });
                            }
                          }}
                        />
                        <label 
                          htmlFor={`status-${status}`}
                          className="flex items-center text-sm cursor-pointer"
                        >
                          {getStatusIcon(status)}
                          <span className="ml-2 capitalize">
                            {status}
                          </span>
                        </label>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Bakiye Aralığı */}
              <AccordionItem value="balance" className="border-gray-700">
                <AccordionTrigger className="py-3 text-sm hover:no-underline">
                  <span className="flex items-center">
                    <DollarSign className="mr-2 h-4 w-4 text-yellow-500" />
                    {t('admin.balance_range') || 'Bakiye Aralığı'}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-1">
                    <div className="flex justify-between items-center text-xs text-gray-400">
                      <span>
                        {filters.balanceRange?.[0] || 0} ₺
                      </span>
                      <span>
                        {filters.balanceRange?.[1] || 100000} ₺
                      </span>
                    </div>
                    <Slider
                      defaultValue={filters.balanceRange || [0, 100000]}
                      min={0}
                      max={100000}
                      step={1000}
                      onValueChange={(value) => 
                        handleFilterChange({balanceRange: value as [number, number]})
                      }
                      className="my-4"
                    />
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="Min"
                          className="bg-gray-700 border-gray-600 text-white"
                          value={filters.balanceRange?.[0] || 0}
                          onChange={(e) => handleFilterChange({
                            balanceRange: [
                              parseInt(e.target.value) || 0, 
                              filters.balanceRange?.[1] || 100000
                            ]
                          })}
                        />
                      </div>
                      <div className="flex-1">
                        <Input
                          type="number"
                          placeholder="Max"
                          className="bg-gray-700 border-gray-600 text-white"
                          value={filters.balanceRange?.[1] || 100000}
                          onChange={(e) => handleFilterChange({
                            balanceRange: [
                              filters.balanceRange?.[0] || 0, 
                              parseInt(e.target.value) || 100000
                            ]
                          })}
                        />
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Tarih Filtreleri */}
              <AccordionItem value="dates" className="border-gray-700">
                <AccordionTrigger className="py-3 text-sm hover:no-underline">
                  <span className="flex items-center">
                    <Calendar className="mr-2 h-4 w-4 text-yellow-500" />
                    {t('admin.date_filters') || 'Tarih Filtreleri'}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-4 p-1">
                    <div>
                      <Label htmlFor="regDate" className="text-xs text-gray-400 mb-1 block">
                        {t('admin.registration_date') || 'Kayıt Tarihi'}
                      </Label>
                      <Select
                        value={filters.registrationDate || ''}
                        onValueChange={(value) => 
                          handleFilterChange({registrationDate: value})
                        }
                      >
                        <SelectTrigger id="regDate" className="w-full bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder={t('admin.select_date') || 'Tarih Seçin'} />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          <SelectItem value="all">Tümü</SelectItem>
                          <SelectItem value="today">Bugün</SelectItem>
                          <SelectItem value="yesterday">Dün</SelectItem>
                          <SelectItem value="last7days">Son 7 gün</SelectItem>
                          <SelectItem value="last30days">Son 30 gün</SelectItem>
                          <SelectItem value="thisMonth">Bu ay</SelectItem>
                          <SelectItem value="lastMonth">Geçen ay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="loginDate" className="text-xs text-gray-400 mb-1 block">
                        {t('admin.last_login') || 'Son Giriş Tarihi'}
                      </Label>
                      <Select
                        value={filters.loginDate || ''}
                        onValueChange={(value) => 
                          handleFilterChange({loginDate: value})
                        }
                      >
                        <SelectTrigger id="loginDate" className="w-full bg-gray-700 border-gray-600 text-white">
                          <SelectValue placeholder={t('admin.select_date') || 'Tarih Seçin'} />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700 text-white">
                          <SelectItem value="all">Tümü</SelectItem>
                          <SelectItem value="today">Bugün</SelectItem>
                          <SelectItem value="yesterday">Dün</SelectItem>
                          <SelectItem value="last7days">Son 7 gün</SelectItem>
                          <SelectItem value="last30days">Son 30 gün</SelectItem>
                          <SelectItem value="thisMonth">Bu ay</SelectItem>
                          <SelectItem value="lastMonth">Geçen ay</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
              
              {/* Rol Filtreleri */}
              <AccordionItem value="role" className="border-gray-700">
                <AccordionTrigger className="py-3 text-sm hover:no-underline">
                  <span className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-yellow-500" />
                    {t('admin.user_role') || 'Kullanıcı Rolü'}
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 p-1">
                    <Select
                      value={filters.role || ''}
                      onValueChange={(value) => handleFilterChange({role: value})}
                    >
                      <SelectTrigger className="w-full bg-gray-700 border-gray-600 text-white">
                        <SelectValue placeholder={t('admin.select_role') || 'Rol Seçin'} />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700 text-white">
                        <SelectItem value="all">Tümü</SelectItem>
                        <SelectItem value="user">Kullanıcı</SelectItem>
                        <SelectItem value="vip">VIP</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="moderator">Moderatör</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
          
          <div className="p-4 border-t border-gray-700 flex justify-between">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={clearFilters}
              className="border-gray-600 hover:bg-gray-700"
            >
              {t('admin.clear_filters') || 'Temizle'}
            </Button>
            <Button 
              size="sm" 
              onClick={applyFilters}
              className="bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              {t('admin.apply_filters') || 'Uygula'}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
      
      {/* Sıralama Kontrolleri */}
      <div className="flex gap-2">
        <Select
          value={sortField}
          onValueChange={(value) => onSortChange(value, sortOrder)}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-[180px]">
            <div className="flex items-center">
              <Filter className="mr-2 h-4 w-4 text-gray-400" />
              <SelectValue placeholder={t('admin.sort_by') || "Sırala"} />
            </div>
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-white">
            <SelectItem value="id">ID</SelectItem>
            <SelectItem value="username">{t('admin.username') || 'Kullanıcı Adı'}</SelectItem>
            <SelectItem value="email">{t('admin.email') || 'E-posta'}</SelectItem>
            <SelectItem value="balance">{t('admin.balance') || 'Bakiye'}</SelectItem>
            <SelectItem value="status">{t('admin.status') || 'Durum'}</SelectItem>
            <SelectItem value="createdAt">{t('admin.registration_date') || 'Kayıt Tarihi'}</SelectItem>
            <SelectItem value="lastLogin">{t('admin.last_login') || 'Son Giriş'}</SelectItem>
          </SelectContent>
        </Select>
        
        <Select
          value={sortOrder}
          onValueChange={(value) => onSortChange(sortField, value as 'asc' | 'desc')}
        >
          <SelectTrigger className="bg-gray-800 border-gray-700 text-white min-w-[100px]">
            <SelectValue placeholder={t('admin.order') || "Yön"} />
          </SelectTrigger>
          <SelectContent className="bg-gray-800 border-gray-700 text-white">
            <SelectItem value="asc">{t('admin.ascending') || 'Artan'}</SelectItem>
            <SelectItem value="desc">{t('admin.descending') || 'Azalan'}</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}