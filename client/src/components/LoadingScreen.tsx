import { useEffect, useState } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { Zap, Play, Star } from 'lucide-react';

interface LoadingScreenProps {
  progress?: number;
  message?: string;
}

export const LoadingScreen = ({ progress = 0, message = "Oyunlar yükleniyor..." }: LoadingScreenProps) => {
  const { t, language } = useLanguage();
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);
    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center z-50">
      <div className="text-center max-w-md px-8">
        {/* Logo ve animasyon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center animate-pulse">
            <Zap size={40} className="text-black" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full animate-bounce">
            <Play size={16} className="text-white ml-1 mt-1" />
          </div>
        </div>

        {/* Başlık */}
        <h2 className="text-3xl font-bold text-white mb-4 bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
          CryptonBets
        </h2>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-3 mb-4 overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full transition-all duration-500 ease-out relative"
            style={{ width: `${animatedProgress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>

        {/* Progress Text */}
        <div className="text-white text-lg font-semibold mb-2">
          {animatedProgress}%
        </div>

        {/* Message */}
        <p className="text-gray-300 text-sm mb-6">{message}</p>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 text-xs text-gray-400">
          <div className="flex flex-col items-center">
            <Star size={16} className="text-yellow-400 mb-1" />
            <span>10,000+ Oyun</span>
          </div>
          <div className="flex flex-col items-center">
            <Zap size={16} className="text-green-400 mb-1" />
            <span>Anında Başlat</span>
          </div>
          <div className="flex flex-col items-center">
            <Play size={16} className="text-blue-400 mb-1" />
            <span>HD Kalite</span>
          </div>
        </div>
      </div>
    </div>
  );
};