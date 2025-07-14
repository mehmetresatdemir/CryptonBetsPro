import { Request, Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { chatMessages, chatSessions, users, transactions, kycDocuments, deposits, withdrawals, supportTickets, supportResponses } from "@shared/schema";
import { aiAssistant } from "../services/aiAssistant";
import { eq, and, desc, gte, count } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "cryptonbets_jwt_secret_key_2024_secure_random_string_1234567890abcdef";

// Guest kullanıcılar için hızlı yanıt sistemi
function generateQuickGuestResponse(message: string, language: string = 'tr') {
  const lowerMessage = message.toLowerCase();
  
  let responseText = '';
  let intent = 'general';
  
  if (lowerMessage.includes('kayıt') || lowerMessage.includes('hesap') || lowerMessage.includes('register')) {
    intent = 'registration';
    responseText = `Merhaba! CryptonBets'e hoş geldiniz!

Hesap oluşturmak çok kolay:
1. Ana sayfada "Kayıt Ol" butonuna tıklayın
2. E-posta ve telefon bilgilerinizi girin
3. Güvenli şifrenizi oluşturun
4. E-posta doğrulaması yapın

Kayıt olduğunuzda %100 Hoşgeldin Bonusu kazanırsınız!

Başka sorularınız varsa yardımcı olmaktan mutluluk duyarım.`;
  } else if (lowerMessage.includes('bonus') || lowerMessage.includes('hediye')) {
    intent = 'bonus';
    responseText = `CryptonBets'te harika bonuslar sizi bekliyor!

AKTİF BONUSLAR:
• %100 Hoşgeldin Bonusu (5.000 TL'ye kadar)
• Haftalık %50 Reload Bonusu
• VIP Özel Bonusları
• Kayıp Bonus Geri Ödemesi

Bonus almak için hesap oluşturmanız yeterli!

Hangi bonus hakkında detaylı bilgi almak istersiniz?`;
  } else if (lowerMessage.includes('oyun') || lowerMessage.includes('slot') || lowerMessage.includes('casino')) {
    intent = 'games';
    responseText = `CryptonBets'te binlerce oyun seçeneği var!

SLOT OYUNLARI:
• 2000+ slot oyunu
• Pragmatic Play, NetEnt, Evolution
• Mega jackpot oyunları

CANLI CASINO:
• Canlı Blackjack, Rulet
• Baccarat, Poker
• Profesyonel krupiyeler

SPOR BAHİSLERİ:
• 40+ spor dalı
• Canlı bahis imkanı

Hesap oluşturarak tüm oyunlara erişebilirsiniz!`;
  } else if (lowerMessage.includes('ödeme') || lowerMessage.includes('para') || lowerMessage.includes('yatır')) {
    intent = 'payment';
    responseText = `CryptonBets güvenli ödeme seçenekleri:

YATIRIM YÖNTEMLERİ:
• Banka Kartı (Visa/MasterCard)
• Banka Havalesi
• Kripto Para (Bitcoin, USDT)
• Papara, Jeton Wallet

HIZLI ÇEKİMLER:
• 15 dakikada onay
• 7/24 işlem imkanı
• Minimum 50 TL çekim

Hesap oluşturarak güvenli işlemler yapabilirsiniz!`;
  } else {
    responseText = `Merhaba! CryptonBets canlı destek ekibine hoş geldiniz!

Size nasıl yardımcı olabilirim?

POPÜLER KONULAR:
• Hesap oluşturma
• Bonus bilgileri  
• Oyun rehberi
• Ödeme işlemleri
• Teknik destek

Lütfen sorununuzu detaylandırın, en kısa sürede size yardımcı olayım!`;
  }
  
  return {
    response: responseText,
    intent,
    confidence: 0.9,
    actions: [],
    proactiveAlerts: [],
    complianceStatus: { riskLevel: 'low', flags: [] },
    userAnalysis: { userProfile: { type: 'guest' } },
    recommendations: ['Hesap oluşturarak tam özelliklerden yararlanabilirsiniz']
  };
}

// Chat mesajı gönderme
export async function sendMessage(req: Request, res: Response) {
  try {
    const { sessionId, message, language = 'tr', guestName } = req.body;
    let guestUsername = guestName;
    
    // JWT token'dan userId'yi doğrudan al
    let userId: number | undefined;
    const authHeader = req.headers.authorization;
    
    console.log('Chat - Auth header:', authHeader);
    console.log('Chat - JWT_SECRET length:', JWT_SECRET.length);
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const token = authHeader.split(' ')[1];
        console.log('Chat - Token first 20 chars:', token.substring(0, 20));
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        userId = decoded.id;
        console.log('Chat - JWT decoded successfully. UserId:', userId, 'Decoded payload:', decoded);
      } catch (error) {
        console.log('Chat - JWT decode failed:', (error as Error).message);
        userId = undefined;
      }
    } else {
      console.log('Chat - No auth header found');
    }
    
    // Guest kullanıcılar için guestUsername kontrolü (sadece token yoksa)
    if (!userId && (!guestUsername || guestUsername.trim().length < 2)) {
      // Otomatik misafir ismi ata
      guestUsername = "Misafir" + Math.floor(Math.random() * 1000);
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: "Mesaj boş olamaz" });
    }

    const startTime = Date.now();

    // Kullanıcı bilgilerini al (kayıtlı kullanıcılar için)
    let user = null;
    if (userId) {
      const [foundUser] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId));

      if (!foundUser) {
        console.log(`Kullanıcı ID ${userId} bulunamadı, misafir olarak devam ediliyor`);
        // Misafir olarak devam et, hata döndürme
      }
      user = foundUser || null;
    }

    // Session ID kontrol et ve gerekirse yeni oluştur
    let currentSessionId = sessionId;
    let sessionExists = false;
    
    if (currentSessionId) {
      // Mevcut session'ın var olup olmadığını kontrol et
      const [existingSession] = await db
        .select()
        .from(chatSessions)
        .where(eq(chatSessions.sessionId, currentSessionId));
      
      sessionExists = !!existingSession;
    }
    
    if (!currentSessionId || !sessionExists) {
      // Yeni session ID oluştur
      currentSessionId = uuidv4();
      
      // Yeni chat session oluştur (sadece geçerli kullanıcılar için)
      if (userId && user) {
        try {
          await db.insert(chatSessions).values({
            sessionId: currentSessionId,
            userId: userId,
            language: language,
            status: 'active',
            guestName: null
          });
        } catch (error) {
          console.log('Chat session creation skipped for invalid user ID:', userId);
        }
      } else {
        console.log('Guest chat session created without DB storage:', currentSessionId);
      }
    }

    // Önceki konuşma geçmişini al
    const chatHistory = await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, currentSessionId))
      .orderBy(desc(chatMessages.createdAt))
      .limit(10);

    // Mesaj amacını analiz et
    const intentAnalysis = await aiAssistant.analyzeUserIntent(
      message, 
      req.body.language || 'tr'
    );

    // Kullanıcı bilgileri ve context hazırlama
    let userContext;
    
    if (user) {
      // Kayıtlı kullanıcılar için tam veri erişimi
      let userRecentTxns = [];
      let pendingTransactions = [];
      let kycDocs = [];
      
      try {
        // Get user's transaction history from existing transactions table
        userRecentTxns = await db
          .select()
          .from(transactions)
          .where(eq(transactions.userId, userId as number))
          .orderBy(desc(transactions.createdAt))
          .limit(5);

        pendingTransactions = userRecentTxns.filter(t => t.status === 'pending');

        // KYC durumunu kontrol et
        kycDocs = await db
          .select()
          .from(kycDocuments)
          .where(eq(kycDocuments.userId, userId as number))
          .limit(1);
      } catch (error) {
        console.log('User data fetch error - using fallback data');
      }

      const kycStatus = kycDocs.length > 0 ? kycDocs[0].status : 'not_submitted';

      // Son 30 günün işlem geçmişini al
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const userTransactionHistory = await db
        .select()
        .from(transactions)
        .where(and(
          eq(transactions.userId, userId as number),
          gte(transactions.createdAt, thirtyDaysAgo)
        ))
        .orderBy(desc(transactions.createdAt))
        .limit(20);

      // Kayıtlı kullanıcı context'i
      userContext = {
        id: user.id,
        username: user.username,
        balance: user.balance || 0,
        vipLevel: user.vipLevel || 0,
        totalDeposits: user.totalDeposits || 0,
        totalWithdrawals: user.totalWithdrawals || 0,
        totalBets: user.totalBets || 0,
        totalWins: user.totalWins || 0,
        language: language,
        pendingTransactions: pendingTransactions.length,
        recentActivity: userRecentTxns.length,
        kycStatus: kycStatus || undefined,
        accountStatus: user.status || 'active',
        lastLoginDate: user.lastLogin || undefined,
        registrationDate: user.createdAt || undefined,
        recentTransactions: userTransactionHistory
      };
    } else {
      // Guest kullanıcılar için sınırlı context (includes users not found in DB)
      const displayUsername = guestUsername?.trim() || 'Misafir';
      userContext = {
        id: userId || null,
        username: displayUsername,
        isGuest: !user,
        balance: 0,
        vipLevel: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalBets: 0,
        totalWins: 0,
        language: language,
        recentTransactions: [],
        kycStatus: 'not_applicable',
        accountStatus: 'guest',
        lastLoginDate: null,
        registrationDate: null
      };
    }

    // AI yanıt sistemi - hata toleranslı
    let aiResult;
    try {
      if (!userId && guestUsername) {
        aiResult = generateQuickGuestResponse(message, language);
      } else {
        // Gelişmiş AI yanıtını al
        aiResult = await aiAssistant.generateResponse(
          message,
          userContext,
          chatHistory.reverse().map(msg => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.role === 'user' ? msg.message : (msg.response || ''),
            timestamp: msg.createdAt || new Date()
          }))
        );
      }
    } catch (aiError) {
      console.error('AI service error:', aiError);
      // Fallback basit yanıt
      aiResult = {
        response: language === 'tr' ? 
          'Merhaba! Size nasıl yardımcı olabilirim? Sorularınızı lütfen detaylı şekilde belirtin.' :
          'Hello! How can I assist you? Please provide details about your questions.',
        sessionId: currentSessionId,
        metadata: { source: 'fallback' }
      };
    }

    const responseTime = Date.now() - startTime;

    // Mesajları kaydet (sadece geçerli kullanıcılar için)
    let userMessage = null;
    let assistantMessage = null;

    if (userId && user) {
      try {
        const userMsgResult = await db.insert(chatMessages).values({
          userId: userId,
          sessionId: currentSessionId,
          message: message,
          role: 'user',
          intent: aiResult.intent || intentAnalysis.intent,
          confidence: aiResult.confidence || intentAnalysis.confidence,
          language: language,
          responseTime: responseTime
        }).returning();
        userMessage = userMsgResult[0];

        const assistantMsgResult = await db.insert(chatMessages).values({
          userId: userId,
          sessionId: currentSessionId,
          message: '',
          response: aiResult.response,
          role: 'assistant',
          intent: aiResult.intent || 'general_question',
          confidence: aiResult.confidence || 0.8,
          language: language,
          responseTime: responseTime
        }).returning();
        assistantMessage = assistantMsgResult[0];
      } catch (error) {
        console.log('Chat message save error for invalid user - using fallback');
        userMessage = { id: Math.floor(Math.random() * 1000000), createdAt: new Date() };
        assistantMessage = { id: Math.floor(Math.random() * 1000000), createdAt: new Date() };
      }
    } else {
      // Guest kullanıcılar için fallback
      userMessage = { id: Math.floor(Math.random() * 1000000), createdAt: new Date() };
      assistantMessage = { id: Math.floor(Math.random() * 1000000), createdAt: new Date() };
    }

    // Session'ı güncelle (sadece DB'de varsa)
    if (userId && user) {
      try {
        await db
          .update(chatSessions)
          .set({
            lastActivity: new Date(),
            totalMessages: chatHistory.length + 2
          })
          .where(eq(chatSessions.sessionId, currentSessionId));
      } catch (error) {
        console.log('Session update skipped for invalid user');
      }
    }

    // Proaktif uyarıları log'la
    if (aiResult.proactiveAlerts && aiResult.proactiveAlerts.length > 0) {
      console.log(`[PROACTIVE ALERTS] User ${userId || 'Guest'}:`, aiResult.proactiveAlerts.map(a => a.type));
    }

    // Otomatik işlemleri log'la
    if (aiResult.actions && aiResult.actions.length > 0) {
      console.log(`[AUTO ACTIONS] User ${userId || 'Guest'}:`, aiResult.actions.map(a => a.type));
    }

    // Admin panele destek talebi oluştur (kayıtlı kullanıcılar için)
    // Tüm mesajlar için ticket oluştur ki admin panelde görünsün
    if (userId && user) {
      try {
        // Mevcut açık chat ticket'ı kontrol et
        const [existingTicket] = await db
          .select()
          .from(supportTickets)
          .where(and(
            eq(supportTickets.userId, userId),
            eq(supportTickets.source, 'chat'),
            eq(supportTickets.status, 'open')
          ))
          .limit(1);

        // Eğer açık ticket yoksa yeni oluştur
        if (!existingTicket) {
          await createSupportTicketFromChat(
            userId,
            user.username,
            user.email || `${user.username}@cryptonbets.com`,
            message,
            intentAnalysis.intent,
            aiResult.response,
            currentSessionId
          );
          console.log(`[SUPPORT TICKET] Created for user ${userId}, intent: ${intentAnalysis.intent}`);
        } else {
          // Mevcut ticket'a mesajı ekle
          await db.insert(supportResponses).values({
            ticketId: existingTicket.id,
            userId: userId,
            response: `Kullanıcı Mesajı: ${message}\n\nAI Yanıtı: ${aiResult.response}`,
            adminName: null, // User message, not admin
            isFromAdmin: false,
            createdAt: new Date()
          });
          console.log(`[SUPPORT TICKET] Updated existing ticket ${existingTicket.id} with new message`);
        }
      } catch (error) {
        console.log('Support ticket creation/update failed:', error);
      }
    }

    res.json({
      sessionId: currentSessionId,
      userMessage: {
        id: userMessage.id,
        message: message,
        role: 'user',
        timestamp: userMessage.createdAt
      },
      assistantMessage: {
        id: assistantMessage.id,
        message: aiResult.response,
        role: 'assistant',
        timestamp: assistantMessage.createdAt,
        intent: aiResult.intent,
        confidence: aiResult.confidence,
        actions: aiResult.actions,
        recommendations: aiResult.recommendations
      },
      responseTime: responseTime,
      analytics: {
        userAnalysis: aiResult.userAnalysis,
        proactiveAlerts: aiResult.proactiveAlerts,
        complianceStatus: aiResult.complianceStatus
      }
    });

  } catch (error) {
    console.error("Chat API Error:", error);
    res.status(500).json({ 
      error: "Mesaj gönderilirken hata oluştu",
      details: error instanceof Error ? error.message : "Bilinmeyen hata"
    });
  }
}

