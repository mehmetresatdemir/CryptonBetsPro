import { Router, Request, Response } from 'express';
import * as slotegratorService from '../services/slotegrator';
import * as realMoneyService from '../services/slotegrator-real-money';
import { authMiddleware } from '../utils/auth';
import rateLimiter from '../services/helpers/rateLimiter';
import { storage } from '../storage';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const router = Router();

// ============= GAME LAUNCH ENDPOINTS =============

// Oyun URL'i alma endpoint'i (GameModal için)
router.post('/game-url', async (req: Request, res: Response) => {
  try {
    const { uuid, mode = 'demo', device = 'desktop', language = 'tr', currency = 'TRY' } = req.body;
    
    if (!uuid) {
      return res.status(400).json({ 
        success: false, 
        message: 'uuid gereklidir' 
      });
    }

    // Oyuncu bilgileri oluştur
    let playerId = `demo_player_${Date.now()}`;
    let playerName = 'Demo Player';
    
    if (mode === 'real') {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'Gerçek para oyunu için giriş yapmalısınız'
        });
      }

      try {
        const token = authHeader.substring(7);
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'cryptonbets-secret-key') as any;
        
        const user = await storage.getUser(decoded.id);
        if (!user || (user.balance || 0) <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Yetersiz bakiye. Lütfen para yatırın.'
          });
        }
        
        playerId = `user_${decoded.id}`;
        playerName = decoded.username || `Player${decoded.id}`;
      } catch (jwtError) {
        return res.status(401).json({
          success: false,
          message: 'Geçersiz token'
        });
      }
    }

    console.log('🎮 Game URL isteği:', {
      uuid: uuid.substring(0, 8) + '...',
      mode,
      device,
      language,
      currency,
      playerId,
      playerName
    });

    let sessionId: string | undefined;
    
    // Gerçek para modu için önce session oluştur
    if (mode === 'real') {
      console.log('🔄 Gerçek para modu için session oluşturuluyor...');
      const sessionResult = await slotegratorService.createSession(
        uuid,
        parseInt(playerId),
        playerName,
        currency
      );
      
      if (sessionResult?.url) {
        sessionId = 'session_created';
        console.log('✅ Session oluşturuldu');
      } else {
        console.log('❌ Session oluşturulamadı, demo moduna geçiliyor');
        mode = 'demo';
      }
    }

    // Real money gaming için yeni servis kullan
    if (mode === 'real') {
      result = await realMoneyService.initRealMoneyGame(
        game_uuid,
        user.id,
        user.username || 'Player',
        user.balance || 0,
        currency,
        language,
        device,
        ipAddress
      );
    } else {
      result = await realMoneyService.initDemoGame(
        game_uuid,
        language,
        device
      );
    }

    res.json(result);

  } catch (error: any) {
    console.error('❌ Game URL hatası:', error);
    
    // Production credentials needed for real money gaming
    if (req.body.mode === 'real' && (error.message?.includes('Forbidden') || error.message?.includes('403'))) {
      return res.status(200).json({ 
        success: false, 
        message: 'Gerçek para oyunları için production Slotegrator credentials gerekli. Demo mod kullanılabilir.',
        needsProductionCredentials: true,
        mode: 'demo_fallback'
      });
    }
    
    res.status(500).json({ 
      success: false, 
      message: `Oyun URL'i alınamadı: ${error.message}`
    });
  }
});

// Eski endpoint uyumluluğu için
router.post('/init-game', async (req: Request, res: Response) => {
  try {
    const { game_uuid } = req.body;
    const gameMode = req.body.mode || 'demo';
    const gameDevice = req.body.device || 'desktop'; 
    const gameLanguage = req.body.language || 'tr';
    const gameCurrency = req.body.currency || 'TRY';
    
    if (!game_uuid) {
      return res.status(400).json({ 
        success: false, 
        message: 'game_uuid gereklidir' 
      });
    }

    // Yeni formatla çağır  
    const uuid = game_uuid;
    
    // Oyuncu ID'si oluştur
    let playerId;
    let playerName = 'Demo Player';
    
    if (gameMode === 'real' && req.user) {
      playerId = `user_${(req.user as any).id}_${Date.now()}`;
      playerName = (req.user as any).username || 'Real Player';
    } else {
      playerId = `demo_player_${Date.now()}`;
    }

    // Generate session ID for real money games
    const sessionId = gameMode === 'real' ? `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` : undefined;

    const gameResult = await slotegratorService.initGame(
      uuid,
      playerId,
      playerName,
      gameCurrency,
      gameLanguage,
      `${req.protocol}://${req.get('host')}/games/return`,
      gameMode as 'real' | 'demo',
      req.ip || '127.0.0.1',
      gameDevice,
      sessionId
    );

    res.json(gameResult);

  } catch (error: any) {
    console.error('Oyun başlatma endpoint hatası:', error);
    res.status(500).json({ 
      success: false, 
      message: `Genel hata: ${error.message}` 
    });
  }
});

