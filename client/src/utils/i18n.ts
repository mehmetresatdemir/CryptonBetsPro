export type Language = 'tr' | 'en' | 'ka';
export type Locale = Language;

// Çeviri tipleri
export type Translation = {
  [locale in Language]: string;
};

export type Translations = {
  [key: string]: Translation;
};

// Mobil menü çevirileri
export const navigationTranslations: Translations = {
  "nav.home": {
    tr: "ANASAYFA",
    en: "HOME",
    ka: "მთავარი"
  },
  "nav.casino": {
    tr: "CASINO",
    en: "CASINO",
    ka: "კაზინო"
  },
  "nav.slot": {
    tr: "SLOT",
    en: "SLOT",
    ka: "სლოტი",
  },
  "nav.crypto": {
    tr: "CRYPTO",
    en: "CRYPTO",
    ka: "კრიპტო",
  },
  "nav.profile": {
    tr: "PROFİL",
    en: "PROFILE",
    ka: "პროფილი",
  },
  "nav.logout": {
    tr: "ÇIKIŞ YAP",
    en: "LOGOUT",
    ka: "გასვლა",
  }
};

// Uygulama genelinde kullanılacak çeviriler
// Profile translations
import { profileCleanTranslations } from './translations/profileClean';

// Tüm diller için temiz çeviri nesnesi
export const translations: Translations = {
  ...profileCleanTranslations,
  
  // Ek çeviriler - profileCleanTranslations dışında kalanlar
  "app.bet.won": {
    tr: "Kazandı",
    en: "Won",
    ka: "მოიგო",
  },
  "app.bet.lost": {
    tr: "Kaybetti",
    en: "Lost",
    ka: "წააგო",
  },
  // Auth işlemleri
  "auth.processing": {
    tr: "İŞLENİYOR...",
    en: "PROCESSING...",
    ka: "დამუშავება...",
  },
  
  // Slider Çevirileri
  "slider.slot_bonus": {
    tr: "SLOT BONUSU",
    en: "SLOT BONUS",
    ka: "სლოტის ბონუსი",
  },
  "slider.slot_description": {
    tr: "Tüm slot oyunlarında %50 ekstra bonus",
    en: "50% extra bonus on all slot games",
    ka: "50% დამატებითი ბონუსი ყველა სლოტ თამაშზე",
  },
  "slider.saturday_slot_bonus": {
    tr: "CUMARTESİ SLOT BONUSU",
    en: "SATURDAY SLOT BONUS",
    ka: "შაბათის სლოტ ბონუსი",
  },
  "slider.saturday_slot_description": {
    tr: "Her cumartesi slot bonusu %100 olarak",
    en: "Every Saturday slot bonus as 100%",
    ka: "ყოველ შაბათს სლოტ ბონუსი 100%",
  },
  "slider.trial_bonus": {
    tr: "DENEME BONUSU",
    en: "TRIAL BONUS",
    ka: "საცდელი ბონუსი",
  },
  "slider.trial_bonus_description": {
    tr: "Yeni üyelere özel 200 TL deneme bonusu",
    en: "200 TL trial bonus for new members",
    ka: "200 TL საცდელი ბონუსი ახალი წევრებისთვის",
  },
  "slider.loyalty_bonus": {
    tr: "SADAKAT BONUSU",
    en: "LOYALTY BONUS",
    ka: "ლოიალურობის ბონუსი",
  },
  "slider.loyalty_bonus_description": {
    tr: "Düzenli üyeler için aylık %15 sadakat bonusu",
    en: "Monthly 15% loyalty bonus for regular members",
    ka: "ყოველთვიური 15% ლოიალურობის ბონუსი რეგულარული წევრებისთვის",
  },
  
  // Profil ana metinler ve etiketler
  "profile.active_member": {
    tr: "Aktif Üye",
    en: "Active Member",
    ka: "აქტიური წევრი",
  },
  "profile.total_bets": {
    tr: "Toplam Bahis",
    en: "Total Bets",
    ka: "სულ ფსონები",
  },
  "profile.total_wins": {
    tr: "Toplam Kazanç",
    en: "Total Wins",
    ka: "სულ მოგებები",
  },
  "profile.username_cannot_change": {
    tr: "Kullanıcı adı değiştirilemez",
    en: "Username cannot be changed",
    ka: "მომხმარებლის სახელის შეცვლა შეუძლებელია",
  },
  "profile.update_info": {
    tr: "Bilgileri Güncelle",
    en: "Update Information",
    ka: "ინფორმაციის განახლება",
  },
  
  // Profil giriş uyarıları
  "profile.login_required": {
    tr: "Giriş Yapmanız Gerekiyor",
    en: "Login Required",
    ka: "შესვლა აუცილებელია",
  },
  "profile.bets_tab": {
    tr: "Bahisler",
    en: "Bets",
    ka: "ფსონები",
  },
  "profile.transactions": {
    tr: "İşlemler",
    en: "Transactions",
    ka: "ტრანზაქციები",
  },
  "profile.bonuses": {
    tr: "Bonuslar",
    en: "Bonuses",
    ka: "ბონუსები",
  },
  "profile.settings": {
    tr: "Ayarlar",
    en: "Settings",
    ka: "პარამეტრები",
  },
  "profile.info": {
    tr: "Bilgiler",
    en: "Info",
    ka: "ინფორმაცია",
  },
  "profile.all_dates": {
    tr: "Tüm Tarihler",
    en: "All Dates",
    ka: "ყველა თარიღი",
  },
  "profile.today": {
    tr: "Bugün",
    en: "Today",
    ka: "დღეს",
  },
  "profile.this_week": {
    tr: "Bu Hafta",
    en: "This Week",
    ka: "ამ კვირაში",
  },
  "profile.this_month": {
    tr: "Bu Ay",
    en: "This Month",
    ka: "ამ თვეში",
  },
  "profile.slot_games": {
    tr: "Slot Oyunları",
    en: "Slot Games",
    ka: "სლოტის თამაშები",
  },
  "profile.casino_games": {
    tr: "Casino Oyunları",
    en: "Casino Games",
    ka: "კაზინოს თამაშები",
  },
  "profile.bet": {
    tr: "Bahis",
    en: "Bet",
    ka: "ფსონი",
  },
  "profile.profit": {
    tr: "Kazanç",
    en: "Profit",
    ka: "მოგება",
  },
  "profile.show_more": {
    tr: "Daha Fazla Göster",
    en: "Show More",
    ka: "მეტის ჩვენება",
  },
  "bet.date": {
    tr: "Tarih",
    en: "Date",
    ka: "თარიღი",
  },
  "bet.game": {
    tr: "Oyun",
    en: "Game",
    ka: "თამაში",
  },
  "bet.amount": {
    tr: "Miktar",
    en: "Amount",
    ka: "რაოდენობა",
  },
  "bet.winnings": {
    tr: "Kazanç",
    en: "Winnings",
    ka: "მოგება",
  },
  "bet.status": {
    tr: "Durum",
    en: "Status",
    ka: "სტატუსი",
  },
  "profile.total_deposit": {
    tr: "Toplam Yatırım",
    en: "Total Deposit",
    ka: "სულ შენატანი",
  },
  "profile.member_since": {
    tr: "Üyelik tarihi",
    en: "Member since",
    ka: "წევრია",
  },
  "profile.full_name": {
    tr: "Ad Soyad",
    en: "Full Name",
    ka: "სრული სახელი",
  },
  "profile.email": {
    tr: "E-posta",
    en: "Email",
    ka: "ელ-ფოსტა",
  },
  "profile.phone": {
    tr: "Telefon",
    en: "Phone",
    ka: "ტელეფონი",
  },
  "profile.personal_info": {
    tr: "Kişisel Bilgiler",
    en: "Personal Information",
    ka: "პირადი ინფორმაცია",
  },
  "profile.total_withdrawal": {
    tr: "Toplam Çekim",
    en: "Total Withdrawal",
    ka: "სულ გატანა",
  },
  "profile.bonus_earnings": {
    tr: "Bonus Kazançları",
    en: "Bonus Earnings",
    ka: "ბონუს შემოსავლები",
  },
  "profile.login_message": {
    tr: "Profil sayfasını görüntülemek için lütfen giriş yapın.",
    en: "Please log in to view the profile page.",
    ka: "პროფილის გვერდის სანახავად გთხოვთ შეხვიდეთ.",
  },
  "profile.return_home": {
    tr: "Ana Sayfaya Dön",
    en: "Return to Home Page",
    ka: "მთავარ გვერდზე დაბრუნება",
  },
  // Jackpot Çevirileri
  "jackpot.title": {
    tr: "JACKPOT",
    en: "JACKPOT",
    ka: "ჯეკპოტი",
  },
  "jackpot.current_value": {
    tr: "Mevcut Değer",
    en: "Current Value",
    ka: "მიმდინარე ღირებულება",
  },
  "jackpot.live": {
    tr: "CANLI",
    en: "LIVE",
    ka: "ლაივი",
  },
  "jackpot.leaderboard": {
    tr: "Liderlik Tablosu",
    en: "Leaderboard",
    ka: "ლიდერბორდი",
  },
  "jackpot.recent_winners": {
    tr: "Son Kazananlar",
    en: "Recent Winners",
    ka: "ბოლო გამარჯვებულები",
  },
  "jackpot.biggest_win": {
    tr: "En Büyük Kazanç",
    en: "Biggest Win",
    ka: "ყველაზე დიდი მოგება",
  },
  "jackpot.play_now": {
    tr: "Şimdi Oyna",
    en: "Play Now",
    ka: "ახლა ითამაშე",
  },
  // Game Provider Çevirileri
  "provider.evolution": {
    tr: "Evolution Gaming",
    en: "Evolution Gaming",
    ka: "Evolution Gaming",
  },
  "provider.pragmatic": {
    tr: "Pragmatic Play",
    en: "Pragmatic Play",
    ka: "Pragmatic Play",
  },
  "provider.netent": {
    tr: "NetEnt",
    en: "NetEnt",
    ka: "NetEnt",
  },
  "provider.microgaming": {
    tr: "Microgaming",
    en: "Microgaming",
    ka: "Microgaming",
  },
  "provider.playtech": {
    tr: "Playtech",
    en: "Playtech",
    ka: "Playtech",
  },
  "provider.yggdrasil": {
    tr: "Yggdrasil",
    en: "Yggdrasil",
    ka: "Yggdrasil",
  },
  "provider.quickspin": {
    tr: "Quickspin",
    en: "Quickspin",
    ka: "Quickspin",
  },
  "provider.nolimit": {
    tr: "Nolimit City",
    en: "Nolimit City",
    ka: "Nolimit City",
  },
  // Game Category Çevirileri
  "category.slots": {
    tr: "Slot Oyunları",
    en: "Slot Games",
    ka: "სლოტ თამაშები",
  },
  "category.live_casino": {
    tr: "Canlı Casino",
    en: "Live Casino",
    ka: "ლაივ კაზინო",
  },
  "category.table_games": {
    tr: "Masa Oyunları",
    en: "Table Games",
    ka: "მაგიდის თამაშები",
  },
  "category.blackjack": {
    tr: "Blackjack",
    en: "Blackjack",
    ka: "ბლეკჯეკი",
  },
  "category.roulette": {
    tr: "Rulet",
    en: "Roulette",
    ka: "რულეტი",
  },
  "category.baccarat": {
    tr: "Bakara",
    en: "Baccarat",
    ka: "ბაკარა",
  },
  "category.poker": {
    tr: "Poker",
    en: "Poker",
    ka: "პოკერი",
  },
  // Error Messages Çevirileri
  "error.generic": {
    tr: "Bir hata oluştu. Lütfen tekrar deneyiniz.",
    en: "An error occurred. Please try again.",
    ka: "მოხდა შეცდომა. გთხოვთ კიდევ სცადოთ.",
  },
  "error.network": {
    tr: "Bağlantı hatası. İnternet bağlantınızı kontrol ediniz.",
    en: "Connection error. Please check your internet connection.",
    ka: "კავშირის შეცდომა. გთხოვთ შეამოწმოთ ინტერნეტ კავშირი.",
  },
  "error.loading_game": {
    tr: "Oyun yüklenirken hata oluştu.",
    en: "Error loading game.",
    ka: "თამაშის ჩატვირთვისას მოხდა შეცდომა.",
  },
  "error.unauthorized": {
    tr: "Bu işlem için giriş yapmanız gerekiyor.",
    en: "You need to log in for this action.",
    ka: "ამ მოქმედებისთვის საჭიროა ავტორიზაცია.",
  },
  // Success Messages Çevirileri
  "success.game_loaded": {
    tr: "Oyun başarıyla yüklendi.",
    en: "Game loaded successfully.",
    ka: "თამაში წარმატებით ჩაიტვირთა.",
  },
  "success.favorite_added": {
    tr: "Oyun favorilere eklendi.",
    en: "Game added to favorites.",
    ka: "თამაში დაემატა ფავორიტებში.",
  },
  "success.favorite_removed": {
    tr: "Oyun favorilerden çıkarıldı.",
    en: "Game removed from favorites.",
    ka: "თამაში ამოიშალა ფავორიტებიდან.",
  },
  // Header ve Navigation Çevirileri
  "header.welcome": {
    tr: "Hoşgeldiniz",
    en: "Welcome",
    ka: "მიესალმებით",
  },
  "header.login": {
    tr: "Giriş Yap",
    en: "Login",
    ka: "შესვლა",
  },
  "header.register": {
    tr: "Üye Ol",
    en: "Register",
    ka: "რეგისტრაცია",
  },
  "header.deposit": {
    tr: "Para Yatır",
    en: "Deposit",
    ka: "შენატანი",
  },
  "header.balance": {
    tr: "Bakiye",
    en: "Balance",
    ka: "ბალანსი",
  },
  "header.profile": {
    tr: "Profil",
    en: "Profile",
    ka: "პროფილი",
  },
  "header.settings": {
    tr: "Ayarlar",
    en: "Settings",
    ka: "პარამეტრები",
  },
  "header.support": {
    tr: "Destek",
    en: "Support",
    ka: "მხარდაჭერა",
  },
  "header.vip": {
    tr: "VIP",
    en: "VIP",
    ka: "VIP",
  },
  "header.bonuses": {
    tr: "Bonuslar",
    en: "Bonuses",
    ka: "ბონუსები",
  },
  "header.promotions": {
    tr: "Promosyonlar",
    en: "Promotions",
    ka: "აქციები",
  },
  "header.tournaments": {
    tr: "Turnuvalar",
    en: "Tournaments",
    ka: "ტურნირები",
  },
  "header.responsible_gaming": {
    tr: "Sorumlu Oyun",
    en: "Responsible Gaming",
    ka: "პასუხისმგებლიანი თამაში",
  },
  "header.help": {
    tr: "Yardım",
    en: "Help",
    ka: "დახმარება",
  },
  "header.live_chat": {
    tr: "Canlı Destek",
    en: "Live Chat",
    ka: "ლაივ ჩატი",
  },
  "header.language": {
    tr: "Dil",
    en: "Language",
    ka: "ენა",
  },
  // Footer Çevirileri
  "footer.about_us": {
    tr: "Hakkımızda",
    en: "About Us",
    ka: "ჩვენ შესახებ",
  },
  "footer.contact": {
    tr: "İletişim",
    en: "Contact",
    ka: "კონტაქტი",
  },
  "footer.terms": {
    tr: "Kullanım Şartları",
    en: "Terms of Service",
    ka: "მომსახურების პირობები",
  },
  "footer.privacy": {
    tr: "Gizlilik Politikası",
    en: "Privacy Policy",
    ka: "კონფიდენციალურობის პოლიტიკა",
  },
  "footer.license": {
    tr: "Lisans",
    en: "License",
    ka: "ლიცენზია",
  },
  "footer.copyright": {
    tr: "© 2025 CryptonBets. Tüm hakları saklıdır.",
    en: "© 2025 CryptonBets. All rights reserved.",
    ka: "© 2025 CryptonBets. ყველა უფლება დაცულია.",
  },
  "footer.responsible_gaming": {
    tr: "18+ Sorumlu Oyun",
    en: "18+ Responsible Gaming",
    ka: "18+ პასუხისმგებლიანი თამაში",
  },
  "footer.secure_gaming": {
    tr: "Güvenli Oyun Ortamı",
    en: "Secure Gaming Environment",
    ka: "უსაფრთხო თამაშის გარემო",
  },
  // Ödeme Adımları ve Güvenlik
  "payment.steps": {
    tr: "Adımlar",
    en: "Steps",
    ka: "ნაბიჯები",
  },
  "payment.security_notice": {
    tr: "Güvenlik Bildirimi",
    en: "Security Notice",
    ka: "უსაფრთხოების შეტყობინება",
  },
  "payment.security_message": {
    tr: "Tüm işlemleriniz güvenli ve şifrelidir",
    en: "All your transactions are secure and encrypted",
    ka: "თქვენი ყველა ტრანზაქცია უსაფრთხო და დაშიფრულია",
  },
  
  // Profil Alanı Çevirileri
  "profile.basic_info": {
    tr: "Temel Bilgiler",
    en: "Basic Information",
    ka: "ძირითადი ინფორმაცია",
  },
  "profile.account_settings": {
    tr: "Hesap Ayarları",
    en: "Account Settings",
    ka: "ანგარიშის პარამეტრები",
  },
  "profile.quick_settings": {
    tr: "Hızlı Ayarlar",
    en: "Quick Settings",
    ka: "სწრაფი პარამეტრები",
  },
  "profile.password": {
    tr: "Şifre",
    en: "Password",
    ka: "პაროლი",
  },
  "profile.notifications": {
    tr: "Bildirimler",
    en: "Notifications",
    ka: "შეტყობინებები",
  },
  "profile.security": {
    tr: "Güvenlik",
    en: "Security",
    ka: "უსაფრთხოება",
  },
  "profile.edit_profile": {
    tr: "Profili Düzenle",
    en: "Edit Profile",
    ka: "პროფილის რედაქტირება",
  },
  "profile.change_password": {
    tr: "Şifre Değiştir",
    en: "Change Password",
    ka: "პაროლის შეცვლა",
  },
  "profile.last_changed": {
    tr: "Son değişim",
    en: "Last changed",
    ka: "ბოლოს შეცვლილია",
  },
  "profile.current_password": {
    tr: "Mevcut Şifre",
    en: "Current Password",
    ka: "მიმდინარე პაროლი",
  },
  "profile.new_password": {
    tr: "Yeni Şifre",
    en: "New Password",
    ka: "ახალი პაროლი",
  },
  "profile.confirm_password": {
    tr: "Yeni Şifre Tekrar",
    en: "Confirm Password",
    ka: "პაროლის დადასტურება",
  },

  "profile.password_strong": {
    tr: "Güçlü",
    en: "Strong",
    ka: "ძლიერი",
  },
  "profile.password_medium": {
    tr: "Orta",
    en: "Medium",
    ka: "საშუალო",
  },
  "profile.password_weak": {
    tr: "Zayıf",
    en: "Weak",
    ka: "სუსტი",
  },
  "profile.update_password": {
    tr: "Şifreyi Güncelle",
    en: "Update Password",
    ka: "პაროლის განახლება",
  },
  "profile.language_settings": {
    tr: "Dil Ayarları",
    en: "Language Settings",
    ka: "ენის პარამეტრები",
  },
  "profile.selected": {
    tr: "Seçili",
    en: "Selected",
    ka: "არჩეული",
  },
  "profile.notification_settings": {
    tr: "Bildirim Ayarları",
    en: "Notification Settings",
    ka: "შეტყობინების პარამეტრები",
  },
  "profile.mail_notifications": {
    tr: "E-posta Bildirimleri",
    en: "Email Notifications",
    ka: "ელფოსტის შეტყობინებები",
  },
  "profile.sms_notifications": {
    tr: "SMS Bildirimleri",
    en: "SMS Notifications",
    ka: "SMS შეტყობინებები",
  },
  "profile.push_notifications": {
    tr: "Özel Teklif Bildirimleri",
    en: "Special Offer Notifications",
    ka: "სპეციალური შეთავაზების შეტყობინებები",
  },
  "profile.whatsapp_notifications": {
    tr: "WhatsApp Bildirimleri",
    en: "WhatsApp Notifications",
    ka: "WhatsApp შეტყობინებები",
  },
  "profile.security_settings": {
    tr: "Güvenlik Ayarları",
    en: "Security Settings",
    ka: "უსაფრთხოების პარამეტრები",
  },
  "profile.activate": {
    tr: "Aktifleştir",
    en: "Activate",
    ka: "აქტივაცია",
  },
  "profile.verified": {
    tr: "Doğrulandı",
    en: "Verified",
    ka: "დადასტურებულია",
  },
  "profile.view": {
    tr: "Görüntüle",
    en: "View",
    ka: "ნახვა",
  },
  "profile.email_verification": {
    tr: "E-posta Doğrulaması",
    en: "Email Verification",
    ka: "ელფოსტის დადასტურება",
  },
  "profile.device_management": {
    tr: "Cihaz Yönetimi",
    en: "Device Management",
    ka: "მოწყობილობების მართვა",
  },
  "profile.session_settings": {
    tr: "Oturum Ayarları",
    en: "Session Settings",
    ka: "სეანსის პარამეტრები",
  },
  "profile.last_login": {
    tr: "Son Giriş Tarihi",
    en: "Last Login Date",
    ka: "ბოლო შესვლის თარიღი",
  },
  "profile.location": {
    tr: "Konum",
    en: "Location",
    ka: "მდებარეობა",
  },
  "profile.logout_all": {
    tr: "Tüm Cihazlardan Çıkış Yap",
    en: "Logout from All Devices",
    ka: "ყველა მოწყობილობიდან გამოსვლა",
  },
  "profile.logout_this": {
    tr: "Bu Cihazdan Çıkış Yap",
    en: "Logout from This Device",
    ka: "ამ მოწყობილობიდან გამოსვლა",
  },
  
  // Profil Sekmeleri
  "tabs.profile.info": {
    tr: "Profil",
    en: "Profile",
    ka: "პროფილი",
  },
  "tabs.profile.bets": {
    tr: "Bahisler",
    en: "Bets",
    ka: "ფსონები",
  },
  "tabs.profile.transactions": {
    tr: "İşlemler",
    en: "Transactions",
    ka: "ტრანზაქციები",
  }, 
  "tabs.profile.bonuses": {
    tr: "Bonuslar",
    en: "Bonuses",
    ka: "ბონუსები",
  },
  "tabs.profile.settings": {
    tr: "Ayarlar",
    en: "Settings",
    ka: "პარამეტრები",
  },
  
// Bahis Dağılımı ve İstatistikler
  "profile.bet_distribution": {
    tr: "Bahis Dağılımı",
    en: "Bet Distribution",
    ka: "ფსონების განაწილება",
  },
  "profile.most_played_games": {
    tr: "En Çok Oynanan Oyunlar",
    en: "Most Played Games",
    ka: "ყველაზე თამაშებული თამაშები",
  },
  "profile.of_bets": {
    tr: "bahislerinizden",
    en: "of your bets",
    ka: "თქვენი ფსონებიდან",
  },
  "profile.recent_bets": {
    tr: "Son Bahisler",
    en: "Recent Bets",
    ka: "ბოლო ფსონები",
  },
  "profile.completed": {
    tr: "Tamamlandı",
    en: "Completed",
    ka: "დასრულებულია",
  },
  "profile.active_bonuses": {
    tr: "Aktif Bonuslar",
    en: "Active Bonuses",
    ka: "აქტიური ბონუსები",
  },
  "profile.available_bonuses": {
    tr: "Kullanılabilir Bonuslar",
    en: "Available Bonuses",
    ka: "ხელმისაწვდომი ბონუსები",
  },
  "profile.finance_desc": {
    tr: "Finansal işlemlerinizi görüntüleyin ve yönetin",
    en: "View and manage your financial transactions",
    ka: "ნახეთ და მართეთ თქვენი ფინანსური ტრანზაქციები",
  },
  "profile.transaction_history": {
    tr: "İşlem Geçmişi",
    en: "Transaction History",
    ka: "ტრანზაქციების ისტორია",
  },
  "profile.withdraw": {
    tr: "Para Çek",
    en: "Withdraw",
    ka: "გატანა",
  },
  "profile.withdraw_now": {
    tr: "Şimdi Para Çek",
    en: "Withdraw Now",
    ka: "ახლავე გაიტანეთ",
  },
  "profile.withdraw_desc": {
    tr: "Kazançlarınızı güvenli bir şekilde çekin",
    en: "Withdraw your winnings securely",
    ka: "გაიტანეთ თქვენი მოგება უსაფრთხოდ",
  },
  "profile.bonus_desc": {
    tr: "Mevcut bonuslarınızı görüntüleyin ve yönetin",
    en: "View and manage your current bonuses",
    ka: "ნახეთ და მართეთ თქვენი მიმდინარე ბონუსები",
  },
  "profile.daily_cashback": {
    tr: "Günlük Nakit İadesi",
    en: "Daily Cashback",
    ka: "ყოველდღიური ქეშბექი",
  },
  "profile.daily_cashback_desc": {
    tr: "Günlük kayıplarınızın bir kısmını geri alın",
    en: "Get back a portion of your daily losses",
    ka: "დაიბრუნეთ თქვენი ყოველდღიური დანაკარგების ნაწილი",
  },
  "profile.refer_friend": {
    tr: "Arkadaşını Davet Et",
    en: "Refer a Friend",
    ka: "მოიწვიეთ მეგობარი",
  },
  "profile.refer_friend_desc": {
    tr: "Arkadaşlarınızı davet edin ve bonus kazanın",
    en: "Invite your friends and earn bonuses",
    ka: "მოიწვიეთ მეგობრები და მიიღეთ ბონუსები",
  },
  "profile.claim_now": {
    tr: "Hemen Al",
    en: "Claim Now",
    ka: "ახლავე მიიღეთ",
  },
  "profile.invite_now": {
    tr: "Şimdi Davet Et",
    en: "Invite Now",
    ka: "ახლავე მოიწვიეთ",
  },
  "profile.see_details": {
    tr: "Detayları Gör",
    en: "See Details",
    ka: "დეტალების ნახვა",
  },
  "profile.wagering_requirement": {
    tr: "Çevrim Şartı",
    en: "Wagering Requirement",
    ka: "ფსონის მოთხოვნა",
  },
  "profile.expires": {
    tr: "Son Kullanma",
    en: "Expires",
    ka: "ვადა გასდის",
  },
  "profile.days": {
    tr: "gün",
    en: "days",
    ka: "დღე",
  },
  "profile.two_factor": {
    tr: "İki Faktörlü Doğrulama",
    en: "Two-Factor Authentication",
    ka: "ორფაქტორიანი ავთენტიფიკაცია",
  },
  "profile.2fa_desc": {
    tr: "Hesabınıza ekstra bir güvenlik katmanı ekleyin",
    en: "Add an extra layer of security to your account",
    ka: "დაამატეთ უსაფრთხოების დამატებითი ფენა თქვენს ანგარიშზე",
  },
  "profile.enable_2fa": {
    tr: "İki Faktörlü Doğrulamayı Etkinleştir",
    en: "Enable Two-Factor Authentication",
    ka: "ორფაქტორიანი ავთენტიფიკაციის ჩართვა",
  },
  "profile.login_notifications": {
    tr: "Giriş Bildirimleri",
    en: "Login Notifications",
    ka: "შესვლის შეტყობინებები",
  },
  "profile.login_notif_desc": {
    tr: "Hesabınıza her girişte bildirim alın",
    en: "Get notified every time your account is accessed",
    ka: "მიიღეთ შეტყობინება ყოველ ჯერზე, როდესაც თქვენს ანგარიშზე შესვლა ხდება",
  },
  "profile.password_req": {
    tr: "En az 8 karakter, bir büyük harf, bir küçük harf ve bir rakam içermelidir",
    en: "Minimum 8 characters with at least one uppercase, one lowercase and one number",
    ka: "მინიმუმ 8 სიმბოლო, სულ მცირე ერთი დიდი ასო, ერთი პატარა ასო და ერთი ციფრი",
  },
  "profile.email_notif_desc": {
    tr: "Önemli güncellemeler, bonuslar ve promosyonlar hakkında e-posta alın",
    en: "Receive emails about important updates, bonuses, and promotions",
    ka: "მიიღეთ ელფოსტა მნიშვნელოვანი განახლებების, ბონუსებისა და აქციების შესახებ",
  },
  "profile.sms_notif_desc": {
    tr: "Özel teklifler ve kazançlar hakkında SMS alın",
    en: "Receive SMS about special offers and winnings",
    ka: "მიიღეთ SMS სპეციალური შეთავაზებებისა და მოგებების შესახებ",
  },
  "profile.promo_notif_desc": {
    tr: "Özel promosyonlar, bonuslar ve etkinlikler hakkında bildirimler alın",
    en: "Receive notifications about special promotions, bonuses, and events",
    ka: "მიიღეთ შეტყობინებები სპეციალური აქციების, ბონუსებისა და ღონისძიებების შესახებ",
  },
  "profile.appearance": {
    tr: "Görünüm",
    en: "Appearance",
    ka: "გარეგნობა",
  },
  "profile.save_settings": {
    tr: "Tercihleri Kaydet",
    en: "Save Preferences",
    ka: "პარამეტრების შენახვა",
  },

  // Para Yatırma Modalı
  "payment.deposit_title": {
    tr: "Para Yatırma",
    en: "Deposit",
    ka: "დეპოზიტი",
  },
  "payment.deposit_subtitle": {
    tr: "Hesabınıza güvenli ve hızlı bir şekilde para yatırın",
    en: "Deposit money to your account safely and quickly",
    ka: "შეიტანეთ ფული თქვენს ანგარიშზე უსაფრთხოდ და სწრაფად",
  },
  "payment.deposit": {
    tr: "Para Yatır",
    en: "Deposit",
    ka: "დეპოზიტი",
  },
  "payment.papara_desc": {
    tr: "Papara hesabınızla hızlı para yatırma",
    en: "Fast deposit with your Papara account",
    ka: "სწრაფი დეპოზიტი თქვენი Papara ანგარიშით",
  },
  "payment.instant": {
    tr: "Anında",
    en: "Instant",
    ka: "მყისიერი",
  },
  "payment.bank_transfer": {
    tr: "Havale/EFT",
    en: "Bank Transfer",
    ka: "საბანკო გადარიცხვა",
  },
  "payment.bank_transfer_desc": {
    tr: "Tüm bankalara hızlı transfer",
    en: "Fast transfer to all banks",
    ka: "სწრაფი გადარიცხვა ყველა ბანკში",
  },
  "payment.hours": {
    tr: "{count} saat içinde",
    en: "Within {count} hours",
    ka: "{count} საათის განმავლობაში",
  },
  "payment.mobile_banking": {
    tr: "Mobil bankacılıkla kolay ve hızlı yatırım",
    en: "Easy and fast deposit with mobile banking",
    ka: "ადვილი და სწრაფი დეპოზიტი მობილური ბანკინგით",
  },
  "payment.paykasa_desc": {
    tr: "Güvenli ve hızlı online ödeme",
    en: "Secure and fast online payment",
    ka: "უსაფრთხო და სწრაფი ონლაინ გადახდა",
  },
  "payment.crypto_desc": {
    tr: "Bitcoin ile yatırım yapın",
    en: "Make deposit with Bitcoin",
    ka: "გააკეთეთ დეპოზიტი Bitcoin- ით",
  },
  "payment.minutes": {
    tr: "{count} dakika",
    en: "{count} minutes",
    ka: "{count} წუთი",
  },
  "payment.astropay_desc": {
    tr: "Ön ödemeli kart ile yatırım",
    en: "Deposit with prepaid card",
    ka: "დეპოზიტი წინასწარ გადახდილი ბარათით",
  },
  "payment.envoysoft_desc": {
    tr: "Hızlı ve güvenli para transferi",
    en: "Fast and secure money transfer",
    ka: "სწრაფი და უსაფრთხო ფულის გადარიცხვა",
  },
  "payment.payfix_desc": {
    tr: "Elektronik cüzdan ile anında para yatırma",
    en: "Instant deposit with electronic wallet",
    ka: "ინსტანტური დეპოზიტი ელექტრონული საფულით",
  },
  "payment.select_method": {
    tr: "Ödeme Yöntemi",
    en: "Payment Method",
    ka: "გადახდის მეთოდი",
  },
  "payment.amount": {
    tr: "Miktar",
    en: "Amount",
    ka: "რაოდენობა",
  },
  "payment.confirmation": {
    tr: "Onay",
    en: "Confirmation",
    ka: "დადასტურება",
  },
  "payment.choose_method": {
    tr: "Ödeme Yönteminizi Seçin",
    en: "Choose Your Payment Method",
    ka: "აირჩიეთ თქვენი გადახდის მეთოდი",
  },
  "payment.popular": {
    tr: "POPÜLER",
    en: "POPULAR",
    ka: "პოპულარული",
  },
  "payment.bonus": {
    tr: "BONUS",
    en: "BONUS",
    ka: "ბონუსი",
  },
  "payment.min": {
    tr: "Min",
    en: "Min",
    ka: "მინ",
  },
  "payment.time": {
    tr: "Süre",
    en: "Time",
    ka: "დრო",
  },
  "payment.continue": {
    tr: "Devam Et",
    en: "Continue",
    ka: "გაგრძელება",
  },
  "payment.enter_deposit_amount": {
    tr: "Yatırım Miktarını Girin",
    en: "Enter Deposit Amount",
    ka: "შეიყვანეთ დეპოზიტის ოდენობა",
  },
  "payment.selected_method": {
    tr: "Seçilen Yöntem",
    en: "Selected Method",
    ka: "არჩეული მეთოდი",
  },
  "payment.limits": {
    tr: "Limitler",
    en: "Limits",
    ka: "ლიმიტები",
  },
  "payment.deposit_bonus": {
    tr: "{percent}% Yatırım Bonusu",
    en: "{percent}% Deposit Bonus",
    ka: "{percent}% დეპოზიტის ბონუსი",
  },
  "payment.bonus_details": {
    tr: "Yatırımınızın {percent}%'i kadar bonus kazanın!",
    en: "Get {percent}% bonus on your deposit!",
    ka: "მიიღეთ {percent}% ბონუსი თქვენს დეპოზიტზე!",
  },
  "payment.back": {
    tr: "Geri",
    en: "Back",
    ka: "უკან",
  },
  "payment.confirm_deposit": {
    tr: "Yatırımı Onayla",
    en: "Confirm Deposit",
    ka: "დაადასტურეთ დეპოზიტი",
  },
  "payment.transaction_details": {
    tr: "İşlem Detayları",
    en: "Transaction Details",
    ka: "ტრანზაქციის დეტალები",
  },
  "payment.payment_method": {
    tr: "Ödeme Yöntemi",
    en: "Payment Method",
    ka: "გადახდის მეთოდი",
  },
  "payment.deposit_amount": {
    tr: "Yatırım Miktarı",
    en: "Deposit Amount",
    ka: "დეპოზიტის თანხა",
  },
  "payment.total_credited": {
    tr: "Hesaba Geçecek Toplam",
    en: "Total Credited",
    ka: "ჯამური კრედიტი",
  },
  "payment.processing_time": {
    tr: "İşlem Süresi",
    en: "Processing Time",
    ka: "დამუშავების დრო",
  },
  "payment.confirmation_info": {
    tr: "Onayladıktan sonra ödeme sayfasına yönlendirileceksiniz. İşlem tamamlandığında bakiyeniz otomatik olarak güncellenecektir.",
    en: "After confirmation, you will be redirected to the payment page. Your balance will be updated automatically when the transaction is completed.",
    ka: "დადასტურების შემდეგ, თქვენ გადამისამართდებით გადახდის გვერდზე. თქვენი ბალანსი ავტომატურად განახლდება ტრანზაქციის დასრულების შემდეგ.",
  },
  "payment.enter_amount": {
    tr: "Lütfen yatırmak istediğiniz miktarı girin",
    en: "Please enter the amount you want to deposit",
    ka: "გთხოვთ შეიყვანოთ თანხა, რომლის შეტანაც გსურთ",
  },
  "payment.min_amount_error": {
    tr: "Minimum yatırım tutarı {min}₺'dir",
    en: "Minimum deposit amount is {min}₺",
    ka: "მინიმალური დეპოზიტის თანხაა {min}₺",
  },
  "payment.max_amount_error": {
    tr: "Maksimum yatırım tutarı {max}₺'dir",
    en: "Maximum deposit amount is {max}₺",
    ka: "მაქსიმალური დეპოზიტის თანხაა {max}₺",
  },
  "payment.success": {
    tr: "İşlem Başarılı!",
    en: "Transaction Successful!",
    ka: "ტრანზაქცია წარმატებულია!",
  },
  "payment.processing": {
    tr: "İşleniyor...",
    en: "Processing...",
    ka: "მუშავდება...",
  },
  "payment.confirm_and_pay": {
    tr: "Onayla ve Öde",
    en: "Confirm and Pay",
    ka: "დაადასტურეთ და გადაიხადეთ",
  },
  "payment.secure_transaction": {
    tr: "Tüm işlemler SSL ile korunmaktadır",
    en: "All transactions are protected with SSL",
    ka: "ყველა ტრანზაქცია დაცულია SSL- ით",
  },
  "payment.privacy_protected": {
    tr: "Gizlilik korunmaktadır",
    en: "Privacy is protected",
    ka: "კონფიდენციალურობა დაცულია",
  },
  
  
  // Ana Sayfa Başlıkları
  "home.welcome": {
    tr: "Cryptonbets'e Hoş Geldiniz",
    en: "Welcome to Cryptonbets",
    ka: "მოგესალმებით Cryptonbets-ზე",
  },
  "home.slogan": {
    tr: "En güvenilir çevrimiçi bahis platformu",
    en: "The most trusted online betting platform",
    ka: "ყველაზე სანდო ონლაინ ფსონების პლატფორმა",
  },
  "banner.vip_membership": {
    tr: "VIP ÜYELİK",
    en: "VIP MEMBERSHIP",
    ka: "VIP წევრობა",
  },
  "banner.bonuses": {
    tr: "BONUSLAR",
    en: "BONUSES",
    ka: "ბონუსები",
  },
  
  // Bonuslar Bölümü
  "home.bonuses.title": {
    tr: "BONUSLAR",
    en: "BONUSES",
    ka: "ბონუსები",
  },
  "home.bonuses.description": {
    tr: "En yüksek bonuslar ve promosyonlar Cryptonbets'te sizi bekliyor",
    en: "The highest bonuses and promotions await you at Cryptonbets",
    ka: "უმაღლესი ბონუსები და აქციები Cryptonbets-ზე გელოდებათ",
  },
  
  // Bölüm Başlıkları
  "section.features": {
    tr: "SİTE ÖZELLİKLERİ",
    en: "SITE FEATURES",
    ka: "საიტის მახასიათებლები",
  },
  "section.leadership": {
    tr: "LİDERLİK TABLOSU",
    en: "LEADERBOARD",
    ka: "ლიდერბორდი",
  },
  "section.bonus": {
    tr: "BONUSLAR",
    en: "BONUSES",
    ka: "ბონუსები",
  },
  "section.bonuses": {
    tr: "BONUSLAR",
    en: "BONUSES",
    ka: "ბონუსები",
  },
  "section.vip": {
    tr: "VIP",
    en: "VIP",
    ka: "VIP",
  },

  // Popüler Slot Oyunları Bölümü
  "home.popularSlots.title": {
    tr: "POPÜLER SLOT OYUNLARI",
    en: "POPULAR SLOT GAMES",
    ka: "პოპულარული სლოტ თამაშები",
  },
  "home.popularSlots.description": {
    tr: "En popüler ve kazançlı slot oyunları burada",
    en: "The most popular and profitable slot games are here",
    ka: "ყველაზე პოპულარული და მომგებიანი სლოტ თამაშები აქაა",
  },
  "home.popularSlots.viewAll": {
    tr: "Tümünü Gör",
    en: "View All",
    ka: "ყველას ნახვა",
  },
  
  // Popüler Casino Oyunları Bölümü
  "home.popularCasino.title": {
    tr: "POPÜLER CASINO OYUNLARI",
    en: "POPULAR CASINO GAMES",
    ka: "პოპულარული კაზინოს თამაშები",
  },
  "home.popularCasino.description": {
    tr: "En çok oynanan canlı casino oyunları",
    en: "Most played live casino games",
    ka: "ყველაზე პოპულარული ლაივ კაზინოს თამაშები",
  },
  "home.popularCasino.viewAll": {
    tr: "Tümünü Gör",
    en: "View All",
    ka: "ყველას ნახვა",
  },
  
  // Oyun Sağlayıcıları Bölümü
  "home.gameProviders.title": {
    tr: "OYUN SAĞLAYICILARI",
    en: "GAME PROVIDERS",
    ka: "თამაშის პროვაიდერები",
  },
  "home.gameProviders.description": {
    tr: "En güvenilir altyapılarla hizmetinizdeyiz",
    en: "At your service with the most reliable infrastructures",
    ka: "თქვენს სამსახურში ყველაზე საიმედო ინფრასტრუქტურით",
  },
  
  // Finans Sağlayıcıları Bölümü
  "home.financeProviders.title": {
    tr: "FİNANS SAĞLAYICILARI",
    en: "FINANCE PROVIDERS",
    ka: "ფინანსური პროვაიდერები",
  },
  "home.financeProviders.description": {
    tr: "Güvenli ve hızlı para transferi",
    en: "Safe and fast money transfer",
    ka: "უსაფრთხო და სწრაფი ფულის გადარიცხვა",
  },
  
  // Lisans Bölümü
  "home.license.title": {
    tr: "LİSANS BİLGİLERİ",
    en: "LICENSE INFORMATION",
    ka: "სალიცენზიო ინფორმაცია",
  },
  "home.license.description": {
    tr: "Anjuan Gaming lisanslı güvenilir bahis sitesi",
    en: "Anjuan Gaming licensed trusted betting site",
    ka: "Anjuan Gaming ლიცენზირებული სანდო ფსონების საიტი",
  },
  

  "header.affiliate": {
    tr: "AFFILIATE PROGRAM",
    en: "AFFILIATE PROGRAM",
    ka: "პარტნიორული პროგრამა",
  },
  "header.commission": {
    tr: "Yüksek Komisyon",
    en: "High Commission",
    ka: "მაღალი საკომისიო",
  },
  "header.licensed_site": {
    tr: "Lisanslı Bahis Sitesi",
    en: "Licensed Betting Site",
    ka: "ლიცენზირებული ფსონების საიტი",
  },
  "header.official_sponsor": {
    tr: "Resmi Sponsorumuz",
    en: "Our Official Sponsor",
    ka: "ჩვენი ოფიციალური სპონსორი",
  },
  "header.telegram_channel": {
    tr: "Telegram Kanalımız",
    en: "Our Telegram Channel",
    ka: "ჩვენი Telegram არხი",
  },
  
  // Sidebar Menü
  "sidebar.slot": {
    tr: "SLOT",
    en: "SLOT",
    ka: "სლოტი",
  },
  "sidebar.casino": {
    tr: "CASINO",
    en: "CASINO",
    ka: "კაზინო",
  },
  "sidebar.games": {
    tr: "OYUNLAR",
    en: "GAMES",
    ka: "თამაშები",
  },
  "sidebar.vip": {
    tr: "VIP",
    en: "VIP",
    ka: "VIP",
  },
  "sidebar.bonuses": {
    tr: "BONUSLAR",
    en: "BONUSES",
    ka: "ბონუსები",
  },
  "sidebar.sports": {
    tr: "SPOR",
    en: "SPORTS",
    ka: "სპორტი",
  },
  "sidebar.esports": {
    tr: "E-SPOR",
    en: "E-SPORTS",
    ka: "ელექტრონული სპორტი",
  },
  "sidebar.home": {
    tr: "ANA SAYFA",
    en: "HOME",
    ka: "მთავარი",
  },
  "sidebar.social": {
    tr: "SOSYAL",
    en: "SOCIAL",
    ka: "სოციალური",
  },
  
  // Kayıt ve Giriş Formları
  "auth.login_title": {
    tr: "Giriş Yap",
    en: "Login",
    ka: "შესვლა",
  },
  "auth.login_subtitle": {
    tr: "Hesabınıza giriş yaparak deneyiminize kaldığınız yerden devam edin.",
    en: "Continue from where you left off by logging into your account.",
    ka: "გააგრძელეთ იქიდან, სადაც გაჩერდით, თქვენს ანგარიშზე შესვლით.",
  },
  "auth.register_title": {
    tr: "Yeni Hesap Oluştur",
    en: "Create New Account",
    ka: "ახალი ანგარიშის შექმნა",
  },
  "auth.register_subtitle": {
    tr: "Hızlı ve güvenli bir şekilde yeni bir hesap oluşturarak bahis dünyasına adım atın.",
    en: "Step into the betting world by creating a new account quickly and securely.",
    ka: "შედით სანაძლეოების სამყაროში ახალი ანგარიშის სწრაფად და უსაფრთხოდ შექმნით.",
  },
  "auth.username_placeholder": {
    tr: "Kullanıcı adınız",
    en: "Your username", 
    ka: "თქვენი მომხმარებლის სახელი",
  },
  "auth.password_placeholder": {
    tr: "Şifreniz",
    en: "Your password",
    ka: "თქვენი პაროლი",
  },
  "auth.confirm_password": {
    tr: "Şifre Tekrar",
    en: "Confirm Password",
    ka: "პაროლის დადასტურება",
  },
  "auth.confirm_password_placeholder": {
    tr: "Şifrenizi tekrar girin",
    en: "Confirm your password",
    ka: "დაადასტურეთ თქვენი პაროლი",
  },
  "auth.email_placeholder": {
    tr: "E-posta adresiniz",
    en: "Your email address",
    ka: "თქვენი ელფოსტა",
  },
  "auth.phone": {
    tr: "Telefon Numarası",
    en: "Phone Number",
    ka: "ტელეფონის ნომერი",
  },
  "auth.phone_placeholder": {
    tr: "Telefon numaranız",
    en: "Your phone number",
    ka: "თქვენი ტელეფონის ნომერი",
  },
  "auth.birthdate": {
    tr: "Doğum Tarihi",
    en: "Birth Date", 
    ka: "დაბადების თარიღი",
  },
  "auth.remember_me": {
    tr: "Beni Hatırla",
    en: "Remember Me",
    ka: "დამიმახსოვრე",
  },
  "auth.forgot_password": {
    tr: "Şifremi Unuttum",
    en: "Forgot Password",
    ka: "პაროლი დაგავიწყდათ",
  },
  "auth.login_button": {
    tr: "GİRİŞ YAP", 
    en: "LOGIN",
    ka: "შესვლა",
  },
  "auth.register_button": {
    tr: "KAYIT OL",
    en: "REGISTER",
    ka: "რეგისტრაცია",
  },
  "auth.secure_login": {
    tr: "Güvenli ve şifrelenmiş bağlantı ile giriş yapıyorsunuz",
    en: "You are logging in with a secure and encrypted connection",
    ka: "შედიხართ უსაფრთხო და დაშიფრული კავშირით",
  },
  "auth.secure_register": {
    tr: "Verileriniz 256-bit şifreleme ile korunmaktadır",
    en: "Your data is protected with 256-bit encryption",
    ka: "თქვენი მონაცემები დაცულია 256-ბიტიანი დაშიფვრით",
  },
  "auth.or_option": {
    tr: "veya",
    en: "or",
    ka: "ან",
  },
  "auth.need_account": {
    tr: "Hesabınız yok mu?",
    en: "Don't have an account?",
    ka: "არ გაქვთ ანგარიში?",
  },
  "auth.have_account": {
    tr: "Zaten hesabınız var mı?",
    en: "Already have an account?",
    ka: "უკვე გაქვთ ანგარიში?",
  },
  "auth.create_account": {
    tr: "Hemen Kayıt Olun",
    en: "Register Now",
    ka: "დარეგისტრირდით ახლავე",
  },
  "auth.accept_terms": {
    tr: "Üyelik sözleşmesini ve",
    en: "I have read and accept the",
    ka: "წავიკითხე და ვეთანხმები",
  },
  "auth.terms_and_conditions": {
    tr: "gizlilik politikasını",
    en: "terms and conditions",
    ka: "წესებს და პირობებს",
  },
  "auth.read_and_accept": {
    tr: "okudum, kabul ediyorum.",
    en: "of membership.",
    ka: "წევრობის.",
  },
  "auth.username": {
    tr: "Kullanıcı Adı",
    en: "Username",
    ka: "მომხმარებლის სახელი",
  },
  "auth.email": {
    tr: "E-posta",
    en: "Email",
    ka: "ელ-ფოსტა",
  },
  "auth.password": {
    tr: "Şifre",
    en: "Password",
    ka: "პაროლი",
  },
  "auth.confirmPassword": {
    tr: "Şifreyi Onayla",
    en: "Confirm Password",
    ka: "დაადასტურეთ პაროლი",
  },
  "auth.forgotPassword": {
    tr: "Şifremi Unuttum",
    en: "Forgot Password",
    ka: "პაროლი დამავიწყდა",
  },
  "auth.loginButton": {
    tr: "GİRİŞ YAP",
    en: "LOGIN",
    ka: "შესვლა",
  },
  "auth.registerButton": {
    tr: "KAYIT OL",
    en: "REGISTER",
    ka: "რეგისტრაცია",
  },
  "auth.loginTitle": {
    tr: "GİRİŞ YAP",
    en: "LOGIN",
    ka: "შესვლა",
  },
  "auth.registerTitle": {
    tr: "KAYIT OL",
    en: "REGISTER",
    ka: "რეგისტრაცია",
  },
  "auth.rememberMe": {
    tr: "Beni Hatırla",
    en: "Remember Me",
    ka: "დამიმახსოვრე",
  },
  
  // Mobil Alt Menü
  "mobile.home": {
    tr: "Ana Sayfa",
    en: "Home",
    ka: "მთავარი",
  },
  "mobile.casino": {
    tr: "Casino",
    en: "Casino",
    ka: "კაზინო",
  },
  "mobile.slot": {
    tr: "Slot",
    en: "Slot",
    ka: "სლოტი",
  },
  "mobile.profile": {
    tr: "Profil",
    en: "Profile",
    ka: "პროფილი",
  },
  
  // Site Özellikleri
  "site.secure_gaming": {
    tr: "Güvenli Oyun",
    en: "Secure Gaming",
    ka: "უსაფრთხო თამაში",
  },
  "site.secure_gaming_desc": {
    tr: "SSL şifrelemeli güvenli sistem",
    en: "Secure system with SSL encryption",
    ka: "უსაფრთხო სისტემა SSL დაშიფვრით",
  },
  "site.fast_withdrawal": {
    tr: "Hızlı Çekim",
    en: "Fast Withdrawal",
    ka: "სწრაფი გამოტანა",
  },
  "site.fast_withdrawal_desc": {
    tr: "10 dakikada paranız hesabınızda",
    en: "Your money in your account in 10 minutes",
    ka: "თქვენი ფული თქვენს ანგარიშზე 10 წუთში",
  },
  "site.support_24_7": {
    tr: "7/24 Destek",
    en: "24/7 Support",
    ka: "მხარდაჭერა 24/7",
  },
  "site.support_24_7_desc": {
    tr: "Kesintisiz müşteri hizmetleri",
    en: "Uninterrupted customer service",
    ka: "შეუფერხებელი მომხმარებელთა მომსახურება",
  },
  "site.easy_payment": {
    tr: "Kolay Ödeme",
    en: "Easy Payment",
    ka: "მარტივი გადახდა",
  },
  "site.easy_payment_desc": {
    tr: "Çoklu ödeme seçenekleri",
    en: "Multiple payment options",
    ka: "გადახდის მრავალი ვარიანტი",
  },
  "leaderboard.highest_win": {
    tr: "En Yüksek Kazanç",
    en: "Highest Win",
    ka: "ყველაზე მაღალი მოგება",
  },
  "leaderboard.top_depositor": {
    tr: "En Çok Yatırım Yapan",
    en: "Top Depositor",
    ka: "მთავარი შემომტანი",
  },
  
  "home.most_preferred_site": {
    tr: "SEKTÖRÜN EN ÇOK TERCİH EDİLEN SİTESİ",
    en: "THE MOST PREFERRED SITE IN THE INDUSTRY",
    ka: "ყველაზე პრეფერენციული საიტი ინდუსტრიაში",
  },
  
  // Bonuslar
  "bonuses.free_spin": {
    tr: "Bedava Çevirme",
    en: "Free Spin",
    ka: "უფასო ტრიალი",
  },
  "bonuses.papara_bonus": {
    tr: "Papara Bonusu",
    en: "Papara Bonus",
    ka: "Papara ბონუსი",
  },
  "bonuses.first_deposit": {
    tr: "İlk Yatırım",
    en: "First Deposit",
    ka: "პირველი შენატანი",
  },
  "bonuses.wager_free": {
    tr: "Çevrimsiz",
    en: "Wager Free",
    ka: "უბრუნავი",
  },
  "bonuses.live_casino": {
    tr: "Canlı Casino",
    en: "Live Casino",
    ka: "ცოცხალი კაზინო",
  },
  "bonuses.all_bonuses": {
    tr: "Tüm Bonuslar",
    en: "All Bonuses",
    ka: "ყველა ბონუსი",
  },
  "bonuses.new_bonuses": {
    tr: "Yeni Bonuslar",
    en: "New Bonuses",
    ka: "ახალი ბონუსები",
  },
  "bonuses.info_text": {
    tr: "Günlük ve haftalık bonusları kaçırmayın!",
    en: "Don't miss daily and weekly bonuses!",
    ka: "არ გამოტოვოთ ყოველდღიური და ყოველკვირეული ბონუსები!",
  },
  "bonuses.vip_club": {
    tr: "VIP Kulüp",
    en: "VIP Club",
    ka: "VIP კლუბი",
  },
  "bonuses.premium": {
    tr: "Premium",
    en: "Premium",
    ka: "პრემიუმი",
  },
  "bonuses.daily_wheel": {
    tr: "Günlük Çark",
    en: "Daily Wheel",
    ka: "ყოველდღიური ბორბალი",
  },
  "bonuses.fast_games": {
    tr: "Hızlı Oyunlar",
    en: "Fast Games",
    ka: "სწრაფი თამაშები",
  },
  "bonuses.deposit_bonus": {
    tr: "Yatırım Bonusu",
    en: "Deposit Bonus",
    ka: "ანაბრის ბონუსი",
  },
  "bonuses.cashback": {
    tr: "Kayıp Bonusu",
    en: "Cashback",
    ka: "ქეშბექი",
  },
  "bonuses.welcome": {
    tr: "Hoşgeldin Bonusu",
    en: "Welcome Bonus",
    ka: "მისასალმებელი ბონუსი",
  },
  "bonuses.casino_bonus": {
    tr: "Casino Bonusu",
    en: "Casino Bonus",
    ka: "კაზინოს ბონუსი",
  },
  "bonuses.freespin": {
    tr: "Bedava Çevirme",
    en: "Free Spins",
    ka: "უფასო ტრიალები",
  },
  
  // Bonus İkonları
  "bonuses.icon.vip": {
    tr: "VIP",
    en: "VIP",
    ka: "VIP",
  },
  "bonuses.icon.vip_club": {
    tr: "Kulüp",
    en: "Club",
    ka: "კლუბი",
  },
  "bonuses.icon.premium": {
    tr: "Premium",
    en: "Premium",
    ka: "პრემიუმი",
  },
  "bonuses.icon.bonus": {
    tr: "Bonus",
    en: "Bonus",
    ka: "ბონუსი",
  },
  "bonuses.icon.wheel": {
    tr: "Çark",
    en: "Wheel",
    ka: "ბორბალი",
  },
  "bonuses.icon.spin": {
    tr: "Çevirme",
    en: "Spin",
    ka: "დატრიალება",
  },
  "bonuses.icon.fast": {
    tr: "Hızlı",
    en: "Fast",
    ka: "სწრაფი",
  },
  "bonuses.icon.games": {
    tr: "Oyunlar",
    en: "Games",
    ka: "თამაშები",
  },
  "bonuses.icon.first": {
    tr: "İlk",
    en: "First",
    ka: "პირველი",
  },
  "bonuses.icon.deposit": {
    tr: "Yatırım",
    en: "Deposit",
    ka: "დეპოზიტი",
  },
  "bonuses.icon.live_casino": {
    tr: "Canlı Casino",
    en: "Live Casino",
    ka: "ცოცხალი კაზინო",
  },
  "bonuses.icon.casino": {
    tr: "Casino",
    en: "Casino",
    ka: "კაზინო",
  },

  // InstagramStory
  "story.highlights": {
    tr: "ÖNE ÇIKANLAR",
    en: "HIGHLIGHTS",
    ka: "გამორჩეულები",
  },
  "story.vip": {
    tr: "VIP",
    en: "VIP",
    ka: "VIP",
  },
  "story.premium": {
    tr: "Premium",
    en: "Premium",
    ka: "პრემიუმი",
  },
  "story.wheel": {
    tr: "Çark",
    en: "Wheel",
    ka: "ბორბალი",
  },
  "story.fast": {
    tr: "Hızlı",
    en: "Fast",
    ka: "სწრაფი",
  },
  "story.bonus": {
    tr: "Bonus",
    en: "Bonus",
    ka: "ბონუსი",
  },
  "story.vip_desc": {
    tr: "VIP üyelik ayrıcalıkları",
    en: "VIP membership privileges",
    ka: "VIP წევრობის პრივილეგიები",
  },
  "story.premium_desc": {
    tr: "Premium bonuslar",
    en: "Premium bonuses",
    ka: "პრემიუმ ბონუსები",
  },
  "story.wheel_desc": {
    tr: "Çark çevir kazan",
    en: "Spin the wheel to win",
    ka: "დაატრიალეთ ბორბალი მოსაგებად",
  },
  "story.fast_desc": {
    tr: "Hızlı çekim avantajı",
    en: "Fast withdrawal advantage",
    ka: "სწრაფი გატანის უპირატესობა",
  },
  "story.bonus_desc": {
    tr: "Özel bonus fırsatları",
    en: "Special bonus opportunities",
    ka: "სპეციალური ბონუს შესაძლებლობები",
  },
  "story.modal_description": {
    tr: "Bu özel özelliği kullanarak daha fazla avantaj elde edebilirsiniz. Aşağıdaki butona tıklayarak hemen keşfedin.",
    en: "You can gain more advantages by using this special feature. Discover now by clicking the button below.",
    ka: "შეგიძლიათ მიიღოთ მეტი უპირატესობა ამ სპეციალური ფუნქციის გამოყენებით. აღმოაჩინეთ ახლავე ქვემოთ ღილაკზე დაჭერით.",
  },
  "common.view_all": {
    tr: "Tümünü gör",
    en: "View all",
    ka: "ყველას ნახვა",
  },
  "story.discover_now": {
    tr: "HEMEN KEŞFET",
    en: "DISCOVER NOW",
    ka: "აღმოაჩინეთ ახლავე",
  },
  
  // Sidebar ek
  "sidebar.whatsapp": {
    tr: "WhatsApp",
    en: "WhatsApp",
    ka: "WhatsApp",
  },
  "sidebar.help": {
    tr: "Yardım",
    en: "Help",
    ka: "დახმარება",
  },
  
  // Header butonları
  "header.login_button": {
    tr: "Giriş Yap",
    en: "Login",
    ka: "შესვლა",
  },
  "header.register_button": {
    tr: "Kayıt Ol",
    en: "Register",
    ka: "რეგისტრაცია",
  },
  
  // Profil Modal
  "profile.title": {
    tr: "Hesap Profiliniz",
    en: "Your Account Profile",
    ka: "თქვენი ანგარიშის პროფილი",
  },
  "profile.personal_info_title": {
    tr: "Kişisel Bilgiler",
    en: "Personal Information",
    ka: "პირადი ინფორმაცია",
  },
  "profile.security_title": {
    tr: "Güvenlik",
    en: "Security",
    ka: "უსაფრთხოება",
  },
  "profile.bet_history": {
    tr: "Bahis Geçmişi",
    en: "Bet History",
    ka: "ფსონის ისტორია",
  },
  "profile.preferences": {
    tr: "Tercihler",
    en: "Preferences",
    ka: "პრეფერენციები",
  },
  "profile.balance": {
    tr: "Bakiye",
    en: "Balance",
    ka: "ბალანსი",
  },
  "profile.bets_section": {
    tr: "Bahisler",
    en: "Bets",
    ka: "ფსონები",
  },
  "profile.personal_info_desc": {
    tr: "Kişisel bilgilerinizi güncelleyin ve hesap ayarlarınızı yönetin.",
    en: "Update your personal information and manage your account settings.",
    ka: "განაახლეთ თქვენი პირადი ინფორმაცია და მართეთ ანგარიშის პარამეტრები.",
  },
  "profile.full_name_label": {
    tr: "Ad Soyad",
    en: "Full Name",
    ka: "სრული სახელი",
  },
  "profile.full_name_placeholder": {
    tr: "Adınız ve soyadınız",
    en: "Your full name",
    ka: "თქვენი სრული სახელი",
  },
  "profile.email_placeholder": {
    tr: "E-posta adresiniz",
    en: "Your email address",
    ka: "თქვენი ელ-ფოსტის მისამართი",
  },
  "profile.username": {
    tr: "Kullanıcı Adı",
    en: "Username",
    ka: "მომხმარებლის სახელი",
  },
  "profile.username_note": {
    tr: "Kullanıcı adınız değiştirilemez.",
    en: "Your username cannot be changed.",
    ka: "თქვენი მომხმარებლის სახელის შეცვლა არ შეიძლება.",
  },
  "profile.phone_placeholder": {
    tr: "Telefon numaranız",
    en: "Your phone number",
    ka: "თქვენი ტელეფონის ნომერი",
  },
  "profile.save_changes": {
    tr: "Değişiklikleri Kaydet",
    en: "Save Changes",
    ka: "ცვლილებების შენახვა",
  },
  "profile.security_desc": {
    tr: "Şifrenizi değiştirin ve hesabınızın güvenliğini artırın.",
    en: "Change your password and enhance your account security.",
    ka: "შეცვალეთ თქვენი პაროლი და გააუმჯობესეთ ანგარიშის უსაფრთხოება.",
  },
  "profile.current_password_label": {
    tr: "Mevcut Şifre",
    en: "Current Password",
    ka: "მიმდინარე პაროლი",
  },
  "profile.new_password_set": {
    tr: "Yeni Şifre",
    en: "New Password",
    ka: "ახალი პაროლი",
  },
  "profile.confirm_password_label": {
    tr: "Şifreyi Onayla",
    en: "Confirm Password",
    ka: "დაადასტურეთ პაროლი",
  },
  "profile.change_password_action": {
    tr: "Şifreyi Değiştir",
    en: "Change Password",
    ka: "პაროლის შეცვლა",
  },
  "profile.history_desc": {
    tr: "Geçmiş bahislerinizi görüntüleyin ve kazançlarınızı takip edin.",
    en: "View your past bets and track your winnings.",
    ka: "ნახეთ თქვენი წარსული ფსონები და თვალყური ადევნეთ თქვენს მოგებებს.",
  },
  "profile.bet_id": {
    tr: "Bahis No",
    en: "Bet ID",
    ka: "ფსონის ID",
  },
  "profile.bet_date": {
    tr: "Tarih",
    en: "Date",
    ka: "თარიღი",
  },
  "profile.bet_amount": {
    tr: "Miktar",
    en: "Amount",
    ka: "თანხა",
  },
  "profile.bet_status": {
    tr: "Durum",
    en: "Status",
    ka: "სტატუსი",
  },
  "profile.bet_winnings": {
    tr: "Kazanç",
    en: "Winnings",
    ka: "მოგება",
  },
  "profile.no_bets": {
    tr: "Henüz bir bahis yapmadınız.",
    en: "You haven't placed any bets yet.",
    ka: "თქვენ ჯერ არ დაგიდიათ ფსონები.",
  },
  "profile.preferences_desc": {
    tr: "Hesap tercihlerinizi ve bildirim ayarlarınızı özelleştirin.",
    en: "Customize your account preferences and notification settings.",
    ka: "მოირგეთ თქვენი ანგარიშის პრეფერენციები და შეტყობინების პარამეტრები.",
  },
  "profile.language_preference": {
    tr: "Tercih Edilen Dil",
    en: "Preferred Language",
    ka: "სასურველი ენა",
  },
  "profile.notifications_prefs": {
    tr: "Bildirimler",
    en: "Notifications",
    ka: "შეტყობინებები",
  },
  "profile.email_notifs": {
    tr: "E-posta Bildirimleri",
    en: "Email Notifications",
    ka: "ელფოსტის შეტყობინებები",
  },
  "profile.promo_notifications": {
    tr: "Promosyon Bildirimleri",
    en: "Promotional Notifications",
    ka: "პრომო შეტყობინებები",
  },
  "profile.app_preferences": {
    tr: "Tercihleri Kaydet",
    en: "Save Preferences",
    ka: "პარამეტრების შენახვა",
  },
  "profile.logout": {
    tr: "Çıkış Yap",
    en: "Logout",
    ka: "გასვლა",
  },
  "profile.security_tips": {
    tr: "Güvenlik İpuçları",
    en: "Security Tips",
    ka: "უსაფრთხოების რჩევები",
  },
  "profile.security_tip_1": {
    tr: "En az 8 karakter içeren güçlü bir şifre kullanın.",
    en: "Use a strong password with at least 8 characters.",
    ka: "გამოიყენეთ ძლიერი პაროლი მინიმუმ 8 სიმბოლოთი.",
  },
  "profile.security_tip_2": {
    tr: "Hesabınıza başka bir cihazdan giriş yapıldığında bildirim alın.",
    en: "Get notified when someone logs into your account from another device.",
    ka: "მიიღეთ შეტყობინება, როდესაც ვინმე შედის თქვენს ანგარიშზე სხვა მოწყობილობიდან.",
  },
  "profile.security_tip_3": {
    tr: "Şifrenizi düzenli olarak değiştirin ve başka hesaplarda kullanmayın.",
    en: "Change your password regularly and don't use it for other accounts.",
    ka: "რეგულარულად შეცვალეთ თქვენი პაროლი და არ გამოიყენოთ იგი სხვა ანგარიშებისთვის.",
  },
  "profile.all_tab": {
    tr: "Tümü",
    en: "All",
    ka: "ყველა",
  },
  "profile.pending": {
    tr: "Bekliyor",
    en: "Pending",
    ka: "მიმდინარე",
  },
  "profile.won": {
    tr: "Kazandı",
    en: "Won",
    ka: "მოგებული",
  },
  "profile.lost": {
    tr: "Kaybetti",
    en: "Lost",
    ka: "წაგებული",
  },
  "profile.filter": {
    tr: "Filtre",
    en: "Filter",
    ka: "ფილტრი",
  },
  "profile.sort": {
    tr: "Sırala",
    en: "Sort",
    ka: "სორტირება",
  },
  "profile.all_bets": {
    tr: "Tüm Bahisler",
    en: "All Bets",
    ka: "ყველა ფსონი",
  },
  "profile.won_bets": {
    tr: "Kazanılan Bahisler",
    en: "Won Bets",
    ka: "მოგებული ფსონები",
  },
  "profile.lost_bets": {
    tr: "Kaybedilen Bahisler",
    en: "Lost Bets",
    ka: "წაგებული ფსონები",
  },
  "profile.pending_bets": {
    tr: "Bekleyen Bahisler",
    en: "Pending Bets",
    ka: "მიმდინარე ფსონები",
  },
  "profile.newest": {
    tr: "En Yeniler",
    en: "Newest",
    ka: "უახლესი",
  },
  "profile.oldest": {
    tr: "En Eskiler",
    en: "Oldest",
    ka: "უძველესი",
  },
  "profile.highest_amount": {
    tr: "En Yüksek Tutar",
    en: "Highest Amount",
    ka: "უმაღლესი თანხა",
  },
  "profile.lowest_amount": {
    tr: "En Düşük Tutar",
    en: "Lowest Amount",
    ka: "უმცირესი თანხა",
  },
  "profile.date": {
    tr: "Tarih",
    en: "Date",
    ka: "თარიღი",
  },
  "profile.game": {
    tr: "Oyun",
    en: "Game",
    ka: "თამაში",
  },
  "profile.amount": {
    tr: "Tutar",
    en: "Amount",
    ka: "თანხა",
  },
  "profile.status": {
    tr: "Durum",
    en: "Status",
    ka: "სტატუსი",
  },
  "profile.win_amount": {
    tr: "Kazanç",
    en: "Win Amount",
    ka: "მოგების თანხა",
  },
  "profile.bet_history_desc": {
    tr: "Geçmiş bahislerinizi görüntüleyin ve kazançlarınızı takip edin.",
    en: "View your betting history and track your winnings.",
    ka: "ნახეთ თქვენი ფსონების ისტორია და თვალყური ადევნეთ თქვენს მოგებებს.",
  },
  "profile.member_since_updated": {
    tr: "Üyelik tarihi",
    en: "Member since",
    ka: "წევრია",
  },
  "profile.status.online": {
    tr: "Çevrimiçi",
    en: "Online",
    ka: "ონლაინ",
  },
  
  // Oyun filtreleri
  "filters.providers": {
    tr: "Sağlayıcılar",
    en: "Providers",
    ka: "პროვაიდერები",
  },
  "filters.platform": {
    tr: "Platform",
    en: "Platform",
    ka: "პლატფორმა",
  },
  "filters.all": {
    tr: "Hepsi",
    en: "All",
    ka: "ყველა",
  },
  "filters.mobile": {
    tr: "Mobil",
    en: "Mobile",
    ka: "მობილური",
  },
  "filters.desktop": {
    tr: "Masaüstü",
    en: "Desktop",
    ka: "სამაგიდო",
  },
  "profile.level": {
    tr: "Seviye",
    en: "Level",
    ka: "დონე",
  },
  "profile.loyalty_points": {
    tr: "Sadakat Puanları",
    en: "Loyalty Points",
    ka: "ლოიალურობის ქულები",
  },
  "profile.actions": {
    tr: "İşlemler",
    en: "Actions",
    ka: "მოქმედებები",
  },
  "profile.animations": {
    tr: "Animasyonlar",
    en: "Animations",
    ka: "ანიმაციები",
  },
  "profile.theme": {
    tr: "Tema",
    en: "Theme",
    ka: "თემა",
  },
  "profile.disable_animations": {
    tr: "Animasyonları Devre Dışı Bırak",
    en: "Disable Animations",
    ka: "ანიმაციების გამორთვა",
  },
  "profile.dark_mode": {
    tr: "Karanlık Mod",
    en: "Dark Mode",
    ka: "ბნელი რეჟიმი",
  },
  "profile.finance": {
    tr: "Finans İşlemleri",
    en: "Financial Transactions",
    ka: "ფინანსური ოპერაციები",
  },
  "profile.my_bonuses": {
    tr: "Bonuslarım",
    en: "My Bonuses",
    ka: "ჩემი ბონუსები",
  },
  "profile.member_id": {
    tr: "Üye ID",
    en: "Member ID",
    ka: "წევრის ID",
  },
  
  // Oyun cihaz optimizasyonu için çeviriler
  "games.device_detected": {
    tr: "Cihazınız algılandı",
    en: "Your device detected",
    ka: "თქვენი მოწყობილობა აღმოჩენილია",
  },
  "games.mobile_optimized": {
    tr: "Size en uygun mobil oyunlar gösteriliyor",
    en: "Showing mobile-optimized games for you",
    ka: "ნაჩვენებია მობილურზე ოპტიმიზირებული თამაშები თქვენთვის",
  },
  
  // Güvenlik Sekmesi
  "profile.account_security": {
    tr: "Hesap Güvenliği",
    en: "Account Security",
    ka: "ანგარიშის უსაფრთხოება",
  },
  "profile.security_strong": {
    tr: "Güçlü",
    en: "Strong",
    ka: "ძლიერი",
  },
  "profile.last_password_change": {
    tr: "Son Şifre Değişimi",
    en: "Last Password Change",
    ka: "ბოლო პაროლის შეცვლა",
  },
  "profile.days_ago": {
    tr: "gün önce",
    en: "days ago",
    ka: "დღის წინ",
  },
  "profile.two_factor_auth": {
    tr: "İki Faktörlü Doğrulama",
    en: "Two-Factor Authentication",
    ka: "ორფაქტორიანი ავთენტიფიკაცია",
  },
  "profile.not_active": {
    tr: "Aktif Değil",
    en: "Not Active",
    ka: "არ არის აქტიური",
  },
  "profile.change_password_title": {
    tr: "Şifre Değiştir",
    en: "Change Password",
    ka: "პაროლის შეცვლა",
  },
  "profile.password_strength_meter": {
    tr: "Şifre Gücü",
    en: "Password Strength",
    ka: "პაროლის სიძლიერე",
  },
  "profile.strong": {
    tr: "Güçlü",
    en: "Strong",
    ka: "ძლიერი",
  },
  "profile.secure_account": {
    tr: "Hesabınızı güvenceye alın",
    en: "Secure your account",
    ka: "დაიცავით თქვენი ანგარიში",
  },
  "profile.two_factor_desc": {
    tr: "İki faktörlü doğrulama, hesabınıza giriş yapmak için şifrenize ek olarak cep telefonunuza gönderilen kodu kullanmanızı sağlar.",
    en: "Two-factor authentication requires you to use a code sent to your mobile phone in addition to your password when logging into your account.",
    ka: "ორფაქტორიანი ავთენტიფიკაცია მოითხოვს თქვენს მობილურ ტელეფონზე გაგზავნილი კოდის გამოყენებას პაროლთან ერთად ანგარიშზე შესვლისას.",
  },
  "profile.two_factor_status": {
    tr: "İki faktörlü doğrulama",
    en: "Two-factor authentication",
    ka: "ორფაქტორიანი ავთენტიფიკაცია",
  },
  "profile.enable_verification": {
    tr: "Doğrulamayı Etkinleştir",
    en: "Enable Verification",
    ka: "ვერიფიკაციის ჩართვა",
  },
  "profile.login_activity": {
    tr: "Son Oturum Açma Etkinliği",
    en: "Recent Login Activity",
    ka: "ბოლო შესვლის აქტივობა",
  },
  "profile.date_time": {
    tr: "Tarih & Saat",
    en: "Date & Time",
    ka: "თარიღი & დრო",
  },
  "profile.ip_address": {
    tr: "IP Adresi",
    en: "IP Address",
    ka: "IP მისამართი",
  },
  "profile.device": {
    tr: "Cihaz",
    en: "Device",
    ka: "მოწყობილობა",
  },
  "profile.status_successful": {
    tr: "Başarılı",
    en: "Successful",
    ka: "წარმატებული",
  },
  "profile.status_failed": {
    tr: "Başarısız",
    en: "Failed",
    ka: "წარუმატებელი",
  },
  
  // Finansal İşlemler Sekmesi
  "profile.financial_transactions": {
    tr: "Finansal İşlemler",
    en: "Financial Transactions",
    ka: "ფინანსური ოპერაციები",
  },
  "profile.financial_desc": {
    tr: "Para yatırma ve çekme işlemlerinizi yönetin",
    en: "Manage your deposits and withdrawals",
    ka: "მართეთ თქვენი შენატანები და გატანები",
  },
  "profile.balance_stats": {
    tr: "Bakiye İstatistikleri",
    en: "Balance Statistics",
    ka: "ბალანსის სტატისტიკა",
  },
  "profile.total_deposits": {
    tr: "Toplam Yatırım",
    en: "Total Deposits",
    ka: "ჯამური შენატანები",
  },
  "profile.total_withdrawals": {
    tr: "Toplam Çekim",
    en: "Total Withdrawals",
    ka: "ჯამური გატანები",
  },
  "profile.bonus_balance": {
    tr: "Bonus Bakiye",
    en: "Bonus Balance",
    ka: "ბონუს ბალანსი",
  },
  "profile.recent_transactions": {
    tr: "Son İşlemler",
    en: "Recent Transactions",
    ka: "ბოლო ოპერაციები",
  },
  "profile.transaction_date": {
    tr: "Tarih",
    en: "Date",
    ka: "თარიღი",
  },
  "profile.transaction": {
    tr: "İşlem",
    en: "Transaction",
    ka: "ოპერაცია",
  },
  "profile.transaction_amount": {
    tr: "Miktar",
    en: "Amount",
    ka: "თანხა",
  },
  "profile.transaction_status": {
    tr: "Durum",
    en: "Status",
    ka: "სტატუსი",
  },
  "profile.deposit": {
    tr: "Yatırım",
    en: "Deposit",
    ka: "შენატანი",
  },
  "profile.withdrawal": {
    tr: "Çekim",
    en: "Withdrawal",
    ka: "გატანა",
  },
  "profile.transaction_completed": {
    tr: "Tamamlandı",
    en: "Completed",
    ka: "დასრულებული",
  },
  "profile.transaction_pending": {
    tr: "Beklemede",
    en: "Pending",
    ka: "მიმდინარე",
  },
  "profile.make_deposit": {
    tr: "Para Yatır",
    en: "Make Deposit",
    ka: "შეიტანეთ თანხა",
  },
  "profile.request_withdrawal": {
    tr: "Para Çek",
    en: "Request Withdrawal",
    ka: "მოითხოვეთ გატანა",
  },
  
  // Bahis Geçmişi Sekmesi
  "profile.game_category": {
    tr: "Oyun Kategorisi",
    en: "Game Category",
    ka: "თამაშის კატეგორია",
  },
  "profile.all_games": {
    tr: "Tüm Oyunlar",
    en: "All Games",
    ka: "ყველა თამაში",
  },
  "profile.slots": {
    tr: "Slot",
    en: "Slots",
    ka: "სლოტები",
  },
  "profile.live_casino": {
    tr: "Canlı Casino",
    en: "Live Casino",
    ka: "ცოცხალი კაზინო",
  },
  "profile.table_games": {
    tr: "Masa Oyunları",
    en: "Table Games",
    ka: "სამაგიდო თამაშები",
  },
  "profile.crash": {
    tr: "Crash",
    en: "Crash",
    ka: "Crash",
  },
  "profile.all_filter": {
    tr: "Tümü",
    en: "All",
    ka: "ყველა",
  },
  "profile.show_details": {
    tr: "Göster",
    en: "Show",
    ka: "ჩვენება",
  },
  "profile.multiplier": {
    tr: "Çarpan",
    en: "Multiplier",
    ka: "გამრავლება",
  },
  "profile.showing_entries": {
    tr: "Toplam $1 kayıttan $2-$3 arası gösteriliyor",
    en: "Showing $2-$3 of $1 entries",
    ka: "ნაჩვენებია $2-$3 / $1 ჩანაწერიდან",
  },
  
  // Bonuslar Sekmesi
  "profile.bonuses.total_bonus": {
    tr: "Toplam Bonus",
    en: "Total Bonus",
    ka: "ჯამური ბონუსი",
  },
  "profile.bonuses.completed_bonuses": {
    tr: "Tamamlanan Bonuslar",
    en: "Completed Bonuses",
    ka: "დასრულებული ბონუსები",
  },
  "profile.bonuses.active_bonuses": {
    tr: "Aktif Bonuslar",
    en: "Active Bonuses",
    ka: "აქტიური ბონუსები",
  },
  "profile.bonuses.view_all": {
    tr: "Tüm Bonusları Görüntüle",
    en: "View All Bonuses",
    ka: "ყველა ბონუსის ნახვა",
  },
  "profile.bonuses.welcome_bonus": {
    tr: "Hoşgeldin Bonusu",
    en: "Welcome Bonus",
    ka: "მისასალმებელი ბონუსი",
  },
  "profile.bonuses.first_deposit_bonus": {
    tr: "İlk yatırımınıza özel 100% bonus",
    en: "100% bonus for your first deposit",
    ka: "100% ბონუსი თქვენი პირველი შენატანისთვის",
  },
  "profile.bonuses.days_left": {
    tr: "gün kaldı",
    en: "days left",
    ka: "დღე დარჩა",
  },
  "profile.bonuses.amount": {
    tr: "Miktar:",
    en: "Amount:",
    ka: "თანხა:",
  },
  "profile.bonuses.remaining": {
    tr: "Kalan:",
    en: "Remaining:",
    ka: "დარჩენილი:",
  },
  "profile.bonuses.expiry": {
    tr: "Son kullanma:",
    en: "Expiry:",
    ka: "ვადის გასვლა:",
  },
  "profile.bonuses.wagering": {
    tr: "Çevrim şartı:",
    en: "Wagering:",
    ka: "მოთხოვნა:",
  },
  "profile.bonuses.wagering_completed": {
    tr: "Çevrim Tamamlandı:",
    en: "Wagering Completed:",
    ka: "მოთხოვნა შესრულებულია:",
  },
  "profile.bonuses.use": {
    tr: "Kullan",
    en: "Use",
    ka: "გამოყენება",
  },
  "profile.bonuses.cashback": {
    tr: "Nakit İade Bonusu",
    en: "Cashback Bonus",
    ka: "ქეშბექ ბონუსი",
  },
  "profile.bonuses.weekly_loss": {
    tr: "Haftalık kayıp bonusu 10%",
    en: "Weekly loss bonus 10%",
    ka: "კვირის წაგების ბონუსი 10%",
  },
  "profile.bonuses.bonus_history": {
    tr: "Bonus Geçmişi",
    en: "Bonus History",
    ka: "ბონუსის ისტორია",
  },
  "profile.bonuses.new_offers": {
    tr: "Yeni Bonus Teklifleri",
    en: "New Bonus Offers",
    ka: "ახალი ბონუს შეთავაზებები",
  },
  "profile.bonuses.deposit_bonus": {
    tr: "Yatırım Bonusu",
    en: "Deposit Bonus",
    ka: "შენატანის ბონუსი",
  },
  "profile.bonuses.weekend_bonus": {
    tr: "Hafta Sonu Bonusu",
    en: "Weekend Bonus",
    ka: "შაბათ-კვირის ბონუსი",
  },
  "profile.bonuses.freespin": {
    tr: "Freespin Paketi",
    en: "Freespin Package",
    ka: "უფასო დატრიალების პაკეტი",
  },
  "profile.bonuses.min_deposit": {
    tr: "Min. Yatırım:",
    en: "Min. Deposit:",
    ka: "მინ. შენატანი:",
  },
  "profile.bonuses.details": {
    tr: "Detaylar",
    en: "Details",
    ka: "დეტალები",
  },
  "profile.bonuses.expired": {
    tr: "Sona Erdi",
    en: "Expired",
    ka: "ვადაგასული",
  },
  "profile.bonuses.completed": {
    tr: "Tamamlandı",
    en: "Completed",
    ka: "დასრულებული",
  },
  "profile.bonuses.canceled": {
    tr: "İptal Edildi",
    en: "Canceled",
    ka: "გაუქმებული",
  },

  "header.logout": {
    tr: "Çıkış Yap",
    en: "Logout",
    ka: "გასვლა",
  },
  "notifications.login_success": {
    tr: "Başarıyla giriş yaptınız! Hoş geldiniz!",
    en: "Successfully logged in! Welcome!",
    ka: "წარმატებით შეხვედით! კეთილი იყოს თქვენი მობრძანება!",
  },
  "notifications.register_success": {
    tr: "Hesabınız başarıyla oluşturuldu! Hoş geldiniz!",
    en: "Your account has been successfully created! Welcome!",
    ka: "თქვენი ანგარიში წარმატებით შეიქმნა! კეთილი იყოს თქვენი მობრძანება!",
  },
  "notifications.logout_success": {
    tr: "Başarıyla çıkış yaptınız. Tekrar görüşmek üzere!",
    en: "Successfully logged out. See you again soon!",
    ka: "წარმატებით გამოხვედით. მალე შევხვდებით!",
  },

  "slider.vip_title": {
    tr: "VIP ÜYELİK",
    en: "VIP MEMBERSHIP",
    ka: "VIP წევრობა",
  },
  "slider.vip_description": {
    tr: "Özel VIP avantajlarını keşfedin",
    en: "Discover special VIP advantages",
    ka: "აღმოაჩინეთ VIP უპირატესობები",
  },
  "slider.join_now": {
    tr: "VIP OL",
    en: "JOIN VIP",
    ka: "VIP გახდი",
  },
  
  // Banner metinleri güncellenmiş
  "banner.become_vip": {
    tr: "VIP OL",
    en: "BECOME VIP",
    ka: "VIP გახდი",
  },
  "banner.details": {
    tr: "DETAY",
    en: "DETAILS",
    ka: "დეტალები",
  },
  "banner.limited_offers": {
    tr: "Sınırlı süre teklifleri",
    en: "Limited time offers",
    ka: "შეზღუდული დროის შეთავაზებები",
  },
  "banner.detail_button": {
    tr: "DETAY",
    en: "DETAIL",
    ka: "დეტალი",
  },
  
  // Site özellikleri başlık
  "site.features": {
    tr: "SİTE ÖZELLİKLERİ",
    en: "SITE FEATURES",
    ka: "საიტის მახასიათებლები",
  },
  
  // Liderlik tablosu başlık
  "leaderboard.title": {
    tr: "LİDERLİK TABLOSU",
    en: "LEADERBOARD",
    ka: "ლიდერბორდი",
  },
  
  // Slot oyunları ek
  "home.popularSlots.allGames": {
    tr: "Tüm Oyunlar",
    en: "All Games",
    ka: "ყველა თამაში",
  },
  "home.popularSlots.allGamesButton": {
    tr: "Tümünü Gör",
    en: "View All",
    ka: "ყველას ნახვა",
  },
  "home.popularSlots.newGames": {
    tr: "Yeni Oyunlar",
    en: "New Games",
    ka: "ახალი თამაშები",
  },
  "home.popularSlots.info": {
    tr: "En popüler slot oyunlarını keşfedin",
    en: "Discover the most popular slot games",
    ka: "აღმოაჩინეთ ყველაზე პოპულარული სლოტ თამაშები",
  },
  "home.popularSlots.play": {
    tr: "OYNA",
    en: "PLAY",
    ka: "თამაში",
  },
  
  // Casino oyunları ek
  "home.popularCasino.allGames": {
    tr: "Tüm Oyunlar",
    en: "All Games",
    ka: "ყველა თამაში",
  },
  "home.popularCasino.popularGames": {
    tr: "Popüler Oyunlar",
    en: "Popular Games",
    ka: "პოპულარული თამაშები",
  },
  "home.popularCasino.vipTables": {
    tr: "VIP Masalar",
    en: "VIP Tables",
    ka: "VIP მაგიდები",
  },
  "home.popularCasino.info": {
    tr: "Canlı casino oyunlarında gerçek krupiyelerle oynayın",
    en: "Play with real dealers in live casino games",
    ka: "ითამაშეთ ნამდვილ დილერებთან ლაივ კაზინო თამაშებში",
  },
  "home.popularCasino.live": {
    tr: "CANLI",
    en: "LIVE",
    ka: "ცოცხალი",
  },
  "home.popularCasino.play": {
    tr: "OYNA",
    en: "PLAY",
    ka: "თამაში",
  },
  
  // Finans sağlayıcıları ek
  "home.financeProviders.secure": {
    tr: "GÜVENLİ",
    en: "SECURE",
    ka: "უსაფრთხო",
  },
  "home.financeProviders.fast": {
    tr: "HIZLI",
    en: "FAST",
    ka: "სწრაფი",
  },
  
  // Lisans ek
  "home.license.name": {
    tr: "Anjuan Gaming",
    en: "Anjuan Gaming",
    ka: "Anjuan Gaming",
  },
  "home.license.verify": {
    tr: "LİSANSI DOĞRULA",
    en: "VERIFY LICENSE",
    ka: "ლიცენზიის გადამოწმება",
  },
  
  // VIP Sayfası Çevirileri
  "vip.title": {
    tr: "VIP KULÜP",
    en: "VIP CLUB",
    ka: "VIP კლუბი",
  },
  "vip.exclusive": {
    tr: "ÖZEL ÜYELİK",
    en: "EXCLUSIVE MEMBERSHIP",
    ka: "ექსკლუზიური წევრობა",
  },
  "vip.join_now": {
    tr: "HEMEN KATIL",
    en: "JOIN NOW",
    ka: "ახლავე შეუერთდით",
  },
  "vip.elite_member": {
    tr: "ELİT ÜYELİK",
    en: "ELITE MEMBERSHIP",
    ka: "ელიტური წევრობა",
  },
  "vip.privileged": {
    tr: "AYRICALIKLI",
    en: "PRIVILEGED",
    ka: "პრივილეგირებული",
  },
  "vip.description": {
    tr: "Ayrıcalıkların dünyasına hoş geldiniz! Cryptonbets VIP Kulübü, sadık oyunculara özel avantajlar, kişiselleştirilmiş bonuslar ve premium ödüller sunuyor.",
    en: "Welcome to the world of privileges! Cryptonbets VIP Club offers exclusive advantages, personalized bonuses and premium rewards to loyal players.",
    ka: "კეთილი იყოს თქვენი მობრძანება პრივილეგიების სამყაროში! Cryptonbets VIP კლუბი გთავაზობთ ექსკლუზიურ უპირატესობებს, პერსონალიზებულ ბონუსებს და პრემიუმ ჯილდოებს ერთგული მოთამაშეებისთვის.",
  },
  "vip.sub_description": {
    tr: "VIP seviyenizi yükseltin, daha yüksek bonuslar kazanın ve kişisel VIP yöneticinizden özel hizmetlerin keyfini çıkarın. Cryptonbets'te VIP olmak, oyun deneyiminizi tamamen değiştirir ve sizlere ayrıcalıklı bir dünya sunar.",
    en: "Raise your VIP level, earn higher bonuses, and enjoy personalized services from your dedicated VIP manager. Being a VIP at Cryptonbets completely transforms your gaming experience and offers you a privileged world.",
    ka: "აიმაღლეთ თქვენი VIP დონე, მიიღეთ უფრო მაღალი ბონუსები და ისიამოვნეთ პერსონალიზებული მომსახურებით თქვენი VIP მენეჯერისგან. VIP სტატუსი Cryptonbets-ზე სრულიად გარდაქმნის თქვენს სათამაშო გამოცდილებას და გთავაზობთ პრივილეგირებულ სამყაროს.",
  },
  "vip.level": {
    tr: "Seviye",
    en: "Level",
    ka: "დონე",
  },
  "vip.progress": {
    tr: "İlerleme",
    en: "Progress",
    ka: "პროგრესი",
  },
  "vip.level_description": {
    tr: "{{level}} seviyesi ayrıcalıkları keşfedin",
    en: "Discover {{level}} level privileges",
    ka: "აღმოაჩინეთ {{level}} დონის პრივილეგიები",
  },
  "vip.next_level_info": {
    tr: "Bir sonraki seviye: {{level}}",
    en: "Next level: {{level}}",
    ka: "შემდეგი დონე: {{level}}",
  },
  "vip.max_level": {
    tr: "En yüksek seviyedesiniz!",
    en: "You are at the highest level!",
    ka: "თქვენ ხართ უმაღლეს დონეზე!",
  },
  "vip.upgrade_requirements": {
    tr: "Seviye Yükseltme Gereksinimleri",
    en: "Level Upgrade Requirements",
    ka: "დონის განახლების მოთხოვნები",
  },
  "vip.deposit_amount": {
    tr: "Toplam Yatırım",
    en: "Total Deposit",
    ka: "ჯამური დეპოზიტი",
  },
  "vip.next_deposit": {
    tr: "Sonraki Seviye İçin Gereken",
    en: "Required for Next Level",
    ka: "მოთხოვნილი შემდეგი დონისთვის",
  },
  "vip.benefits.title": {
    tr: "VIP Avantajları",
    en: "VIP Benefits",
    ka: "VIP უპირატესობები",
  },
  "vip.benefits.cashback": {
    tr: "Haftalık kayıp bonusu",
    en: "Weekly cashback bonus",
    ka: "ყოველკვირეული ქეშბექ ბონუსი",
  },
  "vip.benefits.support": {
    tr: "7/24 VIP destek",
    en: "24/7 VIP support",
    ka: "24/7 VIP მხარდაჭერა",
  },
  "vip.benefits.basic_withdrawals": {
    tr: "5.000₺'e kadar hızlı çekim",
    en: "Fast withdrawals up to 5,000₺",
    ka: "სწრაფი გატანები 5,000₺-მდე",
  },
  "vip.benefits.medium_withdrawals": {
    tr: "10.000₺'e kadar hızlı çekim",
    en: "Fast withdrawals up to 10,000₺",
    ka: "სწრაფი გატანები 10,000₺-მდე",
  },
  "vip.benefits.high_withdrawals": {
    tr: "25.000₺'e kadar hızlı çekim",
    en: "Fast withdrawals up to 25,000₺",
    ka: "სწრაფი გატანები 25,000₺-მდე",
  },
  "vip.benefits.ultra_withdrawals": {
    tr: "50.000₺'e kadar hızlı çekim",
    en: "Fast withdrawals up to 50,000₺",
    ka: "სწრაფი გატანები 50,000₺-მდე",
  },
  "vip.benefits.unlimited_withdrawals": {
    tr: "Limitsiz hızlı çekim",
    en: "Unlimited fast withdrawals",
    ka: "შეუზღუდავი სწრაფი გატანები",
  },
  "vip.benefits.birthday_bonus": {
    tr: "Doğum günü bonusu",
    en: "Birthday bonus",
    ka: "დაბადების დღის ბონუსი",
  },
  "vip.benefits.premium_birthday": {
    tr: "Premium doğum günü bonusu",
    en: "Premium birthday bonus",
    ka: "პრემიუმ დაბადების დღის ბონუსი",
  },
  "vip.benefits.reload_bonus": {
    tr: "Haftalık yeniden yükleme bonusu",
    en: "Weekly reload bonus",
    ka: "ყოველკვირეული დამატებითი ბონუსი",
  },
  "vip.benefits.vip_reload_bonus": {
    tr: "Günlük VIP yeniden yükleme bonusu",
    en: "Daily VIP reload bonus",
    ka: "ყოველდღიური VIP დამატებითი ბონუსი",
  },
  "vip.benefits.exclusive_events": {
    tr: "Özel VIP etkinlikleri",
    en: "Exclusive VIP events",
    ka: "ექსკლუზიური VIP ღონისძიებები",
  },
  "vip.benefits.custom_bonuses": {
    tr: "Kişiye özel bonuslar",
    en: "Custom bonuses",
    ka: "ინდივიდუალური ბონუსები",
  },
  "vip.benefits.priority_support": {
    tr: "Öncelikli VIP desteği",
    en: "Priority VIP support",
    ka: "პრიორიტეტული VIP მხარდაჭერა",
  },
  "vip.benefits.vip_support": {
    tr: "Kişisel VIP destek ekibi",
    en: "Personal VIP support team",
    ka: "პირადი VIP მხარდაჭერის გუნდი",
  },
  "vip.benefits.vip_cashback": {
    tr: "Yüksek oranlı özel VIP kayıp bonusu",
    en: "High-rate special VIP cashback bonus",
    ka: "მაღალი განაკვეთის სპეციალური VIP ქეშბექ ბონუსი",
  },
  "vip.cashback": {
    tr: "Kayıp Bonusu",
    en: "Cashback",
    ka: "ქეშბექი",
  },
  "vip.weekly_cashback": {
    tr: "Haftalık kayıp bonusu oranı",
    en: "Weekly cashback rate",
    ka: "ყოველკვირეული ქეშბექის განაკვეთი",
  },
  "vip.bonus_rate": {
    tr: "Bonus Oranı",
    en: "Bonus Rate",
    ka: "ბონუსის განაკვეთი",
  },
  "vip.deposit_bonus": {
    tr: "Yatırım bonusu oranı",
    en: "Deposit bonus rate",
    ka: "დეპოზიტის ბონუსის განაკვეთი",
  },
  "vip.gift_points": {
    tr: "Hediye Puanları",
    en: "Gift Points",
    ka: "საჩუქრის ქულები",
  },
  "vip.monthly_points": {
    tr: "Aylık hediye puanları",
    en: "Monthly gift points",
    ka: "ყოველთვიური საჩუქრის ქულები",
  },
  "vip.contact_manager": {
    tr: "VIP YÖNETİCİNİZLE İLETİŞİME GEÇİN",
    en: "CONTACT YOUR VIP MANAGER",
    ka: "დაუკავშირდით თქვენს VIP მენეჯერს",
  },
  "vip.upgrade_now": {
    tr: "ŞİMDİ YÜKSELTİN",
    en: "UPGRADE NOW",
    ka: "განაახლეთ ახლა",
  },
  "vip.claim_benefits": {
    tr: "AVANTAJLARI TALEP ET",
    en: "CLAIM BENEFITS",
    ka: "მიიღეთ უპირატესობები",
  },
  "vip.advantages.title": {
    tr: "VIP Üyeliğin Avantajları",
    en: "Advantages of VIP Membership",
    ka: "VIP წევრობის უპირატესობები",
  },
  "vip.advantages.description": {
    tr: "VIP üyelerimiz için sunduğumuz özel avantajlara göz atın.",
    en: "Check out the exclusive advantages we offer for our VIP members.",
    ka: "გაეცანით ექსკლუზიურ უპირატესობებს, რომლებსაც ვთავაზობთ ჩვენს VIP წევრებს.",
  },
  "vip.advantages.higher_limits": {
    tr: "Daha Yüksek Limitler",
    en: "Higher Limits",
    ka: "უფრო მაღალი ლიმიტები",
  },
  "vip.advantages.higher_limits_desc": {
    tr: "VIP üyelerimiz daha yüksek yatırım ve çekim limitlerine sahiptir, böylece oyun deneyiminizi kısıtlamadan yaşayabilirsiniz.",
    en: "Our VIP members have higher deposit and withdrawal limits so you can experience your gaming without restrictions.",
    ka: "ჩვენს VIP წევრებს აქვთ უფრო მაღალი დეპოზიტისა და გატანის ლიმიტები, ასე რომ შეგიძლიათ გამოსცადოთ თქვენი თამაში შეზღუდვების გარეშე.",
  },
  "vip.advantages.dedicated_support": {
    tr: "Özel Destek",
    en: "Dedicated Support",
    ka: "სპეციალური მხარდაჭერა",
  },
  "vip.advantages.dedicated_support_desc": {
    tr: "Kişisel VIP yöneticiniz 7/24 hizmetinizdedir ve tüm sorularınızda size özel destek sağlar.",
    en: "Your personal VIP manager is at your service 24/7, providing you with dedicated support for all your inquiries.",
    ka: "თქვენი პირადი VIP მენეჯერი თქვენს სამსახურშია 24/7, გაწვდით სპეციალურ დახმარებას თქვენი ყველა შეკითხვისთვის.",
  },
  "vip.advantages.exclusive_bonuses": {
    tr: "Özel Bonuslar",
    en: "Exclusive Bonuses",
    ka: "ექსკლუზიური ბონუსები",
  },
  "vip.advantages.exclusive_bonuses_desc": {
    tr: "VIP üyelerimize özel olarak tasarlanmış yüksek oranlı bonuslar ve promosyonlar sunuyoruz.",
    en: "We offer high-rate bonuses and promotions designed exclusively for our VIP members.",
    ka: "ჩვენ გთავაზობთ მაღალი განაკვეთის ბონუსებსა და აქციებს, რომლებიც შექმნილია ექსკლუზიურად ჩვენი VIP წევრებისთვის.",
  },
  "vip.advantages.faster_withdrawals": {
    tr: "Daha Hızlı Çekimler",
    en: "Faster Withdrawals",
    ka: "სწრაფი გატანები",
  },
  "vip.advantages.faster_withdrawals_desc": {
    tr: "VIP üyeler çekim işlemlerinde önceliklidir ve kazançlarını daha hızlı alırlar.",
    en: "VIP members have priority in withdrawal transactions and receive their winnings faster.",
    ka: "VIP წევრებს აქვთ პრიორიტეტი თანხის გატანის ოპერაციებში და უფრო სწრაფად იღებენ მოგებას.",
  },
  "vip.advantages.special_events": {
    tr: "Özel Etkinlikler",
    en: "Special Events",
    ka: "სპეციალური ღონისძიებები",
  },
  "vip.advantages.special_events_desc": {
    tr: "VIP üyelerimizi özel turnuvalara, etkinliklere ve daha fazlasına davet ediyoruz.",
    en: "We invite our VIP members to exclusive tournaments, events, and more.",
    ka: "ჩვენ ვიწვევთ ჩვენს VIP წევრებს ექსკლუზიურ ტურნირებზე, ღონისძიებებზე და ა.შ.",
  },
  "vip.advantages.birthday_gifts": {
    tr: "Doğum Günü Hediyeleri",
    en: "Birthday Gifts",
    ka: "დაბადების დღის საჩუქრები",
  },
  "vip.advantages.birthday_gifts_desc": {
    tr: "Doğum gününüzde sizin için özel bonuslar ve sürprizler hazırlıyoruz.",
    en: "We prepare special bonuses and surprises for you on your birthday.",
    ka: "ჩვენ ვამზადებთ სპეციალურ ბონუსებს და სიურპრიზებს თქვენთვის თქვენს დაბადების დღეზე.",
  },
  "vip.missions.title": {
    tr: "VIP Görevleri ve Hedefler",
    en: "VIP Missions and Goals",
    ka: "VIP მისიები და მიზნები",
  },
  "vip.missions.description": {
    tr: "Bu özel görevleri tamamlayarak VIP seviyenizi yükseltin ve premium avantajlarınızı artırın. Her görev size daha fazla ödül ve ayrıcalık kazandırır.",
    en: "Complete these special missions to level up your VIP status and increase your premium benefits. Each mission earns you more rewards and privileges.",
    ka: "შეასრულეთ ეს სპეციალური მისიები თქვენი VIP სტატუსის ასამაღლებლად და პრემიუმ უპირატესობების გასაზრდელად. თითოეული მისია გაძლევთ მეტ ჯილდოს და პრივილეგიებს.",
  },
  "vip.missions.deposit_title": {
    tr: "5 Günlük Yatırım Yapın",
    en: "Make Deposits for 5 Days",
    ka: "გააკეთეთ დეპოზიტები 5 დღის განმავლობაში",
  },
  "vip.missions.deposit_desc": {
    tr: "5 gün üst üste en az 100₺ yatırım yapın ve ekstra 1000 VIP puanı kazanın.",
    en: "Deposit at least 100₺ for 5 consecutive days and earn an extra 1000 VIP points.",
    ka: "განათავსეთ მინიმუმ 100₺ 5 დღის განმავლობაში და მიიღეთ დამატებითი 1000 VIP ქულა.",
  },
  "vip.missions.casino_title": {
    tr: "Canlı Casino'da Oynayın",
    en: "Play in Live Casino",
    ka: "ითამაშეთ Live Casino-ში",
  },
  "vip.missions.casino_desc": {
    tr: "3 farklı canlı casino oyununda en az 15 dakika oynayın ve %10 özel bonus kazanın.",
    en: "Play at least 15 minutes in 3 different live casino games and earn a 10% special bonus.",
    ka: "ითამაშეთ მინიმუმ 15 წუთი 3 სხვადასხვა ლაივ კაზინოს თამაშში და მიიღეთ 10% სპეციალური ბონუსი.",
  },
  "vip.missions.refer_title": {
    tr: "Arkadaşlarınızı Davet Edin",
    en: "Invite Your Friends",
    ka: "მოიწვიეთ თქვენი მეგობრები",
  },
  "vip.missions.refer_desc": {
    tr: "3 arkadaşınızı Cryptonbets'e davet edin ve her biri için 500 VIP puanı kazanın.",
    en: "Invite 3 friends to Cryptonbets and earn 500 VIP points for each one.",
    ka: "მოიწვიეთ 3 მეგობარი Cryptonbets-ზე და მიიღეთ 500 VIP ქულა თითოეულისთვის.",
  },
  "vip.claim_rewards": {
    tr: "ÖDÜLLERİ TALEP ET",
    en: "CLAIM REWARDS",
    ka: "მოითხოვეთ ჯილდოები",
  },
  "vip.faq.title": {
    tr: "Sık Sorulan Sorular",
    en: "Frequently Asked Questions",
    ka: "ხშირად დასმული კითხვები",
  },
  "vip.faq.description": {
    tr: "VIP programımız hakkında merak edilen soruların cevaplarını burada bulabilirsiniz.",
    en: "You can find answers to commonly asked questions about our VIP program here.",
    ka: "აქ შეგიძლიათ იპოვოთ პასუხები ხშირად დასმულ კითხვებზე ჩვენი VIP პროგრამის შესახებ.",
  },
  "vip.faq.question1": {
    tr: "VIP programına nasıl katılabilirim?",
    en: "How can I join the VIP program?",
    ka: "როგორ შემიძლია შევუერთდე VIP პროგრამას?",
  },
  "vip.faq.answer1": {
    tr: "VIP programımıza katılmak için belirli bir yatırım miktarına ulaşmanız yeterlidir. Bronze seviyesine ulaştığınızda otomatik olarak VIP üyesi olursunuz.",
    en: "To join our VIP program, you just need to reach a certain deposit amount. Once you reach the Bronze level, you automatically become a VIP member.",
    ka: "ჩვენს VIP პროგრამაში შესასვლელად, თქვენ უბრალოდ უნდა მიაღწიოთ დეპოზიტის გარკვეულ რაოდენობას. როგორც კი მიაღწევთ ბრონზის დონეს, ავტომატურად ხდებით VIP წევრი.",
  },
  "vip.faq.question2": {
    tr: "VIP seviyemi nasıl yükseltebilirim?",
    en: "How can I upgrade my VIP level?",
    ka: "როგორ შემიძლია ავწიო ჩემი VIP დონე?",
  },
  "vip.faq.answer2": {
    tr: "VIP seviyenizi yükseltmek için belirli yatırım miktarlarına ulaşmanız gerekir. Her seviyenin gereksinimleri VIP sayfasında belirtilmiştir.",
    en: "To upgrade your VIP level, you need to reach certain deposit amounts. The requirements for each level are specified on the VIP page.",
    ka: "თქვენი VIP დონის ასაწევად, თქვენ უნდა მიაღწიოთ დეპოზიტის გარკვეულ რაოდენობას. თითოეული დონის მოთხოვნები მითითებულია VIP გვერდზე.",
  },
  "vip.faq.question3": {
    tr: "VIP programının faydaları nelerdir?",
    en: "What are the benefits of the VIP program?",
    ka: "რა არის VIP პროგრამის უპირატესობები?",
  },
  "vip.faq.answer3": {
    tr: "VIP programımız, özel bonuslar, daha yüksek çekim limitleri, kişisel VIP yöneticisi, özel etkinlikler ve daha fazlasını içerir. Seviyeniz yükseldikçe avantajlarınız da artar.",
    en: "Our VIP program includes exclusive bonuses, higher withdrawal limits, personal VIP manager, special events, and more. As your level increases, so do your benefits.",
    ka: "ჩვენი VIP პროგრამა მოიცავს ექსკლუზიურ ბონუსებს, უფრო მაღალ გატანის ლიმიტებს, პირად VIP მენეჯერს, სპეციალურ ღონისძიებებს და ა.შ. თქვენი დონის ზრდასთან ერთად იზრდება თქვენი სარგებელიც.",
  },
  "vip.faq.question4": {
    tr: "VIP puanlarımı nasıl kullanabilirim?",
    en: "How can I use my VIP points?",
    ka: "როგორ შემიძლია გამოვიყენო ჩემი VIP ქულები?",
  },
  "vip.faq.answer4": {
    tr: "VIP puanlarınızı bonus nakit, freespin veya özel promosyonlar için kullanabilirsiniz. Ayrıntılar için VIP yöneticinizle iletişime geçin.",
    en: "You can use your VIP points for bonus cash, free spins, or special promotions. Contact your VIP manager for details.",
    ka: "შეგიძლიათ გამოიყენოთ თქვენი VIP ქულები ბონუს ნაღდი ფულისთვის, უფასო ტრიალებისთვის ან სპეციალური აქციებისთვის. დეტალებისთვის დაუკავშირდით თქვენს VIP მენეჯერს.",
  },
  "vip.cta.title": {
    tr: "HEMEN VIP'E KATIL",
    en: "JOIN VIP NOW",
    ka: "შეუერთდით VIP-ს ახლავე",
  },
  "vip.cta.description": {
    tr: "Eşsiz avantajlar ve özel hizmetlerle dolu VIP dünyasına adım atın!",
    en: "Step into the VIP world filled with unique advantages and premium services!",
    ka: "შეაბიჯეთ VIP სამყაროში, რომელიც სავსეა უნიკალური უპირატესობებით და პრემიუმ სერვისებით!",
  },
  "vip.cta.contact_us": {
    tr: "BİZE ULAŞIN",
    en: "CONTACT US",
    ka: "დაგვიკავშირდით",
  },
  "vip.cta.join_now": {
    tr: "ŞİMDİ KATIL",
    en: "JOIN NOW",
    ka: "შეუერთდით ახლავე",
  }
};

