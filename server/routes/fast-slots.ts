import { Router, Request, Response } from 'express';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { getGames } from '../services/slotegrator';

const router = Router();

// Anında slot oyunları - optimized performance cache
router.get('/fast-slots', async (req: Request, res: Response) => {
  try {
    const startTime = Date.now();
    
    // Sayfa parametreleri
    const pageNum = Math.max(1, parseInt(req.query.page as string) || 1);
    const requestedPerPage = parseInt(req.query.perPage as string) || 100;
    const perPageNum = requestedPerPage >= 1000 ? Number.MAX_SAFE_INTEGER : Math.max(1, Math.min(1000, requestedPerPage));
    const providerFilter = req.query.provider as string | undefined;
    const deviceFilter = req.query.device as string | undefined;
    const searchTerm = req.query.search as string | undefined;
    
    console.log(`⚡ PERFORMANCE CACHE API - Ultra-fast loading`);
    
    // Try performance cache first
    const performanceCache = join(process.cwd(), '.slotegrator-cache-performance.json');
    const mainCache = join(process.cwd(), '.slotegrator-cache.json');
    let allGames: any[] = [];
    let indices: any = null;
    
    if (existsSync(performanceCache)) {
      try {
        const perfData = JSON.parse(readFileSync(performanceCache, 'utf8'));
        allGames = perfData.games || [];
        indices = perfData.indices || null;
        console.log(`Performance cache loaded: ${allGames.length} games with indices`);
      } catch (perfError) {
        console.log('Performance cache error, falling back to main cache');
      }
    }
    
    // Fallback to main cache if performance cache unavailable
    if (allGames.length === 0 && existsSync(mainCache)) {
      try {
        const cacheData = JSON.parse(readFileSync(mainCache, 'utf8'));
        allGames = cacheData.items || cacheData.games || [];
        console.log(`Cache'den ${allGames.length} oyun yüklendi`);
      } catch (error) {
        console.error('Cache okuma hatası:', error);
        return res.status(503).json({ error: 'Cache okuma hatası' });
      }
    }
    
    // Fallback to mock data if no games available
    if (allGames.length === 0) {
      console.log('🔧 Cache empty, using mock data for fast-slots');
      try {
        const slotegratorService = await import('../services/slotegrator');
        const cachedGames = await slotegratorService.getCachedGames();
        allGames = cachedGames;
        console.log(`Mock data loaded: ${allGames.length} games`);
      } catch (mockError) {
        console.error('Mock data fallback failed:', mockError);
        return res.status(503).json({ 
          error: 'Oyunlar henüz yüklenmedi',
          message: 'Lütfen birkaç dakika sonra tekrar deneyin'
        });
      }
    }

    if (allGames.length === 0) {
      return res.status(503).json({ 
        error: 'Oyunlar henüz yüklenmedi',
        message: 'Lütfen birkaç dakika sonra tekrar deneyin'
      });
    }
    
    // MAKSIMUM SLOT DAHİL ETME - Sadece kesin live casino/masa oyunları hariç
    let games = allGames.filter(game => {
      const gameType = (game.type || '').toLowerCase();
      const gameName = (game.name || '').toLowerCase();
      const provider = (game.provider || '').toLowerCase();
      
      // Sadece %100 kesin live casino sağlayıcılarını hariç tut
      const excludeProviders = ['evolution gaming', 'ezugi'];
      if (excludeProviders.includes(provider)) {
        return false;
      }
      
      // Pragmatic Play Live Casino oyunlarını özel olarak hariç tut
      if (provider === 'pragmaticplay' && (
        gameName.includes('live ') || 
        gameName.includes(' live') || 
        gameType.includes('live')
      )) {
        return false;
      }
      
      // Sadece kesin masa oyunlarını hariç tut
      const excludeTypes = [
        'blackjack', 'baccarat', 'roulette', 'poker', 
        'live dealer', 'dragon tiger', 'sic bo', 'andar bahar', 'craps'
      ];
      if (excludeTypes.includes(gameType)) {
        return false;
      }
      
      // Sadece kesin live casino oyunlarını hariç tut (name'de "live" geçenler)
      if (gameName.includes('live ') || gameName.includes(' live')) {
        return false;
      }
      
      // MAKSIMUM SLOT OYUNU DAHİL ETME:
      // Sadece kesin olmayan oyun türlerini dahil et
      const includeTypes = [
        'slots', 'high-quality', 'lottery', 'dice', 'bingo', 'crash', 
        'fishing', 'cluster', 'casual', 'fruit game', 'arcade', 
        'scratch card', 'shooting', 'keno', 'other', 'instant win',
        'instant', 'provably fair', 'wheel of fortune', 'teen patti'
      ];
      
      // TÜM SLOT-BENZERİ OYUNLARI DAHİL ET
      return true; // Sadece live casino ve kesin masa oyunları hariç, geri kalan her şey dahil
    });
    
    console.log(`🎰 SLOT FİLTRELEME: ${allGames.length} oyundan ${games.length} slot oyunu`);
    
    // INTELLIGENT DEVICE-BASED FILTERING
    if (deviceFilter === 'mobile') {
      // Mobile: Only mobile-compatible games
      games = games.filter(game => game.is_mobile === 1 || game.technology === 'html5');
      console.log(`📱 MOBILE FILTER: ${games.length} mobile-compatible games`);
    } else if (deviceFilter === 'desktop') {
      // Desktop: Prioritize desktop games but include mobile-compatible ones
      const desktopGames = games.filter(game => game.is_mobile !== 1);
      const mobileCompatibleGames = games.filter(game => game.is_mobile === 1);
      games = [...desktopGames, ...mobileCompatibleGames];
      console.log(`🖥️ DESKTOP FILTER: ${games.length} games (${desktopGames.length} desktop + ${mobileCompatibleGames.length} mobile-compatible)`);
    } else {
      console.log(`🌐 ALL DEVICES: ${games.length} games (no device filtering)`);
    }
    // deviceFilter belirtilmezse tüm oyunlar gösterilir (eski davranış)
    
    // ADVANCED FILTERING WITH PERFORMANCE INDICES
    if (indices && searchTerm) {
      const searchResults = new Set<number>();
      const normalizedSearch = searchTerm.toLowerCase();
      
      // Use search indices for ultra-fast filtering
      Object.entries(indices.searchTerms).forEach(([term, gameIndices]) => {
        if (term.includes(normalizedSearch) || normalizedSearch.includes(term)) {
          (gameIndices as number[]).forEach(index => searchResults.add(index));
        }
      });
      
      if (searchResults.size > 0) {
        games = Array.from(searchResults).map(index => allGames[index]).filter(Boolean);
        console.log(`🔍 SEARCH INDEX (${searchTerm}): ${games.length} results`);
      }
    }
    
    // PROVIDER FILTERING WITH INDICES
    if (providerFilter && indices?.byProvider) {
      const normalizedProvider = providerFilter.toLowerCase().replace(/[^a-z0-9]/g, '');
      let providerGames: any[] = [];
      
      Object.entries(indices.byProvider).forEach(([provider, gameIndices]) => {
        const normalizedIndexProvider = provider.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (normalizedIndexProvider.includes(normalizedProvider)) {
          const providerGamesList = (gameIndices as number[]).map(index => allGames[index]).filter(Boolean);
          providerGames.push(...providerGamesList);
        }
      });
      
      if (providerGames.length > 0) {
        games = providerGames;
        console.log(`🎯 PROVIDER INDEX (${providerFilter}): ${games.length} games`);
      } else {
        // Fallback to traditional filtering
        games = games.filter(game => game.provider === providerFilter);
        console.log(`🎯 PROVIDER FILTER (${providerFilter}): ${games.length} games`);
      }
    } else if (providerFilter) {
      // Traditional provider filtering if no indices
      games = games.filter(game => game.provider === providerFilter);
      console.log(`🎯 PROVIDER FILTER (${providerFilter}): ${games.length} games`);
    }
    
    // Sayfalama
    const startIndex = (pageNum - 1) * perPageNum;
    const paginatedGames = games.slice(startIndex, startIndex + perPageNum);
    
    const responseTime = Date.now() - startTime;
    console.log(`✅ ANINDA slot yanıtı: ${paginatedGames.length}/${games.length} - ${responseTime}ms`);
    
    // Sağlayıcı analizi
    const providerStats = new Map<string, any>();
    games.forEach(game => {
      const provider = game.provider || 'Unknown';
      if (!providerStats.has(provider)) {
        providerStats.set(provider, {
          name: provider,
          gameCount: 0,
          hasJackpot: false,
          hasMegaways: false,
          isMobileOptimized: false,
          categories: new Set(),
          averageRtp: 0,
          totalRtp: 0,
          rtpCount: 0
        });
      }
      
      const stats = providerStats.get(provider);
      stats.gameCount++;
      
      // Feature analizi
      const gameName = (game.name || '').toLowerCase();
      if (gameName.includes('jackpot') || gameName.includes('mega')) stats.hasJackpot = true;
      if (gameName.includes('megaways')) stats.hasMegaways = true;
      if (game.is_mobile === 1) stats.isMobileOptimized = true;
      
      // RTP hesaplama
      if (game.rtp && game.rtp > 0) {
        stats.totalRtp += game.rtp;
        stats.rtpCount++;
        stats.averageRtp = stats.totalRtp / stats.rtpCount;
      }
      
      // Kategori analizi
      if (game.categories) {
        game.categories.forEach((cat: string) => stats.categories.add(cat));
      }
    });

    // Sağlayıcıları game count'a göre sırala
    const providers = Array.from(providerStats.values())
      .map(stats => ({
        ...stats,
        categories: Array.from(stats.categories),
        averageRtp: Math.round(stats.averageRtp * 100) / 100
      }))
      .sort((a, b) => b.gameCount - a.gameCount);

    // Oyun kategorileri analizi
    const categories = new Map<string, number>();
    games.forEach(game => {
      const gameName = (game.name || '').toLowerCase();
      if (gameName.includes('jackpot')) categories.set('jackpot', (categories.get('jackpot') || 0) + 1);
      if (gameName.includes('megaways')) categories.set('megaways', (categories.get('megaways') || 0) + 1);
      if (gameName.includes('bonus')) categories.set('bonus_buy', (categories.get('bonus_buy') || 0) + 1);
      if (gameName.includes('classic') || gameName.includes('fruit')) categories.set('classic', (categories.get('classic') || 0) + 1);
    });

    // Yanıt
    const response = {
      items: paginatedGames,
      providers: providers,
      categories: Object.fromEntries(categories),
      stats: {
        totalGames: games.length,
        totalProviders: providers.length,
        mobileOptimized: games.filter(g => g.is_mobile === 1).length,
        hasJackpot: games.filter(g => (g.name || '').toLowerCase().includes('jackpot')).length,
        hasMegaways: games.filter(g => (g.name || '').toLowerCase().includes('megaways')).length
      },
      _meta: {
        totalCount: games.length,
        pageCount: Math.ceil(games.length / perPageNum),
        currentPage: pageNum,
        perPage: perPageNum,
        responseTime,
        source: 'instant_cache',
        filters: {
          provider: providerFilter || 'all',
          device: deviceFilter || 'all'
        }
      }
    };
    
    res.json(response);
  } catch (error) {
    console.error('Fast slots hatası:', error);
    res.status(500).json({ error: 'Slot oyunları yüklenemedi' });
  }
});

export default router;