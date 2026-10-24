import { describe, it, expect } from 'bun:test';
import { User, Trip, TripDay, Destination, Companion, TripStats } from '../../src/types.ts';

describe('Frontend Types & Domain Models', () => {
  it('validates User data structure', () => {
    const user: User = {
      id: 'usr_test',
      name: 'Test Traveler',
      email: 'test@travel.com',
      avatar: 'https://example.com/avatar.jpg',
      bio: 'Loves backpacking',
      home_city: 'Bali',
      created_at: new Date().toISOString(),
      trip_count: 3,
    };
    expect(user.id).toBe('usr_test');
    expect(user.name).toBe('Test Traveler');
    expect(user.trip_count).toBe(3);
  });

  it('validates Trip and TripStats structures', () => {
    const trip: Trip = {
      id: 'trip_test',
      user_id: 'usr_test',
      title: 'Explore Kyoto',
      destination_name: 'Kyoto',
      start_date: '2026-11-01',
      end_date: '2026-11-05',
      total_budget: 15000000,
      currency: 'IDR',
      is_public: 1,
      share_code: 'KYOTO-1234',
      created_at: new Date().toISOString(),
    };

    const stats: TripStats = {
      totalSpent: 4500000,
      totalBudget: trip.total_budget,
      remainingBudget: 10500000,
      categoryBreakdown: { attraction: 2000000, food: 2500000 },
      totalDestinations: 6,
      totalDays: 4,
    };

    expect(trip.title).toBe('Explore Kyoto');
    expect(stats.totalSpent + stats.remainingBudget).toBe(trip.total_budget);
  });

  it('validates Destination schema with category and coordinates', () => {
    const dest: Destination = {
      id: 'dest_1',
      day_id: 'day_1',
      trip_id: 'trip_test',
      name: 'Fushimi Inari',
      address: 'Fushimi Ward, Kyoto',
      lat: 34.9671,
      lng: 135.7727,
      time_start: '08:00',
      time_end: '10:30',
      estimated_cost: 50000,
      category: 'attraction',
      visit_order: 1,
    };
    expect(dest.name).toBe('Fushimi Inari');
    expect(dest.category).toBe('attraction');
    expect(dest.visit_order).toBe(1);
  });
});
