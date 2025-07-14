import { Router, Request, Response } from 'express';
import { db } from '../db';
import { users, transactions, bets, systemLogs } from '@shared/schema';
import { eq, desc, gte, sum, count, avg, sql } from 'drizzle-orm';
import { requireAdminAuth } from '../utils/auth';

const router = Router();

// Kullanıcı analitiği
router.get('/users', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    // Toplam kullanıcı sayısı
    const totalUsers = await db.select({ count: count() }).from(users);
    
    // Aktif kullanıcılar (son 30 gün içinde giriş yapmış)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const activeUsers = await db.select({ count: count() })
      .from(users)
      .where(gte(users.lastLogin, thirtyDaysAgo));

    // Bugün kayıt olan kullanıcılar
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const newUsersToday = await db.select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, today));

    // Kullanıcı dağılımı
    const totalUsersCount = totalUsers[0]?.count || 0;
    const activeUsersCount = activeUsers[0]?.count || 0;
    const newUsersTodayCount = newUsersToday[0]?.count || 0;
    
    const distribution = [
      { name: 'Aktif', value: activeUsersCount, color: '#10b981' },
      { name: 'İnaktif', value: totalUsersCount - activeUsersCount, color: '#f59e0b' },
      { name: 'Askıya Alınmış', value: 0, color: '#ef4444' }
    ];

    res.json({
      totalUsers: totalUsersCount,
      activeUsers: activeUsersCount,
      newUsersToday: newUsersTodayCount,
      distribution
    });

  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({ error: 'Kullanıcı analitikleri alınamadı' });
  }
});

// Finansal analitik
router.get('/finance', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    // Toplam yatırım
    const totalDeposits = await db.select({ 
      total: sum(transactions.amount) 
    })
    .from(transactions)
    .where(eq(transactions.type, 'deposit'));

    // Toplam çekim
    const totalWithdrawals = await db.select({ 
      total: sum(transactions.amount) 
    })
    .from(transactions)
    .where(eq(transactions.type, 'withdrawal'));

    // Bekleyen çekimler
    const pendingWithdrawals = await db.select({ count: count() })
      .from(transactions)
      .where(eq(transactions.status, 'pending'));

    // Son 6 ay gelir verisi
    const revenueData = [];
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran'];
    
    for (let i = 0; i < 6; i++) {
      const monthStart = new Date();
      monthStart.setMonth(monthStart.getMonth() - (5 - i));
      monthStart.setDate(1);
      monthStart.setHours(0, 0, 0, 0);
      
      const monthEnd = new Date(monthStart);
      monthEnd.setMonth(monthEnd.getMonth() + 1);
      
      const monthlyDeposits = await db.select({ 
        total: sum(transactions.amount) 
      })
      .from(transactions)
      .where(
        eq(transactions.type, 'deposit')
      );

      const monthlyProfit = Number(monthlyDeposits[0]?.total || 0) * 0.32; // %32 kar marjı
      
      revenueData.push({
        month: months[i],
        revenue: monthlyDeposits[0]?.total || 0,
        profit: monthlyProfit
      });
    }

    // Son işlemler
    const recentTransactions = await db.select({
      id: transactions.id,
      amount: transactions.amount,
      type: transactions.type,
      createdAt: transactions.createdAt,
      userId: transactions.userId
    })
    .from(transactions)
    .orderBy(desc(transactions.createdAt))
    .limit(5);

    const recentTransactionsWithUsers = await Promise.all(
      recentTransactions.map(async (transaction) => {
        const user = await db.select({ username: users.username })
          .from(users)
          .where(eq(users.id, transaction.userId))
          .limit(1);
        
        return {
          ...transaction,
          user: user[0]?.username || 'Anonim',
          time: transaction.createdAt ? new Date(transaction.createdAt).toLocaleString('tr-TR') : 'Tarih yok'
        };
      })
    );

    const totalDepositsAmount = Number(totalDeposits[0]?.total || 0);
    const totalWithdrawalsAmount = Number(totalWithdrawals[0]?.total || 0);
    const totalProfit = totalDepositsAmount * 0.32; // %32 kar marjı

    res.json({
      totalDeposits: totalDepositsAmount,
      totalWithdrawals: totalWithdrawalsAmount,
      totalProfit,
      pendingWithdrawals: pendingWithdrawals[0]?.count || 0,
      dailyRevenue: totalProfit / 30,
      monthlyGrowth: 12.5,
      depositGrowth: 12.5,
      profitGrowth: 8.2,
      revenueData,
      recentTransactions: recentTransactionsWithUsers
    });

  } catch (error) {
    console.error('Finance analytics error:', error);
    res.status(500).json({ error: 'Finansal analitikler alınamadı' });
  }
});

// Oyun analitiği
router.get('/games', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    // Toplam oyun sayısı
    const totalGames = await db.select({ count: count() }).from(bets);

    // Toplam bahis miktarı - amount sütunu kullan
    const totalBetAmount = await db.select({ 
      total: sum(bets.amount) 
    }).from(bets);

    // Ortalama bahis - amount sütunu kullan
    const averageBet = await db.select({ 
      avg: avg(bets.amount) 
    }).from(bets);

    // Popüler oyunlar - basit verilerle (eğer hiç bet yoksa boş array)
    const popularGamesQuery = await db.select({
      name: bets.gameName,
      plays: count(bets.id),
      revenue: sum(bets.amount)
    })
    .from(bets)
    .where(sql`${bets.gameName} IS NOT NULL`)
    .groupBy(bets.gameName)
    .orderBy(desc(count(bets.id)))
    .limit(5);

    const popularGames = popularGamesQuery.length > 0 
      ? popularGamesQuery.map(game => ({
          name: game.name || 'Bilinmeyen Oyun',
          plays: Number(game.plays) || 0,
          revenue: Number(game.revenue) || 0
        }))
      : []; // Boş array döndür eğer veri yoksa

    res.json({
      totalGames: totalGames[0]?.count || 0,
      totalBetAmount: totalBetAmount[0]?.total || 0,
      averageBet: averageBet[0]?.avg || 0,
      popularGames
    });

  } catch (error) {
    console.error('Game analytics error:', error);
    res.status(500).json({ error: 'Oyun analitikleri alınamadı' });
  }
});

export default router;