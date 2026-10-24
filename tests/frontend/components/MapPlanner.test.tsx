import { describe, it, expect } from 'bun:test';
import React from 'react';
import { render } from '@testing-library/react';
import { MapPlanner } from '../../../src/components/MapPlanner.tsx';
import { Destination } from '../../../src/types.ts';

describe('Frontend Component: MapPlanner (src/components/MapPlanner.tsx)', () => {
  const dummyDestinations: Destination[] = [
    {
      id: 'dest_1',
      day_id: 'day_1',
      trip_id: 'trip_1',
      name: 'Senso-ji Temple',
      address: 'Asakusa, Tokyo',
      lat: 35.7148,
      lng: 139.7967,
      time_start: '09:00',
      time_end: '11:00',
      estimated_cost: 150000,
      category: 'attraction',
      visit_order: 1,
    },
    {
      id: 'dest_2',
      day_id: 'day_1',
      trip_id: 'trip_1',
      name: 'Tokyo Skytree',
      address: 'Oshiage, Tokyo',
      lat: 35.7100,
      lng: 139.8107,
      time_start: '11:30',
      time_end: '13:30',
      estimated_cost: 350000,
      category: 'attraction',
      visit_order: 2,
    },
  ];

  it('renders interactive map container and destination points count', () => {
    const { getByText } = render(
      <MapPlanner destinations={dummyDestinations} />
    );

    expect(getByText('Peta Rute Interaktif')).toBeDefined();
    expect(getByText('2 Titik Kunjungan')).toBeDefined();
    expect(getByText('Atraksi')).toBeDefined();
    expect(getByText('Kuliner')).toBeDefined();
  });
});
