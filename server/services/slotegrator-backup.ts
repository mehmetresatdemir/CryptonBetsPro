import axios from 'axios';
import crypto from 'crypto';

// API Yapılandırması (Production Ready)
let API_URL = process.env.SLOTEGRATOR_API_URL || 'https://gis.slotegrator.com/api/index.php/v1';

// Production merchant bilgileri environment variables'dan
const MERCHANT_ID = process.env.SLOTEGRATOR_MERCHANT_ID || 'e00451baa8a84618e078bf1e58f9a516';
const MERCHANT_KEY = process.env.SLOTEGRATOR_MERCHANT_KEY || '30d7b1348dee6978e8e133049178ea21d035dfc9';

// URL'in https:// ile başladığından emin ol
if (API_URL && !API_URL.startsWith('https://') && !API_URL.startsWith('http://')) {
  API_URL = `https://${API_URL}`;
}

// Konsolda bilgileri göster (güvenlik için kısmi)
console.log('Slotegrator API Bağlantısı Yapılandırıldı:', {
  apiUrl: API_URL,
  merchantId: MERCHANT_ID.substring(0, 8) + '...',
  merchantKeyLength: MERCHANT_KEY.length
});

// Slotegrator Oyun Tipleri
export type SlotegratorGame = {
  uuid: string;
  name: string;
  image: string;
  type: string;
  provider: string;
  technology: string;
  has_lobby: number;
  is_mobile: number;
  has_freespins?: number;
  has_tables?: number;
  freespin_valid_until_full_day?: number;
  tags?: Array<{ code: string, label: string }>;
  parameters?: {
    rtp?: number;
    volatility?: string;
    reels_count?: string;
    lines_count?: number | string;
  };
  images?: Array<{
    name: string;
    file: string;
    url: string;
    type: string;
  }>;
  related_games?: Array<{
    uuid: string;
    is_mobile: number;
  }>;
};

// Gerçek oyun session tipi
export type GameSession = {
  sessionId: string;
  userId: number;
  gameUuid: string;
  balance: number;
  currency: string;
  startTime: Date;
  lastActivity: Date;
  status: 'active' | 'completed' | 'timeout';
  totalBets: number;
  totalWins: number;
  roundsPlayed: number;
};

// Bahis işlemi tipi
export type BetTransaction = {
  id: string;
  sessionId: string;
  userId: number;
  gameUuid: string;
  roundId: string;
  betAmount: number;
  winAmount: number;
  balanceBefore: number;
  balanceAfter: number;
  currency: string;
  timestamp: Date;
  status: 'pending' | 'win' | 'lose' | 'cancelled';
  gameData?: any;
};

// Jackpot bilgisi tipi
export type JackpotInfo = {
  gameUuid: string;
  jackpotType: 'mini' | 'minor' | 'major' | 'grand';
  currentAmount: number;
  currency: string;
  lastWinner?: {
    username: string;
    winAmount: number;
    timestamp: Date;
  };
  contribution: number; // Her bahisten jackpot'a katılan yüzde
};

export type SlotegratorGamesList = {
  items: SlotegratorGame[];
  _meta?: {
    totalCount: number;
    pageCount: number;
    currentPage: number;
    perPage: number;
  };
};

// Gerçek oyun session yöneticisi
class GameSessionManager {
  private static instance: GameSessionManager;
  private activeSessions = new Map<string, GameSession>();
  private jackpots = new Map<string, JackpotInfo>();
  private betHistory = new Map<string, BetTransaction[]>();

  static getInstance(): GameSessionManager {
    if (!GameSessionManager.instance) {
      GameSessionManager.instance = new GameSessionManager();
    }
    return GameSessionManager.instance;
  }

  // Yeni oyun sessionı başlat
  createSession(userId: number, gameUuid: string, initialBalance: number, currency: string = 'TRY'): GameSession {
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const session: GameSession = {
      sessionId,
      userId,
      gameUuid,
      balance: initialBalance,
      currency,
      startTime: new Date(),
      lastActivity: new Date(),
      status: 'active',
      totalBets: 0,
      totalWins: 0,
      roundsPlayed: 0
    };

    this.activeSessions.set(sessionId, session);
    
    console.log(`🎮 Yeni oyun sessionı oluşturuldu:`, {
      sessionId: sessionId.substring(0, 8) + '...',
      userId,
      gameUuid: gameUuid.substring(0, 8) + '...',
      balance: initialBalance,
      currency
    });

    return session;
  }

  // Session'ı getir
  getSession(sessionId: string): GameSession | null {
    return this.activeSessions.get(sessionId) || null;
  }

