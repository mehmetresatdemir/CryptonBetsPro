import express from 'express';
import { storage } from '../storage';
import { authMiddleware } from '../utils/auth';

const router = express.Router();

// Get user's betting history
router.get('/user-bets', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;

    // Get user's bets from database
    const bets = await storage.getBetsByUser(userId);
    
    // Transform bets to include game information
    const betsWithGameInfo = await Promise.all(bets.map(async (bet) => {
      let gameName = 'Unknown Game';
      
      // Try to get game name from various sources
      if (bet.gameName) {
        gameName = bet.gameName;
      } else if (bet.gameId) {
        // For legacy games
        try {
          const game = await storage.getGame(bet.gameId);
          if (game) {
            gameName = game.title;
          }
        } catch (error) {
          console.log('Legacy game lookup failed');
        }
      }

      // Format bet data
      return {
        id: bet.id,
        date: bet.createdAt,
        game: gameName,
        amount: Number(bet.betAmount) || 0,
        winAmount: Number(bet.winAmount) || 0,
        status: bet.status
      };
    }));

    // Sort by date (newest first) and apply pagination
    const sortedBets = betsWithGameInfo
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(offset, offset + limit);

    res.json({
      success: true,
      bets: sortedBets,
      total: bets.length,
      hasMore: offset + limit < bets.length
    });

  } catch (error) {
    console.error('Error fetching user bets:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch betting history'
    });
  }
});

// Get betting statistics
router.get('/user-bet-stats', authMiddleware, async (req, res) => {
  try {
    const userId = (req.user as any).id;
    
    const bets = await storage.getBetsByUser(userId);
    
    const stats = {
      totalBets: bets.length,
      totalWagered: bets.reduce((sum, bet) => sum + (Number(bet.betAmount) || 0), 0),
      totalWon: bets.reduce((sum, bet) => sum + (Number(bet.winAmount) || 0), 0),
      biggestWin: Math.max(...bets.map(bet => Number(bet.winAmount) || 0), 0),
      winRate: bets.length > 0 ? (bets.filter(bet => (Number(bet.winAmount) || 0) > (Number(bet.betAmount) || 0)).length / bets.length * 100) : 0
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Error fetching bet stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch betting statistics'
    });
  }
});

export default router;