import { useState, useEffect } from 'react';

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  userAgent: string;
  screenWidth: number;
  screenHeight: number;
  orientation: 'portrait' | 'landscape';
  touchSupported: boolean;
  platform: string;
  deviceCategory: 'mobile' | 'desktop'; // Simplified for game API
}

export const useDeviceDetection = (): DeviceInfo => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>(() => {
    if (typeof window === 'undefined') {
      return {
        type: 'desktop',
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        userAgent: '',
        screenWidth: 1920,
        screenHeight: 1080,
        orientation: 'landscape',
        touchSupported: false,
        platform: 'unknown',
        deviceCategory: 'desktop'
      };
    }

    const userAgent = navigator.userAgent.toLowerCase();
    const screenWidth = window.innerWidth || window.screen.width;
    const screenHeight = window.innerHeight || window.screen.height;
    const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // Advanced platform detection
    let platform = 'unknown';
    if (userAgent.includes('android')) platform = 'android';
    else if (userAgent.includes('iphone') || userAgent.includes('ipad')) platform = 'ios';
    else if (userAgent.includes('windows')) platform = 'windows';
    else if (userAgent.includes('mac')) platform = 'mac';
    else if (userAgent.includes('linux')) platform = 'linux';

    // Professional mobile detection with multiple criteria
    const mobilePatterns = [
      /android.*mobile/i,
      /iphone/i,
      /ipod/i,
      /blackberry/i,
      /windows phone/i,
      /opera mini/i,
      /opera mobi/i,
      /mobile/i
    ];

    const tabletPatterns = [
      /ipad/i,
      /android(?!.*mobile)/i,
      /tablet/i,
      /kindle/i,
      /silk/i,
      /playbook/i
    ];

    const isMobileDevice = mobilePatterns.some(pattern => pattern.test(userAgent)) ||
                          (screenWidth <= 768 && touchSupported);
    
    const isTabletDevice = tabletPatterns.some(pattern => pattern.test(userAgent)) ||
                          (screenWidth > 768 && screenWidth <= 1024 && touchSupported);

    const isDesktopDevice = !isMobileDevice && !isTabletDevice;

    let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
    if (isMobileDevice) deviceType = 'mobile';
    else if (isTabletDevice) deviceType = 'tablet';

    // Game API compatible device category
    const deviceCategory: 'mobile' | 'desktop' = (deviceType === 'mobile') ? 'mobile' : 'desktop';

    return {
      type: deviceType,
      isMobile: isMobileDevice,
      isTablet: isTabletDevice,
      isDesktop: isDesktopDevice,
      userAgent,
      screenWidth,
      screenHeight,
      orientation: screenWidth > screenHeight ? 'landscape' : 'portrait',
      touchSupported,
      platform,
      deviceCategory
    };
  });

  useEffect(() => {
    const handleResize = () => {
      setDeviceInfo(prev => {
        const newWidth = window.innerWidth;
        const newHeight = window.innerHeight;
        
        // Re-evaluate device type based on new dimensions
        const isMobileDevice = prev.userAgent.includes('mobile') || 
                              prev.userAgent.includes('iphone') ||
                              (newWidth <= 768 && prev.touchSupported);
        
        const isTabletDevice = prev.userAgent.includes('ipad') ||
                              prev.userAgent.includes('tablet') ||
                              (newWidth > 768 && newWidth <= 1024 && prev.touchSupported);

        const isDesktopDevice = !isMobileDevice && !isTabletDevice;

        let deviceType: 'mobile' | 'tablet' | 'desktop' = 'desktop';
        if (isMobileDevice) deviceType = 'mobile';
        else if (isTabletDevice) deviceType = 'tablet';

        const deviceCategory: 'mobile' | 'desktop' = (deviceType === 'mobile') ? 'mobile' : 'desktop';

        return {
          ...prev,
          type: deviceType,
          isMobile: isMobileDevice,
          isTablet: isTabletDevice,
          isDesktop: isDesktopDevice,
          screenWidth: newWidth,
          screenHeight: newHeight,
          orientation: newWidth > newHeight ? 'landscape' : 'portrait',
          deviceCategory
        };
      });
    };

    const handleOrientationChange = () => {
      setTimeout(handleResize, 100); // Delay to get accurate dimensions
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
    };
  }, []);

  return deviceInfo;
};