import { Shield, MapPin, Mic } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PermissionModal({ isOpen, onClose }: PermissionModalProps) {
  const { toast } = useToast();

  const handleGrantPermissions = async () => {
    try {
      // Request location permission
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => {
            toast({
              title: "Location access granted",
              description: "SafePathAI can now track your location for safety monitoring.",
            });
          },
          (error) => {
            console.error("Location permission denied:", error);
            toast({
              title: "Location access denied",
              description: "Some features may not work without location access.",
              variant: "destructive",
            });
          }
        );
      }

      // Request microphone permission
      try {
        await navigator.mediaDevices.getUserMedia({ audio: true });
        toast({
          title: "Microphone access granted",
          description: "SafePathAI can now monitor audio for safety purposes.",
        });
      } catch (error) {
        console.error("Microphone permission denied:", error);
        toast({
          title: "Microphone access denied",
          description: "Audio monitoring features will be limited.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Permission request failed:", error);
    }
    
    onClose();
  };

  const handleSkipPermissions = () => {
    toast({
      title: "Permissions skipped",
      description: "You can enable permissions later in settings.",
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-caution-orange rounded-full flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-center text-lg font-semibold">
            Permission Required
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            SafePathAI needs access to your location and microphone to provide safety monitoring.
          </p>
          
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <MapPin className="w-5 h-5 text-safety-blue" />
              <div>
                <p className="text-sm font-medium">Location Access</p>
                <p className="text-xs text-gray-500">Track your location for safety monitoring</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <Mic className="w-5 h-5 text-trust-green" />
              <div>
                <p className="text-sm font-medium">Microphone Access</p>
                <p className="text-xs text-gray-500">Monitor audio for distress signals</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleGrantPermissions}
              className="w-full bg-safety-blue hover:bg-blue-600"
            >
              Grant Permissions
            </Button>
            <Button 
              onClick={handleSkipPermissions}
              variant="outline"
              className="w-full"
            >
              Skip for Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