// Chat geçmişini al
export async function getChatHistory(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: "Kullanıcı oturum açmalı" });
    }

    // Chat mesajlarını al
    const messages = await db
      .select()
      .from(chatMessages)
      .where(and(
        eq(chatMessages.sessionId, sessionId),
        eq(chatMessages.userId, userId)
      ))
      .orderBy(chatMessages.createdAt);

    // Bu kullanıcının aktif chat ticket'ını bul
    const [supportTicket] = await db
      .select()
      .from(supportTickets)
      .where(and(
        eq(supportTickets.userId, userId),
        eq(supportTickets.source, 'chat'),
        eq(supportTickets.status, 'open')
      ))
      .orderBy(desc(supportTickets.createdAt))
      .limit(1);

    // Support ticket responses'larını al (admin mesajları)
    let adminMessages: any[] = [];
    if (supportTicket) {
      const responses = await db
        .select()
        .from(supportResponses)
        .where(eq(supportResponses.ticketId, supportTicket.id))
        .orderBy(supportResponses.createdAt);

      adminMessages = responses.map(response => ({
        id: `admin_${response.id}`,
        message: response.response,
        role: 'admin',
        timestamp: response.createdAt,
        adminName: response.adminName || 'Destek Ekibi',
        isAdminMessage: true
      }));
    }

    // Mesajları UI için formatla
    const formattedMessages = messages.map(msg => ({
      id: msg.id,
      message: msg.role === 'user' ? msg.message : (msg.response || ''),
      role: msg.role,
      timestamp: msg.createdAt,
      intent: msg.intent,
      confidence: msg.confidence,
      wasHelpful: msg.wasHelpful
    }));

    // Chat ve admin mesajlarını birleştirip tarihe göre sırala
    const allMessages = [...formattedMessages, ...adminMessages].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    res.json({
      sessionId: sessionId,
      messages: allMessages,
      supportTicketId: supportTicket?.id || null
    });

  } catch (error) {
    console.error("Chat History Error:", error);
    res.status(500).json({ error: "Chat geçmişi alınırken hata oluştu" });
  }
}

