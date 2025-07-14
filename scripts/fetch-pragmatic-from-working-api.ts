import fs from 'fs';
import { SlotegratorService } from './server/services/slotegrator';

async function fetchPragmaticFromWorkingAPI() {
  try {
    console.log('🔍 Çalışan Slotegrator servisinden Pragmatic Play oyunları çekiliyor...');
    
    const slotegratorService = new SlotegratorService();
    
    // Önce tüm providerları al
    console.log('📡 Provider listesi alınıyor...');
    const providers = await slotegratorService.getAllProviders();
    
    console.log(`📊 Toplam ${providers.length} provider bulundu`);
    
    // Pragmatic Play provider'ını bul
    const pragmaticProvider = providers.find((provider: any) => 
      provider.name?.toLowerCase().includes('pragmatic') ||
      provider.title?.toLowerCase().includes('pragmatic') ||
      provider.id === 'pragmatic_play' ||
      provider.id === 'pragmaticplay'
    );
    
    if (!pragmaticProvider) {
      console.log('❌ Pragmatic Play provider bulunamadı');
      console.log('Mevcut providerlar:');
      providers.slice(0, 20).forEach((p: any, i: number) => {
        console.log(`${i + 1}. ${p.name || p.title} (${p.id})`);
      });
      return;
    }
    
    console.log(`✅ Pragmatic Play provider bulundu: ${pragmaticProvider.name || pragmaticProvider.title} (ID: ${pragmaticProvider.id})`);
    
    // Pragmatic Play oyunlarını al
    console.log('🎮 Pragmatic Play oyunları çekiliyor...');
    const games = await slotegratorService.getGamesByProvider(pragmaticProvider.id);
    
    console.log(`📊 ${games.length} Pragmatic Play oyunu alındı`);
    
    if (games.length === 0) {
      console.log('❌ Pragmatic Play oyunu bulunamadı');
      return;
    }
    
    // Mevcut cache'i yükle
    const cacheData = JSON.parse(fs.readFileSync('.slotegrator-cache.json', 'utf8'));
    const originalCount = cacheData.games.length;
    
    console.log(`📊 Mevcut cache: ${originalCount} oyun`);
    
    // Gerçek Pragmatic Play oyunlarını formatla
    const pragmaticGames = games.map((game: any) => ({
      uuid: game.uuid || game.id,
      name: game.name || game.title,
      image: game.image || game.banner || `https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/${game.uuid || game.id}.png`,
      type: "slot",
      provider: "Pragmatic Play",
      technology: "HTML5",
      has_lobby: 0,
      is_mobile: 1,
      devices: {
        desktop: true,
        mobile: true,
        tablet: true
      },
      features: game.features || [],
      payout: {
        min: game.min_bet || 0.01,
        max: game.max_bet || 100
      },
      lines: {
        min_lines: 1,
        max_lines: game.lines || 25
      },
      tags: ["pragmatic", "popular", "slot"],
      volatility: game.volatility || "medium",
      rtp: game.rtp || 96,
      created_at: new Date().toISOString()
    }));
    
    // Mevcut Pragmatic Play oyunlarını kontrol et (çakışma olmasın)
    const existingPragmaticUuids = cacheData.games
      .filter((game: any) => game.provider === 'Pragmatic Play')
      .map((game: any) => game.uuid);
    
    // Sadece yeni oyunları ekle
    const newPragmaticGames = pragmaticGames.filter((game: any) => 
      !existingPragmaticUuids.includes(game.uuid)
    );
    
    console.log(`🔄 Mevcut Pragmatic Play oyunları: ${existingPragmaticUuids.length}`);
    console.log(`➕ Eklenecek yeni oyunlar: ${newPragmaticGames.length}`);
    
    if (newPragmaticGames.length === 0) {
      console.log('ℹ️ Tüm Pragmatic Play oyunları zaten mevcut');
      return;
    }
    
    // Cache'e ekle
    cacheData.games = [...cacheData.games, ...newPragmaticGames];
    
    fs.writeFileSync('.slotegrator-cache.json', JSON.stringify(cacheData, null, 2));
    
    const newCount = cacheData.games.length;
    console.log(`✅ ${newPragmaticGames.length} gerçek Pragmatic Play oyunu cache'e eklendi`);
    console.log(`📊 Toplam oyun sayısı: ${originalCount} → ${newCount}`);
    
    // Eklenen oyunları listele
    console.log('\n📋 Eklenen gerçek Pragmatic Play oyunları:');
    newPragmaticGames.slice(0, 15).forEach((game: any, index: number) => {
      console.log(`${index + 1}. ${game.name} (${game.uuid})`);
    });
    
    if (newPragmaticGames.length > 15) {
      console.log(`... ve ${newPragmaticGames.length - 15} oyun daha`);
    }
    
  } catch (error) {
    console.error('❌ Hata:', error.message);
  }
}

fetchPragmaticFromWorkingAPI();