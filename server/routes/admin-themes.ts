import { Router } from 'express';
import { db } from '../db';
import { themes, themeCustomizations } from '@shared/schema';
import { eq, desc } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const router = Router();

const JWT_SECRET = process.env.JWT_SECRET || "cryptonbets_jwt_secret_key_2024_secure_random_string_1234567890abcdef";

import { requireAdminAuth } from '../utils/auth';

// Get all themes
router.get('/', requireAdminAuth, async (req, res) => {
  try {
    console.log('🔍 Tema verileri yükleniyor...');
    const allThemes = await db.execute(`
      SELECT 
        id, name, display_name, description, is_active, is_default,
        primary_color, secondary_color, accent_color, background_color, text_color,
        logo_url, favicon_url, preview_image, created_at, updated_at
      FROM themes 
      ORDER BY is_default DESC, is_active DESC, name
    `);
    console.log('✅ Temalar başarıyla yüklendi:', allThemes.rows.length);
    res.json(allThemes.rows);
  } catch (error) {
    console.error('Themes fetch error:', error);
    res.status(500).json({ error: 'Temalar alınamadı' });
  }
});

// Get all themes (alternative route)
router.get('/themes', requireAdminAuth, async (req, res) => {
  try {
    const allThemes = await db.execute(`
      SELECT 
        id, name, display_name, description, is_active, is_default,
        primary_color, secondary_color, accent_color, background_color, text_color,
        logo_url, favicon_url, preview_image, created_at, updated_at
      FROM themes 
      ORDER BY is_default DESC, is_active DESC, name
    `);
    res.json(allThemes.rows);
  } catch (error) {
    console.error('Themes fetch error:', error);
    res.status(500).json({ error: 'Temalar alınamadı' });
  }
});

// Get theme by ID
router.get('/themes/:id', requireAdminAuth, async (req, res) => {
  try {
    const themeId = parseInt(req.params.id);
    const [theme] = await db.select().from(themes).where(eq(themes.id, themeId));
    
    if (!theme) {
      return res.status(404).json({ error: 'Tema bulunamadı' });
    }
    
    res.json(theme);
  } catch (error) {
    console.error('Theme fetch error:', error);
    res.status(500).json({ error: 'Tema alınamadı' });
  }
});

// Create new theme
router.post('/themes', requireAdminAuth, async (req, res) => {
  try {
    const {
      name,
      displayName,
      description,
      category,
      isPremium,
      colors,
      fonts,
      layout,
      effects,
      components,
      cssFile,
      version,
      author,
      tags
    } = req.body;

    // Check if theme name already exists
    const [existingTheme] = await db.select().from(themes).where(eq(themes.name, name));
    if (existingTheme) {
      return res.status(400).json({ error: 'Bu tema adı zaten kullanımda' });
    }

    const [newTheme] = await db.insert(themes).values({
      name,
      displayName,
      description,
      category,
      isPremium: isPremium || false,
      colors,
      fonts,
      layout,
      effects,
      components,
      cssFile,
      version: version || '1.0.0',
      author: author || 'CryptonBets',
      tags: tags || [],
      createdBy: req.session.userId,
      updatedBy: req.session.userId
    }).returning();

    res.status(201).json(newTheme);
  } catch (error) {
    console.error('Theme creation error:', error);
    res.status(500).json({ error: 'Tema oluşturulamadı' });
  }
});

// Update theme
router.put('/themes/:id', requireAdminAuth, async (req, res) => {
  try {
    const themeId = parseInt(req.params.id);
    const updateData = req.body;
    
    // Check if theme exists
    const [existingTheme] = await db.select().from(themes).where(eq(themes.id, themeId));
    if (!existingTheme) {
      return res.status(404).json({ error: 'Tema bulunamadı' });
    }

    const [updatedTheme] = await db.update(themes)
      .set({
        ...updateData,
        updatedBy: req.session.userId,
        updatedAt: new Date()
      })
      .where(eq(themes.id, themeId))
      .returning();

    res.json(updatedTheme);
  } catch (error) {
    console.error('Theme update error:', error);
    res.status(500).json({ error: 'Tema güncellenemedi' });
  }
});

