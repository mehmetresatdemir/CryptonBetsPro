import { memo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Star } from 'lucide-react';
import { useImageOptimization } from '@/hooks/useImageOptimization';

interface GameCardProps {
  game: {
    uuid: string;
    name: string;
    provider: string;
    images?: { small?: string; medium?: string; large?: string };
    tags?: string[];
    rtp?: number;
    volatility?: string;
  };
  onPlay: (game: any) => void;
  onFavorite?: (game: any) => void;
  isFavorite?: boolean;
}

export const GameCardOptimized = memo(({ game, onPlay, onFavorite, isFavorite }: GameCardProps) => {
  const gameImage = game.images?.medium || game.images?.small || game.images?.large;
  
  const { 
    src: optimizedSrc, 
    isLoaded, 
    hasError, 
    isLoading 
  } = useImageOptimization({
    src: gameImage || '',
    lazy: true,
    quality: 'medium'
  });

  return (
    <Card className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 bg-gradient-to-br from-gray-900 to-gray-800 border-gray-700">
      <CardContent className="p-0">
        <div className="relative aspect-[4/3] overflow-hidden">
          {optimizedSrc && !hasError ? (
            <>
              {isLoading && (
                <div className="absolute inset-0 bg-gray-800 animate-pulse flex items-center justify-center">
                  <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
              <img
                src={optimizedSrc}
                alt={game.name}
                className={`w-full h-full object-cover transition-all duration-500 ${
                  isLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                }`}
                loading="lazy"
              />
            </>
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Play size={32} className="mx-auto mb-2 opacity-50" />
                <span className="text-sm">{game.name}</span>
              </div>
            </div>
          )}
          
          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <Button
              onClick={() => onPlay(game)}
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold transform scale-90 group-hover:scale-100 transition-transform duration-300"
            >
              <Play size={20} className="mr-2" />
              Oyna
            </Button>
          </div>

          {/* Favorite Button */}
          {onFavorite && (
            <Button
              onClick={() => onFavorite(game)}
              variant="ghost"
              size="sm"
              className={`absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                isFavorite ? 'text-yellow-400' : 'text-white'
              }`}
            >
              <Star size={16} fill={isFavorite ? 'currentColor' : 'none'} />
            </Button>
          )}

          {/* RTP Badge */}
          {game.rtp && (
            <Badge className="absolute top-2 left-2 bg-green-600 text-white text-xs">
              RTP {game.rtp}%
            </Badge>
          )}
        </div>

        <div className="p-3">
          <h3 className="font-semibold text-white text-sm mb-1 truncate" title={game.name}>
            {game.name}
          </h3>
          
          <div className="flex items-center justify-between">
            <Badge variant="outline" className="text-xs text-gray-400 border-gray-600">
              {game.provider}
            </Badge>
            
            {game.volatility && (
              <span className="text-xs text-gray-500">
                {game.volatility}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

GameCardOptimized.displayName = 'GameCardOptimized';