export type Coordinate = [number, number];

export type SearchPlace = {
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
};

export type SafetyReport = {
  id: string;
  lat: number;
  lon: number;
  type: string;
  description: string;
  createdAt: string;
};

export type SafetyData = {
  lamps: Coordinate[];
  litRoads: number;
  police: Coordinate[];
  hospitals: Coordinate[];
  pharmacies: Coordinate[];
  activity: Coordinate[];
};

export type PriorityMode = 'safest' | 'balanced' | 'fastest' | 'custom';

export type RouteResult = {
  id: string;
  distance: number;
  duration: number;
  geometry: Coordinate[];
  label?: 'Recommended' | 'Alternative' | 'Quickest' | 'Safest';
  safety: {
    score: number;
    balancedScore: number;
    environmentalScore: number;
    priorityScore: number;
    priorityMode: PriorityMode;
    lighting: number;
    emergencyAccess: number;
    activity: number;
    reports: number;
    time: number;
    explanation: string[];
  };
};

const NOMINATIM = 'https://nominatim.openstreetmap.org';
const OSRM = 'https://router.project-osrm.org';
const OVERPASS = 'https://overpass-api.de/api/interpreter';

export async function searchPlace(query: string): Promise<SearchPlace[]> {
  const url = new URL(`${NOMINATIM}/search`);
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'jsonv2');
  url.searchParams.set('limit', '5');
  url.searchParams.set('addressdetails', '1');
  const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Place search failed');
  return response.json();
}

