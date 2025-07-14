import { db } from '../db';
import { users, transactions, betTransactions } from '@shared/schema';
import { eq, and, gte, lte, desc, sql } from 'drizzle-orm';

interface SupportTicket {
  id: string;
  userId: number;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'escalated';
  subject: string;
  description: string;
  assignedTo?: string;
  createdAt: Date;
  resolvedAt?: Date;
  tags: string[];
}

interface ComplianceCheck {
  userId: number;
  riskLevel: 'low' | 'medium' | 'high';
  flags: string[];
  recommendations: string[];
  lastCheck: Date;
}

interface ProactiveAlert {
  userId: number;
  alertType: string;
  message: string;
  actionRequired: boolean;
  priority: number;
  createdAt: Date;
}

export class AdvancedSupportFeatures {

  // 1. GELIŞMIŞ KULLANICI ANALİZİ VE SEGMENTASYON
  async performDeepUserAnalysis(userContext: any): Promise<{
    userProfile: any;
    riskAssessment: any;
    behaviorPattern: any;
    predictiveInsights: any;
  }> {
    try {
      // Guest kullanıcılar veya eksik veri için basitleştirilmiş analiz
      if (!userContext || userContext.isGuest || !userContext.id) {
        return {
          userProfile: {
            type: 'guest',
            status: 'visitor',
            joinDate: null,
            activity: 'browsing'
          },
          riskAssessment: {
            level: 'low',
            flags: [],
            recommendations: ['Hesap oluşturarak daha iyi hizmet alabilirsiniz']
          },
          behaviorPattern: {
            type: 'new_visitor',
            consistency: 'unknown',
            preferences: []
          },
          predictiveInsights: {
            recommendations: ['Kayıt ol', 'Bonusları keşfet'],
            nextActions: ['account_creation']
          }
        };
      }

      // Kayıtlı kullanıcılar için tam analiz
      const userId = userContext.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      // Son 30 günün işlem analizi
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentTransactions = await db
        .select()
        .from(transactions)
        .where(and(
          eq(transactions.userId, userId),
          gte(transactions.createdAt, thirtyDaysAgo)
        ))
        .orderBy(desc(transactions.createdAt));

      // Bahis geçmişi analizi - betTransactions tablosunu kullan
      const recentBets = await db
        .select()
        .from(betTransactions)
        .where(and(
          eq(betTransactions.userId, userId),
          gte(betTransactions.createdAt, thirtyDaysAgo)
        ))
        .orderBy(desc(betTransactions.createdAt));

      // Risk değerlendirmesi
      const riskAssessment = this.calculateRiskProfile(user || userContext, recentTransactions, recentBets);
      
      // Davranış kalıpları
      const behaviorPattern = this.analyzeBehaviorPatterns(recentTransactions, recentBets);
      
      // Öngörücü analizler
      const predictiveInsights = this.generatePredictiveInsights(user, behaviorPattern, riskAssessment);

      return {
        userProfile: {
          ...user,
          accountAge: this.calculateAccountAge(user?.createdAt || user?.registrationDate || new Date()),
          lifetimeValue: this.calculateLifetimeValue(recentTransactions),
          activityScore: this.calculateActivityScore(recentTransactions, recentBets)
        },
        riskAssessment,
        behaviorPattern,
        predictiveInsights
      };
    } catch (error) {
      console.error('Deep user analysis error:', error);
      throw error;
    }
  }

  // 2. AKILLI TİCKET YÖNETİMİ VE ÖNCELİKLENDİRME
  async createSmartTicket(userId: number, message: string, category?: string): Promise<SupportTicket> {
    const ticketId = `TKT-${Date.now()}-${userId}`;
    
    // AI ile kategori ve öncelik belirleme
    const analysis = await this.analyzeMessageForTicketing(message);
    
    const ticket: SupportTicket = {
      id: ticketId,
      userId,
      category: category || analysis.category,
      priority: analysis.priority,
      status: 'open',
      subject: analysis.subject,
      description: message,
      createdAt: new Date(),
      tags: analysis.tags
    };

    // Otomatik eskalasyon kuralları
    if (analysis.priority === 'urgent') {
      ticket.status = 'escalated';
      await this.sendUrgentAlert(ticket);
    }

    return ticket;
  }

