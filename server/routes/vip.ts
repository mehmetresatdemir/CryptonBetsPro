import { Router, Response } from 'express';
import { requireAdminAuth, validateVipChange, validateBonusAmount, AdminRequest } from '../middleware/adminSecurity';
import { db, pool } from '../db';
import { users } from '@shared/schema';
import { eq } from 'drizzle-orm';
import { SecurityLogger } from '../utils/securityLogger';

const router = Router();

// VIP seviye değiştirme - SADECE ADMIN
router.post('/change-level', requireAdminAuth, validateVipChange, async (req: AdminRequest, res: Response) => {
  try {
    const { userId, newLevel, reason } = req.body;
    const adminId = req.admin!.id;
    
    // Kullanıcı var mı kontrol et
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    const oldLevel = user[0].vipLevel || 0;
    
    // VIP seviyesini güncelle
    await db.update(users)
      .set({ vipLevel: newLevel })
      .where(eq(users.id, userId));
    
    // VIP seviye değişiklik geçmişi kaydet
    await pool.query(
      'INSERT INTO vip_level_history (user_id, old_level, new_level, reason, created_at) VALUES ($1, $2, $3, $4, NOW())',
      [userId, oldLevel, newLevel, `ADMIN_CHANGE: ${reason}`]
    );
    
    // Güvenlik logu kaydet
    SecurityLogger.logVipChange(adminId, userId, oldLevel, newLevel, reason);
    
    res.json({ 
      success: true, 
      message: 'VIP seviyesi güncellendi',
      oldLevel,
      newLevel
    });
  } catch (error) {
    console.error('VIP seviye değiştirme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

// Manuel bonus verme - SADECE ADMIN
router.post('/give-bonus', requireAdminAuth, validateBonusAmount, async (req: AdminRequest, res: Response) => {
  try {
    const { userId, amount, description } = req.body;
    const adminId = req.admin!.id;
    
    // Kullanıcı var mı kontrol et
    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!user.length) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }
    
    // Bonus bakiyeyi güncelle
    const currentBonusBalance = user[0].bonusBalance || 0;
    const newBonusBalance = currentBonusBalance + amount;
    
    await db.update(users)
      .set({ bonusBalance: newBonusBalance })
      .where(eq(users.id, userId));
    
    // Güvenlik logu kaydet
    SecurityLogger.logBonusGiven(adminId, userId, amount, description || 'Manuel bonus');
    
    res.json({ 
      success: true, 
      message: 'Bonus başarıyla verildi',
      amount,
      newBonusBalance
    });
  } catch (error) {
    console.error('Bonus verme hatası:', error);
    res.status(500).json({ error: 'Sunucu hatası' });
  }
});

export default router;