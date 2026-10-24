import { User, Trip, TripDay, Destination, Companion, TripStats } from './types.ts';

const API_BASE =
  typeof window !== 'undefined' && window.location && window.location.origin && window.location.origin !== 'null'
    ? '/api'
    : 'http://localhost:3000/api';

function getHeaders(userId?: string) {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (userId) {
    headers['x-user-id'] = userId;
  }
  return headers;
}

export const api = {
  // Auth
  async register(data: { name: string; email: string; password: string; home_city?: string; bio?: string }) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal mendaftar');
    return json.user as User;
  },

  async login(data: { email: string; password: string }) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal login');
    return json.user as User;
  },

  async getMe(userId?: string) {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getHeaders(userId),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal memuat sesi');
    return json.user as User;
  },

  // Users Directory
  async getUsers() {
    const res = await fetch(`${API_BASE}/users`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal memuat daftar pengguna');
    return json.users as User[];
  },

  async getUserProfile(id: string) {
    const res = await fetch(`${API_BASE}/users/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal memuat profil pengguna');
    return json as { user: User; trips: Trip[] };
  },

  async updateProfile(data: { name?: string; bio?: string; home_city?: string; avatar?: string }, userId: string) {
    const res = await fetch(`${API_BASE}/profile`, {
      method: 'PUT',
      headers: getHeaders(userId),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal memperbarui profil');
    return json.user as User;
  },

  // Trips
  async getTrips(userId?: string) {
    const res = await fetch(`${API_BASE}/trips`, {
      headers: getHeaders(userId),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal memuat daftar rencana');
    return json.trips as Trip[];
  },

  async createTrip(data: Partial<Trip>, userId: string) {
    const res = await fetch(`${API_BASE}/trips`, {
      method: 'POST',
      headers: getHeaders(userId),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal membuat rencana');
    return json.trip as Trip;
  },

  async getTrip(id: string) {
    const res = await fetch(`${API_BASE}/trips/${id}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal memuat detail rencana');
    return json as {
      trip: Trip;
      days: TripDay[];
      destinations: Destination[];
      companions: Companion[];
      stats: TripStats;
    };
  },

  async updateTrip(id: string, data: Partial<Trip>) {
    const res = await fetch(`${API_BASE}/trips/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal memperbarui rencana');
    return json;
  },

  async deleteTrip(id: string) {
    const res = await fetch(`${API_BASE}/trips/${id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal menghapus rencana');
    return json;
  },

  // Days
  async addDay(tripId: string, data: { date?: string; title?: string; notes?: string }) {
    const res = await fetch(`${API_BASE}/trips/${tripId}/days`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal menambah hari');
    return json.day as TripDay;
  },

  async deleteDay(tripId: string, dayId: string) {
    const res = await fetch(`${API_BASE}/trips/${tripId}/days/${dayId}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal menghapus hari');
    return json;
  },

  // Destinations
  async addDestination(tripId: string, data: Partial<Destination>) {
    const res = await fetch(`${API_BASE}/trips/${tripId}/destinations`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal menambah destinasi');
    return json.destination as Destination;
  },

  async updateDestination(tripId: string, destId: string, data: Partial<Destination>) {
    const res = await fetch(`${API_BASE}/trips/${tripId}/destinations/${destId}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal memperbarui destinasi');
    return json.destination as Destination;
  },

  async deleteDestination(tripId: string, destId: string) {
    const res = await fetch(`${API_BASE}/trips/${tripId}/destinations/${destId}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal menghapus destinasi');
    return json;
  },

  // Smart Optimization
  async optimizeRoute(tripId: string, dayId: string) {
    const res = await fetch(`${API_BASE}/trips/${tripId}/optimize`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ day_id: dayId }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal mengoptimasi rute');
    return json as {
      message: string;
      destinations: Destination[];
      initialDistanceKm: number;
      optimizedDistanceKm: number;
      distanceSavedKm: number;
      percentSavings: number;
    };
  },

  // Companions
  async addCompanion(tripId: string, emailOrUsername: string, role: 'editor' | 'viewer' = 'editor') {
    const res = await fetch(`${API_BASE}/trips/${tripId}/companions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ emailOrUsername, role }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal menambahkan teman');
    return json.companion as Companion;
  },

  async removeCompanion(tripId: string, companionId: string) {
    const res = await fetch(`${API_BASE}/trips/${tripId}/companions/${companionId}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Gagal menghapus teman');
    return json;
  },

  // Share
  async getSharedTrip(shareCode: string) {
    const res = await fetch(`${API_BASE}/share/${shareCode}`);
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Rencana perjalanan tidak ditemukan');
    return json as {
      trip: Trip;
      days: TripDay[];
      destinations: Destination[];
      companions: Companion[];
    };
  },
};
