import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { FeedbackProvider } from '../src/components/Feedback';
import Users from '../src/pages/Users';
import Profile from '../src/pages/Profile';
import { api } from '../src/lib/api';

vi.mock('../src/lib/api', () => ({
  api: { get: vi.fn(), post: vi.fn(), put: vi.fn(), del: vi.fn() },
  getToken: vi.fn(() => null),
  setToken: vi.fn(),
  ApiError: class extends Error {},
}));

const profile = {
  id: 1,
  username: 'alice01',
  name: 'Alice Samosir',
  email: 'alice@example.com',
  phone: null,
  bio: null,
  created_at: '2026-10-01 10:00:00',
  updated_at: '2026-10-01 10:00:00',
  trip_count: 2,
};

const wrap = (ui) => render(
  <MemoryRouter>
    <AuthProvider>
      <FeedbackProvider>{ui}</FeedbackProvider>
    </AuthProvider>
  </MemoryRouter>,
);

beforeEach(() => {
  vi.clearAllMocks();
});

describe('daftar pengguna', () => {
  it('menampilkan seluruh pengguna beserta total', async () => {
    api.get.mockResolvedValue({
      data: [
        { id: 1, username: 'alice01', name: 'Alice Samosir', bio: 'Suka pantai', created_at: '2026-10-01 10:00:00' },
        { id: 2, username: 'bob_toba', name: 'Bob Toba', bio: null, created_at: '2026-10-02 09:00:00' },
      ],
      meta: { page: 1, limit: 9, total: 2, total_pages: 1 },
    });
    wrap(<Users />);
    expect(await screen.findByText('Alice Samosir')).toBeInTheDocument();
    expect(screen.getByText('@bob_toba')).toBeInTheDocument();
    expect(screen.getByText('2 pengguna terdaftar')).toBeInTheDocument();
    expect(api.get).toHaveBeenCalledWith('/users', { q: '', page: 1, limit: 9 });
  });

  it('mencari pengguna dengan kata kunci setelah jeda pengetikan', async () => {
    api.get.mockResolvedValue({ data: [], meta: { page: 1, limit: 9, total: 0, total_pages: 1 } });
    wrap(<Users />);
    await userEvent.setup().type(screen.getByRole('searchbox'), 'toba');
    await waitFor(() => {
      expect(api.get).toHaveBeenLastCalledWith('/users', { q: 'toba', page: 1, limit: 9 });
    }, { timeout: 2000 });
    expect(await screen.findByText('Pengguna tidak ditemukan')).toBeInTheDocument();
  });
});

describe('profil', () => {
  beforeEach(() => {
    api.get.mockResolvedValue({ data: profile, meta: null });
  });

  it('mengisi formulir dari profil dan menyimpan perubahan', async () => {
    api.put.mockResolvedValue({ data: { ...profile, name: 'Alice S.' }, meta: null });
    wrap(<Profile />);
    const name = await screen.findByLabelText('Nama lengkap');
    expect(name).toHaveValue('Alice Samosir');

    const user = userEvent.setup();
    await user.clear(name);
    await user.type(name, 'Alice S.');
    await user.click(screen.getByRole('button', { name: 'Simpan profil' }));

    expect(api.put).toHaveBeenCalledWith('/profile', {
      name: 'Alice S.',
      email: 'alice@example.com',
      phone: null,
      bio: null,
    });
  });

  it('menolak konfirmasi kata sandi baru yang berbeda tanpa memanggil API', async () => {
    wrap(<Profile />);
    await screen.findByLabelText('Nama lengkap');
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Kata sandi saat ini'), 'lama12345');
    await user.type(screen.getByLabelText('Kata sandi baru'), 'baru12345');
    await user.type(screen.getByLabelText('Ulangi kata sandi baru'), 'beda12345');
    await user.click(screen.getByRole('button', { name: 'Ubah kata sandi' }));
    expect(screen.getByText('Konfirmasi kata sandi tidak sama')).toBeInTheDocument();
    expect(api.put).not.toHaveBeenCalled();
  });
});
