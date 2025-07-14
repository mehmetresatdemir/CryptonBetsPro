import { useState, useEffect } from 'react';

export const useComingSoonMode = () => {
  const [isComingSoonMode, setIsComingSoonMode] = useState(false);

  useEffect(() => {
    // LocalStorage'dan coming soon modunu kontrol et
    const comingSoonMode = localStorage.getItem('cryptonbets_coming_soon') === 'true';
    setIsComingSoonMode(comingSoonMode);
    
    // Eğer coming soon modu aktifse ve ana sayfadaysak yönlendir
    if (comingSoonMode && window.location.pathname === '/') {
      window.location.href = '/yakinda';
    }
  }, []);

  const toggleComingSoonMode = () => {
    const newMode = !isComingSoonMode;
    setIsComingSoonMode(newMode);
    localStorage.setItem('cryptonbets_coming_soon', newMode.toString());
    
    // Sayfayı yönlendir
    if (newMode) {
      window.location.href = '/yakinda';
    } else {
      window.location.href = '/';
    }
  };

  const enableComingSoonMode = () => {
    setIsComingSoonMode(true);
    localStorage.setItem('cryptonbets_coming_soon', 'true');
    window.location.href = '/yakinda';
  };

  const disableComingSoonMode = () => {
    setIsComingSoonMode(false);
    localStorage.setItem('cryptonbets_coming_soon', 'false');
    window.location.href = '/';
  };

  return {
    isComingSoonMode,
    toggleComingSoonMode,
    enableComingSoonMode,
    disableComingSoonMode
  };
};