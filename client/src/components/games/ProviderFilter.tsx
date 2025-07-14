import React, { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';

interface ProviderFilterProps {
  selectedProvider: string | null;
  onProviderSelect: (provider: string | null) => void;
  providers?: string[];
}

const ProviderFilter: React.FC<ProviderFilterProps> = ({
  selectedProvider,
  onProviderSelect,
  providers = []
}) => {
  const { translate } = useLanguage();
  const [searchTerm, setSearchTerm] = useState('');

  // Sağlayıcıları alfabetik olarak sırala
  const sortedProviders = [...providers].sort((a, b) => a.localeCompare(b));

  // Arama filtresi uygula
  const filteredProviders = searchTerm 
    ? sortedProviders.filter(provider => 
        provider.toLowerCase().includes(searchTerm.toLowerCase()))
    : sortedProviders;

  const handleChange = (value: string) => {
    if (value === 'all') {
      onProviderSelect(null);
    } else {
      onProviderSelect(value);
    }
  };

  return (
    <div className="mb-8 w-full">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-white">{t('games.providers')}</h2>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder={t('games.search_provider')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-4 py-2 rounded bg-slate-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-600"
          />
        </div>
      </div>
      
      <div className="overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-yellow-600 scrollbar-track-gray-800">
        <Tabs 
          defaultValue={selectedProvider || 'all'} 
          value={selectedProvider || 'all'}
          onValueChange={handleChange}
          className="w-full"
        >
          <TabsList className="bg-slate-800 h-auto flex-wrap">
            <TabsTrigger 
              value="all" 
              className={`text-white px-4 py-2 ${!selectedProvider ? 'bg-yellow-600 text-black' : 'bg-transparent'}`}
            >
              {t('games.all_providers')} ({providers.length})
            </TabsTrigger>
            
            {filteredProviders.map((provider) => (
              <TabsTrigger
                key={provider}
                value={provider}
                className={`text-white px-4 py-2 ${selectedProvider === provider ? 'bg-yellow-600 text-black' : 'bg-transparent'}`}
              >
                {provider}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      {filteredProviders.length === 0 && searchTerm && (
        <p className="text-gray-400 mt-2 text-center">{t('games.no_providers_found')}</p>
      )}
    </div>
  );
};

export default ProviderFilter;