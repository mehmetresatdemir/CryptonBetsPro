import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, json, varchar, decimal, uuid, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Kullanıcılar tablosu
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email").notNull().unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  fullName: text("full_name"),
  phone: text("phone"),
  countryCode: text("country_code").default("+90"),
  tckn: text("tckn"),
  birthdate: text("birthdate"),
  balance: doublePrecision("balance").default(0),
  vipLevel: integer("vip_level").default(0),
  vipPoints: integer("vip_points").default(0),
  status: text("status").default("active"),
  role: text("role").default("user"),
  isActive: boolean("is_active").default(true),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  postalCode: text("postal_code"),
  notes: text("notes"),
  totalDeposits: doublePrecision("total_deposits").default(0),
  totalWithdrawals: doublePrecision("total_withdrawals").default(0),
  totalBets: doublePrecision("total_bets").default(0),
  totalWins: doublePrecision("total_wins").default(0),
  bonusBalance: doublePrecision("bonus_balance").default(0),
  registrationDate: timestamp("registration_date").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

// Finans entegrasyon işlemleri tablosu
export const finance_transactions = pgTable("finance_transactions", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  financeCompanyTxId: text("finance_company_tx_id"),
  paymentMethod: text("payment_method").notNull(),
  type: text("type").notNull(), // 'deposit' or 'withdraw'
  amount: doublePrecision("amount").notNull(),
  currency: text("currency").default("TRY"),
  status: text("status").default("pending"), // pending, processing, completed, failed, cancelled
  providerStatus: text("provider_status"), // Finans şirketinden gelen durum
  requestData: json("request_data"), // API'ye gönderilen veri
  responseData: json("response_data"), // API'den dönen veri
  callbackData: json("callback_data"), // Webhook ile gelen veri
  errorMessage: text("error_message"),
  retryCount: integer("retry_count").default(0),
  lastRetryAt: timestamp("last_retry_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  userIdx: index("finance_transactions_user_idx").on(table.userId),
  statusIdx: index("finance_transactions_status_idx").on(table.status),
  typeIdx: index("finance_transactions_type_idx").on(table.type),
  createdAtIdx: index("finance_transactions_created_at_idx").on(table.createdAt),
}));

// Finans sağlayıcı logları tablosu
export const payment_provider_logs = pgTable("payment_provider_logs", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id").references(() => finance_transactions.transactionId),
  provider: text("provider").notNull(), // 'finance_company'
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(), // GET, POST, PUT
  requestHeaders: json("request_headers"),
  requestBody: json("request_body"),
  responseStatus: integer("response_status"),
  responseHeaders: json("response_headers"),
  responseBody: json("response_body"),
  responseTime: integer("response_time"), // milisaniye
  success: boolean("success").default(false),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  transactionIdx: index("payment_provider_logs_transaction_idx").on(table.transactionId),
  providerIdx: index("payment_provider_logs_provider_idx").on(table.provider),
  createdAtIdx: index("payment_provider_logs_created_at_idx").on(table.createdAt),
}));

// Webhook logları tablosu
export const webhook_logs = pgTable("webhook_logs", {
  id: serial("id").primaryKey(),
  transactionId: text("transaction_id"),
  source: text("source").notNull(), // 'finance_company'
  event: text("event").notNull(),
  payload: json("payload"),
  headers: json("headers"),
  signature: text("signature"),
  signatureValid: boolean("signature_valid").default(false),
  processed: boolean("processed").default(false),
  processingError: text("processing_error"),
  retryCount: integer("retry_count").default(0),
  nextRetryAt: timestamp("next_retry_at"),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  transactionIdx: index("webhook_logs_transaction_idx").on(table.transactionId),
  sourceIdx: index("webhook_logs_source_idx").on(table.source),
  processedIdx: index("webhook_logs_processed_idx").on(table.processed),
  createdAtIdx: index("webhook_logs_created_at_idx").on(table.createdAt),
}));

// API erişim logları tablosu
export const api_access_logs = pgTable("api_access_logs", {
  id: serial("id").primaryKey(),
  clientName: text("client_name"), // 'finance_company'
  apiKey: text("api_key"),
  endpoint: text("endpoint").notNull(),
  method: text("method").notNull(),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  requestId: text("request_id"),
  responseStatus: integer("response_status"),
  responseTime: integer("response_time"),
  success: boolean("success").default(false),
  rateLimited: boolean("rate_limited").default(false),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  clientIdx: index("api_access_logs_client_idx").on(table.clientName),
  ipIdx: index("api_access_logs_ip_idx").on(table.ipAddress),
  endpointIdx: index("api_access_logs_endpoint_idx").on(table.endpoint),
  createdAtIdx: index("api_access_logs_created_at_idx").on(table.createdAt),
}));

// Finans şirketi konfigürasyon tablosu
export const finance_config = pgTable("finance_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Oyunlar tablosu (Legacy)
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  titleSize: text("title_size"),
  bgClass: text("bg_class").notNull(),
  additionalText: text("additional_text"),
  icon: text("icon"),
  hasNumbers: boolean("has_numbers").default(false),
  category: text("category").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Casino oyunları tablosu (Legacy)
export const casinoGames = pgTable("casino_games", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  bgClass: text("bg_class").notNull(),
  footerType: text("footer_type"),
  isSpecial: boolean("is_special").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Haberler tablosu (Legacy)
export const newsItems = pgTable("news_items", {
  id: serial("id").primaryKey(),
  title: text("title"),
  subtitle: text("subtitle"),
  badgeText: text("badge_text"),
  bgClass: text("bg_class").notNull(),
  extraClasses: text("extra_classes"),
  type: text("type").notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Slotegrator oyunları tablosu
export const slotegratorGames = pgTable("slotegrator_games", {
  id: serial("id").primaryKey(),
  uuid: varchar("uuid", { length: 255 }).notNull().unique(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  image: text("image"),
  imageUrl: text("image_url"),
  images: json("images"),
  isActive: boolean("is_active").default(true),
  isMobile: boolean("is_mobile").default(false),
  isDesktop: boolean("is_desktop").default(false),
  hasDemo: boolean("has_demo").default(true),
  hasRealMoney: boolean("has_real_money").default(true),
  tags: json("tags"),
  parameters: json("parameters"),
  minBet: decimal("min_bet", { precision: 10, scale: 2 }),
  maxBet: decimal("max_bet", { precision: 10, scale: 2 }),
  rtp: decimal("rtp", { precision: 5, scale: 2 }),
  volatility: text("volatility"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  providerIdx: index("slotegrator_games_provider_idx").on(table.provider),
  categoryIdx: index("slotegrator_games_category_idx").on(table.category),
  isActiveIdx: index("slotegrator_games_is_active_idx").on(table.isActive),
}));

// Oyun favorileri tablosu
export const gameFavorites = pgTable("game_favorites", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  gameUuid: varchar("game_uuid", { length: 255 }).notNull().references(() => slotegratorGames.uuid),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userGameIdx: index("game_favorites_user_game_idx").on(table.userId, table.gameUuid),
}));

// Oyun oturumları tablosu
export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  gameUuid: varchar("game_uuid", { length: 255 }).notNull().references(() => slotegratorGames.uuid),
  gameUrl: text("game_url").notNull(),
  mode: text("mode").notNull(), // 'demo' | 'real'
  device: text("device").notNull(), // 'desktop' | 'mobile' | 'tablet'
  language: text("language").default("tr"),
  currency: text("currency").default("TRY"),
  status: text("status").default("active"), // 'active' | 'ended' | 'expired'
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  startedAt: timestamp("started_at").defaultNow(),
  endedAt: timestamp("ended_at"),
  duration: integer("duration"), // dakika cinsinden
}, (table) => ({
  userIdx: index("game_sessions_user_idx").on(table.userId),
  gameIdx: index("game_sessions_game_idx").on(table.gameUuid),
  isActiveIdx: index("game_sessions_is_active_idx").on(table.isActive),
}));

// Bahisler tablosu - Simplified to match actual database
export const bets = pgTable("bets", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  gameId: integer("game_id"),
  betAmount: decimal("bet_amount", { precision: 10, scale: 2 }).notNull(),
  winAmount: decimal("win_amount", { precision: 10, scale: 2 }).default("0"),
  status: text("status").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  gameName: text("game_name"),
}, (table) => ({
  userIdx: index("bets_user_idx").on(table.userId),
  statusIdx: index("bets_status_idx").on(table.status),
  createdAtIdx: index("bets_created_at_idx").on(table.createdAt),
}));

