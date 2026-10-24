import { describe, it, expect } from 'bun:test';
import React from 'react';
import { render } from '@testing-library/react';
import { RegisterView } from '../../../src/views/RegisterView.tsx';

describe('Frontend View: RegisterView (src/views/RegisterView.tsx)', () => {
  it('renders registration form fields and submit button', () => {
    const { getByText, getByPlaceholderText } = render(
      <RegisterView
        onRegisterSuccess={() => {}}
        onNavigateToLogin={() => {}}
        onBackToApp={() => {}}
      />
    );

    expect(getByText('Daftar Akun RoamPlan')).toBeDefined();
    expect(getByPlaceholderText(/Budi Santoso/i)).toBeDefined();
    expect(getByPlaceholderText(/budi@example.com/i)).toBeDefined();
    expect(getByText('Daftar Sekarang')).toBeDefined();
  });
});
