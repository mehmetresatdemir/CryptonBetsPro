import { getGames } from './server/services/slotegrator';
import fs from 'fs';

async function maximumThroughputExpansion() {
  console.log('⚡ MAXIMUM THROUGHPUT EXPANSION');
  
  while (true) {
    try {
      let cache = JSON.parse(fs.readFileSync('.slotegrator-cache.json', 'utf8'));
      let allGames = [...cache.games];
      const allProviders = new Set(cache.providers);
      let pragmaticCount = cache.pragmaticCount || 0;
      
      if (allGames.length >= 10000) {
        console.log('🎉 TARGET COMPLETE');
        break;
      }
      
      // Dynamic batch sizing based on current progress
      const currentPage = Math.floor(allGames.length / 50) + 1;
      const remaining = 10159 - allGames.length;
      const batchSize = Math.min(30, Math.max(10, Math.floor(remaining / 200)));
      const endPage = Math.min(currentPage + batchSize, 300);
      
      console.log(`PROCESSING BATCH ${currentPage}-${endPage} (${batchSize} pages)`);
      
      let batchProgress = {
        added: 0,
        providers: 0,
        pragmatic: 0,
        startTime: Date.now()
      };
      
      // Process pages with optimal timing
      for (let page = currentPage; page <= endPage; page++) {
        try {
          const result = await getGames(['tags', 'parameters', 'images'], page, 50);
          
          if (result?.items?.length > 0) {
            const newGames = result.items.filter(game => 
              !allGames.some(existing => existing.uuid === game.uuid)
            );

            if (newGames.length > 0) {
              newGames.forEach(game => {
                if (game.provider) {
                  const isNewProvider = !allProviders.has(game.provider);
                  if (isNewProvider) {
                    allProviders.add(game.provider);
                    batchProgress.providers++;
                  }
                  
                  if (game.provider.toLowerCase().includes('pragmatic')) {
                    pragmaticCount++;
                    batchProgress.pragmatic++;
                    console.log(`PRAGMATIC BREAKTHROUGH: ${game.name}`);
                  }
                }
              });

              allGames.push(...newGames);
              batchProgress.added += newGames.length;
              
              if (page % 5 === 0) {
                console.log(`P${page}: ${allGames.length} total games`);
              }
            }
          }

          // Optimized rate control
          await new Promise(resolve => setTimeout(resolve, 1350));

        } catch (error) {
          console.log(`P${page}: Retry in progress`);
          await new Promise(resolve => setTimeout(resolve, 2500));
        }
      }
      
      // Batch completion and save
      const elapsedTime = (Date.now() - batchProgress.startTime) / 1000;
      const rate = batchProgress.added / elapsedTime;
      const currentProgress = ((allGames.length / 10159) * 100).toFixed(1);
      
      const updatedCache = {
        games: allGames,
        totalGames: allGames.length,
        totalProviders: allProviders.size,
        providers: Array.from(allProviders).sort(),
        pragmaticCount,
        lastUpdate: new Date().toISOString(),
        progress: currentProgress,
        status: allGames.length >= 10000 ? "MAXIMUM_COMPLETE" :
                allGames.length >= 5000 ? "HIGH_PERFORMANCE" :
                batchProgress.pragmatic > 0 ? "PRAGMATIC_BREAKTHROUGH" : "MAXIMUM_EXPANSION",
        buildInfo: {
          maximumThroughputExpansion: true,
          lastBatch: `${currentPage}-${endPage}`,
          batchAdded: batchProgress.added,
          batchProviders: batchProgress.providers,
          batchPragmatic: batchProgress.pragmatic,
          batchRate: rate.toFixed(1),
          currentPage: endPage,
          remainingPages: 300 - endPage,
          estimatedHours: Math.round((300 - endPage) * 1.4 / 3600 * 100) / 100,
          timestamp: Date.now()
        }
      };
      
      fs.writeFileSync('.slotegrator-cache.json', JSON.stringify(updatedCache, null, 2));
      
      console.log(`BATCH COMPLETE: +${batchProgress.added} games, +${batchProgress.providers} providers`);
      console.log(`PROGRESS: ${allGames.length}/10,159 (${currentProgress}%) | Rate: ${rate.toFixed(1)} games/sec`);
      
      if (batchProgress.pragmatic > 0) {
        console.log(`PRAGMATIC SUCCESS: ${batchProgress.pragmatic} new games discovered`);
      }
      
      // Milestone alerts
      if (allGames.length >= 5000 && cache.totalGames < 5000) {
        console.log('MILESTONE: 5000+ games - Platform excellence achieved');
      }
      
      if (allGames.length >= 8000 && cache.totalGames < 8000) {
        console.log('MILESTONE: 8000+ games - Comprehensive coverage');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
    } catch (error) {
      console.error('Maximum throughput error:', error);
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
  }
}

maximumThroughputExpansion();