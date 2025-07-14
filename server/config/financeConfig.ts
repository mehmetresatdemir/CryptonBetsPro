// Finans şirketi entegrasyon konfigürasyonu
export const FINANCE_CONFIG = {
  // API Endpoints
  BASE_URL: process.env.FINANCE_COMPANY_API_URL || 'https://api.financecompany.com/v1',
  
  // Kimlik doğrulama
  API_KEY: process.env.FINANCE_COMPANY_API_KEY || '',
  SECRET_KEY: process.env.FINANCE_COMPANY_SECRET || '',
  WEBHOOK_SECRET: process.env.FINANCE_COMPANY_WEBHOOK_SECRET || '',
  
  // Rate limiting
  RATE_LIMIT_PER_MINUTE: 100,
  RATE_LIMIT_PER_HOUR: 5000,
  
  // Timeout ayarları
  REQUEST_TIMEOUT: 30000, // 30 saniye
  WEBHOOK_TIMEOUT: 10000, // 10 saniye
  
  // Retry ayarları
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // 1 saniye
  EXPONENTIAL_BACKOFF: true,
  
  // IP Whitelist
  ALLOWED_IPS: [
    '127.0.0.1',
    '::1',
    // Finans şirketi IP'leri
    ...(process.env.FINANCE_COMPANY_IPS?.split(',') || [])
  ],
  
  // Callback URLs
  CALLBACK_URLS: {
    DEPOSIT_SUCCESS: `${process.env.BASE_URL}/payment/success`,
    DEPOSIT_CANCEL: `${process.env.BASE_URL}/payment/cancel`,
    DEPOSIT_WEBHOOK: `${process.env.BASE_URL}/api/finance/webhook/deposit`,
    WITHDRAWAL_WEBHOOK: `${process.env.BASE_URL}/api/finance/webhook/withdrawal`,
  },
  
  // Ödeme yöntemi limitleri
  PAYMENT_LIMITS: {
    havale: {
      min_deposit: 100,
      max_deposit: 100000,
      min_withdraw: 100,
      max_withdraw: 100000,
      daily_limit: 500000,
      monthly_limit: 10000000
    },
    kredikarti: {
      min_deposit: 500,
      max_deposit: 100000,
      min_withdraw: 0,
      max_withdraw: 0,
      daily_limit: 300000,
      monthly_limit: 5000000
    },
    payco: {
      min_deposit: 100,
      max_deposit: 100000,
      min_withdraw: 100,
      max_withdraw: 100000,
      daily_limit: 200000,
      monthly_limit: 3000000
    },
    pep: {
      min_deposit: 100,
      max_deposit: 100000,
      min_withdraw: 100,
      max_withdraw: 100000,
      daily_limit: 150000,
      monthly_limit: 2000000
    },
    paratim: {
      min_deposit: 100,
      max_deposit: 100000,
      min_withdraw: 100,
      max_withdraw: 100000,
      daily_limit: 200000,
      monthly_limit: 3000000
    },
    kripto: {
      min_deposit: 100,
      max_deposit: 100000,
      min_withdraw: 100,
      max_withdraw: 100000,
      daily_limit: 1000000,
      monthly_limit: 20000000
    },
    papara: {
      min_deposit: 500,
      max_deposit: 100000,
      min_withdraw: 100,
      max_withdraw: 100000,
      daily_limit: 250000,
      monthly_limit: 4000000
    },
    parolapara: {
      min_deposit: 100,
      max_deposit: 100000,
      min_withdraw: 100,
      max_withdraw: 100000,
      daily_limit: 100000,
      monthly_limit: 1500000
    },
    popy: {
      min_deposit: 100,
      max_deposit: 100000,
      min_withdraw: 100,
      max_withdraw: 100000,
      daily_limit: 120000,
      monthly_limit: 1800000
    },
    paybol: {
      min_deposit: 100,
      max_deposit: 100000,
      min_withdraw: 100,
      max_withdraw: 100000,
      daily_limit: 180000,
      monthly_limit: 2500000
    },
    papel: {
      min_deposit: 100,
      max_deposit: 100000,
      min_withdraw: 100,
      max_withdraw: 100000,
      daily_limit: 150000,
      monthly_limit: 2200000
    }
  },
  
  // İşlem durumları mapping
  STATUS_MAPPING: {
    // CryptonBets -> Finans Şirketi
    'pending': 'PENDING',
    'processing': 'PROCESSING',
    'completed': 'COMPLETED',
    'failed': 'FAILED',
    'cancelled': 'CANCELLED',
    
    // Finans Şirketi -> CryptonBets
    'PENDING': 'pending',
    'PROCESSING': 'processing',
    'SUCCESS': 'completed',
    'COMPLETED': 'completed',
    'FAILED': 'failed',
    'ERROR': 'failed',
    'CANCELLED': 'cancelled',
    'REJECTED': 'failed'
  },
  
  // Webhook events
  WEBHOOK_EVENTS: {
    DEPOSIT_COMPLETED: 'deposit.completed',
    DEPOSIT_FAILED: 'deposit.failed',
    WITHDRAWAL_COMPLETED: 'withdrawal.completed',
    WITHDRAWAL_FAILED: 'withdrawal.failed',
    WITHDRAWAL_APPROVED: 'withdrawal.approved',
    WITHDRAWAL_REJECTED: 'withdrawal.rejected'
  },
  
  // Error codes
  ERROR_CODES: {
    INVALID_API_KEY: 'INVALID_API_KEY',
    INVALID_SIGNATURE: 'INVALID_SIGNATURE',
    RATE_LIMITED: 'RATE_LIMITED',
    INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
    INVALID_AMOUNT: 'INVALID_AMOUNT',
    PAYMENT_METHOD_UNAVAILABLE: 'PAYMENT_METHOD_UNAVAILABLE',
    USER_NOT_FOUND: 'USER_NOT_FOUND',
    TRANSACTION_NOT_FOUND: 'TRANSACTION_NOT_FOUND',
    DUPLICATE_TRANSACTION: 'DUPLICATE_TRANSACTION',
    KYC_REQUIRED: 'KYC_REQUIRED',
    ACCOUNT_SUSPENDED: 'ACCOUNT_SUSPENDED'
  },
  
  // Monitoring
  MONITORING: {
    HEALTH_CHECK_INTERVAL: 60000, // 1 dakika
    ALERT_THRESHOLDS: {
      ERROR_RATE: 0.05, // %5
      RESPONSE_TIME: 5000, // 5 saniye
      SUCCESS_RATE: 0.95 // %95
    },
    LOG_RETENTION_DAYS: 30
  },
  
  // Test modu
  TEST_MODE: process.env.NODE_ENV === 'development' || process.env.FINANCE_TEST_MODE === 'true',
  
  // Test hesap bilgileri
  TEST_ACCOUNTS: {
    test_user_id: 999999,
    test_api_key: 'test_api_key_123456',
    test_webhook_url: 'https://httpbin.org/post'
  }
};

