import { db } from '../db';
import { slotegratorGames } from '@shared/schema';
import { sql, eq } from 'drizzle-orm';

interface GameRecommendation {
  game: any;
  score: number;
  reason: string;
  rtp: number;
  popularity: number;
}

interface UserGamePreferences {
  favoriteProviders: string[];
  preferredRTP: number;
  averageBetSize: number;
  playingHours: number[];
  gameTypes: string[];
  volatilityPreference: 'low' | 'medium' | 'high';
}

export class GameAnalyticsService {
  
  // Kullanıcı oyun verilerini analiz ederek kişiselleştirilmiş öneriler
  async getPersonalizedRecommendations(userId: number, limit: number = 5): Promise<GameRecommendation[]> {
    try {
      // Kullanıcının oyun geçmişini analiz et
      const userPreferences = await this.analyzeUserPreferences(userId);
      
      // Veritabanından uygun oyunları getir
      const availableGames = await db
        .select()
        .from(slotegratorGames)
        .where(sql`1=1`)
        .limit(50);

      // Her oyun için skor hesapla
      const recommendations: GameRecommendation[] = availableGames.map(game => {
        const score = this.calculateGameScore(game, userPreferences);
        return {
          game,
          score,
          reason: this.generateRecommendationReason(game, userPreferences),
          rtp: this.extractRTP(game),
          popularity: this.calculatePopularity(game)
        };
      });

      // Skora göre sırala ve en iyi önerileri döndür
      return recommendations
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
        
    } catch (error) {
      console.error('Game Analytics Error:', error);
      return [];
    }
  }

  private async analyzeUserPreferences(userId: number): Promise<UserGamePreferences> {
    // Gerçek kullanıcı verilerinden tercihlerini analiz et
    // Bu örnekte varsayılan değerler döndürüyoruz
    return {
      favoriteProviders: ['Pragmatic Play', 'NetEnt', 'Evolution Gaming'],
      preferredRTP: 96.5,
      averageBetSize: 10,
      playingHours: [19, 20, 21, 22, 23], // Akşam saatleri
      gameTypes: ['slots', 'live_casino'],
      volatilityPreference: 'medium'
    };
  }

  private calculateGameScore(game: any, preferences: UserGamePreferences): number {
    let score = 0;
    
    // Provider tercihi (0-30 puan)
    if (preferences.favoriteProviders.includes(game.provider || '')) {
      score += 30;
    }
    
    // RTP skorları (0-25 puan)
    const gameRTP = this.extractRTP(game);
    if (gameRTP >= preferences.preferredRTP) {
      score += 25;
    } else if (gameRTP >= preferences.preferredRTP - 1) {
      score += 15;
    }
    
    // Oyun türü uyumu (0-20 puan)
    const gameType = this.determineGameType(game);
    if (preferences.gameTypes.includes(gameType)) {
      score += 20;
    }
    
    // Popülarite skoru (0-15 puan)
    score += this.calculatePopularity(game) * 15;
    
    // Rastgelelik faktörü (0-10 puan) - keşif için
    score += Math.random() * 10;
    
    return Math.round(score);
  }

  private extractRTP(game: any): number {
    // Oyun RTP'sini çıkar (varsayılan 96%)
    if (game.rtp) return parseFloat(game.rtp);
    if (game.description && game.description.includes('RTP')) {
      const rtpMatch = game.description.match(/RTP[:\s]*(\d+\.?\d*)%?/i);
      if (rtpMatch) return parseFloat(rtpMatch[1]);
    }
    return 96.0; // Varsayılan RTP
  }

  private calculatePopularity(game: any): number {
    // Oyun popülaritesini hesapla (0-1 arası)
    let popularity = 0.5; // Varsayılan
    
    // Provider bazlı popülarite
    const popularProviders = ['Pragmatic Play', 'NetEnt', 'Evolution Gaming', 'Play\'n GO'];
    if (popularProviders.includes(game.provider || '')) {
      popularity += 0.2;
    }
    
    // Oyun adı bazlı popülarite (ünlü oyunlar)
    const popularKeywords = ['Zeus', 'Gold', 'Mega', 'Fire', 'Diamond', 'Wild', 'Bonus'];
    const hasPopularKeyword = popularKeywords.some(keyword => 
      (game.title || game.name || '').toLowerCase().includes(keyword.toLowerCase())
    );
    if (hasPopularKeyword) {
      popularity += 0.2;
    }
    
    return Math.min(popularity, 1.0);
  }

  private determineGameType(game: any): string {
    const title = (game.title || game.name || '').toLowerCase();
    const category = (game.category || '').toLowerCase();
    
    if (category.includes('live') || title.includes('live')) {
      return 'live_casino';
    } else if (category.includes('table') || title.includes('blackjack') || title.includes('roulette')) {
      return 'table_games';
    } else {
      return 'slots';
    }
  }

  private generateRecommendationReason(game: any, preferences: UserGamePreferences): string {
    const reasons = [];
    
    if (preferences.favoriteProviders.includes(game.provider || '')) {
      reasons.push(`Favori sağlayıcınız ${game.provider}`);
    }
    
    const rtp = this.extractRTP(game);
    if (rtp >= preferences.preferredRTP) {
      reasons.push(`Yüksek RTP oranı (%${rtp})`);
    }
    
    const popularity = this.calculatePopularity(game);
    if (popularity > 0.7) {
      reasons.push('Popüler oyun');
    }
    
    if (reasons.length === 0) {
      reasons.push('Size uygun özellikler');
    }
    
    return reasons.join(', ');
  }

  // Popüler oyun analizi ve öneriler
  async getJackpotAlerts(threshold: number = 100000): Promise<any[]> {
    try {
      // Mevcut şema ile çalışan popüler oyunları getir
      const popularGames = await db
        .select()
        .from(slotegratorGames)
        .where(eq(slotegratorGames.isActive, true))
        .limit(10);

      return popularGames.map(game => ({
        gameId: game.id,
        title: game.name,
        provider: game.provider,
        jackpot: 0, // Şimdilik placeholder
        formattedJackpot: this.formatCurrency(0),
        alertLevel: 'medium'
      }));
    } catch (error) {
      console.error('Jackpot Alert Error:', error);
      return [];
    }
  }

  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0
    }).format(amount);
  }

  private getJackpotAlertLevel(amount: number): 'normal' | 'high' | 'critical' {
    if (amount > 1000000) return 'critical';
    if (amount > 500000) return 'high';
    return 'normal';
  }

  // Hot games - son 24 saatte popüler olan oyunlar
  async getHotGames(limit: number = 10): Promise<any[]> {
    try {
      // Gerçek uygulamada son 24 saatin oyun verilerini analiz ederiz
      // Şimdilik popüler oyunları döndürüyoruz
      const hotGames = await db
        .select()
        .from(slotegratorGames)
        .limit(limit);

      return hotGames.map(game => ({
        ...game,
        hotScore: Math.random() * 100,
        trendDirection: Math.random() > 0.5 ? 'up' : 'down',
        playersOnline: Math.floor(Math.random() * 1000) + 50
      }));
    } catch (error) {
      console.error('Hot Games Error:', error);
      return [];
    }
  }
}

export const gameAnalytics = new GameAnalyticsService();