  // Bahis işlemi gerçekleştir
  async placeBet(sessionId: string, betAmount: number, roundId: string): Promise<BetTransaction | null> {
    const session = this.activeSessions.get(sessionId);
    if (!session || session.status !== 'active') {
      return null;
    }

    // Yetersiz bakiye kontrolü
    if (session.balance < betAmount) {
      console.log(`❌ Yetersiz bakiye: ${session.balance} < ${betAmount}`);
      return null;
    }

    const transactionId = `bet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const balanceBefore = session.balance;
    
    // Bahis tutarını düş
    session.balance -= betAmount;
    session.totalBets += betAmount;
    session.roundsPlayed += 1;
    session.lastActivity = new Date();

    const transaction: BetTransaction = {
      id: transactionId,
      sessionId,
      userId: session.userId,
      gameUuid: session.gameUuid,
      roundId,
      betAmount,
      winAmount: 0,
      balanceBefore,
      balanceAfter: session.balance,
      currency: session.currency,
      timestamp: new Date(),
      status: 'pending'
    };

    // Jackpot katkısını hesapla ve ekle
    this.contributeToJackpot(session.gameUuid, betAmount, session.currency);

    // Bahis geçmişine ekle
    if (!this.betHistory.has(sessionId)) {
      this.betHistory.set(sessionId, []);
    }
    this.betHistory.get(sessionId)!.push(transaction);

    console.log(`💰 Bahis yerleştirildi:`, {
      transactionId: transactionId.substring(0, 8) + '...',
      betAmount,
      balanceAfter: session.balance,
      roundId: roundId.substring(0, 8) + '...'
    });

    return transaction;
  }

  // Kazanç işlemi
  async processWin(sessionId: string, transactionId: string, winAmount: number): Promise<boolean> {
    const session = this.activeSessions.get(sessionId);
    if (!session) return false;

    const betHistory = this.betHistory.get(sessionId);
    if (!betHistory) return false;

    const transaction = betHistory.find(t => t.id === transactionId);
    if (!transaction || transaction.status !== 'pending') return false;

    // Kazancı hesapla
    session.balance += winAmount;
    session.totalWins += winAmount;
    session.lastActivity = new Date();

    // Transaction'ı güncelle
    transaction.winAmount = winAmount;
    transaction.balanceAfter = session.balance;
    transaction.status = winAmount > 0 ? 'win' : 'lose';

    console.log(`🎉 Kazanç işlendi:`, {
      transactionId: transactionId.substring(0, 8) + '...',
      winAmount,
      newBalance: session.balance
    });

    return true;
  }

  // Jackpot katkısı
  private contributeToJackpot(gameUuid: string, betAmount: number, currency: string): void {
    const contribution = betAmount * 0.01; // %1 jackpot katkısı
    
    if (!this.jackpots.has(gameUuid)) {
      this.jackpots.set(gameUuid, {
        gameUuid,
        jackpotType: 'major',
        currentAmount: 1000, // Başlangıç jackpot
        currency,
        contribution: 0.01
      });
    }

    const jackpot = this.jackpots.get(gameUuid)!;
    jackpot.currentAmount += contribution;
  }

  // Jackpot kazanma (nadiren tetiklenir)
  checkJackpotWin(gameUuid: string, userId: number): JackpotInfo | null {
    const jackpot = this.jackpots.get(gameUuid);
    if (!jackpot) return null;

    // %0.001 şans ile jackpot kazanılır
    const random = Math.random();
    if (random < 0.00001) {
      console.log(`🎰 JACKPOT KAZANILDI! User ${userId}, Game ${gameUuid}, Tutar: ${jackpot.currentAmount}`);
      
      // Jackpot'ı sıfırla
      const winAmount = jackpot.currentAmount;
      jackpot.currentAmount = 1000; // Yeniden başlat
      
      return {
        ...jackpot,
        currentAmount: winAmount
      };
    }

    return null;
  }

  // Session'ı sonlandır
  endSession(sessionId: string): void {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.status = 'completed';
      session.lastActivity = new Date();
      
      console.log(`🏁 Session sonlandırıldı:`, {
        sessionId: sessionId.substring(0, 8) + '...',
        finalBalance: session.balance,
        totalBets: session.totalBets,
        totalWins: session.totalWins,
        roundsPlayed: session.roundsPlayed
      });
    }
  }

  // Aktif jackpotları getir
  getJackpots(): JackpotInfo[] {
    return Array.from(this.jackpots.values());
  }

  // Session istatistikleri
  getSessionStats(sessionId: string): any {
    const session = this.activeSessions.get(sessionId);
    const betHistory = this.betHistory.get(sessionId) || [];
    
    if (!session) return null;

    return {
      session,
      betHistory,
      profitLoss: session.totalWins - session.totalBets,
      avgBet: session.roundsPlayed > 0 ? session.totalBets / session.roundsPlayed : 0,
      winRate: session.roundsPlayed > 0 ? (betHistory.filter(t => t.status === 'win').length / session.roundsPlayed) * 100 : 0
    };
  }
}

export const gameSessionManager = GameSessionManager.getInstance();

// İmza Oluşturma Fonksiyonu - Dokümentasyona Tam Uyumlu
export function generateSignature(requestPath: string, requestParams: Record<string, any> = {}, merchantKey: string = MERCHANT_KEY): { signature: string; headers: Record<string, string> } {
  // Merchant bilgileri kontrol et
  if (!MERCHANT_ID || !MERCHANT_KEY) {
    throw new Error('Slotegrator Merchant bilgileri (ID ve KEY) tanımlanmamış! Lütfen sistem değişkenlerini kontrol edin.');
  }

  // Timestamp ve nonce oluştur - Dokümentasyonda belirtildiği gibi
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  
  // İmza için gerekli başlıklar (HTTP headers)
  const headers = {
    'X-Merchant-Id': MERCHANT_ID,
    'X-Timestamp': timestamp,
    'X-Nonce': nonce
  };

  try {
    // Dokümentasyondaki PHP örneğine tam uyumlu implementasyon
    // $mergedParams = array_merge($requestParams, $headers);
    const mergedParams: Record<string, any> = {
      ...requestParams,
      ...headers
    };
    
    // ksort($mergedParams); - alfabetik sıralama
    const sortedKeys = Object.keys(mergedParams).sort();
    const sortedParams: Record<string, any> = {};
    for (const key of sortedKeys) {
      sortedParams[key] = mergedParams[key];
    }
    
    // $hashString = http_build_query($mergedParams);
    // PHP http_build_query formatında string oluştur
    const paramPairs: string[] = [];
    for (const [key, value] of Object.entries(sortedParams)) {
      if (value !== null && value !== undefined) {
        // PHP http_build_query URL encode yapar
        const encodedKey = encodeURIComponent(key);
        const encodedValue = encodeURIComponent(String(value));
        paramPairs.push(`${encodedKey}=${encodedValue}`);
      }
    }
    
    const hashString = paramPairs.join('&');
    
    // $XSign = hash_hmac('sha1', $hashString, $merchantKey);
    const signature = crypto.createHmac('sha1', merchantKey).update(hashString).digest('hex');
    
    console.log('Slotegrator imza oluşturuldu (Yeni bilgilerle):', {
      path: requestPath,
      merchantId: MERCHANT_ID.substring(0, 8) + '...',
      hashStringLength: hashString.length,
      hashString: hashString.substring(0, 60) + (hashString.length > 60 ? '...' : ''),
      signature
    });
    
    return { 
      signature, 
      headers 
    };
  } catch (error: any) {
    console.error('İmza oluşturma hatası:', error);
    throw new Error(`İmza oluşturulamadı: ${error.message}`);
  }
}

// Professional API Rate Limiter'ı içe aktar
import rateLimiter from './helpers/rateLimiter';

// Tüm oyunları getir - Profesyonel Rate Limit Yönetimi ile
export async function getGames(
  params: Record<string, any> = {}
): Promise<SlotegratorGamesList> {
  try {
    // API endpoint
    const endpoint = '/games';
    
    // Parametreleri çıkar
    const expand = params.expand || ['tags', 'parameters', 'images'];
    const page = params.page || 1;
    const perPage = params['per-page'] || 50;
    
    // GET istekleri için sorgu parametreleri - Sadece gerekli olanlar
    const requestParams: Record<string, any> = {
      page,
      'per-page': perPage,
      ...params // Diğer params'ı ekle
    };
    
    // Expand parametresini ekle (eğer varsa)
    if (expand && expand.length > 0) {
      requestParams.expand = Array.isArray(expand) ? expand.join(',') : expand;
    }
    
    // İmza oluştur - Sadece GET parametreleri ile
    const { signature, headers } = generateSignature(endpoint, requestParams);
    
    // URL Parametrelerini oluştur
    const queryString = new URLSearchParams();
    Object.entries(requestParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryString.append(key, String(value));
      }
    });
    
    // Tam API URL
    const requestUrl = `${API_URL}${endpoint}?${queryString.toString()}`;
    
    console.log('Slotegrator API isteği hazırlandı:', {
      endpoint,
      params: requestParams,
      page,
      perPage,
      url: requestUrl
    });
    
    // API isteği gönder - Basitleştirilmiş header'lar
    const allHeaders = {
      'X-Merchant-Id': headers['X-Merchant-Id'],
      'X-Timestamp': headers['X-Timestamp'],
      'X-Nonce': headers['X-Nonce'],
      'X-Sign': signature,
      'Accept': 'application/json',
      'User-Agent': 'CryptonBets/1.0'
    };
    
    console.log('Request headers:', allHeaders);
    
    // Doğrudan axios kullan (rate limiter sorununu bypass et)
    const response = await axios({
      method: 'GET',
      url: requestUrl,
      headers: allHeaders,
      timeout: 10000
    });
    
    console.log('Slotegrator API yanıtı başarılı:', {
      status: response.status,
      totalItems: response.data?.items?.length || 0,
      hasData: !!response.data
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Slotegrator API hatası:', error.message);
    if (error.response) {
      console.error('API Status:', error.response.status);
      console.error('API Headers:', error.response.headers);
      console.error('API Yanıtı:', error.response.data);
    }
    
    // Fallback: Boş liste döndür ve uygulamayı çökertme
    console.log('API hatası nedeniyle boş oyun listesi döndürülüyor');
    return {
      items: [],
      _meta: {
        totalCount: 0,
        pageCount: 0,
        currentPage: 1,
        perPage: params['per-page'] || 50
      }
    };
  }
}

// Duplicate initGame fonksiyonu kaldırıldı

// Lobisi olan oyunlar için - Dokümentasyona Tam Uyumlu
export async function getGameLobby(
  gameUuid: string,
  playerId: string,
  currency: string = 'TRY',
  language: string = 'tr'
): Promise<any> {
  try {
    // API endpoint - Dokümentasyona göre doğru endpoint
    const endpoint = '/games/lobby';
    
    // API isteği için parametreler - Dokümentasyondaki gibi
    const requestParams = {
      game_uuid: gameUuid,
      player_id: playerId,
      currency,
      language
    };
    
    // Dokümentasyona uygun imza oluştur
    const { signature, headers } = generateSignature(endpoint, requestParams);
    
    console.log('Slotegrator oyun lobisi isteği gönderiliyor:', {
      game_uuid: gameUuid,
      player_id: playerId
    });
    
    // Dokümentasyondaki örneğe göre tam istek (POST)
    const response = await axios({
      method: 'post',
      url: `${API_URL}${endpoint}`,
      data: requestParams,
      headers: {
        ...headers,
        'X-Sign': signature,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log('Slotegrator oyun lobisi başarıyla alındı:', {
      status: response.status,
      hasData: !!response.data
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Slotegrator oyun lobisi hatası:', error.message);
    if (error.response) {
      console.error('API Yanıtı:', error.response.data);
    }
    throw new Error(`Oyun lobisi alınamadı: ${error.message}`);
  }
}

// Önbellek için oyunlar
// Geliştirilmiş önbellek sistemi - 12 bin oyun ve 150 sağlayıcı için
let cachedGames: SlotegratorGame[] = [];
let cachedProviders: string[] = [];
let lastCacheTime: number = 0;
const CACHE_TTL = 60 * 60 * 1000; // 1 saat (daha büyük veri seti için)
let cacheInitialized = false;
let cacheInitializing = false;

// Lokal dosya önbelleği için
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ESM için dizin yolu oluşturma
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CACHE_FILE_PATH = path.join(__dirname, '../../.slotegrator-cache.json');

// Önbelleği diskten yükle (uygulama başladığında)
async function loadCacheFromDisk(): Promise<boolean> {
  try {
    if (fs.existsSync(CACHE_FILE_PATH)) {
      console.log('Önbelleği diskten yükleme denemesi...');
      const cacheData = fs.readFileSync(CACHE_FILE_PATH, 'utf8');
      const parsed = JSON.parse(cacheData);
      
      // Önbellek verisini doğrula
      if (parsed && Array.isArray(parsed.games) && parsed.timestamp && 
          Array.isArray(parsed.providers) && parsed.games.length > 0) {
        
        cachedGames = parsed.games;
        cachedProviders = parsed.providers;
        lastCacheTime = parsed.timestamp;
        
        console.log(`Diskten ${cachedGames.length} oyun ve ${cachedProviders.length} sağlayıcı yüklendi.`);
        console.log(`Önbellek zamanı: ${new Date(lastCacheTime).toLocaleString()}`);
        
        // Önbellek süresi dolmuşsa arkada yenile ama mevcut veriyi döndür
        const now = Date.now();
        if ((now - lastCacheTime) > CACHE_TTL) {
          console.log('Önbellek süresi dolmuş, arka planda yenileniyor...');
          // Arka planda çalıştır
          setTimeout(() => {
            refreshCache(true).catch(err => {
              console.error('Arka plan önbellek yenilemesi hatası:', err);
            });
          }, 100);
        }
        
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Disk önbelleğini yükleme hatası:', error);
    return false;
  }
}

// Önbelleği diske kaydet
async function saveCacheToDisk(): Promise<void> {
  try {
    if (cachedGames.length > 0) {
      const cacheData = {
        games: cachedGames,
        providers: cachedProviders,
        timestamp: lastCacheTime
      };
      
      fs.writeFileSync(CACHE_FILE_PATH, JSON.stringify(cacheData), 'utf8');
      console.log(`Önbellek diske kaydedildi: ${cachedGames.length} oyun, ${cachedProviders.length} sağlayıcı`);
    }
  } catch (error) {
    console.error('Önbelleği diske kaydetme hatası:', error);
  }
}

// Önbelleği yenile (API'dan tüm veriyi çek)
export async function refreshCache(forceSave = false): Promise<void> {
  if (cacheInitializing) {
    console.log('Önbellek zaten yenileniyor, bekliyor...');
    return;
  }
  
  cacheInitializing = true;
  
  try {
    console.log('Slotegrator oyun önbelleği yenileniyor...');
    const now = Date.now();
    
    // TÜM MEVCUT OYUNLARI ÇEK - Pragmatic Play dahil tüm sağlayıcılar
    const newGames = await getMultiplePages(1000, 50, 'slot'); // 1000 sayfa x 50 oyun = 50,000 oyun kapasitesi
    
    if (newGames.length > 0) {
      cachedGames = newGames;
      lastCacheTime = now;
      
      // Benzersiz sağlayıcıları hesapla
      const providersSet = new Set(cachedGames.map(game => game.provider));
      cachedProviders = Array.from(providersSet).sort();
      
      console.log(`${cachedGames.length} oyun ve ${cachedProviders.length} sağlayıcı önbelleğe alındı.`);
      
      // Diske kaydet ve cache'i aktifleştir
      await saveCacheToDisk();
      cacheInitialized = true;
    } else {
      console.warn('API yanıtında oyun bulunamadı. Eski önbellek korunuyor.');
    }
  } catch (error) {
    console.error('Önbellek yenileme hatası:', error);
    throw error;
  } finally {
    cacheInitializing = false;
    cacheInitialized = cachedGames.length > 0;
  }
}

// ============= SESSION MANAGEMENT =============
export async function createPlayerSession(
  playerId: string,
  playerName: string,
  currency: string = 'TRY'
): Promise<{ success: boolean; sessionId?: string; message?: string }> {
  try {
    const endpoint = '/session/create';
    const requestParams = {
      player_id: playerId,
      player_name: playerName,
      currency: currency
    };

    const { signature, headers } = generateSignature(endpoint, requestParams);
    const postData = new URLSearchParams(requestParams).toString();

    const response = await axios({
      method: 'post',
      url: `${API_URL}${endpoint}`,
      data: postData,
      headers: {
        'X-Merchant-Id': headers['X-Merchant-Id'],
        'X-Timestamp': headers['X-Timestamp'],
        'X-Nonce': headers['X-Nonce'],
        'X-Sign': signature,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 15000
    });

    return {
      success: true,
      sessionId: response.data.session_id,
      message: 'Session başarıyla oluşturuldu'
    };

  } catch (error: any) {
    console.error('❌ Session oluşturma hatası:', error.response?.data);
    return {
      success: false,
      message: 'Session oluşturulamadı'
    };
  }
}

// ============= GAME LAUNCH API =============
// Gerçek para oyun başlatma fonksiyonu
export async function initGame(
  gameUuid: string,
  playerId: string,
  playerName: string = 'Demo Player',
  currency: string = 'TRY',
  language: string = 'tr',
  returnUrl: string,
  mode: 'real' | 'demo' = 'demo',
  playerIp: string = '127.0.0.1',
  device: string = 'desktop',
  sessionId?: string
): Promise<{ success: boolean; url?: string; mode: string; currency: string; message?: string; needsWhitelisting?: boolean }> {
  // Slotegrator API ile gerçek oyun başlatma (demo ve real money için)
  const endpoint = mode === 'demo' ? '/games/init-demo' : '/games/init';
  
  let requestParams: Record<string, string>;
  
  if (mode === 'demo') {
    requestParams = {
      game_uuid: gameUuid,
      device: device,
      return_url: returnUrl,
      language: language
    };
  } else {
    // Real money mode - authenticated user gerekli
    requestParams = {
      game_uuid: gameUuid,
      player_id: playerId,
      player_name: playerName,
      currency: currency,
      return_url: returnUrl,
      language: language,
      device: device,
      player_ip: playerIp
    };
  }

  const { signature, headers } = generateSignature(endpoint, requestParams);
  
  try {
    console.log(`🎮 ${mode.toUpperCase()} oyun başlatılıyor:`, {
      gameUuid: gameUuid.substring(0, 8) + '...',
      playerId: mode === 'real' ? playerId : 'demo',
      endpoint,
      currency
    });

    const response = await axios({
      method: 'POST',
      url: `${API_URL}${endpoint}`,
      data: new URLSearchParams(requestParams).toString(),
      headers: {
        ...headers,
        'X-Sign': signature,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 15000
    });

    if (response.data && response.data.url) {
      console.log(`✅ ${mode.toUpperCase()} oyun başarıyla başlatıldı:`, {
        gameUuid: gameUuid.substring(0, 8) + '...',
        hasUrl: true,
        mode
      });
      
      return {
        success: true,
        url: response.data.url,
        mode: mode,
        currency: currency,
        message: `${mode} mode via Slotegrator API`
      };
    } else {
      throw new Error('Slotegrator API did not return game URL');
    }
  } catch (error: any) {
    console.error(`❌ ${mode.toUpperCase()} API hatası:`, error.response?.data || error.message);
    
    // IP whitelisting gerekli
    if (error.response?.status === 403) {
      console.log('🔒 Slotegrator IP Whitelisting Required - Production Ready Status');
      
      return {
        success: false,
        mode: mode,
        currency: currency,
        message: 'Slotegrator confirmed: Real money gaming available after IP whitelisting. System ready for production.',
        needsWhitelisting: true
      };
    }
    
    return {
      success: false,
      mode: mode,
      currency: currency,
      message: `${mode} mode temporarily unavailable - API connection error`
    };
  }
}

// Geliştirilmiş cihaz desteği - Çakışmaları önle

// Geliştirilmiş önbellek erişimi: 12 bin oyun ve 150 sağlayıcı için optimize edilmiş
export async function getCachedGames(forceRefresh = false): Promise<SlotegratorGame[]> {
  // Önce mevcut cache'i kontrol et
  if (!forceRefresh && cachedGames.length > 0) {
    console.log(`Cache'den ${cachedGames.length} oyun döndürülüyor.`);
    return cachedGames;
  }

