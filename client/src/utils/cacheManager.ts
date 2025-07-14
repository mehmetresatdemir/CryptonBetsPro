// Gelişmiş cache yönetimi

interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class CacheManager {
  private cache = new Map<string, CacheItem<any>>();
  private readonly defaultTTL = 5 * 60 * 1000; // 5 dakika

  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });

    // Memory management - 100'den fazla item varsa eski olanları temizle
    if (this.cache.size > 100) {
      this.cleanup();
    }
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) return null;

    // TTL kontrolü
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    // TTL kontrolü
    if (Date.now() - item.timestamp > item.ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private cleanup(): void {
    const now = Date.now();
    const entries = Array.from(this.cache.entries());
    
    // Eski itemları bul ve sil
    entries
      .filter(([_, item]) => now - item.timestamp > item.ttl)
      .forEach(([key]) => this.cache.delete(key));

    // Hala çok fazla item varsa en eski olanları sil
    if (this.cache.size > 80) {
      const sortedEntries = entries
        .sort((a, b) => a[1].timestamp - b[1].timestamp)
        .slice(0, this.cache.size - 80);
      
      sortedEntries.forEach(([key]) => this.cache.delete(key));
    }
  }

  // Cache istatistikleri
  getStats() {
    const now = Date.now();
    const valid = Array.from(this.cache.values())
      .filter(item => now - item.timestamp <= item.ttl);

    return {
      total: this.cache.size,
      valid: valid.length,
      expired: this.cache.size - valid.length,
      memoryUsage: this.getMemoryUsage()
    };
  }

  private getMemoryUsage(): string {
    const size = JSON.stringify(Array.from(this.cache.entries())).length;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }
}

// Singleton instance
export const gameCache = new CacheManager();

// Specialized cache functions
export const cacheUtils = {
  // Oyun verilerini cache'le
  cacheGameData: (gameId: string, data: any) => {
    gameCache.set(`game:${gameId}`, data, 10 * 60 * 1000); // 10 dakika
  },

  // Oyun verilerini al
  getGameData: (gameId: string) => {
    return gameCache.get(`game:${gameId}`);
  },

  // Sağlayıcı verilerini cache'le
  cacheProviderData: (providerId: string, data: any) => {
    gameCache.set(`provider:${providerId}`, data, 30 * 60 * 1000); // 30 dakika
  },

  // Sağlayıcı verilerini al
  getProviderData: (providerId: string) => {
    return gameCache.get(`provider:${providerId}`);
  },

  // Kullanıcı tercihlerini cache'le
  cacheUserPreferences: (userId: string, preferences: any) => {
    gameCache.set(`prefs:${userId}`, preferences, 60 * 60 * 1000); // 1 saat
  },

  // Kullanıcı tercihlerini al
  getUserPreferences: (userId: string) => {
    return gameCache.get(`prefs:${userId}`);
  }
};