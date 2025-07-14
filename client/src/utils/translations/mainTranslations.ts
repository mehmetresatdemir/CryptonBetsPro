import { Translations } from '@/i18n-fixed';

// Bu dosya anasayfa ve genel çeviriler için tüm çevirileri içerir
export const mainTranslations: Translations = {
  // ----------------------------
  // BİLDİRİMLER
  // ----------------------------
  "notifications.login_success": {
    tr: "Giriş başarılı",
    en: "Login successful",
    ka: "შესვლა წარმატებულია",
    ru: "Вход выполнен успешно"
  },
  "notifications.login_error": {
    tr: "Giriş yapılamadı",
    en: "Login failed",
    ka: "შესვლა ვერ მოხერხდა",
    ru: "Ошибка входа"
  },
  "notifications.register_success": {
    tr: "Kayıt başarılı",
    en: "Registration successful",
    ka: "რეგისტრაცია წარმატებულია",
    ru: "Регистрация успешна"
  },
  "notifications.register_error": {
    tr: "Kayıt yapılamadı",
    en: "Registration failed",
    ka: "რეგისტრაცია ვერ მოხერხდა",
    ru: "Ошибка регистрации"
  },
  // ----------------------------
  // HEADER & KULLANICI MENÜSÜ
  // ----------------------------
  "header.profile": {
    tr: "Profil",
    en: "Profile",
    ka: "პროფილი",
    ru: "Профиль"
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
  // ----------------------------
  // ÖDEME YÖNTEMLERİ
  // ----------------------------
  "payment.papara_desc": {
    tr: "Hızlı ve güvenli para yatırma",
    en: "Fast and secure deposit",
    ka: "სწრაფი და უსაფრთხო დეპოზიტი",
    ru: "Быстрый и безопасный депозит"
  },
  "payment.instant": {
    tr: "Anında",
    en: "Instant",
    ka: "მყისიერი",
    ru: "Мгновенно"
  },
  "payment.bank_transfer": {
    tr: "Banka Transferi",
    en: "Bank Transfer",
    ka: "საბანკო გადარიცხვა",
    ru: "Банковский перевод"
  },
  "payment.bank_transfer_desc": {
    tr: "Tüm bankalar için geçerli",
    en: "Valid for all banks",
    ka: "მოქმედებს ყველა ბანკისთვის",
    ru: "Действует для всех банков"
  },
  "payment.hours": {
    tr: "saat",
    en: "hours",
    ka: "საათი",
    ru: "часов"
  },
  "payment.minutes": {
    tr: "dakika",
    en: "minutes",
    ka: "წუთი",
    ru: "минут"
  },
  "payment.mobile_banking": {
    tr: "Mobil Bankacılık",
    en: "Mobile Banking",
    ka: "მობილური საბანკო",
    ru: "Мобильный банкинг"
  },
  "payment.paykasa_desc": {
    tr: "Ön ödemeli kart ile yatırım",
    en: "Deposit with prepaid card",
    ka: "დეპოზიტი წინასწარ გადახდილი ბარათით",
    ru: "Депозит с предоплаченной картой"
  },
  "payment.crypto_desc": {
    tr: "Bitcoin ve diğer kripto para birimleri",
    en: "Bitcoin and other cryptocurrencies",
    ka: "ბიტკოინი და სხვა კრიპტოვალუტები",
    ru: "Биткойн и другие криптовалюты"
  },
  "payment.astropay_desc": {
    tr: "Uluslararası ödeme sistemi",
    en: "International payment system",
    ka: "საერთაშორისო გადახდის სისტემა",
    ru: "Международная платежная система"
  },
  "payment.envoysoft_desc": {
    tr: "Hızlı para transferi",
    en: "Fast money transfer",
    ka: "სწრაფი ფულადი გადარიცხვა",
    ru: "Быстрый перевод денег"
  },
  "payment.payfix_desc": {
    tr: "Dijital cüzdan ile ödeme",
    en: "Payment with digital wallet",
    ka: "გადახდა ციფრული საფულით",
    ru: "Оплата с цифровым кошельком"
  },
  // ----------------------------
  // SİTE ÖZELLİKLERİ
  // ----------------------------
  "site.features": {
    tr: "ÖZELLİKLER",
    en: "FEATURES",
    ka: "მახასიათებლები",
    ru: "ФУНКЦИИ"
  },
  "site.secure_gaming": {
    tr: "Güvenli Oyun",
    en: "Secure Gaming",
    ka: "უსაფრთხო თამაში",
    ru: "Безопасная Игра"
  },
  "site.secure_gaming_desc": {
    tr: "SSL şifrelemesi ile güvenli oyun deneyimi",
    en: "Secure gaming experience with SSL encryption",
    ka: "უსაფრთხო სათამაშო გამოცდილება SSL დაშიფვრით",
    ru: "Безопасный игровой опыт с шифрованием SSL"
  },
  "site.fast_withdrawal": {
    tr: "Hızlı Çekim",
    en: "Fast Withdrawal",
    ka: "სწრაფი გატანა",
    ru: "Быстрый Вывод"
  },
  "site.fast_withdrawal_desc": {
    tr: "30 dakika içinde para çekim işlemleri",
    en: "Withdrawal transactions within 30 minutes",
    ka: "თანხის გატანის ოპერაციები 30 წუთის განმავლობაში",
    ru: "Операции вывода в течение 30 минут"
  },
  "site.support_24_7": {
    tr: "7/24 Destek",
    en: "24/7 Support",
    ka: "24/7 მხარდაჭერა",
    ru: "Поддержка 24/7"
  },
  "site.support_24_7_desc": {
    tr: "Her zaman size yardıma hazır canlı destek",
    en: "Live support always ready to help you",
    ka: "ცოცხალი მხარდაჭერა ყოველთვის მზადაა დაგეხმაროთ",
    ru: "Живая поддержка всегда готова помочь"
  },
  "site.easy_payment": {
    tr: "Kolay Ödeme",
    en: "Easy Payment",
    ka: "მარტივი გადახდა",
    ru: "Простая Оплата"
  },
  "site.easy_payment_desc": {
    tr: "Çeşitli ödeme yöntemleri ile kolay para yatırma",
    en: "Easy deposit with various payment methods",
    ka: "მარტივი შენატანი სხვადასხვა გადახდის მეთოდებით",
    ru: "Легкий депозит с различными способами оплаты"
  },
  // ----------------------------
  // HEADER ÇEVİRİLERİ
  // ----------------------------
  "header.login": {
    tr: "GİRİŞ",
    en: "LOGIN",
    ka: "შესვლა",
    ru: "ВХОД"
  },
  "header.register": {
    tr: "KAYIT OL",
    en: "REGISTER",
    ka: "რეგისტრაცია",
    ru: "РЕГИСТРАЦИЯ"
  },
  "header.welcome": {
    tr: "Hoş Geldiniz",
    en: "Welcome",
    ka: "მოგესალმებით",
    ru: "Добро пожаловать"
  },
  "header.affiliate": {
    tr: "Ortaklık",
    en: "Affiliate",
    ka: "პარტნიორობა",
    ru: "Партнерская программа"
  },
  "header.commission": {
    tr: "Komisyon",
    en: "Commission",
    ka: "საკომისიო",
    ru: "Комиссия"
  },
  "header.licensed_site": {
    tr: "Lisanslı Site",
    en: "Licensed Site",
    ka: "ლიცენზირებული საიტი",
    ru: "Лицензированный сайт"
  },
  "header.official_sponsor": {
    tr: "Resmi Sponsor",
    en: "Official Sponsor",
    ka: "ოფიციალური სპონსორი",
    ru: "Официальный спонсор"
  },
  "header.telegram_channel": {
    tr: "Telegram Kanalımız",
    en: "Our Telegram Channel",
    ka: "ჩვენი Telegram არხი",
    ru: "Наш Telegram канал"
  },
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
  "header.balance": {
    tr: "Bakiye",
    en: "Balance",
    ka: "ბალანსი",
    ru: "Баланс"
  },
  
  // ----------------------------
  // ANASAYFA ÇEVİRİLERİ
  // ----------------------------
  "home.welcome": {
    tr: "HOŞ GELDİNİZ",
    en: "WELCOME",
    ka: "მოგესალმებით",
    ru: "ДОБРО ПОЖАЛОВАТЬ"
  },
  "home.welcome_sub": {
    tr: "En iyi bahis deneyimi için doğru yerdesiniz!",
    en: "You're at the right place for the best betting experience!",
    ka: "თქვენ სწორ ადგილას ხართ საუკეთესო ფსონის გამოცდილებისთვის!",
    ru: "Вы в нужном месте для лучшего игрового опыта!"
  },
  "home.popular_slots": {
    tr: "POPÜLER SLOT OYUNLARI",
    en: "POPULAR SLOT GAMES",
    ka: "პოპულარული სლოტ თამაშები",
    ru: "ПОПУЛЯРНЫЕ СЛОТ ИГРЫ"
  },
  "home.popular_casino": {
    tr: "POPÜLER CASINO OYUNLARI",
    en: "POPULAR CASINO GAMES",
    ka: "პოპულარული კაზინოს თამაშები",
    ru: "ПОПУЛЯРНЫЕ ИГРЫ КАЗИНО"
  },
  "home.providers": {
    tr: "OYUN SAĞLAYICILARIMIZ",
    en: "OUR GAME PROVIDERS",
    ka: "ჩვენი თამაშების პროვაიდერები",
    ru: "НАШИ ПРОВАЙДЕРЫ ИГР"
  },
  "home.payment_methods": {
    tr: "ÖDEME YÖNTEMLERİ",
    en: "PAYMENT METHODS",
    ka: "გადახდის მეთოდები",
    ru: "СПОСОБЫ ОПЛАТЫ"
  },
  "home.license": {
    tr: "LİSANS",
    en: "LICENSE",
    ka: "ლიცენზია",
    ru: "ЛИЦЕНЗИЯ"
  },
  "home.recent_winners": {
    tr: "SON KAZANANLAR",
    en: "RECENT WINNERS",
    ka: "ბოლო გამარჯვებულები",
    ru: "НЕДАВНИЕ ПОБЕДИТЕЛИ"
  },
  "home.live_jackpots": {
    tr: "CANLI JACKPOTLAR",
    en: "LIVE JACKPOTS",
    ka: "ცოცხალი ჯეკპოტები",
    ru: "ЖИВЫЕ ДЖЕКПОТЫ"
  },
  "home.jackpots_update_realtime": {
    tr: "Jackpot miktarları gerçek zamanlı olarak güncellenmektedir",
    en: "Jackpot amounts are updated in real-time",
    ka: "ჯეკპოტის თანხები რეალურ დროში განახლდება",
    ru: "Суммы джекпотов обновляются в режиме реального времени"
  },
  "home.view_all": {
    tr: "Tümünü Gör",
    en: "View All",
    ka: "ყველას ნახვა",
    ru: "Посмотреть все"
  },
  
  // ----------------------------
  // MOBİL HIZLI ERİŞİM ÇEVİRİLERİ
  // ----------------------------
  "mobile.quick_access": {
    tr: "Hızlı Erişim",
    en: "Quick Access",
    ka: "სწრაფი წვდომა"
  },
  "mobile.deposit": {
    tr: "Para Yatır",
    en: "Deposit",
    ka: "დეპოზიტი"
  },
  "mobile.bonus_claim": {
    tr: "Bonus Talep",
    en: "Claim Bonus",
    ka: "ბონუსის მიღება"
  },
  "mobile.live_support": {
    tr: "Canlı Destek",
    en: "Live Support",
    ka: "ცოცხალი მხარდაჭერა"
  },
  "mobile.vip": {
    tr: "VIP",
    en: "VIP",
    ka: "VIP"
  },
  "home.license_info": {
    tr: "CryptonBets, Curacao E-Gaming tarafından verilen geçerli bir kumar lisansı altında faaliyet göstermektedir.",
    en: "CryptonBets operates under a valid gambling license issued by Curacao E-Gaming.",
    ka: "CryptonBets საქმიანობს კურასაოს ელექტრონული თამაშების მიერ გაცემული მოქმედი სათამაშო ლიცენზიის ფარგლებში.",
    ru: "CryptonBets работает по действующей лицензии на азартные игры, выданной Curacao E-Gaming."
  },
  
  // Slider çevirileri
  "slider.slot_bonus": {
    tr: "SLOT BONUSU",
    en: "SLOT BONUS",
    ka: "სლოტ ბონუსი",
    ru: "СЛОТ БОНУС"
  },
  "slider.slot_description": {
    tr: "Tüm slot oyunlarında %50 ekstra bonus",
    en: "50% extra bonus on all slot games",
    ka: "50% დამატებითი ბონუსი ყველა სლოტ თამაშზე",
    ru: "50% дополнительный бонус на все слот-игры"
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
  "banner.details": {
    tr: "Detaylar",
    en: "Details",
    ka: "დეტალები",
    ru: "Подробности"
  },
  "banner.limited_offers": {
    tr: "SINIRLI SÜRELI FIRSATLAR",
    en: "LIMITED TIME OFFERS",
    ka: "შეზღუდული დროის შეთავაზებები",
    ru: "ОГРАНИЧЕННЫЕ ПО ВРЕМЕНИ ПРЕДЛОЖЕНИЯ"
  },
  "banner.detail_button": {
    tr: "DETAY",
    en: "DETAILS",
    ka: "დეტალები",
    ru: "ПОДРОБНО"
  },
  "slider.saturday_slot_bonus": {
    tr: "CUMARTESİ SLOT BONUSU",
    en: "SATURDAY SLOT BONUS",
    ka: "შაბათის სლოტ ბონუსი",
    ru: "СУББОТНИЙ СЛОТ БОНУС"
  },
  "slider.saturday_slot_description": {
    tr: "Her cumartesi slot bonusu %100 olarak verilmektedir",
    en: "Every Saturday, slot bonus is given as 100%",
    ka: "ყოველ შაბათს, სლოტ ბონუსი გაიცემა 100%-ით",
    ru: "Каждую субботу бонус на слоты выдается как 100%"
  },
  "slider.trial_bonus": {
    tr: "DENEME BONUSU",
    en: "TRIAL BONUS",
    ka: "საცდელი ბონუსი",
    ru: "ПРОБНЫЙ БОНУС"
  },
  "slider.trial_description": {
    tr: "Yeni üyelere özel 200 TL deneme bonusu",
    en: "Special 200 TL trial bonus for new members",
    ka: "სპეციალური 200 TL საცდელი ბონუსი ახალი წევრებისთვის",
    ru: "Специальный бонус для новых участников 200 TL"
  }, 
  "slider.loyalty_bonus": {
    tr: "SADAKAT BONUSU",
    en: "LOYALTY BONUS",
    ka: "ლოიალურობის ბონუსი",
    ru: "БОНУС ЛОЯЛЬНОСТИ"
  },
  "slider.loyalty_description": {
    tr: "Düzenli oynayan kullanıcılara özel avantajlar",
    en: "Special advantages for regular players",
    ka: "სპეციალური უპირატესობები რეგულარული მოთამაშეებისთვის",
    ru: "Особые преимущества для постоянных игроков"
  },
  "slider.join_now": {
    tr: "HEMEN KATIL",
    en: "JOIN NOW",
    ka: "ახლავე შეუერთდი",
    ru: "ПРИСОЕДИНЯЙТЕСЬ СЕЙЧАС"
  },
  "slider.trial_bonus_description": {
    tr: "Yeni üyelere özel deneme bonusu hemen hesabınızda",
    en: "Special trial bonus for new members instantly in your account",
    ka: "სპეციალური საცდელი ბონუსი ახალი წევრებისთვის მყისიერად თქვენს ანგარიშზე",
    ru: "Специальный пробный бонус для новых пользователей моментально на вашем счету"
  },
  "slider.loyalty_bonus_description": {
    tr: "Sadık kullanıcılarımıza özel bonuslar ve hediyeler",
    en: "Special bonuses and gifts for our loyal users",
    ka: "სპეციალური ბონუსები და საჩუქრები ჩვენი ერთგული მომხმარებლებისთვის",
    ru: "Специальные бонусы и подарки для наших лояльных пользователей"
  },
  "slider.welcome_bonus": {
    tr: "HOŞGELDİN BONUSU",
    en: "WELCOME BONUS",
    ka: "მისალმების ბონუსი",
    ru: "ПРИВЕТСТВЕННЫЙ БОНУС"
  },
  "slider.welcome_description": {
    tr: "İlk yatırımınıza özel %100 bonus",
    en: "Special 100% bonus on your first deposit",
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

  // Bilgi kartları
  "info.cards.title": {
    tr: "ÖNEMLİ BİLGİLER",
    en: "IMPORTANT INFORMATION",
    ka: "მნიშვნელოვანი ინფორმაცია",
    ru: "ВАЖНАЯ ИНФОРМАЦИЯ"
  },
  "info.payments": {
    tr: "ÖDEMELER",
    en: "PAYMENTS",
    ka: "გადახდები",
    ru: "ПЛАТЕЖИ"
  },
  "info.payments.desc": {
    tr: "Hızlı ve güvenli ödeme yöntemleri",
    en: "Fast and secure payment methods",
    ka: "სწრაფი და უსაფრთხო გადახდის მეთოდები",
    ru: "Быстрые и безопасные способы оплаты"
  },
  "info.bonuses": {
    tr: "BONUSLAR",
    en: "BONUSES",
    ka: "ბონუსები",
    ru: "БОНУСЫ"
  },
  "info.bonuses.desc": {
    tr: "Kazançlı bonus fırsatları",
    en: "Profitable bonus opportunities",
    ka: "მომგებიანი ბონუს შესაძლებლობები",
    ru: "Выгодные бонусные возможности"
  },
  "info.support": {
    tr: "DESTEK",
    en: "SUPPORT",
    ka: "მხარდაჭერა",
    ru: "ПОДДЕРЖКА"
  },
  "info.support.desc": {
    tr: "7/24 canlı destek hizmeti",
    en: "24/7 live support service",
    ka: "24/7 ცოცხალი მხარდაჭერის სერვისი",
    ru: "Техподдержка 24/7"
  },
  "info.security": {
    tr: "GÜVENLİK",
    en: "SECURITY",
    ka: "უსაფრთხოება",
    ru: "БЕЗОПАСНОСТЬ"
  },
  "info.security.desc": {
    tr: "SSL şifrelemesi ile güvenli oyun",
    en: "Secure gaming with SSL encryption",
    ka: "უსაფრთხო თამაში SSL დაშიფვრით",
    ru: "Безопасная игра с шифрованием SSL"
  },

  // Liderlik tablosu
  "leaderboard.title": {
    tr: "LİDERLİK TABLOSU",
    en: "LEADERBOARD",
    ka: "ლიდერბორდი",
    ru: "ТАБЛИЦА ЛИДЕРОВ"
  },
  "leaderboard.highest_win": {
    tr: "En Yüksek Kazanç",
    en: "Highest Win",
    ka: "უმაღლესი მოგება",
    ru: "Наибольший выигрыш"
  },
  "leaderboard.top_depositor": {
    tr: "En Çok Yatırım Yapan",
    en: "Top Depositor",
    ka: "ყველაზე დიდი შემომტანი",
    ru: "Лучший депозитор"
  },
  "leaderboard.rank": {
    tr: "Sıra",
    en: "Rank",
    ka: "რანგი",
    ru: "Ранг"
  },
  "leaderboard.player": {
    tr: "Oyuncu",
    en: "Player",
    ka: "მოთამაშე",
    ru: "Игрок"
  },
  "leaderboard.game": {
    tr: "Oyun",
    en: "Game",
    ka: "თამაში",
    ru: "Игра"
  },
  "leaderboard.bet": {
    tr: "Bahis",
    en: "Bet",
    ka: "ფსონი",
    ru: "Ставка"
  },
  "leaderboard.multiplier": {
    tr: "Çarpan",
    en: "Multiplier",
    ka: "გამრავლება",
    ru: "Множитель"
  },
  "leaderboard.win": {
    tr: "Kazanç",
    en: "Win",
    ka: "მოგება",
    ru: "Выигрыш"
  },

  // Oyun bölümleri
  "home.popularSlots.title": {
    tr: "POPÜLER SLOT OYUNLARI",
    en: "POPULAR SLOT GAMES",
    ka: "პოპულარული სლოტ თამაშები",
    ru: "ПОПУЛЯРНЫЕ СЛОТ ИГРЫ"
  },
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
  // ----------------------------
  // AI CHAT SUPPORT TRANSLATIONS
  // ----------------------------
  "chat.ai_support": {
    tr: "AI Canlı Destek",
    en: "AI Live Support",
    ka: "AI ცოცხალი მხარდაჭერა"
  },
  "chat.quick.balance": {
    tr: "Bakiyemi Göster",
    en: "Show Balance",
    ka: "ბალანსის ნახვა"
  },
  "chat.quick.bonus": {
    tr: "Bonus Almak İstiyorum",
    en: "I Want Bonus",
    ka: "ბონუსის მიღება"
  },
  "chat.quick.deposit": {
    tr: "Para Yatırmak İstiyorum",
    en: "I Want to Deposit",
    ka: "დეპოზიტის შეტანა"
  },
  "chat.quick.withdraw": {
    tr: "Para Çekmek İstiyorum",
    en: "I Want to Withdraw",
    ka: "თანხის გამოტანა"
  },
  "chat.quick.games": {
    tr: "Oyun Önerisi",
    en: "Game Recommendations",
    ka: "თამაშის რეკომენდაცია"
  },
  "chat.quick.vip": {
    tr: "VIP Programı Hakkında",
    en: "About VIP Program",
    ka: "VIP პროგრამის შესახებ"
  },
  "chat.quick.kyc": {
    tr: "KYC Doğrulama",
    en: "KYC Verification",
    ka: "KYC ვერიფიკაცია"
  },
  "chat.quick.limits": {
    tr: "Limit Ayarları",
    en: "Limit Settings",
    ka: "ლიმიტის პარამეტრები"
  },
  "chat.online": {
    tr: "Çevrimiçi",
    en: "Online",
    ka: "ონლაინ"
  },
  "chat.welcome": {
    tr: "CryptonBets AI Asistanına Hoş Geldiniz!",
    en: "Welcome to CryptonBets AI Assistant!",
    ka: "კეთილი იყოს თქვენი მობრძანება CryptonBets AI ასისტენტში!"
  },
  "chat.welcome_desc": {
    tr: "Size nasıl yardımcı olabilirim? Sorularınızı sorun.",
    en: "How can I help you today? Feel free to ask any questions.",
    ka: "როგორ შემიძლია დაგეხმაროთ? თავისუფლად დასვით კითხვები."
  },
  "chat.type_message": {
    tr: "Mesajınızı yazın...",
    en: "Type your message...",
    ka: "დაწერეთ თქვენი შეტყობინება..."
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

  "home.popularCasino.title": {
    tr: "POPÜLER CASINO OYUNLARI",
    en: "POPULAR CASINO GAMES",
    ka: "პოპულარული კაზინოს თამაშები",
    ru: "ПОПУЛЯРНЫЕ ИГРЫ КАЗИНО"
  },
  "home.popularCasino.info": {
    tr: "En popüler casino oyunlarını keşfedin",
    en: "Discover the most popular casino games",
    ka: "აღმოაჩინეთ ყველაზე პოპულარული კაზინოს თამაშები",
    ru: "Откройте для себя самые популярные игры казино"
  },
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
  "home.popularCasino.live": {
    tr: "Canlı",
    en: "Live",
    ka: "ცოცხალი",
    ru: "Лайв"
  },
  "home.popularCasino.play": {
    tr: "OYNA",
    en: "PLAY",
    ka: "თამაში",
    ru: "ИГРАТЬ"
  },
  "home.slotegratorGames.title": {
    tr: "EN ÇOK OYNANAN OYUNLAR",
    en: "MOST PLAYED GAMES",
    ka: "ყველაზე პოპულარული თამაშები",
    ru: "САМЫЕ ПОПУЛЯРНЫЕ ИГРЫ"
  },
  "home.slotegratorGames.info": {
    tr: "Oyuncuların en çok tercih ettiği oyunlar",
    en: "Most preferred games by players",
    ka: "მოთამაშეების მიერ ყველაზე მეტად არჩეული თამაშები",
    ru: "Игры, наиболее предпочитаемые игроками"
  },
  "home.gameProviders.title": {
    tr: "OYUN SAĞLAYICILARIMIZ",
    en: "OUR GAME PROVIDERS",
    ka: "ჩვენი თამაშების პროვაიდერები",
    ru: "НАШИ ПРОВАЙДЕРЫ ИГР"
  },
  "home.gameProviders.description": {
    tr: "En iyi oyun deneyimi için yüksek kaliteli oyun sağlayıcılarıyla çalışıyoruz",
    en: "We work with high-quality game providers for the best gaming experience",
    ka: "ჩვენ ვმუშაობთ მაღალი ხარისხის თამაშების პროვაიდერებთან საუკეთესო სათამაშო გამოცდილებისთვის",
    ru: "Мы работаем с высококачественными провайдерами игр для лучшего игрового опыта"
  },
  "home.financeProviders.title": {
    tr: "ÖDEME YÖNTEMLERİ",
    en: "PAYMENT METHODS",
    ka: "გადახდის მეთოდები",
    ru: "СПОСОБЫ ОПЛАТЫ"
  },
  "home.financeProviders.description": {
    tr: "Güvenli ve hızlı finansal işlemler için birçok seçenek sunuyoruz",
    en: "We offer many options for secure and fast financial transactions",
    ka: "ჩვენ გთავაზობთ ბევრ ვარიანტს უსაფრთხო და სწრაფი ფინანსური ტრანზაქციებისთვის",
    ru: "Мы предлагаем множество вариантов для безопасных и быстрых финансовых операций"
  },
  "home.financeProviders.secure": {
    tr: "Güvenli",
    en: "Secure",
    ka: "უსაფრთხო",
    ru: "Безопасно"
  },
  "home.financeProviders.fast": {
    tr: "Hızlı",
    en: "Fast",
    ka: "სწრაფი",
    ru: "Быстро"
  },
  "home.license.title": {
    tr: "LİSANS",
    en: "LICENSE",
    ka: "ლიცენზია",
    ru: "ЛИЦЕНЗИЯ"
  },
  "home.license.description": {
    tr: "CryptonBets, yasal ve lisanslı bir bahis platformudur",
    en: "CryptonBets is a legal and licensed betting platform",
    ka: "CryptonBets არის ლეგალური და ლიცენზირებული სათამაშო პლატფორმა",
    ru: "CryptonBets - это легальная и лицензированная платформа для ставок"
  },
  "home.license.name": {
    tr: "Curacao E-Gaming",
    en: "Curacao E-Gaming",
    ka: "Curacao E-Gaming",
    ru: "Curacao E-Gaming"
  },
  "home.license.verify": {
    tr: "Doğrula",
    en: "Verify",
    ka: "შემოწმება",
    ru: "Проверить"
  },

  // ----------------------------
  // QUICK ACCESS BUTTONS ÇEVİRİLERİ
  // ----------------------------
  "quickAccess.deposit": {
    tr: "Para Yatır",
    en: "Deposit",
    ka: "თანხის შეტანა",
    ru: "Депозит"
  },
  "quickAccess.bonusRequest": {
    tr: "Bonus Talep",
    en: "Bonus Request",
    ka: "ბონუსის მოთხოვნა",
    ru: "Запрос бонуса"
  },
  "quickAccess.callMe": {
    tr: "Beni Ara",
    en: "Call Me",
    ka: "დამირეკე",
    ru: "Позвоните мне"
  },
  "quickAccess.liveSupport": {
    tr: "Canlı Destek",
    en: "Live Support",
    ka: "ცოცხალი მხარდაჭერა",
    ru: "Живая поддержка"
  },
  "quickAccess.rules": {
    tr: "Kurallar",
    en: "Rules",
    ka: "წესები",
    ru: "Правила"
  },

  // ----------------------------
  // FOOTER ÇEVİRİLERİ
  // ----------------------------
  "footer.follow_us": {
    tr: "Bizi Takip Edin",
    en: "Follow Us",
    ka: "გამოგვყევით",
    ru: "Подписывайтесь на нас"
  },
  "footer.copyright": {
    tr: "Tüm hakları saklıdır",
    en: "All rights reserved",
    ka: "ყველა უფლება დაცულია",
    ru: "Все права защищены"
  },
  "footer.terms": {
    tr: "Şartlar ve Koşullar",
    en: "Terms and Conditions",
    ka: "წესები და პირობები",
    ru: "Правила и условия"
  },
  "footer.privacy": {
    tr: "Gizlilik Politikası",
    en: "Privacy Policy",
    ka: "კონფიდენციალურობის პოლიტიკა",
    ru: "Политика конфиденциальности"
  },
  
  // ----------------------------
  // GENEL HATALAR
  // ----------------------------
  "errors.no_games_found": {
    tr: "Oyun bulunamadı",
    en: "No games found",
    ka: "თამაშები ვერ მოიძებნა",
    ru: "Игры не найдены"
  },
  "games.play_now": {
    tr: "ŞİMDİ OYNA",
    en: "PLAY NOW",
    ka: "ითამაშე ახლა",
    ru: "ИГРАТЬ СЕЙЧАС"
  },
  
  // ----------------------------
  // MOBİL NAVİGASYON MENÜLERİ
  // ----------------------------
  "nav.home": {
    tr: "ANASAYFA",
    en: "HOME",
    ka: "მთავარი",
    ru: "ГЛАВНАЯ"
  },
  "nav.casino": {
    tr: "CASINO",
    en: "CASINO",
    ka: "კაზინო",
    ru: "КАЗИНО"
  },
  "nav.slot": {
    tr: "SLOT",
    en: "SLOT",
    ka: "სლოტი",
    ru: "СЛОТ"
  },
  "nav.crypto": {
    tr: "CRYPTO",
    en: "CRYPTO",
    ka: "კრიპტო",
    ru: "КРИПТО"
  },
  "nav.profile": {
    tr: "PROFİL",
    en: "PROFILE",
    ka: "პროფილი",
    ru: "ПРОФИЛЬ"
  },
  "nav.logout": {
    tr: "ÇIKIŞ YAP",
    en: "LOGOUT",
    ka: "გასვლა",
    ru: "ВЫХОД"
  }
};