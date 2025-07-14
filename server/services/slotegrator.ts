import crypto from 'crypto';
import { storage } from '../storage';

const MERCHANT_ID = process.env.SLOTEGRATOR_MERCHANT_ID || '';
const MERCHANT_KEY = process.env.SLOTEGRATOR_MERCHANT_KEY || '';
const BASE_URL = 'https://api.slotegrator.com/api/index.php/v1';

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

export type SlotegratorGamesList = {
  items: SlotegratorGame[];
  _meta?: {
    totalCount: number;
    pageCount: number;
    currentPage: number;
    perPage: number;
  };
};

let cachedGames: SlotegratorGame[] = [];
let cacheTimestamp = 0;
const CACHE_DURATION = 30 * 60 * 1000; // 30 dakika

export function generateSignature(requestPath: string, requestParams: Record<string, any> = {}): { signature: string; headers: Record<string, string> } {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  
  const paramsString = Object.keys(requestParams)
    .sort()
    .map(key => `${key}=${requestParams[key]}`)
    .join('&');
  
  const baseString = `${requestPath}${paramsString}${timestamp}${nonce}`;
  const signature = crypto.createHmac('sha1', MERCHANT_KEY).update(baseString).digest('hex');
  
  return {
    signature,
    headers: {
      'X-Merchant-Id': MERCHANT_ID,
      'X-Timestamp': timestamp,
      'X-Nonce': nonce
    }
  };
}

export async function getGames(
  page: number = 1,
  perPage: number = 50,
  gameType?: string
): Promise<SlotegratorGamesList> {
  // Check if API is disabled in development
  if (process.env.DISABLE_SLOTEGRATOR_API === 'true') {
    console.log('🔧 Slotegrator API disabled - returning mock data');
    return getMockGames(page, perPage, gameType);
  }

  try {
    const requestPath = '/games';
    const requestParams: Record<string, any> = {
      page,
      'per-page': perPage
    };
    
    if (gameType) {
      requestParams.type = gameType;
    }
    
    const { signature, headers } = generateSignature(requestPath, requestParams);
    
    const queryString = Object.keys(requestParams)
      .map(key => `${key}=${encodeURIComponent(requestParams[key])}`)
      .join('&');
    
    const url = `${BASE_URL}${requestPath}?${queryString}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        ...headers,
        'X-Signature': signature,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Slotegrator API error:', error);
    return { items: [] };
  }
}

export async function getCachedGames(forceRefresh = false): Promise<SlotegratorGame[]> {
  const now = Date.now();
  
  if (!forceRefresh && cachedGames.length > 0 && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedGames;
  }
  
  // İlk olarak file cache'den yükle
  try {
    const fs = await import('fs');
    const cacheFile = '.slotegrator-cache.json';
    
    if (fs.existsSync(cacheFile)) {
      const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      
      if (cacheData.games && Array.isArray(cacheData.games)) {
        const fileGames = cacheData.games;
        console.log(`⚡ PERFORMANCE CACHE API - Ultra-fast loading`);
        console.log(`Cache'den ${fileGames.length} oyun yüklendi`);
        
        // Pragmatic Play kontrolü
        const pragmaticCount = fileGames.filter((game: any) => 
          game.provider?.toLowerCase().includes('pragmatic')
        ).length;
        
        if (pragmaticCount > 0) {
          console.log(`🎰 Pragmatic Play oyunları bulundu: ${pragmaticCount} adet`);
        }
        
        cachedGames = fileGames;
        cacheTimestamp = now;
        return fileGames;
      }
    }
  } catch (error) {
    console.log('File cache okuma hatası:', error);
  }
  
  try {
    console.log('Refreshing games cache...');
    const allGames: SlotegratorGame[] = [];
    let page = 1;
    const perPage = 100;
    
    while (page <= 50) {
      const result = await getGames(page, perPage);
      
      if (!result.items || result.items.length === 0) {
        break;
      }
      
      allGames.push(...result.items);
      
      if (result._meta && page >= result._meta.pageCount) {
        break;
      }
      
      page++;
    }
    
    cachedGames = allGames;
    cacheTimestamp = now;
    
    console.log(`Cache refreshed with ${allGames.length} games`);
    return allGames;
  } catch (error) {
    console.error('Slotegrator API error:', error);
    
    // Fallback to file cache if available
    try {
      const fs = await import('fs');
      const cacheFile = '.slotegrator-cache.json';
      
      if (fs.existsSync(cacheFile)) {
        const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
        if (cacheData.games && Array.isArray(cacheData.games)) {
          console.log(`Fallback: File cache'den ${cacheData.games.length} oyun yüklendi`);
          cachedGames = cacheData.games;
          cacheTimestamp = now;
          return cacheData.games;
        }
      }
    } catch (fileError) {
      console.log('File cache fallback başarısız');
    }
    
    return cachedGames;
  }
}

