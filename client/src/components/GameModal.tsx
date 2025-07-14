import React from 'react';
import GameDetailModal from '@/components/modals/GameDetailModal';
import { SlotegratorGame } from '@/types/slotegrator';

interface GameModalProps {
  game: SlotegratorGame | null;
  isOpen: boolean;
  onClose: () => void;
}

const GameModal: React.FC<GameModalProps> = ({ game, isOpen, onClose }) => {
  return <GameDetailModal game={game} isOpen={isOpen} onClose={onClose} />;
};

export default GameModal;