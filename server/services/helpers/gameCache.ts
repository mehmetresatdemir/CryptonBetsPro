/**
 * Oyun Önbellekleme Modülü - Slotegrator API
 * 
 * Bu modül, Slotegrator API üzerinden alınan oyun verilerini önbellekleme işlemlerini yönetir.
 * Performans optimizasyonu ve API rate limit yönetimi için tasarlanmıştır.
 */

import { SlotegratorGame } from '../../services/slotegrator';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM için dizin yolu oluşturma
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_FILE_PATH = path.join(__dirname, '../../../.slotegrator-game-cache.json');
const SLOT_CACHE_FILE_PATH = path.join(__dirname, '../../../.slotegrator-slot-cache.json');
const CASINO_CACHE_FILE_PATH = path.join(__dirname, '../../../.slotegrator-casino-cache.json');

// Önbellek yapılandırması
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 saat (1 gün)

// Önbellek durumu
interface CacheState {
  games: SlotegratorGame[];
  providers: string[];
  timestamp: number;
  gameTypeStats: Record<string, number>;
  mobileGames: number;
  desktopGames: number;
  totalGames: number;
}

// Başlangıç durumu
const initialCacheState: CacheState = {
  games: [],
  providers: [],
  timestamp: 0,
  gameTypeStats: {},
  mobileGames: 0,
  desktopGames: 0,
  totalGames: 0
};

// Önbellek yöneticisi
class GameCacheManager {
  private state: CacheState = { ...initialCacheState };
  private slotCache: SlotegratorGame[] = [];
  private casinoCache: SlotegratorGame[] = [];
  private slotCacheTimestamp: number = 0;
  private casinoCacheTimestamp: number = 0;
  
  constructor() {
    this.loadCacheFromDisk();
  }
  
