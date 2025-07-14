import fs from 'fs';

function completionNotifier() {
  const checkCompletion = () => {
    try {
      const cache = JSON.parse(fs.readFileSync('.slotegrator-cache.json', 'utf8'));
      
      // Major milestones
      if (cache.totalGames >= 10000) {
        console.log('\n🎉 HEDEF TAMAMLANDI!');
        console.log(`✅ ${cache.totalGames} oyun cache'lendi`);
        console.log(`✅ ${cache.totalProviders} sağlayıcı keşfedildi`);
        console.log(`✅ ${cache.pragmaticCount || 0} Pragmatic Play oyunu`);
        console.log('🚀 Platform tam kapsamlı olarak hazır!');
        return true;
      }
      
      if (cache.totalGames >= 5000) {
        console.log(`📊 İlerleme: ${cache.totalGames}/10,159 (${cache.progress}%)`);
        console.log('🚀 Platform tam operasyonel - 5000+ oyun');
      }
      
      if (cache.pragmaticCount > 0) {
        console.log(`🎯 Pragmatic Play keşfedildi: ${cache.pragmaticCount} oyun`);
      }
      
      return false;
      
    } catch (error) {
      console.log('Cache kontrol hatası');
      return false;
    }
  };
  
  // Initial check
  if (checkCompletion()) return;
  
  // Check every 2 minutes
  const interval = setInterval(() => {
    if (checkCompletion()) {
      clearInterval(interval);
    }
  }, 120000);
}

completionNotifier();