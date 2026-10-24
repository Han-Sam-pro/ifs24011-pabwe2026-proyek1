import { describe, it, expect } from 'bun:test';
import React from 'react';
import { render } from '@testing-library/react';
import { SharedTripView } from '../../../src/views/SharedTripView.tsx';

describe('Frontend View: SharedTripView (src/views/SharedTripView.tsx)', () => {
  it('renders loading placeholder initially', () => {
    const { getByText } = render(
      <SharedTripView
        shareCode="TOKYO-2026-ROAM"
        onBackToApp={() => {}}
        onOpenInApp={() => {}}
      />
    );

    expect(getByText(/Membuka rencana perjalanan bersama/i)).toBeDefined();
  });
});
