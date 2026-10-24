import { describe, it, expect } from 'bun:test';
import React from 'react';
import { render } from '@testing-library/react';
import { TripDetailView } from '../../../src/views/TripDetailView.tsx';

describe('Frontend View: TripDetailView (src/views/TripDetailView.tsx)', () => {
  it('renders loading state initially while fetching trip details', () => {
    const { getByText } = render(
      <TripDetailView
        tripId="trip_tokyo"
        currentUser={null}
        onBack={() => {}}
        onRefreshTrips={() => {}}
      />
    );

    expect(getByText(/Memuat detail itinerary RoamPlan/i)).toBeDefined();
  });
});
