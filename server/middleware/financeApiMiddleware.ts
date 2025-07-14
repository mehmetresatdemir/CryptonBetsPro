import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { db } from '../db';
import { api_access_logs } from '@shared/schema';
import { eq, and, gte } from 'drizzle-orm';

// IP whitelist - Finans şirketi IP'leri
const ALLOWED_IPS = [
  '127.0.0.1',
  '::1',
  // Finans şirketi IP'leri buraya eklenecek
  // '185.123.45.67',
  // '195.234.56.78',
];

// API anahtar doğrulama
const VALID_API_KEYS = new Set([
  process.env.FINANCE_COMPANY_API_KEY,
  process.env.FINANCE_API_KEY_BACKUP, // Backup key
]);

export interface AuthenticatedRequest extends Request {
  clientInfo?: {
    clientName: string;
    apiKey: string;
    ipAddress: string;
  };
}

// IP whitelist kontrolü
export const ipWhitelistMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const clientIp = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'] as string;
  
  // Development ortamında IP kontrolünü atla
  if (process.env.NODE_ENV === 'development') {
    return next();
  }

  if (!ALLOWED_IPS.includes(clientIp)) {
    console.warn(`Unauthorized IP access attempt: ${clientIp}`);
    return res.status(403).json({
      success: false,
      error: 'IP adresi yetkili değil',
      code: 'IP_NOT_ALLOWED'
    });
  }

  next();
};

// API anahtar doğrulama
export const apiKeyMiddleware = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const apiKey = req.headers.authorization?.replace('Bearer ', '');
  const clientIp = req.ip || req.connection.remoteAddress || '0.0.0.0';
  const userAgent = req.headers['user-agent'] || '';
  const requestId = req.headers['x-request-id'] as string || `REQ_${Date.now()}`;

  try {
    if (!apiKey) {
      await logApiAccess({
        clientName: 'unknown',
        apiKey: 'missing',
        endpoint: req.path,
        method: req.method,
        ipAddress: clientIp,
        userAgent,
        requestId,
        responseStatus: 401,
        responseTime: Date.now() - startTime,
        success: false,
        errorMessage: 'API anahtarı eksik'
      });

      return res.status(401).json({
        success: false,
        error: 'API anahtarı gerekli',
        code: 'API_KEY_MISSING'
      });
    }

    if (!VALID_API_KEYS.has(apiKey)) {
      await logApiAccess({
        clientName: 'unknown',
        apiKey: apiKey.substring(0, 8) + '...',
        endpoint: req.path,
        method: req.method,
        ipAddress: clientIp,
        userAgent,
        requestId,
        responseStatus: 401,
        responseTime: Date.now() - startTime,
        success: false,
        errorMessage: 'Geçersiz API anahtarı'
      });

      return res.status(401).json({
        success: false,
        error: 'Geçersiz API anahtarı',
        code: 'API_KEY_INVALID'
      });
    }

    // Rate limiting kontrolü
    const isRateLimited = await checkRateLimit(clientIp);
    if (isRateLimited) {
      await logApiAccess({
        clientName: 'finance_company',
        apiKey: apiKey.substring(0, 8) + '...',
        endpoint: req.path,
        method: req.method,
        ipAddress: clientIp,
        userAgent,
        requestId,
        responseStatus: 429,
        responseTime: Date.now() - startTime,
        success: false,
        rateLimited: true,
        errorMessage: 'Rate limit aşıldı'
      });

      return res.status(429).json({
        success: false,
        error: 'Çok fazla istek gönderildi',
        code: 'RATE_LIMITED',
        retryAfter: 60
      });
    }

    // Client bilgilerini request'e ekle
    req.clientInfo = {
      clientName: 'finance_company',
      apiKey: apiKey.substring(0, 8) + '...',
      ipAddress: clientIp
    };

    // Başarılı doğrulama log
    res.on('finish', async () => {
      await logApiAccess({
        clientName: 'finance_company',
        apiKey: req.clientInfo!.apiKey,
        endpoint: req.path,
        method: req.method,
        ipAddress: clientIp,
        userAgent,
        requestId,
        responseStatus: res.statusCode,
        responseTime: Date.now() - startTime,
        success: res.statusCode < 400,
        errorMessage: res.statusCode >= 400 ? 'API hatası' : undefined
      });
    });

    next();

  } catch (error: any) {
    await logApiAccess({
      clientName: 'unknown',
      apiKey: apiKey?.substring(0, 8) + '...' || 'missing',
      endpoint: req.path,
      method: req.method,
      ipAddress: clientIp,
      userAgent,
      requestId,
      responseStatus: 500,
      responseTime: Date.now() - startTime,
      success: false,
      errorMessage: error.message
    });

    return res.status(500).json({
      success: false,
      error: 'Doğrulama hatası',
      code: 'AUTH_ERROR'
    });
  }
};

