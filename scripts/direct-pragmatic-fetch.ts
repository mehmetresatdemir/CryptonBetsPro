import fs from 'fs';
import crypto from 'crypto';

const MERCHANT_ID = process.env.SLOTEGRATOR_MERCHANT_ID || '';
const MERCHANT_KEY = process.env.SLOTEGRATOR_MERCHANT_KEY || '';
const BASE_URL = 'https://api.slotegrator.com/api/index.php/v1';

function generateSignature(params: Record<string, any>): string {
  const sortedKeys = Object.keys(params).sort();
  const queryString = sortedKeys.map(key => `${key}=${params[key]}`).join('&');
  return crypto.createHmac('sha1', MERCHANT_KEY).update(queryString).digest('hex');
}

async function makeSlotegratorRequest(endpoint: string, params: Record<string, any> = {}) {
  const requestParams = {
    ...params,
    'X-Merchant-Id': MERCHANT_ID,
    'X-Timestamp': Math.floor(Date.now() / 1000).toString(),
    'X-Nonce': crypto.randomBytes(16).toString('hex')
  };
  
  const signature = generateSignature(requestParams);
  requestParams['X-Signature'] = signature;
  
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestParams)
  });
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }
  
  return response.json();
}

async function directPragmaticFetch() {
  try {
    console.log('🔍 Slotegrator API\'sinden Pragmatic Play oyunları çekiliyor...');
    
    // Provider listesi çek
    console.log('📡 Provider listesi alınıyor...');
    const providersData = await makeSlotegratorRequest('/merchants/providers');
    
    if (!providersData.providers) {
      console.log('❌ Provider listesi alınamadı');
      return;
    }
    
    console.log(`📊 ${providersData.providers.length} provider bulundu`);
    
    // Pragmatic Play provider'ını bul
    const pragmaticProvider = providersData.providers.find((provider: any) => 
      provider.name?.toLowerCase().includes('pragmatic') ||
      provider.title?.toLowerCase().includes('pragmatic') ||
      provider.id === 'pragmatic_play' ||
      provider.id === 'pragmaticplay'
    );
    
    if (!pragmaticProvider) {
      console.log('❌ Pragmatic Play provider bulunamadı');
      console.log('Mevcut providerlar:');
      providersData.providers.slice(0, 20).forEach((p: any, i: number) => {
        console.log(`${i + 1}. ${p.name || p.title} (${p.id})`);
      });
      return;
    }
    
    console.log(`✅ Pragmatic Play provider bulundu: ${pragmaticProvider.name || pragmaticProvider.title} (ID: ${pragmaticProvider.id})`);
    
    // Pragmatic Play oyunlarını çek
    console.log('🎮 Pragmatic Play oyunları çekiliyor...');
    const gamesData = await makeSlotegratorRequest('/merchants/games', {
      provider: pragmaticProvider.id,
      limit: 500
    });
    
    if (!gamesData.items || gamesData.items.length === 0) {
      console.log('❌ Pragmatic Play oyunu bulunamadı');
      return;
    }
    
    console.log(`📊 ${gamesData.items.length} Pragmatic Play oyunu alındı`);
    
    // Mevcut cache'i yükle
    const cacheData = JSON.parse(fs.readFileSync('.slotegrator-cache.json', 'utf8'));
    const originalCount = cacheData.games.length;
    
    // Gerçek Pragmatic Play oyunlarını formatla
    const pragmaticGames = gamesData.items.map((game: any) => ({
      uuid: game.uuid,
      name: game.name,
      image: game.image || `https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/${game.uuid}.png`,
      type: "slot",
      provider: "Pragmatic Play",
      technology: game.technology || "HTML5",
      has_lobby: game.has_lobby || 0,
      is_mobile: game.is_mobile || 1,
      devices: {
        desktop: true,
        mobile: true,
        tablet: true
      },
      features: game.features || [],
      payout: {
        min: game.parameters?.min_bet || 0.01,
        max: game.parameters?.max_bet || 100
      },
      lines: {
        min_lines: 1,
        max_lines: game.parameters?.lines_count || 25
      },
      tags: game.tags || ["pragmatic", "slot"],
      volatility: game.parameters?.volatility || "medium",
      rtp: game.parameters?.rtp || 96,
      created_at: new Date().toISOString()
    }));
    
    // Mevcut Pragmatic Play oyunlarını kontrol et
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
    newPragmaticGames.slice(0, 20).forEach((game: any, index: number) => {
      console.log(`${index + 1}. ${game.name} (${game.uuid})`);
    });
    
    if (newPragmaticGames.length > 20) {
      console.log(`... ve ${newPragmaticGames.length - 20} oyun daha`);
    }
    
  } catch (error) {
    console.error('❌ API Hatası:', error.message);
    console.log('🔄 Bağlantı sorunları için lütfen daha sonra tekrar deneyin');
  }
}

directPragmaticFetch();