export async function getGameByUuid(uuid: string): Promise<SlotegratorGame | undefined> {
  const games = await getCachedGames();
  return games.find(game => game.uuid === uuid);
}

export async function getGamesByProvider(provider: string): Promise<SlotegratorGame[]> {
  const games = await getCachedGames();
  return games.filter(game => 
    game.provider && game.provider.toLowerCase().includes(provider.toLowerCase())
  );
}

export async function getSlotGames(): Promise<SlotegratorGame[]> {
  const games = await getCachedGames();
  return games.filter(game => 
    game.type === 'slot' || game.type === 'slots'
  );
}

export async function getCasinoGames(): Promise<SlotegratorGame[]> {
  const games = await getCachedGames();
  
  // Casino oyunlarını daha geniş kriterlere göre filtrele
  return games.filter(game => {
    const gameType = (game.type || '').toLowerCase();
    const gameName = (game.name || '').toLowerCase();
    
    // Casino table games, live dealer games, and classic casino games
    const casinoKeywords = [
      'table', 'live', 'roulette', 'blackjack', 'baccarat', 'poker', 
      'holdem', 'casino', 'craps', 'sic bo', 'dice', 'wheel',
      'bingo', 'lottery', 'keno', 'scratch', 'card'
    ];
    
    // Check if it has table flag or casino-related type/name
    return game.has_tables === 1 || 
           casinoKeywords.some(keyword => 
             gameType.includes(keyword) || gameName.includes(keyword)
           ) ||
           // Some providers mark casino games differently
           (game.provider && ['Evolution', 'Pragmatic Play Live', 'Ezugi', 'Authentic Gaming'].includes(game.provider));
  });
}

export async function getAllProviders(): Promise<string[]> {
  const games = await getCachedGames();
  const providers = new Set<string>();
  
  games.forEach(game => {
    if (game.provider) {
      providers.add(game.provider);
    }
  });
  
  return Array.from(providers).sort();
}

export async function getMobileGames(): Promise<SlotegratorGame[]> {
  const games = await getCachedGames();
  return games.filter(game => game.is_mobile === 1);
}

