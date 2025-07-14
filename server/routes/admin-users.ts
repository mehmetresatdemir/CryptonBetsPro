import { Request, Response } from 'express';
import { db } from '../db.js';
import { users, transactions, bets } from '../../shared/schema.js';
import { eq, desc, like, and, gte, lte, count, sql } from 'drizzle-orm';

// Professional Admin Users API - 100% Authentic PostgreSQL Data
export async function getAdminUsers(req: Request, res: Response) {
  try {
    const {
      page = '1',
      limit = '10',
      sortBy = 'id',
      sortOrder = 'desc',
      search = '',
      status = '',
      role = '',
      minBalance = '0',
      maxBalance = '100000'
    } = req.query;

    console.log('👥 ADMIN USERS API: Fetching user data...');

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    // Base query conditions
    const conditions = [];
    
    if (search) {
      conditions.push(
        sql`(${users.username} ILIKE ${'%' + search + '%'} OR ${users.email} ILIKE ${'%' + search + '%'} OR ${users.fullName} ILIKE ${'%' + search + '%'})`
      );
    }
    
    if (status) {
      conditions.push(eq(users.status, status as string));
    }
    
    if (role) {
      conditions.push(eq(users.role, role as string));
    }
    
    const minBal = parseFloat(minBalance as string);
    const maxBal = parseFloat(maxBalance as string);
    conditions.push(gte(users.balance, minBal));
    conditions.push(lte(users.balance, maxBal));

    // Get total count
    const totalQuery = conditions.length > 0 
      ? db.select({ count: count() }).from(users).where(and(...conditions))
      : db.select({ count: count() }).from(users);
    
    const totalResult = await totalQuery;
    const total = Number(totalResult[0]?.count) || 0;

    // Get users with pagination
    let usersQuery = db.select({
      id: users.id,
      username: users.username,
      email: users.email,
      fullName: users.fullName,
      role: users.role,
      status: users.status,
      balance: users.balance,
      vipLevel: users.vipLevel,
      vipPoints: users.vipPoints,
      totalDeposits: users.totalDeposits,
      totalWithdrawals: users.totalWithdrawals,
      totalBets: users.totalBets,
      totalWins: users.totalWins,
      bonusBalance: users.bonusBalance,
      createdAt: users.createdAt,
      lastLogin: users.lastLogin,
      phone: users.phone,
      city: users.city,
      country: users.country
    }).from(users);

    if (conditions.length > 0) {
      usersQuery = usersQuery.where(and(...conditions));
    }

    // Apply sorting
    if (sortBy === 'id') {
      usersQuery = sortOrder === 'asc' 
        ? usersQuery.orderBy(users.id)
        : usersQuery.orderBy(desc(users.id));
    } else if (sortBy === 'username') {
      usersQuery = sortOrder === 'asc'
        ? usersQuery.orderBy(users.username)
        : usersQuery.orderBy(desc(users.username));
    } else if (sortBy === 'balance') {
      usersQuery = sortOrder === 'asc'
        ? usersQuery.orderBy(users.balance)
        : usersQuery.orderBy(desc(users.balance));
    } else if (sortBy === 'createdAt') {
      usersQuery = sortOrder === 'asc'
        ? usersQuery.orderBy(users.createdAt)
        : usersQuery.orderBy(desc(users.createdAt));
    }

    const usersResult = await usersQuery.limit(limitNum).offset(offset);

    // Get additional user statistics for each user
    const usersWithStats = await Promise.all(
      usersResult.map(async (user) => {
        // Get transaction count
        const transactionCountResult = await db.select({ count: count() })
          .from(transactions)
          .where(eq(transactions.userId, user.id));
        const transactionCount = Number(transactionCountResult[0]?.count) || 0;

        // Get bet count
        const betCountResult = await db.select({ count: count() })
          .from(bets)
          .where(eq(bets.userId, user.id));
        const betCount = Number(betCountResult[0]?.count) || 0;

        // Get last transaction
        const lastTransactionResult = await db.select({
          type: transactions.type,
          amount: transactions.amount,
          createdAt: transactions.createdAt
        })
        .from(transactions)
        .where(eq(transactions.userId, user.id))
        .orderBy(desc(transactions.createdAt))
        .limit(1);

        const lastTransaction = lastTransactionResult[0] || null;

        return {
          ...user,
          transactionCount,
          betCount,
          lastTransaction,
          // Calculate profit/loss
          profitLoss: (user.totalWins || 0) - (user.totalBets || 0),
          // VIP progress
          vipProgress: Math.min(((user.vipPoints || 0) % 1000) / 10, 100),
          // Activity score
          activityScore: Math.min((transactionCount * 10) + (betCount * 5), 100)
        };
      })
    );

    const response = {
      items: usersWithStats,
      _meta: {
        totalCount: total,
        pageCount: Math.ceil(total / limitNum),
        currentPage: pageNum,
        perPage: limitNum
      }
    };

    console.log(`👥 USERS DATA COLLECTED: ${usersWithStats.length} users loaded`);
    console.log(`   Total users: ${total}`);
    console.log(`   Page: ${pageNum}/${Math.ceil(total / limitNum)}`);

    res.json(response);

  } catch (error) {
    console.error('❌ ADMIN USERS API Error:', error);
    res.status(500).json({
      error: 'Failed to fetch users',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get user statistics summary
export async function getUserStatsSummary(req: Request, res: Response) {
  try {
    console.log('📊 USER STATS SUMMARY: Generating statistics...');

    // Total users
    const totalUsersResult = await db.select({ count: count() }).from(users);
    const totalUsers = Number(totalUsersResult[0]?.count) || 0;

    // Active users (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeUsersResult = await db.select({ count: count() })
      .from(users)
      .where(gte(users.lastLogin, thirtyDaysAgo));
    const activeUsers = Number(activeUsersResult[0]?.count) || 0;

    // New users today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newUsersTodayResult = await db.select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, today));
    const newUsersToday = Number(newUsersTodayResult[0]?.count) || 0;

    // VIP users
    const vipUsersResult = await db.select({ count: count() })
      .from(users)
      .where(gte(users.vipLevel, 1));
    const vipUsers = Number(vipUsersResult[0]?.count) || 0;

    // Status distribution
    const statusStats = await db.select({
      status: users.status,
      count: count()
    }).from(users).groupBy(users.status);

    // Role distribution  
    const roleStats = await db.select({
      role: users.role,
      count: count()
    }).from(users).groupBy(users.role);

    const summary = {
      totalUsers,
      activeUsers,
      newUsersToday,
      vipUsers,
      inactiveUsers: totalUsers - activeUsers,
      statusDistribution: statusStats.map(s => ({
        status: s.status,
        count: Number(s.count)
      })),
      roleDistribution: roleStats.map(r => ({
        role: r.role,
        count: Number(r.count)
      }))
    };

    console.log('📊 USER STATS SUMMARY COMPLETED');
    res.json(summary);

  } catch (error) {
    console.error('❌ USER STATS SUMMARY Error:', error);
    res.status(500).json({
      error: 'Failed to fetch user statistics',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Update user status
export async function updateUserStatus(req: Request, res: Response) {
  try {
    const { userId, status } = req.body;

    if (!userId || !status) {
      return res.status(400).json({ error: 'User ID and status are required' });
    }

    await db.update(users)
      .set({ status })
      .where(eq(users.id, userId));

    console.log(`👥 USER STATUS UPDATED: User ${userId} status changed to ${status}`);
    
    res.json({ 
      success: true, 
      message: 'User status updated successfully' 
    });

  } catch (error) {
    console.error('❌ UPDATE USER STATUS Error:', error);
    res.status(500).json({
      error: 'Failed to update user status',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Update user balance
export async function updateUserBalance(req: Request, res: Response) {
  try {
    const { userId, balance, type = 'manual' } = req.body;

    if (!userId || balance === undefined) {
      return res.status(400).json({ error: 'User ID and balance are required' });
    }

    const newBalance = parseFloat(balance);
    if (isNaN(newBalance) || newBalance < 0) {
      return res.status(400).json({ error: 'Invalid balance amount' });
    }

    await db.update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, userId));

    console.log(`💰 USER BALANCE UPDATED: User ${userId} balance set to ₺${newBalance}`);
    
    res.json({ 
      success: true, 
      message: 'User balance updated successfully',
      newBalance 
    });

  } catch (error) {
    console.error('❌ UPDATE USER BALANCE Error:', error);
    res.status(500).json({
      error: 'Failed to update user balance',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Get user bets
export async function getUserBets(req: Request, res: Response) {
  try {
    const userId = parseInt(req.params.userId);
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    console.log(`🎲 USER BETS: Fetching bets for user ${userId}`);

    // Get user bets with pagination
    const userBetsResult = await db.select({
      id: bets.id,
      userId: bets.userId,
      gameId: bets.gameId,
      gameName: bets.gameName,
      betAmount: bets.betAmount,
      winAmount: bets.winAmount,
      status: bets.status,
      createdAt: bets.createdAt
    })
    .from(bets)
    .where(eq(bets.userId, userId))
    .orderBy(desc(bets.createdAt))
    .limit(limit)
    .offset(offset);

    // Get total count
    const totalResult = await db.select({ count: count() })
      .from(bets)
      .where(eq(bets.userId, userId));
    const total = Number(totalResult[0]?.count) || 0;

    // Format bets data
    const formattedBets = userBetsResult.map(bet => ({
      id: bet.id,
      userId: bet.userId,
      gameId: bet.gameId,
      gameName: bet.gameName || `Game #${bet.gameId}`,
      amount: Number(bet.betAmount) || 0,
      winAmount: Number(bet.winAmount) || 0,
      status: bet.status,
      createdAt: bet.createdAt?.toISOString() || new Date().toISOString()
    }));

    console.log(`🎲 USER BETS: Found ${formattedBets.length} bets for user ${userId}`);

    res.json({
      bets: formattedBets,
      total,
      page: Math.floor(offset / limit) + 1,
      limit,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('❌ User bets API error:', error);
    res.status(500).json({
      error: 'Failed to fetch user bets',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}