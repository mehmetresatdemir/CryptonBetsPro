import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Refresh, Database, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CacheStatus {
  cache: {
    totalGames: number;
    totalProviders: number;
    slotGames: number;
    lastUpdate: string;
    providers: string[];
    topProviders: Array<{ name: string; gameCount: number }>;
  };
  status: {
    status: string;
    currentPage?: number;
    totalPages?: number;
  };
  progress: {
    current: number;
    target: number;
    percentage: number;
  };
  timestamp: string;
}

const CacheStatusPage: React.FC = () => {
  const { data: cacheStatus, isLoading, refetch } = useQuery<CacheStatus>({
    queryKey: ['cache-status'],
    queryFn: async () => {
      const response = await fetch('/api/cache-status');
      return response.json();
    },
    refetchInterval: 30000, // Her 30 saniyede yenile
  });

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('tr-TR');
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Cache durumu yükleniyor...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!cacheStatus?.cache) {
    return (
      <MainLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <Database className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-white mb-2">Cache Henüz Hazır Değil</h2>
            <p className="text-gray-400">Cache sistemi şu anda oyunları yüklüyor.</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-yellow-900/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Cache Durumu</h1>
              <p className="text-gray-400">Slot oyunları cache sistemi izleme paneli</p>
            </div>
            <Button onClick={() => refetch()} className="bg-yellow-600 hover:bg-yellow-700">
              <Refresh className="w-4 h-4 mr-2" />
              Yenile
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Genel İstatistikler */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-yellow-400 flex items-center">
                  <Database className="w-5 h-5 mr-2" />
                  Toplam Oyunlar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">
                  {cacheStatus.cache.totalGames.toLocaleString()}
                </div>
                <div className="text-sm text-gray-400">
                  {cacheStatus.cache.slotGames.toLocaleString()} slot oyunu
                </div>
              </CardContent>
            </Card>

            {/* Sağlayıcılar */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-blue-400 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Sağlayıcılar
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white mb-2">
                  {cacheStatus.cache.totalProviders}
                </div>
                <div className="text-sm text-gray-400">
                  Toplam oyun sağlayıcısı
                </div>
              </CardContent>
            </Card>

            {/* Son Güncelleme */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-green-400 flex items-center">
                  <Clock className="w-5 h-5 mr-2" />
                  Son Güncelleme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-bold text-white mb-2">
                  {formatTime(cacheStatus.cache.lastUpdate)}
                </div>
                <div className="text-sm text-gray-400">
                  Cache son güncelleme zamanı
                </div>
              </CardContent>
            </Card>
          </div>

          {/* İlerleme Çubuğu */}
          <Card className="bg-gray-800 border-gray-700 mb-8">
            <CardHeader>
              <CardTitle className="text-yellow-400">Cache Yükleme İlerlemesi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-white">
                    {cacheStatus.progress.current.toLocaleString()} / {cacheStatus.progress.target.toLocaleString()} oyun
                  </span>
                  <Badge variant="secondary" className="bg-yellow-600 text-black">
                    %{cacheStatus.progress.percentage}
                  </Badge>
                </div>
                <Progress value={cacheStatus.progress.percentage} className="h-3" />
                <div className="text-sm text-gray-400">
                  Hedef: {cacheStatus.progress.target.toLocaleString()} oyun
                </div>
              </div>
            </CardContent>
          </Card>

          {/* En Çok Oyunu Olan Sağlayıcılar */}
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-purple-400">En Çok Oyunu Olan Sağlayıcılar</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cacheStatus.cache.topProviders.map((provider, index) => (
                  <div key={provider.name} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                    <div className="flex items-center">
                      <span className="text-yellow-400 font-bold mr-3">#{index + 1}</span>
                      <span className="text-white font-medium">{provider.name}</span>
                    </div>
                    <Badge variant="outline" className="border-gray-500 text-gray-300">
                      {provider.gameCount} oyun
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 text-center text-gray-400 text-sm">
            Son güncelleme: {formatTime(cacheStatus.timestamp)} • Otomatik yenileme: 30 saniye
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default CacheStatusPage;