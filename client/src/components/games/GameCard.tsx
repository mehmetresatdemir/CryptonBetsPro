import React from 'react';
import { Link } from 'wouter';
import { SlotegratorGame } from '@/types/slotegrator';
import { translate } from '@/utils/i18n-fixed';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';

interface GameCardProps {
  game: SlotegratorGame;
  onClick?: () => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onClick }) => {
  
  // Oyun resmi için varsayılan URL
  const defaultImageUrl = 'https://via.placeholder.com/300x200?text=No+Image';
  
  // RTP ve volatilite için renkler
  const getRtpColor = (rtp?: number) => {
    if (!rtp) return 'text-gray-400';
    if (rtp >= 97) return 'text-green-500';
    if (rtp >= 95) return 'text-yellow-400';
    return 'text-red-400';
  };
  
  const getVolatilityColor = (volatility?: string) => {
    if (!volatility) return 'text-gray-400';
    if (volatility.includes('low')) return 'text-green-500';
    if (volatility.includes('medium')) return 'text-yellow-400';
    if (volatility.includes('high')) return 'text-red-400';
    return 'text-gray-400';
  };
  
  // Oyun görüntüsü
  const imageSrc = game.image || defaultImageUrl;
  
  return (
    <Card className="w-full bg-slate-900 border-0 rounded-lg overflow-hidden hover:shadow-lg hover:shadow-yellow-900/20 transition-all duration-300">
      <div className="relative aspect-[3/2] w-full overflow-hidden">
        <img 
          src={imageSrc} 
          alt={game.name} 
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
          onError={(e) => {
            // Resim yüklenemezse varsayılan resim göster
            (e.target as HTMLImageElement).src = defaultImageUrl;
          }}
        />

      </div>
      
      <CardContent className="p-4">
        <h3 className="font-bold text-lg text-white mb-2 truncate">{game.name}</h3>
        
        {game.type === 'slot' && game.parameters && (
          <div className="flex flex-col gap-1 text-xs mb-2">
            {game.parameters.rtp && (
              <div className="flex justify-between">
                <span className="text-gray-400">RTP:</span>
                <span className={getRtpColor(game.parameters.rtp)}>
                  {game.parameters.rtp}%
                </span>
              </div>
            )}
            
            {game.parameters.volatility && (
              <div className="flex justify-between">
                <span className="text-gray-400">{translate('games.volatility', 'Volatilite')}:</span>
                <span className={getVolatilityColor(game.parameters.volatility)}>
                  {game.parameters.volatility}
                </span>
              </div>
            )}
            
            {game.parameters.lines_count && (
              <div className="flex justify-between">
                <span className="text-gray-400">{translate('games.paylines', 'Ödeme Hatları')}:</span>
                <span className="text-gray-300">
                  {game.parameters.lines_count}
                </span>
              </div>
            )}
          </div>
        )}
        
        {game.type === 'casino' && (
          <div className="flex gap-2 mb-2">
            {game.has_lobby === 1 && (
              <div className="bg-blue-500/20 text-blue-400 text-xs px-2 py-1 rounded">
                {translate('games.has_lobby', 'Lobby Var')}
              </div>
            )}
            {game.has_tables === 1 && (
              <div className="bg-purple-500/20 text-purple-400 text-xs px-2 py-1 rounded">
                {translate('games.live_tables', 'Canlı Masalar')}
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="p-4 pt-0">
        <Button 
          onClick={onClick}
          variant="outline"
          className="w-full bg-yellow-600 hover:bg-yellow-500 text-black border-0"
        >
          {translate('games.play_now', 'Şimdi Oyna')}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GameCard;