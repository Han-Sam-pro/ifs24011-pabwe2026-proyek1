import { TripPlan } from '../types/trip';

const BASE_URL =
  import.meta.env.VITE_DELCOM_BASEURL || '/api-proxy';

export interface DelcomUser {
  id: number;
  name: string;
  email: string;
  photo?: string;
  created_at?: string;
}

export interface DelcomAuthResponse {
  status: 'success' | 'fail';
  message: string;
  data?: {
    user: DelcomUser;
    token: string;
  };
}

export interface DelcomUsersListResponse {
  status: 'success' | 'fail';
  data?: {
    users: DelcomUser[];
  };
}

export interface DelcomTodoItem {
  id: number;
  title: string;
  description: string;
  is_finished: number;
  created_at: string;
  updated_at: string;
}

// Token helpers
export const getStoredToken = (): string | null => {
  return localStorage.getItem('delcom_auth_token');
};

export const getStoredUser = (): DelcomUser | null => {
  const saved = localStorage.getItem('delcom_user');
  if (!saved) return null;
  try {
    return JSON.parse(saved);
  } catch {
    return null;
  }
};

export const setAuthSession = (token: string, user: DelcomUser) => {
  localStorage.setItem('delcom_auth_token', token);
  localStorage.setItem('delcom_user', JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem('delcom_auth_token');
  localStorage.removeItem('delcom_user');
};

// API Calls
export async function delcomRegister(name: string, email: string, password: string): Promise<DelcomAuthResponse> {
  try {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    return data;
  } catch (e: unknown) {
    return {
      status: 'fail',
      message: e instanceof Error ? e.message : 'Gagal menghubungi server pendaftaran',
    };
  }
}

export async function delcomLogin(email: string, password: string): Promise<DelcomAuthResponse> {
  try {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data: DelcomAuthResponse = await res.json();
    if (data.status === 'success' && data.data) {
      setAuthSession(data.data.token, data.data.user);
    }
    return data;
  } catch (e: unknown) {
    return {
      status: 'fail',
      message: e instanceof Error ? e.message : 'Gagal menghubungi server autentikasi',
    };
  }
}

export async function delcomGetProfile(): Promise<DelcomUser | null> {
  const token = getStoredToken();
  if (!token) return null;

  try {
    const res = await fetch(`${BASE_URL}/users/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data = await res.json();
    if (data.status === 'success' && data.data?.user) {
      localStorage.setItem('delcom_user', JSON.stringify(data.data.user));
      return data.data.user;
    }
  } catch (e) {
    console.error('Failed to fetch Delcom user profile', e);
  }
  return null;
}

export async function delcomGetUsersList(): Promise<DelcomUser[]> {
  const token = getStoredToken();
  if (!token) return [];

  try {
    const res = await fetch(`${BASE_URL}/users`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });
    const data: DelcomUsersListResponse = await res.json();
    if (data.status === 'success' && data.data?.users) {
      return data.data.users;
    }
  } catch (e) {
    console.error('Failed to fetch users list from Delcom API', e);
  }
  return [];
}

// Syncing User Trips with Delcom Database
export async function delcomSaveTrip(trip: TripPlan): Promise<boolean> {
  const token = getStoredToken();
  if (!token) return false;

  try {
    const payload = {
      title: `[RoamPlan] ${trip.title} (${trip.destinationCity})`,
      description: JSON.stringify(trip),
      is_finished: 0,
    };

    const res = await fetch(`${BASE_URL}/todos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data.status === 'success';
  } catch (e) {
    console.error('Failed to save trip to Delcom database', e);
    return false;
  }
}

export async function delcomGetUserTrips(): Promise<TripPlan[]> {
  const token = getStoredToken();
  if (!token) return [];

  try {
    const res = await fetch(`${BASE_URL}/todos`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (data.status === 'success' && Array.isArray(data.data?.todos)) {
      const trips: TripPlan[] = [];
      for (const item of data.data.todos) {
        if (item.title?.startsWith('[RoamPlan]')) {
          try {
            const parsed = JSON.parse(item.description);
            if (parsed && parsed.id && parsed.days) {
              trips.push(parsed);
            }
          } catch {
            // Ignore non-json item
          }
        }
      }
      return trips;
    }
  } catch (e) {
    console.error('Failed to fetch user trips from Delcom API', e);
  }
  return [];
}