// Belirli bir çeviri anahtarını seçili dile göre çevirir
export const t = (key: string, overrideLanguage?: Language): string => {
  // Kullanılan dili belirle: ya verilen dil ya da mevcut dil
  const language = overrideLanguage || getCurrentLanguage();
  
  // Çeviri anahtarı translations içinde varsa çeviriyi döndürür, yoksa anahtarın kendisini döndürür
  if (translations[key] && translations[key][language]) {
    return translations[key][language];
  }
  
  // Eğer çeviri bulunamadıysa Türkçe'yi dene (varsayılan dil)
  if (translations[key] && translations[key]['tr']) {
    return translations[key]['tr'];
  }
  
  // Eşleşen çeviri bulunamazsa, anahtar adını döndür (geliştirme amaçlı)
  console.warn(`Translation missing for key: ${key} in language: ${language}`);
  return key;
};

// Dil değiştirme fonksiyonu
export const changeLanguage = (language: Language): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('cryptonbets-language', language);
  }
};

// Mevcut dili alma fonksiyonu
export const getCurrentLanguage = (): Language => {
  if (typeof window !== 'undefined') {
    const savedLanguage = localStorage.getItem('cryptonbets-language') as Language | null;
    if (savedLanguage && ['tr', 'en', 'ka', 'ru'].includes(savedLanguage)) {
      return savedLanguage;
    }
  }
  return 'tr'; // Varsayılan dil Türkçe
};

