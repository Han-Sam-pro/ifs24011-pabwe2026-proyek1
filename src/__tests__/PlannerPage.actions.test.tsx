import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { PlannerPage } from '../pages/PlannerPage';
import { PRESET_TRIPS } from '../data/presetTrips';

// Expose Header props so the page's header wiring can be exercised directly.
const { headerProps } = vi.hoisted(() => ({ headerProps: { current: null as any } }));

vi.mock('../components/Header', () => ({
  Header: (props: any) => {
    headerProps.current = props;
    return <div data-testid="header-stub" />;
  },
}));

function makeProps(overrides: Record<string, unknown> = {}) {
  const noop = () => {};
  return {
    trip: PRESET_TRIPS[0],
    setTrip: vi.fn(),
    activeDayIndex: 0,
    setActiveDayIndex: vi.fn(),
    activeViewTab: 'planner' as const,
    setActiveViewTab: vi.fn(),
    selectedDestinationId: null,
    setSelectedDestinationId: vi.fn(),
    quotaExceeded: false,
    googleMapsApiKey: 'mock-key',
    mobileSubTab: 'list' as const,
    setMobileSubTab: vi.fn(),
    currentUser: null,
    isSharedTripImported: false,
    setIsSharedTripImported: vi.fn(),
    toastMessage: null,
    onOpenAddDestination: noop,
    onOpenEditDestination: noop,
    handleDeleteDestination: noop,
    handleMoveDestination: noop,
    handleOptimizeRoute: noop,
    handleAddDay: noop,
    handleDeleteDay: noop,
    handleUpdateDayTheme: noop,
    handleUpdateTotalBudget: noop,
    handleChangeCurrency: vi.fn(),
    handleSelectPresetTrip: vi.fn(),
    handleNewTrip: vi.fn(),
    handleTriggerPrint: vi.fn(),
    setIsShareModalOpen: vi.fn(),
    setIsCityModalOpen: vi.fn(),
    setIsAuthModalOpen: vi.fn(),
    setIsUsersModalOpen: vi.fn(),
    isPickingLocation: false,
    handlePickLocationFromMap: noop,
    ...overrides,
  } as any;
}

function renderPage(props: any, path = '/') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<PlannerPage {...props} />} />
        <Route path="/plan/:id" element={<PlannerPage {...props} />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('PlannerPage header wiring', () => {
  it('forwards every header action to the matching page prop', () => {
    const props = makeProps();
    renderPage(props);
    const h = headerProps.current;

    h.onOpenShareModal();
    expect(props.setIsShareModalOpen).toHaveBeenCalledWith(true);

    h.onTriggerPrint();
    expect(props.handleTriggerPrint).toHaveBeenCalledTimes(1);

    h.onSelectPresetTrip(PRESET_TRIPS[1]);
    expect(props.handleSelectPresetTrip).toHaveBeenCalledWith(PRESET_TRIPS[1]);

    h.onChangeCurrency('EUR');
    expect(props.handleChangeCurrency).toHaveBeenCalledWith('EUR');

    h.onNewTrip();
    expect(props.handleNewTrip).toHaveBeenCalledTimes(1);

    h.onOpenCityModal();
    expect(props.setIsCityModalOpen).toHaveBeenCalledWith(true);

    h.onOpenAuthModal();
    expect(props.setIsAuthModalOpen).toHaveBeenCalledWith(true);

    h.onOpenUsersModal();
    expect(props.setIsUsersModalOpen).toHaveBeenCalledWith(true);

    h.onChangeViewTab('budget');
    expect(props.setActiveViewTab).toHaveBeenCalledWith('budget');
  });

  it('renders the header for the planner route with a plan id parameter', () => {
    renderPage(makeProps(), '/plan/abc-123');
    expect(screen.getByTestId('header-stub')).toBeInTheDocument();
  });

  it('shows the quota notice only when Google Maps quota is exceeded', () => {
    const { unmount } = renderPage(makeProps({ quotaExceeded: true }));
    expect(screen.getByText(/google maps platform quota reached/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'maps developer site' })).toHaveAttribute('target', '_blank');
    unmount();

    renderPage(makeProps({ quotaExceeded: false }));
    expect(screen.queryByText(/google maps platform quota reached/i)).not.toBeInTheDocument();
  });

  it('shows the shared-trip banner with the trip title and lets the user dismiss it', () => {
    const props = makeProps({ isSharedTripImported: true });
    renderPage(props);

    expect(screen.getByText(/mode berbagi teman/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /tutup|sembunyikan|×|x/i }));
    expect(props.setIsSharedTripImported).toHaveBeenCalledWith(false);
  });
});
