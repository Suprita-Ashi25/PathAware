import { ArrowRight, MapPin, ShieldCheck, Siren, Users, Clock3, Phone } from 'lucide-react';
import { useLocation } from 'wouter';
import BottomNavigation from '@/components/bottom-navigation';
import PathAwareLogo from '@/components/pathaware-logo';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { loadReports } from '@/services/pathaware';

export default function Home() {
  const [, navigate] = useLocation();
  const reports = loadReports();
  return <div className="pb-24 min-h-screen">
    <header className="bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-900 text-white px-5 pt-5 pb-8"><div className="max-w-6xl mx-auto"><div className="flex items-center justify-between gap-4 mb-7"><div className="rounded-xl bg-white/95 px-3 py-2 shadow-lg"><PathAwareLogo /></div><span className="hidden sm:block text-xs font-semibold tracking-[0.2em] uppercase text-indigo-100">Safer routes • Smarter choices</span></div><h1 className="text-3xl md:text-4xl font-bold mt-2">Choose a route with more context.</h1><p className="mt-3 text-blue-100 max-w-xl">Walking routes are compared using mapped lighting, nearby services, activity, travel time and community reports.</p><Button className="mt-6 bg-white text-blue-700 hover:bg-blue-50" onClick={() => navigate('/map')}>Plan a route <ArrowRight className="w-4 h-4 ml-2" /></Button></div></header>
    <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-4 -mt-3">
      <div className="grid md:grid-cols-3 gap-4"><Card><CardContent className="p-5"><MapPin className="w-6 h-6 text-blue-600" /><p className="text-2xl font-bold mt-3">Live routes</p><p className="text-sm text-slate-500 mt-1">OpenStreetMap-based walking directions with alternatives.</p></CardContent></Card><Card><CardContent className="p-5"><ShieldCheck className="w-6 h-6 text-emerald-600" /><p className="text-2xl font-bold mt-3">Explainable</p><p className="text-sm text-slate-500 mt-1">Every score is broken into visible safety factors.</p></CardContent></Card><Card><CardContent className="p-5"><Users className="w-6 h-6 text-violet-600" /><p className="text-2xl font-bold mt-3">Community-aware</p><p className="text-sm text-slate-500 mt-1">Your local reports can contribute to future route comparisons.</p></CardContent></Card></div>
      <Card><CardContent className="p-5"><div className="flex items-center justify-between"><div><h2 className="font-bold">Quick start</h2><p className="text-sm text-slate-500 mt-1">Start from your location, search a destination, then compare the routes.</p></div><Button onClick={() => navigate('/map')}>Open planner</Button></div></CardContent></Card>
      <div className="grid md:grid-cols-2 gap-4"><Card><CardContent className="p-5"><div className="flex items-center gap-2 font-semibold"><Siren className="w-5 h-5 text-red-600" /> Emergency support</div><p className="text-sm text-slate-500 mt-2">Emergency calling is available directly from PathAware.</p><div className="flex gap-2 mt-4"><Button variant="destructive" onClick={() => window.location.href='tel:112'}><Phone className="w-4 h-4 mr-2" />Call 112</Button><Button variant="outline" onClick={() => navigate('/contacts')}>Contacts</Button></div></CardContent></Card><Card><CardContent className="p-5"><div className="flex items-center gap-2 font-semibold"><Clock3 className="w-5 h-5 text-amber-600" /> Community reports</div><p className="text-sm text-slate-500 mt-2">{reports.length} report{reports.length === 1 ? '' : 's'} stored on this device.</p></CardContent></Card></div>
    </main><BottomNavigation />
  </div>;
}
