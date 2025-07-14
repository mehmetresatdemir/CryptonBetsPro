import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { SlotegratorGame } from '../slotegrator';

// ESM için dizin yolu oluşturma
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_FILE_PATH = path.join(__dirname, '../../../.slotegrator-cache.json');

// Önbellek verileri
let cachedGames: SlotegratorGame[] = [];
let cachedProviders: string[] = [];
let lastCacheTime: number = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 saat (daha büyük veri seti için)
let cacheInitialized = false;
let cacheInitializing = false;

// Önbelleği diskten yükle (uygulama başladığında)
export async function loadCacheFromDisk(): Promise<boolean> {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      console.log('Önbelleği diskten yükleme denemesi...');
      const cacheData = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
      const parsed = JSON.parse(cacheData);
      
      // Önbellek verisini doğrula
      if (parsed && Array.isArray(parsed.games) && parsed.timestamp && 
          Array.isArray(parsed.providers) && parsed.games.length > 0) {
        
        cachedGames = parsed.games;
        cachedProviders = parsed.providers;
        lastCacheTime = parsed.timestamp;
        
        console.log(`Diskten ${cachedGames.length} oyun ve ${cachedProviders.length} sağlayıcı yüklendi.`);
        console.log(`Önbellek zamanı: ${new Date(lastCacheTime).toLocaleString()}`);
        
        cacheInitialized = true;
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Disk önbelleğini yükleme hatası:', error);
    return false;
  }
}

// Önbelleği diske kaydet
export async function saveCacheToDisk(): Promise<void> {
  try {
    if (cachedGames.length > 0) {
      const cacheData = {
        games: cachedGames,
        providers: cachedProviders,
        timestamp: lastCacheTime
      };
      
      fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cacheData), 'utf8');
      console.log(`Önbellek diske kaydedildi: ${cachedGames.length} oyun, ${cachedProviders.length} sağlayıcı`);
    }
  } catch (error) {
    console.error('Önbelleği diske kaydetme hatası:', error);
  }
}

// Oyunları önbelleğe al
export function setCachedGames(games: SlotegratorGame[]): void {
  cachedGames = games;
  lastCacheTime = Date.now();
  cacheInitialized = true;
  
  // Sağlayıcıları hesapla
  const uniqueProviders = new Set(games.map(game => game.provider));
  cachedProviders = Array.from(uniqueProviders).sort();
}

// Önbellekten oyunları al
export function getCachedGames(): SlotegratorGame[] {
  return cachedGames;
}

// Önbellekten sağlayıcıları al
export function getCachedProviders(): string[] {
  return cachedProviders;
}

// Önbellek durumunu kontrol et
export function isCacheInitialized(): boolean {
  return cacheInitialized;
}

// Önbellek zamanını kontrol et
export function isCacheExpired(): boolean {
  return Date.now() - lastCacheTime > CACHE_TTL;
}

// Önbellek yükleniyor mu?
export function isCacheInitializing(): boolean {
  return cacheInitializing;
}

// Önbellek yüklemesini başlat
export function startCacheInitialization(): void {
  cacheInitializing = true;
}

// Önbellek yüklemesini bitir
export function finishCacheInitialization(): void {
  cacheInitializing = false;
}

// Mobil/masaüstü oyun istatistiklerini hesapla
export function getDeviceStats(): { mobile: number, desktop: number } {
  const mobileGames = cachedGames.filter(game => game.is_mobile === 1).length;
  const desktopGames = cachedGames.filter(game => game.is_mobile === 0).length;
  
  return {
    mobile: mobileGames,
    desktop: desktopGames
  };
}

// Oyun tiplerinin dağılımını hesapla
export function getGameTypeStats(): Record<string, number> {
  const gameTypes: Record<string, number> = {};
  
  cachedGames.forEach(game => {
    if (game.tags && game.tags.length > 0) {
      game.tags.forEach(tag => {
        if (tag.code) {
          gameTypes[tag.code] = (gameTypes[tag.code] || 0) + 1;
        }
      });
    } else if (game.type) {
      gameTypes[game.type] = (gameTypes[game.type] || 0) + 1;
    }
  });
  
  return gameTypes;
}

// Önbellek özetini yazdır
export function printCacheSummary(): void {
  const deviceStats = getDeviceStats();
  const gameTypes = getGameTypeStats();
  
  console.log('=== SLOTEGRATOR VERİ TOPLAMA ÖZET ===');
  console.log(`Toplam ${cachedGames.length} oyun başarıyla çekildi.`);
  console.log(`Toplam ${cachedProviders.length} benzersiz sağlayıcı bulundu.`);
  console.log(`Sağlayıcılar: ${cachedProviders.join(', ')}`);
  console.log(`Oyun türleri dağılımı:`, gameTypes);
  console.log(`Mobil oyunlar: ${deviceStats.mobile}, Masaüstü oyunlar: ${deviceStats.desktop}`);
}