export async function reverseGeocode(lat: number, lon: number): Promise<string> {
  const url = new URL(`${NOMINATIM}/reverse`);
  url.searchParams.set('lat', String(lat));
  url.searchParams.set('lon', String(lon));
  url.searchParams.set('format', 'jsonv2');
  const response = await fetch(url.toString(), { headers: { Accept: 'application/json' } });
  if (!response.ok) throw new Error('Reverse geocoding failed');
  const data = await response.json();
  return data.display_name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`;
}

export async function getWalkingRoutes(from: Coordinate, to: Coordinate): Promise<RouteResult[]> {
  const coordinates = `${from[1]},${from[0]};${to[1]},${to[0]}`;
  const url = `${OSRM}/route/v1/foot/${coordinates}?alternatives=2&steps=true&geometries=geojson&overview=full`;
  const response = await fetch(url);
  if (!response.ok) throw new Error('Routing service unavailable');
  const data = await response.json();
  if (data.code !== 'Ok' || !data.routes?.length) throw new Error('No walking route found');

  return data.routes.map((route: any, index: number) => ({
    id: `route-${index}`,
    distance: route.distance,
    duration: route.duration,
    geometry: route.geometry.coordinates.map(([lon, lat]: [number, number]) => [lat, lon]),
    safety: {
      score: 0,
      balancedScore: 0,
      environmentalScore: 0,
      priorityScore: 0,
      priorityMode: 'balanced',
      lighting: 0,
      emergencyAccess: 0,
      activity: 0,
      reports: 0,
      time: 0,
      explanation: [],
    },
  }));
}

function boundsForRoutes(routes: RouteResult[]) {
  const points = routes.flatMap(r => r.geometry);
  const lats = points.map(p => p[0]);
  const lons = points.map(p => p[1]);
  return {
    south: Math.min(...lats) - 0.003,
    north: Math.max(...lats) + 0.003,
    west: Math.min(...lons) - 0.003,
    east: Math.max(...lons) + 0.003,
  };
}

export async function getSafetyData(routes: RouteResult[]): Promise<SafetyData> {
  const b = boundsForRoutes(routes);
  const bbox = `${b.south},${b.west},${b.north},${b.east}`;
  const query = `[out:json][timeout:25];(\n    node[highway=street_lamp](${bbox});\n    node[amenity=police](${bbox});\n    node[amenity=hospital](${bbox});\n    node[amenity=pharmacy](${bbox});\n    node[amenity=school](${bbox});\n    node[amenity=library](${bbox});\n    node[amenity=community_centre](${bbox});\n    node[amenity=place_of_worship](${bbox});\n    node[shop](${bbox});\n    way[highway][lit=yes](${bbox});\n  );out center;`;

  try {
    const response = await fetch(OVERPASS, {
      method: 'POST',
      body: new URLSearchParams({ data: query }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8' },
    });
    if (!response.ok) throw new Error('Overpass unavailable');
    const data = await response.json();
    const lamps: Coordinate[] = [];
    const police: Coordinate[] = [];
    const hospitals: Coordinate[] = [];
    const pharmacies: Coordinate[] = [];
    const activity: Coordinate[] = [];
    let litRoads = 0;

    for (const el of data.elements || []) {
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (typeof lat !== 'number' || typeof lon !== 'number') continue;
      const tags = el.tags || {};
      if (tags.highway === 'street_lamp') lamps.push([lat, lon]);
      else if (tags.amenity === 'police') police.push([lat, lon]);
      else if (tags.amenity === 'hospital') hospitals.push([lat, lon]);
      else if (tags.amenity === 'pharmacy') pharmacies.push([lat, lon]);
      else if (tags.amenity || tags.shop) activity.push([lat, lon]);
      if (tags.highway && tags.lit === 'yes') litRoads += 1;
    }
    return { lamps, litRoads, police, hospitals, pharmacies, activity };
  } catch {
    return { lamps: [], litRoads: 0, police: [], hospitals: [], pharmacies: [], activity: [] };
  }
}

export function loadReports(): SafetyReport[] {
  try { return JSON.parse(localStorage.getItem('pathaware-reports') || '[]'); } catch { return []; }
}

export async function saveReport(report: Omit<SafetyReport, 'id' | 'createdAt'>) {
  const localEntry: SafetyReport = {
    ...report,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  const next = [localEntry, ...loadReports()];
  localStorage.setItem('pathaware-reports', JSON.stringify(next));

  let syncedToCloud = false;
  try {
    const { isFirebaseConfigured, addReportToFirestore } = await import('@/lib/firebase');
    if (isFirebaseConfigured) {
      await addReportToFirestore(report);
      syncedToCloud = true;
    }
  } catch (error) {
    console.warn('Firebase report sync failed; report remains available locally.', error);
  }

  return { reports: next, syncedToCloud };
}

export async function loadAllReports(): Promise<SafetyReport[]> {
  const local = loadReports();
  try {
    const { isFirebaseConfigured, getReportsFromFirestore } = await import('@/lib/firebase');
    if (!isFirebaseConfigured) return local;
    const cloud = await getReportsFromFirestore();
    const merged = [...local, ...cloud.filter(r => !local.some(l => l.id === r.id))];
    return merged.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return local;
  }
}

function distanceMeters(a: Coordinate, b: Coordinate) {
  const R = 6371000;
  const p1 = a[0] * Math.PI / 180;
  const p2 = b[0] * Math.PI / 180;
  const dp = (b[0] - a[0]) * Math.PI / 180;
  const dl = (b[1] - a[1]) * Math.PI / 180;
  const h = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

function countNearRoute(route: Coordinate[], points: Coordinate[], radius = 120) {
  if (!points.length) return 0;
  let count = 0;
  for (let i = 0; i < points.length; i += Math.max(1, Math.floor(route.length / 80))) {
    if (points.some(p => distanceMeters(route[i], p) <= radius)) count++;
  }
  return Math.min(100, count * 12);
}

export function scoreRoutes(
  routes: RouteResult[],
  data: SafetyData,
  reports: SafetyReport[],
  hour: number,
  priority: PriorityMode = 'balanced',
  customSafetyWeight = 0.65,
) {
  const fastest = Math.min(...routes.map(r => r.duration));
  const safeWeight = priority === 'safest' ? 0.90 : priority === 'fastest' ? 0.25 : priority === 'custom' ? customSafetyWeight : 0.65;
  const timeWeight = 1 - safeWeight;

  return routes.map(route => {
    const lighting = Math.min(100, countNearRoute(route.geometry, data.lamps, 100) + Math.min(40, data.litRoads * 4));
    const emergencyAccess = Math.min(100, countNearRoute(route.geometry, [...data.police, ...data.hospitals, ...data.pharmacies], 800) + 25);
    const activity = Math.min(100, countNearRoute(route.geometry, data.activity, 180));
    const nearbyReports = reports.filter(r => route.geometry.some(p => distanceMeters(p, [r.lat, r.lon]) < 180));
    const negativeReports = nearbyReports.filter(r => /harass|unsafe|poor|suspicious|dark|threat/i.test(r.type + ' ' + r.description)).length;
    const reportsScore = Math.max(35, 100 - negativeReports * 18);
    const isNight = hour >= 18 || hour < 6;
    const timePenalty = isNight ? Math.max(45, 72 - Math.abs(22 - hour) * 2) : 100;
    const relativeSpeed = Math.min(100, 100 * fastest / route.duration);

    // Transparent safety score: environmental/community factors plus the travel-time factor.
    const environmentalSafety = Math.round(
      lighting * 0.34 +
      emergencyAccess * 0.23 +
      activity * 0.17 +
      reportsScore * 0.16 +
      timePenalty * 0.10
    );
    const balancedScore = Math.round(environmentalSafety * 0.85 + relativeSpeed * 0.15);
    const priorityScore = Math.round(environmentalSafety * safeWeight + relativeSpeed * timeWeight);

    const explanation = [
      lighting >= 60 ? 'Good mapped lighting coverage' : 'Limited mapped lighting coverage',
      emergencyAccess >= 55 ? 'Emergency services are reasonably accessible' : 'Fewer nearby emergency facilities',
      activity >= 45 ? 'More nearby activity/amenities' : 'Lower mapped activity nearby',
      negativeReports ? `${negativeReports} community safety report${negativeReports > 1 ? 's' : ''} near this route` : 'No negative community reports found nearby',
      isNight ? 'Evening/night travel factor applied' : 'Daytime travel factor applied',
    ];

    return {
      ...route,
      safety: {
        score: priorityScore,
        balancedScore,
        environmentalScore: environmentalSafety,
        priorityScore,
        priorityMode: priority,
        lighting,
        emergencyAccess,
        activity,
        reports: reportsScore,
        time: timePenalty,
        explanation,
      },
    };
  });
}

export function getPriorityLabel(priority: PriorityMode) {
  return priority === 'safest' ? 'Safest' : priority === 'fastest' ? 'Fastest' : priority === 'custom' ? 'My priority' : 'Balanced';
}

export function getPriorityDescription(priority: PriorityMode, customSafetyWeight = 0.65) {
  if (priority === 'safest') return 'Puts the strongest emphasis on safety signals.';
  if (priority === 'fastest') return 'Puts the strongest emphasis on shorter travel time.';
  if (priority === 'custom') return `${Math.round(customSafetyWeight * 100)}% safety · ${Math.round((1 - customSafetyWeight) * 100)}% time.`;
  return 'Balances safety signals with travel time.';
}
