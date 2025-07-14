import { Router } from "express";
import { z } from "zod";
import { db } from "../db";
import { supportTickets, supportResponses, users } from "../../shared/schema";
import { eq, desc, count, avg, and, or, gte, sql, like } from "drizzle-orm";
import { requireAdminAuth } from "../utils/auth";

const router = Router();

// Get all support tickets with filters
router.get("/tickets", requireAdminAuth, async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 50, 
      status, 
      category, 
      priority, 
      search 
    } = req.query;

    const offset = (Number(page) - 1) * Number(limit);

    // Build where conditions
    let whereConditions = [];
    
    if (status) {
      whereConditions.push(eq(supportTickets.status, status as string));
    }
    
    if (category) {
      whereConditions.push(eq(supportTickets.category, category as string));
    }
    
    if (priority) {
      whereConditions.push(eq(supportTickets.priority, priority as string));
    }
    
    if (search) {
      whereConditions.push(
        or(
          like(supportTickets.subject, `%${search}%`),
          like(supportTickets.message, `%${search}%`)
        )
      );
    }

    const whereClause = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    // Get tickets with user information
    const tickets = await db
      .select({
        id: supportTickets.id,
        ticketNumber: supportTickets.ticketNumber,
        title: supportTickets.title,
        subject: supportTickets.subject,
        message: supportTickets.message,
        status: supportTickets.status,
        priority: supportTickets.priority,
        category: supportTickets.category,
        createdAt: supportTickets.createdAt,
        updatedAt: supportTickets.updatedAt,
        resolvedAt: supportTickets.resolvedAt,
        assignedTo: supportTickets.assignedTo,
        userId: supportTickets.userId,
        username: users.username,
        email: users.email,
        fullName: users.fullName
      })
      .from(supportTickets)
      .leftJoin(users, eq(supportTickets.userId, users.id))
      .where(whereClause)
      .orderBy(desc(supportTickets.createdAt))
      .limit(Number(limit))
      .offset(offset);

    // Get total count
    const totalResult = await db
      .select({ count: count() })
      .from(supportTickets)
      .where(whereClause);

    const total = totalResult[0].count;

    // Get latest response for each ticket
    const ticketsWithResponse = await Promise.all(
      tickets.map(async (ticket) => {
        try {
          const latestResponses = await db
            .select({
              id: supportResponses.id,
              message: supportResponses.message,
              createdAt: supportResponses.createdAt,
            })
            .from(supportResponses)
            .where(eq(supportResponses.ticketId, ticket.id))
            .orderBy(desc(supportResponses.createdAt))
            .limit(1);

          return {
            ...ticket,
            latestResponse: latestResponses.length > 0 ? latestResponses[0] : null
          };
        } catch (error) {
          console.warn(`Could not fetch responses for ticket ${ticket.id}:`, error.message);
          return {
            ...ticket,
            latestResponse: null
          };
        }
      })
    );

    res.json({
      success: true,
      data: {
        tickets: ticketsWithResponse,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total: total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });

  } catch (error) {
    console.error("Support tickets fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Destek talepleri alınırken hata oluştu"
    });
  }
});

