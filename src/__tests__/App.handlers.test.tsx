import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, waitFor } from '@testing-library/react';

import App from '../App';
import * as delcomApi from '../services/delcomApi';
import { encodeTripToUrl } from '../utils/share';
import { PRESET_TRIPS } from '../data/presetTrips';
import type { TripPlan, Destination } from '../types/trip';

// Stubs capture the props App passes down so handlers can be driven directly.
const { captured } = vi.hoisted(() => ({ captured: {} as Record<string, any> }));

vi.mock('../services/delcomApi', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../services/delcomApi')>();
  return {
    ...actual,
    getStoredToken: vi.fn(),
    getStoredUser: vi.fn(),
    delcomGetProfile: vi.fn(),
    delcomGetUserTrips: vi.fn(),
    delcomSaveTrip: vi.fn(),
    clearAuthSession: vi.fn(),
  };
});

vi.mock('../pages/PlannerPage', () => ({
  PlannerPage: (props: any) => {
    captured.planner = props;
    return <div data-testid="planner-stub" />;
  },
}));
vi.mock('../pages/UsersPage', () => ({
  UsersPage: (props: any) => {
    captured.users = props;
    return <div data-testid="users-stub" />;
  },
}));
vi.mock('../pages/ProfilePage', () => ({
  ProfilePage: (props: any) => {
    captured.profile = props;
    return <div data-testid="profile-stub" />;
  },
}));
vi.mock('../pages/LoginPage', () => ({
  LoginPage: (props: any) => {
    captured.login = props;
    return <div data-testid="login-stub" />;
  },
}));
vi.mock('../pages/RegisterPage', () => ({
  RegisterPage: () => <div data-testid="register-stub" />,
}));
vi.mock('../components/DestinationModal', () => ({
  DestinationModal: (props: any) => {
    captured.dest = props;
    return null;
  },
}));
vi.mock('../components/ShareModal', () => ({
  ShareModal: (props: any) => {
    captured.share = props;
    return null;
  },
}));
vi.mock('../components/CitySelectorModal', () => ({
  CitySelectorModal: (props: any) => {
    captured.city = props;
    return null;
  },
}));
vi.mock('../components/AuthModal', () => ({
  AuthModal: (props: any) => {
    captured.auth = props;
    return null;
  },
}));
vi.mock('../components/UsersDirectoryModal', () => ({
  UsersDirectoryModal: (props: any) => {
    captured.usersModal = props;
    return null;
  },
}));
vi.mock('../components/PrintView', () => ({
  PrintView: () => null,
}));

const mockUser = { id: 7, name: 'Siti Rahma', email: 'siti@example.com' } as delcomApi.DelcomUser;

function baseTrip(): TripPlan {
  return JSON.parse(JSON.stringify(PRESET_TRIPS[0])) as TripPlan;
}

function makeDest(id: string, title: string, lat = -7.8, lng = 110.4): Destination {
  return {
    id,
    title,
    category: 'sightseeing',
    startTime: '09:00',
    durationMinutes: 60,
    cost: 10000,
    lat,
    lng,
  };
}

async function renderApp(path = '/') {
  window.history.pushState({}, '', path);
  render(<App />);
  await waitFor(() => expect(captured.planner || captured.login || captured.users || captured.profile).toBeTruthy());
}

