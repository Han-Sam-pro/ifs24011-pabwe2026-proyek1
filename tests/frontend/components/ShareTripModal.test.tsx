import { describe, it, expect } from 'bun:test';
import React from 'react';
import { render } from '@testing-library/react';
import { ShareTripModal } from '../../../src/components/ShareTripModal.tsx';
import { Trip, Companion } from '../../../src/types.ts';

describe('Frontend Component: ShareTripModal (src/components/ShareTripModal.tsx)', () => {
  const dummyTrip: Trip = {
    id: 'trip_1',
    user_id: 'usr_1',
    title: 'Bali Escapade',
    destination_name: 'Bali',
    start_date: '2026-12-01',
    end_date: '2026-12-05',
    total_budget: 10000000,
    currency: 'IDR',
    is_public: 1,
    share_code: 'BALI-SHARE-1',
    created_at: new Date().toISOString(),
  };

  const dummyCompanions: Companion[] = [
    {
      id: 'comp_1',
      trip_id: 'trip_1',
      user_id: 'usr_2',
      name: 'Alex Rivera',
      email: 'alex@roamplan.app',
      role: 'editor',
      added_at: new Date().toISOString(),
    },
  ];

  it('renders share code, companion invitation form, and existing companions', () => {
    const { getByText } = render(
      <ShareTripModal
        isOpen={true}
        onClose={() => {}}
        trip={dummyTrip}
        companions={dummyCompanions}
        onCompanionsUpdated={() => {}}
      />
    );

    expect(getByText('Bagikan Itinerary ke Teman')).toBeDefined();
    expect(getByText('BALI-SHARE-1')).toBeDefined();
    expect(getByText('Undang')).toBeDefined();
    expect(getByText('Alex Rivera')).toBeDefined();
    expect(getByText('Editor')).toBeDefined();
  });
});
