import { useState, useEffect } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  speed: 'slow' | 'medium' | 'fast';
  effectiveType: string;
  downlink: number;
  rtt: number;
}

export const useNetworkStatus = () => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: navigator.onLine,
    speed: 'medium',
    effectiveType: '4g',
    downlink: 10,
    rtt: 50
  });

  useEffect(() => {
    const updateNetworkStatus = () => {
      const connection = (navigator as any).connection || 
                        (navigator as any).mozConnection || 
                        (navigator as any).webkitConnection;

      if (connection) {
        const { effectiveType, downlink, rtt } = connection;
        
        let speed: 'slow' | 'medium' | 'fast' = 'medium';
        
        if (effectiveType === '4g' && downlink > 5) {
          speed = 'fast';
        } else if (effectiveType === '3g' || (effectiveType === '4g' && downlink <= 5)) {
          speed = 'medium';
        } else {
          speed = 'slow';
        }

        setNetworkStatus({
          isOnline: navigator.onLine,
          speed,
          effectiveType,
          downlink,
          rtt
        });
      } else {
        setNetworkStatus(prev => ({
          ...prev,
          isOnline: navigator.onLine
        }));
      }
    };

    const handleOnline = () => updateNetworkStatus();
    const handleOffline = () => updateNetworkStatus();

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Connection değişikliklerini dinle
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', updateNetworkStatus);
    }

    // İlk yükleme
    updateNetworkStatus();

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      
      if (connection) {
        connection.removeEventListener('change', updateNetworkStatus);
      }
    };
  }, []);

  return networkStatus;
};