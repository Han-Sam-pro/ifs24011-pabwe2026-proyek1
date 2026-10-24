import React, { useState, useEffect } from 'react';
import { User, Trip } from '../types.ts';
import { api } from '../api.ts';
import { Users as UsersIcon, MapPin, Calendar, Compass, Search, ExternalLink } from 'lucide-react';

interface UsersViewProps {
  onSelectUserTrip: (tripId: string) => void;
  onViewUserProfile: (userId: string) => void;
}

export function UsersView({ onSelectUserTrip, onViewUserProfile }: UsersViewProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const data = await api.getUsers();
        setUsers(data);
      } catch (err: any) {
        setError(err.message || 'Gagal memuat daftar pengguna');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      (u.home_city && u.home_city.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 uppercase tracking-wider mb-1">
            <UsersIcon className="w-3.5 h-3.5" />
            <span>Komunitas RoamPlan</span>
          </div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            Semua Pengguna Aplikasi
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Jelajahi para perencana perjalanan, fotografer, dan traveler yang menyusun liburan dengan RoamPlan.
          </p>
        </div>

        {/* Search input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama atau kota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 text-xs border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-600 bg-white"
          />
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-stone-500">Memuat data pengguna dari Express.js backend...</p>
        </div>
      ) : error ? (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700">
          {error}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <div
              key={user.id}
              className="bg-white rounded-3xl border border-stone-200 p-6 shadow-xs hover:border-amber-300 hover:shadow-md transition-all flex flex-col justify-between space-y-5"
            >
              <div className="space-y-4">
                {/* User avatar & info */}
                <div className="flex items-start gap-4">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      referrerPolicy="no-referrer"
                      className="w-14 h-14 rounded-2xl object-cover border border-stone-200 shrink-0 shadow-xs"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-200 text-stone-950 text-xl font-bold flex items-center justify-center shrink-0 shadow-xs">
                      {user.name.charAt(0)}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <h3 className="text-base font-bold text-stone-900 truncate">{user.name}</h3>
                    <div className="text-xs text-stone-400 truncate">{user.email}</div>
                    {user.home_city && (
                      <div className="flex items-center gap-1 text-xs text-stone-500 mt-1">
                        <MapPin className="w-3 h-3 text-amber-600 shrink-0" />
                        <span className="truncate">{user.home_city}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed">
                  {user.bio || 'Pengguna aktif RoamPlan yang gemar menyusun rencana perjalanan terstruktur.'}
                </p>
              </div>

              {/* Statistics & Profile CTA */}
              <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-4 text-xs font-mono tabular-nums">
                  <div>
                    <span className="text-stone-400 text-[11px] block">Rencana</span>
                    <span className="font-bold text-stone-900">{user.trip_count || 0}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 text-[11px] block">Kolaborasi</span>
                    <span className="font-bold text-amber-700">{user.shared_count || 0}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onViewUserProfile(user.id)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-xl transition-colors"
                >
                  <span>Lihat Profil</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
