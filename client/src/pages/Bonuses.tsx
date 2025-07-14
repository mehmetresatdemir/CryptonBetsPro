import React, { useState, useEffect, useRef } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import BonusModal from '@/components/bonuses/BonusModal';
import BannerDisplay from '@/components/BannerDisplay';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Gift, Sparkles, Bell, Star, Clock, Crown, Award } from 'lucide-react';
import { bonusTranslations } from '@/utils/bonusTranslations';
import { translate } from '@/utils/i18n-fixed';
// Using placeholder images for now - assets will be added later
const bonusHeaderImage = '/placeholder-bonus-header.jpg';
const welcomeBonus = '/placeholder-welcome.jpg';
const reloadBonus = '/placeholder-reload.jpg';
const cashbackBonus = '/placeholder-cashback.jpg';
const freespinBonus = '/placeholder-freespin.jpg';
const loyaltyBonus = '/placeholder-loyalty.jpg';
const birthdayBonus = '/placeholder-birthday.jpg';

// Bonus tipleri
const bonusTypes = [
  { id: 'all', name: { tr: 'Tümü', en: 'All', ka: 'ყველა', ru: 'Все' }, icon: <Gift size={18} /> },
  { id: 'welcome', name: { tr: 'Hoşgeldin', en: 'Welcome', ka: 'მისალმების', ru: 'Приветственный' }, icon: <Trophy size={18} /> },
  { id: 'reload', name: { tr: 'Yeniden Yükleme', en: 'Reload', ka: 'დარელოადების', ru: 'Перезагрузка' }, icon: <Clock size={18} /> },
  { id: 'cashback', name: { tr: 'Nakit İade', en: 'Cashback', ka: 'ქეშბექი', ru: 'Кэшбэк' }, icon: <Award size={18} /> },
  { id: 'freespin', name: { tr: 'Bedava Dönüş', en: 'Free Spin', ka: 'უფასო დატრიალება', ru: 'Бесплатные вращения' }, icon: <Star size={18} /> },
  { id: 'loyalty', name: { tr: 'Sadakat', en: 'Loyalty', ka: 'ლოიალობა', ru: 'Лояльность' }, icon: <Crown size={18} /> },
];

