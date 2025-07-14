import { db } from '../db';
import { users, transactions, chatSessions } from '@shared/schema';
import { eq, and, gte, desc, sql } from 'drizzle-orm';

interface RealTimeAlert {
  id: string;
  userId: number;
  type: 'SECURITY' | 'FINANCIAL' | 'BEHAVIORAL' | 'COMPLIANCE' | 'TECHNICAL';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  actionRequired: boolean;
  autoResolvable: boolean;
  metadata: any;
  createdAt: Date;
}

interface SecurityEvent {
  type: string;
  userId: number;
  ipAddress?: string;
  userAgent?: string;
  details: any;
  timestamp: Date;
}

export class RealTimeAlertsService {
  private alertQueue: RealTimeAlert[] = [];
  private securityEvents: SecurityEvent[] = [];

  // Gerçek zamanlı güvenlik izleme
  async monitorSecurityEvents(): Promise<RealTimeAlert[]> {
    const alerts: RealTimeAlert[] = [];
    const now = new Date();
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    try {
      // Aynı IP'den çoklu hesap girişi
      const suspiciousLogins = await this.detectSuspiciousLogins();
      suspiciousLogins.forEach(event => {
        alerts.push({
          id: `SEC_${Date.now()}_${event.userId}`,
          userId: event.userId,
          type: 'SECURITY',
          severity: 'HIGH',
          title: 'Şüpheli Giriş Tespit Edildi',
          message: `Kullanıcı ${event.userId} aynı IP'den çoklu hesap girişi yaptı`,
          actionRequired: true,
          autoResolvable: false,
          metadata: { ipAddress: event.ipAddress, timestamp: event.timestamp },
          createdAt: now
        });
      });

      // Hızlı ardışık işlemler
      const rapidTransactions = await this.detectRapidTransactions();
      rapidTransactions.forEach(userId => {
        alerts.push({
          id: `FIN_${Date.now()}_${userId}`,
          userId,
          type: 'FINANCIAL',
          severity: 'MEDIUM',
          title: 'Hızlı Ardışık İşlem',
          message: `Kullanıcı ${userId} 5 dakikada 5+ işlem yaptı`,
          actionRequired: true,
          autoResolvable: false,
          metadata: { detectionTime: now },
          createdAt: now
        });
      });

      // Büyük miktarlı işlemler
      const largeTransactions = await this.detectLargeTransactions();
      largeTransactions.forEach(transaction => {
        alerts.push({
          id: `FIN_LARGE_${Date.now()}_${transaction.userId}`,
          userId: transaction.userId,
          type: 'FINANCIAL',
          severity: transaction.amount > 100000 ? 'CRITICAL' : 'HIGH',
          title: 'Büyük Miktarlı İşlem',
          message: `${transaction.amount} TL tutarında ${transaction.type} işlemi`,
          actionRequired: true,
          autoResolvable: false,
          metadata: { transactionId: transaction.id, amount: transaction.amount },
          createdAt: now
        });
      });

      return alerts;
    } catch (error) {
      console.error('Security monitoring error:', error);
      return [];
    }
  }

  // Davranışsal anomali tespiti
  async detectBehavioralAnomalies(): Promise<RealTimeAlert[]> {
    const alerts: RealTimeAlert[] = [];
    const now = new Date();

    try {
      // Gece saatlerinde yoğun aktivite
      const nightOwlUsers = await this.detectNightTimeActivity();
      nightOwlUsers.forEach(user => {
        alerts.push({
          id: `BEH_NIGHT_${Date.now()}_${user.id}`,
          userId: user.id,
          type: 'BEHAVIORAL',
          severity: 'MEDIUM',
          title: 'Gece Saatlerinde Yoğun Aktivite',
          message: `${user.username} gece 02:00-06:00 arası aktif`,
          actionRequired: false,
          autoResolvable: true,
          metadata: { activityHours: user.activityHours },
          createdAt: now
        });
      });

      // Aşırı chat kullanımı
      const excessiveChatUsers = await this.detectExcessiveChatUsage();
      excessiveChatUsers.forEach(user => {
        alerts.push({
          id: `BEH_CHAT_${Date.now()}_${user.userId}`,
          userId: user.userId,
          type: 'BEHAVIORAL',
          severity: 'LOW',
          title: 'Aşırı Chat Kullanımı',
          message: `Son 1 saatte ${user.messageCount} mesaj gönderildi`,
          actionRequired: false,
          autoResolvable: true,
          metadata: { messageCount: user.messageCount },
          createdAt: now
        });
      });

      return alerts;
    } catch (error) {
      console.error('Behavioral analysis error:', error);
      return [];
    }
  }