// Cache yenileme endpoint'i - 10,159 oyun için tam cache oluşturma
router.post('/refresh-cache', async (req: Request, res: Response) => {
  try {
    console.log('=== MANUEL CACHE YENİLEME BAŞLADI ===');
    console.log('10,159 oyun için tam cache oluşturuluyor...');
    
    // Cache oluşturma sürecini başlat (arka planda)
    slotegratorService.refreshCache(true).then(() => {
      console.log('Cache yenileme tamamlandı!');
    }).catch(error => {
      console.error('Cache yenileme hatası:', error);
    });
    
    res.json({ 
      success: true, 
      message: 'Cache yenileme başlatıldı',
      expected: '10,159 oyun yükleniyor...'
    });
  } catch (error) {
    console.error('Cache yenileme endpoint hatası:', error);
    res.status(500).json({ error: 'Cache yenileme başarısız' });
  }
});

// Tüm oyunları getir
router.get('/games', async (req: Request, res: Response) => {
  try {
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const perPage = req.query.perPage ? parseInt(req.query.perPage as string) : 50;
    const forceRefresh = req.query.forceRefresh === 'true';
    
    console.log(`🎰 Slots API İsteği - Sayfa: ${page}, PerPage: ${perPage}`);
    
    // Cache'den oyunları al
    let games = await slotegratorService.getCachedGames(forceRefresh);
    
    // Cache boşsa dosyadan yükle
    if (games.length === 0) {
      console.log('Memory cache boş, dosyadan yükleniyor...');
      try {
        const fs = await import('fs');
        const path = await import('path');
        const cacheFilePath = path.resolve('.slotegrator-cache.json');
        
        if (fs.existsSync(cacheFilePath)) {
          const cacheContent = fs.readFileSync(cacheFilePath, 'utf8');
          const cacheData = JSON.parse(cacheContent);
          
          if (cacheData.games && cacheData.games.length > 0) {
            games = cacheData.games;
            console.log(`📁 Dosyadan ${games.length} oyun yüklendi!`);
          }
        }
      } catch (fileError) {
        console.error('Dosya okuma hatası:', fileError);
      }
    }
    
    console.log(`✅ Toplam ${games.length} oyun hazır`);
    
    // Sayfalama
    const startIndex = (page - 1) * perPage;
    const paginatedGames = games.slice(startIndex, startIndex + perPage);
    
    const response = {
      items: paginatedGames,
      _meta: {
        totalCount: games.length,
        pageCount: Math.ceil(games.length / perPage),
        currentPage: page,
        perPage: perPage
      }
    };
    
    console.log(`📤 Sayfa ${page}: ${paginatedGames.length} oyun gönderiliyor`);
    res.json(response);
    
  } catch (error) {
    console.error('❌ Slots API Hatası:', error);
    res.status(500).json({ 
      error: 'Oyunlar yüklenirken hata oluştu',
      items: [],
      _meta: { totalCount: 0, pageCount: 0, currentPage: 1, perPage: 50 }
    });
  }
});

