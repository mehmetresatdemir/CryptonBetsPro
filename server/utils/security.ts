import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import crypto from 'crypto';

// CSRF Token oluşturma ve doğrulama
export class CSRFProtection {
  private static tokens = new Map<string, { token: string; expires: number }>();
  
  // CSRF token oluştur
  static generateToken(sessionId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expires = Date.now() + (60 * 60 * 1000); // 1 saat
    
    this.tokens.set(sessionId, { token, expires });
    return token;
  }
  
  // CSRF token doğrula
  static validateToken(sessionId: string, token: string): boolean {
    const stored = this.tokens.get(sessionId);
    if (!stored) return false;
    
    if (Date.now() > stored.expires) {
      this.tokens.delete(sessionId);
      return false;
    }
    
    return stored.token === token;
  }
  
  // Middleware
  static middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      // GET istekleri için CSRF kontrolü yapmıyoruz
      if (req.method === 'GET') {
        return next();
      }
      
      const sessionId = req.sessionID || req.ip || 'anonymous';
      const token = req.headers['x-csrf-token'] as string || req.body._csrf;
      
      if (!token || !this.validateToken(sessionId || 'anonymous', token)) {
        return res.status(403).json({ 
          error: 'CSRF token eksik veya geçersiz',
          code: 'CSRF_INVALID'
        });
      }
      
      next();
    };
  }
}

// Input validation şemaları
export const validationSchemas = {
  // Kullanıcı kaydı
  register: z.object({
    username: z.string()
      .min(3, 'Kullanıcı adı en az 3 karakter olmalıdır')
      .max(20, 'Kullanıcı adı en fazla 20 karakter olabilir')
      .regex(/^[a-zA-Z0-9_]+$/, 'Kullanıcı adı sadece harf, rakam ve _ içerebilir'),
    password: z.string()
      .min(8, 'Şifre en az 8 karakter olmalıdır')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir'),
    email: z.string()
      .email('Geçerli bir e-posta adresi girin')
      .max(100, 'E-posta adresi çok uzun'),
    fullName: z.string()
      .min(2, 'Ad soyad en az 2 karakter olmalıdır')
      .max(50, 'Ad soyad en fazla 50 karakter olabilir')
      .optional(),
    phone: z.string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Geçerli bir telefon numarası girin')
      .optional(),
    language: z.enum(['tr', 'en', 'ka']).optional()
  }),

  // Kullanıcı girişi
  login: z.object({
    username: z.string()
      .min(1, 'Kullanıcı adı gereklidir'),
    password: z.string()
      .min(1, 'Şifre gereklidir'),
    language: z.enum(['tr', 'en', 'ka']).optional()
  }),

  // Profil güncelleme
  updateProfile: z.object({
    fullName: z.string()
      .min(2, 'Ad soyad en az 2 karakter olmalıdır')
      .max(50, 'Ad soyad en fazla 50 karakter olabilir')
      .optional(),
    email: z.string()
      .email('Geçerli bir e-posta adresi girin')
      .max(100, 'E-posta adresi çok uzun')
      .optional(),
    phone: z.string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Geçerli bir telefon numarası girin')
      .optional(),
    currentPassword: z.string().optional(),
    newPassword: z.string()
      .min(8, 'Yeni şifre en az 8 karakter olmalıdır')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Yeni şifre en az bir büyük harf, bir küçük harf ve bir rakam içermelidir')
      .optional(),
    tckn: z.string()
      .regex(/^\d{11}$/, 'TC Kimlik No 11 haneli olmalıdır')
      .optional()
  }),

  // Ödeme işlemi
  payment: z.object({
    amount: z.number()
      .min(10, 'Minimum ödeme tutarı 10 TL')
      .max(100000, 'Maksimum ödeme tutarı 100,000 TL'),
    method: z.enum(['bank_transfer', 'papara', 'credit_card', 'crypto', 'qr_code']),
    currency: z.enum(['TRY', 'USD', 'EUR']).default('TRY'),
    description: z.string()
      .max(200, 'Açıklama 200 karakteri geçemez')
      .optional()
  }),

  // Chat mesajı
  chatMessage: z.object({
    message: z.string()
      .min(1, 'Mesaj boş olamaz')
      .max(1000, 'Mesaj 1000 karakteri geçemez'),
    sessionId: z.string()
      .uuid('Geçersiz session ID')
      .optional(),
    language: z.enum(['tr', 'en', 'ka']).optional()
  }),

  // Admin işlemleri
  adminUser: z.object({
    userId: z.number().positive('Geçersiz kullanıcı ID'),
    action: z.enum(['activate', 'deactivate', 'delete', 'upgrade_vip']),
    reason: z.string()
      .max(500, 'Sebep 500 karakteri geçemez')
      .optional()
  })
};

