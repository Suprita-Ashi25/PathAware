import { Settings as SettingsIcon, MapPin, Shield, Info } from 'lucide-react';
import { useState } from 'react';
import BottomNavigation from '@/components/bottom-navigation';
import PathAwareLogo from '@/components/pathaware-logo';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

export default function Settings() {
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [sosEnabled, setSosEnabled] = useState(true);
  return <div className="pb-24 min-h-screen"><div className="max-w-3xl mx-auto p-5 space-y-4"><div className="border-b pb-4"><PathAwareLogo compact /></div><div className="flex items-center gap-3"><SettingsIcon className="w-6 h-6 text-blue-600" /><div><h1 className="text-xl font-bold">Settings</h1><p className="text-xs text-slate-500">PathAware preferences</p></div></div><Card><CardHeader><CardTitle>Permissions & safety</CardTitle></CardHeader><CardContent className="space-y-4"><div className="flex items-center justify-between gap-4"><div className="flex gap-3"><MapPin className="w-5 h-5 text-blue-600 mt-1" /><div><p className="font-medium text-sm">Location access</p><p className="text-xs text-slate-500">Used to plan routes and attach reports to your location.</p></div></div><Switch checked={locationEnabled} onCheckedChange={setLocationEnabled} /></div><div className="flex items-center justify-between gap-4"><div className="flex gap-3"><Shield className="w-5 h-5 text-red-600 mt-1" /><div><p className="font-medium text-sm">Emergency actions</p><p className="text-xs text-slate-500">Keep emergency calling and SOS controls available.</p></div></div><Switch checked={sosEnabled} onCheckedChange={setSosEnabled} /></div></CardContent></Card><Card><CardContent className="p-5"><div className="flex gap-3"><Info className="w-5 h-5 text-slate-500 mt-1" /><div><p className="font-semibold">About PathAware</p><p className="text-sm text-slate-500 mt-1">PathAware provides route decision support from live routing and OpenStreetMap-derived environmental data. A score is not a guarantee of safety.</p></div></div></CardContent></Card></div><BottomNavigation /></div>;
}
