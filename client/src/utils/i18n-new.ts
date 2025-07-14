import { Locale, Translation } from '@/types';

// Tüm dilleri tanımlıyoruz
export type Languages = 'tr' | 'en' | 'ka' | 'ru';

// Çeviriler için tip tanımı
export type Translations = {
  [key: string]: Translation<Languages>;
};

// Yardımcı fonksiyonlar
export function translate(key: string, locale: Locale): string {
  // Geçerli bir çeviri anahtarı ise
  if (key in translations) {
    // Geçerli dil için çeviri var mı
    if (locale in translations[key]) {
      return translations[key][locale as Languages];
    }
    // Varsayılan olarak ingilizce çeviriyi döndür
    return translations[key].en || key;
  }
  // Çeviri bulunamadıysa anahtarın kendisini döndür
  return key;
}

export function setTranslations(newTranslations: Translations) {
  Object.assign(translations, newTranslations);
}

// Varsayılan dili ayarla
export const defaultLocale: Locale = 'tr';

// Desteklenen diller
export const supportedLocales: Locale[] = ['tr', 'en', 'ka', 'ru'];

// Dil adları
export const localeNames: { [key in Locale]: string } = {
  tr: 'Türkçe',
  en: 'English',
  ka: 'ქართული',
  ru: 'Русский'
};

// Profile çevirilerini import et
import { profileCleanTranslations } from './translations/profileClean';

