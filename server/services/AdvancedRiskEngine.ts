import { db } from '../db';
import { users, withdrawals, deposits, bets, transactions, riskAnalysis, gameSessions } from '../../shared/schema';
import { eq, desc, and, gte, lte, count, sum, avg, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';

export interface EnhancedRiskAnalysis {
  riskScore: number;
  riskLevel: 'minimal' | 'low' | 'moderate' | 'high' | 'critical' | 'extreme';
  flags: RiskFlag[];
  recommendation: 'auto_approve' | 'manual_review' | 'enhanced_verification' | 'reject' | 'freeze_account';
  confidence: number;
  details: {
    financialProfile: FinancialProfile;
    behaviorProfile: BehaviorProfile;
    gameplayProfile: GameplayProfile;
    deviceProfile: DeviceProfile;
    velocityChecks: VelocityChecks;
    complianceChecks: ComplianceChecks;
    mlPredictions: MLPredictions;
  };
  actionPlan: ActionPlan;
}

export interface RiskFlag {
  type: 'financial' | 'behavioral' | 'gameplay' | 'velocity' | 'compliance' | 'device';
  severity: 'info' | 'warning' | 'critical';
  code: string;
  description: string;
  score: number;
  metadata?: any;
}

export interface FinancialProfile {
  depositPattern: {
    frequency: number;
    averageAmount: number;
    totalVolume: number;
    methods: string[];
    unusualAmounts: boolean;
  };
  withdrawalPattern: {
    frequency: number;
    averageAmount: number;
    totalVolume: number;
    withdrawalRatio: number;
    rapidWithdrawals: boolean;
  };
  balanceHistory: {
    maxBalance: number;
    averageBalance: number;
    balanceFluctuations: number;
  };
  creditworthiness: {
    score: number;
    factors: string[];
  };
}

export interface BehaviorProfile {
  sessionPatterns: {
    averageSessionTime: number;
    sessionsPerDay: number;
    timeDistribution: Record<string, number>;
    suspiciousPatterns: boolean;
  };
  geolocation: {
    countries: string[];
    cities: string[];
    vpnDetected: boolean;
    locationChanges: number;
  };
  deviceFingerprint: {
    deviceCount: number;
    browserChanges: number;
    suspiciousDevices: boolean;
  };
}

export interface GameplayProfile {
  gamePreferences: {
    types: string[];
    providers: string[];
    concentration: number;
  };
  bettingBehavior: {
    averageBet: number;
    maxBet: number;
    betVariance: number;
    progressiveBetting: boolean;
  };
  winLossPattern: {
    winRate: number;
    rtp: number;
    suspiciousWins: boolean;
    collusion: boolean;
  };
  gameplay: {
    speed: number;
    automation: boolean;
    patterns: string[];
  };
}

export interface DeviceProfile {
  devices: Array<{
    fingerprint: string;
    type: string;
    os: string;
    browser: string;
    riskScore: number;
  }>;
  sharedDevices: boolean;
  emulatorDetected: boolean;
  proxies: boolean;
}

export interface VelocityChecks {
  transactionVelocity: {
    last1h: number;
    last24h: number;
    last7d: number;
    threshold: number;
    exceeded: boolean;
  };
  amountVelocity: {
    last1h: number;
    last24h: number;
    last7d: number;
    threshold: number;
    exceeded: boolean;
  };
  loginVelocity: {
    attempts: number;
    locations: number;
    threshold: number;
    exceeded: boolean;
  };
}

export interface ComplianceChecks {
  kyc: {
    level: 'none' | 'basic' | 'enhanced' | 'full';
    verified: boolean;
    documents: string[];
    lastUpdate: Date;
  };
  aml: {
    sanctionCheck: boolean;
    pepCheck: boolean;
    watchlistCheck: boolean;
    riskRating: string;
  };
  limits: {
    dailyLimit: number;
    monthlyLimit: number;
    currentUsage: number;
    exceeded: boolean;
  };
}

export interface MLPredictions {
  fraudProbability: number;
  churnProbability: number;
  ltv: number;
  segmentation: string;
  anomalyScore: number;
  modelVersion: string;
  confidence: number;
}

export interface ActionPlan {
  immediateActions: string[];
  requiresVerification: string[];
  monitoring: string[];
  restrictions: string[];
  timeline: string;
}

export class AdvancedRiskEngine {
  private static readonly RISK_THRESHOLDS = {
    minimal: 10,
    low: 25,
    moderate: 50,
    high: 75,
    critical: 90,
    extreme: 95
  };

  private static readonly VELOCITY_LIMITS = {
    hourly: { transactions: 10, amount: 50000 },
    daily: { transactions: 50, amount: 500000 },
    weekly: { transactions: 200, amount: 2000000 }
  };

  static async analyzeTransaction(
    userId: number, 
    amount: number, 
    type: 'deposit' | 'withdrawal',
    metadata: any = {}
  ): Promise<EnhancedRiskAnalysis> {
    
    const startTime = Date.now();
    
    // Paralel analiz işlemleri
    const [
      financialProfile,
      behaviorProfile,
      gameplayProfile,
      deviceProfile,
      velocityChecks,
      complianceChecks
    ] = await Promise.all([
      this.analyzeFinancialProfile(userId, amount, type),
      this.analyzeBehaviorProfile(userId, metadata),
      this.analyzeGameplayProfile(userId),
      this.analyzeDeviceProfile(userId, metadata),
      this.performVelocityChecks(userId, amount, type),
      this.performComplianceChecks(userId, amount)
    ]);

    // ML tahminleri
    const mlPredictions = await this.getMlPredictions(userId, {
      financialProfile,
      behaviorProfile,
      gameplayProfile,
      amount,
      type
    });

    // Risk puanlaması
    const riskFlags = this.generateRiskFlags({
      financialProfile,
      behaviorProfile,
      gameplayProfile,
      velocityChecks,
      complianceChecks,
      mlPredictions
    });

    const riskScore = this.calculateRiskScore(riskFlags, mlPredictions);
    const riskLevel = this.determineRiskLevel(riskScore);
    const confidence = this.calculateConfidence(riskFlags, mlPredictions);
    const recommendation = this.generateRecommendation(riskLevel, riskFlags, mlPredictions);
    const actionPlan = this.generateActionPlan(riskLevel, riskFlags, recommendation);

    const analysis: EnhancedRiskAnalysis = {
      riskScore,
      riskLevel,
      flags: riskFlags,
      recommendation,
      confidence,
      details: {
        financialProfile,
        behaviorProfile,
        gameplayProfile,
        deviceProfile,
        velocityChecks,
        complianceChecks,
        mlPredictions
      },
      actionPlan
    };

    // Analiz sonucunu veritabanına kaydet
    await this.saveAdvancedAnalysis(userId, type, amount, analysis);

    const processingTime = Date.now() - startTime;
    console.log(`[RISK ENGINE] Analysis completed in ${processingTime}ms for user ${userId}`);

    return analysis;
  }

  private static async analyzeFinancialProfile(
    userId: number, 
    amount: number, 
    type: string
  ): Promise<FinancialProfile> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // Paralel sorgular
    const [depositStats, withdrawalStats, balanceHistory] = await Promise.all([
      db.select({
        count: count(),
        total: sum(deposits.amount),
        avg: avg(deposits.amount)
      })
      .from(deposits)
      .where(and(
        eq(deposits.userId, userId),
        eq(deposits.status, 'completed'),
        gte(deposits.createdAt, thirtyDaysAgo)
      )),

      db.select({
        count: count(),
        total: sum(withdrawals.amount),
        avg: avg(withdrawals.amount)
      })
      .from(withdrawals)
      .where(and(
        eq(withdrawals.userId, userId),
        eq(withdrawals.status, 'completed'),
        gte(withdrawals.createdAt, thirtyDaysAgo)
      )),

      db.select({
        maxBalance: sql<number>`MAX(CAST(balance AS DECIMAL))`,
        avgBalance: sql<number>`AVG(CAST(balance AS DECIMAL))`
      })
      .from(transactions)
      .where(and(
        eq(transactions.userId, userId),
        gte(transactions.createdAt, thirtyDaysAgo)
      ))
    ]);

    const depositData = depositStats[0];
    const withdrawalData = withdrawalStats[0];
    const balanceData = balanceHistory[0];

    const depositTotal = Number(depositData.total || 0);
    const withdrawalTotal = Number(withdrawalData.total || 0);
    const withdrawalRatio = depositTotal > 0 ? withdrawalTotal / depositTotal : 0;

    return {
      depositPattern: {
        frequency: Number(depositData.count || 0),
        averageAmount: Number(depositData.avg || 0),
        totalVolume: depositTotal,
        methods: [], // Bu veri ayrıca toplanacak
        unusualAmounts: amount > Number(depositData.avg || 0) * 5
      },
      withdrawalPattern: {
        frequency: Number(withdrawalData.count || 0),
        averageAmount: Number(withdrawalData.avg || 0),
        totalVolume: withdrawalTotal,
        withdrawalRatio,
        rapidWithdrawals: withdrawalRatio > 0.9
      },
      balanceHistory: {
        maxBalance: Number(balanceData?.maxBalance || 0),
        averageBalance: Number(balanceData?.avgBalance || 0),
        balanceFluctuations: 0 // Hesaplanacak
      },
      creditworthiness: {
        score: this.calculateCreditScore(depositTotal, withdrawalTotal, withdrawalRatio),
        factors: []
      }
    };
  }

  private static async analyzeBehaviorProfile(userId: number, metadata: any): Promise<BehaviorProfile> {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Session analizi
    const sessionStats = await db.select({
      avgSessionTime: sql<number>`AVG(EXTRACT(EPOCH FROM (ended_at - started_at)))`,
      sessionCount: count(),
      totalTime: sql<number>`SUM(EXTRACT(EPOCH FROM (ended_at - started_at)))`
    })
    .from(gameSessions)
    .where(and(
      eq(gameSessions.userId, userId),
      gte(gameSessions.startedAt, sevenDaysAgo)
    ));

    const sessionData = sessionStats[0];

    return {
      sessionPatterns: {
        averageSessionTime: Number(sessionData?.avgSessionTime || 0),
        sessionsPerDay: Number(sessionData?.sessionCount || 0) / 7,
        timeDistribution: {}, // Saat dağılımı analizi
        suspiciousPatterns: false
      },
      geolocation: {
        countries: [metadata.country || 'TR'],
        cities: [metadata.city || 'Unknown'],
        vpnDetected: metadata.vpnDetected || false,
        locationChanges: 0
      },
      deviceFingerprint: {
        deviceCount: 1,
        browserChanges: 0,
        suspiciousDevices: false
      }
    };
  }

  private static async analyzeGameplayProfile(userId: number): Promise<GameplayProfile> {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const gameStats = await db.select({
      totalBets: count(),
      totalAmount: sum(bets.amount),
      totalWins: sum(bets.winAmount),
      avgBet: avg(bets.amount),
      maxBet: sql<number>`MAX(CAST(amount AS DECIMAL))`
    })
    .from(bets)
    .where(and(
      eq(bets.userId, userId),
      gte(bets.createdAt, thirtyDaysAgo)
    ));

    const stats = gameStats[0];
    const totalBets = Number(stats.totalBets || 0);
    const totalAmount = Number(stats.totalAmount || 0);
    const totalWins = Number(stats.totalWins || 0);
    const winRate = totalAmount > 0 ? totalWins / totalAmount : 0;

    return {
      gamePreferences: {
        types: [], // Oyun türleri analizi
        providers: [], // Sağlayıcı analizi
        concentration: 0 // Oyun konsantrasyonu
      },
      bettingBehavior: {
        averageBet: Number(stats.avgBet || 0),
        maxBet: Number(stats.maxBet || 0),
        betVariance: 0, // Bahis varyansı hesaplanacak
        progressiveBetting: false
      },
      winLossPattern: {
        winRate,
        rtp: winRate,
        suspiciousWins: winRate > 0.98,
        collusion: false
      },
      gameplay: {
        speed: 0, // Oyun hızı analizi
        automation: false,
        patterns: []
      }
    };
  }

  private static async analyzeDeviceProfile(userId: number, metadata: any): Promise<DeviceProfile> {
    return {
      devices: [{
        fingerprint: metadata.deviceFingerprint || 'unknown',
        type: metadata.deviceType || 'desktop',
        os: metadata.os || 'unknown',
        browser: metadata.browser || 'unknown',
        riskScore: 0
      }],
      sharedDevices: false,
      emulatorDetected: metadata.emulatorDetected || false,
      proxies: metadata.proxyDetected || false
    };
  }

  private static async performVelocityChecks(
    userId: number, 
    amount: number, 
    type: string
  ): Promise<VelocityChecks> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Transaction velocity kontrolü
    const velocityStats = await Promise.all([
      this.getTransactionVelocity(userId, oneHourAgo, type),
      this.getTransactionVelocity(userId, oneDayAgo, type),
      this.getTransactionVelocity(userId, oneWeekAgo, type)
    ]);

    return {
      transactionVelocity: {
        last1h: velocityStats[0].count,
        last24h: velocityStats[1].count,
        last7d: velocityStats[2].count,
        threshold: this.VELOCITY_LIMITS.hourly.transactions,
        exceeded: velocityStats[0].count > this.VELOCITY_LIMITS.hourly.transactions
      },
      amountVelocity: {
        last1h: velocityStats[0].amount,
        last24h: velocityStats[1].amount,
        last7d: velocityStats[2].amount,
        threshold: this.VELOCITY_LIMITS.hourly.amount,
        exceeded: velocityStats[0].amount > this.VELOCITY_LIMITS.hourly.amount
      },
      loginVelocity: {
        attempts: 0, // Login velocity analizi
        locations: 1,
        threshold: 10,
        exceeded: false
      }
    };
  }

  private static async getTransactionVelocity(userId: number, since: Date, type: string) {
    const table = type === 'deposit' ? deposits : withdrawals;
    const result = await db.select({
      count: count(),
      total: sum(table.amount)
    })
    .from(table)
    .where(and(
      eq(table.userId, userId),
      gte(table.createdAt, since)
    ));

    return {
      count: Number(result[0]?.count || 0),
      amount: Number(result[0]?.total || 0)
    };
  }

  private static async performComplianceChecks(userId: number, amount: number): Promise<ComplianceChecks> {
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const userData = user[0];

    return {
      kyc: {
        level: userData?.tckn ? 'basic' : 'none',
        verified: !!userData?.tckn,
        documents: userData?.tckn ? ['id'] : [],
        lastUpdate: userData?.updatedAt || new Date()
      },
      aml: {
        sanctionCheck: true, // Gerçek sanction check API'si
        pepCheck: true,
        watchlistCheck: true,
        riskRating: 'low'
      },
      limits: {
        dailyLimit: 100000,
        monthlyLimit: 1000000,
        currentUsage: 0, // Hesaplanacak
        exceeded: amount > 100000
      }
    };
  }

  private static async getMlPredictions(userId: number, data: any): Promise<MLPredictions> {
    // Gerçek ML model entegrasyonu buraya gelecek
    // Şimdilik basit rule-based yaklaşım
    
    const fraudScore = this.calculateFraudScore(data);
    const churnScore = this.calculateChurnScore(data);
    
    return {
      fraudProbability: fraudScore,
      churnProbability: churnScore,
      ltv: this.calculateLTV(data),
      segmentation: this.getSegmentation(data),
      anomalyScore: this.calculateAnomalyScore(data),
      modelVersion: '1.0.0',
      confidence: 0.85
    };
  }

  private static generateRiskFlags(data: any): RiskFlag[] {
    const flags: RiskFlag[] = [];

    // Finansal flagler
    if (data.financialProfile.withdrawalPattern.rapidWithdrawals) {
      flags.push({
        type: 'financial',
        severity: 'warning',
        code: 'RAPID_WITHDRAWAL',
        description: 'Hızlı para çekme modeli tespit edildi',
        score: 15
      });
    }

    // Velocity flagler
    if (data.velocityChecks.transactionVelocity.exceeded) {
      flags.push({
        type: 'velocity',
        severity: 'critical',
        code: 'HIGH_VELOCITY',
        description: 'İşlem hızı limitini aştı',
        score: 25
      });
    }

    // ML flagler
    if (data.mlPredictions.fraudProbability > 0.7) {
      flags.push({
        type: 'behavioral',
        severity: 'critical',
        code: 'HIGH_FRAUD_RISK',
        description: 'Yüksek fraud riski tespit edildi',
        score: 30
      });
    }

    return flags;
  }

  private static calculateRiskScore(flags: RiskFlag[], mlPredictions: MLPredictions): number {
    const flagScore = flags.reduce((sum, flag) => sum + flag.score, 0);
    const mlScore = mlPredictions.fraudProbability * 40;
    const anomalyScore = mlPredictions.anomalyScore * 20;
    
    return Math.min(100, flagScore + mlScore + anomalyScore);
  }

  private static determineRiskLevel(score: number): EnhancedRiskAnalysis['riskLevel'] {
    if (score >= this.RISK_THRESHOLDS.extreme) return 'extreme';
    if (score >= this.RISK_THRESHOLDS.critical) return 'critical';
    if (score >= this.RISK_THRESHOLDS.high) return 'high';
    if (score >= this.RISK_THRESHOLDS.moderate) return 'moderate';
    if (score >= this.RISK_THRESHOLDS.low) return 'low';
    return 'minimal';
  }

  private static calculateConfidence(flags: RiskFlag[], mlPredictions: MLPredictions): number {
    const flagConfidence = flags.length > 0 ? Math.min(1, flags.length / 5) : 0.5;
    return (flagConfidence + mlPredictions.confidence) / 2;
  }

  private static generateRecommendation(
    riskLevel: string,
    flags: RiskFlag[],
    mlPredictions: MLPredictions
  ): EnhancedRiskAnalysis['recommendation'] {
    
    if (riskLevel === 'extreme' || mlPredictions.fraudProbability > 0.9) {
      return 'freeze_account';
    }
    
    if (riskLevel === 'critical' || flags.some(f => f.severity === 'critical')) {
      return 'reject';
    }
    
    if (riskLevel === 'high') {
      return 'enhanced_verification';
    }
    
    if (riskLevel === 'moderate') {
      return 'manual_review';
    }
    
    return 'auto_approve';
  }

  private static generateActionPlan(
    riskLevel: string,
    flags: RiskFlag[],
    recommendation: string
  ): ActionPlan {
    
    const plan: ActionPlan = {
      immediateActions: [],
      requiresVerification: [],
      monitoring: [],
      restrictions: [],
      timeline: '24 hours'
    };

    switch (recommendation) {
      case 'freeze_account':
        plan.immediateActions.push('Hesabı dondur', 'Güvenlik ekibini bilgilendir');
        plan.timeline = 'Immediate';
        break;
      case 'reject':
        plan.immediateActions.push('İşlemi reddet', 'Kullanıcıyı bilgilendir');
        break;
      case 'enhanced_verification':
        plan.requiresVerification.push('Ek doküman talebi', 'Video call doğrulama');
        plan.timeline = '72 hours';
        break;
      case 'manual_review':
        plan.monitoring.push('Risk ekibi incelemesi', '24 saat izleme');
        break;
      default:
        plan.monitoring.push('Rutin izleme');
        break;
    }

    return plan;
  }

  private static async saveAdvancedAnalysis(
    userId: number,
    type: string,
    amount: number,
    analysis: EnhancedRiskAnalysis
  ) {
    const analysisId = uuidv4();
    
    await db.insert(riskAnalysis).values({
      userId,
      transactionId: analysisId,
      transactionType: type,
      analysisType: 'advanced',
      riskScore: analysis.riskScore.toString(),
      riskLevel: analysis.riskLevel,
      flags: analysis.flags,
      details: analysis.details,
      gameHistory: analysis.details.gameplayProfile,
      financialHistory: analysis.details.financialProfile,
      behaviorAnalysis: analysis.details.behaviorProfile,
      mlPredictions: analysis.details.mlPredictions,
      createdAt: new Date()
    });

    return analysisId;
  }

  // Yardımcı metodlar
  private static calculateCreditScore(deposits: number, withdrawals: number, ratio: number): number {
    if (deposits === 0) return 300;
    if (ratio > 0.95) return 400;
    if (ratio > 0.8) return 500;
    if (ratio > 0.6) return 650;
    return 750;
  }

  private static calculateFraudScore(data: any): number {
    let score = 0;
    
    if (data.financialProfile.withdrawalPattern.rapidWithdrawals) score += 0.3;
    if (data.behaviorProfile.geolocation.vpnDetected) score += 0.2;
    if (data.gameplayProfile.winLossPattern.suspiciousWins) score += 0.4;
    
    return Math.min(1, score);
  }

  private static calculateChurnScore(data: any): number {
    // Churn prediction logic
    return 0.1; // Placeholder
  }

  private static calculateLTV(data: any): number {
    // Lifetime value calculation
    return data.financialProfile.depositPattern.totalVolume * 1.2;
  }

  private static getSegmentation(data: any): string {
    const totalDeposits = data.financialProfile.depositPattern.totalVolume;
    
    if (totalDeposits > 100000) return 'VIP';
    if (totalDeposits > 50000) return 'High Value';
    if (totalDeposits > 10000) return 'Regular';
    return 'New';
  }

  private static calculateAnomalyScore(data: any): number {
    // Anomaly detection logic
    return 0.05; // Placeholder
  }
}