// Activate theme
router.post('/themes/:id/activate', requireAdminAuth, async (req, res) => {
  try {
    const themeId = parseInt(req.params.id);
    
    // Deactivate all themes first
    await db.update(themes).set({ isActive: false });
    
    // Activate selected theme
    const [activatedTheme] = await db.update(themes)
      .set({ 
        isActive: true,
        updatedBy: req.session.userId,
        updatedAt: new Date()
      })
      .where(eq(themes.id, themeId))
      .returning();

    if (!activatedTheme) {
      return res.status(404).json({ error: 'Tema bulunamadı' });
    }

    res.json({ message: 'Tema başarıyla aktif edildi', theme: activatedTheme });
  } catch (error) {
    console.error('Theme activation error:', error);
    res.status(500).json({ error: 'Tema aktif edilemedi' });
  }
});

// Delete theme
router.delete('/themes/:id', requireAdminAuth, async (req, res) => {
  try {
    const themeId = parseInt(req.params.id);
    
    // Check if theme exists and is not active
    const [existingTheme] = await db.select().from(themes).where(eq(themes.id, themeId));
    if (!existingTheme) {
      return res.status(404).json({ error: 'Tema bulunamadı' });
    }
    
    if (existingTheme.isActive) {
      return res.status(400).json({ error: 'Aktif tema silinemez' });
    }

    // Delete theme customizations first
    await db.delete(themeCustomizations).where(eq(themeCustomizations.themeId, themeId));
    
    // Delete theme
    await db.delete(themes).where(eq(themes.id, themeId));

    res.json({ message: 'Tema başarıyla silindi' });
  } catch (error) {
    console.error('Theme deletion error:', error);
    res.status(500).json({ error: 'Tema silinemedi' });
  }
});

// Save theme customization
router.post('/themes/:id/customize', requireAdminAuth, async (req, res) => {
  try {
    const themeId = parseInt(req.params.id);
    const { customizationName, changes, isPublic } = req.body;

    const [customization] = await db.insert(themeCustomizations).values({
      themeId,
      userId: req.session.userId,
      customizationName,
      changes,
      isPublic: isPublic || false
    }).returning();

    res.status(201).json(customization);
  } catch (error) {
    console.error('Theme customization error:', error);
    res.status(500).json({ error: 'Özelleştirme kaydedilemedi' });
  }
});

// Get theme customizations
router.get('/themes/:id/customizations', requireAdminAuth, async (req, res) => {
  try {
    const themeId = parseInt(req.params.id);
    
    const customizations = await db.select()
      .from(themeCustomizations)
      .where(eq(themeCustomizations.themeId, themeId))
      .orderBy(desc(themeCustomizations.createdAt));

    res.json(customizations);
  } catch (error) {
    console.error('Theme customizations fetch error:', error);
    res.status(500).json({ error: 'Özelleştirmeler alınamadı' });
  }
});

// Get active theme
router.get('/active-theme', async (req, res) => {
  try {
    const [activeTheme] = await db.select().from(themes).where(eq(themes.isActive, true));
    
    if (!activeTheme) {
      // Return default theme if no active theme found
      return res.json({
        id: 0,
        name: 'default',
        displayName: 'Default Theme',
        colors: {
          primary: '#FFD700',
          secondary: '#FFA500',
          accent: '#FF6B35',
          background: '#0A0A0A',
          surface: '#1A1A1A',
          text: '#FFFFFF',
          textSecondary: '#B0B0B0',
          border: '#333333',
          success: '#10B981',
          warning: '#F59E0B',
          error: '#EF4444',
          info: '#3B82F6'
        }
      });
    }
    
    res.json(activeTheme);
  } catch (error) {
    console.error('Active theme fetch error:', error);
    res.status(500).json({ error: 'Aktif tema alınamadı' });
  }
});

