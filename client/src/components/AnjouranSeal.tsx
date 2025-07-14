import { useEffect } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";

declare global {
  interface Window {
    anj_60568e5b_87d7_42a6_902f_6eec9c7db75f?: {
      init: () => void;
    };
  }
}

export function AnjouranSeal() {
  const { t, language } = useLanguage();
  useEffect(() => {
    // Anjouan Gaming License seal initialization
    if (window.anj_60568e5b_87d7_42a6_902f_6eec9c7db75f) {
      window.anj_60568e5b_87d7_42a6_902f_6eec9c7db75f.init();
    } else {
      // Retry after a short delay if script hasn't loaded yet
      const timer = setTimeout(() => {
        if (window.anj_60568e5b_87d7_42a6_902f_6eec9c7db75f) {
          window.anj_60568e5b_87d7_42a6_902f_6eec9c7db75f.init();
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <div 
      id="anj-60568e5b-87d7-42a6-902f-6eec9c7db75f" 
      data-anj-seal-id="60568e5b-87d7-42a6-902f-6eec9c7db75f" 
      data-anj-image-size="128" 
      data-anj-image-type="basic-small"
      className="anjouan-seal"
    />
  );
}