  // 3. GERÇEK ZAMANLI UYUM KONTROLÜ (COMPLIANCE)
  async performComplianceCheck(userContext: any): Promise<ComplianceCheck> {
    try {
      // Guest kullanıcılar için basitleştirilmiş compliance check
      if (!userContext || userContext.isGuest) {
        return {
          userId: 0,
          riskLevel: 'low',
          flags: [],
          recommendations: ['Hesap oluşturarak tam güvenlik özelliklerinden yararlanabilirsiniz'],
          lastCheck: new Date()
        };
      }

      const userId = userContext.id;
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      
      const flags: string[] = [];
      const recommendations: string[] = [];
      let riskLevel: 'low' | 'medium' | 'high' = 'low';

      // KYC durumu kontrolü
      if (!userContext.kycStatus || userContext.kycStatus !== 'verified') {
        flags.push('KYC_INCOMPLETE');
        recommendations.push('KYC doğrulaması tamamlanmalı');
        riskLevel = 'medium';
      }

      // Yaş kontrolü
      if (user.birthdate) {
        const age = this.calculateAge(user.birthdate);
        if (age < 18) {
          flags.push('UNDERAGE');
          recommendations.push('Yasal yaş kontrolü gerekli');
          riskLevel = 'high';
        }
      }

      // İşlem limitleri kontrolü
      const dailyTransactions = await this.getDailyTransactionSum(userId);
      if (dailyTransactions > 50000) { // 50K TL üzeri
        flags.push('HIGH_VOLUME_TRANSACTIONS');
        recommendations.push('Yüksek hacimli işlemler - manuel inceleme');
        riskLevel = 'high';
      }

      // Çoklu hesap kontrolü
      const duplicateCheck = await this.checkDuplicateAccounts(user);
      if (duplicateCheck.found) {
        flags.push('POTENTIAL_DUPLICATE');
        recommendations.push('Çoklu hesap şüphesi - detaylı inceleme');
        riskLevel = 'high';
      }

      // Problem oyun belirtileri
      const gamblingBehavior = await this.analyzeGamblingBehavior(userId);
      if (gamblingBehavior.riskLevel === 'high') {
        flags.push('GAMBLING_RISK');
        recommendations.push('Sorumluluk oyun önlemleri önerilir');
        riskLevel = 'high';
      }

      return {
        userId,
        riskLevel,
        flags,
        recommendations,
        lastCheck: new Date()
      };
    } catch (error) {
      console.error('Compliance check error:', error);
      throw error;
    }
  }

  // 4. PROAKTİF MÜŞTERI HİZMETLERİ
  async generateProactiveAlerts(): Promise<ProactiveAlert[]> {
    const alerts: ProactiveAlert[] = [];

    try {
      // Büyük kayıplar yaşayan kullanıcıları tespit et
      const highLossUsers = await this.findHighLossUsers();
      for (const user of highLossUsers) {
        alerts.push({
          userId: user.id,
          alertType: 'HIGH_LOSS_DETECTED',
          message: `${user.username} son 24 saatte ${user.lossAmount} TL kayıp yaşadı. Destek teklif edilebilir.`,
          actionRequired: true,
          priority: 8,
          createdAt: new Date()
        });
      }

      // Uzun süre aktif olmayan VIP kullanıcılar
      const inactiveVips = await this.findInactiveVipUsers();
      for (const user of inactiveVips) {
        alerts.push({
          userId: user.id,
          alertType: 'VIP_INACTIVE',
          message: `VIP ${user.vipLevel} kullanıcı ${user.username} ${user.daysSinceLastLogin} gündür aktif değil.`,
          actionRequired: true,
          priority: 6,
          createdAt: new Date()
        });
      }

      // Yüksek potansiyelli yeni kullanıcılar
      const highValueNewUsers = await this.findHighValueNewUsers();
      for (const user of highValueNewUsers) {
        alerts.push({
          userId: user.id,
          alertType: 'HIGH_VALUE_NEW_USER',
          message: `Yeni kullanıcı ${user.username} yüksek yatırım yapıyor. Özel ilgi gösterilebilir.`,
          actionRequired: false,
          priority: 5,
          createdAt: new Date()
        });
      }

      return alerts.sort((a, b) => b.priority - a.priority);
    } catch (error) {
      console.error('Proactive alerts error:', error);
      return [];
    }
  }