// Tüm çevirileri içeren nesne
export const translations: Translations = {
  ...profileCleanTranslations,
  
  // Ana uygulama çevirileri
  "app.bet.won": {
    tr: "Kazandı",
    en: "Won",
    ka: "მოიგო",
    ru: "Выиграл"
  },
  "app.bet.lost": {
    tr: "Kaybetti",
    en: "Lost",
    ka: "წააგო",
    ru: "Проиграл"
  },
  
  // Auth işlemleri
  "auth.processing": {
    tr: "İŞLENİYOR...",
    en: "PROCESSING...",
    ka: "დამუშავება...",
    ru: "ОБРАБОТКА..."
  },
  "auth.error": {
    tr: "Bir hata oluştu, lütfen tekrar deneyin",
    en: "An error occurred, please try again",
    ka: "დაფიქსირდა შეცდომა, გთხოვთ სცადოთ თავიდან",
    ru: "Произошла ошибка, пожалуйста, попробуйте еще раз"
  },
  "auth.login": {
    tr: "GİRİŞ",
    en: "LOGIN",
    ka: "შესვლა",
    ru: "ВХОД"
  },
  "auth.register": {
    tr: "KAYIT OL",
    en: "REGISTER",
    ka: "რეგისტრაცია",
    ru: "РЕГИСТРАЦИЯ"
  },
  "auth.username": {
    tr: "Kullanıcı Adı",
    en: "Username",
    ka: "მომხმარებლის სახელი",
    ru: "Имя пользователя"
  },
  "auth.password": {
    tr: "Şifre",
    en: "Password",
    ka: "პაროლი",
    ru: "Пароль"
  },
  "auth.username_placeholder": {
    tr: "Kullanıcı adınızı girin",
    en: "Enter your username",
    ka: "შეიყვანეთ მომხმარებლის სახელი",
    ru: "Введите имя пользователя"
  },
  "auth.password_placeholder": {
    tr: "Şifrenizi girin",
    en: "Enter your password",
    ka: "შეიყვანეთ პაროლი",
    ru: "Введите пароль"
  },
  "auth.email": {
    tr: "E-posta",
    en: "Email",
    ka: "ელ.ფოსტა",
    ru: "Электронная почта"
  },
  "auth.email_placeholder": {
    tr: "E-posta adresinizi girin",
    en: "Enter your email",
    ka: "შეიყვანეთ თქვენი ელ.ფოსტა",
    ru: "Введите вашу электронную почту"
  },
  "auth.fullname": {
    tr: "Ad Soyad",
    en: "Full Name",
    ka: "სრული სახელი",
    ru: "Полное имя"
  },
  "auth.fullname_placeholder": {
    tr: "Adınızı ve soyadınızı girin",
    en: "Enter your full name",
    ka: "შეიყვანეთ თქვენი სრული სახელი",
    ru: "Введите ваше полное имя"
  },
  "auth.phone": {
    tr: "Telefon",
    en: "Phone",
    ka: "ტელეფონი",
    ru: "Телефон"
  },
  "auth.phone_placeholder": {
    tr: "Telefon numaranızı girin",
    en: "Enter your phone number",
    ka: "შეიყვანეთ თქვენი ტელეფონის ნომერი",
    ru: "Введите ваш номер телефона"
  },
  "auth.confirm_password": {
    tr: "Şifreyi Tekrarla",
    en: "Confirm Password",
    ka: "გაიმეორეთ პაროლი",
    ru: "Подтвердите пароль"
  },
  "auth.confirm_password_placeholder": {
    tr: "Şifrenizi tekrar girin",
    en: "Enter your password again",
    ka: "შეიყვანეთ პაროლი კიდევ ერთხელ",
    ru: "Введите пароль еще раз"
  },
  "auth.terms": {
    tr: "Kullanım koşullarını ve gizlilik politikasını kabul ediyorum",
    en: "I accept the terms of use and privacy policy",
    ka: "ვეთანხმები გამოყენების პირობებს და კონფიდენციალურობის პოლიტიკას",
    ru: "Я принимаю условия использования и политику конфиденциальности"
  },
  "auth.age_confirmation": {
    tr: "18 yaşından büyük olduğumu onaylıyorum",
    en: "I confirm that I am over 18 years old",
    ka: "ვადასტურებ, რომ 18 წელს გადაცილებული ვარ",
    ru: "Я подтверждаю, что мне исполнилось 18 лет"
  },
  "auth.forgot_password": {
    tr: "Şifremi Unuttum",
    en: "Forgot Password",
    ka: "პაროლი დამავიწყდა",
    ru: "Забыли пароль"
  },
  "auth.remember_me": {
    tr: "Beni Hatırla",
    en: "Remember Me",
    ka: "დამიმახსოვრე",
    ru: "Запомнить меня"
  },
  "auth.or_login_with": {
    tr: "veya şununla giriş yapın",
    en: "or login with",
    ka: "ან შედით",
    ru: "или войдите с помощью"
  },
  "auth.already_have_account": {
    tr: "Zaten hesabınız var mı?",
    en: "Already have an account?",
    ka: "უკვე გაქვთ ანგარიში?",
    ru: "Уже есть аккаунт?"
  },
  "auth.dont_have_account": {
    tr: "Hesabınız yok mu?",
    en: "Don't have an account?",
    ka: "არ გაქვთ ანგარიში?",
    ru: "Нет аккаунта?"
  },
  "auth.login_here": {
    tr: "Giriş Yapın",
    en: "Login Here",
    ka: "შესვლა აქ",
    ru: "Войти здесь"
  },
  "auth.register_here": {
    tr: "Kayıt Olun",
    en: "Register Here",
    ka: "დარეგისტრირდით აქ",
    ru: "Зарегистрироваться здесь"
  },
  "auth.login_error": {
    tr: "Giriş hatası",
    en: "Login error",
    ka: "შესვლის შეცდომა",
    ru: "Ошибка входа"
  },
  "auth.register_error": {
    tr: "Kayıt hatası",
    en: "Registration error",
    ka: "რეგისტრაციის შეცდომა",
    ru: "Ошибка регистрации"
  },
  "auth.invalid_credentials": {
    tr: "Geçersiz kullanıcı adı veya şifre",
    en: "Invalid username or password",
    ka: "არასწორი მომხმარებლის სახელი ან პაროლი",
    ru: "Неверное имя пользователя или пароль"
  },
  "auth.username_taken": {
    tr: "Bu kullanıcı adı zaten alınmış",
    en: "This username is already taken",
    ka: "ეს მომხმარებლის სახელი უკვე დაკავებულია",
    ru: "Это имя пользователя уже занято"
  },
  "auth.email_taken": {
    tr: "Bu e-posta adresi zaten kayıtlı",
    en: "This email is already registered",
    ka: "ეს ელ.ფოსტა უკვე დარეგისტრირებულია",
    ru: "Эта электронная почта уже зарегистрирована"
  },
  "auth.password_too_short": {
    tr: "Şifre en az 6 karakter olmalıdır",
    en: "Password must be at least 6 characters",
    ka: "პაროლი უნდა შეიცავდეს მინიმუმ 6 სიმბოლოს",
    ru: "Пароль должен содержать не менее 6 символов"
  },
  "auth.passwords_not_match": {
    tr: "Şifreler eşleşmiyor",
    en: "Passwords do not match",
    ka: "პაროლები არ ემთხვევა",
    ru: "Пароли не совпадают"
  },
  "auth.must_accept_terms": {
    tr: "Kullanım koşullarını kabul etmelisiniz",
    en: "You must accept the terms of use",
    ka: "უნდა დაეთანხმოთ გამოყენების პირობებს",
    ru: "Вы должны принять условия использования"
  },
  "auth.must_confirm_age": {
    tr: "18 yaş üstü olduğunuzu onaylamalısınız",
    en: "You must confirm that you are over 18",
    ka: "უნდა დაადასტუროთ, რომ 18 წელს გადაცილებული ხართ",
    ru: "Вы должны подтвердить, что вам исполнилось 18 лет"
  },
  "auth.valid_email_required": {
    tr: "Geçerli bir e-posta adresi girin",
    en: "Enter a valid email address",
    ka: "შეიყვანეთ მოქმედი ელ.ფოსტის მისამართი",
    ru: "Введите действительный адрес электронной почты"
  },
  "auth.valid_phone_required": {
    tr: "Geçerli bir telefon numarası girin",
    en: "Enter a valid phone number",
    ka: "შეიყვანეთ მოქმედი ტელეფონის ნომერი",
    ru: "Введите действительный номер телефона"
  },
  
  // Para Yatırma/Çekme
  "payment.deposit": {
    tr: "PARA YATIR",
    en: "DEPOSIT",
    ka: "დეპოზიტი",
    ru: "ДЕПОЗИТ"
  },
  "payment.withdraw": {
    tr: "PARA ÇEK",
    en: "WITHDRAW",
    ka: "გატანა",
    ru: "ВЫВОД"
  },
  "payment.amount": {
    tr: "Miktar",
    en: "Amount",
    ka: "რაოდენობა",
    ru: "Сумма"
  },
  "payment.amount_placeholder": {
    tr: "Yatırmak istediğiniz miktarı girin",
    en: "Enter the amount you want to deposit",
    ka: "შეიყვანეთ თანხა, რომლის შეტანაც გსურთ",
    ru: "Введите сумму, которую вы хотите внести"
  },
  "payment.select_method": {
    tr: "Ödeme Yöntemini Seçin",
    en: "Select Payment Method",
    ka: "აირჩიეთ გადახდის მეთოდი",
    ru: "Выберите способ оплаты"
  },
  "payment.papara": {
    tr: "Papara",
    en: "Papara",
    ka: "Papara",
    ru: "Papara"
  },
  "payment.credit_card": {
    tr: "Kredi Kartı",
    en: "Credit Card",
    ka: "საკრედიტო ბარათი",
    ru: "Кредитная карта"
  },
  "payment.bank_transfer": {
    tr: "Banka Havalesi",
    en: "Bank Transfer",
    ka: "საბანკო გადარიცხვა",
    ru: "Банковский перевод"
  },
  "payment.crypto": {
    tr: "Kripto Para",
    en: "Cryptocurrency",
    ka: "კრიპტოვალუტა",
    ru: "Криптовалюта"
  },
  "payment.process_deposit": {
    tr: "YATIRIMI TAMAMLA",
    en: "COMPLETE DEPOSIT",
    ka: "დეპოზიტის დასრულება",
    ru: "ЗАВЕРШИТЬ ДЕПОЗИТ"
  },
  "payment.process_withdraw": {
    tr: "ÇEKİMİ TAMAMLA",
    en: "COMPLETE WITHDRAWAL",
    ka: "გატანის დასრულება",
    ru: "ЗАВЕРШИТЬ ВЫВОД"
  },
  
  // Genel
  "general.close": {
    tr: "KAPAT",
    en: "CLOSE",
    ka: "დახურვა",
    ru: "ЗАКРЫТЬ"
  },
  "general.save": {
    tr: "KAYDET",
    en: "SAVE",
    ka: "შენახვა",
    ru: "СОХРАНИТЬ"
  },
  "general.cancel": {
    tr: "İPTAL",
    en: "CANCEL",
    ka: "გაუქმება",
    ru: "ОТМЕНА"
  },
  "general.submit": {
    tr: "GÖNDER",
    en: "SUBMIT",
    ka: "გაგზავნა",
    ru: "ОТПРАВИТЬ"
  },
  "general.search": {
    tr: "Ara",
    en: "Search",
    ka: "ძებნა",
    ru: "Поиск"
  },
  "general.search_placeholder": {
    tr: "Arama yapmak için yazın...",
    en: "Type to search...",
    ka: "ძებნისთვის დაბეჭდეთ...",
    ru: "Введите для поиска..."
  },
  
  // Ana sayfa bölümleri
  "home.popular_slots": {
    tr: "Popüler Slot Oyunları",
    en: "Popular Slot Games",
    ka: "პოპულარული სლოტ თამაშები",
    ru: "Популярные слот-игры"
  },
  "home.all_slots": {
    tr: "Tüm Slot Oyunları",
    en: "All Slot Games",
    ka: "ყველა სლოტ თამაში",
    ru: "Все слот-игры"
  },
  "home.popular_casino": {
    tr: "Popüler Casino Oyunları",
    en: "Popular Casino Games",
    ka: "პოპულარული კაზინო თამაშები",
    ru: "Популярные казино-игры"
  },
  "home.all_casino": {
    tr: "Tüm Casino Oyunları",
    en: "All Casino Games",
    ka: "ყველა კაზინო თამაში",
    ru: "Все казино-игры"
  },
  "home.game_providers": {
    tr: "Oyun Sağlayıcıları",
    en: "Game Providers",
    ka: "თამაშის პროვაიდერები",
    ru: "Провайдеры игр"
  },
  "home.news": {
    tr: "Haberler",
    en: "News",
    ka: "სიახლეები",
    ru: "Новости"
  },
  "home.promotions": {
    tr: "Promosyonlar",
    en: "Promotions",
    ka: "აქციები",
    ru: "Акции"
  },
  "home.vip": {
    tr: "VIP",
    en: "VIP",
    ka: "VIP",
    ru: "VIP"
  },
  "home.welcome_bonus": {
    tr: "Hoşgeldin Bonusu",
    en: "Welcome Bonus",
    ka: "მისალმების ბონუსი",
    ru: "Приветственный бонус"
  },
  "home.leaderboard": {
    tr: "Liderlik Tablosu",
    en: "Leaderboard",
    ka: "ლიდერბორდი",
    ru: "Таблица лидеров"
  },
  "home.view_all": {
    tr: "Tümünü Gör",
    en: "View All",
    ka: "ყველას ნახვა",
    ru: "Посмотреть все"
  },
  "home.play_now": {
    tr: "HEMEN OYNA",
    en: "PLAY NOW",
    ka: "ითამაშე ახლავე",
    ru: "ИГРАТЬ СЕЙЧАС"
  },
  "home.learn_more": {
    tr: "DETAYLAR",
    en: "DETAILS",
    ka: "დეტალები",
    ru: "ПОДРОБНЕЕ"
  },
  
  // Bonuslar
  "bonuses.title": {
    tr: "BONUSLAR",
    en: "BONUSES",
    ka: "ბონუსები",
    ru: "БОНУСЫ"
  },
  "bonuses.welcome": {
    tr: "Hoşgeldin Bonusu",
    en: "Welcome Bonus",
    ka: "მისალმების ბონუსი",
    ru: "Приветственный бонус"
  },
  "bonuses.deposit": {
    tr: "Yatırım Bonusu",
    en: "Deposit Bonus",
    ka: "დეპოზიტის ბონუსი",
    ru: "Бонус на депозит"
  },
  "bonuses.cashback": {
    tr: "Nakit İade",
    en: "Cashback",
    ka: "ქეშბექი",
    ru: "Кэшбэк"
  },
  "bonuses.free_spins": {
    tr: "Bedava Çevirmeler",
    en: "Free Spins",
    ka: "უფასო დატრიალებები",
    ru: "Бесплатные вращения"
  },
  "bonuses.loyalty": {
    tr: "Sadakat Bonusu",
    en: "Loyalty Bonus",
    ka: "ლოიალურობის ბონუსი",
    ru: "Бонус за лояльность"
  },
  "bonuses.claim": {
    tr: "BONUSU AL",
    en: "CLAIM BONUS",
    ka: "ბონუსის მიღება",
    ru: "ПОЛУЧИТЬ БОНУС"
  },
  "bonuses.code": {
    tr: "Bonus Kodu",
    en: "Bonus Code",
    ka: "ბონუს კოდი",
    ru: "Бонусный код"
  },
  "bonuses.wagering": {
    tr: "Çevrim Şartı",
    en: "Wagering Requirement",
    ka: "ფსონის მოთხოვნა",
    ru: "Требование отыгрыша"
  },
  "bonuses.max_bonus": {
    tr: "Maksimum Bonus",
    en: "Maximum Bonus",
    ka: "მაქსიმალური ბონუსი",
    ru: "Максимальный бонус"
  },
  "bonuses.min_deposit": {
    tr: "Minimum Yatırım",
    en: "Minimum Deposit",
    ka: "მინიმალური დეპოზიტი",
    ru: "Минимальный депозит"
  },
  "bonuses.expiry": {
    tr: "Son Kullanma Tarihi",
    en: "Expiry Date",
    ka: "ვადის გასვლის თარიღი",
    ru: "Срок действия"
  },
  "bonuses.terms": {
    tr: "Bonus Şartları",
    en: "Bonus Terms",
    ka: "ბონუსის პირობები",
    ru: "Условия бонуса"
  },
  "bonuses.close": {
    tr: "KAPAT",
    en: "CLOSE",
    ka: "დახურვა",
    ru: "ЗАКРЫТЬ"
  },
  
  // VIP
  "vip.title": {
    tr: "VIP PROGRAM",
    en: "VIP PROGRAM",
    ka: "VIP პროგრამა",
    ru: "VIP ПРОГРАММА"
  },
  "vip.level": {
    tr: "VIP Seviye",
    en: "VIP Level",
    ka: "VIP დონე",
    ru: "VIP Уровень"
  },
  "vip.benefits": {
    tr: "VIP Ayrıcalıkları",
    en: "VIP Benefits",
    ka: "VIP უპირატესობები",
    ru: "VIP Преимущества"
  },
  "vip.requirements": {
    tr: "VIP Gereksinimleri",
    en: "VIP Requirements",
    ka: "VIP მოთხოვნები",
    ru: "VIP Требования"
  },
  "vip.join": {
    tr: "VIP OL",
    en: "BECOME VIP",
    ka: "გახდი VIP",
    ru: "СТАТЬ VIP"
  },
  
  // Mobil
  "mobile.home": {
    tr: "Anasayfa",
    en: "Home",
    ka: "მთავარი",
    ru: "Главная"
  },
  "mobile.casino": {
    tr: "Casino",
    en: "Casino",
    ka: "კაზინო",
    ru: "Казино"
  },
  "mobile.slots": {
    tr: "Slotlar",
    en: "Slots",
    ka: "სლოტები",
    ru: "Слоты"
  },
  "mobile.bonuses": {
    tr: "Bonuslar",
    en: "Bonuses",
    ka: "ბონუსები",
    ru: "Бонусы"
  },
  "mobile.profile": {
    tr: "Profil",
    en: "Profile",
    ka: "პროფილი",
    ru: "Профиль"
  }
};