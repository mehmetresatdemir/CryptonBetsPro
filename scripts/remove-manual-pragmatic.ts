import fs from 'fs';

async function removeManualPragmatic() {
  try {
    console.log('🗑️ Manuel eklenen Pragmatic Play oyunları kaldırılıyor...');
    
    const cacheData = JSON.parse(fs.readFileSync('.slotegrator-cache.json', 'utf8'));
    
    if (!cacheData.games || !Array.isArray(cacheData.games)) {
      console.log('❌ Geçersiz cache formatı');
      return;
    }
    
    const originalCount = cacheData.games.length;
    console.log(`📊 Mevcut toplam oyun: ${originalCount}`);
    
    // Manuel Pragmatic Play oyunları (uuid'leri bildiğim oyunlar)
    const manualPragmaticUuids = [
      'vs20doghouse',
      'vs20fruitparty', 
      'vs20sweetbonanza',
      'vs20gatessof',
      'vs20starlight',
      'vs20gatess1000',
      'vs20sugarrush',
      'vs20charmsclov',
      'vs20wildwest',
      'vs20eyefire',
      'vs20cashmachine',
      'vs20mustang',
      'vs20chicken',
      'vs25pyramid',
      'vs20santa',
      'vs20wildwest',
      'vs20chicken',
      'vs20hotfiesta',
      'vs20magicjourney',
      'vs20santawonder'
    ];
    
    // Manuel Pragmatic Play oyunlarını filtrele
    const filteredGames = cacheData.games.filter((game: any) => {
      if (game.provider === 'Pragmatic Play' && manualPragmaticUuids.includes(game.uuid)) {
        console.log(`🗑️ Kaldırılıyor: ${game.name} (${game.uuid})`);
        return false;
      }
      return true;
    });
    
    const removedCount = originalCount - filteredGames.length;
    console.log(`❌ Kaldırılan Pragmatic Play oyunları: ${removedCount}`);
    console.log(`✅ Korunan oyunlar: ${filteredGames.length}`);
    
    // Cache'i güncelle
    cacheData.games = filteredGames;
    fs.writeFileSync('.slotegrator-cache.json', JSON.stringify(cacheData, null, 2));
    
    console.log('✅ Manuel Pragmatic Play oyunları başarıyla kaldırıldı');
    console.log(`📊 Yeni toplam oyun sayısı: ${filteredGames.length}`);
    
    // Kalan Pragmatic Play oyunları var mı kontrol et
    const remainingPragmatic = filteredGames.filter((game: any) => game.provider === 'Pragmatic Play');
    console.log(`🎰 Kalan Pragmatic Play oyunları: ${remainingPragmatic.length}`);
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

removeManualPragmatic();