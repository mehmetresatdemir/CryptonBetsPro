import { pool } from '../db';

export interface FinancialReport {
  totalRevenue: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalBets: number;
  totalWins: number;
  houseEdge: number;
  activeUsers: number;
  newUsers: number;
  period: string;
}

export interface UserActivityReport {
  totalUsers: number;
  activeUsers: number;
  newRegistrations: number;
  averageSessionTime: number;
  topGames: Array<{
    gameName: string;
    totalBets: number;
    totalRevenue: number;
  }>;
}

export class ReportingService {
  // Finansal rapor oluştur
  async generateFinancialReport(startDate: string, endDate: string): Promise<FinancialReport> {
    try {
      // Toplam yatırım miktarı
      const depositsQuery = `
        SELECT COALESCE(SUM(amount), 0) as total_deposits
        FROM transactions 
        WHERE type = 'deposit' 
        AND status = 'completed'
        AND created_at >= $1 AND created_at <= $2
      `;
      const { rows: depositsRows } = await pool.query(depositsQuery, [startDate, endDate]);
      const totalDeposits = parseFloat(depositsRows[0].total_deposits) || 0;

      // Toplam çekim miktarı
      const withdrawalsQuery = `
        SELECT COALESCE(SUM(amount), 0) as total_withdrawals
        FROM transactions 
        WHERE type = 'withdrawal' 
        AND status = 'completed'
        AND created_at >= $1 AND created_at <= $2
      `;
      const { rows: withdrawalsRows } = await pool.query(withdrawalsQuery, [startDate, endDate]);
      const totalWithdrawals = parseFloat(withdrawalsRows[0].total_withdrawals) || 0;

      // Toplam bahis miktarı
      const betsQuery = `
        SELECT COALESCE(SUM(amount), 0) as total_bets
        FROM bets 
        WHERE created_at >= $1 AND created_at <= $2
      `;
      const { rows: betsRows } = await pool.query(betsQuery, [startDate, endDate]);
      const totalBets = parseFloat(betsRows[0].total_bets) || 0;

      // Toplam kazanç miktarı
      const winsQuery = `
        SELECT COALESCE(SUM(win_amount), 0) as total_wins
        FROM bets 
        WHERE win_amount > 0
        AND created_at >= $1 AND created_at <= $2
      `;
      const { rows: winsRows } = await pool.query(winsQuery, [startDate, endDate]);
      const totalWins = parseFloat(winsRows[0].total_wins) || 0;

      // Aktif kullanıcı sayısı
      const activeUsersQuery = `
        SELECT COUNT(DISTINCT user_id) as active_users
        FROM user_sessions 
        WHERE created_at >= $1 AND created_at <= $2
      `;
      const { rows: activeUsersRows } = await pool.query(activeUsersQuery, [startDate, endDate]);
      const activeUsers = parseInt(activeUsersRows[0].active_users) || 0;

      // Yeni kullanıcı sayısı
      const newUsersQuery = `
        SELECT COUNT(*) as new_users
        FROM users 
        WHERE created_at >= $1 AND created_at <= $2
      `;
      const { rows: newUsersRows } = await pool.query(newUsersQuery, [startDate, endDate]);
      const newUsers = parseInt(newUsersRows[0].new_users) || 0;

      // House edge hesapla
      const houseEdge = totalBets > 0 ? ((totalBets - totalWins) / totalBets) * 100 : 0;
      const totalRevenue = totalDeposits - totalWithdrawals;

      return {
        totalRevenue,
        totalDeposits,
        totalWithdrawals,
        totalBets,
        totalWins,
        houseEdge,
        activeUsers,
        newUsers,
        period: `${startDate} - ${endDate}`
      };
    } catch (error) {
      console.error('Finansal rapor oluşturma hatası:', error);
      throw error;
    }
  }

