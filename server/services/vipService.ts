import { pool } from '../db';

// VIP seviyeleri ve gereksinimleri - Kullanıcılar VIP 0 ile başlar
export const VIP_LEVELS = {
  0: { name: 'Bronz', minDeposit: 0, bonusMultiplier: 1.0, withdrawalLimit: 5000 },
  1: { name: 'Gümüş', minDeposit: 10000, bonusMultiplier: 1.2, withdrawalLimit: 15000 },
  2: { name: 'Altın', minDeposit: 50000, bonusMultiplier: 1.5, withdrawalLimit: 75000 },
  3: { name: 'Platin', minDeposit: 100000, bonusMultiplier: 2.0, withdrawalLimit: 150000 },
  4: { name: 'Elmas', minDeposit: 250000, bonusMultiplier: 3.0, withdrawalLimit: 500000 },
  5: { name: 'Kraliyet', minDeposit: 500000, bonusMultiplier: 5.0, withdrawalLimit: 1000000 }
};

export interface VipUser {
  id: number;
  username: string;
  totalDeposits: number;
  currentVipLevel: number;
  vipPoints: number;
}

export class VipService {
  // Kullanıcının VIP seviyesini otomatik güncelle
  async updateUserVipLevel(userId: number): Promise<void> {
    try {
      // Kullanıcının toplam yatırım miktarını getir
      const userQuery = `
        SELECT id, username, total_deposits, vip_level, vip_points 
        FROM users 
        WHERE id = $1
      `;
      const { rows: userRows } = await pool.query(userQuery, [userId]);
      
      if (!userRows.length) {
        throw new Error('Kullanıcı bulunamadı');
      }
      
      const user = userRows[0];
      const currentLevel = user.vip_level || 0;
      const totalDeposits = user.total_deposits || 0;
      
      // Yeni VIP seviyesini hesapla
      let newLevel = 0;
      for (const [level, requirements] of Object.entries(VIP_LEVELS)) {
        const levelNum = parseInt(level);
        if (totalDeposits >= requirements.minDeposit) {
          newLevel = levelNum;
        }
      }
      
      // Seviye değişti mi kontrol et
      if (newLevel !== currentLevel) {
        // VIP seviyesini güncelle
        await pool.query(
          `UPDATE users SET vip_level = $1 WHERE id = $2`,
          [newLevel, userId]
        );
        
        // VIP seviye geçmişi kaydet
        await this.recordVipLevelChange(userId, currentLevel, newLevel, 'AUTO_UPGRADE');
        
        // Seviye yükseldiyse bonus ver
        if (newLevel > currentLevel) {
          await this.awardVipUpgradeBonus(userId, newLevel);
        }
        
        console.log(`Kullanıcı ${userId} VIP seviyesi ${currentLevel} -> ${newLevel} güncellendi`);
      }
    } catch (error) {
      console.error('VIP seviye güncelleme hatası:', error);
      throw error;
    }
  }
  
  // VIP seviye değişikliğini kaydet
  private async recordVipLevelChange(
    userId: number, 
    oldLevel: number, 
    newLevel: number, 
    reason: string
  ): Promise<void> {
    try {
      const insertQuery = `
        INSERT INTO vip_level_history (user_id, old_level, new_level, reason, created_at)
        VALUES ($1, $2, $3, $4, NOW())
      `;
      await pool.query(insertQuery, [userId, oldLevel, newLevel, reason]);
    } catch (error) {
      console.error('VIP geçmiş kaydetme hatası:', error);
    }
  }
  
  // VIP seviye yükseltme bonusu ver
  private async awardVipUpgradeBonus(userId: number, newLevel: number): Promise<void> {
    try {
      const levelInfo = VIP_LEVELS[newLevel as keyof typeof VIP_LEVELS];
      if (!levelInfo) return;
      
      // Bonus miktarını hesapla (seviye * 100 TL)
      const bonusAmount = newLevel * 100;
      
      // Kullanıcının bakiyesini güncelle
      await pool.query(
        `UPDATE users SET balance = balance + $1 WHERE id = $2`,
        [bonusAmount, userId]
      );
      
      // Bonus işlemini kaydet
      await pool.query(`
        INSERT INTO transactions (user_id, type, amount, status, description, created_at)
        VALUES ($1, 'bonus', $2, 'completed', $3, NOW())
      `, [
        userId, 
        bonusAmount, 
        `VIP ${levelInfo.name} seviye yükseltme bonusu`
      ]);
      
      console.log(`Kullanıcı ${userId} için ${bonusAmount} TL VIP bonus verildi`);
    } catch (error) {
      console.error('VIP bonus verme hatası:', error);
    }
  }
  
  // Kullanıcının VIP bilgilerini getir
  async getUserVipInfo(userId: number): Promise<any> {
    try {
      const userQuery = `
        SELECT id, username, total_deposits, vip_level, vip_points, balance
        FROM users 
        WHERE id = $1
      `;
      const { rows } = await pool.query(userQuery, [userId]);
      
      if (!rows.length) {
        throw new Error('Kullanıcı bulunamadı');
      }
      
      const user = rows[0];
      const currentLevel = user.vip_level || 0;
      const nextLevel = currentLevel + 1;
      
      const currentLevelInfo = VIP_LEVELS[currentLevel as keyof typeof VIP_LEVELS];
      const nextLevelInfo = VIP_LEVELS[nextLevel as keyof typeof VIP_LEVELS];
      
      return {
        currentLevel: {
          level: currentLevel,
          name: currentLevelInfo?.name || 'Bronz',
          bonusMultiplier: currentLevelInfo?.bonusMultiplier || 1.0,
          withdrawalLimit: currentLevelInfo?.withdrawalLimit || 5000
        },
        nextLevel: nextLevelInfo ? {
          level: nextLevel,
          name: nextLevelInfo.name,
          requiredDeposit: nextLevelInfo.minDeposit,
          remainingDeposit: Math.max(0, nextLevelInfo.minDeposit - (user.total_deposits || 0))
        } : null,
        totalDeposits: user.total_deposits || 0,
        vipPoints: user.vip_points || 0,
        progress: nextLevelInfo ? 
          Math.min(100, ((user.total_deposits || 0) / nextLevelInfo.minDeposit) * 100) : 100
      };
    } catch (error) {
      console.error('VIP bilgi getirme hatası:', error);
      throw error;
    }
  }
  
  // Tüm kullanıcıların VIP seviyelerini kontrol et ve güncelle
  async updateAllVipLevels(): Promise<void> {
    try {
      const usersQuery = `
        SELECT id FROM users WHERE is_active = true
      `;
      const { rows } = await pool.query(usersQuery);
      
      console.log(`${rows.length} kullanıcının VIP seviyesi kontrol ediliyor...`);
      
      for (const user of rows) {
        await this.updateUserVipLevel(user.id);
      }
      
      console.log('Tüm VIP seviye güncellemeleri tamamlandı');
    } catch (error) {
      console.error('Toplu VIP güncelleme hatası:', error);
      throw error;
    }
  }
}

export const vipService = new VipService();