// Generic validation middleware
export function validateInput(schema: z.ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errorMessages = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));
        
        return res.status(400).json({
          error: 'Girilen veriler geçersiz',
          details: errorMessages
        });
      }
      
      next(error);
    }
  };
}

// XSS koruması için HTML temizleme
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') return input;
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// SQL Injection koruması için parametre temizleme
export function sanitizeForSQL(input: any): any {
  if (typeof input === 'string') {
    // Tehlikeli karakterleri kaldır
    return input.replace(/[';\\]/g, '');
  }
  return input;
}

// IP whitelist kontrolü
export class IPWhitelist {
  private static adminIPs = new Set(['127.0.0.1', '::1']);
  
  static addIP(ip: string): void {
    this.adminIPs.add(ip);
  }
  
  static removeIP(ip: string): void {
    this.adminIPs.delete(ip);
  }
  
  static isAllowed(ip: string): boolean {
    return this.adminIPs.has(ip);
  }
  
  // Admin middleware
  static adminOnlyMiddleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const clientIP = req.ip || req.connection.remoteAddress || '';
      
      if (!this.isAllowed(clientIP)) {
        return res.status(403).json({
          error: 'Bu IP adresinden admin işlemlerine erişim yasaktır',
          code: 'IP_NOT_ALLOWED'
        });
      }
      
      next();
    };
  }
}

// Brute force koruması
export class BruteForceProtection {
  private static attempts = new Map<string, { count: number; lastAttempt: number }>();
  private static MAX_ATTEMPTS = 5;
  private static WINDOW_MS = 15 * 60 * 1000; // 15 dakika
  
  static recordAttempt(identifier: string): void {
    const now = Date.now();
    const record = this.attempts.get(identifier);
    
    if (!record || (now - record.lastAttempt) > this.WINDOW_MS) {
      this.attempts.set(identifier, { count: 1, lastAttempt: now });
    } else {
      record.count += 1;
      record.lastAttempt = now;
    }
  }
  
  static isBlocked(identifier: string): boolean {
    const record = this.attempts.get(identifier);
    if (!record) return false;
    
    const now = Date.now();
    if ((now - record.lastAttempt) > this.WINDOW_MS) {
      this.attempts.delete(identifier);
      return false;
    }
    
    return record.count >= this.MAX_ATTEMPTS;
  }
  
  static reset(identifier: string): void {
    this.attempts.delete(identifier);
  }
  
  // Middleware
  static middleware() {
    return (req: Request, res: Response, next: NextFunction) => {
      const identifier = req.ip + ':' + (req.body.username || req.body.email || '');
      
      if (this.isBlocked(identifier)) {
        return res.status(429).json({
          error: 'Çok fazla başarısız deneme. Lütfen 15 dakika sonra tekrar deneyin.',
          code: 'TOO_MANY_ATTEMPTS'
        });
      }
      
      next();
    };
  }
}

// Security headers middleware
export function securityHeaders() {
  return (req: Request, res: Response, next: NextFunction) => {
    // HTTPS zorla
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    
    // XSS koruması
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // Content type sniffing engelle
    res.setHeader('X-Content-Type-Options', 'nosniff');
    
    // Frame embedding engelle
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    
    // Content Security Policy
    res.setHeader('Content-Security-Policy', 
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
      "style-src 'self' 'unsafe-inline'; " +
      "img-src 'self' data: https:; " +
      "connect-src 'self' wss: https:;"
    );
    
    next();
  };
}