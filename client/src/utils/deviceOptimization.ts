// Cihaz bazlı optimizasyonlar

export const deviceOptimization = {
  // Cihaz performans seviyesini tespit et
  getPerformanceLevel: (): 'low' | 'medium' | 'high' => {
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    const memory = (navigator as any).deviceMemory || 4;
    
    // GPU bilgisi varsa al
    const canvas = document.createElement('canvas');
    const gl = canvas.getContextranslate('webgl') || canvas.getContextranslate('experimental-webgl');
    const debugInfo = gl?.getExtension('WEBGL_debug_renderer_info');
    const renderer = debugInfo ? gl?.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) : '';

    // Performans skorlaması
    let score = 0;
    
    // CPU skorları
    if (hardwareConcurrency >= 8) score += 3;
    else if (hardwareConcurrency >= 4) score += 2;
    else score += 1;

    // RAM skorları
    if (memory >= 8) score += 3;
    else if (memory >= 4) score += 2;
    else score += 1;

    // GPU skorları (temel kontrol)
    if (renderer && (
      renderer.includes('RTX') || 
      renderer.includes('GTX') || 
      renderer.includes('Radeon')
    )) {
      score += 2;
    } else {
      score += 1;
    }

    if (score >= 7) return 'high';
    if (score >= 5) return 'medium';
    return 'low';
  },

  // Performansa göre optimizasyon ayarları
  getOptimizationSettings: (performanceLevel: 'low' | 'medium' | 'high') => {
    const settings = {
      low: {
        animationsEnabled: false,
        imageQuality: 'low' as const,
        itemsPerPage: 20,
        enableVirtualization: true,
        enableImageLazyLoading: true,
        enablePreloading: false,
        enableTransitions: false
      },
      medium: {
        animationsEnabled: true,
        imageQuality: 'medium' as const,
        itemsPerPage: 50,
        enableVirtualization: true,
        enableImageLazyLoading: true,
        enablePreloading: true,
        enableTransitions: true
      },
      high: {
        animationsEnabled: true,
        imageQuality: 'high' as const,
        itemsPerPage: 100,
        enableVirtualization: false,
        enableImageLazyLoading: false,
        enablePreloading: true,
        enableTransitions: true
      }
    };

    return settings[performanceLevel];
  },

  // Network kalitesi tespiti
  getNetworkQuality: (): 'slow' | 'medium' | 'fast' => {
    const connection = (navigator as any).connection;
    
    if (!connection) return 'medium';

    const { effectiveType, downlink } = connection;

    if (effectiveType === '4g' && downlink > 5) return 'fast';
    if (effectiveType === '3g' || (effectiveType === '4g' && downlink <= 5)) return 'medium';
    return 'slow';
  },

  // Battery durumu optimizasyonu
  getBatteryOptimization: async (): Promise<boolean> => {
    try {
      const battery = await (navigator as any).getBattery?.();
      if (!battery) return false;

      // Şarj seviyesi %20'nin altındaysa optimizasyon aktif
      return battery.level < 0.2 && !battery.charging;
    } catch {
      return false;
    }
  },

  // Adaptif optimizasyon
  getAdaptiveSettings: async () => {
    const performanceLevel = deviceOptimization.getPerformanceLevel();
    const networkQuality = deviceOptimization.getNetworkQuality();
    const lowBattery = await deviceOptimization.getBatteryOptimization();

    const baseSettings = deviceOptimization.getOptimizationSettings(performanceLevel);

    // Network ve battery durumuna göre ayarları güncelle
    if (networkQuality === 'slow' || lowBattery) {
      return {
        ...baseSettings,
        imageQuality: 'low' as const,
        enablePreloading: false,
        animationsEnabled: false,
        itemsPerPage: Math.min(baseSettings.itemsPerPage, 20)
      };
    }

    return baseSettings;
  }
};