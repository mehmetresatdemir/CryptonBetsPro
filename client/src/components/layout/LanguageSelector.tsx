import { FC, useState } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from '@/utils/i18n-fixed';

// Dil seçenekleri ve bayrak URL'leri
const languages: { code: Language; name: string; flag: string }[] = [
  { code: 'tr', name: 'Türkçe', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/800px-Flag_of_Turkey.svg.png' },
  { code: 'en', name: 'English', flag: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg/800px-Flag_of_the_United_Kingdom_%283-5%29.svg.png' }
];

const LanguageSelector: FC = () => {
  const { language, setLanguage } = useLanguage();
  const [showMenu, setShowMenu] = useState(false);
  
  // Aktif dil bilgisini bul
  const activeLanguage = languages.find((lang) => lang.code === language) || languages[0];

  return (
    <div className="relative">
      <button 
        className="flex items-center transition-all duration-300 hover:transform hover:scale-105 relative overflow-hidden"
        onClick={() => setShowMenu(!showMenu)}
      >
        <img 
          src={activeLanguage.flag} 
          alt={activeLanguage.code} 
          className="w-7 h-4 md:w-8 md:h-6 object-cover border border-yellow-500/30 hover:border-yellow-400 transition-all duration-300 rounded-sm" 
        />
      </button>
      
      {showMenu && (
        <div className="absolute top-full right-0 mt-2 bg-[#1A1A1A] rounded-lg shadow-xl py-2 w-32 z-50 border border-yellow-500/30 backdrop-blur-sm animate-fadeIn">
          {languages.map((lang) => (
            <button 
              key={lang.code}
              className={`flex items-center justify-center w-full text-left px-4 py-2 hover:bg-yellow-500/10 text-xs ${language === lang.code ? 'text-[#FFD700]' : 'text-white'} group transition-all duration-300`}
              onClick={() => {
                // Eğer aynı dil seçilirse menüyü kapat
                if (language === lang.code) {
                  setShowMenu(false);
                  return;
                }
                
                // Dil değiştir
                setLanguage(lang.code);
                
                // localStorage'a kaydet
                localStorage.setItem('cryptonbets-language', lang.code);
                
                // Menüyü kapat
                setShowMenu(false);
                
                // Admin sayfasında ise sayfayı yenile
                if (window.location.pathname.includes('/admin')) {
                  setTimeout(() => {
                    window.location.reload();
                  }, 100);
                }
              }}
            >
              <img 
                src={lang.flag} 
                alt={lang.code} 
                className={`w-8 h-5 object-cover border ${language === lang.code ? 'border-[#FFD700]' : 'border-gray-600'} group-hover:border-yellow-400 transition-all duration-300`} 
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;