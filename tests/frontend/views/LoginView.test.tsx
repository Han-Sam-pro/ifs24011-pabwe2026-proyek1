import { describe, it, expect, mock } from 'bun:test';
import React from 'react';
import { render } from '@testing-library/react';
import { LoginView } from '../../../src/views/LoginView.tsx';

describe('Frontend View: LoginView (src/views/LoginView.tsx)', () => {
  it('renders login title, inputs, submit button, and quick demo switchers', () => {
    const onLoginSuccess = mock(() => {});
    const onNavigateToRegister = mock(() => {});
    const onBackToApp = mock(() => {});

    const { getByText, getByPlaceholderText } = render(
      <LoginView
        onLoginSuccess={onLoginSuccess}
        onNavigateToRegister={onNavigateToRegister}
        onBackToApp={onBackToApp}
      />
    );

    expect(getByText('Masuk ke RoamPlan')).toBeDefined();
    expect(getByPlaceholderText('nama@email.com')).toBeDefined();
    expect(getByText('Masuk Sekarang')).toBeDefined();
    expect(getByText(/Sarah Jenkins/i)).toBeDefined();
    expect(getByText(/Alex Rivera/i)).toBeDefined();
  });
});
