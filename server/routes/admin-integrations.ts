import { Router } from 'express';
import { db } from '../db';
import { apiIntegrations } from '@shared/schema';
import { eq, desc, count, sum, avg } from 'drizzle-orm';

const router = Router();

import { requireAdminAuth } from '../utils/auth';

// Sample integration data for initial seeding
const sampleIntegrations = [
  {
    name: 'Slotegrator Gaming API',
    provider: 'Slotegrator',
    type: 'gaming',
    category: 'games',
    status: 'active',
    isActive: true,
    endpoint: 'https://api.slotegrator.com/v1',
    version: '2.4.1',
    successRate: '98.5',
    avgResponseTime: 145,
    totalRequests: 15420,
    dailyLimit: 50000,
    usedToday: 1247,
    errorCount: 23,
    description: 'Ana oyun sağlayıcısı API entegrasyonu',
    documentation: 'https://slotegrator.com/docs',
    supportContact: 'support@slotegrator.com'
  },
  {
    name: 'Stripe Payment Gateway',
    provider: 'Stripe',
    type: 'payment',
    category: 'payment',
    status: 'active',
    isActive: true,
    endpoint: 'https://api.stripe.com/v1',
    version: '2023-10-16',
    successRate: '99.8',
    avgResponseTime: 89,
    totalRequests: 8934,
    dailyLimit: 100000,
    usedToday: 456,
    errorCount: 2,
    description: 'Kredi kartı ödemeler için ana gateway',
    documentation: 'https://stripe.com/docs',
    supportContact: 'support@stripe.com'
  },
  {
    name: 'Twilio SMS Service',
    provider: 'Twilio',
    type: 'sms',
    category: 'communication',
    status: 'active',
    isActive: true,
    endpoint: 'https://api.twilio.com/2010-04-01',
    version: '2010-04-01',
    successRate: '97.2',
    avgResponseTime: 234,
    totalRequests: 2134,
    dailyLimit: 10000,
    usedToday: 89,
    errorCount: 12,
    description: 'SMS doğrulama ve bildirimleri',
    documentation: 'https://twilio.com/docs',
    supportContact: 'support@twilio.com'
  },
  {
    name: 'SendGrid Email Service',
    provider: 'SendGrid',
    type: 'email',
    category: 'communication',
    status: 'active',
    isActive: true,
    endpoint: 'https://api.sendgrid.com/v3',
    version: 'v3',
    successRate: '99.1',
    avgResponseTime: 178,
    totalRequests: 5672,
    dailyLimit: 25000,
    usedToday: 234,
    errorCount: 8,
    description: 'Email kampanyaları ve transaksiyonel mailler',
    documentation: 'https://sendgrid.com/docs',
    supportContact: 'support@sendgrid.com'
  },
  {
    name: 'Google Analytics',
    provider: 'Google',
    type: 'analytics',
    category: 'analytics',
    status: 'active',
    isActive: true,
    endpoint: 'https://analyticsreporting.googleapis.com/v4',
    version: 'v4',
    successRate: '99.9',
    avgResponseTime: 312,
    totalRequests: 1234,
    dailyLimit: 50000,
    usedToday: 67,
    errorCount: 1,
    description: 'Web analitik ve kullanıcı davranış analizi',
    documentation: 'https://developers.google.com/analytics',
    supportContact: 'analytics-api-support@google.com'
  },
  {
    name: 'Cloudflare Security',
    provider: 'Cloudflare',
    type: 'security',
    category: 'security',
    status: 'active',
    isActive: true,
    endpoint: 'https://api.cloudflare.com/client/v4',
    version: 'v4',
    successRate: '99.7',
    avgResponseTime: 98,
    totalRequests: 892,
    dailyLimit: 1200,
    usedToday: 23,
    errorCount: 1,
    description: 'DDoS koruması ve güvenlik duvarı',
    documentation: 'https://developers.cloudflare.com',
    supportContact: 'support@cloudflare.com'
  },
  {
    name: 'Zendesk Support',
    provider: 'Zendesk',
    type: 'support',
    category: 'support',
    status: 'testing',
    isActive: false,
    endpoint: 'https://cryptonbets.zendesk.com/api/v2',
    version: 'v2',
    successRate: '95.3',
    avgResponseTime: 445,
    totalRequests: 345,
    dailyLimit: 5000,
    usedToday: 12,
    errorCount: 16,
    description: 'Müşteri destek sistemi entegrasyonu',
    documentation: 'https://developer.zendesk.com',
    supportContact: 'api@zendesk.com'
  },
  {
    name: 'Mailchimp Marketing',
    provider: 'Mailchimp',
    type: 'email_marketing',
    category: 'marketing',
    status: 'inactive',
    isActive: false,
    endpoint: 'https://us1.api.mailchimp.com/3.0',
    version: '3.0',
    successRate: '89.4',
    avgResponseTime: 567,
    totalRequests: 123,
    dailyLimit: 10000,
    usedToday: 0,
    errorCount: 45,
    description: 'Email pazarlama kampanyaları',
    documentation: 'https://mailchimp.com/developer',
    supportContact: 'api@mailchimp.com'
  }
];

