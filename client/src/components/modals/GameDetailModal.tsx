import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useDeviceDetection } from '@/hooks/useDeviceDetection';
import { apiRequest } from '@/lib/queryClient';
import { 
  Play, 
  Star, 
  Users, 
  Trophy, 
  Gamepad2, 
  Smartphone, 
  Monitor,
  Tablet,
  ExternalLink,
  X,
  Info,
  Zap,
  Shield,
  Crown,
  Heart,
  TrendingUp,
  Clock,
  Globe,
  Coins
} from 'lucide-react';

interface GameDetailModalProps {
  game: any;
  isOpen: boolean;
  onClose: () => void;
}

const GameDetailModal: React.FC<GameDetailModalProps> = ({ game, isOpen, onClose }) => {
  const { language } = useLanguage();
  const { user, isAuthenticated } = useUser();
  const deviceInfo = useDeviceDetection();
  const [gameMode] = useState<'real'>('real');
  const [showGame, setShowGame] = useState(false);
  const [gameUrl, setGameUrl] = useState<string>('');
  const [isFavorite, setIsFavorite] = useState(false);

  // Tam çeviri metinleri
  const translations = {
    tr: {
      playNow: 'Şimdi Oyna',

      realMode: 'Gerçek Para',
      gameDetails: 'Oyun Detayları',
      provider: 'Sağlayıcı',
      category: 'Kategori',
      rating: 'Puan',
      players: 'Oyuncu',
      jackpot: 'Jackpot',
      deviceSupport: 'Cihaz Desteği',
      features: 'Özellikler',
      aboutGame: 'Oyun Hakkında',
      howToPlay: 'Nasıl Oynanır',
      addToFavorites: 'Favorilere Ekle',
      removeFromFavorites: 'Favorilerden Çıkar',
      fullscreen: 'Tam Ekran',
      close: 'Kapat',

      comingSoon: 'Çok Yakında',
      loading: 'Yükleniyor...',
      gameStarting: 'Oyun Başlatılıyor...',
      online: 'çevrimiçi',
      desktop: 'Masaüstü',
      mobile: 'Mobil',
      tablet: 'Tablet',
      security: 'Güvenlik',
      fairPlay: 'Adil Oyun',
      sslEncrypted: 'SSL Şifreli',
      licensedGame: 'Lisanslı Oyun',
      fairPlayGuarantee: 'Adil Oyun Garantisi',
      recentWinners: 'Son Kazananlar',
      rtp: 'Geri Dönüş Oranı',
      volatility: 'Volatilite',
      minBet: 'Min. Bahis',
      maxBet: 'Max. Bahis',
      medium: 'Orta',
      supported: 'Desteklenir',
      premium: 'Premium',
      premiumProvider: 'Premium Sağlayıcı',
      popular: 'Popüler',
      gameMode: 'Oyun Modu',
      active: 'Aktif',
      soon: 'Yakında',
      deviceAutoDetected: 'Cihaz otomatik algılandı',
      preparing: 'hazırlanıyor',
      secureConnection: 'Güvenli Bağlantı',
      encrypted: 'Şifreli',

    },
    en: {
      playNow: 'Play Now',

      realMode: 'Real Money',
      gameDetails: 'Game Details',
      provider: 'Provider',
      category: 'Category',
      rating: 'Rating',
      players: 'Players',
      jackpot: 'Jackpot',
      deviceSupport: 'Device Support',
      features: 'Features',
      aboutGame: 'About Game',
      howToPlay: 'How to Play',
      addToFavorites: 'Add to Favorites',
      removeFromFavorites: 'Remove from Favorites',
      fullscreen: 'Fullscreen',
      close: 'Close',

      comingSoon: 'Coming Soon',
      loading: 'Loading...',
      gameStarting: 'Starting Game...',
      online: 'online',
      desktop: 'Desktop',
      mobile: 'Mobile',
      tablet: 'Tablet',
      security: 'Security',
      fairPlay: 'Fair Play',
      sslEncrypted: 'SSL Encrypted',
      licensedGame: 'Licensed Game',
      fairPlayGuarantee: 'Fair Play Guarantee',
      recentWinners: 'Recent Winners',
      rtp: 'Return to Player',
      volatility: 'Volatility',
      minBet: 'Min. Bet',
      maxBet: 'Max. Bet',
      medium: 'Medium',
      supported: 'Supported',
      premium: 'Premium',
      premiumProvider: 'Premium Provider',
      popular: 'Popular',
      gameMode: 'Game Mode',
      active: 'Active',
      soon: 'Soon',
      deviceAutoDetected: 'Device auto-detected',
      preparing: 'preparing',
      secureConnection: 'Secure Connection',
      encrypted: 'Encrypted',

    },
    ka: {
      playNow: 'ახლა ითამაშე',

      realMode: 'ნამდვილი ფული',
      gameDetails: 'თამაშის დეტალები',
      provider: 'მომწოდებელი',
      category: 'კატეგორია',
      rating: 'რეიტინგი',
      players: 'მოთამაშეები',
      jackpot: 'ჯეკპოტი',
      deviceSupport: 'მოწყობილობის მხარდაჭერა',
      features: 'ფუნქციები',
      aboutGame: 'თამაშის შესახებ',
      howToPlay: 'როგორ ვითამაშოთ',
      addToFavorites: 'ფავორიტებში დამატება',
      removeFromFavorites: 'ფავორიტებიდან ამოშლა',
      fullscreen: 'სრული ეკრანი',
      close: 'დახურვა',

      comingSoon: 'მალე იქნება',
      loading: 'იტვირთება...',
      gameStarting: 'თამაში იწყება...',
      online: 'ონლაინ',
      desktop: 'დესკტოპი',
      mobile: 'მობილური',
      tablet: 'ტაბლეტი',
      security: 'უსაფრთხოება',
      fairPlay: 'სამართლიანი თამაში',
      sslEncrypted: 'SSL დაშიფრული',
      licensedGame: 'ლიცენზირებული თამაში',
      fairPlayGuarantee: 'სამართლიანი თამაშის გარანტია',
      recentWinners: 'ბოლო გამარჯვებულები',
      rtp: 'დაბრუნების მაჩვენებელი',
      volatility: 'ცვალებადობა',
      minBet: 'მინ. ბეტი',
      maxBet: 'მაქს. ბეტი',
      medium: 'საშუალო',
      supported: 'მხარდაჭერილი',
      premium: 'პრემიუმი',
      premiumProvider: 'პრემიუმ მომწოდებელი',
      popular: 'პოპულარული',
      gameMode: 'თამაშის რეჟიმი',
      active: 'აქტიური',
      soon: 'მალე',
      deviceAutoDetected: 'მოწყობილობა ავტომატურად აღმოჩენილი',
      preparing: 'მზადდება',
      secureConnection: 'უსაფრთხო კავშირი',
      encrypted: 'დაშიფრული',

    }
  };

  const tr = translations[language] || translations.tr;

  // Oyun başlatma mutation
  const initGameMutation = useMutation({
    mutationFn: async (params: any) => {
      const token = localStorage.getItem('token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch('/api/slotegrator/game-url', {
        method: 'POST',
        headers,
        body: JSON.stringify(params)
      });
      
      if (!response.ok) {
        throw new Error('Oyun başlatılamadı');
      }
      
      const data = await response.json();
      if (!data.success || !data.url) {
        throw new Error(data.message || 'Oyun URL\'si alınamadı');
      }
      
      return data;
    },
    onSuccess: (data) => {
      setGameUrl(data.url);
      setShowGame(true);
    },
    onError: (error: any) => {
      console.error('Oyun başlatma hatası:', error);
      
      const errorData = error.response?.data || {};
      
      if (errorData.error === 'api_unavailable') {
        // Show user-friendly message about API availability
        alert(errorData.message + '\n\n' + errorData.retry_message);
        
        alert('Oyun başlatılamadı. Lütfen giriş yapın ve tekrar deneyin.');
      } else if (errorData.message?.includes('www.cryptonbets1.com') || errorData.message?.includes('Production deployment')) {
        alert('Oyunlar sadece www.cryptonbets1.com domain üzerinden çalışır.\n\nProduction deployment sonrasında tüm oyunlar aktif olacaktır.');
      } else if (errorData.needsWhitelisting) {
        alert('Oyunlar www.cryptonbets1.com deployment sonrasında çalışacaktır.');
      } else if (errorData.needsProductionCredentials) {
        alert('Gerçek para oyunları için production deployment gerekli.');
      } else {
        alert(error.message || errorData.message || 'Oyun başlatılamadı - Production deployment gerekli');
      }
    }
  });

  const handlePlayGame = () => {
    if (!game?.uuid) return;

    // Gerçek para modu için giriş kontrolü
    if (!isAuthenticated) {
      alert('Gerçek para ile oynamak için giriş yapmalısınız.');
      return;
    }

    // Gerçek para oyunu endpoint'ini kullan
    const endpoint = isAuthenticated 
      ? '/api/slotegrator/games/lobby' 
      : '/api/slotegrator/game-url';

    const token = localStorage.getItem('token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // API çağrısını direkt burada yapıyoruz
    fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        game_uuid: game.uuid,
        uuid: game.uuid, // Backward compatibility
        mode: gameMode,
        device: deviceInfo.deviceCategory || 'desktop',
        language: language,
        currency: 'TRY'
      })
    })
    .then(response => response.json())
    .then(data => {
      console.log('Game response received:', data);
      
      if (data.success && data.url) {
        // Tüm oyunları modal içinde iframe'de aç
        console.log('Loading game in modal iframe:', data.url);
        setGameUrl(data.url);
        setShowGame(true);
      } else {
        throw new Error(data.message || 'Oyun başlatılamadı');
      }
    })
    .catch(error => {
      console.error('Oyun başlatma hatası:', error);
      
      // Handle authentication errors
      if (error.message?.includes('authentication required')) {
        alert('Gerçek para oyunları için giriş yapmalısınız.');
      } else {
        alert('Oyun başlatılamadı. Lütfen giriş yapın ve tekrar deneyin.');
      }
    });
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // TODO: API çağrısı ile favorilere ekleme/çıkarma
  };

  // Modal açılıp kapandığında state'leri temizle
  React.useEffect(() => {
    if (isOpen) {
      // Modal açıldığında state'leri reset et
      setShowGame(false);
      setGameUrl('');
      setIsFavorite(false);
    } else {
      // Modal kapandığında state'leri temizle
      setShowGame(false);
      setGameUrl('');
      setIsFavorite(false);
    }
  }, [isOpen]);

  // Modal kapandığında state'leri temizleyen fonksiyon
  const handleClose = () => {
    setShowGame(false);
    setGameUrl('');
    setIsFavorite(false);
    onClose();
  };

  // Oyun istatistikleri
  const gameStats = {
    rating: 4.8,
    players: 1247,
    jackpot: '₺85,420',
    category: 'Video Slots',
    features: ['Free Spins', 'Wild Symbols', 'Bonus Round', 'Multipliers'],
    rtp: '96.5%',
    volatility: tr.medium,
    minBet: '₺0.20',
    maxBet: '₺500'
  };

  if (!game) return null;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className={`${showGame ? 'max-w-[95vw] md:max-w-6xl h-[90vh] [&>button]:hidden' : 'max-w-[95vw] md:max-w-4xl max-h-[90vh]'} w-full p-0 overflow-y-auto bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 transition-all duration-300`}>
        {!showGame && (
          <DialogHeader>
            <DialogTitle className="sr-only">{game?.name || 'Game Details'}</DialogTitle>
            <DialogDescription className="sr-only">
              View game details and start playing
            </DialogDescription>
          </DialogHeader>
        )}
        {!showGame ? (
          // Sade oyun detay görünümü
          <div className="flex flex-col h-full">
            {/* Basit Header */}
            <div className="relative p-4 border-b border-gray-200 dark:border-gray-800">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white pr-10">{game.name}</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{game.provider || tr.premiumProvider}</p>
            </div>

            {/* Ana İçerik */}
            <div className="flex-1 overflow-y-auto p-3 md:p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                {/* Sol: Oyun Görseli */}
                <div className="space-y-3 md:space-y-4">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                    <img
                      src={game.imageUrl || game.image || '/api/placeholder/400/300'}
                      alt={game.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Alternatif görsel kaynakları
                        const target = e.target as HTMLImageElement;
                        if (target.src.includes('/api/placeholder')) return;
                        
                        if (game.images && game.images.length > 0) {
                          target.src = game.images[0].url;
                        } else {
                          target.src = '/api/placeholder/400/300';
                        }
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={toggleFavorite}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white text-red-500 rounded-full p-2"
                    >
                      <Heart className={`h-4 w-4 ${isFavorite ? 'fill-current' : ''}`} />
                    </Button>
                  </div>

                  {/* Oyun Bilgileri */}
                  <div className="grid grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{tr.provider}:</span>
                      <p className="font-medium text-gray-900 dark:text-white truncate">{game.provider || tr.premium}</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{tr.rtp}:</span>
                      <p className="font-medium text-green-600 dark:text-green-400">96.5%</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{tr.minBet}:</span>
                      <p className="font-medium text-gray-900 dark:text-white">₺0.20</p>
                    </div>
                    <div>
                      <span className="text-gray-500 dark:text-gray-400">{tr.maxBet}:</span>
                      <p className="font-medium text-gray-900 dark:text-white">₺500</p>
                    </div>
                  </div>
                </div>

                {/* Sağ: Oyun Kontrolleri */}
                <div className="space-y-4 md:space-y-6">
                  {/* Oyun Modu */}
                  <div>
                    <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-3">{tr.gameDetails}</h3>
                    


                    <Button
                      onClick={handlePlayGame}
                      disabled={initGameMutation.isPending}
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white font-bold py-2 md:py-3 text-sm md:text-lg"
                    >
                      {initGameMutation.isPending ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          {tr.gameStarting}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Play className="h-5 w-5 mr-2" />
                          {tr.playNow}
                        </div>
                      )}
                    </Button>
                  </div>

                  {/* Özellikler */}
                  <div>
                    <h4 className="text-sm md:text-base font-medium text-gray-900 dark:text-white mb-2">{tr.features}</h4>
                    <div className="flex flex-wrap gap-1 md:gap-2">
                      {gameStats.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Cihaz Desteği */}
                  <div>
                    <h4 className="text-sm md:text-base font-medium text-gray-900 dark:text-white mb-2">{tr.deviceSupport}</h4>
                    <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-center">
                        <Monitor className="h-3 w-3 md:h-4 md:w-4 mr-1 text-green-500" />
                        {tr.desktop}
                      </div>
                      <div className="flex items-center">
                        <Tablet className="h-3 w-3 md:h-4 md:w-4 mr-1 text-green-500" />
                        {tr.tablet}
                      </div>
                      <div className="flex items-center">
                        <Smartphone className="h-3 w-3 md:h-4 md:w-4 mr-1 text-green-500" />
                        {tr.mobile}
                      </div>
                    </div>
                  </div>

                  {/* Cihaz Algılama Bilgisi */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 md:p-3">
                    <div className="flex items-center text-xs md:text-sm text-blue-700 dark:text-blue-300">
                      <Info className="h-3 w-3 md:h-4 md:w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{tr.deviceAutoDetected}: <strong className="ml-1">{deviceInfo.deviceCategory === 'mobile' ? tr.mobile : (deviceInfo.deviceCategory === 'tablet' ? tr.tablet : tr.desktop)}</strong></span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Profesyonel oyun görünümü
          <div className="flex flex-col h-full bg-gray-900">
            {/* Oyun Header Bar */}
            <div className="bg-gradient-to-r from-gray-800 to-gray-700 px-4 py-3 flex items-center justify-between border-b border-gray-600">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Gamepad2 className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold text-sm">{game.name}</h3>
                  <p className="text-gray-300 text-xs">
                    Gerçek Para
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const iframe = document.querySelector('iframe');
                    if (iframe && iframe.requestFullscreen) {
                      iframe.requestFullscreen();
                    }
                  }}
                  className="text-gray-300 hover:text-white hover:bg-gray-600 px-3 py-1.5 text-xs"
                >
                  <ExternalLink className="h-3 w-3 mr-1.5" />
                  {tr.fullscreen}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClose}
                  className="text-gray-300 hover:text-white hover:bg-gray-600 px-3 py-1.5 text-xs"
                >
                  <X className="h-3 w-3 mr-1.5" />
                  {tr.close}
                </Button>
              </div>
            </div>

            {/* Oyun İçeriği */}
            <div className="flex-1 relative bg-black">
              {gameUrl ? (
                <>
                  <iframe
                    key={`game-${game.uuid || game.id}-${gameUrl}`}
                    src={gameUrl}
                    className="w-full h-full border-0"
                    title={game.name}
                    allow="autoplay; fullscreen; payment; microphone; camera; encrypted-media; gyroscope; accelerometer"
                    sandbox="allow-same-origin allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-presentation allow-downloads"
                    style={{
                      background: '#000000',
                      minHeight: '600px',
                      border: 'none',
                      outline: 'none'
                    }}
                    onLoad={() => {
                      console.log('Oyun iframe yüklendi');
                      const iframe = document.querySelector('iframe');
                      if (iframe) {
                        setTimeout(() => {
                          try {
                            if (iframe.contentDocument) {
                              const playSelectors = [
                                '.sound-loader',
                                '.play-icon',
                                '.play-button',
                                '.start-button',
                                '.game-start',
                                '.btn-play',
                                '[class*="play"]',
                                '[class*="start"]',
                                'button[onclick*="start"]',
                                'button[onclick*="play"]',
                                'div[onclick*="start"]',
                                'div[onclick*="play"]'
                              ];
                              
                              let playButton: HTMLElement | null = null;
                              for (const selector of playSelectors) {
                                const element = iframe.contentDocument.querySelector(selector) as HTMLElement;
                                if (element && element.offsetParent !== null) {
                                  playButton = element;
                                  console.log('Play butonu bulundu:', selector);
                                  break;
                                }
                              }
                              
                              if (playButton) {
                                console.log('Otomatik oyun başlatılıyor...');
                                playButton.click();
                                
                                // Play butonunu gizle
                                playButton.style.display = 'none';
                                playButton.style.visibility = 'hidden';
                                playButton.style.opacity = '0';
                              }
                              
                              // CSS ile tüm overlay elementlerini gizle
                              const style = iframe.contentDocument.createElement('style');
                              style.textContent = `
                                .sound-loader, .play-icon, .game-overlay, .loading-overlay,
                                .play-button, .start-button, .game-start, .btn-play {
                                  display: none !important;
                                  visibility: hidden !important;
                                  opacity: 0 !important;
                                  pointer-events: none !important;
                                }
                                [class*="play"], [class*="start"], [class*="overlay"], [class*="loader"] {
                                  display: none !important;
                                }
                              `;
                              iframe.contentDocument.head.appendChild(style);
                            }
                          } catch (e) {
                            console.log('Cross-origin iframe detected');
                            iframe.contentWindow?.postMessage({ 
                              action: 'autostart',
                              type: 'game_command',
                              command: 'start'
                            }, '*');
                          }
                        }, 1500);
                        
                        // Daha uzun süre bekleyip tekrar dene
                        setTimeout(() => {
                          try {
                            if (iframe.contentDocument) {
                              const allElements = iframe.contentDocument.querySelectorAll('*');
                              allElements.forEach(el => {
                                if (el.textContent && 
                                    (el.textContent.toLowerCase().includes('play') || 
                                     el.textContent.toLowerCase().includes('start') ||
                                     el.textContent.toLowerCase().includes('başla'))) {
                                  if (el.offsetParent !== null) {
                                    console.log('Text-based play button found, clicking...');
                                    (el as HTMLElement).click();
                                    (el as HTMLElement).style.display = 'none';
                                  }
                                }
                              });
                            }
                          } catch (e) {
                            // Cross-origin error
                          }
                        }, 5000);
                      }
                    }}
                  />
                  
                  {/* Oyun durum çubuğu */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center justify-between text-white text-xs">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center">
                          <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                          <span>{tr.online}</span>
                        </div>
                        <div className="flex items-center">
                          <Shield className="h-3 w-3 mr-1 text-green-400" />
                          <span>{tr.security}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-300">
                        <span>Bakiye: {user?.balance || 0} TRY</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Yükleniyor ekranı
                <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-900 to-black">
                  <div className="text-center">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 border-4 border-yellow-500/30 rounded-full"></div>
                      <div className="absolute top-0 left-0 w-20 h-20 border-4 border-yellow-500 rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <h3 className="text-white text-lg font-semibold mb-2">{tr.gameStarting}</h3>
                    <p className="text-gray-400 text-sm">{game.name} {tr.preparing}...</p>
                    <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
                      <div className="flex items-center">
                        <Shield className="h-3 w-3 mr-1" />
                        <span>{tr.secureConnection}</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center">
                        <Globe className="h-3 w-3 mr-1" />
                        <span>SSL {tr.encrypted}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default GameDetailModal;