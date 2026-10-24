/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { BudgetOverview } from '../components/BudgetOverview';
import { DayTabs } from '../components/DayTabs';
import { PrintView } from '../components/PrintView';
import { AuthModal } from '../components/AuthModal';
import { UsersDirectoryModal } from '../components/UsersDirectoryModal';
import { CitySelectorModal } from '../components/CitySelectorModal';
import { PRESET_TRIPS } from '../data/presetTrips';

describe('Additional UI Components', () => {
  it('renders BudgetOverview', () => {
    render(<BudgetOverview trip={PRESET_TRIPS[0]} onUpdateTotalBudget={() => {}} />);
    expect(screen.getByText(/estimasi & pengendalian anggaran/i)).toBeInTheDocument();
  });

  it('renders DayTabs', () => {
    render(
      <DayTabs
        days={PRESET_TRIPS[0].days}
        activeDayIndex={0}
        onSelectDay={() => {}}
        onAddDay={() => {}}
        onDeleteDay={() => {}}
        onUpdateDayTheme={() => {}}
      />
    );
    expect(screen.getByText(/hari 1/i)).toBeInTheDocument();
  });

  it('renders PrintView', () => {
    render(<PrintView trip={PRESET_TRIPS[0]} />);
    expect(screen.getByText(PRESET_TRIPS[0].title)).toBeInTheDocument();
  });

  it('renders AuthModal when open', () => {
    render(
      <AuthModal
        isOpen={true}
        onClose={() => {}}
        currentUser={null}
        onUserLoggedIn={() => {}}
        onUserLoggedOut={() => {}}
      />
    );
    expect(screen.getByText(/autentikasi akun/i)).toBeInTheDocument();
  });

  it('renders UsersDirectoryModal when open', () => {
    render(<UsersDirectoryModal isOpen={true} onClose={() => {}} />);
    expect(screen.getByText(/daftar pengguna/i)).toBeInTheDocument();
  });

  it('renders CitySelectorModal when open', () => {
    render(
      <BrowserRouter>
        <CitySelectorModal
          isOpen={true}
          onClose={() => {}}
          currentTrip={PRESET_TRIPS[0]}
          onUpdateTripCity={() => {}}
          onCreateTripForCity={() => {}}
        />
      </BrowserRouter>
    );
    expect(screen.getByText(/ganti atau tambah kota tujuan/i)).toBeInTheDocument();
  });
});