// HMAC imza doğrulama
export const hmacMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const signature = req.headers['x-signature'] as string;
  const timestamp = req.headers['x-timestamp'] as string;
  const secretKey = process.env.FINANCE_COMPANY_SECRET || '';

  if (!signature || !timestamp) {
    return res.status(400).json({
      success: false,
      error: 'HMAC imzası ve timestamp gerekli',
      code: 'HMAC_MISSING'
    });
  }

  // Timestamp kontrolü (5 dakika tolerance)
  const now = Math.floor(Date.now() / 1000);
  const requestTime = parseInt(timestamp);
  if (Math.abs(now - requestTime) > 300) {
    return res.status(400).json({
      success: false,
      error: 'İstek zamanı geçersiz',
      code: 'TIMESTAMP_INVALID'
    });
  }

  try {
    // HMAC imza oluştur
    const message = JSON.stringify(req.body || {}) + timestamp;
    const expectedSignature = crypto
      .createHmac('sha256', secretKey)
      .update(message)
      .digest('hex');

    // İmza karşılaştır
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return res.status(400).json({
        success: false,
        error: 'HMAC imzası geçersiz',
        code: 'HMAC_INVALID'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'HMAC doğrulama hatası',
      code: 'HMAC_ERROR'
    });
  }
};

// Rate limiting kontrolü
async function checkRateLimit(ipAddress: string): Promise<boolean> {
  try {
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000);
    
    const recentRequests = await db.select()
      .from(api_access_logs)
      .where(and(
        eq(api_access_logs.ipAddress, ipAddress),
        gte(api_access_logs.createdAt, oneMinuteAgo)
      ));

    // Dakikada maksimum 100 istek
    return recentRequests.length >= 100;
  } catch (error) {
    console.error('Rate limit check error:', error);
    return false; // Hata durumunda izin ver
  }
}

// API erişim log kaydet
async function logApiAccess(logData: {
  clientName: string;
  apiKey: string;
  endpoint: string;
  method: string;
  ipAddress: string;
  userAgent: string;
  requestId: string;
  responseStatus: number;
  responseTime: number;
  success: boolean;
  rateLimited?: boolean;
  errorMessage?: string;
}) {
  try {
    await db.insert(api_access_logs).values({
      clientName: logData.clientName,
      apiKey: logData.apiKey,
      endpoint: logData.endpoint,
      method: logData.method,
      ipAddress: logData.ipAddress,
      userAgent: logData.userAgent,
      requestId: logData.requestId,
      responseStatus: logData.responseStatus,
      responseTime: logData.responseTime,
      success: logData.success,
      rateLimited: logData.rateLimited || false,
      errorMessage: logData.errorMessage,
    });
  } catch (error) {
    console.error('Failed to log API access:', error);
  }
}

// Webhook imza doğrulama
export const webhookSignatureMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const signature = req.headers['x-webhook-signature'] as string;
  const timestamp = req.headers['x-timestamp'] as string;
  const webhookSecret = process.env.FINANCE_COMPANY_WEBHOOK_SECRET || '';

  if (!signature || !timestamp) {
    return res.status(400).json({
      success: false,
      error: 'Webhook imzası ve timestamp gerekli'
    });
  }

  try {
    const message = JSON.stringify(req.body) + timestamp;
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(message)
      .digest('hex');

    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      return res.status(400).json({
        success: false,
        error: 'Webhook imzası geçersiz'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      error: 'Webhook doğrulama hatası'
    });
  }
};