  // 5. OTOMATIK PROBLEM ÇÖZÜM ÖNERİLERİ
  async generateSolutionRecommendations(problem: string, userId: number): Promise<{
    automaticSolutions: string[];
    manualSteps: string[];
    escalationNeeded: boolean;
    estimatedResolutionTime: number;
  }> {
    const userAnalysis = await this.performDeepUserAnalysis(userId);
    
    const problemType = this.categorizeProlem(problem);
    
    switch (problemType) {
      case 'DEPOSIT_FAILED':
        return {
          automaticSolutions: [
            'Ödeme sağlayıcısı durumunu kontrol et',
            'Hesap bakiyesini güncellemek için manuel işlem başlat',
            'Alternatif ödeme yöntemleri öner'
          ],
          manualSteps: [
            'Banka hesap durumunu doğrula',
            'Kimlik doğrulama belgelerini incele',
            'Müşteri ile direkt iletişim kur'
          ],
          escalationNeeded: false,
          estimatedResolutionTime: 15 // dakika
        };

      case 'WITHDRAWAL_DELAYED':
        return {
          automaticSolutions: [
            'KYC durumunu kontrol et ve eksikleri belirle',
            'İşlem limitlerini kontrol et',
            'Çekim talebini öncelikli kuyruğa al'
          ],
          manualSteps: [
            'Mali işler ekibine eskalasyon',
            'Ek belgeler talep et',
            'Güvenlik kontrolü yap'
          ],
          escalationNeeded: userAnalysis.riskAssessment.level === 'high',
          estimatedResolutionTime: 120 // dakika
        };

      case 'GAME_ISSUE':
        return {
          automaticSolutions: [
            'Oyun sağlayıcısı ile iletişim kur',
            'Oyun geçmişini kontrol et',
            'Teknik destek ticket oluştur'
          ],
          manualSteps: [
            'Ekran görüntüsü ve video talep et',
            'Oyun sağlayıcısına rapor gönder',
            'Telafi bonusu hesapla'
          ],
          escalationNeeded: false,
          estimatedResolutionTime: 45
        };

      default:
        return {
          automaticSolutions: ['Genel destek protokolü başlat'],
          manualSteps: ['Manuel inceleme gerekli'],
          escalationNeeded: true,
          estimatedResolutionTime: 60
        };
    }
  }

  // YARDIMCI METODLAR
  private calculateRiskProfile(user: any, transactions: any[], bets: any[]): any {
    const riskFactors = {
      highVolumeTransactions: transactions.filter(t => t.amount > 10000).length,
      frequentSmallDeposits: transactions.filter(t => t.type === 'deposit' && t.amount < 100).length,
      rapidSuccessiveTransactions: this.detectRapidTransactions(transactions),
      unusualBettingPatterns: this.detectUnusualBetting(bets),
      inconsistentPersonalInfo: this.checkInfoConsistency(user)
    };

    let riskScore = 0;
    Object.values(riskFactors).forEach(factor => {
      if (typeof factor === 'number') riskScore += factor;
      else if (factor) riskScore += 10;
    });

    return {
      level: riskScore > 30 ? 'high' : riskScore > 15 ? 'medium' : 'low',
      score: riskScore,
      factors: riskFactors
    };
  }

  private analyzeBehaviorPatterns(transactions: any[], bets: any[]): any {
    return {
      preferredPaymentMethods: this.getPreferredPaymentMethods(transactions),
      playingHours: this.getPlayingHours(bets),
      averageSessionLength: this.calculateAverageSessionLength(bets),
      favoriteGameTypes: this.getFavoriteGameTypes(bets),
      bettingVelocity: this.calculateBettingVelocity(bets)
    };
  }

