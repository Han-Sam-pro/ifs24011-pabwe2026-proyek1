/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ProfilePage } from '../pages/ProfilePage';
import { PRESET_TRIPS } from '../data/presetTrips';

describe('ProfilePage Component', () => {
  it('renders user profile details when logged in', () => {
    const mockUser = {
      id: 1,
      name: 'Test User',
      email: 'test@example.com',
      photo: 'https://open-api.delcom.org/default/img/user.png',
    };

    render(
      <BrowserRouter>
        <ProfilePage
          trip={PRESET_TRIPS[0]}
          currentUser={mockUser}
          onUserLoggedOut={() => {}}
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

    const userName = screen.getByRole('heading', { name: /test user/i });
    const userEmail = screen.getByText(/test@example.com/i);
    const logoutButton = screen.getByRole('button', { name: /keluar \(logout\)/i });

    expect(userName).toBeInTheDocument();
    expect(userEmail).toBeInTheDocument();
    expect(logoutButton).toBeInTheDocument();
  });
});
