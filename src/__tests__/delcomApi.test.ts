/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  getStoredToken,
  setAuthSession,
  clearAuthSession,
  getStoredUser,
  delcomRegister,
  delcomLogin,
  delcomGetProfile,
  delcomGetUsersList,
  delcomSaveTrip,
  delcomGetUserTrips,
} from '../services/delcomApi';
import { PRESET_TRIPS } from '../data/presetTrips';

describe('Delcom API Service & Session Storage', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('manages auth session storage correctly', () => {
    expect(getStoredToken()).toBeNull();
    expect(getStoredUser()).toBeNull();

    const mockUser = { id: 1, name: 'Tester', email: 'tester@example.com' };
    setAuthSession('mock-token-123', mockUser);

    expect(getStoredToken()).toBe('mock-token-123');
    expect(getStoredUser()).toEqual(mockUser);

    clearAuthSession();
    expect(getStoredToken()).toBeNull();
    expect(getStoredUser()).toBeNull();
  });

  it('handles invalid user JSON in localStorage', () => {
    localStorage.setItem('delcom_user', 'invalid-json');
    expect(getStoredUser()).toBeNull();
  });

  it('calls delcomRegister API', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => ({ status: 'success', message: 'Registered successfully' }),
    } as Response);

    const res = await delcomRegister('John', 'john@example.com', 'secret123');
    expect(res.status).toBe('success');
  });

  it('handles delcomRegister network error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Network offline'));

    const res = await delcomRegister('John', 'john@example.com', 'secret123');
    expect(res.status).toBe('fail');
    expect(res.message).toContain('Network offline');
  });

  it('calls delcomLogin API and sets session on success', async () => {
    const mockUser = { id: 10, name: 'Login User', email: 'login@example.com' };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => ({
        status: 'success',
        message: 'Login success',
        data: { user: mockUser, token: 'jwt-123' },
      }),
    } as Response);

    const res = await delcomLogin('login@example.com', 'secret123');
    expect(res.status).toBe('success');
    expect(getStoredToken()).toBe('jwt-123');
  });

  it('handles delcomLogin failure or network error', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Auth failed'));

    const res = await delcomLogin('login@example.com', 'wrong');
    expect(res.status).toBe('fail');
  });

  it('fetches profile with delcomGetProfile', async () => {
    setAuthSession('jwt-123', { id: 1, name: 'Old Name', email: 'me@example.com' });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => ({
        status: 'success',
        data: { user: { id: 1, name: 'Updated Name', email: 'me@example.com' } },
      }),
    } as Response);

    const profile = await delcomGetProfile();
    expect(profile?.name).toBe('Updated Name');
  });

  it('returns null from delcomGetProfile if not logged in or error', async () => {
    expect(await delcomGetProfile()).toBeNull();

    setAuthSession('jwt-123', { id: 1, name: 'Old', email: 'old@example.com' });
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Unauthorized'));
    expect(await delcomGetProfile()).toBeNull();
  });

  it('fetches users list with delcomGetUsersList', async () => {
    setAuthSession('jwt-123', { id: 1, name: 'Me', email: 'me@example.com' });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => ({
        status: 'success',
        data: { users: [{ id: 1, name: 'User A', email: 'a@example.com' }] },
      }),
    } as Response);

    const list = await delcomGetUsersList();
    expect(list.length).toBe(1);
  });

  it('returns empty list from delcomGetUsersList if no token or error', async () => {
    expect(await delcomGetUsersList()).toEqual([]);

    setAuthSession('jwt-123', { id: 1, name: 'Me', email: 'me@example.com' });
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Failed'));
    expect(await delcomGetUsersList()).toEqual([]);
  });

  it('saves trip with delcomSaveTrip', async () => {
    setAuthSession('jwt-123', { id: 1, name: 'Me', email: 'me@example.com' });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => ({ status: 'success' }),
    } as Response);

    const ok = await delcomSaveTrip(PRESET_TRIPS[0]);
    expect(ok).toBe(true);
  });

  it('returns false from delcomSaveTrip if no token or error', async () => {
    expect(await delcomSaveTrip(PRESET_TRIPS[0])).toBe(false);

    setAuthSession('jwt-123', { id: 1, name: 'Me', email: 'me@example.com' });
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Save error'));
    expect(await delcomSaveTrip(PRESET_TRIPS[0])).toBe(false);
  });

  it('fetches user trips with delcomGetUserTrips', async () => {
    setAuthSession('jwt-123', { id: 1, name: 'Me', email: 'me@example.com' });

    const tripObj = PRESET_TRIPS[0];
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      json: async () => ({
        status: 'success',
        data: {
          todos: [
            {
              id: 101,
              title: '[RoamPlan] Jogja Trip',
              description: JSON.stringify(tripObj),
            },
            {
              id: 102,
              title: 'Regular Todo Item',
              description: 'Not a trip',
            },
          ],
        },
      }),
    } as Response);

    const trips = await delcomGetUserTrips();
    expect(trips.length).toBe(1);
    expect(trips[0].id).toBe(tripObj.id);
  });

  it('returns empty array from delcomGetUserTrips if no token or error', async () => {
    expect(await delcomGetUserTrips()).toEqual([]);

    setAuthSession('jwt-123', { id: 1, name: 'Me', email: 'me@example.com' });
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new Error('Fetch error'));
    expect(await delcomGetUserTrips()).toEqual([]);
  });
});
