import React, { useState, useEffect } from 'react';
import { useLanguage } from "@/contexts/LanguageContext";
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { X, ExternalLink } from 'lucide-react';

interface Banner {
  id: number;
  title: string;
  description?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkUrl?: string;
  type: 'slider' | 'popup' | 'sidebar' | 'header' | 'footer';
  position: number;
  pageLocation: string;
  targetAudience: string;
  displayPriority: number;
  displayFrequency: string;
  popupDelay?: number;
}

interface BannerDisplayProps {
  type: Banner['type'];
  pageLocation?: string;
  language?: string;
  className?: string;
  maxItems?: number;
}

const BannerDisplay: React.FC<BannerDisplayProps> = ({ 
  type, 
  pageLocation = 'home', 
  language = 'tr',
  className = '',
  maxItems = 5 
}) => {
  const [closedBanners, setClosedBanners] = useState<number[]>([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch banners
  const { data: bannersData, isLoading } = useQuery({
    queryKey: ['banners', type, pageLocation, language],
    queryFn: async () => {
      const response = await fetch(`/api/banners?type=${type}&page=${pageLocation}&language=${language}`);
      return response.json();
    }
  });

  const banners = bannersData?.data?.filter((banner: Banner) => 
    !closedBanners.includes(banner.id)
  ).slice(0, maxItems) || [];

  // Track banner impression
  const trackImpression = async (bannerId: number) => {
    try {
      await fetch(`/api/banners/${bannerId}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'impression',
          sessionId: sessionStorage.getItem('sessionId') || Date.now().toString(),
          deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop'
        })
      });
    } catch (error) {
      console.error('Banner impression tracking failed:', error);
    }
  };

  // Track banner click
  const trackClick = async (bannerId: number) => {
    try {
      await fetch(`/api/banners/${bannerId}/track`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'click',
          sessionId: sessionStorage.getItem('sessionId') || Date.now().toString(),
          deviceType: window.innerWidth < 768 ? 'mobile' : 'desktop'
        })
      });
    } catch (error) {
      console.error('Banner click tracking failed:', error);
    }
  };

  // Handle banner close
  const closeBanner = (bannerId: number) => {
    setClosedBanners(prev => [...prev, bannerId]);
    trackClick(bannerId); // Track as interaction
  };

  // Handle banner click
  const handleBannerClick = (banner: Banner) => {
    trackClick(banner.id);
    if (banner.linkUrl) {
      if (banner.linkUrl.startsWith('http')) {
        window.open(banner.linkUrl, '_blank');
      } else {
        window.location.href = banner.linkUrl;
      }
    }
  };

  // Auto-advance slider
  useEffect(() => {
    if (type === 'slider' && banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % banners.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length, type]);

  // Track impressions when banners load
  useEffect(() => {
    banners.forEach((banner: Banner) => {
      trackImpression(banner.id);
    });
  }, [banners]);

  if (isLoading || !banners.length) return null;

  // Slider Banner
  if (type === 'slider') {
    const currentBanner = banners[currentSlide];
    if (!currentBanner) return null;

    return (
      <div className={`relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg shadow-lg ${className}`}>
        <div 
          className="absolute inset-0 bg-cover bg-center transition-all duration-500 cursor-pointer"
          style={{ 
            backgroundImage: `url(${window.innerWidth < 768 && currentBanner.mobileImageUrl ? currentBanner.mobileImageUrl : currentBanner.imageUrl})` 
          }}
          onClick={() => handleBannerClick(currentBanner)}
        >
          <div className="absolute inset-0 bg-black/20" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="text-xl md:text-2xl font-bold mb-2">{currentBanner.title}</h3>
            {currentBanner.description && (
              <p className="text-sm md:text-base opacity-90">{currentBanner.description}</p>
            )}
          </div>
        </div>

        {/* Slider Controls */}
        {banners.length > 1 && (
          <>
            <div className="absolute bottom-4 right-4 flex space-x-2">
              {banners.map((_: any, index: number) => (
                <button
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-white' : 'bg-white/50'
                  }`}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
            <button
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
              onClick={() => setCurrentSlide(prev => prev === 0 ? banners.length - 1 : prev - 1)}
            >
              ←
            </button>
            <button
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
              onClick={() => setCurrentSlide(prev => (prev + 1) % banners.length)}
            >
              →
            </button>
          </>
        )}
      </div>
    );
  }

  // Header Banner - Show only one banner at a time to prevent stacking
  if (type === 'header') {
    // Show only the first banner to prevent stacking
    const displayBanner = banners[0];
    if (!displayBanner) return null;

    return (
      <div className={`w-full ${className}`}>
        <div 
          className="w-full text-white px-4 py-2 cursor-pointer hover:opacity-90 transition-opacity bg-gradient-to-r from-yellow-600 to-yellow-500"
          onClick={() => handleBannerClick(displayBanner)}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <span className="text-sm font-medium">{displayBanner.title}</span>
              {displayBanner.description && (
                <span className="text-xs opacity-90 hidden md:inline">{displayBanner.description}</span>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {displayBanner.linkUrl && (
                <ExternalLink className="w-4 h-4" />
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeBanner(displayBanner.id);
                }}
                className="hover:bg-white/20 p-1 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Sidebar Banner
  if (type === 'sidebar') {
    return (
      <div className={`space-y-4 ${className}`}>
        {banners.map((banner: Banner) => (
          <div 
            key={banner.id}
            className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-lg transition-shadow"
            onClick={() => handleBannerClick(banner)}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                closeBanner(banner.id);
              }}
              className="absolute top-2 right-2 bg-black/50 text-white p-1 rounded-full hover:bg-black/70"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>
    );
  }

  // Footer Banner
  if (type === 'footer') {
    return (
      <div className={`bg-gray-800 text-white ${className}`}>
        <div className="flex flex-wrap gap-4 p-4">
          {banners.map((banner: Banner) => (
            <div 
              key={banner.id}
              className="flex-1 min-w-64 bg-gray-700 rounded p-3 cursor-pointer hover:bg-gray-600 transition-colors"
              onClick={() => handleBannerClick(banner)}
            >
              <h4 className="font-semibold text-sm">{banner.title}</h4>
              {banner.description && (
                <p className="text-xs text-gray-300 mt-1">{banner.description}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Popup Banner (appears after delay)
  if (type === 'popup') {
    const [showPopup, setShowPopup] = useState(false);
    
    useEffect(() => {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, banners[0]?.popupDelay || 3000);
      
      return () => clearTimeout(timer);
    }, [banners]);

    if (!showPopup) return null;

    const banner = banners[0];
    return (
      <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full overflow-hidden shadow-2xl">
          <div className="relative">
            <img 
              src={window.innerWidth < 768 && banner.mobileImageUrl ? banner.mobileImageUrl : banner.imageUrl}
              alt={banner.title}
              className="w-full h-48 object-cover"
            />
            <button
              onClick={() => closeBanner(banner.id)}
              className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="p-4">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{banner.title}</h3>
            {banner.description && (
              <p className="text-gray-600 mb-4">{banner.description}</p>
            )}
            {banner.linkUrl && (
              <button
                onClick={() => handleBannerClick(banner)}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
              >
                Detayları Gör
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default BannerDisplay;