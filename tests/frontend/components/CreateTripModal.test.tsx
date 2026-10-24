import { describe, it, expect } from 'bun:test';
import React from 'react';
import { render } from '@testing-library/react';
import { CreateTripModal } from '../../../src/components/CreateTripModal.tsx';

describe('Frontend Component: CreateTripModal (src/components/CreateTripModal.tsx)', () => {
  it('renders form fields for creating a new trip itinerary', () => {
    const { getByText, getByPlaceholderText } = render(
      <CreateTripModal
        isOpen={true}
        onClose={() => {}}
        onCreate={async () => {}}
      />
    );

    expect(getByText('Buat Rencana Perjalanan Baru')).toBeDefined();
    expect(getByPlaceholderText(/Eksplorasi Kuliner/i)).toBeDefined();
    expect(getByPlaceholderText(/Osaka, Jepang/i)).toBeDefined();
    expect(getByText('Buat Rencana')).toBeDefined();
  });
});
