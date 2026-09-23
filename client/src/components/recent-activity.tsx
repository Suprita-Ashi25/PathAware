import { CheckCircle, MapPin, Settings } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import type { ActivityLog } from "@shared/schema";

export default function RecentActivity() {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['/api/activity-logs'],
  });

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'journey':
        return CheckCircle;
      case 'location_share':
        return MapPin;
      case 'settings_update':
        return Settings;
      default:
        return CheckCircle;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'journey':
        return 'bg-green-50 text-trust-green';
      case 'location_share':
        return 'bg-blue-50 text-safety-blue';
      case 'settings_update':
        return 'bg-gray-50 text-slate-custom';
      case 'emergency':
        return 'bg-red-50 text-alert-red';
      default:
        return 'bg-gray-50 text-slate-custom';
    }
  };

  const getIconBgColor = (type: string) => {
    switch (type) {
      case 'journey':
        return 'bg-trust-green';
      case 'location_share':
        return 'bg-safety-blue';
      case 'settings_update':
        return 'bg-slate-custom';
      case 'emergency':
        return 'bg-alert-red';
      default:
        return 'bg-slate-custom';
    }
  };

  if (isLoading) {
    return (
      <div className="px-6 py-4 space-y-4">
        <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg animate-pulse">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                <div className="h-3 bg-gray-300 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="px-6 py-4 space-y-4">
      <h2 className="text-lg font-semibold text-gray-800">Recent Activity</h2>
      
      <div className="space-y-3">
        {activities?.slice(0, 3).map((activity: ActivityLog) => {
          const Icon = getActivityIcon(activity.type);
          const colorClass = getActivityColor(activity.type);
          const iconBgColor = getIconBgColor(activity.type);
          
          return (
            <div key={activity.id} className={`flex items-center space-x-3 p-3 rounded-lg ${colorClass}`}>
              <div className={`w-8 h-8 ${iconBgColor} rounded-full flex items-center justify-center`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                <p className="text-xs text-gray-500">
                  {formatDistanceToNow(new Date(activity.timestamp!), { addSuffix: true })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
