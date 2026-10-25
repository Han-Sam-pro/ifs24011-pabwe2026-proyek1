import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { DEFAULT_CENTER, MAPS_KEY, loadGoogleMaps } from '../lib/googleMaps';
import { ReactNodePropType, validateComponentProps } from '../lib/validateComponentProps';

/**
 * Peta Google Maps: menampilkan destinasi berurutan (marker bernomor + garis rute),
 * dan bila `onPick` diberikan, klik pada peta mengirim koordinat { lat, lng }.
 */
export default function MapPicker({ points = [], selected = null, onPick, route = false, height = 360 }) {
  validateComponentProps(MapPicker, { points, selected, onPick, route, height });
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const overlaysRef = useRef([]);
  const onPickRef = useRef(onPick);
  onPickRef.current = onPick;
  const [status, setStatus] = useState(MAPS_KEY ? 'loading' : 'nokey');
  const [error, setError] = useState('');

  // Inisialisasi peta sekali
  useEffect(() => {
    if (!MAPS_KEY) return undefined;
    let alive = true;
    loadGoogleMaps()
      .then((maps) => {
        if (!alive || !containerRef.current) return;
        mapRef.current = new maps.Map(containerRef.current, {
          center: DEFAULT_CENTER,
          zoom: 10,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });
        mapRef.current.addListener('click', (e) => {
          onPickRef.current?.({ lat: e.latLng.lat(), lng: e.latLng.lng() });
        });
        setStatus('ready');
      })
      .catch((err) => {
        if (!alive) return;
        setError(err.message);
        setStatus('error');
      });
    return () => { alive = false; };
  }, []);

  // Gambar ulang marker dan rute setiap daftar titik berubah
  const pointsKey = JSON.stringify(points.map((p) => [p.lat, p.lng, p.name]));
  const selectedKey = selected ? `${selected.lat},${selected.lng}` : '';
  useEffect(() => {
    const maps = globalThis.google?.maps;
    const map = mapRef.current;
    if (!maps || !map) return;

    overlaysRef.current.forEach((o) => o.setMap(null));
    overlaysRef.current = [];

    const path = points.map((p) => ({ lat: p.lat, lng: p.lng }));
    points.forEach((p, index) => {
      overlaysRef.current.push(new maps.Marker({
        position: { lat: p.lat, lng: p.lng },
        map,
        label: String(index + 1),
        title: p.name,
      }));
    });
    if (route && path.length > 1) {
      overlaysRef.current.push(new maps.Polyline({
        path,
        map,
        strokeColor: '#0b4f5c',
        strokeWeight: 4,
        strokeOpacity: 0.85,
      }));
    }
    if (selected) {
      overlaysRef.current.push(new maps.Marker({
        position: { lat: selected.lat, lng: selected.lng },
        map,
        title: 'Lokasi dipilih',
        icon: { path: maps.SymbolPath.CIRCLE, scale: 8, fillColor: '#f08a24', fillOpacity: 1, strokeColor: '#ffffff', strokeWeight: 2 },
      }));
    }

    const all = [...path, ...(selected ? [selected] : [])];
    if (all.length === 1) {
      map.setCenter(all[0]);
      map.setZoom(13);
    } else if (all.length > 1) {
      const bounds = new maps.LatLngBounds();
      all.forEach((p) => bounds.extend(p));
      map.fitBounds(bounds, 48);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pointsKey, selectedKey, route, status]);

  if (status === 'nokey') {
    return (
      <div className="map-fallback" style={{ minHeight: height }}>
        <p><strong>Peta tidak aktif.</strong> Isi <code>VITE_GOOGLE_MAPS_KEY</code> di file <code>.env</code> frontend, lalu jalankan ulang aplikasi. Koordinat tetap bisa diisi manual.</p>
      </div>
    );
  }
  if (status === 'error') {
    return <div className="map-fallback" style={{ minHeight: height }} role="alert"><p>{error}</p></div>;
  }
  return (
    <div className="map-wrap" style={{ height }}>
      <div ref={containerRef} className="map" role="region" aria-label="Peta destinasi" />
      {status === 'loading' && <div className="map-loading">Memuat peta...</div>}
    </div>
  );
}

MapPicker.propTypes = {
  points: PropTypes.arrayOf(PropTypes.shape({
    lat: PropTypes.number.isRequired,
    lng: PropTypes.number.isRequired,
    name: PropTypes.string,
  })),
  selected: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
  onPick: PropTypes.func,
  route: PropTypes.bool,
  height: PropTypes.number,
  children: ReactNodePropType,
};
