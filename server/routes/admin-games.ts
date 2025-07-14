import { Request, Response, Router } from 'express';
import { storage } from '../storage';

const router = Router();

// Oyunları listeleme
router.get('/games', async (req: Request, res: Response) => {
  try {
    // Şimdilik test verileri döndür
    const mockGames = [
      {
        id: 1,
        uuid: 'sweet-bonanza-001',
        name: 'Sweet Bonanza',
        provider: 'Pragmatic Play',
        category: 'Slots',
        subcategory: 'Video Slots',
        imageUrl: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=vs25sweetbonanza&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99&lobby_url=https%3A%2F%2Fwww.pragmaticplay.com%2Fen%2F',
        isActive: true,
        isMobile: true,
        isDesktop: true,
        hasDemo: true,
        hasRealMoney: true,
        minBet: '0.20',
        maxBet: '100.00',
        rtp: '96.51',
        volatility: 'High',
        tags: ['popular', 'bonus-buy'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: {
          sessions30d: 1542,
          bets30d: 15420,
          totalBetAmount30d: 425600,
          totalWinAmount30d: 408720,
          rtp30d: 96.03
        }
      },
      {
        id: 2,
        uuid: 'gates-olympus-002',
        name: 'Gates of Olympus',
        provider: 'Pragmatic Play',
        category: 'Slots',
        subcategory: 'Video Slots',
        imageUrl: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=vs20gateslympus&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99&lobby_url=https%3A%2F%2Fwww.pragmaticplay.com%2Fen%2F',
        isActive: true,
        isMobile: true,
        isDesktop: true,
        hasDemo: true,
        hasRealMoney: true,
        minBet: '0.20',
        maxBet: '125.00',
        rtp: '96.50',
        volatility: 'High',
        tags: ['mythology', 'multipliers'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: {
          sessions30d: 1205,
          bets30d: 12850,
          totalBetAmount30d: 365200,
          totalWinAmount30d: 352140,
          rtp30d: 96.42
        }
      },
      {
        id: 3,
        uuid: 'big-bass-bonanza-003',
        name: 'Big Bass Bonanza',
        provider: 'Pragmatic Play',
        category: 'Slots',
        subcategory: 'Video Slots',
        imageUrl: 'https://demogamesfree.pragmaticplay.net/gs2c/openGame.do?lang=en&cur=USD&gameSymbol=vs10bigbass&websiteUrl=https%3A%2F%2Fdemogamesfree.pragmaticplay.net&jurisdiction=99&lobby_url=https%3A%2F%2Fwww.pragmaticplay.com%2Fen%2F',
        isActive: true,
        isMobile: true,
        isDesktop: true,
        hasDemo: true,
        hasRealMoney: true,
        minBet: '0.10',
        maxBet: '250.00',
        rtp: '96.71',
        volatility: 'Medium-High',
        tags: ['fishing', 'bonus-features'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        stats: {
          sessions30d: 985,
          bets30d: 9240,
          totalBetAmount30d: 284600,
          totalWinAmount30d: 275320,
          rtp30d: 96.74
        }
      }
    ];

    res.json({
      success: true,
      games: mockGames,
      pagination: {
        currentPage: 1,
        totalPages: 1,
        totalItems: mockGames.length,
        itemsPerPage: 20
      }
    });
  } catch (error) {
    console.error('Games API hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Oyunlar yüklenirken hata oluştu'
    });
  }
});

// Oyun istatistikleri
router.get('/stats', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      stats: {
        games: {
          totalGames: 3,
          activeGames: 3,
          inactiveGames: 0
        },
        sessions: {
          totalSessions: 3732,
          activeSessions: 45,
          uniqueGames: 3
        },
        bets: {
          totalBets: 37510,
          totalBetAmount: 1075400,
          totalWinAmount: 1036180,
          avgBetAmount: 28.67,
          rtp: 96.35
        },
        popularGames: [
          {
            uuid: 'sweet-bonanza-001',
            name: 'Sweet Bonanza',
            provider: 'Pragmatic Play',
            totalSessions: 1542,
            totalBets: 15420
          },
          {
            uuid: 'gates-olympus-002',
            name: 'Gates of Olympus',
            provider: 'Pragmatic Play',
            totalSessions: 1205,
            totalBets: 12850
          },
          {
            uuid: 'big-bass-bonanza-003',
            name: 'Big Bass Bonanza',
            provider: 'Pragmatic Play',
            totalSessions: 985,
            totalBets: 9240
          }
        ]
      }
    });
  } catch (error) {
    console.error('Stats API hatası:', error);
    res.status(500).json({
      success: false,
      error: 'İstatistikler yüklenirken hata oluştu'
    });
  }
});

// Provider listesi
router.get('/providers', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      providers: [
        { provider: 'Pragmatic Play', count: 3 },
        { provider: 'NetEnt', count: 0 },
        { provider: 'Evolution Gaming', count: 0 }
      ]
    });
  } catch (error) {
    console.error('Providers API hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Provider listesi yüklenirken hata oluştu'
    });
  }
});

// Kategori listesi
router.get('/categories', async (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      categories: [
        { category: 'Slots', count: 3 },
        { category: 'Table Games', count: 0 },
        { category: 'Live Casino', count: 0 }
      ]
    });
  } catch (error) {
    console.error('Categories API hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Kategori listesi yüklenirken hata oluştu'
    });
  }
});

// Oyun durumunu değiştirme
router.patch('/games/:uuid/status', async (req: Request, res: Response) => {
  try {
    const { uuid } = req.params;
    const { isActive } = req.body;

    res.json({
      success: true,
      message: 'Oyun durumu güncellendi'
    });
  } catch (error) {
    console.error('Oyun durumu güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      error: 'Oyun durumu güncellenirken hata oluştu'
    });
  }
});

export default router;