// Tüm oyunları getir (rate limiter ile MAX sayfa)
router.get('/games/max', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Cache anahtarı
    const cacheKey = `all_games_max`;
    
    // Memory Cache
    const memoryCache: Record<string, {data: any, timestamp: number}> = (global as any).maxGamesCache || {};
    (global as any).maxGamesCache = memoryCache;
    
    // Cache süresi
    const CACHE_TTL = 60 * 60 * 1000; // 1 saat
    
    // Cache'den kontrol et
    if (memoryCache[cacheKey] && (Date.now() - memoryCache[cacheKey].timestamp) < CACHE_TTL) {
      console.log(`Tüm oyunlar memory cache'den alındı!`);
      const responseTime = Date.now() - startTime;
      
      const cachedResponse = memoryCache[cacheKey].data;
      cachedResponse._meta.responseTime = responseTime;
      cachedResponse._meta.source = 'memory_cache';
      
      return res.json(cachedResponse);
    }
    
    // API'den maksimum sayıda oyun yükle (profesyonel rate limit yönetimi ile)
    console.log('Tüm oyunlar API üzerinden getirilecek...');
    
    // Rate limiter durumunu göster
    console.log('Rate limiter durumu:', rateLimiter.getStatus());
    
    // Maksimum sayıda oyun getir (100 sayfa, sayfa başına 100 oyun)
    const maxPages = 100;
    const maxPerPage = 100;
    
    console.log(`Maksimum ${maxPages} sayfa, sayfa başına ${maxPerPage} oyun için istek gönderiliyor...`);
    
    // Tüm oyunları çek
    const allGames = await slotegratorService.getMultiplePages(maxPages, maxPerPage);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // İstatistikleri hesapla
    const mobileGames = allGames.filter(game => game.is_mobile === 1).length;
    const desktopGames = allGames.filter(game => game.is_mobile === 0).length;
    
    // Benzersiz sağlayıcıları hesapla
    const providers = Array.from(new Set(allGames.map(game => game.provider))).filter(Boolean).sort();
    
    // Oyun türlerini hesapla
    const gameTypes: Record<string, number> = {};
    allGames.forEach(game => {
      if (game.tags && game.tags.length > 0) {
        game.tags.forEach(tag => {
          if (tag.code) {
            gameTypes[tag.code] = (gameTypes[tag.code] || 0) + 1;
          }
        });
      } else if (game.type) {
        gameTypes[game.type] = (gameTypes[game.type] || 0) + 1;
      }
    });
    
    // İlk sayfa için sonuçları hazırla (performans için)
    const perPage = 100;
    const paginatedGames = allGames.slice(0, perPage);
    
    // Özet rapor
    console.log('=== TÜM OYUNLAR TOPLAMA ÖZET ===');
    console.log(`Toplam ${allGames.length} oyun başarıyla çekildi.`);
    console.log(`Toplam ${providers.length} benzersiz sağlayıcı bulundu.`);
    console.log(`Sağlayıcılar: ${providers.join(', ')}`);
    console.log(`Mobil oyunlar: ${mobileGames}, Masaüstü oyunlar: ${desktopGames}`);
    console.log(`Yükleme süresi: ${responseTime}ms`);
    
    // Yanıt hazırla
    const response = {
      items: paginatedGames,
      _meta: {
        totalCount: allGames.length,
        pageCount: Math.ceil(allGames.length / perPage),
        currentPage: 1,
        perPage,
        responseTime,
        providerCount: providers.length,
        providers,
        mobileGames,
        desktopGames,
        gameTypes
      },
      allGames: allGames // Tüm oyunları da gönder
    };
    
    // Memory cache'e kaydet
    memoryCache[cacheKey] = {
      data: response,
      timestamp: Date.now()
    };
    
    // Yanıt dön
    return res.json(response);
  } catch (error) {
    console.error('Error in /games/max endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch all games', details: String(error) });
  }
});

