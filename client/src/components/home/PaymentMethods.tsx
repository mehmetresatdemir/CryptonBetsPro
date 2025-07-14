import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

// Import payment method images
import PaycoImg from '@assets/payco_1750335572666.webp';
import PepImg from '@assets/pep_1750335572663.webp';
import PopyImg from '@assets/popypara_1750335572660.webp';
import PaparaImg from '@assets/papara_1750335572661.webp';
import PapelImg from '@assets/papel_1750335572662.webp';
import ParatimImg from '@assets/paratim_1750335572664.webp';
import ParolaparaImg from '@assets/parolapara_1750335572659.webp';
import PaybolImg from '@assets/paybol_1750335572656.webp';

// Hızlı Havale ve Kripto için placeholder images (geçici)
const placeholderImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2NCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQwIiBmaWxsPSIjMjJjNTVlIi8+Cjx0ZXh0IHg9IjMyIiB5PSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QmFuazwvdGV4dD4KPHN2Zz4=';
const cryptoImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2NCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQwIiBmaWxsPSIjZjU5ZTBiIi8+Cjx0ZXh0IHg9IjMyIiB5PSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+QlRDPC90ZXh0Pgo8L3N2Zz4=';
const cardImg = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA2NCA0MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQwIiBmaWxsPSIjM2I4MmY2Ii8+Cjx0ZXh0IHg9IjMyIiB5PSIyMCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjgiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+Q0FSRCY8L3RleHQ+Cjwvc3ZnPg==';

const paymentMethods = [
  { id: 'payco', name: 'PayCo', image: PaycoImg, color: '#00d4aa', gradient: 'from-teal-500/20 to-emerald-600/20' },
  { id: 'pep', name: 'PeP', image: PepImg, color: '#6366f1', gradient: 'from-indigo-500/20 to-purple-600/20' },
  { id: 'popy', name: 'Popy', image: PopyImg, color: '#0ea5e9', gradient: 'from-sky-500/20 to-blue-600/20' },
  { id: 'hizli-havale', name: 'Hızlı Havale', image: placeholderImg, color: '#22c55e', gradient: 'from-green-500/20 to-emerald-600/20' },
  { id: 'kredikarti', name: 'Kredi Kartı', image: cardImg, color: '#3b82f6', gradient: 'from-blue-500/20 to-cyan-600/20' },
  { id: 'kripto', name: 'Kripto', image: cryptoImg, color: '#f59e0b', gradient: 'from-amber-500/20 to-orange-600/20' },
  { id: 'papara', name: 'Papara', image: PaparaImg, color: '#7c3aed', gradient: 'from-purple-500/20 to-violet-600/20' },
  { id: 'papel', name: 'Papel', image: PapelImg, color: '#ef4444', gradient: 'from-red-500/20 to-pink-600/20' },
  { id: 'paratim', name: 'Paratim', image: ParatimImg, color: '#10b981', gradient: 'from-emerald-500/20 to-teal-600/20' },
  { id: 'parolapara', name: 'ParolaPara', image: ParolaparaImg, color: '#06b6d4', gradient: 'from-cyan-500/20 to-blue-600/20' },
  { id: 'paybol', name: 'Paybol', image: PaybolImg, color: '#8b5cf6', gradient: 'from-violet-500/20 to-purple-600/20' }
];