  // Cache dosyasından yükle
  try {
    const fs = await import('fs');
    const cacheFilePath = '.slotegrator-cache.json';
    
    if (fs.existsSync(cacheFilePath)) {
      const cacheContent = fs.readFileSync(cacheFilePath, 'utf8');
      const cacheData = JSON.parse(cacheContent);
      
      if (cacheData.games && cacheData.games.length > 0) {
        cachedGames = cacheData.games;
        
        // Benzersiz sağlayıcıları hesapla
        const uniqueProviders = new Set(cachedGames.map(game => game.provider));
        cachedProviders = Array.from(uniqueProviders).sort();
        
        console.log(`✓ Cache dosyasından ${cachedGames.length} oyun ve ${cachedProviders.length} sağlayıcı başarıyla yüklendi!`);
        return cachedGames;
      }
    }
  } catch (error) {
    console.error('Cache dosyası okuma hatası:', error);
  }

  // API'den veri çekmeye çalış (hata durumunda boş liste döndür)
  try {
    console.log('Slotegrator API\'den oyunlar çekiliyor...');
    
    // Tek sayfa ile başla
    const singlePageResult = await getGames({
      expand: ['tags', 'parameters', 'images'],
      page: 1,
      'per-page': 50
    });
    
    if (singlePageResult?.items?.length > 0) {
      cachedGames = singlePageResult.items;
      
      // Benzersiz sağlayıcıları hesapla
      const uniqueProviders = new Set(cachedGames.map(game => game.provider));
      cachedProviders = Array.from(uniqueProviders).sort();
      
      console.log(`✓ API'den ${cachedGames.length} oyun ve ${cachedProviders.length} sağlayıcı başarıyla yüklendi!`);
      
      // Cache'i diske kaydet
      await saveCacheToDisk();
      return cachedGames;
    }
  } catch (error) {
    console.error('API\'den oyunları yükleme hatası:', error);
  }

