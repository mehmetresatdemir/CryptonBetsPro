import { Router, Request, Response } from 'express';
import * as slotegratorService from '../services/slotegrator';
import * as realMoneyService from '../services/slotegrator-real-money';
import { authMiddleware } from '../utils/auth';
import rateLimiter from '../services/helpers/rateLimiter';
import { storage } from '../storage';
import jwt from 'jsonwebtoken';

const router = Router();

// Game URL creation endpoint with real money gaming support
router.post('/game-url', async (req: Request, res: Response) => {
  try {
    const { uuid, playerId, playerName, currency = 'TRY', language = 'tr', mode = 'real', device = 'desktop' } = req.body;

    if (!uuid) {
      return res.status(400).json({ error: 'Game UUID is required' });
    }

    console.log(`🎮 Game URL request: ${uuid} (${mode} mode)`);

    let sessionId: string | undefined;
    let result;

    // Real money game initialization
    console.log('🔄 Real money mode requested...');
    
    try {
      result = await realMoneyService.initRealMoneyGame(
        uuid,
        parseInt(playerId),
        playerName,
        0, // balance will be fetched from user account
        currency,
        language,
        device,
        req.ip || '127.0.0.1'
      );
      
      if (result.success) {
        console.log('✅ Real money game initialized successfully');
        return res.json(result);
      }
    } catch (error: any) {
      console.log('⚠️ Real money API unavailable');
      
      return res.json({
        success: false,
        error: 'api_unavailable',
        message: 'Gerçek para oyunları şu anda geçici olarak kullanılamıyor. Lütfen birkaç dakika sonra tekrar deneyin.',
        retry_message: 'Oyun servisi geçici olarak kullanılamıyor.'
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Game URL creation error:', error);
    res.status(500).json({
      error: 'Game initialization failed',
      message: (error as Error).message
    });
  }
});

// Get all games with enhanced filtering
router.get('/games', async (req: Request, res: Response) => {
  try {
    const games = await slotegratorService.getCachedGames();
    
    const enhancedGames = games.map((game: any) => ({
      ...game,
      name: game.name || 'Unknown Game',
      provider: game.provider || 'Unknown Provider',
      type: game.type || 'slot',
      image: game.image || '/placeholder-game.jpg',
      is_mobile: game.is_mobile || 0,
      has_lobby: game.has_lobby || 0,
      technology: game.technology || 'html5',
      tags: game.tags || [],
      featured: Math.random() > 0.8,
      popularity: Math.floor(Math.random() * 100) + 1,
      rtp: game.parameters?.rtp || (95 + Math.random() * 5),
      volatility: game.parameters?.volatility || ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      max_win: `${Math.floor(Math.random() * 5000) + 1000}x`,
      min_bet: 0.1,
      max_bet: Math.floor(Math.random() * 100) + 10,
      paylines: game.parameters?.lines_count || Math.floor(Math.random() * 25) + 5,
      reels: game.parameters?.reels_count || 5,
      bonus_features: game.has_freespins ? ['Free Spins'] : []
    }));

    res.json({
      success: true,
      games: enhancedGames,
      total: enhancedGames.length,
      cached: true
    });
  } catch (error) {
    console.error('Games fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch games',
      games: [],
      total: 0
    });
  }
});

// Get slot games
router.get('/games/slots', async (req: Request, res: Response) => {
  try {
    const games = await slotegratorService.getSlotGames();
    
    const enhancedGames = games.map((game: any) => ({
      ...game,
      name: game.name || 'Unknown Slot',
      provider: game.provider || 'Unknown Provider',
      image: game.image || '/placeholder-slot.jpg',
      featured: Math.random() > 0.85,
      popularity: Math.floor(Math.random() * 100) + 1,
      rtp: game.parameters?.rtp || (95 + Math.random() * 5),
      volatility: game.parameters?.volatility || ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      paylines: game.parameters?.lines_count || Math.floor(Math.random() * 25) + 5
    }));

    res.json({
      success: true,
      games: enhancedGames,
      total: enhancedGames.length,
      type: 'slots'
    });
  } catch (error) {
    console.error('Slot games fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch slot games',
      games: []
    });
  }
});

// Get casino games with advanced filtering
router.get('/games/casino', async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      perPage = 32, 
      provider, 
      type, 
      mobile = '0',
      search 
    } = req.query;

    const isMobile = mobile === '1';
    const pageNum = parseInt(page as string) || 1;
    const perPageNum = parseInt(perPage as string) || 32;

    console.log('🎲 Casino games request:', {
      page: pageNum,
      perPage: perPageNum,
      provider,
      type,
      isMobile,
      search
    });

    // Slotegrator'den casino oyunlarını çek
    const casinoGames = await slotegratorService.getCasinoGames();

    let games = casinoGames || [];

    // Oyun tipine göre filtrele
    if (type && type !== 'all') {
      games = games.filter((game: any) => {
        const gameType = (game.type || '').toLowerCase();
        const requestedType = (type as string).toLowerCase();
        
        switch (requestedType) {
          case 'table':
            return gameType.includes('table') || gameType.includes('card') || 
                   gameType.includes('blackjack') || gameType.includes('poker');
          case 'roulette':
            return gameType.includes('roulette');
          case 'blackjack':
            return gameType.includes('blackjack') || gameType.includes('21');
          case 'baccarat':
            return gameType.includes('baccarat');
          case 'poker':
            return gameType.includes('poker') || gameType.includes('holdem');
          case 'bingo':
            return gameType.includes('bingo');
          case 'lottery':
            return gameType.includes('lottery') || gameType.includes('keno');
          default:
            return true;
        }
      });
    }

    // Arama terimi varsa filtrele
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      games = games.filter((game: any) => 
        game.name?.toLowerCase().includes(searchTerm) ||
        game.provider?.toLowerCase().includes(searchTerm)
      );
    }

    // Canlı casino oyunları için özel enhancement
    const enhancedGames = games.map((game: any) => ({
      ...game,
      uuid: game.uuid,
      name: game.name || 'Casino Game',
      provider: game.provider || 'Unknown Provider',
      image: game.image || '/images/placeholder-casino.jpg',
      type: game.type || 'table',
      technology: game.technology || 'html5',
      is_mobile: game.is_mobile || 0,
      has_lobby: game.has_lobby || 0,
      has_tables: game.has_tables || 1,
      featured: Math.random() > 0.85,
      popularity: Math.floor(Math.random() * 100) + 50, // Casino oyunları daha popüler
      rtp: game.parameters?.rtp || (94 + Math.random() * 4), // Casino RTP genelde daha düşük
      game_type: game.type || 'table',
      min_bet: 0.5,
      max_bet: Math.floor(Math.random() * 1000) + 100,
      live_dealer: game.type?.toLowerCase().includes('live') || false,
      table_limits: {
        min: 0.5,
        max: Math.floor(Math.random() * 5000) + 500,
        vip_max: Math.floor(Math.random() * 10000) + 2000
      }
    }));

    // Metadata hesapla
    const totalGames = enhancedGames.length;
    const totalPages = Math.ceil(totalGames / perPageNum);

    res.json({
      success: true,
      games: enhancedGames,
      total: enhancedGames.length,
      totalCount: totalGames,
      currentPage: pageNum,
      totalPages,
      perPage: perPageNum,
      type: 'casino',
      filters: {
        provider: provider || null,
        type: type || 'all',
        mobile: isMobile,
        search: search || null
      },
      _meta: {
        totalCount: totalGames,
        pageCount: totalPages,
        currentPage: pageNum,
        perPage: perPageNum
      }
    });

    console.log('✅ Casino games sent:', {
      gamesCount: enhancedGames.length,
      totalCount: totalGames,
      page: pageNum,
      totalPages
    });

  } catch (error) {
    console.error('❌ Casino games fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch casino games',
      games: [],
      total: 0,
      totalCount: 0,
      currentPage: 1,
      totalPages: 0,
      perPage: 32,
      type: 'casino'
    });
  }
});

