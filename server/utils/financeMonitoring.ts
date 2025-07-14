import { db } from '../db';
import { finance_transactions, payment_provider_logs, webhook_logs, api_access_logs } from '@shared/schema';
import { eq, and, gte, count, avg, sum } from 'drizzle-orm';
import { FINANCE_CONFIG } from '../config/financeConfig';

export class FinanceMonitoring {
  
  // Sistem sağlık durumu kontrol
  static async getSystemHealth() {
    try {
      const now = new Date();
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Son 1 saat içindeki işlemler
      const recentTransactions = await db.select()
        .from(finance_transactions)
        .where(gte(finance_transactions.createdAt, oneHourAgo));

      // Başarı oranı hesaplama
      const totalTransactions = recentTransactions.length;
      const successfulTransactions = recentTransactions.filter(t => t.status === 'completed').length;
      const failedTransactions = recentTransactions.filter(t => t.status === 'failed').length;
      const successRate = totalTransactions > 0 ? successfulTransactions / totalTransactions : 1;

      // API yanıt süreleri
      const apiLogs = await db.select()
        .from(payment_provider_logs)
        .where(and(
          eq(payment_provider_logs.provider, 'finance_company'),
          gte(payment_provider_logs.createdAt, oneHourAgo)
        ));

      const avgResponseTime = apiLogs.length > 0 
        ? apiLogs.reduce((sum, log) => sum + (log.responseTime || 0), 0) / apiLogs.length
        : 0;

      // Webhook durumu
      const webhookLogs = await db.select()
        .from(webhook_logs)
        .where(and(
          eq(webhook_logs.source, 'finance_company'),
          gte(webhook_logs.createdAt, oneHourAgo)
        ));

      const webhookSuccessRate = webhookLogs.length > 0
        ? webhookLogs.filter(w => w.processed).length / webhookLogs.length
        : 1;

      // Sistem durumu belirleme
      const isHealthy = 
        successRate >= FINANCE_CONFIG.MONITORING.ALERT_THRESHOLDS.SUCCESS_RATE &&
        avgResponseTime <= FINANCE_CONFIG.MONITORING.ALERT_THRESHOLDS.RESPONSE_TIME &&
        webhookSuccessRate >= 0.95;

      return {
        status: isHealthy ? 'healthy' : 'warning',
        timestamp: now.toISOString(),
        metrics: {
          transactions: {
            total: totalTransactions,
            successful: successfulTransactions,
            failed: failedTransactions,
            success_rate: successRate,
            pending: recentTransactions.filter(t => t.status === 'pending').length
          },
          api: {
            total_requests: apiLogs.length,
            avg_response_time: Math.round(avgResponseTime),
            successful_requests: apiLogs.filter(l => l.success).length,
            failed_requests: apiLogs.filter(l => !l.success).length
          },
          webhooks: {
            total: webhookLogs.length,
            processed: webhookLogs.filter(w => w.processed).length,
            success_rate: webhookSuccessRate,
            failed: webhookLogs.filter(w => !w.processed).length
          }
        },
        alerts: await this.generateAlerts()
      };

    } catch (error: any) {
      return {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error.message,
        metrics: null,
        alerts: ['Sistem sağlık kontrolü başarısız']
      };
    }
  }

