-- CryptonBets Veritabanı Tam Yedekleme
-- Oluşturulma Tarihi: 2025-06-15
-- Açıklama: Tüm tablo yapıları, veri ve konfigürasyonlar

-- Veritabanı oluşturma
CREATE DATABASE IF NOT EXISTS cryptonbets_production;
USE cryptonbets_production;

-- Kullanıcılar tablosu
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    firstName VARCHAR(50),
    lastName VARCHAR(50),
    fullName VARCHAR(100),
    phone VARCHAR(20),
    countryCode VARCHAR(10),
    tckn VARCHAR(11),
    birthdate DATE,
    address TEXT,
    city VARCHAR(50),
    balance DECIMAL(15,2) DEFAULT 0.00,
    bonus_balance DECIMAL(15,2) DEFAULT 0.00,
    role VARCHAR(20) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'active',
    isActive BOOLEAN DEFAULT true,
    vipLevel INTEGER DEFAULT 0,
    vipPoints DECIMAL(15,2) DEFAULT 0.00,
    totalDeposits DECIMAL(15,2) DEFAULT 0.00,
    totalWithdrawals DECIMAL(15,2) DEFAULT 0.00,
    totalBets DECIMAL(15,2) DEFAULT 0.00,
    totalWins DECIMAL(15,2) DEFAULT 0.00,
    notes TEXT,
    lastLogin TIMESTAMP,
    registrationDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- VIP seviye geçmişi tablosu
CREATE TABLE vip_level_history (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL,
    oldLevel INTEGER NOT NULL,
    newLevel INTEGER NOT NULL,
    reason VARCHAR(255),
    adminId INTEGER,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (adminId) REFERENCES users(id) ON DELETE SET NULL
);