// HIZLI Slot oyunları - Direct API yaklaşımı
router.get('/games/slots', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Query parametreleri
    const pageNum = Math.max(1, parseInt(String(req.query.page || '1')) || 1);
    const requestedPerPage = parseInt(String(req.query.perPage || '50')) || 50;
    const perPageNum = requestedPerPage >= 1000 ? Number.MAX_SAFE_INTEGER : Math.max(1, Math.min(500, requestedPerPage));
    const providerFilter = req.query.provider as string | undefined;
    const mobileFilter = req.query.mobile === '1';
    
    console.log(`⚡ HIZLI Slot API - Direct yaklaşım`);
    
    // HIZLI ÇÖZÜM: Cache varsa kullan, yoksa hızlı direct API
    let allGames: any[] = [];
    
    try {
      // Önce cache'e hızlı bak (timeout olmadan)
      allGames = await slotegratorService.getCachedGames(false);
      
      if (allGames.length === 0) {
        console.log(`Cache henüz hazır değil, API'den yükleniyor...`);
        return res.status(202).json({ 
          message: 'Oyunlar yükleniyor, lütfen birkaç saniye bekleyin',
          loading: true,
          _meta: {
            totalCount: 0,
            currentPage: pageNum,
            perPage: perPageNum,
            responseTime: Date.now() - startTime
          }
        });
      } else {
        console.log(`Cache'den ${allGames.length} oyun alındı`);
      }
    } catch (error) {
      console.error('Cache yükleme hatası:', error);
      return res.status(503).json({ 
        error: 'Slot oyunları yüklenemedi. Lütfen birkaç dakika sonra tekrar deneyin.',
        _meta: {
          responseTime: Date.now() - startTime
        }
      });
    }
    
    // MAKSIMUM SLOT OYUNU DAHİL ETME - Sadece kesin live casino masası oyunlarını hariç tut
    let games = allGames.filter(game => {
      const gameType = (game.type || '').toLowerCase();
      const gameName = (game.name || '').toLowerCase();
      const provider = (game.provider || '').toLowerCase();
      
      // Sadece 100% kesin live casino masası oyunlarını hariç tut
      const absoluteExcludeTypes = ['roulette', 'blackjack', 'baccarat'];
      const excludeProviders = ['evolution gaming', 'ezugi'];
      
      // Live casino sağlayıcılarını hariç tut
      if (excludeProviders.includes(provider)) {
        return false;
      }
      
      // Sadece kesin masa oyunlarını hariç tut
      if (absoluteExcludeTypes.includes(gameType)) {
        return false;
      }
      
      // GERİ KALAN HER ŞEYİ SLOT OLARAK KABUL ET
      // Slots, Table games, Casual, Lottery, Instant Win, Crash, Fishing vb.
      return true;
    });
    
    console.log(`🎰 MAKSIMUM SLOT FİLTRELEME: ${allGames.length} oyundan ${games.length} slot oyunu hazırlandı`);
    
    // Debug: Gerçekte kaç oyun dönüyor
    console.log(`Filtreleme öncesi: ${games.length} oyun`);
    
    // Tüm oyunları slot olarak döndür - maximum dahil etme
    
    // Eğer hiç slot oyunu yoksa hata döndür
    if (games.length === 0) {
      return res.status(503).json({ 
        error: 'Cache henüz hazırlanıyor',
        message: 'Oyunlar yükleniyor, lütfen birkaç saniye bekleyin',
        _meta: {
          totalCount: 0,
          pageCount: 0,
          currentPage: pageNum,
          perPage: perPageNum,
          responseTime: Date.now() - startTime,
          source: 'loading'
        }
      });
    }
    
    // Ek filtreler uygula
    let filteredGames = games;
    
    if (providerFilter) {
      filteredGames = filteredGames.filter(game => game.provider === providerFilter);
    }
    
    if (mobileFilter !== undefined) {
      filteredGames = filteredGames.filter(game => game.is_mobile === (mobileFilter ? 1 : 0));
    }
    
    // Sayfalama
    const startIndex = (pageNum - 1) * perPageNum;
    const paginatedGames = filteredGames.slice(startIndex, startIndex + perPageNum);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    console.log(`✅ Slot oyunları hazırlandı: ${paginatedGames.length}/${filteredGames.length} - ${responseTime}ms`);
    
    // Yanıt hazırla
    const response = {
      items: paginatedGames,
      _meta: {
        totalCount: filteredGames.length,
        pageCount: Math.ceil(filteredGames.length / perPageNum),
        currentPage: pageNum,
        perPage: perPageNum,
        responseTime,
        source: 'cached_filtered'
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error in /games/slots endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch slot games' });
  }
});