// Finansal işlemler tablosu
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  transactionId: varchar("transaction_id", { length: 255 }).notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'deposit', 'withdrawal', 'bet', 'win', 'bonus'
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  balanceBefore: decimal("balance_before", { precision: 10, scale: 2 }),
  balanceAfter: decimal("balance_after", { precision: 10, scale: 2 }),
  currency: text("currency").default("TRY"),
  status: text("status").notNull(), // 'pending', 'completed', 'failed', 'cancelled', 'approved', 'rejected', 'processing'
  paymentMethod: text("payment_method"),
  paymentDetails: json("payment_details"),
  referenceId: varchar("reference_id", { length: 255 }),
  transactionHash: varchar("transaction_hash", { length: 255 }),
  description: text("description"),
  rejectionReason: text("rejection_reason"),
  reviewedBy: text("reviewed_by"),
  notes: text("notes"),
  fees: decimal("fees", { precision: 10, scale: 2 }),
  exchangeRate: decimal("exchange_rate", { precision: 10, scale: 4 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  processedAt: timestamp("processed_at"),
}, (table) => ({
  userIdx: index("transactions_user_idx").on(table.userId),
  typeIdx: index("transactions_type_idx").on(table.type),
  statusIdx: index("transactions_status_idx").on(table.status),
  createdAtIdx: index("transactions_created_at_idx").on(table.createdAt),
}));

// Para yatırma işlemleri tablosu
export const deposits = pgTable("deposits", {
  id: serial("id").primaryKey(),
  transactionId: varchar("transaction_id", { length: 255 }).notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("TRY"),
  paymentMethod: text("payment_method").notNull(), // 'bank_transfer', 'credit_card', 'crypto', 'ewallet'
  paymentProvider: text("payment_provider"), // Finans şirketi provider
  externalTransactionId: varchar("external_transaction_id", { length: 255 }),
  paymentDetails: json("payment_details"),
  status: text("status").default("pending"), // 'pending', 'finance_review', 'approved', 'rejected', 'completed', 'failed'
  financeReviewBy: integer("finance_review_by").references(() => users.id),
  financeReviewAt: timestamp("finance_review_at"),
  financeReviewNotes: text("finance_review_notes"),
  rejectionReason: text("rejection_reason"),
  processingFee: decimal("processing_fee", { precision: 10, scale: 2 }).default("0"),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdx: index("deposits_user_idx").on(table.userId),
  statusIdx: index("deposits_status_idx").on(table.status),
  paymentMethodIdx: index("deposits_payment_method_idx").on(table.paymentMethod),
  createdAtIdx: index("deposits_created_at_idx").on(table.createdAt),
  externalTxIdx: index("deposits_external_tx_idx").on(table.externalTransactionId),
}));

