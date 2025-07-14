import { mainTranslations } from './translations/mainTranslations';
import { gameTranslations } from './translations/gameTranslations';
import { profileCleanTranslations } from './translations/profileClean';
import { authTranslations } from './translations/authTranslations';
import { sidebarTranslations } from './translations/sidebarTranslations';
import { adminTranslations } from './translations/adminTranslations';

// Burada mevcut olmayabilecek çevirileri manuel olarak ekliyoruz
const manualFallbacks = {
  "slider.trial_bonus_description": {
    tr: "Yeni üyelere özel deneme bonusu hemen hesabınızda",
    en: "Special trial bonus for new members instantly in your account",
    ka: "სპეციალური საცდელი ბონუსი ახალი წევრებისთვის მყისიერად თქვენს ანგარიშზე"
  },
  "slider.loyalty_bonus_description": {
    tr: "Sadık kullanıcılarımıza özel bonuslar ve hediyeler",
    en: "Special bonuses and gifts for our loyal users",
    ka: "სპეციალური ბონუსები და საჩუქრები ჩვენი ერთგული მომხმარებლებისთვის"
  },
  "slider.join_now": {
    tr: "HEMEN KATIL",
    en: "JOIN NOW",
    ka: "ახლავე შეუერთდი"
  },
  // KYC çevirileri
  "profile.kyc": {
    tr: "Kimlik Doğrulama",
    en: "Identity Verification",
    ka: "პირადობის დამოწმება"
  },
  "profile.kyc_verification": {
    tr: "Kimlik Doğrulama",
    en: "Identity Verification",
    ka: "პირადობის დამოწმება"
  },
  "profile.kyc_verification_desc": {
    tr: "Hesabınızı doğrulayın ve tüm özellikleri kullanın",
    en: "Verify your account and use all features",
    ka: "დაადასტურეთ თქვენი ანგარიში და გამოიყენეთ ყველა ფუნქცია"
  },
  "profile.kyc_pending": {
    tr: "Doğrulama Beklemede",
    en: "Verification Pending",
    ka: "ვერიფიკაცია მიმდინარეობს"
  },
  "profile.kyc_pending_desc": {
    tr: "Kimlik doğrulamanız inceleniyor",
    en: "Your verification is being reviewed",
    ka: "თქვენი ვერიფიკაცია განიხილება"
  },
  "profile.kyc_info": {
    tr: "Kimlik Doğrulama Bilgisi",
    en: "Identity Verification Info",
    ka: "პირადობის დამოწმების ინფორმაცია"
  },
  "profile.kyc_benefit_1_title": {
    tr: "Yüksek Güvenlik",
    en: "Enhanced Security",
    ka: "გაუმჯობესებული უსაფრთხოება"
  },
  "profile.kyc_benefit_1_desc": {
    tr: "Hesabınızı koruyun ve güvenliği artırın",
    en: "Protect your account and increase security",
    ka: "დაიცავით თქვენი ანგარიში და გაზარდეთ უსაფრთხოება"
  },
  "profile.kyc_benefit_2_title": {
    tr: "Daha Yüksek Limitler",
    en: "Higher Limits",
    ka: "მაღალი ლიმიტები"
  },
  "profile.kyc_benefit_2_desc": {
    tr: "Yatırım ve çekim limitlerini artırın",
    en: "Increase your deposit and withdrawal limits",
    ka: "გაზარდეთ თქვენი დეპოზიტის და გატანის ლიმიტები"
  },
  "profile.kyc_benefit_3_title": {
    tr: "VIP Erişimi",
    en: "VIP Access",
    ka: "VIP წვდომა"
  },
  "profile.kyc_benefit_3_desc": {
    tr: "Özel promosyonlara ve VIP avantajlara erişin",
    en: "Access special promotions and VIP benefits",
    ka: "წვდომა სპეციალურ აქციებზე და VIP სარგებელზე"
  },
  "profile.approved": {
    tr: "Onaylandı",
    en: "Approved",
    ka: "დამტკიცებულია"
  },
  "profile.refresh": {
    tr: "Yenile",
    en: "Refresh",
    ka: "განახლება"
  },
  "profile.upload_documents": {
    tr: "Dokümanlarınızı Yükleyin",
    en: "Upload Your Documents",
    ka: "ატვირთეთ თქვენი დოკუმენტები"
  },
  "profile.id_front": {
    tr: "Kimlik Ön Yüzü",
    en: "ID Front Side",
    ka: "პირადობის მოწმობის წინა მხარე"
  },
  "profile.id_back": {
    tr: "Kimlik Arka Yüzü",
    en: "ID Back Side",
    ka: "პირადობის მოწმობის უკანა მხარე"
  },
  "profile.drag_or_click": {
    tr: "Sürükleyin veya Tıklayın",
    en: "Drag or Click",
    ka: "გადაათრიეთ ან დააწკაპუნეთ"
  },
  "profile.supported_formats": {
    tr: "Desteklenen formatlar: JPG, PNG, PDF (Maks. 5MB)",
    en: "Supported formats: JPG, PNG, PDF (Max. 5MB)",
    ka: "მხარდაჭერილი ფორმატები: JPG, PNG, PDF (მაქს. 5MB)"
  },
  "profile.submit_verification": {
    tr: "Doğrulama İçin Gönder",
    en: "Submit for Verification",
    ka: "გაგზავნა შემოწმებისთვის"
  },
  "profile.first_name": {
    tr: "Ad",
    en: "First Name",
    ka: "სახელი"
  },
  "profile.first_name_placeholder": {
    tr: "Adınızı girin",
    en: "Enter your first name",
    ka: "შეიყვანეთ თქვენი სახელი"
  },
  "profile.last_name": {
    tr: "Soyad",
    en: "Last Name",
    ka: "გვარი"
  },
  "profile.last_name_placeholder": {
    tr: "Soyadınızı girin",
    en: "Enter your last name",
    ka: "შეიყვანეთ თქვენი გვარი"
  },
  "profile.tckn": {
    tr: "TC Kimlik No",
    en: "National ID Number",
    ka: "პირადი ნომერი"
  },
  "profile.tckn_placeholder": {
    tr: "TC Kimlik numaranızı girin",
    en: "Enter your national ID number",
    ka: "შეიყვანეთ თქვენი პირადი ნომერი"
  }
};