// Casino oyunlarını getir (gelişmiş filtreleme ve cache)
router.get('/games/casino', async (req: Request, res: Response) => {
  try {
    // Yanıt zamanını ölç
    const startTime = Date.now();
    
    // Memory cache anahtarı
    const cacheKey = `casino_${JSON.stringify(req.query)}`;
    
    // Memory Cache (Route Handler seviyesinde)
    const memoryCache: Record<string, {data: any, timestamp: number}> = (global as any).slotegratorMemoryCache || {};
    (global as any).slotegratorMemoryCache = memoryCache;
    
    // Cache süresi (5 dakika)
    const CACHE_TTL = 5 * 60 * 1000;
    
    // Önce memory cache'den kontrol et
    if (memoryCache[cacheKey] && (Date.now() - memoryCache[cacheKey].timestamp) < CACHE_TTL) {
      console.log(`Casino oyunları memory önbellekten alındı! (${cacheKey})`);
      const responseTime = Date.now() - startTime;
      
      // Response meta data'ya performans bilgisini ekle
      const cachedResponse = memoryCache[cacheKey].data;
      cachedResponse._meta.responseTime = responseTime;
      cachedResponse._meta.source = 'memory_cache';
      
      return res.json(cachedResponse);
    }
    
    // Memory cache'de yoksa veritabanı cache'ine bak
    const cachedCasinoGames = await slotegratorService.getCachedCasinoGames();
    let games;
    
    if (cachedCasinoGames && cachedCasinoGames.length > 0) {
      console.log('Casino oyunları DB önbellekten getirildi!');
      games = cachedCasinoGames;
    } else {
      console.log('Casino oyunları API üzerinden getirilecek...');
      try {
        games = await slotegratorService.getCasinoGames();
        // Verileri önbelleğe kaydet
        if (games && games.length > 0) {
          await slotegratorService.cacheCasinoGames(games);
        }
      } catch (error) {
        console.error('Casino oyunları API hatası:', error);
        // API başarısız olursa boş liste döndür
        games = [];
      }
    }
    
    // Query parametreleri
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const perPage = req.query.perPage ? parseInt(req.query.perPage as string) : 50;
    const provider = req.query.provider as string | undefined;
    const mobile = req.query.mobile !== undefined ? req.query.mobile === '1' : undefined;
    const gameType = req.query.gameType as string | undefined;
    const useCache = req.query.useCache !== 'false'; // Varsayılan olarak cache kullan
    
    // Filtrelemeleri tek geçişte yap (performans için)
    games = games.filter(game => {
      // Provider filtrelemesi
      if (provider && game.provider !== provider) {
        return false;
      }
      
      // Mobil/masaüstü filtrelemesi
      if (mobile !== undefined && game.is_mobile !== (mobile ? 1 : 0)) {
        return false;
      }
      
      // Oyun tipi filtrelemesi
      if (gameType && gameType !== 'all') {
        // Etiketlerde oyun türü kontrolü
        if (!game.tags || !game.tags.some(tag => tag.code.toLowerCase() === gameType.toLowerCase())) {
          return false;
        }
      }
      
      return true;
    });
    
    // Toplam sonuç
    const totalCount = games.length;
    
    // Sayfalama
    const startIndex = (page - 1) * perPage;
    const paginatedGames = games.slice(startIndex, startIndex + perPage);
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    console.log(`Casino oyunları yanıt süresi: ${responseTime}ms, toplam ${totalCount} oyun`);
    
    // Yanıt hazırla
    const response = {
      items: paginatedGames,
      _meta: {
        totalCount,
        pageCount: Math.ceil(totalCount / perPage),
        currentPage: page,
        perPage,
        responseTime,
        source: 'db_cache'
      }
    };
    
    // Memory cache'e kaydet (sonraki hızlı erişimler için)
    if (useCache) {
      memoryCache[cacheKey] = {
        data: response,
        timestamp: Date.now()
      };
    }
    
    // Yanıt dön
    res.json(response);
  } catch (error) {
    console.error('Error in /games/casino endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch casino games' });
  }
});

// Sağlayıcıları getir
router.get('/providers', async (req: Request, res: Response) => {
  try {
    const forceRefresh = req.query.forceRefresh === 'true';
    // Daha doğru bir isteğe göre sağlayıcıları al
    const providers = await slotegratorService.getAllProviders(forceRefresh);
    
    // Mobil uyumlu sağlayıcıları bulmak için parametre 
    const mobileOnly = req.query.mobile === 'true';
    
    if (mobileOnly) {
      // Mobil uyumlu oyunları olan sağlayıcıları filtrele
      const mobileGames = await slotegratorService.getMobileGames();
      const mobileProviders = new Set(mobileGames.map(game => game.provider));
      res.json({ items: providers.filter(provider => mobileProviders.has(provider)) });
    } else {
      res.json({ items: providers });
    }
  } catch (error) {
    console.error('Error in /providers endpoint:', error);
    res.status(500).json({ error: 'Failed to fetch providers' });
  }
});

