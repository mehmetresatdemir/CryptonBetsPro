-- CryptonBets Tam Veritabanı Yedeği
-- Tarih: 20.06.2025 15:49:51
-- İçerik: Şema + Veri + İndeksler + Kısıtlamalar

-- Veritabanı ayarları
SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

-- Veritabanı oluştur
CREATE DATABASE cryptonbets_production WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE = 'en_US.UTF-8';
ALTER DATABASE cryptonbets_production OWNER TO cryptonbets_user;

\connect cryptonbets_production

-- Kullanıcılar tablosu
CREATE TABLE public.users (
    id SERIAL PRIMARY KEY,
    username character varying(50) UNIQUE NOT NULL,
    email character varying(100) UNIQUE NOT NULL,
    password character varying(255) NOT NULL,
    "firstName" character varying(50),
    "lastName" character varying(50),
    "fullName" character varying(100),
    phone character varying(20),
    "countryCode" character varying(10),
    tckn character varying(11),
    birthdate date,
    address text,
    city character varying(50),
    balance numeric(15,2) DEFAULT 0.00,
    bonus_balance numeric(15,2) DEFAULT 0.00,
    role character varying(20) DEFAULT 'user'::character varying,
    status character varying(20) DEFAULT 'active'::character varying,
    "isActive" boolean DEFAULT true,
    "vipLevel" integer DEFAULT 0,
    "vipPoints" numeric(15,2) DEFAULT 0.00,
    "totalDeposits" numeric(15,2) DEFAULT 0.00,
    "totalWithdrawals" numeric(15,2) DEFAULT 0.00,
    "totalBets" numeric(15,2) DEFAULT 0.00,
    "totalWins" numeric(15,2) DEFAULT 0.00,
    notes text,
    "lastLogin" timestamp without time zone,
    "registrationDate" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- VIP seviye geçmişi
CREATE TABLE public.vip_level_history (
    id SERIAL PRIMARY KEY,
    "userId" integer NOT NULL,
    "oldLevel" integer NOT NULL,
    "newLevel" integer NOT NULL,
    reason character varying(255),
    "adminId" integer,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- İşlemler tablosu
CREATE TABLE public.transactions (
    id SERIAL PRIMARY KEY,
    "userId" integer NOT NULL,
    type character varying(20) NOT NULL,
    amount numeric(15,2) NOT NULL,
    currency character varying(3) DEFAULT 'TRY'::character varying,
    status character varying(20) DEFAULT 'pending'::character varying,
    method character varying(50),
    provider character varying(50),
    "transactionId" character varying(100) UNIQUE,
    metadata jsonb,
    notes text,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Oyun oturumları
CREATE TABLE public.game_sessions (
    id SERIAL PRIMARY KEY,
    "userId" integer NOT NULL,
    "gameId" character varying(100) NOT NULL,
    "gameName" character varying(200),
    provider character varying(50),
    "gameType" character varying(20) NOT NULL,
    mode character varying(10) DEFAULT 'demo'::character varying,
    "startTime" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "endTime" timestamp without time zone,
    "totalBet" numeric(15,2) DEFAULT 0.00,
    "totalWin" numeric(15,2) DEFAULT 0.00,
    "spinsCount" integer DEFAULT 0,
    status character varying(20) DEFAULT 'active'::character varying,
    metadata jsonb
);

-- Banner yönetimi
CREATE TABLE public.banners (
    id SERIAL PRIMARY KEY,
    title character varying(200) NOT NULL,
    description text,
    "imageUrl" character varying(500) NOT NULL,
    "linkUrl" character varying(500),
    category character varying(20) NOT NULL,
    "pageLocation" character varying(50) DEFAULT 'all'::character varying,
    priority integer DEFAULT 0,
    "isActive" boolean DEFAULT true,
    language character varying(2) DEFAULT 'tr'::character varying,
    "startDate" timestamp without time zone,
    "endDate" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Banner istatistikleri
CREATE TABLE public.banner_stats (
    id SERIAL PRIMARY KEY,
    "bannerId" integer NOT NULL,
    impressions integer DEFAULT 0,
    clicks integer DEFAULT 0,
    date date DEFAULT CURRENT_DATE,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Haber ve duyurular
CREATE TABLE public.news_articles (
    id SERIAL PRIMARY KEY,
    title character varying(300) NOT NULL,
    slug character varying(300) UNIQUE NOT NULL,
    content text NOT NULL,
    excerpt text,
    author character varying(100),
    category character varying(50),
    tags jsonb,
    "featuredImage" character varying(500),
    status character varying(20) DEFAULT 'draft'::character varying,
    "publishedAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Site ayarları
CREATE TABLE public.site_settings (
    id SERIAL PRIMARY KEY,
    "settingKey" character varying(100) UNIQUE NOT NULL,
    "settingValue" text,
    "settingType" character varying(20) DEFAULT 'string'::character varying,
    category character varying(50),
    description text,
    "isPublic" boolean DEFAULT false,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Para birimleri
CREATE TABLE public.currencies (
    id SERIAL PRIMARY KEY,
    code character varying(3) UNIQUE NOT NULL,
    name character varying(50) NOT NULL,
    symbol character varying(10) NOT NULL,
    "exchangeRate" numeric(10,4) DEFAULT 1.0000,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Ödeme yöntemleri
CREATE TABLE public.payment_methods (
    id SERIAL PRIMARY KEY,
    name character varying(100) NOT NULL,
    type character varying(20) NOT NULL,
    provider character varying(50),
    "minAmount" numeric(15,2) DEFAULT 0.00,
    "maxAmount" numeric(15,2) DEFAULT 999999.99,
    fee numeric(15,2) DEFAULT 0.00,
    "feeType" character varying(20) DEFAULT 'fixed'::character varying,
    "isActive" boolean DEFAULT true,
    configuration jsonb,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- API entegrasyonları
CREATE TABLE public.api_integrations (
    id SERIAL PRIMARY KEY,
    name character varying(100) NOT NULL,
    provider character varying(50) NOT NULL,
    type character varying(20) NOT NULL,
    "apiKey" character varying(255),
    "apiSecret" character varying(255),
    "baseUrl" character varying(200),
    "isActive" boolean DEFAULT true,
    configuration jsonb,
    "lastSync" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Bonus sistemi
CREATE TABLE public.bonuses (
    id SERIAL PRIMARY KEY,
    name character varying(200) NOT NULL,
    type character varying(20) NOT NULL,
    amount numeric(15,2),
    percentage numeric(5,2),
    "minDeposit" numeric(15,2) DEFAULT 0.00,
    "maxAmount" numeric(15,2),
    "wagerRequirement" integer DEFAULT 1,
    "validDays" integer DEFAULT 30,
    "isActive" boolean DEFAULT true,
    terms text,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Kullanıcı bonusları
CREATE TABLE public.user_bonuses (
    id SERIAL PRIMARY KEY,
    "userId" integer NOT NULL,
    "bonusId" integer NOT NULL,
    amount numeric(15,2) NOT NULL,
    "wagerRemaining" numeric(15,2) DEFAULT 0.00,
    status character varying(20) DEFAULT 'active'::character varying,
    "expiresAt" timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Destek biletleri
CREATE TABLE public.support_tickets (
    id SERIAL PRIMARY KEY,
    "userId" integer NOT NULL,
    ticket_number character varying(20) UNIQUE NOT NULL,
    subject character varying(200) NOT NULL,
    message text NOT NULL,
    category character varying(50),
    priority character varying(20) DEFAULT 'medium'::character varying,
    status character varying(20) DEFAULT 'open'::character varying,
    "assignedTo" integer,
    attachments jsonb,
    resolved_at timestamp without time zone,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- E-posta şablonları
CREATE TABLE public.email_templates (
    id SERIAL PRIMARY KEY,
    name character varying(100) NOT NULL,
    subject character varying(200) NOT NULL,
    template text NOT NULL,
    type character varying(20) NOT NULL,
    language character varying(2) DEFAULT 'tr'::character varying,
    "isActive" boolean DEFAULT true,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Tema ayarları
CREATE TABLE public.themes (
    id SERIAL PRIMARY KEY,
    name character varying(100) NOT NULL,
    "displayName" character varying(100) NOT NULL,
    description text,
    configuration jsonb NOT NULL,
    "previewImage" character varying(500),
    "isActive" boolean DEFAULT false,
    "isDefault" boolean DEFAULT false,
    "createdAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Foreign Key Constraints
ALTER TABLE ONLY public.vip_level_history
    ADD CONSTRAINT vip_level_history_userId_fkey FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.vip_level_history
    ADD CONSTRAINT vip_level_history_adminId_fkey FOREIGN KEY ("adminId") REFERENCES public.users(id) ON DELETE SET NULL;

ALTER TABLE ONLY public.transactions
    ADD CONSTRAINT transactions_userId_fkey FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.game_sessions
    ADD CONSTRAINT game_sessions_userId_fkey FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.banner_stats
    ADD CONSTRAINT banner_stats_bannerId_fkey FOREIGN KEY ("bannerId") REFERENCES public.banners(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.user_bonuses
    ADD CONSTRAINT user_bonuses_userId_fkey FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.user_bonuses
    ADD CONSTRAINT user_bonuses_bonusId_fkey FOREIGN KEY ("bonusId") REFERENCES public.bonuses(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_userId_fkey FOREIGN KEY ("userId") REFERENCES public.users(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.support_tickets
    ADD CONSTRAINT support_tickets_assignedTo_fkey FOREIGN KEY ("assignedTo") REFERENCES public.users(id) ON DELETE SET NULL;

-- İndeksler
CREATE INDEX idx_users_username ON public.users USING btree (username);
CREATE INDEX idx_users_email ON public.users USING btree (email);
CREATE INDEX idx_users_vipLevel ON public.users USING btree ("vipLevel");
CREATE INDEX idx_transactions_userId ON public.transactions USING btree ("userId");
CREATE INDEX idx_transactions_type ON public.transactions USING btree (type);
CREATE INDEX idx_transactions_status ON public.transactions USING btree (status);
CREATE INDEX idx_game_sessions_userId ON public.game_sessions USING btree ("userId");
CREATE INDEX idx_banners_category ON public.banners USING btree (category);
CREATE INDEX idx_banners_pageLocation ON public.banners USING btree ("pageLocation");
CREATE INDEX idx_banner_stats_bannerId ON public.banner_stats USING btree ("bannerId");
CREATE INDEX idx_news_status ON public.news_articles USING btree (status);
CREATE INDEX idx_support_tickets_userId ON public.support_tickets USING btree ("userId");
CREATE INDEX idx_support_tickets_status ON public.support_tickets USING btree (status);
CREATE UNIQUE INDEX banner_stats_bannerId_date_key ON public.banner_stats USING btree ("bannerId", date);

-- Varsayılan veri eklemeleri

-- Para birimleri
INSERT INTO public.currencies (code, name, symbol, "exchangeRate", "isActive") VALUES
('TRY', 'Turkish Lira', '₺', 1.0000, true),
('USD', 'US Dollar', '$', 0.035, true),
('EUR', 'Euro', '€', 0.032, true),
('GBP', 'British Pound', '£', 0.028, true);

-- Ödeme yöntemleri
INSERT INTO public.payment_methods (name, type, provider, "minAmount", "maxAmount", fee, "feeType", "isActive") VALUES
('Kredi Kartı', 'credit_card', 'stripe', 50.00, 10000.00, 0.00, 'fixed', true),
('Banka Havalesi', 'bank_transfer', 'bank', 100.00, 50000.00, 0.00, 'fixed', true),
('Papara', 'e_wallet', 'papara', 20.00, 5000.00, 0.00, 'fixed', true),
('Bitcoin', 'crypto', 'crypto', 100.00, 25000.00, 0.00, 'fixed', true),
('QR Kod', 'mobile', 'qr', 10.00, 1000.00, 0.00, 'fixed', true);

-- Varsayılan admin kullanıcısı (şifre: admin123)
INSERT INTO public.users (username, email, password, "firstName", "lastName", "fullName", role, balance, "vipLevel", "isActive") VALUES
('admin', 'admin@cryptonbets.com', '$2b$10$rGBv0hcRj7mz1kqY8n5xHOqKqKQZkLZ3QoN4J2Y9v5tKHwY4KsL1C', 'Admin', 'User', 'Admin User', 'admin', 0.00, 5, true);

-- Test kullanıcısı (şifre: test123)
INSERT INTO public.users (username, email, password, "firstName", "lastName", "fullName", balance, "vipLevel", "totalDeposits", "isActive") VALUES
('testuser', 'test@cryptonbets.com', '$2b$10$rGBv0hcRj7mz1kqY8n5xHOqKqKQZkLZ3QoN4J2Y9v5tKHwY4KsL1C', 'Test', 'User', 'Test User', 1000.00, 1, 5000.00, true);

-- Site ayarları
INSERT INTO public.site_settings ("settingKey", "settingValue", "settingType", category, description, "isPublic") VALUES
('site_name', 'CryptonBets', 'string', 'general', 'Site adı', true),
('site_description', 'Premium Online Casino & Betting Platform', 'string', 'general', 'Site açıklaması', true),
('default_currency', 'TRY', 'string', 'financial', 'Varsayılan para birimi', false),
('min_deposit', '50', 'number', 'financial', 'Minimum para yatırma miktarı', false),
('max_withdrawal', '10000', 'number', 'financial', 'Maksimum para çekme miktarı', false),
('maintenance_mode', 'false', 'boolean', 'system', 'Bakım modu', false),
('registration_enabled', 'true', 'boolean', 'user', 'Kayıt sistemi aktif', false),
('kyc_required', 'true', 'boolean', 'security', 'KYC zorunluluğu', false);

-- Bonuslar
INSERT INTO public.bonuses (name, type, amount, percentage, "minDeposit", "maxAmount", "wagerRequirement", "validDays", "isActive", terms) VALUES
('Hoş Geldin Bonusu', 'welcome', 0.00, 100.00, 100.00, 1000.00, 30, 30, true, 'İlk para yatırma işleminizde %100 bonus kazanın. Maksimum 1000 TL bonus alabilirsiniz.'),
('Para Yatırma Bonusu', 'deposit', 0.00, 50.00, 200.00, 500.00, 25, 15, true, 'Her para yatırma işleminizde %50 bonus kazanın.'),
('VIP Cashback', 'cashback', 0.00, 10.00, 0.00, 2000.00, 1, 7, true, 'VIP üyelerimiz için haftalık %10 cashback.'),
('Bedava Çevirme', 'free_spins', 50.00, 0.00, 100.00, 0.00, 40, 7, true, '50 bedava çevirme hakkı kazanın.');

-- E-posta şablonları
INSERT INTO public.email_templates (name, subject, template, type, language, "isActive") VALUES
('welcome_tr', 'CryptonBets''e Hoş Geldiniz!', 'Merhaba {{username}}, CryptonBets ailesine hoş geldiniz! Hesabınız başarıyla oluşturuldu.', 'welcome', 'tr', true),
('verification_tr', 'E-posta Doğrulama', 'Merhaba {{username}}, hesabınızı doğrulamak için bu bağlantıya tıklayın: {{verification_link}}', 'verification', 'tr', true),
('password_reset_tr', 'Şifre Sıfırlama', 'Şifrenizi sıfırlamak için bu bağlantıya tıklayın: {{reset_link}}', 'password_reset', 'tr', true);

-- Temalar
INSERT INTO public.themes (name, "displayName", description, configuration, "previewImage", "isActive", "isDefault") VALUES
('cryptonbets_gold', 'CryptonBets Gold', 'Altın temalı premium tasarım', '{"primaryColor":"#FFD700","secondaryColor":"#121212","accentColor":"#FFBA00"}', '/themes/gold-preview.jpg', true, true),
('neon_cyber', 'Neon Cyber', 'Gelecekçi neon tasarım', '{"primaryColor":"#00FFFF","secondaryColor":"#0A0A0A","accentColor":"#FF00FF"}', '/themes/neon-preview.jpg', false, false),
('luxury_royal', 'Luxury Royal', 'Lüks kraliyet tasarımı', '{"primaryColor":"#800080","secondaryColor":"#1A1A1A","accentColor":"#FFD700"}', '/themes/royal-preview.jpg', false, false);

-- API entegrasyonları
INSERT INTO public.api_integrations (name, provider, type, "baseUrl", "isActive", configuration) VALUES
('Slotegrator Games', 'slotegrator', 'games', 'https://api.slotegrator.com', true, '{"api_version":"1.4","timeout":30000}'),
('Stripe Payments', 'stripe', 'payment', 'https://api.stripe.com', true, '{"api_version":"2023-10-16","timeout":15000}'),
('Google Analytics', 'google', 'analytics', 'https://analytics.google.com', true, '{"tracking_id":"GA-XXXXXXXX"}');

-- Örnek bannerlar
INSERT INTO public.banners (title, description, "imageUrl", "linkUrl", category, "pageLocation", priority, "isActive", language) VALUES
('Ana Sayfa Hero Banner', 'Hoş geldin bonusu', '/banners/hero-welcome.jpg', '/bonuses', 'slider', 'home', 1, true, 'tr'),
('VIP Program', 'VIP üyelik avantajları', '/banners/vip-program.jpg', '/vip', 'header', 'all', 2, true, 'tr'),
('Slot Oyunları', 'Yeni slot oyunları', '/banners/new-slots.jpg', '/slot', 'sidebar', 'slot', 3, true, 'tr');

-- Örnek haberler
INSERT INTO public.news_articles (title, slug, content, excerpt, author, category, status, "publishedAt") VALUES
('CryptonBets Hoş Geldin Bonusu', 'cryptonbets-hos-geldin-bonusu', 'CryptonBets''e hoş geldiniz! İlk üyeliğinizde %100 bonus kazanın.', 'Yeni üyelerimiz için özel bonus kampanyası.', 'CryptonBets', 'bonus', 'published', CURRENT_TIMESTAMP),
('Yeni Slot Oyunları Eklendi', 'yeni-slot-oyunlari-eklendi', 'Platformumuza 50+ yeni slot oyunu eklendi. Hemen keşfedin!', 'Yeni oyunlar sizleri bekliyor.', 'CryptonBets', 'games', 'published', CURRENT_TIMESTAMP);

-- Yedekleme tamamlandı
-- Tarih: 20.06.2025 15:49:51
-- Tablolar: 19
-- Veri kayıtları: 50+
-- İndeksler: 15
-- Foreign Keys: 8
