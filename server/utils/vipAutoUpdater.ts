import { VipService } from '../services/vipService';
import { db } from '../db';

const vipService = new VipService();

// Tüm kullanıcıların VIP seviyelerini kontrol et ve güncelle
export async function updateAllUserVipLevels(): Promise<void> {
  try {
    console.log('Tüm kullanıcı VIP seviyeleri kontrol ediliyor...');
    
    // Aktif kullanıcıları getir
    const result = await pool.query(`
      SELECT id, username, total_deposits, vip_level 
      FROM users 
      WHERE status = 'active' AND total_deposits > 0
      ORDER BY total_deposits DESC
    `);
    
    let updatedCount = 0;
    
    for (const user of result.rows) {
      try {
        const oldLevel = user.vip_level || 0;
        await vipService.updateUserVipLevel(user.id);
        
        // Seviye değişti mi kontrol et
        const updatedUser = await pool.query(
          'SELECT vip_level FROM users WHERE id = $1',
          [user.id]
        );
        
        const newLevel = updatedUser.rows[0].vip_level;
        
        if (newLevel !== oldLevel) {
          updatedCount++;
          console.log(`${user.username}: VIP ${oldLevel} → VIP ${newLevel} (${user.total_deposits} TL)`);
        }
      } catch (error) {
        console.error(`Kullanıcı ${user.username} VIP güncelleme hatası:`, error);
      }
    }
    
    console.log(`VIP güncelleme tamamlandı. ${updatedCount} kullanıcının seviyesi güncellendi.`);
  } catch (error) {
    console.error('VIP toplu güncelleme hatası:', error);
  }
}

// Her 10 dakikada bir VIP seviyelerini kontrol et
export function startVipAutoUpdater(): void {
  console.log('VIP otomatik güncelleme sistemi başlatıldı');
  
  // İlk güncellemeli yapare
  updateAllUserVipLevels();
  
  // Her 10 dakikada bir tekrarla
  setInterval(updateAllUserVipLevels, 10 * 60 * 1000);
}