// Sağlayıcıları analiz et ve önbellek durumunu kontrol et
router.get('/providers/analyze', async (req: Request, res: Response) => {
  try {
    // Tüm sağlayıcıları getir
    const providers = await slotegratorService.getAllProviders();
    
    // Önbellek durumunu kontrol et
    const cacheStatus: Record<string, any> = {};
    
    // Toplam oyun sayısı
    const allGames = await slotegratorService.getCachedGames();
    
    // Mobil oyunları getir
    const mobileGames = allGames.filter(game => game.is_mobile === 1);
    
    // Oyun türlerini analiz et
    const gameTypes: Record<string, number> = {};
    allGames.forEach(game => {
      if (game.tags && game.tags.length > 0) {
        game.tags.forEach(tag => {
          if (tag.code) {
            gameTypes[tag.code] = (gameTypes[tag.code] || 0) + 1;
          }
        });
      } else if (game.type) {
        gameTypes[game.type] = (gameTypes[game.type] || 0) + 1;
      }
    });
    
    // Sağlayıcı analizi
    for (const provider of providers) {
      const providerGames = allGames.filter(game => game.provider === provider);
      const mobilePlatformGames = providerGames.filter(game => game.is_mobile === 1);
      
      cacheStatus[provider] = {
        gameCount: providerGames.length,
        mobileGameCount: mobilePlatformGames.length,
        desktopGameCount: providerGames.length - mobilePlatformGames.length,
      };
    }
    
    res.json({
      totalGames: allGames.length,
      totalProviders: providers.length,
      providers: providers,
      providerAnalysis: cacheStatus,
      mobileGames: mobileGames.length,
      desktopGames: allGames.length - mobileGames.length,
      gameTypes: gameTypes
    });
  } catch (error) {
    console.error('Error in /providers/analyze endpoint:', error);
    res.status(500).json({ error: 'Failed to analyze providers' });
  }
});

// Belirli bir sağlayıcı için oyunları yükle
router.get('/providers/fetch/:provider', async (req: Request, res: Response) => {
  try {
    const provider = req.params.provider;
    if (!provider) {
      return res.status(400).json({ error: 'Provider adı belirtilmedi' });
    }
    
    console.log(`"${provider}" sağlayıcısı için oyunlar yükleniyor...`);
    
    // Belirli bir sağlayıcı için oyunları çek
    const games = await slotegratorService.fetchGamesForProvider(provider);
    
    res.json({
      provider,
      totalGames: games.length,
      mobileGames: games.filter(game => game.is_mobile === 1).length,
      desktopGames: games.filter(game => game.is_mobile === 0).length,
      success: games.length > 0,
      message: games.length > 0 
        ? `${provider} sağlayıcısı için ${games.length} oyun başarıyla yüklendi.` 
        : `${provider} sağlayıcısı için oyun bulunamadı.`
    });
  } catch (error) {
    console.error(`Error fetching games for provider ${req.params.provider}:`, error);
    res.status(500).json({ 
      error: 'Failed to fetch games for provider',
      provider: req.params.provider,
      message: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});
router.get('/providers/fetch/:provider', async (req: Request, res: Response) => {
  try {
    const provider = req.params.provider;
    
    // İsteği al ve işlemi başlat
    res.status(202).json({ 
      status: 'processing', 
      provider, 
      message: `${provider} için oyunlar yükleniyor...`,
      note: "Bu işlem arka planda devam edecek ve tamamlandığında önbellekte saklanacaktır."
    });
    
    // Arka planda sağlayıcı için oyunları yüklemeyi başlat
    slotegratorService.fetchGamesForProvider(provider)
      .then(games => {
        console.log(`${provider} için ${games.length} oyun başarıyla yüklendi ve önbelleğe alındı.`);
      })
      .catch(err => {
        console.error(`${provider} için oyun yükleme hatası:`, err);
      });
      
  } catch (error) {
    console.error(`Error in /providers/fetch/${req.params.provider} endpoint:`, error);
    res.status(500).json({ error: 'Failed to fetch games for provider' });
  }
});

// Belirli bir sağlayıcının oyunlarını getir
router.get('/games/provider/:provider', async (req: Request, res: Response) => {
  try {
    const provider = req.params.provider;
    const games = await slotegratorService.getGamesByProvider(provider);
    
    // Query parametreleri
    const page = req.query.page ? parseInt(req.query.page as string) : 1;
    const perPage = req.query.perPage ? parseInt(req.query.perPage as string) : 50;
    
    // Sayfalama uygula
    const startIndex = (page - 1) * perPage;
    const paginatedGames = games.slice(startIndex, startIndex + perPage);
    
    res.json({
      items: paginatedGames,
      _meta: {
        totalCount: games.length,
        pageCount: Math.ceil(games.length / perPage),
        currentPage: page,
        perPage: perPage
      }
    });
  } catch (error) {
    console.error(`Error in /games/provider/${req.params.provider} endpoint:`, error);
    res.status(500).json({ error: 'Failed to fetch provider games' });
  }
});

// Belirli bir oyunu getir
router.get('/games/:uuid', async (req: Request, res: Response) => {
  try {
    const uuid = req.params.uuid;
    const game = await slotegratorService.getGameByUuid(uuid);
    
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }
    
    res.json(game);
  } catch (error) {
    console.error(`Error in /games/${req.params.uuid} endpoint:`, error);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

// Oyun başlatma (init) - Kullanıcı kimlik doğrulaması gerekli
router.post('/games/init', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Request body'den parametreleri al
    const { 
      game_uuid, 
      currency = 'USD', 
      language = 'tr', 
      return_url, 
      mode = 'real',
      device = 'desktop'
    } = req.body;
    
    // Gerekli parametreleri kontrol et
    if (!game_uuid) {
      return res.status(400).json({ error: 'game_uuid is required' });
    }
    
    if (!return_url) {
      return res.status(400).json({ error: 'return_url is required' });
    }
    
    // Kullanıcı bilgilerini al
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Slotegrator için oyuncu ID olarak id kullanıyoruz
    const playerId = String(user.id);
    
    // IP adresini al
    const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
    
    // Gerçek para oyunu için kullanıcı bakiyesi kontrolü
    let result;
    
    if (mode === 'real') {
      // Authenticated user için gerçek para oyunu
      result = await realMoneyService.initRealMoneyGame(
        game_uuid,
        user.id,
        user.username || 'Player',
        user.balance || 0,
        currency,
        language,
        device,
        ipAddress
      );
    } else {
      // Demo oyun
      result = await realMoneyService.initDemoGame(
        game_uuid,
        language,
        device
      );
    }
    
    res.json(result);
  } catch (error) {
    console.error('Error in /games/init endpoint:', error);
    res.status(500).json({ error: 'Failed to initialize game' });
  }
});

// Lobby verisi al - Kullanıcı kimlik doğrulaması gerekli
router.post('/games/lobby', authMiddleware, async (req: Request, res: Response) => {
  try {
    // Request body'den parametreleri al
    const { 
      game_uuid, 
      currency = 'USD', 
      language = 'tr'
    } = req.body;
    
    // Gerekli parametreleri kontrol et
    if (!game_uuid) {
      return res.status(400).json({ error: 'game_uuid is required' });
    }
    
    // Kullanıcı bilgilerini al
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'User not authenticated' });
    }
    
    // Slotegrator için oyuncu ID olarak id kullanıyoruz
    const playerId = String(user.id);
    
    // Lobby verisini getir
    const result = await slotegratorService.getGameLobby(
      game_uuid,
      playerId,
      currency,
      language
    );
    
    res.json(result);
  } catch (error) {
    console.error('Error in /games/lobby endpoint:', error);
    res.status(500).json({ error: 'Failed to get game lobby' });
  }
});

