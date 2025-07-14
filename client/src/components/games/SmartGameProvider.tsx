import React, { useEffect, useState } from 'react';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { SlotegratorGame } from '@/types/slotegrator';
import { getDeviceCompatibleGames, getDeviceCompatibleProviders } from '@/services/advancedSlotegratorService';
import { useLanguage } from '@/contexts/LanguageContext';
import { GameType } from './GameTypeFilter';

// Global için tür deklarasyonu
declare global {
  interface Window {
    __DEBUG_GAMES__?: any;
  }
}

interface SmartGameProviderProps {
  children: (props: {
    games: SlotegratorGame[];
    providers: string[];
    selectedProvider: string | null;
    setSelectedProvider: (provider: string | null) => void;
    selectedGameType: GameType;
    setSelectedGameType: (type: GameType) => void;
    availableGameTypes: GameType[];
    isLoading: boolean;
    isError: boolean;
    currentPage: number;
    totalPages: number;
    goToPage: (page: number) => void;
  }) => React.ReactNode;
  initialProvider?: string | null;
  initialGameType?: GameType;
  gameType?: 'slot' | 'casino' | 'all';
  perPage?: number;
}

// Statik önbellekleme - tüm bileşenler arasında paylaşılacak
const staticGameCache: Record<string, {
  timestamp: number;
  games: SlotegratorGame[];
  providers: string[];
  totalPages: number;
}> = {};

// Önbellek süresi (60 dakika - ms cinsinden)
const CACHE_EXPIRY = 60 * 60 * 1000;

// LocalStorage'de önbellek anahtarı
const STORAGE_CACHE_KEY = 'cryptonbets_games_cache';

/**
 * Akıllı oyun sağlayıcı bileşeni
 * Bu bileşen, ekran boyutuna ve tarayıcı özelliklerine göre uygun oyunları getirir ve hızlı önbellekler.
 */
