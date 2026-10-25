import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { api, ApiError, getToken, setToken } from '../src/lib/api';

const jsonResponse = (status, body) => ({
  ok: status >= 200 && status < 300,
  status,
  json: async () => body,
});

describe('klien API', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('mengembalikan data dan meta dari respons sukses, serta membuang parameter kosong', async () => {
    fetch.mockResolvedValue(jsonResponse(200, { success: true, data: { id: 1 }, meta: { total: 1 } }));
    const res = await api.get('/trips', { q: 'bali', page: undefined });
    expect(res).toEqual({ data: { id: 1 }, meta: { total: 1 } });
    expect(fetch.mock.calls[0][0]).toBe('/api/trips?q=bali');
  });

  it('melempar ApiError dengan kode dan detail dari server', async () => {
    fetch.mockResolvedValue(jsonResponse(400, {
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Data tidak valid', details: { title: 'Judul minimal 3 karakter' } },
    }));
    const err = await api.post('/trips', {}).catch((e) => e);
    expect(err).toBeInstanceOf(ApiError);
    expect(err.status).toBe(400);
    expect(err.code).toBe('VALIDATION_ERROR');
    expect(err.details.title).toMatch(/Judul/);
  });

  it('mengirim token Bearer bila token tersimpan', async () => {
    setToken('abc123');
    expect(getToken()).toBe('abc123');
    fetch.mockResolvedValue(jsonResponse(200, { success: true, data: null }));
    await api.get('/auth/me');
    expect(fetch.mock.calls[0][1].headers.Authorization).toBe('Bearer abc123');
  });

  it('POST mengirim body JSON dengan metode yang benar', async () => {
    fetch.mockResolvedValue(jsonResponse(201, { success: true, data: {} }));
    await api.post('/trips', { title: 'Samosir' });
    expect(fetch.mock.calls[0][1].method).toBe('POST');
    expect(fetch.mock.calls[0][1].body).toBe(JSON.stringify({ title: 'Samosir' }));
  });

  it('kegagalan jaringan menjadi ApiError ber-kode NETWORK', async () => {
    fetch.mockRejectedValue(new TypeError('Failed to fetch'));
    const err = await api.get('/health').catch((e) => e);
    expect(err.isNetwork).toBe(true);
  });

  it('401 dari endpoint terproteksi menghapus token tersimpan', async () => {
    setToken('kedaluwarsa');
    fetch.mockResolvedValue(jsonResponse(401, {
      success: false,
      error: { code: 'UNAUTHORIZED', message: 'Sesi tidak valid' },
    }));
    await api.get('/trips').catch(() => {});
    expect(getToken()).toBeNull();
  });
});