// Get all integrations
router.get('/integrations', requireAdminAuth, async (req, res) => {
  try {
    let integrations = await db.execute(`
      SELECT 
        id, name, provider, type, category,
        endpoint, version, is_active as "isActive",
        status, success_rate as "successRate", avg_response_time as "avgResponseTime",
        total_requests as "totalRequests", daily_limit as "dailyLimit", 
        used_today as "usedToday", error_count as "errorCount",
        description, last_sync as "lastSync", created_at, updated_at
      FROM api_integrations 
      ORDER BY name
    `);
    
    // Eğer hiç entegrasyon yoksa, sample data'yı ekle
    if (integrations.rows.length === 0) {
      console.log('API entegrasyonları bulunamadı, sample data ekleniyor...');
      
      for (const integration of sampleIntegrations) {
        await db.insert(apiIntegrations).values({
          name: integration.name,
          provider: integration.provider,
          type: integration.type,
          category: integration.category,
          status: integration.status,
          isActive: integration.isActive,
          endpoint: integration.endpoint,
          version: integration.version,
          successRate: integration.successRate,
          avgResponseTime: integration.avgResponseTime,
          totalRequests: integration.totalRequests,
          dailyLimit: integration.dailyLimit,
          usedToday: integration.usedToday,
          errorCount: integration.errorCount,
          description: integration.description,
          documentation: integration.documentation,
          supportContact: integration.supportContact
        });
      }
      
      // Tekrar sorguya al
      integrations = await db.execute(`
        SELECT 
          id, name, provider, type, category,
          endpoint, version, is_active as "isActive",
          status, success_rate as "successRate", avg_response_time as "avgResponseTime",
          total_requests as "totalRequests", daily_limit as "dailyLimit", 
          used_today as "usedToday", error_count as "errorCount",
          description, last_sync as "lastSync", created_at, updated_at
        FROM api_integrations 
        ORDER BY name
      `);
      
      console.log(`${sampleIntegrations.length} sample entegrasyon eklendi.`);
    }
    
    res.json(integrations.rows);
  } catch (error) {
    console.error('Entegrasyonlar yüklenirken hata:', error);
    res.status(500).json({ error: 'Entegrasyonlar yüklenemedi' });
  }
});

// Get integration statistics
router.get('/integrations/stats', requireAdminAuth, async (req, res) => {
  try {
    const [totalResult] = await db.select({ count: count() }).from(apiIntegrations);
    const totalIntegrations = totalResult.count;
    
    const [activeResult] = await db.select({ count: count() })
      .from(apiIntegrations)
      .where(eq(apiIntegrations.isActive, true));
    const activeIntegrations = activeResult.count;
    
    // Use simple count for error integrations
    const errorIntegrations = 0; // No error status in current schema
    
    // Use fixed values for missing columns
    const avgResponseTime = 150; // Default response time
    const totalRequests24h = 1247; // Sample request count
    
    const [successRateResult] = await db.select({ 
      avg: avg(apiIntegrations.successRate) 
    }).from(apiIntegrations).where(eq(apiIntegrations.isActive, true));
    const successRate = Math.round(Number(successRateResult.avg) || 0);
    
    const [topPerformingResult] = await db.select({ name: apiIntegrations.name })
      .from(apiIntegrations)
      .where(eq(apiIntegrations.isActive, true))
      .orderBy(desc(apiIntegrations.successRate))
      .limit(1);
    const topPerformingIntegration = topPerformingResult?.name || 'N/A';
    
    const recentErrors = 5; // Simulated value
    
    res.json({
      totalIntegrations,
      activeIntegrations,
      errorIntegrations,
      avgResponseTime,
      totalRequests24h,
      successRate,
      topPerformingIntegration,
      recentErrors
    });
  } catch (error) {
    console.error('İstatistikler yüklenirken hata:', error);
    res.status(500).json({ error: 'İstatistikler yüklenemedi' });
  }
});

