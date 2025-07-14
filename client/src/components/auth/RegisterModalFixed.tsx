import React, { useState, useEffect } from 'react';
import { X, User, KeyRound, Eye, EyeOff, ShieldCheck, AlertCircle, Mail, Smartphone } from 'lucide-react';
import { FaUserPlus, FaCheck } from 'react-icons/fa';
import { authApi, tokenService } from '@/lib/api';
import { useUser } from '@/contexts/UserContext';
import { useToast } from '@/hooks/use-toast';

interface RegisterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const RegisterModalFixed: React.FC<RegisterModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register: userRegister } = useUser();
  const { toast } = useToast();

  // Form state
  const [registerForm, setRegisterForm] = useState({
    username: '',
    email: '',
    phone: '',
    password: '',
    agreeTerms: false
  });

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setRegisterForm({
        username: '',
        email: '',
        phone: '',
        password: '',
        agreeTerms: false
      });
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

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    // Form validation
    if (!registerForm.username || !registerForm.email || !registerForm.password) {
      setError('Lütfen gerekli tüm alanları doldurunuz.');
      return;
    }
    
    if (!registerForm.agreeTerms) {
      setError('Kayıt olmak için kullanım koşullarını kabul etmelisiniz.');
      return;
    }
    
    try {
      setIsSubmitting(true);
      setError(null);
      
      // UserContext'deki register fonksiyonunu kullan
      await userRegister({
        username: registerForm.username,
        email: registerForm.email,
        phone: registerForm.phone,
        password: registerForm.password,
        confirmPassword: registerForm.password
      });
      
      // Başarılı kayıt sonrası modal'ı kapat
      onClose();
      
      // Başarı toast'ı (UserContext zaten gösteriyor ama ekstra bilgi verelim)
      toast({
        title: "Hoş geldiniz!",
        description: "Hesabınız başarıyla oluşturuldu ve giriş yapıldı.",
        duration: 3000,
        className: "bg-[#1A1A1A] border border-green-500/40 text-white"
      });
    } catch (error: any) {
      console.error('Kayıt hatası:', error);
      
      // Sunucudan gelen hata mesajını al
      let errorMessage = 'Kayıt sırasında bir hata oluştu.';
      
      if (error.response?.data) {
        const errorData = error.response.data;
        // Önce message alanını kontrol et
        if (errorData.message) {
          errorMessage = errorData.message;
        }
        // Sonra error alanını kontrol et
        else if (errorData.error) {
          errorMessage = errorData.error;
        }
        // Details varsa ek bilgi ver
        else if (errorData.details) {
          errorMessage = `${errorMessage} Detay: ${errorData.details}`;
        }
      }
      // Network hatası veya başka bir durum
      else if (error.message) {
        if (error.message.includes('Network Error')) {
          errorMessage = 'İnternet bağlantınızı kontrol edin.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateRegisterForm = (field: keyof typeof registerForm, value: any) => {
    setRegisterForm(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[99999]" style={{backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)'}}>
      <div className="absolute top-0 left-0 right-0 bottom-0" onClick={onClose}></div>
      
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-gradient-to-b from-[#1E1E1E] to-[#121212] rounded-xl border border-[#2A2A2A] shadow-2xl overflow-auto max-h-[90vh]">
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
                <User className="text-[#121212]" size={24} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Hesap Oluştur
              </h2>
            </div>
            
            <div className="mt-2 text-sm text-gray-400">
              Hemen ücretsiz hesap oluşturarak tüm özelliklerden yararlanmaya başlayın.
            </div>
          </div>

          <form onSubmit={handleRegisterSubmit} className="space-y-4">
            {/* Username input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-200">
                Kullanıcı Adı
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User size={18} className="text-[#FFD700] group-focus-within:text-white transition-colors duration-200" />
                </div>
                <input
                  type="text"
                  value={registerForm.username}
                  onChange={e => updateRegisterForm('username', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-[#1A1A1A] border-2 border-[#333] focus:border-[#FFD700] rounded-lg focus:outline-none text-white placeholder-gray-500 transition-all duration-200 shadow-sm"
                  placeholder="Kullanıcı adınız"
                  required
                />
              </div>
            </div>

            {/* Email input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-200">
                E-posta
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail size={18} className="text-[#FFD700] group-focus-within:text-white transition-colors duration-200" />
                </div>
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={e => updateRegisterForm('email', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-[#1A1A1A] border-2 border-[#333] focus:border-[#FFD700] rounded-lg focus:outline-none text-white placeholder-gray-500 transition-all duration-200 shadow-sm"
                  placeholder="E-posta adresiniz"
                  required
                />
              </div>
            </div>

            {/* Phone input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-200">
                Telefon
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Smartphone size={18} className="text-[#FFD700] group-focus-within:text-white transition-colors duration-200" />
                </div>
                <input
                  type="tel"
                  value={registerForm.phone}
                  onChange={e => updateRegisterForm('phone', e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 bg-[#1A1A1A] border-2 border-[#333] focus:border-[#FFD700] rounded-lg focus:outline-none text-white placeholder-gray-500 transition-all duration-200 shadow-sm"
                  placeholder="Telefon numaranız"
                />
              </div>
            </div>

            {/* Password input */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-200">
                Şifre
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <KeyRound size={18} className="text-[#FFD700] group-focus-within:text-white transition-colors duration-200" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={registerForm.password}
                  onChange={e => updateRegisterForm('password', e.target.value)}
                  className="block w-full pl-10 pr-10 py-3 bg-[#1A1A1A] border-2 border-[#333] focus:border-[#FFD700] rounded-lg focus:outline-none text-white placeholder-gray-500 transition-all duration-200 shadow-sm"
                  placeholder="Şifreniz"
                  required
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Terms and conditions */}
            <div className="py-2">
              <div className="flex items-center">
                <div className="relative">
                  <input
                    id="agree-terms"
                    type="checkbox"
                    checked={registerForm.agreeTerms}
                    onChange={e => updateRegisterForm('agreeTerms', e.target.checked)}
                    className="h-4 w-4 opacity-0 absolute"
                  />
                  <div className={`w-5 h-5 border-2 ${registerForm.agreeTerms ? 'bg-[#FFD700] border-[#FFD700]' : 'bg-[#1A1A1A] border-[#333]'} rounded flex items-center justify-center transition-all duration-200`}>
                    {registerForm.agreeTerms && <FaCheck className="text-[#121212] text-xs" />}
                  </div>
                </div>
                <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-300 cursor-pointer select-none">
                  Kullanım koşullarını ve gizlilik politikasını kabul ediyorum.
                </label>
              </div>
            </div>

            {/* Hata Mesajı */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4 text-sm text-red-400 flex items-start">
                <AlertCircle className="shrink-0 h-5 w-5 mr-2 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
            
            {/* Register button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="relative w-full group overflow-hidden bg-gradient-to-r from-[#FFD700] to-[#FFBA00] text-[#121212] font-bold rounded-lg px-4 py-3.5 text-sm transition-all duration-300 shadow-lg hover:shadow-[#FFD700]/20 hover:scale-[1.02] active:scale-[0.98] mt-6 uppercase tracking-wider disabled:opacity-70 disabled:cursor-not-allowed"
            >
              <span className="relative z-10 flex items-center justify-center">
                {isSubmitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    İŞLENİYOR...
                  </span>
                ) : (
                  <>
                    <FaUserPlus className="mr-2" />
                    KAYIT OL
                  </>
                )}
              </span>
              <span className="absolute inset-0 bg-gradient-to-r from-[#FFBA00] to-[#FFD700] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300"></span>
            </button>
            
            {/* Güvenli kayıt bildirimi */}
            <div className="text-center mt-4 text-xs text-gray-400 flex items-center justify-center">
              <ShieldCheck size={14} className="text-[#FFD700] mr-1.5" />
              Kişisel bilgileriniz güvenli ve şifrelenmiş olarak saklanacaktır
            </div>

            {/* Switch to login */}
            <div className="relative mt-7 pt-7 border-t border-[#333]">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-[#1A1A1A] px-4 text-gray-400 text-xs uppercase tracking-wider">
                veya
              </div>
              <div className="text-center">
                <span className="text-gray-400 text-sm">
                  Zaten hesabınız var mı?
                </span>
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="ml-2 font-semibold text-[#FFD700] hover:text-yellow-400 transition-colors text-sm hover:underline"
                >
                  Giriş Yap
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterModalFixed;