import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Oyun türleri için enum
export enum GameType {
  ALL = 'all',
  SLOTS = 'slots',
  MEGAWAYS = 'megaways',
  BONUS_BUY = 'bonus_buy',
  JACKPOT = 'jackpot',
  CLUSTER_PAYS = 'cluster_pays',
  HIGH_VOLATILITY = 'high_volatility',
  FRUIT_SLOTS = 'fruit_slots',
  ANIMAL_THEMED = 'animal_themed',
  TABLE = 'table',
  ROULETTE = 'roulette',
  BLACKJACK = 'blackjack',
  BACCARAT = 'baccarat',
  BINGO = 'bingo',
  LOTTERY = 'lottery',
  POKER = 'poker',
  SCRATCH = 'scratch card',
  OTHER = 'other'
}

// Oyun türleri için icon/emoji mapping
const gameTypeIcons: Record<GameType, string> = {
  [GameType.ALL]: '🎮',
  [GameType.SLOTS]: '🎰',
  [GameType.MEGAWAYS]: '🔄',
  [GameType.BONUS_BUY]: '💰',
  [GameType.JACKPOT]: '💎',
  [GameType.CLUSTER_PAYS]: '🍇',
  [GameType.HIGH_VOLATILITY]: '🌋',
  [GameType.FRUIT_SLOTS]: '🍉',
  [GameType.ANIMAL_THEMED]: '🦁',
  [GameType.TABLE]: '🎲',
  [GameType.ROULETTE]: '⚫',
  [GameType.BLACKJACK]: '🃏',
  [GameType.BACCARAT]: '🎴',
  [GameType.BINGO]: '🎯',
  [GameType.LOTTERY]: '🎫',
  [GameType.POKER]: '♠️',
  [GameType.SCRATCH]: '🎟️',
  [GameType.OTHER]: '🎭'
};

// Slotegrator API oyun türlerini frontend enum tipine çeviren yardımcı fonksiyon
export function mapApiTypeToGameType(apiType: string): GameType {
  const { t, language } = useLanguage();
  const typeMap: Record<string, GameType> = {
    'slots': GameType.SLOTS,
    'table': GameType.TABLE,
    'roulette': GameType.ROULETTE,
    'blackjack': GameType.BLACKJACK,
    'baccarat': GameType.BACCARAT,
    'bingo': GameType.BINGO,
    'lottery': GameType.LOTTERY,
    'poker': GameType.POKER,
    'scratch card': GameType.SCRATCH,
    'fruits': GameType.FRUIT_SLOTS,
    'animals': GameType.ANIMAL_THEMED,
    // API'den gelen diğer türler için mapping eklenebilir
  };

  return typeMap[apiType] || GameType.OTHER;
}

export interface GameTypeFilterProps {
  selectedType: GameType;
  onTypeSelect: (type: GameType) => void;
  availableTypes?: GameType[];
  showIcons?: boolean;
  className?: string;
  vertical?: boolean;
}

/**
 * Oyun türleri için filtreleme bileşeni
 */
const GameTypeFilter: React.FC<GameTypeFilterProps> = ({
  selectedType,
  onTypeSelect,
  availableTypes = Object.values(GameType),
  showIcons = true,
  className = '',
  vertical = false
}) => {
  const { translate } = useLanguage();

  // Dikey düzen için stil sınıfları
  const containerClasses = vertical 
    ? `${className} flex flex-col space-y-2` 
    : `${className} flex flex-wrap gap-2`;

  // Dikey veya yatay düzende buton stilleri
  const buttonClasses = (type: GameType) => {
    const baseClasses = "transition-colors flex items-center gap-1.5 rounded-lg";
    const sizeClasses = vertical ? "px-3 py-1.5 text-sm w-full justify-between" : "px-4 py-2 text-sm";
    const colorClasses = selectedType === type 
      ? 'bg-yellow-600 text-white' 
      : 'bg-gray-800 text-gray-300 hover:bg-gray-700';
    
    return `${baseClasses} ${sizeClasses} ${colorClasses}`;
  };

  return (
    <div className={containerClasses}>
      {availableTypes.map((type) => (
        <button
          key={type}
          className={buttonClasses(type)}
          onClick={() => onTypeSelect(type)}
        >
          <div className="flex items-center gap-1.5">
            {showIcons && <span className="text-base">{gameTypeIcons[type]}</span>}
            <span>{t(`gameType.${type}`)}</span>
          </div>
          
          {vertical && selectedType === type && (
            <span className="text-xs bg-yellow-500 text-black px-1.5 py-0.5 rounded-full">
              ✓
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default GameTypeFilter;