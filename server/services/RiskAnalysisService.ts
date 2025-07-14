import { db } from '../db';
import { users, withdrawals, deposits, bets, transactions, riskAnalysis } from '../../shared/schema';
import { eq, desc, and, gte, lte, count, sum, avg } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface RiskAnalysisResult {
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  flags: string[];
  recommendation: 'approve' | 'reject' | 'manual_review';
  details: {
    gameHistory: any;
    financialHistory: any;
    behaviorAnalysis: any;
    mlPredictions?: any;
  };
}

export class RiskAnalysisService {
  private static readonly RISK_THRESHOLDS = {
    low: 25,
    medium: 50,
    high: 75,
    critical: 90
  };

  private static readonly MAX_WITHDRAWAL_RATIO = 0.8; // Toplam yatırımın %80'i
  private static readonly SUSPICIOUS_ACTIVITY_THRESHOLD = 10;
  private static readonly MIN_PLAY_TIME_HOURS = 2;

  static async analyzeWithdrawal(userId: number, amount: number): Promise<RiskAnalysisResult> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) {
      throw new Error('Kullanıcı bulunamadı');
    }

    const userProfile = user[0];
    let riskScore = 0;
    const flags: string[] = [];

    // Finansal geçmiş analizi
    const financialAnalysis = await this.analyzeFinancialHistory(userId, amount);
    riskScore += financialAnalysis.score;
    flags.push(...financialAnalysis.flags);

    // Oyun geçmişi analizi
    const gameAnalysis = await this.analyzeGameHistory(userId);
    riskScore += gameAnalysis.score;
    flags.push(...gameAnalysis.flags);

    // Davranış analizi
    const behaviorAnalysis = await this.analyzeBehaviorPattern(userId);
    riskScore += behaviorAnalysis.score;
    flags.push(...behaviorAnalysis.flags);

    // KYC durumu kontrolü
    const kycAnalysis = await this.analyzeKYCStatus(userId);
    riskScore += kycAnalysis.score;
    flags.push(...kycAnalysis.flags);

    // Risk seviyesi belirleme
    const riskLevel = this.determineRiskLevel(riskScore);
    const recommendation = this.getRecommendation(riskLevel, flags);

    return {
      riskScore: Math.min(riskScore, 100),
      riskLevel,
      flags: [...new Set(flags)], // Benzersiz flag'ler
      recommendation,
      details: {
        gameHistory: gameAnalysis.details,
        financialHistory: financialAnalysis.details,
        behaviorAnalysis: behaviorAnalysis.details
      }
    };
  }

  private static async analyzeFinancialHistory(userId: number, withdrawalAmount: number) {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Son 30 günlük para yatırma toplamı
    const totalDeposits = await db
      .select({ total: sum(deposits.amount) })
      .from(deposits)
      .where(
        and(
          eq(deposits.userId, userId),
          eq(deposits.status, 'completed'),
          gte(deposits.createdAt, thirtyDaysAgo)
        )
      );

    // Son 30 günlük para çekme toplamı
    const totalWithdrawals = await db
      .select({ total: sum(withdrawals.amount) })
      .from(withdrawals)
      .where(
        and(
          eq(withdrawals.userId, userId),
          eq(withdrawals.status, 'completed'),
          gte(withdrawals.createdAt, thirtyDaysAgo)
        )
      );

    const depositSum = Number(totalDeposits[0]?.total || 0);
    const withdrawalSum = Number(totalWithdrawals[0]?.total || 0);
    const withdrawalRatio = depositSum > 0 ? (withdrawalSum + withdrawalAmount) / depositSum : 1;

    let score = 0;
    const flags: string[] = [];

    // Çekme oranı kontrolü
    if (withdrawalRatio > this.MAX_WITHDRAWAL_RATIO) {
      score += 30;
      flags.push('HIGH_WITHDRAWAL_RATIO');
    }

    // İlk para yatırma kontrolü
    if (depositSum === 0) {
      score += 50;
      flags.push('NO_DEPOSIT_HISTORY');
    }

    // Büyük miktarlı çekme
    if (withdrawalAmount > depositSum * 2) {
      score += 40;
      flags.push('LARGE_WITHDRAWAL_AMOUNT');
    }

    return {
      score,
      flags,
      details: {
        depositSum,
        withdrawalSum,
        withdrawalRatio,
        withdrawalAmount
      }
    };
  }

  private static async analyzeGameHistory(userId: number) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Son 7 günlük oyun istatistikleri
    const gameStats = await db
      .select({
        totalBets: count(bets.id),
        totalAmount: sum(bets.amount),
        totalWins: sum(bets.winAmount)
      })
      .from(bets)
      .where(
        and(
          eq(bets.userId, userId),
          gte(bets.createdAt, sevenDaysAgo)
        )
      );

    const stats = gameStats[0];
    const totalBets = Number(stats.totalBets || 0);
    const totalAmount = Number(stats.totalAmount || 0);
    const totalWins = Number(stats.totalWins || 0);
    const winRate = totalAmount > 0 ? totalWins / totalAmount : 0;

    let score = 0;
    const flags: string[] = [];

    // Çok az oyun oynama
    if (totalBets < 10) {
      score += 25;
      flags.push('INSUFFICIENT_GAME_ACTIVITY');
    }

    // Anormal kazanma oranı
    if (winRate > 0.9) {
      score += 35;
      flags.push('SUSPICIOUS_WIN_RATE');
    }

    // Hiç oyun oynamama
    if (totalBets === 0) {
      score += 40;
      flags.push('NO_GAME_ACTIVITY');
    }

    return {
      score,
      flags,
      details: {
        totalBets,
        totalAmount,
        totalWins,
        winRate
      }
    };
  }

  private static async analyzeBehaviorPattern(userId: number) {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const userProfile = user[0];
    
    let score = 0;
    const flags: string[] = [];

    // Yeni hesap kontrolü
    const accountAge = Date.now() - new Date(userProfile.createdAt!).getTime();
    const daysSinceRegistration = accountAge / (1000 * 60 * 60 * 24);

    if (daysSinceRegistration < 7) {
      score += 20;
      flags.push('NEW_ACCOUNT');
    }

    // KYC durumu
    if (!userProfile.tckn || !userProfile.phone) {
      score += 15;
      flags.push('INCOMPLETE_PROFILE');
    }

    return {
      score,
      flags,
      details: {
        accountAge: daysSinceRegistration,
        hasKYC: !!userProfile.tckn
      }
    };
  }

  private static async analyzeKYCStatus(userId: number) {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const userProfile = user[0];
    
    let score = 0;
    const flags: string[] = [];

    if (!userProfile.tckn) {
      score += 25;
      flags.push('NO_KYC_VERIFICATION');
    }

    if (!userProfile.phone) {
      score += 10;
      flags.push('NO_PHONE_VERIFICATION');
    }

    return { score, flags, details: {} };
  }

  private static determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
    if (score >= this.RISK_THRESHOLDS.critical) return 'critical';
    if (score >= this.RISK_THRESHOLDS.high) return 'high';
    if (score >= this.RISK_THRESHOLDS.medium) return 'medium';
    return 'low';
  }

  private static getRecommendation(
    riskLevel: string, 
    flags: string[]
  ): 'approve' | 'reject' | 'manual_review' {
    if (riskLevel === 'critical' || flags.includes('SUSPICIOUS_WIN_RATE')) {
      return 'reject';
    }
    if (riskLevel === 'high' || riskLevel === 'medium') {
      return 'manual_review';
    }
    return 'approve';
  }

  static async saveAnalysis(
    userId: number,
    transactionId: string,
    transactionType: 'withdrawal' | 'deposit',
    analysis: RiskAnalysisResult
  ) {
    const analysisId = uuidv4();
    
    await db.insert(riskAnalysis).values({
      userId,
      transactionId,
      transactionType,
      analysisType: 'automated',
      riskScore: analysis.riskScore.toString(),
      riskLevel: analysis.riskLevel,
      flags: analysis.flags,
      details: analysis.details,
      gameHistory: analysis.details.gameHistory,
      financialHistory: analysis.details.financialHistory,
      behaviorAnalysis: analysis.details.behaviorAnalysis,
      createdAt: new Date()
    });

    return analysisId;
  }
}