// Para çekme işlemleri tablosu
export const withdrawals = pgTable("withdrawals", {
  id: serial("id").primaryKey(),
  transactionId: varchar("transaction_id", { length: 255 }).notNull().unique(),
  userId: integer("user_id").notNull().references(() => users.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("TRY"),
  withdrawalMethod: text("withdrawal_method").notNull(), // 'bank_transfer', 'crypto', 'ewallet'
  bankDetails: json("bank_details"), // IBAN, hesap sahibi adı, banka adı
  walletAddress: text("wallet_address"),
  ewalletDetails: json("ewallet_details"),
  status: text("status").default("pending"), // 'pending', 'risk_review', 'risk_approved', 'finance_review', 'approved', 'rejected', 'completed', 'failed'
  riskReviewBy: integer("risk_review_by").references(() => users.id),
  riskReviewAt: timestamp("risk_review_at"),
  riskReviewNotes: text("risk_review_notes"),
  riskScore: decimal("risk_score", { precision: 5, scale: 2 }),
  riskFlags: json("risk_flags"), // Risk analizi bayrakları
  financeReviewBy: integer("finance_review_by").references(() => users.id),
  financeReviewAt: timestamp("finance_review_at"),
  financeReviewNotes: text("finance_review_notes"),
  rejectionReason: text("rejection_reason"),
  processingFee: decimal("processing_fee", { precision: 10, scale: 2 }).default("0"),
  netAmount: decimal("net_amount", { precision: 10, scale: 2 }),
  externalTransactionId: varchar("external_transaction_id", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  completedAt: timestamp("completed_at"),
}, (table) => ({
  userIdx: index("withdrawals_user_idx").on(table.userId),
  statusIdx: index("withdrawals_status_idx").on(table.status),
  withdrawalMethodIdx: index("withdrawals_method_idx").on(table.withdrawalMethod),
  createdAtIdx: index("withdrawals_created_at_idx").on(table.createdAt),
  riskScoreIdx: index("withdrawals_risk_score_idx").on(table.riskScore),
}));

// Risk analizi tablosu
export const riskAnalysis = pgTable("risk_analysis", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  transactionId: varchar("transaction_id", { length: 255 }).notNull(),
  transactionType: text("transaction_type").notNull(), // 'withdrawal', 'deposit'
  analysisType: text("analysis_type").notNull(), // 'automated', 'manual'
  riskScore: decimal("risk_score", { precision: 5, scale: 2 }).notNull(),
  riskLevel: text("risk_level").notNull(), // 'low', 'medium', 'high', 'critical'
  flags: json("flags"), // Risk bayrakları array
  details: json("details"), // Detaylı analiz verileri
  gameHistory: json("game_history"), // Oyun geçmişi analizi
  financialHistory: json("financial_history"), // Finansal geçmiş analizi
  behaviorAnalysis: json("behavior_analysis"), // Davranış analizi
  mlPredictions: json("ml_predictions"), // ML tahminleri
  reviewedBy: integer("reviewed_by").references(() => users.id),
  reviewNotes: text("review_notes"),
  decision: text("decision"), // 'approve', 'reject', 'escalate'
  createdAt: timestamp("created_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
}, (table) => ({
  userIdx: index("risk_analysis_user_idx").on(table.userId),
  transactionIdx: index("risk_analysis_transaction_idx").on(table.transactionId),
  riskLevelIdx: index("risk_analysis_level_idx").on(table.riskLevel),
  createdAtIdx: index("risk_analysis_created_at_idx").on(table.createdAt),
}));

// KYC dokümanları tablosu
export const kycDocuments = pgTable("kyc_documents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  type: text("type").notNull(), // 'identity', 'address', 'bank_statement'
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  status: text("status").default("pending"), // 'pending', 'approved', 'rejected'
  rejectionReason: text("rejection_reason"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  reviewedAt: timestamp("reviewed_at"),
}, (table) => ({
  userIdx: index("kyc_documents_user_idx").on(table.userId),
  statusIdx: index("kyc_documents_status_idx").on(table.status),
}));

// Bonus yönetimi tablosu
export const bonuses = pgTable("bonuses", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'welcome', 'deposit', 'loyalty', 'cashback', 'freespin', 'reload', 'birthday', 'referral', 'tournament', 'special'
  description: text("description").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Bonus yüzdesi veya sabit miktar
  maxAmount: decimal("max_amount", { precision: 10, scale: 2 }).default("0"), // Maksimum bonus miktarı
  minDeposit: decimal("min_deposit", { precision: 10, scale: 2 }).default("0"), // Minimum yatırım gereksinimi
  wagerRequirement: integer("wager_requirement").default(1), // Çevrim şartı (katları)
  status: text("status").default("active"), // 'active', 'inactive', 'upcoming', 'expired'
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  isHighlighted: boolean("is_highlighted").default(false), // Öne çıkan bonus
  targetUserType: text("target_user_type").default("all"), // 'all', 'new', 'existing', 'vip'
  usageCount: integer("usage_count").default(0), // Kaç kez kullanıldı
  totalClaimed: integer("total_claimed").default(0), // Toplam talep sayısı
  totalValue: decimal("total_value", { precision: 15, scale: 2 }).default("0"), // Toplam dağıtılan değer
  conversionRate: decimal("conversion_rate", { precision: 5, scale: 2 }).default("0"), // Dönüşüm oranı %
  popularityScore: decimal("popularity_score", { precision: 3, scale: 1 }).default("0"), // 0-10 arası popülerlik skoru
  imageUrl: text("image_url"),
  termsAndConditions: text("terms_and_conditions"),
  gameRestrictions: text("game_restrictions"),
  code: varchar("code", { length: 50 }), // Bonus kodu (opsiyonel)
  createdBy: integer("created_by").notNull().references(() => users.id),
  lastModifiedBy: integer("last_modified_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  typeIdx: index("bonuses_type_idx").on(table.type),
  statusIdx: index("bonuses_status_idx").on(table.status),
  targetUserTypeIdx: index("bonuses_target_user_type_idx").on(table.targetUserType),
  startDateIdx: index("bonuses_start_date_idx").on(table.startDate),
  endDateIdx: index("bonuses_end_date_idx").on(table.endDate),
  codeIdx: index("bonuses_code_idx").on(table.code),
  createdAtIdx: index("bonuses_created_at_idx").on(table.createdAt),
}));

// Kullanıcı bonus talepleri tablosu
export const userBonuses = pgTable("user_bonuses", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  bonusId: integer("bonus_id").notNull().references(() => bonuses.id),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(), // Alınan bonus miktarı
  wagerRequirement: decimal("wager_requirement", { precision: 10, scale: 2 }).notNull(), // Çevrim şartı tutarı
  wageredAmount: decimal("wagered_amount", { precision: 10, scale: 2 }).default("0"), // Çevrilen miktar
  status: text("status").default("active"), // 'active', 'completed', 'forfeited', 'expired'
  expiryDate: timestamp("expiry_date"), // Bonus son kullanma tarihi
  claimedAt: timestamp("claimed_at").defaultNow(),
  completedAt: timestamp("completed_at"),
  forfeitedAt: timestamp("forfeited_at"),
  relatedDepositId: integer("related_deposit_id").references(() => deposits.id), // İlgili yatırım işlemi
}, (table) => ({
  userIdx: index("user_bonuses_user_idx").on(table.userId),
  bonusIdx: index("user_bonuses_bonus_idx").on(table.bonusId),
  statusIdx: index("user_bonuses_status_idx").on(table.status),
  expiryDateIdx: index("user_bonuses_expiry_date_idx").on(table.expiryDate),
  claimedAtIdx: index("user_bonuses_claimed_at_idx").on(table.claimedAt),
}));

// Admin log tablosu
export const adminLogs = pgTable("admin_logs", {
  id: serial("id").primaryKey(),
  adminId: integer("admin_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  targetType: text("target_type"), // 'user', 'game', 'transaction'
  targetId: varchar("target_id", { length: 255 }),
  details: json("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  adminIdx: index("admin_logs_admin_idx").on(table.adminId),
  actionIdx: index("admin_logs_action_idx").on(table.action),
  createdAtIdx: index("admin_logs_created_at_idx").on(table.createdAt),
}));

// Kullanıcı logları tablosu
export const userLogs = pgTable("user_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  category: text("category").notNull(), // 'auth', 'transaction', 'game', 'profile', 'security', 'deposit', 'withdrawal'
  description: text("description").notNull(),
  ipAddress: varchar("ip_address", { length: 45 }).notNull(),
  userAgent: text("user_agent"),
  metadata: json("metadata"), // Ek veriler
  severity: text("severity").default("low"), // 'low', 'medium', 'high', 'critical'
  status: text("status").default("success"), // 'success', 'failure', 'pending', 'warning'
  sessionId: varchar("session_id", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  userIdx: index("user_logs_user_idx").on(table.userId),
  categoryIdx: index("user_logs_category_idx").on(table.category),
  severityIdx: index("user_logs_severity_idx").on(table.severity),
  statusIdx: index("user_logs_status_idx").on(table.status),
  createdAtIdx: index("user_logs_created_at_idx").on(table.createdAt),
  actionIdx: index("user_logs_action_idx").on(table.action),
}));



// Oyun istatistikleri tablosu
export const gameStats = pgTable("game_stats", {
  id: serial("id").primaryKey(),
  gameUuid: varchar("game_uuid", { length: 255 }).notNull().references(() => slotegratorGames.uuid),
  totalPlays: integer("total_plays").default(0),
  totalBets: decimal("total_bets", { precision: 15, scale: 2 }).default("0"),
  totalWins: decimal("total_wins", { precision: 15, scale: 2 }).default("0"),
  totalPlayers: integer("total_players").default(0),
  avgSessionDuration: integer("avg_session_duration"), // dakika cinsinden
  popularityScore: decimal("popularity_score", { precision: 5, scale: 2 }).default("0"),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  gameUuidIdx: index("game_stats_game_uuid_idx").on(table.gameUuid),
  popularityIdx: index("game_stats_popularity_idx").on(table.popularityScore),
}));

// Gerçek para oyun sessionları - mevcut table'ı güncelliyoruz