// Bonus verileri
const bonusesData = [
  {
    id: 1,
    type: 'welcome',
    title: {
      tr: 'HOŞGELDİN BONUSU',
      en: 'WELCOME BONUS',
      ka: 'მისალმების ბონუსი',
      ru: 'ПРИВЕТСТВЕННЫЙ БОНУС'
    },
    description: {
      tr: 'İlk para yatırma işleminize %100 bonus!',
      en: '100% bonus on your first deposit!',
      ka: '100% ბონუსი პირველ დეპოზიტზე!',
      ru: '100% бонус на ваш первый депозит!'
    },
    amount: {
      tr: '₺5,000\'e kadar',
      en: 'Up to ₺5,000',
      ka: '₺5,000-მდე',
      ru: 'До ₺5,000'
    },
    image: welcomeBonus,
    rules: {
      tr: [
        'Minimum 100₺ yatırım gerekir',
        '40x çevrim şartı vardır',
        '7 gün içinde çevrilmelidir',
        'Maksimum çekim miktarı 10,000₺',
        'Slot oyunlarında geçerlidir',
        'Bonus bakiyesi ile maksimum bahis 50₺'
      ],
      en: [
        'Minimum deposit of 100₺ required',
        '40x wagering requirement',
        'Must be wagered within 7 days',
        'Maximum withdrawal amount is 10,000₺',
        'Valid on slot games',
        'Maximum bet with bonus balance is 50₺'
      ],
      ka: [
        'საჭიროა მინიმუმ 100₺ დეპოზიტი',
        '40x ფსონის მოთხოვნა',
        'უნდა დაიდოს 7 დღის განმავლობაში',
        'გატანის მაქსიმალური ოდენობა არის 10,000₺',
        'მოქმედებს სლოტ თამაშებზე',
        'მაქსიმალური ფსონი ბონუს ბალანსით არის 50₺'
      ],
      ru: [
        'Требуется минимальный депозит 100₺',
        'Требование по отыгрышу 40x',
        'Должен быть отыгран в течение 7 дней',
        'Максимальная сумма вывода 10,000₺',
        'Действует на слот-игры',
        'Максимальная ставка с бонусным балансом 50₺'
      ]
    },
    isVip: false,
    isHot: true,
    percentage: 100,
    bgGradient: 'from-yellow-500 to-amber-600'
  },
  {
    id: 2,
    type: 'reload',
    title: {
      tr: 'HAFTALIK YÜKLEME',
      en: 'WEEKLY RELOAD',
      ka: 'ყოველკვირეული დარელოადება',
      ru: 'ЕЖЕНЕДЕЛЬНАЯ ПЕРЕЗАГРУЗКА'
    },
    description: {
      tr: 'Her Cuma para yatırmalarınıza %50 bonus!',
      en: '50% bonus on your deposits every Friday!',
      ka: '50% ბონუსი თქვენს დეპოზიტებზე ყოველ პარასკევს!',
      ru: '50% бонус на ваши депозиты каждую пятницу!'
    },
    amount: {
      tr: '₺2,000\'e kadar',
      en: 'Up to ₺2,000',
      ka: '₺2,000-მდე',
      ru: 'До ₺2,000'
    },
    image: reloadBonus,
    rules: {
      tr: [
        'Minimum 200₺ yatırım gerekir',
        '35x çevrim şartı vardır',
        '5 gün içinde çevrilmelidir',
        'Sadece Cuma günleri geçerlidir',
        'Tüm oyunlarda geçerlidir (Canlı Casino hariç)',
        'Haftada bir kez kullanılabilir'
      ],
      en: [
        'Minimum deposit of 200₺ required',
        '35x wagering requirement',
        'Must be wagered within 5 days',
        'Valid only on Fridays',
        'Valid on all games (except Live Casino)',
        'Can be used once per week'
      ],
      ka: [
        'საჭიროა მინიმუმ 200₺ დეპოზიტი',
        '35x ფსონის მოთხოვნა',
        'უნდა დაიდოს 5 დღის განმავლობაში',
        'მოქმედებს მხოლოდ პარასკევს',
        'მოქმედებს ყველა თამაშზე (ლაივ კაზინოს გარდა)',
        'შეიძლება გამოყენებულ იქნას კვირაში ერთხელ'
      ],
      ru: [
        'Требуется минимальный депозит 200₺',
        'Требование по отыгрышу 35x',
        'Должен быть отыгран в течение 5 дней',
        'Действует только по пятницам',
        'Действует на все игры (кроме Live Casino)',
        'Можно использовать один раз в неделю'
      ]
    },
    isVip: false,
    isHot: false,
    percentage: 50,
    bgGradient: 'from-amber-500 to-red-600'
  },
  {
    id: 3,
    type: 'cashback',
    title: {
      tr: 'HAFTALIK NAKİT İADE',
      en: 'WEEKLY CASHBACK',
      ka: 'ყოველკვირეული ქეშბექი',
      ru: 'ЕЖЕНЕДЕЛЬНЫЙ КЭШБЭК'
    },
    description: {
      tr: 'Haftalık kayıplarınızın %15\'i geri ödenir!',
      en: '15% of your weekly losses are refunded!',
      ka: 'თქვენი ყოველკვირეული დანაკარგების 15% ანაზღაურდება!',
      ru: '15% ваших еженедельных потерь возвращаются!'
    },
    amount: {
      tr: '₺10,000\'e kadar',
      en: 'Up to ₺10,000',
      ka: '₺10,000-მდე',
      ru: 'До ₺10,000'
    },
    image: cashbackBonus,
    rules: {
      tr: [
        'Minimum 500₺ kayıp gerekir',
        'Çevrim şartı yoktur',
        'Her Pazartesi hesaplara eklenir',
        'VIP seviyenize göre oran artar (VIP0: %15, VIP1: %20, VIP2: %25, VIP3: %30)',
        'Canlı Casino ve Spor Bahisleri dahildir',
        'Otomatik olarak hesabınıza eklenir'
      ],
      en: [
        'Minimum loss of 500₺ required',
        'No wagering requirement',
        'Added to accounts every Monday',
        'Rate increases according to your VIP level (VIP0: 15%, VIP1: 20%, VIP2: 25%, VIP3: 30%)',
        'Live Casino and Sports Betting included',
        'Automatically added to your account'
      ],
      ka: [
        'საჭიროა მინიმუმ 500₺ ზარალი',
        'ფსონის მოთხოვნა არ არის',
        'ყოველ ორშაბათს ემატება ანგარიშებს',
        'განაკვეთი იზრდება თქვენი VIP დონის მიხედვით (VIP0: 15%, VIP1: 20%, VIP2: 25%, VIP3: 30%)',
        'ლაივ კაზინო და სპორტული ფსონები ჩათვლით',
        'ავტომატურად ემატება თქვენს ანგარიშს'
      ],
      ru: [
        'Требуется минимальный убыток в 500₺',
        'Нет требования по отыгрышу',
        'Добавляется на счета каждый понедельник',
        'Ставка увеличивается в зависимости от вашего уровня VIP (VIP0: 15%, VIP1: 20%, VIP2: 25%, VIP3: 30%)',
        'Включены Live Casino и спортивные ставки',
        'Автоматически добавляется на ваш счет'
      ]
    },
    isVip: false,
    isHot: true,
    percentage: 15,
    bgGradient: 'from-emerald-500 to-teal-600'
  },
  {
    id: 4,
    type: 'freespin',
    title: {
      tr: 'SWEET BONANZA BEDAVA DÖNÜŞ',
      en: 'SWEET BONANZA FREE SPINS',
      ka: 'SWEET BONANZA უფასო დატრიალება',
      ru: 'БЕСПЛАТНЫЕ ВРАЩЕНИЯ SWEET BONANZA'
    },
    description: {
      tr: 'Sweet Bonanza\'da 100 bedava dönüş!',
      en: '100 free spins on Sweet Bonanza!',
      ka: '100 უფასო დატრიალება Sweet Bonanza-ზე!',
      ru: '100 бесплатных вращений в Sweet Bonanza!'
    },
    amount: {
      tr: '100 Dönüş',
      en: '100 Spins',
      ka: '100 დატრიალება',
      ru: '100 Вращений'
    },
    image: freespinBonus,
    rules: {
      tr: [
        'Minimum 300₺ yatırım gerekir',
        'Sadece Sweet Bonanza oyununda geçerlidir',
        'Her dönüş 1₺ değerindedir',
        'Kazançlarda 25x çevrim şartı vardır',
        '3 gün içinde kullanılmalıdır',
        'Hafta içi her gün alınabilir'
      ],
      en: [
        'Minimum deposit of 300₺ required',
        'Valid only on Sweet Bonanza game',
        'Each spin is worth 1₺',
        '25x wagering requirement on winnings',
        'Must be used within 3 days',
        'Can be claimed every weekday'
      ],
      ka: [
        'საჭიროა მინიმუმ 300₺ დეპოზიტი',
        'მოქმედებს მხოლოდ Sweet Bonanza თამაშზე',
        'თითოეული დატრიალება ღირს 1₺',
        '25x ფსონის მოთხოვნა მოგებებზე',
        'უნდა გამოიყენოთ 3 დღის განმავლობაში',
        'შეიძლება მოითხოვოთ ყოველ სამუშაო დღეს'
      ],
      ru: [
        'Требуется минимальный депозит 300₺',
        'Действует только на игру Sweet Bonanza',
        'Каждое вращение стоит 1₺',
        'Требование по отыгрышу 25x на выигрыши',
        'Должно быть использовано в течение 3 дней',
        'Можно получить каждый будний день'
      ]
    },
    isVip: false,
    isHot: false,
    percentage: null,
    bgGradient: 'from-pink-500 to-purple-600'
  },
  {
    id: 5,
    type: 'loyalty',
    title: {
      tr: 'VIP SADAKAT BONUSU',
      en: 'VIP LOYALTY BONUS',
      ka: 'VIP ლოიალობის ბონუსი',
      ru: 'VIP БОНУС ЛОЯЛЬНОСТИ'
    },
    description: {
      tr: 'VIP üyelerine özel aylık bonus!',
      en: 'Monthly bonus exclusive to VIP members!',
      ka: 'ყოველთვიური ბონუსი მხოლოდ VIP წევრებისთვის!',
      ru: 'Ежемесячный бонус только для VIP-участников!'
    },
    amount: {
      tr: '₺25,000\'e kadar',
      en: 'Up to ₺25,000',
      ka: '₺25,000-მდე',
      ru: 'До ₺25,000'
    },
    image: loyaltyBonus,
    rules: {
      tr: [
        'Sadece VIP 1 (Gümüş) ve üzeri üyeleri için geçerlidir',
        'Aylık yatırımların %10\'u kadar bonus',
        '30x çevrim şartı vardır',
        'Her ayın ilk günü hesaba eklenir',
        'Tüm oyunlarda geçerlidir',
        'VIP seviyenize göre oran artar (VIP1: %10, VIP2: %15, VIP3: %20, VIP4: %25, VIP5: %30)'
      ],
      en: [
        'Valid only for VIP 1 (Silver) and above members',
        'Bonus equal to 10% of monthly deposits',
        '30x wagering requirement',
        'Added to account on the first day of each month',
        'Valid on all games',
        'Rate increases according to your VIP level (VIP1: 10%, VIP2: 15%, VIP3: 20%, VIP4: 25%, VIP5: 30%)'
      ],
      ka: [
        'მოქმედებს მხოლოდ VIP 1 (Silver) და ზემოთ წევრებისთვის',
        'ბონუსი ყოველთვიური დეპოზიტების 10%-ის ტოლია',
        '30x ფსონის მოთხოვნა',
        'ემატება ანგარიშს ყოველი თვის პირველ დღეს',
        'მოქმედებს ყველა თამაშზე',
        'განაკვეთი იზრდება თქვენი VIP დონის მიხედვით (VIP1: 10%, VIP2: 15%, VIP3: 20%, VIP4: 25%, VIP5: 30%)'
      ],
      ru: [
        'Действует только для VIP 1 (Silver) и выше участников',
        'Бонус, равный 10% от ежемесячных депозитов',
        'Требование по отыгрышу 30x',
        'Добавляется на счет в первый день каждого месяца',
        'Действует на все игры',
        'Ставка увеличивается в зависимости от вашего уровня VIP (VIP1: 10%, VIP2: 15%, VIP3: 20%, VIP4: 25%, VIP5: 30%)'
      ]
    },
    isVip: true,
    isHot: false,
    percentage: 10,
    bgGradient: 'from-indigo-500 to-blue-600'
  },
  {
    id: 6,
    type: 'welcome',
    title: {
      tr: 'SPORTİF HOŞGELDİN BONUSU',
      en: 'SPORTS WELCOME BONUS',
      ka: 'სპორტული მისალმების ბონუსი',
      ru: 'ПРИВЕТСТВЕННЫЙ СПОРТИВНЫЙ БОНУС'
    },
    description: {
      tr: 'İlk spor bahislerinize %100 bonus!',
      en: '100% bonus on your first sports bets!',
      ka: '100% ბონუსი თქვენს პირველ სპორტულ ფსონებზე!',
      ru: '100% бонус на ваши первые спортивные ставки!'
    },
    amount: {
      tr: '₺1,000\'e kadar',
      en: 'Up to ₺1,000',
      ka: '₺1,000-მდე',
      ru: 'До ₺1,000'
    },
    image: birthdayBonus,
    rules: {
      tr: [
        'Minimum 100₺ yatırım gerekir',
        '20x çevrim şartı vardır',
        '15 gün içinde çevrilmelidir',
        'Minimum 1.80 oranlı bahisler geçerlidir',
        'Sadece spor bahislerinde geçerlidir',
        'Casino bonusu ile birleştirilemez'
      ],
      en: [
        'Minimum deposit of 100₺ required',
        '20x wagering requirement',
        'Must be wagered within 15 days',
        'Minimum odds of 1.80 required',
        'Valid only on sports betting',
        'Cannot be combined with casino bonus'
      ],
      ka: [
        'საჭიროა მინიმუმ 100₺ დეპოზიტი',
        '20x ფსონის მოთხოვნა',
        'უნდა დაიდოს 15 დღის განმავლობაში',
        'საჭიროა მინიმუმ 1.80 კოეფიციენტი',
        'მოქმედებს მხოლოდ სპორტულ ფსონებზე',
        'არ შეიძლება კაზინოს ბონუსთან კომბინირება'
      ],
      ru: [
        'Требуется минимальный депозит 100₺',
        'Требование по отыгрышу 20x',
        'Должен быть отыгран в течение 15 дней',
        'Требуются минимальные коэффициенты 1.80',
        'Действует только на спортивные ставки',
        'Нельзя комбинировать с бонусом казино'
      ]
    },
    isVip: false,
    isHot: true,
    percentage: 100,
    bgGradient: 'from-green-500 to-lime-600'
  },
  {
    id: 7,
    type: 'freespin',
    title: {
      tr: 'DOĞUM GÜNÜ BONUSU',
      en: 'BIRTHDAY BONUS',
      ka: 'დაბადების დღის ბონუსი',
      ru: 'БОНУС НА ДЕНЬ РОЖДЕНИЯ'
    },
    description: {
      tr: 'Doğum gününüzde 200 bedava dönüş!',
      en: '200 free spins on your birthday!',
      ka: '200 უფასო დატრიალება თქვენს დაბადების დღეზე!',
      ru: '200 бесплатных вращений в ваш день рождения!'
    },
    amount: {
      tr: '200 Dönüş',
      en: '200 Spins',
      ka: '200 დატრიალება',
      ru: '200 Вращений'
    },
    image: '/bonus-birthday.jpg',
    rules: {
      tr: [
        'Hesap açılışından en az 3 ay sonra geçerlidir',
        'Doğum günü tarihini doğrulamak için kimlik gereklidir',
        'Son 30 günde en az bir yatırım yapılmış olmalıdır',
        'Dönüşler istediğiniz slotta kullanılabilir',
        'Kazançlarda 20x çevrim şartı vardır',
        'Doğum gününden 3 gün önce ve 3 gün sonra talep edilebilir'
      ],
      en: [
        'Valid at least 3 months after account opening',
        'ID required to verify date of birth',
        'At least one deposit must have been made in the last 30 days',
        'Spins can be used on any slot of your choice',
        '20x wagering requirement on winnings',
        'Can be claimed 3 days before and 3 days after your birthday'
      ],
      ka: [
        'მოქმედებს ანგარიშის გახსნიდან მინიმუმ 3 თვის შემდეგ',
        'საჭიროა პირადობის მოწმობა დაბადების თარიღის დასადასტურებლად',
        'ბოლო 30 დღის განმავლობაში უნდა განხორციელებული იყოს მინიმუმ ერთი დეპოზიტი',
        'ტრიალები შეიძლება გამოიყენოთ ნებისმიერ სასურველ სლოტზე',
        '20x ფსონის მოთხოვნა მოგებებზე',
        'შეიძლება მოითხოვოთ დაბადების დღემდე 3 დღით ადრე და დაბადების დღის შემდეგ 3 დღის განმავლობაში'
      ],
      ru: [
        'Действует не менее 3 месяцев после открытия счета',
        'Требуется удостоверение личности для подтверждения даты рождения',
        'За последние 30 дней должен быть сделан хотя бы один депозит',
        'Вращения можно использовать на любом слоте по вашему выбору',
        'Требование по отыгрышу 20x на выигрыши',
        'Можно запросить за 3 дня до и в течение 3 дней после вашего дня рождения'
      ]
    },
    isVip: false,
    isHot: false,
    percentage: null,
    bgGradient: 'from-yellow-400 to-orange-600'
  },
  {
    id: 8,
    type: 'reload',
    title: {
      tr: 'HAFTA SONU YÜKLEME',
      en: 'WEEKEND RELOAD',
      ka: 'შაბათ-კვირის დარელოადება',
      ru: 'ПЕРЕЗАГРУЗКА НА ВЫХОДНЫХ'
    },
    description: {
      tr: 'Hafta sonu yatırımlarınızda %75 bonus!',
      en: '75% bonus on your weekend deposits!',
      ka: '75% ბონუსი თქვენს შაბათ-კვირის დეპოზიტებზე!',
      ru: '75% бонус на ваши депозиты в выходные!'
    },
    amount: {
      tr: '₺3,000\'e kadar',
      en: 'Up to ₺3,000',
      ka: '₺3,000-მდე',
      ru: 'До ₺3,000'
    },
    image: '/bonus-weekend.jpg',
    rules: {
      tr: [
        'Minimum 250₺ yatırım gerekir',
        '30x çevrim şartı vardır',
        '7 gün içinde çevrilmelidir',
        'Sadece Cumartesi ve Pazar günleri geçerlidir',
        'Tüm oyunlarda geçerlidir',
        'Her hafta sonu bir kez alınabilir'
      ],
      en: [
        'Minimum deposit of 250₺ required',
        '30x wagering requirement',
        'Must be wagered within 7 days',
        'Valid only on Saturday and Sunday',
        'Valid on all games',
        'Can be claimed once every weekend'
      ],
      ka: [
        'საჭიროა მინიმუმ 250₺ დეპოზიტი',
        '30x ფსონის მოთხოვნა',
        'უნდა დაიდოს 7 დღის განმავლობაში',
        'მოქმედებს მხოლოდ შაბათს და კვირას',
        'მოქმედებს ყველა თამაშზე',
        'შეიძლება მოითხოვოთ კვირაში ერთხელ'
      ],
      ru: [
        'Требуется минимальный депозит 250₺',
        'Требование по отыгрышу 30x',
        'Должен быть отыгран в течение 7 дней',
        'Действует только в субботу и воскресенье',
        'Действует на все игры',
        'Можно запросить один раз каждые выходные'
      ]
    },
    isVip: false,
    isHot: false,
    percentage: 75,
    bgGradient: 'from-blue-500 to-cyan-600'
  }
];