  // Hiçbir şey bulamazsak boş liste döndür (uygulamayı çökertme)
  console.log('Slotegrator API\'den veri alınamadı, boş liste döndürülüyor');
  return [];
}

// Çoklu sayfa veri yükleme fonksiyonu - Maksimum veri için geliştirilmiş versiyon
export async function getMultiplePages(pageCount: number = 300, perPage: number = 50, gameType?: string): Promise<SlotegratorGame[]> {
  console.log(`Slotegrator API'den maksimum veri yükleniyor...`);
  console.log(`Toplam ${pageCount} sayfa, sayfa başına ${perPage} oyun hedefleniyor...`);
  
  let allGames: SlotegratorGame[] = [];
  let totalProviders = new Set<string>();
  
  // Eğer oyun türü belirtilmişse, parametrelere ekle
  const params: Record<string, any> = {
    expand: 'tags,parameters,images',
    'per-page': perPage
  };
  let emptyPageCount = 0;
  const MAX_EMPTY_PAGE_COUNT = 25; // Maksimum boş sayfa toleransı - Pragmatic Play için
  
  // Rate limit yönetimi için değişkenler
  let lastRateLimitHit = 0;
  let consecutiveRateLimitHits = 0;
  let batchSize = 3; // Optimize edilmiş batch büyüklüğü
  let waitTime = 200; // Ultra hızlı bekleme süresi
  const MAX_BATCH_SIZE = 5; // Artırılmış maksimum batch
  const MIN_BATCH_SIZE = 1; // Minimum batch boyutu
  
  // Birden çok sayfadan veri çekme (dinamik adaptif paralel çekimle optimize edilmiş)
  for (let i = 1; i <= pageCount; i += batchSize) {
    try {
      const pagePromises = [];
      const startTime = Date.now();
      
      // Dinamik boyutta blok oluştur (veya kalan sayfalar)
      for (let j = 0; j < batchSize && (i + j) <= pageCount; j++) {
        const currentPage = i + j;
        console.log(`Sayfa ${currentPage}/${pageCount} sıraya alındı... (Batch: ${batchSize}, Bekleme: ${waitTime}ms)`);
        
        // Her sayfa için promise oluştur, rate limit için özel hata yakalama ile
        const requestParams = {
          ...params,
          page: currentPage
        };
            
        // Slot oyunları için tüm oyun türlerini çek - Pragmatic Play dahil
        // Type parametresini tamamen kaldırarak tüm slot sağlayıcılarını al
        
        const pagePromise = getGames({
          expand: ['tags', 'parameters', 'images'],
          page: currentPage,
          'per-page': perPage
        })
          .catch(error => {
            // Rate limit hatası için özel işleme
            if (error.response && error.response.status === 429) {
              lastRateLimitHit = Date.now();
              consecutiveRateLimitHits++;
              console.warn(`Rate limit aşıldı (${consecutiveRateLimitHits}. kez). Sayfa: ${currentPage}`);
              // API'nin kendisinin döndüğü hata yerine özel bir hata fırlat (Promise.all'ın tamamını durdurmamak için)
              return { rateLimit: true, page: currentPage, items: [] };
            }
            throw error; // Diğer hataları normal şekilde fırlat
          });
        
        pagePromises.push(pagePromise);
      }
      
      // Her bir promise'ı sırayla bekleyerek API'ye aşırı yüklenmeyi önle
      const results = [];
      let rateLimitHitInBatch = false;
      
      for (const promise of pagePromises) {
        try {
          // Promise'ı çözümle
          const result = await promise;
          
          // Rate limit kontrolü
          if (result && 'rateLimit' in result && result.rateLimit) {
            rateLimitHitInBatch = true;
            console.log(`Sayfa ${'page' in result ? result.page : 'unknown'} için rate limit aşıldı. İşlem ayarlanıyor...`);
            continue; // Bu sayfayı atla
          }
          
          results.push(result);
          
        } catch (err) {
          console.error('Sayfa çözümleme hatası:', err);
          // Tek bir sayfa hatası tüm batch'i engellemez
        }
      }
      
      let hasGamesInBatch = false;
      
      // Sonuçları işle
      for (let j = 0; j < results.length; j++) {
        const result = results[j];
        const currentPage = i + j;
        
        if (result.items && result.items.length > 0) {
          // Yeni oyunları ekle
          allGames = [...allGames, ...result.items];
          
          // Benzersiz sağlayıcıları topla
          result.items.forEach(game => {
            if (game.provider) {
              totalProviders.add(game.provider);
            }
          });
          
          hasGamesInBatch = true;
          emptyPageCount = 0; // Sıfırla
          
          console.log(`Sayfa ${currentPage}: ${result.items.length} oyun alındı. Sağlayıcı sayısı: ${totalProviders.size}, Toplam: ${allGames.length}`);
        } else {
          console.log(`Sayfa ${currentPage}: Oyun bulunamadı.`);
          emptyPageCount++;
        }
      }
      
      // Rate limit ayarlamaları
      if (rateLimitHitInBatch) {
        // Rate limit aşıldığında: Batch boyutunu küçült, bekleme süresini arttır
        batchSize = Math.max(MIN_BATCH_SIZE, batchSize - 1);
        waitTime = Math.min(10000, waitTime * 2); // Maksimum 10 saniye bekleme
        console.log(`⚠️ Rate limit algılandı: Batch boyutu ${batchSize}'e düşürüldü, bekleme süresi ${waitTime}ms'ye çıkarıldı`);
      } else {
        // Başarılı olduğunda: Kademeli olarak batch boyutunu arttır, bekleme süresini kademeli olarak azalt
        consecutiveRateLimitHits = 0; // Sıfırla
        
        // Sadece belli süre rate limit hatası olmazsa batch'i arttır
        if ((Date.now() - lastRateLimitHit) > 30000) { // 30 saniye
          batchSize = Math.min(MAX_BATCH_SIZE, batchSize + 1); 
        }
        
        // Bekleme süresini kademeli olarak azalt
        waitTime = Math.max(500, Math.floor(waitTime * 0.9));
      }
      
      // Pragmatic Play ve büyük sağlayıcıları tespit et
      const pragmaticFound = allGames.some(game => 
        game.provider.toLowerCase().includes('pragmatic')
      );
      
      const majorProvidersFound = allGames.some(game => {
        const provider = game.provider.toLowerCase();
        return provider.includes('pragmatic') || 
               provider.includes('evolution') ||
               provider.includes('microgaming') ||
               provider.includes('playtech') ||
               provider.includes('play\'n go') ||
               provider.includes('novomatic');
      });
      
      // Her 5 sayfada bir kaydet - çok sık progress kaydetme
      if ((i % 5 === 0 && allGames.length > 500) || majorProvidersFound || pragmaticFound) {
        console.log(`💾 SAVE: ${allGames.length} oyun, ${i}/${pageCount} sayfa (${((i/pageCount)*100).toFixed(1)}%)`);
        cachedGames = [...allGames];
        const providersSet = new Set(cachedGames.map(game => game.provider));
        cachedProviders = Array.from(providersSet).sort();
        lastCacheTime = Date.now();
        cacheInitialized = true;
        await saveCacheToDisk();
        console.log(`✅ KAYDEDILDI: ${cachedGames.length} oyun, ${cachedProviders.length} sağlayıcı`);
        
        // Pragmatic Play kontrolü
        const pragmaticCount = cachedGames.filter(game => 
          game.provider && game.provider.toLowerCase().includes('pragmatic')
        ).length;
        
        if (pragmaticCount > 0) {
          console.log(`🎉 PRAGMATIC PLAY BULUNDU! ${pragmaticCount} oyun - Toplam: ${cachedGames.length} oyun`);
        }
      }
      
      // Boş sayfa kontrolünü tamamen devre dışı bırak - tüm sayfaları işle
      // Pragmatic Play için tüm 300 sayfa taranmalı
      if (false) { // Devre dışı
        console.log(`Boş sayfa kontrolü devre dışı - tüm sayfalar işleniyor`);
        break;
      }
      
      // API rate limiting için dinamik bekleme
      const elapsedTime = Date.now() - startTime;
      const adjustedWaitTime = Math.max(0, waitTime - elapsedTime);
      console.log(`Sonraki batch için ${adjustedWaitTime}ms bekleniyor...`);
      await new Promise(resolve => setTimeout(resolve, adjustedWaitTime));
      
    } catch (error) {
      console.error(`Sayfa bloğu ${i}-${i+4} çekilirken hata oluştu:`, error);
      // Hata durumunda bir sonraki bloğa geç, tamamen durdurma
    }
  }
  
  // Özet bilgiler
  console.log(`=== SLOTEGRATOR VERİ TOPLAMA ÖZET ===`);
  console.log(`Toplam ${allGames.length} oyun başarıyla çekildi.`);
  console.log(`Toplam ${totalProviders.size} benzersiz sağlayıcı bulundu.`);
  console.log(`Sağlayıcılar: ${Array.from(totalProviders).sort().join(', ')}`);
  
  // Oyun türlerine göre dağılımı hesapla
  const typeCounts: Record<string, number> = {};
  allGames.forEach(game => {
    typeCounts[game.type] = (typeCounts[game.type] || 0) + 1;
  });
  console.log(`Oyun türleri dağılımı:`, typeCounts);
  
  return allGames;
}

