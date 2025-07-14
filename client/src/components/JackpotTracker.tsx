import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Crown, Trophy, Zap, Star } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface JackpotInfo {
  gameUuid: string;
  type: 'mini' | 'minor' | 'major' | 'grand';
  amount: number;
  currency: string;
  lastWinner?: {
    username: string;
    winAmount: number;
    timestamp: string;
  };
}

const JackpotTracker = () => {
  const { language } = useLanguage();
  const [animatingJackpots, setAnimatingJackpots] = useState<Set<string>>(new Set());

  const { data: jackpots } = useQuery({
    queryKey: ['/api/game-sessions/jackpots'],
    refetchInterval: 5000, // Her 5 saniyede güncelle
  });

  const t = (key: string, fallback: string) => {
    const translations: Record<string, Record<string, string>> = {
      tr: {
        'jackpots.title': 'Aktif Jackpotlar',
        'jackpots.subtitle': 'Büyük kazançlar seni bekliyor!',
        'jackpots.mini': t('game.mini', 'Mini'),
        'jackpots.minor': 'Küçük',
        'jackpots.major': 'Büyük',
        'jackpots.grand': t('game.mega', 'Mega'),
        'jackpots.lastWinner': 'Son Kazanan',
        'jackpots.contribution': 'Her bahisten %1 katkı',
        'jackpots.live': 'Canlı güncelleniyor'
      },
      en: {
        'jackpots.title': 'Active Jackpots',
        'jackpots.subtitle': 'Big wins are waiting for you!',
        'jackpots.mini': t('game.mini', 'Mini'),
        'jackpots.minor': 'Minor',
        'jackpots.major': 'Major',
        'jackpots.grand': 'Grand',
        'jackpots.lastWinner': 'Last Winner',
        'jackpots.contribution': '1% contribution from each bet',
        'jackpots.live': 'Live updating'
      },
      ka: {
        'jackpots.title': 'აქტიური ჯექპოტები',
        'jackpots.subtitle': 'დიდი მოგება გელოდებათ!',
        'jackpots.mini': 'მინი',
        'jackpots.minor': 'მცირე',
        'jackpots.major': 'დიდი',
        'jackpots.grand': 'გრანდი',
        'jackpots.lastWinner': 'ბოლო გამარჯვებული',
        'jackpots.contribution': 'ყოველი ფსონიდან 1%',
        'jackpots.live': 'ცოცხალი განახლება'
      }
    };
    return translations[language]?.[key] || fallback;
  };

  const getJackpotIcon = (type: string) => {
    switch (type) {
      case 'grand': return <Crown className="w-6 h-6 text-yellow-500" />;
      case 'major': return <Trophy className="w-6 h-6 text-orange-500" />;
      case 'minor': return <Zap className="w-6 h-6 text-blue-500" />;
      case 'mini': return <Star className="w-6 h-6 text-green-500" />;
      default: return <Star className="w-6 h-6" />;
    }
  };

  const getJackpotColor = (type: string) => {
    switch (type) {
      case 'grand': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      case 'major': return 'bg-gradient-to-r from-orange-500 to-red-500';
      case 'minor': return 'bg-gradient-to-r from-blue-500 to-purple-500';
      case 'mini': return 'bg-gradient-to-r from-green-500 to-teal-500';
      default: return 'bg-gradient-to-r from-gray-500 to-gray-600';
    }
  };

  const formatAmount = (amount: number, currency: string = 'TRY') => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Jackpot güncelleme animasyonu
  useEffect(() => {
    if (jackpots && Array.isArray(jackpots)) {
      jackpots.forEach((jackpot: JackpotInfo) => {
        setAnimatingJackpots(prev => new Set(prev).add(jackpot.gameUuid));
        setTimeout(() => {
          setAnimatingJackpots(prev => {
            const newSet = new Set(prev);
            newSet.delete(jackpot.gameUuid);
            return newSet;
          });
        }, 1000);
      });
    }
  }, [jackpots]);

  if (!jackpots || !Array.isArray(jackpots) || jackpots.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg text-gray-400">{t('jackpots.loading', 'Jackpotlar yükleniyor...')}</h3>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          {t('jackpots.title', 'Aktif Jackpotlar')}
        </h2>
        <p className="text-gray-400">
          {t('jackpots.subtitle', 'Büyük kazançlar seni bekliyor!')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {jackpots.jackpots.map((jackpot: JackpotInfo) => (
          <Card 
            key={jackpot.gameUuid} 
            className={`bg-gray-800 border-gray-700 transition-all duration-500 ${
              animatingJackpots.has(jackpot.gameUuid) ? 'scale-105 shadow-lg' : ''
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {getJackpotIcon(jackpot.type)}
                  <CardTitle className="text-white capitalize text-lg">
                    {t(`jackpots.${jackpot.type}`, jackpot.type)}
                  </CardTitle>
                </div>
                <Badge 
                  className={`${getJackpotColor(jackpot.type)} text-white border-0`}
                  variant="secondary"
                >
                  {jackpot.type.toUpperCase()}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className={`text-center p-3 rounded-lg ${getJackpotColor(jackpot.type)}`}>
                  <div className={`text-2xl font-bold text-white ${
                    animatingJackpots.has(jackpot.gameUuid) ? 'animate-pulse' : ''
                  }`}>
                    {formatAmount(jackpot.amount, jackpot.currency)}
                  </div>
                </div>

                {jackpot.lastWinner && (
                  <div className="text-sm text-gray-400 border-t border-gray-600 pt-2">
                    <p className="text-center">
                      {t('jackpots.lastWinner', 'Son Kazanan')}
                    </p>
                    <p className="text-center font-semibold text-green-400">
                      {jackpot.lastWinner.username}
                    </p>
                    <p className="text-center text-xs">
                      {formatAmount(jackpot.lastWinner.winAmount, jackpot.currency)}
                    </p>
                  </div>
                )}

                <div className="text-xs text-center text-gray-500">
                  {t('jackpots.contribution', 'Her bahisten %1 katkı')}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Jackpot Kazanma Bildirimi */}
      <div className="text-center text-sm text-yellow-400 animate-pulse">
        ⚡ {t('jackpots.live', 'Canlı güncelleniyor')} ⚡
      </div>
    </div>
  );
};

export default JackpotTracker;