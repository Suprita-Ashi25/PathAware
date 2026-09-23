import { Clock, Signal, Wifi, Battery } from "lucide-react";

export default function StatusBar() {
  const currentTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });

  return (
    <div className="bg-safety-blue text-white px-4 py-2 flex justify-between items-center text-sm">
      <span className="font-medium">{currentTime}</span>
      <div className="flex items-center space-x-2">
        <Signal className="w-3 h-3" />
        <Wifi className="w-3 h-3" />
        <Battery className="w-3 h-3" />
      </div>
    </div>
  );
}
