import React, { useEffect, useState, useRef } from 'react';
import { APIProvider, Map, AdvancedMarker, InfoWindow, useMap } from '@vis.gl/react-google-maps';
import { Destination } from '../types.ts';
import { MapPin, Navigation, Compass, ExternalLink } from 'lucide-react';

interface MapPlannerProps {
  destinations: Destination[];
  activeDestinationId?: string | null;
  onSelectDestination?: (dest: Destination) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

const GOOGLE_MAPS_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDfMqPeBj3mjD3a7NOKzG8AtfRBFfb5jnA';

// Helper component that attaches Polyline to the map
function RoutePolyline({ destinations }: { destinations: Destination[] }) {
  const map = useMap();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  useEffect(() => {
    if (!map || destinations.length < 2) {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      return;
    }

    const path = destinations.map((d) => ({ lat: Number(d.lat), lng: Number(d.lng) }));

    if (polylineRef.current) {
      polylineRef.current.setPath(path);
      polylineRef.current.setMap(map);
    } else {
      polylineRef.current = new google.maps.Polyline({
        path,
        geodesic: true,
        strokeColor: '#d97706', // warm amber tone
        strokeOpacity: 0.85,
        strokeWeight: 4,
        map,
      });
    }

    return () => {
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [map, destinations]);

  return null;
}

// Helper to auto-fit bounds
function MapBoundsFitter({ destinations }: { destinations: Destination[] }) {
  const map = useMap();

  useEffect(() => {
    if (!map || destinations.length === 0) return;

    if (destinations.length === 1) {
      map.setCenter({ lat: Number(destinations[0].lat), lng: Number(destinations[0].lng) });
      map.setZoom(14);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    destinations.forEach((d) => {
      bounds.extend({ lat: Number(d.lat), lng: Number(d.lng) });
    });
    map.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
  }, [map, destinations]);

  return null;
}

export function MapPlanner({
  destinations,
  activeDestinationId,
  onSelectDestination,
  onMapClick,
}: MapPlannerProps) {
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null);
  const [quotaExceeded, setQuotaExceeded] = useState(false);

  // Default center: Tokyo or first destination
  const defaultCenter =
    destinations.length > 0
      ? { lat: Number(destinations[0].lat), lng: Number(destinations[0].lng) }
      : { lat: 35.6762, lng: 139.6503 };

  useEffect(() => {
    const handleQuota = () => setQuotaExceeded(true);
    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => window.removeEventListener('gmp-quota-exceeded', handleQuota);
  }, []);

  useEffect(() => {
    if (activeDestinationId) {
      const match = destinations.find((d) => d.id === activeDestinationId);
      if (match) setSelectedDest(match);
    }
  }, [activeDestinationId, destinations]);

  return (
    <div className="relative w-full h-full min-h-[460px] rounded-2xl overflow-hidden border border-stone-200 bg-stone-100 flex flex-col">
      {/* Quota warning banner if demo quota is exhausted */}
      {quotaExceeded && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-900 px-4 py-2.5 text-xs md:text-sm text-center sticky top-0 z-50 shadow-sm">
          <span>
            Google Maps Platform quota reached. If you are the app owner, visit{' '}
            <a
              href="https://developers.google.com/maps/ai/ai-studio?utm_campaign=gmp_mcp_codeassist_v1_aistudio#quota_exceeded_errors"
              target="_blank"
              rel="noopener noreferrer"
              className="underline font-semibold text-amber-950 hover:text-amber-800"
            >
              maps developer site
            </a>{' '}
            for instructions to update your account.
          </span>
        </div>
      )}

      {/* Map Header Floating Overlay */}
      <div className="absolute top-3 left-3 z-10 flex items-center gap-2 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-stone-200 shadow-sm text-xs font-medium text-stone-700">
        <Compass className="w-3.5 h-3.5 text-amber-600" />
        <span>Peta Rute Interaktif</span>
        <span className="text-stone-300">|</span>
        <span className="font-mono text-stone-600 tabular-nums">{destinations.length} Titik Kunjungan</span>
      </div>

      <div className="w-full h-full flex-1">
        <APIProvider apiKey={GOOGLE_MAPS_KEY}>
          <Map
            defaultCenter={defaultCenter}
            defaultZoom={13}
            mapId="DEMO_MAP_ID"
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            gestureHandling="greedy"
            disableDefaultUI={false}
            className="w-full h-full"
            onClick={(e) => {
              if (e.detail.latLng && onMapClick) {
                onMapClick(e.detail.latLng.lat, e.detail.latLng.lng);
              }
            }}
          >
            {/* Draw polyline connecting destinations in order */}
            <RoutePolyline destinations={destinations} />
            <MapBoundsFitter destinations={destinations} />

            {/* Advanced Markers */}
            {destinations.map((dest, index) => {
              const isSelected = selectedDest?.id === dest.id;
              const categoryColor =
                dest.category === 'food'
                  ? 'bg-rose-600 text-white'
                  : dest.category === 'attraction'
                  ? 'bg-amber-600 text-white'
                  : dest.category === 'hotel'
                  ? 'bg-blue-600 text-white'
                  : dest.category === 'activity'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-stone-800 text-white';

              return (
                <AdvancedMarker
                  key={dest.id}
                  position={{ lat: Number(dest.lat), lng: Number(dest.lng) }}
                  title={`${index + 1}. ${dest.name}`}
                  onClick={() => {
                    setSelectedDest(dest);
                    if (onSelectDestination) onSelectDestination(dest);
                  }}
                >
                  <div
                    className={`relative flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs shadow-md cursor-pointer transition-transform hover:scale-110 ${categoryColor} ${
                      isSelected ? 'ring-4 ring-amber-400 scale-110 z-20' : ''
                    }`}
                  >
                    <span>{index + 1}</span>
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-inherit -z-10" />
                  </div>
                </AdvancedMarker>
              );
            })}

            {/* InfoWindow on marker selection */}
            {selectedDest && (
              <InfoWindow
                position={{ lat: Number(selectedDest.lat), lng: Number(selectedDest.lng) }}
                onCloseClick={() => setSelectedDest(null)}
              >
                <div className="p-1 max-w-xs text-stone-900 font-sans">
                  <div className="flex items-center gap-1.5 text-xs text-amber-700 font-medium mb-1">
                    <span className="font-mono font-bold">#{selectedDest.visit_order}</span>
                    <span>·</span>
                    <span className="capitalize">{selectedDest.category}</span>
                    <span>·</span>
                    <span className="font-mono tabular-nums">{selectedDest.time_start} - {selectedDest.time_end}</span>
                  </div>
                  <h4 className="font-semibold text-sm text-stone-900 mb-1 leading-snug">{selectedDest.name}</h4>
                  {selectedDest.address && (
                    <p className="text-xs text-stone-500 mb-2 line-clamp-2">{selectedDest.address}</p>
                  )}
                  {selectedDest.notes && (
                    <p className="text-xs text-stone-600 bg-stone-50 p-1.5 rounded border border-stone-200 mb-2 italic">
                      "{selectedDest.notes}"
                    </p>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-stone-200 text-xs">
                    <span className="text-stone-500">Estimasi Biaya:</span>
                    <span className="font-mono font-semibold text-stone-900 tabular-nums">
                      Rp {Number(selectedDest.estimated_cost).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Map>
        </APIProvider>
      </div>

      {/* Quick Map Legend Footer */}
      <div className="bg-white/95 border-t border-stone-200 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-stone-600 gap-2">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" /> Atraksi
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block" /> Kuliner
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block" /> Aktivitas
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block" /> Hotel
          </span>
        </div>
        <div className="text-stone-400 text-[11px]">
          Klik pin atau peta untuk menambah & melihat detail destinasi
        </div>
      </div>
    </div>
  );
}