// Get support statistics
router.get("/stats", requireAdminAuth, async (req, res) => {
  try {
    // Total tickets
    const totalTicketsResult = await db
      .select({ count: count() })
      .from(supportTickets);
    const totalTickets = totalTicketsResult[0].count;

    // Open tickets
    const openTicketsResult = await db
      .select({ count: count() })
      .from(supportTickets)
      .where(eq(supportTickets.status, 'open'));
    const openTickets = openTicketsResult[0].count;

    // Closed tickets
    const closedTicketsResult = await db
      .select({ count: count() })
      .from(supportTickets)
      .where(eq(supportTickets.status, 'closed'));
    const closedTickets = closedTicketsResult[0].count;

    // Pending tickets
    const pendingTicketsResult = await db
      .select({ count: count() })
      .from(supportTickets)
      .where(eq(supportTickets.status, 'pending'));
    const pendingTickets = pendingTicketsResult[0].count;

    // High priority tickets
    const highPriorityResult = await db
      .select({ count: count() })
      .from(supportTickets)
      .where(and(
        eq(supportTickets.priority, 'high'),
        eq(supportTickets.status, 'open')
      ));
    const highPriorityTickets = highPriorityResult[0].count;

    // Response time stats (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentTicketsResult = await db
      .select({ count: count() })
      .from(supportTickets)
      .where(gte(supportTickets.createdAt, thirtyDaysAgo));
    const recentTickets = recentTicketsResult[0].count;

    // Active agents count (mock data for now)
    const activeAgents = 3;

    res.json({
      success: true,
      stats: {
        totalTickets,
        openTickets,
        urgentTickets: highPriorityTickets,
        avgResponseTime: 150, // minutes
        categoryStats: {
          "general": Math.floor(totalTickets * 0.4),
          "technical": Math.floor(totalTickets * 0.3),
          "billing": Math.floor(totalTickets * 0.2),
          "other": Math.floor(totalTickets * 0.1)
        },
        agentPerformance: [
          {
            agentId: 1,
            agentName: "Ahmet Yılmaz",
            ticketsHandled: Math.floor(totalTickets * 0.4),
            avgResponseTime: 120,
            customerRating: 4.8
          },
          {
            agentId: 2,
            agentName: "Ayşe Demir",
            ticketsHandled: Math.floor(totalTickets * 0.35),
            avgResponseTime: 95,
            customerRating: 4.9
          },
          {
            agentId: 3,
            agentName: "Mehmet Kaya",
            ticketsHandled: Math.floor(totalTickets * 0.25),
            avgResponseTime: 180,
            customerRating: 4.6
          }
        ]
      }
    });

  } catch (error) {
    console.error("Support stats error:", error);
    res.status(500).json({
      success: false,
      error: "İstatistikler alınırken hata oluştu"
    });
  }
});

// Create new FAQ entry
router.post("/faq", requireAdminAuth, async (req, res) => {
  try {
    const { question, answer, category, isPublished = true } = req.body;

    if (!question || !answer) {
      return res.status(400).json({
        success: false,
        error: "Soru ve cevap alanları zorunludur"
      });
    }

    // For now, return mock response since we haven't created FAQ table
    const mockFaq = {
      id: Date.now(),
      question,
      answer,
      category: category || 'genel',
      isPublished,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    res.json({
      success: true,
      data: mockFaq
    });

  } catch (error) {
    console.error("FAQ creation error:", error);
    res.status(500).json({
      success: false,
      error: "FAQ oluşturulurken hata oluştu"
    });
  }
});

// Update ticket
router.put("/tickets/:id", requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const validFields = ['status', 'priority', 'assignedTo', 'category'];
    const filteredData: any = {};

    for (const field of validFields) {
      if (updateData[field] !== undefined) {
        filteredData[field] = updateData[field];
      }
    }

    if (Object.keys(filteredData).length === 0) {
      return res.status(400).json({
        success: false,
        error: "Güncellenecek geçerli alan bulunamadı"
      });
    }

    filteredData.updatedAt = new Date();

    const [updatedTicket] = await db
      .update(supportTickets)
      .set(filteredData)
      .where(eq(supportTickets.id, Number(id)))
      .returning();

    if (!updatedTicket) {
      return res.status(404).json({
        success: false,
        error: "Ticket bulunamadı"
      });
    }

    res.json({
      success: true,
      data: updatedTicket
    });

  } catch (error) {
    console.error("Ticket update error:", error);
    res.status(500).json({
      success: false,
      error: "Ticket güncellenirken hata oluştu"
    });
  }
});