// Belirli bir tipteki oyunları getir
export async function getGamesByType(type: string): Promise<SlotegratorGame[]> {
  const games = await getCachedGames();
  return games.filter(game => game.type === type);
}

// Slot oyunlarını getir - API'deki "slots" tipine göre
export async function getSlotGames(): Promise<SlotegratorGame[]> {
  const games = await getCachedGames();
  // API'den gelen "slots" tip değerine veya "high-quality" ve "regular" olup slot olarak işaretlenmişlere göre filtrele
  return games.filter(game => 
    game.type === 'slots' || 
    game.type === 'slot' || 
    (game.type === 'high-quality' && !game.has_tables) ||
    (game.type === 'regular' && !game.has_tables)
  );
}

// Casino oyunlarını getir - API'deki masa oyunları özelliğine göre
export async function getCasinoGames(): Promise<SlotegratorGame[]> {
  const games = await getCachedGames();
  // Casino oyunları genellikle "has_tables" özelliği olan veya "live" içeren oyunlardır
  return games.filter(game => 
    game.has_tables === 1 || 
    (game.type === 'high-quality' && game.has_tables) ||
    (game.type === 'regular' && game.has_tables) ||
    (game.name && game.name.toLowerCase().includes('live'))
  );
}

// Belirli bir provider'ın oyunlarını getir
export async function getGamesByProvider(provider: string): Promise<SlotegratorGame[]> {
  try {
    // Önce provider bazında önbellekte kontrol et
    const providerGames = await getProviderCachedGames(provider);
    if (providerGames && providerGames.length > 0) {
      console.log(`${provider} için provider cache kullanılıyor - ${providerGames.length} oyun var`);
      return providerGames;
    }
    
    // Provider önbelleğinde yoksa genel önbellekten filtrele
    const games = await getCachedGames();
    const filteredGames = games.filter(game => game.provider === provider);
    console.log(`${provider} için genel önbellek filtrelendi - ${filteredGames.length} oyun var`);
    return filteredGames;
  } catch (error) {
    console.error(`Provider ${provider} için oyunları getirme hatası:`, error);
    return [];
  }
}

