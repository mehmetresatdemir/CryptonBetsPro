import { db } from '../db';
import { chatSessions, chatMessages, users, transactions } from '@shared/schema';
import { eq, sql, desc, gte, and } from 'drizzle-orm';

interface PerformanceMetrics {
  timestamp: Date;
  responseTime: number;
  systemLoad: number;
  aiAccuracy: number;
  userSatisfaction: number;
  autoResolutionRate: number;
  alertCount: number;
  criticalIssues: number;
}

interface SystemHealth {
  status: 'healthy' | 'warning' | 'critical';
  cpuUsage: number;
  memoryUsage: number;
  dbConnections: number;
  apiResponseTime: number;
  errorRate: number;
  activeUsers: number;
}

export class PerformanceMonitorService {
  private metricsBuffer: PerformanceMetrics[] = [];
  private readonly MAX_BUFFER_SIZE = 100;

  // Gerçek zamanlı performans metrikleri
  async collectRealTimeMetrics(): Promise<PerformanceMetrics> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    try {
      // Son 1 saatin ortalama yanıt süresi
      const avgResponseTime = await this.calculateAverageResponseTime(oneHourAgo);
      
      // AI doğruluk oranı (confidence score > 0.8 olan mesajlar)
      const aiAccuracy = await this.calculateAIAccuracy(oneHourAgo);
      
      // Kullanıcı memnuniyeti (çözülen vs çözülemeyen problemler)
      const userSatisfaction = await this.calculateUserSatisfaction(oneHourAgo);
      
      // Otomatik çözüm oranı
      const autoResolutionRate = await this.calculateAutoResolutionRate(oneHourAgo);
      
      const metrics: PerformanceMetrics = {
        timestamp: now,
        responseTime: avgResponseTime,
        systemLoad: await this.getSystemLoad(),
        aiAccuracy: aiAccuracy,
        userSatisfaction: userSatisfaction,
        autoResolutionRate: autoResolutionRate,
        alertCount: await this.getActiveAlertCount(),
        criticalIssues: await this.getCriticalIssueCount()
      };

      this.addToBuffer(metrics);
      return metrics;
    } catch (error) {
      console.error('Performance metrics collection error:', error);
      return this.getDefaultMetrics();
    }
  }

  // Sistem sağlık durumu
  async getSystemHealth(): Promise<SystemHealth> {
    try {
      const now = new Date();
      const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

      // Aktif kullanıcı sayısı
      const activeUsers = await this.getActiveUserCount(fiveMinutesAgo);
      
      // API yanıt süresi
      const apiResponseTime = await this.calculateAverageResponseTime(fiveMinutesAgo);
      
      // Hata oranı
      const errorRate = await this.calculateErrorRate(fiveMinutesAgo);

      const health: SystemHealth = {
        status: this.determineSystemStatus(apiResponseTime, errorRate, activeUsers),
        cpuUsage: Math.random() * 100, // Gerçek uygulamada system metrics'ten gelir
        memoryUsage: Math.random() * 100,
        dbConnections: await this.getActiveDbConnections(),
        apiResponseTime: apiResponseTime,
        errorRate: errorRate,
        activeUsers: activeUsers
      };

      return health;
    } catch (error) {
      console.error('System health check error:', error);
      return {
        status: 'critical',
        cpuUsage: 0,
        memoryUsage: 0,
        dbConnections: 0,
        apiResponseTime: 0,
        errorRate: 100,
        activeUsers: 0
      };
    }
  }

  // Performans optimizasyon önerileri
  async generateOptimizationRecommendations(): Promise<string[]> {
    const metrics = await this.collectRealTimeMetrics();
    const health = await this.getSystemHealth();
    const recommendations: string[] = [];

    // Yanıt süresi optimizasyonu
    if (metrics.responseTime > 3000) {
      recommendations.push('AI response time is high (>3s). Consider caching frequent queries or optimizing model parameters.');
    }

    // AI doğruluk optimizasyonu
    if (metrics.aiAccuracy < 0.85) {
      recommendations.push('AI accuracy below 85%. Review training data and fine-tune intent recognition models.');
    }

    // Kullanıcı memnuniyeti
    if (metrics.userSatisfaction < 0.8) {
      recommendations.push('User satisfaction below 80%. Analyze unresolved cases and improve response quality.');
    }

    // Sistem yükü
    if (health.cpuUsage > 80) {
      recommendations.push('High CPU usage detected. Consider scaling or optimizing resource-intensive operations.');
    }

    if (health.memoryUsage > 85) {
      recommendations.push('High memory usage. Check for memory leaks and optimize data structures.');
    }

    // Kritik sorunlar
    if (metrics.criticalIssues > 5) {
      recommendations.push('Multiple critical issues detected. Review alert system and escalation procedures.');
    }

    // Database performance
    if (health.dbConnections > 50) {
      recommendations.push('High database connection count. Implement connection pooling or query optimization.');
    }

    return recommendations;
  }

  // Trend analizi
  async analyzeTrends(hours: number = 24): Promise<{
    responseTimeTrend: 'improving' | 'stable' | 'degrading';
    accuracyTrend: 'improving' | 'stable' | 'degrading';
    satisfactionTrend: 'improving' | 'stable' | 'degrading';
    recommendations: string[];
  }> {
    const recent = this.metricsBuffer.slice(-10);
    const older = this.metricsBuffer.slice(-20, -10);

    if (recent.length < 5 || older.length < 5) {
      return {
        responseTimeTrend: 'stable',
        accuracyTrend: 'stable',
        satisfactionTrend: 'stable',
        recommendations: ['Insufficient data for trend analysis. Collect more metrics.']
      };
    }

    const recentAvgResponseTime = recent.reduce((sum, m) => sum + m.responseTime, 0) / recent.length;
    const olderAvgResponseTime = older.reduce((sum, m) => sum + m.responseTime, 0) / older.length;

    const recentAvgAccuracy = recent.reduce((sum, m) => sum + m.aiAccuracy, 0) / recent.length;
    const olderAvgAccuracy = older.reduce((sum, m) => sum + m.aiAccuracy, 0) / older.length;

    const recentAvgSatisfaction = recent.reduce((sum, m) => sum + m.userSatisfaction, 0) / recent.length;
    const olderAvgSatisfaction = older.reduce((sum, m) => sum + m.userSatisfaction, 0) / older.length;

    return {
      responseTimeTrend: this.getTrend(recentAvgResponseTime, olderAvgResponseTime, true),
      accuracyTrend: this.getTrend(recentAvgAccuracy, olderAvgAccuracy, false),
      satisfactionTrend: this.getTrend(recentAvgSatisfaction, olderAvgSatisfaction, false),
      recommendations: await this.generateOptimizationRecommendations()
    };
  }

  // Yardımcı metodlar
  private async calculateAverageResponseTime(since: Date): Promise<number> {
    const messages = await db
      .select({ responseTime: chatMessages.responseTime })
      .from(chatMessages)
      .where(and(
        gte(chatMessages.createdAt, since),
        sql`${chatMessages.responseTime} IS NOT NULL`
      ))
      .limit(100);

    if (messages.length === 0) return 2000; // Default 2s
    return messages.reduce((sum, msg) => sum + (msg.responseTime || 0), 0) / messages.length;
  }

  private async calculateAIAccuracy(since: Date): Promise<number> {
    const messages = await db
      .select({ confidence: chatMessages.confidence })
      .from(chatMessages)
      .where(and(
        gte(chatMessages.createdAt, since),
        eq(chatMessages.role, 'assistant'),
        sql`${chatMessages.confidence} IS NOT NULL`
      ))
      .limit(100);

    if (messages.length === 0) return 0.85; // Default 85%
    const highConfidenceCount = messages.filter(msg => (msg.confidence || 0) > 0.8).length;
    return highConfidenceCount / messages.length;
  }

  private async calculateUserSatisfaction(since: Date): Promise<number> {
    // Çözülen vs çözülmeyen session'lar
    const sessions = await db
      .select({ resolvedIssue: chatSessions.resolvedIssue })
      .from(chatSessions)
      .where(gte(chatSessions.lastActivity, since))
      .limit(100);

    if (sessions.length === 0) return 0.8; // Default 80%
    const resolvedCount = sessions.filter(session => session.resolvedIssue === true).length;
    return resolvedCount / sessions.length;
  }

  private async calculateAutoResolutionRate(since: Date): Promise<number> {
    // Automatic resolution metadata'sı olan mesajlar
    const autoResolvedCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(chatMessages)
      .where(and(
        gte(chatMessages.createdAt, since),
        sql`${chatMessages.metadata}->>'autoResolved' = 'true'`
      ));

    const totalCount = await db
      .select({ count: sql<number>`count(*)` })
      .from(chatMessages)
      .where(and(
        gte(chatMessages.createdAt, since),
        eq(chatMessages.role, 'assistant')
      ));

    const resolved = autoResolvedCount[0]?.count || 0;
    const total = totalCount[0]?.count || 1;
    return resolved / total;
  }

  private async getSystemLoad(): Promise<number> {
    // Gerçek uygulamada sistem metrikleri kullanılır
    return Math.random() * 100;
  }

  private async getActiveAlertCount(): Promise<number> {
    // Alert sistemi entegrasyonu gerekir
    return Math.floor(Math.random() * 10);
  }

  private async getCriticalIssueCount(): Promise<number> {
    // Critical alert count
    return Math.floor(Math.random() * 3);
  }

  private async getActiveUserCount(since: Date): Promise<number> {
    const result = await db
      .select({ count: sql<number>`count(distinct ${chatSessions.userId})` })
      .from(chatSessions)
      .where(gte(chatSessions.lastActivity, since));

    return result[0]?.count || 0;
  }

  private async calculateErrorRate(since: Date): Promise<number> {
    // Hata oranı hesaplama (gerçek uygulamada error logs'tan)
    return Math.random() * 5; // 0-5% error rate
  }

  private async getActiveDbConnections(): Promise<number> {
    // Database connection pool size
    return Math.floor(Math.random() * 20) + 5;
  }

  private determineSystemStatus(responseTime: number, errorRate: number, activeUsers: number): 'healthy' | 'warning' | 'critical' {
    if (errorRate > 10 || responseTime > 5000) return 'critical';
    if (errorRate > 5 || responseTime > 3000 || activeUsers > 100) return 'warning';
    return 'healthy';
  }

  private getTrend(recent: number, older: number, isInverse: boolean): 'improving' | 'stable' | 'degrading' {
    const change = (recent - older) / older;
    const threshold = 0.05; // 5% change threshold

    if (Math.abs(change) < threshold) return 'stable';
    
    if (isInverse) {
      // For metrics where lower is better (like response time)
      return change < 0 ? 'improving' : 'degrading';
    } else {
      // For metrics where higher is better (like accuracy)
      return change > 0 ? 'improving' : 'degrading';
    }
  }

  private addToBuffer(metrics: PerformanceMetrics): void {
    this.metricsBuffer.push(metrics);
    if (this.metricsBuffer.length > this.MAX_BUFFER_SIZE) {
      this.metricsBuffer.shift(); // Remove oldest
    }
  }

  private getDefaultMetrics(): PerformanceMetrics {
    return {
      timestamp: new Date(),
      responseTime: 2000,
      systemLoad: 50,
      aiAccuracy: 0.85,
      userSatisfaction: 0.8,
      autoResolutionRate: 0.6,
      alertCount: 0,
      criticalIssues: 0
    };
  }

  // Public API for external monitoring
  async getPerformanceReport(): Promise<{
    currentMetrics: PerformanceMetrics;
    systemHealth: SystemHealth;
    trends: any;
    recommendations: string[];
  }> {
    const [currentMetrics, systemHealth, trends] = await Promise.all([
      this.collectRealTimeMetrics(),
      this.getSystemHealth(),
      this.analyzeTrends()
    ]);

    const recommendations = await this.generateOptimizationRecommendations();

    return {
      currentMetrics,
      systemHealth,
      trends,
      recommendations
    };
  }
}

export const performanceMonitor = new PerformanceMonitorService();