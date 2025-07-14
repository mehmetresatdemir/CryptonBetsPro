import React, { useState } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useLocation } from 'wouter';
import { useToast } from '@/hooks/use-toast';
import { Lock, User, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { adminLogin, setAuthToken, setCurrentUser } from '@/services/authService';

export default function AdminLogin() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Admin servisi ile giriş kontrolü
      const result = await adminLogin({ username, password });
      
      if (result && result.token) {
        // Token ve kullanıcı bilgilerini sakla
        setAuthToken(result.token);
        // Admin token'ı ayrıca sakla
        localStorage.setItem('admin_token', result.token);
        setCurrentUser(result.user);
        
        console.log('Admin giriş başarılı, token alındı');
        
        toast({
          title: "Giriş Başarılı",
          description: "Admin paneline yönlendiriliyorsunuz.",
          variant: "default",
        });
        
        // Yönlendirme
        setTimeout(() => {
          setLocation('/admin/dashboard');
        }, 1000);
      } else {
        throw new Error('Token bulunamadı');
      }
    } catch (error: any) {
      console.error('Admin giriş hatası:', error);
      
      toast({
        title: "Giriş Başarısız",
        description: error.message || "Kullanıcı adı veya şifre hatalı. Lütfen tekrar deneyin.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-gray-900 to-black">
      <div className="max-w-md w-full space-y-8 p-8 bg-gray-800/80 rounded-xl border border-yellow-500/20 shadow-2xl backdrop-blur-sm">
        <div className="text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-gradient-to-r from-yellow-500 to-amber-600 p-1">
            <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center">
              <Lock className="h-12 w-12 text-yellow-500" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-white">CryptonBets</h2>
          <p className="mt-2 text-sm text-gray-400">Admin Panel Girişi</p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="space-y-4">
            <div>
              <label htmlFor="username" className="sr-only">Kullanıcı Adı</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-yellow-500" />
                </div>
                <Input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  className="pl-10 py-2 bg-gray-900 border-gray-700 text-white focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Kullanıcı Adı"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">Şifre</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-yellow-500" />
                </div>
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="pl-10 py-2 bg-gray-900 border-gray-700 text-white focus:ring-yellow-500 focus:border-yellow-500"
                  placeholder="Şifre"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-yellow-500 hover:text-yellow-400 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <Button
              type="submit"
              className="w-full py-2 px-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-black mr-2"></div>
                  Giriş Yapılıyor...
                </div>
              ) : (
                "Giriş Yap"
              )}
            </Button>
          </div>
          
          <div className="text-xs text-center text-gray-400 mt-6">
            <div className="flex flex-col space-y-1">
              <p>Demo giriş için:</p>
              <p><span className="font-semibold text-yellow-500">Kullanıcı Adı:</span> admin</p>
              <p><span className="font-semibold text-yellow-500">Şifre:</span> admin123</p>
            </div>
          </div>
        </form>
        
        <div className="pt-4 border-t border-yellow-500/20">
          <p className="text-xs text-center text-gray-400">
            © 2025 CryptonBets. Tüm hakları saklıdır.
          </p>
        </div>
      </div>
    </div>
  );
}