import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Language, getCurrentLanguage, changeLanguage, translate } from '../utils/i18n-fixed';

export { getCurrentLanguage };

type LanguageContextType = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string, defaultValue?: string) => string;
  translate: (key: string, defaultValue?: string) => string;
  changeLanguage: (language: Language) => void;
  currentLanguage: Language;
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem('cryptonbets-language') as Language;
    return saved && ['tr', 'en'].includes(saved) ? saved : 'tr';
  });

  const setLanguage = (newLanguage: Language) => {
    if (newLanguage === language) return;
    
    localStorage.setItem('cryptonbets-language', newLanguage);
    setLanguageState(newLanguage);
    changeLanguage(newLanguage);
    
    if (window.location.pathname.includes('/admin')) {
      localStorage.setItem('cryptonbets-language', newLanguage);
    }
  };

  const value: LanguageContextType = {
    language,
    setLanguage,
    t: (key: string, defaultValue?: string) => translate(key, defaultValue) as string,
    translate: (key: string, defaultValue?: string) => translate(key, defaultValue) as string,
    changeLanguage: setLanguage,
    currentLanguage: language,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};