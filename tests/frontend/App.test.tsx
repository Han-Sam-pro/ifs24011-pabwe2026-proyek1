import { describe, it, expect } from 'bun:test';
import React from 'react';
import { render } from '@testing-library/react';
import App from '../../src/App.tsx';

describe('Frontend Main Application: App (src/App.tsx)', () => {
  it('renders application navigation and dashboard view', () => {
    const { getByText } = render(<App />);

    expect(getByText('RoamPlan')).toBeDefined();
    expect(getByText('Rencana Perjalanan')).toBeDefined();
    expect(getByText('Daftar Pengguna')).toBeDefined();
  });
});