// Theme statistics
router.get('/stats', requireAdminAuth, async (req, res) => {
  try {
    const allThemes = await db.select().from(themes);
    const activeThemes = allThemes.filter(theme => theme.isActive);
    const customizations = await db.select().from(themeCustomizations);
    
    const stats = {
      totalThemes: allThemes.length,
      activeTheme: activeThemes[0]?.displayName || 'Yok',
      customizations: customizations.length,
      lastUpdated: allThemes.length > 0 ? 
        Math.max(...allThemes.map(t => new Date(t.updatedAt || new Date()).getTime())) : 
        new Date().toISOString(),
      categories: {
        casino: allThemes.filter(t => t.category === 'casino').length,
        luxury: allThemes.filter(t => t.category === 'luxury').length,
        neon: allThemes.filter(t => t.category === 'neon').length,
        minimal: allThemes.filter(t => t.category === 'minimal').length,
        classic: allThemes.filter(t => t.category === 'classic').length,
        modern: allThemes.filter(t => t.category === 'modern').length,
      }
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Theme stats error:', error);
    res.status(500).json({ error: 'İstatistikler alınamadı' });
  }
});

// Export theme
router.get('/themes/:id/export', requireAdminAuth, async (req, res) => {
  try {
    const themeId = parseInt(req.params.id);
    const [theme] = await db.select().from(themes).where(eq(themes.id, themeId));
    
    if (!theme) {
      return res.status(404).json({ error: 'Tema bulunamadı' });
    }

    // Remove internal fields for export
    const exportData = {
      name: theme.name,
      displayName: theme.displayName,
      description: theme.description,
      category: theme.category,
      colors: theme.colors,
      fonts: theme.fonts,
      layout: theme.layout,
      effects: theme.effects,
      components: theme.components,
      version: theme.version,
      author: theme.author,
      tags: theme.tags,
      exportedAt: new Date().toISOString()
    };

    res.setHeader('Content-Disposition', `attachment; filename="${theme.name}-theme.json"`);
    res.setHeader('Content-Type', 'application/json');
    res.json(exportData);
  } catch (error) {
    console.error('Theme export error:', error);
    res.status(500).json({ error: 'Tema dışa aktarılamadı' });
  }
});

// Import theme
router.post('/import', requireAdminAuth, async (req, res) => {
  try {
    const themeData = req.body;
    
    // Validate required fields
    if (!themeData.name || !themeData.displayName || !themeData.colors) {
      return res.status(400).json({ error: 'Eksik tema verileri' });
    }

    // Check if theme name already exists
    const [existingTheme] = await db.select().from(themes).where(eq(themes.name, themeData.name));
    if (existingTheme) {
      return res.status(400).json({ error: 'Bu tema adı zaten kullanımda' });
    }

    const [importedTheme] = await db.insert(themes).values({
      name: themeData.name,
      displayName: themeData.displayName,
      description: themeData.description || '',
      category: themeData.category || 'modern',
      colors: themeData.colors,
      fonts: themeData.fonts || {},
      layout: themeData.layout || {},
      effects: themeData.effects || {},
      components: themeData.components || {},
      version: themeData.version || '1.0.0',
      author: themeData.author || 'Imported',
      tags: themeData.tags || [],
      createdBy: req.session.userId,
      updatedBy: req.session.userId
    }).returning();

    res.status(201).json({ message: 'Tema başarıyla içe aktarıldı', theme: importedTheme });
  } catch (error) {
    console.error('Theme import error:', error);
    res.status(500).json({ error: 'Tema içe aktarılamadı' });
  }
});

// Get theme statistics  
router.get('/theme-stats', requireAdminAuth, async (req, res) => {
  try {
    const allThemes = await db.select().from(themes);
    const activeTheme = allThemes.find(theme => theme.isActive);
    
    const stats = {
      totalThemes: allThemes.length,
      activeTheme: activeTheme?.displayName || 'Hiçbiri',
      customizations: 0, // Placeholder for future customization tracking
      lastUpdated: activeTheme?.updatedAt || new Date().toISOString(),
      categories: {
        casino: allThemes.filter(t => t.category === 'casino').length,
        luxury: allThemes.filter(t => t.category === 'luxury').length,
        neon: allThemes.filter(t => t.category === 'neon').length,
        minimal: allThemes.filter(t => t.category === 'minimal').length,
        classic: allThemes.filter(t => t.category === 'classic').length,
        modern: allThemes.filter(t => t.category === 'modern').length,
      }
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Stats fetch error:', error);
    res.status(500).json({ error: 'İstatistikler alınamadı' });
  }
});

export default router;