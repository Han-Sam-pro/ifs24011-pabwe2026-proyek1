import React, { useState, useEffect } from 'react';
import { User, Trip } from './types.ts';
import { api } from './api.ts';
import { Navbar } from './components/Navbar.tsx';
import { CreateTripModal } from './components/CreateTripModal.tsx';
import { ShareTripModal } from './components/ShareTripModal.tsx';
import { TripsView } from './views/TripsView.tsx';
import { TripDetailView } from './views/TripDetailView.tsx';
import { UsersView } from './views/UsersView.tsx';
import { ProfileView } from './views/ProfileView.tsx';
import { LoginView } from './views/LoginView.tsx';
import { RegisterView } from './views/RegisterView.tsx';
import { SharedTripView } from './views/SharedTripView.tsx';
import { Compass, Sparkles, MapPin, ShieldCheck, Heart } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<string>('trips');
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [sharedTripCode, setSharedTripCode] = useState<string | null>(null);

  const [trips, setTrips] = useState<Trip[]>([]);
  const [loadingTrips, setLoadingTrips] = useState(false);

  // Global modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [shareTargetTrip, setShareTargetTrip] = useState<Trip | null>(null);

  // Initialize user session
  useEffect(() => {
    const initSession = async () => {
      try {
        const storedUserId = localStorage.getItem('roamplan_user_id') || 'usr_sarah';
        const user = await api.getMe(storedUserId);
        setCurrentUser(user);
        localStorage.setItem('roamplan_user_id', user.id);
      } catch (err) {
        console.warn('Session init fallback:', err);
      }
    };
    initSession();
  }, []);

  // Listen to hash changes (e.g., #share-TOKYO-2026-ROAM)
  useEffect(() => {
    const checkHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#share-')) {
        const code = hash.replace('#share-', '').trim();
        if (code) {
          setSharedTripCode(code);
          setCurrentView('shared');
        }
      }
    };
    checkHash();
    window.addEventListener('hashchange', checkHash);
    return () => window.removeEventListener('hashchange', checkHash);
  }, []);

  // Fetch all trips
  const loadTrips = async () => {
    try {
      setLoadingTrips(true);
      const data = await api.getTrips(currentUser?.id);
      setTrips(data);
    } catch (err) {
      console.error('Failed to load trips:', err);
    } finally {
      setLoadingTrips(false);
    }
  };

  useEffect(() => {
    loadTrips();
  }, [currentUser]);

  // Handle navigation
  const handleNavigate = (view: string, tripId?: string) => {
    setCurrentView(view);
    if (tripId) {
      setSelectedTripId(tripId);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Login handler
  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('roamplan_user_id', user.id);
    setCurrentView('trips');
    loadTrips();
  };

  // Register handler
  const handleRegisterSuccess = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('roamplan_user_id', user.id);
    setCurrentView('trips');
    loadTrips();
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('roamplan_user_id');
    setCurrentUser(null);
    setCurrentView('login');
  };

  // Create Trip handler
  const handleCreateTrip = async (data: Partial<Trip>) => {
    if (!currentUser) return;
    const created = await api.createTrip(data, currentUser.id);
    await loadTrips();
    setSelectedTripId(created.id);
    setCurrentView('trip-detail');
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col font-sans selection:bg-amber-200 selection:text-amber-900">
      {/* Top Bar navigation (hidden on standalone auth pages if preferred, or visible for easy back) */}
      {currentView !== 'login' && currentView !== 'register' && (
        <Navbar
          currentView={currentView}
          onNavigate={(view) => handleNavigate(view)}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenCreateTrip={() => setIsCreateOpen(true)}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 pt-6">
        {/* VIEW: TRIPS DASHBOARD */}
        {currentView === 'trips' && (
          <TripsView
            trips={trips}
            currentUser={currentUser}
            onSelectTrip={(id) => {
              setSelectedTripId(id);
              setCurrentView('trip-detail');
            }}
            onOpenCreateTrip={() => setIsCreateOpen(true)}
            onOpenShareModal={(t) => setShareTargetTrip(t)}
            onNavigateToAuth={() => setCurrentView('login')}
          />
        )}

        {/* VIEW: TRIP DETAIL & SMART PLANNER */}
        {currentView === 'trip-detail' && selectedTripId && (
          <TripDetailView
            tripId={selectedTripId}
            currentUser={currentUser}
            onBack={() => {
              setSelectedTripId(null);
              setCurrentView('trips');
            }}
            onRefreshTrips={loadTrips}
          />
        )}

        {/* VIEW: USERS DIRECTORY */}
        {currentView === 'users' && (
          <UsersView
            onSelectUserTrip={(id) => {
              setSelectedTripId(id);
              setCurrentView('trip-detail');
            }}
            onViewUserProfile={(userId) => {
              setSelectedUserId(userId);
              setCurrentView('profile');
            }}
          />
        )}

        {/* VIEW: USER PROFILE */}
        {currentView === 'profile' && (
          <ProfileView
            userId={selectedUserId || currentUser?.id || 'usr_sarah'}
            currentUser={currentUser}
            onUpdateCurrentUser={(updated) => setCurrentUser(updated)}
            onSelectTrip={(id) => {
              setSelectedTripId(id);
              setCurrentView('trip-detail');
            }}
          />
        )}

        {/* VIEW: DEDICATED LOGIN PAGE */}
        {currentView === 'login' && (
          <LoginView
            onLoginSuccess={handleLoginSuccess}
            onNavigateToRegister={() => setCurrentView('register')}
            onBackToApp={() => setCurrentView('trips')}
          />
        )}

        {/* VIEW: DEDICATED REGISTER PAGE */}
        {currentView === 'register' && (
          <RegisterView
            onRegisterSuccess={handleRegisterSuccess}
            onNavigateToLogin={() => setCurrentView('login')}
            onBackToApp={() => setCurrentView('trips')}
          />
        )}

        {/* VIEW: SHARED TRIP COMPANION ACCESS */}
        {currentView === 'shared' && sharedTripCode && (
          <SharedTripView
            shareCode={sharedTripCode}
            onBackToApp={() => {
              window.location.hash = '';
              setSharedTripCode(null);
              setCurrentView('trips');
            }}
            onOpenInApp={(tripId) => {
              setSelectedTripId(tripId);
              setCurrentView('trip-detail');
            }}
          />
        )}
      </main>

      {/* Footer */}
      {currentView !== 'login' && currentView !== 'register' && (
        <footer className="mt-auto border-t border-stone-200 bg-white py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-500">
            <div className="flex items-center gap-2">
              <span className="font-bold text-stone-900">RoamPlan</span>
              <span>·</span>
              <span>Smart Trip Planner</span>
              <span>·</span>
              <span>Full-Stack Express.js & SQLite</span>
            </div>

            <div className="flex items-center gap-6">
              <button
                onClick={() => handleNavigate('trips')}
                className="hover:text-stone-900 transition-colors"
              >
                Rencana
              </button>
              <button
                onClick={() => handleNavigate('users')}
                className="hover:text-stone-900 transition-colors"
              >
                Pengguna
              </button>
              <button
                onClick={() => (currentUser ? handleNavigate('profile') : handleNavigate('login'))}
                className="hover:text-stone-900 transition-colors"
              >
                Profil
              </button>
            </div>

            <div className="text-stone-400">
              © 2026 RoamPlan. All rights reserved.
            </div>
          </div>
        </footer>
      )}

      {/* Global Modals */}
      <CreateTripModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateTrip}
      />

      {shareTargetTrip && (
        <ShareTripModal
          isOpen={Boolean(shareTargetTrip)}
          onClose={() => setShareTargetTrip(null)}
          trip={shareTargetTrip}
          companions={[]}
          onCompanionsUpdated={loadTrips}
        />
      )}
    </div>
  );
}