// Gerçek para bet transactionları
export const betTransactions = pgTable("bet_transactions", {
  id: uuid("id").primaryKey(),
  sessionId: varchar("session_id", { length: 100 }).notNull().references(() => gameSessions.sessionId),
  userId: integer("user_id").notNull().references(() => users.id),
  gameUuid: varchar("game_uuid", { length: 255 }).notNull().references(() => slotegratorGames.uuid),
  roundId: varchar("round_id", { length: 100 }).notNull(),
  betAmount: decimal("bet_amount", { precision: 15, scale: 2 }).notNull(),
  winAmount: decimal("win_amount", { precision: 15, scale: 2 }).default("0"),
  balanceBefore: decimal("balance_before", { precision: 15, scale: 2 }).notNull(),
  balanceAfter: decimal("balance_after", { precision: 15, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("TRY"),
  transactionType: text("transaction_type").notNull(), // 'bet', 'win', 'refund'
  status: text("status").default("pending"), // 'pending', 'completed', 'cancelled', 'failed'
  gameData: json("game_data"), // Oyun state bilgileri
  slotegratorTransactionId: varchar("slotegrator_transaction_id", { length: 100 }),
  processed: boolean("processed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  processedAt: timestamp("processed_at"),
}, (table) => ({
  sessionIdx: index("bet_transactions_session_idx").on(table.sessionId),
  userIdx: index("bet_transactions_user_idx").on(table.userId),
  gameUuidIdx: index("bet_transactions_game_uuid_idx").on(table.gameUuid),
  roundIdx: index("bet_transactions_round_idx").on(table.roundId),
  statusIdx: index("bet_transactions_status_idx").on(table.status),
  createdAtIdx: index("bet_transactions_created_at_idx").on(table.createdAt),
}));

// İlişkileri tanımlıyoruz
export const usersRelations = relations(users, ({ many }) => ({
  bets: many(bets),
  transactions: many(transactions),
  gameSessions: many(gameSessions),
  gameFavorites: many(gameFavorites),
  kycDocuments: many(kycDocuments),
  adminLogs: many(adminLogs),
  userLogs: many(userLogs),
  bonuses: many(bonuses),
}));

export const slotegratorGamesRelations = relations(slotegratorGames, ({ many }) => ({
  bets: many(bets),
  gameSessions: many(gameSessions),
  gameFavorites: many(gameFavorites),
  bonuses: many(bonuses),
  gameStats: many(gameStats),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

export const gameSessionsRelations = relations(gameSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [gameSessions.userId],
    references: [users.id],
  }),
  game: one(slotegratorGames, {
    fields: [gameSessions.gameUuid],
    references: [slotegratorGames.uuid],
  }),
  bets: many(bets),
}));

export const gameFavoritesRelations = relations(gameFavorites, ({ one }) => ({
  user: one(users, {
    fields: [gameFavorites.userId],
    references: [users.id],
  }),
  game: one(slotegratorGames, {
    fields: [gameFavorites.gameUuid],
    references: [slotegratorGames.uuid],
  }),
}));

export const kycDocumentsRelations = relations(kycDocuments, ({ one }) => ({
  user: one(users, {
    fields: [kycDocuments.userId],
    references: [users.id],
  }),
  reviewer: one(users, {
    fields: [kycDocuments.reviewedBy],
    references: [users.id],
  }),
}));

export const adminLogsRelations = relations(adminLogs, ({ one }) => ({
  admin: one(users, {
    fields: [adminLogs.adminId],
    references: [users.id],
  }),
}));

export const userLogsRelations = relations(userLogs, ({ one }) => ({
  user: one(users, {
    fields: [userLogs.userId],
    references: [users.id],
  }),
}));

export const bonusesRelations = relations(bonuses, ({ one }) => ({
  createdByUser: one(users, {
    fields: [bonuses.createdBy],
    references: [users.id],
  }),
  lastModifiedByUser: one(users, {
    fields: [bonuses.lastModifiedBy],
    references: [users.id],
  }),
}));

export const gameStatsRelations = relations(gameStats, ({ one }) => ({
  game: one(slotegratorGames, {
    fields: [gameStats.gameUuid],
    references: [slotegratorGames.uuid],
  }),
}));

export const betsRelations = relations(bets, ({ one }) => ({
  user: one(users, {
    fields: [bets.userId],
    references: [users.id],
  }),
}));

// Ödeme hesapları tablosu
export const paymentAccounts = pgTable("payment_accounts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  methodType: text("method_type").notNull(), // bank_transfer, credit_card, parolapara, papel, cryptocurrency
  accountName: text("account_name").notNull(),
  accountNumber: text("account_number").notNull(),
  iban: text("iban"),
  bankName: text("bank_name"),
  branchCode: text("branch_code"),
  isActive: boolean("is_active").default(true),
  minAmount: doublePrecision("min_amount").default(50),
  maxAmount: doublePrecision("max_amount").default(50000),
  dailyLimit: doublePrecision("daily_limit").default(500000),
  fee: doublePrecision("fee").default(0),
  processingTime: text("processing_time").default("Anında"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  methodTypeIdx: index("payment_accounts_method_type_idx").on(table.methodType),
  isActiveIdx: index("payment_accounts_is_active_idx").on(table.isActive),
}));

// Güvenlik olayları tablosu
export const securityEvents = pgTable("security_events", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  type: text("type").notNull(), // login_attempt, failed_login, suspicious_activity, ip_blocked, account_locked, password_changed
  severity: text("severity").notNull(), // low, medium, high, critical
  description: text("description").notNull(),
  ipAddress: text("ip_address").notNull(),
  userAgent: text("user_agent"),
  userId: integer("user_id").references(() => users.id),
  username: text("username"),
  location: text("location"),
  resolved: boolean("resolved").default(false),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  typeIdx: index("security_events_type_idx").on(table.type),
  severityIdx: index("security_events_severity_idx").on(table.severity),
  ipIdx: index("security_events_ip_idx").on(table.ipAddress),
  createdAtIdx: index("security_events_created_at_idx").on(table.createdAt),
}));

// IP blokları tablosu
export const ipBlocks = pgTable("ip_blocks", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  ipAddress: text("ip_address").notNull(),
  reason: text("reason").notNull(),
  blockedBy: text("blocked_by").notNull(),
  isActive: boolean("is_active").default(true),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  ipIdx: index("ip_blocks_ip_idx").on(table.ipAddress),
  isActiveIdx: index("ip_blocks_is_active_idx").on(table.isActive),
}));

// Giriş denemeleri tablosu
export const loginAttempts = pgTable("login_attempts", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull(),
  ipAddress: text("ip_address").notNull(),
  success: boolean("success").notNull(),
  userAgent: text("user_agent"),
  location: text("location"),
  failureReason: text("failure_reason"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  usernameIdx: index("login_attempts_username_idx").on(table.username),
  ipIdx: index("login_attempts_ip_idx").on(table.ipAddress),
  successIdx: index("login_attempts_success_idx").on(table.success),
  createdAtIdx: index("login_attempts_created_at_idx").on(table.createdAt),
}));

// Legacy güvenlik ayarları tablosı
export const legacySecuritySettings = pgTable("security_settings", {
  id: serial("id").primaryKey(),
  maxLoginAttempts: integer("max_login_attempts").default(5),
  lockoutDuration: integer("lockout_duration").default(30), // dakika
  passwordMinLength: integer("password_min_length").default(8),
  requireTwoFactor: boolean("require_two_factor").default(false),
  allowVPN: boolean("allow_vpn").default(false),
  sessionTimeout: integer("session_timeout").default(120), // dakika
  ipWhitelistEnabled: boolean("ip_whitelist_enabled").default(false),
  geoBlocking: boolean("geo_blocking").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
  updatedBy: text("updated_by"),
});