  // Compliance uyarıları
  async generateComplianceAlerts(): Promise<RealTimeAlert[]> {
    const alerts: RealTimeAlert[] = [];
    const now = new Date();

    try {
      // Eksik KYC dokümanları
      const incompleteKYCs = await this.findIncompleteKYCUsers();
      incompleteKYCs.forEach(user => {
        alerts.push({
          id: `COMP_KYC_${Date.now()}_${user.id}`,
          userId: user.id,
          type: 'COMPLIANCE',
          severity: user.totalDeposits > 5000 ? 'HIGH' : 'MEDIUM',
          title: 'KYC Dokümanları Eksik',
          message: `${user.username} için KYC tamamlanmamış (Toplam yatırım: ${user.totalDeposits} TL)`,
          actionRequired: true,
          autoResolvable: false,
          metadata: { totalDeposits: user.totalDeposits },
          createdAt: now
        });
      });

      // Yaş doğrulama gereken kullanıcılar
      const ageVerificationNeeded = await this.findUsersNeedingAgeVerification();
      ageVerificationNeeded.forEach(user => {
        alerts.push({
          id: `COMP_AGE_${Date.now()}_${user.id}`,
          userId: user.id,
          type: 'COMPLIANCE',
          severity: 'CRITICAL',
          title: 'Yaş Doğrulama Gerekli',
          message: `${user.username} için yaş doğrulama belgesi eksik`,
          actionRequired: true,
          autoResolvable: false,
          metadata: {},
          createdAt: now
        });
      });

      return alerts;
    } catch (error) {
      console.error('Compliance alerts error:', error);
      return [];
    }
  }

  // Finansal risk analizi
  async analyzeFinancialRisks(): Promise<RealTimeAlert[]> {
    const alerts: RealTimeAlert[] = [];
    const now = new Date();

    try {
      // Düşük bakiyeli VIP kullanıcılar
      const lowBalanceVIPs = await this.findLowBalanceVIPUsers();
      lowBalanceVIPs.forEach(user => {
        alerts.push({
          id: `FIN_VIP_${Date.now()}_${user.id}`,
          userId: user.id,
          type: 'FINANCIAL',
          severity: 'MEDIUM',
          title: 'VIP Kullanıcı Düşük Bakiye',
          message: `VIP ${user.vipLevel} kullanıcı ${user.username} bakiyesi ${user.balance} TL`,
          actionRequired: false,
          autoResolvable: true,
          metadata: { vipLevel: user.vipLevel, balance: user.balance },
          createdAt: now
        });
      });

      // Bekleyen büyük çekimler
      const pendingLargeWithdrawals = await this.findPendingLargeWithdrawals();
      pendingLargeWithdrawals.forEach(transaction => {
        const daysSinceRequest = Math.floor((now.getTime() - transaction.createdAt.getTime()) / (24 * 60 * 60 * 1000));
        alerts.push({
          id: `FIN_WITHDRAW_${Date.now()}_${transaction.userId}`,
          userId: transaction.userId,
          type: 'FINANCIAL',
          severity: daysSinceRequest > 2 ? 'HIGH' : 'MEDIUM',
          title: 'Bekleyen Büyük Çekim',
          message: `${transaction.amount} TL çekim ${daysSinceRequest} gündür bekliyor`,
          actionRequired: true,
          autoResolvable: false,
          metadata: { transactionId: transaction.id, amount: transaction.amount, daysPending: daysSinceRequest },
          createdAt: now
        });
      });

      return alerts;
    } catch (error) {
      console.error('Financial risk analysis error:', error);
      return [];
    }
  }

  // Otomatik alert çözücü
  async resolveAutoResolvableAlerts(alerts: RealTimeAlert[]): Promise<RealTimeAlert[]> {
    const resolvedAlerts: RealTimeAlert[] = [];

    for (const alert of alerts) {
      if (alert.autoResolvable) {
        try {
          switch (alert.type) {
            case 'BEHAVIORAL':
              if (alert.title.includes('Gece Saatlerinde')) {
                // Sorumluluk oyun önerisi gönder
                await this.sendResponsibleGamingReminder(alert.userId);
                resolvedAlerts.push({ ...alert, actionRequired: false });
              }
              break;

            case 'FINANCIAL':
              if (alert.title.includes('VIP Kullanıcı Düşük Bakiye')) {
                // Özel bonus teklifi gönder
                await this.sendVIPBonusOffer(alert.userId);
                resolvedAlerts.push({ ...alert, actionRequired: false });
              }
              break;
          }
        } catch (error) {
          console.error(`Auto-resolve error for alert ${alert.id}:`, error);
        }
      }
    }

    return resolvedAlerts;
  }

