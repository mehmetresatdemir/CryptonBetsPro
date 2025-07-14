import React, { useState, useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Link } from "wouter";
import { translate, getCurrentLanguage } from '@/utils/i18n-fixed';
import { useUser } from "@/contexts/UserContext";
import { motion, AnimatePresence } from 'framer-motion';
import LanguageSelector from "./LanguageSelector";
import LoginModal from "@/components/auth/LoginModal";
import RegisterModal from "@/components/auth/RegisterModal";
import ProfileModal from "@/components/profile/ProfileModalFixed";
import DepositButton from "@/components/payment/DepositButton";
import DepositModal from "@/components/payment/DepositModal";
import ChatButton from "@/components/chat/ChatButton";

interface HeaderProps {
  onToggleQuickAccess?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleQuickAccess }) => {
  const { language, setLanguage } = useLanguage();
  const { user, logout } = useUser();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);

  const t = (key: string) => translate(key, getCurrentLanguage());

  const openLoginModal = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const openRegisterModal = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  useEffect(() => {
    const handleClickOutside = () => {
      setShowUserMenu(false);
    };
    
    if (showUserMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showUserMenu]);

  return (
    <>
      <div className="bg-[#0A0A0A] border-b border-gray-800 sticky top-0 z-50">
        <header className="px-4 py-3 flex items-center justify-between max-w-full mx-auto">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 rounded-lg flex items-center justify-center shadow-lg">
                <span className="text-black font-bold text-lg">CB</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 bg-clip-text text-transparent">
                CryptonBets
              </span>
            </Link>
            
            {/* Coming Soon Toggle - Header'da görünür */}
            <div className="hidden md:block ml-4">
              <Link 
                href="/yakinda" 
                className="bg-gradient-to-r from-yellow-500/20 to-amber-600/20 border border-yellow-500/30 text-yellow-400 px-3 py-1 rounded-lg text-xs font-medium hover:bg-yellow-500/30 transition-all duration-300"
              >
                ⏳ Yakında Modu
              </Link>
            </div>
          </div>

          {/* Navigation Menu */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-gray-300 hover:text-yellow-400 transition-colors">
              {t('nav.home')}
            </Link>
            <Link href="/slot" className="text-gray-300 hover:text-yellow-400 transition-colors">
              {t('nav.slots')}
            </Link>
            <Link href="/casino" className="text-gray-300 hover:text-yellow-400 transition-colors">
              {t('nav.casino')}
            </Link>
            <Link href="/vip" className="text-gray-300 hover:text-yellow-400 transition-colors">
              {t('nav.vip')}
            </Link>
            <Link href="/bonuslar" className="text-gray-300 hover:text-yellow-400 transition-colors">
              {t('nav.bonuses')}
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-4">
            {/* Language Selector */}
            <LanguageSelector />

            {user ? (
              <>
                {/* User Balance */}
                <div className="hidden md:flex items-center bg-[#1A1A1A] rounded-lg px-3 py-2 border border-yellow-500/20">
                  <span className="text-yellow-400 font-bold text-sm">
                    {user.balance ? `${user.balance.toLocaleString()} ₺` : '0 ₺'}
                  </span>
                </div>

                {/* Deposit Button */}
                <DepositButton variant="default" size="sm" />

                {/* User Menu */}
                <div className="relative">
                  <button 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center bg-[#1A1A1A] rounded-lg border border-yellow-500/20 px-3 py-2"
                  >
                    <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center mr-2">
                      <span className="text-black font-bold text-sm">
                        {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                      </span>
                    </div>
                    <span className="text-white text-sm font-medium hidden md:block">
                      {user.username}
                    </span>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-[#1A1A1A] border border-gray-700 rounded-lg shadow-xl z-50">
                      <div className="py-2">
                        <button
                          onClick={() => {
                            setShowProfileModal(true);
                            setShowUserMenu(false);
                          }}
                          className="w-full text-left px-4 py-2 text-gray-300 hover:bg-gray-800 transition-colors"
                        >
                          {t('header.profile')}
                        </button>
                        <button
                          onClick={logout}
                          className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800 transition-colors"
                        >
                          {t('header.logout')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Login Button */}
                <button
                  onClick={() => setShowLoginModal(true)}
                  className="bg-gradient-to-r from-yellow-500 to-amber-600 text-black px-4 py-2 rounded-lg font-medium hover:from-yellow-600 hover:to-amber-700 transition-all"
                >
                  {t('auth.login')}
                </button>

                {/* Register Button */}
                <button
                  onClick={() => setShowRegisterModal(true)}
                  className="border border-yellow-500 text-yellow-400 px-4 py-2 rounded-lg font-medium hover:bg-yellow-500/10 transition-all"
                >
                  {t('auth.register')}
                </button>
              </>
            )}
          </div>
        </header>
      </div>

      {/* Modals */}
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
      
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
      
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
      />
      
      <ChatButton 
        isOpen={showChatModal}
        onToggle={() => setShowChatModal(!showChatModal)}
      />
    </>
  );
};

export default Header;