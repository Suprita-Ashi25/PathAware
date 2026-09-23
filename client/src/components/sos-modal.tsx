import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

interface SOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SOSModal({ isOpen, onClose }: SOSModalProps) {
  const [cancelTimer, setCancelTimer] = useState(0);
  const [isPressed, setIsPressed] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPressed && cancelTimer > 0) {
      interval = setInterval(() => {
        setCancelTimer(prev => {
          if (prev <= 1) {
            setIsPressed(false);
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPressed, cancelTimer, onClose]);

  const handleCancelPress = () => {
    setIsPressed(true);
    setCancelTimer(3);
  };

  const handleCancelRelease = () => {
    setIsPressed(false);
    setCancelTimer(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-white">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-alert-red rounded-full flex items-center justify-center mx-auto animate-pulse">
            <AlertTriangle className="w-10 h-10 text-white" />
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-alert-red mb-2">SOS ACTIVATED</h3>
            <p className="text-sm text-gray-600">
              Emergency alerts are being sent to your contacts. Help is on the way.
            </p>
          </div>
          
          <div className="space-y-3">
            <Button
              className={`w-full bg-alert-red hover:bg-red-600 text-white py-4 text-lg font-bold ${
                isPressed ? 'bg-red-700' : ''
              }`}
              onMouseDown={handleCancelPress}
              onMouseUp={handleCancelRelease}
              onMouseLeave={handleCancelRelease}
              onTouchStart={handleCancelPress}
              onTouchEnd={handleCancelRelease}
            >
              {isPressed ? `Cancel SOS (${cancelTimer}s)` : 'Cancel SOS'}
            </Button>
            <p className="text-xs text-gray-500">
              Press and hold for 3 seconds to cancel
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
