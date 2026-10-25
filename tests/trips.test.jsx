import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { FeedbackProvider } from '../src/components/Feedback';
import TripForm from '../src/pages/TripForm';
import TripDetail from '../src/pages/TripDetail';
import { api } from '../src/lib/api';

vi.mock('../src/lib/api', () => {
  class MockApiError extends Error {
    constructor(message, { status = 0, code = 'UNKNOWN', details = null } = {}) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.code = code;
      this.details = details;
    }
    get isNetwork() { return this.code === 'NETWORK'; }
  }
  return {
    api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
    getToken: vi.fn(() => null),
    setToken: vi.fn(),
    ApiError: MockApiError,
  };
});

// Peta Google membutuhkan kunci API; di pengujian cukup diganti komponen kosong.
vi.mock('../src/components/MapPicker', () => ({ default: () => null }));

const detail = {
  id: 1,
  title: 'Liburan Samosir',
  destination: 'Danau Toba',
  start_date: '2026-11-10',
  end_date: '2026-11-11',
  budget: 100000,
  day_count: 2,
  stop_count: 2,
  days: [
    {
      day_number: 1,
      date: '2026-11-10',
      stop_count: 2,
      distance_km: 3.2,
      activity_cost: 80000,
      transport_cost: 8000,
      total_cost: 88000,
      stops: [
        { id: 10, day_number: 1, position: 1, name: 'Tomok', category: 'wisata', lat: 2.5583, lng: 98.9038, arrival_time: '09:00', duration_min: 90, cost: 50000, notes: null },
        { id: 11, day_number: 1, position: 2, name: 'Ambarita', category: 'wisata', lat: 2.5667, lng: 98.8817, arrival_time: null, duration_min: 45, cost: 30000, notes: 'Bawa topi' },
      ],
    },
    { day_number: 2, date: '2026-11-11', stop_count: 0, distance_km: 0, activity_cost: 0, transport_cost: 0, total_cost: 0, stops: [] },
  ],
  costs: {
    activity_cost: 80000,
    transport_cost: 8000,
    total_cost: 88000,
    distance_km: 3.2,
    budget: 100000,
    remaining: 12000,
    over_budget: false,
    by_category: { wisata: 80000 },
  },
};

function renderRoute(path, routes) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <FeedbackProvider>
        <Routes>
          {routes}
          <Route path="*" element={<p>Halaman lain</p>} />
        </Routes>
      </FeedbackProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('formulir rencana', () => {
  it('menolak judul kosong tanpa memanggil API', async () => {
    renderRoute('/rencana/baru', <Route path="/rencana/baru" element={<TripForm />} />);
    await userEvent.setup().click(screen.getByRole('button', { name: 'Buat rencana' }));
    expect(screen.getByText('Judul minimal 3 karakter')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('membuat rencana baru lalu membuka detailnya', async () => {
    api.post.mockResolvedValue({ data: { id: 7 }, meta: null });
    renderRoute('/rencana/baru', [
      <Route key="new" path="/rencana/baru" element={<TripForm />} />,
      <Route key="detail" path="/rencana/:id" element={<p>Detail rencana</p>} />,
    ]);
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Judul rencana'), 'Liburan Samosir');
    await user.type(screen.getByLabelText('Destinasi utama'), 'Danau Toba');
    await user.click(screen.getByRole('button', { name: 'Buat rencana' }));
    expect(api.post).toHaveBeenCalledWith('/trips', expect.objectContaining({
      title: 'Liburan Samosir',
      destination: 'Danau Toba',
      budget: 1000000,
    }));
    expect(await screen.findByText('Detail rencana')).toBeInTheDocument();
  });
});

describe('detail itinerary', () => {
  beforeEach(() => {
    api.get.mockResolvedValue({ data: detail, meta: null });
  });

  it('menampilkan destinasi hari pertama sesuai urutan dengan jarak antar titik', async () => {
    renderRoute('/rencana/1', <Route path="/rencana/:id" element={<TripDetail />} />);
    const list = await screen.findByRole('list', { name: 'Destinasi hari 1' });
    const items = within(list).getAllByRole('listitem');
    expect(items).toHaveLength(2);
    expect(items[0]).toHaveTextContent('Tomok');
    expect(items[1]).toHaveTextContent('Ambarita');
    expect(items[1]).toHaveTextContent('dari destinasi sebelumnya');
    expect(items[1]).toHaveTextContent('Bawa topi');
  });

  it('mengurutkan hari berdasarkan jarak lewat endpoint reorder', async () => {
    api.post.mockResolvedValue({ data: detail, meta: null });
    renderRoute('/rencana/1', <Route path="/rencana/:id" element={<TripDetail />} />);
    await userEvent.setup().click(await screen.findByRole('button', { name: 'Urutkan jarak' }));
    expect(api.post).toHaveBeenCalledWith('/trips/1/days/1/reorder', { mode: 'distance' });
  });

  it('pindah hari menampilkan hari yang kosong', async () => {
    renderRoute('/rencana/1', <Route path="/rencana/:id" element={<TripDetail />} />);
    await userEvent.setup().click(await screen.findByRole('button', { name: /Hari 2/ }));
    expect(screen.getByText('Belum ada destinasi')).toBeInTheDocument();
  });

  it('form destinasi menolak data kosong', async () => {
    renderRoute('/rencana/1', <Route path="/rencana/:id" element={<TripDetail />} />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Tambah destinasi' }));
    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Simpan destinasi' }));
    expect(within(dialog).getByText('Nama destinasi minimal 2 karakter')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('menghapus destinasi setelah konfirmasi', async () => {
    api.del.mockResolvedValue({ data: detail, meta: null });
    renderRoute('/rencana/1', <Route path="/rencana/:id" element={<TripDetail />} />);
    const user = userEvent.setup();
    await user.click(await screen.findByRole('button', { name: 'Hapus Tomok' }));
    const confirmDialog = await screen.findByRole('alertdialog');
    await user.click(within(confirmDialog).getByRole('button', { name: 'Hapus' }));
    expect(api.del).toHaveBeenCalledWith('/trips/1/stops/10');
  });
});
