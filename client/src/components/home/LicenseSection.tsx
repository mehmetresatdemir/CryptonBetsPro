import { FC, useEffect } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { translate } from '@/utils/i18n-fixed';


const LicenseSection: FC = () => {
  const { t } = useLanguage();

  // Anjouan lisans seal'ını initialize et
  useEffect(() => {
    const initializeLicense = () => {
      const sealElement = document.getElementById('anj-60568e5b-87d7-42a6-902f-6eec9c7db75f');
      
      if (sealElement && typeof window !== 'undefined' && (window as any).anj_60568e5b_87d7_42a6_902f_6eec9c7db75f) {
        try {
          (window as any).anj_60568e5b_87d7_42a6_902f_6eec9c7db75f.init();
        } catch (error) {
          // Sessiz başarısızlık - lisans yüklenmesi isteğe bağlı
        }
      }
    };

    // DOM hazır olana kadar bekle
    const timer = setTimeout(initializeLicense, 500);
    const timer2 = setTimeout(initializeLicense, 2000);
    
    return () => {
      clearTimeout(timer);
      clearTimeout(timer2);
    };
  }, []);
  return (
    <div className="w-full bg-[#0c0c0c] border border-[#222] rounded-md relative overflow-hidden py-6 sm:py-8 mb-8 mt-6">
      {/* Arka plan efekti */}
      <div className="absolute inset-0 bg-gradient-to-r from-black via-transparent to-black opacity-40"></div>
      
      <div className="relative z-[1] px-4 sm:px-0">
        <div className="flex flex-col items-center justify-center">
          {/* Başlık */}
          <div className="mb-4 text-center">
            <div className="flex items-center justify-center">
              <div className="w-8 h-8 bg-[#FFD700] flex items-center justify-center rounded-md">
                <i className="fas fa-shield-alt text-black text-lg"></i>
              </div>
              <h2 className="text-white font-bold text-lg ml-2">{translate('home.license.title')}</h2>
            </div>
            <p className="text-gray-400 text-sm mt-2 px-2 sm:px-0">
{translate('home.license.description')}
            </p>
          </div>
          
          {/* Anjouan Gaming License Seal - cryptonbets1.com */}
          <div className="flex justify-center">
            <div className="relative p-4 sm:p-5 bg-[#151515] border border-[#333] rounded-lg shadow-lg hover:border-[#FFD700] transition-all duration-300 flex flex-col items-center justify-center">
              <div 
                id="anj-60568e5b-87d7-42a6-902f-6eec9c7db75f" 
                data-anj-seal-id="60568e5b-87d7-42a6-902f-6eec9c7db75f" 
                data-anj-image-size="128" 
                data-anj-image-type="basic-small"
                className="flex justify-center"
              ></div>
              <div className="mt-3 text-center">
                <p className="text-white text-xs sm:text-sm">{translate('home.license.name')}</p>
                <p className="text-[#FFD700] text-[10px] sm:text-xs mt-1">License No: AGL/COMM/2025/001</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LicenseSection;