export type Language = 'tr' | 'en' | 'ka';
export type Locale = Language;

// Çeviri tipleri
export type Translation = {
  tr: string;
  en: string;
  ka: string;
};

export type Translations = {
  [key: string]: Translation;
};

// Tüm çevirileri birleştiren nesne
export const allTranslations: Translations = {
  ...mainTranslations,
  ...gameTranslations,
  ...profileCleanTranslations,
  // Auth translations moved to manual fallbacks below
  ...sidebarTranslations,
  ...adminTranslations,
  ...manualFallbacks,
  // Auth translations
  "auth.login_title": {
    tr: "Hoş Geldiniz",
    en: "Welcome Back", 
    ka: "მობრძანებით"
  },
  "auth.login_subtitle": {
    tr: "Hesabınıza giriş yapın",
    en: "Sign in to your account",
    ka: "შედით თქვენს ანგარიშში"
  },
  "auth.username": {
    tr: "Kullanıcı Adı",
    en: "Username",
    ka: "მომხმარებლის სახელი"
  },
  "auth.username_placeholder": {
    tr: "Kullanıcı adınızı girin",
    en: "Enter your username",
    ka: "შეიყვანეთ მომხმარებლის სახელი"
  },
  "auth.password": {
    tr: "Şifre",
    en: "Password",
    ka: "პაროლი"
  },
  "auth.password_placeholder": {
    tr: "Şifrenizi girin",
    en: "Enter your password",
    ka: "შეიყვანეთ პაროლი"
  },
  "auth.remember_me": {
    tr: "Beni Hatırla",
    en: "Remember Me",
    ka: "დამიმახსოვრე"
  },
  "auth.forgot_password": {
    tr: "Şifremi Unuttum",
    en: "Forgot Password",
    ka: "დავივიწყე პაროლი"
  },
  "auth.login_button": {
    tr: "Giriş Yap",
    en: "Sign In",
    ka: "შესვლა"
  },
  "auth.secure_login": {
    tr: "Güvenli ve şifrelenmiş bağlantı",
    en: "Secure encrypted connection",
    ka: "უსაფრთხო დაშიფრული კავშირი"
  },
  "auth.or_option": {
    tr: "veya",
    en: "or",
    ka: "ან"
  },
  "auth.need_account": {
    tr: "Hesabınız yok mu?",
    en: "Don't have an account?",
    ka: "არ გაქვთ ანგარიში?"
  },
  "auth.create_account": {
    tr: "Hemen Kayıt Olun",
    en: "Create Account",
    ka: "ანგარიშის შექმნა"
  },
  "auth.processing": {
    tr: "İşleniyor...",
    en: "Processing...",
    ka: "მუშავდება..."
  },
  "auth.login_error": {
    tr: "Giriş sırasında bir hata oluştu",
    en: "An error occurred during login",
    ka: "შესვლისას მოხდა შეცდომა"
  },
  // Profile translations
  "profile.login_required": {
    tr: "Giriş Yapmanız Gerekli",
    en: "Login Required",
    ka: "საჭიროა შესვლა"
  },
  "profile.login_message": {
    tr: "Bu sayfayı görüntülemek için giriş yapmanız gerekiyor.",
    en: "You need to log in to view this page.",
    ka: "ამ გვერდის ნახვისთვის საჭიროა შესვლა."
  },
  "profile.return_home": {
    tr: "Ana Sayfaya Dön",
    en: "Return Home",
    ka: "მთავარ გვერდზე დაბრუნება"
  },
  // Notification translations
  "notifications.logout_success": {
    tr: "Başarıyla çıkış yaptınız",
    en: "Successfully logged out",
    ka: "წარმატებით გახვედით"
  },
  // Register translations
  "auth.register_title": {
    tr: "Hesap Oluşturun",
    en: "Create Account",
    ka: "ანგარიშის შექმნა"
  },
  "auth.register_subtitle": {
    tr: "Yeni hesabınızı oluşturun",
    en: "Create your new account",
    ka: "შექმენით თქვენი ახალი ანგარიში"
  },
  "auth.email": {
    tr: "E-posta",
    en: "Email",
    ka: "ელ. ფოსტა"
  },
  "auth.email_placeholder": {
    tr: "E-posta adresinizi girin",
    en: "Enter your email address",
    ka: "შეიყვანეთ ელ. ფოსტის მისამართი"
  },
  "auth.phone": {
    tr: "Telefon",
    en: "Phone",
    ka: "ტელეფონი"
  },
  "auth.phone_placeholder": {
    tr: "Telefon numaranızı girin",
    en: "Enter your phone number",
    ka: "შეიყვანეთ ტელეფონის ნომერი"
  },
  "auth.confirm_password": {
    tr: "Şifre Onayı",
    en: "Confirm Password",
    ka: "პაროლის დადასტურება"
  },
  "auth.confirm_password_placeholder": {
    tr: "Şifrenizi tekrar girin",
    en: "Re-enter your password",
    ka: "ხელახლა შეიყვანეთ პაროლი"
  },
  "auth.agree_terms": {
    tr: "Kullanım şartlarını kabul ediyorum",
    en: "I agree to the terms and conditions",
    ka: "ვეთანხმები წესებსა და პირობებს"
  },
  "auth.register_button": {
    tr: "Kayıt Ol",
    en: "Sign Up",
    ka: "რეგისტრაცია"
  },
  "auth.already_have_account": {
    tr: "Zaten hesabınız var mı?",
    en: "Already have an account?",
    ka: "უკვე გაქვთ ანგარიში?"
  },
  "auth.login_instead": {
    tr: "Giriş Yap",
    en: "Sign In",
    ka: "შესვლა"
  },
  "auth.register_success": {
    tr: "Hesabınız başarıyla oluşturuldu",
    en: "Account created successfully",
    ka: "ანგარიში წარმატებით შეიქმნა"
  },
  "auth.register_error": {
    tr: "Kayıt sırasında bir hata oluştu",
    en: "An error occurred during registration",
    ka: "რეგისტრაციისას მოხდა შეცდომა"
  },
  "auth.privacy_notice": {
    tr: "Kişisel bilgileriniz güvenli bir şekilde saklanacaktır",
    en: "Your personal information will be stored securely",
    ka: "თქვენი პირადი ინფორმაცია უსაფრთხოდ შეინახება"
  },
  // Missing Admin Dashboard Keys - Immediate Fallbacks
  "admin.menu.dashboard": {
    tr: "Ana Sayfa",
    en: "Dashboard",
    ka: "მთავარი გვერდი"
  },
  "admin.dashboard.description": {
    tr: "Yönetim paneli ana sayfası - İstatistikler ve genel bakış",
    en: "Admin panel homepage - Statistics and overview",
    ka: "ადმინისტრაციული პანელის მთავარი გვერდი - სტატისტიკა და მიმოხილვა"
  },
  "admin.dashboard.today": {
    tr: "Bugün",
    en: "Today",
    ka: "დღეს"
  },
  "admin.dashboard.this_week": {
    tr: "Bu Hafta",
    en: "This Week",
    ka: "ამ კვირაში"
  },
  "admin.dashboard.this_month": {
    tr: "Bu Ay",
    en: "This Month",
    ka: "ამ თვეში"
  },
  "admin.dashboard.refresh_button": {
    tr: "Yenile",
    en: "Refresh",
    ka: "განახლება"
  },
  "admin.dashboard.stats_loading": {
    tr: "İstatistikler yükleniyor...",
    en: "Loading statistics...",
    ka: "სტატისტიკის ჩატვირთვა..."
  },
  "admin.dashboard.total_users_metric": {
    tr: "Toplam Kullanıcı",
    en: "Total Users",
    ka: "ჯამური მომხმარებლები"
  },
  "admin.dashboard.overview": {
    tr: "Genel Bakış",
    en: "Overview",
    ka: "ზოგადი მიმოხილვა"
  },
  "admin.dashboard.users": {
    tr: "Kullanıcılar",
    en: "Users",
    ka: "მომხმარებლები"
  },
  "admin.dashboard.financial": {
    tr: "Mali Durum",
    en: "Financial",
    ka: "ფინანსური"
  },
  "admin.dashboard.deposits": {
    tr: "Yatırımlar",
    en: "Deposits",
    ka: "დეპოზიტები"
  },
  "admin.dashboard.withdrawals": {
    tr: "Çekimler",
    en: "Withdrawals",
    ka: "გამოტანები"
  },
  "slot.bonus.title": {
    tr: "SLOT BONUSU",
    en: "SLOT BONUS",
    ka: "სლოტ ბონუსი"
  },
  "slot.bonus.description": {
    tr: "Tüm slot oyunlarında %50 ekstra bonus",
    en: "50% extra bonus on all slots",
    ka: "ყველა სლოტზე 50% ექსტრა ბონუსი"
  },
  "common.details": {
    tr: "DETAYLAR",
    en: "DETAILS",
    ka: "დეტალები"
  }
};

// Mevcut dili alma
export function getCurrentLanguage(): Language {
  const savedLanguage = localStorage.getItem('cryptonbets-language') as Language | null;
  if (savedLanguage && ['tr', 'en', 'ka'].includes(savedLanguage)) {
    return savedLanguage;
  }
  return 'tr'; // Varsayılan dil Türkçe
}

// Dili değiştirme
export function changeLanguage(language: Language): void {
  localStorage.setItem('cryptonbets-language', language);
}

// Çeviri fonksiyonu
export function translate(key: string, language?: Language): string {
  const lang = language || getCurrentLanguage();
  
  // Çeviri anahtarı denetimi
  if (!key) {
    console.warn('Çeviri için boş anahtar kullanıldı');
    return '';
  }
  
  // Eğer çeviri anahtarı mevcutsa ve dil için çeviri varsa
  if (allTranslations[key] && allTranslations[key][lang]) {
    return allTranslations[key][lang];
  }
  
  // Dil için çeviri yoksa varsayılan TR
  if (allTranslations[key]) {
    return allTranslations[key].tr;
  }
  
  // Çeviri bulunamadıysa, anahtarı döndür (geliştirme için)
  console.warn(`Çeviri anahtarı bulunamadı: ${key}`);
  return key;
}