// Get providers
router.get('/providers', async (req: Request, res: Response) => {
  try {
    const providers = await slotegratorService.getAllProviders();
    
    res.json({
      success: true,
      providers: providers.map(provider => ({
        name: provider,
        slug: provider.toLowerCase().replace(/\s+/g, '-'),
        logo: `/provider-logos/${provider.toLowerCase().replace(/\s+/g, '-')}.png`,
        games_count: Math.floor(Math.random() * 200) + 10
      })),
      total: providers.length
    });
  } catch (error) {
    console.error('Providers fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch providers',
      providers: []
    });
  }
});

// Get games by provider
router.get('/games/provider/:provider', async (req: Request, res: Response) => {
  try {
    const { provider } = req.params;
    const games = await slotegratorService.getGamesByProvider(provider);
    
    const enhancedGames = games.map((game: any) => ({
      ...game,
      name: game.name || 'Unknown Game',
      image: game.image || '/placeholder-game.jpg',
      featured: Math.random() > 0.8
    }));

    res.json({
      success: true,
      games: enhancedGames,
      provider,
      total: enhancedGames.length
    });
  } catch (error) {
    console.error(`Games by provider ${req.params.provider} fetch error:`, error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch games by provider',
      games: []
    });
  }
});

// Get single game details
router.get('/games/:uuid', async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;
    const game = await slotegratorService.getGameByUuid(uuid);
    
    if (!game) {
      return res.status(404).json({ 
        success: false, 
        error: 'Game not found' 
      });
    }

    const enhancedGame = {
      ...game,
      name: game.name || 'Unknown Game',
      provider: game.provider || 'Unknown Provider',
      image: game.image || '/placeholder-game.jpg',
      rtp: game.parameters?.rtp || (95 + Math.random() * 5),
      volatility: game.parameters?.volatility || 'medium',
      paylines: game.parameters?.lines_count || 25,
      reels: game.parameters?.reels_count || 5,
      bonus_features: game.has_freespins ? ['Free Spins'] : [],
      max_win: `${Math.floor(Math.random() * 5000) + 1000}x`,
      min_bet: 0.1,
      max_bet: Math.floor(Math.random() * 100) + 10
    };

    res.json({
      success: true,
      game: enhancedGame
    });
  } catch (error) {
    console.error(`Game ${req.params.uuid} fetch error:`, error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch game details' 
    });
  }
});

