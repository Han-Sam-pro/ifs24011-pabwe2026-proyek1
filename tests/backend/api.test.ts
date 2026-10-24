import { describe, it, expect } from 'bun:test';

const BASE_URL = 'http://localhost:3000/api';

describe('Backend Express REST API Integration', () => {
  it('authenticates user with valid login credentials', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sarah@roamplan.app', password: 'pass123' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.user.name).toBe('Sarah Jenkins');
    expect(data.user.email).toBe('sarah@roamplan.app');
  });

  it('rejects login with invalid password', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'sarah@roamplan.app', password: 'wrongpassword' }),
    });
    expect(res.status).toBe(401);
  });

  it('registers a new user successfully', async () => {
    const uniqueEmail = `test_${Date.now()}@example.com`;
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Unit Tester',
        email: uniqueEmail,
        password: 'password123',
        home_city: 'Semarang, Indonesia',
      }),
    });
    expect(res.status).toBe(201);
    const data = await res.json();
    expect(data.user.email).toBe(uniqueEmail);
  });

  it('retrieves all application users with trip statistics', async () => {
    const res = await fetch(`${BASE_URL}/users`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.users)).toBe(true);
    expect(data.users.length).toBeGreaterThanOrEqual(4);
  });

  it('retrieves all trips and single trip details with days and destinations', async () => {
    const res = await fetch(`${BASE_URL}/trips`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.trips)).toBe(true);

    const detailRes = await fetch(`${BASE_URL}/trips/trip_tokyo`);
    expect(detailRes.status).toBe(200);
    const detail = await detailRes.json();
    expect(detail.trip.destination_name).toBe('Tokyo, Jepang');
    expect(detail.days.length).toBe(3);
    expect(detail.destinations.length).toBeGreaterThan(0);
    expect(detail.stats.totalSpent).toBeGreaterThan(0);
  });

  it('adds and deletes a destination in a trip day', async () => {
    const addRes = await fetch(`${BASE_URL}/trips/trip_tokyo/destinations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        day_id: 'day_tokyo_1',
        name: 'Odaiba Seaside Park',
        address: 'Minato City, Tokyo',
        lat: 35.6298,
        lng: 139.7744,
        time_start: '19:00',
        time_end: '21:00',
        estimated_cost: 150000,
        category: 'attraction',
      }),
    });
    expect(addRes.status).toBe(201);
    const added = await addRes.json();
    expect(added.destination.name).toBe('Odaiba Seaside Park');

    // Delete
    const delRes = await fetch(`${BASE_URL}/trips/trip_tokyo/destinations/${added.destination.id}`, {
      method: 'DELETE',
    });
    expect(delRes.status).toBe(200);
  });

  it('runs smart route optimization for a day', async () => {
    const res = await fetch(`${BASE_URL}/trips/trip_tokyo/optimize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ day_id: 'day_tokyo_1' }),
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.destinations).toBeDefined();
    expect(data.destinations.length).toBeGreaterThan(1);
    expect(typeof data.distanceSavedKm).toBe('number');
  });

  it('resolves public itinerary via share code', async () => {
    const res = await fetch(`${BASE_URL}/share/TOKYO-2026-ROAM`);
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.trip.title).toBe('Tokyo Urban & Cultural Heritage');
    expect(data.days.length).toBe(3);
  });
});
