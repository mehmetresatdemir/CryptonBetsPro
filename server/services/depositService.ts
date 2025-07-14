import { db } from '../db';
import { VipService } from './vipService';

const vipService = new VipService();

export class DepositService {
  // Para yatırma işlemi ve VIP seviye güncelleme
  async processDeposit(userId: number, amount: number, paymentMethod: string): Promise<void> {
    try {
      // Transaction başlat
      await pool.query('BEGIN');
      
      // Kullanıcının bakiyesini güncelle
      await pool.query(
        'UPDATE users SET balance = balance + $1 WHERE id = $2',
        [amount, userId]
      );
      
      // Total deposits güncelle
      await pool.query(
        'UPDATE users SET total_deposits = COALESCE(total_deposits, 0) + $1 WHERE id = $2',
        [amount, userId]
      );
      
      // Transaction kaydet
      await pool.query(`
        INSERT INTO transactions (user_id, type, amount, status, description, payment_method, created_at)
        VALUES ($1, 'deposit', $2, 'completed', $3, $4, NOW())
      `, [userId, amount, `Para yatırma - ${paymentMethod}`, paymentMethod]);
      
      // VIP seviyesini kontrol et ve güncelle
      await vipService.updateUserVipLevel(userId);
      
      await pool.query('COMMIT');
      
      console.log(`Kullanıcı ${userId} için ${amount} TL para yatırma işlemi tamamlandı`);
    } catch (error) {
      await pool.query('ROLLBACK');
      console.error('Para yatırma işlemi hatası:', error);
      throw error;
    }
  }
  
  // Kullanıcının toplam para yatırma miktarını getir
  async getUserTotalDeposits(userId: number): Promise<number> {
    try {
      const result = await pool.query(
        'SELECT COALESCE(total_deposits, 0) as total FROM users WHERE id = $1',
        [userId]
      );
      
      return result.rows[0]?.total || 0;
    } catch (error) {
      console.error('Toplam para yatırma getirme hatası:', error);
      return 0;
    }
  }
}

export const depositService = new DepositService();