  private generatePredictiveInsights(user: any, behavior: any, risk: any): any {
    return {
      churnRisk: this.calculateChurnRisk(user, behavior),
      lifetimeValuePrediction: this.predictLifetimeValue(user, behavior),
      nextBestAction: this.recommendNextAction(user, behavior, risk),
      upsellOpportunities: this.identifyUpsellOpportunities(user, behavior)
    };
  }

  private async analyzeMessageForTicketing(message: string): Promise<any> {
    // Basit kural tabanlı analiz (gerçek uygulamada NLP kullanılabilir)
    const urgentKeywords = ['acil', 'urgent', 'hemen', 'immediately', 'hack', 'fraud'];
    const paymentKeywords = ['para', 'payment', 'deposit', 'yatırım', 'çekim', 'withdrawal'];
    const gameKeywords = ['oyun', 'game', 'slot', 'casino', 'bonus'];
    
    let priority: 'low' | 'medium' | 'high' | 'urgent' = 'low';
    let category = 'general';
    let tags: string[] = [];

    if (urgentKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      priority = 'urgent';
      tags.push('urgent');
    }

    if (paymentKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      category = 'payment';
      priority = priority === 'low' ? 'medium' : priority;
      tags.push('payment');
    }

    if (gameKeywords.some(keyword => message.toLowerCase().includes(keyword))) {
      category = 'game';
      tags.push('game');
    }

    return {
      category,
      priority,
      subject: message.substring(0, 50) + '...',
      tags
    };
  }

  private async sendUrgentAlert(ticket: SupportTicket): Promise<void> {
    console.log(`URGENT ALERT: Ticket ${ticket.id} requires immediate attention`);
    // Gerçek uygulamada SMS, email, Slack notification gönderilir
  }

  private calculateAge(birthdate: string | Date): number {
    const today = new Date();
    const birth = new Date(birthdate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  private async getDailyTransactionSum(userId: number): Promise<number> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    
    const result = await db
      .select({ sum: sql<number>`sum(${transactions.amount})` })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        gte(transactions.createdAt, startOfDay)
      ));
    
