import axios from 'axios';
import { SlotegratorGame, SlotegratorGamesList } from '@/types/slotegrator';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';

// İstemci tarafı Slotegrator servis fonksiyonları - Gelişmiş versiyon
// Cihaz tipini otomatik algılayan ve ona uygun içeriği getiren versiyon

const API_BASE_URL = '/api/slotegrator';

/**
 * Geliştirilmiş cihaz uyumlu oyun listesini getir
 * 
 * @param page Sayfa numarası
 * @param perPage Sayfa başına oyun sayısı
 * @param provider Belirli bir sağlayıcıya ait oyunları filtrele (isteğe bağlı)
 * @param deviceOverride Cihaz tipini manuel belirle (varsayılan: otomatik)
 * @returns SlotegratorGamesList
 */
// Oyun listesi önbelleği
let cachedGameLists: Record<string, {
  timestamp: number;
  data: SlotegratorGamesList;
}> = {};

// Önbellek süresi (30 dakika - milisaniye cinsinden)
const CACHE_TIMEOUT = 30 * 60 * 1000;

export async function getDeviceCompatibleGames(
  page: number = 1, 
  perPage: number = 50,
  provider?: string,
  deviceOverride?: 'mobile' | 'desktop',
  gameType?: string,
  useCache: boolean = true
): Promise<SlotegratorGamesList> {
  let isMobile = false;
  
  // Tarayıcı ortamında ise, cihaz tipini belirle
  if (typeof window !== 'undefined') {
    // Manuel kontrol varsa kullan, yoksa otomatik tespit et
    if (deviceOverride) {
      isMobile = deviceOverride === 'mobile';
    } else {
      // Navigator user agent'tan cihaz bilgisi edinme
      const userAgent = navigator.userAgent.toLowerCase();
      isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      // Ekran boyutundan da kontrol
      if (window.innerWidth <= 768) {
        isMobile = true;
      }
    }
  }
  
  // Önbellek anahtarı oluştur
  const cacheKey = `games_${gameType || 'all'}_${provider || 'all'}_${isMobile ? 'mobile' : 'desktop'}_${perPage}_${page}`;
  
  // Önbellekten kontrol et
  if (useCache && cachedGameLists[cacheKey] && 
    (Date.now() - cachedGameLists[cacheKey].timestamp) < CACHE_TIMEOUT) {
    console.log(`Oyunlar önbellekten alındı: ${cacheKey}`);
    return cachedGameLists[cacheKey].data;
  }
  
  // Uygun API endpoint'ini belirle
  let endpoint = '/games';
  if (gameType === 'slot') {
    endpoint = '/games/slots';
  } else if (gameType === 'casino') {
    endpoint = '/games/casino';
  }
  
  // API isteği için parametreler oluştur
  const params: Record<string, string> = {
    page: page.toString(),
    perPage: perPage.toString(),
    mobile: isMobile ? '1' : '0'
  };
  
  // Provider filtresi ekle
  if (provider) {
    params.provider = provider;
  }
  
  // Oyun tipi filtresini ekle (slot/casino dışındaki alt tipler için)
  if (gameType && gameType !== 'slot' && gameType !== 'casino' && gameType !== 'all') {
    params.gameType = gameType;
  }
  
  try {
    console.log(`Oyunlar API'den alınıyor: ${endpoint} ${JSON.stringify(params)}`);
    const startTime = Date.now();
    
    const response = await axios.get(`${API_BASE_URL}${endpoint}`, { 
      params,
      timeout: 60000 // 60 saniye zaman aşımı
    });
    
    const endTime = Date.now();
    const loadTime = endTime - startTime;
    console.log(`Oyunlar ${loadTime}ms içinde yüklendi. Toplam: ${response.data.items.length} oyun.`);
    
    // Önbelleğe kaydet
    if (useCache) {
      cachedGameLists[cacheKey] = {
        timestamp: Date.now(),
        data: response.data
      };
    }
    
    return response.data;
  } catch (error) {
    console.error(`Oyunlar alınırken hata oluştu (${endpoint}):`, error);
    return { items: [], _meta: { totalCount: 0, pageCount: 0, currentPage: page, perPage } };
  }
}

/**
 * Mevcut cihaz için uygun tüm sağlayıcıları getir
 * 
 * @param forceRefresh Önbelleği yeniden yüklemeye zorla
 * @param deviceOverride Cihaz tipini manuel belirle (varsayılan: otomatik)
 * @returns string[]
 */
// Sağlayıcı önbelleği
let cachedProviders: {
  mobile: string[];
  desktop: string[];
  timestamp: number;
} | null = null;

// Önbellek süresi (60 dakika - milisaniye cinsinden)
const PROVIDERS_CACHE_TIMEOUT = 60 * 60 * 1000;

