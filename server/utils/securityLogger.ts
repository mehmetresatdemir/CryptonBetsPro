import fs from 'fs';
import path from 'path';

// Güvenlik olaylarını loglama
export class SecurityLogger {
  private static logFile = path.join(process.cwd(), 'logs', 'security.log');

  static init() {
    // Logs klasörünü oluştur
    const logsDir = path.dirname(this.logFile);
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  static log(level: 'INFO' | 'WARNING' | 'CRITICAL', event: string, details: any) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      event,
      details: typeof details === 'object' ? JSON.stringify(details) : details
    };

    const logLine = JSON.stringify(logEntry) + '\n';
    
    // Console'a da yaz
    console.log(`[SECURITY ${level}] ${event}:`, details);
    
    // Dosyaya yaz
    try {
      fs.appendFileSync(this.logFile, logLine);
    } catch (error) {
      console.error('Security log yazma hatası:', error);
    }
  }

  static logVipChange(adminId: number, userId: number, oldLevel: number, newLevel: number, reason: string) {
    this.log('WARNING', 'VIP_LEVEL_CHANGE', {
      adminId,
      userId,
      oldLevel,
      newLevel,
      reason,
      action: 'ADMIN_VIP_CHANGE'
    });
  }

  static logBonusGiven(adminId: number, userId: number, amount: number, description: string) {
    this.log('WARNING', 'BONUS_GIVEN', {
      adminId,
      userId,
      amount,
      description,
      action: 'ADMIN_BONUS_GRANT'
    });
  }

  static logFailedAdminAccess(ip: string, username: string) {
    this.log('CRITICAL', 'FAILED_ADMIN_ACCESS', {
      ip,
      username,
      action: 'ADMIN_LOGIN_FAILED'
    });
  }
}

// Logger'ı başlat
SecurityLogger.init();