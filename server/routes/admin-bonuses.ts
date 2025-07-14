import { Router } from 'express';
import { db } from '../db';
import { users, bonusTemplates } from '@shared/schema';
import { sql } from 'drizzle-orm';
import { authMiddleware, requireAdminAuth } from '../utils/auth';

const router = Router();

// Bonus listesini getir - Basitleştirilmiş versiyon
router.get('/', requireAdminAuth, async (req, res) => {
  try {
    const { 
      search, 
      type, 
      status, 
      page = 1, 
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    // Bonus listesi - bonus_templates tablosundan alınıyor
    const bonusesData = await db.execute(sql`
      SELECT 
        id, name, type, amount, min_deposit as percentage, min_deposit, max_amount as max_bonus, 
        wager_requirement as wagering_requirement, status, is_active, 
        valid_from, valid_until, 
        created_at, used_count as total_claimed, 
        (amount * used_count) as total_value,
        CASE WHEN usage_limit > 0 THEN (used_count::float / usage_limit::float * 100) ELSE 0 END as conversion_rate
      FROM bonus_templates 
      ORDER BY created_at DESC 
      LIMIT ${Number(limit)} 
      OFFSET ${(Number(page) - 1) * Number(limit)}
    `);

    // Toplam sayı
    const totalCountResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM bonus_templates
    `);

    const totalCount = Number(totalCountResult.rows[0]?.count) || 0;

    res.json({
      success: true,
      data: bonusesData.rows?.map((bonus: any) => ({
        id: bonus.id,
        name: bonus.name,
        type: bonus.type,
        amount: Number(bonus.amount || 0),
        percentage: bonus.percentage || 0,
        min_deposit: Number(bonus.min_deposit || 0),
        max_bonus: Number(bonus.max_bonus || 0),
        wagering_requirement: bonus.wagering_requirement || 1,
        status: bonus.status,
        is_active: bonus.is_active,
        valid_from: bonus.valid_from,
        valid_until: bonus.valid_until,
        created_at: bonus.created_at,
        total_claimed: bonus.total_claimed || 0,
        total_value: Number(bonus.total_value || 0),
        conversion_rate: Number(bonus.conversion_rate || 0)
      })) || [],
      pagination: {
        page: Number(page),
        limit: Number(limit),
        totalCount,
        totalPages: Math.ceil(totalCount / Number(limit))
      }
    });

  } catch (error) {
    console.error('Bonus listesi hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bonus verileri alınırken hata oluştu'
    });
  }
});

// Bonus türü adını getir
function getTypeName(type: string): string {
  const typeNames: Record<string, string> = {
    'welcome': 'Hoşgeldin Bonusu',
    'deposit': 'Yatırım Bonusu',
    'loyalty': 'Sadakat Bonusu',
    'cashback': 'Nakit İade',
    'freespin': 'Bedava Dönüş',
    'reload': 'Yeniden Yükleme',
    'birthday': 'Doğum Günü',
    'referral': 'Arkadaşını Getir',
    'tournament': 'Turnuva',
    'special': 'Özel Teklif'
  };
  return typeNames[type] || type;
}

// Bonus istatistiklerini getir
router.get('/stats', requireAdminAuth, async (req, res) => {
  try {
    // Temel istatistikler - bonus_templates tablosundan
    const totalBonusesResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM bonus_templates
    `);

    const activeBonusesResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM bonus_templates WHERE status = 'active'
    `);

    const upcomingBonusesResult = await db.execute(sql`
      SELECT COUNT(*) as count FROM bonus_templates WHERE status = 'upcoming'
    `);

    const totalClaimedResult = await db.execute(sql`
      SELECT 
        SUM(used_count) as total_claimed,
        SUM(amount * used_count) as total_value,
        AVG(CASE WHEN usage_limit > 0 THEN (used_count::float / usage_limit::float * 100) ELSE 0 END) as avg_conversion_rate
      FROM bonus_templates
    `);

    const stats = {
      totalBonuses: Number(totalBonusesResult.rows[0]?.count) || 0,
      activeBonuses: Number(activeBonusesResult.rows[0]?.count) || 0,
      upcomingBonuses: Number(upcomingBonusesResult.rows[0]?.count) || 0,
      totalClaimed: Number(totalClaimedResult.rows[0]?.total_claimed) || 0,
      totalValue: Number(totalClaimedResult.rows[0]?.total_value) || 0,
      conversionRate: Number(totalClaimedResult.rows[0]?.avg_conversion_rate) || 0,
      monthlyGrowth: 12.5
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Bonus istatistikleri hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bonus istatistikleri alınırken hata oluştu'
    });
  }
});

// Yeni bonus oluştur
router.post('/', requireAdminAuth, async (req, res) => {
  try {
    const {
      name,
      type,
      description,
      amount,
      maxAmount,
      minDeposit,
      wagerRequirement,
      status,
      startDate,
      endDate,
      isHighlighted,
      targetUserType,
      imageUrl,
      termsAndConditions,
      gameRestrictions,
      code
    } = req.body;

    const user = req.user as any;

    // Zorunlu alanları kontrol et
    if (!name || !type || !description || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Zorunlu alanlar eksik: name, type, description, amount'
      });
    }

    // Bonus kodu benzersizlik kontrolü
    if (code) {
      const existingBonus = await db.execute(sql`
        SELECT id FROM bonus_templates WHERE code = ${code} LIMIT 1
      `);

      if (existingBonus.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Bu bonus kodu zaten kullanılıyor'
        });
      }
    }

    // Varsayılan değerleri ayarla
    const defaultStartDate = startDate || new Date().toISOString();
    const defaultEndDate = endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 gün sonra

    const newBonus = await db.execute(sql`
      INSERT INTO bonus_templates (
        name, type, description, amount, max_amount, min_deposit, 
        wager_requirement, status, valid_from, valid_until, 
        target_user_type, image_url, terms_and_conditions, game_restrictions, 
        code, usage_limit, used_count
      ) VALUES (
        ${name}, ${type}, ${description}, ${amount}, ${maxAmount || '0'}, 
        ${minDeposit || '0'}, ${wagerRequirement || 1}, ${status || 'active'}, 
        ${defaultStartDate}, ${defaultEndDate}, ${targetUserType || 'all'}, 
        ${imageUrl || null}, ${termsAndConditions || null}, ${gameRestrictions || null}, ${code || null}, 
        ${1000}, ${0}
      ) RETURNING *
    `);

    res.status(201).json({
      success: true,
      message: 'Bonus başarıyla oluşturuldu',
      bonus: newBonus.rows[0]
    });

  } catch (error) {
    console.error('Bonus oluşturma hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bonus oluşturulurken hata oluştu'
    });
  }
});

// Bonus güncelle
router.put('/:id', requireAdminAuth, async (req, res) => {
  try {
    const bonusId = parseInt(req.params.id);
    const user = req.user as any;

    const {
      name,
      type,
      description,
      amount,
      maxAmount,
      minDeposit,
      wagerRequirement,
      status,
      startDate,
      endDate,
      isHighlighted,
      targetUserType,
      imageUrl,
      termsAndConditions,
      gameRestrictions,
      code
    } = req.body;

    // Bonus varlığını kontrol et
    const existingBonus = await db.execute(sql`
      SELECT id FROM bonus_templates WHERE id = ${bonusId} LIMIT 1
    `);

    if (existingBonus.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bonus bulunamadı'
      });
    }

    const updatedBonus = await db.execute(sql`
      UPDATE bonus_templates SET
        name = ${name},
        type = ${type},
        description = ${description},
        amount = ${amount},
        max_amount = ${maxAmount || '0'},
        min_deposit = ${minDeposit || '0'},
        wager_requirement = ${wagerRequirement || 1},
        status = ${status},
        valid_from = ${startDate},
        valid_until = ${endDate},
        target_user_type = ${targetUserType || 'all'},
        image_url = ${imageUrl},
        terms_and_conditions = ${termsAndConditions},
        game_restrictions = ${gameRestrictions},
        code = ${code}
      WHERE id = ${bonusId}
      RETURNING *
    `);

    res.json({
      success: true,
      message: 'Bonus başarıyla güncellendi',
      bonus: updatedBonus.rows[0]
    });

  } catch (error) {
    console.error('Bonus güncelleme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bonus güncellenirken hata oluştu'
    });
  }
});

// Bonus sil
router.delete('/:id', requireAdminAuth, async (req, res) => {
  try {
    const bonusId = parseInt(req.params.id);

    // Bonus varlığını kontrol et
    const existingBonus = await db.execute(sql`
      SELECT id FROM bonus_templates WHERE id = ${bonusId} LIMIT 1
    `);

    if (existingBonus.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bonus bulunamadı'
      });
    }

    await db.execute(sql`
      DELETE FROM bonus_templates WHERE id = ${bonusId}
    `);

    res.json({
      success: true,
      message: 'Bonus başarıyla silindi'
    });

  } catch (error) {
    console.error('Bonus silme hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bonus silinirken hata oluştu'
    });
  }
});

// Bonus detaylarını getir
router.get('/:id', requireAdminAuth, async (req, res) => {
  try {
    const bonusId = parseInt(req.params.id);

    const bonus = await db.execute(sql`
      SELECT * FROM bonus_templates WHERE id = ${bonusId} LIMIT 1
    `);

    if (bonus.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Bonus bulunamadı'
      });
    }

    const bonusData = bonus.rows[0] as any;
    res.json({
      success: true,
      bonus: {
        ...bonusData,
        typeName: getTypeName(bonusData.type),
        usageStats: { activeUsers: 0, completedUsers: 0, totalValue: 0 }
      }
    });

  } catch (error) {
    console.error('Bonus detay hatası:', error);
    res.status(500).json({
      success: false,
      message: 'Bonus detayları alınırken hata oluştu'
    });
  }
});

export default router;