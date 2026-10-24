import { describe, it, expect } from 'bun:test';
import React from 'react';
import { render } from '@testing-library/react';
import { ProfileView } from '../../../src/views/ProfileView.tsx';

describe('Frontend View: ProfileView (src/views/ProfileView.tsx)', () => {
  it('renders loading placeholder initially', () => {
    const { getByText } = render(
      <ProfileView
        userId="usr_sarah"
        currentUser={null}
        onUpdateCurrentUser={() => {}}
        onSelectTrip={() => {}}
      />
    );

    expect(getByText(/Memuat profil pengguna/i)).toBeDefined();
  });
});