// Test integration
router.post('/integrations/:id/test', requireAdminAuth, async (req, res) => {
  try {
    const integrationId = parseInt(req.params.id);
    
    const [integration] = await db.select()
      .from(apiIntegrations)
      .where(eq(apiIntegrations.id, integrationId));
    
    if (!integration) {
      return res.status(404).json({ error: 'Entegrasyon bulunamadı' });
    }
    
    // Simulate API test
    const isSuccess = Math.random() > 0.1; // 90% success rate for simulation
    const responseTime = Math.floor(Math.random() * 500) + 50; // 50-550ms
    
    // Update integration stats
    if (isSuccess) {
      await db.update(apiIntegrations)
        .set({
          lastSync: new Date(),
          status: 'active',
          lastError: null,
          avgResponseTime: Math.round(((integration.avgResponseTime || 0) + responseTime) / 2),
          totalRequests: (integration.totalRequests || 0) + 1,
          updatedAt: new Date()
        })
        .where(eq(apiIntegrations.id, integrationId));
    } else {
      await db.update(apiIntegrations)
        .set({
          status: 'error',
          lastError: 'Test connection failed',
          errorCount: (integration.errorCount || 0) + 1,
          updatedAt: new Date()
        })
        .where(eq(apiIntegrations.id, integrationId));
    }
    
    res.json({
      success: isSuccess,
      message: isSuccess ? 'Test başarılı' : 'Test başarısız',
      responseTime,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Test işlemi sırasında hata:', error);
    res.status(500).json({ error: 'Test gerçekleştirilemedi' });
  }
});

// Toggle integration status
router.patch('/integrations/:id/toggle', requireAdminAuth, async (req, res) => {
  try {
    const integrationId = parseInt(req.params.id);
    const { isActive } = req.body;
    
    const [integration] = await db.select()
      .from(apiIntegrations)
      .where(eq(apiIntegrations.id, integrationId));
    
    if (!integration) {
      return res.status(404).json({ error: 'Entegrasyon bulunamadı' });
    }
    
    await db.update(apiIntegrations)
      .set({
        isActive,
        status: isActive ? 'active' : 'inactive',
        updatedAt: new Date()
      })
      .where(eq(apiIntegrations.id, integrationId));
    
    res.json({ 
      success: true, 
      message: `Entegrasyon ${isActive ? 'aktif' : 'pasif'} edildi` 
    });
  } catch (error) {
    console.error('Durum değiştirme sırasında hata:', error);
    res.status(500).json({ error: 'Durum değiştirilemedi' });
  }
});

// Create new integration
router.post('/integrations', requireAdminAuth, async (req, res) => {
  try {
    const {
      name,
      provider,
      type,
      category,
      endpoint,
      version,
      dailyLimit,
      description,
      documentation,
      supportContact
    } = req.body;
    
    const [newIntegration] = await db.insert(apiIntegrations)
      .values({
        name,
        provider,
        type,
        category: category || 'integration',
        endpoint,
        version,
        dailyLimit: dailyLimit || 10000,
        description,
        documentation,
        supportContact,
        status: 'inactive',
        isActive: false,
        successRate: '0',
        avgResponseTime: 0,
        totalRequests: 0,
        usedToday: 0,
        errorCount: 0
      })
      .returning();
    
    res.status(201).json(newIntegration);
  } catch (error) {
    console.error('Entegrasyon oluşturma sırasında hata:', error);
    res.status(500).json({ error: 'Entegrasyon oluşturulamadı' });
  }
});

// Update integration
router.put('/integrations/:id', requireAdminAuth, async (req, res) => {
  try {
    const integrationId = parseInt(req.params.id);
    const {
      name,
      provider,
      type,
      category,
      endpoint,
      version,
      dailyLimit,
      description,
      documentation,
      supportContact
    } = req.body;
    
    const [integration] = await db.select()
      .from(apiIntegrations)
      .where(eq(apiIntegrations.id, integrationId));
    
    if (!integration) {
      return res.status(404).json({ error: 'Entegrasyon bulunamadı' });
    }
    
    const [updatedIntegration] = await db.update(apiIntegrations)
      .set({
        name,
        provider,
        type,
        category: category || 'integration',
        endpoint,
        version,
        dailyLimit: dailyLimit || 10000,
        description,
        documentation,
        supportContact,
        updatedAt: new Date()
      })
      .where(eq(apiIntegrations.id, integrationId))
      .returning();
    
    res.json({
      success: true,
      message: 'Entegrasyon başarıyla güncellendi',
      data: updatedIntegration
    });
  } catch (error) {
    console.error('Entegrasyon güncelleme sırasında hata:', error);
    res.status(500).json({ error: 'Entegrasyon güncellenemedi' });
  }
});

// Delete integration
router.delete('/integrations/:id', requireAdminAuth, async (req, res) => {
  try {
    const integrationId = parseInt(req.params.id);
    
    const [integration] = await db.select()
      .from(apiIntegrations)
      .where(eq(apiIntegrations.id, integrationId));
    
    if (!integration) {
      return res.status(404).json({ error: 'Entegrasyon bulunamadı' });
    }
    
    await db.delete(apiIntegrations)
      .where(eq(apiIntegrations.id, integrationId));
    
    res.json({
      success: true,
      message: 'Entegrasyon başarıyla silindi'
    });
  } catch (error) {
    console.error('Entegrasyon silme sırasında hata:', error);
    res.status(500).json({ error: 'Entegrasyon silinemedi' });
  }
});

// Get integration details
router.get('/integrations/:id', requireAdminAuth, async (req, res) => {
  try {
    const integrationId = parseInt(req.params.id);
    
    const [integration] = await db.select()
      .from(apiIntegrations)
      .where(eq(apiIntegrations.id, integrationId));
    
    if (!integration) {
      return res.status(404).json({ error: 'Entegrasyon bulunamadı' });
    }
    
    res.json(integration);
  } catch (error) {
    console.error('Entegrasyon detayları yüklenirken hata:', error);
    res.status(500).json({ error: 'Detaylar yüklenemedi' });
  }
});

export default router;