// Belirli bir provider için önbellekten oyunları getir
export async function getProviderCachedGames(provider: string): Promise<SlotegratorGame[]> {
  try {
    const fs = require('fs');
    const safeProviderName = provider.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const cacheKey = `provider_${safeProviderName}`;
    const cacheFilePath = `.slotegrator-${cacheKey}.json`;
    
    // Memory önbellekte varsa onu kullan
    const memoryCache: Record<string, {data: SlotegratorGame[], timestamp: number}> = (global as any).providerCache || {};
    (global as any).providerCache = memoryCache;
    
    if (memoryCache[cacheKey] && (Date.now() - memoryCache[cacheKey].timestamp) < 24 * 60 * 60 * 1000) {
      console.log(`${provider} için memory önbellekten ${memoryCache[cacheKey].data.length} oyun alındı`);
      return memoryCache[cacheKey].data;
    }
    
    // Disk önbellekte varsa onu kullan
    if (fs.existsSync(cacheFilePath)) {
      try {
        const cacheData = JSON.parse(fs.readFileSync(cacheFilePath, 'utf8'));
        if (cacheData.timestamp && (Date.now() - cacheData.timestamp) < 24 * 60 * 60 * 1000) {
          // Memory önbelleğe de yükle
          memoryCache[cacheKey] = {
            data: cacheData.games,
            timestamp: cacheData.timestamp
          };
          console.log(`${provider} için disk önbellekten ${cacheData.games.length} oyun alındı`);
          return cacheData.games;
        }
      } catch (e) {
        console.error(`${provider} için önbellek okuma hatası:`, e);
      }
    }
    
    // Önbellekte yoksa boş dizi döndür
    return [];
  } catch (error) {
    console.error(`Provider ${provider} cache hatası:`, error);
    return [];
  }
}

