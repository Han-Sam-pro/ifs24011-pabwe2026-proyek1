import { describe, it, expect, mock } from 'bun:test';
import { api } from '../../src/api.ts';

describe('Frontend API Client (src/api.ts)', () => {
  it('exposes all required API methods', () => {
    expect(typeof api.register).toBe('function');
    expect(typeof api.login).toBe('function');
    expect(typeof api.getMe).toBe('function');
    expect(typeof api.getUsers).toBe('function');
    expect(typeof api.getUserProfile).toBe('function');
    expect(typeof api.updateProfile).toBe('function');
    expect(typeof api.getTrips).toBe('function');
    expect(typeof api.createTrip).toBe('function');
    expect(typeof api.getTrip).toBe('function');
    expect(typeof api.updateTrip).toBe('function');
    expect(typeof api.deleteTrip).toBe('function');
    expect(typeof api.addDay).toBe('function');
    expect(typeof api.deleteDay).toBe('function');
    expect(typeof api.addDestination).toBe('function');
    expect(typeof api.updateDestination).toBe('function');
    expect(typeof api.deleteDestination).toBe('function');
    expect(typeof api.optimizeRoute).toBe('function');
    expect(typeof api.addCompanion).toBe('function');
    expect(typeof api.removeCompanion).toBe('function');
    expect(typeof api.getSharedTrip).toBe('function');
  });

  it('fetches trips list successfully from server', async () => {
    const trips = await api.getTrips();
    expect(Array.isArray(trips)).toBe(true);
    expect(trips.length).toBeGreaterThanOrEqual(1);
  });

  it('fetches user profile successfully', async () => {
    const profile = await api.getUserProfile('usr_sarah');
    expect(profile.user.name).toBe('Sarah Jenkins');
    expect(Array.isArray(profile.trips)).toBe(true);
  });
});
