import rateLimit from 'express-rate-limit';

// Genel API rate limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 100, // 15 dakikada maksimum 100 istek
  message: {
    error: 'Çok fazla istek gönderildi. Lütfen 15 dakika sonra tekrar deneyin.',
    retryAfter: 900
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth endpoint'leri için sıkı rate limiting
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // 15 dakikada maksimum 5 giriş denemesi
  message: {
    error: 'Çok fazla giriş denemesi. Lütfen 15 dakika sonra tekrar deneyin.',
    retryAfter: 900
  },
  skipSuccessfulRequests: true,
  standardHeaders: true,
  legacyHeaders: false,
});

// Kayıt için rate limiting
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 3, // Saatte maksimum 3 kayıt
  message: {
    error: 'Çok fazla kayıt denemesi. Lütfen 1 saat sonra tekrar deneyin.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Ödeme işlemleri için rate limiting
export const paymentLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 dakika
  max: 10, // 5 dakikada maksimum 10 ödeme işlemi
  message: {
    error: 'Çok fazla ödeme işlemi denemesi. Lütfen 5 dakika sonra tekrar deneyin.',
    retryAfter: 300
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// KYC upload için rate limiting
export const kycLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 saat
  max: 5, // Saatte maksimum 5 KYC yükleme
  message: {
    error: 'Çok fazla KYC belge yükleme denemesi. Lütfen 1 saat sonra tekrar deneyin.',
    retryAfter: 3600
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Chat için rate limiting
export const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 20, // Dakikada maksimum 20 mesaj
  message: {
    error: 'Çok hızlı mesaj gönderiyorsunuz. Lütfen biraz bekleyin.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Admin işlemler için rate limiting
export const adminLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 dakika
  max: 50, // Dakikada maksimum 50 admin işlemi
  message: {
    error: 'Çok fazla admin işlemi. Lütfen biraz bekleyin.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});