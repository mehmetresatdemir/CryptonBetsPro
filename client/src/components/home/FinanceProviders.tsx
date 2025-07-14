import { FC } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { translate } from '@/utils/i18n-fixed';

// Import payment method images
import PaycoImg from '@assets/payco_1750335572666.webp';
import PepImg from '@assets/pep_1750335572663.webp';
import PopyImg from '@assets/popypara_1750335572660.webp';
import PaparaImg from '@assets/papara_1750335572661.webp';
import ParolaparaImg from '@assets/parolapara_1750335572659.webp';

// Hızlı Havale ve Kripto için placeholder images
const placeholderImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2NCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQwIiBmaWxsPSIjMjJjNTVlIi8+Cjx0ZXh0IHg9IjMyIiB5PSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QmFuazwvdGV4dD4KPHN2Zz4=';
const cryptoImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2NCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjU5ZTBiIi8+Cjx0ZXh0IHg9IjMyIiB5PSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QlRDPC90ZXh0Pgo8L3N2Zz4=';

// Finans sağlayıcıları verileri - 5 adet
const providers = [
  { id: 1, name: 'Hızlı Havale', textColor: '#ffffff', image: placeholderImg, bgGradient: 'from-green-500/20 to-emerald-600/20' },
  { id: 2, name: 'ParolaPara', textColor: '#FFD700', image: ParolaparaImg, bgGradient: 'from-blue-500/20 to-cyan-600/20' },
  { id: 3, name: 'Papara', textColor: '#ffffff', image: PaparaImg, bgGradient: 'from-purple-500/20 to-violet-600/20' },
  { id: 4, name: 'PayCo', textColor: '#FFD700', image: PaycoImg, bgGradient: 'from-teal-500/20 to-green-600/20' },
  { id: 5, name: 'Kripto', textColor: '#ffffff', image: cryptoImg, bgGradient: 'from-amber-500/20 to-orange-600/20' },
];

const FinanceProviders: FC = () => {
  const { t } = useLanguage();
  return (
    <div className="w-full bg-[#0c0c0c] border border-[#222] rounded-md relative overflow-hidden py-12 mb-8 mt-6">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40"></div>
      
      {/* Başlık */}
      <div className="relative z-[1] mb-10 text-center">
        <div className="flex items-center justify-center">
          <div className="w-10 h-10 bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center rounded-lg shadow-lg">
            <i className="fas fa-wallet text-black text-xl"></i>
          </div>
          <h2 className="text-white font-bold text-xl ml-3">{translate('home.financeProviders.title')}</h2>
        </div>
        <p className="text-gray-400 text-base mt-3 max-w-2xl mx-auto">
          {translate('home.financeProviders.description')}
        </p>
      </div>
      
      {/* Sabit finans sağlayıcıları - 5 adet tek sırada */}
      <div className="max-w-6xl mx-auto relative z-[1] px-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-6 justify-items-center">
          {providers.map(provider => (
            <div 
              key={provider.id}
              className="flex flex-col items-center w-full max-w-[220px] group"
            >
              <div className={`w-full h-24 sm:h-28 bg-gradient-to-br ${provider.bgGradient} backdrop-blur-sm border border-[#333] rounded-xl flex flex-col items-center justify-center shadow-xl hover:border-[#FFD700] hover:shadow-2xl hover:shadow-[#FFD700]/20 transition-all duration-500 p-4 group-hover:scale-105 group-hover:bg-gradient-to-br group-hover:${provider.bgGradient.replace('/20', '/30')}`}>
                <div className="w-20 h-12 sm:w-24 sm:h-14 mb-2 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-lg overflow-hidden shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:bg-white">
                  <img
                    src={provider.image}
                    alt={provider.name}
                    className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <span className="text-sm sm:text-base font-bold text-center px-2 drop-shadow-sm" style={{ color: provider.textColor }}>
                  {provider.name}
                </span>
              </div>
              <div className="flex items-center mt-3 sm:mt-4">
                <div className="w-2 h-2 bg-[#FFD700] rounded-full mr-2 animate-pulse"></div>
                <span className="text-[#FFD700] text-xs sm:text-sm font-semibold tracking-wide">
                  {translate('home.financeProviders.secure')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Alt kısımda güvenlik rozeti */}
      <div className="relative z-[1] flex items-center justify-center mt-8 pt-6 border-t border-[#333]/50">
        <div className="flex items-center space-x-6 text-gray-400 text-sm">
          <div className="flex items-center">
            <i className="fas fa-shield-alt text-green-500 mr-2"></i>
            <span>SSL Güvenlik</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-lock text-blue-500 mr-2"></i>
            <span>Güvenli Ödeme</span>
          </div>
          <div className="flex items-center">
            <i className="fas fa-clock text-yellow-500 mr-2"></i>
            <span>Hızlı İşlem</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinanceProviders;