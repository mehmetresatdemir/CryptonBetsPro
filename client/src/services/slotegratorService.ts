import axios from 'axios';
import { SlotegratorGame, SlotegratorGamesList } from '@/types/slotegrator';

// Slot oyunlarını getir (filtreleme özellikleriyle)
export async function getSlotGames(
  page: number = 1, 
  perPage: number = 50, 
  provider?: string, 
  isMobile?: boolean
): Promise<SlotegratorGamesList> {
  try {
    let url = `/api/slotegrator/games/slots?page=${page}&perPage=${perPage}`;
    
    // Parametreleri ekle
    if (provider) {
      url += `&provider=${encodeURIComponentranslate(provider)}`;
    }
    
    if (isMobile !== undefined) {
      url += `&mobile=${isMobile ? '1' : '0'}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Slot oyunları alınamadı:', error);
    throw new Error('Slot oyunları yüklenirken bir hata oluştu.');
  }
}

// Casino oyunlarını getir (filtreleme özellikleriyle)
export async function getCasinoGames(
  page: number = 1, 
  perPage: number = 50, 
  provider?: string, 
  isMobile?: boolean
): Promise<SlotegratorGamesList> {
  try {
    let url = `/api/slotegrator/games/casino?page=${page}&perPage=${perPage}`;
    
    // Parametreleri ekle
    if (provider) {
      url += `&provider=${encodeURIComponentranslate(provider)}`;
    }
    
    if (isMobile !== undefined) {
      url += `&mobile=${isMobile ? '1' : '0'}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Casino oyunları alınamadı:', error);
    throw new Error('Casino oyunları yüklenirken bir hata oluştu.');
  }
}

// Tüm oyunları getir (filtreleme özellikleriyle)
export async function getAllGames(
  page: number = 1, 
  perPage: number = 50, 
  provider?: string, 
  gameType?: string, 
  isMobile?: boolean
): Promise<SlotegratorGamesList> {
  try {
    let url = `/api/slotegrator/games?page=${page}&perPage=${perPage}`;
    
    // Parametreleri ekle
    if (provider) {
      url += `&provider=${encodeURIComponentranslate(provider)}`;
    }
    
    if (gameType) {
      url += `&type=${encodeURIComponentranslate(gameType)}`;
    }
    
    if (isMobile !== undefined) {
      url += `&mobile=${isMobile ? '1' : '0'}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Oyunlar alınamadı:', error);
    throw new Error('Oyunlar yüklenirken bir hata oluştu.');
  }
}

// Tüm sağlayıcıları getir
export async function getAllProviders(): Promise<string[]> {
  try {
    const response = await axios.get('/api/slotegrator/providers');
    return response.data;
  } catch (error) {
    console.error('Sağlayıcılar alınamadı:', error);
    throw new Error('Sağlayıcılar yüklenirken bir hata oluştu.');
  }
}

// Belirli bir sağlayıcının oyunlarını getir
export async function getGamesByProvider(provider: string, page: number = 1, perPage: number = 50, isMobile?: boolean): Promise<SlotegratorGamesList> {
  try {
    let url = `/api/slotegrator/games/provider/${encodeURIComponentranslate(provider)}?page=${page}&perPage=${perPage}`;
    
    if (isMobile !== undefined) {
      url += `&mobile=${isMobile ? '1' : '0'}`;
    }
    
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`${provider} sağlayıcısının oyunları alınamadı:`, error);
    throw new Error('Sağlayıcı oyunları yüklenirken bir hata oluştu.');
  }
}

// UUID ile belirli bir oyunun detaylarını getir
export async function getGameDetails(uuid: string): Promise<SlotegratorGame> {
  try {
    const response = await axios.get(`/api/slotegrator/games/${uuid}`);
    return response.data;
  } catch (error) {
    console.error('Oyun detayları alınamadı:', error);
    throw new Error('Oyun detayları yüklenirken bir hata oluştu.');
  }
}

// Mobil oyunları getirme helper fonksiyonu
export async function getMobileGames(page: number = 1, perPage: number = 50, gameType?: string): Promise<SlotegratorGamesList> {
  return getAllGames(page, perPage, undefined, gameType, true);
}

// Masaüstü oyunları getirme helper fonksiyonu
export async function getDesktopGames(page: number = 1, perPage: number = 50, gameType?: string): Promise<SlotegratorGamesList> {
  return getAllGames(page, perPage, undefined, gameType, false);
}

// Oyunu başlat (auth user required)
export async function initGame(uuid: string, platform: 'desktop' | 'mobile' = 'desktop'): Promise<{ url: string }> {
  try {
    const response = await axios.post('/api/slotegrator/games/init', { 
      uuid, 
      platform 
    });
    return response.data;
  } catch (error) {
    console.error('Oyun başlatılamadı:', error);
    throw new Error('Oyun başlatılırken bir hata oluştu.');
  }
}

// Oyun lobisini getir (auth user required)
export async function getGameLobby(uuid: string, platform: 'desktop' | 'mobile' = 'desktop'): Promise<{ url: string }> {
  try {
    const response = await axios.post('/api/slotegrator/games/lobby', { 
      uuid, 
      platform 
    });
    return response.data;
  } catch (error) {
    console.error('Oyun lobisi alınamadı:', error);
    throw new Error('Oyun lobisi yüklenirken bir hata oluştu.');
  }
}