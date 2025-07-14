// Token blacklist sistemi
// Production ortamında Redis veya veritabanı tabanlı bir çözüm kullanılmalı

class TokenBlacklist {
  private blacklistedTokens = new Set<string>();
  
  // Token'ı blacklist'e ekle
  addToken(token: string): void {
    this.blacklistedTokens.add(token);
    console.log(`Token blacklist'e eklendi: ${token.substring(0, 20)}...`);
  }
  
  // Token'ın blacklist'te olup olmadığını kontrol et
  isBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }
  
  // Blacklist'i temizle (test amaçlı)
  clear(): void {
    this.blacklistedTokens.clear();
  }
  
  // Blacklist boyutunu döndür
  size(): number {
    return this.blacklistedTokens.size;
  }
}

// Singleton instance
export const tokenBlacklist = new TokenBlacklist(); 