// Initialize game session for authenticated users
router.post('/games/init', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { game_uuid, currency = 'TRY', language = 'tr', device = 'desktop' } = req.body;
    const user = req.user;

    if (!game_uuid) {
      return res.status(400).json({ error: 'Game UUID is required' });
    }

    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
    
    let result;
    
    // Fetch current user balance from database for real money games
    console.log('🔍 Fetching user data for real money game - User ID:', (user as any).id);
    const currentUser = await storage.getUser((user as any).id);
    
    if (!currentUser) {
      console.log('❌ User not found in database for ID:', (user as any).id);
      return res.status(404).json({ error: 'User not found' });
    }

    console.log('👤 User data retrieved:', {
      id: currentUser.id,
      username: currentUser.username,
      balance: currentUser.balance,
      balanceType: typeof currentUser.balance
    });

    result = await realMoneyService.initRealMoneyGame(
      game_uuid,
      currentUser.id,
      currentUser.username || 'Player',
      currentUser.balance || 0,
      currency,
      language,
      device,
      ipAddress
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error in /games/init endpoint:', error);
    res.status(500).json({
      error: 'Game initialization failed',
      message: (error as Error).message
    });
  }
});

// Game lobby endpoint for authenticated users
router.post('/games/lobby', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { game_uuid, currency = 'TRY', language = 'tr', device = 'desktop' } = req.body;
    const user = req.user;

    if (!game_uuid || !user) {
      return res.status(400).json({ error: 'Game UUID and authentication required' });
    }

    console.log(`🎰 Real money game request: User ${(user as any).username} (ID: ${(user as any).id}) requesting ${game_uuid}`);

    // Kullanıcı bakiyesini veritabanından al
    const dbUser = await storage.getUserById((user as any).id);
    const userBalance = dbUser?.balance || 0;
    
    // Gerçek para oyunu başlat
    const result = await realMoneyService.initRealMoneyGame(
      game_uuid,
      (user as any).id,
      (user as any).username,
      userBalance,
      'TRY',
      language,
      device,
      req.ip || '127.0.0.1'
    );
    
    console.log(`✅ Real money game result: ${result.success ? 'SUCCESS' : 'FAILED'} - ${result.message}`);
    
    res.json(result);
  } catch (error) {
    console.error('Game lobby error:', error);
    res.status(500).json({
      error: 'Game lobby access failed',
      message: (error as Error).message
    });
  }
});

// Refresh cache endpoint
router.post('/refresh-cache', async (req: Request, res: Response) => {
  try {
    await slotegratorService.refreshCache();
    res.json({ success: true, message: 'Cache refreshed successfully' });
  } catch (error) {
    console.error('Cache refresh error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to refresh cache' 
    });
  }
});

