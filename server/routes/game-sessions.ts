import { Router, Request, Response } from 'express';
import { gameSessionManager } from '../services/slotegrator';
import { realGameEngine } from '../services/realGameEngine';
import { authMiddleware } from '../utils/auth';
import { storage } from '../storage';
import jwt from 'jsonwebtoken';

const router = Router();

// Gerçek oyun sessionı başlatma
router.post('/start', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { gameUuid, betAmount = 10 } = req.body;
    const user = req.user as any;

    if (!gameUuid) {
      return res.status(400).json({
        success: false,
        message: 'Oyun UUID gereklidir'
      });
    }

    // Kullanıcı bakiyesini kontrol et
    const currentUser = await storage.getUser(user.id);
    if (!currentUser || !currentUser.balance || currentUser.balance < betAmount) {
      return res.status(400).json({
        success: false,
        message: 'Yetersiz bakiye'
      });
    }

    // Bet işlemini kaydet
    const betTransaction = {
      transactionId: `bet_${Date.now()}_${user.id}`,
      userId: user.id,
      type: 'bet',
      amount: betAmount.toString(),
      status: 'completed',
      balanceBefore: currentUser.balance.toString(),
      balanceAfter: (currentUser.balance - betAmount).toString(),
      description: `Oyun bahisi: ${gameUuid}`,
      gameSession: gameUuid
    };

    await storage.createTransaction(betTransaction);

    // Gerçek oyun session başlat
    const result = await realGameEngine.startRealGame(user.id, gameUuid);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    const session = gameSessionManager.getSession(result.sessionId!);
    
    res.json({
      success: true,
      session: {
        sessionId: session!.sessionId,
        balance: session!.balance,
        gameUuid: session!.gameUuid,
        currency: session!.currency,
        startTime: session!.startTime
      }
    });

  } catch (error) {
    console.error('Session başlatma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Session başlatılamadı'
    });
  }
});

// Bahis yerleştirme
router.post('/bet', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId, betAmount, roundId } = req.body;
    const user = req.user as any;

    if (!sessionId || !betAmount || !roundId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID, bahis tutarı ve round ID gereklidir'
      });
    }

    // Session kontrolü
    const session = gameSessionManager.getSession(sessionId);
    if (!session || session.userId !== user.id) {
      return res.status(404).json({
        success: false,
        message: 'Geçersiz session'
      });
    }

    // Gerçek bahis yerleştir
    const result = await realGameEngine.placeBet(sessionId, betAmount);
    if (!result.success) {
      return res.status(400).json({
        success: false,
        message: result.error
      });
    }

    const transaction = result.transaction!;

    res.json({
      success: true,
      transaction: {
        id: transaction.id,
        betAmount: transaction.betAmount,
        balanceAfter: transaction.balanceAfter,
        roundId: transaction.roundId,
        status: transaction.status
      },
      message: 'Bahis yerleştirildi. Sonuç hesaplanıyor...'
    });

  } catch (error) {
    console.error('Bahis hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bahis işlemi başarısız'
    });
  }
});

// Kazanç işleme
router.post('/win', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId, transactionId, winAmount } = req.body;
    const user = req.user as any;

    if (!sessionId || !transactionId || winAmount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Session ID, transaction ID ve kazanç tutarı gereklidir'
      });
    }

    // Session kontrolü
    const session = gameSessionManager.getSession(sessionId);
    if (!session || session.userId !== user.id) {
      return res.status(404).json({
        success: false,
        message: 'Geçersiz session'
      });
    }

    // Kazanç işle
    const success = await gameSessionManager.processWin(sessionId, transactionId, winAmount);
    if (!success) {
      return res.status(400).json({
        success: false,
        message: 'Kazanç işlenemedi'
      });
    }

    // Kullanıcı bakiyesini güncelle
    await storage.updateUserBalance(user.id, session.balance);

    res.json({
      success: true,
      winAmount,
      newBalance: session.balance
    });

  } catch (error) {
    console.error('Kazanç işleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Kazanç işlemi başarısız'
    });
  }
});

// Session istatistikleri
router.get('/stats/:sessionId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const user = req.user as any;

    const stats = gameSessionManager.getSessionStats(sessionId);
    if (!stats || stats.session.userId !== user.id) {
      return res.status(404).json({
        success: false,
        message: 'Session bulunamadı'
      });
    }

    res.json({
      success: true,
      stats: {
        totalBets: stats.session.totalBets,
        totalWins: stats.session.totalWins,
        roundsPlayed: stats.session.roundsPlayed,
        currentBalance: stats.session.balance,
        profitLoss: stats.profitLoss,
        averageBet: stats.avgBet,
        winRate: stats.winRate,
        sessionDuration: new Date().getTime() - stats.session.startTime.getTime()
      }
    });

  } catch (error) {
    console.error('Session stats hatası:', error);
    res.status(500).json({
      success: false,
      message: 'İstatistikler alınamadı'
    });
  }
});

// Session sonlandırma
router.post('/end/:sessionId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const user = req.user as any;

    const session = gameSessionManager.getSession(sessionId);
    if (!session || session.userId !== user.id) {
      return res.status(404).json({
        success: false,
        message: 'Session bulunamadı'
      });
    }

    // Session'ı sonlandır
    gameSessionManager.endSession(sessionId);

    // Final bakiyeyi veritabanına kaydet
    await storage.updateUserBalance(user.id, session.balance);

    res.json({
      success: true,
      finalBalance: session.balance,
      sessionSummary: {
        totalBets: session.totalBets,
        totalWins: session.totalWins,
        roundsPlayed: session.roundsPlayed,
        profitLoss: session.totalWins - session.totalBets
      }
    });

  } catch (error) {
    console.error('Session sonlandırma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Session sonlandırılamadı'
    });
  }
});

// Oyun sonucunu getir
router.get('/result/:transactionId', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { transactionId } = req.params;
    const user = req.user as any;

    const result = realGameEngine.getGameResult(transactionId);
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Sonuç henüz hazır değil'
      });
    }

    res.json({
      success: true,
      result: {
        transactionId: result.transactionId,
        betAmount: result.betAmount,
        winAmount: result.winAmount,
        multiplier: result.multiplier,
        result: result.result,
        jackpot: result.jackpot,
        timestamp: result.timestamp
      }
    });

  } catch (error) {
    console.error('Oyun sonucu hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Sonuç alınamadı'
    });
  }
});

// Aktif jackpotları getir
router.get('/jackpots', async (req: Request, res: Response) => {
  try {
    const jackpots = gameSessionManager.getJackpots();
    
    res.json({
      success: true,
      jackpots: jackpots.map(j => ({
        gameUuid: j.gameUuid,
        type: j.jackpotType,
        amount: j.currentAmount,
        currency: j.currency,
        lastWinner: j.lastWinner
      }))
    });

  } catch (error) {
    console.error('Jackpot listesi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Jackpotlar alınamadı'
    });
  }
});

export default router;