// Kullanıcının aktif chat session'larını al
export async function getUserSessions(req: Request, res: Response) {
  try {
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: "Kullanıcı oturum açmalı" });
    }

    const sessions = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.lastActivity))
      .limit(10);

    // Her session için son mesajı al ve başlık oluştur
    const sessionsWithTitles = await Promise.all(
      sessions.map(async (session) => {
        const [lastMessage] = await db
          .select()
          .from(chatMessages)
          .where(eq(chatMessages.sessionId, session.sessionId))
          .orderBy(desc(chatMessages.createdAt))
          .limit(1);

        return {
          ...session,
          title: lastMessage?.message ? 
            lastMessage.message.substring(0, 30) + (lastMessage.message.length > 30 ? '...' : '') :
            'Yeni Konuşma',
          lastMessage: lastMessage?.message || null
        };
      })
    );

    res.json({ sessions: sessionsWithTitles });

  } catch (error) {
    console.error("User Sessions Error:", error);
    res.status(500).json({ error: "Oturumlar alınırken hata oluştu" });
  }
}

// Mesajı yararlı/yararsız olarak işaretle
export async function rateFeedback(req: Request, res: Response) {
  try {
    const { messageId } = req.params;
    const { helpful } = req.body;
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: "Kullanıcı oturum açmalı" });
    }

    await db
      .update(chatMessages)
      .set({ wasHelpful: helpful })
      .where(and(
        eq(chatMessages.id, parseInt(messageId)),
        eq(chatMessages.userId, userId)
      ));

    res.json({ success: true });

  } catch (error) {
    console.error("Feedback Error:", error);
    res.status(500).json({ error: "Geri bildirim kaydedilirken hata oluştu" });
  }
}