// Ikon animasyonu için konfigürasyon
const iconAnimationVariants = {
  initial: { scale: 0.8, opacity: 0.5 },
  animate: { scale: 1, opacity: 1 },
  hover: { scale: 1.2, rotate: [0, 5, -5, 0] }
};

// Bonuses sayfası bileşeni

const BonusesPage: React.FC = () => {
  const { language } = useLanguage();
  const [selectedType, setSelectedType] = useState('all');
  const [filteredBonuses, setFilteredBonuses] = useState(bonusesData);
  const [selectedBonus, setSelectedBonus] = useState<typeof bonusesData[0] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showAllTypes, setShowAllTypes] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Bonus türüne ve arama sorgusuna göre filtreleme
  useEffect(() => {
    let filtered = bonusesData;
    
    // Tür filtreleme
    if (selectedType !== 'all') {
      filtered = filtered.filter(bonus => bonus.type === selectedType);
    }
    
    // Arama sorgusu filtreleme
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(bonus => {
        const title = bonus.title[language as keyof typeof bonus.title].toLowerCase();
        const description = bonus.description[language as keyof typeof bonus.description].toLowerCase();
        return title.includes(query) || description.includes(query);
      });
    }
    
    setFilteredBonuses(filtered);
  }, [selectedType, searchQuery, language]);

  // Bonus detayını gösterme
  const handleBonusClick = (bonus: typeof bonusesData[0]) => {
    setSelectedBonus(bonus);
    setIsModalOpen(true);
  };

  // Tür seçildiğinde scroll pozisyonunu ayarla
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [selectedType]);

  const handleSearchFocus = (focused: boolean) => {
    setIsSearching(focused);
  };

  // Görünen tür sayısını kontrol etme
  const visibleTypes = showAllTypes ? bonusTypes : bonusTypes.slice(0, window.innerWidth < 768 ? 3 : 6);

  return (
    <MainLayout>
      {/* Header Banner */}
      <BannerDisplay type="header" pageLocation="bonuses" className="mb-6" />
      
      {/* Slider Banner */}
      <div className="w-full mb-8">
        <BannerDisplay type="slider" pageLocation="bonuses" className="mb-6" />
      </div>
      
      {/* Hero Section */}
      <section className="relative w-full h-[40vh] md:h-[50vh] lg:h-[60vh] overflow-hidden">
        {/* Background Image with Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/70 to-[#121212]">
          <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
               style={{ backgroundImage: `url(${bonusHeaderImage})`, backgroundBlendMode: 'multiply' }}>
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="container mx-auto px-4 relative h-full flex flex-col justify-center items-start z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-yellow-500 rounded-full mr-4 shadow-lg shadow-yellow-500/30">
                <Gift size={30} className="text-black" />
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white">
                {translate('bonuses.title', 'BONUSLAR')}
              </h1>
            </div>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl"
            >
              {translate('bonuses.description', 'En yüksek bonusları ve en avantajlı fırsatları keşfedin.')}
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="flex flex-wrap gap-4"
            >
              <button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 transform hover:translate-y-[-2px] flex items-center">
                <Gift className="mr-2" size={20} />
                {translate('bonuses.claim_now', 'Hemen Al')}
              </button>
              <button className="bg-transparent border-2 border-yellow-500/50 text-yellow-500 hover:bg-yellow-500/10 font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:translate-y-[-2px] flex items-center">
                <Trophy className="mr-2" size={20} />
                {translate('bonuses.vip_bonuses', 'VIP Bonusları')}
              </button>
            </motion.div>
          </motion.div>
          
          {/* Scroll down indicator */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6, repeat: Infinity, repeatType: "reverse" }}
            className="absolute bottom-8 left-0 right-0 flex justify-center"
          >
            <div className="w-8 h-14 border-2 border-white/30 rounded-full flex justify-center p-2">
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="w-1.5 h-3 bg-white/80 rounded-full"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Header Banner */}
      <BannerDisplay type="header" pageLocation="bonuses" className="mb-4" />

      <div className="min-h-screen bg-[#121212] text-white py-12 relative" ref={scrollRef}>
        {/* Arka Plan Deseni */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMTIgMTJjMy4zMTQgMCA2LTIuNjg2IDYtNnMtMi42ODYtNi02LTZjLTMuMzE0IDAtNiAyLjY4Ni02IDZzMi42ODYgNiA2IDZ6bTEyIDEyYzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02Yy0zLjMxNCAwLTYgMi42ODYtNiA2czIuNjg2IDYgNiA2ek0xMiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMCAxMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMCAxMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnpNMCA0OGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiIGZpbGw9IiNGRkZGRkYiIGZpbGwtb3BhY2l0eT0iLjAyIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="container mx-auto px-4">
          {/* İstatistik bölümü kaldırıldı */}

          {/* Arama alanı */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="relative z-10 max-w-2xl mx-auto mb-10"
          >
            <div className={`bg-[#1A1A1A] p-2 rounded-2xl border-2 ${isSearching ? 'border-yellow-500' : 'border-[#333]'} transition-all duration-300 shadow-xl`}>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => handleSearchFocus(true)}
                  onBlur={() => handleSearchFocus(false)}
                  placeholder={translate('bonuses.search_placeholder', 'Bonus ara...')}
                  className="w-full pl-12 pr-4 py-3 bg-transparent border-none focus:outline-none text-white placeholder:text-gray-500"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <motion.div
                    animate={{ scale: isSearching ? 1.1 : 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 ${isSearching ? 'text-yellow-500' : 'text-gray-500'} transition-colors duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bonus Türleri Sekmeler */}
          <div className="relative z-10 mb-10">
            <motion.div 
              className="flex justify-center items-center mb-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="flex items-center justify-center">
                <div className="h-[1px] w-12 bg-yellow-500/50"></div>
                <h3 className="mx-3 text-xl font-bold text-white">
                  {translate('bonuses.filter_by_type', 'Türe Göre Filtrele')}
                </h3>
                <div className="h-[1px] w-12 bg-yellow-500/50"></div>
              </div>
            </motion.div>

            <motion.div 
              className="flex overflow-x-auto md:grid md:grid-cols-6 gap-3 relative pb-2 hide-scrollbar md:pb-0"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              {visibleTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`relative group overflow-hidden rounded-xl py-3 sm:py-4 px-3 sm:px-5 transition-all duration-300 flex flex-col items-center justify-center min-h-[80px] sm:min-h-[100px] whitespace-nowrap
                    ${selectedType === type.id
                      ? 'bg-gradient-to-b from-yellow-400 to-yellow-600 text-black'
                      : 'bg-gradient-to-b from-[#1A1A1A] to-[#242424] text-gray-300 hover:bg-[#252525] border border-[#333] hover:border-yellow-500/50'
                    }`}
                >
                  {/* Background pattern for selected item */}
                  {selectedType === type.id && (
                    <motion.div 
                      className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMTIgMTJjMy4zMTQgMCA2LTIuNjg2IDYtNnMtMi42ODYtNi02LTZjLTMuMzE0IDAtNiAyLjY4Ni02IDZzMi42ODYgNiA2IDZ6bTEyIDEyYzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02Yy0zLjMxNCAwLTYgMi42ODYtNiA2czIuNjg2IDYgNiA2ek0xMiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMCAxMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMCAxMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnpNMCA0OGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] bg-repeat opacity-30"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.3 }}
                      transition={{ duration: 0.5 }}
                    />
                  )}
                
                  {/* Icon */}
                  <motion.div
                    className={`text-2xl sm:text-3xl mb-1 sm:mb-2 ${selectedType === type.id ? 'text-[#121212]' : 'text-yellow-500'}`}
                    initial="initial"
                    animate="animate"
                    whileHover="hover"
                    variants={iconAnimationVariants}
                  >
                    {type.icon}
                  </motion.div>
                  
                  {/* Title */}
                  <span className="font-semibold text-center text-xs sm:text-sm">
                    {type.name[language as keyof typeof type.name]}
                  </span>
                  
                  {/* Indicator for selected item */}
                  {selectedType === type.id && (
                    <motion.div 
                      className="absolute -bottom-1 left-0 h-1 bg-black w-full"
                      initial={{ width: 0 }}
                      animate={{ width: '100%' }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                  
                  {/* Highlight effect on hover */}
                  <div className="absolute inset-0 bg-yellow-500/0 group-hover:bg-yellow-500/10 transition-colors duration-300"></div>
                </button>
              ))}
            </motion.div>
            
            {/* Tüm türleri göster/gizle butonu */}
            {bonusTypes.length > (window.innerWidth < 768 ? 3 : 6) && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-4 text-center"
              >
                <button 
                  onClick={() => setShowAllTypes(!showAllTypes)}
                  className="text-yellow-500 hover:text-yellow-400 text-sm font-medium flex items-center justify-center mx-auto"
                >
                  {showAllTypes ? translate('bonuses.show_less', 'Daha Az Göster') : translate('bonuses.show_more', 'Daha Fazla Göster')}
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 ml-1 transition-transform duration-300 ${showAllTypes ? 'rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </motion.div>
            )}
          </div>
          
          {/* Seçim Sonuçları & Bonuslar */}
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 px-2 md:px-0">
              <motion.h3 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
                className="text-xl md:text-3xl font-bold text-white mb-3 md:mb-0"
              >
                {selectedType === 'all' 
                  ? translate('bonuses.all_bonuses', 'Tüm Bonuslar') 
                  : `${bonusTypes.find(type => type.id === selectedType)?.name[language as keyof { tr: string, en: string, ka: string, ru: string }]} ${translate('bonuses.bonuses', 'Bonusları')}`}
                <span className="ml-2 py-1 px-3 bg-[#2A2A2A] text-yellow-500 text-sm rounded-full">
                  {filteredBonuses.length}
                </span>
              </motion.h3>
              
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6 }}
              >
                <select 
                  className="bg-[#1A1A1A] text-white border border-[#333] rounded-lg py-2 px-4 focus:outline-none focus:border-yellow-500 w-full md:w-auto"
                  onChange={(e) => console.log(e.target.value)}
                >
                  <option value="newest">{translate('bonuses.sort.newest', 'En Yeniler')}</option>
                  <option value="amount">{translate('bonuses.sort.amount', 'Bonus Miktarı')}</option>
                  <option value="popularity">{translate('bonuses.sort.popularity', 'Popülerlik')}</option>
                </select>
              </motion.div>
            </div>
            
            {/* Bonuslar Listesi */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 px-2 md:px-0">
              <AnimatePresence>
                {filteredBonuses.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="col-span-full flex flex-col items-center justify-center py-16 text-center"
                  >
                    <div className="w-20 h-20 mb-6 text-yellow-600 opacity-50">
                      <Bell size={80} />
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{translate('bonuses.no_results', 'Sonuç Bulunamadı')}</h3>
                    <p className="text-gray-400 max-w-md">{translate('bonuses.try_different', 'Farklı filtre seçenekleri deneyin veya tüm bonusları görüntüleyin')}</p>
                  </motion.div>
                ) : (
                  filteredBonuses.map((bonus, index) => (
                    <motion.div
                      key={bonus.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="group"
                      whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                      <div 
                        className="rounded-2xl h-full overflow-hidden bg-gradient-to-b from-[#1A1A1A] to-[#242424] border border-[#333] group-hover:border-yellow-500/50 transition-all duration-300 shadow-xl group-hover:shadow-yellow-500/10"
                        onClick={() => handleBonusClick(bonus)}
                      >
                        {/* Header */}
                        <div className={`p-4 bg-gradient-to-r ${bonus.bgGradient} relative h-32 overflow-hidden`}>
                          {/* Bonus Görseli */}
                          {bonus.image && (
                            <div 
                              className="absolute inset-0 bg-cover bg-center z-0"
                              style={{ 
                                backgroundImage: `url(${bonus.image})`,
                                opacity: 0.4,
                                filter: 'brightness(0.5) contrast(1.2)'
                              }}
                            />
                          )}
                          
                          {/* Pattern Overlay */}
                          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMTIgMTJjMy4zMTQgMCA2LTIuNjg2IDYtNnMtMi42ODYtNi02LTZjLTMuMzE0IDAtNiAyLjY4Ni02IDZzMi42ODYgNiA2IDZ6bTEyIDEyYzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02Yy0zLjMxNCAwLTYgMi42ODYtNiA2czIuNjg2IDYgNiA2ek0xMiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMCAxMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMCAxMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnpNMCA0OGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
                          
                          {/* Badges */}
                          <div className="absolute top-3 right-3 flex space-x-2 z-10">
                            {bonus.isHot && (
                              <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center shadow-lg shadow-red-500/30">
                                <motion.div
                                  animate={{ scale: [1, 1.2, 1] }}
                                  transition={{ duration: 1.5, repeat: Infinity }}
                                  className="mr-1"
                                >🔥</motion.div>
                                HOT
                              </div>
                            )}
                            {bonus.isVip && (
                              <div className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center shadow-lg shadow-purple-500/30">
                                <motion.div
                                  animate={{ rotate: [0, 10, -10, 0] }}
                                  transition={{ duration: 2, repeat: Infinity }}
                                  className="mr-1"
                                >👑</motion.div>
                                VIP
                              </div>
                            )}
                          </div>
                          
                          {/* Title and subtitle */}
                          <div className="relative z-10">
                            <h3 className="font-bold text-lg text-white relative z-10 drop-shadow-md">
                              {bonus.title[language as keyof typeof bonus.title]}
                            </h3>
                            <p className="text-white/90 text-sm mt-1 relative z-10 line-clamp-2">
                              {bonus.description[language as keyof typeof bonus.description]}
                            </p>
                          </div>
                          
                        </div>
                        
                        {/* Content */}
                        <div className="p-4 pt-6">
                          {/* Rules glimpse */}
                          <div className="space-y-2 mb-4">
                            {bonus.rules[language as keyof typeof bonus.rules].slice(0, 3).map((rule, i) => (
                              <div key={i} className="flex items-start text-sm">
                                <div className="text-yellow-500 mr-2 shrink-0 mt-0.5">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                                <div className="text-gray-400 group-hover:text-gray-300 transition-colors duration-300 line-clamp-1">{rule}</div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Action button */}
                          <button 
                            className="w-full py-3 mt-2 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold rounded-lg flex items-center justify-center transition-all duration-300 shadow-lg group-hover:shadow-yellow-500/30"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleBonusClick(bonus);
                            }}
                          >
                            <Gift className="mr-2" size={18} />
                            {translate('bonuses.view_details', 'Detayları Gör')}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-16 relative z-10">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-10"
            >
              <div className="inline-block bg-yellow-500/20 text-yellow-500 text-sm font-semibold px-4 py-1.5 rounded-full mb-3">
                {translate('bonuses.faq.subtitle', 'SIKÇA SORULAN SORULAR')}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{translate('bonuses.faq.title', 'Bonus Kuralları Hakkında Merak Edilenler')}</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">{translate('bonuses.faq.description', 'Bonuslar hakkında en çok sorulan sorulara yanıtlarımızı bulun ve bonuslarınızı en verimli şekilde kullanın.')}</p>
            </motion.div>
            
            <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* FAQ Item 1 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="bg-gradient-to-b from-[#1A1A1A] to-[#242424] rounded-2xl p-6 border border-[#333] hover:border-yellow-500/50 transition-all duration-300 shadow-xl hover:shadow-yellow-500/10"
              >
                <h3 className="text-xl font-bold text-white mb-3 flex items-start">
                  <div className="w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center mr-3 shrink-0">1</div>
                  {translate('bonuses.faq.q1', 'Çevrim şartı nedir?')}
                </h3>
                <p className="text-gray-400 pl-11">{translate('bonuses.faq.a1', 'Çevrim şartı, bir bonusu çekebilmeniz için bonusu kaç kez oynamanız gerektiğini belirtir. Örneğin, 40x çevrim şartı olan 100₺ bonusu çekebilmek için 4,000₺\'lik bahis yapmanız gerekir.')}</p>
              </motion.div>
              
              {/* FAQ Item 2 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="bg-gradient-to-b from-[#1A1A1A] to-[#242424] rounded-2xl p-6 border border-[#333] hover:border-yellow-500/50 transition-all duration-300 shadow-xl hover:shadow-yellow-500/10"
              >
                <h3 className="text-xl font-bold text-white mb-3 flex items-start">
                  <div className="w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center mr-3 shrink-0">2</div>
                  {translate('bonuses.faq.q2', 'Bonusları nasıl talep edebilirim?')}
                </h3>
                <p className="text-gray-400 pl-11">{translate('bonuses.faq.a2', 'Bonusları talep etmek için hesabınıza giriş yapın, Bonuslar sayfasına gidin ve talep etmek istediğiniz bonusu seçin. Bazı bonuslar otomatik olarak hesabınıza eklenir.')}</p>
              </motion.div>
              
              {/* FAQ Item 3 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
                className="bg-gradient-to-b from-[#1A1A1A] to-[#242424] rounded-2xl p-6 border border-[#333] hover:border-yellow-500/50 transition-all duration-300 shadow-xl hover:shadow-yellow-500/10"
              >
                <h3 className="text-xl font-bold text-white mb-3 flex items-start">
                  <div className="w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center mr-3 shrink-0">3</div>
                  {translate('bonuses.faq.q3', 'Bonus süresi ne kadar?')}
                </h3>
                <p className="text-gray-400 pl-11">{translate('bonuses.faq.a3', 'Bonus süreleri bonusun türüne göre değişir. Çoğu bonus 7-30 gün arasında geçerlidir. Detaylı bilgi için bonus kurallarını inceleyebilirsiniz.')}</p>
              </motion.div>
              
              {/* FAQ Item 4 */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
                className="bg-gradient-to-b from-[#1A1A1A] to-[#242424] rounded-2xl p-6 border border-[#333] hover:border-yellow-500/50 transition-all duration-300 shadow-xl hover:shadow-yellow-500/10"
              >
                <h3 className="text-xl font-bold text-white mb-3 flex items-start">
                  <div className="w-8 h-8 bg-yellow-500 text-black rounded-full flex items-center justify-center mr-3 shrink-0">4</div>
                  {translate('bonuses.faq.q4', 'Hangi oyunlarda bonus kullanabilirim?')}
                </h3>
                <p className="text-gray-400 pl-11">{translate('bonuses.faq.a4', 'Bonuslar genellikle slot oyunlarında kullanılabilir. Bazı bonuslar tüm oyunlarda geçerli olabilir. Her bonusun oyun kısıtlamaları bonus detaylarında belirtilmiştir.')}</p>
              </motion.div>
            </div>
          </div>
          
          {/* CTA Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-16 relative z-10 overflow-hidden bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-3xl p-8 md:p-10 shadow-xl shadow-yellow-500/20"
          >
            {/* Pattern Overlay */}
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMTIgMTJjMy4zMTQgMCA2LTIuNjg2IDYtNnMtMi42ODYtNi02LTZjLTMuMzE0IDAtNiAyLjY4Ni02IDZzMi42ODYgNiA2IDZ6bTEyIDEyYzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02Yy0zLjMxNCAwLTYgMi42ODYtNiA2czIuNjg2IDYgNiA2ek0xMiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMCAxMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMCAxMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnpNMCA0OGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiIGZpbGw9IiMwMDAwMDAiIGZpbGwtb3BhY2l0eT0iLjEiLz48L2c+PC9zdmc+')] opacity-30"></div>
            
            <div className="grid md:grid-cols-2 gap-6 items-center relative z-10">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">
                  {translate('bonuses.cta.title', 'Hemen Bonus Al!')}
                </h2>
                <p className="text-yellow-900 text-lg mb-8">
                  {translate('bonuses.cta.description', 'En yüksek bonusları kaçırmayın ve kazancınızı artırın!')}
                </p>
                <div className="flex flex-wrap gap-4">
                  <button className="bg-black hover:bg-gray-900 text-white font-bold py-3 px-8 rounded-lg shadow-lg hover:shadow-black/30 transition-all duration-300 transform hover:translate-y-[-2px]">
                    {translate('bonuses.cta.action', 'Bonusları İncele')}
                  </button>
                  <button className="bg-transparent border-2 border-black/50 text-black hover:bg-black/10 font-bold py-3 px-8 rounded-lg shadow-lg transition-all duration-300 transform hover:translate-y-[-2px]">
                    {translate('bonuses.cta.secondary', 'Kuralları Oku')}
                  </button>
                </div>
              </div>
              <div className="flex justify-center md:justify-end">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                  className="relative w-48 h-48 md:w-64 md:h-64"
                >
                  <div className="absolute inset-0 rounded-full border-8 border-dashed border-black/20 animate-spin-slow"></div>
                  <div className="absolute inset-4 rounded-full border-8 border-dashed border-black/10 animate-spin-slow-reverse"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-white rounded-full w-24 h-24 md:w-32 md:h-32 flex items-center justify-center shadow-xl">
                      <Gift className="w-12 h-12 md:w-16 md:h-16 text-yellow-500" />
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal */}
      {selectedBonus && (
        <BonusModal
          bonus={selectedBonus}
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </MainLayout>
  );
};

export default BonusesPage;