  // Kullanıcı aktivite raporu
  async generateUserActivityReport(startDate: string, endDate: string): Promise<UserActivityReport> {
    try {
      // Toplam kullanıcı sayısı
      const totalUsersQuery = `SELECT COUNT(*) as total_users FROM users`;
      const { rows: totalUsersRows } = await pool.query(totalUsersQuery);
      const totalUsers = parseInt(totalUsersRows[0].total_users) || 0;

      // Aktif kullanıcı sayısı (belirtilen dönemde işlem yapanlar)
      const activeUsersQuery = `
        SELECT COUNT(DISTINCT user_id) as active_users
        FROM transactions 
        WHERE created_at >= $1 AND created_at <= $2
      `;
      const { rows: activeUsersRows } = await pool.query(activeUsersQuery, [startDate, endDate]);
      const activeUsers = parseInt(activeUsersRows[0].active_users) || 0;

      // Yeni kayıtlar
      const newRegistrationsQuery = `
        SELECT COUNT(*) as new_registrations
        FROM users 
        WHERE created_at >= $1 AND created_at <= $2
      `;
      const { rows: newRegRows } = await pool.query(newRegistrationsQuery, [startDate, endDate]);
      const newRegistrations = parseInt(newRegRows[0].new_registrations) || 0;

      // En popüler oyunlar
      const topGamesQuery = `
        SELECT 
          game_name,
          COUNT(*) as total_bets,
          COALESCE(SUM(amount), 0) as total_revenue
        FROM bets 
        WHERE created_at >= $1 AND created_at <= $2
        GROUP BY game_name 
        ORDER BY total_revenue DESC 
        LIMIT 10
      `;
      const { rows: topGamesRows } = await pool.query(topGamesQuery, [startDate, endDate]);
      const topGames = topGamesRows.map(row => ({
        gameName: row.game_name,
        totalBets: parseInt(row.total_bets),
        totalRevenue: parseFloat(row.total_revenue)
      }));

      return {
        totalUsers,
        activeUsers,
        newRegistrations,
        averageSessionTime: 0, // Bu değer session tracking sistemi ile hesaplanabilir
        topGames
      };
    } catch (error) {
      console.error('Kullanıcı aktivite raporu oluşturma hatası:', error);
      throw error;
    }
  }

  // Günlük özet rapor
  async generateDailySummary(date: string): Promise<any> {
    try {
      const startDate = `${date} 00:00:00`;
      const endDate = `${date} 23:59:59`;

      const [financialReport, userReport] = await Promise.all([
        this.generateFinancialReport(startDate, endDate),
        this.generateUserActivityReport(startDate, endDate)
      ]);

      return {
        date,
        financial: financialReport,
        users: userReport,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Günlük özet rapor oluşturma hatası:', error);
      throw error;
    }
  }

  // VIP kullanıcı analizi
  async generateVipAnalysis(): Promise<any> {
    try {
      const vipAnalysisQuery = `
        SELECT 
          vip_level,
          COUNT(*) as user_count,
          COALESCE(AVG(total_deposits), 0) as avg_deposits,
          COALESCE(SUM(total_deposits), 0) as total_deposits,
          COALESCE(AVG(balance), 0) as avg_balance
        FROM users 
        WHERE vip_level > 0
        GROUP BY vip_level 
        ORDER BY vip_level DESC
      `;
      const { rows } = await pool.query(vipAnalysisQuery);

      return rows.map(row => ({
        vipLevel: parseInt(row.vip_level),
        userCount: parseInt(row.user_count),
        avgDeposits: parseFloat(row.avg_deposits),
        totalDeposits: parseFloat(row.total_deposits),
        avgBalance: parseFloat(row.avg_balance)
      }));
    } catch (error) {
      console.error('VIP analiz raporu oluşturma hatası:', error);
      throw error;
    }
  }

  // Riskli işlem analizi
  async generateRiskAnalysis(startDate: string, endDate: string): Promise<any> {
    try {
      // Büyük tutarlı işlemler
      const largeTransactionsQuery = `
        SELECT 
          user_id,
          type,
          amount,
          created_at,
          (SELECT username FROM users WHERE id = transactions.user_id) as username
        FROM transactions 
        WHERE amount > 10000 
        AND created_at >= $1 AND created_at <= $2
        ORDER BY amount DESC
        LIMIT 50
      `;
      const { rows: largeTransactions } = await pool.query(largeTransactionsQuery, [startDate, endDate]);

      // Hızlı işlem yapan kullanıcılar
      const rapidTransactionsQuery = `
        SELECT 
          user_id,
          COUNT(*) as transaction_count,
          (SELECT username FROM users WHERE id = transactions.user_id) as username
        FROM transactions 
        WHERE created_at >= $1 AND created_at <= $2
        GROUP BY user_id 
        HAVING COUNT(*) > 20
        ORDER BY transaction_count DESC
        LIMIT 20
      `;
      const { rows: rapidTransactions } = await pool.query(rapidTransactionsQuery, [startDate, endDate]);

      return {
        largeTransactions,
        rapidTransactions,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Risk analizi raporu oluşturma hatası:', error);
      throw error;
    }
  }
}

export const reportingService = new ReportingService();