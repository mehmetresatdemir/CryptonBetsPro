import { db } from '../../db';
import { SlotegratorGame } from '../slotegrator';
import { sql } from 'drizzle-orm';

// Slotegrator Veritabanı Önbellek Hizmeti
// API çağrılarını minimum seviyede tutmak için veritabanı destekli önbellek

// Önbellek anahtarları ve zaman aşımı (saniye)
const CACHE_KEYS = {
  ALL_GAMES: 'all_games',
  MOBILE_GAMES: 'mobile_games',
  DESKTOP_GAMES: 'desktop_games',
  SLOT_GAMES: 'slot_games',
  CASINO_GAMES: 'casino_games',
  PROVIDERS: 'providers',
};

const CACHE_TIMEOUT = 86400; // 24 saat (saniye cinsinden)

/**
 * Önbellekten veri al
 * @param key Önbellek anahtarı
 * @returns Promise<T | null>
 */
export async function getFromCache<T>(key: string): Promise<T | null> {
  try {
    const result = await db.execute(
      sql`SELECT cache_data, updated_at FROM slotegrator_cache WHERE cache_key = ${key}`
    );
    
    if (result.rows && result.rows.length > 0) {
      const cacheEntry = result.rows[0];
      const updatedAt = new Date(cacheEntry.updated_at);
      const now = new Date();
      
      // Önbellek geçerlilik kontrolü
      if ((now.getTime() - updatedAt.getTime()) / 1000 < CACHE_TIMEOUT) {
        return cacheEntry.cache_data as T;
      }
      
      // Süresi dolmuşsa, önbelleği temizle
      console.log(`Önbellek süresi doldu: ${key}`);
      await db.execute(
        sql`DELETE FROM slotegrator_cache WHERE cache_key = ${key}`
      );
    }
    
    return null;
  } catch (error) {
    console.error('Önbellekten veri alınırken hata:', error);
    return null;
  }
}

/**
 * Önbelleğe veri kaydet
 * @param key Önbellek anahtarı
 * @param data Kaydedilecek veri
 * @returns Promise<boolean>
 */
export async function saveToCache<T>(key: string, data: T): Promise<boolean> {
  try {
    // Önce mevcut kaydı sil
    await db.execute(
      sql`DELETE FROM slotegrator_cache WHERE cache_key = ${key}`
    );
    
    // Yeni kaydı ekle
    await db.execute(
      sql`INSERT INTO slotegrator_cache (cache_key, cache_data, updated_at) 
          VALUES (${key}, ${JSON.stringify(data)}, NOW())`
    );
    
    return true;
  } catch (error) {
    console.error('Önbelleğe veri kaydedilirken hata:', error);
    return false;
  }
}

/**
 * Tüm oyunları önbellekten al
 * @returns Promise<SlotegratorGame[]>
 */
export async function getCachedGames(): Promise<SlotegratorGame[] | null> {
  return getFromCache<SlotegratorGame[]>(CACHE_KEYS.ALL_GAMES);
}

/**
 * Tüm oyunları önbelleğe kaydet
 * @param games Tüm oyunların listesi
 * @returns Promise<boolean>
 */
export async function cacheGames(games: SlotegratorGame[]): Promise<boolean> {
  return saveToCache(CACHE_KEYS.ALL_GAMES, games);
}

/**
 * Mobil oyunları önbellekten al
 * @returns Promise<SlotegratorGame[]>
 */
export async function getCachedMobileGames(): Promise<SlotegratorGame[] | null> {
  return getFromCache<SlotegratorGame[]>(CACHE_KEYS.MOBILE_GAMES);
}

/**
 * Mobil oyunları önbelleğe kaydet
 * @param games Mobil oyunların listesi
 * @returns Promise<boolean>
 */
export async function cacheMobileGames(games: SlotegratorGame[]): Promise<boolean> {
  return saveToCache(CACHE_KEYS.MOBILE_GAMES, games);
}

/**
 * Masaüstü oyunları önbellekten al
 * @returns Promise<SlotegratorGame[]>
 */
export async function getCachedDesktopGames(): Promise<SlotegratorGame[] | null> {
  return getFromCache<SlotegratorGame[]>(CACHE_KEYS.DESKTOP_GAMES);
}

/**
 * Masaüstü oyunları önbelleğe kaydet
 * @param games Masaüstü oyunların listesi
 * @returns Promise<boolean>
 */
export async function cacheDesktopGames(games: SlotegratorGame[]): Promise<boolean> {
  return saveToCache(CACHE_KEYS.DESKTOP_GAMES, games);
}

/**
 * Slot oyunlarını önbellekten al
 * @returns Promise<SlotegratorGame[]>
 */
export async function getCachedSlotGames(): Promise<SlotegratorGame[] | null> {
  return getFromCache<SlotegratorGame[]>(CACHE_KEYS.SLOT_GAMES);
}

/**
 * Slot oyunlarını önbelleğe kaydet
 * @param games Slot oyunlarının listesi
 * @returns Promise<boolean>
 */
export async function cacheSlotGames(games: SlotegratorGame[]): Promise<boolean> {
  return saveToCache(CACHE_KEYS.SLOT_GAMES, games);
}

/**
 * Casino oyunlarını önbellekten al
 * @returns Promise<SlotegratorGame[]>
 */
export async function getCachedCasinoGames(): Promise<SlotegratorGame[] | null> {
  return getFromCache<SlotegratorGame[]>(CACHE_KEYS.CASINO_GAMES);
}

/**
 * Casino oyunlarını önbelleğe kaydet
 * @param games Casino oyunlarının listesi
 * @returns Promise<boolean>
 */
export async function cacheCasinoGames(games: SlotegratorGame[]): Promise<boolean> {
  return saveToCache(CACHE_KEYS.CASINO_GAMES, games);
}

/**
 * Sağlayıcıları önbellekten al
 * @returns Promise<string[]>
 */
export async function getCachedProviders(): Promise<string[] | null> {
  return getFromCache<string[]>(CACHE_KEYS.PROVIDERS);
}

/**
 * Sağlayıcıları önbelleğe kaydet
 * @param providers Sağlayıcıların listesi
 * @returns Promise<boolean>
 */
export async function cacheProviders(providers: string[]): Promise<boolean> {
  return saveToCache(CACHE_KEYS.PROVIDERS, providers);
}

/**
 * Tüm önbelleği temizle
 * @returns Promise<boolean>
 */
export async function clearAllCache(): Promise<boolean> {
  try {
    await db.execute(sql`DELETE FROM slotegrator_cache`);
    return true;
  } catch (error) {
    console.error('Önbellek temizlenirken hata:', error);
    return false;
  }
}