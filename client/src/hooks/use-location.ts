import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useLocation() {
  const [locationStatus, setLocationStatus] = useState<'DENIED' | 'TRACKING' | 'ERROR'>('DENIED');
  const [position, setPosition] = useState<GeolocationPosition | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus('ERROR');
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location tracking.",
        variant: "destructive",
      });
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition(pos);
        setLocationStatus('TRACKING');
      },
      (error) => {
        console.error('Location error:', error);
        setLocationStatus('ERROR');
        if (error.code === error.PERMISSION_DENIED) {
          toast({
            title: "Location access denied",
            description: "Enable location access in your browser settings for safety monitoring.",
            variant: "destructive",
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [toast]);

  return { locationStatus, position };
}
