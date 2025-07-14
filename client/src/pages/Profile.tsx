import React, { useState } from 'react';
import { useUser } from '@/contexts/UserContext';
import { useLanguage } from '@/contexts/LanguageContext';
// Yeni dil sistemini kullan
import { translate } from '@/utils/i18n-fixed';
import MainLayout from '@/components/layout/MainLayout';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link } from 'wouter';

const ProfilePage: React.FC = () => {
  const { user, logout, refreshUser, updateProfile } = useUser();
  const { setLanguage } = useLanguage();
  
  if (!user) {
    return null;
  }
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('info');
  
  // Kullanıcı değerlerini formlarda tutmak için stateler
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Form değişikliklerini yönet
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Profil bilgilerini güncelle
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Yeni updateProfile fonksiyonunu kullanarak profil bilgilerini güncelleyelim
      await updateProfile({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone
      });
      
      // Kullanıcıya başarı mesajı göster
      alert(translate('profile.update_success') || 'Profiliniz başarıyla güncellendi');
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      alert(translate('profile.update_error') || 'Profil güncellenirken bir hata oluştu');
    }
  };

  // Şifre değiştirme
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    // API çağrısı yapılacak
    console.log('Şifre değiştirme:', {
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword
    });
  };
  
  // Çıkış yap
  const handleLogout = () => {
    if (logout) logout();
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
          <div className="text-center">
            <i className="fas fa-user-lock text-yellow-500 text-5xl mb-4"></i>
            <h1 className="text-2xl font-bold text-white mb-2">{translate('profile.login_required')}</h1>
            <p className="text-gray-400 mb-6">{translate('profile.login_message')}</p>
            <Link href="/">
              <button className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black px-6 py-3 rounded-lg font-bold text-sm">
                {translate('profile.return_home')}
              </button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="w-full bg-[#121212] min-h-screen pb-20 md:pb-0">
        {/* Profil Üst Bölüm - Gelişmiş UI */}
        <div className="bg-gradient-to-b from-[#1c1c1c] to-[#121212] border-b border-yellow-500/20 mb-6">
          {/* Arka Plan Şekilleri */}
          <div className="absolute top-16 right-0 w-40 h-40 bg-yellow-500/5 rounded-full blur-3xl"></div>
          <div className="absolute top-20 left-0 w-32 h-32 bg-yellow-500/5 rounded-full blur-3xl"></div>
          
          <div className="relative px-4 sm:px-6 pt-6 pb-8">
            {/* Üst Kısım - Avatar ve Kullanıcı Bilgileri */}
            <div className="flex items-center">
              <div className="mr-4">
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 p-0.5 shadow-lg">
                  <div className="absolute inset-0 rounded-full overflow-hidden">
                    <div className="w-full h-full bg-[#1c1c1c] flex items-center justify-center">
                      <span className="text-yellow-500 font-bold text-2xl">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                  </div>
                  {/* Seviye göstergesi */}
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-[#121212] rounded-full border-2 border-yellow-500 flex items-center justify-center">
                    <i className="fas fa-crown text-yellow-500 text-xs"></i>
                  </div>
                </div>
              </div>
              
              <div className="flex-1">
                <h1 className="text-xl font-bold text-white flex items-center">
                  {user.username}
                  <div className="ml-2 px-1.5 py-0.5 bg-yellow-500/10 rounded-md">
                    <span className="text-xs font-medium text-yellow-400">VIP {user.vipLevel || 0}</span>
                  </div>
                </h1>
                <p className="text-gray-400 text-sm">{user.email}</p>
                
                {/* Üyelik durumu */}
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 mr-1.5"></div>
                  <span className="text-xs text-green-400">{translate('profile.active_member')}</span>
                  <span className="mx-2 text-gray-500 text-xs">|</span>
                  <span className="text-xs text-gray-400">
                    <i className="far fa-calendar-alt mr-1"></i>
                    {translate('profile.member_since')}: {user.registrationDate ? new Date(user.registrationDate).toLocaleDateString('tr-TR') : '-'}
                  </span>
                </div>
              </div>
              
              {/* Para çekme ve yatırma butonları */}
              <div className="flex flex-col items-center">
                <div className="bg-[#1A1A1A] rounded-lg border border-yellow-500/20 shadow-md p-3 px-4 mb-2">
                  <div className="flex items-center">
                    <i className="fas fa-coins text-yellow-400 mr-2"></i>
                    <span className="text-yellow-400 font-bold">{user.balance?.toLocaleString() || '0'} ₺</span>
                  </div>
                </div>
                
                <div className="flex space-x-1">
                  <button className="bg-gradient-to-br from-green-500 to-green-600 text-white px-2 py-1 rounded-md text-xs font-medium shadow-sm flex items-center">
                    <i className="fas fa-plus-circle mr-1"></i>
                    {translate('profile.deposit')}
                  </button>
                  <button className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-black px-2 py-1 rounded-md text-xs font-medium shadow-sm flex items-center">
                    <i className="fas fa-arrow-alt-circle-down mr-1"></i>
                    {translate('profile.withdraw')}
                  </button>
                </div>
              </div>
            </div>
            
            {/* Özet İstatistikler */}
            <div className="mt-6 grid grid-cols-3 gap-2">
              <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-2 text-center">
                <div className="text-gray-400 text-xs mb-1">{translate('profile.total_bets')}</div>
                <div className="text-white font-bold">{(user.totalBets || 0).toLocaleString()} ₺</div>
              </div>
              <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-2 text-center">
                <div className="text-gray-400 text-xs mb-1">{translate('profile.total_wins')}</div>
                <div className="text-green-400 font-bold">{(user.totalWins || 0).toLocaleString()} ₺</div>
              </div>
              <div className="bg-[#1a1a1a] border border-[#333] rounded-lg p-2 text-center">
                <div className="text-gray-400 text-xs mb-1">{translate('profile.bonus_balance')}</div>
                <div className="text-yellow-400 font-bold">{(user.bonusBalance || 0).toLocaleString()} ₺</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* İçerik */}
        <div className="px-4 sm:px-6">
          {/* Sekmeler - Gelişmiş, Mobil Dostu Tasarım */}
          <div className="mb-6">
            {/* Sekmelerin Kategorilere Ayrılması */}
            <div className="grid grid-cols-5 gap-1 bg-[#1a1a1a] p-1 rounded-xl border border-[#333]">
              <button 
                onClick={() => setActiveTab('info')}
                className={`relative flex flex-col items-center justify-center py-3 rounded-lg text-xs font-medium transition-all duration-300 ${
                  activeTab === 'info' 
                    ? 'bg-gradient-to-b from-yellow-500 to-yellow-600 text-black' 
                    : 'text-gray-400 hover:bg-[#232323]'
                }`}
              >
                <div className={`w-7 h-7 flex items-center justify-center rounded-full mb-1 ${
                  activeTab === 'info' 
                    ? 'bg-black/20' 
                    : 'bg-[#232323]'
                }`}>
                  <i className={`fas fa-user ${activeTab === 'info' ? 'text-black' : 'text-yellow-400'}`}></i>
                </div>
                <span>{translate('profile.info')}</span>
                {activeTab === 'info' && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-black rounded-full"></div>}
              </button>
              
              <button 
                onClick={() => setActiveTab('bets')}
                className={`relative flex flex-col items-center justify-center py-3 rounded-lg text-xs font-medium transition-all duration-300 ${
                  activeTab === 'bets' 
                    ? 'bg-gradient-to-b from-yellow-500 to-yellow-600 text-black' 
                    : 'text-gray-400 hover:bg-[#232323]'
                }`}
              >
                <div className={`w-7 h-7 flex items-center justify-center rounded-full mb-1 ${
                  activeTab === 'bets' 
                    ? 'bg-black/20' 
                    : 'bg-[#232323]'
                }`}>
                  <i className={`fas fa-chart-line ${activeTab === 'bets' ? 'text-black' : 'text-yellow-400'}`}></i>
                </div>
                <span>{translate('profile.bets')}</span>
                {activeTab === 'bets' && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-black rounded-full"></div>}
              </button>
              
              <button 
                onClick={() => setActiveTab('transactions')}
                className={`relative flex flex-col items-center justify-center py-3 rounded-lg text-xs font-medium transition-all duration-300 ${
                  activeTab === 'transactions' 
                    ? 'bg-gradient-to-b from-yellow-500 to-yellow-600 text-black' 
                    : 'text-gray-400 hover:bg-[#232323]'
                }`}
              >
                <div className={`w-7 h-7 flex items-center justify-center rounded-full mb-1 ${
                  activeTab === 'transactions' 
                    ? 'bg-black/20' 
                    : 'bg-[#232323]'
                }`}>
                  <i className={`fas fa-exchange-alt ${activeTab === 'transactions' ? 'text-black' : 'text-yellow-400'}`}></i>
                </div>
                <span>{translate('profile.transactions')}</span>
                {activeTab === 'transactions' && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-black rounded-full"></div>}
              </button>
              
              <button 
                onClick={() => setActiveTab('bonuses')}
                className={`relative flex flex-col items-center justify-center py-3 rounded-lg text-xs font-medium transition-all duration-300 ${
                  activeTab === 'bonuses' 
                    ? 'bg-gradient-to-b from-yellow-500 to-yellow-600 text-black' 
                    : 'text-gray-400 hover:bg-[#232323]'
                }`}
              >
                <div className={`w-7 h-7 flex items-center justify-center rounded-full mb-1 ${
                  activeTab === 'bonuses' 
                    ? 'bg-black/20' 
                    : 'bg-[#232323]'
                }`}>
                  <i className={`fas fa-gift ${activeTab === 'bonuses' ? 'text-black' : 'text-yellow-400'}`}></i>
                </div>
                <span>{translate('profile.bonuses')}</span>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold">2</div>
                {activeTab === 'bonuses' && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-black rounded-full"></div>}
              </button>
              
              <button 
                onClick={() => setActiveTab('settings')}
                className={`relative flex flex-col items-center justify-center py-3 rounded-lg text-xs font-medium transition-all duration-300 ${
                  activeTab === 'settings' 
                    ? 'bg-gradient-to-b from-yellow-500 to-yellow-600 text-black' 
                    : 'text-gray-400 hover:bg-[#232323]'
                }`}
              >
                <div className={`w-7 h-7 flex items-center justify-center rounded-full mb-1 ${
                  activeTab === 'settings' 
                    ? 'bg-black/20' 
                    : 'bg-[#232323]'
                }`}>
                  <i className={`fas fa-cog ${activeTab === 'settings' ? 'text-black' : 'text-yellow-400'}`}></i>
                </div>
                <span>{translate('profile.settings')}</span>
                {activeTab === 'settings' && <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-black rounded-full"></div>}
              </button>
            </div>
          </div>
          
          {/* Sekme İçerikleri */}
          <div className="bg-[#1A1A1A] rounded-xl border border-yellow-500/20 p-4 sm:p-6">
            {/* Profil Bilgileri */}
            {activeTab === 'info' && (
              <div className="animate-fadeIn">
                <h2 className="text-lg font-bold text-white mb-4">{translate('profile.personal_info')}</h2>
                <form onSubmit={handleProfileUpdate}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-1 text-sm">{translate('auth.username')}</label>
                      <input 
                        type="text" 
                        value={user.username}
                        disabled
                        className="w-full bg-[#232323] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500 opacity-60"
                      />
                      <p className="text-xs text-gray-500 mt-1">{translate('profile.username_cannot_change')}</p>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-1 text-sm">{translate('profile.full_name')}</label>
                      <input 
                        type="text" 
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        className="w-full bg-[#232323] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-1 text-sm">{translate('profile.email')}</label>
                      <input 
                        type="email" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full bg-[#232323] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-1 text-sm">{translate('profile.phone')}</label>
                      <input 
                        type="tel" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="+90 (___) ___ __ __"
                        className="w-full bg-[#232323] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                    </div>
                    
                    <div className="mt-6">
                      <button 
                        type="submit"
                        className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black px-6 py-2 rounded-lg font-bold text-sm"
                      >
                        <i className="fas fa-save mr-2"></i>
                        {translate('profile.update_info')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {/* Şifre Değiştirme */}
            {activeTab === 'password' && (
              <div className="animate-fadeIn">
                <h2 className="text-lg font-bold text-white mb-4">{translate('profile.change_password_title')}</h2>
                <form onSubmit={handlePasswordChange}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-gray-300 mb-1 text-sm">{translate('profile.current_password')}</label>
                      <input 
                        type="password" 
                        name="oldPassword"
                        value={formData.oldPassword}
                        onChange={handleInputChange}
                        className="w-full bg-[#232323] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-1 text-sm">{translate('profile.new_password')}</label>
                      <input 
                        type="password" 
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full bg-[#232323] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                      <p className="text-xs text-gray-500 mt-1">{translate('profile.password_requirements')}</p>
                    </div>
                    
                    <div>
                      <label className="block text-gray-300 mb-1 text-sm">{translate('profile.confirm_password')}</label>
                      <input 
                        type="password" 
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full bg-[#232323] border border-[#333] rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                      />
                    </div>
                    
                    <div className="mt-6">
                      <button 
                        type="submit"
                        className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black px-6 py-2 rounded-lg font-bold text-sm"
                      >
                        <i className="fas fa-lock mr-2"></i>
                        {translate('profile.change_password_button')}
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            )}
            
            {/* Bahis Geçmişi */}
            {activeTab === 'bets' && (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">{translate('profile.bet_history')}</h2>
                  <div className="flex space-x-2">
                    <select className="bg-[#232323] text-sm text-gray-300 border border-[#333] rounded-lg px-2 py-1 focus:outline-none focus:border-yellow-500">
                      <option value="all">{translate('profile.all_dates')}</option>
                      <option value="today">{translate('profile.today')}</option>
                      <option value="week">{translate('profile.this_week')}</option>
                      <option value="month">{translate('profile.this_month')}</option>
                    </select>
                    <select className="bg-[#232323] text-sm text-gray-300 border border-[#333] rounded-lg px-2 py-1 focus:outline-none focus:border-yellow-500">
                      <option value="all">{translate('profile.all_games')}</option>
                      <option value="slots">{translate('profile.slot_games')}</option>
                      <option value="casino">{translate('profile.casino_games')}</option>
                    </select>
                  </div>
                </div>
                
                {/* Real betting data from database - integrated via ProfileModalFixed */}
                <div className="bg-[#232323] rounded-xl border border-[#333] p-4 text-center">
                  <i className="fas fa-info-circle text-blue-400 text-2xl mb-2"></i>
                  <p className="text-gray-300 text-sm">
                    {translate('profile.use_modal_for_bets') || 'Bahis geçmişinizi görüntülemek için profil modalını kullanın'}
                  </p>
                  <p className="text-gray-500 text-xs mt-1">
                    Tüm bahis verileri gerçek veritabanından gelir
                  </p>
                </div>
                
                {/* Desktop view shows same message - real data only in modal */}
                <div className="hidden sm:block">
                  <div className="bg-[#232323] rounded-xl border border-[#333] p-6 text-center">
                    <i className="fas fa-database text-green-400 text-3xl mb-3"></i>
                    <h3 className="text-white text-lg font-bold mb-2">Gerçek Veri Entegrasyonu</h3>
                    <p className="text-gray-300 text-sm mb-3">
                      Bahis geçmişiniz artık sadece gerçek veritabanı kayıtlarından gösteriliyor
                    </p>
                    <p className="text-gray-500 text-xs">
                      Profil modalında detaylı bahis geçmişinizi görüntüleyebilirsiniz
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {/* İşlemler */}
            {activeTab === 'transactions' && (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">İşlem Geçmişi</h2>
                  <div className="flex space-x-2">
                    <select className="bg-[#232323] text-sm text-gray-300 border border-[#333] rounded-lg px-2 py-1 focus:outline-none focus:border-yellow-500">
                      <option value="all">Tüm İşlemler</option>
                      <option value="deposit">Para Yatırma</option>
                      <option value="withdraw">Para Çekme</option>
                      <option value="bonus">Bonus</option>
                    </select>
                  </div>
                </div>
                
                {/* İşlem özeti kutuları - mobil ve masaüstü */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="bg-[#232323] rounded-lg border border-[#333] p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">{translate('profile.total_deposit')}</div>
                    <div className="text-green-400 font-bold">12,500 ₺</div>
                  </div>
                  <div className="bg-[#232323] rounded-lg border border-[#333] p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">{translate('profile.total_withdrawal')}</div>
                    <div className="text-red-400 font-bold">8,200 ₺</div>
                  </div>
                  <div className="bg-[#232323] rounded-lg border border-[#333] p-3 text-center">
                    <div className="text-xs text-gray-400 mb-1">{translate('profile.bonus_earnings')}</div>
                    <div className="text-yellow-400 font-bold">1,750 ₺</div>
                  </div>
                </div>
                
                {/* Mobil görünüm için kart tabanlı tasarım */}
                <div className="sm:hidden space-y-3">
                  {/* Para Yatırma İşlemi */}
                  <div className="bg-[#232323] rounded-xl border border-[#333] p-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full blur-xl"></div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-green-900/20 flex items-center justify-center mr-2">
                          <i className="fas fa-arrow-down text-green-400"></i>
                        </div>
                        <div>
                          <div className="text-white font-medium">Para Yatırma</div>
                          <div className="text-xs text-gray-400">18.05.2025 • 14:22</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-green-400 font-bold">+500 ₺</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-2 border-t border-[#333] grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-gray-400">Yöntem</div>
                        <div className="text-sm text-white flex items-center">
                          <img src="https://cryptonbets.com/papara-icon.png" alt="Papara" className="w-4 h-4 mr-1" />
                          Papara
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Durum</div>
                        <div className="text-sm">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-900/20 text-green-400">
                            <i className="fas fa-check-circle mr-1"></i> Tamamlandı
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <a href="#" className="block w-full text-center text-xs text-yellow-500 mt-3 pt-2 border-t border-[#333]">
                      İşlem Detayları
                    </a>
                  </div>
                  
                  {/* Para Çekme İşlemi */}
                  <div className="bg-[#232323] rounded-xl border border-[#333] p-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-red-500/5 rounded-full blur-xl"></div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-red-900/20 flex items-center justify-center mr-2">
                          <i className="fas fa-arrow-up text-red-400"></i>
                        </div>
                        <div>
                          <div className="text-white font-medium">Para Çekme</div>
                          <div className="text-xs text-gray-400">16.05.2025 • 18:45</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-red-400 font-bold">-1000 ₺</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-2 border-t border-[#333] grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-gray-400">Yöntem</div>
                        <div className="text-sm text-white flex items-center">
                          <i className="fas fa-university text-blue-400 mr-1"></i>
                          Havale
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Durum</div>
                        <div className="text-sm">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-900/20 text-blue-400">
                            <i className="fas fa-clock mr-1"></i> İşlemde
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <a href="#" className="block w-full text-center text-xs text-yellow-500 mt-3 pt-2 border-t border-[#333]">
                      İşlem Detayları
                    </a>
                  </div>
                  
                  {/* Kripto Para Yatırma İşlemi */}
                  <div className="bg-[#232323] rounded-xl border border-[#333] p-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-green-500/5 rounded-full blur-xl"></div>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-lg bg-blue-900/20 flex items-center justify-center mr-2">
                          <i className="fab fa-bitcoin text-yellow-400"></i>
                        </div>
                        <div>
                          <div className="text-white font-medium">Kripto Yatırma</div>
                          <div className="text-xs text-gray-400">15.05.2025 • 09:18</div>
                        </div>
                      </div>
                      <div>
                        <div className="text-green-400 font-bold">+200 ₺</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-2 border-t border-[#333] grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-xs text-gray-400">Yöntem</div>
                        <div className="text-sm text-white flex items-center">
                          <i className="fab fa-bitcoin text-yellow-400 mr-1"></i>
                          Bitcoin
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-400">Durum</div>
                        <div className="text-sm">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-900/20 text-green-400">
                            <i className="fas fa-check-circle mr-1"></i> Tamamlandı
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-2 border-t border-[#333] text-xs text-gray-400">
                      <div className="truncate">İşlem ID: <span className="text-gray-300">38f9d2e5c7a0b1f6...</span></div>
                    </div>
                    
                    <a href="#" className="block w-full text-center text-xs text-yellow-500 mt-3 pt-2 border-t border-[#333]">
                      İşlem Detayları
                    </a>
                  </div>
                  
                  <button className="w-full bg-[#1D1D1D] text-gray-300 hover:bg-[#2a2a2a] hover:text-white p-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center">
                    <i className="fas fa-sync-alt mr-2"></i>
                    Daha Fazla İşlem Göster
                  </button>
                </div>
                
                {/* Tablet ve üstü görünüm için tablo tasarımı */}
                <div className="hidden sm:block overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-[#232323] border-b border-[#333]">
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tarih</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">İşlem Tipi</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tutar</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Yöntem</th>
                        <th className="py-3 px-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Durum</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#333]">
                      <tr className="hover:bg-[#232323] transition-colors duration-200">
                        <td className="py-3 px-4 text-sm text-gray-200">18.05.2025</td>
                        <td className="py-3 px-4 text-sm text-green-400">Para Yatırma</td>
                        <td className="py-3 px-4 text-sm text-gray-200">500 ₺</td>
                        <td className="py-3 px-4 text-sm text-gray-200">Papara</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-900/20 text-green-400">
                            <i className="fas fa-check-circle mr-1"></i> Tamamlandı
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-[#232323] transition-colors duration-200">
                        <td className="py-3 px-4 text-sm text-gray-200">16.05.2025</td>
                        <td className="py-3 px-4 text-sm text-red-400">Para Çekme</td>
                        <td className="py-3 px-4 text-sm text-gray-200">1000 ₺</td>
                        <td className="py-3 px-4 text-sm text-gray-200">Havale</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-900/20 text-blue-400">
                            <i className="fas fa-clock mr-1"></i> İşlemde
                          </span>
                        </td>
                      </tr>
                      <tr className="hover:bg-[#232323] transition-colors duration-200">
                        <td className="py-3 px-4 text-sm text-gray-200">15.05.2025</td>
                        <td className="py-3 px-4 text-sm text-green-400">Para Yatırma</td>
                        <td className="py-3 px-4 text-sm text-gray-200">200 ₺</td>
                        <td className="py-3 px-4 text-sm text-gray-200">Bitcoin</td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-900/20 text-green-400">
                            <i className="fas fa-check-circle mr-1"></i> Tamamlandı
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <div className="mt-4 flex justify-center">
                    <button className="bg-[#232323] text-gray-300 hover:bg-[#2a2a2a] hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                      Daha Fazla Göster
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            {/* Bonuslarım */}
            {activeTab === 'bonuses' && (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">Bonuslarım</h2>
                  <button className="bg-gradient-to-br from-yellow-400 to-yellow-600 text-black px-3 py-1.5 rounded-lg text-xs font-bold shadow-md flex items-center">
                    <i className="fas fa-plus-circle mr-1.5"></i>
                    Bonus Talep Et
                  </button>
                </div>
                
                {/* Bonus Özeti - Kartlar veya Grafikler */}
                <div className="bg-[#1D1D1D] rounded-xl border border-[#333] p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-yellow-500/20 rounded-full flex items-center justify-center mr-2">
                        <i className="fas fa-trophy text-yellow-400"></i>
                      </div>
                      <div>
                        <h3 className="text-white text-sm font-medium">Bonus Durumu</h3>
                        <p className="text-xs text-gray-400">Mevcut bonuslar ve çevrim durumu</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-yellow-400 font-bold">600 ₺</div>
                      <div className="text-xs text-gray-400">Toplam bonus değeri</div>
                    </div>
                  </div>
                  
                  {/* Bonus Çevrim Durumu - Grafik */}
                  <div className="mt-2 pt-2 border-t border-[#333]">
                    <div className="flex justify-between items-center text-xs mb-1">
                      <span className="text-gray-400">Çevrim İlerleme Durumu</span>
                      <span className="text-white">16,500 / 25,000 ₺</span>
                    </div>
                    <div className="w-full bg-[#333] h-2 rounded-full overflow-hidden">
                      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full rounded-full" style={{ width: '66%' }}></div>
                    </div>
                    <div className="text-xs text-gray-400 text-center mt-1">
                      <span className="text-green-400">%66</span> tamamlandı • Yaklaşık <span className="text-yellow-400">8,500 ₺</span> daha çevrim yapmanız gerekiyor
                    </div>
                  </div>
                </div>
                
                {/* Aktif Bonuslar - Mobil için liste görünümü */}
                <div className="sm:hidden">
                  <h3 className="text-white text-sm font-bold mb-2 flex items-center">
                    <i className="fas fa-star-half-alt text-yellow-400 mr-2"></i>
                    Aktif Bonuslar
                  </h3>
                  
                  {/* Hoşgeldin Bonusu - Kart */}
                  <div className="bg-[#232323] rounded-xl border border-[#333] p-3 mb-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl"></div>
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                        <i className="fas fa-gift text-yellow-400 text-lg"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-white font-bold text-sm">Hoşgeldin Bonusu</h3>
                          <span className="text-yellow-400 text-sm font-bold">500 ₺</span>
                        </div>
                        <p className="text-gray-400 text-xs">İlk yatırımınıza özel %100 bonus</p>
                        
                        <div className="mt-2 w-full bg-[#333] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <div className="mt-1 flex justify-between text-xs">
                          <span className="text-gray-400">Çevrim: <span className="text-green-400">%75</span></span>
                          <span className="text-gray-400">Son: <span className="text-white">22.05.2025</span></span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-[#333] flex justify-between items-center">
                      <span className="text-xs text-gray-400">15,000 / 20,000 ₺</span>
                      <button className="text-xs text-yellow-500">Detaylar</button>
                    </div>
                  </div>
                  
                  {/* Kayıp Bonusu - Kart */}
                  <div className="bg-[#232323] rounded-xl border border-[#333] p-3 mb-3 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                        <i className="fas fa-undo text-green-400 text-lg"></i>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between">
                          <h3 className="text-white font-bold text-sm">Kayıp Bonusu</h3>
                          <span className="text-green-400 text-sm font-bold">100 ₺</span>
                        </div>
                        <p className="text-gray-400 text-xs">Haftalık %20 kayıp bonusu</p>
                        
                        <div className="mt-2 w-full bg-[#333] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full" style={{ width: '30%' }}></div>
                        </div>
                        <div className="mt-1 flex justify-between text-xs">
                          <span className="text-gray-400">Çevrim: <span className="text-green-400">%30</span></span>
                          <span className="text-gray-400">Son: <span className="text-white">20.05.2025</span></span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 pt-2 border-t border-[#333] flex justify-between items-center">
                      <span className="text-xs text-gray-400">1,500 / 5,000 ₺</span>
                      <button className="text-xs text-yellow-500">Detaylar</button>
                    </div>
                  </div>
                </div>
                
                {/* Tablet ve masaüstü için grid görünümü */}
                <div className="hidden sm:grid sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-r from-[#232323] to-[#1D1D1D] p-4 rounded-xl border border-yellow-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/10 rounded-full blur-2xl"></div>
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                        <i className="fas fa-gift text-yellow-400 text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-sm">Hoşgeldin Bonusu</h3>
                        <p className="text-gray-400 text-xs mb-2">İlk yatırımınıza özel %100 bonus</p>
                        <div className="flex items-center justify-between">
                          <span className="text-yellow-400 text-sm font-bold">500 ₺</span>
                          <span className="text-xs text-gray-400">22.05.2025 tarihinde sona erecek</span>
                        </div>
                        <div className="mt-2 w-full bg-[#333] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-full rounded-full" style={{ width: '75%' }}></div>
                        </div>
                        <div className="mt-1 flex justify-between text-xs">
                          <span className="text-gray-400">Çevrim: %75</span>
                          <span className="text-gray-300">15,000/20,000 ₺</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-[#232323] to-[#1D1D1D] p-4 rounded-xl border border-yellow-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/10 rounded-full blur-2xl"></div>
                    <div className="flex items-start gap-3">
                      <div className="shrink-0 w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                        <i className="fas fa-undo text-green-400 text-xl"></i>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-bold text-sm">Kayıp Bonusu</h3>
                        <p className="text-gray-400 text-xs mb-2">Haftalık %20 kayıp bonusu</p>
                        <div className="flex items-center justify-between">
                          <span className="text-green-400 text-sm font-bold">100 ₺</span>
                          <span className="text-xs text-gray-400">20.05.2025 tarihinde sona erecek</span>
                        </div>
                        <div className="mt-2 w-full bg-[#333] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-green-400 to-green-600 h-full rounded-full" style={{ width: '30%' }}></div>
                        </div>
                        <div className="mt-1 flex justify-between text-xs">
                          <span className="text-gray-400">Çevrim: %30</span>
                          <span className="text-gray-300">1,500/5,000 ₺</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Yaklaşan ve Kullanılabilir Bonuslar */}
                <div className="mt-4">
                  <h3 className="text-white text-sm font-bold mb-2 flex items-center">
                    <i className="fas fa-calendar-alt text-blue-400 mr-2"></i>
                    Kullanılabilir Bonuslar
                  </h3>
                  
                  <div className="space-y-2">
                    {/* Doğum Günü Bonusu */}
                    <div className="bg-[#232323] p-3 rounded-xl border border-[#333] hover:border-yellow-500/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center mr-2">
                            <i className="fas fa-birthday-cake text-blue-400"></i>
                          </div>
                          <div>
                            <h4 className="text-white font-medium text-sm">Doğum Günü Bonusu</h4>
                            <p className="text-gray-400 text-xs">Doğum gününüzde özel %50 bonus <span className="text-yellow-400">26.07.2025</span></p>
                          </div>
                        </div>
                        <button className="bg-[#333] hover:bg-[#444] text-gray-300 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                          Detaylar
                        </button>
                      </div>
                    </div>
                    
                    {/* Arkadaş Bonusu */}
                    <div className="bg-[#232323] p-3 rounded-xl border border-[#333] hover:border-yellow-500/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center mr-2">
                            <i className="fas fa-user-friends text-purple-400"></i>
                          </div>
                          <div>
                            <h4 className="text-white font-medium text-sm">Arkadaş Davet Bonusu</h4>
                            <p className="text-gray-400 text-xs">Arkadaşınızı davet edin, %25 bonus kazanın</p>
                          </div>
                        </div>
                        <button className="bg-gradient-to-br from-purple-400 to-purple-600 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">
                          Davet Et
                        </button>
                      </div>
                    </div>
                    
                    {/* Sadakat Bonusu */}
                    <div className="bg-[#232323] p-3 rounded-xl border border-[#333] hover:border-yellow-500/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center mr-2">
                            <i className="fas fa-heart text-red-400"></i>
                          </div>
                          <div>
                            <h4 className="text-white font-medium text-sm">VIP Sadakat Bonusu</h4>
                            <p className="text-gray-400 text-xs">VIP seviyenizi yükseltin, özel bonuslar kazanın</p>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <div className="text-xs px-2 py-0.5 bg-yellow-500/10 rounded text-yellow-400 flex items-center">
                            <i className="fas fa-crown mr-1 text-yellow-400 text-[10px]"></i>
                            VIP 2
                          </div>
                          <button className="bg-[#333] hover:bg-[#444] text-gray-300 px-2 py-1 rounded-lg text-xs transition-colors">
                            Bilgi
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Ayarlar */}
            {activeTab === 'settings' && (
              <div className="animate-fadeIn">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">{translate('profile.account_settings')}</h2>
                  <div className="text-xs px-2 py-1 bg-yellow-500/10 rounded text-yellow-400 flex items-center">
                    <i className="fas fa-crown mr-1 text-yellow-400"></i>
                    VIP 2
                  </div>
                </div>
                
                {/* Mobil için Quick Settings Links */}
                <div className="sm:hidden mb-4">
                  <div className="grid grid-cols-3 gap-2">
                    <button className="flex flex-col items-center justify-center bg-[#232323] p-3 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center mb-1">
                        <i className="fas fa-lock text-blue-400"></i>
                      </div>
                      <span className="text-white text-xs">{translate('profile.password')}</span>
                    </button>
                    <button className="flex flex-col items-center justify-center bg-[#232323] p-3 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center mb-1">
                        <i className="fas fa-bell text-green-400"></i>
                      </div>
                      <span className="text-white text-xs">{translate('profile.notifications')}</span>
                    </button>
                    <button className="flex flex-col items-center justify-center bg-[#232323] p-3 rounded-lg">
                      <div className="w-8 h-8 rounded-full bg-red-500/20 flex items-center justify-center mb-1">
                        <i className="fas fa-shield-alt text-red-400"></i>
                      </div>
                      <span className="text-white text-xs">{translate('profile.security')}</span>
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  {/* Profil Bilgileri Özeti - Mobil için */}
                  <div className="sm:hidden bg-[#232323] p-4 rounded-xl border border-[#333]">
                    <div className="flex items-center">
                      <div className="w-14 h-14 rounded-full bg-yellow-500/10 flex items-center justify-center overflow-hidden mr-3">
                        <span className="text-yellow-400 text-2xl">
                          <i className="fas fa-user"></i>
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-bold">{user.username}</div>
                        <div className="text-gray-400 text-xs flex items-center mt-0.5">
                          <i className="fas fa-envelope text-gray-500 mr-1"></i>
                          {user.email || 'E-posta eklenmemiş'}
                        </div>
                        <div className="text-gray-400 text-xs flex items-center mt-0.5">
                          <i className="fas fa-phone text-gray-500 mr-1"></i>
                          {user.phone || 'Telefon eklenmemiş'}
                        </div>
                      </div>
                    </div>
                    <button className="w-full bg-[#1A1A1A] hover:bg-[#2a2a2a] text-white mt-3 p-2 rounded text-sm flex items-center justify-center">
                      <i className="fas fa-edit mr-1.5"></i>
                      Profili Düzenle
                    </button>
                  </div>
                  
                  {/* Şifre Değiştir */}
                  <div className="bg-[#232323] p-4 rounded-xl border border-[#333]">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-bold text-sm flex items-center">
                        <i className="fas fa-lock text-yellow-400 mr-2"></i>
                        Şifre Değiştir
                      </h3>
                      <span className="text-xs text-gray-400">Son değişim: 15.04.2025</span>
                    </div>
                    <form className="space-y-3" onSubmit={handlePasswordChange}>
                      <div>
                        <label className="block text-gray-300 mb-1 text-xs">Mevcut Şifre</label>
                        <div className="relative">
                          <input 
                            type="password" 
                            name="oldPassword"
                            value={formData.oldPassword}
                            onChange={handleInputChange}
                            className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg pl-3 pr-10 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                            placeholder="••••••••"
                          />
                          <button type="button" className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-white">
                            <i className="fas fa-eye"></i>
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-1 text-xs">Yeni Şifre</label>
                        <div className="relative">
                          <input 
                            type="password" 
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleInputChange}
                            className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg pl-3 pr-10 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                            placeholder="••••••••"
                          />
                          <button type="button" className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-white">
                            <i className="fas fa-eye"></i>
                          </button>
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center">
                          <i className="fas fa-info-circle mr-1"></i>
                          En az 8 karakter, 1 büyük harf ve 1 rakam içermelidir
                        </div>
                      </div>
                      <div>
                        <label className="block text-gray-300 mb-1 text-xs">Yeni Şifre Tekrar</label>
                        <div className="relative">
                          <input 
                            type="password" 
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            className="w-full bg-[#1A1A1A] border border-[#333] rounded-lg pl-3 pr-10 py-2 text-white focus:outline-none focus:ring-1 focus:ring-yellow-500"
                            placeholder="••••••••"
                          />
                          <button type="button" className="absolute inset-y-0 right-0 px-3 text-gray-400 hover:text-white">
                            <i className="fas fa-eye"></i>
                          </button>
                        </div>
                      </div>
                      
                      {/* Password Strength Indicator */}
                      <div className="bg-[#1A1A1A] p-2 rounded-lg border border-[#333]">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-gray-400">Şifre Gücü</span>
                          <span className="text-green-400">Güçlü</span>
                        </div>
                        <div className="w-full bg-[#333] h-1.5 rounded-full overflow-hidden">
                          <div className="bg-gradient-to-r from-red-500 via-yellow-400 to-green-500 h-full rounded-full" style={{ width: '75%' }}></div>
                        </div>
                      </div>
                      
                      <button 
                        type="submit" 
                        className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 text-black font-medium py-2 px-4 rounded-lg transition-colors"
                      >
                        Şifreyi Güncelle
                      </button>
                    </form>
                  </div>
                  
                  {/* Dil Ayarları */}
                  <div className="bg-[#232323] p-4 rounded-xl border border-[#333]">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-white font-bold text-sm flex items-center">
                        <i className="fas fa-globe text-blue-400 mr-2"></i>
{translate('profile.languageSettings')}
                      </h3>
                      <div className="text-xs text-white px-2 py-0.5 bg-yellow-500/20 rounded-full">
{translate('profile.selectedLanguage')}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      <button 
                        className="flex items-center justify-center gap-2 bg-[#1A1A1A] border border-yellow-500 p-2 rounded-lg"
                        onClick={() => setLanguage('tr')}
                      >
                        <img src="/flags/tr.svg" alt="Türkçe" className="w-5 h-5" />
                        <span className="text-white text-sm">{translate('profile.turkish')}</span>
                      </button>
                      <button 
                        className="flex items-center justify-center gap-2 bg-[#1A1A1A] border border-[#333] p-2 rounded-lg hover:border-yellow-500/50"
                        onClick={() => setLanguage('en')}
                      >
                        <img src="/flags/gb.svg" alt="English" className="w-5 h-5" />
                        <span className="text-white text-sm">English</span>
                      </button>
                      <button 
                        className="flex items-center justify-center gap-2 bg-[#1A1A1A] border border-[#333] p-2 rounded-lg hover:border-yellow-500/50"
                        onClick={() => setLanguage('en')}
                      >
                        <img src="/flags/ge.svg" alt="Georgian" className="w-5 h-5" />
                        <span className="text-white text-sm">ქართული</span>
                      </button>
                      <button 
                        className="flex items-center justify-center gap-2 bg-[#1A1A1A] border border-[#333] p-2 rounded-lg hover:border-yellow-500/50"
                        onClick={() => setLanguage('en')}
                      >
                        <img src="/flags/ru.svg" alt="Russian" className="w-5 h-5" />
                        <span className="text-white text-sm">Русский</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Bildirim Ayarları */}
                  <div className="bg-[#232323] p-4 rounded-xl border border-[#333]">
                    <h3 className="text-white font-bold text-sm mb-3 flex items-center">
                      <i className="fas fa-bell text-green-400 mr-2"></i>
                      Bildirim Ayarları
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-white text-sm">E-posta Bildirimleri</label>
                          <p className="text-gray-400 text-xs">Özel teklifler ve güncellemeler</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-[#1A1A1A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-yellow-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2A2A2A]"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-white text-sm">SMS Bildirimleri</label>
                          <p className="text-gray-400 text-xs">Bonus ve promosyon bildirimleri</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-[#1A1A1A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-yellow-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2A2A2A]"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-white text-sm">Özel Teklif Bildirimleri</label>
                          <p className="text-gray-400 text-xs">Size özel hazırlanan bonuslar</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked className="sr-only peer" />
                          <div className="w-11 h-6 bg-[#1A1A1A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-yellow-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2A2A2A]"></div>
                        </label>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-white text-sm">WhatsApp Bildirimleri</label>
                          <p className="text-gray-400 text-xs">Kampanya duyuruları ve iletişim</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" className="sr-only peer" />
                          <div className="w-11 h-6 bg-[#1A1A1A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-gray-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2A2A2A] peer-checked:after:bg-yellow-400"></div>
                        </label>
                      </div>
                    </div>
                  </div>
                  
                  {/* Güvenlik Ayarları - Mobil için daha detaylı */}
                  <div className="bg-[#232323] p-4 rounded-xl border border-[#333]">
                    <h3 className="text-white font-bold text-sm mb-3 flex items-center">
                      <i className="fas fa-shield-alt text-red-400 mr-2"></i>
                      Güvenlik Ayarları
                    </h3>
                    
                    <div className="space-y-3">
                      {/* İki Faktörlü Doğrulama */}
                      <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#333]">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white text-sm flex items-center">
                              <i className="fas fa-mobile-alt text-blue-400 mr-1.5"></i>
                              İki Faktörlü Doğrulama
                            </div>
                            <p className="text-gray-400 text-xs mt-0.5">Hesabınıza ekstra güvenlik ekleyin</p>
                          </div>
                          <button className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-3 py-1 rounded text-xs">
                            Aktifleştir
                          </button>
                        </div>
                      </div>
                      
                      {/* Güvenlik Doğrulaması */}
                      <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#333]">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white text-sm flex items-center">
                              <i className="fas fa-envelope text-green-400 mr-1.5"></i>
                              E-posta Doğrulaması
                            </div>
                            <p className="text-gray-400 text-xs mt-0.5">Doğrulanmış e-posta ile güvenliği artırın</p>
                          </div>
                          <span className="text-xs bg-green-500/10 text-green-400 px-2 py-0.5 rounded">
                            Doğrulandı
                          </span>
                        </div>
                      </div>
                      
                      {/* Cihaz Yönetimi */}
                      <div className="bg-[#1A1A1A] p-3 rounded-lg border border-[#333]">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-white text-sm flex items-center">
                              <i className="fas fa-laptop text-purple-400 mr-1.5"></i>
                              Cihaz Yönetimi
                            </div>
                            <p className="text-gray-400 text-xs mt-0.5">Aktif cihazlarınızı görüntüleyin ve yönetin</p>
                          </div>
                          <button className="text-xs bg-[#2A2A2A] hover:bg-[#333] text-gray-300 px-2 py-1 rounded transition-colors">
                            Görüntüle
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Oturum Ayarları */}
                  <div className="bg-[#232323] p-4 rounded-xl border border-[#333]">
                    <h3 className="text-white font-bold text-sm mb-3 flex items-center">
                      <i className="fas fa-sign-out-alt text-yellow-400 mr-2"></i>
                      Oturum Ayarları
                    </h3>
                    <div className="space-y-3">
                      <div className="bg-[#1A1A1A] p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <div className="text-white text-sm">Son Giriş Tarihi</div>
                          <div className="text-gray-400 text-xs">18.05.2025, 14:22 • iPhone 13</div>
                        </div>
                        <div className="text-xs bg-[#2A2A2A] px-2 py-0.5 rounded text-gray-300">
                          İstanbul, TR
                        </div>
                      </div>
                      
                      <button className="flex items-center justify-between w-full bg-[#1A1A1A] hover:bg-[#222] text-white p-3 rounded-lg transition-colors">
                        <span className="flex items-center">
                          <i className="fas fa-sign-out-alt text-red-500 mr-2"></i>
                          <span>Tüm Cihazlardan Çıkış Yap</span>
                        </span>
                        <i className="fas fa-chevron-right text-gray-500"></i>
                      </button>
                      <div className="pt-2 border-t border-[#333] flex items-center justify-center">
                        <button 
                          className="text-red-500 hover:text-red-400 text-sm flex items-center"
                          onClick={handleLogout}
                        >
                          <i className="fas fa-power-off mr-1.5"></i>
                          Bu Cihazdan Çıkış Yap
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Profil Altı Butonlar - Çıkış Yap */}
            <div className="mt-8 pt-6 border-t border-[#333]">
              <button 
                onClick={handleLogout}
                className="bg-[#232323] hover:bg-red-900/10 text-red-400 hover:text-red-300 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center"
              >
                <i className="fas fa-sign-out-alt mr-2"></i>
                Çıkış Yap
              </button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;