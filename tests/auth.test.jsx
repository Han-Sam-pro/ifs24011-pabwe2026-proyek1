import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider } from '../src/context/AuthContext';
import { FeedbackProvider } from '../src/components/Feedback';
import Login from '../src/pages/Login';
import Register from '../src/pages/Register';
import { api, ApiError } from '../src/lib/api';

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

const session = { token: 'token-uji', user: { id: 1, name: 'Alice Samosir', username: 'alice01' } };

function renderAt(path) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AuthProvider>
        <FeedbackProvider>
          <Routes>
            <Route path="/auth/login" element={<Login />} />
            <Route path="/auth/register" element={<Register />} />
            <Route path="/" element={<h1>Beranda</h1>} />
          </Routes>
        </FeedbackProvider>
      </AuthProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('halaman masuk (terpisah dari daftar)', () => {
  it('menampilkan galat validasi saat form kosong tanpa memanggil API', async () => {
    renderAt('/auth/login');
    await userEvent.setup().click(screen.getByRole('button', { name: 'Masuk' }));
    expect(screen.getByText('Username wajib diisi')).toBeInTheDocument();
    expect(screen.getByText('Kata sandi wajib diisi')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('masuk berhasil lalu diarahkan ke beranda', async () => {
    api.post.mockResolvedValue({ data: session, meta: null });
    renderAt('/auth/login');
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Username'), 'alice01');
    await user.type(screen.getByLabelText('Kata sandi'), 'rahasia123');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(api.post).toHaveBeenCalledWith('/auth/login', { username: 'alice01', password: 'rahasia123' });
    expect(await screen.findByRole('heading', { name: 'Beranda' })).toBeInTheDocument();
  });

  it('menampilkan pesan galat dari server', async () => {
    api.post.mockRejectedValue(new ApiError('Username atau kata sandi salah', { status: 401, code: 'UNAUTHORIZED' }));
    renderAt('/auth/login');
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Username'), 'alice01');
    await user.type(screen.getByLabelText('Kata sandi'), 'salah1234');
    await user.click(screen.getByRole('button', { name: 'Masuk' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('Username atau kata sandi salah');
  });

  it('menyediakan tautan ke halaman daftar', () => {
    renderAt('/auth/login');
    expect(screen.getByRole('link', { name: 'Daftar sekarang' })).toHaveAttribute('href', '/auth/register');
  });
});

describe('halaman daftar (terpisah dari masuk)', () => {
  it('menolak konfirmasi kata sandi yang tidak sama', async () => {
    renderAt('/auth/register');
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Nama lengkap'), 'Alice Samosir');
    await user.type(screen.getByLabelText('Username'), 'alice01');
    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.type(screen.getByLabelText('Kata sandi'), 'rahasia123');
    await user.type(screen.getByLabelText('Ulangi kata sandi'), 'rahasia999');
    await user.click(screen.getByRole('button', { name: 'Daftar' }));
    expect(screen.getByText('Konfirmasi kata sandi tidak sama')).toBeInTheDocument();
    expect(api.post).not.toHaveBeenCalled();
  });

  it('mendaftar berhasil dan mengirim data ke /auth/register', async () => {
    api.post.mockResolvedValue({ data: session, meta: null });
    renderAt('/auth/register');
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Nama lengkap'), 'Alice Samosir');
    await user.type(screen.getByLabelText('Username'), 'alice01');
    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.type(screen.getByLabelText('Kata sandi'), 'rahasia123');
    await user.type(screen.getByLabelText('Ulangi kata sandi'), 'rahasia123');
    await user.click(screen.getByRole('button', { name: 'Daftar' }));
    expect(api.post).toHaveBeenCalledWith('/auth/register', {
      name: 'Alice Samosir',
      username: 'alice01',
      email: 'alice@example.com',
      password: 'rahasia123',
    });
    expect(await screen.findByRole('heading', { name: 'Beranda' })).toBeInTheDocument();
  });

  it('username yang sudah dipakai ditampilkan pada field username', async () => {
    api.post.mockRejectedValue(new ApiError('Data sudah terdaftar', {
      status: 409,
      code: 'CONFLICT',
      details: { username: 'Username sudah dipakai' },
    }));
    renderAt('/auth/register');
    const user = userEvent.setup();
    await user.type(screen.getByLabelText('Nama lengkap'), 'Alice Samosir');
    await user.type(screen.getByLabelText('Username'), 'alice01');
    await user.type(screen.getByLabelText('Email'), 'alice@example.com');
    await user.type(screen.getByLabelText('Kata sandi'), 'rahasia123');
    await user.type(screen.getByLabelText('Ulangi kata sandi'), 'rahasia123');
    await user.click(screen.getByRole('button', { name: 'Daftar' }));
    expect(await screen.findByText('Username sudah dipakai')).toBeInTheDocument();
  });

  it('menyediakan tautan ke halaman masuk', () => {
    renderAt('/auth/register');
    expect(screen.getByRole('link', { name: 'Masuk' })).toHaveAttribute('href', '/auth/login');
  });
});
