import React, { useState, useEffect } from 'react';
import { Trip, TripDay, Destination, Companion, TripStats, User } from '../types.ts';
import { api } from '../api.ts';
import { MapPlanner } from '../components/MapPlanner.tsx';
import { AddDestinationModal } from '../components/AddDestinationModal.tsx';
import { ShareTripModal } from '../components/ShareTripModal.tsx';
import {
  ArrowLeft,
  Calendar,
  Clock,
  DollarSign,
  Plus,
  Trash2,
  Share2,
  Sparkles,
  MapPin,
  TrendingUp,
  Tag,
  CheckCircle2,
  Info,
  Car,
  ChevronDown,
} from 'lucide-react';

interface TripDetailViewProps {
  tripId: string;
  currentUser: User | null;
  onBack: () => void;
  onRefreshTrips: () => void;
}

export function TripDetailView({
  tripId,
  currentUser,
  onBack,
  onRefreshTrips,
}: TripDetailViewProps) {
  const [trip, setTrip] = useState<Trip | null>(null);
  const [days, setDays] = useState<TripDay[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [companions, setCompanions] = useState<Companion[]>([]);
  const [stats, setStats] = useState<TripStats | null>(null);
  const [activeDayId, setActiveDayId] = useState<string>('');
  const [selectedDestId, setSelectedDestId] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isAddDestOpen, setIsAddDestOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [clickedMapCoords, setClickedMapCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Optimization feedback state
  const [optimizing, setOptimizing] = useState(false);
  const [optimizeNotice, setOptimizeNotice] = useState<string | null>(null);

  const loadTripData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getTrip(tripId);
      setTrip(data.trip);
      setDays(data.days);
      setDestinations(data.destinations);
      setCompanions(data.companions);
      setStats(data.stats);

      if (data.days.length > 0 && !activeDayId) {
        setActiveDayId(data.days[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat rencana perjalanan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTripData();
  }, [tripId]);

  const activeDay = days.find((d) => d.id === activeDayId) || days[0];
  const dayDestinations = destinations
    .filter((d) => d.day_id === (activeDay?.id || ''))
    .sort((a, b) => a.visit_order - b.visit_order);

  // Add new day
  const handleAddDay = async () => {
    if (!trip) return;
    try {
      const nextDate = new Date();
      if (days.length > 0) {
        const lastDate = new Date(days[days.length - 1].date);
        lastDate.setDate(lastDate.getDate() + 1);
        nextDate.setTime(lastDate.getTime());
      }
      const newDay = await api.addDay(trip.id, {
        date: nextDate.toISOString().split('T')[0],
        title: `Hari ${days.length + 1}`,
      });
      await loadTripData();
      setActiveDayId(newDay.id);
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Delete day
  const handleDeleteDay = async (dayId: string) => {
    if (days.length <= 1) {
      alert('Rencana perjalanan harus memiliki minimal 1 hari.');
      return;
    }
    if (!confirm('Yakin ingin menghapus hari ini beserta semua destinasinya?')) return;
    try {
      await api.deleteDay(tripId, dayId);
      const remainingDays = days.filter((d) => d.id !== dayId);
      setActiveDayId(remainingDays[0]?.id || '');
      await loadTripData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Add Destination
  const handleAddDestination = async (data: Partial<Destination>) => {
    await api.addDestination(tripId, data);
    await loadTripData();
  };

  // Delete Destination
  const handleDeleteDestination = async (destId: string) => {
    if (!confirm('Hapus tempat ini dari jadwal?')) return;
    await api.deleteDestination(tripId, destId);
    await loadTripData();
  };

  // Smart Optimization based on Time & Distance
  const handleOptimizeRoute = async () => {
    if (!activeDay) return;
    if (dayDestinations.length < 2) {
      setOptimizeNotice('Tambahkan minimal 2 destinasi pada hari ini untuk melakukan optimasi urutan rute.');
      return;
    }

    try {
      setOptimizing(true);
      setOptimizeNotice(null);
      const res = await api.optimizeRoute(tripId, activeDay.id);
      setOptimizeNotice(res.message);
      await loadTripData();
    } catch (err: any) {
      setOptimizeNotice(`Gagal optimasi: ${err.message}`);
    } finally {
      setOptimizing(false);
    }
  };

  // Calculate day total cost
  const daySpent = dayDestinations.reduce((sum, d) => sum + (Number(d.estimated_cost) || 0), 0);

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-stone-500 font-medium">Memuat detail itinerary RoamPlan...</p>
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-stone-200">
        <p className="text-sm text-rose-600 mb-4">{error || 'Itinerary tidak ditemukan'}</p>
        <button
          onClick={onBack}
          className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg"
        >
          Kembali ke Rencana
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Top Breadcrumb & Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-stone-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
            title="Kembali"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span className="font-semibold text-amber-700">{trip.destination_name}</span>
              <span>·</span>
              <span className="font-mono tabular-nums">{trip.start_date} s/d {trip.end_date}</span>
              <span>·</span>
              <span>Oleh {trip.owner_name}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
              {trip.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsShareOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-stone-800 bg-white border border-stone-300 rounded-xl hover:bg-stone-50 shadow-xs transition-colors"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Bagikan ke Teman ({companions.length})</span>
          </button>
        </div>
      </div>

      {/* Day by Day Tab Strip */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {days.map((d) => {
          const isActive = d.id === activeDay?.id;
          const dayDests = destinations.filter((dest) => dest.day_id === d.id);
          const dayCost = dayDests.reduce((s, dest) => s + (Number(dest.estimated_cost) || 0), 0);

          return (
            <button
              key={d.id}
              onClick={() => {
                setActiveDayId(d.id);
                setOptimizeNotice(null);
              }}
              className={`flex flex-col items-start px-4 py-2.5 rounded-2xl border transition-all text-left shrink-0 min-w-[130px] ${
                isActive
                  ? 'bg-amber-600 border-amber-600 text-white shadow-sm'
                  : 'bg-white border-stone-200 text-stone-700 hover:border-amber-300 hover:bg-amber-50/50'
              }`}
            >
              <div className="flex items-center justify-between w-full">
                <span className={`text-xs font-bold ${isActive ? 'text-white' : 'text-stone-900'}`}>
                  Hari {d.day_number}
                </span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive ? 'bg-amber-700 text-amber-100' : 'bg-stone-100 text-stone-500'
                  }`}
                >
                  {dayDests.length} tempat
                </span>
              </div>
              <span className={`text-[11px] font-mono tabular-nums ${isActive ? 'text-amber-100' : 'text-stone-400'}`}>
                {d.date}
              </span>
              <span className={`text-[11px] font-mono font-semibold mt-1 tabular-nums ${isActive ? 'text-white' : 'text-stone-600'}`}>
                Rp {(dayCost / 1000).toFixed(0)}k
              </span>
            </button>
          );
        })}

        <button
          onClick={handleAddDay}
          className="flex items-center justify-center gap-1 px-4 py-3 rounded-2xl border border-dashed border-stone-300 hover:border-amber-500 text-stone-500 hover:text-amber-700 bg-white/60 hover:bg-amber-50 text-xs font-semibold shrink-0 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Hari</span>
        </button>
      </div>

      {/* Main Workspace: 2-Column Split (Left: Itinerary Timeline & Details; Right: Google Map & Budget Tracker) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Day Itinerary Timeline (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Day Header Bar */}
          <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-stone-900">
                  {activeDay ? `Hari ${activeDay.day_number}: ${activeDay.title || 'Eksplorasi Harian'}` : 'Jadwal Hari Ini'}
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                {activeDay?.notes || 'Kelola urutan kunjungan, waktu, dan estimasi biaya per tempat.'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleOptimizeRoute}
                disabled={optimizing || dayDestinations.length < 2}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-xl transition-all shadow-xs disabled:opacity-50"
                title="Urutkan destinasi secara cerdas berdasarkan waktu dan jarak terpendek"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>{optimizing ? 'Mengoptimasi...' : 'Urutkan Rute Cerdas'}</span>
              </button>

              <button
                onClick={() => setIsAddDestOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition-colors shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Destinasi</span>
              </button>
            </div>
          </div>

          {/* Smart Optimization Feedback Banner */}
          {optimizeNotice && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-2 text-xs text-amber-900 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-semibold">Optimasi Selesai: </span>
                {optimizeNotice}
              </div>
            </div>
          )}

          {/* Destinations Timeline List */}
          {dayDestinations.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-dashed border-stone-300 space-y-3">
              <MapPin className="w-8 h-8 text-stone-300 mx-auto" />
              <div>
                <h4 className="text-sm font-bold text-stone-800">Belum Ada Destinasi untuk Hari Ini</h4>
                <p className="text-xs text-stone-500 max-w-sm mx-auto mt-1">
                  Tambahkan tempat wisata, kuliner, atau penginapan. Anda juga bisa mengklik langsung pada peta Google Maps!
                </p>
              </div>
              <button
                onClick={() => setIsAddDestOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors"
              >
                + Tambah Destinasi Pertama
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {dayDestinations.map((dest, index) => {
                const isSelected = selectedDestId === dest.id;
                const categoryColor =
                  dest.category === 'food'
                    ? 'border-rose-200 bg-rose-50 text-rose-800'
                    : dest.category === 'attraction'
                    ? 'border-amber-200 bg-amber-50 text-amber-800'
                    : dest.category === 'hotel'
                    ? 'border-blue-200 bg-blue-50 text-blue-800'
                    : dest.category === 'activity'
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                    : 'border-stone-200 bg-stone-50 text-stone-800';

                return (
                  <div key={dest.id} className="space-y-2">
                    {/* Destination Card */}
                    <div
                      onClick={() => setSelectedDestId(dest.id)}
                      className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-xs hover:border-amber-400 ${
                        isSelected ? 'border-amber-500 ring-2 ring-amber-400/20' : 'border-stone-200'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          {/* Visit Order Badge */}
                          <div className="w-7 h-7 rounded-full bg-stone-900 text-amber-400 font-bold text-xs flex items-center justify-center shrink-0 font-mono shadow-xs">
                            {index + 1}
                          </div>

                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-stone-900">{dest.name}</h4>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${categoryColor} capitalize`}>
                                {dest.category}
                              </span>
                            </div>

                            {dest.address && (
                              <p className="text-xs text-stone-500 flex items-center gap-1">
                                <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                                <span className="truncate max-w-sm">{dest.address}</span>
                              </p>
                            )}

                            {dest.notes && (
                              <p className="text-xs text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-200 italic mt-1">
                                "{dest.notes}"
                              </p>
                            )}
                          </div>
                        </div>

                        {/* Cost & Actions */}
                        <div className="text-right space-y-2 shrink-0">
                          <div className="text-xs font-mono font-bold text-stone-900 tabular-nums">
                            Rp {Number(dest.estimated_cost).toLocaleString('id-ID')}
                          </div>

                          <div className="flex items-center gap-1.5 justify-end">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteDestination(dest.id);
                              }}
                              className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              title="Hapus Destinasi"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Time Slot Bar */}
                      <div className="mt-3 pt-2.5 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500 font-mono tabular-nums">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-stone-400" />
                          <span>{dest.time_start} - {dest.time_end}</span>
                        </span>
                        <span className="text-[11px] text-stone-400">
                          Lat: {Number(dest.lat).toFixed(4)}, Lng: {Number(dest.lng).toFixed(4)}
                        </span>
                      </div>
                    </div>

                    {/* Transit connector between stops */}
                    {index < dayDestinations.length - 1 && (
                      <div className="flex items-center gap-2 pl-6 py-0.5 text-[11px] text-stone-400 font-mono">
                        <div className="w-0.5 h-4 bg-stone-200" />
                        <span className="flex items-center gap-1 text-stone-500">
                          <Car className="w-3 h-3" />
                          <span>Perjalanan ke stop #{index + 2} (~ 20-30 menit)</span>
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Delete day button */}
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => handleDeleteDay(activeDay.id)}
              className="text-xs text-rose-600 hover:text-rose-700 hover:underline flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Hari Ini</span>
            </button>
          </div>
        </div>

        {/* Right Column: Google Maps & Financial Budget Widget (5 cols) */}
        <div className="lg:col-span-5 space-y-5">
          {/* Interactive Google Map */}
          <div className="h-[430px] w-full">
            <MapPlanner
              destinations={dayDestinations}
              activeDestinationId={selectedDestId}
              onSelectDestination={(d) => setSelectedDestId(d.id)}
              onMapClick={(lat, lng) => {
                setClickedMapCoords({ lat, lng });
                setIsAddDestOpen(true);
              }}
            />
          </div>

          {/* Budget & Cost Estimation Breakdown Card */}
          <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div>
                <h4 className="text-sm font-bold text-stone-900">Estimasi Anggaran & Biaya</h4>
                <p className="text-xs text-stone-500">Kalkulasi pengeluaran keseluruhan</p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                Subtotal Hari Ini: Rp {daySpent.toLocaleString('id-ID')}
              </span>
            </div>

            {/* Total Budget vs Spent Progress */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500">Total Pengeluaran Terencana:</span>
                <span className="font-mono font-bold text-stone-900 tabular-nums">
                  Rp {(stats?.totalSpent || 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500">Batas Anggaran:</span>
                <span className="font-mono font-semibold text-stone-700 tabular-nums">
                  Rp {(stats?.totalBudget || 0).toLocaleString('id-ID')}
                </span>
              </div>
              <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden mt-1">
                <div
                  className={`h-full rounded-full transition-all ${
                    (stats?.totalSpent || 0) > (stats?.totalBudget || 0)
                      ? 'bg-rose-500'
                      : 'bg-amber-600'
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      Math.round(((stats?.totalSpent || 0) / (stats?.totalBudget || 1)) * 100)
                    )}%`,
                  }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] pt-1">
                <span className="text-stone-400">
                  {Math.round(((stats?.totalSpent || 0) / (stats?.totalBudget || 1)) * 100)}% dari anggaran
                </span>
                <span className={`font-mono font-semibold tabular-nums ${
                  (stats?.remainingBudget || 0) < 0 ? 'text-rose-600' : 'text-emerald-700'
                }`}>
                  Sisa: Rp {(stats?.remainingBudget || 0).toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            {/* Category Breakdown */}
            {stats?.categoryBreakdown && Object.keys(stats.categoryBreakdown).length > 0 && (
              <div className="pt-2 border-t border-stone-100 space-y-2">
                <div className="text-xs font-semibold text-stone-700">Rincian per Kategori:</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(stats.categoryBreakdown).map(([cat, amount]) => (
                    <div key={cat} className="p-2 bg-stone-50 rounded-xl border border-stone-100 flex justify-between items-center">
                      <span className="capitalize text-stone-600">{cat}</span>
                      <span className="font-mono font-semibold text-stone-900 tabular-nums">
                        Rp {(amount / 1000).toFixed(0)}k
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Companions Collaboration Card */}
          <div className="p-5 bg-white rounded-3xl border border-stone-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-stone-900">Teman Seperjalanan</h4>
                <p className="text-xs text-stone-500">Kolaborator yang memiliki akses rencana</p>
              </div>
              <button
                onClick={() => setIsShareOpen(true)}
                className="px-3 py-1.5 text-xs font-semibold text-amber-700 hover:text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
              >
                + Kelola
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {/* Trip owner */}
              <div className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-full text-xs">
                {trip.owner_avatar ? (
                  <img src={trip.owner_avatar} alt={trip.owner_name} className="w-5 h-5 rounded-full object-cover" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 text-[10px] font-bold flex items-center justify-center">
                    {trip.owner_name?.charAt(0)}
                  </div>
                )}
                <span className="font-semibold text-stone-800">{trip.owner_name}</span>
                <span className="text-[10px] text-amber-800 bg-amber-100 px-1.5 rounded font-medium">Pemilik</span>
              </div>

              {/* Companions */}
              {companions.map((comp) => (
                <div key={comp.id} className="flex items-center gap-2 bg-stone-50 border border-stone-200 px-3 py-1.5 rounded-full text-xs">
                  {comp.avatar ? (
                    <img src={comp.avatar} alt={comp.name} className="w-5 h-5 rounded-full object-cover" />
                  ) : (
                    <div className="w-5 h-5 rounded-full bg-stone-200 text-stone-800 text-[10px] font-bold flex items-center justify-center">
                      {comp.name.charAt(0)}
                    </div>
                  )}
                  <span className="text-stone-700">{comp.name}</span>
                  <span className="text-[10px] text-stone-500 uppercase">{comp.role}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Add Destination Modal */}
      {activeDay && (
        <AddDestinationModal
          isOpen={isAddDestOpen}
          onClose={() => {
            setIsAddDestOpen(false);
            setClickedMapCoords(null);
          }}
          dayId={activeDay.id}
          dayNumber={activeDay.day_number}
          onAdd={handleAddDestination}
          initialCoords={clickedMapCoords}
        />
      )}

      {/* Share Trip Modal */}
      <ShareTripModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        trip={trip}
        companions={companions}
        onCompanionsUpdated={loadTripData}
      />
    </div>
  );
}
