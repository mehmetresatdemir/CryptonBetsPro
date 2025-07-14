import * as slotegratorService from './server/services/slotegrator.js';

console.log('Cache yenileme başlatılıyor...');

slotegratorService.refreshCache(true)
  .then(() => {
    console.log('Cache yenileme tamamlandı');
    process.exit(0);
  })
  .catch(error => {
    console.error('Cache yenileme hatası:', error);
    process.exit(1);
  });