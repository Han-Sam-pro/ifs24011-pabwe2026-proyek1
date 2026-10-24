import React from 'react';
import { User } from '../types.ts';
import { Compass, Plus, Users, User as UserIcon, LogOut, MapPin, Sparkles } from 'lucide-react';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, tripId?: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  onOpenCreateTrip: () => void;
}

export function Navbar({
  currentView,
  onNavigate,
  currentUser,
  onLogout,
  onOpenCreateTrip,
}: NavbarProps) {
  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3.5">
        {/* Zone 1: Single text element wordmark */}
        <button
          onClick={() => onNavigate('trips')}
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-stone-900 whitespace-nowrap shrink-0 hover:text-amber-700 transition-colors"
        >
          <span className="w-8 h-8 rounded-lg bg-stone-900 text-amber-400 flex items-center justify-center shadow-sm">
            <Compass className="w-5 h-5" />
          </span>
          <span>RoamPlan</span>
        </button>

        {/* Zone 2: Concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600">
          <button
            onClick={() => onNavigate('trips')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'trips' ? 'text-amber-700 font-semibold border-b-2 border-amber-600 pb-0.5' : 'hover:text-stone-900'
            }`}
          >
            Rencana Perjalanan
          </button>
          <button
            onClick={() => onNavigate('users')}
            className={`transition-colors whitespace-nowrap shrink-0 ${
              currentView === 'users' ? 'text-amber-700 font-semibold border-b-2 border-amber-600 pb-0.5' : 'hover:text-stone-900'
            }`}
          >
            Daftar Pengguna
          </button>
          {currentUser && (
            <button
              onClick={() => onNavigate('profile')}
              className={`transition-colors whitespace-nowrap shrink-0 ${
                currentView === 'profile' ? 'text-amber-700 font-semibold border-b-2 border-amber-600 pb-0.5' : 'hover:text-stone-900'
              }`}
            >
              Profil Saya
            </button>
          )}
        </nav>

        {/* Zone 3: 1 primary action & Account profile access */}
        <div className="flex items-center gap-3 shrink-0">
          {currentUser ? (
            <>
              <button
                onClick={onOpenCreateTrip}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-amber-600 rounded-lg hover:bg-amber-700 active:scale-95 transition-all shadow-sm whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Rencana Baru</span>
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-stone-200">
                <button
                  onClick={() => onNavigate('profile')}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-stone-100 transition-colors"
                  title="Buka Profil"
                >
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full object-cover border border-stone-200"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-800 font-bold text-xs flex items-center justify-center border border-amber-200">
                      {currentUser.name.charAt(0)}
                    </div>
                  )}
                  <span className="hidden lg:inline text-xs font-medium text-stone-800 max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                </button>
                <button
                  onClick={onLogout}
                  className="p-1.5 text-stone-400 hover:text-rose-600 hover:bg-stone-100 rounded-lg transition-colors"
                  title="Keluar"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('login')}
                className="px-3 py-1.5 text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 rounded-lg transition-colors whitespace-nowrap shrink-0"
              >
                Masuk
              </button>
              <button
                onClick={() => onNavigate('register')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-stone-900 hover:bg-stone-800 rounded-lg transition-colors shadow-sm whitespace-nowrap shrink-0"
              >
                Daftar Akun
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile nav subbar */}
      <div className="md:hidden flex items-center justify-around border-t border-stone-200 bg-stone-50 py-2 text-xs font-medium text-stone-600">
        <button
          onClick={() => onNavigate('trips')}
          className={`${currentView === 'trips' ? 'text-amber-700 font-bold' : ''}`}
        >
          Rencana
        </button>
        <button
          onClick={() => onNavigate('users')}
          className={`${currentView === 'users' ? 'text-amber-700 font-bold' : ''}`}
        >
          Pengguna
        </button>
        {currentUser && (
          <button
            onClick={() => onNavigate('profile')}
            className={`${currentView === 'profile' ? 'text-amber-700 font-bold' : ''}`}
          >
            Profil
          </button>
        )}
      </div>
    </header>
  );
}
