import React, { useRef, useEffect } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { motion, AnimatePresence } from 'framer-motion';

interface Bonus {
  id: number;
  type: string;
  title: {
    tr: string;
    en: string;
    ka: string;
    ru: string;
  };
  description: {
    tr: string;
    en: string;
    ka: string;
    ru: string;
  };
  amount: {
    tr: string;
    en: string;
    ka: string;
    ru: string;
  };
  image: string;
  rules: {
    tr: string[];
    en: string[];
    ka: string[];
    ru: string[];
  };
  isVip: boolean;
  isHot: boolean;
  percentage: number | null;
  bgGradient: string;
}

interface BonusModalProps {
  bonus: Bonus;
  isOpen: boolean;
  onClose: () => void;
}

const BonusModal: React.FC<BonusModalProps> = ({ bonus, isOpen, onClose }) => {
  const { language, t } = useLanguage();
  const modalRef = useRef<HTMLDivElement>(null);

  // Dışarı tıklandığında modalı kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // ESC tuşu ile modalı kapat
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            ref={modalRef}
            className="bg-[#121212] rounded-2xl overflow-hidden shadow-2xl w-full max-w-3xl relative"
            initial={{ scale: 0.9, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 20, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Modal Header - Gradient Background */}
            <div className={`bg-gradient-to-r ${bonus.bgGradient} p-6 sm:p-8 relative`}>
              {/* Pattern Overlay */}
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMTIgMTJjMy4zMTQgMCA2LTIuNjg2IDYtNnMtMi42ODYtNi02LTZjLTMuMzE0IDAtNiAyLjY4Ni02IDZzMi42ODYgNiA2IDZ6bTEyIDEyYzMuMzE0IDAgNi0yLjY4NiA2LTZzLTIuNjg2LTYtNi02Yy0zLjMxNCAwLTYgMi42ODYtNiA2czIuNjg2IDYgNiA2ek0xMiAxOGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMCAxMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnptMCAxMmMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNmMtMy4zMTQgMC02IDIuNjg2LTYgNnMyLjY4NiA2IDYgNnpNMCA0OGMzLjMxNCAwIDYtMi42ODYgNi02cy0yLjY4Ni02LTYtNi02IDIuNjg2LTYgNiAyLjY4NiA2IDYgNnoiIGZpbGw9IiNGRkZGRkYiIGZpbGwtb3BhY2l0eT0iLjA1Ii8+PC9nPjwvc3ZnPg==')] opacity-70"></div>
              
              {/* Kapatma Butonu */}
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 z-20 text-white/80 hover:text-white bg-black/30 hover:bg-black/50 h-8 w-8 rounded-full flex items-center justify-center transition-all duration-300"
              >
                <i className="fas fa-times"></i>
              </button>
              
              <div className="relative z-10">
                {/* Badges */}
                <div className="flex space-x-2 mb-4">
                  {bonus.isHot && (
                    <div className="bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center">
                      <i className="fas fa-fire mr-1"></i>
                      {t('bonuses.hot')}
                    </div>
                  )}
                  {bonus.isVip && (
                    <div className="bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase flex items-center">
                      <i className="fas fa-crown mr-1"></i>
                      VIP
                    </div>
                  )}
                </div>
                
                {/* Başlık */}
                <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-3">
                  {bonus.title[language as keyof typeof bonus.title]}
                </h2>
                
                {/* Açıklama */}
                <p className="text-white/90 text-lg mb-4">
                  {bonus.description[language as keyof typeof bonus.description]}
                </p>
                
                {/* Bonus Miktarı */}
                <div className="bg-black/30 backdrop-blur-md px-6 py-4 rounded-xl inline-flex items-center mb-2">
                  {bonus.percentage !== null && (
                    <div className="text-4xl font-extrabold text-white mr-3">{bonus.percentage}%</div>
                  )}
                  <div className="text-2xl font-bold text-white">
                    {bonus.amount[language as keyof typeof bonus.amount]}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 sm:p-8">
              {/* Kurallar başlığı */}
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <i className="fas fa-list-ul text-yellow-500 mr-2"></i>
                {t('bonuses.rules_title')}
              </h3>
              
              {/* Kurallar listesi */}
              <div className="mb-6">
                <ul className="space-y-3">
                  {bonus.rules[language as keyof typeof bonus.rules].map((rule, index) => (
                    <li 
                      key={index}
                      className="flex items-start bg-[#1A1A1A] p-3 rounded-lg hover:bg-[#222222] transition-colors duration-300 group"
                    >
                      <div className="text-yellow-500 mr-3 shrink-0 mt-0.5">
                        <i className="fas fa-check-circle"></i>
                      </div>
                      <span className="text-gray-300 group-hover:text-white transition-colors duration-300">{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Bonus Talep Et Butonu */}
              <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                <button 
                  onClick={onClose}
                  className="px-5 py-3 border border-yellow-500/30 text-yellow-500 rounded-lg hover:bg-yellow-500/10 transition-colors duration-300"
                >
                  {t('bonuses.close')}
                </button>
                
                <button 
                  className="px-5 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-semibold rounded-lg hover:from-yellow-600 hover:to-yellow-700 transition-colors duration-300 flex items-center justify-center group"
                >
                  <i className="fas fa-gift mr-2 group-hover:scale-110 transition-transform duration-300"></i>
                  {t('bonuses.claim')}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BonusModal;