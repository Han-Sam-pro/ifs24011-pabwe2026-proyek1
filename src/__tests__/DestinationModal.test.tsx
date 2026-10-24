import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DestinationModal } from '../components/DestinationModal';
import { POPULAR_CITIES } from '../data/cityData';
import type { Destination } from '../types/trip';

const prambanan = POPULAR_CITIES.find((c) => c.cityName === 'Yogyakarta')!.popularSpots![0];

const existing: Destination = {
  id: 'dest-existing',
  title: 'Gudeg Yu Djum',
  category: 'culinary',
  startTime: '12:30',
  durationMinutes: 60,
  cost: 25000,
  lat: -7.79,
  lng: 110.37,
  address: 'Wijilan, Yogyakarta',
  notes: 'Antre sejak pagi',
};

function renderModal(overrides: Partial<Parameters<typeof DestinationModal>[0]> = {}) {
  const props: any = {
    isOpen: true,
    onClose: vi.fn(),
    onSave: vi.fn(),
    destinationToEdit: null,
    dayNumber: 2,
    currency: 'IDR',
    destinationCity: 'Yogyakarta',
    onTriggerMapPick: vi.fn(),
    pendingCoordinates: null,
    ...overrides,
  };
  const utils = render(<DestinationModal {...props} />);
  return { props, ...utils };
}

describe('DestinationModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when closed', () => {
    const { container } = render(
      <DestinationModal
        isOpen={false}
        onClose={vi.fn()}
        onSave={vi.fn()}
        dayNumber={1}
        currency="IDR"
        onTriggerMapPick={vi.fn()}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('shows the add heading with the day number and a suggested-places group for the city', () => {
    renderModal();

    expect(screen.getByText('Tambah Destinasi — Hari 2')).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Tempat Populer' })).toBeInTheDocument();
    expect(screen.getByText(/Isi Cepat Tempat Populer \(Yogyakarta\)/)).toBeInTheDocument();
  });

  it('falls back to spots from all cities when the destination city is unknown', () => {
    renderModal({ destinationCity: 'Kota Antah Berantah' });

    expect(screen.getByText(/Isi Cepat Tempat Populer\s*:/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: `Gunakan data cepat ${prambanan.title}` })).toBeInTheDocument();
  });

  it('fills the form from a quick-pick spot, including its category, cost and address', () => {
    const { props } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: `Gunakan data cepat ${prambanan.title}` }));
    fireEvent.click(screen.getByRole('button', { name: /tambahkan ke jadwal/i }));

    expect(props.onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        title: prambanan.title,
        category: prambanan.cat,
        cost: prambanan.cost,
        lat: prambanan.lat,
        lng: prambanan.lng,
        address: prambanan.address,
      })
    );
  });

  it('does not save when the required title is blank', () => {
    const { props } = renderModal();

    fireEvent.change(screen.getByLabelText(/nama destinasi \/ tempat/i), { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: /tambahkan ke jadwal/i }));

    expect(props.onSave).not.toHaveBeenCalled();
    expect(props.onClose).not.toHaveBeenCalled();
  });

  it('saves a new destination built from the form fields and closes', () => {
    const { props } = renderModal();

    fireEvent.change(screen.getByLabelText(/nama destinasi \/ tempat/i), { target: { value: '  Pantai Parangtritis  ' } });
    fireEvent.click(screen.getByRole('button', { name: /alam \/ pantai/i }));
    fireEvent.change(screen.getByLabelText(/waktu mulai/i), { target: { value: '15:00' } });
    fireEvent.click(screen.getByRole('button', { name: 'Set durasi 120 menit' }));
    fireEvent.change(screen.getByLabelText(/estimasi biaya/i), { target: { value: '30000' } });
    fireEvent.change(screen.getByLabelText(/latitude/i), { target: { value: '-8.02' } });
    fireEvent.change(screen.getByLabelText(/longitude/i), { target: { value: '110.29' } });
    fireEvent.change(screen.getByLabelText(/^alamat/i), { target: { value: 'Parangtritis, Bantul' } });
    fireEvent.change(screen.getByLabelText(/catatan khusus/i), { target: { value: ' Bawa topi ' } });
    fireEvent.click(screen.getByRole('button', { name: /tambahkan ke jadwal/i }));

    expect(props.onSave).toHaveBeenCalledTimes(1);
    const saved: Destination = props.onSave.mock.calls[0][0];
    expect(saved.id).toMatch(/^dest-/);
    expect(saved).toMatchObject({
      title: 'Pantai Parangtritis',
      category: 'nature',
      startTime: '15:00',
      durationMinutes: 120,
      cost: 30000,
      lat: -8.02,
      lng: 110.29,
      address: 'Parangtritis, Bantul',
      notes: 'Bawa topi',
    });
    expect(props.onClose).toHaveBeenCalledTimes(1);
  });

  it('uses safe defaults when numeric fields are cleared', () => {
    const { props } = renderModal();

    fireEvent.change(screen.getByLabelText(/nama destinasi \/ tempat/i), { target: { value: 'Tanpa Biaya' } });
    fireEvent.change(screen.getByLabelText(/estimasi biaya/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /tambahkan ke jadwal/i }));

    const saved: Destination = props.onSave.mock.calls[0][0];
    expect(saved.startTime).toBe('09:00');
    expect(saved.cost).toBe(0);
    expect(saved.address).toBeUndefined();
    expect(saved.notes).toBeUndefined();
  });

  it('edits an existing destination keeping its id and prefilled values', () => {
    const { props } = renderModal({ destinationToEdit: existing });

    expect(screen.getByText('Edit Destinasi Kunjungan')).toBeInTheDocument();
    expect(screen.queryByRole('group', { name: 'Tempat Populer' })).not.toBeInTheDocument();
    expect(screen.getByLabelText(/nama destinasi \/ tempat/i)).toHaveValue('Gudeg Yu Djum');

    fireEvent.change(screen.getByLabelText(/nama destinasi \/ tempat/i), { target: { value: 'Gudeg Baru' } });
    fireEvent.click(screen.getByRole('button', { name: 'Simpan Perubahan' }));

    expect(props.onSave).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'dest-existing', title: 'Gudeg Baru', category: 'culinary', notes: 'Antre sejak pagi' })
    );
  });

  it('applies picked map coordinates to the latitude and longitude fields', () => {
    const { rerender, props } = renderModal();

    rerender(
      <DestinationModal {...props} pendingCoordinates={{ lat: -7.6, lng: 110.2 }} />
    );

    expect(screen.getByLabelText(/latitude/i)).toHaveValue(-7.6);
    expect(screen.getByLabelText(/longitude/i)).toHaveValue(110.2);
  });

  it('starts the map picking workflow from the coordinate section', () => {
    const { props } = renderModal();

    fireEvent.click(screen.getByRole('button', { name: /pilih titik koordinat langsung di peta/i }));

    expect(props.onTriggerMapPick).toHaveBeenCalledTimes(1);
  });

  it('closes from the header close button and the "Batal" button', () => {
    const { props } = renderModal();

    fireEvent.click(screen.getByLabelText(/tutup jendela formulir destinasi/i));
    fireEvent.click(screen.getByRole('button', { name: 'Batal' }));

    expect(props.onClose).toHaveBeenCalledTimes(2);
    expect(props.onSave).not.toHaveBeenCalled();
  });
});
