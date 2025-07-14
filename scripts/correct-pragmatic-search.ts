import fs from 'fs';

async function correctPragmaticSearch() {
  try {
    console.log('🔧 Pragmatic Play oyunlarını öncelikli hale getiriyorum...');
    
    const cacheData = JSON.parse(fs.readFileSync('.slotegrator-cache.json', 'utf8'));
    
    if (!cacheData.games || !Array.isArray(cacheData.games)) {
      console.log('❌ Geçersiz cache formatı');
      return;
    }
    
    // Pragmatic Play oyunlarını ayır
    const pragmaticGames = cacheData.games.filter((game: any) => 
      game.provider === 'Pragmatic Play'
    );
    
    // Diğer oyunları ayır
    const otherGames = cacheData.games.filter((game: any) => 
      game.provider !== 'Pragmatic Play'
    );
    
    console.log(`🎰 Pragmatic Play oyunları: ${pragmaticGames.length}`);
    console.log(`🎮 Diğer oyunlar: ${otherGames.length}`);
    
    // Pragmatic Play oyunlarını başa al
    const reorderedGames = [...pragmaticGames, ...otherGames];
    
    // Cache'i güncelle
    cacheData.games = reorderedGames;
    
    fs.writeFileSync('.slotegrator-cache.json', JSON.stringify(cacheData, null, 2));
    
    console.log('✅ Pragmatic Play oyunları listenin başına taşındı');
    console.log(`📊 Toplam oyun sayısı: ${reorderedGames.length}`);
    
    // İlk 10 oyunu göster
    console.log('\n📋 İlk 10 oyun:');
    reorderedGames.slice(0, 10).forEach((game: any, index: number) => {
      console.log(`${index + 1}. ${game.name} (${game.provider})`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

correctPragmaticSearch();