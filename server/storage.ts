import { eq, and, desc, asc, sql, like, or, gte, lte } from 'drizzle-orm';
import {
  users, games, casinoGames, newsItems, bets, transactions, slotegratorGames, gameFavorites, gameSessions, kycDocuments, adminLogs, bonuses, gameStats,
  type User, type Game, type CasinoGame, type NewsItem, type Bet, type Transaction, type SlotegratorGame, type GameFavorite, type GameSession, type KycDocument, type AdminLog, type Bonus, type GameStats,
  type InsertUser, type InsertBet, type InsertTransaction, type InsertSlotegratorGame, type InsertGameFavorite, type InsertGameSession, type InsertKycDocument, type InsertAdminLog, type InsertBonus, type InsertGameStats
} from "@shared/schema";
import { db } from "./db";

// Export db for other modules
export { db };

// Storage interface
export interface IStorage {
  // Kullanıcı işlemleri
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, amount: number): Promise<User>;
  getAllUsers(filter?: string, offset?: number, limit?: number, sortBy?: string, sortOrder?: 'asc' | 'desc'): Promise<User[]>;
  getUserCount(filter?: string): Promise<number>;
  updateUserStatus(userId: number, status: string): Promise<User>;
  updateUser(userId: number, userData: Partial<InsertUser>): Promise<User>;
  deleteUser(userId: number): Promise<boolean>;
  
  // Gerçek oyun session işlemleri
  createGameSession(session: InsertGameSession): Promise<GameSession>;
  getGameSession(sessionId: string): Promise<GameSession | undefined>;
  updateGameSession(sessionId: string, updateData: Partial<GameSession>): Promise<GameSession>;
  getActiveGameSessions(userId: number): Promise<GameSession[]>;
  endGameSession(sessionId: string): Promise<boolean>;
  
  // Oyun işlemleri
  getGames(categoryFilter?: string, limit?: number): Promise<Game[]>;
  getGame(id: number): Promise<Game | undefined>;
  createGame(game: any): Promise<Game>;
  
  // Casino oyun işlemleri
  getCasinoGames(limit?: number): Promise<CasinoGame[]>;
  getCasinoGame(id: number): Promise<CasinoGame | undefined>;
  createCasinoGame(game: any): Promise<CasinoGame>;
  
  // Haber işlemleri
  getNewsItems(typeFilter?: string, limit?: number): Promise<NewsItem[]>;
  getNewsItem(id: number): Promise<NewsItem | undefined>;
  createNewsItem(newsItem: any): Promise<NewsItem>;
  
  // Bahis işlemleri
  getBetsByUser(userId: number): Promise<Bet[]>;
  createBet(bet: InsertBet): Promise<Bet>;
  updateBetStatus(betId: number, status: string, winAmount?: number): Promise<Bet>;
  
  // Para çekme işlemleri
  getWithdrawals(options?: { page?: number; limit?: number }): Promise<any[]>;
  getWithdrawalStats(): Promise<any>;
  getBetByActionId(actionId: string): Promise<Bet | undefined>;
  getUserById(userId: number): Promise<User | undefined>;
  
  // İşlem işlemleri
  getTransactionsByUser(userId: number, limit?: number): Promise<Transaction[]>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  updateTransaction(transactionId: number, updateData: Partial<Transaction>): Promise<Transaction>;
  getTransactionById(id: number): Promise<Transaction | undefined>;
  getRecentTransactions(limit?: number): Promise<Transaction[]>;
  getFilteredTransactions(options: {
    type?: string;
    status?: string;
    userId?: number;
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Transaction[]>;
  
  // KYC doğrulama işlemleri
  getKycVerificationsByUser(userId: number): Promise<KycDocument | undefined>;
  createKycVerification(kycVerification: InsertKycDocument): Promise<KycDocument>;
  updateKycVerificationStatus(kycId: number, status: string, rejectionReason?: string, reviewedBy?: number): Promise<KycDocument>;
  getPendingKycVerifications(limit?: number): Promise<KycDocument[]>;
  getKycVerificationById(id: number): Promise<KycDocument | undefined>;
}

// Database storage implementation
export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserBalance(userId: number, amount: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ balance: amount })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getAllUsers(filter?: string, offset: number = 0, limit: number = 50, sortBy: string = 'id', sortOrder: 'asc' | 'desc' = 'desc'): Promise<User[]> {
    let query = db.select().from(users);

    if (filter) {
      query = query.where(
        or(
          like(users.username, `%${filter}%`),
          like(users.email, `%${filter}%`),
          like(users.firstName, `%${filter}%`),
          like(users.lastName, `%${filter}%`)
        )
      ) as any;
    }

    const column = (users as any)[sortBy] || users.id;
    if (sortOrder === 'asc') {
      query = query.orderBy(asc(column)) as any;
    } else {
      query = query.orderBy(desc(column)) as any;
    }

    return await query.limit(limit).offset(offset);
  }

  async getUserCount(filter?: string): Promise<number> {
    let query = db.select({ count: sql<number>`count(*)` }).from(users);

    if (filter) {
      query = query.where(
        or(
          like(users.username, `%${filter}%`),
          like(users.email, `%${filter}%`),
          like(users.firstName, `%${filter}%`),
          like(users.lastName, `%${filter}%`)
        )
      ) as any;
    }

    const [result] = await query;
    return result.count;
  }

  async updateUserStatus(userId: number, status: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ status })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateUser(userId: number, userData: Partial<InsertUser>): Promise<User> {
    if (userData.firstName && userData.lastName && !userData.fullName) {
      userData.fullName = `${userData.firstName} ${userData.lastName}`;
    }

    const [user] = await db
      .update(users)
      .set(userData)
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async deleteUser(userId: number): Promise<boolean> {
    const result = await db.delete(users).where(eq(users.id, userId));
    return result.rowCount !== null && result.rowCount > 0;
  }

  async getGames(categoryFilter?: string, limit?: number): Promise<Game[]> {
    let query = db.select().from(games).where(eq(games.isActive, true));

    if (categoryFilter) {
      query = db.select().from(games).where(and(eq(games.isActive, true), eq(games.category, categoryFilter)));
    }

    if (limit) {
      query = query.limit(limit) as any;
    }

    return await query.orderBy(desc(games.createdAt));
  }

  async getGame(id: number): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, id));
    return game || undefined;
  }

  async createGame(game: any): Promise<Game> {
    const [newGame] = await db.insert(games).values(game).returning();
    return newGame;
  }

  async getCasinoGames(limit?: number): Promise<CasinoGame[]> {
    let query = db.select().from(casinoGames).where(eq(casinoGames.isActive, true));

    if (limit) {
      query = query.limit(limit) as any;
    }

    return await query.orderBy(desc(casinoGames.createdAt));
  }

  async getCasinoGame(id: number): Promise<CasinoGame | undefined> {
    const [game] = await db.select().from(casinoGames).where(eq(casinoGames.id, id));
    return game || undefined;
  }

  async createCasinoGame(game: any): Promise<CasinoGame> {
    const [newGame] = await db.insert(casinoGames).values(game).returning();
    return newGame;
  }

  async getNewsItems(typeFilter?: string, limit?: number): Promise<NewsItem[]> {
    let query = db.select().from(newsItems).where(eq(newsItems.isActive, true));

    if (typeFilter) {
      query = db.select().from(newsItems).where(and(eq(newsItems.isActive, true), eq(newsItems.type, typeFilter)));
    }

    if (limit) {
      query = query.limit(limit) as any;
    }

    return await query.orderBy(desc(newsItems.createdAt));
  }

  async getNewsItem(id: number): Promise<NewsItem | undefined> {
    const [newsItem] = await db.select().from(newsItems).where(eq(newsItems.id, id));
    return newsItem || undefined;
  }

  async createNewsItem(newsItem: any): Promise<NewsItem> {
    const [newNewsItem] = await db.insert(newsItems).values(newsItem).returning();
    return newNewsItem;
  }

  async getBetsByUser(userId: number): Promise<Bet[]> {
    return await db.select().from(bets).where(eq(bets.userId, userId)).orderBy(desc(bets.createdAt));
  }

  async createBet(bet: any): Promise<any> {
    const result = await db.execute(sql`
      INSERT INTO bet_transactions (
        action_id, bet_id, user_id, session_id, game_uuid, 
        amount, win_amount, balance_before, balance_after, 
        currency, status, round_id
      ) VALUES (
        ${bet.actionId}, ${bet.betId}, ${bet.userId}, ${bet.sessionId}, ${bet.gameUuid},
        ${bet.amount}, ${bet.winAmount}, ${bet.balanceBefore}, ${bet.balanceAfter},
        ${bet.currency}, ${bet.status}, ${bet.roundId}
      ) RETURNING *
    `);
    return result.rows[0];
  }

  async getBetByActionId(actionId: string): Promise<any | undefined> {
    // actionId field doesn't exist in current bets table schema
    // Use id instead or implement proper actionId field
    const [bet] = await db.select().from(bets).where(eq(bets.id, parseInt(actionId) || 0));
    return bet || undefined;
  }

  async getUserById(userId: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user || undefined;
  }

  async updateBetStatus(betId: number, status: string, winAmount?: number): Promise<Bet> {
    const updateData: any = { status };
    if (winAmount !== undefined) {
      updateData.winAmount = winAmount.toString();
      updateData.completedAt = new Date();
    }

    const [bet] = await db
      .update(bets)
      .set(updateData)
      .where(eq(bets.id, betId))
      .returning();
    return bet;
  }

  async getTransactionsByUser(userId: number, limit: number = 50): Promise<any[]> {
    return await db
      .select({
        id: transactions.id,
        userId: transactions.userId,
        type: transactions.type,
        amount: transactions.amount,
        status: transactions.status,
        description: transactions.description,
        paymentMethod: transactions.paymentMethod,
        createdAt: transactions.createdAt,
        updatedAt: transactions.updatedAt
      })
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const [newTransaction] = await db
      .insert(transactions)
      .values(transaction)
      .returning();
    return newTransaction;
  }

  async getTransactionById(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction || undefined;
  }

  async updateTransaction(transactionId: number, updateData: Partial<Transaction>): Promise<Transaction> {
    const [transaction] = await db
      .update(transactions)
      .set(updateData)
      .where(eq(transactions.id, transactionId))
      .returning();
    return transaction;
  }

  async getRecentTransactions(limit: number = 50): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt))
      .limit(limit);
  }

  async getFilteredTransactions(options: {
    type?: string;
    status?: string;
    userId?: number;
    limit?: number;
    offset?: number;
    startDate?: Date;
    endDate?: Date;
  }): Promise<Transaction[]> {
    let query = db.select().from(transactions);
    const conditions = [];

    if (options.type) {
      conditions.push(eq(transactions.type, options.type));
    }
    if (options.status) {
      conditions.push(eq(transactions.status, options.status));
    }
    if (options.userId) {
      conditions.push(eq(transactions.userId, options.userId));
    }
    if (options.startDate) {
      conditions.push(gte(transactions.createdAt, options.startDate));
    }
    if (options.endDate) {
      conditions.push(lte(transactions.createdAt, options.endDate));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions)) as any;
    }

    query = query.orderBy(desc(transactions.createdAt)) as any;

    if (options.limit) {
      query = query.limit(options.limit) as any;
    }
    if (options.offset) {
      query = query.offset(options.offset) as any;
    }

    return await query;
  }

  async getKycVerificationsByUser(userId: number) {
    try {
      // Use direct SQL to avoid schema mismatch issues
      const result = await db.execute(sql`
        SELECT id, user_id, type, file_name, file_path, file_size, mime_type, status, uploaded_at, reviewed_at
        FROM kyc_documents 
        WHERE user_id = ${userId}
        ORDER BY uploaded_at DESC
      `);
      return result;
    } catch (error) {
      console.error('Error fetching KYC verifications:', error);
      return [];
    }
  }

  async createKycVerification(kycData: InsertKycDocument): Promise<KycDocument> {
    const [result] = await db
      .insert(kycDocuments)
      .values(kycData)
      .returning();
    return result;
  }

  async updateKycVerificationStatus(kycId: number, status: string, rejectionReason?: string, reviewedBy?: number): Promise<KycDocument> {
    const updateData: any = {
      status,
      reviewedAt: new Date()
    };

    if (rejectionReason) {
      updateData.rejectionReason = rejectionReason;
    }
    if (reviewedBy) {
      updateData.reviewedBy = reviewedBy;
    }

    const [kyc] = await db
      .update(kycDocuments)
      .set(updateData)
      .where(eq(kycDocuments.id, kycId))
      .returning();
    return kyc;
  }

  async getPendingKycVerifications(limit: number = 50): Promise<KycDocument[]> {
    return await db
      .select()
      .from(kycDocuments)
      .where(eq(kycDocuments.status, 'pending'))
      .orderBy(desc(kycDocuments.uploadedAt))
      .limit(limit);
  }

  async getKycVerificationById(id: number): Promise<KycDocument | undefined> {
    const [kyc] = await db.select().from(kycDocuments).where(eq(kycDocuments.id, id));
    return kyc || undefined;
  }

  // Gerçek oyun session işlemleri
  async createGameSession(session: InsertGameSession): Promise<GameSession> {
    const [result] = await db
      .insert(gameSessions)
      .values(session)
      .returning();
    return result;
  }

  async getGameSession(sessionId: string): Promise<GameSession | undefined> {
    const [session] = await db
      .select()
      .from(gameSessions)
      .where(eq(gameSessions.sessionId, sessionId));
    return session || undefined;
  }

  async updateGameSession(sessionId: string, updateData: Partial<GameSession>): Promise<GameSession> {
    const [session] = await db
      .update(gameSessions)
      .set(updateData)
      .where(eq(gameSessions.sessionId, sessionId))
      .returning();
    return session;
  }

  async getActiveGameSessions(userId: number): Promise<GameSession[]> {
    return await db
      .select()
      .from(gameSessions)
      .where(and(
        eq(gameSessions.userId, userId),
        eq(gameSessions.status, 'active')
      ))
      .orderBy(desc(gameSessions.createdAt));
  }

  async endGameSession(sessionId: string): Promise<boolean> {
    const result = await db
      .update(gameSessions)
      .set({ 
        status: 'completed',
        endedAt: new Date()
      })
      .where(eq(gameSessions.sessionId, sessionId));
    return (result.rowCount || 0) > 0;
  }

  // Para çekme işlemleri
  async getWithdrawals(options: { page?: number; limit?: number } = {}): Promise<any[]> {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const withdrawalList = await db
      .select({
        id: transactions.id,
        transactionId: transactions.transactionId,
        userId: transactions.userId,
        username: users.username,
        email: users.email,
        vipLevel: users.vipLevel,
        amount: transactions.amount,
        currency: transactions.currency,
        status: transactions.status,
        description: transactions.description,
        paymentMethod: transactions.paymentMethod,
        createdAt: transactions.createdAt
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .where(eq(transactions.type, 'withdrawal'))
      .orderBy(desc(transactions.createdAt))
      .limit(limit)
      .offset(offset);

    return withdrawalList.map(row => ({
      id: row.id,
      transactionId: row.transactionId || `TXN-${String(row.id).padStart(8, '0')}`,
      userId: row.userId,
      username: row.username || `User ${row.userId}`,
      email: row.email || '',
      vipLevel: row.vipLevel || 0,
      amount: parseFloat(row.amount),
      currency: row.currency || 'TRY',
      status: row.status,
      description: row.description || '',
      paymentMethod: row.paymentMethod || 'Bank Transfer',
      createdAt: row.createdAt
    }));
  }

  async getWithdrawalStats(): Promise<any> {
    const [stats] = await db
      .select({
        totalCount: sql<number>`count(*)::int`,
        totalAmount: sql<number>`coalesce(sum(${transactions.amount}::numeric), 0)`,
        avgAmount: sql<number>`coalesce(avg(${transactions.amount}::numeric), 0)`,
        pendingCount: sql<number>`count(case when ${transactions.status} = 'pending' then 1 end)::int`,
        approvedCount: sql<number>`count(case when ${transactions.status} = 'approved' then 1 end)::int`,
        completedCount: sql<number>`count(case when ${transactions.status} = 'completed' then 1 end)::int`,
        rejectedCount: sql<number>`count(case when ${transactions.status} = 'rejected' then 1 end)::int`
      })
      .from(transactions)
      .where(eq(transactions.type, 'withdrawal'));

    return {
      totalCount: stats.totalCount,
      totalAmount: stats.totalAmount,
      avgAmount: stats.avgAmount,
      statusBreakdown: {
        pending: stats.pendingCount,
        approved: stats.approvedCount,
        completed: stats.completedCount,
        rejected: stats.rejectedCount
      }
    };
  }
}

export const storage = new DatabaseStorage();