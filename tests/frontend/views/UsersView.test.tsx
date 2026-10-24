import { describe, it, expect } from 'bun:test';
import React from 'react';
import { render } from '@testing-library/react';
import { UsersView } from '../../../src/views/UsersView.tsx';

describe('Frontend View: UsersView (src/views/UsersView.tsx)', () => {
  it('renders users directory header and search placeholder', () => {
    const { getByText, getByPlaceholderText } = render(
      <UsersView
        onSelectUserTrip={() => {}}
        onViewUserProfile={() => {}}
      />
    );

    expect(getByText('Semua Pengguna Aplikasi')).toBeDefined();
    expect(getByText(/Komunitas RoamPlan/i)).toBeDefined();
    expect(getByPlaceholderText(/Cari nama atau kota/i)).toBeDefined();
  });
});