    return result[0]?.sum || 0;
  }

  private async checkDuplicateAccounts(user: any): Promise<{ found: boolean; matches: any[] }> {
    // Telefon, email, TCKN kontrolü
    const matches = await db
      .select()
      .from(users)
      .where(and(
        sql`${users.id} != ${user.id}`,
        sql`(${users.phone} = ${user.phone} OR ${users.email} = ${user.email} OR ${users.tckn} = ${user.tckn})`
      ));

    return {
      found: matches.length > 0,
      matches
    };
  }

  private async analyzeGamblingBehavior(userId: number): Promise<{ riskLevel: string; indicators: string[] }> {
    // Son 7 günün bahis verilerini analiz et
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentBets = await db
      .select()
      .from(betTransactions)
      .where(and(
        eq(betTransactions.userId, userId),
        gte(betTransactions.createdAt, weekAgo)
      ));

    const indicators: string[] = [];
    let riskLevel = 'low';

    // Aşırı bahis kontrolü
    if (recentBets.length > 1000) {
      indicators.push('Aşırı bahis aktivitesi');
      riskLevel = 'high';
    }

    // Büyük kayıp kontrolü
    const totalLoss = recentBets.reduce((sum, bet) => sum + (Number(bet.betAmount) - Number(bet.winAmount || 0)), 0);
    if (totalLoss > 10000) {
      indicators.push('Yüksek kayıp miktarı');
      riskLevel = 'high';
    }

    // Gece saatlerinde oyun
    const nightBets = recentBets.filter(bet => {
      const createdAt = bet.createdAt || new Date();
      const hour = new Date(createdAt).getHours();
      return hour >= 2 && hour <= 6;
    });
    
    if (nightBets.length > 100) {
      indicators.push('Gece saatlerinde yoğun aktivite');
      riskLevel = riskLevel === 'low' ? 'medium' : 'high';
    }

    return { riskLevel, indicators };
  }

  private async findHighLossUsers(): Promise<any[]> {
    // Mock data - gerçek uygulamada SQL query ile bulunur
    return [];
  }

  private async findInactiveVipUsers(): Promise<any[]> {
    // Mock data
    return [];
  }

  private async findHighValueNewUsers(): Promise<any[]> {
    // Mock data
    return [];
  }

  private categorizeProlem(problem: string): string {
    const lowerProblem = problem.toLowerCase();
    
    if (lowerProblem.includes('yatır') || lowerProblem.includes('deposit')) {
      return 'DEPOSIT_FAILED';
    }
    if (lowerProblem.includes('çek') || lowerProblem.includes('withdrawal')) {
      return 'WITHDRAWAL_DELAYED';
    }
    if (lowerProblem.includes('oyun') || lowerProblem.includes('game')) {
      return 'GAME_ISSUE';
    }
    
    return 'GENERAL';
  }

  // Diğer yardımcı metodlar...
  private calculateAccountAge(createdAt: Date): number {
    return Math.floor((Date.now() - createdAt.getTime()) / (24 * 60 * 60 * 1000));
  }

  private calculateLifetimeValue(transactions: any[]): number {
    return transactions.reduce((sum, t) => sum + (t.amount || 0), 0);
  }

  private calculateActivityScore(transactions: any[], bets: any[]): number {
    return Math.min(100, (transactions.length * 2) + (bets.length * 0.1));
  }

  private detectRapidTransactions(transactions: any[]): boolean {
    // 5 dakika içinde 3'ten fazla işlem varsa true
    const sorted = transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    for (let i = 0; i < sorted.length - 2; i++) {
      const timeDiff = new Date(sorted[i].createdAt).getTime() - new Date(sorted[i + 2].createdAt).getTime();
      if (timeDiff < 5 * 60 * 1000) return true;
    }
    return false;
  }

  private detectUnusualBetting(bets: any[]): boolean {
    // Basit anomali tespiti
    const amounts = bets.map(b => b.amount);
    const avg = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    return amounts.some(amount => amount > avg * 10);
  }

  private checkInfoConsistency(user: any): boolean {
    // Guest kullanıcılar için tutarlılık kontrolü atla
    if (user.isGuest) return false;
    
    // Basit tutarlılık kontrolü
    return !user.firstName || !user.lastName || !user.birthdate;
  }

  private getPreferredPaymentMethods(transactions: any[]): string[] {
    const methods = transactions.map(t => t.paymentMethod).filter(Boolean);
    const counts = methods.reduce((acc, method) => {
      acc[method] = (acc[method] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  }

  private getPlayingHours(bets: any[]): number[] {
    return bets.map(bet => new Date(bet.createdAt).getHours());
  }

  private calculateAverageSessionLength(bets: any[]): number {
    // Basit session uzunluğu hesaplaması
    return 45; // dakika
  }

  private getFavoriteGameTypes(bets: any[]): string[] {
    // Mock data
    return ['slots', 'blackjack', 'roulette'];
  }

  private calculateBettingVelocity(bets: any[]): number {
    // Dakikada ortalama bahis sayısı
    if (bets.length === 0) return 0;
    const timespan = new Date(bets[0].createdAt).getTime() - new Date(bets[bets.length - 1].createdAt).getTime();
    return (bets.length / (timespan / 60000));
  }

  private calculateChurnRisk(user: any, behavior: any): number {
    // 0-100 arası risk skoru
    return Math.random() * 100;
  }

  private predictLifetimeValue(user: any, behavior: any): number {
    // Tahmini yaşam boyu değer
    return Math.random() * 50000;
  }

  private recommendNextAction(user: any, behavior: any, risk: any): string {
    if (risk.level === 'high') return 'Güvenlik kontrolü yapın';
    if (user?.vipLevel > 0) return 'VIP bonus teklif edin';
    return 'Hoşgeldin bonusu önerin';
  }

  private identifyUpsellOpportunities(user: any, behavior: any): string[] {
    return ['VIP program', 'Özel bonuslar', 'Canlı casino'];
  }
}

export const advancedSupport = new AdvancedSupportFeatures();