const SmartGameProvider: React.FC<SmartGameProviderProps> = ({
  children,
  initialProvider = null,
  initialGameType = GameType.ALL,
  gameType = 'all',
  perPage = 96
}) => {
  const { translate } = useLanguage();
  const { deviceType, isMobile, isTablet } = useDeviceDetection();
  
  const [games, setGames] = useState<SlotegratorGame[]>([]);
  const [providers, setProviders] = useState<string[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(initialProvider);
  const [selectedGameType, setSelectedGameType] = useState<GameType>(initialGameType);
  // Sayfa tipine göre uygun filtreleri belirle
  const getGameTypesByPageType = () => {
    if (gameType === 'slot') {
      return [
        GameType.ALL,
        GameType.MEGAWAYS, 
        GameType.BONUS_BUY,
        GameType.JACKPOT,
        GameType.CLUSTER_PAYS,
        GameType.HIGH_VOLATILITY
      ];
    } else if (gameType === 'casino') {
      return [
        GameType.ALL,
        GameType.TABLE,
        GameType.ROULETTE,
        GameType.BLACKJACK,
        GameType.BACCARAT,
        GameType.BINGO,
        GameType.LOTTERY,
        GameType.POKER
      ];
    } else {
      return [
        GameType.ALL,
        GameType.SLOTS,
        GameType.TABLE,
        GameType.ROULETTE,
        GameType.BLACKJACK,
        GameType.BACCARAT
      ];
    }
  };
  
  const [availableGameTypes, setAvailableGameTypes] = useState<GameType[]>(getGameTypesByPageType());
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cachedGames, setCachedGames] = useState<SlotegratorGame[]>([]);
  
  // Önbellek anahtarını oluştur - masaüstü ve mobil anahtarları ayrılmalı
  const getCacheKey = () => {
    // Sabit cihaz tipi kullan - her cihaz için farklı önbellekler oluştur
    return `gameData_${gameType}_${deviceType}_${perPage}`;
  };
  
  // LocalStorage'den veri yükleme fonksiyonu
  const loadFromLocalStorage = () => {
    try {
      const storedData = localStorage.getItem(STORAGE_CACHE_KEY);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (parsedData && parsedData[getCacheKey()] && 
            (Date.now() - parsedData[getCacheKey()].timestamp) < CACHE_EXPIRY) {
          console.log('Oyunlar LocalStorage\'den yüklendi!', parsedData[getCacheKey()].games.length);
          return parsedData[getCacheKey()];
        }
      }
    } catch (error) {
      console.warn('LocalStorage\'den yükleme hatası:', error);
    }
    return null;
  };
  
  // LocalStorage'e veri kaydetme fonksiyonu
  const saveToLocalStorage = (data: SlotegratorGame[], providersList: string[], pages: number) => {
    try {
      // Mevcut veriyi al
      const existingData = localStorage.getItem(STORAGE_CACHE_KEY);
      const storageData = existingData ? JSON.parse(existingData) : {};
      
      // Yeni veriyi ekle
      storageData[getCacheKey()] = {
        games: data,
        providers: providersList,
        totalPages: pages,
        timestamp: Date.now()
      };
      
      // LocalStorage'e kaydet
      localStorage.setItem(STORAGE_CACHE_KEY, JSON.stringify(storageData));
      console.log('Oyunlar LocalStorage\'e kaydedildi!', data.length);
    } catch (error) {
      console.warn('LocalStorage\'e kaydetme hatası:', error);
    }
  };
  
  // Sağlayıcıları yükle
  useEffect(() => {
    const loadProviders = async () => {
      try {
        const deviceProviders = await getDeviceCompatibleProviders();
        setProviders(deviceProviders);
      } catch (error) {
        console.error('Sağlayıcılar yüklenirken hata:', error);
        setProviders([]);
      }
    };
    
    loadProviders();
  }, [deviceType]);
  
  // Tüm oyunları yükle ve önbelleğe al
  useEffect(() => {
    const loadAllGames = async () => {
      setIsLoading(true);
      setIsError(false);
      
      const cacheKey = getCacheKey();
      
      try {
        // İlk önce localStorage'dan veri yüklemeyi dene
        const localData = loadFromLocalStorage();
        if (localData) {
          console.log(`Oyun verileri localStorage'den alındı! (${cacheKey})`);
          
          // LocalStorage'den veri al
          setCachedGames(localData.games);
          setProviders(localData.providers);
          setTotalPages(localData.totalPages);
          
          // Statik önbelleğe de aktar
          staticGameCache[cacheKey] = {
            games: localData.games,
            providers: localData.providers,
            totalPages: localData.totalPages,
            timestamp: localData.timestamp
          };
          
          setIsLoading(false);
          return;
        }
        
        // Sonra bellek önbellekten kontrol et
        if (staticGameCache[cacheKey] && 
            (Date.now() - staticGameCache[cacheKey].timestamp) < CACHE_EXPIRY) {
          console.log(`Oyun verileri bellek önbellekten alındı! (${cacheKey})`);
          
          // Önbellekten veri al
          setCachedGames(staticGameCache[cacheKey].games);
          setProviders(staticGameCache[cacheKey].providers);
          setTotalPages(staticGameCache[cacheKey].totalPages);
          
          setIsLoading(false);
          return;
        }
        
        // Uygun endpoint'i seç (slot, casino veya all)
        let endpoint = '/api/slotegrator/games';
        if (gameType === 'slot') {
          endpoint = '/api/slotegrator/games/slots?maxGames=true';
        } else if (gameType === 'casino') {
          endpoint = '/api/slotegrator/games/casino?maxGames=true';
        }
        
        console.log(`Oyunlar yükleniyor: ${endpoint}, cihaz: ${deviceType}`);
        const startTime = Date.now();
        
        // Sistem ile hızlı yanıt için daha büyük miktarda oyunu tek seferde iste
        const queryParams = new URLSearchParams({
          perPage: '10000', // Mümkün olan en fazla oyun sayısı
          page: '1',
          useCache: 'true', // Sunucu önbelleğini kullan
          getAllGames: 'true', // Tüm oyunları getir
          maxGames: 'true' // Maksimum oyun sayısını iste
        }).toString();
        
        console.log(`API isteği gönderiliyor: ${endpoint}?${queryParams}`);
        
        const response = await fetch(`${endpoint}?${queryParams}`);
        
        console.log(`API yanıtı alındı. Status: ${response.status}`);
        
        if (!response.ok) {
          console.error(`API yanıt hatası: ${response.status}`);
          throw new Error(`API yanıt hatası: ${response.status}`);
        }
        
        let responseData = await response.json();
        const endTime = Date.now();
        
        // API'den alınan veri formatını düzelt (sadece son çare)
        if (!responseData.items && Array.isArray(responseData)) {
          console.log('API array formatında yanıt verdi, items formatına dönüştürülüyor');
          responseData = { items: responseData };
        }
        
        console.log(`Oyunlar ${endTime - startTime}ms içinde yüklendi. Toplam: ${responseData.items?.length || 0} oyun.`);
        
        if (!responseData.items || responseData.items.length === 0) {
          console.warn('API yanıtı oyun verisi içermiyor veya boş dizi döndü.');
          throw new Error('API yanıtı oyun verisi içermiyor.');
        }
      
        // Veri içeriğini logla
        console.log('İlk oyun örneği:', responseData.items[0]);
        
        // Globals'a kaydet (hata ayıklama için)
        window.__DEBUG_GAMES__ = responseData.items;
        
        // Önbelleğe al
        setCachedGames(responseData.items);
        
        // Oyun sağlayıcılarını çıkar
        const uniqueProviders = Array.from(
          new Set(responseData.items.map((game: SlotegratorGame) => game.provider))
        ).filter(Boolean);
        
        // Sayfalama bilgilerini ayarla
        const totalItems = responseData.items.length;
        const calculatedTotalPages = Math.ceil(totalItems / perPage);
        
        // LocalStorage'e kaydet - kalıcı depolama için
        saveToLocalStorage(responseData.items, uniqueProviders as string[], calculatedTotalPages);
        
        // Değerleri bileşen state'ine ayarla
        setProviders(uniqueProviders as string[]);
        setTotalPages(calculatedTotalPages || 1);
        
        // Statik önbelleğe kaydet - diğer bileşenler için
        staticGameCache[cacheKey] = {
          timestamp: Date.now(),
          games: responseData.items,
          providers: uniqueProviders as string[],
          totalPages: calculatedTotalPages || 1
        };
        
        // Performans bilgilerini göster
        if (responseData._meta && responseData._meta.responseTime) {
          console.log(`Sunucu yanıt süresi: ${responseData._meta.responseTime}ms`);
        }
        
      } catch (error) {
        console.error('Oyunlar yüklenirken hata:', error);
        setIsError(true);
        setCachedGames([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAllGames();
  }, [deviceType, gameType, perPage]); // Sadece cihaz tipi, oyun tipi veya sayfa boyutu değiştiğinde yükle

  // Debug için mevcut durumu logla
  useEffect(() => {
    console.log('SmartGameProvider durumu:', {
      cachedGamesCount: cachedGames.length,
      currentGamesCount: games.length,
      selectedProvider,
      selectedGameType,
      currentPage,
      totalPages,
      deviceType
    });
  }, [cachedGames.length, games.length, selectedProvider, selectedGameType, currentPage, totalPages, deviceType]);

  // Oyunları filtrele ve sayfalama yap
  useEffect(() => {
    console.log('Filtreleme useEffect başladı. Önbellek durumu:', cachedGames.length > 0 ? 'Dolu' : 'Boş');
    
    // Üç saniye bekleyerek konsol açılıp kapanma sorununu çöz
    const timerId = setTimeout(() => {
      // İşlevi önbellek boşken çalıştırma
      if (cachedGames.length === 0) {
        console.log('Önbellek boş, filtreleme yapılmıyor');
        return;
      }
      
      setIsLoading(true);
      console.log('Filtreleme başladı. Önbellekteki oyun sayısı:', cachedGames.length);
      
      try {
        // Oyun tipine göre filtrele
        let filteredGames = cachedGames;
        
        if (selectedGameType !== GameType.ALL) {
          filteredGames = cachedGames.filter(game => {
            const gameTypes = game.tags?.map(tag => tag.code) || [];
            
            // Oyun tiplerini eşleştir
            switch (selectedGameType) {
              case GameType.SLOTS:
                return gameTypes.includes('slots');
              case GameType.TABLE:
                return gameTypes.includes('table');
              case GameType.ROULETTE:
                return gameTypes.includes('roulette');
              case GameType.BLACKJACK:
                return gameTypes.includes('blackjack');
              case GameType.BACCARAT:
                return gameTypes.includes('baccarat');
              case GameType.BINGO:
                return gameTypes.includes('bingo');
              case GameType.LOTTERY:
                return gameTypes.includes('lottery');
              case GameType.POKER:
                return gameTypes.includes('poker');
              case GameType.SCRATCH:
                return gameTypes.includes('scratch card');
              default:
                return true;
            }
          });
        }
        
        // Sağlayıcıya göre filtrele
        if (selectedProvider) {
          filteredGames = filteredGames.filter(game => game.provider === selectedProvider);
        }
        
        // Cihaz türüne göre filtrele
        if (deviceType === 'mobile') {
          // Mobil cihazlarda sadece mobil uyumlu oyunları göster
          filteredGames = filteredGames.filter(game => game.is_mobile === 1);
        } else if (deviceType === 'desktop') {
          // Masaüstü cihazlarda sadece masaüstü uyumlu oyunları göster (is_mobile === 0)
          filteredGames = filteredGames.filter(game => game.is_mobile === 0);
        }
        // Tablet için her iki tür oyunu da göster (filtre uygulanmaz)
        console.log(`Cihaz türü: ${deviceType}, Filtrelenen oyun sayısı: ${filteredGames.length}`);
        
        console.log('Filtreleme sonrası kalan oyunlar:', filteredGames.length);
        
        // Toplam sayfa sayısını hesapla
        const totalItems = filteredGames.length;
        const calculatedTotalPages = Math.ceil(totalItems / perPage);
        setTotalPages(calculatedTotalPages || 1);
        
        // Geçerli sayfa numarasını düzelt
        let validPage = currentPage;
        if (validPage > calculatedTotalPages) {
          validPage = 1;
          setCurrentPage(1);
        }
        
        // Sayfalama yap
        const start = (validPage - 1) * perPage;
        const end = start + perPage;
        const pagedGames = filteredGames.slice(start, end);
        
        console.log('Sayfalama sonrası görüntülenecek oyunlar:', pagedGames.length);
        
        // Sonuçları ayarla
        setGames(pagedGames);
      } catch (error) {
        console.error('Oyunlar filtrelenirken hata:', error);
        setGames([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms gecikme ile işlemleri gerçekleştir
    
    return () => clearTimeout(timerId);
  }, [cachedGames, selectedProvider, selectedGameType, currentPage, perPage, isMobile]);
  
  // Sayfa değiştirme fonksiyonu
  const goToPage = (page: number) => {
    if (page < 1) page = 1;
    if (page > totalPages) page = totalPages;
    setCurrentPage(page);
  };
  
  return (
    <>
      {children({
        games,
        providers,
        selectedProvider,
        setSelectedProvider,
        selectedGameType,
        setSelectedGameType,
        availableGameTypes,
        isLoading,
        isError,
        currentPage,
        totalPages,
        goToPage
      })}
    </>
  );
};

export default SmartGameProvider;