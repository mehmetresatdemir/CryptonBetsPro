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
import WithdrawalModal from "@/components/payment/WithdrawalModal";
import ChatButton from "@/components/chat/ChatButton";

// Lisans ve Sponsor logoları için import
import licenseLogo from "@/assets/images/license-logo.png";
import milanLogo from "@/assets/images/milan-logo.png";
import telegramLogo from "@/assets/images/telegram-logo.webp";

// Bayrak görselleri
const FLAGS = {
  TR: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/Flag_of_Turkey.svg/800px-Flag_of_Turkey.svg.png",
  EN: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/83/Flag_of_the_United_Kingdom_%283-5%29.svg/800px-Flag_of_the_United_Kingdom_%283-5%29.svg.png",
  KA: "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/Flag_of_Georgia.svg/800px-Flag_of_Georgia.svg.png",
  RU: "https://upload.wikimedia.org/wikipedia/commons/thumb/f/f3/Flag_of_Russia.svg/800px-Flag_of_Russia.svg.png"
};

interface HeaderProps {
  onToggleQuickAccess?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onToggleQuickAccess }) => {
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { t, language } = useLanguage();
  const { user, isAuthenticated, logout } = useUser();
  
  const openLoginModal = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };
  
  const openRegisterModal = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };
  
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawalModal, setShowWithdrawalModal] = useState(false);
  const [showChatModal, setShowChatModal] = useState(false);
  
  // Mobil alt menüden gelen profil açma ve para yatırma olayını dinle
  useEffect(() => {
    const handleOpenProfileModal = () => {
      setShowProfileModal(true);
    };
    
    const handleOpenDepositModal = () => {
      setShowDepositModal(true);
    };
    
    window.addEventListener('openProfileModal', handleOpenProfileModal);
    window.addEventListener('openDepositModal', handleOpenDepositModal);
    
    return () => {
      window.removeEventListener('openProfileModal', handleOpenProfileModal);
      window.removeEventListener('openDepositModal', handleOpenDepositModal);
    };
  }, []);
  
  return (
    <>
      <header className="md:h-16 h-[4.5rem] md:bg-[#121212] bg-[#232323] flex items-center justify-between px-2 sm:px-6 border-b border-yellow-500/20 sticky top-0 z-50 shadow-lg backdrop-blur-sm bg-opacity-95">
      {/* Left Side - Logo and Mobile Menu Button */}
      <div className="flex items-center">
        {/* Mobile Menu Button */}
        <button 
          onClick={() => {
            console.log('Hamburger clicked, current state:', showMobileMenu);
            const newState = !showMobileMenu;
            setShowMobileMenu(newState);
            console.log('New state will be:', newState);
          }}
          className="lg:hidden mr-3 text-yellow-400 p-2 rounded-lg focus:outline-none hover:bg-yellow-500/20 transition-all duration-300 relative group z-[70]"
        >
          <div className="absolute inset-0 bg-yellow-500/5 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300"></div>
          <i className={`fas ${showMobileMenu ? 'fa-times' : 'fa-bars'} text-xl`}></i>
          <span className="absolute -bottom-1 left-1/2 w-0 h-0.5 bg-yellow-500 group-hover:w-full transition-all duration-300 transform -translate-x-1/2"></span>
        </button>

        {/* Logos Container (changes to horizontal scrollable on mobile) */}
        <div className="flex items-center space-x-3 md:space-x-5 overflow-x-auto hide-scrollbar">
          {/* Affiliate Button - Sadece masaüstünde gösteriliyor */}
          <Link href="/affiliate" className="hidden md:block">
            <div className="bg-gradient-to-b from-yellow-400 to-yellow-600 p-[1.5px] rounded-xl shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 transform hover:scale-105 group">
              <div className="bg-gradient-to-b from-[#222] to-[#121212] rounded-xl px-3 sm:px-4 py-2 flex items-center justify-center">
                <i className="fas fa-handshake text-yellow-400 text-lg group-hover:text-yellow-300 transition-colors duration-300"></i>
                <div className="flex flex-col ml-2">
                  <span className="text-white font-bold text-xs uppercase tracking-wide">Affiliate</span>
                  <span className="text-yellow-400 text-xs font-semibold group-hover:text-yellow-300 transition-colors duration-300">Komisyon</span>
                </div>
              </div>
            </div>
          </Link>
          
          {/* Lisans Logosu - Sadece masaüstünde görünür */}
          <div className="relative group flex-shrink-0 hidden md:block">
            <div className="bg-[#1D1D1D] p-1 rounded-xl overflow-hidden border border-yellow-500/20 group-hover:border-yellow-500/40 transition-all duration-300 shadow-md group-hover:shadow-yellow-500/20">
              <img 
                src={licenseLogo} 
                alt="Lisans Logosu" 
                className="h-9 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
            </div>
            <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 bg-[#1A1A1A] text-white text-xs rounded-lg px-3 py-1.5 mb-1 whitespace-nowrap transition-all duration-300 shadow-lg border border-yellow-500/20 backdrop-blur-sm">
{translate('security.licensed')}
            </div>
          </div>
          
          {/* Milan Sponsor Logosu - Hide on extra small screens */}
          <div className="relative group hidden sm:block flex-shrink-0">
            <div className="bg-[#1D1D1D] p-1 rounded-xl overflow-hidden border border-yellow-500/20 group-hover:border-yellow-500/40 transition-all duration-300 shadow-md group-hover:shadow-yellow-500/20">
              <img 
                src={milanLogo} 
                alt="AC Milan" 
                className="h-9 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
            </div>
            <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 bg-[#1A1A1A] text-white text-xs rounded-lg px-3 py-1.5 mb-1 whitespace-nowrap transition-all duration-300 shadow-lg border border-yellow-500/20 backdrop-blur-sm">
{translate('common.sponsor', 'Resmi Sponsor')}
            </div>
          </div>
          
          {/* Telegram Logo - Sadece masaüstünde gösteriliyor */}
          <div className="relative group flex-shrink-0 hidden md:block">
            <a href="https://t.me/cryptonbets" target="_blank" rel="noopener noreferrer">
              <div className="bg-[#1D1D1D] p-1 rounded-xl overflow-hidden border border-yellow-500/20 group-hover:border-yellow-500/40 transition-all duration-300 shadow-md group-hover:shadow-yellow-500/20">
                <img 
                  src={telegramLogo} 
                  alt="Telegram" 
                  className="h-9 w-auto object-contain transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-yellow-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-shimmer"></div>
              </div>
              <div className="absolute opacity-0 group-hover:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 bg-[#1A1A1A] text-white text-xs rounded-lg px-3 py-1.5 mb-1 whitespace-nowrap transition-all duration-300 shadow-lg border border-yellow-500/20 backdrop-blur-sm">
{translate('support.telegram')}
              </div>
            </a>
          </div>
        </div>
      </div>
      
      {/* Right Side - User Controls */}
      <div className="flex items-center">
        {/* Language Selector */}
        <div className="relative mr-3 sm:mr-4">
          <LanguageSelector />
        </div>
        
        {!isAuthenticated ? (
          /* Login/Register Buttons - Giriş yapmadan önce görünür */
          <div className="hidden md:flex items-center space-x-3 sm:space-x-4">
            {/* Login Button */}
            <button 
              onClick={openLoginModal}
              className="relative group overflow-hidden bg-gradient-to-br from-yellow-400 to-yellow-600 text-[#121212] font-bold rounded-xl px-6 py-2 text-sm transition-all duration-300 shadow-lg hover:shadow-yellow-500/40 transform hover:scale-105"
            >
              <span className="relative z-10 flex items-center">
                <i className="fas fa-sign-in-alt mr-1.5"></i>
                <span>{translate('auth.login')}</span>
              </span>
              <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
              <div className="absolute top-0 -inset-full h-full w-1/2 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shimmer"></div>
            </button>
            
            {/* Register Button */}
            <button 
              onClick={openRegisterModal}
              className="relative group overflow-hidden bg-transparent border-2 border-yellow-500 text-yellow-400 font-bold rounded-xl px-6 py-1.5 text-sm transition-all duration-300 transform hover:scale-105 hover:shadow-yellow-500/20 hover:shadow-lg"
            >
              <span className="relative z-10 flex items-center">
                <i className="fas fa-user-plus mr-1.5"></i>
                <span>{translate('auth.register')}</span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 to-yellow-600 opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>
              <div className="absolute top-0 -inset-full h-full w-1/2 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-10 group-hover:animate-shimmer"></div>
            </button>
          </div>
        ) : (
          /* Kullanıcı Profil Alanı - Giriş yaptıktan sonra görünür */
          <div className="hidden md:flex items-center space-x-3">
            {/* Bakiye Gösterimi - Daha kompakt */}
            <div className="bg-[#1A1A1A] rounded-lg border border-yellow-500/20 shadow-lg hover:shadow-yellow-500/30 px-2 py-1 transition-all duration-300 hover:border-yellow-500/50 hover:transform hover:scale-105 group overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-yellow-400/0 opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"></div>
              <div className="flex items-center space-x-1.5 relative z-10">
                <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-1 rounded-md shadow-md group-hover:shadow-yellow-500/50 transform transition-all duration-500 group-hover:scale-110">
                  <i className="fas fa-coins text-[#121212] text-xs animate-pulse"></i>
                </div>
                <div className="flex flex-col">
                  <span className="text-gray-400 text-[10px] font-medium tracking-wider">{translate('common.balance')}</span>
                  <span className="text-yellow-400 font-bold text-xs group-hover:text-yellow-300 transition-all duration-500 group-hover:translate-x-1">
                    {user?.balance ? `${user.balance.toLocaleString()} ₺` : '0 ₺'}
                  </span>
                </div>
                <DepositButton variant="icon" size="sm" className="ml-0.5" />
              </div>
            </div>
            
            {/* Quick Access Button - Desktop only */}
            {onToggleQuickAccess && (
              <button
                onClick={onToggleQuickAccess}
                className="hidden md:flex items-center justify-center w-10 h-10 bg-[#1A1A1A] rounded-lg border border-yellow-500/20 shadow-lg hover:shadow-yellow-500/30 transition-all duration-300 hover:border-yellow-500/50 hover:transform hover:scale-105 relative overflow-hidden group"
                title={t('Quick Access') || 'Hızlı Erişim'}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-yellow-400/0 opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"></div>
                <i className="fas fa-bolt text-yellow-400 text-sm group-hover:text-yellow-300 transition-all duration-300 relative z-10"></i>
              </button>
            )}
            
            {/* Kullanıcı Profil Menüsü */}
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center bg-[#1A1A1A] rounded-lg border border-yellow-500/20 shadow-lg hover:shadow-yellow-500/30 px-2 py-1 transition-all duration-300 hover:border-yellow-500/50 hover:transform hover:scale-105 relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/5 to-yellow-400/0 opacity-0 group-hover:opacity-100 group-hover:animate-shimmer"></div>
                <div className="relative w-7 h-7 rounded-md bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-[#121212] font-bold shadow-md group-hover:shadow-yellow-500/50 transform transition-all duration-500 group-hover:scale-110 overflow-hidden">
                  <div className="absolute inset-0 bg-yellow-300/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative z-10 text-xs">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                </div>
                <span className="ml-1.5 text-white font-medium text-xs hidden sm:block group-hover:text-yellow-300 transition-all duration-500">{user?.username}</span>
                <i className={`fas fa-caret-down text-gray-400 ml-1 text-xs transition-all duration-500 ${showUserMenu ? 'transform rotate-180 text-yellow-400' : 'group-hover:text-yellow-400'}`}></i>
              </button>
              
              {/* Dropdown menü */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl bg-[#1A1A1A] shadow-xl border border-yellow-500/30 overflow-hidden z-50 animate-fadeIn backdrop-blur-sm">
                  <div className="p-3">
                    <div className="border-b border-gray-700/50 pb-3 mb-2">
                      <div className="flex items-center px-3 py-2 bg-gradient-to-r from-[#232323] to-[#1A1A1A] rounded-lg">
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-[#121212] font-bold shadow-lg text-lg relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/0 via-yellow-400/10 to-yellow-400/0 animate-shimmer"></div>
                          <span className="relative z-10">{user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                        </div>
                        <div className="ml-3">
                          <div className="text-yellow-400 font-bold text-base transition-all duration-300">{user?.username}</div>
                          <div className="text-gray-400 text-xs mt-0.5">{user?.email}</div>
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowProfileModal(true);
                      }}
                      className="w-full text-left px-3 py-2.5 hover:bg-yellow-500/10 rounded-lg transition-all duration-300 flex items-center text-gray-300 hover:text-yellow-400 hover:pl-4 group"
                    >
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#232323] group-hover:bg-[#2A2A2A] mr-2 transition-all duration-300">
                        <i className="fas fa-user-circle text-yellow-400 text-sm group-hover:text-yellow-300"></i>
                      </div>
                      <span className="font-medium">{translate('common.profile')}</span>
                    </button>
                    
                    <div 
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowDepositModal(true);
                      }}
                      className="px-3 py-2.5 hover:bg-yellow-500/10 rounded-lg transition-all duration-300 flex items-center text-gray-300 hover:text-yellow-400 hover:pl-4 group mt-1 cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#232323] group-hover:bg-[#2A2A2A] mr-2 transition-all duration-300">
                          <i className="fas fa-wallet text-yellow-400 text-sm group-hover:text-yellow-300"></i>
                        </div>
                        <span className="font-medium">{translate('payment.deposit')}</span>
                    </div>
                    
                    <div 
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowWithdrawalModal(true);
                      }}
                      className="px-3 py-2.5 hover:bg-yellow-500/10 rounded-lg transition-all duration-300 flex items-center text-gray-300 hover:text-yellow-400 hover:pl-4 group mt-1 cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#232323] group-hover:bg-[#2A2A2A] mr-2 transition-all duration-300">
                          <i className="fas fa-money-bill-wave text-green-400 text-sm group-hover:text-green-300"></i>
                        </div>
                        <span className="font-medium">Para Çek</span>
                    </div>
                    
                    <div 
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowProfileModal(true);
                        // Burada normalde profil modalında geçmiş sekmesine geçiş yapılmalı
                      }}
                      className="px-3 py-2.5 hover:bg-yellow-500/10 rounded-lg transition-all duration-300 flex items-center text-gray-300 hover:text-yellow-400 hover:pl-4 group mt-1 cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#232323] group-hover:bg-[#2A2A2A] mr-2 transition-all duration-300">
                          <i className="fas fa-history text-yellow-400 text-sm group-hover:text-yellow-300"></i>
                        </div>
                        <span className="font-medium">{translate('common.history')}</span>
                    </div>
                    
                    <div 
                      onClick={() => {
                        setShowUserMenu(false);
                        setShowProfileModal(true);
                        // Profil modalında ayarlar sekmesine geçiş yapılmalı
                      }}
                      className="px-3 py-2.5 hover:bg-yellow-500/10 rounded-lg transition-all duration-300 flex items-center text-gray-300 hover:text-yellow-400 hover:pl-4 group mt-1 cursor-pointer"
                    >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#232323] group-hover:bg-[#2A2A2A] mr-2 transition-all duration-300">
                          <i className="fas fa-cog text-yellow-400 text-sm group-hover:text-yellow-300"></i>
                        </div>
                        <span className="font-medium">{translate('common.settings')}</span>
                      </div>
                    
                    <div className="border-t border-gray-700/50 mt-2 pt-3">
                      <button 
                        onClick={logout}
                        className="w-full px-3 py-2.5 bg-gradient-to-r from-[#232323] to-[#1A1A1A] hover:bg-red-500/10 rounded-lg transition-all duration-300 flex items-center text-gray-300 hover:text-red-400 hover:pl-4 group"
                      >
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#2A2A2A] group-hover:bg-[#332222] mr-2 transition-all duration-300">
                          <i className="fas fa-sign-out-alt text-red-400 text-sm group-hover:text-red-300"></i>
                        </div>
                        <span className="font-medium">{translate('auth.logout')}</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      


      {/* Mobile Navigation Menu - Sidebar */}
      <AnimatePresence>
        {showMobileMenu && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-[999] md:hidden h-screen w-screen"
              onClick={() => setShowMobileMenu(false)}
            />
            
            {/* Sidebar */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed top-0 left-0 h-screen w-72 bg-[#121212] border-r border-gray-700/30 z-[1000] md:hidden overflow-y-auto shadow-2xl"
            >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700/30 bg-gradient-to-r from-yellow-500/5 to-yellow-600/5">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg flex items-center justify-center">
                  <i className="fas fa-coins text-black text-sm"></i>
                </div>
                <div>
                  <h2 className="text-white font-semibold text-base">CryptonBets</h2>
                  <p className="text-gray-400 text-xs">Menu</p>
                </div>
              </div>
              <button
                onClick={() => setShowMobileMenu(false)}
                className="w-8 h-8 bg-gray-800/30 hover:bg-gray-700/50 rounded-lg flex items-center justify-center transition-all duration-200"
              >
                <i className="fas fa-times text-gray-400 text-sm"></i>
              </button>
            </div>

            {/* Navigation Items */}
            <div className="p-4 space-y-2">
              {/* Home */}
              <Link href="/" onClick={() => setShowMobileMenu(false)}>
                <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-yellow-500/10 transition-all duration-200">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center group-hover:bg-yellow-500/30 transition-colors duration-200">
                    <i className="fas fa-home text-yellow-500 text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-sm group-hover:text-yellow-400 transition-colors duration-200">{t('sidebar.home')}</h3>
                    <p className="text-gray-500 text-xs">Ana sayfa</p>
                  </div>
                  <i className="fas fa-chevron-right text-gray-600 text-xs group-hover:text-yellow-500 group-hover:translate-x-0.5 transition-all duration-200"></i>
                </div>
              </Link>

              {/* Slot */}
              <Link href="/slot" onClick={() => setShowMobileMenu(false)}>
                <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-blue-500/10 transition-all duration-200">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500/30 transition-colors duration-200">
                    <i className="fas fa-gamepad text-blue-500 text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-sm group-hover:text-blue-400 transition-colors duration-200">{t('sidebar.slot')}</h3>
                    <p className="text-gray-500 text-xs">22,515+ oyun</p>
                  </div>
                  <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded-md">HOT</span>
                  <i className="fas fa-chevron-right text-gray-600 text-xs group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all duration-200"></i>
                </div>
              </Link>

              {/* Casino */}
              <Link href="/casino" onClick={() => setShowMobileMenu(false)}>
                <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-green-500/10 transition-all duration-200">
                  <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center group-hover:bg-green-500/30 transition-colors duration-200">
                    <i className="fas fa-dice text-green-500 text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-sm group-hover:text-green-400 transition-colors duration-200">{t('sidebar.casino')}</h3>
                    <p className="text-gray-500 text-xs">Live casino</p>
                  </div>
                  <i className="fas fa-chevron-right text-gray-600 text-xs group-hover:text-green-500 group-hover:translate-x-0.5 transition-all duration-200"></i>
                </div>
              </Link>
              {/* Games */}
              <Link href="/oyunlar" onClick={() => setShowMobileMenu(false)}>
                <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-red-500/10 transition-all duration-200">
                  <div className="w-10 h-10 rounded-lg bg-red-500/20 flex items-center justify-center group-hover:bg-red-500/30 transition-colors duration-200">
                    <i className="fas fa-rocket text-red-500 text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-sm group-hover:text-red-400 transition-colors duration-200">{t('sidebar.games')}</h3>
                    <p className="text-gray-500 text-xs">Crash oyunları</p>
                  </div>
                  <i className="fas fa-chevron-right text-gray-600 text-xs group-hover:text-red-500 group-hover:translate-x-0.5 transition-all duration-200"></i>
                </div>
              </Link>

              {/* VIP */}
              <Link href="/vip" onClick={() => setShowMobileMenu(false)}>
                <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-purple-500/10 transition-all duration-200">
                  <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center group-hover:bg-purple-500/30 transition-colors duration-200">
                    <i className="fas fa-crown text-purple-500 text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-sm group-hover:text-purple-400 transition-colors duration-200">{t('sidebar.vip')}</h3>
                    <p className="text-gray-500 text-xs">Özel avantajlar</p>
                  </div>
                  <span className="bg-purple-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">VIP</span>
                  <i className="fas fa-chevron-right text-gray-600 text-xs group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all duration-200"></i>
                </div>
              </Link>

              {/* Bonuses */}
              <Link href="/bonuses" onClick={() => setShowMobileMenu(false)}>
                <div className="group flex items-center space-x-3 p-3 rounded-xl hover:bg-orange-500/10 transition-all duration-200">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center group-hover:bg-orange-500/30 transition-colors duration-200">
                    <i className="fas fa-gift text-orange-500 text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-medium text-sm group-hover:text-orange-400 transition-colors duration-200">{t('sidebar.bonuses')}</h3>
                    <p className="text-gray-500 text-xs">Promosyonlar</p>
                  </div>
                  <span className="bg-orange-500 text-white text-xs font-bold px-2 py-0.5 rounded-md">NEW</span>
                  <i className="fas fa-chevron-right text-gray-600 text-xs group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all duration-200"></i>
                </div>
              </Link>
            </div>
            
            {/* Footer Section */}
            <div className="border-t border-gray-700/30 mt-4 p-4">
              {!isAuthenticated ? (
                <div className="space-y-3">
                  <div className="text-center">
                    <h3 className="text-white font-medium text-sm mb-1">Hesabınız yok mu?</h3>
                    <p className="text-gray-400 text-xs">Hemen üye olun!</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => {
                        setShowMobileMenu(false);
                        setShowLoginModal(true);
                      }}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black font-medium rounded-lg py-2 text-xs transition-colors duration-200"
                    >
                      <i className="fas fa-sign-in-alt mr-1"></i>
                      Giriş
                    </button>
                    
                    <button 
                      onClick={() => {
                        setShowMobileMenu(false);
                        setShowRegisterModal(true);
                      }}
                      className="border border-yellow-500 text-yellow-400 hover:bg-yellow-500 hover:text-black font-medium rounded-lg py-2 text-xs transition-colors duration-200"
                    >
                      <i className="fas fa-user-plus mr-1"></i>
                      Kayıt
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-yellow-500 flex items-center justify-center text-black font-bold text-sm">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="flex-1">
                      <div className="text-white font-medium text-sm">{user?.username}</div>
                      <div className="text-gray-400 text-xs">₺{user?.balance ? user.balance.toLocaleString() : '0'}</div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => {
                      setShowMobileMenu(false);
                      logout();
                    }}
                    className="w-full bg-red-500/20 hover:bg-red-500/30 text-red-400 font-medium py-2 rounded-lg text-sm transition-colors duration-200"
                  >
                    <i className="fas fa-sign-out-alt mr-2"></i>
                    Çıkış Yap
                  </button>
                </div>
              )}
            </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
      </header>
      
      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSwitchToRegister={openRegisterModal}
      />
      
      {/* Register Modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSwitchToLogin={openLoginModal}
      />
      
      {/* Profil Modal */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />
      
      {/* Para Yatırma Modalı */}
      <DepositModal
        isOpen={showDepositModal}
        onClose={() => setShowDepositModal(false)}
      />
      
      {/* Para Çekme Modalı */}
      <WithdrawalModal
        isOpen={showWithdrawalModal}
        onClose={() => setShowWithdrawalModal(false)}
      />
      
      {/* AI Chat Modal */}
      <ChatButton 
        isOpen={showChatModal}
        onToggle={() => setShowChatModal(!showChatModal)}
      />
    </>
  );
};

export default Header;
