import { MapPin, Mic, User, Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "@/hooks/use-location";
import { useAudioMonitoring } from "@/hooks/use-audio-monitoring";
import { useMotionDetection } from "@/hooks/use-motion-detection";

export default function SafetyStatus() {
  const { locationStatus } = useLocation();
  const { audioStatus } = useAudioMonitoring();
  const { motionStatus } = useMotionDetection();

  const { data: contacts } = useQuery({
    queryKey: ['/api/emergency-contacts'],
  });

  const statusItems = [
    {
      icon: MapPin,
      label: "Location",
      status: locationStatus,
      color: locationStatus === 'TRACKING' ? 'text-trust-green' : 'text-gray-500'
    },
    {
      icon: Mic,
      label: "Audio Monitor",
      status: audioStatus,
      color: audioStatus === 'LISTENING' ? 'text-trust-green' : 'text-gray-500'
    },
    {
      icon: User,
      label: "Motion",
      status: motionStatus,
      color: motionStatus === 'NORMAL' ? 'text-trust-green' : 'text-caution-orange'
    },
    {
      icon: Users,
      label: "Contacts",
      status: `${contacts?.length || 0} ADDED`,
      color: 'text-safety-blue'
    }
  ];

  return (
    <div className="px-6 py-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Safety Status</h2>
      
      <div className="grid grid-cols-2 gap-4">
        {statusItems.map((item, index) => (
          <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{item.label}</p>
                <p className={`font-semibold ${item.color}`}>{item.status}</p>
              </div>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
