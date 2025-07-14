import React, { useState } from "react";
import { Link, useLocation } from "wouter";
import { translate } from '@/utils/i18n-fixed';
import ChatButton from "@/components/chat/ChatButton";

const Sidebar: React.FC = () => {
  const [location] = useLocation();
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);
  const [showChatModal, setShowChatModal] = useState(false);
  
  const toggleGroup = (group: string) => {
    if (expandedGroup === group) {
      setExpandedGroup(null);
    } else {
      setExpandedGroup(group);
    }
  };
  
  const isActive = (path: string) => location === path;
  
  // Navigation menu items
  const navItems = [
    { path: "/", icon: "fa-home", label: "sidebar.home" },
    { path: "/slot", icon: "fa-rocket", label: "sidebar.slot" },
    { path: "/casino", icon: "fa-coins", label: "sidebar.casino" },
    { path: "/oyunlar", icon: "fa-gamepad", label: "sidebar.games" },
    { path: "/vip", icon: "fa-crown", label: "sidebar.vip" },
    { path: "/bonuslar", icon: "fa-gift", label: "sidebar.bonuses" }
  ];
  
  return (
    <aside className="hidden md:flex w-14 lg:w-20 bg-[#121212] flex-col items-center py-4 fixed h-full left-0 top-0 z-30 border-r border-yellow-500/20">
      {/* Logo */}
      <div className="w-12 lg:w-16 h-12 lg:h-16 mb-4 flex items-center justify-center">
        <Link href="/">
          <div className="w-full h-full flex items-center justify-center cursor-pointer relative group">
            <div className="absolute w-12 lg:w-16 h-12 lg:h-16 bg-yellow-500/10 rounded-full filter blur-md opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div className="relative w-10 lg:w-12 h-10 lg:h-12">
              {/* Elmas ikonu */}
              <div className="absolute inset-0 flex items-center justify-center">
                <i className="fas fa-gem text-yellow-400 text-3xl lg:text-4xl transform rotate-6 drop-shadow-[0_0_4px_rgba(255,215,0,0.8)] group-hover:text-yellow-300 transition-all duration-300"></i>
              </div>
            </div>
          </div>
        </Link>
      </div>
      
      {/* Navigation Items */}
      <nav className="flex flex-col items-center space-y-2.5 lg:space-y-3 w-full px-1 lg:px-2">
        {navItems.map((item) => (
          <div key={item.path} className="w-full">
            <Link href={item.path}>
              <div className="sidebar-item flex flex-col items-center group w-full relative cursor-pointer">
                <div className={`sidebar-icon w-8 lg:w-10 h-8 lg:h-10 flex items-center justify-center ${
                  isActive(item.path) 
                    ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 shadow-[0_0_8px_rgba(255,215,0,0.5)]' 
                    : 'bg-[#1D1D1D] group-hover:bg-[#222] group-hover:shadow-[0_0_4px_rgba(255,215,0,0.2)]'
                } rounded-lg mb-1 transition-all duration-300 transform group-hover:scale-105`}>
                  <i className={`fas ${item.icon} ${isActive(item.path) ? 'text-[#121212]' : 'text-gray-300 group-hover:text-yellow-300'} text-sm`}></i>
                </div>
                <span className="text-[9px] lg:text-[10px] text-gray-300 uppercase font-medium group-hover:text-yellow-400 transition-colors duration-200">{translate(item.label, item.label)}</span>
                {isActive(item.path) && (
                  <>
                    <div className="absolute -left-1 h-full w-1 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-r-md"></div>
                    <div className="absolute -right-1 h-6 w-1 bg-gradient-to-b from-yellow-400 to-yellow-600 rounded-l-md"></div>
                  </>
                )}
              </div>
            </Link>
          </div>
        ))}
      </nav>
      
      {/* Footer Buttons */}
      <div className="mt-auto flex flex-col items-center space-y-2.5 pt-3">
        {/* WhatsApp */}
        <a href="https://wa.me/905000000000" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center group">
          <div className="w-8 lg:w-10 h-8 lg:h-10 flex items-center justify-center bg-gradient-to-br from-green-500 to-green-600 rounded-lg mb-1 relative shadow-md transform transition-all duration-300 group-hover:scale-105 group-hover:shadow-[0_0_8px_rgba(34,197,94,0.5)]">
            <i className="fab fa-whatsapp text-white text-sm"></i>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-green-400 to-green-600 rounded-lg blur opacity-0 group-hover:opacity-40 transition-opacity duration-300"></div>
          </div>
          <span className="text-[9px] lg:text-[10px] text-gray-300 uppercase font-medium group-hover:text-green-400 transition-colors duration-200">{translate('sidebar.whatsapp', 'WhatsApp')}</span>
        </a>
        
        {/* Yardım */}
        <button 
          onClick={() => setShowChatModal(true)}
          className="flex flex-col items-center group"
        >
          <div className="w-8 lg:w-10 h-8 lg:h-10 flex items-center justify-center bg-[#1D1D1D] group-hover:bg-[#222] rounded-lg mb-1 transition-all duration-300 shadow-md transform group-hover:scale-105 group-hover:shadow-[0_0_6px_rgba(255,215,0,0.2)]">
            <i className="fas fa-headset text-gray-300 group-hover:text-yellow-400 text-sm transition-colors duration-200"></i>
          </div>
          <span className="text-[9px] lg:text-[10px] text-gray-300 uppercase font-medium group-hover:text-yellow-400 transition-colors duration-200">{translate('sidebar.help', 'Yardım')}</span>
        </button>
      </div>
      
      {/* Chat Modal */}
      {showChatModal && (
        <ChatButton 
          isOpen={true} 
          onClose={() => setShowChatModal(false)} 
        />
      )}
    </aside>
  );
};

export default Sidebar;