// Slotegrator Callback Endpoint - https://cryptonbets1.com/api/slotegrator/callback URL'i kullanılacak
router.post('/callback', async (req: Request, res: Response) => {
  try {
    console.log('Slotegrator callback received:', req.body);
    
    // Headers'da imza doğrulama işlemini ekle
    const merchantId = req.headers['x-merchant-id'];
    const timestamp = req.headers['x-timestamp'];
    const nonce = req.headers['x-nonce'];
    const signature = req.headers['x-sign'];
    
    // Gelen imzayı kontrol et - gerçek uygulamada bu doğrulama eklenmeli
    if (!merchantId || !timestamp || !nonce || !signature) {
      console.error('Missing required headers for callback validation');
      // Slotegrator callback için 200 döndürmek daha iyi, ama hata loglanmalı
      return res.status(200).json({ status: 'error', message: 'Missing headers' });
    }
    
    // Callback tipine göre işlem yapma
    const callbackType = req.body.type;
    console.log(`Handling callback type: ${callbackType}`);
    
    switch(callbackType) {
      case 'balance':
        // Bakiye sorgusu
        const userId = req.body.user_id;
        console.log(`Processing balance request for user: ${userId}`);
        
        try {
          // Gerçek uygulama: kullanıcı bakiyesini veritabanından sorgula
          // Örnek: const user = await storage.getUser(userId);
          // Şu an için sabit bir değer dönüyoruz
          return res.json({
            balance: 1000.00
          });
        } catch (err) {
          console.error(`Error fetching user balance: ${err}`);
          return res.json({
            balance: 0.00
          });
        }
        
      case 'bet':
        // Bahis işlemi
        const betAmount = req.body.amount;
        const betUserId = req.body.user_id;
        const transactionId = req.body.transaction_id;
        
        console.log(`Processing bet: User=${betUserId}, Amount=${betAmount}, Transaction=${transactionId}`);
        
        // Gerçek uygulama: bahis işlemini kaydet ve kullanıcı bakiyesini güncelle
        // Örnek: await storage.updateUserBalance(betUserId, -betAmount);
        
        return res.json({
          status: 'ok'
        });
        
      case 'win':
        // Kazanç işlemi
        const winAmount = req.body.amount;
        const winUserId = req.body.user_id;
        const winTransactionId = req.body.transaction_id;
        
        console.log(`Processing win: User=${winUserId}, Amount=${winAmount}, Transaction=${winTransactionId}`);
        
        // Gerçek uygulama: kazanç işlemini kaydet ve kullanıcı bakiyesini güncelle
        // Örnek: await storage.updateUserBalance(winUserId, winAmount);
        
        return res.json({
          status: 'ok'
        });
        
      case 'rollback':
        // İşlem geri alma
        const rollbackTransactionId = req.body.transaction_id;
        console.log(`Processing rollback for transaction: ${rollbackTransactionId}`);
        
        // Gerçek uygulama: ilgili işlemi iptal et ve kullanıcı bakiyesini güncelle
        
        return res.json({
          status: 'ok'
        });
        
      default:
        console.warn(`Unknown callback type received: ${callbackType}`);
        return res.status(200).json({ status: 'ok', message: 'Unknown type but acknowledged' });
    }
  } catch (error: any) {
    console.error('Error in Slotegrator callback endpoint:', error);
    // Slotegrator için hata durumunda da 200 döndürmek daha iyi
    return res.status(200).json({ status: 'error', message: error.message });
  }
});

