import React, { useState } from 'react';
import { X, Play, Star, Trophy, DollarSign, Smartphone, Monitor } from 'lucide-react';
import { SlotegratorGame } from '@/types/slotegrator';
import { useLanguage } from '@/contexts/LanguageContext';

interface GameModalProps {
  game: SlotegratorGame;
  isOpen: boolean;
  onClose: () => void;
}

const GameModal: React.FC<GameModalProps> = ({ game, isOpen, onClose }) => {
  const { t } = useLanguage();
  const [selectedMode, setSelectedMode] = useState<'demo' | 'real'>('demo');

  if (!isOpen) return null;

  const handlePlayGame = () => {
    // Game URL oluşturma mantığı burada olacak
    const gameUrl = `/game/${game.uuid}?mode=${selectedMode}`;
    window.open(gameUrl, '_blank');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/75 z-50 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="relative">
          <img 
            src={game.image || '/images/placeholder-casino.jpg'}
            alt={game.name}
            className="w-full h-48 object-cover rounded-t-xl"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent rounded-t-xl" />
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Game Title */}
          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="text-2xl font-bold text-white mb-2">{game.name}</h2>
            <div className="flex items-center space-x-4">
              <span className="bg-yellow-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                {game.provider}
              </span>
              {game.type?.toLowerCase().includes('live') && (
                <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  LIVE DEALER
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Game Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <Star className="w-6 h-6 text-yellow-500 mx-auto mb-2" />
              <div className="text-sm text-gray-400">RTP</div>
              <div className="text-lg font-bold text-white">
                {game.parameters?.rtp?.toFixed(1) || '96.0'}%
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <DollarSign className="w-6 h-6 text-green-500 mx-auto mb-2" />
              <div className="text-sm text-gray-400">{t('casino.min_bet')}</div>
              <div className="text-lg font-bold text-white">0.5₺</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <Trophy className="w-6 h-6 text-purple-500 mx-auto mb-2" />
              <div className="text-sm text-gray-400">{t('casino.max_bet')}</div>
              <div className="text-lg font-bold text-white">1000₺</div>
            </div>

            <div className="bg-gray-800 rounded-lg p-4 text-center">
              {game.is_mobile ? (
                <Smartphone className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              ) : (
                <Monitor className="w-6 h-6 text-blue-500 mx-auto mb-2" />
              )}
              <div className="text-sm text-gray-400">{t('casino.device')}</div>
              <div className="text-lg font-bold text-white">
                {game.is_mobile ? t('casino.mobile') : t('casino.desktop')}
              </div>
            </div>
          </div>

          {/* Game Mode Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-white mb-3">{t('casino.select_mode')}</h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setSelectedMode('demo')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMode === 'demo'
                    ? 'border-yellow-500 bg-yellow-500/10 text-yellow-400'
                    : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">{t('casino.demo_mode')}</div>
                  <div className="text-sm opacity-80">{t('casino.free_play')}</div>
                </div>
              </button>

              <button
                onClick={() => setSelectedMode('real')}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedMode === 'real'
                    ? 'border-green-500 bg-green-500/10 text-green-400'
                    : 'border-gray-600 bg-gray-800 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <div className="font-semibold">{t('casino.real_mode')}</div>
                  <div className="text-sm opacity-80">{t('casino.real_money')}</div>
                </div>
              </button>
            </div>
          </div>

          {/* Game Features */}
          {game.type && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">{t('casino.game_features')}</h3>
              <div className="flex flex-wrap gap-2">
                <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                  {game.type}
                </span>
                {game.has_tables && (
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                    {t('casino.table_game')}
                  </span>
                )}
                {game.technology && (
                  <span className="bg-gray-800 text-gray-300 px-3 py-1 rounded-full text-sm">
                    {game.technology.toUpperCase()}
                  </span>
                )}
                {game.is_mobile === 1 && (
                  <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                    {t('casino.mobile_compatible')}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Play Button */}
          <button
            onClick={handlePlayGame}
            className="w-full bg-gradient-to-r from-yellow-600 to-yellow-700 hover:from-yellow-700 hover:to-yellow-800 text-white font-bold py-4 px-6 rounded-lg transition-all duration-300 flex items-center justify-center space-x-2 text-lg"
          >
            <Play className="w-6 h-6 fill-current" />
            <span>
              {selectedMode === 'demo' 
                ? t('casino.play_demo') 
                : t('casino.play_real')
              }
            </span>
          </button>

          {/* Disclaimer */}
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg">
            <p className="text-xs text-gray-400 text-center">
              {selectedMode === 'real' 
                ? t('casino.real_money_warning')
                : t('casino.demo_mode_info')
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameModal;