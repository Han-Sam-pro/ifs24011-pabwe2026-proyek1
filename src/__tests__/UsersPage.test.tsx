/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { UsersPage } from '../pages/UsersPage';
import { PRESET_TRIPS } from '../data/presetTrips';

describe('UsersPage Component', () => {
  it('renders users directory header and search input', () => {
    render(
      <BrowserRouter>
        <UsersPage
          trip={PRESET_TRIPS[0]}
          currentUser={null}
          onOpenShareModal={() => {}}
          onTriggerPrint={() => {}}
          onSelectPresetTrip={() => {}}
          onChangeCurrency={() => {}}
          onNewTrip={() => {}}
          onOpenAuthModal={() => {}}
          onOpenUsersModal={() => {}}
        />
      </BrowserRouter>
    );

    const heading = screen.getByRole('heading', { name: /daftar pengguna/i });
    const searchInput = screen.getByPlaceholderText(/cari pengguna berdasarkan nama/i);

    expect(heading).toBeInTheDocument();
    expect(searchInput).toBeInTheDocument();
  });
});
