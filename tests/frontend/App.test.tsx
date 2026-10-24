import { describe, it, expect } from 'bun:test';
import React from 'react';
import { render } from '@testing-library/react';
import App from '../../src/App.tsx';

describe('Frontend Main Application: App (src/App.tsx)', () => {
  it('renders application navigation and dashboard view', () => {
    const { getAllByText } = render(<App />);

    expect(getAllByText('RoamPlan').length).toBeGreaterThan(0);
    expect(getAllByText('Rencana Perjalanan').length).toBeGreaterThan(0);
    expect(getAllByText('Daftar Pengguna').length).toBeGreaterThan(0);
  });
});
