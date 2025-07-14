import fs from 'fs';

// Pragmatic Play oyunlarını bul ve analiz et
async function findPragmaticPlay() {
  try {
    console.log('🔍 Cache dosyasından Pragmatic Play oyunları aranıyor...');
    
    const cacheData = JSON.parse(fs.readFileSync('.slotegrator-cache.json', 'utf8'));
    console.log('📊 Toplam cachedeki oyun sayısı:', cacheData.length);
    
    // Farklı Pragmatic varyasyonlarını ara
    const pragmaticVariations = [
      'Pragmatic Play',
      'PragmaticPlay', 
      'Pragmatic',
      'PRAGMATIC PLAY',
      'pragmatic play'
    ];
    
    const pragmaticGames = cacheData.filter((game: any) => 
      pragmaticVariations.some(variant => 
        game.provider?.toLowerCase().includes(variant.toLowerCase())
      )
    );
    
    console.log('🎰 Bulunan Pragmatic Play oyun sayısı:', pragmaticGames.length);
    
    if (pragmaticGames.length > 0) {
      console.log('📋 İlk 5 Pragmatic oyun:');
      pragmaticGames.slice(0, 5).forEach((game: any, index: number) => {
        console.log(`${index + 1}. ${game.name} (${game.provider}) - UUID: ${game.uuid}`);
      });
      
      console.log('🏷️ Farklı provider isimleri:');
      const uniqueProviders = [...new Set(pragmaticGames.map((g: any) => g.provider))];
      uniqueProviders.forEach(provider => console.log(`- ${provider}`));
    } else {
      console.log('❌ Cachede Pragmatic Play oyunu bulunamadı');
      
      // Tüm provider isimlerini listele
      console.log('📝 Cachedeki tüm providerlar:');
      const allProviders = [...new Set(cacheData.map((g: any) => g.provider))].sort();
      allProviders.forEach(provider => {
        if (provider?.toLowerCase().includes('pragmatic') || provider?.toLowerCase().includes('prag')) {
          console.log(`⚠️  PRAGMATIC BENZER: ${provider}`);
        }
      });
      
      // Pragmatic benzeri providerları ara
      const pragmaticLike = allProviders.filter(p => 
        p?.toLowerCase().includes('pragmatic') || 
        p?.toLowerCase().includes('prag')
      );
      
      if (pragmaticLike.length > 0) {
        console.log('🔎 Pragmatic benzeri providerlar bulundu:', pragmaticLike);
      }
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

findPragmaticPlay();