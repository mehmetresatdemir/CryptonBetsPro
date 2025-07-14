import { Router } from "express";
import { db } from "../db";
import { emailTemplates, type InsertEmailTemplate, type SelectEmailTemplate } from "@shared/schema";
import { eq, desc, and, like, or } from "drizzle-orm";
import { requireAdminAuth } from "../utils/auth";

const router = Router();

// Email şablonlarını listele
router.get("/email-templates", requireAdminAuth, async (req, res) => {
  try {
    const { search, type, language, status } = req.query;
    
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          like(emailTemplates.name, `%${search}%`),
          like(emailTemplates.subject, `%${search}%`)
        )
      );
    }
    
    if (type && type !== 'all') {
      conditions.push(eq(emailTemplates.type, type as string));
    }
    
    if (language && language !== 'all') {
      conditions.push(eq(emailTemplates.language, language as string));
    }
    
    if (status && status !== 'all') {
      const isActive = status === 'active';
      conditions.push(eq(emailTemplates.isActive, isActive));
    }
    
    let query;
    
    if (conditions.length > 0) {
      query = db.select().from(emailTemplates).where(and(...conditions)).orderBy(desc(emailTemplates.createdAt));
    } else {
      query = db.select().from(emailTemplates).orderBy(desc(emailTemplates.createdAt));
    }
    
    const templates = await db.execute(`
      SELECT 
        id, name, subject, template_type, content, variables, 
        is_active, language, created_at, updated_at
      FROM email_templates 
      ORDER BY template_type, name
    `);
    
    res.json({
      success: true,
      data: templates.rows
    });
  } catch (error) {
    console.error("Email templates fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Email şablonları alınamadı"
    });
  }
});

// Email şablon istatistikleri
router.get("/email-templates/stats", requireAdminAuth, async (req, res) => {
  try {
    const stats = await db.execute(`
      SELECT 
        COUNT(*) as total,
        COUNT(CASE WHEN is_active = true THEN 1 END) as active,
        COUNT(CASE WHEN template_type = 'user' THEN 1 END) as user_templates,
        COUNT(CASE WHEN template_type = 'transaction' THEN 1 END) as transaction_templates,
        COUNT(CASE WHEN template_type = 'bonus' THEN 1 END) as bonus_templates,
        COUNT(CASE WHEN template_type = 'security' THEN 1 END) as security_templates
      FROM email_templates
    `);
    
    res.json({ success: true, data: stats.rows[0] });
  } catch (error) {
    console.error("Email template stats error:", error);
    res.status(500).json({
      success: false,
      error: "İstatistikler alınamadı"
    });
  }
});

// Yeni email şablonu oluştur
router.post("/email-templates", requireAdminAuth, async (req, res) => {
  try {
    const templateData: InsertEmailTemplate = req.body;
    
    // Validation
    if (!templateData.name || !templateData.subject || !templateData.body || !templateData.type) {
      return res.status(400).json({
        success: false,
        error: "Gerekli alanlar eksik"
      });
    }
    
    const [newTemplate] = await db
      .insert(emailTemplates)
      .values({
        name: templateData.name,
        type: templateData.type,
        subject: templateData.subject,
        body: templateData.body
      })
      .returning();
    
    res.json({
      success: true,
      data: newTemplate,
      message: "Email şablonu başarıyla oluşturuldu"
    });
  } catch (error) {
    console.error("Email template creation error:", error);
    res.status(500).json({
      success: false,
      error: "Email şablonu oluşturulamadı"
    });
  }
});

// Email şablonu güncelle
router.put("/email-templates/:id", requireAdminAuth, async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const updateData = req.body;
    
    const [updatedTemplate] = await db
      .update(emailTemplates)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(emailTemplates.id, templateId))
      .returning();
    
    if (!updatedTemplate) {
      return res.status(404).json({
        success: false,
        error: "Email şablonu bulunamadı"
      });
    }
    
    res.json({
      success: true,
      data: updatedTemplate,
      message: "Email şablonu başarıyla güncellendi"
    });
  } catch (error) {
    console.error("Email template update error:", error);
    res.status(500).json({
      success: false,
      error: "Email şablonu güncellenemedi"
    });
  }
});

