import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';
import { X, UserRound, KeyRound, Eye, EyeOff, ShieldCheck, AlertCircle } from 'lucide-react';
import { FaSignInAlt, FaCheck } from 'react-icons/fa';
import { authApi, tokenService } from '@/lib/api';
import { getAuthMessage } from '@/utils/translations/authTranslations';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToRegister: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSwitchToRegister }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentLanguage } = useLanguage();
  const { login: userLogin } = useUser();
  const { toast } = useToast();

  // Form state
  const [loginForm, setLoginForm] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setLoginForm({ username: '', password: '', rememberMe: false });
      setShowPassword(false);
    }
  }, [isOpen]);

  // Set scroll lock when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Hata mesajını temizle
    setError(null);
    
    // Form doğrulama
    if (!loginForm.username || !loginForm.password) {
      setError(getAuthMessage('credentials_required', currentLanguage));
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // UserContext'in login fonksiyonunu kullan
      await userLogin(loginForm.username, loginForm.password, currentLanguage);
      
      // Remember me ayarı
      if (loginForm.rememberMe) {
        localStorage.setItem('remember_username', loginForm.username);
      } else {
        localStorage.removeItem('remember_username');
      }
      
      // Toast mesajı göster
      toast({
        title: "Giriş başarılı",
        description: `Hoş geldiniz ${loginForm.username}!`,
        variant: "default",
        duration: 2000,
        className: "bg-green-900 border border-green-500/40 text-white"
      });
      
      // Modalı kapat
      onClose();
      
    } catch (error: any) {
      console.error('Giriş hatası:', error);
      
      // API'den gelen hata mesajını kullan
      let errorMessage = getAuthMessage('login_error', currentLanguage);
      
      if (error?.response?.data?.error) {
        // Backend'den gelen hata mesajı (zaten çok dilli)
        errorMessage = error.response.data.error;
      } else if (error?.message) {
        // Genel hata mesajı
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      console.log('Hata mesajı set edildi:', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateLoginForm = (field: keyof typeof loginForm, value: any) => {
    setLoginForm(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 999999,
        backgroundColor: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(2px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
    >
      <div 
        style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}} 
        onClick={onClose}
      ></div>
      
      <div 
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '28rem',
          maxHeight: '95vh',
          overflowY: 'auto',
          zIndex: 999999
        }}
        className="bg-gradient-to-b from-[#1E1E1E] to-[#121212] rounded-xl border border-[#2A2A2A] shadow-2xl"
      >
        {/* Gold gradient top border */}
        <div className="w-full h-1 bg-gradient-to-r from-[#FFBA00] via-[#FFD700] to-[#FFBA00] rounded-t-xl"></div>
        
        {/* Close button */}
        <div className="flex justify-end p-4">
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal content */}
        <div className="px-4 pb-6">
          {/* Header with gradient background */}
          <div className="relative -mx-4 -mt-2 px-4 py-4 bg-gradient-to-r from-[#121212] via-[#222] to-[#121212] border-b border-[#2A2A2A] mb-6">
            <div className="flex items-center">
              <div className="flex items-center justify-center bg-[#FFD700] p-2 rounded-full mr-3 shadow-lg">
                <UserRound className="text-[#121212]" size={24} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {getAuthMessage('login_title', currentLanguage)}
              </h2>
            </div>
            
            <div className="mt-2 text-sm text-gray-400">
              {getAuthMessage('login_subtitle', currentLanguage)}
            </div>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-5">
            {/* Username input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-200">
                {getAuthMessage('username', currentLanguage)}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <UserRound size={18} className="text-[#FFD700] group-focus-within:text-white transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  value={loginForm.username}
                  onChange={e => updateLoginForm('username', e.target.value)}
                  className="block w-full pl-10 pr-3 py-4 md:py-3 bg-[#1A1A1A] border-2 border-[#333] focus:border-[#FFD700] rounded-lg focus:outline-none text-white placeholder-gray-500 transition-all duration-200 shadow-sm text-base"
                  placeholder={getAuthMessage('username_placeholder', currentLanguage)}
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                  spellCheck="false"
                  required
                />
                {/* Animasyonlu focus efekti */}
                <div className="absolute inset-0 border-2 border-[#FFD700] rounded-lg opacity-0 group-focus-within:opacity-20 -z-10 transition-opacity duration-200"></div>
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-200">
                {getAuthMessage('password', currentLanguage)}
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound size={18} className="text-[#FFD700] group-focus-within:text-white transition-colors duration-200" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={loginForm.password}
                  onChange={e => updateLoginForm('password', e.target.value)}
                  className="block w-full pl-10 pr-12 py-4 md:py-3 bg-[#1A1A1A] border-2 border-[#333] focus:border-[#FFD700] rounded-lg focus:outline-none text-white placeholder-gray-500 transition-all duration-200 shadow-sm text-base"
                  placeholder={getAuthMessage('password_placeholder', currentLanguage)}
                  autoComplete="current-password"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
                {/* Animasyonlu focus efekti */}
                <div className="absolute inset-0 border-2 border-[#FFD700] rounded-lg opacity-0 group-focus-within:opacity-20 -z-10 transition-opacity duration-200"></div>
              </div>
            </div>

            {/* Remember me and forgot password */}
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center">
                <div className="relative">
                  <input
                    id="remember-me"
                    type="checkbox"
                    checked={loginForm.rememberMe}
                    onChange={e => updateLoginForm('rememberMe', e.target.checked)}
                    className="h-4 w-4 opacity-0 absolute"
                  />
                  <div className={`w-5 h-5 border-2 ${loginForm.rememberMe ? 'bg-[#FFD700] border-[#FFD700]' : 'bg-[#1A1A1A] border-[#333]'} rounded flex items-center justify-center transition-all duration-200`}>
                    {loginForm.rememberMe && <FaCheck className="text-[#121212] text-xs" />}
                  </div>
                </div>
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300 cursor-pointer select-none">
                  {getAuthMessage('remember_me', currentLanguage)}
                </label>
              </div>
              <div className="text-sm">
                <a href="#" className="font-medium text-[#FFD700] hover:text-yellow-400 transition-colors">
                  {getAuthMessage('forgot_password', currentLanguage)}
                </a>
              </div>
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-sm text-red-400 flex items-start">
                <AlertCircle className="shrink-0 h-5 w-5 mr-2 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            {/* Login button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative w-full group overflow-hidden bg-gradient-to-r from-[#FFD700] to-[#FFBA00] text-[#121212] font-bold rounded-lg px-4 py-4 md:py-3.5 text-base md:text-sm transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 hover:scale-[1.02] active:scale-[0.98] mt-6 uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed touch-manipulation"
            >
              <span className="relative z-10 flex items-center justify-center">
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {getAuthMessage('processing', currentLanguage)}
                  </span>
                ) : (
                  <>
                    <FaSignInAlt className="mr-2" />
                    {getAuthMessage('login_button', currentLanguage)}
                  </>
                )}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#FFBA00] to-[#FFD700] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
            </button>
            
            {/* Güvenli giriş bildirimi */}
            <div className="text-center mt-4 text-xs text-gray-400 flex items-center justify-center">
              <ShieldCheck size={14} className="text-[#FFD700] mr-1.5" />
              {getAuthMessage('secure_login', currentLanguage)}
            </div>

            {/* Switch to register */}
            <div className="relative mt-7 pt-7 border-t border-[#333]">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#1A1A1A] px-4 text-gray-400 text-xs uppercase tracking-wider">
                {getAuthMessage('or_option', currentLanguage)}
              </div>
              <div className="text-center">
                <span className="text-gray-400 text-sm">
                  {getAuthMessage('need_account', currentLanguage)}
                </span>
                <button
                  type="button"
                  onClick={onSwitchToRegister}
                  className="ml-2 font-semibold text-[#FFD700] hover:text-yellow-400 transition-colors text-sm hover:underline"
                >
                  {getAuthMessage('create_account', currentLanguage)}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default LoginModal;