export async function getDeviceCompatibleProviders(
  forceRefresh: boolean = false,
  deviceOverride?: 'mobile' | 'desktop'
): Promise<string[]> {
  let isMobile = false;
  
  // Tarayıcı ortamında ise, cihaz tipini belirle
  if (typeof window !== 'undefined') {
    // Manuel kontrol varsa kullan, yoksa otomatik tespit et
    if (deviceOverride) {
      isMobile = deviceOverride === 'mobile';
    } else {
      // Navigator user agent'tan cihaz bilgisi edinme
      const userAgent = navigator.userAgent.toLowerCase();
      isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
      
      // Ekran boyutundan da kontrol
      if (window.innerWidth <= 768) {
        isMobile = true;
      }
    }
  }
  
  // Önbellekten kontrol et
  if (!forceRefresh && cachedProviders && 
      (Date.now() - cachedProviders.timestamp) < PROVIDERS_CACHE_TIMEOUT) {
    console.log('Sağlayıcılar önbellekten alındı');
    return isMobile ? cachedProviders.mobile : cachedProviders.desktop;
  }
  
  // API'den sağlayıcıları almayı dene, hatada varsayılan değerleri kullan
  const params: Record<string, string> = {
    forceRefresh: forceRefresh ? 'true' : 'false',
    mobile: isMobile ? 'true' : 'false'
  };
  
  const maxRetries = 3;
  let retryCount = 0;
  
  while (retryCount < maxRetries) {
    try {
      const response = await axios.get(`${API_BASE_URL}/providers`, { 
        params,
        timeout: 10000 // 10 saniye zaman aşımı
      });
      
      // Önbelleğe kaydet
      if (!cachedProviders) {
        cachedProviders = {
          mobile: [],
          desktop: [],
          timestamp: Date.now()
        };
      }
      
      if (isMobile) {
        cachedProviders.mobile = response.data;
      } else {
        cachedProviders.desktop = response.data;
      }
      cachedProviders.timestamp = Date.now();
      
      return response.data;
    } catch (error) {
      retryCount++;
      console.error(`Sağlayıcılar alınırken hata oluştu (Deneme ${retryCount}/${maxRetries}):`, error);
      
      if (retryCount < maxRetries) {
        // Bir sonraki denemeden önce bekle (exponential backoff)
        const waitTime = Math.pow(2, retryCount) * 1000;
        console.log(`${waitTime}ms sonra yeniden denenecek...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
  }
  
  // Önbellekte veri varsa, eskimiş de olsa kullan
  if (cachedProviders) {
    console.log('API bağlantısı başarısız. Mevcut önbellekteki sağlayıcılar kullanılıyor.');
    return isMobile ? cachedProviders.mobile : cachedProviders.desktop;
  }
  
  // En popüler sağlayıcıları içeren varsayılan liste
  const defaultProviders = [
    'PragmaticPlay', 'NetEnt', 'Evolution2', 'Playson', 'Quickspin', 
    'Thunderkick', 'Red Tiger', 'Wazdan', 'Amatic', 'Endorphina'
  ];
  
  console.log('API bağlantısı başarısız. Varsayılan sağlayıcı listesi kullanılıyor.');
  return defaultProviders;
}

/**
 * Belirli bir oyunu getir
 * 
 * @param uuid Oyun benzersiz kimliği
 * @returns SlotegratorGame | null
 */
export async function getGameByUuid(uuid: string): Promise<SlotegratorGame | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/games/${uuid}`);
    return response.data;
  } catch (error) {
    console.error(`Oyun alınırken hata oluştu (${uuid}):`, error);
    return null;
  }
}

/**
 * Oyunu başlat ve oyun URL'sini al
 * 
 * @param gameUuid Oyun benzersiz kimliği
 * @param returnUrl Oyundan çıkıldığında dönülecek URL
 * @param mode Oyun modu (demo veya gerçek)
 * @param language Dil (tr, en, vb.)
 * @returns { url: string } | null 
 */
export async function initGame(
  gameUuid: string,
  returnUrl: string,
  mode: 'demo' | 'real' = 'real', 
  language: string = 'tr'
): Promise<{ url: string } | null> {
  // Cihaz tipini belirle
  let device = 'desktop';
  
  if (typeof window !== 'undefined') {
    // Navigator user agent'tan cihaz bilgisi edinme
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    
    // Ekran boyutundan da kontrol
    if (window.innerWidth <= 768 || isMobile) {
      device = 'mobile';
    }
  }
  
  try {
    const response = await axios.post(`${API_BASE_URL}/games/init`, {
      game_uuid: gameUuid,
      return_url: returnUrl,
      mode,
      language,
      device,
      currency: 'TRY'
    });
    
    if (response.data && response.data.url) {
      return { url: response.data.url };
    }
    
    return null;
  } catch (error) {
    console.error('Oyun başlatma hatası:', error);
    return null;
  }
}