  // Performans metrikleri
  static async getPerformanceMetrics(timeRange: '1h' | '24h' | '7d' = '24h') {
    try {
      const now = new Date();
      let since: Date;
      
      switch (timeRange) {
        case '1h':
          since = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case '24h':
          since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
          break;
        case '7d':
          since = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        default:
          since = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      }

      // İşlem istatistikleri
      const transactions = await db.select()
        .from(finance_transactions)
        .where(gte(finance_transactions.createdAt, since));

      const transactionStats = {
        total: transactions.length,
        deposits: transactions.filter(t => t.type === 'deposit').length,
        withdrawals: transactions.filter(t => t.type === 'withdraw').length,
        completed: transactions.filter(t => t.status === 'completed').length,
        pending: transactions.filter(t => t.status === 'pending').length,
        failed: transactions.filter(t => t.status === 'failed').length,
        total_volume: transactions.reduce((sum, t) => sum + (t.amount || 0), 0),
        avg_amount: transactions.length > 0 
          ? transactions.reduce((sum, t) => sum + (t.amount || 0), 0) / transactions.length
          : 0
      };

      // Ödeme yöntemi dağılımı
      const paymentMethodStats = transactions.reduce((acc, t) => {
        const method = t.paymentMethod || 'unknown';
        if (!acc[method]) {
          acc[method] = { count: 0, volume: 0, success_rate: 0 };
        }
        acc[method].count++;
        acc[method].volume += t.amount || 0;
        return acc;
      }, {} as Record<string, any>);

      // Başarı oranları hesaplama
      Object.keys(paymentMethodStats).forEach(method => {
        const methodTransactions = transactions.filter(t => t.paymentMethod === method);
        const successful = methodTransactions.filter(t => t.status === 'completed').length;
        paymentMethodStats[method].success_rate = methodTransactions.length > 0 
          ? successful / methodTransactions.length 
          : 0;
      });

      // API performans metrikleri
      const apiLogs = await db.select()
        .from(payment_provider_logs)
        .where(and(
          eq(payment_provider_logs.provider, 'finance_company'),
          gte(payment_provider_logs.createdAt, since)
        ));

      const apiStats = {
        total_requests: apiLogs.length,
        successful_requests: apiLogs.filter(l => l.success).length,
        failed_requests: apiLogs.filter(l => !l.success).length,
        avg_response_time: apiLogs.length > 0 
          ? apiLogs.reduce((sum, l) => sum + (l.responseTime || 0), 0) / apiLogs.length
          : 0,
        slowest_request: Math.max(...apiLogs.map(l => l.responseTime || 0), 0),
        fastest_request: Math.min(...apiLogs.map(l => l.responseTime || Infinity).filter(t => t !== Infinity), 0)
      };

      return {
        time_range: timeRange,
        period: {
          from: since.toISOString(),
          to: now.toISOString()
        },
        transactions: transactionStats,
        payment_methods: paymentMethodStats,
        api_performance: apiStats,
        success_rates: {
          overall: transactionStats.total > 0 ? transactionStats.completed / transactionStats.total : 0,
          deposits: transactionStats.deposits > 0 
            ? transactions.filter(t => t.type === 'deposit' && t.status === 'completed').length / transactionStats.deposits
            : 0,
          withdrawals: transactionStats.withdrawals > 0
            ? transactions.filter(t => t.type === 'withdraw' && t.status === 'completed').length / transactionStats.withdrawals
            : 0
        }
      };

    } catch (error: any) {
      throw new Error(`Performans metrikleri alınamadı: ${error.message}`);
    }
  }

  // Alert sistemi
  static async generateAlerts(): Promise<string[]> {
    const alerts: string[] = [];
    
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      // Yüksek hata oranı kontrolü
      const recentTransactions = await db.select()
        .from(finance_transactions)
        .where(gte(finance_transactions.createdAt, oneHourAgo));

      if (recentTransactions.length > 10) {
        const errorRate = recentTransactions.filter(t => t.status === 'failed').length / recentTransactions.length;
        if (errorRate > FINANCE_CONFIG.MONITORING.ALERT_THRESHOLDS.ERROR_RATE) {
          alerts.push(`Yüksek hata oranı: %${(errorRate * 100).toFixed(1)} (Son 1 saat)`);
        }
      }

      // Yavaş API yanıtları
      const apiLogs = await db.select()
        .from(payment_provider_logs)
        .where(and(
          eq(payment_provider_logs.provider, 'finance_company'),
          gte(payment_provider_logs.createdAt, oneHourAgo)
        ));

      if (apiLogs.length > 0) {
        const avgResponseTime = apiLogs.reduce((sum, l) => sum + (l.responseTime || 0), 0) / apiLogs.length;
        if (avgResponseTime > FINANCE_CONFIG.MONITORING.ALERT_THRESHOLDS.RESPONSE_TIME) {
          alerts.push(`Yavaş API yanıtları: ${Math.round(avgResponseTime)}ms ortalama`);
        }
      }

      // Başarısız webhook'lar
      const failedWebhooks = await db.select()
        .from(webhook_logs)
        .where(and(
          eq(webhook_logs.source, 'finance_company'),
          eq(webhook_logs.processed, false),
          gte(webhook_logs.createdAt, oneHourAgo)
        ));

      if (failedWebhooks.length > 5) {
        alerts.push(`Çok sayıda başarısız webhook: ${failedWebhooks.length} adet`);
      }

      // Bekleyen işlemler
      const pendingTransactions = await db.select()
        .from(finance_transactions)
        .where(and(
          eq(finance_transactions.status, 'pending'),
          gte(finance_transactions.createdAt, new Date(Date.now() - 2 * 60 * 60 * 1000)) // 2 saat
        ));

      if (pendingTransactions.length > 10) {
        alerts.push(`Çok sayıda bekleyen işlem: ${pendingTransactions.length} adet (2+ saat)`);
      }

    } catch (error: any) {
      alerts.push(`Alert sistemi hatası: ${error.message}`);
    }