describe('App handlers (driven through stubbed child props)', () => {
  beforeEach(() => {
    localStorage.clear();
    for (const key of Object.keys(captured)) delete captured[key];
    vi.mocked(delcomApi.getStoredToken).mockReturnValue('token-123');
    vi.mocked(delcomApi.getStoredUser).mockReturnValue(null);
    vi.mocked(delcomApi.delcomGetProfile).mockResolvedValue(null);
    vi.mocked(delcomApi.delcomGetUserTrips).mockResolvedValue([]);
    vi.mocked(delcomApi.delcomSaveTrip).mockResolvedValue(true);
    vi.mocked(delcomApi.clearAuthSession).mockClear();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(window, 'print').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('initial trip loading', () => {
    it('loads the trip from the ?trip= share parameter and shows the shared banner', async () => {
      const shared = { ...baseTrip(), title: 'Trip Dari Tautan' };
      await renderApp(`/?trip=${encodeTripToUrl(shared)}`);

      expect(captured.planner.trip.title).toBe('Trip Dari Tautan');
      expect(captured.planner.isSharedTripImported).toBe(true);
    });

    it('restores the trip saved in localStorage', async () => {
      const saved = { ...baseTrip(), title: 'Trip Tersimpan' };
      localStorage.setItem('roamplan_active_trip_v2', JSON.stringify(saved));

      await renderApp('/');

      expect(captured.planner.trip.title).toBe('Trip Tersimpan');
      expect(captured.planner.isSharedTripImported).toBe(false);
    });

    it('ignores a saved trip without days and falls back to the first preset', async () => {
      localStorage.setItem('roamplan_active_trip_v2', JSON.stringify({ title: 'Kosong', days: [] }));

      await renderApp('/');

      expect(captured.planner.trip.title).toBe(PRESET_TRIPS[0].title);
    });

    it('falls back to the first preset and warns when saved JSON is corrupt', async () => {
      localStorage.setItem('roamplan_active_trip_v2', '{rusak');

      await renderApp('/');

      expect(captured.planner.trip.title).toBe(PRESET_TRIPS[0].title);
      expect(console.warn).toHaveBeenCalledWith('Could not parse saved trip', expect.any(Error));
    });

    it('persists the active trip to localStorage whenever it changes', async () => {
      await renderApp('/');

      act(() => captured.planner.handleNewTrip());

      const stored = JSON.parse(localStorage.getItem('roamplan_active_trip_v2')!);
      expect(stored.title).toBe('Perjalanan Baru Tanpa Judul');
    });
  });

  describe('day management', () => {
    it('adds a day after the last one, selects it and shows a toast', async () => {
      await renderApp('/');
      const before = captured.planner.trip.days.length;

      act(() => captured.planner.handleAddDay());

      const days = captured.planner.trip.days;
      expect(days).toHaveLength(before + 1);
      expect(days[days.length - 1].dayNumber).toBe(before + 1);
      expect(days[days.length - 1].themeTitle).toBe(`Eksplorasi Hari ke-${before + 1}`);
      expect(captured.planner.activeDayIndex).toBe(before);
      expect(captured.planner.toastMessage).toBe(`Hari ${before + 1} berhasil ditambahkan`);
    });

    it('uses today as the date of a new day when the trip has no days', async () => {
      localStorage.setItem(
        'roamplan_active_trip_v2',
        JSON.stringify({ ...baseTrip(), days: [{ id: 'x', dayNumber: 1, date: '', destinations: [] }] })
      );
      await renderApp('/');

      act(() => captured.planner.handleAddDay());

      const newDay = captured.planner.trip.days[1];
      expect(newDay.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('does not delete the only remaining day', async () => {
      localStorage.setItem(
        'roamplan_active_trip_v2',
        JSON.stringify({ ...baseTrip(), days: [{ id: 'only', dayNumber: 1, date: '2026-11-10', destinations: [] }] })
      );
      await renderApp('/');

      act(() => captured.planner.handleDeleteDay('only'));

      expect(captured.planner.trip.days).toHaveLength(1);
    });

    it('deletes a day and renumbers the remaining days', async () => {
      localStorage.setItem(
        'roamplan_active_trip_v2',
        JSON.stringify({
          ...baseTrip(),
          days: [
            { id: 'a', dayNumber: 1, date: '2026-11-10', destinations: [] },
            { id: 'b', dayNumber: 2, date: '2026-11-11', destinations: [] },
            { id: 'c', dayNumber: 3, date: '2026-11-12', destinations: [] },
          ],
        })
      );
      await renderApp('/');

      act(() => captured.planner.handleDeleteDay('a'));

      const days = captured.planner.trip.days;
      expect(days.map((d: any) => d.id)).toEqual(['b', 'c']);
      expect(days.map((d: any) => d.dayNumber)).toEqual([1, 2]);
      expect(captured.planner.activeDayIndex).toBe(0);
      expect(captured.planner.toastMessage).toBe('Hari berhasil dihapus');
    });

    it('updates a day theme and date', async () => {
      await renderApp('/');
      const dayId = captured.planner.trip.days[0].id;

      act(() => captured.planner.handleUpdateDayTheme(dayId, 'Wisata Candi', '2026-12-01'));

      expect(captured.planner.trip.days[0]).toMatchObject({
        themeTitle: 'Wisata Candi',
        date: '2026-12-01',
      });
      expect(captured.planner.toastMessage).toBe('Informasi hari berhasil diperbarui');
    });
  });

  describe('destination management', () => {
    it('adds a new destination to the active day', async () => {
      await renderApp('/');
      const before = captured.planner.trip.days[0].destinations.length;

      act(() => captured.dest.onSave(makeDest('new-1', 'Pantai Baru')));

      const dests = captured.planner.trip.days[0].destinations;
      expect(dests).toHaveLength(before + 1);
      expect(dests[dests.length - 1].title).toBe('Pantai Baru');
      expect(captured.planner.toastMessage).toBe('Destinasi berhasil ditambahkan');
    });

    it('updates an existing destination and shows the update toast', async () => {
      await renderApp('/');
      const existing = captured.planner.trip.days[0].destinations[0];
      act(() => captured.planner.onOpenEditDestination(existing));

      act(() => captured.dest.onSave({ ...existing, title: 'Judul Diubah' }));

      expect(captured.planner.trip.days[0].destinations[0].title).toBe('Judul Diubah');
      expect(captured.planner.toastMessage).toBe('Destinasi berhasil diperbarui');
    });

    it('opens the add-destination modal with no destination to edit', async () => {
      await renderApp('/');

      act(() => captured.planner.onOpenAddDestination());

      expect(captured.dest.isOpen).toBe(true);
      expect(captured.dest.destinationToEdit).toBeNull();
    });

    it('opens the edit modal with the chosen destination', async () => {
      await renderApp('/');
      const target = captured.planner.trip.days[0].destinations[0];

      act(() => captured.planner.onOpenEditDestination(target));

      expect(captured.dest.isOpen).toBe(true);
      expect(captured.dest.destinationToEdit).toEqual(target);
    });

    it('deletes a destination and clears the selection when it was selected', async () => {
      await renderApp('/');
      const target = captured.planner.trip.days[0].destinations[0];
      act(() => captured.planner.setSelectedDestinationId(target.id));

      act(() => captured.planner.handleDeleteDestination(target.id));

      expect(captured.planner.trip.days[0].destinations.find((d: Destination) => d.id === target.id)).toBeUndefined();
      expect(captured.planner.selectedDestinationId).toBeNull();
      expect(captured.planner.toastMessage).toBe('Destinasi dihapus dari jadwal');
    });

    it('moves a destination up and down within bounds', async () => {
      localStorage.setItem(
        'roamplan_active_trip_v2',
        JSON.stringify({
          ...baseTrip(),
          days: [{ id: 'd', dayNumber: 1, date: '2026-11-10', destinations: [makeDest('p', 'P'), makeDest('q', 'Q')] }],
        })
      );
      await renderApp('/');

      act(() => captured.planner.handleMoveDestination(1, 'up'));
      expect(captured.planner.trip.days[0].destinations.map((d: Destination) => d.id)).toEqual(['q', 'p']);

      act(() => captured.planner.handleMoveDestination(0, 'up'));
      expect(captured.planner.trip.days[0].destinations.map((d: Destination) => d.id)).toEqual(['q', 'p']);

      act(() => captured.planner.handleMoveDestination(0, 'down'));
      expect(captured.planner.trip.days[0].destinations.map((d: Destination) => d.id)).toEqual(['p', 'q']);
    });

    it('does nothing when optimizing a day with fewer than three destinations', async () => {
      localStorage.setItem(
        'roamplan_active_trip_v2',
        JSON.stringify({
          ...baseTrip(),
          days: [{ id: 'd', dayNumber: 1, date: '2026-11-10', destinations: [makeDest('p', 'P'), makeDest('q', 'Q')] }],
        })
      );
      await renderApp('/');
      const before = captured.planner.trip.days[0].destinations;

      act(() => captured.planner.handleOptimizeRoute());

      expect(captured.planner.trip.days[0].destinations).toBe(before);
      expect(captured.planner.toastMessage).toBeNull();
    });

    it('optimizes a day with three or more destinations and reports the result', async () => {
      localStorage.setItem(
        'roamplan_active_trip_v2',
        JSON.stringify({
          ...baseTrip(),
          days: [
            {
              id: 'd',
              dayNumber: 1,
              date: '2026-11-10',
              destinations: [
                makeDest('a', 'A', -7.80, 110.40),
                makeDest('b', 'B', -7.70, 110.50),
                makeDest('c', 'C', -7.79, 110.41),
              ],
            },
          ],
        })
      );
      await renderApp('/');

      act(() => captured.planner.handleOptimizeRoute());

      expect(captured.planner.trip.days[0].destinations).toHaveLength(3);
      expect(captured.planner.toastMessage).toMatch(/Rute berhasil dioptimalkan|paling optimal/);
    });

    it('reports an already-optimal route when no distance or time is saved', async () => {
      const same = [makeDest('a', 'A', 0, 0), makeDest('b', 'B', 0, 0), makeDest('c', 'C', 0, 0)];
      localStorage.setItem(
        'roamplan_active_trip_v2',
        JSON.stringify({ ...baseTrip(), days: [{ id: 'd', dayNumber: 1, date: '2026-11-10', destinations: same }] })
      );
      await renderApp('/');

      act(() => captured.planner.handleOptimizeRoute());

      expect(captured.planner.toastMessage).toBe('⚡ Urutan rute saat ini sudah merupakan jalur paling optimal.');
    });
  });

  describe('trip-level actions', () => {
    it('updates the total budget', async () => {
      await renderApp('/');

      act(() => captured.planner.handleUpdateTotalBudget(9000000));

      expect(captured.planner.trip.totalBudget).toBe(9000000);
      expect(captured.planner.toastMessage).toBe('Batas anggaran berhasil diperbarui');
    });

    it('changes the trip currency', async () => {
      await renderApp('/');

      act(() => captured.planner.handleChangeCurrency('USD'));

      expect(captured.planner.trip.currency).toBe('USD');
      expect(captured.planner.toastMessage).toBe('Mata uang diganti ke USD');
    });

    it('loads a preset template and resets day and selection', async () => {
      await renderApp('/');
      act(() => captured.planner.setActiveDayIndex(1));
      const preset = PRESET_TRIPS[PRESET_TRIPS.length - 1];

      act(() => captured.planner.handleSelectPresetTrip(preset));

      expect(captured.planner.trip.id).toBe(preset.id);
      expect(captured.planner.activeDayIndex).toBe(0);
      expect(captured.planner.selectedDestinationId).toBeNull();
      expect(captured.planner.toastMessage).toBe(`Memuat template: ${preset.title}`);
    });

    it('creates a fresh blank trip', async () => {
      await renderApp('/');

      act(() => captured.planner.handleNewTrip());

      const t = captured.planner.trip;
      expect(t.title).toBe('Perjalanan Baru Tanpa Judul');
      expect(t.currency).toBe('IDR');
      expect(t.days).toHaveLength(1);
      expect(t.days[0].destinations).toEqual([]);
      expect(captured.planner.toastMessage).toBe('Membuat rencana perjalanan baru');
    });

    it('imports a shared trip from the share modal', async () => {
      await renderApp('/');
      const imported = { ...baseTrip(), title: 'Hasil Impor' };

      act(() => captured.share.onImportTrip(imported));

      expect(captured.planner.trip.title).toBe('Hasil Impor');
      expect(captured.planner.toastMessage).toBe('Berhasil mengimpor: Hasil Impor');
    });

    it('triggers the browser print dialog', async () => {
      await renderApp('/');

      act(() => captured.share.onTriggerPrint());

      expect(window.print).toHaveBeenCalledTimes(1);
    });

    it('hides the toast automatically after 3.5 seconds', async () => {
      vi.useFakeTimers({ shouldAdvanceTime: true });
      await renderApp('/');

      act(() => captured.planner.handleUpdateTotalBudget(1));
      expect(captured.planner.toastMessage).not.toBeNull();

      act(() => {
        vi.advanceTimersByTime(3600);
      });
      expect(captured.planner.toastMessage).toBeNull();
    });
  });

  describe('city changes', () => {
    it('updates the destination city and shows a confirmation', async () => {
      await renderApp('/');

      act(() => captured.city.onUpdateTripCity('Bali'));

      expect(captured.planner.trip.destinationCity).toBe('Bali');
      expect(captured.planner.toastMessage).toBe('Kota tujuan berhasil diubah ke: Bali');
    });

    it('syncs the updated trip to Delcom when a user is logged in', async () => {
      vi.mocked(delcomApi.getStoredUser).mockReturnValue(mockUser);
      await renderApp('/');

      act(() => captured.city.onUpdateTripCity('Bali'));

      await waitFor(() => expect(delcomApi.delcomSaveTrip).toHaveBeenCalled());
      expect(vi.mocked(delcomApi.delcomSaveTrip).mock.calls[0][0].destinationCity).toBe('Bali');
    });

    it('does not sync to Delcom when no user is logged in', async () => {
      await renderApp('/');

      act(() => captured.city.onUpdateTripCity('Bali'));

      expect(delcomApi.delcomSaveTrip).not.toHaveBeenCalled();
    });

    it('creates a new trip for a city and resets the day and selection', async () => {
      await renderApp('/');
      act(() => captured.planner.setActiveDayIndex(1));
      const created = { ...baseTrip(), id: 'new-city', destinationCity: 'Malang' };

      act(() => captured.city.onCreateTripForCity(created));

      expect(captured.planner.trip.id).toBe('new-city');
      expect(captured.planner.activeDayIndex).toBe(0);
      expect(captured.planner.toastMessage).toBe('Berhasil membuat rencana perjalanan baru: Malang');
    });
  });

  describe('map location picking', () => {
    it('switches to the map and closes the destination modal when picking starts', async () => {
      await renderApp('/');
      act(() => captured.planner.onOpenAddDestination());

      act(() => captured.dest.onTriggerMapPick());

      expect(captured.dest.isOpen).toBe(false);
      expect(captured.planner.mobileSubTab).toBe('map');
      expect(captured.planner.isPickingLocation).toBe(true);
      expect(captured.planner.toastMessage).toBe('Klik pada Google Maps untuk menentukan lokasi destinasi');
    });

    it('stores picked coordinates and reopens the destination modal', async () => {
      await renderApp('/');
      act(() => captured.dest.onTriggerMapPick());

      act(() => captured.planner.handlePickLocationFromMap(-7.79, 110.37));

      expect(captured.planner.isPickingLocation).toBe(false);
      expect(captured.dest.isOpen).toBe(true);
      expect(captured.dest.pendingCoordinates).toEqual({ lat: -7.79, lng: 110.37 });
      expect(captured.planner.toastMessage).toBe('Koordinat dipilih: -7.79, 110.37');
    });

    it('cancels picking when the destination modal is closed', async () => {
      await renderApp('/');
      act(() => captured.dest.onTriggerMapPick());

      act(() => captured.dest.onClose());

      expect(captured.dest.isOpen).toBe(false);
      expect(captured.planner.isPickingLocation).toBe(false);
    });
  });

  describe('authentication', () => {
    it('welcomes a logged-in user and saves the current trip when they have none in Delcom', async () => {
      await renderApp('/');

      await act(async () => {
        await captured.auth.onUserLoggedIn(mockUser);
      });

      expect(captured.planner.currentUser).toEqual(mockUser);
      expect(captured.planner.toastMessage).toBe('Selamat datang kembali, Siti Rahma!');
      expect(delcomApi.delcomSaveTrip).toHaveBeenCalledWith(captured.planner.trip);
    });

    it('loads the first saved Delcom trip for a user who already has trips', async () => {
      const remote = { ...baseTrip(), title: 'Trip dari Delcom' };
      vi.mocked(delcomApi.delcomGetUserTrips).mockResolvedValue([remote]);
      await renderApp('/');

      await act(async () => {
        await captured.auth.onUserLoggedIn(mockUser);
      });

      expect(captured.planner.trip.title).toBe('Trip dari Delcom');
      expect(captured.planner.toastMessage).toBe(
        '☁️ Memuat rencana perjalanan Trip dari Delcom dari Delcom API'
      );
    });

    it('clears the session and closes the auth modal on logout', async () => {
      vi.mocked(delcomApi.getStoredUser).mockReturnValue(mockUser);
      await renderApp('/');

      act(() => captured.auth.onUserLoggedOut());

      expect(delcomApi.clearAuthSession).toHaveBeenCalledTimes(1);
      expect(captured.planner.currentUser).toBeNull();
      expect(captured.planner.toastMessage).toBe('Anda telah keluar dari akun Delcom');
      expect(captured.auth.isOpen).toBe(false);
    });

    it('restores the logged-in user from the Delcom profile on startup', async () => {
      vi.mocked(delcomApi.delcomGetProfile).mockResolvedValue(mockUser);
      await renderApp('/');

      await waitFor(() => expect(captured.planner.currentUser).toEqual(mockUser));
    });

    it('calls Delcom profile after a successful login on the login route', async () => {
      vi.mocked(delcomApi.delcomGetProfile).mockResolvedValue(null);
      await renderApp('/auth/login');

      await act(async () => {
        captured.login.onLoginSuccess();
      });

      expect(delcomApi.delcomGetProfile).toHaveBeenCalled();
    });

    it('serves the login and register routes without the protected layout', async () => {
      await renderApp('/atuh/login');
      expect(screen.getByTestId('login-stub')).toBeInTheDocument();
    });

    it('redirects unknown routes to the planner', async () => {
      await renderApp('/halaman-tidak-ada');

      expect(screen.getByTestId('planner-stub')).toBeInTheDocument();
    });
  });

  describe('modal toggles', () => {
    it('opens and closes the share, city, auth and users modals from the planner', async () => {
      await renderApp('/');

      act(() => captured.planner.setIsShareModalOpen(true));
      expect(captured.share.isOpen).toBe(true);
      act(() => captured.share.onClose());
      expect(captured.share.isOpen).toBe(false);

      act(() => captured.planner.setIsCityModalOpen(true));
      expect(captured.city.isOpen).toBe(true);
      act(() => captured.city.onClose());
      expect(captured.city.isOpen).toBe(false);

      act(() => captured.planner.setIsAuthModalOpen(true));
      expect(captured.auth.isOpen).toBe(true);
      act(() => captured.auth.onClose());
      expect(captured.auth.isOpen).toBe(false);

      act(() => captured.planner.setIsUsersModalOpen(true));
      expect(captured.usersModal.isOpen).toBe(true);
      act(() => captured.usersModal.onClose());
      expect(captured.usersModal.isOpen).toBe(false);
    });

    it('wires header actions on the users page to the modal and trip handlers', async () => {
      await renderApp('/users');

      act(() => captured.users.onOpenShareModal());
      expect(captured.share.isOpen).toBe(true);

      act(() => captured.users.onOpenCityModal());
      expect(captured.city.isOpen).toBe(true);

      act(() => captured.users.onOpenAuthModal());
      expect(captured.auth.isOpen).toBe(true);

      act(() => captured.users.onOpenUsersModal());
      expect(captured.usersModal.isOpen).toBe(true);

      // The planner is not mounted on /users, so verify the trip change via the persisted state
      act(() => captured.users.onNewTrip());
      const stored = JSON.parse(localStorage.getItem('roamplan_active_trip_v2')!);
      expect(stored.title).toBe('Perjalanan Baru Tanpa Judul');
    });

    it('logs out from the profile page through the shared handler', async () => {
      vi.mocked(delcomApi.getStoredUser).mockReturnValue(mockUser);
      await renderApp('/profile');

      act(() => captured.profile.onUserLoggedOut());

      expect(delcomApi.clearAuthSession).toHaveBeenCalled();
    });
  });

  it('shows the quota warning after the Google Maps quota event fires', async () => {
    await renderApp('/');
    expect(captured.planner.quotaExceeded).toBe(false);

    act(() => {
      window.dispatchEvent(new CustomEvent('gmp-quota-exceeded'));
    });

    expect(captured.planner.quotaExceeded).toBe(true);
  });
});
