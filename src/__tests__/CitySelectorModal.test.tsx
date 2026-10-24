import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CitySelectorModal } from '../components/CitySelectorModal';
import { POPULAR_CITIES } from '../data/cityData';
import { PRESET_TRIPS } from '../data/presetTrips';
import type { TripPlan } from '../types/trip';

const yogya = POPULAR_CITIES.find((c) => c.cityName === 'Yogyakarta')!;
const singapore = POPULAR_CITIES.find((c) => c.cityName === 'Singapore')!;
const currentTrip: TripPlan = { ...PRESET_TRIPS[0], destinationCity: 'Yogyakarta' };

function renderModal(overrides: Partial<Parameters<typeof CitySelectorModal>[0]> = {}) {
  const props: any = {
    isOpen: true,
    onClose: vi.fn(),
    currentTrip,
    onUpdateTripCity: vi.fn(),
    onCreateTripForCity: vi.fn(),
    ...overrides,
  };
  render(<CitySelectorModal {...props} />);
  return props;
}

const cityInput = () => screen.getByPlaceholderText(/masukkan nama kota impian anda/i) as HTMLInputElement;

describe('CitySelectorModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <CitySelectorModal
        isOpen={false}
        onClose={vi.fn()}
        currentTrip={currentTrip}
        onUpdateTripCity={vi.fn()}
        onCreateTripForCity={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('prefills the city input with the current destination and defaults to the update tab', () => {
    renderModal();

    expect(cityInput()).toHaveValue('Yogyakarta');
    expect(screen.queryByLabelText(/judul perjalanan baru/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Atur Kota ke "Yogyakarta"' })).toBeEnabled();
  });

  it('lists every popular city as a selectable preset and marks the current one', () => {
    renderModal();

    POPULAR_CITIES.forEach((city) => {
      expect(screen.getByRole('button', { name: `Pilih kota ${city.cityName}` })).toBeInTheDocument();
    });
    expect(screen.getByText(`${POPULAR_CITIES.length} Destinasi Populer`)).toBeInTheDocument();
  });

  it('updates the trip city with trimmed input and closes the modal', () => {
    const { onUpdateTripCity, onClose } = renderModal();

    fireEvent.change(cityInput(), { target: { value: '  Bandung  ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Atur Kota ke "Bandung"' }));

    expect(onUpdateTripCity).toHaveBeenCalledWith('Bandung');
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('disables the submit button and ignores submission when the input is blank', () => {
    const { onUpdateTripCity, onClose } = renderModal();

    fireEvent.change(cityInput(), { target: { value: '   ' } });
    const submit = screen.getByRole('button', { name: /atur kota ke/i });
    expect(submit).toBeDisabled();

    fireEvent.submit(cityInput().closest('form')!);
    expect(onUpdateTripCity).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('fills the input from a preset city and clears the selection marker when typing again', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Pilih kota Singapore' }));
    expect(cityInput()).toHaveValue('Singapore');

    fireEvent.change(cityInput(), { target: { value: 'Singapura' } });
    expect(cityInput()).toHaveValue('Singapura');
  });

  it('switches to the "new trip" tab, showing a title field that follows the typed city', () => {
    renderModal();

    fireEvent.click(screen.getByRole('button', { name: /buat rencana baru kota ini/i }));
    const titleInput = screen.getByLabelText(/judul perjalanan baru/i) as HTMLInputElement;
    expect(titleInput).toHaveValue('Liburan Seru ke Yogyakarta');

    fireEvent.change(cityInput(), { target: { value: 'Malang' } });
    expect(titleInput).toHaveValue('Perjalanan Seru ke Malang');

    fireEvent.change(cityInput(), { target: { value: '' } });
    expect(titleInput).toHaveValue('Perjalanan Seru ke Kota Baru');
  });

  it('creates a new trip seeded with up to three popular spots for a preset city', () => {
    const { onCreateTripForCity, onUpdateTripCity, onClose } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Pilih kota Yogyakarta' }));
    fireEvent.click(screen.getByRole('button', { name: /buat rencana baru kota ini/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Buat Itinerary/i }));

    expect(onUpdateTripCity).not.toHaveBeenCalled();
    expect(onCreateTripForCity).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);

    const newTrip: TripPlan = onCreateTripForCity.mock.calls[0][0];
    expect(newTrip.destinationCity).toBe('Yogyakarta');
    expect(newTrip.title).toBe(`Eksplorasi Yogyakarta — Perjalanan ${yogya.provinceOrCountry}`);
    expect(newTrip.currency).toBe('IDR');
    expect(newTrip.totalBudget).toBe(5000000);

    const expectedSpots = Math.min(3, yogya.popularSpots?.length ?? 0);
    expect(newTrip.days).toHaveLength(1);
    expect(newTrip.days[0].destinations).toHaveLength(expectedSpots);
    expect(newTrip.days[0].destinations[0]).toMatchObject({
      title: yogya.popularSpots![0].title,
      category: yogya.popularSpots![0].cat,
      durationMinutes: 90,
      cost: yogya.popularSpots![0].cost,
      startTime: '09:00',
    });
    expect(newTrip.days[0].destinations[1].startTime).toBe('12:00');
  });

  it('uses the preset city currency and a USD-style budget for non-IDR cities', () => {
    const { onCreateTripForCity } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: 'Pilih kota Singapore' }));
    fireEvent.click(screen.getByRole('button', { name: /buat rencana baru kota ini/i }));
    fireEvent.click(screen.getByRole('button', { name: /^Buat Itinerary/i }));

    const newTrip: TripPlan = onCreateTripForCity.mock.calls[0][0];
    expect(newTrip.currency).toBe(singapore.defaultCurrency);
    expect(newTrip.totalBudget).toBe(1000);
  });

  it('creates a trip for a free-typed city with no preset spots and a fallback title', () => {
    const { onCreateTripForCity } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: /buat rencana baru kota ini/i }));
    fireEvent.change(cityInput(), { target: { value: 'Bogor' } });
    fireEvent.change(screen.getByLabelText(/judul perjalanan baru/i), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: /^Buat Itinerary/i }));

    const newTrip: TripPlan = onCreateTripForCity.mock.calls[0][0];
    expect(newTrip.destinationCity).toBe('Bogor');
    expect(newTrip.title).toBe('Rencana Perjalanan Bogor');
    expect(newTrip.currency).toBe('IDR');
    expect(newTrip.days[0].destinations).toEqual([]);
    expect(newTrip.days[0].themeTitle).toBe('Hari Pertama di Bogor');
    expect(newTrip.startDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(newTrip.endDate >= newTrip.startDate).toBe(true);
  });

  it('does not create a trip when the typed city is blank in the new-trip tab', () => {
    const { onCreateTripForCity, onClose } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: /buat rencana baru kota ini/i }));
    fireEvent.change(cityInput(), { target: { value: '' } });
    fireEvent.submit(cityInput().closest('form')!);

    expect(onCreateTripForCity).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });

  it('closes from the header close button and the "Batal" button without applying changes', () => {
    const { onClose, onUpdateTripCity } = renderModal();

    fireEvent.click(screen.getByLabelText(/tutup jendela pilih kota/i));
    fireEvent.click(screen.getByRole('button', { name: 'Batal' }));

    expect(onClose).toHaveBeenCalledTimes(2);
    expect(onUpdateTripCity).not.toHaveBeenCalled();
  });
});
