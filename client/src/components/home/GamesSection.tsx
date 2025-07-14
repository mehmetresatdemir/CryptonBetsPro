import React from "react";
import { games as defaultGames, Game } from "@/data/games";
import GameCard from "@/components/ui/game-card";

interface GamesSectionProps {
  title: string;
  icon: string;
  count: number;
  filterText?: string;
  games?: Game[];
}

const GamesSection: React.FC<GamesSectionProps> = ({ 
  title, 
  icon, 
  count, 
  filterText,
  games = defaultGames
}) => {
  return (
    <div className="px-4 mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <i className={`${icon} text-[#FFD700] mr-2`}></i>
          <h2 className="text-white font-semibold">{title}</h2>
          <span className="ml-2 bg-[#1E1E1E] px-2 py-0.5 rounded text-xs">({count})</span>
        </div>
        
        {filterText && (
          <button className="flex items-center text-sm text-gray-400">
            <i className="fas fa-filter mr-1"></i>
            {filterText}
          </button>
        )}
      </div>
      
      {/* Games Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
        {games.map((game: Game, index: number) => (
          <GameCard 
            key={game.id || index}
            bgClass={game.bgClass}
            title={game.title}
            subtitle={game.subtitle}
            titleSize={game.titleSize as any}
            icon={game.icon}
            hasNumbers={game.hasNumbers}
            additionalText={game.additionalText}
          />
        ))}
      </div>
    </div>
  );
};

export default GamesSection;
