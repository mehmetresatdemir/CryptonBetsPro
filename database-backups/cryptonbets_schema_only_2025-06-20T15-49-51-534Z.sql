-- CryptonBets Şema Yedeği (Sadece Yapı)
-- Tarih: 20.06.2025 15:49:51
-- İçerik: Sadece tablo yapıları, indeksler, kısıtlamalar

-- Kullanıcılar tablosu
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    "firstName" VARCHAR(50),
    "lastName" VARCHAR(50),
    "fullName" VARCHAR(100),
    phone VARCHAR(20),
    "countryCode" VARCHAR(10),
    tckn VARCHAR(11),
    birthdate DATE,
    address TEXT,
    city VARCHAR(50),
    balance DECIMAL(15,2) DEFAULT 0.00,
    bonus_balance DECIMAL(15,2) DEFAULT 0.00,
    role VARCHAR(20) DEFAULT 'user',
    status VARCHAR(20) DEFAULT 'active',
    "isActive" BOOLEAN DEFAULT true,
    "vipLevel" INTEGER DEFAULT 0,
    "vipPoints" DECIMAL(15,2) DEFAULT 0.00,
    "totalDeposits" DECIMAL(15,2) DEFAULT 0.00,
    "totalWithdrawals" DECIMAL(15,2) DEFAULT 0.00,
    "totalBets" DECIMAL(15,2) DEFAULT 0.00,
    "totalWins" DECIMAL(15,2) DEFAULT 0.00,
    notes TEXT,
    "lastLogin" TIMESTAMP,
    "registrationDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Diğer tüm tablolar...
-- (Kısaltılmış - tam liste için full backup dosyasına bakın)
