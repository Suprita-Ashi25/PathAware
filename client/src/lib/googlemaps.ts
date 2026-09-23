declare global {
  interface Window {
    google?: any;
    __pathaware_gmaps_ready__?: () => void;
  }
}

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string | undefined;

export const isGoogleMapsConfigured = Boolean(API_KEY);

let loadPromise: Promise<any> | null = null;

export function loadGoogleMaps(): Promise<any> {
  if (!API_KEY) return Promise.reject(new Error("No Google Maps API key configured"));
  if (window.google?.maps) return Promise.resolve(window.google.maps);
  if (loadPromise) return loadPromise;

  loadPromise = new Promise((resolve, reject) => {
    const callbackName = "__pathaware_gmaps_ready__";
    (window as any)[callbackName] = () => {
      delete (window as any)[callbackName];
      if (window.google?.maps) resolve(window.google.maps);
      else reject(new Error("Google Maps loaded without the Maps API"));
    };

    const existing = document.querySelector(
      'script[data-pathaware-google-maps="true"]',
    ) as HTMLScriptElement | null;

    if (existing) return;

    const script = document.createElement("script");
    script.dataset.pathawareGoogleMaps = "true";
    script.src =
      `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(API_KEY)}` +
      `&callback=${callbackName}&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onerror = () => {
      loadPromise = null;
      reject(new Error("Failed to load Google Maps. Check the API key and Maps JavaScript API."));
    };
    document.head.appendChild(script);
  });

  return loadPromise;
}