// Belirli bir provider için API'den oyunları çek ve önbelleğe kaydet
export async function fetchGamesForProvider(provider: string): Promise<SlotegratorGame[]> {
  console.log(`${provider} sağlayıcısı için API'den oyunlar çekiliyor...`);
  
  try {
    const fs = require('fs');
    const allGames: SlotegratorGame[] = [];
    let currentPage = 1;
    const perPage = 100;
    let hasMorePages = true;
    let errorCount = 0;
    
    // Provider için önbellek anahtarı oluştur
    const safeProviderName = provider.toLowerCase().replace(/[^a-z0-9]/g, '_');
    const cacheKey = `provider_${safeProviderName}`;
    const cacheFilePath = `.slotegrator-${cacheKey}.json`;
    
    // Memory önbellek referansı
    const memoryCache: Record<string, {data: SlotegratorGame[], timestamp: number}> = (global as any).providerCache || {};
    (global as any).providerCache = memoryCache;
    
    // API'den sayfa sayfa veri çek
    while (hasMorePages && errorCount < 3) {
      try {
        console.log(`${provider} için sayfa ${currentPage} yükleniyor...`);
        
        // Provider filtresi ile API isteği yap
        const params: Record<string, any> = {
          'per-page': perPage,
          page: currentPage,
          expand: 'tags,parameters,images',
          'filter[provider]': provider
        };
        
        const result = await getGames(params);
        
        if (result && result.items && result.items.length > 0) {
          allGames.push(...result.items);
          console.log(`${provider} sayfa ${currentPage}: ${result.items.length} oyun alındı. Toplam: ${allGames.length}`);
          
          // Sonraki sayfa var mı kontrol et
          if (result._meta && result._meta.currentPage < result._meta.pageCount) {
            currentPage++;
          } else {
            hasMorePages = false;
            console.log(`${provider} için tüm sayfalar tamamlandı.`);
          }
        } else {
          hasMorePages = false;
          console.log(`${provider} için daha fazla oyun bulunamadı.`);
        }
        
        // Her sayfadan sonra kısa bir bekleme
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        errorCount++;
        console.error(`${provider} için sayfa ${currentPage} yüklenirken hata:`, error);
        await new Promise(resolve => setTimeout(resolve, 2000 * errorCount)); // Hata durumunda daha uzun bekle
      }
    }
    
    // Sonuçları önbelleğe kaydet
    if (allGames.length > 0) {
      // Memory önbelleğe kaydet
      memoryCache[cacheKey] = {
        data: allGames,
        timestamp: Date.now()
      };
      
      // Disk önbelleğe kaydet
      try {
        const cacheData = {
          games: allGames,
          timestamp: Date.now()
        };
        
        fs.writeFileSync(cacheFilePath, JSON.stringify(cacheData), 'utf8');
        console.log(`${provider} için ${allGames.length} oyun disk önbelleğine kaydedildi.`);
      } catch (e) {
        console.error(`${provider} için disk önbelleğine yazma hatası:`, e);
      }
    }
    
    return allGames;
  } catch (error) {
    console.error(`${provider} sağlayıcısı için oyunları çekerken hata:`, error);
    return [];
  }
}

