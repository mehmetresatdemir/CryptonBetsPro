export type Language = 'tr' | 'en' | 'ka' | 'ru';

export type Translations = {
  [key: string]: {
    [locale in Language]: string;
  };
};

// Uygulama genelinde kullanılacak çeviriler
export const translations: Translations = {
  // Ödeme Adımları ve Güvenlik
  "payment.steps": {
    tr: "Adımlar",
    en: "Steps",
    ka: "ნაბიჯები",
    ru: "Шаги"
  },
  "payment.security_notice": {
    tr: "Güvenlik Bildirimi",
    en: "Security Notice",
    ka: "უსაფრთხოების შეტყობინება",
    ru: "Уведомление безопасности"
  },
  "payment.security_message": {
    tr: "Tüm işlemleriniz güvenli ve şifrelidir",
    en: "All your transactions are secure and encrypted",
    ka: "თქვენი ყველა ტრანზაქცია უსაფრთხო და დაშიფრულია",
    ru: "Все ваши транзакции безопасны и зашифрованы"
  },
  
  // Profil Alanı Çevirileri
  "profile.basic_info": {
    tr: "Temel Bilgiler",
    en: "Basic Information",
    ka: "ძირითადი ინფორმაცია",
    ru: "Основная информация"
  },
  "profile.account_settings": {
    tr: "Hesap Ayarları",
    en: "Account Settings",
    ka: "ანგარიშის პარამეტრები",
    ru: "Настройки аккаунта"
  },
  "profile.quick_settings": {
    tr: "Hızlı Ayarlar",
    en: "Quick Settings",
    ka: "სწრაფი პარამეტრები",
    ru: "Быстрые настройки"
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
  "profile.edit_profile": {
    tr: "Profili Düzenle",
    en: "Edit Profile",
    ka: "პროფილის რედაქტირება",
    ru: "Редактировать профиль"
  },
  "profile.change_password": {
    tr: "Şifre Değiştir",
    en: "Change Password",
    ka: "პაროლის შეცვლა",
    ru: "Изменить пароль"
  },
  "profile.last_changed": {
    tr: "Son değişim",
    en: "Last changed",
    ka: "ბოლოს შეცვლილია",
    ru: "Последнее изменение"
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
    en: "Confirm Password",
    ka: "პაროლის დადასტურება",
    ru: "Подтвердите пароль"
  },

  "profile.password_strong": {
    tr: "Güçlü",
    en: "Strong",
    ka: "ძლიერი",
    ru: "Надежный"
  },
  "profile.password_medium": {
    tr: "Orta",
    en: "Medium",
    ka: "საშუალო",
    ru: "Средний"
  },
  "profile.password_weak": {
    tr: "Zayıf",
    en: "Weak",
    ka: "სუსტი",
    ru: "Слабый"
  },
  "profile.update_password": {
    tr: "Şifreyi Güncelle",
    en: "Update Password",
    ka: "პაროლის განახლება",
    ru: "Обновить пароль"
  },
  "profile.language_settings": {
    tr: "Dil Ayarları",
    en: "Language Settings",
    ka: "ენის პარამეტრები",
    ru: "Языковые настройки"
  },
  "profile.selected": {
    tr: "Seçili",
    en: "Selected",
    ka: "არჩეული",
    ru: "Выбрано"
  },
  "profile.notification_settings": {
    tr: "Bildirim Ayarları",
    en: "Notification Settings",
    ka: "შეტყობინების პარამეტრები",
    ru: "Настройки уведомлений"
  },
  "profile.email_notifications": {
    tr: "E-posta Bildirimleri",
    en: "Email Notifications",
    ka: "ელფოსტის შეტყობინებები",
    ru: "Уведомления по электронной почте"
  },
  "profile.sms_notifications": {
    tr: "SMS Bildirimleri",
    en: "SMS Notifications",
    ka: "SMS შეტყობინებები",
    ru: "SMS-уведомления"
  },
  "profile.push_notifications": {
    tr: "Özel Teklif Bildirimleri",
    en: "Special Offer Notifications",
    ka: "სპეციალური შეთავაზების შეტყობინებები",
    ru: "Уведомления о специальных предложениях"
  },
  "profile.whatsapp_notifications": {
    tr: "WhatsApp Bildirimleri",
    en: "WhatsApp Notifications",
    ka: "WhatsApp შეტყობინებები",
    ru: "Уведомления WhatsApp"
  },
  "profile.security_settings": {
    tr: "Güvenlik Ayarları",
    en: "Security Settings",
    ka: "უსაფრთხოების პარამეტრები",
    ru: "Настройки безопасности"
  },
  "profile.activate": {
    tr: "Aktifleştir",
    en: "Activate",
    ka: "აქტივაცია",
    ru: "Активировать"
  },
  "profile.verified": {
    tr: "Doğrulandı",
    en: "Verified",
    ka: "დადასტურებულია",
    ru: "Подтверждено"
  },
  "profile.view": {
    tr: "Görüntüle",
    en: "View",
    ka: "ნახვა",
    ru: "Просмотр"
  },
  "profile.email_verification": {
    tr: "E-posta Doğrulaması",
    en: "Email Verification",
    ka: "ელფოსტის დადასტურება",
    ru: "Подтверждение электронной почты"
  },
  "profile.device_management": {
    tr: "Cihaz Yönetimi",
    en: "Device Management",
    ka: "მოწყობილობების მართვა",
    ru: "Управление устройствами"
  },
  "profile.session_settings": {
    tr: "Oturum Ayarları",
    en: "Session Settings",
    ka: "სეანსის პარამეტრები",
    ru: "Настройки сеанса"
  },
  "profile.last_login": {
    tr: "Son Giriş Tarihi",
    en: "Last Login Date",
    ka: "ბოლო შესვლის თარიღი",
    ru: "Дата последнего входа"
  },
  "profile.location": {
    tr: "Konum",
    en: "Location",
    ka: "მდებარეობა",
    ru: "Местоположение"
  },
  "profile.logout_all": {
    tr: "Tüm Cihazlardan Çıkış Yap",
    en: "Logout from All Devices",
    ka: "ყველა მოწყობილობიდან გამოსვლა",
    ru: "Выйти со всех устройств"
  },
  "profile.logout_this": {
    tr: "Bu Cihazdan Çıkış Yap",
    en: "Logout from This Device",
    ka: "ამ მოწყობილობიდან გამოსვლა",
    ru: "Выйти с этого устройства"
  },
  
  // Profil Sekmeleri
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
  
// Bahis Dağılımı ve İstatistikler
  "profile.bet_distribution": {
    tr: "Bahis Dağılımı",
    en: "Bet Distribution",
    ka: "ფსონების განაწილება",
    ru: "Распределение ставок"
  },
  "profile.most_played_games": {
    tr: "En Çok Oynanan Oyunlar",
    en: "Most Played Games",
    ka: "ყველაზე თამაშებული თამაშები",
    ru: "Самые играемые игры"
  },
  "profile.of_bets": {
    tr: "bahislerinizden",
    en: "of your bets",
    ka: "თქვენი ფსონებიდან",
    ru: "ваших ставок"
  },
  "profile.recent_bets": {
    tr: "Son Bahisler",
    en: "Recent Bets",
    ka: "ბოლო ფსონები",
    ru: "Недавние ставки"
  },
  "profile.completed": {
    tr: "Tamamlandı",
    en: "Completed",
    ka: "დასრულებულია",
    ru: "Завершено"
  },
  "profile.active_bonuses": {
    tr: "Aktif Bonuslar",
    en: "Active Bonuses",
    ka: "აქტიური ბონუსები",
    ru: "Активные бонусы"
  },
  "profile.available_bonuses": {
    tr: "Kullanılabilir Bonuslar",
    en: "Available Bonuses",
    ka: "ხელმისაწვდომი ბონუსები",
    ru: "Доступные бонусы"
  },
  "profile.finance_desc": {
    tr: "Finansal işlemlerinizi görüntüleyin ve yönetin",
    en: "View and manage your financial transactions",
    ka: "ნახეთ და მართეთ თქვენი ფინანსური ტრანზაქციები",
    ru: "Просмотр и управление финансовыми транзакциями"
  },
  "profile.transaction_history": {
    tr: "İşlem Geçmişi",
    en: "Transaction History",
    ka: "ტრანზაქციების ისტორია",
    ru: "История транзакций"
  },
  "profile.withdraw": {
    tr: "Para Çek",
    en: "Withdraw",
    ka: "გატანა",
    ru: "Вывод"
  },
  "profile.withdraw_now": {
    tr: "Şimdi Para Çek",
    en: "Withdraw Now",
    ka: "ახლავე გაიტანეთ",
    ru: "Вывести сейчас"
  },
  "profile.withdraw_desc": {
    tr: "Kazançlarınızı güvenli bir şekilde çekin",
    en: "Withdraw your winnings securely",
    ka: "გაიტანეთ თქვენი მოგება უსაფრთხოდ",
    ru: "Выводите ваши выигрыши безопасно"
  },
  "profile.bonus_desc": {
    tr: "Mevcut bonuslarınızı görüntüleyin ve yönetin",
    en: "View and manage your current bonuses",
    ka: "ნახეთ და მართეთ თქვენი მიმდინარე ბონუსები",
    ru: "Просмотр и управление текущими бонусами"
  },
  "profile.daily_cashback": {
    tr: "Günlük Nakit İadesi",
    en: "Daily Cashback",
    ka: "ყოველდღიური ქეშბექი",
    ru: "Ежедневный кэшбэк"
  },
  "profile.daily_cashback_desc": {
    tr: "Günlük kayıplarınızın bir kısmını geri alın",
    en: "Get back a portion of your daily losses",
    ka: "დაიბრუნეთ თქვენი ყოველდღიური დანაკარგების ნაწილი",
    ru: "Верните часть своих ежедневных потерь"
  },
  "profile.refer_friend": {
    tr: "Arkadaşını Davet Et",
    en: "Refer a Friend",
    ka: "მოიწვიეთ მეგობარი",
    ru: "Пригласи друга"
  },
  "profile.refer_friend_desc": {
    tr: "Arkadaşlarınızı davet edin ve bonus kazanın",
    en: "Invite your friends and earn bonuses",
    ka: "მოიწვიეთ მეგობრები და მიიღეთ ბონუსები",
    ru: "Пригласите друзей и получите бонусы"
  },
  "profile.claim_now": {
    tr: "Hemen Al",
    en: "Claim Now",
    ka: "ახლავე მიიღეთ",
    ru: "Получить сейчас"
  },
  "profile.invite_now": {
    tr: "Şimdi Davet Et",
    en: "Invite Now",
    ka: "ახლავე მოიწვიეთ",
    ru: "Пригласить сейчас"
  },
  "profile.see_details": {
    tr: "Detayları Gör",
    en: "See Details",
    ka: "დეტალების ნახვა",
    ru: "Смотреть детали"
  },
  "profile.wagering_requirement": {
    tr: "Çevrim Şartı",
    en: "Wagering Requirement",
    ka: "ფსონის მოთხოვნა",
    ru: "Требование по ставкам"
  },
  "profile.expires": {
    tr: "Son Kullanma",
    en: "Expires",
    ka: "ვადა გასდის",
    ru: "Истекает"
  },
  "profile.days": {
    tr: "gün",
    en: "days",
    ka: "დღე",
    ru: "дней"
  },
  "profile.two_factor": {
    tr: "İki Faktörlü Doğrulama",
    en: "Two-Factor Authentication",
    ka: "ორფაქტორიანი ავთენტიფიკაცია",
    ru: "Двухфакторная аутентификация"
  },
  "profile.2fa_desc": {
    tr: "Hesabınıza ekstra bir güvenlik katmanı ekleyin",
    en: "Add an extra layer of security to your account",
    ka: "დაამატეთ უსაფრთხოების დამატებითი ფენა თქვენს ანგარიშზე",
    ru: "Добавьте дополнительный уровень безопасности к вашей учетной записи"
  },
  "profile.enable_2fa": {
    tr: "İki Faktörlü Doğrulamayı Etkinleştir",
    en: "Enable Two-Factor Authentication",
    ka: "ორფაქტორიანი ავთენტიფიკაციის ჩართვა",
    ru: "Включить двухфакторную аутентификацию"
  },
  "profile.login_notifications": {
    tr: "Giriş Bildirimleri",
    en: "Login Notifications",
    ka: "შესვლის შეტყობინებები",
    ru: "Уведомления о входе"
  },
  "profile.login_notif_desc": {
    tr: "Hesabınıza her girişte bildirim alın",
    en: "Get notified every time your account is accessed",
    ka: "მიიღეთ შეტყობინება ყოველ ჯერზე, როდესაც თქვენს ანგარიშზე შესვლა ხდება",
    ru: "Получайте уведомления при каждом входе в вашу учетную запись"
  },
  "profile.update_password": {
    tr: "Şifreyi Güncelle",
    en: "Update Password",
    ka: "პაროლის განახლება",
    ru: "Обновить пароль"
  },
  "profile.password_req": {
    tr: "En az 8 karakter, bir büyük harf, bir küçük harf ve bir rakam içermelidir",
    en: "Minimum 8 characters with at least one uppercase, one lowercase and one number",
    ka: "მინიმუმ 8 სიმბოლო, სულ მცირე ერთი დიდი ასო, ერთი პატარა ასო და ერთი ციფრი",
    ru: "Минимум 8 символов с как минимум одной заглавной буквой, одной строчной буквой и одной цифрой"
  },
  "profile.email_notif_desc": {
    tr: "Önemli güncellemeler, bonuslar ve promosyonlar hakkında e-posta alın",
    en: "Receive emails about important updates, bonuses, and promotions",
    ka: "მიიღეთ ელფოსტა მნიშვნელოვანი განახლებების, ბონუსებისა და აქციების შესახებ",
    ru: "Получайте электронные письма о важных обновлениях, бонусах и акциях"
  },
  "profile.sms_notifications": {
    tr: "SMS Bildirimleri",
    en: "SMS Notifications",
    ka: "SMS შეტყობინებები",
    ru: "SMS-уведомления"
  },
  "profile.sms_notif_desc": {
    tr: "Özel teklifler ve kazançlar hakkında SMS alın",
    en: "Receive SMS about special offers and winnings",
    ka: "მიიღეთ SMS სპეციალური შეთავაზებებისა და მოგებების შესახებ",
    ru: "Получайте SMS о специальных предложениях и выигрышах"
  },
  "profile.promo_notif_desc": {
    tr: "Özel promosyonlar, bonuslar ve etkinlikler hakkında bildirimler alın",
    en: "Receive notifications about special promotions, bonuses, and events",
    ka: "მიიღეთ შეტყობინებები სპეციალური აქციების, ბონუსებისა და ღონისძიებების შესახებ",
    ru: "Получайте уведомления о специальных акциях, бонусах и мероприятиях"
  },
  "profile.appearance": {
    tr: "Görünüm",
    en: "Appearance",
    ka: "გარეგნობა",
    ru: "Внешний вид"
  },
  "profile.save_settings": {
    tr: "Tercihleri Kaydet",
    en: "Save Preferences",
    ka: "პარამეტრების შენახვა",
    ru: "Сохранить настройки"
  },

  // Para Yatırma Modalı
  "payment.deposit_title": {
    tr: "Para Yatırma",
    en: "Deposit",
    ka: "დეპოზიტი",
    ru: "Депозит"
  },
  "payment.deposit_subtitle": {
    tr: "Hesabınıza güvenli ve hızlı bir şekilde para yatırın",
    en: "Deposit money to your account safely and quickly",
    ka: "შეიტანეთ ფული თქვენს ანგარიშზე უსაფრთხოდ და სწრაფად",
    ru: "Внесите деньги на свой счет безопасно и быстро"
  },
  "payment.deposit": {
    tr: "Para Yatır",
    en: "Deposit",
    ka: "დეპოზიტი",
    ru: "Депозит"
  },
  "payment.papara_desc": {
    tr: "Papara hesabınızla hızlı para yatırma",
    en: "Fast deposit with your Papara account",
    ka: "სწრაფი დეპოზიტი თქვენი Papara ანგარიშით",
    ru: "Быстрое пополнение с помощью учетной записи Papara"
  },
  "payment.instant": {
    tr: "Anında",
    en: "Instant",
    ka: "მყისიერი",
    ru: "Мгновенно"
  },
  "payment.bank_transfer": {
    tr: "Havale/EFT",
    en: "Bank Transfer",
    ka: "საბანკო გადარიცხვა",
    ru: "Банковский перевод"
  },
  "payment.bank_transfer_desc": {
    tr: "Tüm bankalara hızlı transfer",
    en: "Fast transfer to all banks",
    ka: "სწრაფი გადარიცხვა ყველა ბანკში",
    ru: "Быстрый перевод во все банки"
  },
  "payment.hours": {
    tr: "{count} saat içinde",
    en: "Within {count} hours",
    ka: "{count} საათის განმავლობაში",
    ru: "В течение {count} часов"
  },
  "payment.mobile_banking": {
    tr: "Mobil bankacılıkla kolay ve hızlı yatırım",
    en: "Easy and fast deposit with mobile banking",
    ka: "ადვილი და სწრაფი დეპოზიტი მობილური ბანკინგით",
    ru: "Легкое и быстрое пополнение с помощью мобильного банкинга"
  },
  "payment.paykasa_desc": {
    tr: "Güvenli ve hızlı online ödeme",
    en: "Secure and fast online payment",
    ka: "უსაფრთხო და სწრაფი ონლაინ გადახდა",
    ru: "Безопасный и быстрый онлайн-платеж"
  },
  "payment.crypto_desc": {
    tr: "Bitcoin ile yatırım yapın",
    en: "Make deposit with Bitcoin",
    ka: "გააკეთეთ დეპოზიტი Bitcoin- ით",
    ru: "Сделайте депозит с помощью Bitcoin"
  },
  "payment.minutes": {
    tr: "{count} dakika",
    en: "{count} minutes",
    ka: "{count} წუთი",
    ru: "{count} минут"
  },
  "payment.astropay_desc": {
    tr: "Ön ödemeli kart ile yatırım",
    en: "Deposit with prepaid card",
    ka: "დეპოზიტი წინასწარ გადახდილი ბარათით",
    ru: "Депозит с предоплаченной картой"
  },
  "payment.envoysoft_desc": {
    tr: "Hızlı ve güvenli para transferi",
    en: "Fast and secure money transfer",
    ka: "სწრაფი და უსაფრთხო ფულის გადარიცხვა",
    ru: "Быстрый и безопасный перевод денег"
  },
  "payment.payfix_desc": {
    tr: "Elektronik cüzdan ile anında para yatırma",
    en: "Instant deposit with electronic wallet",
    ka: "ინსტანტური დეპოზიტი ელექტრონული საფულით",
    ru: "Мгновенный депозит с электронным кошельком"
  },
  "payment.select_method": {
    tr: "Ödeme Yöntemi",
    en: "Payment Method",
    ka: "გადახდის მეთოდი",
    ru: "Способ оплаты"
  },
  "payment.amount": {
    tr: "Miktar",
    en: "Amount",
    ka: "რაოდენობა",
    ru: "Сумма"
  },
  "payment.confirmation": {
    tr: "Onay",
    en: "Confirmation",
    ka: "დადასტურება",
    ru: "Подтверждение"
  },
  "payment.choose_method": {
    tr: "Ödeme Yönteminizi Seçin",
    en: "Choose Your Payment Method",
    ka: "აირჩიეთ თქვენი გადახდის მეთოდი",
    ru: "Выберите способ оплаты"
  },
  "payment.popular": {
    tr: "POPÜLER",
    en: "POPULAR",
    ka: "პოპულარული",
    ru: "ПОПУЛЯРНЫЙ"
  },
  "payment.bonus": {
    tr: "BONUS",
    en: "BONUS",
    ka: "ბონუსი",
    ru: "БОНУС"
  },
  "payment.min": {
    tr: "Min",
    en: "Min",
    ka: "მინ",
    ru: "Мин"
  },
  "payment.time": {
    tr: "Süre",
    en: "Time",
    ka: "დრო",
    ru: "Время"
  },
  "payment.continue": {
    tr: "Devam Et",
    en: "Continue",
    ka: "გაგრძელება",
    ru: "Продолжить"
  },
  "payment.enter_deposit_amount": {
    tr: "Yatırım Miktarını Girin",
    en: "Enter Deposit Amount",
    ka: "შეიყვანეთ დეპოზიტის ოდენობა",
    ru: "Введите сумму депозита"
  },
  "payment.selected_method": {
    tr: "Seçilen Yöntem",
    en: "Selected Method",
    ka: "არჩეული მეთოდი",
    ru: "Выбранный метод"
  },
  "payment.limits": {
    tr: "Limitler",
    en: "Limits",
    ka: "ლიმიტები",
    ru: "Лимиты"
  },
  "payment.deposit_bonus": {
    tr: "{percent}% Yatırım Bonusu",
    en: "{percent}% Deposit Bonus",
    ka: "{percent}% დეპოზიტის ბონუსი",
    ru: "{percent}% Бонус на депозит"
  },
  "payment.bonus_details": {
    tr: "Yatırımınızın {percent}%'i kadar bonus kazanın!",
    en: "Get {percent}% bonus on your deposit!",
    ka: "მიიღეთ {percent}% ბონუსი თქვენს დეპოზიტზე!",
    ru: "Получите {percent}% бонус на депозит!"
  },
  "payment.back": {
    tr: "Geri",
    en: "Back",
    ka: "უკან",
    ru: "Назад"
  },
  "payment.confirm_deposit": {
    tr: "Yatırımı Onayla",
    en: "Confirm Deposit",
    ka: "დაადასტურეთ დეპოზიტი",
    ru: "Подтвердите депозит"
  },
  "payment.transaction_details": {
    tr: "İşlem Detayları",
    en: "Transaction Details",
    ka: "ტრანზაქციის დეტალები",
    ru: "Детали транзакции"
  },
  "payment.payment_method": {
    tr: "Ödeme Yöntemi",
    en: "Payment Method",
    ka: "გადახდის მეთოდი",
    ru: "Метод оплаты"
  },
  "payment.deposit_amount": {
    tr: "Yatırım Miktarı",
    en: "Deposit Amount",
    ka: "დეპოზიტის თანხა",
    ru: "Сумма депозита"
  },
  "payment.total_credited": {
    tr: "Hesaba Geçecek Toplam",
    en: "Total Credited",
    ka: "ჯამური კრედიტი",
    ru: "Итого зачислено"
  },
  "payment.processing_time": {
    tr: "İşlem Süresi",
    en: "Processing Time",
    ka: "დამუშავების დრო",
    ru: "Время обработки"
  },
  "payment.confirmation_info": {
    tr: "Onayladıktan sonra ödeme sayfasına yönlendirileceksiniz. İşlem tamamlandığında bakiyeniz otomatik olarak güncellenecektir.",
    en: "After confirmation, you will be redirected to the payment page. Your balance will be updated automatically when the transaction is completed.",
    ka: "დადასტურების შემდეგ, თქვენ გადამისამართდებით გადახდის გვერდზე. თქვენი ბალანსი ავტომატურად განახლდება ტრანზაქციის დასრულების შემდეგ.",
    ru: "После подтверждения вы будете перенаправлены на страницу оплаты. Ваш баланс будет обновлен автоматически после завершения транзакции."
  },
  "payment.enter_amount": {
    tr: "Lütfen yatırmak istediğiniz miktarı girin",
    en: "Please enter the amount you want to deposit",
    ka: "გთხოვთ შეიყვანოთ თანხა, რომლის შეტანაც გსურთ",
    ru: "Пожалуйста, введите сумму, которую вы хотите внести"
  },
  "payment.min_amount_error": {
    tr: "Minimum yatırım tutarı {min}₺'dir",
    en: "Minimum deposit amount is {min}₺",
    ka: "მინიმალური დეპოზიტის თანხაა {min}₺",
    ru: "Минимальная сумма депозита составляет {min}₺"
  },
  "payment.max_amount_error": {
    tr: "Maksimum yatırım tutarı {max}₺'dir",
    en: "Maximum deposit amount is {max}₺",
    ka: "მაქსიმალური დეპოზიტის თანხაა {max}₺",
    ru: "Максимальная сумма депозита составляет {max}₺"
  },
  "payment.success": {
    tr: "İşlem Başarılı!",
    en: "Transaction Successful!",
    ka: "ტრანზაქცია წარმატებულია!",
    ru: "Транзакция успешна!"
  },
  "payment.processing": {
    tr: "İşleniyor...",
    en: "Processing...",
    ka: "მუშავდება...",
    ru: "Обработка..."
  },
  "payment.confirm_and_pay": {
    tr: "Onayla ve Öde",
    en: "Confirm and Pay",
    ka: "დაადასტურეთ და გადაიხადეთ",
    ru: "Подтвердить и оплатить"
  },
  "payment.secure_transaction": {
    tr: "Tüm işlemler SSL ile korunmaktadır",
    en: "All transactions are protected with SSL",
    ka: "ყველა ტრანზაქცია დაცულია SSL- ით",
    ru: "Все транзакции защищены SSL"
  },
  "payment.privacy_protected": {
    tr: "Gizlilik korunmaktadır",
    en: "Privacy is protected",
    ka: "კონფიდენციალურობა დაცულია",
    ru: "Конфиденциальность защищена"
  },
  
  
  // Ana Sayfa Başlıkları
  "home.welcome": {
    tr: "Cryptonbets'e Hoş Geldiniz",
    en: "Welcome to Cryptonbets",
    ka: "მოგესალმებით Cryptonbets-ზე",
    ru: "Добро пожаловать в Cryptonbets"
  },
  "home.slogan": {
    tr: "En güvenilir çevrimiçi bahis platformu",
    en: "The most trusted online betting platform",
    ka: "ყველაზე სანდო ონლაინ ფსონების პლატფორმა",
    ru: "Самая надежная онлайн-платформа для ставок"
  },
  "banner.vip_membership": {
    tr: "VIP ÜYELİK",
    en: "VIP MEMBERSHIP",
    ka: "VIP წევრობა",
    ru: "VIP ЧЛЕНСТВО"
  },
  "banner.bonuses": {
    tr: "BONUSLAR",
    en: "BONUSES",
    ka: "ბონუსები",
    ru: "БОНУСЫ"
  },
  
  // Bonuslar Bölümü
  "home.bonuses.title": {
    tr: "BONUSLAR",
    en: "BONUSES",
    ka: "ბონუსები",
    ru: "БОНУСЫ"
  },
  "home.bonuses.description": {
    tr: "En yüksek bonuslar ve promosyonlar Cryptonbets'te sizi bekliyor",
    en: "The highest bonuses and promotions await you at Cryptonbets",
    ka: "უმაღლესი ბონუსები და აქციები Cryptonbets-ზე გელოდებათ",
    ru: "Самые высокие бонусы и акции ждут вас в Cryptonbets"
  },
  
  // Bölüm Başlıkları
  "section.features": {
    tr: "SİTE ÖZELLİKLERİ",
    en: "SITE FEATURES",
    ka: "საიტის მახასიათებლები",
    ru: "ОСОБЕННОСТИ САЙТА"
  },
  "section.leadership": {
    tr: "LİDERLİK TABLOSU",
    en: "LEADERBOARD",
    ka: "ლიდერბორდი",
    ru: "ТАБЛИЦА ЛИДЕРОВ"
  },
  "section.bonus": {
    tr: "BONUSLAR",
    en: "BONUSES",
    ka: "ბონუსები",
    ru: "БОНУСЫ"
  },
  "section.bonuses": {
    tr: "BONUSLAR",
    en: "BONUSES",
    ka: "ბონუსები",
    ru: "БОНУСЫ"
  },
  "section.vip": {
    tr: "VIP",
    en: "VIP",
    ka: "VIP",
    ru: "VIP"
  },

  // Popüler Slot Oyunları Bölümü
  "home.popularSlots.title": {
    tr: "POPÜLER SLOT OYUNLARI",
    en: "POPULAR SLOT GAMES",
    ka: "პოპულარული სლოტ თამაშები",
    ru: "ПОПУЛЯРНЫЕ ИГРОВЫЕ АВТОМАТЫ"
  },
  "home.popularSlots.description": {
    tr: "En popüler ve kazançlı slot oyunları burada",
    en: "The most popular and profitable slot games are here",
    ka: "ყველაზე პოპულარული და მომგებიანი სლოტ თამაშები აქაა",
    ru: "Здесь самые популярные и прибыльные игровые автоматы"
  },
  "home.popularSlots.viewAll": {
    tr: "Tümünü Gör",
    en: "View All",
    ka: "ყველას ნახვა",
    ru: "Посмотреть все"
  },
  
  // Popüler Casino Oyunları Bölümü
  "home.popularCasino.title": {
    tr: "POPÜLER CASINO OYUNLARI",
    en: "POPULAR CASINO GAMES",
    ka: "პოპულარული კაზინოს თამაშები",
    ru: "ПОПУЛЯРНЫЕ КАЗИНО ИГРЫ"
  },
  "home.popularCasino.description": {
    tr: "En çok oynanan canlı casino oyunları",
    en: "Most played live casino games",
    ka: "ყველაზე პოპულარული ლაივ კაზინოს თამაშები",
    ru: "Самые популярные игры живого казино"
  },
  "home.popularCasino.viewAll": {
    tr: "Tümünü Gör",
    en: "View All",
    ka: "ყველას ნახვა",
    ru: "Посмотреть все"
  },
  
  // Oyun Sağlayıcıları Bölümü
  "home.gameProviders.title": {
    tr: "OYUN SAĞLAYICILARI",
    en: "GAME PROVIDERS",
    ka: "თამაშის პროვაიდერები",
    ru: "ПОСТАВЩИКИ ИГР"
  },
  "home.gameProviders.description": {
    tr: "En güvenilir altyapılarla hizmetinizdeyiz",
    en: "At your service with the most reliable infrastructures",
    ka: "თქვენს სამსახურში ყველაზე საიმედო ინფრასტრუქტურით",
    ru: "К вашим услугам с самой надежной инфраструктурой"
  },
  
  // Finans Sağlayıcıları Bölümü
  "home.financeProviders.title": {
    tr: "FİNANS SAĞLAYICILARI",
    en: "FINANCE PROVIDERS",
    ka: "ფინანსური პროვაიდერები",
    ru: "ФИНАНСОВЫЕ ПОСТАВЩИКИ"
  },
  "home.financeProviders.description": {
    tr: "Güvenli ve hızlı para transferi",
    en: "Safe and fast money transfer",
    ka: "უსაფრთხო და სწრაფი ფულის გადარიცხვა",
    ru: "Безопасный и быстрый перевод денег"
  },
  
  // Lisans Bölümü
  "home.license.title": {
    tr: "LİSANS BİLGİLERİ",
    en: "LICENSE INFORMATION",
    ka: "სალიცენზიო ინფორმაცია",
    ru: "ИНФОРМАЦИЯ О ЛИЦЕНЗИИ"
  },
  "home.license.description": {
    tr: "Anjuan Gaming lisanslı güvenilir bahis sitesi",
    en: "Anjuan Gaming licensed trusted betting site",
    ka: "Anjuan Gaming ლიცენზირებული სანდო ფსონების საიტი",
    ru: "Лицензированный надежный сайт ставок Anjuan Gaming"
  },
  
  // Footer
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
    ru: "Подписывайтесь на нас"
  },
  "footer.terms": {
    tr: "Kullanım Şartları",
    en: "Terms of Use",
    ka: "გამოყენების პირობები",
    ru: "Условия использования"
  },
  "footer.privacy": {
    tr: "Gizlilik Politikası",
    en: "Privacy Policy",
    ka: "კონფიდენციალურობის პოლიტიკა",
    ru: "Политика конфиденциальности"
  },
  
  // Header
  "header.login": {
    tr: "Giriş Yap",
    en: "Login",
    ka: "შესვლა",
    ru: "Войти"
  },
  "header.register": {
    tr: "Kayıt Ol",
    en: "Register",
    ka: "რეგისტრაცია",
    ru: "Регистрация"
  },
  "header.welcome": {
    tr: "HOŞGELDİNİZ",
    en: "WELCOME",
    ka: "კეთილი იყოს",
    ru: "ДОБРО ПОЖАЛОВАТЬ"
  },
  "header.affiliate": {
    tr: "AFFILIATE PROGRAM",
    en: "AFFILIATE PROGRAM",
    ka: "პარტნიორული პროგრამა",
    ru: "ПАРТНЕРСКАЯ ПРОГРАММА"
  },
  "header.commission": {
    tr: "Yüksek Komisyon",
    en: "High Commission",
    ka: "მაღალი საკომისიო",
    ru: "Высокая комиссия"
  },
  "header.licensed_site": {
    tr: "Lisanslı Bahis Sitesi",
    en: "Licensed Betting Site",
    ka: "ლიცენზირებული ფსონების საიტი",
    ru: "Лицензированный сайт ставок"
  },
  "header.official_sponsor": {
    tr: "Resmi Sponsorumuz",
    en: "Our Official Sponsor",
    ka: "ჩვენი ოფიციალური სპონსორი",
    ru: "Наш официальный спонсор"
  },
  "header.telegram_channel": {
    tr: "Telegram Kanalımız",
    en: "Our Telegram Channel",
    ka: "ჩვენი Telegram არხი",
    ru: "Наш Telegram канал"
  },
  
  // Sidebar Menü
  "sidebar.slot": {
    tr: "SLOT",
    en: "SLOT",
    ka: "სლოტი",
    ru: "СЛОТ"
  },
  "sidebar.casino": {
    tr: "CASINO",
    en: "CASINO",
    ka: "კაზინო",
    ru: "КАЗИНО"
  },
  "sidebar.games": {
    tr: "OYUNLAR",
    en: "GAMES",
    ka: "თამაშები",
    ru: "ИГРЫ"
  },
  "sidebar.vip": {
    tr: "VIP",
    en: "VIP",
    ka: "VIP",
    ru: "VIP"
  },
  "sidebar.bonuses": {
    tr: "BONUSLAR",
    en: "BONUSES",
    ka: "ბონუსები",
    ru: "БОНУСЫ"
  },
  "sidebar.sports": {
    tr: "SPOR",
    en: "SPORTS",
    ka: "სპორტი",
    ru: "СПОРТ"
  },
  "sidebar.esports": {
    tr: "E-SPOR",
    en: "E-SPORTS",
    ka: "ელექტრონული სპორტი",
    ru: "КИБЕРСПОРТ"
  },
  "sidebar.home": {
    tr: "ANA SAYFA",
    en: "HOME",
    ka: "მთავარი",
    ru: "ГЛАВНАЯ"
  },
  "sidebar.social": {
    tr: "SOSYAL",
    en: "SOCIAL",
    ka: "სოციალური",
    ru: "СОЦИАЛЬНАЯ"
  },
  
  // Kayıt ve Giriş Formları
  "auth.login_title": {
    tr: "Giriş Yap",
    en: "Login",
    ka: "შესვლა",
    ru: "Вход"
  },
  "auth.login_subtitle": {
    tr: "Hesabınıza giriş yaparak deneyiminize kaldığınız yerden devam edin.",
    en: "Continue from where you left off by logging into your account.",
    ka: "გააგრძელეთ იქიდან, სადაც გაჩერდით, თქვენს ანგარიშზე შესვლით.",
    ru: "Продолжите с того места, где вы остановились, войдя в свой аккаунт."
  },
  "auth.register_title": {
    tr: "Yeni Hesap Oluştur",
    en: "Create New Account",
    ka: "ახალი ანგარიშის შექმნა",
    ru: "Создать новый аккаунт"
  },
  "auth.register_subtitle": {
    tr: "Hızlı ve güvenli bir şekilde yeni bir hesap oluşturarak bahis dünyasına adım atın.",
    en: "Step into the betting world by creating a new account quickly and securely.",
    ka: "შედით სანაძლეოების სამყაროში ახალი ანგარიშის სწრაფად და უსაფრთხოდ შექმნით.",
    ru: "Войдите в мир ставок, быстро и безопасно создав новую учетную запись."
  },
  "auth.username_placeholder": {
    tr: "Kullanıcı adınız",
    en: "Your username", 
    ka: "თქვენი მომხმარებლის სახელი",
    ru: "Ваше имя пользователя"
  },
  "auth.password_placeholder": {
    tr: "Şifreniz",
    en: "Your password",
    ka: "თქვენი პაროლი",
    ru: "Ваш пароль"
  },
  "auth.confirm_password": {
    tr: "Şifre Tekrar",
    en: "Confirm Password",
    ka: "პაროლის დადასტურება",
    ru: "Подтверждение пароля"
  },
  "auth.confirm_password_placeholder": {
    tr: "Şifrenizi tekrar girin",
    en: "Confirm your password",
    ka: "დაადასტურეთ თქვენი პაროლი",
    ru: "Подтвердите ваш пароль"
  },
  "auth.email_placeholder": {
    tr: "E-posta adresiniz",
    en: "Your email address",
    ka: "თქვენი ელფოსტა",
    ru: "Ваш электронный адрес"
  },
  "auth.phone": {
    tr: "Telefon Numarası",
    en: "Phone Number",
    ka: "ტელეფონის ნომერი",
    ru: "Номер телефона"
  },
  "auth.phone_placeholder": {
    tr: "Telefon numaranız",
    en: "Your phone number",
    ka: "თქვენი ტელეფონის ნომერი",
    ru: "Ваш номер телефона"
  },
  "auth.birthdate": {
    tr: "Doğum Tarihi",
    en: "Birth Date", 
    ka: "დაბადების თარიღი",
    ru: "Дата рождения"
  },
  "auth.remember_me": {
    tr: "Beni Hatırla",
    en: "Remember Me",
    ka: "დამიმახსოვრე",
    ru: "Запомнить меня"
  },
  "auth.forgot_password": {
    tr: "Şifremi Unuttum",
    en: "Forgot Password",
    ka: "პაროლი დაგავიწყდათ",
    ru: "Забыли пароль"
  },
  "auth.login_button": {
    tr: "GİRİŞ YAP", 
    en: "LOGIN",
    ka: "შესვლა",
    ru: "ВОЙТИ"
  },
  "auth.register_button": {
    tr: "KAYIT OL",
    en: "REGISTER",
    ka: "რეგისტრაცია",
    ru: "РЕГИСТРАЦИЯ"
  },
  "auth.secure_login": {
    tr: "Güvenli ve şifrelenmiş bağlantı ile giriş yapıyorsunuz",
    en: "You are logging in with a secure and encrypted connection",
    ka: "შედიხართ უსაფრთხო და დაშიფრული კავშირით",
    ru: "Вы входите в систему с использованием безопасного и зашифрованного соединения"
  },
  "auth.secure_register": {
    tr: "Verileriniz 256-bit şifreleme ile korunmaktadır",
    en: "Your data is protected with 256-bit encryption",
    ka: "თქვენი მონაცემები დაცულია 256-ბიტიანი დაშიფვრით",
    ru: "Ваши данные защищены 256-битным шифрованием"
  },
  "auth.or_option": {
    tr: "veya",
    en: "or",
    ka: "ან",
    ru: "или"
  },
  "auth.need_account": {
    tr: "Hesabınız yok mu?",
    en: "Don't have an account?",
    ka: "არ გაქვთ ანგარიში?",
    ru: "Нет учетной записи?"
  },
  "auth.have_account": {
    tr: "Zaten hesabınız var mı?",
    en: "Already have an account?",
    ka: "უკვე გაქვთ ანგარიში?",
    ru: "Уже есть аккаунт?"
  },
  "auth.create_account": {
    tr: "Hemen Kayıt Olun",
    en: "Register Now",
    ka: "დარეგისტრირდით ახლავე",
    ru: "Зарегистрироваться сейчас"
  },
  "auth.accept_terms": {
    tr: "Üyelik sözleşmesini ve",
    en: "I have read and accept the",
    ka: "წავიკითხე და ვეთანხმები",
    ru: "Я прочитал и принимаю"
  },
  "auth.terms_and_conditions": {
    tr: "gizlilik politikasını",
    en: "terms and conditions",
    ka: "წესებს და პირობებს",
    ru: "условия и положения"
  },
  "auth.read_and_accept": {
    tr: "okudum, kabul ediyorum.",
    en: "of membership.",
    ka: "წევრობის.",
    ru: "членства."
  },
  "auth.username": {
    tr: "Kullanıcı Adı",
    en: "Username",
    ka: "მომხმარებლის სახელი",
    ru: "Имя пользователя"
  },
  "auth.email": {
    tr: "E-posta",
    en: "Email",
    ka: "ელ-ფოსტა",
    ru: "Эл. почта"
  },
  "auth.password": {
    tr: "Şifre",
    en: "Password",
    ka: "პაროლი",
    ru: "Пароль"
  },
  "auth.confirmPassword": {
    tr: "Şifreyi Onayla",
    en: "Confirm Password",
    ka: "დაადასტურეთ პაროლი",
    ru: "Подтвердите пароль"
  },
  "auth.forgotPassword": {
    tr: "Şifremi Unuttum",
    en: "Forgot Password",
    ka: "პაროლი დამავიწყდა",
    ru: "Забыли пароль"
  },
  "auth.loginButton": {
    tr: "GİRİŞ YAP",
    en: "LOGIN",
    ka: "შესვლა",
    ru: "ВОЙТИ"
  },
  "auth.registerButton": {
    tr: "KAYIT OL",
    en: "REGISTER",
    ka: "რეგისტრაცია",
    ru: "РЕГИСТРАЦИЯ"
  },
  "auth.loginTitle": {
    tr: "GİRİŞ YAP",
    en: "LOGIN",
    ka: "შესვლა",
    ru: "ВХОД"
  },
  "auth.registerTitle": {
    tr: "KAYIT OL",
    en: "REGISTER",
    ka: "რეგისტრაცია",
    ru: "РЕГИСТРАЦИЯ"
  },
  "auth.rememberMe": {
    tr: "Beni Hatırla",
    en: "Remember Me",
    ka: "დამიმახსოვრე",
    ru: "Запомнить меня"
  },
  
  // Mobil Alt Menü
  "mobile.home": {
    tr: "Ana Sayfa",
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
  "mobile.slot": {
    tr: "Slot",
    en: "Slot",
    ka: "სლოტი",
    ru: "Слот"
  },
  "mobile.profile": {
    tr: "Profil",
    en: "Profile",
    ka: "პროფილი",
    ru: "Профиль"
  },
  
  // Site Özellikleri
  "site.secure_gaming": {
    tr: "Güvenli Oyun",
    en: "Secure Gaming",
    ka: "უსაფრთხო თამაში",
    ru: "Безопасная игра"
  },
  "site.secure_gaming_desc": {
    tr: "SSL şifrelemeli güvenli sistem",
    en: "Secure system with SSL encryption",
    ka: "უსაფრთხო სისტემა SSL დაშიფვრით",
    ru: "Безопасная система с SSL-шифрованием"
  },
  "site.fast_withdrawal": {
    tr: "Hızlı Çekim",
    en: "Fast Withdrawal",
    ka: "სწრაფი გამოტანა",
    ru: "Быстрый вывод"
  },
  "site.fast_withdrawal_desc": {
    tr: "10 dakikada paranız hesabınızda",
    en: "Your money in your account in 10 minutes",
    ka: "თქვენი ფული თქვენს ანგარიშზე 10 წუთში",
    ru: "Ваши деньги на вашем счете за 10 минут"
  },
  "site.support_24_7": {
    tr: "7/24 Destek",
    en: "24/7 Support",
    ka: "მხარდაჭერა 24/7",
    ru: "Поддержка 24/7"
  },
  "site.support_24_7_desc": {
    tr: "Kesintisiz müşteri hizmetleri",
    en: "Uninterrupted customer service",
    ka: "შეუფერხებელი მომხმარებელთა მომსახურება",
    ru: "Бесперебойное обслуживание клиентов"
  },
  "site.easy_payment": {
    tr: "Kolay Ödeme",
    en: "Easy Payment",
    ka: "მარტივი გადახდა",
    ru: "Легкая оплата"
  },
  "site.easy_payment_desc": {
    tr: "Çoklu ödeme seçenekleri",
    en: "Multiple payment options",
    ka: "გადახდის მრავალი ვარიანტი",
    ru: "Несколько вариантов оплаты"
  },
  "leaderboard.highest_win": {
    tr: "En Yüksek Kazanç",
    en: "Highest Win",
    ka: "ყველაზე მაღალი მოგება",
    ru: "Самый высокий выигрыш"
  },
  "leaderboard.top_depositor": {
    tr: "En Çok Yatırım Yapan",
    en: "Top Depositor",
    ka: "მთავარი შემომტანი",
    ru: "Лучший вкладчик"
  },
  
  "home.most_preferred_site": {
    tr: "SEKTÖRÜN EN ÇOK TERCİH EDİLEN SİTESİ",
    en: "THE MOST PREFERRED SITE IN THE INDUSTRY",
    ka: "ყველაზე პრეფერენციული საიტი ინდუსტრიაში",
    ru: "САМЫЙ ПРЕДПОЧИТАЕМЫЙ САЙТ В ИНДУСТРИИ"
  },
  
  // Bonuslar
  "bonuses.free_spin": {
    tr: "Bedava Çevirme",
    en: "Free Spin",
    ka: "უფასო ტრიალი",
    ru: "Бесплатное вращение"
  },
  "bonuses.papara_bonus": {
    tr: "Papara Bonusu",
    en: "Papara Bonus",
    ka: "Papara ბონუსი",
    ru: "Бонус Papara"
  },
  "bonuses.first_deposit": {
    tr: "İlk Yatırım",
    en: "First Deposit",
    ka: "პირველი შენატანი",
    ru: "Первый депозит"
  },
  "bonuses.wager_free": {
    tr: "Çevrimsiz",
    en: "Wager Free",
    ka: "უბრუნავი",
    ru: "Без отыгрыша"
  },
  "bonuses.live_casino": {
    tr: "Canlı Casino",
    en: "Live Casino",
    ka: "ცოცხალი კაზინო",
    ru: "Живое казино"
  },
  "bonuses.all_bonuses": {
    tr: "Tüm Bonuslar",
    en: "All Bonuses",
    ka: "ყველა ბონუსი",
    ru: "Все бонусы"
  },
  "bonuses.new_bonuses": {
    tr: "Yeni Bonuslar",
    en: "New Bonuses",
    ka: "ახალი ბონუსები",
    ru: "Новые бонусы"
  },
  "bonuses.info_text": {
    tr: "Günlük ve haftalık bonusları kaçırmayın!",
    en: "Don't miss daily and weekly bonuses!",
    ka: "არ გამოტოვოთ ყოველდღიური და ყოველკვირეული ბონუსები!",
    ru: "Не пропустите ежедневные и еженедельные бонусы!"
  },
  "bonuses.vip_club": {
    tr: "VIP Kulüp",
    en: "VIP Club",
    ka: "VIP კლუბი",
    ru: "VIP Клуб"
  },
  "bonuses.premium": {
    tr: "Premium",
    en: "Premium",
    ka: "პრემიუმი",
    ru: "Премиум"
  },
  "bonuses.daily_wheel": {
    tr: "Günlük Çark",
    en: "Daily Wheel",
    ka: "ყოველდღიური ბორბალი",
    ru: "Ежедневное колесо"
  },
  "bonuses.fast_games": {
    tr: "Hızlı Oyunlar",
    en: "Fast Games",
    ka: "სწრაფი თამაშები",
    ru: "Быстрые игры"
  },
  "bonuses.deposit_bonus": {
    tr: "Yatırım Bonusu",
    en: "Deposit Bonus",
    ka: "ანაბრის ბონუსი",
    ru: "Бонус на депозит"
  },
  "bonuses.cashback": {
    tr: "Kayıp Bonusu",
    en: "Cashback",
    ka: "ქეშბექი",
    ru: "Кэшбэк"
  },
  "bonuses.welcome": {
    tr: "Hoşgeldin Bonusu",
    en: "Welcome Bonus",
    ka: "მისასალმებელი ბონუსი",
    ru: "Приветственный бонус"
  },
  "bonuses.casino_bonus": {
    tr: "Casino Bonusu",
    en: "Casino Bonus",
    ka: "კაზინოს ბონუსი",
    ru: "Бонус казино"
  },
  "bonuses.freespin": {
    tr: "Bedava Çevirme",
    en: "Free Spins",
    ka: "უფასო ტრიალები",
    ru: "Бесплатные вращения"
  },
  
  // Bonus İkonları
  "bonuses.icon.vip": {
    tr: "VIP",
    en: "VIP",
    ka: "VIP",
    ru: "VIP"
  },
  "bonuses.icon.vip_club": {
    tr: "Kulüp",
    en: "Club",
    ka: "კლუბი",
    ru: "Клуб"
  },
  "bonuses.icon.premium": {
    tr: "Premium",
    en: "Premium",
    ka: "პრემიუმი",
    ru: "Премиум"
  },
  "bonuses.icon.bonus": {
    tr: "Bonus",
    en: "Bonus",
    ka: "ბონუსი",
    ru: "Бонус"
  },
  "bonuses.icon.wheel": {
    tr: "Çark",
    en: "Wheel",
    ka: "ბორბალი",
    ru: "Колесо"
  },
  "bonuses.icon.spin": {
    tr: "Çevirme",
    en: "Spin",
    ka: "დატრიალება",
    ru: "Вращение"
  },
  "bonuses.icon.fast": {
    tr: "Hızlı",
    en: "Fast",
    ka: "სწრაფი",
    ru: "Быстрые"
  },
  "bonuses.icon.games": {
    tr: "Oyunlar",
    en: "Games",
    ka: "თამაშები",
    ru: "Игры"
  },
  "bonuses.icon.first": {
    tr: "İlk",
    en: "First",
    ka: "პირველი",
    ru: "Первый"
  },
  "bonuses.icon.deposit": {
    tr: "Yatırım",
    en: "Deposit",
    ka: "დეპოზიტი",
    ru: "Депозит"
  },
  "bonuses.icon.live_casino": {
    tr: "Canlı Casino",
    en: "Live Casino",
    ka: "ცოცხალი კაზინო",
    ru: "Живое Казино"
  },
  "bonuses.icon.casino": {
    tr: "Casino",
    en: "Casino",
    ka: "კაზინო",
    ru: "Казино"
  },

  // InstagramStory
  "story.highlights": {
    tr: "ÖNE ÇIKANLAR",
    en: "HIGHLIGHTS",
    ka: "გამორჩეულები",
    ru: "ОСНОВНЫЕ МОМЕНТЫ"
  },
  "story.vip": {
    tr: "VIP",
    en: "VIP",
    ka: "VIP",
    ru: "VIP"
  },
  "story.premium": {
    tr: "Premium",
    en: "Premium",
    ka: "პრემიუმი",
    ru: "Премиум"
  },
  "story.wheel": {
    tr: "Çark",
    en: "Wheel",
    ka: "ბორბალი",
    ru: "Колесо"
  },
  "story.fast": {
    tr: "Hızlı",
    en: "Fast",
    ka: "სწრაფი",
    ru: "Быстро"
  },
  "story.bonus": {
    tr: "Bonus",
    en: "Bonus",
    ka: "ბონუსი",
    ru: "Бонус"
  },
  "story.vip_desc": {
    tr: "VIP üyelik ayrıcalıkları",
    en: "VIP membership privileges",
    ka: "VIP წევრობის პრივილეგიები",
    ru: "Привилегии VIP-членства"
  },
  "story.premium_desc": {
    tr: "Premium bonuslar",
    en: "Premium bonuses",
    ka: "პრემიუმ ბონუსები",
    ru: "Премиум бонусы"
  },
  "story.wheel_desc": {
    tr: "Çark çevir kazan",
    en: "Spin the wheel to win",
    ka: "დაატრიალეთ ბორბალი მოსაგებად",
    ru: "Крутите колесо, чтобы выиграть"
  },
  "story.fast_desc": {
    tr: "Hızlı çekim avantajı",
    en: "Fast withdrawal advantage",
    ka: "სწრაფი გატანის უპირატესობა",
    ru: "Преимущество быстрого вывода"
  },
  "story.bonus_desc": {
    tr: "Özel bonus fırsatları",
    en: "Special bonus opportunities",
    ka: "სპეციალური ბონუს შესაძლებლობები",
    ru: "Специальные бонусные возможности"
  },
  "story.modal_description": {
    tr: "Bu özel özelliği kullanarak daha fazla avantaj elde edebilirsiniz. Aşağıdaki butona tıklayarak hemen keşfedin.",
    en: "You can gain more advantages by using this special feature. Discover now by clicking the button below.",
    ka: "შეგიძლიათ მიიღოთ მეტი უპირატესობა ამ სპეციალური ფუნქციის გამოყენებით. აღმოაჩინეთ ახლავე ქვემოთ ღილაკზე დაჭერით.",
    ru: "Вы можете получить больше преимуществ, используя эту специальную функцию. Узнайте сейчас, нажав на кнопку ниже."
  },
  "common.view_all": {
    tr: "Tümünü gör",
    en: "View all",
    ka: "ყველას ნახვა",
    ru: "Посмотреть все"
  },
  "story.discover_now": {
    tr: "HEMEN KEŞFET",
    en: "DISCOVER NOW",
    ka: "აღმოაჩინეთ ახლავე",
    ru: "ОТКРОЙТЕ СЕЙЧАС"
  },
  
  // Sidebar ek
  "sidebar.whatsapp": {
    tr: "WhatsApp",
    en: "WhatsApp",
    ka: "WhatsApp",
    ru: "WhatsApp"
  },
  "sidebar.help": {
    tr: "Yardım",
    en: "Help",
    ka: "დახმარება",
    ru: "Помощь"
  },
  
  // Header butonları
  "header.login_button": {
    tr: "Giriş Yap",
    en: "Login",
    ka: "შესვლა",
    ru: "Войти"
  },
  "header.register_button": {
    tr: "Kayıt Ol",
    en: "Register",
    ka: "რეგისტრაცია",
    ru: "Регистрация"
  },
  "header.balance": {
    tr: "Bakiye",
    en: "Balance",
    ka: "ბალანსი",
    ru: "Баланс"
  },
  "header.profile": {
    tr: "Profil",
    en: "Profile",
    ka: "პროფილი",
    ru: "Профиль"
  },
  
  // Profil Modal
  "profile.title": {
    tr: "Hesap Profiliniz",
    en: "Your Account Profile",
    ka: "თქვენი ანგარიშის პროფილი",
    ru: "Профиль Вашего Аккаунта"
  },
  "profile.personal_info": {
    tr: "Kişisel Bilgiler",
    en: "Personal Information",
    ka: "პირადი ინფორმაცია",
    ru: "Личная Информация"
  },
  "profile.security": {
    tr: "Güvenlik",
    en: "Security",
    ka: "უსაფრთხოება",
    ru: "Безопасность"
  },
  "profile.bet_history": {
    tr: "Bahis Geçmişi",
    en: "Bet History",
    ka: "ფსონის ისტორია",
    ru: "История Ставок"
  },
  "profile.preferences": {
    tr: "Tercihler",
    en: "Preferences",
    ka: "პრეფერენციები",
    ru: "Настройки"
  },
  "profile.balance": {
    tr: "Bakiye",
    en: "Balance",
    ka: "ბალანსი",
    ru: "Баланс"
  },
  "profile.bets": {
    tr: "Bahisler",
    en: "Bets",
    ka: "ფსონები",
    ru: "Ставки"
  },
  "profile.personal_info_desc": {
    tr: "Kişisel bilgilerinizi güncelleyin ve hesap ayarlarınızı yönetin.",
    en: "Update your personal information and manage your account settings.",
    ka: "განაახლეთ თქვენი პირადი ინფორმაცია და მართეთ ანგარიშის პარამეტრები.",
    ru: "Обновите свою личную информацию и управляйте настройками учетной записи."
  },
  "profile.full_name": {
    tr: "Ad Soyad",
    en: "Full Name",
    ka: "სრული სახელი",
    ru: "Полное Имя"
  },
  "profile.full_name_placeholder": {
    tr: "Adınız ve soyadınız",
    en: "Your full name",
    ka: "თქვენი სრული სახელი",
    ru: "Ваше полное имя"
  },
  "profile.email": {
    tr: "E-posta",
    en: "Email",
    ka: "ელ-ფოსტა",
    ru: "Эл. почта"
  },
  "profile.email_placeholder": {
    tr: "E-posta adresiniz",
    en: "Your email address",
    ka: "თქვენი ელ-ფოსტის მისამართი",
    ru: "Ваш адрес эл. почты"
  },
  "profile.username": {
    tr: "Kullanıcı Adı",
    en: "Username",
    ka: "მომხმარებლის სახელი",
    ru: "Имя пользователя"
  },
  "profile.username_note": {
    tr: "Kullanıcı adınız değiştirilemez.",
    en: "Your username cannot be changed.",
    ka: "თქვენი მომხმარებლის სახელის შეცვლა არ შეიძლება.",
    ru: "Ваше имя пользователя не может быть изменено."
  },
  "profile.phone": {
    tr: "Telefon",
    en: "Phone",
    ka: "ტელეფონი",
    ru: "Телефон"
  },
  "profile.phone_placeholder": {
    tr: "Telefon numaranız",
    en: "Your phone number",
    ka: "თქვენი ტელეფონის ნომერი",
    ru: "Ваш номер телефона"
  },
  "profile.save_changes": {
    tr: "Değişiklikleri Kaydet",
    en: "Save Changes",
    ka: "ცვლილებების შენახვა",
    ru: "Сохранить Изменения"
  },
  "profile.security_desc": {
    tr: "Şifrenizi değiştirin ve hesabınızın güvenliğini artırın.",
    en: "Change your password and enhance your account security.",
    ka: "შეცვალეთ თქვენი პაროლი და გააუმჯობესეთ ანგარიშის უსაფრთხოება.",
    ru: "Измените пароль и усильте безопасность вашей учетной записи."
  },
  "profile.current_password": {
    tr: "Mevcut Şifre",
    en: "Current Password",
    ka: "მიმდინარე პაროლი",
    ru: "Текущий Пароль"
  },
  "profile.new_password": {
    tr: "Yeni Şifre",
    en: "New Password",
    ka: "ახალი პაროლი",
    ru: "Новый Пароль"
  },
  "profile.confirm_password": {
    tr: "Şifreyi Onayla",
    en: "Confirm Password",
    ka: "დაადასტურეთ პაროლი",
    ru: "Подтвердить Пароль"
  },
  "profile.change_password": {
    tr: "Şifreyi Değiştir",
    en: "Change Password",
    ka: "პაროლის შეცვლა",
    ru: "Изменить Пароль"
  },
  "profile.history_desc": {
    tr: "Geçmiş bahislerinizi görüntüleyin ve kazançlarınızı takip edin.",
    en: "View your past bets and track your winnings.",
    ka: "ნახეთ თქვენი წარსული ფსონები და თვალყური ადევნეთ თქვენს მოგებებს.",
    ru: "Просмотрите свои прошлые ставки и отслеживайте выигрыши."
  },
  "profile.bet_id": {
    tr: "Bahis No",
    en: "Bet ID",
    ka: "ფსონის ID",
    ru: "ID Ставки"
  },
  "profile.bet_date": {
    tr: "Tarih",
    en: "Date",
    ka: "თარიღი",
    ru: "Дата"
  },
  "profile.bet_amount": {
    tr: "Miktar",
    en: "Amount",
    ka: "თანხა",
    ru: "Сумма"
  },
  "profile.bet_status": {
    tr: "Durum",
    en: "Status",
    ka: "სტატუსი",
    ru: "Статус"
  },
  "profile.bet_winnings": {
    tr: "Kazanç",
    en: "Winnings",
    ka: "მოგება",
    ru: "Выигрыш"
  },
  "profile.no_bets": {
    tr: "Henüz bir bahis yapmadınız.",
    en: "You haven't placed any bets yet.",
    ka: "თქვენ ჯერ არ დაგიდიათ ფსონები.",
    ru: "Вы еще не разместили ставки."
  },
  "profile.preferences_desc": {
    tr: "Hesap tercihlerinizi ve bildirim ayarlarınızı özelleştirin.",
    en: "Customize your account preferences and notification settings.",
    ka: "მოირგეთ თქვენი ანგარიშის პრეფერენციები და შეტყობინების პარამეტრები.",
    ru: "Настройте параметры учетной записи и настройки уведомлений."
  },
  "profile.language_preference": {
    tr: "Tercih Edilen Dil",
    en: "Preferred Language",
    ka: "სასურველი ენა",
    ru: "Предпочитаемый язык"
  },
  "profile.notifications": {
    tr: "Bildirimler",
    en: "Notifications",
    ka: "შეტყობინებები",
    ru: "Уведомления"
  },
  "profile.email_notifications": {
    tr: "E-posta Bildirimleri",
    en: "Email Notifications",
    ka: "ელფოსტის შეტყობინებები",
    ru: "Уведомления по электронной почте"
  },
  "profile.promo_notifications": {
    tr: "Promosyon Bildirimleri",
    en: "Promotional Notifications",
    ka: "პრომო შეტყობინებები",
    ru: "Рекламные уведомления"
  },
  "profile.app_preferences": {
    tr: "Tercihleri Kaydet",
    en: "Save Preferences",
    ka: "პარამეტრების შენახვა",
    ru: "Сохранить настройки"
  },
  "profile.logout": {
    tr: "Çıkış Yap",
    en: "Logout",
    ka: "გასვლა",
    ru: "Выйти"
  },
  "profile.security_tips": {
    tr: "Güvenlik İpuçları",
    en: "Security Tips",
    ka: "უსაფრთხოების რჩევები",
    ru: "Советы по безопасности"
  },
  "profile.security_tip_1": {
    tr: "En az 8 karakter içeren güçlü bir şifre kullanın.",
    en: "Use a strong password with at least 8 characters.",
    ka: "გამოიყენეთ ძლიერი პაროლი მინიმუმ 8 სიმბოლოთი.",
    ru: "Используйте надежный пароль, содержащий не менее 8 символов."
  },
  "profile.security_tip_2": {
    tr: "Hesabınıza başka bir cihazdan giriş yapıldığında bildirim alın.",
    en: "Get notified when someone logs into your account from another device.",
    ka: "მიიღეთ შეტყობინება, როდესაც ვინმე შედის თქვენს ანგარიშზე სხვა მოწყობილობიდან.",
    ru: "Получать уведомления, когда кто-то входит в вашу учетную запись с другого устройства."
  },
  "profile.security_tip_3": {
    tr: "Şifrenizi düzenli olarak değiştirin ve başka hesaplarda kullanmayın.",
    en: "Change your password regularly and don't use it for other accounts.",
    ka: "რეგულარულად შეცვალეთ თქვენი პაროლი და არ გამოიყენოთ იგი სხვა ანგარიშებისთვის.",
    ru: "Регулярно меняйте пароль и не используйте его для других учетных записей."
  },
  "profile.all_tab": {
    tr: "Tümü",
    en: "All",
    ka: "ყველა",
    ru: "Все"
  },
  "profile.pending": {
    tr: "Bekliyor",
    en: "Pending",
    ka: "მიმდინარე",
    ru: "В ожидании"
  },
  "profile.won": {
    tr: "Kazandı",
    en: "Won",
    ka: "მოგებული",
    ru: "Выиграно"
  },
  "profile.lost": {
    tr: "Kaybetti",
    en: "Lost",
    ka: "წაგებული",
    ru: "Проиграно"
  },
  "profile.filter": {
    tr: "Filtre",
    en: "Filter",
    ka: "ფილტრი",
    ru: "Фильтр"
  },
  "profile.sort": {
    tr: "Sırala",
    en: "Sort",
    ka: "სორტირება",
    ru: "Сортировка"
  },
  "profile.all_bets": {
    tr: "Tüm Bahisler",
    en: "All Bets",
    ka: "ყველა ფსონი",
    ru: "Все ставки"
  },
  "profile.won_bets": {
    tr: "Kazanılan Bahisler",
    en: "Won Bets",
    ka: "მოგებული ფსონები",
    ru: "Выигранные ставки"
  },
  "profile.lost_bets": {
    tr: "Kaybedilen Bahisler",
    en: "Lost Bets",
    ka: "წაგებული ფსონები",
    ru: "Проигранные ставки"
  },
  "profile.pending_bets": {
    tr: "Bekleyen Bahisler",
    en: "Pending Bets",
    ka: "მიმდინარე ფსონები",
    ru: "Ожидающие ставки"
  },
  "profile.newest": {
    tr: "En Yeniler",
    en: "Newest",
    ka: "უახლესი",
    ru: "Новейшие"
  },
  "profile.oldest": {
    tr: "En Eskiler",
    en: "Oldest",
    ka: "უძველესი",
    ru: "Старейшие"
  },
  "profile.highest_amount": {
    tr: "En Yüksek Tutar",
    en: "Highest Amount",
    ka: "უმაღლესი თანხა",
    ru: "Наивысшая сумма"
  },
  "profile.lowest_amount": {
    tr: "En Düşük Tutar",
    en: "Lowest Amount",
    ka: "უმცირესი თანხა",
    ru: "Наименьшая сумма"
  },
  "profile.date": {
    tr: "Tarih",
    en: "Date",
    ka: "თარიღი",
    ru: "Дата"
  },
  "profile.game": {
    tr: "Oyun",
    en: "Game",
    ka: "თამაში",
    ru: "Игра"
  },
  "profile.amount": {
    tr: "Tutar",
    en: "Amount",
    ka: "თანხა",
    ru: "Сумма"
  },
  "profile.status": {
    tr: "Durum",
    en: "Status",
    ka: "სტატუსი",
    ru: "Статус"
  },
  "profile.win_amount": {
    tr: "Kazanç",
    en: "Win Amount",
    ka: "მოგების თანხა",
    ru: "Выигрыш"
  },
  "profile.bet_history_desc": {
    tr: "Geçmiş bahislerinizi görüntüleyin ve kazançlarınızı takip edin.",
    en: "View your betting history and track your winnings.",
    ka: "ნახეთ თქვენი ფსონების ისტორია და თვალყური ადევნეთ თქვენს მოგებებს.",
    ru: "Просмотрите историю ваших ставок и отслеживайте выигрыши."
  },
  "profile.member_since": {
    tr: "Üyelik tarihi",
    en: "Member since",
    ka: "წევრია",
    ru: "Участник с"
  },
  "profile.status.online": {
    tr: "Çevrimiçi",
    en: "Online",
    ka: "ონლაინ",
    ru: "Онлайн"
  },
  "profile.level": {
    tr: "Seviye",
    en: "Level",
    ka: "დონე",
    ru: "Уровень"
  },
  "profile.loyalty_points": {
    tr: "Sadakat Puanları",
    en: "Loyalty Points",
    ka: "ლოიალურობის ქულები",
    ru: "Очки лояльности"
  },
  "profile.actions": {
    tr: "İşlemler",
    en: "Actions",
    ka: "მოქმედებები",
    ru: "Действия"
  },
  "profile.animations": {
    tr: "Animasyonlar",
    en: "Animations",
    ka: "ანიმაციები",
    ru: "Анимации"
  },
  "profile.theme": {
    tr: "Tema",
    en: "Theme",
    ka: "თემა",
    ru: "Тема"
  },
  "profile.disable_animations": {
    tr: "Animasyonları Devre Dışı Bırak",
    en: "Disable Animations",
    ka: "ანიმაციების გამორთვა",
    ru: "Отключить анимации"
  },
  "profile.dark_mode": {
    tr: "Karanlık Mod",
    en: "Dark Mode",
    ka: "ბნელი რეჟიმი",
    ru: "Темный режим"
  },
  "profile.finance": {
    tr: "Finans İşlemleri",
    en: "Financial Transactions",
    ka: "ფინანსური ოპერაციები",
    ru: "Финансовые операции"
  },
  "profile.my_bonuses": {
    tr: "Bonuslarım",
    en: "My Bonuses",
    ka: "ჩემი ბონუსები",
    ru: "Мои бонусы"
  },
  "profile.member_id": {
    tr: "Üye ID",
    en: "Member ID",
    ka: "წევრის ID",
    ru: "ID участника"
  },
  
  // Güvenlik Sekmesi
  "profile.account_security": {
    tr: "Hesap Güvenliği",
    en: "Account Security",
    ka: "ანგარიშის უსაფრთხოება",
    ru: "Безопасность аккаунта"
  },
  "profile.security_strong": {
    tr: "Güçlü",
    en: "Strong",
    ka: "ძლიერი",
    ru: "Сильный"
  },
  "profile.last_password_change": {
    tr: "Son Şifre Değişimi",
    en: "Last Password Change",
    ka: "ბოლო პაროლის შეცვლა",
    ru: "Последнее изменение пароля"
  },
  "profile.days_ago": {
    tr: "gün önce",
    en: "days ago",
    ka: "დღის წინ",
    ru: "дней назад"
  },
  "profile.two_factor_auth": {
    tr: "İki Faktörlü Doğrulama",
    en: "Two-Factor Authentication",
    ka: "ორფაქტორიანი ავთენტიფიკაცია",
    ru: "Двухфакторная аутентификация"
  },
  "profile.not_active": {
    tr: "Aktif Değil",
    en: "Not Active",
    ka: "არ არის აქტიური",
    ru: "Не активен"
  },
  "profile.change_password_title": {
    tr: "Şifre Değiştir",
    en: "Change Password",
    ka: "პაროლის შეცვლა",
    ru: "Изменить пароль"
  },
  "profile.password_strength_meter": {
    tr: "Şifre Gücü",
    en: "Password Strength",
    ka: "პაროლის სიძლიერე",
    ru: "Надежность пароля"
  },
  "profile.strong": {
    tr: "Güçlü",
    en: "Strong",
    ka: "ძლიერი",
    ru: "Сильный"
  },
  "profile.secure_account": {
    tr: "Hesabınızı güvenceye alın",
    en: "Secure your account",
    ka: "დაიცავით თქვენი ანგარიში",
    ru: "Защитите свой аккаунт"
  },
  "profile.two_factor_desc": {
    tr: "İki faktörlü doğrulama, hesabınıza giriş yapmak için şifrenize ek olarak cep telefonunuza gönderilen kodu kullanmanızı sağlar.",
    en: "Two-factor authentication requires you to use a code sent to your mobile phone in addition to your password when logging into your account.",
    ka: "ორფაქტორიანი ავთენტიფიკაცია მოითხოვს თქვენს მობილურ ტელეფონზე გაგზავნილი კოდის გამოყენებას პაროლთან ერთად ანგარიშზე შესვლისას.",
    ru: "Двухфакторная аутентификация требует использования кода, отправленного на ваш мобильный телефон, в дополнение к паролю при входе в учетную запись."
  },
  "profile.two_factor_status": {
    tr: "İki faktörlü doğrulama",
    en: "Two-factor authentication",
    ka: "ორფაქტორიანი ავთენტიფიკაცია",
    ru: "Двухфакторная аутентификация"
  },
  "profile.enable_verification": {
    tr: "Doğrulamayı Etkinleştir",
    en: "Enable Verification",
    ka: "ვერიფიკაციის ჩართვა",
    ru: "Включить проверку"
  },
  "profile.login_activity": {
    tr: "Son Oturum Açma Etkinliği",
    en: "Recent Login Activity",
    ka: "ბოლო შესვლის აქტივობა",
    ru: "Недавняя активность входа"
  },
  "profile.date_time": {
    tr: "Tarih & Saat",
    en: "Date & Time",
    ka: "თარიღი & დრო",
    ru: "Дата и время"
  },
  "profile.ip_address": {
    tr: "IP Adresi",
    en: "IP Address",
    ka: "IP მისამართი",
    ru: "IP адрес"
  },
  "profile.device": {
    tr: "Cihaz",
    en: "Device",
    ka: "მოწყობილობა",
    ru: "Устройство"
  },
  "profile.status_successful": {
    tr: "Başarılı",
    en: "Successful",
    ka: "წარმატებული",
    ru: "Успешно"
  },
  "profile.status_failed": {
    tr: "Başarısız",
    en: "Failed",
    ka: "წარუმატებელი",
    ru: "Не удалось"
  },
  
  // Finansal İşlemler Sekmesi
  "profile.financial_transactions": {
    tr: "Finansal İşlemler",
    en: "Financial Transactions",
    ka: "ფინანსური ოპერაციები",
    ru: "Финансовые операции"
  },
  "profile.financial_desc": {
    tr: "Para yatırma ve çekme işlemlerinizi yönetin",
    en: "Manage your deposits and withdrawals",
    ka: "მართეთ თქვენი შენატანები და გატანები",
    ru: "Управляйте своими депозитами и снятиями"
  },
  "profile.balance_stats": {
    tr: "Bakiye İstatistikleri",
    en: "Balance Statistics",
    ka: "ბალანსის სტატისტიკა",
    ru: "Статистика баланса"
  },
  "profile.total_deposits": {
    tr: "Toplam Yatırım",
    en: "Total Deposits",
    ka: "ჯამური შენატანები",
    ru: "Всего депозитов"
  },
  "profile.total_withdrawals": {
    tr: "Toplam Çekim",
    en: "Total Withdrawals",
    ka: "ჯამური გატანები",
    ru: "Всего снятий"
  },
  "profile.bonus_balance": {
    tr: "Bonus Bakiye",
    en: "Bonus Balance",
    ka: "ბონუს ბალანსი",
    ru: "Бонусный баланс"
  },
  "profile.recent_transactions": {
    tr: "Son İşlemler",
    en: "Recent Transactions",
    ka: "ბოლო ოპერაციები",
    ru: "Недавние операции"
  },
  "profile.transaction_date": {
    tr: "Tarih",
    en: "Date",
    ka: "თარიღი",
    ru: "Дата"
  },
  "profile.transaction": {
    tr: "İşlem",
    en: "Transaction",
    ka: "ოპერაცია",
    ru: "Операция"
  },
  "profile.transaction_amount": {
    tr: "Miktar",
    en: "Amount",
    ka: "თანხა",
    ru: "Сумма"
  },
  "profile.transaction_status": {
    tr: "Durum",
    en: "Status",
    ka: "სტატუსი",
    ru: "Статус"
  },
  "profile.deposit": {
    tr: "Yatırım",
    en: "Deposit",
    ka: "შენატანი",
    ru: "Депозит"
  },
  "profile.withdrawal": {
    tr: "Çekim",
    en: "Withdrawal",
    ka: "გატანა",
    ru: "Вывод"
  },
  "profile.transaction_completed": {
    tr: "Tamamlandı",
    en: "Completed",
    ka: "დასრულებული",
    ru: "Завершено"
  },
  "profile.transaction_pending": {
    tr: "Beklemede",
    en: "Pending",
    ka: "მიმდინარე",
    ru: "В ожидании"
  },
  "profile.make_deposit": {
    tr: "Para Yatır",
    en: "Make Deposit",
    ka: "შეიტანეთ თანხა",
    ru: "Сделать депозит"
  },
  "profile.request_withdrawal": {
    tr: "Para Çek",
    en: "Request Withdrawal",
    ka: "მოითხოვეთ გატანა",
    ru: "Запросить вывод"
  },
  
  // Bahis Geçmişi Sekmesi
  "profile.game_category": {
    tr: "Oyun Kategorisi",
    en: "Game Category",
    ka: "თამაშის კატეგორია",
    ru: "Категория игры"
  },
  "profile.all_games": {
    tr: "Tüm Oyunlar",
    en: "All Games",
    ka: "ყველა თამაში",
    ru: "Все игры"
  },
  "profile.slots": {
    tr: "Slot",
    en: "Slots",
    ka: "სლოტები",
    ru: "Слоты"
  },
  "profile.live_casino": {
    tr: "Canlı Casino",
    en: "Live Casino",
    ka: "ცოცხალი კაზინო",
    ru: "Живое казино"
  },
  "profile.table_games": {
    tr: "Masa Oyunları",
    en: "Table Games",
    ka: "სამაგიდო თამაშები",
    ru: "Настольные игры"
  },
  "profile.crash": {
    tr: "Crash",
    en: "Crash",
    ka: "Crash",
    ru: "Crash"
  },
  "profile.all_filter": {
    tr: "Tümü",
    en: "All",
    ka: "ყველა",
    ru: "Все"
  },
  "profile.show_details": {
    tr: "Göster",
    en: "Show",
    ka: "ჩვენება",
    ru: "Показать"
  },
  "profile.multiplier": {
    tr: "Çarpan",
    en: "Multiplier",
    ka: "გამრავლება",
    ru: "Множитель"
  },
  "profile.showing_entries": {
    tr: "Toplam $1 kayıttan $2-$3 arası gösteriliyor",
    en: "Showing $2-$3 of $1 entries",
    ka: "ნაჩვენებია $2-$3 / $1 ჩანაწერიდან",
    ru: "Показано $2-$3 из $1 записей"
  },
  
  // Bonuslar Sekmesi
  "profile.bonuses.total_bonus": {
    tr: "Toplam Bonus",
    en: "Total Bonus",
    ka: "ჯამური ბონუსი",
    ru: "Всего бонусов"
  },
  "profile.bonuses.completed_bonuses": {
    tr: "Tamamlanan Bonuslar",
    en: "Completed Bonuses",
    ka: "დასრულებული ბონუსები",
    ru: "Завершенные бонусы"
  },
  "profile.bonuses.active_bonuses": {
    tr: "Aktif Bonuslar",
    en: "Active Bonuses",
    ka: "აქტიური ბონუსები",
    ru: "Активные бонусы"
  },
  "profile.bonuses.view_all": {
    tr: "Tüm Bonusları Görüntüle",
    en: "View All Bonuses",
    ka: "ყველა ბონუსის ნახვა",
    ru: "Посмотреть все бонусы"
  },
  "profile.bonuses.welcome_bonus": {
    tr: "Hoşgeldin Bonusu",
    en: "Welcome Bonus",
    ka: "მისასალმებელი ბონუსი",
    ru: "Приветственный бонус"
  },
  "profile.bonuses.first_deposit_bonus": {
    tr: "İlk yatırımınıza özel 100% bonus",
    en: "100% bonus for your first deposit",
    ka: "100% ბონუსი თქვენი პირველი შენატანისთვის",
    ru: "100% бонус на ваш первый депозит"
  },
  "profile.bonuses.days_left": {
    tr: "gün kaldı",
    en: "days left",
    ka: "დღე დარჩა",
    ru: "дней осталось"
  },
  "profile.bonuses.amount": {
    tr: "Miktar:",
    en: "Amount:",
    ka: "თანხა:",
    ru: "Сумма:"
  },
  "profile.bonuses.remaining": {
    tr: "Kalan:",
    en: "Remaining:",
    ka: "დარჩენილი:",
    ru: "Осталось:"
  },
  "profile.bonuses.expiry": {
    tr: "Son kullanma:",
    en: "Expiry:",
    ka: "ვადის გასვლა:",
    ru: "Срок действия:"
  },
  "profile.bonuses.wagering": {
    tr: "Çevrim şartı:",
    en: "Wagering:",
    ka: "მოთხოვნა:",
    ru: "Отыгрыш:"
  },
  "profile.bonuses.wagering_completed": {
    tr: "Çevrim Tamamlandı:",
    en: "Wagering Completed:",
    ka: "მოთხოვნა შესრულებულია:",
    ru: "Отыгрыш выполнен:"
  },
  "profile.bonuses.use": {
    tr: "Kullan",
    en: "Use",
    ka: "გამოყენება",
    ru: "Использовать"
  },
  "profile.bonuses.cashback": {
    tr: "Nakit İade Bonusu",
    en: "Cashback Bonus",
    ka: "ქეშბექ ბონუსი",
    ru: "Бонус кэшбэка"
  },
  "profile.bonuses.weekly_loss": {
    tr: "Haftalık kayıp bonusu 10%",
    en: "Weekly loss bonus 10%",
    ka: "კვირის წაგების ბონუსი 10%",
    ru: "Еженедельный бонус за проигрыш 10%"
  },
  "profile.bonuses.bonus_history": {
    tr: "Bonus Geçmişi",
    en: "Bonus History",
    ka: "ბონუსის ისტორია",
    ru: "История бонусов"
  },
  "profile.bonuses.new_offers": {
    tr: "Yeni Bonus Teklifleri",
    en: "New Bonus Offers",
    ka: "ახალი ბონუს შეთავაზებები",
    ru: "Новые бонусные предложения"
  },
  "profile.bonuses.deposit_bonus": {
    tr: "Yatırım Bonusu",
    en: "Deposit Bonus",
    ka: "შენატანის ბონუსი",
    ru: "Бонус на депозит"
  },
  "profile.bonuses.weekend_bonus": {
    tr: "Hafta Sonu Bonusu",
    en: "Weekend Bonus",
    ka: "შაბათ-კვირის ბონუსი",
    ru: "Бонус на выходные"
  },
  "profile.bonuses.freespin": {
    tr: "Freespin Paketi",
    en: "Freespin Package",
    ka: "უფასო დატრიალების პაკეტი",
    ru: "Пакет фриспинов"
  },
  "profile.bonuses.min_deposit": {
    tr: "Min. Yatırım:",
    en: "Min. Deposit:",
    ka: "მინ. შენატანი:",
    ru: "Мин. депозит:"
  },
  "profile.bonuses.details": {
    tr: "Detaylar",
    en: "Details",
    ka: "დეტალები",
    ru: "Подробности"
  },
  "profile.bonuses.expired": {
    tr: "Sona Erdi",
    en: "Expired",
    ka: "ვადაგასული",
    ru: "Истек"
  },
  "profile.bonuses.completed": {
    tr: "Tamamlandı",
    en: "Completed",
    ka: "დასრულებული",
    ru: "Завершен"
  },
  "profile.bonuses.canceled": {
    tr: "İptal Edildi",
    en: "Canceled",
    ka: "გაუქმებული",
    ru: "Отменен"
  },
  "header.deposit": {
    tr: "Para Yatır",
    en: "Deposit",
    ka: "დეპოზიტი",
    ru: "Депозит"
  },
  "header.history": {
    tr: "Geçmiş",
    en: "History",
    ka: "ისტორია",
    ru: "История"
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
  "notifications.login_success": {
    tr: "Başarıyla giriş yaptınız! Hoş geldiniz!",
    en: "Successfully logged in! Welcome!",
    ka: "წარმატებით შეხვედით! კეთილი იყოს თქვენი მობრძანება!",
    ru: "Успешный вход! Добро пожаловать!"
  },
  "notifications.register_success": {
    tr: "Hesabınız başarıyla oluşturuldu! Hoş geldiniz!",
    en: "Your account has been successfully created! Welcome!",
    ka: "თქვენი ანგარიში წარმატებით შეიქმნა! კეთილი იყოს თქვენი მობრძანება!",
    ru: "Ваша учетная запись успешно создана! Добро пожаловать!"
  },
  "notifications.logout_success": {
    tr: "Başarıyla çıkış yaptınız. Tekrar görüşmek üzere!",
    en: "Successfully logged out. See you again soon!",
    ka: "წარმატებით გამოხვედით. მალე შევხვდებით!",
    ru: "Успешный выход. До скорой встречи!"
  },
  
  // Slider metinleri
  "slider.welcome_bonus": {
    tr: "HOŞGELDİN BONUSU",
    en: "WELCOME BONUS",
    ka: "მისალმების ბონუსი",
    ru: "ПРИВЕТСТВЕННЫЙ БОНУС"
  },
  "slider.welcome_description": {
    tr: "İlk yatırımınıza özel %100 bonus",
    en: "Special 100% bonus for your first deposit",
    ka: "სპეციალური 100% ბონუსი პირველი შენატანისთვის",
    ru: "Специальный 100% бонус на первый депозит"
  },
  "slider.examine": {
    tr: "İNCELE",
    en: "EXAMINE",
    ka: "განხილვა",
    ru: "ИЗУЧИТЬ"
  },
  "slider.cashback_bonus": {
    tr: "KAYIP BONUSU",
    en: "CASHBACK BONUS",
    ka: "ქეშბექ ბონუსი",
    ru: "КЭШБЭК БОНУС"
  },
  "slider.cashback_description": {
    tr: "Haftalık %30'a varan kayıp bonusu",
    en: "Weekly cashback bonus up to 30%",
    ka: "ყოველკვირეული ქეშბექ ბონუსი 30%-მდე",
    ru: "Еженедельный кэшбэк бонус до 30%"
  },
  "slider.details": {
    tr: "DETAYLAR",
    en: "DETAILS",
    ka: "დეტალები",
    ru: "ПОДРОБНЕЕ"
  },
  "slider.vip_title": {
    tr: "VIP ÜYELİK",
    en: "VIP MEMBERSHIP",
    ka: "VIP წევრობა",
    ru: "VIP ЧЛЕНСТВО"
  },
  "slider.vip_description": {
    tr: "Özel VIP avantajlarını keşfedin",
    en: "Discover special VIP advantages",
    ka: "აღმოაჩინეთ VIP უპირატესობები",
    ru: "Откройте для себя особые VIP преимущества"
  },
  "slider.join_now": {
    tr: "VIP OL",
    en: "JOIN VIP",
    ka: "VIP გახდი",
    ru: "СТАТЬ VIP"
  },
  
  // Banner metinleri güncellenmiş
  "banner.become_vip": {
    tr: "VIP OL",
    en: "BECOME VIP",
    ka: "VIP გახდი",
    ru: "СТАТЬ VIP"
  },
  "banner.details": {
    tr: "DETAY",
    en: "DETAILS",
    ka: "დეტალები",
    ru: "ПОДРОБНОСТИ"
  },
  "banner.limited_offers": {
    tr: "Sınırlı süre teklifleri",
    en: "Limited time offers",
    ka: "შეზღუდული დროის შეთავაზებები",
    ru: "Предложения ограниченного времени"
  },
  "banner.detail_button": {
    tr: "DETAY",
    en: "DETAIL",
    ka: "დეტალი",
    ru: "ДЕТАЛЬ"
  },
  
  // Site özellikleri başlık
  "site.features": {
    tr: "SİTE ÖZELLİKLERİ",
    en: "SITE FEATURES",
    ka: "საიტის მახასიათებლები",
    ru: "ОСОБЕННОСТИ САЙТА"
  },
  
  // Liderlik tablosu başlık
  "leaderboard.title": {
    tr: "LİDERLİK TABLOSU",
    en: "LEADERBOARD",
    ka: "ლიდერბორდი",
    ru: "ТАБЛИЦА ЛИДЕРОВ"
  },
  
  // Slot oyunları ek
  "home.popularSlots.allGames": {
    tr: "Tüm Oyunlar",
    en: "All Games",
    ka: "ყველა თამაში",
    ru: "Все игры"
  },
  "home.popularSlots.allGamesButton": {
    tr: "Tümünü Gör",
    en: "View All",
    ka: "ყველას ნახვა",
    ru: "Посмотреть все"
  },
  "home.popularSlots.newGames": {
    tr: "Yeni Oyunlar",
    en: "New Games",
    ka: "ახალი თამაშები",
    ru: "Новые игры"
  },
  "home.popularSlots.info": {
    tr: "En popüler slot oyunlarını keşfedin",
    en: "Discover the most popular slot games",
    ka: "აღმოაჩინეთ ყველაზე პოპულარული სლოტ თამაშები",
    ru: "Откройте для себя самые популярные слот-игры"
  },
  "home.popularSlots.play": {
    tr: "OYNA",
    en: "PLAY",
    ka: "თამაში",
    ru: "ИГРАТЬ"
  },
  
  // Casino oyunları ek
  "home.popularCasino.allGames": {
    tr: "Tüm Oyunlar",
    en: "All Games",
    ka: "ყველა თამაში",
    ru: "Все игры"
  },
  "home.popularCasino.popularGames": {
    tr: "Popüler Oyunlar",
    en: "Popular Games",
    ka: "პოპულარული თამაშები",
    ru: "Популярные игры"
  },
  "home.popularCasino.vipTables": {
    tr: "VIP Masalar",
    en: "VIP Tables",
    ka: "VIP მაგიდები",
    ru: "VIP столы"
  },
  "home.popularCasino.info": {
    tr: "Canlı casino oyunlarında gerçek krupiyelerle oynayın",
    en: "Play with real dealers in live casino games",
    ka: "ითამაშეთ ნამდვილ დილერებთან ლაივ კაზინო თამაშებში",
    ru: "Играйте с настоящими дилерами в играх живого казино"
  },
  "home.popularCasino.live": {
    tr: "CANLI",
    en: "LIVE",
    ka: "ცოცხალი",
    ru: "ЖИВОЙ"
  },
  "home.popularCasino.play": {
    tr: "OYNA",
    en: "PLAY",
    ka: "თამაში",
    ru: "ИГРАТЬ"
  },
  
  // Finans sağlayıcıları ek
  "home.financeProviders.secure": {
    tr: "GÜVENLİ",
    en: "SECURE",
    ka: "უსაფრთხო",
    ru: "БЕЗОПАСНЫЙ"
  },
  "home.financeProviders.fast": {
    tr: "HIZLI",
    en: "FAST",
    ka: "სწრაფი",
    ru: "БЫСТРЫЙ"
  },
  
  // Lisans ek
  "home.license.name": {
    tr: "Anjuan Gaming",
    en: "Anjuan Gaming",
    ka: "Anjuan Gaming",
    ru: "Anjuan Gaming"
  },
  "home.license.verify": {
    tr: "LİSANSI DOĞRULA",
    en: "VERIFY LICENSE",
    ka: "ლიცენზიის გადამოწმება",
    ru: "ПРОВЕРИТЬ ЛИЦЕНЗИЮ"
  },
  
  // VIP Sayfası Çevirileri
  "vip.title": {
    tr: "VIP KULÜP",
    en: "VIP CLUB",
    ka: "VIP კლუბი",
    ru: "VIP КЛУБ"
  },
  "vip.exclusive": {
    tr: "ÖZEL ÜYELİK",
    en: "EXCLUSIVE MEMBERSHIP",
    ka: "ექსკლუზიური წევრობა",
    ru: "ЭКСКЛЮЗИВНОЕ ЧЛЕНСТВО"
  },
  "vip.join_now": {
    tr: "HEMEN KATIL",
    en: "JOIN NOW",
    ka: "ახლავე შეუერთდით",
    ru: "ПРИСОЕДИНЯЙТЕСЬ СЕЙЧАС"
  },
  "vip.elite_member": {
    tr: "ELİT ÜYELİK",
    en: "ELITE MEMBERSHIP",
    ka: "ელიტური წევრობა",
    ru: "ЭЛИТНОЕ ЧЛЕНСТВО"
  },
  "vip.privileged": {
    tr: "AYRICALIKLI",
    en: "PRIVILEGED",
    ka: "პრივილეგირებული",
    ru: "ПРИВИЛЕГИРОВАННЫЙ"
  },
  "vip.description": {
    tr: "Ayrıcalıkların dünyasına hoş geldiniz! Cryptonbets VIP Kulübü, sadık oyunculara özel avantajlar, kişiselleştirilmiş bonuslar ve premium ödüller sunuyor.",
    en: "Welcome to the world of privileges! Cryptonbets VIP Club offers exclusive advantages, personalized bonuses and premium rewards to loyal players.",
    ka: "კეთილი იყოს თქვენი მობრძანება პრივილეგიების სამყაროში! Cryptonbets VIP კლუბი გთავაზობთ ექსკლუზიურ უპირატესობებს, პერსონალიზებულ ბონუსებს და პრემიუმ ჯილდოებს ერთგული მოთამაშეებისთვის.",
    ru: "Добро пожаловать в мир привилегий! VIP-клуб Cryptonbets предлагает эксклюзивные преимущества, персонализированные бонусы и премиальные награды для лояльных игроков."
  },
  "vip.sub_description": {
    tr: "VIP seviyenizi yükseltin, daha yüksek bonuslar kazanın ve kişisel VIP yöneticinizden özel hizmetlerin keyfini çıkarın. Cryptonbets'te VIP olmak, oyun deneyiminizi tamamen değiştirir ve sizlere ayrıcalıklı bir dünya sunar.",
    en: "Raise your VIP level, earn higher bonuses, and enjoy personalized services from your dedicated VIP manager. Being a VIP at Cryptonbets completely transforms your gaming experience and offers you a privileged world.",
    ka: "აიმაღლეთ თქვენი VIP დონე, მიიღეთ უფრო მაღალი ბონუსები და ისიამოვნეთ პერსონალიზებული მომსახურებით თქვენი VIP მენეჯერისგან. VIP სტატუსი Cryptonbets-ზე სრულიად გარდაქმნის თქვენს სათამაშო გამოცდილებას და გთავაზობთ პრივილეგირებულ სამყაროს.",
    ru: "Повысьте свой VIP-уровень, получайте более высокие бонусы и наслаждайтесь персонализированным обслуживанием от вашего персонального VIP-менеджера. Статус VIP в Cryptonbets полностью преображает ваш игровой опыт и открывает перед вами мир привилегий."
  },
  "vip.level": {
    tr: "Seviye",
    en: "Level",
    ka: "დონე",
    ru: "Уровень"
  },
  "vip.progress": {
    tr: "İlerleme",
    en: "Progress",
    ka: "პროგრესი",
    ru: "Прогресс"
  },
  "vip.level_description": {
    tr: "{{level}} seviyesi ayrıcalıkları keşfedin",
    en: "Discover {{level}} level privileges",
    ka: "აღმოაჩინეთ {{level}} დონის პრივილეგიები",
    ru: "Откройте для себя привилегии уровня {{level}}"
  },
  "vip.next_level_info": {
    tr: "Bir sonraki seviye: {{level}}",
    en: "Next level: {{level}}",
    ka: "შემდეგი დონე: {{level}}",
    ru: "Следующий уровень: {{level}}"
  },
  "vip.max_level": {
    tr: "En yüksek seviyedesiniz!",
    en: "You are at the highest level!",
    ka: "თქვენ ხართ უმაღლეს დონეზე!",
    ru: "Вы на самом высоком уровне!"
  },
  "vip.upgrade_requirements": {
    tr: "Seviye Yükseltme Gereksinimleri",
    en: "Level Upgrade Requirements",
    ka: "დონის განახლების მოთხოვნები",
    ru: "Требования для повышения уровня"
  },
  "vip.deposit_amount": {
    tr: "Toplam Yatırım",
    en: "Total Deposit",
    ka: "ჯამური დეპოზიტი",
    ru: "Общий депозит"
  },
  "vip.next_deposit": {
    tr: "Sonraki Seviye İçin Gereken",
    en: "Required for Next Level",
    ka: "მოთხოვნილი შემდეგი დონისთვის",
    ru: "Необходимо для следующего уровня"
  },
  "vip.benefits.title": {
    tr: "VIP Avantajları",
    en: "VIP Benefits",
    ka: "VIP უპირატესობები",
    ru: "VIP преимущества"
  },
  "vip.benefits.cashback": {
    tr: "Haftalık kayıp bonusu",
    en: "Weekly cashback bonus",
    ka: "ყოველკვირეული ქეშბექ ბონუსი",
    ru: "Еженедельный бонус кэшбэка"
  },
  "vip.benefits.support": {
    tr: "7/24 VIP destek",
    en: "24/7 VIP support",
    ka: "24/7 VIP მხარდაჭერა",
    ru: "Круглосуточная VIP-поддержка"
  },
  "vip.benefits.basic_withdrawals": {
    tr: "5.000₺'e kadar hızlı çekim",
    en: "Fast withdrawals up to 5,000₺",
    ka: "სწრაფი გატანები 5,000₺-მდე",
    ru: "Быстрый вывод средств до 5 000₺"
  },
  "vip.benefits.medium_withdrawals": {
    tr: "10.000₺'e kadar hızlı çekim",
    en: "Fast withdrawals up to 10,000₺",
    ka: "სწრაფი გატანები 10,000₺-მდე",
    ru: "Быстрый вывод средств до 10 000₺"
  },
  "vip.benefits.high_withdrawals": {
    tr: "25.000₺'e kadar hızlı çekim",
    en: "Fast withdrawals up to 25,000₺",
    ka: "სწრაფი გატანები 25,000₺-მდე",
    ru: "Быстрый вывод средств до 25 000₺"
  },
  "vip.benefits.ultra_withdrawals": {
    tr: "50.000₺'e kadar hızlı çekim",
    en: "Fast withdrawals up to 50,000₺",
    ka: "სწრაფი გატანები 50,000₺-მდე",
    ru: "Быстрый вывод средств до 50 000₺"
  },
  "vip.benefits.unlimited_withdrawals": {
    tr: "Limitsiz hızlı çekim",
    en: "Unlimited fast withdrawals",
    ka: "შეუზღუდავი სწრაფი გატანები",
    ru: "Неограниченный быстрый вывод средств"
  },
  "vip.benefits.birthday_bonus": {
    tr: "Doğum günü bonusu",
    en: "Birthday bonus",
    ka: "დაბადების დღის ბონუსი",
    ru: "Бонус на день рождения"
  },
  "vip.benefits.premium_birthday": {
    tr: "Premium doğum günü bonusu",
    en: "Premium birthday bonus",
    ka: "პრემიუმ დაბადების დღის ბონუსი",
    ru: "Премиум-бонус на день рождения"
  },
  "vip.benefits.reload_bonus": {
    tr: "Haftalık yeniden yükleme bonusu",
    en: "Weekly reload bonus",
    ka: "ყოველკვირეული დამატებითი ბონუსი",
    ru: "Еженедельный бонус на пополнение"
  },
  "vip.benefits.vip_reload_bonus": {
    tr: "Günlük VIP yeniden yükleme bonusu",
    en: "Daily VIP reload bonus",
    ka: "ყოველდღიური VIP დამატებითი ბონუსი",
    ru: "Ежедневный VIP-бонус на пополнение"
  },
  "vip.benefits.exclusive_events": {
    tr: "Özel VIP etkinlikleri",
    en: "Exclusive VIP events",
    ka: "ექსკლუზიური VIP ღონისძიებები",
    ru: "Эксклюзивные VIP-мероприятия"
  },
  "vip.benefits.custom_bonuses": {
    tr: "Kişiye özel bonuslar",
    en: "Custom bonuses",
    ka: "ინდივიდუალური ბონუსები",
    ru: "Индивидуальные бонусы"
  },
  "vip.benefits.priority_support": {
    tr: "Öncelikli VIP desteği",
    en: "Priority VIP support",
    ka: "პრიორიტეტული VIP მხარდაჭერა",
    ru: "Приоритетная VIP-поддержка"
  },
  "vip.benefits.vip_support": {
    tr: "Kişisel VIP destek ekibi",
    en: "Personal VIP support team",
    ka: "პირადი VIP მხარდაჭერის გუნდი",
    ru: "Персональная команда VIP-поддержки"
  },
  "vip.benefits.vip_cashback": {
    tr: "Yüksek oranlı özel VIP kayıp bonusu",
    en: "High-rate special VIP cashback bonus",
    ka: "მაღალი განაკვეთის სპეციალური VIP ქეშბექ ბონუსი",
    ru: "Специальный VIP-бонус кэшбэка с высокой ставкой"
  },
  "vip.cashback": {
    tr: "Kayıp Bonusu",
    en: "Cashback",
    ka: "ქეშბექი",
    ru: "Кэшбэк"
  },
  "vip.weekly_cashback": {
    tr: "Haftalık kayıp bonusu oranı",
    en: "Weekly cashback rate",
    ka: "ყოველკვირეული ქეშბექის განაკვეთი",
    ru: "Еженедельная ставка кэшбэка"
  },
  "vip.bonus_rate": {
    tr: "Bonus Oranı",
    en: "Bonus Rate",
    ka: "ბონუსის განაკვეთი",
    ru: "Ставка бонуса"
  },
  "vip.deposit_bonus": {
    tr: "Yatırım bonusu oranı",
    en: "Deposit bonus rate",
    ka: "დეპოზიტის ბონუსის განაკვეთი",
    ru: "Ставка бонуса на депозит"
  },
  "vip.gift_points": {
    tr: "Hediye Puanları",
    en: "Gift Points",
    ka: "საჩუქრის ქულები",
    ru: "Подарочные очки"
  },
  "vip.monthly_points": {
    tr: "Aylık hediye puanları",
    en: "Monthly gift points",
    ka: "ყოველთვიური საჩუქრის ქულები",
    ru: "Ежемесячные подарочные очки"
  },
  "vip.contact_manager": {
    tr: "VIP YÖNETİCİNİZLE İLETİŞİME GEÇİN",
    en: "CONTACT YOUR VIP MANAGER",
    ka: "დაუკავშირდით თქვენს VIP მენეჯერს",
    ru: "СВЯЗАТЬСЯ С ВАШИМ VIP-МЕНЕДЖЕРОМ"
  },
  "vip.upgrade_now": {
    tr: "ŞİMDİ YÜKSELTİN",
    en: "UPGRADE NOW",
    ka: "განაახლეთ ახლა",
    ru: "ПОВЫСИТЬ СЕЙЧАС"
  },
  "vip.claim_benefits": {
    tr: "AVANTAJLARI TALEP ET",
    en: "CLAIM BENEFITS",
    ka: "მიიღეთ უპირატესობები",
    ru: "ПОЛУЧИТЬ ПРЕИМУЩЕСТВА"
  },
  "vip.advantages.title": {
    tr: "VIP Üyeliğin Avantajları",
    en: "Advantages of VIP Membership",
    ka: "VIP წევრობის უპირატესობები",
    ru: "Преимущества VIP-членства"
  },
  "vip.advantages.description": {
    tr: "VIP üyelerimiz için sunduğumuz özel avantajlara göz atın.",
    en: "Check out the exclusive advantages we offer for our VIP members.",
    ka: "გაეცანით ექსკლუზიურ უპირატესობებს, რომლებსაც ვთავაზობთ ჩვენს VIP წევრებს.",
    ru: "Ознакомьтесь с эксклюзивными преимуществами, которые мы предлагаем нашим VIP-участникам."
  },
  "vip.advantages.higher_limits": {
    tr: "Daha Yüksek Limitler",
    en: "Higher Limits",
    ka: "უფრო მაღალი ლიმიტები",
    ru: "Более высокие лимиты"
  },
  "vip.advantages.higher_limits_desc": {
    tr: "VIP üyelerimiz daha yüksek yatırım ve çekim limitlerine sahiptir, böylece oyun deneyiminizi kısıtlamadan yaşayabilirsiniz.",
    en: "Our VIP members have higher deposit and withdrawal limits so you can experience your gaming without restrictions.",
    ka: "ჩვენს VIP წევრებს აქვთ უფრო მაღალი დეპოზიტისა და გატანის ლიმიტები, ასე რომ შეგიძლიათ გამოსცადოთ თქვენი თამაში შეზღუდვების გარეშე.",
    ru: "Наши VIP-участники имеют более высокие лимиты по депозитам и снятию средств, поэтому вы можете наслаждаться игрой без ограничений."
  },
  "vip.advantages.dedicated_support": {
    tr: "Özel Destek",
    en: "Dedicated Support",
    ka: "სპეციალური მხარდაჭერა",
    ru: "Выделенная поддержка"
  },
  "vip.advantages.dedicated_support_desc": {
    tr: "Kişisel VIP yöneticiniz 7/24 hizmetinizdedir ve tüm sorularınızda size özel destek sağlar.",
    en: "Your personal VIP manager is at your service 24/7, providing you with dedicated support for all your inquiries.",
    ka: "თქვენი პირადი VIP მენეჯერი თქვენს სამსახურშია 24/7, გაწვდით სპეციალურ დახმარებას თქვენი ყველა შეკითხვისთვის.",
    ru: "Ваш персональный VIP-менеджер к вашим услугам круглосуточно, предоставляя вам специализированную поддержку по всем вашим вопросам."
  },
  "vip.advantages.exclusive_bonuses": {
    tr: "Özel Bonuslar",
    en: "Exclusive Bonuses",
    ka: "ექსკლუზიური ბონუსები",
    ru: "Эксклюзивные бонусы"
  },
  "vip.advantages.exclusive_bonuses_desc": {
    tr: "VIP üyelerimize özel olarak tasarlanmış yüksek oranlı bonuslar ve promosyonlar sunuyoruz.",
    en: "We offer high-rate bonuses and promotions designed exclusively for our VIP members.",
    ka: "ჩვენ გთავაზობთ მაღალი განაკვეთის ბონუსებსა და აქციებს, რომლებიც შექმნილია ექსკლუზიურად ჩვენი VIP წევრებისთვის.",
    ru: "Мы предлагаем бонусы и акции с высокими ставками, разработанные специально для наших VIP-участников."
  },
  "vip.advantages.faster_withdrawals": {
    tr: "Daha Hızlı Çekimler",
    en: "Faster Withdrawals",
    ka: "სწრაფი გატანები",
    ru: "Более быстрые выводы"
  },
  "vip.advantages.faster_withdrawals_desc": {
    tr: "VIP üyeler çekim işlemlerinde önceliklidir ve kazançlarını daha hızlı alırlar.",
    en: "VIP members have priority in withdrawal transactions and receive their winnings faster.",
    ka: "VIP წევრებს აქვთ პრიორიტეტი თანხის გატანის ოპერაციებში და უფრო სწრაფად იღებენ მოგებას.",
    ru: "VIP-участники имеют приоритет в операциях по выводу средств и получают свои выигрыши быстрее."
  },
  "vip.advantages.special_events": {
    tr: "Özel Etkinlikler",
    en: "Special Events",
    ka: "სპეციალური ღონისძიებები",
    ru: "Особые мероприятия"
  },
  "vip.advantages.special_events_desc": {
    tr: "VIP üyelerimizi özel turnuvalara, etkinliklere ve daha fazlasına davet ediyoruz.",
    en: "We invite our VIP members to exclusive tournaments, events, and more.",
    ka: "ჩვენ ვიწვევთ ჩვენს VIP წევრებს ექსკლუზიურ ტურნირებზე, ღონისძიებებზე და ა.შ.",
    ru: "Мы приглашаем наших VIP-участников на эксклюзивные турниры, мероприятия и многое другое."
  },
  "vip.advantages.birthday_gifts": {
    tr: "Doğum Günü Hediyeleri",
    en: "Birthday Gifts",
    ka: "დაბადების დღის საჩუქრები",
    ru: "Подарки на день рождения"
  },
  "vip.advantages.birthday_gifts_desc": {
    tr: "Doğum gününüzde sizin için özel bonuslar ve sürprizler hazırlıyoruz.",
    en: "We prepare special bonuses and surprises for you on your birthday.",
    ka: "ჩვენ ვამზადებთ სპეციალურ ბონუსებს და სიურპრიზებს თქვენთვის თქვენს დაბადების დღეზე.",
    ru: "Мы готовим для вас особые бонусы и сюрпризы на ваш день рождения."
  },
  "vip.missions.title": {
    tr: "VIP Görevleri ve Hedefler",
    en: "VIP Missions and Goals",
    ka: "VIP მისიები და მიზნები",
    ru: "VIP-миссии и Цели"
  },
  "vip.missions.description": {
    tr: "Bu özel görevleri tamamlayarak VIP seviyenizi yükseltin ve premium avantajlarınızı artırın. Her görev size daha fazla ödül ve ayrıcalık kazandırır.",
    en: "Complete these special missions to level up your VIP status and increase your premium benefits. Each mission earns you more rewards and privileges.",
    ka: "შეასრულეთ ეს სპეციალური მისიები თქვენი VIP სტატუსის ასამაღლებლად და პრემიუმ უპირატესობების გასაზრდელად. თითოეული მისია გაძლევთ მეტ ჯილდოს და პრივილეგიებს.",
    ru: "Выполните эти особые миссии, чтобы повысить свой VIP-статус и увеличить премиум-преимущества. Каждая миссия приносит вам больше наград и привилегий."
  },
  "vip.missions.deposit_title": {
    tr: "5 Günlük Yatırım Yapın",
    en: "Make Deposits for 5 Days",
    ka: "გააკეთეთ დეპოზიტები 5 დღის განმავლობაში",
    ru: "Сделайте депозиты за 5 дней"
  },
  "vip.missions.deposit_desc": {
    tr: "5 gün üst üste en az 100₺ yatırım yapın ve ekstra 1000 VIP puanı kazanın.",
    en: "Deposit at least 100₺ for 5 consecutive days and earn an extra 1000 VIP points.",
    ka: "განათავსეთ მინიმუმ 100₺ 5 დღის განმავლობაში და მიიღეთ დამატებითი 1000 VIP ქულა.",
    ru: "Внесите не менее 100₺ в течение 5 дней подряд и получите дополнительно 1000 VIP-очков."
  },
  "vip.missions.casino_title": {
    tr: "Canlı Casino'da Oynayın",
    en: "Play in Live Casino",
    ka: "ითამაშეთ Live Casino-ში",
    ru: "Играйте в Live Casino"
  },
  "vip.missions.casino_desc": {
    tr: "3 farklı canlı casino oyununda en az 15 dakika oynayın ve %10 özel bonus kazanın.",
    en: "Play at least 15 minutes in 3 different live casino games and earn a 10% special bonus.",
    ka: "ითამაშეთ მინიმუმ 15 წუთი 3 სხვადასხვა ლაივ კაზინოს თამაშში და მიიღეთ 10% სპეციალური ბონუსი.",
    ru: "Играйте не менее 15 минут в 3 разных играх живого казино и получите 10% специальный бонус."
  },
  "vip.missions.refer_title": {
    tr: "Arkadaşlarınızı Davet Edin",
    en: "Invite Your Friends",
    ka: "მოიწვიეთ თქვენი მეგობრები",
    ru: "Пригласите своих друзей"
  },
  "vip.missions.refer_desc": {
    tr: "3 arkadaşınızı Cryptonbets'e davet edin ve her biri için 500 VIP puanı kazanın.",
    en: "Invite 3 friends to Cryptonbets and earn 500 VIP points for each one.",
    ka: "მოიწვიეთ 3 მეგობარი Cryptonbets-ზე და მიიღეთ 500 VIP ქულა თითოეულისთვის.",
    ru: "Пригласите 3 друзей в Cryptonbets и получите по 500 VIP-очков за каждого."
  },
  "vip.claim_rewards": {
    tr: "ÖDÜLLERİ TALEP ET",
    en: "CLAIM REWARDS",
    ka: "მოითხოვეთ ჯილდოები",
    ru: "ПОЛУЧИТЬ НАГРАДЫ"
  },
  "vip.faq.title": {
    tr: "Sık Sorulan Sorular",
    en: "Frequently Asked Questions",
    ka: "ხშირად დასმული კითხვები",
    ru: "Часто задаваемые вопросы"
  },
  "vip.faq.description": {
    tr: "VIP programımız hakkında merak edilen soruların cevaplarını burada bulabilirsiniz.",
    en: "You can find answers to commonly asked questions about our VIP program here.",
    ka: "აქ შეგიძლიათ იპოვოთ პასუხები ხშირად დასმულ კითხვებზე ჩვენი VIP პროგრამის შესახებ.",
    ru: "Здесь вы можете найти ответы на часто задаваемые вопросы о нашей VIP-программе."
  },
  "vip.faq.question1": {
    tr: "VIP programına nasıl katılabilirim?",
    en: "How can I join the VIP program?",
    ka: "როგორ შემიძლია შევუერთდე VIP პროგრამას?",
    ru: "Как я могу присоединиться к VIP-программе?"
  },
  "vip.faq.answer1": {
    tr: "VIP programımıza katılmak için belirli bir yatırım miktarına ulaşmanız yeterlidir. Bronze seviyesine ulaştığınızda otomatik olarak VIP üyesi olursunuz.",
    en: "To join our VIP program, you just need to reach a certain deposit amount. Once you reach the Bronze level, you automatically become a VIP member.",
    ka: "ჩვენს VIP პროგრამაში შესასვლელად, თქვენ უბრალოდ უნდა მიაღწიოთ დეპოზიტის გარკვეულ რაოდენობას. როგორც კი მიაღწევთ ბრონზის დონეს, ავტომატურად ხდებით VIP წევრი.",
    ru: "Чтобы присоединиться к нашей VIP-программе, вам просто нужно достичь определенной суммы депозита. Как только вы достигнете уровня Bronze, вы автоматически становитесь VIP-участником."
  },
  "vip.faq.question2": {
    tr: "VIP seviyemi nasıl yükseltebilirim?",
    en: "How can I upgrade my VIP level?",
    ka: "როგორ შემიძლია ავწიო ჩემი VIP დონე?",
    ru: "Как я могу повысить свой VIP-уровень?"
  },
  "vip.faq.answer2": {
    tr: "VIP seviyenizi yükseltmek için belirli yatırım miktarlarına ulaşmanız gerekir. Her seviyenin gereksinimleri VIP sayfasında belirtilmiştir.",
    en: "To upgrade your VIP level, you need to reach certain deposit amounts. The requirements for each level are specified on the VIP page.",
    ka: "თქვენი VIP დონის ასაწევად, თქვენ უნდა მიაღწიოთ დეპოზიტის გარკვეულ რაოდენობას. თითოეული დონის მოთხოვნები მითითებულია VIP გვერდზე.",
    ru: "Чтобы повысить свой VIP-уровень, вам необходимо достичь определенной суммы депозита. Требования для каждого уровня указаны на странице VIP."
  },
  "vip.faq.question3": {
    tr: "VIP programının faydaları nelerdir?",
    en: "What are the benefits of the VIP program?",
    ka: "რა არის VIP პროგრამის უპირატესობები?",
    ru: "Каковы преимущества VIP-программы?"
  },
  "vip.faq.answer3": {
    tr: "VIP programımız, özel bonuslar, daha yüksek çekim limitleri, kişisel VIP yöneticisi, özel etkinlikler ve daha fazlasını içerir. Seviyeniz yükseldikçe avantajlarınız da artar.",
    en: "Our VIP program includes exclusive bonuses, higher withdrawal limits, personal VIP manager, special events, and more. As your level increases, so do your benefits.",
    ka: "ჩვენი VIP პროგრამა მოიცავს ექსკლუზიურ ბონუსებს, უფრო მაღალ გატანის ლიმიტებს, პირად VIP მენეჯერს, სპეციალურ ღონისძიებებს და ა.შ. თქვენი დონის ზრდასთან ერთად იზრდება თქვენი სარგებელიც.",
    ru: "Наша VIP-программа включает эксклюзивные бонусы, более высокие лимиты на вывод средств, персонального VIP-менеджера, специальные мероприятия и многое другое. По мере повышения вашего уровня растут и ваши привилегии."
  },
  "vip.faq.question4": {
    tr: "VIP puanlarımı nasıl kullanabilirim?",
    en: "How can I use my VIP points?",
    ka: "როგორ შემიძლია გამოვიყენო ჩემი VIP ქულები?",
    ru: "Как я могу использовать свои VIP-очки?"
  },
  "vip.faq.answer4": {
    tr: "VIP puanlarınızı bonus nakit, freespin veya özel promosyonlar için kullanabilirsiniz. Ayrıntılar için VIP yöneticinizle iletişime geçin.",
    en: "You can use your VIP points for bonus cash, free spins, or special promotions. Contact your VIP manager for details.",
    ka: "შეგიძლიათ გამოიყენოთ თქვენი VIP ქულები ბონუს ნაღდი ფულისთვის, უფასო ტრიალებისთვის ან სპეციალური აქციებისთვის. დეტალებისთვის დაუკავშირდით თქვენს VIP მენეჯერს.",
    ru: "Вы можете использовать свои VIP-очки для бонусных денег, бесплатных вращений или специальных акций. Свяжитесь со своим VIP-менеджером для получения подробной информации."
  },
  "vip.cta.title": {
    tr: "HEMEN VIP'E KATIL",
    en: "JOIN VIP NOW",
    ka: "შეუერთდით VIP-ს ახლავე",
    ru: "ПРИСОЕДИНЯЙТЕСЬ К VIP СЕЙЧАС"
  },
  "vip.cta.description": {
    tr: "Eşsiz avantajlar ve özel hizmetlerle dolu VIP dünyasına adım atın!",
    en: "Step into the VIP world filled with unique advantages and premium services!",
    ka: "შეაბიჯეთ VIP სამყაროში, რომელიც სავსეა უნიკალური უპირატესობებით და პრემიუმ სერვისებით!",
    ru: "Шагните в мир VIP, наполненный уникальными преимуществами и премиум-услугами!"
  },
  "vip.cta.contact_us": {
    tr: "BİZE ULAŞIN",
    en: "CONTACT US",
    ka: "დაგვიკავშირდით",
    ru: "СВЯЖИТЕСЬ С НАМИ"
  },
  "vip.cta.join_now": {
    tr: "ŞİMDİ KATIL",
    en: "JOIN NOW",
    ka: "შეუერთდით ახლავე",
    ru: "ПРИСОЕДИНИТЬСЯ СЕЙЧАС"
  }
};

// Belirli bir çeviri anahtarını seçili dile göre çevirir
export const t = (key: string): string => {
  // Tarayıcı penceresinden dil seçimini alır, yoksa 'tr' varsayılanını kullanır
  const language = getCurrentLanguage();
  
  // Çeviri anahtarı translations içinde varsa çeviriyi döndürür, yoksa anahtarın kendisini döndürür
  if (translations[key] && translations[key][language]) {
    return translations[key][language];
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
  ru: "БОНУСЫ"
};
translations["bonuses.description"] = {
  tr: "En cazip kampanyalar ve bonuslar ile kazançlarınızı artırın",
  en: "Increase your earnings with the most attractive promotions and bonuses",
  ka: "გაზარდეთ თქვენი შემოსავალი ყველაზე მიმზიდველი აქციებით და ბონუსებით",
  ru: "Увеличьте свой заработок с помощью самых привлекательных акций и бонусов"
};
translations["bonuses.view_details"] = {
  tr: "DETAYLARI GÖR",
  en: "VIEW DETAILS",
  ka: "დეტალების ნახვა",
  ru: "ПОСМОТРЕТЬ ДЕТАЛИ"
};
translations["bonuses.no_bonuses"] = {
  tr: "Şu anda bu kategoride mevcut bonus bulunmamaktadır.",
  en: "There are currently no bonuses available in this category.",
  ka: "ამ კატეგორიაში ამჟამად ბონუსები არ არის ხელმისაწვდომი.",
  ru: "В настоящее время в этой категории нет доступных бонусов."
};
translations["bonuses.claim_now"] = {
  tr: "HEMEN TALEP ET",
  en: "CLAIM NOW",
  ka: "ახლავე მოითხოვეთ",
  ru: "ПОЛУЧИТЬ СЕЙЧАС"
};
translations["bonuses.vip_bonuses"] = {
  tr: "VIP BONUSLARI",
  en: "VIP BONUSES",
  ka: "VIP ბონუსები",
  ru: "VIP БОНУСЫ"
};
translations["bonuses.filter_by_type"] = {
  tr: "BONUS TİPİNE GÖRE FİLTRELE",
  en: "FILTER BY BONUS TYPE",
  ka: "ფილტრი ბონუსის ტიპის მიხედვით",
  ru: "ФИЛЬТР ПО ТИПУ БОНУСА"
};
translations["bonuses.all_bonuses"] = {
  tr: "TÜM BONUSLAR",
  en: "ALL BONUSES",
  ka: "ყველა ბონუსი",
  ru: "ВСЕ БОНУСЫ"
};
translations["bonuses.bonuses"] = {
  tr: "BONUSLARI",
  en: "BONUSES",
  ka: "ბონუსები",
  ru: "БОНУСЫ"
};
translations["bonuses.search_placeholder"] = {
  tr: "Bonus ara...",
  en: "Search for bonuses...",
  ka: "ბონუსების ძიება...",
  ru: "Поиск бонусов..."
};
translations["bonuses.no_results"] = {
  tr: "Aradığınız kriterlere uygun bonus bulunamadı",
  en: "No bonuses found matching your criteria",
  ka: "თქვენი კრიტერიუმების შესაბამისი ბონუსები ვერ მოიძებნა",
  ru: "Не найдено бонусов, соответствующих вашим критериям"
};
translations["bonuses.try_different"] = {
  tr: "Farklı filtreleme seçenekleriyle tekrar deneyin veya tüm bonusları görüntüleyin",
  en: "Try again with different filtering options or view all bonuses",
  ka: "სცადეთ ხელახლა განსხვავებული ფილტრის პარამეტრებით ან იხილეთ ყველა ბონუსი",
  ru: "Попробуйте еще раз с другими параметрами фильтрации или просмотрите все бонусы"
};
translations["bonuses.show_more"] = {
  tr: "Daha Fazla Göster",
  en: "Show More",
  ka: "მეტის ჩვენება",
  ru: "Показать больше"
};
translations["bonuses.show_less"] = {
  tr: "Daha Az Göster",
  en: "Show Less",
  ka: "ნაკლების ჩვენება",
  ru: "Показать меньше"
};
translations["bonuses.hot"] = {
  tr: "POPÜLER",
  en: "HOT",
  ka: "პოპულარული",
  ru: "ГОРЯЧИЙ"
};
translations["bonuses.rules_title"] = {
  tr: "Bonus Kuralları",
  en: "Bonus Rules",
  ka: "ბონუსის წესები",
  ru: "Правила Бонуса"
};
translations["bonuses.claim"] = {
  tr: "BONUSU TALEP ET",
  en: "CLAIM BONUS",
  ka: "ბონუსის მოთხოვნა",
  ru: "ПОЛУЧИТЬ БОНУС"
};
translations["bonuses.close"] = {
  tr: "KAPAT",
  en: "CLOSE",
  ka: "დახურვა",
  ru: "ЗАКРЫТЬ"
};
translations["bonuses.stats.active_bonuses"] = {
  tr: "Aktif Bonus",
  en: "Active Bonuses",
  ka: "აქტიური ბონუსები",
  ru: "Активные бонусы"
};
translations["bonuses.stats.support"] = {
  tr: "Destek Hattı",
  en: "Support Line",
  ka: "მხარდაჭერის ხაზი",
  ru: "Линия поддержки"
};
translations["bonuses.stats.bonus_given"] = {
  tr: "Verilen Bonus",
  en: "Bonus Given",
  ka: "გაცემული ბონუსი",
  ru: "Выдано бонусов"
};
translations["bonuses.stats.satisfaction"] = {
  tr: "Müşteri Memnuniyeti",
  en: "Customer Satisfaction",
  ka: "მომხმარებელთა კმაყოფილება",
  ru: "Удовлетворенность клиентов"
};
translations["bonuses.sort.newest"] = {
  tr: "En Yeniler",
  en: "Newest",
  ka: "უახლესი",
  ru: "Новейшие"
};
translations["bonuses.sort.amount"] = {
  tr: "Bonus Miktarı",
  en: "Bonus Amount",
  ka: "ბონუსის ოდენობა",
  ru: "Сумма бонуса"
};
translations["bonuses.sort.popularity"] = {
  tr: "Popülerlik",
  en: "Popularity",
  ka: "პოპულარობა",
  ru: "Популярность"
};
translations["bonuses.faq.subtitle"] = {
  tr: "SIKÇA SORULAN SORULAR",
  en: "FREQUENTLY ASKED QUESTIONS",
  ka: "ხშირად დასმული კითხვები",
  ru: "ЧАСТО ЗАДАВАЕМЫЕ ВОПРОСЫ"
};
translations["bonuses.faq.title"] = {
  tr: "Bonus Kuralları Hakkında Merak Edilenler",
  en: "Questions About Bonus Rules",
  ka: "კითხვები ბონუსის წესების შესახებ",
  ru: "Вопросы о правилах бонусов"
};
translations["bonuses.faq.description"] = {
  tr: "Bonuslar hakkında en çok sorulan sorulara yanıtlarımızı bulun ve bonuslarınızı en verimli şekilde kullanın.",
  en: "Find answers to the most frequently asked questions about bonuses and use your bonuses most efficiently.",
  ka: "იპოვეთ პასუხები ყველაზე ხშირად დასმულ კითხვებზე ბონუსების შესახებ და გამოიყენეთ თქვენი ბონუსები ყველაზე ეფექტურად.",
  ru: "Найдите ответы на наиболее часто задаваемые вопросы о бонусах и используйте свои бонусы наиболее эффективно."
};
translations["bonuses.faq.q1"] = {
  tr: "Çevrim şartı nedir?",
  en: "What is wagering requirement?",
  ka: "რა არის ფსონის მოთხოვნა?",
  ru: "Что такое требование по отыгрышу?"
};
translations["bonuses.faq.a1"] = {
  tr: "Çevrim şartı, bir bonusu çekebilmeniz için bonusu kaç kez oynamanız gerektiğini belirtir. Örneğin, 40x çevrim şartı olan 100₺ bonusu çekebilmek için 4,000₺'lik bahis yapmanız gerekir.",
  en: "Wagering requirement specifies how many times you need to play a bonus before you can withdraw it. For example, to withdraw a 100₺ bonus with a 40x wagering requirement, you need to place bets worth 4,000₺.",
  ka: "ფსონის მოთხოვნა განსაზღვრავს, რამდენჯერ უნდა ითამაშოთ ბონუსი, სანამ მის გატანას შეძლებთ. მაგალითად, 100₺ ბონუსის გასატანად 40x ფსონის მოთხოვნით, საჭიროა 4,000₺ ღირებულების ფსონების განთავსება.",
  ru: "Требование по отыгрышу указывает, сколько раз вам нужно сыграть бонус, прежде чем вы сможете его вывести. Например, чтобы вывести бонус в 100₺ с требованием отыгрыша 40x, вам нужно сделать ставки на сумму 4,000₺."
};
translations["bonuses.faq.q2"] = {
  tr: "Bonusları nasıl talep edebilirim?",
  en: "How can I claim bonuses?",
  ka: "როგორ შემიძლია ბონუსების მოთხოვნა?",
  ru: "Как я могу получить бонусы?"
};
translations["bonuses.faq.a2"] = {
  tr: "Bonusları talep etmek için hesabınıza giriş yapın, Bonuslar sayfasına gidin ve talep etmek istediğiniz bonusu seçin. Bazı bonuslar otomatik olarak hesabınıza eklenir, bazıları için ise bonus kodu girmeniz gerekebilir.",
  en: "To claim bonuses, log in to your account, go to the Bonuses page, and select the bonus you want to claim. Some bonuses are added to your account automatically, while others may require you to enter a bonus code.",
  ka: "ბონუსების მოსათხოვნად, შედით თქვენს ანგარიშზე, გადადით ბონუსების გვერდზე და აირჩიეთ ბონუსი, რომლის მოთხოვნაც გსურთ. ზოგიერთი ბონუსი ავტომატურად ემატება თქვენს ანგარიშს, ზოგისთვის კი შეიძლება საჭირო იყოს ბონუს კოდის შეყვანა.",
  ru: "Чтобы получить бонусы, войдите в свою учетную запись, перейдите на страницу Бонусы и выберите бонус, который вы хотите получить. Некоторые бонусы добавляются на ваш счет автоматически, в то время как для других может потребоваться ввод бонусного кода."
};
translations["bonuses.faq.q3"] = {
  tr: "Aynı anda birden fazla bonus kullanabilir miyim?",
  en: "Can I use multiple bonuses at the same time?",
  ka: "შემიძლია ერთდროულად რამდენიმე ბონუსის გამოყენება?",
  ru: "Могу ли я использовать несколько бонусов одновременно?"
};
translations["bonuses.faq.a3"] = {
  tr: "Genellikle aynı anda sadece bir bonus aktif olabilir. Bir bonusu kullanırken diğer bonusları talep edebilirsiniz, ancak bunlar mevcut bonusunuzu tamamlayana kadar bekleme listesinde kalacaktır.",
  en: "Usually, only one bonus can be active at a time. You can claim other bonuses while using one, but they will remain in a waiting list until you complete your current bonus.",
  ka: "ჩვეულებრივ, ერთ დროს მხოლოდ ერთი ბონუსი შეიძლება იყოს აქტიური. შეგიძლიათ მოითხოვოთ სხვა ბონუსები ერთის გამოყენებისას, მაგრამ ისინი დარჩებიან მოლოდინის სიაში, სანამ თქვენს მიმდინარე ბონუსს დაასრულებთ.",
  ru: "Обычно одновременно может быть активен только один бонус. Вы можете запросить другие бонусы во время использования одного, но они будут оставаться в списке ожидания, пока вы не завершите свой текущий бонус."
};
translations["bonuses.faq.q4"] = {
  tr: "Bonusları çekmek için zaman sınırı var mı?",
  en: "Is there a time limit to withdraw bonuses?",
  ka: "არის დროის ლიმიტი ბონუსების გასატანად?",
  ru: "Есть ли ограничение по времени для вывода бонусов?"
};
translations["bonuses.faq.a4"] = {
  tr: "Evet, her bonusun belirli bir süresi vardır. Bu süre genellikle 7-30 gün arasında değişir ve bu süre içinde çevrim şartlarını tamamlamanız gerekir. Bonusun detaylarında bu bilgiyi bulabilirsiniz.",
  en: "Yes, each bonus has a specific time period. This period usually varies between 7-30 days, and you need to complete the wagering requirements within this time. You can find this information in the bonus details.",
  ka: "დიახ, თითოეულ ბონუსს აქვს კონკრეტული დროის პერიოდი. ეს პერიოდი ჩვეულებრივ მერყეობს 7-30 დღეს შორის და თქვენ უნდა შეასრულოთ ფსონის მოთხოვნები ამ დროის განმავლობაში. ამ ინფორმაციას შეგიძლიათ იპოვოთ ბონუსის დეტალებში.",
  ru: "Да, у каждого бонуса есть определенный период времени. Этот период обычно варьируется от 7 до 30 дней, и вам необходимо выполнить требования по отыгрышу в течение этого времени. Вы можете найти эту информацию в деталях бонуса."
};
translations["bonuses.cta.title"] = {
  tr: "Özel VIP Bonuslarına Erişin",
  en: "Access Exclusive VIP Bonuses",
  ka: "წვდომა ექსკლუზიურ VIP ბონუსებზე",
  ru: "Доступ к эксклюзивным VIP-бонусам"
};
translations["bonuses.cta.description"] = {
  tr: "VIP programımıza katılın ve sadece elit üyelerimize özel bonuslardan yararlanın. Daha yüksek limitler, kişiselleştirilmiş teklifler ve çok daha fazlası sizi bekliyor!",
  en: "Join our VIP program and take advantage of bonuses exclusive to our elite members. Higher limits, personalized offers, and much more await you!",
  ka: "შეუერთდით ჩვენს VIP პროგრამას და ისარგებლეთ ბონუსებით, რომლებიც ექსკლუზიურია ჩვენი ელიტარული წევრებისთვის. უფრო მაღალი ლიმიტები, პერსონალიზებული შეთავაზებები და კიდევ უფრო მეტი გელოდებათ!",
  ru: "Присоединяйтесь к нашей VIP-программе и воспользуйтесь бонусами, эксклюзивными для наших элитных участников. Более высокие лимиты, персонализированные предложения и многое другое ждут вас!"
};
translations["bonuses.cta.action"] = {
  tr: "VIP Üyeliğe Başvur",
  en: "Apply for VIP Membership",
  ka: "განაცხადის შეტანა VIP წევრობისთვის",
  ru: "Подать заявку на VIP-членство"
};
translations["bonuses.cta.secondary"] = {
  tr: "Daha Fazla Bilgi",
  en: "More Information",
  ka: "მეტი ინფორმაცია",
  ru: "Больше информации"
};

translations["bonuses.no_results"] = {
  tr: "Aradığınız kriterlere uygun bonus bulunamadı",
  en: "There are currently no bonuses available in this category.",
  ka: "ამ კატეგორიაში ამჟამად ბონუსები არ არის ხელმისაწვდომი.",
  ru: "В настоящее время в этой категории нет бонусов."
};
translations["bonuses.hot"] = {
  tr: "POPÜLER",
  en: "HOT",
  ka: "პოპულარული",
  ru: "ГОРЯЧИЙ"
};
translations["bonuses.rules_title"] = {
  tr: "Bonus Kuralları ve Şartları",
  en: "Bonus Rules and Conditions",
  ka: "ბონუსის წესები და პირობები",
  ru: "Правила и условия бонуса"
};
translations["bonuses.close"] = {
  tr: "KAPAT",
  en: "CLOSE",
  ka: "დახურვა",
  ru: "ЗАКРЫТЬ"
};
translations["bonuses.claim"] = {
  tr: "BONUSU TALEP ET",
  en: "CLAIM BONUS",
  ka: "ბონუსის მოთხოვნა",
  ru: "ПОЛУЧИТЬ БОНУС"
};