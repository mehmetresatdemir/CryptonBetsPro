// Backend Translation System for CryptonBets
// Professional Turkish and English translations for server responses

const translations = {
  // API Response Messages
  'api.success': {
    tr: 'İşlem başarılı',
    en: 'Operation successful'
  },
  'api.error': {
    tr: 'Bir hata oluştu',
    en: 'An error occurred'
  },
  'api.unauthorized': {
    tr: 'Yetkisiz erişim',
    en: 'Unauthorized access'
  },
  'api.forbidden': {
    tr: 'Erişim yasak',
    en: 'Access forbidden'
  },
  'api.notFound': {
    tr: 'Kaynak bulunamadı',
    en: 'Resource not found'
  },
  'api.invalidData': {
    tr: 'Geçersiz veri',
    en: 'Invalid data'
  },
  'api.serverError': {
    tr: 'Sunucu hatası',
    en: 'Server error'
  },

  // Authentication Messages
  'auth.loginSuccess': {
    tr: 'Giriş başarılı',
    en: 'Login successful'
  },
  'auth.loginFailed': {
    tr: 'Giriş başarısız',
    en: 'Login failed'
  },
  'auth.invalidCredentials': {
    tr: 'Geçersiz kullanıcı adı veya şifre',
    en: 'Invalid username or password'
  },
  'auth.accountLocked': {
    tr: 'Hesap kilitli',
    en: 'Account locked'
  },
  'auth.sessionExpired': {
    tr: 'Oturum süresi doldu',
    en: 'Session expired'
  },
  'auth.tokenInvalid': {
    tr: 'Geçersiz token',
    en: 'Invalid token'
  },
  'auth.registrationSuccess': {
    tr: 'Kayıt başarılı',
    en: 'Registration successful'
  },
  'auth.userExists': {
    tr: 'Kullanıcı zaten mevcut',
    en: 'User already exists'
  },

  // Transaction Messages
  'transaction.depositSuccess': {
    tr: 'Para yatırma işlemi başarılı',
    en: 'Deposit successful'
  },
  'transaction.withdrawalSuccess': {
    tr: 'Para çekme işlemi başarılı',
    en: 'Withdrawal successful'
  },
  'transaction.insufficientFunds': {
    tr: 'Yetersiz bakiye',
    en: 'Insufficient funds'
  },
  'transaction.pending': {
    tr: 'İşlem beklemede',
    en: 'Transaction pending'
  },
  'transaction.failed': {
    tr: 'İşlem başarısız',
    en: 'Transaction failed'
  },
  'transaction.cancelled': {
    tr: 'İşlem iptal edildi',
    en: 'Transaction cancelled'
  },

  // Game Messages
  'game.sessionStarted': {
    tr: 'Oyun oturumu başlatıldı',
    en: 'Game session started'
  },
  'game.sessionEnded': {
    tr: 'Oyun oturumu sonlandı',
    en: 'Game session ended'
  },
  'game.betPlaced': {
    tr: 'Bahis yerleştirildi',
    en: 'Bet placed'
  },
  'game.betWon': {
    tr: 'Bahis kazanıldı',
    en: 'Bet won'
  },
  'game.betLost': {
    tr: 'Bahis kaybedildi',
    en: 'Bet lost'
  },
  'game.invalidBet': {
    tr: 'Geçersiz bahis',
    en: 'Invalid bet'
  },

  // Bonus Messages
  'bonus.awarded': {
    tr: 'Bonus verildi',
    en: 'Bonus awarded'
  },
  'bonus.claimed': {
    tr: 'Bonus alındı',
    en: 'Bonus claimed'
  },
  'bonus.expired': {
    tr: 'Bonus süresi doldu',
    en: 'Bonus expired'
  },
  'bonus.notEligible': {
    tr: 'Bonus için uygun değil',
    en: 'Not eligible for bonus'
  },

  // KYC Messages
  'kyc.submitted': {
    tr: 'KYC belgeleri gönderildi',
    en: 'KYC documents submitted'
  },
  'kyc.approved': {
    tr: 'KYC onaylandı',
    en: 'KYC approved'
  },
  'kyc.rejected': {
    tr: 'KYC reddedildi',
    en: 'KYC rejected'
  },
  'kyc.pending': {
    tr: 'KYC incelemede',
    en: 'KYC under review'
  },

  // Admin Messages
  'admin.actionLogged': {
    tr: 'Admin işlemi kaydedildi',
    en: 'Admin action logged'
  },
  'admin.accessDenied': {
    tr: 'Admin erişimi reddedildi',
    en: 'Admin access denied'
  },
  'admin.dataUpdated': {
    tr: 'Veri güncellendi',
    en: 'Data updated'
  },
  'admin.userCreated': {
    tr: 'Kullanıcı oluşturuldu',
    en: 'User created'
  },
  'admin.userDeleted': {
    tr: 'Kullanıcı silindi',
    en: 'User deleted'
  },

  // System Messages
  'system.maintenance': {
    tr: 'Sistem bakımda',
    en: 'System under maintenance'
  },
  'system.backup': {
    tr: 'Sistem yedeği alınıyor',
    en: 'System backup in progress'
  },
  'system.updated': {
    tr: 'Sistem güncellendi',
    en: 'System updated'
  },

  // Validation Messages
  'validation.required': {
    tr: 'Bu alan zorunludur',
    en: 'This field is required'
  },
  'validation.invalidEmail': {
    tr: 'Geçersiz e-posta adresi',
    en: 'Invalid email address'
  },
  'validation.invalidPhone': {
    tr: 'Geçersiz telefon numarası',
    en: 'Invalid phone number'
  },
  'validation.passwordTooShort': {
    tr: 'Şifre çok kısa',
    en: 'Password too short'
  },
  'validation.passwordMismatch': {
    tr: 'Şifreler eşleşmiyor',
    en: 'Passwords do not match'
  },

  // File Upload Messages
  'upload.success': {
    tr: 'Dosya yüklendi',
    en: 'File uploaded'
  },
  'upload.failed': {
    tr: 'Dosya yüklenemedi',
    en: 'File upload failed'
  },
  'upload.invalidFormat': {
    tr: 'Geçersiz dosya formatı',
    en: 'Invalid file format'
  },
  'upload.tooLarge': {
    tr: 'Dosya çok büyük',
    en: 'File too large'
  },

  // Email Messages
  'email.sent': {
    tr: 'E-posta gönderildi',
    en: 'Email sent'
  },
  'email.failed': {
    tr: 'E-posta gönderilemedi',
    en: 'Email failed to send'
  },
  'email.invalidAddress': {
    tr: 'Geçersiz e-posta adresi',
    en: 'Invalid email address'
  }
};

// Translation helper function
const t = (key, language = 'tr') => {
  const translation = translations[key];
  if (!translation) {
    console.warn(`Translation not found for key: ${key}`);
    return key;
  }
  return translation[language] || translation.tr || key;
};

// Get language from request headers or default to Turkish
const getLanguageFromRequest = (req) => {
  const acceptLanguage = req.headers['accept-language'] || '';
  const langParam = req.query.lang || req.body.lang;
  
  if (langParam && ['tr', 'en'].includes(langParam)) {
    return langParam;
  }
  
  if (acceptLanguage.includes('en')) {
    return 'en';
  }
  
  return 'tr'; // Default to Turkish
};

// Create response with translation
const createResponse = (key, data = null, language = 'tr') => {
  return {
    success: true,
    message: t(key, language),
    data
  };
};

// Create error response with translation
const createErrorResponse = (key, error = null, language = 'tr') => {
  return {
    success: false,
    message: t(key, language),
    error
  };
};

module.exports = {
  t,
  getLanguageFromRequest,
  createResponse,
  createErrorResponse,
  translations
};