// Oyun URL'i alma endpoint'i - Session endpoint uyumlu  
router.post('/game-url', async (req: Request, res: Response) => {
  try {
    const { uuid, mode = 'demo', device = 'desktop', language = 'tr', currency = 'TRY' } = req.body;

    console.log('🎮 Oyun URL alma isteği:', {
      uuid: uuid?.substring(0, 12) + '...',
      mode,
      timestamp: new Date().toISOString()
    });

    if (!uuid) {
      console.error('❌ Oyun UUID eksik');
      return res.status(400).json({
        success: false,
        message: 'Oyun UUID\'si gerekli'
      });
    }

    // Kullanıcı bilgilerini al - gerçek para oyunları için gerekli
    const user = (req as any).user;
    let userId: string | undefined;
    
    if (mode === 'real') {
      // Gerçek para oyunları için kullanıcı kimlik doğrulaması zorunlu
      if (!user || !user.id) {
        return res.status(401).json({
          success: false,
          message: 'Gerçek para oyunları için giriş yapmanız gerekli'
        });
      }
      userId = String(user.id);
    }
    
    console.log('🚀 Slotegrator session oluşturuluyor...', {
      mode,
      currency: 'TRY',
      hasUser: !!userId,
      userId: userId ? userId.substring(0, 4) + '...' : 'yok'
    });
    
    // TRY para birimi ve Türkçe dil kullan
    const gameUrl = await slotegratorService.createSession(uuid, mode, 'TRY', 'tr', userId);
    
    if (!gameUrl) {
      throw new Error('Oyun URL\'si alınamadı');
    }

    console.log('✅ Oyun URL\'si başarıyla alındı:', {
      uuid: uuid.substring(0, 12) + '...',
      mode,
      urlLength: gameUrl.length,
      urlDomain: gameUrl.split('/')[2] || 'bilinmeyen'
    });

    res.json({
      success: true,
      url: gameUrl,
      mode,
      message: mode === 'real' ? 'Gerçek para oyunu başlatılıyor' : 'Demo oyun başlatılıyor'
    });

  } catch (error: any) {
    console.error('❌ Oyun URL alma hatası:', {
      error: error.message,
      stack: error.stack?.split('\n')[0],
      uuid: req.body?.uuid?.substring(0, 12) + '...' || 'bilinmeyen'
    });
    
    res.status(500).json({
      success: false,
      message: 'Oyun başlatılamadı',
      details: error.message
    });
  }
});

export default router;