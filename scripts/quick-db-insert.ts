import { db } from './server/db';
import { slotegratorGames } from './shared/schema';
import * as fs from 'fs';

async function quickDatabaseInsert() {
  try {
    // Cache dosyasından oyun verilerini oku
    const cacheFile = '.slotegrator-cache.json';
    
    if (!fs.existsSync(cacheFile)) {
      console.log('Cache dosyası bulunamadı. Cache sistemi çalışırken bekleyin...');
      return;
    }
    
    const cacheData = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    const games = cacheData.games || [];
    
    if (games.length === 0) {
      console.log('Cache dosyasında oyun bulunamadı.');
      return;
    }
    
    console.log(`${games.length} oyun database'e ekleniyor...`);
    
    // Mevcut verileri temizle
    await db.delete(slotegratorGames);
    
    // Batch insert - 100'er oyun ekle
    const batchSize = 100;
    let inserted = 0;
    
    for (let i = 0; i < games.length; i += batchSize) {
      const batch = games.slice(i, i + batchSize);
      
      const formattedGames = batch.map((game: any) => ({
        uuid: game.uuid || game.id,
        name: game.name || 'Unknown Game',
        image: game.image || '',
        type: game.type || 'slot',
        provider: game.provider || 'Unknown',
        category: game.category || 'slot',
        tags: game.tags ? JSON.stringify(game.tags) : null,
        rtp: game.rtp ? parseFloat(game.rtp.toString()) : null,
        maxWin: game.maxWin ? parseInt(game.maxWin.toString()) : null,
        minBet: game.minBet ? parseFloat(game.minBet.toString()) : null,
        maxBet: game.maxBet ? parseFloat(game.maxBet.toString()) : null,
        volatility: game.volatility || null,
        popularity: game.popularity ? parseInt(game.popularity.toString()) : null,
        hasFreespins: game.hasFreespins || false,
        hasBonusGame: game.hasBonusGame || false,
        isNew: game.isNew || false,
        isPopular: game.isPopular || false,
        isMobile: game.isMobile !== false,
        isDesktop: game.isDesktop !== false,
        demoUrl: game.demoUrl || null,
        realUrl: game.realUrl || null,
        lastUpdated: new Date()
      }));
      
      await db.insert(slotegratorGames).values(formattedGames);
      inserted += formattedGames.length;
      
      console.log(`${inserted}/${games.length} oyun eklendi (${Math.round(inserted/games.length*100)}%)`);
    }
    
    console.log(`✅ Toplam ${inserted} oyun başarıyla database'e eklendi!`);
    
    // Doğrulama sorgusu
    const count = await db.select().from(slotegratorGames);
    console.log(`🎮 Database'de toplam ${count.length} oyun mevcut`);
    
  } catch (error) {
    console.error('Database ekleme hatası:', error);
  }
}

quickDatabaseInsert();