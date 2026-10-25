/** Kunci Google Maps JavaScript API diisi sendiri di .env (VITE_GOOGLE_MAPS_KEY). */
export const MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_KEY || '';

export const DEFAULT_CENTER = { lat: 2.6, lng: 98.8 }; // Danau Toba / Samosir

let loading = null;

/** Memuat skrip Google Maps sekali saja. Mengembalikan namespace `google.maps`. */
export function loadGoogleMaps() {
  if (!MAPS_KEY) return Promise.reject(new Error('Kunci Google Maps belum diatur'));
  if (globalThis.google?.maps) return Promise.resolve(globalThis.google.maps);
  if (!loading) {
    loading = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(MAPS_KEY)}`;
      script.async = true;
      script.onload = () => resolve(globalThis.google.maps);
      script.onerror = () => {
        loading = null;
        reject(new Error('Gagal memuat Google Maps. Periksa kunci API dan koneksi.'));
      };
      document.head.appendChild(script);
    });
  }
  return loading;
}
