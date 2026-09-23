import { Home, Map, Users, Settings } from "lucide-react";
import { useLocation } from "wouter";

export default function BottomNavigation() {
  const [location, navigate] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: Map, label: "Map", path: "/map" },
    { icon: Users, label: "Contacts", path: "/contacts" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto bg-white border-t border-gray-200 z-50">
      <div className="flex items-center justify-around py-3">
        {navItems.map((item) => (
          <button
            key={item.path}
            onClick={() => navigate(item.path)}
            className={`flex flex-col items-center space-y-1 ${
              location === item.path ? 'text-safety-blue' : 'text-gray-400'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