// Email şablonları tablosu
export const emailTemplates = pgTable("email_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  type: text("type").notNull(), // 'welcome', 'verification', 'reset_password', 'promotional', 'transactional'
  language: text("language").notNull().default("tr"), // 'tr', 'en', 'ka'
  variables: json("variables").$type<string[]>().default([]), // Template değişkenleri
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
}, (table) => ({
  typeIdx: index("email_templates_type_idx").on(table.type),
  languageIdx: index("email_templates_language_idx").on(table.language),
  isActiveIdx: index("email_templates_is_active_idx").on(table.isActive),
}));

// Legacy relations
export const gamesRelations = relations(games, ({ many }) => ({
  // Legacy compatibility
}));

// Zod şemaları ve tipler
export const insertUserSchema = createInsertSchema(users);
export const insertGameSchema = createInsertSchema(games);
export const insertCasinoGameSchema = createInsertSchema(casinoGames);
export const insertNewsItemSchema = createInsertSchema(newsItems);
export const insertSlotegratorGameSchema = createInsertSchema(slotegratorGames);
export const insertGameFavoriteSchema = createInsertSchema(gameFavorites);
export const insertGameSessionSchema = createInsertSchema(gameSessions);
export const insertBetSchema = createInsertSchema(bets);
export const insertTransactionSchema = createInsertSchema(transactions);
export const insertKycDocumentSchema = createInsertSchema(kycDocuments);
export const insertAdminLogSchema = createInsertSchema(adminLogs);
export const insertBonusSchema = createInsertSchema(bonuses);
export const insertGameStatsSchema = createInsertSchema(gameStats);
export const insertPaymentAccountSchema = createInsertSchema(paymentAccounts);
export const insertSecurityEventSchema = createInsertSchema(securityEvents);
export const insertIpBlockSchema = createInsertSchema(ipBlocks);
export const insertLoginAttemptSchema = createInsertSchema(loginAttempts);
export const insertSecuritySettingsSchema = createInsertSchema(legacySecuritySettings);
export const insertEmailTemplateSchema = createInsertSchema(emailTemplates);

// Insert tipler
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertSlotegratorGame = z.infer<typeof insertSlotegratorGameSchema>;
export type InsertGameFavorite = z.infer<typeof insertGameFavoriteSchema>;
export type InsertGameSession = z.infer<typeof insertGameSessionSchema>;
export type InsertBet = z.infer<typeof insertBetSchema>;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type InsertKycDocument = z.infer<typeof insertKycDocumentSchema>;
export type InsertAdminLog = z.infer<typeof insertAdminLogSchema>;
export type InsertBonus = z.infer<typeof insertBonusSchema>;
export type InsertGameStats = z.infer<typeof insertGameStatsSchema>;
export type InsertPaymentAccount = z.infer<typeof insertPaymentAccountSchema>;
export type InsertSecurityEvent = z.infer<typeof insertSecurityEventSchema>;
export type InsertIpBlock = z.infer<typeof insertIpBlockSchema>;
export type InsertLoginAttempt = z.infer<typeof insertLoginAttemptSchema>;
export type InsertSecuritySettings = z.infer<typeof insertSecuritySettingsSchema>;
// Removed duplicate - using createInsertEmailTemplate below

// Select tipler
export type User = typeof users.$inferSelect;
export type SlotegratorGame = typeof slotegratorGames.$inferSelect;
export type GameFavorite = typeof gameFavorites.$inferSelect;
export type GameSession = typeof gameSessions.$inferSelect;
export type Bet = typeof bets.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type KycDocument = typeof kycDocuments.$inferSelect;
export type AdminLog = typeof adminLogs.$inferSelect;
export type Bonus = typeof bonuses.$inferSelect;
export type GameStats = typeof gameStats.$inferSelect;
export type PaymentAccount = typeof paymentAccounts.$inferSelect;
export type SecurityEvent = typeof securityEvents.$inferSelect;
export type IpBlock = typeof ipBlocks.$inferSelect;
export type LoginAttempt = typeof loginAttempts.$inferSelect;
export type SecuritySettings = typeof legacySecuritySettings.$inferSelect;
export type EmailTemplate = typeof emailTemplates.$inferSelect;

// Legacy tipler (mevcut uyumluluk için)
export type Game = typeof games.$inferSelect;
export type CasinoGame = typeof casinoGames.$inferSelect;
export type NewsItem = typeof newsItems.$inferSelect;

// AI Chat Support tablosu
export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id), // Guest kullanıcılar için null olabilir
  sessionId: text("session_id").notNull(),
  message: text("message").notNull(),
  response: text("response"),
  role: text("role").notNull(), // 'user' | 'assistant' | 'system'
  intent: text("intent"), // Mesajın amacı (bonus_request, deposit_inquiry, etc.)
  confidence: doublePrecision("confidence"), // AI'ın güven skoru
  wasHelpful: boolean("was_helpful"), // Kullanıcı geri bildirimi
  responseTime: integer("response_time"), // Yanıt süresi (ms)
  language: text("language").default("tr"),
  metadata: json("metadata"), // Ek bilgiler
  createdAt: timestamp("created_at").defaultNow(),
});

