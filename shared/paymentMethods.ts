// Ödeme yöntemleri sabitleri
export const PAYMENT_METHODS = {
  BANK_TRANSFER: 'bank_transfer',
  PAPARA: 'papara',
  CREDIT_CARD: 'credit_card',
  CRYPTO: 'crypto',
  QR_CODE: 'qr_code',
  OTHER: 'other'
};

// Ödeme yöntemi metadata'sı
export const paymentMethodsMetadata = {
  [PAYMENT_METHODS.BANK_TRANSFER]: {
    id: PAYMENT_METHODS.BANK_TRANSFER,
    name: 'Banka Havalesi / EFT',
    icon: 'Building',
    description: 'Banka hesabınızdan para yatırın',
    minAmount: 100,
    maxAmount: 50000,
    formFields: ['accountOwner', 'bankName', 'accountNumber', 'reference', 'receipt'],
    requiresReceipt: true,
    requiresAccountInfo: false,
    color: 'green',
    hint: 'Banka dekontunuzu mutlaka yükleyin. İşlemleriniz 30 dakika içinde tamamlanacaktır.',
    banks: [
      { id: 'ziraat', name: 'Ziraat Bankası', icon: 'bank-ziraat' },
      { id: 'garanti', name: 'Garanti Bankası', icon: 'bank-garanti' },
      { id: 'isbank', name: 'İş Bankası', icon: 'bank-isbank' },
      { id: 'akbank', name: 'Akbank', icon: 'bank-akbank' },
      { id: 'yapikredi', name: 'Yapı Kredi', icon: 'bank-yapikredi' },
      { id: 'vakifbank', name: 'Vakıfbank', icon: 'bank-vakifbank' },
      { id: 'halkbank', name: 'Halkbank', icon: 'bank-halkbank' },
      { id: 'denizbank', name: 'Denizbank', icon: 'bank-denizbank' },
      { id: 'qnb', name: 'QNB Finansbank', icon: 'bank-qnb' },
      { id: 'enpara', name: 'Enpara', icon: 'bank-enpara' }
    ]
  },
  [PAYMENT_METHODS.PAPARA]: {
    id: PAYMENT_METHODS.PAPARA,
    name: 'Papara',
    icon: 'CreditCard',
    description: 'Papara hesabınızdan hızlı para yatırma',
    minAmount: 50,
    maxAmount: 20000,
    formFields: ['paparaNumber', 'receipt'],
    requiresReceipt: true,
    requiresAccountInfo: false,
    color: 'purple',
    hint: 'Papara işlemleri 15 dakika içinde tamamlanır.',
  },
  [PAYMENT_METHODS.CREDIT_CARD]: {
    id: PAYMENT_METHODS.CREDIT_CARD,
    name: 'Kredi Kartı',
    icon: 'CreditCard',
    description: 'Kredi kartınızla güvenli ödeme yapın',
    minAmount: 100,
    maxAmount: 10000,
    formFields: ['cardNumber', 'cardHolder', 'expiry', 'cvc'],
    requiresReceipt: false,
    requiresAccountInfo: false,
    color: 'blue',
    hint: 'Kredi kartı ödemeleri anında gerçekleşir.',
  },
  [PAYMENT_METHODS.CRYPTO]: {
    id: PAYMENT_METHODS.CRYPTO,
    name: 'Kripto Para',
    icon: 'Bitcoin',
    description: 'Bitcoin, Ethereum ve diğer kripto paralarla ödeme',
    minAmount: 50,
    maxAmount: 100000,
    formFields: ['cryptoType', 'transactionId', 'receipt'],
    requiresReceipt: true,
    requiresAccountInfo: false,
    color: 'yellow',
    hint: 'Kripto para işlemleri 30 dakika içinde tamamlanır.',
    cryptoTypes: [
      { id: 'btc', name: 'Bitcoin (BTC)', icon: 'crypto-btc' },
      { id: 'eth', name: 'Ethereum (ETH)', icon: 'crypto-eth' },
      { id: 'usdt', name: 'Tether (USDT)', icon: 'crypto-usdt' },
      { id: 'bnb', name: 'Binance Coin (BNB)', icon: 'crypto-bnb' },
      { id: 'xrp', name: 'Ripple (XRP)', icon: 'crypto-xrp' }
    ]
  },
  [PAYMENT_METHODS.QR_CODE]: {
    id: PAYMENT_METHODS.QR_CODE,
    name: 'QR Kod ile Ödeme',
    icon: 'QrCode',
    description: 'QR kod ile hızlı ödeme yapın',
    minAmount: 50,
    maxAmount: 5000,
    formFields: ['qrReference', 'receipt'],
    requiresReceipt: true,
    requiresAccountInfo: false,
    color: 'orange',
    hint: 'QR kod ödemeleri 5 dakika içinde tamamlanır.',
  },
  [PAYMENT_METHODS.OTHER]: {
    id: PAYMENT_METHODS.OTHER,
    name: 'Diğer Yöntemler',
    icon: 'CircleDollarSign',
    description: 'Diğer ödeme yöntemleri',
    minAmount: 50,
    maxAmount: 10000,
    formFields: ['methodDescription', 'reference', 'receipt'],
    requiresReceipt: true,
    requiresAccountInfo: false,
    color: 'gray',
    hint: 'Diğer ödeme yöntemleri 1 saat içinde işleme alınır.',
  }
};

