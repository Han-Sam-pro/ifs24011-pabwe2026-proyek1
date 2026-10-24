import React, { useState, useEffect } from 'react';
import { User, Trip } from '../types.ts';
import { api } from '../api.ts';
import { User as UserIcon, MapPin, Mail, Calendar, Edit3, Check, Compass, ChevronRight } from 'lucide-react';

interface ProfileViewProps {
  userId: string;
  currentUser: User | null;
  onUpdateCurrentUser: (user: User) => void;
  onSelectTrip: (tripId: string) => void;
}

export function ProfileView({
  userId,
  currentUser,
  onUpdateCurrentUser,
  onSelectTrip,
}: ProfileViewProps) {
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit mode state
  const isSelf = currentUser?.id === userId;
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [homeCity, setHomeCity] = useState('');
  const [avatar, setAvatar] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getUserProfile(userId);
      setProfileUser(data.user);
      setTrips(data.trips);
      setName(data.user.name);
      setBio(data.user.bio || '');
      setHomeCity(data.user.home_city || '');
      setAvatar(data.user.avatar || '');
    } catch (err: any) {
      setError(err.message || 'Gagal memuat profil pengguna');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [userId]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileUser) return;

    try {
      setSaving(true);
      const updated = await api.updateProfile(
        { name, bio, home_city: homeCity, avatar },
        profileUser.id
      );
      setProfileUser(updated);
      onUpdateCurrentUser(updated);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      alert(err.message || 'Gagal menyimpan perubahan profil');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-stone-500">Memuat profil pengguna...</p>
      </div>
    );
  }

  if (error || !profileUser) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-stone-200">
        <p className="text-sm text-rose-600 mb-2">{error || 'Pengguna tidak ditemukan'}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {/* Profile Card */}
      <div className="bg-white rounded-3xl border border-stone-200 p-6 md:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
            {profileUser.avatar ? (
              <img
                src={profileUser.avatar}
                alt={profileUser.name}
                referrerPolicy="no-referrer"
                className="w-24 h-24 rounded-3xl object-cover border-2 border-stone-200 shadow-sm shrink-0"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-amber-500 text-stone-950 text-3xl font-extrabold flex items-center justify-center shrink-0 shadow-sm">
                {profileUser.name.charAt(0)}
              </div>
            )}

            <div className="space-y-1.5">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
                  {profileUser.name}
                </h1>
                {isSelf && (
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                    Akun Anda
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 justify-center sm:justify-start">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-stone-400" />
                  <span>{profileUser.email}</span>
                </span>
                {profileUser.home_city && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-600" />
                      <span>{profileUser.home_city}</span>
                    </span>
                  </>
                )}
                <span>·</span>
                <span className="font-mono tabular-nums">
                  Bergabung {new Date(profileUser.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                </span>
              </div>

              <p className="text-xs text-stone-600 max-w-xl pt-2 leading-relaxed">
                {profileUser.bio || 'Belum ada bio perkenalan.'}
              </p>
            </div>
          </div>

          {/* Action button */}
          {isSelf && (
            <div className="flex justify-center sm:justify-end shrink-0">
              <button
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-stone-800 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors border border-stone-300"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>{isEditing ? 'Batal Edit' : 'Sunting Profil'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Save success toast */}
        {saveSuccess && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>Profil berhasil diperbarui dan tersimpan di database Express.js SQLite!</span>
          </div>
        )}

        {/* Edit Form */}
        {isEditing && (
          <form onSubmit={handleSaveProfile} className="mt-6 pt-6 border-t border-stone-200 space-y-4">
            <h3 className="text-sm font-bold text-stone-900">Perbarui Informasi Profil</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Kota / Domisili</label>
                <input
                  type="text"
                  placeholder="Contoh: Jakarta, Indonesia"
                  value={homeCity}
                  onChange={(e) => setHomeCity(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">URL Avatar / Foto Profil</label>
              <input
                type="text"
                placeholder="URL gambar atau biarkan kosong"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">Bio / Perkenalan</label>
              <textarea
                rows={3}
                placeholder="Tuliskan minat liburan Anda..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3.5 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600"
              />
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-xs text-stone-600 hover:text-stone-900"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-sm transition-colors disabled:opacity-50"
              >
                {saving ? 'Menyimpan...' : 'Simpan Profil ke Backend'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Trips list by this user */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-stone-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-amber-600" />
            <span>Rencana Perjalanan Oleh {profileUser.name} ({trips.length})</span>
          </h2>
        </div>

        {trips.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-dashed border-stone-300 text-xs text-stone-500">
            Pengguna ini belum mempublikasikan rencana perjalanan.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {trips.map((trip) => (
              <div
                key={trip.id}
                onClick={() => onSelectTrip(trip.id)}
                className="group cursor-pointer bg-white rounded-2xl border border-stone-200 hover:border-amber-400 p-4 shadow-xs transition-all flex items-center gap-4"
              >
                <div className="w-20 h-20 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                  <img
                    src={trip.cover_image || '/src/assets/images/hero_trip_planner_1792859921527.jpg'}
                    alt={trip.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 text-[11px] text-stone-400 mb-1">
                    <MapPin className="w-3 h-3 text-amber-600" />
                    <span>{trip.destination_name}</span>
                    <span>·</span>
                    <span>{trip.total_days || 1} Hari</span>
                  </div>
                  <h4 className="text-sm font-bold text-stone-900 truncate group-hover:text-amber-700 transition-colors">
                    {trip.title}
                  </h4>
                  <div className="text-xs font-mono font-semibold text-stone-700 mt-1 tabular-nums">
                    Rp {Number(trip.total_budget || 0).toLocaleString('id-ID')}
                  </div>
                </div>

                <ChevronRight className="w-5 h-5 text-stone-400 group-hover:text-amber-700 group-hover:translate-x-1 transition-all shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