  /**
   * Ana önbelleği diskten yükle
   */
  public async loadCacheFromDisk(): Promise<boolean> {
    try {
      if (fs.existsSync(CACHE_FILE_PATH)) {
        console.log('Ana oyun önbelleğini diskten yükleme denemesi...');
        const cacheData = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
        const parsed = JSON.parse(cacheData);
        
        // Önbellek verisini doğrula
        if (parsed && Array.isArray(parsed.games) && parsed.timestamp && 
            Array.isArray(parsed.providers) && parsed.games.length > 0) {
          
          this.state.games = parsed.games;
          this.state.providers = parsed.providers;
          this.state.timestamp = parsed.timestamp;
          this.state.gameTypeStats = parsed.gameTypeStats || {};
          this.state.mobileGames = parsed.mobileGames || 0;
          this.state.desktopGames = parsed.desktopGames || 0;
          this.state.totalGames = parsed.totalGames || parsed.games.length;
          
          console.log(`Diskten ${this.state.games.length} oyun ve ${this.state.providers.length} sağlayıcı yüklendi.`);
          console.log(`Önbellek zamanı: ${new Date(this.state.timestamp).toLocaleString()}`);
          
          // Slot ve casino önbelleklerini de yükle
          this.loadSlotCache();
          this.loadCasinoCache();
          
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Disk önbelleğini yükleme hatası:', error);
      return false;
    }
  }
  
  /**
   * Slot oyunları önbelleğini diskten yükle
   */
  private loadSlotCache(): boolean {
    try {
      if (fs.existsSync(SLOT_CACHE_FILE_PATH)) {
        const cacheData = fs.readFileSync(SLOT_CACHE_FILE_PATH, 'utf8');
        const parsed = JSON.parse(cacheData);
        
        if (parsed && Array.isArray(parsed.games) && parsed.timestamp && parsed.games.length > 0) {
          this.slotCache = parsed.games;
          this.slotCacheTimestamp = parsed.timestamp;
          console.log(`Diskten ${this.slotCache.length} slot oyunu yüklendi.`);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Slot önbelleğini yükleme hatası:', error);
      return false;
    }
  }
  
  /**
   * Casino oyunları önbelleğini diskten yükle
   */
  private loadCasinoCache(): boolean {
    try {
      if (fs.existsSync(CASINO_CACHE_FILE_PATH)) {
        const cacheData = fs.readFileSync(CASINO_CACHE_FILE_PATH, 'utf8');
        const parsed = JSON.parse(cacheData);
        
        if (parsed && Array.isArray(parsed.games) && parsed.timestamp && parsed.games.length > 0) {
          this.casinoCache = parsed.games;
          this.casinoCacheTimestamp = parsed.timestamp;
          console.log(`Diskten ${this.casinoCache.length} casino oyunu yüklendi.`);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Casino önbelleğini yükleme hatası:', error);
      return false;
    }
  }
  
  /**
   * Ana önbelleği diske kaydet
   */
  public saveCacheToDisk(): boolean {
    try {
      if (this.state.games.length > 0) {
        const cacheData = {
          games: this.state.games,
          providers: this.state.providers,
          timestamp: this.state.timestamp,
          gameTypeStats: this.state.gameTypeStats,
          mobileGames: this.state.mobileGames,
          desktopGames: this.state.desktopGames,
          totalGames: this.state.totalGames
        };
        
        fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cacheData));
        console.log(`${this.state.games.length} oyun diske önbelleğe kaydedildi.`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Önbelleği diske kaydetme hatası:', error);
      return false;
    }
  }
  
  /**
   * Slot önbelleğini diske kaydet
   */
  public saveSlotCacheToDisk(): boolean {
    try {
      if (this.slotCache.length > 0) {
        const cacheData = {
          games: this.slotCache,
          timestamp: this.slotCacheTimestamp
        };
        
        fs.writeFileSync(SLOT_CACHE_FILE_PATH, JSON.stringify(cacheData));
        console.log(`${this.slotCache.length} slot oyunu diske önbelleğe kaydedildi.`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Slot önbelleğini diske kaydetme hatası:', error);
      return false;
    }
  }
  
  /**
   * Casino önbelleğini diske kaydet
   */
  public saveCasinoCacheToDisk(): boolean {
    try {
      if (this.casinoCache.length > 0) {
        const cacheData = {
          games: this.casinoCache,
          timestamp: this.casinoCacheTimestamp
        };
        
        fs.writeFileSync(CASINO_CACHE_FILE_PATH, JSON.stringify(cacheData));
        console.log(`${this.casinoCache.length} casino oyunu diske önbelleğe kaydedildi.`);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Casino önbelleğini diske kaydetme hatası:', error);
      return false;
    }
  }
  
  /**
   * Ana oyun önbelleğini güncelle
   */
  public updateCache(games: SlotegratorGame[]): void {
    if (games && games.length > 0) {
      this.state.games = games;
      this.state.timestamp = Date.now();
      
      // Sağlayıcıları çıkar
      const uniqueProviders = new Set(games.map(game => game.provider).filter(Boolean));
      this.state.providers = Array.from(uniqueProviders).sort();
      
      // İstatistikleri hesapla
      this.calculateStats(games);
      
      // Diske kaydet
      this.saveCacheToDisk();
      
      console.log(`Önbellek güncellendi: ${games.length} oyun, ${this.state.providers.length} sağlayıcı`);
    }
  }
  
  /**
   * Slot oyunları önbelleğini güncelle
   */
  public updateSlotCache(games: SlotegratorGame[]): void {
    if (games && games.length > 0) {
      this.slotCache = games;
      this.slotCacheTimestamp = Date.now();
      
      // Diske kaydet
      this.saveSlotCacheToDisk();
      
      console.log(`Slot önbelleği güncellendi: ${games.length} oyun`);
    }
  }
  
  /**
   * Casino oyunları önbelleğini güncelle
   */
  public updateCasinoCache(games: SlotegratorGame[]): void {
    if (games && games.length > 0) {
      this.casinoCache = games;
      this.casinoCacheTimestamp = Date.now();
      
      // Diske kaydet
      this.saveCasinoCacheToDisk();
      
      console.log(`Casino önbelleği güncellendi: ${games.length} oyun`);
    }
  }
  
  /**
   * Oyun istatistiklerini hesapla
   */
  private calculateStats(games: SlotegratorGame[]): void {
    // Oyun türleri dağılımı
    const gameTypes: Record<string, number> = {};
    
    // Mobil/masaüstü istatistikleri
    const mobileGames = games.filter(game => game.is_mobile === 1).length;
    const desktopGames = games.filter(game => game.is_mobile === 0).length;
    
    // Oyun türlerini hesapla
    games.forEach(game => {
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
    
    // İstatistikleri kaydet
    this.state.gameTypeStats = gameTypes;
    this.state.mobileGames = mobileGames;
    this.state.desktopGames = desktopGames;
    this.state.totalGames = games.length;
  }
  
  /**
   * Önbelleğin geçerli olup olmadığını kontrol et
   */
  public isCacheValid(): boolean {
    return (
      this.state.games.length > 0 && 
      Date.now() - this.state.timestamp < CACHE_TTL
    );
  }
  
  /**
   * Slot önbelleğinin geçerli olup olmadığını kontrol et
   */
  public isSlotCacheValid(): boolean {
    return (
      this.slotCache.length > 0 && 
      Date.now() - this.slotCacheTimestamp < CACHE_TTL
    );
  }
  
  /**
   * Casino önbelleğinin geçerli olup olmadığını kontrol et
   */
  public isCasinoCacheValid(): boolean {
    return (
      this.casinoCache.length > 0 && 
      Date.now() - this.casinoCacheTimestamp < CACHE_TTL
    );
  }
  
  /**
   * Tüm oyunları getir
   */
  public getAllGames(): SlotegratorGame[] {
    return this.state.games;
  }
  
  /**
   * Slot oyunlarını getir
   */
  public getSlotGames(): SlotegratorGame[] {
    if (this.isSlotCacheValid()) {
      return this.slotCache;
    }
    
    // Slot önbelleği yoksa veya geçerli değilse, ana önbellekten slot oyunlarını filtrele
    if (this.isCacheValid()) {
      const slotGames = this.state.games.filter(game => {
        // Slot oyunlarını belirle (tag veya tip ile)
        return game.tags?.some(tag => tag.code === 'slots') || game.type === 'slots';
      });
      
      // Önbelleği güncelle
      this.updateSlotCache(slotGames);
      
      return slotGames;
    }
    
    return [];
  }
  
  /**
   * Casino oyunlarını getir
   */
  public getCasinoGames(): SlotegratorGame[] {
    if (this.isCasinoCacheValid()) {
      return this.casinoCache;
    }
    
    // Casino önbelleği yoksa veya geçerli değilse, ana önbellekten casino oyunlarını filtrele
    if (this.isCacheValid()) {
      const casinoGames = this.state.games.filter(game => {
        // Casino oyunlarını belirle (tag veya tip ile)
        const casinoTags = ['table', 'roulette', 'blackjack', 'baccarat', 'poker', 'craps', 'sic bo'];
        return (
          game.tags?.some(tag => casinoTags.includes(tag.code)) || 
          (game.type && casinoTags.includes(game.type))
        );
      });
      
      // Önbelleği güncelle
      this.updateCasinoCache(casinoGames);
      
      return casinoGames;
    }
    
    return [];
  }
  
  /**
   * Sağlayıcıları getir
   */
  public getProviders(): string[] {
    return this.state.providers;
  }
  
  /**
   * Oyun tiplerini ve dağılımlarını getir
   */
  public getGameTypeStats(): Record<string, number> {
    return this.state.gameTypeStats;
  }
  
  /**
   * Mobil oyun sayısını getir
   */
  public getMobileGamesCount(): number {
    return this.state.mobileGames;
  }
  
  /**
   * Masaüstü oyun sayısını getir
   */
  public getDesktopGamesCount(): number {
    return this.state.desktopGames;
  }
  
  /**
   * Önbellek durumunu özet olarak getir
   */
  public getCacheStatus(): any {
    return {
      allGames: {
        count: this.state.games.length,
        timestamp: this.state.timestamp,
        age: Math.floor((Date.now() - this.state.timestamp) / 1000 / 60), // dakika
        valid: this.isCacheValid()
      },
      slotGames: {
        count: this.slotCache.length,
        timestamp: this.slotCacheTimestamp,
        age: Math.floor((Date.now() - this.slotCacheTimestamp) / 1000 / 60), // dakika
        valid: this.isSlotCacheValid()
      },
      casinoGames: {
        count: this.casinoCache.length,
        timestamp: this.casinoCacheTimestamp,
        age: Math.floor((Date.now() - this.casinoCacheTimestamp) / 1000 / 60), // dakika
        valid: this.isCasinoCacheValid()
      },
      stats: {
        providers: this.state.providers.length,
        mobileGames: this.state.mobileGames,
        desktopGames: this.state.desktopGames,
        gameTypes: Object.keys(this.state.gameTypeStats).length
      }
    };
  }
}

// Singleton instance
const gameCache = new GameCacheManager();

export default gameCache;