// Para çekme yöntemi metadata'sı
export const withdrawalMethodsMetadata = {
  [PAYMENT_METHODS.BANK_TRANSFER]: {
    id: PAYMENT_METHODS.BANK_TRANSFER,
    name: 'Banka Havalesi / EFT',
    icon: 'Building',
    description: 'Banka hesabınıza para çekin',
    minAmount: 100,
    maxAmount: 50000,
    formFields: ['accountOwner', 'bankName', 'iban', 'accountNumber', 'bankBranch'],
    requiresAccountInfo: true,
    color: 'green',
    hint: 'Banka havalesi ile para çekme işlemleri 24 saat içinde tamamlanır.',
    banks: [
      { id: 'ziraat', name: 'Ziraat Bankası', icon: 'bank-ziraat' },
      { id: 'garanti', name: 'Garanti Bankası', icon: 'bank-garanti' },
      { id: 'isbank', name: 'İş Bankası', icon: 'bank-isbank' },
      { id: 'akbank', name: 'Akbank', icon: 'bank-akbank' },
      { id: 'yapikredi', name: 'Yapı Kredi', icon: 'bank-yapikredi' },
      { id: 'vakifbank', name: 'Vakıfbank', icon: 'bank-vakifbank' },
      { id: 'halkbank', name: 'Halkbank', icon: 'bank-halkbank' },
      { id: 'denizbank', name: 'Denizbank', icon: 'bank-denizbank' },
      { id: 'qnb', name: 'QNB Finansbank', icon: 'bank-qnb' },
      { id: 'enpara', name: 'Enpara', icon: 'bank-enpara' }
    ]
  },
  [PAYMENT_METHODS.PAPARA]: {
    id: PAYMENT_METHODS.PAPARA,
    name: 'Papara',
    icon: 'CreditCard',
    description: 'Papara hesabınıza hızlı para çekme',
    minAmount: 50,
    maxAmount: 20000,
    formFields: ['paparaNumber', 'fullName'],
    requiresAccountInfo: true,
    color: 'purple',
    hint: 'Papara ile para çekme işlemleri 1 saat içinde tamamlanır.',
  },
  [PAYMENT_METHODS.CRYPTO]: {
    id: PAYMENT_METHODS.CRYPTO,
    name: 'Kripto Para',
    icon: 'Bitcoin',
    description: 'Bitcoin, Ethereum ve diğer kripto paralarla para çekme',
    minAmount: 100,
    maxAmount: 100000,
    formFields: ['cryptoType', 'walletAddress'],
    requiresAccountInfo: true,
    color: 'yellow',
    hint: 'Kripto para çekme işlemleri 1 saat içinde tamamlanır.',
    cryptoTypes: [
      { id: 'btc', name: 'Bitcoin (BTC)', icon: 'crypto-btc' },
      { id: 'eth', name: 'Ethereum (ETH)', icon: 'crypto-eth' },
      { id: 'usdt', name: 'Tether (USDT)', icon: 'crypto-usdt' },
      { id: 'bnb', name: 'Binance Coin (BNB)', icon: 'crypto-bnb' },
      { id: 'xrp', name: 'Ripple (XRP)', icon: 'crypto-xrp' }
    ]
  }
};

// Varsayılan bankalar
export const accountDetails = {
  bank_accounts: [
    {
      bank_name: "Ziraat Bankası",
      account_owner: "Crypton Pay LTD",
      iban: "TR12 0001 2345 6789 0123 4567 89",
      branch: "Levent Şubesi",
      branch_code: "123",
      account_number: "12345678901"
    },
    {
      bank_name: "Akbank",
      account_owner: "Crypton Pay LTD",
      iban: "TR98 7654 3210 9876 5432 1098 76",
      branch: "Kadıköy Şubesi",
      branch_code: "456",
      account_number: "98765432109"
    },
    {
      bank_name: "Garanti BBVA",
      account_owner: "Crypton Pay LTD",
      iban: "TR45 6789 0123 4567 8901 2345 67",
      branch: "Şişli Şubesi",
      branch_code: "789",
      account_number: "45678901234"
    }
  ]
};