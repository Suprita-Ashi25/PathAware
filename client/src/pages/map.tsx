import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, Clock3, Crosshair, Flag, Hospital, MapPin, Navigation, Phone, Search, ShieldCheck, Siren, Users, Zap } from 'lucide-react';
import BottomNavigation from '@/components/bottom-navigation';
import PathAwareLogo from '@/components/pathaware-logo';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { getSafetyData, getWalkingRoutes, loadAllReports, reverseGeocode, saveReport, scoreRoutes, searchPlace, type Coordinate, type RouteResult, type PriorityMode } from '@/services/pathaware';
import { isGoogleMapsConfigured, loadGoogleMaps } from '@/lib/googlemaps';

declare global { interface Window { L: any } }

const colors = ['#2563eb', '#f59e0b', '#64748b'];

function formatDuration(seconds: number) { const m = Math.round(seconds / 60); return `${m} min`; }
function formatDistance(meters: number) { return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`; }

function getPriorityLabel(priority: PriorityMode) {
  return priority === 'safest' ? 'Safest' : priority === 'fastest' ? 'Fastest' : priority === 'custom' ? 'My priority' : 'Balanced';
}

function getPriorityDescription(priority: PriorityMode, customSafetyWeight = 0.65) {
  if (priority === 'safest') return 'Puts the strongest emphasis on safety signals.';
  if (priority === 'fastest') return 'Puts the strongest emphasis on shorter travel time.';
  if (priority === 'custom') return `${Math.round(customSafetyWeight * 100)}% safety · ${Math.round((1 - customSafetyWeight) * 100)}% time.`;
  return 'Balances safety signals with travel time.';
}

export default function MapPage() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const googleMap = useRef<any>(null);
  const layers = useRef<any[]>([]);
  const googleLayers = useRef<any[]>([]);
  const [mapProvider, setMapProvider] = useState<'google' | 'leaflet'>('google');
  const { toast } = useToast();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [fromCoord, setFromCoord] = useState<Coordinate | null>(null);
  const [toCoord, setToCoord] = useState<Coordinate | null>(null);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [routes, setRoutes] = useState<RouteResult[]>([]);
  const [selected, setSelected] = useState(0);
  const [showReport, setShowReport] = useState(false);
  const [reportType, setReportType] = useState('Poor lighting');
  const [reportDescription, setReportDescription] = useState('');
  const [currentLocation, setCurrentLocation] = useState<Coordinate | null>(null);
  const [travelHour, setTravelHour] = useState(new Date().getHours());
  const [priority, setPriority] = useState<PriorityMode>(() => (localStorage.getItem('pathaware-priority') as PriorityMode) || 'balanced');
  const [customSafetyWeight, setCustomSafetyWeight] = useState(() => Number(localStorage.getItem('pathaware-safety-weight') || 0.65));

  useEffect(() => {
    let cancelled = false;

    const setupMap = async () => {
      if (!mapRef.current) return;
      if (isGoogleMapsConfigured) {
        try {
          const google = await loadGoogleMaps();
          if (cancelled || !mapRef.current) return;
          googleMap.current = new google.Map(mapRef.current, {
            center: { lat: 19.2183, lng: 73.0833 },
            zoom: 12,
            mapTypeControl: true,
            streetViewControl: true,
            fullscreenControl: true,
            zoomControl: true,
            clickableIcons: true,
          });
          setMapProvider('google');
          return;
        } catch (error) {
          console.warn('Google Maps unavailable; using OpenStreetMap fallback.', error);
        }
      }

      if (!cancelled && mapRef.current && window.L && !leafletMap.current) {
        const L = window.L;
        leafletMap.current = L.map(mapRef.current, { zoomControl: true }).setView([19.2183, 73.0833], 12);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap contributors',
        }).addTo(leafletMap.current);
        setMapProvider('leaflet');
      }
    };

    setupMap();
    return () => {
      cancelled = true;
      googleLayers.current.forEach(layer => layer.setMap?.(null));
      googleLayers.current = [];
      googleMap.current = null;
      leafletMap.current?.remove();
      leafletMap.current = null;
    };
  }, []);

  const locate = () => {
    if (!navigator.geolocation) { toast({ title: 'Location unavailable', description: 'Your browser does not provide geolocation.', variant: 'destructive' }); return; }
    navigator.geolocation.getCurrentPosition(async pos => {
      const coord: Coordinate = [pos.coords.latitude, pos.coords.longitude];
      setCurrentLocation(coord); setFromCoord(coord);
      try { setFrom(await reverseGeocode(...coord)); } catch { setFrom(`${coord[0].toFixed(5)}, ${coord[1].toFixed(5)}`); }
      if (googleMap.current) googleMap.current.setCenter({ lat: coord[0], lng: coord[1] }), googleMap.current.setZoom(16);
      else leafletMap.current?.setView(coord, 15);
    }, () => toast({ title: 'Location permission needed', description: 'Allow location access to use your current position.', variant: 'destructive' }));
  };

  const searchDestination = async (value: string) => {
    setTo(value);
    if (value.trim().length < 3) { setSuggestions([]); return; }
    try { setSuggestions(await searchPlace(value)); } catch { setSuggestions([]); }
  };

  const chooseDestination = (place: any) => { setTo(place.display_name); setToCoord([Number(place.lat), Number(place.lon)]); setSuggestions([]); };

  const planRoute = async () => {
    let start = fromCoord;
    if (!start && from.trim()) {
      const result = await searchPlace(from.trim());
      if (result[0]) start = [Number(result[0].lat), Number(result[0].lon)];
    }
    if (!start) { locate(); toast({ title: 'Set your starting point', description: 'Use your location or enter a starting place.' }); return; }
    let destination = toCoord;
    if (!destination && to.trim()) {
      const result = await searchPlace(to.trim());
      if (result[0]) destination = [Number(result[0].lat), Number(result[0].lon)];
    }
    if (!destination) { toast({ title: 'Destination required', description: 'Enter a destination before planning.', variant: 'destructive' }); return; }
    setLoading(true); setStatus('Finding walking routes…');
    try {
      const baseRoutes = await getWalkingRoutes(start, destination);
      setStatus('Checking mapped safety signals…');
      const data = await getSafetyData(baseRoutes);
      const reports = await loadAllReports();
      const scored = scoreRoutes(baseRoutes, data, reports, travelHour, priority, customSafetyWeight);
      const quickestId = scored.reduce((best, r) => r.duration < best.duration ? r : best, scored[0]).id;
      const safestId = scored.reduce((best, r) => r.safety.environmentalScore > best.safety.environmentalScore ? r : best, scored[0]).id;
      const recommendedId = scored.reduce((best, r) => r.safety.priorityScore > best.safety.priorityScore ? r : best, scored[0]).id;
      const withLabels = scored.map(r => ({ ...r, label: (r.id === recommendedId ? 'Recommended' : r.id === quickestId ? 'Quickest' : r.id === safestId ? 'Safest' : 'Alternative') as RouteResult['label'] }));
      const ordered = [...withLabels].sort((a, b) => b.safety.priorityScore - a.safety.priorityScore);
      setRoutes(ordered); setSelected(0);
      const all = ordered.flatMap(r => r.geometry);

      if (mapProvider === 'google' && googleMap.current) {
        googleLayers.current.forEach(layer => layer.setMap?.(null));
        googleLayers.current = [];
        const google = window.google.maps;
        const bounds = new google.LatLngBounds();

        ordered.forEach((route, index) => {
          const path = route.geometry.map(([lat, lng]) => ({ lat, lng }));
          path.forEach((p: any) => bounds.extend(p));
          const line = new google.Polyline({
            path,
            geodesic: true,
            strokeColor: colors[index] || '#64748b',
            strokeOpacity: index === 0 ? 0.92 : 0.55,
            strokeWeight: index === 0 ? 7 : 5,
            map: googleMap.current,
          });
          line.addListener('click', () => setSelected(index));
          googleLayers.current.push(line);
        });

        const startMarker = new google.Marker({
          position: { lat: start[0], lng: start[1] },
          map: googleMap.current,
          title: 'Start',
          label: 'A',
        });
        const endMarker = new google.Marker({
          position: { lat: destination[0], lng: destination[1] },
          map: googleMap.current,
          title: 'Destination',
          label: 'B',
        });
        googleLayers.current.push(startMarker, endMarker);
        googleMap.current.fitBounds(bounds, 60);
      } else {
        const map = leafletMap.current; const L = window.L;
        layers.current.forEach(layer => layer.remove()); layers.current = [];
        ordered.forEach((route, index) => {
          const line = L.polyline(route.geometry, {
            color: colors[index] || '#64748b',
            weight: index === 0 ? 7 : 5,
            opacity: index === 0 ? 0.9 : 0.55,
            dashArray: index === 0 ? undefined : '10 8',
          }).addTo(map);
          line.on('click', () => setSelected(index));
          layers.current.push(line);
        });
        const startMarker = L.marker(start).addTo(map).bindPopup('Start');
        const endMarker = L.marker(destination).addTo(map).bindPopup('Destination');
        layers.current.push(startMarker, endMarker);
        map.fitBounds(L.latLngBounds(all), { padding: [30, 30] });
      }
      setStatus('');
    } catch (error: any) {
      setStatus(''); toast({ title: 'Could not plan route', description: error.message || 'Try another destination.', variant: 'destructive' });
    } finally { setLoading(false); }
  };

  const applyPriority = (mode: PriorityMode, safetyWeight = customSafetyWeight) => {
    setPriority(mode);
    localStorage.setItem('pathaware-priority', mode);
    localStorage.setItem('pathaware-safety-weight', String(safetyWeight));
    if (!routes.length) return;
    const reranked = routes.map(r => ({ ...r, safety: { ...r.safety, priorityMode: mode } }));
    const fastestId = reranked.reduce((best, r) => r.duration < best.duration ? r : best, reranked[0]).id;
    // Rebuild priority scores from the already-computed safety/environmental metrics.
    const safeWeight = mode === 'safest' ? 0.90 : mode === 'fastest' ? 0.25 : mode === 'custom' ? safetyWeight : 0.65;
    const recalculated = reranked.map(r => {
      const speed = Math.min(100, 100 * Math.min(...reranked.map(x => x.duration)) / r.duration);
      const priorityScore = Math.round(r.safety.environmentalScore * safeWeight + speed * (1 - safeWeight));
      return { ...r, safety: { ...r.safety, score: priorityScore, priorityScore, priorityMode: mode } };
    });
    const recommendedId = recalculated.reduce((best, r) => r.safety.priorityScore > best.safety.priorityScore ? r : best, recalculated[0]).id;
    const safestId = recalculated.reduce((best, r) => r.safety.environmentalScore > best.safety.environmentalScore ? r : best, recalculated[0]).id;
    const ordered = recalculated.map(r => ({ ...r, label: (r.id === recommendedId ? 'Recommended' : r.id === fastestId ? 'Quickest' : r.id === safestId ? 'Safest' : 'Alternative') as RouteResult['label'] })).sort((a,b) => b.safety.priorityScore-a.safety.priorityScore);
    setRoutes(ordered);
    setSelected(0);
  };

  const submitReport = async () => {
    if (!currentLocation && !fromCoord) {
      toast({ title: 'Location required', description: 'Use your current location before submitting a report.', variant: 'destructive' });
      return;
    }
    const coord = currentLocation || fromCoord!;
    try {
      const result = await saveReport({
        lat: coord[0],
        lon: coord[1],
        type: reportType,
        description: reportDescription.trim(),
      });
      setShowReport(false);
      setReportDescription('');
      toast({
        title: result.syncedToCloud ? 'Report submitted & synced' : 'Report submitted',
        description: result.syncedToCloud
          ? 'Your safety report is saved to Firebase and will be available on other devices.'
          : 'Your safety report is saved on this device. Add Firebase keys to sync it across devices.',
      });
    } catch (error) {
      toast({ title: 'Report failed', description: 'Could not save this report. Please try again.', variant: 'destructive' });
    }
  };

  const selectedRoute = routes[selected];
  const labels = useMemo(() => routes.map((r) => r.label || 'Alternative'), [routes]);

  return <div className="pb-24 min-h-screen bg-slate-50">
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b px-4 py-3">
      <div className="flex items-center justify-between max-w-6xl mx-auto gap-4">
        <div className="flex items-center gap-3 min-w-0"><PathAwareLogo compact /><div className="hidden sm:block border-l pl-3"><h1 className="text-lg font-bold">The Route Nobody Warned Her About</h1></div></div>
        <Button variant="outline" size="sm" onClick={() => setShowReport(true)}><Flag className="w-4 h-4 mr-2" />Report</Button>
      </div>
    </header>

    <main className="max-w-6xl mx-auto p-4 space-y-4">
      <Card className="shadow-sm"><CardContent className="p-4">
        <div className="grid md:grid-cols-[1fr_1fr_auto] gap-3 items-end">
          <div><label className="text-xs font-semibold text-slate-500">START</label><div className="relative mt-1"><Input value={from} onChange={e => setFrom(e.target.value)} placeholder="Current location or place" /><Button type="button" size="icon" variant="ghost" className="absolute right-1 top-1" onClick={locate}><Crosshair className="w-4 h-4" /></Button></div></div>
          <div><label className="text-xs font-semibold text-slate-500">DESTINATION</label><div className="relative mt-1"><Input value={to} onChange={e => searchDestination(e.target.value)} placeholder="Where are you going?" /><Search className="absolute right-3 top-3 w-4 h-4 text-slate-400" />{suggestions.length > 0 && <div className="absolute top-11 left-0 right-0 z-50 bg-white border rounded-lg shadow-lg overflow-hidden">{suggestions.map((s, i) => <button key={i} className="w-full text-left p-3 hover:bg-slate-50 text-sm border-b last:border-0" onClick={() => chooseDestination(s)}>{s.display_name}</button>)}</div>}</div></div>
          <Button className="bg-blue-600 hover:bg-blue-700" onClick={planRoute} disabled={loading}><Navigation className="w-4 h-4 mr-2" />{loading ? 'Planning…' : 'Find routes'}</Button>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-slate-500"><span>Travel time:</span><input type="range" min="0" max="23" value={travelHour} onChange={e => setTravelHour(Number(e.target.value))} /><span className="font-semibold text-slate-700">{String(travelHour).padStart(2, '0')}:00</span>{status && <span className="text-blue-600">{status}</span>}</div>
        <div className="mt-4 rounded-xl border bg-slate-50 p-3">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div><div className="text-sm font-semibold text-slate-800">How should PathAware prioritize your route?</div><div className="text-xs text-slate-500">{getPriorityDescription(priority, customSafetyWeight)}</div></div>
            <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-1 rounded-full">Personalized</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['safest','balanced','fastest','custom'] as PriorityMode[]).map(mode => <button key={mode} type="button" onClick={() => applyPriority(mode)} className={`rounded-lg border px-3 py-2 text-left transition ${priority === mode ? 'border-blue-600 bg-white ring-2 ring-blue-100' : 'bg-white hover:border-slate-300'}`}>
              <div className="font-semibold text-sm">{getPriorityLabel(mode)}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{mode === 'safest' ? 'Safety first' : mode === 'balanced' ? 'Safety + time' : mode === 'fastest' ? 'Time first' : 'Choose weights'}</div>
            </button>)}
          </div>
          {priority === 'custom' && <div className="mt-3"><div className="flex justify-between text-xs mb-1"><span>Safety priority</span><span className="font-semibold">{Math.round(customSafetyWeight*100)}% safety · {Math.round((1-customSafetyWeight)*100)}% time</span></div><input className="w-full" type="range" min="0" max="100" value={Math.round(customSafetyWeight*100)} onChange={e => { const v=Number(e.target.value)/100; setCustomSafetyWeight(v); applyPriority('custom', v); }} /></div>}
        </div>
      </CardContent></Card>

      <Card className="border-blue-100 bg-blue-50/60"><CardContent className="p-4">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-blue-700 mt-0.5" />
          <div><h2 className="font-semibold text-blue-950">Personalized route recommendation</h2><p className="text-xs text-blue-900/70 mt-1">PathAware calculates a safety score for every route, then changes the ranking according to your selected priority. <strong>{getPriorityLabel(priority)}</strong> is currently active.</p></div>
        </div>
      </CardContent></Card>

      <div className="grid lg:grid-cols-[1.5fr_0.9fr] gap-4">
        <Card className="overflow-hidden">
          <div className="map-page-map-wrapper relative w-full overflow-hidden rounded-xl">
            <div ref={mapRef} className="map-page-map relative h-[520px] w-full" />
            <div className="absolute left-3 top-3 z-[20] rounded-full bg-white/95 px-3 py-1 text-xs font-medium shadow">
              {mapProvider === 'google' ? 'Google Maps' : 'OpenStreetMap fallback'}
            </div>
          </div>
        </Card>
        <div className="space-y-3">
          {!selectedRoute && <Card><CardContent className="p-6 text-center"><MapPin className="w-10 h-10 mx-auto text-blue-500 mb-3" /><h2 className="font-semibold text-lg">Plan a walking route</h2><p className="text-sm text-slate-500 mt-1">Use your location, choose a destination, and PathAware will compare available walking routes using mapped environmental and community signals.</p><Button className="mt-4" onClick={locate}><Crosshair className="w-4 h-4 mr-2" />Use my location</Button></CardContent></Card>}
          {routes.map((route, i) => <button key={route.id} onClick={() => setSelected(i)} className={`w-full text-left ${selected === i ? 'ring-2 ring-blue-500' : ''}`}><Card className="hover:shadow-md transition"><CardContent className="p-4"><div className="flex justify-between items-start gap-3"><div><div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full" style={{ background: colors[i] || '#64748b' }} /><h3 className="font-semibold">{labels[i]}</h3>{i === 0 && <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Recommended</Badge>}</div><div className="flex gap-3 text-xs text-slate-500 mt-2"><span><Clock3 className="inline w-3 h-3 mr-1" />{formatDuration(route.duration)}</span><span>{formatDistance(route.distance)}</span></div></div><div className="text-right"><div className="text-2xl font-bold text-slate-800">{route.safety.score}</div><div className="text-[10px] uppercase tracking-wide text-slate-400">Safety score</div></div></div></CardContent></Card></button>)}
          {selectedRoute && <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-3"><ShieldCheck className="w-5 h-5 text-emerald-600" /><h3 className="font-semibold">Why this route scored {selectedRoute.safety.score}</h3></div><div className="grid grid-cols-2 gap-2 text-xs">{[['Lighting', selectedRoute.safety.lighting], ['Emergency access', selectedRoute.safety.emergencyAccess], ['Nearby activity', selectedRoute.safety.activity], ['Community reports', selectedRoute.safety.reports], ['Time factor', selectedRoute.safety.time]].map(([name, value]) => <div key={name as string} className="rounded-lg bg-slate-50 p-2"><div className="text-slate-500">{name}</div><div className="font-semibold mt-1">{value}/100</div></div>)}</div><ul className="mt-3 space-y-2 text-xs text-slate-600">{selectedRoute.safety.explanation.map(x => <li key={x}>✓ {x}</li>)}</ul></CardContent></Card>}
        </div>
      </div>

      <Card><CardContent className="p-4"><div className="flex items-center justify-between"><div><h2 className="font-semibold">Emergency support</h2><p className="text-xs text-slate-500">Keep help within reach while you travel.</p></div><div className="flex gap-2"><Button variant="outline" size="sm" onClick={() => window.location.href='tel:112'}><Siren className="w-4 h-4 mr-1" />112</Button><Button variant="outline" size="sm" onClick={() => window.location.href='tel:108'}><Hospital className="w-4 h-4 mr-1" />108</Button></div></div></CardContent></Card>
    </main>

    {showReport && <div className="fixed inset-0 z-[99999] bg-black/40 flex items-end md:items-center justify-center p-4"><Card className="relative z-[100000] w-full max-w-md"><CardContent className="p-5 space-y-4"><div className="flex justify-between"><div><h2 className="font-bold text-lg">Report a safety issue</h2><p className="text-xs text-slate-500">The report is attached to your current location.</p></div><Button variant="ghost" onClick={() => setShowReport(false)}>×</Button></div><select className="w-full border rounded-md p-2 text-sm" value={reportType} onChange={e => setReportType(e.target.value)}><option>Poor lighting</option><option>Unsafe area</option><option>Suspicious activity</option><option>Harassment</option><option>Road obstruction</option><option>Other</option></select><textarea className="w-full border rounded-md p-2 text-sm min-h-24" value={reportDescription} onChange={e => setReportDescription(e.target.value)} placeholder="Add useful context (optional)" /><div className="flex gap-2"><Button variant="outline" className="flex-1" onClick={() => setShowReport(false)}>Cancel</Button><Button className="flex-1 bg-blue-600" onClick={submitReport}>Submit report</Button></div></CardContent></Card></div>}

    <BottomNavigation />
  </div>;
}
