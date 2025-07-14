import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/contexts/LanguageContext';
import AISupportChat from './AISupportChat';

interface ChatButtonProps {
  isOpen?: boolean;
  onToggle?: () => void;
  onClose?: () => void;
}

const ChatButton: React.FC<ChatButtonProps> = ({ isOpen = false, onToggle, onClose }) => {
  const { translate } = useLanguage();
  const [isChatOpen, setIsChatOpen] = useState(isOpen);

  // External control ile internal state'i sync et
  React.useEffect(() => {
    setIsChatOpen(isOpen);
  }, [isOpen]);

  const handleToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setIsChatOpen(!isChatOpen);
    }
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (onToggle) {
      onToggle();
    } else {
      setIsChatOpen(false);
    }
  };

  return (
    <>
      {/* AI Support Chat Modal */}
      <AISupportChat 
        isOpen={isChatOpen} 
        onClose={handleClose} 
      />
    </>
  );
};

export default ChatButton;