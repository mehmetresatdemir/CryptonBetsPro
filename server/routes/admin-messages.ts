import { Router, Request, Response } from 'express';
import { db } from '../db';
import { userMessages, users, adminUsers, systemLogs } from '@shared/schema';
import { eq, desc, and, like, or, isNull } from 'drizzle-orm';
import { requireAdminAuth } from '../utils/auth';
import { z } from 'zod';

const router = Router();

// Mesaj oluşturma şeması
const createMessageSchema = z.object({
  recipientId: z.number().optional(),
  subject: z.string().min(1).max(200),
  content: z.string().min(1),
  type: z.enum(['admin', 'system', 'support', 'broadcast']),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  category: z.string().optional(),
  scheduledFor: z.string().optional()
});

// Mesaj güncelleme şeması
const updateMessageSchema = z.object({
  status: z.enum(['unread', 'read', 'answered', 'archived']).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional()
});

// Tüm mesajları listeleme
router.get('/', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.search as string;
    const type = req.query.type as string;
    const status = req.query.status as string;
    const priority = req.query.priority as string;
    const offset = (page - 1) * limit;

    let whereConditions = [];

    if (search) {
      whereConditions.push(
        or(
          like(userMessages.subject, `%${search}%`),
          like(userMessages.content, `%${search}%`)
        )
      );
    }

    if (type) {
      whereConditions.push(eq(userMessages.type, type));
    }

    if (status) {
      whereConditions.push(eq(userMessages.status, status));
    }

    if (priority) {
      whereConditions.push(eq(userMessages.priority, priority));
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [messages, totalCount] = await Promise.all([
      db.select({
        id: userMessages.id,
        subject: userMessages.subject,
        content: userMessages.content,
        type: userMessages.type,
        status: userMessages.status,
        priority: userMessages.priority,
        category: userMessages.category,
        senderId: userMessages.senderId,
        recipientId: userMessages.recipientId,
        adminSenderId: userMessages.adminSenderId,
        scheduledFor: userMessages.scheduledFor,
        createdAt: userMessages.createdAt,
        updatedAt: userMessages.updatedAt
      })
      .from(userMessages)
      .where(whereClause)
      .orderBy(desc(userMessages.createdAt))
      .limit(limit)
      .offset(offset),

      db.select({ count: userMessages.id })
        .from(userMessages)
        .where(whereClause)
        .then(result => result.length)
    ]);

    // Log this access
    await db.insert(systemLogs).values({
      level: 'info',
      category: 'admin',
      message: 'Admin messages accessed',
      source: 'admin-messages-api',
      adminUserId: 1,
      ipAddress: req.ip,
      metadata: JSON.stringify({ page, limit, search, type, status, priority })
    });

    res.json({
      messages,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('Messages list error:', error);
    res.status(500).json({ error: 'Mesajlar listelenemedi' });
  }
});

// Tek mesaj detayı
router.get('/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const messageId = parseInt(req.params.id);

    const message = await db.select()
      .from(userMessages)
      .where(eq(userMessages.id, messageId))
      .limit(1);

    if (message.length === 0) {
      return res.status(404).json({ error: 'Mesaj bulunamadı' });
    }

    // Mesajı okundu olarak işaretle
    await db.update(userMessages)
      .set({ 
        status: 'read',
        updatedAt: new Date()
      })
      .where(eq(userMessages.id, messageId));

    res.json(message[0]);

  } catch (error) {
    console.error('Message detail error:', error);
    res.status(500).json({ error: 'Mesaj detayı alınamadı' });
  }
});

// Yeni mesaj oluşturma
router.post('/', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const validatedData = createMessageSchema.parse(req.body);
    
    // Broadcast mesaj için tüm kullanıcıları hedefle
    if (validatedData.type === 'broadcast') {
      const allUsers = await db.select({ id: users.id }).from(users);
      
      const broadcastMessages = allUsers.map(user => ({
        recipientId: user.id,
        adminSenderId: 1,
        subject: validatedData.subject,
        content: validatedData.content,
        type: validatedData.type,
        priority: validatedData.priority,
        category: validatedData.category,
        scheduledFor: validatedData.scheduledFor ? new Date(validatedData.scheduledFor) : undefined
      }));

      await db.insert(userMessages).values(broadcastMessages);

      // Log this action
      await db.insert(systemLogs).values({
        level: 'info',
        category: 'admin',
        message: `Broadcast message sent to ${allUsers.length} users: ${validatedData.subject}`,
        source: 'admin-messages-api',
        adminUserId: 1,
        ipAddress: req.ip,
        metadata: JSON.stringify({ 
          recipientCount: allUsers.length,
          type: validatedData.type,
          priority: validatedData.priority
        })
      });

      res.status(201).json({ 
        message: 'Broadcast mesaj başarıyla gönderildi',
        recipientCount: allUsers.length
      });

    } else {
      // Tek kullanıcıya mesaj
      const newMessage = await db.insert(userMessages).values({
        recipientId: validatedData.recipientId,
        adminSenderId: 1,
        subject: validatedData.subject,
        content: validatedData.content,
        type: validatedData.type,
        priority: validatedData.priority,
        category: validatedData.category,
        scheduledFor: validatedData.scheduledFor ? new Date(validatedData.scheduledFor) : undefined
      }).returning();

      // Log this action
      await db.insert(systemLogs).values({
        level: 'info',
        category: 'admin',
        message: `Message sent: ${validatedData.subject}`,
        source: 'admin-messages-api',
        adminUserId: 1,
        ipAddress: req.ip,
        metadata: JSON.stringify({ 
          newMessageId: newMessage[0].id,
          recipientId: validatedData.recipientId,
          type: validatedData.type
        })
      });

      res.status(201).json(newMessage[0]);
    }

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Geçersiz veri',
        details: error.errors 
      });
    }
    
    console.error('Create message error:', error);
    res.status(500).json({ error: 'Mesaj gönderilemedi' });
  }
});

