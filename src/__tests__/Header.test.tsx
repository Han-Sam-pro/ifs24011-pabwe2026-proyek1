/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Header } from '../components/Header';
import { PRESET_TRIPS } from '../data/presetTrips';

describe('Header Component', () => {
  it('renders RoamPlan brand and navigation elements', () => {
    render(
      <BrowserRouter>
        <Header
          trip={PRESET_TRIPS[0]}
          activeViewTab="planner"
          currentUser={null}
          onChangeViewTab={() => {}}
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

    const brand = screen.getByText(/roamplan/i);
    const itineraryTab = screen.getByText(/itinerary & peta/i);
    const budgetTab = screen.getByText(/anggaran & biaya/i);

    expect(brand).toBeInTheDocument();
    expect(itineraryTab).toBeInTheDocument();
    expect(budgetTab).toBeInTheDocument();
  });
});
