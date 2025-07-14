import { getMultiplePages } from './server/services/slotegrator';

async function simpleStepRebuild() {
  console.log('ADIM ADIM CACHE YENILEME - Sistematik Yaklasim');
  
  try {
    // Adim 1: Ilk 50 sayfa
    console.log('ADIM 1: Ilk 50 sayfa isleniyor...');
    const batch1 = await getMultiplePages(50, 50);
    console.log(`Batch 1 tamamlandi: ${batch1.length} oyun`);
    
    const pragmatic1 = batch1.filter(game => 
      game.provider.toLowerCase().includes('pragmatic')
    );
    
    if (pragmatic1.length > 0) {
      console.log(`PRAGMATIC PLAY BULUNDU: ${pragmatic1.length} oyun`);
      return;
    }
    
    console.log('Ilk 50 sayfada Pragmatic Play bulunamadi, devam ediliyor...');
    
    // Adim 2: Sayfa 51-100
    console.log('ADIM 2: Sayfa 51-100 isleniyor...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const batch2 = await getMultiplePages(100, 50);
    console.log(`Batch 2 tamamlandi: ${batch2.length} oyun`);
    
    const pragmatic2 = batch2.filter(game => 
      game.provider.toLowerCase().includes('pragmatic')
    );
    
    if (pragmatic2.length > 0) {
      console.log(`PRAGMATIC PLAY BULUNDU: ${pragmatic2.length} oyun`);
      return;
    }
    
    // Adim 3: Sayfa 101-150
    console.log('ADIM 3: Sayfa 101-150 isleniyor...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const batch3 = await getMultiplePages(150, 50);
    console.log(`Batch 3 tamamlandi: ${batch3.length} oyun`);
    
    const pragmatic3 = batch3.filter(game => 
      game.provider.toLowerCase().includes('pragmatic')
    );
    
    if (pragmatic3.length > 0) {
      console.log(`PRAGMATIC PLAY BULUNDU: ${pragmatic3.length} oyun`);
      return;
    }
    
    // Adim 4: Sayfa 151-200
    console.log('ADIM 4: Sayfa 151-200 isleniyor...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const batch4 = await getMultiplePages(200, 50);
    console.log(`Batch 4 tamamlandi: ${batch4.length} oyun`);
    
    const pragmatic4 = batch4.filter(game => 
      game.provider.toLowerCase().includes('pragmatic')
    );
    
    if (pragmatic4.length > 0) {
      console.log(`PRAGMATIC PLAY BULUNDU: ${pragmatic4.length} oyun`);
      return;
    }
    
    // Adim 5: Final batch
    console.log('ADIM 5: Final batch - Sayfa 201-300 isleniyor...');
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const batchFinal = await getMultiplePages(300, 50);
    console.log(`Final batch tamamlandi: ${batchFinal.length} oyun`);
    
    const pragmaticFinal = batchFinal.filter(game => 
      game.provider.toLowerCase().includes('pragmatic')
    );
    
    if (pragmaticFinal.length > 0) {
      console.log(`PRAGMATIC PLAY BULUNDU: ${pragmaticFinal.length} oyun`);
    } else {
      console.log('Tum sayfalar tarandi, Pragmatic Play bulunamadi');
    }
    
    console.log(`TOPLAM SONUC: ${batchFinal.length} oyun yuklendi`);
    
    const allProviders = [...new Set(batchFinal.map(game => game.provider))].sort();
    console.log(`Toplam saglayici sayisi: ${allProviders.length}`);
    
  } catch (error) {
    console.error('Adim adim rebuild hatasi:', error);
  }
}

simpleStepRebuild();