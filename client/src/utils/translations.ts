// Comprehensive Translation System for CryptonBets
// Professional Turkish and English translations

export type Language = 'tr' | 'en';

export interface Translation {
  tr: string;
  en: string;
}

export interface Translations {
  [key: string]: Translation;
}

// Main translation dictionary
export const translations: Translations = {
  // Dashboard - Genel
  'dashboard.title': {
    tr: 'Yönetim Paneli',
    en: 'Admin Dashboard'
  },
  'dashboard.overview': {
    tr: 'Genel Bakış',
    en: 'Overview'
  },
  'dashboard.analytics': {
    tr: 'Analitik',
    en: 'Analytics'
  },
  'dashboard.users': {
    tr: 'Kullanıcılar',
    en: 'Users'
  },
  'dashboard.finance': {
    tr: 'Finansal',
    en: 'Finance'
  },
  'dashboard.refresh': {
    tr: 'Yenile',
    en: 'Refresh'
  },
  'dashboard.export': {
    tr: 'Dışa Aktar',
    en: 'Export'
  },
  'dashboard.loading': {
    tr: 'Yükleniyor...',
    en: 'Loading...'
  },
  'dashboard.lastUpdate': {
    tr: 'Son güncelleme:',
    en: 'Last update:'
  },

  // Statistics - İstatistikler
  'stats.totalUsers': {
    tr: 'Toplam Kullanıcı',
    en: 'Total Users'
  },
  'stats.activeUsers': {
    tr: 'Aktif Kullanıcı',
    en: 'Active Users'
  },
  'stats.newUsers': {
    tr: 'Yeni Kullanıcı',
    en: 'New Users'
  },
  'stats.totalRevenue': {
    tr: 'Toplam Gelir',
    en: 'Total Revenue'
  },
  'stats.totalDeposits': {
    tr: 'Toplam Yatırım',
    en: 'Total Deposits'
  },
  'stats.totalWithdrawals': {
    tr: 'Toplam Çekim',
    en: 'Total Withdrawals'
  },
  'stats.netProfit': {
    tr: 'Net Kâr',
    en: 'Net Profit'
  },
  'stats.pendingWithdrawals': {
    tr: 'Bekleyen Çekimler',
    en: 'Pending Withdrawals'
  },
  'stats.avgDeposit': {
    tr: 'Ortalama Yatırım',
    en: 'Average Deposit'
  },
  'stats.totalGames': {
    tr: 'Toplam Oyun',
    en: 'Total Games'
  },
  'stats.totalBets': {
    tr: 'Toplam Bahis',
    en: 'Total Bets'
  },
  'stats.avgBet': {
    tr: 'Ortalama Bahis',
    en: 'Average Bet'
  },
  'stats.mostPlayed': {
    tr: 'En Çok Oynanan',
    en: 'Most Played'
  },
  'stats.popularGames': {
    tr: 'Popüler Oyunlar',
    en: 'Popular Games'
  },
  'stats.recentTransactions': {
    tr: 'Son İşlemler',
    en: 'Recent Transactions'
  },
  'stats.userDistribution': {
    tr: 'Kullanıcı Dağılımı',
    en: 'User Distribution'
  },
  'stats.revenueAnalysis': {
    tr: 'Gelir Analizi',
    en: 'Revenue Analysis'
  },
  'stats.profit': {
    tr: 'Kar',
    en: 'Profit'
  },
  'stats.totalSettings': {
    tr: 'Toplam Ayar',
    en: 'Total Settings'
  },
  'stats.activeIntegrations': {
    tr: 'Aktif Entegrasyon',
    en: 'Active Integrations'
  },
  'stats.paymentMethods': {
    tr: 'Ödeme Yöntemi',
    en: 'Payment Methods'
  },
  'stats.currencies': {
    tr: 'Para Birimi',
    en: 'Currencies'
  },

  // User Status - Kullanıcı Durumu
  'user.active': {
    tr: 'Aktif',
    en: 'Active'
  },
  'user.inactive': {
    tr: 'Pasif',
    en: 'Inactive'
  },
  'user.suspended': {
    tr: 'Askıya Alınmış',
    en: 'Suspended'
  },
  'user.activeUsers': {
    tr: 'Aktif Kullanıcılar',
    en: 'Active Users'
  },
  'user.inactiveUsers': {
    tr: 'Pasif Kullanıcılar',
    en: 'Inactive Users'
  },
  'user.suspendedUsers': {
    tr: 'Askıya Alınmış',
    en: 'Suspended Users'
  },
  'user.underReview': {
    tr: 'İnceleniyor',
    en: 'Under Review'
  },
  'user.today': {
    tr: 'bugün',
    en: 'today'
  },
  'user.winRate': {
    tr: 'Kazanma Oranı',
    en: 'Win Rate'
  },

  // Game - Oyun
  'game.popularGames': {
    tr: 'Popüler Oyunlar',
    en: 'Popular Games'
  },
  'game.plays': {
    tr: 'oynama',
    en: 'plays'
  },

  // Transactions - İşlemler
  'transaction.deposit': {
    tr: 'Yatırım',
    en: 'Deposit'
  },
  'transaction.withdrawal': {
    tr: 'Çekim',
    en: 'Withdrawal'
  },
  'transaction.completed': {
    tr: 'Tamamlandı',
    en: 'Completed'
  },
  'transaction.pending': {
    tr: 'Bekliyor',
    en: 'Pending'
  },
  'transaction.failed': {
    tr: 'Başarısız',
    en: 'Failed'
  },
  'transaction.profitMargin': {
    tr: 'kar marjı',
    en: 'profit margin'
  },
  'transaction.deposits': {
    tr: 'Yatırımlar',
    en: 'Deposits'
  },
  'transaction.withdrawals': {
    tr: 'Çekimler',
    en: 'Withdrawals'
  },
  'transaction.recentTransactions': {
    tr: 'Son İşlemler',
    en: 'Recent Transactions'
  },

  // Navigation - Navigasyon
  'nav.home': {
    tr: 'ANASAYFA',
    en: 'HOME'
  },
  'nav.casino': {
    tr: 'CASINO',
    en: 'CASINO'
  },
  'nav.slot': {
    tr: 'SLOT',
    en: 'SLOT'
  },
  'nav.crypto': {
    tr: 'CRYPTO',
    en: 'CRYPTO'
  },
  'nav.profile': {
    tr: 'PROFİL',
    en: 'PROFILE'
  },
  'nav.vip': {
    tr: 'VIP',
    en: 'VIP'
  },
  'nav.bonuses': {
    tr: 'BONUSLAR',
    en: 'BONUSES'
  },
  'nav.games': {
    tr: 'OYUNLAR',
    en: 'GAMES'
  },

  // Admin Panel Navigation
  'admin.dashboard': {
    tr: 'Dashboard',
    en: 'Dashboard'
  },
  'admin.userManagement': {
    tr: 'Kullanıcı Yönetimi',
    en: 'User Management'
  },
  'admin.kycManagement': {
    tr: 'KYC Yönetimi',
    en: 'KYC Management'
  },
  'admin.transactionManagement': {
    tr: 'İşlem Yönetimi',
    en: 'Transaction Management'
  },
  'admin.contentManagement': {
    tr: 'İçerik Yönetimi',
    en: 'Content Management'
  },
  'admin.news': {
    tr: 'Haberler',
    en: 'News'
  },
  'admin.banners': {
    tr: 'Bannerlar',
    en: 'Banners'
  },
  'admin.bonuses': {
    tr: 'Bonuslar',
    en: 'Bonuses'
  },
  'admin.systemSettings': {
    tr: 'Sistem Ayarları',
    en: 'System Settings'
  },
  'admin.themes': {
    tr: 'Temalar',
    en: 'Themes'
  },
  'admin.integrations': {
    tr: 'Entegrasyonlar',
    en: 'Integrations'
  },
  'admin.communication': {
    tr: 'İletişim',
    en: 'Communication'
  },
  'admin.emailTemplates': {
    tr: 'E-posta Şablonları',
    en: 'Email Templates'
  },
  'admin.support': {
    tr: 'Destek',
    en: 'Support'
  },

  // Authentication - Kimlik Doğrulama
  'auth.login': {
    tr: 'GİRİŞ YAP',
    en: 'LOGIN'
  },
  'auth.register': {
    tr: 'KAYIT OL',
    en: 'REGISTER'
  },
  'auth.logout': {
    tr: 'ÇIKIŞ YAP',
    en: 'LOGOUT'
  },
  'auth.username': {
    tr: 'Kullanıcı Adı',
    en: 'Username'
  },
  'auth.password': {
    tr: 'Şifre',
    en: 'Password'
  },
  'auth.email': {
    tr: 'E-posta',
    en: 'Email'
  },
  'auth.phone': {
    tr: 'Telefon',
    en: 'Phone'
  },
  'auth.firstName': {
    tr: 'Ad',
    en: 'First Name'
  },
  'auth.lastName': {
    tr: 'Soyad',
    en: 'Last Name'
  },
  'auth.confirmPassword': {
    tr: 'Şifre Tekrar',
    en: 'Confirm Password'
  },
  'auth.processing': {
    tr: 'İŞLENİYOR...',
    en: 'PROCESSING...'
  },
  'auth.sessionError': {
    tr: 'Oturum Hatası',
    en: 'Session Error'
  },
  'auth.sessionExpired': {
    tr: 'Oturumunuz sona ermiş. Lütfen tekrar giriş yapın.',
    en: 'Your session has expired. Please log in again.'
  },

  // Games - Oyunlar
  'games.playNow': {
    tr: 'Şimdi Oyna',
    en: 'Play Now'
  },
  'games.demoMode': {
    tr: 'Demo Mod',
    en: 'Demo Mode'
  },
  'games.realMode': {
    tr: 'Gerçek Para',
    en: 'Real Money'
  },
  'games.provider': {
    tr: 'Sağlayıcı',
    en: 'Provider'
  },
  'games.category': {
    tr: 'Kategori',
    en: 'Category'
  },
  'games.loading': {
    tr: 'Oyunlar yükleniyor...',
    en: 'Loading games...'
  },
  'games.search': {
    tr: 'Oyun ara...',
    en: 'Search games...'
  },
  'games.noGamesFound': {
    tr: 'Oyun bulunamadı',
    en: 'No games found'
  },
  'games.allGames': {
    tr: 'Tüm Oyunlar',
    en: 'All Games'
  },
  'games.favorites': {
    tr: 'Favoriler',
    en: 'Favorites'
  },
  'games.recent': {
    tr: 'Son Oynanlar',
    en: 'Recently Played'
  },

  // Slots - Slot Oyunları
  'slots.title': {
    tr: 'Slot Oyunları',
    en: 'Slot Games'
  },
  'slots.jackpot': {
    tr: 'Jackpot',
    en: 'Jackpot'
  },
  'slots.megaways': {
    tr: 'Megaways',
    en: 'Megaways'
  },
  'slots.bonusBuy': {
    tr: 'Bonus Satın Al',
    en: 'Bonus Buy'
  },
  'slots.classic': {
    tr: 'Klasik',
    en: 'Classic'
  },
  'slots.new': {
    tr: 'Yeni',
    en: 'New'
  },

  // Casino - Casino Oyunları
  'casino.title': {
    tr: 'Casino Oyunları',
    en: 'Casino Games'
  },
  'casino.live': {
    tr: 'Canlı Casino',
    en: 'Live Casino'
  },
  'casino.blackjack': {
    tr: 'Blackjack',
    en: 'Blackjack'
  },
  'casino.roulette': {
    tr: 'Rulet',
    en: 'Roulette'
  },
  'casino.baccarat': {
    tr: 'Bakara',
    en: 'Baccarat'
  },
  'casino.poker': {
    tr: 'Poker',
    en: 'Poker'
  },

  // Payments - Ödemeler
  'payment.deposit': {
    tr: 'Para Yatır',
    en: 'Deposit'
  },
  'payment.withdraw': {
    tr: 'Para Çek',
    en: 'Withdraw'
  },
  'payment.amount': {
    tr: 'Miktar',
    en: 'Amount'
  },
  'payment.method': {
    tr: 'Yöntem',
    en: 'Method'
  },
  'payment.bankTransfer': {
    tr: 'Banka Havalesi',
    en: 'Bank Transfer'
  },
  'payment.creditCard': {
    tr: 'Kredi Kartı',
    en: 'Credit Card'
  },
  'payment.crypto': {
    tr: 'Kripto Para',
    en: 'Cryptocurrency'
  },
  'payment.processing': {
    tr: 'İşleniyor',
    en: 'Processing'
  },
  'payment.success': {
    tr: 'Başarılı',
    en: 'Successful'
  },
  'payment.failed': {
    tr: 'Başarısız',
    en: 'Failed'
  },

  // Bonuses - Bonuslar
  'bonus.welcome': {
    tr: 'Hoş Geldin Bonusu',
    en: 'Welcome Bonus'
  },
  'bonus.deposit': {
    tr: 'Yatırım Bonusu',
    en: 'Deposit Bonus'
  },
  'bonus.noDeposit': {
    tr: 'Yatırımsız Bonus',
    en: 'No Deposit Bonus'
  },
  'bonus.freeSpin': {
    tr: 'Bedava Çevirme',
    en: 'Free Spins'
  },
  'bonus.cashback': {
    tr: 'Geri Ödeme',
    en: 'Cashback'
  },
  'bonus.claim': {
    tr: 'Bonusu Al',
    en: 'Claim Bonus'
  },
  'bonus.terms': {
    tr: 'Bonus Şartları',
    en: 'Bonus Terms'
  },
  'bonus.wagering': {
    tr: 'Çevrim Şartı',
    en: 'Wagering Requirement'
  },

  // VIP - VIP Program
  'vip.program': {
    tr: 'VIP Program',
    en: 'VIP Program'
  },
  'vip.level': {
    tr: 'VIP Seviye',
    en: 'VIP Level'
  },
  'vip.benefits': {
    tr: 'VIP Ayrıcalıkları',
    en: 'VIP Benefits'
  },
  'vip.requirements': {
    tr: 'Gereksinimler',
    en: 'Requirements'
  },
  'vip.bronze': {
    tr: 'Bronz',
    en: 'Bronze'
  },
  'vip.silver': {
    tr: 'Gümüş',
    en: 'Silver'
  },
  'vip.gold': {
    tr: 'Altın',
    en: 'Gold'
  },
  'vip.platinum': {
    tr: 'Platin',
    en: 'Platinum'
  },
  'vip.diamond': {
    tr: 'Elmas',
    en: 'Diamond'
  },

  // Profile - Profil
  'profile.personalInfo': {
    tr: 'Kişisel Bilgiler',
    en: 'Personal Information'
  },
  'profile.accountSettings': {
    tr: 'Hesap Ayarları',
    en: 'Account Settings'
  },
  'profile.verification': {
    tr: 'Doğrulama',
    en: 'Verification'
  },
  'profile.transactionHistory': {
    tr: 'İşlem Geçmişi',
    en: 'Transaction History'
  },
  'profile.gameHistory': {
    tr: 'Oyun Geçmişi',
    en: 'Game History'
  },
  'profile.balance': {
    tr: 'Bakiye',
    en: 'Balance'
  },
  'profile.totalDeposit': {
    tr: 'Toplam Yatırım',
    en: 'Total Deposit'
  },
  'profile.totalWithdrawal': {
    tr: 'Toplam Çekim',
    en: 'Total Withdrawal'
  },
  'profile.memberSince': {
    tr: 'Üyelik Tarihi',
    en: 'Member Since'
  },

  // General Actions - Genel Eylemler
  'action.save': {
    tr: 'Kaydet',
    en: 'Save'
  },
  'action.cancel': {
    tr: 'İptal',
    en: 'Cancel'
  },
  'action.edit': {
    tr: 'Düzenle',
    en: 'Edit'
  },
  'action.delete': {
    tr: 'Sil',
    en: 'Delete'
  },
  'action.create': {
    tr: 'Oluştur',
    en: 'Create'
  },
  'action.update': {
    tr: 'Güncelle',
    en: 'Update'
  },
  'action.view': {
    tr: 'Görüntüle',
    en: 'View'
  },
  'action.search': {
    tr: 'Ara',
    en: 'Search'
  },
  'action.filter': {
    tr: 'Filtrele',
    en: 'Filter'
  },
  'action.sort': {
    tr: 'Sırala',
    en: 'Sort'
  },
  'action.close': {
    tr: 'Kapat',
    en: 'Close'
  },
  'action.submit': {
    tr: 'Gönder',
    en: 'Submit'
  },
  'action.confirm': {
    tr: 'Onayla',
    en: 'Confirm'
  },

  // Status Messages - Durum Mesajları
  'status.success': {
    tr: 'Başarılı',
    en: 'Success'
  },
  'status.error': {
    tr: 'Hata',
    en: 'Error'
  },
  'status.warning': {
    tr: 'Uyarı',
    en: 'Warning'
  },
  'status.info': {
    tr: 'Bilgi',
    en: 'Info'
  },
  'status.loading': {
    tr: 'Yükleniyor...',
    en: 'Loading...'
  },
  'status.processing': {
    tr: 'İşleniyor...',
    en: 'Processing...'
  },
  'status.completed': {
    tr: 'Tamamlandı',
    en: 'Completed'
  },
  'status.pending': {
    tr: 'Bekliyor',
    en: 'Pending'
  },
  'status.approved': {
    tr: 'Onaylandı',
    en: 'Approved'
  },
  'status.rejected': {
    tr: 'Reddedildi',
    en: 'Rejected'
  },

  // Time Periods - Zaman Dilimleri
  'time.today': {
    tr: 'Bugün',
    en: 'Today'
  },
  'time.yesterday': {
    tr: 'Dün',
    en: 'Yesterday'
  },
  'time.thisWeek': {
    tr: 'Bu Hafta',
    en: 'This Week'
  },
  'time.lastWeek': {
    tr: 'Geçen Hafta',
    en: 'Last Week'
  },
  'time.thisMonth': {
    tr: 'Bu Ay',
    en: 'This Month'
  },
  'time.lastMonth': {
    tr: 'Geçen Ay',
    en: 'Last Month'
  },
  'time.thisYear': {
    tr: 'Bu Yıl',
    en: 'This Year'
  },
  'time.lastYear': {
    tr: 'Geçen Yıl',
    en: 'Last Year'
  },

  // Error Messages - Hata Mesajları
  'error.genericError': {
    tr: 'Bir hata oluştu. Lütfen tekrar deneyin.',
    en: 'An error occurred. Please try again.'
  },
  'error.networkError': {
    tr: 'Bağlantı hatası. İnternet bağlantınızı kontrol edin.',
    en: 'Network error. Please check your internet connection.'
  },
  'error.unauthorized': {
    tr: 'Bu işlem için yetkiniz bulunmuyor.',
    en: 'You are not authorized for this action.'
  },
  'error.notFound': {
    tr: 'Aradığınız sayfa bulunamadı.',
    en: 'The page you are looking for was not found.'
  },
  'error.serverError': {
    tr: 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.',
    en: 'Server error. Please try again later.'
  },
  'error.validationError': {
    tr: 'Lütfen gerekli alanları doğru şekilde doldurun.',
    en: 'Please fill in the required fields correctly.'
  },

  // Notifications - Bildirimler
  'notification.newMessage': {
    tr: 'Yeni mesajınız var',
    en: 'You have a new message'
  },
  'notification.bonusAdded': {
    tr: 'Hesabınıza bonus eklendi',
    en: 'Bonus added to your account'
  },
  'notification.withdrawalProcessed': {
    tr: 'Para çekme işleminiz gerçekleştirildi',
    en: 'Your withdrawal has been processed'
  },
  'notification.depositReceived': {
    tr: 'Para yatırma işleminiz alındı',
    en: 'Your deposit has been received'
  },

  // Footer - Alt Bilgi
  'footer.aboutUs': {
    tr: 'Hakkımızda',
    en: 'About Us'
  },
  'footer.contact': {
    tr: 'İletişim',
    en: 'Contact'
  },
  'footer.terms': {
    tr: 'Kullanım Şartları',
    en: 'Terms of Service'
  },
  'footer.privacy': {
    tr: 'Gizlilik Politikası',
    en: 'Privacy Policy'
  },
  'footer.responsible': {
    tr: 'Sorumlu Oyun',
    en: 'Responsible Gaming'
  },
  'footer.support': {
    tr: 'Destek',
    en: 'Support'
  },
  'footer.copyright': {
    tr: 'Tüm hakları saklıdır',
    en: 'All rights reserved'
  }
};

// Translation helper function
export const t = (key: string, language: Language = 'tr'): string => {
  const translation = translations[key];
  if (!translation) {
    console.warn(`Translation not found for key: ${key}`);
    return key;
  }
  return translation[language] || translation.tr || key;
};

// Get current language from context or localStorage
export const getCurrentLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'tr';
  }
  return 'tr';
};

// Set language
export const setLanguage = (language: Language): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('language', language);
  }
};

export default translations;