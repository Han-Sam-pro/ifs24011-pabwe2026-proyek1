import { describe, it, expect, mock } from 'bun:test';
import React from 'react';
import { render } from '@testing-library/react';
import { AddDestinationModal } from '../../../src/components/AddDestinationModal.tsx';

describe('Frontend Component: AddDestinationModal (src/components/AddDestinationModal.tsx)', () => {
  it('renders modal when open with form fields', () => {
    const onClose = mock(() => {});
    const onAdd = mock(async () => {});

    const { getByText, getByPlaceholderText } = render(
      <AddDestinationModal
        isOpen={true}
        onClose={onClose}
        dayId="day_1"
        dayNumber={1}
        onAdd={onAdd}
      />
    );

    expect(getByText('Tambah Destinasi Kunjungan')).toBeDefined();
    expect(getByPlaceholderText(/Senso-ji Temple/i)).toBeDefined();
    expect(getByText('Simpan Destinasi')).toBeDefined();
  });

  it('does not render when isOpen is false', () => {
    const { container } = render(
      <AddDestinationModal
        isOpen={false}
        onClose={() => {}}
        dayId="day_1"
        dayNumber={1}
        onAdd={async () => {}}
      />
    );

    expect(container.firstChild).toBeNull();
  });
});
