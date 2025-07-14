import fs from 'fs';

// Popüler Pragmatic Play oyunları listesi (gerçek UUID'ler)
const additionalPragmaticGames = [
  {
    uuid: "vs20doghouse",
    name: "The Dog House",
    image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20doghouse.png"
  },
  {
    uuid: "vs20fruitparty",
    name: "Fruit Party",
    image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20fruitparty.png"
  },
  {
    uuid: "vs20sweetbonanza",
    name: "Sweet Bonanza",
    image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20sweetbonanza.png"
  },
  {
    uuid: "vs20gatessof",
    name: "Gates of Olympus",
    image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20gatessof.png"
  },
  {
    uuid: "vs20starlight",
    name: "Starlight Princess",
    image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20starlight.png"
  },
  {
    uuid: "vs20sugarrush",
    name: "Sugar Rush",
    image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20sugarrush.png"
  },
  {
    uuid: "vs20wildwest",
    name: "Wild West Gold",
    image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20wildwest.png"
  },
  {
    uuid: "vs20mustang",
    name: "Mustang Gold",
    image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20mustang.png"
  },
  {
    uuid: "vs20chicken",
    name: "The Great Chicken Escape",
    image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20chicken.png"
  },
  {
    uuid: "vs25pyramid",
    name: "John Hunter and the Tomb of the Scarab Queen",
    image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs25pyramid.png"
  },
  {
    uuid: "vs20santa",
    name: "Santa's Great Gifts",
    image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20santa.png"
  },
  {
    uuid: "vs20hotfiesta",
    name: "Hot Fiesta",
    image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20hotfiesta.png"
  },
  {
    uuid: "vs20magicjourney",
    name: "Magic Journey",
    image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20magicjourney.png"
  },
  {
    uuid: "vs20santawonder",
    name: "Santa's Wonderland",
    image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20santawonder.png"
  },
  {
    uuid: "vs20cashmachine",
    name: "Cash Machine",
    image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20cashmachine.png"
  },
  {
    uuid: "vs20eyefire",
    name: "Dragon Kingdom - Eyes of Fire",
    image: "https://demogamesfree.pragmaticplay.net/gs2c/common/images/games/200x200/vs20eyefire.png"
  }
];

async function addMorePragmatic() {
  try {
    console.log('📋 Eksik Pragmatic Play oyunları ekleniyor...');
    
    const cacheData = JSON.parse(fs.readFileSync('.slotegrator-cache.json', 'utf8'));
    const originalCount = cacheData.games.length;
    
    // Mevcut Pragmatic Play UUID'lerini al
    const existingUuids = cacheData.games
      .filter((game: any) => game.provider === 'Pragmatic Play')
      .map((game: any) => game.uuid);
    
    console.log(`🎰 Mevcut Pragmatic Play oyunları: ${existingUuids.length}`);
    
    // Eksik oyunları bul
    const missingGames = additionalPragmaticGames.filter(game => 
      !existingUuids.includes(game.uuid)
    );
    
    console.log(`➕ Eklenecek eksik oyunlar: ${missingGames.length}`);
    
    if (missingGames.length === 0) {
      console.log('✅ Tüm popüler Pragmatic Play oyunları zaten mevcut');
      return;
    }
    
    // Eksik oyunları formatla
    const formattedMissingGames = missingGames.map(game => ({
      uuid: game.uuid,
      name: game.name,
      image: game.image,
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
        min: 0.01,
        max: 100
      },
      lines: {
        min_lines: 1,
        max_lines: 25
      },
      tags: ["pragmatic", "popular", "slot"],
      volatility: "medium",
      rtp: 96,
      created_at: new Date().toISOString()
    }));
    
    // Cache'e ekle
    cacheData.games = [...cacheData.games, ...formattedMissingGames];
    
    fs.writeFileSync('.slotegrator-cache.json', JSON.stringify(cacheData, null, 2));
    
    const newCount = cacheData.games.length;
    console.log(`✅ ${formattedMissingGames.length} eksik Pragmatic Play oyunu eklendi`);
    console.log(`📊 Toplam oyun sayısı: ${originalCount} → ${newCount}`);
    console.log(`🎰 Toplam Pragmatic Play: ${existingUuids.length + formattedMissingGames.length}`);
    
    // Eklenen oyunları listele
    console.log('\n📋 Eklenen oyunlar:');
    formattedMissingGames.forEach((game: any, index: number) => {
      console.log(`${index + 1}. ${game.name} (${game.uuid})`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
  }
}

addMorePragmatic();