import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Monitor, Zap, AlertTriangle } from 'lucide-react';
import { gameCache } from '@/utils/cacheManager';
import { useLanguage } from '@/contexts/LanguageContext';

export const PerformanceMonitor = () => {
  const { t, language } = useLanguage();
  const { translate } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);
  const [stats, setStats] = useState({
    fps: 0,
    memory: 0,
    cache: { total: 0, valid: 0, memoryUsage: '0 KB' },
    loadTime: 0
  });

  useEffect(() => {
    let frameCount = 0;
    let lastTime = Date.now();
    let animationId: number;

    const measureFPS = () => {
      frameCount++;
      const currentTime = Date.now();
      
      if (currentTime - lastTime >= 1000) {
        setStats(prev => ({
          ...prev,
          fps: frameCount
        }));
        frameCount = 0;
        lastTime = currentTime;
      }
      
      animationId = requestAnimationFrame(measureFPS);
    };

    const measureMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setStats(prev => ({
          ...prev,
          memory: Math.round(memory.usedJSHeapSize / 1024 / 1024)
        }));
      }
    };

    const measureCache = () => {
      const cacheStats = gameCache.getStats();
      setStats(prev => ({
        ...prev,
        cache: cacheStats
      }));
    };

    // Performance observer için navigation timing
    const measureLoadTime = () => {
      if ('getEntriesByType' in performance) {
        const navigation = performance.getEntriesByType('navigation')[0] as any;
        if (navigation) {
          setStats(prev => ({
            ...prev,
            loadTime: Math.round(navigation.loadEventEnd - navigation.fetchStart)
          }));
        }
      }
    };

    measureFPS();
    measureMemory();
    measureCache();
    measureLoadTime();

    const interval = setInterval(() => {
      measureMemory();
      measureCache();
    }, 5000);

    return () => {
      cancelAnimationFrame(animationId);
      clearInterval(interval);
    };
  }, []);

  if (!isVisible) {
    return (
      <Button
        onClick={() => setIsVisible(true)}
        variant="outline"
        size="sm"
        className="fixed bottom-4 right-4 z-50 bg-black/80 text-white border-gray-600"
      >
        <Monitor size={16} />
      </Button>
    );
  }

  const getPerformanceLevel = () => {
    if (stats.fps >= 50 && stats.memory < 100) return 'high';
    if (stats.fps >= 30 && stats.memory < 200) return 'medium';
    return 'low';
  };

  const performanceLevel = getPerformanceLevel();
  const performanceColor = {
    high: 'bg-green-600',
    medium: 'bg-yellow-600',
    low: 'bg-red-600'
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/90 text-white p-4 rounded-lg border border-gray-600 min-w-[280px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Monitor size={16} />
          <span className="font-semibold">{t('system.performance', 'Performans')}</span>
        </div>
        <Button
          onClick={() => setIsVisible(false)}
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0"
        >
          ×
        </Button>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>{t('system.fps', 'FPS')}:</span>
          <Badge className={performanceColor[performanceLevel]}>
            {stats.fps}
          </Badge>
        </div>
        
        <div className="flex justify-between">
          <span>{t('system.memory', 'Bellek')}:</span>
          <span>{stats.memory} MB</span>
        </div>
        
        <div className="flex justify-between">
          <span>Cache:</span>
          <span>{stats.cache.valid}/{stats.cache.total}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Cache Boyutu:</span>
          <span>{stats.cache.memoryUsage}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Yükleme:</span>
          <span>{stats.loadTime}ms</span>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-gray-600">
          {performanceLevel === 'high' && (
            <>
              <Zap size={14} className="text-green-400" />
              <span className="text-green-400">Mükemmel</span>
            </>
          )}
          {performanceLevel === 'medium' && (
            <>
              <Monitor size={14} className="text-yellow-400" />
              <span className="text-yellow-400">İyi</span>
            </>
          )}
          {performanceLevel === 'low' && (
            <>
              <AlertTriangle size={14} className="text-red-400" />
              <span className="text-red-400">Yavaş</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};