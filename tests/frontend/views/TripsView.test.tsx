import { describe, it, expect } from 'bun:test';
import React from 'react';
import { render } from '@testing-library/react';
import { TripsView } from '../../../src/views/TripsView.tsx';
import { Trip, User } from '../../../src/types.ts';

describe('Frontend View: TripsView (src/views/TripsView.tsx)', () => {
  const dummyUser: User = {
    id: 'usr_sarah',
    name: 'Sarah Jenkins',
    email: 'sarah@roamplan.app',
    created_at: new Date().toISOString(),
  };

  const dummyTrips: Trip[] = [
    {
      id: 'trip_1',
      user_id: 'usr_sarah',
      title: 'Tokyo Explorer',
      destination_name: 'Tokyo, Jepang',
      start_date: '2026-11-10',
      end_date: '2026-11-14',
      total_budget: 28500000,
      currency: 'IDR',
      is_public: 1,
      share_code: 'TOKYO-TEST',
      created_at: new Date().toISOString(),
      owner_name: 'Sarah Jenkins',
      total_days: 3,
      total_destinations: 6,
      total_spent: 12000000,
    },
  ];

  it('renders hero banner and trip cards', () => {
    const { getByText } = render(
      <TripsView
        trips={dummyTrips}
        currentUser={dummyUser}
        onSelectTrip={() => {}}
        onOpenCreateTrip={() => {}}
        onOpenShareModal={() => {}}
        onNavigateToAuth={() => {}}
      />
    );

    expect(getByText(/Susun Rencana Perjalanan Cerdas/i)).toBeDefined();
    expect(getByText('Tokyo Explorer')).toBeDefined();
    expect(getByText('Tokyo, Jepang')).toBeDefined();
    expect(getByText('Total Rencana Aktif')).toBeDefined();
  });
});
