import fs from 'fs';

// Pragmatic Play eksikliğini tespit et ve API'den çek
async function pragmaticDiscovery() {
  try {
    console.log('🔍 Pragmatic Play analizi başlatılıyor...');
    
    // Önce cache formatını kontrol et
    let cacheData;
    try {
      const rawData = fs.readFileSync('.slotegrator-cache.json', 'utf8');
      cacheData = JSON.parse(rawData);
      console.log('📊 Cache format:', typeof cacheData);
      console.log('📊 Cache length:', Array.isArray(cacheData) ? cacheData.length : 'Not array');
      
      if (cacheData.items) {
        console.log('📊 Items found:', cacheData.items.length);
        cacheData = cacheData.items;
      }
    } catch (e) {
      console.log('❌ Cache dosyası okunamadı:', e.message);
      return;
    }
    
    if (!Array.isArray(cacheData)) {
      console.log('❌ Cache array formatında değil');
      return;
    }
    
    // Pragmatic Play arama
    const pragmaticGames = cacheData.filter((game: any) => {
      const provider = game.provider?.toLowerCase() || '';
      return provider.includes('pragmatic');
    });
    
    console.log('🎰 Pragmatic Play oyun sayısı:', pragmaticGames.length);
    
    if (pragmaticGames.length === 0) {
      console.log('❌ Cache\'de Pragmatic Play bulunamadı');
      
      // Tüm provider listesini göster
      const allProviders = [...new Set(cacheData.map((g: any) => g.provider))].sort();
      console.log('📝 Mevcut providerlar:', allProviders.length);
      
      // Pragmatic benzeri ara
      const pragmaticLike = allProviders.filter(p => 
        p?.toLowerCase().includes('pragmatic') || 
        p?.toLowerCase().includes('prag')
      );
      
      if (pragmaticLike.length > 0) {
        console.log('🔎 Pragmatic benzeri:', pragmaticLike);
      } else {
        console.log('❗ Hiç Pragmatic benzeri provider yok');
      }
      
      // API'den Pragmatic Play çekme önerisi
      console.log('💡 Çözüm: Doğrudan Slotegrator API\'sinden Pragmatic Play oyunları çekilmeli');
      
    } else {
      console.log('✅ Pragmatic Play oyunları bulundu:');
      pragmaticGames.slice(0, 5).forEach((game: any, index: number) => {
        console.log(`${index + 1}. ${game.name} (${game.provider})`);
      });
    }
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

pragmaticDiscovery();