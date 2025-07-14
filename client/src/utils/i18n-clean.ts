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

// BÜTÜN ÇEVİRİLER
export const translations: Translations = {
  // -----------------------------
  // PROFİL SAYFASI ÇEVİRİLERİ
  // -----------------------------
  "profile.active_member": {
    tr: "Aktif Üye",
    en: "Active Member",
    ka: "აქტიური წევრი",
    ru: "Активный участник"
  },
  "profile.update_info": {
    tr: "Bilgileri Güncelle",
    en: "Update Information",
    ka: "ინფორმაციის განახლება",
    ru: "Обновить информацию"
  },
  "profile.username_cannot_change": {
    tr: "Kullanıcı adı değiştirilemez",
    en: "Username cannot be changed",
    ka: "მომხმარებლის სახელის შეცვლა შეუძლებელია",
    ru: "Имя пользователя изменить нельзя"
  },
  "profile.total_bets": {
    tr: "Toplam Bahis",
    en: "Total Bets",
    ka: "სულ ფსონები",
    ru: "Всего ставок"
  },
  "profile.total_wins": {
    tr: "Toplam Kazanç",
    en: "Total Wins",
    ka: "სულ მოგებები",
    ru: "Всего выигрышей"
  },
  "profile.bet": {
    tr: "Bahis",
    en: "Bet",
    ka: "ფსონი",
    ru: "Ставка"
  },
  "profile.profit": {
    tr: "Kazanç",
    en: "Profit",
    ka: "მოგება",
    ru: "Выигрыш"
  },
  "profile.multiplier": {
    tr: "Çarpan",
    en: "Multiplier",
    ka: "გამრავლება",
    ru: "Множитель"
  },
  "profile.view_details": {
    tr: "Detayları Görüntüle",
    en: "View Details",
    ka: "დეტალების ნახვა",
    ru: "Просмотр Деталей"
  },
  "profile.all_dates": {
    tr: "Tüm Tarihler",
    en: "All Dates",
    ka: "ყველა თარიღი",
    ru: "Все Даты"
  },
  "profile.today": {
    tr: "Bugün",
    en: "Today",
    ka: "დღეს",
    ru: "Сегодня"
  },
  "profile.this_week": {
    tr: "Bu Hafta",
    en: "This Week",
    ka: "ამ კვირაში",
    ru: "На этой неделе"
  },
  "profile.this_month": {
    tr: "Bu Ay",
    en: "This Month",
    ka: "ამ თვეში",
    ru: "В этом месяце"
  },
  "profile.slot_games": {
    tr: "Slot Oyunları",
    en: "Slot Games",
    ka: "სლოტის თამაშები",
    ru: "Слот Игры"
  },
  "profile.casino_games": {
    tr: "Casino Oyunları",
    en: "Casino Games",
    ka: "კაზინოს თამაშები",
    ru: "Казино Игры"
  },
  "profile.show_more": {
    tr: "Daha Fazla Göster",
    en: "Show More",
    ka: "მეტის ჩვენება",
    ru: "Показать Больше"
  },
  "profile.bonus_earnings": {
    tr: "Bonus Kazançları",
    en: "Bonus Earnings",
    ka: "ბონუს შემოსავლები",
    ru: "Бонусные Начисления"
  },
  "profile.bonus_balance": {
    tr: "Bonus Bakiye",
    en: "Bonus Balance",
    ka: "ბონუს ბალანსი",
    ru: "Бонусный баланс"
  },
  "profile.total_deposit": {
    tr: "Toplam Yatırım",
    en: "Total Deposit",
    ka: "სულ შენატანი",
    ru: "Всего депозитов"
  },
  "profile.total_withdrawal": {
    tr: "Toplam Çekim",
    en: "Total Withdrawal",
    ka: "სულ გატანა",
    ru: "Всего выводов"
  },
  "profile.deposit": {
    tr: "Yatır",
    en: "Deposit",
    ka: "შეტანა",
    ru: "Депозит"
  },
  "profile.withdraw": {
    tr: "Çek",
    en: "Withdraw",
    ka: "გატანა",
    ru: "Вывод"
  },
  "profile.phone": {
    tr: "Telefon Numarası",
    en: "Phone Number",
    ka: "ტელეფონის ნომერი",
    ru: "Номер телефона"
  },
  "profile.change_password_title": {
    tr: "Şifre Değiştir",
    en: "Change Password",
    ka: "პაროლის შეცვლა",
    ru: "Изменить пароль"
  },
  "profile.current_password": {
    tr: "Mevcut Şifre",
    en: "Current Password",
    ka: "მიმდინარე პაროლი",
    ru: "Текущий пароль"
  },
  "profile.new_password": {
    tr: "Yeni Şifre",
    en: "New Password",
    ka: "ახალი პაროლი",
    ru: "Новый пароль"
  },
  "profile.confirm_password": {
    tr: "Yeni Şifre Tekrar",
    en: "Confirm New Password",
    ka: "დაადასტურეთ ახალი პაროლი",
    ru: "Подтвердите новый пароль"
  },
  "profile.password_requirements": {
    tr: "En az 8 karakter, bir büyük harf ve bir rakam içermelidir",
    en: "Must contain at least 8 characters, one uppercase letter and one number",
    ka: "უნდა შეიცავდეს მინიმუმ 8 სიმბოლოს, ერთ დიდ ასოს და ერთ რიცხვს",
    ru: "Должен содержать не менее 8 символов, одну заглавную букву и одну цифру"
  },
  "profile.change_password_button": {
    tr: "Şifremi Değiştir",
    en: "Change My Password",
    ka: "ჩემი პაროლის შეცვლა",
    ru: "Изменить мой пароль"
  },
  "profile.bet_history": {
    tr: "Bahis Geçmişi",
    en: "Bet History",
    ka: "ფსონების ისტორია",
    ru: "История ставок"
  },
  "profile.all_games": {
    tr: "Tüm Oyunlar",
    en: "All Games",
    ka: "ყველა თამაში",
    ru: "Все игры"
  },
  "profile.won": {
    tr: "Kazandı",
    en: "Won",
    ka: "მოიგო",
    ru: "Выиграл"
  },
  "profile.lost": {
    tr: "Kaybetti",
    en: "Lost",
    ka: "წააგო",
    ru: "Проиграл"
  },
  "profile.transactions_history": {
    tr: "İşlem Geçmişi",
    en: "Transaction History",
    ka: "ტრანზაქციების ისტორია",
    ru: "История транзакций"
  },
  "profile.transaction_id": {
    tr: "İşlem ID",
    en: "Transaction ID",
    ka: "ტრანზაქციის ID",
    ru: "ID транзакции"
  },
  "profile.amount": {
    tr: "Miktar",
    en: "Amount",
    ka: "რაოდენობა",
    ru: "Сумма"
  },
  "profile.status": {
    tr: "Durum",
    en: "Status",
    ka: "სტატუსი",
    ru: "Статус"
  },
  "profile.transaction_details": {
    tr: "İşlem Detayları",
    en: "Transaction Details",
    ka: "ტრანზაქციის დეტალები",
    ru: "Детали транзакции"
  },
  "profile.processing": {
    tr: "İşlemde",
    en: "Processing",
    ka: "დამუშავებაშია",
    ru: "В обработке"
  },
  "profile.my_account": {
    tr: "Hesabım",
    en: "My Account",
    ka: "ჩემი ანგარიში",
    ru: "Мой Аккаунт"
  },
  "profile.personal_info": {
    tr: "Kişisel Bilgiler",
    en: "Personal Information",
    ka: "პირადი ინფორმაცია",
    ru: "Личная Информация"
  },
  "profile.info": {
    tr: "Profil",
    en: "Profile",
    ka: "პროფილი",
    ru: "Профиль"
  },
  "profile.bets": {
    tr: "Bahisler",
    en: "Bets",
    ka: "ფსონები",
    ru: "Ставки"
  },
  "profile.transactions": {
    tr: "İşlemler",
    en: "Transactions",
    ka: "ტრანზაქციები",
    ru: "Транзакции"
  }, 
  "profile.bonuses": {
    tr: "Bonuslar",
    en: "Bonuses",
    ka: "ბონუსები",
    ru: "Бонусы"
  },
  "profile.settings": {
    tr: "Ayarlar",
    en: "Settings",
    ka: "პარამეტრები",
    ru: "Настройки"
  },
  "profile.password": {
    tr: "Şifre",
    en: "Password",
    ka: "პაროლი",
    ru: "Пароль"
  },
  "profile.notifications": {
    tr: "Bildirimler",
    en: "Notifications",
    ka: "შეტყობინებები",
    ru: "Уведомления"
  },
  "profile.security": {
    tr: "Güvenlik", 
    en: "Security",
    ka: "უსაფრთხოება",
    ru: "Безопасность"
  },
  "profile.full_name": {
    tr: "Ad Soyad",
    en: "Full Name",
    ka: "სრული სახელი",
    ru: "Полное имя"
  },
  "profile.email": {
    tr: "E-posta Adresi",
    en: "Email Address",
    ka: "ელფოსტის მისამართი",
    ru: "Адрес электронной почты"
  },
  "profile.member_since": {
    tr: "Üyelik",
    en: "Member Since",
    ka: "წევრი არის",
    ru: "Участник с"
  },
  "profile.vip_level": {
    tr: "VIP Seviye",
    en: "VIP Level",
    ka: "VIP დონე",
    ru: "VIP Уровень"
  },
  "profile.total_balance": {
    tr: "Toplam Bakiye",
    en: "Total Balance",
    ka: "ჯამური ბალანსი",
    ru: "Общий Баланс"
  },
  "profile.no_bets": {
    tr: "Henüz bahis yapılmadı",
    en: "No bets made yet",
    ka: "ჯერ არ არის ფსონები",
    ru: "Ставок пока нет"
  },
  "profile.last_bets": {
    tr: "Son Bahisler",
    en: "Last Bets",
    ka: "ბოლო ფსონები",
    ru: "Последние Ставки"
  },
  "profile.language": {
    tr: "Dil",
    en: "Language",
    ka: "ენა",
    ru: "Язык"
  },
  "profile.select_language": {
    tr: "Dil Seçimi",
    en: "Language Selection",
    ka: "ენის არჩევა",
    ru: "Выбор Языка"
  },
  "profile.betting_statistics": {
    tr: "Bahis İstatistikleri",
    en: "Betting Statistics",
    ka: "ფსონების სტატისტიკა",
    ru: "Статистика Ставок"
  },
  "profile.financial_history": {
    tr: "Finansal Geçmiş",
    en: "Financial History",
    ka: "ფინანსური ისტორია",
    ru: "Финансовая История"
  },
  "profile.account_settings": {
    tr: "Hesap Ayarları",
    en: "Account Settings",
    ka: "ანგარიშის პარამეტრები",
    ru: "Настройки Аккаунта"
  },
  "profile.available_bonuses": {
    tr: "Kullanılabilir Bonuslar",
    en: "Available Bonuses",
    ka: "ხელმისაწვდომი ბონუსები",
    ru: "Доступные Бонусы"
  },
  "profile.claimed_bonuses": {
    tr: "Alınmış Bonuslar",
    en: "Claimed Bonuses",
    ka: "მიღებული ბონუსები",
    ru: "Полученные Бонусы"
  },
  "profile.past_bonuses": {
    tr: "Geçmiş Bonuslar",
    en: "Past Bonuses",
    ka: "წარსული ბონუსები",
    ru: "Прошлые Бонусы"
  },
  "profile.edit_profile": {
    tr: "Profili Düzenle",
    en: "Edit Profile",
    ka: "პროფილის რედაქტირება",
    ru: "Редактировать Профиль"
  },
  "profile.save_changes": {
    tr: "Değişiklikleri Kaydet",
    en: "Save Changes",
    ka: "ცვლილებების შენახვა",
    ru: "Сохранить Изменения"
  },
  "profile.cancel": {
    tr: "İptal",
    en: "Cancel",
    ka: "გაუქმება",
    ru: "Отмена"
  },
  "profile.method": {
    tr: "Yöntem",
    en: "Method",
    ka: "მეთოდი",
    ru: "Метод"
  },
  "profile.completed": {
    tr: "Tamamlandı",
    en: "Completed",
    ka: "დასრულებულია",
    ru: "Завершено"
  },
  "profile.transaction_history": {
    tr: "İşlem Geçmişi",
    en: "Transaction History",
    ka: "ტრანზაქციების ისტორია",
    ru: "История транзакций"
  },
  "profile.deposit_transaction": {
    tr: "Para Yatırma İşlemi",
    en: "Deposit Transaction",
    ka: "თანხის შეტანის ოპერაცია",
    ru: "Операция пополнения"
  },
  "profile.withdrawal_transaction": {
    tr: "Para Çekme İşlemi",
    en: "Withdrawal Transaction",
    ka: "თანხის გატანის ოპერაცია",
    ru: "Операция вывода средств"
  },
  "profile.withdrawals": {
    tr: "Çekimler",
    en: "Withdrawals",
    ka: "გატანები",
    ru: "Выводы"
  },
  "profile.deposits": {
    tr: "Yatırımlar",
    en: "Deposits",
    ka: "შენატანები",
    ru: "Депозиты"
  },
  "profile.date_range": {
    tr: "Tarih Aralığı",
    en: "Date Range",
    ka: "თარიღის დიაპაზონი",
    ru: "Диапазон дат"
  },
  "profile.filter": {
    tr: "Filtrele",
    en: "Filter",
    ka: "ფილტრი",
    ru: "Фильтр"
  },
  "profile.latest_bets": {
    tr: "Son Bahisler",
    en: "Latest Bets",
    ka: "ბოლო ფსონები",
    ru: "Последние ставки"
  },
  "profile.latest_transactions": {
    tr: "Son İşlemler",
    en: "Latest Transactions",
    ka: "ბოლო ტრანზაქციები",
    ru: "Последние транзакции"
  },
  "profile.transaction_type": {
    tr: "İşlem Tipi",
    en: "Transaction Type",
    ka: "ტრანზაქციის ტიპი",
    ru: "Тип транзакции"
  },
  "profile.transaction_date": {
    tr: "İşlem Tarihi",
    en: "Transaction Date",
    ka: "ტრანზაქციის თარიღი",
    ru: "Дата транзакции"
  },
  "profile.transaction_amount": {
    tr: "İşlem Tutarı",
    en: "Transaction Amount",
    ka: "ტრანზაქციის თანხა",
    ru: "Сумма транзакции"
  },
  "profile.active_bonuses": {
    tr: "Aktif Bonuslar",
    en: "Active Bonuses",
    ka: "აქტიური ბონუსები",
    ru: "Активные бонусы"
  },
  "profile.bonus_history": {
    tr: "Bonus Geçmişi",
    en: "Bonus History",
    ka: "ბონუს ისტორია",
    ru: "История бонусов"
  },
  "profile.bonus_name": {
    tr: "Bonus Adı",
    en: "Bonus Name",
    ka: "ბონუსის სახელი",
    ru: "Название бонуса"
  },
  "profile.bonus_amount": {
    tr: "Bonus Miktarı",
    en: "Bonus Amount",
    ka: "ბონუსის ოდენობა",
    ru: "Сумма бонуса"
  },
  "profile.wagering_progress": {
    tr: "Çevrim Durumu",
    en: "Wagering Progress",
    ka: "ფსონის პროგრესი",
    ru: "Прогресс отыгрыша"
  },
  "profile.expiry_date": {
    tr: "Son Kullanma Tarihi",
    en: "Expiry Date",
    ka: "ვადის გასვლის თარიღი",
    ru: "Срок действия"
  },
  "profile.claim_bonus": {
    tr: "Bonusu Talep Et",
    en: "Claim Bonus",
    ka: "ბონუსის მოთხოვნა",
    ru: "Получить бонус"
  },
  "profile.login_notifications": {
    tr: "Giriş Bildirimleri",
    en: "Login Notifications",
    ka: "შესვლის შეტყობინებები",
    ru: "Уведомления о входе"
  },
  "profile.login_notifications_desc": {
    tr: "Hesabınıza her giriş yaptığınızda bildirim alın",
    en: "Receive notifications each time you log into your account",
    ka: "მიიღეთ შეტყობინებები ყოველ ჯერზე, როდესაც შეხვალთ თქვენს ანგარიშზე",
    ru: "Получайте уведомления при каждом входе в вашу учетную запись"
  },
  "profile.update_password": {
    tr: "Şifreyi Güncelle",
    en: "Update Password",
    ka: "პაროლის განახლება",
    ru: "Обновить пароль"
  },
  "profile.email_notifications": {
    tr: "E-posta Bildirimleri",
    en: "Email Notifications",
    ka: "ელფოსტის შეტყობინებები",
    ru: "Уведомления по электронной почте"
  },
  "profile.email_notifications_desc": {
    tr: "Önemli güncellemeler, bonuslar ve promosyonlar hakkında e-posta alın",
    en: "Receive emails about important updates, bonuses, and promotions",
    ka: "მიიღეთ ელფოსტები მნიშვნელოვან განახლებებზე, ბონუსებზე და აქციებზე",
    ru: "Получайте электронные письма о важных обновлениях, бонусах и акциях"
  },
  "profile.sms_notifications": {
    tr: "SMS Bildirimleri",
    en: "SMS Notifications",
    ka: "SMS შეტყობინებები",
    ru: "SMS-уведомления"
  },
  "profile.sms_notifications_desc": {
    tr: "Para yatırma ve çekme işlemleri hakkında SMS bildirimleri alın",
    en: "Receive SMS notifications about deposit and withdrawal transactions",
    ka: "მიიღეთ SMS შეტყობინებები დეპოზიტისა და გატანის ოპერაციების შესახებ",
    ru: "Получайте SMS-уведомления о транзакциях пополнения и вывода средств"
  },
  "profile.history_desc": {
    tr: "Geçmiş bahislerinizi görüntüleyin ve kazançlarınızı takip edin.",
    en: "View your past bets and track your winnings.",
    ka: "ნახეთ თქვენი წარსული ფსონები და თვალყური ადევნეთ მოგებებს.",
    ru: "Просматривайте историю ваших ставок и отслеживайте выигрыши."
  },
  "profile.appearance": {
    tr: "Görünüm",
    en: "Appearance",
    ka: "გარეგნობა",
    ru: "Внешний вид"
  },
  "profile.app_preferences": {
    tr: "Uygulama Tercihleri",
    en: "App Preferences",
    ka: "აპლიკაციის პარამეტრები",
    ru: "Настройки приложения"
  },
  "profile.balance": {
    tr: "Bakiye",
    en: "Balance",
    ka: "ბალანსი",
    ru: "Баланс"
  },
  "profile.account_profile": {
    tr: "Hesap Profili",
    en: "Account Profile",
    ka: "ანგარიშის პროფილი",
    ru: "Профиль Вашего Аккаунта"
  },
  "profile.withdraw_transaction": {
    tr: "Para Çekme",
    en: "Withdraw",
    ka: "გატანა",
    ru: "Вывод"
  },
  "profile.deposit_transaction": {
    tr: "Para Yatırma",
    en: "Deposit",
    ka: "შეტანა",
    ru: "Депозит"
  },

  // -----------------------------
  // BAHİS ÇEVİRİLERİ
  // -----------------------------
  "bet.won": {
    tr: "Kazandı",
    en: "Won",
    ka: "მოიგო",
    ru: "Выиграл"
  },
  "bet.lost": {
    tr: "Kaybetti",
    en: "Lost",
    ka: "წააგო",
    ru: "Проиграл"
  },
  "bet.date": {
    tr: "Tarih",
    en: "Date",
    ka: "თარიღი",
    ru: "Дата"
  },
  "bet.game": {
    tr: "Oyun",
    en: "Game",
    ka: "თამაში",
    ru: "Игра"
  },
  "bet.amount": {
    tr: "Miktar",
    en: "Amount",
    ka: "რაოდენობა",
    ru: "Сумма"
  },
  "bet.winnings": {
    tr: "Kazanç",
    en: "Winnings",
    ka: "მოგება",
    ru: "Выигрыш"
  },
  "bet.status": {
    tr: "Durum",
    en: "Status",
    ka: "სტატუსი",
    ru: "Статус"
  },

  // -----------------------------
  // AUTH ÇEVİRİLERİ
  // -----------------------------
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
  "auth.logout": {
    tr: "ÇIKIŞ YAP",
    en: "LOGOUT",
    ka: "გასვლა",
    ru: "ВЫХОД"
  },

  // -----------------------------
  // HEADER ÇEVİRİLERİ
  // -----------------------------
  "header.login_button": {
    tr: "GİRİŞ YAP",
    en: "LOGIN",
    ka: "შესვლა",
    ru: "ВХОД"
  },
  "header.register_button": {
    tr: "KAYIT OL",
    en: "REGISTER",
    ka: "რეგისტრაცია",
    ru: "РЕГИСТРАЦИЯ"
  },
  "header.deposit": {
    tr: "Para Yatır",
    en: "Deposit",
    ka: "შეტანა",
    ru: "Пополнить"
  },
  "header.withdraw": {
    tr: "Para Çek",
    en: "Withdraw",
    ka: "გატანა",
    ru: "Вывести"
  },
  "header.history": {
    tr: "Bahis Geçmişi",
    en: "Bet History",
    ka: "ფსონების ისტორია",
    ru: "История ставок"
  },
  "header.profile": {
    tr: "Profil",
    en: "Profile",
    ka: "პროფილი",
    ru: "Профиль"
  },
  "header.settings": {
    tr: "Ayarlar",
    en: "Settings",
    ka: "პარამეტრები",
    ru: "Настройки"
  },
  "header.logout": {
    tr: "Çıkış Yap",
    en: "Logout",
    ka: "გასვლა",
    ru: "Выход"
  },

  // -----------------------------
  // ÖDEME ÇEVİRİLERİ
  // -----------------------------
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

  // -----------------------------
  // GENEL ÇEVİRİLER
  // -----------------------------
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

  // -----------------------------
  // ANA SAYFA ÇEVİRİLERİ
  // -----------------------------
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
  
  // -----------------------------
  // BONUS ÇEVİRİLERİ
  // -----------------------------
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
  
  // -----------------------------
  // VIP ÇEVİRİLERİ
  // -----------------------------
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

  // -----------------------------
  // MOBİL ÇEVİRİLERİ
  // -----------------------------
  "nav.home": {
    tr: "Anasayfa",
    en: "Home",
    ka: "მთავარი",
    ru: "Главная"
  },
  "nav.casino": {
    tr: "Casino",
    en: "Casino",
    ka: "კაზინო",
    ru: "Казино"
  },
  "nav.slots": {
    tr: "Slotlar",
    en: "Slots",
    ka: "სლოტები",
    ru: "Слоты"
  },
  "nav.bonuses": {
    tr: "Bonuslar",
    en: "Bonuses",
    ka: "ბონუსები",
    ru: "Бонусы"
  },
  "nav.profile": {
    tr: "Profil",
    en: "Profile",
    ka: "პროფილი",
    ru: "Профиль"
  },
  "mobile.menu": {
    tr: "Menü",
    en: "Menu",
    ka: "მენიუ",
    ru: "Меню"
  },
  "mobile.close": {
    tr: "Kapat",
    en: "Close",
    ka: "დახურვა",
    ru: "Закрыть"
  },
  
  // -----------------------------
  // FOOTER ÇEVİRİLERİ
  // -----------------------------
  "footer.copyright": {
    tr: "2025 Cryptonbets Tüm hakları saklıdır.",
    en: "2025 Cryptonbets All rights reserved.",
    ka: "2025 Cryptonbets ყველა უფლება დაცულია.",
    ru: "2025 Cryptonbets Все права защищены."
  },
  "footer.follow_us": {
    tr: "Bizi Takip Edin",
    en: "Follow Us",
    ka: "გამოგვყევით",
    ru: "Следите за нами"
  },
  "footer.about_us": {
    tr: "Hakkımızda",
    en: "About Us",
    ka: "ჩვენს შესახებ",
    ru: "О нас"
  },
  "footer.terms": {
    tr: "Şartlar ve Koşullar",
    en: "Terms & Conditions",
    ka: "წესები და პირობები",
    ru: "Правила и условия"
  },
  "footer.privacy": {
    tr: "Gizlilik Politikası",
    en: "Privacy Policy",
    ka: "კონფიდენციალურობის პოლიტიკა",
    ru: "Политика конфиденциальности"
  },
  "footer.responsible_gaming": {
    tr: "Sorumlu Oyun",
    en: "Responsible Gaming",
    ka: "პასუხისმგებლიანი თამაში",
    ru: "Ответственная игра"
  },
  "footer.faq": {
    tr: "SSS",
    en: "FAQ",
    ka: "ხშირად დასმული კითხვები",
    ru: "Часто задаваемые вопросы"
  },
  "footer.contact": {
    tr: "İletişim",
    en: "Contact",
    ka: "კონტაქტი",
    ru: "Контакты"
  },
  "footer.affiliate": {
    tr: "Ortaklık Programı",
    en: "Affiliate Program",
    ka: "პარტნიორული პროგრამა",
    ru: "Партнерская программа"
  }
};