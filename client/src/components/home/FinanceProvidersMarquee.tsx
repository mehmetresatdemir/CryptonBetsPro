import { FC } from 'react';

// Import payment method images
import PaycoImg from '@assets/payco_1750335572666.webp';
import PepImg from '@assets/pep_1750335572663.webp';
import PopyImg from '@assets/popypara_1750335572660.webp';
import PaparaImg from '@assets/papara_1750335572661.webp';
import PapelImg from '@assets/papel_1750335572662.webp';
import ParatimImg from '@assets/paratim_1750335572664.webp';
import ParolaparaImg from '@assets/parolapara_1750335572659.webp';
import PaybolImg from '@assets/paybol_1750335572656.webp';

// Finans sağlayıcılarının verileri - 8 adet
const providers = [
  { id: 1, name: 'PayCo', bgColor: '#151515', textColor: '#ffffff', image: PaycoImg, gradient: 'from-teal-500/20 to-emerald-600/20' },
  { id: 2, name: 'Papara', bgColor: '#151515', textColor: '#FFD700', image: PaparaImg, gradient: 'from-purple-500/20 to-violet-600/20' },
  { id: 3, name: 'Paybol', bgColor: '#151515', textColor: '#ffffff', image: PaybolImg, gradient: 'from-violet-500/20 to-purple-600/20' },
  { id: 4, name: 'Paratim', bgColor: '#151515', textColor: '#FFD700', image: ParatimImg, gradient: 'from-emerald-500/20 to-teal-600/20' },
  { id: 5, name: 'PeP', bgColor: '#151515', textColor: '#ffffff', image: PepImg, gradient: 'from-indigo-500/20 to-purple-600/20' },
  { id: 6, name: 'Popy', bgColor: '#151515', textColor: '#FFD700', image: PopyImg, gradient: 'from-sky-500/20 to-blue-600/20' },
  { id: 7, name: 'Papel', bgColor: '#151515', textColor: '#ffffff', image: PapelImg, gradient: 'from-red-500/20 to-pink-600/20' },
  { id: 8, name: 'ParolaPara', bgColor: '#151515', textColor: '#FFD700', image: ParolaparaImg, gradient: 'from-cyan-500/20 to-blue-600/20' },
];

const FinanceProvidersMarquee: FC = () => {
  return (
    <div className="w-full bg-[#0c0c0c] border border-[#222] rounded-md relative overflow-hidden py-14 mb-8 mt-6">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40"></div>
      
      {/* Başlık */}
      <div className="relative z-10 mb-12 text-center">
        <div className="flex items-center justify-center">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center rounded-lg shadow-lg">
            <i className="fas fa-wallet text-black text-xl"></i>
          </div>
          <h2 className="text-white font-bold text-xl ml-3">GÜVENİLİR FİNANS SAĞLAYICILARI</h2>
        </div>
        <p className="text-gray-400 text-base mt-3 max-w-3xl mx-auto">
          Cryptonbets'te güvenli ve hızlı işlemler için birçok ödeme seçeneği bulunmaktadır
        </p>
      </div>
      
      {/* Sabit finans sağlayıcıları - 2 sıra, her sırada 4 tane */}
      <div className="max-w-6xl mx-auto relative z-10 px-4">
        {/* Birinci sıra */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mb-8">
          {providers.slice(0, 4).map(provider => (
            <div 
              key={`row1-${provider.id}`}
              className="flex flex-col items-center group"
            >
              <div className={`w-full h-28 sm:h-32 bg-gradient-to-br ${provider.gradient} backdrop-blur-sm border border-[#333] rounded-xl flex flex-col items-center justify-center shadow-xl hover:border-[#FFD700] hover:shadow-2xl hover:shadow-[#FFD700]/20 transition-all duration-500 p-4 group-hover:scale-105 cursor-pointer`}>
                <div className="w-20 h-12 sm:w-24 sm:h-14 mb-3 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:bg-white">
                  <img
                    src={provider.image}
                    alt={provider.name}
                    className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-sm sm:text-base font-bold text-center drop-shadow-sm" style={{ color: provider.textColor }}>
                  {provider.name}
                </span>
              </div>
              <div className="flex items-center mt-3 sm:mt-4">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-green-400 text-xs sm:text-sm font-semibold tracking-wide">Güvenli İşlem</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* İkinci sıra */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
          {providers.slice(4, 8).map(provider => (
            <div 
              key={`row2-${provider.id}`}
              className="flex flex-col items-center group"
            >
              <div className={`w-full h-28 sm:h-32 bg-gradient-to-br ${provider.gradient} backdrop-blur-sm border border-[#333] rounded-xl flex flex-col items-center justify-center shadow-xl hover:border-[#FFD700] hover:shadow-2xl hover:shadow-[#FFD700]/20 transition-all duration-500 p-4 group-hover:scale-105 cursor-pointer`}>
                <div className="w-20 h-12 sm:w-24 sm:h-14 mb-3 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:bg-white">
                  <img
                    src={provider.image}
                    alt={provider.name}
                    className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-sm sm:text-base font-bold text-center drop-shadow-sm" style={{ color: provider.textColor }}>
                  {provider.name}
                </span>
              </div>
              <div className="flex items-center mt-3 sm:mt-4">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-blue-400 text-xs sm:text-sm font-semibold tracking-wide">Hızlı Ödeme</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alt kısımda istatistikler */}
      <div className="relative z-10 flex items-center justify-center mt-10 pt-8 border-t border-[#333]/50">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center mb-2">
              <i className="fas fa-shield-check text-white text-sm"></i>
            </div>
            <span className="text-white text-sm font-bold">%100</span>
            <span className="text-gray-400 text-xs">Güvenli</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center mb-2">
              <i className="fas fa-bolt text-white text-sm"></i>
            </div>
            <span className="text-white text-sm font-bold">Anında</span>
            <span className="text-gray-400 text-xs">İşlem</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-violet-600 rounded-lg flex items-center justify-center mb-2">
              <i className="fas fa-clock text-white text-sm"></i>
            </div>
            <span className="text-white text-sm font-bold">7/24</span>
            <span className="text-gray-400 text-xs">Destek</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center mb-2">
              <i className="fas fa-star text-white text-sm"></i>
            </div>
            <span className="text-white text-sm font-bold">Premium</span>
            <span className="text-gray-400 text-xs">Hizmet</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceProvidersMarquee;