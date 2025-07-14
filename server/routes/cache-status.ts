import { Router } from 'express';
import fs from 'fs';
import path from 'path';

const router = Router();

// Cache durumu endpoint'i
router.get('/cache-status', (req, res) => {
  try {
    const cacheFile = path.join(process.cwd(), '.slotegrator-cache.json');
    const statusFile = path.join(process.cwd(), 'cache-status.json');
    
    let cacheData = null;
    let statusData = null;
    
    // Cache dosyasını oku
    if (fs.existsSync(cacheFile)) {
      try {
        cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf8'));
      } catch (error) {
        console.error('Cache dosyası okunamadı:', error);
      }
    }
    
    // Status dosyasını oku
    if (fs.existsSync(statusFile)) {
      try {
        statusData = JSON.parse(fs.readFileSync(statusFile, 'utf8'));
      } catch (error) {
        console.error('Status dosyası okunamadı:', error);
      }
    }
    
    const response = {
      cache: cacheData ? {
        totalGames: cacheData.games?.length || 0,
        totalProviders: cacheData.providers?.length || 0,
        slotGames: cacheData.games?.filter((g: any) => g.type === 'slots').length || 0,
        lastUpdate: cacheData.timestamp ? new Date(cacheData.timestamp).toISOString() : null,
        providers: cacheData.providers || [],
        topProviders: cacheData.providers ? 
          cacheData.providers.map((provider: string) => ({
            name: provider,
            gameCount: cacheData.games?.filter((g: any) => g.provider === provider).length || 0
          })).sort((a: any, b: any) => b.gameCount - a.gameCount).slice(0, 10) : []
      } : null,
      
      status: statusData || { status: 'unknown' },
      
      progress: cacheData ? {
        current: cacheData.games?.length || 0,
        target: 10000,
        percentage: Math.min(100, Math.round(((cacheData.games?.length || 0) / 10000) * 100))
      } : null,
      
      timestamp: new Date().toISOString()
    };
    
    res.json(response);
    
  } catch (error) {
    console.error('Cache status endpoint hatası:', error);
    res.status(500).json({ error: 'Cache durumu alınamadı' });
  }
});

export default router;