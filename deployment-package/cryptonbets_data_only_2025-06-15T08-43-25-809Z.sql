-- CryptonBets Veri Yedeği (Sadece Veriler)
-- Tarih: 15.06.2025 08:43:25
-- İçerik: Sadece tablo verileri

-- Para birimleri
INSERT INTO currencies (code, name, symbol, "exchangeRate", "isActive") VALUES
('TRY', 'Turkish Lira', '₺', 1.0000, true),
('USD', 'US Dollar', '$', 0.035, true),
('EUR', 'Euro', '€', 0.032, true),
('GBP', 'British Pound', '£', 0.028, true);

-- Ödeme yöntemleri
INSERT INTO payment_methods (name, type, provider, "minAmount", "maxAmount", fee, "feeType", "isActive") VALUES
('Kredi Kartı', 'credit_card', 'stripe', 50.00, 10000.00, 0.00, 'fixed', true),
('Banka Havalesi', 'bank_transfer', 'bank', 100.00, 50000.00, 0.00, 'fixed', true),
('Papara', 'e_wallet', 'papara', 20.00, 5000.00, 0.00, 'fixed', true);

-- Admin kullanıcısı
INSERT INTO users (username, email, password, "firstName", "lastName", "fullName", role, balance, "vipLevel", "isActive") VALUES
('admin', 'admin@cryptonbets.com', '$2b$10$rGBv0hcRj7mz1kqY8n5xHOqKqKQZkLZ3QoN4J2Y9v5tKHwY4KsL1C', 'Admin', 'User', 'Admin User', 'admin', 0.00, 5, true);