// Mock games for development when API is disabled
function getMockGames(page: number = 1, perPage: number = 50, gameType?: string): SlotegratorGamesList {
  const mockGames: SlotegratorGame[] = [
    {
      uuid: 'demo-sweet-bonanza',
      name: 'Sweet Bonanza',
      image: '/images/games/sweet-bonanza.jpg',
      type: 'slot',
      provider: 'Pragmatic Play',
      technology: 'html5',
      has_lobby: 1,
      is_mobile: 1,
      has_freespins: 1,
      parameters: {
        rtp: 96.48,
        volatility: 'high',
        reels_count: '6',
        lines_count: 'cluster'
      }
    },
    {
      uuid: 'demo-gates-olympus',
      name: 'Gates of Olympus',
      image: '/images/games/gates-olympus.jpg',
      type: 'slot',
      provider: 'Pragmatic Play',
      technology: 'html5',
      has_lobby: 1,
      is_mobile: 1,
      has_freespins: 1,
      parameters: {
        rtp: 96.5,
        volatility: 'high',
        reels_count: '6',
        lines_count: 20
      }
    },
    {
      uuid: 'demo-aviator',
      name: 'Aviator',
      image: '/images/games/aviator.jpg',
      type: 'crash',
      provider: 'Spribe',
      technology: 'html5',
      has_lobby: 1,
      is_mobile: 1,
      parameters: {
        rtp: 97,
        volatility: 'medium'
      }
    },
    {
      uuid: 'demo-big-bass-bonanza',
      name: 'Big Bass Bonanza',
      image: '/images/games/big-bass-bonanza.jpg',
      type: 'slot',
      provider: 'Pragmatic Play',
      technology: 'html5',
      has_lobby: 1,
      is_mobile: 1,
      has_freespins: 1,
      parameters: {
        rtp: 96.71,
        volatility: 'high',
        reels_count: '5',
        lines_count: 10
      }
    },
    {
      uuid: 'demo-sugar-rush',
      name: 'Sugar Rush',
      image: '/images/games/sugar-rush.jpg',
      type: 'slot',
      provider: 'Pragmatic Play',
      technology: 'html5',
      has_lobby: 1,
      is_mobile: 1,
      has_freespins: 1,
      parameters: {
        rtp: 96.5,
        volatility: 'high',
        reels_count: '7',
        lines_count: 'cluster'
      }
    }
  ];

  // Filter by game type if specified
  let filteredGames = mockGames;
  if (gameType) {
    filteredGames = mockGames.filter(game => game.type === gameType);
  }

  // Paginate
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedGames = filteredGames.slice(startIndex, endIndex);

  return {
    items: paginatedGames,
    _meta: {
      totalCount: filteredGames.length,
      pageCount: Math.ceil(filteredGames.length / perPage),
      currentPage: page,
      perPage: perPage
    }
  };
}

export async function refreshCache(): Promise<void> {
  await getCachedGames(true);
}

// Game session creation for both demo and real money
export async function createSession(
  gameUuid: string,
  userId: number,
  playerName: string,
  currency: string = 'TRY',
  language: string = 'tr',
  returnUrl?: string,
  mode: 'real' | 'demo' = 'demo',
  ipAddress?: string,
  device?: string
): Promise<any> {
  try {
    const requestPath = '/sessions';
    const requestParams = {
      game: gameUuid,
      player: userId.toString(),
      player_name: playerName,
      currency,
      language,
      return_url: returnUrl || '',
      mode,
      ip: ipAddress || '127.0.0.1',
      device: device || 'desktop'
    };
    
    const { signature, headers } = generateSignature(requestPath, requestParams);
    
    const response = await fetch(`${BASE_URL}${requestPath}`, {
      method: 'POST',
      headers: {
        ...headers,
        'X-Signature': signature,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestParams)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Session creation error:', error);
    throw error;
  }
}

// Export types for compatibility
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

// Stub gameSessionManager for compatibility
export const gameSessionManager = {
  createSession: (userId: number, gameUuid: string, initialBalance: number, currency: string = 'TRY') => {
    return {
      sessionId: crypto.randomBytes(16).toString('hex'),
      userId,
      gameUuid,
      balance: initialBalance,
      currency,
      startTime: new Date(),
      lastActivity: new Date(),
      status: 'active' as const,
      totalBets: 0,
      totalWins: 0,
      roundsPlayed: 0
    };
  },
  getSession: (sessionId: string) => null,
  placeBet: async (sessionId: string, betAmount: number, roundId: string) => null,
  processWin: async (sessionId: string, transactionId: string, winAmount: number) => false,
  endSession: (sessionId: string) => {},
  getJackpots: () => [],
  getSessionStats: (sessionId: string) => null
};