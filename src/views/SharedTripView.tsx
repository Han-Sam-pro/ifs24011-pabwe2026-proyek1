import React, { useState, useEffect } from 'react';
import { Trip, TripDay, Destination, Companion } from '../types.ts';
import { api } from '../api.ts';
import { MapPlanner } from '../components/MapPlanner.tsx';
import { Compass, Calendar, MapPin, DollarSign, Users, ArrowLeft, Clock, Car } from 'lucide-react';

interface SharedTripViewProps {
  shareCode: string;
  onBackToApp: () => void;
  onOpenInApp: (tripId: string) => void;
}

export function SharedTripView({ shareCode, onBackToApp, onOpenInApp }: SharedTripViewProps) {
  const [data, setData] = useState<{
    trip: Trip;
    days: TripDay[];
    destinations: Destination[];
    companions: Companion[];
  } | null>(null);
  const [activeDayId, setActiveDayId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShared = async () => {
      try {
        setLoading(true);
        setError(null);
        const result = await api.getSharedTrip(shareCode);
        setData(result);
        if (result.days.length > 0) {
          setActiveDayId(result.days[0].id);
        }
      } catch (err: any) {
        setError(err.message || 'Rencana perjalanan tidak ditemukan.');
      } finally {
        setLoading(false);
      }
    };
    fetchShared();
  }, [shareCode]);

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-stone-500">Membuka rencana perjalanan bersama...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-stone-200 text-center space-y-4 shadow-sm">
        <Compass className="w-10 h-10 text-stone-400 mx-auto" />
        <h3 className="text-base font-bold text-stone-900">Itinerary Tidak Ditemukan</h3>
        <p className="text-xs text-stone-500">
          Kode berbagi <span className="font-mono font-semibold">{shareCode}</span> tidak valid atau telah dihentikan oleh pemilik rencana.
        </p>
        <button
          onClick={onBackToApp}
          className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-xl"
        >
          Kembali ke RoamPlan
        </button>
      </div>
    );
  }

  const { trip, days, destinations, companions } = data;
  const activeDay = days.find((d) => d.id === activeDayId) || days[0];
  const dayDestinations = destinations
    .filter((d) => d.day_id === (activeDay?.id || ''))
    .sort((a, b) => a.visit_order - b.visit_order);

  const totalSpent = destinations.reduce((s, d) => s + (Number(d.estimated_cost) || 0), 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Shared Header Banner */}
      <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-amber-900">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-amber-700 shrink-0" />
          <span>
            Anda sedang melihat rencana perjalanan yang dibagikan oleh{' '}
            <strong className="text-stone-900">{trip.owner_name}</strong> untuk teman seperjalanan.
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenInApp(trip.id)}
            className="px-3.5 py-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-xs"
          >
            Buka di RoamPlan
          </button>
          <button
            onClick={onBackToApp}
            className="px-3 py-1.5 text-xs font-medium text-stone-600 hover:text-stone-900"
          >
            Tutup
          </button>
        </div>
      </div>

      {/* Trip Title & Overview */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span className="font-semibold text-amber-700">{trip.destination_name}</span>
            <span>·</span>
            <span className="font-mono tabular-nums">{trip.start_date} s/d {trip.end_date}</span>
            <span>·</span>
            <span className="font-mono font-semibold text-stone-600">{trip.share_code}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            {trip.title}
          </h1>
          <p className="text-xs text-stone-500">
            Disusun untuk {days.length} hari eksplorasi dengan total {destinations.length} titik kunjungan.
          </p>
        </div>

        <div className="flex items-center gap-6 bg-stone-50 border border-stone-200 p-4 rounded-2xl shrink-0 font-mono">
          <div>
            <div className="text-[11px] text-stone-400">Total Biaya:</div>
            <div className="text-base font-bold text-stone-900 tabular-nums">
              Rp {totalSpent.toLocaleString('id-ID')}
            </div>
          </div>
          <div className="w-px h-8 bg-stone-200" />
          <div>
            <div className="text-[11px] text-stone-400">Teman Tergabung:</div>
            <div className="text-base font-bold text-amber-700 tabular-nums">
              {companions.length} orang
            </div>
          </div>
        </div>
      </div>

      {/* Day by Day Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {days.map((d) => (
          <button
            key={d.id}
            onClick={() => setActiveDayId(d.id)}
            className={`px-4 py-2.5 rounded-2xl border text-xs font-semibold shrink-0 transition-all ${
              d.id === activeDay?.id
                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                : 'bg-white text-stone-700 border-stone-200 hover:border-amber-300'
            }`}
          >
            Hari {d.day_number} ({d.date})
          </button>
        ))}
      </div>

      {/* Grid: Timeline and Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Timeline */}
        <div className="lg:col-span-7 space-y-3">
          <div className="p-4 bg-white rounded-2xl border border-stone-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-stone-900">
              Jadwal Hari ke-{activeDay?.day_number}: {activeDay?.title}
            </h3>
            <span className="text-xs font-mono text-stone-500 tabular-nums">
              {dayDestinations.length} Destinasi Terjadwal
            </span>
          </div>

          <div className="space-y-3">
            {dayDestinations.map((dest, i) => (
              <div key={dest.id} className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-stone-900 text-amber-400 text-xs font-bold flex items-center justify-center font-mono">
                      {i + 1}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{dest.name}</h4>
                      <p className="text-xs text-stone-500">{dest.address}</p>
                      {dest.notes && (
                        <p className="text-xs text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-200 mt-1 italic">
                          "{dest.notes}"
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right font-mono text-xs font-bold text-stone-900 tabular-nums">
                    Rp {Number(dest.estimated_cost).toLocaleString('id-ID')}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100 text-xs font-mono text-stone-500 tabular-nums">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>{dest.time_start} - {dest.time_end}</span>
                  </span>
                  <span className="capitalize text-stone-600 bg-stone-100 px-2 py-0.5 rounded text-[11px]">
                    {dest.category}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Map */}
        <div className="lg:col-span-5 h-[460px]">
          <MapPlanner destinations={dayDestinations} />
        </div>
      </div>
    </div>
  );
}
