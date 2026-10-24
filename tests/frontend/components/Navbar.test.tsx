import { describe, it, expect, mock } from 'bun:test';
import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Navbar } from '../../../src/components/Navbar.tsx';

describe('Frontend Component: Navbar (src/components/Navbar.tsx)', () => {
  const dummyUser = {
    id: 'usr_sarah',
    name: 'Sarah Jenkins',
    email: 'sarah@roamplan.app',
    created_at: new Date().toISOString(),
  };

  it('renders brand name and navigation items', () => {
    const onNavigate = mock(() => {});
    const onLogout = mock(() => {});
    const onOpenCreateTrip = mock(() => {});

    const { getByText } = render(
      <Navbar
        currentView="trips"
        onNavigate={onNavigate}
        currentUser={dummyUser}
        onLogout={onLogout}
        onOpenCreateTrip={onOpenCreateTrip}
      />
    );

    expect(getByText('RoamPlan')).toBeDefined();
    expect(getByText('Rencana Perjalanan')).toBeDefined();
    expect(getByText('Daftar Pengguna')).toBeDefined();
    expect(getByText('Profil Saya')).toBeDefined();
    expect(getByText('+ Rencana Baru')).toBeDefined();
  });

  it('triggers navigation when links are clicked', () => {
    const onNavigate = mock(() => {});
    const { getByText } = render(
      <Navbar
        currentView="trips"
        onNavigate={onNavigate}
        currentUser={dummyUser}
        onLogout={() => {}}
        onOpenCreateTrip={() => {}}
      />
    );

    fireEvent.click(getByText('Daftar Pengguna'));
    expect(onNavigate).toHaveBeenCalledWith('users');
  });

  it('shows login/register buttons when guest user', () => {
    const { getByText } = render(
      <Navbar
        currentView="trips"
        onNavigate={() => {}}
        currentUser={null}
        onLogout={() => {}}
        onOpenCreateTrip={() => {}}
      />
    );

    expect(getByText('Masuk')).toBeDefined();
    expect(getByText('Daftar Akun')).toBeDefined();
  });
});