// Chat session'ı kapat
export async function closeSession(req: Request, res: Response) {
  try {
    const { sessionId } = req.params;
    const { satisfaction, resolved } = req.body;
    const userId = (req.user as any)?.id;

    if (!userId) {
      return res.status(401).json({ error: "Kullanıcı oturum açmalı" });
    }

    await db
      .update(chatSessions)
      .set({
        status: 'closed',
        satisfaction: satisfaction,
        resolvedIssue: resolved
      })
      .where(and(
        eq(chatSessions.sessionId, sessionId),
        eq(chatSessions.userId, userId)
      ));

    res.json({ success: true });

  } catch (error) {
    console.error("Close Session Error:", error);
    res.status(500).json({ error: "Oturum kapatılırken hata oluştu" });
  }
}

// Chat mesajından admin panele destek talebi oluştur
async function createSupportTicketFromChat(
  userId: number,
  username: string,
  email: string,
  userMessage: string,
  intent: string,
  aiResponse: string,
  sessionId: string
) {
  try {
    // Intent'e göre kategori belirleme
    const categoryMap: Record<string, string> = {
      'deposit_inquiry': 'payment',
      'withdrawal_inquiry': 'payment',
      'bonus_request': 'bonus',
      'game_recommendation': 'game',
      'balance_inquiry': 'account',
      'vip_inquiry': 'account',
      'technical_support': 'technical',
      'general_question': 'general'
    };

    // Intent'e göre öncelik belirleme
    const priorityMap: Record<string, string> = {
      'technical_support': 'high',
      'withdrawal_inquiry': 'high',
      'deposit_inquiry': 'medium',
      'bonus_request': 'medium',
      'balance_inquiry': 'low',
      'game_recommendation': 'low',
      'vip_inquiry': 'low',
      'general_question': 'low'
    };

    const category = categoryMap[intent] || 'general';
    const priority = priorityMap[intent] || 'medium';

    // Konu başlığı oluştur
    const subjectMap: Record<string, string> = {
      'deposit_inquiry': 'Para Yatırma Sorunu',
      'withdrawal_inquiry': 'Para Çekme Talebi',
      'bonus_request': 'Bonus Talebi',
      'game_recommendation': 'Oyun Önerisi Talebi',
      'balance_inquiry': 'Bakiye Sorgusu',
      'vip_inquiry': 'VIP Üyelik Sorgusu',
      'technical_support': 'Teknik Destek Talebi',
      'general_question': 'Genel Destek Talebi'
    };

    const subject = subjectMap[intent] || 'Canlı Destek Talebi';

    // Benzersiz ticket numarası oluştur
    const ticketNumber = `CT${Date.now().toString().slice(-8)}`;

    // Support ticket'ı oluştur
    const newTicket = await db.insert(supportTickets).values({
      ticketNumber: ticketNumber,
      userId: userId,
      title: subject,
      subject: subject,
      message: userMessage,
      description: `Canlı chat üzerinden gelen talep:\n\nKullanıcı Mesajı: ${userMessage}\n\nAI Yanıtı: ${aiResponse}\n\nChat Session ID: ${sessionId}`,
      category: category,
      priority: priority,
      status: 'open',
      source: 'chat',
      assignedTo: null,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning();

    console.log(`✅ Support ticket created: #${ticketNumber} for user ${username} (${intent})`);
    return newTicket[0];

  } catch (error) {
    console.error('❌ Failed to create support ticket from chat:', error);
    throw error;
  }
}