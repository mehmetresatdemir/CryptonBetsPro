import { useState, useEffect, useCallback } from 'react';

interface ImageOptimizationOptions {
  src: string;
  lazy?: boolean;
  placeholder?: string;
  quality?: 'low' | 'medium' | 'high';
}

export const useImageOptimization = ({ 
  src, 
  lazy = true, 
  placeholder,
  quality = 'medium' 
}: ImageOptimizationOptions) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(placeholder || '');

  // WebP desteği kontrolü
  const supportsWebP = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
  }, []);

  // Görüntü optimizasyonu
  const getOptimizedSrc = useCallback((originalSrc: string) => {
    if (!originalSrc) return '';

    // Eğer zaten optimize edilmişse olduğu gibi döndür
    if (originalSrc.includes('w_') || originalSrc.includes('q_')) {
      return originalSrc;
    }

    // Kalite parametreleri
    const qualityMap = {
      low: 'q_30',
      medium: 'q_60', 
      high: 'q_80'
    };

    // WebP formatını tercih et
    const format = supportsWebP() ? 'f_webp' : 'f_auto';
    const qualityParam = qualityMap[quality];

    // Cloudinary veya benzeri CDN için optimize et
    if (originalSrc.includes('cloudinary.com')) {
      const parts = originalSrc.split('/upload/');
      if (parts.length === 2) {
        return `${parts[0]}/upload/${format},${qualityParam},w_400,h_300,c_fill/${parts[1]}`;
      }
    }

    return originalSrc;
  }, [quality, supportsWebP]);

  // Görüntü yükleme
  useEffect(() => {
    if (!src) return;

    const img = new Image();
    const optimizedSrc = getOptimizedSrc(src);
    
    img.onload = () => {
      setCurrentSrc(optimizedSrc);
      setIsLoaded(true);
      setHasError(false);
    };

    img.onerror = () => {
      setHasError(true);
      setIsLoaded(false);
      // Fallback olarak orijinal src'yi dene
      if (optimizedSrc !== src) {
        const fallbackImg = new Image();
        fallbackImg.onload = () => {
          setCurrentSrc(src);
          setIsLoaded(true);
          setHasError(false);
        };
        fallbackImg.onerror = () => {
          setHasError(true);
        };
        fallbackImg.src = src;
      }
    };

    // Lazy loading
    if (lazy) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              img.src = optimizedSrc;
              observer.disconnectranslate();
            }
          });
        },
        { threshold: 0.1 }
      );

      // Dummy element oluştur
      const dummyElement = document.createElement('div');
      observer.observe(dummyElement);
      
      return () => {
        observer.disconnectranslate();
      };
    } else {
      img.src = optimizedSrc;
    }

  }, [src, lazy, getOptimizedSrc]);

  return {
    src: currentSrc,
    isLoaded,
    hasError,
    isLoading: !isLoaded && !hasError
  };
};