import React, { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import { useUser } from "@/contexts/UserContext";
import { translate } from '@/utils/i18n-fixed';
import LoginModal from "@/components/auth/LoginModalFixed";
import RegisterModal from "@/components/auth/RegisterModal";
import QuickMenu from "@/components/mobile/QuickMenu";
import QuickAccessSidebar from "./QuickAccessSidebar";
import ChatButton from "@/components/chat/ChatButton";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isAuthenticated } = useUser();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const [showQuickAccess, setShowQuickAccess] = useState(false);
  
  const openLoginModal = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };
  
  const openRegisterModal = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };
  
  // Hızlı erişim menüsü için dinleyici
  useEffect(() => {
    const handleToggleQuickMenu = () => {
      setShowQuickMenu(prev => !prev);
    };
    
    window.addEventListener('toggleQuickMenu', handleToggleQuickMenu);
    
    return () => {
      window.removeEventListener('toggleQuickMenu', handleToggleQuickMenu);
    };
  }, []);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      
      <div className="flex-1 pl-0 md:pl-16 lg:pl-24 bg-[#121212] overflow-y-auto flex flex-col overflow-x-hidden relative">
        <Header onToggleQuickAccess={() => setShowQuickAccess(!showQuickAccess)} />
        <main className="flex-1 mb-16 md:mb-0">
          {children}
        </main>
        <Footer />
      </div>
      
      {/* Bottom mobile navigation bar */}
      {isAuthenticated ? (
        /* Giriş yapmış kullanıcılar için alt menü */
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-[#2A2A2A] flex justify-around items-center py-2 px-1 z-40 shadow-lg">
          {/* Ana Sayfa */}
          <a href="/" className="flex flex-col items-center px-2">
            <div className="w-8 h-8 flex items-center justify-center text-[#FFD700]">
              <i className="fas fa-home text-lg"></i>
            </div>
            <span className="text-[9px] text-gray-300 mt-1">{translate('nav.home', 'Ana Sayfa')}</span>
          </a>
          
          {/* Casino */}
          <a href="/casino" className="flex flex-col items-center px-2">
            <div className="w-8 h-8 flex items-center justify-center text-[#FFD700]">
              <i className="fas fa-dice text-lg"></i>
            </div>
            <span className="text-[9px] text-gray-300 mt-1">{translate('nav.casino', 'Casino')}</span>
          </a>
          
          {/* Ortada Logo - Animasyonlu elmas ikonu ve hızlı erişim menüsü */}
          <div className="flex flex-col items-center px-2 relative">
            <button 
              onClick={() => {
                // Hızlı erişim menüsünü aç/kapat olayını tetikle
                const event = new CustomEvent('toggleQuickMenu');
                window.dispatchEvent(event);
              }}
              className="flex flex-col items-center focus:outline-none"
            >
              <div className="w-14 h-14 flex items-center justify-center bg-[#1A1A1A] rounded-full mb-1 -mt-8 shadow-xl border-4 border-[#FFBA00] overflow-hidden relative">
                {/* Arka plan ışık efekti */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#FFBA00]/10 to-[#FFD700]/10"></div>
                
                {/* Dönen parlak halkalar */}
                <div className="absolute inset-0 w-full h-full">
                  <div className="w-[200%] h-[200%] absolute -top-1/2 -left-1/2 animate-[spin_8s_linear_infinite]">
                    <div className="w-4 h-4 absolute top-3/4 left-1/2 rounded-full bg-[#FFD700]/30 blur-[2px]"></div>
                    <div className="w-4 h-4 absolute top-1/4 left-1/2 rounded-full bg-[#FFD700]/30 blur-[2px]"></div>
                    <div className="w-4 h-4 absolute top-1/2 left-3/4 rounded-full bg-[#FFD700]/30 blur-[2px]"></div>
                    <div className="w-4 h-4 absolute top-1/2 left-1/4 rounded-full bg-[#FFD700]/30 blur-[2px]"></div>
                  </div>
                </div>
                
                {/* Elmas ikonu - parlama animasyonu ile */}
                <div className="relative w-10 h-10 z-10 animate-[pulse_3s_ease-in-out_infinite]">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <i className="fas fa-gem text-[#FFD700] text-3xl transform rotate-6 drop-shadow-[0_0_8px_rgba(255,215,0,0.6)]"></i>
                  </div>
                  
                  {/* Parıltı efekti */}
                  <div className="absolute top-1 right-1 w-2 h-2 bg-white rounded-full opacity-80 animate-[ping_2s_cubic-bezier(0,0,0.2,1)_infinite]"></div>
                </div>
              </div>
              
              {/* Logo altı yazı - parlama animasyonu */}
              <div className="relative">
                <span className="text-[9px] text-[#FFD700] font-semibold -mt-1 inline-block relative animate-[pulse_3s_ease-in-out_infinite]">
                  {translate('nav.crypto', 'CRYPTO')}
                </span>
              </div>
            </button>
          </div>
          
          {/* Slot */}
          <a href="/slot" className="flex flex-col items-center px-2">
            <div className="w-8 h-8 flex items-center justify-center text-[#FFD700]">
              <i className="fas fa-rocket text-lg"></i>
            </div>
            <span className="text-[9px] text-gray-300 mt-1">{translate('nav.slot', 'Slot')}</span>
          </a>
          
          {/* Profil butonu - sayfa bağlantısı olarak */}
          <a href="/profile" className="flex flex-col items-center px-2 relative">
            <div className="w-8 h-8 flex items-center justify-center text-[#FFD700] relative">
              {/* Arka plan parlama efekti */}
              <div className="absolute w-full h-full rounded-full bg-[#FFD700]/10 blur-[1px] animate-pulse"></div>
              <i className="fas fa-user-circle text-lg relative z-10"></i>
              
              {/* Profil bildirimi işareti */}
              <div className="absolute -right-1 -top-1 w-3 h-3 bg-[#FFD700] rounded-full border border-[#1A1A1A] shadow-glow-sm"></div>
            </div>
            <span className="text-[9px] text-gray-300 mt-1 font-medium">{translate('nav.profile', 'Profil')}</span>
          </a>
        </div>
      ) : (
        /* Giriş yapmamış kullanıcılar için alt menü - boydan boya butonlar */
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-[#1A1A1A] border-t border-[#2A2A2A] z-40 shadow-lg">
          <div className="grid grid-cols-2 gap-0 w-full">
            <button 
              onClick={openLoginModal}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-[#121212] py-4 font-bold text-sm flex items-center justify-center w-full"
            >
              <i className="fas fa-sign-in-alt mr-2"></i>
              {translate('header.login_button', 'Giriş')}
            </button>
            
            <button 
              onClick={openRegisterModal}
              className="bg-[#232323] text-yellow-400 py-4 font-bold text-sm flex items-center justify-center w-full"
            >
              <i className="fas fa-user-plus mr-2"></i>
              {translate('header.register_button', 'Kayıt')}
            </button>
          </div>
        </div>
      )}
      
      {/* Login ve Register Modalları */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={openRegisterModal}
      />
      
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={openLoginModal}
      />
      
      {/* Hızlı Erişim Menüsü */}
      <QuickMenu 
        isOpen={showQuickMenu}
        onClose={() => setShowQuickMenu(false)}
      />
      
      {/* Desktop Quick Access Sidebar */}
      <QuickAccessSidebar
        isOpen={showQuickAccess}
        onClose={() => setShowQuickAccess(false)}
      />
      
      {/* AI Chat Support Button - Only show for authenticated users */}
      {isAuthenticated && <ChatButton />}
    </div>
  );
};

export default MainLayout;