// Mesaj güncelleme
router.put('/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const messageId = parseInt(req.params.id);
    const validatedData = updateMessageSchema.parse(req.body);

    // Mevcut mesaj kontrolü
    const existingMessage = await db.select()
      .from(userMessages)
      .where(eq(userMessages.id, messageId))
      .limit(1);

    if (existingMessage.length === 0) {
      return res.status(404).json({ error: 'Mesaj bulunamadı' });
    }

    // Mesajı güncelle
    const updatedMessage = await db.update(userMessages)
      .set({
        ...validatedData,
        updatedAt: new Date()
      })
      .where(eq(userMessages.id, messageId))
      .returning();

    // Log this action
    await db.insert(systemLogs).values({
      level: 'info',
      category: 'admin',
      message: `Message updated: ${existingMessage[0].subject}`,
      source: 'admin-messages-api',
      adminUserId: 1,
      ipAddress: req.ip,
      metadata: JSON.stringify({ 
        updatedMessageId: messageId,
        changes: validatedData 
      })
    });

    res.json(updatedMessage[0]);

  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        error: 'Geçersiz veri',
        details: error.errors 
      });
    }
    
    console.error('Update message error:', error);
    res.status(500).json({ error: 'Mesaj güncellenemedi' });
  }
});

// Mesaj silme
router.delete('/:id', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const messageId = parseInt(req.params.id);

    // Mevcut mesaj kontrolü
    const existingMessage = await db.select()
      .from(userMessages)
      .where(eq(userMessages.id, messageId))
      .limit(1);

    if (existingMessage.length === 0) {
      return res.status(404).json({ error: 'Mesaj bulunamadı' });
    }

    // Mesajı sil
    await db.delete(userMessages)
      .where(eq(userMessages.id, messageId));

    // Log this action
    await db.insert(systemLogs).values({
      level: 'warning',
      category: 'admin',
      message: `Message deleted: ${existingMessage[0].subject}`,
      source: 'admin-messages-api',
      adminUserId: 1,
      ipAddress: req.ip,
      metadata: JSON.stringify({ 
        deletedMessageId: messageId,
        deletedMessageSubject: existingMessage[0].subject
      })
    });

    res.json({ message: 'Mesaj başarıyla silindi' });

  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Mesaj silinemedi' });
  }
});

// Mesaj istatistikleri
router.get('/stats/summary', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const totalMessages = await db.select().from(userMessages);
    const unreadMessages = await db.select().from(userMessages).where(eq(userMessages.status, 'unread'));
    const urgentMessages = await db.select().from(userMessages).where(eq(userMessages.priority, 'urgent'));

    // Tip bazında istatistikler
    const typeStats = await db.select({
      type: userMessages.type
    })
    .from(userMessages)
    .groupBy(userMessages.type);

    // Durum bazında istatistikler
    const statusStats = await db.select({
      status: userMessages.status
    })
    .from(userMessages)
    .groupBy(userMessages.status);

    const summary = {
      totalMessages: totalMessages.length,
      unreadMessages: unreadMessages.length,
      urgentMessages: urgentMessages.length,
      typeDistribution: typeStats,
      statusDistribution: statusStats
    };

    res.json(summary);

  } catch (error) {
    console.error('Message stats error:', error);
    res.status(500).json({ error: 'Mesaj istatistikleri alınamadı' });
  }
});

// Toplu mesaj işlemleri
router.post('/bulk', requireAdminAuth, async (req: Request, res: Response) => {
  try {
    const { action, messageIds } = req.body;

    if (!action || !Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ 
        error: 'Geçerli bir işlem ve mesaj ID listesi gerekli' 
      });
    }

    let updatedCount = 0;

    switch (action) {
      case 'mark_read':
        await db.update(userMessages)
          .set({ status: 'read', updatedAt: new Date() })
          .where(or(...messageIds.map(id => eq(userMessages.id, id))));
        updatedCount = messageIds.length;
        break;

      case 'mark_unread':
        await db.update(userMessages)
          .set({ status: 'unread', updatedAt: new Date() })
          .where(or(...messageIds.map(id => eq(userMessages.id, id))));
        updatedCount = messageIds.length;
        break;

      case 'archive':
        await db.update(userMessages)
          .set({ status: 'archived', updatedAt: new Date() })
          .where(or(...messageIds.map(id => eq(userMessages.id, id))));
        updatedCount = messageIds.length;
        break;

      case 'delete':
        await db.delete(userMessages)
          .where(or(...messageIds.map(id => eq(userMessages.id, id))));
        updatedCount = messageIds.length;
        break;

      default:
        return res.status(400).json({ error: 'Geçersiz işlem' });
    }

    // Log this action
    await db.insert(systemLogs).values({
      level: 'info',
      category: 'admin',
      message: `Bulk message operation: ${action} on ${updatedCount} messages`,
      source: 'admin-messages-api',
      adminUserId: 1,
      ipAddress: req.ip,
      metadata: JSON.stringify({ 
        action,
        messageIds,
        updatedCount
      })
    });

    res.json({ 
      message: 'Toplu işlem başarıyla tamamlandı',
      updatedCount
    });

  } catch (error) {
    console.error('Bulk message operation error:', error);
    res.status(500).json({ error: 'Toplu işlem başarısız' });
  }
});

export default router;