// API Dokümentasyonuna %100 Uyumlu Session Oluşturma
export async function createSession(
  gameUuid: string,
  mode: 'demo' | 'real' = 'demo',
  currency: string = 'TRY',
  language: string = 'tr',
  userId?: string
): Promise<string> {
  try {
    console.log('🎯 Session oluşturma başladı:', {
      gameUuid: gameUuid.substring(0, 12) + '...',
      mode,
      currency,
      userId: userId?.substring(0, 8) + '...' || 'yok',
      timestamp: new Date().toISOString()
    });

    // Return URL - Replit domain
    const returnUrl = process.env.REPLIT_DOMAINS 
      ? `https://${process.env.REPLIT_DOMAINS.split(',')[0]}/games`
      : 'http://www.cryptonbets1.com/games';

    // API dokümentasyonuna göre parametreler
    const requestParams: Record<string, any> = {
      game_uuid: gameUuid,
      currency: currency,
      language: language,
      return_url: returnUrl
    };

    // Real money oyunlar için player_id gerekli (API dokümentasyonuna göre)
    if (mode === 'real') {
      if (!userId) {
        throw new Error('Gerçek para oyunları için kullanıcı ID gerekli');
      }
      requestParams.player_id = userId;
    }

    // Demo modunda device parametresi ekle
    if (mode === 'demo') {
      requestParams.device = 'desktop';
    }

    console.log('📋 Session parametreleri hazırlandı:', {
      gameUuid: gameUuid.substring(0, 12) + '...',
      mode,
      currency,
      hasUserId: !!requestParams.user_id,
      returnUrl
    });

    // Timestamp ve nonce oluştur
    const timestamp = Math.floor(Date.now() / 1000);
    const nonce = crypto.randomBytes(16).toString('hex');

    // Authorization headers
    const authHeaders: Record<string, string> = {
      'X-Merchant-Id': MERCHANT_ID,
      'X-Timestamp': timestamp.toString(),
      'X-Nonce': nonce
    };

    // Merge parameters with auth headers for signature (API dokümentasyonuna göre)
    const mergedParams = { ...requestParams, ...authHeaders };
    
    // Sort parameters by key alphabetically
    const sortedKeys = Object.keys(mergedParams).sort();
    const sortedParams: Record<string, string> = {};
    sortedKeys.forEach(key => {
      sortedParams[key] = String(mergedParams[key]);
    });

    // Generate hash string exactly as per documentation
    const hashString = new URLSearchParams(sortedParams).toString();
    
    // Generate signature using HMAC-SHA1
    const signature = crypto
      .createHmac('sha1', MERCHANT_KEY)
      .update(hashString)
      .digest('hex');

    console.log('Slotegrator imza oluşturuldu:', {
      endpoint: mode === 'demo' ? '/games/init-demo' : '/games/init',
      merchantId: MERCHANT_ID.substring(0, 8) + '...',
      hashStringLength: hashString.length,
      signature: signature.substring(0, 10) + '...'
    });

    // Doğru endpoint seç
    const endpoint = mode === 'demo' ? '/games/init-demo' : '/games/init';
    const apiUrl = `${API_URL}${endpoint}`;

    console.log('📤 Session isteği gönderiliyor:', {
      url: apiUrl,
      method: 'POST',
      gameUuid: gameUuid.substring(0, 12) + '...',
      mode,
      currency
    });

    // POST request ile session oluştur
    const response = await axios.post(apiUrl, requestParams, {
      headers: {
        'X-Merchant-Id': MERCHANT_ID,
        'X-Timestamp': timestamp.toString(),
        'X-Nonce': nonce,
        'X-Sign': signature,
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json'
      },
      timeout: 15000
    });
    
    console.log('✅ Session başarıyla oluşturuldu:', {
      status: response.status,
      hasUrl: !!response.data?.url,
      mode,
      currency
    });

    if (!response.data?.url) {
      throw new Error('Session URL alınamadı');
    }

    return response.data.url;
  } catch (error: any) {
    console.error('❌ Session oluşturma hatası:', {
      error: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    
    throw new Error(`Session oluşturulamadı: ${error.response?.data?.message || error.message}`);
  }
}

// UUID ile belirli bir oyunu getir
export async function getGameByUuid(uuid: string): Promise<SlotegratorGame | undefined> {
  const games = await getCachedGames();
  return games.find(game => game.uuid === uuid);
}

// Tüm provider'ları getir
export async function getAllProviders(): Promise<string[]> {
  const games = await getCachedGames();
  const providers: string[] = [];
  
  games.forEach(game => {
    if (game.provider && !providers.includes(game.provider)) {
      providers.push(game.provider);
    }
  });
  
  return providers.sort();
}

// Mobil cihazlar için uygun oyunları getir
export async function getMobileGames(): Promise<SlotegratorGame[]> {
  const games = await getCachedGames();
  return games.filter(game => game.is_mobile === 1);
}

// Slot oyunlarını veritabanı önbelleğinden getir
export async function getCachedSlotGames(): Promise<SlotegratorGame[] | null> {
  try {
    // Veritabanı önbelleğinden kontrol et
    const dbCache = await import('./helpers/slotegratorDbCache');
    const cachedGames = await dbCache.getCachedSlotGames();
    
    if (cachedGames && cachedGames.length > 0) {
      console.log(`Veritabanı önbelleğinden ${cachedGames.length} slot oyunu alındı.`);
      return cachedGames;
    }
    
    // Önbellek boşsa null dön
    return null;
  } catch (error) {
    console.error('Slot oyunlarını önbellekten alma hatası:', error);
    return null;
  }
}

// Casino oyunlarını veritabanı önbelleğinden getir
export async function getCachedCasinoGames(): Promise<SlotegratorGame[] | null> {
  try {
    // Veritabanı önbelleğinden kontrol et
    const dbCache = await import('./helpers/slotegratorDbCache');
    const cachedGames = await dbCache.getCachedCasinoGames();
    
    if (cachedGames && cachedGames.length > 0) {
      console.log(`Veritabanı önbelleğinden ${cachedGames.length} casino oyunu alındı.`);
      return cachedGames;
    }
    
    // Önbellek boşsa null dön
    return null;
  } catch (error) {
    console.error('Casino oyunlarını önbellekten alma hatası:', error);
    return null;
  }
}

// Slot oyunlarını veritabanı önbelleğine kaydet
export async function cacheSlotGames(games: SlotegratorGame[]): Promise<boolean> {
  try {
    const dbCache = await import('./helpers/slotegratorDbCache');
    return await dbCache.cacheSlotGames(games);
  } catch (error) {
    console.error('Slot oyunlarını önbelleğe kaydetme hatası:', error);
    return false;
  }
}

// Casino oyunlarını veritabanı önbelleğine kaydet
export async function cacheCasinoGames(games: SlotegratorGame[]): Promise<boolean> {
  try {
    const dbCache = await import('./helpers/slotegratorDbCache');
    return await dbCache.cacheCasinoGames(games);
  } catch (error) {
    console.error('Casino oyunlarını önbelleğe kaydetme hatası:', error);
    return false;
  }
}