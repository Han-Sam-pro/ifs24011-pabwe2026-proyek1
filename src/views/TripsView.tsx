import React, { useState } from 'react';
import { Trip, User } from '../types.ts';
import { Plus, Calendar, MapPin, DollarSign, Users, ChevronRight, Share2, Compass, Sparkles } from 'lucide-react';

interface TripsViewProps {
  trips: Trip[];
  currentUser: User | null;
  onSelectTrip: (tripId: string) => void;
  onOpenCreateTrip: () => void;
  onOpenShareModal: (trip: Trip) => void;
  onNavigateToAuth: () => void;
}

export function TripsView({
  trips,
  currentUser,
  onSelectTrip,
  onOpenCreateTrip,
  onOpenShareModal,
  onNavigateToAuth,
}: TripsViewProps) {
  const [filter, setFilter] = useState<'all' | 'my' | 'shared' | 'public'>('all');

  const filteredTrips = trips.filter((t) => {
    if (filter === 'my') return t.user_id === currentUser?.id;
    if (filter === 'shared') return Boolean(t.is_collaborator);
    if (filter === 'public') return Boolean(t.is_public);
    return true;
  });

  const totalDestinationsCount = trips.reduce((sum, t) => sum + (t.total_destinations || 0), 0);
  const totalBudgetSum = trips.reduce((sum, t) => sum + (t.total_budget || 0), 0);

  return (
    <div className="space-y-8 pb-16">
      {/* Editorial Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-stone-200 bg-stone-900 text-white min-h-[340px] flex items-end p-6 md:p-10 shadow-lg">
        <img
          src="/src/assets/images/hero_trip_planner_1792859921527.jpg"
          alt="RoamPlan Smart Trip Planner"
          className="absolute inset-0 w-full h-full object-cover opacity-45 mix-blend-luminosity scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900/60 to-transparent" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-wider uppercase text-amber-400">
            <span>RoamPlan</span>
            <span>·</span>
            <span>Smart Travel Engineering</span>
            <span>·</span>
            <span>Express.js & SQLite Engine</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Susun Rencana Perjalanan Cerdas Berdasarkan Waktu, Peta & Anggaran
          </h1>
          <p className="text-sm sm:text-base text-stone-300 leading-relaxed max-w-xl">
            Rencanakan jadwal harian, visualisasikan rute kunjungan di Google Maps, optimalkan urutan berdasarkan jarak, dan bagikan bersama teman seperjalanan.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={currentUser ? onOpenCreateTrip : onNavigateToAuth}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-stone-950 bg-amber-400 hover:bg-amber-300 active:scale-95 rounded-xl transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>+ Buat Itinerary Baru</span>
            </button>
            <span className="text-xs text-stone-400 hidden sm:inline">
              Data tersimpan permanen di SQLite database
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-xs text-stone-500 mb-1">Total Rencana Aktif</div>
          <div className="text-2xl font-bold text-stone-900 font-mono tabular-nums">{trips.length}</div>
          <div className="text-[11px] text-stone-400 mt-1">Tersinkronisasi di server</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-xs text-stone-500 mb-1">Destinasi Terjadwal</div>
          <div className="text-2xl font-bold text-amber-700 font-mono tabular-nums">{totalDestinationsCount}</div>
          <div className="text-[11px] text-stone-400 mt-1">Terpetakan dengan koordinat</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-xs text-stone-500 mb-1">Total Alokasi Budget</div>
          <div className="text-2xl font-bold text-stone-900 font-mono tabular-nums">
            Rp {(totalBudgetSum / 1000000).toFixed(1)} jt
          </div>
          <div className="text-[11px] text-stone-400 mt-1">Estimasi biaya per tempat</div>
        </div>
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <div className="text-xs text-stone-500 mb-1">Teman Seperjalanan</div>
          <div className="text-2xl font-bold text-emerald-700 font-mono tabular-nums">
            {trips.reduce((acc, t) => acc + (t.companion_count || 0), 0)}
          </div>
          <div className="text-[11px] text-stone-400 mt-1">Kolaborator terhubung</div>
        </div>
      </div>

      {/* Section Controls: Filter Tabs & Create CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-1 p-1 bg-stone-200/80 rounded-xl w-fit">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'all' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Semua Rencana ({trips.length})
          </button>
          {currentUser && (
            <>
              <button
                onClick={() => setFilter('my')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === 'my' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Rencana Saya
              </button>
              <button
                onClick={() => setFilter('shared')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  filter === 'shared' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Bersama Teman
              </button>
            </>
          )}
          <button
            onClick={() => setFilter('public')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              filter === 'public' ? 'bg-white text-stone-900 shadow-xs' : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Eksplor Komunitas
          </button>
        </div>

        <button
          onClick={currentUser ? onOpenCreateTrip : onNavigateToAuth}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-all shadow-sm w-fit"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Rencana Baru</span>
        </button>
      </div>

      {/* Trips Grid */}
      {filteredTrips.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-dashed border-stone-300">
          <Compass className="w-10 h-10 text-stone-400 mx-auto mb-3" />
          <h3 className="text-base font-bold text-stone-800 mb-1">Belum Ada Rencana Perjalanan</h3>
          <p className="text-xs text-stone-500 max-w-sm mx-auto mb-4">
            Mulai susun rencana perjalanan liburan impian Anda dengan urutan tempat harian dan estimasi anggaran.
          </p>
          <button
            onClick={currentUser ? onOpenCreateTrip : onNavigateToAuth}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Buat Itinerary Pertama
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTrips.map((trip) => {
            const isOwner = trip.user_id === currentUser?.id;
            const spentPercentage =
              trip.total_budget > 0
                ? Math.min(100, Math.round(((trip.total_spent || 0) / trip.total_budget) * 100))
                : 0;

            return (
              <div
                key={trip.id}
                onClick={() => onSelectTrip(trip.id)}
                className="group cursor-pointer bg-white rounded-3xl border border-stone-200 hover:border-amber-400 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
              >
                {/* Trip Card Cover */}
                <div className="relative aspect-video w-full overflow-hidden bg-stone-100">
                  <img
                    src={trip.cover_image || '/src/assets/images/hero_trip_planner_1792859921527.jpg'}
                    alt={trip.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />

                  {/* Destination pill & Days indicator */}
                  <div className="absolute top-3 left-3 flex items-center gap-2">
                    <span className="bg-stone-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      <span>{trip.destination_name}</span>
                    </span>
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
                    <span className="font-mono tabular-nums text-stone-200">
                      {trip.total_days || 1} Hari · {trip.total_destinations || 0} Tempat
                    </span>
                    {trip.companion_count && trip.companion_count > 0 ? (
                      <span className="inline-flex items-center gap-1 bg-amber-500/90 text-stone-950 font-bold px-2 py-0.5 rounded text-[11px]">
                        <Users className="w-3 h-3" /> {trip.companion_count} Teman
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-stone-500 mb-1.5">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{trip.start_date} s/d {trip.end_date}</span>
                      <span>·</span>
                      <span className="truncate">Oleh {trip.owner_name}</span>
                    </div>

                    <h3 className="text-base font-bold text-stone-900 group-hover:text-amber-700 transition-colors line-clamp-1">
                      {trip.title}
                    </h3>
                  </div>

                  {/* Budget & Progress */}
                  <div className="pt-2 border-t border-stone-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-stone-500">Estimasi Biaya:</span>
                      <span className="font-mono font-bold text-stone-900 tabular-nums">
                        Rp {Number(trip.total_spent || 0).toLocaleString('id-ID')}
                        <span className="font-normal text-stone-400"> / Rp {Number(trip.total_budget || 0).toLocaleString('id-ID')}</span>
                      </span>
                    </div>

                    <div className="w-full bg-stone-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
                          spentPercentage > 95 ? 'bg-rose-500' : 'bg-amber-600'
                        }`}
                        style={{ width: `${spentPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer actions */}
                  <div className="pt-1 flex items-center justify-between text-xs text-stone-600">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenShareModal(trip);
                      }}
                      className="inline-flex items-center gap-1 hover:text-amber-700 transition-colors text-[11px]"
                    >
                      <Share2 className="w-3 h-3" />
                      <span>Bagikan</span>
                    </button>

                    <span className="inline-flex items-center gap-0.5 text-amber-700 font-semibold group-hover:translate-x-0.5 transition-transform">
                      Buka Rencana <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
