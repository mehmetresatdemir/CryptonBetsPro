import { useEffect, useRef } from 'react';

interface GamePreloadOptions {
  gameUuids: string[];
  enabled?: boolean;
}

export const useGamePreloader = ({ gameUuids, enabled = true }: GamePreloadOptions) => {
  const preloadedGames = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!enabled) return;

    const preloadGame = async (gameUuid: string) => {
      if (preloadedGames.current.has(gameUuid)) return;

      try {
        // DNS prefetch ve preconnect için oyun URL'ini önceden hazırla
        const link1 = document.createElement('link');
        link1.rel = 'dns-prefetch';
        link1.href = 'https://gis.slotegrator.com';
        document.head.appendChild(link1);

        const link2 = document.createElement('link');
        link2.rel = 'preconnect';
        link2.href = 'https://gis.slotegrator.com';
        document.head.appendChild(link2);

        preloadedGames.current.add(gameUuid);
      } catch (error) {
        console.warn('Oyun ön yükleme hatası:', error);
      }
    };

    // İlk 5 oyunu önceden hazırla
    gameUuids.slice(0, 5).forEach(gameUuid => {
      preloadGame(gameUuid);
    });

  }, [gameUuids, enabled]);

  return { preloadedGames: preloadedGames.current };
};