// Bonuslar sayfası çevirileri - temel çeviriler
// NOT: Bonuslar sayfası için tüm çeviriler bonusTranslations.ts dosyasına taşınmıştır.
translations["bonuses.title"] = {
  tr: "BONUSLAR",
  en: "BONUSES",
  ka: "ბონუსები",
};
translations["bonuses.description"] = {
  tr: "En cazip kampanyalar ve bonuslar ile kazançlarınızı artırın",
  en: "Increase your earnings with the most attractive promotions and bonuses",
  ka: "გაზარდეთ თქვენი შემოსავალი ყველაზე მიმზიდველი აქციებით და ბონუსებით",
};
translations["bonuses.view_details"] = {
  tr: "DETAYLARI GÖR",
  en: "VIEW DETAILS",
  ka: "დეტალების ნახვა",
};
translations["bonuses.no_bonuses"] = {
  tr: "Şu anda bu kategoride mevcut bonus bulunmamaktadır.",
  en: "There are currently no bonuses available in this category.",
  ka: "ამ კატეგორიაში ამჟამად ბონუსები არ არის ხელმისაწვდომი.",
};
translations["bonuses.claim_now"] = {
  tr: "HEMEN TALEP ET",
  en: "CLAIM NOW",
  ka: "ახლავე მოითხოვეთ",
};
translations["bonuses.vip_bonuses"] = {
  tr: "VIP BONUSLARI",
  en: "VIP BONUSES",
  ka: "VIP ბონუსები",
};
translations["bonuses.filter_by_type"] = {
  tr: "BONUS TİPİNE GÖRE FİLTRELE",
  en: "FILTER BY BONUS TYPE",
  ka: "ფილტრი ბონუსის ტიპის მიხედვით",
};
translations["bonuses.all_bonuses"] = {
  tr: "TÜM BONUSLAR",
  en: "ALL BONUSES",
  ka: "ყველა ბონუსი",
};
translations["bonuses.bonuses"] = {
  tr: "BONUSLARI",
  en: "BONUSES",
  ka: "ბონუსები",
};
translations["bonuses.search_placeholder"] = {
  tr: "Bonus ara...",
  en: "Search for bonuses...",
  ka: "ბონუსების ძიება...",
};
translations["bonuses.no_results"] = {
  tr: "Aradığınız kriterlere uygun bonus bulunamadı",
  en: "No bonuses found matching your criteria",
  ka: "თქვენი კრიტერიუმების შესაბამისი ბონუსები ვერ მოიძებნა",
};
translations["bonuses.try_different"] = {
  tr: "Farklı filtreleme seçenekleriyle tekrar deneyin veya tüm bonusları görüntüleyin",
  en: "Try again with different filtering options or view all bonuses",
  ka: "სცადეთ ხელახლა განსხვავებული ფილტრის პარამეტრებით ან იხილეთ ყველა ბონუსი",
};
translations["bonuses.show_more"] = {
  tr: "Daha Fazla Göster",
  en: "Show More",
  ka: "მეტის ჩვენება",
};
translations["bonuses.show_less"] = {
  tr: "Daha Az Göster",
  en: "Show Less",
  ka: "ნაკლების ჩვენება",
};
translations["bonuses.hot"] = {
  tr: "POPÜLER",
  en: "HOT",
  ka: "პოპულარული",
};
translations["bonuses.rules_title"] = {
  tr: "Bonus Kuralları",
  en: "Bonus Rules",
  ka: "ბონუსის წესები",
};
translations["bonuses.claim"] = {
  tr: "BONUSU TALEP ET",
  en: "CLAIM BONUS",
  ka: "ბონუსის მოთხოვნა",
};
translations["bonuses.close"] = {
  tr: "KAPAT",
  en: "CLOSE",
  ka: "დახურვა",
};
translations["bonuses.stats.active_bonuses"] = {
  tr: "Aktif Bonus",
  en: "Active Bonuses",
  ka: "აქტიური ბონუსები",
};
translations["bonuses.stats.support"] = {
  tr: "Destek Hattı",
  en: "Support Line",
  ka: "მხარდაჭერის ხაზი",
};
translations["bonuses.stats.bonus_given"] = {
  tr: "Verilen Bonus",
  en: "Bonus Given",
  ka: "გაცემული ბონუსი",
};
translations["bonuses.stats.satisfaction"] = {
  tr: "Müşteri Memnuniyeti",
  en: "Customer Satisfaction",
  ka: "მომხმარებელთა კმაყოფილება",
};
translations["bonuses.sort.newest"] = {
  tr: "En Yeniler",
  en: "Newest",
  ka: "უახლესი",
};
translations["bonuses.sort.amount"] = {
  tr: "Bonus Miktarı",
  en: "Bonus Amount",
  ka: "ბონუსის ოდენობა",
};
translations["bonuses.sort.popularity"] = {
  tr: "Popülerlik",
  en: "Popularity",
  ka: "პოპულარობა",
};
translations["bonuses.faq.subtitle"] = {
  tr: "SIKÇA SORULAN SORULAR",
  en: "FREQUENTLY ASKED QUESTIONS",
  ka: "ხშირად დასმული კითხვები",
};
translations["bonuses.faq.title"] = {
  tr: "Bonus Kuralları Hakkında Merak Edilenler",
  en: "Questions About Bonus Rules",
  ka: "კითხვები ბონუსის წესების შესახებ",
};
translations["bonuses.faq.description"] = {
  tr: "Bonuslar hakkında en çok sorulan sorulara yanıtlarımızı bulun ve bonuslarınızı en verimli şekilde kullanın.",
  en: "Find answers to the most frequently asked questions about bonuses and use your bonuses most efficiently.",
  ka: "იპოვეთ პასუხები ყველაზე ხშირად დასმულ კითხვებზე ბონუსების შესახებ და გამოიყენეთ თქვენი ბონუსები ყველაზე ეფექტურად.",
};
translations["bonuses.faq.q1"] = {
  tr: "Çevrim şartı nedir?",
  en: "What is wagering requirement?",
  ka: "რა არის ფსონის მოთხოვნა?",
};
translations["bonuses.faq.a1"] = {
  tr: "Çevrim şartı, bir bonusu çekebilmeniz için bonusu kaç kez oynamanız gerektiğini belirtir. Örneğin, 40x çevrim şartı olan 100₺ bonusu çekebilmek için 4,000₺'lik bahis yapmanız gerekir.",
  en: "Wagering requirement specifies how many times you need to play a bonus before you can withdraw it. For example, to withdraw a 100₺ bonus with a 40x wagering requirement, you need to place bets worth 4,000₺.",
  ka: "ფსონის მოთხოვნა განსაზღვრავს, რამდენჯერ უნდა ითამაშოთ ბონუსი, სანამ მის გატანას შეძლებთ. მაგალითად, 100₺ ბონუსის გასატანად 40x ფსონის მოთხოვნით, საჭიროა 4,000₺ ღირებულების ფსონების განთავსება.",
};
translations["bonuses.faq.q2"] = {
  tr: "Bonusları nasıl talep edebilirim?",
  en: "How can I claim bonuses?",
  ka: "როგორ შემიძლია ბონუსების მოთხოვნა?",
};
translations["bonuses.faq.a2"] = {
  tr: "Bonusları talep etmek için hesabınıza giriş yapın, Bonuslar sayfasına gidin ve talep etmek istediğiniz bonusu seçin. Bazı bonuslar otomatik olarak hesabınıza eklenir, bazıları için ise bonus kodu girmeniz gerekebilir.",
  en: "To claim bonuses, log in to your account, go to the Bonuses page, and select the bonus you want to claim. Some bonuses are added to your account automatically, while others may require you to enter a bonus code.",
  ka: "ბონუსების მოსათხოვნად, შედით თქვენს ანგარიშზე, გადადით ბონუსების გვერდზე და აირჩიეთ ბონუსი, რომლის მოთხოვნაც გსურთ. ზოგიერთი ბონუსი ავტომატურად ემატება თქვენს ანგარიშს, ზოგისთვის კი შეიძლება საჭირო იყოს ბონუს კოდის შეყვანა.",
};
translations["bonuses.faq.q3"] = {
  tr: "Aynı anda birden fazla bonus kullanabilir miyim?",
  en: "Can I use multiple bonuses at the same time?",
  ka: "შემიძლია ერთდროულად რამდენიმე ბონუსის გამოყენება?",
};
translations["bonuses.faq.a3"] = {
  tr: "Genellikle aynı anda sadece bir bonus aktif olabilir. Bir bonusu kullanırken diğer bonusları talep edebilirsiniz, ancak bunlar mevcut bonusunuzu tamamlayana kadar bekleme listesinde kalacaktır.",
  en: "Usually, only one bonus can be active at a time. You can claim other bonuses while using one, but they will remain in a waiting list until you complete your current bonus.",
  ka: "ჩვეულებრივ, ერთ დროს მხოლოდ ერთი ბონუსი შეიძლება იყოს აქტიური. შეგიძლიათ მოითხოვოთ სხვა ბონუსები ერთის გამოყენებისას, მაგრამ ისინი დარჩებიან მოლოდინის სიაში, სანამ თქვენს მიმდინარე ბონუსს დაასრულებთ.",
};
translations["bonuses.faq.q4"] = {
  tr: "Bonusları çekmek için zaman sınırı var mı?",
  en: "Is there a time limit to withdraw bonuses?",
  ka: "არის დროის ლიმიტი ბონუსების გასატანად?",
};
translations["bonuses.faq.a4"] = {
  tr: "Evet, her bonusun belirli bir süresi vardır. Bu süre genellikle 7-30 gün arasında değişir ve bu süre içinde çevrim şartlarını tamamlamanız gerekir. Bonusun detaylarında bu bilgiyi bulabilirsiniz.",
  en: "Yes, each bonus has a specific time period. This period usually varies between 7-30 days, and you need to complete the wagering requirements within this time. You can find this information in the bonus details.",
  ka: "დიახ, თითოეულ ბონუსს აქვს კონკრეტული დროის პერიოდი. ეს პერიოდი ჩვეულებრივ მერყეობს 7-30 დღეს შორის და თქვენ უნდა შეასრულოთ ფსონის მოთხოვნები ამ დროის განმავლობაში. ამ ინფორმაციას შეგიძლიათ იპოვოთ ბონუსის დეტალებში.",
};
translations["bonuses.cta.title"] = {
  tr: "Özel VIP Bonuslarına Erişin",
  en: "Access Exclusive VIP Bonuses",
  ka: "წვდომა ექსკლუზიურ VIP ბონუსებზე",
};
translations["bonuses.cta.description"] = {
  tr: "VIP programımıza katılın ve sadece elit üyelerimize özel bonuslardan yararlanın. Daha yüksek limitler, kişiselleştirilmiş teklifler ve çok daha fazlası sizi bekliyor!",
  en: "Join our VIP program and take advantage of bonuses exclusive to our elite members. Higher limits, personalized offers, and much more await you!",
  ka: "შეუერთდით ჩვენს VIP პროგრამას და ისარგებლეთ ბონუსებით, რომლებიც ექსკლუზიურია ჩვენი ელიტარული წევრებისთვის. უფრო მაღალი ლიმიტები, პერსონალიზებული შეთავაზებები და კიდევ უფრო მეტი გელოდებათ!",
};
translations["bonuses.cta.action"] = {
  tr: "VIP Üyeliğe Başvur",
  en: "Apply for VIP Membership",
  ka: "განაცხადის შეტანა VIP წევრობისთვის",
};
translations["bonuses.cta.secondary"] = {
  tr: "Daha Fazla Bilgi",
  en: "More Information",
  ka: "მეტი ინფორმაცია",
};

translations["bonuses.no_results"] = {
  tr: "Aradığınız kriterlere uygun bonus bulunamadı",
  en: "There are currently no bonuses available in this category.",
  ka: "ამ კატეგორიაში ამჟამად ბონუსები არ არის ხელმისაწვდომი.",
};
translations["bonuses.hot"] = {
  tr: "POPÜLER",
  en: "HOT",
  ka: "პოპულარული",
};
translations["bonuses.rules_title"] = {
  tr: "Bonus Kuralları ve Şartları",
  en: "Bonus Rules and Conditions",
  ka: "ბონუსის წესები და პირობები",
};
translations["bonuses.close"] = {
  tr: "KAPAT",
  en: "CLOSE",
  ka: "დახურვა",
};
translations["bonuses.claim"] = {
  tr: "BONUSU TALEP ET",
  en: "CLAIM BONUS",
  ka: "ბონუსის მოთხოვნა",
};