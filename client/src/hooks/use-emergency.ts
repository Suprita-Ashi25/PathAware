import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from './use-location';

export function useEmergency() {
  const { toast } = useToast();
  const { position } = useLocation();

  const triggerSOSMutation = useMutation({
    mutationFn: async () => {
      const location = position ? {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      } : null;

      const response = await apiRequest('POST', '/api/emergency/sos', {
        location,
        message: 'Emergency SOS triggered',
        timestamp: new Date().toISOString(),
      });

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "SOS Alert Sent",
        description: `Emergency alerts sent to ${data.contactsNotified} contacts.`,
      });
    },
    onError: (error) => {
      console.error('SOS trigger failed:', error);
      toast({
        title: "SOS Failed",
        description: "Failed to send emergency alert. Please try again.",
        variant: "destructive",
      });
    }
  });

  const triggerSOS = () => {
    triggerSOSMutation.mutate();
  };

  return {
    triggerSOS,
    isTriggering: triggerSOSMutation.isPending,
  };
}
