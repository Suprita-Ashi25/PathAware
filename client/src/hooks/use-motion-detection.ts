import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export function useMotionDetection() {
  const [motionStatus, setMotionStatus] = useState<'NORMAL' | 'UNUSUAL' | 'PANIC'>('NORMAL');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (!window.DeviceMotionEvent) {
      console.log('Device motion not supported');
      return;
    }

    const handleDeviceMotion = (event: DeviceMotionEvent) => {
      const { acceleration } = event;
      if (!acceleration) return;

      const { x, y, z } = acceleration;
      const totalAcceleration = Math.sqrt((x || 0) ** 2 + (y || 0) ** 2 + (z || 0) ** 2);

      // Detect sudden, strong movements that might indicate panic or danger
      if (totalAcceleration > 15) {
        setMotionStatus('PANIC');
        toast({
          title: "Unusual movement detected",
          description: "Strong motion detected. Are you okay?",
          variant: "destructive",
        });
      } else if (totalAcceleration > 8) {
        setMotionStatus('UNUSUAL');
      } else {
        setMotionStatus('NORMAL');
      }
    };

    // Request permission for device motion on iOS
    if (typeof (DeviceMotionEvent as any).requestPermission === 'function') {
      (DeviceMotionEvent as any).requestPermission().then((permissionState: string) => {
        if (permissionState === 'granted') {
          window.addEventListener('devicemotion', handleDeviceMotion);
          setIsMonitoring(true);
        }
      });
    } else {
      // Non-iOS devices
      window.addEventListener('devicemotion', handleDeviceMotion);
      setIsMonitoring(true);
    }

    return () => {
      window.removeEventListener('devicemotion', handleDeviceMotion);
      setIsMonitoring(false);
    };
  }, [toast]);

  return { motionStatus, isMonitoring };
}
