import React, { useState } from 'react';
import { Destination } from '../types.ts';
import { X, MapPin, DollarSign, Clock, Tag, Sparkles } from 'lucide-react';

interface AddDestinationModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayId: string;
  dayNumber: number;
  onAdd: (data: Partial<Destination>) => Promise<void>;
  initialCoords?: { lat: number; lng: number } | null;
}

const CATEGORIES = [
  { id: 'attraction', label: 'Objek Wisata', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { id: 'food', label: 'Kuliner / Resto', color: 'bg-rose-100 text-rose-800 border-rose-300' },
  { id: 'activity', label: 'Aktivitas / Hiburan', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { id: 'hotel', label: 'Akomodasi / Hotel', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  { id: 'transit', label: 'Transportasi', color: 'bg-stone-100 text-stone-800 border-stone-300' },
];

export function AddDestinationModal({
  isOpen,
  onClose,
  dayId,
  dayNumber,
  onAdd,
  initialCoords,
}: AddDestinationModalProps) {
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState(initialCoords?.lat ? String(initialCoords.lat) : '35.6762');
  const [lng, setLng] = useState(initialCoords?.lng ? String(initialCoords.lng) : '139.6503');
  const [timeStart, setTimeStart] = useState('09:00');
  const [timeEnd, setTimeEnd] = useState('11:00');
  const [estimatedCost, setEstimatedCost] = useState('100000');
  const [category, setCategory] = useState<'attraction' | 'food' | 'hotel' | 'transit' | 'activity'>('attraction');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama tempat wajib diisi.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onAdd({
        day_id: dayId,
        name: name.trim(),
        address: address.trim(),
        lat: Number(lat) || 0,
        lng: Number(lng) || 0,
        time_start: timeStart,
        time_end: timeEnd,
        estimated_cost: Number(estimatedCost) || 0,
        category,
        notes: notes.trim(),
      });
      onClose();
      // Reset
      setName('');
      setAddress('');
      setNotes('');
    } catch (err: any) {
      setError(err.message || 'Gagal menyimpan destinasi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div>
            <h3 className="text-base font-bold text-stone-900">Tambah Destinasi Kunjungan</h3>
            <p className="text-xs text-stone-500">Jadwalkan tempat untuk Hari ke-{dayNumber}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Nama Tempat / Destinasi *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Senso-ji Temple, Shibuya Sky, Cafe Kitsune"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Alamat atau Wilayah
            </label>
            <input
              type="text"
              placeholder="Contoh: Asakusa, Taito City, Tokyo"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Latitude (Peta)
              </label>
              <input
                type="number"
                step="any"
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Longitude (Peta)
              </label>
              <input
                type="number"
                step="any"
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                className="w-full px-3.5 py-2 text-sm font-mono border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Waktu Mulai
              </label>
              <input
                type="time"
                value={timeStart}
                onChange={(e) => setTimeStart(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Waktu Selesai
              </label>
              <input
                type="time"
                value={timeEnd}
                onChange={(e) => setTimeEnd(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Estimasi Biaya (IDR)
              </label>
              <input
                type="number"
                step="1000"
                value={estimatedCost}
                onChange={(e) => setEstimatedCost(e.target.value)}
                placeholder="0"
                className="w-full px-3.5 py-2 text-sm font-mono border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Kategori
              </label>
              <select
                value={category}
                onChange={(e: any) => setCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Catatan / Aktivitas Khusus
            </label>
            <input
              type="text"
              placeholder="Contoh: Tiket sudah dibeli online, beli cinderamata..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-stone-600 hover:text-stone-900 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-sm disabled:opacity-50"
            >
              {loading ? 'Menyimpan...' : 'Simpan Destinasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