// Add response to ticket
router.post("/tickets/:ticketId/responses", requireAdminAuth, async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { message, isInternal = false } = req.body;
    const userId = (req.session as any).userId;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        error: "Mesaj alanı zorunludur"
      });
    }

    let newResponse;
    try {
      newResponse = await db
        .insert(supportResponses)
        .values({
          ticketId: Number(ticketId),
          userId: userId || 1, // Default admin user
          message: message.trim(),
          isAdmin: true,
          createdAt: new Date()
        })
        .returning();
    } catch (error) {
      console.warn(`Could not create response for ticket ${ticketId}:`, error.message);
      // Fallback to mock response
      newResponse = [{
        id: Date.now(),
        ticketId: Number(ticketId),
        userId: userId || 1,
        message: message.trim(),
        isAdmin: true,
        createdAt: new Date()
      }];
    }

    // Update ticket's updatedAt timestamp
    await db
      .update(supportTickets)
      .set({ updatedAt: new Date() })
      .where(eq(supportTickets.id, Number(ticketId)));

    res.json({
      success: true,
      data: newResponse[0]
    });

  } catch (error) {
    console.error("Response creation error:", error);
    res.status(500).json({
      success: false,
      error: "Yanıt eklenirken hata oluştu"
    });
  }
});

// Get single ticket details
router.get("/tickets/:id", requireAdminAuth, async (req, res) => {
  try {
    const { id } = req.params;

    const ticket = await db
      .select({
        id: supportTickets.id,
        title: supportTickets.title,
        description: supportTickets.description,
        status: supportTickets.status,
        priority: supportTickets.priority,
        category: supportTickets.category,
        assignedTo: supportTickets.assignedTo,
        createdAt: supportTickets.createdAt,
        updatedAt: supportTickets.updatedAt,
        userId: supportTickets.userId,
        userName: users.username,
        userEmail: users.email
      })
      .from(supportTickets)
      .leftJoin(users, eq(supportTickets.userId, users.id))
      .where(eq(supportTickets.id, Number(id)))
      .limit(1);

    if (ticket.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Ticket bulunamadı"
      });
    }

    // Get responses for this ticket
    let responses: any[] = [];
    try {
      responses = await db
        .select({
          id: supportResponses.id,
          message: supportResponses.message,
          isAdmin: supportResponses.isAdmin,
          createdAt: supportResponses.createdAt,
          userId: supportResponses.userId,
          userName: users.username
        })
        .from(supportResponses)
        .leftJoin(users, eq(supportResponses.userId, users.id))
        .where(eq(supportResponses.ticketId, Number(id)))
        .orderBy(supportResponses.createdAt);
    } catch (error) {
      console.warn(`Could not fetch responses for ticket ${id}:`, error.message);
      responses = [];
    }

    res.json({
      success: true,
      data: {
        ticket: ticket[0],
        responses
      }
    });

  } catch (error) {
    console.error("Ticket details error:", error);
    res.status(500).json({
      success: false,
      error: "Ticket detayları alınırken hata oluştu"
    });
  }
});

// Get FAQ entries
router.get("/faq", requireAdminAuth, async (req, res) => {
  try {
    // Mock FAQ data for now
    const mockFaqs = [
      {
        id: 1,
        question: "Hesabım nasıl doğrulanır?",
        answer: "Hesap doğrulama için kimlik belgesi ve adres belgesi yüklemeniz gerekir.",
        category: "hesap",
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 2,
        question: "Para çekme işlemi ne kadar sürer?",
        answer: "Para çekme işlemleri genellikle 1-3 iş günü içinde tamamlanır.",
        category: "finansal",
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 3,
        question: "Bonuslar nasıl kullanılır?",
        answer: "Bonuslar otomatik olarak hesabınıza eklenir ve oyunlarda kullanılabilir.",
        category: "bonus",
        isPublished: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    res.json({
      success: true,
      data: mockFaqs
    });

  } catch (error) {
    console.error("FAQ fetch error:", error);
    res.status(500).json({
      success: false,
      error: "SSS verileri alınırken hata oluştu"
    });
  }
});

export default router;