  // Yardımcı metodlar
  private async detectSuspiciousLogins(): Promise<SecurityEvent[]> {
    // Gerçek uygulamada session/login tablosundan çekilir
    return [];
  }

  private async detectRapidTransactions(): Promise<number[]> {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    
    const rapidUsers = await db
      .select({
        userId: transactions.userId,
        count: sql<number>`count(*)`
      })
      .from(transactions)
      .where(gte(transactions.createdAt, fiveMinutesAgo))
      .groupBy(transactions.userId)
      .having(sql`count(*) >= 5`);

    return rapidUsers.map(user => user.userId);
  }

  private async detectLargeTransactions(): Promise<any[]> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    return await db
      .select()
      .from(transactions)
      .where(and(
        gte(transactions.createdAt, oneHourAgo),
        sql`${transactions.amount} > 50000`
      ))
      .limit(10);
  }

  private async detectNightTimeActivity(): Promise<any[]> {
    // Mock data - gerçek uygulamada session aktivite loglarından analiz edilir
    return [];
  }

  private async detectExcessiveChatUsage(): Promise<any[]> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const excessiveUsers = await db
      .select({
        userId: chatSessions.userId,
        messageCount: sql<number>`coalesce(${chatSessions.totalMessages}, 0)`
      })
      .from(chatSessions)
      .where(and(
        gte(chatSessions.lastActivity, oneHourAgo),
        sql`coalesce(${chatSessions.totalMessages}, 0) > 50`
      ));

    return excessiveUsers;
  }

  private async findIncompleteKYCUsers(): Promise<any[]> {
    return await db
      .select()
      .from(users)
      .where(and(
        sql`${users.firstName} IS NULL OR ${users.lastName} IS NULL OR ${users.birthdate} IS NULL`,
        sql`${users.totalDeposits} > 1000`
      ))
      .limit(20);
  }

  private async findUsersNeedingAgeVerification(): Promise<any[]> {
    return await db
      .select()
      .from(users)
      .where(sql`${users.birthdate} IS NULL AND ${users.totalDeposits} > 0`)
      .limit(10);
  }

  private async findLowBalanceVIPUsers(): Promise<any[]> {
    return await db
      .select()
      .from(users)
      .where(and(
        sql`${users.vipLevel} > 0`,
        sql`${users.balance} < 100`
      ))
      .limit(10);
  }

  private async findPendingLargeWithdrawals(): Promise<any[]> {
    return await db
      .select()
      .from(transactions)
      .where(and(
        eq(transactions.type, 'withdrawal'),
        eq(transactions.status, 'pending'),
        sql`${transactions.amount} > 10000`
      ))
      .orderBy(desc(transactions.createdAt))
      .limit(10);
  }

  private async sendResponsibleGamingReminder(userId: number): Promise<void> {
    console.log(`[AUTO-RESOLVE] Sorumluluk oyun hatırlatması gönderildi - User ${userId}`);
  }

  private async sendVIPBonusOffer(userId: number): Promise<void> {
    console.log(`[AUTO-RESOLVE] VIP bonus teklifi gönderildi - User ${userId}`);
  }

  // Ana alert koordinatörü
  async generateAllAlerts(): Promise<RealTimeAlert[]> {
    try {
      const [securityAlerts, behavioralAlerts, complianceAlerts, financialAlerts] = await Promise.all([
        this.monitorSecurityEvents(),
        this.detectBehavioralAnomalies(),
        this.generateComplianceAlerts(),
        this.analyzeFinancialRisks()
      ]);

      const allAlerts = [
        ...securityAlerts,
        ...behavioralAlerts,
        ...complianceAlerts,
        ...financialAlerts
      ];

      // Otomatik çözülebilir alertleri işle
      const resolvedAlerts = await this.resolveAutoResolvableAlerts(allAlerts);

      // Öncelik sırasına göre sırala
      const sortedAlerts = allAlerts.sort((a, b) => {
        const severityOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
        return severityOrder[b.severity] - severityOrder[a.severity];
      });

      console.log(`[ALERT SYSTEM] Generated ${sortedAlerts.length} alerts, auto-resolved ${resolvedAlerts.length}`);
      
      return sortedAlerts;
    } catch (error) {
      console.error('Alert generation error:', error);
      return [];
    }
  }
}

export const realTimeAlerts = new RealTimeAlertsService();