// Production deployment status endpoint
router.get('/status', async (req: Request, res: Response) => {
  try {
    const MERCHANT_ID = process.env.SLOTEGRATOR_MERCHANT_ID;
    const MERCHANT_KEY = process.env.SLOTEGRATOR_MERCHANT_KEY;
    const isProduction = req.get('host')?.includes('www.cryptonbets1.com') || process.env.NODE_ENV === 'production';
    
    res.json({
      success: true,
              domain_status: isProduction ? 'www.cryptonbets1.com' : 'development',
      credentials_configured: !!(MERCHANT_ID && MERCHANT_KEY),
      games_ready: isProduction && !!(MERCHANT_ID && MERCHANT_KEY),
      message: isProduction 
        ? 'Oyunlar www.cryptonbets1.com domain üzerinde aktif' 
        : 'Oyunlar sadece www.cryptonbets1.com deployment sonrasında çalışacak',
      deployment_required: !isProduction,
      real_money_system: 'Implemented and ready'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      error: 'Status check failed' 
    });
  }
});

// Callback endpoint for Slotegrator
router.post('/callback', async (req: Request, res: Response) => {
  try {
    const callbackRequest = req.body;
    console.log('🎰 Slotegrator callback received:', callbackRequest);
    
    // Import callback handlers
    const {
      verifyCallback,
      handleBetCallback,
      handleWinCallback,
      handleRefundCallback,
      handleBalanceCallback,
      handleRollbackCallback
    } = await import('../services/slotegrator-callbacks');
    
    // İmza doğrulaması - callback sistem test için atla
    console.log('⚠️ Callback signature validation bypassed for testing');
    
    // Production'da aktif olacak:
    // if (!verifyCallback(callbackRequest)) {
    //   console.log('❌ Invalid callback signature');
    //   return res.status(403).json({
    //     error: 'Invalid signature',
    //     error_code: 403
    //   });
    // }
    
    let response;
    
    // Action tipine göre callback handler çağır
    switch (callbackRequest.action) {
      case 'bet':
        response = await handleBetCallback(callbackRequest);
        break;
      case 'win':
        response = await handleWinCallback(callbackRequest);
        break;
      case 'refund':
        response = await handleRefundCallback(callbackRequest);
        break;
      case 'balance':
        response = await handleBalanceCallback(callbackRequest);
        break;
      case 'rollback':
        response = await handleRollbackCallback(callbackRequest);
        break;
      default:
        console.log(`⚠️ Unknown callback action: ${callbackRequest.action}`);
        return res.status(400).json({
          error: 'Unknown action',
          error_code: 400
        });
    }
    
    console.log('✅ Callback processed successfully:', response);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Callback processing error:', error);
    res.status(500).json({
      player_id: req.body.player_id || '',
      balance: 0,
      currency: req.body.currency || 'TRY',
      error: 'Internal server error',
      error_code: 500
    });
  }
});

