import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";

interface User {
  id: number;
  username: string;
  email: string;
  role?: string;
  balance?: number;
  vipLevel?: number;
  vipPoints?: number;
  totalBets?: number;
  totalWins?: number;
  bonusBalance?: number;
  registrationDate?: string | Date;
  firstName?: string;
  lastName?: string;
  fullName?: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Debug fonksiyonu - storage durumunu kontrol et
const debugStorage = () => {
  console.group('🔍 STORAGE DEBUG');
  console.log('localStorage items:');
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      console.log(`  ${key}:`, localStorage.getItem(key));
    }
  }
  console.log('sessionStorage items:');
  for (let i = 0; i < sessionStorage.length; i++) {
    const key = sessionStorage.key(i);
    if (key) {
      console.log(`  ${key}:`, sessionStorage.getItem(key));
    }
  }
  console.log('cookies:', document.cookie);
  console.groupEnd();
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  const checkAuth = async () => {
    console.log('🔍 AUTH CHECK BAŞLIYOR');
    debugStorage();
    
    try {
      // LocalStorage'dan token'ı al
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('auth_token') || 
                   localStorage.getItem('jwt_token') ||
                   localStorage.getItem('userToken');
      
      // Token yoksa hiç istek gönderme
      if (!token) {
        console.log('❌ No token found, user not authenticated');
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      console.log('✅ Token found, checking with server:', token.substring(0, 20));
      
      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Auth check successful:', userData.username);
        setUser(userData);
      } else {
        console.log('❌ Auth check failed:', response.status);
        // Token geçersizse tüm storage'ı temizle
        localStorage.clear();
        sessionStorage.clear();
        setUser(null);
      }
    } catch (error) {
      console.error('❌ Auth check failed:', error);
      // Hata durumunda tüm storage'ı temizle
      localStorage.clear();
      sessionStorage.clear();
      setUser(null);
    } finally {
      setIsLoading(false);
      console.log('🔍 AUTH CHECK BİTTİ');
      debugStorage();
    }
  };

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log('🔑 LOGIN BAŞLIYOR:', username);
    debugStorage();
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Login response:', data);
        
        // Token'ı kaydet - farklı formatları kontrol et
        if (data.token) {
          localStorage.setItem('token', data.token);
          console.log('💾 Token saved to localStorage:', data.token.substring(0, 20));
        }
        
        // User bilgilerini kaydet ve set et
        if (data.user) {
          localStorage.setItem('user', JSON.stringify(data.user));
          setUser(data.user);
          console.log('👤 User set:', data.user.username);
        } else if (data.id && data.username) {
          // Eğer response direkt user objesiyse
          localStorage.setItem('user', JSON.stringify(data));
          setUser(data);
          console.log('👤 User set (direct):', data.username);
        }
        
        debugStorage();
        return true;
      } else {
        console.log('❌ Login failed:', response.status);
        return false;
      }
    } catch (error) {
      console.error('❌ Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    console.log('🚪 LOGOUT BAŞLIYOR');
    debugStorage();
    
    try {
      // Token'ı al
      const token = localStorage.getItem('token') || 
                   localStorage.getItem('auth_token') || 
                   localStorage.getItem('jwt_token') ||
                   localStorage.getItem('userToken');
      
      // Server'a logout isteği gönder (token ile birlikte)
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        console.log('🔑 Token ile logout isteği gönderiliyor:', token.substring(0, 20));
      }
      
      await fetch('/api/auth/logout', { 
        method: 'POST',
        headers,
        credentials: 'include'
      });
      
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      console.log('🧹 TÜM STORAGE ALANLARI TEMİZLENİYOR');
      
      // 1. LocalStorage ve SessionStorage temizle
      try {
        localStorage.clear();
        sessionStorage.clear();
        console.log('✅ localStorage ve sessionStorage temizlendi');
      } catch (e) {
        console.warn('❌ Storage clear failed:', e);
      }
      
      // 2. Tüm cookie'leri temizle
      try {
        // Mevcut domain için cookie'leri temizle
        document.cookie.split(";").forEach(function(c) { 
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // Özel cookie'leri temizle
        const cookiesToClear = [
          'connect.sid', 'sessionid', 'session', 'auth', 'authorization',
          'token', 'jwt', 'access_token', 'refresh_token', 'bearer_token',
          'user_token', 'auth_token', 'session_token'
        ];
        
        cookiesToClear.forEach(cookieName => {
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;
        });
        console.log('✅ Cookie'ler temizlendi');
      } catch (e) {
        console.warn('❌ Cookie clear failed:', e);
      }
      
      // 3. IndexedDB temizle
      try {
        if ('indexedDB' in window) {
          indexedDB.databases().then(databases => {
            databases.forEach(db => {
              if (db.name) {
                indexedDB.deleteDatabase(db.name);
              }
            });
          });
          console.log('✅ IndexedDB temizlendi');
        }
      } catch (e) {
        console.warn('❌ IndexedDB clear failed:', e);
      }
      
      // 4. WebSQL temizle (eski tarayıcılar için)
      try {
        if ('openDatabase' in window) {
          // @ts-ignore
          const db = openDatabase('', '', '', '');
          if (db) {
            db.transaction(tx => {
              tx.executeSql('DELETE FROM __WebKitDatabaseInfoTable__');
            });
          }
          console.log('✅ WebSQL temizlendi');
        }
      } catch (e) {
        console.warn('❌ WebSQL clear failed:', e);
      }
      
      // 5. Cache API temizle
      try {
        if ('caches' in window) {
          caches.keys().then(names => {
            names.forEach(name => {
              caches.delete(name);
            });
          });
          console.log('✅ Cache API temizlendi');
        }
      } catch (e) {
        console.warn('❌ Cache clear failed:', e);
      }
      
      // 6. User state'i temizle
      setUser(null);
      
      console.log('✅ LOGOUT TAMAMLANDI - TÜM STORAGE TEMİZLENDİ');
      debugStorage();
      
      // 7. Tarayıcı geçmişini temizle ve anasayfaya yönlendir
      try {
        // History stack'i temizle
        window.history.replaceState(null, '', '/');
        
        // Hard reload yap
        window.location.replace('/');
      } catch (e) {
        console.warn('❌ Navigation failed:', e);
        // Son çare olarak normal reload
        window.location.reload();
      }
    }
  };

  const refreshUser = async () => {
    await checkAuth();
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;