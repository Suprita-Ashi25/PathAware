import { Switch, Route } from 'wouter';
import { queryClient } from './lib/queryClient';
import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import Home from '@/pages/home';
import MapPage from '@/pages/map';
import Contacts from '@/pages/contacts';
import Settings from '@/pages/settings';
import NotFound from '@/pages/not-found';

function Router() {
  return <div className="min-h-screen bg-slate-50"><Switch><Route path="/" component={Home} /><Route path="/map" component={MapPage} /><Route path="/contacts" component={Contacts} /><Route path="/settings" component={Settings} /><Route component={NotFound} /></Switch></div>;
}

export default function App() {
  return <QueryClientProvider client={queryClient}><TooltipProvider><Toaster /><Router /></TooltipProvider></QueryClientProvider>;
}