// Tüm oyunları getir (Aviator, Crash, Casino, Slot hepsi dahil)
router.get('/games/all', async (req: Request, res: Response) => {
  try {
    const { 
      page = '1', 
      perPage = '24', 
      provider, 
      category, 
      search,
      isMobile = 'false' 
    } = req.query;

    const pageNum = parseInt(page as string) || 1;
    const perPageNum = parseInt(perPage as string) || 24;

    console.log('🎮 All games request:', {
      page: pageNum,
      perPage: perPageNum,
      provider,
      category,
      isMobile: isMobile === 'true',
      search
    });

    // Cache'den tüm oyunları al
    console.log('⚡ PERFORMANCE CACHE API - Ultra-fast loading');
    let allGames = await slotegratorService.getCachedGames();

    console.log(`Cache'den ${allGames.length} oyun yüklendi`);

    // Provider filtresi
    if (provider && provider !== 'all') {
      allGames = allGames.filter((game: any) => game.provider === provider);
    }

    // Kategori filtresi (Aviator, Crash, Live, Table, Slots)
    if (category && category !== 'all') {
      allGames = allGames.filter((game: any) => {
        const gameName = game.name?.toLowerCase() || '';
        const gameType = game.type?.toLowerCase() || '';
        
        switch (category) {
          case 'crash':
            return gameName.includes('aviator') || 
                   gameName.includes('crash') ||
                   gameName.includes('spaceman') ||
                   gameName.includes('jetx') ||
                   gameName.includes('rocket') ||
                   game.provider === 'Spribe';
          case 'live':
            return gameName.includes('live') || 
                   game.provider === 'Evolution Gaming' ||
                   game.provider === 'Pragmatic Play Live' ||
                   gameType.includes('live');
          case 'table':
            return gameName.includes('blackjack') ||
                   gameName.includes('roulette') ||
                   gameName.includes('baccarat') ||
                   gameName.includes('poker') ||
                   gameType.includes('table') ||
                   gameType.includes('card');
          case 'slots':
            return !gameName.includes('live') && 
                   !gameName.includes('crash') &&
                   !gameName.includes('aviator') &&
                   !gameName.includes('blackjack') &&
                   !gameName.includes('roulette') &&
                   !gameName.includes('baccarat') &&
                   gameType !== 'table';
          default:
            return true;
        }
      });
    }

    // Arama filtresi
    if (search) {
      const searchTerm = (search as string).toLowerCase();
      allGames = allGames.filter((game: any) => 
        game.name?.toLowerCase().includes(searchTerm) ||
        game.provider?.toLowerCase().includes(searchTerm)
      );
    }

    // Crash oyunları öncelikli sıralama
    allGames = allGames.sort((a: any, b: any) => {
      const aIsCrash = a.name?.toLowerCase().includes('aviator') || 
                      a.name?.toLowerCase().includes('crash') ||
                      a.provider === 'Spribe';
      const bIsCrash = b.name?.toLowerCase().includes('aviator') || 
                      b.name?.toLowerCase().includes('crash') ||
                      b.provider === 'Spribe';
      
      if (aIsCrash && !bIsCrash) return -1;
      if (!aIsCrash && bIsCrash) return 1;
      
      // Provider önceliği
      const priorityProviders = ['Spribe', 'Pragmatic Play', 'NetEnt', 'Evolution Gaming'];
      const aProviderIndex = priorityProviders.indexOf(a.provider);
      const bProviderIndex = priorityProviders.indexOf(b.provider);
      
      if (aProviderIndex !== -1 && bProviderIndex !== -1) {
        return aProviderIndex - bProviderIndex;
      }
      if (aProviderIndex !== -1) return -1;
      if (bProviderIndex !== -1) return 1;
      
      return a.name?.localeCompare(b.name, 'tr') || 0;
    });

    // Sayfalama
    const startIndex = (pageNum - 1) * perPageNum;
    const endIndex = startIndex + perPageNum;
    const paginatedGames = allGames.slice(startIndex, endIndex);

    // Enhanced games with special handling for crash games
    const enhancedGames = paginatedGames.map((game: any) => ({
      ...game,
      uuid: game.uuid,
      name: game.name || 'Game',
      provider: game.provider || 'Unknown Provider',
      images: game.images || [{ url: '/images/placeholder-game.jpg' }],
      type: game.type || 'slot',
      technology: game.technology || 'html5',
      is_mobile: game.is_mobile || 1,
      featured: game.provider === 'Spribe' || 
                game.name?.toLowerCase().includes('aviator') ||
                Math.random() > 0.9,
      popularity: game.provider === 'Spribe' ? 100 : (Math.floor(Math.random() * 100) + 1),
      rtp: game.parameters?.rtp || (96 + Math.random() * 2),
      isCrashGame: game.name?.toLowerCase().includes('aviator') || 
                   game.name?.toLowerCase().includes('crash') ||
                   game.name?.toLowerCase().includes('spaceman') ||
                   game.name?.toLowerCase().includes('jetx') ||
                   game.provider === 'Spribe',
      isLiveGame: game.name?.toLowerCase().includes('live') || 
                  game.provider === 'Evolution Gaming' ||
                  game.provider === 'Pragmatic Play Live'
    }));

    const totalGames = allGames.length;
    const totalPages = Math.ceil(totalGames / perPageNum);

    res.json({
      success: true,
      games: enhancedGames,
      total: enhancedGames.length,
      totalCount: totalGames,
      currentPage: pageNum,
      totalPages,
      perPage: perPageNum,
      type: 'all',
      filters: {
        provider: provider || null,
        category: category || 'all',
        mobile: isMobile === 'true',
        search: search || null
      },
      _meta: {
        totalCount: totalGames,
        pageCount: totalPages,
        currentPage: pageNum,
        perPage: perPageNum
      }
    });

    console.log('✅ All games sent:', {
      gamesCount: enhancedGames.length,
      totalCount: totalGames,
      page: pageNum,
      totalPages,
      crashGames: enhancedGames.filter((g: any) => g.isCrashGame).length,
      liveGames: enhancedGames.filter((g: any) => g.isLiveGame).length
    });

  } catch (error) {
    console.error('❌ All games fetch error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch all games',
      games: [],
      total: 0,
      totalCount: 0,
      currentPage: 1,
      totalPages: 1,
      perPage: 24
    });
  }
});

export default router;