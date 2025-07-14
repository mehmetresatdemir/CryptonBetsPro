import fs from 'fs';
import crypto from 'crypto';

const API_URL = 'https://gis.slotegrator.com/api/index.php/v1';
const MERCHANT_ID = (process.env.SLOTEGRATOR_MERCHANT_ID || '').replace(/['"]/g, '');
const MERCHANT_KEY = (process.env.SLOTEGRATOR_MERCHANT_KEY || '').replace(/['"]/g, '');

function generateSignature(requestPath: string, requestParams: Record<string, any> = {}): { signature: string; headers: Record<string, string> } {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomBytes(16).toString('hex');
  
  const headers = {
    'X-Merchant-Id': MERCHANT_ID,
    'X-Timestamp': timestamp,
    'X-Nonce': nonce
  };
  
  const mergedParams = { ...requestParams, ...headers };
  const sortedKeys = Object.keys(mergedParams).sort();
  const queryString = sortedKeys
    .map(key => `${key}=${encodeURIComponent(String(mergedParams[key as keyof typeof mergedParams]))}`)
    .join('&');
  
  const signature = crypto.createHmac('sha1', MERCHANT_KEY)
    .update(queryString)
    .digest('hex');
  
  return {
    signature,
    headers: {
      ...headers,
      'X-Signature': signature,
      'Content-Type': 'application/json'
    }
  };
}

async function fetchRealPragmaticPlay() {
  try {
    console.log('🔍 Gerçek Slotegrator API\'sinden Pragmatic Play oyunları çekiliyor...');
    
    if (!MERCHANT_ID || !MERCHANT_KEY) {
      console.log('❌ Slotegrator API bilgileri eksik');
      return;
    }

    // Provider listesi çek
    const providersPath = '/merchants/providers';
    const providersParams = {};
    const providersAuth = generateSignature(providersPath, providersParams);

    console.log('📡 Provider listesi çekiliyor...');
    const providersResponse = await fetch(`${API_URL}${providersPath}`, {
      method: 'GET',
      headers: providersAuth.headers
    });

    if (!providersResponse.ok) {
      console.log('❌ Provider API hatası:', providersResponse.status);
      return;
    }

    const providersData = await providersResponse.json();
    console.log('📊 Provider yanıtı alındı');

    // Pragmatic Play provider'ını bul
    const pragmaticProvider = providersData.providers?.find((p: any) => 
      p.name?.toLowerCase().includes('pragmatic') || 
      p.title?.toLowerCase().includes('pragmatic')
    );

    if (!pragmaticProvider) {
      console.log('❌ Pragmatic Play provider bulunamadı');
      console.log('Mevcut providerlar:', providersData.providers?.map((p: any) => p.name || p.title).slice(0, 10));
      return;
    }

    console.log(`✅ Pragmatic Play provider bulundu: ${pragmaticProvider.name || pragmaticProvider.title} (ID: ${pragmaticProvider.id})`);

    // Pragmatic Play oyunlarını çek
    const gamesPath = '/merchants/games';
    const gamesParams = {
      provider: pragmaticProvider.id,
      limit: 500
    };
    const gamesAuth = generateSignature(gamesPath, gamesParams);

    console.log('🎮 Pragmatic Play oyunları çekiliyor...');
    const gamesResponse = await fetch(`${API_URL}${gamesPath}?${new URLSearchParams(gamesParams)}`, {
      method: 'GET',
      headers: gamesAuth.headers
    });

    if (!gamesResponse.ok) {
      console.log('❌ Games API hatası:', gamesResponse.status);
      return;
    }

    const gamesData = await gamesResponse.json();
    console.log(`📊 ${gamesData.games?.length || 0} Pragmatic Play oyunu alındı`);

    if (!gamesData.games || gamesData.games.length === 0) {
      console.log('❌ Pragmatic Play oyunu bulunamadı');
      return;
    }

    // Mevcut cache'i yükle
    const cacheData = JSON.parse(fs.readFileSync('.slotegrator-cache.json', 'utf8'));
    const originalCount = cacheData.games.length;

    // Gerçek Pragmatic Play oyunlarını formatla ve ekle
    const pragmaticGames = gamesData.games.map((game: any) => ({
      uuid: game.uuid || game.id,
      name: game.name || game.title,
      image: game.image || `https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/${game.uuid}.png`,
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
      features: [],
      payout: {
        min: game.min_bet || 0.01,
        max: game.max_bet || 100
      },
      lines: {
        min_lines: 1,
        max_lines: game.lines || 25
      },
      tags: ["pragmatic", "popular"],
      volatility: game.volatility || "medium",
      rtp: game.rtp || 96,
      created_at: new Date().toISOString()
    }));

    // Cache'e ekle
    cacheData.games = [...cacheData.games, ...pragmaticGames];
    
    fs.writeFileSync('.slotegrator-cache.json', JSON.stringify(cacheData, null, 2));

    const newCount = cacheData.games.length;
    console.log(`✅ ${pragmaticGames.length} gerçek Pragmatic Play oyunu cache'e eklendi`);
    console.log(`📊 Toplam oyun sayısı: ${originalCount} → ${newCount}`);

    // Eklenen oyunları listele
    console.log('\n📋 Eklenen gerçek Pragmatic Play oyunları:');
    pragmaticGames.slice(0, 10).forEach((game: any, index: number) => {
      console.log(`${index + 1}. ${game.name} (${game.uuid})`);
    });

    if (pragmaticGames.length > 10) {
      console.log(`... ve ${pragmaticGames.length - 10} oyun daha`);
    }

  } catch (error) {
    console.error('❌ Hata:', error.message);
    console.log('🔄 API bağlantı sorunu olabilir, lütfen daha sonra tekrar deneyin');
  }
}

fetchRealPragmaticPlay();