// Konfigürasyon doğrulama
export function validateFinanceConfig(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (!FINANCE_CONFIG.API_KEY && !FINANCE_CONFIG.TEST_MODE) {
    errors.push('FINANCE_COMPANY_API_KEY environment variable is required');
  }
  
  if (!FINANCE_CONFIG.SECRET_KEY && !FINANCE_CONFIG.TEST_MODE) {
    errors.push('FINANCE_COMPANY_SECRET environment variable is required');
  }
  
  if (!FINANCE_CONFIG.WEBHOOK_SECRET && !FINANCE_CONFIG.TEST_MODE) {
    errors.push('FINANCE_COMPANY_WEBHOOK_SECRET environment variable is required');
  }
  
  if (!FINANCE_CONFIG.BASE_URL && !FINANCE_CONFIG.TEST_MODE) {
    errors.push('FINANCE_COMPANY_API_URL environment variable is required');
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

// Environment variables helper
export function getRequiredEnvVars(): string[] {
  return [
    'FINANCE_COMPANY_API_URL',
    'FINANCE_COMPANY_API_KEY', 
    'FINANCE_COMPANY_SECRET',
    'FINANCE_COMPANY_WEBHOOK_SECRET',
    'BASE_URL'
  ];
}

// Test konfigürasyonu
export const TEST_CONFIG = {
  API_URL: 'https://test-api.financecompany.com/v1',
  API_KEY: 'test_key_123456789',
  SECRET: 'test_secret_987654321',
  WEBHOOK_SECRET: 'test_webhook_secret_456789123',
  TEST_USER_ID: 999999,
  TEST_AMOUNTS: {
    SMALL: 100,
    MEDIUM: 1000,
    LARGE: 10000
  }
};