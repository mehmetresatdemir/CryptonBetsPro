import { Router } from 'express';
import { eq, desc, and, like, count, asc, or, sql, gt, lt } from 'drizzle-orm';
import { db } from '../db';
import { users, transactions, kycDocuments, userLogs } from '../../shared/schema';
import bcrypt from 'bcrypt';

const router = Router();

// Kullanıcıları getir (Admin Only)
router.get('/', async (req, res) => {
  try {
    const {
      page = '1',
      limit = '20',
      search = '',
      status = '',
      role = '',
      vipLevel = '',
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = req.query;

    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const offset = (pageNum - 1) * limitNum;

    console.log(`🔍 USER MANAGEMENT: Fetching users - Page: ${pageNum}, Limit: ${limitNum}`);
    console.log(`🔍 USER MANAGEMENT: Search: "${search}", Status: "${status}", Role: "${role}"`);

    // Filtre koşulları oluştur
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`),
          like(users.phone, `%${search}%`)
        )
      );
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        conditions.push(eq(users.isActive, true));
      } else if (status === 'inactive') {
        conditions.push(eq(users.isActive, false));
      }
    }

    if (role && role !== 'all') {
      conditions.push(eq(users.role, role as string));
    }

    if (vipLevel && vipLevel !== 'all') {
      conditions.push(eq(users.vipLevel, parseInt(vipLevel as string)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Toplam sayı
    console.log(`🔍 USER MANAGEMENT: Executing count query...`);
    let total = 0;
    try {
      const totalResult = await db
        .select({ count: count() })
        .from(users)
        .where(whereClause);
      
      console.log(`🔍 USER MANAGEMENT: Count result:`, totalResult);
      total = totalResult[0]?.count || 0;
      console.log(`🔍 USER MANAGEMENT: Total users found: ${total}`);
    } catch (countError) {
      console.error(`❌ USER MANAGEMENT COUNT ERROR:`, countError);
      throw countError;
    }

    // Sıralama
    const orderByFn = sortOrder === 'asc' ? asc : desc;
    let orderByColumn;
    
    switch (sortBy) {
      case 'username':
        orderByColumn = users.username;
        break;
      case 'email':
        orderByColumn = users.email;
        break;
      case 'balance':
        orderByColumn = users.balance;
        break;
      case 'vip_level':
        orderByColumn = users.vipLevel;
        break;
      case 'last_login':
        orderByColumn = users.lastLogin;
        break;
      default:
        orderByColumn = users.createdAt;
    }

    // Kullanıcıları getir
    const userList = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        fullName: users.fullName,
        phone: users.phone,
        countryCode: users.countryCode,
        balance: users.balance,
        vipLevel: users.vipLevel,
        vipPoints: users.vipPoints,
        status: users.status,
        role: users.role,
        isActive: users.isActive,
        totalDeposits: users.totalDeposits,
        totalWithdrawals: users.totalWithdrawals,
        totalBets: users.totalBets,
        totalWins: users.totalWins,
        registrationDate: users.registrationDate,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin
      })
      .from(users)
      .where(whereClause)
      .orderBy(orderByFn(orderByColumn))
      .limit(limitNum)
      .offset(offset);

    console.log(`📊 USER DATA COLLECTED: ${userList.length} users found out of ${total} total`);
    
    // Count query bug workaround - use actual count from main query
    const actualTotal = userList.length < limitNum ? userList.length : 
                        await db.select({ count: count() }).from(users).then(r => Number(r[0]?.count) || 0);

    res.json({
      users: userList,
      items: userList, // Backward compatibility
      total: actualTotal,
      page: pageNum,
      limit: limitNum,
      totalPages: Math.ceil(actualTotal / limitNum)
    });

  } catch (error) {
    console.error('❌ USER MANAGEMENT ERROR:', error);
    res.status(500).json({ 
      error: 'Kullanıcılar alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Yeni kullanıcı oluştur (Admin Only)
router.post('/', async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      firstName,
      lastName,
      phone,
      role = 'user',
      vipLevel = 0,
      balance = 0,
      status = 'active'
    } = req.body;

    console.log(`👤 CREATE USER: Creating new user ${username}`);

    // Zorunlu alanları kontrol et
    if (!username || !email || !password) {
      return res.status(400).json({ 
        error: 'Kullanıcı adı, e-posta ve şifre zorunludur' 
      });
    }

    // Kullanıcı adı ve e-posta benzersizliğini kontrol et
    const existingUser = await db
      .select()
      .from(users)
      .where(or(eq(users.username, username), eq(users.email, email)))
      .limit(1);

    if (existingUser.length > 0) {
      return res.status(400).json({ 
        error: 'Bu kullanıcı adı veya e-posta zaten kullanılıyor' 
      });
    }

    // Şifreyi hash'le
    const hashedPassword = await bcrypt.hash(password, 10);

    // Kullanıcıyı oluştur
    const newUser = await db
      .insert(users)
      .values({
        username,
        email,
        password: hashedPassword,
        firstName: firstName || '',
        lastName: lastName || '',
        fullName: `${firstName || ''} ${lastName || ''}`.trim() || username,
        phone: phone || '',
        role,
        vipLevel: parseInt(vipLevel as string) || 0,
        balance: parseFloat(balance as string) || 0,
        status,
        isActive: status === 'active',
        vipPoints: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalBets: 0,
        totalWins: 0,
        bonusBalance: 0,
        createdAt: new Date(),
        registrationDate: new Date()
      })
      .returning({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        fullName: users.fullName,
        role: users.role,
        vipLevel: users.vipLevel,
        balance: users.balance,
        status: users.status,
        isActive: users.isActive,
        createdAt: users.createdAt
      });

    console.log(`✅ USER CREATED: User ${username} created successfully with ID ${newUser[0].id}`);

    res.status(201).json({
      success: true,
      message: 'Kullanıcı başarıyla oluşturuldu',
      user: newUser[0]
    });

  } catch (error) {
    console.error('❌ CREATE USER ERROR:', error);
    res.status(500).json({ 
      error: 'Kullanıcı oluşturma işlemi başarısız',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Kullanıcı detayını getir (Admin Only)
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🔍 USER DETAIL: Fetching user ${id}`);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (!user[0]) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Kullanıcının son işlemlerini getir
    const recentTransactions = await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, parseInt(id)))
      .orderBy(desc(transactions.createdAt))
      .limit(10);

    // Kullanıcının KYC belgelerini getir
    const kycDocumentsList = await db
      .select()
      .from(kycDocuments)
      .where(eq(kycDocuments.userId, parseInt(id)))
      .orderBy(desc(kycDocuments.uploadedAt));

    // Kullanıcının son aktivitelerini getir
    const recentLogs = await db
      .select()
      .from(userLogs)
      .where(eq(userLogs.userId, parseInt(id)))
      .orderBy(desc(userLogs.createdAt))
      .limit(20);

    // Şifreyi gizle
    const { password, ...userWithoutPassword } = user[0];

    res.json({
      user: userWithoutPassword,
      recentTransactions,
      kycDocuments: kycDocumentsList,
      recentLogs
    });

  } catch (error) {
    console.error('❌ USER DETAIL ERROR:', error);
    res.status(500).json({ 
      error: 'Kullanıcı detayı alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Kullanıcı güncelle (Admin Only)
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    console.log(`🔄 USER UPDATE: Updating user ${id}`);

    // Şifre güncelleniyorsa hash'le
    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    // Email ve username benzersizlik kontrolü
    if (updateData.email) {
      const existingEmail = await db
        .select()
        .from(users)
        .where(and(eq(users.email, updateData.email), sql`${users.id} != ${parseInt(id)}`))
        .limit(1);

      if (existingEmail.length > 0) {
        return res.status(400).json({ error: 'Bu e-posta adresi zaten kullanılıyor' });
      }
    }

    if (updateData.username) {
      const existingUsername = await db
        .select()
        .from(users)
        .where(and(eq(users.username, updateData.username), sql`${users.id} != ${parseInt(id)}`))
        .limit(1);

      if (existingUsername.length > 0) {
        return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanılıyor' });
      }
    }

    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, parseInt(id)))
      .returning();

    if (!updatedUser[0]) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Session'ı güncelle - eğer güncellenen kullanıcı mevcut session kullanıcısıysa
    if (req.session && (req.session as any).userId === parseInt(id)) {
      if (updateData.role) {
        (req.session as any).role = updateData.role;
      }
      if (updateData.username) {
        (req.session as any).username = updateData.username;
      }
      console.log(`🔄 SESSION UPDATED: Updated session for user ${id} with new role: ${updateData.role}`);
    }

    // Şifreyi gizle
    const { password, ...userWithoutPassword } = updatedUser[0];

    console.log(`✅ USER UPDATED: User ${id} updated successfully`);

    res.json({
      success: true,
      user: userWithoutPassword,
      message: 'Kullanıcı başarıyla güncellendi'
    });

  } catch (error) {
    console.error('❌ USER UPDATE ERROR:', error);
    res.status(500).json({ 
      error: 'Kullanıcı güncellenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Kullanıcı durumunu değiştir (Admin Only)
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive, status } = req.body;

    console.log(`🔄 USER STATUS: Updating user ${id} status`);

    const updateData: any = {};
    if (typeof isActive === 'boolean') {
      updateData.isActive = isActive;
    }
    if (status) {
      updateData.status = status;
    }

    const updatedUser = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, parseInt(id)))
      .returning();

    if (!updatedUser[0]) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    console.log(`✅ USER STATUS UPDATED: User ${id} status updated`);

    res.json({
      success: true,
      user: updatedUser[0],
      message: 'Kullanıcı durumu güncellendi'
    });

  } catch (error) {
    console.error('❌ USER STATUS ERROR:', error);
    res.status(500).json({ 
      error: 'Kullanıcı durumu güncellenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Kullanıcı bakiyesini güncelle (Admin Only)
router.patch('/:id/balance', async (req, res) => {
  try {
    const { id } = req.params;
    const { balance, operation } = req.body; // operation: 'set', 'add', 'subtract'

    console.log(`🔄 USER BALANCE: Updating user ${id} balance`);

    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (!user[0]) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    let newBalance = balance;
    if (operation === 'add') {
      newBalance = (user[0].balance || 0) + balance;
    } else if (operation === 'subtract') {
      newBalance = (user[0].balance || 0) - balance;
      if (newBalance < 0) newBalance = 0;
    }

    const updatedUser = await db
      .update(users)
      .set({ balance: newBalance })
      .where(eq(users.id, parseInt(id)))
      .returning();

    console.log(`✅ USER BALANCE UPDATED: User ${id} balance updated to ${newBalance}`);

    res.json({
      success: true,
      user: updatedUser[0],
      oldBalance: user[0].balance,
      newBalance: newBalance,
      message: 'Kullanıcı bakiyesi güncellendi'
    });

  } catch (error) {
    console.error('❌ USER BALANCE ERROR:', error);
    res.status(500).json({ 
      error: 'Kullanıcı bakiyesi güncellenemedi',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Kullanıcıyı sil (Admin Only)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🗑️ DELETE USER: Deleting user ${id}`);

    // Kullanıcının var olduğunu kontrol et
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.id, parseInt(id)))
      .limit(1);

    if (!existingUser[0]) {
      return res.status(404).json({ error: 'Kullanıcı bulunamadı' });
    }

    // Admin kullanıcıyı silmeyi engelle
    if (existingUser[0].role === 'admin') {
      return res.status(400).json({ 
        error: 'Admin kullanıcıları silinemez' 
      });
    }

    // Kullanıcıyı sil
    await db
      .delete(users)
      .where(eq(users.id, parseInt(id)));

    console.log(`✅ USER DELETED: User ${id} deleted successfully`);

    res.json({
      success: true,
      message: 'Kullanıcı başarıyla silindi'
    });

  } catch (error) {
    console.error('❌ DELETE USER ERROR:', error);
    res.status(500).json({ 
      error: 'Kullanıcı silme işlemi başarısız',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Kullanıcı istatistikleri (Admin Only)
router.get('/stats/summary', async (req, res) => {
  try {
    console.log(`📊 USER STATS: Generating statistics`);

    // Temel istatistikler
    const basicStats = await db
      .select({
        totalUsers: count(),
        activeUsers: sql<number>`COUNT(CASE WHEN is_active = true THEN 1 END)`,
        adminUsers: sql<number>`COUNT(CASE WHEN role = 'admin' THEN 1 END)`,
        recentUsers: sql<number>`COUNT(CASE WHEN created_at >= NOW() - INTERVAL '30 days' THEN 1 END)`
      })
      .from(users);

    // VIP seviye istatistikleri
    const vipStats = await db
      .select({
        vipLevel: users.vipLevel,
        count: count(),
        avgBalance: sql<number>`AVG(balance)`
      })
      .from(users)
      .groupBy(users.vipLevel)
      .orderBy(asc(users.vipLevel));

    // Rol istatistikleri
    const roleStats = await db
      .select({
        role: users.role,
        count: count(),
        avgBalance: sql<number>`AVG(balance)`
      })
      .from(users)
      .groupBy(users.role);

    // Günlük kayıt istatistikleri (son 30 gün)
    const dailyRegistrations = await db
      .select({
        date: sql<string>`DATE(created_at)`,
        count: count()
      })
      .from(users)
      .where(sql`created_at >= NOW() - INTERVAL '30 days'`)
      .groupBy(sql`DATE(created_at)`)
      .orderBy(sql`DATE(created_at)`);

    // Bakiye dağılımı
    const balanceStats = await db
      .select({
        totalBalance: sql<number>`SUM(balance)`,
        avgBalance: sql<number>`AVG(balance)`,
        maxBalance: sql<number>`MAX(balance)`,
        minBalance: sql<number>`MIN(balance)`,
        usersWithBalance: sql<number>`COUNT(CASE WHEN balance > 0 THEN 1 END)`
      })
      .from(users);

    console.log(`✅ USER STATS: Statistics generated successfully`);

    res.json({
      basicStats: basicStats[0],
      vipStats,
      roleStats,
      dailyRegistrations,
      balanceStats: balanceStats[0],
      generatedAt: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ USER STATS ERROR:', error);
    res.status(500).json({ 
      error: 'Kullanıcı istatistikleri alınamadı',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

// Kullanıcıları dışa aktar (Admin Only)
router.get('/export/data', async (req, res) => {
  try {
    const {
      format = 'csv',
      search = '',
      status = '',
      role = '',
      vipLevel = ''
    } = req.query;

    console.log(`📤 USER EXPORT: Format: ${format}`);

    // Filtre koşulları oluştur
    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`),
          like(users.firstName, `%${search}%`),
          like(users.lastName, `%${search}%`)
        )
      );
    }

    if (status && status !== 'all') {
      if (status === 'active') {
        conditions.push(eq(users.isActive, true));
      } else if (status === 'inactive') {
        conditions.push(eq(users.isActive, false));
      }
    }

    if (role && role !== 'all') {
      conditions.push(eq(users.role, role as string));
    }

    if (vipLevel && vipLevel !== 'all') {
      conditions.push(eq(users.vipLevel, parseInt(vipLevel as string)));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Tüm kullanıcıları getir (şifre hariç)
    const userList = await db
      .select({
        id: users.id,
        username: users.username,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        phone: users.phone,
        balance: users.balance,
        vipLevel: users.vipLevel,
        vipPoints: users.vipPoints,
        status: users.status,
        role: users.role,
        isActive: users.isActive,
        totalDeposits: users.totalDeposits,
        totalWithdrawals: users.totalWithdrawals,
        totalBets: users.totalBets,
        totalWins: users.totalWins,
        registrationDate: users.registrationDate,
        createdAt: users.createdAt,
        lastLogin: users.lastLogin
      })
      .from(users)
      .where(whereClause)
      .orderBy(desc(users.createdAt));

    if (format === 'csv') {
      // CSV formatında dışa aktar
      const csvHeaders = [
        'ID', 'Kullanıcı Adı', 'E-posta', 'Ad', 'Soyad', 'Telefon', 'Bakiye', 
        'VIP Seviye', 'VIP Puan', 'Durum', 'Rol', 'Aktif', 'Toplam Yatırım', 
        'Toplam Çekim', 'Toplam Bahis', 'Toplam Kazanç', 'Kayıt Tarihi', 'Son Giriş'
      ];
      
      const csvRows = userList.map(user => [
        user.id,
        `"${(user.username || '').replace(/"/g, '""')}"`,
        `"${(user.email || '').replace(/"/g, '""')}"`,
        `"${(user.firstName || '').replace(/"/g, '""')}"`,
        `"${(user.lastName || '').replace(/"/g, '""')}"`,
        `"${(user.phone || '').replace(/"/g, '""')}"`,
        user.balance || 0,
        user.vipLevel || 0,
        user.vipPoints || 0,
        user.status || '',
        user.role || '',
        user.isActive ? 'Evet' : 'Hayır',
        user.totalDeposits || 0,
        user.totalWithdrawals || 0,
        user.totalBets || 0,
        user.totalWins || 0,
        user.registrationDate?.toISOString() || '',
        user.lastLogin?.toISOString() || ''
      ]);

      const csvContent = [csvHeaders.join(','), ...csvRows.map(row => row.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="users-${new Date().toISOString().split('T')[0]}.csv"`);
      res.send('\uFEFF' + csvContent); // UTF-8 BOM for Turkish characters
    } else {
      // JSON formatında dışa aktar
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="users-${new Date().toISOString().split('T')[0]}.json"`);
      res.json({
        exportDate: new Date().toISOString(),
        totalRecords: userList.length,
        users: userList
      });
    }

    console.log(`✅ USER EXPORT: Successfully exported ${userList.length} users as ${format}`);

  } catch (error) {
    console.error('❌ USER EXPORT ERROR:', error);
    res.status(500).json({ 
      error: 'Kullanıcı dışa aktarma işlemi başarısız',
      details: error instanceof Error ? error.message : 'Bilinmeyen hata'
    });
  }
});

export default router;