    return alerts;
  }

  // Rate limiting istatistikleri
  static async getRateLimitStats() {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      
      const accessLogs = await db.select()
        .from(api_access_logs)
        .where(gte(api_access_logs.createdAt, oneHourAgo));

      const ipStats = accessLogs.reduce((acc, log) => {
        const ip = log.ipAddress || 'unknown';
        if (!acc[ip]) {
          acc[ip] = { requests: 0, rate_limited: 0, last_request: null };
        }
        acc[ip].requests++;
        if (log.rateLimited) {
          acc[ip].rate_limited++;
        }
        acc[ip].last_request = log.createdAt;
        return acc;
      }, {} as Record<string, any>);

      const clientStats = accessLogs.reduce((acc, log) => {
        const client = log.clientName || 'unknown';
        if (!acc[client]) {
          acc[client] = { requests: 0, errors: 0, avg_response_time: 0 };
        }
        acc[client].requests++;
        if (!log.success) {
          acc[client].errors++;
        }
        return acc;
      }, {} as Record<string, any>);

      return {
        period: '1h',
        total_requests: accessLogs.length,
        rate_limited_requests: accessLogs.filter(l => l.rateLimited).length,
        unique_ips: Object.keys(ipStats).length,
        ip_statistics: ipStats,
        client_statistics: clientStats,
        top_ips: Object.entries(ipStats)
          .sort(([,a], [,b]) => (b as any).requests - (a as any).requests)
          .slice(0, 10)
      };

    } catch (error: any) {
      throw new Error(`Rate limit istatistikleri alınamadı: ${error.message}`);
    }
  }

  // Günlük rapor oluşturma
  static async generateDailyReport() {
    try {
      const now = new Date();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      const healthCheck = await this.getSystemHealth();
      const performance = await this.getPerformanceMetrics('24h');
      const rateLimits = await this.getRateLimitStats();

      return {
        date: now.toISOString().split('T')[0],
        generated_at: now.toISOString(),
        system_health: healthCheck,
        performance_metrics: performance,
        rate_limit_stats: rateLimits,
        summary: {
          total_transactions: performance.transactions.total,
          success_rate: performance.success_rates.overall,
          total_volume: performance.transactions.total_volume,
          avg_response_time: performance.api_performance.avg_response_time,
          alerts_count: healthCheck.alerts.length
        },
        recommendations: this.generateRecommendations(performance, healthCheck)
      };

    } catch (error: any) {
      throw new Error(`Günlük rapor oluşturulamadı: ${error.message}`);
    }
  }

  // Optimizasyon önerileri
  private static generateRecommendations(performance: any, health: any): string[] {
    const recommendations: string[] = [];

    if (performance.success_rates.overall < 0.95) {
      recommendations.push('Başarı oranını artırmak için hata analizi yapın');
    }

    if (performance.api_performance.avg_response_time > 3000) {
      recommendations.push('API yanıt sürelerini optimize edin');
    }

    if (health.metrics.webhooks.success_rate < 0.95) {
      recommendations.push('Webhook işleme güvenilirliğini artırın');
    }

    if (performance.transactions.failed > performance.transactions.completed * 0.1) {
      recommendations.push('Başarısız işlem oranı yüksek - finans şirketi ile koordinasyon gerekli');
    }

    return recommendations;
  }

  // Log temizleme
  static async cleanupOldLogs(retentionDays: number = 30) {
    try {
      const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

      // Eski logları sil
      const deletedApiLogs = await db.delete(payment_provider_logs)
        .where(gte(payment_provider_logs.createdAt, cutoffDate));

      const deletedWebhookLogs = await db.delete(webhook_logs)
        .where(gte(webhook_logs.createdAt, cutoffDate));

      const deletedAccessLogs = await db.delete(api_access_logs)
        .where(gte(api_access_logs.createdAt, cutoffDate));

      return {
        success: true,
        retention_days: retentionDays,
        cutoff_date: cutoffDate.toISOString(),
        deleted_counts: {
          api_logs: deletedApiLogs,
          webhook_logs: deletedWebhookLogs,
          access_logs: deletedAccessLogs
        }
      };

    } catch (error: any) {
      throw new Error(`Log temizleme hatası: ${error.message}`);
    }
  }
}