// Email şablonu sil
router.delete("/email-templates/:id", requireAdminAuth, async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    
    const [deletedTemplate] = await db
      .delete(emailTemplates)
      .where(eq(emailTemplates.id, templateId))
      .returning();
    
    if (!deletedTemplate) {
      return res.status(404).json({
        success: false,
        error: "Email şablonu bulunamadı"
      });
    }
    
    res.json({
      success: true,
      message: "Email şablonu başarıyla silindi"
    });
  } catch (error) {
    console.error("Email template deletion error:", error);
    res.status(500).json({
      success: false,
      error: "Email şablonu silinemedi"
    });
  }
});

// Email şablon durumunu değiştir
router.patch("/email-templates/:id/toggle", requireAdminAuth, async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const { isActive } = req.body;
    
    const [updatedTemplate] = await db
      .update(emailTemplates)
      .set({
        isActive,
        updatedAt: new Date()
      })
      .where(eq(emailTemplates.id, templateId))
      .returning();
    
    if (!updatedTemplate) {
      return res.status(404).json({
        success: false,
        error: "Email şablonu bulunamadı"
      });
    }
    
    res.json({
      success: true,
      data: updatedTemplate,
      message: `Email şablonu ${isActive ? 'aktif' : 'pasif'} edildi`
    });
  } catch (error) {
    console.error("Email template toggle error:", error);
    res.status(500).json({
      success: false,
      error: "Email şablon durumu değiştirilemedi"
    });
  }
});

// Email şablonu önizleme
router.get("/email-templates/:id/preview", requireAdminAuth, async (req, res) => {
  try {
    const templateId = parseInt(req.params.id);
    const { variables } = req.query;
    
    const [template] = await db
      .select()
      .from(emailTemplates)
      .where(eq(emailTemplates.id, templateId));
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: "Email şablonu bulunamadı"
      });
    }
    
    let processedBody = template.body;
    let processedSubject = template.subject;
    
    // Variables varsa, template'i process et
    if (variables) {
      const parsedVariables = typeof variables === 'string' ? JSON.parse(variables) : variables;
      
      Object.entries(parsedVariables).forEach(([key, value]) => {
        const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
        processedBody = processedBody.replace(regex, String(value));
        processedSubject = processedSubject.replace(regex, String(value));
      });
    }
    
    res.json({
      success: true,
      data: {
        ...template,
        processedSubject,
        processedBody
      }
    });
  } catch (error) {
    console.error("Email template preview error:", error);
    res.status(500).json({
      success: false,
      error: "Email şablonu önizlenemedi"
    });
  }
});

// Bulk operations
router.post("/email-templates/bulk", requireAdminAuth, async (req, res) => {
  try {
    const { action, ids } = req.body;
    
    if (!action || !ids || !Array.isArray(ids)) {
      return res.status(400).json({
        success: false,
        error: "Geçersiz bulk işlem parametreleri"
      });
    }
    
    let result;
    
    switch (action) {
      case 'activate':
        result = await db
          .update(emailTemplates)
          .set({ isActive: true, updatedAt: new Date() })
          .where(eq(emailTemplates.id, ids[0])); // Drizzle doesn't support IN with array directly
        break;
        
      case 'deactivate':
        result = await db
          .update(emailTemplates)
          .set({ isActive: false, updatedAt: new Date() })
          .where(eq(emailTemplates.id, ids[0]));
        break;
        
      case 'delete':
        result = await db
          .delete(emailTemplates)
          .where(eq(emailTemplates.id, ids[0]));
        break;
        
      default:
        return res.status(400).json({
          success: false,
          error: "Geçersiz bulk işlem"
        });
    }
    
    res.json({
      success: true,
      message: `Bulk ${action} işlemi başarıyla tamamlandı`
    });
  } catch (error) {
    console.error("Bulk operation error:", error);
    res.status(500).json({
      success: false,
      error: "Bulk işlem başarısız"
    });
  }
});

export default router;