-- İşlemler tablosu
CREATE TABLE transactions (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL,
    type ENUM('deposit', 'withdrawal', 'bonus', 'bet', 'win') NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'TRY',
    status ENUM('pending', 'completed', 'failed', 'cancelled') DEFAULT 'pending',
    method VARCHAR(50),
    provider VARCHAR(50),
    transactionId VARCHAR(100) UNIQUE,
    metadata JSON,
    notes TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Oyun oturumları tablosu
CREATE TABLE game_sessions (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL,
    gameId VARCHAR(100) NOT NULL,
    gameName VARCHAR(200),
    provider VARCHAR(50),
    gameType ENUM('slot', 'casino', 'crash') NOT NULL,
    mode ENUM('demo', 'real') DEFAULT 'demo',
    startTime TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    endTime TIMESTAMP,
    totalBet DECIMAL(15,2) DEFAULT 0.00,
    totalWin DECIMAL(15,2) DEFAULT 0.00,
    spinsCount INTEGER DEFAULT 0,
    status ENUM('active', 'completed', 'abandoned') DEFAULT 'active',
    metadata JSON,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
);

-- Banner yönetim sistemi
CREATE TABLE banners (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    imageUrl VARCHAR(500) NOT NULL,
    linkUrl VARCHAR(500),
    category ENUM('slider', 'header', 'sidebar', 'popup', 'footer') NOT NULL,
    pageLocation VARCHAR(50) DEFAULT 'all',
    priority INTEGER DEFAULT 0,
    isActive BOOLEAN DEFAULT true,
    language VARCHAR(2) DEFAULT 'tr',
    startDate TIMESTAMP,
    endDate TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Banner istatistikleri
CREATE TABLE banner_stats (
    id SERIAL PRIMARY KEY,
    bannerId INTEGER NOT NULL,
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    date DATE DEFAULT (CURRENT_DATE),
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (bannerId) REFERENCES banners(id) ON DELETE CASCADE,
    UNIQUE KEY unique_banner_date (bannerId, date)
);

-- Haber ve makaleler
CREATE TABLE news_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(300) NOT NULL,
    slug VARCHAR(300) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    author VARCHAR(100),
    category VARCHAR(50),
    tags JSON,
    featuredImage VARCHAR(500),
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    publishedAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Site ayarları
CREATE TABLE site_settings (
    id SERIAL PRIMARY KEY,
    settingKey VARCHAR(100) UNIQUE NOT NULL,
    settingValue TEXT,
    settingType ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    category VARCHAR(50),
    description TEXT,
    isPublic BOOLEAN DEFAULT false,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Para birimleri
CREATE TABLE currencies (
    id SERIAL PRIMARY KEY,
    code VARCHAR(3) UNIQUE NOT NULL,
    name VARCHAR(50) NOT NULL,
    symbol VARCHAR(10) NOT NULL,
    exchangeRate DECIMAL(10,4) DEFAULT 1.0000,
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Ödeme yöntemleri
CREATE TABLE payment_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('credit_card', 'bank_transfer', 'e_wallet', 'crypto', 'mobile') NOT NULL,
    provider VARCHAR(50),
    minAmount DECIMAL(15,2) DEFAULT 0.00,
    maxAmount DECIMAL(15,2) DEFAULT 999999.99,
    fee DECIMAL(15,2) DEFAULT 0.00,
    feeType ENUM('fixed', 'percentage') DEFAULT 'fixed',
    isActive BOOLEAN DEFAULT true,
    configuration JSON,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- API entegrasyonları
CREATE TABLE api_integrations (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL,
    type ENUM('games', 'payment', 'analytics', 'communication') NOT NULL,
    apiKey VARCHAR(255),
    apiSecret VARCHAR(255),
    baseUrl VARCHAR(200),
    isActive BOOLEAN DEFAULT true,
    configuration JSON,
    lastSync TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Bonus sistemi
CREATE TABLE bonuses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    type ENUM('welcome', 'deposit', 'cashback', 'free_spins', 'vip') NOT NULL,
    amount DECIMAL(15,2),
    percentage DECIMAL(5,2),
    minDeposit DECIMAL(15,2) DEFAULT 0.00,
    maxAmount DECIMAL(15,2),
    wagerRequirement INTEGER DEFAULT 1,
    validDays INTEGER DEFAULT 30,
    isActive BOOLEAN DEFAULT true,
    terms TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Kullanıcı bonusları
CREATE TABLE user_bonuses (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL,
    bonusId INTEGER NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    wagerRemaining DECIMAL(15,2) DEFAULT 0.00,
    status ENUM('active', 'completed', 'expired', 'cancelled') DEFAULT 'active',
    expiresAt TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (bonusId) REFERENCES bonuses(id) ON DELETE CASCADE
);

-- Destek biletleri
CREATE TABLE support_tickets (
    id SERIAL PRIMARY KEY,
    userId INTEGER NOT NULL,
    ticket_number VARCHAR(20) UNIQUE NOT NULL,
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50),
    priority ENUM('low', 'medium', 'high', 'urgent') DEFAULT 'medium',
    status ENUM('open', 'in_progress', 'resolved', 'closed') DEFAULT 'open',
    assignedTo INTEGER,
    attachments JSON,
    resolved_at TIMESTAMP,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assignedTo) REFERENCES users(id) ON DELETE SET NULL
);

-- E-posta şablonları
CREATE TABLE email_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    subject VARCHAR(200) NOT NULL,
    template TEXT NOT NULL,
    type ENUM('welcome', 'verification', 'password_reset', 'promotion', 'notification') NOT NULL,
    language VARCHAR(2) DEFAULT 'tr',
    isActive BOOLEAN DEFAULT true,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tema ayarları
CREATE TABLE themes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    displayName VARCHAR(100) NOT NULL,
    description TEXT,
    configuration JSON NOT NULL,
    previewImage VARCHAR(500),
    isActive BOOLEAN DEFAULT false,
    isDefault BOOLEAN DEFAULT false,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Varsayılan veri eklemeleri
INSERT INTO currencies (code, name, symbol, exchangeRate, isActive) VALUES
('TRY', 'Turkish Lira', '₺', 1.0000, true),
('USD', 'US Dollar', '$', 0.035, true),
('EUR', 'Euro', '€', 0.032, true),
('GBP', 'British Pound', '£', 0.028, true);

-- Varsayılan ödeme yöntemleri
INSERT INTO payment_methods (name, type, provider, minAmount, maxAmount, fee, feeType, isActive) VALUES
('Kredi Kartı', 'credit_card', 'stripe', 50.00, 10000.00, 0.00, 'fixed', true),
('Banka Havalesi', 'bank_transfer', 'bank', 100.00, 50000.00, 0.00, 'fixed', true),
('Papara', 'e_wallet', 'papara', 20.00, 5000.00, 0.00, 'fixed', true),
('Bitcoin', 'crypto', 'crypto', 100.00, 25000.00, 0.00, 'fixed', true),
('QR Kod', 'mobile', 'qr', 10.00, 1000.00, 0.00, 'fixed', true);

-- Varsayılan admin kullanıcısı
INSERT INTO users (username, email, password, firstName, lastName, fullName, role, balance, vipLevel, isActive) VALUES
('admin', 'admin@cryptonbets.com', '$2b$10$rGBv0hcRj7mz1kqY8n5xHOqKqKQZkLZ3QoN4J2Y9v5tKHwY4KsL1C', 'Admin', 'User', 'Admin User', 'admin', 0.00, 5, true);

-- Test kullanıcısı
INSERT INTO users (username, email, password, firstName, lastName, fullName, balance, vipLevel, totalDeposits, isActive) VALUES
('testuser', 'test@cryptonbets.com', '$2b$10$rGBv0hcRj7mz1kqY8n5xHOqKqKQZkLZ3QoN4J2Y9v5tKHwY4KsL1C', 'Test', 'User', 'Test User', 1000.00, 1, 5000.00, true);

-- Varsayılan site ayarları
INSERT INTO site_settings (settingKey, settingValue, settingType, category, description, isPublic) VALUES
('site_name', 'CryptonBets', 'string', 'general', 'Site adı', true),
('site_description', 'Premium Online Casino & Betting Platform', 'string', 'general', 'Site açıklaması', true),
('default_currency', 'TRY', 'string', 'financial', 'Varsayılan para birimi', false),
('min_deposit', '50', 'number', 'financial', 'Minimum para yatırma miktarı', false),
('max_withdrawal', '10000', 'number', 'financial', 'Maksimum para çekme miktarı', false),
('maintenance_mode', 'false', 'boolean', 'system', 'Bakım modu', false),
('registration_enabled', 'true', 'boolean', 'user', 'Kayıt sistemi aktif', false),
('kyc_required', 'true', 'boolean', 'security', 'KYC zorunluluğu', false);

-- Varsayılan bonuslar
INSERT INTO bonuses (name, type, amount, percentage, minDeposit, maxAmount, wagerRequirement, validDays, isActive, terms) VALUES
('Hoş Geldin Bonusu', 'welcome', 0.00, 100.00, 100.00, 1000.00, 30, 30, true, 'İlk para yatırma işleminizde %100 bonus kazanın. Maksimum 1000 TL bonus alabilirsiniz.'),
('Para Yatırma Bonusu', 'deposit', 0.00, 50.00, 200.00, 500.00, 25, 15, true, 'Her para yatırma işleminizde %50 bonus kazanın.'),
('VIP Cashback', 'cashback', 0.00, 10.00, 0.00, 2000.00, 1, 7, true, 'VIP üyelerimiz için haftalık %10 cashback.'),
('Bedava Çevirme', 'free_spins', 50.00, 0.00, 100.00, 0.00, 40, 7, true, '50 bedava çevirme hakkı kazanın.');

-- Varsayılan e-posta şablonları
INSERT INTO email_templates (name, subject, template, type, language, isActive) VALUES
('welcome_tr', 'CryptonBets\'e Hoş Geldiniz!', 'Merhaba {{username}}, CryptonBets ailesine hoş geldiniz! Hesabınız başarıyla oluşturuldu.', 'welcome', 'tr', true),
('verification_tr', 'E-posta Doğrulama', 'Merhaba {{username}}, hesabınızı doğrulamak için bu bağlantıya tıklayın: {{verification_link}}', 'verification', 'tr', true),
('password_reset_tr', 'Şifre Sıfırlama', 'Şifrenizi sıfırlamak için bu bağlantıya tıklayın: {{reset_link}}', 'password_reset', 'tr', true);

-- Varsayılan temalar
INSERT INTO themes (name, displayName, description, configuration, previewImage, isActive, isDefault) VALUES
('cryptonbets_gold', 'CryptonBets Gold', 'Altın temalı premium tasarım', '{"primaryColor":"#FFD700","secondaryColor":"#121212","accentColor":"#FFBA00"}', '/themes/gold-preview.jpg', true, true),
('neon_cyber', 'Neon Cyber', 'Gelecekçi neon tasarım', '{"primaryColor":"#00FFFF","secondaryColor":"#0A0A0A","accentColor":"#FF00FF"}', '/themes/neon-preview.jpg', false, false),
('luxury_royal', 'Luxury Royal', 'Lüks kraliyet tasarımı', '{"primaryColor":"#800080","secondaryColor":"#1A1A1A","accentColor":"#FFD700"}', '/themes/royal-preview.jpg', false, false);

-- API entegrasyonları
INSERT INTO api_integrations (name, provider, type, baseUrl, isActive, configuration) VALUES
('Slotegrator Games', 'slotegrator', 'games', 'https://api.slotegrator.com', true, '{"api_version":"1.4","timeout":30000}'),
('Stripe Payments', 'stripe', 'payment', 'https://api.stripe.com', true, '{"api_version":"2023-10-16","timeout":15000}'),
('Google Analytics', 'google', 'analytics', 'https://analytics.google.com', true, '{"tracking_id":"GA-XXXXXXXX"}');

-- Güvenlik için indeksler
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_vipLevel ON users(vipLevel);
CREATE INDEX idx_transactions_userId ON transactions(userId);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_game_sessions_userId ON game_sessions(userId);
CREATE INDEX idx_banners_category ON banners(category);
CREATE INDEX idx_banners_pageLocation ON banners(pageLocation);
CREATE INDEX idx_banner_stats_bannerId ON banner_stats(bannerId);
CREATE INDEX idx_news_status ON news_articles(status);
CREATE INDEX idx_support_tickets_userId ON support_tickets(userId);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);

-- Yedekleme tamamlandı
-- Toplam tablolar: 19
-- Varsayılan veriler: Eklendi
-- İndeksler: Oluşturuldu
-- Versiyon: 1.0
-- Son güncelleme: 2025-06-15