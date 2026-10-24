import React, { useState } from 'react';
import { Trip } from '../types.ts';
import { X, Calendar, MapPin, DollarSign, Image as ImageIcon } from 'lucide-react';

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (tripData: Partial<Trip>) => Promise<void>;
}

const COVER_OPTIONS = [
  { label: 'Mountain & Road', url: '/src/assets/images/hero_trip_planner_1792859921527.jpg' },
  { label: 'Tokyo Dusk', url: '/src/assets/images/trip_cover_tokyo_1792859921427.jpg' },
  { label: 'Bali Terraces', url: '/src/assets/images/trip_cover_bali_1792859921485.jpg' },
];

export function CreateTripModal({ isOpen, onClose, onCreate }: CreateTripModalProps) {
  const [title, setTitle] = useState('');
  const [destinationName, setDestinationName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [budget, setBudget] = useState('15000000');
  const [coverImage, setCoverImage] = useState(COVER_OPTIONS[0].url);
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !destinationName.trim() || !startDate || !endDate) {
      setError('Mohon lengkapi judul, destinasi, dan tanggal perjalanan.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await onCreate({
        title: title.trim(),
        destination_name: destinationName.trim(),
        start_date: startDate,
        end_date: endDate,
        total_budget: Number(budget) || 0,
        currency: 'IDR',
        cover_image: coverImage,
        is_public: isPublic ? 1 : 0,
      });
      onClose();
    } catch (err: any) {
      setError(err.message || 'Gagal membuat rencana perjalanan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-stone-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
          <div>
            <h3 className="text-base font-bold text-stone-900">Buat Rencana Perjalanan Baru</h3>
            <p className="text-xs text-stone-500">Susun destinasi harian, rute peta, dan estimasi biaya</p>
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
              Judul Rencana Perjalanan *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: 5 Hari Eksplorasi Kuliner & Budaya Osaka"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Kota / Wilayah Tujuan *
            </label>
            <input
              type="text"
              required
              placeholder="Contoh: Osaka, Jepang atau Lombok, Indonesia"
              value={destinationName}
              onChange={(e) => setDestinationName(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Tanggal Mulai *
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Tanggal Selesai *
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Alokasi Total Anggaran (IDR)
            </label>
            <input
              type="number"
              step="50000"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              placeholder="Contoh: 15000000"
              className="w-full px-3.5 py-2 text-sm font-mono border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white tabular-nums"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Pilih Foto Sampul
            </label>
            <div className="grid grid-cols-3 gap-2">
              {COVER_OPTIONS.map((cov) => (
                <button
                  type="button"
                  key={cov.url}
                  onClick={() => setCoverImage(cov.url)}
                  className={`relative rounded-xl overflow-hidden border-2 transition-all aspect-video ${
                    coverImage === cov.url ? 'border-amber-600 ring-2 ring-amber-400' : 'border-stone-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={cov.url} alt={cov.label} className="w-full h-full object-cover" />
                  <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                    {cov.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="isPublicCheck"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
            />
            <label htmlFor="isPublicCheck" className="text-xs text-stone-600 select-none">
              Jadikan rencana ini publik agar bisa dilihat komunitas pengguna RoamPlan
            </label>
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
              {loading ? 'Membuat...' : 'Buat Rencana'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