// Chat oturumları tablosu
export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  userId: integer("user_id").references(() => users.id),
  guestName: text("guest_name"), // Misafir kullanıcılar için isim
  status: text("status").default("active"), // active, closed, transferred
  lastActivity: timestamp("last_activity").defaultNow(),
  totalMessages: integer("total_messages").default(0),
  satisfaction: integer("satisfaction"), // 1-5 memnuniyet puanı
  resolvedIssue: boolean("resolved_issue"),
  language: text("language").default("tr"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = typeof chatMessages.$inferInsert;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = typeof chatSessions.$inferInsert;

export const insertChatMessageSchema = createInsertSchema(chatMessages);
export const insertChatSessionSchema = createInsertSchema(chatSessions);

// Admin Users - Sistem yöneticileri
export const adminUsers = pgTable('admin_users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 50 }).notNull().unique(),
  fullName: varchar('full_name', { length: 100 }).notNull(),
  email: varchar('email', { length: 100 }).notNull().unique(),
  phone: varchar('phone', { length: 20 }),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('admin'),
  permissions: text('permissions').array(),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  twoFactorSecret: varchar('two_factor_secret', { length: 100 }),
  twoFactorEnabled: boolean('two_factor_enabled').default(false),
  lastLogin: timestamp('last_login'),
  lastLoginIp: varchar('last_login_ip', { length: 45 }),
  failedLoginAttempts: integer('failed_login_attempts').default(0),
  lockedUntil: timestamp('locked_until'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
  createdBy: integer('created_by')
});

export const adminUsersRelations = relations(adminUsers, ({ many }) => ({
  sentMessages: many(userMessages),
  systemLogs: many(systemLogs),
  staffMembers: many(staffMembers),
  cmsPages: many(cmsPages)
}));

// Staff Members - Personel üyeleri
export const staffMembers = pgTable('staff_members', {
  id: serial('id').primaryKey(),
  adminUserId: integer('admin_user_id').references(() => adminUsers.id),
  firstName: varchar('first_name', { length: 50 }).notNull(),
  lastName: varchar('last_name', { length: 50 }).notNull(),
  position: varchar('position', { length: 100 }).notNull(),
  department: varchar('department', { length: 50 }).notNull(),
  hireDate: timestamp('hire_date').notNull(),
  salary: varchar('salary', { length: 20 }),
  workingHours: text('working_hours'),
  status: varchar('status', { length: 20 }).notNull().default('active'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const staffMembersRelations = relations(staffMembers, ({ one }) => ({
  adminUser: one(adminUsers, {
    fields: [staffMembers.adminUserId],
    references: [adminUsers.id]
  })
}));

// Security Settings - Güvenlik ayarları
export const securitySettings = pgTable('security_settings', {
  id: serial('id').primaryKey(),
  settingKey: varchar('setting_key', { length: 100 }).notNull().unique(),
  settingValue: text('setting_value').notNull(),
  description: text('description'),
  category: varchar('category', { length: 50 }).notNull(),
  isActive: boolean('is_active').default(true),
  updatedBy: integer('updated_by').references(() => adminUsers.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// System Logs - Sistem logları
export const systemLogs = pgTable('system_logs', {
  id: serial('id').primaryKey(),
  level: varchar('level', { length: 20 }).notNull(),
  category: varchar('category', { length: 50 }).notNull(),
  message: text('message').notNull(),
  details: text('details'),
  source: varchar('source', { length: 100 }).notNull(),
  userId: integer('user_id').references(() => users.id),
  adminUserId: integer('admin_user_id').references(() => adminUsers.id),
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  metadata: text('metadata'),
  createdAt: timestamp('created_at').defaultNow()
});

// User Messages - Kullanıcı mesajları
export const userMessages = pgTable('user_messages', {
  id: serial('id').primaryKey(),
  senderId: integer('sender_id').references(() => users.id),
  recipientId: integer('recipient_id').references(() => users.id),
  adminSenderId: integer('admin_sender_id').references(() => adminUsers.id),
  subject: varchar('subject', { length: 200 }).notNull(),
  content: text('content').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('unread'),
  priority: varchar('priority', { length: 20 }).default('medium'),
  category: varchar('category', { length: 50 }),
  parentId: integer('parent_id'),
  attachments: text('attachments').array(),
  scheduledFor: timestamp('scheduled_for'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// CMS Pages - İçerik yönetim sistemi
export const cmsPages = pgTable('cms_pages', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull().unique(),
  content: text('content').notNull(),
  excerpt: text('excerpt'),
  template: varchar('template', { length: 50 }).default('default'),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  language: varchar('language', { length: 10 }).default('tr'),
  authorId: integer('author_id').references(() => adminUsers.id),
  metaTitle: varchar('meta_title', { length: 200 }),
  metaDescription: text('meta_description'),
  metaKeywords: text('meta_keywords'),
  featuredImage: varchar('featured_image', { length: 255 }),
  publishedAt: timestamp('published_at'),
  orderIndex: integer('order_index').default(0),
  parentId: integer('parent_id'),
  showInMenu: boolean('show_in_menu').default(false),
  isHomepage: boolean('is_homepage').default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Content Items - Genel içerik öğeleri
export const contentItems = pgTable('content_items', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 200 }).notNull(),
  slug: varchar('slug', { length: 200 }).notNull(),
  content: text('content').notNull(),
  type: varchar('type', { length: 50 }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('draft'),
  language: varchar('language', { length: 10 }).default('tr'),
  authorId: integer('author_id').references(() => adminUsers.id),
  categoryId: integer('category_id'),
  tags: text('tags').array(),
  featured: boolean('featured').default(false),
  publishDate: timestamp('publish_date'),
  expiryDate: timestamp('expiry_date'),
  viewCount: integer('view_count').default(0),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

export const insertAdminUserSchema = createInsertSchema(adminUsers);
export const insertStaffMemberSchema = createInsertSchema(staffMembers);
export const insertSecuritySettingSchema = createInsertSchema(securitySettings);
export const insertSystemLogSchema = createInsertSchema(systemLogs);
export const insertUserMessageSchema = createInsertSchema(userMessages);
export const insertCmsPageSchema = createInsertSchema(cmsPages);
export const insertContentItemSchema = createInsertSchema(contentItems);

export type AdminUser = typeof adminUsers.$inferSelect;
export type NewAdminUser = typeof adminUsers.$inferInsert;
export type StaffMember = typeof staffMembers.$inferSelect;
export type NewStaffMember = typeof staffMembers.$inferInsert;
export type SecuritySetting = typeof securitySettings.$inferSelect;
export type NewSecuritySetting = typeof securitySettings.$inferInsert;
export type SystemLog = typeof systemLogs.$inferSelect;
export type NewSystemLog = typeof systemLogs.$inferInsert;
export type UserMessage = typeof userMessages.$inferSelect;
export type NewUserMessage = typeof userMessages.$inferInsert;
export type CmsPage = typeof cmsPages.$inferSelect;
export type NewCmsPage = typeof cmsPages.$inferInsert;
export type ContentItem = typeof contentItems.$inferSelect;
export type NewContentItem = typeof contentItems.$inferInsert;

// Profesyonel haber yönetimi tablosu
export const newsArticles = pgTable("news_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  category: text("category").notNull(), // 'casino', 'bonuses', 'updates', 'events', 'tournaments'
  status: text("status").default("draft"), // 'draft', 'published', 'archived'
  featuredImage: text("featured_image"),
  authorId: integer("author_id").references(() => users.id),
  viewCount: integer("view_count").default(0),
  isFeatured: boolean("is_featured").default(false),
  isBreaking: boolean("is_breaking").default(false),
  tags: text("tags").array(),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  publishedAt: timestamp("published_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  slugIdx: index("news_articles_slug_idx").on(table.slug),
  categoryIdx: index("news_articles_category_idx").on(table.category),
  statusIdx: index("news_articles_status_idx").on(table.status),
  publishedAtIdx: index("news_articles_published_at_idx").on(table.publishedAt),
}));

export type NewsArticle = typeof newsArticles.$inferSelect;
export type InsertNewsArticle = typeof newsArticles.$inferInsert;
export const insertNewsArticleSchema = createInsertSchema(newsArticles);

// Tema yönetimi tablosu
export const themes = pgTable("themes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  displayName: text("display_name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(), // 'casino', 'modern', 'classic', 'luxury', 'neon', 'minimal'
  isActive: boolean("is_active").default(false),
  isPremium: boolean("is_premium").default(false),
  previewImage: text("preview_image"),
  
  // Renk ayarları
  colors: json("colors").$type<{
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  }>(),
  
  // Font ayarları
  fonts: json("fonts").$type<{
    primary: string;
    secondary: string;
    heading: string;
    mono: string;
  }>(),
  
  // Layout ayarları
  layout: json("layout").$type<{
    borderRadius: number;
    spacing: number;
    headerHeight: number;
    sidebarWidth: number;
    containerMaxWidth: number;
  }>(),
  
  // Efekt ayarları
  effects: json("effects").$type<{
    shadows: boolean;
    animations: boolean;
    gradients: boolean;
    blur: boolean;
    glow: boolean;
  }>(),
  
  // Komponent ayarları
  components: json("components").$type<{
    buttons: 'rounded' | 'sharp' | 'pill';
    cards: 'flat' | 'elevated' | 'outlined';
    inputs: 'filled' | 'outlined' | 'underlined';
  }>(),
  
  // CSS dosya yolu
  cssFile: text("css_file"),
  
  // Tema versiyonu
  version: text("version").default("1.0.0"),
  
  // Metadata
  author: text("author").default("CryptonBets"),
  tags: json("tags").$type<string[]>(),
  
  createdBy: integer("created_by").references(() => users.id),
  updatedBy: integer("updated_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  nameIdx: index("theme_name_idx").on(table.name),
  categoryIdx: index("theme_category_idx").on(table.category),
  activeIdx: index("theme_active_idx").on(table.isActive),
  premiumIdx: index("theme_premium_idx").on(table.isPremium),
}));

// Tema özelleştirme geçmişi
export const themeCustomizations = pgTable("theme_customizations", {
  id: serial("id").primaryKey(),
  themeId: integer("theme_id").references(() => themes.id),
  userId: integer("user_id").references(() => users.id),
  customizationName: text("customization_name").notNull(),
  changes: json("changes"),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  themeIdx: index("theme_customizations_theme_idx").on(table.themeId),
  userIdx: index("theme_customizations_user_idx").on(table.userId),
}));

export type Theme = typeof themes.$inferSelect;
export type InsertTheme = typeof themes.$inferInsert;
export type ThemeCustomization = typeof themeCustomizations.$inferSelect;
export type InsertThemeCustomization = typeof themeCustomizations.$inferInsert;

export const insertThemeSchema = createInsertSchema(themes);
export const insertThemeCustomizationSchema = createInsertSchema(themeCustomizations);

// Banner yönetimi tablosu
export const banners = pgTable("banners", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  imageUrl: text("image_url").notNull(),
  mobileImageUrl: text("mobile_image_url"),
  linkUrl: text("link_url"),
  type: text("type").notNull(), // 'slider', 'popup', 'sidebar', 'header', 'footer'
  position: integer("position").default(1),
  status: text("status").default("active"), // 'active', 'inactive', 'scheduled', 'expired'
  language: text("language").default("tr"), // 'tr', 'en', 'ka'
  pageLocation: text("page_location").default("home"), // 'home', 'slot', 'casino', 'bonuses', 'all'
  targetAudience: text("target_audience").default("all"), // 'all', 'new_users', 'vip', 'inactive'
  minVipLevel: integer("min_vip_level").default(0),

  impressions: integer("impressions").default(0),
  clicks: integer("clicks").default(0),

  displayPriority: integer("display_priority").default(1), // 1 = highest priority
  displayFrequency: integer("display_frequency").default(1), // Converted from text to integer to match DB
  popupDelay: integer("popup_delay").default(3000), // milliseconds for popup banners
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(1),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
}, (table) => ({
  typeIdx: index("banner_type_idx").on(table.type),
  statusIdx: index("banner_status_idx").on(table.status),
  pageLocationIdx: index("banner_page_location_idx").on(table.pageLocation),
  languageIdx: index("banner_language_idx").on(table.language),
  activeIdx: index("banner_active_idx").on(table.isActive),
}));

// Banner tıklama istatistikleri
export const bannerStats = pgTable("banner_stats", {
  id: serial("id").primaryKey(),
  bannerId: integer("banner_id").references(() => banners.id),
  userId: integer("user_id").references(() => users.id), // null for anonymous users
  sessionId: text("session_id"),
  action: text("action").notNull(), // 'impression', 'click', 'close'
  userAgent: text("user_agent"),
  ipAddress: text("ip_address"),
  referrer: text("referrer"),
  deviceType: text("device_type"), // 'desktop', 'mobile', 'tablet'
  browserType: text("browser_type"),
  country: text("country"),
  createdAt: timestamp("created_at").defaultNow(),
}, (table) => ({
  bannerIdx: index("banner_stats_banner_idx").on(table.bannerId),
  actionIdx: index("banner_stats_action_idx").on(table.action),
  dateIdx: index("banner_stats_date_idx").on(table.createdAt),
}));

// Banner A/B test grupları
export const bannerTests = pgTable("banner_tests", {
  id: serial("id").primaryKey(),
  testName: text("test_name").notNull(),
  description: text("description"),
  bannerAId: integer("banner_a_id").references(() => banners.id),
  bannerBId: integer("banner_b_id").references(() => banners.id),
  trafficSplit: integer("traffic_split").default(50), // percentage for banner A
  status: text("status").default("running"), // 'running', 'paused', 'completed'
  winnerBannerId: integer("winner_banner_id").references(() => banners.id),
  startDate: timestamp("start_date").defaultNow(),
  endDate: timestamp("end_date"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Banner = typeof banners.$inferSelect;
export type InsertBanner = typeof banners.$inferInsert;
export type BannerStat = typeof bannerStats.$inferSelect;
export type InsertBannerStat = typeof bannerStats.$inferInsert;
export type BannerTest = typeof bannerTests.$inferSelect;
export type InsertBannerTest = typeof bannerTests.$inferInsert;

export const insertBannerSchema = createInsertSchema(banners).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBannerStatSchema = createInsertSchema(bannerStats).omit({
  id: true,
  createdAt: true,
});

export const insertBannerTestSchema = createInsertSchema(bannerTests).omit({
  id: true,
  createdAt: true,
});

// Site ayarları tablosu
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value"),
  category: text("category").notNull().default("general"),
  type: text("type").notNull().default("text"), // text, number, boolean, json, password
  description: text("description"),
  isPublic: boolean("is_public").default(false),
  isEncrypted: boolean("is_encrypted").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Para Birimleri tablosu
export const currencies = pgTable("currencies", {
  id: serial("id").primaryKey(),
  code: text("code").notNull().unique(),
  name: text("name").notNull(),
  symbol: text("symbol").notNull(),
  exchangeRate: decimal("exchange_rate", { precision: 18, scale: 8 }).notNull().default("1.0"),
  isDefault: boolean("is_default").default(false),
  isActive: boolean("is_active").default(true),
  minDeposit: decimal("min_deposit", { precision: 10, scale: 2 }),
  maxDeposit: decimal("max_deposit", { precision: 10, scale: 2 }),
  minWithdraw: decimal("min_withdraw", { precision: 10, scale: 2 }),
  maxWithdraw: decimal("max_withdraw", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Ödeme Yöntemleri tablosu
export const paymentMethodsTable = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // deposit, withdraw, both
  provider: text("provider").notNull(),
  apiKey: text("api_key"),
  secretKey: text("secret_key"),
  webhookUrl: text("webhook_url"),
  isActive: boolean("is_active").default(true),
  minAmount: decimal("min_amount", { precision: 10, scale: 2 }),
  maxAmount: decimal("max_amount", { precision: 10, scale: 2 }),
  fee: decimal("fee", { precision: 5, scale: 2 }).default("0"),
  feeType: text("fee_type").default("percentage"), // percentage, fixed
  currencies: json("currencies"),
  config: json("config"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Bonus Şablonları tablosu
export const bonusTemplates = pgTable("bonus_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type").notNull(), // welcome, deposit, loyalty, cashback, freespin, etc.
  description: text("description"),
  amount: decimal("amount", { precision: 10, scale: 2 }),
  minDeposit: decimal("min_deposit", { precision: 10, scale: 2 }),
  maxAmount: decimal("max_amount", { precision: 10, scale: 2 }),
  wagerRequirement: integer("wager_requirement").default(1),
  status: text("status").default("active"),
  isActive: boolean("is_active").default(true),
  validFrom: timestamp("valid_from"),
  validUntil: timestamp("valid_until"),
  imageUrl: text("image_url"),
  termsAndConditions: text("terms_and_conditions"),
  code: text("code").unique(),
  usageLimit: integer("usage_limit"),
  usedCount: integer("used_count").default(0),
  targetUserType: text("target_user_type").default("all"), // all, new, vip, etc.
  gameRestrictions: json("game_restrictions"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// API Entegrasyonları tablosu
export const apiIntegrations = pgTable("api_integrations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  type: text("type").notNull(), // games, sms, email, payment, analytics
  category: text("category").notNull().default("integration"), // games, payment, communication, analytics, security, support, marketing
  apiKey: text("api_key"),
  secretKey: text("secret_key"),
  endpoint: text("endpoint"),
  version: text("version"),
  isActive: boolean("is_active").default(true),
  config: json("config"),
  lastSync: timestamp("last_sync"),
  lastError: text("last_error"),
  status: text("status").default("inactive"), // active, inactive, error, testing, maintenance
  errorCount: integer("error_count").default(0),
  successRate: decimal("success_rate", { precision: 5, scale: 2 }).default("0"),
  avgResponseTime: integer("avg_response_time").default(0), // milliseconds
  totalRequests: integer("total_requests").default(0),
  dailyLimit: integer("daily_limit").default(10000),
  usedToday: integer("used_today").default(0),
  webhookUrl: text("webhook_url"),
  retryCount: integer("retry_count").default(3),
  timeout: integer("timeout").default(30000), // milliseconds
  rateLimit: integer("rate_limit").default(100), // requests per minute
  description: text("description"),
  documentation: text("documentation"),
  supportContact: text("support_contact"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Entegrasyon Logları tablosu
export const integrationLogs = pgTable("integration_logs", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id").references(() => apiIntegrations.id),
  requestType: text("request_type").notNull(), // GET, POST, PUT, DELETE
  endpoint: text("endpoint").notNull(),
  requestData: json("request_data"),
  responseStatus: integer("response_status"),
  responseTime: integer("response_time"), // milliseconds
  responseData: json("response_data"),
  errorMessage: text("error_message"),
  success: boolean("success").notNull(),
  createdAt: timestamp("created_at").defaultNow()
});

// Entegrasyon İstatistikleri tablosu
export const integrationStats = pgTable("integration_stats", {
  id: serial("id").primaryKey(),
  integrationId: integer("integration_id").references(() => apiIntegrations.id),
  date: text("date").notNull(),
  totalRequests: integer("total_requests").default(0),
  successfulRequests: integer("successful_requests").default(0),
  failedRequests: integer("failed_requests").default(0),
  avgResponseTime: integer("avg_response_time").default(0),
  errorRate: decimal("error_rate", { precision: 5, scale: 2 }).default("0"),
  uptime: decimal("uptime", { precision: 5, scale: 2 }).default("100"), // percentage
  createdAt: timestamp("created_at").defaultNow()
});



// Sosyal Medya Bağlantıları tablosu
export const socialLinksTable = pgTable("social_links", {
  id: serial("id").primaryKey(),
  platform: text("platform").notNull(),
  url: text("url").notNull(),
  icon: text("icon"),
  isActive: boolean("is_active").default(true),
  sortOrder: integer("sort_order").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Güvenlik Ayarları V2 tablosu
export const securitySettingsV2 = pgTable("security_settings_v2", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  value: text("value").notNull(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Settings Types
// Type exports for admin settings tables
export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;
export type Currency = typeof currencies.$inferSelect;
export type InsertCurrency = typeof currencies.$inferInsert;
export type PaymentMethod = typeof paymentMethodsTable.$inferSelect;
export type InsertPaymentMethod = typeof paymentMethodsTable.$inferInsert;
export type BonusTemplate = typeof bonusTemplates.$inferSelect;
export type InsertBonusTemplate = typeof bonusTemplates.$inferInsert;
export type ApiIntegration = typeof apiIntegrations.$inferSelect;
export type InsertApiIntegration = typeof apiIntegrations.$inferInsert;
export type IntegrationLog = typeof integrationLogs.$inferSelect;
export type InsertIntegrationLog = typeof integrationLogs.$inferInsert;
export type IntegrationStat = typeof integrationStats.$inferSelect;
export type InsertIntegrationStat = typeof integrationStats.$inferInsert;

// Insert schemas for admin settings
export const insertSiteSettingSchema = createInsertSchema(siteSettings);
export const insertCurrencySchema = createInsertSchema(currencies);
export const insertPaymentMethodSchema = createInsertSchema(paymentMethodsTable);
export const insertBonusTemplateSchema = createInsertSchema(bonusTemplates);
export const insertApiIntegrationSchema = createInsertSchema(apiIntegrations);
export const insertIntegrationLogSchema = createInsertSchema(integrationLogs);
export const insertIntegrationStatSchema = createInsertSchema(integrationStats);

export const createInsertEmailTemplate = createInsertSchema(emailTemplates);
export type InsertEmailTemplate = z.infer<typeof createInsertEmailTemplate>;
export type SelectEmailTemplate = typeof emailTemplates.$inferSelect;

export const createInsertSocialLink = createInsertSchema(socialLinksTable);
export type InsertSocialLink = z.infer<typeof createInsertSocialLink>;
export type SelectSocialLink = typeof socialLinksTable.$inferSelect;

export const createInsertSecuritySetting = createInsertSchema(securitySettingsV2);
export type InsertSecuritySetting = z.infer<typeof createInsertSecuritySetting>;
export type SelectSecuritySetting = typeof securitySettingsV2.$inferSelect;

// Support Tables
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  ticketNumber: text("ticket_number").notNull().unique(),
  userId: integer("user_id").notNull(),
  title: text("title"),
  subject: text("subject").notNull(),
  description: text("description"),
  message: text("message").notNull(),
  category: text("category").notNull().default("general"),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("open"),
  assignedTo: integer("assigned_to"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at"),
  resolvedAt: timestamp("resolved_at"),
});

export const supportResponses = pgTable("support_responses", {
  id: serial("id").primaryKey(),
  ticketId: integer("ticket_id").notNull().references(() => supportTickets.id),
  userId: integer("user_id").notNull(),
  message: text("message").notNull(),
  isAdmin: boolean("is_admin").default(false),
  isInternal: boolean("is_internal").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Support Relations
export const supportTicketsRelations = relations(supportTickets, ({ one, many }) => ({
  user: one(users, {
    fields: [supportTickets.userId],
    references: [users.id],
  }),
  assignedUser: one(users, {
    fields: [supportTickets.assignedTo],
    references: [users.id],
  }),
  responses: many(supportResponses),
}));

export const supportResponsesRelations = relations(supportResponses, ({ one }) => ({
  ticket: one(supportTickets, {
    fields: [supportResponses.ticketId],
    references: [supportTickets.id],
  }),
  user: one(users, {
    fields: [supportResponses.userId],
    references: [users.id],
  }),
}));

// Support Types
export type SupportTicket = typeof supportTickets.$inferSelect;
export type InsertSupportTicket = typeof supportTickets.$inferInsert;
export type SupportResponse = typeof supportResponses.$inferSelect;
export type InsertSupportResponse = typeof supportResponses.$inferInsert;

// Support Schemas
export const insertSupportTicketSchema = createInsertSchema(supportTickets);
export const insertSupportResponseSchema = createInsertSchema(supportResponses);