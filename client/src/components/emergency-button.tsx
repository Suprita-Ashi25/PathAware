import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useEmergency } from "@/hooks/use-emergency";

interface EmergencyButtonProps {
  onSOSTriggered: () => void;
}

export default function EmergencyButton({ onSOSTriggered }: EmergencyButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const { triggerSOS } = useEmergency();

  const handlePress = () => {
    setIsPressed(true);
    setTimeout(() => {
      setIsPressed(false);
      triggerSOS();
      onSOSTriggered();
    }, 3000);
  };

  const handleRelease = () => {
    setIsPressed(false);
  };

  return (
    <div className="px-6 py-4 bg-gradient-to-r from-alert-red to-red-600">
      <button 
        className={`w-full bg-white text-alert-red font-bold py-4 px-6 rounded-2xl shadow-lg flex items-center justify-center space-x-3 transition-all duration-200 ${
          isPressed ? 'bg-red-50 scale-95' : 'hover:bg-red-50'
        }`}
        onMouseDown={handlePress}
        onMouseUp={handleRelease}
        onMouseLeave={handleRelease}
        onTouchStart={handlePress}
        onTouchEnd={handleRelease}
      >
        <AlertTriangle className="w-5 h-5" />
        <span className="text-lg">
          {isPressed ? 'RELEASING...' : 'EMERGENCY SOS'}
        </span>
      </button>
      <p className="text-white text-xs text-center mt-2 opacity-90">
        Hold for 3 seconds to activate
      </p>
    </div>
  );
}