const PaymentMethods: React.FC = () => {
  const { translate } = useLanguage();

  return (
    <div className="w-full md:bg-[#0c0c0c] bg-transparent md:border border-none md:border-[#222] rounded-md relative overflow-hidden md:mt-6 mt-2 mb-6">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40 hidden md:block"></div>
      
      {/* Header - PopularSlotsSection ile aynı stilde */}
      <div className="md:flex hidden flex-col space-y-2.5 mb-8 relative px-3 sm:px-6 pt-4">
        <div className="relative">
          <div className="absolute top-0 left-0 bg-gradient-to-r from-[#111] to-transparent p-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FFD700] to-[#FFA500] flex items-center justify-center rounded-lg shadow-lg">
                <svg className="w-6 h-6 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-white font-bold text-xl">{translate('home.paymentMethods.title', 'Ödeme Yöntemleri')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* İçerik konteyner - Mobil uyumlu */}
      <div className="md:px-3 px-0 sm:px-6 md:py-6 py-0 sm:py-5">
        {/* Masaüstü görünümü - Payment Methods Grid */}
        <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-11 gap-6 mb-8">
          {paymentMethods.map((method, index) => (
            <div
              key={method.id}
              className="group relative flex flex-col items-center p-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-sm border border-gray-700 rounded-2xl hover:border-yellow-500/60 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/25 cursor-pointer"
            >
              {/* Gradient arka plan */}
              <div className={`absolute inset-0 bg-gradient-to-br ${method.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`}></div>
              
              {/* Payment Method Image */}
              <div className="relative z-10 w-20 h-12 mb-4 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:bg-white group-hover:scale-110">
                <img
                  src={method.image}
                  alt={method.name}
                  className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              {/* Method Name */}
              <span className="relative z-10 text-white text-sm font-semibold text-center group-hover:text-white transition-colors duration-300">
                {method.name}
              </span>
              
              {/* Active indicator */}
              <div className="relative z-10 w-2 h-2 bg-green-500 rounded-full mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
            </div>
          ))}
        </div>

        {/* Mobil görünümü - Tek sıra kaydırmalı modern kompakt tasarım */}
        <div className="md:hidden w-full overflow-hidden relative">
          <div className="flex items-center gap-3 pb-4 pl-0">
            <div className="w-6 h-6 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-lg flex items-center justify-center shadow-lg">
              <svg className="w-4 h-4 text-black" fill="currentColor" viewBox="0 0 20 20">
                <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-white text-base font-bold">Ödeme Yöntemleri</span>
          </div>
          
          <div className="flex overflow-x-auto no-scrollbar pb-6 snap-x snap-mandatory pl-0">
            <div className="flex gap-4 pr-4">
              {paymentMethods.map((method) => (
                <div key={method.id} className="flex-none w-[110px] snap-start group">
                  <div className={`relative rounded-2xl overflow-hidden border border-[#444] shadow-xl bg-gradient-to-br ${method.gradient} backdrop-blur-sm p-4 aspect-square hover:border-[#FFD700] transition-all duration-500 group-hover:scale-105 group-hover:shadow-2xl group-hover:shadow-[#FFD700]/25`}>
                    {/* Enhanced gradient overlay on hover */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${method.gradient.replace('/20', '/40')} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                    
                    {/* Payment Method Image */}
                    <div className="relative z-10 w-full h-16 flex items-center justify-center bg-white/95 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg group-hover:shadow-2xl transition-all duration-500 group-hover:bg-white">
                      <img
                        src={method.image}
                        alt={method.name}
                        className="w-full h-full object-contain p-1 group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    
                    {/* Active indicator */}
                    <div className="relative z-10 w-2 h-2 bg-[#FFD700] rounded-full mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 animate-pulse"></div>
                  </div>
                  <span className="text-white text-xs font-semibold text-center block mt-2 group-hover:text-[#FFD700] transition-colors duration-300">{method.name}</span>
                </div>
              ))}
              
              {/* Tümünü gör butonu - son kart olarak */}
              <div className="flex-none w-[110px] snap-start group">
                <div className="flex items-center justify-center h-full aspect-square rounded-2xl border border-dashed border-[#FFD700]/50 bg-gradient-to-br from-black/30 to-gray-900/30 backdrop-blur-sm hover:border-[#FFD700] hover:bg-gradient-to-br hover:from-[#FFD700]/10 hover:to-[#FFA500]/10 transition-all duration-500 group-hover:scale-105">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-lg flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform duration-300">
                      <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-[#FFD700] text-xs font-bold block">Tümü</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default PaymentMethods;