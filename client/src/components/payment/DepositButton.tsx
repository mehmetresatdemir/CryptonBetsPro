import React, { useState } from 'react';
import { translate } from '@/utils/i18n-fixed';
import DepositModal from './DepositModal';

interface DepositButtonProps {
  className?: string;
  variant?: 'default' | 'compact' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
}

const DepositButton: React.FC<DepositButtonProps> = ({ 
  className = '', 
  variant = 'default',
  size = 'md',
  onClick
}) => {
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  // Translation function imported directly

  const handleOpenModal = () => {
    // Eğer zaten açılıyorsa veya açıksa, tekrar açma
    if (isOpening || showDepositModal) return;
    
    // Eğer onClick callback'i tanımlanmışsa, çağır (profil modalını kapatmak için)
    if (onClick) {
      onClick();
    }
    
    setShowDepositModal(true);
  };

  const handleCloseModal = () => {
    setShowDepositModal(false);
    setIsOpening(false);
  };

  // Icon only variant
  if (variant === 'icon') {
    return (
      <>
        <button
          onClick={handleOpenModal}
          className={`flex items-center justify-center rounded-lg bg-[#232323] hover:bg-[#2a2a2a] transition-all duration-300 text-green-400 hover:text-green-300 ${
            size === 'sm' ? 'w-7 h-7 text-xs' : 
            size === 'lg' ? 'w-10 h-10 text-base' : 
            'w-8 h-8 text-sm'
          } ${className}`}
        >
          <i className="fas fa-plus-circle"></i>
        </button>
        <DepositModal isOpen={showDepositModal} onClose={handleCloseModal} />
      </>
    );
  }

  // Compact variant (only plus icon and Para Yatır text)
  if (variant === 'compact') {
    return (
      <>
        <button
          onClick={handleOpenModal}
          className={`flex items-center justify-center rounded-lg bg-green-600 hover:bg-green-700 transition-all duration-300 font-bold text-white ${
            size === 'sm' ? 'px-2 py-1 text-xs' : 
            size === 'lg' ? 'px-4 py-2 text-base' : 
            'px-3 py-1.5 text-sm'
          } ${className}`}
        >
          <i className="fas fa-plus-circle mr-1.5"></i>
          {translate('payment.deposit') || "Para Yatır"}
        </button>
        <DepositModal isOpen={showDepositModal} onClose={handleCloseModal} />
      </>
    );
  }

  // Default variant with animation
  return (
    <>
      <button
        onClick={handleOpenModal}
        className={`group relative overflow-hidden bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 rounded-lg font-bold text-white shadow-lg hover:shadow-green-600/30 transition-all duration-300 ${
          size === 'sm' ? 'px-3 py-1 text-xs' : 
          size === 'lg' ? 'px-5 py-2.5 text-base' : 
          'px-4 py-2 text-sm'
        } ${className}`}
      >
        <span className="relative z-10 flex items-center justify-center">
          <i className="fas fa-plus-circle mr-1.5 group-hover:animate-pulse"></i>
          {translate('payment.deposit') || "Para Yatır"}
        </span>
        <div className="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine"></div>
      </button>
      <DepositModal isOpen={showDepositModal} onClose={handleCloseModal} />
    </>
  );
};

export default DepositButton;