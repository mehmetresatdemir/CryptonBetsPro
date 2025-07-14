import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useLanguage } from "./LanguageContext";
import { authApi, tokenService } from '../lib/api';
import { getCurrentUser } from '../services/authService';
import { useToast } from '../hooks/use-toast';
import { adminTranslations } from '../utils/translations/adminTranslations';

// Kullanıcı tipi
export interface UserType {
  id: number;
  username: string;
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  tckn?: string; // TC Kimlik Numarası
  balance?: number;
  vipLevel?: number;
  vipPoints?: number;
  totalBets?: number;
  totalWins?: number;
  bonusBalance?: number;
  registrationDate?: string | Date;
  isActive?: boolean;
}

// Context değerleri
interface UserContextType {
  user: UserType | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string, language?: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  updateProfile: (profileData: { 
    fullName?: string, 
    email?: string, 
    phone?: string, 
    tckn?: string,
    oldPassword?: string,
    newPassword?: string
  }) => Promise<void>;
}

// Context'i oluştur
const UserContext = createContext<UserContextType | undefined>(undefined);

// Context provider
export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  // Token doğrulaması ve otomatik kullanıcı yükleme
  useEffect(() => {
    const initializeAuth = async () => {
      const token = tokenService.getToken();
      if (token) {
        try {
          // Token formatını kontrol et
          const parts = token.split('.');
          if (parts.length !== 3) {
            tokenService.removeToken();
            setIsLoading(false);
            return;
          }

          // Backend'den kullanıcı bilgilerini al
          const userData = await getCurrentUser();
          if (userData) {
            setUser(userData as UserType);
          } else {
            tokenService.removeToken();
          }
        } catch (error) {
          // Token geçersiz, temizle
          tokenService.removeToken();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  // Giriş fonksiyonu
  const login = async (username: string, password: string, language: string = 'tr') => {
    setIsLoading(true);
    try {
      const response = await authApi.login({ username, password, language });
      tokenService.setToken(response.token);
      setUser(response.user as UserType);
      
      // Başarılı giriş bildirimi
      toast({
        title: "Giriş başarılı",
        variant: "default",
        duration: 3000,
        className: "bg-green-900 border border-green-500/40 text-white"
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Kayıt fonksiyonu
  const register = async (userData: any) => {
    setIsLoading(true);
    try {
      const response = await authApi.register(userData);
      tokenService.setToken(response.token);
      setUser(response.user);
      
      // Başarılı kayıt bildirimi
      toast({
        title: "Kayıt başarılı",
        variant: "default",
        duration: 3000,
        className: "bg-[#1A1A1A] border border-yellow-500/40 text-white"
      });
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Çıkış fonksiyonu
  const logout = async () => {
    try {
      // Backend'e logout isteği gönder
      const token = tokenService.getToken();
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          credentials: 'include'
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
      // Backend hatası olsa da frontend'i temizle
    } finally {
      // Her durumda frontend'i temizle
      tokenService.removeToken();
      setUser(null);
      
      // Başarılı çıkış bildirimi
      toast({
        title: "Çıkış yapıldı",
        variant: "default",
        duration: 3000,
        className: "bg-[#1A1A1A] border border-yellow-500/40 text-white"
      });
      
      // Anasayfaya yönlendir
      window.location.replace('/');
    }
  };

  // GÜVENLİK: Kullanıcı bilgilerini yenileme - sadece aktif session için
  const refreshUser = async (): Promise<void> => {
    // Sadece mevcut user varsa ve aktif session varsa yenile
    if (user && user.id) {
      const token = tokenService.getToken();
      if (token) {
        try {
          // Token doğrulaması ile kullanıcı bilgilerini getir
          const userData = await authApi.getProfile(token);
          setUser(userData as UserType);
          
          toast({
            title: "Profil güncellendi",
            variant: "default",
            duration: 3000,
            className: "bg-[#1A1A1A] border border-green-500/40 text-white"
          });
        } catch (error) {
          console.error('Profil yenileme hatası:', error);
          // Token geçersizse çıkış yap
          tokenService.removeToken();
          setUser(null);
          toast({
            title: "Oturum süresi doldu, lütfen tekrar giriş yapın",
            variant: "destructive",
            duration: 5000,
          });
          throw error;
        }
      } else {
        // Token yoksa çıkış yap
        setUser(null);
      }
    }
  };
  
  // Profil bilgilerini güncelleme fonksiyonu
  const updateProfile = async (profileData: { 
    fullName?: string, 
    email?: string, 
    phone?: string, 
    tckn?: string, 
    oldPassword?: string, 
    newPassword?: string 
  }): Promise<void> => {
    const token = tokenService.getToken();
    if (token) {
      try {
        console.log('Profil güncelleme başlatılıyor:', profileData);
        
        // Profil verilerini güncelle
        await authApi.updateProfile(token, profileData);
        
        // API çağrısından önce 500ms bekle (önbellek temizleme için)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Başarıyla güncelledikten sonra, güncel kullanıcı bilgilerini getir
        await refreshUser();
        
        // Güncelleme başarılı oldu mu kontrol et
        const updatedUser = await authApi.getProfile(token);
        console.log('Güncellenmiş kullanıcı bilgileri:', updatedUser);
        
        // Kullanıcı state'ini güncelle (bu, beklenen değişikliklerin UI'de hemen görünmesini sağlar)
        if (updatedUser) {
          setUser(updatedUser as UserType);
        }
        
        toast({
          title: 'Profil başarıyla güncellendi',
          variant: "default",
          duration: 3000,
          className: "bg-[#1A1A1A] border border-green-500/40 text-white"
        });
      } catch (error) {
        console.error('Profil güncelleme hatası:', error);
        toast({
          title: 'Profil güncellenirken bir hata oluştu',
          variant: "destructive", 
          duration: 3000,
        });
        throw error;
      }
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        updateProfile
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Kullanıcı context hook'u
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Admin Language Hook
export const useAdminLanguage = () => {
  const [language, setLanguage] = useState<string>('tr');
  
  const changeLanguage = (newLang: string) => {
    setLanguage(newLang);
    localStorage.setItem('adminLanguage', newLang);
  };

  useEffect(() => {
    const savedLang = localStorage.getItem('adminLanguage');
    if (savedLang && ['tr', 'en', 'ka'].includes(savedLang)) {
      setLanguage(savedLang);
    }
  }, []);

  const t = (key: string, fallback: string = '') => {
    const translations = adminTranslations as any;
    const translation = translations[key];
    
    if (!translation) {
      // console.warn(`Çeviri anahtarı bulunamadı: ${key}`);
      return fallback || key;
    }
    
    return translation[language] || translation['tr'] || fallback || key;
  };

  return {
    language,
    changeLanguage,
    t
  };
};